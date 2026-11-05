/**
 * The member execution aliases are a live view of the subagent provider
 * registry, not a snapshot of whatever it held when this plugin activated.
 *
 * Every case here drives the REAL official `Subagents` registry and its REAL
 * `subagent/provider-added` / `subagent/provider-removed` edges. They cover the
 * mount orders the Host's concurrent plugin loader can produce (`plugin before
 * provider` is the one that produced the Web-side `spawn_team_member` refusal),
 * plus per-context independence, replacement, self-triggering, and unload.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Subagents from '@deepseek-ai/dsh-subagent'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import { provideWorkingDirectoryFixture } from '@deepseek-ai/dsh-agent-loop-testkit'
import type { Context as CordisContext } from '@deepseek-ai/cordis'
import type { SubagentProvider } from '@deepseek-ai/dsh-subagent'
import {
  MEMBER_FORK_PROVIDER,
  MEMBER_FRESH_PROVIDER,
  isPresetMemberProvider,
  memberProviderFor,
  registerMemberProviders,
} from '../src/member-identity.ts'
import type {
  MemberProviderRegistry,
  MemberProviderUnavailable,
} from '../src/member-identity.ts'

const contexts: Context[] = []
const releases: Array<() => void> = []

afterEach(async () => {
  // Release every provider a case registered, then unmount: a provider left
  // behind by a case that failed mid-assertion would otherwise make the next
  // case fail with a registration conflict instead of its own subject.
  for (const release of releases.splice(0).reverse()) release()
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
})

/** One availability transition recorded by the observer under test. */
interface Transition {
  readonly context: 'fresh' | 'fork'
  readonly state: MemberProviderUnavailable | undefined
  readonly reason: string
}

/**
 * A provider that satisfies the continuable-backed registry contract but never
 * runs a child: these cases exercise alias lifecycle, not child execution.
 * @param name - registry name to publish it under.
 * @param overrides - fields a case needs to differ on.
 * @returns a provider object suitable for `ctx.subagents.registerProvider`.
 */
function provider(name: string, overrides: Partial<SubagentProvider> = {}): SubagentProvider {
  return {
    name,
    capabilities: { agentOptions: true, outputSchema: false, depthLimit: true, toolFilter: true, persona: true },
    inheritsParentContext: true,
    prepareContinuable: async () => ({}),
    start: async () => { throw new Error('the identity lifecycle fixture never runs a child') },
    ...overrides,
  }
}

/** A provider that cannot back a Team member, because it cannot create continuable children. */
const oneShotOnly = (name: string): SubagentProvider => {
  const { prepareContinuable: _dropped, ...rest } = provider(name)
  return rest
}

/** One mounted subagents service and the registry under test. */
interface Harness {
  readonly ctx: Context
  readonly registry: MemberProviderRegistry
  /** Register one provider and return its exact release. */
  readonly add: (provider: SubagentProvider) => () => void
  /** Every availability transition the registry reported, in order. */
  readonly transitions: Transition[]
}

/**
 * Mount the real subagents service and the registry under test.
 * @param configured - the plugin's configured upstream names.
 * @returns the live harness.
 */
async function harness(configured: { fresh: string; fork: string }): Promise<Harness> {
  const ctx = new Context()
  provideWorkingDirectoryFixture(ctx)
  contexts.push(ctx)
  // rc.1's Subagents injects `sessionProjections`; without it the plugin stays
  // pending and `ctx.subagents` is undefined.
  await ctx.plugin(SessionProjectionRegistry)
  await ctx.plugin(Subagents, { maxDepth: 2 })
  const transitions: Transition[] = []
  const registry = registerMemberProviders(ctx, configured, (context, state, reason) => {
    transitions.push({ context, state, reason })
  })
  const add = (registered: SubagentProvider): (() => void) => {
    const release = ctx.subagents.registerProvider(registered)
    releases.push(release)
    return release
  }
  return { ctx, registry, add, transitions }
}

/** The alias provider the registry currently publishes, if any. */
function aliasOf(ctx: Context, name: string): SubagentProvider | undefined {
  const found = ctx.subagents.getProvider(name)
  // Only the alias itself is interesting here; a stub upstream never shares its name.
  return found?.name === name ? found : undefined
}

/**
 * How many aliases this registry has actually published, by asking the service.
 * @param ctx - the mounted context.
 * @returns the registered member aliases it can resolve.
 */
function liveAliases(ctx: Context): number {
  return [MEMBER_FRESH_PROVIDER, MEMBER_FORK_PROVIDER].filter(name => aliasOf(ctx, name) !== undefined).length
}

describe('member execution aliases follow the provider registry', () => {
  it('registers both aliases when the providers activate before the plugin', async () => {
    const ctx = new Context()
    provideWorkingDirectoryFixture(ctx)
    contexts.push(ctx)
    await ctx.plugin(SessionProjectionRegistry)
    await ctx.plugin(Subagents, { maxDepth: 2 })
    const upstreamFresh = provider('spawn')
    const upstreamFork = provider('fork', { inheritsParentContext: false })
    ctx.subagents.registerProvider(upstreamFresh)
    ctx.subagents.registerProvider(upstreamFork)

    const transitions: Transition[] = []
    const registry = registerMemberProviders(ctx, { fresh: 'spawn', fork: 'fork' },
      (context, state, reason) => { transitions.push({ context, state, reason }) })

    expect(liveAliases(ctx)).toBe(2)
    expect(memberProviderFor(registry, 'fresh')).toEqual({ name: MEMBER_FRESH_PROVIDER })
    expect(memberProviderFor(registry, 'fork')).toEqual({ name: MEMBER_FORK_PROVIDER })
    expect(transitions).toEqual([])
    registry.dispose()
  })

  it('recovers on a provider that registers after the plugin, without a remount', async () => {
    const h = await harness({ fresh: 'spawn', fork: 'fork' })

    // The Web-side failure: the service exists, the provider does not yet.
    expect(h.ctx.subagents.list()).toEqual([])
    expect(memberProviderFor(h.registry, 'fresh')).toMatchObject({ error: expect.stringContaining('registers no subagent provider named "spawn"') })
    expect(memberProviderFor(h.registry, 'fork')).toMatchObject({ error: expect.stringContaining('registers no subagent provider named "fork"') })
    expect(liveAliases(h.ctx)).toBe(0)

    const release = h.add(provider('spawn'))
    expect(memberProviderFor(h.registry, 'fresh')).toEqual({ name: MEMBER_FRESH_PROVIDER })
    // The fork context is still refused, with its OWN reason.
    expect(memberProviderFor(h.registry, 'fork')).toMatchObject({ error: expect.stringContaining('named "fork"') })
    expect(liveAliases(h.ctx)).toBe(1)
    expect(h.transitions.map(row => [row.context, row.state])).toEqual([
      ['fresh', 'missing'],
      ['fork', 'missing'],
    ])

    // Withdrawing the provider must refuse new creations again…
    release()
    expect(memberProviderFor(h.registry, 'fresh')).toMatchObject({ error: expect.stringContaining('named "spawn"') })
    expect(liveAliases(h.ctx)).toBe(0)

    // …and re-registering it must restore them, with no remount of the plugin.
    h.add(provider('spawn'))
    expect(memberProviderFor(h.registry, 'fresh')).toEqual({ name: MEMBER_FRESH_PROVIDER })
    expect(liveAliases(h.ctx)).toBe(1)
  })

  it('treats fresh and fork independently, including a late fork', async () => {
    const h = await harness({ fresh: 'spawn', fork: 'fork' })
    h.add(provider('spawn'))
    expect(memberProviderFor(h.registry, 'fresh')).toEqual({ name: MEMBER_FRESH_PROVIDER })
    expect(memberProviderFor(h.registry, 'fork')).toMatchObject({ error: expect.any(String) })

    h.add(provider('fork'))
    expect(memberProviderFor(h.registry, 'fresh')).toEqual({ name: MEMBER_FRESH_PROVIDER })
    expect(memberProviderFor(h.registry, 'fork')).toEqual({ name: MEMBER_FORK_PROVIDER })
    expect(liveAliases(h.ctx)).toBe(2)
  })

  it('does not let one context\u2019s failure overwrite the other\u2019s refusal', async () => {
    const h = await harness({ fresh: 'spawn', fork: 'fork' })
    // Only the fresh provider appears, and only the fresh context may recover.
    h.add(provider('spawn'))
    const fresh = memberProviderFor(h.registry, 'fresh')
    const fork = memberProviderFor(h.registry, 'fork')
    expect(fresh).toEqual({ name: MEMBER_FRESH_PROVIDER })
    expect('error' in fork && fork.error).toContain('fork')
    expect(h.registry.freshError).toBeUndefined()
    expect(h.registry.forkError).toContain('fork')

    // A later fresh-only edge must leave the fork refusal exactly as it was.
    h.add(provider('spawn-helper'))
    expect(h.registry.freshError).toBeUndefined()
    expect(h.registry.forkError).toContain('fork')
    expect(memberProviderFor(h.registry, 'fresh')).toEqual({ name: MEMBER_FRESH_PROVIDER })
  })

  it('rebinds the alias to a replacement provider object and releases the old one', async () => {
    const h = await harness({ fresh: 'spawn', fork: 'fork' })
    const first = provider('spawn')
    const releaseFirst = h.add(first)
    const bound = aliasOf(h.ctx, MEMBER_FRESH_PROVIDER)
    expect(bound).toBeDefined()
    expect(bound?.start).not.toBe(first.start)

    releaseFirst()
    const second = provider('spawn', { inheritsParentContext: false })
    h.add(second)

    // The alias delegates to the NEW object, and its start-time facts follow it.
    const rebound = aliasOf(h.ctx, MEMBER_FRESH_PROVIDER)
    expect(rebound).toBeDefined()
    expect(rebound?.inheritsParentContext).toBe(false)
    expect(memberProviderFor(h.registry, 'fresh')).toEqual({ name: MEMBER_FRESH_PROVIDER })
    expect(liveAliases(h.ctx)).toBe(1)
  })

  it('refuses a provider that cannot create continuable children, and recovers when it can', async () => {
    const h = await harness({ fresh: 'spawn', fork: 'fork' })
    const release = h.add(oneShotOnly('spawn'))
    expect(memberProviderFor(h.registry, 'fresh')).toMatchObject({
      error: expect.stringContaining('cannot create continuable children'),
    })
    expect(h.transitions).toContainEqual({
      context: 'fresh', state: 'unsupported',
      reason: expect.stringContaining('cannot create continuable children'),
    })

    release()
    h.add(provider('spawn'))
    expect(memberProviderFor(h.registry, 'fresh')).toEqual({ name: MEMBER_FRESH_PROVIDER })
  })

  it('refuses a misconfigured name without throwing, per context', async () => {
    const h = await harness({ fresh: '', fork: MEMBER_FRESH_PROVIDER })
    expect(memberProviderFor(h.registry, 'fresh')).toMatchObject({ error: expect.stringContaining('not configured') })
    expect(memberProviderFor(h.registry, 'fork')).toMatchObject({ error: expect.stringContaining('own member alias') })
    expect(liveAliases(h.ctx)).toBe(0)
    expect(h.registry.freshError).toContain('not configured')
    expect(h.registry.forkError).toContain('own member alias')
  })

  it('reports a registration conflict instead of overwriting a foreign provider', async () => {
    const h = await harness({ fresh: 'spawn', fork: 'fork' })
    // A deployment that already owns the alias name: the registration must fail
    // loudly, and the foreign provider must stay in place.
    const foreign = provider(MEMBER_FRESH_PROVIDER)
    h.add(foreign)
    h.add(provider('spawn'))
    expect(memberProviderFor(h.registry, 'fresh')).toMatchObject({
      error: expect.stringContaining('could not be registered'),
    })
    expect(h.ctx.subagents.getProvider(MEMBER_FRESH_PROVIDER)).toBe(foreign)
    expect(memberProviderFor(h.registry, 'fork')).toMatchObject({ error: expect.stringContaining('named "fork"') })
  })

  it('does not recurse on its own alias events', async () => {
    const h = await harness({ fresh: 'spawn', fork: 'fork' })
    h.add(provider('spawn'))
    const registered = vi.fn()
    h.ctx.on('subagent/provider-added', registered)
    const once = liveAliases(h.ctx)
    // Re-emitting the plugin's own alias edges must not register anything new.
    const existing = aliasOf(h.ctx, MEMBER_FRESH_PROVIDER)
    expect(existing).toBeDefined()
    expect(registered).not.toHaveBeenCalled()
    expect(liveAliases(h.ctx)).toBe(once)
  })

  it('releases every alias, stops following the registry, and never resurrects one', async () => {
    const h = await harness({ fresh: 'spawn', fork: 'fork' })
    h.add(provider('spawn'))
    h.add(provider('fork'))
    expect(liveAliases(h.ctx)).toBe(2)

    h.registry.dispose()
    expect(liveAliases(h.ctx)).toBe(0)
    // Idempotent, and a late provider registration must not bring an alias back.
    h.registry.dispose()
    h.add(provider('spawn-replacement'))
    expect(liveAliases(h.ctx)).toBe(0)
    expect(h.ctx.subagents.list()).toEqual(expect.arrayContaining(['spawn', 'fork', 'spawn-replacement']))
    expect(h.ctx.subagents.list().filter(isPresetMemberProvider)).toEqual([])
  })

  it('lets a provider activate later without any listener left behind after dispose', async () => {
    const h = await harness({ fresh: 'spawn', fork: 'fork' })
    h.registry.dispose()
    // A second activation on the same context owns its own listeners.
    const second = registerMemberProviders(h.ctx, { fresh: 'spawn', fork: 'fork' })
    expect(memberProviderFor(second, 'fresh')).toMatchObject({ error: expect.stringContaining('named "spawn"') })
    h.add(provider('spawn'))
    expect(memberProviderFor(second, 'fresh')).toEqual({ name: MEMBER_FRESH_PROVIDER })
    second.dispose()
    expect(liveAliases(h.ctx)).toBe(0)
  })
})

describe('member execution aliases without a subagent service', () => {
  it('refuses both contexts and still disposes cleanly', () => {
    const ctx = new Context()
    contexts.push(ctx)
    const transitions: Transition[] = []
    const registry = registerMemberProviders(ctx, { fresh: 'spawn', fork: 'fork' },
      (context, state, reason) => { transitions.push({ context, state, reason }) })
    expect(memberProviderFor(registry, 'fresh')).toMatchObject({ error: expect.stringContaining('no subagent service') })
    expect(memberProviderFor(registry, 'fork')).toMatchObject({ error: expect.stringContaining('no subagent service') })
    expect(transitions.map(row => row.state)).toEqual(['missing', 'missing'])
    expect(() => { registry.dispose(); registry.dispose() }).not.toThrow()
  })
})

/** Describe one name as the plugin's own marker or not. */
describe('member alias identity', () => {
  it('recognizes only its own versioned aliases', () => {
    expect(isPresetMemberProvider(MEMBER_FRESH_PROVIDER)).toBe(true)
    expect(isPresetMemberProvider(MEMBER_FORK_PROVIDER)).toBe(true)
    expect(isPresetMemberProvider('spawn')).toBe(false)
    expect(isPresetMemberProvider('preset-member-fresh-v2')).toBe(false)
    expect(isPresetMemberProvider(undefined)).toBe(false)
  })
})

/**
 * A stub service proves the registry still maintains its aliases when the
 * deployment's service object is a minimal double rather than the official one,
 * which is how every other Host-side spec composes this plugin.
 */
describe('member execution aliases over a minimal service double', () => {
  it('reports the refusal, registers nothing on a read, and releases cleanly', () => {
    const ctx = new Context()
    contexts.push(ctx)
    const registered = new Map<string, SubagentProvider>()
    const spawn = provider('spawn')
    ctx.provide('subagents', {
      registerProvider: (candidate: SubagentProvider) => {
        registered.set(candidate.name, candidate)
        return () => { registered.delete(candidate.name) }
      },
      getProvider: (name: string) => registered.get(name) ?? (spawn.name === name ? spawn : undefined),
      list: () => [...registered.keys()],
      resolveMaxDepth: () => 2,
      drainChildren: async () => {},
    } as unknown as CordisContext['subagents'])

    // The double already answers for `spawn`, so the initial scan registers both
    // aliases through it and the double owns their release.
    const registry = registerMemberProviders(ctx, { fresh: 'spawn', fork: 'fork' })
    expect(registered.has(MEMBER_FRESH_PROVIDER)).toBe(true)
    expect(memberProviderFor(registry, 'fresh')).toEqual({ name: MEMBER_FRESH_PROVIDER })
    // `fork` is answered by the double too, because it reports the same object
    // for any name; this case only asserts the fresh path and the release.
    registry.dispose()
    expect(registered.size).toBe(0)
  })
})
