# Troubleshooting

This page collects the failure modes this plugin documents: an overridden configuration write, the troubleshooting skill it registers on the global layer, the issues that come up most often, and the one environment that has not been verified yet.

[中文](<troubleshooting.zh.md>) · [Documentation index](../index.md) · [README](../../README.md)

## Configuration writes are overridden

If saving or selecting a Team reports:

```text
Configuration for "agent-team-presets" is overridden by a home patch or command-line overlay
```

Check profile patches, `$DSH_HOME/cordis.patch.yml`, and `--patch` overlays for duplicate hand-written `agent-team-presets` declarations. Remove duplicate declarations while preserving Host-managed settings rows.

The usual cause is a second loader declaration added by hand. The package already supplies its own bundle patch, so install the bundle and do not declare it again: duplicate hand-written declarations in profile patches can prevent settings from saving.

## Built-in troubleshooting skill

The plugin registers `agent-team-presets-troubleshooting` on the global skill layer as soon as the profile composes the skill service. It is a host-level skill, not part of the private Team Skill library and not isolated per Agent: every Session can load it with the `skill` tool. Use it when a Team does not apply, a member cannot be summoned, a tool is refused, a member's model route is questioned, a Team Skill is invisible, or an install/upgrade behaves unexpectedly.

The guide also states the evidence order: `configuredRoute`, `model/selection`, `request/header.config`, and the member snapshot `route` outrank `subagent/descriptor` or roster display values.

## Common issues

| Symptom | What to check |
|---|---|
| Settings page is absent or plugin pending | Confirm profile type, peer dependencies, subagent backends (default `spawn`/`fork`), and client services. |
| Skill deletion button is disabled | The skill is protected: inspect the blocker list in the modal (bound roles or dependencies must be unassigned first). |
| Skill assignment refused (`dependency-missing`) | A required executable declared by the skill is absent from host `PATH`. Note that declared MCP servers are reported for visibility and do not block assignment; ensure MCP servers are configured in your profile. |
| Member creation refused | Check storage domain availability, subagent execution backend (`spawn`/`fork`), model quota, and concurrency limits. |
| Model route display mismatch | `list_agents.model` can return an inherited or fallback model even when the member actually runs on its configured route. Verify actual routing via `spawn_team_member`'s `configuredRoute`, `model/selection`, the first `request/header.config`, and the member snapshot `route`. |
| A selected member's route is unusable | The Host refuses the application and keeps the Session's previous composition and model instead of falling back to the captain. Correct that member's provider/model (and reasoning effort) in **Settings → Agent team presets**, then reselect it. The composer reports missing members but does not display a Host refusal; check the member route and the deployment's provider catalogue. |

### If the settings page never appears

Three environment facts decide whether the page can render at all, and each of them is visible before you install:

- **Host version.** The supported range is `>=0.2.2-rc.3 <0.3.0`; the plugin was verified against `0.2.2-rc.3`, and 0.2.2-rc.2 and older are refused. The plugin manager enforces `engines.dsh` in `package.json`.
- **Profile type.** Install into a Web or Desktop profile with Settings and the client services the page uses — typically `web` for the Web GUI or `desktop` for Desktop.
- **Backends.** Member creation is refused if the storage domain or the selected execution backend is unavailable; the default backend names are `spawn` and `fork`.

## Known limitation: Windows verification

The path-separator and executable-resolution fixes are exercised by unit tests that normalize separators and by `ENOTDIR` cases, but no Windows machine was available here. Junction handling across volumes, `PATHEXT` resolution against a real `PATH`, and the full native build chain still need a Windows run before the release is described as Windows-verified.

## Reporting an issue

If nothing above explains the refusal, include the exact text the Host printed, the Harness version, and the profile you installed into — those three are what make the report reproducible. Bug reports and pull requests are welcome at [GitHub Issues](https://github.com/bloodarea/dsh-agent-team-presets/issues).

## Related

- [Install](../guide/install.md) — profile, version range, and backends referenced above
- [Team Skills](../guide/team-skills.md) — the dependency and deletion rules behind `dependency-missing` and a disabled delete button
- [Tools and permissions](tools-and-permissions.md) — what a tool policy admits, and why a call can be refused
- [Using Teams](../guide/using-teams.md) — member routes and Team application
- [Documentation index](../index.md) — every document by topic
- [README](../../README.md) — overview, requirements, install and upgrade
