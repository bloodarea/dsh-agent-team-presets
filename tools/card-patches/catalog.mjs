/**
 * The card-patch catalog document: validation, rendering and merging.
 *
 * Two writers produce catalog entries — the compiled baseline in
 * `src/card-patches.ts`, and `tools/card-patches.mjs` when it rebuilds an
 * upstream version — and one reader consumes them, the Host at activation. Both
 * writers must therefore agree on every field, and the reader must be able to
 * reject a document it does not understand instead of acting on half of it.
 *
 * A malformed entry is a refusal, not a warning: an entry with a truncated hash
 * or a path-like asset name would otherwise reach the installer, where the only
 * remaining check is "does a file with this name exist". Validation here is the
 * boundary that keeps that from happening.
 */

/** Version of the on-disk document. A reader that does not know it must refuse. */
export const CATALOG_VERSION = 1

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PACKAGE = /^[a-z0-9][a-z0-9._-]*$/
const VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:\.[0-9A-Za-z]+)*)?$/
const ASSET = /^[a-z0-9][a-z0-9._-]*\.client\.js\.gz$/
const SERVICE = /^[A-Za-z_$][A-Za-z0-9_$]*$/
const DIGEST = /^[0-9a-f]{64}$/

/** Field order the document always uses, so two runs produce identical bytes. */
const FIELDS = ['id', 'packageName', 'version', 'source', 'asset', 'service', 'pristineSha256', 'patchedSha256']

/**
 * Name every problem that makes one entry unusable.
 * @param {unknown} entry - a parsed candidate.
 * @returns {string[]} one message per problem; empty means usable.
 */
export function targetEntryProblems(entry) {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) return ['the entry is not an object']
  const row = /** @type {Record<string, unknown>} */ (entry)
  const problems = []
  const text = (field, pattern, hint) => {
    const value = row[field]
    if (typeof value !== 'string' || !pattern.test(value)) problems.push(`${field} ${hint}: ${JSON.stringify(value)}`)
  }
  text('id', ID, 'must be lowercase words joined by hyphens')
  text('packageName', PACKAGE, 'must be a bare package name')
  text('version', VERSION, 'must be a semver version')
  text('asset', ASSET, 'must be a bare `<name>.client.js.gz` file name')
  text('service', SERVICE, 'must be a JavaScript identifier')
  text('pristineSha256', DIGEST, 'must be 64 lowercase hex characters')
  text('patchedSha256', DIGEST, 'must be 64 lowercase hex characters')
  if (typeof row.source !== 'string' || row.source.trim() === '' || /\s/.test(row.source)) {
    problems.push(`source must be one non-empty token: ${JSON.stringify(row.source)}`)
  }
  if (typeof row.pristineSha256 === 'string' && row.pristineSha256 === row.patchedSha256) {
    problems.push('pristineSha256 and patchedSha256 must differ, or the replacement would be the published build')
  }
  const extra = Object.keys(row).filter(key => !FIELDS.includes(key))
  if (extra.length > 0) problems.push(`unknown fields: ${extra.join(', ')}`)
  return problems
}

/**
 * Validate one entry and return it with a fixed field order.
 * @param {unknown} entry - a parsed candidate.
 * @returns {Readonly<Record<string, string>>} the normalized entry.
 * @throws when any field is unusable.
 */
export function normalizeEntry(entry) {
  const problems = targetEntryProblems(entry)
  if (problems.length > 0) throw new Error(`invalid card-patch target entry:\n  - ${problems.join('\n  - ')}`)
  return Object.freeze(Object.fromEntries(FIELDS.map(field => [field, /** @type {Record<string, string>} */ (entry)[field]])))
}

/**
 * Validate a list of entries, keeping the usable ones and naming the rest.
 *
 * The pipeline uses this when reading a catalog it is about to extend: an entry
 * it cannot parse must not be silently dropped from the document it rewrites.
 * @param {unknown} list - parsed candidates.
 * @param {{source: string, strict?: boolean}} options - provenance label for messages.
 * @returns {{entries: ReadonlyArray<Record<string, string>>, problems: string[]}}
 */
export function normalizeEntries(list, options) {
  if (!Array.isArray(list)) return { entries: [], problems: [`${options.source}: targets is not an array`] }
  const entries = []
  const problems = []
  for (const [index, candidate] of list.entries()) {
    try {
      entries.push(normalizeEntry(candidate))
    } catch (error) {
      const named = candidate !== null && typeof candidate === 'object' && 'id' in candidate ? String(candidate.id) : `#${index}`
      problems.push(`${options.source}: ${named}: ${error instanceof Error ? error.message : String(error)}`)
      if (options.strict === true) break
    }
  }
  return { entries, problems }
}

/**
 * Render the shipped catalog document.
 *
 * Entries are sorted by identity and fields are written in one fixed order, so
 * rebuilding an unchanged version rewrites identical bytes instead of a diff.
 * @param {ReadonlyArray<Record<string, string>>} entries - normalized entries.
 * @returns {string} the document text, newline-terminated.
 */
export function renderCatalogDocument(entries) {
  const sorted = [...entries].sort((left, right) => left.id.localeCompare(right.id))
  const targets = sorted.map(entry => normalizeEntry(entry))
  return `${JSON.stringify({ version: CATALOG_VERSION, targets }, null, 2)}\n`
}

/**
 * Parse a catalog document written by {@link renderCatalogDocument}.
 * @param {string} text - the document text.
 * @returns {ReadonlyArray<Record<string, string>>} normalized entries.
 * @throws when the document or any entry is unusable.
 */
export function parseCatalogDocument(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    throw new Error(`the card-patch catalog is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('the card-patch catalog is not an object')
  const document = /** @type {{version?: unknown, targets?: unknown}} */ (parsed)
  if (document.version !== CATALOG_VERSION) {
    throw new Error(`the card-patch catalog version is ${JSON.stringify(document.version)}, not ${CATALOG_VERSION}`)
  }
  const { entries, problems } = normalizeEntries(document.targets, { source: 'catalog' })
  if (problems.length > 0) throw new Error(problems.join('\n'))
  return entries
}

/**
 * Combine the compiled baseline with the shipped overlay.
 *
 * The key is identity **and** version, so adding a replacement for a newer
 * upstream version keeps the older ones: an installation still on 0.84.0 must
 * stay patchable after 0.84.1 ships. Rebuilding the same pair replaces it, and
 * pairs only the overlay mentions are appended in sorted order. Baseline order
 * is preserved, because that is the order the settings page shows.
 * @param {ReadonlyArray<Record<string, string>>} baseline - compiled entries.
 * @param {ReadonlyArray<Record<string, string>>} overlay - shipped entries.
 * @returns {ReadonlyArray<Record<string, string>>} merged entries.
 */
export function mergeCatalogTargets(baseline, overlay) {
  const key = entry => `${entry.id}@${entry.version}`
  const byKey = new Map(overlay.map(entry => [key(entry), entry]))
  const merged = baseline.map(entry => byKey.get(key(entry)) ?? entry)
  // Numeric collation, so appending 0.9.0 after 0.10.0 is impossible: "newest
  // last" is what the settings page and the version resolver rely on.
  for (const [entryKey, entry] of [...byKey].sort(([left], [right]) => left.localeCompare(right, 'en', { numeric: true }))) {
    if (!baseline.some(base => key(base) === entryKey)) merged.push(entry)
  }
  return merged
}
