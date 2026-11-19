# Leader Discovery Fan-out

## 适用时机

项目任务进入需求分析、工程现状探查或阶段规划时，如果存在两个或以上实质独立的调查方向，队长应并行创建孙代理。长程任务优先在初期完成这类探查，避免队长独自逐项阅读、重复整理并持续累积长上下文。

并行探查用于获得工程事实，不用于分散产品决策权。

## 拆分方式

按调查域拆分，不按目录或文件数量机械切分。常见调查域：

- **Architecture**：模块边界、调用链、扩展点、依赖关系。
- **Implementation**：目标功能所在的代码路径、现有实现和约束。
- **Testing**：现有测试、验证入口、覆盖缺口和可复现方式。
- **Platform / Integration**：运行环境、平台差异、外部接口和集成约束。
- **Documentation / Contract**：权威文档、公开契约、兼容承诺。

每个调查域只分配一个主要负责人；需要交叉核验时明确说明核验目标，避免多人重复扫描同一范围。

## 探查任务卡

```text
TYPE: SUBAGENT_TASK
MODE: DISCOVERY
TASK_ID: P-01
GOAL: <one investigation question>
SCOPE: <modules, paths, symbols or bounded domain>
INPUTS: <known facts and source locations>
LIMITS: READ_ONLY unless explicitly authorized
ACCEPTANCE: <facts and evidence required>
OUTPUT: DISCOVERY_RESULT
```

## 父代理职责

1. 先列出调查问题和调查域，确认相互独立后再创建孙代理。
2. 将已知事实、项目入口和调查范围提供给对应孙代理；不把整段会话历史转发给所有人。
3. 子代理运行期间，父代理可处理不依赖这些结果的工作，但不重复执行已委派的调查。
4. 收到结果后合并重复发现，标注事实冲突和未知项。
5. 对会影响架构、范围、安全或产品判断的关键事实进行定向复核。
6. 将产品功能、用户流程和界面歧义整理给用户裁决；将技术决策问题整理给顾问。
7. 把稳定结论沉淀到项目已有的权威文档或长程计划，避免每轮重新探查。

## 交付边界

孙代理提交可核查事实、来源位置、风险和未知项，不负责：
- 替用户决定产品行为或界面。
- 独立制定整个项目计划。
- 给其他孙代理分派任务。
- 将未经核实的推断写成确定事实。

默认只需结论和证据位置；完整扫描日志或长篇分析由父代理按需索取。
