# PR #3 · Linux 侧实现与验证报告（R1–R3 交付证据）

> 项目：`dsh-agent-team-presets`　关联：[PR #3](https://github.com/bloodarea/dsh-agent-team-presets/pull/3)
> 对应 Windows 复现报告：`PR3_Windows_Bug_Reproduction_Report.md`（R1 已复现 / R2 未复现 / R3 机制已复现）
> 基线：`main` @ `d513a59`（`v0.1.7`）；本报告描述的是 `main` 之上、**尚未提交**的工作树
> 版本：`package.json` 仍为 **0.1.7**。这是**既有版本号下的修复工作树，不是发布候选（non-release-candidate）**：没有改版本号、没有提交、没有打 tag、没有发布（`npm publish` 未执行）。
> 平台：Linux（x86_64）+ Node v22.23.3 / npm 10.9.9
> 日期：2026-10-27（Asia/Shanghai）

---

## 0. 结论摘要

| 编号 | 结论 | 本侧证据 |
|---|---|---|
| **R1** | ✅ 已修复并回归 | 真实创建链：成员 custom 白名单 `['read']` 不含 `skill`，其**首个请求**的 `tools` 含 `skill`，请求文本已含已发布 catalog（`release-check` 名称+描述）。`skill` 既从 UI 可配置列表中移除，也**始终被策略放行**（`src/presets.ts` + `src/tool-policy.ts` + `src/tool-catalog.ts` + `src/client/TeamAgentView.tsx`） |
| **R2** | ✅ 已修复（成员边强制、队长边同轮），并如实标注边界 | 成员：创建边 `await` **该 Agent 自己**的注册 Promise，失败即拒绝创建。队长：在同一创建边内、Team 应用之后完成注册（同步安装，非后台）。负向对照证明该 await 有效（见 §4.3） |
| **R3** | ✅ 已修复并端到端验证 | 路径归一化（`isWithinDirectory`）、构建前清理 staged 包目录、Typert 生成后校验必需入口存在；并**移除 `lib/` 自举依赖**——`lib/` 完全不存在时也能构建，产物与仓库版本逐字节一致 |
| Windows 端到端 | ⛔ 未做（环境限制） | 本机无 Windows。仅做了分隔符归一化与 `ENOTDIR` 的单元级验证；junction 跨盘、真实 `PATHEXT`、原生 PowerShell 流程需 Windows 复跑（§6） |

---

## 1. 交付物与校验和

### 1.1 打包产物（`npm pack`，未发布）

| 项目 | 值 |
|---|---|
| 文件 | `/tmp/npm-pack-final2/dsh-agent-team-presets-0.1.7.tgz` |
| 大小 | 835,472 B（解包 3,924,037 B） |
| 条目数 | 111 |
| **SHA-256** | `25c0c79fb6e97b13abe17b435b87160a93f973f6f440f05e1c0f2e7804061d2f` |
| npm shasum (SHA-1) | `0a8783138d4bc99f95747297ceafc7016b895fcd` |
| npm integrity | `sha512-2si/hgCfyZw9WBABZX2s60eJ8Sy2pFZ7HndfmFzBWwQAjYuStsSzZXbSOGjnOuTHy9EoXCpaechUCpQ6U5Ulig==` |

包内已逐项核对：`lib/index.js`、`lib/client.js`、`lib/types/index.js`、`lib/types/team-skills/provider.js`、`lib/typert.remote-client.d.ts`、`assets/skills/grilling/SKILL.md`、`locale/zh.json` 均存在；产物内含本次新增符号（`skillAssignmentRefusal` / `refuseMember` / `settleOrCancel` / `resumeArmed` / `whenAvailable`）与新版中英 README，确认打包的是**最终源码的产物**。

### 1.2 构建产物的确定性

| 项目 | 值 |
|---|---|
| 产物数 | `Built 99 local artifacts` |
| Host SHA-256（`lib/index.js`） | `56d3c5ed361bc06decd7adced913b4154dea1074f9ce7b92a2af975e3db57e26` |
| 同源重复构建 | 连续两次构建得到同一 SHA-256（确定性） |
| 干净副本 vs 仓库 `lib/` | `diff -r` **无差异** |

---

## 2. 变更清单

工作树相对 `main`：**44 个已跟踪文件被修改 + 7 个新增（未跟踪）文件**（未暂存、未提交）。行数分布：`src`/`tests`/`tools`/两个 README 合计 23 个文件 +829/−205；`lib/` 19 个产物文件 +1320/−251（重建所致）。

### 2.1 源码（本次修订的重点）

| 文件 | 作用 |
|---|---|
| `src/presets.ts` | 新增共享常量 `SKILL_TOOL_NAME`、`IMPLICIT_TOOLS`（Host 与页面共用；页面不导入 Host 半） |
| `src/tool-policy.ts` | `inheritedFilter` 改为 `admits()` 双条件：当前可见（`tools.get`）**且**可被 allow-list 命名（`restrict` 探测）。宿主已裁掉的名字不复活、界面不谎报；历史白名单中的 `skill` 跳过探测（宿主无该工具时不拒整队） |
| `src/application.ts` | `capabilityRefusal` 跳过隐式工具：旧文档含 `skill` 在未组合该工具的部署上不拒 Team |
| `src/tool-catalog.ts` | 设置页目录不输出 `skill`（无可配置项） |
| `src/client/TeamAgentView.tsx` | “已保存但缺失的工具”列表排除隐式工具（历史 `['read','skill']` 不提示删除） |
| `src/team-skills/index.ts` | `open()` 变单次共享 readiness；`syncAgent` 返回 `{agent, outcome, assigned}`；store 打不开时 `assigned: undefined`（不可知 ≠ 0）；持有注入上下文的 `whenOpened` |
| `src/team-skills/provider.ts` | 核心重做：长寿命 `ctx.inject(['skills'])` 上下文、`skillsReady` 唯一就绪屏障、`sync()` 返回 `installed/none/deferred/failed`、失败不吞、取消可 settle。`whenAvailable()` 的准确条件：服务**未组合**（`ctx.get('skills') === undefined`）时立即返回 `false`，不进入等待；服务**已可读但注入上下文尚未就绪**时 `await skillsReady`（同一 tick 内必触发，故有界）；有 signal 时再与 abort 赛跑 |
| `src/index.ts` | 每 Agent 独立 Promise（删除共享 `installation` 槽）；创建边 await 自己的注册；`refuseMember`/`abandonCreation` 统一清理（`agentRoles`/`childEnvelopes`/`childPolicies`/`presetTools`/`skillTools`/quarantine/pending*）；root 创建边 `await` 它刚排队的 application job（带 abort 边界）后再同步队长注册 |
| `tools/build.mjs`、`tools/typecheck.mjs`、`tools/build-utils.mjs` | R3：路径归一化、隔离 staging、**无 `lib/` 自举**、生成后校验必需入口 |
| `README.md` / `README.zh.md` | 隐式放行 + 不作为可选项、首轮保证与拒绝语义、Windows 已知限制 |

### 2.2 新增测试

| 文件 | 用例数 | 覆盖 |
|---|---|---|
| `tests/team-skill-creation.spec.ts` | 11 | 真实创建链首轮、未绑定不外泄、无服务/库不可读/注册被拒/重试四条拒绝路径、队长首轮、队长降级不拒队、队长晚组合服务、**创建边内完成**、无绑定时兼容 |
| `tests/team-skill-visibility.spec.ts` | 6 | 策略放行、catalog 可见性、宿主未组合时不命名 |
| `tests/build-workspace.spec.ts` | 10 | 分隔符归一化、镜像、staging 生命周期与拒绝不安全清理 |
| `tests/fixtures/npm.ts` | — | 跨平台 `npm` 调用（Windows 上的 `npm.cmd`） |

---

## 3. 测试与类型检查证据

| 命令 | 环境 | 结果 |
|---|---|---|
| `node tools/test.mjs` | `DSH_CHECKOUT=…/dsh-0.2.1-rc.2` | **49 files / 733 passed / 1 skipped**，exit 0 |
| `node tools/test.mjs` | `DSH_CHECKOUT=…/dsh-0.2.1-rc.3` | **49 files / 733 passed / 1 skipped**，exit 0 |
| `node tools/typecheck.mjs` | rc.2 | host 0 / client 0 local diagnostics，exit 0 |
| `node tools/typecheck.mjs` | rc.3 | host 0 / client 0 local diagnostics，exit 0 |
| `node tools/build.mjs` | rc.2 | `Built 99 local artifacts`，exit 0 |
| **干净副本**（删除整个 `lib/`）`node tools/build.mjs` + `node tools/test.mjs` | rc.2 | 构建 99 artifacts；测试 **49 files / 733 passed / 1 skipped**，exit 0 |

跳过项为既有的 1 个 `it.skip`，与本次改动无关。

### 3.1 `lib/` 自举限制：已修复

构建脚本原先无条件复制 `lib/typert.remote-client.d.ts` 作为分析期输入，因此“清空 `lib/`”会 `ENOENT` 失败（Windows 报告的提醒①也指出提交产物会掩盖构建失败）。现改为：存在旧产物则复用，不存在则写入 `export {}` 种子；真正的声明由紧随其后的 `WorkspaceTypertGenerator` 生成并覆盖，两个 face 的类型检查都在生成之后进行。

验证方式（不是“凭 stub 假设可行”）：

1. 在**完全没有 `lib/` 目录**的隔离副本中构建成功，`lib/types/index.js` 等全部由本次生成；
2. 生成的 `lib/typert.remote-client.d.ts`（77 行、含 30 处 `teamSkills/` 契约）与仓库中此前跟踪的版本**逐字节相同**；
3. 干净副本产物与仓库 `lib/` 全目录 `diff -r` 无差异；
4. 同源连续两次构建 SHA-256 一致。

---

## 4. 关键契约与实现说明

### 4.1 `skill` 的隐式放行（R1）

- 团队策略对 `skill` 的处理是：**只要本次部署真的把这个工具给了该 Agent，就放行**。判定同时要求“当前可见”（`tools.get` 已应用整条作用域链的限制）与“可被 allow-list 命名”（`restrict` 接受该名字），因此**不会绕过宿主限制**：宿主自己裁掉（或外层作用域已移除）时，插件不复活它，也不谎称已发布。
- 设置页不再呈现该项；旧文档里的 `skill` 条目照常加载：不报“不可用”、不要求删除、保存不清除。
- 能力预检（`capabilityRefusal`）跳过隐式工具，因此“旧配置含 `skill` + 部署未组合该工具”不会拒掉整个 Team。

### 4.2 首轮就绪（R2）

- **成员**：创建边 `await` 该成员**自己**的注册 Promise（每 Agent 一个，不再共享槽位）。角色持有已分配技能但注册结果为 `deferred`/`failed` 时：**拒绝创建**并在拒绝文案里给出原因（未组合技能服务 / 库不可读 / 注册被拒）。角色无分配时不受影响（无技能服务的部署照常创建成员）。
- **队长**：root 创建边先 `await` 它刚排队的 application job（`reconcile` 现在返回该 job 的 promise，abort 作为取消边界，不使用任何定时器），再同步该 role 的技能注册。队长注册失败**不拒队**——已应用的 Session 不能因技能发布失败而失去能力策略——失败以该 Agent 身份记录为可观察警告。
- **边界说明（不夸大）**：宿主在 `agent/pre-step` **之前**已完成 prompt 组装，因此在 pre-step 内 await 无法补救当轮；本实现只通过创建边生效。`whenAvailable()` 无 signal 分支本身没有墙钟超时，其有界性来自“服务可读 ⇒ 注入回调必在下一 tick 触发”这一 Cordis 语义；宿主若改变该语义，此路径可能挂起。已在该方法注释中写明。

### 4.3 负向对照（证明测试不是空转）

把 root 创建边的 `await` 临时改回原来的 `reconcile(agent)` 之后重跑 `tests/team-skill-creation.spec.ts`：

- `finishes the captain registration inside the creation edge itself` **失败**（说明它确实检验“创建边内完成”）；
- 其余 10 个仍通过（说明它们靠后续宏任务收敛，不能单独证明该行为）。

恢复后 11/11 通过。

### 4.4 隔离与失败清理

- 隔离仍只承诺 **skill API / 目录边界**：provider 注册在**以该 Agent 为 key 的 Cordis 作用域**内，未绑定的名字对该 Agent 不可见、`get` 返回 `undefined`；**不宣称文件系统保密**（成员仍可通过获准的工具读取其有权读取的路径）。
- 拒绝创建时统一清理 `agentRoles`、`childEnvelopes`、`childPolicies`、`presetTools`、`skillTools`、quarantine、`pending*`、member claim 与技能注册；Host 取消（abort）走同一套 `abandonCreation`，只是不抛错。

---

## 5. 事实与限制（如实声明）

1. **版本**：工作树仍是 `0.1.7`，**不是发布候选**；未提交、未打 tag、未发布。
2. **未提交状态**：全部改动位于工作树（44 修改 + 7 新增），`git diff --cached` 为空。
3. **Windows 未验证**：无 Windows 机器。分隔符归一化、`ENOTDIR`、`PATHEXT` 候选生成均为单元/模拟级验证；junction 跨盘、真实 `PATH`、原生 PowerShell 流程未跑。
4. **无 GUI 点击验证**：UI 变更（`skill` 不再出现、历史项不提示删除）由结构测试与 catalog 输出验证，未在真实浏览器点击。
5. **`store` 不可读 = fail-closed 的可用性影响**：私有库打不开时任何成员创建都会被拒（`assigned` 未知按拒绝处理），包括本身不需要技能的团队；修复库路径或重启后恢复。这是有意的安全权衡。
6. **队员并发**：每 Agent 独立 Promise 已消除共享槽位；但“同一 Agent 短时间内多次改绑”由 generation 计数保证只有最新意图生效，未做高并发压测。
7. **依赖安装与版本**：仓库**不跟踪** `package-lock.json`（也没有 `pnpm-lock.yaml`），因此不能用 `npm ci`；请用 `npm install --legacy-peer-deps`（Windows 报告记录过首轮 `npm install` 报 arborist `edgesOut` 失败，`--legacy-peer-deps` 可装成功）。本侧实测组合：Node v22.23.3 / npm 10.9.9 / `@deepseek-ai/*` 0.2.1-rc.2（`package.json` devDependencies）/ 宿主兼容范围 `>=0.2.0-rc.2 <0.3.0`；`vitest ^4.1.8`、`typescript ^5.6.0`（检出内为 5.9.3）、`tsdown ^0.22.2` 由 Harness 检出解析。
8. **类型检查的两个 face 有先后依赖**：client face 依赖 `lib/` 中由 `tools/build.mjs` 生成的 `typert.*.d.ts`。因此“只复制 `src/`+`tools/` 的探针副本”会得到 39 条与注入无关的 client 诊断——负向对照必须在**构建之后**整棵复制（§6 步骤 2 已据此修正）。本侧实测：整棵副本基线 `0/0` exit 0；注入 `const __probe: number = "x"` 后 `host: 2 local diagnostics`、exit 1。
9. **一个测试需要 git 历史**：`tests/committed-artifact.spec.ts` 的负向对照执行 `git show v0.1.6:lib/index.js`，因此**无 `.git` 的纯归档副本会失败 1 条**（本侧实测 48/49；带 `.git` 副本 49/49）。交付方式已在 §6 步骤 0-B 固定为“clone + 归档覆盖”。若只给归档，请在报告里注明跳过该用例并单独说明理由。
10. **`lib/` 仍是提交进 git 的产物**：本次已用最终源码重建（内含新逻辑，已验证），但“产物可能与源码脱节”的风险结构依旧，由 `tests/committed-artifact.spec.ts` 与 `tests/build-workspace.spec.ts` 共同约束。

---

## 6. Windows 回归方案（可直接执行）

> **本节是方案，不是已执行的记录**：以下 PowerShell 命令**未在 Windows 上运行过**（本机无 Windows）。每条都注明它对应的、在 Linux 上已实测的等价动作；执行者若发现语法/平台差异，请以“能否得到标注的期望输出”为准，不要照抄。
>
> ⚠️ 三条容易出错的地方：
> ① `git diff` **不包含未跟踪的新文件**（本工作树有 7 个新增文件），因此交付用**源码归档**而不是补丁——否则新增的 4 个测试文件与 `tools/build-utils.mjs` 根本不会到达 Windows。
> ② 类型错误的负向对照必须在**独立探针副本**里做；绝不能在交付副本上 `git checkout -- <file>` 回滚，那会把修复本身丢掉。探针副本必须整棵复制（client face 的类型检查依赖构建产物 `lib/`）。
> ③ 所有删除动作只针对**可再生的 `lib/`** 与 **`E:\pr3\probe` 探针副本**；不要删除 `src/`、`tests/`、`tools/`，也不需要 `git checkout`/`git reset`。

前提：Windows 11 原生 + PowerShell 5.1+；Node ≥ 20；一份**已安装依赖**的 Harness 源码检出（`DSH_CHECKOUT`）；隔离 profile（勿覆盖生产 `desktop`）。

```bash
# 0-A) Linux 侧：导出源码归档（含未跟踪的新文件）。归档必须写到工作区之外，
#      否则 tar 会把自己也打进去。
cd /home/dev/SourceCodeLibrary/Plugins/dsh-agent-team-presets
tar --exclude=./node_modules --exclude=./.git --exclude=./audit \
    -czf /tmp/pr3-src.tar.gz .
sha256sum /tmp/pr3-src.tar.gz
# 本侧已导出：/tmp/pr3-src.tar.gz，14,488,040 B，SHA-256 5e73ecc267bf72d62a01c121acd489c7bb9889859fc583cfff89c9c8c05da7cd
# （含 lib/ 产物与 docs/；归档自身不在包内，已验证）
```

```powershell
# 0-B) Windows 侧：先 clone（保留 git 历史），再用归档覆盖工作区。
#      WHY：`tests/committed-artifact.spec.ts` 的负向对照要 `git show v0.1.6:lib/index.js`，
#      纯归档（无 .git）会让该用例失败。本侧实测：无 .git 副本 = 48/49（唯一失败即此用例）；
#      带 .git 副本 = 49/49。
New-Item -ItemType Directory E:\pr3 -Force | Out-Null
git clone https://github.com/bloodarea/dsh-agent-team-presets.git E:\pr3\src
Push-Location E:\pr3\src
git fetch --tags                                  # 负向对照需要 tag v0.1.6
Pop-Location
tar -xzf E:\pr3\pr3-src.tar.gz -C E:\pr3\src   # 覆盖为待验证工作树，.git 保留
#    自检归档完整性：以下都是新增（未跟踪）文件，用 git diff 交付不会出现
foreach ($f in @('tests\team-skill-creation.spec.ts','tests\team-skill-visibility.spec.ts',
                 'tests\build-workspace.spec.ts','tests\fixtures\npm.ts',
                 'tools\build-utils.mjs','.gitattributes')) {
  if (-not (Test-Path (Join-Path E:\pr3\src $f))) { throw "归档缺少 $f" }
}

cd E:\pr3\src
$env:DSH_CHECKOUT = "E:\dsh-checkout"      # 必须含 tsconfig.base.json 与 packages/typert/generator/lib/index.js

# 1) R3：构建链。顺序不能颠倒 —— client face 的类型检查读 lib/typert.remote-client.d.ts，
#    `lib/` 被清空后先跑 typecheck 只会得到 39 条与源码无关的 client 诊断（本侧实测）。
#    Linux 侧实测等价：删除整个 lib/ → build 99 artifacts → typecheck 0/0 → test 49/733。
Remove-Item -Recurse -Force .\lib -ErrorAction SilentlyContinue
npm install --legacy-peer-deps              # 本仓库不跟踪 package-lock.json，因此不能用 npm ci
node tools/build.mjs                        # 期望：Built 99 local artifacts
Test-Path .\lib\types\index.js              # 期望：True（由本次构建产生）
(Get-Item .\lib\index.js).LastWriteTime     # 期望：刚刚
node tools/typecheck.mjs                    # 期望：host 0 / client 0 local diagnostics
node tools/test.mjs                         # 期望：49 files / 733 passed / 1 skipped

# 2) R3 负向对照：在独立的探针副本里注入类型错误（不动交付副本）
#    必须在上一步构建“之后”整棵复制：client face 的类型检查依赖 lib/ 里生成的
#    d.ts。本侧实测：只复制 src/tools 时 client 报 39 条无关诊断；整棵副本基线 0/0，
#    注入后 host 2 local diagnostics 且 exit 1。
$probe = "E:\pr3\probe"
Remove-Item -Recurse -Force $probe -ErrorAction SilentlyContinue
robocopy . $probe /E /XD node_modules .git audit /NFL /NDL /NJH /NJS | Out-Null
cmd /c mklink /J "$probe\node_modules" "$((Get-Location).Path)\node_modules"
Add-Content "$probe\src\tool-policy.ts" "`nconst __probe: number = 'x'"
Push-Location $probe
node tools/typecheck.mjs
if ($LASTEXITCODE -eq 0) { throw 'typecheck 未捕获注入的类型错误（期望 host 2 local diagnostics）' }
Pop-Location
Remove-Item -Recurse -Force $probe          # 交付副本从未被改动

# 3) 路径与可执行依赖（Windows 语义；Linux 侧为模拟验证，非原生）
#    这一步是本方案里唯一无法用 Linux 结果替代的部分：junction 跨盘、真实 PATHEXT 只在 Windows 成立
node tools/test.mjs tests/team-skills-tools.spec.ts tests/team-skills-portability.spec.ts tests/build-workspace.spec.ts
#  期望：依赖解析走 PATHEXT、目录不算可执行；文件祖先产生 ENOTDIR；junction 镜像不修改检出

# 4) R1/R2：真实会话（隔离 profile，勿动生产 desktop）
#    先把本报告的打包产物（§1.1）复制到 Windows，例如 E:\pr3\dsh-agent-team-presets-0.1.7.tgz
#    安装前核对 SHA-256 必须为 25c0c79f…4061d2f
Get-FileHash E:\pr3\dsh-agent-team-presets-0.1.7.tgz -Algorithm SHA256
dsh plugin --profile pr3check add E:\pr3\dsh-agent-team-presets-0.1.7.tgz
#   4.1 建 Team：成员 toolMode=custom、tools=["read"]，并把一个 Team Skill 绑到该成员角色
#   4.2 召唤该成员，任务文本：
#       「用 skill 工具加载 <技能名>，从实际 SKILL.md 原样返回 CHECK_CODE；没有 skill 工具就以 NO_SKILL_TOOL 开头说明」
#       期望：成员首个 request 的 tools 含 skill，返回 CHECK_CODE（对应 Windows 报告 A→B→C 中的 C 侧）
#   4.3 对照组：把 tools 改成 ["read","skill"]，行为应完全一致（skill 不再需要显式勾选）
#   4.4 未绑定对照：让同一成员加载别人的技能名 → 期望 unknown or no longer available
#   4.5 拒绝路径：把 skillRoot 指向一个普通文件下的子路径，重启后召唤成员
#       期望：spawn_team_member 报错并给出原因；roster 行 status=failed，无 member 请求
#   4.6 队长：把一个技能绑到 captain 角色，新建会话选该 Team 后立即发问
#       期望：首个 request 已含 catalog（创建边内完成，而非稍后才出现）
```

判定要点：

- **必须**先删除 `lib/` 再构建，否则“包里有产物”不代表构建通过（这是 Windows 报告提醒①）。
- **R3 的判据不是“构建成功”**，而是“`lib/types/index.js` 由本次构建产生 + 注入类型错误时 typecheck 非零退出”。
- **R1/R2 的判据不是模型自述**，而是成员 `request/header.tools[]` 与真实 `tool/result`；建议沿用 Windows 报告里解帧 `session.v4.jsonl.zstd` 的方法取证。
- junction/跨盘用例需要把 `E:` 与 `C:` 分别用于 checkpoint 与 staging，才能覆盖真实跨卷情形（Linux 侧只验证了逻辑分支）。

---

## 7. 复现命令索引

```bash
# 完整回归（双 checkout）
DSH_CHECKOUT=/path/to/dsh-0.2.1-rc.2 node tools/test.mjs
DSH_CHECKOUT=/path/to/dsh-0.2.1-rc.2 node tools/typecheck.mjs
DSH_CHECKOUT=/path/to/dsh-0.2.1-rc.2 node tools/build.mjs
DSH_CHECKOUT=/path/to/dsh-0.2.1-rc.3 node tools/test.mjs

# 干净副本（无 lib）构建 + 测试
rsync -a --exclude node_modules --exclude lib --exclude audit ./ /tmp/atp-final-clean2/
cp -a node_modules /tmp/atp-final-clean2/
cd /tmp/atp-final-clean2 && DSH_CHECKOUT=… node tools/build.mjs && DSH_CHECKOUT=… node tools/test.mjs

# 打包与校验
npm pack --pack-destination /tmp/npm-pack-final2
sha256sum /tmp/npm-pack-final2/dsh-agent-team-presets-0.1.7.tgz   # 25c0c79f…4061d2f
```
