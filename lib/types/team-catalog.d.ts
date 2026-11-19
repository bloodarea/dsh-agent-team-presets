/**
 * The single official catalog of Teams this plugin ships.
 *
 * v0.1.6 ships nine presets in two fixed series: the three original
 * research-and-development Teams and the six work-mode Teams contributed in
 * PR #1. The catalog is the authority for a fresh install, for migration, for
 * "restore defaults", and for the read-only source/series facts the Settings
 * page filters on. It is deliberately separate from the stored Team records:
 * a stored Team is the user's copy and may drift, while this catalog never
 * changes except when a plugin release changes it.
 *
 * Each entry carries its display metadata. Metadata is presentation-only and
 * is never read by the runtime composition path (see `src/types.ts`).
 * @module dsh-agent-team-presets/team-catalog
 */
import type { TeamDisplayMetadata, TeamSeries } from './types.ts';
import type { TeamPresetTransfer } from './preset-transfer.ts';
/** One official Team: stable identity, fixed series, shipped document, display metadata. */
export interface BuiltinTeamCatalogEntry {
    /** Stable identity every stored copy keeps across upgrades. */
    readonly id: string;
    /** Fixed official series this Team belongs to. */
    readonly series: TeamSeries;
    /** Shareable document the Team is installed and restored from. */
    readonly document: TeamPresetTransfer;
    /** Presentation-only discovery metadata. */
    readonly metadata: TeamDisplayMetadata;
    /**
     * Official default Team Skill assignments, expressed by stable skill id and
     * role name so a document can be resolved on another deployment.
     */
    readonly officialSkillBindings: readonly OfficialSkillBinding[];
}
/** One official default binding of a shipped skill to a role slot. */
export interface OfficialSkillBinding {
    /** Shipped skill id, matching the package's `assets/skills/<id>` folder. */
    readonly skillId: string;
    /** Role name inside the shipped document. */
    readonly roleName: string;
}
/**
 * The shipped delivery skills, assigned by default only to the
 * `repository-specialist` role of the Teams that own repository delivery work.
 *
 * A user may add or remove assignments locally; those local changes are not
 * part of the preset document. This declaration is.
 */
export declare const OFFICIAL_REPOSITORY_SKILLS: readonly OfficialSkillBinding[];
/**
 * The leader workflow skills, assigned by default to the `team-lead` captain of
 * every software engineering Team: dispatching and reporting, the bounded
 * medium-task board, the long-running delivery plan, and the subagent
 * orchestration rules a captain needs before it may explore in parallel.
 */
export declare const OFFICIAL_LEADER_SKILLS: readonly OfficialSkillBinding[];
/**
 * The advisory workflow skill, assigned by default to the `fullstack-advisor`
 * role. The advisor stays single-threaded, so it never receives the subagent
 * orchestration skill.
 */
export declare const OFFICIAL_ADVISOR_SKILLS: readonly OfficialSkillBinding[];
/**
 * The delivery skills, assigned by default to the `executor` role of software
 * engineering Teams: the bounded implementation workflow, the parallel
 * work-package orchestration rules, and the two repository delivery skills.
 */
export declare const OFFICIAL_DEVELOPMENT_EXECUTOR_SKILLS: readonly OfficialSkillBinding[];
/**
 * The default assignments of a software engineering Team that carries an
 * advisory role: leader, advisor, then executor. `agent-subagent-orchestration`
 * is deliberately bound to two roles and to no third one.
 */
export declare const OFFICIAL_DEVELOPMENT_SKILLS: readonly OfficialSkillBinding[];
/**
 * The professional-role workflows, one main skill per specialist role: the
 * UI frontend engineer, the backend architect, and the independent reviewer.
 *
 * Each is a progressive-loading entry point — the detailed methods live in its
 * own `references/` folder and are read on demand, never registered as skills
 * of their own. The reviewer keeps the subagent orchestration rules because a
 * large, high-risk review may fan out; the two advisory-side roles never
 * dispatch.
 */
export declare const OFFICIAL_PROFESSIONAL_SKILLS: readonly OfficialSkillBinding[];
/**
 * The reviewer's bindings alone.
 *
 * The 标准研发团队 has no specialist role, so it declares the leader, advisor,
 * executor, and reviewer defaults and nothing that names a role it does not
 * carry — a declaration with no matching role would never resolve, and the
 * catalog is what the Host reconciles against.
 */
export declare const OFFICIAL_STANDARD_SKILLS: readonly OfficialSkillBinding[];
/**
 * The default assignments of the 全栈软件研发团队, whose advisor work is split
 * into two specialist roles: leader, the frontend and backend workflows, the
 * reviewer pair, and the executor's own delivery skills. There is no single
 * `fullstack-advisor` binding, because that Team does not carry that role.
 */
export declare const OFFICIAL_SPECIALIST_SKILLS: readonly OfficialSkillBinding[];
/**
 * The method skills assigned by default to the 需求探索 team: grilling to the
 * captain, and research to the two scouting roles that gather evidence for it.
 */
export declare const OFFICIAL_DISCOVERY_SKILLS: readonly OfficialSkillBinding[];
/** The method skill assigned by default to the 科研协作 team's evidence scout. */
export declare const OFFICIAL_RESEARCH_SKILLS: readonly OfficialSkillBinding[];
/** Series display order and stable identity. */
export declare const TEAM_SERIES: readonly {
    readonly id: TeamSeries;
    readonly order: number;
}[];
/** Every official Team, in install order: the three development Teams, then the six work modes. */
export declare const BUILTIN_TEAM_CATALOG: readonly BuiltinTeamCatalogEntry[];
/** Every official Team identity, in install order. */
export declare const BUILTIN_TEAM_IDS: readonly string[];
/**
 * Look up one official Team by identity.
 * @param id - Team identity.
 * @returns the catalog entry, or undefined for a custom Team.
 */
export declare function builtinEntry(id: string): BuiltinTeamCatalogEntry | undefined;
/**
 * Resolve the official series of one Team identity.
 * @param id - Team identity.
 * @returns its fixed series, or undefined for a custom Team.
 */
export declare function teamSeriesOf(id: string): TeamSeries | undefined;
