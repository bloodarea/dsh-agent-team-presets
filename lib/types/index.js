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
import { applyTeamToAgent, assertTeamApplicable, capabilityRefusal } from "./application.js";
import { MemberRuntime } from "./member-runtime.js";
import { createdDepthRefusal } from "./delegation.js";
import { isPresetMemberProvider, memberProviderMarker, registerMemberProviders } from "./member-identity.js";
import { installNativePresentation, personaBaseline, prepareNativePresentation, readWire } from "./presentation.js";
import { teamSettingsReconcile } from "./settings-reconcile.js";
import { hasTeamApplicationMarker, isSessionRoot, TeamExecutionMonitor, teammatesBusy } from "./execution.js";
import { RUN_CODE_NAME } from '@deepseek-ai/dsh-tools';
import { registerPresetTools } from "./preset-tools.js";
import { CAPTAIN_ROLE, TeamSkills, resolveSkillRoot, roleOfMember } from "./team-skills/index.js";
import { TeamSkillService } from "./team-skills/service.js";
import { registerTeamSkillTools } from "./team-skills/tools.js";
import { definitionFingerprint, findTeam, selectedTeam, toolMode } from "./presets.js";
import TeamPresetsToolCatalog from "./tool-catalog.js";
import { CAPTAIN_RECOVERY_TOOLS, descriptorPolicy, guardPolicy, hasLegacyPresetBriefing, policyOf } from "./tool-policy.js";
export { Config } from "./config.js";
/** Cordis plugin name. */
export const name = 'agent-team-presets';
/** Settings entry this plugin owns and rewrites when stored Teams are stale. */
const NAMESPACE = 'agent-team-presets';
/**
 * Services this plugin reads: the Session agents it composes, the Team service
 * it summons members through, the tool registry its member and preset tools
 * join, the prompt sections its captain adds, the session projections that
 * authenticate a preset write, and the settings document it owns.
 */
export const inject = ['agents', 'agentTeams', 'tools', 'systemPrompt', 'sessionProjections', 'settings', 'subagents'];
/** Diagnostics prefix for the failures this plugin only reports. */
const LOG = 'agent-team-presets';
/**
 * Apply one valid Team preset to one live Session, and keep it current between
 * that Session's Team tasks.
 * @param ctx - the plugin context providing the Session, Team, tool, prompt, and settings services.
 * @param config - the live configuration whose volatile values carry the stored Teams.
 */
export function apply(ctx, config) {
    const applications = new Map();
    const definitions = new Map();
    const quarantines = new Map();
    /**
     * Session roots this activation watched running with no Team at a task boundary.
     *
     * This is the only thing that makes "select a Team mid-task" a safe no-op
     * instead of a quarantine. It is established solely from a boundary this
     * activation itself observed — never from a first glance at an empty
     * selection, because an empty selection can equally be a Session whose Team
     * was deselected while its task ran, and that Session's policy is unknown.
     */
    const provenUnteamed = new Set();
    /** Roots whose last Team restore failed, so their quarantine reason is kept. */
    const restoreFailures = new Set();
    const childPolicies = new Map();
    const childEnvelopes = new Map();
    /** Teammates whose scoped configuration the durable member runtime installed. */
    const managedMembers = new Set();
    // Member snapshots are durable and owned by this activation: a member whose
    // snapshot cannot be read is never created, and one that IS identified with a
    // damaged snapshot vetoes its own creation instead of running on defaults.
    const members = new MemberRuntime(ctx);
    // Team Skills are a private library of complete skill folders, assigned per
    // role and registered only inside the exact Agent's Cordis scope. Nothing is
    // registered globally: an unassigned Session, an unselected Team, and a member
    // with no assignment all see nothing from this subsystem.
    const teamSkills = new TeamSkills(ctx, resolveSkillRoot(config.skillRoot), () => config.teams.get(), message => { ctx.logger.warn(`${LOG}: %s`, message); });
    /** The Team role each live Agent fills, so a binding change can re-sync it. */
    const agentRoles = new Map();
    /**
     * Re-apply one live Agent's Team Skill assignment and report an unusable one.
     *
     * For an Agent that already exists this cannot veto anything, so an assignment
     * that could not be published is reported at the exact Agent identity. The
     * creation edge uses `skillAssignmentRefusal` instead, where a refusal is
     * still possible and is what keeps a member from starting on an empty catalog.
     * @param agent - the live Agent whose assignment changes.
     * @param role - the role it fills, or undefined to release the registration.
     * @returns the settled registration outcome.
     */
    const syncRoleSkills = async (agent, role, signal) => {
        // Exactly two arguments when nothing can cancel: callers (and their
        // assertions) identify an application by `(agent, role)`.
        const synced = signal === undefined
            ? await teamSkills.syncAgent(agent, role)
            : await teamSkills.syncAgent(agent, role, { signal });
        // `undefined` means the bindings themselves were unreadable, which is
        // reported as loudly as a non-empty assignment.
        if ((synced.assigned === undefined || synced.assigned > 0) && synced.outcome.status !== 'installed') {
            ctx.logger.warn('%s: Agent "%s" holds %s assigned Team Skill(s) that are not visible to it: %s', LOG, agent.id, synced.assigned ?? 'an unreadable number of', synced.outcome.reason ?? synced.outcome.status);
        }
        return synced;
    };
    // Every member is summoned through this plugin's own execution alias, so the
    // Host itself persists the fact that the child is preset-managed. The aliases
    // delegate the whole provider contract to the deployment's providers, and
    // this registry keeps them in step with a provider registry that may still be
    // filling up: a provider that activates after this plugin is picked up, and a
    // replaced or withdrawn one is rebound or refused, without restarting.
    const providers = registerMemberProviders(ctx, { fresh: config.freshProvider, fork: config.forkProvider }, (context, state, reason) => {
        // `missing` is the expected state while a provider plugin is still
        // loading, so it is not an incident here. It is still the refusal a member
        // creation reports if it is asked for one in that window.
        if (state === 'registration' || state === 'unsupported' || state === 'alias' || state === 'unconfigured') {
            ctx.logger.warn(`${LOG}: ${context} Team members are unavailable: %s`, reason);
        }
    });
    ctx.effect(() => () => { providers.dispose(); }, 'agent-team-presets: member execution aliases');
    /**
     * Deny the tools of one Agent until its capability policy can be proven again.
     *
     * The guard refuses every name except the captain's recovery set. A Session
     * root keeps those ten because they grant no capability and are the only way
     * its captain can reach the composer action the refusal text recommends; a
     * child keeps none, because a teammate has no composer and no preset
     * authority, so any exemption there would be a way to act without a policy.
     * @param agent - the Agent to quarantine.
     * @param reason - the refusal every non-exempt tool reports.
     */
    const quarantine = (agent, reason) => {
        const previous = quarantines.get(agent);
        if (previous !== undefined) {
            previous.reason = reason;
            return;
        }
        // A quarantine is not evidence of "No team": drop any baseline this Agent
        // had, so a later busy edge cannot read stale proof.
        provenUnteamed.delete(agent);
        const state = { reason, dispose: () => { } };
        const recoveryAllowed = isSessionRoot(agent);
        state.dispose = agent.ctx.tools.guard(exec => recoveryAllowed && CAPTAIN_RECOVERY_TOOLS.has(exec.name)
            ? undefined
            : state.reason);
        quarantines.set(agent, state);
    };
    const recovery = 'Choose another valid Team or "No team" in this Session\'s composer Team control. Changes apply once the captain and its teammates are idle.';
    /**
     * Refuse one child: inside the serial `agent/created` transaction a throw
     * aborts creation before the member's first request; a child that is already
     * live cannot be refused retroactively without leaking the registrations its
     * own activation installed, so it is quarantined instead.
     */
    const refuseChild = (agent, live, reason) => {
        if (!live)
            throw new Error(reason);
        ctx.logger.warn(`${LOG}: %s`, reason);
        quarantine(agent, reason);
    };
    /**
     * Veto one member's creation and release everything this edge installed.
     *
     * The claim, the role binding, the child envelope and the skill registration
     * were all taken before the assignment could be proven publishable, so a
     * refusal that only threw would leave this activation believing a member it
     * never created is still live. Releasing them keeps the durable record and the
     * in-memory tables in step with the Host's rollback.
     * @param agent - the member whose creation is vetoed.
     * @param reason - the refusal text the Host reports to the summoner.
     */
    const refuseMember = (agent, reason) => {
        // Every registration this creation edge installed is released, not only the
        // skill one: a legacy child policy would otherwise keep a guard installed on
        // an Agent the Host is about to roll back.
        childPolicies.get(agent)?.();
        childPolicies.delete(agent);
        skillTools.get(agent)?.();
        skillTools.delete(agent);
        presetTools.get(agent)?.();
        presetTools.delete(agent);
        quarantines.get(agent)?.dispose();
        quarantines.delete(agent);
        pendingRoster.delete(agent);
        pendingApplications.delete(agent);
        teamSkills.releaseAgent(agent);
        agentRoles.delete(agent);
        childEnvelopes.delete(agent);
        managedMembers.delete(agent);
        members.release(agent);
        refuseChild(agent, false, reason);
    };
    /**
     * Release this activation's state for one Agent the Host rolled back.
     *
     * A cancelled creation installs the same registrations a vetoed one does, and
     * the Host's rollback only unwinds `agent.ctx`. Leaving the plugin's own maps
     * pointing at a dead Agent would make a later scan believe a member it never
     * created is live.
     * @param agent - the Agent whose creation the Host cancelled.
     */
    const abandonCreation = (agent) => {
        childPolicies.get(agent)?.();
        childPolicies.delete(agent);
        quarantines.get(agent)?.dispose();
        quarantines.delete(agent);
        pendingRoster.delete(agent);
        pendingApplications.delete(agent);
        teamSkills.releaseAgent(agent);
        agentRoles.delete(agent);
        childEnvelopes.delete(agent);
        managedMembers.delete(agent);
        members.release(agent);
    };
    /**
     * Why one member's Team Skill assignment must refuse its creation.
     *
     * A role with bound assets whose registration is not published would start its
     * first turn on an empty catalog while every operator-facing surface still
     * reported the skill as assigned — exactly the failure the assignment exists
     * to prevent. The refusal is therefore explicit and names the cause. A role
     * with no assignment, a published registration and a released registration are
     * all fine, so a deployment that composes no skill service keeps working for
     * Teams that assign nothing.
     * @param synced - the outcome of this member's own registration.
     * @returns the refusal text, or undefined when the member may be created.
     */
    const skillAssignmentRefusal = (synced) => {
        if (synced.outcome.status === 'installed')
            return undefined;
        // An unreadable library leaves `assigned` unknown, and "unknown" is refused
        // exactly like "assigned": treating it as an empty assignment would start the
        // member on a catalog this activation could not even enumerate.
        if (synced.assigned === 0)
            return undefined;
        const cause = synced.outcome.reason ?? synced.outcome.status;
        const held = synced.assigned === undefined
            ? 'this role\'s Team Skill bindings could not be read'
            : `this role holds ${String(synced.assigned)} assigned Team Skill(s)`;
        return `This member's Team role cannot start with a usable skill catalog: ${held}, but they could not be `
            + `published to it (${cause}). It is refused rather than started with an empty skill catalog; `
            + 'check the Team Skill library, or unassign them from this role.';
    };
    /**
     * Registration this child must finish before it may take a request.
     *
     * Returned by {@link initializeChild} to the exact caller that started it, so
     * two creation edges never share one slot: each Agent's readiness is its own
     * promise, and a caller only ever awaits the registration it caused.
     */
    const initializeChild = (agent, live) => {
        if (isSessionRoot(agent) || childPolicies.has(agent) || managedMembers.has(agent))
            return;
        // The child's OWN establishing descriptor comes first: it is where the Host
        // itself persisted the execution backend this member was created through.
        // A child carrying this plugin's alias is preset-managed even when no
        // snapshot can be read, so it can never be mistaken for a native teammate.
        const managed = isPresetMemberProvider(memberProviderMarker(agent));
        let membership;
        try {
            membership = ctx.agentTeams.tryMembership(agent);
        }
        catch (error) {
            // A marked child whose Team identity cannot be resolved is never explained
            // away as an ordinary child: it is refused before its first request.
            if (managed)
                throw new Error(`Preset-managed child "${agent.id}" could not be resolved from the Team roster: ${String(error)}`);
            throw error;
        }
        if (managed && membership?.role !== 'teammate') {
            refuseChild(agent, live, `The Host records child "${agent.id}" as created through this plugin's member backend, `
                + 'but it belongs to no Team roster in this Session. It is refused rather than resumed without its frozen configuration.');
            return;
        }
        if (membership?.role === 'teammate') {
            // A member this plugin created is identified by its durable marker and its
            // snapshot; native teammates and provider-owned workers stay upstream-owned.
            let claim;
            try {
                claim = members.claim(agent, { root: membership.root, name: membership.name }, managed);
            }
            catch (error) {
                const reason = `Preset-managed teammate "${membership.name}" could not be initialised with its frozen `
                    + `configuration: ${String(error)}`;
                if (!live)
                    throw new Error(reason);
                ctx.logger.warn(`${LOG}: %s`, reason);
                quarantine(agent, reason);
                return;
            }
            if (claim.kind === 'installed') {
                // A record that had no child yet is a NEW generation: the delegation
                // depth cap is re-read on this creation edge, and a member the current
                // settings no longer allow is refused before its first request. A record
                // already bound to this same child is a cold resume of an existing
                // member, not another generation, and is never invalidated by a
                // lowered cap.
                if (claim.record.lifecycle === 'intent' && claim.record.childSessionId === undefined) {
                    const refusal = createdDepthRefusal(ctx, agent);
                    if (refusal !== undefined) {
                        members.release(agent);
                        refuseChild(agent, live, refusal);
                        return;
                    }
                }
                // A startup scan may have denied this child while the durable store
                // was still opening. A successful claim now owns its complete policy.
                quarantines.get(agent)?.dispose();
                quarantines.delete(agent);
                managedMembers.add(agent);
                // A member's Team Skills are its own: the durable snapshot names the
                // role, so the assignment is resolved from the record rather than from
                // the current Settings, exactly as its route and policy are.
                const claimedTeam = findTeam(config.teams.get(), claim.record.teamId);
                const role = claim.record.roleId
                    ?? (claimedTeam === undefined ? claim.record.memberName : roleOfMember(claimedTeam, claim.record.memberName));
                let installation;
                if (role !== undefined) {
                    const assignment = { teamId: claim.record.teamId, roleId: role, captain: false };
                    agentRoles.set(agent, assignment);
                    // Registration is this member's own promise, returned to the exact
                    // caller that triggered the creation edge. The host publishes the
                    // catalog from a step boundary, so a member that starts running first
                    // would see an empty catalog for its whole first turn.
                    installation = teamSkills.syncAgent(agent, assignment);
                }
                // Ordinary descendants of this member must still see its strict policy,
                // so an escape through a provider path stays refused.
                childEnvelopes.set(agent, {
                    teamId: claim.record.teamId,
                    mode: claim.record.policy.mode,
                    allow: [...claim.record.policy.allow],
                });
                return installation;
            }
            if (claim.kind === 'invalid') {
                // Identified as managed with an unusable snapshot: refuse before any
                // model request rather than run it on the deployment default.
                if (!live)
                    throw new Error(claim.reason);
                ctx.logger.warn(`${LOG}: %s`, claim.reason);
                quarantine(agent, claim.reason);
                return;
            }
        }
        // Upstream native teammates are not this plugin's legacy continuations.
        // Upgrade only the historical briefing this plugin authored.
        const legacyPreset = membership?.role === 'teammate' && hasLegacyPresetBriefing(agent);
        const declared = descriptorPolicy(agent, legacyPreset);
        if (declared !== undefined) {
            childPolicies.set(agent, guardPolicy(agent, declared));
            childEnvelopes.set(agent, declared);
            return;
        }
        const parentId = agent.session.header.parentSession;
        const parent = parentId === undefined ? undefined : ctx.agents.get(parentId);
        if (parent === undefined)
            return;
        // A child that is already live cannot be refused retroactively without
        // leaking the registrations this plugin installed for its parent on the
        // same failed activation, so the startup scan quarantines it instead.
        // Only the serial `agent/created` transaction may veto before a request.
        const refuse = (reason) => {
            if (!live)
                throw new Error(reason);
            ctx.logger.warn(`${LOG}: %s`, reason);
            quarantine(agent, reason);
        };
        if (quarantines.has(parent)) {
            refuse('Parent Team policy is quarantined; child creation is refused.');
            return;
        }
        // A legacy all-tools Team member is intentionally independent of its
        // captain's custom policy. Ordinary descendants, unlike Team slots, inherit.
        if (membership?.role === 'teammate') {
            if (!legacyPreset) {
                // Ordinary native Teams below unselected/all-tools roots stay upstream-
                // owned. Under a strict root, an unmarked creation is not an escape.
                const parentDefinition = definitions.get(parent);
                if (parentDefinition !== undefined && policyOf(parentDefinition.id, parentDefinition.captain).mode === 'custom') {
                    refuse('Custom Team policy requires preset-managed child creation; unmarked native members are refused.');
                }
                return;
            }
            const legacyAll = { teamId: 'legacy-team', mode: 'all', allow: [] };
            childPolicies.set(agent, guardPolicy(agent, legacyAll));
            childEnvelopes.set(agent, legacyAll);
            return;
        }
        const parentDeclared = childEnvelopes.get(parent) ?? descriptorPolicy(parent);
        const rootDefinition = definitions.get(parent);
        const inherited = parentDeclared ?? (rootDefinition === undefined ? undefined : policyOf(rootDefinition.id, rootDefinition.captain));
        if (inherited?.mode === 'custom') {
            refuse('Custom Team policy requires preset-managed child creation; ordinary delegation cannot preserve its strict policy.');
        }
    };
    // Editing tools belong only to selected/applied Team roots by default.
    // Pre-selection editing is an explicit legacy compatibility opt-in.
    const presetTools = new Map();
    /** Team Skill tools, registered on the same Session roots as the preset tools. */
    const skillTools = new Map();
    const skillToolDeps = {
        ready: async () => await ready ? undefined : teamSkills.issue ?? 'The Team Skill store could not be opened.',
        store: teamSkills.store,
        manager: teamSkills.manager,
        teams: () => config.teams.get(),
        resync: () => { for (const [live, role] of agentRoles)
            void syncRoleSkills(live, role); },
    };
    // Volatile settings updates also carry routes, colors, selections and
    // unrelated plugin values. Only a changed Team/role roster can invalidate a
    // binding table; explicit assignment writes use the resync callback above.
    // Runtime providers retain their pinned asset versions until released.
    const roleRosterFingerprint = () => JSON.stringify(config.teams.get().map(team => [
        team.id,
        team.captain.name,
        team.members.map(member => [member.id ?? '', member.name]),
        team.officialSkills ?? [],
    ]));
    let rosterFingerprint = roleRosterFingerprint();
    const resyncBindings = () => {
        const next = roleRosterFingerprint();
        if (next === rosterFingerprint)
            return;
        rosterFingerprint = next;
        void teamSkills.manager.reconcile().then(() => {
            if (disposed)
                return;
            for (const [agent, role] of agentRoles)
                void syncRoleSkills(agent, role);
        }).catch(error => { ctx.logger.warn(`${LOG}: Team Skill bindings could not be reconciled: %s`, String(error)); });
    };
    /** Session roots whose durable roster settlement waits for the next microtask. */
    const pendingRoster = new Set();
    let rosterScheduled = false;
    let disposed = false;
    // The settings page lists the tools an allow-list may name and streams the
    // execution state it must promise against; both are Remote services, so the
    // browser never guesses a tool name or an execution state.
    const monitor = new TeamExecutionMonitor(ctx, {
        config,
        applied: agent => applications.get(agent),
    });
    ctx.plugin(TeamPresetsToolCatalog, { monitor });
    // The management page reaches the private library through this one service, so
    // every import, edit, assignment and delete runs the same manager rules as the
    // Agent-facing path instead of a second, page-only implementation.
    // The store opens asynchronously, but the page must not wait for it to exist:
    // a Client that declares `remote.teamSkills` in its inject list blocks the
    // whole web boot when the namespace is absent, and one slow disk read must
    // never take the UI down. So the service is provided synchronously and every
    // method awaits `ready`, reporting the reason instead of hanging.
    const ready = teamSkills.open(message => { ctx.logger.warn(`${LOG}: %s`, message); });
    const teamSkillService = {
        store: teamSkills.store,
        manager: teamSkills.manager,
        teams: () => config.teams.get(),
        official: () => teamSkills.official,
        ready,
        startupIssue: () => teamSkills.issue,
        resync: () => { for (const [agent, role] of agentRoles)
            void syncRoleSkills(agent, role); },
    };
    ctx.plugin(TeamSkillService, teamSkillService);
    void ready.then((opened) => {
        if (!opened || disposed)
            return;
        for (const [agent, role] of agentRoles)
            void syncRoleSkills(agent, role);
    });
    ctx.effect(() => () => { monitor.dispose(); }, 'agent-team-presets: execution monitor');
    // The settings page owns this entry's editing surface, so the Plugins page
    // must not also generate a form for it.
    ctx.effect(() => ctx.settings.configure({ auto: false }, ctx.fiber), 'agent-team-presets: page policy');
    /**
     * Resolve the Session root one Agent's lifecycle edge belongs to.
     * @param agent - the Agent whose status changed.
     * @returns the Agent itself for a Session root, its Team root for a teammate, or undefined.
     */
    const rootOf = (agent) => {
        if (isSessionRoot(agent))
            return agent;
        const membership = ctx.agentTeams.tryMembership(agent);
        return membership?.role === 'teammate' ? membership.root : undefined;
    };
    /**
     * Adopt the latest stored definition into one Session, and re-read what the
     * settings page must promise.
     * @param agent - the Session-root Agent to reconcile.
     * @param startingTask - whether this call runs on a root's own wake-up edge.
     */
    const reconcile = (agent, startingTask = false) => {
        adopt(agent, startingTask);
        // Any edge that can adopt, drop, or freeze a definition changes what the
        // settings page must promise, so the stream is re-read once per turn.
        monitor.invalidate();
        // The application this edge just queued, so a creation edge can await the
        // surface (member tool, captain policy) that the first request must see.
        return jobs.get(agent)?.promise;
    };
    /**
     * Await one queued step, stopping when the creation is cancelled.
     *
     * The signal is the Host's creation cancellation, not a timer: a cancelled
     * creation must not keep awaiting a job whose result can no longer be applied.
     * @param pending - the promise to await.
     * @param signal - creation cancellation, when the Host supplies one.
     * @returns whether the promise settled before cancellation.
     */
    const settleOrCancel = async (pending, signal) => {
        if (signal === undefined) {
            await pending;
            return true;
        }
        if (signal.aborted)
            return false;
        const cancelled = new Promise((resolve) => {
            signal.addEventListener('abort', () => { resolve(false); }, { once: true });
        });
        return await Promise.race([pending.then(() => true), cancelled]);
    };
    const jobs = new Map();
    /** Roots whose first application is still queued, so no baseline may be read yet. */
    const pendingApplications = new Set();
    let nextEpoch = 0;
    const cancelApplication = (agent) => {
        const prior = jobs.get(agent);
        if (prior !== undefined)
            jobs.set(agent, { epoch: ++nextEpoch, promise: prior.promise });
        // The abandoned application is no longer pending: a later No-team boundary
        // must be able to establish the baseline the cancelled one withheld.
        pendingApplications.delete(agent);
    };
    /**
     * Options that declare a custom Team's native presentation at the Agent scope.
     *
     * The install is part of the application's rollback region: releasing the
     * application releases the declaration with it.
     * @param agent - the Agent the Team is applied to.
     * @param disclosure - locale key of the effective presentation, when it replaced another one.
     * @returns the application options.
     */
    const presentationOptions = (agent, disclosure) => ({
        presentation: {
            ...disclosure === undefined ? {} : { disclosure },
            install: () => installNativePresentation(agent),
        },
    });
    /**
     * Report one refused application.
     *
     * A rejected update never lifts the last effective capability policy: the
     * previous application stays installed, and only a Session that has none is
     * quarantined until Settings supplies a valid definition.
     */
    const refuseTeam = (agent, team, reason) => {
        ctx.logger.warn(`${LOG}: Team "%s" was refused for Session "%s": %s`, team.id, agent.session.id, reason);
        // A restore that already failed left the more specific diagnosis in place;
        // overwriting it would hide the fact that the previous policy was lost. That
        // only applies while its guard is still installed: without one, preserving
        // the wording would skip the quarantine entirely and leave the Session with
        // no policy at all, so a stale reason must never win over the guard.
        if (!applications.has(agent) && (!restoreFailures.has(agent) || !quarantines.has(agent))) {
            quarantine(agent, `${reason} ${recovery}`);
        }
    };
    /**
     * Re-install the policy a refused update must not lift.
     *
     * A previous application that had declared its own native presentation has to
     * declare it again here, because releasing that application released the
     * declaration with it. One that merely found the surface already native needs
     * no declaration, and asking for one would risk the very false conflict the
     * preparation step exists to avoid.
     * @param agent - the Session-root Agent.
     * @param previous - the definition that was installed before the refusal.
     * @param redeclareNative - whether that application owned a native declaration.
     */
    const restorePrevious = (agent, previous, redeclareNative) => {
        if (previous === undefined) {
            agentRoles.delete(agent);
            teamSkills.releaseAgent(agent);
            return;
        }
        try {
            const options = toolMode(previous.captain) === 'custom' && redeclareNative
                ? presentationOptions(agent)
                : {};
            applications.set(agent, applyTeamToAgent(ctx, agent, previous, providers, () => findTeam(config.teams.get(), previous.id), members, options));
            definitions.set(agent, previous);
            const role = { teamId: previous.id, roleId: CAPTAIN_ROLE, captain: true };
            agentRoles.set(agent, role);
            void syncRoleSkills(agent, role);
        }
        catch (error) {
            // The restore is the last line of defence: the update that got us here was
            // already refused, so a restore that also fails leaves this Agent with no
            // provable policy. Release whatever part of the restore installed and
            // quarantine immediately — `refuseTeam` cannot be relied on, because a
            // superseded application returns before reaching it and because an error
            // thrown after `applications.set` would make it believe a policy exists.
            applications.get(agent)?.dispose();
            applications.delete(agent);
            definitions.delete(agent);
            agentRoles.delete(agent);
            teamSkills.releaseAgent(agent);
            ctx.logger.warn(`${LOG}: the previous Team "%s" could not be restored for Session "%s": %s`, previous.id, agent.session.id, String(error));
            restoreFailures.add(agent);
            quarantine(agent, `The previous Team "${previous.id}" could not be restored for this Session (${String(error)}); `
                + `no tool access is granted until a valid Team applies. ${recovery}`);
        }
    };
    /**
     * Apply one Team after its asynchronous preparation.
     *
     * Nothing of the new application is installed until every check has passed,
     * and the effective wire is read once more after the commit: a strict custom
     * policy is only considered applied when the surface it governs really is the
     * native one, so a declaration that silently lost to another presentation is
     * rolled back instead of being trusted.
     * @param agent - the Session-root Agent.
     * @param team - the definition to apply.
     * @param epoch - identity of this application, so a superseded one stops.
     */
    const commit = async (agent, team, epoch) => {
        const superseded = () => disposed || jobs.get(agent)?.epoch !== epoch;
        // The effective wire is read BEFORE anything of this application exists: an
        // active complete deployment persona must be recognized from its own text,
        // never from a section this plugin already installed.
        const before = await readWire(agent);
        if (superseded())
            return;
        let options = {};
        if (team.captain.systemPrompt.trim() === '' && before !== undefined) {
            const baseline = personaBaseline(before.sections);
            if (baseline.kind === 'foreign') {
                refuseTeam(agent, team, `the deployment composes a complete prompt section this plugin cannot re-declare safely `
                    + `("${baseline.name}"), so this Team could not be made visible to its captain`);
                return;
            }
            // The official `minimal` preset declares its persona complete, which would
            // reduce the whole prompt to that one section. Re-declaring its exact text
            // without `complete` keeps the preset's wording and tool set while letting
            // this Team's briefing participate.
            if (baseline.kind === 'persona')
                options = { personaFallback: baseline.text };
        }
        // The tools catalog is every standing preset's union, not what THIS Session
        // composes, so an unreachable allow-listed capability is refused here rather
        // than silently widened.
        const missing = capabilityRefusal(agent, team);
        if (missing !== undefined) {
            refuseTeam(agent, team, missing);
            return;
        }
        if (toolMode(team.captain) === 'custom') {
            const presentation = await prepareNativePresentation(agent);
            if (superseded())
                return;
            if (presentation.kind === 'conflict' || presentation.kind === 'unknown') {
                refuseTeam(agent, team, presentation.reason);
                return;
            }
            // Only an actual override needs a declaration of its own: a surface that is
            // already native is left exactly as the deployment composed it, so this can
            // never be mistaken for a conflict with a same-scope native declaration.
            if (presentation.kind === 'installable')
                options = { ...options, ...presentationOptions(agent, presentation.disclosure) };
        }
        // The definition is validated before the running application is released,
        // so a preset this Session cannot take never leaves it without one.
        try {
            assertTeamApplicable(agent, team);
        }
        catch (error) {
            refuseTeam(agent, team, `application failed validation: ${String(error)}`);
            return;
        }
        if (superseded())
            return;
        // Preparation may have yielded while a task started on the current Team.
        // Keep that task's application frozen; its idle edge retries the selection.
        if (applications.has(agent) && (agent.status === 'running' || teammatesBusy(ctx, agent)))
            return;
        const previous = definitions.get(agent);
        const previousApplication = applications.get(agent);
        previousApplication?.dispose();
        applications.delete(agent);
        let candidate;
        const rollback = () => {
            if (candidate !== undefined && applications.get(agent) !== candidate)
                return;
            candidate?.dispose();
            applications.delete(agent);
            definitions.delete(agent);
            if (!disposed)
                restorePrevious(agent, previous, previousApplication?.presentationNote !== undefined);
        };
        try {
            // The route is read from the stored Team at spawn time, not captured here:
            // a member's model route is recovery-relevant and outside the definition a
            // running Team task freezes.
            const application = applyTeamToAgent(ctx, agent, team, providers, () => findTeam(config.teams.get(), team.id), members, options);
            candidate = application;
            applications.set(agent, application);
            definitions.set(agent, team);
            if (toolMode(team.captain) === 'custom') {
                const after = await readWire(agent);
                if (superseded()) {
                    rollback();
                    return;
                }
                if (after === undefined || after.tools.includes(RUN_CODE_NAME)) {
                    rollback();
                    refuseTeam(agent, team, after === undefined
                        ? 'the effective tool surface could not be read after the native presentation was installed'
                        : 'the effective tool surface still exposes the general purpose PTC transport after the native presentation '
                            + 'was installed, so a strict custom policy cannot govern it');
                    return;
                }
            }
            if (superseded()) {
                rollback();
                return;
            }
            const captainRole = { teamId: team.id, roleId: CAPTAIN_ROLE, captain: true };
            if (agentRoles.get(agent)?.teamId !== team.id)
                teamSkills.releaseAgent(agent);
            agentRoles.set(agent, captainRole);
            // Installed in THIS turn, not awaited as a job: the store was opened once
            // at activation, `syncAgent` therefore registers synchronously before it
            // returns a promise, and the captain's next request already carries the
            // catalog. The promise is only for the warning, so awaiting it would add a
            // tick to every Team application for no readiness gain. The Team itself is
            // never refused over a captain assignment: a Session that was already
            // applied must not be left without its policy.
            void syncRoleSkills(agent, captainRole);
            quarantines.get(agent)?.dispose();
            quarantines.delete(agent);
            provenUnteamed.delete(agent);
            restoreFailures.delete(agent);
            monitor.invalidate();
        }
        catch (error) {
            rollback();
            if (superseded())
                return;
            refuseTeam(agent, team, `application failed: ${String(error)}`);
        }
    };
    /**
     * Queue one application for a Session root, serialized per root.
     *
     * A newer request supersedes an older one through its epoch, and a Session
     * that has no current application stays denied while its first one is being
     * prepared instead of running on the deployment default.
     * @param agent - the Session-root Agent.
     * @param team - the definition to apply.
     */
    const schedule = (agent, team) => {
        const epoch = ++nextEpoch;
        if (!applications.has(agent)) {
            quarantine(agent, `Team "${team.id}" is being validated for this Session; tool access is paused until it is applied. ${recovery}`);
        }
        // A queued application is not a proven No-team boundary, and a pending first
        // application must never be mistaken for the baseline that exempts a later
        // selection from quarantine.
        provenUnteamed.delete(agent);
        pendingApplications.add(agent);
        const prior = jobs.get(agent)?.promise ?? Promise.resolve();
        const promise = prior
            .then(async () => {
            if (disposed || jobs.get(agent)?.epoch !== epoch)
                return;
            await commit(agent, team, epoch);
        })
            .catch((error) => {
            ctx.logger.warn(`${LOG}: applying Team "%s" to Session "%s" failed unexpectedly: %s`, team.id, agent.session.id, String(error));
        });
        jobs.set(agent, { epoch, promise });
        void promise.then(() => {
            if (jobs.get(agent)?.epoch === epoch)
                pendingApplications.delete(agent);
            monitor.invalidate();
        });
    };
    /**
     * Adopt the latest stored definition into one Session between its Team tasks.
     *
     * A Team task owns the definition it started with, so the captain's persona
     * section, briefing section, member roster, tool scope, and allow-list stay
     * one frozen snapshot while the captain runs or any teammate is running or
     * provisioning. A member's model route and each slot's accent color are not
     * part of that snapshot: both are read from the stored Team when they are
     * needed, so correcting a route reaches the next member the task summons.
     * The frozen snapshot is the preset object this application captured: a
     * settings write replaces the volatile value instead of mutating it, so the
     * captured Team cannot drift.
     *
     * A root that just woke up is about to assemble its next request, which is
     * the last moment a new definition can still reach it; it therefore counts as
     * between tasks unless a teammate is still running the previous one. Every
     * other edge only re-checks whether the Session became idle enough to adopt.
     * @param agent - the Session-root Agent to adopt into.
     * @param startingTask - whether this call runs on a root's own wake-up edge.
     */
    const adopt = (agent, startingTask) => {
        if (disposed)
            return;
        const selectedId = config.selections.get().find(row => row.sessionId === agent.session.id)?.teamId;
        // The preset tools are the discovery path, not a Team capability: a user can
        // ask the captain to adjust "the Team preset" before this Session selects
        // one, and the captain must be able to read the configured Teams and ask
        // which one. They therefore belong to every Session root, exactly as before
        // any Team is selected.
        if (!presetTools.has(agent)) {
            presetTools.set(agent, registerPresetTools(ctx, agent, config, NAMESPACE, root => applications.get(root)?.teamId));
        }
        // The library is managed by the user through the captain, on the Session root
        // only: a teammate able to grant itself a skill would defeat the per-Agent
        // isolation the subsystem exists for.
        if (!skillTools.has(agent)) {
            skillTools.set(agent, registerTeamSkillTools(ctx, agent, skillToolDeps));
        }
        // The Team Skill library is managed by the user through the captain, on the
        // Session root only: a teammate able to grant itself a skill would defeat the
        // per-Agent isolation the whole subsystem exists for.
        const busy = startingTask ? teammatesBusy(ctx, agent) : agent.status === 'running' || teammatesBusy(ctx, agent);
        if (busy) {
            // A remount cannot reconstruct the previous frozen root definition from
            // current Settings, so a running task is never handed a newly selected or
            // newly widened policy: the change waits for the task boundary below.
            //
            // What to do about the capability policy is a separate question, and it
            // turns on whether this Session provably ran without a Team.
            //
            // - It has an application: the running task keeps it, untouched.
            // - No application, but a selection: this activation cannot know which
            //   policy the task runs under, so refuse until the boundary.
            // - No application and no selection, but the log proves a Team was applied
            //   (`hasTeamApplicationMarker`): the user deselected mid-task and the
            //   plugin was reloaded. Refusing is the only safe answer — falling back to
            //   the deployment default would hand the task every capability the frozen
            //   Team excluded.
            // - No application, no selection, no marker, but this activation watched a
            //   proven No-team boundary: the Session really was running without a Team
            //   and the user just picked one. Nothing is widened by waiting, so the
            //   selection simply applies at the boundary.
            // - Everything else is unknown. It is deliberately NOT quarantined: that
            //   shape is "plugin reloaded mid-task in a Session that never had a Team",
            //   which is exactly the freeze users report. Treating it as suspicious
            //   would trade a privilege gap for a broad denial of service. The gap is
            //   NOT narrow — see RESIDUAL WINDOW below, which is deterministic.
            //
            // RESIDUAL WINDOW (known, not fixed here). The marker is only positive
            // evidence, so any running Team task whose captain has not yet assembled a
            // request under that Team leaves a negative one and is classified as
            // unknown. That is the ORDINARY state of a Team task that is currently
            // waiting on a teammate, not a narrow race: measured cases are "apply A
            // while idle -> a teammate runs -> deselect -> reload" and the same shape
            // with a captain woken but not yet assembled. Both fall back to the
            // deployment-default surface, which reopens the capability the Team denied
            // (under PTC that is `run_code`, i.e. arbitrary code). Closing it needs a
            // durable marker written before the application is installed, which is a
            // separate change; it must not be closed by widening the quarantine, which
            // would restore the denial-of-service this branch exists to prevent.
            if (!applications.has(agent)) {
                const marked = hasTeamApplicationMarker(agent);
                const proven = provenUnteamed.has(agent) && !pendingApplications.has(agent);
                if (selectedId !== undefined && proven)
                    return;
                if (selectedId !== undefined) {
                    quarantine(agent, `Team "${selectedId}" cannot be safely restored into an already-running task; tools are paused until its task boundary. ${recovery}`);
                }
                else if (marked) {
                    quarantine(agent, 'This Session ran this task under a Team whose definition cannot be restored here, and the Team '
                        + `selection has since been cleared; tools are paused until its task boundary. ${recovery}`);
                }
            }
            return;
        }
        const team = selectedTeam(config.teams.get(), config.selections.get(), agent.session.id);
        const current = applications.get(agent);
        if (team === undefined) {
            cancelApplication(agent);
            teamSkills.releaseAgent(agent);
            agentRoles.delete(agent);
            current?.dispose();
            applications.delete(agent);
            definitions.delete(agent);
            quarantines.get(agent)?.dispose();
            quarantines.delete(agent);
            // The guard and the half-installed state are gone, so the restore-failure
            // diagnosis is spent: keeping it would exempt this Agent from a later
            // quarantine and leave it with no policy at all.
            restoreFailures.delete(agent);
            if (selectedId !== undefined) {
                quarantine(agent, `Selected Team "${selectedId}" no longer exists. This is not "No team"; tool access stays denied. ${recovery}`);
                return;
            }
            // A boundary this activation observed, with no selection, no application,
            // no quarantine, and no queued first application: the Session is running
            // without a Team, which is the only fact that makes a mid-task selection a
            // safe deferral rather than an unprovable one.
            if (!applications.has(agent) && !quarantines.has(agent) && !pendingApplications.has(agent)) {
                provenUnteamed.add(agent);
            }
            return;
        }
        // Selecting, editing, or re-applying a Team ends the No-team proof: from here
        // the Session's policy comes from the stored definition, not from a boundary.
        provenUnteamed.delete(agent);
        const fingerprint = definitionFingerprint(team);
        if (current !== undefined && current.teamId === team.id && current.fingerprint === fingerprint) {
            cancelApplication(agent);
            return;
        }
        // The synchronous probes own which names an allow-list may carry; the
        // asynchronous preparation that follows owns the effective surface. A
        // refusal here leaves the running application untouched. The capability
        // check runs first so the operator reads the actionable reason (which names
        // the Session's own reach) instead of the registry's generic one.
        const unreachable = capabilityRefusal(agent, team);
        if (unreachable !== undefined) {
            cancelApplication(agent);
            refuseTeam(agent, team, unreachable);
            return;
        }
        try {
            assertTeamApplicable(agent, team);
        }
        catch (error) {
            cancelApplication(agent);
            if (current === undefined)
                quarantine(agent, `Team "${team.id}" application failed validation; no tools were granted. ${recovery}`);
            ctx.logger.warn(`${LOG}: Team "%s" was refused for Session "%s": %s`, team.id, agent.session.id, String(error));
            return;
        }
        schedule(agent, team);
    };
    /**
     * Stop the members this plugin owns, grouped by their exact Team root.
     *
     * Only the children this activation recorded are drained: draining a whole
     * descendant tree would also stop upstream-owned work the plugin never
     * installed, and the Team service offers the selective call for exactly this
     * case.
     * @returns resolution once every recorded child has been asked to stop.
     */
    const drainManagedChildren = async () => {
        const subagents = ctx.get('subagents');
        if (subagents === undefined) {
            // The whole Host is going down and its subagent service is already gone,
            // so the members it owns are being disposed with it. Reported rather than
            // passed over silently, because this activation did not stop them.
            if (managedMembers.size > 0) {
                ctx.logger.warn(`${LOG}: %d managed Team member(s) were not drained because the subagent service was already released.`, managedMembers.size);
            }
            return;
        }
        const byRoot = new Map();
        for (const agent of [...managedMembers]) {
            const membership = ctx.agentTeams.tryMembership(agent);
            if (membership?.role !== 'teammate')
                continue;
            byRoot.set(membership.root, [...byRoot.get(membership.root) ?? [], agent.id]);
        }
        for (const [root, ids] of byRoot) {
            try {
                await subagents.drainChildren(root, ids);
            }
            catch (error) {
                ctx.logger.warn(`${LOG}: managed members of Session "%s" could not be drained: %s`, root.session.id, String(error));
            }
        }
    };
    // The teardown owner is installed before any existing Agent is initialized.
    // Registrations go through `agent.ctx`, whose lifetime outlives a failing
    // plugin fiber, so a throw during the scan would otherwise leave guards and
    // exact-Agent tools installed with no disposer to drain them.
    //
    // The order is deliberate and idempotent: creation admission closes first, so
    // no late tool call can start a member nothing would own; admitted creations
    // and queued applications settle next; only then are the members this
    // activation installed stopped through the official drain; the durable unit
    // closes last. Member-scoped guards are never removed before their member is
    // stopped — they belong to `agent.ctx` and unwind with the residency.
    let shutdown;
    const teardown = () => {
        shutdown ??= (async () => {
            disposed = true;
            const queued = [...jobs.values()].map(job => job.promise);
            await members.closeAdmission();
            await Promise.allSettled(queued);
            await drainManagedChildren();
            monitor.dispose();
            for (const application of applications.values())
                application.dispose();
            applications.clear();
            definitions.clear();
            for (const state of quarantines.values())
                state.dispose();
            quarantines.clear();
            for (const dispose of childPolicies.values())
                dispose();
            childPolicies.clear();
            childEnvelopes.clear();
            managedMembers.clear();
            agentRoles.clear();
            for (const dispose of presetTools.values())
                dispose();
            presetTools.clear();
            for (const dispose of skillTools.values())
                dispose();
            skillTools.clear();
            pendingRoster.clear();
            pendingApplications.clear();
            provenUnteamed.clear();
            restoreFailures.clear();
            jobs.clear();
            await members.close();
            await teamSkills.close();
        })();
        return shutdown;
    };
    ctx.effect(() => () => teardown(), 'agent-team-presets: ordered shutdown');
    // The stored document is reconciled once at startup: a document written while
    // captains still owned a route is cleaned, a member identity it never carried
    // is added, and the shipped default presets are installed for the first time.
    // HMR can mount after Host ready. The next task crosses Cordis activation,
    // whose LOADING entry is intentionally absent from settings.describe().
    const settingsReconcile = teamSettingsReconcile(ctx, config, NAMESPACE);
    const reconcileTimer = setTimeout(() => { if (!disposed)
        void settingsReconcile.request(); }, 0);
    ctx.effect(() => () => { clearTimeout(reconcileTimer); settingsReconcile.dispose(); }, 'agent-team-presets: settings reconcile readiness');
    for (const agent of ctx.agents.list()) {
        if (isSessionRoot(agent))
            reconcile(agent);
        else
            initializeChild(agent, true);
    }
    // The durable unit opens asynchronously, so one synchronous scan cannot see a
    // member's snapshot yet. A member already live at activation — an HMR
    // remount, a resumed Session — is therefore claimed as soon as the store
    // answers. It has already started, so an unusable snapshot quarantines it;
    // the creation veto stays reserved for the serial creation edge.
    void members.whenReady().then(() => {
        if (disposed)
            return;
        for (const agent of ctx.agents.list()) {
            if (!isSessionRoot(agent))
                initializeChild(agent, true);
        }
    });
    ctx.on('agent/created', async ({ agent, signal }) => {
        if (isSessionRoot(agent)) {
            // The Host assembles the prompt for a root's first request BEFORE
            // `agent/pre-step`, so the only place a Team can still reach that request
            // is this creation edge. It awaits the application job this reconcile just
            // queued — the member tool and the captain's tool policy are installed by
            // it — and then the captain's Team Skill registration, which publishes the
            // catalog the same request reads.
            const applied = reconcile(agent);
            if (applied !== undefined && !await settleOrCancel(applied, signal))
                return;
            const role = agentRoles.get(agent);
            if (role !== undefined && signal?.aborted !== true)
                await syncRoleSkills(agent, role, signal);
            return;
        }
        const installation = initializeChild(agent, false);
        // A member must not take its first request on an empty catalog: the host
        // publishes the catalog from a step boundary, so the registration this
        // creation edge started has to exist before the transaction completes. The
        // promise awaited here belongs to THIS Agent only.
        if (installation !== undefined) {
            const synced = await installation;
            // An assignment that exists in the library but could not be published is a
            // refusal, not a degraded success: the member would run its whole first
            // turn with no Team Skill while every surface still reported it bound.
            const refusal = skillAssignmentRefusal(synced);
            if (refusal !== undefined) {
                // A cancelled creation is the Host's decision, not a configuration to
                // report — but this activation's own registrations are released either
                // way, so nothing here believes in a member the Host never created.
                if (signal?.aborted === true) {
                    abandonCreation(agent);
                    return;
                }
                refuseMember(agent, refusal);
                return;
            }
        }
        // A member the runtime just claimed is known by its exact Team identity, so
        // the durable binding is written inside this awaited creation transaction.
        if (managedMembers.has(agent)) {
            const membership = ctx.agentTeams.tryMembership(agent);
            if (membership?.role === 'teammate')
                await members.bind(agent, { root: membership.root, name: membership.name });
        }
    });
    ctx.on('agent/disposed', ({ agent }) => {
        // Releasing the scope removes exactly this Agent's discovery; content the
        // model already read stays in its transcript, which cannot be recalled.
        teamSkills.releaseAgent(agent);
        agentRoles.delete(agent);
        applications.get(agent)?.dispose();
        applications.delete(agent);
        definitions.delete(agent);
        quarantines.get(agent)?.dispose();
        quarantines.delete(agent);
        childPolicies.get(agent)?.();
        childPolicies.delete(agent);
        childEnvelopes.delete(agent);
        managedMembers.delete(agent);
        members.release(agent);
        presetTools.get(agent)?.();
        presetTools.delete(agent);
        skillTools.get(agent)?.();
        skillTools.delete(agent);
        pendingRoster.delete(agent);
        pendingApplications.delete(agent);
        provenUnteamed.delete(agent);
        restoreFailures.delete(agent);
        jobs.delete(agent);
        monitor.invalidate();
    });
    ctx.on('loader/volatile-update', () => {
        for (const agent of ctx.agents.list()) {
            if (isSessionRoot(agent))
                reconcile(agent);
        }
        if (!disposed)
            void settingsReconcile.request();
        resyncBindings();
        // A stored change moves the frame even when no Session is online to adopt it.
        monitor.invalidate();
    });
    // The captain running, a teammate running or provisioning, and either of them
    // going idle are the edges that decide whether a Session is inside a Team
    // task. A teammate's edge reaches the root through the roster, so a member
    // finishing can be what releases its Session's frozen definition.
    ctx.on('agent/status', ({ agent, status }) => {
        const root = rootOf(agent);
        if (root === undefined)
            return;
        reconcile(root, isSessionRoot(agent) && status === 'running');
    });
    // A teammate that never got a live child settles in the durable journal
    // instead of through `agent/status`. The phase is read on the next microtask,
    // so the projection has folded the append this listener just saw, and several
    // settlements in one append batch cost one read.
    ctx.on('session/event', (session, event) => {
        if (event.type !== 'team/member')
            return;
        const agent = ctx.agents.get(session.id);
        if (agent === undefined || !isSessionRoot(agent))
            return;
        pendingRoster.add(agent);
        if (rosterScheduled)
            return;
        rosterScheduled = true;
        queueMicrotask(() => {
            rosterScheduled = false;
            const roots = [...pendingRoster];
            pendingRoster.clear();
            for (const root of roots)
                reconcile(root);
        });
    });
}
