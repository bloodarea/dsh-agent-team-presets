/**
 * Per-member Team Skill visibility.
 *
 * The one rule this module exists to enforce: a Team Skill is visible to the
 * exact Agent it was assigned to, and to nobody else. The DSH skill registry is
 * layered by Cordis scope, and a read merges the global layer with the viewing
 * Agent's own chain, so registering a provider *inside a scope keyed by that
 * Agent* is what makes the assignment real. Registering on the plugin context
 * would put the provider in the global layer and expose it to every Session in
 * the deployment — the failure mode v0.1.6 exists to remove.
 *
 * Registration is therefore a lifecycle, not a startup step: it happens when the
 * assigned Agent is created or resumed, and it is disposed when that Agent is
 * disposed. Only the candidate list is scoped — a skill's body is read when the
 * model actually loads it, so discovery costs a name and a description.
 * @module dsh-agent-team-presets/team-skills/provider
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { TeamSkillAsset } from '../types.ts';
import type { TeamSkillStore } from './store.ts';
/** Provider name this plugin registers inside one Agent's scope. */
export declare const TEAM_SKILL_PROVIDER = "dsh-team-skills";
/** What one Agent's registration needs. */
export interface AgentSkillBinding {
    /** The Agent whose scope receives the provider. */
    readonly agent: Agent;
    /** Assets assigned to that Agent's role. */
    readonly assets: readonly TeamSkillAsset[];
}
/**
 * How one registration attempt ended.
 *
 * `installed` and `none` are the two states a caller may treat as settled:
 * the provider is registered in the Agent's scope, or the Agent is assigned
 * nothing. `deferred` and `failed` both mean the assignment is NOT visible, and
 * they are deliberately reported instead of resolved silently: a creation edge
 * that ignored them would hand the member its first request with an empty
 * catalog while every operator surface claimed the skill was bound.
 */
export type SkillSyncStatus = 'installed' | 'none' | 'deferred' | 'failed';
/** The outcome of one {@link TeamSkillRuntime.sync} call. */
export interface SkillSyncResult {
    /** What the Agent's registration is after this call. */
    readonly status: SkillSyncStatus;
    /** The exact cause, present for `deferred` and `failed`. */
    readonly reason?: string;
}
/**
 * Remove the YAML frontmatter from one skill body.
 *
 * The registry renders the body, not the document; the frontmatter has already
 * been surfaced as the candidate's name and description.
 * @param text - the whole `SKILL.md`.
 * @returns the instruction body.
 */
export declare function stripFrontmatter(text: string): string;
/** Installs and releases per-Agent Team Skill providers. */
export declare class TeamSkillRuntime {
    private readonly ctx;
    private readonly log;
    private readonly live;
    /** The assignment each Agent is *supposed* to have, authoritative immediately. */
    private readonly desired;
    private readonly store;
    private disposed;
    /**
     * The context that is allowed to read the skill service.
     *
     * A provider must be registered through a context that INJECTS `skills`: the
     * service property itself is gated on `inject`, so the plugin context cannot
     * name it even when the service is composed. This one fiber is held for the
     * runtime's lifetime and resolves {@link skillsReady} exactly once, which is
     * the readiness barrier every caller awaits instead of a timer.
     */
    private skillsCtx;
    /** Resolves when the skill service became readable; never rejects. */
    private readonly skillsReady;
    private settleSkills;
    /**
     * @param ctx - the plugin context scopes are minted under.
     * @param store - the asset store bodies are read from.
     * @param log - receives diagnostic text when a registration cannot be made.
     */
    constructor(ctx: Context, store: TeamSkillStore, log: (message: string) => void);
    /** The injection fiber that keeps {@link skillsCtx} alive. */
    private readonly injectFiber;
    /**
     * Whether this deployment can scope skill providers at all.
     * @returns whether the skill service is readable through an injected context.
     */
    get available(): boolean;
    /**
     * Wait until this deployment's skill service is readable.
     *
     * The Host composes plugins concurrently, so the service may become readable a
     * moment after this runtime was constructed. Awaiting this promise is the
     * readiness barrier a creation edge uses; it resolves immediately once the
     * service exists, and it never resolves on a deployment that composes none,
     * which is why no caller awaits it without first checking {@link available}.
     * @returns whether the service became readable before the caller stopped
     *   waiting; callers that must not block check {@link available} first.
     */
    whenAvailable(signal?: AbortSignal): Promise<boolean>;
    /**
     * Install or replace one Agent's registration.
     *
     * An empty assignment releases any previous registration, so removing the
     * last skill from a role takes effect on the next turn instead of leaving a
     * stale provider behind.
     *
     * The result is deliberately explicit: a caller at a creation edge has to be
     * able to tell "registered" apart from "the deployment composes no skill
     * service" and "registration threw", because the member's first request
     * publishes whatever exists at that moment. A deployment that composes no
     * skill service is never awaited: the intent is armed and the call reports
     * {@link SkillSyncStatus} `deferred`, so a creation edge can refuse instead of
     * hanging.
     * @param binding - the Agent and the assets it should see.
     * @returns what the Agent's registration is after this call.
     */
    sync(binding: AgentSkillBinding, options?: {
        readonly signal?: AbortSignal;
    }): Promise<SkillSyncResult>;
    /**
     * Record an intent whose deployment composes no skill service.
     * @param agent - the Agent waiting for its assignment.
     * @param assets - the exact assets to publish once the service appears.
     * @returns the refusal a creation edge must act on.
     */
    private arm;
    /**
     * Install every armed intent now that the service is readable.
     * @returns after the attempts settle.
     */
    private resumeArmed;
    /**
     * Whether this intent is still the one worth installing.
     * @param agent - the Agent being installed.
     * @param assets - the assets the intent named.
     * @returns whether the Agent still wants exactly these assets.
     */
    private claims;
    /**
     * Mint the Agent's scope and register the provider inside it.
     * @param agent - the Agent whose scope receives the provider.
     * @param assets - the exact assets to publish.
     * @returns the registration outcome, including the failure reason.
     */
    private mount;
    /**
     * Wait for one Agent's assignment to settle, when a caller needs the eventual
     * outcome of a `deferred` install.
     * @param agent - the Agent whose assignment is awaited.
     * @returns the settled outcome; `deferred` again when nothing is in flight.
     */
    whenSettled(agent: Agent): Promise<SkillSyncResult>;
    /** In-flight deferred installs, so a later caller can await the same outcome. */
    private readonly pending;
    /**
     * Release one Agent's registration.
     * @param agent - the Agent whose scope is released.
     * @returns after the scope is disposed.
     */
    release(agent: Agent): void;
    /**
     * The assets currently registered for one Agent.
     * @param agent - the Agent to inspect.
     * @returns the registered assets, for the runtime's own diagnostics.
     */
    assetsOf(agent: Agent): readonly TeamSkillAsset[];
    /**
     * Every asset identifier a live assignment is serving.
     *
     * This is the fact a delete has to consult: a running member reading this
     * version must not have its resources removed underneath it. The intended
     * assignment counts even before its scope is minted, because the member is
     * already live and about to read.
     * @returns the live asset identifiers.
     */
    activeAssetIds(): ReadonlySet<string>;
    /**
     * Labels of the Agents a live assignment is serving one asset for.
     *
     * A session names the Agent that owns the registration, so a refused delete can
     * say *who* is holding the skill instead of a generic phrase.
     * @param assetId - asset identity.
     * @returns one label per live holder, sorted for a stable message.
     */
    activeLabels(assetId: string): string[];
    /**
     * Release every registration and refuse later ones.
     * @returns after every scope is disposed.
     */
    dispose(): Promise<void>;
}
