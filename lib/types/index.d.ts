/**
 * Agent Team presets: configure reusable Teams in Settings, pick one per
 * Session from the composer, and let its captain summon configured members.
 *
 * The Host half owns the live configuration, applies a selected Team to its
 * Session, and registers the member tool. A Team task owns the definition it
 * started with: while the captain runs or any teammate is running or
 * provisioning, the Session keeps the application it has and adopts the latest
 * stored definition only between Team tasks. Two groups of fields are outside
 * that definition because they are read from the stored Team when they are
 * needed rather than captured with it: a member's model route, which a task
 * therefore picks up for the next member it summons, and the accent colors the
 * roster draws with. A captain runs on the model the Session already selected;
 * only members carry a configurable route. The `./client` half renders the
 * Settings page and the composer control over the same `agent-team-presets`
 * settings namespace.
 * @module dsh-agent-team-presets
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from './config.ts';
export type * from './types.ts';
export { Config } from './config.ts';
export type { ToolCatalogValue, ToolChoice } from './types.ts';
/** Cordis plugin name. */
export declare const name = "agent-team-presets";
/**
 * Services this plugin reads: the Session agents it composes, the Team service
 * it summons members through, the tool registry its member and preset tools
 * join, the prompt sections its captain adds, the session projections that
 * authenticate a preset write, and the settings document it owns.
 */
export declare const inject: string[];
/**
 * Apply one valid Team preset to one live Session, and keep it current between
 * that Session's Team tasks.
 * @param ctx - the plugin context providing the Session, Team, tool, prompt, and settings services.
 * @param config - the live configuration whose volatile values carry the stored Teams.
 */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map