/**
 * The Team-task freeze: a Session keeps the Team definition its task started
 * with — captain persona, briefing, member roster, and tool scope as one
 * snapshot — and adopts the latest stored definition between Team tasks.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
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
import { slot, team } from './fixtures/team-presets.ts'

const contexts: Context[] = []

/** Every mounted harness, so a case that leaves a turn blocked still tears down. */
const harnesses: Harness[] = []

afterEach(async () => {
  for (const harness of harnesses.splice(0)) harness.adapter.open()
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
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
      tools: [ALLOWED_TOOL],
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
function teammate(status: TeamMemberView['status'], name = 'member-1'): TeamMemberView {
  return { id: SessionId(name), name, role: 'teammate', status, diagnostics: [] }
}

/** One `spawn_team_member` call the fake Team service recorded. */
type SpawnCall = (caller: Agent, request: SpawnTeammateRequest) => Promise<{ member: { name: string; status: 'active' } }>

interface Harness {
  readonly ctx: Context
  readonly config: Config
  readonly adapter: GatedAdapter
  readonly spawnTeammate: ReturnType<typeof vi.fn<SpawnCall>>
  /** The mounted plugin fiber, so a case can dispose it like the Loader would. */
  readonly fiber: { dispose(): Promise<void> }
  /** Create one live Session-root Agent. */
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
}

/** Mount the plugin over a scripted Team service, settings document, and model route. */
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

  const roots = new Set<Agent>()
  const rows = new Map<string, readonly TeamMemberView[]>()
  const spawnTeammate = vi.fn<SpawnCall>(async (_caller, request) => ({
    member: { name: request.name, status: 'active' },
  }))
  ctx.provide('agentTeams', {
    spawnTeammate,
    tryMembership: (agent: Agent) => roots.has(agent)
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
    forkProvider: 'fork',
  } satisfies Config
  const fiber = await ctx.plugin(Object.assign((inner: Context) => { apply(inner, config) }, { inject }))

  const agents: Agent[] = []
  const handles = new Map<Agent, { dispose(): Promise<void> }>()
  const harness: Harness = {
    ctx,
    config,
    adapter,
    spawnTeammate,
    fiber,
    create: async (id) => {
      const handle = await ctx.agents.create({
        sessionId: SessionId(id),
        agentOptions: { provider: 'fixture', model: 'fixture' },
      })
      roots.add(handle.agent)
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
  return await ctx.tools.execute({
    callId: ToolCallId('spawn-member'),
    name: 'spawn_team_member',
    arguments: args,
    agent,
    signal: new AbortController().signal,
  })
}

/** Execute one preset tool as one captain and read its canonical payload. */
async function callPresetTool(ctx: Context, agent: Agent, name: string, args: object) {
  const result = await ctx.tools.execute({
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
    const request = h.spawnTeammate.mock.calls[0]?.[1]
    expect(request?.name).toBe('alpha')
    expect(request?.persona).toContain('Team A')
    expect((await callMemberTool(h.ctx, captain, { member: 'gamma', task: 'go' })).isError).toBe(true)

    await h.release()
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
    const request = h.spawnTeammate.mock.calls[0]?.[1]
    // Recovery work reaches the member this task summons, without a restart...
    expect(request?.agentOptions).toMatchObject({ provider: 'deepseek', model: 'deepseek-reasoner' })
    // ...while the definition the task started with still owns everything else.
    expect(request?.persona).toContain('Team A')
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
    expect(h.spawnTeammate.mock.calls[0]?.[1]?.agentOptions)
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
    expect(h.spawnTeammate.mock.calls[0]?.[1]?.agentOptions)
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
    const adopted = await applied(h.ctx, captain)
    expect(adopted.persona).toBe('Captain prompt C')
    expect(adopted.description).toContain('gamma')
    await callMemberTool(h.ctx, captain, { member: 'gamma', task: 'go' })
    expect(h.spawnTeammate.mock.calls.at(-1)?.[1]?.agentOptions)
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

    const denied = await h.ctx.tools.execute({
      callId: ToolCallId('denied'), name: DENIED_TOOL, arguments: {}, agent: captain, signal: new AbortController().signal,
    })
    expect(denied.isError).toBe(true)
    expect(resultText(denied)).toContain(DENIED_TOOL)

    const allowed = await h.ctx.tools.execute({
      callId: ToolCallId('allowed'), name: ALLOWED_TOOL, arguments: {}, agent: captain, signal: new AbortController().signal,
    })
    expect(allowed.isError).toBe(false)
  })

  it('reports a preset this Session cannot apply instead of keeping the old one', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    const warn = vi.spyOn(h.ctx.logger, 'warn')

    h.teams([invalidDefinition('B', 'beta')])
    expect(warn.mock.calls.map(call => String(call[0])).join('\n')).toContain('was refused')
    // The Session does not keep running the definition the Host replaced, and
    // no half-applied registration survives the refusal.
    expect(h.ctx.tools.get('spawn_team_member', captain)).toBeUndefined()
    expect(h.ctx.tools.schemas(captain).map(schema => schema.name)).toContain(DENIED_TOOL)

    // Fixing the stored Team restores the Session.
    h.teams([definition('B', 'beta')])
    expect((await applied(h.ctx, captain)).persona).toBe('Captain prompt B')
  })
})

describe('application lifecycle across status edges', () => {
  it('adopts the latest definition after a failed turn', async () => {
    const h = await setup({ teams: [definition('A', 'alpha')], selections: SELECTED })
    const captain = await h.create('s1')
    h.adapter.breakNext()
    h.wake(captain)
    h.teams([definition('B', 'beta')])
    await captain.whenIdle()
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
})
