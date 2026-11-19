# 排障

本文收集插件已记录的故障形态：被覆盖的配置写入、注册在全局层的排障 Skill、最常见的问题，以及唯一一个尚未验证的环境。

[English](<troubleshooting.md>) · [文档索引](../index.zh.md) · [README](../../README.zh.md)

## 配置写入被覆盖

若保存或选择团队时报：

```text
Configuration for "agent-team-presets" is overridden by a home patch or command-line overlay
```

请检查 profile patch、`$DSH_HOME/cordis.patch.yml` 和 `--patch` 中是否有重复的手写 `agent-team-presets` 声明。移除重复项，同时保留 Host 管理的设置行。

常见成因是手工多加了一条 loader 声明。本包自带 bundle patch，正确做法是安装 bundle 而不再重复声明：profile patch 里重复的手写声明会导致设置无法保存。

## 插件内置排障 Skill

插件在 profile 组合出 skill 服务后，会在全局 skill 层注册 `agent-team-presets-troubleshooting`。它是宿主级 skill，不属于私有 Team Skill 库，也不按 Agent 隔离；所有会话都可以通过 `skill` 工具加载。适用于团队不生效、成员无法召唤、工具被拒、成员模型路由存疑、Team Skill 不可见或安装/升级异常。

该 Skill 也写明了证据优先级：`configuredRoute`、`model/selection`、`request/header.config` 和成员快照 `route` 高于 `subagent/descriptor` 或名册展示值。

## 常见问题

| 现象 | 排查方向 |
|---|---|
| 看不到设置页或插件处于 pending | 检查 profile 类型、peer 依赖兼容性、subagent 后端（默认 `spawn`/`fork`）是否可用及客户端服务。 |
| 技能删除按钮置灰不可点击 | 技能受保护：查看弹窗中的阻断列表，需先在对应团队角色中取消分配。 |
| 技能分配被拒绝 (`dependency-missing`) | 技能声明的某个必需命令行程序在宿主 `PATH` 上未找到。注意声明的 MCP 服务仅供展示参考，不阻断分配；如需使用请确认 profile 中已正确配置并连接对应 MCP。 |
| 成员创建被拒绝 | 检查持久存储、执行后端（`spawn`/`fork`）、模型配额及并发限额。 |
| 成员显示的模型与配置不一致 | `list_agents.model` 可能返回继承或 fallback 模型，即使成员实际已按配置路由运行。实际路由以 `spawn_team_member` 的 `configuredRoute`、`model/selection`、首条 `request/header.config` 和成员快照 `route` 为准。 |
| 所选成员的模型路由不可用 | Host 会拒绝应用并保留会话原有组合与模型，不会静默回退到队长。请在 **设置 → 智能体团队预设** 中修正该成员的提供方/模型（及推理强度）后重新选择。输入区只提示成员不存在，不显示 Host 拒绝原因；请同时确认成员路由与部署的提供方目录。 |

### 若设置页始终不出现

能否渲染出该页面取决于三项环境事实，它们在安装之前就能确认：

- **宿主版本。** 支持范围是 `>=0.2.2-rc.3 <0.3.0`；本次实测版本为 `0.2.2-rc.3`，0.2.2-rc.2 及更旧版本会被拒绝。插件管理器按 `package.json` 中的 `engines.dsh` 判定。
- **profile 类型。** 安装到具备 Settings 与所需客户端服务的 Web 或 Desktop profile：Web GUI 通常为 `web`，Desktop 通常为 `desktop`。
- **后端。** 缺少 storage domain 或所选执行后端时，插件会拒绝创建成员；默认后端名为 `spawn` 和 `fork`。

## 已知限制：Windows 验证

路径分隔符与可执行文件解析的修复由归一化分隔符的单元测试和 `ENOTDIR` 用例覆盖，但本次没有可用的 Windows 机器。跨盘符 junction、真实 `PATH` 上的 `PATHEXT` 解析以及完整原生构建链仍需在 Windows 上跑一遍，才能称该版本"已通过 Windows 验证"。

## 报告问题

若上面都没有解释某次拒绝，请附上 Host 打印的原始文本、Harness 版本与所安装的 profile——这三项是问题可复现的前提。缺陷报告与 PR 欢迎提交到 [GitHub Issues](https://github.com/bloodarea/dsh-agent-team-presets/issues)。

## 相关

- [安装](../guide/install.md)——上文涉及的 profile、版本范围与后端
- [团队技能](../guide/team-skills.md)——`dependency-missing` 与删除按钮置灰背后的依赖与删除规则
- [工具与权限](tools-and-permissions.zh.md)——策略允许什么，以及调用为何会被拒
- [使用团队](../guide/using-teams.md)——成员路由与团队应用
- [文档索引](../index.zh.md)——按主题查找全部文档
- [README](../../README.zh.md)——总览、环境要求、安装与升级
