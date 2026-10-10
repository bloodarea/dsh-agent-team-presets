/**
 * Live Team execution state for the settings page.
 *
 * A saved Team change reaches an idle Session right away and a Session whose
 * Team task is running only before its next Team task, so the page can promise
 * nothing until it knows which Teams are executing. This monitor answers that
 * from the same facts the freezer uses — the captain's status and the roster's
 * teammate phases — and publishes whole-set frames, never a delta, so a
 * consumer that missed a frame is still correct after the next one.
 *
 * The frame carries identities and counts only: no persona, session name, or
 * session content ever leaves the Host.
 * @module dsh-agent-team-presets/execution
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Config } from './config.ts';
import type { TeamExecutionSnapshot } from './types.ts';
/**
 * Whether one Agent is a top-level Session agent this plugin composes.
 * @param agent - the Agent whose Session origin decides it.
 * @returns whether that Agent is a Session root rather than a teammate.
 */
export declare function isSessionRoot(agent: Agent): boolean;
/**
 * Whether any teammate of one Session is still running or provisioning.
 *
 * A teammate whose child has not been created yet has no `agent/status` of its
 * own, so the roster — which folds the durable `team/member` events — is the
 * authority here rather than the Agent registry. The captain is not counted:
 * its own status is the other half of the same question.
 * @param ctx - host context carrying the Team service.
 * @param agent - the Session-root Agent to inspect.
 * @returns whether a teammate is still working on that Session's Team task.
 */
export declare function teammatesBusy(ctx: Context, agent: Agent): boolean;
/** The applied definition of one Session, as the freezer holds it. */
export interface AppliedTeam {
    /** Identity of the Team the Session has applied. */
    readonly teamId: string;
    /** Definition fingerprint of that applied preset, so the latest stored one can be compared. */
    readonly fingerprint: string;
}
/** Host facts one monitor reads, supplied by the plugin that owns them. */
export interface TeamExecutionSources {
    /** Live configuration carrying the stored Teams and their selections. */
    readonly config: Config;
    /** The Team one Session currently has applied, when it has one. */
    readonly applied: (agent: Agent) => AppliedTeam | undefined;
}
/** Publishes whole-set Team execution frames to the settings page. */
export declare class TeamExecutionMonitor {
    private readonly ctx;
    private readonly sources;
    private readonly subscribers;
    private scheduled;
    private disposed;
    /**
     * @param ctx - host context carrying the Agent registry and Team service.
     * @param sources - live configuration and the applied-Team lookup.
     */
    constructor(ctx: Context, sources: TeamExecutionSources);
    /**
     * Publish the current frame after the next microtask.
     *
     * Several commits in one turn cost one frame, and a burst of lifecycle edges
     * is read once, after every listener of the commit that caused it has run.
     */
    invalidate(): void;
    /**
     * Stream whole-set frames until the caller aborts.
     *
     * The subscription is in place before the first frame is computed, so a change
     * that lands while it is being sent is still delivered.
     * @param signal - cancellation owned by the Remote stream carrier.
     * @returns the frames, opening with the current state.
     */
    stream(signal: AbortSignal): AsyncIterable<TeamExecutionSnapshot>;
    /** Release every consumer; the stream ends without another frame. */
    dispose(): void;
    /**
     * Read the current execution state of every Team the Host can report.
     * @returns one row per configured or referenced Team, ordered by identity.
     */
    private frame;
}
//# sourceMappingURL=execution.d.ts.map