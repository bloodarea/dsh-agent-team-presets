/** Optional adapters for the card registries owned by Fleet and Tasks. */
import type { Context } from '@deepseek-ai/cordis'
import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'
import type {} from 'dsh-agent-team-presets/remote'
import { NS } from './locales.ts'
import type { TeamPresetsLocaleKey } from './locales.ts'
import css from './agent-card-badges.module.css'

/** Only real Session identities cross the card extension interface. */
export interface AgentCardBadgeProps {
  readonly sessionId: string
}

/** Version 1 of the optional card registry supplied by each target plugin. */
export interface AgentCardBadgeRegistry {
  readonly version: 1
  /** Register inline content; disposing the registration removes it from all cards. */
  register(entry: {
    readonly id: string
    readonly Component: ComponentType<AgentCardBadgeProps>
  }): () => void
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Optional extension supplied by the patched dsh-context Fleet view. */
    contextAgentCardBadges: AgentCardBadgeRegistry
    /** Optional extension supplied by the patched Better Sidebar Tasks view. */
    betterSidebarAgentCardBadges: AgentCardBadgeRegistry
  }
}

type Translate = (key: TeamPresetsLocaleKey) => string

/** One resolved ownership answer, remembered with the card identity it belongs to. */
export interface BadgeAnswer {
  readonly sessionId: string
  readonly managed: boolean
}

/**
 * Decide whether a card shows the tag.
 *
 * A card is reused by the target when its node is reused or its position
 * changes, so an answer about the PREVIOUS Session must never paint the next
 * one: the identity has to match as well as the answer being positive.
 * @param answer - the last resolved ownership answer, if any.
 * @param sessionId - the Session the card currently stands for.
 * @returns whether the tag belongs on this card right now.
 */
export function showsPresetBadge(answer: BadgeAnswer | undefined, sessionId: string): boolean {
  return answer !== undefined && answer.sessionId === sessionId && answer.managed
}

/** Inline text stays empty until durable creation identity is confirmed. */
function PresetMemberBadge({ sessionId, read, t }: AgentCardBadgeProps & {
  readonly read: (sessionId: string) => Promise<boolean>
  readonly t: Translate
}) {
  const [answer, setAnswer] = useState<BadgeAnswer>()
  useEffect(() => {
    let active = true
    void read(sessionId).then(managed => {
      if (active) setAnswer({ sessionId, managed })
    }, (error: unknown) => {
      if (active) console.warn('[team-presets] could not read card ownership:', error)
    })
    return () => { active = false }
  }, [sessionId, read])
  if (!showsPresetBadge(answer, sessionId)) return null
  return <span className={css.badge} title={t('presetMemberBadgeHint')}>{t('presetMemberBadge')}</span>
}

/**
 * Bind each adapter independently. Missing targets leave only a pending Cordis
 * injection; their removal releases the registration and its mounted content.
 * The target packages are deliberately absent from dsh.client.inject and imports.
 * @param ctx - the original plugin context, before creating fixed injection scopes.
 */
export function registerAgentCardBadgeAdapters(ctx: Context): () => Promise<void> {
  const services = ['contextAgentCardBadges', 'betterSidebarAgentCardBadges'] as const
  const scopes = services.map(service =>
    ctx.inject(['remote.teamPresets', 'locale', service], scope => {
      const registry = scope[service]
      if (registry.version !== 1) {
        console.warn(`[team-presets] unsupported ${service} version:`, registry.version)
        return
      }
      const read = async (sessionId: string): Promise<boolean> => {
        const result = await scope.remote.teamPresets.isPresetMember(sessionId)
        if (!result.ok) throw new Error(result.error.message)
        return result.value
      }
      const t = scope.locale.bind(NS)
      const Component = (props: AgentCardBadgeProps) => <PresetMemberBadge {...props} read={read} t={t} />
      scope.effect(() => registry.register({ id: 'dsh-agent-team-presets', Component }),
        `agent-team-presets: ${service}`)
    }),
  )
  return async () => { await Promise.all(scopes.map(scope => scope.dispose())) }
}
