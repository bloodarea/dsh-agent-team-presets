/**
 * First Team preset page: every configured Team as one row. Choosing a row
 * opens that Team's own page.
 */

import { useRef } from 'react'
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
  /** Copy describing why the last chosen document was refused. */
  readonly importError?: TeamPresetsLocaleKey | undefined
  readonly onOpen: (teamId: string) => void
  readonly onCreate: () => void
  readonly onDuplicate: (teamId: string) => void
  readonly onDelete: (teamId: string) => void
  /** Receives the document the user chose to import. */
  readonly onImport: (file: File) => void
  /** Writes the chosen Team out as a shareable document. */
  readonly onExport: (teamId: string) => void
}

/**
 * Render the Team list.
 * @param props - the Teams, copy, and navigation callbacks.
 * @returns the header, the create and import actions, and one row per Team.
 */
export function TeamListView(props: TeamListViewProps) {
  const { t, disabled } = props
  const fileInput = useRef<HTMLInputElement>(null)
  return (
    <>
      <header className={css.pageHead}>
        <h2 className={css.title}>{t('title')}</h2>
        <p className={css.intro}>{t('description')}</p>
      </header>

      <div className={css.actionRow}>
        <Button size="sm" variant="outline" disabled={disabled} onClick={props.onCreate}>{t('newTeam')}</Button>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => { fileInput.current?.click() }}
        >
          {t('importPreset')}
        </Button>
        <input
          ref={fileInput}
          className={css.fileInput}
          type="file"
          accept="application/json,.json"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0]
            // Clearing the value lets the same document be chosen twice in a row.
            event.target.value = ''
            if (file !== undefined) props.onImport(file)
          }}
        />
      </div>

      <p className={css.hint}>{t('importNote')}</p>
      {props.importError === undefined
        ? null
        : <p className={css.warn} role="status">{t(props.importError)}</p>}

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
                  <Button size="sm" variant="ghost" onClick={() => { props.onExport(team.id) }}>
                    {t('exportPreset')}
                  </Button>
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
