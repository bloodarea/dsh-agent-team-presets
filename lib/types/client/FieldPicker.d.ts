/**
 * The labelled dropdown one Team field renders: a full-width trigger button
 * plus a `Menu` of the choices it offers.
 */
/** One option of a picker menu. */
export interface PickerChoice {
    /** Value the option writes. */
    readonly id: string;
    /** Localized row text. */
    readonly label: string;
}
/**
 * Render one labelled dropdown.
 * @param props - the field label, current value, choices, and write callback.
 * @returns the trigger and its menu.
 */
export declare function FieldPicker(props: {
    readonly label: string;
    readonly value: string;
    readonly options: readonly PickerChoice[];
    readonly disabled: boolean;
    readonly onChange: (id: string) => void;
}): import("react").JSX.Element;
//# sourceMappingURL=FieldPicker.d.ts.map