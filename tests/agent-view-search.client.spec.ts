/**
 * The keyword boxes the Team editor offers, and what they are allowed to change.
 *
 * Two long pick-lists became typeable: the tool allow-list (custom tool mode) and
 * the Team Skill assignment grid. A search box on a page that writes state is the
 * risky part, so this file pins the boundary rather than the pixels: the box
 * filters what is SHOWN, and no group action can reach a selection the keyword
 * happens to hide. A browser pass remains the proof of how the boxes look.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { en, zh } from '../src/client/locales.ts'

const agentView = readFileSync(new URL('../src/client/TeamAgentView.tsx', import.meta.url), 'utf8')
const sectionCss = readFileSync(new URL('../src/client/TeamPresetsSection.module.css', import.meta.url), 'utf8')

/** The body of one CSS rule, or `undefined` when the rule is absent. */
function cssRule(name: string): string | undefined {
  return new RegExp(`\\.${name}\\s*\\{([^}]*)\\}`).exec(sectionCss)?.[1]
}

describe('the tool allow-list keyword box', () => {
  it('is offered only in custom mode, above the tool groups', () => {
    // It must sit inside the custom-mode branch: a reader on the default policy
    // has no list to search, and an always-visible box would search nothing.
    const customBranch = agentView.slice(agentView.indexOf('{customTools ? ('), agentView.indexOf('<span className={css.hint}>{t(\'toolsAllHint\')}'))
    expect(customBranch).toContain('css.search')
    expect(customBranch).toContain("t('toolsSearch')")
    // The matching itself is computed above the JSX, from the box's tokens.
    expect(agentView).toContain('matchKeyword(toolTokens,')
    expect(agentView.indexOf('matchKeyword(toolTokens,')).toBeLessThan(agentView.indexOf('{customTools ? ('))
    // The groups render after the box, so the keyword narrows what is below it.
    expect(customBranch.indexOf('css.search')).toBeLessThan(customBranch.indexOf('filteredToolGroups.map'))
  })

  it('matches by name, description, and the group a tool is listed under', () => {
    expect(agentView).toContain('[tool.name, tool.description, group.label]')
  })

  it('keeps a matched group open, so a match is never folded away', () => {
    expect(agentView).toContain('const expanded = searchingTools || expandedGroups.includes(group.key)')
  })

  it('reports an empty result instead of an empty group list', () => {
    expect(agentView).toContain("t('toolsSearchEmpty')")
    expect(zh['toolsSearchEmpty'].trim()).not.toBe('')
    expect(en['toolsSearchEmpty'].trim()).not.toBe('')
  })

  it('leaves every tool the keyword hides at the state it already had', () => {
    // The invariant: the hidden slice of the group is carried into every write.
    expect(agentView).toContain('const hiddenSelected = group.tools')
    expect(agentView).toContain('!shownNames.has(tool.name)')
    expect(agentView).toContain('const keepOutside = (names: readonly string[]): string[] => [...outside, ...hiddenSelected, ...names, ...shownRetained]')
    // All three group actions go through it: select-all, invert, clear.
    expect(agentView.match(/keepOutside\(/g)?.length).toBeGreaterThanOrEqual(3)
  })

  it('keeps a captain-only selection a member holds, since it cannot be re-chosen', () => {
    expect(agentView).toContain('const shownRetained = shown')
    expect(agentView).toContain('const clearableInShown = shown')
    // Clear is gated on the clearable slice, not on every chosen tool in the group.
    expect(agentView).toContain('disabled={disabled || clearableInShown === 0}')
  })

  it('counts what the group shows while a keyword is active', () => {
    expect(agentView).toContain('chosenInShown')
    expect(agentView).toContain('chosenInGroup')
  })

  it('makes the card\'s own select-all and clear follow the keyword too', () => {
    // The card row above the groups is the other whole-list action, and it must
    // obey the same rule: a keyword narrows what it writes, never the catalogue.
    expect(agentView).toContain('const shownToolChoices = filteredToolGroups.flatMap(entry => entry.shown)')
    expect(agentView).toContain('disabled={disabled || !toolsReady || shownToolChoices.length === 0}')
    expect(agentView).toContain('...agent.tools.filter(name => !inside.has(name)),')
  })
})

describe('the Team Skill assignment grid keyword box', () => {
  it('sits above the category menu, as the reader asked', () => {
    const grid = agentView.slice(agentView.indexOf('function SkillAssignmentGrid'), agentView.indexOf('/**\n * Render one agent\'s page.'))
    expect(grid).toContain('css.search')
    expect(grid).toContain("t('skillsAssignSearch')")
    // Above, not below: the keyword is the cheaper narrowing of the two.
    expect(grid.indexOf('css.search')).toBeLessThan(grid.indexOf('SKILL_CATEGORIES.map'))
  })

  it('matches a skill by its label, its stored id, and its description', () => {
    const grid = agentView.slice(agentView.indexOf('function SkillAssignmentGrid'), agentView.indexOf("/**\n * Render one agent's page."))
    expect(grid).toContain('skillLabel(asset.skillId, props.t)')
    expect(grid).toContain('asset.skillId')
    expect(grid).toContain('asset.description')
    expect(grid).toContain('keywordTokens(query)')
  })

  it('still counts every installed skill in the heading, not the filtered subset', () => {
    expect(agentView).toContain('{String([...held].length)}/{String(assets.length)}')
  })

  it('distinguishes a filtered-out grid from an empty library', () => {
    // Three filters stack now, so the empty state names the fact that something
    // is filtering rather than blaming the category alone.
    expect(agentView).toContain('const narrowing = category !== \'all\' || binding !== \'all\' || tokens.length > 0')
    expect(agentView).toContain("{narrowing ? props.t('skillsFilterNoMatch') : props.t('skillsFilterEmpty')}")
    for (const key of ['skillsFilterNoMatch', 'skillsFilterEmpty', 'skillsAssignSearch', 'skillsAssignSearchEmpty']) {
      expect(zh[key].trim(), key).not.toBe('')
      expect(en[key].trim(), key).not.toBe('')
    }
  })

  it('never lets a checkbox write anything but the assignment it stands for', () => {
    // The grid writes through the controller; a filter must not appear there.
    expect(agentView).toContain('props.controller.assignSkill(props.teamId, props.roleId, asset.id)')
    expect(agentView).toContain('props.controller.unassignSkill(props.teamId, props.roleId, asset.id)')
  })
})

describe('the filter stack spacing', () => {
  it('separates the keyword box from the menus, so they no longer touch', () => {
    const stack = /\.skillFilters\s*\{([^}]*)\}/.exec(sectionCss)?.[1]
    expect(stack, 'the assignment grid needs a .skillFilters rule').toBeDefined()
    // The panel lays its children out as plain blocks, so the gap has to come
    // from this wrapper: a column with a real gap is what stops the box and the
    // menu from being flush against each other.
    expect(stack).toContain('display: flex')
    expect(stack).toContain('flex-direction: column')
    expect(stack).toContain('gap: 8px')
    const menus = /\.skillFilterMenus\s*\{([^}]*)\}/.exec(sectionCss)?.[1]
    expect(menus, 'the two menus need their own row').toBeDefined()
    expect(menus).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
    expect(menus).toContain('gap: 8px')
  })

  it('wraps the two menus in that row instead of stacking them flush', () => {
    expect(agentView).toContain('className={css.skillFilters}')
    expect(agentView).toContain('className={css.skillFilterMenus}')
    // Both menus live inside the row, and the keyword box does not.
    const row = agentView.slice(agentView.indexOf('css.skillFilterMenus'), agentView.indexOf("{narrowing ? props.t('skillsFilterNoMatch')"))
    expect(row).toContain("t('skillsCategoryAll')")
    expect(row).toContain("t('skillsFilterBinding')")
    const head = agentView.slice(agentView.indexOf('css.skillFilters'), agentView.indexOf('css.skillFilterMenus'))
    expect(head).toContain('css.search')
  })
})

describe('the keyword box rule', () => {
  it('exists, so the box is not an unstyled native input', () => {
    const rule = cssRule('search')
    expect(rule, 'the agent page needs a .search rule').toBeDefined()
    expect(rule).toContain('border')
    expect(rule).toContain('background')
    expect(rule).toContain('var(--dsw-specific-input-major)')
  })

  it('does not overflow its card', () => {
    const rule = cssRule('search')
    expect(rule).toContain('box-sizing: border-box')
    expect(rule).toContain('min-width: 0')
  })
})
