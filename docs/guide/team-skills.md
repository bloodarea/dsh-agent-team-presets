# Private Team Skills

This plugin keeps its own Team Skill library: folders or `.zip` archives imported into a plugin-owned store and registered **only** inside the Agent scope of the member they are assigned to. A fresh install also ships fourteen built-in skills, already bound to the roles of the built-in Teams; the inventory is in [Built-in Team Skills](../builtin-team-skills.md).

[中文](<team-skills.zh.md>) · [Documentation index](../index.md) · [README](../../README.md)

## Private store and scope isolation

Skills in Harness are typically registered into the global environment, which exposes every skill to every agent. This plugin adds a private Team Skill subsystem:

1. **Private library:** skills live in a plugin-managed directory (`~/.dsh/agent-team-presets/team-skills` or a storage domain), isolated from host and profile skills.
2. **Per-Agent registration:** when a member is summoned, its assigned skills are registered **exclusively inside that member's Agent scope**. Other members and the captain cannot see or invoke them unless those skills are explicitly assigned to them too.
3. **Official built-in skills:** fourteen shipped skills in three kinds — ten workflow, two delivery, two method — pre-bound to the roles of the built-in Teams. The inventory, the per-role default bindings, and the category filter are documented in [Built-in Team Skills](../builtin-team-skills.md); `agent-subagent-orchestration` is bound only to the captain and the executor, so advisors stay single-threaded.
4. **Local copies and restore:** built-in skills are read-only. Each editable copy gets a unique numbered name, and its creation dialog can optionally move roles already bound to the built-in skill. Restoring resets the copy’s content and returns those roles to the built-in skill.
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

- **Folder import:** choose an external skill folder in the Web interface to add it to the library.
- **Scan import folder:** the scanner uses `SKILL.md`’s `name` to identify each skill. Click **Scan import folder** to publish new skills and updated packages. An update keeps the existing role bindings and dependency settings. A package with a built-in skill name is refused.
- **Edit a scanned skill:** opening the skill library checks whether source files or paths changed, including binary resources. Click **Scan import folder** to publish disk changes. Saving an edit from the skill panel writes back to the source and publishes immediately. Scan any pending disk changes before saving from the panel. A removed source folder leaves the last published version and bindings available.

Team Skill dependencies are stored as library metadata. Import preserves `SKILL.md` byte for byte and warns about each top-level `executables`, `mcpServers`, or `otherSkills` key in its YAML frontmatter. Those keys have no effect on dependency configuration, regardless of their values.

The dependency panel in the Web interface is read-only. To change dependencies for an editable skill, have your DSH agent call `set_team_skill_dependencies` with the skill name or asset ID. Pass the complete declaration as the `dependencies_json` string. Each array can be empty to clear that dependency category. Use `list_team_skills` to find the exact `assetId` for entries in `otherSkills`.

This example sets dependencies for a skill named `report-writer`.

```json
{
  "skill_id": "report-writer",
  "dependencies_json": "{\"executables\":[\"pandoc\"],\"mcpServers\":[{\"serverName\":\"docs\",\"required\":true}],\"otherSkills\":[\"custom:report-style\"]}"
}
```

| Field | What DSH users configure | What the plugin checks |
|---|---|---|
| `executables` | Install each command separately and put it on the `PATH` seen by the running DSH process. On Windows the lookup also uses `PATHEXT`. | Each entry must resolve to an executable file. Missing commands block assignment (`dependency-missing`). |
| `mcpServers` | Set up and enable each server in the DSH profile or composition. Once its tools are available, authorize the `mcp__<server>__<name>` tools in the relevant role's tool policy. | Lists the declarations. Required servers are reported as `unverified`, and MCP declarations never block assignment or establish a connection. |
| `otherSkills` | Install the listed Team Skills separately. To make one available to a role, explicitly assign it to that role as well. | Checks that each asset ID exists in the library. Missing assets block assignment (`dependency-missing`). |

**Guarded deletion:** deletion is blocked while a skill is bound to any team role, used by a running member, or required by another skill. The confirmation dialog lists every holding team and member role (for example `标准研发团队 → executor`) and keeps the confirm button disabled until those bindings are cleared.

## Share presets

**Export** saves one Team as a JSON document (format version 2). **Import preset** reads the document and stages it in the editor.

- **Shared fields:** team name, purpose, display metadata (summary, tags, use cases, quick prompts, notes), captain and member names, descriptions, prompts, and colors.
- **Built-in skill bindings:** version 2 can carry `officialSkills` declarations mapping a built-in skill ID to a role name. The import preview reports invalid declarations and built-in skills missing from this installation. Built-in teams still use their catalog defaults. The document carries neither custom bindings nor skill files.
- **Local fields:** model routes, reasoning effort, tool permissions, and local category bindings are **never exported**; a document that carries them is rejected on import.
- **Name collisions:** replace the existing preset or create a renamed copy. Replacement preserves local routes and tool policies on matched roles.
- Review imported prompts before executing tasks, especially when the document comes from a third party.

## Related

- [Built-in Team Skills](../builtin-team-skills.md) — the fourteen shipped skills and their default bindings
- [Built-in Teams](../builtin-teams.md) — the eleven presets these roles belong to
- [Getting started](./getting-started.md) — the skill library and member page, screen by screen
