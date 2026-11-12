/**
 * The Team-task freeze: a Session keeps the Team definition its task started
 * with — captain persona, briefing, member roster, and tool scope as one
 * snapshot — and adopts the latest stored definition between Team tasks.
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
import type { SubagentActivation, SubagentActivationSpec } from '@deepseek-ai/dsh-subagent'
import { LlmAdapter, ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, LlmResolvedModelInfo, StreamChunk } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt'
import { apply, inject } from '../src/index.ts'
import type { Config } from '../src/config.ts'
import type { TeamPreset, TeamSelectionRecord } from '../src/types.ts'
import { BUILTIN_TEAM_IDS } from '../src/builtin-teams.ts'
import { memberRecord, mountMemberStorage } from './fixtures/member-storage.ts'
import type { MemberStorage } from './fixtures/member-storage.ts'
import { settlePlugin, mountSubagentDouble, acceptedActivation } from './fixtures/plugin-harness.ts'
import { slot, team } from './fixtures/team-presets.ts'
import { executeTool } from './fixtures/execute-tool.ts'

/** Scripted child discovery and execution state projected by the rc2 harness. */
interface MemberRow {
  readonly id: SessionId
  readonly name: string
  readonly role: 'teammate'
  readonly status: 'running' | 'provisioning' | 'inactive' | 'failed'
}

const contexts: Context[] = []
const temporary: string[] = []

/** Every mounted harness, so a case that leaves a turn blocked still tears down. */
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
 * One Team definition whose every observable face carries its marker.
 * @param marker - letter distinguishing this definition from its siblings.
 * @param member - teammate target this definition declares.
 * @returns the Team preset.
 */
function definition(marker: string, member: string): TeamPreset {
  return {
    ...team([slot({ name: member, description: `${marker} member` })], {
      name: `captain-${marker}`,
      systemPrompt: `Captain prompt ${marker}`,
      toolMode: 'custom',
      tools: [ALLOWED_TOOL, 'spawn_team_member', 'get_team_preset', 'update_team_preset'],
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
 * The same Team definition, with its single member routed.
 *
 * A member route is what a Settings save corrects when a model is unreachable,
 * so the cases below drive it separately from the definition itself.
 * @param preset - the definition to route.
 * @param provider - provider route id the member moves to.
 * @param model - provider-owned model id the member moves to.
 * @returns the definition carrying the route.
 */
function withRoute(preset: TeamPreset, provider: string, model: string): TeamPreset {
  const [member] = preset.members
  if (member === undefined) throw new Error('the fixture Team declares no member')
  return { ...preset, members: [{ ...member, provider, model }] }
}

/**
 * A model route that blocks until the test releases it, so an Agent stays in
 * its running phase for as long as a case needs to observe the freeze.
 */
class GatedAdapter extends LlmAdapter {
  private gates: (() => void)[] = []
  private failNext = false
  private opened = false

  override resolveModel(provider: string, model: string): Promise<LlmResolvedModelInfo> {
    return Promise.resolve({ provider, id: model, name: model })
  }

  async * stream(_options: GenerateOptions): AsyncIterable<StreamChunk> {
    if (this.failNext) {
      this.failNext = false
      throw new Error('the fixture model failed')
    }
    // A model call started before the release blocks; every later one proceeds,
    // because a released Agent may still reach the model again before it idles.
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

  /** Make the next model call fail instead of answering. */
  breakNext(): void {
    this.failNext = true
  }
}

/** Writable stand-in for one volatile Config reference. */
function volatileRef<T>(initial: T): { ref: { get: () => T }; set: (next: T) => void } {
  let current = initial
  return { ref: { get: () => current }, set: (next) => { current = next } }
}

/** One scripted roster row for a teammate of a Session. */
function teammate(status: MemberRow['status'], name = 'member-1'): MemberRow {
  return { id: SessionId(name), name, role: 'teammate', status }
}

/** One `spawn_team_member` call the subagent double recorded. */
type SpawnCall = (spec: SubagentActivationSpec) => Promise<SubagentActivation>

interface Harness {
  readonly ctx: Context
  readonly config: Config
  readonly adapter: GatedAdapter
  /** The durable member snapshot unit this Team's members are frozen into. */
  readonly storage: MemberStorage
  readonly startActivation: ReturnType<typeof vi.fn<SpawnCall>>
  /** The mounted plugin fiber, so a case can dispose it like the Loader would. */
  readonly fiber: { dispose(): Promise<void> }
  /** Create one live Session-root Agent. */
  readonly create: (id: string) => Promise<Agent>
  /** Publish a stored Teams value and announce the volatile update. */
  readonly teams: (next: readonly TeamPreset[]) => void
  /** Publish the Session selections and announce the volatile update. */
  readonly selections: (next: readonly TeamSelectionRecord[]) => void
  /** Replace the roster rows one Session's subagent double reports. */
  readonly teammates: (sessionId: string, rows: readonly MemberRow[]) => void
  /** Append one durable `subagent/catalog` settlement to a Session's journal feed. */
  readonly rosterEvent: (agent: Agent) => void
  /** Wake one Agent into a turn that stays running until {@link release}. */
  readonly wake: (agent: Agent) => void
  /** Let every blocked turn finish and wait for the Agents to settle idle. */
  readonly release: () => Promise<void>
  /** Dispose one Session exactly as its owner would. */
  readonly disposeAgent: (agent: Agent) => Promise<void>
}

/** Mount the plugin over a scripted subagent service, settings document, and model route. */
async function setup(options: {
  teams: readonly TeamPreset[]
  selections: readonly TeamSelectionRecord[]
}): Promise<Harness> {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })

  const adapter = new GatedAdapter()
  ctx.llm.registerAdapter(['fixture'], adapter)
  // Several cases below route a member to `deepseek`: a member route is
  // preflighted against the live registry before anything durable is written,
  // so the deployment has to register the route the Team configures.
  ctx.llm.registerAdapter(['deepseek'], adapter)

  // Two global tools, so a captain allow-list can be seen to include and exclude.
  for (const name of [ALLOWED_TOOL, DENIED_TOOL]) {
    ctx.tools.register({
      name,
      description: `${name} probe`,
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [{ type: 'text', text: name }] },
      async execute() { return name },
    })
  }

  const rows = new Map<string, readonly MemberRow[]>()
  const startActivation = vi.fn<SpawnCall>(async spec => acceptedActivation(spec))
  mountSubagentDouble(ctx, {
    startActivation,
    members: agent => rows.get(agent.session.id) ?? [],
  })

  const storeRoot = await mkdtemp(join(tmpdir(), 'team-presets-freeze-store-'))
  temporary.push(storeRoot)
  const storage = await mountMemberStorage(ctx, storeRoot)

  const teamsRef = volatileRef<readonly TeamPreset[]>(options.teams)
  const selectionsRef = volatileRef<readonly TeamSelectionRecord[]>(options.selections)
  ctx.provide('settings', {
    configure: vi.fn(() => () => {}),
    describe: vi.fn(() => [{ ns: 'agent-team-presets', revision: 0 }]),
    update: vi.fn(async () => {}),
  })

  const config = {
    teams: teamsRef.ref,
    selections: selectionsRef.ref,
    freshProvider: 'spawn',
    seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] },
    forkProvider: 'fork',
  } satisfies Config
  const fiber = await ctx.plugin(Object.assign((inner: Context) => { apply(inner, config) }, { inject }))

  const agents: Agent[] = []
  const handles = new Map<Agent, { dispose(): Promise<void> }>()
  const harness: Harness = {
    ctx,
    config,
    adapter,
    storage,
    startActivation,
    fiber,
    create: async (id) => {
      const handle = await ctx.agents.create({
        sessionId: SessionId(id),
        agentOptions: { provider: 'fixture', model: 'fixture' },
      })
      agents.push(handle.agent)
      handles.set(handle.agent, handle)
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
      agent.session.append('subagent/catalog', {
        version: 3, childId: SessionId('member-1'), name: 'member-1',
        childCreatedAt: 0, mode: 'continuable', label: 'member settlement',
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

/** Let the microtask-coalesced roster read and any pending promise run. */
async function flush(): Promise<void> {
  await new Promise<void>((resolve) => { setTimeout(resolve, 0) })
}

/** Execute the member tool as one captain. */
async function callMemberTool(ctx: Context, agent: Agent, args: object) {
  return await executeTool(ctx, {
    callId: ToolCallId('spawn-member'),
    name: 'spawn_team_member',
    arguments: args,
    agent,
    signal: new AbortController().signal,
  })
}

/** Execute one preset tool as one captain and read its canonical payload. */
async function callPresetTool(ctx: Context, agent: Agent, name: string, args: object) {
  const result = await executeTool(ctx, {
    callId: ToolCallId(name),
    name,
    arguments: args,
    agent,
    signal: new AbortController().signal,
  })
  return {
    isError: result.isError,
    text: result.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join(''),
    value: JSON.parse(result.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join('') || '{}') as Record<string, unknown>,
  }
}

/** Concatenated text of one tool result. */
function resultText(result: { content: readonly { type: string; text?: string }[] }): string {
  return result.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join('')
}

/** One Team selected by one Session, the shape every case below starts from. */
const SELECTED: readonly TeamSelectionRecord[] = [{ sessionId: 's1', teamId: 'team-1' }]

describe('a running Team task keeps its definition', () => {
  it('keeps the captain on A while it runs, then adopts the saved B once idle', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    const initial = await applied(h.ctx, captain)
    expect(initial.persona).toBe('Captain prompt A')
    expect(initial.tools).toContain('spawn_team_member')
    expect(initial.tools).toContain(ALLOWED_TOOL)

    h.wake(captain)
    expect(captain.status).toBe('running')
    h.teams([definition('B', 'beta')])

    // Every face of the running task still comes from A: persona, briefing,
    // member roster, and the captain's own tool scope.
    const frozen = await applied(h.ctx, captain)
    expect(frozen.persona).toBe('Captain prompt A')
    expect(frozen.briefing).toContain('alpha')
    expect(frozen.briefing).not.toContain('beta')
    expect(frozen.description).toContain('alpha')
    expect(frozen.description).not.toContain('beta')
    expect(frozen.tools).toContain(ALLOWED_TOOL)
    expect(frozen.tools).not.toContain(DENIED_TOOL)

    await h.release()
    expect(captain.status).toBe('idle')
    // Adoption is a queued job: the idle edge only schedules it.
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
    expect((await applied(h.ctx, captain)).description).toContain('beta')
  })

  it('keeps A while a teammate runs and the captain is idle', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.teammates('s1', [teammate('running')])

    h.teams([definition('B', 'beta')])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    // The teammate ends without a live-child status event of its own: the
    // durable journal settlement is what releases the freeze.
    h.teammates('s1', [teammate('inactive')])
    h.rosterEvent(captain)
    await flush()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
  })

  it('adopts after a provisioning teammate settles in the journal', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.teammates('s1', [teammate('provisioning')])

    h.teams([definition('B', 'beta')])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    h.teammates('s1', [teammate('failed')])
    h.rosterEvent(captain)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    await flush()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
  })

  it('keeps A while the captain still runs after every teammate ended', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.teammates('s1', [teammate('running')])
    h.wake(captain)
    h.teams([definition('B', 'beta')])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    h.teammates('s1', [teammate('inactive')])
    h.rosterEvent(captain)
    await flush()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    await h.release()
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
  })

  it('adopts only the last of two definitions saved while the task ran', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.wake(captain)

    h.teams([definition('B', 'beta')])
    h.teams([definition('C', 'gamma')])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    await h.release()
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt C')
    expect((await applied(h.ctx, captain)).persona).not.toBe('Captain prompt B')
  })

  it('adopts the latest definition at the next task start when no idle edge arrived', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    // A teammate that ran the previous task is scripted as finished, but no
    // status or journal edge announces it: the settlement was missed.
    h.teammates('s1', [teammate('inactive')])
    h.wake(captain)
    h.teams([definition('C', 'gamma')])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    await h.release()
    h.teammates('s1', [teammate('inactive')])
    // The next task start re-checks the roster itself, so the missed settlement
    // cannot leave the Session on a stale definition.
    h.wake(captain)
    // The wake-up edge schedules the re-checked application, so it has to drain.
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt C')
    await h.release()
  })

  it('spawns a frozen member during the task and the new one afterwards', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.wake(captain)
    h.teams([definition('C', 'gamma')])

    const frozen = await callMemberTool(h.ctx, captain, { member: 'alpha', task: 'go' })
    expect(frozen.isError).toBe(false)
    const request = h.startActivation.mock.calls[0]?.[0]
    expect(request?.parent.id).toBe(captain.id)
    expect(request).toMatchObject({
      name: 'alpha', provider: 'preset-member-fresh-v1', label: 'A member',
      prompt: [{ type: 'text', text: 'go' }], delivery: 'parent',
    })
    // The frozen member's persona lives in its durable snapshot.
    const record = await memberRecord(h.storage, 'alpha')
    expect(request?.childId).toBe(record?.childSessionId)
    expect(record?.persona).toContain('Team A')
    expect((await callMemberTool(h.ctx, captain, { member: 'gamma', task: 'go' })).isError).toBe(true)

    await h.release()
    await settlePlugin()
    expect((await callMemberTool(h.ctx, captain, { member: 'gamma', task: 'go' })).isError).toBe(false)
    expect((await callMemberTool(h.ctx, captain, { member: 'alpha', task: 'go' })).isError).toBe(true)
  })

  it('freezes and adopts each Session on its own', async () => {
    const selections = [{ sessionId: 's1', teamId: 'team-1' }, { sessionId: 's2', teamId: 'team-1' }]
    const h = await setup({ teams: [definition('A', 'alpha')], selections })
    const busy = await h.create('s1')
    const idle = await h.create('s2')
    h.wake(busy)

    h.teams([definition('B', 'beta')])
    expect((await applied(h.ctx, busy)).persona).toBe('Captain prompt A')
    // Only the idle Session's queued adoption drains here.
    await settlePlugin()
    expect((await applied(h.ctx, idle)).persona).toBe('Captain prompt B')
    await h.release()
  })

  it('does not release a busy Session when its selection or Team changes', async () => {
    const h = await setup({ teams: [definition('A', 'alpha'), definition('B', 'beta')], selections: SELECTED })
    const captain = await h.create('s1')
    h.wake(captain)

    // Switching the selection, clearing it, and deleting the Team are all
    // stored changes that must not touch the running definition.
    h.selections([{ sessionId: 's1', teamId: 'team-2' }])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    h.selections([])
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBeDefined()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    h.teams([])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    await h.release()
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBeUndefined()
    expect((await applied(h.ctx, captain)).persona).not.toBe('Captain prompt A')
  })

  it('does not re-register an unchanged definition', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    const installed = h.ctx.tools.get('spawn_team_member', captain)

    h.teams([definition('A', 'alpha')])
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBe(installed)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
  })
})

describe('a member route is read when the member is spawned', () => {
  it('uses a route saved during the running task for the next member it summons', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.wake(captain)
    // The definition is untouched: only the route of the member it declares moves.
    h.teams([withRoute(definition('A', 'alpha'), 'deepseek', 'deepseek-reasoner')])

    const spawn = await callMemberTool(h.ctx, captain, { member: 'alpha', task: 'go' })
    expect(spawn.isError).toBe(false)
    // Recovery work reaches the member this task summons, without a restart...
    expect((await memberRecord(h.storage, 'alpha'))?.route)
      .toMatchObject({ provider: 'deepseek', model: 'deepseek-reasoner' })
    // ...while the definition the task started with still owns everything else.
    expect((await memberRecord(h.storage, 'alpha'))?.persona).toContain('Team A')
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    await h.release()
  })

  it('does not re-register the application, and routes the next spawn, when only the route changed', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    const installed = h.ctx.tools.get('spawn_team_member', captain)

    h.teams([withRoute(definition('A', 'alpha'), 'deepseek', 'deepseek-chat')])
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBe(installed)

    await callMemberTool(h.ctx, captain, { member: 'alpha', task: 'go' })
    expect((await memberRecord(h.storage, 'alpha'))?.route)
      .toMatchObject({ provider: 'deepseek', model: 'deepseek-chat' })
  })

  it('keeps the frozen route when the stored Team no longer carries the member', async () => {
    const routed = withRoute(definition('A', 'alpha'), 'deepseek', 'deepseek-chat')
    const h = await setup({ teams: [routed], selections: SELECTED })
    const captain = await h.create('s1')
    h.wake(captain)
    // The stored Team keeps its identity but replaced its roster mid-task.
    h.teams([definition('B', 'beta')])

    const spawn = await callMemberTool(h.ctx, captain, { member: 'alpha', task: 'go' })
    expect(spawn.isError).toBe(false)
    expect((await memberRecord(h.storage, 'alpha'))?.route)
      .toMatchObject({ provider: 'deepseek', model: 'deepseek-chat' })
    await h.release()
  })

  it('still freezes the definition itself against the same save', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.wake(captain)

    h.teams([withRoute(definition('C', 'gamma'), 'deepseek', 'deepseek-chat')])
    const frozen = await applied(h.ctx, captain)
    expect(frozen.persona).toBe('Captain prompt A')
    expect(frozen.briefing).toContain('alpha')
    expect(frozen.briefing).not.toContain('gamma')
    expect((await callMemberTool(h.ctx, captain, { member: 'gamma', task: 'go' })).isError).toBe(true)

    await h.release()
    await settlePlugin()
    const adopted = await applied(h.ctx, captain)
    expect(adopted.persona).toBe('Captain prompt C')
    expect(adopted.description).toContain('gamma')
    await callMemberTool(h.ctx, captain, { member: 'gamma', task: 'go' })
    expect((await memberRecord(h.storage, 'gamma'))?.route)
      .toMatchObject({ provider: 'deepseek', model: 'deepseek-chat' })
  })
})

describe('the captain tool scope a Team applies', () => {
  it('counts the Team a Session still has applied after its selection moved on', async () => {
    const other = { ...definition('B', 'beta'), id: 'team-2' }
    const h = await setup({ teams: [definition('A', 'alpha'), other], selections: SELECTED })
    const captain = await h.create('s1')
    // The Team's own teammate still runs, and the Session's selection moved to
    // another Team while the running task kept the first one applied.
    h.teammates('s1', [teammate('running')])
    h.selections([{ sessionId: 's1', teamId: 'team-2' }])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    const write = await callPresetTool(h.ctx, captain, 'update_team_preset', {
      team_id: 'team-1', revision: 0, team_description: 'rewritten mid-run',
    })
    expect(write.value.status).toBe('team-busy')
    expect(write.text).toContain('is executing: 1 member(s)')
    expect(write.text).toContain('keeps the definition it started with')
  })

  it('refuses a tool the allow-list excludes through the executor', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')

    const denied = await executeTool(h.ctx, {
      callId: ToolCallId('denied'), name: DENIED_TOOL, arguments: {}, agent: captain, signal: new AbortController().signal,
    })
    expect(denied.isError).toBe(true)
    expect(resultText(denied)).toContain(DENIED_TOOL)

    const allowed = await executeTool(h.ctx, {
      callId: ToolCallId('allowed'), name: ALLOWED_TOOL, arguments: {}, agent: captain, signal: new AbortController().signal,
    })
    expect(allowed.isError).toBe(false)
  })

  it('keeps the last effective restriction when a stored update is invalid', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    const warn = vi.spyOn(h.ctx.logger, 'warn')

    h.teams([invalidDefinition('B', 'beta')])
    expect(warn.mock.calls.map(call => String(call[0])).join('\n')).toContain('was refused')
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBeDefined()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
    const denied = await executeTool(h.ctx, {
      callId: ToolCallId('invalid-update-denied'), name: DENIED_TOOL, arguments: {}, agent: captain, signal: new AbortController().signal,
    })
    expect(denied.isError).toBe(true)

    // Fixing the stored Team restores the Session.
    h.teams([definition('B', 'beta')])
    // The refused save left no application behind, so the recovery is applied
    // by a queued job that has to drain before the restored face is observable.
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
  })
})

describe('application lifecycle across status edges', () => {
  it('does not lift a frozen policy mid-turn when No team is selected, then restores ordinary tools', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.wake(captain)
    h.selections([])
    const call = () => executeTool(h.ctx, { callId: ToolCallId('deselect'), name: DENIED_TOOL, arguments: {}, agent: captain, signal: new AbortController().signal })
    expect((await call()).isError).toBe(true)
    expect(h.ctx.tools.get('get_team_preset', captain)).toBeDefined()
    await h.release()
    expect((await call()).isError).toBe(false)
    // Deselection lifts the Team policy; the discovery tools stay.
    expect(h.ctx.tools.get('get_team_preset', captain)).toBeDefined()
    expect(h.ctx.tools.get('update_team_preset', captain)).toBeDefined()
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBeUndefined()
  })

  it('quarantines a first invalid application instead of exposing default tools', async () => {
    const h = await setup({ teams: [invalidDefinition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    const denied = await executeTool(h.ctx, { callId: ToolCallId('initial-invalid'), name: DENIED_TOOL, arguments: {}, agent: captain, signal: new AbortController().signal })
    expect(denied.isError).toBe(true)
    // The refusal is the actionable one: the allow-list names a capability this
    // Session cannot reach, and that reason is what the quarantined Session reads.
    expect(resultText(denied)).toContain('names capabilities this Session cannot reach')
    h.teams([definition('A', 'alpha')])
    // The quarantine is only released once the replacement application's
    // queued job has installed its tool scope.
    await settlePlugin()
    const allowed = await executeTool(h.ctx, { callId: ToolCallId('recovered'), name: ALLOWED_TOOL, arguments: {}, agent: captain, signal: new AbortController().signal })
    expect(allowed.isError).toBe(false)
  })

  it('retains restrictions after a partial registration failure', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    const register = vi.spyOn(captain.ctx.tools, 'register').mockImplementationOnce(() => { throw new Error('partial registration failure') })
    h.teams([definition('B', 'beta')])
    // The application is queued in 0.2.2: the failing registration only happens
    // once that job runs, so the mock must stay armed until it does.
    await settlePlugin()
    register.mockRestore()
    const denied = await executeTool(h.ctx, { callId: ToolCallId('partial-denied'), name: DENIED_TOOL, arguments: {}, agent: captain, signal: new AbortController().signal })
    expect(denied.isError).toBe(true)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')
  })

  it('quarantines a remounted running Session until its task boundary', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.wake(captain)
    const widened = definition('B', 'beta')
    widened.captain.tools = [...widened.captain.tools, DENIED_TOOL]
    h.teams([widened])
    await h.fiber.dispose()
    const restarted = await h.ctx.plugin(Object.assign((inner: Context) => { apply(inner, h.config) }, { inject }))
    const execute = (name: string) => executeTool(h.ctx, { callId: ToolCallId('busy-reload'), name, arguments: {}, agent: captain, signal: new AbortController().signal })
    expect((await execute(DENIED_TOOL)).isError).toBe(true)
    expect((await execute(ALLOWED_TOOL)).isError).toBe(true)
    await h.release()
    // The restarted mount adopts the stored definition through its own queued job.
    await settlePlugin()
    expect((await execute(DENIED_TOOL)).isError).toBe(false)
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
    await restarted.dispose()
  })

  it('adopts the latest definition after a failed turn', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.adapter.breakNext()
    h.wake(captain)
    h.teams([definition('B', 'beta')])
    await captain.whenIdle()
    // The idle edge after a failed turn only schedules the adoption.
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
  })

  it('adopts the latest definition after a cancelled turn', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.wake(captain)
    h.teams([definition('B', 'beta')])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    captain.cancel({ kind: 'user' })
    h.adapter.open()
    await captain.whenIdle()
    // The idle edge after a cancelled turn only schedules the adoption.
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
  })

  it('releases everything with the plugin, and adopts again after a restart', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.wake(captain)

    await h.fiber.dispose()
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBeUndefined()
    expect(h.ctx.tools.schemas(captain).map(schema => schema.name)).toContain(DENIED_TOOL)

    // A disposed plugin keeps no listener: a later stored change registers nothing.
    h.teams([definition('B', 'beta')])
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBeUndefined()

    await h.release()
    const restarted = await h.ctx.plugin(Object.assign((inner: Context) => { apply(inner, h.config) }, { inject }))
    // The fresh mount applies the stored definition through its queued job.
    await settlePlugin()
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
    await restarted.dispose()
  })

  it('releases the application when its Session is disposed mid-task', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.wake(captain)
    h.teams([definition('B', 'beta')])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt A')

    // Disposal mid-task releases the frozen application and registers nothing
    // for the definition that arrived while the task ran.
    await h.disposeAgent(captain)
    h.adapter.open()
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBeUndefined()
    h.teams([definition('C', 'gamma')])
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBeUndefined()
  })

  it('mounts beside an already-live unmanaged child by quarantining it, never by throwing', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    await mountAgentLoopTestDependencies(ctx)
    await ctx.plugin(AgentLoop, { agents: [] })
    const adapter = new GatedAdapter()
    ctx.llm.registerAdapter(['fixture'], adapter)
    for (const name of [ALLOWED_TOOL, DENIED_TOOL]) ctx.tools.register({
      name,
      description: `${name} probe`,
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [{ type: 'text', text: name }] },
      async execute() { return name },
    })
    let root!: Agent
    ctx.provide('settings', {
      configure: () => () => {},
      describe: () => [{ ns: 'agent-team-presets', revision: 0 }],
      update: async () => {},
    })
    // An unpublished ordinary child has no subagent membership yet.
    mountSubagentDouble(ctx)
    root = (await ctx.agents.create({ sessionId: SessionId('s1'), agentOptions: { provider: 'fixture', model: 'fixture' } })).agent
    const child = (await ctx.agents.create({
      sessionId: SessionId('child'),
      meta: { parentSession: root.session.id, origin: 'subagent' },
      agentOptions: { provider: 'fixture', model: 'fixture' },
    })).agent
    const config = {
      teams: { get: () => [definition('A', 'alpha')] },
      selections: { get: () => SELECTED },
      freshProvider: 'spawn',
      seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] },
      forkProvider: 'fork',
    } satisfies Config

    // The creation veto belongs to the serial `agent/created` transaction. An
    // activation that already installed root registrations must not throw here,
    // because those registrations live on `agent.ctx` and would leak.
    const fiber = await ctx.plugin(Object.assign((inner: Context) => { apply(inner, config) }, { inject }))
    const denied = await executeTool(ctx, {
      callId: ToolCallId('child-quarantined'), name: DENIED_TOOL, arguments: {}, agent: child,
      signal: new AbortController().signal,
    })
    expect(denied.isError).toBe(true)
    expect((await executeTool(ctx, {
      callId: ToolCallId('root-allowed'), name: ALLOWED_TOOL, arguments: {}, agent: root,
      signal: new AbortController().signal,
    })).isError).toBe(false)

    // The teardown owner must drain every registration the mount installed.
    await fiber.dispose()
    expect(ctx.tools.get('spawn_team_member', root)).toBeUndefined()
    expect(ctx.tools.get('get_team_preset', root)).toBeUndefined()
  })
})
