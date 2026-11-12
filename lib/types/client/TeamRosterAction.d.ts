/**
 * The conversation-header Team roster.
 *
 * Ported from the rc.1 official `agent-team` header action: same slot, same
 * order, same icon/label/hover-popover behaviour and stylesheet. rc.2 folded
 * Teams into the subagent tree and kept only the task board, so the roster rows
 * are reconstructed from this plugin's member snapshots instead of the removed
 * Team projection.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { TeamRosterInjected } from './team-presets-controller.ts';
/** Full props of the Team conversation-header action. */
export type TeamRosterActionProps = PropsRuntime<'conversation.session.header.actions'> & InjectFace<TeamRosterInjected> & PropsLocale<'settings.agentTeamPresets'>;
/** Render the summoned-member roster as the header's Team action. */
export declare function TeamRosterAction({ sessionId, openTeammate, roster, useProjection, t, }: TeamRosterActionProps): import("react").JSX.Element | null;
