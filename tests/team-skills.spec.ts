/**
 * Team Skills: the private store, the import safety rules, the binding guards,
 * and — the reason the subsystem exists — per-Agent visibility.
 *
 * Every isolation case drives the REAL `SkillRegistry` and the REAL
 * `createScope`, because the claim being tested is exactly "a provider
 * registered for this Agent is invisible to every other Agent and to the global
 * layer". A stubbed registry could not prove that.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { createScope } from '@deepseek-ai/dsh-scope'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import { buildSkillPackage, importZipSkill, parseSkillFrontmatter, readZip } from '../src/team-skills/import.ts'
import { TeamSkillManager, CAPTAIN_ROLE } from '../src/team-skills/manager.ts'
import { TeamSkillRuntime, stripFrontmatter } from '../src/team-skills/provider.ts'
import { resolveSkillRoot, roleOfMember } from '../src/team-skills/index.ts'
import { TeamSkillStore, folderDigest } from '../src/team-skills/store.ts'
import { normalizeSkillPath, resolveInside } from '../src/team-skills/paths.ts'
import { builtinTeamDefinition, BUILTIN_TEAMS } from '../src/builtin-teams.ts'
import { slot, team } from './fixtures/team-presets.ts'
import type { TeamPreset } from '../src/types.ts'

const roots: string[] = []
const contexts: Context[] = []

afterEach(async () => {
  for (const ctx of contexts.splice(0)) await ctx.fiber.dispose()
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true })
})

/** One fresh temporary directory. */
async function base(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'team-skills-'))
  roots.push(root)
  return root
}

/** Encode one text file. */
const text = (value: string): Uint8Array => new TextEncoder().encode(value)

/** One minimal legal skill folder. */
const MINIMAL = [
  { path: 'SKILL.md', bytes: text('---\nname: frontend-design\ndescription: designs front ends\n---\n\nUse this method.\n') },
]

/** One skill folder carrying every resource kind a real skill uses. */
const RICH = [
  ...MINIMAL,
  { path: 'scripts/render.py', bytes: text('print("render")\n') },
  { path: 'scripts/build.sh', bytes: text('#!/bin/sh\necho build\n') },
  { path: 'references/guidelines.md', bytes: text('# Guidelines\n') },
  { path: 'assets/template.html', bytes: text('<html></html>') },
  // A directory the specification does not name is allowed too.
  { path: 'notes/extra.txt', bytes: text('extra') },
]

/** Build one stored asset through the store. */
async function install(store: TeamSkillStore, files: typeof MINIMAL, id: string, skillId = 'frontend-design') {
  const result = buildSkillPackage(files)
  if (!result.ok) throw new Error(`fixture is not a valid skill: ${result.reason}`)
  return store.install({ ...result.skill, name: skillId }, { id, origin: 'custom', version: '1' })
}

describe('importing a skill folder', () => {
  it('accepts a complete folder and keeps every resource and relative path', () => {
    const result = buildSkillPackage(RICH)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.skill.files.map(file => file.path)).toEqual([
      'SKILL.md', 'assets/template.html', 'notes/extra.txt', 'references/guidelines.md', 'scripts/build.sh', 'scripts/render.py',
    ])
    // The instruction file leads the listing; a reader looks for it first.
    expect(result.warnings.join(' ')).toContain('2 script file(s)')
  })

  it('requires SKILL.md and its two required frontmatter fields', () => {
    expect(buildSkillPackage([{ path: 'README.md', bytes: text('x') }])).toMatchObject({ ok: false, reason: 'missing-skill-file' })
    expect(buildSkillPackage([{ path: 'SKILL.md', bytes: text('no frontmatter') }])).toMatchObject({ ok: false, reason: 'invalid-frontmatter' })
    expect(buildSkillPackage([{ path: 'SKILL.md', bytes: text('---\nname: Frontend_Design\ndescription: x\n---\n') }]))
      .toMatchObject({ ok: false, reason: 'invalid-name' })
    expect(buildSkillPackage([{ path: 'SKILL.md', bytes: text('---\nname: frontend-design\ndescription:  \n---\n') }]))
      .toMatchObject({ ok: false, reason: 'missing-description' })
  })

  it('preserves optional frontmatter verbatim, including keys it does not read', () => {
    const document = '---\nname: frontend-design\ndescription: x\nlicense: MIT\ncompatibility: dsh>=0.2\nallowed-tools:\n  - read\nmetadata:\n  vendor: acme\n---\n\nBody\n'
    expect(parseSkillFrontmatter(document)).toEqual({ name: 'frontend-design', description: 'x' })
    const result = buildSkillPackage([{ path: 'SKILL.md', bytes: text(document) }])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // The stored bytes are the user's file: nothing was rewritten.
    expect(new TextDecoder().decode(result.skill.files[0]!.bytes)).toBe(document)
  })

  it('refuses traversal, absolute paths, backslashes, drive letters, and NUL bytes', () => {
    const cases: [string, string][] = [
      ['../escape.txt', 'parent-traversal'],
      ['a/../../escape.txt', 'parent-traversal'],
      ['/etc/passwd', 'absolute-path'],
      ['a\\b', 'backslash'],
      ['C:/windows', 'drive-letter'],
      ['a\0b', 'nul-byte'],
    ]
    for (const [path, reason] of cases) {
      expect(() => normalizeSkillPath(path), path).toThrow()
      try { normalizeSkillPath(path) } catch (error) { expect((error as { reason: string }).reason).toBe(reason) }
      const result = buildSkillPackage([...MINIMAL, { path, bytes: text('x') }])
      expect(result, path).toMatchObject({ ok: false })
    }
  })

  it('refuses a duplicate path and an over-large file or folder', () => {
    expect(buildSkillPackage([...MINIMAL, { path: './SKILL.md', bytes: text('again') }])).toMatchObject({ ok: false, reason: 'duplicate-path' })
    const huge = { path: 'assets/big.bin', bytes: new Uint8Array(10 * 1024 * 1024 + 1) }
    expect(buildSkillPackage([...MINIMAL, huge])).toMatchObject({ ok: false, reason: 'file-too-large' })
  })

  it('keeps a resolved path inside its asset root', () => {
    // The resolved path is native to the host: asserting a POSIX literal made
    // this test fail on Windows for the correct implementation.
    expect(resolveInside('/tmp/skill', 'a/b.txt')).toBe(resolve('/tmp/skill', 'a', 'b.txt'))
    expect(() => resolveInside('/tmp/skill', '../other.txt')).toThrow()
  })
})

describe('importing a ZIP', () => {
  /** Build one stored (uncompressed) ZIP archive. */
  function zip(entries: { path: string; bytes: Uint8Array }[]): Uint8Array {
    const locals: Uint8Array[] = []
    const centrals: Uint8Array[] = []
    let offset = 0
    for (const entry of entries) {
      const name = text(entry.path)
      const local = new Uint8Array(30 + name.length + entry.bytes.length)
      const view = new DataView(local.buffer)
      view.setUint32(0, 0x04034b50, true)
      view.setUint16(4, 20, true)
      view.setUint16(8, 0, true)
      view.setUint32(18, entry.bytes.length, true)
      view.setUint32(22, entry.bytes.length, true)
      view.setUint16(26, name.length, true)
      local.set(name, 30)
      local.set(entry.bytes, 30 + name.length)
      locals.push(local)
      const central = new Uint8Array(46 + name.length)
      const centralView = new DataView(central.buffer)
      centralView.setUint32(0, 0x02014b50, true)
      centralView.setUint16(4, 20, true)
      centralView.setUint16(6, 20, true)
      centralView.setUint16(8, 0, true)
      centralView.setUint16(10, 0, true)
      centralView.setUint32(20, entry.bytes.length, true)
      centralView.setUint32(24, entry.bytes.length, true)
      centralView.setUint16(28, name.length, true)
      centralView.setUint32(42, offset, true)
      central.set(name, 46)
      centrals.push(central)
      offset += local.length
    }
    const centralSize = centrals.reduce((sum, entry) => sum + entry.length, 0)
    const end = new Uint8Array(22)
    const endView = new DataView(end.buffer)
    endView.setUint32(0, 0x06054b50, true)
    endView.setUint16(8, entries.length, true)
    endView.setUint16(10, entries.length, true)
    endView.setUint32(12, centralSize, true)
    endView.setUint32(16, offset, true)
    const total = [...locals, ...centrals, end]
    const out = new Uint8Array(total.reduce((sum, part) => sum + part.length, 0))
    let at = 0
    for (const part of total) { out.set(part, at); at += part.length }
    return out
  }

  it('reads a valid archive into the same package a folder import produces', () => {
    const archive = zip(RICH.map(file => ({ path: file.path, bytes: file.bytes })))
    const fromZip = importZipSkill(archive)
    const fromFolder = buildSkillPackage(RICH)
    expect(fromZip.ok).toBe(true)
    if (!fromZip.ok || !fromFolder.ok) return
    expect(fromZip.skill.files.map(file => file.path)).toEqual(fromFolder.skill.files.map(file => file.path))
  })

  it('refuses an archive whose entry escapes the folder', () => {
    const archive = zip([...RICH, { path: '../evil.sh', bytes: text('rm -rf /') }])
    expect(importZipSkill(archive)).toMatchObject({ ok: false })
  })

  it('refuses an encrypted archive before inflating anything', () => {
    const archive = zip(RICH)
    // Set the encryption bit in the central directory entry's flags.
    const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength)
    for (let at = 0; at < archive.length - 4; at += 1) {
      if (view.getUint32(at, true) === 0x02014b50) { view.setUint16(at + 8, 0x1, true); break }
    }
    expect(importZipSkill(archive)).toMatchObject({ ok: false, reason: 'encrypted-zip' })
  })

  it('refuses a bomb on its declared size', () => {
    const archive = zip([...RICH, { path: 'big.bin', bytes: new Uint8Array(64) }])
    // Lie about one entry's uncompressed size.
    const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength)
    for (let at = 0; at < archive.length - 4; at += 1) {
      if (view.getUint32(at, true) === 0x02014b50) { view.setUint32(at + 24, 0xffffffff, true); break }
    }
    const result = readZip(archive)
    expect(result.ok).toBe(false)
  })

  it('refuses a stored entry whose declared size hides a reused data block', () => {
    const archive = zip([{ path: 'SKILL.md', bytes: text('---\nname: test-skill\ndescription: x\n---\nBody\n') }])
    const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength)
    for (let at = 0; at < archive.length - 4; at += 1) {
      if (view.getUint32(at, true) !== 0x02014b50) continue
      // The declared decoded size says "nothing", while the stored block is the
      // real payload; only the bounds/size agreement check can refuse it.
      view.setUint32(at + 24, 0, true)
      break
    }
    expect(readZip(archive).ok).toBe(false)
  })

  it('refuses a stored entry whose data range leaves the archive', () => {
    const archive = zip([{ path: 'SKILL.md', bytes: text('---\nname: test-skill\ndescription: x\n---\n') }])
    const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength)
    for (let at = 0; at < archive.length - 4; at += 1) {
      if (view.getUint32(at, true) !== 0x02014b50) continue
      view.setUint32(at + 20, 0x7fffffff, true)
      view.setUint32(at + 24, 0x7fffffff, true)
      break
    }
    expect(readZip(archive).ok).toBe(false)
  })
})

describe('the private store', () => {
  it('stores complete folders and verifies their digests', async () => {
    const root = await base()
    const store = new TeamSkillStore(root)
    await store.open()
    const asset = await install(store, RICH, 'custom:one')
    expect(asset.files).toHaveLength(RICH.length)
    expect(asset.digest).toBe(folderDigest(asset.files))
    expect(await store.verify('custom:one')).toBe(true)
    // The bytes really are on disk, under the path the registry records.
    const body = await readFile(join(store.assetPath(asset.id, asset.version), 'scripts/render.py'), 'utf8')
    expect(body).toBe('print("render")\n')
  })

  it('keeps the previous version readable after an edit', async () => {
    const root = await base()
    const store = new TeamSkillStore(root)
    await store.open()
    const before = await install(store, MINIMAL, 'custom:one')
    const after = await store.writeFile('custom:one', 'SKILL.md', '---\nname: frontend-design\ndescription: changed\n---\n\nNew body\n')
    expect(after.version).not.toBe(before.version)
    // The pinned old version still answers with the old bytes.
    expect(await store.readText('custom:one', 'SKILL.md')).toContain('changed')
    const pinned = await readFile(join(store.assetPath(before.id, before.version), 'SKILL.md'), 'utf8')
    expect(pinned).toContain('designs front ends')
  })

  it('materializes the shipped skills idempotently and flags an outdated override', async () => {
    const root = await base()
    const source = await base()
    await writeFile(join(source, 'SKILL.md'), '---\nname: git-release-hygiene\ndescription: release hygiene\n---\n\nBody\n')
    const store = new TeamSkillStore(root)
    await store.open()
    const first = await store.ensureOfficial([{ skillId: 'git-release-hygiene', directory: source, version: '1' }])
    expect(first).toContain('builtin:git-release-hygiene')
    const second = await store.ensureOfficial([{ skillId: 'git-release-hygiene', directory: source, version: '1' }])
    expect(second).toEqual([])
    const override = await store.createOverride('git-release-hygiene', 'override:one')
    expect(override).toMatchObject({ origin: 'override', baseVersion: '1', officialSkillId: 'git-release-hygiene' })
    // A new shipped version flags the override instead of merging into it.
    const third = await store.ensureOfficial([{ skillId: 'git-release-hygiene', directory: source, version: '2' }])
    expect(third).toContain('override:one')
    expect(store.get('override:one')?.updateAvailable).toBe(true)
    // The override's own bytes were not replaced by the shipped copy.
    expect(store.get('override:one')?.baseVersion).toBe('1')
  })

  it('refuses to delete or edit a shipped read-only skill', async () => {
    const root = await base()
    const source = await base()
    await writeFile(join(source, 'SKILL.md'), '---\nname: git-release-hygiene\ndescription: release hygiene\n---\n\nBody\n')
    const store = new TeamSkillStore(root)
    await store.open()
    await store.ensureOfficial([{ skillId: 'git-release-hygiene', directory: source, version: '1' }])
    await expect(store.remove('builtin:git-release-hygiene')).rejects.toThrow(/read-only/u)
    await expect(store.writeFile('builtin:git-release-hygiene', 'SKILL.md', 'x')).rejects.toThrow(/read-only/u)
  })
})

describe('bindings and delete guards', () => {
  /** One Team whose second member is the role a case binds. */
  function guardedTeam(): TeamPreset {
    return team([slot({ id: 'role-reviewer', name: 'reviewer' })], {})
  }

  it('assigns by team and role, and the captain under its own slot', async () => {
    const root = await base()
    const store = new TeamSkillStore(root)
    await store.open()
    const asset = await install(store, MINIMAL, 'custom:one')
    const manager = new TeamSkillManager(store, root, {
      teams: () => [guardedTeam()], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    expect(await manager.assign({ teamId: 'team-1', roleId: 'role-reviewer', assetId: asset.id })).toMatchObject({ ok: true })
    expect(manager.assetsFor('team-1', 'role-reviewer').map(row => row.id)).toEqual([asset.id])
    // The captain slot is independent of every member slot.
    expect(manager.assetsFor('team-1', CAPTAIN_ROLE)).toEqual([])
    await manager.assign({ teamId: 'team-1', roleId: CAPTAIN_ROLE, assetId: asset.id, captain: true })
    expect(manager.bindingSummaries(asset.id).map(row => `${row.roleName}:${String(row.captain)}`))
      .toEqual(expect.arrayContaining([`${CAPTAIN_ROLE}:true`]))
  })

  it('refuses to delete a bound asset and lists every role that holds it', async () => {
    const root = await base()
    const store = new TeamSkillStore(root)
    await store.open()
    const asset = await install(store, MINIMAL, 'custom:one')
    const manager = new TeamSkillManager(store, root, {
      teams: () => [guardedTeam()], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    await manager.assign({ teamId: 'team-1', roleId: 'role-reviewer', assetId: asset.id })
    const refused = await manager.remove(asset.id)
    expect(refused.ok).toBe(false)
    expect(refused.blockers[0]).toMatchObject({ kind: 'binding' })
    if (refused.blockers[0]?.kind !== 'binding') return
    expect(refused.blockers[0].bindings[0]).toMatchObject({ teamId: 'team-1', roleName: 'reviewer', captain: false })
    await manager.unassign('team-1', 'role-reviewer')
    expect((await manager.remove(asset.id)).ok).toBe(true)
    expect(store.get(asset.id)).toBeUndefined()
  })

  it('refuses to delete an asset a live member is reading', async () => {
    const root = await base()
    const store = new TeamSkillStore(root)
    await store.open()
    const asset = await install(store, MINIMAL, 'custom:one')
    const manager = new TeamSkillManager(store, root, {
      teams: () => [], activeAssetIds: () => new Set([asset.id]), activeSessions: () => ['session-7'],
    })
    await manager.open()
    const refused = await manager.remove(asset.id)
    expect(refused.blockers).toContainEqual({ kind: 'active', sessions: ['session-7'] })
    expect(store.get(asset.id)).toBeDefined()
  })

  it('refuses to delete an asset another asset explicitly depends on', async () => {
    const root = await base()
    const store = new TeamSkillStore(root)
    await store.open()
    const base_ = await install(store, MINIMAL, 'custom:base', 'base-skill')
    const package_ = buildSkillPackage([{ path: 'SKILL.md', bytes: text('---\nname: dependent\ndescription: d\n---\n') }])
    if (!package_.ok) throw new Error('fixture')
    await store.install(package_.skill, {
      id: 'custom:dependent', origin: 'custom', version: '1',
      dependencies: { mcpServers: [], executables: [], otherSkills: [base_.id] },
    })
    const manager = new TeamSkillManager(store, root, {
      teams: () => [], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    const refused = await manager.remove(base_.id)
    expect(refused.blockers).toContainEqual({ kind: 'dependency', dependents: ['custom:dependent'] })
  })

  it('warns about a text mention without blocking the delete', async () => {
    const root = await base()
    const store = new TeamSkillStore(root)
    await store.open()
    const target = await install(store, MINIMAL, 'custom:target', 'target-skill')
    const package_ = buildSkillPackage([{ path: 'SKILL.md', bytes: text('---\nname: mentioner\ndescription: d\n---\n\nSee target-skill for details.\n') }])
    if (!package_.ok) throw new Error('fixture')
    await store.install(package_.skill, { id: 'custom:mentioner', origin: 'custom', version: '1' })
    const manager = new TeamSkillManager(store, root, {
      teams: () => [], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    const outcome = await manager.remove(target.id)
    expect(outcome.ok).toBe(true)
    expect(outcome.warnings.join(' ')).toContain('custom:mentioner')
  })

  it('never deletes a shipped skill, and a successful delete leaves no binding behind', async () => {
    const root = await base()
    const source = await base()
    await writeFile(join(source, 'SKILL.md'), '---\nname: git-release-hygiene\ndescription: release hygiene\n---\n\nBody\n')
    const store = new TeamSkillStore(root)
    await store.open()
    await store.ensureOfficial([{ skillId: 'git-release-hygiene', directory: source, version: '1' }])
    const manager = new TeamSkillManager(store, root, {
      teams: () => [], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    expect((await manager.remove('builtin:git-release-hygiene')).blockers).toContainEqual({ kind: 'official' })
  })
})

describe('per-Agent visibility', () => {
  /** A real skill registry mounted on one context. */
  async function registry(): Promise<{ ctx: Context; skills: SkillRegistry }> {
    const ctx = new Context()
    contexts.push(ctx)
    await ctx.plugin(SkillRegistry)
    return { ctx, skills: ctx.skills }
  }

  /** Two distinct Agents stand in for two members: the scope key is any object. */
  const agentA = { id: 'agent-a' }
  const agentB = { id: 'agent-b' }

  /** A store holding one bound asset. */
  async function stored(root: string) {
    const store = new TeamSkillStore(root)
    await store.open()
    const asset = await install(store, RICH, 'custom:frontend', 'frontend-design')
    return { store, asset }
  }

  it('advertises a Team Skill only to the Agent it was registered for', async () => {
    const root = await base()
    const { ctx, skills } = await registry()
    const { store, asset } = await stored(root)
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    await runtime.sync({ agent: agentA as never, assets: [asset] })

    const seenByA = await skills.list({ scope: agentA as object })
    const seenByB = await skills.list({ scope: agentB as object })
    const global = await skills.list()
    expect(seenByA.map(skill => skill.name)).toContain('frontend-design')
    expect(seenByB.map(skill => skill.name)).not.toContain('frontend-design')
    expect(global.map(skill => skill.name)).not.toContain('frontend-design')
    // Loading the body is scoped exactly like discovery.
    expect(await skills.get('frontend-design', { scope: agentB as object })).toBeUndefined()
    const body = await skills.get('frontend-design', { scope: agentA as object })
    expect(body?.content).toContain('Use this method.')
    // The body is the instruction text, not the frontmatter block.
    expect(body?.content).not.toContain('description:')
    expect(stripFrontmatter('---\nname: x\ndescription: y\n---\n\nBody\n')).toBe('Body')
    await runtime.dispose()
  })

  it('publishes the version-pinned resource directory the body was read from', async () => {
    const root = await base()
    const { ctx, skills } = await registry()
    const { store, asset } = await stored(root)
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    await runtime.sync({ agent: agentA as never, assets: [asset] })
    const summary = (await skills.list({ scope: agentA as object })).find(skill => skill.name === 'frontend-design')
    expect(summary?.resourceBase).toEqual({ kind: 'directory', path: store.assetPath(asset.id, asset.version) })
    await runtime.dispose()
  })

  it.each([false, true])('loads the exact same-name candidate selected by the registry (override first: %s)', async (overrideFirst) => {
    const root = await base()
    const source = await base()
    await writeFile(join(source, 'SKILL.md'), '---\nname: frontend-design\ndescription: official method\n---\n\nOfficial body.\n')
    const store = new TeamSkillStore(root)
    await store.open()
    await store.ensureOfficial([{ skillId: 'frontend-design', directory: source, version: 'official-1' }])
    const official = store.get('builtin:frontend-design')!
    const initialOverride = await store.createOverride('frontend-design', 'override:frontend-design')
    const override = await store.writeFile(initialOverride.id, 'SKILL.md', '---\nname: frontend-design\ndescription: overridden method\n---\n\nOverride body.\n')
    const { ctx, skills } = await registry()
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    try {
      await runtime.sync({ agent: agentA as never, assets: overrideFirst ? [override, official] : [official, override] })
      const summaries = await skills.list({ scope: agentA as object })
      expect(summaries).toHaveLength(1)
      const summary = summaries[0]!
      const chosen = summary.description === official.description ? official : override
      const expectedBody = chosen === official ? 'Official body.' : 'Override body.'
      const expectedBase = { kind: 'directory', path: store.assetPath(chosen.id, chosen.version) }
      expect(summary.resourceBase).toEqual(expectedBase)
      const loaded = await skills.get('frontend-design', { scope: agentA as object })
      expect(loaded?.description).toBe(summary.description)
      expect(loaded?.content).toBe(expectedBody)
      expect(loaded?.resourceBase).toEqual(expectedBase)
      expect(await readFile(join(expectedBase.path, 'SKILL.md'), 'utf8')).toContain(expectedBody)
    } finally {
      await runtime.dispose()
    }
  })

  it('keeps the registered body and resources pinned through edits and resync, until unassigned', async () => {
    const root = await base()
    const { ctx, skills } = await registry()
    const { store, asset } = await stored(root)
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    await runtime.sync({ agent: agentA as never, assets: [asset] })
    await store.writeFile(asset.id, 'SKILL.md', '---\nname: frontend-design\ndescription: updated\n---\n\nNew method.\n')
    expect((await skills.get('frontend-design', { scope: agentA as object }))?.content).toContain('Use this method.')
    await runtime.sync({ agent: agentA as never, assets: [store.get(asset.id)!] })
    expect((await skills.get('frontend-design', { scope: agentA as object }))?.content).toContain('Use this method.')
    const summary = (await skills.list({ scope: agentA as object }))[0]
    expect(summary?.resourceBase).toEqual({ kind: 'directory', path: store.assetPath(asset.id, asset.version) })
    await runtime.sync({ agent: agentA as never, assets: [] })
    expect(await skills.get('frontend-design', { scope: agentA as object })).toBeUndefined()
    await runtime.sync({ agent: agentA as never, assets: [store.get(asset.id)!] })
    expect((await skills.get('frontend-design', { scope: agentA as object }))?.content).toContain('New method.')
    await runtime.dispose()
  })

  it('releases discovery when the Agent is disposed or unassigned', async () => {
    const root = await base()
    const { ctx, skills } = await registry()
    const { store, asset } = await stored(root)
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    await runtime.sync({ agent: agentA as never, assets: [asset] })
    expect((await skills.list({ scope: agentA as object })).map(skill => skill.name)).toContain('frontend-design')
    await runtime.sync({ agent: agentA as never, assets: [] })
    expect((await skills.list({ scope: agentA as object })).map(skill => skill.name)).not.toContain('frontend-design')
    // Re-assigning works after the release: the lifecycle is idempotent.
    await runtime.sync({ agent: agentA as never, assets: [asset] })
    expect((await skills.list({ scope: agentA as object })).map(skill => skill.name)).toContain('frontend-design')
    runtime.release(agentA as never)
    expect((await skills.list({ scope: agentA as object })).map(skill => skill.name)).not.toContain('frontend-design')
    await runtime.dispose()
  })

  it('reports the live assets a delete must protect', async () => {
    const root = await base()
    const { ctx } = await registry()
    const { store, asset } = await stored(root)
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    expect(runtime.activeAssetIds().size).toBe(0)
    await runtime.sync({ agent: agentA as never, assets: [asset] })
    expect([...runtime.activeAssetIds()]).toEqual([asset.id])
    await runtime.dispose()
    expect(runtime.activeAssetIds().size).toBe(0)
  })

  it('degrades to unavailable when the deployment composes no skill service', async () => {
    const root = await base()
    const ctx = new Context()
    contexts.push(ctx)
    const { store, asset } = await stored(root)
    const notes: string[] = []
    const runtime = new TeamSkillRuntime(ctx, store, message => notes.push(message))
    expect(runtime.available).toBe(false)
    // The call reports the state instead of waiting for a service this
    // deployment does not compose: a creation edge can refuse, and nothing here
    // blocks on a promise that may never settle.
    const result = await runtime.sync({ agent: agentA as never, assets: [asset] })
    expect(result.status).toBe('deferred')
    expect(result.reason).toContain('composes no skill service')
    expect(notes.join(' ')).toContain('composes no skill service')
    expect(runtime.assetsOf(agentA as never)).toHaveLength(1)
    await runtime.dispose()
  })

  it('registers the armed assignment when the real SkillRegistry is composed later', async () => {
    const root = await base()
    const ctx = new Context()
    contexts.push(ctx)
    const { store, asset } = await stored(root)
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    try {
      expect((await runtime.sync({ agent: agentA as never, assets: [asset] })).status).toBe('deferred')
      // An identical sync while the intent is armed must report the same state
      // and must not fabricate success.
      expect((await runtime.sync({ agent: agentA as never, assets: [asset] })).status).toBe('deferred')
      expect(runtime.available).toBe(false)
      const settled = runtime.whenSettled(agentA as never)
      await ctx.plugin(SkillRegistry)
      expect((await settled).status).toBe('installed')
      expect(runtime.available).toBe(true)
      expect((await ctx.skills.get('frontend-design', { scope: agentA }))?.content).toBe('Use this method.')
      expect(await ctx.skills.get('frontend-design', { scope: agentB })).toBeUndefined()
      expect(await ctx.skills.get('frontend-design')).toBeUndefined()
    } finally {
      await runtime.dispose()
    }
  })

  it('retries the same assignment after registerProvider fails once', async () => {
    const root = await base()
    const { ctx, skills } = await registry()
    const { store, asset } = await stored(root)
    const notes: string[] = []
    const runtime = new TeamSkillRuntime(ctx, store, message => notes.push(message))
    const register = vi.spyOn(SkillRegistry.prototype, 'registerProvider')
      .mockImplementationOnce(() => { throw new Error('registration unavailable once') })
    try {
      await runtime.sync({ agent: agentA as never, assets: [asset] })
      expect(notes.join(' ')).toContain('registration unavailable once')
      expect(await skills.get('frontend-design', { scope: agentA })).toBeUndefined()
      // No release, assignment change or new asset object should be necessary.
      await runtime.sync({ agent: agentA as never, assets: [asset] })
      expect(register).toHaveBeenCalledTimes(2)
      expect((await skills.get('frontend-design', { scope: agentA }))?.content).toBe('Use this method.')
      expect(await skills.get('frontend-design', { scope: agentB })).toBeUndefined()
      expect(await skills.get('frontend-design')).toBeUndefined()
    } finally {
      register.mockRestore()
      await runtime.dispose()
    }
  })

  it('registers nothing globally at construction time', async () => {
    const root = await base()
    const { ctx, skills } = await registry()
    const { store } = await stored(root)
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    // No sync call: the registry must hold no provider from this plugin yet.
    expect((await skills.list()).map(skill => skill.name)).not.toContain('frontend-design')
    expect((await skills.list({ scope: agentA as object })).map(skill => skill.name)).not.toContain('frontend-design')
    await runtime.dispose()
  })
})

describe('root resolution and role identity', () => {
  it('honours an explicit root and otherwise derives a plugin-owned directory', () => {
    expect(resolveSkillRoot('/srv/team-skills')).toBe('/srv/team-skills')
    expect(resolveSkillRoot('  ')).toMatch(/agent-team-presets[\\/]team-skills$/u)
    expect(resolveSkillRoot(undefined)).toMatch(/agent-team-presets[\\/]team-skills$/u)
  })

  it('resolves a member target to the shipped role identity', () => {
    const definition = builtinTeamDefinition(BUILTIN_TEAMS.find(entry => entry.id === 'builtin-workflow')!)
    const specialist = definition.members.find(member => member.name === 'repository-specialist')!
    expect(roleOfMember(definition, 'repository-specialist')).toBe(specialist.id)
    expect(roleOfMember(definition, 'no-such-role')).toBeUndefined()
  })
})

describe('delete refusals name their holders', () => {
  it('reports the Agent identities a live assignment is serving', async () => {
    const root = await mkdtemp(join(tmpdir(), 'team-skills-holders-'))
    roots.push(root)
    const store = new TeamSkillStore(root)
    await store.open()
    const asset = await install(store, MINIMAL, 'custom:held', 'frontend-design')
    const ctx = new Context()
    contexts.push(ctx)
    await ctx.plugin(SkillRegistry)
    const runtime = new TeamSkillRuntime(ctx, store, () => {})
    await runtime.sync({ agent: { id: 'agent-7' } as never, assets: [asset] })
    // The refusal must name the holder rather than a generic phrase.
    expect(runtime.activeLabels(asset.id)).toEqual(['agent-7'])
    await runtime.dispose()
    expect(runtime.activeLabels(asset.id)).toEqual([])
  })
})
