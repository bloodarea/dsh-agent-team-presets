/**
 * The manifest's own host-support declaration.
 *
 * `engines.dsh` is the modern rule: when a plugin declares it, the Host decides
 * loadability from that range ALONE and ignores the DSH `peerDependencies` for
 * this check. Two things therefore have to be true at once, and both are tested
 * here against this repository's real `package.json`:
 *
 * 1. the declared range is satisfied by the runtime this release was verified
 *    on, and refuses the ones it was not; and
 * 2. the declaration did not quietly weaken the peer constraints an older Host
 *    still uses.
 *
 * The rule is exercised through the official implementation vendored in
 * `./fixtures/plugin-compatibility.ts` (the installed checkout predates it),
 * and that vendored copy is checked for agreement with the installed
 * implementation on every case where both define the rule.
 */

import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { evaluatePluginCompatibility } from './fixtures/plugin-compatibility.ts'
import { installedCompatibility, semver } from './fixtures/installed-compatibility.ts'

/** Every DSH peer package this manifest declares, for the fallback cases. */
const DSH_PEERS = ['@deepseek-ai/dsh-agent', '@deepseek-ai/dsh-subagent', '@deepseek-ai/dsh-tools']

/** This repository's manifest, read from disk so the test sees what ships. */
async function manifest(): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as Record<string, unknown>
}

/** The declared `engines.dsh` range. */
async function declaredRange(): Promise<string> {
  const fields = await manifest()
  const engines = fields['engines'] as Record<string, unknown> | undefined
  expect(engines).toBeDefined()
  return String(engines?.['dsh'])
}

describe('declared host support', () => {
  it('states a non-empty engines.dsh range that is not a wildcard', async () => {
    const range = await declaredRange()
    // A range the Host cannot parse fails closed, which is never the intent of
    // a declaration; a wildcard would promise every Host ever shipped.
    expect(semver.validRange(range)).not.toBeNull()
    expect(['', ' ', '*', 'x', 'latest']).not.toContain(range.trim())
  })

  it('is satisfied by the runtime this release was verified on, prerelease included', async () => {
    const fields = await manifest()
    expect(evaluatePluginCompatibility(fields, {}, '0.2.2-rc.2')).toBeUndefined()
  })

  it('refuses what it was not verified on, instead of silently widening the claim', async () => {
    const fields = await manifest()
    const range = await declaredRange()
    for (const runtime of ['0.1.9', '0.2.0-rc.2', '0.2.1-rc.3', '0.2.2-rc.1', '0.3.0', '1.0.0']) {
      expect(evaluatePluginCompatibility(fields, {}, runtime)?.requirements).toEqual({ 'engines.dsh': range })
    }
  })

  it('declares engines.dsh and no engine the plugin never measured', async () => {
    const fields = await manifest()
    const engines = fields['engines'] as Record<string, unknown>
    // A Node range here would be a claim about runtimes this plugin never
    // measured; the declaration stays about the Host.
    expect(Object.keys(engines)).toEqual(['dsh'])
  })

  it('keeps the DSH peer constraints intact for a Host that predates engines.dsh', async () => {
    const fields = await manifest()
    const peers = fields['peerDependencies'] as Record<string, string>
    for (const name of DSH_PEERS) expect(peers[name]).toBeDefined()

    // An older Host ignores `engines.dsh` entirely and checks peers. The peers
    // alone must therefore still ACCEPT the verified runtime, still accept the
    // rest of the supported line, and still REFUSE a runtime outside it —
    // deleting or widening them to offset the engines declaration would be
    // invisible to the modern check but would silently over-promise here.
    const peersOnly = { ...fields }
    delete peersOnly['engines']
    expect(evaluatePluginCompatibility(peersOnly, {}, '0.2.2-rc.2')).toBeUndefined()
    expect(evaluatePluginCompatibility(peersOnly, {}, '0.2.2-rc.1')).toBeDefined()
    expect(evaluatePluginCompatibility(peersOnly, {}, '0.2.1')).toBeDefined()
    expect(evaluatePluginCompatibility(peersOnly, {}, '0.3.0')).toBeDefined()
    expect(evaluatePluginCompatibility(peersOnly, {}, '0.1.9')).toBeDefined()
  })
})

describe('the vendored rule agrees with the installed Host', () => {
  const identity = { name: '@example/plugin', version: '1.0.0' }
  /** Manifests that exercise every branch BOTH implementations define. */
  const shared: ReadonlyArray<{ label: string; manifest: object; runtimes: readonly string[] }> = [
    {
      label: 'no requirements',
      manifest: { ...identity },
      runtimes: ['0.2.0-rc.2', '0.3.0'],
    },
    {
      label: 'satisfied peers',
      manifest: { ...identity, peerDependencies: { '@deepseek-ai/dsh-agent': '>=0.2.0-rc.1 <0.3.0' } },
      runtimes: ['0.2.0-rc.2', '0.3.0'],
    },
    {
      label: 'unsatisfied and malformed peers',
      manifest: {
        ...identity,
        peerDependencies: { '@deepseek-ai/dsh-agent': '^0.3.0', '@deepseek-ai/dsh-subagent': 'broken', '@other/x': '^99' },
      },
      runtimes: ['0.2.0-rc.2'],
    },
  ]

  it.each(shared)('agrees for $label', ({ manifest: fields, runtimes }) => {
    for (const runtime of runtimes) {
      const vendored = evaluatePluginCompatibility(fields, {}, runtime)
      const installed = installedCompatibility(fields, runtime)
      // The installed release reports peer mismatches under `peers`; only the
      // set of unmet requirements is comparable across the two revisions.
      const reported = installed as { requirements?: Record<string, string>; peers?: Record<string, string> } | undefined
      expect(vendored?.requirements ?? {}).toEqual(reported?.requirements ?? reported?.peers ?? {})
    }
  })

  it('agrees on the peer-only projection of this repository\'s own manifest', async () => {
    const fields = await manifest()
    // Both implementations check peers here, because only the modern one reads
    // `engines.dsh`; that projection must therefore agree exactly.
    const peersOnly = { ...fields }
    delete peersOnly['engines']
    expect(evaluatePluginCompatibility(peersOnly, {}, '0.2.2-rc.2')).toBeUndefined()
    expect(installedCompatibility(peersOnly, '0.2.2-rc.2')).toBeUndefined()
  })
})
