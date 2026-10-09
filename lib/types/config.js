/**
 * Live Host configuration of the Agent Team presets plugin.
 *
 * Both fields are volatile, so a Settings write commits into the running
 * references without remounting the plugin and emits `loader/volatile-update`
 * to this fiber's context.
 * @module dsh-agent-team-presets/config
 */
import z from '@deepseek-ai/schemastery';
import { toolMode } from "./presets.js";
/** Fields every Team slot stores, whether it is the captain or one member. */
const teamSlotFields = {
    name: z.string().default(''),
    color: z.string().default(''),
    description: z.string().default(''),
    toolMode: z.union(['all', 'custom']),
    tools: z.array(z.string()).default([]),
    systemPrompt: z.string().default(''),
};
/** The captain leads the Session, so it stores no route of its own. */
const captainSchema = z.object(teamSlotFields);
/** A member stores the route it runs on. */
const memberSchema = z.object({
    ...teamSlotFields,
    provider: z.string().default(''),
    model: z.string().default(''),
    reasoningEffort: z.string().default(''),
});
const teamSchema = z.object({
    id: z.string().required(),
    name: z.string().default(''),
    description: z.string().default(''),
    captain: captainSchema,
    members: z.array(memberSchema).default([]),
});
const selectionSchema = z.object({
    sessionId: z.string().required(),
    teamId: z.string().required(),
});
/** Captain members that named a route before the Session owned the model. */
export const LEGACY_CAPTAIN_ROUTE_KEYS = ['provider', 'model', 'reasoningEffort'];
/**
 * Whether one loaded captain still carries a route of its own.
 *
 * Schemastery merges members its schema does not declare, so a Team stored
 * before captains stopped owning a route still arrives with these keys.
 * @param captain - one loaded captain.
 * @returns whether any former route member survived loading.
 */
export function hasLegacyCaptainRoute(captain) {
    return LEGACY_CAPTAIN_ROUTE_KEYS.some(key => key in captain);
}
/**
 * Rebuild one Team with every captain reduced to the fields a captain owns.
 * @param team - one loaded Team preset.
 * @returns the Team whose captain carries no route, or the input when it had none.
 */
export function withoutCaptainRoute(team) {
    if (!hasLegacyCaptainRoute(team.captain))
        return team;
    const { name, color, description, tools, systemPrompt } = team.captain;
    const captain = {
        name,
        color,
        description,
        toolMode: toolMode(team.captain),
        tools: [...tools],
        systemPrompt,
    };
    return { ...team, captain };
}
/**
 * Reduce every Team of one configuration to captains without a route.
 * @param teams - every loaded Team preset.
 * @returns the same Teams, with a rebuilt captain wherever a route was stored.
 */
export function withoutCaptainRoutes(teams) {
    return teams.map(withoutCaptainRoute);
}
/** Runtime schema of {@link Config}. */
export const Config = z.object({
    teams: z.array(teamSchema).default([]).volatile(),
    selections: z.array(selectionSchema).default([]).volatile(),
    freshProvider: z.string().default('spawn'),
    forkProvider: z.string().default('fork'),
});
