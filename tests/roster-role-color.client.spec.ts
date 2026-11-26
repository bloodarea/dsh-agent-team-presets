/**
 * The role colour as the header roster card's own border.
 *
 * The roster reconstructs rc.1's member list, and its cards had a single neutral
 * hairline whatever colour the role configured. This pins the two halves of the
 * fix — the Host reading the accent out of the stored preset, and the page
 * handing it to the card without touching any other part of the card's look —
 * along with the one property that makes it safe: a role with no colour still
 * renders exactly what it rendered before.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const rosterView = readFileSync(new URL('../src/client/TeamRosterAction.tsx', import.meta.url), 'utf8')
const rosterCss = readFileSync(new URL('../src/client/TeamRosterAction.module.css', import.meta.url), 'utf8')
const types = readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8')
const host = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8')

describe('the roster row carries the role colour', () => {
  it('declares the accent on the row shape the header reads', () => {
    expect(types).toMatch(/readonly color\?: string/)
    // The doc comment has to say what the colour is for, because the field is
    // presentation only and must never be mistaken for a policy input.
    expect(types).toContain("The roster draws each card's border with it")
  })

  it('reads the captain colour from the applied preset', () => {
    const captainBlock = host.slice(host.indexOf("role: 'captain' as const"), host.indexOf('const rows ='))
    expect(captainBlock).toContain('color: applied.captain.color')
  })

  it('reads a teammate colour from the stored role, not from the frozen snapshot', () => {
    // Recolouring a role is presentation: it must show on members already
    // summoned, so the colour is resolved when the roster is read.
    expect(host).toContain('const roleMember = findMemberById(applied, recordedMemberRole(applied, record))')
    expect(host).toContain('...roleMember === undefined ? {} : { color: roleMember.color },')
    // A member whose role the preset no longer holds simply has no accent.
    expect(host).not.toContain('color: record.')
  })
})

describe('the colour is only a border', () => {
  it('hands the accent to both card shapes', () => {
    // The Lead/current card is a div, a teammate card is a button: both must
    // carry the accent or the list reads as two different treatments.
    expect(rosterView.match(/style=\{roleBorder\(member\.color\)\}/g)?.length).toBe(2)
    expect(rosterView).toContain("function roleBorder(color: string | undefined): CSSProperties | undefined")
  })

  it('writes one custom property and nothing else', () => {
    expect(rosterView).toContain("return accent === '' ? undefined : { '--dsh-roster-role-color': accent } as CSSProperties")
    // The helper must not repaint anything: no background, no radius, no padding.
    const body = rosterView.slice(
      rosterView.indexOf('function roleBorder('),
      rosterView.indexOf('type RowProps ='),
    )
    // `color:` alone would match the helper's own parameter name, so the checks
    // name the CSS properties a repaint would need instead.
    for (const forbidden of ['background', 'borderRadius', 'padding', 'boxShadow', 'borderColor', 'border:']) {
      expect(body, forbidden).not.toContain(forbidden)
    }
  })

  it('draws the colour on the card border, with a transparent fallback', () => {
    const member = /\.member\s*\{([^}]*)\}/.exec(rosterCss)?.[1]
    expect(member, 'the roster needs a .member rule').toBeDefined()
    expect(member).toContain('border: 1px solid var(--dsh-roster-role-color, transparent)')
    // The elevation hairline stays exactly as it was: the role colour is an
    // addition, not a replacement, so a card keeps its base stroke either way.
    expect(member).toContain('--dsw-elevation-stroke-color: var(--dsw-alias-border-l2)')
    expect(member).toContain('box-shadow: var(--dsw-elevation-stroke-color)')
  })

  it('pays for the border out of the padding and keeps border-box', () => {
    // A 1px border added to a 10px/12px padded box would grow the card by 2px
    // and shift the name by 1px; taking it out of the padding keeps the outer
    // box, the text position and the grid track identical.
    const member = /\.member\s*\{([^}]*)\}/.exec(rosterCss)?.[1]
    expect(member).toContain('box-sizing: border-box')
    expect(member).toContain('padding: 9px 11px')
  })

  it('keeps the current card readable as current', () => {
    // The inset ring is the "this is your session" signal and keeps its
    // business tint; it must not be repainted by the role colour.
    const current = /\.memberCurrent\s*\{([^}]*)\}/.exec(rosterCss)?.[1]
    expect(current).toContain('inset 0 0 0 1px')
    expect(current).toContain('--dsw-elevation-stroke-color: color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent)')
    expect(current).not.toContain('--dsh-roster-role-color')
  })

  it('leaves hover and focus on their own tokens', () => {
    // Hover and focus must not be repainted by a role colour: they are the
    // interaction affordances, not the role's identity.
    expect(rosterCss).toContain('.member:not(:disabled):focus-visible')
    expect(rosterCss).not.toContain('--dsh-roster-role-color: var(--dsw-alias-border-l3)')
    const hover = rosterCss.slice(rosterCss.indexOf('@media (hover: hover)'))
    expect(hover).toContain('box-shadow: var(--dsw-elevation-panel)')
  })
})
