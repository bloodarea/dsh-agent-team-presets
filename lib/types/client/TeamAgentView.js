import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Third Team preset page: one captain or member, split into identity, model,
 * tools, and system prompt cards so a narrow Settings panel never crowds.
 */
import { Button, Checkbox, Input } from '@deepseek-ai/dsh-client-ui-primitives';
import { AGENT_COLORS } from "./team-presets-controller.js";
import { FieldPicker } from "./FieldPicker.js";
import { toolMode } from "../presets.js";
import css from './TeamPresetsSection.module.css';
/** Colors offered for one agent's accent mark. */
const NO_COLOR = '';
/**
 * Whether one edited slot owns a route.
 * @param agent - the captain or member being edited.
 * @returns whether the slot stores its own provider, model, and reasoning effort.
 */
function hasMemberRoute(agent) {
    return 'provider' in agent;
}
/**
 * Render one agent's page.
 * @param props - the agent, its role, the catalogue, copy, and write callbacks.
 * @returns the back row and the four setting cards.
 */
export function TeamAgentView(props) {
    const { agent, t, disabled } = props;
    const toolsReady = props.toolCatalogue === 'ready';
    const mode = toolMode(agent);
    const customTools = mode === 'custom';
    const unavailable = toolsReady ? agent.tools.filter(name => !props.tools.some(tool => tool.name === name)) : [];
    const toolChoices = props.tools.length === 0
        ? agent.tools.map(name => ({ name, description: '' }))
        : props.tools;
    const modeOptions = [
        { id: 'all', label: t('toolsDefault') },
        { id: 'custom', label: t('toolsCustom') },
    ];
    // A captain leads on the model its Session already selected, so only a
    // member renders the route pickers.
    const route = props.role === 'member' && hasMemberRoute(agent) ? agent : undefined;
    const provider = route === undefined ? undefined : props.providers.find(entry => entry.id === route.provider);
    const models = provider?.models ?? [];
    const model = route === undefined ? undefined : models.find(entry => entry.id === route.model);
    const providerOptions = [
        { id: '', label: t('routeInherit') },
        ...props.providers.map(entry => ({ id: entry.id, label: entry.name })),
    ];
    const modelOptions = [
        { id: '', label: t('routeInherit') },
        ...models.map(entry => ({ id: entry.id, label: entry.name })),
    ];
    const effortOptions = [
        { id: '', label: t('effortDefault') },
        ...(model?.efforts ?? []).map(effort => ({ id: effort.id, label: effort.name })),
    ];
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: css.pageHead, children: [_jsxs("button", { type: "button", className: css.crumb, onClick: props.onBack, children: [_jsx("span", { "aria-hidden": true, children: "\u2039" }), " ", props.teamName === '' ? t('back') : props.teamName] }), _jsxs("h2", { className: css.title, children: [props.role === 'captain' ? t('roleCaptain') : t('roleMember'), agent.name.trim() === '' ? '' : ` · ${agent.name.trim()}`] })] }), props.role === 'captain' ? _jsx("p", { className: css.intro, children: t('captainHint') }) : null, _jsxs("section", { className: css.card, children: [_jsx("span", { className: css.cardTitle, children: t('identitySection') }), _jsxs("div", { className: css.field, children: [_jsx("span", { className: css.fieldLabel, children: t('agentName') }), _jsx(Input, { className: css.input ?? '', value: agent.name, placeholder: t('agentNamePlaceholder'), disabled: disabled, onChange: (event) => { props.onChange({ name: event.target.value }); } })] }), _jsxs("div", { className: css.field, children: [_jsx("span", { className: css.fieldLabel, children: t('agentColor') }), _jsxs("span", { className: css.swatches, children: [_jsx("button", { type: "button", className: css.swatchNone, "aria-label": t('effortDefault'), "aria-pressed": agent.color === NO_COLOR, disabled: disabled, onClick: () => { props.onChange({ color: NO_COLOR }); } }), AGENT_COLORS.map(color => (_jsx("button", { type: "button", className: css.swatch, style: { background: color }, "aria-label": color, "aria-pressed": agent.color === color, disabled: disabled, onClick: () => { props.onChange({ color }); } }, color)))] })] }), _jsxs("div", { className: css.field, children: [_jsx("span", { className: css.fieldLabel, children: t('agentDescription') }), _jsx(Input, { className: css.input ?? '', value: agent.description, disabled: disabled, onChange: (event) => { props.onChange({ description: event.target.value }); } })] })] }), _jsxs("section", { className: css.card, children: [_jsx("span", { className: css.cardTitle, children: t('modelSection') }), route === undefined ? (_jsx("span", { className: css.hint, children: t('captainModelHint') })) : (_jsxs(_Fragment, { children: [_jsx(FieldPicker, { label: t('provider'), value: route.provider, options: providerOptions, disabled: disabled, onChange: (id) => { props.onChange({ provider: id, model: id === '' ? '' : route.model, reasoningEffort: '' }); } }), _jsx(FieldPicker, { label: t('model'), value: route.model, options: modelOptions, disabled: disabled || route.provider === '', onChange: (id) => { props.onChange({ model: id, reasoningEffort: '' }); } }), _jsx(FieldPicker, { label: t('effort'), value: route.reasoningEffort, options: effortOptions, disabled: disabled || route.model === '', onChange: (id) => { props.onChange({ reasoningEffort: id }); } })] })), props.cataloguePartial ? _jsx("span", { className: css.warn, role: "status", children: t('modelsPartial') }) : null] }), _jsxs("section", { className: css.card, children: [_jsx("span", { className: css.cardTitle, children: t('toolsSection') }), _jsx(FieldPicker, { label: t('toolMode'), value: mode, options: modeOptions, disabled: disabled, onChange: (id) => { props.onChange({ toolMode: id === 'custom' ? 'custom' : 'all' }); } }), customTools ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.cardHead, children: [_jsx("span", { className: css.fieldLabel, children: t('tools') }), _jsxs("span", { className: css.rowActions, children: [_jsx(Button, { size: "sm", variant: "ghost", disabled: disabled || !toolsReady || props.tools.length === 0, onClick: () => { props.onChange({ tools: props.tools.map(tool => tool.name) }); }, children: t('toolsSelectAll') }), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled || agent.tools.length === 0, onClick: () => { props.onChange({ tools: [] }); }, children: t('toolsClear') })] })] }), _jsx("div", { className: css.toolGrid, role: "group", "aria-label": t('tools'), children: toolChoices.map(tool => (_jsx(Checkbox, { className: css.toolCheckbox, label: tool.name, title: tool.description, checked: agent.tools.includes(tool.name), disabled: disabled || (!toolsReady && !agent.tools.includes(tool.name)), onChange: (checked) => {
                                        props.onChange({
                                            tools: checked ? [...agent.tools, tool.name] : agent.tools.filter(name => name !== tool.name),
                                        });
                                    } }, tool.name))) }), props.toolCatalogue === 'loading' || props.toolCatalogue === 'idle' ? (_jsx("span", { className: css.hint, role: "status", children: t('toolsLoading') })) : props.toolCatalogue === 'error' ? (_jsx("span", { className: css.warn, role: "status", children: t('toolsFailed') })) : props.tools.length === 0 ? (_jsx("span", { className: css.hint, children: t('toolsNoCatalog') })) : null, _jsx("span", { className: agent.tools.length === 0 ? css.warn : css.hint, children: agent.tools.length === 0 ? t('toolsEmpty') : t('toolsHint') }), unavailable.length === 0 ? null : (_jsxs("div", { className: css.field, children: [_jsx("span", { className: css.warn, children: t('toolsUnavailable') }), _jsx("ul", { className: css.plainRows, children: unavailable.map(name => (_jsxs("li", { className: css.entry, children: [_jsx("span", { className: css.rowName, children: name }), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled, onClick: () => { props.onChange({ tools: agent.tools.filter(entry => entry !== name) }); }, children: t('toolsRemove') })] }, name))) })] }))] })) : _jsx("span", { className: css.hint, children: t('toolsAllHint') }), _jsx("span", { className: css.hint, children: t('toolsScoped') })] }), _jsxs("section", { className: css.card, children: [_jsx("span", { className: css.cardTitle, children: t('promptSection') }), _jsxs("div", { className: css.field, children: [_jsx("textarea", { className: css.prompt, rows: 8, value: agent.systemPrompt, placeholder: t('systemPromptPlaceholder'), disabled: disabled, onChange: (event) => { props.onChange({ systemPrompt: event.target.value }); } }), _jsx("span", { className: agent.systemPrompt.includes('{{') ? css.warn : css.hint, children: agent.systemPrompt.includes('{{') ? t('promptWarnBraces') : t('systemPromptHint') })] })] }), props.onDelete === undefined ? null : (_jsx("div", { className: css.actionRow, children: _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled, onClick: props.onDelete, children: t('deleteAgent') }) }))] }));
}
