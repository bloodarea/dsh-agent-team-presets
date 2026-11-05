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
import { defineTool } from '@deepseek-ai/dsh-tools';
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm';
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt';
import { IMPLICIT_TOOLS, captainBriefing, definitionFingerprint, findMember, memberBriefing, memberRouteOf, memberTargets, memberTeamDivision, soloMemberBriefing, toolMode } from "./presets.js";
import { depthRefusal, routeRefusal } from "./delegation.js";
import { memberProviderFor } from "./member-identity.js";
import { guardPolicy, inheritedFilter, isOwnLayerTool, policyOf } from "./tool-policy.js";
import { SPAWN_TEAM_MEMBER_DESCRIPTION } from "./tool-descriptions.js";
import { prepareNativePresentation } from "./presentation.js";
/** The route this plugin actually installed on one created member. */
const MEMBER_ROUTE_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        provider: { type: 'string', required: true },
        model: { type: 'string', required: true },
        reasoningEffort: { type: 'string' },
    },
};
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
};
/**
 * Build the route one configured member runs on.
 *
 * Shared with the Host so the Session model it selects and the route a summoned
 * child receives are derived by the same rule: both route ids must be non-empty,
 * and an empty reasoning effort keeps the adapter default.
 * @param preset - the configured member.
 * @returns the route, or undefined when the member inherits the Session route.
 */
export function memberRouteOptions(preset) {
    const route = memberRouteOf(preset);
    if (route === undefined)
        return undefined;
    return {
        provider: route.provider,
        model: route.model,
        ...route.reasoningEffort === '' ? {} : { reasoningEffort: ReasoningEffortId(route.reasoningEffort) },
    };
}
/**
 * Register one slot's tool scope on one Session.
 * Invalid tool names reject application instead of granting unrestricted access.
 * @param agent - the live Session agent.
 * @param team - the Team whose policy namespace the slot belongs to.
 * @param slot - configured policy and allow-list; custom-empty denies every global tool.
 * @returns the restriction disposer, or undefined for the default-all policy.
 */
function restrictSlotTools(agent, team, slot) {
    if (toolMode(slot) === 'all')
        return undefined;
    const filter = inheritedFilter(agent, policyOf(team.id, slot));
    return filter === undefined ? undefined : agent.ctx.tools.restrict(filter);
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
export function assertSlotApplicable(agent, team, slot) {
    if (toolMode(slot) === 'all')
        return;
    const filter = inheritedFilter(agent, policyOf(team.id, slot));
    if (filter !== undefined)
        agent.ctx.tools.restrict(filter)();
}
/**
 * Reject a captain-led Team this Session cannot apply.
 * @param agent - the live Session agent about to take the Team.
 * @param team - the Team preset about to be applied.
 * @throws when the captain's custom allow-list names a tool this Session cannot restrict.
 */
export function assertTeamApplicable(agent, team) {
    assertSlotApplicable(agent, team, team.captain);
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
export function capabilityRefusal(agent, team, target) {
    const missing = new Map();
    const slots = target?.kind === 'member'
        ? [[`member "${target.member.name.trim() === '' ? target.roleId : target.member.name.trim()}"`, target.member]]
        : [
            ['captain', team.captain],
            ...team.members.map((member, index) => [`member "${member.name.trim() === '' ? `member-${index + 1}` : member.name.trim()}"`, member]),
        ];
    for (const [label, slot] of slots) {
        if (toolMode(slot) !== 'custom')
            continue;
        for (const name of slot.tools) {
            if (isOwnLayerTool(name))
                continue;
            // An implicit tool is admitted by the policy itself and is never required
            // to exist, so a document written by an earlier version that still lists
            // one must not refuse the whole Team on a deployment that composes no such
            // tool.
            if (IMPLICIT_TOOLS.includes(name))
                continue;
            if (agent.ctx.tools.get(name, agent) !== undefined)
                continue;
            missing.set(label, [...missing.get(label) ?? [], name]);
        }
    }
    if (missing.size === 0)
        return undefined;
    const detail = [...missing].map(([label, names]) => `${label}: ${names.join(', ')}`).join('; ');
    const subject = target?.kind === 'member' ? `Team "${team.id}" member "${target.roleId}"` : `Team "${team.id}"`;
    return `${subject} names capabilities this Session cannot reach (${detail}). The tools catalog lists the union `
        + 'of every Agent preset, not what this Session composes: select an Agent preset that provides those tools, or '
        + 'remove them from the allow-list.';
}
/** How an official creation refusal is explained to the Team Lead. */
const CONCURRENT_CAPACITY = /active child limit/i;
/** The Team's lifetime member allowance, which a finished member still occupies. */
const LIFETIME_QUOTA = /team member limit/i;
/**
 * Explain one failed creation in terms the captain can act on.
 *
 * The two limits are different: an activity slot frees itself when a member
 * finishes, while a used-up Team allowance never comes back. The official text
 * is always preserved verbatim inside the explanation, because it carries the
 * exact numbers the Host decided with.
 * @param error - the failure `spawnTeammate` reported.
 * @returns the model-facing explanation.
 */
function classifySpawnFailure(error) {
    const message = error instanceof Error ? error.message : String(error);
    if (CONCURRENT_CAPACITY.test(message)) {
        return 'No subagent slot is free right now: this deployment\'s concurrent subagent limit is reached. Wait for a '
            + `running member to finish, then summon again. (${message})`;
    }
    if (LIFETIME_QUOTA.test(message)) {
        return 'This Team has used up its lifetime member allowance. A member that already finished still occupies its '
            + `Team roster slot, so this Team cannot summon another instance; finish the task with the members it has. (${message})`;
    }
    return message;
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
function routedMember(frozen, stored) {
    if (stored === undefined)
        return frozen;
    if (frozen.id !== undefined) {
        const identified = stored.members.filter(member => member.id === frozen.id);
        return identified.length === 1 ? identified[0] : frozen;
    }
    // Legacy records have no stable identity. Match a unique display name, never
    // the index-derived target (reordering Chinese names must not change routes).
    const matches = stored.members.filter(member => member.name.trim() === frozen.name.trim());
    return matches.length === 1 ? matches[0] : frozen;
}
/**
 * Register the model-facing member tool on one Session.
 *
 * Official rc.2's Team request accepts only `name`, `description`, `prompt`,
 * `context`, `provider`, and `signal`; the member's route, persona, and tool
 * scope therefore travel through the durable member snapshot this tool records
 * BEFORE `spawnTeammate` is called, and are installed by the serial
 * `agent/created` listener. A refused snapshot refuses the spawn: a member that
 * could not be recorded must not be created, because nothing would re-scope it.
 * @param ctx - the plugin context providing `agentTeams`.
 * @param agent - the live Session agent that owns the tool.
 * @param team - the applied Team preset.
 * @param providers - continuable-subagent providers to spawn through.
 * @param stored - reads the latest stored definition of the applied Team.
 * @param members - the durable member runtime owned by this plugin activation.
 * @returns the tool registration disposer.
 */
function registerMemberTool(ctx, agent, team, providers, stored, members) {
    const targets = memberTargets(team);
    const summary = targets.map(({ target }) => target).join(', ');
    const reserved = new Set();
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
            if (toolMode(member) === 'custom') {
                const presentation = await prepareNativePresentation(caller);
                if (presentation.kind !== 'already-native')
                    throw new Error(presentation.reason);
            }
            // No runtime means this Session was composed outside the plugin's
            // activation; a member it created could never be re-scoped, so refuse.
            if (members === undefined) {
                throw new Error('This Session was composed without the preset member runtime, so a summoned member '
                    + 'could not be given its frozen configuration. Spawning a member is refused.');
            }
            // Creation admission comes before anything durable exists: a refused
            // creation leaves no intent record, no roster row, and no model request.
            const depth = depthRefusal(ctx, caller);
            if (depth !== undefined)
                throw new Error(depth);
            const context = args.context ?? 'fresh';
            // The alias is this member's durable identity: the Host writes it into the
            // roster and the child's own descriptor, which is what tells this member
            // apart from a native teammate after a restart.
            const alias = memberProviderFor(providers, context);
            if ('error' in alias)
                throw new Error(alias.error);
            const used = new Set(ctx.agentTeams.listMembers(caller).map(row => row.name));
            for (const name of reserved)
                used.add(name);
            let instance = target;
            let suffix = 2;
            while (used.has(instance)) {
                const tail = `-${suffix++}`;
                instance = `${target.slice(0, 64 - tail.length).replace(/-+$/u, '')}${tail}`;
            }
            reserved.add(instance);
            try {
                return await members.admit(async () => {
                    const task = [{ type: 'text', text: args.task }];
                    // Read the route now, not when the Team was applied: a route corrected
                    // during this task applies to the next member it summons. It is then
                    // verified against the live registry before any durable intent, so an
                    // unusable route cannot fail inside the member's first turn.
                    const route = memberRouteOptions(routedMember(member, stored()));
                    const unusableRoute = await routeRefusal(ctx, route);
                    if (unusableRoute !== undefined)
                        throw new Error(unusableRoute);
                    // Settings can change while the route check awaits, so the depth cap is
                    // re-read at the last moment before the durable intent is written.
                    const recheck = depthRefusal(ctx, caller);
                    if (recheck !== undefined)
                        throw new Error(recheck);
                    const policy = policyOf(team.id, member);
                    const prepared = await members.prepare({
                        root: caller,
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
                    });
                    if (prepared.kind === 'refused')
                        throw new Error(prepared.reason);
                    try {
                        // Official fields only. The three extra properties earlier versions
                        // passed here are not part of the Team request and were ignored.
                        const result = await ctx.agentTeams.spawnTeammate(caller, {
                            name: instance,
                            description: args.description ?? (member.description.trim() === '' ? member.name.trim() || target : member.description.trim()),
                            prompt: task,
                            context,
                            provider: alias.name,
                            signal: exec.signal,
                        });
                        const failed = result.member.status === 'failed';
                        // The Host can settle a member as failed while resolving the spawn;
                        // record that on the snapshot so the durable record matches the action.
                        if (failed)
                            await members.markFailed(caller.id, instance);
                        return {
                            target: result.member.name,
                            status: failed ? 'failed' : 'active',
                            ...route === undefined ? {} : { configuredRoute: { ...route } },
                        };
                    }
                    catch (error) {
                        // A failed spawn may still have created a child, so the snapshot is
                        // never deleted; it is only marked when no child was observed.
                        await members.markFailed(caller.id, instance);
                        // A member whose own route is unusable fails inside its first turn,
                        // and the Host then reports only its provisioning checkpoint. Name the
                        // member's real cause so the fault is not mistaken for a Team fault.
                        const cause = members.failureOf(caller.id, instance);
                        const reported = classifySpawnFailure(error);
                        if (cause === undefined)
                            throw new Error(reported, { cause: error });
                        throw new Error(`${reported} (the member's own first request failed: ${cause})`, { cause: error });
                    }
                });
            }
            finally {
                reserved.delete(instance);
            }
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
 * @param members - the durable member runtime that freezes each summoned
 *   member's configuration before creation; without one the member tool refuses
 *   rather than creating a member nothing could re-scope.
 * @param options - the role to run as (captain by default), the deployment
 *   persona fallback, and the prepared presentation a strict policy needs.
 * @returns the applied Team (and member role, when one was installed), whose
 *   `dispose` releases every registration.
 */
export function applyTeamToAgent(ctx, agent, team, providers, stored = () => undefined, members, options = {}) {
    const disposers = [];
    const register = (disposer) => {
        if (disposer !== undefined)
            disposers.push(disposer);
    };
    const target = options.target ?? { kind: 'captain' };
    const slot = target.kind === 'captain' ? team.captain : target.member;
    const route = target.kind === 'member' ? memberRouteOf(target.member) : undefined;
    try {
        // A captain-led Session reads the captain's own prompt. A solo member reads
        // a complete role card, which always names the member and the Team, so a
        // member slot with no standing prompt still gets an identity instead of the
        // deployment persona it was never meant to keep.
        const persona = target.kind === 'captain' ? team.captain.systemPrompt : soloMemberBriefing(team, target.member);
        if (persona.trim() !== '') {
            register(agent.ctx.systemPrompt.section({
                name: PERSONA_PREFIX_SECTION,
                order: agent.ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX'),
                text: persona,
            }));
        }
        else if (options.personaFallback !== undefined && options.personaFallback.trim() !== '') {
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
            }));
        }
        // The captain's briefing names every summonable target. A solo member has no
        // roster and no summon tool, so installing it would describe capabilities
        // this Session does not have.
        if (target.kind === 'captain') {
            const briefing = captainBriefing(team);
            if (briefing !== '') {
                register(agent.ctx.systemPrompt.section({
                    name: 'agent-team-presets:briefing',
                    order: agent.ctx.systemPrompt.getSectionOrder('TEAM_POLICY'),
                    text: briefing,
                }));
            }
        }
        register(guardPolicy(agent, policyOf(team.id, slot), target.kind === 'member'
            ? { role: 'solo' }
            : options.presentation === undefined ? {} : { presentation: 'caller' }));
        if (options.presentation !== undefined)
            register(options.presentation.install());
        register(restrictSlotTools(agent, team, slot));
        if (target.kind === 'captain')
            register(registerMemberTool(ctx, agent, team, providers, stored, members));
    }
    catch (error) {
        for (const dispose of disposers.reverse())
            void dispose();
        throw error;
    }
    return {
        teamId: team.id,
        ...target.kind === 'member' ? { roleId: target.roleId } : {},
        ...route === undefined ? {} : { route },
        fingerprint: definitionFingerprint(team),
        ...options.presentation?.disclosure === undefined ? {} : { presentationNote: options.presentation.disclosure },
        dispose() {
            for (const dispose of disposers.splice(0).reverse())
                void dispose();
        },
    };
}
