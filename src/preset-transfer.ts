/**
 * Fixed JSON transfer format for one Team preset.
 *
 * A shared document carries the parts of a Team that keep working after the
 * document moves to another deployment: the Team's own name and purpose, and
 * each agent's name, description, standing system prompt, and accent color.
 * Model routes and tool permissions stay local, because a route names a
 * provider this deployment may not run and an allow-list names tools it may not
 * expose. A document that carries them is refused rather than silently reduced,
 * so a reader never believes it imported something it did not.
 *
 * The format is deliberately not the stored record: the Host document keeps
 * `toolMode`, `tools`, `provider`, `model`, and `reasoningEffort` beside the
 * shared fields, and an import writes only the fields a document carries.
 * @module dsh-agent-team-presets/preset-transfer
 */

import type { TeamAgentPreset, TeamCaptainPreset, TeamPreset, TeamSlotPreset } from './types.ts'

/** Format marker every shareable Team document carries. */
export const TEAM_PRESET_FORMAT = 'dsh-agent-team-preset'

/** Format revision this plugin writes and the only one it reads. */
export const TEAM_PRESET_FORMAT_VERSION = 1

/** Members one shared document may declare. */
export const MAX_TRANSFER_MEMBERS = 64

/** Characters one shared document may hold, so one paste cannot exhaust the page. */
export const MAX_TRANSFER_CHARS = 512 * 1024

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
    /** The captain's shareable role. */
    readonly captain: TeamSlotTransfer
    /** Every member's shareable role, in declared order. */
    readonly members: readonly TeamSlotTransfer[]
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

/** Result of reading one shared document. */
export type TeamPresetImportResult =
  | { readonly ok: true; readonly transfer: TeamPresetTransfer }
  | { readonly ok: false; readonly reason: TeamPresetImportFailure }

/** Keys a document root may carry. */
const ROOT_KEYS = ['format', 'version', 'team'] as const

/** Keys a shared Team may carry. */
const TEAM_KEYS = ['name', 'description', 'captain', 'members'] as const

/** Keys a shared slot may carry. */
const SLOT_KEYS = ['name', 'description', 'systemPrompt', 'color'] as const

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
 * @returns the Team's shareable content.
 * @throws {Refused} when the value is not a Team of this format.
 */
function readTeam(value: unknown): TeamPresetTransfer['team'] {
  if (!isRecord(value)) throw new Refused('invalid-format')
  if (hasUnknownKey(value, TEAM_KEYS)) throw new Refused('unsupported-fields')
  const name = readText(value, 'name')
  const description = readText(value, 'description')
  if (name === undefined || description === undefined) throw new Refused('invalid-format')
  return {
    name,
    description,
    captain: readSlot(value['captain']),
    members: readMembers(value['members']),
  }
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
  if (version !== TEAM_PRESET_FORMAT_VERSION) throw new Refused('unsupported-version')
  return { format: TEAM_PRESET_FORMAT, version: TEAM_PRESET_FORMAT_VERSION, team: readTeam(value['team']) }
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
 * Project one Team onto the document that shares it.
 * @param team - the Team preset to share.
 * @returns the shareable document.
 */
export function exportTeamPreset(team: TeamPreset): TeamPresetTransfer {
  return {
    format: TEAM_PRESET_FORMAT,
    version: TEAM_PRESET_FORMAT_VERSION,
    team: {
      name: team.name,
      description: team.description,
      captain: shareSlot(team.captain),
      members: team.members.map(member => shareSlot(member)),
    },
  }
}

/**
 * Serialize one Team as the fixed document this plugin imports.
 * @param team - the Team preset to share.
 * @returns the document text, newline-terminated.
 */
export function serializeTeamPreset(team: TeamPreset): string {
  return `${JSON.stringify(exportTeamPreset(team), null, 2)}\n`
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
  return {
    id,
    name: transfer.team.name,
    description: transfer.team.description,
    captain: captainFromTransfer(transfer.team.captain),
    members: transfer.team.members.map(member => memberFromTransfer(member)),
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
