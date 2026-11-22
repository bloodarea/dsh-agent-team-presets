/**
 * Reading one Team Skill folder from untrusted input.
 *
 * Two entry points share every check: a browser folder picker hands over
 * relative names and bytes, and a ZIP hands over a central directory that must
 * be validated before anything is inflated. Both converge on
 * {@link buildSkillPackage}, which is the only place that decides whether a set
 * of files is a legal Team Skill — so the two import paths cannot disagree
 * about traversal, size, frontmatter, or duplicates.
 *
 * The importer never executes anything and never rewrites a third-party
 * `SKILL.md`: unknown frontmatter keys are preserved verbatim, because the file
 * belongs to a portable format this plugin only reads.
 * @module dsh-agent-team-presets/team-skills/import
 */
import type { SkillPathFailure } from './paths.ts';
/** The instruction file every Team Skill must carry. */
export declare const SKILL_FILE = "SKILL.md";
/** Most bytes one ZIP may expand to, so a bomb cannot exhaust memory. */
export declare const MAX_ZIP_BYTES: number;
/** Most entries one ZIP may declare. */
export declare const MAX_ZIP_ENTRIES = 4000;
/** Why one import was refused. */
export type SkillImportFailure = 'invalid-zip' | 'encrypted-zip' | 'zip-bomb' | 'missing-skill-file' | 'invalid-frontmatter' | 'invalid-name' | 'missing-description' | SkillPathFailure;
/** One file of an imported folder, decoded. */
export interface ImportedFile {
    /** POSIX-relative path. */
    readonly path: string;
    /** Raw bytes. */
    readonly bytes: Uint8Array;
}
/** One validated Team Skill folder. */
export interface SkillPackage {
    /** Kebab-case name from the frontmatter; also the default directory name. */
    readonly name: string;
    /** Description from the frontmatter. */
    readonly description: string;
    /** Every file, path-ordered. */
    readonly files: readonly ImportedFile[];
    /** Total byte length. */
    readonly totalBytes: number;
}
declare const DEPENDENCY_FRONTMATTER_FIELDS: readonly ["executables", "mcpServers", "otherSkills"];
/** An unsupported dependency key explicitly present in `SKILL.md` frontmatter. */
export interface SkillDependencyWarning {
    readonly code: 'unsupported-dependency-frontmatter';
    readonly field: (typeof DEPENDENCY_FRONTMATTER_FIELDS)[number];
}
/** Result of one import attempt. */
export type SkillImportResult = {
    readonly ok: true;
    readonly skill: SkillPackage;
    readonly warnings: readonly string[];
    readonly dependencyWarnings: readonly SkillDependencyWarning[];
} | {
    readonly ok: false;
    readonly reason: SkillImportFailure;
    readonly path?: string;
};
/**
 * Parse the two required Agent Skills fields from `SKILL.md`.
 * @param text - the whole document.
 * @returns the required fields, or undefined when the frontmatter cannot be parsed.
 */
export declare function parseSkillFrontmatter(text: string): {
    name: string;
    description: string;
} | undefined;
/**
 * Validate one decoded folder as a Team Skill.
 *
 * @param input - the files a caller wants to install.
 * @returns the validated package, or the reason it is not one.
 */
export declare function buildSkillPackage(input: readonly ImportedFile[]): SkillImportResult;
/**
 * Rename an already validated Team Skill package for a new copy.
 * @param package_ - the source package, whose files are left intact.
 * @param name - the new kebab-case name.
 * @returns the renamed package, with only the instruction file changed.
 */
export declare function renameSkillPackage(package_: SkillPackage, name: string): SkillPackage;
/**
 * Read one ZIP archive as an imported folder.
 *
 * The total expansion is bounded before anything is inflated, so a bomb is
 * refused on its declared sizes even when every entry looks reasonable.
 * @param bytes - the whole archive.
 * @returns the decoded files, or the reason the archive was refused.
 */
export declare function readZip(bytes: Uint8Array): {
    ok: true;
    files: ImportedFile[];
} | {
    ok: false;
    reason: SkillImportFailure;
    path?: string;
};
/**
 * Import one ZIP archive as a Team Skill.
 * @param bytes - the archive.
 * @returns the validated package, or the reason it was refused.
 */
export declare function importZipSkill(bytes: Uint8Array): SkillImportResult;
/**
 * Decode the browser's base64 file payloads into bytes.
 *
 * A folder picker cannot hand over a `File` object across the Remote boundary,
 * so it sends base64; this is the one place that decoding happens.
 * @param files - the payloads, with POSIX-relative paths.
 * @returns the decoded files.
 */
export declare function decodeImportFiles(files: readonly {
    readonly path: string;
    readonly base64: string;
}[]): ImportedFile[];
export {};
