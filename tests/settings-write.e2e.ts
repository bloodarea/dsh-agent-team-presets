import { mkdir, readFile, symlink, writeFile } from 'node:fs/promises'
import { delimiter, resolve } from 'node:path'
import { expect, test } from 'vitest'
import { runLoaderSmoke, LOADER_SMOKE_TEST_TIMEOUT_MS } from '@deepseek-ai/dsh-loader-smoke'
import { BUILTIN_TEAM_IDS } from '../src/builtin-teams.ts'

/** One stored Session/Team selection pair. */
interface Selection {
  readonly sessionId: string
  readonly teamId: string
}

/** One settings descriptor row, narrowed to the fields this spec asserts. */
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

/** A flattened thrown value, as the driver recorded it. */
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

/** The driver's complete capture. */
interface Captured {
  readonly namespacePresent: boolean
  readonly documentPath: string
  readonly booted: CapturedRow | null
  readonly teamWrite: CapturedWrite
  readonly initialRevision: number
  readonly initial: CapturedRow | null
  readonly freshWrite: CapturedWrite
  readonly afterFreshWrite: CapturedRow | null
  readonly documentAfterFreshWrite: string
  readonly staleRevision: number
  readonly staleWrite: CapturedWrite
  readonly afterStaleWrite: CapturedRow | null
  readonly retryWrite: CapturedWrite
  readonly final: CapturedRow | null
  readonly documentFinal: string
}

/**
 * Whether one stored selection list holds the named pair.
 * @param row - captured settings row, when the namespace was served.
 * @param selection - the Session/Team pair to look for.
 * @returns whether the pair is stored.
 */
function hasSelection(row: CapturedRow | null, selection: Selection): boolean {
  return row?.value.selections?.some(
    stored => stored.sessionId === selection.sessionId && stored.teamId === selection.teamId,
  ) === true
}

/**
 * The Harness checkout the runner was pointed at.
 *
 * The shared `tsconfig.base.json` is spelled monorepo-relatively
 * (`../../../../tsconfig.base.json`), which only holds where this plugin lives
 * at `<checkout>/packages/<group>/<plugin>/`. Standalone, that path lands
 * outside the checkout, so tsx gets no `paths` map and every `@deepseek-ai/*`
 * import of the booted profile fails to resolve. `tools/test.mjs` already
 * requires `DSH_CHECKOUT`, so take the checkout from there and keep the
 * monorepo spelling as the fallback.
 * @returns the absolute checkout root.
 */
function checkoutRoot(): string {
  const checkout = process.env['DSH_CHECKOUT']
  return checkout === undefined || checkout === ''
    ? resolve(import.meta.dirname, '../../../..')
    : checkout
}

/**
 * Initialize the isolated profile the driver boots.
 *
 * The shipped `headless` template lists only the Harness bundles, so the
 * plugin row would not exist. A real installation adds the package to
 * `dsh.profile.bundles` and links it into the profile's own `node_modules`,
 * and both facts matter here:
 *
 * - The row must come from a bundle layer. `ConfigEditor.edit` composes bundle
 *   layers, then the profile patch document, then home and `--patch` overlays,
 *   and refuses a write whose composed config differs from the edited value. A
 *   row contributed by the `--patch` overlay is therefore refused as
 *   overlay-overridden before any revision fence is consulted, which would
 *   hide the behavior under test.
 * - The profile's package resolution drops a bundle's own name from its
 *   entries and expects the profile `node_modules` link to carry it, so the
 *   link is what makes the plugin importable at all.
 * @param cwd - the harness-owned process cwd; `DSH_HOME` is `<cwd>/.dsh`.
 */
async function prepareProfile(cwd: string): Promise<void> {
  const profileDir = resolve(cwd, '.dsh', 'profiles', 'headless')
  const pluginDir = resolve(profileDir, 'node_modules', 'dsh-agent-team-presets')
  await mkdir(profileDir, { recursive: true })
  await mkdir(resolve(profileDir, 'node_modules'), { recursive: true })
  await symlink(resolve(import.meta.dirname, '..'), pluginDir, 'dir')
  await writeFile(resolve(profileDir, 'package.json'), `${JSON.stringify({
    name: 'dsh-profile-headless',
    private: true,
    dependencies: { 'dsh-agent-team-presets': '*' },
    dsh: {
      profile: {
        bundles: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-headless', 'dsh-agent-team-presets'],
      },
    },
  }, null, 2)}\n`)
  // The profile patch the settings service edits; `initProfile` is skipped
  // because the manifest already exists, so the fixture owns this file.
  await writeFile(resolve(profileDir, 'cordis.patch.yml'), '[]\n')
}

test('a fresh settings revision fence lands and a stale one is refused with a conflict', async () => {
  let captured: Captured | undefined
  const smoke = await runLoaderSmoke({
    label: 'agent-team-presets settings write',
    tempDirPrefix: 'team-presets-settings-write-',
    binScript: resolve(import.meta.dirname, 'fixtures/settings-write-driver.ts'),
    libBinScript: resolve(import.meta.dirname, 'fixtures/settings-write-driver.ts'),
    configPath: resolve(import.meta.dirname, 'fixtures/settings-write.patch.yml'),
    tsconfigPath: resolve(checkoutRoot(), 'tsconfig.base.json'),
    prepare: prepareProfile,
    // `bootProductionProfile` resolves every bare package name an overlay
    // inserts, and every profile bundle, through `createRequire` anchors in the
    // checkout. `@deepseek-ai/dsh-experimental-agent-team` is only a peer
    // dependency here and `dsh-agent-team-presets` is this repository, so both
    // must be reachable from the anchors: Node's resolution consults NODE_PATH,
    // which points at the checkout's install anchor and at the parent holding
    // this repository. Nothing is installed into the repository for the test.
    env: {
      // Each source smoke owns its transpilation cache; disk cache state must not decide startup.
      TSX_DISABLE_CACHE: '1',
      NODE_PATH: [
        resolve(checkoutRoot(), 'apps/cli/node_modules'),
        resolve(import.meta.dirname, '../..'),
      ].join(delimiter),
    },
    inspect: async (cwd) => {
      captured = JSON.parse(await readFile(resolve(cwd, 'settings-write.json'), 'utf8')) as Captured
    },
  })
  console.log(smoke.stderr.trim())
  if (captured === undefined) throw new Error('the settings-write driver wrote no capture')

  // The plugin's settings row is served by the real Loader composition: the
  // bundle layer supplies an empty Team section, the plugin's own startup pass
  // then installs the three presets it ships and records them, and a real
  // settings write configures the Team the composer then selects.
  expect(captured.namespacePresent).toBe(true)
  expect(captured.booted?.ns).toBe('agent-team-presets')
  expect(captured.booted?.value.seededDefaults).toEqual([...BUILTIN_TEAM_IDS])
  expect(captured.booted?.value.teams?.map(entry => entry.id)).toEqual([...BUILTIN_TEAM_IDS])
  expect(captured.teamWrite.threw).toBe(false)
  expect(captured.initial?.ns).toBe('agent-team-presets')
  expect(captured.initial?.value.teams).toContainEqual(
    expect.objectContaining({ id: 'team-1', name: 'E2E Team' }),
  )
  // A write that does not mention a shipped preset drops it from the document:
  // the marker records that it was offered, not that it must stay installed, so
  // a deleted preset is never silently restored.
  expect(captured.initial?.value.teams?.map(entry => entry.id)).toEqual(['team-1'])
  expect(captured.initial?.value.seededDefaults).toEqual([...BUILTIN_TEAM_IDS])
  expect(captured.initial?.value.selections).toEqual([])

  // A correct client writes with the revision it just read, and the write
  // reaches the real settings document: the live value gains the selection and
  // the profile patch on disk carries it.
  expect(captured.freshWrite.threw).toBe(false)
  expect(hasSelection(captured.afterFreshWrite, { sessionId: 's-e2e', teamId: 'team-1' })).toBe(true)
  expect(captured.documentAfterFreshWrite).toContain('s-e2e')
  expect(captured.afterFreshWrite?.revision).toBeGreaterThan(captured.initialRevision)

  // The stale fence is refused as a conflict, and the refusal names the
  // revision it expected against the one the namespace now stands at — the
  // exact facts a client needs to recover instead of silently doing nothing.
  expect(captured.staleWrite.threw).toBe(true)
  expect(captured.staleWrite.error?.name).toBe('SettingsConflictError')
  expect(captured.staleWrite.error?.code).toBe('SETTINGS_CONFLICT')
  expect(captured.staleWrite.error?.expected).toBe(captured.staleRevision)
  expect(captured.staleWrite.error?.actual).toBe(captured.afterFreshWrite?.revision)
  expect(captured.staleRevision).not.toBe(captured.afterFreshWrite?.revision)
  expect(captured.staleWrite.error?.message).toContain('changed since it was read')
  // The refusal left the document alone: the fresh selection is still stored
  // and the refused one never appeared.
  expect(hasSelection(captured.afterStaleWrite, { sessionId: 's-e2e', teamId: 'team-1' })).toBe(true)
  expect(hasSelection(captured.afterStaleWrite, { sessionId: 's-stale', teamId: 'team-1' })).toBe(false)
  expect(captured.afterStaleWrite?.revision).toBe(captured.afterFreshWrite?.revision)

  // Retrying the same edit with the current revision lands, which is what the
  // recovery path depends on.
  expect(captured.retryWrite.threw).toBe(false)
  expect(hasSelection(captured.final, { sessionId: 's-stale', teamId: 'team-1' })).toBe(true)
  expect(captured.documentFinal).toContain('s-stale')
}, LOADER_SMOKE_TEST_TIMEOUT_MS)
