import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Third Team preset page: one captain or member, split into identity, model,
 * tools, and system prompt cards so a narrow Settings panel never crowds.
 */
import { Button, Checkbox, Input } from '@deepseek-ai/dsh-client-ui-primitives';
import { useEffect, useState } from 'react';
import { AGENT_COLORS } from "./team-presets-controller.js";
import { FieldPicker } from "./FieldPicker.js";
import { IMPLICIT_TOOLS, toolMode } from "../presets.js";
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
 * The member page's Team Skill grid.
 *
 * One card per installed skill, checked when this exact role holds it. The grid
 * is the only place a skill is assigned, which is what the prototype specifies:
 * a skill page shows its references, and this page decides them.
 * @param props - the controller and the role slot being edited.
 * @returns the section, or nothing while the library is unavailable.
 */
/** The colour class that pairs with one origin, shared with the skill library. */
function originToneClass(styles, origin) {
    if (origin === 'builtin')
        return styles.originBuiltin ?? '';
    if (origin === 'override')
        return styles.originOverride ?? '';
    return styles.originCustom ?? '';
}
/** The origin of a Team Skill as the reader sees it, never the raw field value. */
function originCopy(origin, t) {
    if (origin === 'builtin')
        return t('originBuiltin');
    if (origin === 'override')
        return t('originOverride');
    return t('originCustom');
}
function SkillAssignmentGrid(props) {
    const [state, setState] = useState(props.controller.getSnapshot());
    useEffect(() => {
        const unsubscribe = props.controller.subscribe(() => { setState(props.controller.getSnapshot()); });
        void props.controller.refresh();
        return unsubscribe;
    }, [props.controller]);
    const assets = state.library?.assets ?? [];
    const held = new Set(assets.filter(asset => asset.bindings.some(row => row.teamId === props.teamId && row.roleId === props.roleId)).map(asset => asset.id));
    if (state.status === 'unavailable')
        return null;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.sepTitle, children: [props.t('skillsAssignTitle'), _jsxs("span", { className: css.hint, children: [" \u00B7 ", String([...held].length), "/", String(assets.length)] })] }), _jsxs("div", { className: css.panel, children: [_jsx("p", { className: css.muted, style: { marginTop: 0 }, children: props.t('skillsAssignHint') }), assets.length === 0 ? _jsx("p", { className: css.muted, children: props.t('skillsAssignEmpty') }) : (_jsx("div", { className: css.skillGrid, children: assets.map(asset => (_jsxs("label", { className: css.skillCard, children: [_jsxs("span", { className: css.skillCardTop, children: [_jsx("span", { className: css.skillCardName, children: asset.skillId }), _jsx("input", { type: "checkbox", checked: held.has(asset.id), onChange: (event) => {
                                                if (event.target.checked)
                                                    void props.controller.assignSkill(props.teamId, props.roleId, asset.id);
                                                else
                                                    void props.controller.unassignSkill(props.teamId, props.roleId, asset.id);
                                            } })] }), _jsx("span", { className: css.skillCardDesc, children: asset.description }), _jsx("span", { className: `${css.skillCardTag} ${css.originTag} ${originToneClass(css, asset.origin)}`, children: originCopy(asset.origin, props.t) })] }, asset.id))) })), state.message === undefined ? null : _jsx("p", { className: css.muted, children: state.message })] })] }));
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
    // An implicit tool is never offered as a choice, so a saved entry naming one
    // is neither missing nor removable: it is admitted by the policy itself. A
    // document written by an earlier version keeps loading unchanged.
    const unavailable = toolsReady
        ? agent.tools.filter(name => !IMPLICIT_TOOLS.includes(name) && !props.tools.some(tool => tool.name === name))
        : [];
    const toolChoices = props.tools.length === 0
        ? agent.tools.map(name => ({ name, description: '', source: 'other' }))
        : props.tools;
    // Group the catalogue by the only attributions the Host can prove, plus an
    // explicit "other" bucket. The registry records no registering package, so a
    // native Harness tool and a third-party plugin's tool cannot be told apart;
    // naming that bucket honestly beats guessing an owner for each name.
    const toolGroups = (() => {
        const ours = toolChoices.filter(tool => tool.source === 'presets');
        const byServer = new Map();
        const other = [];
        for (const tool of toolChoices) {
            if (tool.source === 'presets')
                continue;
            if (tool.source === 'mcp' && tool.server !== undefined) {
                byServer.set(tool.server, [...byServer.get(tool.server) ?? [], tool]);
                continue;
            }
            other.push(tool);
        }
        const groups = [];
        if (ours.length > 0)
            groups.push({ key: 'presets', label: t('toolsGroupPresets'), tools: ours });
        for (const [server, tools] of [...byServer.entries()].sort(([left], [right]) => left.localeCompare(right))) {
            groups.push({ key: `mcp:${server}`, label: `${t('toolsGroupMcp')}: ${server}`, tools });
        }
        if (other.length > 0)
            groups.push({ key: 'other', label: t('toolsGroupOther'), tools: other });
        return groups;
    })();
    // Groups start collapsed: a deployment with many tools is unreadable as one
    // flat grid, and each header already reports how many of its tools are chosen.
    const [expandedGroups, setExpandedGroups] = useState([]);
    /** Whether this page may grant the tool at all; a member cannot grant captain-only. */
    const grantable = (tool) => !(props.role === 'member' && tool.captainOnly === true);
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
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: css.pageHead, children: [_jsxs("button", { type: "button", className: css.crumb, onClick: props.onBack, children: [_jsx("span", { "aria-hidden": true, children: "\u2039" }), " ", props.teamName === '' ? t('back') : props.teamName] }), _jsxs("h2", { className: css.title, children: [props.role === 'captain' ? t('roleCaptain') : t('roleMember'), agent.name.trim() === '' ? '' : ` · ${agent.name.trim()}`] })] }), props.role === 'captain' ? _jsx("p", { className: css.intro, children: t('captainHint') }) : null, _jsxs("section", { className: css.card, children: [_jsx("span", { className: css.cardTitle, children: t('identitySection') }), _jsxs("div", { className: css.field, children: [_jsx("span", { className: css.fieldLabel, children: t('agentName') }), _jsx(Input, { className: css.input ?? '', value: agent.name, placeholder: t('agentNamePlaceholder'), disabled: disabled, onChange: (event) => { props.onChange({ name: event.target.value }); } })] }), _jsxs("div", { className: css.field, children: [_jsx("span", { className: css.fieldLabel, children: t('agentColor') }), _jsxs("span", { className: css.swatches, children: [_jsx("button", { type: "button", className: css.swatchNone, "aria-label": t('effortDefault'), "aria-pressed": agent.color === NO_COLOR, disabled: disabled, onClick: () => { props.onChange({ color: NO_COLOR }); } }), AGENT_COLORS.map(color => (_jsx("button", { type: "button", className: css.swatch, style: { background: color }, "aria-label": color, "aria-pressed": agent.color === color, disabled: disabled, onClick: () => { props.onChange({ color }); } }, color)))] })] }), _jsxs("div", { className: css.field, children: [_jsx("span", { className: css.fieldLabel, children: t('agentDescription') }), _jsx("textarea", { className: css.prompt, rows: 3, value: agent.description, disabled: disabled, onChange: (event) => { props.onChange({ description: event.target.value }); } })] })] }), _jsxs("section", { className: css.card, children: [_jsx("span", { className: css.cardTitle, children: t('modelSection') }), route === undefined ? (_jsx("span", { className: css.hint, children: t('captainModelHint') })) : (_jsxs(_Fragment, { children: [_jsx(FieldPicker, { label: t('provider'), value: route.provider, options: providerOptions, disabled: disabled, onChange: (id) => { props.onChange({ provider: id, model: id === '' ? '' : route.model, reasoningEffort: '' }); } }), _jsx(FieldPicker, { label: t('model'), value: route.model, options: modelOptions, disabled: disabled || route.provider === '', onChange: (id) => { props.onChange({ model: id, reasoningEffort: '' }); } }), _jsx(FieldPicker, { label: t('effort'), value: route.reasoningEffort, options: effortOptions, disabled: disabled || route.model === '', onChange: (id) => { props.onChange({ reasoningEffort: id }); } })] })), props.catalogueFailed ? _jsx("span", { className: css.warn, role: "status", children: t('modelsFailed') }) : null, props.cataloguePartial ? _jsx("span", { className: css.warn, role: "status", children: t('modelsPartial') }) : null] }), _jsxs("section", { className: css.card, children: [_jsx("span", { className: css.cardTitle, children: t('toolsSection') }), _jsx(FieldPicker, { label: t('toolMode'), value: mode, options: modeOptions, disabled: disabled, onChange: (id) => { props.onChange({ toolMode: id === 'custom' ? 'custom' : 'all' }); } }), customTools ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.cardHead, children: [_jsx("span", { className: css.fieldLabel, children: t('tools') }), _jsxs("span", { className: css.rowActions, children: [_jsx(Button, { size: "sm", variant: "ghost", disabled: disabled || !toolsReady || props.tools.length === 0, onClick: () => {
                                                    // A member can never exercise a captain-only capability, so
                                                    // select-all must not persist one into its allow-list.
                                                    props.onChange({
                                                        tools: props.tools
                                                            .filter(tool => !(props.role === 'member' && tool.captainOnly === true))
                                                            .map(tool => tool.name),
                                                    });
                                                }, children: t('toolsSelectAll') }), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled || agent.tools.length === 0, onClick: () => { props.onChange({ tools: [] }); }, children: t('toolsClear') })] })] }), toolGroups.map(group => {
                                const expanded = expandedGroups.includes(group.key);
                                const grantableTools = group.tools.filter(grantable);
                                const chosen = group.tools.filter(tool => agent.tools.includes(tool.name)).length;
                                // Rewrite only this group's slice of the allow-list, so another
                                // group's selection and a stored name this catalogue cannot
                                // describe both survive untouched.
                                const inside = new Set(group.tools.map(tool => tool.name));
                                const outside = agent.tools.filter(name => !inside.has(name));
                                const retained = group.tools
                                    .filter(tool => agent.tools.includes(tool.name) && !grantable(tool))
                                    .map(tool => tool.name);
                                return (_jsxs("div", { className: css.toolGroup, children: [_jsxs("div", { className: css.toolGroupHead, children: [_jsxs("button", { type: "button", className: css.toolGroupToggle, "aria-expanded": expanded, onClick: () => {
                                                        setExpandedGroups(current => current.includes(group.key)
                                                            ? current.filter(entry => entry !== group.key)
                                                            : [...current, group.key]);
                                                    }, children: [_jsx("span", { "aria-hidden": "true", children: expanded ? '▾' : '▸' }), _jsx("span", { className: css.fieldLabel, children: group.label }), _jsx("span", { className: css.toolGroupCount, children: `${String(chosen)}/${String(group.tools.length)}` })] }), _jsxs("span", { className: css.rowActions, children: [_jsx(Button, { size: "sm", variant: "ghost", disabled: disabled || !toolsReady, onClick: () => {
                                                                props.onChange({ tools: [...outside, ...grantableTools.map(tool => tool.name), ...retained] });
                                                            }, children: t('toolsSelectAll') }), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled || !toolsReady, onClick: () => {
                                                                const flipped = grantableTools
                                                                    .filter(tool => !agent.tools.includes(tool.name))
                                                                    .map(tool => tool.name);
                                                                props.onChange({ tools: [...outside, ...flipped, ...retained] });
                                                            }, children: t('toolsInvert') }), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled || chosen === 0, onClick: () => { props.onChange({ tools: [...outside] }); }, children: t('toolsClear') })] })] }), expanded ? (_jsx("div", { className: css.toolGrid, role: "group", "aria-label": group.label, children: group.tools.map(tool => {
                                                // The Team service enforces captain-only for these, and
                                                // the preset tools exist on the Session root scope alone,
                                                // so a member cannot use them however the list is edited.
                                                // A name already stored stays visible and removable.
                                                const restricted = !grantable(tool);
                                                const selected = agent.tools.includes(tool.name);
                                                return (_jsx(Checkbox, { className: css.toolCheckbox, label: tool.name, title: restricted ? `${tool.description} ${t('toolsCaptainOnly')}` : tool.description, checked: selected, disabled: disabled || (restricted && !selected) || (!toolsReady && !selected), onChange: (checked) => {
                                                        props.onChange({
                                                            tools: checked ? [...agent.tools, tool.name] : agent.tools.filter(name => name !== tool.name),
                                                        });
                                                    } }, tool.name));
                                            }) })) : null] }, group.key));
                            }), props.toolCatalogue === 'loading' || props.toolCatalogue === 'idle' ? (_jsx("span", { className: css.hint, role: "status", children: t('toolsLoading') })) : props.toolCatalogue === 'error' ? (_jsx("span", { className: css.warn, role: "status", children: t('toolsFailed') })) : props.tools.length === 0 ? (_jsx("span", { className: css.hint, children: t('toolsNoCatalog') })) : null, _jsx("span", { className: agent.tools.length === 0 ? css.warn : css.hint, children: agent.tools.length === 0 ? t('toolsEmpty') : t('toolsHint') }), unavailable.length === 0 ? null : (_jsxs("div", { className: css.field, children: [_jsx("span", { className: css.warn, children: t('toolsUnavailable') }), _jsx("ul", { className: css.plainRows, children: unavailable.map(name => (_jsxs("li", { className: css.entry, children: [_jsx("span", { className: css.rowName, children: name }), _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled, onClick: () => { props.onChange({ tools: agent.tools.filter(entry => entry !== name) }); }, children: t('toolsRemove') })] }, name))) })] }))] })) : _jsx("span", { className: css.hint, children: t('toolsAllHint') }), _jsx("span", { className: css.hint, children: t('toolsScoped') })] }), _jsxs("section", { className: css.card, children: [_jsx("span", { className: css.cardTitle, children: t('promptSection') }), _jsxs("div", { className: css.field, children: [_jsx("textarea", { className: css.prompt, rows: 8, value: agent.systemPrompt, placeholder: t('systemPromptPlaceholder'), disabled: disabled, onChange: (event) => { props.onChange({ systemPrompt: event.target.value }); } }), _jsx("span", { className: agent.systemPrompt.includes('{{') ? css.warn : css.hint, children: agent.systemPrompt.includes('{{') ? t('promptWarnBraces') : t('systemPromptHint') })] })] }), props.skills === undefined ? null : (_jsx(SkillAssignmentGrid, { controller: props.skills, teamId: props.teamId, roleId: props.roleId, t: props.t })), props.onDelete === undefined ? null : (_jsx("div", { className: css.actionRow, children: _jsx(Button, { size: "sm", variant: "ghost", disabled: disabled, onClick: props.onDelete, children: t('deleteAgent') }) }))] }));
}
