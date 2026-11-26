# Documentation

Entry point for the `dsh-agent-team-presets` documentation. The [README](../README.md) is the overview and install entry; everything that goes deeper starts here.

[中文](<index.zh.md>)

## Start here

| If you want to… | Read |
|---|---|
| Install the plugin and see it work, screen by screen | [Getting started](guide/getting-started.md) — the illustrated walkthrough |
| Choose an install channel, pin a version, upgrade safely | [Install and upgrade](guide/install.md) |
| Configure a Team, its members, metadata, and categories | [Using Teams](guide/using-teams.md) |
| Understand the private Team Skill library and preset sharing | [Private Team Skills](guide/team-skills.md) |
| Add the subagent card badges | [Integrations](guide/integrations.md) |
| Review agent-facing tools, tool policies, and security boundaries | [Tools and permissions](reference/tools-and-permissions.md) |
| Diagnose a Team, member, or install problem | [Troubleshooting](reference/troubleshooting.md) |
| Know what the eleven built-in Teams contain and what each role is for | [Built-in Teams](builtin-teams.md) |
| Know which Team Skill a role receives, and what those skills do | [Built-in Team Skills](builtin-team-skills.md) |
| Work on the plugin itself | [Architecture and development](developer/architecture.md) |

## Document map

| Document | Covers | In the npm package |
|---|---|---|
| [README.md](../README.md) · [中文](../README.zh.md) | Overview, why, features, quick start, documentation map | yes |
| [docs/guide/getting-started.md](guide/getting-started.md) · [中文](guide/getting-started.zh.md) | The illustrated walkthrough: picking a Team, editing members, the skill library, integrations | no — references screenshots the tarball does not carry |
| [docs/guide/install.md](guide/install.md) · [中文](guide/install.zh.md) | Install channels, registry choice, pinned versions, upgrade safety, verification | yes |
| [docs/guide/using-teams.md](guide/using-teams.md) · [中文](guide/using-teams.zh.md) | Configuring a Team, the member panel, every field, display metadata, categories, search | yes |
| [docs/guide/team-skills.md](guide/team-skills.md) · [中文](guide/team-skills.zh.md) | The private skill store, per-agent scope, import and scanning, dependency checks, preset sharing | yes |
| [docs/guide/integrations.md](guide/integrations.md) · [中文](guide/integrations.zh.md) | Subagent card badges and the prebuilt replacement bundles | yes |
| [docs/reference/tools-and-permissions.md](reference/tools-and-permissions.md) · [中文](reference/tools-and-permissions.zh.md) | Agent-facing tools, policy modes, first-turn registration, security boundaries | yes |
| [docs/reference/troubleshooting.md](reference/troubleshooting.md) · [中文](reference/troubleshooting.zh.md) | Configuration overrides, the built-in troubleshooting skill, common issues, known limitations | yes |
| [docs/developer/architecture.md](developer/architecture.md) · [中文](developer/architecture.zh.md) | How the plugin integrates, source map, development commands | yes |
| [docs/builtin-teams.md](builtin-teams.md) · [中文](builtin-teams.zh.md) | The eleven built-in presets: series, roles, intended use, restore semantics, where the record lives | yes |
| [docs/builtin-team-skills.md](builtin-team-skills.md) · [中文](builtin-team-skills.zh.md) | The fourteen shipped Team Skills: categories, default bindings per role, local overrides, scope | yes |
| `docs/internal/` | Development notes, audits, acceptance and release evidence | no — local working material, excluded from the repository |

Every public document above ships with the package except the illustrated walkthrough, which references screenshots the tarball does not carry. `docs/internal/` is excluded from the repository itself and is never linked from a public page.

## Conventions used in these documents

- **Team names** are given in their original form with the stored identity next to them, for example 轻量研发团队 `builtin-lightweight`. The identity is what a configuration file, an export, or a bug report should quote.
- **Role names** are the exact stored names (`team-lead`, `executor`, `repository-specialist`). They are what a default skill binding matches on, so they are quoted verbatim rather than translated.
- **Skill ids** are the kebab-case names the model uses (`git-release-hygiene`); the Chinese column is a display name only.
- Bilingual documents are kept in step: `X.md` and `X.zh.md` state the same facts.

## Related

- [Getting started](guide/getting-started.md)
- [Using Teams](guide/using-teams.md)
- [Built-in Teams](builtin-teams.md)
- [Built-in Team Skills](builtin-team-skills.md)
