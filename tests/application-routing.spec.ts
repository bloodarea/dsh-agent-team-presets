/** The Team composition one Session receives and the `spawn_team_member` execution paths. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { mountAgentLoopTestDependencies, mountAgentLoopTestHarness } from '@deepseek-ai/dsh-agent-loop-testkit'
import { ToolCallId, LlmAdapter } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, LlmResolvedModelInfo, StreamChunk } from '@deepseek-ai/dsh-llm'
import type { SpawnTeammateRequest } from '@deepseek-ai/dsh-experimental-agent-team'
import { SessionId } from '@deepseek-ai/dsh-session'
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt'
import { applyTeamToAgent } from '../src/application.ts'
import { routedCaptain, slot, team } from './fixtures/team-presets.ts'

const contexts: Context[] = []

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
})

/** Minimal adapter so an Agent can be created without a real provider. */
class FixtureAdapter extends LlmAdapter {
  override resolveModel(provider: string, model: string): Promise<LlmResolvedModelInfo> {
    return Promise.resolve({ provider, id: model, name: model })
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
  ctx.llm.registerAdapter(['fixture'], new FixtureAdapter())
  const agent = await harness.create(SessionId('captain'), { provider: 'fixture', model: 'fixture' })
  ctx.provide('agentTeams', { spawnTeammate: options.spawnTeammate ?? (async () => ({ member: { name: 'member', status: 'active' } })) })
  return { ctx, agent }
}

/** Let a timer-scheduled task run, so a deferred Session model selection cannot hide from an assertion. */
async function flushDeferredWork(): Promise<void> {
  await new Promise<void>((resolve) => { setTimeout(resolve, 0) })
  await new Promise<void>((resolve) => { setTimeout(resolve, 0) })
}

async function callMemberTool(ctx: Context, agent: Agent, args: object) {
  return await ctx.tools.execute({
    callId: ToolCallId('spawn-member'), name: 'spawn_team_member', arguments: args, agent, signal: new AbortController().signal,
  })
}

/** Concatenated text of one tool result, so assertions read the model-facing wording. */
function resultText(result: { content: readonly { type: string; text?: string }[] }): string {
  return result.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join('')
}

describe('spawn_team_member arguments', () => {
  it('forwards the member route, persona, description, and context mode', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'reviewer', status: 'active' } }))
    const { ctx, agent } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(ctx, agent, team([slot({
      name: 'reviewer', description: 'checks diffs', provider: 'deepseek', model: 'deepseek-reasoner',
      reasoningEffort: 'max', tools: ['read'], systemPrompt: 'You review diffs.',
    })]), { fresh: 'spawn', fork: 'fork' })
    const result = await callMemberTool(ctx, agent, { member: 'reviewer', task: 'review it', context: 'fork' })
    expect(result.isError).toBe(false)
    expect(spawnTeammate).toHaveBeenCalledWith(agent, expect.objectContaining({
      name: 'reviewer',
      description: 'checks diffs',
      context: 'fork',
      provider: 'fork',
      agentOptions: { provider: 'deepseek', model: 'deepseek-reasoner', reasoningEffort: 'max' },
      persona: 'You are "reviewer" on the Agent Team "Team".\n\nYour role: checks diffs\n\nYou review diffs.',
      toolFilter: { allow: ['read'] },
    }))
    application.dispose()
  })

  it('forwards a member route that names no reasoning effort', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'reviewer', status: 'active' } }))
    const { ctx, agent } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(
      ctx,
      agent,
      team([slot({ name: 'reviewer', provider: 'deepseek', model: 'deepseek-chat' })]),
      { fresh: 'spawn', fork: 'fork' },
    )
    await callMemberTool(ctx, agent, { member: 'reviewer', task: 'review it' })
    const request = spawnTeammate.mock.calls[0]?.[1]
    expect(request).toMatchObject({ agentOptions: { provider: 'deepseek', model: 'deepseek-chat' } })
    expect(request?.agentOptions).not.toHaveProperty('reasoningEffort')
    application.dispose()
  })

  it('defaults context to fresh, description to the member name, and omits unset optionals', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'reviewer', status: 'active' } }))
    const { ctx, agent } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: 'reviewer' })]), { fresh: 'spawn', fork: 'fork' })
    await callMemberTool(ctx, agent, { member: 'reviewer', task: 'review it' })
    const request = spawnTeammate.mock.calls[0]?.[1]
    expect(request).toMatchObject({ name: 'reviewer', description: 'reviewer', context: 'fresh', provider: 'spawn' })
    expect(request).not.toHaveProperty('agentOptions')
    expect(request).toMatchObject({ persona: 'You are "reviewer" on the Agent Team "Team".' })
    expect(request).not.toHaveProperty('toolFilter')
    application.dispose()
  })

  it('summons a nameless member under its generated target', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'member-1', status: 'active' } }))
    const { ctx, agent } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: '' })]), { fresh: 'spawn', fork: 'fork' })
    await callMemberTool(ctx, agent, { member: 'member-1', task: 'work' })
    expect(spawnTeammate).toHaveBeenCalledWith(agent, expect.objectContaining({ name: 'member-1', description: 'member-1' }))
    application.dispose()
  })

  it('honours a caller-supplied description and a default-all member policy', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({ member: { name: 'member', status: 'active' } }))
    const { ctx, agent } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: 'member', description: 'ignored', toolMode: 'all', tools: ['read'] })]), {
      fresh: 'spawn', fork: 'fork',
    })
    await callMemberTool(ctx, agent, { member: 'member', task: 'work', description: 'explicit description' })
    const request = spawnTeammate.mock.calls[0]?.[1]
    expect(request).toMatchObject({ description: 'explicit description' })
    expect(request).not.toHaveProperty('toolFilter')
    application.dispose()
  })

  it('reports a failed member and includes its requested model', async () => {
    const spawnTeammate = vi.fn(async (_caller: Agent, _request: SpawnTeammateRequest) => ({
      member: { name: 'reviewer', status: 'failed', model: 'deepseek-reasoner' },
    }))
    const { ctx, agent } = await setup({ spawnTeammate })
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: 'reviewer', description: 'reviewer role' })]), { fresh: 'spawn', fork: 'fork' })
    const result = await callMemberTool(ctx, agent, { member: 'reviewer', task: 'review it' })
    expect(result.isError).toBe(false)
    expect(resultText(result)).toContain('"status":"failed"')
    expect(resultText(result)).toContain('"model":"deepseek-reasoner"')
    application.dispose()
  })

  it('rejects an unknown member and names the configured targets', async () => {
    const { ctx, agent } = await setup()
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: 'reviewer', description: 'reviewer role' })]), { fresh: 'spawn', fork: 'fork' })
    const result = await callMemberTool(ctx, agent, { member: 'ghost', task: 'review it' })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('unknown Team member "ghost"')
    expect(resultText(result)).toContain('reviewer')
    application.dispose()
  })

  it('refuses a call with no calling Agent', async () => {
    const { ctx, agent } = await setup()
    const application = applyTeamToAgent(ctx, agent, team([]), { fresh: 'spawn', fork: 'fork' })
    const definition = ctx.tools.get('spawn_team_member', agent)
    if (definition === undefined) throw new Error('the Team member tool was not registered')
    await ctx.plugin(Object.assign((inner: Context) => { inner.tools.register(definition) }, { inject: ['tools'] }))
    const result = await ctx.tools.execute({
      callId: ToolCallId('agentless'), name: 'spawn_team_member', arguments: { member: 'ghost', task: 'work' },
      signal: new AbortController().signal,
    })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('requires a calling Agent')
    application.dispose()
  })

  it('names no targets for a Team without members', async () => {
    const { ctx, agent } = await setup()
    const application = applyTeamToAgent(ctx, agent, team([]), { fresh: 'spawn', fork: 'fork' })
    const result = await callMemberTool(ctx, agent, { member: 'ghost', task: 'review it' })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('(none)')
    application.dispose()
  })
})

describe('application composition', () => {
  it('registers no persona or briefing for a Team that states nothing', async () => {
    const { ctx, agent } = await setup()
    const application = applyTeamToAgent(ctx, agent, team([], { name: '', description: '', systemPrompt: '   ' }), { fresh: 'spawn', fork: 'fork' })
    expect(ctx.tools.schemas(agent).map(tool => tool.name)).toEqual(['spawn_team_member'])
    application.dispose()
  })

  it('leaves the Session model alone for a captain that still stores a route', async () => {
    const selectModel = vi.fn(async () => {})
    const { ctx, agent } = await setup()
    ctx.provide('sessionController', { selectModel })
    const stored = team([slot({ name: 'reviewer', description: 'reviewer role' })], routedCaptain())
    expect(stored.captain).toMatchObject({ provider: 'deepseek', model: 'deepseek-chat', reasoningEffort: 'high' })
    const application = applyTeamToAgent(ctx, agent, stored, { fresh: 'spawn', fork: 'fork' })
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
    const { ctx, agent } = await setup()
    const application = applyTeamToAgent(ctx, agent, team([slot({ name: 'reviewer', description: 'reviewer role' })]), { fresh: 'spawn', fork: 'fork' })
    expect(ctx.tools.get('spawn_team_member', agent)).toBeDefined()
    application.dispose()
    expect(ctx.tools.get('spawn_team_member', agent)).toBeUndefined()
  })
})
