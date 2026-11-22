import { crc32 } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { buildSkillPackage, importZipSkill, parseSkillFrontmatter, renameSkillPackage } from '../src/team-skills/import.ts'

const encode = (value: string): Uint8Array => new TextEncoder().encode(value)

function skillDocument(fields = '', body = 'Use this method.\n'): Uint8Array {
  return encode(`---\nname: report-writer\ndescription: Write a report\n${fields}---\n${body}`)
}

/** Construct a stored, single-file ZIP for the archive import path. */
function zipInstruction(bytes: Uint8Array): Uint8Array {
  const name = Buffer.from('SKILL.md')
  const checksum = crc32(bytes)
  const local = Buffer.alloc(30)
  local.writeUInt32LE(0x04034b50, 0)
  local.writeUInt16LE(20, 4)
  local.writeUInt32LE(checksum, 14)
  local.writeUInt32LE(bytes.length, 18)
  local.writeUInt32LE(bytes.length, 22)
  local.writeUInt16LE(name.length, 26)

  const central = Buffer.alloc(46)
  central.writeUInt32LE(0x02014b50, 0)
  central.writeUInt16LE(20, 4)
  central.writeUInt16LE(20, 6)
  central.writeUInt32LE(checksum, 16)
  central.writeUInt32LE(bytes.length, 20)
  central.writeUInt32LE(bytes.length, 24)
  central.writeUInt16LE(name.length, 28)

  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(1, 8)
  end.writeUInt16LE(1, 10)
  end.writeUInt32LE(central.length + name.length, 12)
  end.writeUInt32LE(local.length + name.length + bytes.length, 16)
  return new Uint8Array(Buffer.concat([local, name, bytes, central, name, end]))
}

function importFolder(bytes: Uint8Array) {
  return buildSkillPackage([{ path: 'SKILL.md', bytes }])
}

describe('Team Skill dependency frontmatter warnings', () => {
  it.each([['folder', importFolder], ['ZIP', (bytes: Uint8Array) => importZipSkill(zipInstruction(bytes))]] as const)(
    'reports keys in a %s import regardless of value and preserves the instruction',
    (_format, importSkill) => {
      const instruction = skillDocument('otherSkills: []\n"executables": null\nmcpServers: [some-server]\n')
      const outcome = importSkill(instruction)
      if (!outcome.ok) throw new Error(`fixture import failed: ${outcome.reason}`)
      expect(outcome.dependencyWarnings).toEqual([
        { code: 'unsupported-dependency-frontmatter', field: 'executables' },
        { code: 'unsupported-dependency-frontmatter', field: 'mcpServers' },
        { code: 'unsupported-dependency-frontmatter', field: 'otherSkills' },
      ])
      expect(outcome.skill).toEqual({
        name: 'report-writer',
        description: 'Write a report',
        files: [{ path: 'SKILL.md', bytes: instruction }],
        totalBytes: instruction.byteLength,
      })
    },
  )

  it('ignores comments, nested metadata, similarly named keys, and Markdown content', () => {
    const instruction = skillDocument(
      '# executables: [comment]\nmetadata:\n  executables: [nest]\n  mcpServers: [nest]\n  otherSkills: [nest]\nExecutables: [different-case]\n',
      '```yaml\nexecutables: [body]\nmcpServers: [body]\notherSkills: [body]\n```\n',
    )
    expect(importFolder(instruction)).toMatchObject({ ok: true, dependencyWarnings: [] })
  })

  it('warns only for explicit keys when YAML merge keys supply defaults', () => {
    const instruction = encode('---\n%YAML 1.1\n--- {name: report-writer, description: Write, defaults: &deps {executables: [git]}, <<: *deps, otherSkills: []}\n---\n')
    expect(importFolder(instruction)).toMatchObject({
      ok: true,
      dependencyWarnings: [{ code: 'unsupported-dependency-frontmatter', field: 'otherSkills' }],
    })
  })

  it('reports a lone explicit field alongside an existing script warning', () => {
    const result = buildSkillPackage([
      { path: 'SKILL.md', bytes: skillDocument('otherSkills: false\n') },
      { path: 'scripts/render.sh', bytes: encode('#!/bin/sh\n') },
    ])
    expect(result).toMatchObject({
      ok: true,
      warnings: [expect.stringContaining('1 script file(s)')],
      dependencyWarnings: [{ code: 'unsupported-dependency-frontmatter', field: 'otherSkills' }],
    })
  })

  it('still rejects invalid YAML', () => {
    expect(importFolder(skillDocument('mcpServers: [\n'))).toEqual({ ok: false, reason: 'invalid-frontmatter', path: 'SKILL.md' })
  })
})

describe('renaming a Team Skill package', () => {
  it.each([
    ["\uFEFF---\r\nname: 'report-writer' # name\r\ndescription: 描述\r\notherSkills: []\r\n---\r\n# report-writer\r\n", "'report-writer'", "'local-copy'"],
    ['---\n{ name: "report-writer", description: Write a report }\n---\n', '"report-writer"', '"local-copy"'],
    ['---\nname: >- # name\n  report-writer\n# description\ndescription: Write a report\n---\n', '  report-writer', '  local-copy'],
    ['---\nmetadata: { default-name: &default report-writer }\nname: *default # name\ndescription: Write a report\n---\n', 'name: *default', 'name: local-copy'],
    ['---\n%YAML 1.1\n--- {metadata: &base {name: report-writer}, <<: *base, description: Write}\n---\n', '{metadata:', '{name: local-copy, metadata:'],
    ['---\r\n%YAML 1.1\r\n--- # document\r\n  metadata: &base {name: report-writer}\r\n  <<: *base\r\n  description: Write\r\n---\r\n', '  metadata:', '  name: local-copy\r\n  metadata:'],
  ])('changes just the name value in %j', (source, previous, replacement) => {
    const instruction = encode(source)
    const resource = encode('report-writer')
    const original = buildSkillPackage([
      { path: 'SKILL.md', bytes: instruction },
      { path: 'references/name.txt', bytes: resource },
    ])
    if (!original.ok) throw new Error(`fixture import failed: ${original.reason}`)
    const copy = renameSkillPackage(original.skill, 'local-copy')
    const expected = encode(source.replace(previous, replacement))
    expect(copy.name).toBe('local-copy')
    expect(copy.description).toBe(original.skill.description)
    expect(copy.files[0]?.bytes).toEqual(expected)
    expect(copy.files[1]?.bytes).toBe(resource)
    expect(copy.totalBytes).toBe(expected.length + resource.length)
    expect(original.skill.files[0]?.bytes).toEqual(encode(source))
  })

  it('writes a YAML-looking name as a string', () => {
    const original = importFolder(skillDocument())
    if (!original.ok) throw new Error(`fixture import failed: ${original.reason}`)
    const copy = renameSkillPackage(original.skill, 'null')
    const text = new TextDecoder().decode(copy.files[0]?.bytes)
    expect(parseSkillFrontmatter(text)?.name).toBe('null')
  })
})
