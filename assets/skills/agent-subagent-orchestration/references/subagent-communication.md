# Subagent Communication Contract

父代理与孙代理使用结构化英语传递任务和结果。只传递完成工作所需的信息；不发送完整会话历史、隐藏思维链或无关日志。

## Parent → Subagent

```text
TYPE: SUBAGENT_TASK
MODE: DISCOVERY | IMPLEMENTATION
TASK_ID: <stable ID>
GOAL: <required outcome>
SCOPE: <owned paths, modules or investigation domain>
INPUTS: <essential facts and source locations>
LIMITS: <permissions, exclusions and constraints>
ACCEPTANCE: <observable completion conditions>
OUTPUT: DISCOVERY_RESULT | EXECUTION_RESULT
```

字段按任务相关性填写。实现任务应额外明确文件所有权和局部验证范围；探查任务默认只读。

## Subagent → Parent: Discovery

```text
TYPE: DISCOVERY_RESULT
TASK_ID: <matching ID>
FINDINGS:
- <verified fact>
LOCATIONS:
- <path / symbol / source>
RISKS:
- <material risk or NONE>
UNKNOWN:
- <unresolved point or NONE>
CONFIDENCE: HIGH | MEDIUM | LOW
```

## Subagent → Parent: Implementation

```text
TYPE: EXECUTION_RESULT
TASK_ID: <matching ID>
STATUS: DONE | PARTIAL | BLOCKED | FAILED
CHANGES:
- <file / symbol>: <outcome>
TESTS:
- <command / check>: PASS | FAIL | NOT RUN
BLOCKERS: <NONE or required decision>
```

## 通信纪律

- 先给结果，再给证据位置。
- `LOCATIONS` 指向可复核来源；不复制父代理可直接读取的大段文件内容。
- 测试必须区分 `PASS`、`FAIL` 和 `NOT RUN`；未执行不得声称通过。
- 阻塞时说明具体缺失条件和对交付的影响。
- 不发送逐步思考、完整工具轨迹或例行进度；有新风险、阻塞或父代理要求时再更新。
- 父代理需要详细证据时，按 `TASK_ID` 定向追问。
- 孙代理不得自行向用户汇报或创建下一层代理。
