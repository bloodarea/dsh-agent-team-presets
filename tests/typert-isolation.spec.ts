/**
 * Counterexample suite for the 0.1.4 startup fix.
 *
 * The reported failure was a bare `import { z } from 'zod'` inside the built
 * Typert Host entry. Node ESM resolves a bare specifier from the *real* path of
 * the importing file, so a file-linked or GitHub-installed plugin whose source
 * directory has no `node_modules` crashed before `apply()` could run:
 *
 *   ERR_MODULE_NOT_FOUND: Cannot find package 'zod' imported from
 *   .../lib/typert.host.js
 *
 * The fix inlines the schema runtime. These tests hold that property from the
 * outside, in a directory that cannot resolve `zod`, and they carry their own
 * negative controls so a green run cannot be produced by the test environment
 * quietly supplying the dependency (this repository itself has `node_modules/zod`
 * installed, which is exactly the masking this suite must avoid).
 *
 * Two consequences shape the design:
 *
 * 1. The load checks run in a fresh `node` process, never through the test
 *    runner's `import()`. Vitest resolves bare specifiers from the Harness
 *    checkout, so an in-process import of a broken artifact succeeds and would
 *    report a fix that is not there.
 * 2. The schema assertions must run in-process (they need the live `create`
 *    hooks), so they are paired with a subprocess check that the same entry
 *    actually loads without `zod`.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { runNpm } from './fixtures/npm.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const libDir = join(repoRoot, 'lib')

/** Minimal structural types: the faces are consumed as generated runtime data. */
type ResultDescriptor = {
  mode: string
  typeSymbol: string
  create: () => { parse: (value: unknown) => unknown }
}
type Descriptor = {
  id: string
  service: string
  namespace: string
  method: string
  invocation: { kind: string }
  parameters: readonly unknown[]
  mode?: string
  cancellation?: { parameter: string }
  result: ResultDescriptor
}

/**
 * True when no ancestor of `directory` contains `node_modules`.
 *
 * A plugin directory sitting under an ancestor with `node_modules` is not an
 * isolated fixture: Node would resolve a bare specifier from there and the test
 * would pass even with the bug present.
 */
function hasNoResolvableAncestor(directory: string): boolean {
  let current = resolve(directory)
  for (;;) {
    if (existsSync(join(current, 'node_modules'))) return false
    const parent = dirname(current)
    if (parent === current) return true
    current = parent
  }
}

/**
 * Create a scratch directory whose ancestor chain has no `node_modules`.
 *
 * Prefers the OS temp area, which is normally outside the repository and so
 * cannot see the repository's own `node_modules/zod`. Falls back to a directory
 * inside the repository's `node_modules`, which Node treats as a resolution
 * boundary rather than a place to search upward from.
 *
 * The directory name carries a space on purpose: the report's install path had
 * one, and path handling is part of what regressed.
 */
function createIsolatedDirectory(): string {
  for (const base of [tmpdir(), join(repoRoot, 'node_modules')]) {
    if (!existsSync(base) || !hasNoResolvableAncestor(base)) continue
    const directory = mkdtempSync(join(base, 'team-presets isolation '))
    if (hasNoResolvableAncestor(directory)) return directory
    rmSync(directory, { recursive: true, force: true })
  }
  throw new Error('No dependency-isolated scratch directory is available for this test.')
}

/**
 * Import `specifier` in a fresh Node process and report what it exported.
 *
 * Functions are dropped from the report: this only needs to prove the module
 * loaded and to compare its serializable identity, and each face bundles its own
 * copy of the schema runtime.
 */
function probeInNode(specifier: string): { ok: boolean; code?: string; exports?: Record<string, unknown> } {
  const script = `
    const target = process.env.PROBE_TARGET
    // 0.2.1 descriptors carry their zod schemas inline, and a schema graph is
    // cyclic, so stringifying it directly would fail the probe. Both the schema
    // objects and the runtime factory are summarized to a marker: this test
    // compares descriptor identity, not the schema implementation.
    const drop = (key, value) => {
      if (typeof value === 'function') return '[function]'
      // The bundled zod namespace is dropped whole: it is a runtime object, not
      // part of the descriptor identity this test compares.
      if (key === 'zod') return '[schema-runtime]'
      if (value && typeof value === 'object' && '_zod' in value) return '[schema]'
      return value
    }
    try {
      const loaded = await import(target)
      console.log(JSON.stringify({ ok: true, exports: JSON.parse(JSON.stringify(loaded, drop)) }))
    } catch (error) {
      console.log(JSON.stringify({ ok: false, code: error?.code }))
    }
  `
  const output = execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8',
    env: { ...process.env, PROBE_TARGET: specifier },
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  return JSON.parse(output.trim().split('\n').at(-1)!) as { ok: boolean; code?: string; exports?: Record<string, unknown> }
}

/** True when a fresh Node process fails to resolve the specifier. */
function cannotResolveInNode(specifier: string): boolean {
  const result = probeInNode(specifier)
  return !result.ok && result.code === 'ERR_MODULE_NOT_FOUND'
}

let isolation: string
let faces: { host: string; remote: string }

beforeAll(() => {
  isolation = createIsolatedDirectory()
  // Copy the built artifacts only. No source, no manifest, no node_modules.
  cpSync(libDir, join(isolation, 'lib'), { recursive: true })
  faces = {
    host: pathToFileURL(join(isolation, 'lib', 'typert.host.js')).href,
    remote: pathToFileURL(join(isolation, 'lib', 'typert.remote-client.js')).href,
  }
})

afterAll(() => {
  // Only remove a directory that this file created, under a directory it chose,
  // and still carrying the generated prefix.
  if (isolation === undefined) return
  const resolved = resolve(isolation)
  const allowedParents = [resolve(tmpdir()), join(repoRoot, 'node_modules')]
  const basename = resolved.slice(dirname(resolved).length + 1)
  if (!allowedParents.includes(dirname(resolved)) || !basename.startsWith('team-presets isolation ')) return
  rmSync(resolved, { recursive: true, force: true })
})

describe('Typert faces load without a schema dependency', () => {
  it('proves the fixture cannot resolve zod and can still resolve an installed dependency', () => {
    // The isolation is only meaningful if a bare specifier fails there...
    const isolatedProbe = join(isolation, 'probe-needs-zod.mjs')
    writeFileSync(isolatedProbe, 'import { z } from "zod"\nexport const ok = Boolean(z)\n')
    expect(cannotResolveInNode(pathToFileURL(isolatedProbe).href)).toBe(true)
    rmSync(isolatedProbe, { force: true })
    // ...while the same specifier does resolve from inside the repository, so the
    // failure above is isolation rather than a missing dependency everywhere.
    const repositoryProbe = join(repoRoot, 'probe-needs-zod.mjs')
    writeFileSync(repositoryProbe, 'import { z } from "zod"\nexport const ok = Boolean(z)\n')
    try {
      expect(probeInNode(pathToFileURL(repositoryProbe).href).ok).toBe(true)
    } finally {
      rmSync(repositoryProbe, { force: true })
    }
  })

  it('reproduces the reported startup failure on the pre-fix import shape', () => {
    // Negative control: this is the exact import shape the report showed. If the
    // fixture ever stops being dependency-isolated, this control fails and the
    // green results below stop being evidence.
    const broken = join(isolation, 'lib', 'typert.host.broken.js')
    writeFileSync(broken, `import { z } from 'zod'\nexport const TYPERT = { package: 'dsh-agent-team-presets', face: 'host', schemas: [], invocations: [] }\nexport const marker = Boolean(z)\n`)
    try {
      expect(cannotResolveInNode(pathToFileURL(broken).href)).toBe(true)
    } finally {
      rmSync(broken, { force: true })
    }
  })

  it('loads both wire faces in a process that cannot resolve zod', () => {
    const host = probeInNode(faces.host)
    const remote = probeInNode(faces.remote)
    expect(host.ok, `Host face failed to load: ${host.code}`).toBe(true)
    expect(remote.ok, `Remote face failed to load: ${remote.code}`).toBe(true)
    // The Host face exports exactly the contributor the loader looks for.
    expect(Object.keys(host.exports!)).toEqual(['TYPERT'])
    expect(host.exports!.TYPERT).toMatchObject({ package: 'dsh-agent-team-presets', face: 'host', schemas: [] })
    // The Remote face keeps its named and default export.
    expect(remote.exports!.TYPERT_REMOTE).toBeDefined()
    expect(remote.exports!.default).toEqual(remote.exports!.TYPERT_REMOTE)
  })

  it('keeps the Host and Remote descriptor identities in agreement', () => {
    // Host 0.2.1's Remote face is `{ spec, zod, index }` and the descriptors live
    // under `spec`, so the identity comparison reads that contract rather than
    // the pre-0.2.1 flat shape.
    const host = probeInNode(faces.host).exports!.TYPERT as { package: string; invocations: { id: string; service: string }[] }
    const remote = probeInNode(faces.remote).exports!.TYPERT_REMOTE as {
      spec: { package: string; methods: Record<string, { service: string }> }
    }
    expect(remote.spec.package).toBe(host.package)
    // Every Host invocation is republished under `namespace/method` against the
    // same service. `create` hooks are normalized by the probe because each face
    // bundles its own schema runtime and function identity is not shared.
    const expected = Object.fromEntries(host.invocations.map(row => [row.id.slice(row.id.indexOf('#') + 1), row.service]))
    expect(Object.fromEntries(Object.entries(remote.spec.methods).map(([key, value]) => [key, value.service]))).toEqual(expected)
    // Agreement alone would also hold if a decorated method disappeared from
    // both faces. Pin the management surface the page and the Agent tools call.
    expect(host.invocations.map(row => row.id.slice(row.id.indexOf('#') + 1)).filter(id => id.startsWith('teamSkills/')).sort()).toEqual([
      'teamSkills/assignRole', 'teamSkills/createSkill', 'teamSkills/deleteAsset', 'teamSkills/detail',
      'teamSkills/importSkill', 'teamSkills/library', 'teamSkills/overrideSkill',
      'teamSkills/prepareImportFolder', 'teamSkills/readFile',
      'teamSkills/resetSkill', 'teamSkills/restoreBuiltinBindings', 'teamSkills/scanImportFolder', 'teamSkills/unassignRole',
      'teamSkills/updateDependencies', 'teamSkills/writeFile',
    ])
    const update = host.invocations.find(row => row.id === 'dsh-agent-team-presets#teamSkills/updateDependencies')
    // `TeamSkillDetailView | TeamSkillRefusalView` has no literal discriminator,
    // so Typert documents the missing JSON-Schema projection while still
    // validating and parsing the authored union. Pin that this stays a strict,
    // callable method rather than silently degrading to an opaque result.
    expect(update).toMatchObject({ invocation: { kind: 'direct' }, result: { mode: 'strict' } })
  })

  it('validates the Remote union result against the authored views in process', async () => {
    // The subprocess probe replaces `create` with a marker because functions do
    // not survive JSON. Load the real face here so the codec, not a placeholder,
    // decides what a caller may receive.
    const host = await import(faces.host) as {
      TYPERT: { invocations: { id: string; result: { create(): { parse(value: unknown): unknown } } }[] }
    }
    const update = host.TYPERT.invocations.find(row => row.id.endsWith('teamSkills/updateDependencies'))!
    const codec = update.result.create()
    const asset = {
      id: 'custom:x', skillId: 'x', description: 'x', origin: 'custom', version: '1', editable: true,
      fileCount: 1, totalBytes: 12, mcpServers: [], bindings: [],
    }
    expect(codec.parse({ asset, files: [], body: 'Body', directory: '/store/assets/x/1' })).toMatchObject({ asset: { id: 'custom:x' } })
    expect(codec.parse({ ok: false, reason: 'unknown-asset', detail: 'gone' })).toMatchObject({ ok: false, reason: 'unknown-asset' })
    expect(() => codec.parse({ ok: true })).toThrow()
    // The page copies this path, so a detail without it must not type-check.
    expect(() => codec.parse({ asset, files: [], body: 'Body' })).toThrow()
  })

  it('keeps the direct catalog and the cancellable execution stream', () => {
    const { invocations } = probeInNode(faces.host).exports!.TYPERT as { invocations: Descriptor[] }
    const catalog = invocations.find(row => row.method === 'catalog')
    const execution = invocations.find(row => row.method === 'execution')
    expect(catalog).toBeDefined()
    expect(catalog).toMatchObject({
      id: 'dsh-agent-team-presets#teamPresets/catalog',
      service: 'teamPresetsToolCatalog',
      namespace: 'teamPresets',
      invocation: { kind: 'direct' },
      parameters: [],
      result: { spec: { mode: 'strict', typeSymbol: 'dsh-agent-team-presets/types#ToolCatalogValue' } },
    })
    // A direct invocation must not claim a stream mode.
    expect(catalog!.mode).toBeUndefined()
    expect(execution).toBeDefined()
    expect(execution).toMatchObject({
      id: 'dsh-agent-team-presets#teamPresets/execution',
      mode: 'stream',
      invocation: { kind: 'direct' },
      cancellation: { parameter: 'signal' },
      result: { spec: { mode: 'strict', typeSymbol: 'dsh-agent-team-presets/types#TeamExecutionSnapshot' } },
    })
  })
})

describe('Inlined schemas still validate', () => {
  // The live schema hooks only exist in-process; the subprocess check above is
  // what proves these same entries load without zod.
  let catalog: ResultDescriptor
  let execution: ResultDescriptor

  beforeAll(async () => {
    const host = (await import(/* @vite-ignore */ faces.host)) as { TYPERT: { invocations: Descriptor[] } }
    const invocations = host.TYPERT.invocations
    catalog = invocations.find(row => row.method === 'catalog')!.result
    execution = invocations.find(row => row.method === 'execution')!.result
    expect(typeof catalog.create).toBe('function')
    expect(typeof execution.create).toBe('function')
  })

  it('accepts a well-formed catalog and preserves the captain-only flag', () => {
    const parsed = catalog.create().parse({
      tools: [{ name: 'read', description: 'Read a file', source: 'presets', captainOnly: true }],
    }) as { tools: { name: string; captainOnly?: boolean; source: string }[] }
    expect(parsed.tools).toHaveLength(1)
    expect(parsed.tools[0]).toMatchObject({ name: 'read', source: 'presets', captainOnly: true })
  })

  it('rejects an unknown tool source', () => {
    expect(() => catalog.create().parse({
      tools: [{ name: 'read', description: 'Read a file', source: 'native' }],
    })).toThrow()
  })

  it('rejects a malformed tool entry', () => {
    expect(() => catalog.create().parse({ tools: [{ description: 'no name', source: 'other' }] })).toThrow()
  })

  it('accepts a well-formed execution snapshot and rejects an unknown state', () => {
    const row = { teamId: 'team-1', state: 'busy', busySessions: 2, executingMembers: 1, pendingSessions: 0, notes: [] }
    const parsed = execution.create().parse({ teams: [row] }) as { teams: typeof row[] }
    expect(parsed.teams[0]).toEqual(row)
    // `unknown` is the only non-idle, non-busy state the page may render.
    expect(() => execution.create().parse({ teams: [{ ...row, state: 'running' }] })).toThrow()
    // A count that is not a number must not pass for a measured zero.
    expect(() => execution.create().parse({ teams: [{ ...row, busySessions: '2' }] })).toThrow()
  })
})

describe('Built entries carry no external schema dependency', () => {
  /** Extract every module specifier a built entry can reach at import time. */
  function specifiersOf(name: string): string[] {
    const source = readFileSync(join(libDir, name), 'utf8')
    return [
      ...source.matchAll(/(?:^|[;}\s])(?:import|export)\s[^;]*?from\s*["']([^"']+)["']/g),
      ...source.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g),
      ...source.matchAll(/require\s*\(\s*["']([^"']+)["']\s*\)/g),
    ].map(match => match[1]!)
  }

  it('gives both Typert wire faces no module specifier at all', () => {
    // These two load before plugin activation, which is why the missing
    // dependency was fatal. They must be self-contained, builtins included.
    for (const name of ['typert.host.js', 'typert.remote-client.js'] as const) {
      expect(specifiersOf(name), `${name} must not import anything`).toEqual([])
    }
  })

  it('does not reference zod from any built entry', () => {
    // The browser factory legitimately names its loader-supplied peers, so this
    // asserts the schema dependency specifically rather than a blanket rule.
    for (const name of ['index.js', 'client.js', 'typert.host.js', 'typert.remote-client.js'] as const) {
      expect(specifiersOf(name), `${name} must not reference zod`).not.toContain('zod')
    }
  })

  it('keeps the Harness peers external on the Host entry', () => {
    // The fix inlines the private schema runtime; it must not also inline the
    // Harness services, which would create a second service identity.
    const external = specifiersOf('index.js').filter(specifier => !specifier.startsWith('node:'))
    for (const peer of ['@deepseek-ai/dsh-agent', '@deepseek-ai/dsh-tools', '@deepseek-ai/dsh-typert-protocol']) {
      expect(external, `Host entry must keep ${peer} external`).toContain(peer)
    }
    expect(external).not.toContain('zod')
  })

  it('declares zod only as a build-time dependency', () => {
    const manifest = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
      optionalDependencies?: Record<string, string>
      devDependencies?: Record<string, string>
      files?: string[]
      exports?: Record<string, { default?: string }>
    }
    expect(manifest.dependencies?.zod).toBeUndefined()
    expect(manifest.optionalDependencies?.zod).toBeUndefined()
    expect(manifest.devDependencies?.zod).toBeDefined()
    // Everything the exports map promises has to be inside the published tree.
    for (const [subpath, entry] of Object.entries(manifest.exports ?? {})) {
      if (entry.default === undefined) continue
      const relative = entry.default.replace(/^\.\//, '')
      expect(existsSync(join(repoRoot, relative)), `${subpath} -> ${relative} must exist`).toBe(true)
      const insideShippedDirectory = (manifest.files ?? []).some(prefix => relative === prefix || relative.startsWith(prefix + '/'))
      expect(insideShippedDirectory, `${subpath} -> ${relative} must be covered by package.json files`).toBe(true)
    }
  })

  it('ships the inlined Zod license and never leaks a build-machine path', () => {
    const notices = readFileSync(join(libDir, 'THIRD-PARTY-NOTICES.txt'), 'utf8')
    expect(notices).toContain('zod')
    expect(notices).toContain('MIT License')
    expect(notices).toContain('Permission is hereby granted')
    for (const name of ['index.js', 'client.js', 'typert.host.js', 'typert.remote-client.js'] as const) {
      const source = readFileSync(join(libDir, name), 'utf8')
      expect(source).not.toContain('team-presets-build-')
      expect(source).not.toContain(repoRoot)
    }
  })
})

describe('Published package contents', () => {
  let files: string[]

  beforeAll(() => {
    // Ask npm itself rather than re-deriving the rule: `files` is only one of
    // the inputs that decide what a tarball contains.
    const destination = mkdtempSync(join(tmpdir(), 'team-presets pack '))
    try {
      const report = runNpm(['pack', '--dry-run', '--json', '--pack-destination', destination], repoRoot)
      files = (JSON.parse(report) as { files: { path: string }[] }[])[0]!.files.map(row => row.path)
    } finally {
      rmSync(destination, { recursive: true, force: true })
    }
  }, 60_000)

  it('includes every file the exports map points at', () => {
    const manifest = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')) as {
      exports: Record<string, { default?: string }>
    }
    for (const [subpath, entry] of Object.entries(manifest.exports)) {
      if (entry.default === undefined) continue
      expect(files, `${subpath} -> ${entry.default} must be published`).toContain(entry.default.replace(/^\.\//, ''))
    }
  })

  it('carries the install-critical assets and the inlined license', () => {
    for (const required of [
      'lib/index.js',
      'lib/client.js',
      'lib/typert.host.js',
      'lib/typert.host.d.ts',
      'lib/typert.remote-client.js',
      'lib/typert.remote-client.d.ts',
      'lib/THIRD-PARTY-NOTICES.txt',
      'cordis.patch.yml',
      'LICENSE',
    ]) {
      expect(files, `${required} must be published`).toContain(required)
    }
    expect(files.some(path => path.startsWith('locale/')), 'locale files must be published').toBe(true)
  })
})
