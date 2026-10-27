/**
 * Whether an assigned Team Skill can actually reach the model.
 *
 * Registering a provider in one Agent scope is necessary but not sufficient: the
 * host publishes the model-facing catalog from `agent/pre-step`, and it reads
 * that catalog only while the exact `skill` tool definition stays visible to the
 * same Agent. A policy that hides that definition therefore leaves an assignment
 * installed and invisible, so the plugin admits the tool for every Team policy:
 * the catalog is not a capability, and an assignment has to be usable.
 *
 * These cases run the real registry, the real tool and the real waterfall; a
 * stub would prove only that this file can call itself.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { provideWorkingDirectoryFixture } from '@deepseek-ai/dsh-agent-loop-testkit'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { agentEvents, type Agent } from '@deepseek-ai/dsh-agent'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies, mountAgentLoopTestHarness } from '@deepseek-ai/dsh-agent-loop-testkit'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import * as toolSkill from '@deepseek-ai/dsh-tool-skill'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { buildSkillPackage } from '../src/team-skills/import.ts'
import { TeamSkillManager } from '../src/team-skills/manager.ts'
import { TeamSkillRuntime } from '../src/team-skills/provider.ts'
import { TeamSkills } from '../src/team-skills/index.ts'
import { TeamSkillStore } from '../src/team-skills/store.ts'
import { guardPolicy, inheritedFilter, policyOf } from '../src/tool-policy.ts'
import { toolMode } from '../src/presets.ts'
import { captainSlot, slot, team } from './fixtures/team-presets.ts'

const roots: string[] = []
const contexts: Context[] = []
afterEach(async () => {
  for (const ctx of contexts.splice(0)) await ctx.fiber.dispose()
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true })
})

/** One legal skill folder with a distinctive body. */
const BODY = '---\nname: release-check\ndescription: Verify a release before tagging\n---\n\nFollow the release checklist.\n'

/** One stored asset identifier used by these cases. */
const ASSET_ID = 'custom:release-check'

/** Boot the smallest composition that can produce a real model-facing catalog. */
async function setup(options: { skillTool?: boolean } = {}): Promise<{ ctx: Context; root: string; agent: Agent }> {
  const ctx = new Context()
  contexts.push(ctx)
  const root = await mkdtemp(join(tmpdir(), "team-skill-visibility-"))
  roots.push(root)
  // The testkit already mounts SystemPrompt, ToolRuntime and AgentRegistry.
  await mountAgentLoopTestDependencies(ctx, { workingDirectory: true })
  await ctx.plugin(SkillRegistry)
  if (options.skillTool !== false) await ctx.plugin(toolSkill)
  // A second global tool, so an allow-list can keep the catalog while naming
  // something else, and lose the catalog when it omits the skill tool.
  await ctx.plugin({
    name: 'read-file-fixture',
    inject: ['tools'],
    apply: (inner: Context) => {
      inner.tools.register(defineTool({
        name: 'read_file',
        description: 'Read one file.',
        parameters: { path: { type: 'string', required: true } },
        output: { schema: { type: 'object', additionalProperties: true, properties: {} } },
        execute: async () => ({}),
      }))
    },
  })
  await mountAgentLoopTestHarness(ctx)
  const { agent } = await ctx.agents.create({ sessionId: 'root' as never, agentOptions: { provider: 'mock', model: 'mock' } })
  return { ctx, root, agent }
}

/** Install one asset and bind it to one Team role. */
async function bindAsset(root: string): Promise<{ store: TeamSkillStore; manager: TeamSkillManager }> {
  const store = new TeamSkillStore(root)
  await store.open()
  const built = buildSkillPackage([{ path: "SKILL.md", bytes: new TextEncoder().encode(BODY) }])
  if (!built.ok) throw new Error("fixture is not a legal skill")
  await store.install(built.skill, { id: ASSET_ID, origin: 'custom', version: '1' })
  const manager = new TeamSkillManager(store, root, {
    teams: () => [team([slot({ name: "reviewer" })], { name: "captain" })],
    activeAssetIds: () => new Set(), activeSessions: () => [],
  })
  await manager.open()
  await manager.assign({ teamId: 'team-1', roleId: 'reviewer', assetId: ASSET_ID })
  return { store, manager }
}

/** The skill names the host would put in front of this Agent. */
async function publishedSkillNames(ctx: Context, agent: Agent): Promise<string[]> {
  const decision = await agentEvents(ctx, agent).waterfall(
    'agent/pre-step',
    { messages: [], turn: 1, step: 1, signal: new AbortController().signal },
    () => Promise.resolve({ kind: 'enter' as const, messages: [] }),
  )
  if (decision.kind !== "enter") return []
  return decision.messages.flatMap((message) => {
    const source = message.source as { kind?: string; entries?: { name: string }[] } | undefined
    return source?.kind === 'skill-catalog' ? (source.entries ?? []).map(entry => entry.name) : []
  })
}

describe('an assigned Team Skill reaches the model', () => {
  it('publishes the assigned name while the skill tool stays visible', async () => {
    const { ctx, root, agent } = await setup()
    const { store, manager } = await bindAsset(root)
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    await runtime.sync({ agent, assets: manager.assetsFor('team-1', 'reviewer') })
    expect(await publishedSkillNames(ctx, agent)).toContain("release-check")
  })

  it('keeps the catalog reachable under a custom allow-list that omits the skill tool', async () => {
    const { ctx, root, agent } = await setup()
    const { store, manager } = await bindAsset(root)
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    await runtime.sync({ agent, assets: manager.assetsFor('team-1', 'reviewer') })
    // The policy layer an applied Team installs, not a hand-made restriction:
    // what a role may DO stays limited to the allow-list, but the catalog that
    // delivers its assigned skills must survive.
    const policy = policyOf('team-1', slot({ toolMode: 'custom', tools: ['read_file'] }))
    const filter = inheritedFilter(agent, policy)
    expect(filter?.allow).toContain("skill")
    expect(filter?.allow).toContain("read_file")
    const dispose = agent.ctx.tools.restrict(filter!)
    expect(await publishedSkillNames(ctx, agent)).toContain("release-check")
    dispose()
  })

  it('binds to a custom role without asking the operator to allow the skill tool', async () => {
    const { root } = await setup()
    const store = new TeamSkillStore(root)
    await store.open()
    const built = buildSkillPackage([{ path: "SKILL.md", bytes: new TextEncoder().encode(BODY) }])
    if (!built.ok) throw new Error("fixture is not a legal skill")
    await store.install(built.skill, { id: ASSET_ID, origin: 'custom', version: '1' })
    const manager = new TeamSkillManager(store, root, {
      teams: () => [team([
        // A role that restricts itself to one unrelated tool. Mounting a skill
        // here is the ordinary case the operator expects to work.
        slot({ name: "restricted", id: "restricted", toolMode: "custom", tools: ["read_file"] }),
      ], { name: "captain" })],
      activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    const assigned = await manager.assign({ teamId: "team-1", roleId: "restricted", assetId: ASSET_ID })
    expect(assigned.ok).toBe(true)
    expect(manager.assetsFor("team-1", "restricted").map(asset => asset.id)).toEqual([ASSET_ID])
  })

  it('resolves syncAgent only after the provider is registered', async () => {
    const { ctx, root, agent } = await setup()
    const { store, manager } = await bindAsset(root)
    const subsystem = new TeamSkills(
      ctx, root, () => [team([slot({ name: "reviewer" })], { name: "captain" })],
      () => {},
    )
    await subsystem.open(() => {})
    // Publication must already hold on the awaited edge: a member that starts
    // its first request before this resolves would see an empty catalog.
    await subsystem.syncAgent(agent, { teamId: "team-1", roleId: "reviewer", captain: false })
    expect(await publishedSkillNames(ctx, agent)).toContain("release-check")
    expect(subsystem.manager.list().length).toBeGreaterThan(0)
    await subsystem.close()
    expect(store.list().length).toBeGreaterThan(0)
  })

  it('installs the persisted member policy and still publishes the catalog', async () => {
    const { ctx, root, agent } = await setup()
    const { store, manager } = await bindAsset(root)
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    await runtime.sync({ agent, assets: manager.assetsFor("team-1", "reviewer") })
    // Exactly what member-runtime installs from a durable record: the stored
    // allow-list is copied verbatim, then a guard and a restriction are added.
    const record = { teamId: "team-1", mode: "custom" as const, allow: ["read_file"] }
    const policy = { teamId: record.teamId, mode: record.mode, allow: [...record.allow] }
    const disposeGuard = guardPolicy(agent, policy, { role: "member", presentation: "caller" })
    const filter = inheritedFilter(agent, policy)
    const disposeRestrict = agent.ctx.tools.restrict(filter!)
    expect(await publishedSkillNames(ctx, agent)).toContain("release-check")
    disposeRestrict()
    disposeGuard()
  })

  it('does not name the skill tool when the deployment composes no skill tool', async () => {
    const { ctx, agent } = await setup({ skillTool: false })
    // Naming an absent global tool would make the real restriction throw and
    // break the role, so the filter must simply omit it.
    const filter = inheritedFilter(agent, { teamId: "team-1", mode: "custom", allow: ["read_file"] })
    expect(filter?.allow).toEqual(["read_file"])
    expect(() => agent.ctx.tools.restrict(filter!).call(undefined)).not.toThrow()
  })
})
