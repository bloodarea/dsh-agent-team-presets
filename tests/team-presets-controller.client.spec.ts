/**
 * The Team preset settings controller: staged edits over one Config form, the
 * composer's selection writes, and the provider/tool catalogues both pickers read.
 */

import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ModelCatalog, SettingsPathOpView } from '@deepseek-ai/dsh-api-remotes/client'
import type { ConfigForm, ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import {
  TeamPresetsController,
  createTeamPreset,
  defaultImportResolution,
  emptyAgentPreset,
  emptyCaptainPreset,
  sameTeam,
} from '../src/client/team-presets-controller.ts'
import { executionStateOf } from '../src/client/team-presets-controller.ts'
import type { ExternalUpdateNotice, TeamPresetImportPlan } from '../src/client/team-presets-controller.ts'
import { EXECUTION_NOTICE_KEYS, en, zh } from '../src/client/locales.ts'
import { serializeTeamPreset } from '../src/preset-transfer.ts'
import { teamAppearance } from '../src/client/appearance.ts'
import type { TeamSelectionRecordView } from '../src/client/team-presets-controller.ts'
import type {
  TeamAgentPreset, TeamCaptainPreset, TeamExecutionRow, TeamExecutionSnapshot, TeamPreset, TeamPresetsSection, ToolChoice,
} from '../src/types.ts'

/** One empty captain slot, so a test names only the fields it exercises. */
const EMPTY_CAPTAIN: TeamCaptainPreset = {
  name: '', color: '', description: '', toolMode: 'all', tools: [], systemPrompt: '',
}

/** One empty member slot: the captain fields plus the route the member runs on. */
const EMPTY_AGENT: TeamAgentPreset = {
  ...EMPTY_CAPTAIN, provider: '', model: '', reasoningEffort: '',
}

/** One Team whose members a test supplies. */
function preset(members: TeamAgentPreset[] = []): TeamPreset {
  return { id: 'team-1', name: 'Team', description: '', members, captain: EMPTY_CAPTAIN }
}

/** One model catalogue as the Session remote returns it, with and without efforts. */
const CATALOG: ModelCatalog = {
  default: { provider: 'deepseek', model: 'deepseek-chat' },
  routableProviders: ['deepseek'],
  failures: [],
  groups: [{
    id: 'deepseek',
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-chat', name: 'Chat', reasoning: { efforts: [{ id: 'high', name: 'High' }] } },
      { id: 'deepseek-lite', name: 'Lite' },
    ],
  }],
}

const TOOLS: readonly ToolChoice[] = [{ name: 'read', description: 'Read a file' }]

/**
 * One catalogue carrying the supplied provider groups and provider failures.
 * @param groups - provider groups the Host advertised.
 * @param failures - providers whose lookup failed.
 * @returns the catalogue as the Session remote returns it.
 */
function catalogWith(
  groups: ModelCatalog['groups'],
  failures: ModelCatalog['failures'] = [],
): ModelCatalog {
  return { ...CATALOG, routableProviders: groups.map(group => group.id), groups, failures }
}

/** One scripted Config form with a controllable snapshot and write outcome. */
function scriptedForm(options: {
  status?: ConfigFormSnapshot<TeamPresetsSection>['status']
  writable?: boolean
  value?: TeamPresetsSection | undefined
  revision?: number
  landed?: boolean | (() => boolean)
  /** Snapshot the mirror reloads after a refused write, exactly as the real form recovers. */
  recover?: Partial<ConfigFormSnapshot<TeamPresetsSection>>
  /** Refuse a write whose fence is not the revision the mirror holds right now. */
  fenceRevision?: boolean
  /** Hold every write until the test settles it, so a Host change can race it. */
  deferMutations?: boolean
} = {}) {
  const mutations: { ops: readonly SettingsPathOpView[]; revision: number | undefined }[] = []
  const listeners = new Set<() => void>()
  const heldWrites: (() => void)[] = []
  let snapshot: ConfigFormSnapshot<TeamPresetsSection> = {
    status: options.status ?? 'ready',
    value: options.value,
    base: undefined,
    user: undefined,
    revision: options.revision ?? 4,
    writable: options.writable ?? true,
    mode: 'host',
  }
  const form: ConfigForm<TeamPresetsSection> = {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    mutate: async (ops, revision) => {
      mutations.push({ ops, revision })
      if (options.deferMutations === true) {
        await new Promise<void>((resolve) => { heldWrites.push(resolve) })
      }
      if (options.fenceRevision === true && revision !== snapshot.revision) {
        if (options.recover !== undefined) {
          snapshot = { ...snapshot, ...options.recover }
          for (const listener of listeners) listener()
        }
        return false
      }
      const landed = typeof options.landed === 'function' ? options.landed() : options.landed ?? true
      // A real ConfigForm folds an accepted write back into the mirror, so the
      // next read sees it; the stand-in reproduces that read-back and the
      // notification it publishes to subscribers.
      if (landed) {
        let next = snapshot.value ?? { teams: [], selections: [] }
        for (const op of ops) {
          if (op.op === 'set' && op.path.length === 1 && typeof op.path[0] === 'string') {
            next = { ...next, [op.path[0]]: op.value }
          }
        }
        snapshot = { ...snapshot, value: next }
        for (const listener of listeners) listener()
      }
      return landed
    },
    set: async () => typeof options.landed === 'function' ? options.landed() : options.landed ?? true,
    unset: async () => typeof options.landed === 'function' ? options.landed() : options.landed ?? true,
  }
  return {
    form,
    mutations,
    listenerCount: () => listeners.size,
    /** Deliver a form change exactly as the shared mirror would. */
    publishChange: () => { for (const listener of listeners) listener() },
    replace: (next: Partial<ConfigFormSnapshot<TeamPresetsSection>>) => { snapshot = { ...snapshot, ...next } },
    /** Let the oldest held write settle. */
    settleWrite: () => { heldWrites.shift()?.() },
  }
}

/**
 * One client context carrying the two services the controller reads. The
 * services are installed on a real Context, so the controller sees the type it
 * declares instead of a stand-in narrowed by an assertion.
 */
function scriptedContext(form: ConfigForm<TeamPresetsSection>, options: {
  modelOk?: boolean
  toolOk?: boolean
  modelRejects?: boolean
  toolRejects?: boolean
  catalog?: () => ModelCatalog | Promise<ModelCatalog>
  execution?: (signal: AbortSignal) => AsyncIterable<TeamExecutionSnapshot>
} = {}): ClientContext {
  const partial = {
    configForms: { get: () => form },
    remote: {
      session: {
        modelCatalog: () => options.modelRejects === true
          // A rejected read skips the fulfil handler entirely, which is the only
          // way the recovery handler runs after a dispose.
          ? Promise.reject(new Error('no catalogue'))
          : Promise.resolve(options.modelOk === false
            ? { ok: false as const, error: { message: 'no catalogue' } }
            : { ok: true as const, value: (options.catalog ?? (() => CATALOG))() }),
      },
      teamPresets: {
        catalog: () => options.toolRejects === true
          ? Promise.reject(new Error('no tools'))
          : Promise.resolve(options.toolOk === false
            ? { ok: false as const, error: { message: 'no tools' } }
            : { ok: true as const, value: { tools: TOOLS } }),
        execution: options.execution ?? ((signal: AbortSignal) => (async function* () {
          yield { teams: [] }
          if (!signal.aborted) {
            await new Promise<void>((resolve) => { signal.addEventListener('abort', () => { resolve() }, { once: true }) })
          }
        })()),
      },
    },
  }
  const ctx = new Context()
  Object.defineProperty(ctx, 'configForms', { value: partial.configForms })
  Object.defineProperty(ctx, 'remote', { value: partial.remote })
  return ctx
}

/** One execution row, over the idle defaults a case does not exercise. */
function executionRow(teamId: string, state: TeamExecutionRow['state']): TeamExecutionRow {
  return {
    teamId,
    state,
    busySessions: state === 'busy' ? 1 : 0,
    executingMembers: state === 'busy' ? 1 : 0,
    pendingSessions: 0,
  }
}

/** One open scripted execution stream a case pushes frames and failures into. */
interface ScriptedStream {
  push(frame: TeamExecutionSnapshot): void
  fail(error: unknown): void
}

/**
 * A scripted execution stream factory.
 *
 * Each open records the stream, so a case can push into the generation it wants
 * and prove that a superseded one publishes nothing.
 */
function executionStreams() {
  const opened: ScriptedStream[] = []
  const open = (signal: AbortSignal): AsyncIterable<TeamExecutionSnapshot> => {
    const queue: (TeamExecutionSnapshot | Error)[] = []
    let wake: (() => void) | undefined
    const notify = (): void => { const current = wake; wake = undefined; current?.() }
    const iterator = (async function* (): AsyncIterable<TeamExecutionSnapshot> {
      for (;;) {
        if (queue.length === 0) {
          if (signal.aborted) return
          await new Promise<void>((resolve) => { wake = resolve })
          continue
        }
        const next = queue.shift()
        if (next === undefined) continue
        if (next instanceof Error) throw next
        yield next
      }
    })()
    opened.push({
      push: (frame) => { queue.push(frame); notify() },
      fail: (error) => { queue.push(error instanceof Error ? error : new Error(String(error))); notify() },
    })
    return iterator
  }
  return { open, opened }
}

/**
 * One expected status line: every fact a coordination reports, over the empty
 * default a case does not exercise.
 * @param expected - the Teams adopted, added, and removed by the coordination.
 * @returns the complete notice the page should hold.
 */
function notice(expected: Partial<ExternalUpdateNotice>): ExternalUpdateNotice {
  return { teams: [], overridden: [], added: [], removed: [], removedEdited: [], ...expected }
}

/** Await the microtask queue so a scripted catalogue read settles. */
async function settle(): Promise<void> {
  await new Promise<void>((resolve) => { setTimeout(resolve, 0) })
}

const SECTION: TeamPresetsSection = { teams: [preset()], selections: [{ sessionId: 's1', teamId: 'team-1' }] }

describe('Team preset identity helpers', () => {
  it('numbers a new Team past every configured identity', () => {
    expect(createTeamPreset([]).id).toBe('team-1')
    expect(createTeamPreset([preset()]).id).toBe('team-2')
    // A gap in the numbering is still skipped rather than reused.
    expect(createTeamPreset([{ ...preset(), id: 'team-1' }, { ...preset(), id: 'team-3' }]).id).toBe('team-4')
  })

  it('starts a new captain and member on the default tool policy', () => {
    expect(emptyCaptainPreset()).toEqual({
      name: '', color: '', description: '', toolMode: 'all', tools: [], systemPrompt: '',
    })
    expect(emptyAgentPreset()).toEqual({ ...emptyCaptainPreset(), provider: '', model: '', reasoningEffort: '' })
  })

  it('compares stored and staged Teams by their serialized form', () => {
    const staged = preset()
    expect(sameTeam(staged, structuredClone(staged))).toBe(true)
    expect(sameTeam(staged, { ...staged, name: 'Other' })).toBe(false)
  })
})

describe('Team preset controller projection', () => {
  it('reports ready with the stored section', () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    expect(controller.store.getSnapshot()).toMatchObject({
      status: 'ready', writable: true, teams: SECTION.teams, selections: SECTION.selections, dirty: false,
    })
    controller.dispose()
  })

  it('ignores edits that arrive after dispose', () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.dispose()
    controller.createTeam()
    controller.patchTeam(0, { name: 'ghost' })
    expect(controller.store.getSnapshot().teams).toEqual(SECTION.teams)
  })

  it('stages the first Team from an empty mirror', () => {
    const form = scriptedForm({ value: undefined })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    expect(controller.store.getSnapshot()).toMatchObject({ status: 'ready', teams: [] })
    controller.createTeam()
    expect(controller.store.getSnapshot().teams.map(entry => entry.id)).toEqual(['team-1'])
    controller.dispose()
  })

  it('reports loading and unavailable, and falls back to the empty section', () => {
    const loading = scriptedForm({ status: 'loading' })
    const loadingController = new TeamPresetsController(scriptedContext(loading.form))
    expect(loadingController.store.getSnapshot()).toMatchObject({ status: 'loading', teams: [], selections: [] })
    loadingController.dispose()

    const unavailable = scriptedForm({ status: 'unavailable', writable: false })
    const unavailableController = new TeamPresetsController(scriptedContext(unavailable.form))
    expect(unavailableController.store.getSnapshot()).toMatchObject({ status: 'unavailable', writable: false })
    unavailableController.dispose()
  })

  it('republishes on a form change and stops after dispose', () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    form.replace({ value: { teams: [], selections: [] } })
    form.publishChange()
    expect(controller.store.getSnapshot().teams).toEqual([])

    controller.dispose()
    expect(form.listenerCount()).toBe(0)
    // A late publish from an in-flight catalogue read cannot revive the store.
    form.replace({ value: SECTION })
    form.publishChange()
    expect(controller.store.getSnapshot().teams).toEqual([])
  })
})

describe('catalogue loading', () => {
  it('narrows the model catalogue and the tool catalogue', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.loadCatalogue()
    expect(controller.store.getSnapshot()).toMatchObject({ catalogue: 'loading', toolCatalogue: 'loading' })
    await settle()
    expect(controller.store.getSnapshot()).toMatchObject({ catalogue: 'ready', toolCatalogue: 'ready' })
    expect(controller.store.getSnapshot().providers).toEqual([{
      id: 'deepseek',
      name: 'DeepSeek',
      models: [
        { id: 'deepseek-chat', name: 'Chat', efforts: [{ id: 'high', name: 'High' }] },
        { id: 'deepseek-lite', name: 'Lite', efforts: [] },
      ],
    }])
    expect(controller.store.getSnapshot().tools).toEqual(TOOLS)
    controller.dispose()
  })

  it('reports either catalogue failure without discarding the other', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form, { modelOk: false, toolOk: false }))
    controller.loadCatalogue()
    await settle()
    expect(controller.store.getSnapshot()).toMatchObject({ catalogue: 'error', toolCatalogue: 'error', providers: [], tools: [] })
    controller.dispose()
  })

  it('drops a late catalogue answer once the page is disposed', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.loadCatalogue()
    controller.dispose()
    await settle()
    expect(controller.store.getSnapshot()).toMatchObject({ catalogue: 'loading', toolCatalogue: 'loading' })
  })

  it('drops a late catalogue failure once the page is disposed', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form, { modelOk: false, toolOk: false }))
    controller.loadCatalogue()
    controller.dispose()
    await settle()
    expect(controller.store.getSnapshot()).toMatchObject({ catalogue: 'loading', toolCatalogue: 'loading' })
  })

  it('drops a catalogue transport failure once the page is disposed', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form, { modelRejects: true, toolRejects: true }))
    controller.loadCatalogue()
    controller.dispose()
    await settle()
    expect(controller.store.getSnapshot()).toMatchObject({ catalogue: 'loading', toolCatalogue: 'loading' })
  })

  it('does not re-read a catalogue that is already loading or ready', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.loadCatalogue()
    controller.loadCatalogue()
    await settle()
    controller.loadCatalogue()
    expect(controller.store.getSnapshot()).toMatchObject({ catalogue: 'ready', toolCatalogue: 'ready' })
    controller.dispose()
  })

  it('re-reads a ready catalogue and offers the routes the deployment gained', async () => {
    const form = scriptedForm({ value: SECTION })
    let groups = CATALOG.groups
    const controller = new TeamPresetsController(scriptedContext(form.form, { catalog: () => catalogWith(groups) }))
    controller.loadCatalogue()
    await settle()
    expect(controller.store.getSnapshot().providers.map(provider => provider.id)).toEqual(['deepseek'])

    groups = [...CATALOG.groups, {
      id: 'antigravity',
      name: 'Antigravity',
      models: [{ id: 'gemini-3.1-pro-high', name: 'Gemini 3.1 Pro (High)' }],
    }]
    controller.refreshCatalogue()
    expect(controller.store.getSnapshot()).toMatchObject({ catalogue: 'loading', toolCatalogue: 'loading' })
    await settle()
    expect(controller.store.getSnapshot().providers.map(provider => provider.id)).toEqual(['deepseek', 'antigravity'])
    controller.dispose()
  })

  it('reports a partial catalogue while keeping every provider that answered', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form, {
      catalog: () => catalogWith(CATALOG.groups, [{ id: 'antigravity', name: 'Antigravity', message: 'no account' }]),
    }))
    controller.loadCatalogue()
    await settle()
    expect(controller.store.getSnapshot()).toMatchObject({
      catalogue: 'ready', cataloguePartial: true, providers: [{ id: 'deepseek' }],
    })
    controller.dispose()
  })

  it('clears the partial flag once a refresh answers completely', async () => {
    const form = scriptedForm({ value: SECTION })
    let failures: ModelCatalog['failures'] = [{ id: 'antigravity', name: 'Antigravity', message: 'no account' }]
    const controller = new TeamPresetsController(scriptedContext(form.form, {
      catalog: () => catalogWith(CATALOG.groups, failures),
    }))
    controller.loadCatalogue()
    await settle()
    expect(controller.store.getSnapshot().cataloguePartial).toBe(true)

    failures = []
    controller.refreshCatalogue()
    expect(controller.store.getSnapshot().cataloguePartial).toBe(false)
    await settle()
    expect(controller.store.getSnapshot()).toMatchObject({ catalogue: 'ready', cataloguePartial: false })
    controller.dispose()
  })

  it('drops the answer of a read the refresh superseded', async () => {
    const form = scriptedForm({ value: SECTION })
    const held: ((catalog: ModelCatalog) => void)[] = []
    let read = 0
    const controller = new TeamPresetsController(scriptedContext(form.form, {
      catalog: () => {
        read += 1
        return read === 1
          ? new Promise<ModelCatalog>((resolve) => { held.push(resolve) })
          : catalogWith([{ id: 'antigravity', name: 'Antigravity', models: [{ id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash' }] }])
      },
    }))
    controller.loadCatalogue()
    controller.refreshCatalogue()
    await settle()
    expect(controller.store.getSnapshot().providers.map(provider => provider.id)).toEqual(['antigravity'])

    // The first read was still in flight when the refresh replaced it, so its
    // answer must not overwrite the newer one.
    held[0]?.(CATALOG)
    await settle()
    expect(controller.store.getSnapshot().providers.map(provider => provider.id)).toEqual(['antigravity'])
    controller.dispose()
  })

  it('ignores a refresh once the page is disposed', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.dispose()
    controller.refreshCatalogue()
    expect(controller.store.getSnapshot()).toMatchObject({ catalogue: 'idle', cataloguePartial: false })
  })
})

describe('staged edits', () => {
  function staged() {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    return { form, controller }
  }

  it('creates a Team, marks the page dirty, and publishes it ahead of the stored value', () => {
    const { controller } = staged()
    const id = controller.createTeam()
    expect(id).toBe('team-2')
    expect(controller.store.getSnapshot().dirty).toBe(true)
    expect(controller.store.getSnapshot().teams.map(entry => entry.id)).toEqual(['team-1', 'team-2'])
    controller.dispose()
  })

  it('duplicates a Team under a new identity and a copy name', () => {
    const { controller } = staged()
    const named: TeamPreset = { ...preset(), name: 'Feature' }
    controller.patchTeam(0, named)
    const id = controller.duplicateTeam(0)
    expect(id).toBe('team-2')
    expect(controller.store.getSnapshot().teams[1]).toMatchObject({ id: 'team-2', name: 'Feature copy' })
    controller.dispose()
  })

  it('leaves an unnamed duplicate unnamed', () => {
    const { controller } = staged()
    controller.patchTeam(0, { name: '' })
    expect(controller.duplicateTeam(0)).toBe('team-2')
    expect(controller.store.getSnapshot().teams[1]?.name).toBe('')
    controller.dispose()
  })

  it('ignores every edit aimed at a position the page does not show', () => {
    const { controller } = staged()
    expect(controller.duplicateTeam(7)).toBeUndefined()
    controller.removeTeam(7)
    controller.patchTeam(7, { name: 'ghost' })
    controller.patchCaptain(7, { name: 'ghost' })
    controller.patchMember(7, 0, { name: 'ghost' })
    controller.addMember(7)
    controller.removeMember(7, 0)
    // Addressing a position the page does not show leaves the staged Teams
    // identical to the stored ones; it still opens a draft, which the page
    // reports as unsaved work.
    expect(controller.store.getSnapshot().teams).toEqual(SECTION.teams)
    expect(controller.store.getSnapshot().dirty).toBe(true)
    controller.dispose()
  })

  it('edits one member without touching its siblings', () => {
    const { controller } = staged()
    controller.addMember(0)
    controller.addMember(0)
    controller.patchMember(0, 0, { name: 'reviewer' })
    controller.patchMember(0, 1, { name: 'builder' })
    expect(controller.store.getSnapshot().teams[0]?.members.map(entry => entry.name)).toEqual(['reviewer', 'builder'])
    controller.dispose()
  })

  it('removes a Team and edits its captain and members', () => {
    const { controller } = staged()
    controller.addMember(0)
    controller.patchMember(0, 0, { name: 'reviewer' })
    controller.patchCaptain(0, { name: 'captain-2', toolMode: 'custom', tools: ['read'] })
    expect(controller.store.getSnapshot().teams[0]?.captain).toMatchObject({
      name: 'captain-2', toolMode: 'custom', tools: ['read'],
    })
    expect(controller.store.getSnapshot().teams[0]?.members[0]?.name).toBe('reviewer')

    controller.removeMember(0, 0)
    expect(controller.store.getSnapshot().teams[0]?.members).toEqual([])

    controller.patchMember(0, 3, { name: 'ghost' })
    controller.removeTeam(0)
    expect(controller.store.getSnapshot().teams).toEqual([])
    controller.dispose()
  })
})

describe('writing staged Teams', () => {
  it('writes the staged Teams under one revision fence and clears the draft', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.createTeam()
    await controller.save()
    expect(form.mutations).toHaveLength(1)
    expect(form.mutations[0]?.revision).toBe(4)
    expect(form.mutations[0]?.ops[0]).toMatchObject({ op: 'set', path: ['teams'] })
    expect(controller.store.getSnapshot()).toMatchObject({ dirty: false, saving: false, failed: false })
    controller.dispose()
  })

  it('keeps the edits and reports failure when the host refuses them', async () => {
    const form = scriptedForm({ value: SECTION, landed: false })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.createTeam()
    await controller.save()
    expect(controller.store.getSnapshot()).toMatchObject({ dirty: true, saving: false, failed: true })
    controller.dispose()
  })

  it('writes nothing without a draft, a ready namespace, or writable settings', async () => {
    const noDraft = scriptedForm({ value: SECTION })
    const idle = new TeamPresetsController(scriptedContext(noDraft.form))
    await idle.save()
    expect(noDraft.mutations).toHaveLength(0)
    idle.dispose()

    const loading = scriptedForm({ status: 'loading' })
    const notReady = new TeamPresetsController(scriptedContext(loading.form))
    await notReady.save()
    expect(loading.mutations).toHaveLength(0)
    notReady.dispose()

    const readOnly = scriptedForm({ value: SECTION, writable: false })
    const unwritable = new TeamPresetsController(scriptedContext(readOnly.form))
    await unwritable.save()
    expect(readOnly.mutations).toHaveLength(0)
    unwritable.dispose()
  })

  it('publishes nothing when the page is disposed while the write is in flight', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.createTeam()
    const pending = controller.save()
    controller.dispose()
    await pending
    expect(form.mutations).toHaveLength(1)
    // The draft survives: the refused page never observed the settlement.
    expect(controller.store.getSnapshot().dirty).toBe(true)
  })

  it('drops the draft on discard and ignores a discard with nothing staged', () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.discard()
    expect(controller.store.getSnapshot().dirty).toBe(false)

    controller.createTeam()
    controller.discard()
    expect(controller.store.getSnapshot()).toMatchObject({ dirty: false, teams: SECTION.teams })
    controller.dispose()
  })
})

describe('external Team updates behind an open draft', () => {
  /** One stored Team whose captain prompt the cases below move around. */
  function team(id: string, prompt: string): TeamPreset {
    return {
      id,
      name: id,
      description: '',
      captain: { ...EMPTY_CAPTAIN, name: 'lead', systemPrompt: prompt },
      members: [],
    }
  }

  /** The two stored Teams every case starts from. */
  function stored(): TeamPreset[] {
    return [team('team-1', 'OLD_A'), team('team-2', 'OLD_B')]
  }

  /** The section the Host holds once the captain rewrote Team 1 through its tool. */
  function rewritten(): TeamPresetsSection {
    return { teams: [team('team-1', 'NEW_A'), team('team-2', 'OLD_B')], selections: [] }
  }

  /** One controller over the two stored Teams, or over Teams a case supplies. */
  function open(options: {
    fenceRevision?: boolean
    deferMutations?: boolean
    landed?: boolean
    teams?: TeamPreset[]
  } = {}) {
    const { teams = stored(), ...formOptions } = options
    const form = scriptedForm({ value: { teams, selections: [] }, ...formOptions })
    return { form, controller: new TeamPresetsController(scriptedContext(form.form)) }
  }

  it('shows the rewritten prompt the moment the Host holds it', () => {
    const { form, controller } = open()
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })

    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()

    expect(controller.store.getSnapshot().teams.map(entry => entry.captain.systemPrompt)).toEqual(['NEW_A', 'OLD_B'])
    controller.dispose()
  })

  it('keeps the staged edit of a Team the captain did not touch', () => {
    const { form, controller } = open()
    controller.patchCaptain(1, { systemPrompt: 'DRAFT_B' })

    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()

    const state = controller.store.getSnapshot()
    expect(state.teams.map(entry => entry.captain.systemPrompt)).toEqual(['NEW_A', 'DRAFT_B'])
    expect(state.dirty).toBe(true)
    controller.dispose()
  })

  it('keeps the draft through notifications that carry no Team change', async () => {
    const form = scriptedForm({
      value: { teams: stored(), selections: [{ sessionId: 's1', teamId: 'team-1' }] },
    })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })

    // Another Session picked a Team: the section moved, the Teams did not.
    form.replace({ value: { teams: stored(), selections: [{ sessionId: 's1', teamId: 'team-2' }] }, revision: 5 })
    form.publishChange()
    expect(controller.store.getSnapshot().dirty).toBe(true)
    expect(controller.store.getSnapshot().teams[0]?.captain.systemPrompt).toBe('DRAFT_A')

    // The pickers re-read both catalogues, which republishes page state only.
    controller.refreshCatalogue()
    await settle()
    expect(controller.store.getSnapshot().dirty).toBe(true)
    expect(controller.store.getSnapshot().teams[0]?.captain.systemPrompt).toBe('DRAFT_A')

    // The namespace lost its writability: still no Team to adopt.
    form.replace({ writable: false })
    form.publishChange()
    expect(controller.store.getSnapshot().teams[0]?.captain.systemPrompt).toBe('DRAFT_A')
    controller.dispose()
  })

  it('saves the kept draft under the revision the Host moved to', async () => {
    const { form, controller } = open({ fenceRevision: true })
    controller.patchCaptain(1, { systemPrompt: 'DRAFT_B' })

    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()

    await controller.save()
    expect(form.mutations[0]?.revision).toBe(5)
    expect(controller.store.getSnapshot()).toMatchObject({ dirty: false, failed: false })
    controller.dispose()
  })

  it('clears a draft that coordination made identical to the Host', async () => {
    const { form, controller } = open()
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })

    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()

    expect(controller.store.getSnapshot().dirty).toBe(false)
    expect(controller.store.getSnapshot().teams).toEqual(rewritten().teams)
    // Nothing left to save, so the page writes nothing.
    await controller.save()
    expect(form.mutations).toHaveLength(0)
    controller.dispose()
  })

  it('does not roll the draft back when the Host changes during a write', async () => {
    const { form, controller } = open({ deferMutations: true, landed: false })
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })

    const saving = controller.save()
    // The captain's own update lands while this page's write is still crossing.
    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()
    expect(controller.store.getSnapshot().teams[0]?.captain.systemPrompt).toBe('DRAFT_A')

    form.settleWrite()
    await saving

    // The refused write carried the draft, never the value that raced it.
    expect(JSON.stringify(form.mutations[0]?.ops)).toContain('DRAFT_A')
    expect(JSON.stringify(form.mutations[0]?.ops)).not.toContain('NEW_A')
    // Once the write was refused, its recovery read is coordinated: the saved
    // version wins over the staged edit, and the report says so.
    const state = controller.store.getSnapshot()
    expect(state).toMatchObject({ saving: false, failed: true, dirty: false })
    expect(state.teams.map(entry => entry.captain.systemPrompt)).toEqual(['NEW_A', 'OLD_B'])
    expect(state.externalUpdate).toEqual(notice({ teams: ['team-1'], overridden: ['team-1'] }))
    controller.dispose()
  })

  it('keeps a Team this page added itself out of the Host\'s reach', () => {
    const { form, controller } = open()
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })
    controller.createTeam()

    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()

    const state = controller.store.getSnapshot()
    // The rewritten Team is adopted; the Team this page added is not the Host's
    // to replace, so it stays staged exactly as the user left it.
    expect(state.teams.map(entry => entry.id)).toEqual(['team-1', 'team-2', 'team-3'])
    expect(state.teams[0]?.captain.systemPrompt).toBe('NEW_A')
    expect(state.teams[2]).toMatchObject({ name: '', members: [] })
    expect(state.dirty).toBe(true)
    controller.dispose()
  })

  it('reports the Team the Host rewrote, and the edit it replaced', () => {
    const { form, controller } = open()
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })

    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()

    // The draft held a prompt of its own for that Team, so the report says so.
    expect(controller.store.getSnapshot().externalUpdate).toEqual(notice({ teams: ['team-1'], overridden: ['team-1'] }))
    controller.dispose()
  })

  it('reports an unnamed Team by its identity', () => {
    const { form, controller } = open({ teams: [{ ...team('team-1', 'OLD_A'), name: '' }, team('team-2', 'OLD_B')] })
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })

    form.replace({
      value: { teams: [{ ...team('team-1', 'NEW_A'), name: '' }, team('team-2', 'OLD_B')], selections: [] },
      revision: 5,
    })
    form.publishChange()

    expect(controller.store.getSnapshot().externalUpdate).toEqual(notice({ teams: ['team-1'], overridden: ['team-1'] }))
    controller.dispose()
  })

  it('does not claim an edit was replaced when the draft held none for that Team', () => {
    const { form, controller } = open()
    // The staged work is on Team 2; the Host rewrites Team 1, which was untouched.
    controller.patchCaptain(1, { systemPrompt: 'DRAFT_B' })

    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()

    const state = controller.store.getSnapshot()
    expect(state.externalUpdate).toEqual(notice({ teams: ['team-1'] }))
    expect(state.dirty).toBe(true)
    controller.dispose()
  })

  it('summarizes every Team one coordination adopted', () => {
    const { form, controller } = open()
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })
    controller.patchCaptain(1, { systemPrompt: 'DRAFT_B' })

    form.replace({
      value: { teams: [team('team-1', 'NEW_A'), team('team-2', 'NEW_B')], selections: [] },
      revision: 5,
    })
    form.publishChange()

    const state = controller.store.getSnapshot()
    expect(state.externalUpdate).toEqual(notice({ teams: ['team-1', 'team-2'], overridden: ['team-1', 'team-2'] }))
    // Both staged edits were superseded, so no draft is left behind.
    expect(state.dirty).toBe(false)
    controller.dispose()
  })

  it('reports the adopted Team while the rest of the draft stays unsaved', () => {
    const { form, controller } = open()
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })
    controller.createTeam()

    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()

    const state = controller.store.getSnapshot()
    expect(state.externalUpdate).toEqual(notice({ teams: ['team-1'], overridden: ['team-1'] }))
    // The report and the remaining unsaved work share the footer.
    expect(state.dirty).toBe(true)
    expect(state.teams.map(entry => entry.id)).toEqual(['team-1', 'team-2', 'team-3'])
    expect(state.teams[0]?.captain.systemPrompt).toBe('NEW_A')
    controller.dispose()
  })

  it('reports nothing for notifications that carry no Team change, and keeps a standing report', async () => {
    const form = scriptedForm({
      value: { teams: stored(), selections: [{ sessionId: 's1', teamId: 'team-1' }] },
    })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })

    // Another Session picked a Team: the section moved, the Teams did not.
    form.replace({ value: { teams: stored(), selections: [{ sessionId: 's1', teamId: 'team-2' }] }, revision: 5 })
    form.publishChange()
    expect(controller.store.getSnapshot().externalUpdate).toBeUndefined()

    controller.patchCaptain(1, { systemPrompt: 'DRAFT_B' })
    form.replace({ value: rewritten(), revision: 6 })
    form.publishChange()
    // Team 1 still carried the staged prompt of the first edit, so the report
    // says that edit was replaced; Team 2's own edit is untouched.
    expect(controller.store.getSnapshot().externalUpdate).toEqual(notice({ teams: ['team-1'], overridden: ['team-1'] }))

    // A later unrelated change must not wipe the report the user has not seen.
    form.replace({ value: { ...rewritten(), selections: [{ sessionId: 's1', teamId: 'team-1' }] }, revision: 7 })
    form.publishChange()
    expect(controller.store.getSnapshot().externalUpdate).toEqual(notice({ teams: ['team-1'], overridden: ['team-1'] }))

    controller.refreshCatalogue()
    await settle()
    expect(controller.store.getSnapshot().externalUpdate).toEqual(notice({ teams: ['team-1'], overridden: ['team-1'] }))
    controller.dispose()
  })

  it('retires the report when the user edits, saves, or discards', async () => {
    const { form, controller } = open()
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })
    controller.createTeam()
    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()
    expect(controller.store.getSnapshot().externalUpdate).toBeDefined()

    // An edit of the user's own retires it.
    controller.patchCaptain(1, { systemPrompt: 'DRAFT_B' })
    expect(controller.store.getSnapshot().externalUpdate).toBeUndefined()

    // So does a save.
    controller.patchCaptain(0, { systemPrompt: 'AGAIN_A' })
    form.replace({ value: { teams: [team('team-1', 'NEWER_A'), team('team-2', 'OLD_B')], selections: [] }, revision: 6 })
    form.publishChange()
    expect(controller.store.getSnapshot().externalUpdate).toBeDefined()
    await controller.save()
    expect(controller.store.getSnapshot().externalUpdate).toBeUndefined()

    // And a discard, which needs a draft left to drop.
    controller.patchCaptain(1, { systemPrompt: 'DRAFT_B2' })
    controller.createTeam()
    form.replace({ value: { teams: [team('team-1', 'NEWEST_A'), team('team-2', 'OLD_B')], selections: [] }, revision: 7 })
    form.publishChange()
    expect(controller.store.getSnapshot().externalUpdate).toBeDefined()
    expect(controller.store.getSnapshot().dirty).toBe(true)
    controller.discard()
    expect(controller.store.getSnapshot().externalUpdate).toBeUndefined()
    controller.dispose()
  })

  it('joins a Team the Host added behind the draft and keeps it on save', async () => {
    const { form, controller } = open()
    controller.patchCaptain(1, { systemPrompt: 'DRAFT_B' })

    form.replace({
      value: { teams: [team('team-1', 'OLD_A'), team('team-2', 'OLD_B'), team('team-3', 'HOST_C')], selections: [] },
      revision: 5,
    })
    form.publishChange()

    const state = controller.store.getSnapshot()
    // The added Team joined the draft with the stored value, and the staged edit
    // of the other Team is untouched.
    expect(state.teams.map(entry => entry.id)).toEqual(['team-1', 'team-2', 'team-3'])
    expect(state.teams[2]?.captain.systemPrompt).toBe('HOST_C')
    expect(state.teams[1]?.captain.systemPrompt).toBe('DRAFT_B')
    expect(state.externalUpdate).toEqual(notice({ added: ['team-3'] }))
    expect(state.dirty).toBe(true)

    // Saving the whole document no longer drops what the Host added.
    await controller.save()
    expect(JSON.stringify(form.mutations[0]?.ops)).toContain('"id":"team-3"')
    controller.dispose()
  })

  it('drops a Team the Host deleted behind the draft instead of resurrecting it', async () => {
    const { form, controller } = open()
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })

    form.replace({ value: { teams: [team('team-1', 'OLD_A')], selections: [] }, revision: 5 })
    form.publishChange()

    const state = controller.store.getSnapshot()
    expect(state.teams.map(entry => entry.id)).toEqual(['team-1'])
    expect(state.externalUpdate).toEqual(notice({ removed: ['team-2'] }))

    await controller.save()
    expect(JSON.stringify(form.mutations[0]?.ops)).not.toContain('team-2')
    controller.dispose()
  })

  it('reports the staged edit a deleted Team took with it', () => {
    const { form, controller } = open()
    // The staged work is on the Team the Host deletes.
    controller.patchCaptain(1, { systemPrompt: 'DRAFT_B' })

    form.replace({ value: { teams: [team('team-1', 'OLD_A')], selections: [] }, revision: 5 })
    form.publishChange()

    const state = controller.store.getSnapshot()
    expect(state.externalUpdate).toEqual(notice({ removed: ['team-2'], removedEdited: ['team-2'] }))
    expect(state.teams.map(entry => entry.id)).toEqual(['team-1'])
    // Nothing but Host records remain, so no draft is left to save.
    expect(state.dirty).toBe(false)
    controller.dispose()
  })

  it('re-coordinates after a refused write, so the retry is not the same conflict', async () => {
    let land = false
    const form = scriptedForm({
      value: { teams: stored(), selections: [] },
      fenceRevision: true,
      landed: () => land,
      recover: { value: rewritten(), revision: 5 },
    })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.patchCaptain(1, { systemPrompt: 'DRAFT_B' })

    // Another writer won the race: the Host is at revision 5 with Team 1 rewritten.
    form.replace({ revision: 5 })
    await controller.save()

    expect(form.mutations[0]?.revision).toBe(4)
    const refused = controller.store.getSnapshot()
    expect(refused).toMatchObject({ failed: true, dirty: true })
    // The recovery read behind the refusal was coordinated, not left pending.
    expect(refused.teams.map(entry => entry.captain.systemPrompt)).toEqual(['NEW_A', 'DRAFT_B'])
    expect(refused.externalUpdate).toEqual(notice({ teams: ['team-1'] }))

    land = true
    await controller.save()
    expect(form.mutations[1]?.revision).toBe(5)
    expect(controller.store.getSnapshot()).toMatchObject({ dirty: false, failed: false })
    controller.dispose()
  })

  it('keeps a Team this page added while the Host changed another one', () => {
    const { form, controller } = open()
    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })
    controller.createTeam()

    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()

    const state = controller.store.getSnapshot()
    // The page's own Team is neither the Host's addition nor its deletion.
    expect(state.teams.map(entry => entry.id)).toEqual(['team-1', 'team-2', 'team-3'])
    expect(state.externalUpdate).toEqual(notice({ teams: ['team-1'], overridden: ['team-1'] }))
    expect(state.dirty).toBe(true)
    controller.dispose()
  })

  it('clears a draft the Host write landed on exactly, without claiming a conflict', async () => {
    const { form, controller } = open()
    // The staged value and the stored one end up identical: the Host wrote the
    // very text the draft already held, so nothing had to be replaced.
    controller.patchCaptain(0, { systemPrompt: 'NEW_A' })
    expect(controller.store.getSnapshot().dirty).toBe(true)

    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()

    const state = controller.store.getSnapshot()
    expect(state.teams.map(entry => entry.captain.systemPrompt)).toEqual(['NEW_A', 'OLD_B'])
    expect(state).toMatchObject({ dirty: false })
    // Nothing was overwritten, so nothing may claim that it was.
    expect(state.externalUpdate).toBeUndefined()
    // Save has nothing to write, so the page writes nothing.
    await controller.save()
    expect(form.mutations).toHaveLength(0)
    controller.dispose()
  })

  it('keeps a draft the Host write did not fully catch up with', () => {
    const { form, controller } = open()
    // The same stored write as above, but the draft also holds an unrelated
    // edit and a Team of its own, so it is not the Host's document yet.
    controller.patchCaptain(0, { systemPrompt: 'NEW_A' })
    controller.patchCaptain(1, { systemPrompt: 'DRAFT_B' })
    controller.createTeam()

    form.replace({ value: rewritten(), revision: 5 })
    form.publishChange()

    const state = controller.store.getSnapshot()
    expect(state).toMatchObject({ dirty: true })
    expect(state.externalUpdate).toBeUndefined()
    expect(state.teams.map(entry => entry.id)).toEqual(['team-1', 'team-2', 'team-3'])
    expect(state.teams.map(entry => entry.captain.systemPrompt)).toEqual(['NEW_A', 'DRAFT_B', ''])
    controller.dispose()
  })

  it('keeps a Team staged before the Host ever served a section', () => {
    const form = scriptedForm({ status: 'loading', value: undefined })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.createTeam()

    // No accepted section yet, so there is no stored Team to adopt.
    form.publishChange()
    expect(controller.store.getSnapshot().teams.map(entry => entry.id)).toEqual(['team-1'])

    // Ready, but still no section: nothing to reconcile against either.
    form.replace({ status: 'ready' })
    form.publishChange()
    expect(controller.store.getSnapshot().teams.map(entry => entry.id)).toEqual(['team-1'])

    // The first accepted section carries a Team of the same id; the staged one
    // is this page's own work, so the Host does not replace it.
    form.replace({ value: { teams: [team('team-1', 'HOST_A')], selections: [] }, revision: 2 })
    form.publishChange()
    expect(controller.store.getSnapshot().teams).toEqual([{
      id: 'team-1', name: '', description: '', captain: emptyCaptainPreset(), members: [],
    }])
    expect(controller.store.getSnapshot().dirty).toBe(true)
    controller.dispose()
  })
})

describe('composer selection writes', () => {
  it('adds, replaces, and clears one Session selection', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))

    await controller.selectTeam('s2', 'team-9')
    expect(form.mutations[0]?.ops[0]).toMatchObject({
      op: 'set', path: ['selections'],
      value: [{ sessionId: 's1', teamId: 'team-1' }, { sessionId: 's2', teamId: 'team-9' }],
    })

    await controller.selectTeam('s1', undefined)
    expect(form.mutations[1]?.ops[0]).toMatchObject({
      op: 'set', path: ['selections'], value: [{ sessionId: 's2', teamId: 'team-9' }],
    })
    controller.dispose()
  })

  it('starts a selection list from an empty mirror', async () => {
    const form = scriptedForm({ value: undefined })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    await controller.selectTeam('s1', 'team-1')
    expect(form.mutations[0]?.ops[0]).toMatchObject({
      op: 'set', path: ['selections'], value: [{ sessionId: 's1', teamId: 'team-1' }],
    })
    controller.dispose()
  })

  it('writes nothing while the namespace is not ready or not writable', async () => {
    const loading = scriptedForm({ status: 'loading' })
    const notReady = new TeamPresetsController(scriptedContext(loading.form))
    await notReady.selectTeam('s1', 'team-1')
    expect(loading.mutations).toHaveLength(0)
    notReady.dispose()

    const readOnly = scriptedForm({ value: SECTION, writable: false })
    const unwritable = new TeamPresetsController(scriptedContext(readOnly.form))
    await unwritable.selectTeam('s1', 'team-1')
    expect(readOnly.mutations).toHaveLength(0)
    unwritable.dispose()
  })
})

describe('the injected business face', () => {
  it('exposes every page and composer operation over one store', () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    const injected = controller.inject()

    expect(injected.hooks.teamPresets).toBe(controller.store)
    expect(injected.createTeam()).toBe('team-2')
    expect(injected.duplicateTeam(0)).toBe('team-3')
    injected.addMember(0)
    injected.patchMember(0, 0, { name: 'reviewer' })
    injected.patchCaptain(0, { name: 'captain' })
    injected.patchTeam(0, { description: 'what it is for' })
    expect(controller.store.getSnapshot().teams[0]).toMatchObject({
      description: 'what it is for',
      captain: { name: 'captain' },
      members: [{ name: 'reviewer' }],
    })
    injected.removeMember(0, 0)
    expect(controller.store.getSnapshot().teams[0]?.members).toEqual([])
    injected.removeTeam(0)
    expect(controller.store.getSnapshot().teams).toHaveLength(2)
    injected.discard()
    expect(controller.store.getSnapshot().dirty).toBe(false)
    injected.loadCatalogue()
    expect(controller.store.getSnapshot().catalogue).toBe('loading')
    controller.dispose()
  })

  it('re-reads both catalogues through the injected face', async () => {
    const form = scriptedForm({ value: SECTION })
    let groups = CATALOG.groups
    const controller = new TeamPresetsController(scriptedContext(form.form, { catalog: () => catalogWith(groups) }))
    const injected = controller.inject()
    injected.loadCatalogue()
    await settle()
    expect(controller.store.getSnapshot().providers.map(provider => provider.id)).toEqual(['deepseek'])

    groups = [...CATALOG.groups, {
      id: 'antigravity',
      name: 'Antigravity',
      models: [{ id: 'gemini-3.1-pro-high', name: 'Gemini 3.1 Pro (High)' }],
    }]
    injected.refreshCatalogue()
    expect(controller.store.getSnapshot()).toMatchObject({ catalogue: 'loading', toolCatalogue: 'loading' })
    await settle()
    expect(controller.store.getSnapshot().providers.map(provider => provider.id)).toEqual(['deepseek', 'antigravity'])
    controller.dispose()
  })

  it('writes staged Teams and one selection through the injected face', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    const injected = controller.inject()
    injected.createTeam()
    await injected.save()
    expect(form.mutations[0]?.ops[0]).toMatchObject({ op: 'set', path: ['teams'] })

    await injected.selectTeam('s2', 'team-2')
    expect(form.mutations[1]?.ops[0]).toMatchObject({ op: 'set', path: ['selections'] })
    controller.dispose()
  })

  it('writes the member route and a captain without one into the stored Teams payload', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form))
    controller.patchCaptain(0, { ...EMPTY_CAPTAIN, name: 'captain' })
    controller.addMember(0)
    controller.patchMember(0, 0, {
      ...EMPTY_AGENT, name: 'reviewer', provider: 'deepseek', model: 'deepseek-chat',
      reasoningEffort: 'high', toolMode: 'custom', tools: ['read'],
    })
    await controller.save()
    const op = form.mutations[0]?.ops[0]
    expect(op).toMatchObject({ op: 'set', path: ['teams'] })
    const written = JSON.stringify(op)
    expect(written).toContain('"members":[{"name":"reviewer","color":"","description":"","provider":"deepseek"')
    expect(written).toContain('"model":"deepseek-chat","reasoningEffort":"high","toolMode":"custom"')
    // A captain leads on the Session's own model, so its stored record carries
    // only the slot fields and never restates a route.
    expect(written).toContain('"captain":{"name":"captain","color":"","description":"","toolMode":"all","tools":[],"systemPrompt":""}')
    controller.dispose()
  })
})

describe('sharing one Team as a document', () => {
  /** One Team whose shared fields the tests below assert. */
  function shareable(): TeamPreset {
    return {
      id: 'team-1',
      name: 'Review team',
      description: 'Reviews changes',
      captain: {
        ...EMPTY_CAPTAIN, name: 'team-lead', color: '#4c8dff', description: 'leads',
        toolMode: 'custom', tools: ['read'], systemPrompt: 'You lead.',
      },
      members: [{
        ...EMPTY_AGENT, name: 'reviewer', color: '#2fbf71', description: 'checks diffs',
        systemPrompt: 'You review.', provider: 'deepseek', model: 'deepseek-chat', reasoningEffort: 'high',
      }],
    }
  }

  /** One controller over the supplied Teams. */
  function controllerFor(teams: TeamPreset[]) {
    const form = scriptedForm({ value: { teams, selections: [] } })
    return { form, controller: new TeamPresetsController(scriptedContext(form.form)) }
  }

  /**
   * Inspect one document, failing the test when it was refused.
   * @param controller - the controller reading the document.
   * @param text - the document text.
   * @returns the plan the import would apply.
   */
  function planOf(controller: TeamPresetsController, text: string): TeamPresetImportPlan {
    const inspection = controller.inspectImport(text)
    if (!inspection.ok) throw new Error(`document refused: ${inspection.reason}`)
    return inspection.plan
  }

  /** One incoming document: a new purpose, a new member, and the same two names. */
  function incoming(): TeamPreset {
    const base = shareable()
    return {
      ...base,
      description: 'New purpose',
      captain: { ...base.captain, description: 'new lead', systemPrompt: 'Lead anew.' },
      members: [
        { ...base.members[0]!, description: 'new checks', systemPrompt: 'Check anew.', color: '#e05c6b' },
        { ...EMPTY_AGENT, name: 'builder', description: 'builds' },
      ],
    }
  }

  it('serializes the Team the page shows, routes and tool policies excluded', () => {
    const { controller } = controllerFor([shareable()])
    const text = controller.exportTeam(0)
    expect(text).toBeDefined()
    const parsed = JSON.parse(text!) as { team: { name: string; captain: { name: string }; members: { name: string }[] } }
    expect(parsed.team.name).toBe('Review team')
    expect(parsed.team.captain.name).toBe('team-lead')
    expect(parsed.team.members[0]?.name).toBe('reviewer')
    expect(text).not.toContain('deepseek')
    expect(text).not.toContain('toolMode')
    expect(controller.exportTeam(9)).toBeUndefined()
    controller.dispose()
  })

  it('stages a free document as a new Team without writing the stored ones', () => {
    const { form, controller } = controllerFor([shareable()])
    const free = serializeTeamPreset({ ...shareable(), id: 'team-9', name: 'Build team' })
    const plan = planOf(controller, free)
    expect(plan.targetIndex).toBeUndefined()
    expect(controller.applyImport(plan, defaultImportResolution(plan))).toBe('team-2')
    expect(controller.store.getSnapshot().teams.map(team => team.name)).toEqual(['Review team', 'Build team'])
    expect(controller.store.getSnapshot().dirty).toBe(true)
    expect(form.mutations).toHaveLength(0)
    controller.dispose()
  })

  it('reports the Team and the agent names a document collides with', () => {
    const { controller } = controllerFor([shareable()])
    const plan = planOf(controller, serializeTeamPreset(incoming()))
    expect(plan).toMatchObject({
      targetIndex: 0,
      targetName: 'Review team',
      captainConflict: 'team-lead',
      memberConflicts: ['reviewer'],
      suggestedTeamName: 'Review team 2',
      suggestedCaptainName: 'team-lead 2',
    })
    controller.dispose()
  })

  it('overwrites the named Team, keeping its local route and tool policy', () => {
    const { controller } = controllerFor([shareable()])
    const plan = planOf(controller, serializeTeamPreset(incoming()))
    const id = controller.applyImport(plan, {
      team: 'replace', teamName: plan.suggestedTeamName, captain: 'replace', members: {},
    })
    expect(id).toBe('team-1')
    const teams = controller.store.getSnapshot().teams
    expect(teams).toHaveLength(1)
    expect(teams[0]).toMatchObject({ description: 'New purpose' })
    expect(teams[0]?.captain).toMatchObject({
      name: 'team-lead', description: 'new lead', systemPrompt: 'Lead anew.',
      toolMode: 'custom', tools: ['read'],
    })
    // The document's member wins the shared fields; the route it never carried stays.
    expect(teams[0]?.members[0]).toMatchObject({
      name: 'reviewer', description: 'new checks', systemPrompt: 'Check anew.', color: '#e05c6b',
      provider: 'deepseek', model: 'deepseek-chat', reasoningEffort: 'high',
    })
    expect(teams[0]?.members[1]).toMatchObject({ name: 'builder', provider: '', toolMode: 'all' })
    controller.dispose()
  })

  it('renames the imported captain and member when the user asks for new names', () => {
    const { controller } = controllerFor([shareable()])
    const plan = planOf(controller, serializeTeamPreset(incoming()))
    controller.applyImport(plan, {
      team: 'replace', teamName: plan.suggestedTeamName, captain: 'rename', members: { reviewer: 'rename' },
    })
    const team = controller.store.getSnapshot().teams[0]
    expect(team?.captain.name).toBe('team-lead 2')
    // The configured member is kept, and the imported one joins under a free name.
    expect(team?.members.map(member => member.name)).toEqual(['reviewer', 'reviewer 2', 'builder'])
    controller.dispose()
  })

  it('adds the document as a new Team under the resolved name', () => {
    const { controller } = controllerFor([shareable()])
    const plan = planOf(controller, serializeTeamPreset(incoming()))
    const id = controller.applyImport(plan, {
      team: 'rename', teamName: plan.suggestedTeamName, captain: 'replace', members: {},
    })
    expect(id).toBe('team-2')
    const teams = controller.store.getSnapshot().teams
    expect(teams.map(team => team.name)).toEqual(['Review team', 'Review team 2'])
    expect(teams[1]?.members.map(member => member.name)).toEqual(['reviewer', 'builder'])
    expect(teams[1]?.members[0]).toMatchObject({ provider: '', model: '' })
    controller.dispose()
  })

  it('refuses a document that is not a Team preset without staging anything', () => {
    const { controller } = controllerFor([shareable()])
    expect(controller.inspectImport('{')).toEqual({ ok: false, reason: 'invalid-json' })
    expect(controller.store.getSnapshot().dirty).toBe(false)
    expect(controller.store.getSnapshot().teams).toHaveLength(1)
    controller.dispose()
  })

  it('exposes both operations through the injected face', () => {
    const { controller } = controllerFor([shareable()])
    const injected = controller.inject()
    expect(injected.exportTeam(0)).toContain('"format": "dsh-agent-team-preset"')
    const plan = planOf(controller, serializeTeamPreset({ ...shareable(), id: 'team-9', name: 'Build team' }))
    expect(injected.applyImport(plan, defaultImportResolution(plan))).toBe('team-2')
    controller.dispose()
  })
})

describe('the Host execution stream', () => {
  /** One controller over the stored section and a scripted stream. */
  function streaming() {
    const streams = executionStreams()
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form, { execution: streams.open }))
    return { streams, form, controller }
  }

  it('reports unknown until the first frame, then the Host state', async () => {
    const { streams, controller } = streaming()
    expect(controller.store.getSnapshot()).toMatchObject({ execution: 'loading', executions: [] })
    expect(executionStateOf(controller.store.getSnapshot(), 'team-1')).toBe('unknown')

    controller.loadCatalogue()
    expect(streams.opened).toHaveLength(1)
    streams.opened[0]?.push({ teams: [executionRow('team-1', 'busy')] })
    await settle()

    expect(controller.store.getSnapshot()).toMatchObject({
      execution: 'ready',
      executions: [executionRow('team-1', 'busy')],
    })
    expect(executionStateOf(controller.store.getSnapshot(), 'team-1')).toBe('busy')
    controller.dispose()
  })

  it('falls back to unknown when the stream fails, never to its last idle frame', async () => {
    const { streams, controller } = streaming()
    controller.loadCatalogue()
    streams.opened[0]?.push({ teams: [executionRow('team-1', 'idle')] })
    await settle()
    expect(executionStateOf(controller.store.getSnapshot(), 'team-1')).toBe('idle')

    streams.opened[0]?.fail(new Error('the carrier dropped'))
    await settle()
    expect(controller.store.getSnapshot()).toMatchObject({ execution: 'error', executions: [] })
    expect(executionStateOf(controller.store.getSnapshot(), 'team-1')).toBe('unknown')
    controller.dispose()
  })

  it('reports unknown when the Host does not serve the stream at all', async () => {
    const form = scriptedForm({ value: SECTION })
    const controller = new TeamPresetsController(scriptedContext(form.form, {
      execution: () => { throw new Error('teamPresets.execution is not a function') },
    }))
    controller.loadCatalogue()
    await settle()
    expect(controller.store.getSnapshot()).toMatchObject({ execution: 'error' })
    expect(executionStateOf(controller.store.getSnapshot(), 'team-1')).toBe('unknown')
    controller.dispose()
  })

  it('re-subscribes on refresh and ignores a superseded generation', async () => {
    const { streams, controller } = streaming()
    controller.loadCatalogue()
    streams.opened[0]?.fail(new Error('the carrier dropped'))
    await settle()
    expect(controller.store.getSnapshot()).toMatchObject({ execution: 'error' })

    controller.refreshCatalogue()
    expect(streams.opened).toHaveLength(2)
    streams.opened[1]?.push({ teams: [executionRow('team-1', 'idle')] })
    await settle()
    expect(executionStateOf(controller.store.getSnapshot(), 'team-1')).toBe('idle')

    // The dead generation may still deliver a frame; it must publish nothing.
    streams.opened[0]?.push({ teams: [executionRow('team-1', 'busy')] })
    await settle()
    expect(executionStateOf(controller.store.getSnapshot(), 'team-1')).toBe('idle')
    controller.dispose()
  })

  it('keeps one live subscription, so a superseded generation cannot deliver a frame', async () => {
    const { streams, controller } = streaming()
    controller.loadCatalogue()
    streams.opened[0]?.push({ teams: [executionRow('team-1', 'idle')] })
    await settle()
    expect(executionStateOf(controller.store.getSnapshot(), 'team-1')).toBe('idle')

    // A Host notification re-reads the catalogues, but a subscription that is
    // still open is not replaced: two generations never coexist, which is what
    // keeps a frame from a superseded read out of the published state.
    controller.refreshCatalogue()
    expect(streams.opened).toHaveLength(1)
    expect(executionStateOf(controller.store.getSnapshot(), 'team-1')).toBe('idle')

    // The next subscription opens only once the live read ended, and its frames
    // are the ones the page reports.
    streams.opened[0]?.fail(new Error('the carrier dropped'))
    await settle()
    expect(controller.store.getSnapshot()).toMatchObject({ execution: 'error' })
    controller.refreshCatalogue()
    expect(streams.opened).toHaveLength(2)
    streams.opened[1]?.push({ teams: [executionRow('team-1', 'busy')] })
    await settle()
    expect(executionStateOf(controller.store.getSnapshot(), 'team-1')).toBe('busy')
    controller.dispose()
  })

  it('leaves the draft and its report untouched by stream frames', async () => {
    const { streams, controller } = streaming()
    controller.loadCatalogue()
    streams.opened[0]?.push({ teams: [executionRow('team-1', 'idle')] })
    await settle()

    controller.patchCaptain(0, { systemPrompt: 'DRAFT_A' })
    controller.createTeam()
    streams.opened[0]?.push({ teams: [executionRow('team-1', 'busy')] })
    await settle()

    const state = controller.store.getSnapshot()
    expect(state.dirty).toBe(true)
    expect(state.teams.map(entry => entry.id)).toEqual(['team-1', 'team-2'])
    expect(state.teams[0]?.captain.systemPrompt).toBe('DRAFT_A')
    controller.dispose()
  })

  it('picks the hint copy of each state, in both languages', () => {
    const base = new TeamPresetsController(scriptedContext(scriptedForm({ value: SECTION }).form))
    const state = base.store.getSnapshot()
    base.dispose()

    expect(executionStateOf({ ...state, execution: 'loading' }, 'team-1')).toBe('unknown')
    expect(executionStateOf({ ...state, execution: 'error' }, 'team-1')).toBe('unknown')
    expect(executionStateOf({ ...state, execution: 'ready' }, 'team-1')).toBe('unknown')
    expect(executionStateOf({ ...state, execution: 'ready', executions: [executionRow('team-1', 'idle')] }, 'team-1')).toBe('idle')
    expect(executionStateOf({ ...state, execution: 'ready', executions: [executionRow('team-1', 'busy')] }, 'team-1')).toBe('busy')

    for (const execution of ['idle', 'busy', 'unknown'] as const) {
      const key = EXECUTION_NOTICE_KEYS[execution]
      expect(en[key].trim()).not.toBe('')
      expect(zh[key].trim()).not.toBe('')
    }
    // The three states must not read alike, or the page would mislead.
    expect(new Set(Object.values(EXECUTION_NOTICE_KEYS)).size).toBe(3)
    expect(zh[EXECUTION_NOTICE_KEYS.busy]).toContain('下一次团队任务')
    expect(zh[EXECUTION_NOTICE_KEYS.idle]).toContain('立即生效')
    expect(zh[EXECUTION_NOTICE_KEYS.unknown]).toContain('无法确认')
  })
})

describe('teamAppearance', () => {
  /** One Team whose captain and member carry the colors a test asserts. */
  function colored(): TeamPreset {
    return {
      ...preset([{ ...EMPTY_AGENT, name: 'ui-designer', color: '#2fbf71' }]),
      captain: { ...EMPTY_CAPTAIN, name: 'team-lead', color: '#4c8dff' },
    }
  }

  /** One selection record pointing at the supplied Team. */
  function selection(teamId: string): TeamSelectionRecordView {
    return { sessionId: 's1', teamId }
  }

  it('resolves the captain and member colors of the selected Team', () => {
    const colors = teamAppearance([colored()], [selection('team-1')], 's1')
    expect(colors?.captain).toBe('#4c8dff')
    expect(colors?.members.get('ui-designer')).toBe('#2fbf71')
  })

  it('keys a member by the target the captain summons', () => {
    const team: TeamPreset = {
      ...preset([{ ...EMPTY_AGENT, name: '审查者', color: '#e05c6b' }]),
      captain: { ...EMPTY_CAPTAIN, color: '#4c8dff' },
    }
    expect(teamAppearance([team], [selection('team-1')], 's1')?.members.get('member-1')).toBe('#e05c6b')
  })

  it('resolves nothing for a Session that selected no Team', () => {
    expect(teamAppearance([colored()], [], 's1')).toBeUndefined()
  })

  it('resolves nothing when the selection names a Team that no longer exists', () => {
    expect(teamAppearance([colored()], [selection('team-9')], 's1')).toBeUndefined()
  })

  it('resolves nothing for another Session', () => {
    expect(teamAppearance([colored()], [selection('team-1')], 's2')).toBeUndefined()
  })
})
