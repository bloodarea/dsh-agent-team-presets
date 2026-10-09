/**
 * The Agent Team presets settings page: three stacked pages — the Team list,
 * one Team's roster, and one captain or member — with a shared save footer.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { TeamPresetsInjected } from './team-presets-controller.ts';
/** Complete props of the settings page. */
export type TeamPresetsSectionProps = PropsRuntime<'settings.section'> & PropsLocale<'settings.agentTeamPresets'> & InjectFace<TeamPresetsInjected>;
/**
 * Render the Team preset settings page.
 * @param props - page state, the page's locale reader, and the editing actions.
 * @returns the current page and the shared save footer.
 */
export declare function TeamPresetsSection(props: TeamPresetsSectionProps): import("react").JSX.Element;
//# sourceMappingURL=TeamPresetsSection.d.ts.map