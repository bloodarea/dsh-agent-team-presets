#!/usr/bin/env node
/**
 * Rebuild the card-badge replacement bundles against a newer upstream version.
 *
 * Usage:
 *   node tools/card-patches.mjs list
 *   node tools/card-patches.mjs plan      --target dsh-context --version 0.84.1
 *   node tools/card-patches.mjs rebuild   --target dsh-context --version 0.84.1 [--write]
 *   node tools/card-patches.mjs apply     --target dsh-context [--version 0.84.1] [--profile DIR]
 *   node tools/card-patches.mjs revert    --target dsh-context [--version 0.84.1] [--profile DIR]
 *   node tools/card-patches.mjs verify
 *
 * `rebuild` is a dry run unless `--write` is given: it clones, patches, builds
 * and verifies in a scratch directory, then prints the catalog entry it would
 * publish. Nothing in this repository changes until every stage passed.
 *
 * Exit codes: 0 success, 1 failed, 2 the source patch needs adaptation (the
 * build never ran, and the checkout is kept for inspection).
 */
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchPublishedBundle } from './card-patches/acquire.mjs'
import {
  OVERLAY_FILE, CardPatchError, defaultProfileDirectory, installShippedCardPatch, publishCardPatch,
  rebuildCardPatch, revertShippedCardPatch, verifyShippedCardPatches,
} from './card-patches/pipeline.mjs'
import { parseCatalogDocument } from './card-patches/catalog.mjs'
import { PIPELINE_TARGETS, findPipelineTarget } from './card-patches/registry.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Parse `--flag`, `--key value` and bare words. */
function parseArgv(argv) {
  const flags = new Map()
  const positional = []
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) {
      positional.push(token)
      continue
    }
    const key = token.slice(2)
    const next = argv[index + 1]
    if (next !== undefined && !next.startsWith('--')) {
      flags.set(key, next)
      index += 1
    } else {
      flags.set(key, 'true')
    }
  }
  return { command: positional[0], flags }
}

/** Read the shipped overlay, if the operator has produced one yet. */
function readOverlay() {
  const path = join(repoRoot, OVERLAY_FILE)
  if (!existsSync(path)) return []
  return parseCatalogDocument(readFileSync(path, 'utf8'))
}

/** Print one table without pulling in a formatting dependency. */
function printTable(headers, rows) {
  const widths = headers.map((header, column) => Math.max(header.length, ...rows.map(row => String(row[column] ?? '').length)))
  const line = cells => cells.map((cell, column) => String(cell ?? '').padEnd(widths[column])).join('  ').trimEnd()
  console.log(line(headers))
  console.log(line(widths.map(width => '─'.repeat(width))))
  for (const row of rows) console.log(line(row))
}

/** `list`: what this build can rebuild, and what it currently ships. */
async function list() {
  const overlay = readOverlay()
  const rows = PIPELINE_TARGETS.map(target => {
    const shipped = overlay.find(entry => entry.id === target.id)
    return [target.id, target.packageName, shipped?.version ?? '(compiled baseline)', shipped?.asset ?? '—']
  })
  printTable(['target', 'package', 'shipped version', 'asset'], rows)
  if (overlay.length === 0) console.log(`\n${OVERLAY_FILE} does not exist yet: only the versions compiled into src/card-patches.ts are offered.`)
}

/** `plan`: what a rebuild of this version would need. */
async function plan(flags) {
  const target = requireTarget(flags)
  const version = requireFlag(flags, 'version')
  const overlay = readOverlay()
  const shipped = overlay.find(entry => entry.id === target.id)
  const ref = flags.get('ref') ?? `${target.tagPrefix}${version}`
  const patchFile = join(repoRoot, target.patch)
  const probeRoot = mkdtempSync(join(tmpdir(), 'card-patch-probe-'))
  let published
  try {
    const probe = await fetchPublishedBundle({ packageName: target.packageName, version, workRoot: probeRoot })
    published = `${probe.size} bytes, ${probe.sha256.slice(0, 12)}…`
  } catch (error) {
    published = `not published (${error instanceof Error ? error.message.split('\n')[0] : String(error)})`
  } finally {
    rmSync(probeRoot, { recursive: true, force: true })
  }
  console.log(`target        ${target.id} (${target.packageName})`)
  console.log(`version       ${version}`)
  console.log(`source        ${target.repository} @ ${ref}`)
  console.log(`published     ${published}`)
  console.log(`patch         ${existsSync(patchFile) ? target.patch : `${target.patch} (missing)`}`)
  console.log(`artifact      ${target.artifact}, service ${target.service}`)
  console.log(`currently     ${shipped === undefined ? 'compiled baseline only' : `${shipped.version} via ${OVERLAY_FILE}`}`)
  console.log(`\n${flags.get('write') === 'true' ? 'rebuild would publish' : 'rebuild is a dry run; add --write to publish'}`)
}

/** `rebuild`: the full pipeline, publishing only when asked. */
async function rebuild(flags) {
  const target = requireTarget(flags)
  const version = requireFlag(flags, 'version')
  const write = flags.get('write') === 'true'
  const keep = flags.get('keep') === 'true'
  const json = flags.get('json') === 'true'
  const workspace = flags.get('workspace')
  const root = workspace === undefined ? mkdtempSync(join(tmpdir(), 'card-patch-build-')) : resolve(workspace)
  let failed = false
  try {
    const result = await rebuildCardPatch({
      target,
      version,
      ref: flags.get('ref'),
      repoRoot,
      workRoot: root,
      sourceDirectory: flags.get('source-dir'),
      allowFuzz: flags.get('no-fuzz') !== 'true',
      log: json ? () => {} : message => console.log(`  ${message}`),
    })
    let published
    if (write) {
      published = publishCardPatch({
        repoRoot, entry: result.entry, bundle: result.bundle, sourceDirectory: result.sourceDirectory,
        log: json ? () => {} : message => console.log(`  ${message}`),
      })
    }
    if (json) {
      console.log(JSON.stringify({
        ok: true,
        entry: result.entry,
        patch: result.patch,
        revision: result.revision,
        source: result.sourceDirectory,
        published: published === undefined ? null : { asset: published.assetPath, catalog: published.catalogPath },
      }, null, 2))
    } else {
      console.log(`\n${write ? 'published' : 'verified (dry run)'}: ${target.id} ${version}`)
      console.log(JSON.stringify(result.entry, null, 2))
      if (!write) console.log('\nRun again with --write to add the asset and catalog entry.')
    }
  } catch (error) {
    failed = true
    if (json) {
      console.log(JSON.stringify({
        ok: false,
        stage: error instanceof CardPatchError ? error.stage : 'unexpected',
        message: error instanceof Error ? error.message : String(error),
        details: error instanceof CardPatchError ? error.details : [],
        source: existsSync(join(root, 'source')) ? join(root, 'source') : undefined,
      }, null, 2))
    } else {
      console.error(`\n${target.id} ${version}: ${error instanceof Error ? error.message : String(error)}`)
      if (error instanceof CardPatchError) for (const line of error.details) console.error(`  - ${line}`)
      if (existsSync(join(root, 'source'))) console.error(`\nThe patched checkout was kept at ${join(root, 'source')}`)
    }
    process.exitCode = error instanceof CardPatchError && error.stage === 'patch' ? 2 : 1
  } finally {
    if (!keep && !failed && workspace === undefined) rmSync(root, { recursive: true, force: true })
  }
}

/** The version of one target installed in a profile, or undefined. */
function installedVersion(profileDirectory, packageName) {
  try {
    return JSON.parse(readFileSync(join(profileDirectory, 'node_modules', packageName, 'package.json'), 'utf8')).version
  } catch {
    return undefined
  }
}

/** `apply`: install a shipped replacement into a profile without a rebuild. */
async function apply(flags) {
  const target = requireTarget(flags)
  const profile = flags.get('profile') ?? defaultProfileDirectory()
  const version = flags.get('version') ?? installedVersion(profile, target.packageName)
  if (version === undefined) throw new Error(`${target.packageName} is not installed in ${profile}`)
  const result = installShippedCardPatch({
    repoRoot, id: target.id, version, profileDirectory: profile,
    log: flags.get('json') === 'true' ? () => {} : message => console.log(`  ${message}`),
  })
  if (flags.get('json') === 'true') console.log(JSON.stringify({ ok: true, target: target.id, version, ...result }, null, 2))
  else {
    console.log(`\n${target.id} ${version}: ${result.bytes} bytes in ${result.installed}`)
    console.log('Reload the page if the badges do not appear within a second (client-hmr usually reloads it in place).')
    console.log(`Undo: node tools/card-patches.mjs revert --target ${target.id} --version ${version}`)
  }
}

/** `revert`: restore the backup this pipeline wrote. */
async function revert(flags) {
  const target = requireTarget(flags)
  const profile = flags.get('profile') ?? defaultProfileDirectory()
  const version = flags.get('version') ?? installedVersion(profile, target.packageName)
  if (version === undefined) throw new Error(`${target.packageName} is not installed in ${profile}`)
  const result = revertShippedCardPatch({
    repoRoot, id: target.id, version, profileDirectory: profile,
    log: flags.get('json') === 'true' ? () => {} : message => console.log(`  ${message}`),
  })
  if (flags.get('json') === 'true') console.log(JSON.stringify({ ok: true, target: target.id, version, ...result }, null, 2))
  else console.log(`\n${target.id} ${version}: restored ${result.bytes} bytes in ${result.restored}`)
}

/** `verify`: prove the shipped catalog matches the shipped assets. */
async function verify() {
  const { rows, problems } = verifyShippedCardPatches(repoRoot)
  if (rows.length === 0) {
    console.log(`No ${OVERLAY_FILE}: the compiled baseline is covered by tests/card-patches.spec.ts.`)
    return
  }
  printTable(['target', 'version', 'result', 'detail'], rows.map(row => [row.id, row.version, row.ok ? 'ok' : 'FAILED', row.detail]))
  if (problems.length > 0) {
    console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}:`)
    for (const problem of problems) console.error(`  - ${problem}`)
    process.exitCode = 1
  }
}

function requireTarget(flags) {
  const id = requireFlag(flags, 'target')
  const target = findPipelineTarget(id)
  if (target === undefined) {
    throw new Error(`unknown target ${JSON.stringify(id)}; known: ${PIPELINE_TARGETS.map(row => row.id).join(', ')}`)
  }
  return target
}

function requireFlag(flags, name) {
  const value = flags.get(name)
  if (value === undefined || value === 'true' || value === '') throw new Error(`--${name} is required`)
  return value
}

const { command, flags } = parseArgv(process.argv.slice(2))
try {
  if (command === 'list' || command === undefined) await list()
  else if (command === 'plan') await plan(flags)
  else if (command === 'rebuild') await rebuild(flags)
  else if (command === 'apply') await apply(flags)
  else if (command === 'revert') await revert(flags)
  else if (command === 'verify') await verify()
  else {
    console.error(`Unknown command ${JSON.stringify(command)}. Use list, plan, rebuild, apply, revert or verify.`)
    process.exitCode = 1
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  if (error instanceof CardPatchError) for (const line of error.details) console.error(`  - ${line}`)
  process.exitCode = error instanceof CardPatchError && error.stage === 'patch' ? 2 : 1
}
