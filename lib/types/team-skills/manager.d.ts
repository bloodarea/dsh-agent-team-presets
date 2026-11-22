/**
 * Who receives which Team Skill, and what may not be deleted.
 *
 * A Team is the organizing container, but the smallest unit that actually takes
 * effect is a member: `teamId + roleId`, with the captain stored under its own
 * role slot so a captain assignment can never be mistaken for a member's. The
 * bindings live in their own document beside the asset registry, never inside a
 * Team preset, because a role assignment is a local preference and a preset
 * document is shared.
 *
 * Deletion is guarded here rather than in the page, so the Agent-facing path
 * and the visual path cannot disagree about whether a delete is allowed. Three
 * independent reasons block it: a role still binds the asset, a live member is
 * running on it, or another asset declares it as a dependency. A text-scan hit
 * is only a warning — static scanning of Markdown and scripts cannot prove a
 * reference, and pretending otherwise would either block legitimate deletes or
 * hide a real one.
 * @module dsh-agent-team-presets/team-skills/manager
 */
import type { TeamSkillAsset, TeamSkillBinding, TeamSkillBindingSummary, TeamSkillDeleteBlocker } from '../types.ts';
import type { TeamPreset } from '../types.ts';
import type { TeamSkillStore } from './store.ts';
export { CAPTAIN_ROLE } from './official-bindings.ts';
/** What the manager needs from the rest of the plugin to answer a delete. */
export interface TeamSkillGuardContext {
    /** Teams the page currently shows, for dependency labels. */
    readonly teams: () => readonly TeamPreset[];
    /** Asset identifiers a live member or Session is currently reading. */
    readonly activeAssetIds: () => ReadonlySet<string>;
    /** Live Session labels running a member on one asset, for the refusal. */
    readonly activeSessions: (assetId: string) => readonly string[];
}
/** Why one assignment was refused. */
export type TeamSkillAssignFailure = 'unknown-asset' | 'unknown-team' | 'unknown-role' | 'asset-missing' | `dependency-missing: ${string}`;
/** Result of one assignment attempt. */
export type TeamSkillAssignResult = {
    readonly ok: true;
    readonly binding: TeamSkillBinding;
    readonly unverified: readonly string[];
} | {
    readonly ok: false;
    readonly reason: TeamSkillAssignFailure;
    readonly unverified?: readonly string[];
};
/** Deletion outcome carrying every blocking reason at once. */
export interface TeamSkillDeleteOutcome {
    readonly ok: boolean;
    readonly blockers: readonly TeamSkillDeleteBlocker[];
    readonly warnings: readonly string[];
}
/** The Team Skill library plus its role bindings. */
/**
 * Whether two assets are the shipped copy and its own editable copy.
 *
 * They share a name because they ARE the same skill: the override is the shipped
 * body with the user's edits. Presenting that pair as a name clash made an
 * ordinary "I made a local copy" state read as a defect.
 * @param left - one asset.
 * @param right - the other asset.
 * @returns true when one is the shipped copy and the other its override.
 */
export declare function sanctionedCopy(left: TeamSkillAsset, right: TeamSkillAsset): boolean;
export declare class TeamSkillManager {
    private readonly store;
    private bindings;
    private revision;
    private opened;
    private seeded;
    private pending;
    private readonly guards;
    /**
     * @param store - the asset store this manager binds assets from.
     * @param root - the same private root the store uses.
     * @param guards - live facts a delete has to consult.
     */
    constructor(store: TeamSkillStore, _root: string, guards: TeamSkillGuardContext);
    /** Use the store's pinned physical root, including for bindings writes. */
    private get root();
    /** Binding revision, bumped by every assignment change. */
    get bindingRevision(): number;
    /**
     * Read the bindings document.
     *
     * A malformed document refuses the open instead of starting empty: silently
     * dropping every assignment would make each member lose its skills with no
     * explanation.
     * @returns after the table is loaded.
     */
    open(): Promise<void>;
    /** Every binding, in a stable order. */
    list(): readonly TeamSkillBinding[];
    /**
     * Assign one asset to one role slot.
     * @param input - team, role, and asset.
     * @returns the stored binding or the reason it was refused.
     */
    assign(input: {
        teamId: string;
        roleId: string;
        assetId: string;
        captain?: boolean;
    }): Promise<TeamSkillAssignResult>;
    /** Replace only existing bindings to the shipped skill after an explicit switch. */
    replaceBuiltinBindings(skillId: string, overrideId: string): Promise<number>;
    /**
     * Remove the assignment of one role slot.
     * @param teamId - Team identity.
     * @param roleId - role identity, or {@link CAPTAIN_ROLE}.
     * @returns whether a binding was removed.
     */
    unassign(teamId: string, roleId: string, assetId?: string): Promise<boolean>;
    /**
     * Drop every binding of one Team, used when a Team is deleted.
     * @param teamId - Team identity.
     * @returns the number of removed bindings.
     */
    unassignTeam(teamId: string): Promise<number>;
    /**
     * Resolve the assets one role receives.
     * @param teamId - Team identity.
     * @param roleId - role identity.
     * @returns the bound assets that still exist.
     */
    assetsFor(teamId: string, roleId: string): TeamSkillAsset[];
    /**
     * Describe the roles currently bound to one asset.
     * @param assetId - asset identity.
     * @returns one row per binding, with the Team and role names for the dialog.
     */
    bindingSummaries(assetId: string): TeamSkillBindingSummary[];
    /**
     * Delete one asset, refusing while anything still depends on it.
     *
     * Every blocking reason is collected before refusing, so the dialog can list
     * all of them instead of revealing one per attempt.
     * @param assetId - asset identity.
     * @returns the outcome, with blockers when it was refused.
     */
    remove(assetId: string): Promise<TeamSkillDeleteOutcome>;
    private deleteBlockers;
    hasRole(teamId: string, roleId: string): boolean;
    reconcile(): Promise<void>;
    private reconcileNow;
    /**
     * Move every role holding one asset onto another.
     *
     * Used by "restore to the built-in version": the roles reading a local copy
     * have to read the shipped one again, or the restore would only change bytes
     * nobody is bound to.
     * @param fromAssetId - asset the roles hold now.
     * @param toAssetId - asset they should hold.
     * @returns the number of bindings moved.
     */
    replaceAssetBindings(fromAssetId: string, toAssetId: string): Promise<number>;
    private replaceAssetBindingsNow;
    private mutate;
    /**
     * Find text mentions of one skill name inside another asset.
     * @param assetId - asset whose files are scanned.
     * @param skillId - the name to look for.
     * @returns the matching relative paths.
     */
    private mentionsAsset;
    /**
     * Resolve one asset's declared executables against the current PATH.
     *
     * Only executables can be checked truthfully from here: an MCP server is a
     * composition-level plugin, so this reports it as *declared* rather than
     * pretending it is connected. A missing executable is a real fact, and the
     * page shows it beside the dependency that asked for it.
     * @param assetId - asset identity.
     * @returns one row per declared executable, plus the declared MCP servers.
     */
    dependencyReport(assetId: string): Promise<{
        executables: {
            name: string;
            found: boolean;
        }[];
        mcpServers: string[];
        mcpDeclarations: TeamSkillAsset['dependencies']['mcpServers'];
        unverified: string[];
        otherSkills: {
            id: string;
            found: boolean;
        }[];
    }>;
    /**
     * The verifiable reasons this asset cannot be assigned yet.
     *
     * Only what this layer can actually check blocks: a declared executable that is
     * absent from PATH. A required MCP server is reported separately as
     * unverifiable, because whether one is connected is a composition-level fact —
     * blocking on it here would be a guess dressed as a diagnosis.
     * @param assetId - asset identity.
     * @returns blocking reasons and the required MCP servers this layer cannot see.
     */
    assignmentBlockers(assetId: string): Promise<{
        blocking: string[];
        unverified: string[];
    }>;
    /**
     * Whether an asset is currently referenced by any role.
     * @param assetId - asset identity.
     * @returns whether at least one binding points at it.
     */
    isBound(assetId: string): boolean;
    /**
     * Delete one Team's bindings and its asset-independent bookkeeping.
     * @param teamId - Team identity.
     * @returns the number of removed bindings.
     */
    forgetTeam(teamId: string): Promise<number>;
    /**
     * Reset default skill binding seeds for the given teams (or all built-in teams)
     * and reconcile to restore the official default bindings.
     * @param teamIds - optional list of team identities to restore; defaults to all built-in teams.
     */
    restoreBuiltinBindings(teamIds?: readonly string[] | null): Promise<void>;
    /**
     * Persist the bindings document atomically enough for a UI write.
     * @returns after the document is on disk.
     */
    private flush;
}
