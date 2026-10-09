/** Plugin reconciliation, per-Session application lifecycle, and the tool catalog. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import type { AgentHandle } from '@deepseek-ai/dsh-agent'
import { SessionId } from '@deepseek-ai/dsh-session'
import { apply, inject } from '../src/index.ts'
import type { Config } from '../src/config.ts'
import TeamPresetsToolCatalog from '../src/tool-catalog.ts'
import { routedCaptain, team } from './fixtures/team-presets.ts'
import type { TeamPreset, TeamSelectionRecord } from '../src/types.ts'

const contexts: Context[] = []

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
})

/** Writable stand-in for one volatile Config reference. */
function volatileRef<T>(initial: T): { ref: { get: () => T }; set: (next: T) => void } {
  let current = initial
  return { ref: { get: () => current }, set: (next) => { current = next } }
}

const TEAM: TeamPreset = team([], { systemPrompt: 'Captain prompt' })

/** Let the settings rewrite settle, so its warn lands before an assertion. */
async function settle(): Promise<void> {
  await new Promise<void>((resolve) => { setTimeout(resolve, 0) })
}

/** Mount the loop dependencies plus the two services `apply` reads. */
async function setup(teams: TeamPreset[], selections: TeamSelectionRecord[]) {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  const teamsRef = volatileRef(teams)
  const selectionsRef = volatileRef(selections)
  ctx.provide('agentTeams', { spawnTeammate: async () => ({ member: { name: 'member', status: 'active' } }) })
  const configure = vi.fn(() => () => {})
  const update = vi.fn(async (_ns: string, _patch: { teams: TeamPreset[] }) => {})
  ctx.provide('settings', { configure, update })
  const config = {
    teams: teamsRef.ref,
    selections: selectionsRef.ref,
    freshProvider: 'spawn',
    forkProvider: 'fork',
  } satisfies Config
  return { ctx, config, teamsRef, selectionsRef, configure, update }
}

/**
 * Activate the plugin in its own fiber, so the test can dispose it exactly as
 * the Loader would. The wrapper keeps the plugin's own inject list because
 * `apply` reaches every service through the fiber's property proxy.
 */
async function mount(ctx: Context, config: Config) {
  return await ctx.plugin(Object.assign((inner: Context) => { apply(inner, config) }, { inject }))
}

async function createAgent(ctx: Context, id: string, origin?: 'subagent'): Promise<AgentHandle> {
  return await ctx.agents.create({
    sessionId: SessionId(id),
    ...origin === undefined ? {} : { meta: { origin } },
    agentOptions: { provider: 'fixture', model: 'fixture' },
  })
}

/** One committed volatile-config notification. */
const COMMITTED: readonly (readonly string[])[] = [['teams']]

describe('Team preset reconciliation', () => {
  it('applies a selected Team to a Session that already exists', async () => {
    const { ctx, config, configure } = await setup([TEAM], [{ sessionId: 's1', teamId: 'team-1' }])
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)
    expect(configure).toHaveBeenCalledWith({ auto: false }, expect.anything())
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeDefined()
    await fiber.dispose()
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeUndefined()
    await handle.dispose()
  })

  it('applies on agent/created and skips a subagent Session', async () => {
    const selections = [{ sessionId: 'root', teamId: 'team-1' }, { sessionId: 'child', teamId: 'team-1' }]
    const { ctx, config } = await setup([TEAM], selections)
    const fiber = await mount(ctx, config)
    const root = await createAgent(ctx, 'root')
    const child = await createAgent(ctx, 'child', 'subagent')
    expect(ctx.tools.get('spawn_team_member', root.agent)).toBeDefined()
    expect(ctx.tools.get('spawn_team_member', child.agent)).toBeUndefined()
    await fiber.dispose()
    await root.dispose()
    await child.dispose()
  })

  it('skips a subagent Session that already exists when the plugin mounts', async () => {
    const selections = [{ sessionId: 'root', teamId: 'team-1' }, { sessionId: 'child', teamId: 'team-1' }]
    const { ctx, config } = await setup([TEAM], selections)
    const root = await createAgent(ctx, 'root')
    const child = await createAgent(ctx, 'child', 'subagent')
    const fiber = await mount(ctx, config)
    expect(ctx.tools.get('spawn_team_member', root.agent)).toBeDefined()
    expect(ctx.tools.get('spawn_team_member', child.agent)).toBeUndefined()

    // A committed volatile change re-walks every live Agent, still skipping the child.
    ctx.emit('loader/volatile-update', COMMITTED)
    expect(ctx.tools.get('spawn_team_member', child.agent)).toBeUndefined()

    await fiber.dispose()
    await root.dispose()
    await child.dispose()
  })

  it('releases the application when its Session is deselected', async () => {
    const { ctx, config, selectionsRef } = await setup([TEAM], [{ sessionId: 's1', teamId: 'team-1' }])
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeDefined()

    selectionsRef.set([])
    ctx.emit('loader/volatile-update', COMMITTED)
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeUndefined()

    await fiber.dispose()
    await handle.dispose()
  })

  it('releases the application when its Session is disposed', async () => {
    const { ctx, config } = await setup([TEAM], [{ sessionId: 's1', teamId: 'team-1' }])
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeDefined()
    await handle.dispose()
    await fiber.dispose()
  })

  it('re-applies a changed Team and leaves an unchanged one alone', async () => {
    const { ctx, config, teamsRef } = await setup([TEAM], [{ sessionId: 's1', teamId: 'team-1' }])
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)

    const installed = ctx.tools.get('spawn_team_member', handle.agent)
    ctx.emit('loader/volatile-update', COMMITTED)
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBe(installed)

    teamsRef.set([{ ...TEAM, name: 'Renamed' }])
    ctx.emit('loader/volatile-update', COMMITTED)
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeDefined()
    expect(ctx.tools.get('spawn_team_member', handle.agent)).not.toBe(installed)

    await fiber.dispose()
    await handle.dispose()
  })

  it('registers no application while no Team is selected', async () => {
    const { ctx, config } = await setup([TEAM], [])
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeUndefined()
    await fiber.dispose()
    await handle.dispose()
  })
})

describe('stored captain route migration', () => {
  it('rewrites a stored captain route once through the settings document', async () => {
    const { ctx, config, update } = await setup([team([], routedCaptain())], [{ sessionId: 's1', teamId: 'team-1' }])
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)
    await settle()

    expect(update).toHaveBeenCalledOnce()
    const [namespace, patch] = update.mock.calls[0]!
    expect(namespace).toBe('agent-team-presets')
    expect(patch.teams).toHaveLength(1)
    expect(patch.teams[0]!.id).toBe('team-1')
    expect(Object.keys(patch.teams[0]!.captain).sort())
      .toEqual(['color', 'description', 'name', 'systemPrompt', 'toolMode', 'tools'])
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeDefined()

    await fiber.dispose()
    await handle.dispose()
  })

  it('writes nothing when every loaded captain already owns its slot fields', async () => {
    const { ctx, config, update } = await setup([TEAM], [{ sessionId: 's1', teamId: 'team-1' }])
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)
    await settle()

    expect(update).not.toHaveBeenCalled()
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeDefined()

    await fiber.dispose()
    await handle.dispose()
  })

  it('reports a refused rewrite and still applies the Team', async () => {
    const { ctx, config, update } = await setup([team([], routedCaptain())], [{ sessionId: 's1', teamId: 'team-1' }])
    const failure = new Error('the settings document is read-only')
    update.mockRejectedValueOnce(failure)
    const warn = vi.spyOn(ctx.logger, 'warn')
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)
    await settle()

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('stored captains still carry'),
      'provider/model/reasoningEffort',
      String(failure),
    )
    expect(warn.mock.calls[0]?.[0]).toContain('agent-team-presets')
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeDefined()

    await fiber.dispose()
    await handle.dispose()
  })
})

describe('Team tool catalog', () => {
  it('lists the global tools a member allow-list may name, sorted by name', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    await mountAgentLoopTestDependencies(ctx)
    ctx.tools.register({
      name: 'zeta', description: 'last',
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [] },
      async execute() { return 'zeta' },
    })
    ctx.tools.register({
      name: 'alpha', description: 'first',
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [] },
      async execute() { return 'alpha' },
    })
    expect(new TeamPresetsToolCatalog(ctx).catalog()).toEqual({ tools: [
      { name: 'alpha', description: 'first' },
      { name: 'zeta', description: 'last' },
    ] })
  })
})
