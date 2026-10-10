/**
 * Apply one Team preset to one live Session.
 *
 * The captain's system prompt shadows the deployment persona for that Session,
 * the captain's independent tool mode scopes the Session's visible global tools,
 * and the Session gains `spawn_team_member`, which applies the selected member's
 * own persona, route, reasoning effort, and tool mode. The Session keeps the
 * model it already selected: a captain never changes the Session's route. A
 * member's persona and tool mode belong to the definition the Team task started
 * with; its route does not, so a corrected route reaches the next member the
 * task summons.
 * @module dsh-agent-team-presets/application
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { SessionId } from '@deepseek-ai/dsh-session';
import type { TeamPreset } from './types.ts';
/** One applied Team preset, owned until the Session's Team changes. */
export interface TeamApplication {
    /** Identity of the applied Team preset. */
    readonly teamId: string;
    /** Fingerprint of the applied definition, so an unchanged one is not re-applied. */
    readonly fingerprint: string;
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
    /** Provider used for a fresh member. */
    readonly fresh: string;
    /** Provider used for a member forked from the captain's completed turns. */
    readonly fork: string;
}
/**
 * Reject a Team this Session cannot apply, before any registration is touched.
 *
 * `tools.restrict` owns the authority on which global names an allow-list may
 * carry, and the probe applies and lifts it so the real application still
 * registers exactly one restriction. Every other registration a Team needs —
 * the two prompt sections and the member tool — uses names and orders fixed by
 * this plugin, so a captain allow-list naming an unknown tool is the failure an
 * adoption can actually hit. Callers check before releasing a running
 * application, so a refused preset never leaves a Session without one.
 * @param agent - the live Session agent about to take the Team.
 * @param team - the Team preset about to be applied.
 * @throws when the captain's custom allow-list names a tool this Session cannot restrict.
 */
export declare function assertTeamApplicable(agent: Agent, team: TeamPreset): void;
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
 * @returns the applied Team, whose `dispose` releases every registration.
 */
export declare function applyTeamToAgent(ctx: Context, agent: Agent, team: TeamPreset, providers: MemberProviders, stored?: StoredTeam): TeamApplication;
/** Session identity helper kept with the application so both call sites brand identically. */
export type AppliedSessionId = SessionId;
//# sourceMappingURL=application.d.ts.map