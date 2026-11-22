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
/**
 * Unwrap one Remote answer, turning a transport failure into the same shape the
 * page shows for a Host refusal.
 * @param result - the wrapped answer.
 * @returns the value, or the failure text.
 */
function unwrap(result) {
    if (result.ok)
        return result.value;
    throw new Error(result.error.message ?? 'the Host refused the call');
}
/**
 * Narrow one answer that may be a refusal.
 * @param value - a service answer.
 * @returns whether it is a detail.
 */
function isDetail(value) {
    return 'asset' in value;
}
/** The Team Skill page state. */
export class TeamSkillsController {
    state = {
        status: 'loading',
        library: undefined,
        selectedId: undefined,
        detail: undefined,
        busy: false,
        message: undefined,
        failed: false,
        issue: undefined,
        file: undefined,
        fileText: undefined,
        inboxChanges: [],
        scan: undefined,
        canOpenScanFolder: false,
        scanFolderPath: undefined,
        scanFolderNotice: undefined,
    };
    listeners = new Set();
    ctx;
    disposed = false;
    pendingInboxCheck = false;
    libraryRequest = 0;
    inboxRequest = 0;
    /**
     * The Remote namespace, once the gateway announces it.
     *
     * It is resolved through its own `inject` instead of the plugin's required
     * inject list: a namespace the Host fails to announce must cost this panel and
     * nothing else. Waiting for it in the plugin's own inject list took the whole
     * web UI down (one entry "did not activate"), which is exactly the failure a
     * settings panel is never worth.
     */
    service;
    /**
     * @param ctx - the browser context this panel reads its Remote through.
     */
    constructor(ctx) {
        this.ctx = ctx;
        // A namespace this build cannot inject must degrade this panel only. The
        // registration itself is guarded because a client-side inject that cannot be
        // satisfied would otherwise fail the whole browser entry.
        try {
            ctx.inject(['remote.teamSkills'], (scope) => {
                this.service = scope.remote.teamSkills;
                const checkInbox = this.pendingInboxCheck;
                this.pendingInboxCheck = false;
                void this.refresh(checkInbox);
                return () => { this.service = undefined; };
            });
        }
        catch (error) {
            this.state = { ...this.state, status: 'unavailable', issue: String(error) };
        }
        void this.detectOpenCapability();
    }
    /** Read whether this Host can reveal a folder natively; absence means copy mode. */
    async detectOpenCapability() {
        try {
            const session = this.ctx.remote.session;
            const answer = await session?.canOpenWorkspacePath?.();
            this.publish({ canOpenScanFolder: answer?.ok === true && answer.value === true });
        }
        catch {
            this.publish({ canOpenScanFolder: false });
        }
    }
    /** Open one Host directory in the native file manager, when the Host offers it. */
    async revealFolder(path) {
        try {
            const session = this.ctx.remote.session;
            const answer = await session?.openWorkspacePath?.({ path });
            return answer?.ok === true;
        }
        catch {
            return false;
        }
    }
    /** Copy one absolute path, reporting whether the browser allowed it. */
    async copyPath(path) {
        try {
            await navigator.clipboard.writeText(path);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Create (when missing) and reveal the import folder.
     *
     * A Host without a native opener, or one that refuses this path, falls back to
     * the clipboard so the gesture still gives the user a way to the folder.
     */
    async openScanFolder() {
        this.publish({ busy: true, scanFolderNotice: undefined, message: undefined, failed: false });
        try {
            const answer = unwrap(await this.api().prepareImportFolder());
            if (!('path' in answer)) {
                this.publish({ busy: false, message: answer.detail, failed: true });
                return;
            }
            this.publish({ scanFolderPath: answer.path });
            if (this.state.canOpenScanFolder) {
                if (await this.revealFolder(answer.path)) {
                    this.publish({ busy: false, scanFolderNotice: 'opened' });
                    return;
                }
                // The Host advertised a native opener but refused this path: switch the
                // control to its copy mode so the next click does not promise an open.
                this.publish({ canOpenScanFolder: false });
            }
            const copied = await this.copyPath(answer.path);
            this.publish({ busy: false, scanFolderNotice: copied ? 'copied' : 'copy-failed' });
        }
        catch (error) {
            this.publish({ busy: false, message: String(error), failed: true });
        }
    }
    /** Current snapshot, stable between changes. */
    getSnapshot = () => this.state;
    /**
     * Subscribe to changes.
     * @param listener - called after every state change.
     * @returns the unsubscribe function.
     */
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };
    /** Stop accepting answers. */
    dispose() {
        this.disposed = true;
        this.listeners.clear();
    }
    /**
     * Replace the snapshot and notify.
     * @param patch - fields to change.
     */
    publish(patch) {
        if (this.disposed)
            return;
        this.state = { ...this.state, ...patch };
        for (const listener of this.listeners)
            listener();
    }
    /** Read the library, optionally checking the inbox for pending changes. */
    async refresh(checkInbox = false) {
        if (checkInbox && this.service === undefined)
            this.pendingInboxCheck = true;
        const request = ++this.libraryRequest;
        if (checkInbox)
            this.inboxRequest = request;
        this.publish({ status: this.state.library === undefined ? 'loading' : 'ready' });
        try {
            const api = this.api();
            const library = unwrap(await (checkInbox ? api.library(true) : api.library()));
            if (checkInbox && request === this.inboxRequest && library.issue === undefined) {
                this.publish({ inboxChanges: library.inboxChanges ?? [] });
            }
            if (request !== this.libraryRequest)
                return;
            if (library.issue !== undefined) {
                this.publish({ status: 'unavailable', library: undefined, issue: library.issue });
                return;
            }
            const selectedId = this.state.selectedId;
            const selectionGone = selectedId !== undefined && !library.assets.some(asset => asset.id === selectedId);
            this.publish({
                status: 'ready', library, issue: undefined,
                ...(selectionGone ? { selectedId: undefined, detail: undefined, file: undefined, fileText: undefined } : {}),
            });
        }
        catch (error) {
            if (request === this.libraryRequest)
                this.publish({ status: 'unavailable', issue: String(error) });
        }
    }
    /**
     * Show one asset's detail.
     * @param assetId - asset identity.
     */
    async select(assetId) {
        this.publish({ selectedId: assetId, detail: undefined, file: undefined, fileText: undefined });
        const answer = unwrap(await this.api().detail(assetId));
        if (this.disposed || this.state.selectedId !== assetId)
            return;
        if (!isDetail(answer)) {
            this.publish({ message: answer.detail, failed: true });
            return;
        }
        // The instruction file is what the page opens first; the file tree takes
        // over from there.
        this.publish({ detail: answer });
        await this.openFile('SKILL.md');
    }
    /**
     * Load one file's text into the editor.
     * @param path - relative path inside the asset.
     */
    async openFile(path) {
        const assetId = this.state.selectedId;
        if (assetId === undefined)
            return;
        this.publish({ file: path, fileText: undefined });
        try {
            const answer = unwrap(await this.api().readFile(assetId, path));
            if (this.state.selectedId !== assetId || this.state.file !== path)
                return;
            if ('text' in answer)
                this.publish({ fileText: answer.text });
            else
                this.publish({ message: answer.detail, failed: true });
        }
        catch (error) {
            if (this.state.selectedId === assetId && this.state.file === path) {
                this.publish({ message: String(error), failed: true });
            }
        }
    }
    /**
     * Save one file of the selected asset.
     * @param path - relative path.
     * @param text - new content.
     */
    async saveFile(path, text) {
        const assetId = this.state.selectedId;
        if (assetId === undefined)
            return;
        const version = this.state.detail?.asset.version;
        await this.run(async () => {
            const api = this.api();
            const answer = unwrap(await api.writeFile(assetId, path, text, version));
            if (!isDetail(answer))
                return answer.detail;
            if (this.state.selectedId === assetId)
                this.publish({ detail: answer });
            await this.refresh(true);
            if (this.state.selectedId === assetId)
                await this.openFile(path);
            return 'saved';
        });
    }
    /**
     * Create one blank skill.
     * @param skillId - kebab-case name.
     * @param description - frontmatter description.
     */
    async create(skillId, description) {
        await this.run(async () => {
            const answer = unwrap(await this.api().createSkill(skillId, description));
            if (!isDetail(answer))
                return answer.detail;
            this.publish({ detail: answer, selectedId: answer.asset.id });
            await this.refresh(true);
            return 'created';
        });
    }
    /**
     * Import one folder the user picked.
     * @param files - the picker's files, already carrying relative paths.
     * @returns the asset identity when the folder was imported.
     */
    async importFolder(files) {
        if (files.length === 0)
            return;
        const payload = files.map(file => ({
            path: file.path,
            base64: encodeBase64(file.content),
        }));
        let importedId;
        await this.run(async () => {
            const answer = unwrap(await this.api().importSkill(payload));
            if (!isDetail(answer))
                return answer.detail;
            importedId = await this.showCreatedAsset(answer);
            return 'imported';
        });
        return importedId;
    }
    /**
     * Scan the Host's import folder and publish every new legal skill.
     *
     * The Host owns the judgement; this only forwards the answer so the page can
     * show one row per folder instead of collapsing refusals into a count.
     */
    async scanImportFolder() {
        await this.run(async () => {
            const answer = unwrap(await this.api().scanImportFolder());
            if (!('entries' in answer)) {
                this.publish({ scan: undefined });
                return answer.detail;
            }
            this.publish({ scan: answer });
            await this.refresh(true);
            return 'scanned';
        });
    }
    /**
     * Copy one shipped skill into an editable override.
     * @param skillId - shipped skill id.
     * @param switchBindings - whether to move current role bindings to the copy.
     * @returns the copy's asset identity when the Host created it.
     */
    async createOverride(skillId, switchBindings) {
        let copyId;
        await this.run(async () => {
            const api = this.api();
            const answer = unwrap(await api.overrideSkill(skillId, switchBindings));
            if (!isDetail(answer))
                return answer.detail;
            copyId = await this.showCreatedAsset(answer);
            return 'override-created';
        });
        return copyId;
    }
    async showCreatedAsset(detail) {
        await this.refresh(true);
        const assetId = detail.asset.id;
        this.publish({ selectedId: assetId, detail, file: undefined, fileText: undefined });
        await this.openFile('SKILL.md');
        return assetId;
    }
    /**
     * Discard one override's edits by re-copying the shipped skill.
     * @param assetId - override identity.
     */
    async resetOverride(assetId) {
        await this.run(async () => {
            const answer = unwrap(await this.api().resetSkill(assetId));
            if (!isDetail(answer))
                return answer.detail;
            if (this.state.selectedId === assetId) {
                this.publish({ detail: answer });
                await this.openFile('SKILL.md');
            }
            await this.refresh();
            return 'override-reset';
        });
    }
    /**
     * Delete one asset, showing every blocker the Host reported.
     * @param assetId - asset identity.
     * @returns the Host's outcome, so the page can name the blockers.
     */
    async remove(assetId) {
        let outcome;
        await this.run(async () => {
            outcome = unwrap(await this.api().deleteAsset(assetId));
            await this.refresh(outcome.ok);
            if (!outcome.ok)
                return outcome.blockers.map(blocker => `${blocker.kind}: ${blocker.detail}`).join('; ');
            this.publish({ selectedId: undefined, detail: undefined });
            return 'deleted';
        });
        return outcome;
    }
    /**
     * Bind one asset to one role, as the member page's grid does.
     * @param teamId - Team identity.
     * @param roleId - role identity, or `captain`.
     * @param assetId - asset identity.
     */
    async assignSkill(teamId, roleId, assetId) {
        await this.run(async () => {
            const answer = unwrap(await this.api().assignRole(teamId, roleId, assetId));
            this.publish({ library: answer.library });
            return answer.ok ? 'assigned' : answer.detail;
        });
    }
    /**
     * Remove one asset from one role.
     * @param teamId - Team identity.
     * @param roleId - role identity.
     * @param assetId - asset identity.
     */
    async unassignSkill(teamId, roleId, assetId) {
        await this.run(async () => {
            this.publish({ library: unwrap(await this.api().unassignRole(teamId, roleId, assetId)) });
            return 'unassigned';
        });
    }
    /**
     * Bind the selected asset to one role.
     * @param teamId - Team identity.
     * @param roleId - role identity, or `captain`.
     */
    async assign(teamId, roleId) {
        const assetId = this.state.selectedId;
        if (assetId === undefined)
            return;
        await this.run(async () => {
            const answer = unwrap(await this.api().assignRole(teamId, roleId, assetId));
            this.publish({ library: answer.library });
            if (this.state.selectedId !== undefined)
                await this.select(this.state.selectedId);
            return answer.ok ? 'assigned' : answer.detail;
        });
    }
    /**
     * Remove one role's assignment.
     * @param teamId - Team identity.
     * @param roleId - role identity.
     */
    async unassign(teamId, roleId) {
        await this.run(async () => {
            const library = unwrap(await this.api().unassignRole(teamId, roleId));
            this.publish({ library });
            if (this.state.selectedId !== undefined)
                await this.select(this.state.selectedId);
            return 'unassigned';
        });
    }
    /** Restore official default skill bindings for built-in teams. */
    async restoreBuiltinBindings(teamIds) {
        await this.run(async () => {
            const library = unwrap(await this.api().restoreBuiltinBindings(teamIds ? [...teamIds] : undefined));
            this.publish({ library });
            if (this.state.selectedId !== undefined)
                await this.select(this.state.selectedId);
            return 'restored-bindings';
        });
    }
    /**
     * The generated Client face for this plugin's services.
     * @returns the mounted Remote namespace.
     */
    api() {
        if (this.service === undefined)
            throw new Error('the Team Skill service is not available in this deployment');
        return this.service;
    }
    /**
     * Run one write with a busy flag and a single message.
     * @param work - the call, returning the message key or a refusal text.
     */
    async run(work) {
        this.publish({ busy: true, message: undefined, failed: false });
        try {
            const message = await work();
            // A success is shown by the refreshed panel itself; only a refusal needs
            // words, so a machine key never reaches the user as raw text.
            const succeeded = /^(saved|created|imported|deleted|assigned|unassigned|scanned|override-created|override-reset|restored-bindings)$/u.test(message);
            this.publish({ busy: false, message: succeeded ? undefined : message, failed: !succeeded });
        }
        catch (error) {
            this.publish({ busy: false, message: String(error), failed: true });
        }
    }
}
/**
 * Encode bytes for the Remote boundary.
 *
 * `btoa` needs a binary string, and a chunked conversion keeps a large skill
 * file from overflowing the call stack of `String.fromCharCode`.
 * @param bytes - file content.
 * @returns base64 text.
 */
function encodeBase64(bytes) {
    let binary = '';
    const chunk = 0x8000;
    for (let at = 0; at < bytes.length; at += chunk) {
        binary += String.fromCharCode(...bytes.subarray(at, at + chunk));
    }
    return btoa(binary);
}
