# README 标准

本文件规定 README 首页的信息架构、视觉规范、Banner、Shields.io 徽标和固定模板。双语文件规则详见 `bilingual-writing.md`；公开文档目录规则详见 `documentation-architecture.md`。

## 统一文字与视觉标准

- **单一视觉系统**：采用克制、现代、专业的技术项目气质。统一标题层级、图片宽度、徽章风格和段落节奏；默认避免无意义 Emoji、营销形容词、花哨分隔线及装饰性表格。
- **具体胜于空泛**：说明项目做什么、适用于谁、如何开始、现有限制。避免“最强”“革命性”“全面支持”等无依据表达。
- **事实分级**：实际文件和已确认行为优先；项目自述、未验证示例、计划功能与模型推断不得混写。
- **同一骨架、按需减法**：README 核心章节顺序固定。不适用的章节可省略，不能为凑齐章节制造内容。
- **入口与详情分离**：README 只提供必要摘要和导航；完整教程、API、架构、配置参考等放入 `docs/`。

## README 固定信息架构

按以下顺序组织；不另外设计多套风格。

### 1. 顶部 Banner（默认必备）

README 的第一个可见主体是一张横向项目 Banner。建议采用约 `2:1` 或其他适合 GitHub 页面展示的宽屏比例，宽度适配页面。

Banner 的任务是**用一张图让访问者理解项目是什么**，而不是单纯放大 Logo 或堆叠装饰元素。优先使用：

- 真实产品界面与关键工作流组合。
- 能准确表达项目机制的架构概念图。
- 与项目用途直接相关、具有辨识度的视觉主体。

要求：

- 视觉重点明确，避免无意义的科技背景和过度装饰。
- 不虚构尚未实现的 UI、模块、功能或运行效果。
- 少字或无字；项目名称和一句话定位可在图片下方由 README 正文呈现。
- 图片使用仓库内稳定、可访问的相对路径；英文和中文 README 使用对应语言的 `alt` 文本。
- 封面应适配窄屏，不依赖图片中的小字传递关键信息。
- 可使用同一张 Banner 服务中英文 README，除非项目确实需要本地化视觉素材。

缺少封面时：

- 先寻找仓库已有且可用的素材。
- 若没有，提出具体封面设计方案，并请求用户提供素材或授权创建。
- 未取得可用图片前，不写失效的 `src`，不把占位图当成最终成品。
- 可以先交付其余 README 草稿，并明确标注 Banner 待补。

### 2. 项目身份

Banner 后展示：

- 项目名称：使用 `<h1>`，清晰、醒目。
- 一句话定位（Tagline）：准确说明项目做什么。
- 语言切换链接：英文版链接到 `README.zh.md`，中文版链接到 `README.md`。

当前 README 使用哪种语言，项目定位就使用哪种语言；不要在同一行里并列中英文定位，也不要叠加多个口号。

### 3. Shields.io 徽标

项目身份下方放置一组精简、真实、可点击的徽标。优先使用 [Shields.io](https://shields.io/)。

徽标分为两类：

**技术栈徽标（优先展示）**

- 通常选择约 3–8 项真正构成项目技术基础的语言、框架、运行时或核心平台。
- 每个徽标尽可能链接到对应技术的官方文档或项目主页。
- 只展示实际使用的技术，不把候选技术、未来计划或仅间接相关的工具列为项目技术栈。
- 非软件项目可展示真实相关的运行环境、数据格式或技术平台，不强造“技术栈”。

**状态与生态徽标（按需展示）**

- License、Latest Release、Build / CI、Tests、Coverage、Documentation、Demo、Downloads、Contributors 等。
- 只有数据真实、来源有效且链接目标存在时才展示。
- 动态徽标应指向真实数据源；不能用静态徽标伪装实时状态。
- 不为装饰而堆积徽标，不展示没有实际意义的状态。

视觉要求：

- 同一 README 中徽标风格保持一致，优先 `flat-square` 或 `flat`。
- 徽标数量以清晰为准，避免首屏被徽标挤满。
- 不使用 `#` 作为假链接，不虚构 CI、测试覆盖率、下载量或版本状态。
- 中英文 README 使用同一组事实与链接，徽标的 `alt` 可按页面语言调整。

### 4. What Is This? / 项目简介

用一到两段说明：

- 项目是什么、属于什么类型。
- 核心用途与主要工作方式。
- 主要面向哪些用户或使用场景。
- 项目提供的主要价值。

优先让第一次访问仓库的人不阅读其他章节也能理解项目定位。避免把简介写成技术选型清单或开发历史。

### 5. Problem / 解决的问题

明确说明项目试图解决的具体痛点：

- 现有工作流程或工具在哪些地方存在困难。
- 目标用户在实际场景中遇到什么问题。
- 本项目针对这些问题采取了什么总体思路。

只描述有事实依据、与项目实际定位相关的问题，不贬低其他项目，不制造不存在的痛点。若项目没有清晰的独立痛点，可将本节与简介合并，不强行拆分。

### 6. Features / 核心功能

按用户可感知的能力列出精炼要点。

- 只写已实现功能。
- 实验性能力应明确标记为 Experimental / 实验性。
- 部分实现的能力应说明支持范围或限制。
- 计划功能、路线图和未实现能力不得混入当前功能清单。
- 功能细节、操作说明和能力矩阵放在 `docs/`，README 只保留摘要。

适合时使用少量真实截图或 GIF 辅助说明，不为每个功能强制配图。

### 7. Quick Start / 快速开始

提供从零到首次成功运行的最短可信路径，尽量让读者无需先阅读完整手册即可验证项目。

按项目实际情况包含：

- 必要环境与前置条件。
- 安装或获取方式。
- 最小必要配置。
- 一条可复制的启动命令或最小操作流程。
- 成功运行后的预期结果或验证方式。

要求：

- 命令必须与实际项目一致，参数和路径可核对。
- 未实际执行的命令不得标注为已验证。
- 不展示真实密钥、令牌或个人凭据。
- 复杂安装、完整配置和高级用法链接到 `docs/`。
- 若项目无需安装，明确说明如何获取和使用，不编造安装步骤。

### 8. Documentation / 文档导航

README 必须提供清晰的公开文档入口，优先链接到 `docs/README.md`。

根据仓库中实际存在的内容，可进一步列出：

- User Guide：安装、配置与使用。
- Developer Guide：架构、扩展与开发。
- Reference：API、接口、协议和兼容性。
- FAQ / Troubleshooting：常见问题与排障。

只链接真实存在的公开文件。README 不应链接 `docs/internal/`，也不应暗示外部用户可以访问内部文档。

### 9. 其他信息（按需）

README 可以在末尾保留少量必要入口：

- Compatibility：仅展示影响用户决策的简明兼容性摘要，完整矩阵放 `docs/`。
- Releases / Changelog：链接到真实的 Releases 或 Changelog，不复制完整版本历史。
- Contributing：链接到真实的贡献指南。
- License：准确说明实际许可证并链接 `LICENSE`；若未声明，不推断为 MIT、Apache 或其他许可，必要时明确 `No license specified` / “尚未声明许可证”。

完整 API、详细架构、完整配置表、逐文件项目结构、开发日志、实验记录和内部任务计划不应塞入 README。

## README 排版约定

- 一个主 Banner；`<h1>` 仅用于项目标题，章节使用 `##`。
- 居中只用于首页头部，正文左对齐。
- Banner、截图和徽标适配 GitHub 页面与窄屏。
- README 主要章节顺序为：Banner → 项目身份与徽标 → What Is This → Problem → Features → Quick Start → Documentation → 按需补充信息。
- `README.md` 与 `README.zh.md` 章节顺序和事实保持对应。
- 重要命令、徽标目标、图片路径和文档链接必须可核对。
- 不输出伪造徽标、无效锚点、失效图片路径或未替换的占位符。

## README 固定结构示意

以下为结构示意，所有槽位必须替换为真实信息；不适用章节可省略。

### README.md（英文主文件）

````markdown
<p align="center">
  <img src="docs/assets/readme-banner.png"
       alt="Project Name — project overview"
       width="100%">
</p>

<h1 align="center">Project Name</h1>
<p align="center">One precise sentence describing the project.</p>
<p align="center"><a href="README.zh.md">中文</a></p>

<p align="center">
  <a href="OFFICIAL_TECH_DOC">
    <img src="https://img.shields.io/badge/TECH-STACK-blue?style=flat-square"
         alt="Technology">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/OWNER/REPO?style=flat-square"
         alt="License">
  </a>
</p>

## What Is This?

A concise explanation of what the project is, who it is for, and what it does.

## Problem

Describe the concrete problem or workflow gap this project addresses.

## Features

- A verified user-facing capability.
- Another implemented capability.

## Quick Start

```bash
# Replace with a real, verified project command.
```

## Documentation

- [Documentation Index](docs/README.md)

## License

State the actual license status.
````

### README.zh.md（中文文件）

````markdown
<p align="center">
  <img src="docs/assets/readme-banner.png"
       alt="项目名称 — 项目概览"
       width="100%">
</p>

<h1 align="center">项目名称</h1>
<p align="center">用一句准确的话说明项目定位。</p>
<p align="center"><a href="README.md">English</a></p>

<p align="center">
  <a href="OFFICIAL_TECH_DOC">
    <img src="https://img.shields.io/badge/TECH-STACK-blue?style=flat-square"
         alt="技术栈">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/OWNER/REPO?style=flat-square"
         alt="许可证">
  </a>
</p>

## 这是什么？

简洁说明项目是什么、面向谁以及主要用途。

## 解决的问题

说明项目针对的具体问题或工作流程缺口。

## 核心功能

- 已核实的用户可感知能力。
- 另一项已实现能力。

## 快速开始

```bash
# 替换为真实且经过核对的项目命令。
```

## 文档

- [公开文档索引](docs/README.md)

## 许可证

根据仓库真实许可状态说明。
````
