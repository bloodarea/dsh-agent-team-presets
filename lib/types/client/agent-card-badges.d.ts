/** Optional adapters for the card registries owned by Fleet and Tasks. */
import type { Context } from '@deepseek-ai/cordis';
import type { ComponentType } from 'react';
/** Only real Session identities cross the card extension interface. */
export interface AgentCardBadgeProps {
    readonly sessionId: string;
}
/** Version 1 of the optional card registry supplied by each target plugin. */
export interface AgentCardBadgeRegistry {
    readonly version: 1;
    /** Register inline content; disposing the registration removes it from all cards. */
    register(entry: {
        readonly id: string;
        readonly Component: ComponentType<AgentCardBadgeProps>;
    }): () => void;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Optional extension supplied by the patched dsh-context Fleet view. */
        contextAgentCardBadges: AgentCardBadgeRegistry;
        /** Optional extension supplied by the patched Better Sidebar Tasks view. */
        betterSidebarAgentCardBadges: AgentCardBadgeRegistry;
    }
}
/** One resolved ownership answer, remembered with the card identity it belongs to. */
export interface BadgeAnswer {
    readonly sessionId: string;
    readonly managed: boolean;
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
export declare function showsPresetBadge(answer: BadgeAnswer | undefined, sessionId: string): boolean;
/**
 * Bind each adapter independently. Missing targets leave only a pending Cordis
 * injection; their removal releases the registration and its mounted content.
 * The target packages are deliberately absent from dsh.client.inject and imports.
 * @param ctx - the original plugin context, before creating fixed injection scopes.
 */
export declare function registerAgentCardBadgeAdapters(ctx: Context): () => Promise<void>;
