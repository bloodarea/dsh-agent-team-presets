/**
 * The card-patch rebuild pipeline: acquire, patch, build, verify, publish.
 *
 * The order is the point. Every check that can refuse the artifact runs before
 * anything is written, and the publish step is the only one that touches this
 * repository. A failed run therefore leaves the tree exactly as it was: no
 * half-written asset, no catalog entry naming a hash nobody can reproduce.
 *
 * Failures are reported as `CardPatchError` with the stage that refused, so the
 * CLI can say "the patch needs adaptation" instead of printing a stack trace
 * from inside `pnpm`.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { cloneUpstream, fetchPublishedBundle, gzipBundle, sha256, versionTag } from './acquire.mjs'
import { mergeCatalogTargets, normalizeEntry, parseCatalogDocument, renderCatalogDocument } from './catalog.mjs'
import { applySourcePatch } from './patch.mjs'
import { runCommand } from './run.mjs'
import { bundleProblems, describeEntry, missingSourceMarkers } from './verify.mjs'

/** The one document the shipped overlay lives in, beside the assets it names. */
export const OVERLAY_FILE = 'assets/card-patches/catalog.json'

/** A refusal that names its stage, so the CLI can say what to fix. */
export class CardPatchError extends Error {
  /**
   * @param {'version'|'source'|'patch'|'build'|'verify'|'publish'} stage - where the run stopped.
   * @param {string} message - the operator-facing explanation.
   * @param {string[]} [details] - one line per contributing problem.
   */
  constructor(stage, message, details = []) {
    super(message)
    this.name = 'CardPatchError'
    this.stage = stage
    this.details = details
  }
}

const VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:\.[0-9A-Za-z]+)*)?$/

/**
 * The `owner/repo` identity recorded in catalog entries.
 * @param {string} repository - clone URL.
 * @returns {string} the short identity.
 */
export function repositorySlug(repository) {
  return repository.replace(/^[a-z+]+:\/\//, '').replace(/\.git$/, '').replace(/^github\.com\//, '')
}

/**
 * Read the files the patch is supposed to have touched.
 * @param {string} directory - checkout root.
 * @param {ReadonlyArray<{path: string}>} markers - expected files.
 * @returns {Map<string, string>} relative path to text, for the files that exist.
 */
function readMarkerSources(directory, markers) {
  const files = new Map()
  for (const marker of markers) {
    const path = join(directory, marker.path)
    if (existsSync(path)) files.set(marker.path, readFileSync(path, 'utf8'))
  }
  return files
}

/**
 * Confirm the checkout is the version the catalog is about to claim.
 *
 * Building 0.85 while writing an entry for 0.84 would produce a hash that no
 * installation can ever match, and the failure would surface much later, on a
 * user's machine. This is cheap and refuses early.
 * @param {string} directory - checkout root.
 * @param {string} packageName - expected package.
 * @param {string} version - expected version.
 * @returns {{name: string, version: string}} the manifest.
 */
function verifyManifest(directory, packageName, version) {
  const path = join(directory, 'package.json')
  if (!existsSync(path)) throw new CardPatchError('source', `the checkout has no package.json: ${path}`)
  let manifest
  try {
    manifest = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    throw new CardPatchError('source', `the checkout's package.json is not valid JSON: ${String(error)}`)
  }
  if (manifest.name !== packageName) {
    throw new CardPatchError('source', `the checkout is ${JSON.stringify(manifest.name)}, not ${packageName}`)
  }
  if (manifest.version !== version) {
    throw new CardPatchError('source', `the checkout is ${manifest.version}, not the requested ${version}; pass the tag or commit that carries it`)
  }
  return manifest
}

/**
 * Run one rebuild through every stage, without writing anything.
 *
 * @param {object} options
 * @param {object} options.target - recipe from `registry.mjs`.
 * @param {string} options.version - upstream version to rebuild.
 * @param {string} [options.ref] - explicit ref; defaults to `v<version>`.
 * @param {string} options.repoRoot - this repository's root (patch files, assets).
 * @param {string} options.workRoot - scratch directory for the clone and tarball.
 * @param {string} [options.sourceDirectory] - prepared checkout to reuse instead of cloning.
 * @param {boolean} [options.allowFuzz] - allow the weakest patch strategy.
 * @param {(message: string) => void} [options.log]
 * @param {object} [options.io] - stage overrides, used by tests.
 * @returns {Promise<{entry: Record<string,string>, bundle: Buffer, patch: {strategy: string, warnings: string[]}, revision: string, sourceDirectory: string, target: object}>}
 */
export async function rebuildCardPatch(options) {
  const {
    target, version, repoRoot, workRoot, sourceDirectory, allowFuzz = true,
    log = () => {}, io = {},
  } = options
  const cloneUpstreamFn = io.cloneUpstream ?? cloneUpstream
  const fetchPublishedFn = io.fetchPublishedBundle ?? fetchPublishedBundle
  const applyPatchFn = io.applySourcePatch ?? applySourcePatch
  const run = io.run ?? runCommand

  if (!VERSION.test(version)) throw new CardPatchError('version', `${JSON.stringify(version)} is not a semver version`)

  log(`baseline: fetching the published ${target.packageName}@${version} bundle`)
  const baseline = await fetchPublishedFn({ packageName: target.packageName, version, workRoot })
  log(`baseline: ${baseline.size} bytes, sha256 ${baseline.sha256.slice(0, 12)}…`)

  let checkout
  if (sourceDirectory !== undefined) {
    checkout = { directory: resolve(sourceDirectory), revision: 'working-copy' }
    log(`source: using the checkout at ${checkout.directory}`)
  } else {
    const ref = options.ref ?? versionTag(target, version)
    log(`source: cloning ${target.repository} at ${ref}`)
    checkout = await cloneUpstreamFn({ repository: target.repository, ref, directory: join(workRoot, 'source') })
    log(`source: revision ${checkout.revision}`)
  }
  verifyManifest(checkout.directory, target.packageName, version)

  log('patch: applying the source change')
  const patch = await applyPatchFn({
    directory: checkout.directory,
    patchFile: join(repoRoot, target.patch),
    allowFuzz,
    run,
  })
  for (const warning of patch.warnings) log(`patch: warning: ${warning}`)
  log(`patch: applied with ${patch.strategy}`)

  const markerProblems = missingSourceMarkers(readMarkerSources(checkout.directory, target.markers), target.markers)
  if (markerProblems.length > 0) {
    throw new CardPatchError('patch', 'the patch applied but the result does not contain the card-badge change', markerProblems)
  }

  log(`build: ${['pnpm', ...target.install].join(' ')}`)
  await run('pnpm', [...target.install], { cwd: checkout.directory, timeoutMs: 900_000 })
  log(`build: ${['pnpm', ...target.build].join(' ')}`)
  await run('pnpm', [...target.build], { cwd: checkout.directory, timeoutMs: 900_000 })

  const artifactPath = join(checkout.directory, target.artifact)
  if (!existsSync(artifactPath)) {
    throw new CardPatchError('build', `the build produced no ${target.artifact}`)
  }
  const bundle = readFileSync(artifactPath)
  const problems = bundleProblems({ text: bundle.toString('utf8'), service: target.service, publishedSize: baseline.size })
  if (problems.length > 0) throw new CardPatchError('verify', 'the rebuilt bundle is not a usable replacement', problems)
  const patchedSha256 = sha256(bundle)
  if (patchedSha256 === baseline.sha256) {
    throw new CardPatchError('verify', 'the rebuilt bundle is byte-identical to the published one, so the patch had no effect')
  }

  const entry = normalizeEntry({
    id: target.id,
    packageName: target.packageName,
    version,
    source: `${repositorySlug(target.repository)}@${checkout.revision}`,
    asset: `${target.id}-${version}.client.js.gz`,
    service: target.service,
    pristineSha256: baseline.sha256,
    patchedSha256,
  })
  log(`verify: ${describeEntry(entry)} (${bundle.length} bytes, ${(bundle.length / baseline.size * 100 - 100).toFixed(2)}% over published)`)

  return { entry, bundle, patch, revision: checkout.revision, sourceDirectory: checkout.directory, target, baseline }
}

/**
 * Write one verified rebuild into this repository.
 *
 * Nothing is overwritten silently: an existing asset with different bytes is a
 * refusal, because that file may already be installed in someone's profile from
 * a previous release.
 * @param {{repoRoot: string, entry: Record<string,string>, bundle: Buffer, sourceDirectory?: string, log?: (message: string) => void}} options
 * @returns {{assetPath: string, catalogPath: string, licensePath?: string, alreadyPresent: boolean}}
 */
export function publishCardPatch({ repoRoot, entry, bundle, sourceDirectory, log = () => {} }) {
  const assets = join(repoRoot, 'assets', 'card-patches')
  mkdirSync(assets, { recursive: true })
  const assetPath = join(assets, entry.asset)
  const gz = gzipBundle(bundle)
  let alreadyPresent = false
  if (existsSync(assetPath)) {
    const existing = gunzipSync(readFileSync(assetPath))
    if (sha256(existing) !== entry.patchedSha256) {
      throw new CardPatchError('publish', `${entry.asset} already exists with different contents; move it aside before publishing this build`)
    }
    alreadyPresent = true
    log(`publish: ${entry.asset} is already present and identical`)
  } else {
    writeAtomic(assetPath, gz)
    log(`publish: wrote ${entry.asset} (${gz.length} bytes gzipped)`)
  }

  let licensePath
  if (sourceDirectory !== undefined) {
    const license = join(sourceDirectory, 'LICENSE')
    if (existsSync(license)) {
      const directory = join(assets, 'licenses')
      mkdirSync(directory, { recursive: true })
      licensePath = join(directory, `${entry.id}-LICENSE`)
      const bytes = readFileSync(license)
      const same = existsSync(licensePath) && readFileSync(licensePath).equals(bytes)
      if (!same) writeAtomic(licensePath, bytes)
      log(`publish: ${same ? 'kept' : 'wrote'} ${licensePath.slice(repoRoot.length + 1)}`)
    }
  }

  const catalogPath = join(repoRoot, OVERLAY_FILE)
  const existing = existsSync(catalogPath) ? parseCatalogDocument(readFileSync(catalogPath, 'utf8')) : []
  const merged = mergeCatalogTargets(existing, [entry])
  writeAtomic(catalogPath, Buffer.from(renderCatalogDocument(merged), 'utf8'))
  log(`publish: catalog now names ${merged.length} target${merged.length === 1 ? '' : 's'} in ${OVERLAY_FILE}`)

  return { assetPath, catalogPath, licensePath, alreadyPresent }
}

/**
 * Resolve the shipped catalog entry for one target and version.
 * @param {string} repoRoot - this repository's root.
 * @param {string} id - target identity.
 * @param {string} version - upstream version.
 * @returns {Record<string, string>} the matching entry.
 */
export function shippedEntry(repoRoot, id, version) {
  const catalogPath = join(repoRoot, OVERLAY_FILE)
  if (!existsSync(catalogPath)) throw new CardPatchError('publish', `no ${OVERLAY_FILE}: publish a build for ${id} ${version} first`)
  const entries = parseCatalogDocument(readFileSync(catalogPath, 'utf8'))
  const entry = entries.find(row => row.id === id && row.version === version)
  if (entry === undefined) {
    const known = entries.filter(row => row.id === id).map(row => row.version)
    throw new CardPatchError('version', `no shipped replacement for ${id} ${version}; shipped: ${known.length === 0 ? 'none' : known.join(', ')}`)
  }
  return entry
}

/**
 * Install one shipped replacement into a profile, after proving the installed
 * bundle is the exact published build it was made from.
 *
 * The running plugin exposes this as a button, but that button only exists for
 * the versions compiled into it. This is the same operation without the
 * rebuild: the preconditions and the backup path are identical, so a later
 * "Remove patch" from the plugin restores the file this command backed up.
 * @param {{repoRoot: string, id: string, version: string, profileDirectory: string,
 *   backupDirectory?: string, log?: (message: string) => void}} options
 * @returns {{installed: string, backup: string, bytes: number}}
 */
export function installShippedCardPatch({ repoRoot, id, version, profileDirectory, backupDirectory, log = () => {} }) {
  const entry = shippedEntry(repoRoot, id, version)
  const bundle = join(profileDirectory, 'node_modules', entry.packageName, 'lib', 'client.js')
  if (!existsSync(bundle)) throw new CardPatchError('source', `${entry.packageName} has no lib/client.js in ${profileDirectory}`)
  const manifest = (() => {
    try {
      return JSON.parse(readFileSync(join(profileDirectory, 'node_modules', entry.packageName, 'package.json'), 'utf8'))
    } catch {
      throw new CardPatchError('source', `${entry.packageName} has no readable package.json in ${profileDirectory}`)
    }
  })()
  if (manifest.version !== version) {
    throw new CardPatchError('version', `the profile has ${entry.packageName} ${manifest.version}, not ${version}`)
  }
  const current = sha256(readFileSync(bundle))
  if (current === entry.patchedSha256) {
    log(`${entry.packageName} ${version} already carries the replacement`)
    return { installed: bundle, backup: '', bytes: readFileSync(bundle).length }
  }
  if (current !== entry.pristineSha256) {
    throw new CardPatchError('verify', `the installed ${entry.packageName} bundle matches neither the published build nor this replacement`, [
      `installed: ${current}`,
      `pristine:  ${entry.pristineSha256}`,
      `patched:   ${entry.patchedSha256}`,
    ])
  }
  const asset = join(repoRoot, 'assets', 'card-patches', entry.asset)
  if (!existsSync(asset)) throw new CardPatchError('publish', `${entry.asset} is missing; run the rebuild with --write`)
  const replacement = gunzipSync(readFileSync(asset))
  if (sha256(replacement) !== entry.patchedSha256) throw new CardPatchError('verify', `${entry.asset} does not match its recorded hash`)
  const backups = backupDirectory ?? defaultBackupDirectory()
  mkdirSync(backups, { recursive: true })
  const backup = join(backups, `${entry.id}-${version}.client.js`)
  if (existsSync(backup) && sha256(readFileSync(backup)) !== entry.pristineSha256) {
    throw new CardPatchError('publish', `${backup} already holds a different build; move it aside first`)
  }
  if (!existsSync(backup)) writeAtomic(backup, readFileSync(bundle))
  writeAtomic(bundle, replacement)
  const after = sha256(readFileSync(bundle))
  if (after !== entry.patchedSha256) throw new CardPatchError('verify', `the written bundle hashes to ${after}, not ${entry.patchedSha256}`)
  log(`patched ${entry.packageName} ${version}: ${replacement.length} bytes, backup at ${backup}`)
  return { installed: bundle, backup, bytes: replacement.length }
}

/**
 * Restore the backup this pipeline wrote, after proving the file is still ours.
 * @param {{repoRoot: string, id: string, version: string, profileDirectory: string, backupDirectory?: string,
 *   log?: (message: string) => void}} options
 * @returns {{restored: string, bytes: number}}
 */
export function revertShippedCardPatch({ repoRoot, id, version, profileDirectory, backupDirectory, log = () => {} }) {
  const entry = shippedEntry(repoRoot, id, version)
  const bundle = join(profileDirectory, 'node_modules', entry.packageName, 'lib', 'client.js')
  const backups = backupDirectory ?? defaultBackupDirectory()
  const backup = join(backups, `${entry.id}-${version}.client.js`)
  if (!existsSync(backup)) throw new CardPatchError('publish', `no backup at ${backup}`)
  const backupBytes = readFileSync(backup)
  if (sha256(backupBytes) !== entry.pristineSha256) throw new CardPatchError('verify', `${backup} does not match the published build`)
  if (existsSync(bundle) && sha256(readFileSync(bundle)) === entry.pristineSha256) {
    log(`${entry.packageName} ${version} is already the published build`)
    return { restored: bundle, bytes: backupBytes.length }
  }
  writeAtomic(bundle, backupBytes)
  log(`restored ${entry.packageName} ${version} from ${backup}`)
  return { restored: bundle, bytes: backupBytes.length }
}

/** The backup directory the running plugin already uses for these files. */
function defaultBackupDirectory() {
  const home = process.env['DSH_HOME'] !== undefined && process.env['DSH_HOME'] !== ''
    ? process.env['DSH_HOME']
    : join(process.env['HOME'] ?? '.', '.dsh')
  return join(home, 'agent-team-presets', 'card-patches')
}

/** The profile a command acts on when none was named. */
export function defaultProfileDirectory() {
  if (process.env['DSH_PROFILE_DIR'] !== undefined && process.env['DSH_PROFILE_DIR'] !== '') return process.env['DSH_PROFILE_DIR']
  const home = process.env['DSH_HOME'] !== undefined && process.env['DSH_HOME'] !== ''
    ? process.env['DSH_HOME']
    : join(process.env['HOME'] ?? '.', '.dsh')
  return join(home, 'profiles', process.env['DSH_PROFILE'] ?? 'web')
}

/**
 * Check every shipped overlay entry against the asset it names.
 *
 * This is the offline half of verification: it cannot rebuild, but it can prove
 * that what the catalog promises is what the package contains, which is the part
 * a release can get wrong.
 * @param {string} repoRoot - this repository's root.
 * @returns {{rows: Array<{id: string, version: string, ok: boolean, detail: string}>, problems: string[]}}
 */
export function verifyShippedCardPatches(repoRoot) {
  const catalogPath = join(repoRoot, OVERLAY_FILE)
  if (!existsSync(catalogPath)) {
    return { rows: [], problems: [] }
  }
  const entries = parseCatalogDocument(readFileSync(catalogPath, 'utf8'))
  const rows = []
  const problems = []
  for (const entry of entries) {
    const assetPath = join(repoRoot, 'assets', 'card-patches', entry.asset)
    if (!existsSync(assetPath)) {
      const detail = `${entry.asset} is missing`
      rows.push({ id: entry.id, version: entry.version, ok: false, detail })
      problems.push(`${entry.id} ${entry.version}: ${detail}`)
      continue
    }
    let bundle
    try {
      bundle = gunzipSync(readFileSync(assetPath))
    } catch (error) {
      const detail = `${entry.asset} is not valid gzip: ${String(error)}`
      rows.push({ id: entry.id, version: entry.version, ok: false, detail })
      problems.push(`${entry.id} ${entry.version}: ${detail}`)
      continue
    }
    const digest = sha256(bundle)
    if (digest !== entry.patchedSha256) {
      const detail = `${entry.asset} hashes to ${digest.slice(0, 12)}…, not ${entry.patchedSha256.slice(0, 12)}…`
      rows.push({ id: entry.id, version: entry.version, ok: false, detail })
      problems.push(`${entry.id} ${entry.version}: ${detail}`)
      continue
    }
    const found = bundleProblems({ text: bundle.toString('utf8'), service: entry.service })
    if (found.length > 0) {
      rows.push({ id: entry.id, version: entry.version, ok: false, detail: found.join('; ') })
      problems.push(`${entry.id} ${entry.version}: ${found.join('; ')}`)
      continue
    }
    rows.push({ id: entry.id, version: entry.version, ok: true, detail: `${bundle.length} bytes` })
  }
  return { rows, problems }
}

/**
 * Write one file so a reader never observes a partial one.
 * @param {string} path - destination.
 * @param {Buffer} bytes - contents.
 */
function writeAtomic(path, bytes) {
  mkdirSync(dirname(path), { recursive: true })
  const staged = `${path}.tmp-${process.pid}`
  writeFileSync(staged, bytes)
  try {
    renameSync(staged, path)
  } catch (error) {
    rmSync(staged, { force: true })
    throw error
  }
}
