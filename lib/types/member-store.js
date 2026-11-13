/**
 * Durable per-member configuration snapshots for preset-managed Team members.
 *
 * Official rc.2 gives a plugin no durable channel of its own: `Session.append`
 * cannot write the `ignorable` marker the persistence read path requires for an
 * out-of-repo event type, and the shipped vocabulary deliberately rejects
 * event-name registration (`@deepseek-ai/dsh-session/known-event-types`). The
 * composed `dsh-base` bundle therefore leaves `ctx.storage.domain` as the only
 * official, schema-validated, atomically-durable place to record what a member
 * was created with.
 *
 * One record is the whole snapshot AND the ownership marker, written durably
 * BEFORE the member can be created, so there is no window in which a member is
 * identifiable as plugin-managed without its snapshot. The unit uses the
 * default `single` layout so a stored format version this build does not accept
 * refuses the open instead of being discarded, and a record that fails its
 * schema refuses the open instead of being skipped: the plugin then disables
 * member injection rather than letting a member run on the Team Lead's route
 * with unrestricted tools.
 *
 * The domain form is reached through the `storageDomain` SERVICE only. This
 * module deliberately holds no runtime import of `@deepseek-ai/dsh-storage-domain`:
 * `defineDomain` and `domainTable` are pure identity/validation helpers for
 * constants this module already fixes, while a load-time import would make the
 * whole plugin — Settings page included — unresolvable in a deployment that
 * composes no storage, instead of disabling just member injection.
 * @module dsh-agent-team-presets/member-store
 */
import { createHash } from 'node:crypto';
import { z } from 'zod';
/** Backend unit name; also the `storages/` document name. */
export const MEMBER_DOMAIN_NAME = 'agent_team_presets_members';
/** Table name inside the member unit. */
export const MEMBER_TABLE_NAME = 'members';
/** Record layout version; the unit version mirrors it. */
export const MEMBER_RECORD_VERSION = 1;
const memberRouteSchema = z.strictObject({
    provider: z.string().min(1),
    model: z.string().min(1),
    reasoningEffort: z.string().min(1).optional(),
});
const memberPolicySchema = z.strictObject({
    mode: z.enum(['all', 'custom']),
    allow: z.array(z.string()),
});
const memberRosterEntrySchema = z.strictObject({
    target: z.string().min(1),
    display: z.string(),
    description: z.string(),
});
/**
 * One managed member's frozen creation snapshot.
 *
 * Every field is the value captured for THIS instance. Recovery rebuilds the
 * member from this record and never from the current Settings document, so a
 * preset edited after the member was created cannot silently re-scope it.
 */
export const memberRecordSchema = z.strictObject({
    /** Layout version of this record; a bump refuses older records. */
    schemaVersion: z.literal(MEMBER_RECORD_VERSION),
    /** Identity of one creation attempt, so a retry is distinguishable. */
    intentId: z.string().min(1),
    /** Team Lead Session this member belongs to. */
    rootSessionId: z.string().min(1),
    /** Exact teammate target the member was created under. */
    memberName: z.string().min(1),
    /** Team preset identity the snapshot was captured from. */
    teamId: z.string().min(1),
    /** Stable member identity inside the preset, when the preset carries one. */
    roleId: z.string().min(1).optional(),
    /** Configured display name, for diagnostics and operator inspection. */
    displayName: z.string(),
    /** Configured role description, for diagnostics and operator inspection. */
    roleDescription: z.string(),
    /** Frozen own persona text: the member briefing registered as its persona. */
    persona: z.string(),
    /** Frozen team context and preset division-of-labour text. */
    teamSection: z.string(),
    /** The preset roster the division-of-labour text was rendered from. */
    roster: z.array(memberRosterEntrySchema),
    /** Frozen route; absent means the member runs on the Session's own route. */
    route: memberRouteSchema.optional(),
    /** Frozen strict tool policy of this member's own slot. */
    policy: memberPolicySchema,
    /** Subagent execution backend the member was created through. */
    spawnContext: z.enum(['fresh', 'fork']),
    /** Creation progress: `intent` before the child exists, `bound` once it does. */
    lifecycle: z.enum(['intent', 'bound', 'failed']),
    /** Durable child Session identity, present once the child was created. */
    childSessionId: z.string().min(1).optional(),
    /** Last mutation time, for operator inspection only. */
    updatedAt: z.number().int().min(0),
});
/**
 * Domain declaration of the member unit.
 *
 * A literal rather than a `defineDomain(...)` call: the form is reached through
 * a service, so the helper would have to be imported dynamically and its
 * load-time checks (unit name, version, and table-name grammar) restate rules
 * these three constants already satisfy and the backend re-validates when the
 * unit opens.
 */
export const memberDomainSpec = {
    name: MEMBER_DOMAIN_NAME,
    version: MEMBER_RECORD_VERSION,
    tables: {
        members: { valueSchema: memberRecordSchema },
    },
};
/**
 * Derive the durable key of one member instance.
 *
 * Teammate names are never reused inside a Team and every Team is rooted at one
 * Lead Session, so `(rootSessionId, memberName)` is unique for the lifetime of
 * the member. The key is a digest because store record keys must be safe path
 * segments; the record itself keeps both plain fields, so a lookup always
 * re-verifies the identity it resolved.
 * @param rootSessionId - the Team Lead Session identity.
 * @param memberName - the exact teammate target.
 * @returns a stable record key.
 */
export function memberRecordKey(rootSessionId, memberName) {
    return createHash('sha256').update(rootSessionId, 'utf8').update('\u0000').update(memberName, 'utf8').digest('hex');
}
/**
 * How long a fresh activation waits for the previous one to release the unit.
 *
 * The wait is bounded on purpose: a handoff that cannot complete must disable
 * member injection (fail closed) instead of hanging the Host or letting two
 * activations own one unit and treat its records as unmanaged.
 */
const HANDOFF_TIMEOUT_MS = 5_000;
/**
 * Process-wide release barrier for the durable member unit.
 *
 * An HMR remount can open the same unit before the previous activation's close
 * has finished, and the storage facility refuses a second open of a live unit.
 * The barrier is what makes the handoff ordered: a new open waits for the
 * release that is already in progress, and a release that never completes is
 * reported rather than awaited forever. It carries no member data — only the
 * close promise itself.
 */
let released = Promise.resolve();
/**
 * Wait for any release already in progress, bounded by {@link HANDOFF_TIMEOUT_MS}.
 * @returns resolution once no release is pending.
 * @throws when the previous activation has not released the unit in time.
 */
async function awaitRelease() {
    const pending = released;
    let timer;
    try {
        await Promise.race([
            pending,
            new Promise((_resolve, reject) => {
                timer = setTimeout(() => { reject(new Error(`the previous plugin activation did not release the member store within ${HANDOFF_TIMEOUT_MS}ms`)); }, HANDOFF_TIMEOUT_MS);
            }),
        ]);
    }
    finally {
        if (timer !== undefined)
            clearTimeout(timer);
    }
}
/**
 * Open the member snapshot unit on the deployment's storage hub.
 *
 * Rejects when the domain form is absent, the routed backend cannot serve it,
 * the stored format version is not this build's, a stored record fails its
 * schema, or a previous activation has not released the unit yet. Every one of
 * those means the plugin cannot prove what a member was created with, so the
 * caller must refuse member creation rather than guess.
 * @param ctx - the plugin context carrying `storageDomain`.
 * @returns the opened store.
 * @throws when the domain form is not composed or the unit cannot be opened.
 */
export async function openMemberStore(ctx) {
    await awaitRelease();
    const facility = ctx.get('storageDomain');
    if (facility === undefined) {
        throw new Error('this deployment does not compose @deepseek-ai/dsh-storage-domain, so preset-managed Team members '
            + 'have no durable configuration snapshot');
    }
    const domain = await facility.open(memberDomainSpec);
    const table = domain.table('members');
    // One entry per stored snapshot, so a card's identity question stays O(1)
    // however many members the Team has summoned.
    const childIds = new Set();
    for (const [, record] of table.entries()) {
        if (record.childSessionId !== undefined)
            childIds.add(record.childSessionId);
    }
    return {
        get: (rootSessionId, memberName) => table.get(memberRecordKey(rootSessionId, memberName)),
        values: () => [...table.entries()].map(([, record]) => record),
        hasChild: childSessionId => childIds.has(childSessionId),
        put: async (record) => {
            await table.put(memberRecordKey(record.rootSessionId, record.memberName), record);
            if (record.childSessionId !== undefined)
                childIds.add(record.childSessionId);
        },
        close: () => {
            const closing = domain.close();
            // Publish the release BEFORE it settles, so an activation that mounts
            // during this close waits for it instead of racing it.
            released = closing.catch(() => { });
            return closing;
        },
    };
}
