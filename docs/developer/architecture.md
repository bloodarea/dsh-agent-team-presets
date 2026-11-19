# Architecture

How `dsh-agent-team-presets` is put together: the lifecycle extension points it uses, where each concern lives under `src/`, and what a source checkout needs before the test suite runs.

[中文](<architecture.zh.md>) · [Documentation index](../index.md) · [README](../../README.md)

## How it works

The plugin integrates through Cordis and Harness lifecycle extension points; it does not patch host source code. Four parts carry that:

1. **Profile configuration** — stores Team presets, display metadata, local categories, and the active Session selections.
2. **Session application** — installs the captain persona, tool policy, and `spawn_team_member` at Agent scope. Selecting a single member instead installs that member's role card and tool policy, omits the captain briefing and the member tool, and selects the member's configured model route on the Session.
3. **Member creation and skill scoping** — validates the route and delegation limits, persists an instance snapshot, and launches the subagent. Before the first request, the serial `agent/created` hook injects model selection, persona, tool filters, and **assigned Team Skills strictly into that member's Agent scope**.
4. **Private skill manager** — owns skill storage (`~/.dsh/agent-team-presets/team-skills`), crash-recovery journaling, dependency resolution, and guarded deletion.

The Harness subagent runtime owns collaboration at runtime; this plugin owns configuring, managing, isolating, and reusing teams and their skills. No Agent Teams bundle is required: members are created through the deployment's continuable subagent providers (default backend names `spawn` and `fork`), and native messaging, task tools, and the Web roster are unaffected.

A preset role is a template. Summoning creates an instance with a unique target such as `executor` or `executor-2`; continuing an existing instance means `send_message` with that target rather than spawning a new one.

## Source map

| Area | Source |
|---|---|
| Plugin lifecycle and settings reconciliation | [src/index.ts](../../src/index.ts), [src/settings-reconcile.ts](../../src/settings-reconcile.ts) |
| Built-in team catalog and series | [src/builtin-teams.ts](../../src/builtin-teams.ts), [src/team-catalog.ts](../../src/team-catalog.ts) |
| Team application and member tool | [src/application.ts](../../src/application.ts) |
| Member snapshots and runtime injection | [src/member-store.ts](../../src/member-store.ts), [src/member-identity.ts](../../src/member-identity.ts), [src/member-runtime.ts](../../src/member-runtime.ts) |
| Private Team Skills subsystem | [src/team-skills/store.ts](../../src/team-skills/store.ts), [src/team-skills/manager.ts](../../src/team-skills/manager.ts), [src/team-skills/service.ts](../../src/team-skills/service.ts), [src/team-skills/tools.ts](../../src/team-skills/tools.ts) |
| Tool policies and presentation | [src/tool-policy.ts](../../src/tool-policy.ts), [src/presentation.ts](../../src/presentation.ts) |
| Preset tools and transfer | [src/preset-tools.ts](../../src/preset-tools.ts), [src/preset-transfer.ts](../../src/preset-transfer.ts) |
| Browser client UI | [src/client/](../../src/client/) |

## Development

Source development requires a compatible, dependency-installed [Harness checkout](https://github.com/deepseek-ai/deepseek-harness) with its Host types and generated Typert Remote artifacts built first (the Harness `build:lib:host` pipeline provides them):

```sh
export DSH_CHECKOUT=/absolute/path/to/deepseek-harness
npm test
npm run typecheck
npm run bundle
```

Bug reports and pull requests are welcome at [GitHub Issues](https://github.com/bloodarea/dsh-agent-team-presets/issues) and [Pull requests](https://github.com/bloodarea/dsh-agent-team-presets/pulls).

Thanks to **张灏焱** for contributing the `grilling` and `research` method Team Skills (PR #2), and to Matt Pocock for the upstream [skills](https://github.com/mattpocock/skills) they adapt (MIT, see [NOTICE](../../NOTICE)).

## Related

- [Documentation index](../index.md) — the full document map.
- [Built-in Teams](../builtin-teams.md) — the nine shipped presets and their roles.
- [Built-in Team Skills](../builtin-team-skills.md) — the ten shipped skills and per-role bindings.
- [Getting started](../guide/getting-started.md) — the illustrated walkthrough.
- [README](../../README.md) — overview, quick start, and the documentation map.
