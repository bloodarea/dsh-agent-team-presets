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

/** The grammar and length of a configured member's summon target. */
const MEMBER_TARGET = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u
const MEMBER_TARGET_LIMIT = 64

/** One member and the summon target assigned to it by its Team's roster. */
interface MemberTarget {
  readonly member: TeamAgentPreset
  readonly target: string
}

/** Return the member's normalized name when it can be used as a target. */
function preferredMemberTarget(member: TeamAgentPreset): string | undefined {
  const target = member.name.trim().toLowerCase()
  return target !== 'lead' && target.length <= MEMBER_TARGET_LIMIT && MEMBER_TARGET.test(target) ? target : undefined
}

/**
 * Claim a target for one member after the Team's preferred targets are reserved.
 * @param member - the configured member.
 * @param index - zero-based position in the Team's member list.
 * @param used - targets already taken in this Team; the returned target is added.
 * @returns the teammate target this member is summoned under.
 */
export function memberTarget(member: TeamAgentPreset, index: number, used: Set<string>): string {
  const preferred = preferredMemberTarget(member)
  let target: string
  if (preferred === undefined) {
    let number = index + 1
    while (used.has(`member-${number}`)) number += 1
    target = `member-${number}`
  } else {
    target = preferred
    let suffix = 2
    while (used.has(target)) {
      const tail = `-${suffix}`
      target = `${preferred.slice(0, MEMBER_TARGET_LIMIT - tail.length).replace(/-+$/u, '')}${tail}`
      suffix += 1
    }
  }
  used.add(target)
  return target
}

/**
 * List every addressable teammate target of one Team.
 * @param team - the Team preset.
 * @returns one entry per member, in declared order.
 */
export function memberTargets(team: TeamPreset): MemberTarget[] {
  const used = new Set<string>()
  const preferred = team.members.map(preferredMemberTarget)
  // Every distinct usable name gets its own address before generated targets
  // can claim one. The first of any repeated names keeps the unsuffixed target.
  const targets = preferred.map(target => {
    if (target === undefined || used.has(target)) return undefined
    used.add(target)
    return target
  })
  // Preserve each free positional fallback before moving any collided fallback
  // forward, so one collision cannot renumber unrelated members.
  for (const [index, target] of preferred.entries()) {
    if (target !== undefined) continue
    const fallback = `member-${index + 1}`
    if (used.has(fallback)) continue
    used.add(fallback)
    targets[index] = fallback
  }
  return team.members.map((member, index) => ({ member, target: targets[index] ?? memberTarget(member, index, used) }))
}

/** Resolve an exact target, then an exact display name, then a case-insensitive target. */
export function findMemberInRoster(roster: readonly MemberTarget[], key: string): MemberTarget | undefined {
  const wanted = key.trim()
  const normalized = wanted.toLowerCase()
  return roster.find(row => row.target === wanted)
    ?? roster.find(row => row.member.name.trim() === wanted)
    ?? roster.find(row => row.target === normalized)
}

/** Resolve one member by display name or the same target shown in the roster. */
export function findMember(team: TeamPreset, key: string): MemberTarget | undefined {
  return findMemberInRoster(memberTargets(team), key)
}

/**
 * Recover the role of a durable instance created before role ids were recorded.
 * Its instance name can overlap a different role's current summon target.
 */
export function recordedMemberRole(team: TeamPreset | undefined, record: {
  readonly roleId?: string | undefined
  readonly memberName: string
  readonly displayName: string
}): string | undefined {
  if (record.roleId !== undefined) return record.roleId
  if (team === undefined) return record.memberName
  const matches = team.members.filter(member => member.name.trim() === record.displayName)
  if (matches.length !== 1) return undefined
  const member = matches[0]!
  return member.id ?? member.name
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
 * Read the member role one Session selection names.
 *
 * An empty stored value is the captain-led meaning, exactly like an absent one:
 * the settings schema can project an empty string for a record written before a
 * role existed, and that must never be treated as a member identity.
 * @param selection - the Session's stored selection, when it has one.
 * @returns the member role identity, or undefined for a captain-led selection.
 */
export function selectedRoleId(selection: TeamSelectionRecord | undefined): string | undefined {
  const roleId = selection?.roleId
  return roleId === undefined || roleId.trim() === '' ? undefined : roleId
}

/**
 * One member's configured route, as the display and comparison path reads it.
 *
 * The Host selects a route only when BOTH ids are present; a half-configured
 * pair therefore inherits the Session route, exactly like an absent one.
 */
export interface ConfiguredMemberRoute {
  /** LLM provider route id. */
  readonly provider: string
  /** Provider-owned model id. */
  readonly model: string
  /** Adapter-owned reasoning effort; empty keeps the model default. */
  readonly reasoningEffort: string
}

/**
 * Read the route one member is configured to run on.
 * @param member - the configured member slot.
 * @returns the route, or undefined when the member inherits the Session route.
 */
export function memberRouteOf(member: TeamAgentPreset): ConfiguredMemberRoute | undefined {
  if (member.provider.trim() === '' || member.model.trim() === '') return undefined
  return { provider: member.provider, model: member.model, reasoningEffort: member.reasoningEffort }
}

/**
 * Compare two configured member routes, treating an empty effort as the default.
 * @param left - one route, or undefined for the Session route.
 * @param right - the other route, or undefined for the Session route.
 * @returns whether both describe the same route.
 */
export function sameMemberRoute(
  left: ConfiguredMemberRoute | undefined,
  right: ConfiguredMemberRoute | undefined,
): boolean {
  if (left === undefined || right === undefined) return left === right
  return left.provider === right.provider && left.model === right.model
    && (left.reasoningEffort.trim() === '' ? '' : left.reasoningEffort)
      === (right.reasoningEffort.trim() === '' ? '' : right.reasoningEffort)
}

/**
 * Locate one member slot by its stable identity.
 * @param team - the Team preset to search.
 * @param roleId - the member's stable identity.
 * @returns the matching member, or undefined when the slot no longer exists.
 */
export function findMemberById(team: TeamPreset | undefined, roleId: string | undefined): TeamAgentPreset | undefined {
  if (team === undefined || roleId === undefined) return undefined
  return team.members.find(member => member.id === roleId)
}

/**
 * Resolve the member a Session talks to individually.
 * @param teams - every configured Team preset.
 * @param selections - every Session selection record.
 * @param sessionId - the Session identity to resolve.
 * @returns the selected member, or undefined when the selection is captain-led
 *   or the member no longer exists.
 */
export function selectedMember(
  teams: readonly TeamPreset[],
  selections: readonly TeamSelectionRecord[],
  sessionId: string,
): TeamAgentPreset | undefined {
  const selection = selections.find(record => record.sessionId === sessionId)
  return findMemberById(findTeam(teams, selection?.teamId), selectedRoleId(selection))
}

/**
 * Replace the current Team selection of one Session.
 * @param selections - the current selection records.
 * @param sessionId - the Session whose selection changes.
 * @param teamId - the selected Team identity; undefined clears the selection.
 * @param roleId - the member to talk to individually; undefined keeps the
 *   captain leading the Session.
 * @returns a new selection list, with the Session's record updated or removed.
 */
export function withSelection(
  selections: readonly TeamSelectionRecord[],
  sessionId: string,
  teamId: string | undefined,
  roleId?: string,
): TeamSelectionRecord[] {
  const rest = selections.filter(record => record.sessionId !== sessionId)
  if (teamId === undefined) return rest
  const role = roleId === undefined || roleId.trim() === '' ? undefined : roleId
  return [...rest, { sessionId, teamId, ...role === undefined ? {} : { roleId: role } }]
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
 * Build the role card one member reads when the user talks to it directly.
 *
 * Individual chat turns the Session itself into that member: there is no Team
 * Lead above it, no captain briefing, and no summon tool. The card therefore
 * carries the member's identity, its role description, and its own standing
 * prompt, then says plainly that this is a direct conversation — a model that
 * was told it belongs to a Team would otherwise try to delegate or report to a
 * lead that does not exist in this Session.
 * @param team - the Team preset that owns the member.
 * @param member - the configured member the Session now runs as.
 * @returns the persona text for the Session; empty only for a completely empty slot.
 */
export function soloMemberBriefing(team: TeamPreset, member: TeamAgentPreset): string {
  const label = member.name.trim()
  const named = label === '' ? 'a member' : `"${label}"`
  const description = team.description.trim()
  const joined = description === ''
    ? `You are ${named} on the Agent Team "${teamLabel(team)}".`
    : `You are ${named} on the Agent Team "${teamLabel(team)}": ${description}`
  const role = member.description.trim()
  return [
    joined,
    role === '' ? '' : `Your role: ${role}`,
    member.systemPrompt.trim(),
    'The user is talking with you directly in this Session. You are not the Team Lead and there is no Team '
      + 'delegation available here: answer as this role yourself instead of summoning or reporting to a lead.',
  ].filter(part => part !== '').join('\n\n')
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
