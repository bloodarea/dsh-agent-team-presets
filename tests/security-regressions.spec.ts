/** Capability negative tests with real scoped filesystem tools and durable Team providers. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { createScope } from '@deepseek-ai/dsh-scope'
import { ReasoningEffortId, ToolCallId } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import * as ToolFs from '@deepseek-ai/dsh-tool-fs'
import * as NativeToolExecutor from '@deepseek-ai/dsh-tool-executor-native'
import * as JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import Subagents from '@deepseek-ai/dsh-subagent'
import * as Spawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import * as Fork from '@deepseek-ai/dsh-subagent-fork-in-process'
import TeamService from '@deepseek-ai/dsh-agent-team'
import * as TeamTools from '@deepseek-ai/dsh-tool-agent-team'
import { mkdtemp, rm, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { applyTeamToAgent } from '../src/application.ts'
import { apply, inject } from '../src/index.ts'
import { disposeRealTeamContext, waitForTeamApplication } from './fixtures/plugin-harness.ts'
import TeamPresetsToolCatalog from '../src/tool-catalog.ts'
import { guardPolicy, policyOf } from '../src/tool-policy.ts'
import { BUILTIN_TEAM_IDS } from '../src/builtin-teams.ts'
import { MockAdapter, textResponse, toolCallResponse } from './fixtures/mock-adapter.ts'
import { mountMemberStorage } from './fixtures/member-storage.ts'
import { team, slot } from './fixtures/team-presets.ts'
import { FixtureSessionQuery } from './fixtures/session-query.ts'
import { executeTool } from './fixtures/execute-tool.ts'

const contexts: Context[] = []
const temporary: string[] = []
afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) {
    if (ctx.get('subagents') === undefined) await ctx.fiber.dispose()
    else await disposeRealTeamContext(ctx)
  }
  for (const path of temporary.splice(0)) {
    // Delete only the independently created and checked fixture root.
    const absolute = await realpath(path)
    if (!absolute.startsWith(join(tmpdir(), 'team-presets-security-'))) throw new Error('Unexpected fixture root')
    await rm(absolute, { recursive: true, force: true })
  }
})
async function call(ctx: Context, agent: Agent, name: string, args: object = {}) {
  return executeTool(ctx, { callId: ToolCallId(crypto.randomUUID()), name, arguments: args, agent, signal: new AbortController().signal })
}
async function base(script?: ConstructorParameters<typeof MockAdapter>[0], options: { workingDirectory?: boolean } = {}) {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx, { workingDirectory: options.workingDirectory ?? true })
  await ctx.plugin(AgentLoop, { agents: [] })
  const adapter = new MockAdapter(script ?? Array.from({ length: 30 }, () => textResponse('done')))
  ctx.llm.registerAdapter(['mock'], adapter)
  return { ctx, adapter }
}

describe('strict capability execution', () => {
  it('does not veto normal in-process delegation or native Team creation without a preset selection', async () => {
    const script = Array.from({ length: 30 }, () => textResponse('done'))
    const { ctx } = await base(script)
    const storage = await mkdtemp(join(tmpdir(), 'team-presets-security-'))
    temporary.push(storage)
    await ctx.plugin(JsonlSessionPersistence, { root: storage, compression: 'none' })
    await ctx.plugin(FixtureSessionQuery)
    await ctx.plugin(Subagents)
    await ctx.plugin(Spawn, { providerName: 'spawn' })
    await ctx.plugin(TeamService)
    ctx.provide('settings', { configure: () => () => {}, describe: () => [{ ns: 'agent-team-presets', revision: 0 }], update: async () => {} })
    const config = { skillRoot: join(storage, 'team-skills'), teams: { get: () => [] }, selections: { get: () => [] }, freshProvider: 'spawn', seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] }, forkProvider: 'fork' }
    await ctx.plugin(Object.assign((owner: Context) => apply(owner, config), { inject }))
    const handle = await ctx.agents.create({ sessionId: SessionId('ordinary-root'), agentOptions: { provider: 'mock', model: 'mock' } })
    // TeamTools installs once published Agents can be resolved as live members.
    await ctx.plugin(TeamTools)
    const childResults: { callId: string; error: boolean; text: string }[] = []
    ctx.on('session/event', (_session, event) => {
      if (event.type === 'tool/result') childResults.push({ callId: event.data.message.toolCallId, error: event.data.message.isError === true,
        text: event.data.message.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('') })
    })
    const run = await ctx.subagents.startActivation({
      provider: 'spawn', label: 'ordinary', name: 'ordinary-member',
      parent: handle.agent, prompt: [{ type: 'text', text: 'ordinary task' }],
      signal: new AbortController().signal, delivery: 'caller',
    })
    await run.result
    await run.dispose()
    expect(ctx.tools.get('get_team_preset', handle.agent)).toBeDefined()
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeUndefined()
    const rows = await ctx.subagents.listDescendants(handle.agent.id)
    expect(rows).toEqual(expect.arrayContaining([expect.objectContaining({
      kind: 'child', name: 'ordinary-member', activity: 'inactive', parentId: handle.agent.id,
    })]))
    // A normal child can resume through the official seam with no preset snapshot.
    await ctx.subagents.sendMessage(handle.agent, run.childId,
      [{ type: 'text', text: 'native behavior probe' }], { signal: new AbortController().signal })
    await vi.waitFor(() => expect(ctx.agents.get(run.childId)).toBeUndefined())

  })

  it('lists inherited builtins without a live Agent and denies own-layer write/edit bodies', async () => {
    const { ctx } = await base()
    // Host 0.2.1 owns the `fs` service in this composition, so the case observes
    // the real service instead of replacing it with a second registration.
    const fs = ctx.get('fs') as { writeText: (...args: unknown[]) => unknown; editText: (...args: unknown[]) => unknown }
    const writeText = vi.spyOn(fs, 'writeText')
    const editText = vi.spyOn(fs, 'editText')
    const presetKey = {}
    let preset!: ReturnType<typeof createScope>
    const owner = await ctx.plugin(Object.assign((scoped: Context) => { preset = createScope(scoped, presetKey) }, { inject: ['tools', 'systemPrompt', 'fs'] }))
    await preset.ctx.plugin(ToolFs, {})
    ctx.provide('agentPresets', {
      list: async () => [{ id: 'test-preset' }],
      acquireScope: async () => ({ key: presetKey, [Symbol.asyncDispose]: async () => {} }),
    })
    const catalog = await new TeamPresetsToolCatalog(ctx).catalog()
    expect(catalog.tools.map(tool => tool.name)).toEqual(expect.arrayContaining(['read', 'write', 'edit']))
    // Nothing in this fixture describes the coordination tools, so the catalog
    // omits them instead of inventing hover text for a tool it cannot describe.
    expect(catalog.tools.map(tool => tool.name)).not.toContain('send_message')
    // Capabilities the plugin owns are described and marked captain-only.
    for (const name of ['spawn_team_member', 'get_team_preset', 'update_team_preset']) {
      const choice = catalog.tools.find(tool => tool.name === name)
      expect(choice?.captainOnly, name).toBe(true)
    }
    const agent = { id: SessionId('isolated') } as Agent
    const own = createScope(owner.ctx, agent, { parent: presetKey })
    Object.assign(agent, { ctx: own.ctx })
    // Own-layer shadows are exempt from restrict but not from our guard.
    await own.ctx.plugin(ToolFs, {})
    guardPolicy(agent, policyOf('read-only', slot({ toolMode: 'custom', tools: ['read'] })))
    for (const name of ['write', 'edit']) {
      const denied = await call(ctx, agent, name, { file_path: '/never-touched', content: 'denied', old_string: 'a', new_string: 'b' })
      expect(denied.isError, name).toBe(true)
      expect(JSON.stringify(denied.content), name).toContain('tool policy denies')
    }
    expect(writeText).not.toHaveBeenCalled()
    expect(editText).not.toHaveBeenCalled()
    await own.dispose()
    await preset.dispose()
  })

  it('denies native creation and unlisted own tools even when a pre-execute listener allows', async () => {
    const { ctx } = await base()
    ctx.provide('agentTeams', {})
    const handle = await ctx.agents.create({ sessionId: SessionId('guard-root'), agentOptions: { provider: 'mock', model: 'mock' } })
    const body = vi.fn(async () => 'must not execute')
    for (const name of ['spawn_teammate', 'own_write', 'subagent_alias']) handle.agent.ctx.tools.register({
      name, description: name, parameters: {}, output: { schema: { type: 'string' }, render: () => [] }, execute: body,
    })
    // Existing exact-Agent presentation is valid: rc.1 selects it by mounting
    // the executor plugin on the Agent's own scope (the removed `presentAs`).
    await handle.agent.ctx.plugin(NativeToolExecutor)
    handle.agent.ctx.on('tools/pre-execute', async () => ({ kind: 'allow' }))
    const application = applyTeamToAgent(ctx, handle.agent, team([], { toolMode: 'custom', tools: [] }), { fresh: 'spawn', fork: 'fork' })
    expect((await call(ctx, handle.agent, 'spawn_teammate')).isError).toBe(true)
    expect((await call(ctx, handle.agent, 'own_write')).isError).toBe(true)
    expect((await call(ctx, handle.agent, 'subagent_alias')).isError).toBe(true)
    expect((await call(ctx, handle.agent, 'run_code', { code: "await import('node:fs')", description: 'probe direct import' })).isError).toBe(true)
    expect(body).not.toHaveBeenCalled()
    application.dispose()
  })
})

describe('real durable preset-managed creation', () => {
  it('creates a second role instance, blocks native bypass, and retains strict policy after cold resume', async () => {
    const requestsPerChild = new Map<string, number>()
    const { ctx, adapter } = await base(Array.from({ length: 30 }, () => options => {
      const id = options.sessionId ?? ''
      if (id === 'managed-root') return textResponse('done')
      const count = (requestsPerChild.get(id) ?? 0) + 1
      requestsPerChild.set(id, count)
      return count % 2 === 1 ? toolCallResponse(`probe-${count}`, 'own_mutation', {}) : textResponse('done')
    }))
    const created: Agent[] = []
    const outcomes: { id: string; error: boolean }[] = []
    ctx.on('agent/created', ({ agent }) => { created.push(agent) })
    ctx.on('session/event', (session, event) => {
      if (event.type === 'tool/result' && event.data.message.toolCallId.startsWith('probe-')) {
        outcomes.push({ id: session.id, error: event.data.message.isError === true })
      }
    })
    const storage = await mkdtemp(join(tmpdir(), 'team-presets-security-'))
    temporary.push(storage)
    await ctx.plugin(JsonlSessionPersistence, { root: storage, compression: 'none' })
    await ctx.plugin(FixtureSessionQuery)
    // The member runtime's durable unit: the real hub, JSON backend, and domain
    // form the dsh-base bundle composes. Without it, member creation is
    // refused by design rather than running on the Lead's route.
    const memberStorage = await mkdtemp(join(tmpdir(), 'team-presets-security-'))
    temporary.push(memberStorage)
    await mountMemberStorage(ctx, memberStorage)
    await ctx.plugin(Subagents)
    await ctx.plugin(Spawn, { providerName: 'spawn' })
    await ctx.plugin(Fork, { providerName: 'fork' })
    await ctx.plugin(TeamService)
    await ctx.plugin(TeamTools)
    const body = vi.fn(async () => 'forbidden')
    ctx.on('agent/created', ({ agent }) => {
      agent.ctx.tools.register({ name: 'own_mutation', description: 'own mutation', parameters: {},
        output: { schema: { type: 'string' }, render: () => [] }, execute: body })
    })
    // The member's own route must exercise the same probe: every odd request of
    // a residency tries the own-layer mutation the strict guard must refuse.
    const memberRoute = new MockAdapter(Array.from({ length: 30 }, () => (options: GenerateOptions) => {
      const id = options.sessionId ?? ''
      const count = (requestsPerChild.get(id) ?? 0) + 1
      requestsPerChild.set(id, count)
      return count % 2 === 1 ? toolCallResponse(`probe-${count}`, 'own_mutation', {}) : textResponse('done')
    }), {
      efforts: [{ id: ReasoningEffortId('high'), name: 'High' }],
      defaultEffort: ReasoningEffortId('high'),
    })
    ctx.llm.registerAdapter(['member-route'], memberRoute)
    const definition = team([slot({
      id: 'reviewer-id',
      name: 'reviewer',
      toolMode: 'custom',
      tools: ['send_message', 'list_agents'],
      provider: 'member-route',
      model: 'member-model',
      reasoningEffort: 'high',
    })], {
      toolMode: 'custom', tools: ['spawn_team_member', 'list_agents', 'send_message'],
    })
    ctx.provide('settings', { configure: () => () => {}, describe: () => [{ ns: 'agent-team-presets', revision: 0 }], update: async () => {} })
    const config = { skillRoot: join(storage, 'team-skills'), teams: { get: () => [definition] }, selections: { get: () => [{ sessionId: 'managed-root', teamId: 'team-1' }] }, freshProvider: 'spawn', seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] }, forkProvider: 'fork' }
    await ctx.plugin(Object.assign((owner: Context) => apply(owner, config), { inject }))
    const root = await ctx.agents.create({ sessionId: SessionId('managed-root'), agentOptions: { provider: 'mock', model: 'mock' } })
    await waitForTeamApplication(ctx, root.agent)
    const first = await call(ctx, root.agent, 'spawn_team_member', { member: 'reviewer', task: 'review first' })
    expect(first.isError, JSON.stringify(first.content)).toBe(false)
    const second = await call(ctx, root.agent, 'spawn_team_member', { member: 'reviewer', task: 'review second', context: 'fork' })
    expect(second.isError, JSON.stringify(second.content)).toBe(false)
    const rows = (await ctx.subagents.listDescendants(root.agent.id)).filter(row => row.kind === 'child' && row.mode === 'continuable')
    expect(rows.map(row => row.name)).toEqual(['reviewer', 'reviewer-2'])
    for (const row of rows) {
      // Continuation owner may have disposed an idle activation already. Verify
      // the registered child and the route its first request actually used.
      expect(created.find(agent => agent.id === row.id)).toBeDefined()
      // The member ran on its OWN frozen route and effort, not the Session's.
      await vi.waitFor(() => expect(memberRoute.requests.filter(request => request.sessionId === row.id).length).toBeGreaterThan(0))
      expect(memberRoute.requests.filter(request => request.sessionId === row.id)[0]!.model).toBe('member-model')
      expect(memberRoute.requests.filter(request => request.sessionId === row.id)[0]!.reasoningEffort).toBe('high')
      // No request of this member ever reached the Session's own route.
      expect(adapter.requests.filter(request => request.sessionId === row.id)).toHaveLength(0)
    }
    expect((await call(ctx, root.agent, 'spawn_teammate', { name: 'bypass', description: 'bypass', prompt: 'bypass' })).isError).toBe(true)
    expect(body).not.toHaveBeenCalled()
    const firstId = rows[0]!.id
    await vi.waitFor(() => expect(ctx.agents.get(firstId)).toBeUndefined())
    expect(ctx.agents.get(firstId)).toBeUndefined()
    const previousCreations = created.filter(agent => agent.id === firstId).length
    await ctx.subagents.sendMessage(root.agent, firstId, [{ type: 'text', text: 'continue' }], { signal: new AbortController().signal })
    await vi.waitFor(() => expect(created.filter(agent => agent.id === firstId).length).toBeGreaterThan(previousCreations), { timeout: 3000 })
    await vi.waitFor(() => expect(outcomes.filter(outcome => outcome.id === firstId && outcome.error).length).toBeGreaterThanOrEqual(2))
    expect(body).not.toHaveBeenCalled()
    // Every residency of both members re-entered the frozen route, so a cold
    // resume rebuilt the strict configuration from the durable snapshot.
    expect(memberRoute.requests.some(request => request.sessionId === firstId)).toBe(true)
  }, 15_000)
})
