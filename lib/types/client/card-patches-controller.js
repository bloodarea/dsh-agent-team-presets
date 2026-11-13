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
/** How long the page may take to load or drop a replacement. */
const SETTLE_TIMEOUT_MS = 6000;
/** How often that wait re-reads the registered services. */
const SETTLE_POLL_MS = 250;
/**
 * Fallback services, used only before the Host's rows have arrived.
 *
 * Once a row exists its own `service` field is authoritative: the Host derives
 * it from the catalog entry that matches the installed version, so a target
 * added by a shipped catalog never needs a code change here.
 */
const SERVICES = {
    'dsh-context': 'contextAgentCardBadges',
    'dsh-better-sidebar': 'betterSidebarAgentCardBadges',
};
/**
 * Unwrap one Remote answer.
 * @param result - the wrapped answer.
 * @returns the value.
 * @throws when the transport itself failed.
 */
function unwrap(result) {
    if (result.ok)
        return result.value;
    throw new Error(result.error.message ?? 'the Host refused the call');
}
/** The card-patch page state. */
export class CardPatchesController {
    ctx;
    state = {
        status: 'loading', targets: [], busy: undefined, phase: undefined, result: undefined, live: [],
    };
    /**
     * The Team presets Remote namespace, captured from the injection scope.
     *
     * A namespaced service resolves only for a context that declares it, so the
     * plugin's own context must never be used to read it: this field is the whole
     * read path, and a build without the namespace leaves the page unavailable.
     */
    namespace;
    listeners = new Set();
    settleTimeoutMs;
    settlePollMs;
    /**
     * @param ctx - the browser plugin context.
     * @param options - how long to wait for the page to apply a write.
     */
    constructor(ctx, options = {}) {
        this.ctx = ctx;
        this.settleTimeoutMs = options.settleTimeoutMs ?? SETTLE_TIMEOUT_MS;
        this.settlePollMs = options.settlePollMs ?? SETTLE_POLL_MS;
        try {
            // A namespaced service is read through the property proxy, so the scope
            // must declare the parent `remote` service as well or the read throws.
            ctx.inject(['remote', 'remote.teamPresets'], (scope) => {
                this.namespace = scope.remote.teamPresets;
                void this.refresh(this.namespace);
                return () => { this.namespace = undefined; };
            });
        }
        catch (error) {
            // A build that cannot read the namespace leaves this page unavailable
            // rather than claiming every target is absent.
            this.state = { ...this.state, status: 'unavailable' };
            console.warn('[team-presets] card patch page is unavailable:', error);
        }
    }
    /** Current snapshot, stable between changes. */
    getSnapshot = () => this.state;
    /**
     * Subscribe to snapshot changes.
     * @param listener - called on every change.
     * @returns the unsubscribe function.
     */
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };
    /** Publish one new snapshot. */
    publish() {
        for (const listener of [...this.listeners])
            listener();
    }
    /**
     * Read which targets' replacements this browser has registered.
     *
     * A target's service is the only proof the patch is in effect: the file swap
     * alone changes nothing until the server restarts and the page reloads.
     * @returns the live target identities, in catalog order.
     */
    liveTargets(targets = this.state.targets) {
        // `target.service` is authoritative once the Host sends it; a Host from
        // before the multi-version catalog sends none, so the fallback still applies.
        const pairs = targets.length > 0
            ? targets.map(target => [target.id, target.service ?? SERVICES[target.id]])
            : Object.entries(SERVICES);
        return pairs
            .filter(([, service]) => service !== undefined && this.ctx.get(service) !== undefined)
            .map(([id]) => id);
    }
    /**
     * Re-read every target's installed state.
     * @param remote - the Team presets Remote namespace to read through.
     * @returns resolution after the snapshot was published.
     */
    async refresh(remote = this.namespace) {
        if (remote === undefined) {
            this.state = { ...this.state, status: 'unavailable', live: this.liveTargets() };
            this.publish();
            return;
        }
        try {
            const targets = unwrap(await remote.cardPatches());
            this.state = { ...this.state, status: 'ready', targets, live: this.liveTargets(targets) };
        }
        catch (error) {
            this.state = { ...this.state, status: 'unavailable', live: this.liveTargets() };
            console.warn('[team-presets] could not read card patch state:', error);
        }
        this.publish();
    }
    /**
     * Install one target's replacement, then re-read every row.
     * @param id - the target identity.
     * @returns resolution after the outcome was published.
     */
    async install(id) {
        const namespace = this.namespace;
        if (namespace === undefined)
            return this.refuseMissingNamespace(id);
        await this.act(id, () => namespace.installCardPatch(id));
    }
    /**
     * Restore one target's published bundle, then re-read every row.
     * @param id - the target identity.
     * @returns resolution after the outcome was published.
     */
    async uninstall(id) {
        const namespace = this.namespace;
        if (namespace === undefined)
            return this.refuseMissingNamespace(id);
        await this.act(id, () => namespace.uninstallCardPatch(id));
    }
    /**
     * Report a write that cannot start because this build has no Remote.
     * @param id - the target the reader asked to write.
     */
    refuseMissingNamespace(id) {
        this.state = {
            ...this.state,
            busy: undefined,
            phase: undefined,
            result: { ok: false, id, state: 'absent', detail: 'the Team presets Remote is not mounted in this session' },
        };
        this.publish();
    }
    /**
     * Run one write and publish its outcome.
     * @param id - the target being written.
     * @param run - the Remote call.
     * @returns resolution after the rows were re-read.
     */
    async act(id, run) {
        this.state = { ...this.state, busy: id, phase: 'applying', result: undefined };
        this.publish();
        let result;
        try {
            result = unwrap(await run());
        }
        catch (error) {
            result = { ok: false, id, state: 'absent', detail: String(error) };
        }
        this.state = { ...this.state, busy: undefined, phase: result.ok ? 'waiting' : undefined, result };
        this.publish();
        await this.refresh();
        if (result.ok)
            await this.settle(id, result.state === 'patched');
        this.state = { ...this.state, phase: undefined };
        this.publish();
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
    async settle(id, expected) {
        const deadline = Date.now() + this.settleTimeoutMs;
        for (;;) {
            const live = this.liveTargets();
            const settled = live.includes(id) === expected;
            this.state = { ...this.state, live };
            this.publish();
            if (settled || Date.now() >= deadline)
                return;
            await new Promise((resolve) => { setTimeout(resolve, this.settlePollMs); });
        }
    }
    /** Release the page's listeners. */
    dispose() {
        this.listeners.clear();
    }
}
