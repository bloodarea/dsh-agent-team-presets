import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { TeamSkillStore, diskComponent, installFromDirectory } from '../src/team-skills/store.ts'
import { TeamSkillManager } from '../src/team-skills/manager.ts'
import { TeamSkillRuntime } from '../src/team-skills/provider.ts'
import { TeamSkillService } from '../src/team-skills/service.ts'
import { OFFICIAL_SKILL_IDS } from '../src/team-skills/index.ts'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import { team, slot } from './fixtures/team-presets.ts'

const roots: string[] = []
const contexts: Context[] = []
const body = '---\nname: portable\ndescription: portable skill\n---\n\nBody\n'
const package_ = { name: 'portable', description: 'portable skill', totalBytes: Buffer.byteLength(body), files: [{ path: 'SKILL.md', bytes: new TextEncoder().encode(body) }] }
async function root() { const path = await mkdtemp(join(tmpdir(), 'skill-portability-')); roots.push(path); return realpath(path) }
async function linkDirectory(target: string, path: string) { await symlink(target, path, process.platform === 'win32' ? 'junction' : 'dir') }
afterEach(async () => {
  for (const ctx of contexts.splice(0)) await ctx.fiber.dispose()
  for (const path of roots.splice(0)) await rm(path, { force: true, recursive: true })
})

function serviceFor(store: TeamSkillStore, originalRoot: string) {
  const teams = [team([slot({ id: 'executor', name: 'executor' })], {})]
  const manager = new TeamSkillManager(store, originalRoot, { teams: () => teams, activeAssetIds: () => new Set(), activeSessions: () => [] })
  const ctx = new Context(); contexts.push(ctx)
  const service = new TeamSkillService(ctx, { store, manager, teams: () => teams, official: () => [], ready: Promise.resolve(true), resync: () => {} })
  return { manager, service }
}

describe('portable Team Skill storage', () => {
  it('encodes logical ids and versions without Windows invalid names or case collisions', () => {
    const values = ['builtin:portable', 'custom:portable', 'override:portable', 'a:b', 'a_b', 'A', 'a', 'CON', 'con', 'con.txt', 'AUX', 'NUL', 'COM1', 'LPT9', 'tail.', '1:2', 'x'.repeat(200)]
    const names = values.map(diskComponent)
    expect(new Set(names.map(name => name.toLowerCase())).size).toBe(values.length)
    for (const name of names) {
      expect(name).not.toMatch(/[<>:"/\\|?*\x00-\x1f]|[. ]$/u)
      expect(name).not.toMatch(/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu)
      expect(name.length).toBeLessThanOrEqual(241)
    }
    expect(diskComponent('simple-id')).toBe('simple-id')
    expect(diskComponent('1')).toBe('1')
    for (const name of ['../x', 'a/b', 'a\\b', '~aa', 'tail ', '']) expect(() => diskComponent(name)).toThrow()
  })

  it.skipIf(process.platform !== 'win32')('rejects drive-relative legacy recovery coordinates on Windows', async () => {
    const path = await root()
    await writeFile(join(path, 'transaction.json'), JSON.stringify({ version: 1, id: '12345678', actions: [{ kind: 'create', path: 'assets/C:/x' }] }))
    await expect(new TeamSkillStore(path).open()).rejects.toThrow(/transaction path/u)
  })

  it('installs all shipped skills into portable directories and reopens original logical identities', async () => {
    const path = await root(); const store = new TeamSkillStore(path); await store.open()
    await store.ensureOfficial(OFFICIAL_SKILL_IDS.map(skillId => ({ skillId, version: '1', directory: join(import.meta.dirname, '..', 'assets', 'skills', skillId) })))
    expect(store.list().map(asset => asset.id).sort()).toEqual(OFFICIAL_SKILL_IDS.map(id => `builtin:${id}`).sort())
    for (const asset of store.list()) {
      expect(relative(path, store.assetPath(asset.id, asset.version))).not.toContain(':')
      expect(await store.verify(asset.id)).toBe(true)
    }
    const edited = await store.createOverride('git-release-hygiene', 'override:git-release-hygiene')
    await store.writeFile(edited.id, 'notes.txt', 'local edit')
    const reopened = new TeamSkillStore(path); await reopened.open()
    expect(await reopened.readText(edited.id, 'notes.txt')).toBe('local edit')
    expect(await reopened.readText(edited.id, 'SKILL.md', edited.version)).toContain('git-release-hygiene')
  })

  it('supports a relocated home and package ancestor, pins the root, and persists bindings through the same path', async () => {
    const physical = await root(); const other = await root(); const aliases = await root()
    const home = join(aliases, 'home'); await linkDirectory(physical, home)
    const source = join(physical, 'package', 'portable'); await mkdir(source, { recursive: true }); await writeFile(join(source, 'SKILL.md'), body)
    const configured = join(home, 'agent-team-presets', 'team-skills')
    const store = new TeamSkillStore(configured); await store.open()
    expect(store.root).toBe(join(physical, 'agent-team-presets', 'team-skills'))
    await store.ensureOfficial([{ skillId: 'portable', version: '1', directory: join(home, 'package', 'portable') }])
    const { manager, service } = serviceFor(store, configured); await manager.open()
    expect((await manager.assign({ teamId: 'team-1', roleId: 'executor', assetId: 'builtin:portable' })).ok).toBe(true)
    expect(await service.prepareImportFolder()).toMatchObject({ ok: true, path: join(store.root, 'inbox') })
    expect(await service.scanImportFolder()).toMatchObject({ ok: true, scanned: 0 })
    await rm(home); await linkDirectory(other, home)
    expect(await store.readText('builtin:portable', 'SKILL.md')).toBe(body)
    await manager.unassign('team-1', 'executor')
    expect(JSON.parse(await readFile(join(store.root, 'bindings.json'), 'utf8')).bindings).toEqual([])
    expect(await readdir(other)).toEqual([])
  })

  it('still refuses root, imported source, bindings and inbox links without touching external files', async () => {
    const path = await root(); const outside = await root(); const rootLink = join(await root(), 'store')
    await writeFile(join(outside, 'sentinel'), 'untouched')
    await linkDirectory(outside, rootLink)
    await expect(new TeamSkillStore(rootLink).open()).rejects.toThrow(/symlink/u)
    const store = new TeamSkillStore(path); await store.open()
    await expect(installFromDirectory(store, rootLink, { id: 'custom:portable', skillId: 'portable', origin: 'custom', version: '1' })).rejects.toThrow(/symlink/u)
    const { manager, service } = serviceFor(store, path)
    await linkDirectory(outside, join(path, 'bindings.json'))
    await expect(manager.open()).rejects.toThrow(/symlink/u)
    await rm(join(path, 'bindings.json')); await manager.open()
    await linkDirectory(outside, join(path, 'inbox'))
    expect(await service.prepareImportFolder()).toMatchObject({ ok: false, reason: 'scan-folder-refused' })
    expect(await service.scanImportFolder()).toMatchObject({ ok: false, reason: 'scan-refused' })
    const unavailableContext = new Context(); contexts.push(unavailableContext)
    const unavailable = new TeamSkillService(unavailableContext, {
      store, manager, teams: () => [], official: () => [], ready: Promise.resolve(false),
      startupIssue: () => 'startup failed: exact path refusal', resync: () => {},
    })
    expect(await unavailable.library()).toMatchObject({ assets: [], issue: 'startup failed: exact path refusal' })
    expect(await readdir(outside)).toEqual(['sentinel'])
    expect(await readFile(join(outside, 'sentinel'), 'utf8')).toBe('untouched')
  })

  it('keeps root resolution failures inside asynchronous startup and ignores unpublished atomic manifest temps', async () => {
    const path = await root()
    await writeFile(join(path, 'file'), 'regular file')
    for (const location of [join(path, 'file'), join(path, 'file', 'parent', 'store')]) {
      const invalid = new TeamSkillStore(location)
      expect(() => invalid.root).not.toThrow()
      await expect(invalid.open()).rejects.toMatchObject({ code: 'ENOTDIR' })
    }
    const store = new TeamSkillStore(join(path, 'good')); await store.open()
    const asset = await store.install(package_, { id: 'custom:portable', version: '1', origin: 'custom' })
    const manifestDirectory = join(store.root, 'manifests', diskComponent(asset.id))
    await writeFile(join(manifestDirectory, '.tmp-12345678'), 'incomplete')
    const reopened = new TeamSkillStore(store.root); await reopened.open()
    expect(await reopened.readText(asset.id, 'SKILL.md')).toBe(body)
    expect(await readFile(join(manifestDirectory, '.tmp-12345678'), 'utf8')).toBe('incomplete')
  })

  it.each(['assets', 'manifests'])('refuses an internal %s directory link', async kind => {
    const path = await root(); const outside = await root()
    await linkDirectory(outside, join(path, kind))
    await expect(new TeamSkillStore(path).open()).rejects.toThrow(/symlink/u)
    expect(await readdir(outside)).toEqual([])
  })

  // A legacy ':' directory is impossible to create on Windows; the same migration
  // and recovery tests exercise the POSIX upgrade path where it actually exists.
  describe.skipIf(process.platform === 'win32')('legacy POSIX layout migration', () => {
    async function legacy() {
      const path = await root(); const store = new TeamSkillStore(path); await store.open()
      const first = await store.install(package_, { id: 'custom:portable', version: '1:old', origin: 'custom' })
      const second = await store.install(package_, { id: first.id, version: '2:new', origin: 'custom' })
      for (const kind of ['assets', 'manifests']) {
        const directory = join(path, kind, diskComponent(first.id))
        for (const version of [first.version, second.version]) {
          const suffix = kind === 'manifests' ? '.json' : ''
          await rename(join(directory, diskComponent(version) + suffix), join(directory, version + suffix))
        }
        await rename(directory, join(path, kind, first.id))
      }
      return { path, first, second }
    }
    it('migrates all pinned versions, preserves identities, and removes the encoded layout', async () => {
      const { path, first, second } = await legacy()
      const store = new TeamSkillStore(path); await store.open()
      expect(store.get(first.id)).toEqual(second)
      expect(await store.readText(first.id, 'SKILL.md', first.version)).toBe(body)
      expect(await store.readText(first.id, 'SKILL.md', second.version)).toBe(body)
      expect(await readdir(join(path, 'assets'))).toEqual([diskComponent(first.id)])
      const again = new TeamSkillStore(path); await again.open()
      expect(await again.verify(first.id)).toBe(true)
      await again.remove(first.id)
      expect(await readdir(join(path, 'assets'))).toEqual([])
    })
    it('refuses conflicting old/new layouts and leaves both untouched', async () => {
      const { path, first } = await legacy()
      const newDirectory = join(path, 'assets', diskComponent(first.id))
      await mkdir(newDirectory); await writeFile(join(newDirectory, 'sentinel'), 'untouched')
      await expect(new TeamSkillStore(path).open()).rejects.toThrow(/conflicting/u)
      expect(await readFile(join(newDirectory, 'sentinel'), 'utf8')).toBe('untouched')
      expect(await readFile(join(path, 'assets', first.id, first.version, 'SKILL.md'), 'utf8')).toBe(body)
    })
    it.each([false, true])('recovers an interrupted relocation (registry committed: %s)', async committed => {
      const { path, first } = await legacy()
      const from = `assets/${first.id}`; const destination = `assets/${diskComponent(first.id)}`
      await rename(join(path, from), join(path, destination))
      const id = '12345678-abcd'
      await writeFile(join(path, 'transaction.json'), JSON.stringify({ version: 1, id, actions: [{ kind: 'relocate', path: from, destination }] }))
      if (committed) {
        const registry = JSON.parse(await readFile(join(path, 'registry.json'), 'utf8'))
        registry.transactionId = id; await writeFile(join(path, 'registry.json'), JSON.stringify(registry))
      }
      const reopened = new TeamSkillStore(path); await reopened.open()
      expect(await reopened.readText(first.id, 'SKILL.md', first.version)).toBe(body)
      expect(await readdir(path)).not.toContain('transaction.json')
    })
  })

  it('reports the real version directory to the page so copy-path cannot guess the layout', async () => {
    const path = await root(); const store = new TeamSkillStore(path); await store.open()
    await store.ensureOfficial(OFFICIAL_SKILL_IDS.map(skillId => ({ skillId, version: '1', directory: join(import.meta.dirname, '..', 'assets', 'skills', skillId) })))
    const { service } = serviceFor(store, path)
    const asset = store.list()[0]!
    const detail = await service.detail(asset.id)
    expect(detail).toMatchObject({ directory: store.assetPath(asset.id, asset.version) })
    if ('directory' in detail) expect((await readdir(detail.directory)).sort()).toEqual(asset.files.map(file => file.path.split('/')[0]).filter((name, index, all) => all.indexOf(name) === index).sort())
  })

  it('injects both packaged skills into the bound role only (desktop D-R04)', async () => {
    const physical = await root(); const aliases = await root()
    const home = join(aliases, 'home'); await linkDirectory(physical, home)
    const packageAlias = join(aliases, 'package'); await linkDirectory(join(import.meta.dirname, '..'), packageAlias)
    const configured = join(home, '.dsh', 'agent-team-presets', 'team-skills')
    const store = new TeamSkillStore(configured); await store.open()
    await store.ensureOfficial(OFFICIAL_SKILL_IDS.map(skillId => ({ skillId, version: '1', directory: join(packageAlias, 'assets', 'skills', skillId) })))
    const { manager } = serviceFor(store, configured); await manager.open()
    for (const asset of store.list()) expect((await manager.assign({ teamId: 'team-1', roleId: 'executor', assetId: asset.id })).ok).toBe(true)

    const skillContext = new Context(); contexts.push(skillContext)
    await skillContext.plugin(SkillRegistry)
    const runtime = new TeamSkillRuntime(skillContext, store, () => {})
    const executor = { id: 'executor' } as never
    const advisor = { id: 'advisor' } as never
    try {
      await runtime.sync({ agent: executor, assets: manager.assetsFor('team-1', 'executor') })
      expect((await skillContext.skills.list({ scope: executor })).map(skill => skill.name).sort()).toEqual([...OFFICIAL_SKILL_IDS].sort())
      expect(await skillContext.skills.list({ scope: advisor })).toEqual([])
      expect(await skillContext.skills.list()).toEqual([])
      const loaded = await skillContext.skills.get('git-release-hygiene', { scope: executor })
      expect(loaded?.content).toContain('# Git 变更与版本交付')
      expect(loaded?.content).not.toContain('description:')
      expect(await readFile(join(loaded!.resourceBase!.path, 'SKILL.md'), 'utf8')).toContain('name: git-release-hygiene')
    } finally {
      await runtime.dispose()
    }
  })
})
