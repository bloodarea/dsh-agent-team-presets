/**
 * The card-patch pipeline's pure and file-system stages.
 *
 * These specs cover the decisions a rebuild makes before it is allowed to ship
 * anything: whether a catalog entry is usable, whether the source patch landed,
 * whether the built bundle carries the service, and whether publishing keeps the
 * older versions that people are still running. Cloning and building upstream is
 * exercised by the CLI itself (it needs network and a full toolchain); what runs
 * here is everything that decides yes or no.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync, gunzipSync } from 'node:zlib'
import {
  mergeCatalogTargets, parseCatalogDocument, renderCatalogDocument, targetEntryProblems,
} from '../tools/card-patches/catalog.mjs'
import { bundleProblems, missingSourceMarkers } from '../tools/card-patches/verify.mjs'
import {
  CardPatchError, installShippedCardPatch, publishCardPatch, rebuildCardPatch,
  revertShippedCardPatch, verifyShippedCardPatches,
} from '../tools/card-patches/pipeline.mjs'
import { applySourcePatch } from '../tools/card-patches/patch.mjs'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function scratch(): string {
  const root = mkdtempSync(join(tmpdir(), 'card-pipeline-'))
  roots.push(root)
  return root
}

const sha = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

/** One usable catalog entry, overridable per case. */
function entry(overrides: Record<string, string> = {}): Record<string, string> {
  const pristine = 'a'.repeat(64)
  const patched = 'b'.repeat(64)
  return {
    id: 'dsh-context',
    packageName: 'dsh-context',
    version: '0.84.0',
    source: 'example/context@abc123',
    asset: 'dsh-context-0.84.0.client.js.gz',
    service: 'contextAgentCardBadges',
    pristineSha256: pristine,
    patchedSha256: patched,
    ...overrides,
  }
}

describe('catalog validation', () => {
  it('accepts one complete entry', () => {
    expect(targetEntryProblems(entry())).toEqual([])
  })

  it('refuses an asset that is a path, a truncated hash, or a no-op replacement', () => {
    expect(targetEntryProblems(entry({ asset: '../escape.client.js.gz' }))).not.toEqual([])
    expect(targetEntryProblems(entry({ patchedSha256: 'abc' }))).not.toEqual([])
    expect(targetEntryProblems(entry({ patchedSha256: 'a'.repeat(64) }))).toContain(
      'pristineSha256 and patchedSha256 must differ, or the replacement would be the published build',
    )
  })

  it('refuses unknown fields so a typo cannot silently do nothing', () => {
    expect(targetEntryProblems({ ...entry(), pristineSha: 'a'.repeat(64) }).join(' ')).toContain('unknown fields')
  })

  it('round-trips a document deterministically and sorts by identity', () => {
    const text = renderCatalogDocument([
      entry({ id: 'dsh-better-sidebar', packageName: 'dsh-better-sidebar', asset: 'dsh-better-sidebar-0.32.0.client.js.gz', service: 'betterSidebarAgentCardBadges' }),
      entry(),
    ])
    expect(text).toBe(renderCatalogDocument([entry(), entry({ id: 'dsh-better-sidebar', packageName: 'dsh-better-sidebar', asset: 'dsh-better-sidebar-0.32.0.client.js.gz', service: 'betterSidebarAgentCardBadges' })]))
    expect(parseCatalogDocument(text).map(row => row.id)).toEqual(['dsh-better-sidebar', 'dsh-context'])
  })

  it('refuses a document written for another catalog version', () => {
    expect(() => parseCatalogDocument(JSON.stringify({ version: 99, targets: [] }))).toThrow(/version is 99/)
  })
})

describe('catalog merging keeps every supported version', () => {
  it('adds a newer version without dropping the one already shipped', () => {
    const merged = mergeCatalogTargets([entry()], [entry({ version: '0.84.1', asset: 'dsh-context-0.84.1.client.js.gz' })])
    expect(merged.map(row => row.version)).toEqual(['0.84.0', '0.84.1'])
  })

  it('replaces only the exact identity-and-version pair that was rebuilt', () => {
    const rebuilt = entry({ patchedSha256: 'c'.repeat(64) })
    const merged = mergeCatalogTargets([entry()], [rebuilt])
    expect(merged).toHaveLength(1)
    expect(merged[0].patchedSha256).toBe('c'.repeat(64))
  })

  it('appends a target the compiled baseline never mentioned', () => {
    const merged = mergeCatalogTargets([entry()], [entry({ id: 'another-plugin', packageName: 'another-plugin', asset: 'another-plugin-1.0.0.client.js.gz' })])
    expect(merged.map(row => row.id)).toEqual(['dsh-context', 'another-plugin'])
  })
})

describe('source markers', () => {
  it('names every file and needle the patch was supposed to introduce', () => {
    const files = new Map([['src/client/index.ts', 'ctx.provide("x")']])
    const problems = missingSourceMarkers(files, [
      { path: 'src/client/index.ts', text: ['ctx.provide("x")', 'createAgentCardBadges'] },
      { path: 'src/client/agent-card-badges.tsx', text: ['createAgentCardBadges'] },
    ])
    expect(problems).toEqual([
      'src/client/index.ts does not contain "createAgentCardBadges"',
      'the patch did not create src/client/agent-card-badges.tsx',
    ])
  })
})

describe('bundle verification', () => {
  const bundle = (body: string): string => `window.__ModuleLoader__.load({id:'x',factory:()=>{${body}}});${'/* padding */'.repeat(25000)}`

  it('accepts a bundle that registers the service inside the loader wrapper', () => {
    expect(bundleProblems({ text: bundle('ctx.provide(`contextAgentCardBadges`,service)'), service: 'contextAgentCardBadges', publishedSize: 300_000 })).toEqual([])
  })

  it('refuses a bundle that never registers the service', () => {
    expect(bundleProblems({ text: bundle('ctx.provide(`other`,service)'), service: 'contextAgentCardBadges' })).toContain(
      'the built bundle never registers contextAgentCardBadges through ctx.provide',
    )
  })

  it('refuses a bundle that is not wrapped, is tiny, or drifts far from the published size', () => {
    const text = 'ctx.provide(`contextAgentCardBadges`,service)'
    expect(bundleProblems({ text, service: 'contextAgentCardBadges' }).length).toBeGreaterThan(0)
    const drift = bundleProblems({ text: bundle('ctx.provide(`contextAgentCardBadges`,s)'), service: 'contextAgentCardBadges', publishedSize: 10_000_000 })
    expect(drift.some(problem => problem.includes('outside the 0.9–1.5 band')), drift.join('; ')).toBe(true)
  })
})

describe('patch application', () => {
  /** A git repository holding one tracked file with the given lines. */
  async function repository(lines: readonly string[]): Promise<string> {
    const root = scratch()
    const { runCommand } = await import('../tools/card-patches/run.mjs')
    await runCommand('git', ['init', '--quiet'], { cwd: root })
    writeFileSync(join(root, 'works.ts'), `${lines.join('\n')}\n`)
    await runCommand('git', ['add', '.'], { cwd: root })
    await runCommand('git', ['-c', 'user.email=test@example.com', '-c', 'user.name=test', 'commit', '--quiet', '-m', 'base'], { cwd: root })
    return root
  }

  it('applies a matching patch and reports the strategy', async () => {
    const root = await repository(['one', 'two', 'three'])
    const patch = join(scratch(), 'change.patch')
    writeFileSync(patch, [
      'diff --git a/works.ts b/works.ts',
      '--- a/works.ts',
      '+++ b/works.ts',
      '@@ -1,3 +1,4 @@',
      ' one',
      ' two',
      '+inserted',
      ' three',
      '',
    ].join('\n'))
    const result = await applySourcePatch({ directory: root, patchFile: patch })
    expect(result.strategy).toBe('git')
    expect(readFileSync(join(root, 'works.ts'), 'utf8')).toContain('inserted')
  })

  it('refuses a patch whose context no longer exists and says nothing was built', async () => {
    const root = await repository(['one', 'two', 'three'])
    const patch = join(scratch(), 'change.patch')
    writeFileSync(patch, [
      'diff --git a/works.ts b/works.ts',
      '--- a/works.ts',
      '+++ b/works.ts',
      '@@ -1,3 +1,4 @@',
      ' alpha',
      ' beta',
      '+inserted',
      ' gamma',
      '',
    ].join('\n'))
    await expect(applySourcePatch({ directory: root, patchFile: patch, allowFuzz: false })).rejects.toThrow(/does not apply/)
    expect(readFileSync(join(root, 'works.ts'), 'utf8')).toBe('one\ntwo\nthree\n')
  })
})

describe('rebuild orchestration', () => {
  /** A recipe and injected stages that never touch the network. */
  function harness(options: { markers?: boolean, bundle?: string, identical?: boolean } = {}) {
    const repoRoot = scratch()
    mkdirSync(join(repoRoot, 'contrib'), { recursive: true })
    writeFileSync(join(repoRoot, 'contrib', 'change.patch'), 'diff\n')
    // Both sides are realistic sizes: a fixture whose "published" file is a few
    // bytes would only ever exercise the size-drift refusal.
    const published = Buffer.from(`window.__ModuleLoader__.load({id:'x',factory:()=>{}});${'/* published */'.repeat(4000)}`)
    const bundle = options.bundle ?? `window.__ModuleLoader__.load({id:'x',factory:()=>{ctx.provide('svc')}});${'/* pad */'.repeat(6000)}`
    const target = {
      id: 'fixture-plugin',
      packageName: 'fixture-plugin',
      repository: 'https://github.com/example/fixture-plugin.git',
      tagPrefix: 'v',
      service: 'svc',
      patch: 'contrib/change.patch',
      install: ['install', '--frozen-lockfile'],
      build: ['run', 'build'],
      artifact: 'lib/client.js',
      markers: [{ path: 'src/client/badges.ts', text: ['createBadges'] }],
    }
    const io = {
      async fetchPublishedBundle() {
        return { bytes: options.identical === true ? Buffer.from(bundle) : published, sha256: sha(options.identical === true ? Buffer.from(bundle) : published), size: published.length, url: 'memory' }
      },
      async cloneUpstream({ directory }: { directory: string }) {
        mkdirSync(join(directory, 'lib'), { recursive: true })
        mkdirSync(join(directory, 'src', 'client'), { recursive: true })
        writeFileSync(join(directory, 'package.json'), JSON.stringify({ name: 'fixture-plugin', version: '1.2.3' }))
        if (options.markers !== false) writeFileSync(join(directory, 'src', 'client', 'badges.ts'), 'export const createBadges = 1\n')
        writeFileSync(join(directory, 'lib', 'client.js'), bundle)
        return { directory, revision: 'a'.repeat(40) }
      },
      async applySourcePatch() {
        return { strategy: 'git', warnings: [] }
      },
      async run() {
        return { code: 0, stdout: '', stderr: '' }
      },
    }
    return { repoRoot, target, io }
  }

  it('produces a complete catalog entry from a verified rebuild', async () => {
    const h = harness()
    const root = scratch()
    const result = await rebuildCardPatch({ target: h.target, version: '1.2.3', repoRoot: h.repoRoot, workRoot: root, io: h.io })
    expect(result.entry).toMatchObject({
      id: 'fixture-plugin',
      version: '1.2.3',
      source: 'example/fixture-plugin@' + 'a'.repeat(40),
      asset: 'fixture-plugin-1.2.3.client.js.gz',
      service: 'svc',
    })
    expect(result.entry.pristineSha256).toBe(sha(Buffer.from(`window.__ModuleLoader__.load({id:'x',factory:()=>{}});${'/* published */'.repeat(4000)}`)))
    expect(result.entry.patchedSha256).toBe(sha(result.bundle))
  })

  it('refuses a rebuild whose source lost the change, before any build runs', async () => {
    const h = harness({ markers: false })
    const root = scratch()
    const failure = await rebuildCardPatch({ target: h.target, version: '1.2.3', repoRoot: h.repoRoot, workRoot: root, io: h.io }).catch(error => error)
    expect(failure).toBeInstanceOf(CardPatchError)
    expect(failure.stage).toBe('patch')
    expect(failure.details.join(' ')).toContain('src/client/badges.ts')
  })

  it('refuses a bundle that is byte-identical to the published one', async () => {
    const h = harness({ identical: true })
    const root = scratch()
    const failure = await rebuildCardPatch({ target: h.target, version: '1.2.3', repoRoot: h.repoRoot, workRoot: root, io: h.io }).catch(error => error)
    expect(failure).toBeInstanceOf(CardPatchError)
    expect(failure.message).toMatch(/byte-identical/)
  })

  it('refuses a checkout that is not the requested version', async () => {
    const h = harness()
    const root = scratch()
    const io = {
      ...h.io,
      async cloneUpstream({ directory }: { directory: string }) {
        mkdirSync(directory, { recursive: true })
        writeFileSync(join(directory, 'package.json'), JSON.stringify({ name: 'fixture-plugin', version: '9.9.9' }))
        return { directory, revision: 'b'.repeat(40) }
      },
    }
    const failure = await rebuildCardPatch({ target: h.target, version: '1.2.3', repoRoot: h.repoRoot, workRoot: root, io }).catch(error => error)
    expect(failure).toBeInstanceOf(CardPatchError)
    expect(failure.stage).toBe('source')
    expect(failure.message).toContain('9.9.9')
  })
})

describe('publishing', () => {
  function shipped(): { repoRoot: string, bundle: Buffer, target: Record<string, string> } {
    const repoRoot = scratch()
    const bundle = Buffer.from(`window.__ModuleLoader__.load({id:'x',factory:()=>{ctx.provide('svc')}});${'/* pad */'.repeat(6000)}`)
    return { repoRoot, bundle, target: entry({ service: 'svc', patchedSha256: sha(bundle), asset: 'dsh-context-0.84.1.client.js.gz', version: '0.84.1' }) }
  }

  it('writes the asset and a catalog that still names the previous version', () => {
    const { repoRoot, bundle, target } = shipped()
    mkdirSync(join(repoRoot, 'assets', 'card-patches'), { recursive: true })
    writeFileSync(join(repoRoot, 'assets', 'card-patches', 'catalog.json'), renderCatalogDocument([entry()]))
    const result = publishCardPatch({ repoRoot, entry: target, bundle })
    expect(existsSync(result.assetPath)).toBe(true)
    expect(sha(gunzipSync(readFileSync(result.assetPath)))).toBe(target.patchedSha256)
    const catalog = parseCatalogDocument(readFileSync(result.catalogPath, 'utf8'))
    expect(catalog.map(row => row.version)).toEqual(['0.84.0', '0.84.1'])
  })

  it('is idempotent for an identical asset and refuses a conflicting one', () => {
    const { repoRoot, bundle, target } = shipped()
    publishCardPatch({ repoRoot, entry: target, bundle })
    expect(publishCardPatch({ repoRoot, entry: target, bundle }).alreadyPresent).toBe(true)
    const different = entry({ ...target, patchedSha256: 'd'.repeat(64) })
    expect(() => publishCardPatch({ repoRoot, entry: different, bundle })).toThrow(/already exists with different contents/)
  })

  it('verifies the shipped catalog against the assets it names', () => {
    const { repoRoot, bundle, target } = shipped()
    publishCardPatch({ repoRoot, entry: target, bundle })
    expect(verifyShippedCardPatches(repoRoot).problems).toEqual([])
    rmSync(join(repoRoot, 'assets', 'card-patches', target.asset))
    expect(verifyShippedCardPatches(repoRoot).problems.join(' ')).toContain('is missing')
  })
})

/**
 * Installing a shipped replacement into a profile is the one pipeline step that
 * changes somebody's running installation, so its preconditions are part of the
 * contract: only the exact published build may be replaced, the original is kept
 * as a backup, and the result is read back and hashed.
 */
describe('installing into a profile', () => {
  /** A repo with one published version plus a profile holding the published bundle. */
  function profiles() {
    const repoRoot = scratch()
    const profile = scratch()
    const bundle = Buffer.from(`window.__ModuleLoader__.load({id:'x',factory:()=>{ctx.provide('svc')}});${'/* pad */'.repeat(4000)}`)
    const pristine = Buffer.from(`window.__ModuleLoader__.load({id:'x',factory:()=>{}});${'/* published */'.repeat(4000)}`)
    const target = entry({ service: 'svc', patchedSha256: sha(bundle), pristineSha256: sha(pristine), asset: 'dsh-context-0.84.1.client.js.gz', version: '0.84.1' })
    publishCardPatch({ repoRoot, entry: target, bundle })
    mkdirSync(join(profile, 'node_modules', 'dsh-context', 'lib'), { recursive: true })
    writeFileSync(join(profile, 'node_modules', 'dsh-context', 'package.json'), JSON.stringify({ name: 'dsh-context', version: '0.84.1' }))
    const installed = join(profile, 'node_modules', 'dsh-context', 'lib', 'client.js')
    writeFileSync(installed, pristine)
    const backups = join(scratch(), 'backups')
    return { repoRoot, profile, installed, backups, pristine, bundle }
  }

  it('replaces the published bundle, keeps a backup, and restores it on revert', () => {
    const f = profiles()
    const result = installShippedCardPatch({ repoRoot: f.repoRoot, id: 'dsh-context', version: '0.84.1', profileDirectory: f.profile, backupDirectory: f.backups })
    expect(sha(readFileSync(f.installed))).toBe(sha(f.bundle))
    expect(sha(readFileSync(result.backup))).toBe(sha(f.pristine))
    expect(installShippedCardPatch({ repoRoot: f.repoRoot, id: 'dsh-context', version: '0.84.1', profileDirectory: f.profile, backupDirectory: f.backups }).backup).toBe('')
    revertShippedCardPatch({ repoRoot: f.repoRoot, id: 'dsh-context', version: '0.84.1', profileDirectory: f.profile, backupDirectory: f.backups })
    expect(sha(readFileSync(f.installed))).toBe(sha(f.pristine))
  })

  it('refuses a profile whose bundle is neither the published build nor this replacement', () => {
    const f = profiles()
    writeFileSync(f.installed, '/* someone else edited this */')
    expect(() => installShippedCardPatch({ repoRoot: f.repoRoot, id: 'dsh-context', version: '0.84.1', profileDirectory: f.profile, backupDirectory: f.backups }))
      .toThrow(/matches neither/)
    expect(readFileSync(f.installed, 'utf8')).toBe('/* someone else edited this */')
  })

  it('refuses a version the catalog does not ship', () => {
    const f = profiles()
    expect(() => installShippedCardPatch({ repoRoot: f.repoRoot, id: 'dsh-context', version: '9.9.9', profileDirectory: f.profile, backupDirectory: f.backups }))
      .toThrow(/no shipped replacement/)
  })
})
