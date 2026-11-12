import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * The conversation-header Team roster.
 *
 * Ported from the rc.1 official `agent-team` header action: same slot, same
 * order, same icon/label/hover-popover behaviour and stylesheet. rc.2 folded
 * Teams into the subagent tree and kept only the task board, so the roster rows
 * are reconstructed from this plugin's member snapshots instead of the removed
 * Team projection.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconChevronDownOutlineRegular, IconUserOutlineRegular, IconUsersOutlineRegular, StateDot, Tag, Tooltip, useDismissOnOutsidePointer, } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './TeamRosterAction.module.css';
/** How often the open, or merely present, roster re-reads the Host. */
const ROSTER_REFRESH_MS = 4000;
function memberStatusKey(status) {
    return status === 'running' ? 'memberStatus.running' : 'memberStatus.inactive';
}
function statusKey(status) {
    switch (status) {
        case 'pending': return 'status.pending';
        case 'in_progress': return 'status.in_progress';
        case 'completed': return 'status.completed';
        /* v8 ignore next -- deleted tombstones are filtered before rendering. */
        case 'deleted': return 'status.completed';
    }
}
function taskDotState(task) {
    switch (task.status) {
        case 'pending': return task.ready ? 'idle' : 'warning';
        case 'in_progress': return 'ongoing';
        case 'completed': return 'done';
        /* v8 ignore next -- deleted tombstones are filtered before rendering. */
        case 'deleted': return 'idle';
    }
}
/** One shared task, with rc.1's two-line description clamp and meta row. */
function TaskCard({ task, t }) {
    const [expanded, setExpanded] = useState(false);
    const [clamped, setClamped] = useState(false);
    const textRef = useRef(null);
    useLayoutEffect(() => {
        if (expanded)
            return;
        const paragraph = textRef.current;
        /* v8 ignore next -- the paragraph mounts in the same commit as the effect. */
        if (paragraph === null)
            return;
        const measure = () => { setClamped(paragraph.scrollHeight > paragraph.clientHeight + 1); };
        measure();
        if (typeof ResizeObserver === 'undefined')
            return;
        const observer = new ResizeObserver(measure);
        observer.observe(paragraph);
        return () => { observer.disconnect(); };
    }, [task.description, expanded]);
    return (_jsxs("article", { className: css.task, children: [_jsxs("div", { className: css.taskTitle, children: [_jsx("strong", { children: task.subject }), _jsxs("span", { className: css.taskState, children: [_jsx(StateDot, { state: taskDotState(task) }), _jsx("span", { children: t(statusKey(task.status)) })] })] }), _jsx("p", { ref: textRef, className: expanded ? undefined : css.clampedDescription, children: task.description }), _jsxs("div", { className: css.meta, children: [(clamped || expanded) && (_jsxs("button", { type: "button", className: css.expandToggle, "aria-expanded": expanded, onClick: () => { setExpanded(current => !current); }, children: [t(expanded ? 'task.collapse' : 'task.expand'), _jsx(IconChevronDownOutlineRegular, { size: 12, className: expanded ? css.expandToggleOpen : undefined })] })), _jsx("span", { children: task.id }), _jsxs("span", { children: [t('owner'), ": ", task.ownerName ?? t('unowned')] }), task.status === 'pending' && _jsx("span", { children: task.ready ? t('ready') : t('blocked') }), task.blockedBy.length > 0 && _jsxs("span", { children: [t('blockedBy'), ": ", task.blockedBy.join(', ')] }), task.writeScopes.length > 0 && _jsxs("span", { children: [t('writeScopes'), ": ", task.writeScopes.join(', ')] }), task.writeScopeWarnings.map(warning => _jsx("span", { className: css.warning, children: warning }, warning))] })] }));
}
function memberDotState(status) {
    return status === 'running' ? 'ongoing' : 'idle';
}
function TeamMemberRow({ member, model, sessionId, openTeammate, onError, t }) {
    const status = member.status === 'running' ? 'running' : 'inactive';
    const isCurrent = member.role === 'captain' || member.childSessionId === sessionId;
    const content = (_jsxs(_Fragment, { children: [_jsx("span", { className: css.memberDot, children: status === 'inactive'
                    ? _jsx(IconUserOutlineRegular, { size: 14, className: css.inactiveIcon })
                    : _jsx(StateDot, { state: memberDotState(status) }) }), _jsxs("span", { className: css.memberText, children: [_jsxs("span", { className: css.memberName, children: [_jsx("span", { className: css.memberNameText, children: member.displayName }), isCurrent && _jsx(Tag, { tone: "info", className: css.currentTag, children: t('current') })] }), _jsxs("small", { children: [t(memberStatusKey(status)), model !== undefined && (_jsx("span", { className: css.memberModel, children: ` · ${t('model')}: ${model}` }))] })] })] }));
    // The Lead row never navigates: back to the Team Lead is the official breadcrumb's
    // job, and the row you are already reading has nowhere to go. Teammates switch.
    if (isCurrent) {
        return (_jsx(Tooltip, { label: member.description, side: "bottom", gap: 4, children: _jsx("div", { className: `${css.member} ${css.memberCurrent} ${css.memberStatic}`, children: content }) }));
    }
    return (_jsx(Tooltip, { label: t('open'), side: "bottom", gap: 4, children: _jsx("button", { type: "button", className: css.member, onClick: () => {
                try {
                    openTeammate(sessionId, member.childSessionId);
                }
                catch (reason) {
                    onError(String(reason));
                }
            }, children: content }) }));
}
/** Render the summoned-member roster as the header's Team action. */
export function TeamRosterAction({ sessionId, openTeammate, roster, useProjection, t, }) {
    const [open, setOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const triggerLabelRef = useRef(null);
    const panelRef = useRef(null);
    // rc.2 replaced JS anchored positioning with CSS anchor positioning; the panel
    // names the same anchor the trigger declares, so the popover follows the header
    // control on resize and scroll without measuring.
    const id = useId();
    const anchorStyle = { '--dsh-team-roster-anchor': `--dsh-team-${id.replaceAll(':', '')}` };
    const hoverTimer = useRef(undefined);
    const pinnedRef = useRef(false);
    // The Team Lead carries this Session, so a Session with no roster yet still
    // renders the action once its Team is selected: the Host reports the Lead row.
    const readRoster = roster;
    useEffect(() => {
        let live = true;
        const read = () => {
            void readRoster(String(sessionId)).then((answer) => {
                if (!live)
                    return;
                setMembers(answer.members);
            }, (reason) => {
                if (!live)
                    return;
                setError(reason instanceof Error ? reason.message : String(reason));
            });
        };
        read();
        const timer = setInterval(read, ROSTER_REFRESH_MS);
        return () => { live = false; clearInterval(timer); };
    }, [readRoster, sessionId]);
    const cancelHoverChange = () => {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = undefined;
    };
    useEffect(() => {
        cancelHoverChange();
        pinnedRef.current = false;
        setOpen(false);
        setError(null);
    }, [sessionId]);
    useEffect(() => cancelHoverChange, []);
    useLayoutEffect(() => {
        if (open && pinnedRef.current)
            panelRef.current?.focus();
    }, [open]);
    const changeOpen = (next) => {
        cancelHoverChange();
        if (!next)
            pinnedRef.current = false;
        setOpen(next);
    };
    const scheduleHoverOpen = () => {
        cancelHoverChange();
        if (open)
            return;
        const label = triggerLabelRef.current;
        if (label === null)
            return;
        // Icon-only trigger (label collapsed): hover-open would surprise, so only a
        // click opens it.
        if (getComputedStyle(label).display === 'none')
            return;
        hoverTimer.current = setTimeout(() => {
            hoverTimer.current = undefined;
            changeOpen(true);
        }, 150);
    };
    const scheduleHoverClose = () => {
        cancelHoverChange();
        if (pinnedRef.current)
            return;
        hoverTimer.current = setTimeout(() => {
            hoverTimer.current = undefined;
            changeOpen(false);
        }, 120);
    };
    useDismissOnOutsidePointer(rootRef, open, changeOpen, panelRef);
    useEffect(() => {
        if (!open)
            return;
        const dismiss = (event) => {
            if (event.key !== 'Escape')
                return;
            event.preventDefault();
            cancelHoverChange();
            pinnedRef.current = false;
            setOpen(false);
            if (panelRef.current?.contains(document.activeElement))
                triggerRef.current?.focus();
        };
        document.addEventListener('keydown', dismiss);
        return () => { document.removeEventListener('keydown', dismiss); };
    }, [open]);
    // Gated on the deployment's own Team switch for this Session: the roster belongs
    // to the Team that runs here, and a member Session has none of its own.
    const team = useProjection('agentTeam');
    if (team !== undefined && team.enabled !== true)
        return null;
    // Progressive disclosure: a Session whose Team was never selected shows no
    // control at all.
    if (members.length === 0)
        return null;
    // rc.1 listed the Team's shared tasks under its members; the official board shows
    // only when tasks exist, so this section is what a quiet board still reads as.
    const tasks = (team?.tasks ?? []).filter(task => task.status !== 'deleted');
    const compact = members.length === 1 && tasks.length === 0;
    return (_jsxs("div", { ref: rootRef, className: css.root, style: anchorStyle, "data-team-action": true, onMouseLeave: scheduleHoverClose, children: [_jsxs("button", { type: "button", ref: triggerRef, onMouseEnter: scheduleHoverOpen, className: css.trigger, "aria-label": t('trigger'), "aria-haspopup": "dialog", "aria-expanded": open, onClick: () => {
                    cancelHoverChange();
                    pinnedRef.current = true;
                    if (!open)
                        changeOpen(true);
                    else
                        panelRef.current?.focus();
                }, children: [_jsx(IconUsersOutlineRegular, { size: 14 }), _jsx("span", { ref: triggerLabelRef, className: css.triggerLabel, children: t('trigger') })] }), open && createPortal(_jsx("div", { ref: panelRef, className: compact ? `${css.panel} ${css.panelCompact}` : css.panel, style: anchorStyle, role: "dialog", tabIndex: -1, "aria-label": t('trigger'), "data-team-panel": true, onMouseEnter: cancelHoverChange, onMouseLeave: scheduleHoverClose, children: _jsxs("div", { className: css.body, children: [error !== null && (_jsxs("div", { className: css.error, role: "alert", children: [_jsx(StateDot, { state: "error" }), error] })), _jsxs("section", { children: [_jsxs("h3", { children: [t('roster'), members.length > 1 && _jsx("span", { className: css.count, children: members.length })] }), _jsx("div", { className: css.roster, children: members.map(member => (_jsx(TeamMemberRow, { member: member, model: member.model ?? member.route?.model, sessionId: sessionId, openTeammate: openTeammate, onError: setError, t: t }, member.name))) })] }), _jsx("section", { children: tasks.length === 0
                                ? _jsx("p", { className: css.emptyNotice, children: t('empty') })
                                : (_jsxs(_Fragment, { children: [_jsxs("h3", { children: [t('tasks'), _jsx("span", { className: css.count, children: tasks.length })] }), _jsx("div", { className: css.tasks, children: tasks.map(task => _jsx(TaskCard, { task: task, t: t }, task.id)) })] })) })] }) }), document.body)] }));
}
