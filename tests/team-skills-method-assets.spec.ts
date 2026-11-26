import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { OFFICIAL_SKILL_IDS, OFFICIAL_SKILL_VERSION } from '../src/team-skills/index.ts'
import { parseSkillFrontmatter } from '../src/team-skills/import.ts'

const METHOD_SKILLS = ['grilling', 'research'] as const
const UPSTREAM_COMMIT = '5beb35b040e3de97e54fa9e386d7e42d15c295c2'

function readAsset(id: string): string {
  return readFileSync(new URL(`../assets/skills/${id}/SKILL.md`, import.meta.url), 'utf8')
}

describe('the shipped method skills', () => {
  it.each(METHOD_SKILLS)('ships %s with its upstream body and the DSH adaptation', (id) => {
    const text = readAsset(id)
    const frontmatter = parseSkillFrontmatter(text)
    expect(frontmatter?.name).toBe(id)
    expect(frontmatter?.description.trim()).not.toBe('')
    expect(text).toContain('## 在 DSH 团队中的用法')
    expect(text).toContain('## 来源与许可')
    expect(text).toContain(UPSTREAM_COMMIT)
    expect(text).toContain('MIT License')
    expect(text).toContain('DSH 适配版')
    const english = id === 'grilling' ? ['design tree', 'frontier'] : ['primary sources', 'background agent']
    for (const phrase of english) expect(text).toContain(phrase)
    expect(text.indexOf('## 在 DSH 团队中的用法')).toBeGreaterThan(text.indexOf(english[0]!))
  })

  it('registers both method skills and ships their third-party notice', () => {
    expect(OFFICIAL_SKILL_VERSION).toBe('7')
    expect([...OFFICIAL_SKILL_IDS]).toEqual([
      'agent-leader-communication',
      'leader-medium-task-workflow',
      'leader-long-task-orchestration',
      'leader-worker-continuity',
      'agent-subagent-orchestration',
      'fullstack-advisor',
      'executor-short-task-workflow',
      'github-repository-presentation',
      'git-release-hygiene',
      'frontend-engineering-workflow',
      'backend-architecture-workflow',
      'independent-code-review-workflow',
      'grilling',
      'research',
    ])
    for (const id of METHOD_SKILLS) {
      expect(readdirSync(new URL(`../assets/skills/${id}`, import.meta.url))).toEqual(['SKILL.md'])
    }
    const notice = readFileSync(new URL('../NOTICE', import.meta.url), 'utf8')
    expect(notice).toContain('Matt Pocock')
    expect(notice).toContain(UPSTREAM_COMMIT)
    expect(notice).toContain('Permission is hereby granted')
    const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { files?: string[] }
    expect(manifest.files).toContain('NOTICE')
    expect(manifest.files).toContain('assets/skills')
  })
})
