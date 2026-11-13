/**
 * The nine Team presets this plugin ships: their documents, the one-time
 * install, the restore Settings offers, and the display data that belongs to
 * the template rather than to any runtime field.
 *
 * The documents are checked against the copies a reader of this repository can
 * read, so the shipped content cannot drift from what `contrib/default-presets`
 * states. The install and restore rules are checked as pure list operations,
 * which is what both the Host pass and the page call.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  AUDIT_TEAM_ID,
  BUILTIN_TEAMS,
  BUILTIN_TEAM_IDS,
  DISCOVERY_TEAM_ID,
  ENGINEERING_TEAM_ID,
  FULLSTACK_TEAM_ID,
  LIGHTWEIGHT_TEAM_ID,
  PLANNING_TEAM_ID,
  RESEARCH_TEAM_ID,
  STANDARD_TEAM_ID,
  WORKFLOW_TEAM_ID,
  builtinTeamDefinition,
  restoreBuiltinTeams,
  missingSeededBuiltinTeams,
  seedBuiltinTeams,
} from '../src/builtin-teams.ts'
import {
  BUILTIN_TEAM_CATALOG,
  OFFICIAL_DISCOVERY_SKILLS,
  OFFICIAL_EXECUTOR_SKILLS,
  OFFICIAL_REPOSITORY_SKILLS,
  OFFICIAL_RESEARCH_SKILLS,
  builtinEntry,
  teamSeriesOf,
} from '../src/team-catalog.ts'
import { exportTeamPreset, parseTeamPresetText } from '../src/preset-transfer.ts'
import type { TeamPreset } from '../src/types.ts'

/** Every shipped identity, in shipped order: development scale, then work modes. */
const IDS = [
  LIGHTWEIGHT_TEAM_ID, STANDARD_TEAM_ID, FULLSTACK_TEAM_ID,
  DISCOVERY_TEAM_ID, PLANNING_TEAM_ID, WORKFLOW_TEAM_ID, ENGINEERING_TEAM_ID, AUDIT_TEAM_ID, RESEARCH_TEAM_ID,
]

/** The two fixed official series and their membership. */
const SERIES = {
  'classic-development': [LIGHTWEIGHT_TEAM_ID, STANDARD_TEAM_ID, FULLSTACK_TEAM_ID],
  'work-modes': [DISCOVERY_TEAM_ID, PLANNING_TEAM_ID, WORKFLOW_TEAM_ID, ENGINEERING_TEAM_ID, AUDIT_TEAM_ID, RESEARCH_TEAM_ID],
} as const

/** One user-created Team the shipped presets must never touch. */
function userTeam(): TeamPreset {
  return {
    id: 'team-1',
    name: 'My own team',
    description: 'Built by hand',
    captain: {
      name: 'lead', color: '#123456', description: 'leads', toolMode: 'custom', tools: ['read'], systemPrompt: 'lead it',
    },
    members: [{
      id: 'own-member', name: 'helper', color: '', description: '', provider: 'p', model: 'm', reasoningEffort: 'high',
      toolMode: 'all', tools: [], systemPrompt: 'help',
    }],
  }
}

/** One stored copy of a shipped preset, edited the way a user would edit it. */
function editedShipped(): TeamPreset {
  const entry = BUILTIN_TEAMS[0]!
  const definition = builtinTeamDefinition(entry)
  const first = definition.members[0]!
  return {
    ...definition,
    name: 'Renamed by me',
    description: 'Rewritten purpose',
    metadata: { summary: 'my own summary', tags: ['mine'] },
    captain: { ...definition.captain, description: 'my captain', systemPrompt: 'my captain prompt', toolMode: 'custom', tools: ['read'] },
    members: [
      // The shipped first member, keeping the route and policy the user set.
      { ...first, description: 'my member', systemPrompt: 'my member prompt', provider: 'deepseek', model: 'deepseek-chat', reasoningEffort: 'high', toolMode: 'custom', tools: ['write'] },
      // A member the user added, which a restore removes.
      {
        name: 'extra', color: '#000000', description: 'added by me', toolMode: 'all', tools: [], systemPrompt: 'extra',
        id: 'extra-member', provider: '', model: '', reasoningEffort: '',
      },
    ],
  }
}

/** Read one contrib document as the repository publishes it. */
function contrib(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../contrib/default-presets/${name}`, import.meta.url), 'utf8')) as unknown
}

/** The contrib file that publishes one shipped Team. */
function contribFile(id: string): string {
  return `${id.replace('builtin-', '')}-team.json`
}

describe('the official Team catalog', () => {
  it('ships exactly nine official Teams, in two fixed series', () => {
    expect(BUILTIN_TEAMS).toHaveLength(9)
    expect(BUILTIN_TEAM_IDS).toEqual(IDS)
    expect(new Set(BUILTIN_TEAM_IDS).size).toBe(9)
    expect(BUILTIN_TEAM_CATALOG).toHaveLength(9)
    for (const [series, ids] of Object.entries(SERIES)) {
      expect(BUILTIN_TEAM_CATALOG.filter(entry => entry.series === series).map(entry => entry.id), series).toEqual(ids)
    }
    // A custom Team has no series and no catalog entry.
    expect(teamSeriesOf('team-1')).toBeUndefined()
    expect(builtinEntry('team-1')).toBeUndefined()
  })

  it('ships the nine documents exactly as contrib publishes them', () => {
    expect(readdirSync(new URL('../contrib/default-presets', import.meta.url)).filter(name => name.endsWith('.json')).sort())
      .toEqual(IDS.map(contribFile).sort())
    for (const entry of BUILTIN_TEAMS) {
      const document = exportTeamPreset(builtinTeamDefinition(entry), { officialSkills: entry.officialSkillBindings })
      expect(document, entry.id).toEqual(contrib(contribFile(entry.id)))
    }
  })

  it('publishes each contrib copy as a document this plugin imports', () => {
    // The README tells a reader they can import these by hand, so the copies
    // must be readable by the same reader an Import preset click uses.
    for (const entry of BUILTIN_TEAMS) {
      const file = contribFile(entry.id)
      const text = readFileSync(new URL(`../contrib/default-presets/${file}`, import.meta.url), 'utf8')
      const parsed = parseTeamPresetText(text)
      expect(parsed.ok, file).toBe(true)
      if (!parsed.ok) continue
      expect(parsed.transfer.version).toBe(2)
      expect(parsed.transfer.team.metadata).toBeDefined()
    }
  })

  it('carries one distinct display summary and tag set per official Team', () => {
    const summaries = new Set<string>()
    for (const entry of BUILTIN_TEAMS) {
      const metadata = entry.metadata
      expect(metadata.summary, entry.id).toBeTruthy()
      expect(metadata.tags?.length, entry.id).toBeGreaterThan(0)
      expect(metadata.useCases?.length, entry.id).toBeGreaterThan(0)
      expect(metadata.quickPrompts?.length, entry.id).toBeGreaterThan(0)
      expect(summaries.has(metadata.summary!), entry.id).toBe(false)
      summaries.add(metadata.summary!)
    }
  })

  it('declares the shipped skills only for the Teams whose roles own them', () => {
    const expected: Record<string, readonly { skillId: string; roleName: string }[]> = {
      [LIGHTWEIGHT_TEAM_ID]: OFFICIAL_EXECUTOR_SKILLS,
      [STANDARD_TEAM_ID]: OFFICIAL_EXECUTOR_SKILLS,
      [FULLSTACK_TEAM_ID]: OFFICIAL_EXECUTOR_SKILLS,
      [DISCOVERY_TEAM_ID]: OFFICIAL_DISCOVERY_SKILLS,
      [WORKFLOW_TEAM_ID]: OFFICIAL_REPOSITORY_SKILLS,
      [ENGINEERING_TEAM_ID]: OFFICIAL_REPOSITORY_SKILLS,
      [RESEARCH_TEAM_ID]: OFFICIAL_RESEARCH_SKILLS,
    }
    const owners = BUILTIN_TEAMS.filter(entry => entry.officialSkillBindings.length > 0).map(entry => entry.id)
    expect(owners).toEqual(Object.keys(expected))
    for (const entry of BUILTIN_TEAMS) {
      expect(entry.officialSkillBindings, entry.id).toEqual(expected[entry.id] ?? [])
      const roleNames = new Set([
        entry.document.team.captain.name,
        ...entry.document.team.members.map(member => member.name),
      ])
      for (const binding of entry.officialSkillBindings) {
        // A declaration that names no real role could never resolve locally.
        expect(roleNames.has(binding.roleName), `${entry.id}:${binding.roleName}`).toBe(true)
      }
    }
  })
})

describe('the stored shape of a shipped Team', () => {
  it('gives every shipped member a stable, unique role identity', () => {
    for (const entry of BUILTIN_TEAMS) {
      const definition = builtinTeamDefinition(entry)
      const ids = definition.members.map(member => member.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids).toEqual(definition.members.map(member => `${entry.id}:${member.name}`))
      // Two materializations describe the same roles, so restoring a preset
      // twice addresses the members a durable snapshot already bound.
      expect(builtinTeamDefinition(entry)).toEqual(definition)
    }
  })

  it('starts every shipped slot on the Session route and the default tool policy', () => {
    for (const entry of BUILTIN_TEAMS) {
      const definition = builtinTeamDefinition(entry)
      expect(definition.captain).not.toHaveProperty('provider')
      expect(definition.captain.toolMode).toBe('all')
      expect(definition.captain.tools).toEqual([])
      for (const member of definition.members) {
        expect(member.provider).toBe('')
        expect(member.model).toBe('')
        expect(member.reasoningEffort).toBe('')
        expect(member.toolMode).toBe('all')
        expect(member.tools).toEqual([])
      }
      expect(definition.members.length).toBeGreaterThan(0)
    }
  })

  it('detaches the copied display metadata from the catalog literal', () => {
    const first = builtinTeamDefinition(BUILTIN_TEAMS[0]!)
    const second = builtinTeamDefinition(BUILTIN_TEAMS[0]!)
    expect(first.metadata).toEqual(second.metadata)
    expect(first.metadata).not.toBe(second.metadata)
    // Mutating one stored Team must not reach the catalog or another copy.
    ;(first.metadata!.tags as string[]).push('mutated')
    expect(builtinTeamDefinition(BUILTIN_TEAMS[0]!).metadata!.tags).not.toContain('mutated')
  })
})

describe('installing the shipped presets once', () => {
  it('appends every shipped preset to a deployment that holds no Team, and marks them', () => {
    const seeded = seedBuiltinTeams([], [])
    expect(seeded.changed).toBe(true)
    expect(seeded.teams.map(team => team.id)).toEqual(IDS)
    expect(seeded.seeded).toEqual(IDS)
  })

  it('installs nothing once every shipped preset is marked', () => {
    const first = seedBuiltinTeams([], [])
    const second = seedBuiltinTeams(first.teams, first.seeded)
    expect(second.changed).toBe(false)
    expect(second.teams.map(team => team.id)).toEqual(IDS)
    expect(second.seeded).toEqual(IDS)
  })

  it('never reinstalls a preset the user deleted', () => {
    // The user was offered every shipped preset and deleted the second one.
    const remaining = BUILTIN_TEAMS.filter(entry => entry.id !== PLANNING_TEAM_ID).map(builtinTeamDefinition)
    const seeded = seedBuiltinTeams(remaining, IDS)
    expect(seeded.changed).toBe(false)
    expect(seeded.teams.map(team => team.id)).toEqual(IDS.filter(id => id !== PLANNING_TEAM_ID))
  })

  it('upgrades a 0.1.5 deployment by appending only the six it never had', () => {
    // A 0.1.5 deployment holds the three development Teams and was offered
    // exactly those; the six work modes have never been offered there.
    const legacy = [LIGHTWEIGHT_TEAM_ID, STANDARD_TEAM_ID, FULLSTACK_TEAM_ID].map(id => builtinTeamDefinition(builtinEntry(id)!))
    const seeded = seedBuiltinTeams(legacy, [LIGHTWEIGHT_TEAM_ID, STANDARD_TEAM_ID, FULLSTACK_TEAM_ID])
    expect(seeded.changed).toBe(true)
    expect(seeded.teams.map(team => team.id)).toEqual(IDS)
    // The three the user already held were not touched.
    expect(seeded.teams.slice(0, 3)).toEqual(legacy)
    expect(seeded.seeded).toEqual(IDS)
  })

  it('never overwrites a shipped preset the user edited', () => {
    const edited = editedShipped()
    const seeded = seedBuiltinTeams([edited], [])
    // The edited copy stays exactly as it was, and is now marked as offered.
    expect(seeded.teams[0]).toBe(edited)
    expect(seeded.seeded).toEqual(IDS)
    // The presets the deployment does not hold are appended behind it.
    expect(seeded.teams.map(team => team.id)).toEqual(IDS)
    expect(seeded.changed).toBe(true)
  })

  it('marks a preset the deployment already holds, without touching it or duplicating it', () => {
    const held = builtinTeamDefinition(BUILTIN_TEAMS[0]!)
    const alreadyMarked = IDS.filter(id => id !== LIGHTWEIGHT_TEAM_ID)
    const seeded = seedBuiltinTeams([held], alreadyMarked)
    expect(seeded.changed).toBe(true)
    expect(seeded.teams).toEqual([held])
    // The marker is append-only: the newly marked preset joins at the end.
    expect(seeded.seeded).toEqual([...alreadyMarked, LIGHTWEIGHT_TEAM_ID])
    // One write is enough: the marker grew once, so the next pass is silent.
    expect(seedBuiltinTeams(seeded.teams, seeded.seeded).changed).toBe(false)
  })

  it('keeps a user Team first and appends the shipped presets behind it', () => {
    const own = userTeam()
    const seeded = seedBuiltinTeams([own], [])
    expect(seeded.teams.map(team => team.id)).toEqual(['team-1', ...IDS])
    expect(seeded.teams[0]).toBe(own)
  })
})

describe('reporting a shipped set that went missing after it was offered', () => {
  it('reports nothing on a deployment that was never offered a preset', () => {
    // A fresh install has no marker yet; the install pass adds them in the same
    // startup, so warning here would be noise about a state nobody can see.
    expect(missingSeededBuiltinTeams([], [])).toEqual([])
  })

  it('reports nothing while every marked preset is still in the list', () => {
    const held = BUILTIN_TEAMS.map(builtinTeamDefinition)
    expect(missingSeededBuiltinTeams(held, IDS)).toEqual([])
  })

  it('names exactly the marked presets that are gone, in catalog order', () => {
    // The settings document was replaced or edited: the marker survived, the
    // presets did not, and the install pass deliberately does not re-add them.
    const remaining = [builtinTeamDefinition(builtinEntry(RESEARCH_TEAM_ID)!)]
    expect(missingSeededBuiltinTeams(remaining, IDS)).toEqual(
      IDS.filter(id => id !== RESEARCH_TEAM_ID),
    )
  })

  it('treats a marker without a list as the whole shipped set going missing', () => {
    // The reported state: the marker survived, the Team list is empty.
    expect(missingSeededBuiltinTeams([], IDS)).toEqual([...IDS])
    // One mark is enough to describe the loss; the pass adds the unmarked rest.
    expect(missingSeededBuiltinTeams([], [PLANNING_TEAM_ID])).toEqual([PLANNING_TEAM_ID])
  })
})

describe('restoring the shipped presets', () => {
  it('puts an edited shipped preset back at its document, keeping local routes and tool policies', () => {
    const edited = editedShipped()
    // Every other shipped preset is present and untouched, so only the edited
    // one is reported as changed.
    const others = BUILTIN_TEAMS.slice(1).map(builtinTeamDefinition)
    const restored = restoreBuiltinTeams([edited, ...others])
    expect(restored.changed).toEqual([LIGHTWEIGHT_TEAM_ID])
    const team = restored.teams[0]!
    expect(team.id).toBe(LIGHTWEIGHT_TEAM_ID)
    expect(team.name).toBe(BUILTIN_TEAMS[0]!.document.team.name)
    expect(team.description).toBe(BUILTIN_TEAMS[0]!.document.team.description)
    expect(team.captain.description).toBe(BUILTIN_TEAMS[0]!.document.team.captain.description)
    expect(team.captain.systemPrompt).toBe(BUILTIN_TEAMS[0]!.document.team.captain.systemPrompt)
    // The display metadata is template content, so a restore brings the shipped
    // copy back as well.
    expect(team.metadata).toEqual(BUILTIN_TEAMS[0]!.metadata)
    // The route and the tool policy are local, so the shipped name and prompts
    // come back while the configured model and allow-list stay.
    const member = team.members.find(entry => entry.name === BUILTIN_TEAMS[0]!.document.team.members[0]!.name)!
    expect(member.provider).toBe('deepseek')
    expect(member.model).toBe('deepseek-chat')
    expect(member.reasoningEffort).toBe('high')
    expect(member.tools).toEqual(['write'])
    expect(member.description).toBe(BUILTIN_TEAMS[0]!.document.team.members[0]!.description)
    // A member the document does not name leaves the roster.
    expect(team.members.map(entry => entry.name)).toEqual(BUILTIN_TEAMS[0]!.document.team.members.map(entry => entry.name))
  })

  it('re-adds a shipped preset the user deleted, and reports only that identity', () => {
    const own = userTeam()
    const restored = restoreBuiltinTeams([own])
    expect(restored.changed).toEqual(IDS)
    expect(restored.teams.map(team => team.id)).toEqual(['team-1', ...IDS])
    // The user's Team is untouched, in content and in position.
    expect(restored.teams[0]).toEqual(own)
    expect(restored.teams[1]).toEqual(builtinTeamDefinition(BUILTIN_TEAMS[0]!))
  })

  it('restores exactly nine official Teams even when the user deleted several', () => {
    // "Restore all defaults" is the only path that resurrects a deleted shipped
    // preset, and it must resurrect precisely the official set.
    const survivors = [LIGHTWEIGHT_TEAM_ID, RESEARCH_TEAM_ID].map(id => builtinTeamDefinition(builtinEntry(id)!))
    const restored = restoreBuiltinTeams(survivors)
    expect(restored.teams.filter(team => BUILTIN_TEAM_IDS.includes(team.id))).toHaveLength(9)
    expect(restored.changed.sort()).toEqual(IDS.filter(id => id !== LIGHTWEIGHT_TEAM_ID && id !== RESEARCH_TEAM_ID).sort())
  })

  it('reports nothing when every shipped preset already matches', () => {
    const teams = [userTeam(), ...BUILTIN_TEAMS.map(builtinTeamDefinition)]
    const restored = restoreBuiltinTeams(teams)
    expect(restored.changed).toEqual([])
    expect(restored.teams).toEqual(teams)
    // The restore is idempotent: the list a restore produced restores to itself.
    expect(restoreBuiltinTeams(restored.teams).changed).toEqual([])
  })

  it('never touches a Team the user created, even under a shipped name', () => {
    const sameName: TeamPreset = { ...userTeam(), name: BUILTIN_TEAMS[0]!.document.team.name }
    const restored = restoreBuiltinTeams([sameName])
    expect(restored.teams[0]).toEqual(sameName)
    // The shipped preset still joins it, because identity — not name — decides.
    expect(restored.teams.map(team => team.id)).toEqual(['team-1', ...IDS])
  })
})
