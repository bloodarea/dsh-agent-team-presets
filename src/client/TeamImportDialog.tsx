/**
 * Conflict dialog for one Team import.
 *
 * The document's Team name, captain name, and member names are the keys an
 * import matches on, so each one that the target Team already uses is resolved
 * here: overwrite the configured agent, or add the imported one under a name
 * that is still free. Choosing a new Team name makes the whole document a new
 * Team, which is why the agent collisions disappear with that choice.
 */

import { useState } from 'react'
import { Button, Input, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TeamPresetImportPlan, TeamPresetImportResolution } from './team-presets-controller.ts'
import type { TeamPresetsLocaleKey } from './locales.ts'
import css from './TeamPresetsSection.module.css'

/** Which side of one name collision the user picked. */
type CollisionChoice = 'replace' | 'rename'

/** Props of the import conflict dialog. */
export interface TeamImportDialogProps {
  /** The document being imported and the collisions the inspection found. */
  readonly plan: TeamPresetImportPlan
  /** Page copy reader. */
  readonly t: (key: TeamPresetsLocaleKey) => string
  readonly onCancel: () => void
  readonly onConfirm: (resolution: TeamPresetImportResolution) => void
}

/**
 * Render one pair of collision choices.
 * @param name - radio group name, unique across the dialog.
 * @param value - the current choice.
 * @param onChange - receives the picked choice.
 * @param labels - the two localized option labels.
 * @param autofocus - whether this group's first option takes initial focus.
 * @returns the two radio options.
 */
function choices(
  name: string,
  value: CollisionChoice,
  onChange: (next: CollisionChoice) => void,
  labels: { readonly replace: string; readonly rename: string },
  autofocus = false,
) {
  return (
    <span className={css.choiceRow}>
      <label className={css.choice}>
        <input
          type="radio"
          name={name}
          checked={value === 'replace'}
          {...autofocus ? { 'data-modal-autofocus': true } : {}}
          onChange={() => { onChange('replace') }}
        />
        <span>{labels.replace}</span>
      </label>
      <label className={css.choice}>
        <input type="radio" name={name} checked={value === 'rename'} onChange={() => { onChange('rename') }} />
        <span>{labels.rename}</span>
      </label>
    </span>
  )
}

/**
 * Render the collision dialog for one import.
 * @param props - the plan, the page copy, and the two outcomes.
 * @returns the dialog; the caller mounts it only while an import is pending.
 */
export function TeamImportDialog(props: TeamImportDialogProps) {
  const { plan, t } = props
  const [teamChoice, setTeamChoice] = useState<CollisionChoice>('replace')
  const [teamName, setTeamName] = useState(plan.suggestedTeamName)
  const [captainChoice, setCaptainChoice] = useState<CollisionChoice>('replace')
  const [memberChoices, setMemberChoices] = useState<Record<string, CollisionChoice>>({})

  const memberChoice = (name: string): CollisionChoice => memberChoices[name] ?? 'replace'
  const agentCollisions = teamChoice === 'replace'
    && (plan.captainConflict !== '' || plan.memberConflicts.length > 0)

  return (
    <Modal
      open
      onClose={props.onCancel}
      title={t('importConflictTitle')}
      closeLabel={t('close')}
      footer={(
        <>
          <Button variant="outline" onClick={props.onCancel}>{t('cancel')}</Button>
          <Button
            variant="primary"
            onClick={() => {
              props.onConfirm({
                team: teamChoice,
                teamName,
                captain: captainChoice,
                members: Object.fromEntries(plan.memberConflicts.map(name => [name, memberChoice(name)])),
              })
            }}
          >
            {t('importConfirm')}
          </Button>
        </>
      )}
    >
      <section className={css.conflict}>
        <span className={css.conflictLead}>{t('importTeamConflict')}</span>
        <span className={css.conflictName}>{plan.targetName}</span>
        {choices('import-team', teamChoice, setTeamChoice, {
          replace: t('importTeamReplace'),
          rename: t('importTeamRename'),
        }, true)}
        {teamChoice === 'rename' ? (
          <div className={css.field}>
            <span className={css.fieldLabel}>{t('importNewTeamName')}</span>
            <Input
              className={css.input ?? ''}
              value={teamName}
              onChange={(event) => { setTeamName(event.target.value) }}
            />
          </div>
        ) : null}
      </section>

      {!agentCollisions ? null : (
        <>
          {plan.captainConflict === '' ? null : (
            <section className={css.conflict}>
              <span className={css.conflictLead}>{t('importCaptainConflict')}</span>
              <span className={css.conflictName}>{plan.captainConflict}</span>
              {choices('import-captain', captainChoice, setCaptainChoice, {
                replace: t('importCaptainReplace'),
                rename: t('importCaptainRename'),
              })}
            </section>
          )}

          {plan.memberConflicts.length === 0 ? null : (
            <section className={css.conflict}>
              <span className={css.conflictLead}>{t('importMemberConflict')}</span>
              <ul className={css.plainRows}>
                {plan.memberConflicts.map(name => (
                  <li key={name} className={css.conflictMember}>
                    <span className={css.conflictName}>{name}</span>
                    {choices(`import-member-${name}`, memberChoice(name), (next) => {
                      setMemberChoices(current => ({ ...current, [name]: next }))
                    }, {
                      replace: t('importMemberReplace'),
                      rename: t('importMemberRename'),
                    })}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </Modal>
  )
}
