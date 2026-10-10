/** The model-facing Team preset tools: registration, authority, the no-selection path, and hot reload. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { createUserMessage, ToolCallId } from '@deepseek-ai/dsh-llm'
import type { ContentBlock } from '@deepseek-ai/dsh-llm/types'
import { SessionId } from '@deepseek-ai/dsh-session'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { apply, inject } from '../src/index.ts'
import type { Config } from '../src/config.ts'
import { registerPresetTools } from '../src/preset-tools.ts'
import type { TeamPreset, TeamSelectionRecord } from '../src/types.ts'
import { MockAdapter, textResponse, toolCallResponse } from '../../../core/agent-loop/tests/mock-adapter.ts'
import { slot, team } from './fixtures/team-presets.ts'

const NAMESPACE = 'agent-team-presets'

/** The Team every case edits unless it configures another. */
const REVIEWS: TeamPreset = {
  ...team([slot({ name: 'Reviewer', description: 'checks diffs', systemPrompt: 'You review diffs.' })], {
    description: 'leads the release review',
  }),
  name: 'Reviews',
  description: 'release reviews',
}

/** A second Team, so a case can prove the tools resolve a named Team rather than the selection. */
const DOCS: TeamPreset = { ...team([]), id: 'team-2', name: 'Docs', description: 'documentation work' }

const contexts: Context[] = []

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
})

/** Writable stand-in for one volatile Config reference. */
function volatileRef<T>(initial: T): { ref: { get: () => T }; set: (next: T) => void } {
  let current = initial
  return { ref: { get: () => current }, set: (next) => { current = next } }
}

/** One committed settings write, as the fake recorded it. */
interface RecordedWrite {
  /** The revision fence the caller sent. */
  readonly expected: number | undefined
  /** The Teams the write carried. */
  readonly teams: readonly TeamPreset[]
}

/** One settled tool result, read from the Session log. */
interface RecordedResult {
  readonly isError: boolean
  readonly text: string
}

interface Harness {
  readonly ctx: Context
  readonly agent: Agent
  readonly config: Config
  readonly adapter: MockAdapter
  readonly writes: readonly RecordedWrite[]
  readonly results: readonly RecordedResult[]
  readonly revision: () => number
  /** Replace the roster rows the fake Team service reports to the tools. */
  readonly setMembers: (members: readonly { role: string; status: string }[]) => void
}

/**
 * Mount the plugin over a fake settings document that commits a write exactly
 * the way the Loader does: it bumps the revision, republishes the Teams into the
 * live volatile reference, and emits `loader/volatile-update`.
 */
async function setup(options: {
  teams?: TeamPreset[]
  selections?: TeamSelectionRecord[]
  script?: ConstructorParameters<typeof MockAdapter>[0]
  origin?: 'subagent'
  members?: readonly { role: string; status: string }[]
} = {}): Promise<Harness> {
  const ctx = new Context()
  contexts.push(ctx)
  await mountAgentLoopTestDependencies(ctx)
  await ctx.plugin(AgentLoop, { agents: [] })
  let members = [...options.members ?? []]
  ctx.provide('agentTeams', {
    spawnTeammate: async () => ({ member: { name: 'member', status: 'active' } }),
    tryMembership: () => ({ root: 'root', id: 's1', role: 'lead', name: 'lead' }),
    listMembers: () => [
      { id: 's1', name: 'lead', role: 'lead', status: 'inactive', diagnostics: [] },
      ...members.map((member, index) => ({ id: `member-${String(index)}`, name: `member-${String(index)}`, diagnostics: [], ...member })),
    ],
  })

  const teamsRef = volatileRef(options.teams ?? [])
  const selectionsRef = volatileRef(options.selections ?? [])
  const writes: RecordedWrite[] = []
  let revision = 0
  const update = vi.fn(async (_ns: string, patch: { teams: TeamPreset[] }, expected?: number) => {
    if (expected !== undefined && expected !== revision) {
      throw new Error(`the settings document changed since it was read (expected revision ${String(expected)}, now ${String(revision)})`)
    }
    writes.push({ expected, teams: patch.teams })
    revision += 1
    teamsRef.set(patch.teams)
    ctx.emit('loader/volatile-update', [['teams']])
  })
  ctx.provide('settings', {
    configure: vi.fn(() => () => {}),
    describe: vi.fn(() => [{ ns: NAMESPACE, revision, value: { teams: teamsRef.ref.get() } }]),
    update,
  })

  const adapter = new MockAdapter(options.script ?? [])
  ctx.llm.registerAdapter(['mock'], adapter)
  const handle = await ctx.agents.create({
    sessionId: SessionId(options.origin === 'subagent' ? 'child' : 's1'),
    ...options.origin === undefined ? {} : { meta: { origin: options.origin } },
    agentOptions: { provider: 'mock', model: 'mock' },
  })

  const config = {
    teams: teamsRef.ref,
    selections: selectionsRef.ref,
    freshProvider: 'spawn',
    forkProvider: 'fork',
  } satisfies Config
  await ctx.plugin(Object.assign((inner: Context) => { apply(inner, config) }, { inject }))

  const results: RecordedResult[] = []
  ctx.on('session/event', (_session, event: SessionEvent) => {
    if (event.type !== 'tool/result') return
    results.push({
      isError: event.data.message.isError === true,
      text: event.data.message.content.flatMap(block => block.type === 'text' ? [block.text] : []).join(''),
    })
  })

  return {
    ctx,
    agent: handle.agent,
    config,
    adapter,
    writes,
    results,
    revision: () => revision,
    setMembers: (next) => { members = [...next] },
  }
}

/** Execute one tool call against a caller outside any model turn. */
async function call(ctx: Context, agent: Agent, name: string, args: object) {
  return await ctx.tools.execute({
    callId: ToolCallId(`${name}-call`), name, arguments: args, agent, signal: new AbortController().signal,
  })
}

/** Concatenated model-facing text of one tool result. */
function resultText(result: { content: readonly ContentBlock[] }): string {
  return result.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('')
}

/** Parsed canonical value of one tool result whose output is a JSON record. */
function payload(result: { content: readonly ContentBlock[] }): Record<string, unknown> {
  return JSON.parse(resultText(result)) as Record<string, unknown>
}

/** Drive one real turn whose scripted model call is a preset edit. */
async function runEditTurn(h: Harness, source: { kind: 'user' } | { kind: 'system-prompt' } = { kind: 'user' }): Promise<void> {
  h.agent.followup(createUserMessage({ content: [{ type: 'text', text: 'Adjust the Team preset.' }], source }))
  await h.agent.whenIdle()
}

/** The captain briefing as it is composed for one Session, so a test reads what the model would. */
async function captainPrompt(ctx: Context, agent: Agent): Promise<string> {
  const assembly = await ctx.systemPrompt.assemble(assembleContextFor(agent))
  return assembly.sections.map(section => section.text).join('\n\n')
}

describe('preset tool registration', () => {
  it('offers both tools to a Session root that selected no Team', async () => {
    const h = await setup({ teams: [REVIEWS] })
    expect(h.ctx.tools.get('get_team_preset', h.agent)).toBeDefined()
    expect(h.ctx.tools.get('update_team_preset', h.agent)).toBeDefined()
    expect(h.ctx.tools.get('spawn_team_member', h.agent)).toBeUndefined()
  })

  it('offers them once the Session selected a Team, beside the member tool', async () => {
    const h = await setup({ teams: [REVIEWS], selections: [{ sessionId: 's1', teamId: 'team-1' }] })
    expect(h.ctx.tools.get('update_team_preset', h.agent)).toBeDefined()
    expect(h.ctx.tools.get('spawn_team_member', h.agent)).toBeDefined()
  })

  it('keeps them away from a teammate Session', async () => {
    const h = await setup({ teams: [REVIEWS], origin: 'subagent' })
    expect(h.ctx.tools.get('get_team_preset', h.agent)).toBeUndefined()
    expect(h.ctx.tools.get('update_team_preset', h.agent)).toBeUndefined()
  })
})

describe('get_team_preset', () => {
  it('reports no selection and lists the configured Teams so the captain can ask', async () => {
    const h = await setup({ teams: [REVIEWS, DOCS] })
    const value = payload(await call(h.ctx, h.agent, 'get_team_preset', {}))
    expect(value.status).toBe('no-selection')
    expect(value.revision).toBe(0)
    expect(value.team).toBeUndefined()
    expect(value.message).toContain('Ask the user which Team to change')
    expect((value.teams as { id: string }[]).map(entry => entry.id)).toEqual(['team-1', 'team-2'])
  })

  it('reports the selected Team with its revision and every editable field', async () => {
    const h = await setup({ teams: [REVIEWS], selections: [{ sessionId: 's1', teamId: 'team-1' }] })
    const value = payload(await call(h.ctx, h.agent, 'get_team_preset', {}))
    expect(value.status).toBe('ready')
    expect(value.selectedTeamId).toBe('team-1')
    expect(value.team).toEqual({
      id: 'team-1',
      name: 'Reviews',
      description: 'release reviews',
      captainName: 'captain',
      captainDescription: 'leads the release review',
      captainSystemPrompt: 'Captain prompt',
      members: [{ member: 'reviewer', name: 'Reviewer', description: 'checks diffs', systemPrompt: 'You review diffs.' }],
    })
  })

  it('resolves a Team by configured name even when another Team is selected', async () => {
    const h = await setup({ teams: [REVIEWS, DOCS], selections: [{ sessionId: 's1', teamId: 'team-1' }] })
    const value = payload(await call(h.ctx, h.agent, 'get_team_preset', { team_id: 'Docs' }))
    expect(value.status).toBe('ready')
    expect(value.selectedTeamId).toBe('team-1')
    expect((value.team as { id: string }).id).toBe('team-2')
  })

  it('reports an unknown Team without implying the selection', async () => {
    const h = await setup({ teams: [REVIEWS], selections: [{ sessionId: 's1', teamId: 'team-1' }] })
    const value = payload(await call(h.ctx, h.agent, 'get_team_preset', { team_id: 'missing' }))
    expect(value.status).toBe('unknown-team')
    expect(value.message).toContain('no configured Team matches "missing"')
    expect(value.message).toContain('team-1 (Reviews)')
  })
})

describe('update_team_preset authority', () => {
  it('refuses a teammate even when the tool is registered in its scope', async () => {
    const h = await setup({ teams: [REVIEWS], origin: 'subagent' })
    registerPresetTools(h.ctx, h.agent, h.config, NAMESPACE)
    const result = await call(h.ctx, h.agent, 'update_team_preset', { revision: 0, team_description: 'anything' })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('Session captain only')
    expect(h.writes).toHaveLength(0)
  })

  it('refuses a call that is not inside an open turn', async () => {
    const h = await setup({ teams: [REVIEWS], selections: [{ sessionId: 's1', teamId: 'team-1' }] })
    const result = await call(h.ctx, h.agent, 'update_team_preset', { revision: 0, team_description: 'anything' })
    expect(result.isError).toBe(true)
    expect(resultText(result)).toContain('open model turn')
    expect(h.writes).toHaveLength(0)
  })

  it('refuses a turn no user started, even in a live Session', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      script: [toolCallResponse('edit-from-plugin', 'update_team_preset', { revision: 0, team_description: 'anything' }), textResponse('done')],
    })
    await runEditTurn(h, { kind: 'system-prompt' })
    expect(h.writes).toHaveLength(0)
    expect(h.results[0]?.isError).toBe(true)
    expect(h.results[0]?.text).toContain('needs a turn the user started')
  })
})

describe('update_team_preset writes', () => {
  it('applies a user-requested Team description and hot-reloads the captain briefing', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      script: [toolCallResponse('edit-team', 'update_team_preset', {
        revision: 0,
        team_description: 'release reviews with a written verdict',
      }), textResponse('done')],
    })
    await runEditTurn(h)
    expect(h.writes).toHaveLength(1)
    expect(h.writes[0]?.expected).toBe(0)
    expect(h.writes[0]?.teams[0]?.description).toBe('release reviews with a written verdict')
    expect(h.revision()).toBe(1)
    const value = JSON.parse(h.results[0]?.text ?? '{}') as { status: string; changed: string[]; revision: number }
    expect(value.status).toBe('updated')
    expect(value.changed).toEqual(['team.description'])
    expect(value.revision).toBe(1)
    expect(await captainPrompt(h.ctx, h.agent)).toContain('release reviews with a written verdict')
  })

  it('edits the captain prompt and one member, keeping every other field', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      script: [toolCallResponse('edit-members', 'update_team_preset', {
        revision: 0,
        captain_system_prompt: 'You lead the release review.',
        members: [{ member: 'Reviewer', description: 'checks diffs against the release notes', system_prompt: 'Review diffs strictly.' }],
      }), textResponse('done')],
    })
    await runEditTurn(h)
    const written = h.writes[0]?.teams[0]
    expect(written?.captain.systemPrompt).toBe('You lead the release review.')
    expect(written?.members[0]).toMatchObject({
      name: 'Reviewer',
      description: 'checks diffs against the release notes',
      systemPrompt: 'Review diffs strictly.',
    })
    expect(written?.description).toBe('release reviews')
    const value = JSON.parse(h.results[0]?.text ?? '{}') as { changed: string[] }
    expect(value.changed).toEqual(['captain.systemPrompt', 'member:reviewer.description', 'member:reviewer.systemPrompt'])
    const prompt = await captainPrompt(h.ctx, h.agent)
    expect(prompt).toContain('You lead the release review.')
    expect(prompt).toContain('checks diffs against the release notes')
  })

  it('reports an unchanged preset without writing', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      script: [toolCallResponse('edit-same', 'update_team_preset', { revision: 0, team_description: 'release reviews' }), textResponse('done')],
    })
    await runEditTurn(h)
    expect(h.writes).toHaveLength(0)
    const value = JSON.parse(h.results[0]?.text ?? '{}') as { status: string; changed: string[] }
    expect(value.status).toBe('unchanged')
    expect(value.changed).toEqual([])
  })

  it('refuses a stale revision and names the current one', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      script: [toolCallResponse('edit-stale', 'update_team_preset', { revision: 7, team_description: 'later' }), textResponse('done')],
    })
    await runEditTurn(h)
    expect(h.writes).toHaveLength(0)
    expect(h.results[0]?.isError).toBe(true)
    expect(h.results[0]?.text).toContain('revision 7 is stale')
    expect(h.results[0]?.text).toContain('get_team_preset')
  })

  it('refuses an unknown member and names the available targets', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      script: [toolCallResponse('edit-unknown', 'update_team_preset', {
        revision: 0,
        members: [{ member: 'auditor', description: 'audits' }],
      }), textResponse('done')],
    })
    await runEditTurn(h)
    expect(h.writes).toHaveLength(0)
    expect(h.results[0]?.isError).toBe(true)
    expect(h.results[0]?.text).toContain('unknown Team member "auditor"')
    expect(h.results[0]?.text).toContain('reviewer')
  })

  it('refuses a member description the teammate roster cannot spawn', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      script: [toolCallResponse('edit-long', 'update_team_preset', {
        revision: 0,
        members: [{ member: 'reviewer', description: 'x'.repeat(201) }],
      }), textResponse('done')],
    })
    await runEditTurn(h)
    expect(h.writes).toHaveLength(0)
    expect(h.results[0]?.isError).toBe(true)
    expect(h.results[0]?.text).toContain('at most 200')
  })

  it('refuses a prompt whose variable group would fail the captain next step', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      script: [toolCallResponse('edit-bad-prompt', 'update_team_preset', {
        revision: 0,
        captain_system_prompt: 'Answer in {{locale}}.',
      }), textResponse('done')],
    })
    await runEditTurn(h)
    expect(h.writes).toHaveLength(0)
    expect(h.results[0]?.isError).toBe(true)
    expect(h.results[0]?.text).toContain('unknown prompt variable "{{locale}}"')
    expect(h.results[0]?.text).toContain('provider')
  })

  it('accepts a prompt that names a registered variable', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      script: [toolCallResponse('edit-good-prompt', 'update_team_preset', {
        revision: 0,
        captain_system_prompt: 'You lead the review on {{model}}.',
      }), textResponse('done')],
    })
    await runEditTurn(h)
    expect(h.writes).toHaveLength(1)
    expect(h.writes[0]?.teams[0]?.captain.systemPrompt).toBe('You lead the review on {{model}}.')
    expect(h.results[0]?.isError).toBe(false)
  })

  it('asks which Team to change when the Session selected none', async () => {
    const h = await setup({ teams: [REVIEWS, DOCS] })
    const result = await call(h.ctx, h.agent, 'update_team_preset', { revision: 0, team_description: 'anything' })
    const value = payload(result)
    expect(result.isError).toBe(false)
    expect(value.status).toBe('no-selection')
    expect(value.changed).toEqual([])
    expect(value.message).toContain('Ask the user which Team to change')
    expect(value.message).toContain('team-2 (Docs)')
    expect(h.writes).toHaveLength(0)
  })
})

describe('update_team_preset while the Team is executing', () => {
  it('refuses a user-requested write while a member is running', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      members: [{ role: 'teammate', status: 'running' }],
      script: [toolCallResponse('edit-busy', 'update_team_preset', {
        revision: 0,
        team_description: 'rewritten mid-run',
      }), textResponse('done')],
    })
    await runEditTurn(h)
    expect(h.writes).toHaveLength(0)
    const value = JSON.parse(h.results[0]?.text ?? '{}') as { status: string; changed: string[]; message: string }
    expect(value.status).toBe('team-busy')
    expect(value.changed).toEqual([])
    expect(value.message).toContain('is executing: 1 member(s)')
    expect(value.message).toContain('interrupt_agent')
    expect(h.results[0]?.isError).toBe(false)
  })

  it('refuses while a member is only provisioning', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      members: [{ role: 'teammate', status: 'provisioning' }],
      script: [toolCallResponse('edit-provisioning', 'update_team_preset', {
        revision: 0,
        team_description: 'rewritten mid-run',
      }), textResponse('done')],
    })
    await runEditTurn(h)
    expect(h.writes).toHaveLength(0)
    expect(JSON.parse(h.results[0]?.text ?? '{}')).toMatchObject({ status: 'team-busy' })
  })

  it('writes the same edit once the Team goes idle', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      members: [{ role: 'teammate', status: 'running' }],
      script: [toolCallResponse('edit-idle', 'update_team_preset', {
        revision: 0,
        team_description: 'rewritten after the run',
      }), textResponse('done')],
    })
    h.setMembers([{ role: 'teammate', status: 'inactive' }])
    await runEditTurn(h)
    expect(h.writes).toHaveLength(1)
    expect(h.writes[0]?.teams[0]?.description).toBe('rewritten after the run')
    expect(JSON.parse(h.results[0]?.text ?? '{}')).toMatchObject({ status: 'updated' })
  })

  it('warns the captain before it tries, and counts only that Team members', async () => {
    const h = await setup({
      teams: [REVIEWS, DOCS],
      selections: [{ sessionId: 's1', teamId: 'team-1' }],
      members: [{ role: 'teammate', status: 'running' }],
    })
    const value = payload(await call(h.ctx, h.agent, 'get_team_preset', {}))
    expect(value.executingMembers).toBe(1)
    expect(value.message).toContain('will refuse this preset')
  })

  it('blocks a write from a Session that selected nothing when another run holds that Team', async () => {
    const h = await setup({
      teams: [REVIEWS],
      selections: [{ sessionId: 'runs-elsewhere', teamId: 'team-1' }],
      members: [{ role: 'teammate', status: 'running' }],
    })
    await h.ctx.agents.create({ sessionId: SessionId('runs-elsewhere'), agentOptions: { provider: 'mock', model: 'mock' } })
    const result = await call(h.ctx, h.agent, 'update_team_preset', { team_id: 'team-1', revision: 0, team_description: 'rewritten' })
    const value = payload(result)
    expect(value.status).toBe('team-busy')
    expect(value.teamId).toBe('team-1')
    expect(h.writes).toHaveLength(0)
  })
})
