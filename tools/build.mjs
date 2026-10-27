#!/usr/bin/env node
/** Build local sources in an isolated staging workspace. Never emit into Harness. */
import { createRequire, isBuiltin } from 'node:module'
import { isWithinDirectory, mirrorWorkspace, privateCopy, withBuildWorkspace } from './build-utils.mjs'
import { cpSync, readFileSync, writeFileSync, mkdirSync, existsSync, realpathSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, relative, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkout = process.env.DSH_CHECKOUT
if (!checkout || !existsSync(join(checkout, 'tsconfig.base.json'))) throw new Error('Set DSH_CHECKOUT to a dependency-installed compatible Harness checkout.')
const harness = realpathSync(checkout)
const require = createRequire(join(harness, 'package.json'))
const scopedRequire = createRequire(join(harness, 'packages/experimental/agent-team-presets/package.json'))
const ts = require('typescript')
const { build } = await import(pathToFileURL(require.resolve('tsdown')).href)
const { transform } = require('lightningcss')
const zodDir = dirname(scopedRequire.resolve('zod/package.json'))
const yamlDir = dirname(createRequire(join(root, 'package.json')).resolve('yaml/package.json'))
// The staging workspace has no node_modules. Resolve the build-time schema
// dependency explicitly, then inline it in every shipped Typert entrypoint.
const schemaDependency = {
  name: 'team-presets-schema-dependency',
  resolveId(id) {
    if (id === 'zod') return join(zodDir, 'index.js')
    if (id === 'yaml') return join(yamlDir, 'dist/index.js')
  },
}
const { WorkspaceTypertGenerator } = await import(pathToFileURL(join(harness, 'packages/typert/generator/lib/index.js')).href)
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
// The Typert analyzer only accepts a package whose merged protocol interfaces
// have every declaring package inside its workspace root. A standalone staging
// directory therefore cannot satisfy 0.2.1's `TypertResourceMap` merge, so the
// workspace is mirrored instead: the checkout is hardlinked (same filesystem) or
// copied, and this package is written into it at the monorepo-shaped path. No
// existing checkout file is ever modified, because every file this script
// patches is first re-created as a private copy, which breaks the hard link.
const stageRoot = process.env.BUILD_STAGE_ROOT || tmpdir()
await withBuildWorkspace(stageRoot, async (stage) => {
  const pkg = join(stage, 'packages/experimental/agent-team-presets')
  mirrorWorkspace(harness, stage, ['packages', 'vendor', 'node_modules'])
  // The standalone package resolves its private schema dependencies from the
  // staging workspace, which has no node_modules of its own.
  const stagedYaml = join(stage, 'node_modules', 'yaml')
  if (!existsSync(stagedYaml)) cpSync(yamlDir, stagedYaml, { recursive: true })
  for (const name of ['package.json', 'tsconfig.base.json', 'tsconfig.base.client.json']) {
    if (existsSync(join(harness, name))) cpSync(join(harness, name), join(stage, name))
  }
  /** The aggregate faces the analyzer reads: one reference per project, plugins included. */
  for (const face of ['host', 'client']) {
    const source = join(harness, `tsconfig.${face}.json`)
    if (!existsSync(source)) continue
    const target = join(stage, `tsconfig.${face}.json`)
    privateCopy(source, target)
    const text = readFileSync(target, 'utf8')
    // A DIRECTORY reference would resolve to the package's solution tsconfig,
    // which declares no files, and the analyzer would then look for the entry
    // sources in a program that never contained them. Naming the face project
    // file directly is what makes the sources part of the analysis.
    const reference = `{ "path": "./packages/experimental/agent-team-presets/tsconfig.${face}.json" }`
    if (!text.includes('agent-team-presets')) writeFileSync(target, text.replace('"references": [', `"references": [\n    ${reference},`))
  }
  // Replace a mirrored plugin directory before emitting into it.
  rmSync(pkg, { recursive: true, force: true })
  mkdirSync(pkg, { recursive: true })
  const generatedFiles = ['lib/typert.host.js', 'lib/typert.host.d.ts', 'lib/typert.remote-client.js', 'lib/typert.remote-client.d.ts']
  cpSync(join(root, 'src'), join(pkg, 'src'), { recursive: true })
  mkdirSync(join(pkg, 'lib'), { recursive: true })
  // The Typert generator EMITS this face from the Host sources below; the file is
  // only needed while the project is analyzed, because `dsh-agent-team-presets/remote`
  // must resolve for the client sources that import it. An earlier artifact is
  // reused when one exists, and an empty seed is written when it does not, so a
  // checkout with no `lib/` at all still builds. The seed is never read for its
  // declarations: the generated file replaces it before any typecheck runs (both
  // faces are type-checked after the generator returns, and the generated
  // declarations are what the emitted `lib/types` was compiled against).
  const remoteFace = join(pkg, 'lib/typert.remote-client.d.ts')
  const previousFace = join(root, 'lib/typert.remote-client.d.ts')
  if (existsSync(previousFace)) cpSync(previousFace, remoteFace)
  else writeFileSync(remoteFace, 'export {}\n')
  // 0.2.1's generated remote factory imports the protocol's runtime helper. It is
  // inlined from source in every face: a wire face must load in a process that
  // resolves no peers (tests/typert-isolation.spec.ts), and the browser factory
  // may not add an import the shell does not provide.
  const protocolRuntime = {
    name: 'team-presets-protocol-runtime',
    resolveId(id) {
      if (id === '@deepseek-ai/dsh-typert-protocol/remote-info') {
        return join(stage, 'packages/typert/protocol/src/remote-info.ts')
      }
    },
  }
  // Only the exports that resolve to real sources are staged: a host-face pass
  // cannot resolve `./client` (it is `src/client/index.ts`, not `src/client.ts`),
  // and the Client artifact is generated from the same Host contract anyway.
  const stagedManifest = {
    ...manifest,
    exports: {
      '.': manifest.exports['.'],
      './types': manifest.exports['./types'],
      './typert': manifest.exports['./typert'],
      './remote': manifest.exports['./remote'],
      './package.json': manifest.exports['./package.json'],
    },
    files: [...new Set([...manifest.files, ...generatedFiles])],
  }
  writeFileSync(join(pkg, 'package.json'), JSON.stringify(stagedManifest))
  writeFileSync(join(pkg, 'tsconfig.json'), JSON.stringify({ files: [], references: [{ path: './tsconfig.host.json' }, { path: './tsconfig.client.json' }] }))
  const base = ts.readConfigFile(join(harness, 'tsconfig.base.json'), ts.sys.readFile)
  if (base.error) throw new Error(ts.flattenDiagnosticMessageText(base.error.messageText, '\n'))
  const paths = Object.fromEntries(Object.entries(base.config.compilerOptions.paths).map(([key, values]) => [key, values.map(value => resolve(stage, value))]))
  const reactTypes = dirname(scopedRequire.resolve('@types/react/package.json'))
  Object.assign(paths, {
    '@deepseek-ai/dsh-experimental-client-ui-agent-team/client': [join(stage, 'packages/experimental/client-ui-agent-team/src/client/index.ts')],
    'dsh-agent-team-presets/remote': [join(pkg, 'lib/typert.remote-client.d.ts')],
    react: [join(reactTypes, 'index.d.ts')], 'react/*': [join(reactTypes, '*.d.ts')],
    zod: [join(zodDir, 'index.d.ts')],
  })
  const options = { ...base.config.compilerOptions, paths, composite: false, incremental: false, noEmit: false, sourceMap: false, declarationMap: false,
    declaration: true, jsx: 'react-jsx', types: ['node', 'react'], typeRoots: [dirname(reactTypes), join(harness, 'node_modules/@types')], ignoreDeprecations: '6.0' }
  delete options.rootDir; delete options.outDir; delete options.tsBuildInfoFile
  const faceFiles = {}
  for (const face of ['host', 'client']) {
    const config = ts.readConfigFile(join(root, `tsconfig.${face}.json`), ts.sys.readFile).config
    faceFiles[face] = [...new Set([...config.files, ...(face === 'host' ? ['src/tool-policy.ts'] : [])])]
    writeFileSync(join(pkg, `tsconfig.${face}.json`), JSON.stringify({ compilerOptions: options, files: faceFiles[face] }))
  }
  const artifacts = new WorkspaceTypertGenerator(stage, { checkDiagnostics: false }).generate([manifest.name], ['host'])
  const host = artifacts.find(row => row.face === 'host' && row.package === manifest.name)
  if (!host?.remote || !/mode:\s*['"]stream['"]/.test(host.remote.js) || !/teamPresets\/catalog|['"]catalog['"]/.test(host.remote.js) || !/teamPresets\/execution|['"]execution['"]/.test(host.remote.js)) throw new Error(`Generator did not produce expected contracts: ${JSON.stringify(artifacts.map(row => ({ package: row.package, face: row.face, remote: row.remote?.js })))}`)
  for (const [name, text] of [['typert.host.js', host.js], ['typert.host.d.ts', host.dts], ['typert.remote-client.js', host.remote.js], ['typert.remote-client.d.ts', host.remote.dts]]) writeFileSync(join(pkg, 'lib', name), text)
  for (const face of ['host', 'client']) {
    const parsed = ts.parseJsonConfigFileContent({ compilerOptions: options, files: faceFiles[face] }, ts.sys, pkg)
    const program = ts.createProgram(parsed.fileNames, parsed.options)
    const diagnostics = ts.getPreEmitDiagnostics(program)
    const local = diagnostics.filter(row => !row.file || isWithinDirectory(pkg, row.file.fileName))
    if (local.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(local, { getCanonicalFileName: n => n, getCurrentDirectory: () => pkg, getNewLine: () => '\n' }))
    console.log(`${face}: zero local diagnostics; ${diagnostics.length - local.length} checkout dependency diagnostics excluded`)
    for (const source of program.getSourceFiles()) {
      if (source.isDeclarationFile || !isWithinDirectory(join(pkg, 'src'), source.fileName)) continue
      const stem = relative(join(pkg, 'src'), source.fileName).replace(/\.(?:tsx?|mts|cts)$/, '')
      const result = program.emit(source, (name, text, _bom, _error, sources) => {
        if (!sources?.length || sources.some(row => !isWithinDirectory(join(pkg, 'src'), row.fileName))) throw new Error('Refused nonlocal declaration emit')
        const extension = name.endsWith('.d.ts') ? '.d.ts' : name.endsWith('.js') ? '.js' : undefined
        if (!extension) throw new Error(`Unexpected emitted artifact: ${name}`)
        const target = resolve(pkg, 'lib/types', stem + extension)
        if (!target.startsWith(join(pkg, 'lib/types') + sep)) throw new Error('Refused escaping emit path')
        mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, text)
      })
      if (result.emitSkipped || result.diagnostics.length) throw new Error(`Emit failed: ${source.fileName}`)
    }
  }
  for (const entry of ['index.js', 'client/index.js']) {
    if (!existsSync(join(pkg, 'lib/types', entry))) throw new Error('TypeScript did not emit required local entry: ' + entry)
  }
  // Harness peers must retain the Host's service identities. Private schema
  // code, unlike those peers, must not depend on a file-linked source checkout
  // having its own node_modules (Node resolves from the link's real path).
  const production = new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {}), ...Object.keys(manifest.optionalDependencies ?? {})].filter(name => name !== 'zod'))
  const prod = id => [...production].some(name => id === name || id.startsWith(name + '/'))
  const common = { config: false, workspace: false, cwd: pkg, outDir: join(pkg, 'lib'), target: 'es2024', fixedExtension: false, dts: false, clean: false, tsconfig: false }
  await build({ ...common, entry: { index: join(pkg, 'lib/types/index.js') }, format: 'esm', platform: 'node', deps: { neverBundle: prod, alwaysBundle: id => !isBuiltin(id) && !prod(id) }, plugins: [schemaDependency] })
  // The Typert loader imports ./typert before plugin activation. Bundle both
  // generated wire faces, not just the browser factory; never weaken or remove
  // their strict schemas to work around a missing runtime dependency.
  for (const face of ['host', 'remote-client']) {
    const entry = `typert.${face}`
    await build({ ...common, entry: { [entry]: join(pkg, 'lib', entry + '.js') }, format: 'esm', platform: 'neutral', deps: { neverBundle: id => isBuiltin(id), alwaysBundle: id => !isBuiltin(id) }, plugins: [schemaDependency, protocolRuntime] })
  }
  writeFileSync(join(pkg, 'lib/THIRD-PARTY-NOTICES.txt'), `Bundled dependency: zod\n\n${readFileSync(join(zodDir, 'LICENSE'), 'utf8')}\n\nBundled dependency: yaml\n\n${readFileSync(join(yamlDir, 'LICENSE'), 'utf8')}`)
  const external = new Set(['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', '@deepseek-ai/cordis', '@deepseek-ai/dsh-client-ui-primitives', '@deepseek-ai/dsh-client-store'])
  // 0.2.1's generated remote factory imports the protocol's runtime helper. It is
  // bundled from source rather than left external: a wire face must load in a
  // process that resolves no peers (see tests/typert-isolation.spec.ts), and the
  // browser factory may not add an import the shell does not provide.
  const protocolSource = join(stage, 'packages/typert/protocol/src/remote-info.ts')
  const clientPlugin = {
    name: 'team-presets-client-surface',
    resolveId(id, importer) {
      if (external.has(id)) return { id, external: true }
      if (id === manifest.name + '/remote') return join(pkg, 'lib/typert.remote-client.js')
      if (id === 'zod') return join(zodDir, 'index.js')
      if (id === '@deepseek-ai/dsh-typert-protocol/remote-info') return protocolSource
      if (id.endsWith('.module.css') && importer) return '\0team-css:' + resolve(pkg, 'src', relative(join(pkg, 'lib/types'), dirname(importer)), id) + '.mjs'
      if (id.startsWith('@deepseek-ai/')) throw new Error(`Undeclared Client value import: ${id}`)
    },
    load(id) {
      if (!id.startsWith('\0team-css:')) return
      const path = id.slice('\0team-css:'.length, -4)
      this.addWatchFile(path)
      const css = transform({ filename: relative(pkg, path).split(sep).join('/'), code: readFileSync(path), cssModules: { pattern: '[hash]_[local]' }, minify: true })
      // Lightning CSS returns its export map in hash order, which changes from
      // run to run. Sort it so two builds of the same source are byte-identical.
      const classes = Object.fromEntries(Object.entries(css.exports ?? {})
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([name, value]) => [name, value.name]))
      const key = manifest.name + ':' + relative(join(pkg, 'src'), path).split(sep).join('/')
      return `const key=${JSON.stringify(key)};if(typeof document!=='undefined'&&!document.querySelector('style[data-team-presets-style="'+key+'"]')){const style=document.createElement('style');style.dataset.teamPresetsStyle=key;style.textContent=${JSON.stringify(css.code.toString())};document.head.appendChild(style);}export default ${JSON.stringify(classes)};`
    },
  }
  await build({ ...common, entry: { client: join(pkg, 'lib/types/client/index.js') }, format: 'cjs', platform: 'browser', deps: { neverBundle: id => external.has(id), alwaysBundle: id => !external.has(id) }, define: { 'process.env.NODE_ENV': '"production"' }, plugins: [clientPlugin], outputOptions: { entryFileNames: 'client.js', chunkFileNames: 'client.[name].js', banner: `window.__ModuleLoader__.load({id:${JSON.stringify(manifest.name)},factory:(require)=>{`, intro: 'var module = { exports: {} }; var exports = module.exports;', footer: 'return module.exports; }});' } })
  // Publish only verified stage artifacts, preserving unrelated existing files.
  const outputs = []
  const visit = dir => { for (const row of readdirSync(dir, { withFileTypes: true })) { const path = join(dir, row.name); if (row.isDirectory()) visit(path); else if (!/\.(?:map|tsbuildinfo)$/.test(path)) outputs.push(path) } }
  visit(join(pkg, 'lib'))
  for (const path of outputs) {
    const destination = resolve(root, 'lib', relative(join(pkg, 'lib'), path))
    if (!destination.startsWith(join(root, 'lib') + sep)) throw new Error('Refused escaping artifact destination')
    mkdirSync(dirname(destination), { recursive: true })
    const bytes = readFileSync(path)
    let text
    if (path.endsWith('.js')) {
      // Build-path comments would publish the machine that produced them.
      text = bytes.toString('utf8').replace(/^\s*\/\/#region .*$/gm, '').replace(/^\s*\/\/#endregion.*$/gm, '')
    } else if (path.endsWith('.d.ts')) {
      // The declaration emitter leaves a trailing space after a union split over
      // lines. Trailing whitespace is never meaningful in a declaration, so it is
      // normalized here rather than hand-edited into a regenerated file.
      text = bytes.toString('utf8').replace(/[ \t]+$/gm, '')
    }
    writeFileSync(destination, text ?? bytes)
  }
  console.log(`Built ${outputs.length} local artifacts; Host SHA256 ${createHash('sha256').update(readFileSync(join(root, 'lib/index.js'))).digest('hex')}`)
}, process.env.DSH_BUILD_KEEP === '1')
