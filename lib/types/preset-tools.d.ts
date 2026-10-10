/**
 * Model-facing Team preset tools for the captain of a Session.
 *
 * `get_team_preset` reads the preset this Session runs and the exact revision
 * the settings document is at; `update_team_preset` replaces the descriptions
 * and standing prompts it names. Both register in one Session-root Agent scope,
 * so a teammate never sees them. A preset is shared by every Session that
 * selected it, so a teammate report or an automatic continuation must not
 * rewrite it, and a write waits for the run to end rather than changing the
 * definition under executing members.
 * @module dsh-agent-team-presets/preset-tools
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Config } from './config.ts';
/**
 * Whether the open turn of one Session-root Agent carries host-attested human input.
 *
 * An omitted `followup()` / `steer()` source resolves to `user`, so a non-human
 * producer supplies its own kind and cannot inherit this authority.
 * @param agent - the exact live calling Agent.
 * @param openTurnStartSeq - first sequence of the caller's open turn.
 * @returns whether a human `user/message` was accepted inside that turn.
 */
export declare function hasDirectHumanInput(agent: Agent, openTurnStartSeq: number): boolean;
/**
 * Register the Team preset tools in one Session-root Agent scope.
 * @param ctx - host context providing settings and the live agent registry.
 * @param agent - the exact Session-root Agent that owns the tools.
 * @param config - live plugin configuration carrying the Teams and their selections.
 * @param namespace - this plugin's settings entry id.
 * @returns the disposer that removes both tools.
 */
export declare function registerPresetTools(ctx: Context, agent: Agent, config: Config, namespace: string): () => void;
//# sourceMappingURL=preset-tools.d.ts.map