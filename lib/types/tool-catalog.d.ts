/**
 * Host catalog of the tools a Team member's allow-list may name.
 *
 * `ctx.tools.restrict({ allow })` accepts only **global** tool names, so this
 * service projects exactly the global view that restriction validates against:
 * a name it does not list would be refused when the member is summoned.
 * @module dsh-agent-team-presets/tool-catalog
 */
import { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { ToolCatalogValue } from './types.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Remote catalog of restrictable tools for the Team presets settings page. */
        teamPresetsToolCatalog: TeamPresetsToolCatalog;
    }
}
/** Remote catalog of the global tools one Team agent allow-list may name. */
export default class TeamPresetsToolCatalog extends TypertRemoteService {
    static inject: string[];
    /**
     * @param ctx - Host context carrying the tool registry and Typert gateway.
     */
    constructor(ctx: Context);
    /**
     * List every global tool a member allow-list may name.
     *
     * The reserved PTC mode transport is excluded: `ctx.tools.restrict()` refuses
     * it, so offering it as a checkbox would produce a selection the summon path
     * rejects.
     * @returns the tool names and model-facing descriptions, sorted by name.
     */
    catalog(): ToolCatalogValue;
}
//# sourceMappingURL=tool-catalog.d.ts.map