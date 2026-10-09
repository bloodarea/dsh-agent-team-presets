/**
 * Pure Team preset helpers shared by the Host runtime and the browser page.
 * @module dsh-agent-team-presets/presets
 */
/**
 * Resolve a slot's explicit tool policy or its legacy list-only setting.
 * @param agent - the configured captain or member.
 * @returns the policy shown in Settings and enforced by the runtime.
 */
export function toolMode(agent) {
    return agent.toolMode ?? (agent.tools.length === 0 ? 'all' : 'custom');
}
/** The member name grammar the Agent Teams service accepts. */
const MEMBER_TARGET = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
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
export function memberTarget(member, index, used) {
    const candidate = member.name.trim().toLowerCase();
    const base = MEMBER_TARGET.test(candidate) && candidate !== 'lead' && candidate.length <= 64
        ? candidate
        : `member-${index + 1}`;
    let target = base;
    let suffix = 2;
    while (used.has(target)) {
        target = `${base}-${suffix}`;
        suffix += 1;
    }
    used.add(target);
    return target;
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
export function findMember(team, key) {
    const wanted = key.trim();
    const used = new Set();
    for (const [index, member] of team.members.entries()) {
        const target = memberTarget(member, index, used);
        if (target === wanted.toLowerCase() || member.name.trim() === wanted)
            return { member, target };
    }
    return undefined;
}
/**
 * List every addressable teammate target of one Team.
 * @param team - the Team preset.
 * @returns one entry per member, in declared order.
 */
export function memberTargets(team) {
    const used = new Set();
    return team.members.map((member, index) => ({ member, target: memberTarget(member, index, used) }));
}
/**
 * Locate one Team preset by identity.
 * @param teams - every configured Team preset.
 * @param teamId - the identity to resolve.
 * @returns the matching Team, or undefined.
 */
export function findTeam(teams, teamId) {
    return teamId === undefined ? undefined : teams.find(team => team.id === teamId);
}
/**
 * Resolve the Team a Session selected.
 * @param teams - every configured Team preset.
 * @param selections - every Session selection record.
 * @param sessionId - the Session identity to resolve.
 * @returns the selected Team, or undefined when the Session selected none.
 */
export function selectedTeam(teams, selections, sessionId) {
    return findTeam(teams, selections.find(record => record.sessionId === sessionId)?.teamId);
}
/**
 * Replace the current Team selection of one Session.
 * @param selections - the current selection records.
 * @param sessionId - the Session whose selection changes.
 * @param teamId - the selected Team identity; undefined clears the selection.
 * @returns a new selection list, with the Session's record updated or removed.
 */
export function withSelection(selections, sessionId, teamId) {
    const rest = selections.filter(record => record.sessionId !== sessionId);
    return teamId === undefined ? rest : [...rest, { sessionId, teamId }];
}
/**
 * Name one Team the way its own prompts address it.
 * @param team - the Team preset.
 * @returns the configured name, or the Team identity when it has no name.
 */
function teamLabel(team) {
    return team.name.trim() === '' ? team.id : team.name.trim();
}
/**
 * Describe the captain to itself.
 * @param captain - the configured captain.
 * @returns the identity line, or an empty string when the captain states nothing.
 */
function captainIdentity(captain) {
    const name = captain.name.trim();
    const description = captain.description.trim();
    const subject = name === '' ? 'You are its captain' : `You are its captain "${name}"`;
    return description === '' ? (name === '' ? '' : `${subject}.`) : `${subject}: ${description}`;
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
export function captainBriefing(team) {
    const description = team.description.trim();
    const identity = captainIdentity(team.captain);
    const rows = memberTargets(team).map(({ member, target }) => {
        const memberDescription = member.description.trim();
        const label = member.name.trim();
        const display = label === '' || label === target ? '' : ` (${label})`;
        return `- ${target}${display}${memberDescription === '' ? '' : `: ${memberDescription}`}`;
    });
    if (description === '' && identity === '' && rows.length === 0)
        return '';
    const intro = description === ''
        ? `Team preset "${teamLabel(team)}" is active for this Session.`
        : `Team preset "${teamLabel(team)}" is active for this Session: ${description}`;
    const roster = rows.length === 0 ? '' : `Summon a member with spawn_team_member(member, task). The targets below are fixed; use them verbatim.

${rows.join('\n')}`;
    return [intro, identity, roster].filter(part => part !== '').join('\n\n');
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
export function memberBriefing(team, member, target) {
    const label = member.name.trim();
    const named = label === '' || label === target ? `"${target}"` : `"${target}" (${label})`;
    const description = team.description.trim();
    const joined = description === ''
        ? `You are ${named} on the Agent Team "${teamLabel(team)}".`
        : `You are ${named} on the Agent Team "${teamLabel(team)}": ${description}`;
    const role = member.description.trim();
    return [joined, role === '' ? '' : `Your role: ${role}`, member.systemPrompt.trim()]
        .filter(part => part !== '')
        .join('\n\n');
}
