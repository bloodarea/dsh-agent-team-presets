/**
 * Acquiring the two byte-sources a rebuild needs.
 *
 * * **Published baseline** — the exact `lib/client.js` the package ships for
 *   that version. Its hash becomes the only installed state the patch may
 *   replace. It has to come from the registry, not from rebuilding: a checkout
 *   rebuilt on another machine produces a different file (different bundler
 *   patch level, different dependency resolution), and comparing against that
 *   would refuse every real installation.
 * * **Source** — the upstream tag, cloned so `git apply` can work on tracked
 *   files. Version tags are `v<version>` in both targets; anything else needs
 *   an explicit `--ref`, which is then verified against the manifest version.
 *
 * Both functions are small wrappers around `git`/`tar` because those are already
 * prerequisites for building the targets themselves; adding a tar parser or a
 * git client to this repository would be more code to keep correct than to call.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { runCommand } from './run.mjs'

/** Where published packages are fetched from. */
const REGISTRY = 'https://registry.npmjs.org'

/**
 * The tarball URL for one published version.
 *
 * The file name of a scoped package's tarball omits the scope, which is why the
 * path is built rather than concatenated.
 * @param {string} packageName - the published package name.
 * @param {string} version - the published version.
 * @returns {string} the absolute URL.
 */
export function tarballUrl(packageName, version) {
  const base = packageName.includes('/') ? packageName.slice(packageName.indexOf('/') + 1) : packageName
  return `${REGISTRY}/${packageName}/-/${base}-${version}.tgz`
}

/**
 * Hash one buffer the way the catalog records artifacts.
 * @param {Buffer} bytes - the file contents.
 * @returns {string} lowercase hex sha256.
 */
export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

/**
 * Compress a replacement bundle reproducibly.
 *
 * Node writes a zero MTIME and the fixed gzip OS byte, so the same bundle always
 * produces the same asset file. The previously shipped assets carry the build
 * machine's timestamp; new ones do not, which keeps a rebuild diff-free.
 * @param {Buffer} bytes - the bundle.
 * @returns {Buffer} the gzipped asset.
 */
export function gzipBundle(bytes) {
  return gzipSync(bytes, { level: 9 })
}

/**
 * Download the published bundle of one version.
 * @param {{packageName: string, version: string, workRoot: string,
 *   fetchImpl?: typeof fetch, run?: typeof runCommand}} options
 * @returns {Promise<{bytes: Buffer, sha256: string, size: number, url: string}>}
 */
export async function fetchPublishedBundle({ packageName, version, workRoot, fetchImpl = globalThis.fetch, run = runCommand }) {
  const url = tarballUrl(packageName, version)
  const response = await fetchImpl(url)
  if (!response.ok) throw new Error(`could not download ${url}: HTTP ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  mkdirSync(workRoot, { recursive: true })
  const archive = join(workRoot, `${packageName.replace('/', '-')}-${version}.tgz`)
  writeFileSync(archive, bytes)
  // `-O` streams the one member to stdout: the tarball's other files are never
  // extracted, so nothing from the published package can leak into the build.
  const { stdout } = await run('tar', ['-xzOf', archive, 'package/lib/client.js'], { encoding: 'buffer', timeoutMs: 60_000 })
  const bundle = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout)
  if (bundle.length === 0) throw new Error(`the published tarball of ${packageName}@${version} holds no lib/client.js`)
  return { bytes: bundle, sha256: sha256(bundle), size: bundle.length, url }
}

/**
 * Clone one upstream repository at an exact revision.
 * @param {{repository: string, ref: string, directory: string, run?: typeof runCommand}} options
 * @returns {Promise<{directory: string, revision: string}>}
 */
export async function cloneUpstream({ repository, ref, directory, run = runCommand }) {
  await run('git', ['clone', '--quiet', '--filter=blob:none', repository, directory], { timeoutMs: 300_000 })
  await run('git', ['-C', directory, 'checkout', '--quiet', '--detach', ref], { timeoutMs: 120_000 })
  const { stdout } = await run('git', ['-C', directory, 'rev-parse', 'HEAD'], { timeoutMs: 30_000 })
  const revision = stdout.trim()
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error(`git reported no full revision for ${repository}@${ref}: ${revision}`)
  // A dirty checkout would make "which source did this artifact come from"
  // unanswerable, and the catalog records exactly that.
  const { stdout: status } = await run('git', ['-C', directory, 'status', '--porcelain'], { timeoutMs: 30_000 })
  if (status.trim() !== '') throw new Error(`the checkout of ${repository}@${ref} is not clean:\n${status.trim()}`)
  return { directory, revision }
}

/**
 * The tag a version is expected to live at.
 * @param {{tagPrefix: string}} target - the recipe.
 * @param {string} version - the requested version.
 * @returns {string} the tag name.
 */
export function versionTag(target, version) {
  return `${target.tagPrefix}${version}`
}
