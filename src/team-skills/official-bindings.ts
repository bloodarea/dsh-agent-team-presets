import { builtinEntry } from '../team-catalog.ts'
import type { OfficialSkillBinding } from '../team-catalog.ts'
import type { TeamPreset } from '../types.ts'

/** Skills shipped under `assets/skills`, including assets missing from this installation. */
export const OFFICIAL_SKILL_IDS = [
  'agent-leader-communication',
  'leader-medium-task-workflow',
  'leader-long-task-orchestration',
  'agent-subagent-orchestration',
  'fullstack-advisor',
  'executor-short-task-workflow',
  'github-repository-presentation',
  'git-release-hygiene',
  'frontend-engineering-workflow',
  'backend-architecture-workflow',
  'independent-code-review-workflow',
  'grilling',
  'research',
] as const

const officialIds = new Set<string>(OFFICIAL_SKILL_IDS)

/** The binding slot reserved for a captain. */
export const CAPTAIN_ROLE = 'captain'

/** Shipped identities always use the catalog, including records from earlier releases. */
export function officialSkillDefaults(team: Pick<TeamPreset, 'id' | 'officialSkills'>): {
  readonly source: 'catalog' | 'preset'
  readonly declarations: readonly OfficialSkillBinding[]
} {
  const entry = builtinEntry(team.id)
  return entry === undefined
    ? { source: 'preset', declarations: team.officialSkills ?? [] }
    : { source: 'catalog', declarations: entry.officialSkillBindings }
}

/** A declaration can address only an unambiguous name and an unambiguous binding slot. */
export function officialSkillTarget(
  team: Pick<TeamPreset, 'captain' | 'members'>,
  declaration: OfficialSkillBinding,
): { readonly status: 'valid'; readonly roleId: string; readonly assetId: string }
  | { readonly status: 'unknown-skill' | 'missing-role' | 'ambiguous-role' } {
  if (!officialIds.has(declaration.skillId)) return { status: 'unknown-skill' }
  const roles = [
    { name: team.captain.name, id: CAPTAIN_ROLE },
    ...team.members.map(member => ({ name: member.name, id: member.id ?? member.name })),
  ]
  const [role, otherMatch] = roles.filter(candidate => candidate.name === declaration.roleName)
  if (role === undefined) return { status: 'missing-role' }
  if (otherMatch !== undefined || roles.filter(candidate => candidate.id === role.id).length !== 1) {
    return { status: 'ambiguous-role' }
  }
  return { status: 'valid', roleId: role.id, assetId: `builtin:${declaration.skillId}` }
}

/** A default can seed only the shipped asset with the declared identity. */
export function isOfficialSkillAsset(
  asset: { readonly id: string; readonly origin: string },
  assetId: string,
): boolean {
  return asset.origin === 'builtin' && asset.id === assetId
}

/** A role that already holds a derived override keeps its explicit assignment. */
export function isOfficialSkillOverride(
  asset: { readonly origin: string; readonly officialSkillId?: string },
  skillId: string,
): boolean {
  return asset.origin === 'override' && asset.officialSkillId === skillId
}
