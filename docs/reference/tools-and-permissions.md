# Tools and permissions

Root sessions expose six tools that read and maintain Team presets and Team Skills, and every captain and member role carries its own tool policy. This page records that tool surface, the two policy modes, the guarantee a member's first turn depends on, and where the allow-list stops.

[中文](<tools-and-permissions.zh.md>) · [Documentation index](../index.md) · [README](../../README.md)

## Agent-facing tools

Root sessions register tools allowing agents to inspect and update presets and skills programmatically, subject to tool policies.

### Team preset tools

- **`get_team_preset`**: Reads the active or specified Team preset, returning its purpose, role descriptions, prompts, roster, and settings revision.
- **`update_team_preset`**: Updates team/captain descriptions and member prompts/descriptions using compare-and-set revision checks. Requires direct human turn and Host approval. Returns `team-busy` if affected members are currently active.

### Team Skill tools

- **`list_team_skills`**: Lists installed private Team Skills, origins, dependencies, and role assignment status.
- **`assign_team_skill`**: Assigns one Team Skill to a role in a Team (isolated to that agent scope).
- **`unassign_team_skill`**: Removes a Team Skill assignment from a role.
- **`remove_team_skill`**: Deletes a Team Skill from the library, enforcing blocker checks.

Both preset tools act on the Team record in the active profile's configuration rather than on the shipped catalog: an edit through `update_team_preset` changes the Team this profile runs and never rewrites a built-in preset. The Skill tools act on the private library described in [Team Skills](../guide/team-skills.md), which is also where their assignment rules come from.

## Policy modes

A captain and each member carry a policy of their own. There are two modes:

| Mode | What it permits |
|---|---|
| **Default: all tools** | No allow-list restriction beyond deployment permissions and role rules. |
| **Custom allowed tools** | Only the selected tool names. Coordination tools (`send_message`, `list_agents`, `team_task_*`) must be explicitly allowed if needed. |

Captain and member policies are independent: granting a tool to the captain does not grant it to members.

**The `skill` tool is always admitted, and is not offered as a choice.** It publishes the catalog and loads instruction text rather than granting a capability, and the Host withholds that whole catalog from an Agent that cannot see it. A custom allow-list therefore cannot remove it, and the settings page does not list it: a checkbox for it would be a control that can never do anything. Documents written by an earlier version that still name it keep loading unchanged — the entry is admitted implicitly, never reported as unavailable, and never needs removing.

## Custom allow-lists on PTC sessions

**Custom tool allow-lists work on PTC by giving that Session its own native surface.** The Host cannot restore an inherited executor after a release, so the plugin never releases one: on a PTC preset it mounts the Harness native tool executor on the Session's Agent scope and leaves the deployment executor alone. The trade-off is deliberate — that Session stops using `run_code` for the rest of its life, while other Sessions and the all-tools mode keep PTC. If mounting fails, or the surface still exposes the PTC transport afterwards, the application is refused and nothing is left behind, because no executor was ever released.

## What a member's first turn guarantees

An assigned Team Skill is only useful if the member can load it on the turn that asks for it, so the plugin makes the registration part of member creation rather than a background step:

- **Members**: the creation edge awaits that Agent's own registration before it completes. A role that holds assigned Team Skills but whose deployment cannot publish them — no skill service composed, the private library unreadable, or the registration refused — is **refused at creation** with the reason, instead of starting with an empty catalog while every surface says the skill is bound. Roles with no assignment keep working on deployments that compose no skill service.
- **The captain**: the same registration is performed inside the Session's creation edge, after the Team application it depends on. A captain whose assignment cannot be published does not refuse the Team — a Session that is already running must not lose its capability policy — and the failure is reported at the Agent identity.
- **Unreadable library is not an empty library.** When the private store cannot be opened the plugin cannot even enumerate a role's bindings, so it refuses member creation rather than reading the unknown as "no assignment". Repair the library path (or start again) to recover.

## Security boundaries

- The allow-list is **not a filesystem, process, or network sandbox**. Allowed tools (such as bash) retain their native capabilities. Maintain appropriate Harness sandbox and approval policies.
- Custom policy mode disallows general-purpose `run_code` and ordinary `subagent` / `workflow` delegation to preserve strict policy contracts. Use preset Team members for delegation.
- Managed members require their durable configuration on resume. Missing or corrupted records are refused loud rather than falling back to unrestricted defaults.

## Related

- [Install](../guide/install.md) — the requirements a policy relies on, including the PTC constraint above
- [Using Teams](../guide/using-teams.md) — where the captain's and each member's policy is edited
- [Team Skills](../guide/team-skills.md) — the private library these tools read and write
- [Troubleshooting](troubleshooting.md) — when a policy refusal or a missing dependency blocks the work
- [Documentation index](../index.md) — every document by topic
