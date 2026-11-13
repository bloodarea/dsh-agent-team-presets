/**
 * The card-patch integrations page: one row per supported target plugin, what
 * its installed bundle currently is, and the one action that state allows.
 *
 * The page never decides whether a patch is applicable — the Host classifies the
 * installed bytes — and it never claims a patch is working on its own: a row is
 * "active" only when the running browser actually has the replacement's service,
 * which happens after a restart and a reload, not when the file is written.
 */
import type { CardPatchesController } from './card-patches-controller.ts';
import type { TeamPresetsLocaleKey } from './locales.ts';
/** Page copy reader. */
type Translate = (key: TeamPresetsLocaleKey) => string;
/** Props of the integrations page. */
export interface CardPatchViewProps {
    /** Page state and the two write actions. */
    readonly controller: CardPatchesController;
    /** Page copy reader. */
    readonly t: Translate;
}
/**
 * Render the integrations page.
 * @param props - the controller and the page copy.
 * @returns the target rows and the confirmation dialog.
 */
export declare function CardPatchView({ controller, t }: CardPatchViewProps): import("react").JSX.Element;
export {};
