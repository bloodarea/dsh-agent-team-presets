/** Pure Team preset edits: the field whitelist, member resolution, and refusal text. */
import { describe, expect, it } from 'vitest'
import { editTeamPreset, MEMBER_DESCRIPTION_LIMIT, promptTemplateFailure } from '../src/preset-editor.ts'
import { slot, team } from './fixtures/team-presets.ts'
import type { TeamPreset } from '../src/types.ts'

/** The stored preset every case edits. */
const STORED: TeamPreset = {
  ...team([slot({ name: 'Reviewer', description: 'checks diffs', systemPrompt: 'You review diffs.' })], {
    description: 'leads the release review',
  }),
  name: 'Reviews',
  description: 'release reviews',
}

describe('editTeamPreset', () => {
  it('replaces the Team, captain, and member fields it names', () => {
    const result = editTeamPreset(STORED, {
      description: 'release reviews with a written verdict',
      captainDescription: 'leads and signs off',
      captainSystemPrompt: 'You lead the release review.',
      members: [{ member: 'reviewer', description: 'checks diffs against the notes', systemPrompt: 'Review strictly.' }],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.changed).toEqual([
      'team.description',
      'captain.description',
      'captain.systemPrompt',
      'member:reviewer.description',
      'member:reviewer.systemPrompt',
    ])
    expect(result.team).toMatchObject({
      name: 'Reviews',
      description: 'release reviews with a written verdict',
      captain: { description: 'leads and signs off', systemPrompt: 'You lead the release review.' },
      members: [{ name: 'Reviewer', description: 'checks diffs against the notes', systemPrompt: 'Review strictly.' }],
    })
  })

  it('addresses one member by display name and another by teammate target', () => {
    const stored: TeamPreset = { ...STORED, members: [slot({ name: 'Reviewer', description: 'a' }), slot({ name: '评审', description: 'b' })] }
    const byName = editTeamPreset(stored, { members: [{ member: 'Reviewer', description: 'first' }] })
    const byTarget = editTeamPreset(stored, { members: [{ member: 'member-2', description: 'second' }] })
    expect(byName.ok && byName.team.members[0]?.description).toBe('first')
    expect(byTarget.ok && byTarget.team.members[1]?.description).toBe('second')
  })

  it('never mutates the preset it was given', () => {
    const before = JSON.stringify(STORED)
    editTeamPreset(STORED, { description: 'changed', members: [{ member: 'reviewer', description: 'changed' }] })
    expect(JSON.stringify(STORED)).toBe(before)
  })

  it('reports no change when every supplied value already matches', () => {
    const result = editTeamPreset(STORED, {
      description: 'release reviews',
      captainDescription: 'leads the release review',
      members: [{ member: 'reviewer', description: 'checks diffs' }],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.changed).toEqual([])
    expect(result.team).toEqual(STORED)
  })

  it('refuses an unknown member and names the available targets', () => {
    const result = editTeamPreset(STORED, { members: [{ member: 'auditor', description: 'audits' }] })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.message).toContain('unknown Team member "auditor"')
    expect(result.message).toContain('reviewer')
  })

  it('refuses a member description the teammate roster cannot spawn', () => {
    const result = editTeamPreset(STORED, { members: [{ member: 'reviewer', description: 'x'.repeat(MEMBER_DESCRIPTION_LIMIT + 1) }] })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.message).toContain(`at most ${String(MEMBER_DESCRIPTION_LIMIT)}`)
  })

  it('accepts a member description exactly at the roster limit', () => {
    const result = editTeamPreset(STORED, { members: [{ member: 'reviewer', description: 'x'.repeat(MEMBER_DESCRIPTION_LIMIT) }] })
    expect(result.ok).toBe(true)
  })

  it('refuses a call that names no editable field', () => {
    const result = editTeamPreset(STORED, {})
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.message).toContain('no editable field was supplied')
  })
})

describe('promptTemplateFailure', () => {
  const VARIABLES = { provider: 'mock', model: 'mock', cwd: undefined }

  it('accepts literal prose and every resolvable group', () => {
    expect(promptTemplateFailure('You lead the release review.', VARIABLES)).toBeUndefined()
    expect(promptTemplateFailure('Run on {{provider}} {{model}}.', VARIABLES)).toBeUndefined()
    expect(promptTemplateFailure('Braces like {"a": 1} and 50% are prose.', VARIABLES)).toBeUndefined()
  })

  it('reports an unknown variable with the registered names', () => {
    const failure = promptTemplateFailure('Use {{locale}} here.', VARIABLES)
    expect(failure).toContain('unknown prompt variable "{{locale}}"')
    expect(failure).toContain('provider, model, cwd')
  })

  it('reports a registered variable that has no value for this assembly', () => {
    expect(promptTemplateFailure('Work in {{cwd}}.', VARIABLES)).toContain('has no value for this Session')
  })

  it('reports a malformed group, and reads a lone open brace as prose', () => {
    expect(promptTemplateFailure('Use {{Not-A-Name}}.', VARIABLES)).toContain('malformed prompt variable reference')
    // No later `}}` closes the group, so the registry reads it as literal text.
    expect(promptTemplateFailure('Use {{locale} here.', VARIABLES)).toBeUndefined()
    expect(promptTemplateFailure('Use {{locale} and {{model}}.', VARIABLES)).toContain('malformed prompt variable reference')
  })
})
