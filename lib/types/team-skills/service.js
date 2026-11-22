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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { buildSkillPackage, decodeImportFiles } from "./import.js";
import { CAPTAIN_ROLE, sanctionedCopy } from "./manager.js";
import { OFFICIAL_SKILL_IDS } from "./official-bindings.js";
import { assertNoSymlinks } from "./paths.js";
import { fileTable, folderDigest, inspectSkillDirectory, SKILL_IMPORT_FOLDER } from "./store.js";
const UNAVAILABLE = 'the Team Skill store could not be opened in this deployment';
/** Blank instruction text a freshly created skill starts from. */
const TEMPLATE = '---\nname: SKILL-ID\ndescription: Describe when this method applies.\n---\n\n# Method\n\nDescribe the steps to follow.\n';
/**
 * Remote management surface over the private Team Skill library.
 */
let TeamSkillService = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _library_decorators;
    let _detail_decorators;
    let _readFile_decorators;
    let _writeFile_decorators;
    let _createSkill_decorators;
    let _importSkill_decorators;
    let _prepareImportFolder_decorators;
    let _scanImportFolder_decorators;
    let _overrideSkill_decorators;
    let _updateDependencies_decorators;
    let _resetSkill_decorators;
    let _deleteAsset_decorators;
    let _assignRole_decorators;
    let _unassignRole_decorators;
    let _restoreBuiltinBindings_decorators;
    return class TeamSkillService extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _library_decorators = [Remote];
            _detail_decorators = [Remote];
            _readFile_decorators = [Remote];
            _writeFile_decorators = [Remote];
            _createSkill_decorators = [Remote];
            _importSkill_decorators = [Remote];
            _prepareImportFolder_decorators = [Remote];
            _scanImportFolder_decorators = [Remote];
            _overrideSkill_decorators = [Remote];
            _updateDependencies_decorators = [Remote];
            _resetSkill_decorators = [Remote];
            _deleteAsset_decorators = [Remote];
            _assignRole_decorators = [Remote];
            _unassignRole_decorators = [Remote];
            _restoreBuiltinBindings_decorators = [Remote];
            __esDecorate(this, null, _library_decorators, { kind: "method", name: "library", static: false, private: false, access: { has: obj => "library" in obj, get: obj => obj.library }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _detail_decorators, { kind: "method", name: "detail", static: false, private: false, access: { has: obj => "detail" in obj, get: obj => obj.detail }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _readFile_decorators, { kind: "method", name: "readFile", static: false, private: false, access: { has: obj => "readFile" in obj, get: obj => obj.readFile }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _writeFile_decorators, { kind: "method", name: "writeFile", static: false, private: false, access: { has: obj => "writeFile" in obj, get: obj => obj.writeFile }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createSkill_decorators, { kind: "method", name: "createSkill", static: false, private: false, access: { has: obj => "createSkill" in obj, get: obj => obj.createSkill }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _importSkill_decorators, { kind: "method", name: "importSkill", static: false, private: false, access: { has: obj => "importSkill" in obj, get: obj => obj.importSkill }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _prepareImportFolder_decorators, { kind: "method", name: "prepareImportFolder", static: false, private: false, access: { has: obj => "prepareImportFolder" in obj, get: obj => obj.prepareImportFolder }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _scanImportFolder_decorators, { kind: "method", name: "scanImportFolder", static: false, private: false, access: { has: obj => "scanImportFolder" in obj, get: obj => obj.scanImportFolder }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _overrideSkill_decorators, { kind: "method", name: "overrideSkill", static: false, private: false, access: { has: obj => "overrideSkill" in obj, get: obj => obj.overrideSkill }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateDependencies_decorators, { kind: "method", name: "updateDependencies", static: false, private: false, access: { has: obj => "updateDependencies" in obj, get: obj => obj.updateDependencies }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resetSkill_decorators, { kind: "method", name: "resetSkill", static: false, private: false, access: { has: obj => "resetSkill" in obj, get: obj => obj.resetSkill }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteAsset_decorators, { kind: "method", name: "deleteAsset", static: false, private: false, access: { has: obj => "deleteAsset" in obj, get: obj => obj.deleteAsset }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _assignRole_decorators, { kind: "method", name: "assignRole", static: false, private: false, access: { has: obj => "assignRole" in obj, get: obj => obj.assignRole }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _unassignRole_decorators, { kind: "method", name: "unassignRole", static: false, private: false, access: { has: obj => "unassignRole" in obj, get: obj => obj.unassignRole }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _restoreBuiltinBindings_decorators, { kind: "method", name: "restoreBuiltinBindings", static: false, private: false, access: { has: obj => "restoreBuiltinBindings" in obj, get: obj => obj.restoreBuiltinBindings }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        config = __runInitializers(this, _instanceExtraInitializers);
        /**
         * @param ctx - the owning plugin context.
         * @param config - the store, the manager, and the live roster.
         */
        constructor(ctx, config) {
            super(ctx, 'teamSkills');
            this.config = config;
        }
        /**
         * Wait for the store, reporting why it is unusable.
         * @returns undefined when ready, or the reason the page must show.
         */
        async settle() {
            let opened = false;
            try {
                opened = await this.config.ready;
            }
            catch (error) {
                return `${UNAVAILABLE}: ${String(error)}`;
            }
            if (!opened)
                return this.config.startupIssue?.() ?? UNAVAILABLE;
            try {
                await this.config.manager.reconcile();
            }
            catch (error) {
                return String(error);
            }
            return undefined;
        }
        /**
         * Shape one asset for the page.
         * @param assetId - asset identity.
         * @returns the row, or undefined when it no longer exists.
         */
        row(assetId) {
            const asset = this.config.store.get(assetId);
            if (asset === undefined)
                return undefined;
            return {
                id: asset.id,
                skillId: asset.skillId,
                description: asset.description,
                origin: asset.origin,
                version: asset.version,
                ...asset.officialSkillId === undefined ? {} : { officialSkillId: asset.officialSkillId },
                ...asset.updateAvailable === undefined ? {} : { updateAvailable: asset.updateAvailable },
                editable: asset.origin !== 'builtin',
                fileCount: asset.files.length,
                totalBytes: asset.files.reduce((sum, file) => sum + file.size, 0),
                mcpServers: asset.dependencies.mcpServers.map(server => server.serverName),
                // A name can legitimately exist under several origins, but two of them are
                // the SAME skill: the shipped copy and an override derived from it. That
                // pair is a sanctioned copy, not a clash, and reporting it made a healthy
                // library look broken. Anything else sharing the name is a real clash the
                // page has to state, because nothing overwrites anything.
                clashesWith: this.config.store.list()
                    .filter(other => other.id !== asset.id && other.skillId === asset.skillId && !sanctionedCopy(asset, other))
                    .map(other => other.id),
                bindings: this.config.manager.bindingSummaries(assetId),
            };
        }
        /**
         * Read the Teams the binding dialog addresses.
         * @returns one row per Team, captain slot first.
         */
        roster() {
            return this.config.teams().map(team => ({
                id: team.id,
                name: team.name,
                roles: [
                    { id: CAPTAIN_ROLE, name: team.captain.name, captain: true },
                    // A member without a stored identity is addressed by its name, which is
                    // the same fallback the runtime uses when it resolves a claim.
                    ...team.members.map(member => ({ id: member.id ?? member.name, name: member.name, captain: false })),
                ],
            }));
        }
        /**
         * List the library, the roster, and the shipped skill ids.
         * @returns one page load.
         */
        async library(checkInbox) {
            const issue = await this.settle();
            if (issue !== undefined) {
                return { root: this.config.store.root, assets: [], teams: [], official: [], issue };
            }
            const check = checkInbox === true ? await this.checkInbox() : undefined;
            return {
                root: this.config.store.root,
                assets: this.config.store.list().flatMap((asset) => {
                    const row = this.row(asset.id);
                    return row === undefined ? [] : [row];
                }),
                teams: this.roster(),
                official: [...this.config.official()],
                ...(check === undefined ? {} : {
                    inboxChanges: Array.isArray(check)
                        ? check.filter(entry => entry.status !== 'existing').map(({ digest: _digest, ...entry }) => entry)
                        : [{ folder: SKILL_IMPORT_FOLDER, status: 'invalid', reason: 'unreadable' }],
                }),
            };
        }
        /**
         * Read one asset with its files and body.
         * @param assetId - asset identity.
         * @returns the detail, or a refusal when the asset is gone.
         */
        async detail(assetId) {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, reason: 'unavailable', detail: issue };
            const asset = this.config.store.get(assetId);
            const row = this.row(assetId);
            if (asset === undefined || row === undefined) {
                return { ok: false, reason: 'unknown-asset', detail: `Team Skill "${assetId}" is not installed any more.` };
            }
            let body = '';
            try {
                body = await this.config.store.readText(assetId, 'SKILL.md');
            }
            catch (error) {
                return { ok: false, reason: 'unreadable', detail: String(error) };
            }
            const report = await this.config.manager.dependencyReport(assetId);
            return {
                asset: row,
                files: asset.files.map(file => ({ path: file.path, size: file.size, text: file.text })),
                body,
                directory: asset.sourceFolder === undefined
                    ? this.config.store.assetPath(asset.id, asset.version)
                    : this.config.store.sourcePath(asset.sourceFolder),
                dependencies: report,
            };
        }
        /**
         * Read one text file of an asset.
         * @param assetId - asset identity.
         * @param path - relative path.
         * @returns the text, or a refusal.
         */
        async readFile(assetId, path) {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, reason: 'unavailable', detail: issue };
            try {
                return { ok: true, path, text: await this.config.store.readText(assetId, path) };
            }
            catch (error) {
                return { ok: false, reason: 'unreadable', detail: String(error) };
            }
        }
        /**
         * Write one file, publishing a new asset version.
         * @param assetId - asset identity.
         * @param path - relative path.
         * @param text - new content.
         * @param expectedVersion - the version the editor has open.
         * @returns the refreshed detail, or a refusal.
         */
        async writeFile(assetId, path, text, expectedVersion) {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, reason: 'unavailable', detail: issue };
            try {
                await this.config.store.writeFile(assetId, path, text, expectedVersion);
            }
            catch (error) {
                return { ok: false, reason: 'write-refused', detail: String(error) };
            }
            this.config.resync();
            return this.detail(assetId);
        }
        reservedSkillName(name) {
            return OFFICIAL_SKILL_IDS.some(skillId => skillId === name) || this.config.official().includes(name)
                || this.config.store.get(`builtin:${name}`) !== undefined;
        }
        /**
         * Create one editable skill from the blank template.
         * @param skillId - kebab-case name the new skill takes.
         * @param description - frontmatter description.
         * @returns the new detail, or a refusal when the folder is not a legal skill.
         */
        async createSkill(skillId, description) {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, reason: 'unavailable', detail: issue };
            const text = TEMPLATE.replace('SKILL-ID', skillId).replace('Describe when this method applies.', description);
            const result = buildSkillPackage([{ path: 'SKILL.md', bytes: new TextEncoder().encode(text) }]);
            if (!result.ok)
                return { ok: false, reason: result.reason, detail: `"${skillId}" is not a legal skill id.` };
            const id = `custom:${skillId}`;
            if (this.reservedSkillName(result.skill.name))
                return { ok: false, reason: 'builtin-name-conflict', detail: `"${result.skill.name}" is reserved for a read-only built-in Team Skill.` };
            if (this.config.store.list().some(asset => asset.skillId === result.skill.name))
                return { ok: false, reason: 'duplicate', detail: `a skill named "${result.skill.name}" already exists` };
            try {
                await this.config.store.install(result.skill, { id, origin: 'custom', version: '1' });
            }
            catch (error) {
                return { ok: false, reason: 'install-refused', detail: String(error) };
            }
            return this.detail(id);
        }
        /**
         * Import one folder, as the browser's picker sends it.
         * @param files - relative paths and base64 content.
         * @returns the new detail, or a refusal naming the exact rule that failed.
         */
        async importSkill(files) {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, reason: 'unavailable', detail: issue };
            let decoded;
            try {
                decoded = decodeImportFiles(files.map(file => ({ path: file.path, base64: file.base64 })));
            }
            catch (error) {
                return { ok: false, reason: 'import-refused', detail: String(error) };
            }
            const result = buildSkillPackage(decoded);
            if (!result.ok) {
                return { ok: false, reason: result.reason, detail: `${result.reason}${result.path === undefined ? '' : ` at ${result.path}`}` };
            }
            const id = `custom:${result.skill.name}`;
            if (this.reservedSkillName(result.skill.name))
                return { ok: false, reason: 'builtin-name-conflict', detail: `"${result.skill.name}" is reserved for a read-only built-in Team Skill.` };
            if (this.config.store.list().some(asset => asset.skillId === result.skill.name)) {
                return { ok: false, reason: 'duplicate', detail: `a skill named "${result.skill.name}" already exists` };
            }
            try {
                await this.config.store.install(result.skill, { id, origin: 'custom', version: '1' });
            }
            catch (error) {
                return { ok: false, reason: 'install-refused', detail: String(error) };
            }
            const detail = await this.detail(id);
            return 'asset' in detail && result.dependencyWarnings.length > 0
                ? { ...detail, ignoredDependencyFields: result.dependencyWarnings.map(warning => warning.field) }
                : detail;
        }
        /**
         * Create the private import directory when it is missing.
         *
         * The page opens this folder for the user, so the gesture has to work on a
         * fresh installation where no scan ever ran. Creating it here also keeps the
         * path the same one {@link scanImportFolder} reads.
         * @returns the absolute folder, or a refusal when it cannot be created safely.
         */
        async prepareImportFolder() {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, reason: 'unavailable', detail: issue };
            const path = join(this.config.store.root, SKILL_IMPORT_FOLDER);
            try {
                await assertNoSymlinks(path);
                await mkdir(path, { recursive: true });
                await assertNoSymlinks(path);
            }
            catch (error) {
                return { ok: false, reason: 'scan-folder-refused', detail: String(error) };
            }
            return { ok: true, root: this.config.store.root, path };
        }
        async checkInbox() {
            const root = join(this.config.store.root, SKILL_IMPORT_FOLDER);
            let dirents;
            try {
                await assertNoSymlinks(root);
                dirents = await readdir(root, { withFileTypes: true });
            }
            catch (error) {
                if (error.code !== 'ENOENT')
                    return { ok: false, reason: 'scan-refused', detail: String(error) };
                dirents = [];
            }
            const entries = [];
            const names = new Map();
            for (const dirent of dirents.sort((left, right) => left.name.localeCompare(right.name))) {
                const folder = dirent.name;
                if (folder.startsWith('.'))
                    continue;
                if (!dirent.isDirectory()) {
                    entries.push({ folder, status: 'invalid', reason: dirent.isSymbolicLink() ? 'symlink-escape' : 'not-directory' });
                    continue;
                }
                const inspected = await inspectSkillDirectory(join(root, folder));
                if (!inspected.ok) {
                    entries.push({ folder, status: 'invalid', reason: inspected.reason, ...(inspected.path === undefined ? {} : { detail: inspected.path }) });
                    continue;
                }
                const skillId = inspected.skill.name;
                const ignoredDependencyFields = inspected.dependencyWarnings.map(warning => warning.field);
                const info = { folder, skillId, ...(ignoredDependencyFields.length === 0 ? {} : { ignoredDependencyFields }) };
                if (this.reservedSkillName(skillId)) {
                    entries.push({ ...info, status: 'invalid', reason: 'builtin-name-conflict' });
                    continue;
                }
                const current = this.config.store.bySkillId(skillId);
                if (current !== undefined && current.origin !== 'custom') {
                    entries.push({ ...info, status: 'invalid', reason: 'copy-name-conflict', assetId: current.id });
                    continue;
                }
                const digest = folderDigest(fileTable(inspected.skill.files));
                const duplicate = names.get(skillId);
                if (duplicate !== undefined) {
                    const previous = entries[duplicate];
                    entries[duplicate] = { ...previous, status: 'invalid', reason: 'duplicate-source-name' };
                    entries.push({ ...info, status: 'invalid', reason: 'duplicate-source-name' });
                    continue;
                }
                names.set(skillId, entries.length);
                if (current === undefined)
                    entries.push({ ...info, status: 'imported', digest });
                else
                    entries.push({ ...info, assetId: current.id, digest,
                        status: current.digest !== digest || (current.sourceFolder !== undefined && current.sourceFolder !== folder) ? 'updated' : 'existing' });
            }
            for (const asset of this.config.store.list()) {
                if (asset.sourceFolder === undefined || names.has(asset.skillId))
                    continue;
                if (entries.some(entry => entry.folder === asset.sourceFolder && entry.status === 'invalid'))
                    continue;
                entries.push({ folder: asset.sourceFolder, status: 'missing', skillId: asset.skillId, assetId: asset.id, reason: 'source-missing' });
            }
            return entries;
        }
        /** Validate sources, publishing changed packages as new versions only on this explicit request. */
        async scanImportFolder() {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, reason: 'unavailable', detail: issue };
            const root = join(this.config.store.root, SKILL_IMPORT_FOLDER);
            const result = await this.config.store.withLock(async () => {
                const planned = await this.checkInbox();
                if (!Array.isArray(planned))
                    return planned;
                const entries = [];
                for (const { digest, ...entry } of planned) {
                    if (entry.status === 'invalid' || entry.status === 'missing') {
                        entries.push(entry);
                        continue;
                    }
                    const inspected = await inspectSkillDirectory(join(root, entry.folder));
                    if (!inspected.ok || inspected.skill.name !== entry.skillId || folderDigest(fileTable(inspected.skill.files)) !== digest) {
                        entries.push({ ...entry, status: 'invalid', reason: 'source-changed' });
                        continue;
                    }
                    try {
                        const status = await this.config.store.publishSource(entry.folder, inspected.skill);
                        entries.push({ ...entry, status, assetId: this.config.store.bySkillId(inspected.skill.name).id });
                    }
                    catch (error) {
                        entries.push({ ...entry, status: 'invalid', reason: 'install-refused', detail: String(error) });
                    }
                }
                const count = (status) => entries.filter(entry => entry.status === status).length;
                const missing = count('missing');
                return { ok: true, root, scanned: entries.length - missing, imported: count('imported'), updated: count('updated'),
                    existing: count('existing'), invalid: count('invalid'), missing, entries };
            });
            if (result.ok && (result.updated > 0 || result.imported > 0))
                this.config.resync();
            return result;
        }
        /**
         * Copy one shipped skill into an editable override.
         * @param skillId - shipped skill id.
         * @returns the new detail, or a refusal.
         */
        async overrideSkill(skillId, switchBindings) {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, reason: 'unavailable', detail: issue };
            let id;
            try {
                const asset = await this.config.store.createOverride(skillId, undefined, [...OFFICIAL_SKILL_IDS, ...this.config.official()]);
                id = asset.id;
            }
            catch (error) {
                return { ok: false, reason: 'override-refused', detail: String(error) };
            }
            let bindingSwitchIssue;
            if (switchBindings === true) {
                try {
                    await this.config.manager.replaceBuiltinBindings(skillId, id);
                    this.config.resync();
                }
                catch (error) {
                    bindingSwitchIssue = String(error);
                }
            }
            const detail = await this.detail(id);
            return 'asset' in detail && bindingSwitchIssue !== undefined ? { ...detail, bindingSwitchIssue } : detail;
        }
        async updateDependencies(assetId, dependencies) {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, reason: 'unavailable', detail: issue };
            try {
                await this.config.store.updateDependencies(assetId, dependencies);
            }
            catch (error) {
                return { ok: false, reason: 'dependency-refused', detail: String(error) };
            }
            this.config.resync();
            return this.detail(assetId);
        }
        /**
         * Reset one override back to the shipped copy.
         * @param assetId - override identity.
         * @returns the refreshed detail, or a refusal.
         */
        async resetSkill(assetId) {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, reason: 'unavailable', detail: issue };
            try {
                const reset = await this.config.store.resetOverride(assetId);
                // "Restore to the built-in version" has to put the roles back on the
                // shipped copy: leaving them on a copy whose content merely equals the
                // shipped one would keep the default bound to the user's own asset.
                if (reset.officialSkillId !== undefined) {
                    await this.config.manager.replaceAssetBindings(assetId, `builtin:${reset.officialSkillId}`);
                }
            }
            catch (error) {
                return { ok: false, reason: 'reset-refused', detail: String(error) };
            }
            this.config.resync();
            return this.detail(assetId);
        }
        /**
         * Delete one asset, listing every blocker at once.
         * @param assetId - asset identity.
         * @returns the outcome.
         */
        async deleteAsset(assetId) {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, blockers: [{ kind: 'unavailable', detail: issue }], warnings: [] };
            let outcome;
            try {
                outcome = await this.config.manager.remove(assetId);
            }
            catch (error) {
                return { ok: false, blockers: [{ kind: 'delete-refused', detail: String(error) }], warnings: [] };
            }
            if (outcome.ok)
                this.config.resync();
            return {
                ok: outcome.ok,
                blockers: outcome.blockers.map((blocker) => {
                    if (blocker.kind === 'binding') {
                        return { kind: 'binding', detail: blocker.bindings.map(row => `${row.teamName} → ${row.roleName}`).join(', ') };
                    }
                    if (blocker.kind === 'active')
                        return { kind: 'active', detail: blocker.sessions.join(', ') };
                    if (blocker.kind === 'dependency')
                        return { kind: 'dependency', detail: blocker.dependents.join(', ') };
                    return { kind: 'official', detail: 'a shipped Team Skill is read-only' };
                }),
                warnings: outcome.warnings,
            };
        }
        /**
         * Bind one asset to one role slot.
         * @param teamId - Team identity.
         * @param roleId - role identity, or `captain`.
         * @param assetId - asset identity.
         * @returns whether the assignment landed, and the refreshed library.
         */
        async assignRole(teamId, roleId, assetId) {
            const issue = await this.settle();
            if (issue !== undefined)
                return { ok: false, detail: issue, library: await this.library() };
            let result;
            try {
                result = await this.config.manager.assign({ teamId, roleId, assetId, captain: roleId === CAPTAIN_ROLE });
            }
            catch (error) {
                return { ok: false, detail: String(error), library: await this.library() };
            }
            if (result.ok)
                this.config.resync();
            return {
                ok: result.ok,
                detail: result.ok ? (result.unverified.length === 0 ? '' : `Required MCP servers are unverified: ${result.unverified.join(', ')}`) : result.reason,
                unverified: result.unverified ?? [],
                library: await this.library(),
            };
        }
        /**
         * Remove one role's assignment.
         * @param teamId - Team identity.
         * @param roleId - role identity.
         * @returns the refreshed library.
         */
        async unassignRole(teamId, roleId, assetId) {
            if (await this.settle() !== undefined)
                return await this.library();
            try {
                await this.config.manager.unassign(teamId, roleId, assetId);
            }
            catch (error) {
                return { ...await this.library(), issue: String(error) };
            }
            this.config.resync();
            return this.library();
        }
        /**
         * Restore official default skill bindings for built-in teams.
         * @param teamIds - optional list of team identities to restore; defaults to all built-in teams.
         * @returns the refreshed library.
         */
        async restoreBuiltinBindings(teamIds) {
            if (await this.settle() !== undefined)
                return await this.library();
            try {
                await this.config.manager.restoreBuiltinBindings(teamIds);
            }
            catch (error) {
                // A swallowed error here reads on the page as "nothing happened", which is
                // indistinguishable from "there was nothing to restore". Log it, and keep
                // returning the issue so the page can name the failure too.
                this.ctx.logger.warn('agent-team-presets: restoring built-in Team Skill bindings failed: %s', String(error));
                return { ...await this.library(), issue: String(error) };
            }
            this.config.resync();
            return this.library();
        }
    };
})();
export { TeamSkillService };
