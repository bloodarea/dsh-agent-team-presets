/**
 * Pure Team preset edits behind the model-facing preset tools.
 *
 * An edit replaces the stored preset only: the caller persists the returned
 * Team through the settings document, and the plugin's existing volatile
 * reconcile applies it. Nothing here reads or writes a live Session, so one
 * edit is testable without one.
 * @module dsh-agent-team-presets/preset-editor
 */
import type { TeamPreset } from './types.ts';
/** Longest member description the teammate roster accepts when it spawns that member. */
export declare const MEMBER_DESCRIPTION_LIMIT = 200;
/** One member edit, addressed the way the captain summons that member. */
export interface TeamMemberEdit {
    /** Member display name, or the teammate target the roster summons it under. */
    readonly member: string;
    /** Replacement role description; omitted keeps the stored one. */
    readonly description?: string;
    /** Replacement standing system prompt; omitted keeps the stored one. */
    readonly systemPrompt?: string;
}
/** The preset fields one edit may replace. */
export interface TeamPresetEdit {
    /** Replacement Team purpose; omitted keeps the stored one. */
    readonly description?: string;
    /** Replacement captain description; omitted keeps the stored one. */
    readonly captainDescription?: string;
    /** Replacement captain standing system prompt; omitted keeps the stored one. */
    readonly captainSystemPrompt?: string;
    /** Member edits, each addressed by display name or teammate target. */
    readonly members?: readonly TeamMemberEdit[];
}
/** One refused edit: the model-facing reason, already naming what the caller may pass. */
export interface TeamPresetEditRefusal {
    readonly ok: false;
    /** Why the edit was refused, written for the model that requested it. */
    readonly message: string;
}
/** One applied edit: the next preset and the field paths it actually replaced. */
export interface TeamPresetEditApplied {
    readonly ok: true;
    /** The next preset. The input preset is never mutated. */
    readonly team: TeamPreset;
    /** Field paths the edit replaced; empty when every supplied value already matched. */
    readonly changed: readonly string[];
}
/** Outcome of applying one edit to one stored Team preset. */
export type TeamPresetEditResult = TeamPresetEditApplied | TeamPresetEditRefusal;
/**
 * Apply one field edit to one Team preset.
 *
 * A member entry resolves exactly the way `spawn_team_member` resolves its
 * `member` argument, so the name that summons a member is the name that edits
 * it. Supplying a value the preset already holds is not a change: the path is
 * left out of `changed`, and a call whose every value already matched returns
 * an unchanged preset so the caller can skip the write.
 * @param team - the stored preset to edit.
 * @param edit - the fields to replace.
 * @returns the next preset with the field paths it changed, or the refusal reason.
 */
export declare function editTeamPreset(team: TeamPreset, edit: TeamPresetEdit): TeamPresetEditResult;
/**
 * Report the first interpolation failure one candidate prompt text would cause.
 *
 * A Team prompt is registered as an interpolated prompt section (the captain's
 * as the Session persona prefix, a member's as that teammate's persona), so a
 * group that cannot resolve does not degrade the prompt — it fails the next
 * request outright. A stored prompt is never revalidated before that request,
 * which is why a preset write refuses one instead of persisting it while a
 * Session is running. The scan mirrors the registry's own so the two agree.
 * @param text - the candidate captain or member standing prompt.
 * @param variables - the variables one assembly resolved for the calling Agent.
 * @returns the failure text, or undefined when the text interpolates cleanly.
 */
export declare function promptTemplateFailure(text: string, variables: Readonly<Record<string, string | undefined>>): string | undefined;
//# sourceMappingURL=preset-editor.d.ts.map