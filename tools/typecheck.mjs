#!/usr/bin/env node
/** Read-only diagnostics against the explicit checkout; never emit into dependencies. */
import { createRequire } from 'node:module'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { isWithinDirectory } from './build-utils.mjs'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkout = process.env.DSH_CHECKOUT
if (!checkout || !existsSync(join(checkout, 'tsconfig.base.json'))) throw new Error('Set DSH_CHECKOUT to a dependency-installed compatible Harness checkout.')
const harness = resolve(checkout)
const require = createRequire(join(harness, 'package.json'))
const ts = require('typescript')
const clientRequire = createRequire(join(harness, 'packages/experimental/agent-team-presets/package.json'))
const reactTypes = dirname(clientRequire.resolve('@types/react/package.json'))
const base = ts.readConfigFile(join(harness, 'tsconfig.base.json'), ts.sys.readFile)
const paths = Object.fromEntries(Object.entries(base.config.compilerOptions.paths).map(([key, values]) => [key, values.map(value => resolve(harness, value))]))
paths['@deepseek-ai/dsh-experimental-client-ui-agent-team/client'] = [join(harness, 'packages/experimental/client-ui-agent-team/src/client/index.ts')]
paths['react'] = [join(reactTypes, 'index.d.ts')]
paths['react/*'] = [join(reactTypes, '*.d.ts')]
paths['dsh-agent-team-presets/remote'] = [join(root, 'lib/typert.remote-client.d.ts')]
for (const face of ['host', 'client']) {
  const config = ts.readConfigFile(join(root, `tsconfig.${face}.json`), ts.sys.readFile).config
  const parsed = ts.parseJsonConfigFileContent({ compilerOptions: {
    ...base.config.compilerOptions, paths, composite: false, incremental: false, noEmit: true,
    rootDir: harness, jsx: 'react-jsx',
    types: face === 'host' ? ['node'] : ['node', 'react'],
    typeRoots: [dirname(reactTypes), join(harness, 'node_modules/@types')],
    ignoreDeprecations: '6.0',
  }, files: [...config.files, ...(face === 'host' ? ['src/tool-policy.ts'] : [])] }, ts.sys, root)
  delete parsed.options.rootDir
  const program = ts.createProgram(parsed.fileNames, parsed.options)
  const diagnostics = ts.getPreEmitDiagnostics(program)
  const ours = diagnostics.filter(row => row.file === undefined || isWithinDirectory(root, row.file.fileName))
  if (ours.length) {
    console.error(ts.formatDiagnosticsWithColorAndContext(ours, { getCanonicalFileName: name => name, getCurrentDirectory: () => root, getNewLine: () => '\n' }))
    process.exitCode = 1
  }
  console.log(`${face}: ${ours.length} local diagnostics (${diagnostics.length - ours.length} checkout dependency diagnostics excluded)`)
}
