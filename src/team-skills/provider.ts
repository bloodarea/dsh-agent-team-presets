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

import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { createScope } from '@deepseek-ai/dsh-scope'
import type { Scope } from '@deepseek-ai/dsh-scope'
import type { SkillCandidate, SkillProvider } from '@deepseek-ai/dsh-skill'
import type { TeamSkillAsset } from '../types.ts'
import type { TeamSkillStore } from './store.ts'

/** Provider name this plugin registers inside one Agent's scope. */
export const TEAM_SKILL_PROVIDER = 'dsh-team-skills'

/**
 * Precedence rank of a Team Skill.
 *
 * The standard packaged-provider rank: a Team Skill competes at the same level
 * as a bundled provider, while project and user skill providers keep winning a
 * same-name conflict by rank. Isolation is provided by the scope layer, not by
 * outranking anyone, so this plugin never shadows a user's own skill.
 */
const TEAM_SKILL_RANK = 600

/** What one Agent's registration needs. */
export interface AgentSkillBinding {
  /** The Agent whose scope receives the provider. */
  readonly agent: Agent
  /** Assets assigned to that Agent's role. */
  readonly assets: readonly TeamSkillAsset[]
}

/** One live registration and the exact disposers that release it. */
interface LiveRegistration {
  readonly scope: Scope
  readonly assets: readonly TeamSkillAsset[]
  /** The exact provider disposer; calling it unregisters discovery in this turn. */
  readonly disposeProvider: () => void
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
export type SkillSyncStatus = 'installed' | 'none' | 'deferred' | 'failed'

/** The outcome of one {@link TeamSkillRuntime.sync} call. */
export interface SkillSyncResult {
  /** What the Agent's registration is after this call. */
  readonly status: SkillSyncStatus
  /** The exact cause, present for `deferred` and `failed`. */
  readonly reason?: string
}

/**
 * A provider that lists assigned assets and loads their bodies on demand.
 * @param assets - the assets this Agent was assigned.
 * @param store - the store the bodies are read from.
 * @returns the provider to register in the Agent's scope.
 */
function providerFor(assets: readonly TeamSkillAsset[], store: TeamSkillStore): SkillProvider {
  const candidates: SkillCandidate[] = assets.map(asset => ({
    name: asset.skillId,
    description: asset.description,
    invocation: { modelInvocable: true, userInvocable: true },
    provider: TEAM_SKILL_PROVIDER,
    source: 'custom',
    rank: TEAM_SKILL_RANK,
    // The version-pinned directory, so an edit that publishes a new version
    // cannot change the bytes a running member reads.
    resourceBase: { kind: 'directory', path: store.assetPath(asset.id, asset.version) },
    locator: { assetId: asset.id, version: asset.version },
  }))
  return {
    name: TEAM_SKILL_PROVIDER,
    list: () => Promise.resolve(candidates),
    get: async (candidate: SkillCandidate) => {
      const locator = candidate.locator
      if (locator === null || typeof locator !== 'object' || !('assetId' in locator) || !('version' in locator)) return undefined
      // Several bound assets may share one skill name. The registry chooses a
      // candidate; its locator identifies the exact bytes and resource directory.
      const asset = assets.find(asset => asset.id === locator.assetId && asset.version === locator.version && asset.skillId === candidate.name)
      if (asset === undefined) return undefined
      const body = await store.readText(asset.id, 'SKILL.md', asset.version)
      return {
        name: asset.skillId,
        description: asset.description,
        invocation: candidate.invocation,
        provider: TEAM_SKILL_PROVIDER,
        source: 'custom',
        resourceBase: { kind: 'directory', path: store.assetPath(asset.id, asset.version) },
        content: stripFrontmatter(body),
      }
    },
  }
}

/**
 * Remove the YAML frontmatter from one skill body.
 *
 * The registry renders the body, not the document; the frontmatter has already
 * been surfaced as the candidate's name and description.
 * @param text - the whole `SKILL.md`.
 * @returns the instruction body.
 */
export function stripFrontmatter(text: string): string {
  const match = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u.exec(text)
  return match === null ? text.trim() : text.slice(match[0].length).trim()
}

/** Installs and releases per-Agent Team Skill providers. */
export class TeamSkillRuntime {
  private readonly live = new Map<Agent, LiveRegistration>()
  /** The assignment each Agent is *supposed* to have, authoritative immediately. */
  private readonly desired = new Map<Agent, readonly TeamSkillAsset[]>()
  private readonly store: TeamSkillStore
  private disposed = false
  /**
   * The context that is allowed to read the skill service.
   *
   * A provider must be registered through a context that INJECTS `skills`: the
   * service property itself is gated on `inject`, so the plugin context cannot
   * name it even when the service is composed. This one fiber is held for the
   * runtime's lifetime and resolves {@link skillsReady} exactly once, which is
   * the readiness barrier every caller awaits instead of a timer.
   */
  private skillsCtx: Context | undefined
  /** Resolves when the skill service became readable; never rejects. */
  private readonly skillsReady: Promise<boolean>
  private settleSkills: (available: boolean) => void = () => {}

  /**
   * @param ctx - the plugin context scopes are minted under.
   * @param store - the asset store bodies are read from.
   * @param log - receives diagnostic text when a registration cannot be made.
   */
  constructor(
    private readonly ctx: Context,
    store: TeamSkillStore,
    private readonly log: (message: string) => void,
  ) {
    this.store = store
    this.skillsReady = new Promise<boolean>((resolve) => { this.settleSkills = resolve })
    // One fiber owns the injected context for the runtime's whole life. Its
    // callback runs as soon as the deployment composes the skill service, which
    // is what makes `available` observable without polling.
    this.injectFiber = ctx.inject(['skills'], (injected) => {
      this.skillsCtx = injected
      this.settleSkills(true)
      void this.resumeArmed()
    })
  }

  /** The injection fiber that keeps {@link skillsCtx} alive. */
  private readonly injectFiber: ReturnType<Context['inject']>

  /**
   * Whether this deployment can scope skill providers at all.
   * @returns whether the skill service is readable through an injected context.
   */
  get available(): boolean {
    return this.skillsCtx !== undefined
  }

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
  async whenAvailable(signal?: AbortSignal): Promise<boolean> {
    if (this.available) return true
    // The only bounded case: the service is already readable through the plugin
    // context, so the injection fiber's callback runs on the next tick and this
    // promise settles then. When the service is NOT composed the promise is
    // pending forever by design, which is why every caller checks
    // `ctx.get('skills')` first and this method answers `false` here instead of
    // awaiting a composition that may never happen.
    if (this.ctx.get('skills') === undefined) return false
    if (signal === undefined) return await this.skillsReady
    // A cancelled creation must not stay parked on a service this deployment may
    // never compose; the abort is the bound, not a timer.
    if (signal.aborted) return false
    const aborted = new Promise<boolean>((resolve) => {
      signal.addEventListener('abort', () => { resolve(false) }, { once: true })
    })
    return await Promise.race([this.skillsReady, aborted])
  }

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
  async sync(binding: AgentSkillBinding, options: { readonly signal?: AbortSignal } = {}): Promise<SkillSyncResult> {
    if (this.disposed) return { status: 'none' }
    // An Agent keeps the bytes it first received for each still-authorized
    // asset. Library edits publish versions for future residencies; an explicit
    // unassignment still removes the asset immediately.
    const previous = this.desired.get(binding.agent) ?? []
    const assets = binding.assets.map(asset => previous.find(pinned => pinned.id === asset.id) ?? asset)
    const unchanged = previous.length === assets.length && assets.every((asset, index) => asset === previous[index])
    if (unchanged) {
      if (assets.length === 0) return { status: 'none' }
      if (this.live.has(binding.agent)) return { status: 'installed' }
      // An identical call while an install is still armed reports the same
      // state, never success: nothing is registered yet. It never waits either,
      // because a creation edge must not block on a service that may never come.
      const armed = this.pending.get(binding.agent)
      if (armed !== undefined) return { status: 'deferred', reason: armed.reason }
      // Otherwise the intent is unchanged but nothing is registered: a previous
      // attempt was deferred or failed, so retry it below.
    }
    this.release(binding.agent)
    this.desired.set(binding.agent, assets)
    if (assets.length === 0) return { status: 'none' }
    // Composed-but-not-yet-injected is a real window (the Host loads plugins
    // concurrently): await the same readiness barrier instead of reporting a
    // deployment that does compose the service as one that does not.
    if (this.ctx.get('skills') !== undefined && !this.available) await this.whenAvailable(options.signal)
    if (!this.available) return this.arm(binding.agent, assets)
    return this.mount(binding.agent, assets)
  }

  /**
   * Record an intent whose deployment composes no skill service.
   * @param agent - the Agent waiting for its assignment.
   * @param assets - the exact assets to publish once the service appears.
   * @returns the refusal a creation edge must act on.
   */
  private arm(agent: Agent, assets: readonly TeamSkillAsset[]): SkillSyncResult {
    const reason = 'the deployment composes no skill service, so the assignment cannot be published'
    let settle: (value: SkillSyncResult) => void = () => {}
    const result = new Promise<SkillSyncResult>((resolve) => { settle = resolve })
    this.pending.set(agent, { assets, reason, result, settle })
    this.log(`${reason}; it will register if the service is composed later`)
    return { status: 'deferred', reason }
  }

  /**
   * Install every armed intent now that the service is readable.
   * @returns after the attempts settle.
   */
  private async resumeArmed(): Promise<void> {
    for (const [agent, armed] of [...this.pending]) {
      if (this.pending.get(agent) !== armed) continue
      this.pending.delete(agent)
      armed.settle(this.mount(agent, armed.assets))
    }
  }

  /**
   * Whether this intent is still the one worth installing.
   * @param agent - the Agent being installed.
   * @param assets - the assets the intent named.
   * @returns whether the Agent still wants exactly these assets.
   */
  private claims(agent: Agent, assets: readonly TeamSkillAsset[]): boolean {
    return !this.disposed && this.desired.get(agent) === assets && assets.length > 0
  }

  /**
   * Mint the Agent's scope and register the provider inside it.
   * @param agent - the Agent whose scope receives the provider.
   * @param assets - the exact assets to publish.
   * @returns the registration outcome, including the failure reason.
   */
  private mount(agent: Agent, assets: readonly TeamSkillAsset[]): SkillSyncResult {
    if (!this.claims(agent, assets)) return { status: 'none' }
    const skillsCtx = this.skillsCtx
    if (skillsCtx === undefined) return this.arm(agent, assets)
    // A scope keyed by the Agent itself is exactly the layer the host's `skill`
    // tool reads when it passes `scope: exec.agent`.
    const minted = createScope(skillsCtx, agent)
    let disposeProvider: () => void
    try {
      disposeProvider = minted.ctx.skills.registerProvider(() => providerFor(assets, this.store))
    } catch (error: unknown) {
      void minted.dispose()
      const reason = `the skill service refused this Agent's registration: ${String(error)}`
      this.log(reason)
      return { status: 'failed', reason }
    }
    this.live.set(agent, { scope: minted, assets, disposeProvider })
    return { status: 'installed' }
  }

  /**
   * Wait for one Agent's assignment to settle, when a caller needs the eventual
   * outcome of a `deferred` install.
   * @param agent - the Agent whose assignment is awaited.
   * @returns the settled outcome; `deferred` again when nothing is in flight.
   */
  async whenSettled(agent: Agent): Promise<SkillSyncResult> {
    const pending = this.pending.get(agent)
    if (pending !== undefined) return await pending.result
    if (this.live.has(agent)) return { status: 'installed' }
    if ((this.desired.get(agent) ?? []).length === 0) return { status: 'none' }
    return { status: 'deferred', reason: 'the deployment composes no skill service, so the assignment cannot be published' }
  }

  /** In-flight deferred installs, so a later caller can await the same outcome. */
  private readonly pending = new Map<Agent, {
    readonly assets: readonly TeamSkillAsset[]
    readonly reason: string
    readonly result: Promise<SkillSyncResult>
    settle: (value: SkillSyncResult) => void
  }>()

  /**
   * Release one Agent's registration.
   * @param agent - the Agent whose scope is released.
   * @returns after the scope is disposed.
   */
  release(agent: Agent): void {
    this.desired.delete(agent)
    const pending = this.pending.get(agent)
    this.pending.delete(agent)
    pending?.settle({ status: 'none' })
    const registration = this.live.get(agent)
    this.live.delete(agent)
    // The exact provider disposer runs synchronously, which is what a release
    // has to guarantee: a member that is gone must not stay discoverable for a
    // later turn. The scope itself is unwound on the next microtask.
    if (registration !== undefined) {
      registration.disposeProvider()
      void registration.scope.rawDispose()
    }
  }

  /**
   * The assets currently registered for one Agent.
   * @param agent - the Agent to inspect.
   * @returns the registered assets, for the runtime's own diagnostics.
   */
  assetsOf(agent: Agent): readonly TeamSkillAsset[] {
    return this.desired.get(agent) ?? []
  }

  /**
   * Every asset identifier a live assignment is serving.
   *
   * This is the fact a delete has to consult: a running member reading this
   * version must not have its resources removed underneath it. The intended
   * assignment counts even before its scope is minted, because the member is
   * already live and about to read.
   * @returns the live asset identifiers.
   */
  activeAssetIds(): ReadonlySet<string> {
    const ids = new Set<string>()
    for (const assets of this.desired.values()) {
      for (const asset of assets) ids.add(asset.id)
    }
    return ids
  }

  /**
   * Labels of the Agents a live assignment is serving one asset for.
   *
   * A session names the Agent that owns the registration, so a refused delete can
   * say *who* is holding the skill instead of a generic phrase.
   * @param assetId - asset identity.
   * @returns one label per live holder, sorted for a stable message.
   */
  activeLabels(assetId: string): string[] {
    const labels: string[] = []
    for (const [agent, assets] of this.desired) {
      if (!assets.some(asset => asset.id === assetId)) continue
      const id = (agent as unknown as { id?: unknown }).id
      labels.push(typeof id === 'string' && id !== '' ? id : 'an active member')
    }
    return labels.sort((left, right) => left.localeCompare(right))
  }

  /**
   * Release every registration and refuse later ones.
   * @returns after every scope is disposed.
   */
  async dispose(): Promise<void> {
    this.disposed = true
    const registrations = [...this.live.values()]
    const armed = [...this.pending.values()]
    this.live.clear()
    this.pending.clear()
    this.desired.clear()
    for (const entry of armed) entry.settle({ status: 'none' })
    await Promise.allSettled(registrations.map((registration) => {
      registration.disposeProvider()
      return registration.scope.dispose()
    }))
    void this.injectFiber.dispose()
  }
}
