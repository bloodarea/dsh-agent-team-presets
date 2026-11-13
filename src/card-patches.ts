/**
 * Optional card-badge patches for other plugins' Agent cards.
 *
 * Neither dsh-context nor dsh-better-sidebar publishes a card extension point,
 * so marking the subagents a Team created on their cards requires replacing
 * that plugin's browser bundle with one built from the pinned source plus a
 * small registration service. This module owns that replacement: what a
 * supported target is, whether the installed copy is still the published
 * bundle or already ours, and how to swap it in and back out.
 *
 * Nothing here builds anything. Both replacements ship as prebuilt assets
 * (`assets/card-patches`) produced from the exact upstream revision named in
 * the catalog, so an install is an offline file swap. Every decision comes from
 * a content hash: a bundle matching neither the published original nor this
 * build's replacement is refused, because overwriting it would destroy an edit
 * this plugin cannot reproduce.
 *
 * Each target is pinned to one version. A target running any other version
 * reports `unsupported` rather than receiving a bundle built from different
 * source.
 * @module dsh-agent-team-presets/card-patches
 */

import { createHash } from 'node:crypto'
import {
  copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import type { CardPatchFileState, CardPatchResult, CardPatchTargetView } from './types.ts'

export type { CardPatchFileState, CardPatchResult, CardPatchTargetView }

/** One target plugin this build can patch, pinned to the version it was built for. */
export interface CardPatchTarget {
  /** Stable identity used by the settings page and the Remote methods. */
  readonly id: string
  /** Package whose browser bundle is replaced. */
  readonly packageName: string
  /** The one version this build's bundle was produced from. */
  readonly version: string
  /** Upstream revision the bundle was built from, for the operator's audit. */
  readonly source: string
  /** Prebuilt replacement, relative to `assets/card-patches`. */
  readonly asset: string
  /**
   * Service name the replacement registers. The settings page reads its
   * presence in the live client to tell an installed patch from one that is on
   * disk but not yet served.
   */
  readonly service: string
  /** sha256 of the bundle the package publishes; the only state one may overwrite. */
  readonly pristineSha256: string
  /** sha256 of the prebuilt replacement; the only state one may restore from. */
  readonly patchedSha256: string
}

/**
 * The supported targets.
 *
 * Each entry is fixed to one upstream version on purpose: the replacement is a
 * whole-bundle build, so a different version's bundle would silently change
 * behaviour that was never reviewed here.
 */
export const CARD_PATCH_TARGETS: readonly CardPatchTarget[] = [
  {
    id: 'dsh-context',
    packageName: 'dsh-context',
    version: '0.84.0',
    source: 'bowenliang123/dsh-context@aa98b1231d5f0f8e833391f198e65e14e73b3323',
    asset: 'dsh-context-0.84.0.client.js.gz',
    service: 'contextAgentCardBadges',
    pristineSha256: '686ce45c05394d5820697c402dc64de05ff83b0f2770fed32fb524b3dbdf8450',
    patchedSha256: '4d4e0afe7b536ca5f32e8ed910e226afbbb81e1e3d9481d8e93e7a3e8b4ea461',
  },
  {
    id: 'dsh-better-sidebar',
    packageName: 'dsh-better-sidebar',
    version: '0.32.0',
    source: 'omdsh-dev/DSH-better-sidebar@v0.32.0',
    asset: 'dsh-better-sidebar-0.32.0.client.js.gz',
    service: 'betterSidebarAgentCardBadges',
    pristineSha256: '30d0022f89c0bc4751fe6cf274cb7f3543389c27ad18ebf4e58fac4a40ad7cc4',
    patchedSha256: 'd0a9f0257e80fb3fdf6eb06a587b5b5aa985e1cfbaaf7a187ee381da0a8ac7ba',
  },
]

/**
 * The file-system facts one patch operation depends on.
 *
 * Injected rather than read from ambient state so a test can point at a fixture
 * package instead of the running profile.
 */
export interface CardPatchEnvironment {
  /** Resolve one package name to its directory, or undefined when it is absent. */
  resolvePackage(packageName: string): string | undefined
  /** Absolute directory this plugin owns for backups. */
  backupDirectory(): string
  /** Absolute directory holding the prebuilt replacements. */
  assetDirectory(): string
}

/** Directory holding the prebuilt replacements shipped with this package. */
function shippedAssets(): string {
  // Built output lives in `lib/`, one level below the package root.
  return join(dirname(dirname(fileURLToPath(import.meta.url))), 'assets', 'card-patches')
}

/** Backups of replaced bundles, under the same `$DSH_HOME` this plugin already uses. */
function shippedBackups(): string {
  const home = process.env['DSH_HOME'] !== undefined && process.env['DSH_HOME'] !== ''
    ? process.env['DSH_HOME']
    : join(homedir(), '.dsh')
  return join(home, 'agent-team-presets', 'card-patches')
}

/**
 * Resolve a package the way the running profile resolves it.
 *
 * This module is loaded from the profile's `node_modules`, so the package beside
 * it is the one the browser is served. A resolution failure is "not installed"
 * rather than an error: a profile without a target is the ordinary case.
 * @param packageName - the target package name.
 * @returns its directory, or undefined when it is absent.
 */
function resolveProfilePackage(packageName: string): string | undefined {
  try {
    const require = createRequire(import.meta.url)
    return dirname(require.resolve(`${packageName}/package.json`))
  } catch {
    return undefined
  }
}

/** The real environment: the running profile's packages and this plugin's directories. */
export const realCardPatchEnvironment: CardPatchEnvironment = {
  resolvePackage: resolveProfilePackage,
  backupDirectory: shippedBackups,
  assetDirectory: shippedAssets,
}

/**
 * Read the installed package.json version.
 * @param directory - target package directory.
 * @returns its version, or undefined when the manifest is unreadable.
 */
function installedVersion(directory: string): string | undefined {
  try {
    const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')) as { version?: unknown }
    return typeof manifest.version === 'string' ? manifest.version : undefined
  } catch {
    return undefined
  }
}

/**
 * Where the target's browser bundle lives.
 * @param directory - target package directory.
 * @returns the absolute path the client module system serves.
 */
function bundlePath(directory: string): string {
  return join(directory, 'lib', 'client.js')
}

/**
 * Hash one file's bytes.
 * @param path - absolute file path.
 * @returns the lowercase hex sha256.
 */
function sha256Of(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

/**
 * Classify one installed target without changing anything.
 * @param target - the catalog entry.
 * @param env - the file-system facts to read through.
 * @returns the row the settings page renders.
 */
export function targetState(
  target: CardPatchTarget,
  env: CardPatchEnvironment = realCardPatchEnvironment,
): CardPatchTargetView {
  const base = {
    id: target.id,
    packageName: target.packageName,
    source: target.source,
    supportedVersion: target.version,
  }
  const directory = env.resolvePackage(target.packageName)
  if (directory === undefined) {
    return { ...base, state: 'absent', detail: 'this plugin is not installed in the running profile' }
  }
  const version = installedVersion(directory)
  if (version === undefined) {
    return { ...base, state: 'absent', detail: 'its package.json could not be read' }
  }
  if (version !== target.version) {
    return {
      ...base,
      installedVersion: version,
      state: 'unsupported',
      detail: `this build ships a replacement for ${target.version}, not ${version}`,
    }
  }
  const bundle = bundlePath(directory)
  if (!existsSync(bundle)) {
    return { ...base, installedVersion: version, state: 'absent', detail: 'its browser bundle is missing' }
  }
  const digest = sha256Of(bundle)
  if (digest === target.patchedSha256) return { ...base, installedVersion: version, state: 'patched' }
  if (digest === target.pristineSha256) return { ...base, installedVersion: version, state: 'pristine' }
  return {
    ...base,
    installedVersion: version,
    state: 'foreign',
    detail: 'its browser bundle matches neither the published build nor this plugin\'s replacement',
  }
}

/**
 * Replace one target's browser bundle with the prebuilt replacement.
 *
 * The installed bytes are copied into this plugin's backup directory before the
 * replacement is written, and the write is a rename of a sibling file, so a
 * failure leaves the original in place. A target whose bundle is not the exact
 * published build is refused: restoring it later could not reproduce an edit
 * this plugin never saw.
 * @param target - the catalog entry.
 * @param env - the file-system facts to act through.
 * @returns the outcome and the resulting state.
 */
export function installCardPatch(
  target: CardPatchTarget,
  env: CardPatchEnvironment = realCardPatchEnvironment,
): CardPatchResult {
  const before = targetState(target, env)
  if (before.state === 'patched') return { ok: true, id: target.id, state: 'patched' }
  if (before.state !== 'pristine') {
    return { ok: false, id: target.id, state: before.state, ...before.detail === undefined ? {} : { detail: before.detail } }
  }
  const directory = env.resolvePackage(target.packageName)
  if (directory === undefined) return { ok: false, id: target.id, state: 'absent', detail: 'the package disappeared' }
  const asset = join(env.assetDirectory(), target.asset)
  if (!existsSync(asset)) {
    return {
      ok: false,
      id: target.id,
      state: 'pristine',
      detail: 'this installation ships no prebuilt replacement; reinstall the plugin so assets/card-patches is included',
    }
  }
  const replacement = gunzipSync(readFileSync(asset))
  if (createHash('sha256').update(replacement).digest('hex') !== target.patchedSha256) {
    return { ok: false, id: target.id, state: 'pristine', detail: 'the prebuilt replacement does not match its recorded hash' }
  }
  const bundle = bundlePath(directory)
  try {
    const backups = env.backupDirectory()
    mkdirSync(backups, { recursive: true })
    copyFileSync(bundle, join(backups, `${target.id}-${target.version}.client.js`))
    const staged = `${bundle}.card-patch.tmp`
    writeFileSync(staged, replacement)
    renameSync(staged, bundle)
  } catch (error: unknown) {
    return { ok: false, id: target.id, state: 'pristine', detail: `the replacement could not be written: ${String(error)}` }
  }
  const after = targetState(target, env)
  // The running server publishes the new bundle itself: the Web composition's
  // client-hmr transport stat-polls every client bundle and pushes a rebuild to
  // the page, which reloads that plugin in place. No server restart is involved.
  return after.state === 'patched'
    ? { ok: true, id: target.id, state: 'patched', detail: 'the page loads the replacement within a second' }
    : { ok: false, id: target.id, state: after.state, detail: 'the replaced bundle did not match its recorded hash' }
}

/**
 * Restore one target's published browser bundle from this plugin's backup.
 * @param target - the catalog entry.
 * @param env - the file-system facts to act through.
 * @returns the outcome and the resulting state.
 */
export function uninstallCardPatch(
  target: CardPatchTarget,
  env: CardPatchEnvironment = realCardPatchEnvironment,
): CardPatchResult {
  const before = targetState(target, env)
  if (before.state === 'pristine') return { ok: true, id: target.id, state: 'pristine' }
  if (before.state !== 'patched') {
    return { ok: false, id: target.id, state: before.state, ...before.detail === undefined ? {} : { detail: before.detail } }
  }
  const directory = env.resolvePackage(target.packageName)
  if (directory === undefined) return { ok: false, id: target.id, state: 'absent', detail: 'the package disappeared' }
  const backup = join(env.backupDirectory(), `${target.id}-${target.version}.client.js`)
  if (!existsSync(backup)) {
    return {
      ok: false,
      id: target.id,
      state: 'patched',
      detail: 'this plugin holds no backup of the published bundle; reinstall the target package to restore it',
    }
  }
  if (sha256Of(backup) !== target.pristineSha256) {
    return { ok: false, id: target.id, state: 'patched', detail: 'the stored backup does not match the published bundle' }
  }
  const bundle = bundlePath(directory)
  try {
    const staged = `${bundle}.card-unpatch.tmp`
    copyFileSync(backup, staged)
    renameSync(staged, bundle)
    rmSync(backup, { force: true })
  } catch (error: unknown) {
    return { ok: false, id: target.id, state: 'patched', detail: `the published bundle could not be restored: ${String(error)}` }
  }
  const after = targetState(target, env)
  return after.state === 'pristine'
    ? { ok: true, id: target.id, state: 'pristine', detail: 'the page drops the replacement within a second' }
    : { ok: false, id: target.id, state: after.state, detail: 'the restored bundle did not match its recorded hash' }
}

/**
 * Resolve one catalog entry by target id.
 * @param id - the settings page's row identity.
 * @returns the entry, or undefined for an id this build does not ship.
 */
export function findCardPatchTarget(id: string): CardPatchTarget | undefined {
  return CARD_PATCH_TARGETS.find(target => target.id === id)
}
