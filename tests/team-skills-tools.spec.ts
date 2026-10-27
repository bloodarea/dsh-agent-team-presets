/**
 * The Agent-facing Team Skill tools: the same manager rules, reached from the
 * captain instead of the page.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { buildSkillPackage } from '../src/team-skills/import.ts'
import { TeamSkillManager } from '../src/team-skills/manager.ts'
import { TeamSkillStore } from '../src/team-skills/store.ts'

const roots: string[] = []
const contexts: Context[] = []
afterEach(async () => {
  for (const ctx of contexts.splice(0)) await ctx.fiber.dispose()
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true })
})

const TEXT = (value: string): Uint8Array => new TextEncoder().encode(value)

/**
 * Build a manager over one stored custom skill.
 * @param root - scratch directory.
 * @returns the manager and the asset identity.
 */
async function fixture(root: string): Promise<{ manager: TeamSkillManager; assetId: string }> {
  const store = new TeamSkillStore(root)
  await store.open()
  const built = buildSkillPackage([{ path: 'SKILL.md', bytes: TEXT('---\nname: demo-skill\ndescription: d\n---\n\nBody\n') }])
  if (!built.ok) throw new Error('fixture')
  const asset = await store.install(built.skill, { id: 'custom:demo-skill', origin: 'custom', version: '1' })
  const manager = new TeamSkillManager(store, root, {
    teams: () => [{ id: 'team-1', name: 'T', captain: { name: 'lead' }, members: [{ name: 'dev' }] } as never],
    activeAssetIds: () => new Set(),
    activeSessions: () => [],
  })
  await manager.open()
  return { manager, assetId: asset.id }
}

describe('the Team Skill tools', () => {
  it('binds and unbinds one role through the same rules the page uses', async () => {
    const root = await mkdtemp(join(tmpdir(), 'team-skill-tools-'))
    roots.push(root)
    const { manager, assetId } = await fixture(root)
    const assigned = await manager.assign({ teamId: 'team-1', roleId: 'dev', assetId })
    expect(assigned).toMatchObject({ ok: true })
    expect(manager.assetsFor('team-1', 'dev').map(asset => asset.id)).toEqual([assetId])
    expect(manager.bindingSummaries(assetId)).toHaveLength(1)
    expect(await manager.unassign('team-1', 'dev', assetId)).toBe(true)
    expect(manager.assetsFor('team-1', 'dev')).toEqual([])
  })

  it('refuses to delete while a role holds the skill, and names the holder', async () => {
    const root = await mkdtemp(join(tmpdir(), 'team-skill-tools-'))
    roots.push(root)
    const { manager, assetId } = await fixture(root)
    await manager.assign({ teamId: 'team-1', roleId: 'dev', assetId })
    const outcome = await manager.remove(assetId)
    expect(outcome.ok).toBe(false)
    const binding = outcome.blockers.find(blocker => blocker.kind === 'binding')
    expect(binding).toMatchObject({ kind: 'binding' })
    if (binding?.kind !== 'binding') return
    expect(binding.bindings[0]).toMatchObject({ teamId: 'team-1', roleName: 'dev' })
    await manager.unassign('team-1', 'dev', assetId)
    expect((await manager.remove(assetId)).ok).toBe(true)
  })
})

describe('dependency reporting', () => {
  it('resolves declared executables against PATH with platform extension rules and keeps MCP as declared only', async () => {
    const root = await mkdtemp(join(tmpdir(), 'team-skill-deps-'))
    roots.push(root)
    const bin = join(root, 'bin')
    await mkdir(bin)
    // A real runnable file whose name a bare command would not match verbatim
    // on Windows (lookup appends PATHEXT), plus a directory that only *looks*
    // executable: existence alone must never count as found.
    const toolName = process.platform === 'win32' ? 'probe-tool.CMD' : 'probe-tool'
    const trapName = process.platform === 'win32' ? 'trap-tool.EXE' : 'trap-tool'
    const toolPath = join(bin, toolName)
    await writeFile(toolPath, process.platform === 'win32' ? '@echo off\r\n' : '#!/bin/sh\nexit 0\n', { mode: 0o755 })
    await chmod(toolPath, 0o755)
    await mkdir(join(bin, trapName))
    await writeFile(join(bin, 'not-executable'), 'not executable', { mode: 0o644 })
    await chmod(join(bin, 'not-executable'), 0o644)
    const store = new TeamSkillStore(root)
    await store.open()
    const built = buildSkillPackage([{ path: 'SKILL.md', bytes: TEXT('---\nname: dep-skill\ndescription: d\n---\n') }])
    if (!built.ok) throw new Error('fixture')
    await store.install(built.skill, {
      id: 'custom:dep-skill', origin: 'custom', version: '1',
      dependencies: {
        mcpServers: [{ serverName: 'browser-mcp', required: true }],
        executables: ['probe-tool', ...(process.platform === 'win32' ? [toolName] : []), 'trap-tool', 'not-executable', 'definitely-not-a-real-binary-xyz'],
        otherSkills: [],
      },
    })
    const manager = new TeamSkillManager(store, root, {
      teams: () => [], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    // Isolate PATH (and PATHEXT on Windows) to the fixture: the assertion must
    // not depend on what this machine happens to have installed.
    const previousPath = process.env['PATH']
    const previousPathext = process.env['PATHEXT']
    process.env['PATH'] = bin
    if (process.platform === 'win32') process.env['PATHEXT'] = '.COM;.EXE;.BAT;.CMD'
    try {
      const report = await manager.dependencyReport('custom:dep-skill')
      expect(report.mcpServers).toEqual(['browser-mcp'])
      expect(report.executables).toEqual([
        { name: 'probe-tool', found: true },
        ...(process.platform === 'win32' ? [{ name: toolName, found: true }] : []),
        { name: 'trap-tool', found: false },
        { name: 'not-executable', found: false },
        { name: 'definitely-not-a-real-binary-xyz', found: false },
      ])
      expect(report.unverified).toEqual(['browser-mcp'])
    } finally {
      if (previousPath === undefined) delete process.env['PATH']; else process.env['PATH'] = previousPath
      if (previousPathext === undefined) delete process.env['PATHEXT']; else process.env['PATHEXT'] = previousPathext
    }
  })
})

describe('assignment blockers', () => {
  it('refuses a skill whose declared executable is absent and keeps optional gaps as hints', async () => {
    const root = await mkdtemp(join(tmpdir(), 'team-skill-blockers-'))
    roots.push(root)
    const store = new TeamSkillStore(root)
    await store.open()
    const built = buildSkillPackage([{ path: 'SKILL.md', bytes: TEXT('---\nname: blocked-skill\ndescription: d\n---\n') }])
    if (!built.ok) throw new Error('fixture')
    await store.install(built.skill, {
      id: 'custom:blocked-skill', origin: 'custom', version: '1',
      dependencies: {
        mcpServers: [
          { serverName: 'required-mcp', required: true },
          { serverName: 'optional-mcp', required: false },
        ],
        executables: ['definitely-not-a-real-binary-xyz'],
        otherSkills: [],
      },
    })
    const manager = new TeamSkillManager(store, root, {
      teams: () => [], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    const blockers = await manager.assignmentBlockers('custom:blocked-skill')
    expect(blockers.blocking).toEqual(['the executable "definitely-not-a-real-binary-xyz" is not on PATH'])
    // A required MCP server is reported, never silently treated as missing.
    expect(blockers.unverified).toEqual(['required-mcp'])
    const refused = await manager.assign({ teamId: 't', roleId: 'dev', assetId: 'custom:blocked-skill' })
    expect(refused.ok).toBe(false)
    if (refused.ok) return
    expect(refused.reason).toContain('dependency-missing')
    expect(manager.assetsFor('t', 'dev')).toEqual([])
  })
})

describe('name clashes between origins', () => {
  it('reports both assets and never merges them', async () => {
    const root = await mkdtemp(join(tmpdir(), 'team-skill-clash-'))
    roots.push(root)
    const store = new TeamSkillStore(root)
    await store.open()
    const md = (name: string): { path: string; bytes: Uint8Array }[] => [
      { path: 'SKILL.md', bytes: TEXT(`---\nname: ${name}\ndescription: d\n---\n`) },
    ]
    const builtin = buildSkillPackage(md('git-release-hygiene'))
    const custom = buildSkillPackage(md('git-release-hygiene'))
    if (!builtin.ok || !custom.ok) throw new Error('fixture')
    await store.install(builtin.skill, { id: 'builtin:git-release-hygiene', origin: 'builtin', version: '1' })
    await store.install(custom.skill, { id: 'custom:git-release-hygiene', origin: 'custom', version: '1' })
    const sameName = store.list().filter(asset => asset.skillId === 'git-release-hygiene')
    expect(sameName.map(asset => asset.id).sort()).toEqual(['builtin:git-release-hygiene', 'custom:git-release-hygiene'])
    // Deleting the user copy leaves the shipped one intact: no silent overwrite
    // in either direction.
    const manager = new TeamSkillManager(store, root, {
      teams: () => [], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    expect((await manager.remove('custom:git-release-hygiene')).ok).toBe(true)
    expect(store.get('builtin:git-release-hygiene')).toBeDefined()
  })
})
