/**
 * Which copy a default binding lands on, when several assets share one name.
 *
 * A skill name can legitimately identify three assets at once: the shipped copy,
 * a local override of it, and a skill the user imported under the same name. The
 * declarations in `team-catalog.ts` name the *shipped* skill, so the shipped copy
 * is what a default binds. Resolving a declaration onto whichever copy happened
 * to exist made three things impossible: deleting the copy left the role with no
 * skill at all, "restore to the built-in version" could not return the role to
 * the shipped asset, and a same-named custom skill could capture a default.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TeamSkillStore } from '../src/team-skills/store.ts'
import { CAPTAIN_ROLE, TeamSkillManager, sanctionedCopy } from '../src/team-skills/manager.ts'
import { OFFICIAL_SKILL_IDS, OFFICIAL_SKILL_VERSION } from '../src/team-skills/index.ts'
import { BUILTIN_TEAMS, builtinTeamDefinition } from '../src/builtin-teams.ts'
import type { TeamPreset } from '../src/types.ts'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const roots: string[] = []
afterEach(async () => { for (const path of roots.splice(0)) await rm(path, { recursive: true, force: true }) })

/** The shipped Team used throughout: it declares a delivery skill for `executor`. */
const EXECUTOR_ROLE = 'builtin-lightweight:executor'

/** One opened store and manager over a fixed Team list. */
async function open() {
  const path = await mkdtemp(join(tmpdir(), 'copy-binding-'))
  roots.push(path)
  const store = new TeamSkillStore(path)
  await store.open()
  const teams: readonly TeamPreset[] = [builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-lightweight')!)]
  const manager = new TeamSkillManager(store, path, {
    teams: () => teams,
    activeAssetIds: () => new Set(),
    activeSessions: () => [],
  } as never)
  await manager.open()
  await store.ensureOfficial(OFFICIAL_SKILL_IDS.map(skillId => ({
    skillId,
    version: OFFICIAL_SKILL_VERSION,
    directory: join(PACKAGE_ROOT, 'assets', 'skills', skillId),
  })))
  return { store, manager, path }
}

/** Install a same-named asset under a different identity, from the shipped folder. */
async function installSameName(store: TeamSkillStore, id: string, origin: 'custom' | 'override'): Promise<string> {
  const name = 'git-release-hygiene'
  const directory = join(PACKAGE_ROOT, 'assets', 'skills', name)
  const files = [{ path: 'SKILL.md', bytes: new Uint8Array(readFileSync(join(directory, 'SKILL.md'))) }]
  await store.install(
    { name, description: 'a local copy', files, totalBytes: 0 } as never,
    { id, origin, version: '1', ...(origin === 'override' ? { officialSkillId: name, baseVersion: '1' } : {}) },
  )
  return id
}

/** The asset ids one role holds for the delivery skill, ignoring its other skills. */
function held(manager: TeamSkillManager): string[] {
  return manager.assetsFor('builtin-lightweight', EXECUTOR_ROLE)
    .filter(asset => asset.skillId === 'git-release-hygiene')
    .map(asset => asset.id)
}

describe('a default binding and a same-named copy', () => {
  it('refuses to create a second skill under a name that already has one', async () => {
    // The English name is the identity a binding, a preset document, and the
    // model all address. A user skill taking a name that is already in the
    // library would make "bind `git-release-hygiene`" ambiguous, so the store
    // refuses it instead of letting the name point at two assets.
    const { store } = await open()
    await expect(installSameName(store, 'custom:git-release-hygiene', 'custom'))
      .rejects.toThrow(/already belongs to builtin:git-release-hygiene/u)
  })

  it('binds the shipped copy when an override shares its name', async () => {
    const { store, manager } = await open()
    await installSameName(store, 'override:git-release-hygiene', 'override')
    await manager.reconcile()
    expect(held(manager)).toContain('builtin:git-release-hygiene')
    expect(held(manager)).not.toContain('override:git-release-hygiene')
  })

  it('moves the role back when the copy is restored to the built-in version', async () => {
    const { store, manager } = await open()
    await installSameName(store, 'override:git-release-hygiene', 'override')
    await manager.reconcile()
    await manager.replaceBuiltinBindings('git-release-hygiene', 'override:git-release-hygiene')
    expect(await manager.replaceAssetBindings('override:git-release-hygiene', 'builtin:git-release-hygiene')).toBe(1)
    await manager.reconcile()
    expect(held(manager)).toEqual(['builtin:git-release-hygiene'])
  })

  it('keeps an explicit unbind dead even after the copy is gone', async () => {
    const { store, manager } = await open()
    await manager.reconcile()
    await manager.unassign('builtin-lightweight', EXECUTOR_ROLE, 'builtin:git-release-hygiene')
    expect(held(manager)).not.toContain('builtin:git-release-hygiene')
    await installSameName(store, 'override:git-release-hygiene', 'override')
    await manager.remove('override:git-release-hygiene')
    await manager.reconcile()
    expect(held(manager)).not.toContain('builtin:git-release-hygiene')
  })

  it('resolves a name to the shipped copy, never to a local one', async () => {
    const { store } = await open()
    await installSameName(store, 'override:git-release-hygiene', 'override')
    expect(store.bySkillId('git-release-hygiene')?.id).toBe('builtin:git-release-hygiene')
  })

  it('records the shipped marker, so a restart cannot rebind the copy', async () => {
    const { store, manager, path } = await open()
    await installSameName(store, 'override:git-release-hygiene', 'override')
    await manager.reconcile()
    const saved = JSON.parse(await readFile(join(path, 'bindings.json'), 'utf8')) as { seeded: string[] }
    expect(saved.seeded).toContain(JSON.stringify(['builtin-lightweight', EXECUTOR_ROLE, 'builtin:git-release-hygiene']))
    expect(manager.assetsFor('builtin-lightweight', CAPTAIN_ROLE).map(asset => asset.skillId)).not.toContain('git-release-hygiene')
  })

  it('restores the shipped binding when built-in presets are restored', async () => {
    const { store, manager } = await open()
    await installSameName(store, 'override:git-release-hygiene', 'override')
    await manager.reconcile()
    await manager.replaceBuiltinBindings('git-release-hygiene', 'override:git-release-hygiene')
    expect(held(manager)).toEqual(['override:git-release-hygiene'])
    await manager.restoreBuiltinBindings(['builtin-lightweight'])
    expect(held(manager)).toEqual(['builtin:git-release-hygiene'])
  })

  it('does not report the shipped copy and its own override as a name clash', async () => {
    const { store } = await open()
    await installSameName(store, 'override:git-release-hygiene', 'override')
    const builtin = store.get('builtin:git-release-hygiene')!
    const override = store.get('override:git-release-hygiene')!
    // They ARE the same skill: the override is the shipped body with edits.
    expect(sanctionedCopy(builtin, override)).toBe(true)
    expect(sanctionedCopy(override, builtin)).toBe(true)
    // Two independent skills that happen to share a name are a real clash.
    const other = { ...builtin, id: 'custom:other', origin: 'custom' as const }
    expect(sanctionedCopy(builtin, other)).toBe(false)
  })

  it('treats an empty restore list as every built-in Team', async () => {
    // The page calls the restore without arguments, and the remote call delivers
    // that absence as `[]`. Reading it as a filter made the restore a silent
    // no-op while still answering 200.
    const { store, manager } = await open()
    await installSameName(store, 'override:git-release-hygiene', 'override')
    await manager.reconcile()
    await manager.replaceBuiltinBindings('git-release-hygiene', 'override:git-release-hygiene')
    expect(held(manager)).toEqual(['override:git-release-hygiene'])
    await manager.restoreBuiltinBindings([])
    expect(held(manager)).toEqual(['builtin:git-release-hygiene'])
  })

  it('writes the restored bindings to disk, not only to memory', async () => {
    // `reconcileNow` flushes only when IT changed something. The conversion runs
    // before it, so without an explicit flush the restore looked successful in
    // the session and reverted on the next restart.
    const { store, manager, path } = await open()
    await installSameName(store, 'override:git-release-hygiene', 'override')
    await manager.reconcile()
    await manager.replaceBuiltinBindings('git-release-hygiene', 'override:git-release-hygiene')
    const before = JSON.parse(await readFile(join(path, 'bindings.json'), 'utf8')) as { bindings: { assetId: string }[] }
    expect(before.bindings.some(row => row.assetId === 'override:git-release-hygiene')).toBe(true)
    await manager.restoreBuiltinBindings()
    const after = JSON.parse(await readFile(join(path, 'bindings.json'), 'utf8')) as { bindings: { assetId: string }[] }
    expect(after.bindings.some(row => row.assetId === 'override:git-release-hygiene')).toBe(false)
    expect(after.bindings.filter(row => row.assetId === 'builtin:git-release-hygiene')).toHaveLength(1)
  })
})
