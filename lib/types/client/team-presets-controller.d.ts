/**
 * Staged Team preset editing over the `agent-team-presets` settings namespace,
 * plus the per-Session Team selection the composer control writes.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { ModelCatalog } from '@deepseek-ai/dsh-api-remotes/client';
import { type SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { TeamPresetImportFailure, TeamPresetTransfer } from '../preset-transfer.ts';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { TeamRosterValue } from '../types.ts';
import type { TeamAgentPreset, TeamCaptainPreset, TeamCategory, TeamCategoryAssignment, TeamExecutionRow, TeamExecutionState, TeamPreset, ToolChoice } from '../types.ts';
/**
 * Loader entry id of the Host row that owns the Team preset namespace. Spelled
 * here rather than imported: a client package must not depend on a Host package.
 */
export declare const TEAM_PRESETS_NS = "agent-team-presets";
/** Colors offered for a member's accent mark. */
export declare const AGENT_COLORS: readonly string[];
/** One provider offered by the model picker. */
export interface ProviderChoice {
    /** Provider route id. */
    readonly id: string;
    /** Display name. */
    readonly name: string;
    /** Models the provider currently advertises. */
    readonly models: readonly ModelChoice[];
}
/** One model offered by the model picker. */
export interface ModelChoice {
    /** Provider-owned model id. */
    readonly id: string;
    /** Display name. */
    readonly name: string;
    /** Adapter-owned reasoning efforts this route accepts. */
    readonly efforts: readonly {
        readonly id: string;
        readonly name: string;
    }[];
}
/** Everything the page and the composer control render. */
export interface TeamPresetsState {
    /** Settings sync state of the Team preset namespace. */
    readonly status: 'loading' | 'ready' | 'unavailable';
    /** Whether the Host document accepts writes. */
    readonly writable: boolean;
    /** Whether a save is crossing the wire. */
    readonly saving: boolean;
    /** Whether the last save was refused. */
    readonly failed: boolean;
    /** Stored Teams, or the staged draft while one is open. */
    readonly teams: readonly TeamPreset[];
    /** Every Session's stored Team selection. */
    readonly selections: readonly TeamSelectionRecordView[];
    /** Whether the page holds edits a save would write. */
    readonly dirty: boolean;
    /** How the last restore of the shipped default presets resolved, until the user acts again. */
    readonly defaults: DefaultsRestore | undefined;
    /** Team definitions the Host rewrote behind the page, or undefined while none was adopted. */
    readonly externalUpdate: ExternalUpdateNotice | undefined;
    /**
     * Why this client cannot edit the stored section, or undefined when it can.
     *
     * A settings form that never reaches `ready` used to look exactly like one
     * that is still loading: the page showed a spinner forever and the composer
     * refused every click without saying so. Naming the state is what makes the
     * difference between "the deployment serves no Team section", "this page is
     * not backed by a Host document", and "the Host serves it but this client's
     * own form refused the stored value" — three conditions with three different
     * fixes, and only the third one is this plugin's to report.
     */
    readonly formIssue: TeamPresetsFormIssue | undefined;
    /** The last Team selection this client could not write, until the next attempt. */
    readonly selectionFailure: TeamSelectionFailure | undefined;
    /** Whether the Host execution stream has delivered a frame the page can trust. */
    readonly execution: 'loading' | 'ready' | 'error';
    /** Execution state of every Team the Host reports, empty while it is not trusted. */
    readonly executions: readonly TeamExecutionRow[];
    /** Provider/model choices the pickers render. */
    readonly providers: readonly ProviderChoice[];
    /** Whether the model catalogue is still loading or failed. */
    readonly catalogue: 'idle' | 'loading' | 'ready' | 'error';
    /** Whether some provider failed its catalogue lookup, so its models are absent. */
    readonly cataloguePartial: boolean;
    /** Global tools a member allow-list may name. */
    readonly tools: readonly ToolChoice[];
    /** Whether the tool catalogue is still loading or failed. */
    readonly toolCatalogue: 'idle' | 'loading' | 'ready' | 'error';
    /**
     * The reader's own Team categories, in display order.
     *
     * Local view data only: never part of a Team preset, never exported with one,
     * and never read by the runtime. Deleting one removes the grouping, never a
     * Team, which is why the page can offer it without a preset-level warning.
     */
    readonly categories: readonly TeamCategory[];
    /**
     * The live `teamId → categoryId` memberships.
     *
     * A membership whose Team or category no longer resolves is dropped from this
     * projection rather than shown as a broken group, and the next category write
     * persists the pruned list.
     */
    readonly teamCategories: readonly TeamCategoryAssignment[];
    /** Whether a category write is crossing the wire, so the dialog can settle. */
    readonly categorySaving: boolean;
    /** The last category write this client could not complete, until the next attempt. */
    readonly categoryFailure: CategoryWriteFailure | undefined;
    /**
     * The Session whose Team write this client is waiting on.
     *
     * The page promises when a selection takes effect, so the control shows that
     * it is still waiting instead of claiming the new Team before the Host has
     * reported the write.
     */
    readonly selectionPending: SelectionTarget | undefined;
}
/**
 * Why the stored section is not editable, as this client can observe it.
 *
 * `settings-unavailable` is the terminal process-local page: the Host keeps no
 * document for it, so nothing is stored and nothing can be. `namespace-missing`
 * is a deployment that never composed a row owning the `agent-team-presets`
 * namespace. `schema-rejected` is the one condition this client can name but not
 * repair: the Host serves the section, and the shared form refuses to accept the
 * value it holds, so the page keeps working off the describe mirror instead.
 */
export type TeamPresetsFormIssue = 'settings-unavailable' | 'namespace-missing' | 'schema-rejected';
/** One Team selection this client could not write. */
export interface TeamSelectionFailure {
    /** `unavailable`: nothing to write to. `refused`: the Host rejected the write. `failed`: the write did not complete. */
    readonly kind: 'unavailable' | 'refused' | 'failed';
    /** The Session whose Team the user tried to change. */
    readonly sessionId: string;
    /** The Team the user tried to apply, or undefined for "no Team". */
    readonly teamId: string | undefined;
    /** The Host's own refusal text, or the transport failure, when one exists. */
    readonly detail: string | undefined;
}
/** The Session whose Team selection this client is waiting on. */
export interface SelectionTarget {
    /** Session identity. */
    readonly sessionId: string;
    /** The Team being applied, or undefined when the selection is being cleared. */
    readonly teamId: string | undefined;
}
/**
 * One category write this client could not complete.
 *
 * Categories are local view data written on their own, so a failure here must
 * be reported on the dialog that caused it rather than in the page's save
 * status: the Team draft was not involved and is still exactly as it was.
 */
export interface CategoryWriteFailure {
    /** `unavailable`: nothing to write to. `refused`: the Host rejected the write. `failed`: the write did not complete. */
    readonly kind: 'unavailable' | 'refused' | 'failed';
    /** The Host's own refusal text, or the transport failure, when one exists. */
    readonly detail: string | undefined;
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
export declare function executionStateOf(state: TeamPresetsState, teamId: string): TeamExecutionState;
/**
 * Every Team in the open draft that has no name, so the save is withheld.
 *
 * A Team's name is its identity everywhere it is shown: the list, the composer
 * selector, and this page's own breadcrumb each fall back to the raw id when the
 * name is empty. Storing one therefore leaks an id into the UI instead of
 * failing visibly, so the unnamed Teams are named back to the user and refused.
 * @param teams - the Teams in the open draft, in page order.
 * @returns the unnamed Teams, in page order.
 */
export declare function unnamedTeamsOf(teams: readonly TeamPreset[]): TeamPreset[];
/** One adopted external Team update, as the page's status line reports it. */
export interface ExternalUpdateNotice {
    /** Display names of the adopted Teams in page order; an unnamed Team reports its id. */
    readonly teams: readonly string[];
    /** The subset of {@link teams} whose staged edit the saved version replaced. */
    readonly overridden: readonly string[];
    /** Display names of the Teams the Host added behind the draft, which joined it. */
    readonly added: readonly string[];
    /** Display names of the Teams the Host deleted behind the draft, which left it. */
    readonly removed: readonly string[];
    /** The subset of {@link removed} whose staged edit was dropped with the Team. */
    readonly removedEdited: readonly string[];
}
/** One stored Session selection as the page reads it. */
export interface TeamSelectionRecordView {
    /** Session identity. */
    readonly sessionId: string;
    /** Selected Team identity. */
    readonly teamId: string;
    /**
     * Stable identity of the member this Session talks to individually.
     *
     * Absent means the Team's captain leads the Session, exactly as a selection
     * always did. A stored empty string is the same captain-led meaning: the Host
     * schema can project one for a record written before a role existed.
     */
    readonly roleId?: string;
}
/**
 * How one restore of the shipped default presets resolved.
 *
 * `restored` means the draft now differs from the stored document, so the page
 * is dirty and Save applies it. `unchanged` means every shipped preset already
 * matched its document — the page has to say so, because a click that stages
 * nothing would otherwise look like a control that does not work.
 */
export type DefaultsRestore = 'restored' | 'unchanged';
/** What one import will do, once the document was read and its collisions are known. */
export type TeamPresetImportPlan = {
    /** The document being imported. */
    readonly transfer: TeamPresetTransfer;
    /** Index of the Team the document would overwrite, or undefined when it adds one. */
    readonly targetIndex: number | undefined;
    /** Display name of that Team, for the dialog that resolves the collision. */
    readonly targetName: string;
    /** The captain name that Team already uses, or an empty string when it is free. */
    readonly captainConflict: string;
    /** Member names that Team already uses, in document order. */
    readonly memberConflicts: readonly string[];
    /** Name the document's Team takes when it is added as a new Team. */
    readonly suggestedTeamName: string;
    /** Name the document's captain takes when it is renamed. */
    readonly suggestedCaptainName: string;
};
/** Result of reading one shared document into a plan. */
export type TeamPresetImportInspection = {
    readonly ok: false;
    readonly reason: TeamPresetImportFailure;
} | {
    readonly ok: true;
    readonly plan: TeamPresetImportPlan;
};
/** How one import resolves the collisions it found. */
export type TeamPresetImportResolution = {
    /** Overwrite the same-named Team, or add the document as a new Team. */
    readonly team: 'replace' | 'rename';
    /** Name the added Team takes when it is not overwriting one. */
    readonly teamName: string;
    /** Overwrite the target Team's captain, or name the imported captain differently. */
    readonly captain: 'replace' | 'rename';
    /** Per conflicting member name: overwrite that member, or add the imported one renamed. */
    readonly members: Readonly<Record<string, 'replace' | 'rename'>>;
};
/**
 * The resolution one document needs when the user was asked nothing.
 * @param plan - the inspection of the document.
 * @returns the resolution that adds the document as a new Team.
 */
export declare function defaultImportResolution(plan: TeamPresetImportPlan): TeamPresetImportResolution;
/**
 * Whether one stored Team still matches a staged draft, so the page can tell
 * a duplicate from a real edit.
 * @param a - left Team.
 * @param b - right Team.
 * @returns whether both serialize identically.
 */
declare function sameTeam(a: TeamPreset, b: TeamPreset): boolean;
/**
 * Create an empty Team preset with a unique identity.
 * @param existing - Teams already configured.
 * @returns a new, unnamed Team preset.
 */
export declare function createTeamPreset(existing: readonly TeamPreset[]): TeamPreset;
/**
 * Create an empty captain preset.
 * @returns the empty captain every new Team starts from.
 */
export declare function emptyCaptainPreset(): TeamCaptainPreset;
/**
 * Create an empty member preset.
 * @returns the empty preset every new member starts from.
 */
export declare function emptyAgentPreset(): TeamAgentPreset;
/** Owns the page's staged edits and the composer's immediate selection writes. */
export declare class TeamPresetsController {
    private readonly ctx;
    /** Observable page state the slot registrations expose to their components. */
    readonly store: SnapshotStore<TeamPresetsState>;
    private readonly form;
    /**
     * The shared describe mirror, which is the authority for the STORED document.
     *
     * Every settings surface in the browser derives from this one mirror, so it
     * answers three questions the form cannot: whether the Host serves the
     * namespace at all, what the stored section holds when this client's own form
     * refuses to decode it, and which revision a write must carry. The form keeps
     * its own job — the page's staged draft, its save fence, and its coordination
     * of a Host write landing behind that draft.
     */
    private readonly mirror;
    private readonly unsubscribe;
    private readonly unsubscribeMirror;
    private draft;
    private draftRevision;
    /**
     * The Host's Teams as they stood when the draft opened, by Team id. What the
     * page reconciles an external write against: only a Team whose stored record
     * moved away from this baseline was changed behind the draft.
     */
    private draftBase;
    /**
     * The last external update this page adopted, kept until the user acts on
     * the draft again. Unrelated form changes leave it standing, so the status
     * line is not wiped by a catalogue refresh or another Session's selection.
     */
    private externalUpdate;
    /**
     * The last default-preset restore, kept until the user acts on the draft
     * again, exactly as {@link externalUpdate} is: it reports the click the user
     * just made, not one they already moved past.
     */
    private defaultsRestore;
    /** The last selection write this client could not complete, until the user acts again. */
    private selectionFailure;
    /** The Session whose Team write this client is waiting on, while it is in flight. */
    private selectionPending;
    /** Whether a category write this client started is still crossing the wire. */
    private categorySaving;
    /** The last category write this client could not complete, until the next attempt. */
    private categoryFailure;
    /** Whether a write this page started is still crossing the wire. */
    private saving;
    /** Stream health of the Host execution state, and the frames it delivered. */
    private execution;
    private executions;
    private executionGeneration;
    private executionAbort;
    private providers;
    private catalogue;
    private cataloguePartial;
    private catalogueLoading;
    private catalogueGeneration;
    private tools;
    private toolCatalogue;
    private toolCatalogueLoading;
    private disposed;
    /**
     * @param ctx - the browser plugin context providing the shared configuration forms.
     */
    constructor(ctx: Context);
    /** Release the form and mirror subscriptions and the execution stream. */
    dispose(): void;
    private projection;
    /**
     * Whether the stored document is usable, as the describe mirror reports it.
     *
     * The mirror answers even when the shared form does not: a form parked at
     * `loading` because it refused the stored value still leaves a served
     * namespace with a readable value and a writable document, and gating the
     * composer on the form is what turned that into a control that opened a menu
     * and then did nothing.
     * @returns the stored document's state.
     */
    private documentStatus;
    /**
     * The Host's view of the Team namespace, or undefined while it serves none.
     * @returns the namespace view the describe mirror currently holds.
     */
    private namespaceView;
    /**
     * The stored section this client reads and writes.
     *
     * The mirror wins whenever it holds an answer, because it is the same value
     * every other settings surface derives from and it survives a namespace whose
     * stored section this client's own form refused to decode. The form's accepted
     * value is the fallback only for the window before the first describe answer,
     * where the form may hold a section the mirror has not published yet: once the
     * mirror HAS answered, a namespace it does not list is not served, and the
     * form's older value must not be shown as if it were stored.
     * @returns the stored Teams, selections, and local view fields, or undefined while nothing is known.
     */
    private storedSection;
    /**
     * Whether the stored document accepts writes.
     *
     * A namespace the Host never composed accepts none, whatever the document's
     * own writability says: there is no section to write into, and reporting the
     * document as writable there is what let the composer offer a control whose
     * every click was refused.
     * @returns whether a selection can be written right now.
     */
    private documentWritable;
    /**
     * Name why the stored section cannot be edited, when it cannot.
     * @returns the condition, or undefined when this page can edit and save.
     */
    private formIssue;
    private publish;
    /**
     * The Teams the page currently shows.
     *
     * A draft shadows the stored value while one is open, so an export and an
     * import both see exactly what the user sees.
     * @returns the staged Teams, or the stored ones while nothing is staged.
     */
    private visibleTeams;
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
    private reconcile;
    /**
     * The business face both slot registrations inject.
     * @returns the state store and the page and composer callbacks.
     */
    inject(): TeamPresetsInjected;
    /** Read the provider/model catalogue, the tool catalogue, and the execution stream. */
    loadCatalogue(): void;
    /**
     * Open the Host execution stream unless this generation already holds one.
     *
     * The stream is the page's only live source of "is this Team executing", so
     * every page load and every Host notification re-subscribes a stream that
     * ended or failed — without a timer, and without trusting the last frame a
     * dead generation left behind.
     */
    private ensureExecution;
    /**
     * Read whole-set execution frames until the stream ends.
     * @param abort - the generation's cancellation.
     * @param generation - the generation this read owns; a superseded read publishes nothing.
     */
    private consumeExecution;
    /**
     * Record that the Host execution state is unknown.
     *
     * A stream that failed, or that ended without being cancelled, says nothing
     * about any Team: its last frame is dropped rather than kept as live truth.
     * @param generation - the generation whose read ended.
     */
    private failExecution;
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
    refreshCatalogue(): void;
    /**
     * Whether one catalogue answer still belongs to the current read.
     * @param generation - the read generation captured when the request started.
     * @returns whether the answer may be published.
     */
    private acceptsCatalogue;
    /**
     * Read one namespaced Remote service, reporting a context that cannot reach it.
     *
     * A namespaced service resolves relative to the context that reads it: the
     * reading fiber (or an ancestor in the same isolate) must declare
     * `remote.<namespace>` in its own inject set, and a context that does not
     * throws `cannot get property "remote.<namespace>" without inject` on the
     * property access itself. That throw is synchronous, so an unguarded read from
     * inside plugin assembly takes the whole registration with it — this plugin
     * would rather publish the catalogue as failed and keep the page and the
     * composer mounted, because a UI that says which read failed is worth more
     * than one that never appears.
     * @param read - the property access to attempt.
     * @returns the read, or undefined when this context cannot reach the service.
     */
    private readNamespace;
    private loadModelCatalogue;
    /**
     * Read the preset members one Session's Team has summoned.
     *
     * The header control hides itself while this answers nothing, so a refusal is
     * reported as an empty roster rather than a control that cannot be trusted.
     * @param sessionId - the Session root whose roster is read.
     * @returns the summoned members, or none when the Host cannot answer.
     */
    readRoster(sessionId: string): Promise<TeamRosterValue>;
    private loadToolCatalogue;
    /**
     * Open the staged draft from the stored Teams.
     *
     * The published snapshot is deep-frozen outside production, so every edit
     * rebuilds the array and the touched record instead of mutating either. A
     * user edit also retires the last external-update report: the page is once
     * again acting on the draft the user holds.
     * @returns the current staged Teams.
     */
    private beginDraft;
    /**
     * Replace one Team record and publish.
     * @param index - the Team position to replace.
     * @param next - the replacement record.
     */
    private replaceTeam;
    /**
     * Append a new Team and open it.
     * @returns the new Team's identity.
     */
    createTeam(): string;
    /**
     * Copy one Team under a new identity.
     * @param index - the Team to copy.
     * @returns the copy's identity, or undefined for an unknown position.
     */
    duplicateTeam(index: number): string | undefined;
    /**
     * Put the shipped default presets back at their document's content.
     *
     * Only the presets this plugin ships are touched: a Team the user created
     * keeps its identity, its content, and its position, and the model route and
     * tool policy configured for a shipped preset's slots are kept too, exactly as
     * an import keeps them — a shared document cannot be evidence for discarding a
     * local setting it does not carry. What the restore produces is staged, so it
     * is visible and saved like every other edit on the page; a restore that would
     * change nothing stages nothing and reports that instead of opening an empty
     * draft.
     * @returns how the restore resolved.
     */
    restoreDefaults(): DefaultsRestore;
    /**
     * Serialize one Team as the fixed shareable document.
     * @param index - the Team position to export.
     * @returns the document text, or undefined for a position the page does not show.
     */
    exportTeam(index: number): string | undefined;
    /**
     * Read one document and work out what importing it would collide with.
     *
     * Nothing is staged here: the caller decides whether the plan needs the user's
     * answer before {@link applyImport} touches the draft.
     * @param text - the document text the user chose.
     * @returns the plan, or the reason the document is not a Team preset of this format.
     */
    inspectImport(text: string): TeamPresetImportInspection;
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
    applyImport(plan: TeamPresetImportPlan, resolution: TeamPresetImportResolution): string;
    /**
     * Delete one Team.
     * @param index - the Team to delete.
     */
    removeTeam(index: number): void;
    /**
     * Replace fields of one Team.
     * @param index - the Team to patch.
     * @param patch - the changed fields.
     */
    patchTeam(index: number, patch: Partial<TeamPreset>): void;
    /**
     * Replace fields of one Team's captain.
     * @param teamIndex - the Team whose captain changes.
     * @param patch - the changed fields.
     */
    patchCaptain(teamIndex: number, patch: Partial<TeamCaptainPreset>): void;
    /**
     * Replace fields of one member.
     * @param teamIndex - the Team that owns the member.
     * @param memberIndex - the member position.
     * @param patch - the changed fields.
     */
    patchMember(teamIndex: number, memberIndex: number, patch: Partial<TeamAgentPreset>): void;
    /**
     * Append an empty member to one Team.
     * @param teamIndex - the Team that gains a member.
     */
    addMember(teamIndex: number): void;
    /**
     * Remove one member from a Team.
     * @param teamIndex - the Team that owns the member.
     * @param memberIndex - the member position.
     */
    removeMember(teamIndex: number, memberIndex: number): void;
    /** Write the staged Teams. */
    save(): Promise<void>;
    /**
     * Write the reader's own category list.
     *
     * Categories are local view fields, not part of the Team draft, so they are
     * written straight to their own path instead of riding the draft's save. The
     * fence is the same one the draft uses: a Host that moved past it refuses the
     * write and the page re-reads rather than overwriting.
     * @param next - the complete category list to store.
     * @returns whether the Host accepted the write.
     */
    private writeCategories;
    /**
     * Add one category.
     * @param name - the display name the user typed.
     * @returns whether the Host accepted the write.
     */
    addCategory(name: string): Promise<boolean>;
    /**
     * Remove one category and every membership that pointed at it.
     * @param id - category identity.
     * @returns whether the Host accepted the write.
     */
    removeCategory(id: string): Promise<boolean>;
    /**
     * Rename one category.
     * @param id - category identity.
     * @param name - the new display name.
     * @returns whether the Host accepted the write.
     */
    renameCategory(id: string, name: string): Promise<boolean>;
    /**
     * Move one category earlier or later in the display order.
     *
     * Order is a local view concern, so it is stored as a dense 0..n-1 sequence
     * rather than swapping two arbitrary numbers: a document that was hand-edited
     * or partially written still normalises on the next move.
     * @param id - category identity.
     * @param delta - -1 to move up, 1 to move down.
     * @returns whether the Host accepted the write.
     */
    moveCategory(id: string, delta: -1 | 1): Promise<boolean>;
    /**
     * Move one Team into one category, or out of every category.
     * @param teamId - Team identity.
     * @param categoryId - category identity, or an empty string for none.
     * @returns whether the Host accepted the write.
     */
    setCategory(teamId: string, categoryId: string): Promise<boolean>;
    /** Drop every staged edit. */
    discard(): void;
    /**
     * Apply one Team to a Session, or clear its Team.
     *
     * A captain-led selection: any member the Session was talking to is cleared
     * with the record, because the captain always leads and never inherits a
     * member's route.
     *
     * The write goes through the Host's own `settings.mutate` with the revision
     * the describe mirror holds, which is what makes a refusal reportable: the
     * shared form's `mutate` answers only a boolean, so a refused selection used
     * to be indistinguishable from one that never happened. The mirror's answer
     * is folded back exactly as the shared form folds it, so every other settings
     * surface sees the selection immediately.
     *
     * One retry follows a refusal. A refused write triggers the mirror's recovery
     * read, so the retry carries the revision and the section the Host holds now —
     * a fence that was stale when the user clicked is then a real retry rather
     * than the same conflict forever, and a concurrent selection is preserved
     * instead of being overwritten by the array this attempt first built.
     * @param sessionId - the Session whose Team changes.
     * @param teamId - the selected Team identity; undefined clears the selection.
     * @returns once the write settled; the outcome is published on {@link store}.
     */
    selectTeam(sessionId: string, teamId: string | undefined): Promise<void>;
    /**
     * Point one Session at a single member of a Team.
     *
     * The same fence, retry, and failure path as {@link selectTeam}, with the
     * member's stable role identity carried in the stored record: the Host then
     * injects that member's own configuration and model route, and this Session
     * talks to the member instead of being led by the captain. Nothing is
     * validated here — the composer only offers identities the stored Team still
     * holds, and a role that disappears later is exactly the stale-selection case
     * the missing notice already reports.
     * @param sessionId - the Session whose selection changes.
     * @param teamId - the Team the member belongs to.
     * @param roleId - the member's stable role identity.
     * @returns once the write settled; the outcome is published on {@link store}.
     */
    selectMember(sessionId: string, teamId: string, roleId: string): Promise<void>;
    /**
     * Write one Session selection, captain-led or member-scoped.
     *
     * The fence, the single retry, and the failure report are identical for both
     * forms; only the record the write carries differs.
     * @param sessionId - the Session whose selection changes.
     * @param teamId - the selected Team identity; undefined clears the selection.
     * @param roleId - the member to talk to individually; undefined keeps the captain leading.
     * @returns once the write settled; the outcome is published on {@link store}.
     */
    private applySelection;
    /**
     * Write one selection under one revision fence.
     * @param sessionId - the Session whose Team changes.
     * @param teamId - the selected Team identity; undefined clears the selection.
     * @param roleId - the member to talk to individually; undefined keeps the captain leading.
     * @param revision - the revision the write is fenced on.
     * @returns the outcome, with the Host's own refusal text when it refused.
     */
    private writeSelection;
    /**
     * Re-read the Host document after a write this client could not complete.
     *
     * The cross-namespace describe contract exposes `ensure`, which reads only
     * from an idle mirror, and a refused write is exactly the case where a HELD
     * view is stale. The read below is the same namespace read the mirror itself
     * performs and `acceptView` is the contract's own fold, so the shared document
     * is refreshed without reaching past the face the contract publishes.
     * @returns settlement once a refreshed view, when there is one, is folded.
     */
    private refreshStored;
    /**
     * Publish one selection failure for the page and the composer control.
     * @param failure - the refusal or failure to report.
     */
    private failSelection;
}
/** Business face the page and composer registrations inject. */
/** Roster reader the header control receives. */
export interface TeamRosterInjected {
    /** Reads the summoned members of one Session's Team, and whether that Team is on. */
    roster: (sessionId: string) => Promise<TeamRosterValue>;
    /** Opens one member's conversation from the roster. */
    openTeammate: (sessionId: SessionId, childSessionId: SessionId) => void;
}
export interface TeamPresetsInjected {
    /** Team Skill panel state, absent when this build ships no library service. */
    skills?: import('./team-skills-controller.ts').TeamSkillsController;
    hooks: {
        /** Page state bound by the renderer as `useTeamPresets`. */
        teamPresets: SnapshotStore<TeamPresetsState>;
    };
    /** Adds one local category by name. */
    addCategory: (name: string) => Promise<boolean>;
    /** Removes one local category and the memberships that pointed at it. */
    removeCategory: (id: string) => Promise<boolean>;
    /** Puts one Team in one category, or out of every category. */
    setCategory: (teamId: string, categoryId: string) => Promise<boolean>;
    /** Renames one local category. */
    renameCategory: (id: string, name: string) => Promise<boolean>;
    /** Moves one local category up or down in the display order. */
    moveCategory: (id: string, delta: -1 | 1) => Promise<boolean>;
    createTeam: () => string;
    duplicateTeam: (index: number) => string | undefined;
    /** Stage the shipped default presets at their document's content, reporting the outcome on the store. */
    restoreDefaults: () => void;
    /** Serialize one Team as the fixed shareable document, or undefined for an unknown position. */
    exportTeam: (index: number) => string | undefined;
    /** Read one shared document and report what importing it would collide with. */
    inspectImport: (text: string) => TeamPresetImportInspection;
    /** Stage one inspected document under the user's resolution of its collisions. */
    applyImport: (plan: TeamPresetImportPlan, resolution: TeamPresetImportResolution) => string;
    removeTeam: (index: number) => void;
    addMember: (teamIndex: number) => void;
    removeMember: (teamIndex: number, memberIndex: number) => void;
    patchTeam: (index: number, patch: Partial<TeamPreset>) => void;
    patchCaptain: (teamIndex: number, patch: Partial<TeamCaptainPreset>) => void;
    patchMember: (teamIndex: number, memberIndex: number, patch: Partial<TeamAgentPreset>) => void;
    save: () => Promise<void>;
    discard: () => void;
    selectTeam: (sessionId: string, teamId: string | undefined) => Promise<void>;
    /** Apply one Team and talk to one of its members individually. */
    selectMember: (sessionId: string, teamId: string, roleId: string) => Promise<void>;
    loadCatalogue: () => void;
    /** Re-read both catalogues from the Host, discarding anything already held. */
    refreshCatalogue: () => void;
}
export { sameTeam };
export type { ModelCatalog };
