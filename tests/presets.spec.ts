/** Behaviour of the pure Team preset helpers both build faces share. */

import { describe, expect, it } from 'vitest'
import {
  captainBriefing, findMember, findTeam, memberBriefing, memberTarget, memberTargets, selectedTeam, toolMode, withSelection,
} from '../src/presets.ts'
import type { TeamAgentPreset, TeamCaptainPreset, TeamPreset } from '../src/types.ts'

/** One member slot with only the fields a test exercises. */
function agent(name: string, description = ''): TeamAgentPreset {
  return {
    name,
    color: '',
    description,
    provider: '',
    model: '',
    reasoningEffort: '',
    tools: [],
    systemPrompt: '',
  }
}

/** One captain slot with only the fields a test exercises. */
function captain(name: string): TeamCaptainPreset {
  return { name, color: '', description: '', tools: [], systemPrompt: '' }
}

/** One Team preset with the supplied members. */
function team(members: TeamAgentPreset[]): TeamPreset {
  return { id: 'team-1', name: 'T', description: '', captain: captain('captain'), members }
}

describe('toolMode', () => {
  it('uses explicit modes and infers legacy mode from the saved list', () => {
    expect(toolMode({ ...agent('default'), toolMode: 'all' })).toBe('all')
    expect(toolMode({ ...agent('empty'), toolMode: 'custom' })).toBe('custom')
    expect(toolMode({ ...agent('configured'), tools: ['read'] })).toBe('custom')
    expect(toolMode(agent('empty'))).toBe('all')
  })
})

describe('memberTarget', () => {
  it('keeps a name the Agent Teams service accepts', () => {
    expect(memberTarget(agent('reviewer'), 0, new Set())).toBe('reviewer')
  })

  it('transliterates a display name the service refuses', () => {
    expect(memberTarget(agent('审查者'), 1, new Set())).toBe('member-2')
  })

  it('never hands a teammate the reserved lead target', () => {
    expect(memberTarget(agent('lead'), 0, new Set())).toBe('member-1')
  })

  it('disambiguates a repeated target', () => {
    const used = new Set<string>(['reviewer'])
    expect(memberTarget(agent('reviewer'), 1, used)).toBe('reviewer-2')
  })
})

describe('memberTargets', () => {
  it('numbers the targets by declared order', () => {
    expect(memberTargets(team([agent('审查者'), agent('builder')])).map(entry => entry.target))
      .toEqual(['member-1', 'builder'])
  })
})

describe('findMember', () => {
  it('resolves by display name and by target, carrying the summoned target', () => {
    const preset = team([agent('审查者')])
    expect(findMember(preset, '审查者')).toMatchObject({ target: 'member-1' })
    expect(findMember(preset, 'member-1')?.member.name).toBe('审查者')
  })

  it('reports an unknown name', () => {
    expect(findMember(team([agent('builder')]), 'reviewer')).toBeUndefined()
  })
})

describe('withSelection', () => {
  it('adds, replaces, and clears one Session record', () => {
    const added = withSelection([], 's1', 'team-1')
    expect(added).toEqual([{ sessionId: 's1', teamId: 'team-1' }])
    expect(withSelection(added, 's1', 'team-2')).toEqual([{ sessionId: 's1', teamId: 'team-2' }])
    expect(withSelection(added, 's1', undefined)).toEqual([])
    expect(withSelection(added, 's2', 'team-2')).toHaveLength(2)
  })
})

describe('selectedTeam', () => {
  it('resolves the Team one Session selected', () => {
    const preset = team([])
    expect(selectedTeam([preset], [{ sessionId: 's1', teamId: 'team-1' }], 's1')).toBe(preset)
    expect(selectedTeam([preset], [], 's1')).toBeUndefined()
    expect(findTeam([preset], 'team-1')).toBe(preset)
  })
})

describe('captainBriefing', () => {
  it('names every summonable target with its description', () => {
    const text = captainBriefing(team([agent('builder', 'owns the build')]))
    expect(text).toContain('Team preset "T" is active')
    expect(text).toContain('- builder: owns the build')
  })

  it('keeps a display name whose target had to be transliterated', () => {
    const text = captainBriefing(team([agent('审查者', 'checks diffs')]))
    expect(text).toContain('- member-1 (审查者): checks diffs')
  })

  it('omits the description separator for a member without one', () => {
    const text = captainBriefing(team([agent('builder')]))
    expect(text).toContain('- builder')
    expect(text).not.toContain('- builder:')
  })

  it('states what the Team is for when it has a description', () => {
    const preset: TeamPreset = { ...team([agent('builder')]), description: 'Ships one feature' }
    expect(captainBriefing(preset)).toContain('Team preset "T" is active for this Session: Ships one feature')
  })

  it('states the captain its own configured role', () => {
    const preset: TeamPreset = { ...team([]), captain: { ...captain('team-lead'), description: '你是队长' } }
    expect(captainBriefing(preset)).toContain('You are its captain "team-lead": 你是队长')
  })

  it('states a captain name that carries no description', () => {
    expect(captainBriefing({ ...team([]), captain: captain('team-lead') }))
      .toContain('You are its captain "team-lead".')
  })

  it('adds nothing for a Team whose captain states nothing and which has no members', () => {
    expect(captainBriefing({ ...team([]), captain: captain('') })).toBe('')
  })

  it('falls back to the Team identity when it has no name', () => {
    const preset: TeamPreset = { ...team([]), name: '', description: 'Ships one feature' }
    expect(captainBriefing(preset)).toContain('Team preset "team-1" is active for this Session: Ships one feature')
  })
})

describe('memberBriefing', () => {
  it('states the Team it joined, its own role, and its system prompt', () => {
    const preset: TeamPreset = { ...team([]), name: '测试团队', description: '测试一下' }
    const member: TeamAgentPreset = { ...agent('ui-designer', 'ui设计师测试'), systemPrompt: '测试ui工程师' }
    expect(memberBriefing(preset, member, 'ui-designer'))
      .toBe('You are "ui-designer" on the Agent Team "测试团队": 测试一下\n\nYour role: ui设计师测试\n\n测试ui工程师')
  })

  it('names the display name when the target had to be transliterated', () => {
    expect(memberBriefing(team([]), agent('审查者', 'checks diffs'), 'member-1'))
      .toContain('You are "member-1" (审查者) on the Agent Team "T".')
  })

  it('omits the role line for a member without a description', () => {
    expect(memberBriefing(team([]), agent('builder'), 'builder'))
      .toBe('You are "builder" on the Agent Team "T".')
  })
})
