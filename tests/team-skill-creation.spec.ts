/**
 * What a member's FIRST turn proves about its assigned Team Skills.
 *
 * The whole point of an assignment is that the member can load it. The host
 * publishes the model-facing catalog from a step boundary and only while the
 * `skill` tool stays visible, so "the provider was registered before the member
 * started" is the only thing that makes an assignment real. These cases run the
 * production composition — real Team service, real subagent providers, real
 * SkillRegistry and the real `skill` tool — and assert on the member's OWN first
 * request, not on a mock's argument list.
 *
 * They also pin the two refusal paths: a role that holds assigned Team Skills
 * but whose deployment cannot publish them must not be created silently, and a
 * deployment that composes no skill service must still create members whose
 * roles hold nothing.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import * as JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import Subagents from '@deepseek-ai/dsh-subagent'
import * as Spawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import TeamService from '@deepseek-ai/dsh-experimental-agent-team'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import * as toolSkill from '@deepseek-ai/dsh-tool-skill'
import { apply, inject } from '../src/index.ts'
import { buildSkillPackage } from '../src/team-skills/import.ts'
import { TeamSkillManager } from '../src/team-skills/manager.ts'
import { TeamSkillStore } from '../src/team-skills/store.ts'
import { settlePlugin, waitForTeamApplication } from './fixtures/plugin-harness.ts'
import { FixtureSessionQuery } from './fixtures/session-query.ts'
import { mountMemberStorage } from './fixtures/member-storage.ts'
import { MockAdapter, textResponse } from './fixtures/mock-adapter.ts'
import { slot, team } from './fixtures/team-presets.ts'
import type { TeamPreset } from '../src/types.ts'
import { BUILTIN_TEAM_IDS } from '../src/builtin-teams.ts'

const contexts: Context[] = []
const temporary: string[] = []

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
  for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true })
})

/** Concatenated text of one tool result. */
function resultText(result: { content: readonly { type: string; text?: string }[] }): string {
  return result.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join('')
}

/** Everything one request carried as model-visible text. */
function requestText(request: GenerateOptions): string {
  return JSON.stringify(request.messages)
}

/** Execute one tool as one Agent. */
async function call(ctx: Context, agent: Agent, name: string, args: object = {}) {
  return ctx.tools.execute({
    callId: ToolCallId(crypto.randomUUID()),
    name,
    arguments: args,
    agent,
    signal: new AbortController().signal,
  })
}

/** One temporary directory, removed after the case. */
async function base(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix))
  temporary.push(root)
  return root
}

/** The member slot these cases summon, restricted to one unrelated tool. */
function reviewer(): TeamPreset['members'][number] {
  return slot({
    id: 'reviewer',
    name: 'reviewer',
    description: 'reviews diffs',
    systemPrompt: 'MEMBER_RULES',
    provider: 'member-route',
    model: 'member-model',
    reasoningEffort: '',
    // The custom allow-list deliberately omits `skill`: the policy must admit
    // it anyway, or the assignment would never reach the model.
    toolMode: 'custom',
    tools: ['read'],
  })
}

/** One Team whose only member is {@link reviewer}. */
function definition(overrides: Partial<TeamPreset['members'][number]> = {}): TeamPreset {
  return team([{ ...reviewer(), ...overrides }], { systemPrompt: 'CAPTAIN_RULES', toolMode: 'custom', tools: ['spawn_team_member'] })
}

/**
 * Compose the production stack for one case.
 *
 * @param options - the skill root to use, and whether this deployment composes
 *   the skill service and its `skill` tool.
 * @returns the mounted context, the Session root, and the member adapter.
 */
async function stack(options: {
  skillRoot: string
  withSkillService: boolean
  definition?: TeamPreset
  /** Compose the skill service only AFTER the Session root was created. */
  composeSkillServiceLater?: boolean
  /**
   * Return as soon as `agents.create()` resolves, with no settling-window
   * afterwards: that is the only way to observe what the creation edge itself
   * guaranteed, instead of what a later macrotask happened to finish.
   */
  inspectAtCreation?: boolean
}) {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx, { workingDirectory: true })
  const sessionRoot = await base('team-skill-creation-sessions-')
  await ctx.plugin(JsonlSessionPersistence, { root: sessionRoot, compression: 'none' })
  await ctx.plugin(FixtureSessionQuery)
  await mountMemberStorage(ctx, await base('team-skill-creation-storage-'))
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(Subagents)
  await ctx.plugin(Spawn, { providerName: 'spawn' })
  await ctx.plugin(TeamService)
  let composed = false
  const composeSkillService = async (): Promise<void> => {
    if (composed) return
    composed = true
    await ctx.plugin(SkillRegistry)
    await ctx.plugin(toolSkill)
  }
  if (options.withSkillService && options.composeSkillServiceLater !== true) await composeSkillService()
  if (options.composeSkillServiceLater === true) {
    // Composed while the creation edge is running, which is the real ordering a
    // concurrently loading Host produces: the plugin activates before the skill
    // service, and the root's first request must still see its catalog.
    ctx.on('agent/created', async () => { await composeSkillService() })
  }
  for (const name of ['read', 'write']) {
    ctx.tools.register({
      name, description: `${name} fixture`, parameters: {},
      output: { schema: { type: 'string' }, render: () => [] },
      async execute() { return 'executed' },
    })
  }
  const lead = new MockAdapter(Array.from({ length: 30 }, () => textResponse('lead done')))
  const member = new MockAdapter(Array.from({ length: 30 }, () => textResponse('member done')))
  ctx.llm.registerAdapter(['mock'], lead)
  ctx.llm.registerAdapter(['member-route'], member)
  ctx.provide('settings', {
    configure: () => () => {},
    describe: () => [{ ns: 'agent-team-presets', revision: 0 }],
    update: async () => {},
  })
  const current = options.definition ?? definition()
  const config = {
    teams: { get: () => [current] },
    selections: { get: () => [{ sessionId: 'lead', teamId: current.id }] },
    freshProvider: 'spawn',
    forkProvider: 'fork',
    seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] },
    skillRoot: options.skillRoot,
  }
  await ctx.plugin(Object.assign((owner: Context) => apply(owner, config), { inject }))
  const root = await ctx.agents.create({
    sessionId: SessionId('lead'),
    agentOptions: { provider: 'mock', model: 'lead-model' },
  })
  if (options.inspectAtCreation !== true) {
    await settlePlugin()
    await waitForTeamApplication(ctx, root.agent)
  }
  return { ctx, root: root.agent, member, lead }
}

/** Install one asset in the private library and bind it to the member role. */
async function bindAsset(root: string, definition_: TeamPreset = definition()): Promise<string> {
  const store = new TeamSkillStore(root)
  await store.open()
  const built = buildSkillPackage([{
    path: 'SKILL.md',
    bytes: new TextEncoder().encode('---\nname: release-check\ndescription: Verify a release before tagging\n---\n\nRELEASE_BODY\n'),
  }])
  if (!built.ok) throw new Error('fixture is not a legal skill')
  await store.install(built.skill, { id: 'custom:release-check', origin: 'custom', version: '1' })
  const manager = new TeamSkillManager(store, root, {
    teams: () => [definition_],
    activeAssetIds: () => new Set(),
    activeSessions: () => [],
  })
  await manager.open()
  const assigned = await manager.assign({ teamId: definition_.id, roleId: 'reviewer', assetId: 'custom:release-check' })
  if (!assigned.ok) throw new Error(`fixture could not bind: ${assigned.reason}`)
  return 'custom:release-check'
}

/**
 * The roster row a vetoed creation leaves behind, if any.
 *
 * The Host records the attempt on its roster and marks it `failed` with this
 * plugin's refusal as the diagnostic; that row IS the observable failure the
 * summoner reads. What must never exist is a member that reached its first
 * request.
 * @param ctx - the composed context.
 * @param root - the Session root that summoned the member.
 * @param name - the member name.
 * @returns the failed roster row, or undefined when none exists.
 */
function refusedRow(ctx: Context, root: Agent, name: string): { status?: string; diagnostics?: readonly string[] } | undefined {
  const rows = ctx.agentTeams.listMembers(root).filter(member => member.name === name)
  expect(rows.length).toBeLessThanOrEqual(1)
  if (rows.length === 0) return undefined
  const row = rows[0] as { status?: string; diagnostics?: readonly string[] }
  expect(row.status).toBe('failed')
  expect((row.diagnostics ?? []).join(' ')).toContain('Team Skill')
  return row
}

/** The requests one member route received for one child session. */
function memberRequests(member: MockAdapter, childId: string): GenerateOptions[] {
  return member.requests.filter(request => request.sessionId === childId)
}

describe('a member with an assigned Team Skill', () => {
  it('receives the catalog and the skill tool on its very first request', async () => {
    const skillRoot = await base('team-skill-creation-library-')
    await bindAsset(skillRoot)
    const h = await stack({ skillRoot, withSkillService: true })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW_TASK' })
    expect(spawn.isError, resultText(spawn)).toBe(false)
    const row = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'reviewer')!
    await vi.waitFor(() => expect(memberRequests(h.member, row.id).length).toBeGreaterThan(0), { timeout: 5000 })
    const first = memberRequests(h.member, row.id)[0]!
    // R1: the custom allow-list omits `skill`, and the member must still see it.
    expect(first.tools?.map(tool => tool.name)).toEqual(expect.arrayContaining(['read', 'skill']))
    // R2: the assigned name is already in the catalog of the FIRST request.
    expect(requestText(first)).toContain('release-check')
    expect(requestText(first)).toContain('Verify a release before tagging')
  }, 30_000)

  it('does not publish an unbound Team Skill to the member', async () => {
    const skillRoot = await base('team-skill-creation-unbound-')
    await bindAsset(skillRoot)
    const other = definition()
    const h = await stack({
      skillRoot,
      withSkillService: true,
      definition: team([{ ...reviewer() }, {
        ...slot({ id: 'auditor', name: 'auditor', description: 'audits', provider: 'member-route', model: 'member-model' }),
      }], {
        systemPrompt: 'CAPTAIN_RULES', toolMode: 'custom', tools: ['spawn_team_member'],
      }),
    })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'auditor', task: 'AUDIT_TASK' })
    expect(spawn.isError, resultText(spawn)).toBe(false)
    const row = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'auditor')!
    await vi.waitFor(() => expect(memberRequests(h.member, row.id).length).toBeGreaterThan(0), { timeout: 5000 })
    // The assignment belongs to `reviewer`; `auditor` must not inherit it.
    expect(requestText(memberRequests(h.member, row.id)[0]!)).not.toContain('release-check')
    expect(other.members.map(member => member.id)).toContain('reviewer')
  }, 30_000)

  it('refuses creation when the deployment composes no skill service', async () => {
    const skillRoot = await base('team-skill-creation-noservice-')
    await bindAsset(skillRoot)
    const h = await stack({ skillRoot, withSkillService: false })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW_TASK' })
    expect(spawn.isError).toBe(true)
    // The refusal names the reason instead of letting the member start blind.
    expect(resultText(spawn)).toContain('Team Skill')
    expect(refusedRow(h.ctx, h.root, 'reviewer')).toBeDefined()
    expect(h.member.requests).toHaveLength(0)
  }, 30_000)

  it('refuses creation when the private library cannot be read', async () => {
    // A regular file where the library directory belongs: opening the store
    // fails, so this activation cannot even enumerate the role's bindings.
    const root = await base('team-skill-creation-broken-')
    await writeFile(join(root, 'library'), 'not a directory')
    const h = await stack({ skillRoot: join(root, 'library', 'team-skills'), withSkillService: true })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW_TASK' })
    expect(spawn.isError).toBe(true)
    expect(refusedRow(h.ctx, h.root, 'reviewer')).toBeDefined()
    expect(h.member.requests).toHaveLength(0)
  }, 30_000)

  it('refuses creation when the skill service rejects the registration', async () => {
    const skillRoot = await base('team-skill-creation-rejected-')
    await bindAsset(skillRoot)
    const register = vi.spyOn(SkillRegistry.prototype, 'registerProvider')
      .mockImplementation(() => { throw new Error('registration refused by fixture') })
    try {
      const h = await stack({ skillRoot, withSkillService: true })
      const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW_TASK' })
      expect(spawn.isError).toBe(true)
      expect(refusedRow(h.ctx, h.root, 'reviewer')).toBeDefined()
      expect(h.member.requests).toHaveLength(0)
    } finally {
      register.mockRestore()
    }
  }, 30_000)

  it('refuses the same way on a retry, so a veto leaves no stale state behind', async () => {
    const skillRoot = await base('team-skill-creation-retry-')
    await bindAsset(skillRoot)
    const h = await stack({ skillRoot, withSkillService: false })
    const first = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'FIRST' })
    expect(first.isError).toBe(true)
    const second = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'SECOND' })
    // A second attempt reports the same reason instead of succeeding on leaked
    // state or hanging on a promise the first attempt left unresolved.
    expect(second.isError).toBe(true)
    expect(resultText(second)).toContain('Team Skill')
    expect(h.member.requests).toHaveLength(0)
  }, 30_000)

  it('publishes the captain assignment on its first request', async () => {
    const skillRoot = await base('team-skill-creation-captain-')
    const captainTeam = team([], { systemPrompt: 'CAPTAIN_RULES', toolMode: 'custom', tools: ['read'] })
    const store = new TeamSkillStore(skillRoot)
    await store.open()
    const built = buildSkillPackage([{
      path: 'SKILL.md',
      bytes: new TextEncoder().encode('---\nname: release-check\ndescription: Verify a release before tagging\n---\n\nRELEASE_BODY\n'),
    }])
    if (!built.ok) throw new Error('fixture is not a legal skill')
    await store.install(built.skill, { id: 'custom:release-check', origin: 'custom', version: '1' })
    const manager = new TeamSkillManager(store, skillRoot, {
      teams: () => [captainTeam], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    expect(await manager.assign({ teamId: captainTeam.id, roleId: 'captain', assetId: 'custom:release-check', captain: true }))
      .toMatchObject({ ok: true })
    const h = await stack({ skillRoot, withSkillService: true, definition: captainTeam })
    h.root.followup(createUserMessage({ content: [{ type: 'text', text: 'CAPTAIN_TASK' }], source: { kind: 'user' } }))
    await vi.waitFor(() => expect(h.lead.requests.length).toBeGreaterThan(0), { timeout: 5000 })
    const first = h.lead.requests[0]!
    // The captain's own first request carries the assigned skill's catalog, and
    // its custom allow-list still admits the `skill` tool that publishes it.
    expect(first.tools?.map(tool => tool.name)).toEqual(expect.arrayContaining(['read', 'skill']))
    expect(requestText(first)).toContain('release-check')
  }, 30_000)

  it('applies the Team and reports a captain assignment it cannot publish', async () => {
    const skillRoot = await base('team-skill-creation-captain-degraded-')
    const captainTeam = team([], { systemPrompt: 'CAPTAIN_RULES', toolMode: 'custom', tools: ['read'] })
    const store = new TeamSkillStore(skillRoot)
    await store.open()
    const built = buildSkillPackage([{
      path: 'SKILL.md',
      bytes: new TextEncoder().encode('---\nname: release-check\ndescription: Verify a release before tagging\n---\n\nRELEASE_BODY\n'),
    }])
    if (!built.ok) throw new Error('fixture is not a legal skill')
    await store.install(built.skill, { id: 'custom:release-check', origin: 'custom', version: '1' })
    const manager = new TeamSkillManager(store, skillRoot, {
      teams: () => [captainTeam], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    expect(await manager.assign({ teamId: captainTeam.id, roleId: 'captain', assetId: 'custom:release-check', captain: true }))
      .toMatchObject({ ok: true })
    const h = await stack({ skillRoot, withSkillService: false, definition: captainTeam })
    // The Team is applied regardless: a Session that is already running must keep
    // its capability policy even when one of its assigned skills cannot be
    // published. The captain's assignment is reported instead of silently lost.
    const names = h.ctx.tools.schemas(h.root).map(schema => schema.name)
    expect(names).toContain('spawn_team_member')
    expect(names).toContain('read')
    h.root.followup(createUserMessage({ content: [{ type: 'text', text: 'CAPTAIN_TASK' }], source: { kind: 'user' } }))
    await vi.waitFor(() => expect(h.lead.requests.length).toBeGreaterThan(0), { timeout: 5000 })
    // No catalog, because this deployment composes no service to publish one.
    expect(requestText(h.lead.requests[0]!)).not.toContain('release-check')
  }, 30_000)

  it('still publishes the captain catalog when the service composes during the creation edge', async () => {
    const skillRoot = await base('team-skill-creation-late-service-')
    const captainTeam = team([], { systemPrompt: 'CAPTAIN_RULES', toolMode: 'custom', tools: ['read'] })
    const store = new TeamSkillStore(skillRoot)
    await store.open()
    const built = buildSkillPackage([{
      path: 'SKILL.md',
      bytes: new TextEncoder().encode('---\nname: release-check\ndescription: Verify a release before tagging\n---\n\nRELEASE_BODY\n'),
    }])
    if (!built.ok) throw new Error('fixture is not a legal skill')
    await store.install(built.skill, { id: 'custom:release-check', origin: 'custom', version: '1' })
    const manager = new TeamSkillManager(store, skillRoot, {
      teams: () => [captainTeam], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    expect(await manager.assign({ teamId: captainTeam.id, roleId: 'captain', assetId: 'custom:release-check', captain: true }))
      .toMatchObject({ ok: true })
    const h = await stack({ skillRoot, withSkillService: true, composeSkillServiceLater: true, definition: captainTeam })
    h.root.followup(createUserMessage({ content: [{ type: 'text', text: 'CAPTAIN_TASK' }], source: { kind: 'user' } }))
    await vi.waitFor(() => expect(h.lead.requests.length).toBeGreaterThan(0), { timeout: 5000 })
    const first = h.lead.requests[0]!
    // The registration was awaited at the creation edge even though the service
    // only composed while that edge was running.
    expect(first.tools?.map(tool => tool.name)).toEqual(expect.arrayContaining(['read', 'skill']))
    expect(requestText(first)).toContain('release-check')
  }, 30_000)

  it('finishes the captain registration inside the creation edge itself', async () => {
    const skillRoot = await base('team-skill-creation-edge-')
    const captainTeam = team([], { systemPrompt: 'CAPTAIN_RULES', toolMode: 'custom', tools: ['read'] })
    const store = new TeamSkillStore(skillRoot)
    await store.open()
    const built = buildSkillPackage([{
      path: 'SKILL.md',
      bytes: new TextEncoder().encode('---\nname: release-check\ndescription: Verify a release before tagging\n---\n\nRELEASE_BODY\n'),
    }])
    if (!built.ok) throw new Error('fixture is not a legal skill')
    await store.install(built.skill, { id: 'custom:release-check', origin: 'custom', version: '1' })
    const manager = new TeamSkillManager(store, skillRoot, {
      teams: () => [captainTeam], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    expect(await manager.assign({ teamId: captainTeam.id, roleId: 'captain', assetId: 'custom:release-check', captain: true }))
      .toMatchObject({ ok: true })
    const h = await stack({ skillRoot, withSkillService: true, definition: captainTeam, inspectAtCreation: true })
    // No settling window: whatever is published now is what the creation edge
    // itself awaited. A member/captain that only becomes ready on a later
    // macrotask would already have started its first request by this point.
    const published = await h.ctx.skills.list({ scope: h.root })
    expect(published.map(skill => skill.name)).toContain('release-check')
    expect(h.ctx.tools.get('skill', h.root)).toBeDefined()
    expect(h.ctx.tools.get('spawn_team_member', h.root)).toBeDefined()
  }, 30_000)

  it('still creates a member whose role holds no assignment without a skill service', async () => {
    const skillRoot = await base('team-skill-creation-empty-')
    // An opened but empty library: zero bindings is a fact, not a failure.
    const store = new TeamSkillStore(skillRoot)
    await store.open()
    const h = await stack({ skillRoot, withSkillService: false })
    const spawn = await call(h.ctx, h.root, 'spawn_team_member', { member: 'reviewer', task: 'REVIEW_TASK' })
    expect(spawn.isError, resultText(spawn)).toBe(false)
    const row = h.ctx.agentTeams.listMembers(h.root).find(member => member.name === 'reviewer')
    expect(row).toBeDefined()
    await vi.waitFor(() => expect(memberRequests(h.member, row!.id).length).toBeGreaterThan(0), { timeout: 5000 })
  }, 30_000)
})
