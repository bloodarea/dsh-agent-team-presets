/**
 * Host catalog of the tools a Team member's allow-list may name.
 *
 * Read globals and standing Agent preset scopes without creating Agents. The
 * editor offers their union plus fixed Team operations; application validates
 * the selected Session and strict guards cover exact-Agent registrations.
 * @module dsh-agent-team-presets/tool-catalog
 */

import { Context } from '@deepseek-ai/cordis'
import { RUN_CODE_NAME } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-agent-preset-registry'
import { GET_TEAM_PRESET_DESCRIPTION, SPAWN_TEAM_MEMBER_DESCRIPTION, UPDATE_TEAM_PRESET_DESCRIPTION } from './tool-descriptions.ts'
import { IMPLICIT_TOOLS } from './presets.ts'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { TeamExecutionMonitor } from './execution.ts'
import type { TeamExecutionSnapshot, ToolCatalogValue, ToolChoice, ToolSource } from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Remote catalog of restrictable tools for the Team presets settings page. */
    teamPresetsToolCatalog: TeamPresetsToolCatalog
  }
}

/** Plugin configuration of {@link TeamPresetsToolCatalog}. */
export interface TeamPresetsToolCatalogConfig {
  /**
   * Live execution state the settings page streams. A composition that mounts
   * this service without the preset runtime reports an empty board rather than
   * an execution state it cannot know.
   */
  readonly monitor?: TeamExecutionMonitor
}

/**
 * One frame for a composition that holds no execution state.
 *
 * Written as an explicit iterator rather than an `async function*`: the frame
 * carries no awaitable work, and an async generator without an `await` trips
 * `typescript/require-await` for a function that is only asynchronous by
 * signature. The board is announced once and the stream then completes.
 * @returns one empty frame, then completion.
 */
function emptyExecution(): AsyncIterable<TeamExecutionSnapshot> {
  return {
    [Symbol.asyncIterator](): AsyncIterator<TeamExecutionSnapshot> {
      let sent = false
      return {
        next: (): Promise<IteratorResult<TeamExecutionSnapshot>> => {
          if (sent) return Promise.resolve({ done: true, value: undefined })
          sent = true
          return Promise.resolve({ done: false, value: { teams: [] } })
        },
      }
    },
  }
}

/**
 * Descriptions this plugin owns for the capabilities it implements.
 *
 * Every name here is a tool this plugin registers and therefore authors, and
 * the text is the same constant its tool definition carries. A tool the registry
 * did not describe is never listed, and an upstream tool is never described from
 * here: inventing hover text for someone else's tool would put unverified claims
 * in the tip, and offering a name the registry does not expose would only
 * produce an application the summon path rejects.
 */
const OWN_TOOL_DESCRIPTIONS: Readonly<Record<string, string>> = {
  spawn_team_member: SPAWN_TEAM_MEMBER_DESCRIPTION,
  get_team_preset: GET_TEAM_PRESET_DESCRIPTION,
  update_team_preset: UPDATE_TEAM_PRESET_DESCRIPTION,
}

/**
 * Capabilities only the captain can exercise.
 *
 * `interrupt_agent` is enforced by the Team service, and the preset tools are
 * registered on the Session root scope only, so a member's selection can never
 * make them usable. The page marks them instead of implying they are grantable.
 */
const CAPTAIN_ONLY: ReadonlySet<string> = new Set([
  'spawn_team_member', 'get_team_preset', 'update_team_preset', 'interrupt_agent',
])

/**
 * The Harness names an MCP tool `mcp__<server>__<name>`, so the middle segment
 * is the server this plugin can attribute the capability to.
 */
const MCP_TOOL_NAME = /^mcp__([A-Za-z0-9_-]{1,32})__/

/**
 * Attribute one capability to the only sources the registry can prove.
 *
 * `register()` stores a definition under its tool name with a fixed label, so a
 * tool's registering package is never recorded and native Harness tools cannot
 * be told apart from a third-party plugin's. Two attributions remain
 * deterministic: a name this plugin registers, and a Harness-generated MCP name.
 * Everything else is reported as `other` rather than guessed at, so the group
 * can split by itself once upstream records the registering source.
 * @param name - the registered tool name.
 * @returns the attribution, plus the MCP server name when there is one.
 */
function attributionOf(name: string): { source: ToolSource; server?: string } {
  if (Object.hasOwn(OWN_TOOL_DESCRIPTIONS, name)) return { source: 'presets' }
  const mcp = MCP_TOOL_NAME.exec(name)
  if (mcp !== null) return { source: 'mcp', server: mcp[1] as string }
  return { source: 'other' }
}

/** Remote catalog of the deployment's inherited and Team tool names. */
export default class TeamPresetsToolCatalog extends TypertRemoteService {
  static inject = ['tools', 'typert']
  private readonly monitor: TeamExecutionMonitor | undefined

  /**
   * @param ctx - Host context carrying the tool registry and Typert gateway.
   * @param config - the preset runtime's execution monitor, when it is mounted.
   */
  constructor(ctx: Context, config: TeamPresetsToolCatalogConfig = {}) {
    super(ctx, 'teamPresetsToolCatalog', { namespace: 'teamPresets' })
    this.monitor = config.monitor
  }

  /**
   * List global, standing-preset and fixed Team capability choices.
   *
   * Two kinds of name are deliberately absent. The reserved PTC mode transport
   * is excluded because `ctx.tools.restrict()` refuses it, so offering it as a
   * checkbox would produce a selection the summon path rejects. The implicit
   * tools (`skill`) are excluded because a Team policy always admits them: they
   * are a precondition of a Team Skill assignment, not a capability an operator
   * could withhold, so a checkbox for one would be a control that cannot do
   * anything.
   * @returns the tool names and model-facing descriptions, sorted by name.
   */
  @Remote
  async catalog(): Promise<ToolCatalogValue> {
    const choices = new Map<string, ToolChoice>()
    const add = (schemas: readonly { name: string; description: string }[]): void => {
      for (const schema of schemas) {
        if (schema.name === RUN_CODE_NAME || IMPLICIT_TOOLS.includes(schema.name)) continue
        choices.set(schema.name, {
          name: schema.name,
          description: schema.description,
          ...attributionOf(schema.name),
        })
      }
    }
    add(this.ctx.tools.schemas())
    const presets = this.ctx.get('agentPresets')
    if (presets !== undefined) {
      for (const preset of await presets.list()) {
        if (preset.broken !== undefined) throw new Error(`Cannot read tools of preset "${preset.id}": ${preset.broken}`)
        const lease = await presets.acquireScope(preset.id)
        try { add(this.ctx.tools.schemas(lease.key)) }
        finally { await lease[Symbol.asyncDispose]() }
      }
    }
    // Only names this plugin can describe truthfully. A registry tool keeps the
    // description its own author wrote; anything absent stays absent rather than
    // acquiring invented hover text.
    for (const [name, description] of Object.entries(OWN_TOOL_DESCRIPTIONS)) {
      if (!choices.has(name)) choices.set(name, { name, description, source: 'presets' })
    }
    // Mark role-restricted capabilities wherever they came from, so the member
    // page can refuse to present them as grantable.
    for (const name of CAPTAIN_ONLY) {
      const choice = choices.get(name)
      if (choice !== undefined) choices.set(name, { ...choice, captainOnly: true })
    }
    return { tools: [...choices.values()].sort((left, right) => left.name.localeCompare(right.name)) }
  }

  /**
   * Stream the execution state of every Team the Host reports.
   *
   * The settings page reads this before it promises that a saved change takes
   * effect right away: a Team executing a task adopts a save only before its
   * next task, and a state the Host cannot decide stays `unknown` rather than
   * passing for idle.
   * @param signal - cancellation owned by the Remote stream carrier.
   * @returns whole-set frames, opening with the current state.
   */
  @Remote({ mode: 'stream' })
  execution(signal: AbortSignal): AsyncIterable<TeamExecutionSnapshot> {
    return this.monitor?.stream(signal) ?? emptyExecution()
  }
}
