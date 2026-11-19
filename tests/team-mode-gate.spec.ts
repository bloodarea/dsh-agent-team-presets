/**
 * The Team-mode gate: which Sessions receive the seven Team-themed tools.
 *
 * The rule is the one the official `team_task_*` tools follow — a Session that
 * does not use Agent Teams must not carry their schemas — with one deliberate
 * exception: a deployment that composes no Agent Teams service cannot observe a
 * mode at all, and there the tools stay exactly as they were.
 */

import { describe, expect, it } from 'vitest'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { teamModeAdmitsTools, teamModeOf } from '../src/team-mode.ts'

/** A projection registry that answers one fixed `agentTeam` view. */
function registry(enabled: boolean | undefined) {
  return {
    snapshot: () => ({ values: enabled === undefined ? {} : { agentTeam: { enabled } } }),
  }
}

/** An Agent stand-in: the gate only reads its session through the registry. */
const agent = { session: { id: 's1' } } as unknown as Agent

describe('the Team-mode gate', () => {
  it('reads the mode from the agentTeam projection', () => {
    expect(teamModeOf(registry(true), agent)).toBe(true)
    expect(teamModeOf(registry(false), agent)).toBe(false)
  })

  it('reports an unobservable mode instead of guessing', () => {
    // No registry, an unregistered key, and a throwing registry all mean "cannot
    // know" — not "off", because a deployment without Agent Teams must keep the
    // management tools it always had.
    expect(teamModeOf(undefined, agent)).toBeUndefined()
    expect(teamModeOf(registry(undefined), agent)).toBeUndefined()
    expect(teamModeOf({ snapshot: () => { throw new Error('no such projection') } }, agent)).toBeUndefined()
  })

  it('withdraws the tools only on a positively read "off"', () => {
    expect(teamModeAdmitsTools(registry(true), agent)).toBe(true)
    expect(teamModeAdmitsTools(registry(false), agent)).toBe(false)
    expect(teamModeAdmitsTools(undefined, agent)).toBe(true)
    expect(teamModeAdmitsTools(registry(undefined), agent)).toBe(true)
  })
})
