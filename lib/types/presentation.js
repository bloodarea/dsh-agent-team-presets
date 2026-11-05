import { assembleContextFor } from '@deepseek-ai/dsh-agent';
import { RUN_CODE_NAME } from '@deepseek-ai/dsh-tools';
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt';
/**
 * Resolve conditional tools for this inspection and always release the admission.
 * @param agent - the Agent whose next request is being inspected.
 * @param selection - the route to inspect the surface for, when it is not the
 *   Session's current one. A caller about to select a member's route reads the
 *   surface it will actually run on before changing any durable state.
 * @returns the effective sections and tool names, or undefined when assembly failed.
 */
export async function readWire(agent, selection) {
    let toolSet;
    try {
        const modelSelection = selection ?? agent.model.current();
        const signal = new AbortController().signal;
        if (modelSelection !== undefined) {
            toolSet = await agent.ctx.tools.resolve({ agent, modelSelection, signal });
        }
        const assembly = await agent.ctx.systemPrompt.assemble({
            ...assembleContextFor(agent, signal),
            ...modelSelection === undefined ? {} : { modelSelection },
            ...toolSet === undefined ? {} : { toolSet },
        });
        return {
            sections: assembly.sections.map(section => ({ name: section.name, text: section.text })),
            tools: assembly.tools.map(tool => tool.name),
        };
    }
    catch {
        return undefined;
    }
    finally {
        toolSet?.dispose();
    }
}
/**
 * Validate a strict policy without mutating executor selection. In rc.1,
 * setExecutor's disposer leaves an unavailable selection at the exact scope;
 * there is no public operation to restore the inherited executor. Even a
 * probe would poison cancellation, rollback, deselection, and plugin unload.
 * @param agent - the Agent the Team is being applied to.
 * @param selection - the route the Session will run on once the application lands.
 * @returns whether a strict policy can govern this Session's tool surface.
 */
export async function prepareNativePresentation(agent, selection) {
    const before = await readWire(agent, selection);
    if (before === undefined) {
        return {
            kind: 'unknown',
            reason: 'This Session\'s effective tool presentation could not be read, so a strict custom tool policy cannot be applied.',
        };
    }
    if (!before.tools.includes(RUN_CODE_NAME))
        return { kind: 'already-native' };
    return {
        kind: 'conflict',
        reason: 'Custom Team tool policies require a native Agent preset (standard or cordis). '
            + 'This Session uses PTC, and this Harness version cannot restore an inherited executor after a temporary override. '
            + 'Select a native Agent preset before starting the conversation, or use the "all" tool mode.',
    };
}
/** Classify the complete deployment persona before applying a Team. */
export function personaBaseline(sections) {
    if (sections.length !== 1)
        return { kind: 'none' };
    const only = sections[0];
    return only.name === PERSONA_PREFIX_SECTION
        ? { kind: 'persona', text: only.text }
        : { kind: 'foreign', name: only.name };
}
