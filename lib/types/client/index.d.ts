/**
 * Browser half of the Agent Team presets plugin: the Settings page that
 * configures Teams and the composer control that selects one per Session.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { TEAM_PRESETS_NS } from './team-presets-controller.ts';
import type { TeamPresetsLocaleKey } from './locales.ts';
export type { TeamPresetsSectionProps } from './TeamPresetsSection.tsx';
export type { ComposerTeamSelectProps } from './ComposerTeamSelect.tsx';
export type { TeamPresetsInjected, TeamPresetsState } from './team-presets-controller.ts';
export type { TeamPresetsLocaleKey } from './locales.ts';
export { TEAM_PRESETS_NS };
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Agent Team presets page and composer copy. */
        'settings.agentTeamPresets': TeamPresetsLocaleKey;
    }
}
/** Required services (cordis fiber inject). */
export declare const inject: string[];
/**
 * Register the Settings page and the composer control once this plugin's tool
 * catalog Remote is mounted, so both read the deployment's real tool list.
 * @param ctx - the browser plugin context.
 * @returns disposer withdrawing the UI and the Remote contribution.
 */
export declare function apply(ctx: ClientContext): Promise<() => Promise<void>>;
//# sourceMappingURL=index.d.ts.map