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
import {
  applySharedFields,
  importConflicts,
  memberFromTransfer,
  parseTeamPresetText,
  serializeTeamPreset,
  slotNameKey,
  teamFromTransfer,
  uniqueName,
} from '../preset-transfer.ts'
import type { TeamPresetImportFailure, TeamPresetTransfer } from '../preset-transfer.ts'
import type {
  TeamAgentPreset, TeamCaptainPreset, TeamExecutionRow, TeamExecutionState, TeamPreset, TeamPresetsSection, ToolChoice,
} from '../types.ts'

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
  /** Team definitions the Host rewrote behind the page, or undefined while none was adopted. */
  readonly externalUpdate: ExternalUpdateNotice | undefined
  /** Whether the Host execution stream has delivered a frame the page can trust. */
  readonly execution: 'loading' | 'ready' | 'error'
  /** Execution state of every Team the Host reports, empty while it is not trusted. */
  readonly executions: readonly TeamExecutionRow[]
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

/**
 * Resolve the execution state of one Team as the page must show it.
 *
 * A stream that has not delivered its first frame, or that failed, leaves every
 * Team `unknown`: an idle claim the page cannot support is worse than no claim,
 * because the page promises when a save takes effect.
 * @param state - the page state carrying the stream health and its rows.
 * @param teamId - the Team the page is editing.
 * @returns the execution state the footer reports.
 */
export function executionStateOf(state: TeamPresetsState, teamId: string): TeamExecutionState {
  if (state.execution !== 'ready') return 'unknown'
  return state.executions.find(row => row.teamId === teamId)?.state ?? 'unknown'
}

/** One adopted external Team update, as the page's status line reports it. */
export interface ExternalUpdateNotice {
  /** Display names of the adopted Teams in page order; an unnamed Team reports its id. */
  readonly teams: readonly string[]
  /** The subset of {@link teams} whose staged edit the saved version replaced. */
  readonly overridden: readonly string[]
  /** Display names of the Teams the Host added behind the draft, which joined it. */
  readonly added: readonly string[]
  /** Display names of the Teams the Host deleted behind the draft, which left it. */
  readonly removed: readonly string[]
  /** The subset of {@link removed} whose staged edit was dropped with the Team. */
  readonly removedEdited: readonly string[]
}

/** One stored Session selection as the page reads it. */
export interface TeamSelectionRecordView {
  /** Session identity. */
  readonly sessionId: string
  /** Selected Team identity. */
  readonly teamId: string
}

/** What one import will do, once the document was read and its collisions are known. */
export type TeamPresetImportPlan = {
  /** The document being imported. */
  readonly transfer: TeamPresetTransfer
  /** Index of the Team the document would overwrite, or undefined when it adds one. */
  readonly targetIndex: number | undefined
  /** Display name of that Team, for the dialog that resolves the collision. */
  readonly targetName: string
  /** The captain name that Team already uses, or an empty string when it is free. */
  readonly captainConflict: string
  /** Member names that Team already uses, in document order. */
  readonly memberConflicts: readonly string[]
  /** Name the document's Team takes when it is added as a new Team. */
  readonly suggestedTeamName: string
  /** Name the document's captain takes when it is renamed. */
  readonly suggestedCaptainName: string
}

/** Result of reading one shared document into a plan. */
export type TeamPresetImportInspection =
  | { readonly ok: false; readonly reason: TeamPresetImportFailure }
  | { readonly ok: true; readonly plan: TeamPresetImportPlan }

/** How one import resolves the collisions it found. */
export type TeamPresetImportResolution = {
  /** Overwrite the same-named Team, or add the document as a new Team. */
  readonly team: 'replace' | 'rename'
  /** Name the added Team takes when it is not overwriting one. */
  readonly teamName: string
  /** Overwrite the target Team's captain, or name the imported captain differently. */
  readonly captain: 'replace' | 'rename'
  /** Per conflicting member name: overwrite that member, or add the imported one renamed. */
  readonly members: Readonly<Record<string, 'replace' | 'rename'>>
}

/**
 * The resolution one document needs when the user was asked nothing.
 * @param plan - the inspection of the document.
 * @returns the resolution that adds the document as a new Team.
 */
export function defaultImportResolution(plan: TeamPresetImportPlan): TeamPresetImportResolution {
  return {
    team: plan.targetIndex === undefined ? 'rename' : 'replace',
    teamName: plan.suggestedTeamName,
    captain: 'replace',
    members: {},
  }
}

/**
 * Overwrite the fields one document carries on the Team it targets.
 *
 * The document wins for the Team's name, purpose, and every agent's shared
 * fields; every field the format does not carry — a member's route and each
 * agent's tool policy — stays exactly as it was. A document member the target
 * does not name is appended, and a target member the document does not mention
 * is kept, so an import never deletes work the document cannot describe.
 * @param target - the configured Team being overwritten.
 * @param plan - the inspection carrying the document and its free replacement names.
 * @param resolution - the choices made for the captain and each colliding member.
 * @returns the overwritten Team, keeping the target's local identity.
 */
function mergeTransfer(
  target: TeamPreset,
  plan: TeamPresetImportPlan,
  resolution: TeamPresetImportResolution,
): TeamPreset {
  const members = [...target.members]
  for (const incoming of plan.transfer.team.members) {
    const key = slotNameKey(incoming.name)
    const at = key === '' ? -1 : members.findIndex(member => slotNameKey(member.name) === key)
    if (at >= 0 && (resolution.members[incoming.name] ?? 'replace') === 'replace') {
      const existing = members[at]
      if (existing !== undefined) {
        members[at] = applySharedFields(existing, incoming)
        continue
      }
    }
    const name = uniqueName(incoming.name, members.map(member => member.name))
    members.push(memberFromTransfer({ ...incoming, name }))
  }
  const captain = plan.transfer.team.captain
  const captainName = resolution.captain === 'rename' ? plan.suggestedCaptainName : captain.name
  return {
    id: target.id,
    name: plan.transfer.team.name,
    description: plan.transfer.team.description,
    captain: applySharedFields(target.captain, { ...captain, name: captainName }),
    members,
  }
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
 * The name the page shows for one Team.
 * @param team - the Team to name.
 * @returns its display name, or its id while the Team is unnamed.
 */
function teamLabel(team: TeamPreset): string {
  return team.name === '' ? team.id : team.name
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
  /**
   * The Host's Teams as they stood when the draft opened, by Team id. What the
   * page reconciles an external write against: only a Team whose stored record
   * moved away from this baseline was changed behind the draft.
   */
  private draftBase: ReadonlyMap<string, TeamPreset> | undefined
  /**
   * The last external update this page adopted, kept until the user acts on
   * the draft again. Unrelated form changes leave it standing, so the status
   * line is not wiped by a catalogue refresh or another Session's selection.
   */
  private externalUpdate: ExternalUpdateNotice | undefined
  /** Whether a write this page started is still crossing the wire. */
  private saving = false
  /** Stream health of the Host execution state, and the frames it delivered. */
  private execution: TeamPresetsState['execution'] = 'loading'
  private executions: readonly TeamExecutionRow[] = []
  private executionGeneration = 0
  private executionAbort: AbortController | undefined
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
    this.unsubscribe = this.form.subscribe(() => {
      this.reconcile()
      this.publish()
    })
  }

  /** Release the form subscription and the execution stream. */
  dispose(): void {
    this.disposed = true
    this.executionGeneration += 1
    this.executionAbort?.abort()
    this.executionAbort = undefined
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
      teams: this.visibleTeams(),
      selections: stored.selections,
      dirty: this.draft !== undefined,
      externalUpdate: this.externalUpdate,
      execution: this.execution,
      executions: this.executions,
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
   * The Teams the page currently shows.
   *
   * A draft shadows the stored value while one is open, so an export and an
   * import both see exactly what the user sees.
   * @returns the staged Teams, or the stored ones while nothing is staged.
   */
  private visibleTeams(): readonly TeamPreset[] {
    return this.draft ?? this.form.getSnapshot().value?.teams ?? []
  }

  /**
   * Fold a stored change that landed behind an open draft into the draft.
   *
   * An Agent that rewrites a Team through its tools saves without this page, so
   * the stored record of that Team is the newer definition and wins over the
   * staged one; every other Team keeps its unsaved edit. A Team the Host moved
   * away from the baseline the draft was opened on is adopted whole, a Team the
   * Host deleted leaves the draft, and a Team the Host added joins it — the
   * draft is the page's whole document, so saving it must neither drop what the
   * Host gained nor resurrect what the Host removed. A Team this page added
   * itself is the page's own and is never touched. The fence follows the Host
   * revision so what stays staged can still be saved.
   *
   * Once nothing but Host records remain, the draft is dropped rather than left
   * staged with nothing to write — including when a stored write landed on the
   * value the draft already held, which needs no replacement and is no conflict.
   * Everything the coordination did is reported through {@link externalUpdate},
   * naming what changed and whether a staged edit was replaced or dropped; a
   * change that coordinates nothing leaves the report standing.
   *
   * A write this page started owns the draft until it settles: its own
   * accepted view and the read a refusal triggers must never roll back or
   * discard what the user had staged when they pressed Save.
   */
  private reconcile(): void {
    if (this.draft === undefined || this.saving) return
    const snapshot = this.form.getSnapshot()
    const stored = snapshot.value?.teams
    const base = this.draftBase
    if (snapshot.status !== 'ready' || stored === undefined || base === undefined) return
    const hosts = new Map(stored.map(team => [team.id, team]))
    const draft = this.draft
    const staged = new Set(draft.map(team => team.id))
    const adopted: { name: string; overridden: boolean }[] = []
    const removed: { name: string; edited: boolean }[] = []
    const kept: TeamPreset[] = []
    for (const team of draft) {
      const host = hosts.get(team.id)
      const before = base.get(team.id)
      // A Team the baseline never held is this page's own, not the Host's.
      if (before === undefined) {
        kept.push(team)
        continue
      }
      if (host === undefined) {
        // The Host deleted a Team the draft still held: keeping it would
        // resurrect it on the next save.
        removed.push({ name: teamLabel(team), edited: !sameTeam(before, team) })
        continue
      }
      if (sameTeam(before, host) || sameTeam(team, host)) {
        kept.push(team)
        continue
      }
      adopted.push({ name: teamLabel(host), overridden: !sameTeam(before, team) })
      kept.push(structuredClone(host))
    }
    // A Team neither the draft nor the baseline held is the Host's addition.
    const added = stored.filter(host => !staged.has(host.id) && !base.has(host.id))
    this.draftBase = new Map(stored.map(team => [team.id, structuredClone(team)]))
    this.draftRevision = snapshot.revision
    const coordinated = adopted.length > 0 || removed.length > 0 || added.length > 0
    if (coordinated) {
      this.externalUpdate = {
        teams: adopted.map(entry => entry.name),
        overridden: adopted.filter(entry => entry.overridden).map(entry => entry.name),
        added: added.map(teamLabel),
        removed: removed.map(entry => entry.name),
        removedEdited: removed.filter(entry => entry.edited).map(entry => entry.name),
      }
    }
    const next = added.length === 0 ? kept : [...kept, ...added.map(host => structuredClone(host))]
    // Whatever the coordination did, a draft that now matches the Host field
    // for field has nothing left to save: it is dropped rather than left staged
    // as an "unsaved change" the user cannot see. A Host write that happened to
    // land on the staged value needs no replacement and reports nothing, and
    // the draft is still cleared here.
    if (next.length === stored.length && next.every((team, index) => {
      const host = stored[index]
      return host !== undefined && sameTeam(team, host)
    })) {
      this.draft = undefined
      this.draftBase = undefined
      this.draftRevision = undefined
      return
    }
    // An untouched draft keeps its identity, and the report the user may not
    // have seen yet stands.
    if (!coordinated) return
    this.draft = next
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
      exportTeam: (index: number) => this.exportTeam(index),
      inspectImport: (text: string) => this.inspectImport(text),
      applyImport: (plan: TeamPresetImportPlan, resolution: TeamPresetImportResolution) => {
        return this.applyImport(plan, resolution)
      },
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

  /** Read the provider/model catalogue, the tool catalogue, and the execution stream. */
  loadCatalogue(): void {
    this.loadModelCatalogue()
    this.loadToolCatalogue()
    this.ensureExecution()
  }

  /**
   * Open the Host execution stream unless this generation already holds one.
   *
   * The stream is the page's only live source of "is this Team executing", so
   * every page load and every Host notification re-subscribes a stream that
   * ended or failed — without a timer, and without trusting the last frame a
   * dead generation left behind.
   */
  private ensureExecution(): void {
    if (this.disposed || this.executionAbort !== undefined) return
    const abort = new AbortController()
    this.executionAbort = abort
    const generation = ++this.executionGeneration
    // Nothing is known until this generation's opening frame arrives.
    this.execution = 'loading'
    this.executions = []
    this.publish()
    void this.consumeExecution(abort, generation)
  }

  /**
   * Read whole-set execution frames until the stream ends.
   * @param abort - the generation's cancellation.
   * @param generation - the generation this read owns; a superseded read publishes nothing.
   */
  private async consumeExecution(abort: AbortController, generation: number): Promise<void> {
    try {
      for await (const frame of this.ctx.remote.teamPresets.execution(abort.signal)) {
        if (this.disposed || generation !== this.executionGeneration) return
        this.execution = 'ready'
        this.executions = frame.teams
        this.publish()
      }
      this.failExecution(generation)
    } catch (_failure) {
      this.failExecution(generation)
    }
  }

  /**
   * Record that the Host execution state is unknown.
   *
   * A stream that failed, or that ended without being cancelled, says nothing
   * about any Team: its last frame is dropped rather than kept as live truth.
   * @param generation - the generation whose read ended.
   */
  private failExecution(generation: number): void {
    if (this.disposed || generation !== this.executionGeneration) return
    this.executionAbort = undefined
    this.execution = 'error'
    this.executions = []
    this.publish()
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
   * rebuilds the array and the touched record instead of mutating either. A
   * user edit also retires the last external-update report: the page is once
   * again acting on the draft the user holds.
   * @returns the current staged Teams.
   */
  private beginDraft(): TeamPreset[] {
    this.externalUpdate = undefined
    if (this.draft === undefined) {
      const snapshot = this.form.getSnapshot()
      const stored = snapshot.value?.teams ?? []
      this.draft = structuredClone(stored) as TeamPreset[]
      this.draftBase = new Map(stored.map(team => [team.id, structuredClone(team)]))
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
   * Serialize one Team as the fixed shareable document.
   * @param index - the Team position to export.
   * @returns the document text, or undefined for a position the page does not show.
   */
  exportTeam(index: number): string | undefined {
    const team = this.visibleTeams()[index]
    return team === undefined ? undefined : serializeTeamPreset(team)
  }

  /**
   * Read one document and work out what importing it would collide with.
   *
   * Nothing is staged here: the caller decides whether the plan needs the user's
   * answer before {@link applyImport} touches the draft.
   * @param text - the document text the user chose.
   * @returns the plan, or the reason the document is not a Team preset of this format.
   */
  inspectImport(text: string): TeamPresetImportInspection {
    const parsed = parseTeamPresetText(text)
    if (!parsed.ok) return parsed
    return { ok: true, plan: { transfer: parsed.transfer, ...importConflicts(this.visibleTeams(), parsed.transfer) } }
  }

  /**
   * Stage one inspected document onto the draft.
   *
   * The document carries no identity, so it either overwrites the Team it is
   * named after — keeping that Team's local id, routes, and tool policies — or
   * joins the draft as a new Team under the resolved name.
   * @param plan - the inspection produced by {@link inspectImport}.
   * @param resolution - the user's answer for every collision in the plan.
   * @returns the identity of the staged Team.
   */
  applyImport(plan: TeamPresetImportPlan, resolution: TeamPresetImportResolution): string {
    const draft = this.beginDraft()
    const target = plan.targetIndex === undefined ? undefined : draft[plan.targetIndex]
    if (resolution.team === 'replace' && target !== undefined) {
      const merged = mergeTransfer(target, plan, resolution)
      this.draft = draft.map((team, position) => position === plan.targetIndex ? merged : team)
      this.publish()
      return target.id
    }
    const preferred = resolution.teamName.trim() === '' ? plan.transfer.team.name : resolution.teamName
    const name = uniqueName(preferred, draft.map(team => team.name))
    const created = { ...teamFromTransfer(plan.transfer, createTeamPreset(draft).id), name }
    this.draft = [...draft, created]
    this.publish()
    return created.id
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
    this.saving = true
    this.externalUpdate = undefined
    this.publish({ saving: true, failed: false })
    let landed = false
    try {
      landed = await this.form.mutate(
        [{ op: 'set', path: ['teams'], value: draft.map(team => teamJson(team)) } satisfies SettingsPathOpView],
        revision,
      )
    } finally {
      this.saving = false
    }
    if (this.disposed) return
    if (landed) {
      this.draft = undefined
      this.draftBase = undefined
      this.draftRevision = undefined
    } else {
      // A refused write leaves the page fenced on a revision the Host has moved
      // past, and the recovery read behind the refusal has already folded what
      // changed meanwhile. Coordinating again adopts that stored change and
      // re-aligns the fence, so the retry is a real retry instead of the same
      // conflict forever.
      this.reconcile()
    }
    this.publish({ saving: false, failed: !landed })
  }

  /** Drop every staged edit. */
  discard(): void {
    if (this.draft === undefined) return
    this.draft = undefined
    this.draftBase = undefined
    this.draftRevision = undefined
    this.externalUpdate = undefined
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
  /** Serialize one Team as the fixed shareable document, or undefined for an unknown position. */
  exportTeam: (index: number) => string | undefined
  /** Read one shared document and report what importing it would collide with. */
  inspectImport: (text: string) => TeamPresetImportInspection
  /** Stage one inspected document under the user's resolution of its collisions. */
  applyImport: (plan: TeamPresetImportPlan, resolution: TeamPresetImportResolution) => string
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
