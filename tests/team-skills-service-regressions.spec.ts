import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { TeamSkillStore } from '../src/team-skills/store.ts'
import { TeamSkillManager } from '../src/team-skills/manager.ts'
import { TeamSkillService } from '../src/team-skills/service.ts'
import { team, slot } from './fixtures/team-presets.ts'

const roots: string[] = []
const contexts: Context[] = []
afterEach(async () => {
  vi.restoreAllMocks()
  for (const ctx of contexts.splice(0)) await ctx.fiber.dispose()
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true })
})
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'skill-service-'))
  roots.push(root)
  const store = new TeamSkillStore(root)
  await store.open()
  const teams = [team(['dev', 'already', 'explicit', 'unrelated'].map(id => slot({ id, name: id })), {})]
  const manager = new TeamSkillManager(store, root, { teams: () => teams, activeAssetIds: () => new Set(), activeSessions: () => [] })
  await manager.open()
  await store.install({ name: 'demo', description: 'demo', files: [{ path: 'SKILL.md', bytes: new TextEncoder().encode('---\nname: demo\ndescription: demo\n---\n\nBody\n') }], totalBytes: 1 }, { id: 'builtin:demo', origin: 'builtin', version: '1' })
  const ctx = new Context()
  contexts.push(ctx)
  const resync = vi.fn()
  const service = new TeamSkillService(ctx, { store, manager, teams: () => teams, official: () => ['demo'], ready: Promise.resolve(true), resync })
  return { root, store, manager, service, resync }
}

describe('Team Skill override service regressions', () => {
  it('creates uniquely named copies and only switches bindings on explicit request', async () => {
    const { root, store, manager, service, resync } = await fixture()
    await manager.assign({ teamId: 'team-1', roleId: 'dev', assetId: 'builtin:demo' })
    await manager.assign({ teamId: 'team-1', roleId: 'explicit', assetId: 'builtin:demo' })
    const first = await service.overrideSkill('demo', false)
    if (!('asset' in first)) throw new Error(first.detail)
    expect(first.asset).toMatchObject({ skillId: 'demo-1', officialSkillId: 'demo', bindings: [] })
    expect(first.body).toContain('name: demo-1')
    expect(manager.assetsFor('team-1', 'dev').map(asset => asset.id)).toEqual(['builtin:demo'])
    await manager.assign({ teamId: 'team-1', roleId: 'explicit', assetId: first.asset.id })
    const revision = manager.bindingRevision
    const second = await service.overrideSkill('demo', true)
    if (!('asset' in second)) throw new Error(second.detail)
    expect(second.asset.skillId).toBe('demo-2')
    expect(manager.bindingRevision).toBe(revision + 1)
    expect(manager.assetsFor('team-1', 'dev').map(asset => asset.id)).toEqual([second.asset.id])
    expect(manager.assetsFor('team-1', 'explicit').map(asset => asset.id)).toEqual([second.asset.id, first.asset.id])
    expect(JSON.parse(await readFile(join(root, 'bindings.json'), 'utf8')).bindings).toEqual(manager.list())
    expect(resync).toHaveBeenCalledTimes(1)
    const restored = await service.resetSkill(second.asset.id)
    expect(restored).toMatchObject({ asset: { id: second.asset.id, skillId: 'demo-2' }, body: expect.stringContaining('name: demo-2') })
    expect(manager.assetsFor('team-1', 'dev').map(asset => asset.id)).toEqual(['builtin:demo'])
    expect(await store.readText('builtin:demo', 'SKILL.md')).toContain('name: demo\n')
  })

  it('reports the created copy when a binding switch fails and rolls back its bindings', async () => {
    const { root, store, manager, service, resync } = await fixture()
    await manager.assign({ teamId: 'team-1', roleId: 'dev', assetId: 'builtin:demo' })
    const before = manager.list()
    const revision = manager.bindingRevision
    const create = store.createOverride.bind(store)
    vi.spyOn(store, 'createOverride').mockImplementationOnce(async (...args) => {
      const asset = await create(...args)
      await rm(join(root, 'bindings.json'))
      await mkdir(join(root, 'bindings.json'))
      return asset
    })
    const answer = await service.overrideSkill('demo', true)
    expect(answer).toMatchObject({ asset: { skillId: 'demo-1', bindings: [] }, bindingSwitchIssue: expect.any(String) })
    expect(manager.list()).toEqual(before)
    expect(manager.bindingRevision).toBe(revision)
    expect(resync).not.toHaveBeenCalled()
  })

  it('creates the import folder for the open gesture and stays idempotent', async () => {
    const { root, service } = await fixture()
    expect(await service.prepareImportFolder()).toMatchObject({ ok: true, root, path: join(root, 'inbox') })
    expect((await stat(join(root, 'inbox'))).isDirectory()).toBe(true)
    expect(await service.prepareImportFolder()).toMatchObject({ ok: true, path: join(root, 'inbox') })
  })

  it('scans the import folder and reports one reason per refused folder', async () => {
    const { root, store, service } = await fixture()
    const inbox = join(root, 'inbox')
    await mkdir(inbox, { recursive: true })
    const write = async (folder: string, body: string): Promise<void> => {
      await mkdir(join(inbox, folder), { recursive: true })
      await writeFile(join(inbox, folder, 'SKILL.md'), body)
    }
    await write('alpha', '---\nname: alpha\ndescription: alpha skill\n---\n\nBody\n')
    await write('duplicate-demo', '---\nname: demo\ndescription: same name as the shipped one\n---\n\nBody\n')
    await write('bad-name', '---\nname: Bad Name\ndescription: not kebab-case\n---\n\nBody\n')
    await mkdir(join(inbox, 'no-skill'))
    await writeFile(join(inbox, 'no-skill', 'README.md'), 'no instructions')
    await writeFile(join(inbox, 'plain.txt'), 'not a folder')

    const first = await service.scanImportFolder()
    if (!('entries' in first)) throw new Error('the scan was refused')
    expect(first).toMatchObject({ ok: true, scanned: 5, imported: 1, existing: 0, invalid: 4 })
    const rows = Object.fromEntries(first.entries.map(entry => [entry.folder, entry]))
    expect(rows['alpha']).toMatchObject({ status: 'imported', skillId: 'alpha', assetId: 'custom:alpha' })
    expect(rows['duplicate-demo']).toMatchObject({ status: 'invalid', reason: 'builtin-name-conflict', skillId: 'demo' })
    expect(rows['bad-name']).toMatchObject({ status: 'invalid', reason: 'invalid-name' })
    expect(rows['no-skill']).toMatchObject({ status: 'invalid', reason: 'missing-skill-file' })
    expect(rows['plain.txt']).toMatchObject({ status: 'invalid', reason: 'not-directory' })
    expect(await store.readText('custom:alpha', 'SKILL.md')).toContain('Body')

    // A second scan is idempotent: the published folder is now simply present.
    const second = await service.scanImportFolder()
    if (!('entries' in second)) throw new Error('the rescan was refused')
    expect(second).toMatchObject({ scanned: 5, imported: 0, existing: 1, invalid: 4 })
  })

  it('detects package changes without publishing, then updates the same bound asset', async () => {
    const { root, store, manager, service } = await fixture()
    const source = join(root, 'inbox', 'my source')
    const instruction = '---\nname: writer\ndescription: writer\nexecutables: [example]\n---\n\nBody\n'
    await mkdir(source, { recursive: true })
    await writeFile(join(source, 'SKILL.md'), instruction)
    await writeFile(join(source, 'image.png'), Buffer.from([0, 1, 2]))
    expect(await service.library(true)).toMatchObject({ inboxChanges: [{ skillId: 'writer', status: 'imported' }] })
    expect(store.get('custom:writer')).toBeUndefined()
    expect(await service.scanImportFolder()).toMatchObject({ imported: 1, entries: [{ ignoredDependencyFields: ['executables'] }] })
    expect(await service.detail('custom:writer')).toMatchObject({ directory: source })
    const dependencies = { executables: [], mcpServers: [{ serverName: 'docs', required: false }], otherSkills: [] }
    await store.updateDependencies('custom:writer', dependencies)
    await manager.assign({ teamId: 'team-1', roleId: 'dev', assetId: 'custom:writer' })
    const before = store.get('custom:writer')!
    expect(await service.library(true)).toMatchObject({ inboxChanges: [] })

    await writeFile(join(source, 'image.png'), Buffer.from([0, 1, 3]))
    expect(await service.library(true)).toMatchObject({ inboxChanges: [{ skillId: 'writer', status: 'updated' }] })
    expect(store.get(before.id)?.version).toBe(before.version)
    expect(await service.writeFile(before.id, 'SKILL.md', instruction.replace('Body', 'Too early')))
      .toMatchObject({ ok: false, detail: expect.stringContaining('source changed') })
    expect(await service.scanImportFolder()).toMatchObject({ updated: 1, existing: 0 })
    const after = store.get(before.id)!
    expect(after).toMatchObject({ id: before.id, dependencies })
    expect(after.version).not.toBe(before.version)
    expect(after.digest).not.toBe(before.digest)
    expect(await service.writeFile(before.id, 'SKILL.md', instruction, before.version))
      .toMatchObject({ ok: false, detail: expect.stringContaining('newer published version') })
    expect([...await store.readBytes(before.id, 'image.png', before.version)]).toEqual([0, 1, 2])
    expect([...await store.readBytes(before.id, 'image.png')]).toEqual([0, 1, 3])
    expect(manager.assetsFor('team-1', 'dev').map(asset => asset.id)).toEqual([before.id])

    const edited = instruction.replace('Body', 'Edited through DSH')
    expect(await service.writeFile(before.id, 'SKILL.md', edited)).toMatchObject({ body: edited })
    expect(await readFile(join(source, 'SKILL.md'), 'utf8')).toBe(edited)
    expect(await service.library(true)).toMatchObject({ inboxChanges: [] })
    await rm(source, { recursive: true })
    expect(await service.library(true)).toMatchObject({ inboxChanges: [{ skillId: 'writer', status: 'missing' }] })
    expect(await service.scanImportFolder()).toMatchObject({ missing: 1, updated: 0 })
    expect(manager.assetsFor('team-1', 'dev').map(asset => asset.id)).toEqual([before.id])
    expect(await store.readText(before.id, 'SKILL.md')).toBe(edited)
  })

  it('restores the source file if publishing a panel edit fails', async () => {
    const { root, store, service } = await fixture()
    const source = join(root, 'inbox', 'writer')
    const original = '---\nname: writer\ndescription: writer\n---\n\nOriginal\n'
    await mkdir(source, { recursive: true })
    await writeFile(join(source, 'SKILL.md'), original)
    expect(await service.scanImportFolder()).toMatchObject({ imported: 1 })
    const before = store.get('custom:writer')!
    vi.spyOn(store, 'install').mockRejectedValueOnce(new Error('publish failed'))
    expect(await service.writeFile(before.id, 'SKILL.md', original.replace('Original', 'New'), before.version))
      .toMatchObject({ ok: false, detail: expect.stringContaining('publish failed') })
    expect(await readFile(join(source, 'SKILL.md'), 'utf8')).toBe(original)
    expect(store.get(before.id)).toEqual(before)
    expect(await service.library(true)).toMatchObject({ inboxChanges: [] })
  })

  it('refuses reserved names and never picks a winner between duplicate scan sources', async () => {
    const { root, store, service } = await fixture()
    const files = (name: string) => [{ path: 'SKILL.md', base64: Buffer.from(`---\nname: ${name}\ndescription: test\n---\n`).toString('base64') }]
    expect(await service.importSkill(files('demo'))).toMatchObject({ ok: false, reason: 'builtin-name-conflict' })
    expect(await service.importSkill(files('research'))).toMatchObject({ ok: false, reason: 'builtin-name-conflict' })
    for (const folder of ['a', 'b']) {
      const path = join(root, 'inbox', folder)
      await mkdir(path, { recursive: true })
      await writeFile(join(path, 'SKILL.md'), Buffer.from(files('duplicate')[0]!.base64, 'base64'))
    }
    expect(await service.scanImportFolder()).toMatchObject({ imported: 0, invalid: 2, entries: [
      { folder: 'a', status: 'invalid', reason: 'duplicate-source-name' },
      { folder: 'b', status: 'invalid', reason: 'duplicate-source-name' },
    ] })
    expect(store.get('custom:duplicate')).toBeUndefined()
  })

  it('reports an empty scan when the import folder does not exist', async () => {
    const { root, service } = await fixture()
    const answer = await service.scanImportFolder()
    expect(answer).toMatchObject({ ok: true, root: join(root, 'inbox'), scanned: 0, imported: 0, existing: 0, invalid: 0, entries: [] })
  })

  it('keeps the full MCP dependency declaration in the detail it returns', async () => {
    const { store, service } = await fixture()
    const custom = await store.install({ name: 'browser', description: 'browser', files: [{ path: 'SKILL.md', bytes: new TextEncoder().encode('---\nname: browser\ndescription: browser\n---\n\nBody\n') }], totalBytes: 1 }, { id: 'custom:browser', origin: 'custom', version: '1' })
    await store.updateDependencies(custom.id, {
      executables: [],
      otherSkills: [],
      mcpServers: [{ serverName: 'browser', required: true, toolNames: ['click'], capabilities: ['tools'] }],
    })
    const detail = await service.detail(custom.id)
    expect(detail).toMatchObject({
      dependencies: {
        mcpServers: ['browser'],
        mcpDeclarations: [{ serverName: 'browser', required: true, toolNames: ['click'], capabilities: ['tools'] }],
        unverified: ['browser'],
      },
    })
  })

  it('serializes an assignment against a concurrent dependency publish', async () => {
    const { store, manager } = await fixture()
    const custom = await store.install({ name: 'browser', description: 'browser', files: [{ path: 'SKILL.md', bytes: new TextEncoder().encode('---\nname: browser\ndescription: browser\n---\n\nBody\n') }], totalBytes: 1 }, { id: 'custom:browser', origin: 'custom', version: '1' })
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    const order: string[] = []
    vi.spyOn(store, 'verify').mockImplementationOnce(async () => { await gate; return true })
    const assignment = manager.assign({ teamId: 'team-1', roleId: 'dev', assetId: custom.id }).then((result) => { order.push('assign'); return result })
    await vi.waitFor(() => expect(store.verify).toHaveBeenCalled())
    const update = store.updateDependencies(custom.id, { executables: [], otherSkills: [], mcpServers: [] }).then((asset) => { order.push('update'); return asset })
    // The publish must queue behind the check-and-bind transaction instead of
    // changing the asset version the assignment already validated.
    await new Promise<void>(resolve => { setTimeout(resolve, 25) })
    expect(order).toEqual([])
    release()
    expect((await assignment).ok).toBe(true)
    await update
    expect(order).toEqual(['assign', 'update'])
    expect(manager.assetsFor('team-1', 'dev').map(asset => asset.id)).toEqual([custom.id])
  })

  it('restores builtin bindings through the service and triggers resync', async () => {
    const { manager, service, resync } = await fixture()
    const spy = vi.spyOn(manager, 'restoreBuiltinBindings')
    const answer = await service.restoreBuiltinBindings(['builtin-fullstack'])
    expect(spy).toHaveBeenCalledWith(['builtin-fullstack'])
    expect(resync).toHaveBeenCalled()
    expect(answer).toHaveProperty('assets')
  })
})
