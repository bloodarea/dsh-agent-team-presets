/** Resolve npm's JavaScript CLI and run it through Node, including on Windows. */
import { execFileSync } from 'node:child_process'
import { existsSync, realpathSync } from 'node:fs'
import { delimiter, dirname, join, basename } from 'node:path'

/** Locate the same npm installation exposed by the caller or PATH, without a shell. */
function npmCli(): string {
  const explicit = process.env['npm_execpath']
  if (explicit && basename(explicit) === 'npm-cli.js' && existsSync(explicit)) return explicit
  const directories = [dirname(process.execPath), ...(process.env['PATH'] ?? '').split(delimiter)]
  for (const directory of directories) {
    if (!directory) continue
    for (const candidate of [join(directory, 'node_modules/npm/bin/npm-cli.js'), join(directory, '../lib/node_modules/npm/bin/npm-cli.js')]) {
      if (existsSync(candidate)) return realpathSync(candidate)
    }
    const launcher = join(directory, 'npm')
    try {
      const resolved = realpathSync(launcher)
      if (basename(resolved) === 'npm-cli.js') return resolved
    } catch (error) {
      // An absent PATH entry is not an npm installation.
      if (!['ENOENT', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error
    }
  }
  throw new Error('npm CLI is required for the package-content tests; add its installation directory to PATH.')
}

/** Run real npm with argument boundaries preserved, including paths containing spaces. */
export function runNpm(args: readonly string[], cwd: string): string {
  return execFileSync(process.execPath, [npmCli(), ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}
