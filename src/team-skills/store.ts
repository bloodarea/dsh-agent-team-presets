/** Immutable package versions and an atomically persisted private registry. */
import { AsyncLocalStorage } from 'node:async_hooks'
import { createHash, randomUUID } from 'node:crypto'
import { lstat, mkdir, open, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { SkillPathError, assertNoSymlinks, canonicalRoot, assetDirectoryName, checkFolder, isTextBytes, normalizeSkillPath, resolveInside } from './paths.ts'
import { buildSkillPackage, renameSkillPackage } from './import.ts'

import type { ImportedFile, SkillPackage } from './import.ts'
import type { TeamSkillAsset, TeamSkillDependencies, TeamSkillFile, TeamSkillOrigin } from '../types.ts'

export const SKILL_IMPORT_FOLDER = 'inbox'
const REGISTRY_VERSION = 1
interface RegistryDocument { readonly version: number; readonly assets: readonly TeamSkillAsset[]; readonly transactionId?: string }
type JournalAction = { kind: 'create'; path: string } | { kind: 'move'; path: string; backup: string }
  | { kind: 'relocate'; path: string; destination: string }
interface TransactionJournal { version: 1; id: string; actions: JournalAction[] }
export interface OfficialSkillEntry { readonly skillId: string; readonly directory: string; readonly version: string }
const NO_DEPENDENCIES: TeamSkillDependencies = { mcpServers: [], executables: [], otherSkills: [] }
const locks = new Map<string, Promise<unknown>>()
const lockContext = new AsyncLocalStorage<ReadonlySet<string>>()
interface Transaction { assets: Map<string, TeamSkillAsset>; journal: TransactionJournal; dirty: boolean }

function digestBytes(bytes: Uint8Array): string { return createHash('sha256').update(bytes).digest('hex') }
export function folderDigest(files: readonly TeamSkillFile[]): string {
  const hash = createHash('sha256')
  for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) hash.update(`${file.path}\u0000${file.sha256}\n`)
  return hash.digest('hex')
}
export function fileTable(files: readonly ImportedFile[]): TeamSkillFile[] {
  return [...files].sort((a, b) => a.path.localeCompare(b.path)).map(file => ({ path: file.path, size: file.bytes.byteLength, sha256: digestBytes(file.bytes), text: isTextBytes(file.bytes) }))
}
const ENCODED_COMPONENT = /^~(?:[a-f0-9]+|h[a-f0-9]{64})$/u
function component(value: string): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9:._-]*$/u.test(value)) throw new Error(`invalid asset path component: ${String(value)}`)
  return value
}
/** Logical ids stay unchanged in JSON; only their disk coordinates are encoded.
 * `~` was never a valid logical component, so encoded and old names cannot clash.
 * Uppercase, DOS devices and trailing dots are encoded on every platform too. */
export function diskComponent(value: string): string {
  component(value)
  if (value.length <= 120 && /^[a-z0-9][a-z0-9._-]*$/u.test(value) && !value.endsWith('.')
    && !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(value)) return value
  return value.length <= 120 ? `~${Buffer.from(value, 'utf8').toString('hex')}` : `~h${digestBytes(Buffer.from(value, 'utf8'))}`
}
function strings(value: unknown): value is string[] { return Array.isArray(value) && value.every(item => typeof item === 'string') }
function importFolderName(value: string): string {
  if (normalizeSkillPath(value) !== value || value.includes('/') || value.startsWith('.')) throw new Error('invalid Team Skill source folder')
  return value
}
function validateAsset(value: unknown): asserts value is TeamSkillAsset {
  if (value === null || typeof value !== 'object') throw new Error('invalid Team Skill asset')
  const a = value as TeamSkillAsset
  component(a.id); component(a.version); assetDirectoryName(a.skillId)
  if (!['builtin', 'custom', 'override'].includes(a.origin) || typeof a.description !== 'string' || !/^[a-f0-9]{64}$/u.test(a.digest)
    || !Number.isSafeInteger(a.updatedAt) || a.updatedAt < 0 || !Array.isArray(a.files)
    || (a.officialSkillId !== undefined && (typeof a.officialSkillId !== 'string' || assetDirectoryName(a.officialSkillId) !== a.officialSkillId))
    || (a.baseVersion !== undefined && component(a.baseVersion) !== a.baseVersion)
    || (a.updateAvailable !== undefined && typeof a.updateAvailable !== 'boolean')) throw new Error('invalid Team Skill asset shape')
  if (a.sourceFolder !== undefined) {
    if (a.origin !== 'custom' || typeof a.sourceFolder !== 'string') throw new Error('invalid Team Skill source folder')
    importFolderName(a.sourceFolder)
  }
  for (const file of a.files) {
    if (file === null || typeof file !== 'object' || typeof file.path !== 'string' || normalizeSkillPath(file.path) !== file.path
      || typeof file.text !== 'boolean' || typeof file.sha256 !== 'string' || !/^[a-f0-9]{64}$/u.test(file.sha256)) throw new Error('invalid Team Skill file shape')
  }
  checkFolder(a.files.map(file => ({ path: file.path, bytes: file.size })))
  if (!a.files.some(file => file.path === 'SKILL.md') || folderDigest(a.files) !== a.digest) throw new Error('invalid Team Skill file manifest')
  const d = a.dependencies
  if (!d || !strings(d.executables) || !strings(d.otherSkills) || !Array.isArray(d.mcpServers)
    || d.mcpServers.some(server => !server || typeof server.serverName !== 'string' || typeof server.required !== 'boolean'
      || (server.toolNames !== undefined && !strings(server.toolNames))
      || (server.capabilities !== undefined && (!Array.isArray(server.capabilities) || server.capabilities.some((c: unknown) => c !== 'tools' && c !== 'resources'))))) throw new Error('invalid Team Skill dependencies')
}
function immutable(asset: TeamSkillAsset): TeamSkillAsset {
  const clone = structuredClone(asset)
  const freeze = (value: unknown): void => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) } }
  freeze(clone)
  return clone
}

/** Atomically replace one JSON document; failed writes leave its previous bytes intact. */
export async function atomicWriteJson(path: string, value: unknown): Promise<void> {
  await assertNoSymlinks(path)
  await mkdir(dirname(path), { recursive: true })
  const temporary = join(dirname(path), `.tmp-${randomUUID()}`)
  try {
    const handle = await open(temporary, 'wx', 0o600)
    try { await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8'); await handle.sync() } finally { await handle.close() }
    await assertNoSymlinks(path)
    await rename(temporary, path)
  } finally { await rm(temporary, { force: true }) }
}

export class TeamSkillStore {
  private assets = new Map<string, TeamSkillAsset>()
  private revision = 0
  private opened = false
  private readonly transactions = new AsyncLocalStorage<Transaction>()
  private physicalRoot: string | undefined
  constructor(private readonly configuredRoot: string) {}
  /** Pinned once open starts. Resolving it is kept out of plugin construction. */
  get root(): string { return this.physicalRoot ?? resolve(this.configuredRoot) }
  get registryRevision(): number { return this.revision }
  private get table(): Map<string, TeamSkillAsset> { return this.transactions.getStore()?.assets ?? this.assets }
  assetPath(assetId: string, version: string): string { return join(this.root, 'assets', diskComponent(assetId), diskComponent(version)) }
  private manifestPath(assetId: string, version: string): string { return join(this.root, 'manifests', diskComponent(assetId), `${diskComponent(version)}.json`) }

  /** Share this reentrant lock with manager check-and-commit operations. */
  async withLock<T>(operation: () => Promise<T>): Promise<T> {
    const key = resolve(this.root)
    if (lockContext.getStore()?.has(key)) return operation()
    const previous = locks.get(key) ?? Promise.resolve()
    const next = previous.catch(() => {}).then(() => lockContext.run(new Set([...(lockContext.getStore() ?? []), key]), operation))
    locks.set(key, next)
    try { return await next } finally { if (locks.get(key) === next) locks.delete(key) }
  }
  private async load(): Promise<Map<string, TeamSkillAsset>> {
    const path = join(this.root, 'registry.json')
    await assertNoSymlinks(path)
    let raw: string
    try { raw = await readFile(path, 'utf8') } catch (error: unknown) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return new Map(); throw error }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || (parsed as RegistryDocument).version !== REGISTRY_VERSION || !Array.isArray((parsed as RegistryDocument).assets)) throw new Error('unexpected Team Skill registry layout')
    const assets = new Map<string, TeamSkillAsset>()
    for (const asset of (parsed as RegistryDocument).assets) { validateAsset(asset); if (assets.has(asset.id)) throw new Error('duplicate Team Skill asset identity'); assets.set(asset.id, immutable(asset)) }
    return assets
  }
  private get journalPath(): string { return join(this.root, 'transaction.json') }
  private journalTarget(path: string): string {
    const parts = path.split('/')
    if (parts[0] === SKILL_IMPORT_FOLDER && parts.length >= 3) {
      importFolderName(parts[1]!)
      normalizeSkillPath(parts.slice(2).join('/'))
    } else if (!/^(?:(?:assets|manifests)\/(?:[A-Za-z0-9][A-Za-z0-9:._-]*|~(?:[a-f0-9]+|h[a-f0-9]{64}))(?:\/(?:[A-Za-z0-9][A-Za-z0-9:._-]*|~(?:[a-f0-9]+|h[a-f0-9]{64}))(?:\.json)?)?|\.(?:stage|removed)-[a-f0-9-]+)$/u.test(path)
      || path.split('/').some(part => part === '.' || part === '..')) throw new Error('invalid Team Skill transaction path')
    // Old POSIX journals may contain ':'. On Windows those coordinates were
    // never valid directories, and a drive-relative segment must not reset root.
    if (process.platform === 'win32' && path.includes(':')) throw new Error('invalid Team Skill transaction path')
    return resolveInside(this.root, path)
  }
  private async record(action: JournalAction): Promise<void> {
    const tx = this.transactions.getStore()!
    this.journalTarget(action.path)
    if (action.kind === 'move') this.journalTarget(action.backup)
    if (action.kind === 'relocate') this.journalTarget(action.destination)
    tx.journal.actions.push(action)
    // Write ahead: the action must be recoverable before any filesystem effect.
    await atomicWriteJson(this.journalPath, tx.journal)
  }
  private async undo(journal: TransactionJournal): Promise<void> {
    while (journal.actions.length > 0) {
      const action = journal.actions[journal.actions.length - 1]!
      const path = this.journalTarget(action.path)
      await assertNoSymlinks(path)
      if (action.kind === 'create') await rm(path, { recursive: true, force: true })
      else {
        const backup = this.journalTarget(action.kind === 'relocate' ? action.destination : action.backup)
        await assertNoSymlinks(backup)
        let exists = true
        try { await lstat(backup) } catch (error: unknown) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; exists = false }
        // A missing backup means either the rename never ran or this undo was
        // completed before another interruption. Both are safe to replay.
        if (exists) await rename(backup, path)
      }
      journal.actions.pop()
      await atomicWriteJson(this.journalPath, journal)
    }
    await rm(this.journalPath, { force: true })
  }
  private async cleanup(journal: TransactionJournal): Promise<void> {
    for (const action of journal.actions) {
      const path = action.kind === 'move' ? this.journalTarget(action.backup)
        : action.path.startsWith('.stage-') ? this.journalTarget(action.path) : undefined
      if (path !== undefined) { await assertNoSymlinks(path); await rm(path, { recursive: true, force: true }) }
    }
    await rm(this.journalPath, { force: true })
  }
  private async recover(): Promise<void> {
    await assertNoSymlinks(this.journalPath)
    let raw: string
    try { raw = await readFile(this.journalPath, 'utf8') } catch (error: unknown) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return; throw error }
    const value = JSON.parse(raw) as TransactionJournal
    if (!value || value.version !== 1 || typeof value.id !== 'string' || !/^[a-f0-9-]+$/u.test(value.id) || !Array.isArray(value.actions)) throw new Error('invalid Team Skill transaction journal')
    for (const action of value.actions) {
      if (!action || (action.kind !== 'create' && action.kind !== 'move' && action.kind !== 'relocate') || typeof action.path !== 'string') throw new Error('invalid Team Skill transaction action')
      this.journalTarget(action.path)
      if (action.kind === 'move') this.journalTarget(action.backup)
      if (action.kind === 'relocate') this.journalTarget(action.destination)
    }
    // The registry rename is the commit point. A separate committed flag would
    // introduce another ambiguous window between these two durable documents.
    let committed = false
    try {
      await assertNoSymlinks(join(this.root, 'registry.json'))
      const registry = JSON.parse(await readFile(join(this.root, 'registry.json'), 'utf8')) as RegistryDocument
      committed = registry.transactionId === value.id
    } catch (error: unknown) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
    if (committed) await this.cleanup(value)
    else await this.undo(value)
  }
  async open(): Promise<void> {
    this.physicalRoot ??= canonicalRoot(this.configuredRoot)
    await this.withLock(async () => {
      if (this.opened) return
      await this.recover()
      this.assets = await this.load()
      this.opened = true
      try { await this.migrateLayout() } catch (error) { this.opened = false; throw error }
    })
  }
  /** Move v1 POSIX directory names without changing identities or losing pinned
   * historical versions. A write-ahead relocate can be undone after a crash;
   * unlike deletion backups, committed destinations are never cleaned up. */
  private async migrateLayout(): Promise<void> {
    await this.transaction(async () => {
      const relocate = async (from: string, to: string): Promise<void> => {
        await assertNoSymlinks(from)
        if (from === to) return
        await assertNoSymlinks(to)
        try { await lstat(to); throw new Error('conflicting Team Skill storage layouts; refusing to overwrite') }
        catch (error: unknown) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
        await this.record({ kind: 'relocate', path: relative(this.root, from).split('\\').join('/'), destination: relative(this.root, to).split('\\').join('/') })
        await rename(from, to)
        this.transactions.getStore()!.dirty = true
      }
      for (const kind of ['assets', 'manifests'] as const) {
        const base = join(this.root, kind)
        await assertNoSymlinks(base)
        let entries
        try { entries = await readdir(base, { withFileTypes: true }) }
        catch (error: unknown) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue; throw error }
        for (const entry of entries) {
          const source = join(base, entry.name)
          await assertNoSymlinks(source)
          if (!entry.isDirectory()) throw new Error('invalid Team Skill asset directory')
          const name = ENCODED_COMPONENT.test(entry.name) ? entry.name : diskComponent(entry.name)
          const directory = join(base, name)
          await relocate(source, directory)
          for (const version of await readdir(directory)) {
            // An interrupted atomic manifest write can leave its private temp
            // file. It is not a published version and must not block reopening.
            if (kind === 'manifests' && !version.endsWith('.json')) {
              await assertNoSymlinks(join(directory, version))
              continue
            }
            const logical = kind === 'manifests' ? version.replace(/\.json$/u, '') : version
            const encoded = ENCODED_COMPONENT.test(logical) ? logical : diskComponent(logical)
            await relocate(join(directory, version), join(directory, kind === 'manifests' ? `${encoded}.json` : encoded))
          }
        }
      }
    })
  }
  list(): readonly TeamSkillAsset[] { return [...this.table.values()].sort((a, b) => a.skillId.localeCompare(b.skillId) || a.id.localeCompare(b.id)) }
  get(assetId: string): TeamSkillAsset | undefined { return this.table.get(assetId) }
  /**
   * Resolve one skill by its name rather than by asset identity.
   *
   * Several assets may legitimately share a name: the shipped copy, a local
   * override of it, and a skill the user imported under the same name. The
   * shipped copy wins, because a name denotes the skill the plugin ships — a
   * user's own copy must never shadow it for a caller that only said the name.
   * Callers that know which copy they mean pass the asset id instead.
   * @param skillId - kebab-case skill name.
   * @returns the shipped copy when it exists, else the best local one.
   */
  bySkillId(skillId: string): TeamSkillAsset | undefined {
    const candidates = this.list().filter(asset => asset.skillId === skillId)
    return candidates.find(asset => asset.origin === 'builtin')
      ?? candidates.find(asset => asset.origin === 'override')
      ?? candidates.find(asset => asset.origin === 'custom')
      ?? candidates[0]
  }
  /** Commit all nested store mutations once; failures restore memory and version folders. */
  async transaction<T>(operation: () => Promise<T>): Promise<T> {
    if (this.transactions.getStore()) return operation()
    return this.withLock(async () => {
      await this.open()
      await this.recover()
      this.assets = await this.load()
      const tx: Transaction = { assets: new Map(this.assets), journal: { version: 1, id: randomUUID(), actions: [] }, dirty: false }
      let result: T
      try {
        result = await this.transactions.run(tx, operation)
        if (tx.dirty) await atomicWriteJson(join(this.root, 'registry.json'), { version: REGISTRY_VERSION, transactionId: tx.journal.id, assets: [...tx.assets.values()] })
      } catch (error: unknown) {
        await this.undo(tx.journal)
        throw error
      }
      this.assets = tx.assets
      if (tx.dirty) this.revision += 1
      // Once committed, leave a failed cleanup journal for startup to finish.
      await this.cleanup(tx.journal).catch(() => {})
      return result
    })
  }
  async install(package_: SkillPackage, options: { readonly id: string; readonly origin: TeamSkillOrigin; readonly version: string; readonly officialSkillId?: string; readonly baseVersion?: string; readonly dependencies?: TeamSkillDependencies; readonly sourceFolder?: string }): Promise<TeamSkillAsset> {
    // Snapshot caller-owned buffers before any await.
    const input = package_.files.map(file => ({ path: file.path, bytes: new Uint8Array(file.bytes) }))
    return this.transaction(async () => {
      const checked = buildSkillPackage(input)
      if (!checked.ok) throw new Error(`invalid skill package: ${checked.reason}`)
      assetDirectoryName(package_.name)
      // The English skill name is the identity every other surface uses: a
      // binding names it, a preset document exports it, and the model addresses
      // the skill by it. Two assets may therefore share it only when one is a
      // sanctioned copy of the other -- an override IS the shipped skill, edited.
      // A user skill or import taking a name that already belongs to another
      // skill is refused here rather than allowed to shadow it, which is what
      // made "bind `git-release-hygiene`" ambiguous in the first place. The
      // shipped set is authoritative: installing a builtin always proceeds, so a
      // legacy same-named user skill can neither block a release nor win a
      // binding (bindings resolve by the builtin's identity).
      if (options.origin !== 'builtin') {
        const clash = [...this.table.values()].find(asset => asset.skillId === package_.name && asset.id !== options.id
          && !(options.origin === 'override' && asset.origin === 'builtin'))
        if (clash !== undefined) {
          throw new Error(`the skill name "${package_.name}" already belongs to ${clash.id}; a skill name is the identity a binding uses`)
        }
      }
      const target = this.assetPath(options.id, options.version)
      const manifest = this.manifestPath(options.id, options.version)
      await assertNoSymlinks(target); await assertNoSymlinks(manifest)
      try { await lstat(target); throw new Error(`Team Skill version already exists: ${options.version}`) } catch (error: unknown) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
      const files = fileTable(checked.skill.files)
      const asset = immutable({ id: options.id, skillId: package_.name, description: checked.skill.description, origin: options.origin, version: options.version,
        ...options.officialSkillId === undefined ? {} : { officialSkillId: options.officialSkillId },
        ...options.baseVersion === undefined ? {} : { baseVersion: options.baseVersion },
        ...options.sourceFolder === undefined ? {} : { sourceFolder: options.sourceFolder },
        digest: folderDigest(files), files, dependencies: options.dependencies ?? NO_DEPENDENCIES, updatedAt: Date.now() })
      validateAsset(asset)
      const tx = this.transactions.getStore()!
      const previous = this.table.get(options.id)
      if (previous && previous.version !== options.version) {
        const previousManifest = this.manifestPath(previous.id, previous.version)
        await assertNoSymlinks(previousManifest)
        try { await lstat(previousManifest) } catch (error: unknown) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
          await this.record({ kind: 'create', path: relative(this.root, previousManifest).split('\\').join('/') })
          await atomicWriteJson(previousManifest, previous)
        }
      }
      const stage = join(this.root, `.stage-${randomUUID()}`)
      await this.record({ kind: 'create', path: relative(this.root, stage).split('\\').join('/') })
      await mkdir(stage, { recursive: true })
      for (const file of checked.skill.files) { const path = resolveInside(stage, file.path); await mkdir(dirname(path), { recursive: true }); await writeFile(path, file.bytes, { flag: 'wx' }) }
      await mkdir(dirname(target), { recursive: true })
      await assertNoSymlinks(target)
      await this.record({ kind: 'create', path: relative(this.root, target).split('\\').join('/') })
      await rename(stage, target)
      // A separate manifest keeps internal bookkeeping out of the user's package.
      try { await lstat(manifest); throw new Error('Team Skill version manifest already exists') } catch (error: unknown) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
      await this.record({ kind: 'create', path: relative(this.root, manifest).split('\\').join('/') })
      await atomicWriteJson(manifest, asset)
      tx.assets.set(asset.id, asset); tx.dirty = true
      return asset
    })
  }
  sourcePath(folder: string): string {
    return resolveInside(join(this.root, SKILL_IMPORT_FOLDER), importFolderName(folder))
  }

  /** Publish a scanned package under its existing identity, or register it for the first time. */
  async publishSource(folder: string, package_: SkillPackage): Promise<'imported' | 'updated' | 'existing'> {
    importFolderName(folder)
    return this.transaction(async () => {
      const current = this.bySkillId(package_.name)
      if (current !== undefined && current.origin !== 'custom') throw new Error(`the skill name "${package_.name}" already belongs to ${current.id}`)
      if (current !== undefined && current.digest === folderDigest(fileTable(package_.files))) {
        if (current.sourceFolder !== folder) {
          const tx = this.transactions.getStore()!
          tx.assets.set(current.id, immutable({ ...current, sourceFolder: folder }))
          tx.dirty = true
        }
        return 'existing'
      }
      await this.install(package_, {
        id: current?.id ?? `custom:${package_.name}`,
        origin: 'custom', sourceFolder: folder, version: current === undefined ? '1' : nextVersion(),
        ...(current === undefined ? {} : { dependencies: current.dependencies }),
      })
      return current === undefined ? 'imported' : 'updated'
    })
  }

  async writeFile(assetId: string, path: string, content: string, expectedVersion?: string): Promise<TeamSkillAsset> {
    return this.transaction(async () => {
      const asset = requireAsset(this.table, assetId)
      if (asset.origin === 'builtin') throw new Error('a shipped Team Skill is read-only; create an editable copy instead')
      if (expectedVersion !== undefined && asset.version !== expectedVersion) {
        throw new Error('This Team Skill has a newer published version. Reopen its file before saving.')
      }
      const relative = normalizeSkillPath(path)
      const files = new Map<string, Uint8Array>()
      for (const file of asset.files) files.set(file.path, await this.readBytes(assetId, file.path, asset.version))
      files.set(relative, new Uint8Array(Buffer.from(content, 'utf8')))
      const checked = buildSkillPackage([...files].map(([path, bytes]) => ({ path, bytes })))
      if (!checked.ok) throw new Error(`invalid skill package: ${checked.reason}`)
      if (checked.skill.name !== asset.skillId) throw new Error('editing cannot change the skill name')
      if (asset.sourceFolder !== undefined) await this.writeSourceFile(asset, asset.sourceFolder, relative, files.get(relative)!)
      return this.install(checked.skill, { ...asset, version: nextVersion() })
    })
  }
  private async writeSourceFile(asset: TeamSkillAsset, folder: string, path: string, bytes: Uint8Array): Promise<void> {
    const current = await inspectSkillDirectory(this.sourcePath(folder))
    const sourceChanged = 'The Team Skill source changed on disk. Scan the import folder before saving.'
    if (!current.ok || folderDigest(fileTable(current.skill.files)) !== asset.digest) throw new Error(sourceChanged)
    const previous = asset.files.find(file => file.path === path)
    if (previous === undefined || !previous.text) throw new Error('Only existing text files can be edited in a scanned Team Skill.')

    const sourcePath = `${SKILL_IMPORT_FOLDER}/${folder}/${path}`
    const stagePath = `.stage-${randomUUID()}`
    const backupPath = `.removed-${randomUUID()}`
    const target = this.journalTarget(sourcePath)
    const stage = this.journalTarget(stagePath)
    const backup = this.journalTarget(backupPath)
    await assertNoSymlinks(target)
    await this.record({ kind: 'create', path: stagePath })
    await writeFile(stage, bytes, { flag: 'wx', mode: (await lstat(target)).mode & 0o777 })
    await this.record({ kind: 'move', path: sourcePath, backup: backupPath })
    await rename(target, backup)
    if (digestBytes(await readFile(backup)) !== previous.sha256) throw new Error(sourceChanged)
    await this.record({ kind: 'relocate', path: stagePath, destination: sourcePath })
    await rename(stage, target)
  }

  /** Change dependency metadata by publishing a new immutable asset version. */
  async updateDependencies(assetId: string, dependencies: TeamSkillDependencies): Promise<TeamSkillAsset> {
    return this.transaction(async () => {
      const asset = requireAsset(this.table, assetId)
      if (asset.origin === 'builtin') throw new Error('a shipped Team Skill is read-only; create an editable copy instead')
      const files: ImportedFile[] = []
      for (const file of asset.files) files.push({ path: file.path, bytes: await this.readBytes(assetId, file.path, asset.version) })
      const checked = buildSkillPackage(files)
      if (!checked.ok) throw new Error(`invalid skill package: ${checked.reason}`)
      return this.install({ ...checked.skill, name: asset.skillId }, { ...asset, dependencies, version: nextVersion() })
    })
  }
  async readBytes(assetId: string, path: string, version?: string): Promise<Uint8Array> {
    const current = requireAsset(this.table, assetId)
    let asset = current
    if (version !== undefined && version !== current.version) {
      const manifest = this.manifestPath(assetId, version)
      await assertNoSymlinks(manifest)
      const value: unknown = JSON.parse(await readFile(manifest, 'utf8'))
      validateAsset(value)
      if (value.id !== assetId || value.version !== version) throw new Error('mismatched Team Skill version manifest')
      asset = value
    }
    const relative = normalizeSkillPath(path)
    const file = asset.files.find(file => file.path === relative)
    if (!file) throw new Error(`file is not in the Team Skill manifest: ${relative}`)
    const absolute = resolveInside(this.assetPath(assetId, asset.version), relative)
    await assertNoSymlinks(absolute)
    const info = await lstat(absolute)
    if (!info.isFile() || info.size !== file.size) throw new Error('Team Skill resource failed size or regular-file validation')
    const bytes = new Uint8Array(await readFile(absolute))
    if (bytes.byteLength !== file.size || digestBytes(bytes) !== file.sha256) throw new Error('Team Skill resource failed integrity validation')
    return bytes
  }
  async readText(assetId: string, path: string, version?: string): Promise<string> { return new TextDecoder('utf-8').decode(await this.readBytes(assetId, path, version)) }
  async remove(assetId: string, beforeCommit?: () => void): Promise<void> {
    await this.transaction(async () => {
      const asset = requireAsset(this.table, assetId)
      if (asset.origin === 'builtin') throw new Error('a shipped Team Skill is read-only and cannot be deleted')
      const tx = this.transactions.getStore()!
      for (const path of [join(this.root, 'assets', diskComponent(assetId)), join(this.root, 'manifests', diskComponent(assetId))]) {
        await assertNoSymlinks(path)
        const backup = join(this.root, `.removed-${randomUUID()}`)
        await this.record({ kind: 'move', path: relative(this.root, path).split('\\').join('/'), backup: relative(this.root, backup).split('\\').join('/') })
        try { await rename(path, backup) } catch (error: unknown) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
      }
      beforeCommit?.()
      tx.assets.delete(assetId); tx.dirty = true
    })
  }
  async ensureOfficial(entries: readonly OfficialSkillEntry[], warnings?: string[]): Promise<readonly string[]> {
    return this.transaction(async () => {
      const changed: string[] = []
      for (const entry of entries) {
        const files = await readDirectory(entry.directory)
        const id = `builtin:${entry.skillId}`
        const current = this.table.get(id)
        const digest = folderDigest(fileTable(files))
        if (current !== undefined && current.version === entry.version && current.digest !== digest) {
          // A shipped copy changed without a version bump. Never rewrite the
          // immutable directory: keep the reviewed copy and report the defect.
          warnings?.push(`the shipped skill "${entry.skillId}" changed without bumping its version; keeping version ${entry.version}`)
        } else if (current === undefined || current.version !== entry.version) {
          const previous = await this.manifest(id, entry.version)
          if (previous !== undefined && previous.digest === digest) {
            // The exact version is already on disk (a downgrade or a reinstall):
            // point the registry back at it instead of republishing.
            this.table.set(id, immutable({ ...previous, officialSkillId: entry.skillId }))
            this.transactions.getStore()!.dirty = true
            changed.push(id)
          } else {
            await this.installFiles(entry.skillId, files, { id, origin: 'builtin', version: entry.version, officialSkillId: entry.skillId })
            changed.push(id)
          }
        }
        for (const asset of this.list()) {
          if (asset.origin !== 'override' || asset.officialSkillId !== entry.skillId) continue
          const outdated = asset.baseVersion !== entry.version
          if (asset.updateAvailable === outdated) continue
          this.table.set(asset.id, immutable({ ...asset, updateAvailable: outdated })); this.transactions.getStore()!.dirty = true; changed.push(asset.id)
        }
      }
      return changed
    })
  }
  private async installFiles(skillId: string, files: readonly ImportedFile[], options: { readonly id: string; readonly origin: TeamSkillOrigin; readonly version: string; readonly officialSkillId?: string; readonly baseVersion?: string }): Promise<TeamSkillAsset> {
    const checked = buildSkillPackage(files)
    if (!checked.ok) throw new Error(`invalid skill package: ${checked.reason}`)
    return this.install({ ...checked.skill, name: skillId }, options)
  }
  private async manifest(assetId: string, version: string): Promise<TeamSkillAsset | undefined> {
    const path = this.manifestPath(assetId, version)
    await assertNoSymlinks(path)
    let raw: string
    try { raw = await readFile(path, 'utf8') } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
      throw error
    }
    const parsed: unknown = JSON.parse(raw)
    validateAsset(parsed)
    if (parsed.id !== assetId || parsed.version !== version) throw new Error('Team Skill manifest does not match its version')
    return immutable(parsed)
  }

  private freeCopyName(skillId: string, reserved: readonly string[]): string {
    const taken = new Set([...reserved, ...this.list().map(asset => asset.skillId)])
    let suffix = 1
    while (taken.has(`${skillId}-${suffix}`)) suffix += 1
    return `${skillId}-${suffix}`
  }

  /** Keep old binding identities when a previously same-named copy needs its own name. */
  async renameLegacyCopies(reserved: readonly string[]): Promise<void> {
    await this.transaction(async () => {
      const seen = new Set([...reserved, ...this.list().filter(asset => asset.origin !== 'override').map(asset => asset.skillId)])
      for (const asset of this.list()) {
        if (asset.origin !== 'override') continue
        if (seen.has(asset.skillId) || asset.skillId === asset.officialSkillId) {
          const name = this.freeCopyName(asset.officialSkillId ?? asset.skillId, reserved)
          const package_ = renameSkillPackage(await this.readPackage(asset), name)
          await this.install(package_, { ...asset, version: nextVersion() })
          seen.add(name)
        } else {
          seen.add(asset.skillId)
        }
      }
    })
  }

  private async readPackage(asset: TeamSkillAsset): Promise<SkillPackage> {
    const files: ImportedFile[] = []
    for (const file of asset.files) files.push({ path: file.path, bytes: await this.readBytes(asset.id, file.path, asset.version) })
    const checked = buildSkillPackage(files)
    if (!checked.ok) throw new Error(`invalid skill package: ${checked.reason}`)
    return checked.skill
  }

  async createOverride(skillId: string, id?: string, reserved: readonly string[] = []): Promise<TeamSkillAsset> {
    return this.transaction(async () => {
      const existing = id === undefined ? undefined : this.table.get(id)
      if (existing) {
        if (existing.origin === 'override' && existing.officialSkillId === skillId) return existing
        throw new Error('asset identity already belongs to another skill')
      }
      const official = requireAsset(this.table, `builtin:${skillId}`)
      const name = this.freeCopyName(skillId, reserved)
      const package_ = renameSkillPackage(await this.readPackage(official), name)
      return this.install(package_, { id: id ?? `override:${randomUUID()}`, origin: 'override', version: nextVersion(),
        officialSkillId: skillId, baseVersion: official.version, dependencies: official.dependencies })
    })
  }
  async resetOverride(assetId: string): Promise<TeamSkillAsset> {
    return this.transaction(async () => {
      const asset = requireAsset(this.table, assetId)
      if (asset.origin !== 'override' || asset.officialSkillId === undefined) throw new Error('only an override of a shipped Team Skill can be reset')
      const official = requireAsset(this.table, `builtin:${asset.officialSkillId}`)
      const package_ = renameSkillPackage(await this.readPackage(official), asset.skillId)
      return this.install(package_, { ...asset, version: nextVersion(), baseVersion: official.version })
    })
  }
  async verify(assetId: string): Promise<boolean> {
    const asset = this.table.get(assetId)
    if (!asset) return false
    try { for (const file of asset.files) await this.readBytes(assetId, file.path, asset.version); return true } catch { return false }
  }
}
function requireAsset(assets: ReadonlyMap<string, TeamSkillAsset>, assetId: string): TeamSkillAsset {
  const asset = assets.get(assetId)
  if (!asset) throw new Error(`unknown Team Skill asset "${assetId}"`)
  return asset
}
function nextVersion(): string { return `${Date.now()}-${randomUUID()}` }
async function readDirectory(source: string): Promise<ImportedFile[]> {
  const root = canonicalRoot(source)
  await assertNoSymlinks(root)
  const files: ImportedFile[] = []
  const walk = async (relative: string): Promise<void> => {
    const directory = relative === '' ? root : resolveInside(root, relative)
    await assertNoSymlinks(directory)
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = normalizeSkillPath(relative === '' ? entry.name : `${relative}/${entry.name}`)
      const absolute = resolveInside(root, path)
      await assertNoSymlinks(absolute)
      const info = await lstat(absolute)
      if (info.isDirectory()) { await walk(path); continue }
      if (!info.isFile()) throw new Error(`skill contains a non-regular resource: ${path}`)
      checkFolder([...files.map(file => ({ path: file.path, bytes: file.bytes.byteLength })), { path, bytes: info.size }])
      files.push({ path, bytes: new Uint8Array(await readFile(absolute)) })
    }
  }
  await walk('')
  return files.sort((a, b) => a.path.localeCompare(b.path))
}
export async function installFromDirectory(store: TeamSkillStore, source: string, options: { readonly id: string; readonly skillId: string; readonly origin: TeamSkillOrigin; readonly version: string }): Promise<TeamSkillAsset> {
  const checked = buildSkillPackage(await readDirectory(source))
  if (!checked.ok) throw new Error(`invalid skill package: ${checked.reason}`)
  return store.install({ ...checked.skill, name: options.skillId }, options)
}
/** What reading one untrusted folder produced: a legal package or the exact rule that refused it. */
export type SkillFolderInspection =
  | Extract<ReturnType<typeof buildSkillPackage>, { ok: true }>
  | { readonly ok: false; readonly reason: string; readonly path?: string }
/**
 * Validate one external folder without publishing it.
 *
 * The scan reports every refused folder with its own reason, so it must see the
 * same verdict the importer would produce instead of guessing from the name.
 * @param source - absolute folder to read.
 * @returns the package or the refusal code and offending path.
 */
export async function inspectSkillDirectory(source: string): Promise<SkillFolderInspection> {
  try {
    const checked = buildSkillPackage(await readDirectory(source))
    if (checked.ok) return checked
    return { ok: false, reason: checked.reason, ...checked.path === undefined ? {} : { path: checked.path } }
  } catch (error: unknown) {
    if (error instanceof SkillPathError) return { ok: false, reason: error.reason, ...error.path === undefined ? {} : { path: error.path } }
    return { ok: false, reason: 'unreadable' }
  }
}
export async function copyDirectory(from: string, to: string): Promise<void> {
  const files = await readDirectory(from)
  await assertNoSymlinks(to)
  await mkdir(to, { recursive: true })
  for (const file of files) {
    const destination = resolveInside(to, file.path)
    await assertNoSymlinks(destination)
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, file.bytes, { flag: 'wx' })
  }
}
