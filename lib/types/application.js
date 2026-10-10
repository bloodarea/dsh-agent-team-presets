/**
 * Apply one Team preset to one live Session.
 *
 * The captain's system prompt shadows the deployment persona for that Session,
 * the captain's independent tool mode scopes the Session's visible global tools,
 * and the Session gains `spawn_team_member`, which applies the selected member's
 * own persona, route, reasoning effort, and tool mode. The Session keeps the
 * model it already selected: a captain never changes the Session's route. A
 * member's persona and tool mode belong to the definition the Team task started
 * with; its route does not, so a corrected route reaches the next member the
 * task summons.
 * @module dsh-agent-team-presets/application
 */
import { defineTool } from '@deepseek-ai/dsh-tools';
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm';
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt';
import { captainBriefing, definitionFingerprint, findMember, memberBriefing, memberTargets, toolMode } from "./presets.js";
/** Output schema of one `spawn_team_member` result. */
const SPAWN_VALUE_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        target: { type: 'string', required: true },
        status: { type: 'string', required: true, enum: ['active', 'failed'] },
        model: { type: 'string' },
    },
};
/**
 * Build the child route of one configured agent slot.
 * @param preset - the configured captain or member.
 * @returns the child Agent options, or undefined without a configured route.
 */
function routeOptions(preset) {
    if (preset.provider === '' || preset.model === '')
        return undefined;
    return {
        provider: preset.provider,
        model: preset.model,
        ...preset.reasoningEffort === '' ? {} : { reasoningEffort: ReasoningEffortId(preset.reasoningEffort) },
    };
}
/**
 * Register the captain's tool scope on one Session.
 * Invalid tool names reject application instead of granting unrestricted access.
 * @param agent - the live Session agent.
 * @param captain - configured policy and allow-list; custom-empty denies every global tool.
 * @returns the restriction disposer, or undefined for the default-all policy.
 */
function restrictCaptainTools(agent, captain) {
    if (toolMode(captain) === 'all')
        return undefined;
    return agent.ctx.tools.restrict({ allow: [...captain.tools] });
}
/**
 * Reject a Team this Session cannot apply, before any registration is touched.
 *
 * `tools.restrict` owns the authority on which global names an allow-list may
 * carry, and the probe applies and lifts it so the real application still
 * registers exactly one restriction. Every other registration a Team needs —
 * the two prompt sections and the member tool — uses names and orders fixed by
 * this plugin, so a captain allow-list naming an unknown tool is the failure an
 * adoption can actually hit. Callers check before releasing a running
 * application, so a refused preset never leaves a Session without one.
 * @param agent - the live Session agent about to take the Team.
 * @param team - the Team preset about to be applied.
 * @throws when the captain's custom allow-list names a tool this Session cannot restrict.
 */
export function assertTeamApplicable(agent, team) {
    const { captain } = team;
    if (toolMode(captain) === 'all')
        return;
    agent.ctx.tools.restrict({ allow: [...captain.tools] })();
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
 * @param target - the teammate target the captain summons.
 * @param stored - the latest stored definition of the applied Team, when the Host still has it.
 * @returns the member whose route this spawn uses.
 */
function routedMember(frozen, target, stored) {
    if (stored === undefined)
        return frozen;
    return findMember(stored, target)?.member ?? frozen;
}
/**
 * Register the model-facing member tool on one Session.
 * @param ctx - the plugin context providing `agentTeams`.
 * @param agent - the live Session agent that owns the tool.
 * @param team - the applied Team preset.
 * @param providers - continuable-subagent providers to spawn through.
 * @param stored - reads the latest stored definition of the applied Team.
 * @returns the tool registration disposer.
 */
function registerMemberTool(ctx, agent, team, providers, stored) {
    const targets = memberTargets(team);
    const summary = targets.map(({ member, target }) => member.description.trim() === '' ? target : `${target} (${member.description.trim()})`).join('; ');
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
            render: (_args, value) => [
                { type: 'text', text: JSON.stringify(value) },
            ],
        },
        async execute(args, exec) {
            const caller = exec.agent;
            if (caller === undefined)
                throw new Error('spawn_team_member requires a calling Agent');
            const resolved = findMember(team, args.member);
            if (resolved === undefined) {
                throw new Error(`unknown Team member "${args.member}"; available members: ${targets.map(entry => entry.target).join(', ') || '(none)'}`);
            }
            const { member, target } = resolved;
            const context = args.context ?? 'fresh';
            const task = [{ type: 'text', text: args.task }];
            // Read the route now, not when the Team was applied: a route corrected
            // during this task applies to the next member it summons.
            const route = routeOptions(routedMember(member, target, stored()));
            const briefing = memberBriefing(team, member, target);
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
            });
            return {
                target: result.member.name,
                status: result.member.status === 'failed' ? 'failed' : 'active',
                ...result.member.model === undefined ? {} : { model: result.member.model },
            };
        },
    }));
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
 * @returns the applied Team, whose `dispose` releases every registration.
 */
export function applyTeamToAgent(ctx, agent, team, providers, stored = () => undefined) {
    const disposers = [];
    const register = (disposer) => {
        if (disposer !== undefined)
            disposers.push(disposer);
    };
    try {
        const { captain } = team;
        if (captain.systemPrompt.trim() !== '') {
            register(agent.ctx.systemPrompt.section({
                name: PERSONA_PREFIX_SECTION,
                order: agent.ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX'),
                text: captain.systemPrompt,
            }));
        }
        const briefing = captainBriefing(team);
        if (briefing !== '') {
            register(agent.ctx.systemPrompt.section({
                name: 'agent-team-presets:briefing',
                order: agent.ctx.systemPrompt.getSectionOrder('TEAM_POLICY'),
                text: briefing,
            }));
        }
        register(restrictCaptainTools(agent, captain));
        register(registerMemberTool(ctx, agent, team, providers, stored));
    }
    catch (error) {
        for (const dispose of disposers.reverse())
            void dispose();
        throw error;
    }
    return {
        teamId: team.id,
        fingerprint: definitionFingerprint(team),
        dispose() {
            for (const dispose of disposers.reverse())
                void dispose();
        },
    };
}
