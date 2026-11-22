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

import { inflateRawSync } from 'node:zlib'
import { isAlias, isMap, isScalar, parseDocument, stringify } from 'yaml'
import type { Document } from 'yaml'
import {
  MAX_SKILL_FILE_BYTES, checkFolder, normalizeSkillPath, SkillPathError,
} from './paths.ts'
import type { SkillPathFailure } from './paths.ts'

/** The instruction file every Team Skill must carry. */
export const SKILL_FILE = 'SKILL.md'

/** Most bytes one ZIP may expand to, so a bomb cannot exhaust memory. */
export const MAX_ZIP_BYTES = 64 * 1024 * 1024

/** Most entries one ZIP may declare. */
export const MAX_ZIP_ENTRIES = 4000

/** Why one import was refused. */
export type SkillImportFailure =
  | 'invalid-zip'
  | 'encrypted-zip'
  | 'zip-bomb'
  | 'missing-skill-file'
  | 'invalid-frontmatter'
  | 'invalid-name'
  | 'missing-description'
  | SkillPathFailure

/** One file of an imported folder, decoded. */
export interface ImportedFile {
  /** POSIX-relative path. */
  readonly path: string
  /** Raw bytes. */
  readonly bytes: Uint8Array
}

/** One validated Team Skill folder. */
export interface SkillPackage {
  /** Kebab-case name from the frontmatter; also the default directory name. */
  readonly name: string
  /** Description from the frontmatter. */
  readonly description: string
  /** Every file, path-ordered. */
  readonly files: readonly ImportedFile[]
  /** Total byte length. */
  readonly totalBytes: number
}

const DEPENDENCY_FRONTMATTER_FIELDS = ['executables', 'mcpServers', 'otherSkills'] as const

/** An unsupported dependency key explicitly present in `SKILL.md` frontmatter. */
export interface SkillDependencyWarning {
  readonly code: 'unsupported-dependency-frontmatter'
  readonly field: (typeof DEPENDENCY_FRONTMATTER_FIELDS)[number]
}

/** Result of one import attempt. */
export type SkillImportResult =
  | {
    readonly ok: true
    readonly skill: SkillPackage
    readonly warnings: readonly string[]
    readonly dependencyWarnings: readonly SkillDependencyWarning[]
  }
  | { readonly ok: false; readonly reason: SkillImportFailure; readonly path?: string }

/** The kebab-case grammar the official skill registry enforces. */
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

/** Read the frontmatter and retain the location of the YAML source. */
function readSkillFrontmatter(text: string, keepSourceTokens = false) {
  const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/du.exec(text)
  const range = match?.indices?.[1]
  if (match?.[1] === undefined || range === undefined) return undefined
  try {
    const document = parseDocument(match[1], { uniqueKeys: true, keepSourceTokens })
    if (document.errors.length > 0) return undefined
    const value: unknown = document.toJS({ maxAliasCount: 100 })
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined
    const fields = value as Record<string, unknown>
    return {
      document,
      yamlStart: range[0],
      name: typeof fields['name'] === 'string' ? fields['name'] : '',
      description: typeof fields['description'] === 'string' ? fields['description'] : '',
    }
  } catch {
    return undefined
  }
}

/** Find an explicitly written top-level field without following YAML merges. */
function explicitField(document: Document.Parsed, field: string) {
  if (!isMap(document.contents)) return undefined
  return document.contents.items.findLast(({ key }) => {
    const resolved = isAlias(key) ? key.resolve(document) : key
    return isScalar(resolved) && resolved.value === field
  })
}

/**
 * Parse the two required Agent Skills fields from `SKILL.md`.
 * @param text - the whole document.
 * @returns the required fields, or undefined when the frontmatter cannot be parsed.
 */
export function parseSkillFrontmatter(text: string): { name: string; description: string } | undefined {
  const frontmatter = readSkillFrontmatter(text)
  if (frontmatter === undefined) return undefined
  return { name: frontmatter.name, description: frontmatter.description }
}

/**
 * Validate one decoded folder as a Team Skill.
 *
 * @param input - the files a caller wants to install.
 * @returns the validated package, or the reason it is not one.
 */
export function buildSkillPackage(input: readonly ImportedFile[]): SkillImportResult {
  let files: ImportedFile[]
  try {
    files = input.map(file => ({ path: normalizeSkillPath(file.path), bytes: file.bytes }))
    checkFolder(files.map(file => ({ path: file.path, bytes: file.bytes.byteLength })))
  } catch (error: unknown) {
    if (error instanceof SkillPathError) return { ok: false, reason: error.reason, path: error.path }
    throw error
  }
  // The instruction file leads the listing: every reader looks for it first,
  // and the rest keeps a stable lexical order.
  const ordered = [...files].sort((left, right) => {
    if (left.path === SKILL_FILE) return -1
    if (right.path === SKILL_FILE) return 1
    return left.path.localeCompare(right.path)
  })
  const instruction = ordered.find(file => file.path === SKILL_FILE)
  if (instruction === undefined) return { ok: false, reason: 'missing-skill-file', path: SKILL_FILE }
  let text: string
  try {
    text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(instruction.bytes)
  } catch {
    return { ok: false, reason: 'invalid-frontmatter', path: SKILL_FILE }
  }
  const frontmatter = readSkillFrontmatter(text)
  if (frontmatter === undefined) return { ok: false, reason: 'invalid-frontmatter', path: SKILL_FILE }
  if (!SKILL_NAME.test(frontmatter.name)) return { ok: false, reason: 'invalid-name', path: SKILL_FILE }
  if (frontmatter.description.trim() === '') return { ok: false, reason: 'missing-description', path: SKILL_FILE }
  const dependencyWarnings = DEPENDENCY_FRONTMATTER_FIELDS
    .filter(field => explicitField(frontmatter.document, field) !== undefined)
    .map<SkillDependencyWarning>(field => ({ code: 'unsupported-dependency-frontmatter', field }))
  const totalBytes = ordered.reduce((sum, file) => sum + file.bytes.byteLength, 0)
  const warnings: string[] = []
  // Advisory only: a script is legitimate content, and refusing it would break
  // the resources a real skill needs. The dialog still tells the user what the
  // folder will carry before they confirm.
  const scripts = ordered.filter(file => /\.(?:py|sh|ps1|bat|cmd)$/u.test(file.path))
  if (scripts.length > 0) {
    warnings.push(`this skill carries ${String(scripts.length)} script file(s); nothing is executed on import`)
  }
  return {
    ok: true,
    skill: { name: frontmatter.name, description: frontmatter.description, files: ordered, totalBytes },
    warnings,
    dependencyWarnings,
  }
}

/**
 * Rename an already validated Team Skill package for a new copy.
 * @param package_ - the source package, whose files are left intact.
 * @param name - the new kebab-case name.
 * @returns the renamed package, with only the instruction file changed.
 */
export function renameSkillPackage(package_: SkillPackage, name: string): SkillPackage {
  if (!SKILL_NAME.test(name)) throw new Error(`invalid Team Skill name: ${name}`)
  const instruction = package_.files.find(file => file.path === SKILL_FILE)
  if (instruction === undefined) throw new Error(`missing ${SKILL_FILE}`)
  const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(instruction.bytes)
  const frontmatter = readSkillFrontmatter(text, true)
  if (frontmatter === undefined || !SKILL_NAME.test(frontmatter.name)) throw new Error(`invalid skill name in ${SKILL_FILE}`)
  if (frontmatter.name === name && package_.name === name) return package_

  const { document, yamlStart } = frontmatter
  const node = explicitField(document, 'name')?.value
  let replacement = stringify(name, { version: document.directives.yaml.version }).trimEnd()
  let start: number
  let end: number
  if ((isScalar(node) || isAlias(node)) && node.range !== undefined) {
    [start, end] = node.range
  } else if (isMap(document.contents) && document.contents.range !== undefined) {
    // A YAML merge can supply the name. Override it without editing the anchor.
    start = document.contents.range[0]
    if (document.contents.flow) {
      start += 1
      replacement = `name: ${replacement}, `
    } else {
      const keyStart = yamlStart + start
      const lineStart = text.lastIndexOf('\n', keyStart - 1) + 1
      const indent = text.slice(lineStart, keyStart)
      const newline = text[lineStart - 2] === '\r' ? '\r\n' : '\n'
      replacement = `name: ${replacement}${newline}${indent}`
    }
    end = start
  } else {
    throw new Error(`cannot locate name in ${SKILL_FILE}`)
  }
  if (isScalar(node) && node.srcToken?.type === 'block-scalar') {
    // Change the one name in the scalar body. Its header can carry a comment.
    const { source } = node.srcToken
    const offset = source.indexOf(frontmatter.name)
    if (offset < 0) throw new Error(`cannot locate name in ${SKILL_FILE}`)
    start = end - source.length + offset
    end = start + frontmatter.name.length
    replacement = name
  } else if (isScalar(node) && node.type === 'QUOTE_SINGLE') {
    replacement = `'${name}'`
  } else if (isScalar(node) && node.type === 'QUOTE_DOUBLE') {
    replacement = JSON.stringify(name)
  }
  const renamed = text.slice(0, yamlStart + start) + replacement + text.slice(yamlStart + end)
  const files = package_.files.map(file => file === instruction
    ? { path: file.path, bytes: new TextEncoder().encode(renamed) }
    : file)
  const result = buildSkillPackage(files)
  if (!result.ok) throw new Error(`invalid renamed Team Skill: ${result.reason}`)
  if (result.skill.name !== name) throw new Error(`could not rename ${SKILL_FILE} to ${name}`)
  return result.skill
}

/** One entry of a parsed ZIP central directory. */
interface ZipEntry {
  readonly path: string
  readonly method: number
  readonly compressedSize: number
  readonly uncompressedSize: number
  readonly localHeaderOffset: number
  readonly encrypted: boolean
}

/**
 * Read the central directory of one ZIP archive.
 *
 * Only the two methods a browser or `zip -r` actually produces are supported:
 * stored and deflate. Anything else is refused rather than guessed at, and an
 * encrypted entry is refused before any inflation is attempted.
 * @param bytes - the whole archive.
 * @returns the declared entries.
 * @throws {SkillPathError} when the archive is malformed.
 */
function readCentralDirectory(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  // The end-of-central-directory record is followed by a comment of at most
  // 64 KiB, so the search only has to cover that tail.
  let eocd = -1
  for (let at = bytes.length - 22; at >= Math.max(0, bytes.length - 22 - 0xffff); at -= 1) {
    if (view.getUint32(at, true) === 0x06054b50) { eocd = at; break }
  }
  if (eocd < 0) throw new SkillPathError('empty-path', 'zip:eocd')
  const count = view.getUint16(eocd + 10, true)
  const offset = view.getUint32(eocd + 16, true)
  if (count > MAX_ZIP_ENTRIES) throw new SkillPathError('too-many-files', 'zip:entries')
  const entries: ZipEntry[] = []
  let cursor = offset
  for (let index = 0; index < count; index += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) throw new SkillPathError('empty-path', `zip:entry:${String(index)}`)
    const flags = view.getUint16(cursor + 8, true)
    const method = view.getUint16(cursor + 10, true)
    const compressedSize = view.getUint32(cursor + 20, true)
    const uncompressedSize = view.getUint32(cursor + 24, true)
    const nameLength = view.getUint16(cursor + 28, true)
    const extraLength = view.getUint16(cursor + 30, true)
    const commentLength = view.getUint16(cursor + 32, true)
    const localHeaderOffset = view.getUint32(cursor + 42, true)
    const name = new TextDecoder('utf-8').decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength))
    cursor += 46 + nameLength + extraLength + commentLength
    // Directory entries are implied by the file paths; a trailing slash is the
    // only marker, and it carries no bytes of its own.
    if (name.endsWith('/')) continue
    entries.push({
      path: name,
      method,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
      encrypted: (flags & 0x1) !== 0,
    })
  }
  return entries
}

/**
 * Inflate one entry's bytes from the local file header.
 * @param bytes - the whole archive.
 * @param entry - its central-directory record.
 * @returns the decoded bytes.
 * @throws {SkillPathError} when the entry cannot be decoded within its limits.
 */
function readEntry(bytes: Uint8Array, entry: ZipEntry): Uint8Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const at = entry.localHeaderOffset
  if (view.getUint32(at, true) !== 0x04034b50) throw new SkillPathError('empty-path', `zip:local:${entry.path}`)
  const nameLength = view.getUint16(at + 26, true)
  const extraLength = view.getUint16(at + 28, true)
  const start = at + 30 + nameLength + extraLength
  if (entry.uncompressedSize > MAX_SKILL_FILE_BYTES || entry.compressedSize > MAX_SKILL_FILE_BYTES) {
    throw new SkillPathError('file-too-large', entry.path)
  }
  const end = start + entry.compressedSize
  if (end > bytes.byteLength) throw new SkillPathError('empty-path', `zip:range:${entry.path}`)
  const compressed = bytes.subarray(start, end)
  // A stored entry has no decompression to correct a lie: both sizes must
  // agree, or a small declared size could smuggle a large shared data block.
  if (entry.method === 0) {
    if (entry.compressedSize !== entry.uncompressedSize) throw new SkillPathError('file-too-large', entry.path)
    return compressed.slice()
  }
  if (entry.method !== 8) throw new SkillPathError('empty-path', `zip:method:${entry.path}`)
  const inflated = inflateRawSync(compressed, { maxOutputLength: MAX_SKILL_FILE_BYTES })
  // A liars' archive declares a small size and expands past it: the declared
  // and the actual length must both be inside the limit.
  if (inflated.byteLength !== entry.uncompressedSize) throw new SkillPathError('file-too-large', entry.path)
  return new Uint8Array(inflated)
}

/**
 * Read one ZIP archive as an imported folder.
 *
 * The total expansion is bounded before anything is inflated, so a bomb is
 * refused on its declared sizes even when every entry looks reasonable.
 * @param bytes - the whole archive.
 * @returns the decoded files, or the reason the archive was refused.
 */
export function readZip(bytes: Uint8Array): { ok: true; files: ImportedFile[] } | { ok: false; reason: SkillImportFailure; path?: string } {
  let entries: ZipEntry[]
  try {
    entries = readCentralDirectory(bytes)
  } catch (error: unknown) {
    if (error instanceof SkillPathError) {
      return { ok: false, reason: error.reason === 'too-many-files' ? 'zip-bomb' : 'invalid-zip', path: error.path }
    }
    return { ok: false, reason: 'invalid-zip' }
  }
  if (entries.some(entry => entry.encrypted)) return { ok: false, reason: 'encrypted-zip' }
  const declared = entries.reduce((sum, entry) => sum + entry.uncompressedSize, 0)
  if (declared > MAX_ZIP_BYTES) return { ok: false, reason: 'zip-bomb' }
  const files: ImportedFile[] = []
  let actual = 0
  try {
    for (const entry of entries) {
      const file = readEntry(bytes, entry)
      // The declared sizes passed the pre-check above; the bytes actually
      // decoded are the only fact that cannot be inflated by a central
      // directory that reuses one data block.
      actual += file.byteLength
      if (actual > MAX_ZIP_BYTES) throw new SkillPathError('folder-too-large', entry.path)
      files.push({ path: entry.path, bytes: file })
    }
  } catch (error: unknown) {
    if (error instanceof SkillPathError) {
      return { ok: false, reason: error.reason === 'file-too-large' ? 'zip-bomb' : 'invalid-zip', path: error.path }
    }
    return { ok: false, reason: 'invalid-zip' }
  }
  return { ok: true, files }
}

/**
 * Import one ZIP archive as a Team Skill.
 * @param bytes - the archive.
 * @returns the validated package, or the reason it was refused.
 */
export function importZipSkill(bytes: Uint8Array): SkillImportResult {
  const archive = readZip(bytes)
  if (!archive.ok) return archive
  return buildSkillPackage(archive.files)
}

/**
 * Decode the browser's base64 file payloads into bytes.
 *
 * A folder picker cannot hand over a `File` object across the Remote boundary,
 * so it sends base64; this is the one place that decoding happens.
 * @param files - the payloads, with POSIX-relative paths.
 * @returns the decoded files.
 */
export function decodeImportFiles(files: readonly { readonly path: string; readonly base64: string }[]): ImportedFile[] {
  return files.map(file => ({ path: file.path, bytes: new Uint8Array(Buffer.from(file.base64, 'base64')) }))
}
