import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The composer's Team control: pick the Team preset that leads this Session.
 * It sits in the composer tool row after the permission control.
 */
import { useState } from 'react';
import { IconChevronDownOutlineRegular, Menu } from '@deepseek-ai/dsh-client-ui-primitives';
import { selectedTeam } from "../presets.js";
import css from './ComposerTeamSelect.module.css';
/**
 * Render the composer's Team picker.
 * @param props - the Session identity, the page's locale reader, and the selection writer.
 * @returns the Team trigger, or null while no Team is configured.
 */
export function ComposerTeamSelect(props) {
    const { t, sessionId } = props;
    const state = props.useTeamPresets(snapshot => snapshot);
    const [open, setOpen] = useState(false);
    const active = selectedTeam(state.teams, state.selections, String(sessionId));
    const writable = state.status === 'ready' && state.writable;
    const items = [
        { id: '', label: t('composerNone') },
        ...state.teams.map(team => ({ id: team.id, label: team.name === '' ? team.id : team.name })),
    ];
    return (_jsx(Menu, { open: open, items: items, selectedId: active?.id ?? '', onSelect: (id) => {
            setOpen(false);
            void props.selectTeam(String(sessionId), id === '' ? undefined : id);
        }, onClose: () => { setOpen(false); }, side: "top", portal: true, compact: true, anchor: (_jsxs("button", { type: "button", className: css.trigger, disabled: !writable, "aria-haspopup": "listbox", "aria-expanded": open, title: t('composerHint'), onClick: () => { setOpen(value => !value); }, children: [active === undefined || active.captain.color === ''
                    ? null
                    : (_jsx("span", { className: css.accentDot, style: { background: active.captain.color }, "aria-hidden": true })), _jsx("span", { className: css.triggerLabel, "aria-label": t('composerTitle'), children: active === undefined ? t('composerTitle') : (active.name === '' ? active.id : active.name) }), _jsx("span", { className: css.triggerIcon, children: _jsx(IconChevronDownOutlineRegular, { size: 14 }) })] })) }));
}
