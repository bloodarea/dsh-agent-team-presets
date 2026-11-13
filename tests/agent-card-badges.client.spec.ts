/** Optional target services activate and withdraw only their own badge contribution. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import type { ComponentType } from 'react'
import { registerAgentCardBadgeAdapters, showsPresetBadge } from '../src/client/agent-card-badges.tsx'
import type { AgentCardBadgeProps, AgentCardBadgeRegistry } from '../src/client/agent-card-badges.tsx'
import { en } from '../src/client/locales.ts'

const contexts: Context[] = []
afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
})

function registry() {
  const entries = new Map<string, ComponentType<AgentCardBadgeProps>>()
  const service: AgentCardBadgeRegistry = {
    version: 1,
    register: vi.fn(entry => {
      if (entries.has(entry.id)) throw new Error('duplicate badge')
      entries.set(entry.id, entry.Component)
      return () => { if (entries.get(entry.id) === entry.Component) entries.delete(entry.id) }
    }),
  }
  return { service, entries }
}

function harness() {
  const ctx = new Context()
  contexts.push(ctx)
  ctx.provide('remote', {} as Context['remote'])
  ctx.provide('remote.teamPresets', { isPresetMember: async () => false } as Context['remote']['teamPresets'])
  ctx.provide('locale', { bind: () => (key: keyof typeof en) => en[key] } as Context['locale'])
  return ctx
}

const present = (target: ReturnType<typeof registry>) => expect(target.entries.size).toBe(1)
const absent = (target: ReturnType<typeof registry>) => expect(target.entries.size).toBe(0)

describe('optional agent card adapters', () => {
  it('does not wait for missing targets, and cleans pending adapters before a late installation', async () => {
    const ctx = harness()
    const dispose = registerAgentCardBadgeAdapters(ctx)
    await dispose()
    const target = registry()
    await ctx.plugin({ apply(scope) { scope.provide('contextAgentCardBadges', target.service) } })
    absent(target)
    expect(target.service.register).not.toHaveBeenCalled()
  })

  it('binds targets independently across late activation, removal, replacement, and owner disposal', async () => {
    const ctx = harness()
    const fleet = registry()
    const tasks = registry()
    const fleetPlugin = await ctx.plugin({ apply(scope) { scope.provide('contextAgentCardBadges', fleet.service) } })
    const dispose = registerAgentCardBadgeAdapters(ctx)
    await vi.waitFor(() => present(fleet))
    absent(tasks)
    const tasksPlugin = await ctx.plugin({ apply(scope) { scope.provide('betterSidebarAgentCardBadges', tasks.service) } })
    await vi.waitFor(() => present(tasks))
    await fleetPlugin.dispose()
    await vi.waitFor(() => absent(fleet))
    present(tasks)
    const replacement = registry()
    await ctx.plugin({ apply(scope) { scope.provide('contextAgentCardBadges', replacement.service) } })
    await vi.waitFor(() => present(replacement))
    expect(replacement.service.register).toHaveBeenCalledTimes(1)
    await dispose()
    absent(replacement)
    absent(tasks)
    await tasksPlugin.dispose()
  })

  it('removes both contributions when the preset plugin fiber unloads', async () => {
    const ctx = harness()
    const fleet = registry()
    const tasks = registry()
    ctx.provide('contextAgentCardBadges', fleet.service)
    ctx.provide('betterSidebarAgentCardBadges', tasks.service)
    const owner = await ctx.plugin({ apply(scope) { registerAgentCardBadgeAdapters(scope) } })
    await vi.waitFor(() => { present(fleet); present(tasks) })
    await owner.dispose()
    absent(fleet)
    absent(tasks)
  })
})

describe('card tag decision', () => {
  it('marks only a card whose own answer is positive for the Session it now shows', () => {
    expect(showsPresetBadge(undefined, 'child-1')).toBe(false)
    expect(showsPresetBadge({ sessionId: 'child-1', managed: true }, 'child-1')).toBe(true)
    expect(showsPresetBadge({ sessionId: 'child-1', managed: false }, 'child-1')).toBe(false)
    // A recycled card still carrying the previous answer must not paint the new
    // Session, and a Session id is never a prefix match.
    expect(showsPresetBadge({ sessionId: 'child-1', managed: true }, 'child-2')).toBe(false)
    expect(showsPresetBadge({ sessionId: 'child-1', managed: true }, 'child-10')).toBe(false)
  })
})
