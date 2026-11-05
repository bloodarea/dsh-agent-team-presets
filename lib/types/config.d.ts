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
import type { TeamCaptainPreset, TeamCategory, TeamCategoryAssignment, TeamPreset, TeamSelectionRecord } from './types.ts';
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
    /**
     * Identities of the shipped default presets this deployment has been offered.
     *
     * A shipped preset is recorded here once, when the deployment first held it —
     * whether this plugin installed it or the user restored it — so the defaults
     * are installed exactly once and a preset the user deletes stays deleted. Only
     * an explicit restore in Settings puts one back.
     */
    seededDefaults: Volatile<string[]>;
    /** Continuable-subagent provider used for a fresh member. */
    freshProvider: string;
    /** Continuable-subagent provider used for a member forked from the captain's turns. */
    forkProvider: string;
    /**
     * User-created local Team categories.
     *
     * Local UI organisation only: never exported with a Team preset, never read by
     * the runtime, and never used to identify a Team. Deleting a category removes
     * the grouping, never the Teams inside it.
     */
    categories: Volatile<TeamCategory[]>;
    /** Local `teamId → categoryId` memberships, keyed by stable Team identity. */
    teamCategories: Volatile<TeamCategoryAssignment[]>;
    /**
     * Absolute directory holding the private Team Skill store.
     *
     * Empty derives it from the Harness home (`$DSH_HOME`, else `~/.dsh`) under a
     * plugin-owned directory. v0.2.1-rc.2 publishes no per-plugin data-directory
     * API, so this knob exists to make the location explicit when a deployment
     * wants one — it is never a user or project skill directory.
     */
    skillRoot: string;
}
/** Runtime schema of {@link Config}. */
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    teams: z<NoInfer<({
        id?: string | null;
        name?: string | null;
        description?: string | null;
        metadata?: ({
            summary?: string | null;
            tags?: string[] | null;
            useCases?: string[] | null;
            quickPrompts?: string[] | null;
            notes?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict) | null;
        officialSkills?: ({
            skillId?: string | null;
            roleName?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict)[] | null;
        captain?: ({
            name?: string | null;
            color?: string | null;
            description?: string | null;
            toolMode?: "all" | "custom" | null;
            tools?: string[] | null;
            systemPrompt?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict) | null;
        members?: ({
            id?: string | null;
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
        metadata: z<Schemastery.ObjectS<NoInfer<{
            summary: z<string, string, "defined">;
            tags: z<string[], string[], "defined">;
            useCases: z<string[], string[], "defined">;
            quickPrompts: z<string[], string[], "defined">;
            notes: z<string, string, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            summary: z<string, string, "defined">;
            tags: z<string[], string[], "defined">;
            useCases: z<string[], string[], "defined">;
            quickPrompts: z<string[], string[], "defined">;
            notes: z<string, string, "defined">;
        }>>, "plain">;
        officialSkills: z<({
            skillId?: string | null;
            roleName?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
            skillId: z<string, string, "defined">;
            roleName: z<string, string, "defined">;
        }>>[], "defined">;
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
            id?: string | null;
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
            id: z<string, string, "plain">;
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
        roleId?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        sessionId: z<string, string, "defined">;
        teamId: z<string, string, "defined">;
        roleId: z<string, string, "plain">;
    }>>[]>, "volatile-defined">;
    seededDefaults: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    freshProvider: z<string, string, "defined">;
    forkProvider: z<string, string, "defined">;
    categories: z<NoInfer<({
        id?: string | null;
        name?: string | null;
        order?: number | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        id: z<string, string, "defined">;
        name: z<string, string, "defined">;
        order: z<number, number, "defined">;
    }>>[]>, "volatile-defined">;
    teamCategories: z<NoInfer<({
        teamId?: string | null;
        categoryId?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        teamId: z<string, string, "defined">;
        categoryId: z<string, string, "defined">;
    }>>[]>, "volatile-defined">;
    skillRoot: z<string, string, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    teams: z<NoInfer<({
        id?: string | null;
        name?: string | null;
        description?: string | null;
        metadata?: ({
            summary?: string | null;
            tags?: string[] | null;
            useCases?: string[] | null;
            quickPrompts?: string[] | null;
            notes?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict) | null;
        officialSkills?: ({
            skillId?: string | null;
            roleName?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict)[] | null;
        captain?: ({
            name?: string | null;
            color?: string | null;
            description?: string | null;
            toolMode?: "all" | "custom" | null;
            tools?: string[] | null;
            systemPrompt?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict) | null;
        members?: ({
            id?: string | null;
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
        metadata: z<Schemastery.ObjectS<NoInfer<{
            summary: z<string, string, "defined">;
            tags: z<string[], string[], "defined">;
            useCases: z<string[], string[], "defined">;
            quickPrompts: z<string[], string[], "defined">;
            notes: z<string, string, "defined">;
        }>>, Schemastery.ObjectT<NoInfer<{
            summary: z<string, string, "defined">;
            tags: z<string[], string[], "defined">;
            useCases: z<string[], string[], "defined">;
            quickPrompts: z<string[], string[], "defined">;
            notes: z<string, string, "defined">;
        }>>, "plain">;
        officialSkills: z<({
            skillId?: string | null;
            roleName?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict)[], Schemastery.ObjectT<NoInfer<{
            skillId: z<string, string, "defined">;
            roleName: z<string, string, "defined">;
        }>>[], "defined">;
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
            id?: string | null;
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
            id: z<string, string, "plain">;
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
        roleId?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        sessionId: z<string, string, "defined">;
        teamId: z<string, string, "defined">;
        roleId: z<string, string, "plain">;
    }>>[]>, "volatile-defined">;
    seededDefaults: z<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
    freshProvider: z<string, string, "defined">;
    forkProvider: z<string, string, "defined">;
    categories: z<NoInfer<({
        id?: string | null;
        name?: string | null;
        order?: number | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        id: z<string, string, "defined">;
        name: z<string, string, "defined">;
        order: z<number, number, "defined">;
    }>>[]>, "volatile-defined">;
    teamCategories: z<NoInfer<({
        teamId?: string | null;
        categoryId?: string | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        teamId: z<string, string, "defined">;
        categoryId: z<string, string, "defined">;
    }>>[]>, "volatile-defined">;
    skillRoot: z<string, string, "defined">;
}>>, "plain">;
