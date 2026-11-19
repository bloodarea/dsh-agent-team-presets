# Private Team Skills

This plugin keeps its own Team Skill library: folders or `.zip` archives imported into a plugin-owned store and registered **only** inside the Agent scope of the member they are assigned to. A fresh install also ships ten built-in skills, already bound to the roles of the built-in Teams; the inventory is in [Built-in Team Skills](../builtin-team-skills.md).

[中文](<team-skills.zh.md>) · [Documentation index](../index.md) · [README](../../README.md)

## Private store and scope isolation

Skills in Harness are typically registered into the global environment, which exposes every skill to every agent. This plugin adds a private Team Skill subsystem:

1. **Private library:** skills live in a plugin-managed directory (`~/.dsh/agent-team-presets/team-skills` or a storage domain), isolated from host and profile skills.
2. **Per-Agent registration:** when a member is summoned, its assigned skills are registered **exclusively inside that member's Agent scope**. Other members and the captain cannot see or invoke them unless those skills are explicitly assigned to them too.
3. **Official built-in skills:** ten shipped skills in three kinds — six workflow, two delivery, two method — pre-bound to the roles of the built-in Teams. The inventory, the per-role default bindings, and the category filter are documented in [Built-in Team Skills](../builtin-team-skills.md); `agent-subagent-orchestration` is bound only to the captain and the executor, so advisors stay single-threaded.
4. **Local overrides and one-click restore:** built-in skills are read-only by default. A user can create an editable local copy ("本地副本"). When the built-in skill moves to a new plugin version the library reports `updateAvailable`, and the built-in copy is restored with one click (`恢复为插件内置版本`).
5. **Category filter:** the skill library and the member assignment grid each open with a category dropdown (All categories / Workflow / Delivery / Method / Custom). A single skill is drawn exactly as before; the filter only decides which skills are listed, never what a role holds, and the member heading keeps counting every installed skill.
6. **Localized skill names:** the page labels a shipped skill in the reader's language — a Chinese page shows 「Git 提交与发布规范」 where an English page shows `git-release-hygiene`. The mapping is presentation only: the catalogue the model reads, the stored binding, the preset document, and the asset directory all keep the English `skillId`, so switching language or editing a label never touches the storage format and never breaks a cross-deployment import. A skill this build does not ship keeps showing its English id.
7. **Origin labels and badges:** skills carry a color-coded origin tag in every view:

    | Origin | Shown as | Color |
    |---|---|---|
    | Built-in (插件内置) | 插件内置 | blue |
    | Custom (自定义) | 自定义 | purple |
    | Override (本地副本) | 本地副本 | amber |

Isolation is enforced when the member is created, not later: the creation edge waits for that Agent's own registration, so a role whose deployment cannot publish its skills is refused at creation with the reason instead of starting with an empty catalogue. An unreadable private library is likewise refused rather than read as "no assignment".

## Import, directory scan, and dependencies

- **Folder and ZIP import:** import external skill folders or `.zip` packages directly in the Web GUI.
- **Directory scan:** scans candidate folders under the import path and reports eligibility plus the reason for every rejected folder. The absolute library path can be copied with one click.

What a skill declares is checked before a role can rely on it:

| Declared in `SKILL.md` | How it is checked | Effect on assignment |
|---|---|---|
| CLI executable | resolved against the host `PATH`, using `PATHEXT` on Windows; directories and non-executable files do not satisfy it | a missing required executable is flagged and assignment is refused (`dependency-missing`) |
| MCP server | declarative only: listed in the UI (`skillsDeclared`) as an `unverified` dependency | never blocks assignment, and is never connected, launched, or managed by this plugin |

MCP connectivity is an environment-level fact — the server lifecycle belongs to the Harness environment and profile. Once a server is configured and running there, the tools it exposes (`mcp__<server>__<name>`) appear under the MCP tool group in that role's tool configuration and can be authorized through tool policies.

**Guarded deletion:** deletion is blocked while a skill is bound to any team role, used by a running member, or required by another skill. The confirmation dialog lists every holding team and member role (for example `标准研发团队 → executor`) and keeps the confirm button disabled until those bindings are cleared.

## Share presets

**Export** saves one Team as a JSON document (format version 2). **Import preset** reads the document and stages it in the editor.

- **Shared fields:** team name, purpose, display metadata (summary, tags, use cases, quick prompts, notes), captain and member names, descriptions, prompts, and colors.
- **Local fields:** model routes, reasoning effort, tool permissions, and local category bindings are **never exported**; a document that carries them is rejected on import.
- **Name collisions:** replace the existing preset or create a renamed copy. Replacement preserves local routes and tool policies on matched roles.
- Review imported prompts before executing tasks, especially when the document comes from a third party.

## Related

- [Built-in Team Skills](../builtin-team-skills.md) — the ten shipped skills and their default bindings
- [Built-in Teams](../builtin-teams.md) — the nine presets these roles belong to
- [Getting started](./getting-started.md) — the skill library and member page, screen by screen
