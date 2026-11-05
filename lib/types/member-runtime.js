/**
 * Member runtime coordination for preset-managed Team members.
 *
 * Official rc.2's Team request does not carry `agentOptions`, `persona`, or
 * `toolFilter` to the subagent service, so a member arrives already created
 * with the Team Lead's route and the deployment's full tool surface. The one
 * public extension point that runs before the member's first request is the
 * serial, awaited `agent/created` event, so this module:
 *
 * 1. records the member's complete frozen configuration durably before the
 *    Team service is asked to create it, keyed by `(rootSessionId, name)` —
 *    the identity the roster already persists;
 * 2. on the creation edge, resolves that record through the official
 *    `tryMembership` identity and installs the member-scoped route, persona,
 *    team context, and strict tool policy before creation resolves;
 * 3. re-installs for every later residency (a finished member is cold-resumed
 *    from its durable descriptor and re-emits `agent/created`);
 * 4. refuses rather than guesses: without a readable snapshot it neither
 *    creates a member nor reports one as managed, and a member that IS
 *    identified with a damaged snapshot vetoes its own creation.
 *
 * Nothing here patches the Host: every registration is an ordinary
 * Agent-scoped contribution owned by `agent.ctx`, and the Team service keeps
 * the roster, addressing, mailbox, and task board.
 * @module dsh-agent-team-presets/member-runtime
 */
import { randomUUID } from 'node:crypto';
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm';
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt';
import { foldSubagentDescriptor } from '@deepseek-ai/dsh-subagent';
import { MEMBER_FRESH_PROVIDER, MEMBER_FORK_PROVIDER } from "./member-identity.js";
import { openMemberStore } from "./member-store.js";
import { guardPolicy, inheritedFilter } from "./tool-policy.js";
/** Prompt section one managed member's team context is registered under. */
export const MEMBER_TEAM_SECTION = 'agent-team-presets:member-team';
/** Diagnostics prefix for member-runtime failures. */
const LOG = 'agent-team-presets';
/**
 * Refuse member creation when no durable snapshot channel exists.
 *
 * The text is model-facing: it reaches the captain as the member tool's error,
 * so it states which capability is missing instead of pretending the member
 * was created.
 */
const NO_STORE_REASON = 'The durable member configuration store is unavailable in this deployment, so a Team member '
    + 'cannot be given its frozen route, persona, and tool policy. Spawning a member is refused rather than letting it '
    + 'run on this Session\'s route with unrestricted tools.';
/** Why a creation that arrives while the activation is shutting down is refused. */
const NO_ADMISSION_REASON = 'This plugin activation is shutting down, so no new Team member can be created. '
    + 'The Team can summon members again after it is reloaded.';
/** Identity key of one member instance inside the failure-note table. */
function failureKey(rootSessionId, memberName) {
    return `${rootSessionId}\u0000${memberName}`;
}
/**
 * Owns the durable member snapshots and every scoped registration a managed
 * member runs under.
 *
 * One instance belongs to one plugin activation. The store opens
 * asynchronously; until it is confirmed open every member creation is refused,
 * because a member created without a durable snapshot could never be
 * re-scoped after a restart.
 */
export class MemberRuntime {
    ctx;
    state;
    ready;
    installations = new Map();
    /**
     * Newest failure one member's own turn produced, keyed by Team identity.
     *
     * A member whose configured route is unusable fails inside its first turn, so
     * the Host reports only its own provisioning error ("initial prompt was not
     * durably accepted"). Capturing the member's real cause lets the creation
     * error name it instead of sending the captain hunting for a routing fault.
     */
    failures = new Map();
    /** Whole member-creation transactions admitted by this activation. */
    inFlight = new Set();
    closed = false;
    /**
     * @param ctx - the plugin context that will carry the scoped registrations.
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.ready = this.open();
    }
    /** Open the durable unit and record why member injection stays disabled when it cannot. */
    async open() {
        try {
            const store = await openMemberStore(this.ctx);
            if (this.closed) {
                await store.close();
                return;
            }
            this.state = { kind: 'ready', store };
        }
        catch (error) {
            if (this.closed)
                return;
            this.state = { kind: 'unavailable', reason: `${NO_STORE_REASON} (${String(error)})` };
            // Loud on activation: a deployment that cannot keep member snapshots must
            // not look like one where preset members work.
            this.ctx.logger.warn(`${LOG}: %s: %s`, NO_STORE_REASON, String(error));
        }
    }
    /**
     * Wait until the durable unit has been opened or definitively refused.
     * @returns whether the store is usable, and why not when it is not.
     */
    async whenReady() {
        await this.ready;
        /* v8 ignore next -- only a close racing activation can leave no state. */
        return this.state ?? { kind: 'unavailable', reason: NO_STORE_REASON };
    }
    /**
     * Record one member's frozen configuration durably, before it can be created.
     * @param intent - the frozen configuration captured for this instance.
     * @returns the durable record, or the reason member creation must be refused.
     */
    async prepare(intent) {
        if (this.closed)
            return { kind: 'refused', reason: NO_ADMISSION_REASON };
        const state = await this.whenReady();
        if (this.closed)
            return { kind: 'refused', reason: NO_ADMISSION_REASON };
        if (state.kind !== 'ready')
            return { kind: 'refused', reason: state.reason };
        const existing = state.store.get(intent.root.id, intent.target);
        this.failures.delete(failureKey(intent.root.id, intent.target));
        if (existing !== undefined && existing.lifecycle === 'bound') {
            return {
                kind: 'refused',
                reason: `Teammate "${intent.target}" already identifies a preset-managed member of this Team `
                    + `(child "${existing.childSessionId ?? 'unknown'}"); teammate names are never reused, so this creation is refused.`,
            };
        }
        const record = {
            schemaVersion: 1,
            intentId: randomUUID(),
            rootSessionId: intent.root.id,
            memberName: intent.target,
            teamId: intent.teamId,
            ...intent.roleId === undefined || intent.roleId === '' ? {} : { roleId: intent.roleId },
            displayName: intent.displayName,
            roleDescription: intent.roleDescription,
            persona: intent.persona,
            teamSection: intent.teamSection,
            roster: intent.roster.map(entry => ({ ...entry })),
            ...intent.route === undefined ? {} : { route: { ...intent.route } },
            policy: { mode: intent.policy.mode, allow: [...intent.policy.allow] },
            spawnContext: intent.spawnContext,
            lifecycle: 'intent',
            updatedAt: Date.now(),
        };
        try {
            await state.store.put(record);
        }
        catch (error) {
            return { kind: 'refused', reason: `the member configuration snapshot could not be persisted: ${String(error)}` };
        }
        return { kind: 'ready', record };
    }
    /**
     * Claim one Agent on its creation edge and install every scoped registration.
     *
     * `managed` is the durable identity this plugin's own execution aliases give
     * the child: the caller reads it from the child's establishing descriptor, and
     * it is what makes an unreadable or missing snapshot a refusal instead of
     * "not ours". An Agent with neither marker nor snapshot is left entirely
     * alone: native Teams, ordinary subagents, and provider-owned workers stay
     * upstream-owned, which is also the documented fate of a member an earlier
     * plugin version created before the marker existed.
     * @param agent - the Agent entering the registry.
     * @param membership - its resolved Team identity.
     * @param managed - whether the child's own establishing descriptor carries this plugin's member backend.
     * @returns whether the member was installed, is not plugin-managed, or is managed but unusable.
     * @throws when a managed member's scopes cannot be installed completely.
     */
    claim(agent, membership, managed) {
        const installed = this.installations.get(agent);
        if (installed !== undefined)
            return { kind: 'installed', record: installed.record };
        const state = this.state;
        if (state === undefined || state.kind !== 'ready') {
            // The snapshot channel is unusable. A native teammate is still left to
            // upstream, but a child the Host recorded as created through this
            // plugin's own backend must not resume on the deployment default.
            return managed
                ? { kind: 'invalid', reason: `${NO_STORE_REASON} The Host records teammate "${membership.name}" as created through this plugin's member backend, so it is refused instead of resuming without its frozen configuration.` }
                : { kind: 'unmanaged' };
        }
        let record = state.store.get(membership.root.id, membership.name);
        if (record === undefined) {
            return managed
                ? {
                    kind: 'invalid',
                    reason: `The Host records teammate "${membership.name}" as created through this plugin's member backend, but `
                        + 'no frozen configuration snapshot for it can be read. Refusing to run it on default configuration.',
                }
                : { kind: 'unmanaged' };
        }
        if (record.rootSessionId !== membership.root.id || record.memberName !== membership.name) {
            return {
                kind: 'invalid',
                reason: `the stored configuration snapshot for teammate "${membership.name}" does not belong to Session `
                    + `"${membership.root.id}"; refusing to create it rather than running it on default configuration.`,
            };
        }
        // Two invariant violations the snapshot can prove on its own: a creation
        // that never produced a child, and a binding to a different child. Neither
        // may be silently re-pointed at the Agent standing here now.
        if (record.lifecycle === 'failed') {
            return {
                kind: 'invalid',
                reason: `the stored configuration snapshot for teammate "${membership.name}" records a creation that produced `
                    + 'no child; refusing to run a different child under that identity.',
            };
        }
        if (record.childSessionId !== undefined && record.childSessionId !== agent.id) {
            return {
                kind: 'invalid',
                reason: `the stored configuration snapshot for teammate "${membership.name}" is bound to child Session `
                    + `"${record.childSessionId}", not to this Agent "${agent.id}"; refusing to rebind a member to another child.`,
            };
        }
        if (managed && record.lifecycle === 'intent' && record.childSessionId === undefined) {
            // A fresh child already has a descriptor before agent/created, so a
            // descriptor alone cannot bypass the new-generation admission check.
            // Only the establishing descriptor loaded from a previous residency
            // proves this child existed before the bind bookkeeping was lost.
            const events = agent.session.ownEvents();
            const established = events.find(event => event.type === 'subagent/descriptor');
            if (established !== undefined && established.seq < agent.session.firstLiveSeq) {
                let descriptor;
                try {
                    descriptor = foldSubagentDescriptor(events);
                }
                catch (error) {
                    return { kind: 'invalid', reason: `the persisted member descriptor is invalid: ${String(error)}` };
                }
                const provider = record.spawnContext === 'fresh' ? MEMBER_FRESH_PROVIDER : MEMBER_FORK_PROVIDER;
                if (descriptor?.mode !== 'continuable' || descriptor.provider !== provider
                    || agent.session.header.parentSession !== membership.root.id) {
                    return { kind: 'invalid', reason: 'the persisted member descriptor or parent does not match its frozen configuration; refusing to recover its child binding.' };
                }
                record = { ...record, lifecycle: 'bound', childSessionId: agent.id, updatedAt: Date.now() };
            }
        }
        // Every registration is owned by `agent.ctx`: a throw here rolls back the
        // partial install and the caller vetoes creation, so no member ever runs
        // under a half-applied policy.
        const observeFailure = agent.ctx.on('agent/error', ({ error }) => {
            this.failures.set(failureKey(membership.root.id, membership.name), String(error));
        });
        let dispose;
        try {
            dispose = installMemberScopes(agent, record);
        }
        catch (error) {
            observeFailure();
            throw error;
        }
        this.installations.set(agent, {
            record,
            dispose: () => { observeFailure(); dispose(); },
        });
        if (record.lifecycle === 'bound') {
            const binding = this.bind(agent, membership);
            this.inFlight.add(binding);
            void binding.finally(() => { this.inFlight.delete(binding); });
        }
        return { kind: 'installed', record };
    }
    /**
     * Read the newest failure one member's own turn reported.
     * @param rootSessionId - the Team Lead Session identity.
     * @param memberName - the exact teammate target.
     * @returns the captured failure text, or undefined when the member reported none.
     */
    failureOf(rootSessionId, memberName) {
        return this.failures.get(failureKey(rootSessionId, memberName));
    }
    /**
     * Bind one created child Session to its durable snapshot.
     *
     * The snapshot was already durable before creation, so this write is
     * bookkeeping: a failure is reported and the member keeps running under the
     * configuration the snapshot already fixed.
     * @param agent - the created child Agent.
     * @param membership - its resolved Team identity.
     */
    async bind(agent, membership) {
        const state = this.state;
        if (state === undefined || state.kind !== 'ready')
            return;
        const current = state.store.get(membership.root.id, membership.name);
        const installation = this.installations.get(agent);
        if (current === undefined || installation === undefined
            || current.rootSessionId !== membership.root.id || current.memberName !== membership.name
            || installation.record.rootSessionId !== membership.root.id || installation.record.memberName !== membership.name
            || installation.record.intentId !== current.intentId || current.lifecycle === 'failed'
            || (current.childSessionId !== undefined && current.childSessionId !== agent.id))
            return;
        if (current.lifecycle === 'bound' && current.childSessionId === agent.id)
            return;
        const bound = { ...current, lifecycle: 'bound', childSessionId: agent.id, updatedAt: Date.now() };
        // Preserve the verified child identity for this residency even if storage
        // fails; a later residency must independently prove it from its own log.
        this.installations.set(agent, { ...installation, record: bound });
        try {
            await state.store.put(bound);
        }
        catch (error) {
            this.ctx.logger.warn(`${LOG}: could not bind child "%s" to its member snapshot; the snapshot recorded before creation still governs it: %s`, agent.id, String(error));
        }
    }
    /**
     * Mark one creation attempt as having produced no child.
     * @param rootSessionId - the Team Lead Session identity.
     * @param memberName - the exact teammate target.
     */
    async markFailed(rootSessionId, memberName) {
        const state = this.state;
        if (state === undefined || state.kind !== 'ready')
            return;
        const current = state.store.get(rootSessionId, memberName);
        if (current === undefined || current.lifecycle !== 'intent')
            return;
        try {
            await state.store.put({ ...current, lifecycle: 'failed', updatedAt: Date.now() });
        }
        catch (error) {
            this.ctx.logger.warn(`${LOG}: could not record the failed creation of teammate "%s": %s`, memberName, String(error));
        }
    }
    /**
     * Read the snapshot one Agent was installed from.
     * @param agent - a live Agent.
     * @returns its frozen record, or undefined when this Agent is not managed here.
     */
    recordFor(agent) {
        return this.installations.get(agent)?.record;
    }
    /**
     * Release one Agent's scoped registrations.
     * @param agent - the Agent leaving the registry.
     * @returns whether this Agent had managed registrations to release.
     */
    release(agent) {
        const installation = this.installations.get(agent);
        if (installation === undefined)
            return false;
        this.installations.delete(agent);
        installation.dispose();
        return true;
    }
    /** Release every registration this activation installed. */
    releaseAll() {
        for (const agent of [...this.installations.keys()])
            this.release(agent);
    }
    /** Number of live residencies currently carrying managed registrations. */
    get installedCount() {
        return this.installations.size;
    }
    /**
     * Release every registration and close the durable unit.
     * @returns resolution after the unit is released.
     */
    /**
     * Run one whole member-creation transaction under this activation's admission.
     *
     * Closing admission is what stops a late tool call from starting a new member
     * that nothing would own: the transaction is tracked from its first
     * synchronous step until it settles, so an unloading activation can wait for
     * it instead of racing it.
     * @param operation - the whole creation transaction.
     * @returns the operation's result.
     * @throws when this activation no longer admits new members.
     */
    async admit(operation) {
        if (this.closed)
            throw new Error(NO_ADMISSION_REASON);
        const running = Promise.resolve().then(operation);
        this.inFlight.add(running);
        try {
            return await running;
        }
        finally {
            this.inFlight.delete(running);
        }
    }
    /** Whether a new member-creation transaction may still start. */
    get admissionOpen() {
        return !this.closed;
    }
    /**
     * Stop admitting creations and wait for every admitted transaction to settle.
     *
     * This is the first teardown step, before any live residency is touched: the
     * live scopes stay registered on `agent.ctx` until their own Agent is
     * disposed, so no member is ever left running without the policy it was
     * created under.
     * @returns resolution once no creation is still in flight.
     */
    async closeAdmission() {
        this.closed = true;
        while (this.inFlight.size > 0)
            await Promise.allSettled([...this.inFlight]);
    }
    /**
     * Close creation admission and release the durable unit.
     *
     * Live residencies are deliberately NOT released here: their registrations
     * belong to `agent.ctx`, which outlives a plugin activation, and a member that
     * keeps running after an unload must keep the strict policy it was created
     * with. Callers that really are tearing the Agents down release them through
     * {@link releaseAll} or through the Agent's own disposal.
     * @returns resolution after the unit is released.
     */
    async close() {
        await this.closeAdmission();
        this.failures.clear();
        const state = this.state;
        this.state = undefined;
        if (state?.kind === 'ready')
            await state.store.close();
    }
}
/**
 * Install one managed member's complete scoped configuration atomically.
 *
 * The persona section deliberately reuses the deployment persona slot: a
 * member's own standing prompt REPLACES the deployment persona for that member
 * alone, exactly as an Agent preset does, instead of being appended beside a
 * conflicting one. The team-context section is plugin-namespaced and carries
 * the frozen division of labour. The strict guard is installed beside the
 * visibility restriction, because an allow-list that only hides tools is not a
 * permission boundary: nested PTC dispatch and own-layer tools still reach the
 * executor.
 * @param agent - the member Agent being initialized.
 * @param record - its frozen snapshot.
 * @returns the disposer releasing every registration it installed.
 * @throws when any registration fails, after rolling the partial install back.
 */
export function installMemberScopes(agent, record) {
    const disposers = [];
    try {
        if (record.persona.trim() !== '') {
            disposers.push(agent.ctx.systemPrompt.section({
                name: PERSONA_PREFIX_SECTION,
                order: agent.ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX'),
                text: record.persona,
            }));
        }
        if (record.teamSection.trim() !== '') {
            disposers.push(agent.ctx.systemPrompt.section({
                name: MEMBER_TEAM_SECTION,
                order: agent.ctx.systemPrompt.getSectionOrder('TEAM_POLICY'),
                text: record.teamSection,
            }));
        }
        const policy = { teamId: record.teamId, mode: record.policy.mode, allow: [...record.policy.allow] };
        // Keep the deployment's executor: rc.1 intentionally leaves an unavailable
        // selection after a scoped executor is unloaded. The awaited creation edge
        // checks that a custom member has a native surface before its first request.
        disposers.push(guardPolicy(agent, policy, { role: 'member', presentation: 'caller' }));
        const filter = inheritedFilter(agent, policy);
        if (filter !== undefined)
            disposers.push(agent.ctx.tools.restrict(filter));
        // Model selection is a durable Session choice, not a scoped registration.
        // Commit it only after every reversible scope installed successfully. On a
        // fork this supersedes the inherited Lead selection; on resume an identical
        // recorded choice is a no-op. Omitted effort resolves the member's defaults.
        if (record.route !== undefined) {
            agent.model.select({
                provider: record.route.provider,
                model: record.route.model,
                ...record.route.reasoningEffort === undefined
                    ? {}
                    : { reasoningEffort: ReasoningEffortId(record.route.reasoningEffort) },
            });
        }
    }
    catch (error) {
        for (const dispose of disposers.reverse())
            void dispose();
        throw error;
    }
    return () => { for (const dispose of disposers.splice(0).reverse())
        void dispose(); };
}
