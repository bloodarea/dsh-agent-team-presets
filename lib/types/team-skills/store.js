/** Immutable package versions and an atomically persisted private registry. */
import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { SkillPathError, assertNoSymlinks, canonicalRoot, assetDirectoryName, checkFolder, isTextBytes, normalizeSkillPath, resolveInside } from "./paths.js";
import { buildSkillPackage } from "./import.js";
const REGISTRY_VERSION = 1;
const NO_DEPENDENCIES = { mcpServers: [], executables: [], otherSkills: [] };
const locks = new Map();
const lockContext = new AsyncLocalStorage();
function digestBytes(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
export function folderDigest(files) {
    const hash = createHash('sha256');
    for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path)))
        hash.update(`${file.path}\u0000${file.sha256}\n`);
    return hash.digest('hex');
}
export function fileTable(files) {
    return [...files].sort((a, b) => a.path.localeCompare(b.path)).map(file => ({ path: file.path, size: file.bytes.byteLength, sha256: digestBytes(file.bytes), text: isTextBytes(file.bytes) }));
}
const ENCODED_COMPONENT = /^~(?:[a-f0-9]+|h[a-f0-9]{64})$/u;
function component(value) {
    if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9:._-]*$/u.test(value))
        throw new Error(`invalid asset path component: ${String(value)}`);
    return value;
}
/** Logical ids stay unchanged in JSON; only their disk coordinates are encoded.
 * `~` was never a valid logical component, so encoded and old names cannot clash.
 * Uppercase, DOS devices and trailing dots are encoded on every platform too. */
export function diskComponent(value) {
    component(value);
    if (value.length <= 120 && /^[a-z0-9][a-z0-9._-]*$/u.test(value) && !value.endsWith('.')
        && !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(value))
        return value;
    return value.length <= 120 ? `~${Buffer.from(value, 'utf8').toString('hex')}` : `~h${digestBytes(Buffer.from(value, 'utf8'))}`;
}
function strings(value) { return Array.isArray(value) && value.every(item => typeof item === 'string'); }
function validateAsset(value) {
    if (value === null || typeof value !== 'object')
        throw new Error('invalid Team Skill asset');
    const a = value;
    component(a.id);
    component(a.version);
    assetDirectoryName(a.skillId);
    if (!['builtin', 'custom', 'override'].includes(a.origin) || typeof a.description !== 'string' || !/^[a-f0-9]{64}$/u.test(a.digest)
        || !Number.isSafeInteger(a.updatedAt) || a.updatedAt < 0 || !Array.isArray(a.files)
        || (a.officialSkillId !== undefined && (typeof a.officialSkillId !== 'string' || assetDirectoryName(a.officialSkillId) !== a.officialSkillId))
        || (a.baseVersion !== undefined && component(a.baseVersion) !== a.baseVersion)
        || (a.updateAvailable !== undefined && typeof a.updateAvailable !== 'boolean'))
        throw new Error('invalid Team Skill asset shape');
    for (const file of a.files) {
        if (file === null || typeof file !== 'object' || typeof file.path !== 'string' || normalizeSkillPath(file.path) !== file.path
            || typeof file.text !== 'boolean' || typeof file.sha256 !== 'string' || !/^[a-f0-9]{64}$/u.test(file.sha256))
            throw new Error('invalid Team Skill file shape');
    }
    checkFolder(a.files.map(file => ({ path: file.path, bytes: file.size })));
    if (!a.files.some(file => file.path === 'SKILL.md') || folderDigest(a.files) !== a.digest)
        throw new Error('invalid Team Skill file manifest');
    const d = a.dependencies;
    if (!d || !strings(d.executables) || !strings(d.otherSkills) || !Array.isArray(d.mcpServers)
        || d.mcpServers.some(server => !server || typeof server.serverName !== 'string' || typeof server.required !== 'boolean'
            || (server.toolNames !== undefined && !strings(server.toolNames))
            || (server.capabilities !== undefined && (!Array.isArray(server.capabilities) || server.capabilities.some((c) => c !== 'tools' && c !== 'resources')))))
        throw new Error('invalid Team Skill dependencies');
}
function immutable(asset) {
    const clone = structuredClone(asset);
    const freeze = (value) => { if (value && typeof value === 'object') {
        Object.values(value).forEach(freeze);
        Object.freeze(value);
    } };
    freeze(clone);
    return clone;
}
/** Atomically replace one JSON document; failed writes leave its previous bytes intact. */
export async function atomicWriteJson(path, value) {
    await assertNoSymlinks(path);
    await mkdir(dirname(path), { recursive: true });
    const temporary = join(dirname(path), `.tmp-${randomUUID()}`);
    try {
        const handle = await open(temporary, 'wx', 0o600);
        try {
            await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
            await handle.sync();
        }
        finally {
            await handle.close();
        }
        await assertNoSymlinks(path);
        await rename(temporary, path);
    }
    finally {
        await rm(temporary, { force: true });
    }
}
export class TeamSkillStore {
    configuredRoot;
    assets = new Map();
    revision = 0;
    opened = false;
    transactions = new AsyncLocalStorage();
    physicalRoot;
    constructor(configuredRoot) {
        this.configuredRoot = configuredRoot;
    }
    /** Pinned once open starts. Resolving it is kept out of plugin construction. */
    get root() { return this.physicalRoot ?? resolve(this.configuredRoot); }
    get registryRevision() { return this.revision; }
    get table() { return this.transactions.getStore()?.assets ?? this.assets; }
    assetPath(assetId, version) { return join(this.root, 'assets', diskComponent(assetId), diskComponent(version)); }
    manifestPath(assetId, version) { return join(this.root, 'manifests', diskComponent(assetId), `${diskComponent(version)}.json`); }
    /** Share this reentrant lock with manager check-and-commit operations. */
    async withLock(operation) {
        const key = resolve(this.root);
        if (lockContext.getStore()?.has(key))
            return operation();
        const previous = locks.get(key) ?? Promise.resolve();
        const next = previous.catch(() => { }).then(() => lockContext.run(new Set([...(lockContext.getStore() ?? []), key]), operation));
        locks.set(key, next);
        try {
            return await next;
        }
        finally {
            if (locks.get(key) === next)
                locks.delete(key);
        }
    }
    async load() {
        const path = join(this.root, 'registry.json');
        await assertNoSymlinks(path);
        let raw;
        try {
            raw = await readFile(path, 'utf8');
        }
        catch (error) {
            if (error.code === 'ENOENT')
                return new Map();
            throw error;
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || parsed.version !== REGISTRY_VERSION || !Array.isArray(parsed.assets))
            throw new Error('unexpected Team Skill registry layout');
        const assets = new Map();
        for (const asset of parsed.assets) {
            validateAsset(asset);
            if (assets.has(asset.id))
                throw new Error('duplicate Team Skill asset identity');
            assets.set(asset.id, immutable(asset));
        }
        return assets;
    }
    get journalPath() { return join(this.root, 'transaction.json'); }
    journalTarget(path) {
        if (!/^(?:(?:assets|manifests)\/(?:[A-Za-z0-9][A-Za-z0-9:._-]*|~(?:[a-f0-9]+|h[a-f0-9]{64}))(?:\/(?:[A-Za-z0-9][A-Za-z0-9:._-]*|~(?:[a-f0-9]+|h[a-f0-9]{64}))(?:\.json)?)?|\.(?:stage|removed)-[a-f0-9-]+)$/u.test(path)
            || path.split('/').some(part => part === '.' || part === '..'))
            throw new Error('invalid Team Skill transaction path');
        // Old POSIX journals may contain ':'. On Windows those coordinates were
        // never valid directories, and a drive-relative segment must not reset root.
        if (process.platform === 'win32' && path.includes(':'))
            throw new Error('invalid Team Skill transaction path');
        return resolveInside(this.root, path);
    }
    async record(action) {
        const tx = this.transactions.getStore();
        this.journalTarget(action.path);
        if (action.kind === 'move')
            this.journalTarget(action.backup);
        if (action.kind === 'relocate')
            this.journalTarget(action.destination);
        tx.journal.actions.push(action);
        // Write ahead: the action must be recoverable before any filesystem effect.
        await atomicWriteJson(this.journalPath, tx.journal);
    }
    async undo(journal) {
        while (journal.actions.length > 0) {
            const action = journal.actions[journal.actions.length - 1];
            const path = this.journalTarget(action.path);
            await assertNoSymlinks(path);
            if (action.kind === 'create')
                await rm(path, { recursive: true, force: true });
            else {
                const backup = this.journalTarget(action.kind === 'relocate' ? action.destination : action.backup);
                await assertNoSymlinks(backup);
                let exists = true;
                try {
                    await lstat(backup);
                }
                catch (error) {
                    if (error.code !== 'ENOENT')
                        throw error;
                    exists = false;
                }
                // A missing backup means either the rename never ran or this undo was
                // completed before another interruption. Both are safe to replay.
                if (exists)
                    await rename(backup, path);
            }
            journal.actions.pop();
            await atomicWriteJson(this.journalPath, journal);
        }
        await rm(this.journalPath, { force: true });
    }
    async cleanup(journal) {
        for (const action of journal.actions) {
            const path = action.kind === 'move' ? this.journalTarget(action.backup)
                : action.path.startsWith('.stage-') ? this.journalTarget(action.path) : undefined;
            if (path !== undefined) {
                await assertNoSymlinks(path);
                await rm(path, { recursive: true, force: true });
            }
        }
        await rm(this.journalPath, { force: true });
    }
    async recover() {
        await assertNoSymlinks(this.journalPath);
        let raw;
        try {
            raw = await readFile(this.journalPath, 'utf8');
        }
        catch (error) {
            if (error.code === 'ENOENT')
                return;
            throw error;
        }
        const value = JSON.parse(raw);
        if (!value || value.version !== 1 || typeof value.id !== 'string' || !/^[a-f0-9-]+$/u.test(value.id) || !Array.isArray(value.actions))
            throw new Error('invalid Team Skill transaction journal');
        for (const action of value.actions) {
            if (!action || (action.kind !== 'create' && action.kind !== 'move' && action.kind !== 'relocate') || typeof action.path !== 'string')
                throw new Error('invalid Team Skill transaction action');
            this.journalTarget(action.path);
            if (action.kind === 'move')
                this.journalTarget(action.backup);
            if (action.kind === 'relocate')
                this.journalTarget(action.destination);
        }
        // The registry rename is the commit point. A separate committed flag would
        // introduce another ambiguous window between these two durable documents.
        let committed = false;
        try {
            await assertNoSymlinks(join(this.root, 'registry.json'));
            const registry = JSON.parse(await readFile(join(this.root, 'registry.json'), 'utf8'));
            committed = registry.transactionId === value.id;
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
        if (committed)
            await this.cleanup(value);
        else
            await this.undo(value);
    }
    async open() {
        this.physicalRoot ??= canonicalRoot(this.configuredRoot);
        await this.withLock(async () => {
            if (this.opened)
                return;
            await this.recover();
            this.assets = await this.load();
            this.opened = true;
            try {
                await this.migrateLayout();
            }
            catch (error) {
                this.opened = false;
                throw error;
            }
        });
    }
    /** Move v1 POSIX directory names without changing identities or losing pinned
     * historical versions. A write-ahead relocate can be undone after a crash;
     * unlike deletion backups, committed destinations are never cleaned up. */
    async migrateLayout() {
        await this.transaction(async () => {
            const relocate = async (from, to) => {
                await assertNoSymlinks(from);
                if (from === to)
                    return;
                await assertNoSymlinks(to);
                try {
                    await lstat(to);
                    throw new Error('conflicting Team Skill storage layouts; refusing to overwrite');
                }
                catch (error) {
                    if (error.code !== 'ENOENT')
                        throw error;
                }
                await this.record({ kind: 'relocate', path: relative(this.root, from).split('\\').join('/'), destination: relative(this.root, to).split('\\').join('/') });
                await rename(from, to);
                this.transactions.getStore().dirty = true;
            };
            for (const kind of ['assets', 'manifests']) {
                const base = join(this.root, kind);
                await assertNoSymlinks(base);
                let entries;
                try {
                    entries = await readdir(base, { withFileTypes: true });
                }
                catch (error) {
                    if (error.code === 'ENOENT')
                        continue;
                    throw error;
                }
                for (const entry of entries) {
                    const source = join(base, entry.name);
                    await assertNoSymlinks(source);
                    if (!entry.isDirectory())
                        throw new Error('invalid Team Skill asset directory');
                    const name = ENCODED_COMPONENT.test(entry.name) ? entry.name : diskComponent(entry.name);
                    const directory = join(base, name);
                    await relocate(source, directory);
                    for (const version of await readdir(directory)) {
                        // An interrupted atomic manifest write can leave its private temp
                        // file. It is not a published version and must not block reopening.
                        if (kind === 'manifests' && !version.endsWith('.json')) {
                            await assertNoSymlinks(join(directory, version));
                            continue;
                        }
                        const logical = kind === 'manifests' ? version.replace(/\.json$/u, '') : version;
                        const encoded = ENCODED_COMPONENT.test(logical) ? logical : diskComponent(logical);
                        await relocate(join(directory, version), join(directory, kind === 'manifests' ? `${encoded}.json` : encoded));
                    }
                }
            }
        });
    }
    list() { return [...this.table.values()].sort((a, b) => a.skillId.localeCompare(b.skillId) || a.id.localeCompare(b.id)); }
    get(assetId) { return this.table.get(assetId); }
    /**
     * Resolve one skill by its name rather than by asset identity.
     *
     * Several assets may legitimately share a name: the shipped copy, a local
     * override of it, and a skill the user imported under the same name. The
     * shipped copy wins, because a name denotes the skill the plugin ships — a
     * user's own copy must never shadow it for a caller that only said the name.
     * Callers that know which copy they mean pass the asset id instead.
     * @param skillId - kebab-case skill name.
     * @returns the shipped copy when it exists, else the best local one.
     */
    bySkillId(skillId) {
        const candidates = this.list().filter(asset => asset.skillId === skillId);
        return candidates.find(asset => asset.origin === 'builtin')
            ?? candidates.find(asset => asset.origin === 'override')
            ?? candidates.find(asset => asset.origin === 'custom')
            ?? candidates[0];
    }
    /** Commit all nested store mutations once; failures restore memory and version folders. */
    async transaction(operation) {
        if (this.transactions.getStore())
            return operation();
        return this.withLock(async () => {
            await this.open();
            await this.recover();
            this.assets = await this.load();
            const tx = { assets: new Map(this.assets), journal: { version: 1, id: randomUUID(), actions: [] }, dirty: false };
            let result;
            try {
                result = await this.transactions.run(tx, operation);
                if (tx.dirty)
                    await atomicWriteJson(join(this.root, 'registry.json'), { version: REGISTRY_VERSION, transactionId: tx.journal.id, assets: [...tx.assets.values()] });
            }
            catch (error) {
                await this.undo(tx.journal);
                throw error;
            }
            this.assets = tx.assets;
            if (tx.dirty)
                this.revision += 1;
            // Once committed, leave a failed cleanup journal for startup to finish.
            await this.cleanup(tx.journal).catch(() => { });
            return result;
        });
    }
    async install(package_, options) {
        // Snapshot caller-owned buffers before any await.
        const input = package_.files.map(file => ({ path: file.path, bytes: new Uint8Array(file.bytes) }));
        return this.transaction(async () => {
            const checked = buildSkillPackage(input);
            if (!checked.ok)
                throw new Error(`invalid skill package: ${checked.reason}`);
            assetDirectoryName(package_.name);
            // The English skill name is the identity every other surface uses: a
            // binding names it, a preset document exports it, and the model addresses
            // the skill by it. Two assets may therefore share it only when one is a
            // sanctioned copy of the other -- an override IS the shipped skill, edited.
            // A user skill or import taking a name that already belongs to another
            // skill is refused here rather than allowed to shadow it, which is what
            // made "bind `git-release-hygiene`" ambiguous in the first place. The
            // shipped set is authoritative: installing a builtin always proceeds, so a
            // legacy same-named user skill can neither block a release nor win a
            // binding (bindings resolve by the builtin's identity).
            if (options.origin !== 'builtin') {
                const clash = [...this.table.values()].find(asset => asset.skillId === package_.name && asset.id !== options.id
                    && !(options.origin === 'override' && asset.origin === 'builtin'));
                if (clash !== undefined) {
                    throw new Error(`the skill name "${package_.name}" already belongs to ${clash.id}; a skill name is the identity a binding uses`);
                }
            }
            const target = this.assetPath(options.id, options.version);
            const manifest = this.manifestPath(options.id, options.version);
            await assertNoSymlinks(target);
            await assertNoSymlinks(manifest);
            try {
                await lstat(target);
                throw new Error(`Team Skill version already exists: ${options.version}`);
            }
            catch (error) {
                if (error.code !== 'ENOENT')
                    throw error;
            }
            const files = fileTable(checked.skill.files);
            const asset = immutable({ id: options.id, skillId: package_.name, description: checked.skill.description, origin: options.origin, version: options.version,
                ...options.officialSkillId === undefined ? {} : { officialSkillId: options.officialSkillId },
                ...options.baseVersion === undefined ? {} : { baseVersion: options.baseVersion },
                digest: folderDigest(files), files, dependencies: options.dependencies ?? NO_DEPENDENCIES, updatedAt: Date.now() });
            validateAsset(asset);
            const tx = this.transactions.getStore();
            const previous = this.table.get(options.id);
            if (previous && previous.version !== options.version) {
                const previousManifest = this.manifestPath(previous.id, previous.version);
                await assertNoSymlinks(previousManifest);
                try {
                    await lstat(previousManifest);
                }
                catch (error) {
                    if (error.code !== 'ENOENT')
                        throw error;
                    await this.record({ kind: 'create', path: relative(this.root, previousManifest).split('\\').join('/') });
                    await atomicWriteJson(previousManifest, previous);
                }
            }
            const stage = join(this.root, `.stage-${randomUUID()}`);
            await this.record({ kind: 'create', path: relative(this.root, stage).split('\\').join('/') });
            await mkdir(stage, { recursive: true });
            for (const file of checked.skill.files) {
                const path = resolveInside(stage, file.path);
                await mkdir(dirname(path), { recursive: true });
                await writeFile(path, file.bytes, { flag: 'wx' });
            }
            await mkdir(dirname(target), { recursive: true });
            await assertNoSymlinks(target);
            await this.record({ kind: 'create', path: relative(this.root, target).split('\\').join('/') });
            await rename(stage, target);
            // A separate manifest keeps internal bookkeeping out of the user's package.
            try {
                await lstat(manifest);
                throw new Error('Team Skill version manifest already exists');
            }
            catch (error) {
                if (error.code !== 'ENOENT')
                    throw error;
            }
            await this.record({ kind: 'create', path: relative(this.root, manifest).split('\\').join('/') });
            await atomicWriteJson(manifest, asset);
            tx.assets.set(asset.id, asset);
            tx.dirty = true;
            return asset;
        });
    }
    async writeFile(assetId, path, content) {
        return this.transaction(async () => {
            const asset = requireAsset(this.table, assetId);
            if (asset.origin === 'builtin')
                throw new Error('a shipped Team Skill is read-only; create an editable copy instead');
            const relative = normalizeSkillPath(path);
            const files = new Map();
            for (const file of asset.files)
                files.set(file.path, await this.readBytes(assetId, file.path, asset.version));
            files.set(relative, new Uint8Array(Buffer.from(content, 'utf8')));
            const checked = buildSkillPackage([...files].map(([path, bytes]) => ({ path, bytes })));
            if (!checked.ok)
                throw new Error(`invalid skill package: ${checked.reason}`);
            if (checked.skill.name !== asset.skillId)
                throw new Error('editing cannot change the skill name');
            return this.install(checked.skill, { ...asset, version: nextVersion() });
        });
    }
    /** Change dependency metadata by publishing a new immutable asset version. */
    async updateDependencies(assetId, dependencies) {
        return this.transaction(async () => {
            const asset = requireAsset(this.table, assetId);
            if (asset.origin === 'builtin')
                throw new Error('a shipped Team Skill is read-only; create an editable copy instead');
            const files = [];
            for (const file of asset.files)
                files.push({ path: file.path, bytes: await this.readBytes(assetId, file.path, asset.version) });
            const checked = buildSkillPackage(files);
            if (!checked.ok)
                throw new Error(`invalid skill package: ${checked.reason}`);
            return this.install({ ...checked.skill, name: asset.skillId }, { ...asset, dependencies, version: nextVersion() });
        });
    }
    async readBytes(assetId, path, version) {
        const current = requireAsset(this.table, assetId);
        let asset = current;
        if (version !== undefined && version !== current.version) {
            const manifest = this.manifestPath(assetId, version);
            await assertNoSymlinks(manifest);
            const value = JSON.parse(await readFile(manifest, 'utf8'));
            validateAsset(value);
            if (value.id !== assetId || value.version !== version)
                throw new Error('mismatched Team Skill version manifest');
            asset = value;
        }
        const relative = normalizeSkillPath(path);
        const file = asset.files.find(file => file.path === relative);
        if (!file)
            throw new Error(`file is not in the Team Skill manifest: ${relative}`);
        const absolute = resolveInside(this.assetPath(assetId, asset.version), relative);
        await assertNoSymlinks(absolute);
        const info = await lstat(absolute);
        if (!info.isFile() || info.size !== file.size)
            throw new Error('Team Skill resource failed size or regular-file validation');
        const bytes = new Uint8Array(await readFile(absolute));
        if (bytes.byteLength !== file.size || digestBytes(bytes) !== file.sha256)
            throw new Error('Team Skill resource failed integrity validation');
        return bytes;
    }
    async readText(assetId, path, version) { return new TextDecoder('utf-8').decode(await this.readBytes(assetId, path, version)); }
    async remove(assetId, beforeCommit) {
        await this.transaction(async () => {
            const asset = requireAsset(this.table, assetId);
            if (asset.origin === 'builtin')
                throw new Error('a shipped Team Skill is read-only and cannot be deleted');
            const tx = this.transactions.getStore();
            for (const path of [join(this.root, 'assets', diskComponent(assetId)), join(this.root, 'manifests', diskComponent(assetId))]) {
                await assertNoSymlinks(path);
                const backup = join(this.root, `.removed-${randomUUID()}`);
                await this.record({ kind: 'move', path: relative(this.root, path).split('\\').join('/'), backup: relative(this.root, backup).split('\\').join('/') });
                try {
                    await rename(path, backup);
                }
                catch (error) {
                    if (error.code !== 'ENOENT')
                        throw error;
                }
            }
            beforeCommit?.();
            tx.assets.delete(assetId);
            tx.dirty = true;
        });
    }
    async ensureOfficial(entries, warnings) {
        return this.transaction(async () => {
            const changed = [];
            for (const entry of entries) {
                const files = await readDirectory(entry.directory);
                const id = `builtin:${entry.skillId}`;
                const current = this.table.get(id);
                const digest = folderDigest(fileTable(files));
                if (current !== undefined && current.version === entry.version && current.digest !== digest) {
                    // A shipped copy changed without a version bump. Never rewrite the
                    // immutable directory: keep the reviewed copy and report the defect.
                    warnings?.push(`the shipped skill "${entry.skillId}" changed without bumping its version; keeping version ${entry.version}`);
                }
                else if (current === undefined || current.version !== entry.version) {
                    const previous = await this.manifest(id, entry.version);
                    if (previous !== undefined && previous.digest === digest) {
                        // The exact version is already on disk (a downgrade or a reinstall):
                        // point the registry back at it instead of republishing.
                        this.table.set(id, immutable({ ...previous, officialSkillId: entry.skillId }));
                        this.transactions.getStore().dirty = true;
                        changed.push(id);
                    }
                    else {
                        await this.installFiles(entry.skillId, files, { id, origin: 'builtin', version: entry.version, officialSkillId: entry.skillId });
                        changed.push(id);
                    }
                }
                for (const asset of this.list()) {
                    if (asset.origin !== 'override' || asset.officialSkillId !== entry.skillId)
                        continue;
                    const outdated = asset.baseVersion !== entry.version;
                    if (asset.updateAvailable === outdated)
                        continue;
                    this.table.set(asset.id, immutable({ ...asset, updateAvailable: outdated }));
                    this.transactions.getStore().dirty = true;
                    changed.push(asset.id);
                }
            }
            return changed;
        });
    }
    async installFiles(skillId, files, options) {
        const checked = buildSkillPackage(files);
        if (!checked.ok)
            throw new Error(`invalid skill package: ${checked.reason}`);
        return this.install({ ...checked.skill, name: skillId }, options);
    }
    async manifest(assetId, version) {
        const path = this.manifestPath(assetId, version);
        await assertNoSymlinks(path);
        let raw;
        try {
            raw = await readFile(path, 'utf8');
        }
        catch (error) {
            if (error.code === 'ENOENT')
                return undefined;
            throw error;
        }
        const parsed = JSON.parse(raw);
        validateAsset(parsed);
        if (parsed.id !== assetId || parsed.version !== version)
            throw new Error('Team Skill manifest does not match its version');
        return immutable(parsed);
    }
    async createOverride(skillId, id) {
        return this.transaction(async () => {
            const existing = this.table.get(id);
            if (existing) {
                if (existing.origin === 'override' && existing.officialSkillId === skillId)
                    return existing;
                throw new Error('asset identity already belongs to another skill');
            }
            const official = requireAsset(this.table, `builtin:${skillId}`);
            const files = [];
            for (const file of official.files)
                files.push({ path: file.path, bytes: await this.readBytes(official.id, file.path, official.version) });
            return this.installFiles(skillId, files, { id, origin: 'override', version: nextVersion(), officialSkillId: skillId, baseVersion: official.version });
        });
    }
    async resetOverride(assetId) {
        return this.transaction(async () => {
            const asset = requireAsset(this.table, assetId);
            if (asset.origin !== 'override' || asset.officialSkillId === undefined)
                throw new Error('only an override of a shipped Team Skill can be reset');
            const official = requireAsset(this.table, `builtin:${asset.officialSkillId}`);
            const files = [];
            for (const file of official.files)
                files.push({ path: file.path, bytes: await this.readBytes(official.id, file.path, official.version) });
            return this.installFiles(official.skillId, files, { id: assetId, origin: 'override', version: nextVersion(), officialSkillId: official.skillId, baseVersion: official.version });
        });
    }
    async verify(assetId) {
        const asset = this.table.get(assetId);
        if (!asset)
            return false;
        try {
            for (const file of asset.files)
                await this.readBytes(assetId, file.path, asset.version);
            return true;
        }
        catch {
            return false;
        }
    }
}
function requireAsset(assets, assetId) {
    const asset = assets.get(assetId);
    if (!asset)
        throw new Error(`unknown Team Skill asset "${assetId}"`);
    return asset;
}
function nextVersion() { return `${Date.now()}-${randomUUID()}`; }
async function readDirectory(source) {
    const root = canonicalRoot(source);
    await assertNoSymlinks(root);
    const files = [];
    const walk = async (relative) => {
        const directory = relative === '' ? root : resolveInside(root, relative);
        await assertNoSymlinks(directory);
        for (const entry of await readdir(directory, { withFileTypes: true })) {
            const path = normalizeSkillPath(relative === '' ? entry.name : `${relative}/${entry.name}`);
            const absolute = resolveInside(root, path);
            await assertNoSymlinks(absolute);
            const info = await lstat(absolute);
            if (info.isDirectory()) {
                await walk(path);
                continue;
            }
            if (!info.isFile())
                throw new Error(`skill contains a non-regular resource: ${path}`);
            checkFolder([...files.map(file => ({ path: file.path, bytes: file.bytes.byteLength })), { path, bytes: info.size }]);
            files.push({ path, bytes: new Uint8Array(await readFile(absolute)) });
        }
    };
    await walk('');
    return files.sort((a, b) => a.path.localeCompare(b.path));
}
export async function installFromDirectory(store, source, options) {
    const checked = buildSkillPackage(await readDirectory(source));
    if (!checked.ok)
        throw new Error(`invalid skill package: ${checked.reason}`);
    return store.install({ ...checked.skill, name: options.skillId }, options);
}
/**
 * Validate one external folder without publishing it.
 *
 * The scan reports every refused folder with its own reason, so it must see the
 * same verdict the importer would produce instead of guessing from the name.
 * @param source - absolute folder to read.
 * @returns the package or the refusal code and offending path.
 */
export async function inspectSkillDirectory(source) {
    try {
        const checked = buildSkillPackage(await readDirectory(source));
        if (checked.ok)
            return { ok: true, skill: checked.skill };
        return { ok: false, reason: checked.reason, ...checked.path === undefined ? {} : { path: checked.path } };
    }
    catch (error) {
        if (error instanceof SkillPathError)
            return { ok: false, reason: error.reason, ...error.path === undefined ? {} : { path: error.path } };
        return { ok: false, reason: 'unreadable' };
    }
}
export async function copyDirectory(from, to) {
    const files = await readDirectory(from);
    await assertNoSymlinks(to);
    await mkdir(to, { recursive: true });
    for (const file of files) {
        const destination = resolveInside(to, file.path);
        await assertNoSymlinks(destination);
        await mkdir(dirname(destination), { recursive: true });
        await writeFile(destination, file.bytes, { flag: 'wx' });
    }
}
