import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * First Team preset page: every configured Team as one row. Choosing a row
 * opens that Team's own page.
 */
import { useRef } from 'react';
import { Button } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './TeamPresetsSection.module.css';
/**
 * Render the Team list.
 * @param props - the Teams, copy, and navigation callbacks.
 * @returns the header, the create and import actions, and one row per Team.
 */
export function TeamListView(props) {
    const { t, disabled } = props;
    const fileInput = useRef(null);
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: css.pageHead, children: [_jsx("h2", { className: css.title, children: t('title') }), _jsx("p", { className: css.intro, children: t('description') })] }), _jsxs("div", { className: css.actionRow, children: [_jsx(Button, { size: "sm", variant: "outline", disabled: disabled, onClick: props.onCreate, children: t('newTeam') }), _jsx(Button, { size: "sm", variant: "outline", disabled: disabled, onClick: () => { fileInput.current?.click(); }, children: t('importPreset') }), _jsx("input", { ref: fileInput, className: css.fileInput, type: "file", accept: "application/json,.json", disabled: disabled, onChange: (event) => {
                            const file = event.target.files?.[0];
                            // Clearing the value lets the same document be chosen twice in a row.
                            event.target.value = '';
                            if (file !== undefined)
                                props.onImport(file);
                        } })] }), _jsx("p", { className: css.hint, children: t('importNote') }), props.importError === undefined
                ? null
                : _jsx("p", { className: css.warn, role: "status", children: t(props.importError) }), props.teams.length === 0
                ? _jsx("p", { className: css.empty, children: t('emptyTeams') })
                : (_jsx("ul", { className: css.rows, children: props.teams.map(team => (_jsxs("li", { className: css.card, children: [_jsxs("button", { type: "button", className: css.rowMain, onClick: () => { props.onOpen(team.id); }, children: [_jsx("span", { className: css.dot, style: team.captain.color === '' ? undefined : { background: team.captain.color }, "aria-hidden": true }), _jsxs("span", { className: css.rowText, children: [_jsx("span", { className: css.rowName, children: team.name === '' ? team.id : team.name }), _jsx("span", { className: css.rowMeta, children: `${String(team.members.length)} ${t('memberCount')} · ${t('captainFollowsSession')}` })] })] }), _jsxs("span", { className: css.rowActions, children: [_jsx(Button, { size: "sm", variant: "ghost", onClick: () => { props.onExport(team.id); }, children: t('exportPreset') }), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled, onClick: () => { props.onDuplicate(team.id); }, children: t('duplicate') }), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled, onClick: () => { props.onDelete(team.id); }, children: t('remove') })] })] }, team.id))) }))] }));
}
