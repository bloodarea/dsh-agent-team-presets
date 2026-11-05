/**
 * The plugin's own global troubleshooting skill.
 *
 * Unlike a Team Skill, this is a host-level runtime skill: it is registered on
 * the plugin's own context as soon as the deployment composes the skill
 * service, so every Session can see it without a Team, a role assignment, or
 * any per-Agent scope. It documents the failure modes this plugin can produce
 * and the evidence that distinguishes them from host, provider, and user
 * configuration problems.
 *
 * @module dsh-agent-team-presets/builtin-skill
 */
/** Stable name the host `skill` tool addresses this guide by. */
export const BUILTIN_SKILL_NAME = 'agent-team-presets-troubleshooting';
/** Routing description shown in the session skill catalog. */
export const BUILTIN_SKILL_DESCRIPTION = '当使用 dsh-agent-team-presets 出现团队不生效、成员无法召唤、工具被拒、成员模型路由不符、Team Skill 不可见、安装/升级异常或行为与预期不一致时使用；按证据定位，区分插件、宿主与用户配置。';
/** Extra routing guidance; kept separate from the body so discovery stays short. */
export const BUILTIN_SKILL_WHEN_TO_USE = '用户报告本插件的 Team 选择、成员创建、工具策略、模型路由、Team Skill、安装升级或运行时行为异常时。';
/** The full instruction body loaded by the host skill tool. */
export const BUILTIN_SKILL_CONTENT = `# Agent Team Presets 使用问题排查

## 适用范围

本 Skill 只处理 **dsh-agent-team-presets** 插件自身的配置与运行问题。Agent Teams 子系统、模型供应商、宿主 UI 或浏览器本身的问题要分开判断；不要把所有异常都归因于本插件。

排查原则：先确认事实，再改配置；只读诊断优先；修改、重装、重启前先确认影响和回滚方式。

## 证据优先级（重要）

按以下顺序采信证据，不要用低优先级的值推翻高优先级的值：

1. **运行事实**：成员子会话日志里的 model/selection、首条 request/header 的 header.config；spawn_team_member 返回的 configuredRoute；成员快照里的 route。
2. **配置事实**：Team 预设中该成员的 provider/model/reasoningEffort；当前会话的 Team selection；Agent preset。
3. **展示值**：subagent/descriptor 的 agentModel、list_agents/成员名册里的 model、UI 卡片上的模型名。

展示值可能是从父会话继承的 fallback 元数据，**不能作为模型路由证据**。已知 list_agents 的 model 可能返回错误或继承值，而成员实际请求已经使用自己的路由；这属于展示问题，不代表路由注入失败。同理，路由恰好等于队长模型时，也不能证明“注入生效”；要验证注入，应选一个与队长路由不同的成员做对照。

## 快速分诊

| 现象 | 先查 | 常见原因 | 处理 |
|---|---|---|---|
| 选中团队但不生效 | 当前会话 Team selection、应用状态、报错文本 | Team 无效、被 quarantine、任务运行中冻结、Agent preset 不兼容 | 修复预设或换 Team；等队长/成员 idle；必要时换 Agent preset |
| 自定义工具策略被拒 | 报错是否提到 native Agent preset / PTC | DSH rc.1 无法在临时覆盖执行器后恢复继承执行器，插件主动拒绝 | 改用 all-tools，或先把 Agent preset 换成 standard/cordis |
| 成员无法召唤 | 报错文本、成员快照、subagent provider、存储 | 无 member runtime、无存储、无 spawn/fork 后端、深度/配额、快照损坏、技能目录无法发布 | 按报错逐项修复；不要绕过标记或隔离 |
| 成员模型与配置不符 | configuredRoute、model/selection、request/header、成员快照 route；list_agents 的 model 仅作展示 | 展示值 fallback（list_agents 可能返回错误/继承模型）；预设未保存；provider 不支持该模型/effort；成员路由在召唤时读取 | 以运行证据为准；三处运行证据一致而 list_agents 不同时，判定为展示问题，实际路由正确 |
| Team Skill 不可见 | 是否已分配给正确 roleId、skill 工具是否可见、库是否打开 | 分配错角色、成员创建早于目录发布、宿主隐藏 skill 工具、存储未打开 | 重新分配/重建成员；检查库与绑定 |
| 成员没有技能 / 创建被拒 | 该角色是否已有分配、目录能否发布 | 有分配但目录发布失败，插件拒绝创建以避免空目录 | 修复 Team Skill 存储/绑定后再召唤 |
| 运行中改配置不生效 | 队长/成员是否 running、任务边界 | 运行中的 Team 任务冻结定义 | 等任务结束或换 Team；不要强改运行中定义 |
| Agent preset 切换失败 | 会话是否已开始、报错是否 locked | 只能在首轮前切换；切换后 Team 会重新校验 | 新建会话；PTC 下改用 all-tools 或原生 preset |
| 安装/升级异常 | 保存的依赖、已安装版本、engines、安装日志 | 版本范围不符、包管理器策略、安装未完成、未重启 | 按官方管理器重试；核对版本/哈希/重启要求 |
| 重挂载后工具被拒 | quarantine 状态、任务边界 | 运行中重挂载会隔离到任务边界 | 等 idle；选择其他 Team 或 No team |

## 1. 选中团队但不生效

- 先确认当前会话的 Team selection：输入区 Team 控件、设置页，或 profile 的 cordis.patch.yml 中 selections。当前会话没有选中 Team 时，工具不受 Team 策略约束，这是预期行为。
- 如果 Team 被拒绝，页面/日志会给出原因：能力缺失、PTC 自定义策略、恢复失败、定义无效等。按原因修预设，不要反复重选同一个无效 Team。
- 如果队长或任一成员正在 running/provisioning，当前 Team 任务会冻结它启动时的定义；新保存的修改要等任务边界才采用。不要用重挂载强行刷新。
- 恢复通道：在输入区选择另一个有效 Team 或 No team；变更在队长和成员都 idle 后生效。
- 如果报错提到配置被 home patch / 命令行覆盖，检查 profile patch、$DSH_HOME/cordis.patch.yml 和 --patch 是否有重复的 agent-team-presets 声明。

## 2. 自定义工具策略被拒 / PTC

典型报错：

~~~text
Custom Team tool policies require a native Agent preset (standard or cordis).
This Session uses PTC, and this Harness version cannot restore an inherited
executor after a temporary override.
~~~

- 这是 **有意拒绝**，不是漏配。DSH 0.2.2-rc.1 的 setExecutor disposer 会在精确作用域留下不可用的选择，没有公开操作能恢复继承执行器；插件不再安装 native presentation 覆盖，因此 PTC 下不能安全执行自定义 allow-list。
- 处理：
  1. 在会话开始前把 Agent preset 切到 standard 或 cordis；或
  2. 该 Team 改用 all-tools 模式（PTC 仍可用）。
- 不要尝试 presentAs、强制 native、关闭 guard 或修改隔离来“让它先跑起来”；这会让策略与实际执行面不一致。
- 检查点：会话当前 Agent preset、Team 队长/成员的 toolMode、报错是否来自应用阶段还是 spawn_team_member。

## 3. 成员无法召唤

先读完整报错，再对照：

- **没有 member runtime**：Session 不是在插件激活范围内组合的，无法给成员安装冻结配置。检查 profile 是否加载了本插件与 Agent Teams。
- **没有持久存储 / member store 打不开**：成员快照无法落盘，创建会被拒绝。检查 storage domain 与 $DSH_HOME 可写性。
- **没有执行后端**：spawn/fork provider 未注册、不可用或不能创建 continuable child。检查 subagents provider 注册与配置的 freshProvider/forkProvider。
- **深度/并发/生命周期配额**：检查 delegation depth、并发 subagent 上限、Team lifetime member quota。成员名不会被复用；已完成的成员仍占 roster 槽位，下一次会得到 executor-2 之类的新名字；lifetime quota 用完后不能再召唤。
- **标记为 preset-managed 但 roster 找不到 / 快照丢失或损坏**：插件会拒绝而不是用默认配置恢复。检查成员快照与 Team roster，不要手工伪造标记。
- **技能目录无法发布**：该角色已有 Team Skill 分配，但目录没有成功发布；插件拒绝创建，避免成员首轮看到空目录。先修 Team Skill 存储/绑定。

检查位置：$DSH_HOME/storages/agent_team_presets_members.json、profile 的 subagents 配置、Team Skill 库与 bindings.json、当前 Team 的成员 roster。

## 4. 成员模型路由不符 / 验证路由

按证据优先级取证：

1. spawn_team_member 结果里的 configuredRoute：插件实际安装的路由。
2. 成员子会话日志的 model/selection：会话级持久选择。
3. 同一日志首条 request/header 的 header.config：真实请求使用的 provider/model/reasoningEffort。
4. 成员快照的 route：冻结在成员记录里的路由。

不要用 subagent/descriptor 的 agentModel、list_agents/成员名册的 model、UI 卡片上的模型名作为路由证据；它们可能是父会话继承的展示值。

**已知展示差异：** list_agents 的 model 字段可能返回父会话的 fallback 模型（例如队长模型），而成员实际请求已经使用自己的路由。只要 configuredRoute、model/selection、首条 request/header.config、成员快照 route 一致，就应判定为“展示值错误、实际运行正确”，不要据此修改 Team 或报告路由故障。

如果实际请求与配置不一致：

- 确认 Team 预设中该成员的 provider/model/reasoningEffort 已保存；
- 确认 provider registry 支持该模型和 reasoning effort；
- 成员路由在召唤时读取；已存在成员保留冻结路由。修改 Team 后请召唤新成员（名字不会复用）；
- 冷恢复成员会重放其记录路由；要换路由，创建新成员。
- 如果配置路由恰好等于队长模型，选一个不同路由的成员做对照，才能证明注入生效。

## 5. Team Skill 不可见 / 成员没有技能

先区分两类技能：

- **Team Skill**：本插件的私有库，按 Team 角色分配，只在被召唤成员自己的 Agent 作用域注册；默认路径 $DSH_HOME/agent-team-presets/team-skills。
- **宿主/插件级 skill**：注册在全局层，所有会话可见；例如本排查 Skill。它不需要 Team，也不按角色隔离。

Team Skill 排查：

- 库是否成功打开；资产是否存在于私有库；
- 是否分配给正确的 roleId（不是显示名）；成员的角色身份是否匹配；
- 该 Agent 是否能看到 skill 工具（宿主隐藏它时，分配存在但目录不可用）；
- 成员创建时目录是否已发布；有分配但发布失败时，插件会拒绝创建。

检查 bindings.json、库页面与成员快照中的 roleId；不要手工编辑存储文件。

## 6. 内置技能更新 / 本地覆盖

- 插件内置的 Team Skill 是只读的；需要修改时创建本地副本（override），不要直接改内置目录。
- 内置版本升级后，本地副本可能显示 updateAvailable；用“恢复为插件内置版本”重置。
- 如果日志出现 shipped skill changed without bumping its version，说明包内文件变了但版本号没变；保留已审核副本并修正发布版本，不要强行覆盖。

## 7. 任务运行中改配置不生效

- 运行中的 Team 任务会冻结它启动时的定义：persona、briefing、成员 roster、工具策略都来自冻结定义。
- 新保存的 Team 修改只在任务边界采用；不要在队长/成员 running 时期待热更新。
- 需要立即切换时，先结束/等待任务，或在输入区选择其他 Team / No team；不要用重挂载绕过冻结。

## 8. Agent preset 切换失败 / Team 重新校验

- Agent preset 只能在会话首轮开始前切换；已有轮次后会报 agent-preset/locked。需要换 preset 时新建会话。
- 切换 preset 后，插件会释放旧 Team 应用并按新能力重新校验选中的 Team。新 preset 是 PTC 且 Team 使用自定义策略时，会被拒绝或隔离；改用 all-tools 或原生 preset。
- 切换后如果工具暂时被拒，检查是否在重新校验窗口；等应用完成，不要连续重试。

## 9. 安装 / 升级 / 版本

- 本版本要求 DSH >=0.2.2-rc.1 <0.3.0；旧宿主请保留 0.1.8。安装前核对 engines.dsh。
- 通过官方插件管理器安装/升级；仓库包含预构建产物，通常无需构建。
- 安装失败时不要只看版本号：核对 application 结果、warnings、保存的 package source、已安装文件哈希、是否需要重启。
- 失败的安装可能让 node_modules 比保存的依赖规格更新；这是未完成状态，不要据此宣称升级成功。解决包管理器策略后重试，并再次核对保存的 source 与运行版本。
- 不要为了强制使用被拒绝的包文件而反复切换插件激活状态。

## 10. HMR / 重挂载 / quarantine

- 运行中重挂载可能让 Session 进入 quarantine，直到任务边界；这是保护措施，不是配置错误。
- 等队长/成员 idle 后再操作；用输入区选择另一个 Team 或 No team 恢复。
- quarantine 下队长只有恢复工具可用，成员没有豁免；不要尝试关闭 guard 或伪造状态。

## 11. 诊断命令与证据位置

当前会话/Team：

~~~bash
# profile 中的 Team 定义与 selections（按实际 profile 调整）
sed -n '1,200p' "$DSH_HOME/profiles/web/cordis.patch.yml"
~~~

成员快照：

~~~bash
python3 - <<'PY'
import json, os
from pathlib import Path
home = Path(os.environ.get('DSH_HOME') or (Path.home() / '.dsh'))
p = home / 'storages/agent_team_presets_members.json'
d = json.loads(p.read_text())
for k, v in d['tables']['members'].items():
    if v.get('rootSessionId') == '<root-session-id>':
        print(k, v.get('memberName'), v.get('route'), v.get('childSessionId'), v.get('lifecycle'))
PY
~~~

成员子会话日志：

~~~bash
# 先按 DSH_SESSION_ID 找到目录；日志文件名以实际为准
SID='<child-session-id>'
DIR=$(find "$DSH_HOME/sessions" -maxdepth 2 -type d -name "$SID")
zstdcat "$DIR/session.v4.jsonl.zstd" | python3 -c '
import json, sys
sel = []; hdr = None
for line in sys.stdin:
    e = json.loads(line)
    if e.get("type") == "model/selection": sel.append(e.get("data"))
    elif e.get("type") == "request/header" and hdr is None:
        hdr = e["data"]["header"]["config"]
print("selection", sel)
print("request", hdr)
'
~~~

注意：request/header 行内嵌完整 tools schema，不要直接 grep 原文，使用 JSON 投影只取 header.config。

Team Skill 私有库：

~~~bash
ls -la "$DSH_HOME/agent-team-presets/team-skills"
cat "$DSH_HOME/agent-team-presets/team-skills/bindings.json"
~~~

插件版本/范围：profile 的 package.json、已安装包的 package.json、engines.dsh。

## 12. 报告模板

报告时请给出：

- 现象与预期；
- 复现步骤（Session、Team、成员、Agent preset）；
- 插件版本与 DSH 版本；
- 证据：configuredRoute、model/selection、request/header.config、成员快照 route、相关日志路径；
- 已确认 / 未确认的边界；
- 建议的修复与影响。

不要在没有运行证据时宣称“已修复”；不要把展示值当作运行事实；不要在未授权时提交、推送或发布。
`;
/**
 * Register the global troubleshooting skill when the deployment composes the
 * skill service.
 *
 * The registration is intentionally not scoped to an Agent: it belongs to the
 * plugin installation, so a Session with no Team, no selected preset, and no
 * Team Skill assignment can still load it. The injection fiber is owned by the
 * plugin, so unload removes the skill with the rest of this activation.
 * @param ctx - the plugin context whose lifetime owns the registration.
 */
export function registerBuiltinSkill(ctx) {
    ctx.inject(['skills'], (injected) => {
        injected.effect(() => injected.skills.register({
            name: BUILTIN_SKILL_NAME,
            description: BUILTIN_SKILL_DESCRIPTION,
            whenToUse: BUILTIN_SKILL_WHEN_TO_USE,
            source: 'runtime',
            content: BUILTIN_SKILL_CONTENT,
        }), 'agent-team-presets: built-in troubleshooting skill');
    });
}
