/** The plugin-level troubleshooting skill is global, not a Team Skill. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import { OFFICIAL_SKILL_IDS } from '../src/team-skills/index.ts'
import {
  BUILTIN_SKILL_CONTENT,
  BUILTIN_SKILL_NAME,
  registerBuiltinSkill,
} from '../src/builtin-skill.ts'

const contexts: Context[] = []
afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
})

describe('the plugin built-in skill', () => {
  it('is a global host skill, not one of the private Team Skill assets', () => {
    expect(OFFICIAL_SKILL_IDS).not.toContain(BUILTIN_SKILL_NAME)
  })

  it('registers on the global layer once the skill service is composed', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    await ctx.plugin(SkillRegistry)
    const fiber = await ctx.plugin(Object.assign(
      (inner: Context) => { registerBuiltinSkill(inner) },
      { inject: [] },
    ))

    await vi.waitFor(async () => {
      expect((await ctx.skills.list()).map(skill => skill.name)).toContain(BUILTIN_SKILL_NAME)
    })
    const skill = await ctx.skills.get(BUILTIN_SKILL_NAME)
    expect(skill?.description).toContain('dsh-agent-team-presets')
    expect(skill?.content).toBe(BUILTIN_SKILL_CONTENT)
    expect(skill?.source).toBe('runtime')
    expect(skill?.provider).toBe('runtime')
    // The guide carries the evidence rules that distinguish a real route from
    // an inherited display value.
    expect(skill?.content).toContain('model/selection')
    expect(skill?.content).toContain('request/header')
    expect(skill?.content).toContain('configuredRoute')
    expect(skill?.content).toContain('不能作为模型路由证据')
    expect(skill?.content).toContain('list_agents')
    expect(skill?.content).toContain('实际运行正确')

    // Unloading the plugin activation removes the skill with it.
    await fiber.dispose()
    expect((await ctx.skills.list()).map(skill => skill.name)).not.toContain(BUILTIN_SKILL_NAME)
  })

  it('does not require the optional skill service to activate the plugin', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    const fiber = await ctx.plugin(Object.assign(
      (inner: Context) => { registerBuiltinSkill(inner) },
      { inject: [] },
    ))
    await new Promise<void>(resolve => { setTimeout(resolve, 0) })
    expect(ctx.get('skills')).toBeUndefined()
    await fiber.dispose()
  })
})
