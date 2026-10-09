/**
 * The composer's Team control: pick the Team preset that leads this Session.
 * It sits in the composer tool row after the permission control.
 */

import { useState } from 'react'
import { IconChevronDownOutlineRegular, Menu } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MenuEntry } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the conversation slot declarations and the session seat.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { selectedTeam } from '../presets.ts'
import type { TeamPresetsInjected } from './team-presets-controller.ts'
import css from './ComposerTeamSelect.module.css'

/** Complete props derived from the composer slot and the shared Team state. */
export type ComposerTeamSelectProps =
  PropsRuntime<'conversation.input.left'>
  & PropsLocale<'settings.agentTeamPresets'>
  & InjectFace<TeamPresetsInjected>

/**
 * Render the composer's Team picker.
 * @param props - the Session identity, the page's locale reader, and the selection writer.
 * @returns the Team trigger, or null while no Team is configured.
 */
export function ComposerTeamSelect(props: ComposerTeamSelectProps) {
  const { t, sessionId } = props
  const state = props.useTeamPresets(snapshot => snapshot)
  const [open, setOpen] = useState(false)

  const active = selectedTeam(state.teams, state.selections, String(sessionId))
  const writable = state.status === 'ready' && state.writable
  const items: MenuEntry[] = [
    { id: '', label: t('composerNone') },
    ...state.teams.map(team => ({ id: team.id, label: team.name === '' ? team.id : team.name })),
  ]

  return (
    <Menu
      open={open}
      items={items}
      selectedId={active?.id ?? ''}
      onSelect={(id) => {
        setOpen(false)
        void props.selectTeam(String(sessionId), id === '' ? undefined : id)
      }}
      onClose={() => { setOpen(false) }}
      side="top"
      portal
      compact
      anchor={(
        <button
          type="button"
          className={css.trigger}
          disabled={!writable}
          aria-haspopup="listbox"
          aria-expanded={open}
          title={t('composerHint')}
          onClick={() => { setOpen(value => !value) }}
        >
          {active === undefined || active.captain.color === ''
            ? null
            : (
              <span
                className={css.accentDot}
                style={{ background: active.captain.color }}
                aria-hidden
              />
            )}
          <span className={css.triggerLabel} aria-label={t('composerTitle')}>
            {active === undefined ? t('composerTitle') : (active.name === '' ? active.id : active.name)}
          </span>
          <span className={css.triggerIcon}><IconChevronDownOutlineRegular size={14} /></span>
        </button>
      )}
    />
  )
}
