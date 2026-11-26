/**
 * The header roster hides what is not happening.
 *
 * A Team that replaces its executor often ends up with more finished members
 * than live ones, and each finished member used to keep a row forever — the
 * panel filled with instances that can no longer do anything. The rule is
 * therefore "running teammates plus the captain", and this pins both halves:
 * finished teammates disappear, and the captain never does.
 */

import { describe, expect, it } from 'vitest'
import { visibleRosterMembers } from '../src/client/roster-visibility.ts'
import type { TeamRosterMemberView } from '../src/types.ts'

function member(
  name: string,
  role: TeamRosterMemberView['role'],
  status: TeamRosterMemberView['status'],
): TeamRosterMemberView {
  return { name, displayName: name, description: '', role, status, color: '' }
}

describe('which roster rows the header shows', () => {
  it('keeps a running teammate and drops a finished one', () => {
    const members = [member('team-lead', 'captain', 'idle'), member('executor-2', 'member', 'running')]
    expect(visibleRosterMembers(members).map(row => row.name)).toEqual(['team-lead', 'executor-2'])
  })

  it('drops every finished teammate, however many accumulated', () => {
    const members = [
      member('team-lead', 'captain', 'idle'),
      member('executor', 'member', 'idle'),
      member('executor-2', 'member', 'idle'),
      member('executor-3', 'member', 'running'),
    ]
    expect(visibleRosterMembers(members).map(row => row.name)).toEqual(['team-lead', 'executor-3'])
  })

  it('keeps the captain even when it is not running', () => {
    // The captain row is the reader's own position, so it is never collapsed —
    // a panel that hid it would have no stable anchor while members cycle.
    const members = [member('team-lead', 'captain', 'idle')]
    expect(visibleRosterMembers(members).map(row => row.name)).toEqual(['team-lead'])
  })

  it('keeps the captain when it is mid-turn as well', () => {
    const members = [member('team-lead', 'captain', 'running'), member('executor', 'member', 'idle')]
    expect(visibleRosterMembers(members).map(row => row.name)).toEqual(['team-lead'])
  })

  it('preserves the Host order instead of sorting', () => {
    const members = [
      member('a', 'member', 'running'),
      member('team-lead', 'captain', 'idle'),
      member('b', 'member', 'running'),
    ]
    expect(visibleRosterMembers(members).map(row => row.name)).toEqual(['a', 'team-lead', 'b'])
  })

  it('returns nothing for a Team with no members at all', () => {
    expect(visibleRosterMembers([])).toEqual([])
  })
})
