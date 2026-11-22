/**
 * Page state for the Team Skill library.
 *
 * The controller holds no rules of its own: it calls the Host service and keeps
 * the last answer, so a refusal the Host produced (a delete blocked by a live
 * member, an import that would escape its folder) is displayed exactly as the
 * Host described it. Optimistic edits are deliberately absent — an import can
 * take a moment and a delete can be refused, and a page that showed the change
 * before the Host agreed would have to take it back.
 * @module dsh-agent-team-presets/client/team-skills-controller
 */
import type { Context } from '@deepseek-ai/cordis';
import type { TeamSkillDeleteView, TeamSkillDetailView, TeamSkillLibraryView, TeamSkillScanEntry, TeamSkillScanView } from '../types.ts';
/** One page snapshot. */
export interface TeamSkillsState {
    /** Where the library load stands. */
    readonly status: 'loading' | 'ready' | 'unavailable';
    /** The library, once loaded. */
    readonly library: TeamSkillLibraryView | undefined;
    /** The asset the detail panel shows. */
    readonly selectedId: string | undefined;
    /** Its detail, once loaded. */
    readonly detail: TeamSkillDetailView | undefined;
    /** Whether a write is in flight. */
    readonly busy: boolean;
    /** The last message the page must show, already user-facing text. */
    readonly message: string | undefined;
    /** Whether {@link message} reports a refusal rather than success. */
    readonly failed: boolean;
    /** Why the library is unavailable, when the Host has no store. */
    readonly issue: string | undefined;
    /** The file whose text the editor shows. */
    readonly file: string | undefined;
    /** That file's text, once read. */
    readonly fileText: string | undefined;
    /** Changes found by the last deliberate inbox check. */
    readonly inboxChanges?: readonly TeamSkillScanEntry[];
    /** The last directory scan, so the page can list every folder it judged. */
    readonly scan: TeamSkillScanView | undefined;
    /** Whether this Host can reveal a folder natively; false means the control copies the path. */
    readonly canOpenScanFolder: boolean;
    /** Absolute import folder, once prepared. */
    readonly scanFolderPath: string | undefined;
    /** How the last open/copy gesture ended, localized by the page. */
    readonly scanFolderNotice: 'opened' | 'copied' | 'copy-failed' | undefined;
}
/** The Team Skill page state. */
export declare class TeamSkillsController {
    private state;
    private readonly listeners;
    private readonly ctx;
    private disposed;
    private pendingInboxCheck;
    private libraryRequest;
    private inboxRequest;
    /**
     * The Remote namespace, once the gateway announces it.
     *
     * It is resolved through its own `inject` instead of the plugin's required
     * inject list: a namespace the Host fails to announce must cost this panel and
     * nothing else. Waiting for it in the plugin's own inject list took the whole
     * web UI down (one entry "did not activate"), which is exactly the failure a
     * settings panel is never worth.
     */
    private service;
    /**
     * @param ctx - the browser context this panel reads its Remote through.
     */
    constructor(ctx: Context);
    /** Read whether this Host can reveal a folder natively; absence means copy mode. */
    private detectOpenCapability;
    /** Open one Host directory in the native file manager, when the Host offers it. */
    private revealFolder;
    /** Copy one absolute path, reporting whether the browser allowed it. */
    private copyPath;
    /**
     * Create (when missing) and reveal the import folder.
     *
     * A Host without a native opener, or one that refuses this path, falls back to
     * the clipboard so the gesture still gives the user a way to the folder.
     */
    openScanFolder(): Promise<void>;
    /** Current snapshot, stable between changes. */
    getSnapshot: () => TeamSkillsState;
    /**
     * Subscribe to changes.
     * @param listener - called after every state change.
     * @returns the unsubscribe function.
     */
    subscribe: (listener: () => void) => (() => void);
    /** Stop accepting answers. */
    dispose(): void;
    /**
     * Replace the snapshot and notify.
     * @param patch - fields to change.
     */
    private publish;
    /** Read the library, optionally checking the inbox for pending changes. */
    refresh(checkInbox?: boolean): Promise<void>;
    /**
     * Show one asset's detail.
     * @param assetId - asset identity.
     */
    select(assetId: string): Promise<void>;
    /**
     * Load one file's text into the editor.
     * @param path - relative path inside the asset.
     */
    openFile(path: string): Promise<void>;
    /**
     * Save one file of the selected asset.
     * @param path - relative path.
     * @param text - new content.
     */
    saveFile(path: string, text: string): Promise<void>;
    /**
     * Create one blank skill.
     * @param skillId - kebab-case name.
     * @param description - frontmatter description.
     */
    create(skillId: string, description: string): Promise<void>;
    /**
     * Import one folder the user picked.
     * @param files - the picker's files, already carrying relative paths.
     * @returns the asset identity when the folder was imported.
     */
    importFolder(files: readonly {
        path: string;
        content: Uint8Array;
    }[]): Promise<string | undefined>;
    /**
     * Scan the Host's import folder and publish every new legal skill.
     *
     * The Host owns the judgement; this only forwards the answer so the page can
     * show one row per folder instead of collapsing refusals into a count.
     */
    scanImportFolder(): Promise<void>;
    /**
     * Copy one shipped skill into an editable override.
     * @param skillId - shipped skill id.
     * @param switchBindings - whether to move current role bindings to the copy.
     * @returns the copy's asset identity when the Host created it.
     */
    createOverride(skillId: string, switchBindings: boolean): Promise<string | undefined>;
    private showCreatedAsset;
    /**
     * Discard one override's edits by re-copying the shipped skill.
     * @param assetId - override identity.
     */
    resetOverride(assetId: string): Promise<void>;
    /**
     * Delete one asset, showing every blocker the Host reported.
     * @param assetId - asset identity.
     * @returns the Host's outcome, so the page can name the blockers.
     */
    remove(assetId: string): Promise<TeamSkillDeleteView | undefined>;
    /**
     * Bind one asset to one role, as the member page's grid does.
     * @param teamId - Team identity.
     * @param roleId - role identity, or `captain`.
     * @param assetId - asset identity.
     */
    assignSkill(teamId: string, roleId: string, assetId: string): Promise<void>;
    /**
     * Remove one asset from one role.
     * @param teamId - Team identity.
     * @param roleId - role identity.
     * @param assetId - asset identity.
     */
    unassignSkill(teamId: string, roleId: string, assetId: string): Promise<void>;
    /**
     * Bind the selected asset to one role.
     * @param teamId - Team identity.
     * @param roleId - role identity, or `captain`.
     */
    assign(teamId: string, roleId: string): Promise<void>;
    /**
     * Remove one role's assignment.
     * @param teamId - Team identity.
     * @param roleId - role identity.
     */
    unassign(teamId: string, roleId: string): Promise<void>;
    /** Restore official default skill bindings for built-in teams. */
    restoreBuiltinBindings(teamIds?: readonly string[]): Promise<void>;
    /**
     * The generated Client face for this plugin's services.
     * @returns the mounted Remote namespace.
     */
    private api;
    /**
     * Run one write with a busy flag and a single message.
     * @param work - the call, returning the message key or a refusal text.
     */
    private run;
}
