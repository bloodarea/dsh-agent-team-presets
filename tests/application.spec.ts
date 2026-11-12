/** Team application rejects invalid captain permissions without leaving registrations. */
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import type { SubagentActivationSpec } from '@deepseek-ai/dsh-subagent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { SessionId } from '@deepseek-ai/dsh-session'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { createScope } from '@deepseek-ai/dsh-scope'
import type { Scope } from '@deepseek-ai/dsh-scope'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { applyTeamToAgent } from '../src/application.ts'
import { MemberRuntime } from '../src/member-runtime.ts'
import { mountMemberStorage } from './fixtures/member-storage.ts'
import { acceptedActivation, subagentServiceDouble } from './fixtures/plugin-harness.ts'
import type { TeamAgentPreset, TeamPreset } from '../src/types.ts'
import { executeTool } from './fixtures/execute-tool.ts'

const signal = new AbortController().signal
const temporary: string[] = []

afterEach(async () => {
  for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true })
})

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
  return await executeTool(ctx, { callId: ToolCallId(`${name}-call`), name, arguments: args, agent, signal })
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
        tools: { restrict, guard: () => () => {}, presentAs: () => () => {}, get: () => undefined },
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

  it('custom-empty members keep an empty allow-list independently of the captain', async () => {
    const ctx = new Context()
    await mountAgentLoopTestDependencies(ctx)
    // Creation admission reads the depth cap from `subagents` before it writes
    // anything durable; without it the member tool refuses instead of running.
    await ctx.plugin(AgentLoop, { agents: [] })
    const storeRoot = await mkdtemp(join(tmpdir(), 'team-presets-application-store-'))
    temporary.push(storeRoot)
    const storage = await mountMemberStorage(ctx, storeRoot)
    // The Team request no longer carries the member's configuration: the
    // durable snapshot does, and the serial creation edge installs it. The
    // request must therefore carry ONLY official fields.
    const startActivation = vi.fn(async (options: SubagentActivationSpec) => {
      expect(options).toMatchObject({ name: 'reviewer', provider: 'fresh', delivery: 'parent' })
      expect(options.childId).toBeDefined()
      expect(options).not.toHaveProperty('persona')
      expect(options).not.toHaveProperty('toolFilter')
      return acceptedActivation(options)
    })
    ctx.provide('subagents', subagentServiceDouble({ startActivation }))
    ctx.provide('agentTeams', {})
    const memberTool = fixtureTool('member-only-global-tool', () => 'unexpected')
    // Creation admission reads the official delegation depth of the calling
    // Agent, so this fixture models an ordinary top-level Session at depth 0
    // rather than a bare id that the official helper cannot read.
    const agent = (await ctx.agents.create({
      sessionId: SessionId('captain-with-member-tool'),
      agentOptions: { provider: 'fixture', model: 'fixture' },
    })).agent
    let scope!: Scope
    const scopeFiber = await ctx.plugin(Object.assign(
      (root: Context) => { scope = createScope(root, agent) },
      { inject: ['tools', 'systemPrompt'] },
    ))
    scope.ctx.tools.register(memberTool)
    Object.assign(agent, { ctx: scope.ctx })
    // The member runtime owns the durable snapshot the creation edge installs.
    const members = new MemberRuntime(ctx)
    const application = applyTeamToAgent(
      ctx, agent, preset(['spawn_team_member'], 'custom', [member([])]), { fresh: 'fresh', fork: 'fork' }, undefined, members,
    )
    expect(ctx.tools.schemas(agent).map(tool => tool.name)).toContain('member-only-global-tool')
    const result = await execute(ctx, agent, 'spawn_team_member', { member: 'reviewer', task: 'review' })
    expect(result.isError, JSON.stringify(result.content)).toBe(false)
    expect(startActivation).toHaveBeenCalledOnce()
    // The member's own policy is frozen, not the captain's and not the team's.
    const unit = await storage.readUnit()
    const records = Object.values((unit?.tables as Record<string, Record<string, unknown>>)?.members ?? {})
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      memberName: 'reviewer',
      policy: { mode: 'custom', allow: [] },
      lifecycle: 'intent',
    })
    expect((records[0] as { persona: string }).persona).toContain('You are "reviewer"')
    application.dispose()
    await members.close()
    await scope.dispose()
    await scopeFiber.dispose()
    await ctx.fiber.dispose()
  })
})
