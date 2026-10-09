/**
 * Accent colors this plugin publishes to the Agent Teams roster.
 *
 * A Team's configured colors live in the settings document rather than in the
 * Session log, so the browser half resolves them from the same stored Teams and
 * selections the Settings page and the composer control edit.
 * @module dsh-agent-team-presets/appearance
 */

import type { TeamAppearance } from '@deepseek-ai/dsh-experimental-client-ui-agent-team/client'
import { memberTargets } from '../presets.ts'
import type { TeamPreset } from '../types.ts'
import type { TeamSelectionRecordView } from './team-presets-controller.ts'

/**
 * Resolve the accent colors of the Team one Session selected.
 * @param teams - every stored Team preset.
 * @param selections - every Session's stored Team selection.
 * @param sessionId - the Lead Session identity.
 * @returns the colors the roster draws with, or undefined when the Session selected no Team.
 */
export function teamAppearance(
  teams: readonly TeamPreset[],
  selections: readonly TeamSelectionRecordView[],
  sessionId: string,
): TeamAppearance | undefined {
  const teamId = selections.find(record => record.sessionId === sessionId)?.teamId
  const team = teams.find(candidate => candidate.id === teamId)
  if (team === undefined) return undefined
  return {
    captain: team.captain.color,
    members: new Map(memberTargets(team).map(({ member, target }) => [target, member.color])),
  }
}
