/**
 * Host catalog of the tools a Team member's allow-list may name.
 *
 * Read globals and standing Agent preset scopes without creating Agents. The
 * editor offers their union plus fixed Team operations; application validates
 * the selected Session and strict guards cover exact-Agent registrations.
 * @module dsh-agent-team-presets/tool-catalog
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { RUN_CODE_NAME } from '@deepseek-ai/dsh-tools';
import { GET_TEAM_PRESET_DESCRIPTION, SPAWN_TEAM_MEMBER_DESCRIPTION, UPDATE_TEAM_PRESET_DESCRIPTION } from "./tool-descriptions.js";
import { IMPLICIT_TOOLS } from "./presets.js";
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
/**
 * One frame for a composition that holds no execution state.
 *
 * Written as an explicit iterator rather than an `async function*`: the frame
 * carries no awaitable work, and an async generator without an `await` trips
 * `typescript/require-await` for a function that is only asynchronous by
 * signature. The board is announced once and the stream then completes.
 * @returns one empty frame, then completion.
 */
function emptyExecution() {
    return {
        [Symbol.asyncIterator]() {
            let sent = false;
            return {
                next: () => {
                    if (sent)
                        return Promise.resolve({ done: true, value: undefined });
                    sent = true;
                    return Promise.resolve({ done: false, value: { teams: [] } });
                },
            };
        },
    };
}
/**
 * Descriptions this plugin owns for the capabilities it implements.
 *
 * Every name here is a tool this plugin registers and therefore authors, and
 * the text is the same constant its tool definition carries. A tool the registry
 * did not describe is never listed, and an upstream tool is never described from
 * here: inventing hover text for someone else's tool would put unverified claims
 * in the tip, and offering a name the registry does not expose would only
 * produce an application the summon path rejects.
 */
const OWN_TOOL_DESCRIPTIONS = {
    spawn_team_member: SPAWN_TEAM_MEMBER_DESCRIPTION,
    get_team_preset: GET_TEAM_PRESET_DESCRIPTION,
    update_team_preset: UPDATE_TEAM_PRESET_DESCRIPTION,
};
/**
 * Capabilities only the captain can exercise.
 *
 * `interrupt_agent` is enforced by the Team service, and the preset tools are
 * registered on the Session root scope only, so a member's selection can never
 * make them usable. The page marks them instead of implying they are grantable.
 */
const CAPTAIN_ONLY = new Set([
    'spawn_team_member', 'get_team_preset', 'update_team_preset', 'interrupt_agent',
]);
/**
 * The Harness names an MCP tool `mcp__<server>__<name>`, so the middle segment
 * is the server this plugin can attribute the capability to.
 */
const MCP_TOOL_NAME = /^mcp__([A-Za-z0-9_-]{1,32})__/;
/**
 * Attribute one capability to the only sources the registry can prove.
 *
 * `register()` stores a definition under its tool name with a fixed label, so a
 * tool's registering package is never recorded and native Harness tools cannot
 * be told apart from a third-party plugin's. Two attributions remain
 * deterministic: a name this plugin registers, and a Harness-generated MCP name.
 * Everything else is reported as `other` rather than guessed at, so the group
 * can split by itself once upstream records the registering source.
 * @param name - the registered tool name.
 * @returns the attribution, plus the MCP server name when there is one.
 */
function attributionOf(name) {
    if (Object.hasOwn(OWN_TOOL_DESCRIPTIONS, name))
        return { source: 'presets' };
    const mcp = MCP_TOOL_NAME.exec(name);
    if (mcp !== null)
        return { source: 'mcp', server: mcp[1] };
    return { source: 'other' };
}
let TeamPresetsToolCatalog = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _catalog_decorators;
    let _execution_decorators;
    return class TeamPresetsToolCatalog extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _catalog_decorators = [Remote];
            _execution_decorators = [Remote({ mode: 'stream' })];
            __esDecorate(this, null, _catalog_decorators, { kind: "method", name: "catalog", static: false, private: false, access: { has: obj => "catalog" in obj, get: obj => obj.catalog }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _execution_decorators, { kind: "method", name: "execution", static: false, private: false, access: { has: obj => "execution" in obj, get: obj => obj.execution }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['tools', 'typert'];
        monitor = __runInitializers(this, _instanceExtraInitializers);
        /**
         * @param ctx - Host context carrying the tool registry and Typert gateway.
         * @param config - the preset runtime's execution monitor, when it is mounted.
         */
        constructor(ctx, config = {}) {
            super(ctx, 'teamPresetsToolCatalog', { namespace: 'teamPresets' });
            this.monitor = config.monitor;
        }
        /**
         * List global, standing-preset and fixed Team capability choices.
         *
         * Two kinds of name are deliberately absent. The reserved PTC mode transport
         * is excluded because `ctx.tools.restrict()` refuses it, so offering it as a
         * checkbox would produce a selection the summon path rejects. The implicit
         * tools (`skill`) are excluded because a Team policy always admits them: they
         * are a precondition of a Team Skill assignment, not a capability an operator
         * could withhold, so a checkbox for one would be a control that cannot do
         * anything.
         * @returns the tool names and model-facing descriptions, sorted by name.
         */
        async catalog() {
            const choices = new Map();
            const add = (schemas) => {
                for (const schema of schemas) {
                    if (schema.name === RUN_CODE_NAME || IMPLICIT_TOOLS.includes(schema.name))
                        continue;
                    choices.set(schema.name, {
                        name: schema.name,
                        description: schema.description,
                        ...attributionOf(schema.name),
                    });
                }
            };
            add(this.ctx.tools.schemas());
            const presets = this.ctx.get('agentPresets');
            if (presets !== undefined) {
                for (const preset of await presets.list()) {
                    if (preset.broken !== undefined)
                        throw new Error(`Cannot read tools of preset "${preset.id}": ${preset.broken}`);
                    const lease = await presets.acquireScope(preset.id);
                    try {
                        add(this.ctx.tools.schemas(lease.key));
                    }
                    finally {
                        await lease[Symbol.asyncDispose]();
                    }
                }
            }
            // Only names this plugin can describe truthfully. A registry tool keeps the
            // description its own author wrote; anything absent stays absent rather than
            // acquiring invented hover text.
            for (const [name, description] of Object.entries(OWN_TOOL_DESCRIPTIONS)) {
                if (!choices.has(name))
                    choices.set(name, { name, description, source: 'presets' });
            }
            // Mark role-restricted capabilities wherever they came from, so the member
            // page can refuse to present them as grantable.
            for (const name of CAPTAIN_ONLY) {
                const choice = choices.get(name);
                if (choice !== undefined)
                    choices.set(name, { ...choice, captainOnly: true });
            }
            return { tools: [...choices.values()].sort((left, right) => left.name.localeCompare(right.name)) };
        }
        /**
         * Stream the execution state of every Team the Host reports.
         *
         * The settings page reads this before it promises that a saved change takes
         * effect right away: a Team executing a task adopts a save only before its
         * next task, and a state the Host cannot decide stays `unknown` rather than
         * passing for idle.
         * @param signal - cancellation owned by the Remote stream carrier.
         * @returns whole-set frames, opening with the current state.
         */
        execution(signal) {
            return this.monitor?.stream(signal) ?? emptyExecution();
        }
    };
})();
/** Remote catalog of the deployment's inherited and Team tool names. */
export default TeamPresetsToolCatalog;
