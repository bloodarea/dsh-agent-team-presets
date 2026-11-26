/**
 * The deterministic local Team discovery model both surfaces share.
 *
 * The two properties that matter are that a query is explainable (it matches
 * only the discovery fields, and every hit names the fields that matched) and
 * that filtering never invents state: a search or a category change cannot
 * alter a Session's Team selection, because neither reads nor writes it.
 */

import { describe, expect, it } from 'vitest'
import { BUILTIN_TEAMS, builtinTeamDefinition } from '../src/builtin-teams.ts'
import {
  liveAssignments,
  matchTeam,
  orderedCategories,
  queryTokens,
  reconciledAssignments,
  searchTeams,
  teamOrigin,
  teamsBySeries,
  teamsInCategory,
  withNewCategory,
  withTeamCategory,
  withoutCategory,
} from '../src/team-search.ts'
import type { TeamCategory, TeamCategoryAssignment, TeamPreset } from '../src/types.ts'

/** The eleven shipped Teams as a deployment stores them. */
const SHIPPED: TeamPreset[] = BUILTIN_TEAMS.map(builtinTeamDefinition)

/** One user-created Team carrying no metadata at all. */
const OWN: TeamPreset = {
  id: 'team-own',
  name: '我的团队',
  description: '手工创建',
  captain: { name: 'lead', color: '', description: '', toolMode: 'all', tools: [], systemPrompt: 'lead' },
  members: [],
}

/** Shipped Teams plus one custom Team, in display order. */
const ALL: TeamPreset[] = [...SHIPPED, OWN]

describe('origin and series facts', () => {
  it('derives the source from the stable catalog, never from stored content', () => {
    expect(teamOrigin('builtin-lightweight')).toEqual({ source: 'builtin', series: 'classic-development' })
    expect(teamOrigin('builtin-research')).toEqual({ source: 'builtin', series: 'work-modes' })
    expect(teamOrigin('builtin-engineering-governance')).toEqual({ source: 'builtin', series: 'work-modes' })
    expect(teamOrigin('builtin-long-running')).toEqual({ source: 'builtin', series: 'classic-development' })
    expect(teamOrigin('team-own')).toEqual({ source: 'custom' })
    // A user Team that happens to be named like a shipped one is still custom,
    // because identity is the evidence.
    expect(teamOrigin('team-renamed')).toEqual({ source: 'custom' })
  })

  it('groups the two fixed series in catalog order', () => {
    const groups = teamsBySeries(ALL)
    expect(groups.map(group => group.series)).toEqual(['classic-development', 'work-modes'])
    expect(groups[0]!.teams.map(team => team.id)).toEqual(['builtin-lightweight', 'builtin-standard', 'builtin-fullstack', 'builtin-long-running'])
    expect(groups[1]!.teams).toHaveLength(7)
    // A custom Team belongs to no series group and is never dropped from the
    // unfiltered list either.
    expect(groups.flatMap(group => group.teams)).not.toContainEqual(expect.objectContaining({ id: 'team-own' }))
  })
})

describe('deterministic search', () => {
  it('splits a query into lowercase literal tokens', () => {
    expect(queryTokens('  研发   Team ')).toEqual(['研发', 'team'])
    expect(queryTokens('')).toEqual([])
  })

  it('ranks a name match first and reports the matched fields', () => {
    // "轻量" is also true of the discovery Team's notes, so the name hit must
    // win on score rather than by hiding the other honest match.
    const hit = searchTeams(SHIPPED, { query: '轻量' })
    expect(hit[0]!.teamId).toBe('builtin-lightweight')
    expect(hit[0]!.fields).toContain('name')
    expect(hit.slice(1).every(row => !row.fields.includes('name'))).toBe(true)
  })

  it('matches tags, summary, use cases, quick prompts, and notes', () => {
    const byTag = searchTeams(SHIPPED, { query: '多角色协作' })
    expect(byTag.map(row => row.teamId)).toEqual(['builtin-standard'])
    expect(byTag[0]!.fields).toContain('tags')

    const byUseCase = searchTeams(SHIPPED, { query: '全栈集成' })
    expect(byUseCase.map(row => row.teamId)).toEqual(['builtin-fullstack'])
    expect(byUseCase[0]!.fields).toContain('useCases')

    const byPrompt = searchTeams(SHIPPED, { query: '仓库展示材料' })
    expect(byPrompt.map(row => row.teamId)).toEqual(['builtin-workflow'])
    expect(byPrompt[0]!.fields).toContain('quickPrompts')

    const bySummary = searchTeams(SHIPPED, { query: '想法、需求或技术方向尚未确定' })
    expect(bySummary.map(row => row.teamId)).toEqual(['builtin-discovery'])
  })

  it('requires every whitespace token to match somewhere', () => {
    expect(searchTeams(SHIPPED, { query: '科研 实验' }).map(row => row.teamId)).toEqual(['builtin-research'])
    expect(searchTeams(SHIPPED, { query: '科研 不存在的词' })).toEqual([])
  })

  it('never matches a system prompt, tool policy, or local path', () => {
    // The prompt of the audit captain mentions 审计; searching for a phrase that
    // only occurs inside a system prompt must find nothing.
    const captainPrompt = SHIPPED.find(team => team.id === 'builtin-audit')!.captain.systemPrompt
    const probe = captainPrompt.slice(0, 12)
    expect(captainPrompt.length).toBeGreaterThan(12)
    const hits = searchTeams(SHIPPED, { query: probe })
    for (const hit of hits) expect(hit.fields).not.toContain('notes')
    // A model name or a tool name is not indexed either.
    expect(searchTeams(SHIPPED, { query: 'deepseek-chat' })).toEqual([])
    expect(searchTeams(SHIPPED, { query: 'spawn_team_member' })).toEqual([])
  })

  it('keeps configuration order between equal scores', () => {
    // "团队" appears in several names; the order must not jitter.
    const first = searchTeams(SHIPPED, { query: '团队' }).map(row => row.teamId)
    const second = searchTeams(SHIPPED, { query: '团队' }).map(row => row.teamId)
    expect(first).toEqual(second)
    expect(first.length).toBeGreaterThan(1)
  })

  it('returns everything for an empty query, in configuration order', () => {
    expect(searchTeams(ALL, {}).map(row => row.teamId)).toEqual(ALL.map(team => team.id))
    expect(searchTeams(ALL, { query: '   ' }).map(row => row.teamId)).toEqual(ALL.map(team => team.id))
  })

  it('matches a Team with no metadata by name alone', () => {
    const hit = searchTeams(ALL, { query: '我的团队' })
    expect(hit.map(row => row.teamId)).toEqual(['team-own'])
    expect(hit[0]!.fields).toEqual(['name'])
  })

  it('composes the source filter with the query', () => {
    expect(searchTeams(ALL, { query: '团队', source: 'custom' }).map(row => row.teamId)).toEqual(['team-own'])
    expect(searchTeams(ALL, { source: 'builtin' }).every(row => row.teamId.startsWith('builtin-'))).toBe(true)
    expect(searchTeams(ALL, { source: 'all' })).toHaveLength(ALL.length)
  })

  it('composes the series filter with the query', () => {
    expect(searchTeams(ALL, { series: 'classic-development' })).toHaveLength(4)
    expect(searchTeams(ALL, { series: 'work-modes', query: '审计' }).map(row => row.teamId)).toEqual(['builtin-audit'])
  })
})

describe('user categories', () => {
  const company: TeamCategory = { id: 'cat-company', name: '公司项目', order: 0 }
  const personal: TeamCategory = { id: 'cat-personal', name: '个人', order: 1 }

  it('assigns one Team to one category and replaces a previous assignment', () => {
    const assigned = withTeamCategory([], 'builtin-standard', company.id)
    expect(assigned).toEqual([{ teamId: 'builtin-standard', categoryId: company.id }])
    expect(withTeamCategory(assigned, 'builtin-standard', personal.id)).toEqual([
      { teamId: 'builtin-standard', categoryId: personal.id },
    ])
    expect(withTeamCategory(assigned, 'builtin-standard', undefined)).toEqual([])
  })

  it('filters by category and lists the uncategorized Teams', () => {
    const assignments: TeamCategoryAssignment[] = [
      { teamId: 'builtin-standard', categoryId: company.id },
      { teamId: 'team-own', categoryId: company.id },
    ]
    expect(teamsInCategory(ALL, assignments, company.id).map(team => team.id)).toEqual(['builtin-standard', 'team-own'])
    expect(searchTeams(ALL, { category: company.id }, assignments).map(row => row.teamId))
      .toEqual(['builtin-standard', 'team-own'])
    const uncategorized = searchTeams(ALL, { category: 'uncategorized' }, assignments).map(row => row.teamId)
    expect(uncategorized).not.toContain('builtin-standard')
    expect(uncategorized).not.toContain('team-own')
    expect(uncategorized).toHaveLength(ALL.length - 2)
  })

  it('deletes a category without deleting any Team', () => {
    const assignments: TeamCategoryAssignment[] = [{ teamId: 'builtin-standard', categoryId: company.id }]
    const after = withoutCategory([company, personal], assignments, company.id)
    expect(after.categories).toEqual([personal])
    expect(after.assignments).toEqual([])
    // The Team is untouched by the grouping change.
    expect(ALL.map(team => team.id)).toContain('builtin-standard')
  })

  it('orders categories and appends a new one at the end', () => {
    expect(orderedCategories([personal, company]).map(row => row.id)).toEqual([company.id, personal.id])
    const grown = withNewCategory([company, personal], '  临时  ')
    expect(grown).toHaveLength(3)
    expect(grown[2]!.name).toBe('临时')
    expect(grown[2]!.order).toBe(2)
    expect(new Set(grown.map(row => row.id)).size).toBe(3)
  })

  it('requires both sides of an assignment to exist', () => {
    const assignments: TeamCategoryAssignment[] = [
      { teamId: 'builtin-standard', categoryId: company.id },
      { teamId: 'builtin-audit', categoryId: 'cat-gone' },
      { teamId: 'team-gone', categoryId: company.id },
    ]
    expect(liveAssignments([company], ALL, assignments)).toEqual([
      { teamId: 'builtin-standard', categoryId: company.id },
    ])
    // The startup repair is more forgiving about a shipped identity, so the
    // group survives while the preset is deleted and a restore returns it there.
    const stored: TeamCategoryAssignment[] = [
      { teamId: 'builtin-standard', categoryId: company.id },
      { teamId: 'builtin-audit', categoryId: company.id },
      { teamId: 'team-gone', categoryId: company.id },
    ]
    expect(reconciledAssignments([company], ALL.filter(team => team.id !== 'builtin-audit'), stored)).toEqual([
      { teamId: 'builtin-standard', categoryId: company.id },
      { teamId: 'builtin-audit', categoryId: company.id },
    ])
    // A category that no longer exists is always dead, whichever Team it names.
    expect(reconciledAssignments([], ALL, [{ teamId: 'builtin-audit', categoryId: 'cat-gone' }])).toEqual([])
  })
})

describe('matching one Team directly', () => {
  it('reports no match when a token is absent and full score when it is present', () => {
    const team = SHIPPED[0]!
    expect(matchTeam(team, ['轻量'])).toMatchObject({ fields: ['name'] })
    expect(matchTeam(team, ['no-such-token'])).toBeUndefined()
    expect(matchTeam(team, [])).toEqual({ score: 0, fields: [] })
  })
})
