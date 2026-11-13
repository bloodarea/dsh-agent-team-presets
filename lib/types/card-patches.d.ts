/**
 * Optional card-badge patches for other plugins' Agent cards.
 *
 * Neither dsh-context nor dsh-better-sidebar publishes a card extension point,
 * so marking the subagents a Team created on their cards requires replacing
 * that plugin's browser bundle with one built from the pinned source plus a
 * small registration service. This module owns that replacement: what a
 * supported target is, whether the installed copy is still the published
 * bundle or already ours, and how to swap it in and back out.
 *
 * Nothing here builds anything. Both replacements ship as prebuilt assets
 * (`assets/card-patches`) produced from the exact upstream revision named in
 * the catalog, so an install is an offline file swap. Every decision comes from
 * a content hash: a bundle matching neither the published original nor this
 * build's replacement is refused, because overwriting it would destroy an edit
 * this plugin cannot reproduce.
 *
 * Each target is pinned to one version. A target running any other version
 * reports `unsupported` rather than receiving a bundle built from different
 * source.
 * @module dsh-agent-team-presets/card-patches
 */
import type { CardPatchFileState, CardPatchResult, CardPatchTargetView } from './types.ts';
export type { CardPatchFileState, CardPatchResult, CardPatchTargetView };
/** One target plugin this build can patch, pinned to the version it was built for. */
export interface CardPatchTarget {
    /** Stable identity used by the settings page and the Remote methods. */
    readonly id: string;
    /** Package whose browser bundle is replaced. */
    readonly packageName: string;
    /** The one version this build's bundle was produced from. */
    readonly version: string;
    /** Upstream revision the bundle was built from, for the operator's audit. */
    readonly source: string;
    /** Prebuilt replacement, relative to `assets/card-patches`. */
    readonly asset: string;
    /**
     * Service name the replacement registers. The settings page reads its
     * presence in the live client to tell an installed patch from one that is on
     * disk but not yet served.
     */
    readonly service: string;
    /** sha256 of the bundle the package publishes; the only state one may overwrite. */
    readonly pristineSha256: string;
    /** sha256 of the prebuilt replacement; the only state one may restore from. */
    readonly patchedSha256: string;
}
/**
 * The supported targets.
 *
 * Each entry is fixed to one upstream version on purpose: the replacement is a
 * whole-bundle build, so a different version's bundle would silently change
 * behaviour that was never reviewed here.
 */
export declare const CARD_PATCH_TARGETS: readonly CardPatchTarget[];
/**
 * The file-system facts one patch operation depends on.
 *
 * Injected rather than read from ambient state so a test can point at a fixture
 * package instead of the running profile.
 */
export interface CardPatchEnvironment {
    /** Resolve one package name to its directory, or undefined when it is absent. */
    resolvePackage(packageName: string): string | undefined;
    /** Absolute directory this plugin owns for backups. */
    backupDirectory(): string;
    /** Absolute directory holding the prebuilt replacements. */
    assetDirectory(): string;
}
/** The real environment: the running profile's packages and this plugin's directories. */
export declare const realCardPatchEnvironment: CardPatchEnvironment;
/**
 * Classify one installed target without changing anything.
 * @param target - the catalog entry.
 * @param env - the file-system facts to read through.
 * @returns the row the settings page renders.
 */
export declare function targetState(target: CardPatchTarget, env?: CardPatchEnvironment): CardPatchTargetView;
/**
 * Replace one target's browser bundle with the prebuilt replacement.
 *
 * The installed bytes are copied into this plugin's backup directory before the
 * replacement is written, and the write is a rename of a sibling file, so a
 * failure leaves the original in place. A target whose bundle is not the exact
 * published build is refused: restoring it later could not reproduce an edit
 * this plugin never saw.
 * @param target - the catalog entry.
 * @param env - the file-system facts to act through.
 * @returns the outcome and the resulting state.
 */
export declare function installCardPatch(target: CardPatchTarget, env?: CardPatchEnvironment): CardPatchResult;
/**
 * Restore one target's published browser bundle from this plugin's backup.
 * @param target - the catalog entry.
 * @param env - the file-system facts to act through.
 * @returns the outcome and the resulting state.
 */
export declare function uninstallCardPatch(target: CardPatchTarget, env?: CardPatchEnvironment): CardPatchResult;
/**
 * Resolve one catalog entry by target id.
 * @param id - the settings page's row identity.
 * @returns the entry, or undefined for an id this build does not ship.
 */
export declare function findCardPatchTarget(id: string): CardPatchTarget | undefined;
