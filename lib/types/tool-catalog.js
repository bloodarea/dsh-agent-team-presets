/**
 * Host catalog of the tools a Team member's allow-list may name.
 *
 * `ctx.tools.restrict({ allow })` accepts only **global** tool names, so this
 * service projects exactly the global view that restriction validates against:
 * a name it does not list would be refused when the member is summoned.
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
         * List every global tool a member allow-list may name.
         *
         * The reserved PTC mode transport is excluded: `ctx.tools.restrict()` refuses
         * it, so offering it as a checkbox would produce a selection the summon path
         * rejects.
         * @returns the tool names and model-facing descriptions, sorted by name.
         */
        catalog() {
            const tools = this.ctx.tools.schemas()
                .filter(schema => schema.name !== RUN_CODE_NAME)
                .map(schema => ({ name: schema.name, description: schema.description }))
                .sort((left, right) => left.name.localeCompare(right.name));
            return { tools };
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
/** Remote catalog of the global tools one Team agent allow-list may name. */
export default TeamPresetsToolCatalog;
