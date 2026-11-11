/** Read the effective tool surface, and give a strict policy a settled one. */
import type { Agent, ModelSelection } from '@deepseek-ai/dsh-agent'
import { assembleContextFor } from '@deepseek-ai/dsh-agent'
import { RUN_CODE_NAME } from '@deepseek-ai/dsh-tools'
import type { ResolvedToolSet } from '@deepseek-ai/dsh-tools'
import { NativeToolExecutor } from '@deepseek-ai/dsh-tool-executor-native'
import { PERSONA_PREFIX_SECTION } from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-system-prompt'

/** One read of the model-visible prompt surface of an Agent. */
export interface WireSnapshot {
  readonly sections: readonly { readonly name: string; readonly text: string }[]
  readonly tools: readonly string[]
}

/**
 * Resolve conditional tools for this inspection and always release the admission.
 * @param agent - the Agent whose next request is being inspected.
 * @param selection - the route to inspect the surface for, when it is not the
 *   Session's current one. A caller about to select a member's route reads the
 *   surface it will actually run on before changing any durable state.
 * @returns the effective sections and tool names, or undefined when assembly failed.
 */
export async function readWire(agent: Agent, selection?: Readonly<ModelSelection>): Promise<WireSnapshot | undefined> {
  let toolSet: ResolvedToolSet | undefined
  try {
    const modelSelection = selection ?? agent.model.current()
    const signal = new AbortController().signal
    if (modelSelection !== undefined) {
      toolSet = await agent.ctx.tools.resolve({ agent, modelSelection, signal })
    }
    const assembly = await agent.ctx.systemPrompt.assemble({
      ...assembleContextFor(agent, signal),
      ...modelSelection === undefined ? {} : { modelSelection },
      ...toolSet === undefined ? {} : { toolSet },
    })
    return {
      sections: assembly.sections.map(section => ({ name: section.name, text: section.text })),
      tools: assembly.tools.map(tool => tool.name),
    }
  } catch {
    return undefined
  } finally {
    toolSet?.dispose()
  }
}

export type NativePresentation =
  | { readonly kind: 'already-native' }
  | { readonly kind: 'conflict' | 'unknown'; readonly reason: string }

/**
 * One mount attempt per Agent. The core native executor is registered on the
 * Agent's own scope, so its lifetime is the Agent's; caching the attempt keeps a
 * second Team application from racing a second registration, which the tool
 * registry refuses in one scope.
 */
const nativeMounts = new WeakMap<Agent, Promise<boolean>>()

/**
 * Register the core native tool executor on one Agent scope, once.
 *
 * The registration is made through `agent.ctx.tools`, which targets this Agent's
 * scope, and the disposer is deliberately never called: the effect belongs to the
 * Agent's context, so it is released exactly when the Agent is destroyed, which is
 * the only moment at which releasing cannot poison a live selection.
 * @param agent - the Agent whose strict policy needs a native surface.
 * @returns whether the Agent now owns a native executor registration.
 */
async function mountNativeExecutor(agent: Agent): Promise<boolean> {
  const cached = nativeMounts.get(agent)
  if (cached !== undefined) return cached
  const attempt = (async () => {
    try {
      agent.ctx.tools.setExecutor(new NativeToolExecutor(agent.ctx))
      return true
    } catch {
      return false
    }
  })()
  nativeMounts.set(agent, attempt)
  return attempt
}

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
export async function prepareNativePresentation(
  agent: Agent,
  selection?: Readonly<ModelSelection>,
): Promise<NativePresentation> {
  const before = await readWire(agent, selection)
  if (before === undefined) {
    return {
      kind: 'unknown',
      reason: 'This Session\'s effective tool presentation could not be read, so a strict custom tool policy cannot be applied.',
    }
  }
  if (!before.tools.includes(RUN_CODE_NAME)) return { kind: 'already-native' }
  if (!await mountNativeExecutor(agent)) {
    return {
      kind: 'conflict',
      reason: 'Custom Team tool policies need a native tool surface, and this Session uses PTC. '
        + 'Mounting the native executor on this Session failed, so nothing was released and the current tool surface is unchanged. '
        + 'Use the "all" tool mode, or start the conversation on a native Agent preset.',
    }
  }
  const after = await readWire(agent, selection)
  if (after === undefined || after.tools.includes(RUN_CODE_NAME)) {
    return {
      kind: 'conflict',
      reason: 'Custom Team tool policies need a native tool surface. '
        + 'The native executor is mounted on this Session but the effective tool surface still exposes the general purpose PTC transport, '
        + 'so a strict custom policy cannot govern it. Use the "all" tool mode, or start the conversation on a native Agent preset.',
    }
  }
  return { kind: 'already-native' }
}

export type PersonaBaseline =
  | { readonly kind: 'none' }
  | { readonly kind: 'persona'; readonly text: string }
  | { readonly kind: 'foreign'; readonly name: string }

/** Classify the complete deployment persona before applying a Team. */
export function personaBaseline(sections: WireSnapshot['sections']): PersonaBaseline {
  if (sections.length !== 1) return { kind: 'none' }
  const only = sections[0]!
  return only.name === PERSONA_PREFIX_SECTION
    ? { kind: 'persona', text: only.text }
    : { kind: 'foreign', name: only.name }
}
