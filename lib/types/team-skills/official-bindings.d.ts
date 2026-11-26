import type { OfficialSkillBinding } from '../team-catalog.ts';
import type { TeamPreset } from '../types.ts';
/** Skills shipped under `assets/skills`, including assets missing from this installation. */
export declare const OFFICIAL_SKILL_IDS: readonly ["agent-leader-communication", "leader-medium-task-workflow", "leader-long-task-orchestration", "leader-worker-continuity", "agent-subagent-orchestration", "fullstack-advisor", "executor-short-task-workflow", "github-repository-presentation", "git-release-hygiene", "frontend-engineering-workflow", "backend-architecture-workflow", "independent-code-review-workflow", "grilling", "research"];
/** The binding slot reserved for a captain. */
export declare const CAPTAIN_ROLE = "captain";
/** Shipped identities always use the catalog, including records from earlier releases. */
export declare function officialSkillDefaults(team: Pick<TeamPreset, 'id' | 'officialSkills'>): {
    readonly source: 'catalog' | 'preset';
    readonly declarations: readonly OfficialSkillBinding[];
};
/** A declaration can address only an unambiguous name and an unambiguous binding slot. */
export declare function officialSkillTarget(team: Pick<TeamPreset, 'captain' | 'members'>, declaration: OfficialSkillBinding): {
    readonly status: 'valid';
    readonly roleId: string;
    readonly assetId: string;
} | {
    readonly status: 'unknown-skill' | 'missing-role' | 'ambiguous-role';
};
/** A default can seed only the shipped asset with the declared identity. */
export declare function isOfficialSkillAsset(asset: {
    readonly id: string;
    readonly origin: string;
}, assetId: string): boolean;
/** A role that already holds a derived override keeps its explicit assignment. */
export declare function isOfficialSkillOverride(asset: {
    readonly origin: string;
    readonly officialSkillId?: string;
}, skillId: string): boolean;
