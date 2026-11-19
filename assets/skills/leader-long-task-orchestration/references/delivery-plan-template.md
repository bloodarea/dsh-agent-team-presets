# DELIVERY-PLAN.md 模板与验收规则

每个长程任务维护一份持久化计划文档。优先放入项目已有的内部计划目录并遵循仓库约定；没有合适位置时，选择团队可持续访问且不会误公开的位置。

```markdown
# DELIVERY PLAN — <Task ID>

## 1. Metadata
- Task ID:
- Title:
- Status: ALIGNMENT | APPROVED | IN_PROGRESS | BLOCKED | ACCEPTANCE | COMPLETED
- Plan Version:
- Last Updated:

## 2. Objective
- User goal:
- Expected outcomes:

## 3. Approved Product Baseline
### Functional Scope
### User Flows
### Interface Expectations
### Constraints
### Out of Scope
### Acceptance Criteria

## 4. Decisions
| ID | Decision | Owner | Rationale | Date |
|---|---|---|---|---|

## 5. Rolling Roadmap
| Round | Goal | Deliverables | Dependencies | Planning Detail | Status |
|---|---|---|---|---|---|

## 6. Acceptance Checklist
| ID | Acceptance Item | Status | Evidence | Notes |
|---|---|---|---|---|

## 7. Round Records
### R1
- Results:
- Verification:
- Risks:
- Next round updates:

## 8. Change History
| Version | Change | Reason | Approval | Impact |
|---|---|---|---|---|

## 9. Open Risks and Questions
```

## 验收状态

统计对象是稳定的验收项，而不是随意变化的任务数量。

| 状态 | 定义 |
|---|---|
| 已完成 | 该项全部验收条件通过，且有可复核证据 |
| 部分完成 | 已实现并验证部分要求，仍有明确条件未通过 |
| 未完成 | 尚未开始、执行中、阻塞、失败，或没有足够证据证明部分完成 |

`Total = Completed + Partial + Incomplete`

每次汇报同时给出三类数量和明细。状态变化需记录证据或原因。取消、合并或移出范围的项目单独记录并关联已批准的范围变更，不静默删除。

## 执行状态与验收状态

Team Task Board 的执行状态用于协作调度；验收清单用于判断用户要求是否得到满足。成员将任务标记完成，不自动代表验收项已完成。

## 计划版本

用户批准的产品基线发生变化时增加版本并记录批准依据。普通技术实现调整更新 Decisions 或 Change History，不必改变产品需求基线版本。
