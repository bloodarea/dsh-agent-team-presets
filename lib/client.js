window.__ModuleLoader__.load({
	id: "dsh-agent-team-presets",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
		var _a$1;
		function $constructor(name, initializer, params) {
			function init(inst, def) {
				if (!inst._zod) Object.defineProperty(inst, "_zod", {
					value: {
						def,
						constr: _,
						traits: /* @__PURE__ */ new Set()
					},
					enumerable: false
				});
				if (inst._zod.traits.has(name)) return;
				inst._zod.traits.add(name);
				initializer(inst, def);
				const proto = _.prototype;
				const keys = Object.keys(proto);
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					if (!(k in inst)) inst[k] = proto[k].bind(inst);
				}
			}
			const Parent = params?.Parent ?? Object;
			class Definition extends Parent {}
			Object.defineProperty(Definition, "name", { value: name });
			function _(def) {
				var _a;
				const inst = params?.Parent ? new Definition() : this;
				init(inst, def);
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				for (const fn of inst._zod.deferred) fn();
				return inst;
			}
			Object.defineProperty(_, "init", { value: init });
			Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
				if (params?.Parent && inst instanceof params.Parent) return true;
				return inst?._zod?.traits?.has(name);
			} });
			Object.defineProperty(_, "name", { value: name });
			return _;
		}
		var $ZodAsyncError = class extends Error {
			constructor() {
				super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
			}
		};
		var $ZodEncodeError = class extends Error {
			constructor(name) {
				super(`Encountered unidirectional transform during encode: ${name}`);
				this.name = "ZodEncodeError";
			}
		};
		(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
		const globalConfig = globalThis.__zod_globalConfig;
		function config(newConfig) {
			if (newConfig) Object.assign(globalConfig, newConfig);
			return globalConfig;
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js
		function getEnumValues(entries) {
			const numericValues = Object.values(entries).filter((v) => typeof v === "number");
			return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
		}
		function jsonStringifyReplacer(_, value) {
			if (typeof value === "bigint") return value.toString();
			return value;
		}
		function cached(getter) {
			return { get value() {
				{
					const value = getter();
					Object.defineProperty(this, "value", { value });
					return value;
				}
				throw new Error("cached value already set");
			} };
		}
		function nullish(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
		function defineLazy(object, key, getter) {
			let value = void 0;
			Object.defineProperty(object, key, {
				get() {
					if (value === EVALUATING) return;
					if (value === void 0) {
						value = EVALUATING;
						value = getter();
					}
					return value;
				},
				set(v) {
					Object.defineProperty(object, key, { value: v });
				},
				configurable: true
			});
		}
		function assignProp(target, prop, value) {
			Object.defineProperty(target, prop, {
				value,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		function mergeDefs(...defs) {
			const mergedDescriptors = {};
			for (const def of defs) Object.assign(mergedDescriptors, Object.getOwnPropertyDescriptors(def));
			return Object.defineProperties({}, mergedDescriptors);
		}
		function esc(str) {
			return JSON.stringify(str);
		}
		function slugify(input) {
			return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
		function isObject(data) {
			return typeof data === "object" && data !== null && !Array.isArray(data);
		}
		const allowsEval = /* @__PURE__*/ cached(() => {
			if (globalConfig.jitless) return false;
			if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
			try {
				new Function("");
				return true;
			} catch (_) {
				return false;
			}
		});
		function isPlainObject(o) {
			if (isObject(o) === false) return false;
			const ctor = o.constructor;
			if (ctor === void 0) return true;
			if (typeof ctor !== "function") return true;
			const prot = ctor.prototype;
			if (isObject(prot) === false) return false;
			if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
			return true;
		}
		function shallowClone(o) {
			if (isPlainObject(o)) return { ...o };
			if (Array.isArray(o)) return [...o];
			if (o instanceof Map) return new Map(o);
			if (o instanceof Set) return new Set(o);
			return o;
		}
		const propertyKeyTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"symbol"
		]);
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function clone(inst, def, params) {
			const cl = new inst._zod.constr(def ?? inst._zod.def);
			if (!def || params?.parent) cl._zod.parent = inst;
			return cl;
		}
		function normalizeParams(_params) {
			const params = _params;
			if (!params) return {};
			if (typeof params === "string") return { error: () => params };
			if (params?.message !== void 0) {
				if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				params.error = params.message;
			}
			delete params.message;
			if (typeof params.error === "string") return {
				...params,
				error: () => params.error
			};
			return params;
		}
		function optionalKeys(shape) {
			return Object.keys(shape).filter((k) => {
				return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
			});
		}
		Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, -Number.MAX_VALUE, Number.MAX_VALUE;
		function pick(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = {};
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						newShape[key] = currDef.shape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function omit(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = { ...schema._zod.def.shape };
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						delete newShape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function extend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) {
				const existingShape = schema._zod.def.shape;
				for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function safeExtend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function merge(a, b) {
			if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			return clone(a, mergeDefs(a._zod.def, {
				get shape() {
					const _shape = {
						...a._zod.def.shape,
						...b._zod.def.shape
					};
					assignProp(this, "shape", _shape);
					return _shape;
				},
				get catchall() {
					return b._zod.def.catchall;
				},
				checks: b._zod.def.checks ?? []
			}));
		}
		function partial(Class, schema, mask) {
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const oldShape = schema._zod.def.shape;
					const shape = { ...oldShape };
					if (mask) for (const key in mask) {
						if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						shape[key] = Class ? new Class({
							type: "optional",
							innerType: oldShape[key]
						}) : oldShape[key];
					}
					else for (const key in oldShape) shape[key] = Class ? new Class({
						type: "optional",
						innerType: oldShape[key]
					}) : oldShape[key];
					assignProp(this, "shape", shape);
					return shape;
				},
				checks: []
			}));
		}
		function required(Class, schema, mask) {
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const oldShape = schema._zod.def.shape;
				const shape = { ...oldShape };
				if (mask) for (const key in mask) {
					if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					shape[key] = new Class({
						type: "nonoptional",
						innerType: oldShape[key]
					});
				}
				else for (const key in oldShape) shape[key] = new Class({
					type: "nonoptional",
					innerType: oldShape[key]
				});
				assignProp(this, "shape", shape);
				return shape;
			} }));
		}
		function aborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
			return false;
		}
		function explicitlyAborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
			return false;
		}
		function prefixIssues(path, issues) {
			return issues.map((iss) => {
				var _a;
				(_a = iss).path ?? (_a.path = []);
				iss.path.unshift(path);
				return iss;
			});
		}
		function unwrapMessage(message) {
			return typeof message === "string" ? message : message?.message;
		}
		function finalizeIssue(iss, ctx, config) {
			const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
			const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
			rest.path ?? (rest.path = []);
			rest.message = message;
			if (ctx?.reportInput) rest.input = _input;
			return rest;
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function issue(...args) {
			const [iss, input, inst] = args;
			if (typeof iss === "string") return {
				message: iss,
				code: "custom",
				input,
				inst
			};
			return { ...iss };
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js
		const initializer$1 = (inst, def) => {
			inst.name = "$ZodError";
			Object.defineProperty(inst, "_zod", {
				value: inst._zod,
				enumerable: false
			});
			Object.defineProperty(inst, "issues", {
				value: def,
				enumerable: false
			});
			inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
			Object.defineProperty(inst, "toString", {
				value: () => inst.message,
				enumerable: false
			});
		};
		const $ZodError = $constructor("$ZodError", initializer$1);
		const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
		function flattenError(error, mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of error.issues) if (sub.path.length > 0) {
				fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
				fieldErrors[sub.path[0]].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		function formatError(error, mapper = (issue) => issue.message) {
			const fieldErrors = { _errors: [] };
			const processError = (error, path = []) => {
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < fullpath.length) {
							const el = fullpath[i];
							if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
							else {
								curr[el] = curr[el] || { _errors: [] };
								curr[el]._errors.push(mapper(issue));
							}
							curr = curr[el];
							i++;
						}
					}
				}
			};
			processError(error);
			return fieldErrors;
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js
		const _parse = (_Err) => (schema, value, _ctx, _params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			if (result.issues.length) {
				const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, _params?.callee);
				throw e;
			}
			return result.value;
		};
		const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			if (result.issues.length) {
				const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, params?.callee);
				throw e;
			}
			return result.value;
		};
		const _safeParse = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length ? {
				success: false,
				error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
		const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length ? {
				success: false,
				error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
		const _encode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parse(_Err)(schema, value, ctx);
		};
		const _decode = (_Err) => (schema, value, _ctx) => {
			return _parse(_Err)(schema, value, _ctx);
		};
		const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parseAsync(_Err)(schema, value, ctx);
		};
		const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _parseAsync(_Err)(schema, value, _ctx);
		};
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/regexes.js
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid = /^[cC][0-9a-z]{6,}$/;
		const cuid2 = /^[0-9a-z]+$/;
		const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
		const xid = /^[0-9a-vA-V]{20}$/;
		const ksuid = /^[A-Za-z0-9]{27}$/;
		const nanoid = /^[a-zA-Z0-9_-]{21}$/;
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		/** Practical email validation */
		const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		function emoji() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url = /^[A-Za-z0-9_-]*$/;
		const httpProtocol = /^https?$/;
		const e164 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		const date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
		function timeSource(args) {
			const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
			return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
		}
		function time$1(args) {
			return new RegExp(`^${timeSource(args)}$`);
		}
		function datetime$1(args) {
			const time = timeSource({ precision: args.precision });
			const opts = ["Z"];
			if (args.local) opts.push("");
			if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
			const timeRegex = `${time}(?:${opts.join("|")})`;
			return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
		}
		const string$1 = (params) => {
			const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
			return new RegExp(`^${regex}$`);
		};
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/checks.js
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length <= def.maximum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length >= def.minimum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.minimum = def.length;
				bag.maximum = def.length;
				bag.length = def.length;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const length = input.length;
				if (length === def.length) return;
				const origin = getLengthableOrigin(input);
				const tooBig = length > def.length;
				payload.issues.push({
					origin,
					...tooBig ? {
						code: "too_big",
						maximum: def.length
					} : {
						code: "too_small",
						minimum: def.length
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
			var _a, _b;
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				if (def.pattern) {
					bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
					bag.patterns.add(def.pattern);
				}
			});
			if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					...def.pattern ? { pattern: def.pattern.toString() } : {},
					inst,
					continue: !def.abort
				});
			});
			else (_b = inst._zod).check ?? (_b.check = () => {});
		});
		const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: payload.value,
					pattern: def.pattern.toString(),
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
			def.pattern ?? (def.pattern = lowercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
			def.pattern ?? (def.pattern = uppercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
			$ZodCheck.init(inst, def);
			const escapedRegex = escapeRegex(def.includes);
			const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
			def.pattern = pattern;
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.includes(def.includes, def.position)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: def.includes,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.startsWith(def.prefix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: def.prefix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.endsWith(def.suffix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: def.suffix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				payload.value = def.tx(payload.value);
			};
		});
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/doc.js
		var Doc = class {
			constructor(args = []) {
				this.content = [];
				this.indent = 0;
				if (this) this.args = args;
			}
			indented(fn) {
				this.indent += 1;
				fn(this);
				this.indent -= 1;
			}
			write(arg) {
				if (typeof arg === "function") {
					arg(this, { execution: "sync" });
					arg(this, { execution: "async" });
					return;
				}
				const lines = arg.split("\n").filter((x) => x);
				const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
				const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
				for (const line of dedented) this.content.push(line);
			}
			compile() {
				const F = Function;
				const args = this?.args;
				const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
				return new F(...args, lines.join("\n"));
			}
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/versions.js
		const version = {
			major: 4,
			minor: 4,
			patch: 3
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/schemas.js
		const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
			var _a;
			inst ?? (inst = {});
			inst._zod.def = def;
			inst._zod.bag = inst._zod.bag || {};
			inst._zod.version = version;
			const checks = [...inst._zod.def.checks ?? []];
			if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
			for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
			if (checks.length === 0) {
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred?.push(() => {
					inst._zod.run = inst._zod.parse;
				});
			} else {
				const runChecks = (payload, checks, ctx) => {
					let isAborted = aborted(payload);
					let asyncResult;
					for (const ch of checks) {
						if (ch._zod.def.when) {
							if (explicitlyAborted(payload)) continue;
							if (!ch._zod.def.when(payload)) continue;
						} else if (isAborted) continue;
						const currLen = payload.issues.length;
						const _ = ch._zod.check(payload);
						if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
						if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
							await _;
							if (payload.issues.length === currLen) return;
							if (!isAborted) isAborted = aborted(payload, currLen);
						});
						else {
							if (payload.issues.length === currLen) continue;
							if (!isAborted) isAborted = aborted(payload, currLen);
						}
					}
					if (asyncResult) return asyncResult.then(() => {
						return payload;
					});
					return payload;
				};
				const handleCanaryResult = (canary, payload, ctx) => {
					if (aborted(canary)) {
						canary.aborted = true;
						return canary;
					}
					const checkResult = runChecks(payload, checks, ctx);
					if (checkResult instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
					}
					return inst._zod.parse(checkResult, ctx);
				};
				inst._zod.run = (payload, ctx) => {
					if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
					if (ctx.direction === "backward") {
						const canary = inst._zod.parse({
							value: payload.value,
							issues: []
						}, {
							...ctx,
							skipChecks: true
						});
						if (canary instanceof Promise) return canary.then((canary) => {
							return handleCanaryResult(canary, payload, ctx);
						});
						return handleCanaryResult(canary, payload, ctx);
					}
					const result = inst._zod.parse(payload, ctx);
					if (result instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return result.then((result) => runChecks(result, checks, ctx));
					}
					return runChecks(result, checks, ctx);
				};
			}
			defineLazy(inst, "~standard", () => ({
				validate: (value) => {
					try {
						const r = safeParse$1(inst, value);
						return r.success ? { value: r.data } : { issues: r.error?.issues };
					} catch (_) {
						return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
					}
				},
				vendor: "zod",
				version: 1
			}));
		});
		const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
			inst._zod.parse = (payload, _) => {
				if (def.coerce) try {
					payload.value = String(payload.value);
				} catch (_) {}
				if (typeof payload.value === "string") return payload;
				payload.issues.push({
					expected: "string",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			$ZodString.init(inst, def);
		});
		const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
			def.pattern ?? (def.pattern = guid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
			if (def.version) {
				const v = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[def.version];
				if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
				def.pattern ?? (def.pattern = uuid(v));
			} else def.pattern ?? (def.pattern = uuid());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				try {
					const trimmed = payload.value.trim();
					if (!def.normalize && def.protocol?.source === httpProtocol.source) {
						if (!/^https?:\/\//i.test(trimmed)) {
							payload.issues.push({
								code: "invalid_format",
								format: "url",
								note: "Invalid URL format",
								input: payload.value,
								inst,
								continue: !def.abort
							});
							return;
						}
					}
					const url = new URL(trimmed);
					if (def.hostname) {
						def.hostname.lastIndex = 0;
						if (!def.hostname.test(url.hostname)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid hostname",
							pattern: def.hostname.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.protocol) {
						def.protocol.lastIndex = 0;
						if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid protocol",
							pattern: def.protocol.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.normalize) payload.value = url.href;
					else payload.value = trimmed;
					return;
				} catch (_) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
			def.pattern ?? (def.pattern = emoji());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			def.pattern ?? (def.pattern = nanoid);
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
			def.pattern ?? (def.pattern = time$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
			def.pattern ?? (def.pattern = duration$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
			def.pattern ?? (def.pattern = ipv4);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv4`;
		});
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv6`;
			inst._zod.check = (payload) => {
				try {
					new URL(`http://[${payload.value}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "ipv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				const parts = payload.value.split("/");
				try {
					if (parts.length !== 2) throw new Error();
					const [address, prefix] = parts;
					if (!prefix) throw new Error();
					const prefixNum = Number(prefix);
					if (`${prefixNum}` !== prefix) throw new Error();
					if (prefixNum < 0 || prefixNum > 128) throw new Error();
					new URL(`http://[${address}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "cidrv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		function isValidBase64(data) {
			if (data === "") return true;
			if (/\s/.test(data)) return false;
			if (data.length % 4 !== 0) return false;
			try {
				atob(data);
				return true;
			} catch {
				return false;
			}
		}
		const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
			def.pattern ?? (def.pattern = base64);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64";
			inst._zod.check = (payload) => {
				if (isValidBase64(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64URL(data) {
			if (!base64url.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64url);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64url";
			inst._zod.check = (payload) => {
				if (isValidBase64URL(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
			def.pattern ?? (def.pattern = e164);
			$ZodStringFormat.init(inst, def);
		});
		function isValidJWT(token, algorithm = null) {
			try {
				const tokensParts = token.split(".");
				if (tokensParts.length !== 3) return false;
				const [header] = tokensParts;
				if (!header) return false;
				const parsedHeader = JSON.parse(atob(header));
				if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
				if (!parsedHeader.alg) return false;
				if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
				return true;
			} catch {
				return false;
			}
		}
		const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidJWT(payload.value, def.alg)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
		});
		const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				payload.issues.push({
					expected: "never",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		function handleArrayResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						expected: "array",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = Array(input.length);
				const proms = [];
				for (let i = 0; i < input.length; i++) {
					const item = input[i];
					const result = def.element._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
					else handleArrayResult(result, payload, i);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
			const isPresent = key in input;
			if (result.issues.length) {
				if (isOptionalIn && isOptionalOut && !isPresent) return;
				final.issues.push(...prefixIssues(key, result.issues));
			}
			if (!isPresent && !isOptionalIn) {
				if (!result.issues.length) final.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [key]
				});
				return;
			}
			if (result.value === void 0) {
				if (isPresent) final.value[key] = void 0;
			} else final.value[key] = result.value;
		}
		function normalizeDef(def) {
			const keys = Object.keys(def.shape);
			for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
			const okeys = optionalKeys(def.shape);
			return {
				...def,
				keys,
				keySet: new Set(keys),
				numKeys: keys.length,
				optionalKeys: new Set(okeys)
			};
		}
		function handleCatchall(proms, input, payload, ctx, def, inst) {
			const unrecognized = [];
			const keySet = def.keySet;
			const _catchall = def.catchall._zod;
			const t = _catchall.def.type;
			const isOptionalIn = _catchall.optin === "optional";
			const isOptionalOut = _catchall.optout === "optional";
			for (const key in input) {
				if (key === "__proto__") continue;
				if (keySet.has(key)) continue;
				if (t === "never") {
					unrecognized.push(key);
					continue;
				}
				const r = _catchall.run({
					value: input[key],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
				else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
			}
			if (unrecognized.length) payload.issues.push({
				code: "unrecognized_keys",
				keys: unrecognized,
				input,
				inst
			});
			if (!proms.length) return payload;
			return Promise.all(proms).then(() => {
				return payload;
			});
		}
		const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
			$ZodType.init(inst, def);
			if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
				const sh = def.shape;
				Object.defineProperty(def, "shape", { get: () => {
					const newSh = { ...sh };
					Object.defineProperty(def, "shape", { value: newSh });
					return newSh;
				} });
			}
			const _normalized = cached(() => normalizeDef(def));
			defineLazy(inst._zod, "propValues", () => {
				const shape = def.shape;
				const propValues = {};
				for (const key in shape) {
					const field = shape[key]._zod;
					if (field.values) {
						propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
						for (const v of field.values) propValues[key].add(v);
					}
				}
				return propValues;
			});
			const isObject$1 = isObject;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$1(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = {};
				const proms = [];
				const shape = value.shape;
				for (const key of value.keys) {
					const el = shape[key];
					const isOptionalIn = el._zod.optin === "optional";
					const isOptionalOut = el._zod.optout === "optional";
					const r = el._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
					else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
				}
				if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
				return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
			};
		});
		const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
			$ZodObject.init(inst, def);
			const superParse = inst._zod.parse;
			const _normalized = cached(() => normalizeDef(def));
			const generateFastpass = (shape) => {
				const doc = new Doc([
					"shape",
					"payload",
					"ctx"
				]);
				const normalized = _normalized.value;
				const parseStr = (key) => {
					const k = esc(key);
					return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
				};
				doc.write(`const input = payload.value;`);
				const ids = Object.create(null);
				let counter = 0;
				for (const key of normalized.keys) ids[key] = `key_${counter++}`;
				doc.write(`const newResult = {};`);
				for (const key of normalized.keys) {
					const id = ids[key];
					const k = esc(key);
					const schema = shape[key];
					const isOptionalIn = schema?._zod?.optin === "optional";
					const isOptionalOut = schema?._zod?.optout === "optional";
					doc.write(`const ${id} = ${parseStr(key)};`);
					if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
					else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
					else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
				}
				doc.write(`payload.value = newResult;`);
				doc.write(`return payload;`);
				const fn = doc.compile();
				return (payload, ctx) => fn(shape, payload, ctx);
			};
			let fastpass;
			const isObject$2 = isObject;
			const jit = !globalConfig.jitless;
			const fastEnabled = jit && allowsEval.value;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$2(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
					if (!fastpass) fastpass = generateFastpass(def.shape);
					payload = fastpass(payload, ctx);
					if (!catchall) return payload;
					return handleCatchall([], input, payload, ctx, value, inst);
				}
				return superParse(payload, ctx);
			};
		});
		function handleUnionResults(results, final, inst, ctx) {
			for (const result of results) if (result.issues.length === 0) {
				final.value = result.value;
				return final;
			}
			const nonaborted = results.filter((r) => !aborted(r));
			if (nonaborted.length === 1) {
				final.value = nonaborted[0].value;
				return nonaborted[0];
			}
			final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			return final;
		}
		const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "values", () => {
				if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
			});
			defineLazy(inst._zod, "pattern", () => {
				if (def.options.every((o) => o._zod.pattern)) {
					const patterns = def.options.map((o) => o._zod.pattern);
					return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
				}
			});
			const first = def.options.length === 1 ? def.options[0]._zod.run : null;
			inst._zod.parse = (payload, ctx) => {
				if (first) return first(payload, ctx);
				let async = false;
				const results = [];
				for (const option of def.options) {
					const result = option._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) {
						results.push(result);
						async = true;
					} else {
						if (result.issues.length === 0) return result;
						results.push(result);
					}
				}
				if (!async) return handleUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleUnionResults(results, payload, inst, ctx);
				});
			};
		});
		const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				const left = def.left._zod.run({
					value: input,
					issues: []
				}, ctx);
				const right = def.right._zod.run({
					value: input,
					issues: []
				}, ctx);
				if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
					return handleIntersectionResults(payload, left, right);
				});
				return handleIntersectionResults(payload, left, right);
			};
		});
		function mergeValues(a, b) {
			if (a === b) return {
				valid: true,
				data: a
			};
			if (a instanceof Date && b instanceof Date && +a === +b) return {
				valid: true,
				data: a
			};
			if (isPlainObject(a) && isPlainObject(b)) {
				const bKeys = Object.keys(b);
				const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				for (const key of sharedKeys) {
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
					};
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			}
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a.length !== b.length) return {
					valid: false,
					mergeErrorPath: []
				};
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
					};
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			}
			return {
				valid: false,
				mergeErrorPath: []
			};
		}
		function handleIntersectionResults(result, left, right) {
			const unrecKeys = /* @__PURE__ */ new Map();
			let unrecIssue;
			for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
				unrecIssue ?? (unrecIssue = iss);
				for (const k of iss.keys) {
					if (!unrecKeys.has(k)) unrecKeys.set(k, {});
					unrecKeys.get(k).l = true;
				}
			} else result.issues.push(iss);
			for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
				if (!unrecKeys.has(k)) unrecKeys.set(k, {});
				unrecKeys.get(k).r = true;
			}
			else result.issues.push(iss);
			const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
			if (bothKeys.length && unrecIssue) result.issues.push({
				...unrecIssue,
				keys: bothKeys
			});
			if (aborted(result)) return result;
			const merged = mergeValues(left.value, right.value);
			if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
			result.value = merged.data;
			return result;
		}
		const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
			$ZodType.init(inst, def);
			const values = getEnumValues(def.entries);
			const valuesSet = new Set(values);
			inst._zod.values = valuesSet;
			inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (valuesSet.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				const _out = def.transform(payload.value, payload);
				if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				if (_out instanceof Promise) throw new $ZodAsyncError();
				payload.value = _out;
				payload.fallback = true;
				return payload;
			};
		});
		function handleOptionalResult(result, input) {
			if (input === void 0 && (result.issues.length || result.fallback)) return {
				issues: [],
				value: void 0
			};
			return result;
		}
		const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.optout = "optional";
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? new Set([...def.innerType._zod.values, void 0]) : void 0;
			});
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (def.innerType._zod.optin === "optional") {
					const input = payload.value;
					const result = def.innerType._zod.run(payload, ctx);
					if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
					return handleOptionalResult(result, input);
				}
				if (payload.value === void 0) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
			inst._zod.parse = (payload, ctx) => {
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
			});
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === null) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) {
					payload.value = def.defaultValue;
					/**
					* $ZodDefault returns the default value immediately in forward direction.
					* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
					return payload;
				}
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
				return handleDefaultResult(result, def);
			};
		});
		function handleDefaultResult(payload, def) {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return payload;
		}
		const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) payload.value = def.defaultValue;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => {
				const v = def.innerType._zod.values;
				return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
				return handleNonOptionalResult(result, inst);
			};
		});
		function handleNonOptionalResult(payload, inst) {
			if (!payload.issues.length && payload.value === void 0) payload.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: payload.value,
				inst
			});
			return payload;
		}
		const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => {
					payload.value = result.value;
					if (result.issues.length) {
						payload.value = def.catchValue({
							...payload,
							error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
							input: payload.value
						});
						payload.issues = [];
						payload.fallback = true;
					}
					return payload;
				});
				payload.value = result.value;
				if (result.issues.length) {
					payload.value = def.catchValue({
						...payload,
						error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
						input: payload.value
					});
					payload.issues = [];
					payload.fallback = true;
				}
				return payload;
			};
		});
		const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => def.in._zod.values);
			defineLazy(inst._zod, "optin", () => def.in._zod.optin);
			defineLazy(inst._zod, "optout", () => def.out._zod.optout);
			defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
					return handlePipeResult(right, def.in, ctx);
				}
				const left = def.in._zod.run(payload, ctx);
				if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
				return handlePipeResult(left, def.out, ctx);
			};
		});
		function handlePipeResult(left, next, ctx) {
			if (left.issues.length) {
				left.aborted = true;
				return left;
			}
			return next._zod.run({
				value: left.value,
				issues: left.issues,
				fallback: left.fallback
			}, ctx);
		}
		const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
			defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then(handleReadonlyResult);
				return handleReadonlyResult(result);
			};
		});
		function handleReadonlyResult(payload) {
			payload.value = Object.freeze(payload.value);
			return payload;
		}
		const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
			$ZodCheck.init(inst, def);
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _) => {
				return payload;
			};
			inst._zod.check = (payload) => {
				const input = payload.value;
				const r = def.fn(input);
				if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
				handleRefineResult(r, payload, input, inst);
			};
		});
		function handleRefineResult(result, payload, input, inst) {
			if (!result) {
				const _iss = {
					code: "custom",
					input,
					inst,
					path: [...inst._zod.def.path ?? []],
					continue: !inst._zod.def.abort
				};
				if (inst._zod.def.params) _iss.params = inst._zod.def.params;
				payload.issues.push(issue(_iss));
			}
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
		var _a;
		var $ZodRegistry = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
			}
			add(schema, ..._meta) {
				const meta = _meta[0];
				this._map.set(schema, meta);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
				return this;
			}
			clear() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
				return this;
			}
			remove(schema) {
				const meta = this._map.get(schema);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
				this._map.delete(schema);
				return this;
			}
			get(schema) {
				const p = schema._zod.parent;
				if (p) {
					const pm = { ...this.get(p) ?? {} };
					delete pm.id;
					const f = {
						...pm,
						...this._map.get(schema)
					};
					return Object.keys(f).length ? f : void 0;
				}
				return this._map.get(schema);
			}
			has(schema) {
				return this._map.has(schema);
			}
		};
		function registry() {
			return new $ZodRegistry();
		}
		(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
		const globalRegistry = globalThis.__zod_globalRegistry;
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class({
				type: "string",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _email(Class, params) {
			return new Class({
				type: "string",
				format: "email",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _guid(Class, params) {
			return new Class({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuid(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv4(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v4",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv6(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v6",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv7(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v7",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _url(Class, params) {
			return new Class({
				type: "string",
				format: "url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _emoji(Class, params) {
			return new Class({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nanoid(Class, params) {
			return new Class({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link _cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		// @__NO_SIDE_EFFECTS__
		function _cuid(Class, params) {
			return new Class({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cuid2(Class, params) {
			return new Class({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ulid(Class, params) {
			return new Class({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _xid(Class, params) {
			return new Class({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ksuid(Class, params) {
			return new Class({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv4(Class, params) {
			return new Class({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv6(Class, params) {
			return new Class({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv4(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv6(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64(Class, params) {
			return new Class({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64url(Class, params) {
			return new Class({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _e164(Class, params) {
			return new Class({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _jwt(Class, params) {
			return new Class({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDateTime(Class, params) {
			return new Class({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: false,
				local: false,
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDate(Class, params) {
			return new Class({
				type: "string",
				format: "date",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoTime(Class, params) {
			return new Class({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDuration(Class, params) {
			return new Class({
				type: "string",
				format: "duration",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _unknown(Class) {
			return new Class({ type: "unknown" });
		}
		// @__NO_SIDE_EFFECTS__
		function _never(Class, params) {
			return new Class({
				type: "never",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _maxLength(maximum, params) {
			return new $ZodCheckMaxLength({
				check: "max_length",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minLength(minimum, params) {
			return new $ZodCheckMinLength({
				check: "min_length",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _length(length, params) {
			return new $ZodCheckLengthEquals({
				check: "length_equals",
				...normalizeParams(params),
				length
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _regex(pattern, params) {
			return new $ZodCheckRegex({
				check: "string_format",
				format: "regex",
				...normalizeParams(params),
				pattern
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lowercase(params) {
			return new $ZodCheckLowerCase({
				check: "string_format",
				format: "lowercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uppercase(params) {
			return new $ZodCheckUpperCase({
				check: "string_format",
				format: "uppercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _includes(includes, params) {
			return new $ZodCheckIncludes({
				check: "string_format",
				format: "includes",
				...normalizeParams(params),
				includes
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _startsWith(prefix, params) {
			return new $ZodCheckStartsWith({
				check: "string_format",
				format: "starts_with",
				...normalizeParams(params),
				prefix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _endsWith(suffix, params) {
			return new $ZodCheckEndsWith({
				check: "string_format",
				format: "ends_with",
				...normalizeParams(params),
				suffix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _overwrite(tx) {
			return new $ZodCheckOverwrite({
				check: "overwrite",
				tx
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _normalize(form) {
			return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
		}
		// @__NO_SIDE_EFFECTS__
		function _trim() {
			return /* @__PURE__ */ _overwrite((input) => input.trim());
		}
		// @__NO_SIDE_EFFECTS__
		function _toLowerCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _toUpperCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _slugify() {
			return /* @__PURE__ */ _overwrite((input) => slugify(input));
		}
		// @__NO_SIDE_EFFECTS__
		function _array(Class, element, params) {
			return new Class({
				type: "array",
				element,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _refine(Class, fn, _params) {
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...normalizeParams(_params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _superRefine(fn, params) {
			const ch = /* @__PURE__ */ _check((payload) => {
				payload.addIssue = (issue$2) => {
					if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
					else {
						const _issue = issue$2;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = ch);
						_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
						payload.issues.push(issue(_issue));
					}
				};
				return fn(payload.value, payload);
			}, params);
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _check(fn, params) {
			const ch = new $ZodCheck({
				check: "custom",
				...normalizeParams(params)
			});
			ch._zod.check = fn;
			return ch;
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
		function initializeContext(params) {
			let target = params?.target ?? "draft-2020-12";
			if (target === "draft-4") target = "draft-04";
			if (target === "draft-7") target = "draft-07";
			return {
				processors: params.processors ?? {},
				metadataRegistry: params?.metadata ?? globalRegistry,
				target,
				unrepresentable: params?.unrepresentable ?? "throw",
				override: params?.override ?? (() => {}),
				io: params?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				cycles: params?.cycles ?? "ref",
				reused: params?.reused ?? "inline",
				external: params?.external ?? void 0
			};
		}
		function process(schema, ctx, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const seen = ctx.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			ctx.seen.set(schema, result);
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
				else {
					const _json = result.schema;
					const processor = ctx.processors[def.type];
					if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
					processor(schema, ctx, _json, params);
				}
				const parent = schema._zod.parent;
				if (parent) {
					if (!result.ref) result.ref = parent;
					process(parent, ctx, params);
					ctx.seen.get(parent).isParent = true;
				}
			}
			const meta = ctx.metadataRegistry.get(schema);
			if (meta) Object.assign(result.schema, meta);
			if (ctx.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return ctx.seen.get(schema).schema;
		}
		function extractDefs(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const idToSchema = /* @__PURE__ */ new Map();
			for (const entry of ctx.seen.entries()) {
				const id = ctx.metadataRegistry.get(entry[0])?.id;
				if (id) {
					const existing = idToSchema.get(id);
					if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
					idToSchema.set(id, entry[0]);
				}
			}
			const makeURI = (entry) => {
				const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
				if (ctx.external) {
					const externalId = ctx.external.registry.get(entry[0])?.id;
					const uriGenerator = ctx.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
					};
				}
				if (entry[1] === root) return { ref: "#" };
				const defUriPrefix = `#/${defsSegment}/`;
				const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
				return {
					defId,
					ref: defUriPrefix + defId
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (ctx.external) {
					const ext = ctx.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (ctx.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (ctx.reused === "ref") {
						extractToDef(entry);
						continue;
					}
				}
			}
		}
		function finalize(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const flattenRef = (zodSchema) => {
				const seen = ctx.seen.get(zodSchema);
				if (seen.ref === null) return;
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref);
					const refSeen = ctx.seen.get(ref);
					const refSchema = refSeen.schema;
					if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else Object.assign(schema, refSchema);
					Object.assign(schema, _cached);
					if (zodSchema._zod.parent === ref) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (!(key in _cached)) delete schema[key];
					}
					if (refSchema.$ref && refSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
					}
				}
				const parent = zodSchema._zod.parent;
				if (parent && parent !== ref) {
					flattenRef(parent);
					const parentSeen = ctx.seen.get(parent);
					if (parentSeen?.schema.$ref) {
						schema.$ref = parentSeen.schema.$ref;
						if (parentSeen.def) for (const key in schema) {
							if (key === "$ref" || key === "allOf") continue;
							if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
						}
					}
				}
				ctx.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
			const result = {};
			if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
			else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
			else if (ctx.target === "openapi-3.0") {}
			if (ctx.external?.uri) {
				const id = ctx.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = ctx.external.uri(id);
			}
			Object.assign(result, root.def ?? root.schema);
			const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
			if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
			const defs = ctx.external?.defs ?? {};
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) {
					if (seen.def.id === seen.defId) delete seen.def.id;
					defs[seen.defId] = seen.def;
				}
			}
			if (ctx.external) {} else if (Object.keys(defs).length > 0) if (ctx.target === "draft-2020-12") result.$defs = defs;
			else result.definitions = defs;
			try {
				const finalized = JSON.parse(JSON.stringify(result));
				Object.defineProperty(finalized, "~standard", {
					value: {
						...schema["~standard"],
						jsonSchema: {
							input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
							output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
						}
					},
					enumerable: false,
					writable: false
				});
				return finalized;
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function isTransforming(_schema, _ctx) {
			const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
			if (ctx.seen.has(_schema)) return false;
			ctx.seen.add(_schema);
			const def = _schema._zod.def;
			if (def.type === "transform") return true;
			if (def.type === "array") return isTransforming(def.element, ctx);
			if (def.type === "set") return isTransforming(def.valueType, ctx);
			if (def.type === "lazy") return isTransforming(def.getter(), ctx);
			if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
			if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			if (def.type === "pipe") {
				if (_schema._zod.traits.has("$ZodCodec")) return true;
				return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			}
			if (def.type === "object") {
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			}
			if (def.type === "union") {
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			}
			if (def.type === "tuple") {
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			}
			return false;
		}
		/**
		* Creates a toJSONSchema method for a schema instance.
		* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
		*/
		const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
			const ctx = initializeContext({
				...params,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
			const { libraryOptions, target } = params ?? {};
			const ctx = initializeContext({
				...libraryOptions ?? {},
				target,
				io,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
		const formatMap = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		};
		const stringProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			json.type = "string";
			const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
			if (typeof minimum === "number") json.minLength = minimum;
			if (typeof maximum === "number") json.maxLength = maximum;
			if (format) {
				json.format = formatMap[format] ?? format;
				if (json.format === "") delete json.format;
				if (format === "time") delete json.format;
			}
			if (contentEncoding) json.contentEncoding = contentEncoding;
			if (patterns && patterns.size > 0) {
				const regexes = [...patterns];
				if (regexes.length === 1) json.pattern = regexes[0].source;
				else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
					...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: regex.source
				}))];
			}
		};
		const neverProcessor = (_schema, _ctx, json, _params) => {
			json.not = {};
		};
		const enumProcessor = (schema, _ctx, json, _params) => {
			const def = schema._zod.def;
			const values = getEnumValues(def.entries);
			if (values.every((v) => typeof v === "number")) json.type = "number";
			if (values.every((v) => typeof v === "string")) json.type = "string";
			json.enum = values;
		};
		const customProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		};
		const transformProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		};
		const arrayProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const { minimum, maximum } = schema._zod.bag;
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
			json.type = "array";
			json.items = process(def.element, ctx, {
				...params,
				path: [...params.path, "items"]
			});
		};
		const objectProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			json.properties = {};
			const shape = def.shape;
			for (const key in shape) json.properties[key] = process(shape[key], ctx, {
				...params,
				path: [
					...params.path,
					"properties",
					key
				]
			});
			const allKeys = new Set(Object.keys(shape));
			const requiredKeys = new Set([...allKeys].filter((key) => {
				const v = def.shape[key]._zod;
				if (ctx.io === "input") return v.optin === void 0;
				else return v.optout === void 0;
			}));
			if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
			if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
			else if (!def.catchall) {
				if (ctx.io === "output") json.additionalProperties = false;
			} else if (def.catchall) json.additionalProperties = process(def.catchall, ctx, {
				...params,
				path: [...params.path, "additionalProperties"]
			});
		};
		const unionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const isExclusive = def.inclusive === false;
			const options = def.options.map((x, i) => process(x, ctx, {
				...params,
				path: [
					...params.path,
					isExclusive ? "oneOf" : "anyOf",
					i
				]
			}));
			if (isExclusive) json.oneOf = options;
			else json.anyOf = options;
		};
		const intersectionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const a = process(def.left, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					0
				]
			});
			const b = process(def.right, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					1
				]
			});
			const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
			json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
		};
		const nullableProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const inner = process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			if (ctx.target === "openapi-3.0") {
				seen.ref = def.innerType;
				json.nullable = true;
			} else json.anyOf = [inner, { type: "null" }];
		};
		const nonoptionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const defaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.default = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const prefaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const catchProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			let catchValue;
			try {
				catchValue = def.catchValue(void 0);
			} catch {
				throw new Error("Dynamic catch values are not supported in JSON Schema");
			}
			json.default = catchValue;
		};
		const pipeProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			const inIsTransform = def.in._zod.traits.has("$ZodTransform");
			const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const readonlyProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.readOnly = true;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/iso.js
		const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
			$ZodISODateTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function datetime(params) {
			return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
		}
		const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
			$ZodISODate.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function date(params) {
			return /* @__PURE__ */ _isoDate(ZodISODate, params);
		}
		const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
			$ZodISOTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function time(params) {
			return /* @__PURE__ */ _isoTime(ZodISOTime, params);
		}
		const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
			$ZodISODuration.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function duration(params) {
			return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/errors.js
		const initializer = (inst, issues) => {
			$ZodError.init(inst, issues);
			inst.name = "ZodError";
			Object.defineProperties(inst, {
				format: { value: (mapper) => formatError(inst, mapper) },
				flatten: { value: (mapper) => flattenError(inst, mapper) },
				addIssue: { value: (issue) => {
					inst.issues.push(issue);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				addIssues: { value: (issues) => {
					inst.issues.push(...issues);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				isEmpty: { get() {
					return inst.issues.length === 0;
				} }
			});
		};
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, { Parent: Error });
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/parse.js
		const parse = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode = /* @__PURE__ */ _decode(ZodRealError);
		const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
		const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
		const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
		const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
		const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
		const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
		const _installedGroups = /* @__PURE__ */ new WeakMap();
		function _installLazyMethods(inst, group, methods) {
			const proto = Object.getPrototypeOf(inst);
			let installed = _installedGroups.get(proto);
			if (!installed) {
				installed = /* @__PURE__ */ new Set();
				_installedGroups.set(proto, installed);
			}
			if (installed.has(group)) return;
			installed.add(group);
			for (const key in methods) {
				const fn = methods[key];
				Object.defineProperty(proto, key, {
					configurable: true,
					enumerable: false,
					get() {
						const bound = fn.bind(this);
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: bound
						});
						return bound;
					},
					set(v) {
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: v
						});
					}
				});
			}
		}
		const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
			$ZodType.init(inst, def);
			Object.assign(inst["~standard"], { jsonSchema: {
				input: createStandardJSONSchemaMethod(inst, "input"),
				output: createStandardJSONSchemaMethod(inst, "output")
			} });
			inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
			inst.def = def;
			inst.type = def.type;
			Object.defineProperty(inst, "_def", { value: def });
			inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
			inst.safeParse = (data, params) => safeParse(inst, data, params);
			inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
			inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
			inst.spa = inst.safeParseAsync;
			inst.encode = (data, params) => encode(inst, data, params);
			inst.decode = (data, params) => decode(inst, data, params);
			inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
			inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
			inst.safeEncode = (data, params) => safeEncode(inst, data, params);
			inst.safeDecode = (data, params) => safeDecode(inst, data, params);
			inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
			inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
			_installLazyMethods(inst, "ZodType", {
				check(...chks) {
					const def = this.def;
					return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
						check: ch,
						def: { check: "custom" },
						onattach: []
					} } : ch)] }), { parent: true });
				},
				with(...chks) {
					return this.check(...chks);
				},
				clone(def, params) {
					return clone(this, def, params);
				},
				brand() {
					return this;
				},
				register(reg, meta) {
					reg.add(this, meta);
					return this;
				},
				refine(check, params) {
					return this.check(refine(check, params));
				},
				superRefine(refinement, params) {
					return this.check(superRefine(refinement, params));
				},
				overwrite(fn) {
					return this.check(/* @__PURE__ */ _overwrite(fn));
				},
				optional() {
					return optional(this);
				},
				exactOptional() {
					return exactOptional(this);
				},
				nullable() {
					return nullable(this);
				},
				nullish() {
					return optional(nullable(this));
				},
				nonoptional(params) {
					return nonoptional(this, params);
				},
				array() {
					return array(this);
				},
				or(arg) {
					return union([this, arg]);
				},
				and(arg) {
					return intersection(this, arg);
				},
				transform(tx) {
					return pipe(this, transform(tx));
				},
				default(d) {
					return _default(this, d);
				},
				prefault(d) {
					return prefault(this, d);
				},
				catch(params) {
					return _catch(this, params);
				},
				pipe(target) {
					return pipe(this, target);
				},
				readonly() {
					return readonly(this);
				},
				describe(description) {
					const cl = this.clone();
					globalRegistry.add(cl, { description });
					return cl;
				},
				meta(...args) {
					if (args.length === 0) return globalRegistry.get(this);
					const cl = this.clone();
					globalRegistry.add(cl, args[0]);
					return cl;
				},
				isOptional() {
					return this.safeParse(void 0).success;
				},
				isNullable() {
					return this.safeParse(null).success;
				},
				apply(fn) {
					return fn(this);
				}
			});
			Object.defineProperty(inst, "description", {
				get() {
					return globalRegistry.get(inst)?.description;
				},
				configurable: true
			});
			return inst;
		});
		/** @internal */
		const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
			const bag = inst._zod.bag;
			inst.format = bag.format ?? null;
			inst.minLength = bag.minimum ?? null;
			inst.maxLength = bag.maximum ?? null;
			_installLazyMethods(inst, "_ZodString", {
				regex(...args) {
					return this.check(/* @__PURE__ */ _regex(...args));
				},
				includes(...args) {
					return this.check(/* @__PURE__ */ _includes(...args));
				},
				startsWith(...args) {
					return this.check(/* @__PURE__ */ _startsWith(...args));
				},
				endsWith(...args) {
					return this.check(/* @__PURE__ */ _endsWith(...args));
				},
				min(...args) {
					return this.check(/* @__PURE__ */ _minLength(...args));
				},
				max(...args) {
					return this.check(/* @__PURE__ */ _maxLength(...args));
				},
				length(...args) {
					return this.check(/* @__PURE__ */ _length(...args));
				},
				nonempty(...args) {
					return this.check(/* @__PURE__ */ _minLength(1, ...args));
				},
				lowercase(params) {
					return this.check(/* @__PURE__ */ _lowercase(params));
				},
				uppercase(params) {
					return this.check(/* @__PURE__ */ _uppercase(params));
				},
				trim() {
					return this.check(/* @__PURE__ */ _trim());
				},
				normalize(...args) {
					return this.check(/* @__PURE__ */ _normalize(...args));
				},
				toLowerCase() {
					return this.check(/* @__PURE__ */ _toLowerCase());
				},
				toUpperCase() {
					return this.check(/* @__PURE__ */ _toUpperCase());
				},
				slugify() {
					return this.check(/* @__PURE__ */ _slugify());
				}
			});
		});
		const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			_ZodString.init(inst, def);
			inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
			inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
			inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
			inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
			inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
			inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
			inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
			inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
			inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
			inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
			inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
			inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
			inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
			inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
			inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
			inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
			inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
			inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
			inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
			inst.datetime = (params) => inst.check(datetime(params));
			inst.date = (params) => inst.check(date(params));
			inst.time = (params) => inst.check(time(params));
			inst.duration = (params) => inst.check(duration(params));
		});
		function string(params) {
			return /* @__PURE__ */ _string(ZodString, params);
		}
		const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			_ZodString.init(inst, def);
		});
		const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
			$ZodEmail.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
			$ZodUnknown.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function unknown() {
			return /* @__PURE__ */ _unknown(ZodUnknown);
		}
		const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
			$ZodNever.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
		});
		function never(params) {
			return /* @__PURE__ */ _never(ZodNever, params);
		}
		const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
			$ZodArray.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
			inst.element = def.element;
			_installLazyMethods(inst, "ZodArray", {
				min(n, params) {
					return this.check(/* @__PURE__ */ _minLength(n, params));
				},
				nonempty(params) {
					return this.check(/* @__PURE__ */ _minLength(1, params));
				},
				max(n, params) {
					return this.check(/* @__PURE__ */ _maxLength(n, params));
				},
				length(n, params) {
					return this.check(/* @__PURE__ */ _length(n, params));
				},
				unwrap() {
					return this.element;
				}
			});
		});
		function array(element, params) {
			return /* @__PURE__ */ _array(ZodArray, element, params);
		}
		const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
			$ZodObjectJIT.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
			defineLazy(inst, "shape", () => {
				return def.shape;
			});
			_installLazyMethods(inst, "ZodObject", {
				keyof() {
					return _enum(Object.keys(this._zod.def.shape));
				},
				catchall(catchall) {
					return this.clone({
						...this._zod.def,
						catchall
					});
				},
				passthrough() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				loose() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				strict() {
					return this.clone({
						...this._zod.def,
						catchall: never()
					});
				},
				strip() {
					return this.clone({
						...this._zod.def,
						catchall: void 0
					});
				},
				extend(incoming) {
					return extend(this, incoming);
				},
				safeExtend(incoming) {
					return safeExtend(this, incoming);
				},
				merge(other) {
					return merge(this, other);
				},
				pick(mask) {
					return pick(this, mask);
				},
				omit(mask) {
					return omit(this, mask);
				},
				partial(...args) {
					return partial(ZodOptional, this, args[0]);
				},
				required(...args) {
					return required(ZodNonOptional, this, args[0]);
				}
			});
		});
		function object(shape, params) {
			return new ZodObject({
				type: "object",
				shape: shape ?? {},
				...normalizeParams(params)
			});
		}
		const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
			$ZodUnion.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		function union(options, params) {
			return new ZodUnion({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
			$ZodIntersection.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
		});
		function intersection(left, right) {
			return new ZodIntersection({
				type: "intersection",
				left,
				right
			});
		}
		const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
			$ZodEnum.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
			inst.enum = def.entries;
			inst.options = Object.values(def.entries);
			const keys = new Set(Object.keys(def.entries));
			inst.extract = (values, params) => {
				const newEntries = {};
				for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
			inst.exclude = (values, params) => {
				const newEntries = { ...def.entries };
				for (const value of values) if (keys.has(value)) delete newEntries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
		});
		function _enum(values, params) {
			return new ZodEnum({
				type: "enum",
				entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
				...normalizeParams(params)
			});
		}
		const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
			$ZodTransform.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
			inst._zod.parse = (payload, _ctx) => {
				if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				payload.addIssue = (issue$1) => {
					if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
					else {
						const _issue = issue$1;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = inst);
						payload.issues.push(issue(_issue));
					}
				};
				const output = def.transform(payload.value, payload);
				if (output instanceof Promise) return output.then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				payload.value = output;
				payload.fallback = true;
				return payload;
			};
		});
		function transform(fn) {
			return new ZodTransform({
				type: "transform",
				transform: fn
			});
		}
		const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function optional(innerType) {
			return new ZodOptional({
				type: "optional",
				innerType
			});
		}
		const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
			$ZodExactOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function exactOptional(innerType) {
			return new ZodExactOptional({
				type: "optional",
				innerType
			});
		}
		const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
			$ZodNullable.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nullable(innerType) {
			return new ZodNullable({
				type: "nullable",
				innerType
			});
		}
		const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
			$ZodDefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeDefault = inst.unwrap;
		});
		function _default(innerType, defaultValue) {
			return new ZodDefault({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
			$ZodPrefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function prefault(innerType, defaultValue) {
			return new ZodPrefault({
				type: "prefault",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
			$ZodNonOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nonoptional(innerType, params) {
			return new ZodNonOptional({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
			$ZodCatch.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeCatch = inst.unwrap;
		});
		function _catch(innerType, catchValue) {
			return new ZodCatch({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
			});
		}
		const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
			$ZodPipe.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
			inst.in = def.in;
			inst.out = def.out;
		});
		function pipe(in_, out) {
			return new ZodPipe({
				type: "pipe",
				in: in_,
				out
			});
		}
		const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
			$ZodReadonly.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function readonly(innerType) {
			return new ZodReadonly({
				type: "readonly",
				innerType
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		//#endregion
		//#region lib/typert.remote-client.js
		let _deepseek_ai_dsh_experimental_agent_team_presets_teamPresets_catalog_result$schema$value;
		const _deepseek_ai_dsh_experimental_agent_team_presets_teamPresets_catalog_result$schema = () => _deepseek_ai_dsh_experimental_agent_team_presets_teamPresets_catalog_result$schema$value ??= object({ "tools": array(object({
			"name": string(),
			"description": string()
		})) });
		const TYPERT_REMOTE = {
			package: "dsh-agent-team-presets",
			descriptors: [{
				id: "dsh-agent-team-presets#teamPresets/catalog",
				service: "teamPresetsToolCatalog",
				namespace: "teamPresets",
				method: "catalog",
				invocation: { kind: "direct" },
				parameters: [],
				result: {
					mode: "strict",
					typeSymbol: "dsh-agent-team-presets/types#ToolCatalogValue",
					create: _deepseek_ai_dsh_experimental_agent_team_presets_teamPresets_catalog_result$schema
				},
				sourceLocation: {
					"file": "packages/experimental/agent-team-presets/src/tool-catalog.ts",
					"line": 43,
					"column": 3
				}
			}]
		};
		//#endregion
		//#region src/presets.ts
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
		* Replace the current Team selection of one Session.
		* @param selections - the current selection records.
		* @param sessionId - the Session whose selection changes.
		* @param teamId - the selected Team identity; undefined clears the selection.
		* @returns a new selection list, with the Session's record updated or removed.
		*/
		function withSelection(selections, sessionId, teamId) {
			const rest = selections.filter((record) => record.sessionId !== sessionId);
			return teamId === void 0 ? rest : [...rest, {
				sessionId,
				teamId
			}];
		}
		//#endregion
		//#region \0dsh-css:src/client/ComposerTeamSelect.module.css.mjs
		const css$1 = ".mqxPRW_trigger{border-radius:var(--dsw-radius-sm);min-width:0;max-width:160px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:inline-flex}.mqxPRW_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.mqxPRW_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}.mqxPRW_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.mqxPRW_triggerIcon{flex:none;display:inline-flex}.mqxPRW_triggerIcon svg{width:14px;height:14px}.mqxPRW_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.mqxPRW_accentDot{border-radius:50%;flex:none;width:8px;height:8px}";
		const tagId$1 = "dsh-agent-team-presets/ComposerTeamSelect.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-agent-team-presets";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var ComposerTeamSelect_module_css_default = {
			"accentDot": "mqxPRW_accentDot",
			"trigger": "mqxPRW_trigger",
			"triggerIcon": "mqxPRW_triggerIcon",
			"triggerLabel": "mqxPRW_triggerLabel"
		};
		//#endregion
		//#region src/client/ComposerTeamSelect.tsx
		/**
		* The composer's Team control: pick the Team preset that leads this Session.
		* It sits in the composer tool row after the permission control.
		*/
		/**
		* Render the composer's Team picker.
		* @param props - the Session identity, the page's locale reader, and the selection writer.
		* @returns the Team trigger, or null while no Team is configured.
		*/
		function ComposerTeamSelect(props) {
			const { t, sessionId } = props;
			const state = props.useTeamPresets((snapshot) => snapshot);
			const [open, setOpen] = (0, react.useState)(false);
			const active = selectedTeam(state.teams, state.selections, String(sessionId));
			const writable = state.status === "ready" && state.writable;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open,
				items: [{
					id: "",
					label: t("composerNone")
				}, ...state.teams.map((team) => ({
					id: team.id,
					label: team.name === "" ? team.id : team.name
				}))],
				selectedId: active?.id ?? "",
				onSelect: (id) => {
					setOpen(false);
					props.selectTeam(String(sessionId), id === "" ? void 0 : id);
				},
				onClose: () => {
					setOpen(false);
				},
				side: "top",
				portal: true,
				compact: true,
				anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: ComposerTeamSelect_module_css_default.trigger,
					disabled: !writable,
					"aria-haspopup": "listbox",
					"aria-expanded": open,
					title: t("composerHint"),
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [
						active === void 0 || active.captain.color === "" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ComposerTeamSelect_module_css_default.accentDot,
							style: { background: active.captain.color },
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ComposerTeamSelect_module_css_default.triggerLabel,
							"aria-label": t("composerTitle"),
							children: active === void 0 ? t("composerTitle") : active.name === "" ? active.id : active.name
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ComposerTeamSelect_module_css_default.triggerIcon,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 14 })
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/appearance.ts
		/**
		* Resolve the accent colors of the Team one Session selected.
		* @param teams - every stored Team preset.
		* @param selections - every Session's stored Team selection.
		* @param sessionId - the Lead Session identity.
		* @returns the colors the roster draws with, or undefined when the Session selected no Team.
		*/
		function teamAppearance(teams, selections, sessionId) {
			const teamId = selections.find((record) => record.sessionId === sessionId)?.teamId;
			const team = teams.find((candidate) => candidate.id === teamId);
			if (team === void 0) return void 0;
			return {
				captain: team.captain.color,
				members: new Map(memberTargets(team).map(({ member, target }) => [target, member.color]))
			};
		}
		//#endregion
		//#region src/preset-transfer.ts
		/** Format marker every shareable Team document carries. */
		const TEAM_PRESET_FORMAT = "dsh-agent-team-preset";
		/** Keys a document root may carry. */
		const ROOT_KEYS = [
			"format",
			"version",
			"team"
		];
		/** Keys a shared Team may carry. */
		const TEAM_KEYS = [
			"name",
			"description",
			"captain",
			"members"
		];
		/** Keys a shared slot may carry. */
		const SLOT_KEYS = [
			"name",
			"description",
			"systemPrompt",
			"color"
		];
		/** Internal refusal carrying the reason the document was rejected. */
		var Refused = class extends Error {
			reason;
			/**
			* @param reason - why the document is not a Team preset of this format.
			*/
			constructor(reason) {
				super(reason);
				this.reason = reason;
				this.name = "Refused";
			}
		};
		/**
		* Whether one parsed value is a plain JSON object.
		* @param value - candidate value.
		* @returns whether the value is a non-null, non-array object.
		*/
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Whether one record carries a key outside the allowed set.
		* @param value - record to inspect.
		* @param allowed - keys this format declares.
		* @returns whether at least one key is not part of the format.
		*/
		function hasUnknownKey(value, allowed) {
			return Object.keys(value).some((key) => !allowed.includes(key));
		}
		/**
		* Read one required string field.
		* @param value - record to read.
		* @param key - field name.
		* @returns the field's text, or undefined when it is absent or not a string.
		*/
		function readText(value, key) {
			const field = value[key];
			return typeof field === "string" ? field : void 0;
		}
		/**
		* Read one shared slot.
		* @param value - candidate slot.
		* @returns the slot's shareable fields.
		* @throws {Refused} when the value is not a slot of this format.
		*/
		function readSlot(value) {
			if (!isRecord(value)) throw new Refused("invalid-format");
			if (hasUnknownKey(value, SLOT_KEYS)) throw new Refused("unsupported-fields");
			const name = readText(value, "name");
			const description = readText(value, "description");
			const systemPrompt = readText(value, "systemPrompt");
			const color = readText(value, "color");
			if (name === void 0 || description === void 0 || systemPrompt === void 0 || color === void 0) throw new Refused("invalid-format");
			return {
				name,
				description,
				systemPrompt,
				color
			};
		}
		/**
		* Read the members of one shared Team, refusing a repeated name.
		*
		* Two members under one name would derive the same teammate target, so the
		* document is refused instead of importing a Team whose second member can never
		* be summoned by name.
		* @param value - candidate member list.
		* @returns the members, in declared order.
		* @throws {Refused} when the list is malformed or repeats a name.
		*/
		function readMembers(value) {
			if (!Array.isArray(value)) throw new Refused("invalid-format");
			if (value.length > 64) throw new Refused("too-many-members");
			const members = value.map((member) => readSlot(member));
			const seen = /* @__PURE__ */ new Set();
			for (const member of members) {
				const key = slotNameKey(member.name);
				if (key === "") continue;
				if (seen.has(key)) throw new Refused("duplicate-members");
				seen.add(key);
			}
			return members;
		}
		/**
		* Read one shared Team.
		* @param value - candidate Team.
		* @returns the Team's shareable content.
		* @throws {Refused} when the value is not a Team of this format.
		*/
		function readTeam(value) {
			if (!isRecord(value)) throw new Refused("invalid-format");
			if (hasUnknownKey(value, TEAM_KEYS)) throw new Refused("unsupported-fields");
			const name = readText(value, "name");
			const description = readText(value, "description");
			if (name === void 0 || description === void 0) throw new Refused("invalid-format");
			return {
				name,
				description,
				captain: readSlot(value["captain"]),
				members: readMembers(value["members"])
			};
		}
		/**
		* Read one parsed document.
		* @param value - candidate document.
		* @returns the document, or the reason it is not a Team preset of this format.
		* @throws when a failure other than a refusal escapes the reader.
		*/
		function readTransfer(value) {
			if (!isRecord(value)) throw new Refused("invalid-format");
			if (hasUnknownKey(value, ROOT_KEYS)) throw new Refused("unsupported-fields");
			if (value["format"] !== "dsh-agent-team-preset") throw new Refused("invalid-format");
			const version = value["version"];
			if (typeof version !== "number" || !Number.isInteger(version)) throw new Refused("invalid-format");
			if (version !== 1) throw new Refused("unsupported-version");
			return {
				format: TEAM_PRESET_FORMAT,
				version: 1,
				team: readTeam(value["team"])
			};
		}
		/**
		* Read one already-parsed document.
		* @param value - candidate document.
		* @returns the document, or the reason it is not a Team preset of this format.
		*/
		function parseTeamPresetValue(value) {
			try {
				return {
					ok: true,
					transfer: readTransfer(value)
				};
			} catch (error) {
				if (error instanceof Refused) return {
					ok: false,
					reason: error.reason
				};
				throw error;
			}
		}
		/**
		* Read one shared document from its JSON text.
		* @param text - the document text.
		* @returns the document, or the reason it is not a Team preset of this format.
		*/
		function parseTeamPresetText(text) {
			if (text.length > 524288) return {
				ok: false,
				reason: "too-large"
			};
			let value;
			try {
				value = JSON.parse(text);
			} catch {
				return {
					ok: false,
					reason: "invalid-json"
				};
			}
			return parseTeamPresetValue(value);
		}
		/**
		* Compare two slot names the way the runtime matches a summoned member.
		*
		* `findMember` accepts a member's derived target or its display name, and the
		* target is the lower-kebab-case form of the name, so two names that differ
		* only by case or surrounding space address the same teammate.
		* @param name - one configured or shared name.
		* @returns the comparison key of that name.
		*/
		function slotNameKey(name) {
			return name.trim().toLowerCase();
		}
		/**
		* Derive a name that is not already taken.
		* @param base - the preferred name.
		* @param taken - names already used in the same scope.
		* @returns the preferred name, or that name with the first free numeric suffix.
		*/
		function uniqueName(base, taken) {
			const preferred = base.trim();
			const used = new Set([...taken].map((name) => name.trim()));
			if (preferred === "" || !used.has(preferred)) return preferred;
			let suffix = 2;
			while (used.has(`${preferred} ${String(suffix)}`)) suffix += 1;
			return `${preferred} ${String(suffix)}`;
		}
		/**
		* Project one slot onto the fields a shared document carries.
		* @param slot - the configured captain or member.
		* @returns the slot's shareable fields.
		*/
		function shareSlot(slot) {
			return {
				name: slot.name,
				description: slot.description,
				systemPrompt: slot.systemPrompt,
				color: slot.color
			};
		}
		/**
		* Project one Team onto the document that shares it.
		* @param team - the Team preset to share.
		* @returns the shareable document.
		*/
		function exportTeamPreset(team) {
			return {
				format: TEAM_PRESET_FORMAT,
				version: 1,
				team: {
					name: team.name,
					description: team.description,
					captain: shareSlot(team.captain),
					members: team.members.map((member) => shareSlot(member))
				}
			};
		}
		/**
		* Serialize one Team as the fixed document this plugin imports.
		* @param team - the Team preset to share.
		* @returns the document text, newline-terminated.
		*/
		function serializeTeamPreset(team) {
			return `${JSON.stringify(exportTeamPreset(team), null, 2)}\n`;
		}
		/**
		* Build one captain from a shared slot.
		* @param slot - the shared captain.
		* @returns a captain carrying the shared fields and the local defaults.
		*/
		function captainFromTransfer(slot) {
			return {
				name: slot.name,
				color: slot.color,
				description: slot.description,
				toolMode: "all",
				tools: [],
				systemPrompt: slot.systemPrompt
			};
		}
		/**
		* Build one member from a shared slot.
		* @param slot - the shared member.
		* @returns a member carrying the shared fields, no route, and the default tool policy.
		*/
		function memberFromTransfer(slot) {
			return {
				...captainFromTransfer(slot),
				provider: "",
				model: "",
				reasoningEffort: ""
			};
		}
		/**
		* Overwrite the fields one shared slot carries, keeping every local field.
		*
		* This is what makes a replacement non-destructive: the imported name,
		* description, prompt, and color land, while the route and tool policy the
		* deployment already configured stay exactly as they were.
		* @param slot - the configured captain or member being overwritten.
		* @param shared - the document's version of that slot.
		* @returns a slot carrying the shared fields and the original local ones.
		*/
		function applySharedFields(slot, shared) {
			return {
				...slot,
				name: shared.name,
				description: shared.description,
				systemPrompt: shared.systemPrompt,
				color: shared.color
			};
		}
		/**
		* Build one local Team from a shared document.
		*
		* Everything the document does not carry starts empty: routes follow the
		* Session and the tool policy stays unrestricted, so an imported Team never
		* inherits a route or an allow-list from the document it came from.
		* @param transfer - the document to import.
		* @param id - the local identity the imported Team takes.
		* @returns a new Team preset carrying the document's shareable content.
		*/
		function teamFromTransfer(transfer, id) {
			return {
				id,
				name: transfer.team.name,
				description: transfer.team.description,
				captain: captainFromTransfer(transfer.team.captain),
				members: transfer.team.members.map((member) => memberFromTransfer(member))
			};
		}
		/**
		* Find what one document collides with in the configured Teams.
		*
		* Every key is compared inside the Team the document would overwrite: a Team by
		* its name, and its captain and members by theirs. A name only reaches this
		* check when the two Teams are the same one, because replacing a captain or a
		* member of some *other* Team is not an edit the import may make. An unnamed
		* slot never collides: it is addressed by position, not by name.
		* @param teams - every Team the page currently shows.
		* @param transfer - the document being imported.
		* @returns the colliding Team, its conflicting agent names, and free replacement names.
		*/
		function importConflicts(teams, transfer) {
			const key = slotNameKey(transfer.team.name);
			const targetIndex = key === "" ? -1 : teams.findIndex((team) => slotNameKey(team.name) === key);
			const target = targetIndex < 0 ? void 0 : teams[targetIndex];
			const captainKey = slotNameKey(transfer.team.captain.name);
			const captainConflict = target !== void 0 && captainKey !== "" && slotNameKey(target.captain.name) === captainKey ? transfer.team.captain.name : "";
			const used = target === void 0 ? void 0 : new Set(target.members.map((member) => slotNameKey(member.name)).filter((memberKey) => memberKey !== ""));
			const memberConflicts = used === void 0 ? [] : transfer.team.members.filter((member) => used.has(slotNameKey(member.name))).map((member) => member.name);
			return {
				targetIndex: target === void 0 ? void 0 : targetIndex,
				targetName: target?.name.trim() ?? "",
				captainConflict,
				memberConflicts,
				suggestedTeamName: uniqueName(transfer.team.name, teams.map((team) => team.name)),
				suggestedCaptainName: uniqueName(transfer.team.captain.name, target === void 0 ? [] : [target.captain.name])
			};
		}
		//#endregion
		//#region src/client/team-presets-controller.ts
		/**
		* Loader entry id of the Host row that owns the Team preset namespace. Spelled
		* here rather than imported: a client package must not depend on a Host package.
		*/
		const TEAM_PRESETS_NS = "agent-team-presets";
		/** Colors offered for a member's accent mark. */
		const AGENT_COLORS = [
			"#4c8dff",
			"#2fbf71",
			"#e0a43c",
			"#e05c6b",
			"#8d6bff",
			"#25b0c4",
			"#c46bd0",
			"#8a94a6"
		];
		/**
		* The resolution one document needs when the user was asked nothing.
		* @param plan - the inspection of the document.
		* @returns the resolution that adds the document as a new Team.
		*/
		function defaultImportResolution(plan) {
			return {
				team: plan.targetIndex === void 0 ? "rename" : "replace",
				teamName: plan.suggestedTeamName,
				captain: "replace",
				members: {}
			};
		}
		/**
		* Overwrite the fields one document carries on the Team it targets.
		*
		* The document wins for the Team's name, purpose, and every agent's shared
		* fields; every field the format does not carry — a member's route and each
		* agent's tool policy — stays exactly as it was. A document member the target
		* does not name is appended, and a target member the document does not mention
		* is kept, so an import never deletes work the document cannot describe.
		* @param target - the configured Team being overwritten.
		* @param plan - the inspection carrying the document and its free replacement names.
		* @param resolution - the choices made for the captain and each colliding member.
		* @returns the overwritten Team, keeping the target's local identity.
		*/
		function mergeTransfer(target, plan, resolution) {
			const members = [...target.members];
			for (const incoming of plan.transfer.team.members) {
				const key = slotNameKey(incoming.name);
				const at = key === "" ? -1 : members.findIndex((member) => slotNameKey(member.name) === key);
				if (at >= 0 && (resolution.members[incoming.name] ?? "replace") === "replace") {
					const existing = members[at];
					if (existing !== void 0) {
						members[at] = applySharedFields(existing, incoming);
						continue;
					}
				}
				const name = uniqueName(incoming.name, members.map((member) => member.name));
				members.push(memberFromTransfer({
					...incoming,
					name
				}));
			}
			const captain = plan.transfer.team.captain;
			const captainName = resolution.captain === "rename" ? plan.suggestedCaptainName : captain.name;
			return {
				id: target.id,
				name: plan.transfer.team.name,
				description: plan.transfer.team.description,
				captain: applySharedFields(target.captain, {
					...captain,
					name: captainName
				}),
				members
			};
		}
		const EMPTY = {
			teams: [],
			selections: []
		};
		/**
		* Convert one staged member into the JSON value a settings write carries.
		* @param agent - the staged member.
		* @returns the mutable JSON record the settings document stores.
		*/
		function agentJson(agent) {
			return {
				name: agent.name,
				color: agent.color,
				description: agent.description,
				provider: agent.provider,
				model: agent.model,
				reasoningEffort: agent.reasoningEffort,
				toolMode: toolMode(agent),
				tools: [...agent.tools],
				systemPrompt: agent.systemPrompt
			};
		}
		/**
		* Convert one staged captain into the JSON value a settings write carries.
		*
		* A captain leads on the model the Session already selected, so the write never
		* restates a route: dropping those members here is what removes them from the
		* stored document.
		* @param captain - the staged captain.
		* @returns the mutable JSON record the settings document stores.
		*/
		function captainJson(captain) {
			return {
				name: captain.name,
				color: captain.color,
				description: captain.description,
				toolMode: toolMode(captain),
				tools: [...captain.tools],
				systemPrompt: captain.systemPrompt
			};
		}
		/**
		* Convert one staged Team into the JSON value a settings write carries.
		* @param team - the staged Team preset.
		* @returns the mutable JSON record the settings document stores.
		*/
		function teamJson(team) {
			return {
				id: team.id,
				name: team.name,
				description: team.description,
				captain: captainJson(team.captain),
				members: team.members.map((member) => agentJson(member))
			};
		}
		/**
		* Create an empty Team preset with a unique identity.
		* @param existing - Teams already configured.
		* @returns a new, unnamed Team preset.
		*/
		function createTeamPreset(existing) {
			let index = existing.length + 1;
			let id = `team-${index}`;
			while (existing.some((team) => team.id === id)) {
				index += 1;
				id = `team-${index}`;
			}
			return {
				id,
				name: "",
				description: "",
				captain: emptyCaptainPreset(),
				members: []
			};
		}
		/**
		* Create an empty captain preset.
		* @returns the empty captain every new Team starts from.
		*/
		function emptyCaptainPreset() {
			return {
				name: "",
				color: "",
				description: "",
				toolMode: "all",
				tools: [],
				systemPrompt: ""
			};
		}
		/**
		* Create an empty member preset.
		* @returns the empty preset every new member starts from.
		*/
		function emptyAgentPreset() {
			return {
				...emptyCaptainPreset(),
				provider: "",
				model: "",
				reasoningEffort: ""
			};
		}
		/** Owns the page's staged edits and the composer's immediate selection writes. */
		var TeamPresetsController = class {
			ctx;
			/** Observable page state the slot registrations expose to their components. */
			store;
			form;
			unsubscribe;
			draft;
			draftRevision;
			providers = [];
			catalogue = "idle";
			cataloguePartial = false;
			catalogueLoading = false;
			catalogueGeneration = 0;
			tools = [];
			toolCatalogue = "idle";
			toolCatalogueLoading = false;
			disposed = false;
			/**
			* @param ctx - the browser plugin context providing the shared configuration forms.
			*/
			constructor(ctx) {
				this.ctx = ctx;
				this.form = ctx.configForms.get(TEAM_PRESETS_NS);
				this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(this.projection());
				this.unsubscribe = this.form.subscribe(() => {
					this.publish();
				});
			}
			/** Release the form subscription. */
			dispose() {
				this.disposed = true;
				this.unsubscribe();
			}
			projection() {
				const snapshot = this.form.getSnapshot();
				const stored = snapshot.value ?? EMPTY;
				return {
					status: snapshot.status === "ready" ? "ready" : snapshot.status === "loading" ? "loading" : "unavailable",
					writable: snapshot.writable,
					saving: false,
					failed: false,
					teams: this.visibleTeams(),
					selections: stored.selections,
					dirty: this.draft !== void 0,
					providers: this.providers,
					catalogue: this.catalogue,
					cataloguePartial: this.cataloguePartial,
					tools: this.tools,
					toolCatalogue: this.toolCatalogue
				};
			}
			publish(patch = {}) {
				if (this.disposed) return;
				this.store.set({
					...this.projection(),
					...patch
				});
			}
			/**
			* The Teams the page currently shows.
			*
			* A draft shadows the stored value while one is open, so an export and an
			* import both see exactly what the user sees.
			* @returns the staged Teams, or the stored ones while nothing is staged.
			*/
			visibleTeams() {
				return this.draft ?? this.form.getSnapshot().value?.teams ?? [];
			}
			/**
			* The business face both slot registrations inject.
			* @returns the state store and the page and composer callbacks.
			*/
			inject() {
				return {
					hooks: { teamPresets: this.store },
					createTeam: () => this.createTeam(),
					duplicateTeam: (index) => this.duplicateTeam(index),
					exportTeam: (index) => this.exportTeam(index),
					inspectImport: (text) => this.inspectImport(text),
					applyImport: (plan, resolution) => {
						return this.applyImport(plan, resolution);
					},
					removeTeam: (index) => {
						this.removeTeam(index);
					},
					addMember: (teamIndex) => {
						this.addMember(teamIndex);
					},
					removeMember: (teamIndex, memberIndex) => {
						this.removeMember(teamIndex, memberIndex);
					},
					patchTeam: (index, patch) => {
						this.patchTeam(index, patch);
					},
					patchCaptain: (teamIndex, patch) => {
						this.patchCaptain(teamIndex, patch);
					},
					patchMember: (teamIndex, memberIndex, patch) => {
						this.patchMember(teamIndex, memberIndex, patch);
					},
					save: () => this.save(),
					discard: () => {
						this.discard();
					},
					selectTeam: (sessionId, teamId) => this.selectTeam(sessionId, teamId),
					loadCatalogue: () => {
						this.loadCatalogue();
					},
					refreshCatalogue: () => {
						this.refreshCatalogue();
					}
				};
			}
			/** Read the provider/model catalogue and the tool catalogue the pickers render. */
			loadCatalogue() {
				this.loadModelCatalogue();
				this.loadToolCatalogue();
			}
			/**
			* Discard both catalogues and read them again from the Host.
			*
			* The Host catalogue is not part of any settings section: adapters,
			* credentials, and other settings documents change which routes exist, and a
			* provider may simply have been unavailable when this plugin mounted. Every
			* caller therefore asks for a fresh read instead of reusing the one already
			* held, and an answer still in flight is fenced out by
			* {@link catalogueGeneration} so it cannot overwrite the newer one.
			*/
			refreshCatalogue() {
				if (this.disposed) return;
				this.catalogueGeneration += 1;
				this.catalogueLoading = false;
				this.catalogue = "idle";
				this.cataloguePartial = false;
				this.toolCatalogueLoading = false;
				this.toolCatalogue = "idle";
				this.publish();
				this.loadCatalogue();
			}
			/**
			* Whether one catalogue answer still belongs to the current read.
			* @param generation - the read generation captured when the request started.
			* @returns whether the answer may be published.
			*/
			acceptsCatalogue(generation) {
				return !this.disposed && generation === this.catalogueGeneration;
			}
			loadModelCatalogue() {
				if (this.catalogueLoading || this.catalogue === "ready") return;
				const generation = this.catalogueGeneration;
				this.catalogueLoading = true;
				this.catalogue = "loading";
				this.publish();
				this.ctx.remote.session.modelCatalog().then((result) => {
					if (!this.acceptsCatalogue(generation)) return;
					if (!result.ok) throw new Error(result.error.message);
					this.providers = result.value.groups.map((group) => describeGroup(group));
					this.cataloguePartial = result.value.failures.length > 0;
					this.catalogue = "ready";
					this.catalogueLoading = false;
					this.publish();
				}).catch(() => {
					if (!this.acceptsCatalogue(generation)) return;
					this.catalogue = "error";
					this.catalogueLoading = false;
					this.publish();
				});
			}
			loadToolCatalogue() {
				if (this.toolCatalogueLoading || this.toolCatalogue === "ready") return;
				const generation = this.catalogueGeneration;
				this.toolCatalogueLoading = true;
				this.toolCatalogue = "loading";
				this.publish();
				this.ctx.remote.teamPresets.catalog().then((result) => {
					if (!this.acceptsCatalogue(generation)) return;
					if (!result.ok) throw new Error(result.error.message);
					this.tools = result.value.tools.map((tool) => ({
						name: tool.name,
						description: tool.description
					}));
					this.toolCatalogue = "ready";
					this.toolCatalogueLoading = false;
					this.publish();
				}).catch(() => {
					if (!this.acceptsCatalogue(generation)) return;
					this.toolCatalogue = "error";
					this.toolCatalogueLoading = false;
					this.publish();
				});
			}
			/**
			* Open the staged draft from the stored Teams.
			*
			* The published snapshot is deep-frozen outside production, so every edit
			* rebuilds the array and the touched record instead of mutating either.
			* @returns the current staged Teams.
			*/
			beginDraft() {
				if (this.draft === void 0) {
					const snapshot = this.form.getSnapshot();
					this.draft = structuredClone(snapshot.value?.teams ?? []);
					this.draftRevision = snapshot.revision;
				}
				return this.draft;
			}
			/**
			* Replace one Team record and publish.
			* @param index - the Team position to replace.
			* @param next - the replacement record.
			*/
			replaceTeam(index, next) {
				const draft = this.beginDraft();
				/* v8 ignore next -- every caller checks the staged position before delegating. */
				if (draft[index] === void 0) return;
				this.draft = draft.map((team, position) => position === index ? next : team);
				this.publish();
			}
			/**
			* Append a new Team and open it.
			* @returns the new Team's identity.
			*/
			createTeam() {
				const draft = this.beginDraft();
				const created = createTeamPreset(draft);
				this.draft = [...draft, created];
				this.publish();
				return created.id;
			}
			/**
			* Copy one Team under a new identity.
			* @param index - the Team to copy.
			* @returns the copy's identity, or undefined for an unknown position.
			*/
			duplicateTeam(index) {
				const draft = this.beginDraft();
				const source = draft[index];
				if (source === void 0) return void 0;
				const copy = {
					...structuredClone(source),
					id: createTeamPreset(draft).id,
					name: source.name === "" ? "" : `${source.name} copy`
				};
				this.draft = [
					...draft.slice(0, index + 1),
					copy,
					...draft.slice(index + 1)
				];
				this.publish();
				return copy.id;
			}
			/**
			* Serialize one Team as the fixed shareable document.
			* @param index - the Team position to export.
			* @returns the document text, or undefined for a position the page does not show.
			*/
			exportTeam(index) {
				const team = this.visibleTeams()[index];
				return team === void 0 ? void 0 : serializeTeamPreset(team);
			}
			/**
			* Read one document and work out what importing it would collide with.
			*
			* Nothing is staged here: the caller decides whether the plan needs the user's
			* answer before {@link applyImport} touches the draft.
			* @param text - the document text the user chose.
			* @returns the plan, or the reason the document is not a Team preset of this format.
			*/
			inspectImport(text) {
				const parsed = parseTeamPresetText(text);
				if (!parsed.ok) return parsed;
				return {
					ok: true,
					plan: {
						transfer: parsed.transfer,
						...importConflicts(this.visibleTeams(), parsed.transfer)
					}
				};
			}
			/**
			* Stage one inspected document onto the draft.
			*
			* The document carries no identity, so it either overwrites the Team it is
			* named after — keeping that Team's local id, routes, and tool policies — or
			* joins the draft as a new Team under the resolved name.
			* @param plan - the inspection produced by {@link inspectImport}.
			* @param resolution - the user's answer for every collision in the plan.
			* @returns the identity of the staged Team.
			*/
			applyImport(plan, resolution) {
				const draft = this.beginDraft();
				const target = plan.targetIndex === void 0 ? void 0 : draft[plan.targetIndex];
				if (resolution.team === "replace" && target !== void 0) {
					const merged = mergeTransfer(target, plan, resolution);
					this.draft = draft.map((team, position) => position === plan.targetIndex ? merged : team);
					this.publish();
					return target.id;
				}
				const name = uniqueName(resolution.teamName.trim() === "" ? plan.transfer.team.name : resolution.teamName, draft.map((team) => team.name));
				const created = {
					...teamFromTransfer(plan.transfer, createTeamPreset(draft).id),
					name
				};
				this.draft = [...draft, created];
				this.publish();
				return created.id;
			}
			/**
			* Delete one Team.
			* @param index - the Team to delete.
			*/
			removeTeam(index) {
				const draft = this.beginDraft();
				this.draft = draft.filter((_, position) => position !== index);
				this.publish();
			}
			/**
			* Replace fields of one Team.
			* @param index - the Team to patch.
			* @param patch - the changed fields.
			*/
			patchTeam(index, patch) {
				const current = this.beginDraft()[index];
				if (current === void 0) return;
				this.replaceTeam(index, {
					...current,
					...patch
				});
			}
			/**
			* Replace fields of one Team's captain.
			* @param teamIndex - the Team whose captain changes.
			* @param patch - the changed fields.
			*/
			patchCaptain(teamIndex, patch) {
				const current = this.beginDraft()[teamIndex];
				if (current === void 0) return;
				this.replaceTeam(teamIndex, {
					...current,
					captain: {
						...current.captain,
						...patch
					}
				});
			}
			/**
			* Replace fields of one member.
			* @param teamIndex - the Team that owns the member.
			* @param memberIndex - the member position.
			* @param patch - the changed fields.
			*/
			patchMember(teamIndex, memberIndex, patch) {
				const team = this.beginDraft()[teamIndex];
				const member = team?.members[memberIndex];
				if (team === void 0 || member === void 0) return;
				this.replaceTeam(teamIndex, {
					...team,
					members: team.members.map((entry, position) => position === memberIndex ? {
						...entry,
						...patch
					} : entry)
				});
			}
			/**
			* Append an empty member to one Team.
			* @param teamIndex - the Team that gains a member.
			*/
			addMember(teamIndex) {
				const team = this.beginDraft()[teamIndex];
				if (team === void 0) return;
				this.replaceTeam(teamIndex, {
					...team,
					members: [...team.members, emptyAgentPreset()]
				});
			}
			/**
			* Remove one member from a Team.
			* @param teamIndex - the Team that owns the member.
			* @param memberIndex - the member position.
			*/
			removeMember(teamIndex, memberIndex) {
				const team = this.beginDraft()[teamIndex];
				if (team === void 0) return;
				this.replaceTeam(teamIndex, {
					...team,
					members: team.members.filter((_, position) => position !== memberIndex)
				});
			}
			/** Write the staged Teams. */
			async save() {
				const snapshot = this.form.getSnapshot();
				if (this.draft === void 0 || snapshot.status !== "ready" || !snapshot.writable) return;
				const draft = this.draft;
				const revision = this.draftRevision;
				this.publish({
					saving: true,
					failed: false
				});
				const landed = await this.form.mutate([{
					op: "set",
					path: ["teams"],
					value: draft.map((team) => teamJson(team))
				}], revision);
				if (this.disposed) return;
				if (landed) {
					this.draft = void 0;
					this.draftRevision = void 0;
				}
				this.publish({
					saving: false,
					failed: !landed
				});
			}
			/** Drop every staged edit. */
			discard() {
				if (this.draft === void 0) return;
				this.draft = void 0;
				this.draftRevision = void 0;
				this.publish();
			}
			/**
			* Apply one Team to a Session, or clear its Team.
			* @param sessionId - the Session whose Team changes.
			* @param teamId - the selected Team identity; undefined clears the selection.
			* @returns once the write settled.
			*/
			async selectTeam(sessionId, teamId) {
				const snapshot = this.form.getSnapshot();
				if (snapshot.status !== "ready" || !snapshot.writable) return;
				const next = withSelection((snapshot.value ?? EMPTY).selections, sessionId, teamId);
				await this.form.mutate([{
					op: "set",
					path: ["selections"],
					value: next.map((record) => ({
						sessionId: record.sessionId,
						teamId: record.teamId
					}))
				}]);
			}
		};
		/** Narrow one catalogue group into picker choices. */
		function describeGroup(group) {
			return {
				id: group.id,
				name: group.name,
				models: group.models.map((model) => ({
					id: model.id,
					name: model.name,
					efforts: (model.reasoning?.efforts ?? []).map((effort) => ({
						id: effort.id,
						name: effort.name
					}))
				}))
			};
		}
		//#endregion
		//#region \0dsh-css:src/client/TeamPresetsSection.module.css.mjs
		const css = ".OpmNGG_section{min-height:100%;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}.OpmNGG_page{flex-direction:column;gap:10px;max-width:520px;padding-bottom:8px;display:flex}.OpmNGG_pageHead{flex-direction:column;gap:2px;display:flex}.OpmNGG_crumb{color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:none;align-self:flex-start;align-items:center;gap:4px;padding:0;font-size:12px;line-height:18px;display:inline-flex}.OpmNGG_crumb:hover{color:var(--dsw-alias-label-primary)}.OpmNGG_title{margin:0;font-size:15px;font-weight:500;line-height:22px}.OpmNGG_intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}.OpmNGG_empty{color:var(--dsw-alias-label-tertiary);margin:4px 0;font-size:12px;line-height:18px}.OpmNGG_sectionTitle{color:var(--dsw-alias-label-secondary);padding-top:2px;font-size:12px;line-height:18px}.OpmNGG_actionRow{gap:8px;display:flex}.OpmNGG_fileInput{display:none}.OpmNGG_conflict{flex-direction:column;gap:6px;display:flex}.OpmNGG_conflict+.OpmNGG_conflict{margin-top:16px}.OpmNGG_conflictLead{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.OpmNGG_conflictName{overflow-wrap:anywhere;font-size:13px;font-weight:500;line-height:18px}.OpmNGG_conflictMember{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 12px;display:flex}.OpmNGG_choiceRow{flex-wrap:wrap;gap:12px;display:flex}.OpmNGG_choice{cursor:pointer;align-items:center;gap:6px;font-size:12px;line-height:18px;display:inline-flex}.OpmNGG_card{border:.5px solid var(--dsw-alias-settings-card-stroke);background:var(--dsw-alias-settings-card-fill);border-radius:var(--dsw-radius-xl);flex-direction:column;gap:10px;padding:10px 12px;display:flex}.OpmNGG_cardHead{justify-content:space-between;align-items:center;gap:8px;display:flex}.OpmNGG_cardTitle{font-size:13px;font-weight:500;line-height:20px}.OpmNGG_rows,.OpmNGG_plainRows{flex-direction:column;gap:8px;margin:0;padding:0;list-style:none;display:flex}.OpmNGG_rows>.OpmNGG_card{flex-direction:row;align-items:center;gap:4px;padding:6px 8px 6px 10px}.OpmNGG_entry{align-items:center;gap:4px;display:flex}.OpmNGG_entryRow,.OpmNGG_rowMain{min-width:0;color:inherit;font:inherit;text-align:left;border-radius:var(--dsw-radius-md);cursor:pointer;background:0 0;border:none;flex:auto;align-items:center;gap:8px;padding:4px 2px;display:flex}.OpmNGG_rowMain:hover,.OpmNGG_entryRow:hover{background:var(--dsw-alias-interactive-bg-hover)}.OpmNGG_rowText{flex-direction:column;flex:auto;min-width:0;display:flex}.OpmNGG_rowName{text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:18px;overflow:hidden}.OpmNGG_rowMeta{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px;overflow:hidden}.OpmNGG_rowActions{flex:none;gap:2px;display:flex}.OpmNGG_chevron{color:var(--dsw-alias-label-tertiary);flex:none;font-size:14px;line-height:18px}.OpmNGG_dot{background:var(--dsw-alias-label-tertiary);border-radius:50%;flex:none;width:10px;height:10px}.OpmNGG_field{flex-direction:column;gap:4px;min-width:0;display:flex}.OpmNGG_fieldLabel{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.OpmNGG_input{width:100%}.OpmNGG_toolGrid{grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:10px 12px;min-width:0;display:grid}.OpmNGG_toolCheckbox{align-items:flex-start;min-width:0}.OpmNGG_toolCheckbox>span{overflow-wrap:anywhere}.OpmNGG_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:11px;line-height:17px}.OpmNGG_warn{color:var(--dsw-alias-state-warn-label);margin:0;font-size:11px;line-height:17px}.OpmNGG_select{border-radius:var(--dsw-radius-lg);border:.5px solid var(--dsw-alias-settings-card-stroke);background:var(--dsw-alias-bg-base);width:100%;height:30px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;justify-content:space-between;align-items:center;gap:6px;padding:0 8px;font-size:12px;display:flex}.OpmNGG_select:disabled{opacity:.5;cursor:default}.OpmNGG_selectLabel{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.OpmNGG_prompt{box-sizing:border-box;border-radius:var(--dsw-radius-lg);border:.5px solid var(--dsw-alias-settings-card-stroke);background:var(--dsw-alias-bg-base);width:100%;color:var(--dsw-alias-label-primary);font:inherit;resize:vertical;padding:8px;font-size:12px;line-height:18px}.OpmNGG_prompt:disabled{opacity:.6}.OpmNGG_swatches{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.OpmNGG_swatch,.OpmNGG_swatchNone{border:.5px solid var(--dsw-alias-settings-card-stroke);cursor:pointer;border-radius:50%;width:18px;height:18px;padding:0}.OpmNGG_swatch[aria-pressed=true],.OpmNGG_swatchNone[aria-pressed=true]{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px}.OpmNGG_swatchNone{background:var(--dsw-alias-bg-base)}.OpmNGG_footer{background:var(--dsw-alias-bg-base);justify-content:flex-end;align-items:center;gap:10px;margin-top:auto;padding:8px 0 4px;display:flex;position:sticky;bottom:0}.OpmNGG_footerNote{color:var(--dsw-alias-label-tertiary);margin-right:auto;font-size:11px;line-height:17px}";
		const tagId = "dsh-agent-team-presets/TeamPresetsSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-agent-team-presets";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var TeamPresetsSection_module_css_default = {
			"actionRow": "OpmNGG_actionRow",
			"card": "OpmNGG_card",
			"cardHead": "OpmNGG_cardHead",
			"cardTitle": "OpmNGG_cardTitle",
			"chevron": "OpmNGG_chevron",
			"choice": "OpmNGG_choice",
			"choiceRow": "OpmNGG_choiceRow",
			"conflict": "OpmNGG_conflict",
			"conflictLead": "OpmNGG_conflictLead",
			"conflictMember": "OpmNGG_conflictMember",
			"conflictName": "OpmNGG_conflictName",
			"crumb": "OpmNGG_crumb",
			"dot": "OpmNGG_dot",
			"empty": "OpmNGG_empty",
			"entry": "OpmNGG_entry",
			"entryRow": "OpmNGG_entryRow",
			"field": "OpmNGG_field",
			"fieldLabel": "OpmNGG_fieldLabel",
			"fileInput": "OpmNGG_fileInput",
			"footer": "OpmNGG_footer",
			"footerNote": "OpmNGG_footerNote",
			"hint": "OpmNGG_hint",
			"input": "OpmNGG_input",
			"intro": "OpmNGG_intro",
			"page": "OpmNGG_page",
			"pageHead": "OpmNGG_pageHead",
			"plainRows": "OpmNGG_plainRows",
			"prompt": "OpmNGG_prompt",
			"rowActions": "OpmNGG_rowActions",
			"rowMain": "OpmNGG_rowMain",
			"rowMeta": "OpmNGG_rowMeta",
			"rowName": "OpmNGG_rowName",
			"rowText": "OpmNGG_rowText",
			"rows": "OpmNGG_rows",
			"section": "OpmNGG_section",
			"sectionTitle": "OpmNGG_sectionTitle",
			"select": "OpmNGG_select",
			"selectLabel": "OpmNGG_selectLabel",
			"swatch": "OpmNGG_swatch",
			"swatchNone": "OpmNGG_swatchNone",
			"swatches": "OpmNGG_swatches",
			"title": "OpmNGG_title",
			"toolCheckbox": "OpmNGG_toolCheckbox",
			"toolGrid": "OpmNGG_toolGrid",
			"warn": "OpmNGG_warn"
		};
		//#endregion
		//#region src/client/FieldPicker.tsx
		/**
		* The labelled dropdown one Team field renders: a full-width trigger button
		* plus a `Menu` of the choices it offers.
		*/
		/**
		* Render one labelled dropdown.
		* @param props - the field label, current value, choices, and write callback.
		* @returns the trigger and its menu.
		*/
		function FieldPicker(props) {
			const [open, setOpen] = (0, react.useState)(false);
			const current = props.options.find((option) => option.id === props.value) ?? props.options[0];
			const items = props.options.map((option) => ({
				id: option.id,
				label: option.label
			}));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: TeamPresetsSection_module_css_default.field,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: TeamPresetsSection_module_css_default.fieldLabel,
					children: props.label
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
					open,
					items,
					selectedId: props.value,
					onSelect: (id) => {
						setOpen(false);
						props.onChange(id);
					},
					onClose: () => {
						setOpen(false);
					},
					portal: true,
					anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TeamPresetsSection_module_css_default.select,
						disabled: props.disabled,
						"aria-haspopup": "listbox",
						"aria-expanded": open,
						onClick: () => {
							setOpen((value) => !value);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.selectLabel,
							children: current?.label ?? ""
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 14 })]
					})
				})]
			});
		}
		//#endregion
		//#region src/client/TeamAgentView.tsx
		/**
		* Third Team preset page: one captain or member, split into identity, model,
		* tools, and system prompt cards so a narrow Settings panel never crowds.
		*/
		/** Colors offered for one agent's accent mark. */
		const NO_COLOR = "";
		/**
		* Whether one edited slot owns a route.
		* @param agent - the captain or member being edited.
		* @returns whether the slot stores its own provider, model, and reasoning effort.
		*/
		function hasMemberRoute(agent) {
			return "provider" in agent;
		}
		/**
		* Render one agent's page.
		* @param props - the agent, its role, the catalogue, copy, and write callbacks.
		* @returns the back row and the four setting cards.
		*/
		function TeamAgentView(props) {
			const { agent, t, disabled } = props;
			const toolsReady = props.toolCatalogue === "ready";
			const mode = toolMode(agent);
			const customTools = mode === "custom";
			const unavailable = toolsReady ? agent.tools.filter((name) => !props.tools.some((tool) => tool.name === name)) : [];
			const toolChoices = props.tools.length === 0 ? agent.tools.map((name) => ({
				name,
				description: ""
			})) : props.tools;
			const modeOptions = [{
				id: "all",
				label: t("toolsDefault")
			}, {
				id: "custom",
				label: t("toolsCustom")
			}];
			const route = props.role === "member" && hasMemberRoute(agent) ? agent : void 0;
			const models = (route === void 0 ? void 0 : props.providers.find((entry) => entry.id === route.provider))?.models ?? [];
			const model = route === void 0 ? void 0 : models.find((entry) => entry.id === route.model);
			const providerOptions = [{
				id: "",
				label: t("routeInherit")
			}, ...props.providers.map((entry) => ({
				id: entry.id,
				label: entry.name
			}))];
			const modelOptions = [{
				id: "",
				label: t("routeInherit")
			}, ...models.map((entry) => ({
				id: entry.id,
				label: entry.name
			}))];
			const effortOptions = [{
				id: "",
				label: t("effortDefault")
			}, ...(model?.efforts ?? []).map((effort) => ({
				id: effort.id,
				label: effort.name
			}))];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: TeamPresetsSection_module_css_default.pageHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TeamPresetsSection_module_css_default.crumb,
						onClick: props.onBack,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								children: "‹"
							}),
							" ",
							props.teamName === "" ? t("back") : props.teamName
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h2", {
						className: TeamPresetsSection_module_css_default.title,
						children: [props.role === "captain" ? t("roleCaptain") : t("roleMember"), agent.name.trim() === "" ? "" : ` · ${agent.name.trim()}`]
					})]
				}),
				props.role === "captain" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.intro,
					children: t("captainHint")
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.cardTitle,
							children: t("identitySection")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: TeamPresetsSection_module_css_default.field,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.fieldLabel,
								children: t("agentName")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								className: TeamPresetsSection_module_css_default.input ?? "",
								value: agent.name,
								placeholder: t("agentNamePlaceholder"),
								disabled,
								onChange: (event) => {
									props.onChange({ name: event.target.value });
								}
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: TeamPresetsSection_module_css_default.field,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.fieldLabel,
								children: t("agentColor")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: TeamPresetsSection_module_css_default.swatches,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: TeamPresetsSection_module_css_default.swatchNone,
									"aria-label": t("effortDefault"),
									"aria-pressed": agent.color === NO_COLOR,
									disabled,
									onClick: () => {
										props.onChange({ color: NO_COLOR });
									}
								}), AGENT_COLORS.map((color) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: TeamPresetsSection_module_css_default.swatch,
									style: { background: color },
									"aria-label": color,
									"aria-pressed": agent.color === color,
									disabled,
									onClick: () => {
										props.onChange({ color });
									}
								}, color))]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: TeamPresetsSection_module_css_default.field,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.fieldLabel,
								children: t("agentDescription")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								className: TeamPresetsSection_module_css_default.input ?? "",
								value: agent.description,
								disabled,
								onChange: (event) => {
									props.onChange({ description: event.target.value });
								}
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.cardTitle,
							children: t("modelSection")
						}),
						route === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.hint,
							children: t("captainModelHint")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FieldPicker, {
								label: t("provider"),
								value: route.provider,
								options: providerOptions,
								disabled,
								onChange: (id) => {
									props.onChange({
										provider: id,
										model: id === "" ? "" : route.model,
										reasoningEffort: ""
									});
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FieldPicker, {
								label: t("model"),
								value: route.model,
								options: modelOptions,
								disabled: disabled || route.provider === "",
								onChange: (id) => {
									props.onChange({
										model: id,
										reasoningEffort: ""
									});
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FieldPicker, {
								label: t("effort"),
								value: route.reasoningEffort,
								options: effortOptions,
								disabled: disabled || route.model === "",
								onChange: (id) => {
									props.onChange({ reasoningEffort: id });
								}
							})
						] }),
						props.cataloguePartial ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.warn,
							role: "status",
							children: t("modelsPartial")
						}) : null
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.cardTitle,
							children: t("toolsSection")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FieldPicker, {
							label: t("toolMode"),
							value: mode,
							options: modeOptions,
							disabled,
							onChange: (id) => {
								props.onChange({ toolMode: id === "custom" ? "custom" : "all" });
							}
						}),
						customTools ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: TeamPresetsSection_module_css_default.cardHead,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.fieldLabel,
									children: t("tools")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: TeamPresetsSection_module_css_default.rowActions,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "ghost",
										disabled: disabled || !toolsReady || props.tools.length === 0,
										onClick: () => {
											props.onChange({ tools: props.tools.map((tool) => tool.name) });
										},
										children: t("toolsSelectAll")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "ghost",
										disabled: disabled || agent.tools.length === 0,
										onClick: () => {
											props.onChange({ tools: [] });
										},
										children: t("toolsClear")
									})]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: TeamPresetsSection_module_css_default.toolGrid,
								role: "group",
								"aria-label": t("tools"),
								children: toolChoices.map((tool) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Checkbox, {
									className: TeamPresetsSection_module_css_default.toolCheckbox,
									label: tool.name,
									title: tool.description,
									checked: agent.tools.includes(tool.name),
									disabled: disabled || !toolsReady && !agent.tools.includes(tool.name),
									onChange: (checked) => {
										props.onChange({ tools: checked ? [...agent.tools, tool.name] : agent.tools.filter((name) => name !== tool.name) });
									}
								}, tool.name))
							}),
							props.toolCatalogue === "loading" || props.toolCatalogue === "idle" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.hint,
								role: "status",
								children: t("toolsLoading")
							}) : props.toolCatalogue === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.warn,
								role: "status",
								children: t("toolsFailed")
							}) : props.tools.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.hint,
								children: t("toolsNoCatalog")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: agent.tools.length === 0 ? TeamPresetsSection_module_css_default.warn : TeamPresetsSection_module_css_default.hint,
								children: agent.tools.length === 0 ? t("toolsEmpty") : t("toolsHint")
							}),
							unavailable.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: TeamPresetsSection_module_css_default.field,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.warn,
									children: t("toolsUnavailable")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: TeamPresetsSection_module_css_default.plainRows,
									children: unavailable.map((name) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
										className: TeamPresetsSection_module_css_default.entry,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: TeamPresetsSection_module_css_default.rowName,
											children: name
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											size: "sm",
											variant: "ghost",
											disabled,
											onClick: () => {
												props.onChange({ tools: agent.tools.filter((entry) => entry !== name) });
											},
											children: t("toolsRemove")
										})]
									}, name))
								})]
							})
						] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.hint,
							children: t("toolsAllHint")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.hint,
							children: t("toolsScoped")
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: TeamPresetsSection_module_css_default.cardTitle,
						children: t("promptSection")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: TeamPresetsSection_module_css_default.field,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
							className: TeamPresetsSection_module_css_default.prompt,
							rows: 8,
							value: agent.systemPrompt,
							placeholder: t("systemPromptPlaceholder"),
							disabled,
							onChange: (event) => {
								props.onChange({ systemPrompt: event.target.value });
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: agent.systemPrompt.includes("{{") ? TeamPresetsSection_module_css_default.warn : TeamPresetsSection_module_css_default.hint,
							children: agent.systemPrompt.includes("{{") ? t("promptWarnBraces") : t("systemPromptHint")
						})]
					})]
				}),
				props.onDelete === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: TeamPresetsSection_module_css_default.actionRow,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						size: "sm",
						variant: "ghost",
						disabled,
						onClick: props.onDelete,
						children: t("deleteAgent")
					})
				})
			] });
		}
		//#endregion
		//#region src/client/TeamEditorView.tsx
		/**
		* Second Team preset page: one Team's own name, description, captain, and
		* member roster. Choosing the captain or a member opens that agent's page.
		*/
		/** Model caption of one configured agent slot. */
		function agentRoute(agent, providers) {
			if (agent.provider === "" || agent.model === "") return "";
			const provider = providers.find((entry) => entry.id === agent.provider);
			const model = provider?.models.find((entry) => entry.id === agent.model);
			return `${provider?.name ?? agent.provider} · ${model?.name ?? agent.model}`;
		}
		/**
		* Render one Team's page.
		* @param props - the Team, catalogue, copy, and navigation callbacks.
		* @returns the back row, the Team identity fields, and the roster.
		*/
		function TeamEditorView(props) {
			const { team, t, disabled } = props;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: TeamPresetsSection_module_css_default.pageHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TeamPresetsSection_module_css_default.crumb,
						onClick: props.onBack,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								children: "‹"
							}),
							" ",
							t("backToList")
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: TeamPresetsSection_module_css_default.title,
						children: team.name === "" ? team.id : team.name
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: TeamPresetsSection_module_css_default.field,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.fieldLabel,
							children: t("teamName")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
							className: TeamPresetsSection_module_css_default.input ?? "",
							value: team.name,
							placeholder: t("teamNamePlaceholder"),
							disabled,
							onChange: (event) => {
								props.onPatch({ name: event.target.value });
							}
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: TeamPresetsSection_module_css_default.field,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.fieldLabel,
							children: t("teamDescription")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
							className: TeamPresetsSection_module_css_default.input ?? "",
							value: team.description,
							disabled,
							onChange: (event) => {
								props.onPatch({ description: event.target.value });
							}
						})]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: TeamPresetsSection_module_css_default.sectionTitle,
					children: t("teamSections")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TeamPresetsSection_module_css_default.entryRow,
						onClick: () => {
							props.onOpenAgent("captain");
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.dot,
								style: team.captain.color === "" ? void 0 : { background: team.captain.color },
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: TeamPresetsSection_module_css_default.rowText,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: TeamPresetsSection_module_css_default.rowName,
									children: [t("roleCaptain"), team.captain.name.trim() === "" ? "" : ` · ${team.captain.name.trim()}`]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.rowMeta,
									children: t("captainFollowsSession")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.chevron,
								"aria-hidden": true,
								children: "›"
							})
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: TeamPresetsSection_module_css_default.hint,
						children: t("captainHint")
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: TeamPresetsSection_module_css_default.cardHead,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.cardTitle,
							children: t("members")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "outline",
							disabled,
							onClick: props.onAddMember,
							children: t("addMember")
						})]
					}), team.members.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: TeamPresetsSection_module_css_default.hint,
						children: t("emptyMembers")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: TeamPresetsSection_module_css_default.plainRows,
						children: team.members.map((member, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
							className: TeamPresetsSection_module_css_default.entry,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: TeamPresetsSection_module_css_default.entryRow,
								onClick: () => {
									props.onOpenAgent(index);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: TeamPresetsSection_module_css_default.dot,
										style: member.color === "" ? void 0 : { background: member.color },
										"aria-hidden": true
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: TeamPresetsSection_module_css_default.rowText,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: TeamPresetsSection_module_css_default.rowName,
											children: member.name.trim() === "" ? `${t("roleMember")} ${String(index + 1)}` : member.name.trim()
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: TeamPresetsSection_module_css_default.rowMeta,
											children: agentRoute(member, props.providers) || t("inheritSession")
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: TeamPresetsSection_module_css_default.chevron,
										"aria-hidden": true,
										children: "›"
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "ghost",
								disabled,
								onClick: () => {
									props.onRemoveMember(index);
								},
								children: t("removeMember")
							})]
						}, `${team.id}-member-${String(index)}`))
					})]
				})
			] });
		}
		//#endregion
		//#region src/client/TeamImportDialog.tsx
		/**
		* Conflict dialog for one Team import.
		*
		* The document's Team name, captain name, and member names are the keys an
		* import matches on, so each one that the target Team already uses is resolved
		* here: overwrite the configured agent, or add the imported one under a name
		* that is still free. Choosing a new Team name makes the whole document a new
		* Team, which is why the agent collisions disappear with that choice.
		*/
		/**
		* Render one pair of collision choices.
		* @param name - radio group name, unique across the dialog.
		* @param value - the current choice.
		* @param onChange - receives the picked choice.
		* @param labels - the two localized option labels.
		* @param autofocus - whether this group's first option takes initial focus.
		* @returns the two radio options.
		*/
		function choices(name, value, onChange, labels, autofocus = false) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: TeamPresetsSection_module_css_default.choiceRow,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
					className: TeamPresetsSection_module_css_default.choice,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "radio",
						name,
						checked: value === "replace",
						...autofocus ? { "data-modal-autofocus": true } : {},
						onChange: () => {
							onChange("replace");
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: labels.replace })]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
					className: TeamPresetsSection_module_css_default.choice,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "radio",
						name,
						checked: value === "rename",
						onChange: () => {
							onChange("rename");
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: labels.rename })]
				})]
			});
		}
		/**
		* Render the collision dialog for one import.
		* @param props - the plan, the page copy, and the two outcomes.
		* @returns the dialog; the caller mounts it only while an import is pending.
		*/
		function TeamImportDialog(props) {
			const { plan, t } = props;
			const [teamChoice, setTeamChoice] = (0, react.useState)("replace");
			const [teamName, setTeamName] = (0, react.useState)(plan.suggestedTeamName);
			const [captainChoice, setCaptainChoice] = (0, react.useState)("replace");
			const [memberChoices, setMemberChoices] = (0, react.useState)({});
			const memberChoice = (name) => memberChoices[name] ?? "replace";
			const agentCollisions = teamChoice === "replace" && (plan.captainConflict !== "" || plan.memberConflicts.length > 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				onClose: props.onCancel,
				title: t("importConflictTitle"),
				closeLabel: t("close"),
				footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					onClick: props.onCancel,
					children: t("cancel")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					onClick: () => {
						props.onConfirm({
							team: teamChoice,
							teamName,
							captain: captainChoice,
							members: Object.fromEntries(plan.memberConflicts.map((name) => [name, memberChoice(name)]))
						});
					},
					children: t("importConfirm")
				})] }),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.conflict,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.conflictLead,
							children: t("importTeamConflict")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.conflictName,
							children: plan.targetName
						}),
						choices("import-team", teamChoice, setTeamChoice, {
							replace: t("importTeamReplace"),
							rename: t("importTeamRename")
						}, true),
						teamChoice === "rename" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: TeamPresetsSection_module_css_default.field,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.fieldLabel,
								children: t("importNewTeamName")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								className: TeamPresetsSection_module_css_default.input ?? "",
								value: teamName,
								onChange: (event) => {
									setTeamName(event.target.value);
								}
							})]
						}) : null
					]
				}), !agentCollisions ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [plan.captainConflict === "" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.conflict,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.conflictLead,
							children: t("importCaptainConflict")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.conflictName,
							children: plan.captainConflict
						}),
						choices("import-captain", captainChoice, setCaptainChoice, {
							replace: t("importCaptainReplace"),
							rename: t("importCaptainRename")
						})
					]
				}), plan.memberConflicts.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.conflict,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: TeamPresetsSection_module_css_default.conflictLead,
						children: t("importMemberConflict")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: TeamPresetsSection_module_css_default.plainRows,
						children: plan.memberConflicts.map((name) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
							className: TeamPresetsSection_module_css_default.conflictMember,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.conflictName,
								children: name
							}), choices(`import-member-${name}`, memberChoice(name), (next) => {
								setMemberChoices((current) => ({
									...current,
									[name]: next
								}));
							}, {
								replace: t("importMemberReplace"),
								rename: t("importMemberRename")
							})]
						}, name))
					})]
				})] })]
			});
		}
		//#endregion
		//#region src/client/TeamListView.tsx
		/**
		* First Team preset page: every configured Team as one row. Choosing a row
		* opens that Team's own page.
		*/
		/**
		* Render the Team list.
		* @param props - the Teams, copy, and navigation callbacks.
		* @returns the header, the create and import actions, and one row per Team.
		*/
		function TeamListView(props) {
			const { t, disabled } = props;
			const fileInput = (0, react.useRef)(null);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: TeamPresetsSection_module_css_default.pageHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: TeamPresetsSection_module_css_default.title,
						children: t("title")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: TeamPresetsSection_module_css_default.intro,
						children: t("description")
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: TeamPresetsSection_module_css_default.actionRow,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "outline",
							disabled,
							onClick: props.onCreate,
							children: t("newTeam")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "outline",
							disabled,
							onClick: () => {
								fileInput.current?.click();
							},
							children: t("importPreset")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							ref: fileInput,
							className: TeamPresetsSection_module_css_default.fileInput,
							type: "file",
							accept: "application/json,.json",
							disabled,
							onChange: (event) => {
								const file = event.target.files?.[0];
								event.target.value = "";
								if (file !== void 0) props.onImport(file);
							}
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.hint,
					children: t("importNote")
				}),
				props.importError === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.warn,
					role: "status",
					children: t(props.importError)
				}),
				props.teams.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.empty,
					children: t("emptyTeams")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: TeamPresetsSection_module_css_default.rows,
					children: props.teams.map((team) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
						className: TeamPresetsSection_module_css_default.card,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: TeamPresetsSection_module_css_default.rowMain,
							onClick: () => {
								props.onOpen(team.id);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.dot,
								style: team.captain.color === "" ? void 0 : { background: team.captain.color },
								"aria-hidden": true
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: TeamPresetsSection_module_css_default.rowText,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.rowName,
									children: team.name === "" ? team.id : team.name
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.rowMeta,
									children: `${String(team.members.length)} ${t("memberCount")} · ${t("captainFollowsSession")}`
								})]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: TeamPresetsSection_module_css_default.rowActions,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => {
										props.onExport(team.id);
									},
									children: t("exportPreset")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									variant: "ghost",
									disabled,
									onClick: () => {
										props.onDuplicate(team.id);
									},
									children: t("duplicate")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									variant: "ghost",
									disabled,
									onClick: () => {
										props.onDelete(team.id);
									},
									children: t("remove")
								})
							]
						})]
					}, team.id))
				})
			] });
		}
		//#endregion
		//#region src/client/preset-file.ts
		/** Characters a generated file name may keep. */
		const UNSAFE_NAME = /[^\p{L}\p{N}._-]+/gu;
		/** File name stem length, so one long Team name cannot produce a huge name. */
		const MAX_STEM = 64;
		/**
		* Derive the file name one Team downloads under.
		* @param team - the Team being exported.
		* @returns a `.json` file name built from the Team's name, or from its identity.
		*/
		function presetFileName(team) {
			const label = (team.name.trim() === "" ? team.id : team.name.trim()).replace(UNSAFE_NAME, "-").replace(/^-+|-+$/gu, "").slice(0, MAX_STEM);
			return `${label === "" ? "team" : label}.json`;
		}
		/**
		* Read one chosen document as text.
		* @param file - the file the user picked.
		* @returns the file's text.
		*/
		async function readPresetFile(file) {
			return await file.text();
		}
		/**
		* Offer one Team document as a download.
		* @param fileName - the name the browser saves it under.
		* @param text - the document body.
		*/
		function downloadPresetText(fileName, text) {
			const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
			try {
				const anchor = document.createElement("a");
				anchor.href = url;
				anchor.download = fileName;
				anchor.click();
			} finally {
				URL.revokeObjectURL(url);
			}
		}
		//#endregion
		//#region src/client/locales.ts
		/** Locale namespace owned by this plugin. */
		const NS = "settings.agentTeamPresets";
		/** English copy. */
		const en = {
			nav: "Agent team presets",
			title: "Agent team presets",
			description: "Reusable Teams of named agents. Select a Team in the composer and its captain leads the session on the model you already picked, summoning members with their own prompt, model, reasoning effort, and tools.",
			newTeam: "New team",
			duplicate: "Duplicate",
			remove: "Delete team",
			removeMember: "Remove member",
			teamList: "Teams",
			emptyTeams: "No team configured yet. Create one, then select it in the composer.",
			emptySelection: "Select a team to edit it.",
			memberCount: "members",
			teamName: "Team name",
			teamNamePlaceholder: "Feature build team",
			teamDescription: "What this team is for",
			captain: "Captain",
			captainHint: "The captain replaces this session: its system prompt becomes the session prompt and its tool scope scopes the session tools. It leads on the model the session already selected, so a Team never changes your model.",
			members: "Members",
			addMember: "Add member",
			membersHint: "Members are templates. The captain summons one by name with spawn_team_member, and the member runs with the prompt, model, reasoning effort, and tools below.",
			agentName: "Name",
			agentNamePlaceholder: "reviewer",
			agentColor: "Color",
			agentDescription: "Description",
			route: "Model",
			routeInherit: "Follow the session",
			provider: "Provider",
			model: "Model",
			effort: "Reasoning effort",
			effortDefault: "Model default",
			captainModelHint: "The captain leads on the model this session already selected. Pick that model in the composer; a Team never changes it.",
			captainFollowsSession: "Session model",
			modelsPartial: "Some providers did not answer, so their models are missing from this list. Reopen this page to read them again.",
			tools: "Allowed tools",
			toolMode: "Tool permissions",
			toolsDefault: "Default: all tools",
			toolsCustom: "Custom allowed tools",
			toolsHint: "Only checked configurable tools are allowed.",
			toolsAllHint: "Adds no tool restriction. Your custom selections are kept when you switch modes.",
			toolsEmpty: "No tools selected: all configurable tools are disabled.",
			toolsScoped: "Team coordination and other scope-local tools remain available.",
			toolsNoCatalog: "This deployment exposes no configurable tools.",
			toolsSelectAll: "Select all",
			toolsClear: "Clear",
			toolsRemove: "Remove",
			toolsUnavailable: "Unavailable saved tools — remove these before applying custom permissions.",
			toolsLoading: "Loading tools…",
			toolsFailed: "The tool list could not be read; only the tools already chosen are shown.",
			systemPrompt: "System prompt",
			systemPromptPlaceholder: "You are…",
			systemPromptHint: "Registered as a prompt section template: complete {{variable}} groups interpolate against registered prompt variables, and an unknown variable fails the request.",
			promptWarnBraces: "This text contains a {{…}} group. DSH interpolates it against registered prompt variables and fails the request on an unknown name.",
			back: "Back",
			backToList: "All teams",
			editCaptain: "Edit captain",
			editMember: "Edit member",
			teamSections: "What this team contains",
			agentSections: "How this agent runs",
			modelSection: "Model",
			promptSection: "System prompt",
			toolsSection: "Tools",
			identitySection: "Identity",
			emptyMembers: "No member yet. Add one, then tell the captain to summon it by name.",
			inheritSession: "Follow the session",
			deleteAgent: "Delete this agent",
			roleCaptain: "Captain",
			roleMember: "Member",
			save: "Save",
			saving: "Saving…",
			saveFailed: "The host did not accept these values; your edits are kept.",
			discard: "Discard",
			unsaved: "Unsaved changes",
			readOnly: "This deployment stores settings read-only.",
			unavailable: "The Agent team presets plugin is not loaded, so it cannot be configured right now.",
			composerTitle: "Team",
			composerNone: "No team",
			composerHint: "Apply one Team preset to this session.",
			importPreset: "Import preset",
			exportPreset: "Export",
			importNote: "A shared document carries names, descriptions, system prompts, and colors. Model routes and tool permissions stay local.",
			importConfirm: "Import",
			cancel: "Cancel",
			close: "Close",
			importConflictTitle: "Resolve import conflicts",
			importTeamConflict: "A team already uses this name",
			importTeamReplace: "Replace that team",
			importTeamRename: "Add as a new team",
			importNewTeamName: "New team name",
			importCaptainConflict: "Its captain already uses this name",
			importCaptainReplace: "Replace that captain",
			importCaptainRename: "Rename the imported captain",
			importMemberConflict: "These members already exist in that team",
			importMemberReplace: "Replace that member",
			importMemberRename: "Add it renamed",
			importInvalidJson: "That file is not valid JSON.",
			importInvalidFormat: "That file is not a Team preset document.",
			importUnsupportedVersion: "That document was written by a newer version of this plugin.",
			importUnsupportedFields: "That document carries fields a shared preset cannot hold, such as a model route or a tool permission.",
			importDuplicateMembers: "That document names the same member twice.",
			importTooManyMembers: "That document declares too many members.",
			importTooLarge: "That file is too large to be a Team preset."
		};
		/** Simplified Chinese copy. */
		const zh = {
			nav: "智能体团队预设",
			title: "智能体团队预设",
			description: "可复用的命名智能体团队。在对话框选中一个团队后，队长以你当前已选的模型接管本会话，并按名字召唤队员；每个队员使用自己配置的提示词、模型、思考强度和工具。",
			newTeam: "新建团队",
			duplicate: "复制",
			remove: "删除团队",
			removeMember: "删除队员",
			teamList: "团队列表",
			emptyTeams: "还没有配置团队。先新建一个，再到对话框里选择使用。",
			emptySelection: "选择一个团队进行编辑。",
			memberCount: "名队员",
			teamName: "团队名称",
			teamNamePlaceholder: "功能开发团队",
			teamDescription: "团队用途说明",
			captain: "队长",
			captainHint: "队长会接管本会话：队长的系统提示词成为会话提示词、工具权限作用于会话工具。队长使用会话当前已选的模型，团队不会改动你的模型。",
			members: "队员",
			addMember: "添加队员",
			membersHint: "队员是角色模板。队长用 spawn_team_member 按名字召唤，队员以此处配置的提示词、模型、思考强度和工具运行。",
			agentName: "名称",
			agentNamePlaceholder: "reviewer",
			agentColor: "颜色标记",
			agentDescription: "描述",
			route: "模型",
			routeInherit: "跟随会话",
			provider: "提供商",
			model: "模型",
			effort: "思考强度",
			effortDefault: "模型默认",
			captainModelHint: "队长使用本会话当前已选的模型。请在对话框里选择该模型；团队不会改动它。",
			captainFollowsSession: "会话模型",
			modelsPartial: "部分提供商没有返回模型列表，下面可能缺少它们的模型。重新打开本页可再次读取。",
			tools: "可用工具",
			toolMode: "工具权限",
			toolsDefault: "默认所有工具",
			toolsCustom: "自定义可用工具",
			toolsHint: "仅允许使用勾选的可配置工具。",
			toolsAllHint: "不额外限制工具。切换模式不会清除已保存的自定义勾选。",
			toolsEmpty: "未勾选任何工具：禁用全部可配置工具。",
			toolsScoped: "团队协作及其他作用域内注册的工具仍然保留。",
			toolsNoCatalog: "当前部署没有可配置工具。",
			toolsSelectAll: "全选",
			toolsClear: "清空",
			toolsRemove: "移除",
			toolsUnavailable: "以下已保存的工具当前不可用，请先移除再应用自定义权限。",
			toolsLoading: "正在读取工具列表…",
			toolsFailed: "工具列表读取失败，下面只显示已经选中的工具。",
			systemPrompt: "系统提示词",
			systemPromptPlaceholder: "你负责……",
			systemPromptHint: "作为提示词段落模板注册：完整的 {{变量}} 会按已注册的提示词变量插值，未知变量会让请求失败。",
			promptWarnBraces: "这段文本包含 {{…}}。DSH 会按已注册的提示词变量插值，名字未知会让请求失败。",
			back: "返回",
			backToList: "全部团队",
			editCaptain: "编辑队长",
			editMember: "编辑队员",
			teamSections: "这个团队包含什么",
			agentSections: "这个智能体怎么运行",
			modelSection: "模型",
			promptSection: "系统提示词",
			toolsSection: "工具",
			identitySection: "基本信息",
			emptyMembers: "还没有队员。先添加一个，然后让队长按名字召唤它。",
			inheritSession: "跟随会话",
			deleteAgent: "删除该队员",
			roleCaptain: "队长",
			roleMember: "队员",
			save: "保存",
			saving: "保存中…",
			saveFailed: "宿主没有接受这些值，你的修改已保留。",
			discard: "放弃修改",
			unsaved: "有未保存的修改",
			readOnly: "本部署的设置为只读。",
			unavailable: "智能体团队插件当前未加载，暂时无法配置。",
			composerTitle: "团队",
			composerNone: "不使用团队",
			composerHint: "为本会话启用一个团队预设。",
			importPreset: "导入预设",
			exportPreset: "导出",
			importNote: "共享文档只携带名称、描述、系统提示词和颜色；模型路由与工具权限保留在本地。",
			importConfirm: "导入",
			cancel: "取消",
			close: "关闭",
			importConflictTitle: "处理导入冲突",
			importTeamConflict: "已有团队使用了这个名称",
			importTeamReplace: "替换该团队",
			importTeamRename: "重命名后新增",
			importNewTeamName: "新团队名称",
			importCaptainConflict: "该团队的队长已使用这个名称",
			importCaptainReplace: "替换该队长",
			importCaptainRename: "重命名导入的队长",
			importMemberConflict: "该团队已存在这些队员",
			importMemberReplace: "替换该队员",
			importMemberRename: "重命名后新增",
			importInvalidJson: "该文件不是合法的 JSON。",
			importInvalidFormat: "该文件不是团队预设文档。",
			importUnsupportedVersion: "该文档由更新版本的插件生成。",
			importUnsupportedFields: "该文档包含共享预设无法携带的字段，例如模型路由或工具权限。",
			importDuplicateMembers: "该文档中有两个队员使用了相同名称。",
			importTooManyMembers: "该文档声明的队员数量过多。",
			importTooLarge: "该文件过大，不像是团队预设。"
		};
		/** Locale key for one refused import. */
		const IMPORT_FAILURE_KEYS = {
			"invalid-json": "importInvalidJson",
			"invalid-format": "importInvalidFormat",
			"unsupported-version": "importUnsupportedVersion",
			"unsupported-fields": "importUnsupportedFields",
			"duplicate-members": "importDuplicateMembers",
			"too-many-members": "importTooManyMembers",
			"too-large": "importTooLarge"
		};
		//#endregion
		//#region src/client/TeamPresetsSection.tsx
		/**
		* The Agent Team presets settings page: three stacked pages — the Team list,
		* one Team's roster, and one captain or member — with a shared save footer.
		*/
		/**
		* Keep the fields a captain owns out of one shared editor patch.
		*
		* The one-agent page reports both slots' edits through the route-bearing member
		* patch, so the captain branch drops the route members it never renders.
		* @param patch - the edit reported by the one-agent page.
		* @returns the same edit restricted to the captain's own fields.
		*/
		function captainPatch(patch) {
			const { name, color, description, toolMode, tools, systemPrompt } = patch;
			return {
				...name === void 0 ? {} : { name },
				...color === void 0 ? {} : { color },
				...description === void 0 ? {} : { description },
				...toolMode === void 0 ? {} : { toolMode },
				...tools === void 0 ? {} : { tools },
				...systemPrompt === void 0 ? {} : { systemPrompt }
			};
		}
		/**
		* Render the Team preset settings page.
		* @param props - page state, the page's locale reader, and the editing actions.
		* @returns the current page and the shared save footer.
		*/
		function TeamPresetsSection(props) {
			const { t } = props;
			const state = props.useTeamPresets((snapshot) => snapshot);
			const [view, setView] = (0, react.useState)({ kind: "list" });
			const [importError, setImportError] = (0, react.useState)(void 0);
			const [importPlan, setImportPlan] = (0, react.useState)(void 0);
			const [importGeneration, setImportGeneration] = (0, react.useState)(0);
			const { refreshCatalogue } = props;
			(0, react.useEffect)(() => {
				refreshCatalogue();
			}, [refreshCatalogue]);
			if (state.status !== "ready") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: TeamPresetsSection_module_css_default.empty,
				role: "status",
				children: state.status === "loading" ? t("saving") : t("unavailable")
			});
			const disabled = !state.writable;
			const teamList = state.teams;
			const found = view.kind === "list" ? void 0 : teamList.find((entry) => entry.id === view.teamId);
			const active = view.kind === "list" || found !== void 0 ? view : { kind: "list" };
			const team = found;
			const teamIndex = team === void 0 ? -1 : teamList.indexOf(team);
			const openTeam = (teamId) => {
				setView({
					kind: "team",
					teamId
				});
			};
			const openAgent = (teamId, slot) => {
				setView({
					kind: "agent",
					teamId,
					slot
				});
			};
			/**
			* Read one chosen document, then stage it or ask about the names it collides with.
			* @param file - the document the user chose.
			*/
			async function importDocument(file) {
				const inspection = props.inspectImport(await readPresetFile(file));
				if (!inspection.ok) {
					setImportPlan(void 0);
					setImportError(IMPORT_FAILURE_KEYS[inspection.reason]);
					return;
				}
				setImportError(void 0);
				if (inspection.plan.targetIndex === void 0) {
					openTeam(props.applyImport(inspection.plan, defaultImportResolution(inspection.plan)));
					return;
				}
				setImportGeneration((generation) => generation + 1);
				setImportPlan(inspection.plan);
			}
			/**
			* Write one Team out as a shareable document.
			* @param teamId - the Team the user chose to export.
			*/
			function exportDocument(teamId) {
				const index = teamList.findIndex((entry) => entry.id === teamId);
				const team = index < 0 ? void 0 : teamList[index];
				const text = index < 0 ? void 0 : props.exportTeam(index);
				if (team === void 0 || text === void 0) return;
				downloadPresetText(presetFileName(team), text);
			}
			const memberSlot = active.kind === "agent" && active.slot !== "captain" ? active.slot : void 0;
			const agent = team === void 0 || active.kind !== "agent" ? void 0 : active.slot === "captain" ? team.captain : team.members[active.slot];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: TeamPresetsSection_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: TeamPresetsSection_module_css_default.page,
						children: [
							active.kind === "list" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TeamListView, {
								teams: teamList,
								t,
								disabled,
								importError,
								onOpen: openTeam,
								onCreate: () => {
									openTeam(props.createTeam());
								},
								onImport: (file) => {
									importDocument(file);
								},
								onExport: exportDocument,
								onDuplicate: (teamId) => {
									const index = teamList.findIndex((entry) => entry.id === teamId);
									if (index < 0) return;
									const created = props.duplicateTeam(index);
									if (created !== void 0) openTeam(created);
								},
								onDelete: (teamId) => {
									const index = teamList.findIndex((entry) => entry.id === teamId);
									if (index >= 0) props.removeTeam(index);
									setView({ kind: "list" });
								}
							}),
							active.kind === "team" && team !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TeamEditorView, {
								team,
								providers: state.providers,
								t,
								disabled,
								onBack: () => {
									setView({ kind: "list" });
								},
								onPatch: (patch) => {
									props.patchTeam(teamIndex, patch);
								},
								onOpenAgent: (slot) => {
									openAgent(team.id, slot);
								},
								onAddMember: () => {
									props.addMember(teamIndex);
									openAgent(team.id, team.members.length);
								},
								onRemoveMember: (index) => {
									props.removeMember(teamIndex, index);
								}
							}),
							active.kind === "agent" && team !== void 0 && agent !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TeamAgentView, {
								agent,
								role: active.slot === "captain" ? "captain" : "member",
								teamName: team.name === "" ? team.id : team.name,
								providers: state.providers,
								tools: state.tools,
								toolCatalogue: state.toolCatalogue,
								cataloguePartial: state.cataloguePartial,
								t,
								disabled,
								onBack: () => {
									openTeam(team.id);
								},
								onChange: (patch) => {
									if (active.slot === "captain") props.patchCaptain(teamIndex, captainPatch(patch));
									else props.patchMember(teamIndex, active.slot, patch);
								},
								...memberSlot === void 0 ? {} : { onDelete: () => {
									props.removeMember(teamIndex, memberSlot);
									openTeam(team.id);
								} }
							})
						]
					}),
					importPlan === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TeamImportDialog, {
						plan: importPlan,
						t,
						onCancel: () => {
							setImportPlan(void 0);
						},
						onConfirm: (resolution) => {
							const created = props.applyImport(importPlan, resolution);
							setImportPlan(void 0);
							openTeam(created);
						}
					}, importGeneration),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
						className: TeamPresetsSection_module_css_default.footer,
						children: [
							state.failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.warn,
								role: "status",
								children: t("saveFailed")
							}) : null,
							state.dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.footerNote,
								children: t("unsaved")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "ghost",
								disabled: !state.dirty || state.saving,
								onClick: () => {
									props.discard();
								},
								children: t("discard")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "primary",
								disabled: !state.dirty || state.saving || disabled,
								onClick: () => {
									props.save();
								},
								children: state.saving ? t("saving") : t("save")
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.ts
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"locale",
			"configForms",
			"remote",
			"remote.session"
		];
		/**
		* Host notifications that change which provider routes exist.
		*
		* The Team model pickers read the same Host catalogue as the composer model
		* picker, so a page left open invalidates on the same events: adapters coming
		* and going, a settings commit, and a credential landing or disappearing.
		*/
		const CATALOGUE_INVALIDATIONS = [
			"llm/adapters-updated",
			"settings/document-updated",
			"credentials/record-updated",
			"credentials/reference-updated"
		];
		/**
		* Register the Settings page and the composer control once this plugin's tool
		* catalog Remote is mounted, so both read the deployment's real tool list.
		* @param ctx - the browser plugin context.
		* @returns disposer withdrawing the UI and the Remote contribution.
		*/
		async function apply(ctx) {
			const disposeRemote = await ctx.remote.$mount(TYPERT_REMOTE);
			const ui = ctx.inject([
				"remote.teamPresets",
				"slots",
				"locale",
				"configForms",
				"remote.session"
			], registerUi);
			try {
				await ui;
			} catch (error) {
				await ui.dispose();
				await disposeRemote();
				throw error;
			}
			return async () => {
				await ui.dispose();
				await disposeRemote();
			};
		}
		/**
		* Register the Settings page and the composer control over one shared Team
		* state, so an edit on the page and a selection in the composer cannot
		* disagree about the settings document.
		* @param ctx - the browser plugin context, with the Team Remote mounted.
		*/
		function registerUi(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "agent-team-presets: dictionaries");
			const controller = new TeamPresetsController(ctx);
			ctx.effect(() => () => {
				controller.dispose();
			}, "agent-team-presets: form subscription");
			controller.loadCatalogue();
			for (const event of CATALOGUE_INVALIDATIONS) ctx.effect(() => ctx.remote.$on(event, () => {
				controller.refreshCatalogue();
			}), `agent-team-presets: ${event} invalidations`);
			ctx.effect(() => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: TEAM_PRESETS_NS,
				order: 25,
				label: () => t("nav"),
				locale: NS,
				inject: () => controller.inject()
			}, TeamPresetsSection)), "agent-team-presets: settings page");
			ctx.inject(["agentTeamAppearance"], (scope) => {
				scope.effect(() => scope.agentTeamAppearance.register((sessionId) => {
					const state = controller.store.getSnapshot();
					return teamAppearance(state.teams, state.selections, sessionId);
				}), "agent-team-presets: roster appearance");
			});
			ctx.effect(() => ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "agent-team-presets",
				order: 10,
				locale: NS,
				inject: () => controller.inject()
			}, ComposerTeamSelect)), "agent-team-presets: composer control");
		}
		//#endregion
		exports.TEAM_PRESETS_NS = TEAM_PRESETS_NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

