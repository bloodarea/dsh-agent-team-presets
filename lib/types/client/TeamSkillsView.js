import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * The Team Skill settings pages: a library list and one skill's detail, exactly
 * as the v0.1.6 native prototype defines them (new views only — the 0.1.5 Team
 * pages around them are unchanged).
 *
 * The library page owns discovery: search, the built-in/custom segment, and the
 * three actions the prototype puts in the title row. The detail page owns one
 * skill: its file tree and editor, its member references, and the deletion the
 * Host refuses while a member still holds it. Assignment itself belongs to the
 * member page, so this file never invents a second place to bind a skill.
 * @module dsh-agent-team-presets/client/TeamSkillsView
 */
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './TeamSkillsView.module.css';
// The library filters are the same control as the Team list's chips, so they use the
// very same classes rather than a lookalike set that can drift.
import chips from './TeamPresetsSection.module.css';
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS, skillCategoryOf, skillLabel } from "./locales.js";
/**
 * Read one line of provenance text.
 * @param asset - the row.
 * @returns a short label.
 */
/** The colour class that pairs with one origin, shared with the member cards. */
function originTone(styles, origin) {
    if (origin === 'builtin')
        return styles.originBuiltin ?? '';
    if (origin === 'override')
        return styles.originOverride ?? '';
    return styles.originCustom ?? '';
}
/** Locale text for each refusal the scanner can report. */
const SCAN_REASON_KEYS = {
    'missing-skill-file': 'skillsScanMissingSkill',
    'invalid-frontmatter': 'skillsScanInvalidFrontmatter',
    'invalid-name': 'skillsScanInvalidName',
    'missing-description': 'skillsScanMissingDescription',
    'too-many-files': 'skillsScanTooLarge',
    'file-too-large': 'skillsScanTooLarge',
    'folder-too-large': 'skillsScanTooLarge',
    'too-long': 'skillsScanTooLarge',
    'symlink-escape': 'skillsScanSymlink',
    'not-directory': 'skillsScanNotDirectory',
    'unreadable': 'skillsScanUnreadable',
    'duplicate': 'skillsScanDuplicate',
    'duplicate-path': 'skillsScanDuplicate',
    'install-refused': 'skillsScanInstallRefused',
};
/** One scan row's explanation, localized when the scanner's code is known. */
function scanReasonText(entry, t) {
    const key = entry.reason === undefined ? undefined : SCAN_REASON_KEYS[entry.reason];
    const label = entry.reason === undefined ? '' : key === undefined ? entry.reason : t(key);
    return entry.detail === undefined ? label : `${label} (${entry.detail})`;
}
function originLabel(asset, t) {
    if (asset.origin === 'builtin')
        return t('originBuiltin');
    if (asset.origin === 'override')
        return t('originOverride');
    return t('originCustom');
}
/** The Team Skill settings pages. */
export function TeamSkillsView(props) {
    const { controller, t } = props;
    const [state, setState] = useState(controller.getSnapshot());
    const [page, setPage] = useState({ kind: 'list' });
    const [query, setQuery] = useState('');
    const [origin, setOrigin] = useState('all');
    const [category, setCategory] = useState('all');
    const [draft, setDraft] = useState('');
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteOutcome, setDeleteOutcome] = useState(undefined);
    useEffect(() => {
        const unsubscribe = controller.subscribe(() => { setState(controller.getSnapshot()); });
        void controller.refresh();
        return unsubscribe;
    }, [controller]);
    useEffect(() => { setDraft(state.fileText ?? ''); }, [state.fileText]);
    const assets = state.library?.assets ?? [];
    const visible = useMemo(() => assets.filter((asset) => {
        const matchesOrigin = origin === 'all' || (origin === 'builtin' ? asset.origin === 'builtin' : asset.origin !== 'builtin');
        const matchesCategory = category === 'all' || skillCategoryOf(asset) === category;
        // Both names are searchable: the label a reader sees, and the English id
        // every other surface uses.
        const haystack = `${skillLabel(asset.skillId, t)} ${asset.skillId} ${asset.description}`.toLocaleLowerCase();
        return matchesOrigin && matchesCategory && query.trim().split(/\s+/u).every(token => haystack.includes(token.toLocaleLowerCase()));
    }), [assets, origin, category, query, t]);
    const detail = state.detail;
    const selected = page.kind === 'detail' ? assets.find(asset => asset.id === page.assetId) : undefined;
    /**
     * Pick a folder and hand its files to the Host.
     * @param list - the picker's files.
     */
    const importFolder = async (list) => {
        if (list === null || list.length === 0)
            return;
        const files = [];
        for (const file of Array.from(list)) {
            const relative = file.webkitRelativePath ?? '';
            const path = relative === '' ? file.name : relative.includes('/') ? relative.slice(relative.indexOf('/') + 1) : relative;
            files.push({ path, content: new Uint8Array(await file.arrayBuffer()) });
        }
        await controller.importFolder(files);
    };
    if (state.status === 'unavailable') {
        return (_jsxs("div", { className: css.page, children: [_jsx("h2", { className: css.title, children: t('skillsTitle') }), _jsx("div", { className: css.info, children: state.issue ?? t('skillsEmpty') })] }));
    }
    if (page.kind === 'detail') {
        return (_jsxs("div", { className: css.page, children: [_jsxs("button", { type: "button", className: css.crumb, onClick: () => { setPage({ kind: 'list' }); setConfirmDelete(false); setDeleteOutcome(undefined); }, children: ["\u2039 ", t('skillsTitle')] }), detail === undefined || selected === undefined ? _jsx("div", { className: css.empty, children: t('skillsEmpty') }) : (_jsxs(_Fragment, { children: [_jsxs("h2", { className: css.title, children: [skillLabel(detail.asset.skillId, t), " ", _jsx("span", { className: css.muted, children: detail.asset.skillId })] }), _jsx("p", { className: css.sub, children: detail.asset.description }), _jsxs("div", { className: css.pills, children: [_jsxs("span", { className: `${chips.originTag} ${originTone(chips, detail.asset.origin)}`, children: [originLabel(detail.asset, t), " \u00B7 ", detail.asset.editable ? t('skillsEditable') : t('skillsReadonly')] }), _jsxs("span", { className: css.tag, children: [t('skillsVersion'), " ", detail.asset.version] }), _jsxs("span", { className: css.tag, children: [detail.asset.fileCount, " ", t('skillsFiles')] }), detail.asset.updateAvailable === true ? _jsx("span", { className: `${css.tag} ${css.tagWarn}`, children: t('skillsOverrideOn') }) : null, (detail.asset.clashesWith?.length ?? 0) > 0 ? _jsx("span", { className: `${css.tag} ${css.tagWarn}`, children: t('skillsNameClash') }) : null] }), (detail.asset.clashesWith?.length ?? 0) > 0 ? (_jsxs("div", { className: css.info, children: [t('skillsNameClashBody'), "\uFF1A", [detail.asset.id, ...(detail.asset.clashesWith ?? [])].join(' / ')] })) : null, (() => {
                            const missing = (detail.dependencies?.executables ?? []).filter(row => !row.found);
                            const unverified = detail.asset.mcpServers;
                            if (missing.length === 0 && unverified.length === 0)
                                return null;
                            return (_jsx("div", { className: `${css.info} ${missing.length > 0 ? css.infoError : ''}`, children: missing.length > 0
                                    ? _jsxs("span", { children: [t('skillsBlockedAssign'), "\uFF1A", missing.map(row => row.name).join(', ')] })
                                    : _jsxs("span", { children: [t('skillsMcpUnverified'), "\uFF1A", unverified.join(', ')] }) }));
                        })(), _jsx("div", { className: css.sectionTitle, children: t('skillsResources') }), _jsxs("div", { className: css.fileArea, children: [_jsx("div", { className: css.fileTree, children: detail.files.map(file => (_jsxs("button", { type: "button", className: state.file === file.path ? css.active : '', onClick: () => { void controller.openFile(file.path); }, children: [file.path.includes('/') ? '↳ ' : '◫ ', file.path] }, file.path))) }), _jsxs("div", { className: css.fileEditor, children: [_jsxs("div", { className: css.fileTop, children: [_jsx("span", { children: state.file ?? 'SKILL.md' }), _jsx("span", { children: detail.asset.editable ? t('skillsEditable') : t('skillsReadonly') })] }), _jsx("textarea", { className: css.code, spellCheck: false, value: draft, readOnly: !detail.asset.editable, onChange: (event) => { setDraft(event.target.value); } })] })] }), _jsxs("div", { className: css.actions, children: [detail.asset.editable ? (_jsx(Button, { onClick: () => { void controller.saveFile(state.file ?? 'SKILL.md', draft); }, children: t('skillsSaveFile') })) : (_jsx(Button, { onClick: () => { void controller.createOverride(detail.asset.skillId); }, children: t('skillsMakeCopy') })), detail.asset.origin === 'override'
                                    ? _jsx(Button, { onClick: () => { void controller.resetOverride(detail.asset.id); }, children: t('skillsResetCopy') })
                                    : null, _jsx(Button, { onClick: () => { void navigator.clipboard?.writeText(detail.directory); }, children: t('skillsOpenAssetFolder') }), _jsx(Button, { onClick: () => { setConfirmDelete(true); setDeleteOutcome(undefined); }, children: t('skillsDelete') })] }), _jsxs("div", { className: css.panel, children: [_jsxs("div", { className: css.panelTitle, children: [t('skillsBindings'), " \u00B7 ", detail.asset.bindings.length] }), detail.asset.bindings.length === 0 ? _jsx("div", { className: css.muted, children: t('skillsNoBinding') }) : detail.asset.bindings.map(row => (_jsxs("div", { className: css.bindRow, children: [_jsx("span", { className: css.dot }), _jsxs("span", { className: css.main, children: [_jsx("span", { className: css.rowTitle, children: row.teamName }), _jsx("span", { className: css.rowSub, children: row.roleName })] }), _jsx("button", { type: "button", className: css.mini, onClick: () => { void controller.unassign(row.teamId, row.roleId); }, children: t('skillsUnbind') })] }, `${row.teamId}:${row.roleId}`)))] }), _jsxs("div", { className: css.panel, children: [_jsx("div", { className: css.panelTitle, children: t('skillsDeps') }), (detail.asset.mcpServers.length === 0 && (detail.dependencies?.executables.length ?? 0) === 0)
                                    ? _jsx("div", { className: css.muted, children: t('skillsNoDeps') })
                                    : (_jsxs(_Fragment, { children: [detail.asset.mcpServers.map(server => (_jsxs("div", { className: css.muted, children: ["MCP \u00B7 ", server, " ", _jsx("span", { className: css.tag, children: t('skillsDeclared') })] }, server))), (detail.dependencies?.executables ?? []).map(row => (_jsxs("div", { className: css.muted, children: [row.name, " ", _jsx("span", { className: `${css.tag} ${row.found ? css.tagOk : css.tagWarn}`, children: row.found ? t('skillsFound') : t('skillsMissing') })] }, row.name)))] }))] }), state.message === undefined ? null : (_jsx("div", { className: `${css.message} ${state.failed ? css.messageFailed : ''}`, children: state.message })), confirmDelete ? (_jsx("div", { className: css.dialogBackdrop, onClick: () => {
                                setConfirmDelete(false);
                                setDeleteOutcome(undefined);
                            }, children: _jsxs("div", { className: css.dialog, role: "dialog", "aria-modal": "true", onClick: (event) => { event.stopPropagation(); }, children: [_jsx("h2", { children: t('skillsDeleteTitle') }), _jsx("p", { className: css.muted, children: t('skillsDeleteBody') }), detail.asset.origin === 'builtin' ? (_jsx("div", { className: `${css.info} ${css.infoError}`, style: { margin: '12px 0 0' }, children: _jsx("strong", { children: t('skillsDeleteBuiltinWarning') }) })) : null, detail.asset.bindings.length > 0 ? (_jsxs("div", { className: `${css.info} ${css.infoError}`, style: { margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }, children: [_jsx("div", { children: _jsx("strong", { children: t('skillsDeleteBoundWarning') }) }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', maxHeight: '140px', overflowY: 'auto' }, children: detail.asset.bindings.map(b => (_jsxs("div", { children: ["\u2022 ", b.teamName, " \u2192 ", b.roleName] }, `${b.teamId}:${b.roleId}`))) })] })) : null, deleteOutcome?.ok === false && deleteOutcome.blockers.length > 0 ? (_jsxs("div", { className: `${css.info} ${css.infoError}`, style: { margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }, children: [_jsx("div", { children: _jsx("strong", { children: t('skillsDeleteBlocked') }) }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }, children: deleteOutcome.blockers.map((blocker, idx) => (_jsxs("div", { children: ["\u2022 ", blocker.detail || blocker.kind] }, idx))) })] })) : null, _jsxs("div", { className: css.dialogActions, children: [_jsx(Button, { onClick: () => { setConfirmDelete(false); setDeleteOutcome(undefined); }, children: t('skillsCancel') }), _jsx(Button, { disabled: detail.asset.origin === 'builtin' || detail.asset.bindings.length > 0, onClick: () => {
                                                    void controller.remove(detail.asset.id).then((outcome) => {
                                                        if (outcome?.ok === true) {
                                                            setConfirmDelete(false);
                                                            setDeleteOutcome(undefined);
                                                            setPage({ kind: 'list' });
                                                        }
                                                        else {
                                                            setDeleteOutcome(outcome);
                                                        }
                                                    });
                                                }, children: t('skillsConfirm') })] })] }) })) : null] }))] }));
    }
    return (_jsxs("div", { className: css.page, children: [_jsxs("div", { className: css.headRow, children: [_jsxs("div", { className: css.headText, children: [_jsx("h2", { className: css.title, children: t('skillsTitle') }), _jsx("p", { className: css.sub, children: t('skillsSub') })] }), _jsxs("div", { className: css.titleActions, children: [_jsx(Button, { variant: "outline", onClick: () => { setCreating(true); }, children: t('skillsNew') }), _jsx(Button, { variant: "outline", onClick: () => { void controller.openScanFolder(); }, children: state.canOpenScanFolder ? t('skillsOpenScanFolder') : t('skillsCopyScanFolder') })] })] }), _jsxs("div", { className: css.info, children: ["\u24D8 ", _jsx("span", { children: t('skillsNote') })] }), state.scanFolderNotice === undefined ? null : (_jsx("div", { className: css.info, children: _jsx("span", { children: t(state.scanFolderNotice === 'opened' ? 'skillsScanFolderOpened'
                        : state.scanFolderNotice === 'copied' ? 'skillsScanFolderCopied' : 'skillsScanFolderCopyFailed') }) })), _jsxs("div", { className: css.actions, children: [_jsx("input", { id: "team-skill-import", type: "file", multiple: true, style: { display: 'none' }, onChange: (event) => { void importFolder(event.target.files); }, webkitdirectory: '' }), _jsx(Button, { variant: "outline", onClick: () => { document.getElementById('team-skill-import')?.click(); }, children: t('skillsImport') }), _jsx(Button, { variant: "outline", onClick: () => { void controller.scanImportFolder(); }, children: t('skillsScan') })] }), state.scan === undefined ? null : (_jsxs("div", { className: css.scan, children: [_jsx("div", { className: css.scanHead, children: t('skillsScanSummary')
                            .replace('{scanned}', String(state.scan.scanned))
                            .replace('{imported}', String(state.scan.imported))
                            .replace('{existing}', String(state.scan.existing))
                            .replace('{invalid}', String(state.scan.invalid)) }), _jsxs("div", { className: css.muted, children: [t('skillsScanHint'), " ", state.scan.root] }), state.scan.entries.length === 0 ? _jsx("div", { className: css.muted, children: t('skillsScanEmpty') }) : (_jsx("ul", { className: css.scanList, children: state.scan.entries.map(entry => (_jsxs("li", { className: css.scanRow, children: [_jsx("span", { className: css.scanFolder, children: entry.folder }), _jsx("span", { className: `${css.tag} ${entry.status === 'imported' ? css.tagOk : entry.status === 'invalid' ? css.tagWarn : ''}`, children: t(entry.status === 'imported' ? 'skillsScanImported' : entry.status === 'existing' ? 'skillsScanExisting' : 'skillsScanInvalid') }), _jsx("span", { className: css.muted, children: entry.status === 'invalid' ? scanReasonText(entry, t) : entry.assetId ?? entry.skillId ?? '' })] }, entry.folder))) }))] })), _jsxs("div", { className: css.toolbar, children: [_jsx("input", { className: css.search, value: query, placeholder: t('skillsSearch'), onChange: (event) => { setQuery(event.target.value); } }), _jsxs("select", { className: chips.select, "aria-label": t('skillsCategoryAll'), value: category, onChange: (event) => { setCategory(event.target.value); }, children: [_jsx("option", { value: "all", children: t('skillsCategoryAll') }), SKILL_CATEGORIES.map(id => (_jsx("option", { value: id, children: t(SKILL_CATEGORY_LABELS[id]) }, id)))] })] }), _jsxs("div", { className: css.segment, children: [_jsx("button", { type: "button", className: `${chips.chip} ${origin === 'all' ? chips.chipActive : ''}`, onClick: () => { setOrigin('all'); }, children: t('skillsAll') }), _jsx("button", { type: "button", className: `${chips.chip} ${origin === 'builtin' ? chips.chipActive : ''}`, onClick: () => { setOrigin('builtin'); }, children: t('skillsBuiltin') }), _jsx("button", { type: "button", className: `${chips.chip} ${origin === 'custom' ? chips.chipActive : ''}`, onClick: () => { setOrigin('custom'); }, children: t('skillsCustom') })] }), _jsx("div", { className: css.rowlist, children: visible.length === 0 ? _jsx("div", { className: css.empty, children: assets.length === 0 ? t('skillsEmpty') : t('skillsFilterEmpty') }) : visible.map(asset => (_jsxs("button", { type: "button", className: css.row, onClick: () => { setPage({ kind: 'detail', assetId: asset.id }); void controller.select(asset.id); }, children: [_jsx("span", { className: `${css.dot} ${asset.origin === 'builtin' ? '' : css.dotCustom}` }), _jsxs("span", { className: css.main, children: [_jsxs("span", { className: css.rowTitle, children: [skillLabel(asset.skillId, t), _jsx("span", { className: css.muted, children: asset.skillId }), _jsx("span", { className: `${chips.originTag} ${originTone(chips, asset.origin)}`, children: originLabel(asset, t) }), asset.updateAvailable === true ? _jsx("span", { className: `${css.tag} ${css.tagWarn}`, children: t('skillsOverrideOn') }) : null] }), _jsxs("span", { className: css.rowSub, children: [asset.description, " \u00B7 ", asset.fileCount, " ", t('skillsFiles'), " \u00B7 ", t('skillsBound'), " ", asset.bindings.length] })] }), _jsx("span", { className: css.chev, children: "\u203A" })] }, asset.id))) }), state.message === undefined ? null : (_jsx("div", { className: `${css.message} ${state.failed ? css.messageFailed : ''}`, children: state.message })), creating ? (_jsx("div", { className: css.dialogBackdrop, onClick: () => { setCreating(false); }, children: _jsxs("div", { className: css.dialog, role: "dialog", "aria-modal": "true", onClick: (event) => { event.stopPropagation(); }, children: [_jsx("h2", { children: t('skillsNewTitle') }), _jsx("label", { className: css.label, children: t('skillsName') }), _jsx("input", { className: css.field, value: name, placeholder: "example-skill", onChange: (event) => { setName(event.target.value); } }), _jsx("label", { className: css.label, children: t('skillsDesc') }), _jsx("input", { className: css.field, value: description, placeholder: t('skillsDesc'), onChange: (event) => { setDescription(event.target.value); } }), _jsxs("div", { className: css.dialogActions, children: [_jsx(Button, { onClick: () => { setCreating(false); }, children: t('skillsCancel') }), _jsx(Button, { onClick: () => {
                                        void controller.create(name, description).then(() => {
                                            setName('');
                                            setDescription('');
                                            setCreating(false);
                                        });
                                    }, children: t('skillsConfirm') })] })] }) })) : null] }));
}
