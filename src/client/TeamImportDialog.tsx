/** Review one Team import and resolve any naming conflicts before staging. */

import { useState } from 'react'
import { Button, Input, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TeamPresetImportPlan, TeamPresetImportResolution, TeamPresetImportSkillRow } from './team-presets-controller.ts'
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
  readonly previewSkills: (resolution: TeamPresetImportResolution) => readonly TeamPresetImportSkillRow[]
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

const skillStatusKeys: Record<TeamPresetImportSkillRow['status'], TeamPresetsLocaleKey> = {
  'unknown-skill': 'importSkillUnknown',
  'missing-role': 'importSkillRoleMissing',
  'ambiguous-role': 'importSkillRoleAmbiguous',
  'catalog-ignored': 'importSkillCatalogIgnored',
  'eligible': 'importSkillEligible',
  'asset-missing': 'importSkillAssetMissing',
  'library-unavailable': 'importSkillLibraryUnavailable',
  'local-override': 'importSkillLocalOverride',
}

/** Render a pending import, including any declaration that could not resolve. */
export function TeamImportDialog(props: TeamImportDialogProps) {
  const { plan, t } = props
  const [teamChoice, setTeamChoice] = useState<CollisionChoice>('replace')
  const [teamName, setTeamName] = useState(plan.suggestedTeamName)
  const [captainChoice, setCaptainChoice] = useState<CollisionChoice>('replace')
  const [memberChoices, setMemberChoices] = useState<Record<string, CollisionChoice>>({})

  const memberChoice = (name: string): CollisionChoice => memberChoices[name] ?? 'replace'
  const teamCollision = plan.targetIndex !== undefined
  const agentCollisions = teamCollision && teamChoice === 'replace'
    && (plan.captainConflict !== '' || plan.memberConflicts.length > 0)
  const resolution: TeamPresetImportResolution = {
    team: teamCollision ? teamChoice : 'rename',
    teamName,
    captain: captainChoice,
    members: Object.fromEntries(plan.memberConflicts.map(name => [name, memberChoice(name)])),
  }
  const rows = props.previewSkills(resolution)

  return (
    <Modal
      open
      onClose={props.onCancel}
      title={t(teamCollision ? 'importConflictTitle' : 'importPreviewTitle')}
      closeLabel={t('close')}
      footer={(
        <>
          <Button variant="outline" onClick={props.onCancel}>{t('cancel')}</Button>
          <Button
            variant="primary"
            onClick={() => { props.onConfirm(resolution) }}
          >
            {t('importConfirm')}
          </Button>
        </>
      )}
    >
      {teamCollision && (
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
      )}

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
      {(['preset', 'catalog'] as const).map(source => {
        const group = rows.filter(row => row.source === source)
        if (group.length === 0) return null
        return (
          <section className={css.conflict} key={source} aria-live="polite">
            <h3 className={css.conflictLead}>{t(source === 'preset' ? 'importSkillDeclarations' : 'importSkillCatalog')}</h3>
            <ul className={css.plainRows}>
              {group.map((row, index) => (
                <li key={`${row.skillId}:${row.roleName}:${index}`} className={css.conflictMember}>
                  <strong className={css.conflictName}>{row.skillId} · {row.roleName}</strong>
                  <span>{t(skillStatusKeys[row.status])}</span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      <p className={css.dialogNote}>{t('importDraftNote')}</p>
    </Modal>
  )
}
