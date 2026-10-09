import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'
import { runLoaderSmoke, LOADER_SMOKE_TEST_TIMEOUT_MS } from '@deepseek-ai/dsh-loader-smoke'

interface Captured {
  readonly captainTools: string[]
  readonly captainSystem: string
  readonly captainDenied: { readonly isError: boolean; readonly content: unknown }
  readonly spawn: { readonly isError: boolean; readonly content: unknown }
  readonly memberTools: ReadonlyArray<{ readonly id: string; readonly tools: string[] }>
  readonly toolResults: ReadonlyArray<{ readonly sessionId: string; readonly content: readonly string[] }>
  readonly requests: ReadonlyArray<{ readonly sessionId?: string; readonly tools: string[]; readonly system: string }>
}

test('applies independent captain and member tool policies through the production Loader composition', async () => {
  let captured: Captured | undefined
  await runLoaderSmoke({
    label: 'agent-team-presets tool permissions',
    tempDirPrefix: 'team-presets-permissions-',
    binScript: resolve(import.meta.dirname, 'fixtures/driver.ts'),
    libBinScript: resolve(import.meta.dirname, 'fixtures/driver.ts'),
    configPath: resolve(import.meta.dirname, 'fixtures/tool-permissions.patch.yml'),
    tsconfigPath: resolve(import.meta.dirname, '../../../../tsconfig.base.json'),
    inspect: async (cwd) => { captured = JSON.parse(await readFile(resolve(cwd, 'tool-permissions.json'), 'utf8')) as Captured },
  })
  if (captured === undefined) throw new Error('the composition driver wrote no capture')

  // The captain's custom-empty policy masks every configurable global tool from
  // the model surface and from execution, while scope-local coordination tools
  // and the Team member tool stay available.
  expect(captured.captainTools).not.toContain('team_permission_echo')
  expect(captured.captainTools).not.toContain('team_permission_blocked')
  expect(captured.captainTools).toContain('spawn_team_member')
  expect(captured.captainDenied.isError).toBe(true)
  expect(captured.spawn.isError).toBe(false)

  // The member keeps its own allow-list, independently of the captain: it sees
  // the one allowed global tool and not the unlisted one.
  expect(captured.memberTools).toHaveLength(1)
  expect(captured.memberTools[0]?.tools).toContain('team_permission_echo')
  expect(captured.memberTools[0]?.tools).not.toContain('team_permission_blocked')
  expect(JSON.stringify(captured.toolResults)).toContain('member execution reached')

  // Every configured description reaches the model that acts on it: the captain
  // reads the Team purpose, its own role, and one roster line per member, so it
  // can pick the member whose description fits the work; a summoned member reads
  // the Team it joined, its own role, and its own system prompt. A member prompt
  // is read at the provider boundary; the captain prompt comes from the same
  // production assembly the loop sends, because this fixture drives the captain
  // through its tools instead of through a model turn.
  const memberIds = new Set(captured.memberTools.map(entry => entry.id))
  const memberPrompt = captured.requests
    .filter(request => request.sessionId !== undefined && memberIds.has(request.sessionId))
    .map(request => request.system)
    .join('\n')
  const teamPurpose = 'Ships one feature with a restricted tool set'
  expect(captured.captainSystem).toContain(`Team preset "Restricted" is active for this Session: ${teamPurpose}`)
  expect(captured.captainSystem).toContain('You are its captain "captain": Leads the restricted team')
  expect(captured.captainSystem).toContain('- member: member allowed to run the echo tool')
  expect(memberPrompt).toContain(`You are "member" on the Agent Team "Restricted": ${teamPurpose}`)
  expect(memberPrompt).toContain('Your role: member allowed to run the echo tool')
  expect(memberPrompt).toContain('You run the echo tool when asked.')
}, LOADER_SMOKE_TEST_TIMEOUT_MS)
