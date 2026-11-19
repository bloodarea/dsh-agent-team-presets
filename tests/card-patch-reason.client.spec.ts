/**
 * The reason a card-patch row refuses.
 *
 * A target's replacement is a whole-bundle build pinned to one upstream version,
 * so installing a newer target plugin is the one refusal an operator has to act
 * on. The Host states it in English and lists every supported version; this view
 * restates that single case in the reader's language with the two versions that
 * matter, while every other refusal keeps the Host's own sentence.
 *
 * These checks read the shipped view, because the string it renders is the whole
 * subject: a placeholder a translator drops would otherwise reach the page.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { en, zh } from '../src/client/locales.ts'

const view = readFileSync(new URL('../src/client/CardPatchView.tsx', import.meta.url), 'utf8')

/** Substitute the two placeholders the way the view does. */
function render(text: string, installed: string, supported: string): string {
  return text.replace('{installed}', installed).replace('{supported}', supported)
}

describe('the unsupported-version row', () => {
  it('names the installed version and the highest one this build patches', () => {
    expect(render(zh['patchUnsupportedReason'], '0.85.1', '0.84.1')).toContain('0.85.1')
    expect(render(zh['patchUnsupportedReason'], '0.85.1', '0.84.1')).toContain('0.84.1')
    expect(render(en['patchUnsupportedReason'], '0.85.1', '0.84.1')).toContain('0.85.1')
    expect(render(en['patchUnsupportedReason'], '0.85.1', '0.84.1')).toContain('0.84.1')
  })

  it('ships both placeholders in both languages', () => {
    for (const copy of [zh['patchUnsupportedReason'], en['patchUnsupportedReason']]) {
      expect(copy).toContain('{installed}')
      expect(copy).toContain('{supported}')
    }
    // A stray brace would render literally on the page.
    for (const copy of [zh['patchUnsupportedReason'], en['patchUnsupportedReason']]) {
      expect(copy.replace('{installed}', '').replace('{supported}', '')).not.toMatch(/[{}]/u)
    }
  })

  it('keeps the state word itself short, so the badge stays a badge', () => {
    expect(zh['patchStateUnsupported']).toBe('版本不支持')
    expect(en['patchStateUnsupported']).toBe('version not supported')
  })

  it('renders the reason through a helper that only overrides the unsupported state', () => {
    // Every other refusal keeps the Host's sentence: the page has nothing to add.
    expect(view).toContain("if (target.state !== 'unsupported') return target.detail")
    expect(view).toContain("t('patchUnsupportedReason')")
    expect(view).toContain("replace('{installed}', target.installedVersion ?? '—')")
    expect(view).toContain("replace('{supported}', target.supportedVersion)")
    // The row must actually call it, not the raw Host field.
    expect(view).toMatch(/reasonOf\(target, t\) === undefined \? null : <p className=\{css\.detail\}>\{reasonOf\(target, t\)\}<\/p>/)
    expect(view).not.toContain('children: target.detail')
  })
})
