# 内置团队技能

插件随包提供 **13 个团队技能（Team Skill）**，并为其内置团队的角色绑定一套默认组合。本文是清单：每个技能做什么、属于哪一类、默认给哪个角色。

[English](<builtin-team-skills.md>) · [文档入口](<index.zh.md>) · [内置团队](<builtin-teams.zh.md>) · [README](<../README.zh.md>)

## 13 个随包技能

| 技能（模型看到的 id） | 界面显示名 | 分类 | 用途 | 默认角色 |
|---|---|---|---|---|
| `agent-leader-communication` | 队长派发与通信 | 工作流型 | 队长的派发、咨询、结果回收与汇报协议。 | `team-lead` |
| `leader-medium-task-workflow` | 中程任务工作流 | 工作流型 | 有界中程任务：轻量拆分、Team Task Board、队长 Todo、统一验收。 | `team-lead` |
| `leader-long-task-orchestration` | 长程任务编排 | 工作流型 | 多轮交付：需求对齐、滚动规划、持久化计划、阶段验收。 | `team-lead` |
| `agent-subagent-orchestration` | 孙代理并行编排 | 工作流型 | 队长或执行者在什么条件下必须派孙代理，以及结果如何回收与集成。 | `team-lead`、`executor` |
| `fullstack-advisor` | 全栈技术咨询 | 工作流型 | 顾问的咨询工作流与决策摘要契约。 | `fullstack-advisor` |
| `executor-short-task-workflow` | 执行者短程工作流 | 工作流型 | 有界实现：最小变更、与风险匹配的验证、结构化汇报。 | `executor` |
| `github-repository-presentation` | 仓库展示规范 | 交付型 | README 首页、徽标、公开文档目录、中英双语呈现与 Release 说明。 | `executor`、`repository-specialist` |
| `git-release-hygiene` | Git 提交与发布规范 | 交付型 | 依据真实仓库状态处理 Commit、PR、Changelog、版本号、Tag 与 Release。 | `executor`、`repository-specialist` |
| `frontend-engineering-workflow` | 前端工程工作流 | 工作流型 | UI 前端工程师的入口技能：视觉方向、设计系统、前端实施与视觉 QA，按任务读取 `references/`。 | `ui-designer` |
| `backend-architecture-workflow` | 后端架构工作流 | 工作流型 | 后端架构师的入口技能：架构与契约设计、复杂 Bug 诊断、修复回归，按任务读取 `references/`。 | `backend-architect` |
| `independent-code-review-workflow` | 独立代码审查工作流 | 工作流型 | 独立审查员的入口技能：Standards / Spec 双轴审查、严重程度分级，按风险读取 `references/`。 | `reviewer` |
| `grilling` | 需求拷问 | 方法型 | 逐轮提问，把目标、边界与验收问清楚再动手。 | `discovery-lead` |
| `research` | 一手来源调研 | 方法型 | 针对高可信一手来源调研，给出可核查结论与证据边界。 | `technical-scout`、`product-scout`、`evidence-scout` |

**技能 id 就是它的身份。** 模型按 id 调用它，绑定的存储按 id 记录，预设文档按 id 导出，磁盘上的资产目录也由它派生。只有**显示名**是本地化的。

## 分类

两个技能列表——技能库页与角色分配网格——顶部都有分类下拉框。分类描述的是技能所属的**工作类型**，而不是它当前被谁持有：

| 分类 | 数量 | 内容 |
|---|---|---|
| **工作流型** | 9 | 上面的队长、顾问与执行者工作流，以及三个专业角色工作流 |
| **交付型** | 2 | 仓库展示与 Git 发布这一对 |
| **方法型** | 2 | `grilling` 与 `research` |
| **自定义** | — | 本版本未随包发布的全部技能：你自己导入或创建的 |

**本地副本**沿用其来源技能的分类——它是同一个技能，只是被改过。你自己带进来的技能即使复用了随包技能的名字，也仍算自定义。

## 默认绑定

8 个工程技能绑定在研发团队上，2 个方法技能属于需求探索与科研协作团队。

| 团队 | `team-lead` | 顾问角色 | `executor` | 其它 |
|---|---|---|---|---|
| 轻量研发团队 `builtin-lightweight` | 4 个工作流型 | 1 个（`fullstack-advisor`） | 4 个（含编排与交付） | — |
| 标准研发团队 `builtin-standard` | 4 个工作流型 | 1 个（`fullstack-advisor`） | 4 个 | `reviewer` 2 个（审查工作流 + 编排） |
| 全栈软件研发团队 `builtin-fullstack` | 4 个工作流型 | 不设该角色 | 4 个 | `ui-designer` 1 个、`backend-architect` 1 个、`reviewer` 2 个 |
| 需求探索 `builtin-discovery` | `grilling` | — | — | `research` 给 `technical-scout` 与 `product-scout` |
| 架构规划 `builtin-planning` | — | — | — | 无默认技能 |
| 既定工作流执行 `builtin-workflow` | — | — | — | 两个交付技能给 `repository-specialist` |
| 工程研发协作 `builtin-engineering` | — | — | — | 两个交付技能给 `repository-specialist` |
| 独立代码与安全审计 `builtin-audit` | — | — | — | 无默认技能 |
| 科研协作 `builtin-research` | — | — | — | `research` 给 `evidence-scout` |

有三个数字要读仔细。第一，**绑定条数不等于技能个数**：轻量研发团队有 9 条绑定，但只对应 8 个不同技能——`agent-subagent-orchestration` 被刻意同时绑给队长和执行者。第二，标准研发团队保留单一顾问角色（`fullstack-advisor`），全栈软件研发团队把顾问拆成 `ui-designer` 与 `backend-architect`，两个团队都不再声明对方没有的专业角色。第三，`agent-subagent-orchestration` **只**绑给队长、执行者与 `reviewer`：顾问保持单线程。

你可以在成员页按角色增删绑定；这些本地改动属于你，不属于随包预设。

## 本地副本

内置技能是**只读**的。要改就得在技能页创建一份本地可编辑副本。此后：

- **创建副本会把已经持有内置版的角色切到副本上**，成员读到的就是你的修改。
- 当后续版本把内置版推进到你派生时的版本之后，技能库会标记 `updateAvailable`。
- **恢复为插件内置版本**会替换副本正文，**并把那些角色迁回内置技能**，默认绑定重新指向随包副本。
- 落后若干版本的副本仍能工作，但它保留的是当初派生的样子。技能库会把差距报出来，而不是静默升级你。

默认绑定**永远指向随包技能**。本地副本不会因为同名就截走默认绑定，这正是上面那条"恢复"得以可靠的原因。

### 一个名字，一个技能

英文技能 id 是所有界面共用的身份：绑定存的它是它、预设文档导出的也是它、模型按它寻址。两个资产只有在一个是另一个的**授权副本**（override 就是"同一个技能被改过"）时才允许同名。因此，用技能库里已有的名字再导入或新建一个技能会被**拒绝**，错误信息会点名占用者——而不是让一个名字指向两个资产、让绑定落到恰好排在前面那个上。

## 作用域

每个团队技能**只在被分配成员自己的 Agent 作用域内注册**。其他成员、队长以及部署中的其它部分都看不到也调不到它。正是这种隔离让"按角色配技能"有意义；它与私有库、导入、目录扫描和依赖检查一起写在[私有团队技能](<guide/team-skills.zh.md>)里。

## 相关

- [内置团队](<builtin-teams.zh.md>)——九个预设，以及这些技能挂到哪些角色上
- [新手必读（图文）](<guide/getting-started.zh.md>)——技能库与成员页的使用
