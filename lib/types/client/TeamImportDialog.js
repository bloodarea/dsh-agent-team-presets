import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Conflict dialog for one Team import.
 *
 * The document's Team name, captain name, and member names are the keys an
 * import matches on, so each one that the target Team already uses is resolved
 * here: overwrite the configured agent, or add the imported one under a name
 * that is still free. Choosing a new Team name makes the whole document a new
 * Team, which is why the agent collisions disappear with that choice.
 */
import { useState } from 'react';
import { Button, Input, Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './TeamPresetsSection.module.css';
/**
 * Render one pair of collision choices.
 * @param name - radio group name, unique across the dialog.
 * @param value - the current choice.
 * @param onChange - receives the picked choice.
 * @param labels - the two localized option labels.
 * @param autofocus - whether this group's first option takes initial focus.
 * @returns the two radio options.
 */
function choices(name, value, onChange, labels, autofocus = false) {
    return (_jsxs("span", { className: css.choiceRow, children: [_jsxs("label", { className: css.choice, children: [_jsx("input", { type: "radio", name: name, checked: value === 'replace', ...autofocus ? { 'data-modal-autofocus': true } : {}, onChange: () => { onChange('replace'); } }), _jsx("span", { children: labels.replace })] }), _jsxs("label", { className: css.choice, children: [_jsx("input", { type: "radio", name: name, checked: value === 'rename', onChange: () => { onChange('rename'); } }), _jsx("span", { children: labels.rename })] })] }));
}
/**
 * Render the collision dialog for one import.
 * @param props - the plan, the page copy, and the two outcomes.
 * @returns the dialog; the caller mounts it only while an import is pending.
 */
export function TeamImportDialog(props) {
    const { plan, t } = props;
    const [teamChoice, setTeamChoice] = useState('replace');
    const [teamName, setTeamName] = useState(plan.suggestedTeamName);
    const [captainChoice, setCaptainChoice] = useState('replace');
    const [memberChoices, setMemberChoices] = useState({});
    const memberChoice = (name) => memberChoices[name] ?? 'replace';
    const agentCollisions = teamChoice === 'replace'
        && (plan.captainConflict !== '' || plan.memberConflicts.length > 0);
    return (_jsxs(Modal, { open: true, onClose: props.onCancel, title: t('importConflictTitle'), closeLabel: t('close'), footer: (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: props.onCancel, children: t('cancel') }), _jsx(Button, { variant: "primary", onClick: () => {
                        props.onConfirm({
                            team: teamChoice,
                            teamName,
                            captain: captainChoice,
                            members: Object.fromEntries(plan.memberConflicts.map(name => [name, memberChoice(name)])),
                        });
                    }, children: t('importConfirm') })] })), children: [_jsxs("section", { className: css.conflict, children: [_jsx("span", { className: css.conflictLead, children: t('importTeamConflict') }), _jsx("span", { className: css.conflictName, children: plan.targetName }), choices('import-team', teamChoice, setTeamChoice, {
                        replace: t('importTeamReplace'),
                        rename: t('importTeamRename'),
                    }, true), teamChoice === 'rename' ? (_jsxs("div", { className: css.field, children: [_jsx("span", { className: css.fieldLabel, children: t('importNewTeamName') }), _jsx(Input, { className: css.input ?? '', value: teamName, onChange: (event) => { setTeamName(event.target.value); } })] })) : null] }), !agentCollisions ? null : (_jsxs(_Fragment, { children: [plan.captainConflict === '' ? null : (_jsxs("section", { className: css.conflict, children: [_jsx("span", { className: css.conflictLead, children: t('importCaptainConflict') }), _jsx("span", { className: css.conflictName, children: plan.captainConflict }), choices('import-captain', captainChoice, setCaptainChoice, {
                                replace: t('importCaptainReplace'),
                                rename: t('importCaptainRename'),
                            })] })), plan.memberConflicts.length === 0 ? null : (_jsxs("section", { className: css.conflict, children: [_jsx("span", { className: css.conflictLead, children: t('importMemberConflict') }), _jsx("ul", { className: css.plainRows, children: plan.memberConflicts.map(name => (_jsxs("li", { className: css.conflictMember, children: [_jsx("span", { className: css.conflictName, children: name }), choices(`import-member-${name}`, memberChoice(name), (next) => {
                                            setMemberChoices(current => ({ ...current, [name]: next }));
                                        }, {
                                            replace: t('importMemberReplace'),
                                            rename: t('importMemberRename'),
                                        })] }, name))) })] }))] }))] }));
}
