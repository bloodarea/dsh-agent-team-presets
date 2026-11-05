/**
 * Release-integrity gate for the committed `lib/` artifact.
 *
 * WHY this gate exists: `lib/` is the SHIPPED artifact (`package.json#main` is
 * `lib/index.js` and `files` includes `lib`), yet nothing in this repository
 * proved that the committed build corresponds to the current `src/`. Baseline
 * finding B3 records that gap; baseline finding B1 is the damage it did — the
 * quarantine/privilege-escalation fix (commit c59cbd1) edited only `src/` and
 * `tests/`, so `lib/` stayed byte-identical to tag v0.1.6 and the 0.1.7
 * release would have shipped WITHOUT the security fix.
 *
 * WHY it asserts on symbols and their usage sites instead of a byte diff: the
 * build is NOT cross-platform reproducible. The committed `lib/client.js`
 * carries Windows path separators inside CSS-module style keys, so a Linux
 * rebuild differs by ~165 lines of style keys and hashed class names while
 * being semantically identical (baseline finding B2). A whole-file or
 * line-number snapshot would therefore fail spuriously on every legitimate
 * rebuild — it would be a change detector, not a contract. Instead this spec
 * extracts the literal sets and guard expressions from the committed bytes
 * with whitespace- and quote-normalized regexes: a real rebuild keeps passing,
 * while a stale artifact that predates a security fix fails loudly.
 *
 * WHAT it does NOT prove: it does not prove `lib/` was produced from the exact
 * current `src/` tree, it does not verify any non-security region of the
 * bundle, and it cannot catch a symbol that is present and referenced but
 * behaviorally wrong. It is deliberately a tripwire for "the shipped artifact
 * forgot the security fix", the one regression class that silently defeats a
 * release. The negative control at the bottom reads tag v0.1.6's `lib/index.js`
 * into a scratch file OUTSIDE the repository and proves this same extraction
 * rejects it, which is what makes the gate real rather than decorative.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '')
/** The shipped Host artifact, read from disk at test time — never imported from src and never built. */
const libSource = readFileSync(new URL('../lib/index.js', import.meta.url), 'utf8')

/** The ten fixed recovery tools a quarantined session-root captain may still reach. */
const EXPECTED_RECOVERY_TOOLS = [
  'get_team_preset',
  'update_team_preset',
  'send_message',
  'list_agents',
  'wait_agent',
  'interrupt_agent',
  'team_task_create',
  'team_task_get',
  'team_task_list',
  'team_task_update',
] as const

/** The skills this release ships under `assets/skills`. */
const EXPECTED_SKILL_IDS = [
  'github-repository-presentation',
  'git-release-hygiene',
  'grilling',
  'research',
] as const

/** Collapse whitespace and unify quote style so a rebuild that re-wraps or re-quotes the same code still matches. */
const normalize = (source: string): string => source.replace(/'/g, '"').replace(/\s+/g, ' ')

/**
 * Return the brace-balanced block whose opening `{` is the last character of
 * `anchor`'s match. Balances raw source so template-literal interpolations
 * (which are self-balanced) do not confuse the walk.
 */
function braceBlock(source: string, anchor: RegExp, label: string): string {
  const match = anchor.exec(source)
  if (match === null) throw new Error(`${label} is absent from the committed artifact`)
  const start = match.index + match[0].length - 1
  if (source[start] !== '{') throw new Error(`${label} anchor did not end at an opening brace`)
  let depth = 0
  for (let cursor = start; cursor < source.length; cursor += 1) {
    const char = source[cursor]
    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return source.slice(start, cursor + 1)
    }
  }
  throw new Error(`${label} block is unbalanced`)
}

/**
 * Extract the flat string-literal list of `const NAME = [...]` or
 * `const NAME = new Set([...])`. Throws when the declaration is missing or no
 * longer a pure literal list, so a computed or truncated set cannot slip by.
 */
function extractStringList(source: string, symbol: string): string[] {
  const pattern = new RegExp(`const\\s+${symbol}\\s*=\\s*(?:new\\s+Set\\s*\\(\\s*)?\\[([^\\]]*)\\]`)
  const match = pattern.exec(source)
  if (match === null) throw new Error(`${symbol} is not declared in the committed artifact`)
  const body = match[1] ?? ''
  const literals = [...body.matchAll(/["']([^"']*)["']/g)].map(row => row[1] ?? '')
  if (literals.length === 0) throw new Error(`${symbol} declaration carries no string literals`)
  const residual = body.replace(/["'][^"']*["']/g, '').replace(/[\s,]/g, '')
  if (residual !== '') throw new Error(`${symbol} declaration carries a non-literal entry: ${residual}`)
  return literals
}

/** Assert a literal list equals `expected` exactly: same members, same count, no duplicates. */
function expectExactSet(declared: string[], expected: readonly string[], symbol: string): void {
  const duplicates = declared.filter((value, index) => declared.indexOf(value) !== index)
  if (duplicates.length > 0) throw new Error(`${symbol} declares duplicates: ${duplicates.join(', ')}`)
  const missing = expected.filter(value => !declared.includes(value))
  const extra = declared.filter(value => !expected.includes(value))
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(`${symbol} drifted from the release contract — missing: [${missing.join(', ')}], unexpected: [${extra.join(', ')}]`)
  }
  if (declared.length !== expected.length) throw new Error(`${symbol} declares ${declared.length} entries, expected ${expected.length}`)
}

/** Assert the quarantine guard still consumes CAPTAIN_RECOVERY_TOOLS and is gated by the session-root check. */
function assertRecoveryGuardUsage(source: string): void {
  const text = normalize(source)
  // Capture whichever local holds the session-root verdict, so a rebuild that
  // renames the variable does not fail the gate; fall back to the inline form.
  const bound = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*isSessionRoot\(\s*agent\s*\)/.exec(text)
  const rootExpr = bound === null ? 'isSessionRoot\\(\\s*agent\\s*\\)' : `(?:${bound[1]}|isSessionRoot\\(\\s*agent\\s*\\))`
  // Exemption branch evaluates to undefined (void 0 / undefined); the refusal branch yields the reason.
  const guard = new RegExp(`guard\\(\\s*\\(\\s*exec\\s*\\)\\s*=>\\s*${rootExpr}\\s*&&\\s*CAPTAIN_RECOVERY_TOOLS\\.has\\(\\s*exec\\.name\\s*\\)\\s*\\?\\s*(?:void 0|undefined)\\s*:\\s*(?:state\\.reason|reason)`)
  if (!guard.test(text)) throw new Error('CAPTAIN_RECOVERY_TOOLS is declared but no quarantine guard is gated by the session-root check in a void-0/undefined-vs-reason ternary')
}

/** Assert hasTeamApplicationMarker exists, reads the real request header, and a usage site branches on it to quarantine. */
function assertMarkerGateUsage(source: string): void {
  const text = normalize(source)
  if (!/function\s+hasTeamApplicationMarker\s*\(\s*agent\s*\)\s*\{/.test(text)) throw new Error('hasTeamApplicationMarker is not declared as a function')
  const body = braceBlock(source, /function\s+hasTeamApplicationMarker\s*\(\s*agent\s*\)\s*\{/, 'hasTeamApplicationMarker')
  if (!/request\/header/.test(body) || !/TEAM_APPLICATION_MARKER/.test(body)) throw new Error('hasTeamApplicationMarker does not actually read the request-header Team marker')
  const bound = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*hasTeamApplicationMarker\(\s*agent\s*\)/.exec(text)
  if (bound === null) throw new Error('hasTeamApplicationMarker is never bound to a result at a call site')
  if (!new RegExp(`if\\s*\\(\\s*${bound[1]}\\s*\\)\\s*quarantine\\(`).test(text)) throw new Error('no branch quarantines on the hasTeamApplicationMarker result — a comment-only mention does not count')
}

/** Assert refuseTeam keeps the guard-presence belt-and-braces and the team-gone branch clears restoreFailures. */
function assertRefuseTeamGuard(source: string): void {
  // The refusal carries an optional member role now, so the anchor accepts one
  // extra parameter while still pinning the name and the first three arguments.
  const body = normalize(braceBlock(source, /const refuseTeam = \(agent, team, reason(?:,\s*[A-Za-z_$][\w$]*)?\) =>\s*\{/, 'refuseTeam'))
  const condition = /!applications\.has\(\s*agent\s*\)\s*&&\s*\(\s*!restoreFailures\.has\(\s*agent\s*\)\s*\|\|\s*!quarantines\.has\(\s*agent\s*\)\s*\)/
  if (!condition.test(body)) throw new Error('refuseTeam lost the guard-presence belt-and-braces (!restoreFailures.has || !quarantines.has)')
  if (!/quarantine\(\s*agent\s*,/.test(body)) throw new Error('refuseTeam no longer quarantines the refused agent')
  const goneBranch = normalize(braceBlock(source, /if\s*\(\s*team\s*===\s*(?:void 0|undefined)\s*\)\s*\{/, 'team === void 0 branch'))
  if (!/restoreFailures\.delete\(\s*agent\s*\)/.test(goneBranch)) throw new Error('the team === void 0 branch no longer clears restoreFailures.delete(agent)')
}

/** Read a historical `lib/index.js` from git into a scratch file OUTSIDE the repo, then read those bytes back. */
function readTaggedArtifact(tag: string): { path: string, content: string } {
  let raw: string
  try {
    raw = execFileSync('git', ['show', `${tag}:lib/index.js`], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  } catch (error) {
    throw new Error(`cannot read ${tag}:lib/index.js from git; the negative control needs tag ${tag} (try \`git fetch --tags\`). ${String(error)}`)
  }
  const path = join(tmpdir(), `dsh-team-presets-${tag}-lib-index.js`)
  writeFileSync(path, raw, 'utf8')
  // Assert on the bytes that come back from the scratch file, not on lib/.
  return { path, content: readFileSync(path, 'utf8') }
}

describe('committed lib artifact carries the 0.1.7 security contract', () => {
  it('ships CAPTAIN_RECOVERY_TOOLS as exactly the ten fixed recovery tools and consumes it in the session-root guard', () => {
    const declared = extractStringList(libSource, 'CAPTAIN_RECOVERY_TOOLS')
    expectExactSet(declared, EXPECTED_RECOVERY_TOOLS, 'CAPTAIN_RECOVERY_TOOLS')
    expect(declared).toHaveLength(EXPECTED_RECOVERY_TOOLS.length)
    expect(new Set(declared).size).toBe(declared.length)
    expect(() => assertRecoveryGuardUsage(libSource)).not.toThrow()
  })

  it('exposes hasTeamApplicationMarker and a real usage branch that quarantines on `marked`', () => {
    expect(() => assertMarkerGateUsage(libSource)).not.toThrow()
  })

  it('keeps refuseTeam gated on the guard still existing and clears restoreFailures when the team is gone', () => {
    expect(() => assertRefuseTeamGuard(libSource)).not.toThrow()
  })

  it('ships OFFICIAL_SKILL_IDS as exactly the four official skills', () => {
    const declared = extractStringList(libSource, 'OFFICIAL_SKILL_IDS')
    expectExactSet(declared, EXPECTED_SKILL_IDS, 'OFFICIAL_SKILL_IDS')
    expect(normalize(libSource)).toMatch(/for\s*\(\s*const\s+[A-Za-z_$][\w$]*\s+of\s+OFFICIAL_SKILL_IDS\s*\)/)
  })

  it('rejects the shipped v0.1.6 artifact, proving this gate catches a stale lib (baseline B1)', () => {
    const stale = readTaggedArtifact('v0.1.6')
    // The scratch copy must live outside the repository so nothing can overwrite lib/.
    expect(stale.path.startsWith(repoRoot + sep), stale.path).toBe(false)
    expect(stale.content).not.toBe(libSource)
    // Recovery set + its guard are the B1 fix: both must be absent from the old artifact.
    expect(() => extractStringList(stale.content, 'CAPTAIN_RECOVERY_TOOLS')).toThrow(/CAPTAIN_RECOVERY_TOOLS/)
    expect(() => assertRecoveryGuardUsage(stale.content)).toThrow()
    // The marker gate is the other half of the same fix.
    expect(() => assertMarkerGateUsage(stale.content)).toThrow(/hasTeamApplicationMarker/)
    // The restore-failure belt-and-braces also did not exist at v0.1.6.
    expect(() => assertRefuseTeamGuard(stale.content)).toThrow(/refuseTeam|restoreFailures/)
    // The skill set drifted since v0.1.6 (grilling/research absent), so exactness fails too.
    const staleSkillIds = extractStringList(stale.content, 'OFFICIAL_SKILL_IDS')
    expect(() => expectExactSet(staleSkillIds, EXPECTED_SKILL_IDS, 'OFFICIAL_SKILL_IDS')).toThrow(/OFFICIAL_SKILL_IDS/)
  })
})
