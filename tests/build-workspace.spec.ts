import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, lstatSync, symlinkSync, existsSync, realpathSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import ts from 'typescript'
import { isWithinDirectory, mirrorWorkspace, privateCopy, withBuildWorkspace } from '../tools/build-utils.mjs'

const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })
function temp(): string { const root = mkdtempSync(join(tmpdir(), 'team build paths ')); roots.push(root); return root }
function file(path: string, text: string): void { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text) }

describe('isolated build source selection', () => {
  it('emits JavaScript from actual TypeScript filenames containing platform separators', () => {
    const root = temp(); const sourceRoot = join(root, 'pkg', 'src'); const input = join(sourceRoot, 'index.ts')
    file(input, 'export const answer: number = 42')
    const output = join(root, 'pkg', 'lib')
    const program = ts.createProgram([input], { target: ts.ScriptTarget.ES2024, module: ts.ModuleKind.ESNext, types: [], noLib: true, outDir: output })
    const local = program.getSourceFiles().filter(source => isWithinDirectory(sourceRoot, source.fileName))
    expect(local).toHaveLength(1)
    for (const source of local) program.emit(source)
    expect(readFileSync(join(output, 'index.js'), 'utf8')).toContain('answer = 42')
  })
  it('counts a real local type error instead of silently excluding it', () => {
    const root = temp(); const input = join(root, 'src', 'broken.ts')
    file(input, 'export const answer: number = "wrong"')
    const program = ts.createProgram([input], { types: [], noLib: true, noEmit: true })
    const diagnostics = program.getSemanticDiagnostics().filter(row => row.file && isWithinDirectory(root, row.file.fileName))
    expect(diagnostics.map(row => row.code)).toContain(2322)
  })
  it('rejects a prefix sibling and parent traversal while accepting normalized filenames', () => {
    const root = join(temp(), 'pkg')
    expect(isWithinDirectory(root, join(root, 'src', 'index.ts').split(String.fromCharCode(92)).join('/'))).toBe(true)
    expect(isWithinDirectory(root, root + '-sibling/index.ts')).toBe(false)
    expect(isWithinDirectory(root, resolve(root, '..', 'escape.ts'))).toBe(false)
  })
})

describe('native workspace mirror', () => {
  it('relocates internal directory links and preserves external links without copying their targets', () => {
    const root = temp(); const source = join(root, 'checkout'); const stage = join(root, 'stage'); const external = join(root, 'external')
    file(join(source, 'packages', 'example', 'source.ts'), 'original')
    file(join(external, 'value.txt'), 'external')
    mkdirSync(join(source, 'node_modules'), { recursive: true })
    const kind = process.platform === 'win32' ? 'junction' : 'dir'
    symlinkSync(join(source, 'packages', 'example'), join(source, 'node_modules', 'internal'), kind)
    symlinkSync(external, join(source, 'node_modules', 'external'), kind)
    mirrorWorkspace(source, stage, ['packages', 'node_modules'])
    expect(lstatSync(join(stage, 'node_modules', 'internal')).isSymbolicLink()).toBe(true)
    privateCopy(join(source, 'packages/example/source.ts'), join(stage, 'packages/example/source.ts'))
    writeFileSync(join(stage, 'packages/example/source.ts'), 'staged')
    expect(readFileSync(join(stage, 'node_modules/internal/source.ts'), 'utf8')).toBe('staged')
    expect(readFileSync(join(source, 'packages/example/source.ts'), 'utf8')).toBe('original')
    expect(readFileSync(join(stage, 'node_modules/external/value.txt'), 'utf8')).toBe('external')
  })
  it('breaks a mirrored hard link before editing configuration', () => {
    const root = temp(); const source = join(root, 'checkout'); const stage = join(root, 'stage')
    file(join(source, 'packages/config.json'), 'original')
    mirrorWorkspace(source, stage, ['packages'])
    privateCopy(join(source, 'packages/config.json'), join(stage, 'packages/config.json'))
    writeFileSync(join(stage, 'packages/config.json'), 'changed')
    expect(readFileSync(join(source, 'packages/config.json'), 'utf8')).toBe('original')
  })
  it('refuses overlapping roots and escaping entries before writing outside the stage', () => {
    const root = temp(); const source = join(root, 'checkout'); const stage = join(root, 'stage')
    mkdirSync(source)
    expect(() => mirrorWorkspace(source, source, ['packages'])).toThrow('separate')
    expect(() => mirrorWorkspace(source, join(source, 'stage'), ['packages'])).toThrow('separate')
    expect(() => mirrorWorkspace(source, stage, ['../escape'])).toThrow('escapes')
    expect(existsSync(join(root, 'escape'))).toBe(false)
    symlinkSync(source, stage, process.platform === 'win32' ? 'junction' : 'dir')
    expect(() => mirrorWorkspace(source, stage, ['packages'])).toThrow('separate')
  })
})

describe('build staging lifetime', () => {
  it('accepts a relative temporary parent and removes its workspace after success', async () => {
    const parent = mkdtempSync(join(process.cwd(), 'node_modules', 'build lifetime ')); roots.push(parent)
    let created = ''
    const result = await withBuildWorkspace(relative(process.cwd(), parent), async stage => {
      created = stage; file(join(stage, 'input.txt'), 'input')
      expect(dirname(stage)).toBe(realpathSync(parent))
      return 'finished'
    })
    expect(result).toBe('finished')
    expect(existsSync(created)).toBe(false)
  })
  it('cleans preparation failures and keeps their original error', async () => {
    const parent = temp(); const failure = new Error('known invalid preparation input'); let created = ''
    await expect(withBuildWorkspace(parent, async stage => {
      created = stage; file(join(stage, 'partial.txt'), 'partial'); throw failure
    })).rejects.toBe(failure)
    expect(existsSync(created)).toBe(false)
  })
  it('canonicalizes a directory alias used as the temporary parent', async () => {
    const root = temp(); const physical = join(root, 'physical'); const alias = join(root, 'alias')
    mkdirSync(physical); symlinkSync(physical, alias, process.platform === 'win32' ? 'junction' : 'dir')
    let created = ''
    await withBuildWorkspace(alias, async stage => { created = stage; expect(dirname(stage)).toBe(realpathSync(physical)) })
    expect(existsSync(created)).toBe(false)
  })
  it('preserves a build failure and refuses cleanup through a replaced directory link', async () => {
    const root = temp(); const outside = join(root, 'outside'); file(join(outside, 'sentinel'), 'untouched')
    const failure = new Error('original preparation failure'); let observed: unknown
    try {
      await withBuildWorkspace(root, async stage => {
        rmSync(stage, { recursive: true }); symlinkSync(outside, stage, process.platform === 'win32' ? 'junction' : 'dir'); throw failure
      })
    } catch (error) { observed = error }
    expect(observed).toBeInstanceOf(AggregateError)
    if (!(observed instanceof AggregateError)) throw new Error('expected both failures')
    expect(observed.errors[0]).toBe(failure)
    expect(String(observed.errors[1])).toContain('Refused unsafe staging cleanup')
    expect(readFileSync(join(outside, 'sentinel'), 'utf8')).toBe('untouched')
  })
})
