/**
 * First Team preset page: every configured Team as one row. Choosing a row
 * opens that Team's own page.
 */
import type { TeamPreset } from '../types.ts';
import type { TeamPresetsLocaleKey } from './locales.ts';
/** Props of the Team list page. */
export interface TeamListViewProps {
    /** Every configured Team. */
    readonly teams: readonly TeamPreset[];
    /** Page copy reader. */
    readonly t: (key: TeamPresetsLocaleKey) => string;
    /** Whether the Host document accepts writes. */
    readonly disabled: boolean;
    readonly onOpen: (teamId: string) => void;
    readonly onCreate: () => void;
    readonly onDuplicate: (teamId: string) => void;
    readonly onDelete: (teamId: string) => void;
}
/**
 * Render the Team list.
 * @param props - the Teams, copy, and navigation callbacks.
 * @returns the header, the create action, and one row per Team.
 */
export declare function TeamListView(props: TeamListViewProps): import("react").JSX.Element;
//# sourceMappingURL=TeamListView.d.ts.map