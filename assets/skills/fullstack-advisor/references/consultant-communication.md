# Consultant Communication Contract

本文件规定顾问与队长之间的咨询输入和建议输出。字段按任务相关性填写，不要求每次填满。

## 队长 → 顾问

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

`CONTEXT` 优先使用路径、符号、接口或现有文档引用。不要粘贴整段会话或完整项目背景。

## 顾问 → 队长

```text
TYPE: TECHNICAL_ADVISORY
CONSULT_ID: <when assigned>
RECOMMENDATION: <preferred option>
RATIONALE: <decisive reasons>
TRADE_OFFS: <material costs>
RISKS: <critical risks>
ACCEPTANCE:
- AC-01: <verifiable condition>
PRODUCT_AMBIGUITY: NONE | <questions requiring user decision>
EVIDENCE: <source locations, when relevant>
CONFIDENCE: HIGH | MEDIUM | LOW
DETAILS: ON_REQUEST
```

## 信息分级

- **L0 — Decision**：推荐结论、关键理由、是否需要队长采取行动。默认交付。
- **L1 — Evidence**：必要的文件路径、符号、数据、测试或来源。支持结论时附带。
- **L2 — Detail**：完整方案比较、深入论证、详细设计和资料清单。队长请求后再展开。

精简不得隐藏会改变决策的风险、约束或不确定性。`RATIONALE` 提供可审查理由，不提供隐藏思维链。

## 交付规则

- 顾问提供建议，不声称已经实现或验证。
- 验收契约描述预期通过条件；实际测试由执行者运行并报告。
- 产品歧义交给队长向用户澄清。
- 技术建议与已批准边界冲突时，明确标记影响和需要的裁决。
- 无实质新信息时不发送重复进度。
