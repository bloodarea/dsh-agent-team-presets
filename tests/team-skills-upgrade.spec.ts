/**
 * The v0.1.6 → v0.1.7 Team Skill upgrade, proved on the state an existing
 * deployment actually holds.
 *
 * v0.1.7 adds two method skills (`grilling`, `research`) and four default role
 * bindings that a v0.1.6 deployment never wrote. A stored Team record from that
 * release carries no `officialSkills` declaration at all, so "the record says
 * nothing" and "the user removed every default" look identical unless the
 * upgrade takes its defaults from the shipped catalog instead of the record.
 * These specs drive the real store, the real bindings document, and the real
 * startup sequence (install the shipped skill folders, then reconcile) to prove
 * what an upgrading deployment ends up with, what an explicit unbind keeps, and
 * which role slots the new skills can reach.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TeamSkillStore } from '../src/team-skills/store.ts'
import { CAPTAIN_ROLE, TeamSkillManager } from '../src/team-skills/manager.ts'
import { OFFICIAL_SKILL_IDS, OFFICIAL_SKILL_VERSION } from '../src/team-skills/index.ts'
import { parseSkillFrontmatter } from '../src/team-skills/import.ts'
import { BUILTIN_TEAMS, builtinTeamDefinition } from '../src/builtin-teams.ts'
import { BUILTIN_TEAM_CATALOG } from '../src/team-catalog.ts'
import { slot, team } from './fixtures/team-presets.ts'
import type { TeamPreset } from '../src/types.ts'

/** Package root: the directory `npm pack` publishes from. */
const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

/** The two delivery skills v0.1.6 already shipped. */
const V016_SKILLS = ['github-repository-presentation', 'git-release-hygiene'] as const

const roots: string[] = []
afterEach(async () => { for (const path of roots.splice(0)) await rm(path, { recursive: true, force: true }) })

/** One fresh private Team Skill root. */
async function freshRoot(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), 'skill-upgrade-'))
  roots.push(path)
  return path
}

/** One shipped catalog entry; a missing identity is a spec bug, not a case. */
function shippedEntry(id: string) {
  const entry = BUILTIN_TEAMS.find(candidate => candidate.id === id)
  if (entry === undefined) throw new Error(`no shipped Team "${id}" in this package`)
  return entry
}

/**
 * The record a v0.1.6 deployment stored for a shipped Team.
 *
 * That release wrote no `officialSkills` field, and the settings schema
 * materializes its empty default, so both shapes occur in the field and both
 * must upgrade the same way.
 */
function storedBeforeV017(id: string, shape: 'absent' | 'empty' = 'absent'): TeamPreset {
  const record: TeamPreset = { ...builtinTeamDefinition(shippedEntry(id)) }
  if (shape === 'empty') return { ...record, officialSkills: [] }
  delete record.officialSkills
  return record
}

/** The bindings document a v0.1.6 deployment had written: delivery skills only. */
async function writeV016Bindings(path: string, rows: readonly (readonly [string, string, string])[]): Promise<void> {
  const document = {
    version: 1,
    bindings: rows.map(([teamId, roleId, assetId]) => ({ teamId, roleId, assetId })),
    seeded: rows.map(([teamId, roleId, assetId]) => JSON.stringify([teamId, roleId, assetId])).sort(),
  }
  await writeFile(join(path, 'bindings.json'), `${JSON.stringify(document, null, 2)}\n`, 'utf8')
}

/** Install the shipped skill folders, the step the plugin runs before reconciling. */
async function installShipped(store: TeamSkillStore, ids: readonly string[] = OFFICIAL_SKILL_IDS): Promise<void> {
  await store.ensureOfficial(ids.map(skillId => ({
    skillId,
    version: OFFICIAL_SKILL_VERSION,
    directory: join(PACKAGE_ROOT, 'assets', 'skills', skillId),
  })))
}

/** One opened store and manager over a fixed Team list: the state a process holds. */
async function open(path: string, teams: readonly TeamPreset[]) {
  const store = new TeamSkillStore(path)
  await store.open()
  let live: readonly TeamPreset[] = teams
  const manager = new TeamSkillManager(store, path, {
    teams: () => live,
    activeAssetIds: () => new Set(),
    activeSessions: () => [],
  })
  await manager.open()
  return { store, manager, setTeams: (next: readonly TeamPreset[]) => { live = next } }
}

/** Every stored binding as a stable `team/role → asset` row. */
function bindingRows(manager: TeamSkillManager): string[] {
  return manager.list().map(row => `${row.teamId}/${row.roleId} → ${row.assetId}`).sort()
}

/** The asset ids one role slot currently resolves to. */
function assetsOf(manager: TeamSkillManager, teamId: string, roleId: string): string[] {
  return manager.assetsFor(teamId, roleId).map(asset => asset.id)
}

/** The marker one default binding leaves behind so an unbind stays unbound. */
function seedKey(teamId: string, roleId: string, assetId: string): string {
  return JSON.stringify([teamId, roleId, assetId])
}

describe('upgrading a deployment that stored v0.1.6 records', () => {
  it('applies the new method bindings to shipped Teams whose record never declared them', async () => {
    const path = await freshRoot()
    // A v0.1.6 deployment: stored delivery bindings for one engineering Team,
    // and shipped records that never mentioned a default skill.
    await writeV016Bindings(path, [
      ['builtin-standard', 'builtin-standard:executor', 'builtin:github-repository-presentation'],
      ['builtin-standard', 'builtin-standard:executor', 'builtin:git-release-hygiene'],
    ])
    const discovery = storedBeforeV017('builtin-discovery', 'absent')
    const research = storedBeforeV017('builtin-research', 'empty')
    expect('officialSkills' in discovery, 'the v0.1.6 record carries no declaration').toBe(false)
    expect(research.officialSkills, 'the schema default for a v0.1.6 record is empty').toEqual([])
    // The defaults have to come from somewhere: the shipped catalog declares
    // them even though the stored records say nothing.
    expect(shippedEntry('builtin-discovery').officialSkillBindings).toEqual([
      { skillId: 'grilling', roleName: 'discovery-lead' },
      { skillId: 'research', roleName: 'technical-scout' },
      { skillId: 'research', roleName: 'product-scout' },
    ])
    const live = await open(path, [storedBeforeV017('builtin-standard'), discovery, research])

    // The pre-upgrade registry only has the delivery skills, so nothing new
    // can be bound and nothing new is claimed.
    await installShipped(live.store, V016_SKILLS)
    await live.manager.reconcile()
    expect(bindingRows(live.manager)).toEqual([
      'builtin-standard/builtin-standard:executor → builtin:git-release-hygiene',
      'builtin-standard/builtin-standard:executor → builtin:github-repository-presentation',
    ])

    // A later startup installs the whole shipped set and reconciles again: the
    // standard Team's record still declares nothing, so the catalog's leader,
    // advisor, reviewer, and executor defaults arrive without touching it. The
    // standard Team carries no specialist role, so no specialist workflow is
    // declared for it — a declaration naming a role it does not carry would
    // never resolve.
    await installShipped(live.store)
    await live.manager.reconcile()
    expect(bindingRows(live.manager)).toEqual([
      'builtin-discovery/builtin-discovery:product-scout → builtin:research',
      'builtin-discovery/builtin-discovery:technical-scout → builtin:research',
      'builtin-discovery/captain → builtin:grilling',
      'builtin-research/builtin-research:evidence-scout → builtin:research',
      'builtin-standard/builtin-standard:executor → builtin:agent-subagent-orchestration',
      'builtin-standard/builtin-standard:executor → builtin:executor-short-task-workflow',
      'builtin-standard/builtin-standard:executor → builtin:git-release-hygiene',
      'builtin-standard/builtin-standard:executor → builtin:github-repository-presentation',
      'builtin-standard/builtin-standard:fullstack-advisor → builtin:fullstack-advisor',
      'builtin-standard/builtin-standard:reviewer → builtin:agent-subagent-orchestration',
      'builtin-standard/builtin-standard:reviewer → builtin:independent-code-review-workflow',
      'builtin-standard/captain → builtin:agent-leader-communication',
      'builtin-standard/captain → builtin:agent-subagent-orchestration',
      'builtin-standard/captain → builtin:leader-long-task-orchestration',
      'builtin-standard/captain → builtin:leader-medium-task-workflow',
    ])

    // The seeded defaults are recorded on disk, which is what keeps a later
    // unbind from being undone by the next startup.
    const stored = JSON.parse(await readFile(join(path, 'bindings.json'), 'utf8')) as { seeded: string[] }
    expect(stored.seeded).toEqual(expect.arrayContaining([
      seedKey('builtin-discovery', CAPTAIN_ROLE, 'builtin:grilling'),
      seedKey('builtin-discovery', 'builtin-discovery:technical-scout', 'builtin:research'),
      seedKey('builtin-discovery', 'builtin-discovery:product-scout', 'builtin:research'),
      seedKey('builtin-research', 'builtin-research:evidence-scout', 'builtin:research'),
    ]))
  })

  it("takes a shipped Team's defaults from the catalog, not from the record it stored", async () => {
    const path = await freshRoot()
    // A record that drifted (an older import, a hand-edited document): its own
    // declaration names a delivery skill for the captain and no method skill.
    const drifted: TeamPreset = {
      ...storedBeforeV017('builtin-discovery'),
      officialSkills: [{ skillId: 'github-repository-presentation', roleName: 'discovery-lead' }],
    }
    const live = await open(path, [drifted])
    await installShipped(live.store)
    await live.manager.reconcile()

    // The catalog is the declaration source for a shipped identity, so the
    // release defaults win and the drifted line binds nothing.
    expect(bindingRows(live.manager)).toEqual([
      'builtin-discovery/builtin-discovery:product-scout → builtin:research',
      'builtin-discovery/builtin-discovery:technical-scout → builtin:research',
      'builtin-discovery/captain → builtin:grilling',
    ])
  })

  it('does not resurrect an explicit unbind of a new default across restarts', async () => {
    const path = await freshRoot()
    const discovery = storedBeforeV017('builtin-discovery')
    const live = await open(path, [discovery])
    await installShipped(live.store)
    await live.manager.reconcile()
    expect(assetsOf(live.manager, 'builtin-discovery', CAPTAIN_ROLE)).toEqual(['builtin:grilling'])

    expect(await live.manager.unassign('builtin-discovery', CAPTAIN_ROLE)).toBe(true)
    const afterUnbind = JSON.parse(await readFile(join(path, 'bindings.json'), 'utf8')) as {
      bindings: { teamId: string; roleId: string; assetId: string }[]
      seeded: string[]
    }
    expect(afterUnbind.bindings.some(row => row.teamId === 'builtin-discovery' && row.roleId === CAPTAIN_ROLE)).toBe(false)
    // The marker, not the binding, is what remembers the user's decision.
    expect(afterUnbind.seeded).toContain(seedKey('builtin-discovery', CAPTAIN_ROLE, 'builtin:grilling'))

    // Two restarts, each running the plugin's own startup sequence.
    for (const round of [1, 2]) {
      const restarted = await open(path, [discovery])
      await installShipped(restarted.store)
      await restarted.manager.reconcile()
      expect(assetsOf(restarted.manager, 'builtin-discovery', CAPTAIN_ROLE), `restart ${round} kept the unbind`).toEqual([])
      // The sibling default reconciled normally, so this is a real reconcile
      // pass and not a no-op that would hide a resurrection.
      expect(assetsOf(restarted.manager, 'builtin-discovery', 'builtin-discovery:technical-scout'), `restart ${round}`).toEqual(['builtin:research'])
    }
  })
})

describe('the role slots each method skill reaches', () => {
  it('lands grilling and research only on the roles the catalog names', async () => {
    const path = await freshRoot()
    const teams = BUILTIN_TEAM_CATALOG.map(entry => builtinTeamDefinition(shippedEntry(entry.id)))
    const live = await open(path, teams)
    await installShipped(live.store)
    await live.manager.reconcile()

    expect(live.manager.list().filter(row => row.assetId === 'builtin:grilling').map(row => `${row.teamId}/${row.roleId}`))
      .toEqual(['builtin-discovery/captain'])
    expect(live.manager.list().filter(row => row.assetId === 'builtin:research').map(row => `${row.teamId}/${row.roleId}`).sort())
      .toEqual([
        'builtin-discovery/builtin-discovery:product-scout',
        'builtin-discovery/builtin-discovery:technical-scout',
        'builtin-research/builtin-research:evidence-scout',
      ])
    // Nothing else moved: the lightweight Team declares 9 bindings, the
    // standard Team 11 (leader 4, advisor 1, reviewer 2, executor 4), the
    // fullstack Team 12 (leader 4, frontend 1, backend 1, reviewer 2, executor
    // 4), the Discovery Team 3, the Research Team 1, and the two work-mode
    // Teams 2 each — 40 in total.
    expect(bindingRows(live.manager)).toHaveLength(40)
    // Only the roles that own repository delivery carry the delivery pair: all
    // three development Teams' executors, and a repository-specialist in each of
    // the two work-mode Teams that has one.
    expect(bindingRows(live.manager).filter(row => row.includes('github-repository-presentation') || row.includes('git-release-hygiene')))
      .toHaveLength(10)
  })

  it('keeps a captain assignment out of member slots and a member assignment out of the captain slot', async () => {
    const path = await freshRoot()
    const live = await open(path, [builtinTeamDefinition(shippedEntry('builtin-discovery'))])
    await installShipped(live.store)
    await live.manager.reconcile()

    const captainRow = live.manager.list().find(row => row.teamId === 'builtin-discovery' && row.roleId === CAPTAIN_ROLE)
    const scoutRow = live.manager.list().find(row => row.teamId === 'builtin-discovery' && row.roleId === 'builtin-discovery:technical-scout')
    expect(captainRow).toMatchObject({ assetId: 'builtin:grilling', captain: true })
    // A member binding carries no captain marker, so the page can tell the two
    // slots apart even though both belong to one Team.
    expect(scoutRow).toMatchObject({ assetId: 'builtin:research' })
    expect(scoutRow?.captain).toBeUndefined()

    // A member role can never be written into the captain slot.
    expect(await live.manager.assign({
      teamId: 'builtin-discovery',
      roleId: 'builtin-discovery:technical-scout',
      assetId: 'builtin:grilling',
      captain: true,
    })).toMatchObject({ ok: false, reason: 'unknown-role' })

    // Unbinding the member slot leaves the captain's assignment intact.
    expect(await live.manager.unassign('builtin-discovery', 'builtin-discovery:technical-scout')).toBe(true)
    expect(assetsOf(live.manager, 'builtin-discovery', CAPTAIN_ROLE)).toEqual(['builtin:grilling'])
    expect(assetsOf(live.manager, 'builtin-discovery', 'builtin-discovery:technical-scout')).toEqual([])
  })
})

describe('Teams the catalog does not ship', () => {
  it('never seeds a user-owned Team, even one that copies a shipped name and roster', async () => {
    const path = await freshRoot()
    const base = team([
      slot({ id: 'scout', name: 'technical-scout' }),
      slot({ id: 'critic', name: 'critical-analyst' }),
    ], { name: 'discovery-lead' })
    const undeclared: TeamPreset = { ...base, id: 'user-discovery', name: '需求探索' }
    const declared: TeamPreset = {
      ...base,
      id: 'user-declared',
      name: '用户团队',
      officialSkills: [{ skillId: 'research', roleName: 'technical-scout' }],
    }
    const live = await open(path, [undeclared, declared])
    await installShipped(live.store)
    await live.manager.reconcile()

    // Only the declaration the user's own document carries is honoured.
    expect(bindingRows(live.manager)).toEqual(['user-declared/scout → builtin:research'])

    // A declaration that names no role in the Team binds nothing.
    live.setTeams([{ ...declared, id: 'user-missing-role', officialSkills: [{ skillId: 'grilling', roleName: 'nobody' }] }])
    await live.manager.reconcile()
    expect(bindingRows(live.manager)).toEqual([])
  })
})

describe('what the published package carries', () => {
  it.each(['grilling', 'research'] as const)('ships %s as a packaged, parseable skill folder', (id) => {
    const directory = join(PACKAGE_ROOT, 'assets', 'skills', id)
    expect(readdirSync(directory)).toEqual(['SKILL.md'])
    const frontmatter = parseSkillFrontmatter(readFileSync(join(directory, 'SKILL.md'), 'utf8'))
    expect(frontmatter?.name).toBe(id)
    expect(frontmatter?.description.trim()).not.toBe('')
    expect([...OFFICIAL_SKILL_IDS]).toContain(id)
    const manifest = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8')) as { files?: string[] }
    expect(manifest.files).toContain('assets/skills')
    expect(manifest.files).toContain('NOTICE')
  })

  it('commits the 0.1.7 skill ids and the quarantine fix into the built artifacts', () => {
    const quoted = (source: string): string[] => {
      const body = /\bOFFICIAL_SKILL_IDS = \[([\s\S]*?)\]/u.exec(source)?.[1]
      if (body === undefined) throw new Error('no OFFICIAL_SKILL_IDS array in the shipped artifact')
      return [...body.matchAll(/'([^']*)'|"([^"]*)"/gu)].map(match => match[1] ?? match[2] ?? '')
    }
    // Both built faces carry the release: the bundle `main` points at, and the
    // per-module host build.
    expect(quoted(readFileSync(join(PACKAGE_ROOT, 'lib', 'index.js'), 'utf8'))).toEqual([...OFFICIAL_SKILL_IDS])
    expect(quoted(readFileSync(join(PACKAGE_ROOT, 'lib', 'types', 'team-skills', 'index.js'), 'utf8'))).toEqual([...OFFICIAL_SKILL_IDS])

    // The catalog declarations and the reconcile fallback are what make the
    // upgrade reach a stored record, so the shipped build must carry both.
    const catalog = readFileSync(join(PACKAGE_ROOT, 'lib', 'types', 'team-catalog.js'), 'utf8')
    expect(catalog).toContain("skillId: 'grilling'")
    expect(catalog).toContain("skillId: 'research'")
    expect(catalog).toContain('officialSkillBindings: OFFICIAL_DISCOVERY_SKILLS')
    expect(catalog).toContain('officialSkillBindings: OFFICIAL_RESEARCH_SKILLS')
    expect(readFileSync(join(PACKAGE_ROOT, 'lib', 'types', 'team-skills', 'manager.js'), 'utf8'))
      .toContain('BUILTIN_TEAM_CATALOG.find(entry => entry.id === team.id)?.officialSkillBindings')

    // Baseline finding B1: the tool quarantine fix had to be rebuilt into the
    // shipped artifact, or the release would ship without it.
    expect(readFileSync(join(PACKAGE_ROOT, 'lib', 'index.js'), 'utf8')).toContain('CAPTAIN_RECOVERY_TOOLS')
    expect(readFileSync(join(PACKAGE_ROOT, 'lib', 'types', 'tool-policy.js'), 'utf8')).toContain('CAPTAIN_RECOVERY_TOOLS')
  })
})
