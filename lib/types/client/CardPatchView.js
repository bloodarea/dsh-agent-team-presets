import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * The card-patch integrations page: one row per supported target plugin, what
 * its installed bundle currently is, and the one action that state allows.
 *
 * The page never decides whether a patch is applicable — the Host classifies the
 * installed bytes — and it never claims a patch is working on its own: a row is
 * "active" only when the running browser actually has the replacement's service,
 * which happens after a restart and a reload, not when the file is written.
 */
import { useEffect, useState } from 'react';
import { Button, Modal, StateDot } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './CardPatchView.module.css';
/** Locale key naming one bundle state. */
const STATE_KEYS = {
    absent: 'patchStateAbsent',
    unsupported: 'patchStateUnsupported',
    pristine: 'patchStatePristine',
    patched: 'patchStatePatched',
    foreign: 'patchStateForeign',
};
/**
 * Render the integrations page.
 * @param props - the controller and the page copy.
 * @returns the target rows and the confirmation dialog.
 */
export function CardPatchView({ controller, t }) {
    const [state, setState] = useState(controller.getSnapshot());
    const [pending, setPending] = useState(undefined);
    useEffect(() => {
        setState(controller.getSnapshot());
        return controller.subscribe(() => { setState(controller.getSnapshot()); });
    }, [controller]);
    if (state.status === 'unavailable') {
        return _jsx("p", { className: css.empty, role: "status", children: t('patchUnavailable') });
    }
    if (state.status === 'loading') {
        return _jsx("p", { className: css.empty, role: "status", children: t('loading') });
    }
    return (_jsxs("div", { className: css.page, children: [_jsx("p", { className: css.intro, children: t('patchIntro') }), state.result !== undefined && _jsx(ResultLine, { result: state.result, t: t }), _jsx("ul", { className: css.rows, children: state.targets.map(target => (_jsx(Row, { target: target, live: state.live.includes(target.id), busy: state.busy === target.id, phase: state.busy === target.id ? state.phase : undefined, t: t, onAct: action => { setPending({ target, action }); } }, target.id))) }), pending === undefined ? null : (_jsx(ConfirmDialog, { target: pending.target, action: pending.action, t: t, onCancel: () => { setPending(undefined); }, onConfirm: () => {
                    const { target, action } = pending;
                    setPending(undefined);
                    void (action === 'install' ? controller.install(target.id) : controller.uninstall(target.id));
                } }))] }));
}
/**
 * Report the last install or restore.
 * @param props - the outcome and the page copy.
 * @returns the status line.
 */
function ResultLine({ result, t }) {
    const text = result.ok
        ? t(result.state === 'patched' ? 'patchInstalledOk' : 'patchRemovedOk')
        : t('patchRefused');
    return (_jsxs("p", { className: result.ok ? css.result : css.resultFailed, role: "status", children: [text, result.detail === undefined ? null : _jsxs("span", { className: css.detail, children: [" \u2014 ", result.detail] })] }));
}
/**
 * The versions a row can patch, as text.
 *
 * A Host that predates the multi-version catalog sends no `supportedVersions`,
 * and the page must still render the single version it does report: the client
 * bundle reloads on its own while the Host only changes on restart.
 * @param target - the row.
 * @returns the versions, comma separated.
 */
function versionsOf(target) {
    return (target.supportedVersions ?? [target.supportedVersion]).join(', ');
}
/**
 * Render one target with its state and the action that state allows.
 * @param props - the row facts and the action callback.
 * @returns the row.
 */
function Row({ target, live, busy, phase, t, onAct }) {
    // Only the two actionable states offer a button; every other state explains
    // itself instead of presenting a control the Host would refuse.
    const action = target.state === 'pristine'
        ? 'install'
        : target.state === 'patched' ? 'uninstall' : undefined;
    // A patched bundle that has not been served yet is the one case where the row
    // must say "restart", because nothing is wrong with the file itself.
    const waiting = target.state === 'patched' && !live;
    return (_jsxs("li", { className: css.row, children: [_jsxs("div", { className: css.rowHead, children: [_jsx("code", { className: css.packageName, children: target.packageName }), _jsx("span", { className: css.badge, "data-state": target.state, children: t(STATE_KEYS[target.state]) }), target.state === 'patched' && live ? _jsx("span", { className: css.live, children: t('patchActive') }) : null] }), _jsxs("dl", { className: css.meta, children: [_jsx("dt", { children: t('patchSupported') }), _jsx("dd", { children: versionsOf(target) }), _jsx("dt", { children: t('patchInstalledVersion') }), _jsx("dd", { children: target.installedVersion ?? '—' }), _jsx("dt", { children: t('patchSource') }), _jsx("dd", { className: css.source, children: target.source })] }), target.detail === undefined ? null : _jsx("p", { className: css.detail, children: target.detail }), busy && phase !== undefined ? (_jsxs("p", { className: css.progress, role: "status", children: [_jsx(StateDot, { state: "ongoing", size: 13 }), phase === 'applying' ? t('patchApplying') : t('patchWaiting')] })) : null, waiting ? _jsx("p", { className: css.hint, children: t('patchPendingHint') }) : null, action === undefined ? null : (_jsx("div", { className: css.actions, children: _jsx(Button, { variant: action === 'install' ? 'primary' : 'outline', disabled: busy, onClick: () => { onAct(action); }, children: busy ? t('patchWorking') : t(action === 'install' ? 'patchInstall' : 'patchUninstall') }) }))] }));
}
/**
 * Ask before touching another plugin's installed files.
 * @param props - the row, the action, and the two outcomes.
 * @returns the dialog.
 */
function ConfirmDialog({ target, action, t, onCancel, onConfirm }) {
    return (_jsxs(Modal, { open: true, onClose: onCancel, title: t(action === 'install' ? 'patchInstallTitle' : 'patchUninstallTitle'), closeLabel: t('close'), footer: (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: onCancel, children: t('cancel') }), _jsx(Button, { variant: "primary", onClick: onConfirm, children: t(action === 'install' ? 'patchInstall' : 'patchUninstall') })] })), children: [_jsx("p", { children: t(action === 'install' ? 'patchInstallBody' : 'patchUninstallBody') }), _jsxs("dl", { className: css.meta, children: [_jsx("dt", { children: t('patchPackage') }), _jsx("dd", { children: _jsx("code", { children: target.packageName }) }), _jsx("dt", { children: t('patchFile') }), _jsx("dd", { children: _jsx("code", { children: `${target.packageName}/lib/client.js` }) }), _jsx("dt", { children: t('patchSupported') }), _jsx("dd", { children: versionsOf(target) })] })] }));
}
