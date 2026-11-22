/**
 * Fixed JSON transfer format for one Team preset.
 *
 * A shared document carries the parts of a Team that keep working after the
 * document moves to another deployment: the Team's own name and purpose, each
 * agent's name, description, standing system prompt, and accent color, the
 * display-only discovery metadata, and — for an official template — the
 * shipped skill ids it assigns to its role slots. Model routes and tool
 * permissions stay local, because a route names a provider this deployment may
 * not run and an allow-list names tools it may not expose. A document that
 * carries them is refused rather than silently reduced, so a reader never
 * believes it imported something it did not.
 *
 * Version 2 adds `metadata` and `officialSkills` to version 1 without changing
 * any version 1 meaning. The writer emits version 2; the reader accepts both,
 * so a document written before this release still imports. A version 1 reader
 * meeting a version 2 document refuses it as `unsupported-version` instead of
 * guessing — that is why the version is bumped rather than the fields being
 * silently added to version 1.
 *
 * Personal Team Skill assets, member bindings, category membership, and local
 * paths are never part of this document.
 * @module dsh-agent-team-presets/preset-transfer
 */
import type { TeamAgentPreset, TeamCaptainPreset, TeamDisplayMetadata, TeamPreset, TeamSlotPreset } from './types.ts';
/** Format marker every shareable Team document carries. */
export declare const TEAM_PRESET_FORMAT = "dsh-agent-team-preset";
/** Format revision this plugin writes. */
export declare const TEAM_PRESET_FORMAT_VERSION = 2;
/** The older revision this plugin still reads. */
export declare const TEAM_PRESET_FORMAT_VERSION_V1 = 1;
/** Members one shared document may declare. */
export declare const MAX_TRANSFER_MEMBERS = 64;
/** Characters one shared document may hold, so one paste cannot exhaust the page. */
export declare const MAX_TRANSFER_CHARS: number;
/** Upper bounds of the display metadata fields. */
export declare const METADATA_LIMITS: {
    /** Characters in `summary`. */
    readonly summary: 500;
    /** Characters in one tag. */
    readonly tag: 64;
    /** Tags in `tags`. */
    readonly tags: 30;
    /** Characters in one use case. */
    readonly useCase: 200;
    /** Entries in `useCases`. */
    readonly useCases: 20;
    /** Characters in one quick prompt. */
    readonly quickPrompt: 500;
    /** Entries in `quickPrompts`. */
    readonly quickPrompts: 20;
    /** Characters in `notes`. */
    readonly notes: 2000;
    /** Characters across the whole metadata object, JSON-encoded. */
    readonly total: number;
    /** Official skill declarations one document may carry. */
    readonly officialSkills: 16;
};
/** The shareable fields of one captain or member slot. */
export type TeamSlotTransfer = {
    /** Display name; a member's name also derives the teammate target. */
    readonly name: string;
    /** Short description of the role. */
    readonly description: string;
    /** Standing system prompt of the role. */
    readonly systemPrompt: string;
    /** Accent color as `#rrggbb`; empty keeps the theme default. */
    readonly color: string;
};
/** One official default Team Skill declaration carried by an official template. */
export type OfficialSkillTransfer = {
    /** Shipped skill id; resolvable on another deployment of this plugin version. */
    readonly skillId: string;
    /** Exact role name inside the document. */
    readonly roleName: string;
};
/** One Team as a shareable document. */
export type TeamPresetTransfer = {
    /** Format marker, so a reader can tell this document from any other JSON. */
    readonly format: typeof TEAM_PRESET_FORMAT;
    /** Format revision this document was written under. */
    readonly version: number;
    /** The Team's shareable content. */
    readonly team: {
        /** Display name. */
        readonly name: string;
        /** What this Team is for. */
        readonly description: string;
        /** Display-only discovery metadata, absent in version 1 documents. */
        readonly metadata?: TeamDisplayMetadata;
        /** The captain's shareable role. */
        readonly captain: TeamSlotTransfer;
        /** Every member's shareable role, in declared order. */
        readonly members: readonly TeamSlotTransfer[];
        /**
         * Official default skill assignments declared by the shipped template.
         * Never carries skill bodies, local bindings, or paths.
         */
        readonly officialSkills?: readonly OfficialSkillTransfer[];
    };
};
/** Why one document was refused. */
export type TeamPresetImportFailure = 'invalid-json' | 'invalid-format' | 'unsupported-version' | 'unsupported-fields' | 'duplicate-members' | 'too-many-members' | 'too-large' | 'invalid-metadata';
/** Result of reading one shared document. */
export type TeamPresetImportResult = {
    readonly ok: true;
    readonly transfer: TeamPresetTransfer;
} | {
    readonly ok: false;
    readonly reason: TeamPresetImportFailure;
};
/**
 * Count the characters one metadata object adds to a document.
 * @param metadata - the metadata to measure.
 * @returns its JSON-encoded length.
 */
export declare function metadataChars(metadata: TeamDisplayMetadata): number;
/**
 * Read one already-parsed document.
 * @param value - candidate document.
 * @returns the document, or the reason it is not a Team preset of this format.
 */
export declare function parseTeamPresetValue(value: unknown): TeamPresetImportResult;
/**
 * Read one shared document from its JSON text.
 * @param text - the document text.
 * @returns the document, or the reason it is not a Team preset of this format.
 */
export declare function parseTeamPresetText(text: string): TeamPresetImportResult;
/**
 * Compare two slot names the way the runtime matches a summoned member.
 *
 * `findMember` accepts a member's derived target or its display name, and the
 * target is the lower-kebab-case form of the name, so two names that differ
 * only by case or surrounding space address the same teammate.
 * @param name - one configured or shared name.
 * @returns the comparison key of that name.
 */
export declare function slotNameKey(name: string): string;
/**
 * Derive a name that is not already taken.
 * @param base - the preferred name.
 * @param taken - names already used in the same scope.
 * @returns the preferred name, or that name with the first free numeric suffix.
 */
export declare function uniqueName(base: string, taken: Iterable<string>): string;
/** Options accepted when exporting one Team. */
export interface TeamPresetExportOptions {
    /**
     * Official default skill declarations of the shipped template this Team came
     * from. Local assignments are never accepted here.
     */
    readonly officialSkills?: readonly OfficialSkillTransfer[];
}
/**
 * Project one Team onto the document that shares it.
 * @param team - the Team preset to share.
 * @param options - official template declarations, when exporting a builtin Team.
 * @returns the shareable document.
 */
export declare function exportTeamPreset(team: TeamPreset, options?: TeamPresetExportOptions): TeamPresetTransfer;
/**
 * Serialize one Team as the fixed document this plugin imports.
 * @param team - the Team preset to share.
 * @param options - official template declarations, when exporting a builtin Team.
 * @returns the document text, newline-terminated.
 */
export declare function serializeTeamPreset(team: TeamPreset, options?: TeamPresetExportOptions): string;
/**
 * Build one captain from a shared slot.
 * @param slot - the shared captain.
 * @returns a captain carrying the shared fields and the local defaults.
 */
export declare function captainFromTransfer(slot: TeamSlotTransfer): TeamCaptainPreset;
/**
 * Build one member from a shared slot.
 * @param slot - the shared member.
 * @returns a member carrying the shared fields, no route, and the default tool policy.
 */
export declare function memberFromTransfer(slot: TeamSlotTransfer): TeamAgentPreset;
/**
 * Overwrite the fields one shared slot carries, keeping every local field.
 *
 * This is what makes a replacement non-destructive: the imported name,
 * description, prompt, and color land, while the route and tool policy the
 * deployment already configured stay exactly as they were.
 * @param slot - the configured captain or member being overwritten.
 * @param shared - the document's version of that slot.
 * @returns a slot carrying the shared fields and the original local ones.
 */
export declare function applySharedFields<T extends TeamSlotPreset>(slot: T, shared: TeamSlotTransfer): T;
/**
 * Build one local Team from a shared document.
 *
 * Everything the document does not carry starts empty: routes follow the
 * Session and the tool policy stays unrestricted, so an imported Team never
 * inherits a route or an allow-list from the document it came from.
 * @param transfer - the document to import.
 * @param id - the local identity the imported Team takes.
 * @returns a new Team preset carrying the document's shareable content.
 */
export declare function teamFromTransfer(transfer: TeamPresetTransfer, id: string): TeamPreset;
/** Where one document collides with the Teams already configured. */
export type TeamPresetImportConflicts = {
    /** Index of the same-named configured Team, or undefined when the name is free. */
    readonly targetIndex: number | undefined;
    /** Display name of that Team, for the dialog that resolves the collision. */
    readonly targetName: string;
    /** The document's captain name when the target Team already names its captain that way. */
    readonly captainConflict: string;
    /** Shared member names the target Team already uses, in document order. */
    readonly memberConflicts: readonly string[];
    /** Name the document's Team can take when it is added as a new Team. */
    readonly suggestedTeamName: string;
    /** Name the document's captain can take when it is renamed. */
    readonly suggestedCaptainName: string;
};
/**
 * Find what one document collides with in the configured Teams.
 *
 * Every key is compared inside the Team the document would overwrite: a Team by
 * its name, and its captain and members by theirs. A name only reaches this
 * check when the two Teams are the same one, because replacing a captain or a
 * member of some *other* Team is not an edit the import may make. An unnamed
 * slot never collides: it is addressed by position, not by name.
 * @param teams - every Team the page currently shows.
 * @param transfer - the document being imported.
 * @returns the colliding Team, its conflicting agent names, and free replacement names.
 */
export declare function importConflicts(teams: readonly TeamPreset[], transfer: TeamPresetTransfer): TeamPresetImportConflicts;
