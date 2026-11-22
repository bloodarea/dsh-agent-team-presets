/**
 * Fixed JSON transfer format for one Team preset.
 *
 * A shared document carries the parts of a Team that keep working after the
 * document moves to another deployment: the Team's own name and purpose, each
 * agent's name, description, standing system prompt, and accent color, the
 * display-only discovery metadata, and — for an official template — the
 * shipped skill ids it assigns to its role slots. Model routes and tool
 * permissions stay local, because a route names a provider this deployment may
 * not run and an allow-list names tools it may not expose. A document that
 * carries them is refused rather than silently reduced, so a reader never
 * believes it imported something it did not.
 *
 * Version 2 adds `metadata` and `officialSkills` to version 1 without changing
 * any version 1 meaning. The writer emits version 2; the reader accepts both,
 * so a document written before this release still imports. A version 1 reader
 * meeting a version 2 document refuses it as `unsupported-version` instead of
 * guessing — that is why the version is bumped rather than the fields being
 * silently added to version 1.
 *
 * Personal Team Skill assets, member bindings, category membership, and local
 * paths are never part of this document.
 * @module dsh-agent-team-presets/preset-transfer
 */

import type { TeamAgentPreset, TeamCaptainPreset, TeamDisplayMetadata, TeamPreset, TeamSlotPreset } from './types.ts'

/** Format marker every shareable Team document carries. */
export const TEAM_PRESET_FORMAT = 'dsh-agent-team-preset'

/** Format revision this plugin writes. */
export const TEAM_PRESET_FORMAT_VERSION = 2

/** The older revision this plugin still reads. */
export const TEAM_PRESET_FORMAT_VERSION_V1 = 1

/** Members one shared document may declare. */
export const MAX_TRANSFER_MEMBERS = 64

/** Characters one shared document may hold, so one paste cannot exhaust the page. */
export const MAX_TRANSFER_CHARS = 512 * 1024

/** Mutable shape used while one metadata object is assembled. */
type MutableMetadata = {
  summary?: string
  tags?: string[]
  useCases?: string[]
  quickPrompts?: string[]
  notes?: string
}

/** Upper bounds of the display metadata fields. */
export const METADATA_LIMITS = {
  /** Characters in `summary`. */
  summary: 500,
  /** Characters in one tag. */
  tag: 64,
  /** Tags in `tags`. */
  tags: 30,
  /** Characters in one use case. */
  useCase: 200,
  /** Entries in `useCases`. */
  useCases: 20,
  /** Characters in one quick prompt. */
  quickPrompt: 500,
  /** Entries in `quickPrompts`. */
  quickPrompts: 20,
  /** Characters in `notes`. */
  notes: 2000,
  /** Characters across the whole metadata object, JSON-encoded. */
  total: 16 * 1024,
  /** Official skill declarations one document may carry. */
  officialSkills: 16,
} as const

/** The shareable fields of one captain or member slot. */
export type TeamSlotTransfer = {
  /** Display name; a member's name also derives the teammate target. */
  readonly name: string
  /** Short description of the role. */
  readonly description: string
  /** Standing system prompt of the role. */
  readonly systemPrompt: string
  /** Accent color as `#rrggbb`; empty keeps the theme default. */
  readonly color: string
}

/** One official default Team Skill declaration carried by an official template. */
export type OfficialSkillTransfer = {
  /** Shipped skill id; resolvable on another deployment of this plugin version. */
  readonly skillId: string
  /** Exact role name inside the document. */
  readonly roleName: string
}

/** One Team as a shareable document. */
export type TeamPresetTransfer = {
  /** Format marker, so a reader can tell this document from any other JSON. */
  readonly format: typeof TEAM_PRESET_FORMAT
  /** Format revision this document was written under. */
  readonly version: number
  /** The Team's shareable content. */
  readonly team: {
    /** Display name. */
    readonly name: string
    /** What this Team is for. */
    readonly description: string
    /** Display-only discovery metadata, absent in version 1 documents. */
    readonly metadata?: TeamDisplayMetadata
    /** The captain's shareable role. */
    readonly captain: TeamSlotTransfer
    /** Every member's shareable role, in declared order. */
    readonly members: readonly TeamSlotTransfer[]
    /**
     * Official default skill assignments declared by the shipped template.
     * Never carries skill bodies, local bindings, or paths.
     */
    readonly officialSkills?: readonly OfficialSkillTransfer[]
  }
}

/** Why one document was refused. */
export type TeamPresetImportFailure =
  | 'invalid-json'
  | 'invalid-format'
  | 'unsupported-version'
  | 'unsupported-fields'
  | 'duplicate-members'
  | 'too-many-members'
  | 'too-large'
  | 'invalid-metadata'

/** Result of reading one shared document. */
export type TeamPresetImportResult =
  | { readonly ok: true; readonly transfer: TeamPresetTransfer }
  | { readonly ok: false; readonly reason: TeamPresetImportFailure }

/**
 * Keys a document root may carry.
 *
 * Both revisions share this root shape: version 2 only adds fields inside
 * `team`, so one constant serves the reader and no revision can drift.
 */
const ROOT_KEYS = ['format', 'version', 'team'] as const

/** Keys a version 1 shared Team may carry. */
const TEAM_KEYS_V1 = ['name', 'description', 'captain', 'members'] as const

/** Keys a version 2 shared Team may carry. */
const TEAM_KEYS_V2 = ['name', 'description', 'metadata', 'captain', 'members', 'officialSkills'] as const

/** Keys a shared slot may carry. */
const SLOT_KEYS = ['name', 'description', 'systemPrompt', 'color'] as const

/** Keys a metadata object may carry. */
const METADATA_KEYS = ['summary', 'tags', 'useCases', 'quickPrompts', 'notes'] as const

/** Keys an official skill declaration may carry. */
const OFFICIAL_SKILL_KEYS = ['skillId', 'roleName'] as const

/** Internal refusal carrying the reason the document was rejected. */
class Refused extends Error {
  /**
   * @param reason - why the document is not a Team preset of this format.
   */
  constructor(readonly reason: TeamPresetImportFailure) {
    super(reason)
    this.name = 'Refused'
  }
}

/**
 * Whether one parsed value is a plain JSON object.
 * @param value - candidate value.
 * @returns whether the value is a non-null, non-array object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Whether one record carries a key outside the allowed set.
 * @param value - record to inspect.
 * @param allowed - keys this format declares.
 * @returns whether at least one key is not part of the format.
 */
function hasUnknownKey(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).some(key => !allowed.includes(key))
}

/**
 * Read one required string field.
 * @param value - record to read.
 * @param key - field name.
 * @returns the field's text, or undefined when it is absent or not a string.
 */
function readText(value: Record<string, unknown>, key: string): string | undefined {
  const field = value[key]
  return typeof field === 'string' ? field : undefined
}

/**
 * Read an optional string list with a per-entry and per-list bound.
 * @param value - candidate list.
 * @param maxEntries - most entries allowed.
 * @param maxLength - most characters allowed in one entry.
 * @returns the list, or undefined when the field is absent.
 * @throws {Refused} when the field is present but malformed or too large.
 */
function readTextList(value: unknown, maxEntries: number, maxLength: number): string[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new Refused('invalid-metadata')
  if (value.length > maxEntries) throw new Refused('invalid-metadata')
  return value.map((entry) => {
    if (typeof entry !== 'string' || entry.length > maxLength) throw new Refused('invalid-metadata')
    return entry
  })
}

/**
 * Read the optional display metadata of one shared Team.
 *
 * Unknown metadata keys are refused rather than dropped, so a document that
 * carries a field this release does not understand cannot look imported while
 * silently losing it.
 * @param value - candidate metadata object.
 * @returns the metadata, or undefined when absent.
 * @throws {Refused} when the value is malformed, too large, or has unknown keys.
 */
function readMetadata(value: unknown): TeamDisplayMetadata | undefined {
  if (value === undefined) return undefined
  if (!isRecord(value)) throw new Refused('invalid-metadata')
  if (hasUnknownKey(value, METADATA_KEYS)) throw new Refused('unsupported-fields')
  const summary = value['summary']
  const notes = value['notes']
  if (summary !== undefined && (typeof summary !== 'string' || summary.length > METADATA_LIMITS.summary)) throw new Refused('invalid-metadata')
  if (notes !== undefined && (typeof notes !== 'string' || notes.length > METADATA_LIMITS.notes)) throw new Refused('invalid-metadata')
  // Built field by field: `exactOptionalPropertyTypes` forbids assigning an
  // explicit `undefined`, and an absent field must stay absent so the export
  // never writes an empty key back.
  const metadata: MutableMetadata = {}
  if (summary !== undefined) metadata.summary = summary
  if (notes !== undefined) metadata.notes = notes
  const tags = readTextList(value['tags'], METADATA_LIMITS.tags, METADATA_LIMITS.tag)
  if (tags !== undefined) metadata.tags = tags
  const useCases = readTextList(value['useCases'], METADATA_LIMITS.useCases, METADATA_LIMITS.useCase)
  if (useCases !== undefined) metadata.useCases = useCases
  const quickPrompts = readTextList(value['quickPrompts'], METADATA_LIMITS.quickPrompts, METADATA_LIMITS.quickPrompt)
  if (quickPrompts !== undefined) metadata.quickPrompts = quickPrompts
  if (metadataChars(metadata) > METADATA_LIMITS.total) throw new Refused('invalid-metadata')
  return metadata
}

/**
 * Count the characters one metadata object adds to a document.
 * @param metadata - the metadata to measure.
 * @returns its JSON-encoded length.
 */
export function metadataChars(metadata: TeamDisplayMetadata): number {
  return JSON.stringify(metadata).length
}

/**
 * Read the optional official skill declarations of one shared Team.
 * @param value - candidate declaration list.
 * @returns the declarations, or undefined when absent.
 * @throws {Refused} when the list is malformed.
 */
function readOfficialSkills(value: unknown): OfficialSkillTransfer[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.length > METADATA_LIMITS.officialSkills) throw new Refused('invalid-format')
  return value.map((entry) => {
    if (!isRecord(entry) || hasUnknownKey(entry, OFFICIAL_SKILL_KEYS)) throw new Refused('unsupported-fields')
    const skillId = readText(entry, 'skillId')
    const roleName = readText(entry, 'roleName')
    if (skillId === undefined || roleName === undefined || skillId === '' || roleName === '') throw new Refused('invalid-format')
    return { skillId, roleName }
  })
}

/**
 * Read one shared slot.
 * @param value - candidate slot.
 * @returns the slot's shareable fields.
 * @throws {Refused} when the value is not a slot of this format.
 */
function readSlot(value: unknown): TeamSlotTransfer {
  if (!isRecord(value)) throw new Refused('invalid-format')
  if (hasUnknownKey(value, SLOT_KEYS)) throw new Refused('unsupported-fields')
  const name = readText(value, 'name')
  const description = readText(value, 'description')
  const systemPrompt = readText(value, 'systemPrompt')
  const color = readText(value, 'color')
  if (name === undefined || description === undefined || systemPrompt === undefined || color === undefined) {
    throw new Refused('invalid-format')
  }
  return { name, description, systemPrompt, color }
}

/**
 * Read the members of one shared Team, refusing a repeated name.
 *
 * Two members under one name would derive the same teammate target, so the
 * document is refused instead of importing a Team whose second member can never
 * be summoned by name.
 * @param value - candidate member list.
 * @returns the members, in declared order.
 * @throws {Refused} when the list is malformed or repeats a name.
 */
function readMembers(value: unknown): TeamSlotTransfer[] {
  if (!Array.isArray(value)) throw new Refused('invalid-format')
  if (value.length > MAX_TRANSFER_MEMBERS) throw new Refused('too-many-members')
  const members = value.map(member => readSlot(member))
  const seen = new Set<string>()
  for (const member of members) {
    const key = slotNameKey(member.name)
    if (key === '') continue
    if (seen.has(key)) throw new Refused('duplicate-members')
    seen.add(key)
  }
  return members
}

/**
 * Read one shared Team.
 * @param value - candidate Team.
 * @param version - the document revision being read.
 * @returns the Team's shareable content.
 * @throws {Refused} when the value is not a Team of this format.
 */
function readTeam(value: unknown, version: number): TeamPresetTransfer['team'] {
  if (!isRecord(value)) throw new Refused('invalid-format')
  if (hasUnknownKey(value, version >= 2 ? TEAM_KEYS_V2 : TEAM_KEYS_V1)) throw new Refused('unsupported-fields')
  const name = readText(value, 'name')
  const description = readText(value, 'description')
  if (name === undefined || description === undefined) throw new Refused('invalid-format')
  const body: MutableTeamDocument = {
    name,
    description,
    captain: readSlot(value['captain']),
    members: readMembers(value['members']),
  }
  // A version 1 document declares neither field, so neither is read for it:
  // the reader cannot synthesise a value the writer of that revision never
  // agreed to carry.
  if (version >= 2) {
    const metadata = readMetadata(value['metadata'])
    if (metadata !== undefined) body.metadata = metadata
    const officialSkills = readOfficialSkills(value['officialSkills'])
    if (officialSkills !== undefined) body.officialSkills = officialSkills
  }
  return body
}

/**
 * Read one parsed document.
 * @param value - candidate document.
 * @returns the document, or the reason it is not a Team preset of this format.
 * @throws when a failure other than a refusal escapes the reader.
 */
function readTransfer(value: unknown): TeamPresetTransfer {
  if (!isRecord(value)) throw new Refused('invalid-format')
  if (hasUnknownKey(value, ROOT_KEYS)) throw new Refused('unsupported-fields')
  if (value['format'] !== TEAM_PRESET_FORMAT) throw new Refused('invalid-format')
  const version = value['version']
  if (typeof version !== 'number' || !Number.isInteger(version)) throw new Refused('invalid-format')
  if (version !== TEAM_PRESET_FORMAT_VERSION && version !== TEAM_PRESET_FORMAT_VERSION_V1) {
    throw new Refused('unsupported-version')
  }
  return { format: TEAM_PRESET_FORMAT, version, team: readTeam(value['team'], version) }
}

/**
 * Read one already-parsed document.
 * @param value - candidate document.
 * @returns the document, or the reason it is not a Team preset of this format.
 */
export function parseTeamPresetValue(value: unknown): TeamPresetImportResult {
  try {
    return { ok: true, transfer: readTransfer(value) }
  } catch (error: unknown) {
    if (error instanceof Refused) return { ok: false, reason: error.reason }
    throw error
  }
}

/**
 * Read one shared document from its JSON text.
 * @param text - the document text.
 * @returns the document, or the reason it is not a Team preset of this format.
 */
export function parseTeamPresetText(text: string): TeamPresetImportResult {
  if (text.length > MAX_TRANSFER_CHARS) return { ok: false, reason: 'too-large' }
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'invalid-json' }
  }
  return parseTeamPresetValue(value)
}

/**
 * Compare two slot names the way the runtime matches a summoned member.
 *
 * `findMember` accepts a member's derived target or its display name, and the
 * target is the lower-kebab-case form of the name, so two names that differ
 * only by case or surrounding space address the same teammate.
 * @param name - one configured or shared name.
 * @returns the comparison key of that name.
 */
export function slotNameKey(name: string): string {
  return name.trim().toLowerCase()
}

/**
 * Derive a name that is not already taken.
 * @param base - the preferred name.
 * @param taken - names already used in the same scope.
 * @returns the preferred name, or that name with the first free numeric suffix.
 */
export function uniqueName(base: string, taken: Iterable<string>): string {
  const preferred = base.trim()
  const used = new Set([...taken].map(name => name.trim()))
  if (preferred === '' || !used.has(preferred)) return preferred
  let suffix = 2
  while (used.has(`${preferred} ${String(suffix)}`)) suffix += 1
  return `${preferred} ${String(suffix)}`
}

/**
 * Project one slot onto the fields a shared document carries.
 * @param slot - the configured captain or member.
 * @returns the slot's shareable fields.
 */
function shareSlot(slot: TeamSlotPreset): TeamSlotTransfer {
  return {
    name: slot.name,
    description: slot.description,
    systemPrompt: slot.systemPrompt,
    color: slot.color,
  }
}

/**
 * Project one metadata object onto the document, dropping empty fields.
 * @param metadata - the stored metadata.
 * @returns a detached copy with only the fields a document carries.
 */
function shareMetadata(metadata: TeamDisplayMetadata): MutableMetadata {
  const shared: MutableMetadata = {}
  if (metadata.summary !== undefined && metadata.summary !== '') shared.summary = metadata.summary
  if (metadata.tags !== undefined && metadata.tags.length > 0) shared.tags = [...metadata.tags]
  if (metadata.useCases !== undefined && metadata.useCases.length > 0) shared.useCases = [...metadata.useCases]
  if (metadata.quickPrompts !== undefined && metadata.quickPrompts.length > 0) shared.quickPrompts = [...metadata.quickPrompts]
  if (metadata.notes !== undefined && metadata.notes !== '') shared.notes = metadata.notes
  return shared
}

/** Mutable shape of one Team document while it is assembled. */
type MutableTeamDocument = {
  name: string
  description: string
  metadata?: TeamDisplayMetadata
  captain: TeamSlotTransfer
  members: TeamSlotTransfer[]
  officialSkills?: OfficialSkillTransfer[]
}

/** Options accepted when exporting one Team. */
export interface TeamPresetExportOptions {
  /**
   * Official default skill declarations of the shipped template this Team came
   * from. Local assignments are never accepted here.
   */
  readonly officialSkills?: readonly OfficialSkillTransfer[]
}

/**
 * Project one Team onto the document that shares it.
 * @param team - the Team preset to share.
 * @param options - official template declarations, when exporting a builtin Team.
 * @returns the shareable document.
 */
export function exportTeamPreset(team: TeamPreset, options: TeamPresetExportOptions = {}): TeamPresetTransfer {
  const body: MutableTeamDocument = {
    name: team.name,
    description: team.description,
    captain: shareSlot(team.captain),
    members: team.members.map(member => shareSlot(member)),
  }
  const metadata = team.metadata === undefined ? {} : shareMetadata(team.metadata)
  // An all-empty metadata object is omitted rather than written as blanks, so a
  // user Team with no discovery data exports exactly the version 1 shape.
  if (Object.keys(metadata).length > 0) body.metadata = metadata
  const officialSkills = options.officialSkills ?? team.officialSkills
  if (officialSkills !== undefined && officialSkills.length > 0) {
    body.officialSkills = officialSkills.map(entry => ({ skillId: entry.skillId, roleName: entry.roleName }))
  }
  return { format: TEAM_PRESET_FORMAT, version: TEAM_PRESET_FORMAT_VERSION, team: body }
}

/**
 * Serialize one Team as the fixed document this plugin imports.
 * @param team - the Team preset to share.
 * @param options - official template declarations, when exporting a builtin Team.
 * @returns the document text, newline-terminated.
 */
export function serializeTeamPreset(team: TeamPreset, options: TeamPresetExportOptions = {}): string {
  return `${JSON.stringify(exportTeamPreset(team, options), null, 2)}\n`
}

/**
 * Build one captain from a shared slot.
 * @param slot - the shared captain.
 * @returns a captain carrying the shared fields and the local defaults.
 */
export function captainFromTransfer(slot: TeamSlotTransfer): TeamCaptainPreset {
  return {
    name: slot.name,
    color: slot.color,
    description: slot.description,
    toolMode: 'all',
    tools: [],
    systemPrompt: slot.systemPrompt,
  }
}

/**
 * Build one member from a shared slot.
 * @param slot - the shared member.
 * @returns a member carrying the shared fields, no route, and the default tool policy.
 */
export function memberFromTransfer(slot: TeamSlotTransfer): TeamAgentPreset {
  return {
    ...captainFromTransfer(slot),
    id: crypto.randomUUID(),
    provider: '',
    model: '',
    reasoningEffort: '',
  }
}

/**
 * Overwrite the fields one shared slot carries, keeping every local field.
 *
 * This is what makes a replacement non-destructive: the imported name,
 * description, prompt, and color land, while the route and tool policy the
 * deployment already configured stay exactly as they were.
 * @param slot - the configured captain or member being overwritten.
 * @param shared - the document's version of that slot.
 * @returns a slot carrying the shared fields and the original local ones.
 */
export function applySharedFields<T extends TeamSlotPreset>(slot: T, shared: TeamSlotTransfer): T {
  return {
    ...slot,
    name: shared.name,
    description: shared.description,
    systemPrompt: shared.systemPrompt,
    color: shared.color,
  }
}

/**
 * Build one local Team from a shared document.
 *
 * Everything the document does not carry starts empty: routes follow the
 * Session and the tool policy stays unrestricted, so an imported Team never
 * inherits a route or an allow-list from the document it came from.
 * @param transfer - the document to import.
 * @param id - the local identity the imported Team takes.
 * @returns a new Team preset carrying the document's shareable content.
 */
export function teamFromTransfer(transfer: TeamPresetTransfer, id: string): TeamPreset {
  const metadata = transfer.team.metadata
  return {
    id,
    name: transfer.team.name,
    description: transfer.team.description,
    captain: captainFromTransfer(transfer.team.captain),
    members: transfer.team.members.map(member => memberFromTransfer(member)),
    ...transfer.team.officialSkills === undefined ? {} : {
      officialSkills: transfer.team.officialSkills.map(entry => ({ ...entry })),
    },
    ...metadata === undefined ? {} : {
      metadata: {
        ...metadata.summary === undefined ? {} : { summary: metadata.summary },
        ...metadata.tags === undefined ? {} : { tags: [...metadata.tags] },
        ...metadata.useCases === undefined ? {} : { useCases: [...metadata.useCases] },
        ...metadata.quickPrompts === undefined ? {} : { quickPrompts: [...metadata.quickPrompts] },
        ...metadata.notes === undefined ? {} : { notes: metadata.notes },
      },
    },
  }
}

/** Where one document collides with the Teams already configured. */
export type TeamPresetImportConflicts = {
  /** Index of the same-named configured Team, or undefined when the name is free. */
  readonly targetIndex: number | undefined
  /** Display name of that Team, for the dialog that resolves the collision. */
  readonly targetName: string
  /** The document's captain name when the target Team already names its captain that way. */
  readonly captainConflict: string
  /** Shared member names the target Team already uses, in document order. */
  readonly memberConflicts: readonly string[]
  /** Name the document's Team can take when it is added as a new Team. */
  readonly suggestedTeamName: string
  /** Name the document's captain can take when it is renamed. */
  readonly suggestedCaptainName: string
}

/**
 * Find what one document collides with in the configured Teams.
 *
 * Every key is compared inside the Team the document would overwrite: a Team by
 * its name, and its captain and members by theirs. A name only reaches this
 * check when the two Teams are the same one, because replacing a captain or a
 * member of some *other* Team is not an edit the import may make. An unnamed
 * slot never collides: it is addressed by position, not by name.
 * @param teams - every Team the page currently shows.
 * @param transfer - the document being imported.
 * @returns the colliding Team, its conflicting agent names, and free replacement names.
 */
export function importConflicts(
  teams: readonly TeamPreset[],
  transfer: TeamPresetTransfer,
): TeamPresetImportConflicts {
  const key = slotNameKey(transfer.team.name)
  const targetIndex = key === '' ? -1 : teams.findIndex(team => slotNameKey(team.name) === key)
  const target = targetIndex < 0 ? undefined : teams[targetIndex]
  const captainKey = slotNameKey(transfer.team.captain.name)
  const captainConflict = target !== undefined
    && captainKey !== ''
    && slotNameKey(target.captain.name) === captainKey
    ? transfer.team.captain.name
    : ''
  const used = target === undefined
    ? undefined
    : new Set(target.members.map(member => slotNameKey(member.name)).filter(memberKey => memberKey !== ''))
  const memberConflicts = used === undefined
    ? []
    : transfer.team.members
      .filter(member => used.has(slotNameKey(member.name)))
      .map(member => member.name)
  return {
    targetIndex: target === undefined ? undefined : targetIndex,
    targetName: target?.name.trim() ?? '',
    captainConflict,
    memberConflicts,
    suggestedTeamName: uniqueName(transfer.team.name, teams.map(team => team.name)),
    suggestedCaptainName: uniqueName(transfer.team.captain.name, target === undefined ? [] : [target.captain.name]),
  }
}
