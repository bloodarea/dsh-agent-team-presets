/**
 * Whether a Session's Team-themed tools follow the Team mode it was started in.
 *
 * The official `team_task_*` tools are declared only while a Session root has
 * Agent Teams turned on. This plugin's seven Team-themed tools — five that manage
 * the private skill library, two that read and edit the Team preset — answer the
 * same question the same way: with Team mode off a Session carries no Team, no
 * selected role, and no library to manage, so declaring those schemas there
 * spends context on capabilities the Session cannot use. The composer already
 * hides its Team control on the same fact, so gating the tools keeps the model
 * side and the page side describing one behaviour instead of two.
 *
 * WHY THIS IS A REGISTRATION DECISION, NOT A `when` CONDITION
 *
 * A conditional registration (`tools.register(def, { when })`) is not readable
 * outside a model step: `tools.executable()` answers undefined for it without a
 * step's admitted set. Three paths in this plugin read tool visibility outside a
 * step — the quarantine guard that decides what a paused Session may reach, the
 * `capabilityRefusal` preflight that proves a custom allow-list names tools this
 * Session composes, and the member-creation route resolution. Conditional
 * registrations would make those tools look absent at every one of them,
 * including the window while a Team is being applied, when the paused captain
 * must still reach its recovery tools.
 *
 * Withdrawing the registration instead keeps one answer per tool: a name is
 * either registered and readable from outside a step, or it is not installed at
 * all. Nothing observes a registered-but-unreadable half state.
 * @module dsh-agent-team-presets/team-mode
 */

import type { Agent } from '@deepseek-ai/dsh-agent'

/** The projection key the Agent Teams service publishes. */
const TEAM_PROJECTION = 'agentTeam'

/**
 * Read the Agent Teams mode of one Session root from the session projections.
 * @param projections - the projection registry, when this deployment composes one.
 * @param agent - the Agent whose mode is being read.
 * @returns `true`/`false` when the mode is observable, `undefined` when it is not.
 */
export function teamModeOf(projections: unknown, agent: Agent): boolean | undefined {
  const registry = projections as {
    snapshot?: (session: Agent['session'], keys?: readonly string[]) => { values: Record<string, unknown> }
  } | undefined
  if (registry?.snapshot === undefined) return undefined
  let projection: { readonly enabled?: boolean } | undefined
  try {
    projection = registry.snapshot(agent.session, [TEAM_PROJECTION]).values[TEAM_PROJECTION] as
      | { readonly enabled?: boolean }
      | undefined
  } catch {
    // A projection key this deployment does not register is the same unknown.
    return undefined
  }
  return projection === undefined ? undefined : projection.enabled === true
}

/**
 * Whether the Team-themed tools belong on this Session right now.
 *
 * An unobservable mode keeps them installed: only a positively read "Team mode is
 * off" removes them, because a deployment that composes no Agent Teams service
 * has no switch to turn on and must keep the management surface it always had.
 * @param projections - the projection registry, when this deployment composes one.
 * @param agent - the Session root being adopted.
 * @returns whether to register the seven tools.
 */
export function teamModeAdmitsTools(projections: unknown, agent: Agent): boolean {
  return teamModeOf(projections, agent) !== false
}
