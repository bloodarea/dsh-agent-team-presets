# Development status

This repository holds the source and prebuilt artifacts of
`dsh-agent-team-presets`. It is an **installable community plugin** for a
compatible DeepSeek Harness: `dsh plugin add github:bloodarea/dsh-agent-team-presets#v0.1.3`
installs the committed `lib/` without building. Developing and rebuilding the
plugin still requires a DeepSeek Harness source checkout. This file distinguishes
that source-build limitation from the supported installation path.

## What works today

The plugin installs from GitHub into a compatible Harness using its prebuilt
artifacts. Source development runs inside a DeepSeek Harness checkout:

- `packages/experimental/agent-team-presets/` in a checkout at the `0.2.0-rc`
  line, built and tested through that checkout's workspace tooling.
- Its runtime coupling to the rest of the harness is through Cordis services
  (`ctx.agentTeams`, `ctx.agentTeamAppearance`) plus `import type` declarations.
  Every import of `@deepseek-ai/dsh-experimental-agent-team` and
  `@deepseek-ai/dsh-experimental-client-ui-agent-team` in `src/` is type-only
  and erases at build time.

## What limits standalone source builds

These limitations concern rebuilding from source, not installing the prebuilt
plugin into a compatible Harness.

1. **Source dependencies must match the supported Harness API.** This plugin
   targets `>=0.2.0-rc.1 <0.3.0`, including `AgentTeamAppearance` from
   `@deepseek-ai/dsh-experimental-client-ui-agent-team`. Older published package
   versions cannot substitute for these APIs. The supported development workflow
   resolves them through the matching Harness workspace.

2. **The build is monorepo-coupled.** `tsconfig.*.json` extends the checkout's
   base configs and references workspace projects; `tsdown.config.ts` imports
   the checkout's shared client-bundle preset. That preset emits the
   `window.__ModuleLoader__.load({ id, factory })` artifact the harness client
   loads, and it reads files that only exist in the checkout. The bundle `id` is
   baked into the artifact, so a build produced from the monorepo under the old
   package name would not load under this package name.

   The workspace copy also cannot take this package name. That checkout pairs
   `packages/experimental/` with an `@deepseek-ai/dsh-experimental-` name:
   `packages/client/tsdown.client.ts` derives "may this client bundle inline
   experimental inputs" from the bundle id, and the id has to equal the package
   name because it becomes the `/plugins/<id>/client.js` resource. Renaming the
   workspace copy makes its own `lib/` artifact an experimental input to its own
   bundle, and the build fails with `client bundle isolation (<name>):
   experimental input`. `tools/sync-from-monorepo.mjs` performs the rename
   instead.

## Current development workflow

Develop and test inside a DeepSeek Harness source checkout at the `0.2.0-rc`
line:

```sh
# from the checkout root
npx vitest run packages/experimental/agent-team-presets
npx tsc -b packages/experimental/agent-team-presets/tsconfig.client.json
pnpm --filter @deepseek-ai/dsh-experimental-agent-team-presets run bundle
```

Then sync the source here. `lib/` is committed: `dsh plugin add github:...`
installs this package as-is, so the build output has to be in the repository.
The sync tool copies it and rewrites the package name inside it.

## What unblocks the standalone path

1. The `@deepseek-ai/dsh-*` `0.2.0-rc` line is published, including
   `@deepseek-ai/dsh-experimental-client-ui-agent-team` with
   `AgentTeamAppearance`.
2. This repository gets a self-contained build: local `tsconfig` files that
   resolve dependencies from `node_modules` instead of workspace project
   references, and a local client-bundle preset that produces the module-loader
   artifact without reading the checkout. Until then `lib/` is produced in the
   workspace checkout and copied by `tools/sync-from-monorepo.mjs`.

## Screenshots

`docs/images/` holds the README screenshots. They come from a clean profile that
loads only the shipped DSH bundles, the Agent Teams bundle, and this package
installed from GitHub, so they show what this plugin adds rather than the
capturing machine's other plugins:

    dsh plugin --profile readme-demo add github:bloodarea/dsh-agent-team-presets
    dsh readme-demo --port 3081

Each capture is the settings dialog element or a clip around the composer, never
the full window: a profile shares the machine's Session store, so a full-window
shot would publish unrelated Session titles.

## Repository layout

| Path | Purpose |
| --- | --- |
| `src/` | Host half (`index.ts`, `application.ts`, `config.ts`, `presets.ts`, `tool-catalog.ts`), client half (`src/client/`), and the Typert remote contract. |
| `tests/` | Unit, composition, and locale suites. |
| `lib/` | Built output, committed so `dsh plugin add github:...` installs a runnable package. |
| `locale/` | Localized display metadata for the plugin list. |
| `docs/images/` | README screenshots. |
| `tools/` | `sync-from-monorepo.mjs`, which copies and renames from the workspace checkout. |
| `cordis.patch.yml` | The bundle patch that inserts this plugin's row. |
| `tsconfig.*.json`, `tsdown.config.ts` | Build configuration, coupled to the checkout. |
