/**
 * Structural guard for the composer's member panel and individual-chat selection.
 *
 * The behaviour this covers is a hover panel and a two-target click, which no
 * node test can observe without a DOM: the controller tests prove the write
 * payloads, and the real proof of the panel remains a browser pass. This file
 * pins what must not regress silently — that the picker keeps offering the
 * captain path, that a member row writes the member selection through the
 * injected face, that the panel survives the pointer crossing the gap, that it
 * stays out of the listbox role, and that the missing-member state is a notice
 * rather than a silent fall back to the captain.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { en, zh } from '../src/client/locales.ts'
import type { TeamPresetsLocaleKey } from '../src/client/locales.ts'

const composer = readFileSync(new URL('../src/client/ComposerTeamSelect.tsx', import.meta.url), 'utf8')
const composerCss = readFileSync(new URL('../src/client/ComposerTeamSelect.module.css', import.meta.url), 'utf8')
const controller = readFileSync(new URL('../src/client/team-presets-controller.ts', import.meta.url), 'utf8')

/** Every locale key the panel and the member selection copy render. */
const PANEL_KEYS: readonly TeamPresetsLocaleKey[] = [
  'composePanelTitle',
  'composePanelCaptain',
  'composePanelMembers',
  'composePanelSessionModel',
  'composePanelCaptainHint',
  'composePanelSoloHint',
  'composePanelEmptyMembers',
  'composePanelNoId',
  'composerMissingMember',
]

describe('the composer member panel', () => {
  it('opens a panel from a Team row on hover and on keyboard focus', () => {
    expect(composer).toContain('onMouseEnter={() => { showPanel(team.id) }}')
    expect(composer).toContain('onFocus={() => { showPanel(team.id) }}')
    expect(composer).toContain('css.memberPanel')
    expect(composer).toContain("role=\"group\"")
    expect(composer).toContain("aria-label={t('composePanelTitle')}")
  })

  it('keeps the panel open while the pointer crosses the gap into it', () => {
    // A row leaving starts a grace timer; the panel cancelling it is the whole
    // reason a diagonal pointer path into the panel does not dismiss it.
    expect(composer).toContain('PANEL_GRACE_MS')
    expect(composer).toMatch(/onMouseLeave=\{schedulePanelClose\}/)
    expect(composer).toMatch(/onMouseEnter=\{cancelHoverClose\}/)
    expect(composer).toContain('clearTimeout(hoverTimer.current)')
  })

  it('renders the captain first with the captain badge and the session-model subtitle', () => {
    const captainRow = composer.indexOf("t('composePanelCaptain')")
    const membersSection = composer.indexOf("t('composePanelMembers')")
    expect(captainRow).toBeGreaterThan(-1)
    expect(membersSection).toBeGreaterThan(captainRow)
    expect(composer).toContain("t('composePanelSessionModel')")
    expect(composer).toContain('css.panelBadge')
    expect(composer).toContain('css.panelDesc')
  })

  it('labels a member route as provider · model, falling back to the session model', () => {
    expect(composer).toContain('memberRouteLabel(state.providers, member)')
    expect(composer).toContain("parts.join(' · ')")
    expect(composer).toContain("?? t('composePanelSessionModel')")
  })

  it('writes the captain path and the member path through the injected face', () => {
    // Captain click keeps the existing Team selection semantics, which clear a
    // member role; member click names the stable identity.
    expect(composer).toMatch(/onClick=\{\(\) => \{ choose\(hoverTeam\.id\) \}\}/)
    expect(composer).toContain('props.selectTeam(String(sessionId), teamId)')
    expect(composer).toContain('props.selectMember(String(sessionId), teamId, memberId)')
    expect(composer).toContain('void props.selectMember(')
  })

  it('disables a member without a stable identity and explains why', () => {
    expect(composer).toContain('disabled={!selectable}')
    expect(composer).toContain("t('composePanelNoId')")
    expect(composer).toMatch(/member\.id !== undefined && member\.id\.trim\(\) !== ''/)
  })

  it('keeps the panel out of the listbox role and keeps team rows as options', () => {
    // One listbox, one panel sibling: nesting the panel inside the listbox would
    // make every panel button a listbox child and break arrow-key semantics.
    expect(composer).toMatch(/<\/div>\s*\n\s*\{hoverTeam === undefined \? null : \(/)
    expect((composer.match(/role="option"/g) ?? [])).toHaveLength(1)
    expect((composer.match(/role="listbox"/g) ?? [])).toHaveLength(1)
    expect(composer).toMatch(/aria-pressed=\{isActiveMember\(hoverTeam, member\)\}/)
  })

  it('flips the panel left when the right side overflows, and overlays when neither side fits', () => {
    expect(composer).toContain('useLayoutEffect')
    expect(composer).toContain('getBoundingClientRect()')
    expect(composer).toContain('window.innerWidth')
    expect(composer).toContain("setPanelPlacement(roomOnLeft ? 'left' : 'overlay')")
    expect(composer).toContain("setPanelPlacement('right')")
    expect(composer).toContain('css.memberPanelLeft')
    expect(composer).toContain('css.memberPanelOverlay')
  })

  it('shows team · member in the trigger and keeps the member accent', () => {
    expect(composer).toContain("`${active.name === '' ? active.id : active.name} · ")
    expect(composer).toContain('activeMember === undefined ? active.captain.color : activeMember.color')
  })

  it('widens the trigger for a solo member so both labels stay readable', () => {
    // `评审组 · implementer` does not fit the Team-only chip, and a truncated
    // second label would hide exactly which member the Session is talking to.
    expect(composer).toContain('activeMember === undefined ? css.trigger : `${css.trigger} ${css.triggerMember}`')
    expect(composerCss).toContain('.triggerMember')
  })

  it('reports a member that no longer exists instead of falling back to the captain', () => {
    expect(composer).toContain('selectedMember(state.teams, state.selections, String(sessionId))')
    expect(composer).toContain("const missingMember = active !== undefined && roleId !== undefined && activeMember === undefined")
    expect(composer).toContain("t('composerMissingMember')")
    expect(composer).toContain(".replace('{member}', roleId ?? '')")
    // The same notice still carries the existing missing hint and popover row.
    expect(composer).toContain('composerMissingHint')
    expect(composer).toContain('css.failure')
    expect(composer).toContain('role="status"')
  })
})

describe('the member panel stylesheet', () => {
  it('anchors the panel beside the picker inside the dock', () => {
    expect(composerCss).toMatch(/\.dock\s*\{[^}]*position:\s*absolute;[^}]*bottom:\s*40px;/)
    expect(composerCss).toMatch(/\.memberPanel\s*\{[^}]*left:\s*calc\(100% \+ 8px\);/)
    expect(composerCss).toMatch(/\.memberPanelLeft\s*\{[^}]*right:\s*calc\(100% \+ 8px\);/)
    expect(composerCss).toMatch(/\.memberPanelOverlay\s*\{[^}]*bottom:\s*calc\(100% \+ 8px\);/)
  })

  it('falls back to an overlay on a narrow viewport', () => {
    expect(composerCss).toContain('@media (max-width: 720px)')
    expect(composerCss).toMatch(/@media \(max-width: 720px\)\s*\{[\s\S]*?bottom:\s*calc\(100% \+ 8px\);/)
  })

  it('styles every row and accent the panel renders', () => {
    for (const rule of ['.panelRow', '.panelRowActive', '.panelDot', '.panelBadge', '.panelRoute', '.panelDesc', '.panelEmpty', '.panelHint']) {
      expect(composerCss, rule).toContain(rule)
    }
    // The neutral dot is a token, not a literal; the per-member accent is data.
    expect(composerCss).toMatch(/\.panelDot\s*\{[^}]*background:\s*var\(--dsw-alias-label-dimmed\);/)
  })
})

describe('the injected member-selection face', () => {
  it('exposes selectMember beside selectTeam on the controller face', () => {
    expect(controller).toContain('selectMember: (sessionId: string, teamId: string, roleId: string) => this.selectMember(sessionId, teamId, roleId)')
    expect(controller).toContain('selectMember: (sessionId: string, teamId: string, roleId: string) => Promise<void>')
    expect(controller).toContain('async selectMember(sessionId: string, teamId: string, roleId: string): Promise<void>')
    // Both paths share the same fence/retry/failure body.
    expect(controller).toContain('return this.applySelection(sessionId, teamId, roleId)')
    expect(controller).toContain('return this.applySelection(sessionId, teamId, undefined)')
  })
})

describe('the member panel locale copy', () => {
  it('ships every panel key in both languages', () => {
    for (const key of PANEL_KEYS) {
      expect(en[key].trim(), `en.${key}`).not.toBe('')
      expect(zh[key].trim(), `zh.${key}`).not.toBe('')
    }
    // The badges must be the reader's own words, not an English fallback.
    expect(zh.composePanelCaptain).toBe('队长')
    expect(zh.composePanelMembers).toBe('队员')
    expect(zh.composePanelSessionModel).toBe('会话模型')
    expect(en.composePanelCaptain).toBe('Captain')
    expect(en.composePanelMembers).toBe('Members')
    expect(en.composePanelSessionModel).toBe('Session model')
  })

  it('names both placeholders of the missing-member notice', () => {
    expect(zh.composerMissingMember).toContain('{member}')
    expect(zh.composerMissingMember).toContain('{team}')
    expect(en.composerMissingMember).toContain('{member}')
    expect(en.composerMissingMember).toContain('{team}')
    // A missing member is a different condition from a missing Team, and the
    // two notices must not collapse into one message.
    expect(zh.composerMissingMember).not.toBe(zh.composerMissing)
    expect(en.composerMissingMember).not.toBe(en.composerMissing)
  })
})
