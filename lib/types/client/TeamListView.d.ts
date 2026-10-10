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
    /** Copy describing why the last chosen document was refused. */
    readonly importError?: TeamPresetsLocaleKey | undefined;
    readonly onOpen: (teamId: string) => void;
    readonly onCreate: () => void;
    readonly onDuplicate: (teamId: string) => void;
    readonly onDelete: (teamId: string) => void;
    /** Receives the document the user chose to import. */
    readonly onImport: (file: File) => void;
    /** Writes the chosen Team out as a shareable document. */
    readonly onExport: (teamId: string) => void;
}
/**
 * Render the Team list.
 * @param props - the Teams, copy, and navigation callbacks.
 * @returns the header, the create and import actions, and one row per Team.
 */
export declare function TeamListView(props: TeamListViewProps): import("react").JSX.Element;
//# sourceMappingURL=TeamListView.d.ts.map