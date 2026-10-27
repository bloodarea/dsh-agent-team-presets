/**
 * Pure Team preset helpers shared by the Host runtime and the browser page.
 * @module dsh-agent-team-presets/presets
 */

import type { TeamAgentPreset, TeamCaptainPreset, TeamPreset, TeamSelectionRecord, TeamSlotPreset } from './types.ts'

/**
 * The host tool that publishes the model-facing skill catalog and loads a body.
 *
 * It lives in this pure module because both faces need the name: the Host
 * admits it and the page must not offer it as a choice. It is not one
 * capability among many — the Host emits the whole catalog only while this
 * exact definition stays visible to the Agent, so a policy that hides it
 * silently removes every Team Skill assigned to that role. The plugin therefore
 * treats it as a precondition of an assignment, never as a configurable
 * capability.
 */
export const SKILL_TOOL_NAME = 'skill'

/**
 * The tool names a Team policy always admits and the page therefore never shows.
 *
 * Reading a saved allow-list that still contains one of these must keep working:
 * the value is admitted implicitly, so a document written by an earlier version
 * neither gains an unavailable-tool warning nor loses the entry on save.
 */
export const IMPLICIT_TOOLS: readonly string[] = [SKILL_TOOL_NAME]

/**
 * Resolve a slot's explicit tool policy or its legacy list-only setting.
 * @param agent - the configured captain or member.
 * @returns the policy shown in Settings and enforced by the runtime.
 */
export function toolMode(agent: TeamSlotPreset): 'all' | 'custom' {
  return agent.toolMode ?? (agent.tools.length === 0 ? 'all' : 'custom')
}

/** The member name grammar the Agent Teams service accepts. */
const MEMBER_TARGET = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

/**
 * Derive a teammate target from one member's display name.
 *
 * Teammate names are permanent, lower-kebab-case, and never reused, so a
 * display name that already satisfies the grammar is kept and any other name
 * is transliterated to `member-<index>`. The display name still reaches the
 * captain through the roster.
 * @param member - the configured member.
 * @param index - zero-based position in the Team's member list.
 * @param used - targets already taken in this Team; the returned target is added.
 * @returns the teammate target this member is summoned under.
 */
export function memberTarget(member: TeamAgentPreset, index: number, used: Set<string>): string {
  const candidate = member.name.trim().toLowerCase()
  const base = MEMBER_TARGET.test(candidate) && candidate !== 'lead' && candidate.length <= 64
    ? candidate
    : `member-${index + 1}`
  let target = base
  let suffix = 2
  while (used.has(target)) {
    target = `${base}-${suffix}`
    suffix += 1
  }
  used.add(target)
  return target
}

/**
 * Resolve one member by its display name or its teammate target.
 *
 * The resolved target travels with the member, so a caller never re-derives it
 * and cannot disagree with the roster about the name it summons.
 * @param team - the Team preset to search.
 * @param key - the model-authored member name.
 * @returns the matching member with its target, or undefined when the name is unknown.
 */
export function findMember(team: TeamPreset, key: string): { member: TeamAgentPreset; target: string } | undefined {
  const wanted = key.trim()
  const used = new Set<string>()
  for (const [index, member] of team.members.entries()) {
    const target = memberTarget(member, index, used)
    if (target === wanted.toLowerCase() || member.name.trim() === wanted) return { member, target }
  }
  return undefined
}

/**
 * List every addressable teammate target of one Team.
 * @param team - the Team preset.
 * @returns one entry per member, in declared order.
 */
export function memberTargets(team: TeamPreset): { member: TeamAgentPreset; target: string }[] {
  const used = new Set<string>()
  return team.members.map((member, index) => ({ member, target: memberTarget(member, index, used) }))
}

/**
 * Select the fields of one slot that a Team task owns.
 *
 * The effective tool policy is stored rather than the raw `toolMode`, so a
 * legacy record and an explicit one that behave identically describe the same
 * definition and never look like a change to a running task.
 * @param slot - the configured captain or member.
 * @returns the slot's definition fields, in a fixed order.
 */
function slotDefinition(slot: TeamSlotPreset): Record<string, unknown> {
  return {
    name: slot.name,
    description: slot.description,
    toolMode: toolMode(slot),
    tools: [...slot.tools],
    systemPrompt: slot.systemPrompt,
  }
}

/**
 * Identify the definition one Team task owns.
 *
 * A running Team task keeps the definition it started with: the Team's purpose,
 * the captain's persona, every member's role and standing prompt, the roster
 * the captain may summon, and each slot's tool scope. Two groups of fields are
 * deliberately outside it, because they are read from the stored preset when
 * they are needed rather than captured with the definition:
 *
 * - a member's `provider`, `model`, and `reasoningEffort`, which describe where
 *   a member runs rather than what the team does. Correcting a route is
 *   recovery work, so it must reach the next member a running task summons
 *   instead of waiting for that task to end.
 * - each slot's `color`, which the roster draws from the stored preset live.
 *
 * @param team - the Team preset.
 * @returns a stable JSON identity of the fields a task freezes.
 */
export function definitionFingerprint(team: TeamPreset): string {
  return JSON.stringify({
    id: team.id,
    name: team.name,
    description: team.description,
    captain: slotDefinition(team.captain),
    members: team.members.map(member => ({ ...slotDefinition(member), ...member.id === undefined ? {} : { id: member.id } })),
  })
}

/**
 * Locate one Team preset by identity.
 * @param teams - every configured Team preset.
 * @param teamId - the identity to resolve.
 * @returns the matching Team, or undefined.
 */
export function findTeam(teams: readonly TeamPreset[], teamId: string | undefined): TeamPreset | undefined {
  return teamId === undefined ? undefined : teams.find(team => team.id === teamId)
}

/**
 * Resolve the Team a Session selected.
 * @param teams - every configured Team preset.
 * @param selections - every Session selection record.
 * @param sessionId - the Session identity to resolve.
 * @returns the selected Team, or undefined when the Session selected none.
 */
export function selectedTeam(
  teams: readonly TeamPreset[],
  selections: readonly TeamSelectionRecord[],
  sessionId: string,
): TeamPreset | undefined {
  return findTeam(teams, selections.find(record => record.sessionId === sessionId)?.teamId)
}

/**
 * Replace the current Team selection of one Session.
 * @param selections - the current selection records.
 * @param sessionId - the Session whose selection changes.
 * @param teamId - the selected Team identity; undefined clears the selection.
 * @returns a new selection list, with the Session's record updated or removed.
 */
export function withSelection(
  selections: readonly TeamSelectionRecord[],
  sessionId: string,
  teamId: string | undefined,
): TeamSelectionRecord[] {
  const rest = selections.filter(record => record.sessionId !== sessionId)
  return teamId === undefined ? rest : [...rest, { sessionId, teamId }]
}

/**
 * Name one Team the way its own prompts address it.
 * @param team - the Team preset.
 * @returns the configured name, or the Team identity when it has no name.
 */
function teamLabel(team: TeamPreset): string {
  return team.name.trim() === '' ? team.id : team.name.trim()
}

/**
 * Describe the captain to itself.
 * @param captain - the configured captain.
 * @returns the identity line, or an empty string when the captain states nothing.
 */
function captainIdentity(captain: TeamCaptainPreset): string {
  const name = captain.name.trim()
  const description = captain.description.trim()
  const subject = name === '' ? 'You are its captain' : `You are its captain "${name}"`
  return description === '' ? (name === '' ? '' : `${subject}.`) : `${subject}: ${description}`
}

/**
 * Build the briefing the captain reads for the Team it leads.
 *
 * The text states the Team's purpose, the captain's own role, and every
 * summonable target with its configured description, so the captain delegates
 * by the exact target the spawn tool accepts.
 * @param team - the Team preset applied to this Session.
 * @returns the prompt section text, or an empty string for a Team that says nothing about itself.
 */
export function captainBriefing(team: TeamPreset): string {
  const description = team.description.trim()
  const identity = captainIdentity(team.captain)
  const rows = memberTargets(team).map(({ member, target }) => {
    const memberDescription = member.description.trim()
    const label = member.name.trim()
    const display = label === '' || label === target ? '' : ` (${label})`
    return `- ${target}${display}${memberDescription === '' ? '' : `: ${memberDescription}`}`
  })
  if (description === '' && identity === '' && rows.length === 0) return ''
  const intro = description === ''
    ? `Team preset "${teamLabel(team)}" is active for this Session.`
    : `Team preset "${teamLabel(team)}" is active for this Session: ${description}`
  const roster = rows.length === 0 ? '' : `Summon a member with spawn_team_member(member, task). The targets below are fixed; use them verbatim.

${rows.join('\n')}`
  return [intro, identity, roster].filter(part => part !== '').join('\n\n')
}

/**
 * Build the briefing one summoned member reads.
 *
 * A member never sees the captain's roster, so its own prompt states the Team
 * it joined, its own role, and then the configured system prompt that defines
 * how it works.
 * @param team - the Team preset that owns the member.
 * @param member - the configured member.
 * @param target - the teammate target the captain summons it under.
 * @returns the persona text for the summoned member; it always names the Team it joined.
 */
export function memberBriefing(team: TeamPreset, member: TeamAgentPreset, target: string): string {
  const label = member.name.trim()
  const named = label === '' || label === target ? `"${target}"` : `"${target}" (${label})`
  const description = team.description.trim()
  const joined = description === ''
    ? `You are ${named} on the Agent Team "${teamLabel(team)}".`
    : `You are ${named} on the Agent Team "${teamLabel(team)}": ${description}`
  const role = member.description.trim()
  return [joined, role === '' ? '' : `Your role: ${role}`, member.systemPrompt.trim()]
    .filter(part => part !== '')
    .join('\n\n')
}

/**
 * Build the team-context section one summoned member reads besides its persona.
 *
 * The member's own briefing states who it is; this states the Team it belongs
 * to and the preset's division of labour, so it can tell which role another
 * target stands for without being handed the captain's summons instructions or
 * every sibling's standing prompt. The list is deliberately labelled as role
 * templates: several instances of one role may exist, and the preset says
 * nothing about who is running, so live addressing and status stay with
 * `list_agents`.
 * @param team - the Team preset that owns the member.
 * @param target - the real instance target this member was summoned under.
 * @returns the prompt section text for the member's team context.
 */
export function memberTeamDivision(team: TeamPreset, target: string): string {
  const description = team.description.trim()
  const heading = description === ''
    ? `Team preset "${teamLabel(team)}" is active for this Session.`
    : `Team preset "${teamLabel(team)}" is active for this Session: ${description}`
  const rows = memberTargets(team).map(({ member, target: rowTarget }) => {
    const rowDescription = member.description.trim()
    const label = member.name.trim()
    const display = label === '' || label === rowTarget ? '' : ` (${label})`
    return `- ${rowTarget}${display}${rowDescription === '' ? '' : `: ${rowDescription}`}`
  })
  const division = rows.length === 0
    ? 'The preset declares no other roles.'
    : `Preset division of labour (role templates, not a live roster):
${rows.join('\n')}`
  return [
    heading,
    division,
    `Your real instance target is "${target}". A role and an instance are not the same thing: one role may be summoned `
      + 'more than once, and the template list above does not report who is running now. Read the live roster and its '
      + 'statuses with list_agents; the Team Lead is addressed as "lead".',
  ].join('\n\n')
}
