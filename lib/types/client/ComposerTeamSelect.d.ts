/**
 * The composer's Team control: pick the Team preset that leads this Session, or
 * hover a Team to talk to one of its members on its own.
 *
 * It sits in the composer tool row after the permission control.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { TeamPresetsInjected } from './team-presets-controller.ts';
/** Complete props derived from the composer slot and the shared Team state. */
export type ComposerTeamSelectProps = PropsRuntime<'conversation.input.left'> & PropsLocale<'settings.agentTeamPresets'> & InjectFace<TeamPresetsInjected>;
/**
 * Render the composer's Team picker.
 * @param props - the Session identity, the page's locale reader, and the selection writers.
 * @returns the Team trigger, the picker with its member panel, and a notice when the last selection write failed.
 */
export declare function ComposerTeamSelect(props: ComposerTeamSelectProps): import("react").JSX.Element | null;
