import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The Agent Team presets settings page: three stacked pages — the Team list,
 * one Team's roster, and one captain or member — with a shared save footer.
 */
import { useEffect, useState } from 'react';
import { Button } from '@deepseek-ai/dsh-client-ui-primitives';
import { TeamAgentView } from "./TeamAgentView.js";
import { TeamEditorView } from "./TeamEditorView.js";
import { TeamCategoryManager } from "./TeamCategoryManager.js";
import { TeamImportDialog } from "./TeamImportDialog.js";
import { TeamListView } from "./TeamListView.js";
import { TeamSkillsView } from "./TeamSkillsView.js";
import { CardPatchView } from "./CardPatchView.js";
import { defaultImportResolution, executionStateOf, unnamedTeamsOf } from "./team-presets-controller.js";
import { downloadPresetText, presetFileName, readPresetFile } from "./preset-file.js";
import { DEFAULTS_NOTICE_KEYS, DISCLOSURE_NOTICE_KEYS, EXECUTION_NOTICE_KEYS, FORM_ISSUE_KEYS, IMPORT_FAILURE_KEYS, selectionFailureText } from "./locales.js";
import css from './TeamPresetsSection.module.css';
/**
 * One tab in the section's own tab bar.
 * @param props - active state, click handler, and label.
 * @returns the tab button.
 */
function TabButton(props) {
    return (_jsx("button", { type: "button", role: "tab", "aria-selected": props.active, onClick: props.onClick, style: {
            background: 'none',
            border: 'none',
            borderBottom: props.active ? '2px solid currentColor' : '2px solid transparent',
            padding: '6px 10px',
            marginBottom: -1,
            fontWeight: props.active ? 600 : 400,
            opacity: props.active ? 1 : 0.65,
            color: 'inherit',
            cursor: 'pointer',
        }, children: props.children }));
}
/**
 * Keep the fields a captain owns out of one shared editor patch.
 *
 * The one-agent page reports both slots' edits through the route-bearing member
 * patch, so the captain branch drops the route members it never renders.
 * @param patch - the edit reported by the one-agent page.
 * @returns the same edit restricted to the captain's own fields.
 */
function captainPatch(patch) {
    const { name, color, description, toolMode, tools, systemPrompt } = patch;
    return {
        ...name === undefined ? {} : { name },
        ...color === undefined ? {} : { color },
        ...description === undefined ? {} : { description },
        ...toolMode === undefined ? {} : { toolMode },
        ...tools === undefined ? {} : { tools },
        ...systemPrompt === undefined ? {} : { systemPrompt },
    };
}
/**
 * Read one coordinated external update as the footer's status sentences.
 *
 * The saved version wins silently, so the line names what the Host rewrote,
 * added, and deleted, and says a staged edit was replaced or dropped only for
 * the Teams where one really was.
 * @param notice - what the coordination adopted, added, and removed.
 * @param t - the page's locale reader.
 * @returns the sentences the footer shows.
 */
function externalUpdateText(notice, t) {
    const parts = [];
    if (notice.teams.length > 0) {
        parts.push(notice.teams.length === 1
            ? t('externalUpdateOne', { team: notice.teams[0] ?? '' })
            : t('externalUpdateMany', { count: notice.teams.length, teams: notice.teams.join(', ') }));
        if (notice.overridden.length > 0) {
            parts.push(notice.overridden.length === 1
                ? t('externalUpdateOverriddenOne', { team: notice.overridden[0] ?? '' })
                : t('externalUpdateOverriddenMany', {
                    count: notice.overridden.length,
                    teams: notice.overridden.join(', '),
                }));
        }
    }
    if (notice.added.length > 0) {
        parts.push(notice.added.length === 1
            ? t('externalAddedOne', { team: notice.added[0] ?? '' })
            : t('externalAddedMany', { count: notice.added.length, teams: notice.added.join(', ') }));
    }
    if (notice.removed.length > 0) {
        parts.push(notice.removed.length === 1
            ? t('externalRemovedOne', { team: notice.removed[0] ?? '' })
            : t('externalRemovedMany', { count: notice.removed.length, teams: notice.removed.join(', ') }));
        if (notice.removedEdited.length > 0) {
            parts.push(notice.removedEdited.length === 1
                ? t('externalRemovedEditedOne', { team: notice.removedEdited[0] ?? '' })
                : t('externalRemovedEditedMany', {
                    count: notice.removedEdited.length,
                    teams: notice.removedEdited.join(', '),
                }));
        }
    }
    return parts.join(' ');
}
/**
 * Render the Team preset settings page.
 * @param props - page state, the page's locale reader, and the editing actions.
 * @returns the current page and the shared save footer.
 */
export function TeamPresetsSection(props) {
    const { t } = props;
    const state = props.useTeamPresets(snapshot => snapshot);
    const [view, setView] = useState({ kind: 'list' });
    // Three pages share one settings section: the Team presets, the private Team
    // Skill library, and the optional card-patch integrations. A page whose
    // service this build does not have is simply absent from the tab bar.
    const [tab, setTab] = useState('teams');
    const [importError, setImportError] = useState(undefined);
    const [importPlan, setImportPlan] = useState(undefined);
    // Each inspection replaces the pending dialog, whose choices must not survive it.
    const [importGeneration, setImportGeneration] = useState(0);
    const { refreshCatalogue } = props;
    // The settings shell mounts only the active section, so this runs on every
    // open: a route the deployment gained while the client was running must be
    // offered without a reload. The inject face is cached per registration, so
    // the reference is stable and the effect does not re-run per render.
    useEffect(() => { refreshCatalogue(); }, [refreshCatalogue]);
    if (tab === 'skills' && props.skills !== undefined) {
        return (_jsxs("div", { children: [_jsxs("div", { role: "tablist", className: css.tabs, children: [_jsx(TabButton, { active: false, onClick: () => { setTab('teams'); }, children: t('tabTeams') }), _jsx(TabButton, { active: true, onClick: () => { setTab('skills'); }, children: t('tabSkills') }), props.cardPatches === undefined
                            ? null
                            : _jsx(TabButton, { active: false, onClick: () => { setTab('links'); }, children: t('tabLinks') })] }), _jsx(TeamSkillsView, { controller: props.skills, t: t })] }));
    }
    if (tab === 'links' && props.cardPatches !== undefined) {
        return (_jsxs("div", { children: [_jsxs("div", { role: "tablist", className: css.tabs, children: [_jsx(TabButton, { active: false, onClick: () => { setTab('teams'); }, children: t('tabTeams') }), props.skills === undefined
                            ? null
                            : _jsx(TabButton, { active: false, onClick: () => { setTab('skills'); }, children: t('tabSkills') }), _jsx(TabButton, { active: true, onClick: () => { setTab('links'); }, children: t('tabLinks') })] }), _jsx(CardPatchView, { controller: props.cardPatches, t: t })] }));
    }
    if (state.status !== 'ready') {
        // The status line names the condition instead of showing one "unavailable"
        // for all of them: a page with no Host document, a deployment that serves
        // no Team section, and a section this client refused to decode are three
        // different problems with three different owners.
        const issue = state.formIssue === undefined ? undefined : t(FORM_ISSUE_KEYS[state.formIssue]);
        return _jsx("p", { className: css.empty, role: "status", children: issue ?? (state.status === 'loading' ? t('sectionLoading') : t('unavailable')) });
    }
    // A section the shared form refused stays readable through the describe
    // mirror, but nothing may be edited against it: the save would be refused the
    // same way the selection write was, and offering the edit would be a second
    // silent failure.
    const disabled = !state.writable || state.formIssue !== undefined;
    const teamList = state.teams;
    // Only the team and agent views address a Team; the categories page stands alone.
    const addressed = view.kind === 'team' || view.kind === 'agent' ? view.teamId : undefined;
    const found = addressed === undefined ? undefined : teamList.find(entry => entry.id === addressed);
    // A deleted Team or member drops the page back to the level that still exists.
    const active = addressed === undefined || found !== undefined ? view : { kind: 'list' };
    const team = found;
    const teamIndex = team === undefined ? -1 : teamList.indexOf(team);
    const openTeam = (teamId) => { setView({ kind: 'team', teamId }); };
    const openAgent = (teamId, slot) => { setView({ kind: 'agent', teamId, slot }); };
    /**
     * Read one chosen document, then stage it or ask about the names it collides with.
     * @param file - the document the user chose.
     */
    async function importDocument(file) {
        const inspection = props.inspectImport(await readPresetFile(file));
        if (!inspection.ok) {
            setImportPlan(undefined);
            setImportError(IMPORT_FAILURE_KEYS[inspection.reason]);
            return;
        }
        setImportError(undefined);
        if (inspection.plan.targetIndex === undefined) {
            openTeam(props.applyImport(inspection.plan, defaultImportResolution(inspection.plan)));
            return;
        }
        setImportGeneration(generation => generation + 1);
        setImportPlan(inspection.plan);
    }
    /**
     * Write one Team out as a shareable document.
     * @param teamId - the Team the user chose to export.
     */
    function exportDocument(teamId) {
        const index = teamList.findIndex(entry => entry.id === teamId);
        const team = index < 0 ? undefined : teamList[index];
        const text = index < 0 ? undefined : props.exportTeam(index);
        if (team === undefined || text === undefined)
            return;
        downloadPresetText(presetFileName(team), text);
    }
    // The page promises when a save takes effect, so the footer reports the
    // execution state of the Team being edited — never a state it cannot support.
    const execution = team === undefined ? undefined : executionStateOf(state, team.id);
    // Host disclosures about how the applied Team runs — for example that a strict
    // custom policy replaced this Session's PTC presentation. One the page cannot
    // translate is shown verbatim rather than hidden.
    const disclosures = team === undefined || state.execution !== 'ready'
        ? []
        : state.executions.find(row => row.teamId === team.id)?.notes ?? [];
    // The notice container is bordered, so an empty one would draw a stray box.
    const hasFooterNotes = execution !== undefined
        || disclosures.length > 0
        || state.failed
        || state.formIssue !== undefined
        || state.externalUpdate !== undefined
        || state.defaults !== undefined
        || state.dirty;
    // An unnamed Team has no identity anywhere it is shown — the list falls back to
    // its id, so do the composer and this page's own breadcrumb. The save is
    // withheld and the offender is named rather than letting an id leak into the UI.
    const unnamedTeams = unnamedTeamsOf(teamList);
    const categoriesForList = state.categories;
    const memberSlot = active.kind === 'agent' && active.slot !== 'captain' ? active.slot : undefined;
    const agent = team === undefined || active.kind !== 'agent'
        ? undefined
        : active.slot === 'captain' ? team.captain : team.members[active.slot];
    return (_jsxs("div", { className: css.section, children: [_jsxs("div", { role: "tablist", className: css.tabs, children: [_jsx(TabButton, { active: tab === 'teams', onClick: () => { setTab('teams'); }, children: t('tabTeams') }), props.skills === undefined ? null : _jsx(TabButton, { active: tab === 'skills', onClick: () => { setTab('skills'); }, children: t('tabSkills') }), props.cardPatches === undefined ? null : _jsx(TabButton, { active: tab === 'links', onClick: () => { setTab('links'); }, children: t('tabLinks') })] }), _jsxs("div", { className: css.page, children: [active.kind === 'categories' && (_jsx(TeamCategoryManager, { categories: state.categories, teamCategories: state.teamCategories, disabled: disabled, t: t, onBack: () => { setView({ kind: 'list' }); }, onAdd: (name) => { void props.addCategory(name); }, onRename: (id, name) => { void props.renameCategory(id, name); }, onMove: (id, delta) => { void props.moveCategory(id, delta); }, onRemove: (id) => { void props.removeCategory(id); } })), active.kind === 'list' && (_jsx(TeamListView, { teams: teamList, t: t, disabled: disabled, importError: importError, categories: categoriesForList, onManageCategories: () => { setView({ kind: 'categories' }); }, teamCategories: state.teamCategories, onOpen: openTeam, onCreate: () => { openTeam(props.createTeam()); }, onImport: (file) => { void importDocument(file); }, onExport: exportDocument, onRestoreDefaults: () => {
                            props.restoreDefaults();
                            void props.skills?.restoreBuiltinBindings();
                        }, onDuplicate: (teamId) => {
                            const index = teamList.findIndex(entry => entry.id === teamId);
                            if (index < 0)
                                return;
                            const created = props.duplicateTeam(index);
                            if (created !== undefined)
                                openTeam(created);
                        }, onDelete: (teamId) => {
                            const index = teamList.findIndex(entry => entry.id === teamId);
                            if (index >= 0)
                                props.removeTeam(index);
                            setView({ kind: 'list' });
                        } })), active.kind === 'team' && team !== undefined && (_jsx(TeamEditorView, { team: team, providers: state.providers, t: t, disabled: disabled, onBack: () => { setView({ kind: 'list' }); }, onPatch: (patch) => { props.patchTeam(teamIndex, patch); }, onOpenAgent: (slot) => { openAgent(team.id, slot); }, onAddMember: () => {
                            props.addMember(teamIndex);
                            openAgent(team.id, team.members.length);
                        }, onRemoveMember: (index) => { props.removeMember(teamIndex, index); }, categories: categoriesForList, categoryId: (state.teamCategories ?? []).find(row => row.teamId === team.id)?.categoryId ?? '', onSetCategory: (categoryId) => { void props.setCategory(team.id, categoryId); } })), active.kind === 'agent' && team !== undefined && agent !== undefined && (_jsx(TeamAgentView, { agent: agent, role: active.slot === 'captain' ? 'captain' : 'member', teamName: team.name === '' ? team.id : team.name, providers: state.providers, tools: state.tools, toolCatalogue: state.toolCatalogue, cataloguePartial: state.cataloguePartial, catalogueFailed: state.catalogue === 'error', t: t, disabled: disabled, ...props.skills === undefined ? {} : { skills: props.skills }, teamId: team.id, roleId: active.slot === 'captain' ? 'captain' : (memberSlot === undefined ? '' : (team.members[memberSlot]?.id ?? team.members[memberSlot]?.name ?? '')), onBack: () => { openTeam(team.id); }, onChange: (patch) => {
                            if (active.slot === 'captain')
                                props.patchCaptain(teamIndex, captainPatch(patch));
                            else
                                props.patchMember(teamIndex, active.slot, patch);
                        }, ...memberSlot === undefined ? {} : {
                            onDelete: () => {
                                props.removeMember(teamIndex, memberSlot);
                                openTeam(team.id);
                            },
                        } }))] }), importPlan === undefined ? null : (_jsx(TeamImportDialog, { plan: importPlan, t: t, onCancel: () => { setImportPlan(undefined); }, onConfirm: (resolution) => {
                    const created = props.applyImport(importPlan, resolution);
                    setImportPlan(undefined);
                    openTeam(created);
                } }, importGeneration)), _jsxs("footer", { className: css.footer, children: [hasFooterNotes ? (_jsxs("div", { className: css.footerNotes, children: [execution === undefined ? null : (_jsxs("span", { className: css.footerNote, role: "status", children: [t(EXECUTION_NOTICE_KEYS[execution]), execution === 'busy' ? ` ${t('executionBusyShared')}` : ''] })), disclosures.map(disclosure => (_jsx("span", { className: css.footerNote, role: "status", children: DISCLOSURE_NOTICE_KEYS[disclosure] === undefined ? disclosure : t(DISCLOSURE_NOTICE_KEYS[disclosure]) }, disclosure))), state.failed ? _jsx("span", { className: css.warn, role: "status", children: t('saveFailed') }) : null, state.formIssue === undefined ? null : (_jsx("span", { className: css.warn, role: "status", children: t(FORM_ISSUE_KEYS[state.formIssue]) })), state.selectionFailure === undefined ? null : (_jsx("span", { className: css.warn, role: "status", children: selectionFailureText(state.selectionFailure, t) })), unnamedTeams.length === 0 ? null : (_jsx("span", { className: css.warn, role: "status", children: t('teamNameRequired', { teams: unnamedTeams.map(entry => entry.id).join(', ') }) })), state.externalUpdate === undefined ? null : (_jsx("span", { className: css.warn, role: "status", children: externalUpdateText(state.externalUpdate, t) })), state.defaults === undefined ? null : (_jsx("span", { className: css.footerNote, role: "status", children: t(DEFAULTS_NOTICE_KEYS[state.defaults]) })), state.dirty ? _jsx("span", { className: css.footerNote, children: t('unsaved') }) : null] })) : null, _jsxs("div", { className: css.footerActions, children: [_jsx(Button, { size: "sm", variant: "ghost", disabled: !state.dirty || state.saving, onClick: () => { props.discard(); }, children: t('discard') }), _jsx(Button, { size: "sm", variant: "primary", disabled: !state.dirty || state.saving || disabled || unnamedTeams.length > 0, onClick: () => { void props.save(); }, children: state.saving ? t('saving') : t('save') })] })] })] }));
}
