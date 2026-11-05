/** Current tool admission and reversible Team policy lifetimes on real services. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { createScope, type Scope } from '@deepseek-ai/dsh-scope'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import Tools, { type ResolvedToolSet, type ToolExecutor } from '@deepseek-ai/dsh-tools'
import { NativeToolExecutor } from '@deepseek-ai/dsh-tool-executor-native'
import { prepareNativePresentation, readWire } from '../src/presentation.ts'
import { guardPolicy, inheritedFilter, type StrictToolPolicy } from '../src/tool-policy.ts'

const contexts: Context[] = []
afterEach(async () => { for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose() })
const custom: StrictToolPolicy = { teamId: 'strict', mode: 'custom', allow: ['read'] }

async function setup(program = false) {
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(SystemPrompt, {})
  await ctx.plugin(Tools)
  const key = {}
  let parent!: Scope
  await ctx.plugin(Object.assign((owner: Context) => { parent = createScope(owner, key) }, { inject: ['tools', 'systemPrompt'] }))
  const programExecutor: ToolExecutor = {
    describe: () => ({ schemas: [{ name: 'run_code', description: 'Program transport', parameters: {} }] }),
    execute: vi.fn(async () => ({ results: [], additionalContexts: [], concluded: false })),
  }
  parent.ctx.tools.setExecutor(program ? programExecutor : new NativeToolExecutor(parent.ctx))
  const modelSelection = { provider: 'mock', model: 'compatible' }
  const agent = { id: 'compatibility', model: { current: () => modelSelection } } as unknown as Agent
  const own = createScope(parent.ctx, agent, { parent: key })
  Object.assign(agent, { ctx: own.ctx })
  const bodies: string[] = []
  function register(name: string, ownLayer = false) {
    const registry = ownLayer ? agent.ctx.tools : ctx.tools
    registry.register({ name, description: name, parameters: {},
      output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: String(value) }] },
      execute: async () => { bodies.push(name); return name },
    })
  }
  register('read'); register('write')
  return { ctx, agent, register, bodies, modelSelection, programExecutor }
}

async function batch(ctx: Context, agent: Agent, names: readonly string[]) {
  return ctx.tools.execute({ agent, signal: new AbortController().signal,
    calls: names.map(name => ({ type: 'tool-call', id: ToolCallId(crypto.randomUUID()), name, arguments: '{}' })),
  })
}

describe('nonmutating executor preparation', () => {
  it('keeps native execution usable after applying, removing, and reapplying a custom policy', async () => {
    const h = await setup()
    for (let attempt = 0; attempt < 2; attempt++) {
      expect(await prepareNativePresentation(h.agent)).toEqual({ kind: 'already-native' })
      const disposeGuard = guardPolicy(h.agent, custom)
      const disposeFilter = h.agent.ctx.tools.restrict(inheritedFilter(h.agent, custom)!)
      expect((await batch(h.ctx, h.agent, ['read', 'write'])).results.map(row => row.result.isError)).toEqual([false, true])
      disposeFilter(); disposeGuard()
      expect((await readWire(h.agent))?.tools).toEqual(['read', 'write'])
      expect((await batch(h.ctx, h.agent, ['write'])).results[0]?.result.isError).toBe(false)
    }
  })

  it('refuses PTC without installing a tombstone or changing its inherited executor', async () => {
    const h = await setup(true)
    for (let attempt = 0; attempt < 2; attempt++) {
      expect(await prepareNativePresentation(h.agent)).toMatchObject({ kind: 'conflict', reason: expect.stringContaining('native Agent preset') })
      expect((await readWire(h.agent))?.tools).toEqual(['run_code'])
      await batch(h.ctx, h.agent, [])
    }
    expect(h.programExecutor.execute).toHaveBeenCalledTimes(2)
  })

  it('keeps an all-tools policy on the inherited PTC executor after disposal', async () => {
    const h = await setup(true)
    const dispose = guardPolicy(h.agent, { teamId: 'all', mode: 'all', allow: [] })
    dispose()
    expect((await readWire(h.agent))?.tools).toEqual(['run_code'])
  })
})

describe('conditional tool admission', () => {
  it('evaluates conditions with the captured route and always releases the admitted set', async () => {
    const h = await setup()
    const condition = vi.fn(({ modelSelection }: { modelSelection: { model: string } }) => modelSelection.model === 'compatible')
    const definition = h.ctx.tools.get('read')!
    h.ctx.tools.register({ ...definition, name: 'active' }, { when: condition })
    h.ctx.tools.register({ ...definition, name: 'inactive' }, { when: () => false })
    let admitted: ResolvedToolSet | undefined
    h.agent.ctx.systemPrompt.section({ name: 'capture', order: 1, text: context => {
      admitted = context.toolSet
      expect(context.modelSelection).toBe(h.modelSelection)
      expect(admitted?.view(h.agent).has('active')).toBe(true)
      return 'captured'
    } })
    expect((await readWire(h.agent))?.tools).toEqual(['active', 'read', 'write'])
    expect(condition).toHaveBeenCalledOnce()
    expect(admitted?.view(h.agent).size).toBe(0)
    expect(h.ctx.tools.get('inactive', h.agent)).toBeDefined()
    expect(h.ctx.tools.executable('inactive', h.agent)).toBeUndefined()
  })

  it('releases admission after failed assembly without changing executor selection', async () => {
    const h = await setup()
    let admitted: ResolvedToolSet | undefined
    const dispose = h.agent.ctx.systemPrompt.section({ name: 'broken', order: 1, text: context => {
      admitted = context.toolSet
      throw new Error('cannot render')
    } })
    expect((await prepareNativePresentation(h.agent)).kind).toBe('unknown')
    expect(admitted?.view(h.agent).size).toBe(0)
    dispose()
    expect((await batch(h.ctx, h.agent, ['write'])).results[0]?.result.isError).toBe(false)
  })
})

describe('strict execution boundaries', () => {
  it('denies own-layer mutation and provider delegation even after permissive pre-execute policy', async () => {
    const h = await setup()
    const forbidden = ['own_write', 'spawn_teammate', 'subagent', 'subagent_fork', 'workflow']
    for (const name of [...forbidden, 'skill', 'send_message']) h.register(name, true)
    const guard = guardPolicy(h.agent, custom)
    const filter = h.agent.ctx.tools.restrict(inheritedFilter(h.agent, custom)!)
    h.agent.ctx.on('tools/pre-execute', async () => ({ kind: 'allow' }))
    const result = await batch(h.ctx, h.agent, ['read', 'write', ...forbidden, 'skill', 'send_message', 'run_code'])
    expect(result.results.map(row => row.result.isError)).toEqual([false, true, true, true, true, true, true, false, false, true])
    expect(h.bodies).toEqual(['read', 'skill', 'send_message'])
    filter(); guard()
    expect((await batch(h.ctx, h.agent, ['own_write'])).results[0]?.result.isError).toBe(false)
  })
})
