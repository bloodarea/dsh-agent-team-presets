---
name: github-repository-presentation
description: 为 GitHub 仓库建立统一的 README 首页、Shields.io 徽标、公开文档目录与中英双语呈现规范，并优化项目 Description、Topics、使用说明和 Release Notes。当用户要求仓库首页、封面、徽标、公开文档组织或展示质量时使用；不负责 Git 提交、版本事实判定或远端发布。
---

# GitHub Repository Presentation

## 使命

为不同仓库应用统一的 README 信息架构、视觉语言、公开文档组织方式和中英双语写作规则，形成高级、克制、清晰、准确的 GitHub 项目页面。根据项目真实情况填充内容，不按项目类型切换整套模板。

## 适用范围

当用户要求以下工作时使用本 Skill：

- 编写、审查或优化 GitHub README、项目首页、Banner、徽标。
- 优化 GitHub Description、Topics、公开使用说明。
- 组织 `docs/` 公开文档或区分公开文档与内部研发资料。
- 整理中英文 README、补充文档、PR 描述或 Release Notes。

本 Skill 不负责修改业务功能、判定版本号或变更归属，也不替代 `git-release-hygiene` 执行 Git 提交、推送、版本判定或发布。修改 GitHub 远端 About、Topics、Release 或其他仓库设置，必须取得明确授权并确认具备实际权限。

## 不可违反的原则

1. **事实优先**：先读取与任务相关的真实 README、文档、入口代码、依赖配置、使用方式、许可证、图片和版本信息；不为写文案无差别遍历整个仓库。
2. **不虚构**：不夸大能力，不虚构命令、链接、性能、许可证、截图、版本状态、验证经历或变更数量。未知事实应标注待确认或向用户询问。
3. **README 是入口，不是手册**：README 让读者快速理解项目、判断价值并开始使用；完整教程、API、架构和配置资料放在 `docs/`。
4. **三层文档分工**：
   - `README.md` / `README.zh.md`：项目入口与快速开始。
   - `docs/`：正式、完整、面向外部用户和贡献者的公开文档。
   - `docs/internal/`：维护者本地使用的开发日志、实验记录、内部计划和实现笔记。
5. **内部文档必须被忽略**：仓库根目录 `.gitignore` 必须包含 `/docs/internal/`。内部文档不得进入公开仓库、公开文档索引或 README 导航。
6. **检查已跟踪文件**：`.gitignore` 不会自动取消 Git 对既有文件的跟踪。若 `docs/internal/` 已有被跟踪文件，先检查并告知用户；未经明确授权，不执行 `git rm --cached`、历史改写或其他移除操作。
7. **单一事实来源**：正式 API、协议、接口和稳定技术约定应有唯一权威公开文档；README 只做摘要和导航。公开文档描述当前真实状态，内部文档记录研发过程。
8. **双语分文件**：主 `README.md` 使用英文，`README.zh.md` 使用中文；两份文件互相链接、章节顺序与事实对应，各自可独立阅读。详细规则见 `references/bilingual-writing.md`。
9. **同一骨架、按需减法**：所有项目沿用统一信息架构；不适用的章节可以省略，不为凑齐目录或章节制造内容。
10. **授权边界**：只修改用户授权的文件和范围；不擅自推送、发布或修改远端仓库设置。

## Reference 路由

按任务读取相关参考文件，不要每次无差别加载全部内容。

| 任务 | 必须读取 |
|---|---|
| 编写或重构 README、Banner、Shields.io 徽标 | `references/readme-standard.md` |
| 设计或整理 `docs/`、处理 `docs/internal/`、检查 `.gitignore` | `references/documentation-architecture.md` |
| 中英双语、Description、Topics、补充文档语言规范 | `references/bilingual-writing.md` |
| PR、Changelog、Release Notes 表达 | `references/release-notes.md` |
| 完整任务验收或仓库文档治理审查 | `references/validation-checklist.md` |

任务跨越多个领域时，读取对应的多个 Reference。例如，完整重构仓库 README 与文档目录时，至少读取 `readme-standard.md`、`documentation-architecture.md` 和 `validation-checklist.md`；若同时涉及双语或发布说明，再读取相应文件。

## 标准执行流程

1. **确认范围**：明确是 README、公开文档、内部文档治理、双语内容、仓库元信息还是 Release Notes。
2. **读取事实**：只检查任务所需的文件和配置；区分已实现、实验性、部分实现和计划功能。
3. **识别受众**：判断内容属于项目入口、正式公开资料还是本地内部研发记录。
4. **检查内部文档保护**：涉及文档目录时，确认根 `.gitignore` 是否包含 `/docs/internal/`，并检查内部文件是否已被 Git 跟踪。未经授权不移除索引或改写历史。
5. **按 Reference 执行**：遵循对应的结构、视觉、语言、目录和发布说明规范。
6. **核对事实与链接**：检查命令、图片路径、徽标目标、文档链接、锚点、许可证、版本和状态。
7. **验收并交付**：按 `references/validation-checklist.md` 检查；说明修改文件、验证范围、待补内容和未执行操作。

## 交付要求

- 修改前后保持项目真实能力与文档表达一致。
- 公开文档不得暴露或依赖 `docs/internal/`。
- 若发现内部文件已经被 Git 跟踪，明确报告风险与建议操作，等待授权后再处理。
- 明确区分已验证、未验证、待确认和未执行事项。
- 不以目录齐全为目标；以读者能否快速找到正确、可信的信息为目标。
