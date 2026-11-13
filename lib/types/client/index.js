/**
 * Browser half of the Agent Team presets plugin: the Settings page that
 * configures Teams and the composer control that selects one per Session.
 */
import teamPresetsRemote from 'dsh-agent-team-presets/remote';
import { ComposerTeamSelect } from "./ComposerTeamSelect.js";
import { TeamRosterAction } from "./TeamRosterAction.js";
import { registerAgentCardBadgeAdapters } from "./agent-card-badges.js";
import { teamAppearance } from "./appearance.js";
import { TeamPresetsSection } from "./TeamPresetsSection.js";
import { TeamPresetsController, TEAM_PRESETS_NS } from "./team-presets-controller.js";
import { TeamSkillsController } from "./team-skills-controller.js";
import { CardPatchesController } from "./card-patches-controller.js";
import { en, NS, zh } from "./locales.js";
export { TEAM_PRESETS_NS };
/**
 * Required services (cordis fiber inject).
 *
 * `remote.settings` is the namespace the composer's selection write goes
 * through, and the shared describe mirror every settings surface reads is
 * reached through `configForms`. Both are named explicitly because the cordis
 * property proxy resolves a namespaced service RELATIVE to the context that
 * reads it: `ctx.remote.settings` only resolves where the reading fiber (or an
 * ancestor in the same isolate) declares `remote.settings` in its own inject
 * set. A context that reads it without that declaration throws
 * `cannot get property "remote.settings" without inject`, which is exactly the
 * failure mode this plugin's own scope must never reproduce.
 */
export const inject = ['slots', 'locale', 'configForms', 'remote', 'remote.session', 'remote.settings', 'sessions', 'uiWorkspace'];
/**
 * Host notifications that change which provider routes exist.
 *
 * The Team model pickers read the same Host catalogue as the composer model
 * picker, so a page left open invalidates on the same events: adapters coming
 * and going, a settings commit, and a credential landing or disappearing.
 */
const CATALOGUE_INVALIDATIONS = [
    'llm/adapters-updated',
    'settings/document-updated',
    'credentials/record-updated',
    'credentials/reference-updated',
];
/**
 * Register the Settings page and the composer control once this plugin's tool
 * catalog Remote is mounted, so both read the deployment's real tool list.
 * @param ctx - the browser plugin context.
 * @returns disposer withdrawing the UI and the Remote contribution.
 */
export async function apply(ctx) {
    try {
        return await applyUi(ctx);
    }
    catch (error) {
        // A browser entry that fails activation is replaced by one summary line, so
        // the cause has to be reported here or it is unrecoverable for the user and
        // for whoever has to fix it.
        console.error('[team-presets] the browser half failed to activate:', error);
        throw error;
    }
}
/**
 * Mount the Remote contribution and register the UI.
 * @param ctx - the browser plugin context.
 * @returns disposer withdrawing the UI and the Remote contribution.
 */
async function applyUi(ctx) {
    const disposeRemote = await ctx.remote.$mount(teamPresetsRemote);
    // The Team Skill panel is built on the plugin's own context, not inside the
    // injected UI scope: a scope created for a fixed dependency set may not spawn a
    // further injection, and failing that way takes the whole browser entry down.
    const skills = new TeamSkillsController(ctx);
    const cardPatches = new CardPatchesController(ctx);
    const disposeCardBadges = registerAgentCardBadgeAdapters(ctx);
    const ui = ctx.inject(['remote.teamPresets', 'slots', 'locale', 'configForms', 'remote.session', 'remote.settings', 'sessions', 'uiWorkspace'], scope => registerUi(scope, skills, cardPatches));
    try {
        await ui;
    }
    catch (error) {
        await ui.dispose();
        await disposeCardBadges();
        await disposeRemote();
        throw error;
    }
    return async () => { await ui.dispose(); await disposeCardBadges(); await disposeRemote(); };
}
/**
 * Register the Settings page and the composer control over one shared Team
 * state, so an edit on the page and a selection in the composer cannot
 * disagree about the settings document.
 * @param ctx - the browser plugin context, with the Team Remote mounted.
 */
/**
 * Open one member's conversation from the roster, the way the rc.1 header action
 * did: resolve the Team Lead Session, then route to that member's child Session.
 * @param ctx - the injected browser scope.
 * @param sessionId - the Session the roster was opened from.
 * @param childSessionId - the member Session to open.
 */
function openTeammateOf(ctx) {
    return (sessionId, childSessionId) => {
        const address = ctx.sessions.binding(sessionId)?.session.getSnapshot().subagent?.address;
        const parentSessionId = address?.parentSessionId ?? sessionId;
        ctx.uiWorkspace.openSession({ parentSessionId, childSessionId, mode: 'continuable' });
    };
}
function registerUi(ctx, skills, cardPatches) {
    const t = ctx.locale.bind(NS);
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'agent-team-presets: dictionaries');
    const controller = new TeamPresetsController(ctx);
    // The management panel drives the Host service; if the deployment ships no
    // store the controller reports that instead of pretending the library is empty.
    ctx.effect(() => () => { skills.dispose(); }, 'agent-team-presets: skills controller');
    ctx.effect(() => () => { cardPatches.dispose(); }, 'agent-team-presets: card patches controller');
    ctx.effect(() => () => { controller.dispose(); }, 'agent-team-presets: form subscription');
    controller.loadCatalogue();
    for (const event of CATALOGUE_INVALIDATIONS) {
        ctx.effect(() => ctx.remote.$on(event, () => { controller.refreshCatalogue(); }), `agent-team-presets: ${event} invalidations`);
    }
    ctx.effect(() => ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: TEAM_PRESETS_NS,
        order: 25,
        label: () => t('nav'),
        locale: NS,
        inject: () => ({ ...controller.inject(), skills, cardPatches }),
    }, TeamPresetsSection)), 'agent-team-presets: settings page');
    // The Agent Teams roster draws each captain and member card with the color
    // this Team configures; the roster owns the registry, this plugin answers it.
    //
    // That registry is a deployment extension, not part of official rc.2, so the
    // service has no Context declaration to read through: the cast below is the
    // whole extension boundary. `inject` still waits for the service, so a
    // deployment that ships the extension gets the colors and one that does not
    // simply never runs this registration and keeps the roster's own colors.
    ctx.inject(['agentTeamAppearance'], (scope) => {
        const registry = scope.agentTeamAppearance;
        scope.effect(() => registry.register((sessionId) => {
            const state = controller.store.getSnapshot();
            return teamAppearance(state.teams, state.selections, sessionId);
        }), 'agent-team-presets: roster appearance');
    });
    // Same place the rc.1 official Team action occupied: the header actions strip,
    // ahead of the other action buttons, with its icon and roster popover. Only the
    // data source differs — rc.2 removed the Team projection it used to read.
    const openTeammate = openTeammateOf(ctx);
    ctx.effect(() => ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
        name: 'conversation.session.header.actions',
        id: 'agent-team',
        order: -20,
        locale: NS,
        inject: () => ({
            roster: (sessionId) => controller.readRoster(sessionId),
            openTeammate: (sessionId, childSessionId) => {
                openTeammate(sessionId, childSessionId);
            },
        }),
    }, TeamRosterAction)), 'agent-team-presets: header roster');
    ctx.effect(() => ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
        name: 'conversation.input.left',
        id: 'agent-team-presets',
        order: 10,
        locale: NS,
        inject: () => ({ ...controller.inject(), skills }),
    }, ComposerTeamSelect)), 'agent-team-presets: composer control');
}
