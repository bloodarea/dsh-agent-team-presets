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
import { z } from 'zod';
import type { Context } from '@deepseek-ai/cordis';
import type { DomainTableSpec } from '@deepseek-ai/dsh-storage-domain';
/** Backend unit name; also the `storages/` document name. */
export declare const MEMBER_DOMAIN_NAME = "agent_team_presets_members";
/** Table name inside the member unit. */
export declare const MEMBER_TABLE_NAME = "members";
/** Record layout version; the unit version mirrors it. */
export declare const MEMBER_RECORD_VERSION = 1;
/**
 * One managed member's frozen creation snapshot.
 *
 * Every field is the value captured for THIS instance. Recovery rebuilds the
 * member from this record and never from the current Settings document, so a
 * preset edited after the member was created cannot silently re-scope it.
 */
export declare const memberRecordSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    intentId: z.ZodString;
    rootSessionId: z.ZodString;
    memberName: z.ZodString;
    teamId: z.ZodString;
    roleId: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    roleDescription: z.ZodString;
    persona: z.ZodString;
    teamSection: z.ZodString;
    roster: z.ZodArray<z.ZodObject<{
        target: z.ZodString;
        display: z.ZodString;
        description: z.ZodString;
    }, z.core.$strict>>;
    route: z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    policy: z.ZodObject<{
        mode: z.ZodEnum<{
            all: "all";
            custom: "custom";
        }>;
        allow: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    spawnContext: z.ZodEnum<{
        fork: "fork";
        fresh: "fresh";
    }>;
    lifecycle: z.ZodEnum<{
        failed: "failed";
        intent: "intent";
        bound: "bound";
    }>;
    childSessionId: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodNumber;
}, z.core.$strict>;
/** One managed member's durable snapshot. */
export type MemberRecord = z.infer<typeof memberRecordSchema>;
/** A member's frozen route. */
export type MemberRouteRecord = NonNullable<MemberRecord['route']>;
/** A member's frozen strict tool policy. */
export type MemberPolicyRecord = MemberRecord['policy'];
/** One preset roster row captured in a member's snapshot. */
export type MemberRosterRecord = MemberRecord['roster'][number];
/**
 * Domain declaration of the member unit.
 *
 * A literal rather than a `defineDomain(...)` call: the form is reached through
 * a service, so the helper would have to be imported dynamically and its
 * load-time checks (unit name, version, and table-name grammar) restate rules
 * these three constants already satisfy and the backend re-validates when the
 * unit opens.
 */
export declare const memberDomainSpec: {
    name: string;
    version: number;
    tables: {
        members: DomainTableSpec<string, MemberRecord>;
    };
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
export declare function memberRecordKey(rootSessionId: string, memberName: string): string;
/** The durable member snapshot store this plugin owns. */
export interface MemberStore {
    /**
     * Read one member's snapshot synchronously from authoritative memory.
     * @param rootSessionId - the Team Lead Session identity.
     * @param memberName - the exact teammate target.
     * @returns the snapshot, or undefined when this member is not plugin-managed.
     */
    get(rootSessionId: string, memberName: string): MemberRecord | undefined;
    /**
     * Snapshot every stored member.
     * @returns every record currently held.
     */
    values(): MemberRecord[];
    /**
     * Identify one member instance by its child Session identity.
     *
     * Card chrome asks this per rendered card, so the answer is served from an
     * index maintained as records are written rather than by scanning the table.
     * @param childSessionId - the child Session identity a card stands for.
     * @returns whether a stored snapshot created that exact child.
     */
    hasChild(childSessionId: string): boolean;
    /**
     * Insert or replace one snapshot durably.
     * @param record - the full record to store.
     * @returns resolution after the medium holds the record.
     */
    put(record: MemberRecord): Promise<void>;
    /**
     * Release the underlying unit.
     * @returns resolution after the unit is closed.
     */
    close(): Promise<void>;
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
export declare function openMemberStore(ctx: Context): Promise<MemberStore>;
