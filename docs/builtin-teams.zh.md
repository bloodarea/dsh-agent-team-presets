# 内置团队

插件在全新安装时初始化 **九个可编辑团队**：三个研发规模团队，六个工作模式团队。本文说明每个团队包含什么；它们各自拿到哪些技能，见[内置团队技能](<builtin-team-skills.zh.md>)。

[English](<builtin-teams.md>) · [文档入口](<index.zh.md>) · [README](<../README.zh.md>)

## 内置预设的行为

- **每个 profile 只初始化一次。** 不存在的团队会被补上；你编辑过或删除过的团队会保持你留下的样子，重启也不会被重新加回来。
- **存下来那份是你的。** 团队记录存在 profile 配置里，提示词文本、成员名册与配色都以它为准。改动它不会影响插件内置目录，升级插件也不会改写你的副本。
- **恢复是显式动作。** **恢复内置预设**会重写内置字段——名称、描述、用途、全部提示词、强调色、成员名册与展示元数据——同时保留属于你的部分：各角色的模型路由与工具策略。曾被切到本地副本上的角色会回到随包技能，让可见的绑定与预设重新一致。它只改**草稿**，所以**必须再保存**才会生效。
- **默认技能来自目录，不是记录。** 内置团队的默认技能绑定由插件目录决定，因此在这字段出现之前写下的记录（或值为空的记录）依然能拿到默认绑定；只有你自建的团队才以自己的声明为准。

## 研发规模系列

三个用于开发软件的团队，区别在于协作开销。

| 预设 | 角色 | 适用场景 |
|---|---|---|
| **轻量研发团队**<br>`builtin-lightweight` | 队长 `team-lead`、`fullstack-advisor`、`executor` | 中小型功能迭代与多阶段开发。队长负责需求对齐、任务分级、并行探查与验收；顾问单线程回答技术决策；执行者实现、集成与验证。 |
| **标准研发团队**<br>`builtin-standard` | 队长 `team-lead`、`fullstack-advisor`、`executor`、`reviewer` | 中型功能、重要重构与持续项目迭代。全栈顾问按需提供技术决策与验收契约；执行者持续研发；独立审查员检查有代码变更的交付。 |
| **全栈软件研发团队**<br>`builtin-fullstack` | 队长 `team-lead`、`ui-designer`、`backend-architect`、`executor`、`reviewer` | 面向 Web、桌面与 Android 的跨端复杂工程。顾问职责拆成 UI 前端工程师与后端架构师；执行者承担常规开发测试；独立审查员验收。 |

### 各角色职责

| 角色 | 出现于 | 职责 |
|---|---|---|
| `team-lead` | 三个团队 | 对齐需求、任务分级、派发、集成与验收，保留最终风险裁决权。 |
| `fullstack-advisor` | 轻量、标准 | 跨层技术决策、方案权衡、风险分析与可执行验收契约；不承担编码。 |
| `reviewer` | 标准、全栈 | 独立审查实际变更、关键风险，以及测试是否真能捕获该缺陷。 |
| `executor` | 三个团队 | 在获派范围内实现、调试、测试并交接验证证据。 |
| `backend-architect` | 全栈 | 系统架构、API 与数据契约、错误语义、鉴权隔离、迁移兼容，并直接承担复杂后端修复。 |
| `ui-designer` | 全栈 | 视觉方向、设计系统、前端组件与交互实现、真实截图视觉验收，并直接承担前端修复。 |

## 工作模式系列

六个用于"不是开发下一个功能"的场景。

| 预设 | 角色 | 适用场景 |
|---|---|---|
| **需求探索**<br>`builtin-discovery` | 队长 `discovery-lead`、`technical-scout`、`product-scout`、`critical-analyst` | 目标、技术路径或产品方向尚未确定。默认只读，内置独立质疑。 |
| **架构规划**<br>`builtin-planning` | 队长 `planning-lead`、`system-architect`、`contract-designer`、`ux-planner`、`plan-reviewer` | 目标已明确，但模块边界与跨模块契约仍需设计与评审。 |
| **既定工作流执行**<br>`builtin-workflow` | 队长 `workflow-lead`、`executor`、`verifier`、`repository-specialist` | 已有成熟工作流：你点名下一项任务，团队实施、验证并交付。 |
| **工程研发协作**<br>`builtin-engineering` | 队长 `engineering-lead`、`architect`、`executor`、`ui-designer`、`reviewer`、`repository-specialist` | 自适应工程：队长自己能做就直接做，有实际收益时才召唤成员。 |
| **独立代码与安全审计**<br>`builtin-audit` | 队长 `audit-lead`、`code-auditor`、`security-auditor`、`finding-verifier` | 对指定代码、配置或变更做独立只读审查；只报告与复核，不负责修复。 |
| **科研协作**<br>`builtin-research` | 队长 `research-lead`、`methodologist`、`evidence-scout`、`research-engineer`、`skeptic` | 文献、方法设计、实验代码与证据强度；在已授权目标内运行实验。 |

## 角色按名字寻址

默认技能绑定是通过**角色名**指名角色的。由此有两点值得知道：

- **改名会断开默认技能。** 声明匹配不到角色就会被丢弃，需要在成员页重新分配。
- **成员不能叫 `captain`。** 该名字是队长槽位自身的身份，叫这个名字的成员无法与队长槽位区分开。

## 记录存在哪里

团队记录存放在当前 profile 的配置里（`$DSH_HOME/profiles/<profile>/cordis.patch.yml`），不在插件内部。这既解释了为什么升级不会悄悄改变你正在跑的团队，也解释了为什么上面那个「恢复」是回到内置文本的唯一路径。

## 相关

- [内置团队技能](<builtin-team-skills.zh.md>)——10 个随包技能，以及哪个角色拿到哪一个
- [新手必读（图文）](<guide/getting-started.zh.md>)——创建与使用团队的逐步图解
