/**
 * Quarantine lifecycle: when a Session loses its Team capability policy, what
 * exactly is refused, for which input, for how long, and which channels remain.
 *
 * This spec is the T1 reproduction matrix for report items R1–R10, rewritten as
 * the acceptance contract for the T2 fix. Every case asserts the behavior after
 * the fix; the three cases that assert a deliberately preserved defect say so in
 * capitals and name the trigger conditions.
 *
 * What the fix changed:
 * - A quarantine now exempts exactly ten captain tools that grant no capability
 *   (preset reading/editing and Team coordination), so the refusal no longer
 *   removes the recovery channel its own text recommends. A teammate is still
 *   denied everything.
 * - A mid-task selection no longer freezes a Session that this activation watched
 *   running without a Team: nothing would be widened by waiting for the boundary.
 * - A Session whose own request log proves it ran under a Team is still frozen
 *   even after its selection was cleared, which closes the deselect-then-reload
 *   privilege escalation.
 * - A failed restore of the previous Team now quarantines instead of leaving the
 *   Agent on the deployment default.
 *
 * Matrix (scenario → conclusion):
 * - R1  remount while the captain runs          → quarantined; capability tools
 *       refused, recovery tools allowed; boundary adopts the latest definition.
 * - R2  No team → select a Team mid-turn        → NOT quarantined. The selection
 *       is deferred to the boundary; nothing is applied mid-task.
 * - R3  Team A → Team B mid-turn                → NOT quarantined, A stays applied;
 *       boundary adopts B. Same shape as R2, same outcome.
 * - R5  cold start / remount while idle         → applies normally.
 * - R6  selection points at a deleted Team      → quarantined (persistent), and
 *       the recovery channel still works; clearing the selection recovers.
 * - R7  allow-list names an unreachable tool    → quarantined with the actionable
 *       reason; fixing the stored Team recovers.
 * - R8  teammate stuck, captain idle            → quarantined until the roster
 *       settles, but `interrupt_agent` is now usable, so the dead end is gone.
 * - R10 repeated volatile updates + cancel      → no leftover guard, no premature
 *       release; the last stored definition wins at the boundary.
 * - Escalation: mid-task deselect → remount     → STILL REFUSED (the fix).
 * - RESIDUAL WINDOW (known, not fixed): a reload mid-task of a Session that never
 *       had a Team is not quarantined. See the case at the end of the file.
 *
 * Evidence pointers: quarantine() index.ts:118-140, busy branch index.ts:680-730,
 * dangling selection index.ts:738, hasTeamApplicationMarker() execution.ts:41-73,
 * CAPTAIN_RECOVERY_TOOLS tool-policy.ts:28-52, teammatesBusy() execution.ts:24-26.
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

/** Global tool every definition below allows its captain to call. */
const ALLOWED_TOOL = 'probe_allowed'

/** Global tool no definition below names, so a restriction must hide it. */
const DENIED_TOOL = 'probe_denied'

/**
 * Tools a quarantine must keep usable: the captain's recovery set, none of which
 * grants a capability.
 *
 * The last two are the plugin's own preset tools, which it registers per Agent;
 * the coordination names are registered by the Team composition. The harness
 * supplies spies for the coordination names so a refusal is told from a call
 * whose body really ran.
 */
const RECOVERY_TOOLS = [
  'get_team_preset',
  'update_team_preset',
  'send_message',
  'list_agents',
  'wait_agent',
  'interrupt_agent',
  'team_task_create',
  'team_task_get',
  'team_task_list',
  'team_task_update',
] as const

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
 * @param member - teammate target this definition declares.
 * @param mode - the captain's tool mode; `all` needs no allow-list.
 * @returns the Team preset.
 */
function definition(marker: string, member: string, mode: 'custom' | 'all' = 'custom'): TeamPreset {
  return {
    ...team([slot({ name: member, description: `${marker} member` })], {
      name: `captain-${marker}`,
      systemPrompt: `Captain prompt ${marker}`,
      toolMode: mode,
      tools: mode === 'custom' ? [ALLOWED_TOOL, 'spawn_team_member', 'get_team_preset', 'update_team_preset'] : [],
    }),
    name: `Team ${marker}`,
  }
}

/** A definition whose captain allow-list names a tool no deployment registers. */
function invalidDefinition(marker: string, member: string): TeamPreset {
  const valid = definition(marker, member)
  return { ...valid, captain: { ...valid.captain, toolMode: 'custom', tools: ['ghost_tool'] } }
}

/**
 * A model route that blocks until the test releases it, so an Agent stays in
 * its running phase for as long as a case needs to observe the freeze.
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
  /** The mounted plugin fiber, so a case can dispose it like the Loader would. */
  readonly fiber: { dispose(): Promise<void> }
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
  /** Wake one Agent into a turn that stays running until {@link release}. */
  readonly wake: (agent: Agent) => void
  /** Let every blocked turn finish and wait for the Agents to settle idle. */
  readonly release: () => Promise<void>
  /** Dispose one Session exactly as its owner would. */
  readonly disposeAgent: (agent: Agent) => Promise<void>
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

  // The two capability probes are global, so a Team allow-list can include and
  // exclude them by name.
  for (const name of [ALLOWED_TOOL, DENIED_TOOL]) {
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

  const storeRoot = await mkdtemp(join(tmpdir(), 'team-presets-quarantine-store-'))
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

  const agents: Agent[] = []
  const handles = new Map<Agent, { dispose(): Promise<void> }>()
  const harness: Harness = {
    ctx,
    config,
    adapter,
    storage,
    spawnTeammate,
    spyBodies,
    get fiber() { return fiber },
    create: async (id) => {
      knownRoots.add(id)
      const handle = await ctx.agents.create({
        sessionId: SessionId(id),
        agentOptions: { provider: 'fixture', model: 'fixture' },
      })
      roots.add(handle.agent)
      agents.push(handle.agent)
      handles.set(handle.agent, handle)
      // Exact-Agent spies: a name that only this Agent can see proves the guard
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
    wake: (agent) => {
      agent.followup(createUserMessage({ content: [{ type: 'text', text: 'work' }], source: { kind: 'user' } }))
    },
    release: async () => {
      adapter.open()
      for (const agent of agents) await agent.whenIdle()
    },
    disposeAgent: async (agent) => {
      await handles.get(agent)?.dispose()
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

/** Every observable face of the Team one Session currently has applied. */
async function applied(ctx: Context, agent: Agent) {
  const assembly = await ctx.systemPrompt.assemble(assembleContextFor(agent))
  const memberTool = ctx.tools.get('spawn_team_member', agent)
  return {
    persona: assembly.sections.find(section => section.name === PERSONA_PREFIX_SECTION)?.text,
    briefing: assembly.sections.find(section => section.name === 'agent-team-presets:briefing')?.text,
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

/** The refusal text of every capability tool one quarantined Agent still holds. */
async function refusals(h: Harness, agent: Agent): Promise<Record<string, { isError: boolean; text: string }>> {
  const out: Record<string, { isError: boolean; text: string }> = {}
  for (const name of [ALLOWED_TOOL, DENIED_TOOL, ...ESCALATION_TOOLS]) out[name] = await call(h, agent, name)
  return out
}

/** One Team selected by one Session, the shape most cases below start from. */
const SELECTED: readonly TeamSelectionRecord[] = [{ sessionId: 's1', teamId: 'team-1' }]

describe('R1 a plugin remount in the middle of a task quarantines the Session', () => {
  it('refuses capability tools but keeps the recovery channel, then adopts the latest definition', async () => {
    const h = await setup({
      teams: [definition('A', 'alpha')],
      selections: [{ sessionId: 's1', teamId: 'team-1' }, { sessionId: 's2', teamId: 'team-1' }],
    })
    const captain = await h.create('s1')
    const other = await h.create('s2')
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)

    h.wake(captain)
    h.teams([definition('B', 'beta')])
    await h.remount()
    await settlePlugin()

    // Capability tools, and every path that could create an Agent or run code,
    // are refused with the quarantine reason.
    const frozen = await refusals(h, captain)
    for (const [name, result] of Object.entries(frozen)) {
      expect(result.isError, name).toBe(true)
      expect(result.text, name).toContain('cannot be safely restored into an already-running task')
    }
    expect(h.spyBodies).not.toContain('spawn_teammate')
    expect(h.spyBodies).not.toContain('subagent')
    expect(h.spyBodies).not.toContain('workflow')
    // The member tool is not registered while frozen, so the frozen surface is
    // also narrower than A's policy.
    expect((await applied(h.ctx, captain)).tools).not.toContain('spawn_team_member')

    // The recovery channel survives: the captain can still read and edit presets
    // and coordinate the Team, which is what its own refusal text recommends.
    const preset = await call(h, captain, 'get_team_preset')
    expect(preset.isError).toBe(false)
    expect(preset.text).toContain('"selectedTeamId":"team-1"')
    // `update_team_preset` is exempted from the quarantine; it still enforces its
    // own preconditions (an open turn), which is a different refusal.
    expect((await call(h, captain, 'update_team_preset', { team_id: 'team-1', revision: 0, team_description: 'x' })).text)
      .not.toContain('cannot be safely restored')
    for (const name of ['send_message', 'list_agents', 'team_task_list', 'wait_agent', 'interrupt_agent'] as const) {
      expect((await call(h, captain, name)).isError, name).toBe(false)
    }
    expect(h.spyBodies).toContain('send_message')
    expect(h.spyBodies).toContain('list_agents')
    expect(h.spyBodies).toContain('team_task_list')

    // The quarantine is per-Agent: the other Session root is untouched.
    expect((await applied(h.ctx, other)).persona).toBe('Captain prompt B')
    expect((await call(h, other, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, other, DENIED_TOOL)).isError).toBe(true)

    await h.release()
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
  })

  it('recovers at the boundary even after several remounts of the same running task', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    h.wake(captain)
    for (let round = 0; round < 5; round += 1) {
      await h.remount()
      await settlePlugin()
    }
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)
    // One quarantine, not one per remount: the recovery channel is a single guard.
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)

    await h.release()
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
  })
})

describe('R2 a No-team Session that selects a Team mid-turn', () => {
  it('defers the selection to the boundary without quarantining', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: [] })
    const captain = await h.create('s1')
    await settlePlugin()
    // The mount watched this Session at a boundary with no Team: that is the
    // proof ("proven unteamed") that makes a mid-task selection a safe deferral.
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)

    h.wake(captain)
    h.selections(SELECTED)
    // Nothing is applied mid-task and nothing is refused: the Session keeps
    // running on the surface it started with.
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('')
    expect((await applied(h.ctx, captain)).tools).not.toContain('spawn_team_member')

    await h.release()
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
  })

  it('adopts only the last of several definitions selected during the same task', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: [] })
    const captain = await h.create('s1')
    await settlePlugin()
    h.wake(captain)
    h.selections(SELECTED)
    h.teams([definition('B', 'beta')])
    h.teams([definition('C', 'gamma')])
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('')

    await h.release()
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt C')
  })

  it('keeps the deployment default when the selection is cleared again mid-task', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: [] })
    const captain = await h.create('s1')
    await settlePlugin()
    h.wake(captain)
    h.selections(SELECTED)
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)

    h.selections([])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)

    await h.release()
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('')
  })

  it('defers when a teammate runs instead of the captain', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: [] })
    const captain = await h.create('s1')
    await settlePlugin()
    h.teammates('s1', [teammate('running')])
    h.selections(SELECTED)
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('')

    h.teammates('s1', [teammate('inactive')])
    h.rosterEvent(captain)
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
  })
})

describe('R3 switching Teams mid-task', () => {
  it('keeps A applied and does not quarantine when A is replaced by B', async () => {
    const other = { ...definition('B', 'beta'), id: 'team-2' }
    const h = await setup({ teams: [definition('A', 'alpha'), other], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    h.wake(captain)
    h.selections([{ sessionId: 's1', teamId: 'team-2' }])
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    await h.release()
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
  })

  it('keeps A applied when a teammate runs and the captain is idle', async () => {
    const other = { ...definition('B', 'beta'), id: 'team-2' }
    const h = await setup({ teams: [definition('A', 'alpha'), other], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    h.teammates('s1', [teammate('running')])
    h.selections([{ sessionId: 's1', teamId: 'team-2' }])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    h.teammates('s1', [teammate('inactive')])
    h.rosterEvent(captain)
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
  })
})

describe('R5 a cold-started or remounted idle Session applies and recovers normally', () => {
  it('applies at creation, keeps working across a remount, and can still summon a member', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
    expect((await call(h, captain, 'spawn_team_member', { member: 'alpha', task: 'go' })).isError).toBe(false)

    await h.remount()
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
    expect((await applied(h.ctx, captain)).tools).toContain('spawn_team_member')
  })

  it('applies to an Agent created after a remount', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    await h.remount()
    await settlePlugin()
    const captain = await h.create('s1')
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
  })
})

describe('R6 a selection that points at a Team which no longer exists', () => {
  it('refuses capability tools persistently, and clearing the selection recovers', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: [{ sessionId: 's1', teamId: 'gone' }] })
    const captain = await h.create('s1')
    await settlePlugin()
    const frozen = await refusals(h, captain)
    for (const [name, result] of Object.entries(frozen)) {
      expect(result.isError, name).toBe(true)
      expect(result.text, name).toContain('no longer exists. This is not "No team"')
    }
    // The dangling selection is the whole diagnosis: the captain can read it.
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)

    // The refusal survives a remount: it is derived from the stored selection.
    await h.remount()
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).text).toContain('no longer exists')

    h.selections([])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)
  })

  it('recovers when the deleted Team is stored again', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    h.teams([])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).text).toContain('no longer exists')

    h.teams([definition('A', 'alpha')])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
  })

  it('defers the freeze to the boundary when the Team is deleted mid-task', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    h.wake(captain)
    h.teams([])
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    await h.release()
    await settlePlugin()
    // The boundary hands out no capability until the dangling selection is fixed.
    expect((await call(h, captain, ALLOWED_TOOL)).text).toContain('no longer exists. This is not "No team"')
    expect((await applied(h.ctx, captain)).tools).not.toContain('spawn_team_member')
    // ...and the user can repair it from inside the Session.
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
  })
})

describe('R7 a stored allow-list that names an unreachable capability', () => {
  it('quarantines with the actionable reason, then recovers when the Team is fixed', async () => {
    const h = await setup({ teams: [invalidDefinition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    const frozen = await refusals(h, captain)
    for (const [name, result] of Object.entries(frozen)) {
      expect(result.isError, name).toBe(true)
      expect(result.text, name).toContain('names capabilities this Session cannot reach')
      expect(result.text, name).toContain('captain: ghost_tool')
    }
    // The actionable reason is reachable: the preset tool is exempted.
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)

    await h.remount()
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).text).toContain('names capabilities this Session cannot reach')

    h.teams([definition('A', 'alpha')])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
  })

  it('keeps the running task on the last effective definition when the stored one becomes invalid', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    h.wake(captain)
    h.teams([invalidDefinition('B', 'beta')])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    await h.release()
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
  })
})

describe('R8 a teammate that never settles keeps its Session frozen', () => {
  it('quarantines a cold-started Session whose teammate is still provisioning', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    // The roster is scripted before the Session is created, as a resumed
    // Session's roster would already be known to the Team service.
    h.teammates('s1', [teammate('provisioning')])
    const captain = await h.create('s1')
    await settlePlugin()
    // No boundary was ever observed, so this is not a proven No-team Session.
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)

    h.teammates('s1', [teammate('inactive')])
    h.rosterEvent(captain)
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
  })

  it('stays frozen while the roster never settles, but can now interrupt the stuck teammate', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    h.teammates('s1', [teammate('running')])
    await h.remount()
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)

    for (let round = 0; round < 2; round += 1) {
      h.wake(captain)
      await h.release()
      await settlePlugin()
    }
    expect(captain.status).toBe('idle')
    // The freeze is still bounded only by the roster, but it is no longer a dead
    // end: `interrupt_agent` is exempted, so the captain can stop the member that
    // holds the boundary shut.
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)
    expect((await call(h, captain, 'interrupt_agent')).isError).toBe(false)
    expect(h.spyBodies).toContain('interrupt_agent')
    expect(h.spyBodies).not.toContain('spawn_teammate')
  })

  it('recovers once the roster settles without any live status edge', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    h.teammates('s1', [teammate('running')])
    await h.remount()
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)

    h.teammates('s1', [teammate('inactive')])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)
    h.wake(captain)
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    await h.release()
  })
})

describe('R10 repeated volatile updates and a cancelled turn', () => {
  it('holds the running task on A across four stored definitions, then adopts the last', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    h.wake(captain)
    for (const marker of ['B', 'C', 'D', 'E']) h.teams([definition(marker, marker.toLowerCase())])
    await settlePlugin()

    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    expect((await applied(h.ctx, captain)).tools).toContain('spawn_team_member')

    await h.release()
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt E')
  })

  it('drops a pending first application cleanly when the selection is cleared before it settles', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    // No settle in between: the queued first application is superseded.
    h.selections([])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('')
  })

  it('keeps A across rapid updates plus a cancel, and adopts the next valid write', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    h.wake(captain)
    h.teams([definition('B', 'beta')])
    h.teams([invalidDefinition('C', 'gamma')])
    captain.cancel({ kind: 'user' })
    await settlePlugin()
    expect(captain.status).toBe('idle')
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    h.teams([definition('D', 'delta')])
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt D')
  })
})

describe('the deselect-then-reload escalation is refused', () => {
  it('keeps the capability denial when the selection was cleared before the remount', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    // One completed turn, so this Session's own request log records that it ran
    // under a Team (`spawn_team_member` in the header).
    h.adapter.open()
    h.wake(captain)
    await captain.whenIdle()
    await settlePlugin()
    h.adapter.close()
    expect(h.headerTools(captain)).toContain('spawn_team_member')

    // Start a task, deselect mid-task, then reload the plugin before the task ends.
    h.wake(captain)
    h.selections([])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    await h.remount()
    await settlePlugin()

    // FIXED: the log proves the running task is under an unreadable Team policy,
    // so the reload must not hand it the deployment default.
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)
    expect((await call(h, captain, ALLOWED_TOOL)).text).toContain('tools are paused until its task boundary')
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
    expect((await applied(h.ctx, captain)).persona).toBe('')
    // The recovery channel is still there.
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
    expect((await call(h, captain, 'send_message')).isError).toBe(false)

    await h.release()
    await settlePlugin()
    // The selection is gone, so the boundary returns the Session to the
    // deployment default rather than to A.
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('')
  })
})

describe('the proven-unteamed baseline is invalidated by an application', () => {
  it('does not extend the B treatment to a Session that has since applied a Team', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: [] })
    const captain = await h.create('s1')
    await settlePlugin()
    // A boundary with no Team: the baseline exists.
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)

    // Apply A while idle, which ends the No-team proof...
    h.selections(SELECTED)
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    // ...run one turn so the header records the application...
    h.adapter.open()
    h.wake(captain)
    await captain.whenIdle()
    await settlePlugin()
    h.adapter.close()
    expect(h.headerTools(captain)).toContain('spawn_team_member')

    // ...then deselect mid-task and reload: the stale baseline must not be used.
    h.wake(captain)
    h.selections([])
    await settlePlugin()
    await h.remount()
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)

    await h.release()
  })
})

describe('the recovery set is exact', () => {
  it('exempts exactly the ten captain tools and nothing that can create an Agent', async () => {
    expect([...CAPTAIN_RECOVERY_TOOLS].sort()).toEqual([...RECOVERY_TOOLS].sort())
    for (const name of ESCALATION_TOOLS) expect(CAPTAIN_RECOVERY_TOOLS.has(name), name).toBe(false)

    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    h.wake(captain)
    await h.remount()
    await settlePlugin()
    h.spyBodies.length = 0

    // Every exempted name reaches its own body: this is a decision the guard
    // made, not a deployment that happens to lack the tool.
    for (const name of ['send_message', 'list_agents', 'wait_agent', 'interrupt_agent',
      'team_task_create', 'team_task_get', 'team_task_list', 'team_task_update'] as const) {
      expect((await call(h, captain, name)).isError, name).toBe(false)
    }
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
    expect((await call(h, captain, 'update_team_preset', { team_id: 'team-1', revision: 0, team_description: 'x' })).text)
      .not.toContain('cannot be safely restored')

    // Nothing that creates an Agent or runs code runs its body, and an ordinary
    // capability is still refused by the quarantine.
    for (const name of ['spawn_teammate', 'subagent', 'subagent_fork', 'workflow'] as const) {
      expect((await call(h, captain, name)).isError, name).toBe(true)
    }
    expect((await call(h, captain, 'spawn_team_member', { member: 'alpha', task: 'go' })).isError).toBe(true)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
    expect(h.spyBodies).not.toContain('spawn_teammate')
    expect(h.spyBodies).not.toContain('subagent')
    expect(h.spyBodies).not.toContain('subagent_fork')
    expect(h.spyBodies).not.toContain('workflow')
    expect(h.spawnTeammate).not.toHaveBeenCalled()

    await h.release()
  })

  it('does not override another guard that denies an exempted name', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    const release = captain.ctx.tools.guard(exec => exec.name === 'get_team_preset' ? 'outer guard denies' : undefined)
    h.wake(captain)
    await h.remount()
    await settlePlugin()
    // The exemption only declines to deny; it never force-allows.
    expect((await call(h, captain, 'get_team_preset')).text).toContain('outer guard denies')
    expect((await call(h, captain, 'send_message')).isError).toBe(false)
    release()
    await h.release()
  })
})

describe('a failed restore fails closed', () => {
  it('quarantines when both the update and the restore of the previous Team fail', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    // Two registration attempts: the new application and the restore of A.
    const register = vi.spyOn(captain.ctx.tools, 'register')
      .mockImplementationOnce(() => { throw new Error('candidate registration failed') })
      .mockImplementationOnce(() => { throw new Error('restore registration failed') })
    h.teams([definition('B', 'beta')])
    await settlePlugin()
    register.mockRestore()

    // FIXED: no half-installed restore is left behind, and no capability leaks.
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(true)
    expect((await applied(h.ctx, captain)).tools).not.toContain('spawn_team_member')
    // The refusal names the restore failure, which is the actionable fact.
    const text = (await call(h, captain, ALLOWED_TOOL)).text
    expect(text).toContain('could not be restored')
    expect(text).toContain('team-1')
    expect(text).toContain('restore registration failed')
    // The user keeps a way out.
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)

    h.teams([definition('C', 'gamma')])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt C')
  })

  it('does not turn a stale restore failure into an unguarded Session', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    const register = vi.spyOn(captain.ctx.tools, 'register')
      .mockImplementationOnce(() => { throw new Error('candidate registration failed') })
      .mockImplementationOnce(() => { throw new Error('restore registration failed') })
    h.teams([definition('B', 'beta')])
    await settlePlugin()
    register.mockRestore()
    expect((await call(h, captain, ALLOWED_TOOL)).text).toContain('could not be restored')

    // The user picks "No team". That releases the guard and the half-installed
    // state, so the restore-failure diagnosis is spent and must not survive as a
    // standing excuse to skip future quarantines.
    h.selections([])
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)

    // A Team that cannot be applied must now be refused on its own merits, with
    // its own reason, instead of inheriting the stale restore-failure exemption.
    const broken = { ...invalidDefinition('C', 'gamma'), id: 'team-3' }
    h.teams([broken])
    h.selections([{ sessionId: 's1', teamId: 'team-3' }])
    await settlePlugin()

    const denied = await call(h, captain, DENIED_TOOL)
    // FAIL-OPEN REGRESSION: the ordinary capability and the excluded one must both
    // stay refused. Asserting only ALLOWED_TOOL would miss the leak, because both
    // of them fell open at once.
    expect(denied.isError).toBe(true)
    expect(denied.text).toContain('names capabilities this Session cannot reach')
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBeUndefined()
    // And the recovery channel is, as always, intact.
    expect((await call(h, captain, 'get_team_preset')).isError).toBe(false)
  })
})

describe('the PTC presentation never counts as "No team" evidence', () => {
  it('quarantines a busy remount even though its header only lists run_code', async () => {
    const h = await setup({ teams: [definition('A', 'alpha', 'all')], selections: SELECTED, ptc: true })
    const captain = await h.create('s1')
    await settlePlugin()
    // Complete one turn so the Host logs a real header for this Session.
    h.adapter.open()
    h.wake(captain)
    await captain.whenIdle()
    await settlePlugin()
    h.adapter.close()
    // The Team really is applied, and the header really lacks the marker: a
    // collapsed PTC surface exposes only `run_code`.
    expect(h.headerTools(captain)).toEqual(['run_code'])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    h.wake(captain)
    await h.remount()
    await settlePlugin()
    // The absence of the marker must not be read as "this Session ran without a
    // Team": the quarantine is decided by the selection, and the capability
    // surface stays closed.
    expect((await call(h, captain, 'run_code', { code: 'return 1', description: 'probe' })).text)
      .toContain('cannot be safely restored')
    // The effective wire is still the collapsed transport, so the frozen Session
    // has no capability surface at all — not even the member tool.
    expect((await wireTools(h.ctx, captain))).toEqual(['run_code'])

    await h.release()
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
  })
})

describe('a teammate is never granted the captain recovery set', () => {
  it('keeps a child of a quarantined root denied everything, recovery tools included', async () => {
    const h = await setup({ teams: [definition('A', 'alpha', 'all')], selections: SELECTED })
    const captain = await h.create('s1')
    await settlePlugin()
    const child = (await h.ctx.agents.create({
      sessionId: SessionId('child'),
      parentAgent: captain,
      meta: { parentSession: captain.session.id, origin: 'subagent' },
      agentOptions: { provider: 'fixture', model: 'fixture' },
    })).agent
    h.wake(captain)
    await h.remount()
    await settlePlugin()
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(true)
    for (const name of [ALLOWED_TOOL, DENIED_TOOL, 'get_team_preset', 'send_message', 'list_agents'] as const) {
      const result = await call(h, child, name)
      expect(result.isError, name).toBe(true)
      expect(result.text, name).toContain('Parent Team policy is quarantined')
    }
    await h.release()
  })

  it('leaves another Session root on its own policy', async () => {
    const h = await setup({
      teams: [definition('A', 'alpha')],
      selections: [{ sessionId: 's1', teamId: 'team-1' }, { sessionId: 's2', teamId: 'team-1' }],
    })
    const busy = await h.create('s1')
    const idle = await h.create('s2')
    await settlePlugin()
    h.wake(busy)
    await h.remount()
    await settlePlugin()
    expect((await call(h, busy, ALLOWED_TOOL)).isError).toBe(true)
    expect((await call(h, idle, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, idle, DENIED_TOOL)).isError).toBe(true)
    expect((await applied(h.ctx, idle)).persona).toBe('Captain prompt A')
    await h.release()
  })
})

describe('RESIDUAL WINDOW: an unknown history with no selection is not quarantined', () => {
  it('leaves a never-teamed Session on the deployment default after a mid-task remount', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: [] })
    const captain = await h.create('s1')
    await settlePlugin()
    h.wake(captain)
    await h.remount()
    await settlePlugin()

    // KNOWN RESIDUAL WINDOW — do not turn this into a permission argument.
    //
    // This Session never had a Team, so nothing is being widened here and the
    // default surface is correct. The same shape is also reached by the one
    // remaining gap: "apply A while idle -> wake -> deselect -> reload before the
    // new request header is built". That Session's log still carries the
    // previous No-team header, so the marker is negative and no quarantine is
    // raised even though the running task is under A. Closing it requires a
    // durable marker written before the application is installed; it is out of
    // scope for this change and must not be "fixed" by quarantining every
    // unknown, which would re-create the reported freeze for every user who
    // reloads a plugin mid-task in a Team-less Session.
    expect((await call(h, captain, ALLOWED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, DENIED_TOOL)).isError).toBe(false)
    expect((await call(h, captain, 'send_message')).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('')
    expect((await applied(h.ctx, captain)).tools).not.toContain('spawn_team_member')

    await h.release()
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('')
  })
})
