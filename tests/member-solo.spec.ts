/**
 * Individual member chat: the Session runs AS one configured member.
 *
 * The member's role card becomes the deployment persona, its tool policy scopes
 * the Session's tools, no captain briefing or member-summon tool is installed,
 * and the member's configured route becomes the Session's model selection. A
 * captain selection keeps the existing behavior and never changes the model.
 *
 * These cases mount the plugin's real `apply()` over the real Agent loop,
 * settings/config references, and member storage stack, then drive the same
 * volatile-update edges the Loader emits.
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
import { LlmAdapter, ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, LlmResolvedModelInfo, StreamChunk } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt'
import { apply, inject } from '../src/index.ts'
import type { Config } from '../src/config.ts'
import type { TeamPreset, TeamSelectionRecord } from '../src/types.ts'
import { BUILTIN_TEAM_IDS } from '../src/builtin-teams.ts'
import { mountMemberStorage } from './fixtures/member-storage.ts'
import type { MemberStorage } from './fixtures/member-storage.ts'
import { executeTool } from './fixtures/execute-tool.ts'
import { settlePlugin, mountSubagentDouble } from './fixtures/plugin-harness.ts'
import { slot, team } from './fixtures/team-presets.ts'

const contexts: Context[] = []
const temporary: string[] = []
const harnesses: Harness[] = []

afterEach(async () => {
  for (const harness of harnesses.splice(0)) harness.adapter.open()
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
  for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true })
})

/** Global tool the member policy allows. */
const ALLOWED_TOOL = 'probe_allowed'
/** Global tool no member policy names, so a restriction must hide it. */
const DENIED_TOOL = 'probe_denied'

/** The member route every routed fixture uses. */
const MEMBER_ROUTE = { provider: 'deepseek', model: 'member-model' } as const

/**
 * A model adapter that blocks its first call until the test releases it.
 *
 * A Session whose model call is blocked is `running`, which is the only state
 * the freeze rule is about.
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
    for (const gate of this.gates.splice(0)) gate()
  }
}

/** Writable stand-in for one volatile Config reference. */
function volatileRef<T>(initial: T): { ref: { get: () => T }; set: (next: T) => void } {
  let current = initial
  return { ref: { get: () => current }, set: (next) => { current = next } }
}

interface Harness {
  readonly ctx: Context
  readonly adapter: GatedAdapter
  readonly storage: MemberStorage
  readonly fiber: { dispose(): Promise<void> }
  readonly create: (id: string) => Promise<Agent>
  readonly teams: (next: readonly TeamPreset[]) => void
  readonly selections: (next: readonly TeamSelectionRecord[]) => void
  readonly wake: (agent: Agent) => void
  readonly release: () => Promise<void>
}

/** Mount the plugin over scripted settings, a subagent service double, and a model route. */
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
  // A member route is validated against the live registry before the Session
  // model changes, so the deployment must register the route the Team configures.
  ctx.llm.registerAdapter(['deepseek'], adapter)

  for (const name of [ALLOWED_TOOL, DENIED_TOOL]) {
    ctx.tools.register({
      name,
      description: `${name} probe`,
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [{ type: 'text', text: name }] },
      async execute() { return name },
    })
  }

  mountSubagentDouble(ctx)

  const storeRoot = await mkdtemp(join(tmpdir(), 'team-presets-solo-store-'))
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
    adapter,
    storage,
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
    wake: (agent) => {
      agent.followup(createUserMessage({ content: [{ type: 'text', text: 'work' }], source: { kind: 'user' } }))
    },
    release: async () => {
      adapter.open()
      for (const agent of agents) await agent.whenIdle()
    },
  }
  harnesses.push(harness)
  return harness
}

/** One Team whose member is individually addressable and routed. */
function soloTeam(): TeamPreset {
  return {
    ...team([
      slot({
        id: 'role-1',
        name: 'reviewer',
        description: 'checks diffs',
        systemPrompt: 'Review prompt',
        provider: MEMBER_ROUTE.provider,
        model: MEMBER_ROUTE.model,
        toolMode: 'custom',
        tools: [ALLOWED_TOOL],
      }),
    ], { name: 'team-lead', description: 'leads the team', systemPrompt: 'Captain prompt' }),
    id: 'team-1',
    name: 'Solo Team',
    description: 'ships one feature',
  }
}

/** Every model-visible face of the application one Session currently has. */
async function applied(ctx: Context, agent: Agent) {
  const assembly = await ctx.systemPrompt.assemble(assembleContextFor(agent))
  return {
    persona: assembly.sections.find(section => section.name === PERSONA_PREFIX_SECTION)?.text,
    briefing: assembly.sections.find(section => section.name === 'agent-team-presets:briefing')?.text,
    spawnTool: ctx.tools.get('spawn_team_member', agent),
    tools: ctx.tools.schemas(agent).map(schema => schema.name),
    model: agent.model.current(),
  }
}

/** Run one probe tool as the Session and read the denial text. */
async function probe(ctx: Context, agent: Agent, name: string) {
  return executeTool(ctx, {
    callId: ToolCallId(`probe-${name}`),
    name,
    arguments: {},
    agent,
    signal: new AbortController().signal,
  })
}

/** Text of one tool result. */
function resultText(result: { content: readonly { type: string; text?: string }[] }): string {
  return result.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join('')
}

/** Let coalesced microtasks and the application job settle. */
async function flush(): Promise<void> {
  await settlePlugin()
}

describe('individual member chat', () => {
  it('injects the member role card and tool policy, omits the captain surface, and selects its route', async () => {
    const h = await setup({ teams: [soloTeam()], selections: [{ sessionId: 's1', teamId: 'team-1', roleId: 'role-1' }] })
    const agent = await h.create('s1')
    await flush()

    const wire = await applied(h.ctx, agent)
    expect(wire.persona).toContain('You are "reviewer" on the Agent Team "Solo Team": ships one feature')
    expect(wire.persona).toContain('Your role: checks diffs')
    expect(wire.persona).toContain('Review prompt')
    expect(wire.persona).toContain('The user is talking with you directly in this Session.')
    expect(wire.briefing).toBeUndefined()
    expect(wire.spawnTool).toBeUndefined()
    expect(wire.tools).toContain(ALLOWED_TOOL)
    expect(wire.tools).not.toContain(DENIED_TOOL)
    expect(wire.model).toMatchObject(MEMBER_ROUTE)

    const denied = await probe(h.ctx, agent, DENIED_TOOL)
    expect(denied.isError).toBe(true)
    expect(resultText(denied)).toContain(DENIED_TOOL)
  })

  it('keeps the Session model for a captain-led selection', async () => {
    const h = await setup({ teams: [soloTeam()], selections: [{ sessionId: 's1', teamId: 'team-1' }] })
    const agent = await h.create('s1')
    await flush()

    const wire = await applied(h.ctx, agent)
    expect(wire.persona).toBe('Captain prompt')
    expect(wire.briefing).toContain('Team preset "Solo Team"')
    expect(wire.spawnTool).toBeDefined()
    expect(wire.model).toMatchObject({ provider: 'fixture', model: 'fixture' })
  })

  it('switches to the member route on selection, and a captain selection afterwards leaves it there', async () => {
    const h = await setup({ teams: [soloTeam()], selections: [{ sessionId: 's1', teamId: 'team-1' }] })
    const agent = await h.create('s1')
    await flush()
    expect((await applied(h.ctx, agent)).model).toMatchObject({ provider: 'fixture', model: 'fixture' })

    h.selections([{ sessionId: 's1', teamId: 'team-1', roleId: 'role-1' }])
    await flush()
    expect((await applied(h.ctx, agent)).persona).toContain('Review prompt')
    expect((await applied(h.ctx, agent)).model).toMatchObject(MEMBER_ROUTE)

    h.selections([{ sessionId: 's1', teamId: 'team-1' }])
    await flush()
    const captain = await applied(h.ctx, agent)
    expect(captain.persona).toBe('Captain prompt')
    // The captain follows the Session's model; it never resets it.
    expect(captain.model).toMatchObject(MEMBER_ROUTE)
  })

  it('refuses an unusable member route and keeps the previous application and model', async () => {
    const unusable = soloTeam()
    unusable.members = [{ ...unusable.members[0]!, provider: 'missing-provider', model: 'missing-model' }]
    const h = await setup({ teams: [unusable], selections: [{ sessionId: 's1', teamId: 'team-1' }] })
    const agent = await h.create('s1')
    await flush()
    expect((await applied(h.ctx, agent)).persona).toBe('Captain prompt')

    h.selections([{ sessionId: 's1', teamId: 'team-1', roleId: 'role-1' }])
    await flush()
    const wire = await applied(h.ctx, agent)
    expect(wire.persona).toBe('Captain prompt')
    expect(wire.spawnTool).toBeDefined()
    expect(wire.model).toMatchObject({ provider: 'fixture', model: 'fixture' })
  })

  it('fails closed when the selected member no longer exists', async () => {
    const h = await setup({ teams: [soloTeam()], selections: [{ sessionId: 's1', teamId: 'team-1', roleId: 'gone' }] })
    const agent = await h.create('s1')
    await flush()

    const wire = await applied(h.ctx, agent)
    expect(wire.persona ?? '').not.toContain('Review prompt')
    expect(wire.persona ?? '').not.toContain('Captain prompt')
    expect(wire.spawnTool).toBeUndefined()
    const denied = await probe(h.ctx, agent, ALLOWED_TOOL)
    expect(denied.isError).toBe(true)
    expect(resultText(denied)).toContain('Selected member "gone" no longer exists')
  })

  it('re-selects the Session model when a running member route is edited', async () => {
    const h = await setup({ teams: [soloTeam()], selections: [{ sessionId: 's1', teamId: 'team-1', roleId: 'role-1' }] })
    const agent = await h.create('s1')
    await flush()
    expect((await applied(h.ctx, agent)).model).toMatchObject(MEMBER_ROUTE)

    const switched = soloTeam()
    switched.members = [{ ...switched.members[0]!, provider: 'fixture', model: 'switched-model' }]
    h.teams([switched])
    await flush()

    const wire = await applied(h.ctx, agent)
    expect(wire.persona).toContain('Review prompt')
    expect(wire.model).toMatchObject({ provider: 'fixture', model: 'switched-model' })
  })

  it('defers the role and model change until a running task reaches its boundary', async () => {
    const h = await setup({ teams: [soloTeam()], selections: [{ sessionId: 's1', teamId: 'team-1' }] })
    const agent = await h.create('s1')
    await flush()

    h.wake(agent)
    const deadline = Date.now() + 3000
    while (agent.status !== 'running' && Date.now() < deadline) {
      await new Promise<void>((resolve) => { setTimeout(resolve, 5) })
    }
    expect(agent.status).toBe('running')

    h.selections([{ sessionId: 's1', teamId: 'team-1', roleId: 'role-1' }])
    await flush()
    const frozen = await applied(h.ctx, agent)
    expect(frozen.persona).toBe('Captain prompt')
    expect(frozen.model).toMatchObject({ provider: 'fixture', model: 'fixture' })

    await h.release()
    await flush()
    const adopted = await applied(h.ctx, agent)
    expect(adopted.persona).toContain('Review prompt')
    expect(adopted.model).toMatchObject(MEMBER_ROUTE)
  }, 15_000)
})
