/**
 * The Team Skill subsystem as one object the plugin lifecycle drives.
 *
 * This module is the seam between the plugin and the store/manager/provider
 * trio: it resolves the private root, loads the shipped skills, and answers the
 * two lifecycle questions the runtime asks — "what does this role get?" and
 * "this Agent is gone, release it".
 *
 * The private root is resolved from the Harness home the deployment itself uses
 * (`$DSH_HOME`, else `~/.dsh`) under a plugin-owned directory. v0.2.1-rc.2
 * publishes no per-plugin data-directory API, so this is a documented
 * derivation rather than a guess about a global skill directory: it is never a
 * user or project skill folder, it is never scanned by the host's own skill
 * providers, and an explicit `skillRoot` config value always wins.
 * @module dsh-agent-team-presets/team-skills
 */
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir } from 'node:fs/promises';
import { TeamSkillManager, CAPTAIN_ROLE } from "./manager.js";
import { TeamSkillRuntime } from "./provider.js";
import { TeamSkillStore } from "./store.js";
import { memberTargets } from "../presets.js";
/** The skills the package ships under `assets/skills`. */
export const OFFICIAL_SKILL_IDS = [
    'github-repository-presentation',
    'git-release-hygiene',
    'grilling',
    'research',
];
/** Version stamped on the shipped assets; bumped when the packaged copies change. */
export const OFFICIAL_SKILL_VERSION = '1';
/**
 * Resolve the private Team Skill root.
 * @param configured - an explicit `skillRoot` from the plugin config, when set.
 * @returns the absolute root directory.
 */
export function resolveSkillRoot(configured) {
    // A hand-written Config (a test double, an older embedding) may predate the
    // field; deriving the default is always correct, so it is not an error.
    if (configured !== undefined && configured.trim() !== '')
        return configured;
    const home = process.env['DSH_HOME'] !== undefined && process.env['DSH_HOME'] !== ''
        ? process.env['DSH_HOME']
        : join(homedir(), '.dsh');
    return join(home, 'agent-team-presets', 'team-skills');
}
/**
 * Locate the shipped skill documents inside this package.
 * @returns the absolute `assets/skills` directory.
 */
export function officialSkillDirectory() {
    // Built output lives in `lib/`, one level below the package root.
    return join(dirname(dirname(fileURLToPath(import.meta.url))), 'assets', 'skills');
}
/**
 * Resolve the role identity one live member belongs to.
 *
 * The member's own durable snapshot names the role, and the roster gives the
 * teammate target; a role without a stored identity falls back to its display
 * name, which is how shipped presets identify their members.
 * @param team - the Team the member belongs to.
 * @param memberTarget - the target the captain summoned it under.
 * @returns the role identity, or undefined when the target matches no member.
 */
export function roleOfMember(team, memberTarget) {
    const row = memberTargets(team).find(candidate => candidate.target === memberTarget);
    if (row === undefined)
        return undefined;
    return row.member.id ?? row.member.name;
}
/** The Team Skill subsystem, ready for the runtime to drive. */
export class TeamSkills {
    root;
    store;
    /** The binding table and its delete guards. */
    manager;
    /** The per-Agent provider lifecycle. */
    runtime;
    /** Shipped skill ids this deployment actually provides. */
    official = [];
    /** Retain a degraded-start reason for both GUI and tool callers. */
    issue;
    opened = false;
    /** The store's one startup pass, shared by every caller that awaits readiness. */
    readiness;
    syncGeneration = new WeakMap();
    closed = false;
    log;
    /**
     * @param ctx - the plugin context.
     * @param root - absolute private root directory.
     * @param teams - reads the Teams the page currently shows.
     * @param log - diagnostic sink.
     */
    constructor(ctx, root, teams, log) {
        this.root = root;
        this.log = log;
        this.store = new TeamSkillStore(root);
        this.runtime = new TeamSkillRuntime(ctx, this.store, log);
        this.manager = new TeamSkillManager(this.store, root, {
            teams,
            activeAssetIds: () => this.runtime.activeAssetIds(),
            // The Agent that owns the registration is the only identity this layer can
            // name truthfully; it is what the delete refusal lists.
            activeSessions: assetId => this.runtime.activeLabels(assetId),
        });
    }
    /**
     * Load the registry, the bindings, and the shipped skills.
     *
     * Every failure is reported rather than thrown: a deployment whose store
     * cannot open must still serve its Teams.
     * @param log - diagnostic sink for a degraded start.
     * @returns whether the subsystem is usable.
     */
    async open(log) {
        // One open per instance: an assignment that arrives while the store is
        // still loading awaits this same promise instead of seeing `opened === false`
        // and reporting an empty catalog.
        this.readiness ??= this.start(log);
        return await this.readiness;
    }
    /** The store's one startup pass, awaited by every caller that needs an answer. */
    async start(log) {
        try {
            await this.store.open();
            await this.manager.open();
            const directory = officialSkillDirectory();
            const entries = [];
            for (const skillId of OFFICIAL_SKILL_IDS) {
                // A package built without the shipped skills is a valid deployment: the
                // Teams work, only the official skills are absent.
                try {
                    await readdir(join(directory, skillId));
                    entries.push({ skillId, directory: join(directory, skillId), version: OFFICIAL_SKILL_VERSION });
                }
                catch {
                    log(`the shipped skill "${skillId}" is not present in this installation`);
                }
            }
            this.official = entries.map(entry => entry.skillId);
            const warnings = [];
            const changed = await this.store.ensureOfficial(entries, warnings);
            for (const warning of warnings)
                log(warning);
            if (changed.length > 0)
                log(`Team Skill store updated: ${changed.join(', ')}`);
            await this.manager.reconcile();
            this.opened = true;
            this.issue = undefined;
            return true;
        }
        catch (error) {
            this.issue = `Team Skills are unavailable in this deployment: ${String(error)}`;
            log(this.issue);
            return false;
        }
    }
    /**
     * Wait until this subsystem's store has been opened once.
     *
     * A caller that must publish a registration before an Agent's next request
     * awaits this first, so `syncAgent` itself becomes a microtask instead of a
     * disk read at the moment the surface is installed.
     * @returns whether the store is usable.
     */
    async whenOpened() {
        return await this.open(message => this.log(message));
    }
    /**
     * Resolve the assets one role receives.
     * @param role - Team and role identity.
     * @returns the bound assets that still exist.
     */
    assetsForRole(role) {
        return this.manager.assetsFor(role.teamId, role.roleId);
    }
    /**
     * Install one Agent's assignment, resolving once an answer exists.
     *
     * The answer matters at a creation edge: the Host reads the model-facing
     * catalog from a step boundary, so a member whose assignment was not published
     * spends its whole first turn believing nothing was assigned. This method
     * therefore reports `installed`, `none`, `deferred` or `failed` instead of
     * resolving silently, and it never waits for a skill service that this
     * deployment does not compose.
     *
     * Calls for one Agent are serialized: a newer intent supersedes an older one
     * through the generation counter, so the reconcile follow-up cannot install a
     * stale asset set after a newer assignment already landed.
     * @param agent - the Agent whose visible skills change.
     * @param role - the assignment, or undefined to release the registration.
     * @returns the registration outcome, plus the assets it was asked to publish.
     */
    async syncAgent(agent, role, options = {}) {
        if (this.closed)
            return { agent, outcome: { status: 'none' }, assigned: 0 };
        // Await the store instead of answering from a half-initialized index: a
        // member created during startup would otherwise be told it has no skills.
        // The store is opened once, at activation. When that has already happened
        // this call performs its registration in the same synchronous turn, which
        // is what lets the captain path publish a catalog without awaiting a disk
        // read mid-application.
        if (!this.opened)
            await this.open(message => this.log(message));
        if (options.signal?.aborted === true)
            return { agent, outcome: { status: 'none' }, assigned: 0 };
        if (this.closed)
            return { agent, outcome: { status: 'none' }, assigned: 0 };
        const assets = role === undefined ? [] : this.assetsForRole(role);
        if (!this.opened) {
            // The bindings themselves are unreadable, so nothing about this role can be
            // proven: `assigned` stays undefined and the caller must fail closed. An
            // unreadable library is never reported as "this role holds nothing".
            const reason = this.issue ?? 'the Team Skill store could not be opened';
            return { agent, outcome: { status: 'failed', reason }, assigned: undefined };
        }
        const generation = (this.syncGeneration.get(agent) ?? 0) + 1;
        this.syncGeneration.set(agent, generation);
        const outcome = await this.runtime.sync({ agent, assets }, options.signal === undefined ? {} : { signal: options.signal });
        void this.manager.reconcile().then(async () => {
            if (this.closed || this.syncGeneration.get(agent) !== generation)
                return;
            const settled = role === undefined || !this.manager.hasRole(role.teamId, role.roleId) ? [] : this.assetsForRole(role);
            const followUp = await this.runtime.sync({ agent, assets: settled });
            if (followUp.status === 'deferred' || followUp.status === 'failed') {
                this.log(`Team Skill registration for Agent "${String(agent.id ?? '?')}" `
                    + `did not settle: ${followUp.reason ?? followUp.status}`);
            }
        }).catch(error => this.log(`Team Skill reconciliation failed: ${String(error)}`));
        if (outcome.status === 'deferred' || outcome.status === 'failed') {
            this.log(`Team Skill assignment for Agent "${String(agent.id ?? '?')}" `
                + `is not visible: ${outcome.reason ?? outcome.status}`);
        }
        return { agent, outcome, assigned: assets.length };
    }
    /**
     * Release one Agent's registration.
     * @param agent - the disposed Agent.
     */
    releaseAgent(agent) {
        this.syncGeneration.set(agent, (this.syncGeneration.get(agent) ?? 0) + 1);
        this.runtime.release(agent);
    }
    /**
     * Re-apply every assignment after the bindings changed.
     * @param registered - every live Agent and the role it fills.
     */
    resync(registered) {
        for (const row of registered) {
            void this.syncAgent(row.agent, row.role).catch(error => this.log(`Team Skill resync failed: ${String(error)}`));
        }
    }
    /** Release the whole subsystem. */
    async close() {
        this.closed = true;
        await this.runtime.dispose();
    }
}
export { CAPTAIN_ROLE };
