# Built-in Teams

This plugin seeds **nine editable Teams** on a fresh installation: three development-scale Teams and six work-mode Teams. This document is the reference for what each one contains; [Built-in Team Skills](builtin-team-skills.md) documents the skills those roles receive.

[中文](<builtin-teams.zh.md>) · [Documentation index](index.md) · [README](../README.md)

## How a shipped preset behaves

- **Seeded once per profile.** A Team that did not exist is added. A Team you edited or deleted is left exactly as you left it, across restarts — the plugin does not re-add it behind your back.
- **The stored copy is yours.** Your profile's Team record is the authority for the prompt text, the roster, and the colors. Editing it never changes the shipped catalog, and upgrading the plugin never rewrites your copy.
- **Restore is deliberate.** **Restore built-in presets** rewrites the shipped fields — name, description, purpose, every standing prompt, accent colors, roster, and display metadata — and keeps what is yours: each role's model route and tool policy. A role that had been switched onto a local copy of a shipped skill is returned to the shipped copy, so the visible bindings match the preset again. It stages a draft, so **you still have to save** for it to take effect.
- **Default skills come from the catalog, not the record.** A shipped Team's default Team Skill bindings are read from the plugin's catalog, so a record written before that field existed (or holding an empty value) still receives its defaults. Only a Team you authored yourself carries its own declaration.

## 研发规模系列 (Classic Development Scale)

Three Teams for building software, differing in how much coordination the work needs.

| Preset | Roles | Intended use |
|---|---|---|
| **轻量研发团队**<br>`builtin-lightweight` | Captain `team-lead`, `fullstack-advisor`, `executor` | Small-to-medium iterations and multi-stage delivery. The captain aligns requirements, grades the task, explores in parallel, and accepts; the advisor answers technical decisions single-threaded; the executor implements, integrates, and verifies. |
| **标准研发团队**<br>`builtin-standard` | Captain `team-lead`, `fullstack-advisor`, `executor`, `reviewer` | Medium features, significant refactors, and sustained iteration. The advisor answers technical decisions on demand; the executor implements continuously; the independent reviewer checks every code change. |
| **全栈软件研发团队**<br>`builtin-fullstack` | Captain `team-lead`, `ui-designer`, `backend-architect`, `executor`, `reviewer` | Complex full-stack engineering across Web, desktop, and Android. The advisor role is split into the UI frontend engineer and the backend architect; the executor handles routine development and testing; the independent reviewer accepts. |

### What each role is for

| Role | Appears in | Responsibility |
|---|---|---|
| `team-lead` | all three | Aligns the requirement, grades the task, dispatches, integrates, and accepts. Holds the final risk call. |
| `fullstack-advisor` | lightweight, standard | Cross-layer technical decisions, trade-offs, risks, and executable acceptance contracts. Does not implement. |
| `reviewer` | standard, fullstack | Independent inspection of the actual change, the critical risks, and whether the tests can catch the defect. |
| `executor` | all three | Implements, debugs, tests, and hands over verification evidence within the assigned scope. |
| `backend-architect` | fullstack | System architecture, API and data contracts, error semantics, auth isolation, migration compatibility, plus the complex backend fixes. |
| `ui-designer` | fullstack | Visual direction, design systems, frontend components and interaction, real-screenshot visual acceptance, plus the frontend fixes. |

## 工作模式系列 (Work Modes)

Six Teams for work that is not "build the next feature".

| Preset | Roles | Intended use |
|---|---|---|
| **需求探索**<br>`builtin-discovery` | Captain `discovery-lead`, `technical-scout`, `product-scout`, `critical-analyst` | Goals, technical paths, or product direction still open. Read-only by default; independent challenge is built in. |
| **架构规划**<br>`builtin-planning` | Captain `planning-lead`, `system-architect`, `contract-designer`, `ux-planner`, `plan-reviewer` | Settled goals where module boundaries and cross-module contracts still need design and review. |
| **既定工作流执行**<br>`builtin-workflow` | Captain `workflow-lead`, `executor`, `verifier`, `repository-specialist` | An established workflow: you name the next task, the Team implements, verifies, and delivers. |
| **工程研发协作**<br>`builtin-engineering` | Captain `engineering-lead`, `architect`, `executor`, `ui-designer`, `reviewer`, `repository-specialist` | Adaptive engineering: the captain does the work it can do directly and summons members when there is real gain. |
| **独立代码与安全审计**<br>`builtin-audit` | Captain `audit-lead`, `code-auditor`, `security-auditor`, `finding-verifier` | Independent, read-only review of specified code, configuration, or changes. Reports and verifies; does not fix. |
| **科研协作**<br>`builtin-research` | Captain `research-lead`, `methodologist`, `evidence-scout`, `research-engineer`, `skeptic` | Literature, method design, experiment code, and evidence strength. Runs experiments inside the authorized goal. |

## Roles are addressed by name

A default Team Skill binding names a role **by its name** in the Team document. Two consequences are worth knowing:

- Renaming a role detaches its default skills. The declaration then matches no role and is dropped; re-assign the skill from the member page.
- A member named exactly `captain` cannot be addressed separately from the captain slot, because that name is the slot's own identity.

## Where the record lives

Your Team records are stored in the active profile's configuration (`cordis.patch.yml` under `$DSH_HOME/profiles/<profile>/`), not inside the plugin. That is why an upgrade cannot silently change the Teams you are running, and why the restore above is the only path back to the shipped text.

## Related

- [Built-in Team Skills](builtin-team-skills.md) — the ten shipped skills and which role receives each
- [Getting started](guide/getting-started.md) — the illustrated walkthrough for creating and using a Team
