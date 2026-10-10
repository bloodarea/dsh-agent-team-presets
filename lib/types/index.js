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
import { applyTeamToAgent, assertTeamApplicable } from "./application.js";
import { LEGACY_CAPTAIN_ROUTE_KEYS, withoutCaptainRoutes } from "./config.js";
import { isSessionRoot, TeamExecutionMonitor, teammatesBusy } from "./execution.js";
import { registerPresetTools } from "./preset-tools.js";
import { definitionFingerprint, findTeam, selectedTeam } from "./presets.js";
import TeamPresetsToolCatalog from "./tool-catalog.js";
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
export const inject = ['agents', 'agentTeams', 'tools', 'systemPrompt', 'sessionProjections', 'settings'];
/** Diagnostics prefix for the failures this plugin only reports. */
const LOG = 'agent-team-presets';
/**
 * Drop the captain route a Team stored before captains stopped owning one.
 *
 * An older document keeps `provider`, `model`, and `reasoningEffort` on every
 * captain, because the settings schema preserves members it does not declare.
 * The rewrite is an ordinary settings write, so the running configuration, the
 * profile patch, and every open Settings page agree on what a captain owns.
 * @param ctx - the plugin context providing `settings`.
 * @param config - the live configuration to inspect.
 * @returns once the document was rewritten, or immediately when it was already clean.
 */
async function dropStoredCaptainRoutes(ctx, config) {
    const teams = config.teams.get();
    const cleaned = withoutCaptainRoutes(teams);
    if (cleaned.every((team, index) => team === teams[index]))
        return;
    try {
        await ctx.settings.update(NAMESPACE, { teams: cleaned });
    }
    catch (error) {
        ctx.logger.warn(`${LOG}: stored captains still carry %s because the rewrite was refused: %s`, LEGACY_CAPTAIN_ROUTE_KEYS.join('/'), String(error));
    }
}
/**
 * Apply one valid Team preset to one live Session, and keep it current between
 * that Session's Team tasks.
 * @param ctx - the plugin context providing the Session, Team, tool, prompt, and settings services.
 * @param config - the live configuration whose volatile values carry the stored Teams.
 */
export function apply(ctx, config) {
    const providers = { fresh: config.freshProvider, fork: config.forkProvider };
    const applications = new Map();
    // The preset tools belong to the Session rather than to one selected Team, so
    // a captain can read and adjust a stored preset before any Team is selected.
    const presetTools = new Map();
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
        if (!presetTools.has(agent)) {
            presetTools.set(agent, registerPresetTools(ctx, agent, config, NAMESPACE, root => applications.get(root)?.teamId));
        }
        const busy = startingTask ? teammatesBusy(ctx, agent) : agent.status === 'running' || teammatesBusy(ctx, agent);
        if (busy)
            return;
        const team = selectedTeam(config.teams.get(), config.selections.get(), agent.session.id);
        const current = applications.get(agent);
        if (team === undefined) {
            current?.dispose();
            applications.delete(agent);
            return;
        }
        const fingerprint = definitionFingerprint(team);
        if (current !== undefined && current.teamId === team.id && current.fingerprint === fingerprint)
            return;
        // The definition is validated before the running application is released,
        // so a preset this Session cannot take never leaves it without one.
        try {
            assertTeamApplicable(agent, team);
        }
        catch (error) {
            // The Session must not keep running the definition the Host replaced, so
            // a refused preset leaves it explicitly without one, and says why.
            current?.dispose();
            applications.delete(agent);
            ctx.logger.warn(`${LOG}: Team "%s" was refused for Session "%s": %s`, team.id, agent.session.id, String(error));
            return;
        }
        current?.dispose();
        applications.delete(agent);
        try {
            // The route is read from the stored Team at spawn time, not captured here:
            // a member's model route is recovery-relevant and outside the definition a
            // running Team task freezes.
            applications.set(agent, applyTeamToAgent(ctx, agent, team, providers, () => findTeam(config.teams.get(), team.id)));
        }
        catch (error) {
            ctx.logger.warn(`${LOG}: applying Team "%s" to Session "%s" failed: %s`, team.id, agent.session.id, String(error));
        }
    };
    // A document stored while captains still owned a route is cleaned once, so a
    // Session is never composed from a Team shape this plugin no longer applies.
    void dropStoredCaptainRoutes(ctx, config);
    for (const agent of ctx.agents.list()) {
        if (isSessionRoot(agent))
            reconcile(agent);
    }
    ctx.on('agent/created', ({ agent }) => {
        if (isSessionRoot(agent))
            reconcile(agent);
    });
    ctx.on('agent/disposed', ({ agent }) => {
        applications.get(agent)?.dispose();
        applications.delete(agent);
        presetTools.get(agent)?.();
        presetTools.delete(agent);
        pendingRoster.delete(agent);
        monitor.invalidate();
    });
    ctx.on('loader/volatile-update', () => {
        for (const agent of ctx.agents.list()) {
            if (isSessionRoot(agent))
                reconcile(agent);
        }
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
    ctx.effect(() => () => {
        disposed = true;
        monitor.dispose();
        for (const application of applications.values())
            application.dispose();
        applications.clear();
        for (const dispose of presetTools.values())
            dispose();
        presetTools.clear();
        pendingRoster.clear();
    }, 'agent-team-presets: session applications');
}
