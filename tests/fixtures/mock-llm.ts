import { appendFile } from 'node:fs/promises'
import type { Context } from '@deepseek-ai/cordis'
import { ToolCallId, LlmAdapter } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, LlmResolvedModelInfo, StreamChunk } from '@deepseek-ai/dsh-llm'

class TeamPermissionAdapter extends LlmAdapter {
  override async resolveModel(provider: string, model: string): Promise<LlmResolvedModelInfo> {
    return { provider, id: model, name: model }
  }

  async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    const tools = options.tools?.map(tool => tool.name) ?? []
    // The loop builds the system prompt as the leading system-role message.
    const system = options.messages
      .filter(message => message.role === 'system')
      .flatMap(message => message.content.flatMap(block => block.type === 'text' ? [block.text] : []))
      .join('\n')
    await appendFile('tool-permission-requests.jsonl', `${JSON.stringify({ sessionId: options.sessionId, tools, system })}\n`)
    const callId = ToolCallId(`permission-${options.sessionId ?? 'unknown'}`)
    if (options.messages.at(-1)?.role !== 'tool') {
      if (!tools.includes('team_permission_echo')) throw new Error('member does not see its allowed global tool')
      const args = JSON.stringify({ message: 'member execution reached' })
      yield { type: 'block-start', index: 0, blockType: 'tool-call' }
      yield { type: 'tool-call-delta', index: 0, id: callId, name: 'team_permission_echo', argumentsDelta: args }
      yield { type: 'block-end', index: 0, block: { type: 'tool-call', id: callId, name: 'team_permission_echo', arguments: args } }
      yield { type: 'finish', reason: { kind: 'tool-calls' } }
      return
    }
    const text = 'member completed its allowed tool call'
    yield { type: 'block-start', index: 0, blockType: 'text' }
    yield { type: 'text-delta', index: 0, text }
    yield { type: 'block-end', index: 0, block: { type: 'text', text } }
    yield { type: 'finish', reason: { kind: 'stop' } }
  }
}

export const name = 'team-permission-mock-llm'
export const inject = ['llm']

export function apply(ctx: Context): void {
  ctx.llm.registerAdapter(['team-permission-mock'], new TeamPermissionAdapter())
}
