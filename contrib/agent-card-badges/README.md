# Agent card badge service patches

These source patches add an optional Client Cordis service owned by each target plugin. They do not install themselves or modify an installed plugin. Apply and rebuild the target plugin before installing its resulting package.

**In the preset plugin itself you do not need any of this by hand.** The same change ships as prebuilt replacement bundles and is offered in *Settings → Agent Team presets → Integrations*, which installs and restores them with a backup. Use the patches below when you want to build the target yourself, review the change, or send it upstream.

| Patch | Baseline it was generated from | Rebuilt and shipped for | Service | Rendered surfaces |
| --- | --- | --- | --- | --- |
| `dsh-context-0.84.0-aa98b1231d5f.patch` | dsh-context 0.84.0, commit `aa98b1231d5f0f8e833391f198e65e14e73b3323` | 0.84.0, 0.84.1 | `contextAgentCardBadges` | Shared AgentCard header used by the fleet view and context view/sidebar |
| `dsh-better-sidebar-0.32.0.patch` | dsh-better-sidebar 0.32.0 published source payload | 0.32.0, 0.32.1 | `betterSidebarAgentCardBadges` | Tasks graph CardTop badge row and Tasks tree title row |

Context source: <https://github.com/bowenliang123/dsh-context/tree/aa98b1231d5f0f8e833391f198e65e14e73b3323>. Its published package contains the minified Client artifact, so this patch targets the matching source checkout, not `lib/client.js`. The sidebar baseline is the source shipped in the installed 0.32.0 package.

The shipped list above is produced, not hand-maintained: [`tools/card-patches.mjs`](../../tools/card-patches.mjs) rebuilds a patch against any upstream release and refuses to publish unless the result is verified. See [Following upstream releases](#following-upstream-releases).

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

## Following upstream releases

A replacement bundle is a build of the target plugin, so it is tied to one target
version — but that tie is now machine-checked rather than manual. To support a
new release:

```sh
node tools/card-patches.mjs plan    --target dsh-context --version 0.85.0   # what it would need
node tools/card-patches.mjs rebuild --target dsh-context --version 0.85.0   # dry run: clone, patch, build, verify
node tools/card-patches.mjs rebuild --target dsh-context --version 0.85.0 --write
```

`rebuild` is a dry run unless `--write` is passed. The stages are:

| Stage | What it does | What it refuses |
| --- | --- | --- |
| acquire | clones the upstream tag (`v<version>`, or `--ref`), downloads the published `lib/client.js` of the same version | a checkout whose manifest is another version |
| patch | `git apply`, then `git apply --3way`, then `patch --fuzz=3`; all dry-run first | a patch that applies nowhere, with the failing hunks named |
| verify | every file listed in the recipe must still contain the identifiers the change introduces; the built bundle must carry `ctx.provide(<service>)` and stay within 0.9–1.5× the published size | a source that lost the change, or a bundle that is unwrapped, tiny, never registers the service, or is byte-identical to the published build |
| publish | writes `assets/card-patches/<id>-<version>.client.js.gz`, the target's license, and the catalog entry | an existing asset with different bytes, because that artifact may already be installed |

Exit code `2` means the patch needs adaptation: nothing was built, and the patched
checkout is kept so the failing file can be inspected. Exit code `1` is any other
refusal.

**Versions coexist.** The catalog is keyed by target *and* version, so rebuilding
0.85.0 keeps 0.84.0 and 0.84.1 offered. The Integrations page classifies each row
by the version that is actually installed and lists every version the build ships
a replacement for; a profile on an unknown version reports `version not supported`
naming the ones that are supported.

**New entries need no code change.** The pipeline writes
`assets/card-patches/catalog.json`, which the Host merges with the versions
compiled into `src/card-patches.ts`. A build that ships that JSON can patch a
version it was never compiled against; the compiled list remains the fallback.

**Hashes are per build, not reproducible.** Both targets embed a `@built <time>`
comment in their own build output, so rebuilding the same version produces
different bytes. That is why publishing refuses to replace an existing asset: the
recorded hash has to keep describing the file users may already have installed.
Publish each version once.

`node tools/card-patches.mjs verify` re-checks the shipped catalog against the
shipped assets offline and is worth running before a release.

### Installing into a profile without rebuilding this plugin

The Integrations page can only offer the versions compiled into the installed
plugin. When the target plugin has been updated past those, the same verified
replacement can be installed directly:

```sh
node tools/card-patches.mjs apply  --target dsh-context            # current version in the profile
node tools/card-patches.mjs revert --target dsh-context            # put the published bundle back
```

`apply` refuses unless the installed `lib/client.js` hashes to the recorded
`pristineSha256`, writes the replacement atomically, reads it back and checks the
hash, and keeps the original in `$DSH_HOME/agent-team-presets/card-patches/` — the
same backup path the plugin's own **Remove patch** button restores from. `revert`
refuses unless the backup still matches the published build.

This is a stopgap, not a substitute for shipping: the row in the settings page
still reports `version not supported` until a build that names the new version is
installed, because that list is compiled into the plugin.
