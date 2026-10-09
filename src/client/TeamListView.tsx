/**
 * First Team preset page: every configured Team as one row. Choosing a row
 * opens that Team's own page.
 */

import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TeamPreset } from '../types.ts'
import type { TeamPresetsLocaleKey } from './locales.ts'
import css from './TeamPresetsSection.module.css'

/** Props of the Team list page. */
export interface TeamListViewProps {
  /** Every configured Team. */
  readonly teams: readonly TeamPreset[]
  /** Page copy reader. */
  readonly t: (key: TeamPresetsLocaleKey) => string
  /** Whether the Host document accepts writes. */
  readonly disabled: boolean
  readonly onOpen: (teamId: string) => void
  readonly onCreate: () => void
  readonly onDuplicate: (teamId: string) => void
  readonly onDelete: (teamId: string) => void
}

/**
 * Render the Team list.
 * @param props - the Teams, copy, and navigation callbacks.
 * @returns the header, the create action, and one row per Team.
 */
export function TeamListView(props: TeamListViewProps) {
  const { t, disabled } = props
  return (
    <>
      <header className={css.pageHead}>
        <h2 className={css.title}>{t('title')}</h2>
        <p className={css.intro}>{t('description')}</p>
      </header>

      <div className={css.actionRow}>
        <Button size="sm" variant="outline" disabled={disabled} onClick={props.onCreate}>{t('newTeam')}</Button>
      </div>

      {props.teams.length === 0
        ? <p className={css.empty}>{t('emptyTeams')}</p>
        : (
          <ul className={css.rows}>
            {props.teams.map(team => (
              <li key={team.id} className={css.card}>
                <button type="button" className={css.rowMain} onClick={() => { props.onOpen(team.id) }}>
                  <span
                    className={css.dot}
                    style={team.captain.color === '' ? undefined : { background: team.captain.color }}
                    aria-hidden
                  />
                  <span className={css.rowText}>
                    <span className={css.rowName}>{team.name === '' ? team.id : team.name}</span>
                    <span className={css.rowMeta}>
                      {`${String(team.members.length)} ${t('memberCount')} · ${t('captainFollowsSession')}`}
                    </span>
                  </span>
                </button>
                <span className={css.rowActions}>
                  <Button size="sm" variant="ghost" disabled={disabled} onClick={() => { props.onDuplicate(team.id) }}>
                    {t('duplicate')}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={disabled} onClick={() => { props.onDelete(team.id) }}>
                    {t('remove')}
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}
    </>
  )
}
