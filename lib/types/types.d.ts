/**
 * Shared Team preset records.
 *
 * The Host schema, the browser settings page, and the per-Session selection
 * all read these types; the module imports nothing so both build faces can
 * consume it.
 * @module dsh-agent-team-presets/types
 */
/** Fields a Team slot carries whether it is the captain or one summoned member. */
export type TeamSlotPreset = {
    /** Display name shown in Settings and in the captain's roster. */
    name: string;
    /** Accent color as `#rrggbb`; empty keeps the theme default. */
    color: string;
    /** Short description of the role, shown in Settings and given to the captain. */
    description: string;
    /** Independent tool policy; absent in legacy records infers custom from a nonempty list. */
    toolMode?: 'all' | 'custom';
    /** Global tool allow-list in custom mode; empty denies all configurable tools. */
    tools: readonly string[];
    /**
     * Standing system prompt for this agent. Registered as a prompt section
     * template, so complete `{{variable}}` groups interpolate against registered
     * prompt variables and an unknown variable fails the request loud.
     */
    systemPrompt: string;
};
/**
 * The Team captain: the agent that leads the Session.
 *
 * The captain runs on the model the Session already selected, so it holds no
 * route of its own and no setting can change the Session's model.
 */
export type TeamCaptainPreset = TeamSlotPreset;
/** One summoned member: a slot plus the route that member runs on. */
export type TeamAgentPreset = TeamSlotPreset & {
    /** LLM provider route id; empty runs the member on the Session route. */
    provider: string;
    /** Provider-owned model id; empty runs the member on the Session model. */
    model: string;
    /** Adapter-owned reasoning effort; empty keeps the model default. */
    reasoningEffort: string;
};
/** One reusable Team preset. */
export type TeamPreset = {
    /** Stable identity a Session selection references. */
    id: string;
    /** Display name. */
    name: string;
    /** What this Team is for; shown in Settings and to its captain. */
    description: string;
    /** Agent that leads the Session and summons members. */
    captain: TeamCaptainPreset;
    /** Role templates the captain summons by name. */
    members: readonly TeamAgentPreset[];
};
/** One Session's active Team preset. */
export type TeamSelectionRecord = {
    /** Session identity the selection belongs to. */
    sessionId: string;
    /** Selected Team identity. */
    teamId: string;
};
/** The user-owned Team preset section this plugin projects to the browser. */
export type TeamPresetsSection = {
    /** Every configured Team preset. */
    teams: readonly TeamPreset[];
    /** Every Session's active Team preset. */
    selections: readonly TeamSelectionRecord[];
};
/** One tool a Team member's allow-list may name. */
export type ToolChoice = {
    /** Global tool name the restriction accepts verbatim. */
    name: string;
    /** Model-facing description, shown beside the checkbox. */
    description: string;
};
/** Catalog of restrictable tools for one deployment. */
export type ToolCatalogValue = {
    /** Every global tool name a member allow-list can select. */
    tools: readonly ToolChoice[];
};
//# sourceMappingURL=types.d.ts.map