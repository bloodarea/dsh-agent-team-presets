/**
 * Static regression guard for the 2026-10-19 light/dark theme repair.
 *
 * The bug this prevents: the client stylesheets referenced five alias names that
 * the Harness theme never defines —
 *
 *   --dsw-alias-line-regular          --dsw-alias-bg-elevated
 *   --dsw-alias-line-subtle           --dsw-alias-bg-subtle
 *   --dsw-alias-interactive-bg-selected
 *
 * — and every use was written with a light-only literal fallback, e.g.
 * `var(--dsw-alias-line-regular, #d6d9df)` / `var(--dsw-alias-bg-elevated, #fff)`.
 * An undefined custom property makes the fallback win, so in dark theme the plugin
 * painted near-white text (`--dsw-alias-label-*` does flip with the theme) onto a
 * white surface: rows measured `rgb(255, 255, 255)` backgrounds under an
 * `rgb(231, 236, 247)` title. Hard-coded light palettes on the Team Skill page had
 * the same effect. The bug comes back the moment an undefined alias name or a
 * literal colour re-enters the stylesheets, so both are guarded here against
 * `docs/internal/audit/2026-10-19-dark-mode/TOKEN-CONTRACT.md`.
 *
 * No DOM test can observe a theme, and the real proof remains the Lead's two-theme
 * pass on the live GUI. This file is the static half: it reads the stylesheets and
 * the one TSX file that carried inline colours, and fails loudly (file, line and
 * offending token/literal) on the two shapes that caused the bug. Pure file reads —
 * no DOM, no build, no network, deterministic.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const srcRoot = join(repoRoot, 'src')

/* ------------------------------------------------------------------------- *
 * The contract: token allowlist
 * ------------------------------------------------------------------------- */

/**
 * Every `--dsw-*` name a stylesheet may reference (`TOKEN-CONTRACT.md`,
 * "Allowed tokens"). These are real alias/token names: the stock Harness theme
 * and the installed skin both re-map them per theme. Anything else beginning
 * with `--dsw-` is undefined at runtime, so its `var()` fallback silently paints
 * the light literal — the white-on-white bug.
 * `--dsw-radius-*` is kept from the contract's "radii/fonts unchanged" clause.
 */
const ALLOWED_TOKENS: ReadonlySet<string> = new Set([
  // text
  '--dsw-alias-label-primary',
  '--dsw-alias-label-secondary',
  '--dsw-alias-label-tertiary',
  '--dsw-alias-label-caption',
  '--dsw-alias-label-dimmed',
  // surfaces
  '--dsw-alias-bg-base',
  '--dsw-alias-bg-layer-1',
  '--dsw-alias-bg-layer-2',
  '--dsw-alias-bg-layer-3',
  '--dsw-alias-settings-card-fill',
  '--dsw-alias-settings-card-stroke',
  '--dsw-alias-scrollbar-bg-l2',
  '--dsw-alias-scrollbar-hover-l2',
  '--dsw-elevation-stroke-color',
  '--dsw-specific-input-major',
  '--dsw-specific-menu',
  '--dsw-menu-backdrop-filter',
  '--dsw-alias-markdown-code-block',
  // borders
  '--dsw-alias-border-l1',
  '--dsw-alias-border-l2',
  '--dsw-alias-border-l3',
  '--dsw-alias-border-l4',
  // interaction
  '--dsw-alias-interactive-bg-hover',
  '--dsw-alias-interactive-bg-active',
  '--dsw-focus-ring-color',
  // semantic
  '--dsw-alias-state-business-primary',
  '--dsw-alias-state-business-tertiary',
  '--dsw-alias-state-warn-label',
  '--dsw-alias-state-warn-primary',
  '--dsw-alias-state-warn-tertiary',
  '--dsw-alias-state-error-primary',
  '--dsw-alias-state-success-primary',
  '--dsw-alias-state-success-tertiary',
  '--dsw-alias-bg-mask-2',
  // shadows / elevation
  '--dsw-shadow-lv2',
  '--dsw-shadow-lv3',
  '--dsw-elevation-panel',
  '--dsw-elevation-prominent',
  // radii (unchanged by the contract)
  '--dsw-radius-sm',
  '--dsw-radius-md',
  '--dsw-radius-lg',
  '--dsw-radius-xl',
])

/**
 * The five names verified as undefined in the running Harness. Rejected
 * separately from the generic allowlist so the failure names the root cause
 * instead of just "not in the list".
 */
const FORBIDDEN_TOKENS: readonly string[] = [
  '--dsw-alias-line-regular',
  '--dsw-alias-line-subtle',
  '--dsw-alias-bg-elevated',
  '--dsw-alias-bg-subtle',
  '--dsw-alias-interactive-bg-selected',
]

/* ------------------------------------------------------------------------- *
 * Helpers
 * ------------------------------------------------------------------------- */

/** Every `.css` file under `src/`, recursively, in deterministic order. */
function cssFiles(): string[] {
  const found: string[] = []
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.isFile() && entry.name.endsWith('.css')) found.push(full)
    }
  }
  walk(srcRoot)
  return found.sort()
}

/** `src/client/Foo.module.css` — stable, workspace-relative path for messages. */
function relPath(file: string): string {
  return relative(repoRoot, file).split('\\').join('/')
}

/** 1-based line of a character index. */
function lineOf(text: string, index: number): number {
  let line = 1
  for (let at = 0; at < index && at < text.length; at++) {
    if (text.charCodeAt(at) === 10) line += 1
  }
  return line
}

/**
 * Replace comment bodies with spaces while keeping newlines, so indices and line
 * numbers stay identical. Comments must not trip the colour scan: the stylesheets
 * document the percent-encoded chevron colour (`%23818a96`) in prose.
 */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' '))
}

interface Rule {
  selector: string
  start: number
  end: number
  body: string
}

/**
 * Innermost `selector { body }` blocks. Nested `@media` blocks are handled
 * because the body of such an outer block contains braces and therefore never
 * matches; the inner rule does.
 */
function rules(css: string): Rule[] {
  const found: Rule[] = []
  const pattern = /([^{}]*)\{([^{}]*)\}/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(css)) !== null) {
    const selector = (match[1] ?? '').trim()
    const body = match[2] ?? ''
    if (selector.length === 0) continue
    const start = match.index + (match[1] ?? '').length + 1
    found.push({ selector, start, end: start + body.length, body })
  }
  return found
}

/**
 * CSS named colours. `transparent` is deliberately absent: it is theme-neutral and
 * the contract's own `color-mix(..., transparent)` recipes use it. `currentColor`
 * is likewise a keyword, not a literal.
 */
const NAMED_COLOURS: readonly string[] = [
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque',
  'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood',
  'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk',
  'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray',
  'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
  'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
  'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise',
  'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue',
  'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro',
  'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey',
  'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
  'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral',
  'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey',
  'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
  'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen',
  'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue',
  'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue',
  'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue',
  'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace',
  'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
  'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff',
  'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red',
  'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
  'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray',
  'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle',
  'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow',
  'yellowgreen',
]

interface ColourLiteral {
  index: number
  literal: string
}

/** Longest alternatives first so `blue` cannot shadow `blueviolet`. */
const NAMED_COLOUR_PATTERN = [...NAMED_COLOURS]
  .sort((left, right) => right.length - left.length)
  .join('|')

/**
 * Hex, `rgb(`/`rgba(`/`hsl(`/`hsla(` and standalone CSS named colours.
 * Leading/trailing `[\w-]` guards keep `white-space`, `--tp-accent-violet`,
 * `color-mix(in srgb, ...)` and other keywords out of the result.
 */
function colourLiterals(css: string): ColourLiteral[] {
  const found: ColourLiteral[] = []
  for (const match of css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    if (match.index !== undefined) found.push({ index: match.index, literal: match[0] })
  }
  // Relative colours derive their channels from a theme token, not literals.
  for (const match of css.matchAll(/(?:^|[^\w-])((?:rgba?|hsla?)\()(?!\s*from\s+var\()/gi)) {
    if (match.index !== undefined) {
      found.push({ index: match.index + (match[0].length - (match[1] ?? '').length), literal: match[1] ?? '' })
    }
  }
  for (const match of css.matchAll(new RegExp(`(?:^|[^\\w-])(${NAMED_COLOUR_PATTERN})(?![\\w-])`, 'gi'))) {
    if (match.index !== undefined) {
      found.push({ index: match.index + (match[0].length - (match[1] ?? '').length), literal: match[1] ?? '' })
    }
  }
  return found.sort((left, right) => left.index - right.index)
}

interface Violation {
  file: string
  line: number
  detail: string
}

/** One readable report line per violation, or `''` when the contract holds. */
function report(violations: readonly Violation[]): string {
  if (violations.length === 0) return ''
  return [
    `${violations.length} theme-contract violation(s):`,
    ...violations.map(row => `  ${row.file}:${row.line}  ${row.detail}`),
  ].join('\n')
}

/* ------------------------------------------------------------------------- *
 * 1. Only contract tokens may be referenced
 * ------------------------------------------------------------------------- */

interface TokenReference {
  file: string
  line: number
  token: string
}

function tokenReferences(): TokenReference[] {
  const found: TokenReference[] = []
  for (const file of cssFiles()) {
    const css = stripComments(readFileSync(file, 'utf8'))
    for (const match of css.matchAll(/var\(\s*(--dsw-[a-z0-9-]+)/gi)) {
      if (match.index === undefined) continue
      found.push({ file: relPath(file), line: lineOf(css, match.index), token: match[1] ?? '' })
    }
  }
  return found
}

describe('theme token allowlist', () => {
  it('finds the stylesheets it claims to guard', () => {
    const files = cssFiles().map(relPath)
    expect(files.length, 'the src/**/*.css walk must see the plugin stylesheets').toBeGreaterThanOrEqual(3)
    expect(files).toContain('src/client/ComposerTeamSelect.module.css')
    expect(files).toContain('src/client/TeamPresetsSection.module.css')
    expect(files).toContain('src/client/TeamSkillsView.module.css')
  })

  it('references only tokens the theme contract defines', () => {
    const offenders = tokenReferences()
      .filter(row => !ALLOWED_TOKENS.has(row.token))
      .map(row => ({
        file: row.file,
        line: row.line,
        detail: `references --dsw token "${row.token}", which is not in the 0.2.x allowlist (it falls back to the literal and breaks dark theme)`,
      }))
    expect(report(offenders)).toBe('')
  })

  it('never references the five alias names the Harness does not define', () => {
    const forbidden = new Set(FORBIDDEN_TOKENS)
    const offenders = tokenReferences()
      .filter(row => forbidden.has(row.token))
      .map(row => ({
        file: row.file,
        line: row.line,
        detail: `references "${row.token}", one of the five alias names the Harness theme never defines — use --dsw-alias-border-l1/l2/l3, --dsw-alias-bg-layer-1/2, --dsw-specific-menu or --dsw-alias-interactive-bg-active instead`,
      }))
    expect(report(offenders)).toBe('')
  })
})

/* ------------------------------------------------------------------------- *
 * 2. No literal colours outside the two documented brand markings
 * ------------------------------------------------------------------------- */

/** The one literal hue allowed in a stylesheet, declared at most once per file. */
const ACCENT_DECLARATION = '--tp-accent-violet'
const ACCENT_VALUE = '#8d6bff'

function literalColourViolations(): Violation[] {
  const violations: Violation[] = []

  for (const file of cssFiles()) {
    const css = stripComments(readFileSync(file, 'utf8'))
    const rel = relPath(file)

    // Allowance 1: one `--tp-accent-violet: #8d6bff;` declaration per stylesheet.
    const accentPattern = /--tp-accent-violet\s*:\s*(#[0-9a-fA-F]{3,8})\s*;?/g
    const accentSpans: Array<{ start: number; end: number; value: string }> = []
    for (const match of css.matchAll(accentPattern)) {
      if (match.index === undefined) continue
      accentSpans.push({ start: match.index, end: match.index + match[0].length, value: (match[1] ?? '').toLowerCase() })
    }
    if (accentSpans.length > 1) {
      violations.push({
        file: rel,
        line: lineOf(css, accentSpans[0]!.start),
        detail: `${ACCENT_DECLARATION} is declared ${accentSpans.length} times; the contract allows one declaration per stylesheet`,
      })
    }
    for (const span of accentSpans) {
      if (span.value !== ACCENT_VALUE) {
        violations.push({
          file: rel,
          line: lineOf(css, span.start),
          detail: `${ACCENT_DECLARATION} must be exactly ${ACCENT_VALUE}, found ${span.value}`,
        })
      }
    }
    // Allowance 2: `.dot` / `.dotCustom` may each carry one brand colour.
    const brandBlocks = rules(css).filter(rule => rule.selector === '.dot' || rule.selector === '.dotCustom')
    const allowedBrandLiterals = new Set<number>()
    for (const block of brandBlocks) {
      const bodyLiterals = colourLiterals(block.body)
      if (bodyLiterals.length > 0) allowedBrandLiterals.add(block.start + bodyLiterals[0]!.index)
    }

    for (const match of colourLiterals(css)) {
      // The one hex inside the accent declaration is matched by index inside its span.
      if (accentSpans.some(span => match.index >= span.start && match.index < span.end)) continue
      if (allowedBrandLiterals.has(match.index)) continue
      violations.push({
        file: rel,
        line: lineOf(css, match.index),
        detail: `literal colour "${match.literal}" — colours must come from a --dsw-* token or color-mix() of tokens (only ${ACCENT_DECLARATION}: ${ACCENT_VALUE} and one .dot/.dotCustom brand colour are allowed)`,
      })
    }
  }

  return violations
}

describe('no literal colours in stylesheets', () => {
  it('resolves every colour through a theme token', () => {
    expect(report(literalColourViolations())).toBe('')
  })
})

/* ------------------------------------------------------------------------- *
 * 3. Custom popovers reuse the permission-menu hue with a fully opaque fill
 * ------------------------------------------------------------------------- */

const composerPath = join(srcRoot, 'client', 'ComposerTeamSelect.module.css')

describe.each([
  [composerPath, '.popover'],
  [join(srcRoot, 'client', 'TeamPresetsSection.module.css'), '.selectPop'],
])('opaque desktop popover: %s', (path, selector) => {
  const source = readFileSync(path, 'utf8')
  const popover = rules(stripComments(source)).find(rule => rule.selector === selector)

  it('keeps a solid themed fallback before the opaque menu colour', () => {
    expect(popover?.body, `${path} needs a ${selector} rule`).toBeDefined()
    expect(popover?.body).toMatch(/background:\s*var\(--dsw-alias-bg-layer-3\);[\s\S]*background:\s*rgb\(from var\(--dsw-specific-menu, var\(--dsw-alias-bg-layer-3\)\) r g b \/ 1\);/)
  })

  it('paints the permission-menu hue at full opacity, with no blur dependency', () => {
    // `rgb(from ... r g b / 1)` keeps the menu's channels and strips the alpha
    // that would let conversation text bleed through on a compositor that
    // ignores backdrop filtering.
    expect(popover?.body).toContain('rgb(from var(--dsw-specific-menu, var(--dsw-alias-bg-layer-3)) r g b / 1)')
    expect(source).not.toContain('backdrop-filter')
    expect(source).not.toMatch(/rgb\(from [^;]*\/ 0?\.\d+\)/)
  })

  it('no longer reaches for the undefined elevated-surface alias', () => {
    expect(source).not.toContain('--dsw-alias-bg-elevated')
  })
})

/* ------------------------------------------------------------------------- *
 * 4. TeamSkillsView.tsx carries no inline colour on the blocked-assignment box
 * ------------------------------------------------------------------------- */

const skillsViewPath = join(srcRoot, 'client', 'TeamSkillsView.tsx')
const skillsCssPath = join(srcRoot, 'client', 'TeamSkillsView.module.css')

interface NoticeWindow {
  /** Offset of the window in the original file, so lines can be recovered. */
  start: number
  text: string
}

/**
 * The JSX around each `missing.length > 0` decision, wide enough to cover the
 * notice element it renders (which is where the inline error colours lived).
 */
function blockedNoticeWindows(source: string): NoticeWindow[] {
  const windows: NoticeWindow[] = []
  const needle = 'missing.length > 0'
  let from = 0
  for (;;) {
    const at = source.indexOf(needle, from)
    if (at < 0) break
    const start = Math.max(0, at - 400)
    windows.push({ start, text: source.slice(start, at + 700) })
    from = at + needle.length
  }
  return windows
}

const INLINE_COLOUR_DECLARATION = /(?:borderColor|background(?:Color)?)\s*:\s*([^,}\n]*)/g

/** `borderColor:` / `background:` declarations whose value carries a colour literal. */
function inlineColourStyles(source: string, windows: readonly NoticeWindow[]): Violation[] {
  const found = new Map<number, Violation>()
  for (const window of windows) {
    for (const match of window.text.matchAll(INLINE_COLOUR_DECLARATION)) {
      if (match.index === undefined) continue
      const literal = colourLiterals(match[1] ?? '')[0]
      if (literal === undefined) continue
      const at = window.start + match.index
      // Overlapping windows see the same declaration; report it once.
      if (!found.has(at)) {
        found.set(at, {
          file: relPath(skillsViewPath),
          line: lineOf(source, at),
          detail: `inline colour ${(match[0] ?? '').trim()} (literal "${literal.literal}") — move it into TeamSkillsView.module.css`,
        })
      }
    }
  }
  return [...found.values()]
}

describe('blocked-assignment notice styling', () => {
  const skillsView = readFileSync(skillsViewPath, 'utf8')

  it('keeps inline colours out of the missing.length > 0 branch', () => {
    const windows = blockedNoticeWindows(skillsView)
    expect(windows.length, 'TeamSkillsView.tsx must still render the blocked-assignment notice').toBeGreaterThan(0)
    expect(report(inlineColourStyles(skillsView, windows))).toBe('')
  })

  it('styles the notice through the .infoError class instead', () => {
    expect(skillsView).toContain('css.infoError')
    expect(readFileSync(skillsCssPath, 'utf8')).toContain('.infoError')
  })

  it('carries no inline colour anywhere in the file', () => {
    // Contract rule 13: inline style attributes must not carry colours; the only
    // exemption is per-Team data (`background: color`, a variable, not a literal).
    const offenders = inlineColourStyles(skillsView, [{ start: 0, text: skillsView }])
    expect(report(offenders)).toBe('')
  })
})
