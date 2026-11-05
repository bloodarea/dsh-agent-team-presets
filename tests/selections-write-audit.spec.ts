/**
 * Every write entry that can reach the stored `agent-team-presets.selections`
 * records — the Team each Session has selected.
 *
 * The audit question is narrow: which user actions, and which asynchronous
 * paths, are able to change a Session's Team selection? The tests below answer
 * it against the real controller and the real startup reconcile pass, and they
 * assert the settings payload that actually reached the Host: a returned
 * boolean or a "no throw" says nothing about what was written.
 *
 * Two conditions this file keeps strictly apart, because conflating them would
 * let a real regression hide behind an allowed write:
 * - a built-in Team Skill version upgrade rewriting skill BINDINGS is allowed —
 *   it writes the Team record (or the skill store), never a Session selection;
 * - any change to the user's current Team SELECTION that the user did not ask
 *   for is forbidden, and no asynchronous path may produce one.
 */

import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SettingsNamespaceView, SettingsPathOpView } from '@deepseek-ai/dsh-api-remotes/client'
import type { ConfigForm, ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import { TeamPresetsController } from '../src/client/team-presets-controller.ts'
import { selectedTeam, withSelection } from '../src/presets.ts'
import { teamSettingsReconcile } from '../src/settings-reconcile.ts'
import type { Config } from '../src/config.ts'
import type {
  TeamAgentPreset, TeamCategory, TeamCategoryAssignment, TeamPreset, TeamPresetsSection, TeamSelectionRecord,
} from '../src/types.ts'
import { routedCaptain } from './fixtures/team-presets.ts'

/** The namespace this plugin owns, spelled as the controller spells it. */
const NS = 'agent-team-presets'

/** One stored Session/Team pair, as the Host document carries it. */
type Selection = { sessionId: string; teamId: string }

/** One empty captain slot, so a test names only the fields it exercises. */
const CAPTAIN: TeamPreset['captain'] = {
  name: 'captain', color: '', description: '', toolMode: 'all', tools: [], systemPrompt: '',
}

/** One member slot carrying the supplied fields over the empty defaults. */
function member(overrides: Partial<TeamAgentPreset> = {}): TeamAgentPreset {
  return { ...CAPTAIN, provider: '', model: '', reasoningEffort: '', ...overrides }
}

/** One Team preset over the defaults a case does not exercise. */
function team(id: string, name: string, extra: Partial<TeamPreset> = {}): TeamPreset {
  return { id, name, description: '', captain: CAPTAIN, members: [], ...extra }
}

/**
 * A stored section as the Host document really carries it.
 *
 * The Teams and their Session selections are the two fields the schema
 * declares; `categories` and `teamCategories` are the local view fields stored
 * beside them, which the page reads from the same document.
 */
type StoredValue = TeamPresetsSection & {
  readonly categories?: readonly TeamCategory[]
  readonly teamCategories?: readonly TeamCategoryAssignment[]
}

/** One settings write as the scripted Host received it. */
interface Write {
  readonly ops: readonly SettingsPathOpView[]
  readonly revision: number | undefined
}

/** The stored section one scripted Host document holds, and every write it got. */
interface ScriptedHost {
  /** The section the Host stores. */
  value: TeamPresetsSection
  /** The revision a write must fence on. */
  revision: number
  /** Whether the Host document accepts writes. */
  writable: boolean
  /** Whether the deployment composed the `agent-team-presets` namespace. */
  served: boolean
  /** Every write this Host received, from any face of the plugin, in order. */
  readonly writes: Write[]
  /** How many `settings.describe` reads the client performed. */
  reads: number
  /** The text of a refusal answered to a stale fence. */
  refusalMessage: string
  /** How many more writes to answer with a transport failure. */
  rejections: number
  /** The text of that transport failure. */
  rejectionMessage: string
  /** How many more describe reads to answer as failed. */
  describeFails: number
  /** Runs before each write is fenced, so a case can land a foreign write first. */
  beforeWrite: ((attempt: number) => void) | undefined
  /** When set, every write waits on it before it is fenced. */
  gate: Promise<void> | undefined
}

/** One scripted Host document with every default a case does not script. */
function scriptedHost(overrides: Partial<ScriptedHost> = {}): ScriptedHost {
  return {
    value: { teams: [team('team-1', 'Team')], selections: [] },
    revision: 4,
    writable: true,
    served: true,
    writes: [],
    reads: 0,
    refusalMessage: 'settings conflict',
    rejections: 0,
    rejectionMessage: 'connection lost',
    describeFails: 0,
    beforeWrite: undefined,
    gate: undefined,
    ...overrides,
  }
}

/**
 * Land a selection write the way a SECOND browser tab lands one.
 *
 * This is the concurrent writer the retry must survive: it applies the record
 * to the Host document and moves the revision, so every write still fenced on
 * the earlier revision is genuinely stale afterwards.
 * @param host - the Host document the write lands in.
 * @param selection - the Session/Team pair the other client stored.
 */
function foreignWrite(host: ScriptedHost, selection: Selection): void {
  host.value = {
    ...host.value,
    selections: withSelection(host.value.selections, selection.sessionId, selection.teamId),
  }
  host.revision += 1
}

/** Every path one settings write set, as `a.b` strings. */
function pathsOf(write: Write): string[] {
  return write.ops.map(op => op.path.join('.'))
}

/**
 * The `selections` payload one settings write carried.
 * @param write - the captured write.
 * @returns the stored record list, or undefined when the write never named it.
 */
function selectionsIn(write: Write | undefined): readonly Selection[] | undefined {
  const op = write?.ops.find(row => row.path.length === 1 && row.path[0] === 'selections')
  return op !== undefined && op.op === 'set' ? op.value as readonly Selection[] : undefined
}

/**
 * One page mounted over a scripted Host document.
 *
 * The two faces of the real client are both here, because a selection write has
 * to pass through them: the shared settings form (drafts, saves, category
 * writes) and the describe mirror the selection write reads its section and its
 * revision from. Both forward to the same Host document, so `host.writes` is one
 * complete record of everything the plugin sent.
 */
function lane(options: {
  /** The stored section the Host holds. */
  value?: StoredValue
  /** The revision the Host document stands at. */
  revision?: number
  /** Whether the Host document accepts writes. */
  writable?: boolean
  /** Whether the deployment composed the namespace at all. */
  served?: boolean
  /** Whether the describe mirror has answered yet; false models a page before its first answer. */
  answered?: boolean
  /** The shared form's own sync state. */
  formStatus?: ConfigFormSnapshot<TeamPresetsSection>['status']
} = {}) {
  const host = scriptedHost({
    ...options.value === undefined ? {} : { value: options.value },
    ...options.revision === undefined ? {} : { revision: options.revision },
    ...options.writable === undefined ? {} : { writable: options.writable },
    ...options.served === undefined ? {} : { served: options.served },
  })
  const formListeners = new Set<() => void>()
  const mirrorListeners = new Set<() => void>()
  const notify = (listeners: Set<() => void>): void => { for (const listener of [...listeners]) listener() }

  /** The namespace row the Host serves right now. */
  const row = (): SettingsNamespaceView => ({
    ns: NS,
    schema: {},
    value: host.value as never,
    applies: 'live',
    secrets: [],
    revision: host.revision,
  })

  /** The whole describe answer the Host would send right now. */
  const describeRow = () => ({
    namespaces: host.served ? [row()] : [],
    writable: host.writable,
    hasDocument: true,
  })

  /** The answer the mirror holds; undefined until its first read lands. */
  let held: ReturnType<typeof describeRow> | undefined = (options.answered ?? true) ? describeRow() : undefined

  /** Fold one write answer into the held view, exactly as the shared mirror does. */
  const acceptView = (view: SettingsNamespaceView): void => {
    const current = held ?? describeRow()
    held = {
      ...current,
      namespaces: [view, ...current.namespaces.filter(entry => entry.ns !== view.ns)],
    }
    notify(mirrorListeners)
  }

  /** The Host's side of one write: fence, apply, answer with the new view. */
  const write = async (ops: readonly SettingsPathOpView[], revision: number | undefined) => {
    host.writes.push({ ops, revision })
    if (host.gate !== undefined) await host.gate
    host.beforeWrite?.(host.writes.length)
    if (host.rejections > 0) {
      host.rejections -= 1
      throw new Error(host.rejectionMessage)
    }
    if (!host.writable || !host.served) throw new Error('settings document is read-only')
    if (revision !== host.revision) {
      return { ok: false as const, error: { code: 'settings/conflict', message: host.refusalMessage } }
    }
    let next = host.value as Record<string, unknown>
    for (const op of ops) {
      if (op.op === 'set' && op.path.length === 1 && typeof op.path[0] === 'string') {
        next = { ...next, [op.path[0]]: op.value }
      }
    }
    host.value = next as TeamPresetsSection
    host.revision += 1
    return { ok: true as const, value: row() }
  }

  const form: ConfigForm<TeamPresetsSection> = {
    getSnapshot: () => ({
      status: options.formStatus ?? 'ready',
      value: host.value,
      base: undefined,
      user: undefined,
      revision: host.revision,
      writable: host.writable,
      mode: 'host',
    }),
    subscribe: (listener) => {
      formListeners.add(listener)
      return () => { formListeners.delete(listener) }
    },
    // The shared form's own write path reaches the same Host method.
    mutate: async (ops, revision) => {
      const answer = await write(ops, revision)
      if (answer.ok === false) return false
      acceptView(answer.value)
      notify(formListeners)
      return true
    },
    set: async () => true,
    unset: async () => true,
  }

  const partial = {
    configForms: {
      get: () => form,
      describe: () => ({
        getSnapshot: () => held === undefined
          ? { status: 'loading' as const, view: undefined, error: null }
          : { status: 'ready' as const, view: held, error: null },
        subscribe: (listener: () => void) => {
          mirrorListeners.add(listener)
          return () => { mirrorListeners.delete(listener) }
        },
        ensure: () => Promise.resolve(),
        acceptView,
      }),
    },
    remote: {
      session: {
        modelCatalog: () => Promise.resolve({ ok: true as const, value: { default: undefined, routableProviders: [], failures: [], groups: [] } }),
      },
      settings: {
        describe: async () => {
          host.reads += 1
          if (host.describeFails > 0) {
            host.describeFails -= 1
            return { ok: false as const, error: { message: 'describe unavailable' } }
          }
          return { ok: true as const, value: describeRow() }
        },
        mutate: (ns: string, ops: readonly SettingsPathOpView[], revision: number | undefined) => {
          // A selection write names its namespace; a lane never serves another one.
          expect(ns).toBe(NS)
          return write(ops, revision)
        },
      },
      teamPresets: {
        catalog: () => Promise.resolve({ ok: true as const, value: { tools: [] } }),
        execution: (_signal: AbortSignal) => (async function* () { /* no frame */ })(),
      },
    },
  }
  const ctx = new Context()
  Object.defineProperty(ctx, 'configForms', { value: partial.configForms })
  Object.defineProperty(ctx, 'remote', { value: partial.remote })
  return {
    host,
    form,
    /** Republish the shared form's sync state, as a Host settings push does. */
    publishForm: () => notify(formListeners),
    /** Republish the describe mirror, as a Host settings push does. */
    publishMirror: () => notify(mirrorListeners),
    controller: new TeamPresetsController(ctx as ClientContext),
  }
}

/** Let every pending microtask settle. */
async function settle(): Promise<void> {
  await new Promise<void>(resolve => { setTimeout(resolve, 0) })
}

/**
 * One scripted Host settings service for the startup pass.
 *
 * The whole stored section is kept, not just the two fields the pass writes, so
 * a case can prove what the patch left alone: the Host deep-merges a patch onto
 * the document (`mergeLayers`), and an array a patch never names keeps every
 * entry it had, in the order it had.
 */
function reconcileLane(section: TeamPresetsSection, options: {
  /** Identities of the shipped defaults this deployment was already offered. */
  seeded?: readonly string[]
  /** The reader's own categories. */
  categories?: readonly TeamCategory[]
  /** The stored `teamId → categoryId` memberships. */
  teamCategories?: readonly TeamCategoryAssignment[]
} = {}) {
  const ctx = new Context()
  let stored = section
  let revision = 0
  const patches: Record<string, unknown>[] = []
  const update = vi.fn(async (_ns: string, patch: Record<string, unknown>, expected?: number) => {
    patches.push(patch)
    if (expected !== revision) throw new Error('revision conflict')
    // A patch the Host applies: named fields replace, unnamed fields keep their
    // stored value — which is exactly what `selections` relies on.
    stored = { ...stored, ...patch } as TeamPresetsSection
    revision += 1
  })
  ctx.provide('settings', { describe: () => [{ ns: NS, revision }], update })
  const config: Config = {
    teams: { get: () => stored.teams },
    selections: { get: () => stored.selections },
    seededDefaults: { get: () => [...(options.seeded ?? [])] },
    categories: { get: () => [...(options.categories ?? [])] },
    teamCategories: { get: () => [...(options.teamCategories ?? [])] },
    freshProvider: 'spawn',
    forkProvider: 'fork',
  }
  return {
    update,
    patches,
    stored: () => stored,
    reconcile: teamSettingsReconcile(ctx, config, NS),
  }
}

/** Every shipped identity, so the defaults are already installed and the pass must not re-add them. */
const SEEDED = ['audit', 'discovery', 'engineering', 'fullstack', 'lightweight', 'planning', 'research', 'standard', 'workflow']

describe('the Team selection write surface', () => {
  it('writes one explicit Team click as a single selections op fenced on the stored revision', async () => {
    const page = lane({ revision: 7, value: { teams: [team('team-1', 'Team')], selections: [{ sessionId: 's1', teamId: 'team-1' }] } })
    await page.controller.selectTeam('s2', 'team-9')

    expect(page.host.writes).toHaveLength(1)
    const [write] = page.host.writes
    // The whole payload, not just "a write happened": one set op, the exact
    // record list, and the fence the document stood at when the user clicked.
    expect(write?.ops).toEqual([{
      op: 'set',
      path: ['selections'],
      value: [{ sessionId: 's1', teamId: 'team-1' }, { sessionId: 's2', teamId: 'team-9' }],
    }])
    expect(write?.revision).toBe(7)
    expect(page.host.value.selections).toEqual([
      { sessionId: 's1', teamId: 'team-1' }, { sessionId: 's2', teamId: 'team-9' },
    ])
    expect(page.controller.store.getSnapshot().selectionFailure).toBeUndefined()
    page.controller.dispose()
  })

  it('writes one member click as a single selections op naming the stable role', async () => {
    const page = lane({
      revision: 5,
      value: {
        teams: [{ ...team('team-1', 'Team'), members: [member({ name: 'reviewer', id: 'role-reviewer' })] }],
        selections: [{ sessionId: 's1', teamId: 'team-1' }],
      },
    })
    await page.controller.selectMember('s1', 'team-1', 'role-reviewer')

    // The whole payload again: the role identity, the fence, and no second op.
    expect(page.host.writes).toHaveLength(1)
    expect(page.host.writes[0]?.ops).toEqual([{
      op: 'set',
      path: ['selections'],
      value: [{ sessionId: 's1', teamId: 'team-1', roleId: 'role-reviewer' }],
    }])
    expect(page.host.writes[0]?.revision).toBe(5)
    expect(page.host.value.selections).toEqual([
      { sessionId: 's1', teamId: 'team-1', roleId: 'role-reviewer' },
    ])
    // The accepted answer is folded back, so the composer shows the member
    // without waiting for a reload.
    expect(page.controller.store.getSnapshot().selections).toEqual([
      { sessionId: 's1', teamId: 'team-1', roleId: 'role-reviewer' },
    ])
    expect(page.controller.store.getSnapshot().selectionFailure).toBeUndefined()
    page.controller.dispose()
  })

  it('clears only the clicked Session\'s role when its captain is selected', async () => {
    const page = lane({
      value: {
        teams: [{ ...team('team-1', 'Team'), members: [member({ name: 'reviewer', id: 'role-reviewer' })] }],
        selections: [
          { sessionId: 's1', teamId: 'team-1', roleId: 'role-reviewer' },
          { sessionId: 's2', teamId: 'team-1', roleId: 'role-reviewer' },
        ],
      },
    })
    await page.controller.selectTeam('s1', 'team-1')

    expect(page.host.writes[0]?.ops).toEqual([{
      op: 'set',
      path: ['selections'],
      value: [
        { sessionId: 's2', teamId: 'team-1', roleId: 'role-reviewer' },
        { sessionId: 's1', teamId: 'team-1' },
      ],
    }])
    expect(page.host.value.selections).toEqual([
      { sessionId: 's2', teamId: 'team-1', roleId: 'role-reviewer' },
      { sessionId: 's1', teamId: 'team-1' },
    ])
    page.controller.dispose()
  })

  it('sends no selections op for any page action other than an explicit Team click', async () => {
    const page = lane({
      value: {
        teams: [{ ...team('team-1', 'Team'), members: [member({ name: 'reviewer', id: 'role-reviewer' })] }],
        selections: [{ sessionId: 's1', teamId: 'team-1' }],
        categories: [
          { id: 'cat-operations', name: 'Operations', order: 1 },
          { id: 'cat-review', name: 'Review', order: 2 },
        ],
        teamCategories: [{ teamId: 'team-1', categoryId: 'cat-operations' }],
      },
    })
    const controller = page.controller
    // Every non-selection page action the settings surface offers, driven
    // end to end: draft editing, a save, the whole category surface, a shipped
    // defaults restore, an export, a catalogue refresh, and a discard.
    controller.createTeam()
    controller.duplicateTeam(0)
    controller.addMember(0)
    controller.patchTeam(0, { name: 'Edited' })
    controller.patchCaptain(0, { name: 'Edited captain' })
    controller.patchMember(0, 0, { name: 'Edited member' })
    controller.removeMember(0, 0)
    controller.removeTeam(2)
    await controller.save()
    expect(await controller.addCategory('Delivery')).toBe(true)
    expect(controller.store.getSnapshot().categories).toHaveLength(3)
    expect(await controller.setCategory('team-1', 'cat-review')).toBe(true)
    expect(await controller.renameCategory('cat-review', 'Renamed')).toBe(true)
    expect(await controller.moveCategory('cat-review', -1)).toBe(true)
    expect(await controller.removeCategory('cat-operations')).toBe(true)
    expect(controller.restoreDefaults()).toBe('restored')
    controller.discard()
    expect(controller.exportTeam(0)).toEqual(expect.any(String))
    controller.loadCatalogue()
    await settle()

    const paths = page.host.writes.flatMap(pathsOf)
    expect(paths.length).toBeGreaterThan(0)
    // Nothing above may name the selection records at all.
    expect(paths).not.toContain('selections')
    expect(new Set(paths)).toEqual(new Set(['teams', 'categories', 'teamCategories']))
    expect(page.host.value.selections).toEqual([{ sessionId: 's1', teamId: 'team-1' }])

    // The one action that does write them is the composer's explicit click.
    await controller.selectTeam('s2', 'team-1')
    expect(pathsOf(page.host.writes.at(-1) ?? { ops: [], revision: undefined })).toEqual(['selections'])
    expect(page.host.value.selections).toEqual([
      { sessionId: 's1', teamId: 'team-1' }, { sessionId: 's2', teamId: 'team-1' },
    ])
    controller.dispose()
  })
})

describe('the startup reconcile and a reopened page', () => {
  it('rewrites only teams and seededDefaults and leaves every stored selection in place', async () => {
    const selections: readonly TeamSelectionRecord[] = [
      { sessionId: 's1', teamId: 'team-1' },
      { sessionId: 's2', teamId: 'team-2' },
      { sessionId: 's3', teamId: 'team-1' },
    ]
    // A Team stored while captains still owned a route: the pass really repairs
    // something, so the write below is not vacuous.
    const section: TeamPresetsSection = {
      teams: [team('team-1', 'Team', { captain: { ...CAPTAIN, ...routedCaptain() } })],
      selections,
    }
    const host = reconcileLane(section, { seeded: SEEDED })
    await host.reconcile.request()

    expect(host.patches).toHaveLength(1)
    const patch = host.patches[0] ?? {}
    // The complete field list the pass may write.
    expect(Object.keys(patch).sort()).toEqual(['seededDefaults', 'teams'])
    expect(patch).not.toHaveProperty('selections')
    // And the document the Host now holds still carries all three records, in
    // the order they were written: nothing added, removed, or reordered.
    expect(host.stored().selections).toEqual(selections)
    expect(host.stored().teams[0]?.captain).not.toHaveProperty('provider')
    host.reconcile.dispose()
  })

  it('prunes dead category memberships without ever naming the selections', async () => {
    const selections: readonly TeamSelectionRecord[] = [{ sessionId: 's1', teamId: 'team-1' }]
    const section: TeamPresetsSection = {
      teams: [team('team-1', 'Team', { captain: { ...CAPTAIN, ...routedCaptain() } })],
      selections,
    }
    // A membership naming a category this reader deleted: the pass prunes it,
    // so the third field of its patch is exercised too.
    const host = reconcileLane(section, {
      seeded: SEEDED,
      categories: [],
      teamCategories: [{ teamId: 'team-1', categoryId: 'cat-gone' }],
    })
    await host.reconcile.request()

    expect(host.patches).toHaveLength(1)
    const patch = host.patches[0] ?? {}
    expect(Object.keys(patch).sort()).toEqual(['seededDefaults', 'teamCategories', 'teams'])
    expect(patch).not.toHaveProperty('selections')
    expect(patch['teamCategories']).toEqual([])
    expect(host.stored().selections).toEqual(selections)
    host.reconcile.dispose()
  })

  it('reopening the settings page over the same document writes no selection and keeps their order', async () => {
    const selections: readonly TeamSelectionRecord[] = [
      { sessionId: 's2', teamId: 'team-2' },
      { sessionId: 's1', teamId: 'team-1' },
    ]
    // The page the user closed, then reopened: a second controller over the
    // document the first one left behind. Both stay mounted, as an HMR reload
    // of the client module leaves the Host document exactly where it was.
    const first = lane({ value: { teams: [team('team-1', 'Team'), team('team-2', 'Two')], selections } })
    first.publishForm()
    first.publishMirror()
    const second = lane({ value: { teams: [team('team-1', 'Team'), team('team-2', 'Two')], selections } })
    second.publishForm()
    second.publishMirror()
    second.controller.loadCatalogue()
    await settle()

    expect(first.host.writes).toHaveLength(0)
    expect(second.host.writes).toHaveLength(0)
    // Order is the stored order, not a re-sorted projection.
    expect(second.controller.store.getSnapshot().selections).toEqual(selections)
    expect(second.host.value.selections).toEqual(selections)
    first.controller.dispose()
    second.controller.dispose()
  })

  it('a settings push into a mounted page writes no selection', async () => {
    const page = lane({ value: { teams: [team('team-1', 'Team')], selections: [{ sessionId: 's1', teamId: 'team-1' }] } })
    // The Host reports a document change that belongs to nobody's selection
    // write: a Team saved by an Agent tool, a catalogue refresh, a reload.
    page.host.value = { ...page.host.value, teams: [team('team-1', 'Renamed')] }
    page.host.revision += 1
    page.publishForm()
    page.publishMirror()
    page.host.value = { ...page.host.value, teams: [team('team-1', 'Renamed again')] }
    page.host.revision += 1
    page.publishMirror()

    expect(page.host.writes).toHaveLength(0)
    expect(page.host.value.selections).toEqual([{ sessionId: 's1', teamId: 'team-1' }])
    page.controller.dispose()
  })
})

describe('selection writes under a concurrent writer', () => {
  it('retries a stale fence and preserves another Session\'s concurrently written selection', async () => {
    const page = lane({ revision: 4, value: { teams: [team('team-1', 'Team')], selections: [{ sessionId: 's1', teamId: 'team-1' }] } })
    // The other tab stores a selection for s9 while this page holds revision 4:
    // the Host moves to revision 5, so this page's fence is genuinely stale.
    page.host.beforeWrite = (attempt) => {
      if (attempt === 1) foreignWrite(page.host, { sessionId: 's9', teamId: 'team-8' })
    }

    await page.controller.selectTeam('s2', 'team-9')

    expect(page.host.writes).toHaveLength(2)
    // The refused attempt built its array from the section it held before the
    // other tab wrote: it never saw s9.
    expect(selectionsIn(page.host.writes[0])).toEqual([
      { sessionId: 's1', teamId: 'team-1' }, { sessionId: 's2', teamId: 'team-9' },
    ])
    expect(page.host.writes[0]?.revision).toBe(4)
    // The retry carries the recovered revision AND the section that read
    // republished, so the other Session's record is rebuilt into the payload
    // instead of being overwritten by the array the first attempt built.
    expect(page.host.writes[1]?.revision).toBe(5)
    expect(selectionsIn(page.host.writes[1])).toEqual([
      { sessionId: 's1', teamId: 'team-1' },
      { sessionId: 's9', teamId: 'team-8' },
      { sessionId: 's2', teamId: 'team-9' },
    ])
    // The retry is fed by a recovery read of the document the Host holds now.
    expect(page.host.reads).toBe(1)
    // And the Host really holds it: the concurrent record was not clobbered.
    expect(page.host.value.selections).toEqual([
      { sessionId: 's1', teamId: 'team-1' },
      { sessionId: 's9', teamId: 'team-8' },
      { sessionId: 's2', teamId: 'team-9' },
    ])
    expect(page.controller.store.getSnapshot().selections).toEqual(page.host.value.selections)
    expect(page.controller.store.getSnapshot().selectionFailure).toBeUndefined()
    page.controller.dispose()
  })

  it('retries a failed transport and preserves another Session\'s concurrently written selection', async () => {
    const page = lane({ revision: 4, value: { teams: [team('team-1', 'Team')], selections: [{ sessionId: 's1', teamId: 'team-1' }] } })
    page.host.rejections = 1
    page.host.beforeWrite = (attempt) => {
      if (attempt === 1) foreignWrite(page.host, { sessionId: 's9', teamId: 'team-8' })
    }

    await page.controller.selectTeam('s2', 'team-9')

    expect(page.host.writes).toHaveLength(2)
    expect(page.host.writes[1]?.revision).toBe(5)
    expect(selectionsIn(page.host.writes[1])).toEqual([
      { sessionId: 's1', teamId: 'team-1' },
      { sessionId: 's9', teamId: 'team-8' },
      { sessionId: 's2', teamId: 'team-9' },
    ])
    expect(page.host.value.selections).toHaveLength(3)
    expect(page.controller.store.getSnapshot().selectionFailure).toBeUndefined()
    page.controller.dispose()
  })

  it('reports a conflict it could not win and never claims a record the Host does not hold', async () => {
    const page = lane({ revision: 4, value: { teams: [team('team-1', 'Team')], selections: [{ sessionId: 's1', teamId: 'team-1' }] } })
    page.host.refusalMessage = 'Config field "selections" is not volatile'
    // A second tab writes again between the refused attempt and its retry, so
    // the retry loses that race too.
    page.host.beforeWrite = (attempt) => {
      if (attempt === 1) foreignWrite(page.host, { sessionId: 's9', teamId: 'team-8' })
      if (attempt > 1) foreignWrite(page.host, { sessionId: 's8', teamId: 'team-7' })
    }

    await page.controller.selectTeam('s2', 'team-9')

    expect(page.host.writes).toHaveLength(2)
    // Even the losing retry carried the record the other tab wrote.
    expect(selectionsIn(page.host.writes[1])?.map(row => row.sessionId)).toEqual(['s1', 's9', 's2'])
    expect(page.controller.store.getSnapshot().selectionFailure).toEqual({
      kind: 'refused', sessionId: 's2', teamId: 'team-9', detail: 'Config field "selections" is not volatile',
    })
    // The control shows the document the Host really holds — including the
    // other tabs' records — never the selection this client failed to store.
    expect(page.controller.store.getSnapshot().selections).toEqual(page.host.value.selections)
    expect(page.controller.store.getSnapshot().selections.map(row => row.sessionId)).toEqual(['s1', 's9', 's8'])
    page.controller.dispose()
  })

  it('keeps a stale record list off a fresh fence when the recovery read fails', async () => {
    const page = lane({ revision: 4, value: { teams: [team('team-1', 'Team')], selections: [{ sessionId: 's1', teamId: 'team-1' }] } })
    // The other tab's write lands, and every recovery read this client makes
    // fails, so it never sees the document the Host holds now.
    page.host.describeFails = 2
    page.host.beforeWrite = (attempt) => {
      if (attempt === 1) foreignWrite(page.host, { sessionId: 's9', teamId: 'team-8' })
    }

    await page.controller.selectTeam('s2', 'team-9')

    expect(page.host.writes).toHaveLength(2)
    // Both attempts carry the stale fence, because the section the payload is
    // built from and the revision it is fenced on come out of the same held
    // snapshot: a record list missing s9 can therefore never be admitted.
    expect(page.host.writes.map(write => write.revision)).toEqual([4, 4])
    expect(selectionsIn(page.host.writes[1])?.map(row => row.sessionId)).toEqual(['s1', 's2'])
    // The Host's document is untouched, and the failure is reported instead of
    // a success this client cannot support.
    expect(page.host.value.selections).toEqual([
      { sessionId: 's1', teamId: 'team-1' }, { sessionId: 's9', teamId: 'team-8' },
    ])
    expect(page.controller.store.getSnapshot().selectionFailure).toEqual({
      kind: 'refused', sessionId: 's2', teamId: 'team-9', detail: 'settings conflict',
    })
    page.controller.dispose()
  })

  it('leaves both records stored when two Sessions are written one after the other', async () => {
    const page = lane({ value: { teams: [team('team-1', 'Team')], selections: [] } })
    await page.controller.selectTeam('s1', 'team-1')
    await page.controller.selectTeam('s2', 'team-1')

    expect(page.host.writes).toHaveLength(2)
    // The second write is rebuilt from the document the first one produced.
    expect(selectionsIn(page.host.writes[0])).toEqual([{ sessionId: 's1', teamId: 'team-1' }])
    expect(selectionsIn(page.host.writes[1])).toEqual([
      { sessionId: 's1', teamId: 'team-1' }, { sessionId: 's2', teamId: 'team-1' },
    ])
    expect(page.host.value.selections).toEqual([
      { sessionId: 's1', teamId: 'team-1' }, { sessionId: 's2', teamId: 'team-1' },
    ])
    page.controller.dispose()
  })

  it('never shows a Team the Host has not confirmed as the selected one', async () => {
    let release!: () => void
    const page = lane({ value: { teams: [team('team-1', 'Team'), team('team-2', 'Two')], selections: [{ sessionId: 's1', teamId: 'team-1' }] } })
    page.host.gate = new Promise<void>((resolve) => { release = resolve })

    const pending = page.controller.selectTeam('s1', 'team-2')
    await settle()
    expect(page.host.writes).toHaveLength(1)
    // In flight: the page still reports the stored selection, and reports no
    // failure — a click is neither lost nor answered before the Host answers.
    expect(page.controller.store.getSnapshot().selections).toEqual([{ sessionId: 's1', teamId: 'team-1' }])
    expect(page.controller.store.getSnapshot().selectionFailure).toBeUndefined()

    page.host.gate = undefined
    release()
    await pending
    expect(page.controller.store.getSnapshot().selections).toEqual([{ sessionId: 's1', teamId: 'team-2' }])
    page.controller.dispose()
  })
})

describe('Sessions that never chose a Team', () => {
  it('gives a Session that never chose a Team no selection record', async () => {
    const page = lane({ value: { teams: [team('team-1', 'Team')], selections: [{ sessionId: 's1', teamId: 'team-1' }] } })
    const controller = page.controller
    // A newly created Session is simply a Session id this page renders. Nothing
    // it does on mount, and nothing the page does for it, may store a record.
    controller.loadCatalogue()
    await settle()
    controller.createTeam()
    await controller.save()
    controller.discard()

    expect(page.host.writes.map(pathsOf)).toEqual([['teams']])
    expect(page.host.value.selections).toEqual([{ sessionId: 's1', teamId: 'team-1' }])
    expect(selectedTeam(page.host.value.teams, page.host.value.selections, 's-new')).toBeUndefined()

    // The only thing that creates one for it is its own explicit click, and
    // even then only its own record is added.
    await controller.selectTeam('s-new', 'team-1')
    expect(selectionsIn(page.host.writes.at(-1))).toEqual([
      { sessionId: 's1', teamId: 'team-1' }, { sessionId: 's-new', teamId: 'team-1' },
    ])
    controller.dispose()
  })

  it('inherits no selection record into a fork of a Session that has one', async () => {
    const page = lane({ value: { teams: [team('team-1', 'Team')], selections: [{ sessionId: 's-parent', teamId: 'team-1' }] } })
    const controller = page.controller
    // A fork is a new Session id; the runtime resolves its Team from the stored
    // records alone, and no stored record names it.
    expect(selectedTeam(page.host.value.teams, page.host.value.selections, 's-fork')).toBeUndefined()
    expect(controller.store.getSnapshot().selections.some(row => row.sessionId === 's-fork')).toBe(false)

    // Nor does any page action invent one: a Team edit and its save, a
    // catalogue load, and a draft discard all leave the fork unselected.
    controller.patchTeam(0, { description: 'narrowed for the fork' })
    await controller.save()
    controller.loadCatalogue()
    await settle()
    controller.discard()

    expect(page.host.writes.map(pathsOf)).toEqual([['teams']])
    expect(page.host.value.selections).toEqual([{ sessionId: 's-parent', teamId: 'team-1' }])
    expect(controller.store.getSnapshot().selections).toEqual([{ sessionId: 's-parent', teamId: 'team-1' }])
    controller.dispose()
  })

  it('adds only the forked Session\'s record when the fork explicitly chooses a Team', async () => {
    const page = lane({ value: { teams: [team('team-1', 'Team'), team('team-2', 'Two')], selections: [{ sessionId: 's-parent', teamId: 'team-1' }] } })
    await page.controller.selectTeam('s-fork', 'team-2')

    expect(selectionsIn(page.host.writes[0])).toEqual([
      { sessionId: 's-parent', teamId: 'team-1' },
      { sessionId: 's-fork', teamId: 'team-2' },
    ])
    expect(page.host.value.selections).toEqual([
      { sessionId: 's-parent', teamId: 'team-1' },
      { sessionId: 's-fork', teamId: 'team-2' },
    ])
    page.controller.dispose()
  })

  it('keeps a resumed Session\'s stored record and adds none', async () => {
    const selections: readonly TeamSelectionRecord[] = [
      { sessionId: 's-resumed', teamId: 'team-2' },
      { sessionId: 's-other', teamId: 'team-1' },
    ]
    const page = lane({ value: { teams: [team('team-1', 'Team'), team('team-2', 'Two')], selections } })
    const controller = page.controller
    // Resuming reads the stored records; it never re-writes or re-derives them.
    expect(selectedTeam(page.host.value.teams, page.host.value.selections, 's-resumed')?.id).toBe('team-2')
    controller.loadCatalogue()
    await settle()

    expect(page.host.writes).toHaveLength(0)
    expect(controller.store.getSnapshot().selections).toEqual(selections)
    expect(page.host.value.selections).toEqual(selections)
    controller.dispose()
  })
})

describe('clearing a selection', () => {
  it('removes only the named Session\'s record and only when explicitly asked', async () => {
    const selections: readonly TeamSelectionRecord[] = [
      { sessionId: 's1', teamId: 'team-1' },
      { sessionId: 's2', teamId: 'team-2' },
      { sessionId: 's3', teamId: 'team-1' },
    ]
    const page = lane({ value: { teams: [team('team-1', 'Team'), team('team-2', 'Two')], selections } })
    const controller = page.controller

    // Non-explicit paths first: a Team save and a category write.
    controller.patchTeam(0, { description: 'edited' })
    await controller.save()
    await controller.addCategory('Operations')
    expect(page.host.writes.flatMap(pathsOf)).not.toContain('selections')
    expect(page.host.value.selections).toEqual(selections)

    // The explicit clear: one Session, every other record kept in place.
    await controller.selectTeam('s2', undefined)
    expect(selectionsIn(page.host.writes.at(-1))).toEqual([
      { sessionId: 's1', teamId: 'team-1' },
      { sessionId: 's3', teamId: 'team-1' },
    ])
    expect(page.host.value.selections).toEqual([
      { sessionId: 's1', teamId: 'team-1' },
      { sessionId: 's3', teamId: 'team-1' },
    ])
    expect(controller.store.getSnapshot().selections).toEqual(page.host.value.selections)
    controller.dispose()
  })
})

describe('the allow-list of what a non-selection write may touch', () => {
  it('a draft save rewrites the teams path and leaves every selection untouched', async () => {
    const selections: readonly TeamSelectionRecord[] = [{ sessionId: 's1', teamId: 'team-1' }]
    const page = lane({ value: { teams: [team('team-1', 'Team')], selections } })
    page.controller.patchTeam(0, { name: 'Renamed', description: 'a new purpose' })
    await page.controller.save()

    expect(page.host.writes).toHaveLength(1)
    expect(pathsOf(page.host.writes[0] ?? { ops: [], revision: undefined })).toEqual(['teams'])
    // The write never names the field at all, so no merge can drop a record.
    expect(selectionsIn(page.host.writes[0])).toBeUndefined()
    expect(page.host.value.teams[0]?.name).toBe('Renamed')
    expect(page.host.value.selections).toEqual(selections)
    page.controller.dispose()
  })

  it('a category write rewrites only the local view fields and leaves every selection untouched', async () => {
    const selections: readonly TeamSelectionRecord[] = [{ sessionId: 's1', teamId: 'team-1' }]
    const page = lane({ value: { teams: [team('team-1', 'Team')], selections } })
    expect(await page.controller.addCategory('Operations')).toBe(true)

    expect(page.host.writes).toHaveLength(1)
    expect(pathsOf(page.host.writes[0] ?? { ops: [], revision: undefined })).toEqual(['categories', 'teamCategories'])
    expect(page.host.value.selections).toEqual(selections)
    page.controller.dispose()
  })

  it('a built-in Team Skill binding change rewrites the Team record and leaves every selection untouched', async () => {
    // The ALLOWED write this audit must not mistake for a forbidden one: a
    // shipped Team's skill bindings follow the shipped catalogue, and the page
    // that stages them writes the Team record — never a Session's selection.
    const selections: readonly TeamSelectionRecord[] = [{ sessionId: 's1', teamId: 'team-1' }]
    const page = lane({
      value: {
        teams: [team('team-1', 'Team', {
          members: [member({ name: 'reviewer', id: 'role-reviewer' })],
          officialSkills: [{ skillId: 'grilling', roleName: 'reviewer' }],
        })],
        selections,
      },
    })
    page.controller.patchTeam(0, {
      officialSkills: [
        { skillId: 'grilling', roleName: 'reviewer' },
        { skillId: 'research', roleName: 'captain' },
      ],
    })
    await page.controller.save()

    const [write] = page.host.writes
    expect(pathsOf(write ?? { ops: [], revision: undefined })).toEqual(['teams'])
    const teams = (write?.ops[0]?.op === 'set' ? write.ops[0].value : []) as readonly { officialSkills?: readonly { skillId: string }[] }[]
    expect(teams[0]?.officialSkills?.map(binding => binding.skillId)).toEqual(['grilling', 'research'])
    // The selection records are untouched, which is the whole distinction.
    expect(selectionsIn(write)).toBeUndefined()
    expect(page.host.value.selections).toEqual(selections)
    page.controller.dispose()
  })
})

describe('a document the page may not write', () => {
  it('reports a deployment that composes no Team namespace and writes nothing', async () => {
    const page = lane({ served: false, value: { teams: [team('team-1', 'Team')], selections: [{ sessionId: 's1', teamId: 'team-1' }] } })
    await page.controller.selectTeam('s2', 'team-1')

    expect(page.host.writes).toHaveLength(0)
    expect(page.host.value.selections).toEqual([{ sessionId: 's1', teamId: 'team-1' }])
    expect(page.controller.store.getSnapshot()).toMatchObject({ status: 'unavailable', writable: false })
    expect(page.controller.store.getSnapshot().selectionFailure).toEqual({
      kind: 'unavailable', sessionId: 's2', teamId: 'team-1', detail: undefined,
    })
    page.controller.dispose()
  })

  it('reports a read-only document instead of a silent success', async () => {
    const page = lane({ writable: false, value: { teams: [team('team-1', 'Team')], selections: [] } })
    await page.controller.selectTeam('s2', 'team-1')

    expect(page.host.writes).toHaveLength(0)
    expect(page.host.value.selections).toEqual([])
    expect(page.controller.store.getSnapshot().writable).toBe(false)
    expect(page.controller.store.getSnapshot().selectionFailure?.kind).toBe('unavailable')
    page.controller.dispose()
  })

  it('reports a document the page has not read yet and attempts no write', async () => {
    const page = lane({ answered: false, formStatus: 'loading', value: { teams: [team('team-1', 'Team')], selections: [] } })
    await page.controller.selectTeam('s2', 'team-1')

    expect(page.host.writes).toHaveLength(0)
    expect(page.controller.store.getSnapshot().status).toBe('loading')
    expect(page.controller.store.getSnapshot().selectionFailure).toEqual({
      kind: 'unavailable', sessionId: 's2', teamId: 'team-1', detail: undefined,
    })
    page.controller.dispose()
  })
})
