/** Read the effective tool surface, and give a strict policy a settled one. */
import type { Agent, ModelSelection } from '@deepseek-ai/dsh-agent';
/** One read of the model-visible prompt surface of an Agent. */
export interface WireSnapshot {
    readonly sections: readonly {
        readonly name: string;
        readonly text: string;
    }[];
    readonly tools: readonly string[];
}
/**
 * Resolve conditional tools for this inspection and always release the admission.
 * @param agent - the Agent whose next request is being inspected.
 * @param selection - the route to inspect the surface for, when it is not the
 *   Session's current one. A caller about to select a member's route reads the
 *   surface it will actually run on before changing any durable state.
 * @returns the effective sections and tool names, or undefined when assembly failed.
 */
export declare function readWire(agent: Agent, selection?: Readonly<ModelSelection>): Promise<WireSnapshot | undefined>;
export type NativePresentation = {
    readonly kind: 'already-native';
} | {
    readonly kind: 'conflict' | 'unknown';
    readonly reason: string;
};
/**
 * Give a strict policy a settled tool surface without releasing anything.
 *
 * A native Session already has one. On PTC the deployment default is left alone
 * and the core native executor is mounted on THIS Agent's scope: its lifetime is
 * the Agent's, so this module never calls the returned disposer and can never
 * produce rc.1's one-way release. Because the mounted executor is Harness code
 * rather than a closure over this plugin, a plugin unload leaves a working
 * surface instead of a dangling reference. The surface is re-read after mounting;
 * a Session that still exposes the PTC transport is refused rather than silently
 * governed, and a refused Session keeps whatever it had, because nothing was
 * released.
 * @param agent - the Agent the Team is being applied to.
 * @param selection - the route the Session will run on once the application lands.
 * @returns whether a strict policy can govern this Session's tool surface.
 */
export declare function prepareNativePresentation(agent: Agent, selection?: Readonly<ModelSelection>): Promise<NativePresentation>;
export type PersonaBaseline = {
    readonly kind: 'none';
} | {
    readonly kind: 'persona';
    readonly text: string;
} | {
    readonly kind: 'foreign';
    readonly name: string;
};
/** Classify the complete deployment persona before applying a Team. */
export declare function personaBaseline(sections: WireSnapshot['sections']): PersonaBaseline;
