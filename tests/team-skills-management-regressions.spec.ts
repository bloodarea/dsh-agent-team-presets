import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { TeamSkillStore } from '../src/team-skills/store.ts'
import { CAPTAIN_ROLE, TeamSkillManager } from '../src/team-skills/manager.ts'
import { team, slot } from './fixtures/team-presets.ts'
import { builtinTeamDefinition, BUILTIN_TEAMS } from '../src/builtin-teams.ts'
import type { TeamPreset } from '../src/types.ts'

const roots: string[] = []
afterEach(async () => { vi.restoreAllMocks(); for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }) })
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'skill-management-'))
  roots.push(root)
  const store = new TeamSkillStore(root)
  await store.open()
  let teams: readonly TeamPreset[] = [team([slot({ id: 'dev', name: 'developer' })], {})]
  const manager = new TeamSkillManager(store, root, { teams: () => teams, activeAssetIds: () => new Set(), activeSessions: () => [] })
  await manager.open()
  return { root, store, manager, setTeams: (next: readonly TeamPreset[]) => { teams = next } }
}
async function install(store: TeamSkillStore, id: string, origin: 'builtin' | 'custom' = 'custom') {
  const name = id.split(':')[1]!
  return store.install({ name, description: name, files: [{ path: 'SKILL.md', bytes: new TextEncoder().encode(`---\nname: ${name}\ndescription: demo\n---\n\nBody\n`) }], totalBytes: 1 }, { id, origin, version: '1' })
}

describe('Team Skill management regressions', () => {
  it('validates live teams and roles and reports required MCP uncertainty', async () => {
    const { store, manager } = await fixture()
    await install(store, 'custom:demo')
    await store.updateDependencies('custom:demo', { executables: [], otherSkills: [], mcpServers: [{ serverName: 'browser', required: true }] })
    expect(await manager.assign({ teamId: 'missing', roleId: 'dev', assetId: 'custom:demo' })).toMatchObject({ ok: false, reason: 'unknown-team' })
    expect(await manager.assign({ teamId: 'team-1', roleId: 'missing', assetId: 'custom:demo' })).toMatchObject({ ok: false, reason: 'unknown-role' })
    expect(await manager.assign({ teamId: 'team-1', roleId: 'dev', assetId: 'custom:demo' })).toMatchObject({ ok: true, unverified: ['browser'] })
  })

  it('serializes writes and preserves the last committed binding after a failed rename', async () => {
    const { root, store, manager } = await fixture()
    await install(store, 'custom:one'); await install(store, 'custom:two')
    await Promise.all(['custom:one', 'custom:two'].map(assetId => manager.assign({ teamId: 'team-1', roleId: 'dev', assetId })))
    expect(JSON.parse(await readFile(join(root, 'bindings.json'), 'utf8')).bindings).toHaveLength(2)
    const revision = manager.bindingRevision
    await rm(join(root, 'bindings.json'))
    await mkdir(join(root, 'bindings.json'))
    await expect(manager.unassign('team-1', 'dev', 'custom:one')).rejects.toThrow()
    expect(manager.list()).toHaveLength(2)
    expect(manager.bindingRevision).toBe(revision)
  })

  it('removes orphan role bindings and persists default seeds without restoring an explicit unbind', async () => {
    const { root, store, manager, setTeams } = await fixture()
    const preset = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-workflow')!)
    setTeams([preset])
    await install(store, 'builtin:git-release-hygiene', 'builtin')
    await manager.reconcile()
    const role = preset.members.find(member => member.name === 'repository-specialist')!.id!
    expect(manager.assetsFor(preset.id, role)).toHaveLength(1)
    await manager.unassign(preset.id, role)
    const reopened = new TeamSkillManager(store, root, { teams: () => [preset], activeAssetIds: () => new Set(), activeSessions: () => [] })
    await reopened.open(); await reopened.reconcile()
    expect(reopened.assetsFor(preset.id, role)).toEqual([])
    await manager.assign({ teamId: preset.id, roleId: role, assetId: 'builtin:git-release-hygiene' })
    setTeams([{ ...preset, members: [] }]); await manager.reconcile()
    expect(manager.list()).toEqual([])
  })

  it.each(['team', 'role'] as const)('seeds defaults again after a deleted %s is restored', async (deleted) => {
    const { root, store, manager, setTeams } = await fixture()
    const preset = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-workflow')!)
    const role = preset.members.find(member => member.name === 'repository-specialist')!.id!
    setTeams([preset])
    await install(store, 'builtin:git-release-hygiene', 'builtin')
    await manager.reconcile()
    expect(manager.assetsFor(preset.id, role)).toHaveLength(1)
    // Start from the marker-only state too: deletion must forget an explicit
    // unbind for a role that no longer exists.
    await manager.unassign(preset.id, role)
    setTeams(deleted === 'team' ? [] : [{ ...preset, members: [] }])
    await manager.reconcile()
    expect(JSON.parse(await readFile(join(root, 'bindings.json'), 'utf8')).seeded).toEqual([])
    setTeams([preset])
    const reopened = new TeamSkillManager(store, root, { teams: () => [preset], activeAssetIds: () => new Set(), activeSessions: () => [] })
    await reopened.open(); await reopened.reconcile()
    expect(reopened.assetsFor(preset.id, role)).toHaveLength(1)
  })

  it.each([false, true])('forgetTeam clears seed markers even without a binding (%s)', async (unbound) => {
    const { root, store, manager, setTeams } = await fixture()
    const preset = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-workflow')!)
    const role = preset.members.find(member => member.name === 'repository-specialist')!.id!
    setTeams([preset])
    await install(store, 'builtin:git-release-hygiene', 'builtin')
    await manager.reconcile()
    if (unbound) await manager.unassign(preset.id, role)
    expect(await manager.forgetTeam(preset.id)).toBe(unbound ? 0 : 1)
    expect(manager.list()).toEqual([])
    expect(JSON.parse(await readFile(join(root, 'bindings.json'), 'utf8')).seeded).toEqual([])
    const reopened = new TeamSkillManager(store, root, { teams: () => [preset], activeAssetIds: () => new Set(), activeSessions: () => [] })
    await reopened.open(); await reopened.reconcile()
    expect(reopened.assetsFor(preset.id, role)).toHaveLength(1)
  })

  it('seeds a shipped Team whose stored record predates the declaration field', async () => {
    const { store, manager, setTeams } = await fixture()
    const preset = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-workflow')!)
    // The schema materializes an empty array for a record written before the
    // field existed; that must not read as "the user removed every default".
    setTeams([{ ...preset, officialSkills: [] }])
    await install(store, 'builtin:git-release-hygiene', 'builtin')
    await manager.reconcile()
    const role = preset.members.find(member => member.name === 'repository-specialist')!.id!
    expect(manager.assetsFor(preset.id, role).map(asset => asset.id)).toEqual(['builtin:git-release-hygiene'])
    // A custom Team with the same empty declaration gets no shipped binding.
    setTeams([{ ...preset, id: 'custom-team', officialSkills: [] }])
    await manager.reconcile()
    expect(manager.list().filter(row => row.teamId === 'custom-team')).toEqual([])
  })

  it('rechecks dependency references added during the advisory scan', async () => {
    const { store, manager } = await fixture()
    await install(store, 'custom:target'); await install(store, 'custom:other')
    const original = store.readText.bind(store)
    vi.spyOn(store, 'readText').mockImplementationOnce(async (...args) => {
      await store.updateDependencies('custom:other', { executables: [], mcpServers: [], otherSkills: ['custom:target'] })
      return original(...args)
    })
    expect(await manager.remove('custom:target')).toMatchObject({ ok: false, blockers: [{ kind: 'dependency', dependents: ['custom:other'] }] })
    expect(store.get('custom:target')).toBeDefined()
  })

  it('serializes a new assignment behind removal and refuses the deleted asset', async () => {
    const { store, manager } = await fixture()
    await install(store, 'custom:target'); await install(store, 'custom:other')
    let entered!: () => void
    const scanning = new Promise<void>(resolve => { entered = resolve })
    let resume!: () => void
    const paused = new Promise<void>(resolve => { resume = resolve })
    vi.spyOn(store, 'readText').mockImplementationOnce(async () => { entered(); await paused; return '' })
    const removal = manager.remove('custom:target')
    await scanning
    const assignment = manager.assign({ teamId: 'team-1', roleId: 'dev', assetId: 'custom:target' })
    resume()
    expect((await removal).ok).toBe(true)
    expect(await assignment).toMatchObject({ ok: false, reason: 'unknown-asset' })
    expect(manager.list()).toEqual([])
  })

  it('restores default bindings when restoreBuiltinBindings is called after an explicit unbind', async () => {
    const { store, manager, setTeams } = await fixture()
    const preset = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-workflow')!)
    setTeams([preset])
    await install(store, 'builtin:git-release-hygiene', 'builtin')
    await manager.reconcile()
    const role = preset.members.find(member => member.name === 'repository-specialist')!.id!
    expect(manager.assetsFor(preset.id, role)).toHaveLength(1)

    await manager.unassign(preset.id, role)
    expect(manager.assetsFor(preset.id, role)).toEqual([])

    await manager.reconcile()
    expect(manager.assetsFor(preset.id, role)).toEqual([])

    await manager.restoreBuiltinBindings([preset.id])
    expect(manager.assetsFor(preset.id, role)).toHaveLength(1)
  })

  it('binds the professional-role workflows and keeps the executor delivery pair', async () => {
    const { store, manager, setTeams } = await fixture()
    const fullstack = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-fullstack')!)
    setTeams([fullstack])
    await install(store, 'builtin:git-release-hygiene', 'builtin')
    await install(store, 'builtin:github-repository-presentation', 'builtin')
    await install(store, 'builtin:frontend-engineering-workflow', 'builtin')
    await install(store, 'builtin:backend-architecture-workflow', 'builtin')
    await install(store, 'builtin:independent-code-review-workflow', 'builtin')
    await manager.reconcile()
    const role = (name: string) => fullstack.members.find(member => member.name === name)!.id!
    expect(manager.assetsFor(fullstack.id, role('ui-designer')).map(asset => asset.skillId)).toEqual(['frontend-engineering-workflow'])
    expect(manager.assetsFor(fullstack.id, role('backend-architect')).map(asset => asset.skillId)).toEqual(['backend-architecture-workflow'])
    expect(manager.assetsFor(fullstack.id, role('reviewer')).map(asset => asset.skillId).sort()).toEqual(['independent-code-review-workflow'])
    // The executor keeps its delivery pair: routine implementation, debugging and
    // testing stay its work, and the specialist roles add their own workflows
    // beside it rather than replacing it.
    expect(manager.assetsFor(fullstack.id, role('executor')).map(asset => asset.skillId).sort())
      .toEqual(['git-release-hygiene', 'github-repository-presentation'])
  })

  it('seeds the method skills only on the discovery and research roles that own them', async () => {
    const { store, manager, setTeams } = await fixture()
    const discovery = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-discovery')!)
    const research = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-research')!)
    setTeams([discovery, research])
    await install(store, 'builtin:grilling', 'builtin')
    await install(store, 'builtin:research', 'builtin')
    await manager.reconcile()
    const member = (preset: TeamPreset, name: string) => preset.members.find(row => row.name === name)!.id!
    expect(manager.assetsFor(discovery.id, CAPTAIN_ROLE).map(asset => asset.skillId)).toEqual(['grilling'])
    expect(manager.list().find(row => row.teamId === discovery.id && row.roleId === CAPTAIN_ROLE)).toMatchObject({ captain: true })
    expect(manager.assetsFor(discovery.id, member(discovery, 'technical-scout')).map(asset => asset.skillId)).toEqual(['research'])
    expect(manager.assetsFor(discovery.id, member(discovery, 'product-scout')).map(asset => asset.skillId)).toEqual(['research'])
    expect(manager.assetsFor(discovery.id, member(discovery, 'critical-analyst'))).toEqual([])
    expect(manager.assetsFor(research.id, member(research, 'evidence-scout')).map(asset => asset.skillId)).toEqual(['research'])
    for (const name of ['methodologist', 'research-engineer', 'skeptic']) {
      expect(manager.assetsFor(research.id, member(research, name)), name).toEqual([])
    }
  })

  it('does not restore a seeded method skill after an explicit unbind', async () => {
    const { root, store, manager, setTeams } = await fixture()
    const discovery = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-discovery')!)
    setTeams([discovery])
    await install(store, 'builtin:grilling', 'builtin')
    await manager.reconcile()
    expect(manager.assetsFor(discovery.id, CAPTAIN_ROLE)).toHaveLength(1)
    await manager.unassign(discovery.id, CAPTAIN_ROLE)
    expect(manager.assetsFor(discovery.id, CAPTAIN_ROLE)).toEqual([])
    const reopened = new TeamSkillManager(store, root, { teams: () => [discovery], activeAssetIds: () => new Set(), activeSessions: () => [] })
    await reopened.open()
    await reopened.reconcile()
    expect(reopened.assetsFor(discovery.id, CAPTAIN_ROLE)).toEqual([])
  })

  it('never grants a declared default to the captain slot through a member named like the sentinel', async () => {
    // A member's role identity falls back to its display name when the record
    // carries no id, and `captain` is also the sentinel that addresses the
    // captain slot. A stored document holding a member literally named
    // `captain` therefore cannot be addressed without also matching the
    // captain, so the declaration is dropped rather than landing on the
    // captain: a member's default skill appearing on the captain is the exact
    // role leak the per-role table exists to prevent.
    const { store, manager, setTeams } = await fixture()
    const colliding = {
      ...team([slot({ name: 'captain' }), slot({ id: 'scout', name: 'scout' })], { name: 'real-lead' }),
      officialSkills: [
        { skillId: 'research', roleName: 'captain' },
        { skillId: 'research', roleName: 'scout' },
      ],
    } as TeamPreset
    setTeams([colliding])
    await install(store, 'builtin:research', 'builtin')
    await manager.reconcile()
    expect(manager.assetsFor(colliding.id, CAPTAIN_ROLE)).toEqual([])
    expect(manager.list().some(row => row.captain === true)).toBe(false)
    // The unambiguous member still receives its declared default, so the drop
    // is scoped to the collision rather than to the whole declaration list.
    expect(manager.assetsFor(colliding.id, 'scout').map(asset => asset.skillId)).toEqual(['research'])
  })

  it('still resolves a captain declaration addressed by the captain own name', async () => {
    // The counterpart: when the declared name really is the captain's, the
    // sentinel slot is the correct target and must keep receiving the default.
    const { store, manager, setTeams } = await fixture()
    const preset = {
      ...team([slot({ id: 'scout', name: 'scout' })], { name: 'real-lead' }),
      officialSkills: [{ skillId: 'research', roleName: 'real-lead' }],
    } as TeamPreset
    setTeams([preset])
    await install(store, 'builtin:research', 'builtin')
    await manager.reconcile()
    expect(manager.assetsFor(preset.id, CAPTAIN_ROLE).map(asset => asset.skillId)).toEqual(['research'])
    expect(manager.list().find(row => row.teamId === preset.id)).toMatchObject({ roleId: CAPTAIN_ROLE, captain: true })
  })

  it('waits for a known built-in asset and seeds only valid, unambiguous declarations when it arrives', async () => {
    const { store, manager, setTeams } = await fixture()
    const preset = {
      ...team([slot({ id: 'dev', name: 'developer' }), slot({ id: 'other', name: 'shared' })], { name: 'shared' }),
      officialSkills: [
        { skillId: 'research', roleName: 'developer' },
        { skillId: 'research', roleName: 'shared' },
        { skillId: 'research', roleName: 'missing' },
        { skillId: 'my-custom', roleName: 'developer' },
      ],
    }
    setTeams([preset])
    await install(store, 'custom:research')
    await install(store, 'builtin:my-custom', 'builtin')
    expect(await manager.assign({ teamId: preset.id, roleId: 'dev', assetId: 'custom:research' })).toMatchObject({ ok: true })
    await manager.reconcile()
    expect(manager.list()).toEqual([{ teamId: preset.id, roleId: 'dev', assetId: 'custom:research' }])
    await install(store, 'builtin:research', 'builtin')
    await manager.reconcile()
    expect(manager.list()).toEqual([
      { teamId: preset.id, roleId: 'dev', assetId: 'custom:research' },
      { teamId: preset.id, roleId: 'dev', assetId: 'builtin:research' },
    ])
  })

  it('keeps an existing override and respects its later manual unbinding', async () => {
    const { store, manager, setTeams } = await fixture()
    const preset = team([slot({ id: 'dev', name: 'developer' })], {})
    await install(store, 'builtin:research', 'builtin')
    const copy = await store.createOverride('research', 'override:research')
    expect(await manager.assign({ teamId: preset.id, roleId: 'dev', assetId: copy.id })).toMatchObject({ ok: true })
    setTeams([{ ...preset, officialSkills: [{ skillId: 'research', roleName: 'developer' }] }])
    await manager.reconcile()
    expect(manager.assetsFor(preset.id, 'dev').map(asset => asset.id)).toEqual([copy.id])
    expect(await manager.unassign(preset.id, 'dev', copy.id)).toBe(true)
    await manager.reconcile()
    expect(manager.assetsFor(preset.id, 'dev')).toEqual([])
  })

  it('binds a default to the shipped copy even when a same-named copy exists', async () => {
    // A declaration names the skill the plugin ships. It must not resolve onto
    // whatever local copy happens to share that name: doing so made the default
    // follow the user's own asset, so deleting or restoring that copy could not
    // return the role to the shipped skill (and a same-named custom skill could
    // capture a default it never asked for).
    const { store, manager, setTeams } = await fixture()
    const discovery = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-discovery')!)
    setTeams([discovery])
    await install(store, 'builtin:grilling', 'builtin')
    await store.createOverride('grilling', 'override:grilling')
    await manager.reconcile()
    expect(manager.assetsFor(discovery.id, CAPTAIN_ROLE).map(asset => asset.id)).toEqual(['builtin:grilling'])
  })

  it('keeps an explicit unbind unrevived after an override appears', async () => {
    // The seed marker is keyed by the declaration, not by the asset it resolved
    // to. An override arriving later must not change the key and thereby
    // resurrect a default the user removed.
    const { root, store, manager, setTeams } = await fixture()
    const discovery = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-discovery')!)
    setTeams([discovery])
    await install(store, 'builtin:grilling', 'builtin')
    await manager.reconcile()
    await manager.unassign(discovery.id, CAPTAIN_ROLE)
    expect(manager.assetsFor(discovery.id, CAPTAIN_ROLE)).toEqual([])
    await store.createOverride('grilling', 'override:grilling')
    const reopened = new TeamSkillManager(store, root, { teams: () => [discovery], activeAssetIds: () => new Set(), activeSessions: () => [] })
    await reopened.open()
    await reopened.reconcile()
    expect(reopened.assetsFor(discovery.id, CAPTAIN_ROLE)).toEqual([])
  })

  it('falls back to the shipped copy when the override belongs to another skill', async () => {
    // A drifted override must not be handed to a default that names a different
    // shipped skill: that would deliver the wrong body under the right name.
    const { store, manager, setTeams } = await fixture()
    const discovery = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-discovery')!)
    setTeams([discovery])
    await install(store, 'builtin:grilling', 'builtin')
    await install(store, 'builtin:research', 'builtin')
    const foreign = await store.createOverride('research', 'override:grilling')
    await manager.reconcile()
    expect(manager.assetsFor(discovery.id, CAPTAIN_ROLE).map(asset => asset.id)).toEqual(['builtin:grilling'])
    expect(foreign.officialSkillId).toBe('research')
  })

  it('moves a role onto a copy when the copy is created through the service path', async () => {
    // Creating a copy switches the roles that already hold the shipped skill:
    // `replaceBuiltinBindings` is what does it, at creation time. Reconcile does
    // not, or a later "restore to the built-in version" would be undone by the
    // next pass.
    const { store, manager, setTeams } = await fixture()
    const discovery = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-discovery')!)
    setTeams([discovery])
    await install(store, 'builtin:grilling', 'builtin')
    await manager.reconcile()
    expect(manager.assetsFor(discovery.id, CAPTAIN_ROLE).map(asset => asset.id)).toEqual(['builtin:grilling'])
    await store.createOverride('grilling', 'override:grilling')
    expect(await manager.replaceBuiltinBindings('grilling', 'override:grilling')).toBe(1)
    await manager.reconcile()
    expect(manager.assetsFor(discovery.id, CAPTAIN_ROLE).map(asset => asset.id)).toEqual(['override:grilling'])
  })

  it('leaves a role on an explicitly chosen asset when an override appears', async () => {
    // Only the exact (role, shipped copy) pair migrates. A role the user pointed
    // somewhere else keeps that choice.
    const { store, manager, setTeams } = await fixture()
    const discovery = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-discovery')!)
    setTeams([discovery])
    await install(store, 'builtin:grilling', 'builtin')
    await install(store, 'builtin:research', 'builtin')
    await manager.reconcile()
    await manager.unassign(discovery.id, CAPTAIN_ROLE)
    expect(await manager.assign({ teamId: discovery.id, roleId: CAPTAIN_ROLE, assetId: 'builtin:research', captain: true })).toMatchObject({ ok: true })
    await store.createOverride('grilling', 'override:grilling')
    await manager.reconcile()
    expect(manager.assetsFor(discovery.id, CAPTAIN_ROLE).map(asset => asset.id)).toEqual(['builtin:research'])
  })
})
