/**
 * The Team Skill settings pages: a library list and one skill's detail, exactly
 * as the v0.1.6 native prototype defines them (new views only — the 0.1.5 Team
 * pages around them are unchanged).
 *
 * The library page owns discovery: search, the built-in/custom segment, and the
 * three actions the prototype puts in the title row. The detail page owns one
 * skill: its file tree and editor, its member references, and the deletion the
 * Host refuses while a member still holds it. Assignment itself belongs to the
 * member page, so this file never invents a second place to bind a skill.
 * @module dsh-agent-team-presets/client/TeamSkillsView
 */
import type { TeamSkillsController } from './team-skills-controller.ts';
import { type TeamPresetsLocaleKey } from './locales.ts';
/** Locale keys this panel reads. */
export type TeamSkillsLocaleKey = 'originBuiltin' | 'originCustom' | 'originOverride' | 'skillsTitle' | 'skillsSub' | 'skillsNote' | 'skillsNew' | 'skillsImport' | 'skillsOpenFolder' | 'skillsOpenAssetFolder' | 'skillsSearch' | 'skillsAll' | 'skillsBuiltin' | 'skillsCustom' | 'skillsFiles' | 'skillsBound' | 'skillsEmpty' | 'skillsResources' | 'skillsSaveFile' | 'skillsEditable' | 'skillsReadonly' | 'skillsMakeCopy' | 'skillsResetCopy' | 'skillsBindings' | 'skillsNoBinding' | 'skillsUnbind' | 'skillsDeps' | 'skillsNoDeps' | 'skillsDelete' | 'skillsDeleteTitle' | 'skillsDeleteBody' | 'skillsDeleteBlocked' | 'skillsDeleteBoundWarning' | 'skillsDeleteBuiltinWarning' | 'skillsCancel' | 'skillsConfirm' | 'skillsName' | 'skillsDesc' | 'skillsNewTitle' | 'skillsVersion' | 'skillsOverrideOn' | 'skillsBlockedAssign' | 'skillsMcpUnverified' | 'skillsNameClash' | 'skillsNameClashBody' | 'skillsDeclared' | 'skillsFound' | 'skillsMissing' | 'skillsScan' | 'skillsScanHint' | 'skillsScanSummary' | 'skillsScanEmpty' | 'skillsScanImported' | 'skillsScanExisting' | 'skillsScanInvalid' | 'skillsScanMissingSkill' | 'skillsScanInvalidFrontmatter' | 'skillsScanInvalidName' | 'skillsScanMissingDescription' | 'skillsScanTooLarge' | 'skillsScanSymlink' | 'skillsScanNotDirectory' | 'skillsScanUnreadable' | 'skillsScanDuplicate' | 'skillsScanInstallRefused' | 'skillsOpenScanFolder' | 'skillsCopyScanFolder' | 'skillsScanFolderOpened' | 'skillsScanFolderCopied' | 'skillsScanFolderCopyFailed';
/** Props of {@link TeamSkillsView}. */
export interface TeamSkillsViewProps {
    /** Page state and actions. */
    readonly controller: TeamSkillsController;
    /** Translate one locale key. */
    readonly t: (key: TeamPresetsLocaleKey) => string;
}
/** The Team Skill settings pages. */
export declare function TeamSkillsView(props: TeamSkillsViewProps): React.ReactElement;
