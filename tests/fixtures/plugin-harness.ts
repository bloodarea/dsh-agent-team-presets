/**
 * Shared doubles for the host services this plugin's member path depends on.
 *
 * Two things changed for every Host-side spec: the plugin mounts only where the
 * deployment composes `subagents` (it is in the plugin's `inject` list, exactly
 * as a deployment that composes Teams provides it), and one Session's Team is
 * now applied through a queued job rather than synchronously. This module keeps
 * both facts in one place instead of repeating them in each fixture.
 */

import { vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { SubagentActivation, SubagentActivationSpec } from '@deepseek-ai/dsh-subagent'
import { SubagentError } from '@deepseek-ai/dsh-subagent'
import { SessionId } from '@deepseek-ai/dsh-session'
import { MessageId } from '@deepseek-ai/dsh-llm'

/**
 * Let the plugin's queued work settle before an assertion.
 *
 * Every queued step — the member execution aliases, the settings migration, and
 * one Session's Team application — resolves on microtasks, and the application
 * job awaits the effective prompt assembly before it installs anything. A
 * handful of macrotask turns therefore drains them deterministically without
 * polling an assertion.
 * @returns resolution once every queued step has had its turn.
 */
export async function settlePlugin(): Promise<void> {
  // A queued step may itself await a promise that needs more than one macrotask
  // turn (the application awaits prompt assembly, which awaits tool schemas), and
  // a bare three-turn drain produced intermittent failures in
  // boundary-regressions. The drain therefore covers both queue positions
  // several times and ends with a short real delay, so the barrier is about
  // quiescence rather than about a lucky scheduling order.
  for (let round = 0; round < 8; round += 1) {
    await new Promise<void>((resolve) => { setImmediate(resolve) })
    await new Promise<void>((resolve) => { setTimeout(resolve, 0) })
  }
  await new Promise<void>((resolve) => { setTimeout(resolve, 5) })
}

/**
 * Wait until one Session root's Team application has installed its captain
 * surface.
 *
 * Host 0.2.1 queues the application and awaits the effective prompt assembly
 * before installing anything, so a fixed number of macrotasks is not a
 * deterministic barrier. The member tool is registered by that installation, so
 * its presence is the observable settlement point.
 * @param ctx - the composed test context.
 * @param agent - the Session-root Agent whose application is awaited.
 * @param timeoutMs - upper bound before the helper fails the case.
 * @returns resolution once the application installed the captain surface.
 * @throws when the application did not settle in time.
 */
export async function waitForTeamApplication(
  ctx: Pick<Context, 'tools'>,
  agent: Agent,
  timeoutMs = 5000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (ctx.tools.get('spawn_team_member', agent) !== undefined) {
      // The registration happens inside the application; a strict custom
      // policy is only released after the effective surface is read once more,
      // so let that short tail settle before the caller drives the tool.
      await settlePlugin()
      return
    }
    await new Promise<void>((resolve) => { setTimeout(resolve, 5) })
  }
  throw new Error('the Team application did not settle before the deadline')
}

/** Drain real fixture children and their parent notices before unmounting the runtime. */
export async function disposeRealTeamContext(ctx: Context): Promise<void> {
  const roots = ctx.agents.list().filter(agent => agent.session.header.origin !== 'subagent')
  await ctx.subagents.drainDescendants(roots)
  for (const root of roots) await root.whenIdle()
  await ctx.fiber.dispose()
}

/** Knobs for {@link subagentServiceDouble}. */
export interface SubagentDoubleOptions {
  /** Provider names this deployment registers. Defaults to the plugin's own defaults. */
  readonly providers?: readonly string[]
  /** Absolute delegation depth cap the deployment resolves. Defaults to 2. */
  readonly maxDepth?: number | undefined
  readonly rootOf?: (agent: Agent) => Agent
  readonly namesOf?: (agent: Agent) => { self: string; parent?: string }
  readonly startActivation?: (spec: SubagentActivationSpec) => Promise<SubagentActivation>
  readonly members?: (root: Agent) => readonly DoubleMember[]
}

/** Test-owned catalog/live rows; these never replace the real-service integration stack. */
export interface DoubleMember {
  readonly id: string
  readonly name: string
  readonly role?: string
  readonly status: string
}

/**
 * Minimal stand-in for the official `subagents` service.
 *
 * Supplies provider discovery, tree identity and start admission independently
 * of execution. Tests can inspect an accepted activation through the callback;
 * real member execution mounts the official `Subagents` and providers instead.
 * @param options - provider names and the resolved depth cap.
 * @returns a service object suitable for `ctx.provide('subagents', …)`.
 */
export function subagentServiceDouble(options: SubagentDoubleOptions = {}): Record<string, unknown> {
  const providers = options.providers ?? ['spawn', 'fork']
  const provider = (name: string): Record<string, unknown> => ({
    name,
    capabilities: { agentOptions: true, agentPreset: true, outputSchema: false, depthLimit: true },
    inheritsParentContext: name !== 'spawn',
    // Presence of this method IS the continuable capability.
    prepareContinuable: async () => ({}),
    start: async () => { throw new Error('the subagent double does not run children') },
  })
  return {
    registerProvider: () => () => {},
    getProvider: (name: string) => providers.includes(name) ? provider(name) : undefined,
    list: () => [...providers],
    resolveMaxDepth: () => options.maxDepth ?? 2,
    rootOf: options.rootOf ?? ((agent: Agent) => {
      if (agent.session.header.origin === 'subagent') throw new SubagentError('fixture child is unpublished', 'UNAUTHORIZED')
      return agent
    }),
    namesOf: options.namesOf ?? (() => ({ self: 'lead' })),
    startActivation: options.startActivation ?? (async () => { throw new Error('the subagent double does not run children') }),
    interrupt: () => {},
    drainDescendants: async () => {},
  }
}

/** A minimal accepted activation for specs that inspect start admission, never child execution. */
export function acceptedActivation(spec: SubagentActivationSpec): SubagentActivation {
  if (spec.childId === undefined) throw new Error('fixture requires a reserved child identity')
  return {
    childId: spec.childId, name: spec.name ?? 'member', messageId: MessageId('fixture-message'),
    result: Promise.resolve({ output: [], stopReason: 'completed' }),
    dispose: async () => {},
  }
}

/** Mount rc.2 discovery doubles and project test-owned rows onto the real projection seam. */
export function mountSubagentDouble(ctx: Context, options: SubagentDoubleOptions = {}): void {
  const list = ctx.agents.list.bind(ctx.agents)
  const snapshot = ctx.sessionProjections.snapshot.bind(ctx.sessionProjections)
  const synthetic = new Map<string, { agent: Agent; root: Agent; name: string }>()
  const refresh = (): Agent[] => {
    const live = list()
    synthetic.clear()
    for (const root of live.filter(agent => agent.session.header.origin !== 'subagent')) {
      for (const row of options.members?.(root) ?? []) {
        if (row.role === 'lead' || (row.status !== 'running' && row.status !== 'provisioning')) continue
        if (live.some(agent => agent.id === row.id)) continue
        const id = SessionId(row.id)
        const session = new Proxy(root.session, { get(target, key) {
          if (key === 'id') return id
          if (key === 'header') return { ...target.header, id, origin: 'subagent' }
          if (key === 'ownEvents' || key === 'snapshotEvents') return () => []
          return Reflect.get(target, key, target)
        } })
        const agent = new Proxy(root, { get(target, key) {
          if (key === 'id') return id
          if (key === 'status') return 'running'
          if (key === 'session') return session
          return Reflect.get(target, key, target)
        } })
        synthetic.set(row.id, { agent, root, name: row.name })
      }
    }
    return [...live, ...[...synthetic.values()].map(entry => entry.agent)]
  }
  vi.spyOn(ctx.agents, 'list').mockImplementation(refresh)
  vi.spyOn(ctx.sessionProjections, 'snapshot').mockImplementation((...args) => {
    const result = snapshot(...args)
    const root = list().find(agent => agent.session === args[0])
    if (root === undefined || options.members === undefined) return result
    const catalog = options.members(root).filter(row => row.role !== 'lead').map(row => ({
      id: SessionId(row.id), name: row.name, mode: 'continuable', provider: 'spawn', createdAt: 0,
    }))
    return { ...result, values: { ...result.values, subagentCatalog: catalog } } as typeof result
  })
  const fallback = subagentServiceDouble(options)
  ctx.provide('subagents', {
    ...fallback,
    rootOf: (agent: Agent) => synthetic.get(agent.id)?.root ?? options.rootOf?.(agent)
      ?? (fallback.rootOf as (agent: Agent) => Agent)(agent),
    namesOf: (agent: Agent) => {
      const entry = synthetic.get(agent.id)
      return entry === undefined ? options.namesOf?.(agent) ?? { self: 'lead' } : { self: entry.name, parent: 'lead' }
    },
  })
}
