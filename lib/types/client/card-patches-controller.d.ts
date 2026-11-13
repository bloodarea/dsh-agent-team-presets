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
import type { Context } from '@deepseek-ai/cordis';
import type { CardPatchResult, CardPatchTargetView } from '../types.ts';
/** Timings of the post-write wait; a test narrows them. */
export interface CardPatchesOptions {
    /** Upper bound on waiting for the page to apply a write. */
    readonly settleTimeoutMs?: number;
    /** Interval between two reads of the registered services. */
    readonly settlePollMs?: number;
}
/** The Team presets Remote methods this page calls, as the injection scope exposes them. */
interface TeamPresetsNamespace {
    cardPatches(): Promise<{
        readonly ok: true;
        readonly value: readonly CardPatchTargetView[];
    } | {
        readonly ok: false;
        readonly error: {
            readonly message?: string;
        };
    }>;
    installCardPatch(id: string): Promise<{
        readonly ok: true;
        readonly value: CardPatchResult;
    } | {
        readonly ok: false;
        readonly error: {
            readonly message?: string;
        };
    }>;
    uninstallCardPatch(id: string): Promise<{
        readonly ok: true;
        readonly value: CardPatchResult;
    } | {
        readonly ok: false;
        readonly error: {
            readonly message?: string;
        };
    }>;
}
/** One page snapshot. */
export interface CardPatchesState {
    /** Where the read stands. */
    readonly status: 'loading' | 'ready' | 'unavailable';
    /** One row per supported target, in catalog order. */
    readonly targets: readonly CardPatchTargetView[];
    /** The target whose install or restore is in flight. */
    readonly busy: string | undefined;
    /** What the in-flight write is doing, for the progress line. */
    readonly phase: 'applying' | 'waiting' | undefined;
    /** The last outcome the page must show, until the next attempt. */
    readonly result: CardPatchResult | undefined;
    /** Target identities whose replacement service this browser already has. */
    readonly live: readonly string[];
}
/** The card-patch page state. */
export declare class CardPatchesController {
    private readonly ctx;
    private state;
    /**
     * The Team presets Remote namespace, captured from the injection scope.
     *
     * A namespaced service resolves only for a context that declares it, so the
     * plugin's own context must never be used to read it: this field is the whole
     * read path, and a build without the namespace leaves the page unavailable.
     */
    private namespace;
    private listeners;
    private readonly settleTimeoutMs;
    private readonly settlePollMs;
    /**
     * @param ctx - the browser plugin context.
     * @param options - how long to wait for the page to apply a write.
     */
    constructor(ctx: Context, options?: CardPatchesOptions);
    /** Current snapshot, stable between changes. */
    getSnapshot: () => CardPatchesState;
    /**
     * Subscribe to snapshot changes.
     * @param listener - called on every change.
     * @returns the unsubscribe function.
     */
    subscribe: (listener: () => void) => (() => void);
    /** Publish one new snapshot. */
    private publish;
    /**
     * Read which targets' replacements this browser has registered.
     *
     * A target's service is the only proof the patch is in effect: the file swap
     * alone changes nothing until the server restarts and the page reloads.
     * @returns the live target identities, in catalog order.
     */
    private liveTargets;
    /**
     * Re-read every target's installed state.
     * @param remote - the Team presets Remote namespace to read through.
     * @returns resolution after the snapshot was published.
     */
    refresh(remote?: TeamPresetsNamespace | undefined): Promise<void>;
    /**
     * Install one target's replacement, then re-read every row.
     * @param id - the target identity.
     * @returns resolution after the outcome was published.
     */
    install(id: string): Promise<void>;
    /**
     * Restore one target's published bundle, then re-read every row.
     * @param id - the target identity.
     * @returns resolution after the outcome was published.
     */
    uninstall(id: string): Promise<void>;
    /**
     * Report a write that cannot start because this build has no Remote.
     * @param id - the target the reader asked to write.
     */
    private refuseMissingNamespace;
    /**
     * Run one write and publish its outcome.
     * @param id - the target being written.
     * @param run - the Remote call.
     * @returns resolution after the rows were re-read.
     */
    private act;
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
    private settle;
    /** Release the page's listeners. */
    dispose(): void;
}
export {};
