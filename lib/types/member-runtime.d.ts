/**
 * Member runtime coordination for preset-managed Team members.
 *
 * Preset member snapshots carry the route, persona, and policy before creation.
 * The serial `agent/created` callback installs `agentOptions`, `persona`, and
 * `toolFilter` to the subagent service, so a member arrives already created
 * with the Team Lead's route and the deployment's full tool surface. The one
 * public extension point that runs before the member's first request is the
 * serial, awaited `agent/created` event, so this module:
 *
 * 1. records the member's complete frozen configuration durably before the
 *    Team service is asked to create it, keyed by `(rootSessionId, name)` —
 *    the identity the roster already persists;
 * 2. on the creation edge, resolves that record through the official
 *    reserved child identity and installs the member-scoped route, persona,
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
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { SubagentActivation } from '@deepseek-ai/dsh-subagent';
import type { MemberRecord, MemberStore } from './member-store.ts';
import type { StrictToolPolicy } from './tool-policy.ts';
/** Prompt section one managed member's team context is registered under. */
export declare const MEMBER_TEAM_SECTION = "agent-team-presets:member-team";
/**
 * The identity an official Team member is recognized by.
 *
 * Structurally identical to the Team service's `TeamMembership`, narrowed to
 * the two fields that name one member instance.
 */
export interface MemberMembership {
    /** The Team Lead Agent this member belongs to. */
    readonly root: Agent;
    /** Exact teammate target, unique for the Team's lifetime. */
    readonly name: string;
}
/** Everything one member instance is frozen with, captured before creation. */
export interface MemberIntent {
    /** The Team Lead Agent summoning the member. */
    readonly root: Agent;
    /** Reserved child identity, persisted before the Host starts creation. */
    readonly childId?: string;
    /** Exact instance target the member is created under. */
    readonly target: string;
    /** Team preset identity the snapshot comes from. */
    readonly teamId: string;
    /** Stable member identity inside the preset, when it carries one. */
    readonly roleId?: string | undefined;
    /** Configured display name. */
    readonly displayName: string;
    /** Configured role description. */
    readonly roleDescription: string;
    /** Frozen own persona text. */
    readonly persona: string;
    /** Frozen team context and division-of-labour text. */
    readonly teamSection: string;
    /** Preset roster the division-of-labour text was rendered from. */
    readonly roster: MemberRecord['roster'];
    /** Frozen route, or undefined to run on the Session's own route. */
    readonly route: MemberRecord['route'];
    /** Frozen strict tool policy of this member's own slot. */
    readonly policy: StrictToolPolicy;
    /** Subagent execution backend the member is created through. */
    readonly spawnContext: 'fresh' | 'fork';
}
/** Whether the durable member snapshot unit is usable. */
export type MemberStoreState = {
    readonly kind: 'ready';
    readonly store: MemberStore;
    readonly reason?: undefined;
} | {
    readonly kind: 'unavailable';
    readonly store?: undefined;
    readonly reason: string;
};
/** Outcome of recording one member's frozen configuration before creation. */
export type MemberPrepare = {
    readonly kind: 'ready';
    readonly record: MemberRecord;
} | {
    readonly kind: 'refused';
    readonly reason: string;
};
/** Outcome of claiming one live Agent as a managed member. */
export type MemberClaim = {
    readonly kind: 'installed';
    readonly record: MemberRecord;
} | {
    readonly kind: 'unmanaged';
} | {
    readonly kind: 'invalid';
    readonly reason: string;
};
/**
 * Owns the durable member snapshots and every scoped registration a managed
 * member runs under.
 *
 * One instance belongs to one plugin activation. The store opens
 * asynchronously; until it is confirmed open every member creation is refused,
 * because a member created without a durable snapshot could never be
 * re-scoped after a restart.
 */
export declare class MemberRuntime {
    private readonly ctx;
    private state;
    private readonly ready;
    private readonly installations;
    /**
     * Newest failure one member's own turn produced, keyed by Team identity.
     *
     * A member whose configured route is unusable fails inside its first turn, so
     * the Host reports only its own provisioning error ("initial prompt was not
     * durably accepted"). Capturing the member's real cause lets the creation
     * error name it instead of sending the captain hunting for a routing fault.
     */
    private readonly failures;
    /** Live creations this activation started, so teardown can stop exactly them. */
    private readonly activations;
    /** Whole member-creation transactions admitted by this activation. */
    private readonly inFlight;
    private closed;
    /**
     * @param ctx - the plugin context that will carry the scoped registrations.
     */
    constructor(ctx: Context);
    /** Open the durable unit and record why member injection stays disabled when it cannot. */
    private open;
    /**
     * Wait until the durable unit has been opened or definitively refused.
     * @returns whether the store is usable, and why not when it is not.
     */
    whenReady(): Promise<MemberStoreState>;
    /**
     * Record one member's frozen configuration durably, before it can be created.
     * @param intent - the frozen configuration captured for this instance.
     * @returns the durable record, or the reason member creation must be refused.
     */
    prepare(intent: MemberIntent): Promise<MemberPrepare>;
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
    membershipFor(agent: Agent): MemberMembership | undefined;
    claim(agent: Agent, membership: MemberMembership, managed: boolean): MemberClaim;
    /**
     * Read the newest failure one member's own turn reported.
     * @param rootSessionId - the Team Lead Session identity.
     * @param memberName - the exact teammate target.
     * @returns the captured failure text, or undefined when the member reported none.
     */
    failureOf(rootSessionId: string, memberName: string): string | undefined;
    /**
     * Bind one created child Session to its durable snapshot.
     *
     * The snapshot was already durable before creation, so this write is
     * bookkeeping: a failure is reported and the member keeps running under the
     * configuration the snapshot already fixed.
     * @param agent - the created child Agent.
     * @param membership - its resolved Team identity.
     */
    bind(agent: Agent, membership: MemberMembership): Promise<void>;
    /**
     * Mark one creation attempt as having produced no child.
     * @param rootSessionId - the Team Lead Session identity.
     * @param memberName - the exact teammate target.
     */
    markFailed(rootSessionId: string, memberName: string): Promise<void>;
    /**
     * Every durable member record one Team root owns.
     *
     * The header roster shows members that have been summoned, not the roles a
     * Team could summon, so this reads the snapshots rather than Settings.
     * @param rootSessionId - the Team Lead Session identity.
     * @returns that root's records, ordered by member name.
     */
    recordsUnder(rootSessionId: string): MemberRecord[];
    /**
     * Identify a preset-created child by its durable Session id, including cold
     * and failed instances. A reserved id cannot produce a badge until the target
     * plugin actually renders a card for that Session.
     * @param sessionId - the real child Session identity, never a graph node id.
     * @returns whether a stored creation snapshot owns this exact child.
     */
    isPresetMember(sessionId: string): Promise<boolean>;
    /**
     * Read the snapshot one Agent was installed from.
     * @param agent - a live Agent.
     * @returns its frozen record, or undefined when this Agent is not managed here.
     */
    recordFor(agent: Agent): MemberRecord | undefined;
    /**
     * Release one Agent's scoped registrations.
     * @param agent - the Agent leaving the registry.
     * @returns whether this Agent had managed registrations to release.
     */
    release(agent: Agent): boolean;
    /** Release every registration this activation installed. */
    releaseAll(): void;
    /** Number of live residencies currently carrying managed registrations. */
    get installedCount(): number;
    /**
     * Retain one creation receipt so teardown stops the epoch this activation started.
     * @param activation - the receipt `startActivation` returned.
     * @returns the same receipt.
     */
    track<T extends SubagentActivation>(activation: T): T;
    /**
     * Stop every epoch this activation started.
     *
     * A cold-restored residency has no receipt here: rc.2 exposes no selective
     * disposal for one, so only the current work of those is interrupted.
     * @returns resolution once every retained epoch has settled.
     */
    disposeActivations(): Promise<void>;
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
    admit<T>(operation: () => Promise<T>): Promise<T>;
    /** Whether a new member-creation transaction may still start. */
    get admissionOpen(): boolean;
    /**
     * Stop admitting creations and wait for every admitted transaction to settle.
     *
     * This is the first teardown step, before any live residency is touched: the
     * live scopes stay registered on `agent.ctx` until their own Agent is
     * disposed, so no member is ever left running without the policy it was
     * created under.
     * @returns resolution once no creation is still in flight.
     */
    closeAdmission(): Promise<void>;
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
    close(): Promise<void>;
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
export declare function installMemberScopes(agent: Agent, record: MemberRecord): () => void;
