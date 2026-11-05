/** Read the effective tool surface without replacing the deployment's executor. */
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
 * Validate a strict policy without mutating executor selection. In rc.1,
 * setExecutor's disposer leaves an unavailable selection at the exact scope;
 * there is no public operation to restore the inherited executor. Even a
 * probe would poison cancellation, rollback, deselection, and plugin unload.
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
