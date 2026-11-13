/**
 * Applying a source patch to an upstream checkout.
 *
 * Three strategies, strongest first, because each tolerates a different amount
 * of upstream movement:
 *
 * 1. `git apply` — the patch was generated against this exact source; context
 *    and line numbers match.
 * 2. `git apply --3way` — context moved, but the touched blobs still resolve to
 *    the recorded pre-image, so git can merge the change back in.
 * 3. `patch --fuzz=3` — context lines drifted only slightly. This is the only
 *    strategy that can apply a hunk in the wrong place, which is exactly why the
 *    pipeline verifies source markers afterwards instead of trusting the exit
 *    code, and why the chosen strategy is reported.
 *
 * All three are dry-run first: a partially applied patch on a checkout is worse
 * than no patch, because the build that follows would produce an artifact whose
 * provenance nobody can state.
 */
import { resolve } from 'node:path'
import { runCommand } from './run.mjs'

/**
 * Apply one patch file, reporting which strategy succeeded.
 * @param {{directory: string, patchFile: string, allowFuzz?: boolean, run?: typeof runCommand}} options
 * @returns {Promise<{strategy: 'git'|'three-way'|'fuzz', warnings: string[]}>}
 */
export async function applySourcePatch({ directory, patchFile, allowFuzz = true, run = runCommand }) {
  const patch = resolve(patchFile)
  const attempts = []
  const attempt = async (label, argv) => {
    try {
      await run('git', ['-C', directory, 'apply', '--check', ...argv, patch], { timeoutMs: 120_000 })
      return { label, argv }
    } catch (error) {
      attempts.push(`${label}: ${firstLine(error)}`)
      return undefined
    }
  }

  const git = await attempt('git apply', [])
  if (git !== undefined) {
    await run('git', ['-C', directory, 'apply', ...git.argv, patch], { timeoutMs: 120_000 })
    return { strategy: 'git', warnings: [] }
  }

  // `--3way` needs the blob objects the patch names; the clone has them because
  // it is a full history clone with a blob filter that fetches on demand.
  const threeWay = await attempt('git apply --3way', ['--3way'])
  if (threeWay !== undefined) {
    await run('git', ['-C', directory, 'apply', ...threeWay.argv, patch], { timeoutMs: 120_000 })
    return {
      strategy: 'three-way',
      warnings: ['the patch was merged rather than applied verbatim; the rebuilt source was verified by markers'],
    }
  }

  if (allowFuzz) {
    try {
      await run('patch', ['-p1', '--batch', '--forward', '--fuzz=3', '--dry-run', '--input', patch], {
        cwd: directory, timeoutMs: 120_000,
      })
      await run('patch', ['-p1', '--batch', '--forward', '--fuzz=3', '--input', patch], { cwd: directory, timeoutMs: 120_000 })
      return {
        strategy: 'fuzz',
        warnings: ['the patch applied with context fuzz, which can land a hunk in the wrong place; review the rebuilt source'],
      }
    } catch (error) {
      attempts.push(`patch --fuzz=3: ${firstLine(error)}`)
    }
  }

  throw new Error([
    `the source patch does not apply to this checkout: ${patch}`,
    'adapt the patch to the new upstream source and re-run; nothing was built',
    ...attempts.map(line => `  - ${line}`),
  ].join('\n'))
}

/**
 * The first line of a failure, which is the part that names the file.
 * @param {unknown} error - a rejected command.
 * @returns {string} one line.
 */
function firstLine(error) {
  const text = error instanceof Error ? error.message : String(error)
  return text.split('\n').map(line => line.trim()).filter(line => line !== '')[0] ?? 'failed'
}
