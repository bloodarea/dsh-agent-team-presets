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

import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-experimental-agent-team'
import type { Config } from './config.ts'
import { definitionFingerprint, selectedTeam } from './presets.ts'
import type { TeamExecutionRow, TeamExecutionSnapshot } from './types.ts'

/**
 * Whether one Agent is a top-level Session agent this plugin composes.
 * @param agent - the Agent whose Session origin decides it.
 * @returns whether that Agent is a Session root rather than a teammate.
 */
export function isSessionRoot(agent: Agent): boolean {
  return agent.session.header.origin !== 'subagent'
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
export function teammatesBusy(ctx: Context, agent: Agent): boolean {
  if (ctx.agentTeams.tryMembership(agent) === undefined) return false
  return ctx.agentTeams.listMembers(agent).some(member => member.role === 'teammate'
    && (member.status === 'running' || member.status === 'provisioning'))
}

/** The applied definition of one Session, as the freezer holds it. */
export interface AppliedTeam {
  /** Identity of the Team the Session has applied. */
  readonly teamId: string
  /** Definition fingerprint of that applied preset, so the latest stored one can be compared. */
  readonly fingerprint: string
}

/** Host facts one monitor reads, supplied by the plugin that owns them. */
export interface TeamExecutionSources {
  /** Live configuration carrying the stored Teams and their selections. */
  readonly config: Config
  /** The Team one Session currently has applied, when it has one. */
  readonly applied: (agent: Agent) => AppliedTeam | undefined
}

/** Running counts one Team's online Sessions contribute. */
interface TeamTally {
  busy: number
  members: number
  pending: number
  unreadable: boolean
}

/** One open consumer of the whole-set frames. */
class FrameQueue {
  private readonly queue: TeamExecutionSnapshot[] = []
  private sent: string | undefined
  private wake: (() => void) | undefined
  private closed = false

  /**
   * Offer one computed frame.
   *
   * An unchanged frame is dropped: the stream reports state, so a consumer that
   * already holds it needs no second copy.
   * @param frame - the whole-set frame just computed.
   */
  offer(frame: TeamExecutionSnapshot): void {
    if (this.closed) return
    const encoded = JSON.stringify(frame)
    if (encoded === this.sent) return
    this.sent = encoded
    this.queue.push(frame)
    const wake = this.wake
    this.wake = undefined
    wake?.()
  }

  /** Release the consumer, dropping anything it has not read. */
  close(): void {
    this.closed = true
    this.queue.length = 0
    const wake = this.wake
    this.wake = undefined
    wake?.()
  }

  /** @returns the next unread frame, or undefined once closed and drained. */
  async take(): Promise<TeamExecutionSnapshot | undefined> {
    while (this.queue.length === 0) {
      if (this.closed) return undefined
      await new Promise<void>((resolve) => { this.wake = resolve })
    }
    return this.queue.shift()
  }
}

/** Publishes whole-set Team execution frames to the settings page. */
export class TeamExecutionMonitor {
  private readonly subscribers = new Set<FrameQueue>()
  private scheduled = false
  private disposed = false

  /**
   * @param ctx - host context carrying the Agent registry and Team service.
   * @param sources - live configuration and the applied-Team lookup.
   */
  constructor(
    private readonly ctx: Context,
    private readonly sources: TeamExecutionSources,
  ) {}

  /**
   * Publish the current frame after the next microtask.
   *
   * Several commits in one turn cost one frame, and a burst of lifecycle edges
   * is read once, after every listener of the commit that caused it has run.
   */
  invalidate(): void {
    if (this.disposed || this.scheduled) return
    this.scheduled = true
    queueMicrotask(() => {
      this.scheduled = false
      if (this.disposed || this.subscribers.size === 0) return
      const frame = this.frame()
      for (const subscriber of [...this.subscribers]) subscriber.offer(frame)
    })
  }

  /**
   * Stream whole-set frames until the caller aborts.
   *
   * The subscription is in place before the first frame is computed, so a change
   * that lands while it is being sent is still delivered.
   * @param signal - cancellation owned by the Remote stream carrier.
   * @returns the frames, opening with the current state.
   */
  async *stream(signal: AbortSignal): AsyncIterable<TeamExecutionSnapshot> {
    if (this.disposed || signal.aborted) return
    const queue = new FrameQueue()
    this.subscribers.add(queue)
    const onAbort = (): void => { queue.close() }
    signal.addEventListener('abort', onAbort, { once: true })
    try {
      queue.offer(this.frame())
      for (;;) {
        const frame = await queue.take()
        if (frame === undefined) return
        yield frame
      }
    } finally {
      signal.removeEventListener('abort', onAbort)
      this.subscribers.delete(queue)
    }
  }

  /** Release every consumer; the stream ends without another frame. */
  dispose(): void {
    this.disposed = true
    for (const subscriber of [...this.subscribers]) subscriber.close()
    this.subscribers.clear()
  }

  /**
   * Read the current execution state of every Team the Host can report.
   * @returns one row per configured or referenced Team, ordered by identity.
   */
  private frame(): TeamExecutionSnapshot {
    const tallies = new Map<string, TeamTally>()
    const tally = (teamId: string): TeamTally => {
      const existing = tallies.get(teamId)
      if (existing !== undefined) return existing
      const created: TeamTally = { busy: 0, members: 0, pending: 0, unreadable: false }
      tallies.set(teamId, created)
      return created
    }
    const teams = this.sources.config.teams.get()
    for (const team of teams) tally(team.id)
    for (const agent of this.ctx.agents.list()) {
      if (!isSessionRoot(agent)) continue
      const selected = selectedTeam(teams, this.sources.config.selections.get(), agent.session.id)
      const applied = this.sources.applied(agent)
      const referenced = new Set<string>()
      if (selected !== undefined) referenced.add(selected.id)
      if (applied !== undefined) referenced.add(applied.teamId)
      if (referenced.size === 0) continue
      // The roster is the only authority on a teammate with no live child, so a
      // Session whose roster cannot be read is undecidable rather than idle.
      const readable = this.ctx.agentTeams.tryMembership(agent) !== undefined
      const members = readable
        ? this.ctx.agentTeams.listMembers(agent).filter(member => member.role === 'teammate'
          && (member.status === 'running' || member.status === 'provisioning')).length
        : 0
      const busy = agent.status === 'running' || members > 0
      const pending = applied === undefined
        || selected === undefined
        || applied.teamId !== selected.id
        // Only the frozen definition counts: a member route or accent color the
        // page saved is read live, so it leaves nothing for the next task to adopt.
        || applied.fingerprint !== definitionFingerprint(selected)
      for (const teamId of referenced) {
        const row = tally(teamId)
        if (busy) row.busy += 1
        if (!readable) row.unreadable = true
        row.members += members
        if (pending) row.pending += 1
      }
    }
    const rows: TeamExecutionRow[] = [...tallies.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([teamId, row]) => ({
        teamId,
        state: row.busy > 0 ? 'busy' : row.unreadable ? 'unknown' : 'idle',
        busySessions: row.busy,
        executingMembers: row.members,
        pendingSessions: row.pending,
      }))
    return { teams: rows }
  }
}
