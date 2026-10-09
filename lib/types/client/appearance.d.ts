/**
 * Accent colors this plugin publishes to the Agent Teams roster.
 *
 * A Team's configured colors live in the settings document rather than in the
 * Session log, so the browser half resolves them from the same stored Teams and
 * selections the Settings page and the composer control edit.
 * @module dsh-agent-team-presets/appearance
 */
import type { TeamAppearance } from '@deepseek-ai/dsh-experimental-client-ui-agent-team/client';
import type { TeamPreset } from '../types.ts';
import type { TeamSelectionRecordView } from './team-presets-controller.ts';
/**
 * Resolve the accent colors of the Team one Session selected.
 * @param teams - every stored Team preset.
 * @param selections - every Session's stored Team selection.
 * @param sessionId - the Lead Session identity.
 * @returns the colors the roster draws with, or undefined when the Session selected no Team.
 */
export declare function teamAppearance(teams: readonly TeamPreset[], selections: readonly TeamSelectionRecordView[], sessionId: string): TeamAppearance | undefined;
//# sourceMappingURL=appearance.d.ts.map