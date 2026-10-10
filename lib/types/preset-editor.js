/**
 * Pure Team preset edits behind the model-facing preset tools.
 *
 * An edit replaces the stored preset only: the caller persists the returned
 * Team through the settings document, and the plugin's existing volatile
 * reconcile applies it. Nothing here reads or writes a live Session, so one
 * edit is testable without one.
 * @module dsh-agent-team-presets/preset-editor
 */
import { memberTargets } from "./presets.js";
/** Longest member description the teammate roster accepts when it spawns that member. */
export const MEMBER_DESCRIPTION_LIMIT = 200;
/** Refusal text for a call that names no editable field at all. */
const NO_FIELDS = 'no editable field was supplied; pass team_description, captain_description, captain_system_prompt, or members';
/**
 * Whether one edit supplies any editable field.
 * @param edit - the requested edit.
 * @returns whether the caller named at least one field or member entry.
 */
function suppliesField(edit) {
    return edit.description !== undefined
        || edit.captainDescription !== undefined
        || edit.captainSystemPrompt !== undefined
        || (edit.members?.length ?? 0) > 0;
}
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
export function editTeamPreset(team, edit) {
    if (!suppliesField(edit))
        return { ok: false, message: NO_FIELDS };
    const changed = [];
    let description = team.description;
    if (edit.description !== undefined && edit.description !== description) {
        description = edit.description;
        changed.push('team.description');
    }
    const captain = { ...team.captain };
    if (edit.captainDescription !== undefined && edit.captainDescription !== captain.description) {
        captain.description = edit.captainDescription;
        changed.push('captain.description');
    }
    if (edit.captainSystemPrompt !== undefined && edit.captainSystemPrompt !== captain.systemPrompt) {
        captain.systemPrompt = edit.captainSystemPrompt;
        changed.push('captain.systemPrompt');
    }
    const members = team.members.map(member => ({ ...member }));
    const roster = memberTargets({ ...team, members });
    for (const entry of edit.members ?? []) {
        const wanted = entry.member.trim();
        const at = roster.findIndex(row => row.target === wanted.toLowerCase() || row.member.name.trim() === wanted);
        const row = roster[at];
        if (row === undefined) {
            const targets = roster.map(candidate => candidate.target).join(', ');
            return { ok: false, message: `unknown Team member "${entry.member}"; available members: ${targets === '' ? '(none)' : targets}` };
        }
        const current = members[at] ?? row.member;
        const updated = { ...current };
        if (entry.description !== undefined) {
            if (entry.description.length > MEMBER_DESCRIPTION_LIMIT) {
                return {
                    ok: false,
                    message: `member "${row.target}" description is ${String(entry.description.length)} characters; the teammate roster accepts at most ${String(MEMBER_DESCRIPTION_LIMIT)}`,
                };
            }
            if (entry.description !== updated.description) {
                updated.description = entry.description;
                changed.push(`member:${row.target}.description`);
            }
        }
        if (entry.systemPrompt !== undefined && entry.systemPrompt !== updated.systemPrompt) {
            updated.systemPrompt = entry.systemPrompt;
            changed.push(`member:${row.target}.systemPrompt`);
        }
        if (updated.description !== current.description || updated.systemPrompt !== current.systemPrompt) {
            members[at] = updated;
        }
    }
    return { ok: true, team: { ...team, description, captain, members }, changed };
}
/**
 * The exact `{{name}}` group grammar `@deepseek-ai/dsh-system-prompt` interpolates.
 * A `{{` without this shape is literal prose unless a later `}}` makes it malformed.
 */
const VARIABLE_GROUP = /^\{\{([^{}]*)\}\}/;
/** The exact variable-name grammar the prompt registry accepts. */
const VARIABLE_NAME = /^[a-z][a-z0-9_]*$/;
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
export function promptTemplateFailure(text, variables) {
    let last = 0;
    for (let open = text.indexOf('{{'); open >= 0; open = text.indexOf('{{', last)) {
        const group = VARIABLE_GROUP.exec(text.slice(open));
        if (group === null) {
            if (text.indexOf('}}', open + 2) >= 0) {
                return `malformed prompt variable reference at "${text.slice(open, open + 16)}…": references are complete simple {{name}} groups`;
            }
            last = open + 2;
            continue;
        }
        const name = group[1] ?? '';
        if (!VARIABLE_NAME.test(name)) {
            return `malformed prompt variable reference "{{${name}}}": variable names match ${String(VARIABLE_NAME)}`;
        }
        if (!Object.hasOwn(variables, name)) {
            const known = Object.keys(variables);
            return `unknown prompt variable "{{${name}}}"; registered variables: ${known.length > 0 ? known.join(', ') : '(none)'}`;
        }
        if (variables[name] === undefined) {
            return `prompt variable "{{${name}}}" has no value for this Session`;
        }
        last = open + group[0].length;
    }
    return undefined;
}
