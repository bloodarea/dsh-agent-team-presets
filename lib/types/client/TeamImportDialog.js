import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Review one Team import and resolve any naming conflicts before staging. */
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
const skillStatusKeys = {
    'unknown-skill': 'importSkillUnknown',
    'missing-role': 'importSkillRoleMissing',
    'ambiguous-role': 'importSkillRoleAmbiguous',
    'catalog-ignored': 'importSkillCatalogIgnored',
    'eligible': 'importSkillEligible',
    'asset-missing': 'importSkillAssetMissing',
    'library-unavailable': 'importSkillLibraryUnavailable',
    'local-override': 'importSkillLocalOverride',
};
/** Render a pending import, including any declaration that could not resolve. */
export function TeamImportDialog(props) {
    const { plan, t } = props;
    const [teamChoice, setTeamChoice] = useState('replace');
    const [teamName, setTeamName] = useState(plan.suggestedTeamName);
    const [captainChoice, setCaptainChoice] = useState('replace');
    const [memberChoices, setMemberChoices] = useState({});
    const memberChoice = (name) => memberChoices[name] ?? 'replace';
    const teamCollision = plan.targetIndex !== undefined;
    const agentCollisions = teamCollision && teamChoice === 'replace'
        && (plan.captainConflict !== '' || plan.memberConflicts.length > 0);
    const resolution = {
        team: teamCollision ? teamChoice : 'rename',
        teamName,
        captain: captainChoice,
        members: Object.fromEntries(plan.memberConflicts.map(name => [name, memberChoice(name)])),
    };
    const rows = props.previewSkills(resolution);
    return (_jsxs(Modal, { open: true, onClose: props.onCancel, title: t(teamCollision ? 'importConflictTitle' : 'importPreviewTitle'), closeLabel: t('close'), footer: (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: props.onCancel, children: t('cancel') }), _jsx(Button, { variant: "primary", onClick: () => { props.onConfirm(resolution); }, children: t('importConfirm') })] })), children: [teamCollision && (_jsxs("section", { className: css.conflict, children: [_jsx("span", { className: css.conflictLead, children: t('importTeamConflict') }), _jsx("span", { className: css.conflictName, children: plan.targetName }), choices('import-team', teamChoice, setTeamChoice, {
                        replace: t('importTeamReplace'),
                        rename: t('importTeamRename'),
                    }, true), teamChoice === 'rename' ? (_jsxs("div", { className: css.field, children: [_jsx("span", { className: css.fieldLabel, children: t('importNewTeamName') }), _jsx(Input, { className: css.input ?? '', value: teamName, onChange: (event) => { setTeamName(event.target.value); } })] })) : null] })), !agentCollisions ? null : (_jsxs(_Fragment, { children: [plan.captainConflict === '' ? null : (_jsxs("section", { className: css.conflict, children: [_jsx("span", { className: css.conflictLead, children: t('importCaptainConflict') }), _jsx("span", { className: css.conflictName, children: plan.captainConflict }), choices('import-captain', captainChoice, setCaptainChoice, {
                                replace: t('importCaptainReplace'),
                                rename: t('importCaptainRename'),
                            })] })), plan.memberConflicts.length === 0 ? null : (_jsxs("section", { className: css.conflict, children: [_jsx("span", { className: css.conflictLead, children: t('importMemberConflict') }), _jsx("ul", { className: css.plainRows, children: plan.memberConflicts.map(name => (_jsxs("li", { className: css.conflictMember, children: [_jsx("span", { className: css.conflictName, children: name }), choices(`import-member-${name}`, memberChoice(name), (next) => {
                                            setMemberChoices(current => ({ ...current, [name]: next }));
                                        }, {
                                            replace: t('importMemberReplace'),
                                            rename: t('importMemberRename'),
                                        })] }, name))) })] }))] })), ['preset', 'catalog'].map(source => {
                const group = rows.filter(row => row.source === source);
                if (group.length === 0)
                    return null;
                return (_jsxs("section", { className: css.conflict, "aria-live": "polite", children: [_jsx("h3", { className: css.conflictLead, children: t(source === 'preset' ? 'importSkillDeclarations' : 'importSkillCatalog') }), _jsx("ul", { className: css.plainRows, children: group.map((row, index) => (_jsxs("li", { className: css.conflictMember, children: [_jsxs("strong", { className: css.conflictName, children: [row.skillId, " \u00B7 ", row.roleName] }), _jsx("span", { children: t(skillStatusKeys[row.status]) })] }, `${row.skillId}:${row.roleName}:${index}`))) })] }, source));
            }), _jsx("p", { className: css.dialogNote, children: t('importDraftNote') })] }));
}
