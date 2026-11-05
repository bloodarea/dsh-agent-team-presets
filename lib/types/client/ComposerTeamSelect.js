import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * The composer's Team control: pick the Team preset that leads this Session, or
 * hover a Team to talk to one of its members on its own.
 *
 * It sits in the composer tool row after the permission control.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { IconChevronDownOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives';
import { selectedMember, selectedRoleId, selectedTeam } from "../presets.js";
import { TEAM_SERIES } from "../team-catalog.js";
import { matchTeam, orderedCategories, queryTokens, teamOrigin } from "../team-search.js";
import { groupTeams, matchesCategoryFilter } from "./team-grouping.js";
import { FORM_ISSUE_KEYS, selectionFailureText } from "./locales.js";
import css from './ComposerTeamSelect.module.css';
/** How long the member panel survives while the pointer crosses the gap to it. */
const PANEL_GRACE_MS = 140;
/** Gap between the picker and the panel, matching the dock's CSS gap. */
const PANEL_GAP_PX = 8;
/** Space kept between the panel and the viewport edge before it flips sides. */
const PANEL_VIEWPORT_MARGIN_PX = 8;
/**
 * Render one member's configured route as `provider · model`.
 *
 * An empty provider and model is the Session route, which the caller renders
 * with its own locale key. A provider or model the catalogue no longer lists
 * still shows its stored identity, so a row never claims a route it cannot name.
 * @param providers - provider choices the catalogue currently offers.
 * @param member - the member whose route to render.
 * @returns the route label, or undefined when the member follows the Session.
 */
function memberRouteLabel(providers, member) {
    // The Host only selects a route when BOTH ids are present; a half-configured
    // pair therefore runs on the Session model, and the panel must say so.
    if (member.provider.trim() === '' || member.model.trim() === '')
        return undefined;
    const provider = providers.find(entry => entry.id === member.provider);
    const model = provider?.models.find(entry => entry.id === member.model);
    const parts = [provider?.name ?? member.provider, model?.name ?? member.model].filter(part => part.trim() !== '');
    return parts.length === 0 ? undefined : parts.join(' · ');
}
/**
 * Render the composer's Team picker.
 * @param props - the Session identity, the page's locale reader, and the selection writers.
 * @returns the Team trigger, the picker with its member panel, and a notice when the last selection write failed.
 */
export function ComposerTeamSelect(props) {
    const { t, sessionId } = props;
    const state = props.useTeamPresets(snapshot => snapshot);
    const [open, setOpen] = useState(false);
    // The Team whose member panel is showing: a hover or a keyboard focus keeps it
    // up while the pointer crosses the gap between the picker and the panel.
    const [hoverTeamId, setHoverTeamId] = useState(undefined);
    // Where the panel opens: beside the picker by default, flipped to its left
    // when the right side would overflow, and over the picker when neither side
    // has room for it.
    const [panelPlacement, setPanelPlacement] = useState('right');
    const popover = useRef(null);
    const dock = useRef(null);
    const panel = useRef(null);
    const hoverTimer = useRef(undefined);
    const selection = state.selections.find(row => row.sessionId === String(sessionId));
    const active = selectedTeam(state.teams, state.selections, String(sessionId));
    // A stored role identity that no longer names a member of the selected Team
    // is a missing selection, never a silent fall back to the captain: the Host
    // refuses that Session's tools, so the control must say so.
    const roleId = selectedRoleId(selection);
    const activeMember = selectedMember(state.teams, state.selections, String(sessionId));
    const missingTeam = selection !== undefined && active === undefined;
    const missingMember = active !== undefined && roleId !== undefined && activeMember === undefined;
    const missing = missingTeam || missingMember;
    const missingLabel = missingTeam
        ? t('composerMissing').replace('{team}', selection?.teamId ?? '')
        : missingMember
            ? t('composerMissingMember')
                .replace('{team}', active.name.trim() === '' ? active.id : active.name)
                .replace('{member}', roleId ?? '')
            : '';
    // A member carries its own accent; the captain's Team color is the fallback
    // for a member that configures none, so the trigger never loses its dot.
    const accent = active === undefined ? '' : activeMember === undefined ? active.captain.color : activeMember.color;
    const triggerLabel = missing
        ? missingLabel
        : active === undefined
            ? t('composerNone')
            : activeMember === undefined
                ? (active.name === '' ? active.id : active.name)
                : `${active.name === '' ? active.id : active.name} · ${activeMember.name.trim() === '' ? (activeMember.id ?? '') : activeMember.name}`;
    // A selection the Host refused is reported here, on the control the user
    // clicked: the trigger's own title carries it and a sibling notice makes it
    // visible without a hover, because the failure this replaces was exactly a
    // click that left no trace anywhere. A document this page cannot use says so
    // in the title too, so a disabled trigger is never a dead end.
    const failure = state.selectionFailure === undefined ? undefined : selectionFailureText(state.selectionFailure, t);
    const issue = state.formIssue === undefined ? undefined : t(FORM_ISSUE_KEYS[state.formIssue]);
    const writable = state.status === 'ready' && state.writable;
    const [query, setQuery] = useState('');
    const [source, setSource] = useState('all');
    const [series, setSeries] = useState('all');
    const [categoryId, setCategoryId] = useState('');
    /** Cancel a pending panel close, so a hover that continues keeps the panel up. */
    const cancelHoverClose = () => {
        if (hoverTimer.current === undefined)
            return;
        clearTimeout(hoverTimer.current);
        hoverTimer.current = undefined;
    };
    /** Show the panel of one Team and cancel any close the previous row scheduled. */
    const showPanel = (teamId) => {
        cancelHoverClose();
        setHoverTeamId(teamId);
    };
    /** Schedule the panel close that a pointer or focus leaving a row starts. */
    const schedulePanelClose = () => {
        cancelHoverClose();
        hoverTimer.current = setTimeout(() => {
            hoverTimer.current = undefined;
            setHoverTeamId(undefined);
        }, PANEL_GRACE_MS);
    };
    /** Close the picker and forget the panel it was showing. */
    const closePicker = () => {
        cancelHoverClose();
        setHoverTeamId(undefined);
        setPanelPlacement('right');
        setOpen(false);
    };
    // A closed picker must never reopen on the Team the last visit happened to
    // leave hovered, and its timer must not outlive the panel it would close.
    useEffect(() => {
        if (open)
            return;
        cancelHoverClose();
        setHoverTeamId(undefined);
        setPanelPlacement('right');
    }, [open]);
    // Close on Escape or on a press outside, which is what a popover that is not a
    // native menu has to do itself.
    useEffect(() => {
        if (!open)
            return;
        const onKey = (event) => { if (event.key === 'Escape')
            closePicker(); };
        const onDown = (event) => {
            const node = popover.current;
            if (node !== null && event.target instanceof Node && !node.contains(event.target))
                closePicker();
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onDown);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onDown);
        };
    }, [open]);
    useEffect(() => () => { cancelHoverClose(); }, []);
    const hoverTeam = hoverTeamId === undefined ? undefined : state.teams.find(team => team.id === hoverTeamId);
    // Keep the panel beside the picker whenever it fits there, flip it to the
    // left when only that side has room, and fall back to the overlay above the
    // picker when neither side does — a panel that opens half off-screen cannot
    // be clicked, and CSS alone cannot know the width the picker actually took.
    useLayoutEffect(() => {
        if (!open || hoverTeam === undefined) {
            setPanelPlacement('right');
            return;
        }
        const measure = () => {
            const dockNode = dock.current;
            const panelNode = panel.current;
            if (dockNode === null || panelNode === null)
                return;
            const dockRect = dockNode.getBoundingClientRect();
            const width = panelNode.getBoundingClientRect().width;
            const overflowsRight = dockRect.right + PANEL_GAP_PX + width > window.innerWidth - PANEL_VIEWPORT_MARGIN_PX;
            if (!overflowsRight) {
                setPanelPlacement('right');
                return;
            }
            const roomOnLeft = dockRect.left - PANEL_GAP_PX - width >= PANEL_VIEWPORT_MARGIN_PX;
            setPanelPlacement(roomOnLeft ? 'left' : 'overlay');
        };
        measure();
        window.addEventListener('resize', measure);
        return () => { window.removeEventListener('resize', measure); };
    }, [open, hoverTeam]);
    const tokens = queryTokens(query);
    const categories = useMemo(() => orderedCategories(state.categories), [state.categories]);
    // The same taxonomy as the settings list: source, then the series or the
    // reader's own categories, with placement winning over the shipped series.
    const groups = useMemo(() => groupTeams(state.teams.filter((team) => {
        const matchesSource = source === 'all' || teamOrigin(team.id).source === source;
        const matchesCategory = matchesCategoryFilter(team, series, categoryId, state.teamCategories);
        const matchesQuery = tokens.length === 0 || matchTeam(team, tokens) !== undefined;
        return matchesSource && matchesCategory && matchesQuery;
    }), state.categories, state.teamCategories), [state.teams, state.categories, state.teamCategories, source, series, categoryId, tokens]);
    const groupLabel = (group) => {
        if (group.kind === 'series')
            return group.series === 'classic-development' ? t('composeSeriesDev') : t('composeSeriesModes');
        if (group.kind === 'category') {
            return categories.find(entry => entry.id === group.categoryId)?.name ?? group.categoryId ?? '';
        }
        return t('composeUncategorized');
    };
    const choose = (teamId) => {
        closePicker();
        void props.selectTeam(String(sessionId), teamId);
    };
    const chooseMember = (teamId, memberId) => {
        closePicker();
        void props.selectMember(String(sessionId), teamId, memberId);
    };
    /** Whether the panel row is the selection this Session currently talks to. */
    const isActiveCaptain = (team) => selection?.teamId === team.id && roleId === undefined;
    const isActiveMember = (team, member) => selection?.teamId === team.id && roleId !== undefined && member.id === roleId;
    /** Keep the panel up while focus moves between the picker and the panel. */
    const onDockBlur = (event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) {
            // The row's own blur scheduled a close before this bubbled here; focus
            // moving into the panel is exactly the case that close must be cancelled.
            cancelHoverClose();
            return;
        }
        schedulePanelClose();
    };
    return (_jsxs(_Fragment, { children: [_jsxs("span", { className: css.wrap, ref: popover, children: [_jsxs("button", { type: "button", className: activeMember === undefined ? css.trigger : `${css.trigger} ${css.triggerMember}`, disabled: !writable, "aria-haspopup": "listbox", "aria-expanded": open, title: failure ?? issue ?? (missing ? `${missingLabel}. ${t('composerMissingHint')}` : t('composerHint')), onClick: () => { setOpen(value => !value); }, children: [accent === ''
                                ? null
                                : (_jsx("span", { className: css.accentDot, style: { background: accent }, "aria-hidden": true })), _jsx("span", { className: css.triggerLabel, "aria-label": t('composerTitle'), children: triggerLabel }), _jsx("span", { className: css.triggerIcon, children: _jsx(IconChevronDownOutlineRegular, { size: 14 }) })] }), open ? (_jsxs("div", { className: css.dock, ref: dock, onBlur: onDockBlur, children: [_jsxs("div", { className: css.popover, role: "listbox", "aria-label": t('composeTitle'), children: [_jsxs("div", { className: css.popHead, children: [_jsx("span", { children: t('composeTitle') }), _jsx("button", { type: "button", className: css.popClose, onClick: () => { closePicker(); }, children: t('composeClose') })] }), _jsx("input", { className: css.popSearch, autoFocus: true, value: query, placeholder: t('composeSearch'), onChange: (event) => { setQuery(event.target.value); } }), _jsxs("div", { className: css.popChips, children: [_jsx("span", { className: css.popFilterLabel, children: t('filterSource') }), _jsx("button", { type: "button", className: `${css.popChip} ${source === 'all' ? css.popChipActive : ''}`, onClick: () => { setSource('all'); }, children: t('listAll') }), _jsx("button", { type: "button", className: `${css.popChip} ${source === 'builtin' ? css.popChipActive : ''}`, onClick: () => { setSource('builtin'); setCategoryId(''); }, children: t('listBuiltin') }), _jsx("button", { type: "button", className: `${css.popChip} ${source === 'custom' ? css.popChipActive : ''}`, onClick: () => { setSource('custom'); setSeries('all'); }, children: t('listCustom') })] }), _jsxs("div", { className: css.popChips, children: [_jsx("span", { className: css.popFilterLabel, children: t('filterCategory') }), _jsx("button", { type: "button", className: `${css.popChip} ${series === 'all' && categoryId === '' ? css.popChipActive : ''}`, onClick: () => { setSeries('all'); setCategoryId(''); }, children: t('listAll') }), source !== 'custom' ? TEAM_SERIES.map(entry => (_jsx("button", { type: "button", className: `${css.popChip} ${series === entry.id ? css.popChipActive : ''}`, onClick: () => { setSeries(series === entry.id ? 'all' : entry.id); setCategoryId(''); }, children: entry.id === 'classic-development' ? t('seriesDevelopment') : t('seriesWorkModes') }, entry.id))) : null, source !== 'builtin' ? categories.map(entry => (_jsx("button", { type: "button", className: `${css.popChip} ${categoryId === entry.id ? css.popChipActive : ''}`, onClick: () => { setCategoryId(categoryId === entry.id ? '' : entry.id); setSeries('all'); }, children: entry.name }, entry.id))) : null, source === 'custom' && categories.length === 0
                                                ? _jsx("span", { className: css.popFilterLabel, children: t('filterNoCategory') })
                                                : null] }), _jsxs("div", { className: css.popList, children: [_jsxs("button", { type: "button", className: `${css.popOption} ${selection === undefined ? css.popOptionActive : ''}`, onClick: () => { choose(undefined); }, children: [_jsx("span", { className: css.popOptionName, children: t('composerNone') }), _jsx("span", { className: css.popOptionSub, children: t('composeNoneSub') })] }), missing ? (_jsxs("button", { type: "button", className: css.popOption, disabled: true, children: [_jsx("span", { className: css.popOptionName, children: missingLabel }), _jsx("span", { className: css.popOptionSub, children: t('composerMissingHint') })] })) : null, groups.map(group => group.teams.length === 0 ? null : (_jsxs("div", { children: [_jsx("div", { className: css.popGroup, children: groupLabel(group) }), group.teams.map((team) => (_jsxs("button", { type: "button", role: "option", "aria-selected": selection?.teamId === team.id, className: `${css.popOption} ${selection?.teamId === team.id ? css.popOptionActive : ''}`, onClick: () => { choose(team.id); }, onMouseEnter: () => { showPanel(team.id); }, onMouseLeave: schedulePanelClose, onFocus: () => { showPanel(team.id); }, onBlur: schedulePanelClose, children: [_jsx("span", { className: css.popOptionName, children: team.name === '' ? team.id : team.name }), _jsx("span", { className: css.popOptionSub, title: team.description, children: team.description || team.metadata?.summary || '' })] }, team.id)))] }, group.id))), groups.every(group => group.teams.length === 0) ? _jsx("div", { className: css.popEmpty, children: t('composeEmpty') }) : null] })] }), hoverTeam === undefined ? null : (_jsxs("div", { ref: panel, className: `${css.memberPanel} ${panelPlacement === 'left' ? css.memberPanelLeft : panelPlacement === 'overlay' ? css.memberPanelOverlay : ''}`, role: "group", "aria-label": t('composePanelTitle'), onMouseEnter: cancelHoverClose, onMouseLeave: schedulePanelClose, children: [_jsxs("div", { className: css.panelHead, children: [_jsx("span", { className: css.panelTitle, children: t('composePanelTitle') }), _jsx("span", { className: css.panelTeam, children: hoverTeam.name === '' ? hoverTeam.id : hoverTeam.name })] }), _jsx("div", { className: css.panelSection, children: t('composePanelCaptain') }), _jsxs("button", { type: "button", className: `${css.panelRow} ${isActiveCaptain(hoverTeam) ? css.panelRowActive : ''}`, "aria-pressed": isActiveCaptain(hoverTeam), title: t('composePanelCaptainHint'), onClick: () => { choose(hoverTeam.id); }, children: [_jsxs("span", { className: css.panelRowHead, children: [_jsx("span", { className: css.panelDot, style: hoverTeam.captain.color === '' ? undefined : { background: hoverTeam.captain.color }, "aria-hidden": true }), _jsx("span", { className: css.panelName, children: hoverTeam.captain.name.trim() === '' ? t('composePanelCaptain') : hoverTeam.captain.name }), _jsx("span", { className: css.panelBadge, children: t('composePanelCaptain') })] }), _jsx("span", { className: css.panelRoute, children: t('composePanelSessionModel') }), hoverTeam.captain.description.trim() === '' ? null : _jsx("span", { className: css.panelDesc, children: hoverTeam.captain.description })] }), _jsx("div", { className: css.panelSection, children: t('composePanelMembers') }), hoverTeam.members.length === 0
                                        ? _jsx("div", { className: css.panelEmpty, children: t('composePanelEmptyMembers') })
                                        : hoverTeam.members.map((member, index) => {
                                            // A member without a stable identity cannot be named by a
                                            // selection, so it is shown disabled with the reason rather
                                            // than offered as a click that would write nothing usable.
                                            const selectable = member.id !== undefined && member.id.trim() !== '';
                                            const route = memberRouteLabel(state.providers, member) ?? t('composePanelSessionModel');
                                            return (_jsxs("button", { type: "button", className: `${css.panelRow} ${isActiveMember(hoverTeam, member) ? css.panelRowActive : ''}`, "aria-pressed": isActiveMember(hoverTeam, member), disabled: !selectable, title: selectable ? t('composePanelSoloHint') : t('composePanelNoId'), onClick: () => {
                                                    if (member.id === undefined || member.id.trim() === '')
                                                        return;
                                                    chooseMember(hoverTeam.id, member.id);
                                                }, children: [_jsxs("span", { className: css.panelRowHead, children: [_jsx("span", { className: css.panelDot, style: member.color === '' ? undefined : { background: member.color }, "aria-hidden": true }), _jsx("span", { className: css.panelName, children: member.name.trim() === '' ? (member.id ?? t('composePanelMembers')) : member.name })] }), _jsx("span", { className: css.panelRoute, children: route }), member.description.trim() === '' ? null : _jsx("span", { className: css.panelDesc, children: member.description }), selectable ? null : _jsx("span", { className: css.panelDesc, children: t('composePanelNoId') })] }, member.id ?? `${hoverTeam.id}:${index}`));
                                        }), _jsx("div", { className: css.panelHint, children: hoverTeam.members.length === 0 ? t('composePanelCaptainHint') : t('composePanelSoloHint') })] }))] })) : null] }), failure === undefined ? null : _jsx("span", { className: css.failure, role: "status", children: failure })] }));
}
