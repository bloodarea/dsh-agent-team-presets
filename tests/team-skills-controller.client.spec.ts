import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { TeamSkillsController } from '../src/client/team-skills-controller.ts'

async function controllerWithRemote(teamSkills: Record<string, unknown>): Promise<TeamSkillsController> {
  const ctx = new Context()
  ctx.provide('remote')
  ctx.provide('remote.teamSkills')
  ;(ctx as unknown as { remote: Record<string, unknown> }).remote = { session: {}, teamSkills }
  const controller = new TeamSkillsController(ctx)
  await Promise.resolve()
  return controller
}

const emptyLibrary = { root: '/mock/skills', assets: [], teams: [], official: [] }

describe('TeamSkillsController', () => {
  it('checks the inbox on entry and after scans, retaining the result across routine refreshes', async () => {
    const changes = [{ folder: 'new-skill', status: 'imported', ignoredDependencyFields: ['dependencies'] }]
    const library = vi.fn(async (checkInbox?: boolean) => ({
      ok: true,
      value: checkInbox ? { ...emptyLibrary, inboxChanges: changes } : emptyLibrary,
    }))
    const scan = {
      ok: true, root: '/mock/skills/inbox', scanned: 2, imported: 1, updated: 0, existing: 0, missing: 1, invalid: 0,
      entries: [...changes, { folder: 'old-skill', status: 'missing', reason: 'source-missing' }],
    }
    const scanImportFolder = vi.fn().mockResolvedValue({ ok: true, value: scan })
    const controller = await controllerWithRemote({ library, scanImportFolder })

    // Every call names the parameter explicitly: the Remote gateway rejects a
    // short argument list before it encodes anything, so `api.library()` would
    // fail the whole panel instead of reading the library.
    expect(library.mock.calls).toEqual([[false]])
    await controller.refresh(true)
    await controller.refresh()
    expect(library.mock.calls).toEqual([[false], [true], [false]])
    expect(controller.getSnapshot().inboxChanges).toEqual(changes)

    library.mockResolvedValueOnce({ ok: true, value: { ...emptyLibrary, inboxChanges: [] } })
    await controller.scanImportFolder()
    expect(scanImportFolder).toHaveBeenCalledOnce()
    expect(library).toHaveBeenLastCalledWith(true)
    expect(controller.getSnapshot().inboxChanges).toEqual([])
    expect(controller.getSnapshot().scan).toEqual(scan)
  })

  it('names every argument of unassignRole, including the optional assetId', async () => {
    // The gateway counts a Remote call's arguments before encoding them, and
    // `unassignRole` declares three. A two-argument call is refused client-side
    // with "expected 3 argument(s), got 2" — the unassign button would fail
    // without ever reaching the Host.
    const library = vi.fn().mockResolvedValue({ ok: true, value: emptyLibrary })
    const unassignRole = vi.fn().mockResolvedValue({ ok: true, value: emptyLibrary })
    const controller = await controllerWithRemote({ library, unassignRole })

    await controller.unassign('builtin-long-running', 'captain')
    expect(unassignRole).toHaveBeenCalledExactlyOnceWith('builtin-long-running', 'captain', undefined)
    // A successful write clears the message rather than publishing its key:
    // the refreshed panel is the confirmation.
    expect(controller.getSnapshot().failed).toBe(false)
    expect(controller.getSnapshot().library).toEqual(emptyLibrary)
  })

  it.each([false, true])('creates an editable copy with switchBindings=%s and loads it for the editor', async (switchBindings) => {
    const assetId = 'override:release-notes'
    const detail = { asset: { id: assetId }, body: '# Copy', ...(switchBindings ? { bindingSwitchIssue: 'Unable to save roles' } : {}) }
    const library = vi.fn().mockResolvedValue({ ok: true, value: { ...emptyLibrary, assets: [detail.asset] } })
    const overrideSkill = vi.fn().mockResolvedValue({ ok: true, value: detail })
    const readFile = vi.fn().mockResolvedValue({ ok: true, value: { text: '# Editable copy' } })
    const controller = await controllerWithRemote({ library, overrideSkill, readFile })

    expect(await controller.createOverride('release-notes', switchBindings)).toBe(assetId)
    expect(overrideSkill).toHaveBeenCalledExactlyOnceWith('release-notes', switchBindings)
    expect(library).toHaveBeenLastCalledWith(true)
    expect(readFile).toHaveBeenCalledExactlyOnceWith(assetId, 'SKILL.md')
    expect(controller.getSnapshot()).toMatchObject({
      library: { assets: [detail.asset] },
      selectedId: assetId,
      detail,
      file: 'SKILL.md',
      fileText: '# Editable copy',
      busy: false,
      failed: false,
    })
  })

  it('reports a refused copy without selecting a new asset or checking the inbox', async () => {
    const assetId = 'builtin:release-notes'
    const detail = { asset: { id: assetId }, body: '# Original' }
    const refusal = { ok: false, reason: 'override-refused', detail: 'The Host could not create the copy.' }
    const library = vi.fn().mockResolvedValue({ ok: true, value: { ...emptyLibrary, assets: [detail.asset] } })
    const controller = await controllerWithRemote({
      library,
      detail: vi.fn().mockResolvedValue({ ok: true, value: detail }),
      readFile: vi.fn().mockResolvedValue({ ok: true, value: { text: detail.body } }),
      overrideSkill: vi.fn().mockResolvedValue({ ok: true, value: refusal }),
    })
    await controller.select(assetId)

    expect(await controller.createOverride('release-notes', true)).toBeUndefined()
    expect(library.mock.calls).toEqual([[false]])
    expect(controller.getSnapshot()).toMatchObject({ selectedId: assetId, detail, failed: true, message: refusal.detail })
  })

  it('passes the open version when saving so a stale editor cannot overwrite a newer scan', async () => {
    const assetId = 'custom:scanned-skill'
    const detail = { asset: { id: assetId, version: '1' }, body: '# Open version' }
    const library = vi.fn().mockResolvedValue({ ok: true, value: { ...emptyLibrary, assets: [detail.asset] } })
    const writeFile = vi.fn().mockResolvedValue({
      ok: true, value: { ok: false, reason: 'write-refused', detail: 'This skill changed. Reopen it before saving.' },
    })
    const controller = await controllerWithRemote({
      library,
      detail: vi.fn().mockResolvedValue({ ok: true, value: detail }),
      readFile: vi.fn().mockResolvedValue({ ok: true, value: { text: detail.body } }),
      writeFile,
    })
    await controller.select(assetId)
    await controller.saveFile('SKILL.md', '# Draft')

    expect(writeFile).toHaveBeenCalledExactlyOnceWith(assetId, 'SKILL.md', '# Draft', '1')
    expect(controller.getSnapshot()).toMatchObject({ detail, failed: true, message: 'This skill changed. Reopen it before saving.' })
  })

  it('opens the import folder directly without action: reveal', async () => {
    const ctx = new Context()
    ctx.provide('remote')
    ctx.provide('remote.teamSkills')

    const openWorkspacePath = vi.fn().mockResolvedValue({ ok: true, value: { opened: true } })
    const canOpenWorkspacePath = vi.fn().mockResolvedValue({ ok: true, value: true })
    const prepareImportFolder = vi.fn().mockResolvedValue({
      ok: true,
      value: { ok: true, root: '/mock/team-skills', path: '/mock/team-skills/inbox' },
    })

    // Mock remote objects
    ;(ctx as unknown as { remote: Record<string, unknown> }).remote = {
      session: {
        canOpenWorkspacePath,
        openWorkspacePath,
      },
      teamSkills: {
        prepareImportFolder,
        listLibrary: vi.fn().mockResolvedValue({ ok: true, value: { ok: true, assets: [], roster: [], official: [] } }),
      },
    }

    const controller = new TeamSkillsController(ctx)
    // Wait for async capability detection and refresh
    await Promise.resolve()
    await Promise.resolve()

    await controller.openScanFolder()

    // Must call openWorkspacePath with path and WITHOUT action: 'reveal'
    expect(openWorkspacePath).toHaveBeenCalledWith({
      path: '/mock/team-skills/inbox',
    })
    expect(controller.getSnapshot().scanFolderNotice).toBe('opened')
    expect(controller.getSnapshot().scanFolderPath).toBe('/mock/team-skills/inbox')
  })

  it('calls restoreBuiltinBindings on the remote service and publishes the library', async () => {
    const ctx = new Context()
    ctx.provide('remote')
    ctx.provide('remote.teamSkills')

    const restoreBuiltinBindings = vi.fn().mockResolvedValue({
      ok: true,
      value: { root: '/mock', assets: [], teams: [], official: [] },
    })

    ;(ctx as unknown as { remote: Record<string, unknown> }).remote = {
      session: {},
      teamSkills: {
        restoreBuiltinBindings,
        library: vi.fn().mockResolvedValue({ ok: true, value: { root: '/mock', assets: [], teams: [], official: [] } }),
      },
    }

    const controller = new TeamSkillsController(ctx)
    await Promise.resolve()

    await controller.restoreBuiltinBindings(['builtin-fullstack'])
    expect(restoreBuiltinBindings).toHaveBeenCalledWith(['builtin-fullstack'])
  })

  it('returns delete outcome with blockers when delete is refused by the host', async () => {
    const ctx = new Context()
    ctx.provide('remote')
    ctx.provide('remote.teamSkills')

    const deleteAsset = vi.fn().mockResolvedValue({
      ok: true,
      value: {
        ok: false,
        blockers: [{ kind: 'binding', detail: '标准研发团队 → executor' }],
        warnings: [],
      },
    })

    ;(ctx as unknown as { remote: Record<string, unknown> }).remote = {
      session: {},
      teamSkills: {
        deleteAsset,
        library: vi.fn().mockResolvedValue({ ok: true, value: { root: '/mock', assets: [], teams: [], official: [] } }),
      },
    }

    const controller = new TeamSkillsController(ctx)
    await Promise.resolve()

    const outcome = await controller.remove('builtin:git-release-hygiene')
    expect(deleteAsset).toHaveBeenCalledWith('builtin:git-release-hygiene')
    expect(outcome).toEqual({
      ok: false,
      blockers: [{ kind: 'binding', detail: '标准研发团队 → executor' }],
      warnings: [],
    })
    expect(controller.getSnapshot().failed).toBe(true)
    expect(controller.getSnapshot().message).toContain('binding: 标准研发团队 → executor')
  })
})
