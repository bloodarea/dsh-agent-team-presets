/**
 * Post-build verification for a rebuilt card-patch bundle.
 *
 * Two independent questions have to be answered before an artifact may ship:
 * did the source patch land where it was supposed to, and does the built bundle
 * actually carry the service the integration page will look for? A patch can
 * apply cleanly to a moved region, and a build can succeed while the new module
 * is tree-shaken away; neither is visible from exit codes, so both are checked
 * against the files and the bundle themselves.
 *
 * The checks are deliberately structural, not textual-equality: the point is to
 * survive upstream edits unrelated to the badge interface, not to freeze the
 * target's source.
 */

/** The wrapper every DSH Client bundle is published inside. */
export const BUNDLE_LOADER = '__ModuleLoader__.load('

/** Sanity bounds: below 10 KB or above 32 MB is not a Client bundle. */
const MIN_BUNDLE_BYTES = 10 * 1024
const MAX_BUNDLE_BYTES = 32 * 1024 * 1024

/**
 * Size drift allowed against the published bundle of the same version.
 *
 * The patch adds one small module and a handful of props; anything outside this
 * window means the build picked up a different dependency graph, which is a
 * reason to look before shipping rather than a reason to trust the hash.
 */
const MIN_SIZE_RATIO = 0.9
const MAX_SIZE_RATIO = 1.5

/**
 * Escape a literal for use inside a regular expression.
 * @param {string} text - the literal.
 * @returns {string} the escaped literal.
 */
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Report every marker that is missing from the patched source.
 *
 * A missing file is reported as a missing marker rather than thrown: a
 * restructured upstream is exactly the outcome the operator must be told about
 * in one message, with the file names attached.
 * @param {ReadonlyMap<string, string>} files - relative path to source text.
 * @param {ReadonlyArray<{path: string, text: readonly string[]}>} markers - expectations.
 * @returns {string[]} one message per unmet expectation.
 */
export function missingSourceMarkers(files, markers) {
  const problems = []
  for (const marker of markers) {
    const text = files.get(marker.path)
    if (text === undefined) {
      problems.push(`the patch did not create ${marker.path}`)
      continue
    }
    for (const needle of marker.text) {
      if (!text.includes(needle)) problems.push(`${marker.path} does not contain ${JSON.stringify(needle)}`)
    }
  }
  return problems
}

/**
 * Report every reason a built bundle is not shippable.
 * @param {{text: string, service: string, publishedSize?: number}} input - the bundle text and its expectation.
 * @returns {string[]} one message per problem; empty means shippable.
 */
export function bundleProblems({ text, service, publishedSize }) {
  const problems = []
  if (typeof text !== 'string') return ['the built bundle could not be read as text']
  const bytes = Buffer.byteLength(text, 'utf8')
  if (bytes < MIN_BUNDLE_BYTES) problems.push(`the built bundle is only ${bytes} bytes`)
  if (bytes > MAX_BUNDLE_BYTES) problems.push(`the built bundle is ${bytes} bytes, above the 32 MB sanity bound`)
  if (!text.includes(BUNDLE_LOADER)) problems.push(`the built bundle is not wrapped in ${BUNDLE_LOADER}`)
  // Minifiers keep the string literal but choose quotes, so match any of them.
  const registration = new RegExp(`provide\\(\\s*[\`'"]?${escapeRegExp(service)}\\b`)
  if (!registration.test(text)) problems.push(`the built bundle never registers ${service} through ctx.provide`)
  if (publishedSize !== undefined && publishedSize > 0) {
    const ratio = bytes / publishedSize
    if (ratio < MIN_SIZE_RATIO || ratio > MAX_SIZE_RATIO) {
      problems.push(`the built bundle is ${ratio.toFixed(3)}× the published bundle's size, outside the ${MIN_SIZE_RATIO}–${MAX_SIZE_RATIO} band`)
    }
  }
  return problems
}

/**
 * Describe one verified rebuild for the operator, in one line.
 * @param {{id: string, version: string, patchedSha256: string}} entry - the produced entry.
 * @returns {string} the summary.
 */
export function describeEntry(entry) {
  return `${entry.id} ${entry.version} → ${entry.patchedSha256.slice(0, 12)}…`
}
