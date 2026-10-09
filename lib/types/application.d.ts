/**
 * Apply one Team preset to one live Session.
 *
 * The captain's system prompt shadows the deployment persona for that Session,
 * the captain's independent tool mode scopes the Session's visible global tools,
 * and the Session gains `spawn_team_member`, which applies the selected member's
 * own persona, route, reasoning effort, and tool mode. The Session keeps the
 * model it already selected: a captain never changes the Session's route.
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
    /** JSON of the applied preset, so an unchanged Team is not re-applied. */
    readonly fingerprint: string;
    /** Release every registration and restore the Session's own composition. */
    dispose(): void;
}
/** Continuable-subagent providers the member tool spawns through. */
export interface MemberProviders {
    /** Provider used for a fresh member. */
    readonly fresh: string;
    /** Provider used for a member forked from the captain's completed turns. */
    readonly fork: string;
}
/**
 * Apply one Team preset to one live Session.
 *
 * A later call for the same Session replaces the previous application.
 * @param ctx - the plugin context providing the Team and Session services.
 * @param agent - the live Session agent taking the Team.
 * @param team - the Team preset to apply.
 * @param providers - continuable-subagent providers the member tool spawns through.
 * @returns the applied Team, whose `dispose` releases every registration.
 */
export declare function applyTeamToAgent(ctx: Context, agent: Agent, team: TeamPreset, providers: MemberProviders): TeamApplication;
/** Session identity helper kept with the application so both call sites brand identically. */
export type AppliedSessionId = SessionId;
//# sourceMappingURL=application.d.ts.map