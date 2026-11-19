# Executor Communication Contract

本文件规定执行者与队长之间的输入输出契约。队长的派发规范见 `agent-leader-communication`。

## 接收任务

队长按需提供以下字段：

```text
TASK_ID: <optional stable ID>
TASK: <required outcome>
LIMITS: <scope, permissions and constraints; when relevant>
DONE: <acceptance criteria; when relevant>
REPORT: <required result and evidence>
```

执行者先确认目标、边界和验收条件。已有调查以队长标注的发现责任为准：

- `DELEGATED_DISCOVERY`：负责指定范围内的必要调查。
- `LEADER_FINDINGS`：复用队长提供的事实，只做定向核验。

缺少会改变产品行为的功能或界面要求时，向队长提出关键问题；普通技术细节在授权范围内自行判断。

## 返回结果

```text
STATUS: DONE | PARTIAL | BLOCKED | FAILED
TASK_ID: <when assigned>
CHANGES:
- <file/path or symbol>: <concise outcome>
TESTS:
- <command/check>: PASS | FAIL | NOT RUN
BLOCKERS: <NONE or required decision>
```

字段按实际情况填写。没有测试时写 `NOT RUN` 并说明原因；没有阻塞时写 `NONE`。`FOLLOW_UP` 仅在确有后续动作时追加。

## 通信成本

- 只提交当前任务的新增结果，不复述队长已知背景。
- 用路径、符号、命令和 Task ID 指向证据。
- 不发送完整工具日志、思维链或无变化的进度。
- 重要风险、权限问题、范围外改动和失败结果必须明确报告。
- 详细日志或分析留在可访问产物中，队长需要时再定向请求。
