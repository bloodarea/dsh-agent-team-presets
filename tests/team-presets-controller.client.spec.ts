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
  emptyAgentPreset,
  emptyCaptainPreset,
  sameTeam,
} from '../src/client/team-presets-controller.ts'
import { teamAppearance } from '../src/client/appearance.ts'
import type { TeamSelectionRecordView } from '../src/client/team-presets-controller.ts'
import type { TeamAgentPreset, TeamCaptainPreset, TeamPreset, TeamPresetsSection, ToolChoice } from '../src/types.ts'

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
  landed?: boolean
} = {}) {
  const mutations: { ops: readonly SettingsPathOpView[]; revision: number | undefined }[] = []
  const listeners = new Set<() => void>()
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
      const landed = options.landed ?? true
      // A real ConfigForm folds an accepted write back into the mirror, so the
      // next read sees it; the stand-in reproduces that read-back.
      if (landed) {
        let next = snapshot.value ?? { teams: [], selections: [] }
        for (const op of ops) {
          if (op.op === 'set' && op.path.length === 1 && typeof op.path[0] === 'string') {
            next = { ...next, [op.path[0]]: op.value }
          }
        }
        snapshot = { ...snapshot, value: next }
      }
      return landed
    },
    set: async () => options.landed ?? true,
    unset: async () => options.landed ?? true,
  }
  return {
    form,
    mutations,
    listenerCount: () => listeners.size,
    /** Deliver a form change exactly as the shared mirror would. */
    publishChange: () => { for (const listener of listeners) listener() },
    replace: (next: Partial<ConfigFormSnapshot<TeamPresetsSection>>) => { snapshot = { ...snapshot, ...next } },
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
      },
    },
  }
  const ctx = new Context()
  Object.defineProperty(ctx, 'configForms', { value: partial.configForms })
  Object.defineProperty(ctx, 'remote', { value: partial.remote })
  return ctx
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
