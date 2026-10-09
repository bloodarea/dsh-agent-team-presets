/**
 * Second Team preset page: one Team's own name, description, captain, and
 * member roster. Choosing the captain or a member opens that agent's page.
 */

import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProviderChoice } from './team-presets-controller.ts'
import type { TeamAgentPreset, TeamPreset } from '../types.ts'
import type { TeamPresetsLocaleKey } from './locales.ts'
import css from './TeamPresetsSection.module.css'

/** The agent page one row opens. */
export type AgentSlot = 'captain' | number

/** Model caption of one configured agent slot. */
function agentRoute(agent: TeamAgentPreset, providers: readonly ProviderChoice[]): string {
  if (agent.provider === '' || agent.model === '') return ''
  const provider = providers.find(entry => entry.id === agent.provider)
  const model = provider?.models.find(entry => entry.id === agent.model)
  return `${provider?.name ?? agent.provider} · ${model?.name ?? agent.model}`
}

/** Props of one Team's page. */
export interface TeamEditorViewProps {
  /** The Team being edited. */
  readonly team: TeamPreset
  /** Provider catalogue used for the model captions. */
  readonly providers: readonly ProviderChoice[]
  /** Page copy reader. */
  readonly t: (key: TeamPresetsLocaleKey) => string
  /** Whether the Host document accepts writes. */
  readonly disabled: boolean
  readonly onBack: () => void
  readonly onPatch: (patch: Partial<TeamPreset>) => void
  readonly onOpenAgent: (slot: AgentSlot) => void
  readonly onAddMember: () => void
  readonly onRemoveMember: (index: number) => void
}

/**
 * Render one Team's page.
 * @param props - the Team, catalogue, copy, and navigation callbacks.
 * @returns the back row, the Team identity fields, and the roster.
 */
export function TeamEditorView(props: TeamEditorViewProps) {
  const { team, t, disabled } = props
  return (
    <>
      <header className={css.pageHead}>
        <button type="button" className={css.crumb} onClick={props.onBack}>
          <span aria-hidden>‹</span> {t('backToList')}
        </button>
        <h2 className={css.title}>{team.name === '' ? team.id : team.name}</h2>
      </header>

      <section className={css.card}>
        <div className={css.field}>
          <span className={css.fieldLabel}>{t('teamName')}</span>
          <Input
            className={css.input ?? ''}
            value={team.name}
            placeholder={t('teamNamePlaceholder')}
            disabled={disabled}
            onChange={(event) => { props.onPatch({ name: event.target.value }) }}
          />
        </div>
        <div className={css.field}>
          <span className={css.fieldLabel}>{t('teamDescription')}</span>
          <Input
            className={css.input ?? ''}
            value={team.description}
            disabled={disabled}
            onChange={(event) => { props.onPatch({ description: event.target.value }) }}
          />
        </div>
      </section>

      <span className={css.sectionTitle}>{t('teamSections')}</span>

      <section className={css.card}>
        <button type="button" className={css.entryRow} onClick={() => { props.onOpenAgent('captain') }}>
          <span
            className={css.dot}
            style={team.captain.color === '' ? undefined : { background: team.captain.color }}
            aria-hidden
          />
          <span className={css.rowText}>
            <span className={css.rowName}>
              {t('roleCaptain')}{team.captain.name.trim() === '' ? '' : ` · ${team.captain.name.trim()}`}
            </span>
            <span className={css.rowMeta}>{t('captainFollowsSession')}</span>
          </span>
          <span className={css.chevron} aria-hidden>›</span>
        </button>
        <p className={css.hint}>{t('captainHint')}</p>
      </section>

      <section className={css.card}>
        <div className={css.cardHead}>
          <span className={css.cardTitle}>{t('members')}</span>
          <Button size="sm" variant="outline" disabled={disabled} onClick={props.onAddMember}>{t('addMember')}</Button>
        </div>
        {team.members.length === 0 ? <p className={css.hint}>{t('emptyMembers')}</p> : (
          <ul className={css.plainRows}>
            {team.members.map((member, index) => (
              <li key={`${team.id}-member-${String(index)}`} className={css.entry}>
                <button type="button" className={css.entryRow} onClick={() => { props.onOpenAgent(index) }}>
                  <span
                    className={css.dot}
                    style={member.color === '' ? undefined : { background: member.color }}
                    aria-hidden
                  />
                  <span className={css.rowText}>
                    <span className={css.rowName}>
                      {member.name.trim() === '' ? `${t('roleMember')} ${String(index + 1)}` : member.name.trim()}
                    </span>
                    <span className={css.rowMeta}>{agentRoute(member, props.providers) || t('inheritSession')}</span>
                  </span>
                  <span className={css.chevron} aria-hidden>›</span>
                </button>
                <Button size="sm" variant="ghost" disabled={disabled} onClick={() => { props.onRemoveMember(index) }}>
                  {t('removeMember')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
