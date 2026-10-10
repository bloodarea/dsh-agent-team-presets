/**
 * Host catalog of the tools a Team member's allow-list may name.
 *
 * `ctx.tools.restrict({ allow })` accepts only **global** tool names, so this
 * service projects exactly the global view that restriction validates against:
 * a name it does not list would be refused when the member is summoned.
 * @module dsh-agent-team-presets/tool-catalog
 */

import { Context } from '@deepseek-ai/cordis'
import { RUN_CODE_NAME } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-tools'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { TeamExecutionMonitor } from './execution.ts'
import type { TeamExecutionSnapshot, ToolCatalogValue, ToolChoice } from './types.ts'

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

/** Remote catalog of the global tools one Team agent allow-list may name. */
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
   * List every global tool a member allow-list may name.
   *
   * The reserved PTC mode transport is excluded: `ctx.tools.restrict()` refuses
   * it, so offering it as a checkbox would produce a selection the summon path
   * rejects.
   * @returns the tool names and model-facing descriptions, sorted by name.
   */
  @Remote
  catalog(): ToolCatalogValue {
    const tools: ToolChoice[] = this.ctx.tools.schemas()
      .filter(schema => schema.name !== RUN_CODE_NAME)
      .map(schema => ({ name: schema.name, description: schema.description }))
      .sort((left, right) => left.name.localeCompare(right.name))
    return { tools }
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
