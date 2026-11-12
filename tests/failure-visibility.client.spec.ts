/**
 * Structural guard for the failure surfaces the composer and the settings page
 * must render.
 *
 * The bug this replaces was a click that left no trace anywhere: the guard in
 * the selection write returned, the write's refusal was discarded, and the page
 * and the control both looked exactly as they did before the user acted. A
 * browser pass remains the real proof of how the notice looks; this file pins
 * the one thing that cannot be allowed to regress silently — that both surfaces
 * READ the failure state and render it, and that the composer's own notice has
 * a rule to render with.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const composer = readFileSync(new URL('../src/client/ComposerTeamSelect.tsx', import.meta.url), 'utf8')
const composerCss = readFileSync(new URL('../src/client/ComposerTeamSelect.module.css', import.meta.url), 'utf8')
const section = readFileSync(new URL('../src/client/TeamPresetsSection.tsx', import.meta.url), 'utf8')
const agentView = readFileSync(new URL('../src/client/TeamAgentView.tsx', import.meta.url), 'utf8')
const listView = readFileSync(new URL('../src/client/TeamListView.tsx', import.meta.url), 'utf8')

describe('selection failure visibility', () => {
  it('renders the failure beside the composer control and in its title', () => {
    expect(composer).toContain('state.selectionFailure')
    expect(composer).toContain('selectionFailureText(')
    expect(composer).toContain('css.failure')
    expect(composer).toContain('role="status"')
    // The trigger's title is the first surface the user reaches for: it must
    // carry the failure ahead of the ordinary hint.
    expect(composer).toMatch(/title=\{failure \?\?/)
  })

  it('gives the composer notice a rule that can actually show it', () => {
    const rule = /\.failure\s*\{([^}]*)\}/.exec(composerCss)?.[1]
    expect(rule, 'the composer needs a .failure rule').toBeDefined()
    expect(rule).toContain('--dsw-alias-state-warn-label')
    expect(rule).toContain('text-overflow: ellipsis')
  })

  it('renders the stored-section diagnosis and the selection failure on the settings page', () => {
    expect(section).toContain('FORM_ISSUE_KEYS[state.formIssue]')
    expect(section).toContain('selectionFailureText(state.selectionFailure, t)')
    // The page names which condition it is instead of one "unavailable", and it
    // no longer labels a loading document as a save in progress.
    expect(section).toContain("t('sectionLoading')")
  })

  it('renders a model catalogue that failed outright, not just a partial one', () => {
    expect(section).toContain("catalogueFailed={state.catalogue === 'error'}")
    expect(agentView).toContain("props.catalogueFailed")
    expect(agentView).toContain("t('modelsFailed')")
  })
})

describe('default preset restore visibility', () => {
  it('offers the restore on the Team list and wires it to the controller', () => {
    expect(listView).toContain('props.onRestoreDefaults')
    expect(listView).toContain("t('restoreDefaults')")
    // The rule lives in the confirmation the button opens: a reader still learns
    // what is reset and what survives, without a standing paragraph on the list.
    expect(listView).toContain("t('restoreConfirmTitle')")
    expect(listView).toContain("t('restoreConfirmBody')")
    expect(listView).toContain('confirmRestore')
    expect(section).toContain('props.restoreDefaults()')
  })

  it('renders the outcome of the click, so a restore that stages nothing still answers', () => {
    expect(section).toContain('DEFAULTS_NOTICE_KEYS[state.defaults]')
    expect(section).toContain('state.defaults === undefined')
  })
})
