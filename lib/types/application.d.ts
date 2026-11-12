/**
 * Apply one Team preset to one live Session.
 *
 * A captain-led Session takes the captain's system prompt as its persona, the
 * captain's independent tool mode as its tool scope, and gains
 * `spawn_team_member`, which applies the selected member's own persona, route,
 * reasoning effort, and tool mode. Such a Session keeps the model it already
 * selected: a captain never changes the Session's route. A member's persona and
 * tool mode belong to the definition the Team task started with; its route does
 * not, so a corrected route reaches the next member the task summons.
 *
 * A Session can also talk to ONE member directly. That application installs the
 * member's role card as the deployment persona, the member's own tool policy,
 * and no captain briefing and no member tool: the Session is the member, not a
 * Team Lead. Selecting that member's model route is a separate Host step, so
 * this module never changes any Session model by itself.
 * @module dsh-agent-team-presets/application
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm';
import { SessionId } from '@deepseek-ai/dsh-session';
import type { ConfiguredMemberRoute } from './presets.ts';
import type { TeamAgentPreset, TeamCaptainPreset, TeamPreset } from './types.ts';
import type { MemberRuntime } from './member-runtime.ts';
/** One applied Team preset, owned until the Session's Team changes. */
export interface TeamApplication {
    /** Identity of the applied Team preset. */
    readonly teamId: string;
    /**
     * Stable identity of the member this Session runs as, or undefined when the
     * Team's captain leads it. Two applications of one Team differ when this
     * differs, so the Host compares it with the stored selection as well as the
     * definition fingerprint.
     */
    readonly roleId?: string;
    /** Fingerprint of the applied definition, so an unchanged one is not re-applied. */
    readonly fingerprint: string;
    /**
     * The member route this application installed as the Session model, when it
     * runs as a member. A stored route change is a different application, so the
     * Host compares it with the selection as well as the definition fingerprint.
     */
    readonly route?: ConfiguredMemberRoute;
    /** Disclosure of the tool presentation this Session effectively runs with, when it was overridden. */
    readonly presentationNote?: string;
    /** Release every registration and restore the Session's own composition. */
    dispose(): void;
}
/**
 * Read the latest stored definition of the Team a Session has applied.
 *
 * A running task keeps the definition it started with, but reads the fields it
 * does not freeze — a member's route — from here at spawn time, so a corrected
 * route reaches the next member that task summons.
 */
export type StoredTeam = () => TeamPreset | undefined;
/** Continuable-subagent providers the member tool spawns through. */
export interface MemberProviders {
    /** Provider alias a fresh member is created through. */
    readonly fresh: string;
    /** Provider alias a member forked from the captain's completed turns is created through. */
    readonly fork: string;
    /** Why a fresh member cannot be created in this deployment, when its alias is unusable. */
    readonly freshError?: string | undefined;
    /** Why a forked member cannot be created in this deployment, when its alias is unusable. */
    readonly forkError?: string | undefined;
}
/**
 * Which configured role one Session runs as.
 *
 * `captain` is the original Team application: the captain leads, may summon
 * members, and never changes the Session's model. `member` is individual chat:
 * that member's role card and tool policy are installed instead, and the Host
 * selects the member's configured route separately.
 */
export type TeamApplicationTarget = {
    readonly kind: 'captain';
} | {
    /** The configured member slot the Session runs as. */
    readonly kind: 'member';
    /** The member slot, resolved from the Team definition being applied. */
    readonly member: TeamAgentPreset;
    /** Stable role identity of that member. */
    readonly roleId: string;
};
/** Host-side facts one Team application needs beyond the preset itself. */
export interface TeamApplicationOptions {
    /** Which role the Session runs as; defaults to the captain. */
    readonly target?: TeamApplicationTarget;
    /**
     * The deployment persona text an active complete preset supplied, kept
     * visible beside this Team's briefing when the captain states no prompt.
     */
    readonly personaFallback?: string;
    /**
     * The native tool presentation a prepared caller established.
     *
     * A custom policy needs a native surface, and an Agent scope accepts exactly
     * one presentation declaration: the prepared caller owns this install and its
     * verification, so the guard must not declare a second one. The install is
     * part of the application's rollback region.
     */
    readonly presentation?: {
        /**
         * Disclosure of the effective presentation, when applying the Team actually
         * overrode the Agent preset's own declaration.
         */
        readonly disclosure?: string | undefined;
        /** Declare the presentation and return the disposer that releases it. */
        readonly install: () => () => void;
    };
}
/** Child Agent options resolved from one configured slot. */
interface RouteOptions {
    /** LLM provider route id. */
    readonly provider: string;
    /** Provider-owned model id. */
    readonly model: string;
    /** Adapter-owned reasoning effort, when the slot configured one. */
    readonly reasoningEffort?: ReturnType<typeof ReasoningEffortId>;
}
/**
 * Build the route one configured member runs on.
 *
 * Shared with the Host so the Session model it selects and the route a summoned
 * child receives are derived by the same rule: both route ids must be non-empty,
 * and an empty reasoning effort keeps the adapter default.
 * @param preset - the configured member.
 * @returns the route, or undefined when the member inherits the Session route.
 */
export declare function memberRouteOptions(preset: TeamAgentPreset): RouteOptions | undefined;
/**
 * Reject one slot this Session cannot apply, before any registration is touched.
 *
 * `tools.restrict` owns the authority on which global names an allow-list may
 * carry, and the probe applies and lifts it so the real application still
 * registers exactly one restriction. Every other registration a slot needs
 * uses names and orders fixed by this plugin, so an allow-list naming an
 * unknown tool is the failure an adoption can actually hit. Callers check
 * before releasing a running application, so a refused preset never leaves a
 * Session without one.
 * @param agent - the live Session agent about to take the Team.
 * @param team - the Team preset about to be applied.
 * @param slot - the captain or member whose policy is validated.
 * @throws when the slot's custom allow-list names a tool this Session cannot restrict.
 */
export declare function assertSlotApplicable(agent: Agent, team: TeamPreset, slot: TeamAgentPreset | TeamCaptainPreset): void;
/**
 * Reject a captain-led Team this Session cannot apply.
 * @param agent - the live Session agent about to take the Team.
 * @param team - the Team preset about to be applied.
 * @throws when the captain's custom allow-list names a tool this Session cannot restrict.
 */
export declare function assertTeamApplicable(agent: Agent, team: TeamPreset): void;
/**
 * Reject a Team whose allow-list names a capability this Session does not have.
 *
 * The settings catalog is the union of every standing Agent preset's tools, not
 * what one Session can actually call: a `minimal` Session composes no file
 * tools, so an allow-list naming one cannot be honoured. It is refused with the
 * missing names instead of being widened to the default-all policy or silently
 * trimmed, and the tool is never added just because the catalog lists it.
 * @param agent - the live Session agent about to take the Team.
 * @param team - the Team preset about to be applied.
 * @param target - the role being applied; a solo member validates only its own
 *   slot, because no captain or sibling is installed into that Session.
 * @returns the refusal text, or undefined when every named capability is reachable.
 */
export declare function capabilityRefusal(agent: Agent, team: TeamPreset, target?: TeamApplicationTarget): string | undefined;
/**
 * One roster line this refusal can act on.
 *
 * The roster is the only place that knows whether an occupied slot belongs to a
 * member that still runs, or to a creation that never became usable. Without that
 * split the captain cannot tell a busy Team from one that will never summon again.
 */
export interface SpawnRosterEntry {
    readonly name: string;
    readonly status: string;
}
/**
 * Explain one failed creation in terms the captain can act on.
 *
 * The two limits are different: an activity slot frees itself when a member
 * finishes, while a used-up Team allowance never comes back. The official text
 * is always preserved verbatim inside the explanation, because it carries the
 * exact numbers the Host decided with.
 * @param error - the failure `startActivation` reported.
 * @param roster - current roster rows, used to name the slots that never became usable.
 * @returns the model-facing explanation.
 */
export declare function classifySpawnFailure(error: unknown, roster?: readonly SpawnRosterEntry[]): string;
/**
 * Apply one Team preset to one live Session.
 *
 * A later call for the same Session replaces the previous application.
 * @param ctx - the plugin context providing the Team and Session services.
 * @param agent - the live Session agent taking the Team.
 * @param team - the Team preset to apply.
 * @param providers - continuable-subagent providers the member tool spawns through.
 * @param stored - reads the latest stored definition of this Team, so a member
 *   spawned later runs on its current route; defaults to the applied definition.
 * @param members - the durable member runtime that freezes each summoned
 *   member's configuration before creation; without one the member tool refuses
 *   rather than creating a member nothing could re-scope.
 * @param options - the role to run as (captain by default), the deployment
 *   persona fallback, and the prepared presentation a strict policy needs.
 * @returns the applied Team (and member role, when one was installed), whose
 *   `dispose` releases every registration.
 */
export declare function applyTeamToAgent(ctx: Context, agent: Agent, team: TeamPreset, providers: MemberProviders, stored?: StoredTeam, members?: MemberRuntime, options?: TeamApplicationOptions): TeamApplication;
/** Session identity helper kept with the application so both call sites brand identically. */
export type AppliedSessionId = SessionId;
export {};
