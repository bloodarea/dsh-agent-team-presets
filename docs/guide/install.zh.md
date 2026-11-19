# 安装与升级

插件运行前需要什么、三种安装方式，以及升级之前如何确认安装结果。

[English](<install.md>) · [文档索引](../index.zh.md) · [README](../../README.zh.md)

## 环境要求

- **DeepSeek Harness `>=0.2.2-rc.3 <0.3.0`。** 本次实测版本为 **`0.2.2-rc.3`**；0.2.2-rc.2 及更旧版本会被拒绝。成员路由通过 `agent.model.select()` 写入各自会话，fresh、fork 与冷恢复均使用成员自己的配置；队长使用当前会话选择。插件管理器按 [package.json](../../package.json) 的 `engines.dsh` 判定兼容性。
- **自定义工具白名单有自己的规则边界。** 策略允许什么、限制什么，见[工具与权限](../reference/tools-and-permissions.md)。
- **无需 Agent Teams bundle。** 成员通过部署自带的可继续执行 subagent 后端创建；原生消息、任务工具与 Web 名册不受本插件影响。
- **具备 Settings 与所需客户端服务的 Web 或 Desktop profile。** 安装到实际使用的 profile：Web GUI 通常为 `web`，Desktop 通常为 `desktop`。
- **成员执行所需的持久存储与支持恢复执行的子智能体后端。** 缺少 storage domain 或所选执行后端时，插件会拒绝创建成员。默认后端名为 `spawn` 和 `fork`。

插件版本（`0.3.3`）和 Harness 版本（如 `0.2.2-rc.3`）是不同的版本线。

## 安装

### 方式一 —— npm 包（推荐，会收到更新提示）

打开 **全局面板 → 插件 → 添加插件**，把下面这一行粘贴到「包名或地址」，点击 **安装**：

```text
dsh-agent-team-presets
```

也可以用命令行安装：

```sh
dsh plugin --profile <profile> add dsh-agent-team-presets
```

将 `<profile>` 替换为实际运行的 profile（例如 `web` 或 `desktop`）：

```sh
dsh plugin --profile web add dsh-agent-team-presets
```

插件管理器会把已安装版本与 npm 的 `latest` 标签比较，之后每有新版本都会提示更新。

### 方式二 —— 浮动 GitHub 安装

跟随仓库默认分支；该分支上的 `package.json` 版本升高后就会提示更新：

```sh
dsh plugin --profile <profile> add github:bloodarea/dsh-agent-team-presets
```

### 方式三 —— 可复现的固定版本（收不到更新提示）

```text
dsh-agent-team-presets@0.3.2
dsh plugin --profile <profile> add github:bloodarea/dsh-agent-team-presets#v0.3.2
```

固定版本号或固定标签只能复现一个确定的发布。**带 `#标签` 的 GitHub 规格只会与同一个标签比对，市场永远不会提示更新——升级只能手动改规格。** 只在确实需要冻结安装时使用这种形式。

### 安装说明

- **安装源**决定从哪个 npm 源下载。「默认安装源」指 pnpm 自身配置所指的源。要绕开镜像选「npm 官方源」；要换内网私有源或云厂商镜像选「自定义地址」。
- 输入框支持包名、`name@version`、`github:作者/仓库`、tarball 地址或本地绝对路径。
- 本包声明了自己的 `dsh.bundle`，安装后由插件管理器登记为 profile 的 bundle 层，不要再手写 loader 条目。
- 已安装本包时无法重复安装同一包名。要更换安装来源（如由 GitHub 改为 npm），先在插件列表中卸载，再粘贴新规格安装。
- GitHub 与 [npm](https://www.npmjs.com/package/dsh-agent-team-presets) 是独立发布渠道，换渠道前先确认这次会装到哪个版本：

```sh
npm view dsh-agent-team-presets version
```

- 安装完成后按提示重新加载或重启应用。

## 确认安装并安全升级

安装成功后，按插件管理器的提示重新加载或重启，打开 **设置 → 智能体团队预设**。确认插件详情显示 `dsh-agent-team-presets`、刚安装的版本号，且组件处于运行中状态。

- 升级前备份 profile 设置、团队定义与会话选择记录。
- 从开发链接迁移时，先通过插件管理器移除 `@deepseek-ai/dsh-experimental-agent-team-presets`，再启用社区包。
- 切换包身份后重启 Harness，再刷新 GUI。

> **安装 bundle，不要再声明一份 loader 条目。** 本包已经提供[自己的 bundle patch](../../cordis.patch.yml)。在 profile patch 中手写重复声明，可能导致设置无法保存；本包自带的这一份声明已经足够。

## 接下来

- [使用团队](using-teams.zh.md) —— 配置团队并在会话中调度。
- [新手必读（图文）](getting-started.zh.md) —— 逐屏走查。
- [文档索引](../index.zh.md) —— 按主题查看全部文档。
