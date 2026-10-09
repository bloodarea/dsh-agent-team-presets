/** The live Config schema accepts modern and legacy Team records, and the route cleanup the plugin applies to loaded captains. */
import { describe, expect, it } from 'vitest'
import { Config, hasLegacyCaptainRoute, withoutCaptainRoute, withoutCaptainRoutes } from '../src/config.ts'
import { toolMode } from '../src/presets.ts'

/** One stored captain record with the requested tool fields. */
function captainRecord(toolModeValue: 'all' | 'custom' | undefined, tools: string[]) {
  return {
    name: 'captain',
    color: '',
    description: '',
    ...toolModeValue === undefined ? {} : { toolMode: toolModeValue },
    tools,
    systemPrompt: '',
  }
}

/** One stored member record carrying its own route. */
function memberRecord() {
  return {
    name: 'reviewer',
    color: '',
    description: '',
    provider: 'deepseek',
    model: 'deepseek-reasoner',
    reasoningEffort: 'max',
    tools: [],
    systemPrompt: '',
  }
}

/** Parse one Team record through the runtime schema and read the committed Teams. */
function parse(captain: Record<string, unknown>, members: Record<string, unknown>[] = []) {
  const parsed = Config({
    teams: [{ id: 'team-1', name: 'Team', description: '', captain, members }],
    selections: [],
  })
  return parsed.teams.get()
}

describe('Agent Team preset Config', () => {
  it('accepts a legacy record that omits toolMode and infers its mode from the list', () => {
    const empty = parse(captainRecord(undefined, []))
    expect(empty[0]?.captain.toolMode).toBeUndefined()
    expect(toolMode(empty[0]!.captain)).toBe('all')

    const listed = parse(captainRecord(undefined, ['read']))
    expect(toolMode(listed[0]!.captain)).toBe('custom')
  })

  it('keeps an explicit mode that the saved list would contradict', () => {
    // A user who switches to custom and clears every checkbox stores an empty
    // list deliberately; inference alone would read that as default-all.
    const custom = parse(captainRecord('custom', []))
    expect(toolMode(custom[0]!.captain)).toBe('custom')

    const all = parse(captainRecord('all', ['read']))
    expect(toolMode(all[0]!.captain)).toBe('all')
  })

  it('rejects a mode outside the accepted set', () => {
    expect(() => parse(captainRecord('everything' as 'all', []))).toThrow()
  })

  it('reads an omitted, explicitly undefined, or null mode as absent', () => {
    // `toolMode` is not `required`, so an omitted field resolves to undefined
    // and a null one survives as null. The runtime's `??` treats both as
    // "infer the legacy mode", so all three forms stay readable.
    const omitted = parse(captainRecord(undefined, []))
    expect(omitted[0]?.captain.toolMode).toBeUndefined()
    expect(toolMode(omitted[0]!.captain)).toBe('all')

    const explicit = parse({ ...captainRecord('all', []), toolMode: undefined })
    expect(explicit[0]?.captain.toolMode).toBeUndefined()
    expect(toolMode(explicit[0]!.captain)).toBe('all')

    const nulled = parse({ ...captainRecord('all', []), toolMode: null })
    expect(toolMode(nulled[0]!.captain)).toBe('all')
  })
})

describe('legacy captain routes', () => {
  it('detects a captain that still stores a route and leaves a modern one alone', () => {
    const [routed] = parse({ ...captainRecord('all', []), provider: 'deepseek', model: 'deepseek-chat', reasoningEffort: 'high' })
    expect(hasLegacyCaptainRoute(routed!.captain)).toBe(true)

    const [partial] = parse({ ...captainRecord('all', []), provider: 'deepseek' })
    expect(hasLegacyCaptainRoute(partial!.captain)).toBe(true)

    const [modern] = parse(captainRecord('all', []))
    expect(hasLegacyCaptainRoute(modern!.captain)).toBe(false)
  })

  it('returns a Team whose captain stores no route unchanged', () => {
    const [modern] = parse(captainRecord('all', []))
    expect(withoutCaptainRoute(modern!)).toBe(modern)
    expect(withoutCaptainRoutes([modern!])[0]).toBe(modern)
  })

  it('rebuilds a routed captain from the slot fields and keeps every member route', () => {
    const [stored] = parse(
      { ...captainRecord(undefined, ['read']), provider: 'deepseek', model: 'deepseek-chat' },
      [memberRecord()],
    )
    const cleaned = withoutCaptainRoute(stored!)

    expect(cleaned).not.toBe(stored)
    expect(cleaned.id).toBe('team-1')
    expect(Object.keys(cleaned.captain).sort()).toEqual(['color', 'description', 'name', 'systemPrompt', 'toolMode', 'tools'])
    expect(cleaned.captain).toEqual({
      name: 'captain', color: '', description: '', toolMode: 'custom', tools: ['read'], systemPrompt: '',
    })
    expect(cleaned.members[0]).toEqual(memberRecord())
    expect(withoutCaptainRoutes([stored!])[0]).toEqual(cleaned)
  })

  it('materializes the mode a routed captain implied through its tool list', () => {
    const [listed] = parse({ ...captainRecord(undefined, ['read']), provider: 'deepseek' })
    expect(withoutCaptainRoute(listed!).captain.toolMode).toBe('custom')

    const [empty] = parse({ ...captainRecord(undefined, []), model: 'deepseek-chat' })
    expect(withoutCaptainRoute(empty!).captain.toolMode).toBe('all')
  })
})
