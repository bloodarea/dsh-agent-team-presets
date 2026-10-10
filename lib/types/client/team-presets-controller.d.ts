/**
 * Staged Team preset editing over the `agent-team-presets` settings namespace,
 * plus the per-Session Team selection the composer control writes.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { ModelCatalog } from '@deepseek-ai/dsh-api-remotes/client';
import { type SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { TeamPresetImportFailure, TeamPresetTransfer } from '../preset-transfer.ts';
import type { TeamAgentPreset, TeamCaptainPreset, TeamExecutionRow, TeamExecutionState, TeamPreset, ToolChoice } from '../types.ts';
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
    /** Team definitions the Host rewrote behind the page, or undefined while none was adopted. */
    readonly externalUpdate: ExternalUpdateNotice | undefined;
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
}
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
    private readonly unsubscribe;
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
    /** Release the form subscription and the execution stream. */
    dispose(): void;
    private projection;
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
    private loadModelCatalogue;
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
    /** Drop every staged edit. */
    discard(): void;
    /**
     * Apply one Team to a Session, or clear its Team.
     * @param sessionId - the Session whose Team changes.
     * @param teamId - the selected Team identity; undefined clears the selection.
     * @returns once the write settled.
     */
    selectTeam(sessionId: string, teamId: string | undefined): Promise<void>;
}
/** Business face the page and composer registrations inject. */
export interface TeamPresetsInjected {
    hooks: {
        /** Page state bound by the renderer as `useTeamPresets`. */
        teamPresets: SnapshotStore<TeamPresetsState>;
    };
    createTeam: () => string;
    duplicateTeam: (index: number) => string | undefined;
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
    loadCatalogue: () => void;
    /** Re-read both catalogues from the Host, discarding anything already held. */
    refreshCatalogue: () => void;
}
export { sameTeam };
export type { ModelCatalog };
//# sourceMappingURL=team-presets-controller.d.ts.map