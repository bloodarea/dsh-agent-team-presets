/** The refusal a used-up lifetime allowance produces must be actionable. */
import { describe, expect, it } from 'vitest'
import { classifySpawnFailure } from '../src/application.ts'

const quota = new Error('This Team has used up its lifetime member allowance. (Team member limit 8 reached)')

describe('lifetime quota refusal', () => {
  it('names the occupancy, the limit, and the slots that never became usable', () => {
    const roster = [
      { name: 'audit-1', status: 'failed' },
      { name: 'audit-2', status: 'failed' },
      { name: 'audit-3', status: 'failed' },
      { name: 'builder', status: 'inactive' },
      { name: 'reviewer', status: 'running' },
      { name: 'audit-4', status: 'failed' },
      { name: 'docs', status: 'inactive' },
      { name: 'probe', status: 'inactive' },
    ]
    const message = classifySpawnFailure(quota, roster)
    expect(message).toContain('8 of 8 roster slots occupied')
    expect(message).toContain('4 of them never became usable (audit-1, audit-2, audit-3, audit-4)')
    expect(message).toContain('cannot be reclaimed')
    expect(message).toContain('start a new Session')
    // The Host's own numbers stay verbatim inside the explanation.
    expect(message).toContain('(Team member limit 8 reached)')
  })

  it('does not claim a failed slot when every occupant is usable', () => {
    const roster = [
      { name: 'builder', status: 'inactive' },
      { name: 'reviewer', status: 'running' },
    ]
    const message = classifySpawnFailure(quota, roster)
    expect(message).toContain('2 of 8 roster slots occupied')
    expect(message).not.toContain('of them never became usable')
    expect(message).not.toContain('(,')
  })

  it('still explains the concurrent capacity limit and passes other failures through', () => {
    expect(classifySpawnFailure(new Error('active child limit reached'))).toContain('concurrent subagent limit')
    expect(classifySpawnFailure(new Error('provider exploded'))).toBe('provider exploded')
  })
})
