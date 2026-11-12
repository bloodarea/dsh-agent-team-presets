/** Real live/prepared observations, without a search backend, for composition tests. */
import SessionQuery from '@deepseek-ai/dsh-session-query'
import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session'

/** Read a child's establishing provider from its durable descriptor, including after it goes cold. */
export async function subagentProvider(ctx: Context, id: SessionId): Promise<string | undefined> {
  using observation = await ctx.sessionQuery.observeSession(id)
  const descriptor = observation.events.find(event => event.seq >= observation.inheritedEventCount && event.type === 'subagent/descriptor')
  return descriptor?.type === 'subagent/descriptor' ? descriptor.data.provider : undefined
}

/** Keep official observation and projection behavior while making unused search fail loudly. */
export class FixtureSessionQuery extends SessionQuery {
  static override inject = ['sessions', 'sessionPersistence']
  override searchSessions(): Promise<never> { return Promise.reject(new Error('Fixture does not search')) }
  override searchEvents(): Promise<never> { return Promise.reject(new Error('Fixture does not search')) }
}
