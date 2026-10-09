/** Team application rejects invalid captain permissions without leaving registrations. */
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { createScope } from '@deepseek-ai/dsh-scope'
import type { Scope } from '@deepseek-ai/dsh-scope'
import { describe, expect, it, vi } from 'vitest'
import { applyTeamToAgent } from '../src/application.ts'
import type { TeamAgentPreset, TeamPreset } from '../src/types.ts'

const signal = new AbortController().signal

function member(tools: readonly string[], toolMode: 'all' | 'custom' = 'custom'): TeamAgentPreset {
  return {
    name: 'reviewer', color: '', description: 'reviewer', provider: '', model: '',
    reasoningEffort: '', toolMode, tools, systemPrompt: '',
  }
}

function preset(tools: readonly string[], captainToolMode: 'all' | 'custom' = 'custom', members: TeamAgentPreset[] = []): TeamPreset {
  return {
    id: 'team-1', name: 'Team', description: '', members,
    captain: {
      name: 'captain', color: '', description: '',
      toolMode: captainToolMode, tools, systemPrompt: 'Captain prompt',
    },
  }
}

function fixtureTool(name: string, execute: () => string) {
  return defineTool({
    name,
    description: name,
    parameters: {},
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute() { return execute() },
  })
}

async function execute(ctx: Context, agent: Agent, name: string, args: object = {}) {
  return await ctx.tools.execute({ callId: ToolCallId(`${name}-call`), name, arguments: args, agent, signal })
}

describe('captain tool permissions', () => {
  it('rejects an unavailable tool and rolls back the installed persona', () => {
    const disposePersona = vi.fn()
    const disposeBriefing = vi.fn()
    const restrict = vi.fn(() => { throw new Error('unknown tool: removed') })
    const agent = { id: 'captain-rolled-back' } as Agent
    Object.assign(agent, {
      ctx: {
        systemPrompt: {
          section: vi.fn()
            .mockReturnValueOnce(disposePersona)
            .mockReturnValueOnce(disposeBriefing),
          getSectionOrder: () => 0,
        },
        tools: { restrict },
      },
    })
    expect(() => applyTeamToAgent(new Context(), agent, preset(['removed']), { fresh: 'fresh', fork: 'fork' }))
      .toThrow('unknown tool: removed')
    expect(restrict).toHaveBeenCalledWith({ allow: ['removed'] })
    expect(disposePersona).toHaveBeenCalledOnce()
    expect(disposeBriefing).toHaveBeenCalledOnce()
  })

  it('denies every global tool in custom-empty mode but leaves default-all unrestricted', async () => {
    const ctx = new Context()
    await mountAgentLoopTestDependencies(ctx)
    const allowed = vi.fn(() => 'allowed')
    const globalToolFiber = await ctx.plugin(Object.assign(
      (root: Context) => { root.tools.register(fixtureTool('global-allowed', allowed)) },
      { inject: ['tools'] },
    ))
    const agent = { id: 'captain-restricted' } as Agent
    let scope!: Scope
    const scopeFiber = await ctx.plugin(Object.assign(
      (root: Context) => { scope = createScope(root, agent) },
      { inject: ['tools', 'systemPrompt'] },
    ))
    Object.assign(agent, { ctx: scope.ctx })
    const app = applyTeamToAgent(ctx, agent, preset([]), { fresh: 'fresh', fork: 'fork' })
    expect(ctx.tools.schemas(agent).map(tool => tool.name)).toEqual(['spawn_team_member'])
    expect((await execute(ctx, agent, 'global-allowed'))).toMatchObject({ isError: true })
    expect(allowed).not.toHaveBeenCalled()
    app.dispose()
    await scope.dispose()
    await scopeFiber.dispose()

    const defaultAgent = { id: 'captain-default' } as Agent
    let unrestricted!: Scope
    const unrestrictedFiber = await ctx.plugin(Object.assign(
      (root: Context) => { unrestricted = createScope(root, defaultAgent) },
      { inject: ['tools', 'systemPrompt'] },
    ))
    Object.assign(defaultAgent, { ctx: unrestricted.ctx })
    const defaultApp = applyTeamToAgent(ctx, defaultAgent, preset([], 'all'), { fresh: 'fresh', fork: 'fork' })
    expect(ctx.tools.schemas(defaultAgent).map(tool => tool.name)).toContain('global-allowed')
    expect(allowed).not.toHaveBeenCalled()
    defaultApp.dispose()
    await unrestricted.dispose()
    await unrestrictedFiber.dispose()
    await globalToolFiber.dispose()
    await ctx.fiber.dispose()
  })

  it('custom-empty members pass an empty allow-list independently of the captain', async () => {
    const ctx = new Context()
    await mountAgentLoopTestDependencies(ctx)
    const spawnTeammate = vi.fn(async (_caller: Agent, options: { toolFilter?: { allow: readonly string[] } }) => {
      expect(options.toolFilter).toEqual({ allow: [] })
      return { member: { name: 'reviewer', status: 'inactive' } }
    })
    ctx.provide('agentTeams', { spawnTeammate })
    const memberTool = fixtureTool('member-only-global-tool', () => 'unexpected')
    const agent = { id: 'captain-with-member-tool' } as Agent
    let scope!: Scope
    const scopeFiber = await ctx.plugin(Object.assign(
      (root: Context) => { scope = createScope(root, agent) },
      { inject: ['tools', 'systemPrompt'] },
    ))
    scope.ctx.tools.register(memberTool)
    Object.assign(agent, { ctx: scope.ctx })
    const application = applyTeamToAgent(ctx, agent, preset([], 'custom', [member([])]), { fresh: 'fresh', fork: 'fork' })
    expect(ctx.tools.schemas(agent).map(tool => tool.name)).toContain('member-only-global-tool')
    const result = await execute(ctx, agent, 'spawn_team_member', { member: 'reviewer', task: 'review' })
    expect(result.isError).toBe(false)
    expect(spawnTeammate).toHaveBeenCalledOnce()
    application.dispose()
    await scope.dispose()
    await scopeFiber.dispose()
    await ctx.fiber.dispose()
  })
})
