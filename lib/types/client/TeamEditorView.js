import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Second Team preset page: one Team's own name, description, captain, and
 * member roster. Choosing the captain or a member opens that agent's page.
 */
import { Button, Input } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './TeamPresetsSection.module.css';
/** Model caption of one configured agent slot. */
function agentRoute(agent, providers) {
    if (agent.provider === '' || agent.model === '')
        return '';
    const provider = providers.find(entry => entry.id === agent.provider);
    const model = provider?.models.find(entry => entry.id === agent.model);
    return `${provider?.name ?? agent.provider} · ${model?.name ?? agent.model}`;
}
/**
 * Render one Team's page.
 * @param props - the Team, catalogue, copy, and navigation callbacks.
 * @returns the back row, the Team identity fields, and the roster.
 */
export function TeamEditorView(props) {
    const { team, t, disabled } = props;
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: css.pageHead, children: [_jsxs("button", { type: "button", className: css.crumb, onClick: props.onBack, children: [_jsx("span", { "aria-hidden": true, children: "\u2039" }), " ", t('backToList')] }), _jsx("h2", { className: css.title, children: team.name === '' ? team.id : team.name })] }), _jsxs("section", { className: css.card, children: [_jsxs("div", { className: css.field, children: [_jsx("span", { className: css.fieldLabel, children: t('teamName') }), _jsx(Input, { className: css.input ?? '', value: team.name, placeholder: t('teamNamePlaceholder'), disabled: disabled, onChange: (event) => { props.onPatch({ name: event.target.value }); } })] }), _jsxs("div", { className: css.field, children: [_jsx("span", { className: css.fieldLabel, children: t('teamDescription') }), _jsx(Input, { className: css.input ?? '', value: team.description, disabled: disabled, onChange: (event) => { props.onPatch({ description: event.target.value }); } })] })] }), _jsx("span", { className: css.sectionTitle, children: t('teamSections') }), _jsxs("section", { className: css.card, children: [_jsxs("button", { type: "button", className: css.entryRow, onClick: () => { props.onOpenAgent('captain'); }, children: [_jsx("span", { className: css.dot, style: team.captain.color === '' ? undefined : { background: team.captain.color }, "aria-hidden": true }), _jsxs("span", { className: css.rowText, children: [_jsxs("span", { className: css.rowName, children: [t('roleCaptain'), team.captain.name.trim() === '' ? '' : ` · ${team.captain.name.trim()}`] }), _jsx("span", { className: css.rowMeta, children: t('captainFollowsSession') })] }), _jsx("span", { className: css.chevron, "aria-hidden": true, children: "\u203A" })] }), _jsx("p", { className: css.hint, children: t('captainHint') })] }), _jsxs("section", { className: css.card, children: [_jsxs("div", { className: css.cardHead, children: [_jsx("span", { className: css.cardTitle, children: t('members') }), _jsx(Button, { size: "sm", variant: "outline", disabled: disabled, onClick: props.onAddMember, children: t('addMember') })] }), team.members.length === 0 ? _jsx("p", { className: css.hint, children: t('emptyMembers') }) : (_jsx("ul", { className: css.plainRows, children: team.members.map((member, index) => (_jsxs("li", { className: css.entry, children: [_jsxs("button", { type: "button", className: css.entryRow, onClick: () => { props.onOpenAgent(index); }, children: [_jsx("span", { className: css.dot, style: member.color === '' ? undefined : { background: member.color }, "aria-hidden": true }), _jsxs("span", { className: css.rowText, children: [_jsx("span", { className: css.rowName, children: member.name.trim() === '' ? `${t('roleMember')} ${String(index + 1)}` : member.name.trim() }), _jsx("span", { className: css.rowMeta, children: agentRoute(member, props.providers) || t('inheritSession') })] }), _jsx("span", { className: css.chevron, "aria-hidden": true, children: "\u203A" })] }), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled, onClick: () => { props.onRemoveMember(index); }, children: t('removeMember') })] }, `${team.id}-member-${String(index)}`))) }))] })] }));
}
