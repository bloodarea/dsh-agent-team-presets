/**
 * Apply one Team preset to one live Session.
 *
 * The captain's system prompt shadows the deployment persona for that Session,
 * the captain's independent tool mode scopes the Session's visible global tools,
 * and the Session gains `spawn_team_member`, which applies the selected member's
 * own persona, route, reasoning effort, and tool mode. The Session keeps the
 * model it already selected: a captain never changes the Session's route.
 * @module dsh-agent-team-presets/application
 */

import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-experimental-agent-team'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm'
import type { ContentBlock } from '@deepseek-ai/dsh-llm/types'
import type { SessionId } from '@deepseek-ai/dsh-session'
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { captainBriefing, findMember, memberBriefing, memberTargets, toolMode } from './presets.ts'
import type { TeamAgentPreset, TeamCaptainPreset, TeamPreset } from './types.ts'

/** Output schema of one `spawn_team_member` result. */
const SPAWN_VALUE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    target: { type: 'string', required: true },
    status: { type: 'string', required: true, enum: ['active', 'failed'] },
    model: { type: 'string' },
  },
} as const

/** One applied Team preset, owned until the Session's Team changes. */
export interface TeamApplication {
  /** Identity of the applied Team preset. */
  readonly teamId: string
  /** JSON of the applied preset, so an unchanged Team is not re-applied. */
  readonly fingerprint: string
  /** Release every registration and restore the Session's own composition. */
  dispose(): void
}

/** Continuable-subagent providers the member tool spawns through. */
export interface MemberProviders {
  /** Provider used for a fresh member. */
  readonly fresh: string
  /** Provider used for a member forked from the captain's completed turns. */
  readonly fork: string
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
 * Build the child route of one configured agent slot.
 * @param preset - the configured captain or member.
 * @returns the child Agent options, or undefined without a configured route.
 */
function routeOptions(preset: TeamAgentPreset): RouteOptions | undefined {
  if (preset.provider === '' || preset.model === '') return undefined
  return {
    provider: preset.provider,
    model: preset.model,
    ...preset.reasoningEffort === '' ? {} : { reasoningEffort: ReasoningEffortId(preset.reasoningEffort) },
  }
}

/**
 * Register the captain's tool scope on one Session.
 * Invalid tool names reject application instead of granting unrestricted access.
 * @param agent - the live Session agent.
 * @param captain - configured policy and allow-list; custom-empty denies every global tool.
 * @returns the restriction disposer, or undefined for the default-all policy.
 */
function restrictCaptainTools(agent: Agent, captain: TeamCaptainPreset): (() => void) | undefined {
  if (toolMode(captain) === 'all') return undefined
  return agent.ctx.tools.restrict({ allow: [...captain.tools] })
}

/**
 * Register the model-facing member tool on one Session.
 * @param ctx - the plugin context providing `agentTeams`.
 * @param agent - the live Session agent that owns the tool.
 * @param team - the applied Team preset.
 * @param providers - continuable-subagent providers to spawn through.
 * @returns the tool registration disposer.
 */
function registerMemberTool(ctx: Context, agent: Agent, team: TeamPreset, providers: MemberProviders): () => void {
  const targets = memberTargets(team)
  const summary = targets.map(({ member, target }) => member.description.trim() === '' ? target : `${target} (${member.description.trim()})`).join('; ')
  return agent.ctx.tools.register(defineTool({
    name: 'spawn_team_member',
    description: `Create one teammate from the active Team preset, applying that member's own system prompt, model, reasoning effort, and tool scope. Available members: ${summary.length === 0 ? '(none)' : summary}.`,
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
      render: (_args: unknown, value: { target: string; status: string; model?: string }) => [
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
      const context = args.context ?? 'fresh'
      const task: ContentBlock[] = [{ type: 'text', text: args.task }]
      const route = routeOptions(member)
      const briefing = memberBriefing(team, member, target)
      const result = await ctx.agentTeams.spawnTeammate(caller, {
        name: target,
        description: args.description ?? (member.description.trim() === '' ? member.name.trim() || target : member.description.trim()),
        prompt: task,
        context,
        provider: context === 'fork' ? providers.fork : providers.fresh,
        ...route === undefined ? {} : { agentOptions: route },
        persona: briefing,
        ...toolMode(member) === 'all' ? {} : { toolFilter: { allow: [...member.tools] } },
        signal: exec.signal,
      })
      return {
        target: result.member.name,
        status: result.member.status === 'failed' ? 'failed' as const : 'active' as const,
        ...result.member.model === undefined ? {} : { model: result.member.model },
      }
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
 * @returns the applied Team, whose `dispose` releases every registration.
 */
export function applyTeamToAgent(ctx: Context, agent: Agent, team: TeamPreset, providers: MemberProviders): TeamApplication {
  const disposers: Array<() => unknown> = []
  const register = (disposer: (() => unknown) | undefined): void => {
    if (disposer !== undefined) disposers.push(disposer)
  }
  try {
    const { captain } = team
    if (captain.systemPrompt.trim() !== '') {
      register(agent.ctx.systemPrompt.section({
        name: PERSONA_PREFIX_SECTION,
        order: agent.ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX'),
        text: captain.systemPrompt,
      }))
    }
    const briefing = captainBriefing(team)
    if (briefing !== '') {
      register(agent.ctx.systemPrompt.section({
        name: 'agent-team-presets:briefing',
        order: agent.ctx.systemPrompt.getSectionOrder('TEAM_POLICY'),
        text: briefing,
      }))
    }
    register(restrictCaptainTools(agent, captain))
    register(registerMemberTool(ctx, agent, team, providers))
  } catch (error: unknown) {
    for (const dispose of disposers.reverse()) void dispose()
    throw error
  }
  return {
    teamId: team.id,
    fingerprint: JSON.stringify(team),
    dispose() {
      for (const dispose of disposers.reverse()) void dispose()
    },
  }
}

/** Session identity helper kept with the application so both call sites brand identically. */
export type AppliedSessionId = SessionId
