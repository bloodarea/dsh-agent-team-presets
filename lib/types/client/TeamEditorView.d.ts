/**
 * Second Team preset page: one Team's own name, description, captain, and
 * member roster. Choosing the captain or a member opens that agent's page.
 */
import type { ProviderChoice } from './team-presets-controller.ts';
import type { TeamPreset } from '../types.ts';
import type { TeamPresetsLocaleKey } from './locales.ts';
/** The agent page one row opens. */
export type AgentSlot = 'captain' | number;
/** Props of one Team's page. */
export interface TeamEditorViewProps {
    /** The Team being edited. */
    readonly team: TeamPreset;
    /** Provider catalogue used for the model captions. */
    readonly providers: readonly ProviderChoice[];
    /** Page copy reader. */
    readonly t: (key: TeamPresetsLocaleKey) => string;
    /** Whether the Host document accepts writes. */
    readonly disabled: boolean;
    readonly onBack: () => void;
    readonly onPatch: (patch: Partial<TeamPreset>) => void;
    readonly onOpenAgent: (slot: AgentSlot) => void;
    readonly onAddMember: () => void;
    readonly onRemoveMember: (index: number) => void;
}
/**
 * Render one Team's page.
 * @param props - the Team, catalogue, copy, and navigation callbacks.
 * @returns the back row, the Team identity fields, and the roster.
 */
export declare function TeamEditorView(props: TeamEditorViewProps): import("react").JSX.Element;
//# sourceMappingURL=TeamEditorView.d.ts.map