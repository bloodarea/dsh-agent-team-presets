# Subagent card badges

Cards in **dsh-context** (Fleet view, top bar) and **dsh-better-sidebar** (Tasks page, right sidebar) can mark the subagents this plugin created with a small `Preset` tag. Neither target published such a service at the time of writing, so this plugin ships prebuilt replacement bundles for a fixed set of versions and installs them from Settings.

[中文](<integrations.zh.md>) · [Documentation index](../index.md) · [README](../../README.md)

## How the integration works

The badge is an adapter, not a dependency:

- **Opt-in by target.** Each target must expose its optional card-badge service (`contextAgentCardBadges` / `betterSidebarAgentCardBadges`, protocol version 1). This plugin registers into a service only when it appears, requires neither package, and keeps working unchanged when neither is installed.
- **Exact identity.** A tag appears only for a card whose real child Session id matches a durable member snapshot written before creation, so ordinary subagents and workflow placeholder nodes stay unmarked. The lookup reads stored records and never resumes or reads a card's Agent.
- **Layout neutral.** The tag is one inline, theme-token chip with fixed height; it adds no card row and clips inside the existing badge area.

## Install it from Settings

The replacements are offered in **Settings → Agent Team presets → Integrations**, one row per target:

| Target | Versions this build patches | What the row offers |
| --- | --- | --- |
| `dsh-context` | 0.84.0, 0.84.1, 0.85.0, 0.85.1 | Install patch / Remove patch |
| `dsh-better-sidebar` | 0.32.0, 0.32.1 | Install patch / Remove patch |

Each row reports its own state and the page never guesses: `not installed`, `version not supported`, `not patched`, `patched`, `modified by something else`. A `version not supported` row names the **installed** version and the **highest one this build patches**, in the reader's language — the only decision that state raises is which side to update. **Install patch** asks for confirmation, backs up the target's `lib/client.js`, then writes this plugin's build of the same source; **Remove patch** restores that backup and deletes it.

**No restart and no page reload.** The running server's `client-hmr` transport stat-polls every client bundle, republishes the changed one (`clientModules.rebuilt`), and the page reloads that plugin in place — the row turns `active` within about a second and the badge appears on the cards. If a row stays `patched` without going `active`, reload the page once.

### Safety rules

- A target whose bundle matches neither the published build nor this plugin's replacement is refused, because overwriting it would destroy an edit this plugin cannot reproduce.
- Each row is classified by the version that is actually installed and lists every version this build ships a replacement for. A version outside that list reports `version not supported`; supporting one is a verified rebuild, not a code rewrite (see below).
- Upgrading a patched target replaces its bundle, which silently removes the patch — the row then reports `not patched` again.

### Adopting a new upstream release

New upstream releases are adopted with:

```sh
node tools/card-patches.mjs rebuild --target <id> --version <version> --write
```

The command clones the release, applies the source patch, builds it, and refuses to publish anything unless the rebuilt bundle still registers the card service. Adding a version keeps the older ones patchable, and a shipped `assets/card-patches/catalog.json` reaches new versions without a code change.

If you would rather not use the bundled builds, the same change is available as source patches in [`contrib/agent-card-badges`](../../contrib/agent-card-badges/README.md) for applying to the matching target and rebuilding it yourself, and as upstream-ready changes for the target maintainers.

## Related

- [Getting started](./getting-started.md) — where the Integrations page sits in the walkthrough
- [Private Team Skills](team-skills.md) — the per-agent scope the tagged members run in
- [Documentation index](../index.md)
