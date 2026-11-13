/**
 * Minimal, revision-fenced reconcile of this plugin's own settings document.
 *
 * One startup pass owns every repair the plugin makes to the stored Teams,
 * because they all rewrite the same `teams` array and two writers would race
 * each other's revision fence:
 *
 * - the legacy captain route, which no current schema declares,
 * - a member identity a stored record never carried,
 * - the shipped default presets, installed once per deployment,
 * - a local category membership whose category or custom Team is gone.
 *
 * The pass never touches Session policy, and it writes only when a repair
 * really applies. Read-only and conflict errors are not retried for the same
 * document: the caller notifies again when the document, the Teams value, or the
 * shipped-defaults marker changes.
 * @module dsh-agent-team-presets/settings-reconcile
 */

import type { Context } from '@deepseek-ai/cordis'
import { randomUUID } from 'node:crypto'
import type {} from '@deepseek-ai/dsh-settings'
import { cloneMetadata, missingSeededBuiltinTeams, seedBuiltinTeams } from './builtin-teams.ts'
import { builtinEntry } from './team-catalog.ts'
import type { Config } from './config.ts'
import { withoutCaptainRoutes } from './config.ts'
import { reconciledAssignments } from './team-search.ts'

/** Coalesce startup/config edges into one in-flight write and one latest recheck. */
export function teamSettingsReconcile(ctx: Context, config: Config, namespace: string): {
  request(): Promise<void>
  dispose(): void
} {
  let disposed = false
  let running = false
  let requested = false
  let attempted: string | undefined
  return {
    async request() {
      if (disposed) return
      if (running) { requested = true; return }
      running = true
      try {
        do {
          requested = false
          if (disposed) break
          // Read the revision before the synchronous Config snapshot. A LOADING
          // settings entry is absent: the caller retries after activation.
          const descriptor = ctx.settings.describe().find(row => row.ns === namespace)
          if (descriptor === undefined) break
          const teams = config.teams.get()
          const seeded = config.seededDefaults.get()
          // The live schema always supplies both, and its defaults are empty.
          // They are read through a tolerant accessor because a hand-written
          // Config (a test double, an older embedding) predates the fields and
          // must still reconcile its Teams rather than abort the pass.
          const categories = config.categories?.get() ?? []
          const teamCategories = config.teamCategories?.get() ?? []
          const cleaned = withoutCaptainRoutes(teams).map(team => {
            const used = new Set<string>()
            let changed = false
            const members = team.members.map(member => {
              if (member.id !== undefined && member.id !== '' && !used.has(member.id)) {
                used.add(member.id)
                return member
              }
              changed = true
              const id = randomUUID()
              used.add(id)
              return { ...member, id }
            })
            let nextTeam = changed ? { ...team, members } : team
            const entry = builtinEntry(team.id)
            if (entry !== undefined && (nextTeam.metadata === undefined || (nextTeam.metadata.summary ?? '').trim() === '')) {
              nextTeam = { ...nextTeam, metadata: cloneMetadata(entry.metadata) }
            }
            return nextTeam
          })
          // The shipped defaults are appended, never substituted: a preset the
          // user edited keeps every edit, and one the user deleted stays deleted
          // because its identity was marked when it was first offered.
          const installed = seedBuiltinTeams(cleaned, seeded)
          // The marker keeps a deleted preset deleted, so a Team list that lost
          // its shipped presets some other way (a hand edit, a restored settings
          // file, a rollback) stays empty until the reader restores them. Say so
          // once per startup instead of leaving an unexplained empty page.
          const missingShipped = missingSeededBuiltinTeams(installed.teams, installed.seeded)
          if (missingShipped.length > 0) {
            ctx.logger.warn(
              'agent-team-presets: %d shipped Team preset(s) are marked as offered but missing from the Team list (%s); open Settings → Agent Team presets and click "Restore built-in presets", then save',
              missingShipped.length,
              missingShipped.join(', '),
            )
          }
          // Grouping rows naming a deleted category or a deleted custom Team are
          // dead: drop them here so the page never has to explain a row it
          // cannot resolve. A row naming a shipped identity survives, because a
          // restore re-creates that identity.
          const live = reconciledAssignments(categories, installed.teams, teamCategories)
          const categoriesChanged = live.length !== teamCategories.length
          if (categoriesChanged) {
            ctx.logger.info(
              'agent-team-presets: dropped %d category membership(s) whose category or custom Team no longer exists',
              teamCategories.length - live.length,
            )
          }
          const cleanedChanged = cleaned.length !== teams.length
            || cleaned.some((team, index) => team !== teams[index])
          if (!cleanedChanged && !installed.changed && !categoriesChanged) continue
          const identity = JSON.stringify([descriptor.revision, teams, seeded, categories, teamCategories])
          // Read-only/conflict errors are not retried for the same document.
          // A changed revision, Teams value, or marker admits one fresh attempt.
          if (identity === attempted) continue
          attempted = identity
          try {
            await ctx.settings.update(namespace, {
              teams: installed.teams,
              seededDefaults: [...installed.seeded],
              // Only carried when the prune actually removed a row: an ordinary
              // startup write stays exactly the two-field patch it always was.
              ...categoriesChanged ? { teamCategories: live } : {},
            }, descriptor.revision)
          } catch (error: unknown) {
            ctx.logger.warn('agent-team-presets: settings reconcile refused; normal Sessions remain unaffected: %s', String(error))
          }
        } while (requested && !disposed)
      } catch (error: unknown) {
        // A discovery/preparation failure is diagnostic-only too. The scheduled
        // caller never receives an unhandled rejection that could stop the Host.
        ctx.logger.warn('agent-team-presets: could not prepare settings reconcile; normal Sessions remain unaffected: %s', String(error))
      } finally { running = false }
    },
    // Settings.update has no cancellation parameter. A write already admitted
    // may settle, but disposal prevents every queued/new retry.
    dispose() { disposed = true; requested = false },
  }
}
