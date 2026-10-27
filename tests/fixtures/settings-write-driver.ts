/**
 * End-to-end driver for one real settings write through the production Loader.
 *
 * The composer's Team picker calls
 * `ctx.configForms.get('agent-team-presets').mutate([...])`, which the Host
 * turns into `SettingsForms.mutate(ns, ops, expectedRevision)`. This driver
 * calls that Host method directly against the composition a shipped profile
 * boots, and records what the real settings document did with each write: one
 * fresh revision fence, one deliberately stale fence, and the retry a client
 * makes after reading the conflict's recovery revision.
 *
 * The capture lands in the process cwd, which the spec's `inspect` callback
 * reads before the harness removes the temporary directory.
 * @module tests/fixtures/settings-write-driver
 */

import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import type { SettingsPathOp } from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-config-editor'

/** Profile name whose shipped composition this driver boots. */
const PROFILE = 'headless'

/** Namespace the presets plugin's settings row serves. */
const NS = 'agent-team-presets'

/** Selection the fresh-fence write stores. */
const FRESH_SELECTION = { sessionId: 's-e2e', teamId: 'team-1' }

/** Selection the stale-fence write attempts, and the retry then stores. */
const STALE_SELECTION = { sessionId: 's-stale', teamId: 'team-1' }

/** One Team section as the Settings page stores it. */
interface Team {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly captain: {
    readonly name: string
    readonly color: string
    readonly description: string
    readonly toolMode: string
    readonly tools: readonly string[]
    readonly systemPrompt: string
  }
  readonly members: readonly unknown[]
}

/** The Team the Settings page configures before the composer picks it. */
const TEAM: Team = {
  id: 'team-1',
  name: 'E2E Team',
  description: '',
  captain: { name: 'captain', color: '', description: '', toolMode: 'all', tools: [], systemPrompt: '' },
  members: [],
}

/** One stored Session/Team selection pair. */
interface Selection {
  readonly sessionId: string
  readonly teamId: string
}

/** The plugin's descriptor projection, narrowed to the fields the spec asserts. */
interface CapturedRow {
  readonly ns: string
  readonly revision: number
  readonly value: {
    readonly teams?: ReadonlyArray<{ readonly id?: string; readonly name?: string }>
    readonly selections?: ReadonlyArray<Selection>
    /** Identities of the shipped default presets this deployment has been offered. */
    readonly seededDefaults?: readonly string[]
  }
}

/** A flattened thrown value, so the spec asserts on wire-visible fields. */
interface CapturedFailure {
  readonly name: string
  readonly message: string
  readonly code: string | null
  readonly expected: number | null
  readonly actual: number | null
}

/** Whether one settings write resolved or was refused. */
interface CapturedWrite {
  readonly threw: boolean
  readonly error: CapturedFailure | null
}

/** Inputs the production-profile helper accepts; typed here because it is loaded by path. */
interface ProductionProfileOptions {
  /** Diagnostic prefix for profile and Loader failures. */
  readonly binName: string
  /** Shipped profile whose bundle layers form the tree. */
  readonly profile: string
  /** Test overlay files applied above the shipped bundle layers. */
  readonly overlayPaths: readonly string[]
}

/** The production-profile boot helper. */
type BootProductionProfile = (options: ProductionProfileOptions) => Promise<Context>

/**
 * Load the real `bootProductionProfile` helper.
 *
 * The monorepo spelling of this path (`../../../../test-support/loader-smoke/...`)
 * is correct only where this plugin lives at
 * `<checkout>/packages/<group>/<plugin>/`. Checked out outside that tree, the
 * same specifier resolves to a nonexistent sibling of the checkout and the
 * subprocess dies with ERR_MODULE_NOT_FOUND, so resolve the helper through the
 * checkout the runner already requires, keeping the monorepo spelling as the
 * fallback for a monorepo-local checkout.
 * @returns the boot helper.
 */
async function loadBootProductionProfile(): Promise<BootProductionProfile> {
  const checkout = process.env['DSH_CHECKOUT']
  const monorepoRelative = fileURLToPath(
    new URL('../../../../test-support/loader-smoke/tests/fixtures/production-profile.ts', import.meta.url),
  )
  const candidates = [
    ...checkout === undefined || checkout === ''
      ? []
      : [join(checkout, 'packages/test-support/loader-smoke/tests/fixtures/production-profile.ts')],
    monorepoRelative,
  ]
  const found = candidates.find(candidate => existsSync(candidate))
  if (found === undefined) {
    throw new Error(`settings-write driver: no production-profile helper; tried:\n${candidates.join('\n')}`)
  }
  const loaded = await import(pathToFileURL(found).href) as { bootProductionProfile?: BootProductionProfile }
  if (loaded.bootProductionProfile === undefined) {
    throw new Error(`settings-write driver: ${found} exports no bootProductionProfile`)
  }
  return loaded.bootProductionProfile
}

/**
 * Flatten a thrown value into the fields a remote client receives.
 * @param error - the thrown value.
 * @returns the error name and message, plus the conflict fields when present.
 */
function captureFailure(error: unknown): CapturedFailure {
  const failure = (typeof error === 'object' && error !== null ? error : {}) as {
    readonly name?: unknown
    readonly code?: unknown
    readonly expected?: unknown
    readonly actual?: unknown
  }
  return {
    name: typeof failure.name === 'string' ? failure.name : 'UnknownError',
    message: error instanceof Error ? error.message : String(error),
    code: typeof failure.code === 'string' ? failure.code : null,
    expected: typeof failure.expected === 'number' ? failure.expected : null,
    actual: typeof failure.actual === 'number' ? failure.actual : null,
  }
}

/**
 * Run one settings write and record whether it landed.
 * @param write - the mutate call under test.
 * @returns the outcome the spec asserts on.
 */
async function attempt(write: () => Promise<void>): Promise<CapturedWrite> {
  try {
    await write()
    return { threw: false, error: null }
  } catch (error) {
    return { threw: true, error: captureFailure(error) }
  }
}

/**
 * Read the presets row from the live settings service.
 * @param context - booted Loader root.
 * @returns the captured row, or null when the namespace is not served.
 */
function readRow(context: Context): CapturedRow | null {
  const row = context.settings.describe().find(candidate => candidate.ns === NS)
  return row === undefined
    ? null
    : { ns: row.ns, revision: row.revision, value: row.value as CapturedRow['value'] }
}

/**
 * Wait until the plugin's startup reconcile has installed the shipped defaults.
 *
 * That pass is scheduled asynchronously at activation, so the section a client
 * reads is only stable once its marker is present. Polling the observable
 * document — rather than sleeping a fixed time — is what makes every later
 * assertion about the stored Teams deterministic instead of a race with the
 * Host's own timer.
 * @param context - booted Loader root.
 * @returns the settled row, or null when the namespace is not served.
 */
async function settledRow(context: Context): Promise<CapturedRow | null> {
  const deadline = Date.now() + 5000
  for (;;) {
    const row = readRow(context)
    if (row === null || (row.value.seededDefaults?.length ?? 0) > 0) return row
    if (Date.now() > deadline) {
      throw new Error('the shipped default presets were never installed by the startup reconcile')
    }
    await new Promise<void>(resolve => { setTimeout(resolve, 10) })
  }
}

/**
 * The exact edit a correct client sends when the composer picks a Team.
 * @param selection - the Session/Team pair to store.
 * @returns the ordered path ops handed to the Host settings service.
 */
function selectionOps(selection: Selection): SettingsPathOp[] {
  return [{ op: 'set', path: ['selections'], value: [selection] }]
}

/**
 * The edit the Settings page sends when it saves the Team the composer picks.
 * @param team - the Team section to store.
 * @returns the ordered path ops handed to the Host settings service.
 */
function teamOps(team: Team): SettingsPathOp[] {
  return [{ op: 'set', path: ['teams'], value: [team] }]
}

const configPath = process.argv[2]
if (configPath === undefined) throw new Error('settings-write fixture requires an overlay')

const startupBegan = Date.now()
console.error('settings-write startup: importing profile bootstrap')
const bootProductionProfile = await loadBootProductionProfile()
console.error('settings-write startup: bootstrap imported after ' + (Date.now() - startupBegan) + 'ms')
const ctx = await bootProductionProfile({
  binName: 'agent-team-presets-settings-write',
  profile: PROFILE,
  overlayPaths: [configPath],
})
console.error('settings-write startup: profile ready after ' + (Date.now() - startupBegan) + 'ms')

try {
  // The namespace is served by the composition, with the Team section at the
  // bundle layer's empty default; the plugin's own startup pass then installs
  // the three presets it ships. Read the row once that pass has landed.
  const booted = await settledRow(ctx)
  const documentPath = ctx.configEditor.documentPath

  // A Team is configured the way the Settings page configures one: a real
  // settings write into the same document. The fixture cannot supply the Team
  // through the `--patch` overlay, because the config editor then refuses every
  // write to that row as overlay-overridden before any revision fence is read.
  const teamWrite = await attempt(() => ctx.settings.mutate(NS, teamOps(TEAM), booted?.revision ?? 0))

  // The descriptor a client reads before the composer's own write.
  const initial = readRow(ctx)
  const initialRevision = initial?.revision ?? 0

  const freshWrite = await attempt(() => ctx.settings.mutate(NS, selectionOps(FRESH_SELECTION), initialRevision))
  const afterFreshWrite = readRow(ctx)
  // Captured here as well as at the end: the retry below replaces the whole
  // `selections` array, so only this earlier text can show the fresh value.
  const documentAfterFreshWrite = await readFile(documentPath, 'utf8')

  // The stale fence is the revision read BEFORE the fresh write: once that
  // write landed, the namespace stands one revision higher, so this expected
  // value can no longer match. The capture records both numbers so the spec can
  // prove the mismatch was real rather than assumed.
  const staleRevision = initialRevision
  const staleWrite = await attempt(() => ctx.settings.mutate(NS, selectionOps(STALE_SELECTION), staleRevision))
  // Read before the retry, so the spec can show the refused write changed
  // nothing rather than inferring it from the retry's own outcome.
  const afterStaleWrite = readRow(ctx)
  const retryWrite = await attempt(
    () => ctx.settings.mutate(NS, selectionOps(STALE_SELECTION), afterFreshWrite?.revision ?? 0),
  )

  const final = readRow(ctx)
  const documentFinal = await readFile(documentPath, 'utf8')

  await writeFile('settings-write.json', JSON.stringify({
    namespacePresent: booted !== null,
    documentPath,
    booted,
    teamWrite,
    initialRevision,
    initial,
    freshWrite,
    afterFreshWrite,
    documentAfterFreshWrite,
    staleRevision,
    staleWrite,
    afterStaleWrite,
    retryWrite,
    final,
    documentFinal,
  }, null, 2))
} finally {
  await ctx.fiber.dispose()
}
