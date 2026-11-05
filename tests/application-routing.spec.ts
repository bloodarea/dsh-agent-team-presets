/** The Team composition one Session receives and the `spawn_team_member` execution paths. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { mountAgentLoopTestDependencies, mountAgentLoopTestHarness } from '@deepseek-ai/dsh-agent-loop-testkit'
import { ToolCallId, LlmAdapter, ReasoningEffortId } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, LlmResolvedModelInfo, StreamChunk } from '@deepseek-ai/dsh-llm'
import type { SpawnTeammateRequest } from '@deepseek-ai/dsh-experimental-agent-team'
import { SessionId } from '@deepseek-ai/dsh-session'
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt'
import { applyTeamToAgent } from '../src/application.ts'
import { MemberRuntime } from '../src/member-runtime.ts'
import { memberRecords, mountMemberStorage } from './fixtures/member-storage.ts'
import type { MemberStorage } from './fixtures/member-storage.ts'
import { subagentServiceDouble } from './fixtures/plugin-harness.ts'
import { routedCaptain, slot, team } from './fixtures/team-presets.ts'
import { executeTool } from './fixtures/execute-tool.ts'

const contexts: Context[] = []
const temporary: string[] = []

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
  for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true })
})

/**
 * Minimal adapter so an Agent can be created without a real provider.
 *
 * It also declares the one reasoning effort this spec's member slots configure,
 * because the creation preflight now validates a configured member route against
 * this registry's model capability rather than trusting the preset.
 */
class FixtureAdapter extends LlmAdapter {
  override resolveModel(provider: string, model: string): Promise<LlmResolvedModelInfo> {
    return Promise.resolve({
      provider,
      id: model,
      name: model,
      reasoning: { efforts: [{ id: ReasoningEffortId('max'), name: 'Max' }] },
    })
  }

  async * stream(_options: GenerateOptions): AsyncIterable<StreamChunk> {
    throw new Error('the fixture never streams')
  }
}

/** Mount the loop, publish one real Agent, and install the given services. */
async function setup(options: {
  spawnTeammate?: (caller: Agent, request: SpawnTeammateRequest) => Promise<unknown>
} = {}) {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx)
  const harness = await mountAgentLoopTestHarness(ctx)
  // Creation admission reads live services before anything durable exists: the
  // depth cap comes from `subagents`, and the member slots below configure a
  // `deepseek` route, so both must exist in this deployment.
  ctx.provide('subagents', subagentServiceDouble())
  ctx.llm.registerAdapter(['fixture', 'deepseek'], new FixtureAdapter())
  const agent = await harness.create(SessionId('captain'), { provider: 'fixture', model: 'fixture' })
  ctx.tools.register({ name: 'read', description: 'Read fixture', parameters: {}, output: { schema: { type: 'string' }, render: () => [] }, async execute() { return '' } })
  ctx.provide('agentTeams', { listMembers: () => [], spawnTeammate: options.spawnTeammate ?? (async () => ({ member: { name: 'member', status: 'active' } })) })
  const storeRoot = await mkdtemp(join(tmpdir(), 'team-presets-routing-store-'))
  temporary.push(storeRoot)
  const storage = await mountMemberStorage(ctx, storeRoot)
  // The member's configuration is frozen in the durable snapshot the creation
  // edge installs; the Team request carries official fields only.
  const members = new MemberRuntime(ctx)
  return { ctx, agent, storage, members }
}

/** The one member snapshot a spawn recorded. */
async function snapshot(storage: MemberStorage): Promise<Record<string, unknown>> {
  const records = await memberRecords(storage)
  if (records.length !== 1) throw new Error(`expected one member snapshot, found ${records.length}`)
  return records[0]!
}

/** Let a timer-scheduled task run, so a deferred Session model selection cannot hide from an assertion. */
async function flushDeferredWork(): Promise<void> {
  await new Promise<void>((resolve) => { setTimeout(resolve, 0) })
  await new Promise<void>((resolve) => { setTimeout(resolve, 0) })
}

async function callMemberTool(ctx: Context, agent: Agent, args: object) {
  return await executeTool(ctx, {
    callId: ToolCallId('spawn-member'), name: 'spawn_team_member', arguments: args, agent, signal: new AbortController().signal,
  })
}

/** Concatenated text of one tool result, so assertions read the model-facing wording. */
function resultText(result: { content: readonly { type: string; text?: string }[] }): string {
  return result.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join('')
}

describe('spawn_team_member arguments', () => {
  it('keeps a Chinese-named member route attached to its identity after reorder', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'member-1', status: 'active' } }))
    const { ctx, agent, storage, members } = await setup({ spawnTeammate })
    const first = slot({ id: 'architect-id', name: '架构师', provider: 'deepseek', model: 'old-architect' })
    const other = slot({ id: 'review-id', name: '评审员', provider: 'deepseek', model: 'review-model' })
    const stored = team([other, { ...first, model: 'new-architect' }])
    const application = applyTeamToAgent(ctx, agent, team([first, other]), { fresh: 'spawn', fork: 'fork' }, () => stored, members)
    await callMemberTool(ctx, agent, { member: 'member-1', task: 'check the contract' })
    // The recovered route reaches the member as its frozen snapshot.
    expect((await snapshot(storage)).route).toMatchObject({ model: 'new-architect' })
    application.dispose()
  })

  it('does not infer a route from an ambiguous legacy display name', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'member-1', status: 'active' } }))
    const { ctx, agent, storage, members } = await setup({ spawnTeammate })
    const first = slot({ name: '评审员', provider: 'deepseek', model: 'frozen-review' })
    const stored = team([{ ...first, model: 'wrong-one' }, { ...first, model: 'wrong-two' }])
    const application = applyTeamToAgent(ctx, agent, team([first]), { fresh: 'spawn', fork: 'fork' }, () => stored, members)
    await callMemberTool(ctx, agent, { member: 'member-1', task: 'review' })
    expect((await snapshot(storage)).route).toMatchObject({ model: 'frozen-review' })
    application.dispose()
  })

  it('freezes the member route, persona, policy, and context mode while sending official fields only', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'reviewer', status: 'active' } }))
    const { ctx, agent, storage, members } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(ctx, agent, team([slot({
      name: 'reviewer', description: 'checks diffs', provider: 'deepseek', model: 'deepseek-reasoner',
      reasoningEffort: 'max', tools: ['read'], systemPrompt: 'You review diffs.',
    })]), { fresh: 'spawn', fork: 'fork' }, undefined, members)
    const result = await callMemberTool(ctx, agent, { member: 'reviewer', task: 'review it', context: 'fork' })
    expect(result.isError, resultText(result)).toBe(false)
    expect(spawnTeammate).toHaveBeenCalledWith(agent, expect.objectContaining({
      name: 'reviewer',
      description: 'checks diffs',
      context: 'fork',
      provider: 'fork',
    }))
    const request = spawnTeammate.mock.calls[0]?.[1] as unknown as Record<string, unknown>
    // The three undeclared properties earlier versions passed were ignored by
    // the action; the request now carries only what the action declares.
    expect(request).not.toHaveProperty('agentOptions')
    expect(request).not.toHaveProperty('persona')
    expect(request).not.toHaveProperty('toolFilter')
    expect(await snapshot(storage)).toMatchObject({
      memberName: 'reviewer',
      displayName: 'reviewer',
      roleDescription: 'checks diffs',
      spawnContext: 'fork',
      route: { provider: 'deepseek', model: 'deepseek-reasoner', reasoningEffort: 'max' },
      policy: { mode: 'custom', allow: ['read'] },
    })
    const persona = (await snapshot(storage)).persona as string
    expect(persona).toContain('You are "reviewer" on the Agent Team "Team".\n\nYour role: checks diffs\n\nYou review diffs.')
    application.dispose()
  })

  it('freezes a member route that names no reasoning effort', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'reviewer', status: 'active' } }))
    const { ctx, agent, storage, members } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(
      ctx, agent,
      team([slot({ name: 'reviewer', provider: 'deepseek', model: 'deepseek-chat' })]),
      { fresh: 'spawn', fork: 'fork' }, undefined, members,
    )
    await callMemberTool(ctx, agent, { member: 'reviewer', task: 'review it' })
    const route = (await snapshot(storage)).route as Record<string, unknown>
    expect(route).toMatchObject({ provider: 'deepseek', model: 'deepseek-chat' })
    // An empty configured effort means "the model's own default", so the
    // snapshot must not carry an inherited one.
    expect(route).not.toHaveProperty('reasoningEffort')
    application.dispose()
  })

  it('defaults context to fresh, description to the member name, and freezes no route for an unset one', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'reviewer', status: 'active' } }))
    const { ctx, agent, storage, members } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: 'reviewer' })]), { fresh: 'spawn', fork: 'fork' }, undefined, members)
    await callMemberTool(ctx, agent, { member: 'reviewer', task: 'review it' })
    const request = spawnTeammate.mock.calls[0]?.[1]
    expect(request).toMatchObject({ name: 'reviewer', description: 'reviewer', context: 'fresh', provider: 'spawn' })
    expect(request).not.toHaveProperty('agentOptions')
    expect(request).not.toHaveProperty('persona')
    expect(request).not.toHaveProperty('toolFilter')
    const record = await snapshot(storage)
    // No configured route: the member runs on the Session's own route.
    expect(record).not.toHaveProperty('route')
    // No tools named: the member's own independent policy is default-all.
    expect(record.policy).toEqual({ mode: 'all', allow: [] })
    expect(record.persona).toContain('You are "reviewer" on the Agent Team "Team".')
    application.dispose()
  })

  it('summons a nameless member under its generated target', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'member-1', status: 'active' } }))
    const { ctx, agent, storage, members } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: '' })]), { fresh: 'spawn', fork: 'fork' }, undefined, members)
    await callMemberTool(ctx, agent, { member: 'member-1', task: 'work' })
    expect(spawnTeammate).toHaveBeenCalledWith(agent, expect.objectContaining({ name: 'member-1', description: 'member-1' }))
    expect(await snapshot(storage)).toMatchObject({ memberName: 'member-1' })
    application.dispose()
  })

  it('honours a caller-supplied description and a default-all member policy', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'member', status: 'active' } }))
    const { ctx, agent, storage, members } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: 'member', description: 'ignored', toolMode: 'all', tools: ['read'] })]), {
      fresh: 'spawn', fork: 'fork',
    }, undefined, members)
    await callMemberTool(ctx, agent, { member: 'member', task: 'work', description: 'explicit description' })
    const request = spawnTeammate.mock.calls[0]?.[1]
    expect(request).toMatchObject({ description: 'explicit description' })
    expect(request).not.toHaveProperty('toolFilter')
    // An explicit default-all mode wins over the legacy nonempty list.
    expect((await snapshot(storage)).policy).toEqual({ mode: 'all', allow: ['read'] })
    application.dispose()
  })

  it('reports a failed member and its configured route without claiming the roster model', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({
      // The host roster reports the value it knows, which for an unloaded child
      // falls back to the Lead's own model; it is never the execution evidence.
      member: { name: 'reviewer', status: 'failed', model: 'lead-model' },
    }))
    const { ctx, agent, storage, members } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(ctx, agent, team([slot({
      name: 'reviewer', description: 'reviewer role', provider: 'deepseek', model: 'deepseek-reasoner',
    })]), { fresh: 'spawn', fork: 'fork' }, undefined, members)
    const result = await callMemberTool(ctx, agent, { member: 'reviewer', task: 'review it' })
    expect(result.isError, resultText(result)).toBe(false)
    const payload = JSON.parse(resultText(result)) as { status: string; configuredRoute?: unknown; model?: unknown }
    expect(payload.status).toBe('failed')
    expect(payload.configuredRoute).toEqual({ provider: 'deepseek', model: 'deepseek-reasoner' })
    // The roster's model is not forwarded as if it were the member's route.
    expect(payload.model).toBeUndefined()
    // A failed creation leaves the frozen snapshot as the record of what was
    // attempted rather than deleting it.
    expect(await snapshot(storage)).toMatchObject({
      memberName: 'reviewer',
      lifecycle: 'failed',
      route: { provider: 'deepseek', model: 'deepseek-reasoner' },
    })
    application.dispose()
  })

  it('reports no configured route when the member runs on the Session route', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'reviewer', status: 'active', model: 'lead-model' } }))
    const { ctx, agent, members } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: 'reviewer' })]), { fresh: 'spawn', fork: 'fork' }, undefined, members)
    const result = await callMemberTool(ctx, agent, { member: 'reviewer', task: 'review it' })
    const payload = JSON.parse(resultText(result)) as { configuredRoute?: unknown; model?: unknown }
    expect(payload.configuredRoute).toBeUndefined()
    expect(payload.model).toBeUndefined()
    application.dispose()
  })

  it('rejects an unknown member and names the configured targets', async () => {
    const { ctx, agent, members } = await setup()
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: 'reviewer', description: 'reviewer role' })]), { fresh: 'spawn', fork: 'fork' }, undefined, members)
    const result = await callMemberTool(ctx, agent, { member: 'ghost', task: 'review it' })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('unknown Team member "ghost"')
    expect(resultText(result)).toContain('reviewer')
    application.dispose()
  })

  it('refuses a call with no calling Agent', async () => {
    const { ctx, agent, members } = await setup()
    const application = applyTeamToAgent(ctx, agent, team([]), { fresh: 'spawn', fork: 'fork' }, undefined, members)
    const definition = ctx.tools.get('spawn_team_member', agent)
    if (definition === undefined) throw new Error('the Team member tool was not registered')
    await ctx.plugin(Object.assign((inner: Context) => { inner.tools.register(definition) }, { inject: ['tools'] }))
    const result = await executeTool(ctx, {
      callId: ToolCallId('agentless'), name: 'spawn_team_member', arguments: { member: 'ghost', task: 'work' },
      signal: new AbortController().signal,
    })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('requires a calling Agent')
    application.dispose()
  })

  it('names no targets for a Team without members', async () => {
    const { ctx, agent, members } = await setup()
    const application = applyTeamToAgent(ctx, agent, team([]), { fresh: 'spawn', fork: 'fork' }, undefined, members)
    const result = await callMemberTool(ctx, agent, { member: 'ghost', task: 'review it' })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('(none)')
    application.dispose()
  })
})

describe('application composition', () => {
  it('registers no persona or briefing for a Team that states nothing', async () => {
    const { ctx, agent, members } = await setup()
    const application = applyTeamToAgent(ctx, agent, team([], { name: '', description: '', systemPrompt: '   ' }), { fresh: 'spawn', fork: 'fork' }, undefined, members)
    expect(ctx.tools.schemas(agent).map(tool => tool.name)).toEqual(['read', 'spawn_team_member'])
    application.dispose()
  })

  it('leaves the Session model alone for a captain that still stores a route', async () => {
    const selectModel = vi.fn(async () => {})
    const { ctx, agent, members } = await setup()
    ctx.provide('sessionController', { selectModel })
    const stored = team([slot({ name: 'reviewer', description: 'reviewer role' })], routedCaptain())
    expect(stored.captain).toMatchObject({ provider: 'deepseek', model: 'deepseek-chat', reasoningEffort: 'high' })
    const application = applyTeamToAgent(ctx, agent, stored, { fresh: 'spawn', fork: 'fork' }, undefined, members)
    await flushDeferredWork()

    expect(selectModel).not.toHaveBeenCalled()
    const assembly = await ctx.systemPrompt.assemble(assembleContextFor(agent))
    expect(assembly.sections.map(section => section.name)).toContain(PERSONA_PREFIX_SECTION)
    expect(assembly.sections.find(section => section.name === 'agent-team-presets:briefing')?.text)
      .toContain('- reviewer: reviewer role')
    expect(ctx.tools.get('spawn_team_member', agent)).toBeDefined()
    application.dispose()
  })

  it('releases every registration on dispose', async () => {
    const { ctx, agent, members } = await setup()
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: 'reviewer', description: 'reviewer role' })]), { fresh: 'spawn', fork: 'fork' }, undefined, members)
    expect(ctx.tools.get('spawn_team_member', agent)).toBeDefined()
    application.dispose()
    expect(ctx.tools.get('spawn_team_member', agent)).toBeUndefined()
  })
})
