/**
 * Agent Team presets: configure reusable Teams in Settings, pick one per
 * Session from the composer, and let its captain summon configured members.
 *
 * The Host half owns the live configuration, applies a selected Team to its
 * Session, and registers the member tool. A captain runs on the model the
 * Session already selected; only members carry a configurable route. The
 * `./client` half renders the Settings page and the composer control over the
 * same `agent-team-presets` settings namespace.
 * @module dsh-agent-team-presets
 */

import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import type {} from '@deepseek-ai/dsh-experimental-agent-team'
import type {} from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { applyTeamToAgent } from './application.ts'
import type { TeamApplication } from './application.ts'
import type { Config } from './config.ts'
import { LEGACY_CAPTAIN_ROUTE_KEYS, withoutCaptainRoutes } from './config.ts'
import { selectedTeam } from './presets.ts'
import TeamPresetsToolCatalog from './tool-catalog.ts'

export type * from './types.ts'
export { Config } from './config.ts'
export type { ToolCatalogValue, ToolChoice } from './types.ts'

/** Cordis plugin name. */
export const name = 'agent-team-presets'

/** Settings entry this plugin owns and rewrites when stored Teams are stale. */
const NAMESPACE = 'agent-team-presets'

/**
 * Services this plugin reads: the Session agents it composes, the Team service
 * it summons members through, the tool registry its member tool joins, the
 * prompt sections its captain adds, and the settings document it owns.
 */
export const inject = ['agents', 'agentTeams', 'tools', 'systemPrompt', 'settings']

/** Diagnostics prefix for the failures this plugin only reports. */
const LOG = 'agent-team-presets'

/** Whether one Agent is a top-level Session agent this plugin composes. */
function isSessionRoot(agent: Agent): boolean {
  return agent.session.header.origin !== 'subagent'
}

/**
 * Drop the captain route a Team stored before captains stopped owning one.
 *
 * An older document keeps `provider`, `model`, and `reasoningEffort` on every
 * captain, because the settings schema preserves members it does not declare.
 * The rewrite is an ordinary settings write, so the running configuration, the
 * profile patch, and every open Settings page agree on what a captain owns.
 * @param ctx - the plugin context providing `settings`.
 * @param config - the live configuration to inspect.
 * @returns once the document was rewritten, or immediately when it was already clean.
 */
async function dropStoredCaptainRoutes(ctx: Context, config: Config): Promise<void> {
  const teams = config.teams.get()
  const cleaned = withoutCaptainRoutes(teams)
  if (cleaned.every((team, index) => team === teams[index])) return
  try {
    await ctx.settings.update(NAMESPACE, { teams: cleaned })
  } catch (error: unknown) {
    ctx.logger.warn(`${LOG}: stored captains still carry %s because the rewrite was refused: %s`, LEGACY_CAPTAIN_ROUTE_KEYS.join('/'), String(error))
  }
}

/** Apply one valid Team preset to one live Session. */
export function apply(ctx: Context, config: Config): void {
  const providers = { fresh: config.freshProvider, fork: config.forkProvider }
  const applications = new Map<Agent, TeamApplication>()

  // The settings page lists the tools an allow-list may name; the catalog is a
  // Remote service so the browser never guesses a tool name.
  ctx.plugin(TeamPresetsToolCatalog)

  // The settings page owns this entry's editing surface, so the Plugins page
  // must not also generate a form for it.
  ctx.effect(() => ctx.settings.configure({ auto: false }, ctx.fiber), 'agent-team-presets: page policy')

  const reconcile = (agent: Agent): void => {
    const team = selectedTeam(config.teams.get(), config.selections.get(), agent.session.id)
    const current = applications.get(agent)
    if (team === undefined) {
      current?.dispose()
      applications.delete(agent)
      return
    }
    const fingerprint = JSON.stringify(team)
    if (current !== undefined && current.teamId === team.id && current.fingerprint === fingerprint) return
    current?.dispose()
    applications.delete(agent)
    applications.set(agent, applyTeamToAgent(ctx, agent, team, providers))
  }

  // A document stored while captains still owned a route is cleaned once, so a
  // Session is never composed from a Team shape this plugin no longer applies.
  void dropStoredCaptainRoutes(ctx, config)

  for (const agent of ctx.agents.list()) {
    if (isSessionRoot(agent)) reconcile(agent)
  }
  ctx.on('agent/created', ({ agent }) => {
    if (isSessionRoot(agent)) reconcile(agent)
  })
  ctx.on('agent/disposed', ({ agent }) => {
    applications.get(agent)?.dispose()
    applications.delete(agent)
  })
  ctx.on('loader/volatile-update', () => {
    for (const agent of ctx.agents.list()) {
      if (isSessionRoot(agent)) reconcile(agent)
    }
  })
  ctx.effect(() => () => {
    for (const application of applications.values()) application.dispose()
    applications.clear()
  }, 'agent-team-presets: session applications')
}
