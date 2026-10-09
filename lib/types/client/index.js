/**
 * Browser half of the Agent Team presets plugin: the Settings page that
 * configures Teams and the composer control that selects one per Session.
 */
import teamPresetsRemote from 'dsh-agent-team-presets/remote';
import { ComposerTeamSelect } from "./ComposerTeamSelect.js";
import { teamAppearance } from "./appearance.js";
import { TeamPresetsSection } from "./TeamPresetsSection.js";
import { TeamPresetsController, TEAM_PRESETS_NS } from "./team-presets-controller.js";
import { en, NS, zh } from "./locales.js";
export { TEAM_PRESETS_NS };
/** Required services (cordis fiber inject). */
export const inject = ['slots', 'locale', 'configForms', 'remote', 'remote.session'];
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
    const disposeRemote = await ctx.remote.$mount(teamPresetsRemote);
    const ui = ctx.inject(['remote.teamPresets', 'slots', 'locale', 'configForms', 'remote.session'], registerUi);
    try {
        await ui;
    }
    catch (error) {
        await ui.dispose();
        await disposeRemote();
        throw error;
    }
    return async () => { await ui.dispose(); await disposeRemote(); };
}
/**
 * Register the Settings page and the composer control over one shared Team
 * state, so an edit on the page and a selection in the composer cannot
 * disagree about the settings document.
 * @param ctx - the browser plugin context, with the Team Remote mounted.
 */
function registerUi(ctx) {
    const t = ctx.locale.bind(NS);
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'agent-team-presets: dictionaries');
    const controller = new TeamPresetsController(ctx);
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
        inject: () => controller.inject(),
    }, TeamPresetsSection)), 'agent-team-presets: settings page');
    // The Agent Teams roster draws each captain and member card with the color
    // this Team configures; the roster owns the registry, this plugin answers it.
    ctx.inject(['agentTeamAppearance'], (scope) => {
        scope.effect(() => scope.agentTeamAppearance.register((sessionId) => {
            const state = controller.store.getSnapshot();
            return teamAppearance(state.teams, state.selections, sessionId);
        }), 'agent-team-presets: roster appearance');
    });
    ctx.effect(() => ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
        name: 'conversation.input.left',
        id: 'agent-team-presets',
        order: 10,
        locale: NS,
        inject: () => controller.inject(),
    }, ComposerTeamSelect)), 'agent-team-presets: composer control');
}
