/**
 * Page state for the card-patch integrations page.
 *
 * The controller holds no rules of its own: it asks the Host what each target's
 * bundle is, asks it to install or restore one, and keeps the last answer. Every
 * refusal (an unsupported target version, a bundle somebody else already edited)
 * is displayed exactly as the Host described it, because only the Host can see
 * the installed bytes.
 *
 * It adds one fact the Host cannot know: whether the replacement is LIVE in this
 * browser. A patched bundle only registers its service after `dsh web` has been
 * restarted and the page reloaded, so "installed" and "active" are different
 * states and the page must not conflate them.
 * @module dsh-agent-team-presets/client/card-patches-controller
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from 'dsh-agent-team-presets/remote'
import type { CardPatchResult, CardPatchTargetView } from '../types.ts'

/** How long the page may take to load or drop a replacement. */
const SETTLE_TIMEOUT_MS = 6000

/** How often that wait re-reads the registered services. */
const SETTLE_POLL_MS = 250

/** Timings of the post-write wait; a test narrows them. */
export interface CardPatchesOptions {
  /** Upper bound on waiting for the page to apply a write. */
  readonly settleTimeoutMs?: number
  /** Interval between two reads of the registered services. */
  readonly settlePollMs?: number
}

/** The Team presets Remote methods this page calls, as the injection scope exposes them. */
interface TeamPresetsNamespace {
  cardPatches(): Promise<{ readonly ok: true; readonly value: readonly CardPatchTargetView[] } | { readonly ok: false; readonly error: { readonly message?: string } }>
  installCardPatch(id: string): Promise<{ readonly ok: true; readonly value: CardPatchResult } | { readonly ok: false; readonly error: { readonly message?: string } }>
  uninstallCardPatch(id: string): Promise<{ readonly ok: true; readonly value: CardPatchResult } | { readonly ok: false; readonly error: { readonly message?: string } }>
}

/** Services a patched target registers, by target identity. */
const SERVICES: Readonly<Record<string, string>> = {
  'dsh-context': 'contextAgentCardBadges',
  'dsh-better-sidebar': 'betterSidebarAgentCardBadges',
}

/** One page snapshot. */
export interface CardPatchesState {
  /** Where the read stands. */
  readonly status: 'loading' | 'ready' | 'unavailable'
  /** One row per supported target, in catalog order. */
  readonly targets: readonly CardPatchTargetView[]
  /** The target whose install or restore is in flight. */
  readonly busy: string | undefined
  /** What the in-flight write is doing, for the progress line. */
  readonly phase: 'applying' | 'waiting' | undefined
  /** The last outcome the page must show, until the next attempt. */
  readonly result: CardPatchResult | undefined
  /** Target identities whose replacement service this browser already has. */
  readonly live: readonly string[]
}

/**
 * Unwrap one Remote answer.
 * @param result - the wrapped answer.
 * @returns the value.
 * @throws when the transport itself failed.
 */
function unwrap<T>(result: { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: { readonly message?: string } }): T {
  if (result.ok) return result.value
  throw new Error(result.error.message ?? 'the Host refused the call')
}

/** The card-patch page state. */
export class CardPatchesController {
  private readonly ctx: Context
  private state: CardPatchesState = {
    status: 'loading', targets: [], busy: undefined, phase: undefined, result: undefined, live: [],
  }
  /**
   * The Team presets Remote namespace, captured from the injection scope.
   *
   * A namespaced service resolves only for a context that declares it, so the
   * plugin's own context must never be used to read it: this field is the whole
   * read path, and a build without the namespace leaves the page unavailable.
   */
  private namespace: TeamPresetsNamespace | undefined
  private listeners = new Set<() => void>()
  private readonly settleTimeoutMs: number
  private readonly settlePollMs: number

  /**
   * @param ctx - the browser plugin context.
   * @param options - how long to wait for the page to apply a write.
   */
  constructor(ctx: Context, options: CardPatchesOptions = {}) {
    this.ctx = ctx
    this.settleTimeoutMs = options.settleTimeoutMs ?? SETTLE_TIMEOUT_MS
    this.settlePollMs = options.settlePollMs ?? SETTLE_POLL_MS
    try {
      // A namespaced service is read through the property proxy, so the scope
      // must declare the parent `remote` service as well or the read throws.
      ctx.inject(['remote', 'remote.teamPresets'], (scope) => {
        this.namespace = scope.remote.teamPresets as unknown as TeamPresetsNamespace
        void this.refresh(this.namespace)
        return () => { this.namespace = undefined }
      })
    } catch (error: unknown) {
      // A build that cannot read the namespace leaves this page unavailable
      // rather than claiming every target is absent.
      this.state = { ...this.state, status: 'unavailable' }
      console.warn('[team-presets] card patch page is unavailable:', error)
    }
  }

  /** Current snapshot, stable between changes. */
  getSnapshot = (): CardPatchesState => this.state

  /**
   * Subscribe to snapshot changes.
   * @param listener - called on every change.
   * @returns the unsubscribe function.
   */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** Publish one new snapshot. */
  private publish(): void {
    for (const listener of [...this.listeners]) listener()
  }

  /**
   * Read which targets' replacements this browser has registered.
   *
   * A target's service is the only proof the patch is in effect: the file swap
   * alone changes nothing until the server restarts and the page reloads.
   * @returns the live target identities, in catalog order.
   */
  private liveTargets(): string[] {
    return Object.entries(SERVICES)
      .filter(([, service]) => this.ctx.get(service as never) !== undefined)
      .map(([id]) => id)
  }

  /**
   * Re-read every target's installed state.
   * @param remote - the Team presets Remote namespace to read through.
   * @returns resolution after the snapshot was published.
   */
  async refresh(remote = this.namespace): Promise<void> {
    if (remote === undefined) {
      this.state = { ...this.state, status: 'unavailable', live: this.liveTargets() }
      this.publish()
      return
    }
    try {
      const targets = unwrap(await remote.cardPatches())
      this.state = { ...this.state, status: 'ready', targets, live: this.liveTargets() }
    } catch (error: unknown) {
      this.state = { ...this.state, status: 'unavailable', live: this.liveTargets() }
      console.warn('[team-presets] could not read card patch state:', error)
    }
    this.publish()
  }

  /**
   * Install one target's replacement, then re-read every row.
   * @param id - the target identity.
   * @returns resolution after the outcome was published.
   */
  async install(id: string): Promise<void> {
    const namespace = this.namespace
    if (namespace === undefined) return this.refuseMissingNamespace(id)
    await this.act(id, () => namespace.installCardPatch(id))
  }

  /**
   * Restore one target's published bundle, then re-read every row.
   * @param id - the target identity.
   * @returns resolution after the outcome was published.
   */
  async uninstall(id: string): Promise<void> {
    const namespace = this.namespace
    if (namespace === undefined) return this.refuseMissingNamespace(id)
    await this.act(id, () => namespace.uninstallCardPatch(id))
  }

  /**
   * Report a write that cannot start because this build has no Remote.
   * @param id - the target the reader asked to write.
   */
  private refuseMissingNamespace(id: string): void {
    this.state = {
      ...this.state,
      busy: undefined,
      phase: undefined,
      result: { ok: false, id, state: 'absent', detail: 'the Team presets Remote is not mounted in this session' },
    }
    this.publish()
  }

  /**
   * Run one write and publish its outcome.
   * @param id - the target being written.
   * @param run - the Remote call.
   * @returns resolution after the rows were re-read.
   */
  private async act(
    id: string,
    run: () => Promise<{ readonly ok: true; readonly value: CardPatchResult } | { readonly ok: false; readonly error: { readonly message?: string } }>,
  ): Promise<void> {
    this.state = { ...this.state, busy: id, phase: 'applying', result: undefined }
    this.publish()
    let result: CardPatchResult
    try {
      result = unwrap(await run())
    } catch (error: unknown) {
      result = { ok: false, id, state: 'absent', detail: String(error) }
    }
    this.state = { ...this.state, busy: undefined, phase: result.ok ? 'waiting' : undefined, result }
    this.publish()
    await this.refresh()
    if (result.ok) await this.settle(id, result.state === 'patched')
    this.state = { ...this.state, phase: undefined }
    this.publish()
  }

  /**
   * Wait for the page to load or drop one replacement, publishing each change.
   *
   * The Host republishes the bundle and the page swaps the plugin in place, so a
   * successful write becomes visible within a poll interval. Waiting here is what
   * lets the row say "active" on its own instead of asking the reader to reload.
   * @param id - the target that was written.
   * @param expected - whether its service should now be registered.
   * @returns resolution once the expectation holds or the budget expires.
   */
  private async settle(id: string, expected: boolean): Promise<void> {
    const deadline = Date.now() + this.settleTimeoutMs
    for (;;) {
      const live = this.liveTargets()
      const settled = live.includes(id) === expected
      this.state = { ...this.state, live }
      this.publish()
      if (settled || Date.now() >= deadline) return
      await new Promise<void>((resolve) => { setTimeout(resolve, this.settlePollMs) })
    }
  }

  /** Release the page's listeners. */
  dispose(): void {
    this.listeners.clear()
  }
}
