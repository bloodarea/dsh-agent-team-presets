/**
 * Staged Team preset editing over the `agent-team-presets` settings namespace,
 * plus the per-Session Team selection the composer control writes.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import type { ModelCatalog, ModelProviderGroup, SettingsPathOpView } from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { toolMode, withSelection } from '../presets.ts'
import type { TeamAgentPreset, TeamCaptainPreset, TeamPreset, TeamPresetsSection, ToolChoice } from '../types.ts'

/**
 * Loader entry id of the Host row that owns the Team preset namespace. Spelled
 * here rather than imported: a client package must not depend on a Host package.
 */
export const TEAM_PRESETS_NS = 'agent-team-presets'

/** Colors offered for a member's accent mark. */
export const AGENT_COLORS: readonly string[] = [
  '#4c8dff', '#2fbf71', '#e0a43c', '#e05c6b', '#8d6bff', '#25b0c4', '#c46bd0', '#8a94a6',
]

/** One provider offered by the model picker. */
export interface ProviderChoice {
  /** Provider route id. */
  readonly id: string
  /** Display name. */
  readonly name: string
  /** Models the provider currently advertises. */
  readonly models: readonly ModelChoice[]
}

/** One model offered by the model picker. */
export interface ModelChoice {
  /** Provider-owned model id. */
  readonly id: string
  /** Display name. */
  readonly name: string
  /** Adapter-owned reasoning efforts this route accepts. */
  readonly efforts: readonly { readonly id: string; readonly name: string }[]
}

/** Everything the page and the composer control render. */
export interface TeamPresetsState {
  /** Settings sync state of the Team preset namespace. */
  readonly status: 'loading' | 'ready' | 'unavailable'
  /** Whether the Host document accepts writes. */
  readonly writable: boolean
  /** Whether a save is crossing the wire. */
  readonly saving: boolean
  /** Whether the last save was refused. */
  readonly failed: boolean
  /** Stored Teams, or the staged draft while one is open. */
  readonly teams: readonly TeamPreset[]
  /** Every Session's stored Team selection. */
  readonly selections: readonly TeamSelectionRecordView[]
  /** Whether the page holds edits a save would write. */
  readonly dirty: boolean
  /** Provider/model choices the pickers render. */
  readonly providers: readonly ProviderChoice[]
  /** Whether the model catalogue is still loading or failed. */
  readonly catalogue: 'idle' | 'loading' | 'ready' | 'error'
  /** Whether some provider failed its catalogue lookup, so its models are absent. */
  readonly cataloguePartial: boolean
  /** Global tools a member allow-list may name. */
  readonly tools: readonly ToolChoice[]
  /** Whether the tool catalogue is still loading or failed. */
  readonly toolCatalogue: 'idle' | 'loading' | 'ready' | 'error'
}

/** One stored Session selection as the page reads it. */
export interface TeamSelectionRecordView {
  /** Session identity. */
  readonly sessionId: string
  /** Selected Team identity. */
  readonly teamId: string
}

const EMPTY: TeamPresetsSection = { teams: [], selections: [] }

/**
 * Convert one staged member into the JSON value a settings write carries.
 * @param agent - the staged member.
 * @returns the mutable JSON record the settings document stores.
 */
function agentJson(agent: TeamAgentPreset): JsonValue {
  return {
    name: agent.name,
    color: agent.color,
    description: agent.description,
    provider: agent.provider,
    model: agent.model,
    reasoningEffort: agent.reasoningEffort,
    toolMode: toolMode(agent),
    tools: [...agent.tools],
    systemPrompt: agent.systemPrompt,
  }
}

/**
 * Convert one staged captain into the JSON value a settings write carries.
 *
 * A captain leads on the model the Session already selected, so the write never
 * restates a route: dropping those members here is what removes them from the
 * stored document.
 * @param captain - the staged captain.
 * @returns the mutable JSON record the settings document stores.
 */
function captainJson(captain: TeamCaptainPreset): JsonValue {
  return {
    name: captain.name,
    color: captain.color,
    description: captain.description,
    toolMode: toolMode(captain),
    tools: [...captain.tools],
    systemPrompt: captain.systemPrompt,
  }
}

/**
 * Convert one staged Team into the JSON value a settings write carries.
 * @param team - the staged Team preset.
 * @returns the mutable JSON record the settings document stores.
 */
function teamJson(team: TeamPreset): JsonValue {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    captain: captainJson(team.captain),
    members: team.members.map(member => agentJson(member)),
  }
}

/**
 * Whether one stored Team still matches a staged draft, so the page can tell
 * a duplicate from a real edit.
 * @param a - left Team.
 * @param b - right Team.
 * @returns whether both serialize identically.
 */
function sameTeam(a: TeamPreset, b: TeamPreset): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Create an empty Team preset with a unique identity.
 * @param existing - Teams already configured.
 * @returns a new, unnamed Team preset.
 */
export function createTeamPreset(existing: readonly TeamPreset[]): TeamPreset {
  let index = existing.length + 1
  let id = `team-${index}`
  while (existing.some(team => team.id === id)) {
    index += 1
    id = `team-${index}`
  }
  return {
    id,
    name: '',
    description: '',
    captain: emptyCaptainPreset(),
    members: [],
  }
}

/**
 * Create an empty captain preset.
 * @returns the empty captain every new Team starts from.
 */
export function emptyCaptainPreset(): TeamCaptainPreset {
  return {
    name: '',
    color: '',
    description: '',
    toolMode: 'all',
    tools: [],
    systemPrompt: '',
  }
}

/**
 * Create an empty member preset.
 * @returns the empty preset every new member starts from.
 */
export function emptyAgentPreset(): TeamAgentPreset {
  return {
    ...emptyCaptainPreset(),
    provider: '',
    model: '',
    reasoningEffort: '',
  }
}

/** Owns the page's staged edits and the composer's immediate selection writes. */
export class TeamPresetsController {
  /** Observable page state the slot registrations expose to their components. */
  readonly store: SnapshotStore<TeamPresetsState>
  private readonly form: ConfigForm<TeamPresetsSection>
  private readonly unsubscribe: () => void
  private draft: TeamPreset[] | undefined
  private draftRevision: number | undefined
  private providers: readonly ProviderChoice[] = []
  private catalogue: TeamPresetsState['catalogue'] = 'idle'
  private cataloguePartial = false
  private catalogueLoading = false
  private catalogueGeneration = 0
  private tools: readonly ToolChoice[] = []
  private toolCatalogue: TeamPresetsState['toolCatalogue'] = 'idle'
  private toolCatalogueLoading = false
  private disposed = false

  /**
   * @param ctx - the browser plugin context providing the shared configuration forms.
   */
  constructor(private readonly ctx: Context) {
    this.form = ctx.configForms.get<TeamPresetsSection>(TEAM_PRESETS_NS)
    this.store = createSnapshotStore(this.projection())
    this.unsubscribe = this.form.subscribe(() => { this.publish() })
  }

  /** Release the form subscription. */
  dispose(): void {
    this.disposed = true
    this.unsubscribe()
  }

  private projection(): TeamPresetsState {
    const snapshot = this.form.getSnapshot()
    const stored = snapshot.value ?? EMPTY
    return {
      status: snapshot.status === 'ready' ? 'ready' : snapshot.status === 'loading' ? 'loading' : 'unavailable',
      writable: snapshot.writable,
      saving: false,
      failed: false,
      teams: this.draft ?? stored.teams,
      selections: stored.selections,
      dirty: this.draft !== undefined,
      providers: this.providers,
      catalogue: this.catalogue,
      cataloguePartial: this.cataloguePartial,
      tools: this.tools,
      toolCatalogue: this.toolCatalogue,
    }
  }

  private publish(patch: Partial<TeamPresetsState> = {}): void {
    if (this.disposed) return
    this.store.set({ ...this.projection(), ...patch })
  }

  /**
   * The business face both slot registrations inject.
   * @returns the state store and the page and composer callbacks.
   */
  inject(): TeamPresetsInjected {
    return {
      hooks: { teamPresets: this.store },
      createTeam: () => this.createTeam(),
      duplicateTeam: (index: number) => this.duplicateTeam(index),
      removeTeam: (index: number) => { this.removeTeam(index) },
      addMember: (teamIndex: number) => { this.addMember(teamIndex) },
      removeMember: (teamIndex: number, memberIndex: number) => { this.removeMember(teamIndex, memberIndex) },
      patchTeam: (index: number, patch: Partial<TeamPreset>) => { this.patchTeam(index, patch) },
      patchCaptain: (teamIndex: number, patch: Partial<TeamCaptainPreset>) => { this.patchCaptain(teamIndex, patch) },
      patchMember: (teamIndex: number, memberIndex: number, patch: Partial<TeamAgentPreset>) => {
        this.patchMember(teamIndex, memberIndex, patch)
      },
      save: () => this.save(),
      discard: () => { this.discard() },
      selectTeam: (sessionId: string, teamId: string | undefined) => this.selectTeam(sessionId, teamId),
      loadCatalogue: () => { this.loadCatalogue() },
      refreshCatalogue: () => { this.refreshCatalogue() },
    }
  }

  /** Read the provider/model catalogue and the tool catalogue the pickers render. */
  loadCatalogue(): void {
    this.loadModelCatalogue()
    this.loadToolCatalogue()
  }

  /**
   * Discard both catalogues and read them again from the Host.
   *
   * The Host catalogue is not part of any settings section: adapters,
   * credentials, and other settings documents change which routes exist, and a
   * provider may simply have been unavailable when this plugin mounted. Every
   * caller therefore asks for a fresh read instead of reusing the one already
   * held, and an answer still in flight is fenced out by
   * {@link catalogueGeneration} so it cannot overwrite the newer one.
   */
  refreshCatalogue(): void {
    if (this.disposed) return
    this.catalogueGeneration += 1
    this.catalogueLoading = false
    this.catalogue = 'idle'
    this.cataloguePartial = false
    this.toolCatalogueLoading = false
    this.toolCatalogue = 'idle'
    this.publish()
    this.loadCatalogue()
  }

  /**
   * Whether one catalogue answer still belongs to the current read.
   * @param generation - the read generation captured when the request started.
   * @returns whether the answer may be published.
   */
  private acceptsCatalogue(generation: number): boolean {
    return !this.disposed && generation === this.catalogueGeneration
  }

  private loadModelCatalogue(): void {
    if (this.catalogueLoading || this.catalogue === 'ready') return
    const generation = this.catalogueGeneration
    this.catalogueLoading = true
    this.catalogue = 'loading'
    this.publish()
    const read = this.ctx.remote.session.modelCatalog()
    void read.then((result) => {
      if (!this.acceptsCatalogue(generation)) return
      if (!result.ok) throw new Error(result.error.message)
      this.providers = result.value.groups.map(group => describeGroup(group))
      this.cataloguePartial = result.value.failures.length > 0
      this.catalogue = 'ready'
      this.catalogueLoading = false
      this.publish()
    }).catch(() => {
      if (!this.acceptsCatalogue(generation)) return
      this.catalogue = 'error'
      this.catalogueLoading = false
      this.publish()
    })
  }

  private loadToolCatalogue(): void {
    if (this.toolCatalogueLoading || this.toolCatalogue === 'ready') return
    const generation = this.catalogueGeneration
    this.toolCatalogueLoading = true
    this.toolCatalogue = 'loading'
    this.publish()
    const read = this.ctx.remote.teamPresets.catalog()
    void read.then((result) => {
      if (!this.acceptsCatalogue(generation)) return
      if (!result.ok) throw new Error(result.error.message)
      this.tools = result.value.tools.map(tool => ({ name: tool.name, description: tool.description }))
      this.toolCatalogue = 'ready'
      this.toolCatalogueLoading = false
      this.publish()
    }).catch(() => {
      if (!this.acceptsCatalogue(generation)) return
      this.toolCatalogue = 'error'
      this.toolCatalogueLoading = false
      this.publish()
    })
  }

  /**
   * Open the staged draft from the stored Teams.
   *
   * The published snapshot is deep-frozen outside production, so every edit
   * rebuilds the array and the touched record instead of mutating either.
   * @returns the current staged Teams.
   */
  private beginDraft(): TeamPreset[] {
    if (this.draft === undefined) {
      const snapshot = this.form.getSnapshot()
      this.draft = structuredClone(snapshot.value?.teams ?? []) as TeamPreset[]
      this.draftRevision = snapshot.revision
    }
    return this.draft
  }

  /**
   * Replace one Team record and publish.
   * @param index - the Team position to replace.
   * @param next - the replacement record.
   */
  private replaceTeam(index: number, next: TeamPreset): void {
    const draft = this.beginDraft()
    /* v8 ignore next -- every caller checks the staged position before delegating. */
    if (draft[index] === undefined) return
    this.draft = draft.map((team, position) => position === index ? next : team)
    this.publish()
  }

  /**
   * Append a new Team and open it.
   * @returns the new Team's identity.
   */
  createTeam(): string {
    const draft = this.beginDraft()
    const created = createTeamPreset(draft)
    this.draft = [...draft, created]
    this.publish()
    return created.id
  }

  /**
   * Copy one Team under a new identity.
   * @param index - the Team to copy.
   * @returns the copy's identity, or undefined for an unknown position.
   */
  duplicateTeam(index: number): string | undefined {
    const draft = this.beginDraft()
    const source = draft[index]
    if (source === undefined) return undefined
    const copy: TeamPreset = {
      ...structuredClone(source),
      id: createTeamPreset(draft).id,
      name: source.name === '' ? '' : `${source.name} copy`,
    }
    this.draft = [...draft.slice(0, index + 1), copy, ...draft.slice(index + 1)]
    this.publish()
    return copy.id
  }

  /**
   * Delete one Team.
   * @param index - the Team to delete.
   */
  removeTeam(index: number): void {
    const draft = this.beginDraft()
    this.draft = draft.filter((_, position) => position !== index)
    this.publish()
  }

  /**
   * Replace fields of one Team.
   * @param index - the Team to patch.
   * @param patch - the changed fields.
   */
  patchTeam(index: number, patch: Partial<TeamPreset>): void {
    const current = this.beginDraft()[index]
    if (current === undefined) return
    this.replaceTeam(index, { ...current, ...patch })
  }

  /**
   * Replace fields of one Team's captain.
   * @param teamIndex - the Team whose captain changes.
   * @param patch - the changed fields.
   */
  patchCaptain(teamIndex: number, patch: Partial<TeamCaptainPreset>): void {
    const current = this.beginDraft()[teamIndex]
    if (current === undefined) return
    this.replaceTeam(teamIndex, { ...current, captain: { ...current.captain, ...patch } })
  }

  /**
   * Replace fields of one member.
   * @param teamIndex - the Team that owns the member.
   * @param memberIndex - the member position.
   * @param patch - the changed fields.
   */
  patchMember(teamIndex: number, memberIndex: number, patch: Partial<TeamAgentPreset>): void {
    const team = this.beginDraft()[teamIndex]
    const member = team?.members[memberIndex]
    if (team === undefined || member === undefined) return
    this.replaceTeam(teamIndex, {
      ...team,
      members: team.members.map((entry, position) => position === memberIndex ? { ...entry, ...patch } : entry),
    })
  }

  /**
   * Append an empty member to one Team.
   * @param teamIndex - the Team that gains a member.
   */
  addMember(teamIndex: number): void {
    const team = this.beginDraft()[teamIndex]
    if (team === undefined) return
    this.replaceTeam(teamIndex, { ...team, members: [...team.members, emptyAgentPreset()] })
  }

  /**
   * Remove one member from a Team.
   * @param teamIndex - the Team that owns the member.
   * @param memberIndex - the member position.
   */
  removeMember(teamIndex: number, memberIndex: number): void {
    const team = this.beginDraft()[teamIndex]
    if (team === undefined) return
    this.replaceTeam(teamIndex, {
      ...team,
      members: team.members.filter((_, position) => position !== memberIndex),
    })
  }

  /** Write the staged Teams. */
  async save(): Promise<void> {
    const snapshot = this.form.getSnapshot()
    if (this.draft === undefined || snapshot.status !== 'ready' || !snapshot.writable) return
    const draft = this.draft
    const revision = this.draftRevision
    this.publish({ saving: true, failed: false })
    const landed = await this.form.mutate(
      [{ op: 'set', path: ['teams'], value: draft.map(team => teamJson(team)) } satisfies SettingsPathOpView],
      revision,
    )
    if (this.disposed) return
    if (landed) {
      this.draft = undefined
      this.draftRevision = undefined
    }
    this.publish({ saving: false, failed: !landed })
  }

  /** Drop every staged edit. */
  discard(): void {
    if (this.draft === undefined) return
    this.draft = undefined
    this.draftRevision = undefined
    this.publish()
  }

  /**
   * Apply one Team to a Session, or clear its Team.
   * @param sessionId - the Session whose Team changes.
   * @param teamId - the selected Team identity; undefined clears the selection.
   * @returns once the write settled.
   */
  async selectTeam(sessionId: string, teamId: string | undefined): Promise<void> {
    const snapshot = this.form.getSnapshot()
    if (snapshot.status !== 'ready' || !snapshot.writable) return
    const stored = snapshot.value ?? EMPTY
    const next = withSelection(stored.selections, sessionId, teamId)
    await this.form.mutate([{
      op: 'set',
      path: ['selections'],
      value: next.map(record => ({ sessionId: record.sessionId, teamId: record.teamId })),
    } satisfies SettingsPathOpView])
  }
}

/** Narrow one catalogue group into picker choices. */
function describeGroup(group: ModelProviderGroup): ProviderChoice {
  return {
    id: group.id,
    name: group.name,
    models: group.models.map(model => ({
      id: model.id,
      name: model.name,
      efforts: (model.reasoning?.efforts ?? []).map(effort => ({ id: effort.id, name: effort.name })),
    })),
  }
}

/** Business face the page and composer registrations inject. */
export interface TeamPresetsInjected {
  hooks: {
    /** Page state bound by the renderer as `useTeamPresets`. */
    teamPresets: SnapshotStore<TeamPresetsState>
  }
  createTeam: () => string
  duplicateTeam: (index: number) => string | undefined
  removeTeam: (index: number) => void
  addMember: (teamIndex: number) => void
  removeMember: (teamIndex: number, memberIndex: number) => void
  patchTeam: (index: number, patch: Partial<TeamPreset>) => void
  patchCaptain: (teamIndex: number, patch: Partial<TeamCaptainPreset>) => void
  patchMember: (teamIndex: number, memberIndex: number, patch: Partial<TeamAgentPreset>) => void
  save: () => Promise<void>
  discard: () => void
  selectTeam: (sessionId: string, teamId: string | undefined) => Promise<void>
  loadCatalogue: () => void
  /** Re-read both catalogues from the Host, discarding anything already held. */
  refreshCatalogue: () => void
}

export { sameTeam }
export type { ModelCatalog }
