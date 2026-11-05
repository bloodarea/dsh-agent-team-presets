/**
 * The plugin's own global troubleshooting skill.
 *
 * Unlike a Team Skill, this is a host-level runtime skill: it is registered on
 * the plugin's own context as soon as the deployment composes the skill
 * service, so every Session can see it without a Team, a role assignment, or
 * any per-Agent scope. It documents the failure modes this plugin can produce
 * and the evidence that distinguishes them from host, provider, and user
 * configuration problems.
 *
 * @module dsh-agent-team-presets/builtin-skill
 */
import type { Context } from '@deepseek-ai/cordis';
/** Stable name the host `skill` tool addresses this guide by. */
export declare const BUILTIN_SKILL_NAME = "agent-team-presets-troubleshooting";
/** Routing description shown in the session skill catalog. */
export declare const BUILTIN_SKILL_DESCRIPTION = "\u5F53\u4F7F\u7528 dsh-agent-team-presets \u51FA\u73B0\u56E2\u961F\u4E0D\u751F\u6548\u3001\u6210\u5458\u65E0\u6CD5\u53EC\u5524\u3001\u5DE5\u5177\u88AB\u62D2\u3001\u6210\u5458\u6A21\u578B\u8DEF\u7531\u4E0D\u7B26\u3001Team Skill \u4E0D\u53EF\u89C1\u3001\u5B89\u88C5/\u5347\u7EA7\u5F02\u5E38\u6216\u884C\u4E3A\u4E0E\u9884\u671F\u4E0D\u4E00\u81F4\u65F6\u4F7F\u7528\uFF1B\u6309\u8BC1\u636E\u5B9A\u4F4D\uFF0C\u533A\u5206\u63D2\u4EF6\u3001\u5BBF\u4E3B\u4E0E\u7528\u6237\u914D\u7F6E\u3002";
/** Extra routing guidance; kept separate from the body so discovery stays short. */
export declare const BUILTIN_SKILL_WHEN_TO_USE = "\u7528\u6237\u62A5\u544A\u672C\u63D2\u4EF6\u7684 Team \u9009\u62E9\u3001\u6210\u5458\u521B\u5EFA\u3001\u5DE5\u5177\u7B56\u7565\u3001\u6A21\u578B\u8DEF\u7531\u3001Team Skill\u3001\u5B89\u88C5\u5347\u7EA7\u6216\u8FD0\u884C\u65F6\u884C\u4E3A\u5F02\u5E38\u65F6\u3002";
/** The full instruction body loaded by the host skill tool. */
export declare const BUILTIN_SKILL_CONTENT: string;
/**
 * Register the global troubleshooting skill when the deployment composes the
 * skill service.
 *
 * The registration is intentionally not scoped to an Agent: it belongs to the
 * plugin installation, so a Session with no Team, no selected preset, and no
 * Team Skill assignment can still load it. The injection fiber is owned by the
 * plugin, so unload removes the skill with the rest of this activation.
 * @param ctx - the plugin context whose lifetime owns the registration.
 */
export declare function registerBuiltinSkill(ctx: Context): void;
