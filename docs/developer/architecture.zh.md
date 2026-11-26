# 架构

`dsh-agent-team-presets` 的实现结构：它用到哪些生命周期扩展点、各关注点在 `src/` 下的位置，以及源码开发前的环境前置。

[English](<architecture.md>) · [文档索引](../index.zh.md) · [README](../../README.zh.md)

## 工作原理

插件通过 Cordis 与 Harness 生命周期扩展点协作，不改动宿主源码，由四部分承担：

1. **Profile 配置：** 保存团队预设、展示元数据、本地分类与活动会话选择。
2. **会话应用：** 在 Agent 作用域安装队长 persona、工具策略与 `spawn_team_member`。选择单个成员时，改为安装该成员的角色卡与工具策略，不安装队长简报与成员工具，并把该成员配置的模型路由设为会话当前模型。
3. **成员创建与技能作用域：** 校验路由与委派配额，保存实例快照并召唤子会话。在首次请求前，串行 `agent/created` 钩子把模型选择、persona、工具过滤以及**已分配的 Team Skill 严格注入该成员的 Agent 作用域**。
4. **私有技能管理器：** 负责技能存储（`~/.dsh/agent-team-presets/team-skills`）、防崩溃事务日志、依赖解析与删除阻断核验。

运行时协作由 Harness 的子会话运行时负责；本插件负责对这些团队及其技能的配置、管理、隔离与复用。插件不依赖任何 Agent Teams bundle：成员经由部署提供的可续接子会话后端创建（默认后端名为 `spawn` 与 `fork`），原生消息、任务工具与 Web 花名册不受影响。

预设中的角色是模板。召唤会创建一个带唯一 target 的实例，例如 `executor` 或 `executor-2`；要与已有实例继续协作，用 `send_message` 指定该 target，而不是再召唤一个。

## 源码地图

| 范围 | 源码 |
|---|---|
| 插件生命周期与设置协调 | [src/index.ts](../../src/index.ts)、[src/settings-reconcile.ts](../../src/settings-reconcile.ts) |
| 内置预设目录与系列 | [src/builtin-teams.ts](../../src/builtin-teams.ts)、[src/team-catalog.ts](../../src/team-catalog.ts) |
| 团队应用与成员召唤 | [src/application.ts](../../src/application.ts) |
| 成员快照与运行时注入 | [src/member-store.ts](../../src/member-store.ts)、[src/member-identity.ts](../../src/member-identity.ts)、[src/member-runtime.ts](../../src/member-runtime.ts) |
| 私有 Team Skill 技能子系统 | [src/team-skills/store.ts](../../src/team-skills/store.ts)、[src/team-skills/manager.ts](../../src/team-skills/manager.ts)、[src/team-skills/service.ts](../../src/team-skills/service.ts)、[src/team-skills/tools.ts](../../src/team-skills/tools.ts) |
| 工具策略与呈现方式 | [src/tool-policy.ts](../../src/tool-policy.ts)、[src/presentation.ts](../../src/presentation.ts) |
| 预设工具与导入导出 | [src/preset-tools.ts](../../src/preset-tools.ts)、[src/preset-transfer.ts](../../src/preset-transfer.ts) |
| 浏览器前端界面 | [src/client/](../../src/client/) |

## 开发

源码开发需要一份兼容、已安装依赖的 [Harness 源码](https://github.com/deepseek-ai/deepseek-harness)，并先完成其 Host 类型与 Typert Remote 产物生成（Harness 的 `build:lib:host` 流程提供这些前置产物）：

```sh
export DSH_CHECKOUT=/absolute/path/to/deepseek-harness
npm test
npm run typecheck
npm run bundle
```

欢迎通过 [GitHub Issues](https://github.com/bloodarea/dsh-agent-team-presets/issues) 与 [Pull requests](https://github.com/bloodarea/dsh-agent-team-presets/pulls) 反馈问题、贡献修改。

感谢 **张灏焱** 贡献 `grilling` 与 `research` 两个方法型 Team Skill（PR #2），以及 Matt Pocock 提供其改编所依据的上游 [skills](https://github.com/mattpocock/skills)（MIT，见 [NOTICE](../../NOTICE)）。

## 相关

- [文档索引](../index.zh.md) —— 完整的文档地图。
- [内置团队](../builtin-teams.md) —— 十一个内置预设与各自的角色。
- [内置团队技能](../builtin-team-skills.md) —— 十四个随包技能与各角色默认绑定。
- [新手必读（图文）](../guide/getting-started.md) —— 逐屏走查。
- [README](../../README.zh.md) —— 总览、快速开始与文档导航。
