import { afterEach, describe, expect, it } from 'vitest'
import { mkdir, mkdtemp, readFile, readdir, rename, rm, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { TeamSkillStore, diskComponent, installFromDirectory } from '../src/team-skills/store.ts'
import { buildSkillPackage, parseSkillFrontmatter } from '../src/team-skills/import.ts'
import { MAX_SKILL_FILE_BYTES } from '../src/team-skills/paths.ts'

const roots: string[] = []
async function root(): Promise<string> { const path = await mkdtemp(join(tmpdir(), 'skill-storage-')); roots.push(path); return path }
afterEach(async () => { for (const path of roots.splice(0)) await rm(path, { recursive: true, force: true }) })
const instruction = '---\nname: test-skill\ndescription: original\n---\nBody\n'
function package_(body = instruction) {
  const result = buildSkillPackage([{ path: 'SKILL.md', bytes: new TextEncoder().encode(body) }, { path: 'notes.txt', bytes: new TextEncoder().encode('original') }])
  if (!result.ok) throw new Error(result.reason)
  return result.skill
}
async function installed() { const path = await root(); const store = new TeamSkillStore(path); await store.open(); const asset = await store.install(package_(), { id: 'custom:test', origin: 'custom', version: '1' }); return { path, store, asset } }

describe('Team Skill storage regressions', () => {
  it('parses YAML quoting, comments, folded and literal scalars without rewriting bytes', () => {
    expect(parseSkillFrontmatter('---\nname: "test-skill" # comment\ndescription: >-\n  a folded\n  description\nmetadata:\n  tags: [one, two]\n---\n')).toEqual({ name: 'test-skill', description: 'a folded description' })
    expect(parseSkillFrontmatter("---\nname: test-skill\ndescription: 'it''s quoted: value # literal'\n---\n")?.description).toBe("it's quoted: value # literal")
    expect(parseSkillFrontmatter('---\nname: test-skill\ndescription: |\n  first\n  second\n---\n')?.description).toBe('first\nsecond\n')
    expect(parseSkillFrontmatter('---\nname: test-skill\nname: duplicated\ndescription: x\n---\n')).toBeUndefined()
    expect(parseSkillFrontmatter('---\nname: [bad\ndescription: x\n---\n')).toBeUndefined()
  })
  it('keeps every concurrent edit and produces distinct immutable versions even at the same timestamp', async () => {
    const { path, store, asset } = await installed()
    const versions = await Promise.all(Array.from({ length: 8 }, (_, i) => store.writeFile(asset.id, `notes/${i}.txt`, String(i))))
    expect(new Set(versions.map(row => row.version)).size).toBe(8)
    for (let i = 0; i < 8; i++) expect(await store.readText(asset.id, `notes/${i}.txt`)).toBe(String(i))
    expect(await store.readText(asset.id, 'notes.txt', '1')).toBe('original')
    const reopened = new TeamSkillStore(path); await reopened.open()
    expect(await reopened.readText(asset.id, 'notes.txt', versions[0]!.version)).toBe('original')
    expect(() => { (store.get(asset.id)!.files as unknown as unknown[]).push({}) }).toThrow()
  })
  it('refuses reusing a version and preserves its bytes and registry revision', async () => {
    const { store, asset } = await installed()
    const revision = store.registryRevision
    await expect(store.install(package_(), { id: asset.id, origin: 'custom', version: '1' })).rejects.toThrow(/already exists/u)
    expect(store.registryRevision).toBe(revision)
    expect(await store.readText(asset.id, 'SKILL.md')).toBe(instruction)
  })
  it('rolls back a whole transaction including published folders when its callback fails', async () => {
    const { path, store, asset } = await installed()
    const registry = await readFile(join(path, 'registry.json'), 'utf8')
    await expect(store.transaction(async () => { await store.writeFile(asset.id, 'notes.txt', 'changed'); await store.remove(asset.id); throw new Error('cancelled') })).rejects.toThrow('cancelled')
    expect(store.get(asset.id)).toEqual(asset)
    expect(await readFile(join(path, 'registry.json'), 'utf8')).toBe(registry)
    expect(await store.readText(asset.id, 'notes.txt')).toBe('original')
    expect(await readdir(join(path, 'assets', diskComponent(asset.id)))).toEqual(['1'])
  })
  it('restores memory and directories when atomic registry replacement fails', async () => {
    const { path, store, asset } = await installed()
    // A directory at the index location allows reads to fail without relying on root-sensitive chmod.
    await rm(join(path, 'registry.json'))
    await mkdir(join(path, 'registry.json'))
    await expect(store.writeFile(asset.id, 'notes.txt', 'changed')).rejects.toThrow()
    expect(store.get(asset.id)).toEqual(asset)
    expect(await readdir(join(path, 'assets', diskComponent(asset.id)))).toEqual(['1'])
    const fresh = new TeamSkillStore(path)
    await expect(fresh.open()).rejects.toThrow()
    await rm(join(path, 'registry.json'), { recursive: true })
    await fresh.open()
    expect(fresh.list()).toEqual([])
  })
  it('rolls back when registry rename fails after staging a new version', async () => {
    const { path, store, asset } = await installed()
    const before = await readFile(join(path, 'registry.json'), 'utf8')
    await expect(store.transaction(async () => {
      await store.writeFile(asset.id, 'notes.txt', 'changed')
      await rm(join(path, 'registry.json'))
      await mkdir(join(path, 'registry.json'))
    })).rejects.toThrow()
    expect(store.get(asset.id)).toEqual(asset)
    expect(await readdir(join(path, 'assets', diskComponent(asset.id)))).toEqual(['1'])
    await rm(join(path, 'registry.json'), { recursive: true })
    await writeFile(join(path, 'registry.json'), before)
    expect(await store.readText(asset.id, 'notes.txt')).toBe('original')
  })
  it('does not expose pending asset changes to unrelated readers', async () => {
    const { store, asset } = await installed()
    let release!: () => void
    let staged!: () => void
    const waiting = new Promise<void>(resolve => { release = resolve })
    const ready = new Promise<void>(resolve => { staged = resolve })
    const mutation = store.transaction(async () => { await store.writeFile(asset.id, 'notes.txt', 'changed'); staged(); await waiting })
    await ready
    expect(store.get(asset.id)).toEqual(asset)
    expect(await store.readText(asset.id, 'notes.txt')).toBe('original')
    release(); await mutation
    expect(await store.readText(asset.id, 'notes.txt')).toBe('changed')
  })
  it('revalidates instructions and size limits on edits without changing the registry', async () => {
    const { store, asset } = await installed()
    await expect(store.writeFile(asset.id, 'SKILL.md', 'invalid')).rejects.toThrow(/invalid-frontmatter/u)
    await expect(store.writeFile(asset.id, 'notes.txt', 'x'.repeat(MAX_SKILL_FILE_BYTES + 1))).rejects.toThrow(/file-too-large/u)
    await expect(store.writeFile(asset.id, '../escaped', 'x')).rejects.toThrow()
    expect(store.get(asset.id)).toEqual(asset)
  })
  it('reads only manifest files and refuses real file and ancestor symlinks', async () => {
    const { store, asset } = await installed()
    const directory = store.assetPath(asset.id, asset.version)
    await writeFile(join(directory, 'secret.txt'), 'unlisted')
    await expect(store.readText(asset.id, 'secret.txt')).rejects.toThrow(/manifest/u)
    const outside = await root(); await writeFile(join(outside, 'notes.txt'), 'original')
    await rm(join(directory, 'notes.txt')); await symlink(join(outside, 'notes.txt'), join(directory, 'notes.txt'))
    await expect(store.readBytes(asset.id, 'notes.txt')).rejects.toThrow(/symlink/u)
    expect(await store.verify(asset.id)).toBe(false)
    const target = await root(); const linkedRoot = join(await root(), 'linked'); await symlink(target, linkedRoot)
    const unsafe = new TeamSkillStore(linkedRoot)
    await expect(unsafe.open()).rejects.toThrow(/symlink/u)
    await expect(installFromDirectory(store, linkedRoot, { id: 'custom:other', skillId: 'test-skill', origin: 'custom', version: '1' })).rejects.toThrow(/symlink/u)
  })
  it('rejects unsafe identities and malformed registry rows without treating them as empty', async () => {
    const path = await root()
    for (const assets of [[null], [{ id: '../outside' }], [1]]) {
      await writeFile(join(path, 'registry.json'), JSON.stringify({ version: 1, assets }))
      await expect(new TeamSkillStore(path).open()).rejects.toThrow()
    }
    await rm(join(path, 'registry.json'))
    const store = new TeamSkillStore(path); await store.open()
    await expect(store.install(package_(), { id: '../outside', origin: 'custom', version: '1' })).rejects.toThrow()
    await expect(store.install(package_(), { id: 'custom:other', origin: 'custom', version: '../1' })).rejects.toThrow()
  })
  it('never overwrites an edited override when creation is repeated', async () => {
    const path = await root(); const source = await root(); await writeFile(join(source, 'SKILL.md'), instruction)
    const store = new TeamSkillStore(path); await store.open()
    await store.ensureOfficial([{ skillId: 'test-skill', directory: source, version: '1' }])
    const first = await store.createOverride('test-skill', 'override:test')
    const changed = await store.writeFile(first.id, 'SKILL.md', instruction.replace('test-skill', first.skillId).replace('original', 'edited'))
    const again = await store.createOverride('test-skill', first.id)
    expect(again).toEqual(changed)
    expect(await store.readText(first.id, 'SKILL.md')).toContain('edited')
    expect(await store.readText(first.id, 'SKILL.md', first.version)).toContain('original')
  })
  it('never rewrites a shipped version whose content changed without a bump', async () => {
    const path = await root(); const source = await root(); await writeFile(join(source, 'SKILL.md'), instruction)
    const store = new TeamSkillStore(path); await store.open()
    await store.ensureOfficial([{ skillId: 'test-skill', directory: source, version: '1' }])
    const pinned = await store.readText('builtin:test-skill', 'SKILL.md', '1')
    await writeFile(join(source, 'SKILL.md'), instruction.replace('original', 'silently changed'))
    const warnings: string[] = []
    expect(await store.ensureOfficial([{ skillId: 'test-skill', directory: source, version: '1' }], warnings)).toEqual([])
    expect(warnings).toHaveLength(1)
    expect(await store.readText('builtin:test-skill', 'SKILL.md', '1')).toBe(pinned)
  })
  it('reuses an immutable version directory when a package is reinstalled or downgraded', async () => {
    const path = await root(); const source = await root(); await writeFile(join(source, 'SKILL.md'), instruction)
    const store = new TeamSkillStore(path); await store.open()
    await store.ensureOfficial([{ skillId: 'test-skill', directory: source, version: '1' }])
    await writeFile(join(source, 'SKILL.md'), instruction.replace('original', 'version two'))
    await store.ensureOfficial([{ skillId: 'test-skill', directory: source, version: '2' }])
    expect(store.get('builtin:test-skill')?.version).toBe('2')
    await writeFile(join(source, 'SKILL.md'), instruction)
    expect(await store.ensureOfficial([{ skillId: 'test-skill', directory: source, version: '1' }])).toContain('builtin:test-skill')
    expect(store.get('builtin:test-skill')?.version).toBe('1')
    expect(await store.readText('builtin:test-skill', 'SKILL.md', '1')).toBe(instruction)
    expect(await store.readText('builtin:test-skill', 'SKILL.md', '2')).toContain('version two')
  })
  it.each([false, true])('recovers a deletion interrupted after rename (registry committed: %s)', async (committed) => {
    const { path, asset } = await installed()
    const id = '12345678-1234-1234-1234-123456789abc'
    const actions = [
      { kind: 'move', path: `assets/${diskComponent(asset.id)}`, backup: '.removed-11111111' },
      { kind: 'move', path: `manifests/${diskComponent(asset.id)}`, backup: '.removed-22222222' },
    ]
    await writeFile(join(path, 'transaction.json'), JSON.stringify({ version: 1, id, actions }))
    for (const action of actions) await rename(join(path, action.path), join(path, action.backup))
    if (committed) await writeFile(join(path, 'registry.json'), JSON.stringify({ version: 1, transactionId: id, assets: [] }))
    const reopened = new TeamSkillStore(path); await reopened.open()
    if (committed) {
      expect(reopened.get(asset.id)).toBeUndefined()
      await expect(readFile(join(path, 'assets', diskComponent(asset.id), diskComponent(asset.version), 'SKILL.md'))).rejects.toMatchObject({ code: 'ENOENT' })
    } else {
      expect(await reopened.readText(asset.id, 'SKILL.md')).toBe(instruction)
      expect(reopened.get(asset.id)).toEqual(asset)
    }
    expect((await readdir(path)).filter(name => name.startsWith('.removed-') || name === 'transaction.json')).toEqual([])
    const again = new TeamSkillStore(path); await again.open()
    expect(again.list()).toEqual(reopened.list())
  })
  it.each(['directory', 'manifest', 'committed'] as const)('recovers an interrupted version-one install at %s', async (phase) => {
    const path = await root()
    const id = '12345678-1234-1234-1234-123456789abc'
    // Model the on-disk state at each kill point, including the write-ahead
    // action recorded before its corresponding filesystem effect.
    const donor = await installed()
    const asset = donor.asset
    const directory = `assets/${diskComponent(asset.id)}/${diskComponent(asset.version)}`
    const manifest = `manifests/${diskComponent(asset.id)}/${diskComponent(asset.version)}.json`
    await mkdir(join(path, directory), { recursive: true })
    for (const file of package_().files) await writeFile(join(path, directory, file.path), file.bytes)
    await mkdir(join(path, 'manifests', diskComponent(asset.id)), { recursive: true })
    const actions = [{ kind: 'create', path: '.stage-11111111' }, { kind: 'create', path: directory }, { kind: 'create', path: manifest }]
    await writeFile(join(path, 'transaction.json'), JSON.stringify({ version: 1, id, actions }))
    if (phase !== 'directory') await writeFile(join(path, manifest), JSON.stringify(asset))
    if (phase === 'committed') await writeFile(join(path, 'registry.json'), JSON.stringify({ version: 1, transactionId: id, assets: [asset] }))
    const reopened = new TeamSkillStore(path); await reopened.open()
    if (phase === 'committed') {
      expect(await reopened.readText(asset.id, 'SKILL.md')).toBe(instruction)
      await expect(reopened.install(package_(), { id: asset.id, origin: 'custom', version: '1' })).rejects.toThrow(/already exists/u)
    } else {
      expect(reopened.list()).toEqual([])
      // The interrupted publication must not poison a retry of immutable v1.
      await reopened.install(package_(), { id: asset.id, origin: 'custom', version: '1' })
      expect(await reopened.readText(asset.id, 'SKILL.md')).toBe(instruction)
    }
    expect((await readdir(path)).filter(name => name === 'transaction.json' || name.startsWith('.stage-'))).toEqual([])
  })
  it('replays recovery interrupted after a backup was already restored', async () => {
    const { path, asset } = await installed()
    await writeFile(join(path, 'transaction.json'), JSON.stringify({ version: 1, id: '12345678', actions: [
      { kind: 'move', path: `assets/${diskComponent(asset.id)}`, backup: '.removed-11111111' },
    ] }))
    const reopened = new TeamSkillStore(path); await reopened.open()
    expect(await reopened.readText(asset.id, 'SKILL.md')).toBe(instruction)
    await expect(readFile(join(path, 'transaction.json'))).rejects.toMatchObject({ code: 'ENOENT' })
  })
  it('refuses an unsafe recovery journal before touching files', async () => {
    const { path, asset } = await installed()
    await writeFile(join(path, 'transaction.json'), JSON.stringify({ version: 1, id: '12345678', actions: [{ kind: 'create', path: '../outside' }] }))
    await expect(new TeamSkillStore(path).open()).rejects.toThrow(/transaction path/u)
    expect(await readFile(join(path, 'assets', diskComponent(asset.id), diskComponent(asset.version), 'SKILL.md'), 'utf8')).toBe(instruction)
  })
  it('shares the manager lock reentrantly with nested mutations', async () => {
    const { store, asset } = await installed()
    await store.withLock(async () => { await store.writeFile(asset.id, 'notes.txt', 'nested') })
    expect(await store.readText(asset.id, 'notes.txt')).toBe('nested')
  })
})
