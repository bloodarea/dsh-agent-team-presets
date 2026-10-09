/**
 * The Agent Team presets settings page: three stacked pages — the Team list,
 * one Team's roster, and one captain or member — with a shared save footer.
 */

import { useEffect, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the settings shell's `settings.section` declaration.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { TeamAgentView } from './TeamAgentView.tsx'
import { TeamEditorView } from './TeamEditorView.tsx'
import type { AgentSlot } from './TeamEditorView.tsx'
import { TeamListView } from './TeamListView.tsx'
import type { TeamPresetsInjected } from './team-presets-controller.ts'
import type { TeamAgentPreset, TeamCaptainPreset } from '../types.ts'
import css from './TeamPresetsSection.module.css'

/** Complete props of the settings page. */
export type TeamPresetsSectionProps =
  PropsRuntime<'settings.section'>
  & PropsLocale<'settings.agentTeamPresets'>
  & InjectFace<TeamPresetsInjected>

/**
 * Keep the fields a captain owns out of one shared editor patch.
 *
 * The one-agent page reports both slots' edits through the route-bearing member
 * patch, so the captain branch drops the route members it never renders.
 * @param patch - the edit reported by the one-agent page.
 * @returns the same edit restricted to the captain's own fields.
 */
function captainPatch(patch: Partial<TeamAgentPreset>): Partial<TeamCaptainPreset> {
  const { name, color, description, toolMode, tools, systemPrompt } = patch
  return {
    ...name === undefined ? {} : { name },
    ...color === undefined ? {} : { color },
    ...description === undefined ? {} : { description },
    ...toolMode === undefined ? {} : { toolMode },
    ...tools === undefined ? {} : { tools },
    ...systemPrompt === undefined ? {} : { systemPrompt },
  }
}

/** Which of the three pages is showing. */
type View =
  | { readonly kind: 'list' }
  | { readonly kind: 'team'; readonly teamId: string }
  | { readonly kind: 'agent'; readonly teamId: string; readonly slot: AgentSlot }

/**
 * Render the Team preset settings page.
 * @param props - page state, the page's locale reader, and the editing actions.
 * @returns the current page and the shared save footer.
 */
export function TeamPresetsSection(props: TeamPresetsSectionProps) {
  const { t } = props
  const state = props.useTeamPresets(snapshot => snapshot)
  const [view, setView] = useState<View>({ kind: 'list' })
  const { refreshCatalogue } = props
  // The settings shell mounts only the active section, so this runs on every
  // open: a route the deployment gained while the client was running must be
  // offered without a reload. The inject face is cached per registration, so
  // the reference is stable and the effect does not re-run per render.
  useEffect(() => { refreshCatalogue() }, [refreshCatalogue])

  if (state.status !== 'ready') {
    return <p className={css.empty} role="status">{state.status === 'loading' ? t('saving') : t('unavailable')}</p>
  }

  const disabled = !state.writable
  const teamList = state.teams
  const found = view.kind === 'list' ? undefined : teamList.find(entry => entry.id === view.teamId)
  // A deleted Team or member drops the page back to the level that still exists.
  const active: View = view.kind === 'list' || found !== undefined ? view : { kind: 'list' }
  const team = found
  const teamIndex = team === undefined ? -1 : teamList.indexOf(team)

  const openTeam = (teamId: string): void => { setView({ kind: 'team', teamId }) }
  const openAgent = (teamId: string, slot: AgentSlot): void => { setView({ kind: 'agent', teamId, slot }) }

  const memberSlot = active.kind === 'agent' && active.slot !== 'captain' ? active.slot : undefined
  const agent = team === undefined || active.kind !== 'agent'
    ? undefined
    : active.slot === 'captain' ? team.captain : team.members[active.slot]

  return (
    <div className={css.section}>
      <div className={css.page}>
        {active.kind === 'list' && (
          <TeamListView
            teams={teamList}
            t={t}
            disabled={disabled}
            onOpen={openTeam}
            onCreate={() => { openTeam(props.createTeam()) }}
            onDuplicate={(teamId) => {
              const index = teamList.findIndex(entry => entry.id === teamId)
              if (index < 0) return
              const created = props.duplicateTeam(index)
              if (created !== undefined) openTeam(created)
            }}
            onDelete={(teamId) => {
              const index = teamList.findIndex(entry => entry.id === teamId)
              if (index >= 0) props.removeTeam(index)
              setView({ kind: 'list' })
            }}
          />
        )}

        {active.kind === 'team' && team !== undefined && (
          <TeamEditorView
            team={team}
            providers={state.providers}
            t={t}
            disabled={disabled}
            onBack={() => { setView({ kind: 'list' }) }}
            onPatch={(patch) => { props.patchTeam(teamIndex, patch) }}
            onOpenAgent={(slot) => { openAgent(team.id, slot) }}
            onAddMember={() => {
              props.addMember(teamIndex)
              openAgent(team.id, team.members.length)
            }}
            onRemoveMember={(index) => { props.removeMember(teamIndex, index) }}
          />
        )}

        {active.kind === 'agent' && team !== undefined && agent !== undefined && (
          <TeamAgentView
            agent={agent}
            role={active.slot === 'captain' ? 'captain' : 'member'}
            teamName={team.name === '' ? team.id : team.name}
            providers={state.providers}
            tools={state.tools}
            toolCatalogue={state.toolCatalogue}
            cataloguePartial={state.cataloguePartial}
            t={t}
            disabled={disabled}
            onBack={() => { openTeam(team.id) }}
            onChange={(patch) => {
              if (active.slot === 'captain') props.patchCaptain(teamIndex, captainPatch(patch))
              else props.patchMember(teamIndex, active.slot, patch)
            }}
            {...memberSlot === undefined ? {} : {
              onDelete: () => {
                props.removeMember(teamIndex, memberSlot)
                openTeam(team.id)
              },
            }}
          />
        )}
      </div>

      <footer className={css.footer}>
        {state.failed ? <span className={css.warn} role="status">{t('saveFailed')}</span> : null}
        {state.dirty ? <span className={css.footerNote}>{t('unsaved')}</span> : null}
        <Button
          size="sm"
          variant="ghost"
          disabled={!state.dirty || state.saving}
          onClick={() => { props.discard() }}
        >
          {t('discard')}
        </Button>
        <Button
          size="sm"
          variant="primary"
          disabled={!state.dirty || state.saving || disabled}
          onClick={() => { void props.save() }}
        >
          {state.saving ? t('saving') : t('save')}
        </Button>
      </footer>
    </div>
  )
}
