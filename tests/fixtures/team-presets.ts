/** Team preset fixtures shared by the Host-side specs. */

import type { TeamAgentPreset, TeamCaptainPreset, TeamPreset } from '../../src/types.ts'

/** One member slot carrying the supplied fields over the empty defaults. */
export function slot(overrides: Partial<TeamAgentPreset> = {}): TeamAgentPreset {
  return {
    name: 'member',
    color: '',
    description: '',
    provider: '',
    model: '',
    reasoningEffort: '',
    tools: [],
    systemPrompt: '',
    ...overrides,
  }
}

/** One captain slot carrying the supplied fields over the empty defaults. */
export function captainSlot(overrides: Partial<TeamCaptainPreset> = {}): TeamCaptainPreset {
  return {
    name: 'captain',
    color: '',
    description: '',
    tools: [],
    systemPrompt: '',
    ...overrides,
  }
}

/**
 * A captain stored while captains still owned a route.
 *
 * The settings schema merges members it does not declare, so a document written
 * before captains stopped routing arrives with these three keys at runtime.
 */
export type RoutedCaptainPreset = TeamCaptainPreset & {
  provider: string
  model: string
  reasoningEffort: string
}

/** One routed captain carrying the supplied fields over the stored defaults. */
export function routedCaptain(overrides: Partial<RoutedCaptainPreset> = {}): RoutedCaptainPreset {
  return {
    name: 'captain',
    color: '',
    description: '',
    tools: [],
    systemPrompt: 'Captain prompt',
    provider: 'deepseek',
    model: 'deepseek-chat',
    reasoningEffort: 'high',
    ...overrides,
  }
}

/** One Team preset with the supplied members and captain fields. */
export function team(members: TeamAgentPreset[], captain: Partial<TeamCaptainPreset> = {}): TeamPreset {
  return {
    id: 'team-1',
    name: 'Team',
    description: '',
    members,
    captain: captainSlot({ systemPrompt: 'Captain prompt', ...captain }),
  }
}
