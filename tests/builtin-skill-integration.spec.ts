/**
 * The plugin-level troubleshooting skill is registered by the real `apply`,
 * not only by its helper, and it is visible without any Team or Agent scope.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import { apply, inject } from '../src/index.ts'
import { BUILTIN_SKILL_NAME } from '../src/builtin-skill.ts'
import { mountSubagentDouble } from './fixtures/plugin-harness.ts'
import type { Config } from '../src/config.ts'

const contexts: Context[] = []
const roots: string[] = []
afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true })
})

/** Mount the services `apply` reads plus the real skill registry. */
async function setup(): Promise<{ ctx: Context; config: Config }> {
  const ctx = new Context()
  contexts.push(ctx)
  const root = await mkdtemp(join(tmpdir(), 'team-presets-builtin-skill-'))
  roots.push(root)
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SkillRegistry)
  ctx.provide('agentTeams', {})
  mountSubagentDouble(ctx, { providers: [] })
  ctx.provide('settings', {
    configure: () => () => {},
    update: async () => {},
    describe: () => [{ ns: 'agent-team-presets', revision: 0 }],
  })
  const config = {
    teams: { get: () => [] },
    selections: { get: () => [] },
    seededDefaults: { get: () => [] },
    freshProvider: 'spawn',
    forkProvider: 'fork',
    skillRoot: root,
  } satisfies Config
  return { ctx, config }
}

describe('the plugin-level troubleshooting skill through apply', () => {
  it('is visible without a Team and disappears with the plugin fiber', async () => {
    const { ctx, config } = await setup()
    const fiber = await ctx.plugin(Object.assign(
      (inner: Context) => { apply(inner, config) },
      { inject },
    ))
    await vi.waitFor(async () => {
      expect((await ctx.skills.list()).map(skill => skill.name)).toContain(BUILTIN_SKILL_NAME)
    })
    await fiber.dispose()
    expect((await ctx.skills.list()).map(skill => skill.name)).not.toContain(BUILTIN_SKILL_NAME)
  })
})
