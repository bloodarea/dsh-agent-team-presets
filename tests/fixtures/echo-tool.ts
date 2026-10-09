import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'team-permission-echo-tool'
export const inject = ['tools']

function messageTool(toolName: string, description: string) {
  return defineTool({
    name: toolName,
    description,
    parameters: { message: { type: 'string', required: true } },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) { return args.message },
  })
}

/** Two configurable global tools, so one allow-list can include and exclude. */
export function apply(ctx: Context): void {
  ctx.tools.register(messageTool('team_permission_echo', 'Return the supplied message.'))
  ctx.tools.register(messageTool('team_permission_blocked', 'Return the supplied message; never allow-listed in this composition.'))
}
