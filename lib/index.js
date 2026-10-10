import { RUN_CODE_NAME, defineTool } from "@deepseek-ai/dsh-tools";
import { HarnessError, ReasoningEffortId } from "@deepseek-ai/dsh-llm";
import { PERSONA_PREFIX_SECTION } from "@deepseek-ai/dsh-system-prompt";
import z from "@deepseek-ai/schemastery";
import { assembleContextFor } from "@deepseek-ai/dsh-agent";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/presets.js
/**
* Pure Team preset helpers shared by the Host runtime and the browser page.
* @module dsh-agent-team-presets/presets
*/
/**
* Resolve a slot's explicit tool policy or its legacy list-only setting.
* @param agent - the configured captain or member.
* @returns the policy shown in Settings and enforced by the runtime.
*/
function toolMode(agent) {
	return agent.toolMode ?? (agent.tools.length === 0 ? "all" : "custom");
}
/** The member name grammar the Agent Teams service accepts. */
const MEMBER_TARGET = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
/**
* Derive a teammate target from one member's display name.
*
* Teammate names are permanent, lower-kebab-case, and never reused, so a
* display name that already satisfies the grammar is kept and any other name
* is transliterated to `member-<index>`. The display name still reaches the
* captain through the roster.
* @param member - the configured member.
* @param index - zero-based position in the Team's member list.
* @param used - targets already taken in this Team; the returned target is added.
* @returns the teammate target this member is summoned under.
*/
function memberTarget(member, index, used) {
	const candidate = member.name.trim().toLowerCase();
	const base = MEMBER_TARGET.test(candidate) && candidate !== "lead" && candidate.length <= 64 ? candidate : `member-${index + 1}`;
	let target = base;
	let suffix = 2;
	while (used.has(target)) {
		target = `${base}-${suffix}`;
		suffix += 1;
	}
	used.add(target);
	return target;
}
/**
* Resolve one member by its display name or its teammate target.
*
* The resolved target travels with the member, so a caller never re-derives it
* and cannot disagree with the roster about the name it summons.
* @param team - the Team preset to search.
* @param key - the model-authored member name.
* @returns the matching member with its target, or undefined when the name is unknown.
*/
function findMember(team, key) {
	const wanted = key.trim();
	const used = /* @__PURE__ */ new Set();
	for (const [index, member] of team.members.entries()) {
		const target = memberTarget(member, index, used);
		if (target === wanted.toLowerCase() || member.name.trim() === wanted) return {
			member,
			target
		};
	}
}
/**
* List every addressable teammate target of one Team.
* @param team - the Team preset.
* @returns one entry per member, in declared order.
*/
function memberTargets(team) {
	const used = /* @__PURE__ */ new Set();
	return team.members.map((member, index) => ({
		member,
		target: memberTarget(member, index, used)
	}));
}
/**
* Locate one Team preset by identity.
* @param teams - every configured Team preset.
* @param teamId - the identity to resolve.
* @returns the matching Team, or undefined.
*/
function findTeam(teams, teamId) {
	return teamId === void 0 ? void 0 : teams.find((team) => team.id === teamId);
}
/**
* Resolve the Team a Session selected.
* @param teams - every configured Team preset.
* @param selections - every Session selection record.
* @param sessionId - the Session identity to resolve.
* @returns the selected Team, or undefined when the Session selected none.
*/
function selectedTeam(teams, selections, sessionId) {
	return findTeam(teams, selections.find((record) => record.sessionId === sessionId)?.teamId);
}
/**
* Name one Team the way its own prompts address it.
* @param team - the Team preset.
* @returns the configured name, or the Team identity when it has no name.
*/
function teamLabel(team) {
	return team.name.trim() === "" ? team.id : team.name.trim();
}
/**
* Describe the captain to itself.
* @param captain - the configured captain.
* @returns the identity line, or an empty string when the captain states nothing.
*/
function captainIdentity(captain) {
	const name = captain.name.trim();
	const description = captain.description.trim();
	const subject = name === "" ? "You are its captain" : `You are its captain "${name}"`;
	return description === "" ? name === "" ? "" : `${subject}.` : `${subject}: ${description}`;
}
/**
* Build the briefing the captain reads for the Team it leads.
*
* The text states the Team's purpose, the captain's own role, and every
* summonable target with its configured description, so the captain delegates
* by the exact target the spawn tool accepts.
* @param team - the Team preset applied to this Session.
* @returns the prompt section text, or an empty string for a Team that says nothing about itself.
*/
function captainBriefing(team) {
	const description = team.description.trim();
	const identity = captainIdentity(team.captain);
	const rows = memberTargets(team).map(({ member, target }) => {
		const memberDescription = member.description.trim();
		const label = member.name.trim();
		return `- ${target}${label === "" || label === target ? "" : ` (${label})`}${memberDescription === "" ? "" : `: ${memberDescription}`}`;
	});
	if (description === "" && identity === "" && rows.length === 0) return "";
	return [
		description === "" ? `Team preset "${teamLabel(team)}" is active for this Session.` : `Team preset "${teamLabel(team)}" is active for this Session: ${description}`,
		identity,
		rows.length === 0 ? "" : `Summon a member with spawn_team_member(member, task). The targets below are fixed; use them verbatim.

${rows.join("\n")}`
	].filter((part) => part !== "").join("\n\n");
}
/**
* Build the briefing one summoned member reads.
*
* A member never sees the captain's roster, so its own prompt states the Team
* it joined, its own role, and then the configured system prompt that defines
* how it works.
* @param team - the Team preset that owns the member.
* @param member - the configured member.
* @param target - the teammate target the captain summons it under.
* @returns the persona text for the summoned member; it always names the Team it joined.
*/
function memberBriefing(team, member, target) {
	const label = member.name.trim();
	const named = label === "" || label === target ? `"${target}"` : `"${target}" (${label})`;
	const description = team.description.trim();
	const joined = description === "" ? `You are ${named} on the Agent Team "${teamLabel(team)}".` : `You are ${named} on the Agent Team "${teamLabel(team)}": ${description}`;
	const role = member.description.trim();
	return [
		joined,
		role === "" ? "" : `Your role: ${role}`,
		member.systemPrompt.trim()
	].filter((part) => part !== "").join("\n\n");
}
//#endregion
//#region lib/types/application.js
/**
* Apply one Team preset to one live Session.
*
* The captain's system prompt shadows the deployment persona for that Session,
* the captain's independent tool mode scopes the Session's visible global tools,
* and the Session gains `spawn_team_member`, which applies the selected member's
* own persona, route, reasoning effort, and tool mode. The Session keeps the
* model it already selected: a captain never changes the Session's route.
* @module dsh-agent-team-presets/application
*/
/** Output schema of one `spawn_team_member` result. */
const SPAWN_VALUE_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		target: {
			type: "string",
			required: true
		},
		status: {
			type: "string",
			required: true,
			enum: ["active", "failed"]
		},
		model: { type: "string" }
	}
};
/**
* Build the child route of one configured agent slot.
* @param preset - the configured captain or member.
* @returns the child Agent options, or undefined without a configured route.
*/
function routeOptions(preset) {
	if (preset.provider === "" || preset.model === "") return void 0;
	return {
		provider: preset.provider,
		model: preset.model,
		...preset.reasoningEffort === "" ? {} : { reasoningEffort: ReasoningEffortId(preset.reasoningEffort) }
	};
}
/**
* Register the captain's tool scope on one Session.
* Invalid tool names reject application instead of granting unrestricted access.
* @param agent - the live Session agent.
* @param captain - configured policy and allow-list; custom-empty denies every global tool.
* @returns the restriction disposer, or undefined for the default-all policy.
*/
function restrictCaptainTools(agent, captain) {
	if (toolMode(captain) === "all") return void 0;
	return agent.ctx.tools.restrict({ allow: [...captain.tools] });
}
/**
* Register the model-facing member tool on one Session.
* @param ctx - the plugin context providing `agentTeams`.
* @param agent - the live Session agent that owns the tool.
* @param team - the applied Team preset.
* @param providers - continuable-subagent providers to spawn through.
* @returns the tool registration disposer.
*/
function registerMemberTool(ctx, agent, team, providers) {
	const targets = memberTargets(team);
	const summary = targets.map(({ member, target }) => member.description.trim() === "" ? target : `${target} (${member.description.trim()})`).join("; ");
	return agent.ctx.tools.register(defineTool({
		name: "spawn_team_member",
		description: `Create one teammate from the active Team preset, applying that member's own system prompt, model, reasoning effort, and tool scope. Available members: ${summary.length === 0 ? "(none)" : summary}.`,
		parameters: {
			member: {
				type: "string",
				required: true,
				description: "Member target from the active Team preset roster."
			},
			task: {
				type: "string",
				required: true,
				description: "Complete initial task for the member, including every fact it needs."
			},
			description: {
				type: "string",
				description: "Short description of the delegated responsibility; defaults to the member preset description."
			},
			context: {
				type: "string",
				enum: ["fresh", "fork"],
				description: "fresh starts without your history; fork inherits your completed turns. Defaults to fresh."
			}
		},
		output: {
			schema: SPAWN_VALUE_SCHEMA,
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value)
			}]
		},
		async execute(args, exec) {
			const caller = exec.agent;
			if (caller === void 0) throw new Error("spawn_team_member requires a calling Agent");
			const resolved = findMember(team, args.member);
			if (resolved === void 0) throw new Error(`unknown Team member "${args.member}"; available members: ${targets.map((entry) => entry.target).join(", ") || "(none)"}`);
			const { member, target } = resolved;
			const context = args.context ?? "fresh";
			const task = [{
				type: "text",
				text: args.task
			}];
			const route = routeOptions(member);
			const briefing = memberBriefing(team, member, target);
			const result = await ctx.agentTeams.spawnTeammate(caller, {
				name: target,
				description: args.description ?? (member.description.trim() === "" ? member.name.trim() || target : member.description.trim()),
				prompt: task,
				context,
				provider: context === "fork" ? providers.fork : providers.fresh,
				...route === void 0 ? {} : { agentOptions: route },
				persona: briefing,
				...toolMode(member) === "all" ? {} : { toolFilter: { allow: [...member.tools] } },
				signal: exec.signal
			});
			return {
				target: result.member.name,
				status: result.member.status === "failed" ? "failed" : "active",
				...result.member.model === void 0 ? {} : { model: result.member.model }
			};
		}
	}));
}
/**
* Apply one Team preset to one live Session.
*
* A later call for the same Session replaces the previous application.
* @param ctx - the plugin context providing the Team and Session services.
* @param agent - the live Session agent taking the Team.
* @param team - the Team preset to apply.
* @param providers - continuable-subagent providers the member tool spawns through.
* @returns the applied Team, whose `dispose` releases every registration.
*/
function applyTeamToAgent(ctx, agent, team, providers) {
	const disposers = [];
	const register = (disposer) => {
		if (disposer !== void 0) disposers.push(disposer);
	};
	try {
		const { captain } = team;
		if (captain.systemPrompt.trim() !== "") register(agent.ctx.systemPrompt.section({
			name: PERSONA_PREFIX_SECTION,
			order: agent.ctx.systemPrompt.getSectionOrder("DEPLOYMENT_PERSONA_PREFIX"),
			text: captain.systemPrompt
		}));
		const briefing = captainBriefing(team);
		if (briefing !== "") register(agent.ctx.systemPrompt.section({
			name: "agent-team-presets:briefing",
			order: agent.ctx.systemPrompt.getSectionOrder("TEAM_POLICY"),
			text: briefing
		}));
		register(restrictCaptainTools(agent, captain));
		register(registerMemberTool(ctx, agent, team, providers));
	} catch (error) {
		for (const dispose of disposers.reverse()) dispose();
		throw error;
	}
	return {
		teamId: team.id,
		fingerprint: JSON.stringify(team),
		dispose() {
			for (const dispose of disposers.reverse()) dispose();
		}
	};
}
//#endregion
//#region lib/types/config.js
/**
* Live Host configuration of the Agent Team presets plugin.
*
* Both fields are volatile, so a Settings write commits into the running
* references without remounting the plugin and emits `loader/volatile-update`
* to this fiber's context.
* @module dsh-agent-team-presets/config
*/
/** Fields every Team slot stores, whether it is the captain or one member. */
const teamSlotFields = {
	name: z.string().default(""),
	color: z.string().default(""),
	description: z.string().default(""),
	toolMode: z.union(["all", "custom"]),
	tools: z.array(z.string()).default([]),
	systemPrompt: z.string().default("")
};
/** The captain leads the Session, so it stores no route of its own. */
const captainSchema = z.object(teamSlotFields);
/** A member stores the route it runs on. */
const memberSchema = z.object({
	...teamSlotFields,
	provider: z.string().default(""),
	model: z.string().default(""),
	reasoningEffort: z.string().default("")
});
const teamSchema = z.object({
	id: z.string().required(),
	name: z.string().default(""),
	description: z.string().default(""),
	captain: captainSchema,
	members: z.array(memberSchema).default([])
});
const selectionSchema = z.object({
	sessionId: z.string().required(),
	teamId: z.string().required()
});
/** Captain members that named a route before the Session owned the model. */
const LEGACY_CAPTAIN_ROUTE_KEYS = [
	"provider",
	"model",
	"reasoningEffort"
];
/**
* Whether one loaded captain still carries a route of its own.
*
* Schemastery merges members its schema does not declare, so a Team stored
* before captains stopped owning a route still arrives with these keys.
* @param captain - one loaded captain.
* @returns whether any former route member survived loading.
*/
function hasLegacyCaptainRoute(captain) {
	return LEGACY_CAPTAIN_ROUTE_KEYS.some((key) => key in captain);
}
/**
* Rebuild one Team with every captain reduced to the fields a captain owns.
* @param team - one loaded Team preset.
* @returns the Team whose captain carries no route, or the input when it had none.
*/
function withoutCaptainRoute(team) {
	if (!hasLegacyCaptainRoute(team.captain)) return team;
	const { name, color, description, tools, systemPrompt } = team.captain;
	const captain = {
		name,
		color,
		description,
		toolMode: toolMode(team.captain),
		tools: [...tools],
		systemPrompt
	};
	return {
		...team,
		captain
	};
}
/**
* Reduce every Team of one configuration to captains without a route.
* @param teams - every loaded Team preset.
* @returns the same Teams, with a rebuilt captain wherever a route was stored.
*/
function withoutCaptainRoutes(teams) {
	return teams.map(withoutCaptainRoute);
}
/** Runtime schema of {@link Config}. */
const Config = z.object({
	teams: z.array(teamSchema).default([]).volatile(),
	selections: z.array(selectionSchema).default([]).volatile(),
	freshProvider: z.string().default("spawn"),
	forkProvider: z.string().default("fork")
});
/** Refusal text for a call that names no editable field at all. */
const NO_FIELDS = "no editable field was supplied; pass team_description, captain_description, captain_system_prompt, or members";
/**
* Whether one edit supplies any editable field.
* @param edit - the requested edit.
* @returns whether the caller named at least one field or member entry.
*/
function suppliesField(edit) {
	return edit.description !== void 0 || edit.captainDescription !== void 0 || edit.captainSystemPrompt !== void 0 || (edit.members?.length ?? 0) > 0;
}
/**
* Apply one field edit to one Team preset.
*
* A member entry resolves exactly the way `spawn_team_member` resolves its
* `member` argument, so the name that summons a member is the name that edits
* it. Supplying a value the preset already holds is not a change: the path is
* left out of `changed`, and a call whose every value already matched returns
* an unchanged preset so the caller can skip the write.
* @param team - the stored preset to edit.
* @param edit - the fields to replace.
* @returns the next preset with the field paths it changed, or the refusal reason.
*/
function editTeamPreset(team, edit) {
	if (!suppliesField(edit)) return {
		ok: false,
		message: NO_FIELDS
	};
	const changed = [];
	let description = team.description;
	if (edit.description !== void 0 && edit.description !== description) {
		description = edit.description;
		changed.push("team.description");
	}
	const captain = { ...team.captain };
	if (edit.captainDescription !== void 0 && edit.captainDescription !== captain.description) {
		captain.description = edit.captainDescription;
		changed.push("captain.description");
	}
	if (edit.captainSystemPrompt !== void 0 && edit.captainSystemPrompt !== captain.systemPrompt) {
		captain.systemPrompt = edit.captainSystemPrompt;
		changed.push("captain.systemPrompt");
	}
	const members = team.members.map((member) => ({ ...member }));
	const roster = memberTargets({
		...team,
		members
	});
	for (const entry of edit.members ?? []) {
		const wanted = entry.member.trim();
		const at = roster.findIndex((row) => row.target === wanted.toLowerCase() || row.member.name.trim() === wanted);
		const row = roster[at];
		if (row === void 0) {
			const targets = roster.map((candidate) => candidate.target).join(", ");
			return {
				ok: false,
				message: `unknown Team member "${entry.member}"; available members: ${targets === "" ? "(none)" : targets}`
			};
		}
		const current = members[at] ?? row.member;
		const updated = { ...current };
		if (entry.description !== void 0) {
			if (entry.description.length > 200) return {
				ok: false,
				message: `member "${row.target}" description is ${String(entry.description.length)} characters; the teammate roster accepts at most ${String(200)}`
			};
			if (entry.description !== updated.description) {
				updated.description = entry.description;
				changed.push(`member:${row.target}.description`);
			}
		}
		if (entry.systemPrompt !== void 0 && entry.systemPrompt !== updated.systemPrompt) {
			updated.systemPrompt = entry.systemPrompt;
			changed.push(`member:${row.target}.systemPrompt`);
		}
		if (updated.description !== current.description || updated.systemPrompt !== current.systemPrompt) members[at] = updated;
	}
	return {
		ok: true,
		team: {
			...team,
			description,
			captain,
			members
		},
		changed
	};
}
/**
* The exact `{{name}}` group grammar `@deepseek-ai/dsh-system-prompt` interpolates.
* A `{{` without this shape is literal prose unless a later `}}` makes it malformed.
*/
const VARIABLE_GROUP = /^\{\{([^{}]*)\}\}/;
/** The exact variable-name grammar the prompt registry accepts. */
const VARIABLE_NAME = /^[a-z][a-z0-9_]*$/;
/**
* Report the first interpolation failure one candidate prompt text would cause.
*
* A Team prompt is registered as an interpolated prompt section (the captain's
* as the Session persona prefix, a member's as that teammate's persona), so a
* group that cannot resolve does not degrade the prompt — it fails the next
* request outright. A stored prompt is never revalidated before that request,
* which is why a preset write refuses one instead of persisting it while a
* Session is running. The scan mirrors the registry's own so the two agree.
* @param text - the candidate captain or member standing prompt.
* @param variables - the variables one assembly resolved for the calling Agent.
* @returns the failure text, or undefined when the text interpolates cleanly.
*/
function promptTemplateFailure(text, variables) {
	let last = 0;
	for (let open = text.indexOf("{{"); open >= 0; open = text.indexOf("{{", last)) {
		const group = VARIABLE_GROUP.exec(text.slice(open));
		if (group === null) {
			if (text.indexOf("}}", open + 2) >= 0) return `malformed prompt variable reference at "${text.slice(open, open + 16)}…": references are complete simple {{name}} groups`;
			last = open + 2;
			continue;
		}
		const name = group[1] ?? "";
		if (!VARIABLE_NAME.test(name)) return `malformed prompt variable reference "{{${name}}}": variable names match ${String(VARIABLE_NAME)}`;
		if (!Object.hasOwn(variables, name)) {
			const known = Object.keys(variables);
			return `unknown prompt variable "{{${name}}}"; registered variables: ${known.length > 0 ? known.join(", ") : "(none)"}`;
		}
		if (variables[name] === void 0) return `prompt variable "{{${name}}}" has no value for this Session`;
		last = open + group[0].length;
	}
}
//#endregion
//#region lib/types/preset-tools.js
/**
* Model-facing Team preset tools for the captain of a Session.
*
* `get_team_preset` reads the preset this Session runs and the exact revision
* the settings document is at; `update_team_preset` replaces the descriptions
* and standing prompts it names. Both register in one Session-root Agent scope,
* so a teammate never sees them. A preset is shared by every Session that
* selected it, so a teammate report or an automatic continuation must not
* rewrite it, and a write waits for the run to end rather than changing the
* definition under executing members.
* @module dsh-agent-team-presets/preset-tools
*/
const GET_VALUE_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		status: {
			type: "string",
			required: true,
			enum: [
				"ready",
				"no-selection",
				"unknown-team",
				"unavailable"
			]
		},
		revision: { type: "integer" },
		selectedTeamId: { type: "string" },
		teams: {
			type: "array",
			required: true,
			items: {
				type: "object",
				additionalProperties: false,
				properties: {
					id: {
						type: "string",
						required: true
					},
					name: {
						type: "string",
						required: true
					},
					description: {
						type: "string",
						required: true
					},
					members: {
						type: "array",
						required: true,
						items: { type: "string" }
					}
				}
			}
		},
		team: {
			type: "object",
			additionalProperties: false,
			properties: {
				id: {
					type: "string",
					required: true
				},
				name: {
					type: "string",
					required: true
				},
				description: {
					type: "string",
					required: true
				},
				captainName: {
					type: "string",
					required: true
				},
				captainDescription: {
					type: "string",
					required: true
				},
				captainSystemPrompt: {
					type: "string",
					required: true
				},
				members: {
					type: "array",
					required: true,
					items: {
						type: "object",
						additionalProperties: false,
						properties: {
							member: {
								type: "string",
								required: true
							},
							name: {
								type: "string",
								required: true
							},
							description: {
								type: "string",
								required: true
							},
							systemPrompt: {
								type: "string",
								required: true
							}
						}
					}
				}
			}
		},
		executingMembers: { type: "integer" },
		message: {
			type: "string",
			required: true
		}
	}
};
const UPDATE_VALUE_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		status: {
			type: "string",
			required: true,
			enum: [
				"updated",
				"unchanged",
				"team-busy",
				"no-selection",
				"unknown-team",
				"unavailable"
			]
		},
		revision: { type: "integer" },
		teamId: { type: "string" },
		changed: {
			type: "array",
			required: true,
			items: { type: "string" }
		},
		message: {
			type: "string",
			required: true
		}
	}
};
/** One editable member entry in the update tool's arguments. */
const MEMBER_EDIT_PARAMETER = {
	type: "object",
	additionalProperties: false,
	properties: {
		member: {
			type: "string",
			required: true,
			description: "Member name or teammate target from the roster get_team_preset reports."
		},
		description: {
			type: "string",
			description: "Replacement role description, at most 200 characters. Omit to keep the stored one."
		},
		system_prompt: {
			type: "string",
			description: "Replacement standing system prompt for this member. Omit to keep the stored one."
		}
	}
};
/**
* Read the revision the settings document stands at.
* @param ctx - host context providing the settings forms.
* @param namespace - this plugin's settings entry id.
* @returns the entry's current revision, or undefined when it has no configurable entry.
*/
function currentRevision(ctx, namespace) {
	return ctx.settings.describe().find((row) => row.ns === namespace)?.revision;
}
/** One Team summary the read tool returns. */
function teamSummary(team) {
	return {
		id: team.id,
		name: team.name,
		description: team.description,
		members: memberTargets(team).map((row) => row.target)
	};
}
/** One Team with every editable field. */
function teamDetail(team) {
	return {
		id: team.id,
		name: team.name,
		description: team.description,
		captainName: team.captain.name,
		captainDescription: team.captain.description,
		captainSystemPrompt: team.captain.systemPrompt,
		members: memberTargets(team).map(({ member, target }) => ({
			member: target,
			name: member.name,
			description: member.description,
			systemPrompt: member.systemPrompt
		}))
	};
}
/**
* Resolve one Team by identity or configured name.
* @param teams - every configured Team preset.
* @param key - Team identity, or its configured name.
* @returns the matching Team, or undefined.
*/
function teamByName(teams, key) {
	const wanted = key.trim();
	return teams.find((team) => team.id === wanted || team.name.trim() === wanted);
}
/**
* Whether the open turn of one Session-root Agent carries host-attested human input.
*
* An omitted `followup()` / `steer()` source resolves to `user`, so a non-human
* producer supplies its own kind and cannot inherit this authority.
* @param agent - the exact live calling Agent.
* @param openTurnStartSeq - first sequence of the caller's open turn.
* @returns whether a human `user/message` was accepted inside that turn.
*/
function hasDirectHumanInput(agent, openTurnStartSeq) {
	const events = agent.session.snapshotEvents();
	for (let seq = openTurnStartSeq + 1; seq < events.length; seq += 1) {
		const event = events[seq];
		if (event?.type === "user/message" && event.data.source.kind === "user") return true;
	}
	return false;
}
/**
* Require the exact live Session captain behind one tool call.
*
* The tools install into an Agent scope, so this only re-checks what scoped
* discovery already guarantees: the caller is a top-level Session agent, not a
* teammate, and it is still the registered Agent the call came from.
* @param ctx - host context carrying the live agent registry.
* @param exec - tool execution metadata supplied by the registry.
* @param tool - tool name for the failure text.
* @returns the authenticated captain.
* @throws when the caller is a teammate, absent, or a stale Agent identity.
*/
function callingCaptain(ctx, exec, tool) {
	const agent = exec.agent;
	if (agent === void 0) throw new HarnessError(`${tool} requires a calling Agent`, "TEAM_PRESET_TOOL_AGENT_REQUIRED");
	if (agent.session.header.origin === "subagent") throw new HarnessError(`${tool} is available to the Session captain only, not to a teammate`, "TEAM_PRESET_TOOL_CAPTAIN_ONLY");
	if (ctx.agents.get(agent.id) !== agent) throw new HarnessError(`${tool} requires the live calling Agent`, "TEAM_PRESET_TOOL_STALE_AGENT");
	return agent;
}
/**
* Require a turn the user started before one preset write.
* @param ctx - host context carrying the session projections.
* @param agent - the authenticated captain.
* @param tool - tool name for the failure text.
* @throws when no turn is open, or the open turn carries no host-attested human input.
*/
function requireUserRequest(ctx, agent, tool) {
	const boundary = ctx.sessionProjections.stateOf(agent.session, "turnBoundary");
	if (boundary === void 0 || boundary.openTurnStartSeq === null) throw new HarnessError(`${tool} must be called inside an open model turn`, "TEAM_PRESET_TOOL_NO_TURN");
	if (!hasDirectHumanInput(agent, boundary.openTurnStartSeq)) throw new HarnessError(`${tool} rewrites the stored Team preset, which every Session that selected it shares, so it needs a turn the user started. Ask the user to request the change in their own message; do not edit the preset from a teammate report, a tool result, or an automatic continuation.`, "TEAM_PRESET_TOOL_AUTHORITY_REQUIRED");
}
/**
* Count the members currently executing one Team in any Session that selected it.
*
* A Team preset is the playbook a Session runs on and is shared by every
* Session that selected it, so "the Team is executing" is a property of the
* preset, not of the caller: another Session's live run blocks this write too.
* @param ctx - host context carrying the live agent registry and Team service.
* @param config - live plugin configuration carrying the Teams and their selections.
* @param teamId - identity of the Team being written.
* @returns how many teammates are running or provisioning under that Team.
*/
function executingMembers(ctx, config, teamId) {
	let executing = 0;
	for (const root of ctx.agents.roots()) {
		if (selectedTeam(config.teams.get(), config.selections.get(), root.session.id)?.id !== teamId) continue;
		if (ctx.agentTeams.tryMembership(root) === void 0) continue;
		for (const member of ctx.agentTeams.listMembers(root)) {
			if (member.role !== "teammate") continue;
			if (member.status === "running" || member.status === "provisioning") executing += 1;
		}
	}
	return executing;
}
/**
* Resolve the Team one call targets: the named Team, or the one this Session selected.
* @param teams - every configured Team preset.
* @param selection - the selected Team, when the Session selected one.
* @param requested - Team identity or name the caller named, when it named one.
* @returns the resolved Team, with the failure status when it could not be resolved.
*/
function resolveTarget(teams, selection, requested) {
	if (requested === void 0) {
		if (selection === void 0) return {
			ok: false,
			status: "no-selection",
			message: `This Session selected no Team, so no Team is implied. Ask the user which Team to change, or have them pick one with the composer Team control, then name it here. Configured Teams: ${describeTeams(teams)}`
		};
		return {
			ok: true,
			team: selection
		};
	}
	const team = teamByName(teams, requested);
	if (team === void 0) return {
		ok: false,
		status: "unknown-team",
		message: `no configured Team matches "${requested}". Configured Teams: ${describeTeams(teams)}`
	};
	return {
		ok: true,
		team
	};
}
/**
* Render the configured Teams for one failure message.
* @param teams - every configured Team preset.
* @returns one `id (name)` entry per Team, or a phrase when none is configured.
*/
function describeTeams(teams) {
	if (teams.length === 0) return "(none configured)";
	return teams.map((team) => team.name.trim() === "" ? team.id : `${team.id} (${team.name.trim()})`).join(", ");
}
/** Extract one model-facing reason from a refused settings write. */
function reasonOf(error) {
	return error instanceof Error ? error.message : String(error);
}
/** Model-facing report of what one applied write does and does not reach. */
function applyReport(changed) {
	return `Replaced ${changed.join(", ")}. The captain of every Session that selected this Team reads the updated preset from its next model step on; a member spawned after this change uses it; a teammate that is already provisioned keeps the prompt it was spawned with.`;
}
/**
* Register the Team preset tools in one Session-root Agent scope.
* @param ctx - host context providing settings and the live agent registry.
* @param agent - the exact Session-root Agent that owns the tools.
* @param config - live plugin configuration carrying the Teams and their selections.
* @param namespace - this plugin's settings entry id.
* @returns the disposer that removes both tools.
*/
function registerPresetTools(ctx, agent, config, namespace) {
	const jsonOutput = (schema) => ({
		schema,
		render: (_args, value) => [{
			type: "text",
			text: JSON.stringify(value)
		}]
	});
	const disposers = [agent.ctx.tools.register(defineTool({
		name: "get_team_preset",
		description: "Read the Agent Team preset for this Session with the exact settings revision and every editable field. Call it before update_team_preset. When this Session selected no Team, the result says so and lists the configured Teams.",
		parameters: { team_id: {
			type: "string",
			description: "Team identity or name to read; omit to read the Team this Session selected."
		} },
		output: jsonOutput(GET_VALUE_SCHEMA),
		execute(args, exec) {
			const captain = callingCaptain(ctx, exec, "get_team_preset");
			const teams = config.teams.get();
			const selection = selectedTeam(teams, config.selections.get(), captain.session.id);
			const revision = currentRevision(ctx, namespace);
			const summaries = teams.map(teamSummary);
			if (revision === void 0) return Promise.resolve({
				status: "unavailable",
				teams: summaries,
				...selection === void 0 ? {} : { selectedTeamId: selection.id },
				message: `"${namespace}" has no configurable settings entry, so no Team preset can be edited in this deployment.`
			});
			const resolved = resolveTarget(teams, selection, args.team_id);
			if (!resolved.ok) return Promise.resolve({
				status: resolved.status,
				revision,
				teams: summaries,
				...selection === void 0 ? {} : { selectedTeamId: selection.id },
				message: resolved.message
			});
			const executing = executingMembers(ctx, config, resolved.team.id);
			return Promise.resolve({
				status: "ready",
				revision,
				teams: summaries,
				...selection === void 0 ? {} : { selectedTeamId: selection.id },
				team: teamDetail(resolved.team),
				executingMembers: executing,
				message: `${executing > 0 ? `This Team is executing right now (${String(executing)} member(s) running or provisioning), so update_team_preset will refuse this preset until the run ends or those members are interrupted. ` : ""}Editing an existing Team preset is a settings write fenced by revision ${String(revision)}. Pass that revision to update_team_preset. Only descriptions and standing prompts change here: names, member routes, and tool policies stay as configured.`
			});
		}
	})), agent.ctx.tools.register(defineTool({
		name: "update_team_preset",
		description: "Replace the description or standing prompt of a Team preset, its captain, or one of its members, and persist it. Use it only when the user explicitly asks to adjust the Team after seeing how it worked. The Team preset is shared by every Session that selected it, and the write is refused while the Team is executing. Get the revision from get_team_preset first. This never renames anyone and never changes models or tool policies.",
		parameters: {
			revision: {
				type: "integer",
				required: true,
				description: "Exact settings revision returned by get_team_preset."
			},
			team_id: {
				type: "string",
				description: "Team identity or name to change; omit to change the Team this Session selected."
			},
			team_description: {
				type: "string",
				description: "Replacement Team purpose, read by the captain and by every member it summons. Omit to keep the stored one."
			},
			captain_description: {
				type: "string",
				description: "Replacement captain role description. Omit to keep the stored one."
			},
			captain_system_prompt: {
				type: "string",
				description: "Replacement captain standing system prompt, installed as the Session persona. Omit to keep the stored one."
			},
			members: {
				type: "array",
				items: MEMBER_EDIT_PARAMETER,
				description: "Member edits, each naming a member from the roster get_team_preset reports."
			}
		},
		output: jsonOutput(UPDATE_VALUE_SCHEMA),
		async execute(args, exec) {
			const captain = callingCaptain(ctx, exec, "update_team_preset");
			const teams = config.teams.get();
			const selection = selectedTeam(teams, config.selections.get(), captain.session.id);
			const revision = currentRevision(ctx, namespace);
			if (revision === void 0) return {
				status: "unavailable",
				changed: [],
				message: `"${namespace}" has no configurable settings entry, so no Team preset can be edited in this deployment.`
			};
			const resolved = resolveTarget(teams, selection, args.team_id);
			if (!resolved.ok) return {
				status: resolved.status,
				revision,
				changed: [],
				message: resolved.message
			};
			const executing = executingMembers(ctx, config, resolved.team.id);
			if (executing > 0) return {
				status: "team-busy",
				revision,
				teamId: resolved.team.id,
				changed: [],
				message: `Team "${resolved.team.name.trim() === "" ? resolved.team.id : resolved.team.name.trim()}" is executing: ${String(executing)} member(s) are running or provisioning. The preset is not written, because those teammates would keep the definition they were spawned with while the captain reads the new one. Wait for the Team to go idle, or interrupt the running members with interrupt_agent, then call update_team_preset again with revision ${String(revision)}.`
			};
			requireUserRequest(ctx, captain, "update_team_preset");
			if (args.revision !== revision) throw new HarnessError(`revision ${String(args.revision)} is stale; the Team preset document is at revision ${String(revision)}. Call get_team_preset again and retry with the revision it returns.`, "TEAM_PRESET_TOOL_STALE_REVISION");
			const suppliedPrompts = [...args.captain_system_prompt === void 0 ? [] : [args.captain_system_prompt], ...(args.members ?? []).flatMap((entry) => entry.system_prompt === void 0 ? [] : [entry.system_prompt])];
			if (suppliedPrompts.some((text) => text.includes("{{"))) {
				const assembly = await ctx.systemPrompt.assemble(assembleContextFor(captain));
				for (const text of suppliedPrompts) {
					const failure = promptTemplateFailure(text, assembly.variables);
					if (failure !== void 0) throw new HarnessError(`the Team prompt was refused: ${failure}. Write the literal text without that group, or name a registered variable.`, "TEAM_PRESET_TOOL_INVALID_PROMPT");
				}
			}
			const edit = {
				...args.team_description === void 0 ? {} : { description: args.team_description },
				...args.captain_description === void 0 ? {} : { captainDescription: args.captain_description },
				...args.captain_system_prompt === void 0 ? {} : { captainSystemPrompt: args.captain_system_prompt },
				...args.members === void 0 ? {} : { members: args.members.map((entry) => ({
					member: entry.member,
					...entry.description === void 0 ? {} : { description: entry.description },
					...entry.system_prompt === void 0 ? {} : { systemPrompt: entry.system_prompt }
				})) }
			};
			const applied = editTeamPreset(resolved.team, edit);
			if (!applied.ok) throw new HarnessError(applied.message, "TEAM_PRESET_TOOL_INVALID_EDIT");
			if (applied.changed.length === 0) return {
				status: "unchanged",
				revision,
				teamId: resolved.team.id,
				changed: [],
				message: `Every supplied value already matched the stored Team preset, so nothing was written. The document stays at revision ${String(revision)}.`
			};
			const next = teams.map((team) => team.id === resolved.team.id ? applied.team : team);
			try {
				await ctx.settings.update(namespace, { teams: next }, revision);
			} catch (error) {
				throw new HarnessError(`the Team preset write was refused: ${reasonOf(error)}. Call get_team_preset for the current revision and retry.`, "TEAM_PRESET_TOOL_WRITE_REFUSED");
			}
			const written = currentRevision(ctx, namespace);
			return {
				status: "updated",
				...written === void 0 ? {} : { revision: written },
				teamId: resolved.team.id,
				changed: [...applied.changed],
				message: applyReport(applied.changed)
			};
		}
	}))];
	return () => {
		for (const dispose of disposers.reverse()) dispose();
	};
}
//#endregion
//#region lib/types/tool-catalog.js
/**
* Host catalog of the tools a Team member's allow-list may name.
*
* `ctx.tools.restrict({ allow })` accepts only **global** tool names, so this
* service projects exactly the global view that restriction validates against:
* a name it does not list would be refused when the member is summoned.
* @module dsh-agent-team-presets/tool-catalog
*/
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
let TeamPresetsToolCatalog = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _catalog_decorators;
	return class TeamPresetsToolCatalog extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_catalog_decorators = [Remote];
			__esDecorate(this, null, _catalog_decorators, {
				kind: "method",
				name: "catalog",
				static: false,
				private: false,
				access: {
					has: (obj) => "catalog" in obj,
					get: (obj) => obj.catalog
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = ["tools", "typert"];
		/**
		* @param ctx - Host context carrying the tool registry and Typert gateway.
		*/
		constructor(ctx) {
			super(ctx, "teamPresetsToolCatalog", { namespace: "teamPresets" });
			__runInitializers(this, _instanceExtraInitializers);
		}
		/**
		* List every global tool a member allow-list may name.
		*
		* The reserved PTC mode transport is excluded: `ctx.tools.restrict()` refuses
		* it, so offering it as a checkbox would produce a selection the summon path
		* rejects.
		* @returns the tool names and model-facing descriptions, sorted by name.
		*/
		catalog() {
			return { tools: this.ctx.tools.schemas().filter((schema) => schema.name !== RUN_CODE_NAME).map((schema) => ({
				name: schema.name,
				description: schema.description
			})).sort((left, right) => left.name.localeCompare(right.name)) };
		}
	};
})();
//#endregion
//#region lib/types/index.js
/**
* Agent Team presets: configure reusable Teams in Settings, pick one per
* Session from the composer, and let its captain summon configured members.
*
* The Host half owns the live configuration, applies a selected Team to its
* Session, and registers the member tool. A captain runs on the model the
* Session already selected; only members carry a configurable route. The
* `./client` half renders the Settings page and the composer control over the
* same `agent-team-presets` settings namespace.
* @module dsh-agent-team-presets
*/
/** Cordis plugin name. */
const name = "agent-team-presets";
/** Settings entry this plugin owns and rewrites when stored Teams are stale. */
const NAMESPACE = "agent-team-presets";
/**
* Services this plugin reads: the Session agents it composes, the Team service
* it summons members through, the tool registry its member and preset tools
* join, the prompt sections its captain adds, the session projections that
* authenticate a preset write, and the settings document it owns.
*/
const inject = [
	"agents",
	"agentTeams",
	"tools",
	"systemPrompt",
	"sessionProjections",
	"settings"
];
/** Diagnostics prefix for the failures this plugin only reports. */
const LOG = "agent-team-presets";
/** Whether one Agent is a top-level Session agent this plugin composes. */
function isSessionRoot(agent) {
	return agent.session.header.origin !== "subagent";
}
/**
* Drop the captain route a Team stored before captains stopped owning one.
*
* An older document keeps `provider`, `model`, and `reasoningEffort` on every
* captain, because the settings schema preserves members it does not declare.
* The rewrite is an ordinary settings write, so the running configuration, the
* profile patch, and every open Settings page agree on what a captain owns.
* @param ctx - the plugin context providing `settings`.
* @param config - the live configuration to inspect.
* @returns once the document was rewritten, or immediately when it was already clean.
*/
async function dropStoredCaptainRoutes(ctx, config) {
	const teams = config.teams.get();
	const cleaned = withoutCaptainRoutes(teams);
	if (cleaned.every((team, index) => team === teams[index])) return;
	try {
		await ctx.settings.update(NAMESPACE, { teams: cleaned });
	} catch (error) {
		ctx.logger.warn(`${LOG}: stored captains still carry %s because the rewrite was refused: %s`, LEGACY_CAPTAIN_ROUTE_KEYS.join("/"), String(error));
	}
}
/** Apply one valid Team preset to one live Session. */
function apply(ctx, config) {
	const providers = {
		fresh: config.freshProvider,
		fork: config.forkProvider
	};
	const applications = /* @__PURE__ */ new Map();
	const presetTools = /* @__PURE__ */ new Map();
	ctx.plugin(TeamPresetsToolCatalog);
	ctx.effect(() => ctx.settings.configure({ auto: false }, ctx.fiber), "agent-team-presets: page policy");
	const reconcile = (agent) => {
		if (!presetTools.has(agent)) presetTools.set(agent, registerPresetTools(ctx, agent, config, NAMESPACE));
		const team = selectedTeam(config.teams.get(), config.selections.get(), agent.session.id);
		const current = applications.get(agent);
		if (team === void 0) {
			current?.dispose();
			applications.delete(agent);
			return;
		}
		const fingerprint = JSON.stringify(team);
		if (current !== void 0 && current.teamId === team.id && current.fingerprint === fingerprint) return;
		current?.dispose();
		applications.delete(agent);
		applications.set(agent, applyTeamToAgent(ctx, agent, team, providers));
	};
	dropStoredCaptainRoutes(ctx, config);
	for (const agent of ctx.agents.list()) if (isSessionRoot(agent)) reconcile(agent);
	ctx.on("agent/created", ({ agent }) => {
		if (isSessionRoot(agent)) reconcile(agent);
	});
	ctx.on("agent/disposed", ({ agent }) => {
		applications.get(agent)?.dispose();
		applications.delete(agent);
		presetTools.get(agent)?.();
		presetTools.delete(agent);
	});
	ctx.on("loader/volatile-update", () => {
		for (const agent of ctx.agents.list()) if (isSessionRoot(agent)) reconcile(agent);
	});
	ctx.effect(() => () => {
		for (const application of applications.values()) application.dispose();
		applications.clear();
		for (const dispose of presetTools.values()) dispose();
		presetTools.clear();
	}, "agent-team-presets: session applications");
}
//#endregion
export { Config, apply, inject, name };
