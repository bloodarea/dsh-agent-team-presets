/** Locale bundles for the Agent Team presets page and composer control. */
import type { TeamPresetImportFailure } from '../preset-transfer.ts';
import type { TeamExecutionState } from '../types.ts';
import type { DefaultsRestore, TeamPresetsFormIssue, TeamSelectionFailure } from './team-presets-controller.ts';
/** Locale keys this plugin renders. */
export type TeamPresetsLocaleKey = 'nav' | 'title' | 'description' | 'newTeam' | 'duplicate' | 'remove' | 'removeMember' | 'teamList' | 'emptyTeams' | 'emptySelection' | 'memberCount' | 'teamName' | 'teamNamePlaceholder' | 'teamDescription' | 'captain' | 'captainHint' | 'members' | 'addMember' | 'membersHint' | 'agentName' | 'agentNamePlaceholder' | 'agentColor' | 'agentDescription' | 'route' | 'routeInherit' | 'provider' | 'model' | 'effort' | 'effortDefault' | 'captainModelHint' | 'captainFollowsSession' | 'modelsPartial' | 'modelsFailed' | 'tools' | 'toolsHint' | 'toolMode' | 'toolsDefault' | 'toolsCustom' | 'toolsAllHint' | 'toolsEmpty' | 'toolsScoped' | 'toolsSelectAll' | 'toolsClear' | 'toolsRemove' | 'toolsUnavailable' | 'toolsLoading' | 'toolsFailed' | 'toolsNoCatalog' | 'toolsCaptainOnly' | 'toolsGroupPresets' | 'toolsGroupMcp' | 'toolsGroupOther' | 'toolsInvert' | 'composerMissing' | 'composerMissingHint' | 'systemPrompt' | 'systemPromptPlaceholder' | 'systemPromptHint' | 'promptWarnBraces' | 'save' | 'saving' | 'saveFailed' | 'discard' | 'unsaved' | 'readOnly' | 'unavailable' | 'sectionLoading' | 'formIssueSettingsUnavailable' | 'formIssueNamespaceMissing' | 'formIssueSchemaRejected' | 'selectionUnavailable' | 'selectionRefused' | 'selectionFailed' | 'teamNameRequired' | 'externalUpdateOne' | 'externalUpdateMany' | 'externalUpdateOverriddenOne' | 'externalUpdateOverriddenMany' | 'executionBusy' | 'executionBusyShared' | 'executionIdle' | 'executionUnknown' | 'executionPtcOverridden' | 'externalAddedOne' | 'externalAddedMany' | 'externalRemovedOne' | 'externalRemovedMany' | 'externalRemovedEditedOne' | 'externalRemovedEditedMany' | 'back' | 'backToList' | 'editCaptain' | 'editMember' | 'teamSections' | 'agentSections' | 'modelSection' | 'promptSection' | 'toolsSection' | 'identitySection' | 'emptyMembers' | 'inheritSession' | 'deleteAgent' | 'roleCaptain' | 'roleMember' | 'composerTitle' | 'composerNone' | 'composerHint' | 'trigger' | 'loading' | 'unavailable' | 'roster' | 'model' | 'open' | 'current' | 'memberStatus.running' | 'memberStatus.inactive' | 'presetMemberBadge' | 'presetMemberBadgeHint' | 'tasks' | 'empty' | 'owner' | 'unowned' | 'blockedBy' | 'writeScopes' | 'ready' | 'blocked' | 'task.expand' | 'task.collapse' | 'status.pending' | 'status.in_progress' | 'status.completed' | 'importPreset' | 'exportPreset' | 'importNote' | 'importConfirm' | 'cancel' | 'close' | 'restoreDefaults' | 'restoreDefaultsHint' | 'defaultsRestored' | 'defaultsUnchanged' | 'importConflictTitle' | 'importTeamConflict' | 'importTeamReplace' | 'importTeamRename' | 'importNewTeamName' | 'importCaptainConflict' | 'importCaptainReplace' | 'importCaptainRename' | 'importMemberConflict' | 'importMemberReplace' | 'importMemberRename' | 'importInvalidJson' | 'importInvalidFormat' | 'importUnsupportedVersion' | 'importUnsupportedFields' | 'importDuplicateMembers' | 'importTooManyMembers' | 'importTooLarge' | 'importInvalidMetadata' | 'skillsEmpty' | 'skillsImport' | 'skillsNew' | 'skillsSave' | 'skillsDelete' | 'skillsAssign' | 'skillsUnassign' | 'skillsBuiltinList' | 'skillsFiles' | 'skillsBindings' | 'skillsNamePlaceholder' | 'skillsDescriptionPlaceholder' | 'skillsRoot' | 'skillsRefresh' | 'tabLinks' | 'patchIntro' | 'patchUnavailable' | 'patchStateAbsent' | 'patchStateUnsupported' | 'patchStatePristine' | 'patchStatePatched' | 'patchStateForeign' | 'patchActive' | 'patchSupported' | 'patchInstalledVersion' | 'patchSource' | 'patchPendingHint' | 'patchApplying' | 'patchWaiting' | 'patchInstall' | 'patchUninstall' | 'patchWorking' | 'patchInstallTitle' | 'patchUninstallTitle' | 'patchInstallBody' | 'patchUninstallBody' | 'patchPackage' | 'patchFile' | 'patchInstalledOk' | 'patchRemovedOk' | 'patchRefused' | 'skillsScan' | 'skillsScanHint' | 'skillsScanSummary' | 'skillsScanEmpty' | 'skillsScanImported' | 'skillsScanExisting' | 'skillsScanInvalid' | 'skillsScanMissingSkill' | 'skillsScanInvalidFrontmatter' | 'skillsScanInvalidName' | 'skillsScanMissingDescription' | 'skillsScanTooLarge' | 'skillsScanSymlink' | 'skillsScanNotDirectory' | 'skillsScanUnreadable' | 'skillsScanDuplicate' | 'skillsScanInstallRefused' | 'skillsOpenScanFolder' | 'skillsCopyScanFolder' | 'skillsScanFolderOpened' | 'skillsScanFolderCopied' | 'skillsScanFolderCopyFailed' | 'skillsOverride' | 'skillsReset' | 'skillsBody' | 'tabTeams' | 'tabSkills' | 'skillsHint' | 'skillsAssignTitle' | 'skillsAssignHint' | 'skillsAssignEmpty' | 'skillsNameClash' | 'skillsNameClashBody' | 'skillsBlockedAssign' | 'skillsMcpUnverified' | 'skillsDeclared' | 'skillsFound' | 'skillsMissing' | 'categoryRename' | 'categoryUp' | 'categoryDown' | 'categoryManagePage' | 'categoryTitle' | 'categorySub' | 'categoryTeams' | 'categorySave' | 'categoryRemove' | 'categoryNote' | 'categoryManage' | 'categoryFold' | 'categoryName' | 'categoryAdd' | 'categoryEmpty' | 'categoryOf' | 'categoryNone' | 'metadataTitle' | 'metadataOnlyDisplay' | 'metadataNote' | 'metadataFold' | 'metadataUnfold' | 'metadataSummary' | 'metadataTags' | 'metadataTagsHint' | 'metadataUseCases' | 'metadataQuickPrompts' | 'metadataNotes' | 'filterSource' | 'filterCategory' | 'filterNoCategory' | 'listSearch' | 'listAll' | 'listBuiltin' | 'listCustom' | 'seriesDevelopment' | 'seriesWorkModes' | 'listMatched' | 'listNoInject' | 'listNoMatch' | 'listResultCount' | 'restoreConfirmTitle' | 'restoreConfirmBody' | 'restoreConfirmAction' | 'composeTitle' | 'composeClose' | 'composeSearch' | 'composeAll' | 'composeFilterCategory' | 'composeCategoryAll' | 'composeUncategorized' | 'composeNoneSub' | 'composeSeriesDev' | 'composeSeriesModes' | 'composeEmpty' | 'composePanelTitle' | 'composePanelCaptain' | 'composePanelMembers' | 'composePanelSessionModel' | 'composePanelCaptainHint' | 'composePanelSoloHint' | 'composePanelEmptyMembers' | 'composePanelNoId' | 'composerMissingMember' | 'originBuiltin' | 'originCustom' | 'originOverride' | 'skillsTitle' | 'skillsSub' | 'skillsNote' | 'skillsOpenFolder' | 'skillsOpenAssetFolder' | 'skillsSearch' | 'skillsAll' | 'skillsBuiltin' | 'skillsCustom' | 'skillsBound' | 'skillsResources' | 'skillsSaveFile' | 'skillsEditable' | 'skillsReadonly' | 'skillsMakeCopy' | 'skillsResetCopy' | 'skillsNoBinding' | 'skillsUnbind' | 'skillsDeps' | 'skillsNoDeps' | 'skillsDeleteTitle' | 'skillsDeleteBody' | 'skillsDeleteBlocked' | 'skillsDeleteBoundWarning' | 'skillsDeleteBuiltinWarning' | 'skillsCancel' | 'skillsConfirm' | 'skillsName' | 'skillsDesc' | 'skillsNewTitle' | 'skillsVersion' | 'skillsOverrideOn';
/** Locale namespace owned by this plugin. */
export declare const NS = "settings.agentTeamPresets";
/** English copy. */
export declare const en: Record<TeamPresetsLocaleKey, string>;
/** Simplified Chinese copy. */
export declare const zh: Record<TeamPresetsLocaleKey, string>;
/**
 * Locale key for one Host disclosure about how the applied Team runs.
 *
 * A Host disclosure is a locale key, so the page renders it in the reader's own
 * language; an unrecognised one is shown verbatim rather than swallowed, because
 * a disclosure the page cannot translate is still a disclosure it must not hide.
 */
export declare const DISCLOSURE_NOTICE_KEYS: Record<string, TeamPresetsLocaleKey>;
/** Locale key of the execution hint one Team state shows. */
export declare const EXECUTION_NOTICE_KEYS: Record<TeamExecutionState, TeamPresetsLocaleKey>;
/** Locale key of the notice one default-preset restore shows. */
export declare const DEFAULTS_NOTICE_KEYS: Record<DefaultsRestore, TeamPresetsLocaleKey>;
/** Locale key for one refused import. */
export declare const IMPORT_FAILURE_KEYS: Record<TeamPresetImportFailure, TeamPresetsLocaleKey>;
/**
 * Locale key naming why the stored Team section cannot be edited.
 *
 * The three conditions have three different owners: a page with no Host
 * document is the deployment's, a namespace no row serves is the deployment's,
 * and a section this client refused to decode is this plugin's to report. The
 * page names which one it is instead of showing one "unavailable" for all.
 */
export declare const FORM_ISSUE_KEYS: Record<TeamPresetsFormIssue, TeamPresetsLocaleKey>;
/**
 * Locale key for one failed Team selection write.
 *
 * The Host's own refusal text is appended verbatim when there is one: it is the
 * only part of the notice that names what to change, and translating it would
 * replace an actionable message with a summary.
 */
export declare const SELECTION_FAILURE_KEYS: Record<TeamSelectionFailure['kind'], TeamPresetsLocaleKey>;
/**
 * Read one selection failure as the notice both surfaces render.
 *
 * The Host's refusal text is the only part of the notice that names what to
 * change, so it is appended verbatim rather than paraphrased: a translated
 * summary of "Config field \"selections\" is not volatile" would hide exactly
 * the sentence the reader needs. A `t` seat of any locale namespace is accepted
 * structurally, so both the page and the composer control can pass their own.
 * @param failure - the selection failure this client recorded.
 * @param t - the bound translate seat of this plugin's namespace.
 * @returns the notice text, with the Host's own detail when there is one.
 */
export declare function selectionFailureText(failure: TeamSelectionFailure, t: (key: TeamPresetsLocaleKey, params?: Record<string, string>) => string): string;
