# Worker Handoff Record Template

将记录追加到项目已有的 `DELIVERY-PLAN.md` 当前轮次记录或任务板中。项目已有等价记录时直接更新原位置，不额外创建重复文件。

```markdown
### Worker Handoff — <TASK_ID>

- Previous worker target/session: <target / session id, if available>
- Worker result: <DONE / PARTIAL / BLOCKED / FAILED / no final report>
- Verified changes:
  - <path or symbol>: <what is present and verified>
- Unverified changes:
  - <path or symbol>: <what is present but not yet verified>
- Tests:
  - <command/check>: <PASS / FAIL / NOT RUN / BLOCKED>
- Remaining work:
  - <specific unfinished requirement>
- Conflicts and risks:
  - <NONE or evidence-backed issue>
- Next action:
  - <resume old instance / dispatch replacement / ask human>
```

## 记录规则

- 保留原 `TASK_ID`，除非任务范围经过正式变更并创建了新工作项。
- 只记录能被文件、差异、测试或宿主状态复核的事实。
- 不复制完整聊天记录、工具日志或思维链。
- 替代执行者完成后，补充新实例和最终验收证据，保留必要的历史接续记录。
```
