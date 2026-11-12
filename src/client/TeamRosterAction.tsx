/**
 * The conversation-header Team roster.
 *
 * Ported from the rc.1 official `agent-team` header action: same slot, same
 * order, same icon/label/hover-popover behaviour and stylesheet. rc.2 folded
 * Teams into the subagent tree and kept only the task board, so the roster rows
 * are reconstructed from this plugin's member snapshots instead of the removed
 * Team projection.
 */

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import {
  IconChevronDownOutlineRegular, IconUserOutlineRegular, IconUsersOutlineRegular, StateDot, Tag, Tooltip,
  useDismissOnOutsidePointer, type StateDotState,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: declares the deployment's `agentTeam` session projection this
// control gates on, the same way the composer's Team picker does.
import type { TeamTaskView } from '@deepseek-ai/dsh-agent-team/types'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { TeamRosterMemberView } from '../types.ts'
import type { TeamRosterInjected } from './team-presets-controller.ts'
import type { TeamPresetsLocaleKey } from './locales.ts'
import css from './TeamRosterAction.module.css'

/** Durable lifecycle overlaid with the member Session's live turn activity. */
type MemberStatus = 'running' | 'inactive'

/** Full props of the Team conversation-header action. */
export type TeamRosterActionProps =
  PropsRuntime<'conversation.session.header.actions'>
  & InjectFace<TeamRosterInjected>
  & PropsLocale<'settings.agentTeamPresets'>

/** How often the open, or merely present, roster re-reads the Host. */
const ROSTER_REFRESH_MS = 4000

function memberStatusKey(status: MemberStatus): TeamPresetsLocaleKey {
  return status === 'running' ? 'memberStatus.running' : 'memberStatus.inactive'
}

function statusKey(status: TeamTaskView['status']): TeamPresetsLocaleKey {
  switch (status) {
    case 'pending': return 'status.pending'
    case 'in_progress': return 'status.in_progress'
    case 'completed': return 'status.completed'
    /* v8 ignore next -- deleted tombstones are filtered before rendering. */
    case 'deleted': return 'status.completed'
  }
}

function taskDotState(task: TeamTaskView): StateDotState {
  switch (task.status) {
    case 'pending': return task.ready ? 'idle' : 'warning'
    case 'in_progress': return 'ongoing'
    case 'completed': return 'done'
    /* v8 ignore next -- deleted tombstones are filtered before rendering. */
    case 'deleted': return 'idle'
  }
}

/** One shared task, with rc.1's two-line description clamp and meta row. */
function TaskCard({ task, t }: { task: TeamTaskView; t: TeamRosterActionProps['t'] }) {
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)
  useLayoutEffect(() => {
    if (expanded) return
    const paragraph = textRef.current
    /* v8 ignore next -- the paragraph mounts in the same commit as the effect. */
    if (paragraph === null) return
    const measure = (): void => { setClamped(paragraph.scrollHeight > paragraph.clientHeight + 1) }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(paragraph)
    return () => { observer.disconnect() }
  }, [task.description, expanded])
  return (
    <article className={css.task}>
      <div className={css.taskTitle}>
        <strong>{task.subject}</strong>
        <span className={css.taskState}>
          <StateDot state={taskDotState(task)} />
          <span>{t(statusKey(task.status))}</span>
        </span>
      </div>
      <p ref={textRef} className={expanded ? undefined : css.clampedDescription}>{task.description}</p>
      <div className={css.meta}>
        {(clamped || expanded) && (
          <button
            type="button"
            className={css.expandToggle}
            aria-expanded={expanded}
            onClick={() => { setExpanded(current => !current) }}
          >
            {t(expanded ? 'task.collapse' : 'task.expand')}
            <IconChevronDownOutlineRegular size={12} className={expanded ? css.expandToggleOpen : undefined} />
          </button>
        )}
        <span>{task.id}</span>
        <span>{t('owner')}: {task.ownerName ?? t('unowned')}</span>
        {task.status === 'pending' && <span>{task.ready ? t('ready') : t('blocked')}</span>}
        {task.blockedBy.length > 0 && <span>{t('blockedBy')}: {task.blockedBy.join(', ')}</span>}
        {task.writeScopes.length > 0 && <span>{t('writeScopes')}: {task.writeScopes.join(', ')}</span>}
        {task.writeScopeWarnings.map(warning => <span key={warning} className={css.warning}>{warning}</span>)}
      </div>
    </article>
  )
}

function memberDotState(status: MemberStatus): StateDotState {
  return status === 'running' ? 'ongoing' : 'idle'
}

type RowProps = {
  member: TeamRosterMemberView
  /** The route this row shows next to its status; the Lead's comes from the Session. */
  model: string | undefined
  sessionId: TeamRosterActionProps['sessionId']
  openTeammate: TeamRosterInjected['openTeammate']
  t: TeamRosterActionProps['t']
  onError: (message: string) => void
}

function TeamMemberRow({ member, model, sessionId, openTeammate, onError, t }: RowProps) {
  const status: MemberStatus = member.status === 'running' ? 'running' : 'inactive'
  const isCurrent = member.role === 'captain' || member.childSessionId === sessionId
  const content = (
    <>
      <span className={css.memberDot}>
        {status === 'inactive'
          ? <IconUserOutlineRegular size={14} className={css.inactiveIcon} />
          : <StateDot state={memberDotState(status)} />}
      </span>
      <span className={css.memberText}>
        <span className={css.memberName}>
          <span className={css.memberNameText}>{member.displayName}</span>
          {isCurrent && <Tag tone="info" className={css.currentTag}>{t('current')}</Tag>}
        </span>
        <small>
          {t(memberStatusKey(status))}
          {model !== undefined && (
            <span className={css.memberModel}>{` · ${t('model')}: ${model}`}</span>
          )}
        </small>
      </span>
    </>
  )
  // The Lead row never navigates: back to the Team Lead is the official breadcrumb's
  // job, and the row you are already reading has nowhere to go. Teammates switch.
  if (isCurrent) {
    return (
      <Tooltip label={member.description} side="bottom" gap={4}>
        <div className={`${css.member} ${css.memberCurrent} ${css.memberStatic}`}>{content}</div>
      </Tooltip>
    )
  }

  return (
    <Tooltip label={t('open')} side="bottom" gap={4}>
      <button
        type="button"
        className={css.member}
        onClick={() => {
          try {
            openTeammate(sessionId, member.childSessionId as typeof sessionId)
          } catch (reason) {
            onError(String(reason))
          }
        }}
      >
        {content}
      </button>
    </Tooltip>
  )
}

/** Render the summoned-member roster as the header's Team action. */
export function TeamRosterAction({
  sessionId, openTeammate, roster, useProjection, t,
}: TeamRosterActionProps) {
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<readonly TeamRosterMemberView[]>([])
  const [error, setError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const triggerLabelRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  // rc.2 replaced JS anchored positioning with CSS anchor positioning; the panel
  // names the same anchor the trigger declares, so the popover follows the header
  // control on resize and scroll without measuring.
  const id = useId()
  const anchorStyle = { '--dsh-team-roster-anchor': `--dsh-team-${id.replaceAll(':', '')}` } as CSSProperties
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pinnedRef = useRef(false)

  // The Team Lead carries this Session, so a Session with no roster yet still
  // renders the action once its Team is selected: the Host reports the Lead row.
  const readRoster = roster
  useEffect(() => {
    let live = true
    const read = (): void => {
      void readRoster(String(sessionId)).then((answer) => {
        if (!live) return
        setMembers(answer.members)
      }, (reason: unknown) => {
        if (!live) return
        setError(reason instanceof Error ? reason.message : String(reason))
      })
    }
    read()
    const timer = setInterval(read, ROSTER_REFRESH_MS)
    return () => { live = false; clearInterval(timer) }
  }, [readRoster, sessionId])

  const cancelHoverChange = (): void => {
    clearTimeout(hoverTimer.current)
    hoverTimer.current = undefined
  }

  useEffect(() => {
    cancelHoverChange()
    pinnedRef.current = false
    setOpen(false)
    setError(null)
  }, [sessionId])

  useEffect(() => cancelHoverChange, [])

  useLayoutEffect(() => {
    if (open && pinnedRef.current) panelRef.current?.focus()
  }, [open])

  const changeOpen = (next: boolean): void => {
    cancelHoverChange()
    if (!next) pinnedRef.current = false
    setOpen(next)
  }

  const scheduleHoverOpen = (): void => {
    cancelHoverChange()
    if (open) return
    const label = triggerLabelRef.current
    if (label === null) return
    // Icon-only trigger (label collapsed): hover-open would surprise, so only a
    // click opens it.
    if (getComputedStyle(label).display === 'none') return
    hoverTimer.current = setTimeout(() => {
      hoverTimer.current = undefined
      changeOpen(true)
    }, 150)
  }

  const scheduleHoverClose = (): void => {
    cancelHoverChange()
    if (pinnedRef.current) return
    hoverTimer.current = setTimeout(() => {
      hoverTimer.current = undefined
      changeOpen(false)
    }, 120)
  }

  useDismissOnOutsidePointer(rootRef, open, changeOpen, panelRef)

  useEffect(() => {
    if (!open) return
    const dismiss = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      cancelHoverChange()
      pinnedRef.current = false
      setOpen(false)
      if (panelRef.current?.contains(document.activeElement)) triggerRef.current?.focus()
    }
    document.addEventListener('keydown', dismiss)
    return () => { document.removeEventListener('keydown', dismiss) }
  }, [open])

  // Gated on the deployment's own Team switch for this Session: the roster belongs
  // to the Team that runs here, and a member Session has none of its own.
  const team = useProjection('agentTeam')
  if (team !== undefined && team.enabled !== true) return null
  // Progressive disclosure: a Session whose Team was never selected shows no
  // control at all.
  if (members.length === 0) return null
  // rc.1 listed the Team's shared tasks under its members; the official board shows
  // only when tasks exist, so this section is what a quiet board still reads as.
  const tasks = (team?.tasks ?? []).filter(task => task.status !== 'deleted')
  const compact = members.length === 1 && tasks.length === 0

  return (
    <div ref={rootRef} className={css.root} style={anchorStyle} data-team-action onMouseLeave={scheduleHoverClose}>
      <button
        type="button"
        ref={triggerRef}
        onMouseEnter={scheduleHoverOpen}
        className={css.trigger}
        aria-label={t('trigger')}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          cancelHoverChange()
          pinnedRef.current = true
          if (!open) changeOpen(true)
          else panelRef.current?.focus()
        }}
      >
        <IconUsersOutlineRegular size={14} />
        <span ref={triggerLabelRef} className={css.triggerLabel}>{t('trigger')}</span>
      </button>
      {open && createPortal(
        <div
          ref={panelRef}
          className={compact ? `${css.panel} ${css.panelCompact}` : css.panel}
          style={anchorStyle}
          role="dialog"
          tabIndex={-1}
          aria-label={t('trigger')}
          data-team-panel
          onMouseEnter={cancelHoverChange}
          onMouseLeave={scheduleHoverClose}
        >
          <div className={css.body}>
            {error !== null && (
              <div className={css.error} role="alert"><StateDot state="error" />{error}</div>
            )}
            <section>
              <h3>
                {t('roster')}
                {members.length > 1 && <span className={css.count}>{members.length}</span>}
              </h3>
              <div className={css.roster}>
                {members.map(member => (
                  <TeamMemberRow
                    key={member.name}
                    member={member}
                    model={member.model ?? member.route?.model}
                    sessionId={sessionId}
                    openTeammate={openTeammate}
                    onError={setError}
                    t={t}
                  />
                ))}
              </div>
            </section>
            <section>
              {tasks.length === 0
                ? <p className={css.emptyNotice}>{t('empty')}</p>
                : (
                  <>
                    <h3>{t('tasks')}<span className={css.count}>{tasks.length}</span></h3>
                    <div className={css.tasks}>
                      {tasks.map(task => <TaskCard key={task.id} task={task} t={t} />)}
                    </div>
                  </>
                )}
            </section>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
