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
import { access, readFile, stat } from 'node:fs/promises';
import { delimiter, join } from 'node:path';
import { atomicWriteJson } from "./store.js";
import { assertNoSymlinks } from "./paths.js";
import { BUILTIN_TEAM_IDS } from "../team-catalog.js";
import { CAPTAIN_ROLE, isOfficialSkillAsset, isOfficialSkillOverride, officialSkillDefaults, officialSkillTarget } from "./official-bindings.js";
import { constants } from 'node:fs';
/** Bindings document revision this build understands. */
const BINDINGS_VERSION = 1;
export { CAPTAIN_ROLE } from "./official-bindings.js";
/** Windows executable extensions assumed when PATHEXT is unset. */
const DEFAULT_PATHEXT = '.COM;.EXE;.BAT;.CMD';
/**
 * The file names one declared executable may resolve to on this platform.
 *
 * Windows does not look up a bare name directly: the shell appends each
 * PATHEXT extension, so probing only `join(directory, name)` reports every
 * `*.exe`/`*.cmd` tool as missing. A name that already ends in a known
 * executable extension is checked as written instead of gaining a second one.
 * @param name - the executable name a skill declared.
 * @returns candidate file names, in lookup order.
 */
function executableCandidates(name) {
    if (process.platform !== 'win32')
        return [name];
    const extensions = (process.env['PATHEXT'] ?? DEFAULT_PATHEXT).split(';')
        .map(extension => extension.trim()).filter(extension => extension !== '')
        .map(extension => (extension.startsWith('.') ? extension : `.${extension}`));
    if (extensions.length === 0)
        return [name];
    const lower = name.toLowerCase();
    if (extensions.some(extension => lower.endsWith(extension.toLowerCase())))
        return [name];
    return extensions.map(extension => name + extension);
}
/** Whether one path is a regular file this platform would execute. */
async function isExecutableFile(path) {
    try {
        // A directory passes existence and even X_OK checks; it is not an executable.
        if (!(await stat(path)).isFile())
            return false;
        if (process.platform === 'win32')
            return true;
        await access(path, constants.X_OK);
        return true;
    }
    catch {
        return false;
    }
}
/** Whether one declared executable resolves inside any PATH directory. */
async function executableOnPath(name, directories) {
    const candidates = executableCandidates(name);
    for (const directory of directories) {
        for (const candidate of candidates) {
            if (await isExecutableFile(join(directory, candidate)))
                return true;
        }
    }
    return false;
}
/** Decode the Team and role owning a persisted seed marker. */
function seedOwner(key) {
    try {
        const value = JSON.parse(key);
        if (Array.isArray(value) && value.length === 3) {
            const [teamId, roleId, assetId] = value;
            if (typeof teamId === 'string' && typeof roleId === 'string' && typeof assetId === 'string')
                return [teamId, roleId];
        }
    }
    catch { /* Malformed markers have no live owner. */ }
    return undefined;
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
export function sanctionedCopy(left, right) {
    return (left.origin === 'builtin' && right.origin === 'override' && right.officialSkillId === left.skillId)
        || (right.origin === 'builtin' && left.origin === 'override' && left.officialSkillId === right.skillId);
}
export class TeamSkillManager {
    store;
    bindings = [];
    revision = 0;
    opened = false;
    seeded = new Set();
    pending = Promise.resolve();
    guards;
    /**
     * @param store - the asset store this manager binds assets from.
     * @param root - the same private root the store uses.
     * @param guards - live facts a delete has to consult.
     */
    constructor(store, _root, guards) {
        this.store = store;
        this.guards = guards;
    }
    /** Use the store's pinned physical root, including for bindings writes. */
    get root() { return this.store.root; }
    /** Binding revision, bumped by every assignment change. */
    get bindingRevision() {
        return this.revision;
    }
    /**
     * Read the bindings document.
     *
     * A malformed document refuses the open instead of starting empty: silently
     * dropping every assignment would make each member lose its skills with no
     * explanation.
     * @returns after the table is loaded.
     */
    async open() {
        if (this.opened)
            return;
        try {
            await assertNoSymlinks(join(this.root, 'bindings.json'));
            const raw = await readFile(join(this.root, 'bindings.json'), 'utf8');
            const parsed = JSON.parse(raw);
            if (parsed.version !== BINDINGS_VERSION || !Array.isArray(parsed.bindings)) {
                throw new Error(`the Team Skill bindings at ${this.root} have an unexpected layout; refusing to guess at them`);
            }
            if (parsed.bindings.some(row => typeof row?.teamId !== 'string' || typeof row.roleId !== 'string' || typeof row.assetId !== 'string')
                || (parsed.seeded !== undefined && (!Array.isArray(parsed.seeded) || parsed.seeded.some(key => typeof key !== 'string')))) {
                throw new Error('invalid Team Skill binding records');
            }
            this.bindings = [...parsed.bindings];
            this.seeded = new Set(parsed.seeded ?? []);
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
        this.opened = true;
    }
    /** Every binding, in a stable order. */
    list() {
        return [...this.bindings].sort((left, right) => left.teamId.localeCompare(right.teamId) || left.roleId.localeCompare(right.roleId));
    }
    /**
     * Assign one asset to one role slot.
     * @param input - team, role, and asset.
     * @returns the stored binding or the reason it was refused.
     */
    async assign(input) {
        return this.mutate(() => this.store.withLock(async () => {
            if (this.store.get(input.assetId) === undefined)
                return { ok: false, reason: 'unknown-asset' };
            if (!await this.store.verify(input.assetId))
                return { ok: false, reason: 'asset-missing' };
            const blockers = await this.assignmentBlockers(input.assetId);
            if (blockers.blocking.length > 0)
                return { ok: false, reason: `dependency-missing: ${blockers.blocking.join('; ')}`, unverified: blockers.unverified };
            if (!this.guards.teams().some(team => team.id === input.teamId))
                return { ok: false, reason: 'unknown-team' };
            if (!this.hasRole(input.teamId, input.roleId) || (input.captain === true && input.roleId !== CAPTAIN_ROLE))
                return { ok: false, reason: 'unknown-role' };
            if (this.store.get(input.assetId) === undefined)
                return { ok: false, reason: 'unknown-asset' };
            const binding = {
                teamId: input.teamId, roleId: input.roleId, assetId: input.assetId,
                ...(input.roleId === CAPTAIN_ROLE ? { captain: true } : {}),
            };
            this.bindings = [...this.bindings.filter(row => !(row.teamId === binding.teamId && row.roleId === binding.roleId && row.assetId === binding.assetId)), binding];
            await this.flush();
            return { ok: true, binding, unverified: blockers.unverified };
        }));
    }
    /** Replace only existing bindings to the shipped skill after an explicit switch. */
    async replaceBuiltinBindings(skillId, overrideId) {
        return this.mutate(() => this.store.withLock(async () => {
            const replacement = this.store.get(overrideId);
            if (replacement?.origin !== 'override' || replacement.officialSkillId !== skillId) {
                throw new Error('replacement must be an override of the shipped skill');
            }
            return this.replaceAssetBindingsNow(`builtin:${skillId}`, overrideId);
        }));
    }
    /**
     * Remove the assignment of one role slot.
     * @param teamId - Team identity.
     * @param roleId - role identity, or {@link CAPTAIN_ROLE}.
     * @returns whether a binding was removed.
     */
    async unassign(teamId, roleId, assetId) {
        return this.mutate(async () => {
            const next = this.bindings.filter(row => !(row.teamId === teamId && row.roleId === roleId
                && (assetId === undefined || row.assetId === assetId)));
            if (next.length === this.bindings.length)
                return false;
            this.bindings = next;
            await this.flush();
            return true;
        });
    }
    /**
     * Drop every binding of one Team, used when a Team is deleted.
     * @param teamId - Team identity.
     * @returns the number of removed bindings.
     */
    async unassignTeam(teamId) {
        return this.mutate(async () => {
            const next = this.bindings.filter(row => row.teamId !== teamId);
            const removed = this.bindings.length - next.length;
            if (removed === 0)
                return 0;
            this.bindings = next;
            await this.flush();
            return removed;
        });
    }
    /**
     * Resolve the assets one role receives.
     * @param teamId - Team identity.
     * @param roleId - role identity.
     * @returns the bound assets that still exist.
     */
    assetsFor(teamId, roleId) {
        if (!this.hasRole(teamId, roleId))
            return [];
        return this.bindings
            .filter(row => row.teamId === teamId && row.roleId === roleId)
            .map(row => this.store.get(row.assetId))
            .filter((asset) => asset !== undefined);
    }
    /**
     * Describe the roles currently bound to one asset.
     * @param assetId - asset identity.
     * @returns one row per binding, with the Team and role names for the dialog.
     */
    bindingSummaries(assetId) {
        const teams = this.guards.teams();
        return this.bindings
            .filter(row => row.assetId === assetId)
            .map((row) => {
            const team = teams.find(candidate => candidate.id === row.teamId);
            const member = team?.members.find(candidate => (candidate.id ?? candidate.name) === row.roleId);
            return {
                teamId: row.teamId,
                teamName: team?.name ?? row.teamId,
                roleId: row.roleId,
                roleName: row.captain === true || row.roleId === CAPTAIN_ROLE
                    ? (team?.captain.name ?? CAPTAIN_ROLE)
                    : (member?.name ?? row.roleId),
                captain: row.captain === true || row.roleId === CAPTAIN_ROLE,
            };
        })
            .sort((left, right) => left.teamName.localeCompare(right.teamName) || left.roleName.localeCompare(right.roleName));
    }
    /**
     * Delete one asset, refusing while anything still depends on it.
     *
     * Every blocking reason is collected before refusing, so the dialog can list
     * all of them instead of revealing one per attempt.
     * @param assetId - asset identity.
     * @returns the outcome, with blockers when it was refused.
     */
    async remove(assetId) {
        await this.reconcile();
        return this.mutate(async () => {
            const asset = this.store.get(assetId);
            if (asset === undefined)
                return { ok: true, blockers: [], warnings: [] };
            const warnings = [];
            for (const other of this.store.list()) {
                if (other.id === assetId)
                    continue;
                const mentions = await this.mentionsAsset(other.id, asset.skillId);
                if (mentions.length > 0)
                    warnings.push(`${other.id} (${other.skillId}): ${mentions.join(', ')}`);
            }
            let blockers = this.deleteBlockers(assetId);
            if (blockers.length > 0)
                return { ok: false, blockers, warnings };
            const refused = new Error('Team Skill acquired a reference while deletion was pending');
            try {
                await this.store.remove(assetId, () => {
                    blockers = this.deleteBlockers(assetId);
                    if (blockers.length > 0)
                        throw refused;
                });
            }
            catch (error) {
                if (error === refused)
                    return { ok: false, blockers, warnings };
                throw error;
            }
            return { ok: true, blockers: [], warnings };
        });
    }
    deleteBlockers(assetId) {
        const blockers = [];
        if (this.store.get(assetId)?.origin === 'builtin')
            blockers.push({ kind: 'official' });
        const bindings = this.bindingSummaries(assetId);
        if (bindings.length > 0)
            blockers.push({ kind: 'binding', bindings });
        const sessions = this.guards.activeSessions(assetId);
        if (sessions.length > 0 || this.guards.activeAssetIds().has(assetId))
            blockers.push({ kind: 'active', sessions: sessions.length > 0 ? sessions : [assetId] });
        const dependents = this.store.list().filter(asset => asset.id !== assetId && asset.dependencies.otherSkills.includes(assetId)).map(asset => asset.id);
        if (dependents.length > 0)
            blockers.push({ kind: 'dependency', dependents });
        return blockers;
    }
    hasRole(teamId, roleId) {
        const team = this.guards.teams().find(team => team.id === teamId);
        return team !== undefined && (roleId === CAPTAIN_ROLE || team.members.some(member => (member.id ?? member.name) === roleId));
    }
    async reconcile() {
        return this.mutate(() => this.reconcileNow());
    }
    async reconcileNow() {
        const before = JSON.stringify([this.bindings, [...this.seeded]]);
        const teams = this.guards.teams();
        this.bindings = this.bindings.filter(row => this.hasRole(row.teamId, row.roleId) && this.store.get(row.assetId) !== undefined);
        // A seed records an explicit unbind only while its role still exists.
        // Removing and restoring a Team or role starts a fresh default assignment.
        this.seeded = new Set([...this.seeded].filter(key => {
            const owner = seedOwner(key);
            return owner !== undefined && this.hasRole(owner[0], owner[1]);
        }));
        for (const team of teams) {
            for (const declaration of officialSkillDefaults(team).declarations) {
                const target = officialSkillTarget(team, declaration);
                if (target.status !== 'valid')
                    continue;
                const { roleId, assetId } = target;
                // The marker follows the declaration across changes to local copies.
                const key = JSON.stringify([team.id, roleId, assetId]);
                const holdsSkill = this.bindings.some(row => {
                    if (row.teamId !== team.id || row.roleId !== roleId)
                        return false;
                    const asset = this.store.get(row.assetId);
                    return asset !== undefined && (isOfficialSkillAsset(asset, assetId)
                        || isOfficialSkillOverride(asset, declaration.skillId));
                });
                if (holdsSkill) {
                    this.seeded.add(key);
                    continue;
                }
                const shipped = this.store.get(assetId);
                if (shipped === undefined || !isOfficialSkillAsset(shipped, assetId))
                    continue;
                // The marker means "this default was offered and the user removed it",
                // so re-adding would resurrect an explicit unbind. The paths that DO
                // return a missing default -- deleting the copy, restoring it -- clear
                // the marker themselves before reconciling.
                if (this.seeded.has(key))
                    continue;
                this.seeded.add(key);
                this.bindings.push({ teamId: team.id, roleId, assetId, ...(roleId === CAPTAIN_ROLE ? { captain: true } : {}) });
            }
        }
        if (JSON.stringify([this.bindings, [...this.seeded]]) !== before)
            await this.flush();
    }
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
    async replaceAssetBindings(fromAssetId, toAssetId) {
        return this.mutate(() => this.replaceAssetBindingsNow(fromAssetId, toAssetId));
    }
    async replaceAssetBindingsNow(fromAssetId, toAssetId) {
        if (fromAssetId === toAssetId || this.store.get(toAssetId) === undefined)
            return 0;
        const moved = this.bindings.filter(row => row.assetId === fromAssetId).length;
        if (moved === 0)
            return 0;
        const seen = new Set();
        this.bindings = this.bindings.flatMap((binding) => {
            const row = binding.assetId === fromAssetId ? { ...binding, assetId: toAssetId } : binding;
            if (row.assetId !== toAssetId)
                return [row];
            const key = JSON.stringify([row.teamId, row.roleId]);
            if (seen.has(key))
                return [];
            seen.add(key);
            return [row];
        });
        await this.flush();
        return moved;
    }
    mutate(operation) {
        const result = this.pending.then(async () => {
            const bindings = [...this.bindings];
            const seeded = new Set(this.seeded);
            const revision = this.revision;
            try {
                return await operation();
            }
            catch (error) {
                this.bindings = bindings;
                this.seeded = seeded;
                this.revision = revision;
                throw error;
            }
        });
        this.pending = result.catch(() => { });
        return result;
    }
    /**
     * Find text mentions of one skill name inside another asset.
     * @param assetId - asset whose files are scanned.
     * @param skillId - the name to look for.
     * @returns the matching relative paths.
     */
    async mentionsAsset(assetId, skillId) {
        const asset = this.store.get(assetId);
        if (asset === undefined)
            return [];
        const hits = [];
        for (const file of asset.files) {
            if (!file.text)
                continue;
            try {
                const text = await this.store.readText(assetId, file.path);
                if (text.includes(skillId))
                    hits.push(file.path);
            }
            catch {
                // A file that cannot be read is not evidence of a mention.
            }
        }
        return hits;
    }
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
    async dependencyReport(assetId) {
        const asset = this.store.get(assetId);
        if (asset === undefined)
            return { executables: [], mcpServers: [], mcpDeclarations: [], unverified: [], otherSkills: [] };
        const directories = (process.env['PATH'] ?? '').split(delimiter).filter(entry => entry !== '');
        const executables = [];
        for (const name of asset.dependencies.executables) {
            executables.push({ name, found: await executableOnPath(name, directories) });
        }
        return {
            executables,
            mcpServers: asset.dependencies.mcpServers.map(server => server.serverName),
            mcpDeclarations: asset.dependencies.mcpServers,
            unverified: asset.dependencies.mcpServers.filter(server => server.required).map(server => server.serverName),
            otherSkills: asset.dependencies.otherSkills.map(id => ({ id, found: this.store.get(id) !== undefined })),
        };
    }
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
    async assignmentBlockers(assetId) {
        const asset = this.store.get(assetId);
        if (asset === undefined)
            return { blocking: [`No Team Skill with id "${assetId}" is installed.`], unverified: [] };
        const report = await this.dependencyReport(assetId);
        const blocking = report.executables
            .filter(row => !row.found)
            .map(row => `the executable "${row.name}" is not on PATH`);
        for (const dependency of asset.dependencies.otherSkills) {
            if (this.store.get(dependency) === undefined)
                blocking.push(`the Team Skill "${dependency}" is not installed`);
        }
        const unverified = (asset.dependencies.mcpServers ?? [])
            .filter(server => server.required)
            .map(server => server.serverName);
        return { blocking, unverified };
    }
    /**
     * Whether an asset is currently referenced by any role.
     * @param assetId - asset identity.
     * @returns whether at least one binding points at it.
     */
    isBound(assetId) {
        return this.bindings.some(row => row.assetId === assetId);
    }
    /**
     * Delete one Team's bindings and its asset-independent bookkeeping.
     * @param teamId - Team identity.
     * @returns the number of removed bindings.
     */
    async forgetTeam(teamId) {
        return this.mutate(async () => {
            const next = this.bindings.filter(row => row.teamId !== teamId);
            const removed = this.bindings.length - next.length;
            const seeded = new Set([...this.seeded].filter(key => seedOwner(key)?.[0] !== teamId));
            if (removed === 0 && seeded.size === this.seeded.size)
                return 0;
            this.bindings = next;
            this.seeded = seeded;
            await this.flush();
            return removed;
        });
    }
    /**
     * Reset default skill binding seeds for the given teams (or all built-in teams)
     * and reconcile to restore the official default bindings.
     * @param teamIds - optional list of team identities to restore; defaults to all built-in teams.
     */
    async restoreBuiltinBindings(teamIds) {
        return this.mutate(async () => {
            // "Restore these Teams" with nothing named means all of them: the page
            // calls this without arguments, and a remote call can deliver that absence
            // as `[]`, `null` or an empty object. Treating any of those as a filter is
            // what made the whole restore a silent no-op that still answered 200, so
            // only a real, non-empty array narrows the set.
            const requested = Array.isArray(teamIds) ? teamIds : [];
            const targets = new Set(requested.length === 0 ? BUILTIN_TEAM_IDS : requested);
            this.seeded = new Set([...this.seeded].filter(key => {
                const owner = seedOwner(key);
                return owner === undefined || !targets.has(owner[0]);
            }));
            // "Restore built-in presets" restores the shipped defaults, which are the
            // shipped skills. A role still reading an override of a declared skill is
            // returned to the shipped copy, or the restore would leave the visible
            // binding on the user's own asset and look like it did nothing.
            this.bindings = this.bindings.map((row) => {
                if (!targets.has(row.teamId))
                    return row;
                const asset = this.store.get(row.assetId);
                if (asset?.origin !== 'override' || asset.officialSkillId === undefined)
                    return row;
                const builtinId = `builtin:${asset.officialSkillId}`;
                return this.store.get(builtinId) === undefined ? row : { ...row, assetId: builtinId };
            });
            await this.reconcileNow();
            // `reconcileNow` flushes only when IT changed something. The conversion
            // above already mutated the list, so its own before/after reads as "no
            // change" and nothing would reach the disk: the restore appeared to do
            // nothing, and the next restart brought the old bindings back.
            await this.flush();
        });
    }
    /**
     * Persist the bindings document atomically enough for a UI write.
     * @returns after the document is on disk.
     */
    async flush() {
        const document = { version: BINDINGS_VERSION, bindings: this.list(), seeded: [...this.seeded].sort() };
        await atomicWriteJson(join(this.root, 'bindings.json'), document);
        this.revision += 1;
    }
}
