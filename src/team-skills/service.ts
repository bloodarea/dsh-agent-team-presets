/**
 * The settings page's view of the private Team Skill library.
 *
 * Every judgement stays in the manager and the store: this service only shapes
 * their answers for a Remote call, so the page and any Agent-facing tool cannot
 * disagree about whether an import is safe, a delete is allowed, or a role may
 * receive an asset. The one thing it adds is the roster a binding dialog needs —
 * the Teams the page already shows, with their role identities.
 * @module dsh-agent-team-presets/team-skills/service
 */

import { mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { buildSkillPackage, decodeImportFiles } from './import.ts'
import { CAPTAIN_ROLE, TeamSkillManager, sanctionedCopy } from './manager.ts'
import { assertNoSymlinks } from './paths.ts'
import { inspectSkillDirectory, TeamSkillStore } from './store.ts'
import type {
  TeamPreset, TeamSkillAssetView, TeamSkillDeleteView, TeamSkillDetailView, TeamSkillImportFile,
  TeamSkillImportFolderView, TeamSkillLibraryView, TeamSkillRefusalView, TeamSkillScanEntry,
  TeamSkillScanView, TeamSkillTeamView, TeamSkillDependencies,
} from '../types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Remote management surface for the private Team Skill library. */
    teamSkills: TeamSkillService
  }
}

/** Configuration of {@link TeamSkillService}. */
export interface TeamSkillServiceConfig {
  /** The asset store. */
  readonly store: TeamSkillStore
  /** The binding table and its delete guards. */
  readonly manager: TeamSkillManager
  /** The Teams the page shows, read live from Settings. */
  readonly teams: () => readonly TeamPreset[]
  /** Shipped skill ids this deployment provides. */
  readonly official: () => readonly string[]
  /** Resolves once the store and its index are loaded, or `false` when they cannot be. */
  readonly ready: Promise<boolean>
  /** Exact degraded-start reason, when available. */
  readonly startupIssue?: () => string | undefined
  /** Re-applies every live Agent after a binding changed. */
  readonly resync: () => void
}

/** Text the page shows when this deployment could not open its store. */
/** Folder under the private root that a scan reads. */
const IMPORT_FOLDER = 'inbox'

const UNAVAILABLE = 'the Team Skill store could not be opened in this deployment'

/** Blank instruction text a freshly created skill starts from. */
const TEMPLATE = '---\nname: SKILL-ID\ndescription: Describe when this method applies.\n---\n\n# Method\n\nDescribe the steps to follow.\n'

/**
 * Remote management surface over the private Team Skill library.
 */
export class TeamSkillService extends TypertRemoteService {
  /**
   * @param ctx - the owning plugin context.
   * @param config - the store, the manager, and the live roster.
   */
  constructor(ctx: Context, private readonly config: TeamSkillServiceConfig) {
    super(ctx, 'teamSkills')
  }

  /**
   * Wait for the store, reporting why it is unusable.
   * @returns undefined when ready, or the reason the page must show.
   */
  private async settle(): Promise<string | undefined> {
    let opened = false
    try {
      opened = await this.config.ready
    } catch (error: unknown) {
      return `${UNAVAILABLE}: ${String(error)}`
    }
    if (!opened) return this.config.startupIssue?.() ?? UNAVAILABLE
    try { await this.config.manager.reconcile() } catch (error) { return String(error) }
    return undefined
  }

  /**
   * Shape one asset for the page.
   * @param assetId - asset identity.
   * @returns the row, or undefined when it no longer exists.
   */
  private row(assetId: string): TeamSkillAssetView | undefined {
    const asset = this.config.store.get(assetId)
    if (asset === undefined) return undefined
    return {
      id: asset.id,
      skillId: asset.skillId,
      description: asset.description,
      origin: asset.origin,
      version: asset.version,
      ...asset.officialSkillId === undefined ? {} : { officialSkillId: asset.officialSkillId },
      ...asset.updateAvailable === undefined ? {} : { updateAvailable: asset.updateAvailable },
      editable: asset.origin !== 'builtin',
      fileCount: asset.files.length,
      totalBytes: asset.files.reduce((sum, file) => sum + file.size, 0),
      mcpServers: asset.dependencies.mcpServers.map(server => server.serverName),
      // A name can legitimately exist under several origins, but two of them are
      // the SAME skill: the shipped copy and an override derived from it. That
      // pair is a sanctioned copy, not a clash, and reporting it made a healthy
      // library look broken. Anything else sharing the name is a real clash the
      // page has to state, because nothing overwrites anything.
      clashesWith: this.config.store.list()
        .filter(other => other.id !== asset.id && other.skillId === asset.skillId && !sanctionedCopy(asset, other))
        .map(other => other.id),
      bindings: this.config.manager.bindingSummaries(assetId),
    }
  }

  /**
   * Read the Teams the binding dialog addresses.
   * @returns one row per Team, captain slot first.
   */
  private roster(): TeamSkillTeamView[] {
    return this.config.teams().map(team => ({
      id: team.id,
      name: team.name,
      roles: [
        { id: CAPTAIN_ROLE, name: team.captain.name, captain: true },
        // A member without a stored identity is addressed by its name, which is
        // the same fallback the runtime uses when it resolves a claim.
        ...team.members.map(member => ({ id: member.id ?? member.name, name: member.name, captain: false })),
      ],
    }))
  }

  /**
   * List the library, the roster, and the shipped skill ids.
   * @returns one page load.
   */
  @Remote
  async library(): Promise<TeamSkillLibraryView> {
    const issue = await this.settle()
    if (issue !== undefined) {
      return { root: this.config.store.root, assets: [], teams: [], official: [], issue }
    }
    return {
      root: this.config.store.root,
      assets: this.config.store.list().flatMap((asset) => {
        const row = this.row(asset.id)
        return row === undefined ? [] : [row]
      }),
      teams: this.roster(),
      official: [...this.config.official()],
    }
  }

  /**
   * Read one asset with its files and body.
   * @param assetId - asset identity.
   * @returns the detail, or a refusal when the asset is gone.
   */
  @Remote
  async detail(assetId: string): Promise<TeamSkillDetailView | TeamSkillRefusalView> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, reason: 'unavailable', detail: issue }
    const asset = this.config.store.get(assetId)
    const row = this.row(assetId)
    if (asset === undefined || row === undefined) {
      return { ok: false, reason: 'unknown-asset', detail: `Team Skill "${assetId}" is not installed any more.` }
    }
    let body = ''
    try {
      body = await this.config.store.readText(assetId, 'SKILL.md')
    } catch (error) {
      return { ok: false, reason: 'unreadable', detail: String(error) }
    }
    const report = await this.config.manager.dependencyReport(assetId)
    return {
      asset: row,
      files: asset.files.map(file => ({ path: file.path, size: file.size, text: file.text })),
      body,
      directory: this.config.store.assetPath(asset.id, asset.version),
      dependencies: report,
    }
  }

  /**
   * Read one text file of an asset.
   * @param assetId - asset identity.
   * @param path - relative path.
   * @returns the text, or a refusal.
   */
  @Remote
  async readFile(assetId: string, path: string): Promise<{ ok: true; path: string; text: string } | TeamSkillRefusalView> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, reason: 'unavailable', detail: issue }
    try {
      return { ok: true, path, text: await this.config.store.readText(assetId, path) }
    } catch (error: unknown) {
      return { ok: false, reason: 'unreadable', detail: String(error) }
    }
  }

  /**
   * Write one file, publishing a new asset version.
   * @param assetId - asset identity.
   * @param path - relative path.
   * @param text - new content.
   * @returns the refreshed detail, or a refusal.
   */
  @Remote
  async writeFile(assetId: string, path: string, text: string): Promise<TeamSkillDetailView | TeamSkillRefusalView> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, reason: 'unavailable', detail: issue }
    try {
      await this.config.store.writeFile(assetId, path, text)
    } catch (error: unknown) {
      return { ok: false, reason: 'write-refused', detail: String(error) }
    }
    this.config.resync()
    return this.detail(assetId)
  }

  /**
   * Create one editable skill from the blank template.
   * @param skillId - kebab-case name the new skill takes.
   * @param description - frontmatter description.
   * @returns the new detail, or a refusal when the folder is not a legal skill.
   */
  @Remote
  async createSkill(skillId: string, description: string): Promise<TeamSkillDetailView | TeamSkillRefusalView> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, reason: 'unavailable', detail: issue }
    const text = TEMPLATE.replace('SKILL-ID', skillId).replace('Describe when this method applies.', description)
    const result = buildSkillPackage([{ path: 'SKILL.md', bytes: new TextEncoder().encode(text) }])
    if (!result.ok) return { ok: false, reason: result.reason, detail: `"${skillId}" is not a legal skill id.` }
    const id = `custom:${skillId}`
    if (this.config.store.list().some(asset => asset.skillId === result.skill.name)) return { ok: false, reason: 'duplicate', detail: `a skill named "${result.skill.name}" already exists` }
    try {
      await this.config.store.install(result.skill, { id, origin: 'custom', version: '1' })
    } catch (error) { return { ok: false, reason: 'install-refused', detail: String(error) } }
    return this.detail(id)
  }

  /**
   * Import one folder, as the browser's picker sends it.
   * @param files - relative paths and base64 content.
   * @returns the new detail, or a refusal naming the exact rule that failed.
   */
  @Remote
  async importSkill(files: readonly TeamSkillImportFile[]): Promise<TeamSkillDetailView | TeamSkillRefusalView> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, reason: 'unavailable', detail: issue }
    let decoded
    try { decoded = decodeImportFiles(files.map(file => ({ path: file.path, base64: file.base64 }))) }
    catch (error) { return { ok: false, reason: 'import-refused', detail: String(error) } }
    const result = buildSkillPackage(decoded)
    if (!result.ok) {
      return { ok: false, reason: result.reason, detail: `${result.reason}${result.path === undefined ? '' : ` at ${result.path}`}` }
    }
    const id = `custom:${result.skill.name}`
    if (this.config.store.list().some(asset => asset.skillId === result.skill.name)) {
      return { ok: false, reason: 'duplicate', detail: `a skill named "${result.skill.name}" already exists` }
    }
    try {
      await this.config.store.install(result.skill, { id, origin: 'custom', version: '1' })
    } catch (error) { return { ok: false, reason: 'install-refused', detail: String(error) } }
    return this.detail(id)
  }

  /**
   * Create the private import directory when it is missing.
   *
   * The page opens this folder for the user, so the gesture has to work on a
   * fresh installation where no scan ever ran. Creating it here also keeps the
   * path the same one {@link scanImportFolder} reads.
   * @returns the absolute folder, or a refusal when it cannot be created safely.
   */
  @Remote
  async prepareImportFolder(): Promise<TeamSkillImportFolderView | TeamSkillRefusalView> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, reason: 'unavailable', detail: issue }
    const path = join(this.config.store.root, IMPORT_FOLDER)
    try {
      await assertNoSymlinks(path)
      await mkdir(path, { recursive: true })
      await assertNoSymlinks(path)
    } catch (error: unknown) {
      return { ok: false, reason: 'scan-folder-refused', detail: String(error) }
    }
    return { ok: true, root: this.config.store.root, path }
  }

  /**
   * Scan the private import directory and publish every legal new skill.
   *
   * The directory is the only supported way to hand the plugin a skill without
   * the browser picker. Each folder is judged by the same importer rules as a
   * picked folder, and the answer names the exact refusal for the ones that
   * fail, so the page can list them instead of reporting a single count.
   * @returns one row per folder, or a refusal when the store is unavailable.
   */
  @Remote
  async scanImportFolder(): Promise<TeamSkillScanView | TeamSkillRefusalView> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, reason: 'unavailable', detail: issue }
    const root = join(this.config.store.root, IMPORT_FOLDER)
    let dirents
    try { await assertNoSymlinks(root); dirents = await readdir(root, { withFileTypes: true }) }
    catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { ok: true, root, scanned: 0, imported: 0, existing: 0, invalid: 0, entries: [] }
      }
      return { ok: false, reason: 'scan-refused', detail: String(error) }
    }
    // One scan is a check-and-publish across many folders; holding the store
    // lock keeps a concurrent assignment or edit from interleaving a version
    // publish between the duplicate check and the install.
    return this.config.store.withLock(async () => {
      const entries: TeamSkillScanEntry[] = []
      for (const dirent of dirents.sort((left, right) => left.name.localeCompare(right.name))) {
        if (dirent.name.startsWith('.')) continue
        if (!dirent.isDirectory()) {
          entries.push({ folder: dirent.name, status: 'invalid', reason: dirent.isSymbolicLink() ? 'symlink-escape' : 'not-directory' })
          continue
        }
        const inspected = await inspectSkillDirectory(join(root, dirent.name))
        if (!inspected.ok) {
          entries.push({ folder: dirent.name, status: 'invalid', reason: inspected.reason, ...inspected.path === undefined ? {} : { detail: inspected.path } })
          continue
        }
        const skillId = inspected.skill.name
        const clash = this.config.store.list().find(asset => asset.skillId === skillId)
        if (clash !== undefined) {
          entries.push({ folder: dirent.name, status: 'existing', skillId, assetId: clash.id, reason: 'duplicate' })
          continue
        }
        try {
          const asset = await this.config.store.install(inspected.skill, { id: `custom:${skillId}`, origin: 'custom', version: '1' })
          entries.push({ folder: dirent.name, status: 'imported', skillId, assetId: asset.id })
        } catch (error: unknown) {
          entries.push({ folder: dirent.name, status: 'invalid', skillId, reason: 'install-refused', detail: String(error) })
        }
      }
      const count = (status: TeamSkillScanEntry['status']): number => entries.filter(entry => entry.status === status).length
      return { ok: true, root, scanned: entries.length, imported: count('imported'), existing: count('existing'), invalid: count('invalid'), entries }
    })
  }

  /**
   * Copy one shipped skill into an editable override.
   * @param skillId - shipped skill id.
   * @returns the new detail, or a refusal.
   */
  @Remote
  async overrideSkill(skillId: string): Promise<TeamSkillDetailView | TeamSkillRefusalView> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, reason: 'unavailable', detail: issue }
    const id = `override:${skillId}`
    try {
      await this.config.store.createOverride(skillId, id)
      await this.config.manager.replaceBuiltinBindings(skillId, id)
      this.config.resync()
    } catch (error: unknown) {
      return { ok: false, reason: 'override-refused', detail: String(error) }
    }
    return this.detail(id)
  }

  @Remote
  async updateDependencies(assetId: string, dependencies: TeamSkillDependencies): Promise<TeamSkillDetailView | TeamSkillRefusalView> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, reason: 'unavailable', detail: issue }
    try { await this.config.store.updateDependencies(assetId, dependencies) }
    catch (error) { return { ok: false, reason: 'dependency-refused', detail: String(error) } }
    this.config.resync()
    return this.detail(assetId)
  }

  /**
   * Reset one override back to the shipped copy.
   * @param assetId - override identity.
   * @returns the refreshed detail, or a refusal.
   */
  @Remote
  async resetSkill(assetId: string): Promise<TeamSkillDetailView | TeamSkillRefusalView> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, reason: 'unavailable', detail: issue }
    try {
      const reset = await this.config.store.resetOverride(assetId)
      // "Restore to the built-in version" has to put the roles back on the
      // shipped copy: leaving them on a copy whose content merely equals the
      // shipped one would keep the default bound to the user's own asset.
      if (reset.officialSkillId !== undefined) {
        await this.config.manager.replaceAssetBindings(assetId, `builtin:${reset.officialSkillId}`)
      }
    } catch (error: unknown) {
      return { ok: false, reason: 'reset-refused', detail: String(error) }
    }
    this.config.resync()
    return this.detail(assetId)
  }

  /**
   * Delete one asset, listing every blocker at once.
   * @param assetId - asset identity.
   * @returns the outcome.
   */
  @Remote
  async deleteAsset(assetId: string): Promise<TeamSkillDeleteView> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, blockers: [{ kind: 'unavailable', detail: issue }], warnings: [] }
    let outcome
    try { outcome = await this.config.manager.remove(assetId) }
    catch (error) { return { ok: false, blockers: [{ kind: 'delete-refused', detail: String(error) }], warnings: [] } }
    if (outcome.ok) this.config.resync()
    return {
      ok: outcome.ok,
      blockers: outcome.blockers.map((blocker) => {
        if (blocker.kind === 'binding') {
          return { kind: 'binding', detail: blocker.bindings.map(row => `${row.teamName} → ${row.roleName}`).join(', ') }
        }
        if (blocker.kind === 'active') return { kind: 'active', detail: blocker.sessions.join(', ') }
        if (blocker.kind === 'dependency') return { kind: 'dependency', detail: blocker.dependents.join(', ') }
        return { kind: 'official', detail: 'a shipped Team Skill is read-only' }
      }),
      warnings: outcome.warnings,
    }
  }

  /**
   * Bind one asset to one role slot.
   * @param teamId - Team identity.
   * @param roleId - role identity, or `captain`.
   * @param assetId - asset identity.
   * @returns whether the assignment landed, and the refreshed library.
   */
  @Remote
  async assignRole(teamId: string, roleId: string, assetId: string): Promise<{ ok: boolean; detail: string; unverified?: readonly string[]; library: TeamSkillLibraryView }> {
    const issue = await this.settle()
    if (issue !== undefined) return { ok: false, detail: issue, library: await this.library() }
    let result
    try { result = await this.config.manager.assign({ teamId, roleId, assetId, captain: roleId === CAPTAIN_ROLE }) }
    catch (error) { return { ok: false, detail: String(error), library: await this.library() } }
    if (result.ok) this.config.resync()
    return {
      ok: result.ok,
      detail: result.ok ? (result.unverified.length === 0 ? '' : `Required MCP servers are unverified: ${result.unverified.join(', ')}`) : result.reason,
      unverified: result.unverified ?? [],
      library: await this.library(),
    }
  }

  /**
   * Remove one role's assignment.
   * @param teamId - Team identity.
   * @param roleId - role identity.
   * @returns the refreshed library.
   */
  @Remote
  async unassignRole(teamId: string, roleId: string, assetId?: string): Promise<TeamSkillLibraryView> {
    if (await this.settle() !== undefined) return await this.library()
    try { await this.config.manager.unassign(teamId, roleId, assetId) }
    catch (error) { return { ...await this.library(), issue: String(error) } }
    this.config.resync()
    return this.library()
  }

  /**
   * Restore official default skill bindings for built-in teams.
   * @param teamIds - optional list of team identities to restore; defaults to all built-in teams.
   * @returns the refreshed library.
   */
  @Remote
  async restoreBuiltinBindings(teamIds?: string[]): Promise<TeamSkillLibraryView> {
    if (await this.settle() !== undefined) return await this.library()
    try { await this.config.manager.restoreBuiltinBindings(teamIds) }
    catch (error) {
      // A swallowed error here reads on the page as "nothing happened", which is
      // indistinguishable from "there was nothing to restore". Log it, and keep
      // returning the issue so the page can name the failure too.
      this.ctx.logger.warn('agent-team-presets: restoring built-in Team Skill bindings failed: %s', String(error))
      return { ...await this.library(), issue: String(error) }
    }
    this.config.resync()
    return this.library()
  }
}
