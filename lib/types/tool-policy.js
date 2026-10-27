import { RUN_CODE_NAME } from '@deepseek-ai/dsh-tools';
import { IMPLICIT_TOOLS, SKILL_TOOL_NAME, toolMode } from "./presets.js";
/**
 * The host tool that publishes the model-facing skill catalog and loads a body.
 *
 * This is not one capability among many: the host emits the catalog only while
 * this exact definition is visible to the Agent. A policy that hides it removes
 * the whole catalog, so every assigned Team Skill becomes unreachable even
 * though its provider is registered. Callers therefore treat it as a
 * precondition of an assignment rather than an optional tool.
 *
 * Re-exported from `./presets.ts` because both faces need the name and the page
 * must not import the Host half.
 */
export { SKILL_TOOL_NAME };
export const PRESET_TOOLS = ['spawn_team_member', 'get_team_preset', 'update_team_preset'];
export const TEAM_TOOLS = ['spawn_teammate', 'send_message', 'list_agents', 'wait_agent', 'interrupt_agent',
    'team_task_create', 'team_task_get', 'team_task_list', 'team_task_update'];
const OWN_TOOLS = new Set([...PRESET_TOOLS, ...TEAM_TOOLS]);
/**
 * The tools a quarantined Session captain may still call.
 *
 * A quarantine means this activation cannot prove which capability policy the
 * running task is under, so it refuses everything that could act. These ten are
 * the exception because none of them grants a capability: they read and edit
 * preset definitions, and they coordinate the Team the Session already belongs
 * to. Without them the captain has no way to reach the very composer action its
 * refusal text recommends, which is what made the freeze a dead end.
 *
 * The list is literal on purpose. It is NOT derived from {@link PRESET_TOOLS} or
 * {@link TEAM_TOOLS} and is never matched by prefix: `PRESET_TOOLS` contains
 * `spawn_team_member` and `TEAM_TOOLS` contains `spawn_teammate`, and both of
 * those create Agents, so neither may be exempted here. `subagent`,
 * `subagent_fork`, `workflow`, `run_code`, every ordinary capability, and every
 * unknown name stay refused. A teammate is never exempted: it has no composer
 * and no preset authority, so its quarantine remains deny-all.
 */
export const CAPTAIN_RECOVERY_TOOLS = new Set([
    'get_team_preset',
    'update_team_preset',
    'send_message',
    'list_agents',
    'wait_agent',
    'interrupt_agent',
    'team_task_create',
    'team_task_get',
    'team_task_list',
    'team_task_update',
]);
const MARKER = '\n\n[team-presets-tool-policy:v1]';
/**
 * Whether one name is a fixed Team operation this plugin or the Team service
 * registers on an Agent, rather than an inherited capability.
 *
 * A Team allow-list may always name these: they are contributed by the Team
 * composition itself, so a capability preflight must not report them missing
 * merely because the global registry does not carry them yet.
 * @param name - the tool name to classify.
 * @returns whether the name is a fixed own-layer Team operation.
 */
export function isOwnLayerTool(name) {
    return OWN_TOOLS.has(name);
}
export function policyOf(teamId, slot) {
    return { teamId, mode: toolMode(slot), allow: [...slot.tools] };
}
/** Probe only inherited names; fixed own-layer Team tools are enforced by guard. */
export function inheritedFilter(agent, policy) {
    if (policy.mode === 'all')
        return undefined;
    if (policy.allow.includes(RUN_CODE_NAME))
        throw new Error('Allow end-capability tools, not the run_code transport.');
    const inherited = [];
    for (const name of policy.allow) {
        // Implicit tools are admitted below, not as a stored choice: a document
        // written by an earlier version may still list one, and probing it here
        // would refuse the whole Team on a deployment that composes no such tool.
        if (OWN_TOOLS.has(name) || IMPLICIT_TOOLS.includes(name))
            continue;
        try {
            agent.ctx.tools.restrict({ allow: [name] })();
            inherited.push(name);
        }
        catch (error) {
            // An arbitrary own-layer registration is valid for this Agent, but cannot
            // be passed to upstream restrict(). The strict guard still checks its name.
            if (agent.ctx.tools.get(name, agent) === undefined)
                throw error;
        }
    }
    // The skill tool is not a capability: it publishes the catalog and loads
    // instruction text. Hiding it does not restrict what a role can DO, it
    // silently drops every Team Skill assigned to that role, because the host
    // withholds the whole catalog from an Agent that cannot see this definition.
    // It is admitted whenever this deployment actually gives the Agent the tool,
    // which is what makes an assignment usable instead of merely stored. A name
    // the host itself withheld is never resurrected: `get` already applies every
    // scope-chain restriction, so a deployment that composes no skill tool (or an
    // enclosing policy that removed it) simply produces no name here.
    if (admits(agent, SKILL_TOOL_NAME))
        inherited.push(SKILL_TOOL_NAME);
    return { allow: inherited };
}
/**
 * Whether an allow-list may name one tool for this Agent.
 *
 * Both halves matter and neither may be guessed: the definition has to be
 * visible to this exact Agent right now (so a host that composes no such tool,
 * or an enclosing scope that already removed it, is never overridden), and
 * `restrict()` has to accept the name (so the returned filter can be applied
 * without throwing and breaking the role).
 * @param agent - the Agent whose surface is probed.
 * @param name - the tool name an allow-list would carry.
 * @returns whether naming it would both be honest and be honoured.
 */
function admits(agent, name) {
    if (agent.ctx.tools.get(name, agent) === undefined)
        return false;
    try {
        agent.ctx.tools.restrict({ allow: [name] })();
        return true;
    }
    catch {
        return false;
    }
}
/** Own-layer tools and nested PTC capability dispatch both pass through this guard. */
export function guardPolicy(agent, policy, role = {}) {
    const member = role.role === 'member';
    const allowed = new Set(policy.allow);
    let native;
    if (policy.mode === 'custom' && role.presentation !== 'caller') {
        try {
            native = agent.ctx.tools.presentAs('native');
        }
        catch { /* An exact-Agent presentation exists; guard still denies run_code. */ }
    }
    const disposeGuard = agent.ctx.tools.guard(exec => {
        if (exec.name === 'spawn_teammate') {
            return member
                ? 'A Team member cannot create teammates; ask the Team Lead to summon one.'
                : 'This Team uses preset-managed creation; call spawn_team_member instead.';
        }
        if (policy.mode === 'custom' && ['subagent', 'subagent_fork', 'workflow'].includes(exec.name)) {
            return member
                ? 'A Team member cannot delegate through providers; report the limitation to the Team Lead.'
                : 'Custom Team policies cannot delegate through providers without a durable strict-policy contract; use preset-managed Team members.';
        }
        if (exec.name === RUN_CODE_NAME && policy.mode === 'custom') {
            // Shipped Node PTC can import fs/child_process outside SDK dispatch. A
            // tool allow-list cannot safely admit that general-purpose code runtime.
            return 'Custom Team policies deny general-purpose run_code; use native allowed tools.';
        }
        // Fixed Team operations are part of the composition itself, not inherited
        // capabilities: an allow-list cannot remove the member tool, the preset
        // reader, or native Team coordination. Their availability is decided by
        // whether this layer registered them, exactly as the inherited preflight
        // already classifies them.
        if (OWN_TOOLS.has(exec.name))
            return undefined;
        // Admitting the call is what keeps an assigned Team Skill reachable; the
        // inherited filter above admits the definition for the same reason.
        if (exec.name === SKILL_TOOL_NAME)
            return undefined;
        if (policy.mode === 'custom' && !allowed.has(exec.name)) {
            return `Team preset "${policy.teamId}" tool policy denies "${exec.name}".`;
        }
        return undefined;
    });
    return () => { disposeGuard(); native?.(); };
}
/** Old plugin-generated briefing, not merely upstream Team membership. */
export function hasLegacyPresetBriefing(agent) {
    for (const event of agent.session.ownEvents()) {
        if (event.type !== 'subagent/descriptor')
            continue;
        const data = event.data;
        return typeof data.persona === 'string' && /^You are "[^"\n]+"(?: \([^\n]*\))? on the Agent Team "/u.test(data.persona);
    }
    return false;
}
/**
 * Read a LEGACY plugin declaration from the child's own Host-written descriptor.
 *
 * Only records written by an earlier plugin version can carry one: those
 * versions passed `persona` to the Team service, which a host that forwarded
 * the undeclared field persisted into `subagent/descriptor`. A member created
 * by the current implementation is identified by its durable member snapshot in
 * `./member-store.ts` and never produces this trailer, so this reader exists to
 * keep upgrading old members instead of leaving them on default tools.
 */
export function descriptorPolicy(agent, legacyTeam = false) {
    for (const event of agent.session.ownEvents()) {
        if (event.type !== 'subagent/descriptor')
            continue;
        const data = event.data;
        if (data.mode !== 'continuable')
            return undefined;
        const persona = typeof data.persona === 'string' ? data.persona : '';
        const at = persona.lastIndexOf(MARKER);
        if (at === -1) {
            if (persona.includes('[team-presets-tool-policy:'))
                throw new Error('Unsupported persisted Team tool policy version');
            if (!legacyTeam)
                return undefined;
            const filter = event.data.toolFilter;
            // Legacy continuable children persist only upstream toolFilter. Upgrade
            // that exact allow-list, never a current/index-matched role definition.
            if (filter?.allow !== undefined) {
                if (!Array.isArray(filter.allow) || filter.allow.some(name => typeof name !== 'string'))
                    throw new Error('Invalid legacy Team tool policy');
                return { teamId: 'legacy-delegation', mode: 'custom', allow: filter.allow };
            }
            if (filter !== undefined)
                return { teamId: 'legacy-delegation', mode: 'custom', allow: [] };
            return undefined;
        }
        const raw = JSON.parse(persona.slice(at + MARKER.length));
        if (typeof raw !== 'object' || raw === null)
            throw new Error('Invalid persisted Team tool policy');
        const policy = raw;
        if (typeof policy.teamId !== 'string' || typeof policy.mode !== 'string' || !['all', 'custom'].includes(policy.mode)
            || !Array.isArray(policy.allow) || policy.allow.some(name => typeof name !== 'string')) {
            throw new Error('Invalid persisted Team tool policy');
        }
        return { teamId: policy.teamId, mode: policy.mode, allow: policy.allow };
    }
    return undefined;
}
