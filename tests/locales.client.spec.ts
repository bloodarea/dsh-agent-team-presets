/** Locale bundles for the Team presets page and the composer control. */

import { describe, expect, it } from 'vitest'
import { en, NS, zh } from '../src/client/locales.ts'

describe('Team preset locale bundles', () => {
  it('owns one settings namespace', () => {
    expect(NS).toBe('settings.agentTeamPresets')
  })

  it('keeps the same key set in both languages', () => {
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort())
  })

  it('ships no empty copy, so no consumer can render a blank control', () => {
    for (const [key, copy] of Object.entries({ ...en, ...zh })) {
      expect(copy.trim(), key).not.toBe('')
    }
  })

  it('describes the two tool policies distinctly', () => {
    expect(en.toolsDefault).not.toBe(en.toolsCustom)
    expect(zh.toolsDefault).not.toBe(zh.toolsCustom)
  })
})
