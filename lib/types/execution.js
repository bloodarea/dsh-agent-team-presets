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
import { definitionFingerprint, selectedTeam } from "./presets.js";
/**
 * Whether one Agent is a top-level Session agent this plugin composes.
 * @param agent - the Agent whose Session origin decides it.
 * @returns whether that Agent is a Session root rather than a teammate.
 */
export function isSessionRoot(agent) {
    return agent.session.header.origin !== 'subagent';
}
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
export function teammatesBusy(ctx, agent) {
    if (ctx.agentTeams.tryMembership(agent) === undefined)
        return false;
    return ctx.agentTeams.listMembers(agent).some(member => member.role === 'teammate'
        && (member.status === 'running' || member.status === 'provisioning'));
}
/** One open consumer of the whole-set frames. */
class FrameQueue {
    queue = [];
    sent;
    wake;
    closed = false;
    /**
     * Offer one computed frame.
     *
     * An unchanged frame is dropped: the stream reports state, so a consumer that
     * already holds it needs no second copy.
     * @param frame - the whole-set frame just computed.
     */
    offer(frame) {
        if (this.closed)
            return;
        const encoded = JSON.stringify(frame);
        if (encoded === this.sent)
            return;
        this.sent = encoded;
        this.queue.push(frame);
        const wake = this.wake;
        this.wake = undefined;
        wake?.();
    }
    /** Release the consumer, dropping anything it has not read. */
    close() {
        this.closed = true;
        this.queue.length = 0;
        const wake = this.wake;
        this.wake = undefined;
        wake?.();
    }
    /** @returns the next unread frame, or undefined once closed and drained. */
    async take() {
        while (this.queue.length === 0) {
            if (this.closed)
                return undefined;
            await new Promise((resolve) => { this.wake = resolve; });
        }
        return this.queue.shift();
    }
}
/** Publishes whole-set Team execution frames to the settings page. */
export class TeamExecutionMonitor {
    ctx;
    sources;
    subscribers = new Set();
    scheduled = false;
    disposed = false;
    /**
     * @param ctx - host context carrying the Agent registry and Team service.
     * @param sources - live configuration and the applied-Team lookup.
     */
    constructor(ctx, sources) {
        this.ctx = ctx;
        this.sources = sources;
    }
    /**
     * Publish the current frame after the next microtask.
     *
     * Several commits in one turn cost one frame, and a burst of lifecycle edges
     * is read once, after every listener of the commit that caused it has run.
     */
    invalidate() {
        if (this.disposed || this.scheduled)
            return;
        this.scheduled = true;
        queueMicrotask(() => {
            this.scheduled = false;
            if (this.disposed || this.subscribers.size === 0)
                return;
            const frame = this.frame();
            for (const subscriber of [...this.subscribers])
                subscriber.offer(frame);
        });
    }
    /**
     * Stream whole-set frames until the caller aborts.
     *
     * The subscription is in place before the first frame is computed, so a change
     * that lands while it is being sent is still delivered.
     * @param signal - cancellation owned by the Remote stream carrier.
     * @returns the frames, opening with the current state.
     */
    async *stream(signal) {
        if (this.disposed || signal.aborted)
            return;
        const queue = new FrameQueue();
        this.subscribers.add(queue);
        const onAbort = () => { queue.close(); };
        signal.addEventListener('abort', onAbort, { once: true });
        try {
            queue.offer(this.frame());
            for (;;) {
                const frame = await queue.take();
                if (frame === undefined)
                    return;
                yield frame;
            }
        }
        finally {
            signal.removeEventListener('abort', onAbort);
            this.subscribers.delete(queue);
        }
    }
    /** Release every consumer; the stream ends without another frame. */
    dispose() {
        this.disposed = true;
        for (const subscriber of [...this.subscribers])
            subscriber.close();
        this.subscribers.clear();
    }
    /**
     * Read the current execution state of every Team the Host can report.
     * @returns one row per configured or referenced Team, ordered by identity.
     */
    frame() {
        const tallies = new Map();
        const tally = (teamId) => {
            const existing = tallies.get(teamId);
            if (existing !== undefined)
                return existing;
            const created = { busy: 0, members: 0, pending: 0, unreadable: false };
            tallies.set(teamId, created);
            return created;
        };
        const teams = this.sources.config.teams.get();
        for (const team of teams)
            tally(team.id);
        for (const agent of this.ctx.agents.list()) {
            if (!isSessionRoot(agent))
                continue;
            const selected = selectedTeam(teams, this.sources.config.selections.get(), agent.session.id);
            const applied = this.sources.applied(agent);
            const referenced = new Set();
            if (selected !== undefined)
                referenced.add(selected.id);
            if (applied !== undefined)
                referenced.add(applied.teamId);
            if (referenced.size === 0)
                continue;
            // The roster is the only authority on a teammate with no live child, so a
            // Session whose roster cannot be read is undecidable rather than idle.
            const readable = this.ctx.agentTeams.tryMembership(agent) !== undefined;
            const members = readable
                ? this.ctx.agentTeams.listMembers(agent).filter(member => member.role === 'teammate'
                    && (member.status === 'running' || member.status === 'provisioning')).length
                : 0;
            const busy = agent.status === 'running' || members > 0;
            const pending = applied === undefined
                || selected === undefined
                || applied.teamId !== selected.id
                // Only the frozen definition counts: a member route or accent color the
                // page saved is read live, so it leaves nothing for the next task to adopt.
                || applied.fingerprint !== definitionFingerprint(selected);
            for (const teamId of referenced) {
                const row = tally(teamId);
                if (busy)
                    row.busy += 1;
                if (!readable)
                    row.unreadable = true;
                row.members += members;
                if (pending)
                    row.pending += 1;
            }
        }
        const rows = [...tallies.entries()]
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([teamId, row]) => ({
            teamId,
            state: row.busy > 0 ? 'busy' : row.unreadable ? 'unknown' : 'idle',
            busySessions: row.busy,
            executingMembers: row.members,
            pendingSessions: row.pending,
        }));
        return { teams: rows };
    }
}
