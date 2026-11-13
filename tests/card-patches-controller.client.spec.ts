/**
 * The integrations page controller: it mirrors the Host's answer, turns a
 * transport failure into a refusal the page can show, and reports a target as
 * live only when the running browser actually has its service.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { CardPatchesController } from '../src/client/card-patches-controller.ts'
import type { CardPatchResult, CardPatchTargetView } from '../src/types.ts'

/** A wait short enough to keep the cases fast: the page never registers here. */
const FAST = { settleTimeoutMs: 60, settlePollMs: 10 }

const contexts: Context[] = []
afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose()
})

/** One target row as the Host would report it. */
function row(state: CardPatchTargetView['state'], detail?: string): CardPatchTargetView {
  return {
    id: 'dsh-context',
    packageName: 'dsh-context',
    source: 'example/context@abc',
    supportedVersion: '0.84.0',
    installedVersion: '0.84.0',
    state,
    ...detail === undefined ? {} : { detail },
  }
}

/**
 * Build a client context whose Team presets namespace is the supplied double.
 * @param answer - rows for `cardPatches`.
 * @param write - result for the two write methods.
 * @returns the context and the mocks.
 */
function harness(
  answer: CardPatchTargetView[],
  write: CardPatchResult,
  options: { readonly installRejects?: Error; readonly readRejects?: Error } = {},
) {
  const ctx = new Context()
  contexts.push(ctx)
  ctx.provide('remote')
  const cardPatches = options.readRejects === undefined
    ? vi.fn().mockResolvedValue({ ok: true, value: answer })
    : vi.fn().mockRejectedValue(options.readRejects)
  const installCardPatch = options.installRejects === undefined
    ? vi.fn().mockResolvedValue({ ok: true, value: write })
    : vi.fn().mockRejectedValue(options.installRejects)
  const uninstallCardPatch = vi.fn().mockResolvedValue({ ok: true, value: write })
  const namespace = { cardPatches, installCardPatch, uninstallCardPatch }
  // The browser resolves a namespace through the `remote` object, so a stub has
  // to appear in both places: the object the injected scope reads and the service
  // name that scope declares.
  ;(ctx as unknown as { remote: unknown }).remote = { teamPresets: namespace }
  ctx.provide('remote.teamPresets', namespace as never)
  return { ctx, cardPatches, installCardPatch, uninstallCardPatch }
}

describe('CardPatchesController', () => {
  it('publishes the rows it read and settles from loading to ready', async () => {
    const { ctx } = harness([row('pristine')], { ok: true, id: 'dsh-context', state: 'patched' })
    const controller = new CardPatchesController(ctx, FAST)
    await vi.waitFor(() => { expect(controller.getSnapshot().status).toBe('ready') })
    expect(controller.getSnapshot().targets).toHaveLength(1)
    expect(controller.getSnapshot().live).toEqual([])
    controller.dispose()
  })

  it('keeps the Host refusal text and re-reads the rows afterwards', async () => {
    const refusal: CardPatchResult = { ok: false, id: 'dsh-context', state: 'foreign', detail: 'its browser bundle matches neither build' }
    const { ctx, cardPatches } = harness([row('foreign', refusal.detail)], refusal)
    const controller = new CardPatchesController(ctx, FAST)
    await vi.waitFor(() => { expect(controller.getSnapshot().status).toBe('ready') })
    const readsAfterMount = cardPatches.mock.calls.length
    await controller.install('dsh-context')
    const snapshot = controller.getSnapshot()
    expect(snapshot.result).toEqual(refusal)
    expect(snapshot.busy).toBeUndefined()
    // The page re-reads every row after a write, so a stale row cannot survive it.
    expect(cardPatches.mock.calls.length).toBeGreaterThan(readsAfterMount)
    controller.dispose()
  })

  it('reports a transport failure as a refusal instead of a silent success', async () => {
    const { ctx } = harness([row('pristine')], { ok: true, id: 'dsh-context', state: 'patched' }, {
      installRejects: new Error('socket closed'),
    })
    const controller = new CardPatchesController(ctx, FAST)
    await vi.waitFor(() => { expect(controller.getSnapshot().status).toBe('ready') })
    await controller.install('dsh-context')
    expect(controller.getSnapshot().result).toMatchObject({ ok: false, id: 'dsh-context' })
    controller.dispose()
  })

  it('reports a target as live only when its service is registered in this browser', async () => {
    const { ctx } = harness([row('patched')], { ok: true, id: 'dsh-context', state: 'patched' })
    const controller = new CardPatchesController(ctx, FAST)
    await vi.waitFor(() => { expect(controller.getSnapshot().status).toBe('ready') })
    expect(controller.getSnapshot().live).toEqual([])
    // The replacement registers this service only once the patched bundle is served.
    ctx.provide('contextAgentCardBadges', { version: 1, register: () => () => {} })
    await controller.refresh()
    expect(controller.getSnapshot().live).toEqual(['dsh-context'])
    controller.dispose()
  })

  it('waits for the page to load the replacement and reports the row live on its own', async () => {
    const { ctx } = harness([row('pristine')], { ok: true, id: 'dsh-context', state: 'patched' })
    const controller = new CardPatchesController(ctx, { settleTimeoutMs: 800, settlePollMs: 10 })
    await vi.waitFor(() => { expect(controller.getSnapshot().status).toBe('ready') })
    const write = controller.install('dsh-context')
    // The Host republishes the bundle; the page swaps the plugin a moment later,
    // which is the only moment this row may call itself active.
    setTimeout(() => { ctx.provide('contextAgentCardBadges', { version: 1, register: () => () => {} } as never) }, 40)
    await write
    expect(controller.getSnapshot().live).toEqual(['dsh-context'])
    controller.dispose()
  })

  it('refuses to write when this session mounted no Team presets Remote', async () => {
    // The write path may only go through the injected namespace; a session
    // without it must report a refusal instead of throwing at the reader.
    const ctx = new Context()
    contexts.push(ctx)
    ctx.provide('remote')
    const controller = new CardPatchesController(ctx, FAST)
    await controller.install('dsh-context')
    expect(controller.getSnapshot().result).toMatchObject({ ok: false, id: 'dsh-context' })
    expect(controller.getSnapshot().result?.detail).toContain('Remote')
    controller.dispose()
  })

  it('leaves the page unavailable when the namespace cannot be read', async () => {
    const { ctx } = harness([], { ok: true, id: 'dsh-context', state: 'patched' }, {
      readRejects: new Error('no contract'),
    })
    const controller = new CardPatchesController(ctx, FAST)
    await vi.waitFor(() => { expect(controller.getSnapshot().status).toBe('unavailable') })
    controller.dispose()
  })
})
