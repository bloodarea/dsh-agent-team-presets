/** Subagent tree identity and execution state used by Team presets on DSH rc.2. */
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type { SubagentCatalogEntry } from '@deepseek-ai/dsh-subagent'

/** Tree membership, with names supplied by the subagent runtime. */
export interface PresetMembership {
  readonly role: 'lead' | 'teammate'
  readonly root: Agent
  readonly name: string
}

/** Resolve published membership; creation callbacks must use the reserved snapshot identity. */
export function membershipOf(ctx: Context, agent: Agent): PresetMembership | undefined {
  if (agent.session.header.origin !== 'subagent') return { role: 'lead', root: agent, name: 'lead' }
  try {
    const root = ctx.subagents.rootOf(agent)
    return { role: root === agent ? 'lead' : 'teammate', root, name: ctx.subagents.namesOf(agent).self }
  } catch (error: unknown) {
    // A child is not published in the runtime until agent/created completes.
    if (error instanceof Error && 'code' in error && error.code === 'UNAUTHORIZED') return undefined
    throw error
  }
}

/** One child known to this root, including durable names and live execution state. */
export interface PresetMemberView {
  readonly id: SessionId
  readonly name: string
  readonly role: 'teammate'
  readonly status: 'running' | 'provisioning' | 'inactive'
}

const provisioning = new WeakMap<Agent, Map<SessionId, string>>()

/** Track a member before the runtime publishes its catalog or lifecycle events. */
export function reserveMember(root: Agent, childId: SessionId, name: string): () => void {
  let pending = provisioning.get(root)
  if (pending === undefined) { pending = new Map(); provisioning.set(root, pending) }
  pending.set(childId, name)
  return () => { pending.delete(childId) }
}

/** Read durable direct children, live descendants, and admitted member creations synchronously. */
export function teamMembers(ctx: Context, root: Agent): PresetMemberView[] {
  const rows = new Map<SessionId, PresetMemberView>()
  const catalog = ctx.sessionProjections.snapshot(root.session, ['subagentCatalog']).values['subagentCatalog'] as SubagentCatalogEntry[] | undefined
  for (const child of catalog ?? []) {
    rows.set(child.id, { id: child.id, name: 'name' in child ? child.name ?? child.id : child.id, role: 'teammate', status: 'inactive' })
  }
  for (const child of ctx.agents.list()) {
    if (child === root || child.session.header.origin !== 'subagent') continue
    const membership = membershipOf(ctx, child)
    if (membership?.root !== root) continue
    rows.set(child.id, { id: child.id, name: membership.name, role: 'teammate', status: child.status === 'running' ? 'running' : 'inactive' })
  }
  for (const [id, name] of provisioning.get(root) ?? []) {
    rows.set(id, { id, name, role: 'teammate', status: 'provisioning' })
  }
  return [...rows.values()]
}

/** Count members whose current work prevents changing the frozen Team definition. */
export function executingMemberCount(ctx: Context, root: Agent): number {
  return teamMembers(ctx, root).filter(member => member.status !== 'inactive').length
}
