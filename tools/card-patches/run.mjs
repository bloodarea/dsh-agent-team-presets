/** Child-process helpers shared by the card-patch pipeline stages. */
import { spawn } from 'node:child_process'

/**
 * Run one command to completion and buffer its output.
 *
 * The pipeline stages are all short-lived CLIs (`git`, `pnpm`, `patch`, `tar`),
 * so buffering is simpler than streaming, and the captured text is what a
 * failure message quotes back to the operator. A non-zero exit is thrown, never
 * returned: every stage after a failed command would act on a half-built tree.
 * @param {string} command - executable name, resolved through PATH.
 * @param {readonly string[]} args - arguments passed verbatim.
 * @param {{cwd?: string, timeoutMs?: number, encoding?: 'utf8'|'buffer', env?: Record<string,string>}} [options]
 * @returns {Promise<{code: number, stdout: string|Buffer, stderr: string}>}
 */
export async function runCommand(command, args, options = {}) {
  const { cwd, timeoutMs = 600_000, encoding = 'utf8', env } = options
  return await new Promise((resolve, reject) => {
    const child = spawn(command, [...args], {
      cwd,
      env: env === undefined ? process.env : { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const stdout = []
    const stderr = []
    const timer = timeoutMs > 0
      ? setTimeout(() => {
        child.kill('SIGTERM')
        reject(new Error(`${command} ${args.join(' ')} timed out after ${timeoutMs}ms`))
      }, timeoutMs)
      : undefined
    child.stdout.on('data', chunk => stdout.push(chunk))
    child.stderr.on('data', chunk => stderr.push(chunk))
    child.on('error', (error) => {
      if (timer !== undefined) clearTimeout(timer)
      reject(new Error(`${command} could not start: ${error.message}`))
    })
    child.on('close', (code, signal) => {
      if (timer !== undefined) clearTimeout(timer)
      const errorText = Buffer.concat(stderr).toString('utf8')
      if (code !== 0) {
        const tail = errorText.trim().split('\n').slice(-12).join('\n')
        reject(Object.assign(new Error(`${command} ${args.join(' ')} failed (${signal ?? code}):\n${tail}`), {
          command, args, code, signal, stdout: Buffer.concat(stdout).toString('utf8'), stderr: errorText,
        }))
        return
      }
      const output = Buffer.concat(stdout)
      resolve({
        code: 0,
        stdout: encoding === 'buffer' ? output : output.toString('utf8'),
        stderr: errorText,
      })
    })
  })
}

/** Whether `command` resolves on PATH, used to report a missing prerequisite. */
export async function commandAvailable(command) {
  try {
    await runCommand(command, ['--version'], { timeoutMs: 15_000 })
    return true
  } catch {
    return false
  }
}
