# Changelog

Versions below are this plugin's own line. The DeepSeek Harness version it
requires is a separate number, declared in `peerDependencies` and enforced by
the plugin manager before an install or enable.

## 0.1.3

- **Publication clarification (same-version tag replacement).** The community
  package is `dsh-agent-team-presets@0.1.3`; the monorepo development package is
  `@deepseek-ai/dsh-experimental-agent-team-presets` and follows the Harness's
  version, such as `0.2.0-rc.2`. README and development notes now distinguish
  those identities, document same-profile migration and a Harness restart after
  switching package identities, and explicitly include member prompts in the
  frozen definition. Runtime code is unchanged by this publication correction.
  The `v0.1.3` tag was moved to include these documentation corrections; an
  already installed copy does not automatically receive them. Use the resolved
  commit id when an immutable pin is required.
- 中文：发布说明修正（同版本替换标签）：社区包为 `dsh-agent-team-presets@0.1.3`，monorepo 开发包 `@deepseek-ai/dsh-experimental-agent-team-presets` 的版本跟随 Harness，例如 `0.2.0-rc.2`。文档现明确区分两种来源，说明同 profile 迁移与切换包身份后的 Harness 重启，并明确成员提示词也属于冻结定义。本次修正不改变运行时代码；`v0.1.3` 标签移到包含文档修正的新提交，已有安装不会自动更新。需要不可变固定时请使用解析后的提交 id。
- **Team definitions stay consistent throughout a task.** The captain's persona,
  briefing, member preset prompts and role descriptions, member roster, and
  tool policies are adopted together between tasks,
  not replaced while the captain or a teammate is running or provisioning.
  Selection changes and removing a Team follow the same adoption boundary;
  members still running under a previously selected Team also block model-issued
  preset writes.
- **Settings reports live execution state.** An event-driven Remote stream
  supplies `idle`, `busy`, or `unknown` plus aggregate execution and pending
  adoption counts. A missing, failed, or ended stream never passes for idle.
- **Open drafts coordinate with external writes.** Settings adopts changed,
  added, or removed Teams from the Host, preserves edits to unaffected Teams,
  and reports when a stored update replaces a local edit. Saving coordinates
  against the latest stored document rather than silently restoring stale Teams.
- 中文：团队定义在任务期间保持一致，队长提示词、briefing、成员预设提示词与角色描述、成员名单与工具权限在任务间一起采用；切换或移除 Team 遵循同一边界，仍执行旧 Team 的队员也会阻止模型发起的预设写入。Settings 通过事件驱动的 Remote 流显示执行状态与待采用计数，流缺失、失败或结束不会被误判为空闲。打开的草稿会同步 Host 修改、新增或删除的 Team，保留未受影响 Team 的编辑，并提示被外部更新替换的本地编辑；保存前再次协调最新文档，避免恢复过时记录。
- **A running Team task keeps its definition, not its routing.** A member's
  `provider`, `model`, and `reasoningEffort` are read from the stored Team each
  time that member is summoned, and each slot's accent color is read when the
  roster draws, so both sit outside the definition a Team task freezes.
  Correcting a member route in Settings now reaches the next member the running
  task summons, without interrupting it or waiting for its next task — a route
  fix used to need the whole Team task to end first. Prompts, roles, roster, and
  tool policy stay frozen exactly as before, a teammate already provisioned
  keeps the route it was spawned with, and `update_team_preset` still refuses
  while the Team is executing.
- The Settings footer, `get_team_preset`, and `update_team_preset` now state
  that split, and `pendingSessions` counts only a definition a Session has not
  adopted yet.
- 中文：成员的路由与颜色不再属于团队任务冻结的定义。`provider`/`model`/`reasoningEffort` 改为每次召唤该成员时从存储的 Team 读取，颜色在绘制名单时读取，因此执行中修正路由会在下次召唤生效，无需中断任务或等到下一次任务；提示词、角色、名单与工具策略仍按原样冻结，已创建的 teammate 保留创建时的路由，`update_team_preset` 在团队执行期间仍拒绝写入。设置页脚与两个预设工具同步说明了这一区分，`pendingSessions` 只统计尚未采用的定义。

## 0.1.2

- **The captain can adjust the Team it runs.** `get_team_preset` reads the
  Session's Team preset with the exact settings revision and every editable
  field; `update_team_preset` replaces the Team description, the captain's
  description or standing prompt, and each member's description or standing
  prompt, fenced by that revision.
- **A run blocks the write.** While any Session that selected the Team has a
  member running or provisioning, `update_team_preset` returns `team-busy`,
  names the members, and writes nothing — an executing teammate would keep the
  definition it was spawned with while the captain reads the new one.
  `get_team_preset` reports the executing count so the captain can say so first.
- **A write needs a turn the user started.** A teammate's report or an automatic
  continuation cannot rewrite a preset that every Session sharing that Team sees.
- **Prompts are validated before they are stored.** A `{{variable}}` group that
  the running Session cannot resolve is refused instead of failing the captain's
  next request.
- 中文：队长可用 `get_team_preset` / `update_team_preset` 按用户要求改团队、队长与队员的描述和提示词；团队运行期间写入返回 `team-busy` 且不落盘；写入必须由用户直接发起的回合触发；提示词里的 `{{变量}}` 会先校验。

## 0.1.1

- **Share one Team.** Export a Team preset as a fixed JSON document and import
  it back, resolving a same-named Team, captain, or member one at a time.
- 中文：团队预设可导出为固定 JSON 文档并导入；团队名/队长名/队员名冲突时逐个询问是替换还是改名新增。

## 0.1.0

- First public snapshot: named Team presets in Settings, the composer Team
  control, the captain briefing, per-member model route and tool policy, and
  `spawn_team_member`.
- 中文：首个公开快照：Settings 里的具名团队预设、composer 团队控件、队长 briefing、队员独立模型路由与工具策略，以及 `spawn_team_member`。

## Install, update, and pin

- Install: `dsh plugin add github:bloodarea/dsh-agent-team-presets`
- Pin a version: `dsh plugin add github:bloodarea/dsh-agent-team-presets#v0.1.3`
- Update: this Harness does not update an installed plugin automatically, so
  remove it and install the new version. A GitHub spec resolves to the default
  branch head. A release tag selects that release, but this `v0.1.3` tag was
  explicitly replaced to correct its documentation; a commit id is immutable.
  The installed version comes from the loaded package's own `package.json` and
  appears in plugin details as `v{version}`. Check the package name too: a
  monorepo development link reports its Harness-aligned version instead of the
  community package's version. See the README for migration and restart steps.
- Host requirement: a DeepSeek Harness satisfying `>=0.2.0-rc.1 <0.3.0`. The
  plugin manager evaluates the declared peers against the running harness and
  refuses `incompatible-version` when they do not match.
- `lib/` ships prebuilt, so installing needs no build step; changing the source
  requires a DeepSeek Harness source checkout — see
  [DEVELOPMENT.md](DEVELOPMENT.md).
