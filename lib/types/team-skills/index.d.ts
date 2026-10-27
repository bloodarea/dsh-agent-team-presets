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
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TeamSkillManager, CAPTAIN_ROLE } from './manager.ts';
import { TeamSkillRuntime } from './provider.ts';
import type { SkillSyncResult } from './provider.ts';
import { TeamSkillStore } from './store.ts';
import type { TeamSkillAsset, TeamPreset } from '../types.ts';
/**
 * What one {@link TeamSkills.syncAgent} call produced.
 *
 * `assigned` is the number of assets the role holds in the library. A caller at
 * a creation edge uses both fields together: assignments that exist but could
 * not be published (`deferred`, `failed`) must be refused rather than run as a
 * member that silently sees nothing.
 */
export interface AgentSkillSync {
    /** The Agent whose assignment was applied. */
    readonly agent: Agent;
    /** What its registration is now. */
    readonly outcome: SkillSyncResult;
    /**
     * How many assets this role is assigned, or `undefined` when the bindings
     * themselves could not be read.
     *
     * The distinction is load-bearing: `0` is a positive fact ("this role holds
     * nothing, so there is nothing to publish"), while `undefined` means this
     * activation cannot know. A creation edge must refuse the unknown case rather
     * than mistake an unreadable library for an empty assignment.
     */
    readonly assigned: number | undefined;
}
/** The skills the package ships under `assets/skills`. */
export declare const OFFICIAL_SKILL_IDS: readonly ["github-repository-presentation", "git-release-hygiene", "grilling", "research"];
/** Version stamped on the shipped assets; bumped when the packaged copies change. */
export declare const OFFICIAL_SKILL_VERSION = "1";
/**
 * Resolve the private Team Skill root.
 * @param configured - an explicit `skillRoot` from the plugin config, when set.
 * @returns the absolute root directory.
 */
export declare function resolveSkillRoot(configured: string | undefined): string;
/**
 * Locate the shipped skill documents inside this package.
 * @returns the absolute `assets/skills` directory.
 */
export declare function officialSkillDirectory(): string;
/** What the plugin runtime needs to know about one Team role. */
export interface TeamSkillRole {
    /** Team identity the role belongs to. */
    readonly teamId: string;
    /** Role identity, or {@link CAPTAIN_ROLE}. */
    readonly roleId: string;
    /** Whether this is the captain slot. */
    readonly captain: boolean;
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
export declare function roleOfMember(team: TeamPreset, memberTarget: string): string | undefined;
/** The Team Skill subsystem, ready for the runtime to drive. */
export declare class TeamSkills {
    readonly root: string;
    readonly store: TeamSkillStore;
    /** The binding table and its delete guards. */
    readonly manager: TeamSkillManager;
    /** The per-Agent provider lifecycle. */
    readonly runtime: TeamSkillRuntime;
    /** Shipped skill ids this deployment actually provides. */
    official: readonly string[];
    /** Retain a degraded-start reason for both GUI and tool callers. */
    issue: string | undefined;
    private opened;
    /** The store's one startup pass, shared by every caller that awaits readiness. */
    private readiness;
    private readonly syncGeneration;
    private closed;
    private readonly log;
    /**
     * @param ctx - the plugin context.
     * @param root - absolute private root directory.
     * @param teams - reads the Teams the page currently shows.
     * @param log - diagnostic sink.
     */
    constructor(ctx: Context, root: string, teams: () => readonly TeamPreset[], log: (message: string) => void);
    /**
     * Load the registry, the bindings, and the shipped skills.
     *
     * Every failure is reported rather than thrown: a deployment whose store
     * cannot open must still serve its Teams.
     * @param log - diagnostic sink for a degraded start.
     * @returns whether the subsystem is usable.
     */
    open(log: (message: string) => void): Promise<boolean>;
    /** The store's one startup pass, awaited by every caller that needs an answer. */
    private start;
    /**
     * Wait until this subsystem's store has been opened once.
     *
     * A caller that must publish a registration before an Agent's next request
     * awaits this first, so `syncAgent` itself becomes a microtask instead of a
     * disk read at the moment the surface is installed.
     * @returns whether the store is usable.
     */
    whenOpened(): Promise<boolean>;
    /**
     * Resolve the assets one role receives.
     * @param role - Team and role identity.
     * @returns the bound assets that still exist.
     */
    assetsForRole(role: TeamSkillRole): TeamSkillAsset[];
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
    syncAgent(agent: Agent, role: TeamSkillRole | undefined, options?: {
        readonly signal?: AbortSignal;
    }): Promise<AgentSkillSync>;
    /**
     * Release one Agent's registration.
     * @param agent - the disposed Agent.
     */
    releaseAgent(agent: Agent): void;
    /**
     * Re-apply every assignment after the bindings changed.
     * @param registered - every live Agent and the role it fills.
     */
    resync(registered: readonly {
        agent: Agent;
        role: TeamSkillRole | undefined;
    }[]): void;
    /** Release the whole subsystem. */
    close(): Promise<void>;
}
export { CAPTAIN_ROLE };
