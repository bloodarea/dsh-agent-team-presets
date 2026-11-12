/**
 * Apply one Team preset to one live Session.
 *
 * A captain-led Session takes the captain's system prompt as its persona, the
 * captain's independent tool mode as its tool scope, and gains
 * `spawn_team_member`, which applies the selected member's own persona, route,
 * reasoning effort, and tool mode. Such a Session keeps the model it already
 * selected: a captain never changes the Session's route. A member's persona and
 * tool mode belong to the definition the Team task started with; its route does
 * not, so a corrected route reaches the next member the task summons.
 *
 * A Session can also talk to ONE member directly. That application installs the
 * member's role card as the deployment persona, the member's own tool policy,
 * and no captain briefing and no member tool: the Session is the member, not a
 * Team Lead. Selecting that member's model route is a separate Host step, so
 * this module never changes any Session model by itself.
 * @module dsh-agent-team-presets/application
 */

import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-subagent'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm'
import type { ContentBlock } from '@deepseek-ai/dsh-llm/types'
import { SessionId } from '@deepseek-ai/dsh-session'
import { randomUUID } from 'node:crypto'
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { IMPLICIT_TOOLS, captainBriefing, definitionFingerprint, findMember, memberBriefing, memberRouteOf, memberTargets, memberTeamDivision, soloMemberBriefing, toolMode } from './presets.ts'
import type { ConfiguredMemberRoute } from './presets.ts'
import type { TeamAgentPreset, TeamCaptainPreset, TeamPreset } from './types.ts'
import type { MemberRuntime } from './member-runtime.ts'
import { depthRefusal, routeRefusal } from './delegation.ts'
import { memberProviderFor } from './member-identity.ts'
import { guardPolicy, inheritedFilter, isOwnLayerTool, policyOf } from './tool-policy.ts'
import { SPAWN_TEAM_MEMBER_DESCRIPTION } from './tool-descriptions.ts'
import { prepareNativePresentation } from './presentation.ts'
import { reserveMember, teamMembers } from './team-runtime.ts'

/** The route this plugin actually installed on one created member. */
const MEMBER_ROUTE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    provider: { type: 'string', required: true },
    model: { type: 'string', required: true },
    reasoningEffort: { type: 'string' },
  },
} as const

/** Output schema of one `spawn_team_member` result. */
const SPAWN_VALUE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    target: { type: 'string', required: true },
    status: { type: 'string', required: true, enum: ['active', 'failed'] },
    // The route this plugin installed from the member's frozen snapshot. The
    // host roster reports a different value (it falls back to the Lead's
    // options), so the two are never presented as one fact.
    configuredRoute: MEMBER_ROUTE_SCHEMA,
  },
} as const

/** One applied Team preset, owned until the Session's Team changes. */
export interface TeamApplication {
  /** Identity of the applied Team preset. */
  readonly teamId: string
  /**
   * Stable identity of the member this Session runs as, or undefined when the
   * Team's captain leads it. Two applications of one Team differ when this
   * differs, so the Host compares it with the stored selection as well as the
   * definition fingerprint.
   */
  readonly roleId?: string
  /** Fingerprint of the applied definition, so an unchanged one is not re-applied. */
  readonly fingerprint: string
  /**
   * The member route this application installed as the Session model, when it
   * runs as a member. A stored route change is a different application, so the
   * Host compares it with the selection as well as the definition fingerprint.
   */
  readonly route?: ConfiguredMemberRoute
  /** Disclosure of the tool presentation this Session effectively runs with, when it was overridden. */
  readonly presentationNote?: string
  /** Release every registration and restore the Session's own composition. */
  dispose(): void
}

/**
 * Read the latest stored definition of the Team a Session has applied.
 *
 * A running task keeps the definition it started with, but reads the fields it
 * does not freeze — a member's route — from here at spawn time, so a corrected
 * route reaches the next member that task summons.
 */
export type StoredTeam = () => TeamPreset | undefined

/** Continuable-subagent providers the member tool spawns through. */
export interface MemberProviders {
  /** Provider alias a fresh member is created through. */
  readonly fresh: string
  /** Provider alias a member forked from the captain's completed turns is created through. */
  readonly fork: string
  /** Why a fresh member cannot be created in this deployment, when its alias is unusable. */
  readonly freshError?: string | undefined
  /** Why a forked member cannot be created in this deployment, when its alias is unusable. */
  readonly forkError?: string | undefined
}

/**
 * Which configured role one Session runs as.
 *
 * `captain` is the original Team application: the captain leads, may summon
 * members, and never changes the Session's model. `member` is individual chat:
 * that member's role card and tool policy are installed instead, and the Host
 * selects the member's configured route separately.
 */
export type TeamApplicationTarget =
  | { readonly kind: 'captain' }
  | {
    /** The configured member slot the Session runs as. */
    readonly kind: 'member'
    /** The member slot, resolved from the Team definition being applied. */
    readonly member: TeamAgentPreset
    /** Stable role identity of that member. */
    readonly roleId: string
  }

/** Host-side facts one Team application needs beyond the preset itself. */
export interface TeamApplicationOptions {
  /** Which role the Session runs as; defaults to the captain. */
  readonly target?: TeamApplicationTarget
  /**
   * The deployment persona text an active complete preset supplied, kept
   * visible beside this Team's briefing when the captain states no prompt.
   */
  readonly personaFallback?: string
  /**
   * The native tool presentation a prepared caller established.
   *
   * A custom policy needs a native surface, and an Agent scope accepts exactly
   * one presentation declaration: the prepared caller owns this install and its
   * verification, so the guard must not declare a second one. The install is
   * part of the application's rollback region.
   */
  readonly presentation?: {
    /**
     * Disclosure of the effective presentation, when applying the Team actually
     * overrode the Agent preset's own declaration.
     */
    readonly disclosure?: string | undefined
    /** Declare the presentation and return the disposer that releases it. */
    readonly install: () => () => void
  }
}

/** Child Agent options resolved from one configured slot. */
interface RouteOptions {
  /** LLM provider route id. */
  readonly provider: string
  /** Provider-owned model id. */
  readonly model: string
  /** Adapter-owned reasoning effort, when the slot configured one. */
  readonly reasoningEffort?: ReturnType<typeof ReasoningEffortId>
}

/**
 * Build the route one configured member runs on.
 *
 * Shared with the Host so the Session model it selects and the route a summoned
 * child receives are derived by the same rule: both route ids must be non-empty,
 * and an empty reasoning effort keeps the adapter default.
 * @param preset - the configured member.
 * @returns the route, or undefined when the member inherits the Session route.
 */
export function memberRouteOptions(preset: TeamAgentPreset): RouteOptions | undefined {
  const route = memberRouteOf(preset)
  if (route === undefined) return undefined
  return {
    provider: route.provider,
    model: route.model,
    ...route.reasoningEffort === '' ? {} : { reasoningEffort: ReasoningEffortId(route.reasoningEffort) },
  }
}

/**
 * Register one slot's tool scope on one Session.
 * Invalid tool names reject application instead of granting unrestricted access.
 * @param agent - the live Session agent.
 * @param team - the Team whose policy namespace the slot belongs to.
 * @param slot - configured policy and allow-list; custom-empty denies every global tool.
 * @returns the restriction disposer, or undefined for the default-all policy.
 */
function restrictSlotTools(
  agent: Agent,
  team: TeamPreset,
  slot: TeamAgentPreset | TeamCaptainPreset,
): (() => void) | undefined {
  if (toolMode(slot) === 'all') return undefined
  const filter = inheritedFilter(agent, policyOf(team.id, slot))
  return filter === undefined ? undefined : agent.ctx.tools.restrict(filter)
}

/**
 * Reject one slot this Session cannot apply, before any registration is touched.
 *
 * `tools.restrict` owns the authority on which global names an allow-list may
 * carry, and the probe applies and lifts it so the real application still
 * registers exactly one restriction. Every other registration a slot needs
 * uses names and orders fixed by this plugin, so an allow-list naming an
 * unknown tool is the failure an adoption can actually hit. Callers check
 * before releasing a running application, so a refused preset never leaves a
 * Session without one.
 * @param agent - the live Session agent about to take the Team.
 * @param team - the Team preset about to be applied.
 * @param slot - the captain or member whose policy is validated.
 * @throws when the slot's custom allow-list names a tool this Session cannot restrict.
 */
export function assertSlotApplicable(
  agent: Agent,
  team: TeamPreset,
  slot: TeamAgentPreset | TeamCaptainPreset,
): void {
  if (toolMode(slot) === 'all') return
  const filter = inheritedFilter(agent, policyOf(team.id, slot))
  if (filter !== undefined) agent.ctx.tools.restrict(filter)()
}

/**
 * Reject a captain-led Team this Session cannot apply.
 * @param agent - the live Session agent about to take the Team.
 * @param team - the Team preset about to be applied.
 * @throws when the captain's custom allow-list names a tool this Session cannot restrict.
 */
export function assertTeamApplicable(agent: Agent, team: TeamPreset): void {
  assertSlotApplicable(agent, team, team.captain)
}

/**
 * Reject a Team whose allow-list names a capability this Session does not have.
 *
 * The settings catalog is the union of every standing Agent preset's tools, not
 * what one Session can actually call: a `minimal` Session composes no file
 * tools, so an allow-list naming one cannot be honoured. It is refused with the
 * missing names instead of being widened to the default-all policy or silently
 * trimmed, and the tool is never added just because the catalog lists it.
 * @param agent - the live Session agent about to take the Team.
 * @param team - the Team preset about to be applied.
 * @param target - the role being applied; a solo member validates only its own
 *   slot, because no captain or sibling is installed into that Session.
 * @returns the refusal text, or undefined when every named capability is reachable.
 */
export function capabilityRefusal(
  agent: Agent,
  team: TeamPreset,
  target?: TeamApplicationTarget,
): string | undefined {
  const missing = new Map<string, string[]>()
  const slots: Array<readonly [string, TeamAgentPreset | TeamCaptainPreset]> = target?.kind === 'member'
    ? [[`member "${target.member.name.trim() === '' ? target.roleId : target.member.name.trim()}"`, target.member]]
    : [
      ['captain', team.captain],
      ...team.members.map((member, index) => [`member "${member.name.trim() === '' ? `member-${index + 1}` : member.name.trim()}"`, member] as const),
    ]
  for (const [label, slot] of slots) {
    if (toolMode(slot) !== 'custom') continue
    for (const name of slot.tools) {
      if (isOwnLayerTool(name)) continue
      // An implicit tool is admitted by the policy itself and is never required
      // to exist, so a document written by an earlier version that still lists
      // one must not refuse the whole Team on a deployment that composes no such
      // tool.
      if (IMPLICIT_TOOLS.includes(name)) continue
      if (agent.ctx.tools.get(name, agent) !== undefined) continue
      missing.set(label, [...missing.get(label) ?? [], name])
    }
  }
  if (missing.size === 0) return undefined
  const detail = [...missing].map(([label, names]) => `${label}: ${names.join(', ')}`).join('; ')
  const subject = target?.kind === 'member' ? `Team "${team.id}" member "${target.roleId}"` : `Team "${team.id}"`
  return `${subject} names capabilities this Session cannot reach (${detail}). The tools catalog lists the union `
    + 'of every Agent preset, not what this Session composes: select an Agent preset that provides those tools, or '
    + 'remove them from the allow-list.'
}

/** How an official creation refusal is explained to the Team Lead. */
const CONCURRENT_CAPACITY = /active child limit/i
/** The Team's lifetime member allowance, which a finished member still occupies. */
const LIFETIME_QUOTA = /team member limit/i
/** The allowance the Host reported, when its refusal carries the number. */
const LIFETIME_LIMIT = /team member limit (\d+)/i

/**
 * One roster line this refusal can act on.
 *
 * The roster is the only place that knows whether an occupied slot belongs to a
 * member that still runs, or to a creation that never became usable. Without that
 * split the captain cannot tell a busy Team from one that will never summon again.
 */
export interface SpawnRosterEntry {
  readonly name: string
  readonly status: string
}

/**
 * Explain one failed creation in terms the captain can act on.
 *
 * The two limits are different: an activity slot frees itself when a member
 * finishes, while a used-up Team allowance never comes back. The official text
 * is always preserved verbatim inside the explanation, because it carries the
 * exact numbers the Host decided with.
 * @param error - the failure `startActivation` reported.
 * @param roster - current roster rows, used to name the slots that never became usable.
 * @returns the model-facing explanation.
 */
export function classifySpawnFailure(error: unknown, roster: readonly SpawnRosterEntry[] = []): string {
  const message = error instanceof Error ? error.message : String(error)
  if (CONCURRENT_CAPACITY.test(message)) {
    return 'No subagent slot is free right now: this deployment\'s concurrent subagent limit is reached. Wait for a '
      + `running member to finish, then summon again. (${message})`
  }
  if (LIFETIME_QUOTA.test(message)) {
    const limit = LIFETIME_LIMIT.exec(message)?.[1]
    const used = roster.length
    const failed = roster.filter(entry => entry.status === 'failed').map(entry => entry.name)
    const occupancy = limit === undefined
      ? `${used} roster slot${used === 1 ? '' : 's'} occupied`
      : `${used} of ${limit} roster slots occupied`
    const spent = failed.length === 0
      ? ''
      : `, and ${failed.length} of them never became usable (${failed.join(', ')})`
    return 'This Team has used up its lifetime member allowance. A member that already finished, or a creation that '
      + `never became usable, still occupies its Team roster slot (${occupancy}${spent}). The Host's roster is `
      + 'append-only and exposes no removal API, so a slot spent by a failed creation cannot be reclaimed; start a new '
      + `Session to summon more members. (${message})`
  }
  return message
}

/**
 * Pick the member whose route one spawn uses.
 *
 * The roster, role, standing prompt, and tool scope come from the definition
 * the task started with, so a task keeps summoning the members it began with.
 * The route is operational rather than behavioral: it is read from the stored
 * definition for the same target, which is how a route corrected while the task
 * runs reaches the next member the captain summons. A stored Team that is gone,
 * or that no longer carries the target, leaves the frozen route in place.
 * @param frozen - the member as the applied definition holds it.
 * @param stored - the latest stored definition of the applied Team, when the Host still has it.
 * @returns the member whose route this spawn uses.
 */
function routedMember(frozen: TeamAgentPreset, stored: TeamPreset | undefined): TeamAgentPreset {
  if (stored === undefined) return frozen
  if (frozen.id !== undefined) {
    const identified = stored.members.filter(member => member.id === frozen.id)
    return identified.length === 1 ? identified[0]! : frozen
  }
  // Legacy records have no stable identity. Match a unique display name, never
  // the index-derived target (reordering Chinese names must not change routes).
  const matches = stored.members.filter(member => member.name.trim() === frozen.name.trim())
  return matches.length === 1 ? matches[0]! : frozen
}

/**
 * Reserve one child name the subagent runtime accepts.
 *
 * A name is a lower-case segment of at most 32 characters that starts with a
 * letter and is never `lead`, so a display-derived target is adjusted rather
 * than passed through.
 * @param target - the configured teammate target.
 * @param used - names already taken among the captain's children.
 * @returns a free name for this creation.
 */
function availableName(target: string, used: ReadonlySet<string>): string {
  const prefixed = /^[a-z]/u.test(target) ? target : `m-${target}`
  const base = (prefixed === 'lead' ? 'lead-2' : prefixed).slice(0, 32).replace(/-+$/u, '')
  let name = base
  let suffix = 2
  while (used.has(name)) {
    const tail = `-${suffix++}`
    name = `${base.slice(0, 32 - tail.length).replace(/-+$/u, '')}${tail}`
  }
  return name
}

/**
 * Register the model-facing member tool on one Session.
 *
 * A subagent creation request carries no persona or tool filter, so the member's
 * route, persona, and tool scope travel through the durable member snapshot this
 * tool records BEFORE `startActivation` is called, and are installed by the
 * serial `agent/created` listener. The snapshot also reserves the child
 * identity, because the runtime publishes tree membership only after that
 * callback returns. A refused snapshot refuses the spawn: a member that could
 * not be recorded must not be created, because nothing would re-scope it.
 * @param ctx - the plugin context providing `subagents`.
 * @param agent - the live Session agent that owns the tool.
 * @param team - the applied Team preset.
 * @param providers - continuable-subagent providers to spawn through.
 * @param stored - reads the latest stored definition of the applied Team.
 * @param members - the durable member runtime owned by this plugin activation.
 * @returns the tool registration disposer.
 */
function registerMemberTool(
  ctx: Context,
  agent: Agent,
  team: TeamPreset,
  providers: MemberProviders,
  stored: StoredTeam,
  members: MemberRuntime | undefined,
): () => void {
  const targets = memberTargets(team)
  const summary = targets.map(({ target }) => target).join(', ')
  const reserved = new Set<string>()
  return agent.ctx.tools.register(defineTool({
    name: 'spawn_team_member',
    description: `${SPAWN_TEAM_MEMBER_DESCRIPTION} Available members: ${summary.length === 0 ? '(none)' : summary}.`,
    parameters: {
      member: { type: 'string', required: true, description: 'Member target from the active Team preset roster.' },
      task: { type: 'string', required: true, description: 'Complete initial task for the member, including every fact it needs.' },
      description: { type: 'string', description: 'Short description of the delegated responsibility; defaults to the member preset description.' },
      context: {
        type: 'string',
        enum: ['fresh', 'fork'],
        description: 'fresh starts without your history; fork inherits your completed turns. Defaults to fresh.',
      },
    },
    output: {
      schema: SPAWN_VALUE_SCHEMA,
      render: (_args: unknown, value: { target: string; status: string; configuredRoute?: unknown }) => [
        { type: 'text', text: JSON.stringify(value) },
      ],
    },
    async execute(args, exec) {
      const caller = exec.agent
      if (caller === undefined) throw new Error('spawn_team_member requires a calling Agent')
      const resolved = findMember(team, args.member)
      if (resolved === undefined) {
        throw new Error(`unknown Team member "${args.member}"; available members: ${targets.map(entry => entry.target).join(', ') || '(none)'}`)
      }
      const { member, target } = resolved
      if (toolMode(member) === 'custom') {
        const presentation = await prepareNativePresentation(caller)
        if (presentation.kind !== 'already-native') throw new Error(presentation.reason)
      }
      // No runtime means this Session was composed outside the plugin's
      // activation; a member it created could never be re-scoped, so refuse.
      if (members === undefined) {
        throw new Error('This Session was composed without the preset member runtime, so a summoned member '
          + 'could not be given its frozen configuration. Spawning a member is refused.')
      }
      // Creation admission comes before anything durable exists: a refused
      // creation leaves no intent record, no roster row, and no model request.
      const depth = depthRefusal(ctx, caller)
      if (depth !== undefined) throw new Error(depth)
      const context = args.context ?? 'fresh'
      // The alias is this member's durable identity: the Host writes it into the
      // roster and the child's own descriptor, which is what tells this member
      // apart from a native teammate after a restart.
      const alias = memberProviderFor(providers, context)
      if ('error' in alias) throw new Error(alias.error)
      const used = new Set(teamMembers(ctx, caller).map(row => row.name.split('/').pop() ?? row.name))
      for (const name of reserved) used.add(name)
      const instance = availableName(target, used)
      reserved.add(instance)
      try {
        return await members.admit(async () => {
          const task: ContentBlock[] = [{ type: 'text', text: args.task }]
          // Read the route now, not when the Team was applied: a route corrected
          // during this task applies to the next member it summons. It is then
          // verified against the live registry before any durable intent, so an
          // unusable route cannot fail inside the member's first turn.
          const route = memberRouteOptions(routedMember(member, stored()))
          const unusableRoute = await routeRefusal(ctx, route)
          if (unusableRoute !== undefined) throw new Error(unusableRoute)
          // Settings can change while the route check awaits, so the depth cap is
          // re-read at the last moment before the durable intent is written.
          const recheck = depthRefusal(ctx, caller)
          if (recheck !== undefined) throw new Error(recheck)
          const policy = policyOf(team.id, member)
          // The child identity is reserved here and recorded with the snapshot,
          // so the creation callback can identify this member before the runtime
          // publishes any membership for it.
          const childId = SessionId(randomUUID())
          const description = args.description
            ?? (member.description.trim() === '' ? member.name.trim() || target : member.description.trim())
          const prepared = await members.prepare({
            root: caller,
            childId,
            target: instance,
            teamId: team.id,
            roleId: member.id,
            displayName: member.name.trim(),
            roleDescription: member.description.trim(),
            // The definition a Team task froze owns the member's persona, its
            // team context, and its tool scope; `routedMember` above owns only
            // the route, so a corrected model reaches the next member summoned.
            persona: memberBriefing(team, member, instance),
            teamSection: memberTeamDivision(team, instance),
            roster: targets.map(entry => ({
              target: entry.target,
              display: entry.member.name.trim(),
              description: entry.member.description.trim(),
            })),
            route,
            policy,
            spawnContext: context,
          })
          if (prepared.kind === 'refused') throw new Error(prepared.reason)
          const release = reserveMember(caller, childId, instance)
          try {
            // The alias is this member's durable identity: the Host writes it into
            // the child's own descriptor, which is what tells this member apart
            // from a native teammate after a restart.
            const activation = members.track(await ctx.subagents.startActivation({
              provider: alias.name,
              label: description,
              prompt: task,
              parent: caller,
              signal: exec.signal,
              delivery: 'parent',
              name: instance,
              childId,
            }))
            return {
              target: activation.name,
              status: 'active' as const,
              ...route === undefined ? {} : { configuredRoute: { ...route } },
            }
          } catch (error: unknown) {
            // A failed spawn may still have created a child, so the snapshot is
            // never deleted; it is only marked when no child was observed.
            await members.markFailed(caller.id, instance)
            // A member whose own route is unusable fails inside its first turn,
            // and the Host then reports only its provisioning checkpoint. Name the
            // member's real cause so the fault is not mistaken for a Team fault.
            const cause = members.failureOf(caller.id, instance)
            const reported = classifySpawnFailure(error, teamMembers(ctx, caller))
            if (cause === undefined) throw new Error(reported, { cause: error })
            throw new Error(`${reported} (the member's own first request failed: ${cause})`, { cause: error })
          } finally { release() }
        })
      } finally { reserved.delete(instance) }
    },
  }))
}

/**
 * Apply one Team preset to one live Session.
 *
 * A later call for the same Session replaces the previous application.
 * @param ctx - the plugin context providing the Team and Session services.
 * @param agent - the live Session agent taking the Team.
 * @param team - the Team preset to apply.
 * @param providers - continuable-subagent providers the member tool spawns through.
 * @param stored - reads the latest stored definition of this Team, so a member
 *   spawned later runs on its current route; defaults to the applied definition.
 * @param members - the durable member runtime that freezes each summoned
 *   member's configuration before creation; without one the member tool refuses
 *   rather than creating a member nothing could re-scope.
 * @param options - the role to run as (captain by default), the deployment
 *   persona fallback, and the prepared presentation a strict policy needs.
 * @returns the applied Team (and member role, when one was installed), whose
 *   `dispose` releases every registration.
 */
export function applyTeamToAgent(
  ctx: Context,
  agent: Agent,
  team: TeamPreset,
  providers: MemberProviders,
  stored: StoredTeam = () => undefined,
  members?: MemberRuntime,
  options: TeamApplicationOptions = {},
): TeamApplication {
  const disposers: Array<() => unknown> = []
  const register = (disposer: (() => unknown) | undefined): void => {
    if (disposer !== undefined) disposers.push(disposer)
  }
  const target = options.target ?? { kind: 'captain' as const }
  const slot = target.kind === 'captain' ? team.captain : target.member
  const route = target.kind === 'member' ? memberRouteOf(target.member) : undefined
  try {
    // A captain-led Session reads the captain's own prompt. A solo member reads
    // a complete role card, which always names the member and the Team, so a
    // member slot with no standing prompt still gets an identity instead of the
    // deployment persona it was never meant to keep.
    const persona = target.kind === 'captain' ? team.captain.systemPrompt : soloMemberBriefing(team, target.member)
    if (persona.trim() !== '') {
      register(agent.ctx.systemPrompt.section({
        name: PERSONA_PREFIX_SECTION,
        order: agent.ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX'),
        text: persona,
      }))
    } else if (options.personaFallback !== undefined && options.personaFallback.trim() !== '') {
      // The deployment's own complete persona (the official `minimal` preset)
      // would otherwise reduce the assembled prompt to itself and hide this
      // Team's briefing from its own captain. Re-declaring that exact text under
      // the same section name WITHOUT `complete` keeps the deployment's wording
      // while letting this Team's sections participate. The preset's tool set
      // and its runtime-context suppression stay exactly as composed.
      register(agent.ctx.systemPrompt.section({
        name: PERSONA_PREFIX_SECTION,
        order: agent.ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX'),
        text: options.personaFallback,
      }))
    }
    // The captain's briefing names every summonable target. A solo member has no
    // roster and no summon tool, so installing it would describe capabilities
    // this Session does not have.
    if (target.kind === 'captain') {
      const briefing = captainBriefing(team)
      if (briefing !== '') {
        register(agent.ctx.systemPrompt.section({
          name: 'agent-team-presets:briefing',
          order: agent.ctx.systemPrompt.getSectionOrder('TEAM_POLICY'),
          text: briefing,
        }))
      }
    }
    register(guardPolicy(
      agent,
      policyOf(team.id, slot),
      target.kind === 'member'
        ? { role: 'solo' }
        : options.presentation === undefined ? {} : { presentation: 'caller' },
    ))
    if (options.presentation !== undefined) register(options.presentation.install())
    register(restrictSlotTools(agent, team, slot))
    if (target.kind === 'captain') register(registerMemberTool(ctx, agent, team, providers, stored, members))
  } catch (error: unknown) {
    for (const dispose of disposers.reverse()) void dispose()
    throw error
  }
  return {
    teamId: team.id,
    ...target.kind === 'member' ? { roleId: target.roleId } : {},
    ...route === undefined ? {} : { route },
    fingerprint: definitionFingerprint(team),
    ...options.presentation?.disclosure === undefined ? {} : { presentationNote: options.presentation.disclosure },
    dispose() {
      for (const dispose of disposers.splice(0).reverse()) void dispose()
    },
  }
}

/** Session identity helper kept with the application so both call sites brand identically. */
export type AppliedSessionId = SessionId
