# Install and upgrade

What the plugin needs before it runs, the three supported install forms, and how to verify an install before upgrading it.

[中文](<install.zh.md>) · [Documentation index](../index.md) · [README](../../README.md)

## Requirements

- **DeepSeek Harness `>=0.2.2-rc.5 <0.3.0`.** Verified against **`0.2.2-rc.5`**; 0.2.2-rc.4 and older are refused. Each member's route is recorded through `agent.model.select()` for fresh, forked, and cold-resumed execution; the captain keeps the conversation's model selection. The plugin manager enforces `engines.dsh` from [package.json](../../package.json).
- **Custom tool allow-lists have their own contract.** What a policy admits, and what it cannot do, is described in [Tools and permissions](../reference/tools-and-permissions.md).
- **No Agent Teams bundle is required.** Members are created through the deployment's continuable subagent providers, and native messaging, task tools, and the Web roster are unaffected by this plugin.
- **A Web or Desktop profile with Settings and the required client services.** Install into the profile you actually use — typically `web` for the Web GUI or `desktop` for Desktop.
- **Durable storage and a continuable subagent backend for member execution.** Member creation is refused if the storage domain or the selected execution backend is unavailable. The default backend names are `spawn` and `fork`.

The plugin version (`0.3.5`) and the Harness version (`0.2.2-rc.5`, for example) are separate version lines.

## Install

### Option 1 — npm package (recommended; receives update prompts)

Open **Global panels → Plugins → Add plugin**, paste the line below into **Package name or address**, and click **Install**:

```text
dsh-agent-team-presets
```

Or install it from the CLI:

```sh
dsh plugin --profile <profile> add dsh-agent-team-presets
```

Replace `<profile>` with your active profile (e.g. `web` or `desktop`):

```sh
dsh plugin --profile web add dsh-agent-team-presets
```

The plugin manager compares the installed version against npm's `latest` dist-tag, so every later release is offered as an update.

### Option 2 — floating GitHub install

Tracks the repository's default branch; an update is offered when `package.json` on that branch moves to a higher version:

```sh
dsh plugin --profile <profile> add github:bloodarea/dsh-agent-team-presets
```

### Option 3 — reproducible pin (no update prompts)

```text
dsh-agent-team-presets@0.3.2
dsh plugin --profile <profile> add github:bloodarea/dsh-agent-team-presets#v0.3.2
```

A fixed version or tag reproduces exactly one release. **A `#tag` GitHub spec is only ever compared against that same tag, so the market never reports an update for it — upgrading means editing the spec by hand.** Use this form only when you need a frozen install.

### Install notes

- **Registry** selects which npm source the download comes from. **Default registry** uses pnpm's own configuration. Pick **Official npm registry** to bypass a mirror, or **Custom address** for an internal or cloud mirror.
- The field accepts package names, `name@version`, `github:owner/repo`, tarball URLs, or absolute filesystem paths.
- This package declares `dsh.bundle`, so the plugin manager automatically registers it as a profile bundle layer; do not add a loader entry by hand.
- Once installed, reinstalling the same package identity is blocked. To switch sources (e.g. from GitHub to npm), uninstall first, then install the new spec.
- GitHub and [npm](https://www.npmjs.com/package/dsh-agent-team-presets) are separate release channels, so check the version this install would fetch before switching channels:

```sh
npm view dsh-agent-team-presets version
```

- After installation, reload or restart as prompted.

## Verify and upgrade safely

After installation, follow the plugin manager's reload/restart prompts and navigate to **Settings → Agent team presets**. Verify that details display `dsh-agent-team-presets`, the version you just installed, and a running component.

- Back up profile settings, Team definitions, and Session selections before upgrading.
- When migrating from a development link, remove `@deepseek-ai/dsh-experimental-agent-team-presets` first before enabling the community package.
- Restart Harness after switching package identities, then refresh the GUI.

> **Install the bundle; do not add a second loader declaration.** The package already supplies its own [bundle patch](../../cordis.patch.yml). Duplicate hand-written declarations in profile patches can prevent settings from saving. The package's own declaration is the only one needed.

## Next

- [Using Teams](using-teams.md) — configure a Team and run it in a conversation.
- [Getting started](getting-started.md) — the illustrated walkthrough, screen by screen.
- [Documentation index](../index.md) — every document by topic.
