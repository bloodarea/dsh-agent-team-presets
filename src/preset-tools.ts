/**
 * Model-facing Team preset tools for the captain of a Session.
 *
 * `get_team_preset` reads the preset this Session runs and the exact revision
 * the settings document is at; `update_team_preset` replaces the descriptions
 * and standing prompts it names. Both register in one Session-root Agent scope,
 * so a teammate never sees them. A preset is shared by every Session that
 * selected it, so a teammate report or an automatic continuation must not
 * rewrite it, and a write waits for the run to end rather than changing the
 * definition under executing members. A saved change reaches an idle Session
 * right away, while a Session whose Team task is running adopts it before its
 * next Team task begins.
 * @module dsh-agent-team-presets/preset-tools
 */

import type { Context } from '@deepseek-ai/cordis'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { HarnessError } from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-session-projection'
import type {} from '@deepseek-ai/dsh-settings'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { InferValue, ToolRunContext, ValueSchemaSpec } from '@deepseek-ai/dsh-tools'
import type { Config } from './config.ts'
import { editTeamPreset, promptTemplateFailure } from './preset-editor.ts'
import type { TeamMemberEdit, TeamPresetEdit } from './preset-editor.ts'
import { memberTargets, selectedTeam } from './presets.ts'
import type { TeamPreset } from './types.ts'

/** One Team the captain may pick, as the tools report it. */
const TEAM_SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    description: { type: 'string', required: true },
    members: { type: 'array', required: true, items: { type: 'string' } },
  },
} as const

/** One member the captain may edit, as the read tool reports it. */
const TEAM_MEMBER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    member: { type: 'string', required: true },
    name: { type: 'string', required: true },
    description: { type: 'string', required: true },
    systemPrompt: { type: 'string', required: true },
  },
} as const

/** One stored Team with every editable field, as the read tool reports it. */
const TEAM_DETAIL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    description: { type: 'string', required: true },
    captainName: { type: 'string', required: true },
    captainDescription: { type: 'string', required: true },
    captainSystemPrompt: { type: 'string', required: true },
    members: { type: 'array', required: true, items: TEAM_MEMBER_SCHEMA },
  },
} as const

const GET_VALUE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    status: { type: 'string', required: true, enum: ['ready', 'no-selection', 'unknown-team', 'unavailable'] },
    revision: { type: 'integer' },
    selectedTeamId: { type: 'string' },
    teams: { type: 'array', required: true, items: TEAM_SUMMARY_SCHEMA },
    team: TEAM_DETAIL_SCHEMA,
    executingMembers: { type: 'integer' },
    message: { type: 'string', required: true },
  },
} as const

const UPDATE_VALUE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    status: { type: 'string', required: true, enum: ['updated', 'unchanged', 'team-busy', 'no-selection', 'unknown-team', 'unavailable'] },
    revision: { type: 'integer' },
    teamId: { type: 'string' },
    changed: { type: 'array', required: true, items: { type: 'string' } },
    message: { type: 'string', required: true },
  },
} as const

/** One editable member entry in the update tool's arguments. */
const MEMBER_EDIT_PARAMETER = {
  type: 'object',
  additionalProperties: false,
  properties: {
    member: { type: 'string', required: true, description: 'Member name or teammate target from the roster get_team_preset reports.' },
    description: { type: 'string', description: 'Replacement role description, at most 200 characters. Omit to keep the stored one.' },
    system_prompt: { type: 'string', description: 'Replacement standing system prompt for this member. Omit to keep the stored one.' },
  },
} as const

/**
 * Read the revision the settings document stands at.
 * @param ctx - host context providing the settings forms.
 * @param namespace - this plugin's settings entry id.
 * @returns the entry's current revision, or undefined when it has no configurable entry.
 */
function currentRevision(ctx: Context, namespace: string): number | undefined {
  return ctx.settings.describe().find(row => row.ns === namespace)?.revision
}

/** One Team summary the read tool returns. */
function teamSummary(team: TeamPreset): InferValue<typeof TEAM_SUMMARY_SCHEMA> {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    members: memberTargets(team).map(row => row.target),
  }
}

/** One Team with every editable field. */
function teamDetail(team: TeamPreset): InferValue<typeof TEAM_DETAIL_SCHEMA> {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    captainName: team.captain.name,
    captainDescription: team.captain.description,
    captainSystemPrompt: team.captain.systemPrompt,
    members: memberTargets(team).map(({ member, target }) => ({
      member: target,
      name: member.name,
      description: member.description,
      systemPrompt: member.systemPrompt,
    })),
  }
}

/**
 * Resolve one Team by identity or configured name.
 * @param teams - every configured Team preset.
 * @param key - Team identity, or its configured name.
 * @returns the matching Team, or undefined.
 */
function teamByName(teams: readonly TeamPreset[], key: string): TeamPreset | undefined {
  const wanted = key.trim()
  return teams.find(team => team.id === wanted || team.name.trim() === wanted)
}

/**
 * Whether the open turn of one Session-root Agent carries host-attested human input.
 *
 * An omitted `followup()` / `steer()` source resolves to `user`, so a non-human
 * producer supplies its own kind and cannot inherit this authority.
 * @param agent - the exact live calling Agent.
 * @param openTurnStartSeq - first sequence of the caller's open turn.
 * @returns whether a human `user/message` was accepted inside that turn.
 */
export function hasDirectHumanInput(agent: Agent, openTurnStartSeq: number): boolean {
  // oxlint-disable-next-line typescript/no-deprecated -- Existing Session history read; migration deferred.
  const events = agent.session.snapshotEvents()
  for (let seq = openTurnStartSeq + 1; seq < events.length; seq += 1) {
    const event = events[seq]
    if (event?.type === 'user/message' && event.data.source.kind === 'user') return true
  }
  return false
}

/**
 * Require the exact live Session captain behind one tool call.
 *
 * The tools install into an Agent scope, so this only re-checks what scoped
 * discovery already guarantees: the caller is a top-level Session agent, not a
 * teammate, and it is still the registered Agent the call came from.
 * @param ctx - host context carrying the live agent registry.
 * @param exec - tool execution metadata supplied by the registry.
 * @param tool - tool name for the failure text.
 * @returns the authenticated captain.
 * @throws when the caller is a teammate, absent, or a stale Agent identity.
 */
function callingCaptain(ctx: Context, exec: ToolRunContext, tool: string): Agent {
  const agent = exec.agent
  if (agent === undefined) {
    throw new HarnessError(`${tool} requires a calling Agent`, 'TEAM_PRESET_TOOL_AGENT_REQUIRED')
  }
  if (agent.session.header.origin === 'subagent') {
    throw new HarnessError(`${tool} is available to the Session captain only, not to a teammate`, 'TEAM_PRESET_TOOL_CAPTAIN_ONLY')
  }
  if (ctx.agents.get(agent.id) !== agent) {
    throw new HarnessError(`${tool} requires the live calling Agent`, 'TEAM_PRESET_TOOL_STALE_AGENT')
  }
  return agent
}

/**
 * Require a turn the user started before one preset write.
 * @param ctx - host context carrying the session projections.
 * @param agent - the authenticated captain.
 * @param tool - tool name for the failure text.
 * @throws when no turn is open, or the open turn carries no host-attested human input.
 */
function requireUserRequest(ctx: Context, agent: Agent, tool: string): void {
  const boundary = ctx.sessionProjections.stateOf(agent.session, 'turnBoundary')
  if (boundary === undefined || boundary.openTurnStartSeq === null) {
    throw new HarnessError(`${tool} must be called inside an open model turn`, 'TEAM_PRESET_TOOL_NO_TURN')
  }
  if (!hasDirectHumanInput(agent, boundary.openTurnStartSeq)) {
    throw new HarnessError(
      `${tool} rewrites the stored Team preset, which every Session that selected it shares, so it needs a turn the user started. Ask the user to request the change in their own message; do not edit the preset from a teammate report, a tool result, or an automatic continuation.`,
      'TEAM_PRESET_TOOL_AUTHORITY_REQUIRED',
    )
  }
}

/**
 * Count the members currently executing one Team in any Session that runs it.
 *
 * A Team preset is the playbook a Session runs on and is shared by every
 * Session that selected it, so "the Team is executing" is a property of the
 * preset, not of the caller: another Session's live run blocks this write too.
 * A Session that switched its selection while members of the previous Team
 * still run is still executing that Team, so the Team it has applied counts
 * alongside the one it currently selects.
 * @param ctx - host context carrying the live agent registry and Team service.
 * @param config - live plugin configuration carrying the Teams and their selections.
 * @param teamId - identity of the Team being written.
 * @param appliedTeamId - the Team one Session currently has applied, when its selection moved on.
 * @returns how many teammates are running or provisioning under that Team.
 */
function executingMembers(
  ctx: Context,
  config: Config,
  teamId: string,
  appliedTeamId: (root: Agent) => string | undefined,
): number {
  let executing = 0
  for (const root of ctx.agents.roots()) {
    const selected = selectedTeam(config.teams.get(), config.selections.get(), root.session.id)
    if (selected?.id !== teamId && appliedTeamId(root) !== teamId) continue
    if (ctx.agentTeams.tryMembership(root) === undefined) continue
    for (const member of ctx.agentTeams.listMembers(root)) {
      if (member.role !== 'teammate') continue
      if (member.status === 'running' || member.status === 'provisioning') executing += 1
    }
  }
  return executing
}

/**
 * Resolve the Team one call targets: the named Team, or the one this Session selected.
 * @param teams - every configured Team preset.
 * @param selection - the selected Team, when the Session selected one.
 * @param requested - Team identity or name the caller named, when it named one.
 * @returns the resolved Team, with the failure status when it could not be resolved.
 */
function resolveTarget(
  teams: readonly TeamPreset[],
  selection: TeamPreset | undefined,
  requested: string | undefined,
): { ok: true; team: TeamPreset } | { ok: false; status: 'no-selection' | 'unknown-team'; message: string } {
  if (requested === undefined) {
    if (selection === undefined) {
      return {
        ok: false,
        status: 'no-selection',
        message: `This Session selected no Team, so no Team is implied. Ask the user which Team to change, or have them pick one with the composer Team control, then name it here. Configured Teams: ${describeTeams(teams)}`,
      }
    }
    return { ok: true, team: selection }
  }
  const team = teamByName(teams, requested)
  if (team === undefined) {
    return {
      ok: false,
      status: 'unknown-team',
      message: `no configured Team matches "${requested}". Configured Teams: ${describeTeams(teams)}`,
    }
  }
  return { ok: true, team }
}

/**
 * Render the configured Teams for one failure message.
 * @param teams - every configured Team preset.
 * @returns one `id (name)` entry per Team, or a phrase when none is configured.
 */
function describeTeams(teams: readonly TeamPreset[]): string {
  if (teams.length === 0) return '(none configured)'
  return teams.map(team => team.name.trim() === '' ? team.id : `${team.id} (${team.name.trim()})`).join(', ')
}

/** Extract one model-facing reason from a refused settings write. */
function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** Model-facing report of what one applied write does and does not reach. */
function applyReport(changed: readonly string[]): string {
  return `Saved: replaced ${changed.join(', ')}. An idle Session adopts the new definition right away; a Session whose Team task is running keeps the definition that task started with and adopts the new one before its next Team task begins. A member the Session spawns after it adopts the new definition uses it; a teammate that is already provisioned keeps the prompt it was spawned with.`
}

/**
 * Register the Team preset tools in one Session-root Agent scope.
 * @param ctx - host context providing settings and the live agent registry.
 * @param agent - the exact Session-root Agent that owns the tools.
 * @param config - live plugin configuration carrying the Teams and their selections.
 * @param namespace - this plugin's settings entry id.
 * @param appliedTeamId - the Team one Session currently has applied; the freeze
 *   keeps that Team live after a selection change, so its running members still
 *   block a write. Defaults to no applied Team for callers that hold no
 *   application state.
 * @returns the disposer that removes both tools.
 */
export function registerPresetTools(
  ctx: Context,
  agent: Agent,
  config: Config,
  namespace: string,
  appliedTeamId: (root: Agent) => string | undefined = () => undefined,
): () => void {
  const jsonOutput = <const S extends ValueSchemaSpec>(schema: S) => ({
    schema,
    render: (_args: unknown, value: InferValue<S>): [{ type: 'text'; text: string }] => [{ type: 'text', text: JSON.stringify(value) }],
  })

  const disposers = [
    agent.ctx.tools.register(defineTool({
      name: 'get_team_preset',
      description: 'Read the Agent Team preset for this Session with the exact settings revision and every editable field. Call it before update_team_preset. When this Session selected no Team, the result says so and lists the configured Teams.',
      parameters: {
        team_id: { type: 'string', description: 'Team identity or name to read; omit to read the Team this Session selected.' },
      },
      output: jsonOutput(GET_VALUE_SCHEMA),
      execute(args, exec) {
        const captain = callingCaptain(ctx, exec, 'get_team_preset')
        const teams = config.teams.get()
        const selection = selectedTeam(teams, config.selections.get(), captain.session.id)
        const revision = currentRevision(ctx, namespace)
        const summaries = teams.map(teamSummary)
        if (revision === undefined) {
          return Promise.resolve({
            status: 'unavailable' as const,
            teams: summaries,
            ...selection === undefined ? {} : { selectedTeamId: selection.id },
            message: `"${namespace}" has no configurable settings entry, so no Team preset can be edited in this deployment.`,
          })
        }
        const resolved = resolveTarget(teams, selection, args.team_id)
        if (!resolved.ok) {
          return Promise.resolve({
            status: resolved.status,
            revision,
            teams: summaries,
            ...selection === undefined ? {} : { selectedTeamId: selection.id },
            message: resolved.message,
          })
        }
        const executing = executingMembers(ctx, config, resolved.team.id, appliedTeamId)
        return Promise.resolve({
          status: 'ready' as const,
          revision,
          teams: summaries,
          ...selection === undefined ? {} : { selectedTeamId: selection.id },
          team: teamDetail(resolved.team),
          executingMembers: executing,
          message: `${executing > 0 ? `This Team is executing right now (${String(executing)} member(s) running or provisioning), so update_team_preset will refuse this preset until the run ends or those members are interrupted, and the running task keeps the definition it started with. Its member routes are not frozen: a member's provider, model, and reasoning effort changed in Settings apply to the next member the captain summons, including in this task. ` : ''}Editing an existing Team preset is a settings write fenced by revision ${String(revision)}. Pass that revision to update_team_preset. Only descriptions and standing prompts change here: names, member routes, and tool policies stay as configured.`,
        })
      },
    })),
    agent.ctx.tools.register(defineTool({
      name: 'update_team_preset',
      description: 'Replace the description or standing prompt of a Team preset, its captain, or one of its members, and persist it. Use it only when the user explicitly asks to adjust the Team after seeing how it worked. The Team preset is shared by every Session that selected it, and the write is refused while the Team is executing, because the running task keeps the definition it started with. A member\'s model route is not part of that definition: a route changed in Settings applies to the next member the captain summons, without waiting for the task to end. An idle Session adopts a saved change right away; a Session whose Team task is running adopts the change before its next Team task begins. Get the revision from get_team_preset first. This never renames anyone and never changes models or tool policies.',
      parameters: {
        revision: { type: 'integer', required: true, description: 'Exact settings revision returned by get_team_preset.' },
        team_id: { type: 'string', description: 'Team identity or name to change; omit to change the Team this Session selected.' },
        team_description: { type: 'string', description: 'Replacement Team purpose, read by the captain and by every member it summons. Omit to keep the stored one.' },
        captain_description: { type: 'string', description: 'Replacement captain role description. Omit to keep the stored one.' },
        captain_system_prompt: { type: 'string', description: 'Replacement captain standing system prompt, installed as the Session persona. Omit to keep the stored one.' },
        members: { type: 'array', items: MEMBER_EDIT_PARAMETER, description: 'Member edits, each naming a member from the roster get_team_preset reports.' },
      },
      output: jsonOutput(UPDATE_VALUE_SCHEMA),
      async execute(args, exec) {
        const captain = callingCaptain(ctx, exec, 'update_team_preset')

        const teams = config.teams.get()
        const selection = selectedTeam(teams, config.selections.get(), captain.session.id)
        const revision = currentRevision(ctx, namespace)
        if (revision === undefined) {
          return {
            status: 'unavailable' as const,
            changed: [],
            message: `"${namespace}" has no configurable settings entry, so no Team preset can be edited in this deployment.`,
          }
        }
        // The target resolves before the authority check so a Session with no
        // selection still receives the actionable "ask the user which Team"
        // answer instead of a refusal it cannot act on.
        const resolved = resolveTarget(teams, selection, args.team_id)
        if (!resolved.ok) {
          return {
            status: resolved.status,
            revision,
            changed: [],
            message: resolved.message,
          }
        }
        // A preset is the playbook the Team is running on. The captain's live
        // application is frozen for the duration of a Team task, and rewriting
        // the stored preset mid-run would still leave the executing teammates on
        // the definition they were spawned with, so the write waits for the run
        // to end instead of racing it.
        const executing = executingMembers(ctx, config, resolved.team.id, appliedTeamId)
        if (executing > 0) {
          return {
            status: 'team-busy' as const,
            revision,
            teamId: resolved.team.id,
            changed: [],
            message: `Team "${resolved.team.name.trim() === '' ? resolved.team.id : resolved.team.name.trim()}" is executing: ${String(executing)} member(s) are running or provisioning, so the preset is not written. Wait for those members to finish, or interrupt them with interrupt_agent, then call get_team_preset again and retry with the revision it returns; the running task keeps the definition it started with. A member's provider, model, and reasoning effort are outside that frozen definition, so the Settings page can correct a route while the task runs and the next member the captain summons uses it.`,
          }
        }
        requireUserRequest(ctx, captain, 'update_team_preset')
        if (args.revision !== revision) {
          throw new HarnessError(
            `revision ${String(args.revision)} is stale; the Team preset document is at revision ${String(revision)}. Call get_team_preset again and retry with the revision it returns.`,
            'TEAM_PRESET_TOOL_STALE_REVISION',
          )
        }

        // Only the prompts this call supplies are checked: a stored prompt the
        // Settings page wrote is never revalidated, so an unrelated edit still
        // succeeds. A group that cannot resolve would fail the captain's very
        // next request, which is exactly the edit a running Session must not take.
        const suppliedPrompts = [
          ...args.captain_system_prompt === undefined ? [] : [args.captain_system_prompt],
          ...(args.members ?? []).flatMap(entry => entry.system_prompt === undefined ? [] : [entry.system_prompt]),
        ]
        if (suppliedPrompts.some(text => text.includes('{{'))) {
          const assembly = await ctx.systemPrompt.assemble(assembleContextFor(captain))
          for (const text of suppliedPrompts) {
            const failure = promptTemplateFailure(text, assembly.variables)
            if (failure !== undefined) {
              throw new HarnessError(
                `the Team prompt was refused: ${failure}. Write the literal text without that group, or name a registered variable.`,
                'TEAM_PRESET_TOOL_INVALID_PROMPT',
              )
            }
          }
        }

        const edit: TeamPresetEdit = {
          ...args.team_description === undefined ? {} : { description: args.team_description },
          ...args.captain_description === undefined ? {} : { captainDescription: args.captain_description },
          ...args.captain_system_prompt === undefined ? {} : { captainSystemPrompt: args.captain_system_prompt },
          ...args.members === undefined ? {} : {
            members: args.members.map((entry): TeamMemberEdit => ({
              member: entry.member,
              ...entry.description === undefined ? {} : { description: entry.description },
              ...entry.system_prompt === undefined ? {} : { systemPrompt: entry.system_prompt },
            })),
          },
        }
        const applied = editTeamPreset(resolved.team, edit)
        if (!applied.ok) {
          throw new HarnessError(applied.message, 'TEAM_PRESET_TOOL_INVALID_EDIT')
        }
        if (applied.changed.length === 0) {
          return {
            status: 'unchanged' as const,
            revision,
            teamId: resolved.team.id,
            changed: [],
            message: `Every supplied value already matched the stored Team preset, so nothing was written. The document stays at revision ${String(revision)}.`,
          }
        }

        const next = teams.map(team => team.id === resolved.team.id ? applied.team : team)
        try {
          await ctx.settings.update(namespace, { teams: next }, revision)
        } catch (error: unknown) {
          throw new HarnessError(
            `the Team preset write was refused: ${reasonOf(error)}. Call get_team_preset for the current revision and retry.`,
            'TEAM_PRESET_TOOL_WRITE_REFUSED',
          )
        }
        const written = currentRevision(ctx, namespace)
        return {
          status: 'updated' as const,
          ...written === undefined ? {} : { revision: written },
          teamId: resolved.team.id,
          changed: [...applied.changed],
          message: applyReport(applied.changed),
        }
      },
    })),
  ]
  return () => {
    for (const dispose of disposers.reverse()) dispose()
  }
}
