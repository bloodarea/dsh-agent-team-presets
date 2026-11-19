# PR Description 与 Changelog 规范

PR、Changelog 与 GitHub Release 的受众和用途不同，不强制共用同一套章节。Release 格式见 `release-standard.md`。

## 一、Changelog

Changelog 用于长期记录每个版本的用户可见变化。可沿用 Release 分类，但需适配单文件内的多版本结构。

推荐结构：

```markdown
# Changelog

## [1.3.0] - YYYY-MM-DD

### 中文

#### 新增功能
- ...

#### 体验优化
- ...

#### 问题修复
- ...

### English

#### New Features
- ...

#### Improvements
- ...

#### Bug Fixes
- ...

## [1.2.0] - YYYY-MM-DD
...
```

规则：

- 按版本从新到旧排列；遵循项目已有 Changelog 结构，不擅自整体改写历史格式。
- 每个版本内部先完整中文，再完整英文；禁止逐条中英混排。
- 只记录该版本实际交付的变化，不把计划功能或未发布内容写成已发布事实。
- 沿用 Release 分类：新增功能、体验优化、问题修复、其他变更、重要说明；没有内容的类别省略。
- 默认不统计变更数量。
- 日期、版本号和比较范围必须可核实；不能确定时先核查，不编造。
- 记录面向用户的结果，不复制开发日志、Commit 列表或 PR 讨论。
- 破坏性变更和迁移要求必须在中英文版本中完整保留。

## 二、PR Description

PR 面向代码审查者和协作者，重点解释修改目的、实现范围、验证情况和风险。**PR 不必强制套用 Release 的新增功能、体验优化、问题修复分类。**

默认使用完整中文区块在前、完整英文区块在后的形式；项目已有 PR 模板时优先遵循。

推荐结构：

```markdown
## 中文

### 背景与目的
说明为什么需要这次修改。

### 主要变更
- 说明本次实际修改的内容与影响范围。

### 验证情况
- 说明实际执行的测试、检查及结果。

### 风险与兼容性
- 说明潜在影响、迁移要求或已知限制；没有实质内容时可省略。

## English

### Context and Purpose
Explain why this change is needed.

### Key Changes
- Describe the actual changes and their scope.

### Validation
- List the tests and checks actually performed, with their results.

### Risks and Compatibility
- Describe potential impact, migration requirements, or known limitations. Omit when there is nothing material to report.
```

规则：

- 中文和英文分别完整成段，不逐条中英交替。
- 主要变更应与实际 diff 对应，不将计划写成已完成。
- 验证部分只列实际执行过的测试和检查；未执行时明确说明，不写“测试通过”。
- 风险、兼容性和迁移事项应明确，不因追求简短而省略。
- 可提供 Issue、设计文档、测试证据或相关 PR 链接，但必须真实有效。
- 不强制加入版本变更数量、Release 摘要、贡献者署名或 Full Changelog。
