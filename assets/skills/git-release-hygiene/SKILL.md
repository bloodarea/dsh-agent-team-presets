---
name: git-release-hygiene
description: 当任务涉及 Git 变更整理、Commit、PR、Changelog、版本号、Tag、Release 或相关高风险 Git 操作时使用。依据真实仓库状态安全交付，并按任务加载对应的版本自述与 Git 操作规范。
---

# Git 变更与版本交付

## 目标与边界

依据真实代码、Git 状态和项目既有约定，安全、准确地组织提交与版本交付。负责变更事实、版本范围、Git 操作及风险；README、Description、Topics 的展示规范交由 `github-repository-presentation`。两项 Skill 不互为必需前置条件。

本 Skill 不修改业务功能，不替代代码审查，不擅自决定项目版本策略，也不虚构提交、PR、贡献者、测试结果、版本日期或发布状态。

## 核心原则

1. **先核实事实**：按任务检查 `git status`、相关 diff、分支、提交、Tag、版本文件、Release 和项目既有约定；不无差别处理无关文件。
2. **沿用项目工作流**：优先遵循仓库既有 Commit 风格、版本策略和发布流程；没有约定时提出建议。不强制 Conventional Commits、SemVer、PR、Issue 编号或固定分支名。
3. **面向真实变更**：Commit 和 PR 反映实际修改及目的；Changelog 和 Release 基于可核对的代码差异、提交范围、合并 PR 或交付产物。优先说明用户可感知的变化，不照搬开发日志。
4. **保护已有工作**：不擅自 `git add .`、删除未知未跟踪文件、覆盖用户改动、清理工作区或重写历史。重置、覆盖、强制推送、Tag 改写等高风险操作，先说明影响、恢复方式并取得授权。
5. **区分交付状态**：已修改、已检查、已提交、已推送、已构建、已发布分别核实，不得互相冒充。
6. **不隐藏风险**：Breaking Changes、迁移要求、兼容性变化和已知限制必须明确说明。
7. **不擅自发布**：不因撰写文案而自动创建 Changelog、Tag、Release 或其他管理文件；远端操作须有明确授权并符合平台权限。

## 按任务加载参考规范

只加载当前任务需要的 Reference，不要每次读取全部文件。

| 任务 | 必读参考 |
|---|---|
| GitHub Release / 版本自述 | `references/release-standard.md` |
| Changelog 或 PR Description | `references/pr-changelog.md` |
| Git 状态、Commit、Tag、Push、版本操作 | `references/git-safety.md` |
| 完整交付或发布前检查 | `references/validation-checklist.md` |

涉及多个任务时组合读取。例如完整版本发布需读取 Release、Git 安全和验收规范；若同时更新 Changelog，再读取 `pr-changelog.md`。

## 工作流程

1. **确认范围**：明确任务是整理变更、提交代码、创建 PR、更新 Changelog，还是准备/发布 Release。
2. **检查状态**：读取相关 Git 状态、差异、版本文件和项目约定，确定真实变更范围。
3. **归纳事项**：按用户可感知的独立变化归并，不按文件数、代码行数或 Commit 数机械罗列。
4. **撰写对应文案**：按任务加载相应 Reference；Release、Changelog、PR 使用各自格式，不强行统一模板。
5. **执行授权操作**：只执行用户明确授权且处于任务范围内的操作；高风险操作另行确认。
6. **复核并交付**：核实版本范围、提交/远端状态、链接、迁移提醒和验证结果。

## 交付要求

简明说明实际完成的操作、变更或版本范围、真实验证结果，以及尚未执行或需要授权的事项。明确区分草稿与已发布状态；无法核实的信息应省略或标注待确认，不得编造成功结果。
