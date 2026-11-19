/**
 * The category filter both Team Skill lists offer.
 *
 * The filter is a presentation concern: it classifies an asset for the reader and
 * never touches the asset, the binding, or the preset document. These checks pin
 * the two things that make it trustworthy — that every shipped skill has a real
 * category rather than falling through to "custom", and that a local override
 * stays with the skill it was copied from — plus the wiring of the two lists,
 * which are rendered from the source text the settings page actually ships.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { OFFICIAL_SKILL_IDS } from '../src/team-skills/index.ts'
import {
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  skillCategoryOf,
  type SkillCategoryId,
  en,
  zh,
} from '../src/client/locales.ts'

const libraryView = readFileSync(new URL('../src/client/TeamSkillsView.tsx', import.meta.url), 'utf8')
const memberView = readFileSync(new URL('../src/client/TeamAgentView.tsx', import.meta.url), 'utf8')

/** One asset as the page received it, reduced to what the filter reads. */
function asset(skillId: string, origin: string, officialSkillId?: string): { skillId: string; origin: string; officialSkillId?: string } {
  return officialSkillId === undefined ? { skillId, origin } : { skillId, origin, officialSkillId }
}

describe('the Team Skill category taxonomy', () => {
  it('keeps one stable menu order', () => {
    expect([...SKILL_CATEGORIES]).toEqual(['workflow', 'delivery', 'method', 'custom'])
  })

  it('names every shipped skill, so no shipped skill falls through to custom', () => {
    for (const skillId of OFFICIAL_SKILL_IDS) {
      const category = skillCategoryOf(asset(skillId, 'builtin'))
      expect(category, skillId).not.toBe('custom')
      expect([...SKILL_CATEGORIES]).toContain(category)
    }
  })

  it('classifies the three kinds of shipped work, and only those', () => {
    const byCategory = new Map<SkillCategoryId, string[]>()
    for (const skillId of OFFICIAL_SKILL_IDS) {
      const category = skillCategoryOf(asset(skillId, 'builtin'))
      byCategory.set(category, [...(byCategory.get(category) ?? []), skillId])
    }
    expect([...byCategory.keys()].sort()).toEqual(['delivery', 'method', 'workflow'])
    expect(byCategory.get('delivery')).toEqual(['github-repository-presentation', 'git-release-hygiene'])
    expect(byCategory.get('method')).toEqual(['grilling', 'research'])
    // The leader, advisor, and executor workflow skills are one family, and the
    // three professional-role workflows (UI frontend, backend architecture,
    // independent review) belong to the same kind of work: they ship together
    // and a Team re-binds them together.
    expect(byCategory.get('workflow')).toHaveLength(9)
  })

  it('keeps a local override with the skill it was copied from', () => {
    expect(skillCategoryOf(asset('git-release-hygiene', 'override', 'git-release-hygiene'))).toBe('delivery')
    expect(skillCategoryOf(asset('agent-subagent-orchestration', 'override', 'agent-subagent-orchestration'))).toBe('workflow')
  })

  it('classifies a user skill as custom, whatever it is named', () => {
    expect(skillCategoryOf(asset('my-own-skill', 'custom'))).toBe('custom')
    // A user skill that happens to reuse a shipped name is still the user's own.
    expect(skillCategoryOf(asset('grilling', 'custom'))).toBe('custom')
  })

  it('falls back to custom for an id this build did not ship', () => {
    expect(skillCategoryOf(asset('a-future-shipped-skill', 'builtin'))).toBe('custom')
  })

  it('labels every category and the empty result in both languages', () => {
    for (const id of SKILL_CATEGORIES) {
      const key = SKILL_CATEGORY_LABELS[id]
      expect(en[key], key).toBeTruthy()
      expect(zh[key], key).toBeTruthy()
    }
    expect(zh['skillsCategoryAll']).toBeTruthy()
    expect(en['skillsCategoryAll']).toBeTruthy()
    expect(zh['skillsFilterEmpty']).toBeTruthy()
    expect(en['skillsFilterEmpty']).toBeTruthy()
  })
})

describe('the filtered Team Skill lists', () => {
  it.each([
    ['the skill library', libraryView],
    ['the member assignment grid', memberView],
  ])('offers the categories as a dropdown on %s', (_name, source) => {
    expect(source).toContain('SKILL_CATEGORIES.map')
    expect(source).toContain('SKILL_CATEGORY_LABELS[id]')
    expect(source).toContain('skillsCategoryAll')
    expect(source).toContain('skillCategoryOf(asset)')
    expect(source).toContain('skillsFilterEmpty')
    // The dropdown is the control the reader picks a category with; a chip row
    // would not be one.
    expect(source).toMatch(/<select[\s\S]{0,400}SKILL_CATEGORIES\.map/)
  })

  it('keeps every single-skill rendering untouched', () => {
    // The filter decides what is listed, never how one skill is drawn.
    expect(libraryView).toContain("className={css.row}")
    expect(memberView).toContain('className={css.skillCard}')
    expect(memberView).toContain('checked={held.has(asset.id)}')
  })

  it('counts every installed skill, not the filtered subset, on the member grid', () => {
    // A filter that changes the denominator would report a role as holding fewer
    // skills than it does.
    expect(memberView).toContain('{String([...held].length)}/{String(assets.length)}')
  })
})
