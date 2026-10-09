/**
 * The labelled dropdown one Team field renders: a full-width trigger button
 * plus a `Menu` of the choices it offers.
 */

import { useState } from 'react'
import { IconChevronDownOutlineRegular, Menu } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MenuEntry } from '@deepseek-ai/dsh-client-ui-primitives'
import css from './TeamPresetsSection.module.css'

/** One option of a picker menu. */
export interface PickerChoice {
  /** Value the option writes. */
  readonly id: string
  /** Localized row text. */
  readonly label: string
}

/**
 * Render one labelled dropdown.
 * @param props - the field label, current value, choices, and write callback.
 * @returns the trigger and its menu.
 */
export function FieldPicker(props: {
  readonly label: string
  readonly value: string
  readonly options: readonly PickerChoice[]
  readonly disabled: boolean
  readonly onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = props.options.find(option => option.id === props.value) ?? props.options[0]
  const items: MenuEntry[] = props.options.map(option => ({ id: option.id, label: option.label }))
  return (
    <div className={css.field}>
      <span className={css.fieldLabel}>{props.label}</span>
      <Menu
        open={open}
        items={items}
        selectedId={props.value}
        onSelect={(id) => { setOpen(false); props.onChange(id) }}
        onClose={() => { setOpen(false) }}
        portal
        anchor={(
          <button
            type="button"
            className={css.select}
            disabled={props.disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => { setOpen(value => !value) }}
          >
            <span className={css.selectLabel}>{current?.label ?? ''}</span>
            <IconChevronDownOutlineRegular size={14} />
          </button>
        )}
      />
    </div>
  )
}
