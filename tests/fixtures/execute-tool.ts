import type { Context } from '@deepseek-ai/cordis'
import type { ToolExecutionInput, ToolExecutionResult } from '@deepseek-ai/dsh-tools'

/** Dispatch one test call through the current executor's real batch pipeline. */
export async function executeTool(ctx: Context, input: ToolExecutionInput): Promise<ToolExecutionResult> {
  const batch = await ctx.tools.execute({
    calls: [{ type: 'tool-call', id: input.callId, name: input.name, arguments: JSON.stringify(input.arguments) }],
    signal: input.signal,
    ...input.agent === undefined ? {} : { agent: input.agent },
    ...input.toolSet === undefined ? {} : { toolSet: input.toolSet },
  })
  const settled = batch.results[0]
  if (settled === undefined) throw new Error('Test tool call did not settle')
  return settled.result
}
