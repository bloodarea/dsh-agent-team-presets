#!/usr/bin/env node
/**
 * Sync this publishing repository from the DeepSeek Harness monorepo working
 * copy, which is where the plugin is developed.
 *
 * The monorepo copy is a workspace member: it resolves its dependencies through
 * `workspace:*` links and builds with the checkout's shared client-bundle
 * preset. This repository is the community package: it carries a standalone
 * name, version, repository metadata, and published version ranges.
 *
 * The workspace copy cannot carry the community name itself. That checkout pairs
 * a package under `packages/experimental/` with an `@deepseek-ai/dsh-experimental-`
 * name at build time: `packages/client/tsdown.client.ts` decides whether a client
 * bundle may inline experimental inputs from the bundle id alone, and the id has
 * to equal the package name because it becomes the `/plugins/<id>/client.js`
 * resource. A community-named package in that directory is rejected as an
 * experimental input to its own bundle. The rename therefore lives here.
 *
 * Everything except that identity is copied verbatim, so the two copies cannot
 * drift in behavior. Files that exist only here (LICENSE, locale/, .gitignore,
 * DEVELOPMENT.md, tools/) are never touched.
 *
 * Usage:
 *   node tools/sync-from-monorepo.mjs [--check]
 *
 * Source checkout resolution, in order:
 *   1. --source <path>
 *   2. DSH_AGENT_TEAM_PRESETS_SOURCE
 *   3. ~/deepseek-harness-master/packages/experimental/agent-team-presets
 *
 * @module dsh-agent-team-presets/tools/sync-from-monorepo
 */

import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** The workspace name the plugin carries inside the monorepo checkout. */
const WORKSPACE_NAME = '@deepseek-ai/dsh-experimental-agent-team-presets'

/** The published name this repository ships under. */
const PACKAGE_NAME = 'dsh-agent-team-presets'

/**
 * Files and directories copied from the monorepo on every sync.
 *
 * `README.i18n.yaml` is deliberately absent: it is the monorepo's bilingual
 * pairing ledger and its keys name the workspace package.
 */
const SYNCED = [
  'src',
  'tests',
  'lib',
  'locale',
  'docs',
  'cordis.patch.yml',
  'tsconfig.json',
  'tsconfig.host.json',
  'tsconfig.client.json',
  'tsdown.config.ts',
  'README.md',
  'README.zh.md',
]

/**
 * Build outputs dropped from the published `lib/`.
 *
 * Source maps would be stale: this tool rewrites the package name in the
 * generated JavaScript, which shifts columns on the affected lines, and a map
 * still describing the workspace name is worse than none. `tsbuildinfo` is
 * incremental-build state with no publication meaning. The community plugins
 * that ship a built `lib/` ship no maps either.
 */
const LIB_EXCLUDED = /\.(?:map|tsbuildinfo)$/

/**
 * Publication surface added to each README here, keyed by file name.
 *
 * The workspace READMEs are written for the monorepo: they open with doc-gate
 * front matter, carry no publication status, and name no repository banner.
 * This repository adds those three things and leaves the rest of the prose to
 * the workspace copy.
 */
const README_PUBLICATION = {
  'README.md': {
    anchor: 'English | [中文](README.zh.md)',
    banner: 'banner.png',
    bannerAlt: 'Reusable Agent Team presets for DeepSeek Harness',
    status: [
      '> **Status: community plugin.** Install it with',
      '> `dsh plugin add github:bloodarea/dsh-agent-team-presets`; it needs a DeepSeek',
      '> Harness on the `0.2.0-rc` line or later, which the plugin manager enforces from',
      '> the declared peers. `lib/` ships prebuilt, so installing builds nothing, but',
      '> *changing* the source needs a DeepSeek Harness checkout — see',
      '> [DEVELOPMENT.md](DEVELOPMENT.md) and [CHANGELOG.md](CHANGELOG.md).',
    ].join('\n'),
  },
  'README.zh.md': {
    anchor: '[English](README.md) | 中文',
    banner: 'banner_zh.png',
    bannerAlt: '为 DeepSeek Harness 配置可复用的智能体团队预设',
    status: [
      '> **状态：社区插件。** 安装：`dsh plugin add github:bloodarea/dsh-agent-team-presets`；',
      '> 需要 DeepSeek Harness 运行在 `0.2.0-rc` 线或更高版本，插件管理器会按声明的 peer 强制校验。',
      '> `lib/` 已预构建，安装时无需构建；但**修改源码**需要 DSH 源码检出目录 —— 见',
      '> [DEVELOPMENT.md](DEVELOPMENT.md) 与 [CHANGELOG.md](CHANGELOG.md)。',
    ].join('\n'),
  },
}

/** Published dependency ranges keyed by exact workspace package name. */
const DEPENDENCY_RANGES = {
  '@deepseek-ai/cordis': '>=4.0.4 <5.0.0',
  '@deepseek-ai/cordis-plugin-loader': '>=4.0.4 <5.0.0',
  '@deepseek-ai/schemastery': '>=3.18.4 <4.0.0',
}

/** Range every other DSH workspace package is published under. */
const DSH_RANGE = '>=0.2.0-rc.1 <0.3.0'

/** Manifest fields this repository owns rather than inheriting. */
const REPO_OWNED_FIELDS = ['version', 'description', 'repository', 'publishConfig', 'files']

/**
 * Development dependencies this repository adds on top of the workspace ones.
 *
 * The workspace resolves its build and test tools from the checkout root, so
 * they never appear in the package manifest. A standalone checkout needs them
 * declared here.
 */
const REPO_EXTRA_DEV_DEPENDENCIES = {
  tsdown: '^0.22.2',
  typescript: '^5.6.0',
  vitest: '^4.1.8',
}

const check = process.argv.includes('--check')
const sourceArgument = process.argv.indexOf('--source')
const sourceRoot = sourceArgument === -1
  ? (process.env.DSH_AGENT_TEAM_PRESETS_SOURCE
    ?? join(process.env.HOME ?? '', 'deepseek-harness-master', 'packages', 'experimental', 'agent-team-presets'))
  : resolve(process.argv[sourceArgument + 1] ?? '')

/**
 * Fail with one actionable line.
 * @param message - what is wrong.
 * @returns never.
 */
function fail(message) {
  console.error(`sync: ${message}`)
  process.exit(1)
}

if (!existsSync(sourceRoot) || !statSync(sourceRoot).isDirectory()) {
  fail(`source checkout not found: ${sourceRoot}\n`
    + '       pass --source <path> or set DSH_AGENT_TEAM_PRESETS_SOURCE')
}
if (!existsSync(join(sourceRoot, 'package.json'))) {
  fail(`${sourceRoot} is not the plugin package (no package.json)`)
}

/** One file written by this run, for the final report. */
const written = []

/**
 * Record and (unless checking) write one repository file.
 * @param path - absolute destination path.
 * @param content - complete file content.
 */
function emit(path, content) {
  written.push(path.slice(REPO_ROOT.length + 1))
  if (!check) writeFileSync(path, content)
}

/**
 * Copy one path from the source checkout, replacing the destination.
 * @param relative - repository-relative path to copy.
 */
function copyFromSource(relative) {
  const from = join(sourceRoot, relative)
  if (!existsSync(from)) fail(`source is missing ${relative}`)
  const to = join(REPO_ROOT, relative)
  if (!check) {
    rmSync(to, { recursive: true, force: true })
    mkdirSync(dirname(to), { recursive: true })
    cpSync(from, to, {
      recursive: true,
      ...relative === 'lib' ? { filter: (source) => !LIB_EXCLUDED.test(source) } : {},
    })
  }
  written.push(relative)
}

/** Every text extension whose contents name the workspace package. */
const TEXT_EXTENSIONS = ['.ts', '.tsx', '.js', '.json', '.yml', '.yaml', '.md']

/**
 * Rewrite the workspace package name to the published name in one copied file.
 *
 * Both spellings are replaced: the scoped npm specifier and the slug the
 * monorepo's documentation tooling derives from it. The official
 * `@deepseek-ai/dsh-experimental-agent-team` packages share a prefix but not the
 * `-presets` suffix, so they are never touched.
 * @param path - absolute path of a copied text file.
 */
function renamePackageReferences(path) {
  if (!TEXT_EXTENSIONS.some(extension => path.endsWith(extension))) return
  const original = readFileSync(path, 'utf8')
  const renamed = original
    .replaceAll(WORKSPACE_NAME, PACKAGE_NAME)
    .replaceAll(WORKSPACE_NAME.replace('@deepseek-ai/', '').replaceAll('/', '-'), PACKAGE_NAME)
  if (renamed !== original) emit(path, renamed)
}

/**
 * Turn every `workspace:` dependency range into the range this repository
 * publishes against.
 * @param sections - the manifest's dependency sections.
 */
function publishRanges(sections) {
  for (const section of sections) {
    for (const [name, range] of Object.entries(section)) {
      if (typeof range !== 'string' || !range.startsWith('workspace:')) continue
      section[name] = DEPENDENCY_RANGES[name] ?? (name.startsWith('@deepseek-ai/dsh-') ? DSH_RANGE : range)
    }
  }
}

/**
 * Build this repository's manifest from the workspace manifest.
 *
 * The workspace manifest is authoritative for dependencies, scripts, exports,
 * and the `dsh` composition block. This repository owns its identity fields and
 * the publication surface, so those are preserved across the sync.
 * @param workspace - parsed workspace manifest.
 * @param current - parsed manifest already in this repository, or undefined.
 * @returns the manifest to write.
 */
function publishedManifest(workspace, current) {
  const manifest = structuredClone(workspace)
  manifest.name = PACKAGE_NAME
  // The workspace copy is a private local development package; this repository
  // is the publishable one.
  delete manifest.private
  for (const field of REPO_OWNED_FIELDS) {
    if (current?.[field] !== undefined) manifest[field] = current[field]
  }
  publishRanges([manifest.peerDependencies ?? {}, manifest.devDependencies ?? {}])
  manifest.devDependencies = { ...manifest.devDependencies, ...REPO_EXTRA_DEV_DEPENDENCIES }
  // The plugin list reads `locale/<lang>.json` through this export.
  manifest.exports = { ...manifest.exports, './locale/*.json': './locale/*.json' }
  return manifest
}

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

for (const relative of SYNCED) copyFromSource(relative)

/** Directories that need a recursive pass for package-name references. */
const renameRoots = SYNCED.filter(relative => relative === 'src' || relative === 'tests' || relative === 'lib')
  .map(relative => join(REPO_ROOT, relative))

const { readdirSync } = await import('node:fs')

/**
 * Turn one copied build artifact into this repository's published artifact.
 *
 * Two transforms. The trailing `sourceMappingURL` comment goes, because the maps
 * are not published and the reference would only 404 in a browser. The
 * workspace's absolute path prefix goes too: the client bundle records it in the
 * `#region` comments it emits for CSS modules, and a published artifact should
 * not name the machine that built it.
 * @param path - absolute path of one copied artifact file.
 */
function publishArtifact(path) {
  if (!path.endsWith('.js')) return
  const original = readFileSync(path, 'utf8')
  const published = original
    .replaceAll(`${sourceRoot}/`, '')
    .replace(/\n?\/\/# sourceMappingURL=.*\n?$/u, '\n')
  if (published !== original) emit(path, published)
}

/**
 * Walk one directory, applying {@link renamePackageReferences} to every file.
 * @param directory - absolute directory to walk.
 * @param publishBuild - whether JavaScript files also lose their map reference and build paths.
 */
function walk(directory, publishBuild = false) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) walk(path, publishBuild)
    else {
      renamePackageReferences(path)
      if (publishBuild) publishArtifact(path)
    }
  }
}

for (const root of renameRoots) walk(root, root === join(REPO_ROOT, 'lib'))
for (const relative of ['cordis.patch.yml', 'tsdown.config.ts']) {
  renamePackageReferences(join(REPO_ROOT, relative))
}

// The workspace manifest names the package in its own file; the published
// manifest is rebuilt from it rather than renamed.
const workspaceManifest = JSON.parse(readFileSync(join(sourceRoot, 'package.json'), 'utf8'))
const manifestPath = join(REPO_ROOT, 'package.json')
const currentManifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : undefined
emit(manifestPath, `${JSON.stringify(publishedManifest(workspaceManifest, currentManifest), null, 2)}\n`)

/**
 * Turn one copied workspace README into this repository's published README.
 *
 * Four transforms, all mechanical: the workspace package name becomes the
 * published name, the doc-gate YAML front matter is dropped, the repository
 * banner is inserted under the title, and the publication status is inserted
 * under the language switcher. Every other paragraph stays exactly as the
 * workspace wrote it.
 * @param relative - README file name, also its {@link README_PUBLICATION} key.
 */
function publishReadme(relative) {
  const path = join(REPO_ROOT, relative)
  const { anchor, banner, bannerAlt, status } = README_PUBLICATION[relative]
  let text = readFileSync(path, 'utf8')
    .replaceAll(WORKSPACE_NAME, PACKAGE_NAME)
    .replaceAll(WORKSPACE_NAME.replace('@deepseek-ai/', '').replaceAll('/', '-'), PACKAGE_NAME)
  // A leading `---` block is the monorepo's doc-gate metadata, not content.
  if (text.startsWith('---\n')) {
    const end = text.indexOf('\n---\n', 3)
    if (end === -1) fail(`${relative} opens with front matter that is never closed`)
    text = text.slice(end + '\n---\n'.length).replace(/^\n+/, '')
  }
  // GitHub scales a raw <img> to the container, which keeps a 3:1 banner from
  // overflowing a narrow file view the way a bare Markdown image can.
  const title = /^# .+$/mu.exec(text)
  if (title === null) fail(`${relative} has no level-one title to place the banner under`)
  const afterTitle = title.index + title[0].length
  text = `${text.slice(0, afterTitle)}\n\n<img src="${banner}" alt="${bannerAlt}" width="100%">${text.slice(afterTitle).replace(/^\n+/, '\n\n')}`
  const at = text.indexOf(anchor)
  if (at === -1) fail(`${relative} has no language switcher line (${anchor})`)
  const after = at + anchor.length
  // Exactly one blank line on each side of the status block, whatever the
  // workspace README had there.
  text = `${text.slice(0, after)}\n\n${status}${text.slice(after).replace(/^\n+/, '\n\n')}`
  emit(path, text)
}

for (const readme of Object.keys(README_PUBLICATION)) {
  if (!existsSync(join(REPO_ROOT, readme))) fail(`this repository is missing ${readme}`)
  publishReadme(readme)
}

// A stale monorepo ledger would otherwise be committed on the next sync.
const ledger = join(REPO_ROOT, 'README.i18n.yaml')
if (existsSync(ledger)) {
  if (!check) rmSync(ledger)
  written.push('README.i18n.yaml (removed)')
}

console.log(`${check ? 'would sync' : 'synced'} ${String(written.length)} paths from ${sourceRoot}`)
for (const path of written.sort()) console.log(`  ${path}`)

if (!check) {
  const status = execFileSync('git', ['status', '--short'], { cwd: REPO_ROOT, encoding: 'utf8' })
  console.log(status.trim() === '' ? '\nno changes against the last commit' : `\n${status.trimEnd()}`)
}
