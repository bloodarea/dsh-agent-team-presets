/**
 * Third Team preset page: one captain or member, split into identity, model,
 * tools, and system prompt cards so a narrow Settings panel never crowds.
 */
import type { ProviderChoice } from './team-presets-controller.ts';
import type { TeamAgentPreset, TeamCaptainPreset, ToolChoice } from '../types.ts';
import type { TeamPresetsLocaleKey } from './locales.ts';
/** Props of one agent's page. */
export interface TeamAgentViewProps {
    /** The agent slot being edited. */
    readonly agent: TeamAgentPreset | TeamCaptainPreset;
    /** Whether this slot is the Team captain or one member. */
    readonly role: 'captain' | 'member';
    /** Display name of the Team that owns this agent. */
    readonly teamName: string;
    /** Provider catalogue the model pickers render. */
    readonly providers: readonly ProviderChoice[];
    /** Global tools this deployment exposes to an allow-list. */
    readonly tools: readonly ToolChoice[];
    /** Whether the tool catalogue is still loading or failed. */
    readonly toolCatalogue: 'idle' | 'loading' | 'ready' | 'error';
    /** Whether some provider failed its catalogue lookup, so its models are absent. */
    readonly cataloguePartial: boolean;
    /** Page copy reader. */
    readonly t: (key: TeamPresetsLocaleKey) => string;
    /** Whether the Host document accepts writes. */
    readonly disabled: boolean;
    readonly onBack: () => void;
    readonly onChange: (patch: Partial<TeamAgentPreset>) => void;
    /** Removes this member; absent for the captain, which a Team always needs. */
    readonly onDelete?: () => void;
}
/**
 * Render one agent's page.
 * @param props - the agent, its role, the catalogue, copy, and write callbacks.
 * @returns the back row and the four setting cards.
 */
export declare function TeamAgentView(props: TeamAgentViewProps): import("react").JSX.Element;
//# sourceMappingURL=TeamAgentView.d.ts.map