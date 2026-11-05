/** Plugin reconciliation, per-Session application lifecycle, and the tool catalog. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent'
import { SessionId } from '@deepseek-ai/dsh-session'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { apply, inject } from '../src/index.ts'
import * as Presentation from '../src/presentation.ts'
import { TeamSkills } from '../src/team-skills/index.ts'
import { MemberRuntime } from '../src/member-runtime.ts'
import type { Config } from '../src/config.ts'
import { BUILTIN_TEAM_IDS } from '../src/builtin-teams.ts'
import { TeamId } from '@deepseek-ai/dsh-experimental-agent-team'
import TeamPresetsToolCatalog from '../src/tool-catalog.ts'
import { routedCaptain, team } from './fixtures/team-presets.ts'
import type { TeamPreset, TeamSelectionRecord } from '../src/types.ts'
import { executeTool } from './fixtures/execute-tool.ts'

const contexts: Context[] = []

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
  vi.restoreAllMocks()
})

/** Writable stand-in for one volatile Config reference. */
function volatileRef<T>(initial: T): { ref: { get: () => T }; set: (next: T) => void } {
  let current = initial
  return { ref: { get: () => current }, set: (next) => { current = next } }
}

const TEAM: TeamPreset = team([], { systemPrompt: 'Captain prompt' })

/**
 * Let one macrotask turn pass, so every queued edge settles before an
 * assertion: the member execution aliases, the settings rewrite, and the
 * per-Session application jobs all resolve on microtasks, and a Team
 * application is deliberately queued rather than installed synchronously.
 */
async function settle(): Promise<void> {
  for (let round = 0; round < 3; round += 1) {
    await new Promise<void>((resolve) => { setTimeout(resolve, 0) })
  }
}

/** Mount the loop dependencies plus the two services `apply` reads. */
async function setup(
  teams: TeamPreset[],
  selections: TeamSelectionRecord[],
  seeded: readonly string[] = BUILTIN_TEAM_IDS,
) {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  const teamsRef = volatileRef(teams)
  const selectionsRef = volatileRef(selections)
  const seededRef = volatileRef([...seeded])
  ctx.provide('agentTeams', {
    spawnTeammate: async () => ({ member: { name: 'member', status: 'active' } }),
    // Reconciliation asks the roster whether a Team task is still running. This
    // composition has no teammates, so only the Lead row exists and it follows
    // the real Agent status.
    tryMembership: (agent: Agent) => ({ root: agent, id: TeamId(agent.id), role: 'lead' as const, name: 'lead' }),
    listMembers: (agent: Agent) => [{
      id: SessionId(agent.id),
      name: 'lead',
      role: 'lead' as const,
      status: agent.status === 'running' ? 'running' as const : 'inactive' as const,
      diagnostics: [],
    }],
  })
  // The plugin injects the subagent service, exactly as a deployment that
  // composes Teams provides it. These cases never create a member, so the
  // stand-in only has to exist for the mount to reach its own scan.
  ctx.provide('subagents', {
    registerProvider: () => () => {},
    getProvider: () => undefined,
    list: () => [],
    resolveMaxDepth: () => 2,
    drainChildren: async () => {},
  })
  const configure = vi.fn(() => () => {})
  const update = vi.fn(async (_ns: string, _patch: { teams: TeamPreset[]; seededDefaults: string[] }) => {})
  ctx.provide('settings', { configure, update, describe: () => [{ ns: 'agent-team-presets', revision: 0 }] })
  const config = {
    teams: teamsRef.ref,
    selections: selectionsRef.ref,
    seededDefaults: seededRef.ref,
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
    await settle()
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
    await settle()
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
    await settle()
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
    await settle()
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeUndefined()

    await fiber.dispose()
    await handle.dispose()
  })

  it.each(['none', 'missing'] as const)('cancels pending preparation when selection becomes %s', async (selection) => {
    const h = await setup([TEAM], [{ sessionId: 's1', teamId: TEAM.id }])
    const handle = await createAgent(h.ctx, 's1')
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    const entered = vi.spyOn(Presentation, 'readWire').mockImplementationOnce(async () => {
      await gate
      return { sections: [], tools: [] }
    })
    const fiber = await mount(h.ctx, h.config)
    await vi.waitFor(() => expect(entered).toHaveBeenCalled())
    h.selectionsRef.set(selection === 'none' ? [] : [{ sessionId: 's1', teamId: 'missing' }])
    h.ctx.emit('loader/volatile-update', COMMITTED)
    release()
    await settle()
    expect(h.ctx.tools.get('spawn_team_member', handle.agent)).toBeUndefined()
    await fiber.dispose()
  })

  it('cancels a pending replacement when the selection returns to the applied Team', async () => {
    const replacement = { ...TEAM, id: 'replacement' }
    const h = await setup([TEAM, replacement], [{ sessionId: 's1', teamId: TEAM.id }])
    const handle = await createAgent(h.ctx, 's1')
    const fiber = await mount(h.ctx, h.config)
    await settle()
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    const wire = vi.spyOn(Presentation, 'readWire').mockImplementationOnce(async () => {
      await gate
      return { sections: [], tools: [] }
    })
    const sync = vi.spyOn(TeamSkills.prototype, 'syncAgent')
    h.selectionsRef.set([{ sessionId: 's1', teamId: replacement.id }])
    h.ctx.emit('loader/volatile-update', COMMITTED)
    await vi.waitFor(() => expect(wire).toHaveBeenCalled())
    h.selectionsRef.set([{ sessionId: 's1', teamId: TEAM.id }])
    h.ctx.emit('loader/volatile-update', COMMITTED)
    sync.mockClear()
    release()
    await settle()
    expect(h.ctx.tools.get('spawn_team_member', handle.agent)).toBeDefined()
    expect(sync.mock.calls.filter(([agent, role]) => agent === handle.agent && role?.teamId === replacement.id)).toHaveLength(0)
    await fiber.dispose()
  })

  it('defers a prepared replacement when the current captain starts running', async () => {
    const replacement = { ...TEAM, id: 'replacement' }
    const h = await setup([TEAM, replacement], [{ sessionId: 's1', teamId: TEAM.id }])
    const handle = await createAgent(h.ctx, 's1')
    const fiber = await mount(h.ctx, h.config)
    await settle()
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    const wire = vi.spyOn(Presentation, 'readWire').mockImplementationOnce(async () => {
      await gate
      return { sections: [], tools: [] }
    })
    const sync = vi.spyOn(TeamSkills.prototype, 'syncAgent')
    h.selectionsRef.set([{ sessionId: 's1', teamId: replacement.id }])
    h.ctx.emit('loader/volatile-update', COMMITTED)
    await vi.waitFor(() => expect(wire).toHaveBeenCalled())
    let status: Agent['status'] = 'running'
    vi.spyOn(handle.agent, 'status', 'get').mockImplementation(() => status)
    sync.mockClear()
    release()
    await settle()
    expect(sync.mock.calls.filter(([agent, role]) => agent === handle.agent && role?.teamId === replacement.id)).toHaveLength(0)
    status = 'idle'
    h.ctx.emit('loader/volatile-update', COMMITTED)
    await vi.waitFor(() => expect(sync.mock.calls.some(([agent, role]) => agent === handle.agent && role?.teamId === replacement.id)).toBe(true))
    await fiber.dispose()
  })

  it('does not resurrect a revoked application after its post-install wire check', async () => {
    const strict = team([], { toolMode: 'custom', tools: [] })
    const h = await setup([strict], [{ sessionId: 's1', teamId: strict.id }])
    const handle = await createAgent(h.ctx, 's1')
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    vi.spyOn(Presentation, 'prepareNativePresentation').mockResolvedValue({ kind: 'already-native' })
    const wire = vi.spyOn(Presentation, 'readWire')
      .mockResolvedValueOnce({ sections: [], tools: [] })
      .mockImplementationOnce(async () => { await gate; return undefined })
    const releaseSkills = vi.spyOn(TeamSkills.prototype, 'releaseAgent')
    const syncSkills = vi.spyOn(TeamSkills.prototype, 'syncAgent')
    const fiber = await mount(h.ctx, h.config)
    await vi.waitFor(() => expect(wire).toHaveBeenCalledTimes(2))
    h.selectionsRef.set([])
    h.ctx.emit('loader/volatile-update', COMMITTED)
    expect(releaseSkills).toHaveBeenCalledWith(handle.agent)
    syncSkills.mockClear()
    release()
    await settle()
    expect(h.ctx.tools.get('spawn_team_member', handle.agent)).toBeUndefined()
    expect(syncSkills).not.toHaveBeenCalledWith(handle.agent, expect.anything())
    await fiber.dispose()
  })

  it('does not resync skill versions for an unrelated volatile update', async () => {
    const h = await setup([TEAM], [{ sessionId: 's1', teamId: TEAM.id }])
    await createAgent(h.ctx, 's1')
    const fiber = await mount(h.ctx, h.config)
    await settle()
    // The store opens asynchronously and the ready pass syncs the existing
    // role once. Wait for that pass, then observe only the unrelated update.
    const service = (h.ctx as unknown as { teamSkills?: { library(): Promise<unknown> } }).teamSkills
    if (service !== undefined) await service.library()
    await settle()
    const sync = vi.spyOn(TeamSkills.prototype, 'syncAgent')
    sync.mockClear()
    h.ctx.emit('loader/volatile-update', [['selections']])
    await settle()
    expect(sync.mock.calls.length).toBe(0)
    await fiber.dispose()
  })

  it('keeps the previous captain role when a replacement fails its final wire check', async () => {
    const h = await setup([TEAM], [{ sessionId: 's1', teamId: TEAM.id }])
    const handle = await createAgent(h.ctx, 's1')
    const fiber = await mount(h.ctx, h.config)
    await settle()
    const sync = vi.spyOn(TeamSkills.prototype, 'syncAgent')
    vi.spyOn(Presentation, 'prepareNativePresentation').mockResolvedValue({ kind: 'already-native' })
    vi.spyOn(Presentation, 'readWire')
      .mockResolvedValueOnce({ sections: [], tools: [] })
      .mockResolvedValueOnce(undefined)
    const replacement = { ...team([], { toolMode: 'custom', tools: [] }), id: 'replacement' }
    h.teamsRef.set([TEAM, replacement])
    h.selectionsRef.set([{ sessionId: 's1', teamId: replacement.id }])
    h.ctx.emit('loader/volatile-update', COMMITTED)
    await settle()
    expect(h.ctx.tools.get('spawn_team_member', handle.agent)).toBeDefined()
    expect(sync).toHaveBeenCalledWith(handle.agent, expect.objectContaining({ teamId: TEAM.id }))
    expect(sync).not.toHaveBeenCalledWith(handle.agent, expect.objectContaining({ teamId: replacement.id }))
    await fiber.dispose()
  })

  it.each([true, false])('only lifts a startup child quarantine after a successful durable claim (%s)', async (intact) => {
    const h = await setup([TEAM], [])
    const root = await createAgent(h.ctx, 'root')
    const child = await createAgent(h.ctx, 'child', 'subagent')
    vi.spyOn(h.ctx.agentTeams, 'tryMembership').mockImplementation(agent => agent === child.agent
      ? { root: root.agent, id: TeamId(root.agent.id), role: 'teammate', name: 'member' }
      : { root: agent, id: TeamId(agent.id), role: 'lead', name: 'lead' })
    h.ctx.tools.register({ name: 'plain_tool', description: 'plain', parameters: {},
      output: { schema: { type: 'string' }, render: () => [] }, async execute() { return 'ok' } })
    let release!: () => void
    const ready = new Promise<void>(resolve => { release = resolve })
    const originalReady = MemberRuntime.prototype.whenReady
    vi.spyOn(MemberRuntime.prototype, 'whenReady').mockImplementation(async function () {
      await ready
      return originalReady.call(this)
    })
    const claim = vi.spyOn(MemberRuntime.prototype, 'claim')
      .mockReturnValue({ kind: 'invalid', reason: 'store opening' })
    const fiber = await mount(h.ctx, h.config)
    const call = () => executeTool(h.ctx, { callId: ToolCallId('child'), name: 'plain_tool', arguments: {},
      agent: child.agent, signal: new AbortController().signal })
    expect((await call()).isError).toBe(true)
    if (intact) claim.mockReturnValue({ kind: 'installed', record: {
      teamId: TEAM.id, memberName: 'member', roleId: 'member', lifecycle: 'bound', policy: { mode: 'all', allow: [] },
    } } as ReturnType<MemberRuntime['claim']>)
    else claim.mockReturnValue({ kind: 'invalid', reason: 'snapshot corrupt' })
    release()
    await settle()
    expect((await call()).isError).toBe(!intact)
    await fiber.dispose()
  })

  it('releases captain skill ownership on deselection and never resyncs the stale role', async () => {
    const h = await setup([TEAM], [{ sessionId: 's1', teamId: TEAM.id }])
    const handle = await createAgent(h.ctx, 's1')
    const sync = vi.spyOn(TeamSkills.prototype, 'syncAgent')
    const release = vi.spyOn(TeamSkills.prototype, 'releaseAgent')
    const fiber = await mount(h.ctx, h.config)
    await settle()
    expect(sync).toHaveBeenCalledWith(handle.agent, expect.objectContaining({ teamId: TEAM.id }))
    sync.mockClear()
    h.selectionsRef.set([])
    h.ctx.emit('loader/volatile-update', COMMITTED)
    await settle()
    expect(release).toHaveBeenCalledWith(handle.agent)
    expect(sync).not.toHaveBeenCalledWith(handle.agent, expect.anything())
    await fiber.dispose()
  })

  it('releases the application when its Session is disposed', async () => {
    const { ctx, config } = await setup([TEAM], [{ sessionId: 's1', teamId: 'team-1' }])
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeDefined()
    await handle.dispose()
    await settle()
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
    await settle()
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
    await settle()
    await handle.dispose()
  })

  it('leaves an unselected Session unrestricted while keeping the preset tools discoverable', async () => {
    const { ctx, config } = await setup([TEAM], [])
    ctx.tools.register({
      name: 'plain_tool', description: 'plain', parameters: {},
      output: { schema: { type: 'string' }, render: () => [{ type: 'text', text: 'ok' }] },
      async execute() { return 'ok' },
    })
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)
    // A Session that selected no Team keeps every ordinary tool: no guard and no
    await settle()
    // restriction is installed, so the plugin never narrows normal operation.
    const result = await executeTool(ctx, {
      callId: ToolCallId('plain'), name: 'plain_tool', arguments: {}, agent: handle.agent,
      signal: new AbortController().signal,
    })
    expect(result.isError).toBe(false)
    // The preset tools stay, because a user may ask the captain to adjust a
    // stored preset before this Session selects one; only the Team capability
    // and the member tool wait for a selection.
    expect(ctx.tools.get('get_team_preset', handle.agent)).toBeDefined()
    expect(ctx.tools.get('update_team_preset', handle.agent)).toBeDefined()
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeUndefined()
    await fiber.dispose()
    await handle.dispose()
  })

  it('deselection releases strict policy only, keeping the preset tools discoverable', async () => {
    const h = await setup([team([], { toolMode: 'custom', tools: [] })], [{ sessionId: 's1', teamId: 'team-1' }])
    const body = vi.fn(async () => 'ordinary')
    h.ctx.tools.register({ name: 'plain_tool', description: 'plain', parameters: {},
      output: { schema: { type: 'string' }, render: () => [] }, execute: body })
    const chosen = await createAgent(h.ctx, 's1')
    const plain = await createAgent(h.ctx, 's2')
    const fiber = await mount(h.ctx, h.config)
    await settle()
    const call = (agent: Agent) => executeTool(h.ctx, { callId: ToolCallId('ordinary'), name: 'plain_tool', arguments: {}, agent, signal: new AbortController().signal })
    expect((await call(chosen.agent)).isError).toBe(true)
    expect((await call(plain.agent)).isError).toBe(false)
    h.selectionsRef.set([])
    h.ctx.emit('loader/volatile-update', COMMITTED)
    expect((await call(chosen.agent)).isError).toBe(false)
    await settle()
    expect(h.ctx.tools.get('get_team_preset', chosen.agent)).toBeDefined()
    expect(h.ctx.tools.get('update_team_preset', chosen.agent)).toBeDefined()
    expect(h.ctx.tools.get('spawn_team_member', chosen.agent)).toBeUndefined()
    await fiber.dispose()
  })

  it('denies every tool while the selected Team is gone, rather than silently applying nothing', async () => {
    // A selection whose Team no longer exists is not an explicit deselection:
    // applying nothing would quietly hand the Session an unrestricted tool set.
    const { ctx, config, selectionsRef } = await setup([], [{ sessionId: 's1', teamId: 'team-1' }])
    ctx.tools.register({
      name: 'plain_tool', description: 'plain', parameters: {},
      output: { schema: { type: 'string' }, render: () => [{ type: 'text', text: 'ok' }] },
      async execute() { return 'ok' },
    })
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)
    await settle()
    const result = await executeTool(ctx, {
      callId: ToolCallId('stale'), name: 'plain_tool', arguments: {}, agent: handle.agent,
      signal: new AbortController().signal,
    })
    expect(result.isError).toBe(true)
    expect(JSON.stringify(result.content)).toContain('Selected Team')
    expect(JSON.stringify(result.content)).toContain('team-1')
    expect(JSON.stringify(result.content)).toContain('composer Team control')
    selectionsRef.set([])
    ctx.emit('loader/volatile-update', COMMITTED)
    await settle()
    expect((await executeTool(ctx, { callId: ToolCallId('recovered'), name: 'plain_tool', arguments: {}, agent: handle.agent, signal: new AbortController().signal })).isError).toBe(false)
    expect(ctx.tools.get('get_team_preset', handle.agent)).toBeDefined()
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
      expect.stringContaining('settings reconcile refused'),
      String(failure),
    )
    expect(warn.mock.calls[0]?.[0]).toContain('agent-team-presets')
    expect(ctx.tools.get('spawn_team_member', handle.agent)).toBeDefined()

    await fiber.dispose()
    await handle.dispose()
  })

  it('installs the shipped default presets once on a fresh deployment', async () => {
    // A deployment that was never offered the shipped defaults: the same
    // startup pass that cleans a legacy document installs them.
    const { ctx, config, update } = await setup([], [], [])
    const handle = await createAgent(ctx, 's1')
    const fiber = await mount(ctx, config)
    await settle()

    expect(update).toHaveBeenCalledOnce()
    const [, patch] = update.mock.calls[0]!
    expect(patch.teams.map(entry => entry.id)).toEqual([...BUILTIN_TEAM_IDS])
    expect(patch.seededDefaults).toEqual([...BUILTIN_TEAM_IDS])
    // A Team this Session never selected still leaves the captain able to read
    // the presets it may select.
    expect(ctx.tools.get('get_team_preset', handle.agent)).toBeDefined()

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
    const catalog = await new TeamPresetsToolCatalog(ctx).catalog()
    // An unclassifiable tool is reported as `other` rather than attributed to a
    // package the registry never recorded.
    expect(catalog.tools).toEqual(expect.arrayContaining([
      { name: 'alpha', description: 'first', source: 'other' },
      { name: 'zeta', description: 'last', source: 'other' },
    ]))
    expect(catalog.tools.map(tool => tool.name)).toContain('spawn_team_member')
    expect(catalog.tools.find(tool => tool.name === 'spawn_team_member')?.source).toBe('presets')
  })
})
