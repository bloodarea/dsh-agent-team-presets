/**
 * Pure Team preset helpers shared by the Host runtime and the browser page.
 * @module dsh-agent-team-presets/presets
 */
import type { TeamAgentPreset, TeamPreset, TeamSelectionRecord, TeamSlotPreset } from './types.ts';
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
export declare const SKILL_TOOL_NAME = "skill";
/**
 * The tool names a Team policy always admits and the page therefore never shows.
 *
 * Reading a saved allow-list that still contains one of these must keep working:
 * the value is admitted implicitly, so a document written by an earlier version
 * neither gains an unavailable-tool warning nor loses the entry on save.
 */
export declare const IMPLICIT_TOOLS: readonly string[];
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
 * Read the member role one Session selection names.
 *
 * An empty stored value is the captain-led meaning, exactly like an absent one:
 * the settings schema can project an empty string for a record written before a
 * role existed, and that must never be treated as a member identity.
 * @param selection - the Session's stored selection, when it has one.
 * @returns the member role identity, or undefined for a captain-led selection.
 */
export declare function selectedRoleId(selection: TeamSelectionRecord | undefined): string | undefined;
/**
 * One member's configured route, as the display and comparison path reads it.
 *
 * The Host selects a route only when BOTH ids are present; a half-configured
 * pair therefore inherits the Session route, exactly like an absent one.
 */
export interface ConfiguredMemberRoute {
    /** LLM provider route id. */
    readonly provider: string;
    /** Provider-owned model id. */
    readonly model: string;
    /** Adapter-owned reasoning effort; empty keeps the model default. */
    readonly reasoningEffort: string;
}
/**
 * Read the route one member is configured to run on.
 * @param member - the configured member slot.
 * @returns the route, or undefined when the member inherits the Session route.
 */
export declare function memberRouteOf(member: TeamAgentPreset): ConfiguredMemberRoute | undefined;
/**
 * Compare two configured member routes, treating an empty effort as the default.
 * @param left - one route, or undefined for the Session route.
 * @param right - the other route, or undefined for the Session route.
 * @returns whether both describe the same route.
 */
export declare function sameMemberRoute(left: ConfiguredMemberRoute | undefined, right: ConfiguredMemberRoute | undefined): boolean;
/**
 * Locate one member slot by its stable identity.
 * @param team - the Team preset to search.
 * @param roleId - the member's stable identity.
 * @returns the matching member, or undefined when the slot no longer exists.
 */
export declare function findMemberById(team: TeamPreset | undefined, roleId: string | undefined): TeamAgentPreset | undefined;
/**
 * Resolve the member a Session talks to individually.
 * @param teams - every configured Team preset.
 * @param selections - every Session selection record.
 * @param sessionId - the Session identity to resolve.
 * @returns the selected member, or undefined when the selection is captain-led
 *   or the member no longer exists.
 */
export declare function selectedMember(teams: readonly TeamPreset[], selections: readonly TeamSelectionRecord[], sessionId: string): TeamAgentPreset | undefined;
/**
 * Replace the current Team selection of one Session.
 * @param selections - the current selection records.
 * @param sessionId - the Session whose selection changes.
 * @param teamId - the selected Team identity; undefined clears the selection.
 * @param roleId - the member to talk to individually; undefined keeps the
 *   captain leading the Session.
 * @returns a new selection list, with the Session's record updated or removed.
 */
export declare function withSelection(selections: readonly TeamSelectionRecord[], sessionId: string, teamId: string | undefined, roleId?: string): TeamSelectionRecord[];
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
export declare function soloMemberBriefing(team: TeamPreset, member: TeamAgentPreset): string;
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
export declare function memberTeamDivision(team: TeamPreset, target: string): string;
