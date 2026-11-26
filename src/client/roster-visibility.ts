/**
 * Which roster rows the conversation header lists.
 *
 * A Team that hands work over between executor instances accumulates finished
 * members faster than it finishes tasks, and every one of them would otherwise
 * keep a row forever. This keeps the panel about what is happening now, while
 * the captain stays: its row is where the reader already is, so hiding it would
 * remove the only stable anchor the list has.
 *
 * Kept apart from the component so the rule is testable without a DOM.
 */

import type { TeamRosterMemberView } from '../types.ts'

/**
 * The rows to render: every running teammate, plus the captain.
 * @param members - every member the Host reports for this Team.
 * @returns the rows to show, in the order the Host reported them.
 */
export function visibleRosterMembers(
  members: readonly TeamRosterMemberView[],
): readonly TeamRosterMemberView[] {
  return members.filter(member => member.role === 'captain' || member.status === 'running')
}
