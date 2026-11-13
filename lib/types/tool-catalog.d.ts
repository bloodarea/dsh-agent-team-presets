/**
 * Host catalog of the tools a Team member's allow-list may name.
 *
 * Read globals and standing Agent preset scopes without creating Agents. The
 * editor offers their union plus fixed Team operations; application validates
 * the selected Session and strict guards cover exact-Agent registrations.
 * @module dsh-agent-team-presets/tool-catalog
 */
import { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { TeamExecutionMonitor } from './execution.ts';
import type { CardPatchEnvironment } from './card-patches.ts';
import type { CardPatchResult, CardPatchTargetView, TeamExecutionSnapshot, TeamRosterValue, ToolCatalogValue } from './types.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Remote catalog of restrictable tools for the Team presets settings page. */
        teamPresetsToolCatalog: TeamPresetsToolCatalog;
    }
}
/** Plugin configuration of {@link TeamPresetsToolCatalog}. */
export interface TeamPresetsToolCatalogConfig {
    /**
     * Live execution state the settings page streams. A composition that mounts
     * this service without the preset runtime reports an empty board rather than
     * an execution state it cannot know.
     */
    readonly monitor?: TeamExecutionMonitor;
    /**
     * Preset members one Session's Team has summoned, read from the durable member
     * snapshots. Omitted in a composition that mounts no member runtime, which then
     * reports an empty roster instead of inventing members.
     */
    readonly roster?: (sessionId: string) => TeamRosterValue;
    /** Exact child ownership from durable preset creation snapshots. */
    readonly isPresetMember?: (sessionId: string) => Promise<boolean>;
    /**
     * File-system facts card-patch operations act through. Omitted means the
     * running profile, which is what every real deployment wants.
     */
    readonly cardPatches?: CardPatchEnvironment;
}
/** Remote catalog of the deployment's inherited and Team tool names. */
export default class TeamPresetsToolCatalog extends TypertRemoteService {
    static inject: string[];
    private readonly monitor;
    private readonly rosterSource;
    private readonly memberIdentitySource;
    private readonly cardPatchEnvironment;
    /**
     * @param ctx - Host context carrying the tool registry and Typert gateway.
     * @param config - the preset runtime's execution monitor, when it is mounted.
     */
    constructor(ctx: Context, config?: TeamPresetsToolCatalogConfig);
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
    catalog(): Promise<ToolCatalogValue>;
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
    /**
     * List the preset members one Session's Team has summoned.
     *
     * Progressive disclosure: the header control is absent until this answers at
     * least one member, so an unsummoned Team adds nothing to the session chrome.
     * @param sessionId - the Session root whose roster is read.
     * @returns the roster, empty when this Session summoned no preset member.
     */
    roster(sessionId: string): Promise<TeamRosterValue>;
    /**
     * Read preset ownership for a card without loading or resuming its Agent.
     * @param sessionId - the card's real child Session identity.
     * @returns whether this plugin recorded creation of that exact child.
     */
    isPresetMember(sessionId: string): Promise<boolean>;
    /**
     * Tell the Web composition to republish one package's browser bundle.
     *
     * The `client-hmr` transport already stat-polls every bundle, so this is only
     * an accelerator: it makes the page reload the replaced plugin in the same
     * second instead of up to one poll interval later. A Host composition without
     * that service still converges through the poll.
     * @param packageName - the package whose bundle file just changed.
     */
    private publishClientBundle;
    /**
     * Read every supported card patch and its installed bundle state.
     *
     * The list is the catalog this build ships, not what happens to be installed,
     * so the settings page can name a target that is missing or pinned to another
     * version instead of hiding it.
     * @returns one row per supported target, in catalog order.
     */
    cardPatches(): Promise<CardPatchTargetView[]>;
    /**
     * Replace one target's browser bundle with this build's prebuilt replacement.
     * @param id - the target identity from {@link cardPatches}.
     * @returns the outcome, or a refusal naming why nothing changed.
     */
    installCardPatch(id: string): Promise<CardPatchResult>;
    /**
     * Restore one target's published browser bundle from this plugin's backup.
     * @param id - the target identity from {@link cardPatches}.
     * @returns the outcome, or a refusal naming why nothing changed.
     */
    uninstallCardPatch(id: string): Promise<CardPatchResult>;
    execution(signal: AbortSignal): AsyncIterable<TeamExecutionSnapshot>;
}
