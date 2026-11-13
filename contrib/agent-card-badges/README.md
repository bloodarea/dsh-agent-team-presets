# Agent card badge service patches

These source patches add an optional Client Cordis service owned by each target plugin. They do not install themselves or modify an installed plugin. Apply and rebuild the target plugin before installing its resulting package.

**In the preset plugin itself you do not need any of this by hand.** The same change ships as prebuilt replacement bundles and is offered in *Settings → Agent Team presets → Integrations*, which installs and restores them with a backup. Use the patches below when you want to build the target yourself, review the change, or send it upstream.

| Patch | Exact baseline | Service | Rendered surfaces |
| --- | --- | --- | --- |
| `dsh-context-0.84.0-aa98b1231d5f.patch` | dsh-context 0.84.0, commit `aa98b1231d5f0f8e833391f198e65e14e73b3323` | `contextAgentCardBadges` | Shared AgentCard header used by the fleet view and context view/sidebar |
| `dsh-better-sidebar-0.32.0.patch` | dsh-better-sidebar 0.32.0 published source payload | `betterSidebarAgentCardBadges` | Tasks graph CardTop badge row and Tasks tree title row |

Context source: <https://github.com/bowenliang123/dsh-context/tree/aa98b1231d5f0f8e833391f198e65e14e73b3323>. Its published package contains the minified Client artifact, so this patch targets the matching source checkout, not `lib/client.js`. The sidebar baseline is the source shipped in the installed 0.32.0 package. Do not apply either patch to a different version without reviewing the full diff.

## Contract

Both services expose exactly the same versioned protocol:

```ts
import type { ComponentType } from 'react'

interface AgentCardBadgesService {
  readonly version: 1
  register(entry: {
    id: string
    Component: ComponentType<{ sessionId: string }>
  }): () => void
}
```

Consumers activate separately with optional Cordis injection, check `version === 1`, and own the returned registration disposer with their own `ctx.effect`. For example, inside the consumer's Client `apply`:

```ts
ctx.inject(['contextAgentCardBadges'], (inner) => {
  const service = inner.get('contextAgentCardBadges') as AgentCardBadgesService
  if (service.version !== 1) return
  inner.effect(() => service.register({ id: 'team-presets', Component: PresetBadge }), 'preset badge: context')
})
ctx.inject(['betterSidebarAgentCardBadges'], (inner) => {
  const service = inner.get('betterSidebarAgentCardBadges') as AgentCardBadgesService
  if (service.version !== 1) return
  inner.effect(() => service.register({ id: 'team-presets', Component: PresetBadge }), 'preset badge: sidebar')
})
```

Do not make these two services required dependencies of the consumer. A target that is absent, disabled, or unpatched contributes no service and leaves that integration inactive. The target services are generic: they do not import the preset plugin, query its Remote API, or decide which sessions receive a preset badge. The registered component performs that lookup and renders `null` when appropriate.

Each target creates one registry inside its Client `apply`, publishes only `version` and `register` with `ctx.provide`, and registers registry disposal with `ctx.effect`. The renderer and disposal functions stay private to that activation and are passed explicitly down the existing component construction path. There is no global registry, DOM injection, or assumed slot API.

Registration and unregistration publish a new snapshot and notify subscribed cards through `useSyncExternalStore`. Empty IDs and duplicate live IDs throw. Each returned disposer is idempotent; an old disposer cannot remove a later registration with the same ID. Target disposal clears registrations, notifies mounted subscribers, clears listeners, and rejects subsequent registrations. Consumer disposal removes its contribution through its effect.

Each contributed component has its own error boundary, so a failing badge does not replace the card or other contributions. Re-registering a contribution or changing sessions resets that boundary. Components receive only `sessionId` and must own their asynchronous cleanup, translations, theme styling, and query caching.

## Session identity and layout

Context's `AgentNode.id` is the actual session ID. Sidebar agent nodes use `childAddress.childSessionId` when present; otherwise `wfmember:*` placeholders are skipped and ordinary root/catalog nodes use `node.id`. Workflow run and fold cards never render this contribution. Graph `parentId` values are not used as session IDs; they may identify workflow runs.

Badges render in the existing inline header/title badge area. The contribution container does not wrap, is limited to 90px wide and one em high (maximum 16px), and clips overflow. Keep badge content short and non-interactive. Context's existing 116px/92px card geometry remains unchanged. A component that renders `null` adds no badge text; the registry wrapper can still participate in the existing flex gap while that contribution is registered.

## Apply and build

Use separate clean source checkouts or copies; do not patch the active installation in place. From each matching target package root:

```sh
git apply --check /absolute/path/to/the-matching.patch
git apply /absolute/path/to/the-matching.patch
```

Then use that target's own build toolchain and packaging process. For context, the pinned checkout defines `pnpm run build` (`tsdown`). For sidebar, the source repository's `pnpm run build` generates the Mermaid asset, declarations, and `tsdown` Client bundle. The published sidebar payload does not include all build scripts/configuration; use its matching source repository for a full rebuild. Source edits alone do not update the minified Client artifact loaded by DSH.

Install the resulting package through the normal plugin manager. A replaced `lib/client.js` does not need a restart: the Web composition's `client-hmr` transport republishes changed bundles and the page reloads that plugin in place. Keep the original package available for rollback. Normal upstream upgrades overwrite these downstream changes; rebase/review the patches before upgrading.

## Shipped prebuilt replacements

`assets/card-patches/*.client.js.gz` are these same patches applied and built, so the integrations page can install them offline. Each is pinned to one target version and recorded with the sha256 of both the published bundle and the replacement; the page refuses any other state. `assets/card-patches/licenses/` carries both upstream license texts, and `NOTICE` states what changed.

## Verification performed

- Generated each patch against pristine, tracked copies of the exact target files.
- Created a separate clean directory from each baseline and passed `git apply --check`, actual `git apply`, and `git apply --reverse --check`.
- Type-checked both new registry modules using the workspace TypeScript and React types with `--strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution bundler --jsx react-jsx`.
- Reviewed explicit renderer propagation through both context view factories, the shared context AgentCard, sidebar built-in task tab, SubagentView, TasksGraph, TasksTree, and CardTop.

These checks establish source applicability and the new modules' types. They do not establish a full target build, runtime mounting, or visual acceptance in the active GUI; those require rebuilt target packages and a deployment verification.
