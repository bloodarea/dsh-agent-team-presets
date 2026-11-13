/**
 * The official Team presets this plugin ships, as installable and restorable
 * definitions.
 *
 * The catalog in `team-catalog.ts` is the source of truth; this module turns one
 * catalog entry into the stored record a deployment holds, installs the
 * official set exactly once, and restores it on request. Two rules keep that
 * knowledge from becoming a trap:
 *
 * - Installing a shipped preset never overwrites a stored one. Seeding appends a
 *   preset the deployment does not hold and records its identity in
 *   `seededDefaults`, so a shipped preset the user deletes or edits stays
 *   exactly as they left it across restarts. Restoring it is a deliberate act.
 * - Restoring a shipped preset replaces the fields a shared document carries —
 *   the name, the purpose, every standing prompt, the accent colors, the
 *   roster, and the display metadata — and keeps the fields it does not: a
 *   member's model route and every slot's tool policy.
 *
 * `contrib/default-presets` holds the same nine documents as JSON for readers of
 * this repository, and `tests/builtin-teams.spec.ts` proves the two cannot
 * drift.
 * @module dsh-agent-team-presets/builtin-teams
 */
import type { TeamPresetTransfer } from './preset-transfer.ts';
import type { OfficialSkillBinding } from './team-catalog.ts';
import type { TeamDisplayMetadata, TeamPreset, TeamSeries } from './types.ts';
export { BUILTIN_TEAM_IDS } from './team-catalog.ts';
/** Identity the lightweight Team is stored under. */
export declare const LIGHTWEIGHT_TEAM_ID = "builtin-lightweight";
/** Identity the standard Team is stored under. */
export declare const STANDARD_TEAM_ID = "builtin-standard";
/** Identity the full-stack Team is stored under. */
export declare const FULLSTACK_TEAM_ID = "builtin-fullstack";
/** Identity the discovery Team is stored under. */
export declare const DISCOVERY_TEAM_ID = "builtin-discovery";
/** Identity the planning Team is stored under. */
export declare const PLANNING_TEAM_ID = "builtin-planning";
/** Identity the workflow Team is stored under. */
export declare const WORKFLOW_TEAM_ID = "builtin-workflow";
/** Identity the engineering Team is stored under. */
export declare const ENGINEERING_TEAM_ID = "builtin-engineering";
/** Identity the audit Team is stored under. */
export declare const AUDIT_TEAM_ID = "builtin-audit";
/** Identity the research Team is stored under. */
export declare const RESEARCH_TEAM_ID = "builtin-research";
/** One shipped Team: the identity it is stored under and the document it restores from. */
export interface BuiltinTeam {
    /** Stable identity every stored copy of this preset keeps. */
    readonly id: string;
    /** Fixed official series this Team belongs to. */
    readonly series: TeamSeries;
    /** Shareable content the preset is installed and restored from. */
    readonly document: TeamPresetTransfer;
    /** Presentation-only discovery metadata. */
    readonly metadata: TeamDisplayMetadata;
    /** Official default Team Skill assignments for this template. */
    readonly officialSkillBindings: readonly OfficialSkillBinding[];
}
/** Every shipped preset, in install order: the three development Teams, then the six work modes. */
export declare const BUILTIN_TEAMS: readonly BuiltinTeam[];
/**
 * Stable role identity of one shipped member.
 *
 * A member's `id` is the identity a durable member snapshot binds to and the one
 * the runtime re-reads a route through, so a shipped member is stored under a
 * derived identity rather than a random one: restoring the preset a second time
 * addresses the same role instead of creating a second one.
 * @param teamId - identity of the shipped Team that owns the member.
 * @param name - the member's name in the document.
 * @param index - the member's position, used only when the document names none.
 * @returns the role identity a shipped member is stored under.
 */
export declare function memberRoleId(teamId: string, name: string, index: number): string;
/**
 * Build the preset one shipped document describes.
 *
 * Everything the document does not carry starts empty, exactly as an import
 * starts: the route follows the Session and the tool policy stays unrestricted.
 * The display metadata rides along because it belongs to the template, not to
 * any runtime field.
 * @param entry - the shipped Team to materialize.
 * @returns a fresh preset carrying the document's content.
 */
export declare function builtinTeamDefinition(entry: BuiltinTeam): TeamPreset;
/**
 * Copy one metadata object so a stored Team never shares the catalog's arrays.
 * @param metadata - the catalog metadata.
 * @returns a detached copy.
 */
export declare function cloneMetadata(metadata: TeamDisplayMetadata): TeamDisplayMetadata;
/** What one seeding pass did to the stored Team list. */
export interface BuiltinSeedResult {
    /** The Team list, with every shipped preset the deployment did not hold appended. */
    readonly teams: TeamPreset[];
    /** Identities of the shipped presets this deployment has now been offered. */
    readonly seeded: readonly string[];
    /** Whether the Team list or the marker moved, so the caller knows a write is needed. */
    readonly changed: boolean;
}
/**
 * Install the shipped presets a deployment has not been offered yet.
 *
 * A preset is appended only when the deployment neither holds it nor was ever
 * offered it, and it is marked as offered whether this pass appended it or the
 * deployment already held it. That is what makes the shipped set deletable: the
 * marker records "the user was offered this preset", not "this preset is
 * installed", so deleting one leaves it deleted and installing one happens
 * exactly once. An existing preset is never overwritten here — editing or
 * replacing a stored Team is the user's decision, and `restoreBuiltinTeams` is
 * how they make it.
 * @param teams - the stored Team list, already cleaned of legacy fields.
 * @param seeded - identities the deployment was already offered.
 * @returns the next Team list, the next marker, and whether either changed.
 */
export declare function seedBuiltinTeams(teams: readonly TeamPreset[], seeded: readonly string[]): BuiltinSeedResult;
/**
 * The shipped presets a deployment was offered but no longer holds.
 *
 * The marker exists so a deleted preset stays deleted, which also means a Team
 * list that lost its shipped presets for any other reason — a hand edit, a
 * restored settings file, a rollback — never gets them back on its own. This
 * reads that state instead of changing it: the caller warns, and the reader can
 * decide to restore. A preset the deployment was never offered is not reported,
 * because the install pass will add it on this same startup.
 * @param teams - the stored Team list.
 * @param seeded - identities the deployment was already offered.
 * @returns the shipped identities that are marked as offered yet absent.
 */
export declare function missingSeededBuiltinTeams(teams: readonly TeamPreset[], seeded: readonly string[]): string[];
/**
 * Whether two metadata objects are equal field by field.
 * @param a - left metadata, or undefined.
 * @param b - right metadata, or undefined.
 * @returns whether both describe the same display data.
 */
export declare function sameMetadata(a: TeamDisplayMetadata | undefined, b: TeamDisplayMetadata | undefined): boolean;
/** What one restore did to the Team list. */
export interface BuiltinRestoreResult {
    /** The Team list, with every shipped preset at its document's content. */
    readonly teams: TeamPreset[];
    /** Identities of the shipped presets this restore actually changed. */
    readonly changed: readonly string[];
}
/**
 * Put every shipped preset back at its document's content.
 *
 * Only the shipped presets are touched: a Team the user created keeps its
 * identity, its content, and its position, and a shipped preset that is missing
 * is appended rather than substituted for anything else. The result is the list
 * the caller stages, so a restore is reviewable and saved like every other edit
 * on the page.
 * @param teams - the Teams the page currently shows.
 * @returns the restored list and the identities that really moved.
 */
export declare function restoreBuiltinTeams(teams: readonly TeamPreset[]): BuiltinRestoreResult;
