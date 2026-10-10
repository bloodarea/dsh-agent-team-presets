/** Locale bundles for the Agent Team presets page and composer control. */
import type { TeamPresetImportFailure } from '../preset-transfer.ts';
import type { TeamExecutionState } from '../types.ts';
/** Locale keys this plugin renders. */
export type TeamPresetsLocaleKey = 'nav' | 'title' | 'description' | 'newTeam' | 'duplicate' | 'remove' | 'removeMember' | 'teamList' | 'emptyTeams' | 'emptySelection' | 'memberCount' | 'teamName' | 'teamNamePlaceholder' | 'teamDescription' | 'captain' | 'captainHint' | 'members' | 'addMember' | 'membersHint' | 'agentName' | 'agentNamePlaceholder' | 'agentColor' | 'agentDescription' | 'route' | 'routeInherit' | 'provider' | 'model' | 'effort' | 'effortDefault' | 'captainModelHint' | 'captainFollowsSession' | 'modelsPartial' | 'tools' | 'toolsHint' | 'toolMode' | 'toolsDefault' | 'toolsCustom' | 'toolsAllHint' | 'toolsEmpty' | 'toolsScoped' | 'toolsSelectAll' | 'toolsClear' | 'toolsRemove' | 'toolsUnavailable' | 'toolsLoading' | 'toolsFailed' | 'toolsNoCatalog' | 'systemPrompt' | 'systemPromptPlaceholder' | 'systemPromptHint' | 'promptWarnBraces' | 'save' | 'saving' | 'saveFailed' | 'discard' | 'unsaved' | 'readOnly' | 'unavailable' | 'externalUpdateOne' | 'externalUpdateMany' | 'externalUpdateOverriddenOne' | 'externalUpdateOverriddenMany' | 'executionBusy' | 'executionBusyShared' | 'executionIdle' | 'executionUnknown' | 'externalAddedOne' | 'externalAddedMany' | 'externalRemovedOne' | 'externalRemovedMany' | 'externalRemovedEditedOne' | 'externalRemovedEditedMany' | 'back' | 'backToList' | 'editCaptain' | 'editMember' | 'teamSections' | 'agentSections' | 'modelSection' | 'promptSection' | 'toolsSection' | 'identitySection' | 'emptyMembers' | 'inheritSession' | 'deleteAgent' | 'roleCaptain' | 'roleMember' | 'composerTitle' | 'composerNone' | 'composerHint' | 'importPreset' | 'exportPreset' | 'importNote' | 'importConfirm' | 'cancel' | 'close' | 'importConflictTitle' | 'importTeamConflict' | 'importTeamReplace' | 'importTeamRename' | 'importNewTeamName' | 'importCaptainConflict' | 'importCaptainReplace' | 'importCaptainRename' | 'importMemberConflict' | 'importMemberReplace' | 'importMemberRename' | 'importInvalidJson' | 'importInvalidFormat' | 'importUnsupportedVersion' | 'importUnsupportedFields' | 'importDuplicateMembers' | 'importTooManyMembers' | 'importTooLarge';
/** Locale namespace owned by this plugin. */
export declare const NS = "settings.agentTeamPresets";
/** English copy. */
export declare const en: Record<TeamPresetsLocaleKey, string>;
/** Simplified Chinese copy. */
export declare const zh: Record<TeamPresetsLocaleKey, string>;
/** Locale key of the execution hint one Team state shows. */
export declare const EXECUTION_NOTICE_KEYS: Record<TeamExecutionState, TeamPresetsLocaleKey>;
/** Locale key for one refused import. */
export declare const IMPORT_FAILURE_KEYS: Record<TeamPresetImportFailure, TeamPresetsLocaleKey>;
//# sourceMappingURL=locales.d.ts.map