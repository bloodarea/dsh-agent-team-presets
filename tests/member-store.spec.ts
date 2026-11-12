/**
 * The durable member store's fail-closed contract.
 *
 * Two kinds of evidence meet here. A store that cannot be trusted — absent,
 * written by another format version, or holding a record that fails its schema
 * — must disable member injection instead of creating members nothing can
 * re-scope; and a record that WAS written must still be readable by a fresh
 * runtime on the same medium, which is the storage half of process-restart
 * recovery. The runtime-level recovery paths are covered in
 * `member-runtime.spec.ts`; the end-to-end path is covered in
 * `member-injection.spec.ts`.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import type { SubagentActivationSpec } from '@deepseek-ai/dsh-subagent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply, inject } from '../src/index.ts'
import { MEMBER_DOMAIN_NAME, MEMBER_TABLE_NAME, memberRecordKey, memberRecordSchema, openMemberStore } from '../src/member-store.ts'
import type { MemberRecord } from '../src/member-store.ts'
import { MemberRuntime } from '../src/member-runtime.ts'
import { BUILTIN_TEAM_IDS } from '../src/builtin-teams.ts'
import { mountMemberStorage } from './fixtures/member-storage.ts'
import { MockAdapter, textResponse } from './fixtures/mock-adapter.ts'
import { acceptedActivation, mountSubagentDouble } from './fixtures/plugin-harness.ts'
import { slot, team } from './fixtures/team-presets.ts'
import { executeTool } from './fixtures/execute-tool.ts'

const contexts: Context[] = []
const temporary: string[] = []

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
  for (const path of temporary.splice(0)) await rm(path, { recursive: true, force: true })
})

/** Compose a context with the loop and one Session root, without any storage. */
async function bare(options: { teams?: ReturnType<typeof team>; selections?: { sessionId: string; teamId: string }[] } = {}) {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  ctx.llm.registerAdapter(['mock'], new MockAdapter(Array.from({ length: 10 }, () => textResponse('done'))))
  const startActivation = vi.fn(async (spec: SubagentActivationSpec) => acceptedActivation(spec))
  ctx.provide('agentTeams', {})
  ctx.provide('settings', { configure: () => () => {}, describe: () => [], update: async () => {} })
  const definition = options.teams ?? team([slot({ name: 'reviewer', description: 'reviews' })])
  const config = {
    teams: { get: () => [definition] },
    selections: { get: () => options.selections ?? [{ sessionId: 'root', teamId: definition.id }] },
    freshProvider: 'spawn',
    seededDefaults: { get: () => [...BUILTIN_TEAM_IDS] },
    forkProvider: 'fork',
  }
  // The plugin injects the subagent service, exactly as a deployment that
  // composes Teams provides it: without it the mount is parked and no Team is
  // ever applied. The store this spec withholds is a different capability.
  mountSubagentDouble(ctx, { startActivation })
  await ctx.plugin(Object.assign((owner: Context) => apply(owner, config), { inject }))
  const root = await ctx.agents.create({ sessionId: SessionId('root'), agentOptions: { provider: 'mock', model: 'mock' } })
  return { ctx, root: root.agent, startActivation, definition }
}

/** Every member record one medium currently holds, read through a fresh runtime. */
async function readThrough(ctx: Context): Promise<MemberRecord[]> {
  const store = await openMemberStore(ctx)
  try {
    return store.values()
  } finally {
    await store.close()
  }
}

describe('a deployment without the member store', () => {
  it('rejects the store open with the missing capability named', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    await expect(openMemberStore(ctx)).rejects.toThrow(/does not compose @deepseek-ai\/dsh-storage-domain/)
  })

  it('keeps the plugin active while refusing to create a member', async () => {
    const h = await bare()
    // The captain's own Team capability still works: only member creation is
    // refused, and the refusal happens before the Team service is asked.
    expect(h.ctx.tools.get('spawn_team_member', h.root)).toBeDefined()
    expect(h.ctx.tools.get('get_team_preset', h.root)).toBeDefined()
    const spawn = await executeTool(h.ctx, {
      callId: ToolCallId('no-store'),
      name: 'spawn_team_member',
      arguments: { member: 'reviewer', task: 'review' },
      agent: h.root,
      signal: new AbortController().signal,
    })
    expect(spawn.isError).toBe(true)
    const text = spawn.content.flatMap(block => block.type === 'text' && block.text !== undefined ? [block.text] : []).join('')
    expect(text).toContain('durable member configuration store is unavailable')
    expect(text).toContain('refused rather than letting it run')
    // The captain can see WHY, instead of only that members are unavailable.
    expect(text).toContain('does not compose @deepseek-ai/dsh-storage-domain')
    expect(h.startActivation).not.toHaveBeenCalled()
  })
})

describe('a stored unit this build cannot trust', () => {
  /**
   * Write a unit document the JSON backend will read on open.
   * @param root - backend root.
   * @param document - the document to store.
   */
  async function seed(root: string, document: unknown): Promise<void> {
    await mkdir(root, { recursive: true })
    await writeFile(join(root, `${MEMBER_DOMAIN_NAME}.json`), `${JSON.stringify(document, null, 2)}\n`)
  }

  it('refuses member creation when the stored format version is not this build\'s', async () => {
    const h = await bare()
    const root = await mkdtemp(join(tmpdir(), 'team-presets-store-'))
    temporary.push(root)
    await mountMemberStorage(h.ctx, root)
    await rm(join(root, `${MEMBER_DOMAIN_NAME}.json`), { force: true })
    await seed(root, { unit: { name: MEMBER_DOMAIN_NAME, version: 99 }, global: null, tables: { [MEMBER_TABLE_NAME]: {} } })

    const members = new MemberRuntime(h.ctx)
    const prepared = await members.prepare({
      root: h.root, target: 'reviewer', teamId: 'team-1', displayName: 'reviewer', roleDescription: 'reviews',
      persona: 'p', teamSection: 't', roster: [], route: undefined,
      policy: { teamId: 'team-1', mode: 'all', allow: [] }, spawnContext: 'fresh',
    })
    expect(prepared.kind).toBe('refused')
    expect(prepared.kind === 'refused' ? prepared.reason : '').toMatch(/version|mismatch/)
    await members.close()
  })

  it('refuses member creation when a stored record fails its schema', async () => {
    const h = await bare()
    const root = await mkdtemp(join(tmpdir(), 'team-presets-store-'))
    temporary.push(root)
    await mountMemberStorage(h.ctx, root)
    await rm(join(root, `${MEMBER_DOMAIN_NAME}.json`), { force: true })
    await seed(root, {
      unit: { name: MEMBER_DOMAIN_NAME, version: 1 },
      global: null,
      tables: { [MEMBER_TABLE_NAME]: { deadbeef: { schemaVersion: 1, memberName: 'reviewer' } } },
    })
    await expect(openMemberStore(h.ctx)).rejects.toThrow(/does not match its schema/)
  })
})

describe('the stored snapshot outlives the runtime that wrote it', () => {
  it('is readable by a fresh runtime and a fresh context on the same medium', async () => {
    const root = await mkdtemp(join(tmpdir(), 'team-presets-store-'))
    temporary.push(root)

    const first = new Context()
    contexts.push(first)
    await mountAgentLoopTestDependencies(first)
    await mountMemberStorage(first, root)
    const writer = new MemberRuntime(first)
    // `prepare` reads only the Team Lead's Session identity from the Agent.
    const created = await writer.prepare({
      root: { id: 'lead-session' } as Agent,
      target: 'reviewer',
      teamId: 'team-1',
      roleId: 'reviewer-id',
      displayName: '评审员',
      roleDescription: 'reviews diffs',
      persona: 'UNIQUE_MEMBER_RULES',
      teamSection: 'team section',
      roster: [{ target: 'reviewer', display: '评审员', description: 'reviews diffs' }],
      route: { provider: 'deepseek', model: 'deepseek-reasoner', reasoningEffort: 'max' },
      policy: { teamId: 'team-1', mode: 'custom', allow: ['read'] },
      spawnContext: 'fork',
    })
    expect(created.kind).toBe('ready')
    await writer.close()

    // A NEW context on the same directory is the storage half of a Host
    // restart: nothing from the first runtime is in memory any more.
    const second = new Context()
    contexts.push(second)
    await mountAgentLoopTestDependencies(second)
    await mountMemberStorage(second, root)
    const records = await readThrough(second)
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      rootSessionId: 'lead-session',
      memberName: 'reviewer',
      lifecycle: 'intent',
      route: { provider: 'deepseek', model: 'deepseek-reasoner', reasoningEffort: 'max' },
      policy: { mode: 'custom', allow: ['read'] },
    })
    // The record round-trips through its own schema unchanged.
    expect(memberRecordSchema.parse(JSON.parse(JSON.stringify(records[0])))).toEqual(records[0])
  })
})

describe('member record keys', () => {
  it('are stable, distinct per instance, and safe as record path segments', () => {
    const key = memberRecordKey('lead', 'reviewer')
    expect(key).toBe(memberRecordKey('lead', 'reviewer'))
    expect(key).toMatch(/^[0-9a-f]{64}$/)
    // The separator cannot collide two identities: (a,bc) and (ab,c) differ.
    expect(memberRecordKey('a', 'bc')).not.toBe(memberRecordKey('ab', 'c'))
    expect(memberRecordKey('lead', 'reviewer')).not.toBe(memberRecordKey('lead', 'reviewer-2'))
    expect(memberRecordKey('lead', 'reviewer')).not.toBe(memberRecordKey('lead-2', 'reviewer'))
  })
})
