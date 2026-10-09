import { RUN_CODE_NAME, defineTool } from "@deepseek-ai/dsh-tools";
import { ReasoningEffortId } from "@deepseek-ai/dsh-llm";
import { PERSONA_PREFIX_SECTION } from "@deepseek-ai/dsh-system-prompt";
import z from "@deepseek-ai/schemastery";
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
* it summons members through, the tool registry its member tool joins, the
* prompt sections its captain adds, and the settings document it owns.
*/
const inject = [
	"agents",
	"agentTeams",
	"tools",
	"systemPrompt",
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
	ctx.plugin(TeamPresetsToolCatalog);
	ctx.effect(() => ctx.settings.configure({ auto: false }, ctx.fiber), "agent-team-presets: page policy");
	const reconcile = (agent) => {
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
	});
	ctx.on("loader/volatile-update", () => {
		for (const agent of ctx.agents.list()) if (isSessionRoot(agent)) reconcile(agent);
	});
	ctx.effect(() => () => {
		for (const application of applications.values()) application.dispose();
		applications.clear();
	}, "agent-team-presets: session applications");
}
//#endregion
export { Config, apply, inject, name };
