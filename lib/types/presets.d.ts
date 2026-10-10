/**
 * Pure Team preset helpers shared by the Host runtime and the browser page.
 * @module dsh-agent-team-presets/presets
 */
import type { TeamAgentPreset, TeamPreset, TeamSelectionRecord, TeamSlotPreset } from './types.ts';
/**
 * Resolve a slot's explicit tool policy or its legacy list-only setting.
 * @param agent - the configured captain or member.
 * @returns the policy shown in Settings and enforced by the runtime.
 */
export declare function toolMode(agent: TeamSlotPreset): 'all' | 'custom';
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
export declare function memberTarget(member: TeamAgentPreset, index: number, used: Set<string>): string;
/**
 * Resolve one member by its display name or its teammate target.
 *
 * The resolved target travels with the member, so a caller never re-derives it
 * and cannot disagree with the roster about the name it summons.
 * @param team - the Team preset to search.
 * @param key - the model-authored member name.
 * @returns the matching member with its target, or undefined when the name is unknown.
 */
export declare function findMember(team: TeamPreset, key: string): {
    member: TeamAgentPreset;
    target: string;
} | undefined;
/**
 * List every addressable teammate target of one Team.
 * @param team - the Team preset.
 * @returns one entry per member, in declared order.
 */
export declare function memberTargets(team: TeamPreset): {
    member: TeamAgentPreset;
    target: string;
}[];
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
export declare function definitionFingerprint(team: TeamPreset): string;
/**
 * Locate one Team preset by identity.
 * @param teams - every configured Team preset.
 * @param teamId - the identity to resolve.
 * @returns the matching Team, or undefined.
 */
export declare function findTeam(teams: readonly TeamPreset[], teamId: string | undefined): TeamPreset | undefined;
/**
 * Resolve the Team a Session selected.
 * @param teams - every configured Team preset.
 * @param selections - every Session selection record.
 * @param sessionId - the Session identity to resolve.
 * @returns the selected Team, or undefined when the Session selected none.
 */
export declare function selectedTeam(teams: readonly TeamPreset[], selections: readonly TeamSelectionRecord[], sessionId: string): TeamPreset | undefined;
/**
 * Replace the current Team selection of one Session.
 * @param selections - the current selection records.
 * @param sessionId - the Session whose selection changes.
 * @param teamId - the selected Team identity; undefined clears the selection.
 * @returns a new selection list, with the Session's record updated or removed.
 */
export declare function withSelection(selections: readonly TeamSelectionRecord[], sessionId: string, teamId: string | undefined): TeamSelectionRecord[];
/**
 * Build the briefing the captain reads for the Team it leads.
 *
 * The text states the Team's purpose, the captain's own role, and every
 * summonable target with its configured description, so the captain delegates
 * by the exact target the spawn tool accepts.
 * @param team - the Team preset applied to this Session.
 * @returns the prompt section text, or an empty string for a Team that says nothing about itself.
 */
export declare function captainBriefing(team: TeamPreset): string;
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
export declare function memberBriefing(team: TeamPreset, member: TeamAgentPreset, target: string): string;
//# sourceMappingURL=presets.d.ts.map