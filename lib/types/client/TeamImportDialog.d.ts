/**
 * Conflict dialog for one Team import.
 *
 * The document's Team name, captain name, and member names are the keys an
 * import matches on, so each one that the target Team already uses is resolved
 * here: overwrite the configured agent, or add the imported one under a name
 * that is still free. Choosing a new Team name makes the whole document a new
 * Team, which is why the agent collisions disappear with that choice.
 */
import type { TeamPresetImportPlan, TeamPresetImportResolution } from './team-presets-controller.ts';
import type { TeamPresetsLocaleKey } from './locales.ts';
/** Props of the import conflict dialog. */
export interface TeamImportDialogProps {
    /** The document being imported and the collisions the inspection found. */
    readonly plan: TeamPresetImportPlan;
    /** Page copy reader. */
    readonly t: (key: TeamPresetsLocaleKey) => string;
    readonly onCancel: () => void;
    readonly onConfirm: (resolution: TeamPresetImportResolution) => void;
}
/**
 * Render the collision dialog for one import.
 * @param props - the plan, the page copy, and the two outcomes.
 * @returns the dialog; the caller mounts it only while an import is pending.
 */
export declare function TeamImportDialog(props: TeamImportDialogProps): import("react").JSX.Element;
//# sourceMappingURL=TeamImportDialog.d.ts.map