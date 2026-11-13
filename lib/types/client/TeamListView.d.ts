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
    /** Puts every preset this plugin ships back at its shipped content. */
    readonly onRestoreDefaults: () => void;
    /** Receives the document the user chose to import. */
    readonly onImport: (file: File) => void;
    /** Writes the chosen Team out as a shareable document. */
    readonly onExport: (teamId: string) => void;
    /** The reader's own categories, in display order. */
    readonly categories?: readonly {
        readonly id: string;
        readonly name: string;
        readonly order: number;
    }[];
    /** Which Team owns which category. */
    readonly teamCategories?: readonly {
        readonly teamId: string;
        readonly categoryId: string;
    }[];
    /** Opens the page that manages the Team preset categories. */
    readonly onManageCategories?: () => void;
    /**
     * How many shipped presets this deployment was offered but no longer holds,
     * when none of them are in the list. Zero or undefined renders no hint.
     */
    readonly missingBuiltins?: number | undefined;
}
/**
 * Render the Team list.
 * @param props - the Teams, copy, and navigation callbacks.
 * @returns the header, the create and import actions, and one row per Team.
 */
export declare function TeamListView(props: TeamListViewProps): import("react").JSX.Element;
