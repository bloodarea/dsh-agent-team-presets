/**
 * MemberRuntime's fail-closed decision table and atomic installation.
 *
 * These cases drive the runtime directly with an in-memory `storageDomain`
 * double, because they need states a real medium cannot be made to produce —
 * an identity-mismatched record, or a scope that fails mid-install. The double
 * implements the official service's `open(spec).table(name)` contract, so the
 * production `openMemberStore` path still runs; only the medium is simulated.
 * Durability itself is proven with the real JSON backend in
 * `member-store.spec.ts` and end to end in `member-injection.spec.ts`.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { executeTool } from './fixtures/execute-tool.ts'
import { Context } from '@deepseek-ai/cordis'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import { snapshotSubagentDescriptor } from '@deepseek-ai/dsh-subagent'
import { MEMBER_FRESH_PROVIDER, MEMBER_FORK_PROVIDER } from '../src/member-identity.ts'
import type { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { MemberRuntime } from '../src/member-runtime.ts'
import type { MemberIntent } from '../src/member-runtime.ts'
import { memberRecordKey } from '../src/member-store.ts'
import type { MemberRecord } from '../src/member-store.ts'
import { MockAdapter, textResponse } from './fixtures/mock-adapter.ts'

const contexts: Context[] = []

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
})

/** An in-memory stand-in for the mounted `storageDomain` service. */
interface MemoryStore {
  /** The facility handed to `ctx.provide('storageDomain', …)`. */
  readonly facility: DomainFacility
  /** Direct record access, so a case can seed a state `prepare` cannot produce. */
  readonly table: Map<string, MemberRecord>
  failNextPut(): void
}

/**
 * Build the memory store double.
 * @param seed - records to preload, keyed by `(rootSessionId, memberName)`.
 * @returns the double.
 */
function memoryStore(seed: readonly MemberRecord[] = []): MemoryStore {
  let failPut = false
  const table = new Map<string, MemberRecord>()
  for (const record of seed) table.set(memberRecordKey(record.rootSessionId, record.memberName), record)
  const facility = {
    open: async () => ({
      name: 'agent_team_presets_members',
      global: { get: () => undefined, set: async () => {} },
      table: (name: string) => {
        if (name !== 'members') throw new Error(`unknown table ${name}`)
        return {
          get: (key: string) => table.get(key),
          entries: () => table.entries(),
          keys: () => table.keys(),
          get size() { return table.size },
          put: async (key: string, value: MemberRecord) => {
            if (failPut) { failPut = false; throw new Error('injected bind persistence failure') }
            table.set(key, value)
          },
          delete: async (key: string) => table.delete(key),
          update: async (key: string, fn: (current: MemberRecord) => MemberRecord) => {
            const current = table.get(key)
            if (current === undefined) throw new Error('missing key')
            const next = fn(current)
            table.set(key, next)
            return next
          },
        }
      },
      close: async () => {},
    }),
  }
  return { facility: facility as unknown as DomainFacility, table, failNextPut: () => { failPut = true } }
}

/** One stored record for the `(lead, reviewer)` instance. */
function recordFor(overrides: Partial<MemberRecord> = {}): MemberRecord {
  return {
    schemaVersion: 1,
    intentId: 'intent-1',
    rootSessionId: 'lead',
    memberName: 'reviewer',
    teamId: 'team-1',
    displayName: 'reviewer',
    roleDescription: 'reviews diffs',
    persona: 'UNIQUE_MEMBER_RULES',
    teamSection: 'TEAM_SECTION',
    roster: [],
    policy: { mode: 'custom', allow: ['read'] },
    spawnContext: 'fresh',
    lifecycle: 'bound',
    childSessionId: 'child',
    updatedAt: 0,
    ...overrides,
  }
}

/** A Session root plus one child Agent, over a memory store. */
async function harness(options: { seed?: readonly MemberRecord[]; store?: boolean } = {}) {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  ctx.llm.registerAdapter(['mock'], new MockAdapter(Array.from({ length: 10 }, () => textResponse('done'))))
  // The probe tools a member policy can name, so a restriction has real
  // global names to check against.
  for (const name of ['read', 'write']) {
    ctx.tools.register({
      name,
      description: `${name} fixture`,
      parameters: {},
      output: { schema: { type: 'string' }, render: () => [] },
      async execute() { return 'executed' },
    })
  }
  const memory = memoryStore(options.seed)
  if (options.store !== false) ctx.provide('storageDomain', memory.facility)
  const lead = (await ctx.agents.create({ sessionId: SessionId('lead'), agentOptions: { provider: 'mock', model: 'mock' } })).agent
  const child = (await ctx.agents.create({
    sessionId: SessionId('child'),
    parentAgent: lead,
    meta: { parentSession: lead.session.id, origin: 'subagent' },
    agentOptions: { provider: 'mock', model: 'mock' },
  })).agent
  const members = new MemberRuntime(ctx)
  // Opening the durable unit is asynchronous, and `claim` is a synchronous
  // creation-edge decision; production always calls it after a `prepare` that
  // awaited readiness.
  await members.whenReady()
  return { ctx, lead, child, members, memory }
}

/** One intent over the `(lead, reviewer)` instance. */
function intent(lead: Agent, overrides: Partial<MemberIntent> = {}): MemberIntent {
  return {
    root: lead,
    target: 'reviewer',
    teamId: 'team-1',
    displayName: 'reviewer',
    roleDescription: 'reviews diffs',
    persona: 'UNIQUE_MEMBER_RULES',
    teamSection: 'TEAM_SECTION',
    roster: [],
    route: undefined,
    policy: { teamId: 'team-1', mode: 'custom', allow: ['read'] },
    spawnContext: 'fresh',
    ...overrides,
  }
}

describe('claiming one child', () => {
  it('leaves a native Agent with no snapshot and no member marker entirely alone', async () => {
    const h = await harness()
    expect(h.members.claim(h.child, { root: h.lead, name: 'native-member' }, false)).toEqual({ kind: 'unmanaged' })
    expect(h.members.installedCount).toBe(0)
    await h.members.close()
  })

  it('refuses a marked child whose snapshot is missing rather than running it on defaults', async () => {
    // The child's own descriptor says this plugin created it, so an unreadable
    // snapshot is a refusal; only an UNMARKED child may fall through to
    // "unmanaged", which the case above pins down.
    const h = await harness()
    const claim = h.members.claim(h.child, { root: h.lead, name: 'reviewer' }, true)
    expect(claim.kind).toBe('invalid')
    expect(claim.kind === 'invalid' ? claim.reason : '').toContain('no frozen configuration snapshot')
    expect(h.members.installedCount).toBe(0)
    expect(h.members.recordFor(h.child)).toBeUndefined()
    await h.members.close()
  })

  it('refuses a marked child when the snapshot channel itself is unavailable', async () => {
    const h = await harness({ store: false })
    const claim = h.members.claim(h.child, { root: h.lead, name: 'reviewer' }, true)
    expect(claim.kind).toBe('invalid')
    expect(claim.kind === 'invalid' ? claim.reason : '').toContain('durable member configuration store is unavailable')
    expect(h.members.installedCount).toBe(0)
    // The very same claim without the marker stays upstream's: only the child
    // the Host recorded as this plugin's own is refused.
    expect(h.members.claim(h.child, { root: h.lead, name: 'reviewer' }, false)).toEqual({ kind: 'unmanaged' })
    await h.members.close()
  })

  it('refuses an Agent whose stored snapshot belongs to another identity', async () => {
    // A record stored under THIS instance's key but describing another member:
    // readable, so it must never be treated as "no snapshot" and allowed.
    const h = await harness({ seed: [recordFor({ memberName: 'someone-else' })] })
    h.memory.table.set(memberRecordKey('lead', 'reviewer'), recordFor({ memberName: 'someone-else' }))
    const claim = h.members.claim(h.child, { root: h.lead, name: 'reviewer' }, true)
    expect(claim.kind).toBe('invalid')
    expect(claim.kind === 'invalid' ? claim.reason : '').toContain('does not belong to Session "lead"')
    expect(h.members.installedCount).toBe(0)
    await h.members.close()
  })

  it('installs the frozen scopes and is idempotent across repeated edges', async () => {
    const h = await harness({ seed: [recordFor()] })
    const first = h.members.claim(h.child, { root: h.lead, name: 'reviewer' }, true)
    expect(first.kind).toBe('installed')
    const second = h.members.claim(h.child, { root: h.lead, name: 'reviewer' }, true)
    expect(second).toEqual(first)
    expect(h.members.installedCount).toBe(1)
    // The persona section replaced the deployment slot for this child alone.
    const assembly = await h.ctx.systemPrompt.assemble(assembleContextFor(h.child))
    const persona = assembly.sections.find(section => section.name === 'deployment:persona-prefix')?.text
    expect(persona).toBe('UNIQUE_MEMBER_RULES')
    expect(assembly.sections.some(section => section.text === 'TEAM_SECTION')).toBe(true)
    // The strict guard denies a tool the frozen policy does not name.
    const denied = await executeTool(h.ctx, {
      callId: ToolCallId('denied'), name: 'write', arguments: {}, agent: h.child, signal: new AbortController().signal,
    })
    expect(denied.isError).toBe(true)
    await h.members.close()
  })

  it('rolls a partial install back and installs nothing when any scope fails', async () => {
    // A policy naming a tool no deployment registers makes the visibility
    // restriction fail AFTER the persona and guard were installed.
    const h = await harness({ seed: [recordFor({ policy: { mode: 'custom', allow: ['ghost_tool'] } })] })
    expect(() => h.members.claim(h.child, { root: h.lead, name: 'reviewer' }, true)).toThrow()
    expect(h.members.installedCount).toBe(0)
    expect(h.members.recordFor(h.child)).toBeUndefined()
    // Every earlier registration was undone: no persona, no team section, and
    // no guard left denying tools the child should still reach.
    const assembly = await h.ctx.systemPrompt.assemble(assembleContextFor(h.child))
    expect(assembly.sections.find(section => section.name === 'deployment:persona-prefix')?.text).not.toBe('UNIQUE_MEMBER_RULES')
    expect(assembly.sections.some(section => section.text === 'TEAM_SECTION')).toBe(false)
    const allowed = await executeTool(h.ctx, {
      callId: ToolCallId('still-allowed'), name: 'write', arguments: {}, agent: h.child, signal: new AbortController().signal,
    })
    expect(allowed.isError).toBe(false)
    await h.members.close()
  })

  it('releases one member without touching the others', async () => {
    const second = (await harness({ seed: [recordFor()] }))
    const sibling = (await second.ctx.agents.create({
      sessionId: SessionId('child-2'),
      parentAgent: second.lead,
      meta: { parentSession: second.lead.session.id, origin: 'subagent' },
      agentOptions: { provider: 'mock', model: 'mock' },
    })).agent
    second.memory.table.set(
      memberRecordKey('lead', 'auditor'),
      // The sibling owns its own snapshot: the child binding is never re-pointed
      // at another Agent, so this record names `child-2` explicitly.
      recordFor({ memberName: 'auditor', childSessionId: sibling.id, policy: { mode: 'custom', allow: ['read'] } }),
    )
    expect(second.members.claim(second.child, { root: second.lead, name: 'reviewer' }, true).kind).toBe('installed')
    expect(second.members.claim(sibling, { root: second.lead, name: 'auditor' }, true).kind).toBe('installed')
    expect(second.members.installedCount).toBe(2)
    expect(second.members.release(second.child)).toBe(true)
    expect(second.members.installedCount).toBe(1)
    expect(second.members.recordFor(sibling)).toBeDefined()
    expect(second.members.release(second.child)).toBe(false)
    second.members.releaseAll()
    expect(second.members.installedCount).toBe(0)
    await second.members.close()
  })
})

describe('preparing one creation', () => {
  it('records the whole frozen configuration before anything is created', async () => {
    const h = await harness()
    const prepared = await h.members.prepare(intent(h.lead, {
      target: 'reviewer-2',
      roleId: 'reviewer-id',
      route: { provider: 'deepseek', model: 'deepseek-reasoner', reasoningEffort: 'max' },
      spawnContext: 'fork',
    }))
    expect(prepared.kind).toBe('ready')
    const stored = h.memory.table.get(memberRecordKey('lead', 'reviewer-2'))
    expect(stored).toMatchObject({
      schemaVersion: 1,
      rootSessionId: 'lead',
      memberName: 'reviewer-2',
      roleId: 'reviewer-id',
      lifecycle: 'intent',
      spawnContext: 'fork',
      policy: { mode: 'custom', allow: ['read'] },
      route: { provider: 'deepseek', model: 'deepseek-reasoner', reasoningEffort: 'max' },
    })
    // No child id yet: binding is the creation edge's job.
    expect(stored).not.toHaveProperty('childSessionId')
    await h.members.close()
  })

  it('refuses a second creation of an instance already bound to a child', async () => {
    const h = await harness({ seed: [recordFor()] })
    const prepared = await h.members.prepare(intent(h.lead))
    expect(prepared.kind).toBe('refused')
    expect(prepared.kind === 'refused' ? prepared.reason : '').toContain('already identifies a preset-managed member')
    await h.members.close()
  })

  it('allows a retry after a creation that produced no child', async () => {
    const h = await harness()
    expect((await h.members.prepare(intent(h.lead))).kind).toBe('ready')
    await h.members.markFailed('lead', 'reviewer')
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))?.lifecycle).toBe('failed')
    // The name is not burned by a creation that never produced a member.
    const retry = await h.members.prepare(intent(h.lead))
    expect(retry.kind).toBe('ready')
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))?.lifecycle).toBe('intent')
    await h.members.close()
  })

  it('never overwrites a record that is already bound', async () => {
    const h = await harness()
    expect((await h.members.prepare(intent(h.lead))).kind).toBe('ready')
    const stored = h.memory.table.get(memberRecordKey('lead', 'reviewer'))!
    h.memory.table.set(memberRecordKey('lead', 'reviewer'), { ...stored, lifecycle: 'bound', childSessionId: 'child' })
    expect((await h.members.prepare(intent(h.lead))).kind).toBe('refused')
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))?.childSessionId).toBe('child')
    await h.members.close()
  })
})

describe('binding and failure notes', () => {
  it('recovers a failed bind from a verified historical descriptor and repairs the durable intent', async () => {
    const h = await harness({ seed: [recordFor({ lifecycle: 'intent', childSessionId: undefined })] })
    const membership = { root: h.lead, name: 'reviewer' }
    h.child.session.append('subagent/descriptor', snapshotSubagentDescriptor({ mode: 'continuable', provider: MEMBER_FRESH_PROVIDER, label: 'review diffs' }))
    // The same descriptor on a fresh creation cannot skip generation admission.
    expect(h.members.claim(h.child, membership, true)).toMatchObject({ kind: 'installed', record: { lifecycle: 'intent' } })
    h.memory.failNextPut()
    await h.members.bind(h.child, membership)
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))?.lifecycle).toBe('intent')
    expect(h.members.recordFor(h.child)).toMatchObject({ lifecycle: 'bound', childSessionId: 'child' })
    const seed = h.child.session.snapshotEvents()
    h.members.releaseAll()
    await h.members.close()
    const restored = (await h.ctx.agents.create({ sessionId: SessionId('restored'), parentAgent: h.lead,
      meta: { parentSession: h.lead.id, origin: 'subagent' }, seed, agentOptions: { provider: 'mock', model: 'mock' } })).agent
    const runtime = new MemberRuntime(h.ctx)
    await runtime.whenReady()
    expect(runtime.claim(restored, membership, true)).toMatchObject({ kind: 'installed', record: { lifecycle: 'bound', childSessionId: restored.id } })
    // Close waits for the recovery write too.
    await runtime.closeAdmission()
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))).toMatchObject({ lifecycle: 'bound', childSessionId: restored.id, intentId: 'intent-1' })
    await runtime.close()
  })

  it.each(['provider', 'parent', 'failed', 'bound-child', 'unmarked'] as const)('does not recover an intent using mismatched %s evidence', async mismatch => {
    const h = await harness({ seed: [recordFor({ lifecycle: mismatch === 'failed' ? 'failed' : mismatch === 'bound-child' ? 'bound' : 'intent', childSessionId: mismatch === 'bound-child' ? 'another-child' : undefined })] })
    h.child.session.append('subagent/descriptor', snapshotSubagentDescriptor({ mode: 'continuable', provider: mismatch === 'provider' ? MEMBER_FORK_PROVIDER : MEMBER_FRESH_PROVIDER, label: 'review diffs' }))
    const restored = (await h.ctx.agents.create({ sessionId: SessionId('restored'), parentAgent: h.lead,
      meta: { parentSession: mismatch === 'parent' ? 'wrong-parent' : h.lead.id, origin: 'subagent' }, seed: h.child.session.snapshotEvents(),
      agentOptions: { provider: 'mock', model: 'mock' } })).agent
    const claim = h.members.claim(restored, { root: h.lead, name: 'reviewer' }, mismatch !== 'unmarked')
    if (mismatch === 'unmarked') expect(claim).toMatchObject({ kind: 'installed', record: { lifecycle: 'intent' } })
    else expect(claim.kind).toBe('invalid')
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))?.childSessionId).toBe(mismatch === 'bound-child' ? 'another-child' : undefined)
    await h.members.close()
  })

  it('keeps a recovered child bound in memory when the repair write also fails, then retries bind', async () => {
    const h = await harness({ seed: [recordFor({ lifecycle: 'intent', childSessionId: undefined })] })
    h.child.session.append('subagent/descriptor', snapshotSubagentDescriptor({ mode: 'continuable', provider: MEMBER_FRESH_PROVIDER, label: 'review diffs' }))
    const restored = (await h.ctx.agents.create({ sessionId: SessionId('restored'), parentAgent: h.lead,
      meta: { parentSession: h.lead.id, origin: 'subagent' }, seed: h.child.session.snapshotEvents(), agentOptions: { provider: 'mock', model: 'mock' } })).agent
    const membership = { root: h.lead, name: 'reviewer' }
    h.memory.failNextPut()
    expect(h.members.claim(restored, membership, true)).toMatchObject({ kind: 'installed', record: { lifecycle: 'bound' } })
    await Promise.resolve()
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))?.lifecycle).toBe('intent')
    expect(h.members.claim(restored, membership, true)).toMatchObject({ kind: 'installed', record: { lifecycle: 'bound', childSessionId: restored.id } })
    await h.members.bind(restored, membership)
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))).toMatchObject({ lifecycle: 'bound', childSessionId: restored.id })
    await h.members.close()
  })

  it('rejects malformed historical descriptors and never substitutes a later valid descriptor', async () => {
    const h = await harness({ seed: [recordFor({ lifecycle: 'intent', childSessionId: undefined })] })
    h.child.session.append('subagent/descriptor', { version: 3, mode: 'continuable', provider: MEMBER_FRESH_PROVIDER, label: 7 } as never)
    h.child.session.append('subagent/descriptor', snapshotSubagentDescriptor({ mode: 'continuable', provider: MEMBER_FRESH_PROVIDER, label: 'valid later' }))
    const restored = (await h.ctx.agents.create({ sessionId: SessionId('restored'), parentAgent: h.lead,
      meta: { parentSession: h.lead.id, origin: 'subagent' }, seed: h.child.session.snapshotEvents(), agentOptions: { provider: 'mock', model: 'mock' } })).agent
    expect(h.members.claim(restored, { root: h.lead, name: 'reviewer' }, true)).toMatchObject({ kind: 'invalid' })
    expect(h.members.installedCount).toBe(0)
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))?.lifecycle).toBe('intent')
    await h.members.close()
  })

  it('never binds an unclaimed child or a replacement intent', async () => {
    const h = await harness({ seed: [recordFor({ lifecycle: 'intent', childSessionId: undefined })] })
    const membership = { root: h.lead, name: 'reviewer' }
    await h.members.bind(h.child, membership)
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))?.lifecycle).toBe('intent')
    h.members.claim(h.child, membership, true)
    h.memory.table.set(memberRecordKey('lead', 'reviewer'), recordFor({ lifecycle: 'intent', childSessionId: undefined, intentId: 'replacement' }))
    await h.members.bind(h.child, membership)
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))).toMatchObject({ lifecycle: 'intent', intentId: 'replacement' })
    await h.members.close()
  })

  it('binds the created child durably and reports the member\'s own failure cause', async () => {
    const h = await harness({ seed: [recordFor({ lifecycle: 'intent', childSessionId: undefined })] })
    // The creation edge claims the child — which installs the failure observer —
    // and then binds the created child id.
    expect(h.members.claim(h.child, { root: h.lead, name: 'reviewer' }, true).kind).toBe('installed')
    await h.members.bind(h.child, { root: h.lead, name: 'reviewer' })
    expect(h.memory.table.get(memberRecordKey('lead', 'reviewer'))).toMatchObject({
      lifecycle: 'bound',
      childSessionId: 'child',
    })
    // A member whose own turn fails during creation leaves its cause visible to
    // the caller that must report it.
    h.ctx.emit('agent/error', { agent: h.child, turn: 1, step: 1, error: new Error('provider "member-route" is unreachable') })
    expect(h.members.failureOf('lead', 'reviewer')).toContain('member-route')
    // A fresh attempt starts without the previous attempt's note.
    await h.members.prepare(intent(h.lead, { target: 'reviewer-2' }))
    expect(h.members.failureOf('lead', 'reviewer-2')).toBeUndefined()
    await h.members.close()
  })
})
