# Changelog

Versions below are this plugin's own line. The DeepSeek Harness version it
requires is a separate number, declared in `peerDependencies` and enforced by
the plugin manager before an install or enable.

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
- Pin a version: `dsh plugin add github:bloodarea/dsh-agent-team-presets#v0.1.2`
- Update: this Harness does not update an installed plugin automatically, so
  remove it and install the new version. A GitHub spec resolves to the default
  branch head, so pinning a tag is what makes "which version am I on" exact. The
  installed version is the `version` field of the plugin's own `package.json`,
  and the plugin list shows it as `v{version}`.
- Host requirement: a DeepSeek Harness on the `0.2.0-rc` line or later. The
  plugin manager evaluates the declared peers against the running harness and
  refuses `incompatible-version` when they do not match.
- `lib/` ships prebuilt, so installing needs no build step; changing the source
  requires a DeepSeek Harness source checkout — see
  [DEVELOPMENT.md](DEVELOPMENT.md).
