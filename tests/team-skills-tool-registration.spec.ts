/**
 * The Team Skill tools reach a real Agent scope: composed with the Agent loop,
 * the four names must appear in the effective tool wire, and a teammate scope
 * must not receive them.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { executeTool } from './fixtures/execute-tool.ts'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { TeamSkillManager } from '../src/team-skills/manager.ts'
import { TeamSkillStore } from '../src/team-skills/store.ts'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { registerTeamSkillTools } from '../src/team-skills/tools.ts'

const roots: string[] = []
const contexts: Context[] = []
afterEach(async () => {
  for (const ctx of contexts.splice(0)) await ctx.fiber.dispose()
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true })
})

describe('the Team Skill tool registration', () => {
  it('puts the four tools into the effective wire of the Session root', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    await mountAgentLoopTestDependencies(ctx)
    await ctx.plugin(AgentLoop, { agents: [] })
    const root = await mkdtemp(join(tmpdir(), 'team-skill-tool-reg-'))
    roots.push(root)
    const store = new TeamSkillStore(root)
    await store.open()
    const manager = new TeamSkillManager(store, root, {
      teams: () => [], activeAssetIds: () => new Set(), activeSessions: () => [],
    })
    await manager.open()
    const lead = (await ctx.agents.create({ sessionId: 'lead' as never, agentOptions: { provider: 'mock', model: 'mock' } })).agent
    const dispose = registerTeamSkillTools(ctx, lead, {
      store, manager, teams: () => [], resync: () => {},
    })
    const wire = await lead.ctx.systemPrompt.assemble(assembleContextFor(lead))
    const names = wire.tools.map(tool => tool.name)
    expect(names).toContain('list_team_skills')
    expect(names).toContain('assign_team_skill')
    expect(names).toContain('unassign_team_skill')
    expect(names).toContain('remove_team_skill')
    dispose()
    const unavailable = 'Team Skills unavailable: symlink-escape at private root'
    const stop = registerTeamSkillTools(ctx, lead, {
      store, manager, teams: () => [], resync: () => {}, ready: async () => unavailable,
    })
    for (const [name, args] of [
      ['list_team_skills', {}],
      ['remove_team_skill', { skill_id: 'missing' }],
    ] as const) {
      const result = await executeTool(ctx, { callId: ToolCallId(name), name, arguments: args, agent: lead, signal: new AbortController().signal })
      const text = result.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('')
      expect(text).toContain(unavailable)
      if (name === 'remove_team_skill') expect(JSON.parse(text)).toMatchObject({ ok: false })
    }
    stop()
    const after = await lead.ctx.systemPrompt.assemble(assembleContextFor(lead))
    expect(after.tools.map(tool => tool.name)).not.toContain('list_team_skills')
  })
})
