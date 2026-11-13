/**
 * Card-patch installation: what each installed bundle state is, and which of
 * them an install or restore may touch.
 *
 * The real targets are 1–2 MB bundles that cannot live in a fixture, so every
 * state is produced from small files whose hashes the fixture target declares
 * itself. The catalog's own hashes are then checked against the assets this
 * package ships, which is what catches a stale or mismatched prebuilt bundle.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync, gunzipSync } from 'node:zlib'
import {
  CARD_PATCH_TARGETS, catalogTargetsFor, findCardPatchTarget, installCardPatch, mergeCatalogTargets,
  parseCardPatchCatalog, resolveTargetView, targetState, uninstallCardPatch,
} from '../src/card-patches.ts'
import type { CardPatchEnvironment, CardPatchTarget } from '../src/card-patches.ts'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

/** One scratch root holding a fake package, its assets and its backups. */
function workspace(): string {
  const root = mkdtempSync(join(tmpdir(), 'card-patch-'))
  roots.push(root)
  mkdirSync(join(root, 'package', 'lib'), { recursive: true })
  mkdirSync(join(root, 'assets'), { recursive: true })
  return root
}

const sha = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

/** Fixture target whose two acceptable bundles are small, known buffers. */
interface Fixture {
  readonly root: string
  readonly target: CardPatchTarget
  readonly env: CardPatchEnvironment
  readonly pristine: Buffer
  readonly patched: Buffer
  writeBundle(bytes: Buffer | string): void
  writeManifest(version: string): void
  bundle(): Buffer
  backupPath(): string
}

/**
 * Build one fixture workspace.
 * @param options - versions and payloads to seed it with.
 * @returns the fixture handle.
 */
function fixture(options: {
  version?: string
  seed?: 'pristine' | 'patched' | 'foreign' | 'none'
  asset?: 'present' | 'missing' | 'wrong'
} = {}): Fixture {
  const root = workspace()
  const pristine = Buffer.from('/* published bundle */\n')
  const patched = Buffer.from('/* published bundle */\n/* add card badge service */\n')
  const target: CardPatchTarget = {
    id: 'fixture-plugin',
    packageName: 'fixture-plugin',
    version: '1.2.3',
    source: 'example/fixture@abc123',
    asset: 'fixture.client.js.gz',
    service: 'fixtureAgentCardBadges',
    pristineSha256: sha(pristine),
    patchedSha256: sha(patched),
  }
  const state = {
    writeBundle: (bytes: Buffer | string) => { writeFileSync(join(root, 'package', 'lib', 'client.js'), bytes) },
    writeManifest: (version: string) => {
      writeFileSync(join(root, 'package', 'package.json'), JSON.stringify({ name: 'fixture-plugin', version }))
    },
    bundle: () => readFileSync(join(root, 'package', 'lib', 'client.js')),
    backupPath: () => join(root, 'backups', 'fixture-plugin-1.2.3.client.js'),
  }
  state.writeManifest(options.version ?? '1.2.3')
  const seed = options.seed ?? 'pristine'
  if (seed === 'pristine') state.writeBundle(pristine)
  if (seed === 'patched') state.writeBundle(patched)
  if (seed === 'foreign') state.writeBundle('/* somebody hand-edited this */\n')
  const asset = options.asset ?? 'present'
  if (asset === 'present') writeFileSync(join(root, 'assets', target.asset), gzipSync(patched))
  if (asset === 'wrong') writeFileSync(join(root, 'assets', target.asset), gzipSync('/* not the recorded bytes */\n'))
  return {
    root,
    target,
    pristine,
    patched,
    ...state,
    env: {
      resolvePackage: name => name === 'fixture-plugin' ? join(root, 'package') : undefined,
      backupDirectory: () => join(root, 'backups'),
      assetDirectory: () => join(root, 'assets'),
    },
  }
}

describe('installed bundle classification', () => {
  it('reports a package that is not installed as absent', () => {
    const f = fixture()
    expect(targetState(f.target, { ...f.env, resolvePackage: () => undefined })).toMatchObject({
      state: 'absent', packageName: 'fixture-plugin', supportedVersion: '1.2.3',
    })
  })

  it('refuses a version this build was not produced from', () => {
    const f = fixture({ version: '1.3.0' })
    expect(targetState(f.target, f.env)).toMatchObject({
      state: 'unsupported', installedVersion: '1.3.0', supportedVersion: '1.2.3',
    })
  })

  it('distinguishes the published build from this plugin\'s replacement', () => {
    const pristine = fixture({ seed: 'pristine' })
    expect(targetState(pristine.target, pristine.env).state).toBe('pristine')
    const patched = fixture({ seed: 'patched' })
    expect(targetState(patched.target, patched.env).state).toBe('patched')
  })

  it('refuses a bundle that matches neither recorded build', () => {
    const f = fixture({ seed: 'foreign' })
    expect(targetState(f.target, f.env)).toMatchObject({ state: 'foreign' })
  })
})

describe('installing the replacement', () => {
  it('replaces the published bundle, keeps a backup and reports the new state', () => {
    const f = fixture()
    const result = installCardPatch(f.target, f.env)
    expect(result).toMatchObject({ ok: true, state: 'patched' })
    expect(f.bundle().equals(f.patched)).toBe(true)
    expect(readFileSync(f.backupPath()).equals(f.pristine)).toBe(true)
  })

  it('is idempotent on an already patched bundle', () => {
    const f = fixture({ seed: 'patched' })
    expect(installCardPatch(f.target, f.env)).toMatchObject({ ok: true, state: 'patched' })
  })

  it('refuses every state it did not produce, leaving the file untouched', () => {
    for (const options of [{ version: '2.0.0' }, { seed: 'foreign' as const }]) {
      const f = fixture(options)
      const before = f.bundle()
      expect(installCardPatch(f.target, f.env)).toMatchObject({ ok: false })
      expect(f.bundle().equals(before)).toBe(true)
    }
  })

  it('refuses a package that is not installed', () => {
    const f = fixture()
    const env = { ...f.env, resolvePackage: () => undefined }
    expect(installCardPatch(f.target, env)).toMatchObject({ ok: false, state: 'absent' })
  })

  it('refuses a missing or mismatched prebuilt asset instead of writing it', () => {
    for (const asset of ['missing', 'wrong'] as const) {
      const f = fixture({ asset })
      const before = f.bundle()
      expect(installCardPatch(f.target, f.env)).toMatchObject({ ok: false })
      expect(f.bundle().equals(before)).toBe(true)
    }
  })
})

describe('restoring the published bundle', () => {
  it('restores the backup and forgets it', () => {
    const f = fixture()
    installCardPatch(f.target, f.env)
    const result = uninstallCardPatch(f.target, f.env)
    expect(result).toMatchObject({ ok: true, state: 'pristine' })
    expect(f.bundle().equals(f.pristine)).toBe(true)
    expect(() => readFileSync(f.backupPath())).toThrow()
  })

  it('is idempotent on a published bundle', () => {
    const f = fixture()
    expect(uninstallCardPatch(f.target, f.env)).toMatchObject({ ok: true, state: 'pristine' })
  })

  it('refuses when this plugin holds no backup to restore', () => {
    const f = fixture({ seed: 'patched' })
    const result = uninstallCardPatch(f.target, f.env)
    expect(result).toMatchObject({ ok: false, state: 'patched' })
    expect(result.detail).toContain('no backup')
    expect(f.bundle().equals(f.patched)).toBe(true)
  })

  it('refuses a backup that no longer matches the published build', () => {
    const f = fixture()
    installCardPatch(f.target, f.env)
    writeFileSync(f.backupPath(), '/* corrupted */\n')
    expect(uninstallCardPatch(f.target, f.env)).toMatchObject({ ok: false, state: 'patched' })
  })
})

describe('shipped catalog', () => {
  it('names one supported version per shipped target and resolves by id', () => {
    for (const target of CARD_PATCH_TARGETS) {
      expect(target.version).not.toBe('')
      expect(catalogTargetsFor(target.id)).toContain(target)
    }
    expect(findCardPatchTarget('no-such-plugin')).toBeUndefined()
  })

  it('ships an asset for every target whose bytes match its recorded hash', () => {
    const directory = join(import.meta.dirname, '..', 'assets', 'card-patches')
    for (const target of CARD_PATCH_TARGETS) {
      // The asset is gzipped; the recorded hash is of the bundle it inflates to.
      const bundle = gunzipSync(readFileSync(join(directory, target.asset)))
      expect(createHash('sha256').update(bundle).digest('hex'), target.id).toBe(target.patchedSha256)
      expect(bundle.includes(target.service), `${target.id} registers ${target.service}`).toBe(true)
      expect(target.pristineSha256).not.toBe(target.patchedSha256)
    }
  })
})

/**
 * Several upstream versions of one target may be shipped at once: a rebuild for
 * a newer release must not take the patch away from installations that have not
 * upgraded yet. These cases pin that promise and the classification it drives.
 */
describe('multiple supported versions of one target', () => {
  /** A tiny catalog entry for one version of the fixture target. */
  function version(version: string): CardPatchTarget {
    const pristine = Buffer.from(`/* published ${version} */\n`)
    const patched = Buffer.from(`/* patched ${version} */\n`)
    return {
      id: 'dsh-context',
      packageName: 'dsh-context',
      version,
      source: `example/context@v${version}`,
      asset: `dsh-context-${version}.client.js.gz`,
      service: 'contextAgentCardBadges',
      pristineSha256: sha(pristine),
      patchedSha256: sha(patched),
    }
  }

  /** A profile with one installed version and one bundle state. */
  function installed(version: string, seed: 'pristine' | 'patched'): CardPatchEnvironment {
    const root = workspace()
    mkdirSync(join(root, 'package', 'lib'), { recursive: true })
    writeFileSync(join(root, 'package', 'package.json'), JSON.stringify({ name: 'dsh-context', version }))
    const bytes = seed === 'pristine' ? `/* published ${version} */\n` : `/* patched ${version} */\n`
    writeFileSync(join(root, 'package', 'lib', 'client.js'), bytes)
    return {
      resolvePackage: name => name === 'dsh-context' ? join(root, 'package') : undefined,
      backupDirectory: () => join(root, 'backups'),
      assetDirectory: () => root,
    }
  }

  it('keeps the older version when the newer one is added', () => {
    const merged = mergeCatalogTargets([version('0.84.0')], [version('0.84.1')])
    expect(merged.map(target => target.version)).toEqual(['0.84.0', '0.84.1'])
  })

  it('replaces only the version that was rebuilt', () => {
    const rebuilt = { ...version('0.84.0'), patchedSha256: 'e'.repeat(64) }
    const merged = mergeCatalogTargets([version('0.84.0')], [rebuilt])
    expect(merged).toHaveLength(1)
    expect(merged[0]?.patchedSha256).toBe('e'.repeat(64))
  })

  it('classifies the row by the installed version, not the newest one', () => {
    const entries = [version('0.84.0'), version('0.84.1')]
    const view = resolveTargetView(entries, installed('0.84.0', 'pristine'))
    expect(view).toMatchObject({
      state: 'pristine',
      supportedVersion: '0.84.0',
      supportedVersions: ['0.84.0', '0.84.1'],
      installedVersion: '0.84.0',
    })
  })

  it('reports a version it ships no replacement for, naming the ones it does', () => {
    const view = resolveTargetView([version('0.84.0'), version('0.84.1')], installed('0.85.0', 'pristine'))
    expect(view.state).toBe('unsupported')
    expect(view.detail).toContain('0.84.0, 0.84.1')
    expect(view.detail).toContain('0.85.0')
  })

  it('refuses an overlay document with one unusable entry instead of applying half of it', () => {
    const document = JSON.stringify({
      version: 1,
      targets: [{ ...version('0.84.1'), patchedSha256: 'not-a-hash' }],
    })
    expect(() => parseCardPatchCatalog(document)).toThrow(/patchedSha256/)
  })
})
