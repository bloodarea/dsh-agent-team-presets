# Development status

This repository holds the source of `dsh-agent-team-presets`. It is a **source
release**, not yet an independently installable package. This file records what
works today, what is blocked, and what has to happen for the standalone path.

## What works today

The plugin runs as a package inside a DeepSeek Harness source checkout:

- `packages/experimental/agent-team-presets/` in a checkout at the `0.2.0-rc`
  line, built and tested through that checkout's workspace tooling.
- Its runtime coupling to the rest of the harness is through Cordis services
  (`ctx.agentTeams`, `ctx.agentTeamAppearance`) plus `import type` declarations.
  Every import of `@deepseek-ai/dsh-experimental-agent-team` and
  `@deepseek-ai/dsh-experimental-client-ui-agent-team` in `src/` is type-only
  and erases at build time.

## What is blocked

Two independent blockers, both outside this repository.

1. **The needed packages are not published at the required version.** npm
   currently carries the `@deepseek-ai/dsh-*` line at `0.0.1-rc.1` /
   `0.1.0-rc.6`, and the Agent Teams packages at `0.1.5-alpha.2`. This plugin
   targets `>=0.2.0-rc.1 <0.3.0`, and it needs `AgentTeamAppearance` from
   `@deepseek-ai/dsh-experimental-client-ui-agent-team`, which is not in any
   published version yet.

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

Then sync the source here. `lib/` is intentionally not committed while the
bundle identity is unsettled.

## What unblocks the standalone path

1. The `@deepseek-ai/dsh-*` `0.2.0-rc` line is published, including
   `@deepseek-ai/dsh-experimental-client-ui-agent-team` with
   `AgentTeamAppearance`.
2. This repository gets a self-contained build: local `tsconfig` files that
   resolve dependencies from `node_modules` instead of workspace project
   references, and a local client-bundle preset that produces the module-loader
   artifact without reading the checkout.
3. `lib/` is then built here and committed, so the package installs straight
   from this repository.

## Repository layout

| Path | Purpose |
| --- | --- |
| `src/` | Host half (`index.ts`, `application.ts`, `config.ts`, `presets.ts`, `tool-catalog.ts`), client half (`src/client/`), and the Typert remote contract. |
| `tests/` | Unit, composition, and locale suites. |
| `cordis.patch.yml` | The bundle patch that inserts this plugin's row. |
| `locale/` | Localized display metadata for the plugin list. |
| `tsconfig.*.json`, `tsdown.config.ts` | Build configuration, currently coupled to the checkout. |
