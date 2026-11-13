import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { NS } from "./locales.js";
import css from './agent-card-badges.module.css';
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
export function showsPresetBadge(answer, sessionId) {
    return answer !== undefined && answer.sessionId === sessionId && answer.managed;
}
/** Inline text stays empty until durable creation identity is confirmed. */
function PresetMemberBadge({ sessionId, read, t }) {
    const [answer, setAnswer] = useState();
    useEffect(() => {
        let active = true;
        void read(sessionId).then(managed => {
            if (active)
                setAnswer({ sessionId, managed });
        }, (error) => {
            if (active)
                console.warn('[team-presets] could not read card ownership:', error);
        });
        return () => { active = false; };
    }, [sessionId, read]);
    if (!showsPresetBadge(answer, sessionId))
        return null;
    return _jsx("span", { className: css.badge, title: t('presetMemberBadgeHint'), children: t('presetMemberBadge') });
}
/**
 * Bind each adapter independently. Missing targets leave only a pending Cordis
 * injection; their removal releases the registration and its mounted content.
 * The target packages are deliberately absent from dsh.client.inject and imports.
 * @param ctx - the original plugin context, before creating fixed injection scopes.
 */
export function registerAgentCardBadgeAdapters(ctx) {
    const services = ['contextAgentCardBadges', 'betterSidebarAgentCardBadges'];
    const scopes = services.map(service => ctx.inject(['remote.teamPresets', 'locale', service], scope => {
        const registry = scope[service];
        if (registry.version !== 1) {
            console.warn(`[team-presets] unsupported ${service} version:`, registry.version);
            return;
        }
        const read = async (sessionId) => {
            const result = await scope.remote.teamPresets.isPresetMember(sessionId);
            if (!result.ok)
                throw new Error(result.error.message);
            return result.value;
        };
        const t = scope.locale.bind(NS);
        const Component = (props) => _jsx(PresetMemberBadge, { ...props, read: read, t: t });
        scope.effect(() => registry.register({ id: 'dsh-agent-team-presets', Component }), `agent-team-presets: ${service}`);
    }));
    return async () => { await Promise.all(scopes.map(scope => scope.dispose())); };
}
