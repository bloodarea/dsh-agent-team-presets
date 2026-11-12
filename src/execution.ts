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
import type {} from '@deepseek-ai/dsh-agent-team'
import { executingMemberCount } from './team-runtime.ts'
import type { Config } from './config.ts'
import { definitionFingerprint, findMemberById, memberRouteOf, sameMemberRoute, selectedRoleId, selectedTeam } from './presets.ts'
import type { ConfiguredMemberRoute } from './presets.ts'
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
 * A member whose child has not been published yet has no `agent/status` of its
 * own, so the subagent catalog and this plugin's own admission record are the
 * authority here rather than the Agent registry. The captain is not counted:
 * its own status is the other half of the same question.
 * @param ctx - host context carrying the Team service.
 * @param agent - the Session-root Agent to inspect.
 * @returns whether a teammate is still working on that Session's Team task.
 */
export function teammatesBusy(ctx: Context, agent: Agent): boolean {
  return executingMemberCount(ctx, agent) > 0
}

/**
 * The tool name that only a Team application registers on one Agent.
 *
 * `applyTeamToAgent` registers it through `registerMemberTool`, and no other
 * path in this plugin — or in the deployment — registers that name on a Session
 * root. A request header therefore records, durably, whether the Session was
 * running under a Team when that request was assembled.
 */
const TEAM_APPLICATION_MARKER = 'spawn_team_member'

/**
 * Whether the last request this Session sent was assembled under a Team.
 *
 * The latest `request/header` event is the header the Host itself built for the
 * most recent request, so it follows the live tool surface rather than carrying
 * a stale flag: deselecting a Team and running again clears the marker, and
 * applying one restores it.
 *
 * POSITIVE EVIDENCE ONLY. `true` proves the Session ran under a Team. `false`
 * proves nothing: the Host appends the header only after prompt assembly and
 * request preparation, so a Session can be busy with no header yet, and a
 * missing marker can simply be the previous task's No-team header. Two further
 * reasons a real Team can lack the marker are the PTC presentation fold (a
 * non-native surface exposes only `run_code`) and an `all`-mode Team, which
 * applies without forcing a native presentation. Callers must therefore treat
 * `false` as "unknown", never as "No team".
 * @param agent - the Session-root Agent whose own log is read.
 * @returns whether the latest request header carried this plugin's Team marker.
 */
export function hasTeamApplicationMarker(agent: Agent): boolean {
  const events = agent.session.ownEvents()
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (event?.type !== 'request/header') continue
    const header = event.data.header as { tools?: readonly { name?: string }[] }
    return (header.tools ?? []).some(tool => tool.name === TEAM_APPLICATION_MARKER)
  }
  return false
}

/** The applied definition of one Session, as the freezer holds it. */
export interface AppliedTeam {
  /** Identity of the Team the Session has applied. */
  readonly teamId: string
  /** Member role the Session runs as, or undefined for a captain-led application. */
  readonly roleId?: string
  /** Member route that application selected as the Session model, when one was selected. */
  readonly route?: ConfiguredMemberRoute
  /** Definition fingerprint of that applied preset, so the latest stored one can be compared. */
  readonly fingerprint: string
  /**
   * Disclosure of the tool presentation this Session effectively runs with,
   * when applying the Team overrode the Agent preset's own declaration.
   */
  readonly presentationNote?: string
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
  notes: Set<string>
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
    // Whole-set state, not an event journal: retain only the latest unread frame.
    this.queue.splice(0, this.queue.length, frame)
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
      const created: TeamTally = { busy: 0, members: 0, pending: 0, unreadable: false, notes: new Set() }
      tallies.set(teamId, created)
      return created
    }
    const teams = this.sources.config.teams.get()
    for (const team of teams) tally(team.id)
    for (const agent of this.ctx.agents.list()) {
      if (!isSessionRoot(agent)) continue
      const selection = this.sources.config.selections.get().find(row => row.sessionId === agent.session.id)
      const selected = selectedTeam(teams, this.sources.config.selections.get(), agent.session.id)
      const selectedRole = selectedRoleId(selection)
      const selectedMember = selectedRole === undefined ? undefined : findMemberById(selected, selectedRole)
      const selectedRoute = selectedMember === undefined ? undefined : memberRouteOf(selectedMember)
      const applied = this.sources.applied(agent)
      const referenced = new Set<string>()
      if (selected !== undefined) referenced.add(selected.id)
      if (applied !== undefined) referenced.add(applied.teamId)
      if (referenced.size === 0) continue
      // The roster is the only authority on a teammate with no live child, so a
      // Session whose roster cannot be read is undecidable rather than idle.
      let readable = true
      let members = 0
      try { members = executingMemberCount(this.ctx, agent) } catch (error: unknown) {
        readable = false
        this.ctx.logger.warn('agent-team-presets: member execution state could not be read: %s', String(error))
      }
      const busy = agent.status === 'running' || members > 0
      const pending = applied === undefined
        || selected === undefined
        || applied.teamId !== selected.id
        // A role change is a different application even when the definition is
        // unchanged: the persona, tool policy, and Session model all move.
        || applied.roleId !== selectedRole
        // A selected member's route is the Session model, so a route edit is
        // pending for an individual conversation. A captain-led Team reads its
        // members' routes only when it summons one, so those edits are not.
        || (selectedRole !== undefined && !sameMemberRoute(applied.route, selectedRoute))
        // Only the frozen definition counts: an accent color the page saved is
        // read live, so it leaves nothing for the next task to adopt.
        || applied.fingerprint !== definitionFingerprint(selected)
      for (const teamId of referenced) {
        const row = tally(teamId)
        if (busy) row.busy += 1
        if (!readable) row.unreadable = true
        row.members += members
        if (pending) row.pending += 1
        // Only the row whose definition is actually applied reports its
        // disclosure; a selection that has not been adopted yet has none.
        if (applied?.teamId === teamId && applied.presentationNote !== undefined) row.notes.add(applied.presentationNote)
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
        notes: [...row.notes].sort((left, right) => left.localeCompare(right)),
      }))
    return { teams: rows }
  }
}
