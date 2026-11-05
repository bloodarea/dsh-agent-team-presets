/**
 * Official rc.2 member injection through the PRODUCTION plugin composition.
 *
 * Every case mounts the real Team service, the real continuation manager, real
 * JSONL session persistence, and the real storage stack the `dsh-base` bundle
 * composes, then drives the plugin's own `apply()` and its `spawn_team_member`
 * tool. Nothing here stubs `spawnTeammate`, and no assertion reads a mock's
 * argument list: the member's own model request, its own tool surface, and the
 * durable unit on disk are the evidence.
 *
 * Unlike the handed-over feasibility probe, this spec exercises the shipped
 * modules (`MemberRuntime`, the member store, `applyTeamToAgent`, `index.ts`),
 * so it fails if the production wiring — not just the technique — regresses.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { executeTool } from './fixtures/execute-tool.ts'
import { Context } from '@deepseek-ai/cordis'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { settlePlugin, waitForTeamApplication } from './fixtures/plugin-harness.ts'
import { ReasoningEffortId, ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm'
import { bindScopeParent, createScope } from '@deepseek-ai/dsh-scope'
import { NativeToolExecutor } from '@deepseek-ai/dsh-tool-executor-native'
import { readWire } from '../src/presentation.ts'
import type { GenerateOptions } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import * as JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import Subagents from '@deepseek-ai/dsh-subagent'
import * as Spawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import * as Fork from '@deepseek-ai/dsh-subagent-fork-in-process'
import TeamService from '@deepseek-ai/dsh-experimental-agent-team'
import { mkdtemp, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply, inject } from '../src/index.ts'
import { MEMBER_TEAM_SECTION } from '../src/member-runtime.ts'
import { team, slot } from './fixtures/team-presets.ts'
import { FixtureSessionQuery } from './fixtures/session-query.ts'
import { mountMemberStorage } from './fixtures/member-storage.ts'
import type { MemberStorage } from './fixtures/member-storage.ts'
import { MockAdapter, textResponse } from './fixtures/mock-adapter.ts'
import type { TeamPreset } from '../src/types.ts'
import { BUILTIN_TEAM_IDS } from '../src/builtin-teams.ts'

const contexts: Context[] = []
const temporary: string[] = []

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
  for (const path of temporary.splice(0)) {
    const absolute = await realpath(path)
    if (!absolute.startsWith(join(tmpdir(), 'team-presets-injection-'))) throw new Error('Unexpected fixture root')
    await rm(absolute, { recursive: true, force: true })
  }
})

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

/** Everything one request carried as model-visible text. */
function requestText(request: GenerateOptions): string {
  return JSON.stringify(request.messages)
}

/** The frozen route the plugin installed for one member slot. */
function routedMember(provider: string, model: string, effort?: string): TeamPreset['members'][number] {
  return slot({
    name: 'reviewer',
    description: 'reviews diffs',
    systemPrompt: 'UNIQUE_MEMBER_RULES',
    provider,
    model,
    reasoningEffort: effort ?? '',
    toolMode: 'custom',
    tools: ['read'],
  })
}

/** The captain's own allow-list for most cases below. */
const DEFAULT_CAPTAIN_TOOLS = ['spawn_team_member', 'send_message', 'list_agents']

/**
 * One Team preset with a named purpose, so a member's team context can be told
 * apart from the fixture defaults.
 * @param members - the member slots.
 * @param captainTools - the captain's own allow-list.
 * @returns the Team preset.
 */
function definition(members: TeamPreset['members'], captainTools: string[] = DEFAULT_CAPTAIN_TOOLS): TeamPreset {
  return {
    ...team(members, { systemPrompt: 'CAPTAIN_RULES', toolMode: 'custom', tools: captainTools }),
    name: 'Reviews',
    description: 'TEAM_PURPOSE',
  }
}

/**
 * Compose the official rc.2 stack plus this plugin.
 *
 * `teams` is a live reference, so a case can simulate a Settings save between
 * spawns while the applied definition stays frozen exactly as it does in
 * production.
 */
async function stack(options: {
  members: TeamPreset['members']
  captainTools?: string[]
  memberScript?: (options: GenerateOptions) => ReturnType<typeof textResponse>
  ids?: { session?: string; root?: string }
} = { members: [] }) {
  const sessionId = options.ids?.session ?? 'lead'
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx, { workingDirectory: true })
  const sessionRoot = await mkdtemp(join(tmpdir(), 'team-presets-injection-sessions-'))
  temporary.push(sessionRoot)
  await ctx.plugin(JsonlSessionPersistence, { root: sessionRoot, compression: 'none' })
  await ctx.plugin(FixtureSessionQuery)
  const storageRoot = await mkdtemp(join(tmpdir(), 'team-presets-injection-storage-'))
  temporary.push(storageRoot)
  const storage = await mountMemberStorage(ctx, storageRoot)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(Subagents)
  await ctx.plugin(Spawn, { providerName: 'spawn' })
  await ctx.plugin(Fork, { providerName: 'fork' })
  await ctx.plugin(TeamService)

  // The Session's own route declares only "high", and every member route
  // declares "low" as its default besides the efforts a case configures. A
  // member that inherited the Session's effort instead of resolving its own
  // would therefore be distinguishable from one that did not.
  const lead = new MockAdapter(Array.from({ length: 40 }, () => textResponse('lead done')), {
    efforts: [{ id: ReasoningEffortId('high'), name: 'High' }],
    defaultEffort: ReasoningEffortId('high'),
  })
  const member = new MockAdapter(
    Array.from({ length: 40 }, () => options.memberScript ?? textResponse('member done')),
    {
      efforts: [
        { id: ReasoningEffortId('low'), name: 'Low' },
        { id: ReasoningEffortId('high'), name: 'High' },
        { id: ReasoningEffortId('max'), name: 'Max' },
      ],
      defaultEffort: ReasoningEffortId('low'),
    },
  )
  // A route that accepts only "low", to prove an unusable member effort fails
  // loudly instead of quietly falling back to the Session's route.
  const strict = new MockAdapter(Array.from({ length: 40 }, () => textResponse('strict done')), {
    efforts: [{ id: ReasoningEffortId('low'), name: 'Low' }],
    defaultEffort: ReasoningEffortId('low'),
  })
  ctx.llm.registerAdapter(['mock'], lead)
  ctx.llm.registerAdapter(['member-route'], member)
  ctx.llm.registerAdapter(['member-route-2'], member)
  ctx.llm.registerAdapter(['member-route-strict'], strict)

  let writeExecutions = 0
  for (const name of ['read', 'write']) {
    ctx.tools.register({
      name,
      description: `${name} fixture`,
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [] },
      async execute() { if (name === 'write') writeExecutions += 1; return 'executed' },
    })
  }

  ctx.provide('settings', {
    configure: () => () => {},
    describe: () => [{ ns: 'agent-team-presets', revision: 0 }],
    update: async () => {},
  })
  let current = definition(options.members, options.captainTools)
  const config = {
    teams: { get: () => [current] },
    selections: { get: () => [{ sessionId, teamId: current.id }] },
    freshProvider: 'spawn',
    seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] },
    forkProvider: 'fork',
  }
  await ctx.plugin(Object.assign((owner: Context) => apply(owner, config), { inject }))
  const root = await ctx.agents.create({
    sessionId: SessionId(sessionId),
    agentOptions: { provider: 'mock', model: 'lead-model', reasoningEffort: ReasoningEffortId('high') },
  })
  // The Team application is queued and awaits the effective prompt assembly
  // before it installs anything (Host 0.2.1); let it settle before driving tools.
  await settlePlugin()
  await waitForTeamApplication(ctx, root.agent)
  return {
    ctx,
    root: root.agent,
    lead,
    member,
    strict,
    storage,
    writeExecutions: () => writeExecutions,
    /** Replace the stored Team, keeping its identity, without a plugin remount. */
    store: (next: TeamPreset) => { current = next },
  }
}

/** Wait for the first request a member adapter received for one child. */
function memberRequests(member: MockAdapter, childId: string): GenerateOptions[] {
  return member.requests.filter(request => request.sessionId === childId)
}

describe('a preset-managed member receives its frozen configuration before its first request', () => {
  it.each(['fresh', 'fork'] as const)('runs a %s member on its own route, persona, context, and restricted tools', async context => {
    const h = await stack({
      members: [routedMember('member-route', 'member-model', 'max')],
      memberScript: () => textResponse('member done'),
    })
    const denied: boolean[] = []
    // Registered after the plugin, so the plugin's own listener has already
    // installed the guard when this observes the live child.
    h.ctx.on('agent/created', async ({ agent }) => {
      if (h.ctx.agentTeams.tryMembership(agent)?.role !== 'teammate') return
      const write = await call(h.ctx, agent, 'write', { file_path: '/never-touched', content: 'x' })
      denied.push(write.isError === true)
    })

    // A fork inherits a recorded Lead choice, which the member must supersede.
    h.root.model.select({ provider: 'mock', model: 'lead-model', reasoningEffort: ReasoningEffortId('high') })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW_TASK', context })
    expect(spawn.isError, resultText(spawn)).toBe(false)
    const row = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'reviewer')
    expect(row?.id).toBeDefined()

    await vi.waitFor(() => expect(memberRequests(h.member, row!.id).length).toBeGreaterThan(0), { timeout: 5000 })
    const first = memberRequests(h.member, row!.id)[0]!
    // The real request reached the member route, not the Session route.
    expect(first.provider).toBe('member-route')
    expect(first.model).toBe('member-model')
    expect(first.reasoningEffort).toBe('max')
    const text = requestText(first)
    expect(text).toContain('UNIQUE_MEMBER_RULES')
    expect(text).toContain('TEAM_PURPOSE')
    expect(text).toContain('Preset division of labour')
    expect(text).toContain('lead')
    // The member never receives the captain's summons instructions or its rules.
    expect(text).not.toContain('CAPTAIN_RULES')
    expect(text).not.toContain('spawn_team_member(member, task)')
    expect(first.tools?.map(tool => tool.name)).toEqual(['read'])

    // The live child refused the write through the strict guard, and the
    // handler never ran.
    await vi.waitFor(() => expect(denied.length).toBeGreaterThan(0), { timeout: 5000 })
    expect(denied).toEqual([true])
    expect(h.writeExecutions()).toBe(0)

    // The tool reported the route the plugin installed, not the host roster's.
    const payload = JSON.parse(resultText(spawn)) as { configuredRoute?: { provider: string; model: string } }
    expect(payload.configuredRoute).toEqual({ provider: 'member-route', model: 'member-model', reasoningEffort: 'max' })
  }, 20_000)

  it('keeps the captain on the Session route with its own persona and tools', async () => {
    const h = await stack({
      members: [routedMember('member-route', 'member-model')],
      captainTools: ['spawn_team_member', 'send_message', 'list_agents', 'read', 'write'],
    })
    // The captain's own allow-list still admits the Session's tools: the
    // member's `read`-only scope never applies upward.
    const schemas = h.ctx.tools.schemas(h.root).map(schema => schema.name)
    expect(schemas).toContain('spawn_team_member')
    expect(schemas).toContain('write')
    expect((await call(h.ctx, h.root, 'read')).isError).toBe(false)
    expect(h.root.options.model).toBe('lead-model')
    // The captain reads its own persona and briefing, never a member's.
    const assembly = await h.ctx.systemPrompt.assemble(assembleContextFor(h.root))
    const persona = assembly.sections.find(section => section.name === 'deployment:persona-prefix')?.text
    const briefing = assembly.sections.find(section => section.name === 'agent-team-presets:briefing')?.text
    expect(persona).toBe('CAPTAIN_RULES')
    expect(briefing).toContain('reviewer')
    expect(persona).not.toContain('UNIQUE_MEMBER_RULES')
  }, 20_000)

  it('reports the host roster model separately from the route that actually ran', async () => {
    const h = await stack({ members: [routedMember('member-route', 'member-model')] })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW_TASK' })
    expect(spawn.isError, resultText(spawn)).toBe(false)
    const row = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'reviewer')
    await vi.waitFor(() => expect(memberRequests(h.member, row!.id).length).toBeGreaterThan(0), { timeout: 5000 })
    // The member's own request proves the route; the roster's value is a
    // different fact and is never presented as the execution evidence.
    expect(memberRequests(h.member, row!.id)[0]!.model).toBe('member-model')
    expect(row?.model).not.toBe('member-model')
  }, 20_000)
})

describe('same-Agent preset switching', () => {
  it('revalidates an unchanged Team after native to PTC to native scope changes', async () => {
    const h = await stack({ members: [], captainTools: ['read'] })
    const nativeKey = {}
    const ptcKey = {}
    await h.ctx.plugin(Object.assign((owner: Context) => {
      const native = createScope(owner, nativeKey)
      const ptc = createScope(owner, ptcKey)
      native.ctx.tools.setExecutor(new NativeToolExecutor(native.ctx))
      ptc.ctx.tools.setExecutor({
        describe: () => ({ schemas: [{ name: 'run_code', description: 'program', parameters: {} }] }),
        execute: async () => ({ results: [], additionalContexts: [], concluded: false }),
      })
    }, { inject: ['tools', 'systemPrompt'] }))
    const binding = bindScopeParent(h.root, nativeKey)
    expect((await readWire(h.root))?.tools).toContain('read')
    binding.rebind(ptcKey)
    h.ctx.emit('agent-preset/selected', h.root.id, 'ptc')
    await settlePlugin()
    expect(h.ctx.tools.get('spawn_team_member', h.root)).toBeUndefined()
    // A refused Team has not poisoned the preset's executor selection.
    expect((await readWire(h.root))?.tools).toEqual(['run_code'])
    binding.rebind(nativeKey)
    h.ctx.emit('agent-preset/selected', h.root.id, 'standard')
    await waitForTeamApplication(h.ctx, h.root)
    expect((await call(h.ctx, h.root, 'read')).isError).toBe(false)
    expect((await call(h.ctx, h.root, 'write')).isError).toBe(true)
    h.root.followup(createUserMessage({ content: [{ type: 'text', text: 'FIRST_REQUEST_AFTER_SWITCH' }], source: { kind: 'user' } }))
    await h.root.whenIdle()
    expect(h.lead.requests.at(-1)?.tools?.map(tool => tool.name)).toContain('read')
    expect(h.lead.requests.at(-1)?.tools?.map(tool => tool.name)).not.toContain('write')
    expect(h.lead.requests.at(-1)?.tools?.map(tool => tool.name)).not.toContain('run_code')
  })
})

describe('reasoning effort follows the member route, not the Session', () => {
  it('adopts the member model default for an empty effort instead of inheriting the Session effort', async () => {
    // The member names a route but no effort. The member route's default is
    // "low"; the Session runs "high", so inheritance would be visible.
    const h = await stack({ members: [slot({
      name: 'reviewer',
      description: 'reviews diffs',
      systemPrompt: 'UNIQUE_MEMBER_RULES',
      provider: 'member-route',
      model: 'member-model',
      reasoningEffort: '',
      toolMode: 'custom',
      tools: ['read'],
    })] })
    expect(h.root.options.reasoningEffort).toBe('high')
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW_TASK' })
    expect(spawn.isError, resultText(spawn)).toBe(false)
    const row = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'reviewer')!
    await vi.waitFor(() => expect(memberRequests(h.member, row.id).length).toBeGreaterThan(0), { timeout: 5000 })
    const first = memberRequests(h.member, row.id)[0]!
    expect(first.model).toBe('member-model')
    // Empty configured effort means "the member model's own default", never the
    // Session's effort leaking across the route change.
    expect(first.reasoningEffort).toBe('low')
  }, 20_000)

  it('refuses a member whose configured effort is unsupported, without falling back to the Session route', async () => {
    const h = await stack({ members: [slot({
      name: 'reviewer',
      description: 'reviews diffs',
      systemPrompt: 'UNIQUE_MEMBER_RULES',
      provider: 'member-route-strict',
      model: 'strict-model',
      reasoningEffort: 'max',
      toolMode: 'custom',
      tools: ['read'],
    })] })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW_TASK' })
    expect(spawn.isError).toBe(true)
    const text = resultText(spawn)
    // The route preflight names the unusable route and its effort, so the
    // captain is told what to correct instead of receiving the Host's generic
    // "initial prompt was not durably accepted" from inside the member's turn.
    expect(text).toContain('member-route-strict/strict-model')
    expect(text).toContain('does not support reasoning effort "max"')
    // The refusal lands before anything durable or live exists: no roster row,
    // no snapshot in the unit, and no request on any route.
    expect(h.ctx.agentTeams.listMembers(h.root).filter(row => row.name === 'reviewer')).toHaveLength(0)
    const unit = await h.storage.readUnit()
    const records = Object.values((unit?.tables as Record<string, Record<string, unknown>>)?.members ?? {})
    expect(records).toHaveLength(0)
    expect(h.strict.requests).toHaveLength(0)
    expect(h.member.requests).toHaveLength(0)
    // No silent downgrade to the Session's route or model.
    expect(h.lead.requests).toHaveLength(0)
  }, 20_000)
})

describe('durable snapshots and recovery', () => {
  it('writes the snapshot before creation and rebinds the child durably', async () => {
    const h = await stack({ members: [routedMember('member-route', 'member-model', 'high')] })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW_TASK' })
    expect(spawn.isError, resultText(spawn)).toBe(false)
    const row = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'reviewer')!

    const unit = await h.storage.readUnit()
    const records = Object.values((unit?.tables as Record<string, Record<string, unknown>>)?.members ?? {})
    expect(records).toHaveLength(1)
    const record = records[0] as Record<string, unknown>
    expect(record).toMatchObject({
      schemaVersion: 1,
      rootSessionId: 'lead',
      memberName: 'reviewer',
      displayName: 'reviewer',
      roleDescription: 'reviews diffs',
      spawnContext: 'fresh',
      lifecycle: 'bound',
      childSessionId: row.id,
      route: { provider: 'member-route', model: 'member-model', reasoningEffort: 'high' },
      policy: { mode: 'custom', allow: ['read'] },
    })
    expect(record.persona).toContain('UNIQUE_MEMBER_RULES')
    expect(record.teamSection).toContain('Preset division of labour')
  }, 20_000)

  it('re-installs the frozen snapshot on every residency after a cold resume', async () => {
    const h = await stack({ members: [routedMember('member-route', 'member-model')] })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'FIRST_TASK' })
    expect(spawn.isError, resultText(spawn)).toBe(false)
    const row = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'reviewer')!
    await vi.waitFor(() => expect(memberRequests(h.member, row.id).length).toBeGreaterThan(0), { timeout: 5000 })

    await vi.waitFor(() => expect(h.ctx.agents.get(row.id)).toBeUndefined(), { timeout: 5000 })
    const before = h.member.requests.length
    await h.ctx.agentTeams.sendMessage(h.root, {
      target: 'reviewer',
      content: [{ type: 'text', text: 'RESUME_TASK' }],
      signal: new AbortController().signal,
    })
    await vi.waitFor(() => {
      expect(h.member.requests.slice(before).some(request => requestText(request).includes('RESUME_TASK'))).toBe(true)
    }, { timeout: 5000 })
    const resumed = h.member.requests.slice(before).find(request => requestText(request).includes('RESUME_TASK'))!
    // A finished member is resumed from its durable descriptor; the plugin's
    // scoped registrations must be installed again for the new residency.
    expect(resumed.provider).toBe('member-route')
    expect(resumed.model).toBe('member-model')
    expect(requestText(resumed)).toContain('UNIQUE_MEMBER_RULES')
    expect(resumed.tools?.map(tool => tool.name)).toEqual(['read'])
  }, 20_000)

  it('keeps an existing member on its frozen route while a new instance reads the corrected one', async () => {
    const h = await stack({ members: [routedMember('member-route', 'member-model')] })
    const first = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'FIRST_TASK' })
    expect(first.isError, resultText(first)).toBe(false)
    const original = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'reviewer')!
    await vi.waitFor(() => expect(memberRequests(h.member, original.id).length).toBeGreaterThan(0), { timeout: 5000 })

    // A Settings save corrects the member's route. The running task keeps the
    // definition it started with, and recovery work reaches the NEXT member.
    h.store(definition([routedMember('member-route-2', 'member-model-2')]))

    await vi.waitFor(() => expect(h.ctx.agents.get(original.id)).toBeUndefined(), { timeout: 5000 })
    const before = h.member.requests.length
    await h.ctx.agentTeams.sendMessage(h.root, {
      target: 'reviewer',
      content: [{ type: 'text', text: 'RESUME_OLD' }],
      signal: new AbortController().signal,
    })
    await vi.waitFor(() => {
      expect(h.member.requests.slice(before).some(request => requestText(request).includes('RESUME_OLD'))).toBe(true)
    }, { timeout: 5000 })
    const resumed = h.member.requests.slice(before).find(request => requestText(request).includes('RESUME_OLD'))!
    expect(resumed.model).toBe('member-model')

    // A NEW instance of the same role is created from the corrected route.
    const second = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'SECOND_TASK' })
    expect(second.isError, resultText(second)).toBe(false)
    const fresh = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'reviewer-2')!
    await vi.waitFor(() => expect(memberRequests(h.member, fresh.id).length).toBeGreaterThan(0), { timeout: 5000 })
    expect(memberRequests(h.member, fresh.id)[0]!.model).toBe('member-model-2')

    // Two instances, two independent snapshots.
    const unit = await h.storage.readUnit()
    const records = Object.values((unit?.tables as Record<string, Record<string, unknown>>)?.members ?? {})
    expect(records).toHaveLength(2)
    expect(new Set(records.map(record => (record as { childSessionId: string }).childSessionId)))
      .toEqual(new Set([original.id, fresh.id]))
  }, 25_000)

  it('gives two concurrent members of different Teams disjoint snapshots', async () => {
    const h = await stack({ members: [routedMember('member-route', 'member-model')], ids: { session: 'lead-a' } })
    const second = await stack({
      members: [slot({
        name: 'auditor',
        description: 'audits',
        systemPrompt: 'AUDITOR_RULES',
        provider: 'member-route-2',
        model: 'auditor-model',
        toolMode: 'custom',
        tools: ['read'],
      })],
      ids: { session: 'lead-b' },
    })
    const [a, b] = await Promise.all([
      call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'A_TASK' }),
      call(second.ctx, second.root, 'spawn_team_member', { member: 'auditor', task: 'B_TASK' }),
    ])
    expect(a.isError, resultText(a)).toBe(false)
    expect(b.isError, resultText(b)).toBe(false)
    const rowA = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'reviewer')!
    const rowB = second.ctx.agentTeams.listMembers(second.root).find(member => member.name === 'auditor')!
    await vi.waitFor(() => expect(memberRequests(h.member, rowA.id).length).toBeGreaterThan(0), { timeout: 5000 })
    await vi.waitFor(() => expect(memberRequests(second.member, rowB.id).length).toBeGreaterThan(0), { timeout: 5000 })
    expect(memberRequests(h.member, rowA.id)[0]!.model).toBe('member-model')
    expect(memberRequests(second.member, rowB.id)[0]!.model).toBe('auditor-model')
    expect(requestText(memberRequests(h.member, rowA.id)[0]!)).not.toContain('AUDITOR_RULES')
    expect(requestText(memberRequests(second.member, rowB.id)[0]!)).not.toContain('UNIQUE_MEMBER_RULES')
    // Each Team keeps its own writable unit; both hold exactly their own member.
    for (const [store, name] of [[h.storage, 'reviewer'], [second.storage, 'auditor']] as const) {
      const unit = await store.readUnit()
      const records = Object.values((unit?.tables as Record<string, Record<string, unknown>>)?.members ?? {})
      expect(records).toHaveLength(1)
      expect((records[0] as { memberName: string }).memberName).toBe(name)
    }
  }, 25_000)
})

describe('the member team section is a template, not a live roster', () => {
  it('names every preset role and states that the list is not live', async () => {
    const h = await stack({
      members: [
        routedMember('member-route', 'member-model'),
        slot({ name: 'executor', description: 'runs the work', provider: 'member-route', model: 'member-model' }),
      ],
    })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW_TASK' })
    expect(spawn.isError, resultText(spawn)).toBe(false)
    const row = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'reviewer')!
    await vi.waitFor(() => expect(memberRequests(h.member, row.id).length).toBeGreaterThan(0), { timeout: 5000 })
    const text = requestText(memberRequests(h.member, row.id)[0]!)
    expect(text).toContain('reviewer')
    expect(text).toContain('executor')
    expect(text).toContain('runs the work')
    expect(text).toContain('not a live roster')
    expect(text).toContain('list_agents')
    // The member section is its own prompt section, distinct from the briefing
    // the captain reads.
    expect(MEMBER_TEAM_SECTION).toBe('agent-team-presets:member-team')
  }, 20_000)
})
