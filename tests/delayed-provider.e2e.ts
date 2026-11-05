/**
 * The Web-side failure, reproduced and fixed end to end over the real official
 * stack: this plugin activates BEFORE the subagent providers it delegates to,
 * `spawn_team_member` is refused while they are absent, and the very same
 * activation creates a durable, correctly marked member once a provider
 * registers — without a plugin remount, a Host change, or a reordered config.
 *
 * The mount order here is the one the Host's concurrent plugin loader can
 * produce; nothing in the fixture emulates a timer or a retry.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { ReasoningEffortId, ToolCallId } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import * as JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import Subagents from '@deepseek-ai/dsh-subagent'
import * as Spawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import * as Fork from '@deepseek-ai/dsh-subagent-fork-in-process'
import TeamService from '@deepseek-ai/dsh-experimental-agent-team'
import { apply, inject } from '../src/index.ts'
import { MEMBER_FORK_PROVIDER, MEMBER_FRESH_PROVIDER } from '../src/member-identity.ts'
import { slot, team } from './fixtures/team-presets.ts'
import { FixtureSessionQuery } from './fixtures/session-query.ts'
import { memberRecords, mountMemberStorage } from './fixtures/member-storage.ts'
import type { MemberStorage } from './fixtures/member-storage.ts'
import { MockAdapter, textResponse } from './fixtures/mock-adapter.ts'
import { settlePlugin } from './fixtures/plugin-harness.ts'
import type { TeamPreset } from '../src/types.ts'
import { BUILTIN_TEAM_IDS } from '../src/builtin-teams.ts'
import { executeTool } from './fixtures/execute-tool.ts'

const contexts: Context[] = []
const temporary: string[] = []

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
  for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true })
})

/** One fixture root that is removed after the case. */
async function base(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'team-presets-delayed-provider-'))
  temporary.push(root)
  return root
}

/** Concatenated text of one tool result. */
function resultText(result: { content: readonly { type: string; text?: string }[] }): string {
  return result.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join('')
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

/** One member slot used by these cases. */
function reviewer(overrides: Partial<TeamPreset['members'][number]> = {}): TeamPreset['members'][number] {
  return slot({
    name: 'reviewer',
    description: 'reviews diffs',
    systemPrompt: 'MEMBER_RULES',
    provider: 'member-route',
    model: 'member-model',
    reasoningEffort: '',
    toolMode: 'all',
    ...overrides,
  })
}

/**
 * Compose the official stack with this plugin mounted BEFORE any provider.
 *
 * @param root - fixture root for sessions and the durable member unit.
 * @param configured - the plugin's configured upstream provider names.
 * @returns the mounted context, the Lead Agent, the adapters, and the storage unit.
 */
async function delayedStack(root: string, configured: { fresh: string; fork: string }) {
  const ctx = new Context()
  contexts.push(ctx)
  // Subagents requires the real working-directory owner; the testkit mounts
  // its filesystem and projection dependencies through this opt-in.
  await mountAgentLoopTestDependencies(ctx, { workingDirectory: true })
  await ctx.plugin(JsonlSessionPersistence, { root: join(root, 'sessions'), compression: 'none' })
  await ctx.plugin(FixtureSessionQuery)
  const storage: MemberStorage = await mountMemberStorage(ctx, join(root, 'storage'))
  await ctx.plugin(AgentLoop, { agents: [] })
  // The subagent SEAM exists; no provider is registered under the configured
  // names yet, which is exactly the state the Web deployment reached.
  await ctx.plugin(Subagents, { maxDepth: 2 })
  await ctx.plugin(TeamService)
  const lead = new MockAdapter(Array.from({ length: 60 }, () => textResponse('lead done')))
  const member = new MockAdapter(
    Array.from({ length: 60 }, () => textResponse('member done')),
    { efforts: [ReasoningEffortId('low'), ReasoningEffortId('high')].map(id => ({ id, name: String(id) })), defaultEffort: ReasoningEffortId('low') },
  )
  ctx.llm.registerAdapter(['mock'], lead)
  ctx.llm.registerAdapter(['member-route'], member)
  ctx.provide('settings', {
    configure: () => () => {},
    describe: () => [{ ns: 'agent-team-presets', revision: 0 }],
    update: async () => {},
  })
  const definition = team([reviewer()], { toolMode: 'all' })
  const config = {
    teams: { get: () => [definition] },
    selections: { get: () => [{ sessionId: 'lead', teamId: definition.id }] },
    freshProvider: configured.fresh,
    seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] },
    forkProvider: configured.fork,
  }
  // Activation order under test: plugin first, providers later.
  await ctx.plugin(Object.assign((owner: Context) => apply(owner, config), { inject }))
  const root_ = (await ctx.agents.create({
    sessionId: SessionId('lead'),
    agentOptions: { provider: 'mock', model: 'lead-model', reasoningEffort: ReasoningEffortId('high') },
  })).agent
  return { ctx, root: root_, lead, member, storage, definition }
}

/** The leading teammate row of one Session's roster, when a member was created. */
function memberRow(ctx: Context, root: Agent) {
  return ctx.agentTeams.listMembers(root).find(row => row.name === 'reviewer')
}

describe('a provider that activates after this plugin', () => {
  it('refuses member creation while the provider is absent', async () => {
    const h = await delayedStack(await base(), { fresh: 'late-spawn', fork: 'late-fork' })
    await settlePlugin()

    // The Session's Team applied and the member tool is mounted…
    expect(h.ctx.tools.get('spawn_team_member', h.root)).toBeDefined()
    expect(h.ctx.subagents.getProvider(MEMBER_FRESH_PROVIDER)).toBeUndefined()

    const refused = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW' })
    expect(refused.isError).toBe(true)
    expect(resultText(refused)).toContain('registers no subagent provider named "late-spawn"')
    // A refused creation is not a member: no durable intent, no roster row, no request.
    expect(memberRow(h.ctx, h.root)).toBeUndefined()
    expect(h.member.requests).toHaveLength(0)
  }, 20000)

  it('creates a durable marked member in the SAME activation once the provider appears', async () => {
    const h = await delayedStack(await base(), { fresh: 'late-spawn', fork: 'late-fork' })
    await settlePlugin()
    expect(resultText(await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'EARLY' })).length).toBeGreaterThan(0)
    expect(h.member.requests).toHaveLength(0)

    // The provider plugin activates against the already-running Host.
    await h.ctx.plugin(Spawn, { providerName: 'late-spawn' })
    expect(h.ctx.subagents.getProvider(MEMBER_FRESH_PROVIDER)).toBeDefined()

    const created = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW' })
    expect(resultText(created), resultText(created)).not.toContain('Error')

    const row = memberRow(h.ctx, h.root)
    expect(row).toBeDefined()
    // The Host itself persisted this plugin's alias as the member's execution
    // backend, so the member stays identifiable without its snapshot.
    expect(row?.provider).toBe(MEMBER_FRESH_PROVIDER)
    await vi.waitFor(() => expect(h.member.requests.length).toBeGreaterThan(0))
    expect(h.member.requests[0]?.sessionId).toBe(row?.id)

    // The durable unit recorded the member under its frozen configuration.
    const records = await memberRecords(h.storage)
    expect(records.map(record => record.memberName)).toEqual(['reviewer'])
  }, 30000)

  it('fails a fresh member over while the fork provider is still absent, then serves both', async () => {
    const h = await delayedStack(await base(), { fresh: 'late-spawn', fork: 'late-fork' })
    await settlePlugin()
    await h.ctx.plugin(Spawn, { providerName: 'late-spawn' })

    const fresh = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'FRESH' })
    expect(resultText(fresh), resultText(fresh)).not.toContain('Error')

    // Only the FORK context is refused, and with its own reason.
    const forked = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'FORK', context: 'fork' })
    expect(forked.isError).toBe(true)
    expect(resultText(forked)).toContain('registers no subagent provider named "late-fork"')

    await h.ctx.plugin(Fork, { providerName: 'late-fork' })
    expect(h.ctx.subagents.getProvider(MEMBER_FORK_PROVIDER)).toBeDefined()
    const forkedNow = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'FORK', context: 'fork' })
    expect(resultText(forkedNow), resultText(forkedNow)).not.toContain('Error')

    const rows = h.ctx.agentTeams.listMembers(h.root).filter(row => row.name !== 'lead' && row.role === 'teammate')
    expect(rows.map(row => row.provider).sort()).toEqual([MEMBER_FORK_PROVIDER, MEMBER_FRESH_PROVIDER])
  }, 30000)

  it('refuses new members when the provider is withdrawn, then recovers on re-registration', async () => {
    const root = await base()
    const h = await delayedStack(root, { fresh: 'late-spawn', fork: 'late-fork' })
    await settlePlugin()
    const spawn = await h.ctx.plugin(Spawn, { providerName: 'late-spawn' })
    expect(resultText(await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'BEFORE' })))
      .not.toContain('Error')
    expect(h.member.requests).toHaveLength(1)

    // Withdraw the provider: a new creation must be refused, not silently
    // delegated to the deployment's own provider.
    await spawn.dispose()
    expect(h.ctx.subagents.getProvider(MEMBER_FRESH_PROVIDER)).toBeUndefined()
    const refused = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'WITHDRAWN' })
    expect(refused.isError).toBe(true)
    expect(resultText(refused)).toContain('registers no subagent provider named "late-spawn"')
    expect(h.member.requests).toHaveLength(1)

    // Re-registering the provider restores creation in the same activation.
    await h.ctx.plugin(Spawn, { providerName: 'late-spawn' })
    const recovered = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'AFTER' })
    expect(resultText(recovered), resultText(recovered)).not.toContain('Error')
    await vi.waitFor(() => expect(h.member.requests).toHaveLength(2))
  }, 30000)
})
