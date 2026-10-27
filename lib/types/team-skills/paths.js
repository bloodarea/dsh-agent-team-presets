/**
 * Path rules for every Team Skill write.
 *
 * A Team Skill is a folder the user can import from anywhere — a ZIP they were
 * sent, a directory they exported from another tool — so the paths inside it
 * are untrusted. One module owns the whole judgement: what a legal relative
 * path looks like, how far a path may escape the asset root, and which bytes
 * count as text. Callers never re-implement it, because a second copy is how a
 * traversal check drifts from the write it was supposed to guard.
 * @module dsh-agent-team-presets/team-skills/paths
 */
import { lstat } from 'node:fs/promises';
import { lstatSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, join, parse, resolve, sep } from 'node:path';
/** Most files one Team Skill folder may hold. */
export const MAX_SKILL_FILES = 2000;
/** Most bytes one file may hold. */
export const MAX_SKILL_FILE_BYTES = 10 * 1024 * 1024;
/** Most bytes one Team Skill folder may hold. */
export const MAX_SKILL_BYTES = 64 * 1024 * 1024;
/** Longest relative path accepted, so a deep tree cannot exhaust path limits. */
export const MAX_SKILL_PATH_LENGTH = 512;
/** A refusal carrying the path that produced it. */
export class SkillPathError extends Error {
    reason;
    path;
    /**
     * @param reason - which rule the path broke.
     * @param path - the offending path, for the dialog.
     */
    constructor(reason, path) {
        super(`${reason}: ${path}`);
        this.reason = reason;
        this.path = path;
        this.name = 'SkillPathError';
    }
}
/**
 * Normalize one archive entry name into a POSIX-relative path.
 *
 * Every segment is checked, not just the whole string: `a/../b` is rejected
 * rather than collapsed, because collapsing is exactly how an importer talks
 * itself into accepting a traversal.
 * @param raw - the path as the archive or the browser reported it.
 * @returns the normalized relative path.
 * @throws {SkillPathError} when the path is absolute, escapes, or is malformed.
 */
export function normalizeSkillPath(raw) {
    const candidate = raw.replace(/^\.\//u, '');
    if (candidate === '')
        throw new SkillPathError('empty-path', raw);
    if (candidate.includes('\0'))
        throw new SkillPathError('nul-byte', raw);
    if (candidate.includes('\\'))
        throw new SkillPathError('backslash', raw);
    if (/^[A-Za-z]:/u.test(candidate))
        throw new SkillPathError('drive-letter', raw);
    if (candidate.startsWith('/'))
        throw new SkillPathError('absolute-path', raw);
    if (candidate.length > MAX_SKILL_PATH_LENGTH)
        throw new SkillPathError('too-long', raw);
    const segments = candidate.split('/');
    for (const segment of segments) {
        if (segment === '' || segment === '.')
            throw new SkillPathError('parent-traversal', raw);
        if (segment === '..')
            throw new SkillPathError('parent-traversal', raw);
    }
    return segments.join('/');
}
/**
 * Resolve one relative path under an asset root, proving it stays inside.
 *
 * The resolved absolute path is compared with the resolved root prefix rather
 * than with string concatenation, so neither `..` nor a platform separator can
 * produce a path that merely looks contained.
 * @param root - absolute asset root.
 * @param relative - a path already accepted by {@link normalizeSkillPath}.
 * @returns the absolute path inside the root.
 * @throws {SkillPathError} when the result would leave the root.
 */
export function resolveInside(root, relative) {
    const absoluteRoot = resolve(root);
    const target = resolve(absoluteRoot, normalizeSkillPath(relative));
    if (target !== absoluteRoot && !target.startsWith(`${absoluteRoot}${sep}`)) {
        throw new SkillPathError('symlink-escape', relative);
    }
    return target;
}
/**
 * Check one incoming file against the per-file limits.
 * @param path - normalized relative path.
 * @param bytes - decoded byte length.
 * @throws {SkillPathError} when the file is too large.
 */
export function checkFileSize(path, bytes) {
    if (bytes > MAX_SKILL_FILE_BYTES)
        throw new SkillPathError('file-too-large', path);
}
/**
 * Check a whole folder against the count, total-size, and duplicate rules.
 * @param files - every file of the folder, already decoded.
 * @returns the total byte length.
 * @throws {SkillPathError} when a limit is exceeded or a path repeats.
 */
export function checkFolder(files) {
    if (files.length === 0)
        throw new SkillPathError('empty-folder', '');
    if (files.length > MAX_SKILL_FILES)
        throw new SkillPathError('too-many-files', String(files.length));
    const seen = new Set();
    let total = 0;
    for (const file of files) {
        const path = normalizeSkillPath(file.path);
        if (seen.has(path))
            throw new SkillPathError('duplicate-path', path);
        seen.add(path);
        if (!Number.isSafeInteger(file.bytes) || file.bytes < 0)
            throw new SkillPathError('file-too-large', path);
        checkFileSize(file.path, file.bytes);
        total += file.bytes;
    }
    if (total > MAX_SKILL_BYTES)
        throw new SkillPathError('folder-too-large', String(total));
    return total;
}
/**
 * Whether one byte buffer is UTF-8 text this UI may edit.
 *
 * The decision is deliberately conservative: only a buffer with no NUL byte and
 * no invalid UTF-8 sequence is treated as editable text, so a binary asset is
 * previewed and replaced rather than silently corrupted by a text editor.
 * @param bytes - file content.
 * @returns whether the bytes are editable text.
 */
export function isTextBytes(bytes) {
    if (bytes.includes(0))
        return false;
    try {
        new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Render one skill id as a safe asset directory name.
 *
 * `skillId` is validated kebab-case by the importer, so this only has to refuse
 * the two names a filesystem cannot carry; it is still a real check rather than
 * a comment, because the store is also called with ids read back from disk.
 * @param skillId - kebab-case skill name.
 * @returns the directory name.
 * @throws {SkillPathError} when the id is not a safe directory name.
 */
export function assetDirectoryName(skillId) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(skillId))
        throw new SkillPathError('drive-letter', skillId);
    return skillId;
}
/**
 * Reject a symbolic link anywhere in one imported tree.
 *
 * A link is refused even when it points inside the folder: the link target is
 * resolved by the filesystem later, so accepting one would mean trusting a path
 * that can change after the check.
 * @param stats - the entry's `lstat` result.
 * @param path - its relative path.
 * @throws {SkillPathError} when the entry is a symbolic link.
 */
export function checkNotSymlink(stats, path) {
    if (stats.isSymbolicLink())
        throw new SkillPathError('symlink-escape', path);
}
/**
 * Pin the existing ancestors of a caller-selected root to their physical path.
 * A relocated home/package may have a symlink or junction in those ancestors.
 * The final root itself is deliberately not resolved: assertNoSymlinks still
 * rejects a link at that boundary, and at every descendant inside it.
 * Missing parent suffixes are retained for a fresh installation.
 */
export function canonicalRoot(path) {
    const absolute = resolve(path);
    try {
        const root = lstatSync(absolute);
        if (!root.isDirectory() && !root.isSymbolicLink())
            throw notDirectory(absolute);
    }
    catch (error) {
        if (error.code !== 'ENOENT')
            throw error;
    }
    let ancestor = dirname(absolute);
    const suffix = [basename(absolute)];
    for (;;) {
        try {
            const physical = realpathSync(ancestor);
            // Windows reports descendants of a file as missing; reject the file ancestor explicitly.
            if (!statSync(physical).isDirectory())
                throw notDirectory(ancestor);
            return join(physical, ...suffix);
        }
        catch (error) {
            if (error.code !== 'ENOENT' || dirname(ancestor) === ancestor)
                throw error;
            suffix.unshift(basename(ancestor));
            ancestor = dirname(ancestor);
        }
    }
}
/** Build the ENOTDIR refusal a regular-file ancestor produces on POSIX. */
function notDirectory(path) {
    const error = new Error(`ENOTDIR: not a directory, canonicalize '${path}'`);
    error.code = 'ENOTDIR';
    return error;
}
/** Reject actual symlinks in every existing component of an already pinned path. */
export async function assertNoSymlinks(path) {
    const absolute = resolve(path);
    const root = parse(absolute).root;
    let current = root;
    for (const segment of absolute.slice(root.length).split(sep).filter(Boolean)) {
        current = resolve(current, segment);
        try {
            checkNotSymlink(await lstat(current), current);
        }
        catch (error) {
            if (error.code === 'ENOENT')
                return;
            throw error;
        }
    }
}
