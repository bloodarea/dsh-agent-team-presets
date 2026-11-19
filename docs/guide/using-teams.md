# Using Teams

How to configure a Team, start it in a conversation, and what each field on the settings page controls.

[中文](<using-teams.zh.md>) · [Documentation index](../index.md) · [README](../../README.md)

## Configure and use a Team

1. Open **Settings → Agent team presets**.
2. Select a built-in Team, duplicate an existing one, or click **New Team**.
3. Configure its name, purpose, display metadata, category, captain, and member roles.
4. For each member, configure its provider/model route, reasoning effort, tool policy, and assigned Team Skills.
5. Press **Save** in the shared footer. Edits remain staged drafts until saved.
6. Select the Team from the conversation composer's Team control, then prompt the captain to coordinate the task.

Example prompt for a Team with execution and review roles:

> Use the selected Team. Have the executor implement the agreed changes and regression tests, then ask the reviewer to inspect them independently. Summarize changes, test results, and remaining risks.

A preset role is a template. Summoning creates an instance with a unique target such as `executor` or `executor-2`. Use `send_message` with the returned target to continue working with an existing instance rather than spawning a new one.

Selecting **No preset** (`不加载预设`) disarms the Team application once the captain and teammates become idle, restoring standard session contributions without changing the active model.

### Talk to one member directly

Hover a Team row in the composer picker to open its member panel. The captain is listed first with the **Session model** route; every member follows with its configured provider · model and role description.

- Selecting the **captain** applies the Team normally: the captain leads, may summon members, and keeps the model the Session already selected.
- Selecting a **member** starts an individual conversation with that member. Its role card (name, role description, and standing system prompt) becomes the Session persona, its tool policy and assigned Team Skills apply, and the captain briefing plus `spawn_team_member` are **not** installed. The Session model switches to that member's configured provider/model and reasoning effort. A member with no configured route keeps the Session's current model.
- Switching back to the captain does not restore an earlier model: the captain always follows whatever model the Session currently has selected.
- Role and model changes wait for a running task to reach its boundary, exactly like a Team change. A selection naming a member that no longer exists is refused and the Session stays locked rather than silently falling back to the captain.

### Fields

| Field | Purpose |
|---|---|
| Team name and purpose | Identify the preset and explain what work it handles. |
| Category | Assign the Team to a local category for organization in lists and picker. |
| Display metadata | Summary, tags, use cases, quick prompts, and notes. Purely presentation-only; never injected into LLM context tokens. |
| Captain | The lead agent. A nonempty captain prompt replaces its persona prefix; the captain keeps the conversation's model. |
| Members | Reusable role templates the captain can summon. |
| Name | Role display name and target base. ASCII letters/digits and hyphens (max 64 chars, not `lead`). |
| Description | Role responsibilities for the captain to select appropriate members (max 200 chars). |
| Color | Accent color distinguishing the role in settings and the roster. |
| Provider / Model | Members only. Route from the deployment's model catalog. |
| Reasoning effort | Members only. Options depend on model support; empty uses route default. |
| Allowed tools | Independent all-tools or custom allow-list policy. |
| Team Skills | Assigned private skills, registered exclusively in this Agent's scope upon creation. |
| System prompt | Standing role instructions. `{{variable}}` denotes prompt template variables. |

### Built-in presets

A fresh installation seeds nine editable Teams across two series — three development-scale Teams and six work-mode Teams:

| Series | Teams |
|---|---|
| **研发规模系列 (Classic Development Scale)** | 轻量研发团队 `builtin-lightweight` · 标准研发团队 `builtin-standard` · 全栈软件研发团队 `builtin-fullstack` |
| **工作模式系列 (Work Modes)** | 需求探索 `builtin-discovery` · 架构规划 `builtin-planning` · 既定工作流执行 `builtin-workflow` · 工程研发协作 `builtin-engineering` · 独立代码与安全审计 `builtin-audit` · 科研协作 `builtin-research` |

Each preset's roles, its intended use, and the Team Skills those roles receive are documented in [Built-in Teams](../builtin-teams.md) and [Built-in Team Skills](../builtin-team-skills.md).

Default presets are seeded once per profile. Deleting or editing a built-in preset is respected across restarts, which also means a Team list that lost its shipped presets some other way (a hand-edited or restored settings file) does not get them back by itself: the Host logs a warning and the page shows a notice pointing at **Restore built-in presets**. That button stages a draft, so save afterwards. Restoring brings back shipped fields and official rosters while preserving local member model routes and tool policies.

## Display metadata, categories, and search

### Presentation-only display metadata

Each Team preset supports rich metadata:

- **Summary**: One-line description shown on cards and intros.
- **Tags**: Keyword chips for filtering and categorization.
- **Use cases**: Recommended project scenarios.
- **Quick prompts**: Ready-to-use task templates shown when selecting the Team.
- **Notes**: Operational reminders or cautions.

**Token economy:** Display metadata is stored in the preset document and used by the UI for search, grouping, and cards, but is **never injected into the runtime LLM prompt context**.

### Local categories and hierarchical filtering

- **Category manager:** Click **管理团队预设分类** in the Settings list to open a dedicated management page. Create, rename, reorder, and delete categories, and inspect team counts per category.
- **Local isolation:** Categories and team-category bindings are saved in profile settings and are **never exported** with shareable preset documents.
- **Two-level filters:** The Teams list provides two independent filter rows:
  - **来源 (Source):** 全部 (All), 插件内置 (Built-in), 自定义 (Custom).
  - **分类 (Category):** For built-in teams, filters by official series (研发规模 / 工作模式); for custom teams, filters by user-created categories.
- **Instant search:** A responsive search box searches team names, summaries, tags, use cases, and quick prompts with real-time matched count reporting.
- **Composer integration:** The conversation composer's Team picker mirrors these source filters and search capabilities, with `不加载预设` pinned to the top.

## Next

- [Install and upgrade](install.md)
- [Getting started](getting-started.md) — the illustrated walkthrough, screen by screen.
- [Built-in Teams](../builtin-teams.md) — roles and intended use of all nine presets.
