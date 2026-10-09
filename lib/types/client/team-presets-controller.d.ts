/**
 * Staged Team preset editing over the `agent-team-presets` settings namespace,
 * plus the per-Session Team selection the composer control writes.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { ModelCatalog } from '@deepseek-ai/dsh-api-remotes/client';
import { type SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { TeamAgentPreset, TeamCaptainPreset, TeamPreset, ToolChoice } from '../types.ts';
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
/** One stored Session selection as the page reads it. */
export interface TeamSelectionRecordView {
    /** Session identity. */
    readonly sessionId: string;
    /** Selected Team identity. */
    readonly teamId: string;
}
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
    /** Release the form subscription. */
    dispose(): void;
    private projection;
    private publish;
    /**
     * The business face both slot registrations inject.
     * @returns the state store and the page and composer callbacks.
     */
    inject(): TeamPresetsInjected;
    /** Read the provider/model catalogue and the tool catalogue the pickers render. */
    loadCatalogue(): void;
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
     * rebuilds the array and the touched record instead of mutating either.
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