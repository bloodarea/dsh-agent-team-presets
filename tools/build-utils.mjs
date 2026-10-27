/** Filesystem operations shared by the isolated build and local diagnostics. */
import { copyFileSync, constants, existsSync, linkSync, lstatSync, mkdirSync, mkdtempSync, realpathSync, readdirSync, readFileSync, readlinkSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

/** Accept native or TypeScript-normalized filenames, excluding prefix siblings. */
export function isWithinDirectory(directory, file) {
  const suffix = relative(directory, file)
  return suffix !== '' && suffix !== '..' && !suffix.startsWith('..' + sep) && !isAbsolute(suffix)
}

/** Recreate a file before writing so a mirrored hard link never mutates the checkout. */
export function privateCopy(from, to) {
  const bytes = readFileSync(from)
  rmSync(to, { force: true })
  writeFileSync(to, bytes)
}

/** Mirror directories with relocated directory links and portable copies of file links. */
export function mirrorWorkspace(sourceRoot, stageRoot, entries) {
  const source = realpathSync(sourceRoot)
  const stage = existsSync(stageRoot) ? realpathSync(stageRoot) : resolve(realpathSync(dirname(resolve(stageRoot))), basename(stageRoot))
  if (source === stage || isWithinDirectory(source, stage) || isWithinDirectory(stage, source)) throw new Error('Build mirror roots must be separate')
  function visit(from, to) {
    const info = lstatSync(from)
    if (info.isSymbolicLink()) {
      const original = resolve(dirname(from), readlinkSync(from))
      const target = isWithinDirectory(source, original) || original === source ? resolve(stage, relative(source, original)) : original
      const referent = statSync(from, { throwIfNoEntry: false })
      if (!referent) throw new Error('Broken build input link: ' + from)
      if (!referent.isDirectory()) {
        copyFileSync(from, to, constants.COPYFILE_FICLONE | constants.COPYFILE_EXCL)
        return
      }
      const type = process.platform === 'win32' ? 'junction' : 'dir'
      symlinkSync(type === 'junction' ? target : relative(dirname(to), target), to, type)
    } else if (info.isDirectory()) {
      mkdirSync(to, { recursive: true })
      for (const name of readdirSync(from)) visit(join(from, name), join(to, name))
    } else if (info.isFile()) {
      try { linkSync(from, to) } catch (linkError) {
        try { copyFileSync(from, to, constants.COPYFILE_FICLONE | constants.COPYFILE_EXCL) } catch (copyError) {
          throw new AggregateError([linkError, copyError], 'Could not mirror build input: ' + from)
        }
      }
    } else throw new Error('Unsupported build input: ' + from)
  }
  for (const entry of entries) {
    if (!isWithinDirectory(source, resolve(source, entry)) || !isWithinDirectory(stage, resolve(stage, entry))) throw new Error('Build mirror entry escapes its root: ' + entry)
    if (existsSync(join(source, entry))) visit(join(source, entry), join(stage, entry))
  }
}

/** Own staging creation and cleanup, including setup failures and aliased temporary roots. */
export async function withBuildWorkspace(parent, action, keep = false) {
  const physicalParent = realpathSync(resolve(parent))
  const stage = mkdtempSync(join(physicalParent, 'team-presets-build-'))
  console.log('Isolated build workspace: ' + stage)
  let failure
  try { return await action(stage) } catch (error) { failure = { error }; throw error }
  finally {
    if (keep) console.log('Kept build workspace at ' + stage)
    else if (existsSync(stage)) {
      try {
        const info = lstatSync(stage)
        if (info.isSymbolicLink() || !info.isDirectory() || dirname(realpathSync(stage)) !== physicalParent || !basename(stage).startsWith('team-presets-build-')) throw new Error('Refused unsafe staging cleanup: ' + stage)
        rmSync(stage, { recursive: true, force: true })
      } catch (cleanupError) {
        if (failure) throw new AggregateError([failure.error, cleanupError], 'Build failed and staging cleanup also failed')
        throw cleanupError
      }
    }
  }
}
