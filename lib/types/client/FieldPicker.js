import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The labelled dropdown one Team field renders: a full-width trigger button
 * plus a `Menu` of the choices it offers.
 */
import { useState } from 'react';
import { IconChevronDownOutlineRegular, Menu } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './TeamPresetsSection.module.css';
/**
 * Render one labelled dropdown.
 * @param props - the field label, current value, choices, and write callback.
 * @returns the trigger and its menu.
 */
export function FieldPicker(props) {
    const [open, setOpen] = useState(false);
    const current = props.options.find(option => option.id === props.value) ?? props.options[0];
    const items = props.options.map(option => ({ id: option.id, label: option.label }));
    return (_jsxs("div", { className: css.field, children: [_jsx("span", { className: css.fieldLabel, children: props.label }), _jsx(Menu, { open: open, items: items, selectedId: props.value, onSelect: (id) => { setOpen(false); props.onChange(id); }, onClose: () => { setOpen(false); }, portal: true, anchor: (_jsxs("button", { type: "button", className: css.select, disabled: props.disabled, "aria-haspopup": "listbox", "aria-expanded": open, onClick: () => { setOpen(value => !value); }, children: [_jsx("span", { className: css.selectLabel, children: current?.label ?? '' }), _jsx(IconChevronDownOutlineRegular, { size: 14 })] })) })] }));
}
