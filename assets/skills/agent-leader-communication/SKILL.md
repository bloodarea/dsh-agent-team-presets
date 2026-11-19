---
name: agent-leader-communication
description: 主代理专属的团队通信规范。队长向执行者派发任务、向技术顾问咨询、收集成员结果或向用户汇报时使用；其他成员使用各自角色工作流中的通信契约。
---

# Agent Leader Communication

## 目标与范围

仅供队长使用。统一管理任务派发、技术咨询、结果收集和用户汇报，降低上下文搬运与重复调查成本。执行者和顾问不需要加载本 Skill，分别遵守自己的角色契约。

## 核心原则

> 传递行动所需的信息，不重复传递可以自行获取的信息。

Agent 间通信是任务与结果协议。传递目标、决策、约束和必要证据；省略客套话、重复背景及无决策价值的解释。不得省略安全边界、权限、文件范围或验收标准。

## 子代理路由

当存在两个或以上实质独立的工程事实探查方向时，队长必须调用 `agent-subagent-orchestration` 并行探查；不得仅因当前会话可继续工作或即时委派有开销而默认串行。具体拆分和回收按 `agent-subagent-orchestration` 技能中的 leader-discovery.md 参考文件执行。顾问保持单线程。

## 向执行者派发

先确定发现责任，再给出最小充分任务契约：

- `DELEGATED_DISCOVERY`：队长尚未调查该范围。提供目标和必要入口，由执行者负责发现；队长不预读并转述同一范围。
- `LEADER_FINDINGS`：队长已完成可靠调查。传递精简结论和来源位置；执行者只做实现或验证所需的定向检查。

```text
TASK_ID: <optional stable ID>
TASK: <required outcome>
LIMITS: <scope, permissions and constraints; when relevant>
DONE: <acceptance criteria; when relevant>
REPORT: <required result and evidence>
```

`TASK` 与 `REPORT` 必需；其他字段按需提供。优先引用文件路径、符号、文档和已有产物，不粘贴队员能够自行读取的代码、日志或完整背景。任务只指定一个主要发现责任方。

## 向技术顾问咨询

仅在跨层架构、重大技术选择、复杂故障或验收契约需要专业判断时调用 `fullstack-advisor`。普通实现细节由团队自行处理。

```text
TYPE: TECHNICAL_CONSULT
CONSULT_ID: <optional stable ID>
DECISION: <decision to make>
CONTEXT: <essential verified facts and source locations>
CONSTRAINTS: <approved boundaries and technical constraints>
QUESTION: <specific question>
DISCOVERY: LEADER_FINDINGS | DELEGATED_DISCOVERY
OUTPUT: RECOMMENDATION + TRADE_OFFS + RISKS + ACCEPTANCE + PRODUCT_AMBIGUITY
```

顾问默认只返回决策摘要、关键依据、风险和可执行验收契约；详细分析按需追问。功能、用户流程或界面歧义由队长向用户确认，不让顾问代替用户作产品决定。

## 接收成员结果

**执行者 → 队长：**

```text
STATUS: DONE | PARTIAL | BLOCKED | FAILED
TASK_ID: <when assigned>
CHANGES: <files / symbols / concise outcome>
TESTS: <checks + PASS / FAIL / NOT RUN>
BLOCKERS: <NONE or required decision>
```

**顾问 → 队长：**

```text
TYPE: TECHNICAL_ADVISORY
CONSULT_ID: <when assigned>
RECOMMENDATION: <preferred option>
RATIONALE: <decisive reasons>
TRADE_OFFS: <material costs>
RISKS: <critical risks>
ACCEPTANCE: <verifiable conditions>
PRODUCT_AMBIGUITY: <NONE or questions for user>
EVIDENCE: <source locations, when relevant>
CONFIDENCE: HIGH | MEDIUM | LOW
DETAILS: ON_REQUEST
```

字段按任务相关性填写；不得要求思维链、完整工具日志或例行操作流水账。直接证据与成员结论冲突时，要求其指出差异和证据，不重复整轮调查。

## 上下文与往返控制

- 已存在于仓库或计划文档的事实，发送路径、符号或 ID，不复制全文。
- 只报告新增发现、状态变化、阻塞和决策请求。
- 不要求例行进度；仅在阻塞、风险/范围变化或需要决策时沟通。
- 任务变更只发送增量，除非原任务契约实质改变。
- 需要详细论证时定向追问，不默认索取完整报告。

## 向用户汇报

先报结果，再报关键修改、验证和未解决风险。汇总成员结果，不粘贴完整报告或重复事实。准确区分完成状态，以及已提交、已推送、已发布状态。面向用户使用其习惯的语言和适当详细程度；详细证据引用产物或差异。

## 硬性约束

不得为省 Token 隐瞒安全、隐私、权限、数据丢失、兼容性或范围风险；无证据不得声称完成或测试通过；不得编造结论、路径、输出或成员结果；不得无必要或未经授权转发敏感信息。清晰、正确优先于压缩。
