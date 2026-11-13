/**
 * The card-patch integrations page: one row per supported target plugin, what
 * its installed bundle currently is, and the one action that state allows.
 *
 * The page never decides whether a patch is applicable — the Host classifies the
 * installed bytes — and it never claims a patch is working on its own: a row is
 * "active" only when the running browser actually has the replacement's service,
 * which happens after a restart and a reload, not when the file is written.
 */

import { useEffect, useState } from 'react'
import { Button, Modal, StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CardPatchesController, CardPatchesState } from './card-patches-controller.ts'
import type { TeamPresetsLocaleKey } from './locales.ts'
import type { CardPatchFileState, CardPatchResult, CardPatchTargetView } from '../types.ts'
import css from './CardPatchView.module.css'

/** Page copy reader. */
type Translate = (key: TeamPresetsLocaleKey) => string

/** Locale key naming one bundle state. */
const STATE_KEYS: Readonly<Record<CardPatchFileState, TeamPresetsLocaleKey>> = {
  absent: 'patchStateAbsent',
  unsupported: 'patchStateUnsupported',
  pristine: 'patchStatePristine',
  patched: 'patchStatePatched',
  foreign: 'patchStateForeign',
}

/** Props of the integrations page. */
export interface CardPatchViewProps {
  /** Page state and the two write actions. */
  readonly controller: CardPatchesController
  /** Page copy reader. */
  readonly t: Translate
}

/**
 * Render the integrations page.
 * @param props - the controller and the page copy.
 * @returns the target rows and the confirmation dialog.
 */
export function CardPatchView({ controller, t }: CardPatchViewProps) {
  const [state, setState] = useState<CardPatchesState>(controller.getSnapshot())
  const [pending, setPending] = useState<{ target: CardPatchTargetView; action: 'install' | 'uninstall' } | undefined>(undefined)

  useEffect(() => {
    setState(controller.getSnapshot())
    return controller.subscribe(() => { setState(controller.getSnapshot()) })
  }, [controller])

  if (state.status === 'unavailable') {
    return <p className={css.empty} role="status">{t('patchUnavailable')}</p>
  }
  if (state.status === 'loading') {
    return <p className={css.empty} role="status">{t('loading')}</p>
  }

  return (
    <div className={css.page}>
      <p className={css.intro}>{t('patchIntro')}</p>
      {state.result !== undefined && <ResultLine result={state.result} t={t} />}
      <ul className={css.rows}>
        {state.targets.map(target => (
          <Row
            key={target.id}
            target={target}
            live={state.live.includes(target.id)}
            busy={state.busy === target.id}
            phase={state.busy === target.id ? state.phase : undefined}
            t={t}
            onAct={action => { setPending({ target, action }) }}
          />
        ))}
      </ul>
      {pending === undefined ? null : (
        <ConfirmDialog
          target={pending.target}
          action={pending.action}
          t={t}
          onCancel={() => { setPending(undefined) }}
          onConfirm={() => {
            const { target, action } = pending
            setPending(undefined)
            void (action === 'install' ? controller.install(target.id) : controller.uninstall(target.id))
          }}
        />
      )}
    </div>
  )
}

/**
 * Report the last install or restore.
 * @param props - the outcome and the page copy.
 * @returns the status line.
 */
function ResultLine({ result, t }: { result: CardPatchResult; t: Translate }) {
  const text = result.ok
    ? t(result.state === 'patched' ? 'patchInstalledOk' : 'patchRemovedOk')
    : t('patchRefused')
  return (
    <p className={result.ok ? css.result : css.resultFailed} role="status">
      {text}
      {result.detail === undefined ? null : <span className={css.detail}> — {result.detail}</span>}
    </p>
  )
}

/** Props of one target row. */
interface RowProps {
  readonly target: CardPatchTargetView
  readonly live: boolean
  readonly busy: boolean
  /** What the in-flight write is doing, when this row owns it. */
  readonly phase: 'applying' | 'waiting' | undefined
  readonly t: Translate
  readonly onAct: (action: 'install' | 'uninstall') => void
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
function versionsOf(target: CardPatchTargetView): string {
  return (target.supportedVersions ?? [target.supportedVersion]).join(', ')
}

/**
 * Render one target with its state and the action that state allows.
 * @param props - the row facts and the action callback.
 * @returns the row.
 */
function Row({ target, live, busy, phase, t, onAct }: RowProps) {
  // Only the two actionable states offer a button; every other state explains
  // itself instead of presenting a control the Host would refuse.
  const action = target.state === 'pristine'
    ? 'install'
    : target.state === 'patched' ? 'uninstall' : undefined
  // A patched bundle that has not been served yet is the one case where the row
  // must say "restart", because nothing is wrong with the file itself.
  const waiting = target.state === 'patched' && !live
  return (
    <li className={css.row}>
      <div className={css.rowHead}>
        <code className={css.packageName}>{target.packageName}</code>
        <span className={css.badge} data-state={target.state}>{t(STATE_KEYS[target.state])}</span>
        {target.state === 'patched' && live ? <span className={css.live}>{t('patchActive')}</span> : null}
      </div>
      <dl className={css.meta}>
        <dt>{t('patchSupported')}</dt>
        <dd>{versionsOf(target)}</dd>
        <dt>{t('patchInstalledVersion')}</dt>
        <dd>{target.installedVersion ?? '—'}</dd>
        <dt>{t('patchSource')}</dt>
        <dd className={css.source}>{target.source}</dd>
      </dl>
      {target.detail === undefined ? null : <p className={css.detail}>{target.detail}</p>}
      {busy && phase !== undefined ? (
        <p className={css.progress} role="status">
          {/* The same loader the plugin manager shows while it installs a plugin. */}
          <StateDot state="ongoing" size={13} />
          {phase === 'applying' ? t('patchApplying') : t('patchWaiting')}
        </p>
      ) : null}
      {waiting ? <p className={css.hint}>{t('patchPendingHint')}</p> : null}
      {action === undefined ? null : (
        <div className={css.actions}>
          <Button
            variant={action === 'install' ? 'primary' : 'outline'}
            disabled={busy}
            onClick={() => { onAct(action) }}
          >
            {busy ? t('patchWorking') : t(action === 'install' ? 'patchInstall' : 'patchUninstall')}
          </Button>
        </div>
      )}
    </li>
  )
}

/** Props of the confirmation dialog. */
interface ConfirmProps {
  readonly target: CardPatchTargetView
  readonly action: 'install' | 'uninstall'
  readonly t: Translate
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

/**
 * Ask before touching another plugin's installed files.
 * @param props - the row, the action, and the two outcomes.
 * @returns the dialog.
 */
function ConfirmDialog({ target, action, t, onCancel, onConfirm }: ConfirmProps) {
  return (
    <Modal
      open
      onClose={onCancel}
      title={t(action === 'install' ? 'patchInstallTitle' : 'patchUninstallTitle')}
      closeLabel={t('close')}
      footer={(
        <>
          <Button variant="outline" onClick={onCancel}>{t('cancel')}</Button>
          <Button variant="primary" onClick={onConfirm}>
            {t(action === 'install' ? 'patchInstall' : 'patchUninstall')}
          </Button>
        </>
      )}
    >
      <p>{t(action === 'install' ? 'patchInstallBody' : 'patchUninstallBody')}</p>
      <dl className={css.meta}>
        <dt>{t('patchPackage')}</dt>
        <dd><code>{target.packageName}</code></dd>
        <dt>{t('patchFile')}</dt>
        <dd><code>{`${target.packageName}/lib/client.js`}</code></dd>
        <dt>{t('patchSupported')}</dt>
        <dd>{versionsOf(target)}</dd>
      </dl>
    </Modal>
  )
}
