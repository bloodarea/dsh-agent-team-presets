/** Review one Team import and resolve any naming conflicts before staging. */
import type { TeamPresetImportPlan, TeamPresetImportResolution, TeamPresetImportSkillRow } from './team-presets-controller.ts';
import type { TeamPresetsLocaleKey } from './locales.ts';
/** Props of the import conflict dialog. */
export interface TeamImportDialogProps {
    /** The document being imported and the collisions the inspection found. */
    readonly plan: TeamPresetImportPlan;
    /** Page copy reader. */
    readonly t: (key: TeamPresetsLocaleKey) => string;
    readonly previewSkills: (resolution: TeamPresetImportResolution) => readonly TeamPresetImportSkillRow[];
    readonly onCancel: () => void;
    readonly onConfirm: (resolution: TeamPresetImportResolution) => void;
}
/** Render a pending import, including any declaration that could not resolve. */
export declare function TeamImportDialog(props: TeamImportDialogProps): import("react").JSX.Element;
