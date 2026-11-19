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

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import css from './TeamSkillsView.module.css'
// The library filters are the same control as the Team list's chips, so they use the
// very same classes rather than a lookalike set that can drift.
import chips from './TeamPresetsSection.module.css'
import type { TeamSkillsController, TeamSkillsState } from './team-skills-controller.ts'
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS, skillCategoryOf, skillLabel, type SkillCategoryId, type TeamPresetsLocaleKey } from './locales.ts'
import type { TeamSkillAssetView, TeamSkillDeleteView, TeamSkillScanEntry } from '../types.ts'

/** Locale keys this panel reads. */
export type TeamSkillsLocaleKey =
  | 'originBuiltin' | 'originCustom' | 'originOverride'
  | 'skillsTitle' | 'skillsSub' | 'skillsNote' | 'skillsNew' | 'skillsImport' | 'skillsOpenFolder'
  | 'skillsOpenAssetFolder'
  | 'skillsSearch' | 'skillsAll' | 'skillsBuiltin' | 'skillsCustom' | 'skillsFiles' | 'skillsBound'
  | 'skillsEmpty' | 'skillsResources' | 'skillsSaveFile' | 'skillsEditable' | 'skillsReadonly'
  | 'skillsMakeCopy' | 'skillsResetCopy' | 'skillsBindings' | 'skillsNoBinding' | 'skillsUnbind'
  | 'skillsDeps' | 'skillsNoDeps' | 'skillsDelete' | 'skillsDeleteTitle' | 'skillsDeleteBody'
  | 'skillsDeleteBlocked' | 'skillsDeleteBoundWarning' | 'skillsDeleteBuiltinWarning'
  | 'skillsCancel' | 'skillsConfirm' | 'skillsName' | 'skillsDesc' | 'skillsNewTitle'
  | 'skillsVersion' | 'skillsOverrideOn' | 'skillsBlockedAssign' | 'skillsMcpUnverified'
  | 'skillsNameClash' | 'skillsNameClashBody' | 'skillsDeclared' | 'skillsFound' | 'skillsMissing'
  | 'skillsScan' | 'skillsScanHint' | 'skillsScanSummary' | 'skillsScanEmpty'
  | 'skillsScanImported' | 'skillsScanExisting' | 'skillsScanInvalid'
  | 'skillsScanMissingSkill' | 'skillsScanInvalidFrontmatter' | 'skillsScanInvalidName'
  | 'skillsScanMissingDescription' | 'skillsScanTooLarge' | 'skillsScanSymlink'
  | 'skillsScanNotDirectory' | 'skillsScanUnreadable' | 'skillsScanDuplicate'
  | 'skillsScanInstallRefused'
  | 'skillsOpenScanFolder' | 'skillsCopyScanFolder'
  | 'skillsScanFolderOpened' | 'skillsScanFolderCopied' | 'skillsScanFolderCopyFailed'

/** Props of {@link TeamSkillsView}. */
export interface TeamSkillsViewProps {
  /** Page state and actions. */
  readonly controller: TeamSkillsController
  /** Translate one locale key. */
  readonly t: (key: TeamPresetsLocaleKey) => string
}

/** Which page the panel shows. */
type Page = { kind: 'list' } | { kind: 'detail'; assetId: string }

/**
 * Read one line of provenance text.
 * @param asset - the row.
 * @returns a short label.
 */
/** The colour class that pairs with one origin, shared with the member cards. */
function originTone(styles: Record<string, string | undefined>, origin: string): string {
  if (origin === 'builtin') return styles.originBuiltin ?? ''
  if (origin === 'override') return styles.originOverride ?? ''
  return styles.originCustom ?? ''
}

/** Locale text for each refusal the scanner can report. */
const SCAN_REASON_KEYS: Readonly<Record<string, TeamSkillsLocaleKey>> = {
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
}

/** One scan row's explanation, localized when the scanner's code is known. */
function scanReasonText(entry: TeamSkillScanEntry, t: (key: TeamSkillsLocaleKey) => string): string {
  const key = entry.reason === undefined ? undefined : SCAN_REASON_KEYS[entry.reason]
  const label = entry.reason === undefined ? '' : key === undefined ? entry.reason : t(key)
  return entry.detail === undefined ? label : `${label} (${entry.detail})`
}

function originLabel(asset: TeamSkillAssetView, t: (key: TeamSkillsLocaleKey) => string): string {
  if (asset.origin === 'builtin') return t('originBuiltin')
  if (asset.origin === 'override') return t('originOverride')
  return t('originCustom')
}

/** The Team Skill settings pages. */
export function TeamSkillsView(props: TeamSkillsViewProps): React.ReactElement {
  const { controller, t } = props
  const [state, setState] = useState<TeamSkillsState>(controller.getSnapshot())
  const [page, setPage] = useState<Page>({ kind: 'list' })
  const [query, setQuery] = useState('')
  const [origin, setOrigin] = useState<'all' | 'builtin' | 'custom'>('all')
  const [category, setCategory] = useState<'all' | SkillCategoryId>('all')
  const [draft, setDraft] = useState('')
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteOutcome, setDeleteOutcome] = useState<TeamSkillDeleteView | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = controller.subscribe(() => { setState(controller.getSnapshot()) })
    void controller.refresh()
    return unsubscribe
  }, [controller])

  useEffect(() => { setDraft(state.fileText ?? '') }, [state.fileText])

  const assets = state.library?.assets ?? []
  const visible = useMemo(() => assets.filter((asset) => {
    const matchesOrigin = origin === 'all' || (origin === 'builtin' ? asset.origin === 'builtin' : asset.origin !== 'builtin')
    const matchesCategory = category === 'all' || skillCategoryOf(asset) === category
    // Both names are searchable: the label a reader sees, and the English id
    // every other surface uses.
    const haystack = `${skillLabel(asset.skillId, t)} ${asset.skillId} ${asset.description}`.toLocaleLowerCase()
    return matchesOrigin && matchesCategory && query.trim().split(/\s+/u).every(token => haystack.includes(token.toLocaleLowerCase()))
  }), [assets, origin, category, query, t])

  const detail = state.detail
  const selected = page.kind === 'detail' ? assets.find(asset => asset.id === page.assetId) : undefined

  /**
   * Pick a folder and hand its files to the Host.
   * @param list - the picker's files.
   */
  const importFolder = async (list: FileList | null): Promise<void> => {
    if (list === null || list.length === 0) return
    const files: { path: string; content: Uint8Array }[] = []
    for (const file of Array.from(list)) {
      const relative = (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? ''
      const path = relative === '' ? file.name : relative.includes('/') ? relative.slice(relative.indexOf('/') + 1) : relative
      files.push({ path, content: new Uint8Array(await file.arrayBuffer()) })
    }
    await controller.importFolder(files)
  }

  if (state.status === 'unavailable') {
    return (
      <div className={css.page}>
        <h2 className={css.title}>{t('skillsTitle')}</h2>
        <div className={css.info}>{state.issue ?? t('skillsEmpty')}</div>
      </div>
    )
  }

  if (page.kind === 'detail') {
    return (
      <div className={css.page}>
        <button type="button" className={css.crumb} onClick={() => { setPage({ kind: 'list' }); setConfirmDelete(false); setDeleteOutcome(undefined) }}>
          ‹ {t('skillsTitle')}
        </button>
        {detail === undefined || selected === undefined ? <div className={css.empty}>{t('skillsEmpty')}</div> : (
          <>
            <h2 className={css.title}>{skillLabel(detail.asset.skillId, t)} <span className={css.muted}>{detail.asset.skillId}</span></h2>
            <p className={css.sub}>{detail.asset.description}</p>
            <div className={css.pills}>
              <span className={`${chips.originTag} ${originTone(chips, detail.asset.origin)}`}>
                {originLabel(detail.asset, t)} · {detail.asset.editable ? t('skillsEditable') : t('skillsReadonly')}
              </span>
              <span className={css.tag}>{t('skillsVersion')} {detail.asset.version}</span>
              <span className={css.tag}>{detail.asset.fileCount} {t('skillsFiles')}</span>
              {detail.asset.updateAvailable === true ? <span className={`${css.tag} ${css.tagWarn}`}>{t('skillsOverrideOn')}</span> : null}
              {(detail.asset.clashesWith?.length ?? 0) > 0 ? <span className={`${css.tag} ${css.tagWarn}`}>{t('skillsNameClash')}</span> : null}
            </div>
            {(detail.asset.clashesWith?.length ?? 0) > 0 ? (
              <div className={css.info}>
                {t('skillsNameClashBody')}：{[detail.asset.id, ...(detail.asset.clashesWith ?? [])].join(' / ')}
              </div>
            ) : null}

            {(() => {
              const missing = (detail.dependencies?.executables ?? []).filter(row => !row.found)
              const unverified = detail.asset.mcpServers
              if (missing.length === 0 && unverified.length === 0) return null
              return (
                <div className={`${css.info} ${missing.length > 0 ? css.infoError : ''}`}>
                  {missing.length > 0
                    ? <span>{t('skillsBlockedAssign')}：{missing.map(row => row.name).join(', ')}</span>
                    : <span>{t('skillsMcpUnverified')}：{unverified.join(', ')}</span>}
                </div>
              )
            })()}
            <div className={css.sectionTitle}>{t('skillsResources')}</div>
            <div className={css.fileArea}>
              <div className={css.fileTree}>
                {detail.files.map(file => (
                  <button
                    key={file.path}
                    type="button"
                    className={state.file === file.path ? css.active : ''}
                    onClick={() => { void controller.openFile(file.path) }}
                  >{file.path.includes('/') ? '↳ ' : '◫ '}{file.path}</button>
                ))}
              </div>
              <div className={css.fileEditor}>
                <div className={css.fileTop}>
                  <span>{state.file ?? 'SKILL.md'}</span>
                  <span>{detail.asset.editable ? t('skillsEditable') : t('skillsReadonly')}</span>
                </div>
                <textarea
                  className={css.code}
                  spellCheck={false}
                  value={draft}
                  readOnly={!detail.asset.editable}
                  onChange={(event) => { setDraft(event.target.value) }}
                />
              </div>
            </div>

            <div className={css.actions}>
              {detail.asset.editable ? (
                <Button onClick={() => { void controller.saveFile(state.file ?? 'SKILL.md', draft) }}>{t('skillsSaveFile')}</Button>
              ) : (
                <Button onClick={() => { void controller.createOverride(detail.asset.skillId) }}>{t('skillsMakeCopy')}</Button>
              )}
              {detail.asset.origin === 'override'
                ? <Button onClick={() => { void controller.resetOverride(detail.asset.id) }}>{t('skillsResetCopy')}</Button>
                : null}
              {/* The Host owns the storage layout, so it supplies this path. */}
              <Button onClick={() => { void navigator.clipboard?.writeText(detail.directory) }}>
                {t('skillsOpenAssetFolder')}
              </Button>
              <Button onClick={() => { setConfirmDelete(true); setDeleteOutcome(undefined) }}>{t('skillsDelete')}</Button>
            </div>

            <div className={css.panel}>
              <div className={css.panelTitle}>{t('skillsBindings')} · {detail.asset.bindings.length}</div>
              {detail.asset.bindings.length === 0 ? <div className={css.muted}>{t('skillsNoBinding')}</div> : detail.asset.bindings.map(row => (
                <div key={`${row.teamId}:${row.roleId}`} className={css.bindRow}>
                  <span className={css.dot} />
                  <span className={css.main}>
                    <span className={css.rowTitle}>{row.teamName}</span>
                    <span className={css.rowSub}>{row.roleName}</span>
                  </span>
                  <button type="button" className={css.mini} onClick={() => { void controller.unassign(row.teamId, row.roleId) }}>
                    {t('skillsUnbind')}
                  </button>
                </div>
              ))}
            </div>

            <div className={css.panel}>
              <div className={css.panelTitle}>{t('skillsDeps')}</div>
              {(detail.asset.mcpServers.length === 0 && (detail.dependencies?.executables.length ?? 0) === 0)
                ? <div className={css.muted}>{t('skillsNoDeps')}</div>
                : (
                  <>
                    {detail.asset.mcpServers.map(server => (
                      <div key={server} className={css.muted}>MCP · {server} <span className={css.tag}>{t('skillsDeclared')}</span></div>
                    ))}
                    {(detail.dependencies?.executables ?? []).map(row => (
                      <div key={row.name} className={css.muted}>
                        {row.name} <span className={`${css.tag} ${row.found ? css.tagOk : css.tagWarn}`}>{row.found ? t('skillsFound') : t('skillsMissing')}</span>
                      </div>
                    ))}
                  </>
                )}
            </div>

            {state.message === undefined ? null : (
              <div className={`${css.message} ${state.failed ? css.messageFailed : ''}`}>{state.message}</div>
            )}

            {confirmDelete ? (
              <div
                className={css.dialogBackdrop}
                onClick={() => {
                  setConfirmDelete(false)
                  setDeleteOutcome(undefined)
                }}
              >
                <div
                  className={css.dialog}
                  role="dialog"
                  aria-modal="true"
                  onClick={(event) => { event.stopPropagation() }}
                >
                  <h2>{t('skillsDeleteTitle')}</h2>
                  <p className={css.muted}>{t('skillsDeleteBody')}</p>

                  {detail.asset.origin === 'builtin' ? (
                    <div className={`${css.info} ${css.infoError}`} style={{ margin: '12px 0 0' }}>
                      <strong>{t('skillsDeleteBuiltinWarning')}</strong>
                    </div>
                  ) : null}

                  {detail.asset.bindings.length > 0 ? (
                    <div
                      className={`${css.info} ${css.infoError}`}
                      style={{ margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}
                    >
                      <div><strong>{t('skillsDeleteBoundWarning')}</strong></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', maxHeight: '140px', overflowY: 'auto' }}>
                        {detail.asset.bindings.map(b => (
                          <div key={`${b.teamId}:${b.roleId}`}>• {b.teamName} → {b.roleName}</div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {deleteOutcome?.ok === false && deleteOutcome.blockers.length > 0 ? (
                    <div
                      className={`${css.info} ${css.infoError}`}
                      style={{ margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}
                    >
                      <div><strong>{t('skillsDeleteBlocked')}</strong></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                        {deleteOutcome.blockers.map((blocker, idx) => (
                          <div key={idx}>• {blocker.detail || blocker.kind}</div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className={css.dialogActions}>
                    <Button onClick={() => { setConfirmDelete(false); setDeleteOutcome(undefined) }}>{t('skillsCancel')}</Button>
                    <Button
                      disabled={detail.asset.origin === 'builtin' || detail.asset.bindings.length > 0}
                      onClick={() => {
                        void controller.remove(detail.asset.id).then((outcome) => {
                          if (outcome?.ok === true) {
                            setConfirmDelete(false)
                            setDeleteOutcome(undefined)
                            setPage({ kind: 'list' })
                          } else {
                            setDeleteOutcome(outcome)
                          }
                        })
                      }}
                    >
                      {t('skillsConfirm')}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    )
  }

  return (
    <div className={css.page}>
      <div className={css.headRow}>
        <div className={css.headText}>
          <h2 className={css.title}>{t('skillsTitle')}</h2>
          <p className={css.sub}>{t('skillsSub')}</p>
        </div>
        <div className={css.titleActions}>
          <Button variant="outline" onClick={() => { setCreating(true) }}>{t('skillsNew')}</Button>
          <Button variant="outline" onClick={() => { void controller.openScanFolder() }}>
            {state.canOpenScanFolder ? t('skillsOpenScanFolder') : t('skillsCopyScanFolder')}
          </Button>
        </div>
      </div>
      <div className={css.info}>ⓘ <span>{t('skillsNote')}</span></div>
      {state.scanFolderNotice === undefined ? null : (
        <div className={css.info}>
          <span>{t(state.scanFolderNotice === 'opened' ? 'skillsScanFolderOpened'
            : state.scanFolderNotice === 'copied' ? 'skillsScanFolderCopied' : 'skillsScanFolderCopyFailed')}</span>
        </div>
      )}

      <div className={css.actions}>
        <input
          id="team-skill-import"
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(event) => { void importFolder(event.target.files) }}
          {...{ webkitdirectory: '' }}
        />
        <Button variant="outline" onClick={() => { document.getElementById('team-skill-import')?.click() }}>{t('skillsImport')}</Button>
        <Button variant="outline" onClick={() => { void controller.scanImportFolder() }}>{t('skillsScan')}</Button>
      </div>

      {state.scan === undefined ? null : (
        <div className={css.scan}>
          <div className={css.scanHead}>
            {t('skillsScanSummary')
              .replace('{scanned}', String(state.scan.scanned))
              .replace('{imported}', String(state.scan.imported))
              .replace('{existing}', String(state.scan.existing))
              .replace('{invalid}', String(state.scan.invalid))}
          </div>
          <div className={css.muted}>{t('skillsScanHint')} {state.scan.root}</div>
          {state.scan.entries.length === 0 ? <div className={css.muted}>{t('skillsScanEmpty')}</div> : (
            <ul className={css.scanList}>
              {state.scan.entries.map(entry => (
                <li key={entry.folder} className={css.scanRow}>
                  <span className={css.scanFolder}>{entry.folder}</span>
                  <span className={`${css.tag} ${entry.status === 'imported' ? css.tagOk : entry.status === 'invalid' ? css.tagWarn : ''}`}>
                    {t(entry.status === 'imported' ? 'skillsScanImported' : entry.status === 'existing' ? 'skillsScanExisting' : 'skillsScanInvalid')}
                  </span>
                  <span className={css.muted}>
                    {entry.status === 'invalid' ? scanReasonText(entry, t) : entry.assetId ?? entry.skillId ?? ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className={css.toolbar}>
        <input className={css.search} value={query} placeholder={t('skillsSearch')} onChange={(event) => { setQuery(event.target.value) }} />
        <select
          className={chips.select}
          aria-label={t('skillsCategoryAll')}
          value={category}
          onChange={(event) => { setCategory(event.target.value as 'all' | SkillCategoryId) }}
        >
          <option value="all">{t('skillsCategoryAll')}</option>
          {SKILL_CATEGORIES.map(id => (
            <option key={id} value={id}>{t(SKILL_CATEGORY_LABELS[id])}</option>
          ))}
        </select>
      </div>
      <div className={css.segment}>
        <button type="button" className={`${chips.chip} ${origin === 'all' ? chips.chipActive : ''}`} onClick={() => { setOrigin('all') }}>{t('skillsAll')}</button>
        <button type="button" className={`${chips.chip} ${origin === 'builtin' ? chips.chipActive : ''}`} onClick={() => { setOrigin('builtin') }}>{t('skillsBuiltin')}</button>
        <button type="button" className={`${chips.chip} ${origin === 'custom' ? chips.chipActive : ''}`} onClick={() => { setOrigin('custom') }}>{t('skillsCustom')}</button>
      </div>

      <div className={css.rowlist}>
        {visible.length === 0 ? <div className={css.empty}>{assets.length === 0 ? t('skillsEmpty') : t('skillsFilterEmpty')}</div> : visible.map(asset => (
          <button
            key={asset.id}
            type="button"
            className={css.row}
            onClick={() => { setPage({ kind: 'detail', assetId: asset.id }); void controller.select(asset.id) }}
          >
            <span className={`${css.dot} ${asset.origin === 'builtin' ? '' : css.dotCustom}`} />
            <span className={css.main}>
              <span className={css.rowTitle}>
                {skillLabel(asset.skillId, t)}
                <span className={css.muted}>{asset.skillId}</span>
                <span className={`${chips.originTag} ${originTone(chips, asset.origin)}`}>{originLabel(asset, t)}</span>
                {asset.updateAvailable === true ? <span className={`${css.tag} ${css.tagWarn}`}>{t('skillsOverrideOn')}</span> : null}
              </span>
              <span className={css.rowSub}>
                {asset.description} · {asset.fileCount} {t('skillsFiles')} · {t('skillsBound')} {asset.bindings.length}
              </span>
            </span>
            <span className={css.chev}>›</span>
          </button>
        ))}
      </div>

      {state.message === undefined ? null : (
        <div className={`${css.message} ${state.failed ? css.messageFailed : ''}`}>{state.message}</div>
      )}

      {creating ? (
        <div className={css.dialogBackdrop} onClick={() => { setCreating(false) }}>
          <div className={css.dialog} role="dialog" aria-modal="true" onClick={(event) => { event.stopPropagation() }}>
            <h2>{t('skillsNewTitle')}</h2>
            <label className={css.label}>{t('skillsName')}</label>
            <input className={css.field} value={name} placeholder="example-skill" onChange={(event) => { setName(event.target.value) }} />
            <label className={css.label}>{t('skillsDesc')}</label>
            <input className={css.field} value={description} placeholder={t('skillsDesc')} onChange={(event) => { setDescription(event.target.value) }} />
            <div className={css.dialogActions}>
              <Button onClick={() => { setCreating(false) }}>{t('skillsCancel')}</Button>
              <Button onClick={() => {
                void controller.create(name, description).then(() => {
                  setName(''); setDescription(''); setCreating(false)
                })
              }}>{t('skillsConfirm')}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
