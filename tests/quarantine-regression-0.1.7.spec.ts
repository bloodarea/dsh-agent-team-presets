/**
 * 0.1.7 regression re-verification of the four quarantine security classes,
 * probed through the lifecycle paths that could overturn them.
 *
 * This spec is deliberately adversarial rather than a copy of
 * `quarantine-lifecycle.spec.ts` (the T1/T2 acceptance matrix). Every case here
 * starts from one of the shapes the fix does NOT enumerate and asks whether the
 * guard still decides correctly:
 *
 * - S1 evidence-based classification: a Session that provably ran without a Team
 *   must not be frozen by a mid-task selection, and a Session that provably ran
 *   under one must not be released. The proof is activation-scoped, so this spec
 *   probes what happens when the activation that held it is gone.
 * - S2 an authorized recovery channel: a quarantined captain keeps exactly the
 *   ten recovery tools, and a child keeps none. This spec probes whether those
 *   ten are *reachable by the model* in each tool presentation, and whether child
 *   creation is vetoed rather than retrofitted.
 * - S3 no mid-task privilege widening: a running Team task must keep the policy
 *   it started with across a Team switch, a cancellation, and a reload. The
 *   load-bearing evidence is `hasTeamApplicationMarker`, so this spec probes the
 *   states in which that marker is legitimately absent.
 * - S4 fail closed on missing evidence: an unknown state is isolated with a
 *   recovery channel, and no code path reaches the deployment default without a
 *   guard while a task is in flight.
 *
 * Paths covered: HMR/remount, PTC presentation fold, session resume, fork/child
 * lineage, Team A/B switch, cancel Team, permission-state loss.
 *
 * Five cases do not assert a fixed behaviour: three pin a KNOWN RESIDUAL WINDOW
 * and two pin a measured DEFECT (D1). They say so in capitals, name the exact
 * trigger, and are meant to be inverted when the behaviour is closed; they exist
 * so the residual risk stays measurable instead of anecdotal, exactly as the
 * residual-window case in `quarantine-lifecycle.spec.ts` does.
 *
 * Assertion discipline: a refusal is only counted when `isError === true` AND the
 * text names the specific guard, and an allowed call is only counted when the
 * spy body actually ran (`spyBodies`), so a deployment that merely lacks a tool
 * cannot make a case pass.
 *
 * Synchronisation discipline: the Host queues a Team application and awaits the
 * effective prompt assembly before it installs anything, so the number of
 * macrotask turns needed to settle is not fixed. No case here asserts a landed
 * transition after a sleep: {@link waitUntil} polls the observable end state with
 * a deadline, and {@link startTask} first observes the running phase, because a
 * reload that means "mid-task" must not silently test the idle path. A fixed
 * drain is used only for the negative half of a case ("nothing else happened").
 *
 * Evidence pointers: quarantine() index.ts:141-153, busy branch index.ts:700-742,
 * `team === undefined` boundary index.ts:746-770, refuseTeam() index.ts:439-449,
 * restorePrevious() index.ts:463-504, hasTeamApplicationMarker() execution.ts:78-87,
 * CAPTAIN_RECOVERY_TOOLS tool-policy.ts:35-46, child veto index.ts:259-298.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { TeamId } from '@deepseek-ai/dsh-experimental-agent-team'
import type { SpawnTeammateRequest, TeamMemberView } from '@deepseek-ai/dsh-experimental-agent-team'
import { LlmAdapter, ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, LlmResolvedModelInfo, StreamChunk } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt'
import { apply, inject } from '../src/index.ts'
import type { Config } from '../src/config.ts'
import type { TeamPreset, TeamSelectionRecord } from '../src/types.ts'
import { BUILTIN_TEAM_IDS } from '../src/builtin-teams.ts'
import { CAPTAIN_RECOVERY_TOOLS } from '../src/tool-policy.ts'
import { mountMemberStorage } from './fixtures/member-storage.ts'
import type { MemberStorage } from './fixtures/member-storage.ts'
import { settlePlugin, subagentServiceDouble } from './fixtures/plugin-harness.ts'
import { slot, team } from './fixtures/team-presets.ts'
import { executeTool } from './fixtures/execute-tool.ts'

const contexts: Context[] = []
const temporary: string[] = []
const harnesses: Harness[] = []

afterEach(async () => {
  for (const harness of harnesses.splice(0)) harness.adapter.open()
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
  for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true })
})

/** Capability every definition below allows its captain to call. */
const ALLOWED_TOOL = 'probe_allowed'

/** Capability one definition allows and its sibling excludes, so a switch is observable. */
const B_ONLY_TOOL = 'probe_b_only'

/** Capability no definition below names, so a Team policy must hide it. */
const DENIED_TOOL = 'probe_denied'

/** Refusal text of a quarantine raised on a Session whose selection cannot be restored. */
const UNRESTORABLE = 'cannot be safely restored into an already-running task'

/** Refusal text of the strict per-Team guard (not a quarantine). */
const POLICY_DENIES = 'tool policy denies'

/** Refusal text of the boundary that refuses a selection pointing at no stored Team. */
const DANGLING = 'no longer exists. This is not "No team"'

/** Refusal text of a child vetoed because its parent is quarantined. */
const PARENT_FROZEN = 'Parent Team policy is quarantined'

/** Tools that create Agents or run general-purpose code: never exempted. */
const ESCALATION_TOOLS = ['spawn_team_member', 'spawn_teammate', 'subagent', 'subagent_fork', 'workflow', 'run_code'] as const

/** Exact-Agent spy tools, so "the guard let it through" is proven by the body running. */
const SPY_TOOLS = [
  'send_message', 'list_agents', 'wait_agent', 'interrupt_agent',
  'team_task_create', 'team_task_get', 'team_task_list', 'team_task_update',
  'spawn_teammate', 'subagent', 'subagent_fork', 'workflow',
] as const

/**
 * One Team definition whose every observable face carries its marker.
 * @param marker - letter distinguishing this definition from its siblings.
 * @param member - teammate this definition declares.
 * @param mode - the captain's tool mode; `all` needs no allow-list.
 * @param extra - extra inherited capabilities this captain may call.
 * @returns the Team preset.
 */
function definition(marker: string, member: string, mode: 'custom' | 'all' = 'custom', extra: readonly string[] = []): TeamPreset {
  return {
    ...team([slot({ name: member, description: `${marker} member` })], {
      name: `captain-${marker}`,
      systemPrompt: `Captain prompt ${marker}`,
      toolMode: mode,
      tools: mode === 'custom' ? [ALLOWED_TOOL, 'spawn_team_member', 'get_team_preset', 'update_team_preset', ...extra] : [],
    }),
    name: `Team ${marker}`,
  }
}

/**
 * A model route that blocks until the test releases it, so an Agent stays in its
 * running phase for as long as a case needs to observe the freeze.
 */
class GatedAdapter extends LlmAdapter {
  private gates: (() => void)[] = []
  private opened = false

  override resolveModel(provider: string, model: string): Promise<LlmResolvedModelInfo> {
    return Promise.resolve({ provider, id: model, name: model })
  }

  async * stream(_options: GenerateOptions): AsyncIterable<StreamChunk> {
    if (!this.opened) await new Promise<void>((resolve) => { this.gates.push(resolve) })
    yield { type: 'block-start', index: 0, blockType: 'text' }
    yield { type: 'text-delta', index: 0, text: 'done' }
    yield { type: 'block-end', index: 0, block: { type: 'text', text: 'done' } }
    yield { type: 'finish', reason: { kind: 'stop' } }
  }

  /** Let every blocked model call finish, and every later one proceed. */
  open(): void {
    this.opened = true
    const gates = this.gates
    this.gates = []
    for (const gate of gates) gate()
  }

  /** Block later starts again, so a second task can be observed as running. */
  close(): void { this.opened = false }
}

/** Writable stand-in for one volatile Config reference. */
function volatileRef<T>(initial: T): { ref: { get: () => T }; set: (next: T) => void } {
  let current = initial
  return { ref: { get: () => current }, set: (next) => { current = next } }
}

/** One scripted roster row for a teammate of a Session. */
function teammate(status: TeamMemberView['status'], name = 'member-1'): TeamMemberView {
  return { id: SessionId(name), name, role: 'teammate', status, diagnostics: [] }
}

/** One `spawn_team_member` call the fake Team service recorded. */
type SpawnCall = (caller: Agent, request: SpawnTeammateRequest) => Promise<{ member: { name: string; status: 'active' } }>

interface Harness {
  readonly ctx: Context
  readonly config: Config
  readonly adapter: GatedAdapter
  /** The durable member snapshot unit this Team's members are frozen into. */
  readonly storage: MemberStorage
  readonly spawnTeammate: ReturnType<typeof vi.fn<SpawnCall>>
  /** Names of the exact-Agent spy tool bodies that actually ran. */
  readonly spyBodies: string[]
  /** Create one live Session-root Agent, with its exact-Agent spy tools. */
  readonly create: (id: string) => Promise<Agent>
  /** Publish a stored Teams value and announce the volatile update. */
  readonly teams: (next: readonly TeamPreset[]) => void
  /** Publish the Session selections and announce the volatile update. */
  readonly selections: (next: readonly TeamSelectionRecord[]) => void
  /** Replace the roster rows one Session's fake Team service reports. */
  readonly teammates: (sessionId: string, rows: readonly TeamMemberView[]) => void
  /** Append one durable `team/member` settlement to a Session's journal feed. */
  readonly rosterEvent: (agent: Agent) => void
  /** Append the durable `request/header` row a Host writes for one assembled request. */
  readonly headerRow: (agent: Agent, tools: readonly string[]) => void
  /** Wake one Agent into a turn that stays running until {@link release}. */
  readonly wake: (agent: Agent) => void
  /** Let every blocked turn finish and wait for the Agents to settle idle. */
  readonly release: () => Promise<void>
  /** Dispose the plugin and mount it again, exactly as HMR or the Loader does. */
  readonly remount: () => Promise<{ dispose(): Promise<void> }>
  /** Tool names in the latest request header this Session actually logged. */
  readonly headerTools: (agent: Agent) => string[]
}

/** Mount the plugin over a scripted Team service, settings document, and model route. */
async function setup(options: {
  teams: readonly TeamPreset[]
  selections: readonly TeamSelectionRecord[]
  /** Run the deployment's tool registry in the PTC presentation, as a code preset does. */
  ptc?: boolean
}): Promise<Harness> {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx, options.ptc === true ? { tools: { mode: 'ptc' } } : {})
  await ctx.plugin(AgentLoop, { agents: [] })
  if (options.ptc === true) {
    // A non-native surface needs a PTC runtime: without one assembly throws.
    ctx.provide('ptcRuntime', { language: 'typescript', programFormat: 'function-body' })
  }

  const adapter = new GatedAdapter()
  ctx.llm.registerAdapter(['fixture'], adapter)
  ctx.llm.registerAdapter(['deepseek'], adapter)

  // The capability probes are global, so a Team allow-list can include and
  // exclude them by name.
  for (const name of [ALLOWED_TOOL, B_ONLY_TOOL, DENIED_TOOL]) {
    ctx.tools.register({
      name,
      description: `${name} probe`,
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [{ type: 'text', text: name }] },
      async execute() { return name },
    })
  }

  const roots = new Set<Agent>()
  // A resumed Session is known to the Team service by identity before its Agent
  // exists, so a cold-start case can script a roster the mount already sees.
  const knownRoots = new Set<string>()
  const rows = new Map<string, readonly TeamMemberView[]>()
  const spyBodies: string[] = []
  const spawnTeammate = vi.fn<SpawnCall>(async (_caller, request) => ({
    member: { name: request.name, status: 'active' },
  }))
  ctx.provide('agentTeams', {
    spawnTeammate,
    tryMembership: (agent: Agent) => roots.has(agent) || knownRoots.has(agent.session.id)
      ? { root: agent, id: TeamId(agent.id), role: 'lead' as const, name: 'lead' }
      : undefined,
    listMembers: (agent: Agent): TeamMemberView[] => [
      {
        id: agent.id,
        name: 'lead',
        role: 'lead',
        status: agent.status === 'running' ? 'running' : 'inactive',
        diagnostics: [],
      },
      ...rows.get(agent.session.id) ?? [],
    ],
  })

  const storeRoot = await mkdtemp(join(tmpdir(), 'team-presets-regression-store-'))
  temporary.push(storeRoot)
  const storage = await mountMemberStorage(ctx, storeRoot)

  const teamsRef = volatileRef<readonly TeamPreset[]>(options.teams)
  const selectionsRef = volatileRef<readonly TeamSelectionRecord[]>(options.selections)
  ctx.provide('settings', {
    configure: vi.fn(() => () => {}),
    describe: vi.fn(() => [{ ns: 'agent-team-presets', revision: 0 }]),
    update: vi.fn(async () => {}),
  })
  ctx.provide('subagents', subagentServiceDouble())

  const config = {
    teams: teamsRef.ref,
    selections: selectionsRef.ref,
    freshProvider: 'spawn',
    seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] },
    forkProvider: 'fork',
  } satisfies Config
  let fiber = await ctx.plugin(Object.assign((inner: Context) => { apply(inner, config) }, { inject }))

  const handles = new Map<Agent, { dispose(): Promise<void> }>()
  const agents: Agent[] = []
  const harness: Harness = {
    ctx,
    config,
    adapter,
    storage,
    spawnTeammate,
    spyBodies,
    create: async (id) => {
      knownRoots.add(id)
      const handle = await ctx.agents.create({
        sessionId: SessionId(id),
        agentOptions: { provider: 'fixture', model: 'fixture' },
      })
      roots.add(handle.agent)
      agents.push(handle.agent)
      handles.set(handle.agent, handle)
      // Exact-Agent spies: a name only this Agent can see proves the guard
      // decided the call, not that the deployment happened to lack the tool.
      for (const name of SPY_TOOLS) {
        handle.agent.ctx.tools.register({
          name,
          description: `${name} spy`,
          parameters: {},
          output: { schema: { type: 'string' }, render: () => [{ type: 'text', text: name }] },
          async execute() { spyBodies.push(name); return name },
        })
      }
      return handle.agent
    },
    teams: (next) => {
      teamsRef.set(next)
      ctx.emit('loader/volatile-update', [['teams']])
    },
    selections: (next) => {
      selectionsRef.set(next)
      ctx.emit('loader/volatile-update', [['selections']])
    },
    teammates: (sessionId, next) => { rows.set(sessionId, next) },
    rosterEvent: (agent) => {
      // Append the durable settlement the Agent Teams service writes, so the
      // freeze listener sees a committed event with a real sequence number.
      const append = agent.session.append.bind(agent.session) as unknown as (type: string, data: unknown) => void
      append('team/member', {
        version: 2,
        teamId: TeamId(agent.id),
        member: { id: 'member-1', name: 'member-1', phase: 'failed' },
      })
    },
    headerRow: (agent, tools) => {
      // The row a previous Host process wrote when it assembled a request, read
      // back by `hasTeamApplicationMarker` through the Session's own log.
      const append = agent.session.append.bind(agent.session) as unknown as (type: string, data: unknown) => void
      append('request/header', {
        header: { config: { provider: 'fixture', model: 'fixture' }, tools: tools.map(name => ({ name })) },
        reason: 'resume',
      })
    },
    wake: (agent) => {
      agent.followup(createUserMessage({ content: [{ type: 'text', text: 'work' }], source: { kind: 'user' } }))
    },
    release: async () => {
      adapter.open()
      for (const agent of agents) await agent.whenIdle()
    },
    remount: async () => {
      await fiber.dispose()
      fiber = await ctx.plugin(Object.assign((inner: Context) => { apply(inner, config) }, { inject }))
      return fiber
    },
    headerTools: (agent) => {
      const events = agent.session.ownEvents()
      for (let index = events.length - 1; index >= 0; index -= 1) {
        const event = events[index]
        if (event?.type !== 'request/header') continue
        const header = event.data.header as { tools?: readonly { name?: string }[] }
        return (header.tools ?? []).flatMap(tool => tool.name === undefined ? [] : [tool.name])
      }
      return []
    },
  }
  harnesses.push(harness)
  return harness
}

/**
 * Poll one observation until it holds.
 *
 * The Host queues a Team application and awaits the effective prompt assembly
 * before it installs anything, so a fixed drain of macrotask turns is a race
 * against a real asynchronous tail rather than a settlement barrier — which is
 * why the shared harness ships `waitForTeamApplication`. Every assertion here
 * that depends on a queued step HAVING LANDED therefore polls the observable end
 * state with a deadline, and reports what it last saw when that deadline expires
 * instead of asserting on whatever the scheduler happened to have finished.
 * @param what - the transition being awaited, for the failure message.
 * @param observed - one observation of the end state.
 * @param timeoutMs - upper bound before the case fails. It stays under the
 *   runner's per-test timeout so a missed expectation reports the transition it
 *   waited for instead of a bare test timeout; a settled application takes
 *   ~100ms, so this is a wide margin rather than a duration budget.
 * @returns resolution once the observation holds.
 * @throws when the deadline expires.
 */
async function waitUntil(what: string, observed: () => boolean | Promise<boolean>, timeoutMs = 4_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await observed()) return
    await new Promise<void>((resolve) => { setTimeout(resolve, 5) })
  }
  throw new Error(`the case timed out waiting for ${what}`)
}

/**
 * Wake one Agent and wait until its running phase is observable.
 *
 * Every reload case below decides from `agent.status`, so a case that means
 * "reload mid-task" has to observe the running phase first: waking and
 * reloading in the same tick would silently test the idle path instead.
 * @param h - the mounted harness.
 * @param agent - the Session root to wake.
 * @returns resolution once the Agent reports `running`.
 */
async function startTask(h: Harness, agent: Agent): Promise<void> {
  h.wake(agent)
  await waitUntil('the Agent to enter its running phase', () => agent.status === 'running')
}

/**
 * Wait until one Session observably has `persona` applied.
 * @param h - the mounted harness.
 * @param agent - the Session root whose applied definition is awaited.
 * @param persona - the expected captain persona; the empty string means No team.
 * @returns resolution once the applied persona matches.
 */
async function waitForPersona(h: Harness, agent: Agent, persona: string): Promise<void> {
  await waitUntil(`persona ${JSON.stringify(persona)} to be applied`, async () => (await applied(h.ctx, agent)).persona === persona)
}

/**
 * Wait until one tool call is no longer refused.
 * @param h - the mounted harness.
 * @param agent - the Agent the call runs as.
 * @param name - the tool name.
 * @param args - its arguments.
 * @returns resolution once the call succeeds.
 */
async function waitForAllowed(h: Harness, agent: Agent, name: string, args: object = {}): Promise<void> {
  await waitUntil(`${name} to be allowed`, async () => (await call(h, agent, name, args)).isError === false)
}

/**
 * Wait until one tool call is refused with one guard's text.
 * @param h - the mounted harness.
 * @param agent - the Agent the call runs as.
 * @param name - the tool name.
 * @param text - the refusal text this guard contributes.
 * @param args - the call's arguments.
 * @returns resolution once the refusal matches.
 */
async function waitForRefusal(h: Harness, agent: Agent, name: string, text: string, args: object = {}): Promise<void> {
  await waitUntil(`${name} to be refused with ${JSON.stringify(text)}`, async () => (await call(h, agent, name, args)).text.includes(text))
}

/** Every observable face of the Team one Session currently has applied. */
async function applied(ctx: Context, agent: Agent) {
  const assembly = await ctx.systemPrompt.assemble(assembleContextFor(agent))
  const memberTool = ctx.tools.get('spawn_team_member', agent)
  return {
    persona: assembly.sections.find(section => section.name === PERSONA_PREFIX_SECTION)?.text,
    description: memberTool?.description,
    tools: ctx.tools.schemas(agent).map(schema => schema.name),
  }
}

/** The tool names the model would actually receive for one Agent. */
async function wireTools(ctx: Context, agent: Agent): Promise<string[]> {
  const assembly = await ctx.systemPrompt.assemble(assembleContextFor(agent))
  return assembly.tools.map(tool => tool.name)
}

/** Execute one tool as one Agent and report whether it was refused, and why. */
async function call(h: Harness, agent: Agent, name: string, args: object = {}) {
  const result = await executeTool(h.ctx, {
    callId: ToolCallId(`${name}-${Math.random()}`),
    name,
    arguments: args,
    agent,
    signal: new AbortController().signal,
  })
  return {
    isError: result.isError === true,
    text: result.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join(''),
  }
}

/** One Team selected by one Session, the shape most cases below start from. */
const SELECTED: readonly TeamSelectionRecord[] = [{ sessionId: 's1', teamId: 'team-1' }]

/**
 * Let one full turn run to completion under an open route, so the Host logs the
 * request header for it.
 * @param h - the mounted harness.
 * @param agent - the Agent whose turn is completed.
 * @returns resolution once that turn ended and the header row exists.
 */
async function completeOneTurn(h: Harness, agent: Agent): Promise<void> {
  h.adapter.open()
  h.wake(agent)
  await agent.whenIdle()
  await settlePlugin()
  h.adapter.close()
}

describe('HMR/remount repeats itself without changing the classification', () => {
  it('keeps one identical refusal, and one recovery channel, across two reloads of the same running task', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    // One completed turn, so this Session's own request log proves it ran under a
    // Team even after the selection is cleared.
    await completeOneTurn(h, captain)
    expect(h.headerTools(captain)).toContain('spawn_team_member')

    await startTask(h, captain)
    h.selections([])
    await settlePlugin()
    await h.remount()
    await settlePlugin()
    await waitForRefusal(h, captain, ALLOWED_TOOL, 'tools are paused until its task boundary')
    const first = await call(h, captain, ALLOWED_TOOL)

    await h.remount()
    await waitForRefusal(h, captain, ALLOWED_TOOL, 'tools are paused until its task boundary')
    const second = await call(h, captain, ALLOWED_TOOL)
    expect(second.isError).toBe(true)
    // The second reload re-derives the same single diagnosis instead of stacking
    // a second, differently worded guard on the same Agent.
    expect(second.text).toBe(first.text)
    expect((await call(h, captain, DENIED_TOOL)).text).toBe(first.text)
    // Exactly one exemption set survives: the captain can still read presets and
    // coordinate, which its own refusal text recommends.
    const preset = await call(h, captain, 'get_team_preset')
    expect(preset.isError).toBe(false)
    // The body really ran and reported the real state (no Team selected) plus the
    // configured Teams, which is the actionable half of the refusal text.
    expect(preset.text).toContain('"status":"no-selection"')
    expect(preset.text).toContain('Configured Teams: team-1')
    expect((await call(h, captain, 'send_message')).isError).toBe(false)
    expect(h.spyBodies).toContain('send_message')
    expect((await call(h, captain, 'spawn_team_member', { member: 'alpha', task: 'go' })).isError).toBe(true)

    await h.release()
    // The boundary returns the Session to No team, because the selection is gone.
    await waitForAllowed(h, captain, ALLOWED_TOOL)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('')
  })

  it('freezes a running task whose selection became dangling, and only then reports it as dangling', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    await startTask(h, captain)
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)

    // The stored Team disappears while the task runs. Nothing is replaced mid-task.
    h.teams([])
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)

    // A reload cannot reconstruct that frozen application, and the selection now
    // points at nothing: the Session is isolated rather than widened.
    await h.remount()
    await settlePlugin()
    await waitForRefusal(h, captain, ALLOWED_TOOL, UNRESTORABLE)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)

    // At the boundary the same selection is reported as dangling, which is the
    // actionable fact, and the Session stays denied.
    await h.release()
    await waitForRefusal(h, captain, ALLOWED_TOOL, DANGLING)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
  })
})

describe('the PTC presentation fold (removed in 0.2.2-rc.1)', () => {
  it('refuses a custom policy on a PTC surface and quarantines the captain instead of folding it', async () => {
    // 0.2.2-rc.1 removed the native-presentation fold: a custom allow-list can no
    // longer shadow a PTC deployment's executor, so this Team is refused from the
    // start instead of being applied over a temporary native surface.
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED, ptc: true })
    const captain = await h.create('s1')
    await settlePlugin()

    // The deployment's PTC transport is untouched: one name, and it is the
    // general-purpose capability the custom Team would have denied.
    const wire = await wireTools(h.ctx, captain)
    expect(wire).toEqual(['run_code'])
    // Executing it is still refused by the quarantine the refusal installed, and
    // the refusal names the actionable cause.
    const direct = await call(h, captain, 'run_code', { code: 'return 1', description: 'probe' })
    expect(direct.isError).toBe(true)
    expect(direct.text).toContain('native Agent preset')

    // The exempted names are not on the wire, and PTC refuses a direct call to
    // them before any guard: the recovery channel the refusal recommends is not
    // reachable from the model at all. This is a denial, never a widening.
    for (const name of ['get_team_preset', 'send_message', 'list_agents', ALLOWED_TOOL] as const) {
      expect(wire, name).not.toContain(name)
      const unreachable = await call(h, captain, name)
      expect(unreachable.isError, name).toBe(true)
      expect(unreachable.text, name).toContain('only `run_code` is callable directly')
    }
    // The recovery tools are nevertheless registered on the Agent, and no Team
    // face was installed.
    expect(h.ctx.tools.get('get_team_preset', captain)).toBeDefined()
    expect((await applied(h.ctx, captain)).persona).not.toBe('Captain prompt A')
    expect((await applied(h.ctx, captain)).tools).not.toContain('spawn_team_member')

    await h.release()
  })

  it('never reads a PTC header that lists only run_code as proof of No team, and cannot widen with it', async () => {
    const h = await setup({ teams: [definition('A', 'alpha', 'all')], selections: SELECTED, ptc: true })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    await completeOneTurn(h, captain)
    // The Team really is applied, and the header really lacks the marker.
    expect(h.headerTools(captain)).toEqual(['run_code'])
    const before = await wireTools(h.ctx, captain)
    expect(before).toEqual(['run_code'])

    await startTask(h, captain)
    h.selections([])
    await settlePlugin()
    await h.remount()
    await settlePlugin()

    // KNOWN RESIDUAL WINDOW, reached here without any race: under PTC this
    // Session's log can never carry the marker, so "deselect mid-task + reload"
    // is classified as unknown and nothing is frozen.
    expect((await applied(h.ctx, captain)).persona).toBe('')
    expect(captain.status).toBe('running')
    // The only callable name is not refused by the quarantine: this running task
    // was released to the deployment surface instead of being isolated. (Its own
    // execution error is the harness having no working directory, not a verdict.)
    const afterRun = await call(h, captain, 'run_code', { code: 'return 1', description: 'probe' })
    expect(afterRun.text).not.toContain(UNRESTORABLE)
    // The counterexample fails as an escalation: the model-visible capability set
    // is identical before and after, because an all-mode Team applies no
    // restriction and the PTC fold already hid every other name. The only
    // differences are narrowing ones (the persona and the native member tool,
    // which is never on a PTC wire anyway).
    expect(await wireTools(h.ctx, captain)).toEqual(before)
    expect((await applied(h.ctx, captain)).tools).not.toContain('spawn_team_member')
    expect(h.spyBodies).not.toContain('spawn_teammate')
    expect(h.spawnTeammate).not.toHaveBeenCalled()

    await h.release()
  })
})

describe('a resumed Session', () => {
  it('stays frozen on its own durable Team evidence while a teammate still works', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: [] })
    const captain = await h.create('s1')
    await settlePlugin()
    // The durable row a previous process wrote: this Session assembled a request
    // under a Team. The selection is gone, as it is after a deselect.
    h.headerRow(captain, ['probe_allowed', 'spawn_team_member', 'get_team_preset'])
    expect(h.headerTools(captain)).toContain('spawn_team_member')
    h.teammates('s1', [teammate('running')])

    await h.remount()
    await waitForRefusal(h, captain, ALLOWED_TOOL, 'ran this task under a Team whose definition cannot be restored here')
    const frozen = await call(h, captain, ALLOWED_TOOL)
    expect(frozen.isError).toBe(true)
    expect(frozen.text).toContain('selection has since been cleared')
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
    expect(h.spyBodies).not.toContain('spawn_teammate')

    // When the roster settles, the Session returns to No team instead of staying
    // frozen forever.
    h.teammates('s1', [teammate('inactive')])
    h.rosterEvent(captain)
    await waitForAllowed(h, captain, ALLOWED_TOOL)
    expect((await applied(h.ctx, captain)).persona).toBe('')
  })

  it('resumes at a boundary on the deployment default rather than staying frozen', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: [] })
    const captain = await h.create('s1')
    await settlePlugin()
    h.headerRow(captain, ['probe_allowed', 'spawn_team_member', 'get_team_preset'])
    // No teammate is running: this Session is between tasks, so no frozen policy
    // is being lost and the default surface is the correct one.
    await h.remount()
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).tools).not.toContain('spawn_team_member')
    // The recovery names remain ordinary preset tools, not an exemption.
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
  })
})

describe('fork and child lineage under a quarantined captain', () => {
  it('refuses to create any child of the quarantined captain before its first request', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    await startTask(h, captain)
    await h.remount()
    await waitForRefusal(h, captain, ALLOWED_TOOL, UNRESTORABLE)
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)

    // A child created now would run under no provable policy at all, so the
    // creation transaction is vetoed instead of quarantining after the fact.
    await expect(h.ctx.agents.create({
      sessionId: SessionId('member-child'),
      parentAgent: captain,
      meta: { parentSession: captain.session.id, origin: 'subagent' },
      agentOptions: { provider: 'fixture', model: 'fixture' },
    })).rejects.toThrow(PARENT_FROZEN)
    expect(h.spawnTeammate).not.toHaveBeenCalled()
    await h.release()
  })

  it('leaves a forked Session root on its own policy instead of extending the quarantine', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    await startTask(h, captain)
    await h.remount()
    await waitForRefusal(h, captain, ALLOWED_TOOL, UNRESTORABLE)
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)

    // A fork is a new Session root with its own lineage, not a child of this
    // captain's lost policy: the quarantine names exactly one Agent.
    const fork = (await h.ctx.agents.create({
      sessionId: SessionId('fork-1'),
      meta: { parentSession: captain.session.id },
      agentOptions: { provider: 'fixture', model: 'fixture' },
    })).agent
    await settlePlugin()
    expect((await call(h, fork, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, fork, DENIED_TOOL)).isError).toBe(false)
    expect((await call(h, fork, 'get_team_preset')).isError).toBe(false)
    // ...and the captain is still exactly as frozen as before.
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)
    expect((await call(h, captain, ALLOWED_TOOL)).text).toContain(UNRESTORABLE)
    await h.release()
  })
})

describe('switching to another Team while the task runs', () => {
  it('never grants a capability of the newly selected Team before the task boundary', async () => {
    // A is strict; B is all-tools, so the switch is a genuine widening if it is
    // ever applied early.
    const widening = { ...definition('B', 'beta', 'all'), id: 'team-2' }
    const h = await setup({ teams: [definition('A', 'alpha'), widening], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    await startTask(h, captain)
    const excluded = await call(h, captain, DENIED_TOOL)
    expect(excluded.isError).toBe(true)
    expect(excluded.text).toContain(POLICY_DENIES)

    h.selections([{ sessionId: 's1', teamId: 'team-2' }])
    await settlePlugin()
    // Still A on every observable face, the member roster included.
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await applied(h.ctx, captain)).description).toContain('alpha')
    expect((await applied(h.ctx, captain)).tools).toContain('spawn_team_member')
    const still = await call(h, captain, DENIED_TOOL)
    expect(still.isError).toBe(true)
    expect(still.text).toContain(POLICY_DENIES)

    await h.release()
    // The boundary is the first moment B's policy may arrive, and then it does.
    await waitForPersona(h, captain, 'Captain prompt B')
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)
  })

  it('refuses a switch whose new allow-list names a tool the applied Team still hides', async () => {
    // DEFECT D1 (measured at HEAD; also present at c59cbd1^, so pre-existing and
    // not a regression of the quarantine fix) — reported to the captain, not
    // fixed here. Invert these assertions once it is closed.
    //
    // `capabilityRefusal` probes the Session's reach while the previous Team's
    // tool restriction is STILL installed, so a Team that allows anything the
    // previous one excluded is diagnosed as unreachable and never applied — not
    // even at an idle boundary, and with a diagnosis that names the wrong cause.
    const wider = { ...definition('B', 'beta', 'custom', [B_ONLY_TOOL]), id: 'team-2' }
    const h = await setup({ teams: [definition('A', 'alpha'), wider], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    // A is applied while this Session is idle: there is no task to freeze at all.
    expect((await call(h, captain, B_ONLY_TOOL)).text).toContain(POLICY_DENIES)

    const warn = vi.spyOn(h.ctx.logger, 'warn')
    h.selections([{ sessionId: 's1', teamId: 'team-2' }])
    await settlePlugin()
    // The switch is refused, with the diagnosis blaming the Session's reach...
    const logged = warn.mock.calls.map(parts => parts.map(String).join(' ')).join('\n')
    warn.mockRestore()
    expect(logged).toContain('names capabilities this Session cannot reach')
    expect(logged).toContain(B_ONLY_TOOL)
    // ...although the Session does provide it, and only A's own policy is hiding
    // it: the switch never takes effect, at any boundary, until the Session is
    // returned to No team first.
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await call(h, captain, B_ONLY_TOOL)).isError).toBe(true)
    expect((await call(h, captain, 'get_team_preset')).text).toContain('"selectedTeamId":"team-2"')

    h.selections([])
    await waitForAllowed(h, captain, B_ONLY_TOOL)
    h.selections([{ sessionId: 's1', teamId: 'team-2' }])
    await waitForPersona(h, captain, 'Captain prompt B')
    expect((await call(h, captain, B_ONLY_TOOL)).isError).toBe(false)
  })

  it('refuses an edit that adds a tool to the Team this Session already applied', async () => {
    // DEFECT D1 (measured at HEAD; also present at c59cbd1^, so not a regression
    // of the quarantine fix) — reported to the captain, not fixed here. Invert
    // these assertions once it is closed.
    //
    // The same defect through the settings page instead of the composer: the
    // stored definition of the applied Team gains a capability, and the Session
    // is between tasks, so nothing but the stale probe stands in the way.
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')

    h.teams([definition('A', 'alpha', 'custom', [B_ONLY_TOOL])])
    await settlePlugin()
    // The edit is dropped: the Session keeps the old definition and the new
    // capability is never granted, even though it is between tasks.
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await call(h, captain, B_ONLY_TOOL)).isError).toBe(true)
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)

    // ...and a later task boundary does not rescue it either.
    await startTask(h, captain)
    await h.release()
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await call(h, captain, B_ONLY_TOOL)).isError).toBe(true)
  })

  it('keeps A in force when the switch target does not exist, then freezes at the boundary', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    await startTask(h, captain)

    h.selections([{ sessionId: 's1', teamId: 'team-9' }])
    await settlePlugin()
    // An unapplicable switch is not a reason to drop the running policy.
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    await h.release()
    await waitForRefusal(h, captain, ALLOWED_TOOL, DANGLING)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
  })
})

describe('cancelling the frozen task', () => {
  it('keeps the freeze when the captain`s turn is cancelled while a teammate still works', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    await completeOneTurn(h, captain)

    // A teammate holds this Team task open, so the captain is idle but the
    // Session is still inside the task.
    h.teammates('s1', [teammate('running')])
    h.selections([])
    await settlePlugin()
    await h.remount()
    await waitForRefusal(h, captain, ALLOWED_TOOL, 'selection has since been cleared')
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)

    // The user cancels: the captain's own turn ends, and the freeze does not.
    h.wake(captain)
    captain.cancel({ kind: 'user' })
    h.adapter.open()
    await captain.whenIdle()
    await settlePlugin()
    expect(captain.status).toBe('idle')
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
    // The authorized channel to end the task is still open.
    expect((await call(h, captain, 'interrupt_agent')).isError).toBe(false)
    expect(h.spyBodies).toContain('interrupt_agent')

    // The roster is what ends the task, and with it the freeze.
    h.teammates('s1', [teammate('inactive')])
    h.rosterEvent(captain)
    await waitForAllowed(h, captain, ALLOWED_TOOL)
    expect((await applied(h.ctx, captain)).persona).toBe('')
    await h.release()
  })
})

describe('permission-state loss', () => {
  it('keeps the denial when the reload releases the restriction it cannot restore', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    await startTask(h, captain)

    // Under A the excluded capability is refused by the Team's own policy, and it
    // is absent from the tool surface the model receives.
    const before = await call(h, captain, DENIED_TOOL)
    expect(before.isError).toBe(true)
    expect(before.text).toContain(POLICY_DENIES)
    expect(await wireTools(h.ctx, captain)).not.toContain(DENIED_TOOL)

    await h.remount()
    // The reload released every restriction A installed, so the platform surface
    // is back to the deployment default...
    await waitUntil('the released restriction to leave the tool surface', async () => (await wireTools(h.ctx, captain)).includes(DENIED_TOOL))
    // ...and what still refuses the call is the new activation's quarantine, not
    // a restriction that no longer exists.
    await waitForRefusal(h, captain, DENIED_TOOL, UNRESTORABLE)
    const after = await call(h, captain, DENIED_TOOL)
    expect(after.isError).toBe(true)
    expect(after.text).not.toContain(POLICY_DENIES)
    for (const name of ESCALATION_TOOLS) {
      const result = await call(h, captain, name)
      expect(result.isError, name).toBe(true)
      expect(result.text, name).toContain(UNRESTORABLE)
    }
    expect(h.spyBodies).not.toContain('spawn_teammate')
    expect(h.spawnTeammate).not.toHaveBeenCalled()
    await h.release()
  })

  it('does not honour a No-team baseline observed by a previous activation', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: [] })
    const captain = await h.create('s1')
    await settlePlugin()
    // This activation watched a boundary with no Team: a mid-task selection would
    // be a safe deferral.
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)

    // The reload discards that proof, and the Session is mid-task when a Team is
    // selected, so the selection can no longer be classified as safe.
    await startTask(h, captain)
    await h.remount()
    await settlePlugin()
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)
    h.selections(SELECTED)
    await waitForRefusal(h, captain, ALLOWED_TOOL, UNRESTORABLE)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
    await h.release()
    // A applies at the boundary, so the proof is only delayed, never assumed.
    await waitForPersona(h, captain, 'Captain prompt A')
  })
})

describe('RESIDUAL WINDOW: a Team task whose captain never assembled a request', () => {
  it('hands a running Team task the deployment default when the selection is cleared', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    // A is applied while this Session is idle, and only a TEAMMATE has run so
    // far, so the captain's own log carries no request/header row at all.
    expect(h.headerTools(captain)).toEqual([])
    h.teammates('s1', [teammate('running')])
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)

    h.selections([])
    await settlePlugin()
    // While this activation is alive the running policy is kept correctly.
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await applied(h.ctx, captain)).tools).toContain('spawn_team_member')

    await h.remount()
    await settlePlugin()

    // KNOWN RESIDUAL WINDOW — do not turn this into a permission argument.
    //
    // No selection, no marker, and a teammate still inside A's task: the state is
    // classified as unknown, so nothing is frozen and the captain runs on the
    // deployment default — including the capability A excluded. Unlike the
    // documented race, this shape needs no timing at all: a captain that has not
    // sent a request under its Team simply has no marker, which is the ordinary
    // state of every Team task that is currently waiting on a teammate.
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, 'spawn_teammate')).isError).toBe(false)
    expect(h.spyBodies).toContain('spawn_teammate')
    // The Team composition itself is not restored, so the surface is also
    // narrower in one respect: no member tool and no persona.
    expect((await applied(h.ctx, captain)).tools).not.toContain('spawn_team_member')
    expect((await applied(h.ctx, captain)).persona).toBe('')

    h.teammates('s1', [teammate('inactive')])
    h.rosterEvent(captain)
    await settlePlugin()
    await h.release()
  })

  it('refuses the custom policy on a PTC deployment instead of reopening the denied code transport', async () => {
    // The old PTC fold installed a native surface for the Team and released it on
    // reload, which created the residual window this case used to prove: a
    // running task handed `run_code` back after its Team was deselected. The fold
    // no longer exists, so the custom Team is refused from the start and there is
    // no applied policy for a status edge to widen.
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED, ptc: true })
    const captain = await h.create('s1')
    await settlePlugin()

    expect((await applied(h.ctx, captain)).persona).not.toBe('Captain prompt A')
    expect(await wireTools(h.ctx, captain)).toEqual(['run_code'])
    const denied = await call(h, captain, 'run_code', { code: 'return 1', description: 'probe' })
    expect(denied.isError).toBe(true)
    expect(denied.text).toContain('native Agent preset')

    // The refused application never installed a policy, so deselecting mid-task
    // cannot widen anything: the guard stays in place and the transport stays
    // refused across the same status edges the old window needed.
    h.teammates('s1', [teammate('running')])
    h.selections([])
    await settlePlugin()
    const after = await call(h, captain, 'run_code', { code: 'return 1', description: 'probe' })
    expect(after.isError).toBe(true)
    expect(after.text).toContain('native Agent preset')
    expect(await wireTools(h.ctx, captain)).toEqual(['run_code'])
    expect(await wireTools(h.ctx, captain)).not.toContain('spawn_team_member')
    expect((await applied(h.ctx, captain)).tools).not.toContain('spawn_team_member')

    h.teammates('s1', [teammate('inactive')])
    h.rosterEvent(captain)
    await settlePlugin()
    await h.release()
  })

  it('freezes the same shape once the captain itself sent a request under the Team', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    // The only difference from the case above: the captain has assembled one
    // request under A, so its log carries the marker.
    await completeOneTurn(h, captain)
    expect(h.headerTools(captain)).toContain('spawn_team_member')
    h.teammates('s1', [teammate('running')])

    h.selections([])
    await settlePlugin()
    await h.remount()
    await waitForRefusal(h, captain, ALLOWED_TOOL, 'selection has since been cleared')
    const frozen = await call(h, captain, ALLOWED_TOOL)
    expect(frozen.isError).toBe(true)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
    expect(h.spyBodies).not.toContain('spawn_teammate')

    h.teammates('s1', [teammate('inactive')])
    h.rosterEvent(captain)
    await waitForAllowed(h, captain, ALLOWED_TOOL)
    await h.release()
  })
})

describe('the recovery set stays a recovery set', () => {
  it('exempts ten names under quarantine and none of the capabilities that could act', async () => {
    expect([...CAPTAIN_RECOVERY_TOOLS].sort()).toEqual([
      'get_team_preset', 'interrupt_agent', 'list_agents', 'send_message', 'team_task_create',
      'team_task_get', 'team_task_list', 'team_task_update', 'update_team_preset', 'wait_agent',
    ])
    for (const name of ESCALATION_TOOLS) expect(CAPTAIN_RECOVERY_TOOLS.has(name), name).toBe(false)

    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await waitForPersona(h, captain, 'Captain prompt A')
    await startTask(h, captain)
    await h.remount()
    await settlePlugin()
    h.spyBodies.length = 0

    // Every exempted coordination name reaches its own body: the guard decided,
    // the deployment did not merely lack the tool.
    for (const name of ['send_message', 'list_agents', 'wait_agent', 'interrupt_agent',
      'team_task_create', 'team_task_get', 'team_task_list', 'team_task_update'] as const) {
      expect((await call(h, captain, name)).isError, name).toBe(false)
      expect(h.spyBodies, name).toContain(name)
    }
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
    // A preset edit is exempted from the QUARANTINE only; it cannot carry a tool
    // allow-list, so it can never be used to grant a capability back.
    const edit = await call(h, captain, 'update_team_preset', {
      team_id: 'team-1', revision: 0, team_description: 'x', captain_tools: [DENIED_TOOL],
    })
    expect(edit.text).not.toContain(UNRESTORABLE)
    expect(h.config.teams.get()[0]?.captain.tools).toContain(ALLOWED_TOOL)
    expect(h.config.teams.get()[0]?.captain.tools).not.toContain(DENIED_TOOL)
    // Nothing that creates an Agent or runs code runs its body.
    for (const name of ESCALATION_TOOLS) expect(h.spyBodies, name).not.toContain(name)
    expect(h.spawnTeammate).not.toHaveBeenCalled()
    await h.release()
  })
})
