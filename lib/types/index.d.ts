/**
 * Agent Team presets: configure reusable Teams in Settings, pick one per
 * Session from the composer, and let its captain summon configured members.
 *
 * The Host half owns the live configuration, applies a selected Team to its
 * Session, and registers the member tool. A captain runs on the model the
 * Session already selected; only members carry a configurable route. The
 * `./client` half renders the Settings page and the composer control over the
 * same `agent-team-presets` settings namespace.
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
/** Apply one valid Team preset to one live Session. */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map