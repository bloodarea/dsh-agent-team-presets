import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * First Team preset page: every configured Team as one row. Choosing a row
 * opens that Team's own page.
 */
import { useMemo, useRef, useState } from 'react';
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import { matchTeam, queryTokens, teamOrigin } from "../team-search.js";
import { TEAM_SERIES, teamSeriesOf } from "../team-catalog.js";
import css from './TeamPresetsSection.module.css';
/**
 * Render the Team list.
 * @param props - the Teams, copy, and navigation callbacks.
 * @returns the header, the create and import actions, and one row per Team.
 */
export function TeamListView(props) {
    const { t, disabled } = props;
    const fileInput = useRef(null);
    const [confirmRestore, setConfirmRestore] = useState(false);
    const [query, setQuery] = useState('');
    const [source, setSource] = useState('all');
    const [series, setSeries] = useState('all');
    const [category, setCategory] = useState('');
    const tokens = queryTokens(query);
    const visible = useMemo(() => props.teams.filter((team) => {
        const matchesSource = source === 'all' || teamOrigin(team.id).source === source;
        const matchesSeries = series === 'all' || teamSeriesOf(team.id) === series;
        // An assigned category narrows the list exactly as a chip reads; a Team with
        // no category is simply not in any chip's filter.
        const matchesCategory = category === '' || (props.teamCategories ?? []).some(row => row.teamId === team.id && row.categoryId === category);
        // The shared matcher decides what a token matches, so the list and the
        // composer picker can never disagree about which Teams a query finds.
        const matchesQuery = tokens.length === 0 || matchTeam(team, tokens) !== undefined;
        return matchesSource && matchesSeries && matchesCategory && matchesQuery;
    }), [props.teams, props.teamCategories, source, series, category, tokens]);
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: css.pageHead, children: [_jsx("h2", { className: css.title, children: t('title') }), _jsx("p", { className: css.intro, children: t('description') })] }), (props.missingBuiltins ?? 0) === 0 ? null : (_jsxs("div", { className: css.restoreHint, role: "status", children: [_jsx("span", { children: t('restoreMissingHint').replace('{count}', String(props.missingBuiltins)) }), _jsx(Button, { size: "sm", variant: "outline", disabled: disabled, onClick: () => { setConfirmRestore(true); }, children: t('restoreDefaults') })] })), _jsxs("div", { className: css.toolbar, children: [_jsxs("div", { className: css.toolbarGroup, children: [_jsx(Button, { size: "sm", variant: "primary", disabled: disabled, onClick: props.onCreate, children: t('newTeam') }), _jsx(Button, { size: "sm", variant: "outline", disabled: disabled, title: t('importNote'), onClick: () => { fileInput.current?.click(); }, children: t('importPreset') })] }), _jsxs("div", { className: css.toolbarGroup, children: [props.onManageCategories === undefined ? null : (_jsx(Button, { size: "sm", variant: "outline", onClick: props.onManageCategories, children: t('categoryManagePage') })), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled, onClick: () => { setConfirmRestore(true); }, children: t('restoreDefaults') })] }), _jsx("input", { ref: fileInput, className: css.fileInput, type: "file", accept: "application/json,.json", disabled: disabled, onChange: (event) => {
                            const file = event.target.files?.[0];
                            // Clearing the value lets the same document be chosen twice in a row.
                            event.target.value = '';
                            if (file !== undefined)
                                props.onImport(file);
                        } })] }), confirmRestore ? (_jsx(Modal, { open: true, onClose: () => { setConfirmRestore(false); }, title: t('restoreConfirmTitle'), closeLabel: t('close'), footer: (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: () => { setConfirmRestore(false); }, children: t('cancel') }), _jsx(Button, { variant: "primary", onClick: () => { setConfirmRestore(false); props.onRestoreDefaults(); }, children: t('restoreConfirmAction') })] })), children: _jsx("p", { className: css.dialogCopy, children: t('restoreConfirmBody') }) })) : null, props.importError === undefined
                ? null
                : _jsx("p", { className: css.warn, role: "status", children: t(props.importError) }), _jsx("div", { className: css.listToolbar, children: _jsx("input", { className: css.listSearch, value: query, placeholder: t('listSearch'), onChange: (event) => { setQuery(event.target.value); } }) }), _jsxs("div", { className: css.filters, children: [_jsxs("div", { className: css.filterRow, children: [_jsx("span", { className: css.filterLabel, children: t('filterSource') }), _jsx("button", { type: "button", className: `${css.chip} ${source === 'all' ? css.chipActive : ''}`, onClick: () => { setSource('all'); }, children: t('listAll') }), _jsx("button", { type: "button", className: `${css.chip} ${source === 'builtin' ? css.chipActive : ''}`, onClick: () => { setSource('builtin'); setCategory(''); }, children: t('listBuiltin') }), _jsx("button", { type: "button", className: `${css.chip} ${source === 'custom' ? css.chipActive : ''}`, onClick: () => { setSource('custom'); setSeries('all'); }, children: t('listCustom') })] }), _jsxs("div", { className: css.filterRow, children: [_jsx("span", { className: css.filterLabel, children: t('filterCategory') }), _jsx("button", { type: "button", className: `${css.chip} ${series === 'all' && category === '' ? css.chipActive : ''}`, onClick: () => { setSeries('all'); setCategory(''); }, children: t('listAll') }), source !== 'custom' ? TEAM_SERIES.map(entry => (_jsx("button", { type: "button", className: `${css.chip} ${series === entry.id ? css.chipActive : ''}`, onClick: () => { setSeries(series === entry.id ? 'all' : entry.id); setCategory(''); }, children: entry.id === 'classic-development' ? t('seriesDevelopment') : t('seriesWorkModes') }, entry.id))) : null, source !== 'builtin' ? [...(props.categories ?? [])].sort((left, right) => left.order - right.order).map(entry => (_jsx("button", { type: "button", className: `${css.chip} ${category === entry.id ? css.chipActive : ''}`, onClick: () => { setCategory(category === entry.id ? '' : entry.id); setSeries('all'); }, children: entry.name }, entry.id))) : null, source === 'custom' && (props.categories ?? []).length === 0
                                ? _jsx("span", { className: css.filterLabel, children: t('filterNoCategory') })
                                : null] })] }), _jsxs("div", { className: css.resultsHead, children: [_jsx("span", { className: css.resultCount, children: t('listResultCount').replace('{count}', String(visible.length)) }), _jsx("span", { className: css.resultNote, children: t('listNoInject') })] }), props.teams.length === 0
                ? _jsx("p", { className: css.emptyPage, children: t('emptyTeams') })
                : (_jsxs("ul", { className: css.rows, children: [visible.length === 0 ? _jsx("li", { className: css.rowsEmpty, children: t('listNoMatch') }) : null, visible.map(team => (_jsxs("li", { className: css.card, "data-series": teamSeriesOf(team.id) ?? '', children: [_jsxs("button", { type: "button", className: css.rowMain, onClick: () => { props.onOpen(team.id); }, children: [_jsx("span", { className: css.dot, style: team.captain.color === '' ? undefined : { background: team.captain.color }, "aria-hidden": true }), _jsxs("span", { className: css.rowText, children: [_jsx("span", { className: css.rowName, children: team.name === '' ? team.id : team.name }), _jsx("span", { className: css.rowMeta, children: `${String(team.members.length)} ${t('memberCount')} · ${t('captainFollowsSession')}` })] })] }), _jsxs("span", { className: css.rowActions, children: [_jsx(Button, { size: "sm", variant: "ghost", title: t('importNote'), onClick: () => { props.onExport(team.id); }, children: t('exportPreset') }), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled, onClick: () => { props.onDuplicate(team.id); }, children: t('duplicate') }), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled, onClick: () => { props.onDelete(team.id); }, children: t('remove') })] })] }, team.id)))] }))] }));
}
