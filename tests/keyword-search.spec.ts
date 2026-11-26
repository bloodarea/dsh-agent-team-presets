/**
 * The keyword matcher both pick-fields share.
 *
 * The two boxes that use it (the tool allow-list and the Team Skill assignment
 * grid) are long lists a reader narrows by typing. What matters is that a
 * keyword is explainable and forgiving: every word must be found, a word may be
 * a fragment of a name, a longer word may be a subsequence of one, and a filter
 * never changes more than what is shown.
 */

import { describe, expect, it } from 'vitest'
import { keywordTokens, matchKeyword } from '../src/keyword-search.ts'

describe('keyword tokens', () => {
  it('splits on whitespace and lowercases, sharing the Team list\'s grammar', () => {
    expect(keywordTokens('  Spawn  Tool ')).toEqual(['spawn', 'tool'])
    expect(keywordTokens('')).toEqual([])
    expect(keywordTokens('   ')).toEqual([])
  })

  it('keeps a Chinese phrase whole, so a one-word query still matches', () => {
    expect(keywordTokens('团队 工具')).toEqual(['团队', '工具'])
    expect(keywordTokens('队长通信')).toEqual(['队长通信'])
  })
})

describe('keyword matching', () => {
  it('matches everything when the box is empty', () => {
    expect(matchKeyword([], ['anything'])).toBe(true)
  })

  it('matches a fragment of a tool name, which is the expected case', () => {
    expect(matchKeyword(keywordTokens('shell'), ['run_shell_command', 'Execute a shell command'])).toBe(true)
    // Case never matters: a reader does not know how a tool is capitalized.
    expect(matchKeyword(keywordTokens('SHELL'), ['run_shell_command'])).toBe(true)
  })

  it('matches the description as well as the name', () => {
    expect(matchKeyword(keywordTokens('execute'), ['run_shell_command', 'Execute a shell command'])).toBe(true)
  })

  it('accepts an abbreviated word as a subsequence, so a misspelling still finds it', () => {
    expect(matchKeyword(keywordTokens('spwn'), ['spawn_team_member'])).toBe(true)
    // The dropped vowel is what a reader actually omits; a fragment would not match.
    expect(matchKeyword(keywordTokens('spn'), ['spawn_team_member'])).toBe(true)
  })

  it('keeps a token shorter than three characters literal, so a stray letter is not a wildcard', () => {
    // 'yp' is neither a substring nor long enough to be matched as a subsequence.
    expect(matchKeyword(keywordTokens('yp'), ['spawn_team_member'])).toBe(false)
    expect(matchKeyword(keywordTokens('tm'), ['spawn_team_member'])).toBe(false)
    // Two characters that DO appear verbatim still match: the rule is literal, not off.
    expect(matchKeyword(keywordTokens('sp'), ['spawn_team_member'])).toBe(true)
  })

  it('requires every word, so two words narrow instead of widen', () => {
    expect(matchKeyword(keywordTokens('shell quiet'), ['run_shell_command', 'Executes a shell command'])).toBe(false)
    expect(matchKeyword(keywordTokens('shell exec'), ['run_shell_command', 'Executes a shell command'])).toBe(true)
  })

  it('matches a group label passed as one of the fields', () => {
    expect(matchKeyword(keywordTokens('mcp'), ['read_file', 'Read a file', 'MCP server: files'])).toBe(true)
  })

  it('reports no match rather than throwing on an empty field list', () => {
    expect(matchKeyword(keywordTokens('anything'), [])).toBe(false)
    expect(matchKeyword([], [])).toBe(true)
  })
})
