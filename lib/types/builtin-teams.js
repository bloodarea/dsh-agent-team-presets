/**
 * The official Team presets this plugin ships, as installable and restorable
 * definitions.
 *
 * The catalog in `team-catalog.ts` is the source of truth; this module turns one
 * catalog entry into the stored record a deployment holds, installs the
 * official set exactly once, and restores it on request. Two rules keep that
 * knowledge from becoming a trap:
 *
 * - Installing a shipped preset never overwrites a stored one. Seeding appends a
 *   preset the deployment does not hold and records its identity in
 *   `seededDefaults`, so a shipped preset the user deletes or edits stays
 *   exactly as they left it across restarts. Restoring it is a deliberate act.
 * - Restoring a shipped preset replaces the fields a shared document carries —
 *   the name, the purpose, every standing prompt, the accent colors, the
 *   roster, and the display metadata — and keeps the fields it does not: a
 *   member's model route and every slot's tool policy.
 *
 * `contrib/default-presets` holds the same nine documents as JSON for readers of
 * this repository, and `tests/builtin-teams.spec.ts` proves the two cannot
 * drift.
 * @module dsh-agent-team-presets/builtin-teams
 */
import { applySharedFields, captainFromTransfer, slotNameKey } from "./preset-transfer.js";
import { BUILTIN_TEAM_CATALOG } from "./team-catalog.js";
import { toolMode } from "./presets.js";
export { BUILTIN_TEAM_IDS } from "./team-catalog.js";
/** Identity the lightweight Team is stored under. */
export const LIGHTWEIGHT_TEAM_ID = 'builtin-lightweight';
/** Identity the standard Team is stored under. */
export const STANDARD_TEAM_ID = 'builtin-standard';
/** Identity the full-stack Team is stored under. */
export const FULLSTACK_TEAM_ID = 'builtin-fullstack';
/** Identity the discovery Team is stored under. */
export const DISCOVERY_TEAM_ID = 'builtin-discovery';
/** Identity the planning Team is stored under. */
export const PLANNING_TEAM_ID = 'builtin-planning';
/** Identity the workflow Team is stored under. */
export const WORKFLOW_TEAM_ID = 'builtin-workflow';
/** Identity the engineering Team is stored under. */
export const ENGINEERING_TEAM_ID = 'builtin-engineering';
/** Identity the audit Team is stored under. */
export const AUDIT_TEAM_ID = 'builtin-audit';
/** Identity the research Team is stored under. */
export const RESEARCH_TEAM_ID = 'builtin-research';
/** Every shipped preset, in install order: the three development Teams, then the six work modes. */
export const BUILTIN_TEAMS = BUILTIN_TEAM_CATALOG.map(entry => ({
    id: entry.id,
    series: entry.series,
    document: entry.document,
    metadata: entry.metadata,
    officialSkillBindings: entry.officialSkillBindings,
}));
/**
 * Stable role identity of one shipped member.
 *
 * A member's `id` is the identity a durable member snapshot binds to and the one
 * the runtime re-reads a route through, so a shipped member is stored under a
 * derived identity rather than a random one: restoring the preset a second time
 * addresses the same role instead of creating a second one.
 * @param teamId - identity of the shipped Team that owns the member.
 * @param name - the member's name in the document.
 * @param index - the member's position, used only when the document names none.
 * @returns the role identity a shipped member is stored under.
 */
export function memberRoleId(teamId, name, index) {
    const label = name.trim();
    return `${teamId}:${label === '' ? String(index + 1) : label}`;
}
/**
 * Build one member from a shipped document slot.
 * @param teamId - identity of the shipped Team that owns the member.
 * @param slot - the member's shareable fields.
 * @param index - the member's position in the document.
 * @returns a fresh member carrying the shared fields, no route, and the default tool policy.
 */
function memberFromDocument(teamId, slot, index) {
    return {
        ...captainFromTransfer(slot),
        id: memberRoleId(teamId, slot.name, index),
        provider: '',
        model: '',
        reasoningEffort: '',
    };
}
/**
 * Build the preset one shipped document describes.
 *
 * Everything the document does not carry starts empty, exactly as an import
 * starts: the route follows the Session and the tool policy stays unrestricted.
 * The display metadata rides along because it belongs to the template, not to
 * any runtime field.
 * @param entry - the shipped Team to materialize.
 * @returns a fresh preset carrying the document's content.
 */
export function builtinTeamDefinition(entry) {
    return {
        id: entry.id,
        name: entry.document.team.name,
        description: entry.document.team.description,
        captain: captainFromTransfer(entry.document.team.captain),
        members: entry.document.team.members.map((slot, index) => memberFromDocument(entry.id, slot, index)),
        ...entry.metadata === undefined ? {} : { metadata: cloneMetadata(entry.metadata) },
        ...entry.officialSkillBindings.length === 0 ? {} : {
            officialSkills: entry.officialSkillBindings.map(binding => ({ ...binding })),
        },
    };
}
/**
 * Copy one metadata object so a stored Team never shares the catalog's arrays.
 * @param metadata - the catalog metadata.
 * @returns a detached copy.
 */
export function cloneMetadata(metadata) {
    return {
        ...metadata.summary === undefined ? {} : { summary: metadata.summary },
        ...metadata.tags === undefined ? {} : { tags: [...metadata.tags] },
        ...metadata.useCases === undefined ? {} : { useCases: [...metadata.useCases] },
        ...metadata.quickPrompts === undefined ? {} : { quickPrompts: [...metadata.quickPrompts] },
        ...metadata.notes === undefined ? {} : { notes: metadata.notes },
    };
}
/**
 * Install the shipped presets a deployment has not been offered yet.
 *
 * A preset is appended only when the deployment neither holds it nor was ever
 * offered it, and it is marked as offered whether this pass appended it or the
 * deployment already held it. That is what makes the shipped set deletable: the
 * marker records "the user was offered this preset", not "this preset is
 * installed", so deleting one leaves it deleted and installing one happens
 * exactly once. An existing preset is never overwritten here — editing or
 * replacing a stored Team is the user's decision, and `restoreBuiltinTeams` is
 * how they make it.
 * @param teams - the stored Team list, already cleaned of legacy fields.
 * @param seeded - identities the deployment was already offered.
 * @returns the next Team list, the next marker, and whether either changed.
 */
export function seedBuiltinTeams(teams, seeded) {
    const held = new Set(teams.map(team => team.id));
    const known = new Set(seeded);
    const install = BUILTIN_TEAMS.filter(entry => !held.has(entry.id) && !known.has(entry.id));
    const mark = BUILTIN_TEAMS.filter(entry => (held.has(entry.id) || install.includes(entry)) && !known.has(entry.id));
    return {
        teams: install.length === 0 ? [...teams] : [...teams, ...install.map(entry => builtinTeamDefinition(entry))],
        seeded: mark.length === 0 ? [...seeded] : [...seeded, ...mark.map(entry => entry.id)],
        changed: install.length > 0 || mark.length > 0,
    };
}
/**
 * The shipped presets a deployment was offered but no longer holds.
 *
 * The marker exists so a deleted preset stays deleted, which also means a Team
 * list that lost its shipped presets for any other reason — a hand edit, a
 * restored settings file, a rollback — never gets them back on its own. This
 * reads that state instead of changing it: the caller warns, and the reader can
 * decide to restore. A preset the deployment was never offered is not reported,
 * because the install pass will add it on this same startup.
 * @param teams - the stored Team list.
 * @param seeded - identities the deployment was already offered.
 * @returns the shipped identities that are marked as offered yet absent.
 */
export function missingSeededBuiltinTeams(teams, seeded) {
    const held = new Set(teams.map(team => team.id));
    const known = new Set(seeded);
    return BUILTIN_TEAMS.filter(entry => known.has(entry.id) && !held.has(entry.id)).map(entry => entry.id);
}
/**
 * Whether two slots carry the same stored fields.
 * @param a - left slot.
 * @param b - right slot.
 * @returns whether every field a slot stores is equal.
 */
function sameSlot(a, b) {
    return a.name === b.name
        && a.color === b.color
        && a.description === b.description
        && a.systemPrompt === b.systemPrompt
        && toolMode(a) === toolMode(b)
        && a.tools.length === b.tools.length
        && a.tools.every((tool, index) => tool === b.tools[index]);
}
/**
 * Whether two members carry the same stored fields.
 * @param a - left member.
 * @param b - right member.
 * @returns whether every field a member stores is equal.
 */
function sameMember(a, b) {
    return sameSlot(a, b)
        && a.id === b.id
        && a.provider === b.provider
        && a.model === b.model
        && a.reasoningEffort === b.reasoningEffort;
}
/**
 * Whether two metadata objects are equal field by field.
 * @param a - left metadata, or undefined.
 * @param b - right metadata, or undefined.
 * @returns whether both describe the same display data.
 */
export function sameMetadata(a, b) {
    if (a === undefined || b === undefined)
        return a === b;
    const list = (value) => JSON.stringify(value ?? []);
    return (a.summary ?? '') === (b.summary ?? '')
        && (a.notes ?? '') === (b.notes ?? '')
        && list(a.tags) === list(b.tags)
        && list(a.useCases) === list(b.useCases)
        && list(a.quickPrompts) === list(b.quickPrompts);
}
/**
 * Whether two Teams carry the same stored fields.
 * @param a - left Team.
 * @param b - right Team.
 * @returns whether every field a Team stores is equal.
 */
function sameTeam(a, b) {
    return a.id === b.id
        && a.name === b.name
        && a.description === b.description
        && sameMetadata(a.metadata, b.metadata)
        && sameSlot(a.captain, b.captain)
        && a.members.length === b.members.length
        && a.members.every((member, index) => {
            const other = b.members[index];
            return other !== undefined && sameMember(member, other);
        });
}
/**
 * Put one stored Team back at the content of its shipped document.
 *
 * The document wins for everything it carries. A member it still names keeps the
 * route and tool policy the deployment configured for that role — matched by the
 * role identity a previous install gave it, or by name for a member the
 * deployment created itself — and a member the document does not name leaves the
 * roster, because a restored preset is the shipped roster and not a superset of
 * it.
 * @param current - the stored Team being restored.
 * @param entry - the shipped Team it is restored from.
 * @returns the restored Team, keeping the stored identity and every local route.
 */
function restoreBuiltinTeam(current, entry) {
    const document = entry.document.team;
    return {
        id: current.id,
        name: document.name,
        description: document.description,
        captain: applySharedFields(current.captain, document.captain),
        members: document.members.map((shared, index) => {
            const key = slotNameKey(shared.name);
            const existing = current.members.find(member => member.id === memberRoleId(entry.id, shared.name, index))
                ?? current.members.find(member => key !== '' && slotNameKey(member.name) === key);
            return existing === undefined
                ? memberFromDocument(entry.id, shared, index)
                : applySharedFields(existing, shared);
        }),
        ...entry.metadata === undefined ? {} : { metadata: cloneMetadata(entry.metadata) },
        ...entry.officialSkillBindings.length === 0 ? {} : {
            officialSkills: entry.officialSkillBindings.map(binding => ({ ...binding })),
        },
    };
}
/**
 * Put every shipped preset back at its document's content.
 *
 * Only the shipped presets are touched: a Team the user created keeps its
 * identity, its content, and its position, and a shipped preset that is missing
 * is appended rather than substituted for anything else. The result is the list
 * the caller stages, so a restore is reviewable and saved like every other edit
 * on the page.
 * @param teams - the Teams the page currently shows.
 * @returns the restored list and the identities that really moved.
 */
export function restoreBuiltinTeams(teams) {
    const next = [...teams];
    const changed = [];
    for (const entry of BUILTIN_TEAMS) {
        const at = next.findIndex(team => team.id === entry.id);
        if (at < 0) {
            next.push(builtinTeamDefinition(entry));
            changed.push(entry.id);
            continue;
        }
        const current = next[at];
        const restored = restoreBuiltinTeam(current, entry);
        if (sameTeam(current, restored))
            continue;
        next[at] = restored;
        changed.push(entry.id);
    }
    return { teams: next, changed };
}
