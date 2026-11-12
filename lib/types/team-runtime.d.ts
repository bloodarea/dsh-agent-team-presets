/** Subagent tree identity and execution state used by Team presets on DSH rc.2. */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { SessionId } from '@deepseek-ai/dsh-session';
/** Tree membership, with names supplied by the subagent runtime. */
export interface PresetMembership {
    readonly role: 'lead' | 'teammate';
    readonly root: Agent;
    readonly name: string;
}
/** Resolve published membership; creation callbacks must use the reserved snapshot identity. */
export declare function membershipOf(ctx: Context, agent: Agent): PresetMembership | undefined;
/** One child known to this root, including durable names and live execution state. */
export interface PresetMemberView {
    readonly id: SessionId;
    readonly name: string;
    readonly role: 'teammate';
    readonly status: 'running' | 'provisioning' | 'inactive';
}
/** Track a member before the runtime publishes its catalog or lifecycle events. */
export declare function reserveMember(root: Agent, childId: SessionId, name: string): () => void;
/** Read durable direct children, live descendants, and admitted member creations synchronously. */
export declare function teamMembers(ctx: Context, root: Agent): PresetMemberView[];
/** Count members whose current work prevents changing the frozen Team definition. */
export declare function executingMemberCount(ctx: Context, root: Agent): number;
