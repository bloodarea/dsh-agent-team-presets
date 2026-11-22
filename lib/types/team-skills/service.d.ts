/**
 * The settings page's view of the private Team Skill library.
 *
 * Every judgement stays in the manager and the store: this service only shapes
 * their answers for a Remote call, so the page and any Agent-facing tool cannot
 * disagree about whether an import is safe, a delete is allowed, or a role may
 * receive an asset. The one thing it adds is the roster a binding dialog needs —
 * the Teams the page already shows, with their role identities.
 * @module dsh-agent-team-presets/team-skills/service
 */
import { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { TeamSkillManager } from './manager.ts';
import { TeamSkillStore } from './store.ts';
import type { TeamPreset, TeamSkillDeleteView, TeamSkillDetailView, TeamSkillImportFile, TeamSkillImportFolderView, TeamSkillLibraryView, TeamSkillRefusalView, TeamSkillScanView, TeamSkillDependencies } from '../types.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Remote management surface for the private Team Skill library. */
        teamSkills: TeamSkillService;
    }
}
/** Configuration of {@link TeamSkillService}. */
export interface TeamSkillServiceConfig {
    /** The asset store. */
    readonly store: TeamSkillStore;
    /** The binding table and its delete guards. */
    readonly manager: TeamSkillManager;
    /** The Teams the page shows, read live from Settings. */
    readonly teams: () => readonly TeamPreset[];
    /** Shipped skill ids this deployment provides. */
    readonly official: () => readonly string[];
    /** Resolves once the store and its index are loaded, or `false` when they cannot be. */
    readonly ready: Promise<boolean>;
    /** Exact degraded-start reason, when available. */
    readonly startupIssue?: () => string | undefined;
    /** Re-applies every live Agent after a binding changed. */
    readonly resync: () => void;
}
/**
 * Remote management surface over the private Team Skill library.
 */
export declare class TeamSkillService extends TypertRemoteService {
    private readonly config;
    /**
     * @param ctx - the owning plugin context.
     * @param config - the store, the manager, and the live roster.
     */
    constructor(ctx: Context, config: TeamSkillServiceConfig);
    /**
     * Wait for the store, reporting why it is unusable.
     * @returns undefined when ready, or the reason the page must show.
     */
    private settle;
    /**
     * Shape one asset for the page.
     * @param assetId - asset identity.
     * @returns the row, or undefined when it no longer exists.
     */
    private row;
    /**
     * Read the Teams the binding dialog addresses.
     * @returns one row per Team, captain slot first.
     */
    private roster;
    /**
     * List the library, the roster, and the shipped skill ids.
     * @returns one page load.
     */
    library(checkInbox?: boolean): Promise<TeamSkillLibraryView>;
    /**
     * Read one asset with its files and body.
     * @param assetId - asset identity.
     * @returns the detail, or a refusal when the asset is gone.
     */
    detail(assetId: string): Promise<TeamSkillDetailView | TeamSkillRefusalView>;
    /**
     * Read one text file of an asset.
     * @param assetId - asset identity.
     * @param path - relative path.
     * @returns the text, or a refusal.
     */
    readFile(assetId: string, path: string): Promise<{
        ok: true;
        path: string;
        text: string;
    } | TeamSkillRefusalView>;
    /**
     * Write one file, publishing a new asset version.
     * @param assetId - asset identity.
     * @param path - relative path.
     * @param text - new content.
     * @param expectedVersion - the version the editor has open.
     * @returns the refreshed detail, or a refusal.
     */
    writeFile(assetId: string, path: string, text: string, expectedVersion?: string): Promise<TeamSkillDetailView | TeamSkillRefusalView>;
    private reservedSkillName;
    /**
     * Create one editable skill from the blank template.
     * @param skillId - kebab-case name the new skill takes.
     * @param description - frontmatter description.
     * @returns the new detail, or a refusal when the folder is not a legal skill.
     */
    createSkill(skillId: string, description: string): Promise<TeamSkillDetailView | TeamSkillRefusalView>;
    /**
     * Import one folder, as the browser's picker sends it.
     * @param files - relative paths and base64 content.
     * @returns the new detail, or a refusal naming the exact rule that failed.
     */
    importSkill(files: readonly TeamSkillImportFile[]): Promise<TeamSkillDetailView | TeamSkillRefusalView>;
    /**
     * Create the private import directory when it is missing.
     *
     * The page opens this folder for the user, so the gesture has to work on a
     * fresh installation where no scan ever ran. Creating it here also keeps the
     * path the same one {@link scanImportFolder} reads.
     * @returns the absolute folder, or a refusal when it cannot be created safely.
     */
    prepareImportFolder(): Promise<TeamSkillImportFolderView | TeamSkillRefusalView>;
    private checkInbox;
    /** Validate sources, publishing changed packages as new versions only on this explicit request. */
    scanImportFolder(): Promise<TeamSkillScanView | TeamSkillRefusalView>;
    /**
     * Copy one shipped skill into an editable override.
     * @param skillId - shipped skill id.
     * @returns the new detail, or a refusal.
     */
    overrideSkill(skillId: string, switchBindings?: boolean): Promise<TeamSkillDetailView | TeamSkillRefusalView>;
    updateDependencies(assetId: string, dependencies: TeamSkillDependencies): Promise<TeamSkillDetailView | TeamSkillRefusalView>;
    /**
     * Reset one override back to the shipped copy.
     * @param assetId - override identity.
     * @returns the refreshed detail, or a refusal.
     */
    resetSkill(assetId: string): Promise<TeamSkillDetailView | TeamSkillRefusalView>;
    /**
     * Delete one asset, listing every blocker at once.
     * @param assetId - asset identity.
     * @returns the outcome.
     */
    deleteAsset(assetId: string): Promise<TeamSkillDeleteView>;
    /**
     * Bind one asset to one role slot.
     * @param teamId - Team identity.
     * @param roleId - role identity, or `captain`.
     * @param assetId - asset identity.
     * @returns whether the assignment landed, and the refreshed library.
     */
    assignRole(teamId: string, roleId: string, assetId: string): Promise<{
        ok: boolean;
        detail: string;
        unverified?: readonly string[];
        library: TeamSkillLibraryView;
    }>;
    /**
     * Remove one role's assignment.
     * @param teamId - Team identity.
     * @param roleId - role identity.
     * @returns the refreshed library.
     */
    unassignRole(teamId: string, roleId: string, assetId?: string): Promise<TeamSkillLibraryView>;
    /**
     * Restore official default skill bindings for built-in teams.
     * @param teamIds - optional list of team identities to restore; defaults to all built-in teams.
     * @returns the refreshed library.
     */
    restoreBuiltinBindings(teamIds?: string[]): Promise<TeamSkillLibraryView>;
}
