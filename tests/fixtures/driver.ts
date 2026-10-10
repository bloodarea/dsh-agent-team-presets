import { readFile, writeFile } from 'node:fs/promises'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { bootProductionProfile } from '../../../../test-support/loader-smoke/tests/fixtures/production-profile.ts'

const configPath = process.argv[2]
if (configPath === undefined) throw new Error('tool-permission fixture requires an overlay')

const ctx = await bootProductionProfile({
  binName: 'agent-team-presets-permission-test',
  profile: 'headless',
  overlayPaths: [configPath],
})

const signal = new AbortController().signal
const toolResults: Array<{ sessionId: string; content: string[] }> = []
const members: Agent[] = []
const disposeEvents = ctx.on('session/event', (session, event: SessionEvent) => {
  if (event.type !== 'tool/result') return
  toolResults.push({
    sessionId: session.id,
    content: event.data.message.content.flatMap(block => block.type === 'text' ? [block.text] : []),
  })
})
const disposeCreated = ctx.on('agent/created', ({ agent }) => {
  if (agent.session.header.origin === 'subagent') members.push(agent)
})

try {
  const main = await new Promise<Agent | undefined>((resolve) => {
    const existing = ctx.agents.list().find(agent => agent.session.header.origin !== 'subagent')
    if (existing !== undefined) { resolve(existing); return }
    const dispose = ctx.on('agent/created', ({ agent }) => {
      if (agent.session.header.origin === 'subagent') return
      dispose()
      resolve(agent)
    })
  })
  if (main === undefined) throw new Error('configured root Agent did not activate')

  const captainTools = ctx.tools.schemas(main).map(tool => tool.name).sort()
  const captainSystem = (await ctx.systemPrompt.assemble(assembleContextFor(main))).sections
    .map(section => section.text)
    .join('\n\n')
  const denied = await ctx.tools.execute({
    callId: ToolCallId('captain-denied-echo'),
    name: 'team_permission_echo',
    arguments: { message: 'captain must not reach this' },
    agent: main,
    signal,
  })
  const spawned = await ctx.tools.execute({
    callId: ToolCallId('captain-spawn-member'),
    name: 'spawn_team_member',
    arguments: { member: 'member', task: 'Run the global tool you are allowed to use.' },
    agent: main,
    signal,
  })
  const preset = await ctx.tools.execute({
    callId: ToolCallId('captain-get-preset'),
    name: 'get_team_preset',
    arguments: {},
    agent: main,
    signal,
  })
  const presetRevision = (JSON.parse(preset.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('')) as { revision: number }).revision
  // Attempt a real preset write while the Team is executing. The busy gate must
  // refuse it, and the stored Team must still report its original description at
  // its original revision after the run.
  const busyMembers = ctx.agentTeams.listMembers(main)
    .filter(member => member.role === 'teammate' && (member.status === 'running' || member.status === 'provisioning')).length
  const presetWhileBusy = await ctx.tools.execute({
    callId: ToolCallId('captain-write-while-busy'),
    name: 'update_team_preset',
    arguments: { team_id: 'restricted-team', revision: presetRevision, team_description: 'rewritten while the Team runs' },
    agent: main,
    signal,
  })

  for (const member of members) await member.whenIdle()
  // With the Team idle the same call reaches the next gate: no user turn.
  const presetEdit = await ctx.tools.execute({
    callId: ToolCallId('captain-edit-preset'),
    name: 'update_team_preset',
    arguments: { team_id: 'restricted-team', revision: presetRevision, team_description: 'rewritten outside a turn' },
    agent: main,
    signal,
  })
  const presetAfter = await ctx.tools.execute({
    callId: ToolCallId('captain-get-preset-after'),
    name: 'get_team_preset',
    arguments: { team_id: 'restricted-team' },
    agent: main,
    signal,
  })
  await writeFile('tool-permissions.json', JSON.stringify({
    captainTools,
    captainSystem,
    captainDenied: { isError: denied.isError, content: denied.content },
    spawn: { isError: spawned.isError, content: spawned.content },
    preset: { isError: preset.isError, content: preset.content },
    presetEdit: { isError: presetEdit.isError, content: presetEdit.content },
    busyMembers,
    presetWhileBusy: { isError: presetWhileBusy.isError, content: presetWhileBusy.content },
    presetAfter: { isError: presetAfter.isError, content: presetAfter.content },
    memberTools: members.map(member => ({
      id: member.id,
      tools: ctx.tools.schemas(member).map(tool => tool.name).sort(),
    })),
    requests: (await readFile('tool-permission-requests.jsonl', 'utf8')).trim().split('\n')
      .filter(line => line !== '').map(line => JSON.parse(line) as { sessionId?: string; tools: string[]; system: string }),
    toolResults,
  }))
} finally {
  disposeCreated()
  disposeEvents()
  await ctx.fiber.dispose()
}
