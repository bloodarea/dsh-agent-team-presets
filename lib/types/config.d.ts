/**
 * Live Host configuration of the Agent Team presets plugin.
 *
 * Both fields are volatile, so a Settings write commits into the running
 * references without remounting the plugin and emits `loader/volatile-update`
 * to this fiber's context.
 * @module dsh-agent-team-presets/config
 */
import type { Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { TeamCaptainPreset, TeamPreset, TeamSelectionRecord } from './types.ts';
/** Captain members that named a route before the Session owned the model. */
export declare const LEGACY_CAPTAIN_ROUTE_KEYS: readonly ["provider", "model", "reasoningEffort"];
/**
 * Whether one loaded captain still carries a route of its own.
 *
 * Schemastery merges members its schema does not declare, so a Team stored
 * before captains stopped owning a route still arrives with these keys.
 * @param captain - one loaded captain.
 * @returns whether any former route member survived loading.
 */
export declare function hasLegacyCaptainRoute(captain: TeamCaptainPreset): boolean;
/**
 * Rebuild one Team with every captain reduced to the fields a captain owns.
 * @param team - one loaded Team preset.
 * @returns the Team whose captain carries no route, or the input when it had none.
 */
export declare function withoutCaptainRoute(team: TeamPreset): TeamPreset;
/**
 * Reduce every Team of one configuration to captains without a route.
 * @param teams - every loaded Team preset.
 * @returns the same Teams, with a rebuilt captain wherever a route was stored.
 */
export declare function withoutCaptainRoutes(teams: readonly TeamPreset[]): TeamPreset[];
/** Live plugin configuration read by the Team preset runtime. */
export interface Config {
    /** Every configured Team preset. */
    teams: Volatile<TeamPreset[]>;
    /** Every Session's active Team preset. */
    selections: Volatile<TeamSelectionRecord[]>;
    /** Continuable-subagent provider used for a fresh member. */
    freshProvider: string;
    /** Continuable-subagent provider used for a member forked from the captain's turns. */
    forkProvider: string;
}
/** Runtime schema of {@link Config}. */
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    teams: z<NoInfer<({
        id?: string | null;
        name?: string | null;
        description?: string | null;
        captain?: ({
            name?: string | null;
            color?: string | null;
            description?: string | null;
            toolMode?: "all" | "custom" | null;
            tools?: string[] | null;
            systemPrompt?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict) | null;
        members?: ({
            provider?: string | null;
            model?: string | null;
            reasoningEffort?: string | null;
            name?: string | null;
            color?: string | null;
            description?: string | null;
            toolMode?: "all" | "custom" | null;
            tools?: string[] | null;
            systemPrompt?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict)[] | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        id: z<string, string, "defined">;
        name: z<string, string, "defined">;
        description: z<string, string, "defined">;
        captain: z<Schemastery.ObjectS<NoInfer<{
            name: z<string, string, "defined">;
            color: z<string, string, "defined">;
            description: z<string, string, "defined">;
            toolMode: z<"all" | "custom", "all" | "custom", "plain">;
            tools: z<string[], string[], "defined">;
            systemPrompt: z<string, string, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            name: z<string, string, "defined">;
            color: z<string, string, "defined">;
            description: z<string, string, "defined">;
            toolMode: z<"all" | "custom", "all" | "custom", "plain">;
            tools: z<string[], string[], "defined">;
            systemPrompt: z<string, string, "defined">;
        }>>, "plain">;
        members: z<({
            provider?: string | null;
            model?: string | null;
            reasoningEffort?: string | null;
            name?: string | null;
            color?: string | null;
            description?: string | null;
            toolMode?: "all" | "custom" | null;
            tools?: string[] | null;
            systemPrompt?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
            provider: z<string, string, "defined">;
            model: z<string, string, "defined">;
            reasoningEffort: z<string, string, "defined">;
            name: z<string, string, "defined">;
            color: z<string, string, "defined">;
            description: z<string, string, "defined">;
            toolMode: z<"all" | "custom", "all" | "custom", "plain">;
            tools: z<string[], string[], "defined">;
            systemPrompt: z<string, string, "defined">;
        }>>[], "defined">;
    }>>[]>, "volatile-defined">;
    selections: z<NoInfer<({
        sessionId?: string | null;
        teamId?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        sessionId: z<string, string, "defined">;
        teamId: z<string, string, "defined">;
    }>>[]>, "volatile-defined">;
    freshProvider: z<string, string, "defined">;
    forkProvider: z<string, string, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    teams: z<NoInfer<({
        id?: string | null;
        name?: string | null;
        description?: string | null;
        captain?: ({
            name?: string | null;
            color?: string | null;
            description?: string | null;
            toolMode?: "all" | "custom" | null;
            tools?: string[] | null;
            systemPrompt?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict) | null;
        members?: ({
            provider?: string | null;
            model?: string | null;
            reasoningEffort?: string | null;
            name?: string | null;
            color?: string | null;
            description?: string | null;
            toolMode?: "all" | "custom" | null;
            tools?: string[] | null;
            systemPrompt?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict)[] | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        id: z<string, string, "defined">;
        name: z<string, string, "defined">;
        description: z<string, string, "defined">;
        captain: z<Schemastery.ObjectS<NoInfer<{
            name: z<string, string, "defined">;
            color: z<string, string, "defined">;
            description: z<string, string, "defined">;
            toolMode: z<"all" | "custom", "all" | "custom", "plain">;
            tools: z<string[], string[], "defined">;
            systemPrompt: z<string, string, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            name: z<string, string, "defined">;
            color: z<string, string, "defined">;
            description: z<string, string, "defined">;
            toolMode: z<"all" | "custom", "all" | "custom", "plain">;
            tools: z<string[], string[], "defined">;
            systemPrompt: z<string, string, "defined">;
        }>>, "plain">;
        members: z<({
            provider?: string | null;
            model?: string | null;
            reasoningEffort?: string | null;
            name?: string | null;
            color?: string | null;
            description?: string | null;
            toolMode?: "all" | "custom" | null;
            tools?: string[] | null;
            systemPrompt?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
            provider: z<string, string, "defined">;
            model: z<string, string, "defined">;
            reasoningEffort: z<string, string, "defined">;
            name: z<string, string, "defined">;
            color: z<string, string, "defined">;
            description: z<string, string, "defined">;
            toolMode: z<"all" | "custom", "all" | "custom", "plain">;
            tools: z<string[], string[], "defined">;
            systemPrompt: z<string, string, "defined">;
        }>>[], "defined">;
    }>>[]>, "volatile-defined">;
    selections: z<NoInfer<({
        sessionId?: string | null;
        teamId?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        sessionId: z<string, string, "defined">;
        teamId: z<string, string, "defined">;
    }>>[]>, "volatile-defined">;
    freshProvider: z<string, string, "defined">;
    forkProvider: z<string, string, "defined">;
}>>, "plain">;
//# sourceMappingURL=config.d.ts.map