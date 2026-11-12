/** Built package smoke tests: loader registration and strict generated wire faces. */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { parseTeamPresetText } from '../src/preset-transfer.ts'

describe('built deliverables', () => {
  it('loads the browser factory with only declared shared dependencies', () => {
    let registration: { id: string; factory: (require: (id: string) => object) => object } | undefined
    runInNewContext(readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8'), {
      window: { __ModuleLoader__: { load: (row: typeof registration) => { registration = row } } },
    })
    expect(registration?.id).toBe('dsh-agent-team-presets')
    const requests: string[] = []
    const exports = registration!.factory(id => {
      requests.push(id)
      if (id === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null, Fragment: Symbol() }
      if (id === 'react') return { createContext: () => ({}) }
      if (id === 'react-dom') return { createPortal: (children: unknown) => children }
      if (id === '@deepseek-ai/dsh-client-store') return { createStore: () => ({}) }
      if (id === '@deepseek-ai/dsh-client-ui-primitives') return {}
      throw new Error(`Undeclared loader import: ${id}`)
    })
    expect(exports).toHaveProperty('apply')
    expect(exports).toHaveProperty('TEAM_PRESETS_NS', 'agent-team-presets')
    expect(requests).not.toContain('zod')
  })
  it('keeps direct catalog and cancellable execution stream companions', async () => {
    // Assert on the imported descriptor rather than the generated text: a
    // bundler may re-quote the same object literal, and quoting is not part of
    // the wire contract. The structural counterpart lives in
    // tests/typert-isolation.spec.ts, which also loads the face without a
    // resolvable `zod`.
    // Host 0.2.1's Remote face is `{ spec, zod, index }`: the descriptors moved
    // under `spec.methods`, keyed by `namespace/method`.
    const remote = await import(new URL('../lib/typert.remote-client.js', import.meta.url).href) as {
      TYPERT_REMOTE: { spec: { package: string; methods: Record<string, Record<string, any>> } }
    }
    const methods = remote.TYPERT_REMOTE.spec.methods
    expect(remote.TYPERT_REMOTE.spec.package).toBe('dsh-agent-team-presets')
    const descriptors = Object.entries(methods).map(([key, value]) => ({ ...value, method: key.slice(key.indexOf('/') + 1) }))
    // The two original endpoints must be present; the Team Skill library adds
    // its own methods beside them.
    expect(Object.keys(methods)).toEqual(expect.arrayContaining(['teamPresets/catalog', 'teamPresets/execution', 'teamSkills/library']))
    expect(descriptors.find(row => row.method === 'catalog')).toMatchObject({
      invocation: { kind: 'direct' },
      parameters: [],
      result: { mode: 'strict' },
    })
    expect(descriptors.find(row => row.method === 'execution')).toMatchObject({
      mode: 'stream',
      invocation: { kind: 'direct' },
      cancellation: { parameter: 'signal' },
      result: { mode: 'strict' },
    })
  })
  it('accepts the shipped full-stack preset as a shareable import', () => {
    const json = readFileSync(new URL('../contrib/default-presets/fullstack-team.json', import.meta.url), 'utf8')
    expect(parseTeamPresetText(json)).toMatchObject({ ok: true, transfer: { team: { name: '全栈软件研发团队' } } })
  })

  it('inlines its private schema code and leaves the Harness peers external', () => {
    // The Host entry must never depend on a bare `zod` resolving from the
    // plugin's own directory: that is the load-time failure the 0.1.4 fix
    // removed, and the durable member domain schema is the newest reason the
    // build has to inline it.
    const host = readFileSync(new URL('../lib/index.js', import.meta.url), 'utf8')
    const specifiers = [...host.matchAll(/(?:from|import\()\s*"([^"]+)"/g)].map(match => match[1]!)
    expect(specifiers).not.toContain('zod')
    expect(specifiers.filter(id => id.startsWith('zod/'))).toEqual([])
    // The member domain form is reached through the `storageDomain` SERVICE, so
    // a deployment that composes no storage still loads this plugin and only
    // refuses member creation.
    expect(specifiers).not.toContain('@deepseek-ai/dsh-storage-domain')
    // Service identities stay borrowed from the Host, never re-bundled.
    for (const peer of ['@deepseek-ai/dsh-agent', '@deepseek-ai/dsh-tools', '@deepseek-ai/dsh-llm', '@deepseek-ai/dsh-system-prompt']) {
      expect(specifiers, peer).toContain(peer)
    }
    // Zod's validator really is present, rather than the guard above passing
    // because the schema was dropped.
    expect(host).toContain('strictObject')
  })
})
