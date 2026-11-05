/** Fine-grained tool-permission matrix: what one allow-list grants, and what no allow-list can grant. */
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { createScope } from '@deepseek-ai/dsh-scope'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import * as ToolFs from '@deepseek-ai/dsh-tool-fs'
import { applyTeamToAgent } from '../src/application.ts'
import TeamPresetsToolCatalog from '../src/tool-catalog.ts'
import { SPAWN_TEAM_MEMBER_DESCRIPTION } from '../src/tool-descriptions.ts'
import { slot, team } from './fixtures/team-presets.ts'
import { executeTool } from './fixtures/execute-tool.ts'

const contexts: Context[] = []
afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
})

async function call(ctx: Context, agent: Agent, name: string, args: object = {}) {
  return executeTool(ctx, { callId: ToolCallId(crypto.randomUUID()), name, arguments: args, agent, signal: new AbortController().signal })
}

/** Text of one tool result, so a denial can be told apart from an unrelated failure. */
function resultText(result: { content: readonly { type: string; text?: string }[] }): string {
  return result.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join('')
}

/**
 * One Agent carrying own-layer probe tools plus a real inherited file tool.
 *
 * The probes make the allow-list itself observable, so a case never confuses a
 * permission decision with a filesystem detail.
 */
async function agentWithOwnTools() {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  const calls: string[] = []
  ctx.provide('fs', { writeText: async (path: string) => { calls.push(path) }, editText: async () => {} })
  const presetKey = {}
  let preset!: ReturnType<typeof createScope>
  const owner = await ctx.plugin(Object.assign((scoped: Context) => { preset = createScope(scoped, presetKey) }, { inject: ['tools', 'systemPrompt', 'fs'] }))
  await preset.ctx.plugin(ToolFs, {})
  const agent = { id: SessionId('matrix') } as Agent
  const own = createScope(owner.ctx, agent, { parent: presetKey })
  Object.assign(agent, { ctx: own.ctx })
  for (const name of ['probe_one', 'probe_two']) {
    own.ctx.tools.register({
      name,
      description: `${name} probe`,
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [{ type: 'text', text: name }] },
      async execute() { return name },
    })
  }
  await own.ctx.plugin(ToolFs, {})
  return { ctx, agent, calls, dispose: async () => { await own.dispose(); await preset.dispose() } }
}

describe('one allow-list grants exactly what it names', () => {
  it('allows the named capability and refuses every other one by name', async () => {
    const h = await agentWithOwnTools()
    applyTeamToAgent(h.ctx, h.agent, team([], { toolMode: 'custom', tools: ['probe_one'] }), { fresh: 'spawn', fork: 'fork' })
    expect((await call(h.ctx, h.agent, 'probe_one')).isError).toBe(false)
    for (const name of ['probe_two', 'write', 'edit']) {
      const denied = await call(h.ctx, h.agent, name, { file_path: '/never-touched', content: 'x', old_string: 'a', new_string: 'b' })
      expect(denied.isError, name).toBe(true)
      expect(resultText(denied), name).toContain('tool policy denies')
    }
    expect(h.calls).toEqual([])
    await h.dispose()
  })

  it('denies coordination as well when nothing is selected', async () => {
    const h = await agentWithOwnTools()
    applyTeamToAgent(h.ctx, h.agent, team([], { toolMode: 'custom', tools: [] }), { fresh: 'spawn', fork: 'fork' })
    // An empty custom list is a deliberate full denial, not "no restriction".
    for (const name of ['probe_one', 'read', 'write', 'send_message', 'spawn_team_member']) {
      expect((await call(h.ctx, h.agent, name, { file_path: '/dev/null', content: 'x', old_string: 'a', new_string: 'b' })).isError, name).toBe(true)
    }
    await h.dispose()
  })

  it('grants one capability without granting its sibling', async () => {
    const h = await agentWithOwnTools()
    applyTeamToAgent(h.ctx, h.agent, team([], { toolMode: 'custom', tools: ['probe_two'] }), { fresh: 'spawn', fork: 'fork' })
    expect((await call(h.ctx, h.agent, 'probe_two')).isError).toBe(false)
    expect((await call(h.ctx, h.agent, 'probe_one')).isError).toBe(true)
    await h.dispose()
  })

  it('refuses an allow-list naming a tool no deployment registers', async () => {
    const h = await agentWithOwnTools()
    // An unknown name must reject the application rather than widen it.
    expect(() => applyTeamToAgent(h.ctx, h.agent, team([], { toolMode: 'custom', tools: ['ghost_tool'] }), { fresh: 'spawn', fork: 'fork' }))
      .toThrow()
    await h.dispose()
  })

  it('refuses the general-purpose run_code transport even when named', async () => {
    const h = await agentWithOwnTools()
    expect(() => applyTeamToAgent(h.ctx, h.agent, team([], { toolMode: 'custom', tools: ['run_code'] }), { fresh: 'spawn', fork: 'fork' }))
      .toThrow()
    await h.dispose()
  })
})

describe('the catalog never invents a description and marks role-restricted tools', () => {
  it('describes only what it owns and flags captain-only capabilities', async () => {
    const h = await agentWithOwnTools()
    h.ctx.provide('agentPresets', { list: async () => [], acquireScope: async () => { throw new Error('unused') } })
    const catalog = await new TeamPresetsToolCatalog(h.ctx).catalog()
    const byName = new Map(catalog.tools.map(tool => [tool.name, tool]))
    // Registry tools keep their own author's description.
    expect(byName.get('read')?.description).not.toBe('')
    expect(byName.get('read')?.captainOnly).toBeUndefined()
    // Role-restricted capabilities the plugin itself registers are listed and
    // marked, so a member page cannot offer them as grantable.
    for (const name of ['spawn_team_member', 'get_team_preset', 'update_team_preset']) {
      expect(byName.get(name)?.captainOnly, name).toBe(true)
      expect((byName.get(name)?.description.length ?? 0) > 20, name).toBe(true)
    }
    // An upstream tool this fixture does not register is absent, not described
    // from here; the next case covers its marking when the registry has it.
    expect(byName.has('interrupt_agent')).toBe(false)
    // The retired fabricated fallback must not come back.
    expect(catalog.tools.some(tool => tool.description === 'Agent Team coordination or preset operation.')).toBe(false)
    // A name nothing describes is absent rather than described by guesswork.
    expect(byName.has('spawn_teammate')).toBe(false)
    await h.dispose()
  })

  it('shows one description per tool, identical to the one its definition registers', async () => {
    const h = await agentWithOwnTools()
    // Apply a Team so the spawn tool is registered exactly as a Session sees it.
    applyTeamToAgent(h.ctx, h.agent, team([], { toolMode: 'all', tools: [] }), { fresh: 'spawn', fork: 'fork' })
    const registered = h.ctx.tools.get('spawn_team_member', h.agent)?.description ?? ''
    h.ctx.provide('agentPresets', { list: async () => [], acquireScope: async () => { throw new Error('unused') } })
    const catalog = await new TeamPresetsToolCatalog(h.ctx).catalog()
    const hover = catalog.tools.find(tool => tool.name === 'spawn_team_member')?.description ?? ''
    // The settings hover tip and the model-facing definition are one text, not
    // two accounts of the same capability that can drift apart.
    expect(registered.startsWith(hover)).toBe(true)
    expect(hover).toBe(SPAWN_TEAM_MEMBER_DESCRIPTION)
    await h.dispose()
  })

  it('never replaces an upstream tool description with text of its own', async () => {
    const h = await agentWithOwnTools()
    // A registry-authored description must win verbatim: this plugin authors
    // only the tools it registers, never hover text for someone else's tool.
    const upstream = 'Ask a subagent to stop its current work.'
    h.ctx.tools.register({
      name: 'interrupt_agent',
      description: upstream,
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [{ type: 'text', text: '' }] },
      async execute() { return '' },
    })
    h.ctx.provide('agentPresets', { list: async () => [], acquireScope: async () => { throw new Error('unused') } })
    const catalog = await new TeamPresetsToolCatalog(h.ctx).catalog()
    const choice = catalog.tools.find(tool => tool.name === 'interrupt_agent')
    expect(choice?.description).toBe(upstream)
    // The role restriction is this plugin's own fact, so it still applies.
    expect(choice?.captainOnly).toBe(true)
    await h.dispose()
  })

  it('attributes only the two sources the registry can prove', async () => {
    const h = await agentWithOwnTools()
    // The Harness names an MCP tool `mcp__<server>__<name>`, so the server is a
    // deterministic attribution; an ordinary third-party name is not.
    for (const name of ['mcp__chrome-devtools-mcp__take_screenshot', 'mcp__dsh-browser__browser_click', 'third_party_tool']) {
      h.ctx.tools.register({
        name,
        description: `${name} description`,
        parameters: {},
        output: { schema: { type: 'string' }, render: () => [{ type: 'text', text: '' }] },
        async execute() { return '' },
      })
    }
    h.ctx.provide('agentPresets', { list: async () => [], acquireScope: async () => { throw new Error('unused') } })
    const catalog = await new TeamPresetsToolCatalog(h.ctx).catalog()
    const byName = new Map(catalog.tools.map(tool => [tool.name, tool]))
    expect(byName.get('mcp__chrome-devtools-mcp__take_screenshot')).toMatchObject({ source: 'mcp', server: 'chrome-devtools-mcp' })
    expect(byName.get('mcp__dsh-browser__browser_click')).toMatchObject({ source: 'mcp', server: 'dsh-browser' })
    // No registering package is recorded, so this must NOT be guessed at.
    expect(byName.get('third_party_tool')).toMatchObject({ source: 'other' })
    expect(byName.get('third_party_tool')?.server).toBeUndefined()
    // This plugin's own registrations are the other provable attribution.
    expect(byName.get('spawn_team_member')?.source).toBe('presets')
    await h.dispose()
  })
})
