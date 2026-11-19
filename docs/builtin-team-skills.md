# Built-in Team Skills

This plugin ships **thirteen Team Skills** and binds a default set to the roles of its built-in Teams. This document is the inventory: what each skill is for, which category it belongs to, and which role receives it by default.

[中文](<builtin-team-skills.zh.md>) · [Documentation index](index.md) · [Built-in Teams](builtin-teams.md) · [README](../README.md)

## The thirteen shipped skills

| Skill (id shown to the model) | Shown as (Chinese UI) | Category | Purpose | Default roles |
|---|---|---|---|---|
| `agent-leader-communication` | 队长派发与通信 | Workflow | Dispatch, consultation, result intake, and reporting protocols for a captain. | `team-lead` |
| `leader-medium-task-workflow` | 中程任务工作流 | Workflow | Bounded multi-part work: lightweight splitting, the Team Task Board, leader Todo, unified acceptance. | `team-lead` |
| `leader-long-task-orchestration` | 长程任务编排 | Workflow | Multi-round delivery: requirement alignment, rolling-wave planning, a persistent plan, stage acceptance. | `team-lead` |
| `agent-subagent-orchestration` | 孙代理并行编排 | Workflow | When a captain or an executor must fan work out to subagents, and how results are recovered and integrated. | `team-lead`, `executor` |
| `fullstack-advisor` | 全栈技术咨询 | Workflow | The advisor's consultation workflow and decision-summary contract. | `fullstack-advisor` |
| `executor-short-task-workflow` | 执行者短程工作流 | Workflow | Bounded implementation: minimum change, risk-matched verification, structured reporting. | `executor` |
| `github-repository-presentation` | 仓库展示规范 | Delivery | README home page, badges, public documentation layout, bilingual presentation, Release notes. | `executor`, `repository-specialist` |
| `git-release-hygiene` | Git 提交与发布规范 | Delivery | Commit, PR, changelog, version, tag, and release hygiene from the real repository state. | `executor`, `repository-specialist` |
| `frontend-engineering-workflow` | 前端工程工作流 | Workflow | Entry skill of the UI frontend engineer: visual direction, design systems, frontend implementation, and visual QA, reading `references/` per task. | `ui-designer` |
| `backend-architecture-workflow` | 后端架构工作流 | Workflow | Entry skill of the backend architect: architecture and contracts, complex bug diagnosis, fix regression, reading `references/` per task. | `backend-architect` |
| `independent-code-review-workflow` | 独立代码审查工作流 | Workflow | Entry skill of the independent reviewer: Standards / Spec review axes and severity grading, reading `references/` by risk. | `reviewer` |
| `grilling` | 需求拷问 | Method | Interrogating a plan, decision, or idea round by round until goal, boundary, and acceptance are settled. | `discovery-lead` |
| `research` | 一手来源调研 | Method | Investigating a question against high-trust primary sources, with verifiable conclusions and evidence limits. | `technical-scout`, `product-scout`, `evidence-scout` |

**A skill's id is its identity.** The model addresses a skill by that id, the stored binding names it, the preset document exports it, and the on-disk asset directory is derived from it. Only the display name is localized.

## Categories

Both Team Skill lists — the library page and the per-role assignment grid — open with a category dropdown, and the categories describe the kind of work a skill belongs to rather than the role that happens to hold it:

| Category | Count | Contents |
|---|---|---|
| **Workflow** | 9 | The captain, advisor, and executor workflows above |
| **Delivery** | 2 | The repository-presentation and Git-release pair |
| **Method** | 2 | `grilling` and `research` |
| **Custom** | — | Everything the build does not ship: skills you import or author yourself |

A **local override** stays in the category of the skill it was copied from — it is the same skill, edited. A skill you brought in yourself is Custom even if it reuses a shipped name.

## Default bindings

The eight engineering skills are bound to the development Teams; the two method skills belong to the Discovery and Research Teams.

| Team | `team-lead` | advisor role | `executor` | other |
|---|---|---|---|---|
| 轻量研发团队 `builtin-lightweight` | 4 workflow | 1 (`fullstack-advisor`) | 4 (incl. orchestration + delivery) | — |
| 标准研发团队 `builtin-standard` | 4 workflow | 1 (`fullstack-advisor`) | 4 | `reviewer` 2 (review workflow + orchestration) |
| 全栈软件研发团队 `builtin-fullstack` | 4 workflow | — | 4 | `ui-designer` 1, `backend-architect` 1, `reviewer` 2 |
| 需求探索 `builtin-discovery` | `grilling` | — | — | `research` to `technical-scout` and `product-scout` |
| 架构规划 `builtin-planning` | — | — | — | no default skills |
| 既定工作流执行 `builtin-workflow` | — | — | — | both delivery skills to `repository-specialist` |
| 工程研发协作 `builtin-engineering` | — | — | — | both delivery skills to `repository-specialist` |
| 独立代码与安全审计 `builtin-audit` | — | — | — | no default skills |
| 科研协作 `builtin-research` | — | — | — | `research` to `evidence-scout` |

Two numbers are worth reading carefully. First, a Team's **binding count is not its distinct skill count**: the lightweight Team holds nine bindings but only eight distinct skills, because `agent-subagent-orchestration` is deliberately bound to both the captain and the executor. Second, the standard Team keeps one advisor role (`fullstack-advisor`) while the full-stack Team splits it into `ui-designer` and `backend-architect`; neither declares a role it does not carry, and `agent-subagent-orchestration` never reaches an advisor.

You can add or remove assignments per role from the member page; those local changes are yours and are not part of the shipped preset.

## Local overrides

Built-in skills are **read-only**. To change one, create a local editable copy from the skill's page. From then on:

- Creating the copy switches the roles that already hold the shipped skill onto it, so a member reads your edits.
- When a later plugin release moves the shipped copy past the version your copy was derived from, the library marks it `updateAvailable`.
- **Restore to the built-in version** (`恢复为插件内置版本`) replaces your copy's content **and moves those roles back onto the shipped skill**, so the default binding is the shipped one again.
- A copy that lags several versions keeps working, but it also keeps whatever it was derived from. The library reports the gap rather than silently upgrading you.

A default binding always names the **shipped** skill. A local copy never captures a default by sharing its name, which is what makes the restore above reliable.

### One name, one skill

The English skill id is the identity every surface uses: a binding stores it, a preset document exports it, and the model addresses the skill by it. Two assets may share that name only when one is a sanctioned copy of the other — an override *is* the shipped skill, edited. Importing or creating a second skill under a name the library already has is therefore **refused**, with the owner named in the error, instead of letting the name point at two assets and a binding land on whichever one happened to sort first.

## Scope

Each Team Skill is registered **only inside the Agent scope of the member it is assigned to**. Other members, the captain, and the rest of the deployment cannot see or invoke it. That isolation is what makes a per-role skill set meaningful; it is described in [Private Team Skills](guide/team-skills.md) together with the private store, import, scanning, and dependency checks.

## Related

- [Built-in Teams](builtin-teams.md) — the nine presets and the roles these skills attach to
- [Getting started](guide/getting-started.md) — using the skill library and the member page
