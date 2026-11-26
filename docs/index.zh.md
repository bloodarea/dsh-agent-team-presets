# 文档

`dsh-agent-team-presets` 的文档入口。[README](<../README.zh.md>) 是总览与安装入口；需要更深入的内容都从这里进。

[English](<index.md>)

## 从这里开始

| 你想… | 读这个 |
|---|---|
| 装上插件并逐步看到效果（带截图） | [新手必读（图文）](<guide/getting-started.zh.md>) |
| 选择安装渠道、固定版本、安全升级 | [安装与升级](<guide/install.zh.md>) |
| 配置团队、成员、展示元数据与分类 | [使用团队](<guide/using-teams.zh.md>) |
| 了解私有团队技能库与预设分享 | [私有团队技能](<guide/team-skills.zh.md>) |
| 打开子代理卡片标签 | [集成](<guide/integrations.zh.md>) |
| 了解面向智能体的工具、工具策略与安全边界 | [工具权限与安全](<reference/tools-and-permissions.zh.md>) |
| 排查团队、成员或安装问题 | [排障](<reference/troubleshooting.zh.md>) |
| 知道十一个内置团队各包含什么、每个角色负责什么 | [内置团队](<builtin-teams.zh.md>) |
| 知道某个角色拿到哪些团队技能、这些技能做什么 | [内置团队技能](<builtin-team-skills.zh.md>) |
| 参与插件本身的开发 | [架构与开发](<developer/architecture.zh.md>) |

## 文档地图

| 文档 | 覆盖内容 | 是否随 npm 包发布 |
|---|---|---|
| [README.md](../README.md) · [中文](<../README.zh.md>) | 总览、为什么需要、主要功能、快速开始、文档导航 | 是 |
| [docs/guide/getting-started.md](guide/getting-started.md) · [中文](<guide/getting-started.zh.md>) | 图文走查：选团队、改成员、技能库、插件联动 | 否——引用的截图不在发布包里 |
| [docs/guide/install.md](guide/install.md) · [中文](<guide/install.zh.md>) | 安装渠道、安装源选择、固定版本、升级安全、安装校验 | 是 |
| [docs/guide/using-teams.md](guide/using-teams.md) · [中文](<guide/using-teams.zh.md>) | 配置团队、成员面板、字段含义、展示元数据、分类与搜索 | 是 |
| [docs/guide/team-skills.md](guide/team-skills.md) · [中文](<guide/team-skills.zh.md>) | 私有技能库、按角色作用域、导入与扫描、依赖检查、预设分享 | 是 |
| [docs/guide/integrations.md](guide/integrations.md) · [中文](<guide/integrations.zh.md>) | 子代理卡片标签与随包替换包 | 是 |
| [docs/reference/tools-and-permissions.md](reference/tools-and-permissions.md) · [中文](<reference/tools-and-permissions.zh.md>) | 面向智能体的工具、策略模式、首轮注册、安全边界 | 是 |
| [docs/reference/troubleshooting.md](reference/troubleshooting.md) · [中文](<reference/troubleshooting.zh.md>) | 配置被覆盖、内置排障技能、常见问题、已知限制 | 是 |
| [docs/developer/architecture.md](developer/architecture.md) · [中文](<developer/architecture.zh.md>) | 集成方式、源码导航、开发命令 | 是 |
| [docs/builtin-teams.md](builtin-teams.md) · [中文](<builtin-teams.zh.md>) | 十一个内置预设：系列、角色、适用场景、恢复语义、记录存放位置 | 是 |
| [docs/builtin-team-skills.md](builtin-team-skills.md) · [中文](<builtin-team-skills.zh.md>) | 14 个随包团队技能：分类、各角色默认绑定、本地副本、作用域 | 是 |
| `docs/internal/` | 开发笔记、审计、验收与发布证据 | 否——本地材料，不入库 |

除图文走查外，上面每份公开文档都随包发布；图文走查引用的截图不在发布包里。`docs/internal/` 本身不入库，也不会被任何公开页面链接。

## 本文档的约定

- **团队名**保留原文并附上存储标识，例如 轻量研发团队 `builtin-lightweight`。标识才是配置文件、导出文档与缺陷报告应当引用的东西。
- **角色名**用存储中的原名（`team-lead`、`executor`、`repository-specialist`）。默认技能绑定就是按它匹配的，所以照引不译。
- **技能 id** 是模型使用的 kebab-case 名（`git-release-hygiene`）；中文那一列只是显示名。
- 双语文档保持同步：`X.md` 与 `X.zh.md` 陈述同样的事实。

## 相关

- [新手必读（图文）](<guide/getting-started.zh.md>)
- [使用团队](<guide/using-teams.zh.md>)
- [内置团队](<builtin-teams.zh.md>)
- [内置团队技能](<builtin-team-skills.zh.md>)
