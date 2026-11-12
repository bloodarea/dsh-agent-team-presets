/**
 * The boundary contracts this round introduced, driven through the production
 * plugin over the real official stack: the durable member identity marker and
 * its creation veto, the delegation-depth admission, the fixed-route preflight,
 * the strict-policy presentation decision, and the official complete-persona
 * adaptation.
 *
 * Nothing here stubs `startActivation`: every case composes the real Team service,
 * the real continuation manager, real JSONL persistence, and the real storage
 * stack, then drives the plugin's own `apply()` and its `spawn_team_member`
 * tool. The evidence is the member's own model request, the roster, the durable
 * unit on disk, and the effective prompt/tool wire.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { ReasoningEffortId, ToolCallId } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import * as JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import Subagents from '@deepseek-ai/dsh-subagent'
import * as Spawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import TeamService from '@deepseek-ai/dsh-agent-team'
import { bindScopeParent, createScope } from '@deepseek-ai/dsh-scope'
import { PtcRuntime } from '@deepseek-ai/dsh-ptc-runtime'
import type { PtcRunRequest, PtcRunSpec, PtcRunResult } from '@deepseek-ai/dsh-ptc-runtime'
import * as Persona from '@deepseek-ai/dsh-persona'
import * as Presentation from '@deepseek-ai/dsh-agent-tool-presentation'
import * as NativeToolExecutor from '@deepseek-ai/dsh-tool-executor-native'
import * as PtcToolExecutor from '@deepseek-ai/dsh-tool-executor-ptc'
import { apply, inject } from '../src/index.ts'
import { MEMBER_FRESH_PROVIDER } from '../src/member-identity.ts'
import { slot, team } from './fixtures/team-presets.ts'
import { FixtureSessionQuery } from './fixtures/session-query.ts'
import { memberRecords, mountMemberStorage } from './fixtures/member-storage.ts'
import type { MemberStorage } from './fixtures/member-storage.ts'
import { MockAdapter, textResponse } from './fixtures/mock-adapter.ts'
import { disposeRealTeamContext, settlePlugin } from './fixtures/plugin-harness.ts'
import type { TeamPreset } from '../src/types.ts'
import { BUILTIN_TEAM_IDS } from '../src/builtin-teams.ts'
import { executeTool } from './fixtures/execute-tool.ts'

const contexts: Context[] = []
const temporary: string[] = []
const releases: Array<() => void> = []

/** A member route whose first turn stays open, so its residency can be observed. */
class HeldMemberAdapter extends MockAdapter {
  readonly entered: GenerateOptions[] = []
  /**
   * @param gate - resolution that lets the held turn finish.
   */
  constructor(private readonly gate: Promise<void>) {
    super(Array.from({ length: 60 }, () => textResponse('member done')), {
      efforts: MEMBER_EFFORTS, defaultEffort: ReasoningEffortId('low'),
    })
  }
  override async *stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.entered.push(options)
    await this.gate
    yield* super.stream(options)
  }
}

afterEach(async () => {
  for (const release of releases.splice(0)) release()
  for (const ctx of contexts.splice(0).reverse()) await disposeRealTeamContext(ctx)
  for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true })
})

/** One fixture root that is removed after the case. */
async function base(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'team-presets-boundary-'))
  temporary.push(root)
  return root
}

/** Every warning a Host-side spy recorded, with its interpolated arguments. */
function warnings(spy: { mock: { calls: readonly unknown[][] } }): string {
  return spy.mock.calls.map(call => call.map(value => String(value)).join(' ')).join('\n')
}

/** Execute one tool as one Agent. */
async function call(ctx: Context, agent: Agent, name: string, args: object = {}) {
  return executeTool(ctx, {
    callId: ToolCallId(crypto.randomUUID()),
    name,
    arguments: args,
    agent,
    signal: new AbortController().signal,
  })
}

/** Concatenated text of one tool result. */
function resultText(result: { content: readonly { type: string; text?: string }[] }): string {
  return result.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join('')
}

/** Member route with every effort a case may configure. */
const MEMBER_EFFORTS = [
  { id: ReasoningEffortId('low'), name: 'Low' },
  { id: ReasoningEffortId('high'), name: 'High' },
  { id: ReasoningEffortId('max'), name: 'Max' },
]

/** One member slot used by most cases. */
function reviewer(overrides: Partial<TeamPreset['members'][number]> = {}): TeamPreset['members'][number] {
  return slot({
    name: 'reviewer',
    description: 'reviews diffs',
    systemPrompt: 'MEMBER_RULES',
    provider: 'member-route',
    model: 'member-model',
    reasoningEffort: '',
    toolMode: 'custom',
    tools: ['read'],
    ...overrides,
  })
}

/** Compose the official stack, the durable unit, and the production plugin. */
async function stack(root: string, options: {
  maxDepth?: number
  parentDepth?: number
  noStorage?: boolean
  member?: TeamPreset['members'][number]
  captain?: Partial<TeamPreset['captain']>
  /** Skip creating the Lead Agent, so a case can resume the persisted one. */
  deferRoot?: boolean
  /** Hold the member's first turn open, so its residency survives to teardown. */
  hold?: boolean
} = {}) {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx, { workingDirectory: true })
  await ctx.plugin(JsonlSessionPersistence, { root: join(root, 'sessions'), compression: 'none' })
  await ctx.plugin(FixtureSessionQuery)
  const storage: MemberStorage | undefined = options.noStorage === true
    ? undefined
    : await mountMemberStorage(ctx, join(root, 'storage'))
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(Subagents, { maxDepth: options.maxDepth ?? 2 })
  await ctx.plugin(Spawn, { providerName: 'spawn' })
  await ctx.plugin(TeamService)
  const lead = new MockAdapter(Array.from({ length: 60 }, () => textResponse('lead done')))
  let release: () => void = () => {}
  const gate = new Promise<void>((resolve) => { release = resolve })
  if (options.hold !== true) release()
  releases.push(release)
  const member = options.hold === true
    ? new HeldMemberAdapter(gate)
    : new MockAdapter(
        Array.from({ length: 60 }, () => textResponse('member done')),
        { efforts: MEMBER_EFFORTS, defaultEffort: ReasoningEffortId('low') },
      )
  ctx.llm.registerAdapter(['mock'], lead)
  ctx.llm.registerAdapter(['member-route'], member)
  for (const name of ['read', 'write']) {
    ctx.tools.register({
      name,
      description: `${name} fixture`,
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [] },
      async execute() { return `${name} executed` },
    })
  }
  ctx.provide('settings', {
    configure: () => () => {},
    describe: () => [{ ns: 'agent-team-presets', revision: 0 }],
    update: async () => {},
  })
  const definition = team([options.member ?? reviewer()], {
    toolMode: 'all',
    ...options.captain,
  })
  const config = {
    skillRoot: join(root, 'team-skills'),
    teams: { get: () => [definition] },
    selections: { get: () => [{ sessionId: 'lead', teamId: definition.id }] },
    freshProvider: 'spawn',
    seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] },
    forkProvider: 'fork',
  }
  const fiber = await ctx.plugin(Object.assign((owner: Context) => apply(owner, config), { inject }))
  const root_ = options.deferRoot === true
    ? undefined
    : (await ctx.agents.create({
        sessionId: SessionId('lead'),
        agentOptions: {
          provider: 'mock',
          model: 'lead-model',
          ...options.parentDepth === undefined ? {} : { subagentDepth: options.parentDepth },
        },
      })).agent
  // The Team application is queued and awaits the effective prompt assembly
  // before it installs anything (Host 0.2.1), so a case that drives the member
  // tool must first let that job settle.
  await settlePlugin()
  return { ctx, fiber, root: root_ as Agent, lead, member, storage, definition, release }
}

/** The leading teammate row of one Session's roster, when a member was created. */
async function memberRow(h: Awaited<ReturnType<typeof stack>>) {
  return (await h.ctx.subagents.listDescendants(h.root.id)).find(row => row.kind === 'child' && row.mode === 'continuable')
}

describe('durable member identity', () => {
  it('records the plugin execution alias in the child\'s own descriptor', async () => {
    const root = await base()
    const h = await stack(root, { hold: true })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW' })
    expect(resultText(spawn), resultText(spawn)).not.toContain('Error')
    const row = await memberRow(h)
    expect(row).toBeDefined()
    // The child's own durable suffix records the backend it was created through,
    // which is what survives an unreadable snapshot.
    await vi.waitFor(() => expect(h.ctx.agents.get(row!.id)).toBeDefined())
    const child = h.ctx.agents.get(row!.id)!
    const descriptor = child.session.ownEvents().find(event => event.type === 'subagent/descriptor')
    expect((descriptor?.data as { provider?: string } | undefined)?.provider).toBe(MEMBER_FRESH_PROVIDER)
    // The Host's own roster row records the same backend.
    expect(row).toMatchObject({ kind: 'child', parentId: h.root.id, name: 'reviewer' })
    // Drain the held member inside the case: draining it delivers its settlement
    // notice to the Lead, and a Lead turn woken while the context is being
    // disposed can never finish. Let that turn settle before teardown.
    h.release()
    await vi.waitFor(() => expect(h.ctx.agents.get(row!.id)).toBeUndefined())
    await vi.waitFor(() => expect(h.lead.requests.length).toBeGreaterThan(0))
    await h.root.whenIdle()
  }, 20000)

  it('vetoes a marked member whose snapshot was lost instead of resuming it on the Lead route', async () => {
    const root = await base()
    const first = await stack(root)
    const spawned = await call(first.ctx, first.root, 'spawn_team_member', { member: 'reviewer', task: 'FIRST' })
    expect(resultText(spawned)).not.toContain('Error')
    const childId = (await memberRow(first))!.id
    await vi.waitFor(() => expect(first.member.requests.some(request => request.sessionId === childId)).toBe(true))
    await vi.waitFor(() => expect(first.ctx.agents.get(childId)).toBeUndefined())
    const unitPath = first.storage!.unitPath
    await first.ctx.fiber.dispose()
    contexts.splice(contexts.indexOf(first.ctx), 1)
    // The member snapshot is gone; only the Host's own record of the member's
    // execution backend still identifies it as preset-managed.
    await writeFile(unitPath, JSON.stringify({
      unit: { name: 'agent_team_presets_members', version: 1 }, global: null, tables: { members: {} },
    }))

    const second = await stack(root, { deferRoot: true })
    const resumed = (await second.ctx.agents.resume({
      resumeSessionId: SessionId('lead'),
      agentOptions: { provider: 'mock', model: 'lead-model' },
    })).agent
    // Host 0.2.1 awaits the cold resume inside `sendMessage`, so a vetoed
    // creation surfaces as a rejected delivery instead of a queued one. The
    // contract under test is unchanged: the child never runs and is never
    // published on either route.
    await second.ctx.subagents.sendMessage(resumed, childId, [{ type: 'text', text: 'SECOND' }], {
      signal: new AbortController().signal,
    }).catch(() => undefined)
    await settlePlugin()
    // No model request reached the member OR the Lead route for that child, and
    // the child was never published: the creation transaction was vetoed.
    expect(second.member.requests.filter(request => request.sessionId === childId)).toHaveLength(0)
    expect(second.lead.requests.filter(request => request.sessionId === childId)).toHaveLength(0)
    expect(second.ctx.agents.get(childId)).toBeUndefined()
  }, 30000)

  it('vetoes a marked member when the durable unit cannot be opened at all', async () => {
    const root = await base()
    const first = await stack(root)
    const spawned = await call(first.ctx, first.root, 'spawn_team_member', { member: 'reviewer', task: 'FIRST' })
    expect(resultText(spawned)).not.toContain('Error')
    const childId = (await memberRow(first))!.id
    await vi.waitFor(() => expect(first.member.requests.some(request => request.sessionId === childId)).toBe(true))
    await vi.waitFor(() => expect(first.ctx.agents.get(childId)).toBeUndefined())
    await first.ctx.fiber.dispose()
    contexts.splice(contexts.indexOf(first.ctx), 1)

    // The second activation composes no durable member store at all.
    const second = await stack(root, { noStorage: true, deferRoot: true })
    const resumed = (await second.ctx.agents.resume({
      resumeSessionId: SessionId('lead'),
      agentOptions: { provider: 'mock', model: 'lead-model' },
    })).agent
    await second.ctx.subagents.sendMessage(resumed, childId, [{ type: 'text', text: 'SECOND' }], {
      signal: new AbortController().signal,
    }).catch(() => undefined)
    await settlePlugin()
    expect(second.member.requests.filter(request => request.sessionId === childId)).toHaveLength(0)
    expect(second.lead.requests.filter(request => request.sessionId === childId)).toHaveLength(0)
    expect(second.ctx.agents.get(childId)).toBeUndefined()
  }, 30000)

  it('keeps resuming a member whose snapshot is intact', async () => {
    const root = await base()
    const first = await stack(root)
    const spawned = await call(first.ctx, first.root, 'spawn_team_member', { member: 'reviewer', task: 'FIRST' })
    expect(resultText(spawned)).not.toContain('Error')
    const childId = (await memberRow(first))!.id
    await vi.waitFor(() => expect(first.member.requests.some(request => request.sessionId === childId)).toBe(true))
    await vi.waitFor(() => expect(first.ctx.agents.get(childId)).toBeUndefined())
    await first.ctx.fiber.dispose()
    contexts.splice(contexts.indexOf(first.ctx), 1)

    const second = await stack(root, { deferRoot: true })
    const resumed = (await second.ctx.agents.resume({
      resumeSessionId: SessionId('lead'),
      agentOptions: { provider: 'mock', model: 'lead-model' },
    })).agent
    await second.ctx.subagents.sendMessage(resumed, childId, [{ type: 'text', text: 'SECOND' }], {
      signal: new AbortController().signal,
    })
    // The control for the veto cases: with the snapshot intact the member keeps
    // running on its OWN frozen route rather than the Lead's.
    await vi.waitFor(() => expect(second.member.requests.some(request => request.sessionId === childId)).toBe(true))
    expect(second.lead.requests.filter(request => request.sessionId === childId)).toHaveLength(0)
  }, 30000)
})

describe('delegation depth admission', () => {
  it('refuses creation when the deployment disables delegation, before anything durable exists', async () => {
    const root = await base()
    const h = await stack(root, { maxDepth: 0 })
    expect(h.ctx.subagents.resolveMaxDepth()).toBe(0)
    const result = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW' })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('depth 0')
    // A refused creation leaves no intent record, no roster row, and no request.
    expect(await memberRow(h)).toBeUndefined()
    expect(await memberRecords(h.storage!)).toHaveLength(0)
    expect(h.member.requests).toHaveLength(0)
  }, 20000)

  it('refuses a member that would run beyond the configured cap', async () => {
    const root = await base()
    const h = await stack(root, { maxDepth: 2, parentDepth: 2 })
    const result = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW' })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('depth limit 2')
    expect(await memberRow(h)).toBeUndefined()
    expect(await memberRecords(h.storage!)).toHaveLength(0)
    expect(h.member.requests).toHaveLength(0)
  }, 20000)

  it('still creates a member inside the cap', async () => {
    const root = await base()
    const h = await stack(root, { maxDepth: 2, parentDepth: 1 })
    const result = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW' })
    expect(result.isError, resultText(result)).toBe(false)
    expect(await memberRow(h)).toBeDefined()
  }, 20000)
})

describe('fixed-route preflight', () => {
  it('refuses a route whose provider this deployment does not register', async () => {
    const root = await base()
    const h = await stack(root, { member: reviewer({ provider: 'ghost-route', model: 'ghost-model' }) })
    const result = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW' })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('ghost-route/ghost-model')
    expect(resultText(result)).toContain('does not register')
    expect(await memberRow(h)).toBeUndefined()
    expect(await memberRecords(h.storage!)).toHaveLength(0)
    expect(h.member.requests).toHaveLength(0)
  }, 20000)

  it('refuses a reasoning effort the member route does not advertise', async () => {
    const root = await base()
    const h = await stack(root, { member: reviewer({ reasoningEffort: 'nonexistent' }) })
    const result = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW' })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('nonexistent')
    expect(await memberRow(h)).toBeUndefined()
    expect(await memberRecords(h.storage!)).toHaveLength(0)
  }, 20000)

  it('creates the member when the whole route resolves', async () => {
    const root = await base()
    const h = await stack(root, { member: reviewer({ reasoningEffort: 'max' }) })
    const result = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW' })
    expect(result.isError, resultText(result)).toBe(false)
    const row = (await memberRow(h))!
    await vi.waitFor(() => expect(h.member.requests.some(request => request.sessionId === row.id)).toBe(true))
    const request = h.member.requests.find(entry => entry.sessionId === row.id)!
    expect(request.model).toBe('member-model')
    expect(request.reasoningEffort).toBe('max')
  }, 20000)
})

/** Calls real PTC host bindings without evaluating model-authored code. */
class BindingProbeRuntime extends PtcRuntime {
  readonly language = 'typescript'
  readonly isolation = 'offline-binding-probe'
  calls = 0
  resolve(request: PtcRunRequest): PtcRunSpec {
    return { ...request, cwd: request.cwd ?? process.cwd(), timeoutMs: request.timeoutMs ?? 1000 }
  }
  run(spec: PtcRunSpec): Promise<PtcRunResult> {
    void spec
    this.calls += 1
    return Promise.resolve({ logs: [] })
  }
}

/**
 * Compose one Agent whose tool presentation is declared outside its own scope,
 * the way an official Agent preset declares it.
 * @param root - fixture root for the session log.
 * @param mode - presentation the preset scope declares.
 * @param exact - whether the Agent's own scope also declares one.
 * @param completePersona - whether the preset scope declares a complete persona.
 * @param foreignComplete - whether a third party declares an unnamed complete section instead.
 * @returns the context, the Agent, and the preset scope.
 */
async function presentationStack(
  root: string,
  mode: 'native' | 'ptc',
  exact: boolean,
  completePersona = false,
  foreignComplete = false,
) {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx, { workingDirectory: true, tools: { mode: 'native' } })
  await ctx.plugin(JsonlSessionPersistence, { root: join(root, 'sessions'), compression: 'none' })
  await ctx.plugin(BindingProbeRuntime)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(Subagents, { maxDepth: 2 })
  await ctx.plugin(Spawn, { providerName: 'spawn' })
  await ctx.plugin(TeamService)
  ctx.llm.registerAdapter(['mock'], new MockAdapter(Array.from({ length: 20 }, () => textResponse('done'))))
  ctx.llm.registerAdapter(['member-route'], new MockAdapter(Array.from({ length: 20 }, () => textResponse('done')), { efforts: MEMBER_EFFORTS }))
  const bodies: string[] = []
  for (const name of ['read', 'write']) {
    ctx.tools.register({
      name,
      description: `${name} fixture`,
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [] },
      async execute() { bodies.push(name); return `${name} executed` },
    })
  }
  ctx.provide('settings', {
    configure: () => () => {},
    describe: () => [{ ns: 'agent-team-presets', revision: 0 }],
    update: async () => {},
  })
  const agent = (await ctx.agents.create({
    sessionId: SessionId('lead'),
    agentOptions: { provider: 'mock', model: 'lead-model' },
  })).agent
  const presetKey = { fixture: crypto.randomUUID() }
  let preset!: { ctx: Context }
  await ctx.plugin(Object.assign((owner: Context) => {
    preset = createScope(owner, presetKey) as unknown as { ctx: Context }
  }, { inject: ['tools', 'systemPrompt', 'ptcRuntime'] }))
  await preset.ctx.plugin(Presentation, { mode })
  if (completePersona) {
    await preset.ctx.plugin(Persona, {
      prefix: 'MINIMAL_COMPLETE_PERSONA', complete: true, includeRuntimeContext: false,
    })
  }
  if (foreignComplete) {
    preset.ctx.systemPrompt.section({ name: 'third-party:complete', order: 0, text: 'FOREIGN_COMPLETE', complete: true })
  }
  bindScopeParent(agent, presetKey)
  // rc.1 selects a presentation by mounting the executor plugin at that scope;
  // the exact-Agent case is the Agent's own scope declaring one.
  if (exact) await agent.ctx.plugin(mode === 'native' ? NativeToolExecutor : PtcToolExecutor)
  return { ctx, agent, bodies }
}

/** The effective prompt and tool wire of one Agent. */
async function wire(agent: Agent) {
  const assembly = await agent.ctx.systemPrompt.assemble(assembleContextFor(agent))
  return {
    tools: assembly.tools.map(tool => tool.name),
    sections: assembly.sections.map(section => ({ name: section.name, text: section.text })),
  }
}

/** Mount the production plugin over one Agent with a chosen Team. */
async function applyTeam(h: { ctx: Context; agent: Agent }, definition: TeamPreset) {
  const config = {
    teams: { get: () => [definition] },
    selections: { get: () => [{ sessionId: 'lead', teamId: definition.id }] },
    freshProvider: 'spawn',
    seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] },
    forkProvider: 'fork',
  }
  const fiber = await h.ctx.plugin(Object.assign((owner: Context) => apply(owner, config), { inject }))
  await settlePlugin()
  return fiber
}

describe('strict policy presentation', () => {
  it('applies a custom policy through an Agent-owned native executor over inherited PTC', async () => {
    const h = await presentationStack(await base(), 'ptc', false)
    const definition = team([reviewer()], { toolMode: 'custom', tools: ['read'], systemPrompt: 'CAPTAIN' })
    const fiber = await applyTeam(h, definition)
    expect(h.ctx.tools.get('spawn_team_member', h.agent)).toBeDefined()
    const surface = await wire(h.agent)
    expect(surface.tools).toContain('read')
    expect(surface.tools).not.toContain('run_code')
    expect(surface.sections.map(section => section.text)).toContain('CAPTAIN')
    expect((await call(h.ctx, h.agent, 'read')).isError).toBe(false)
    expect((await call(h.ctx, h.agent, 'write')).isError).toBe(true)
    expect((await call(h.ctx, h.agent, 'run_code', { code: 'return 1', description: 'probe' })).isError).toBe(true)
    expect(h.bodies).toEqual(['read'])
    await fiber.dispose()
    // The executor registration belongs to the Agent and survives plugin unload.
    expect((await wire(h.agent)).tools).not.toContain('run_code')
  }, 20000)

  it('refuses a custom Team when the Agent scope already declares the PTC transport', async () => {
    const h = await presentationStack(await base(), 'ptc', true)
    const definition = team([reviewer()], { toolMode: 'custom', tools: ['read'], systemPrompt: 'CAPTAIN' })
    const warn = vi.spyOn(h.ctx.logger, 'warn')
    const fiber = await applyTeam(h, definition)
    // The Team was not applied: no member tool, and the Session keeps its tools
    // denied rather than running a surface the strict policy cannot govern.
    expect(h.ctx.tools.get('spawn_team_member', h.agent)).toBeUndefined()
    expect((await call(h.ctx, h.agent, 'read')).isError).toBe(true)
    expect(warnings(warn)).toContain('refused')
    await fiber.dispose()
  }, 20000)

  it('leaves an all-tools Team on the preset PTC presentation', async () => {
    const h = await presentationStack(await base(), 'ptc', false)
    const definition = team([reviewer()], { toolMode: 'all', tools: [], systemPrompt: 'CAPTAIN' })
    const fiber = await applyTeam(h, definition)
    expect((await wire(h.agent)).tools).toContain('run_code')
    await fiber.dispose()
  }, 20000)
})

describe('complete deployment persona', () => {
  it('keeps the Team briefing visible beside an active complete persona', async () => {
    const h = await presentationStack(await base(), 'native', false, true)
    const definition = team([reviewer()], { toolMode: 'all', tools: [], systemPrompt: '' })
    const fiber = await applyTeam(h, definition)
    const surface = await wire(h.agent)
    const texts = surface.sections.map(section => section.text)
    expect(texts).toContain('MINIMAL_COMPLETE_PERSONA')
    expect(surface.sections.some(section => section.name === 'agent-team-presets:briefing')).toBe(true)
    // The preset's own tool set is untouched: nothing was added to reach it.
    expect(surface.tools).toContain('read')
    await fiber.dispose()
  }, 20000)

  it('refuses a Team when a third party owns the active complete section', async () => {
    const h = await presentationStack(await base(), 'native', false, false, true)
    const definition = team([reviewer()], { toolMode: 'all', tools: [], systemPrompt: '' })
    const warn = vi.spyOn(h.ctx.logger, 'warn')
    const fiber = await applyTeam(h, definition)
    expect(h.ctx.tools.get('spawn_team_member', h.agent)).toBeUndefined()
    expect(warnings(warn)).toContain('third-party:complete')
    await fiber.dispose()
  }, 20000)

  it('leaves an unselected Session completely untouched', async () => {
    const h = await presentationStack(await base(), 'native', false, false)
    const config = {
      teams: { get: () => [] as TeamPreset[] },
      selections: { get: () => [] as { sessionId: string; teamId: string }[] },
      freshProvider: 'spawn',
      seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] },
      forkProvider: 'fork',
    }
    const fiber = await h.ctx.plugin(Object.assign((owner: Context) => apply(owner, config), { inject }))
    await settlePlugin()
    expect((await call(h.ctx, h.agent, 'read')).isError).toBe(false)
    expect(h.ctx.tools.get('get_team_preset', h.agent)).toBeDefined()
    await fiber.dispose()
  }, 20000)
})

describe('session capability preflight', () => {
  it('refuses an allow-list naming a capability this Session cannot reach', async () => {
    const h = await presentationStack(await base(), 'native', false)
    const definition = team([], { toolMode: 'custom', tools: ['ghost_tool'] })
    const warn = vi.spyOn(h.ctx.logger, 'warn')
    const fiber = await applyTeam(h, definition)
    expect(h.ctx.tools.get('spawn_team_member', h.agent)).toBeUndefined()
    const logged = warnings(warn)
    expect(logged).toContain('ghost_tool')
    expect(logged).toContain('cannot reach')
    await fiber.dispose()
  }, 20000)

  it('does not add a missing capability to make the allow-list work', async () => {
    const h = await presentationStack(await base(), 'native', false)
    // `write` exists in this deployment, so a Team naming only `read` applies
    // and the missing `write` stays missing rather than being registered.
    const definition = team([], { toolMode: 'custom', tools: ['read'] })
    const fiber = await applyTeam(h, definition)
    expect(h.ctx.tools.get('spawn_team_member', h.agent)).toBeDefined()
    expect((await call(h.ctx, h.agent, 'write')).isError).toBe(true)
    await fiber.dispose()
  }, 20000)
})

describe('ordered teardown', () => {
  // rc.2 removed drainChildren. The root-scoped unload policy is still being
  // selected; keep these obligations visible until the production policy lands.
  it.todo('releases only activations owned by this plugin on unload')
  it.todo('keeps restored members guarded until their activation ends')
})
