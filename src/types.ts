/**
 * Shared Team preset records.
 *
 * The Host schema, the browser settings page, and the per-Session selection
 * all read these types; the module imports nothing so both build faces can
 * consume it.
 * @module dsh-agent-team-presets/types
 */

/** Fields a Team slot carries whether it is the captain or one summoned member. */
export type TeamSlotPreset = {
  /** Display name shown in Settings and in the captain's roster. */
  name: string
  /** Accent color as `#rrggbb`; empty keeps the theme default. */
  color: string
  /** Short description of the role, shown in Settings and given to the captain. */
  description: string
  /** Independent tool policy; absent in legacy records infers custom from a nonempty list. */
  toolMode?: 'all' | 'custom'
  /** Tool allow-list in custom mode, including exact-Agent Team tools; empty denies all. */
  tools: readonly string[]
  /**
   * Standing system prompt for this agent. Registered as a prompt section
   * template, so complete `{{variable}}` groups interpolate against registered
   * prompt variables and an unknown variable fails the request loud.
   */
  systemPrompt: string
}

/**
 * The Team captain: the agent that leads the Session.
 *
 * The captain runs on the model the Session already selected, so it holds no
 * route of its own and no setting can change the Session's model.
 */
export type TeamCaptainPreset = TeamSlotPreset

/** One summoned member: a slot plus the route that member runs on. */
export type TeamAgentPreset = TeamSlotPreset & {
  /** Stable role identity, independent of name, order, and runtime instances. */
  id?: string
  /** LLM provider route id; empty runs the member on the Session route. */
  provider: string
  /** Provider-owned model id; empty runs the member on the Session model. */
  model: string
  /** Adapter-owned reasoning effort; empty keeps the model default. */
  reasoningEffort: string
}

/** One reusable Team preset. */
export type TeamPreset = {
  /** Stable identity a Session selection references. */
  id: string
  /** Display name. */
  name: string
  /** What this Team is for; shown in Settings and to its captain. */
  description: string
  /** Agent that leads the Session and summons members. */
  captain: TeamCaptainPreset
  /** Role templates the captain summons by name. */
  members: readonly TeamAgentPreset[]
  /**
   * Display-only discovery metadata.
   *
   * Never read by the runtime composition path: no prompt, briefing, roster,
   * spawn description, or model message is built from it. It exists for the
   * Settings page and the composer, and it travels with the shareable preset.
   */
  metadata?: TeamDisplayMetadata
  /** Portable declarations of shipped skills; never personal asset bindings. */
  officialSkills?: readonly { readonly skillId: string; readonly roleName: string }[]
}

/** One Session's active Team preset. */
export type TeamSelectionRecord = {
  /** Session identity the selection belongs to. */
  sessionId: string
  /** Selected Team identity. */
  teamId: string
  /**
   * Stable identity of the member this Session talks to individually.
   *
   * Absent means the Team's captain leads the Session, exactly as a Team
   * selection always did. When present it names one member slot of {@link teamId}:
   * that member's persona, tool policy, Team Skills, and configured model route
   * are injected into this Session, and the Session stops being a Team Lead.
   * The captain never changes the Session's model, so a selection naming the
   * captain is stored as no role at all.
   */
  roleId?: string
}

/** The user-owned Team preset section this plugin projects to the browser. */
export type TeamPresetsSection = {
  /** Every configured Team preset. */
  teams: readonly TeamPreset[]
  /** Every Session's active Team preset. */
  selections: readonly TeamSelectionRecord[]
}

/** One tool a Team member's allow-list may name. */
export type ToolChoice = {
  /** Capability name the strict execution policy accepts verbatim. */
  name: string
  /** Model-facing description, shown as the checkbox hover text. */
  description: string
  /**
   * Whether only the captain can exercise this capability.
   *
   * The Team service enforces this for `interrupt_agent` (a member call is
   * refused with `TEAM_LEAD_REQUIRED`), and this plugin registers the preset
   * tools on the Session root only. A member that selects such a name still
   * cannot use it, so the page must say so instead of offering it as grantable.
   */
  captainOnly?: boolean
  /**
   * Which upstream source the capability was attributed to.
   *
   * The tool registry records no registering package: `register()` stores a
   * definition under its tool name with a fixed label, so "native Harness" and
   * "some third-party plugin" are not separable. Only two attributions are
   * deterministic — this plugin's own registrations, and MCP tools, whose
   * `mcp__<server>__<name>` form the Harness itself generates. Everything else
   * is reported as `other` rather than guessed at.
   */
  source: ToolSource
  /** MCP server name; present only when {@link source} is `mcp`. */
  server?: string
}

/** The upstream source a listed capability could be attributed to. */
export type ToolSource =
  /** A capability this plugin registers. */
  | 'presets'
  /** A tool an MCP server exposes, named `mcp__<server>__<name>` by the Harness. */
  | 'mcp'
  /** Everything else: native Harness tools and third-party plugin tools, which the registry cannot tell apart. */
  | 'other'

/** Catalog of restrictable tools for one deployment. */
export type ToolCatalogValue = {
  /** Union of deployment preset/global and fixed Team capability names. */
  tools: readonly ToolChoice[]
}

/**
 * How one Team's execution state reads to the settings page.
 *
 * `idle` is a positive finding — every online Session that references the Team
 * was inspected and none is running a Team task. `unknown` means the Host could
 * not decide, so the page must never present it as idle.
 */
export type TeamExecutionState = 'idle' | 'busy' | 'unknown'

/** One Team's live execution state, aggregated over the online Sessions. */
export type TeamExecutionRow = {
  /** Team identity the row describes. */
  teamId: string
  /** Whether the Team is executing, known idle, or undecidable. */
  state: TeamExecutionState
  /** Online Sessions running a Team task on it. */
  busySessions: number
  /** Teammates running or provisioning across those Sessions. */
  executingMembers: number
  /**
   * Sessions whose applied definition or selection the next Team task has not
   * adopted yet. A member route or accent color saved meanwhile is read live,
   * so it is no reason to wait.
   */
  pendingSessions: number
  /**
   * Disclosures about how the applied Team runs, in a stable order.
   *
   * An empty list means no applied Session needed one. The only note today says
   * that a Team whose custom tool policy needed a native surface overrode the
   * Session's PTC batch-calling presentation, which the page must state instead
   * of claiming the preset's transport is intact.
   */
  notes: readonly string[]
}

/** Whole-set frame of the Team execution stream. */
export type TeamExecutionSnapshot = {
  /** One row per Team the Host reports, ordered by Team identity. */
  teams: readonly TeamExecutionRow[]
}

/** One preset member the header roster can show. */
export interface TeamRosterMemberView {
  /** Teammate target inside its Team. */
  readonly name: string
  /** Display name the Team configured. */
  readonly displayName: string
  /** Role description the Team configured. */
  readonly description: string
  /** Stable member identity inside the preset, when it carries one. */
  readonly roleId?: string
  /** Durable child Session identity, once the member was created. */
  readonly childSessionId?: string
  /** Whether the row is the Team Lead that carries this Session, or a teammate. */
  readonly role: 'captain' | 'member'
  /** Whether the member is running right now. */
  readonly status: 'running' | 'idle'
  /** The route this member was frozen with, when it configured one. */
  readonly route?: { readonly provider: string; readonly model: string; readonly reasoningEffort: string }
  /** Model the row runs on when it has no frozen route (the Lead uses the Session's). */
  readonly model?: string
}

/** Every preset member one Session's Team has summoned. */
export interface TeamRosterValue {
  readonly members: readonly TeamRosterMemberView[]
}

/** The fixed official series a shipped Team belongs to. */
export type TeamSeries =
  /** The original research-and-development scale series (three Teams). */
  | 'classic-development'
  /** The work-mode series contributed by PR #1 (six Teams). */
  | 'work-modes'

/**
 * Where a Team came from, as a read-only fact the UI may filter on.
 *
 * This is derived from the stable builtin catalog, never from a user-editable
 * field, so an imported document cannot claim to be a shipped preset.
 */
export type TeamSource = 'builtin' | 'custom'

/**
 * Display-only Team metadata.
 *
 * Every field is optional and none of it reaches a System Prompt, a captain or
 * member briefing, the member roster, the spawn tool description, or any model
 * message. It exists for the Settings page and the composer to help a human
 * find a Team, and it travels with the shareable preset document.
 */
export type TeamDisplayMetadata = {
  /** One-sentence purpose, shorter than the runtime `description`. */
  summary?: string
  /** Free-form discovery tags. */
  tags?: readonly string[]
  /** Situations this Team is meant for. */
  useCases?: readonly string[]
  /** Example tasks the user can copy into the composer. */
  quickPrompts?: readonly string[]
  /** Extra caveats for a human reader. */
  notes?: string
}

/** One user-created logical grouping of Teams; local UI data only. */
export type TeamCategory = {
  /** Stable identity; renaming never changes it. */
  id: string
  /** Display name. */
  name: string
  /** Sort order among categories; ascending. */
  order: number
}

/** Assignment of one Team to one user category, by stable Team identity. */
export type TeamCategoryAssignment = {
  /** Team identity the assignment points at. */
  teamId: string
  /** Category identity; an assignment to a missing category is ignored. */
  categoryId: string
}

/** Origin bucket of one Team Skill asset. */
export type TeamSkillOrigin =
  /** Shipped with the plugin package, read-only. */
  | 'builtin'
  /** Created or imported by the user. */
  | 'custom'
  /** A user-owned editable copy derived from a shipped skill. */
  | 'override'

/** One file of a Team Skill folder. */
export type TeamSkillFile = {
  /** POSIX-relative path inside the skill folder. */
  path: string
  /** Byte length. */
  size: number
  /** SHA-256 of the bytes, lowercase hex. */
  sha256: string
  /** Whether the bytes are UTF-8 text this UI may edit. */
  text: boolean
}

/** Dependency declaration of one Team Skill (plugin-side registry data). */
export type TeamSkillDependencies = {
  /** MCP servers the skill's method expects; never auto-connected. */
  mcpServers: readonly {
    serverName: string
    required: boolean
    capabilities?: readonly ('tools' | 'resources')[]
    toolNames?: readonly string[]
  }[]
  /** Executables the scripts expect, such as `python3`. */
  executables: readonly string[]
  /** Other Team Skill ids this asset explicitly depends on. */
  otherSkills: readonly string[]
}

/** One version-pinned Team Skill asset. */
export type TeamSkillAsset = {
  /** Stable asset identity: `builtin:<skillId>`, `custom:<uuid>`, or `override:<uuid>`. */
  id: string
  /** Skill name used by the model, kebab-case. */
  skillId: string
  /** Frontmatter description. */
  description: string
  origin: TeamSkillOrigin
  /** Asset version string. */
  version: string
  /** Official skill id this asset is, or is an override of. */
  officialSkillId?: string
  /** For an override: the official version it was derived from. */
  baseVersion?: string
  /** Whole-folder SHA-256 digest. */
  digest: string
  /** Every file of the folder, relative-path ordered. */
  files: readonly TeamSkillFile[]
  /** Declared dependencies. */
  dependencies: TeamSkillDependencies
  /** Whether the shipped official asset this overrides has a newer version. */
  updateAvailable?: boolean
  /** Epoch milliseconds of the last local write. */
  updatedAt: number
}

/** One `(teamId, roleId)` assignment of a Team Skill asset. */
export type TeamSkillBinding = {
  /** Team identity. */
  teamId: string
  /** Stable member role identity; `captain` for the captain slot. */
  roleId: string
  /** Whether this binding targets the captain rather than a member. */
  captain?: boolean
  /** Asset identity the role receives. */
  assetId: string
}

/** One role's binding summary for the settings UI. */
export type TeamSkillBindingSummary = {
  /** Team identity. */
  teamId: string
  /** Display name of the Team, for dependency dialogs. */
  teamName: string
  /** Role identity. */
  roleId: string
  /** Display name of the role. */
  roleName: string
  /** Whether this is the captain slot. */
  captain: boolean
}

/** One Team Skill row as the settings page lists it. */
export type TeamSkillSummary = {
  /** Asset identity. */
  id: string
  /** Skill name. */
  skillId: string
  /** Description. */
  description: string
  /** Origin bucket. */
  origin: TeamSkillOrigin
  /** Asset version. */
  version: string
  /** Number of role bindings. */
  bindingCount: number
  /** Whether a newer official version exists for an override. */
  updateAvailable: boolean
  /** Whether the folder passed its stored digest check. */
  intact: boolean
}

/** Full Team Skill detail for the settings page. */
export type TeamSkillDetail = TeamSkillSummary & {
  /** Every file, relative-path ordered. */
  files: readonly TeamSkillFile[]
  /** Declared dependencies. */
  dependencies: TeamSkillDependencies
  /** Roles currently bound to this asset. */
  bindings: readonly TeamSkillBindingSummary[]
  /** For an override: the official asset it shadows. */
  officialAssetId?: string
  /** For an override: the official version currently shipped. */
  officialVersion?: string
}

/** One file payload sent from the browser to import a skill folder. */
export type TeamSkillImportFile = {
  /** POSIX-relative path inside the imported folder. */
  path: string
  /** Base64 of the bytes. */
  base64: string
}

/** Result of one import or create operation. */
export type TeamSkillMutationResult =
  | { readonly ok: true; readonly asset: TeamSkillDetail }
  | { readonly ok: false; readonly reason: string; readonly detail?: string }

/** Why a Team Skill delete was refused. */
export type TeamSkillDeleteBlocker =
  | { readonly kind: 'binding'; readonly bindings: readonly TeamSkillBindingSummary[] }
  | { readonly kind: 'active'; readonly sessions: readonly string[] }
  | { readonly kind: 'dependency'; readonly dependents: readonly string[] }
  | { readonly kind: 'official' }

/** Result of one delete attempt. */
export type TeamSkillDeleteResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly blockers: readonly TeamSkillDeleteBlocker[] }

/** Search hit produced by the deterministic local search model. */
export type TeamSearchHit = {
  /** Team identity. */
  teamId: string
  /** Match score; higher is better. Stable and explainable. */
  score: number
  /** Which fields matched, in a fixed order. */
  fields: readonly ('name' | 'tags' | 'summary' | 'useCases' | 'quickPrompts' | 'notes')[]
}

/** One role a binding can address. */
export interface TeamSkillRoleView {
  /** Role identity used in a binding. */
  readonly id: string
  /** Display name shown in the page. */
  readonly name: string
  /** Whether this is the captain slot. */
  readonly captain: boolean
}

/** One Team the binding dialog can address. */
export interface TeamSkillTeamView {
  /** Team identity. */
  readonly id: string
  /** Display name. */
  readonly name: string
  /** The captain slot plus every member slot, in Team order. */
  readonly roles: readonly TeamSkillRoleView[]
}

/** One role currently holding an asset. */
export interface TeamSkillBindingView {
  /** Team identity. */
  readonly teamId: string
  /** Team display name. */
  readonly teamName: string
  /** Role identity. */
  readonly roleId: string
  /** Role display name. */
  readonly roleName: string
  /** Whether the holder is the captain. */
  readonly captain: boolean
}

/** One asset as the page lists it. */
export interface TeamSkillAssetView {
  /** Asset identity. */
  readonly id: string
  /** Kebab-case skill name. */
  readonly skillId: string
  /** Frontmatter description. */
  readonly description: string
  /** Where the asset came from. */
  readonly origin: string
  /** Immutable version currently served. */
  readonly version: string
  /** Shipped skill this override started from, when it is an override. */
  readonly officialSkillId?: string
  /** Whether the shipped copy has moved past this override. */
  readonly updateAvailable?: boolean
  /** Whether the page may edit it. */
  readonly editable: boolean
  /** File count. */
  readonly fileCount: number
  /** Total bytes. */
  readonly totalBytes: number
  /** Declared dependencies (MCP servers, executables, other skills). */
  readonly mcpServers: readonly string[]
  /** Other assets that reuse the same skill name under a different origin. */
  readonly clashesWith?: readonly string[]
  /** Every role holding it. */
  readonly bindings: readonly TeamSkillBindingView[]
}

/** The whole library, as one page load. */
export interface TeamSkillLibraryView {
  /** Absolute private root, shown so the user can open it in a file manager. */
  readonly root: string
  /** Every asset, name-ordered. */
  readonly assets: readonly TeamSkillAssetView[]
  /** Every Team and its addressable roles. */
  readonly teams: readonly TeamSkillTeamView[]
  /** Shipped skill ids this deployment provides. */
  readonly official: readonly string[]
  /** Why the store is unusable, when this deployment could not open it. */
  readonly issue?: string
}

/** One file of an asset. */
export interface TeamSkillFileView {
  /** POSIX-relative path inside the asset. */
  readonly path: string
  /** Byte length. */
  readonly size: number
  /** Whether the page may show it as text. */
  readonly text: boolean
}

/** One asset with its file list and instruction body. */
export interface TeamSkillDetailView {
  /** The asset row. */
  readonly asset: TeamSkillAssetView
  /** Every file, path-ordered. */
  readonly files: readonly TeamSkillFileView[]
  /** The `SKILL.md` body, without frontmatter. */
  readonly body: string
  /** Absolute directory holding this version's files, as the store named it. */
  readonly directory: string
  /** Declared dependencies, with the executable check that can be made here. */
  readonly dependencies?: {
    readonly executables: readonly { readonly name: string; readonly found: boolean }[]
    readonly mcpServers: readonly string[]
    readonly mcpDeclarations?: TeamSkillDependencies['mcpServers']
    readonly unverified?: readonly string[]
    readonly otherSkills?: readonly { readonly id: string; readonly found: boolean }[]
  }
}

/** Why a management call was refused. */
export interface TeamSkillRefusalView {
  /** `ok` is always false here, so a caller can branch on it. */
  readonly ok: false
  /** Machine-readable reason. */
  readonly reason: string
  /** Human-readable detail, already specific. */
  readonly detail: string
}

/** Result of a delete attempt. */
export interface TeamSkillDeleteView {
  /** Whether the asset is gone. */
  readonly ok: boolean
  /** Everything that blocked it, so the page can list them all. */
  readonly blockers: readonly { readonly kind: string; readonly detail: string }[]
  /** Advisory text matches that did not block. */
  readonly warnings: readonly string[]
}

/** One folder the import-directory scan examined. */
export interface TeamSkillScanEntry {
  /** Folder name inside the scan root. */
  readonly folder: string
  /** Whether it was imported, already present, or refused. */
  readonly status: 'imported' | 'existing' | 'invalid'
  /** Skill name read from its `SKILL.md`, when the folder was readable. */
  readonly skillId?: string
  /** Asset identity for an imported or already-present skill. */
  readonly assetId?: string
  /** Machine-readable refusal reason, or `duplicate` for an existing name. */
  readonly reason?: string
  /** Path or other detail that explains the reason. */
  readonly detail?: string
}

/** Result of preparing the private import directory for a file-manager gesture. */
export interface TeamSkillImportFolderView {
  /** This answer prepared the directory. */
  readonly ok: true
  /** Private library root that owns the folder. */
  readonly root: string
  /** Absolute import directory, created when it was missing. */
  readonly path: string
}

/** Result of one scan of the private import directory. */
export interface TeamSkillScanView {
  /** This answer is a completed scan. */
  readonly ok: true
  /** Absolute directory that was scanned. */
  readonly root: string
  /** Folders examined. */
  readonly scanned: number
  /** Folders published as new custom assets. */
  readonly imported: number
  /** Folders whose skill name already exists in the library. */
  readonly existing: number
  /** Folders refused with a reason. */
  readonly invalid: number
  /** One row per folder, in name order. */
  readonly entries: readonly TeamSkillScanEntry[]
}

