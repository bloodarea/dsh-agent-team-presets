window.__ModuleLoader__.load({
	id: "dsh-agent-team-presets",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");

		var __defProp = Object.defineProperty;
		var __exportAll = (all, no_symbols) => {
			let target = {};
			for (var name in all) __defProp(target, name, {
				get: all[name],
				enumerable: true
			});
			if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
			return target;
		};
		var _a$1;
		/** A special constant with type `never` */
		const NEVER = /*@__PURE__*/ Object.freeze({ status: "aborted" });
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
		const $brand = Symbol("zod_brand");
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
		var util_exports = /* @__PURE__ */ __exportAll({
			BIGINT_FORMAT_RANGES: () => BIGINT_FORMAT_RANGES,
			Class: () => Class,
			NUMBER_FORMAT_RANGES: () => NUMBER_FORMAT_RANGES,
			aborted: () => aborted,
			allowsEval: () => allowsEval,
			assert: () => assert,
			assertEqual: () => assertEqual,
			assertIs: () => assertIs,
			assertNever: () => assertNever,
			assertNotEqual: () => assertNotEqual,
			assignProp: () => assignProp,
			base64ToUint8Array: () => base64ToUint8Array,
			base64urlToUint8Array: () => base64urlToUint8Array,
			cached: () => cached,
			captureStackTrace: () => captureStackTrace,
			cleanEnum: () => cleanEnum,
			cleanRegex: () => cleanRegex,
			clone: () => clone,
			cloneDef: () => cloneDef,
			createTransparentProxy: () => createTransparentProxy,
			defineLazy: () => defineLazy,
			esc: () => esc,
			escapeRegex: () => escapeRegex,
			explicitlyAborted: () => explicitlyAborted,
			extend: () => extend,
			finalizeIssue: () => finalizeIssue,
			floatSafeRemainder: () => floatSafeRemainder,
			getElementAtPath: () => getElementAtPath,
			getEnumValues: () => getEnumValues,
			getLengthableOrigin: () => getLengthableOrigin,
			getParsedType: () => getParsedType,
			getSizableOrigin: () => getSizableOrigin,
			hexToUint8Array: () => hexToUint8Array,
			isObject: () => isObject,
			isPlainObject: () => isPlainObject,
			issue: () => issue,
			joinValues: () => joinValues,
			jsonStringifyReplacer: () => jsonStringifyReplacer,
			merge: () => merge,
			mergeDefs: () => mergeDefs,
			normalizeParams: () => normalizeParams,
			nullish: () => nullish$1,
			numKeys: () => numKeys,
			objectClone: () => objectClone,
			omit: () => omit,
			optionalKeys: () => optionalKeys,
			parsedType: () => parsedType,
			partial: () => partial,
			pick: () => pick,
			prefixIssues: () => prefixIssues,
			primitiveTypes: () => primitiveTypes,
			promiseAllObject: () => promiseAllObject,
			propertyKeyTypes: () => propertyKeyTypes,
			randomString: () => randomString,
			required: () => required,
			safeExtend: () => safeExtend,
			shallowClone: () => shallowClone,
			slugify: () => slugify,
			stringifyPrimitive: () => stringifyPrimitive,
			uint8ArrayToBase64: () => uint8ArrayToBase64,
			uint8ArrayToBase64url: () => uint8ArrayToBase64url,
			uint8ArrayToHex: () => uint8ArrayToHex,
			unwrapMessage: () => unwrapMessage
		});
		function assertEqual(val) {
			return val;
		}
		function assertNotEqual(val) {
			return val;
		}
		function assertIs(_arg) {}
		function assertNever(_x) {
			throw new Error("Unexpected value in exhaustive check");
		}
		function assert(_) {}
		function getEnumValues(entries) {
			const numericValues = Object.values(entries).filter((v) => typeof v === "number");
			return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
		}
		function joinValues(array, separator = "|") {
			return array.map((val) => stringifyPrimitive(val)).join(separator);
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
		function nullish$1(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		function floatSafeRemainder(val, step) {
			const ratio = val / step;
			const roundedRatio = Math.round(ratio);
			const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
			if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
			return ratio - roundedRatio;
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
		function objectClone(obj) {
			return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
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
		function cloneDef(schema) {
			return mergeDefs(schema._zod.def);
		}
		function getElementAtPath(obj, path) {
			if (!path) return obj;
			return path.reduce((acc, key) => acc?.[key], obj);
		}
		function promiseAllObject(promisesObj) {
			const keys = Object.keys(promisesObj);
			const promises = keys.map((key) => promisesObj[key]);
			return Promise.all(promises).then((results) => {
				const resolvedObj = {};
				for (let i = 0; i < keys.length; i++) resolvedObj[keys[i]] = results[i];
				return resolvedObj;
			});
		}
		function randomString(length = 10) {
			const chars = "abcdefghijklmnopqrstuvwxyz";
			let str = "";
			for (let i = 0; i < length; i++) str += chars[Math.floor(Math.random() * 26)];
			return str;
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
		function numKeys(data) {
			let keyCount = 0;
			for (const key in data) if (Object.prototype.hasOwnProperty.call(data, key)) keyCount++;
			return keyCount;
		}
		const getParsedType = (data) => {
			const t = typeof data;
			switch (t) {
				case "undefined": return "undefined";
				case "string": return "string";
				case "number": return Number.isNaN(data) ? "nan" : "number";
				case "boolean": return "boolean";
				case "function": return "function";
				case "bigint": return "bigint";
				case "symbol": return "symbol";
				case "object":
					if (Array.isArray(data)) return "array";
					if (data === null) return "null";
					if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") return "promise";
					if (typeof Map !== "undefined" && data instanceof Map) return "map";
					if (typeof Set !== "undefined" && data instanceof Set) return "set";
					if (typeof Date !== "undefined" && data instanceof Date) return "date";
					if (typeof File !== "undefined" && data instanceof File) return "file";
					return "object";
				default: throw new Error(`Unknown data type: ${t}`);
			}
		};
		const propertyKeyTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"symbol"
		]);
		const primitiveTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"bigint",
			"boolean",
			"symbol",
			"undefined"
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
		function createTransparentProxy(getter) {
			let target;
			return new Proxy({}, {
				get(_, prop, receiver) {
					target ?? (target = getter());
					return Reflect.get(target, prop, receiver);
				},
				set(_, prop, value, receiver) {
					target ?? (target = getter());
					return Reflect.set(target, prop, value, receiver);
				},
				has(_, prop) {
					target ?? (target = getter());
					return Reflect.has(target, prop);
				},
				deleteProperty(_, prop) {
					target ?? (target = getter());
					return Reflect.deleteProperty(target, prop);
				},
				ownKeys(_) {
					target ?? (target = getter());
					return Reflect.ownKeys(target);
				},
				getOwnPropertyDescriptor(_, prop) {
					target ?? (target = getter());
					return Reflect.getOwnPropertyDescriptor(target, prop);
				},
				defineProperty(_, prop, descriptor) {
					target ?? (target = getter());
					return Reflect.defineProperty(target, prop, descriptor);
				}
			});
		}
		function stringifyPrimitive(value) {
			if (typeof value === "bigint") return value.toString() + "n";
			if (typeof value === "string") return `"${value}"`;
			return `${value}`;
		}
		function optionalKeys(shape) {
			return Object.keys(shape).filter((k) => {
				return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
			});
		}
		const NUMBER_FORMAT_RANGES = {
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		};
		const BIGINT_FORMAT_RANGES = {
			int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
			uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
		};
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
		function getSizableOrigin(input) {
			if (input instanceof Set) return "set";
			if (input instanceof Map) return "map";
			if (input instanceof File) return "file";
			return "unknown";
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function parsedType(data) {
			const t = typeof data;
			switch (t) {
				case "number": return Number.isNaN(data) ? "nan" : "number";
				case "object": {
					if (data === null) return "null";
					if (Array.isArray(data)) return "array";
					const obj = data;
					if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) return obj.constructor.name;
				}
			}
			return t;
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
		function cleanEnum(obj) {
			return Object.entries(obj).filter(([k, _]) => {
				return Number.isNaN(Number.parseInt(k, 10));
			}).map((el) => el[1]);
		}
		function base64ToUint8Array(base64) {
			const binaryString = atob(base64);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
			return bytes;
		}
		function uint8ArrayToBase64(bytes) {
			let binaryString = "";
			for (let i = 0; i < bytes.length; i++) binaryString += String.fromCharCode(bytes[i]);
			return btoa(binaryString);
		}
		function base64urlToUint8Array(base64url) {
			const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
			return base64ToUint8Array(base64 + "=".repeat((4 - base64.length % 4) % 4));
		}
		function uint8ArrayToBase64url(bytes) {
			return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
		}
		function hexToUint8Array(hex) {
			const cleanHex = hex.replace(/^0x/, "");
			if (cleanHex.length % 2 !== 0) throw new Error("Invalid hex string length");
			const bytes = new Uint8Array(cleanHex.length / 2);
			for (let i = 0; i < cleanHex.length; i += 2) bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
			return bytes;
		}
		function uint8ArrayToHex(bytes) {
			return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
		}
		var Class = class {
			constructor(..._args) {}
		};
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
		function treeifyError(error, mapper = (issue) => issue.message) {
			const result = { errors: [] };
			const processError = (error, path = []) => {
				var _a, _b;
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) {
						result.errors.push(mapper(issue));
						continue;
					}
					let curr = result;
					let i = 0;
					while (i < fullpath.length) {
						const el = fullpath[i];
						const terminal = i === fullpath.length - 1;
						if (typeof el === "string") {
							curr.properties ?? (curr.properties = {});
							(_a = curr.properties)[el] ?? (_a[el] = { errors: [] });
							curr = curr.properties[el];
						} else {
							curr.items ?? (curr.items = []);
							(_b = curr.items)[el] ?? (_b[el] = { errors: [] });
							curr = curr.items[el];
						}
						if (terminal) curr.errors.push(mapper(issue));
						i++;
					}
				}
			};
			processError(error);
			return result;
		}
		/** Format a ZodError as a human-readable string in the following form.
		*
		* From
		*
		* ```ts
		* ZodError {
		*   issues: [
		*     {
		*       expected: 'string',
		*       code: 'invalid_type',
		*       path: [ 'username' ],
		*       message: 'Invalid input: expected string'
		*     },
		*     {
		*       expected: 'number',
		*       code: 'invalid_type',
		*       path: [ 'favoriteNumbers', 1 ],
		*       message: 'Invalid input: expected number'
		*     }
		*   ];
		* }
		* ```
		*
		* to
		*
		* ```
		* username
		*   ✖ Expected number, received string at "username
		* favoriteNumbers[0]
		*   ✖ Invalid input: expected number
		* ```
		*/
		function toDotPath(_path) {
			const segs = [];
			const path = _path.map((seg) => typeof seg === "object" ? seg.key : seg);
			for (const seg of path) if (typeof seg === "number") segs.push(`[${seg}]`);
			else if (typeof seg === "symbol") segs.push(`[${JSON.stringify(String(seg))}]`);
			else if (/[^\w$]/.test(seg)) segs.push(`[${JSON.stringify(seg)}]`);
			else {
				if (segs.length) segs.push(".");
				segs.push(seg);
			}
			return segs.join("");
		}
		function prettifyError(error) {
			const lines = [];
			const issues = [...error.issues].sort((a, b) => (a.path ?? []).length - (b.path ?? []).length);
			for (const issue of issues) {
				lines.push(`✖ ${issue.message}`);
				if (issue.path?.length) lines.push(`  → at ${toDotPath(issue.path)}`);
			}
			return lines.join("\n");
		}
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
		const parse$1 = /* @__PURE__*/ _parse($ZodRealError);
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
		const parseAsync$1 = /* @__PURE__*/ _parseAsync($ZodRealError);
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
		const encode$1 = /* @__PURE__*/ _encode($ZodRealError);
		const _decode = (_Err) => (schema, value, _ctx) => {
			return _parse(_Err)(schema, value, _ctx);
		};
		const decode$1 = /* @__PURE__*/ _decode($ZodRealError);
		const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parseAsync(_Err)(schema, value, ctx);
		};
		const encodeAsync$1 = /* @__PURE__*/ _encodeAsync($ZodRealError);
		const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _parseAsync(_Err)(schema, value, _ctx);
		};
		const decodeAsync$1 = /* @__PURE__*/ _decodeAsync($ZodRealError);
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const safeEncode$1 = /* @__PURE__*/ _safeEncode($ZodRealError);
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const safeDecode$1 = /* @__PURE__*/ _safeDecode($ZodRealError);
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const safeEncodeAsync$1 = /* @__PURE__*/ _safeEncodeAsync($ZodRealError);
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		const safeDecodeAsync$1 = /* @__PURE__*/ _safeDecodeAsync($ZodRealError);
		var regexes_exports = /* @__PURE__ */ __exportAll({
			base64: () => base64$1,
			base64url: () => base64url$1,
			bigint: () => bigint$2,
			boolean: () => boolean$2,
			browserEmail: () => browserEmail,
			cidrv4: () => cidrv4$1,
			cidrv6: () => cidrv6$1,
			cuid: () => cuid$1,
			cuid2: () => cuid2$1,
			date: () => date$3,
			datetime: () => datetime$1,
			domain: () => domain,
			duration: () => duration$1,
			e164: () => e164$1,
			email: () => email$1,
			emoji: () => emoji$1,
			extendedDuration: () => extendedDuration,
			guid: () => guid$1,
			hex: () => hex$1,
			hostname: () => hostname$1,
			html5Email: () => html5Email,
			httpProtocol: () => httpProtocol,
			idnEmail: () => idnEmail,
			integer: () => integer,
			ipv4: () => ipv4$1,
			ipv6: () => ipv6$1,
			ksuid: () => ksuid$1,
			lowercase: () => lowercase,
			mac: () => mac$1,
			md5_base64: () => md5_base64,
			md5_base64url: () => md5_base64url,
			md5_hex: () => md5_hex,
			nanoid: () => nanoid$1,
			null: () => _null$2,
			number: () => number$2,
			rfc5322Email: () => rfc5322Email,
			sha1_base64: () => sha1_base64,
			sha1_base64url: () => sha1_base64url,
			sha1_hex: () => sha1_hex,
			sha256_base64: () => sha256_base64,
			sha256_base64url: () => sha256_base64url,
			sha256_hex: () => sha256_hex,
			sha384_base64: () => sha384_base64,
			sha384_base64url: () => sha384_base64url,
			sha384_hex: () => sha384_hex,
			sha512_base64: () => sha512_base64,
			sha512_base64url: () => sha512_base64url,
			sha512_hex: () => sha512_hex,
			string: () => string$2,
			time: () => time$1,
			ulid: () => ulid$1,
			undefined: () => _undefined$2,
			unicodeEmail: () => unicodeEmail,
			uppercase: () => uppercase,
			uuid: () => uuid$1,
			uuid4: () => uuid4,
			uuid6: () => uuid6,
			uuid7: () => uuid7,
			xid: () => xid$1
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid$1 = /^[cC][0-9a-z]{6,}$/;
		const cuid2$1 = /^[0-9a-z]+$/;
		const ulid$1 = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
		const xid$1 = /^[0-9a-vA-V]{20}$/;
		const ksuid$1 = /^[A-Za-z0-9]{27}$/;
		const nanoid$1 = /^[a-zA-Z0-9_-]{21}$/;
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** Implements ISO 8601-2 extensions like explicit +- prefixes, mixing weeks with other units, and fractional/negative components. */
		const extendedDuration = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid$1 = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid$1 = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		const uuid4 = /*@__PURE__*/ uuid$1(4);
		const uuid6 = /*@__PURE__*/ uuid$1(6);
		const uuid7 = /*@__PURE__*/ uuid$1(7);
		/** Practical email validation */
		const email$1 = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		/** Equivalent to the HTML5 input[type=email] validation implemented by browsers. Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email */
		const html5Email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
		/** The classic emailregex.com regex for RFC 5322-compliant emails */
		const rfc5322Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		/** A loose regex that allows Unicode characters, enforces length limits, and that's about it. */
		const unicodeEmail = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u;
		const idnEmail = unicodeEmail;
		const browserEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
		const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		function emoji$1() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4$1 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6$1 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const mac$1 = (delimiter) => {
			const escapedDelim = escapeRegex(delimiter ?? ":");
			return new RegExp(`^(?:[0-9A-F]{2}${escapedDelim}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${escapedDelim}){5}[0-9a-f]{2}$`);
		};
		const cidrv4$1 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6$1 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64$1 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url$1 = /^[A-Za-z0-9_-]*$/;
		const hostname$1 = /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/;
		const domain = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
		const httpProtocol = /^https?$/;
		const e164$1 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		const date$3 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
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
		const string$2 = (params) => {
			const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
			return new RegExp(`^${regex}$`);
		};
		const bigint$2 = /^-?\d+n?$/;
		const integer = /^-?\d+$/;
		const number$2 = /^-?\d+(?:\.\d+)?$/;
		const boolean$2 = /^(?:true|false)$/i;
		const _null$2 = /^null$/i;
		const _undefined$2 = /^undefined$/i;
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		const hex$1 = /^[0-9a-fA-F]*$/;
		function fixedBase64(bodyLength, padding) {
			return new RegExp(`^[A-Za-z0-9+/]{${bodyLength}}${padding}$`);
		}
		function fixedBase64url(length) {
			return new RegExp(`^[A-Za-z0-9_-]{${length}}$`);
		}
		const md5_hex = /^[0-9a-fA-F]{32}$/;
		const md5_base64 = /*@__PURE__*/ fixedBase64(22, "==");
		const md5_base64url = /*@__PURE__*/ fixedBase64url(22);
		const sha1_hex = /^[0-9a-fA-F]{40}$/;
		const sha1_base64 = /*@__PURE__*/ fixedBase64(27, "=");
		const sha1_base64url = /*@__PURE__*/ fixedBase64url(27);
		const sha256_hex = /^[0-9a-fA-F]{64}$/;
		const sha256_base64 = /*@__PURE__*/ fixedBase64(43, "=");
		const sha256_base64url = /*@__PURE__*/ fixedBase64url(43);
		const sha384_hex = /^[0-9a-fA-F]{96}$/;
		const sha384_base64 = /*@__PURE__*/ fixedBase64(64, "");
		const sha384_base64url = /*@__PURE__*/ fixedBase64url(64);
		const sha512_hex = /^[0-9a-fA-F]{128}$/;
		const sha512_base64 = /*@__PURE__*/ fixedBase64(86, "==");
		const sha512_base64url = /*@__PURE__*/ fixedBase64url(86);
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		const numericOriginMap = {
			number: "number",
			bigint: "bigint",
			object: "date"
		};
		const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
				if (def.value < curr) if (def.inclusive) bag.maximum = def.value;
				else bag.exclusiveMaximum = def.value;
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
				if (def.value > curr) if (def.inclusive) bag.minimum = def.value;
				else bag.exclusiveMinimum = def.value;
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				var _a;
				(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
			});
			inst._zod.check = (payload) => {
				if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
				payload.issues.push({
					origin: typeof payload.value,
					code: "not_multiple_of",
					divisor: def.value,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
			$ZodCheck.init(inst, def);
			def.format = def.format || "float64";
			const isInt = def.format?.includes("int");
			const origin = isInt ? "int" : "number";
			const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				bag.minimum = minimum;
				bag.maximum = maximum;
				if (isInt) bag.pattern = integer;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (isInt) {
					if (!Number.isInteger(input)) {
						payload.issues.push({
							expected: origin,
							format: def.format,
							code: "invalid_type",
							continue: false,
							input,
							inst
						});
						return;
					}
					if (!Number.isSafeInteger(input)) {
						if (input > 0) payload.issues.push({
							input,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						else payload.issues.push({
							input,
							code: "too_small",
							minimum: Number.MIN_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						return;
					}
				}
				if (input < minimum) payload.issues.push({
					origin: "number",
					input,
					code: "too_small",
					minimum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
				if (input > maximum) payload.issues.push({
					origin: "number",
					input,
					code: "too_big",
					maximum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckBigIntFormat = /*@__PURE__*/ $constructor("$ZodCheckBigIntFormat", (inst, def) => {
			$ZodCheck.init(inst, def);
			const [minimum, maximum] = BIGINT_FORMAT_RANGES[def.format];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				bag.minimum = minimum;
				bag.maximum = maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input < minimum) payload.issues.push({
					origin: "bigint",
					input,
					code: "too_small",
					minimum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
				if (input > maximum) payload.issues.push({
					origin: "bigint",
					input,
					code: "too_big",
					maximum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMaxSize = /*@__PURE__*/ $constructor("$ZodCheckMaxSize", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish$1(val) && val.size !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.size <= def.maximum) return;
				payload.issues.push({
					origin: getSizableOrigin(input),
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinSize = /*@__PURE__*/ $constructor("$ZodCheckMinSize", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish$1(val) && val.size !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.size >= def.minimum) return;
				payload.issues.push({
					origin: getSizableOrigin(input),
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckSizeEquals = /*@__PURE__*/ $constructor("$ZodCheckSizeEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish$1(val) && val.size !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.minimum = def.size;
				bag.maximum = def.size;
				bag.size = def.size;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const size = input.size;
				if (size === def.size) return;
				const tooBig = size > def.size;
				payload.issues.push({
					origin: getSizableOrigin(input),
					...tooBig ? {
						code: "too_big",
						maximum: def.size
					} : {
						code: "too_small",
						minimum: def.size
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish$1(val) && val.length !== void 0;
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
				return !nullish$1(val) && val.length !== void 0;
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
				return !nullish$1(val) && val.length !== void 0;
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
		function handleCheckPropertyResult(result, payload, property) {
			if (result.issues.length) payload.issues.push(...prefixIssues(property, result.issues));
		}
		const $ZodCheckProperty = /*@__PURE__*/ $constructor("$ZodCheckProperty", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				const result = def.schema._zod.run({
					value: payload.value[def.property],
					issues: []
				}, {});
				if (result instanceof Promise) return result.then((result) => handleCheckPropertyResult(result, payload, def.property));
				handleCheckPropertyResult(result, payload, def.property);
			};
		});
		const $ZodCheckMimeType = /*@__PURE__*/ $constructor("$ZodCheckMimeType", (inst, def) => {
			$ZodCheck.init(inst, def);
			const mimeSet = new Set(def.mime);
			inst._zod.onattach.push((inst) => {
				inst._zod.bag.mime = def.mime;
			});
			inst._zod.check = (payload) => {
				if (mimeSet.has(payload.value.type)) return;
				payload.issues.push({
					code: "invalid_value",
					values: def.mime,
					input: payload.value.type,
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
		const version = {
			major: 4,
			minor: 4,
			patch: 3
		};
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
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$2(inst._zod.bag);
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
			def.pattern ?? (def.pattern = guid$1);
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
				def.pattern ?? (def.pattern = uuid$1(v));
			} else def.pattern ?? (def.pattern = uuid$1());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email$1);
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
			def.pattern ?? (def.pattern = emoji$1());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			def.pattern ?? (def.pattern = nanoid$1);
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date$3);
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
			def.pattern ?? (def.pattern = ipv4$1);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv4`;
		});
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6$1);
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
		const $ZodMAC = /*@__PURE__*/ $constructor("$ZodMAC", (inst, def) => {
			def.pattern ?? (def.pattern = mac$1(def.delimiter));
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `mac`;
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6$1);
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
			def.pattern ?? (def.pattern = base64$1);
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
			if (!base64url$1.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64url$1);
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
			def.pattern ?? (def.pattern = e164$1);
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
		const $ZodCustomStringFormat = /*@__PURE__*/ $constructor("$ZodCustomStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (def.fn(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = inst._zod.bag.pattern ?? number$2;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Number(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
				const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
				payload.issues.push({
					expected: "number",
					code: "invalid_type",
					input,
					inst,
					...received ? { received } : {}
				});
				return payload;
			};
		});
		const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
			$ZodCheckNumberFormat.init(inst, def);
			$ZodNumber.init(inst, def);
		});
		const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = boolean$2;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Boolean(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "boolean") return payload;
				payload.issues.push({
					expected: "boolean",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodBigInt = /*@__PURE__*/ $constructor("$ZodBigInt", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = bigint$2;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = BigInt(payload.value);
				} catch (_) {}
				if (typeof payload.value === "bigint") return payload;
				payload.issues.push({
					expected: "bigint",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodBigIntFormat = /*@__PURE__*/ $constructor("$ZodBigIntFormat", (inst, def) => {
			$ZodCheckBigIntFormat.init(inst, def);
			$ZodBigInt.init(inst, def);
		});
		const $ZodSymbol = /*@__PURE__*/ $constructor("$ZodSymbol", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (typeof input === "symbol") return payload;
				payload.issues.push({
					expected: "symbol",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUndefined = /*@__PURE__*/ $constructor("$ZodUndefined", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = _undefined$2;
			inst._zod.values = new Set([void 0]);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (typeof input === "undefined") return payload;
				payload.issues.push({
					expected: "undefined",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodNull = /*@__PURE__*/ $constructor("$ZodNull", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = _null$2;
			inst._zod.values = new Set([null]);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (input === null) return payload;
				payload.issues.push({
					expected: "null",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodAny = /*@__PURE__*/ $constructor("$ZodAny", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
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
		const $ZodVoid = /*@__PURE__*/ $constructor("$ZodVoid", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (typeof input === "undefined") return payload;
				payload.issues.push({
					expected: "void",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodDate = /*@__PURE__*/ $constructor("$ZodDate", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = new Date(payload.value);
				} catch (_err) {}
				const input = payload.value;
				const isDate = input instanceof Date;
				if (isDate && !Number.isNaN(input.getTime())) return payload;
				payload.issues.push({
					expected: "date",
					code: "invalid_type",
					input,
					...isDate ? { received: "Invalid Date" } : {},
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
		function handleExclusiveUnionResults(results, final, inst, ctx) {
			const successes = results.filter((r) => r.issues.length === 0);
			if (successes.length === 1) {
				final.value = successes[0].value;
				return final;
			}
			if (successes.length === 0) final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			else final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: [],
				inclusive: false
			});
			return final;
		}
		const $ZodXor = /*@__PURE__*/ $constructor("$ZodXor", (inst, def) => {
			$ZodUnion.init(inst, def);
			def.inclusive = false;
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
					} else results.push(result);
				}
				if (!async) return handleExclusiveUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleExclusiveUnionResults(results, payload, inst, ctx);
				});
			};
		});
		const $ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
			def.inclusive = false;
			$ZodUnion.init(inst, def);
			const _super = inst._zod.parse;
			defineLazy(inst._zod, "propValues", () => {
				const propValues = {};
				for (const option of def.options) {
					const pv = option._zod.propValues;
					if (!pv || Object.keys(pv).length === 0) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
					for (const [k, v] of Object.entries(pv)) {
						if (!propValues[k]) propValues[k] = /* @__PURE__ */ new Set();
						for (const val of v) propValues[k].add(val);
					}
				}
				return propValues;
			});
			const disc = cached(() => {
				const opts = def.options;
				const map = /* @__PURE__ */ new Map();
				for (const o of opts) {
					const values = o._zod.propValues?.[def.discriminator];
					if (!values || values.size === 0) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
					for (const v of values) {
						if (map.has(v)) throw new Error(`Duplicate discriminator value "${String(v)}"`);
						map.set(v, o);
					}
				}
				return map;
			});
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!isObject(input)) {
					payload.issues.push({
						code: "invalid_type",
						expected: "object",
						input,
						inst
					});
					return payload;
				}
				const opt = disc.value.get(input?.[def.discriminator]);
				if (opt) return opt._zod.run(payload, ctx);
				if (def.unionFallback || ctx.direction === "backward") return _super(payload, ctx);
				payload.issues.push({
					code: "invalid_union",
					errors: [],
					note: "No matching discriminator",
					discriminator: def.discriminator,
					options: Array.from(disc.value.keys()),
					input,
					path: [def.discriminator],
					inst
				});
				return payload;
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
		const $ZodTuple = /*@__PURE__*/ $constructor("$ZodTuple", (inst, def) => {
			$ZodType.init(inst, def);
			const items = def.items;
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						input,
						inst,
						expected: "tuple",
						code: "invalid_type"
					});
					return payload;
				}
				payload.value = [];
				const proms = [];
				const optinStart = getTupleOptStart(items, "optin");
				const optoutStart = getTupleOptStart(items, "optout");
				if (!def.rest) {
					if (input.length < optinStart) {
						payload.issues.push({
							code: "too_small",
							minimum: optinStart,
							inclusive: true,
							input,
							inst,
							origin: "array"
						});
						return payload;
					}
					if (input.length > items.length) payload.issues.push({
						code: "too_big",
						maximum: items.length,
						inclusive: true,
						input,
						inst,
						origin: "array"
					});
				}
				const itemResults = new Array(items.length);
				for (let i = 0; i < items.length; i++) {
					const r = items[i]._zod.run({
						value: input[i],
						issues: []
					}, ctx);
					if (r instanceof Promise) proms.push(r.then((rr) => {
						itemResults[i] = rr;
					}));
					else itemResults[i] = r;
				}
				if (def.rest) {
					let i = items.length - 1;
					const rest = input.slice(items.length);
					for (const el of rest) {
						i++;
						const result = def.rest._zod.run({
							value: el,
							issues: []
						}, ctx);
						if (result instanceof Promise) proms.push(result.then((r) => handleTupleResult(r, payload, i)));
						else handleTupleResult(result, payload, i);
					}
				}
				if (proms.length) return Promise.all(proms).then(() => handleTupleResults(itemResults, payload, items, input, optoutStart));
				return handleTupleResults(itemResults, payload, items, input, optoutStart);
			};
		});
		function getTupleOptStart(items, key) {
			for (let i = items.length - 1; i >= 0; i--) if (items[i]._zod[key] !== "optional") return i + 1;
			return 0;
		}
		function handleTupleResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		function handleTupleResults(itemResults, final, items, input, optoutStart) {
			for (let i = 0; i < items.length; i++) {
				const r = itemResults[i];
				const isPresent = i < input.length;
				if (r.issues.length) {
					if (!isPresent && i >= optoutStart) {
						final.value.length = i;
						break;
					}
					final.issues.push(...prefixIssues(i, r.issues));
				}
				final.value[i] = r.value;
			}
			for (let i = final.value.length - 1; i >= input.length; i--) if (items[i]._zod.optout === "optional" && final.value[i] === void 0) final.value.length = i;
			else break;
			return final;
		}
		const $ZodRecord = /*@__PURE__*/ $constructor("$ZodRecord", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!isPlainObject(input)) {
					payload.issues.push({
						expected: "record",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				const proms = [];
				const values = def.keyType._zod.values;
				if (values) {
					payload.value = {};
					const recordKeys = /* @__PURE__ */ new Set();
					for (const key of values) if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
						recordKeys.add(typeof key === "number" ? key.toString() : key);
						const keyResult = def.keyType._zod.run({
							value: key,
							issues: []
						}, ctx);
						if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
						if (keyResult.issues.length) {
							payload.issues.push({
								code: "invalid_key",
								origin: "record",
								issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
								input: key,
								path: [key],
								inst
							});
							continue;
						}
						const outKey = keyResult.value;
						const result = def.valueType._zod.run({
							value: input[key],
							issues: []
						}, ctx);
						if (result instanceof Promise) proms.push(result.then((result) => {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[outKey] = result.value;
						}));
						else {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[outKey] = result.value;
						}
					}
					let unrecognized;
					for (const key in input) if (!recordKeys.has(key)) {
						unrecognized = unrecognized ?? [];
						unrecognized.push(key);
					}
					if (unrecognized && unrecognized.length > 0) payload.issues.push({
						code: "unrecognized_keys",
						input,
						inst,
						keys: unrecognized
					});
				} else {
					payload.value = {};
					for (const key of Reflect.ownKeys(input)) {
						if (key === "__proto__") continue;
						if (!Object.prototype.propertyIsEnumerable.call(input, key)) continue;
						let keyResult = def.keyType._zod.run({
							value: key,
							issues: []
						}, ctx);
						if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
						if (typeof key === "string" && number$2.test(key) && keyResult.issues.length) {
							const retryResult = def.keyType._zod.run({
								value: Number(key),
								issues: []
							}, ctx);
							if (retryResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
							if (retryResult.issues.length === 0) keyResult = retryResult;
						}
						if (keyResult.issues.length) {
							if (def.mode === "loose") payload.value[key] = input[key];
							else payload.issues.push({
								code: "invalid_key",
								origin: "record",
								issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
								input: key,
								path: [key],
								inst
							});
							continue;
						}
						const result = def.valueType._zod.run({
							value: input[key],
							issues: []
						}, ctx);
						if (result instanceof Promise) proms.push(result.then((result) => {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[keyResult.value] = result.value;
						}));
						else {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[keyResult.value] = result.value;
						}
					}
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		const $ZodMap = /*@__PURE__*/ $constructor("$ZodMap", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!(input instanceof Map)) {
					payload.issues.push({
						expected: "map",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				const proms = [];
				payload.value = /* @__PURE__ */ new Map();
				for (const [key, value] of input) {
					const keyResult = def.keyType._zod.run({
						value: key,
						issues: []
					}, ctx);
					const valueResult = def.valueType._zod.run({
						value,
						issues: []
					}, ctx);
					if (keyResult instanceof Promise || valueResult instanceof Promise) proms.push(Promise.all([keyResult, valueResult]).then(([keyResult, valueResult]) => {
						handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
					}));
					else handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handleMapResult(keyResult, valueResult, final, key, input, inst, ctx) {
			if (keyResult.issues.length) if (propertyKeyTypes.has(typeof key)) final.issues.push(...prefixIssues(key, keyResult.issues));
			else final.issues.push({
				code: "invalid_key",
				origin: "map",
				input,
				inst,
				issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
			});
			if (valueResult.issues.length) if (propertyKeyTypes.has(typeof key)) final.issues.push(...prefixIssues(key, valueResult.issues));
			else final.issues.push({
				origin: "map",
				code: "invalid_element",
				input,
				inst,
				key,
				issues: valueResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
			});
			final.value.set(keyResult.value, valueResult.value);
		}
		const $ZodSet = /*@__PURE__*/ $constructor("$ZodSet", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!(input instanceof Set)) {
					payload.issues.push({
						input,
						inst,
						expected: "set",
						code: "invalid_type"
					});
					return payload;
				}
				const proms = [];
				payload.value = /* @__PURE__ */ new Set();
				for (const item of input) {
					const result = def.valueType._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleSetResult(result, payload)));
					else handleSetResult(result, payload);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handleSetResult(result, final) {
			if (result.issues.length) final.issues.push(...result.issues);
			final.value.add(result.value);
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
		const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
			$ZodType.init(inst, def);
			if (def.values.length === 0) throw new Error("Cannot create literal schema with no valid values");
			const values = new Set(def.values);
			inst._zod.values = values;
			inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (values.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values: def.values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodFile = /*@__PURE__*/ $constructor("$ZodFile", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (input instanceof File) return payload;
				payload.issues.push({
					expected: "file",
					code: "invalid_type",
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
		const $ZodSuccess = /*@__PURE__*/ $constructor("$ZodSuccess", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError("ZodSuccess");
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => {
					payload.value = result.issues.length === 0;
					return payload;
				});
				payload.value = result.issues.length === 0;
				return payload;
			};
		});
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
		const $ZodNaN = /*@__PURE__*/ $constructor("$ZodNaN", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
					payload.issues.push({
						input: payload.value,
						inst,
						expected: "nan",
						code: "invalid_type"
					});
					return payload;
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
		const $ZodCodec = /*@__PURE__*/ $constructor("$ZodCodec", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => def.in._zod.values);
			defineLazy(inst._zod, "optin", () => def.in._zod.optin);
			defineLazy(inst._zod, "optout", () => def.out._zod.optout);
			defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if ((ctx.direction || "forward") === "forward") {
					const left = def.in._zod.run(payload, ctx);
					if (left instanceof Promise) return left.then((left) => handleCodecAResult(left, def, ctx));
					return handleCodecAResult(left, def, ctx);
				} else {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handleCodecAResult(right, def, ctx));
					return handleCodecAResult(right, def, ctx);
				}
			};
		});
		function handleCodecAResult(result, def, ctx) {
			if (result.issues.length) {
				result.aborted = true;
				return result;
			}
			if ((ctx.direction || "forward") === "forward") {
				const transformed = def.transform(result.value, result);
				if (transformed instanceof Promise) return transformed.then((value) => handleCodecTxResult(result, value, def.out, ctx));
				return handleCodecTxResult(result, transformed, def.out, ctx);
			} else {
				const transformed = def.reverseTransform(result.value, result);
				if (transformed instanceof Promise) return transformed.then((value) => handleCodecTxResult(result, value, def.in, ctx));
				return handleCodecTxResult(result, transformed, def.in, ctx);
			}
		}
		function handleCodecTxResult(left, value, nextSchema, ctx) {
			if (left.issues.length) {
				left.aborted = true;
				return left;
			}
			return nextSchema._zod.run({
				value,
				issues: left.issues
			}, ctx);
		}
		const $ZodPreprocess = /*@__PURE__*/ $constructor("$ZodPreprocess", (inst, def) => {
			$ZodPipe.init(inst, def);
		});
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
		const $ZodTemplateLiteral = /*@__PURE__*/ $constructor("$ZodTemplateLiteral", (inst, def) => {
			$ZodType.init(inst, def);
			const regexParts = [];
			for (const part of def.parts) if (typeof part === "object" && part !== null) {
				if (!part._zod.pattern) throw new Error(`Invalid template literal part, no pattern found: ${[...part._zod.traits].shift()}`);
				const source = part._zod.pattern instanceof RegExp ? part._zod.pattern.source : part._zod.pattern;
				if (!source) throw new Error(`Invalid template literal part: ${part._zod.traits}`);
				const start = source.startsWith("^") ? 1 : 0;
				const end = source.endsWith("$") ? source.length - 1 : source.length;
				regexParts.push(source.slice(start, end));
			} else if (part === null || primitiveTypes.has(typeof part)) regexParts.push(escapeRegex(`${part}`));
			else throw new Error(`Invalid template literal part: ${part}`);
			inst._zod.pattern = new RegExp(`^${regexParts.join("")}$`);
			inst._zod.parse = (payload, _ctx) => {
				if (typeof payload.value !== "string") {
					payload.issues.push({
						input: payload.value,
						inst,
						expected: "string",
						code: "invalid_type"
					});
					return payload;
				}
				inst._zod.pattern.lastIndex = 0;
				if (!inst._zod.pattern.test(payload.value)) {
					payload.issues.push({
						input: payload.value,
						inst,
						code: "invalid_format",
						format: def.format ?? "template_literal",
						pattern: inst._zod.pattern.source
					});
					return payload;
				}
				return payload;
			};
		});
		const $ZodFunction = /*@__PURE__*/ $constructor("$ZodFunction", (inst, def) => {
			$ZodType.init(inst, def);
			inst._def = def;
			inst._zod.def = def;
			inst.implement = (func) => {
				if (typeof func !== "function") throw new Error("implement() must be called with a function");
				return function(...args) {
					const parsedArgs = inst._def.input ? parse$1(inst._def.input, args) : args;
					const result = Reflect.apply(func, this, parsedArgs);
					if (inst._def.output) return parse$1(inst._def.output, result);
					return result;
				};
			};
			inst.implementAsync = (func) => {
				if (typeof func !== "function") throw new Error("implementAsync() must be called with a function");
				return async function(...args) {
					const parsedArgs = inst._def.input ? await parseAsync$1(inst._def.input, args) : args;
					const result = await Reflect.apply(func, this, parsedArgs);
					if (inst._def.output) return await parseAsync$1(inst._def.output, result);
					return result;
				};
			};
			inst._zod.parse = (payload, _ctx) => {
				if (typeof payload.value !== "function") {
					payload.issues.push({
						code: "invalid_type",
						expected: "function",
						input: payload.value,
						inst
					});
					return payload;
				}
				if (inst._def.output && inst._def.output._zod.def.type === "promise") payload.value = inst.implementAsync(payload.value);
				else payload.value = inst.implement(payload.value);
				return payload;
			};
			inst.input = (...args) => {
				const F = inst.constructor;
				if (Array.isArray(args[0])) return new F({
					type: "function",
					input: new $ZodTuple({
						type: "tuple",
						items: args[0],
						rest: args[1]
					}),
					output: inst._def.output
				});
				return new F({
					type: "function",
					input: args[0],
					output: inst._def.output
				});
			};
			inst.output = (output) => {
				const F = inst.constructor;
				return new F({
					type: "function",
					input: inst._def.input,
					output
				});
			};
			return inst;
		});
		const $ZodPromise = /*@__PURE__*/ $constructor("$ZodPromise", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				return Promise.resolve(payload.value).then((inner) => def.innerType._zod.run({
					value: inner,
					issues: []
				}, ctx));
			};
		});
		const $ZodLazy = /*@__PURE__*/ $constructor("$ZodLazy", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "innerType", () => {
				const d = def;
				if (!d._cachedInner) d._cachedInner = def.getter();
				return d._cachedInner;
			});
			defineLazy(inst._zod, "pattern", () => inst._zod.innerType?._zod?.pattern);
			defineLazy(inst._zod, "propValues", () => inst._zod.innerType?._zod?.propValues);
			defineLazy(inst._zod, "optin", () => inst._zod.innerType?._zod?.optin ?? void 0);
			defineLazy(inst._zod, "optout", () => inst._zod.innerType?._zod?.optout ?? void 0);
			inst._zod.parse = (payload, ctx) => {
				return inst._zod.innerType._zod.run(payload, ctx);
			};
		});
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
		const error$49 = () => {
			const Sizable = {
				string: {
					unit: "حرف",
					verb: "أن يحوي"
				},
				file: {
					unit: "بايت",
					verb: "أن يحوي"
				},
				array: {
					unit: "عنصر",
					verb: "أن يحوي"
				},
				set: {
					unit: "عنصر",
					verb: "أن يحوي"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "مدخل",
				email: "بريد إلكتروني",
				url: "رابط",
				emoji: "إيموجي",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "تاريخ ووقت بمعيار ISO",
				date: "تاريخ بمعيار ISO",
				time: "وقت بمعيار ISO",
				duration: "مدة بمعيار ISO",
				ipv4: "عنوان IPv4",
				ipv6: "عنوان IPv6",
				cidrv4: "مدى عناوين بصيغة IPv4",
				cidrv6: "مدى عناوين بصيغة IPv6",
				base64: "نَص بترميز base64-encoded",
				base64url: "نَص بترميز base64url-encoded",
				json_string: "نَص على هيئة JSON",
				e164: "رقم هاتف بمعيار E.164",
				jwt: "JWT",
				template_literal: "مدخل"
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `مدخلات غير مقبولة: يفترض إدخال instanceof ${issue.expected}، ولكن تم إدخال ${received}`;
						return `مدخلات غير مقبولة: يفترض إدخال ${expected}، ولكن تم إدخال ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `مدخلات غير مقبولة: يفترض إدخال ${stringifyPrimitive(issue.values[0])}`;
						return `اختيار غير مقبول: يتوقع انتقاء أحد هذه الخيارات: ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return ` أكبر من اللازم: يفترض أن تكون ${issue.origin ?? "القيمة"} ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "عنصر"}`;
						return `أكبر من اللازم: يفترض أن تكون ${issue.origin ?? "القيمة"} ${adj} ${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `أصغر من اللازم: يفترض لـ ${issue.origin} أن يكون ${adj} ${issue.minimum.toString()} ${sizing.unit}`;
						return `أصغر من اللازم: يفترض لـ ${issue.origin} أن يكون ${adj} ${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `نَص غير مقبول: يجب أن يبدأ بـ "${issue.prefix}"`;
						if (_issue.format === "ends_with") return `نَص غير مقبول: يجب أن ينتهي بـ "${_issue.suffix}"`;
						if (_issue.format === "includes") return `نَص غير مقبول: يجب أن يتضمَّن "${_issue.includes}"`;
						if (_issue.format === "regex") return `نَص غير مقبول: يجب أن يطابق النمط ${_issue.pattern}`;
						return `${FormatDictionary[_issue.format] ?? issue.format} غير مقبول`;
					}
					case "not_multiple_of": return `رقم غير مقبول: يجب أن يكون من مضاعفات ${issue.divisor}`;
					case "unrecognized_keys": return `معرف${issue.keys.length > 1 ? "ات" : ""} غريب${issue.keys.length > 1 ? "ة" : ""}: ${joinValues(issue.keys, "، ")}`;
					case "invalid_key": return `معرف غير مقبول في ${issue.origin}`;
					case "invalid_union": return "مدخل غير مقبول";
					case "invalid_element": return `مدخل غير مقبول في ${issue.origin}`;
					default: return "مدخل غير مقبول";
				}
			};
		};
		function ar_default() {
			return { localeError: error$49() };
		}
		const error$48 = () => {
			const Sizable = {
				string: {
					unit: "simvol",
					verb: "olmalıdır"
				},
				file: {
					unit: "bayt",
					verb: "olmalıdır"
				},
				array: {
					unit: "element",
					verb: "olmalıdır"
				},
				set: {
					unit: "element",
					verb: "olmalıdır"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "input",
				email: "email address",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO datetime",
				date: "ISO date",
				time: "ISO time",
				duration: "ISO duration",
				ipv4: "IPv4 address",
				ipv6: "IPv6 address",
				cidrv4: "IPv4 range",
				cidrv6: "IPv6 range",
				base64: "base64-encoded string",
				base64url: "base64url-encoded string",
				json_string: "JSON string",
				e164: "E.164 number",
				jwt: "JWT",
				template_literal: "input"
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Yanlış dəyər: gözlənilən instanceof ${issue.expected}, daxil olan ${received}`;
						return `Yanlış dəyər: gözlənilən ${expected}, daxil olan ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Yanlış dəyər: gözlənilən ${stringifyPrimitive(issue.values[0])}`;
						return `Yanlış seçim: aşağıdakılardan biri olmalıdır: ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Çox böyük: gözlənilən ${issue.origin ?? "dəyər"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "element"}`;
						return `Çox böyük: gözlənilən ${issue.origin ?? "dəyər"} ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Çox kiçik: gözlənilən ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Çox kiçik: gözlənilən ${issue.origin} ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Yanlış mətn: "${_issue.prefix}" ilə başlamalıdır`;
						if (_issue.format === "ends_with") return `Yanlış mətn: "${_issue.suffix}" ilə bitməlidir`;
						if (_issue.format === "includes") return `Yanlış mətn: "${_issue.includes}" daxil olmalıdır`;
						if (_issue.format === "regex") return `Yanlış mətn: ${_issue.pattern} şablonuna uyğun olmalıdır`;
						return `Yanlış ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Yanlış ədəd: ${issue.divisor} ilə bölünə bilən olmalıdır`;
					case "unrecognized_keys": return `Tanınmayan açar${issue.keys.length > 1 ? "lar" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `${issue.origin} daxilində yanlış açar`;
					case "invalid_union": return "Yanlış dəyər";
					case "invalid_element": return `${issue.origin} daxilində yanlış dəyər`;
					default: return `Yanlış dəyər`;
				}
			};
		};
		function az_default() {
			return { localeError: error$48() };
		}
		function getBelarusianPlural(count, one, few, many) {
			const absCount = Math.abs(count);
			const lastDigit = absCount % 10;
			const lastTwoDigits = absCount % 100;
			if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return many;
			if (lastDigit === 1) return one;
			if (lastDigit >= 2 && lastDigit <= 4) return few;
			return many;
		}
		const error$47 = () => {
			const Sizable = {
				string: {
					unit: {
						one: "сімвал",
						few: "сімвалы",
						many: "сімвалаў"
					},
					verb: "мець"
				},
				array: {
					unit: {
						one: "элемент",
						few: "элементы",
						many: "элементаў"
					},
					verb: "мець"
				},
				set: {
					unit: {
						one: "элемент",
						few: "элементы",
						many: "элементаў"
					},
					verb: "мець"
				},
				file: {
					unit: {
						one: "байт",
						few: "байты",
						many: "байтаў"
					},
					verb: "мець"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "увод",
				email: "email адрас",
				url: "URL",
				emoji: "эмодзі",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO дата і час",
				date: "ISO дата",
				time: "ISO час",
				duration: "ISO працягласць",
				ipv4: "IPv4 адрас",
				ipv6: "IPv6 адрас",
				cidrv4: "IPv4 дыяпазон",
				cidrv6: "IPv6 дыяпазон",
				base64: "радок у фармаце base64",
				base64url: "радок у фармаце base64url",
				json_string: "JSON радок",
				e164: "нумар E.164",
				jwt: "JWT",
				template_literal: "увод"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "лік",
				array: "масіў"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Няправільны ўвод: чакаўся instanceof ${issue.expected}, атрымана ${received}`;
						return `Няправільны ўвод: чакаўся ${expected}, атрымана ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Няправільны ўвод: чакалася ${stringifyPrimitive(issue.values[0])}`;
						return `Няправільны варыянт: чакаўся адзін з ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) {
							const unit = getBelarusianPlural(Number(issue.maximum), sizing.unit.one, sizing.unit.few, sizing.unit.many);
							return `Занадта вялікі: чакалася, што ${issue.origin ?? "значэнне"} павінна ${sizing.verb} ${adj}${issue.maximum.toString()} ${unit}`;
						}
						return `Занадта вялікі: чакалася, што ${issue.origin ?? "значэнне"} павінна быць ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) {
							const unit = getBelarusianPlural(Number(issue.minimum), sizing.unit.one, sizing.unit.few, sizing.unit.many);
							return `Занадта малы: чакалася, што ${issue.origin} павінна ${sizing.verb} ${adj}${issue.minimum.toString()} ${unit}`;
						}
						return `Занадта малы: чакалася, што ${issue.origin} павінна быць ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Няправільны радок: павінен пачынацца з "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Няправільны радок: павінен заканчвацца на "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Няправільны радок: павінен змяшчаць "${_issue.includes}"`;
						if (_issue.format === "regex") return `Няправільны радок: павінен адпавядаць шаблону ${_issue.pattern}`;
						return `Няправільны ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Няправільны лік: павінен быць кратным ${issue.divisor}`;
					case "unrecognized_keys": return `Нераспазнаны ${issue.keys.length > 1 ? "ключы" : "ключ"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Няправільны ключ у ${issue.origin}`;
					case "invalid_union": return "Няправільны ўвод";
					case "invalid_element": return `Няправільнае значэнне ў ${issue.origin}`;
					default: return `Няправільны ўвод`;
				}
			};
		};
		function be_default() {
			return { localeError: error$47() };
		}
		const error$46 = () => {
			const Sizable = {
				string: {
					unit: "символа",
					verb: "да съдържа"
				},
				file: {
					unit: "байта",
					verb: "да съдържа"
				},
				array: {
					unit: "елемента",
					verb: "да съдържа"
				},
				set: {
					unit: "елемента",
					verb: "да съдържа"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "вход",
				email: "имейл адрес",
				url: "URL",
				emoji: "емоджи",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO време",
				date: "ISO дата",
				time: "ISO време",
				duration: "ISO продължителност",
				ipv4: "IPv4 адрес",
				ipv6: "IPv6 адрес",
				cidrv4: "IPv4 диапазон",
				cidrv6: "IPv6 диапазон",
				base64: "base64-кодиран низ",
				base64url: "base64url-кодиран низ",
				json_string: "JSON низ",
				e164: "E.164 номер",
				jwt: "JWT",
				template_literal: "вход"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "число",
				array: "масив"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Невалиден вход: очакван instanceof ${issue.expected}, получен ${received}`;
						return `Невалиден вход: очакван ${expected}, получен ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Невалиден вход: очакван ${stringifyPrimitive(issue.values[0])}`;
						return `Невалидна опция: очаквано едно от ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Твърде голямо: очаква се ${issue.origin ?? "стойност"} да съдържа ${adj}${issue.maximum.toString()} ${sizing.unit ?? "елемента"}`;
						return `Твърде голямо: очаква се ${issue.origin ?? "стойност"} да бъде ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Твърде малко: очаква се ${issue.origin} да съдържа ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Твърде малко: очаква се ${issue.origin} да бъде ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Невалиден низ: трябва да започва с "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Невалиден низ: трябва да завършва с "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Невалиден низ: трябва да включва "${_issue.includes}"`;
						if (_issue.format === "regex") return `Невалиден низ: трябва да съвпада с ${_issue.pattern}`;
						let invalid_adj = "Невалиден";
						if (_issue.format === "emoji") invalid_adj = "Невалидно";
						if (_issue.format === "datetime") invalid_adj = "Невалидно";
						if (_issue.format === "date") invalid_adj = "Невалидна";
						if (_issue.format === "time") invalid_adj = "Невалидно";
						if (_issue.format === "duration") invalid_adj = "Невалидна";
						return `${invalid_adj} ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Невалидно число: трябва да бъде кратно на ${issue.divisor}`;
					case "unrecognized_keys": return `Неразпознат${issue.keys.length > 1 ? "и" : ""} ключ${issue.keys.length > 1 ? "ове" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Невалиден ключ в ${issue.origin}`;
					case "invalid_union": return "Невалиден вход";
					case "invalid_element": return `Невалидна стойност в ${issue.origin}`;
					default: return `Невалиден вход`;
				}
			};
		};
		function bg_default() {
			return { localeError: error$46() };
		}
		const error$45 = () => {
			const Sizable = {
				string: {
					unit: "caràcters",
					verb: "contenir"
				},
				file: {
					unit: "bytes",
					verb: "contenir"
				},
				array: {
					unit: "elements",
					verb: "contenir"
				},
				set: {
					unit: "elements",
					verb: "contenir"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "entrada",
				email: "adreça electrònica",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "data i hora ISO",
				date: "data ISO",
				time: "hora ISO",
				duration: "durada ISO",
				ipv4: "adreça IPv4",
				ipv6: "adreça IPv6",
				cidrv4: "rang IPv4",
				cidrv6: "rang IPv6",
				base64: "cadena codificada en base64",
				base64url: "cadena codificada en base64url",
				json_string: "cadena JSON",
				e164: "número E.164",
				jwt: "JWT",
				template_literal: "entrada"
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Tipus invàlid: s'esperava instanceof ${issue.expected}, s'ha rebut ${received}`;
						return `Tipus invàlid: s'esperava ${expected}, s'ha rebut ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Valor invàlid: s'esperava ${stringifyPrimitive(issue.values[0])}`;
						return `Opció invàlida: s'esperava una de ${joinValues(issue.values, " o ")}`;
					case "too_big": {
						const adj = issue.inclusive ? "com a màxim" : "menys de";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Massa gran: s'esperava que ${issue.origin ?? "el valor"} contingués ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
						return `Massa gran: s'esperava que ${issue.origin ?? "el valor"} fos ${adj} ${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? "com a mínim" : "més de";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Massa petit: s'esperava que ${issue.origin} contingués ${adj} ${issue.minimum.toString()} ${sizing.unit}`;
						return `Massa petit: s'esperava que ${issue.origin} fos ${adj} ${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Format invàlid: ha de començar amb "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Format invàlid: ha d'acabar amb "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Format invàlid: ha d'incloure "${_issue.includes}"`;
						if (_issue.format === "regex") return `Format invàlid: ha de coincidir amb el patró ${_issue.pattern}`;
						return `Format invàlid per a ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Número invàlid: ha de ser múltiple de ${issue.divisor}`;
					case "unrecognized_keys": return `Clau${issue.keys.length > 1 ? "s" : ""} no reconeguda${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Clau invàlida a ${issue.origin}`;
					case "invalid_union": return "Entrada invàlida";
					case "invalid_element": return `Element invàlid a ${issue.origin}`;
					default: return `Entrada invàlida`;
				}
			};
		};
		function ca_default() {
			return { localeError: error$45() };
		}
		const error$44 = () => {
			const Sizable = {
				string: {
					unit: "znaků",
					verb: "mít"
				},
				file: {
					unit: "bajtů",
					verb: "mít"
				},
				array: {
					unit: "prvků",
					verb: "mít"
				},
				set: {
					unit: "prvků",
					verb: "mít"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "regulární výraz",
				email: "e-mailová adresa",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "datum a čas ve formátu ISO",
				date: "datum ve formátu ISO",
				time: "čas ve formátu ISO",
				duration: "doba trvání ISO",
				ipv4: "IPv4 adresa",
				ipv6: "IPv6 adresa",
				cidrv4: "rozsah IPv4",
				cidrv6: "rozsah IPv6",
				base64: "řetězec zakódovaný ve formátu base64",
				base64url: "řetězec zakódovaný ve formátu base64url",
				json_string: "řetězec ve formátu JSON",
				e164: "číslo E.164",
				jwt: "JWT",
				template_literal: "vstup"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "číslo",
				string: "řetězec",
				function: "funkce",
				array: "pole"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Neplatný vstup: očekáváno instanceof ${issue.expected}, obdrženo ${received}`;
						return `Neplatný vstup: očekáváno ${expected}, obdrženo ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Neplatný vstup: očekáváno ${stringifyPrimitive(issue.values[0])}`;
						return `Neplatná možnost: očekávána jedna z hodnot ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Hodnota je příliš velká: ${issue.origin ?? "hodnota"} musí mít ${adj}${issue.maximum.toString()} ${sizing.unit ?? "prvků"}`;
						return `Hodnota je příliš velká: ${issue.origin ?? "hodnota"} musí být ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Hodnota je příliš malá: ${issue.origin ?? "hodnota"} musí mít ${adj}${issue.minimum.toString()} ${sizing.unit ?? "prvků"}`;
						return `Hodnota je příliš malá: ${issue.origin ?? "hodnota"} musí být ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Neplatný řetězec: musí začínat na "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Neplatný řetězec: musí končit na "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Neplatný řetězec: musí obsahovat "${_issue.includes}"`;
						if (_issue.format === "regex") return `Neplatný řetězec: musí odpovídat vzoru ${_issue.pattern}`;
						return `Neplatný formát ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Neplatné číslo: musí být násobkem ${issue.divisor}`;
					case "unrecognized_keys": return `Neznámé klíče: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Neplatný klíč v ${issue.origin}`;
					case "invalid_union": return "Neplatný vstup";
					case "invalid_element": return `Neplatná hodnota v ${issue.origin}`;
					default: return `Neplatný vstup`;
				}
			};
		};
		function cs_default() {
			return { localeError: error$44() };
		}
		const error$43 = () => {
			const Sizable = {
				string: {
					unit: "tegn",
					verb: "havde"
				},
				file: {
					unit: "bytes",
					verb: "havde"
				},
				array: {
					unit: "elementer",
					verb: "indeholdt"
				},
				set: {
					unit: "elementer",
					verb: "indeholdt"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "input",
				email: "e-mailadresse",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO dato- og klokkeslæt",
				date: "ISO-dato",
				time: "ISO-klokkeslæt",
				duration: "ISO-varighed",
				ipv4: "IPv4-område",
				ipv6: "IPv6-område",
				cidrv4: "IPv4-spektrum",
				cidrv6: "IPv6-spektrum",
				base64: "base64-kodet streng",
				base64url: "base64url-kodet streng",
				json_string: "JSON-streng",
				e164: "E.164-nummer",
				jwt: "JWT",
				template_literal: "input"
			};
			const TypeDictionary = {
				nan: "NaN",
				string: "streng",
				number: "tal",
				boolean: "boolean",
				array: "liste",
				object: "objekt",
				set: "sæt",
				file: "fil"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Ugyldigt input: forventede instanceof ${issue.expected}, fik ${received}`;
						return `Ugyldigt input: forventede ${expected}, fik ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Ugyldig værdi: forventede ${stringifyPrimitive(issue.values[0])}`;
						return `Ugyldigt valg: forventede en af følgende ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						const origin = TypeDictionary[issue.origin] ?? issue.origin;
						if (sizing) return `For stor: forventede ${origin ?? "value"} ${sizing.verb} ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "elementer"}`;
						return `For stor: forventede ${origin ?? "value"} havde ${adj} ${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						const origin = TypeDictionary[issue.origin] ?? issue.origin;
						if (sizing) return `For lille: forventede ${origin} ${sizing.verb} ${adj} ${issue.minimum.toString()} ${sizing.unit}`;
						return `For lille: forventede ${origin} havde ${adj} ${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Ugyldig streng: skal starte med "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Ugyldig streng: skal ende med "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Ugyldig streng: skal indeholde "${_issue.includes}"`;
						if (_issue.format === "regex") return `Ugyldig streng: skal matche mønsteret ${_issue.pattern}`;
						return `Ugyldig ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Ugyldigt tal: skal være deleligt med ${issue.divisor}`;
					case "unrecognized_keys": return `${issue.keys.length > 1 ? "Ukendte nøgler" : "Ukendt nøgle"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Ugyldig nøgle i ${issue.origin}`;
					case "invalid_union": return "Ugyldigt input: matcher ingen af de tilladte typer";
					case "invalid_element": return `Ugyldig værdi i ${issue.origin}`;
					default: return `Ugyldigt input`;
				}
			};
		};
		function da_default() {
			return { localeError: error$43() };
		}
		const error$42 = () => {
			const Sizable = {
				string: {
					unit: "Zeichen",
					verb: "zu haben"
				},
				file: {
					unit: "Bytes",
					verb: "zu haben"
				},
				array: {
					unit: "Elemente",
					verb: "zu haben"
				},
				set: {
					unit: "Elemente",
					verb: "zu haben"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "Eingabe",
				email: "E-Mail-Adresse",
				url: "URL",
				emoji: "Emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO-Datum und -Uhrzeit",
				date: "ISO-Datum",
				time: "ISO-Uhrzeit",
				duration: "ISO-Dauer",
				ipv4: "IPv4-Adresse",
				ipv6: "IPv6-Adresse",
				cidrv4: "IPv4-Bereich",
				cidrv6: "IPv6-Bereich",
				base64: "Base64-codierter String",
				base64url: "Base64-URL-codierter String",
				json_string: "JSON-String",
				e164: "E.164-Nummer",
				jwt: "JWT",
				template_literal: "Eingabe"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "Zahl",
				array: "Array"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Ungültige Eingabe: erwartet instanceof ${issue.expected}, erhalten ${received}`;
						return `Ungültige Eingabe: erwartet ${expected}, erhalten ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Ungültige Eingabe: erwartet ${stringifyPrimitive(issue.values[0])}`;
						return `Ungültige Option: erwartet eine von ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Zu groß: erwartet, dass ${issue.origin ?? "Wert"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "Elemente"} hat`;
						return `Zu groß: erwartet, dass ${issue.origin ?? "Wert"} ${adj}${issue.maximum.toString()} ist`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Zu klein: erwartet, dass ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit} hat`;
						return `Zu klein: erwartet, dass ${issue.origin} ${adj}${issue.minimum.toString()} ist`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Ungültiger String: muss mit "${_issue.prefix}" beginnen`;
						if (_issue.format === "ends_with") return `Ungültiger String: muss mit "${_issue.suffix}" enden`;
						if (_issue.format === "includes") return `Ungültiger String: muss "${_issue.includes}" enthalten`;
						if (_issue.format === "regex") return `Ungültiger String: muss dem Muster ${_issue.pattern} entsprechen`;
						return `Ungültig: ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Ungültige Zahl: muss ein Vielfaches von ${issue.divisor} sein`;
					case "unrecognized_keys": return `${issue.keys.length > 1 ? "Unbekannte Schlüssel" : "Unbekannter Schlüssel"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Ungültiger Schlüssel in ${issue.origin}`;
					case "invalid_union": return "Ungültige Eingabe";
					case "invalid_element": return `Ungültiger Wert in ${issue.origin}`;
					default: return `Ungültige Eingabe`;
				}
			};
		};
		function de_default() {
			return { localeError: error$42() };
		}
		const error$41 = () => {
			const Sizable = {
				string: {
					unit: "χαρακτήρες",
					verb: "να έχει"
				},
				file: {
					unit: "bytes",
					verb: "να έχει"
				},
				array: {
					unit: "στοιχεία",
					verb: "να έχει"
				},
				set: {
					unit: "στοιχεία",
					verb: "να έχει"
				},
				map: {
					unit: "καταχωρήσεις",
					verb: "να έχει"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "είσοδος",
				email: "διεύθυνση email",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO ημερομηνία και ώρα",
				date: "ISO ημερομηνία",
				time: "ISO ώρα",
				duration: "ISO διάρκεια",
				ipv4: "διεύθυνση IPv4",
				ipv6: "διεύθυνση IPv6",
				mac: "διεύθυνση MAC",
				cidrv4: "εύρος IPv4",
				cidrv6: "εύρος IPv6",
				base64: "συμβολοσειρά κωδικοποιημένη σε base64",
				base64url: "συμβολοσειρά κωδικοποιημένη σε base64url",
				json_string: "συμβολοσειρά JSON",
				e164: "αριθμός E.164",
				jwt: "JWT",
				template_literal: "είσοδος"
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (typeof issue.expected === "string" && /^[A-Z]/.test(issue.expected)) return `Μη έγκυρη είσοδος: αναμενόταν instanceof ${issue.expected}, λήφθηκε ${received}`;
						return `Μη έγκυρη είσοδος: αναμενόταν ${expected}, λήφθηκε ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Μη έγκυρη είσοδος: αναμενόταν ${stringifyPrimitive(issue.values[0])}`;
						return `Μη έγκυρη επιλογή: αναμενόταν ένα από ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Πολύ μεγάλο: αναμενόταν ${issue.origin ?? "τιμή"} να έχει ${adj}${issue.maximum.toString()} ${sizing.unit ?? "στοιχεία"}`;
						return `Πολύ μεγάλο: αναμενόταν ${issue.origin ?? "τιμή"} να είναι ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Πολύ μικρό: αναμενόταν ${issue.origin} να έχει ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Πολύ μικρό: αναμενόταν ${issue.origin} να είναι ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Μη έγκυρη συμβολοσειρά: πρέπει να ξεκινά με "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Μη έγκυρη συμβολοσειρά: πρέπει να τελειώνει με "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Μη έγκυρη συμβολοσειρά: πρέπει να περιέχει "${_issue.includes}"`;
						if (_issue.format === "regex") return `Μη έγκυρη συμβολοσειρά: πρέπει να ταιριάζει με το μοτίβο ${_issue.pattern}`;
						return `Μη έγκυρο: ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Μη έγκυρος αριθμός: πρέπει να είναι πολλαπλάσιο του ${issue.divisor}`;
					case "unrecognized_keys": return `Άγνωστ${issue.keys.length > 1 ? "α" : "ο"} κλειδ${issue.keys.length > 1 ? "ιά" : "ί"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Μη έγκυρο κλειδί στο ${issue.origin}`;
					case "invalid_union": return "Μη έγκυρη είσοδος";
					case "invalid_element": return `Μη έγκυρη τιμή στο ${issue.origin}`;
					default: return `Μη έγκυρη είσοδος`;
				}
			};
		};
		function el_default() {
			return { localeError: error$41() };
		}
		const error$40 = () => {
			const Sizable = {
				string: {
					unit: "characters",
					verb: "to have"
				},
				file: {
					unit: "bytes",
					verb: "to have"
				},
				array: {
					unit: "items",
					verb: "to have"
				},
				set: {
					unit: "items",
					verb: "to have"
				},
				map: {
					unit: "entries",
					verb: "to have"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "input",
				email: "email address",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO datetime",
				date: "ISO date",
				time: "ISO time",
				duration: "ISO duration",
				ipv4: "IPv4 address",
				ipv6: "IPv6 address",
				mac: "MAC address",
				cidrv4: "IPv4 range",
				cidrv6: "IPv6 range",
				base64: "base64-encoded string",
				base64url: "base64url-encoded string",
				json_string: "JSON string",
				e164: "E.164 number",
				jwt: "JWT",
				template_literal: "input"
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						return `Invalid input: expected ${expected}, received ${TypeDictionary[receivedType] ?? receivedType}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
						return `Invalid option: expected one of ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
						return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Invalid string: must start with "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Invalid string: must end with "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Invalid string: must include "${_issue.includes}"`;
						if (_issue.format === "regex") return `Invalid string: must match pattern ${_issue.pattern}`;
						return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Invalid number: must be a multiple of ${issue.divisor}`;
					case "unrecognized_keys": return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Invalid key in ${issue.origin}`;
					case "invalid_union":
						if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) return `Invalid discriminator value. Expected ${issue.options.map((o) => `'${o}'`).join(" | ")}`;
						return "Invalid input";
					case "invalid_element": return `Invalid value in ${issue.origin}`;
					default: return `Invalid input`;
				}
			};
		};
		function en_default() {
			return { localeError: error$40() };
		}
		const error$39 = () => {
			const Sizable = {
				string: {
					unit: "karaktrojn",
					verb: "havi"
				},
				file: {
					unit: "bajtojn",
					verb: "havi"
				},
				array: {
					unit: "elementojn",
					verb: "havi"
				},
				set: {
					unit: "elementojn",
					verb: "havi"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "enigo",
				email: "retadreso",
				url: "URL",
				emoji: "emoĝio",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO-datotempo",
				date: "ISO-dato",
				time: "ISO-tempo",
				duration: "ISO-daŭro",
				ipv4: "IPv4-adreso",
				ipv6: "IPv6-adreso",
				cidrv4: "IPv4-rango",
				cidrv6: "IPv6-rango",
				base64: "64-ume kodita karaktraro",
				base64url: "URL-64-ume kodita karaktraro",
				json_string: "JSON-karaktraro",
				e164: "E.164-nombro",
				jwt: "JWT",
				template_literal: "enigo"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "nombro",
				array: "tabelo",
				null: "senvalora"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Nevalida enigo: atendiĝis instanceof ${issue.expected}, riceviĝis ${received}`;
						return `Nevalida enigo: atendiĝis ${expected}, riceviĝis ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Nevalida enigo: atendiĝis ${stringifyPrimitive(issue.values[0])}`;
						return `Nevalida opcio: atendiĝis unu el ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Tro granda: atendiĝis ke ${issue.origin ?? "valoro"} havu ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementojn"}`;
						return `Tro granda: atendiĝis ke ${issue.origin ?? "valoro"} havu ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Tro malgranda: atendiĝis ke ${issue.origin} havu ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Tro malgranda: atendiĝis ke ${issue.origin} estu ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Nevalida karaktraro: devas komenciĝi per "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Nevalida karaktraro: devas finiĝi per "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Nevalida karaktraro: devas inkluzivi "${_issue.includes}"`;
						if (_issue.format === "regex") return `Nevalida karaktraro: devas kongrui kun la modelo ${_issue.pattern}`;
						return `Nevalida ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Nevalida nombro: devas esti oblo de ${issue.divisor}`;
					case "unrecognized_keys": return `Nekonata${issue.keys.length > 1 ? "j" : ""} ŝlosilo${issue.keys.length > 1 ? "j" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Nevalida ŝlosilo en ${issue.origin}`;
					case "invalid_union": return "Nevalida enigo";
					case "invalid_element": return `Nevalida valoro en ${issue.origin}`;
					default: return `Nevalida enigo`;
				}
			};
		};
		function eo_default() {
			return { localeError: error$39() };
		}
		const error$38 = () => {
			const Sizable = {
				string: {
					unit: "caracteres",
					verb: "tener"
				},
				file: {
					unit: "bytes",
					verb: "tener"
				},
				array: {
					unit: "elementos",
					verb: "tener"
				},
				set: {
					unit: "elementos",
					verb: "tener"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "entrada",
				email: "dirección de correo electrónico",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "fecha y hora ISO",
				date: "fecha ISO",
				time: "hora ISO",
				duration: "duración ISO",
				ipv4: "dirección IPv4",
				ipv6: "dirección IPv6",
				cidrv4: "rango IPv4",
				cidrv6: "rango IPv6",
				base64: "cadena codificada en base64",
				base64url: "URL codificada en base64",
				json_string: "cadena JSON",
				e164: "número E.164",
				jwt: "JWT",
				template_literal: "entrada"
			};
			const TypeDictionary = {
				nan: "NaN",
				string: "texto",
				number: "número",
				boolean: "booleano",
				array: "arreglo",
				object: "objeto",
				set: "conjunto",
				file: "archivo",
				date: "fecha",
				bigint: "número grande",
				symbol: "símbolo",
				undefined: "indefinido",
				null: "nulo",
				function: "función",
				map: "mapa",
				record: "registro",
				tuple: "tupla",
				enum: "enumeración",
				union: "unión",
				literal: "literal",
				promise: "promesa",
				void: "vacío",
				never: "nunca",
				unknown: "desconocido",
				any: "cualquiera"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Entrada inválida: se esperaba instanceof ${issue.expected}, recibido ${received}`;
						return `Entrada inválida: se esperaba ${expected}, recibido ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Entrada inválida: se esperaba ${stringifyPrimitive(issue.values[0])}`;
						return `Opción inválida: se esperaba una de ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						const origin = TypeDictionary[issue.origin] ?? issue.origin;
						if (sizing) return `Demasiado grande: se esperaba que ${origin ?? "valor"} tuviera ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementos"}`;
						return `Demasiado grande: se esperaba que ${origin ?? "valor"} fuera ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						const origin = TypeDictionary[issue.origin] ?? issue.origin;
						if (sizing) return `Demasiado pequeño: se esperaba que ${origin} tuviera ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Demasiado pequeño: se esperaba que ${origin} fuera ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Cadena inválida: debe comenzar con "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Cadena inválida: debe terminar en "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Cadena inválida: debe incluir "${_issue.includes}"`;
						if (_issue.format === "regex") return `Cadena inválida: debe coincidir con el patrón ${_issue.pattern}`;
						return `Inválido ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Número inválido: debe ser múltiplo de ${issue.divisor}`;
					case "unrecognized_keys": return `Llave${issue.keys.length > 1 ? "s" : ""} desconocida${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Llave inválida en ${TypeDictionary[issue.origin] ?? issue.origin}`;
					case "invalid_union": return "Entrada inválida";
					case "invalid_element": return `Valor inválido en ${TypeDictionary[issue.origin] ?? issue.origin}`;
					default: return `Entrada inválida`;
				}
			};
		};
		function es_default() {
			return { localeError: error$38() };
		}
		const error$37 = () => {
			const Sizable = {
				string: {
					unit: "کاراکتر",
					verb: "داشته باشد"
				},
				file: {
					unit: "بایت",
					verb: "داشته باشد"
				},
				array: {
					unit: "آیتم",
					verb: "داشته باشد"
				},
				set: {
					unit: "آیتم",
					verb: "داشته باشد"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "ورودی",
				email: "آدرس ایمیل",
				url: "URL",
				emoji: "ایموجی",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "تاریخ و زمان ایزو",
				date: "تاریخ ایزو",
				time: "زمان ایزو",
				duration: "مدت زمان ایزو",
				ipv4: "IPv4 آدرس",
				ipv6: "IPv6 آدرس",
				cidrv4: "IPv4 دامنه",
				cidrv6: "IPv6 دامنه",
				base64: "base64-encoded رشته",
				base64url: "base64url-encoded رشته",
				json_string: "JSON رشته",
				e164: "E.164 عدد",
				jwt: "JWT",
				template_literal: "ورودی"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "عدد",
				array: "آرایه"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `ورودی نامعتبر: می‌بایست instanceof ${issue.expected} می‌بود، ${received} دریافت شد`;
						return `ورودی نامعتبر: می‌بایست ${expected} می‌بود، ${received} دریافت شد`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `ورودی نامعتبر: می‌بایست ${stringifyPrimitive(issue.values[0])} می‌بود`;
						return `گزینه نامعتبر: می‌بایست یکی از ${joinValues(issue.values, "|")} می‌بود`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `خیلی بزرگ: ${issue.origin ?? "مقدار"} باید ${adj}${issue.maximum.toString()} ${sizing.unit ?? "عنصر"} باشد`;
						return `خیلی بزرگ: ${issue.origin ?? "مقدار"} باید ${adj}${issue.maximum.toString()} باشد`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `خیلی کوچک: ${issue.origin} باید ${adj}${issue.minimum.toString()} ${sizing.unit} باشد`;
						return `خیلی کوچک: ${issue.origin} باید ${adj}${issue.minimum.toString()} باشد`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `رشته نامعتبر: باید با "${_issue.prefix}" شروع شود`;
						if (_issue.format === "ends_with") return `رشته نامعتبر: باید با "${_issue.suffix}" تمام شود`;
						if (_issue.format === "includes") return `رشته نامعتبر: باید شامل "${_issue.includes}" باشد`;
						if (_issue.format === "regex") return `رشته نامعتبر: باید با الگوی ${_issue.pattern} مطابقت داشته باشد`;
						return `${FormatDictionary[_issue.format] ?? issue.format} نامعتبر`;
					}
					case "not_multiple_of": return `عدد نامعتبر: باید مضرب ${issue.divisor} باشد`;
					case "unrecognized_keys": return `کلید${issue.keys.length > 1 ? "های" : ""} ناشناس: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `کلید ناشناس در ${issue.origin}`;
					case "invalid_union": return `ورودی نامعتبر`;
					case "invalid_element": return `مقدار نامعتبر در ${issue.origin}`;
					default: return `ورودی نامعتبر`;
				}
			};
		};
		function fa_default() {
			return { localeError: error$37() };
		}
		const error$36 = () => {
			const Sizable = {
				string: {
					unit: "merkkiä",
					subject: "merkkijonon"
				},
				file: {
					unit: "tavua",
					subject: "tiedoston"
				},
				array: {
					unit: "alkiota",
					subject: "listan"
				},
				set: {
					unit: "alkiota",
					subject: "joukon"
				},
				number: {
					unit: "",
					subject: "luvun"
				},
				bigint: {
					unit: "",
					subject: "suuren kokonaisluvun"
				},
				int: {
					unit: "",
					subject: "kokonaisluvun"
				},
				date: {
					unit: "",
					subject: "päivämäärän"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "säännöllinen lauseke",
				email: "sähköpostiosoite",
				url: "URL-osoite",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO-aikaleima",
				date: "ISO-päivämäärä",
				time: "ISO-aika",
				duration: "ISO-kesto",
				ipv4: "IPv4-osoite",
				ipv6: "IPv6-osoite",
				cidrv4: "IPv4-alue",
				cidrv6: "IPv6-alue",
				base64: "base64-koodattu merkkijono",
				base64url: "base64url-koodattu merkkijono",
				json_string: "JSON-merkkijono",
				e164: "E.164-luku",
				jwt: "JWT",
				template_literal: "templaattimerkkijono"
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Virheellinen tyyppi: odotettiin instanceof ${issue.expected}, oli ${received}`;
						return `Virheellinen tyyppi: odotettiin ${expected}, oli ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Virheellinen syöte: täytyy olla ${stringifyPrimitive(issue.values[0])}`;
						return `Virheellinen valinta: täytyy olla yksi seuraavista: ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Liian suuri: ${sizing.subject} täytyy olla ${adj}${issue.maximum.toString()} ${sizing.unit}`.trim();
						return `Liian suuri: arvon täytyy olla ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Liian pieni: ${sizing.subject} täytyy olla ${adj}${issue.minimum.toString()} ${sizing.unit}`.trim();
						return `Liian pieni: arvon täytyy olla ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Virheellinen syöte: täytyy alkaa "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Virheellinen syöte: täytyy loppua "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Virheellinen syöte: täytyy sisältää "${_issue.includes}"`;
						if (_issue.format === "regex") return `Virheellinen syöte: täytyy vastata säännöllistä lauseketta ${_issue.pattern}`;
						return `Virheellinen ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Virheellinen luku: täytyy olla luvun ${issue.divisor} monikerta`;
					case "unrecognized_keys": return `${issue.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return "Virheellinen avain tietueessa";
					case "invalid_union": return "Virheellinen unioni";
					case "invalid_element": return "Virheellinen arvo joukossa";
					default: return `Virheellinen syöte`;
				}
			};
		};
		function fi_default() {
			return { localeError: error$36() };
		}
		const error$35 = () => {
			const Sizable = {
				string: {
					unit: "caractères",
					verb: "avoir"
				},
				file: {
					unit: "octets",
					verb: "avoir"
				},
				array: {
					unit: "éléments",
					verb: "avoir"
				},
				set: {
					unit: "éléments",
					verb: "avoir"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "entrée",
				email: "adresse e-mail",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "date et heure ISO",
				date: "date ISO",
				time: "heure ISO",
				duration: "durée ISO",
				ipv4: "adresse IPv4",
				ipv6: "adresse IPv6",
				cidrv4: "plage IPv4",
				cidrv6: "plage IPv6",
				base64: "chaîne encodée en base64",
				base64url: "chaîne encodée en base64url",
				json_string: "chaîne JSON",
				e164: "numéro E.164",
				jwt: "JWT",
				template_literal: "entrée"
			};
			const TypeDictionary = {
				string: "chaîne",
				number: "nombre",
				int: "entier",
				boolean: "booléen",
				bigint: "grand entier",
				symbol: "symbole",
				undefined: "indéfini",
				null: "null",
				never: "jamais",
				void: "vide",
				date: "date",
				array: "tableau",
				object: "objet",
				tuple: "tuple",
				record: "enregistrement",
				map: "carte",
				set: "ensemble",
				file: "fichier",
				nonoptional: "non-optionnel",
				nan: "NaN",
				function: "fonction"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Entrée invalide : instanceof ${issue.expected} attendu, ${received} reçu`;
						return `Entrée invalide : ${expected} attendu, ${received} reçu`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Entrée invalide : ${stringifyPrimitive(issue.values[0])} attendu`;
						return `Option invalide : une valeur parmi ${joinValues(issue.values, "|")} attendue`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Trop grand : ${TypeDictionary[issue.origin] ?? "valeur"} doit ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "élément(s)"}`;
						return `Trop grand : ${TypeDictionary[issue.origin] ?? "valeur"} doit être ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Trop petit : ${TypeDictionary[issue.origin] ?? "valeur"} doit ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Trop petit : ${TypeDictionary[issue.origin] ?? "valeur"} doit être ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Chaîne invalide : doit commencer par "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Chaîne invalide : doit se terminer par "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Chaîne invalide : doit inclure "${_issue.includes}"`;
						if (_issue.format === "regex") return `Chaîne invalide : doit correspondre au modèle ${_issue.pattern}`;
						return `${FormatDictionary[_issue.format] ?? issue.format} invalide`;
					}
					case "not_multiple_of": return `Nombre invalide : doit être un multiple de ${issue.divisor}`;
					case "unrecognized_keys": return `Clé${issue.keys.length > 1 ? "s" : ""} non reconnue${issue.keys.length > 1 ? "s" : ""} : ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Clé invalide dans ${issue.origin}`;
					case "invalid_union": return "Entrée invalide";
					case "invalid_element": return `Valeur invalide dans ${issue.origin}`;
					default: return `Entrée invalide`;
				}
			};
		};
		function fr_default() {
			return { localeError: error$35() };
		}
		const error$34 = () => {
			const Sizable = {
				string: {
					unit: "caractères",
					verb: "avoir"
				},
				file: {
					unit: "octets",
					verb: "avoir"
				},
				array: {
					unit: "éléments",
					verb: "avoir"
				},
				set: {
					unit: "éléments",
					verb: "avoir"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "entrée",
				email: "adresse courriel",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "date-heure ISO",
				date: "date ISO",
				time: "heure ISO",
				duration: "durée ISO",
				ipv4: "adresse IPv4",
				ipv6: "adresse IPv6",
				cidrv4: "plage IPv4",
				cidrv6: "plage IPv6",
				base64: "chaîne encodée en base64",
				base64url: "chaîne encodée en base64url",
				json_string: "chaîne JSON",
				e164: "numéro E.164",
				jwt: "JWT",
				template_literal: "entrée"
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Entrée invalide : attendu instanceof ${issue.expected}, reçu ${received}`;
						return `Entrée invalide : attendu ${expected}, reçu ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Entrée invalide : attendu ${stringifyPrimitive(issue.values[0])}`;
						return `Option invalide : attendu l'une des valeurs suivantes ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "≤" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Trop grand : attendu que ${issue.origin ?? "la valeur"} ait ${adj}${issue.maximum.toString()} ${sizing.unit}`;
						return `Trop grand : attendu que ${issue.origin ?? "la valeur"} soit ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? "≥" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Trop petit : attendu que ${issue.origin} ait ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Trop petit : attendu que ${issue.origin} soit ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Chaîne invalide : doit commencer par "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Chaîne invalide : doit se terminer par "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Chaîne invalide : doit inclure "${_issue.includes}"`;
						if (_issue.format === "regex") return `Chaîne invalide : doit correspondre au motif ${_issue.pattern}`;
						return `${FormatDictionary[_issue.format] ?? issue.format} invalide`;
					}
					case "not_multiple_of": return `Nombre invalide : doit être un multiple de ${issue.divisor}`;
					case "unrecognized_keys": return `Clé${issue.keys.length > 1 ? "s" : ""} non reconnue${issue.keys.length > 1 ? "s" : ""} : ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Clé invalide dans ${issue.origin}`;
					case "invalid_union": return "Entrée invalide";
					case "invalid_element": return `Valeur invalide dans ${issue.origin}`;
					default: return `Entrée invalide`;
				}
			};
		};
		function fr_CA_default() {
			return { localeError: error$34() };
		}
		const error$33 = () => {
			const TypeNames = {
				string: {
					label: "מחרוזת",
					gender: "f"
				},
				number: {
					label: "מספר",
					gender: "m"
				},
				boolean: {
					label: "ערך בוליאני",
					gender: "m"
				},
				bigint: {
					label: "BigInt",
					gender: "m"
				},
				date: {
					label: "תאריך",
					gender: "m"
				},
				array: {
					label: "מערך",
					gender: "m"
				},
				object: {
					label: "אובייקט",
					gender: "m"
				},
				null: {
					label: "ערך ריק (null)",
					gender: "m"
				},
				undefined: {
					label: "ערך לא מוגדר (undefined)",
					gender: "m"
				},
				symbol: {
					label: "סימבול (Symbol)",
					gender: "m"
				},
				function: {
					label: "פונקציה",
					gender: "f"
				},
				map: {
					label: "מפה (Map)",
					gender: "f"
				},
				set: {
					label: "קבוצה (Set)",
					gender: "f"
				},
				file: {
					label: "קובץ",
					gender: "m"
				},
				promise: {
					label: "Promise",
					gender: "m"
				},
				NaN: {
					label: "NaN",
					gender: "m"
				},
				unknown: {
					label: "ערך לא ידוע",
					gender: "m"
				},
				value: {
					label: "ערך",
					gender: "m"
				}
			};
			const Sizable = {
				string: {
					unit: "תווים",
					shortLabel: "קצר",
					longLabel: "ארוך"
				},
				file: {
					unit: "בייטים",
					shortLabel: "קטן",
					longLabel: "גדול"
				},
				array: {
					unit: "פריטים",
					shortLabel: "קטן",
					longLabel: "גדול"
				},
				set: {
					unit: "פריטים",
					shortLabel: "קטן",
					longLabel: "גדול"
				},
				number: {
					unit: "",
					shortLabel: "קטן",
					longLabel: "גדול"
				}
			};
			const typeEntry = (t) => t ? TypeNames[t] : void 0;
			const typeLabel = (t) => {
				const e = typeEntry(t);
				if (e) return e.label;
				return t ?? TypeNames.unknown.label;
			};
			const withDefinite = (t) => `ה${typeLabel(t)}`;
			const verbFor = (t) => {
				return (typeEntry(t)?.gender ?? "m") === "f" ? "צריכה להיות" : "צריך להיות";
			};
			const getSizing = (origin) => {
				if (!origin) return null;
				return Sizable[origin] ?? null;
			};
			const FormatDictionary = {
				regex: {
					label: "קלט",
					gender: "m"
				},
				email: {
					label: "כתובת אימייל",
					gender: "f"
				},
				url: {
					label: "כתובת רשת",
					gender: "f"
				},
				emoji: {
					label: "אימוג'י",
					gender: "m"
				},
				uuid: {
					label: "UUID",
					gender: "m"
				},
				nanoid: {
					label: "nanoid",
					gender: "m"
				},
				guid: {
					label: "GUID",
					gender: "m"
				},
				cuid: {
					label: "cuid",
					gender: "m"
				},
				cuid2: {
					label: "cuid2",
					gender: "m"
				},
				ulid: {
					label: "ULID",
					gender: "m"
				},
				xid: {
					label: "XID",
					gender: "m"
				},
				ksuid: {
					label: "KSUID",
					gender: "m"
				},
				datetime: {
					label: "תאריך וזמן ISO",
					gender: "m"
				},
				date: {
					label: "תאריך ISO",
					gender: "m"
				},
				time: {
					label: "זמן ISO",
					gender: "m"
				},
				duration: {
					label: "משך זמן ISO",
					gender: "m"
				},
				ipv4: {
					label: "כתובת IPv4",
					gender: "f"
				},
				ipv6: {
					label: "כתובת IPv6",
					gender: "f"
				},
				cidrv4: {
					label: "טווח IPv4",
					gender: "m"
				},
				cidrv6: {
					label: "טווח IPv6",
					gender: "m"
				},
				base64: {
					label: "מחרוזת בבסיס 64",
					gender: "f"
				},
				base64url: {
					label: "מחרוזת בבסיס 64 לכתובות רשת",
					gender: "f"
				},
				json_string: {
					label: "מחרוזת JSON",
					gender: "f"
				},
				e164: {
					label: "מספר E.164",
					gender: "m"
				},
				jwt: {
					label: "JWT",
					gender: "m"
				},
				ends_with: {
					label: "קלט",
					gender: "m"
				},
				includes: {
					label: "קלט",
					gender: "m"
				},
				lowercase: {
					label: "קלט",
					gender: "m"
				},
				starts_with: {
					label: "קלט",
					gender: "m"
				},
				uppercase: {
					label: "קלט",
					gender: "m"
				}
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expectedKey = issue.expected;
						const expected = TypeDictionary[expectedKey ?? ""] ?? typeLabel(expectedKey);
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? TypeNames[receivedType]?.label ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `קלט לא תקין: צריך להיות instanceof ${issue.expected}, התקבל ${received}`;
						return `קלט לא תקין: צריך להיות ${expected}, התקבל ${received}`;
					}
					case "invalid_value": {
						if (issue.values.length === 1) return `ערך לא תקין: הערך חייב להיות ${stringifyPrimitive(issue.values[0])}`;
						const stringified = issue.values.map((v) => stringifyPrimitive(v));
						if (issue.values.length === 2) return `ערך לא תקין: האפשרויות המתאימות הן ${stringified[0]} או ${stringified[1]}`;
						const lastValue = stringified[stringified.length - 1];
						return `ערך לא תקין: האפשרויות המתאימות הן ${stringified.slice(0, -1).join(", ")} או ${lastValue}`;
					}
					case "too_big": {
						const sizing = getSizing(issue.origin);
						const subject = withDefinite(issue.origin ?? "value");
						if (issue.origin === "string") return `${sizing?.longLabel ?? "ארוך"} מדי: ${subject} צריכה להכיל ${issue.maximum.toString()} ${sizing?.unit ?? ""} ${issue.inclusive ? "או פחות" : "לכל היותר"}`.trim();
						if (issue.origin === "number") return `גדול מדי: ${subject} צריך להיות ${issue.inclusive ? `קטן או שווה ל-${issue.maximum}` : `קטן מ-${issue.maximum}`}`;
						if (issue.origin === "array" || issue.origin === "set") return `גדול מדי: ${subject} ${issue.origin === "set" ? "צריכה" : "צריך"} להכיל ${issue.inclusive ? `${issue.maximum} ${sizing?.unit ?? ""} או פחות` : `פחות מ-${issue.maximum} ${sizing?.unit ?? ""}`}`.trim();
						const adj = issue.inclusive ? "<=" : "<";
						const be = verbFor(issue.origin ?? "value");
						if (sizing?.unit) return `${sizing.longLabel} מדי: ${subject} ${be} ${adj}${issue.maximum.toString()} ${sizing.unit}`;
						return `${sizing?.longLabel ?? "גדול"} מדי: ${subject} ${be} ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const sizing = getSizing(issue.origin);
						const subject = withDefinite(issue.origin ?? "value");
						if (issue.origin === "string") return `${sizing?.shortLabel ?? "קצר"} מדי: ${subject} צריכה להכיל ${issue.minimum.toString()} ${sizing?.unit ?? ""} ${issue.inclusive ? "או יותר" : "לפחות"}`.trim();
						if (issue.origin === "number") return `קטן מדי: ${subject} צריך להיות ${issue.inclusive ? `גדול או שווה ל-${issue.minimum}` : `גדול מ-${issue.minimum}`}`;
						if (issue.origin === "array" || issue.origin === "set") {
							const verb = issue.origin === "set" ? "צריכה" : "צריך";
							if (issue.minimum === 1 && issue.inclusive) return `קטן מדי: ${subject} ${verb} להכיל ${issue.origin === "set" ? "לפחות פריט אחד" : "לפחות פריט אחד"}`;
							return `קטן מדי: ${subject} ${verb} להכיל ${issue.inclusive ? `${issue.minimum} ${sizing?.unit ?? ""} או יותר` : `יותר מ-${issue.minimum} ${sizing?.unit ?? ""}`}`.trim();
						}
						const adj = issue.inclusive ? ">=" : ">";
						const be = verbFor(issue.origin ?? "value");
						if (sizing?.unit) return `${sizing.shortLabel} מדי: ${subject} ${be} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `${sizing?.shortLabel ?? "קטן"} מדי: ${subject} ${be} ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `המחרוזת חייבת להתחיל ב "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `המחרוזת חייבת להסתיים ב "${_issue.suffix}"`;
						if (_issue.format === "includes") return `המחרוזת חייבת לכלול "${_issue.includes}"`;
						if (_issue.format === "regex") return `המחרוזת חייבת להתאים לתבנית ${_issue.pattern}`;
						const nounEntry = FormatDictionary[_issue.format];
						return `${nounEntry?.label ?? _issue.format} לא ${(nounEntry?.gender ?? "m") === "f" ? "תקינה" : "תקין"}`;
					}
					case "not_multiple_of": return `מספר לא תקין: חייב להיות מכפלה של ${issue.divisor}`;
					case "unrecognized_keys": return `מפתח${issue.keys.length > 1 ? "ות" : ""} לא מזוה${issue.keys.length > 1 ? "ים" : "ה"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `שדה לא תקין באובייקט`;
					case "invalid_union": return "קלט לא תקין";
					case "invalid_element": return `ערך לא תקין ב${withDefinite(issue.origin ?? "array")}`;
					default: return `קלט לא תקין`;
				}
			};
		};
		function he_default() {
			return { localeError: error$33() };
		}
		const error$32 = () => {
			const Sizable = {
				string: {
					unit: "znakova",
					verb: "imati"
				},
				file: {
					unit: "bajtova",
					verb: "imati"
				},
				array: {
					unit: "stavki",
					verb: "imati"
				},
				set: {
					unit: "stavki",
					verb: "imati"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "unos",
				email: "email adresa",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO datum i vrijeme",
				date: "ISO datum",
				time: "ISO vrijeme",
				duration: "ISO trajanje",
				ipv4: "IPv4 adresa",
				ipv6: "IPv6 adresa",
				cidrv4: "IPv4 raspon",
				cidrv6: "IPv6 raspon",
				base64: "base64 kodirani tekst",
				base64url: "base64url kodirani tekst",
				json_string: "JSON tekst",
				e164: "E.164 broj",
				jwt: "JWT",
				template_literal: "unos"
			};
			const TypeDictionary = {
				nan: "NaN",
				string: "tekst",
				number: "broj",
				boolean: "boolean",
				array: "niz",
				object: "objekt",
				set: "skup",
				file: "datoteka",
				date: "datum",
				bigint: "bigint",
				symbol: "simbol",
				undefined: "undefined",
				null: "null",
				function: "funkcija",
				map: "mapa"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Neispravan unos: očekuje se instanceof ${issue.expected}, a primljeno je ${received}`;
						return `Neispravan unos: očekuje se ${expected}, a primljeno je ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Neispravna vrijednost: očekivano ${stringifyPrimitive(issue.values[0])}`;
						return `Neispravna opcija: očekivano jedno od ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						const origin = TypeDictionary[issue.origin] ?? issue.origin;
						if (sizing) return `Preveliko: očekivano da ${origin ?? "vrijednost"} ima ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elemenata"}`;
						return `Preveliko: očekivano da ${origin ?? "vrijednost"} bude ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						const origin = TypeDictionary[issue.origin] ?? issue.origin;
						if (sizing) return `Premalo: očekivano da ${origin} ima ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Premalo: očekivano da ${origin} bude ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Neispravan tekst: mora započinjati s "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Neispravan tekst: mora završavati s "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Neispravan tekst: mora sadržavati "${_issue.includes}"`;
						if (_issue.format === "regex") return `Neispravan tekst: mora odgovarati uzorku ${_issue.pattern}`;
						return `Neispravna ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Neispravan broj: mora biti višekratnik od ${issue.divisor}`;
					case "unrecognized_keys": return `Neprepoznat${issue.keys.length > 1 ? "i ključevi" : " ključ"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Neispravan ključ u ${TypeDictionary[issue.origin] ?? issue.origin}`;
					case "invalid_union": return "Neispravan unos";
					case "invalid_element": return `Neispravna vrijednost u ${TypeDictionary[issue.origin] ?? issue.origin}`;
					default: return `Neispravan unos`;
				}
			};
		};
		function hr_default() {
			return { localeError: error$32() };
		}
		const error$31 = () => {
			const Sizable = {
				string: {
					unit: "karakter",
					verb: "legyen"
				},
				file: {
					unit: "byte",
					verb: "legyen"
				},
				array: {
					unit: "elem",
					verb: "legyen"
				},
				set: {
					unit: "elem",
					verb: "legyen"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "bemenet",
				email: "email cím",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO időbélyeg",
				date: "ISO dátum",
				time: "ISO idő",
				duration: "ISO időintervallum",
				ipv4: "IPv4 cím",
				ipv6: "IPv6 cím",
				cidrv4: "IPv4 tartomány",
				cidrv6: "IPv6 tartomány",
				base64: "base64-kódolt string",
				base64url: "base64url-kódolt string",
				json_string: "JSON string",
				e164: "E.164 szám",
				jwt: "JWT",
				template_literal: "bemenet"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "szám",
				array: "tömb"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Érvénytelen bemenet: a várt érték instanceof ${issue.expected}, a kapott érték ${received}`;
						return `Érvénytelen bemenet: a várt érték ${expected}, a kapott érték ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Érvénytelen bemenet: a várt érték ${stringifyPrimitive(issue.values[0])}`;
						return `Érvénytelen opció: valamelyik érték várt ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Túl nagy: ${issue.origin ?? "érték"} mérete túl nagy ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elem"}`;
						return `Túl nagy: a bemeneti érték ${issue.origin ?? "érték"} túl nagy: ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Túl kicsi: a bemeneti érték ${issue.origin} mérete túl kicsi ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Túl kicsi: a bemeneti érték ${issue.origin} túl kicsi ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Érvénytelen string: "${_issue.prefix}" értékkel kell kezdődnie`;
						if (_issue.format === "ends_with") return `Érvénytelen string: "${_issue.suffix}" értékkel kell végződnie`;
						if (_issue.format === "includes") return `Érvénytelen string: "${_issue.includes}" értéket kell tartalmaznia`;
						if (_issue.format === "regex") return `Érvénytelen string: ${_issue.pattern} mintának kell megfelelnie`;
						return `Érvénytelen ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Érvénytelen szám: ${issue.divisor} többszörösének kell lennie`;
					case "unrecognized_keys": return `Ismeretlen kulcs${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Érvénytelen kulcs ${issue.origin}`;
					case "invalid_union": return "Érvénytelen bemenet";
					case "invalid_element": return `Érvénytelen érték: ${issue.origin}`;
					default: return `Érvénytelen bemenet`;
				}
			};
		};
		function hu_default() {
			return { localeError: error$31() };
		}
		function getArmenianPlural(count, one, many) {
			return Math.abs(count) === 1 ? one : many;
		}
		function withDefiniteArticle(word) {
			if (!word) return "";
			const vowels = [
				"ա",
				"ե",
				"ը",
				"ի",
				"ո",
				"ու",
				"օ"
			];
			const lastChar = word[word.length - 1];
			return word + (vowels.includes(lastChar) ? "ն" : "ը");
		}
		const error$30 = () => {
			const Sizable = {
				string: {
					unit: {
						one: "նշան",
						many: "նշաններ"
					},
					verb: "ունենալ"
				},
				file: {
					unit: {
						one: "բայթ",
						many: "բայթեր"
					},
					verb: "ունենալ"
				},
				array: {
					unit: {
						one: "տարր",
						many: "տարրեր"
					},
					verb: "ունենալ"
				},
				set: {
					unit: {
						one: "տարր",
						many: "տարրեր"
					},
					verb: "ունենալ"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "մուտք",
				email: "էլ. հասցե",
				url: "URL",
				emoji: "էմոջի",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO ամսաթիվ և ժամ",
				date: "ISO ամսաթիվ",
				time: "ISO ժամ",
				duration: "ISO տևողություն",
				ipv4: "IPv4 հասցե",
				ipv6: "IPv6 հասցե",
				cidrv4: "IPv4 միջակայք",
				cidrv6: "IPv6 միջակայք",
				base64: "base64 ձևաչափով տող",
				base64url: "base64url ձևաչափով տող",
				json_string: "JSON տող",
				e164: "E.164 համար",
				jwt: "JWT",
				template_literal: "մուտք"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "թիվ",
				array: "զանգված"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Սխալ մուտքագրում․ սպասվում էր instanceof ${issue.expected}, ստացվել է ${received}`;
						return `Սխալ մուտքագրում․ սպասվում էր ${expected}, ստացվել է ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Սխալ մուտքագրում․ սպասվում էր ${stringifyPrimitive(issue.values[1])}`;
						return `Սխալ տարբերակ․ սպասվում էր հետևյալներից մեկը՝ ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) {
							const unit = getArmenianPlural(Number(issue.maximum), sizing.unit.one, sizing.unit.many);
							return `Չափազանց մեծ արժեք․ սպասվում է, որ ${withDefiniteArticle(issue.origin ?? "արժեք")} կունենա ${adj}${issue.maximum.toString()} ${unit}`;
						}
						return `Չափազանց մեծ արժեք․ սպասվում է, որ ${withDefiniteArticle(issue.origin ?? "արժեք")} լինի ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) {
							const unit = getArmenianPlural(Number(issue.minimum), sizing.unit.one, sizing.unit.many);
							return `Չափազանց փոքր արժեք․ սպասվում է, որ ${withDefiniteArticle(issue.origin)} կունենա ${adj}${issue.minimum.toString()} ${unit}`;
						}
						return `Չափազանց փոքր արժեք․ սպասվում է, որ ${withDefiniteArticle(issue.origin)} լինի ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Սխալ տող․ պետք է սկսվի "${_issue.prefix}"-ով`;
						if (_issue.format === "ends_with") return `Սխալ տող․ պետք է ավարտվի "${_issue.suffix}"-ով`;
						if (_issue.format === "includes") return `Սխալ տող․ պետք է պարունակի "${_issue.includes}"`;
						if (_issue.format === "regex") return `Սխալ տող․ պետք է համապատասխանի ${_issue.pattern} ձևաչափին`;
						return `Սխալ ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Սխալ թիվ․ պետք է բազմապատիկ լինի ${issue.divisor}-ի`;
					case "unrecognized_keys": return `Չճանաչված բանալի${issue.keys.length > 1 ? "ներ" : ""}. ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Սխալ բանալի ${withDefiniteArticle(issue.origin)}-ում`;
					case "invalid_union": return "Սխալ մուտքագրում";
					case "invalid_element": return `Սխալ արժեք ${withDefiniteArticle(issue.origin)}-ում`;
					default: return `Սխալ մուտքագրում`;
				}
			};
		};
		function hy_default() {
			return { localeError: error$30() };
		}
		const error$29 = () => {
			const Sizable = {
				string: {
					unit: "karakter",
					verb: "memiliki"
				},
				file: {
					unit: "byte",
					verb: "memiliki"
				},
				array: {
					unit: "item",
					verb: "memiliki"
				},
				set: {
					unit: "item",
					verb: "memiliki"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "input",
				email: "alamat email",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "tanggal dan waktu format ISO",
				date: "tanggal format ISO",
				time: "jam format ISO",
				duration: "durasi format ISO",
				ipv4: "alamat IPv4",
				ipv6: "alamat IPv6",
				cidrv4: "rentang alamat IPv4",
				cidrv6: "rentang alamat IPv6",
				base64: "string dengan enkode base64",
				base64url: "string dengan enkode base64url",
				json_string: "string JSON",
				e164: "angka E.164",
				jwt: "JWT",
				template_literal: "input"
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Input tidak valid: diharapkan instanceof ${issue.expected}, diterima ${received}`;
						return `Input tidak valid: diharapkan ${expected}, diterima ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Input tidak valid: diharapkan ${stringifyPrimitive(issue.values[0])}`;
						return `Pilihan tidak valid: diharapkan salah satu dari ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Terlalu besar: diharapkan ${issue.origin ?? "value"} memiliki ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elemen"}`;
						return `Terlalu besar: diharapkan ${issue.origin ?? "value"} menjadi ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Terlalu kecil: diharapkan ${issue.origin} memiliki ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Terlalu kecil: diharapkan ${issue.origin} menjadi ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `String tidak valid: harus dimulai dengan "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `String tidak valid: harus berakhir dengan "${_issue.suffix}"`;
						if (_issue.format === "includes") return `String tidak valid: harus menyertakan "${_issue.includes}"`;
						if (_issue.format === "regex") return `String tidak valid: harus sesuai pola ${_issue.pattern}`;
						return `${FormatDictionary[_issue.format] ?? issue.format} tidak valid`;
					}
					case "not_multiple_of": return `Angka tidak valid: harus kelipatan dari ${issue.divisor}`;
					case "unrecognized_keys": return `Kunci tidak dikenali ${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Kunci tidak valid di ${issue.origin}`;
					case "invalid_union": return "Input tidak valid";
					case "invalid_element": return `Nilai tidak valid di ${issue.origin}`;
					default: return `Input tidak valid`;
				}
			};
		};
		function id_default() {
			return { localeError: error$29() };
		}
		const error$28 = () => {
			const Sizable = {
				string: {
					unit: "stafi",
					verb: "að hafa"
				},
				file: {
					unit: "bæti",
					verb: "að hafa"
				},
				array: {
					unit: "hluti",
					verb: "að hafa"
				},
				set: {
					unit: "hluti",
					verb: "að hafa"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "gildi",
				email: "netfang",
				url: "vefslóð",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO dagsetning og tími",
				date: "ISO dagsetning",
				time: "ISO tími",
				duration: "ISO tímalengd",
				ipv4: "IPv4 address",
				ipv6: "IPv6 address",
				cidrv4: "IPv4 range",
				cidrv6: "IPv6 range",
				base64: "base64-encoded strengur",
				base64url: "base64url-encoded strengur",
				json_string: "JSON strengur",
				e164: "E.164 tölugildi",
				jwt: "JWT",
				template_literal: "gildi"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "númer",
				array: "fylki"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Rangt gildi: Þú slóst inn ${received} þar sem á að vera instanceof ${issue.expected}`;
						return `Rangt gildi: Þú slóst inn ${received} þar sem á að vera ${expected}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Rangt gildi: gert ráð fyrir ${stringifyPrimitive(issue.values[0])}`;
						return `Ógilt val: má vera eitt af eftirfarandi ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Of stórt: gert er ráð fyrir að ${issue.origin ?? "gildi"} hafi ${adj}${issue.maximum.toString()} ${sizing.unit ?? "hluti"}`;
						return `Of stórt: gert er ráð fyrir að ${issue.origin ?? "gildi"} sé ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Of lítið: gert er ráð fyrir að ${issue.origin} hafi ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Of lítið: gert er ráð fyrir að ${issue.origin} sé ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Ógildur strengur: verður að byrja á "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Ógildur strengur: verður að enda á "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Ógildur strengur: verður að innihalda "${_issue.includes}"`;
						if (_issue.format === "regex") return `Ógildur strengur: verður að fylgja mynstri ${_issue.pattern}`;
						return `Rangt ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Röng tala: verður að vera margfeldi af ${issue.divisor}`;
					case "unrecognized_keys": return `Óþekkt ${issue.keys.length > 1 ? "ir lyklar" : "ur lykill"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Rangur lykill í ${issue.origin}`;
					case "invalid_union": return "Rangt gildi";
					case "invalid_element": return `Rangt gildi í ${issue.origin}`;
					default: return `Rangt gildi`;
				}
			};
		};
		function is_default() {
			return { localeError: error$28() };
		}
		const error$27 = () => {
			const Sizable = {
				string: {
					unit: "caratteri",
					verb: "avere"
				},
				file: {
					unit: "byte",
					verb: "avere"
				},
				array: {
					unit: "elementi",
					verb: "avere"
				},
				set: {
					unit: "elementi",
					verb: "avere"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "input",
				email: "indirizzo email",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "data e ora ISO",
				date: "data ISO",
				time: "ora ISO",
				duration: "durata ISO",
				ipv4: "indirizzo IPv4",
				ipv6: "indirizzo IPv6",
				cidrv4: "intervallo IPv4",
				cidrv6: "intervallo IPv6",
				base64: "stringa codificata in base64",
				base64url: "URL codificata in base64",
				json_string: "stringa JSON",
				e164: "numero E.164",
				jwt: "JWT",
				template_literal: "input"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "numero",
				array: "vettore"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Input non valido: atteso instanceof ${issue.expected}, ricevuto ${received}`;
						return `Input non valido: atteso ${expected}, ricevuto ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Input non valido: atteso ${stringifyPrimitive(issue.values[0])}`;
						return `Opzione non valida: atteso uno tra ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Troppo grande: ${issue.origin ?? "valore"} deve avere ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementi"}`;
						return `Troppo grande: ${issue.origin ?? "valore"} deve essere ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Troppo piccolo: ${issue.origin} deve avere ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Troppo piccolo: ${issue.origin} deve essere ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Stringa non valida: deve iniziare con "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Stringa non valida: deve terminare con "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Stringa non valida: deve includere "${_issue.includes}"`;
						if (_issue.format === "regex") return `Stringa non valida: deve corrispondere al pattern ${_issue.pattern}`;
						return `Input non valido: ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Numero non valido: deve essere un multiplo di ${issue.divisor}`;
					case "unrecognized_keys": return `Chiav${issue.keys.length > 1 ? "i" : "e"} non riconosciut${issue.keys.length > 1 ? "e" : "a"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Chiave non valida in ${issue.origin}`;
					case "invalid_union": return "Input non valido";
					case "invalid_element": return `Valore non valido in ${issue.origin}`;
					default: return `Input non valido`;
				}
			};
		};
		function it_default() {
			return { localeError: error$27() };
		}
		const error$26 = () => {
			const Sizable = {
				string: {
					unit: "文字",
					verb: "である"
				},
				file: {
					unit: "バイト",
					verb: "である"
				},
				array: {
					unit: "要素",
					verb: "である"
				},
				set: {
					unit: "要素",
					verb: "である"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "入力値",
				email: "メールアドレス",
				url: "URL",
				emoji: "絵文字",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO日時",
				date: "ISO日付",
				time: "ISO時刻",
				duration: "ISO期間",
				ipv4: "IPv4アドレス",
				ipv6: "IPv6アドレス",
				cidrv4: "IPv4範囲",
				cidrv6: "IPv6範囲",
				base64: "base64エンコード文字列",
				base64url: "base64urlエンコード文字列",
				json_string: "JSON文字列",
				e164: "E.164番号",
				jwt: "JWT",
				template_literal: "入力値"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "数値",
				array: "配列"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `無効な入力: instanceof ${issue.expected}が期待されましたが、${received}が入力されました`;
						return `無効な入力: ${expected}が期待されましたが、${received}が入力されました`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `無効な入力: ${stringifyPrimitive(issue.values[0])}が期待されました`;
						return `無効な選択: ${joinValues(issue.values, "、")}のいずれかである必要があります`;
					case "too_big": {
						const adj = issue.inclusive ? "以下である" : "より小さい";
						const sizing = getSizing(issue.origin);
						if (sizing) return `大きすぎる値: ${issue.origin ?? "値"}は${issue.maximum.toString()}${sizing.unit ?? "要素"}${adj}必要があります`;
						return `大きすぎる値: ${issue.origin ?? "値"}は${issue.maximum.toString()}${adj}必要があります`;
					}
					case "too_small": {
						const adj = issue.inclusive ? "以上である" : "より大きい";
						const sizing = getSizing(issue.origin);
						if (sizing) return `小さすぎる値: ${issue.origin}は${issue.minimum.toString()}${sizing.unit}${adj}必要があります`;
						return `小さすぎる値: ${issue.origin}は${issue.minimum.toString()}${adj}必要があります`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `無効な文字列: "${_issue.prefix}"で始まる必要があります`;
						if (_issue.format === "ends_with") return `無効な文字列: "${_issue.suffix}"で終わる必要があります`;
						if (_issue.format === "includes") return `無効な文字列: "${_issue.includes}"を含む必要があります`;
						if (_issue.format === "regex") return `無効な文字列: パターン${_issue.pattern}に一致する必要があります`;
						return `無効な${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `無効な数値: ${issue.divisor}の倍数である必要があります`;
					case "unrecognized_keys": return `認識されていないキー${issue.keys.length > 1 ? "群" : ""}: ${joinValues(issue.keys, "、")}`;
					case "invalid_key": return `${issue.origin}内の無効なキー`;
					case "invalid_union": return "無効な入力";
					case "invalid_element": return `${issue.origin}内の無効な値`;
					default: return `無効な入力`;
				}
			};
		};
		function ja_default() {
			return { localeError: error$26() };
		}
		const error$25 = () => {
			const Sizable = {
				string: {
					unit: "სიმბოლო",
					verb: "უნდა შეიცავდეს"
				},
				file: {
					unit: "ბაიტი",
					verb: "უნდა შეიცავდეს"
				},
				array: {
					unit: "ელემენტი",
					verb: "უნდა შეიცავდეს"
				},
				set: {
					unit: "ელემენტი",
					verb: "უნდა შეიცავდეს"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "შეყვანა",
				email: "ელ-ფოსტის მისამართი",
				url: "URL",
				emoji: "ემოჯი",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "თარიღი-დრო",
				date: "თარიღი",
				time: "დრო",
				duration: "ხანგრძლივობა",
				ipv4: "IPv4 მისამართი",
				ipv6: "IPv6 მისამართი",
				cidrv4: "IPv4 დიაპაზონი",
				cidrv6: "IPv6 დიაპაზონი",
				base64: "base64-კოდირებული ველი",
				base64url: "base64url-კოდირებული ველი",
				json_string: "JSON ველი",
				e164: "E.164 ნომერი",
				jwt: "JWT",
				template_literal: "შეყვანა"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "რიცხვი",
				string: "ველი",
				boolean: "ბულეანი",
				function: "ფუნქცია",
				array: "მასივი"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `არასწორი შეყვანა: მოსალოდნელი instanceof ${issue.expected}, მიღებული ${received}`;
						return `არასწორი შეყვანა: მოსალოდნელი ${expected}, მიღებული ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `არასწორი შეყვანა: მოსალოდნელი ${stringifyPrimitive(issue.values[0])}`;
						return `არასწორი ვარიანტი: მოსალოდნელია ერთ-ერთი ${joinValues(issue.values, "|")}-დან`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `ზედმეტად დიდი: მოსალოდნელი ${issue.origin ?? "მნიშვნელობა"} ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit}`;
						return `ზედმეტად დიდი: მოსალოდნელი ${issue.origin ?? "მნიშვნელობა"} იყოს ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `ზედმეტად პატარა: მოსალოდნელი ${issue.origin} ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `ზედმეტად პატარა: მოსალოდნელი ${issue.origin} იყოს ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `არასწორი ველი: უნდა იწყებოდეს "${_issue.prefix}"-ით`;
						if (_issue.format === "ends_with") return `არასწორი ველი: უნდა მთავრდებოდეს "${_issue.suffix}"-ით`;
						if (_issue.format === "includes") return `არასწორი ველი: უნდა შეიცავდეს "${_issue.includes}"-ს`;
						if (_issue.format === "regex") return `არასწორი ველი: უნდა შეესაბამებოდეს შაბლონს ${_issue.pattern}`;
						return `არასწორი ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `არასწორი რიცხვი: უნდა იყოს ${issue.divisor}-ის ჯერადი`;
					case "unrecognized_keys": return `უცნობი გასაღებ${issue.keys.length > 1 ? "ები" : "ი"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `არასწორი გასაღები ${issue.origin}-ში`;
					case "invalid_union": return "არასწორი შეყვანა";
					case "invalid_element": return `არასწორი მნიშვნელობა ${issue.origin}-ში`;
					default: return `არასწორი შეყვანა`;
				}
			};
		};
		function ka_default() {
			return { localeError: error$25() };
		}
		const error$24 = () => {
			const Sizable = {
				string: {
					unit: "តួអក្សរ",
					verb: "គួរមាន"
				},
				file: {
					unit: "បៃ",
					verb: "គួរមាន"
				},
				array: {
					unit: "ធាតុ",
					verb: "គួរមាន"
				},
				set: {
					unit: "ធាតុ",
					verb: "គួរមាន"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "ទិន្នន័យបញ្ចូល",
				email: "អាសយដ្ឋានអ៊ីមែល",
				url: "URL",
				emoji: "សញ្ញាអារម្មណ៍",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "កាលបរិច្ឆេទ និងម៉ោង ISO",
				date: "កាលបរិច្ឆេទ ISO",
				time: "ម៉ោង ISO",
				duration: "រយៈពេល ISO",
				ipv4: "អាសយដ្ឋាន IPv4",
				ipv6: "អាសយដ្ឋាន IPv6",
				cidrv4: "ដែនអាសយដ្ឋាន IPv4",
				cidrv6: "ដែនអាសយដ្ឋាន IPv6",
				base64: "ខ្សែអក្សរអ៊ិកូដ base64",
				base64url: "ខ្សែអក្សរអ៊ិកូដ base64url",
				json_string: "ខ្សែអក្សរ JSON",
				e164: "លេខ E.164",
				jwt: "JWT",
				template_literal: "ទិន្នន័យបញ្ចូល"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "លេខ",
				array: "អារេ (Array)",
				null: "គ្មានតម្លៃ (null)"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ៖ ត្រូវការ instanceof ${issue.expected} ប៉ុន្តែទទួលបាន ${received}`;
						return `ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ៖ ត្រូវការ ${expected} ប៉ុន្តែទទួលបាន ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `ទិន្នន័យបញ្ចូលមិនត្រឹមត្រូវ៖ ត្រូវការ ${stringifyPrimitive(issue.values[0])}`;
						return `ជម្រើសមិនត្រឹមត្រូវ៖ ត្រូវជាមួយក្នុងចំណោម ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `ធំពេក៖ ត្រូវការ ${issue.origin ?? "តម្លៃ"} ${adj} ${issue.maximum.toString()} ${sizing.unit ?? "ធាតុ"}`;
						return `ធំពេក៖ ត្រូវការ ${issue.origin ?? "តម្លៃ"} ${adj} ${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `តូចពេក៖ ត្រូវការ ${issue.origin} ${adj} ${issue.minimum.toString()} ${sizing.unit}`;
						return `តូចពេក៖ ត្រូវការ ${issue.origin} ${adj} ${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវចាប់ផ្តើមដោយ "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវបញ្ចប់ដោយ "${_issue.suffix}"`;
						if (_issue.format === "includes") return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវមាន "${_issue.includes}"`;
						if (_issue.format === "regex") return `ខ្សែអក្សរមិនត្រឹមត្រូវ៖ ត្រូវតែផ្គូផ្គងនឹងទម្រង់ដែលបានកំណត់ ${_issue.pattern}`;
						return `មិនត្រឹមត្រូវ៖ ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `លេខមិនត្រឹមត្រូវ៖ ត្រូវតែជាពហុគុណនៃ ${issue.divisor}`;
					case "unrecognized_keys": return `រកឃើញសោមិនស្គាល់៖ ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `សោមិនត្រឹមត្រូវនៅក្នុង ${issue.origin}`;
					case "invalid_union": return `ទិន្នន័យមិនត្រឹមត្រូវ`;
					case "invalid_element": return `ទិន្នន័យមិនត្រឹមត្រូវនៅក្នុង ${issue.origin}`;
					default: return `ទិន្នន័យមិនត្រឹមត្រូវ`;
				}
			};
		};
		function km_default() {
			return { localeError: error$24() };
		}
		/** @deprecated Use `km` instead. */
		function kh_default() {
			return km_default();
		}
		const error$23 = () => {
			const Sizable = {
				string: {
					unit: "문자",
					verb: "to have"
				},
				file: {
					unit: "바이트",
					verb: "to have"
				},
				array: {
					unit: "개",
					verb: "to have"
				},
				set: {
					unit: "개",
					verb: "to have"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "입력",
				email: "이메일 주소",
				url: "URL",
				emoji: "이모지",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO 날짜시간",
				date: "ISO 날짜",
				time: "ISO 시간",
				duration: "ISO 기간",
				ipv4: "IPv4 주소",
				ipv6: "IPv6 주소",
				cidrv4: "IPv4 범위",
				cidrv6: "IPv6 범위",
				base64: "base64 인코딩 문자열",
				base64url: "base64url 인코딩 문자열",
				json_string: "JSON 문자열",
				e164: "E.164 번호",
				jwt: "JWT",
				template_literal: "입력"
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `잘못된 입력: 예상 타입은 instanceof ${issue.expected}, 받은 타입은 ${received}입니다`;
						return `잘못된 입력: 예상 타입은 ${expected}, 받은 타입은 ${received}입니다`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `잘못된 입력: 값은 ${stringifyPrimitive(issue.values[0])} 이어야 합니다`;
						return `잘못된 옵션: ${joinValues(issue.values, "또는 ")} 중 하나여야 합니다`;
					case "too_big": {
						const adj = issue.inclusive ? "이하" : "미만";
						const suffix = adj === "미만" ? "이어야 합니다" : "여야 합니다";
						const sizing = getSizing(issue.origin);
						const unit = sizing?.unit ?? "요소";
						if (sizing) return `${issue.origin ?? "값"}이 너무 큽니다: ${issue.maximum.toString()}${unit} ${adj}${suffix}`;
						return `${issue.origin ?? "값"}이 너무 큽니다: ${issue.maximum.toString()} ${adj}${suffix}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? "이상" : "초과";
						const suffix = adj === "이상" ? "이어야 합니다" : "여야 합니다";
						const sizing = getSizing(issue.origin);
						const unit = sizing?.unit ?? "요소";
						if (sizing) return `${issue.origin ?? "값"}이 너무 작습니다: ${issue.minimum.toString()}${unit} ${adj}${suffix}`;
						return `${issue.origin ?? "값"}이 너무 작습니다: ${issue.minimum.toString()} ${adj}${suffix}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `잘못된 문자열: "${_issue.prefix}"(으)로 시작해야 합니다`;
						if (_issue.format === "ends_with") return `잘못된 문자열: "${_issue.suffix}"(으)로 끝나야 합니다`;
						if (_issue.format === "includes") return `잘못된 문자열: "${_issue.includes}"을(를) 포함해야 합니다`;
						if (_issue.format === "regex") return `잘못된 문자열: 정규식 ${_issue.pattern} 패턴과 일치해야 합니다`;
						return `잘못된 ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `잘못된 숫자: ${issue.divisor}의 배수여야 합니다`;
					case "unrecognized_keys": return `인식할 수 없는 키: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `잘못된 키: ${issue.origin}`;
					case "invalid_union": return `잘못된 입력`;
					case "invalid_element": return `잘못된 값: ${issue.origin}`;
					default: return `잘못된 입력`;
				}
			};
		};
		function ko_default() {
			return { localeError: error$23() };
		}
		const capitalizeFirstCharacter = (text) => {
			return text.charAt(0).toUpperCase() + text.slice(1);
		};
		function getUnitTypeFromNumber(number) {
			const abs = Math.abs(number);
			const last = abs % 10;
			const last2 = abs % 100;
			if (last2 >= 11 && last2 <= 19 || last === 0) return "many";
			if (last === 1) return "one";
			return "few";
		}
		const error$22 = () => {
			const Sizable = {
				string: {
					unit: {
						one: "simbolis",
						few: "simboliai",
						many: "simbolių"
					},
					verb: {
						smaller: {
							inclusive: "turi būti ne ilgesnė kaip",
							notInclusive: "turi būti trumpesnė kaip"
						},
						bigger: {
							inclusive: "turi būti ne trumpesnė kaip",
							notInclusive: "turi būti ilgesnė kaip"
						}
					}
				},
				file: {
					unit: {
						one: "baitas",
						few: "baitai",
						many: "baitų"
					},
					verb: {
						smaller: {
							inclusive: "turi būti ne didesnis kaip",
							notInclusive: "turi būti mažesnis kaip"
						},
						bigger: {
							inclusive: "turi būti ne mažesnis kaip",
							notInclusive: "turi būti didesnis kaip"
						}
					}
				},
				array: {
					unit: {
						one: "elementą",
						few: "elementus",
						many: "elementų"
					},
					verb: {
						smaller: {
							inclusive: "turi turėti ne daugiau kaip",
							notInclusive: "turi turėti mažiau kaip"
						},
						bigger: {
							inclusive: "turi turėti ne mažiau kaip",
							notInclusive: "turi turėti daugiau kaip"
						}
					}
				},
				set: {
					unit: {
						one: "elementą",
						few: "elementus",
						many: "elementų"
					},
					verb: {
						smaller: {
							inclusive: "turi turėti ne daugiau kaip",
							notInclusive: "turi turėti mažiau kaip"
						},
						bigger: {
							inclusive: "turi turėti ne mažiau kaip",
							notInclusive: "turi turėti daugiau kaip"
						}
					}
				}
			};
			function getSizing(origin, unitType, inclusive, targetShouldBe) {
				const result = Sizable[origin] ?? null;
				if (result === null) return result;
				return {
					unit: result.unit[unitType],
					verb: result.verb[targetShouldBe][inclusive ? "inclusive" : "notInclusive"]
				};
			}
			const FormatDictionary = {
				regex: "įvestis",
				email: "el. pašto adresas",
				url: "URL",
				emoji: "jaustukas",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO data ir laikas",
				date: "ISO data",
				time: "ISO laikas",
				duration: "ISO trukmė",
				ipv4: "IPv4 adresas",
				ipv6: "IPv6 adresas",
				cidrv4: "IPv4 tinklo prefiksas (CIDR)",
				cidrv6: "IPv6 tinklo prefiksas (CIDR)",
				base64: "base64 užkoduota eilutė",
				base64url: "base64url užkoduota eilutė",
				json_string: "JSON eilutė",
				e164: "E.164 numeris",
				jwt: "JWT",
				template_literal: "įvestis"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "skaičius",
				bigint: "sveikasis skaičius",
				string: "eilutė",
				boolean: "loginė reikšmė",
				undefined: "neapibrėžta reikšmė",
				function: "funkcija",
				symbol: "simbolis",
				array: "masyvas",
				object: "objektas",
				null: "nulinė reikšmė"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Gautas tipas ${received}, o tikėtasi - instanceof ${issue.expected}`;
						return `Gautas tipas ${received}, o tikėtasi - ${expected}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Privalo būti ${stringifyPrimitive(issue.values[0])}`;
						return `Privalo būti vienas iš ${joinValues(issue.values, "|")} pasirinkimų`;
					case "too_big": {
						const origin = TypeDictionary[issue.origin] ?? issue.origin;
						const sizing = getSizing(issue.origin, getUnitTypeFromNumber(Number(issue.maximum)), issue.inclusive ?? false, "smaller");
						if (sizing?.verb) return `${capitalizeFirstCharacter(origin ?? issue.origin ?? "reikšmė")} ${sizing.verb} ${issue.maximum.toString()} ${sizing.unit ?? "elementų"}`;
						const adj = issue.inclusive ? "ne didesnis kaip" : "mažesnis kaip";
						return `${capitalizeFirstCharacter(origin ?? issue.origin ?? "reikšmė")} turi būti ${adj} ${issue.maximum.toString()} ${sizing?.unit}`;
					}
					case "too_small": {
						const origin = TypeDictionary[issue.origin] ?? issue.origin;
						const sizing = getSizing(issue.origin, getUnitTypeFromNumber(Number(issue.minimum)), issue.inclusive ?? false, "bigger");
						if (sizing?.verb) return `${capitalizeFirstCharacter(origin ?? issue.origin ?? "reikšmė")} ${sizing.verb} ${issue.minimum.toString()} ${sizing.unit ?? "elementų"}`;
						const adj = issue.inclusive ? "ne mažesnis kaip" : "didesnis kaip";
						return `${capitalizeFirstCharacter(origin ?? issue.origin ?? "reikšmė")} turi būti ${adj} ${issue.minimum.toString()} ${sizing?.unit}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Eilutė privalo prasidėti "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Eilutė privalo pasibaigti "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Eilutė privalo įtraukti "${_issue.includes}"`;
						if (_issue.format === "regex") return `Eilutė privalo atitikti ${_issue.pattern}`;
						return `Neteisingas ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Skaičius privalo būti ${issue.divisor} kartotinis.`;
					case "unrecognized_keys": return `Neatpažint${issue.keys.length > 1 ? "i" : "as"} rakt${issue.keys.length > 1 ? "ai" : "as"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return "Rastas klaidingas raktas";
					case "invalid_union": return "Klaidinga įvestis";
					case "invalid_element": return `${capitalizeFirstCharacter(TypeDictionary[issue.origin] ?? issue.origin ?? issue.origin ?? "reikšmė")} turi klaidingą įvestį`;
					default: return "Klaidinga įvestis";
				}
			};
		};
		function lt_default() {
			return { localeError: error$22() };
		}
		const error$21 = () => {
			const Sizable = {
				string: {
					unit: "знаци",
					verb: "да имаат"
				},
				file: {
					unit: "бајти",
					verb: "да имаат"
				},
				array: {
					unit: "ставки",
					verb: "да имаат"
				},
				set: {
					unit: "ставки",
					verb: "да имаат"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "внес",
				email: "адреса на е-пошта",
				url: "URL",
				emoji: "емоџи",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO датум и време",
				date: "ISO датум",
				time: "ISO време",
				duration: "ISO времетраење",
				ipv4: "IPv4 адреса",
				ipv6: "IPv6 адреса",
				cidrv4: "IPv4 опсег",
				cidrv6: "IPv6 опсег",
				base64: "base64-енкодирана низа",
				base64url: "base64url-енкодирана низа",
				json_string: "JSON низа",
				e164: "E.164 број",
				jwt: "JWT",
				template_literal: "внес"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "број",
				array: "низа"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Грешен внес: се очекува instanceof ${issue.expected}, примено ${received}`;
						return `Грешен внес: се очекува ${expected}, примено ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
						return `Грешана опција: се очекува една ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Премногу голем: се очекува ${issue.origin ?? "вредноста"} да има ${adj}${issue.maximum.toString()} ${sizing.unit ?? "елементи"}`;
						return `Премногу голем: се очекува ${issue.origin ?? "вредноста"} да биде ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Премногу мал: се очекува ${issue.origin} да има ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Премногу мал: се очекува ${issue.origin} да биде ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Неважечка низа: мора да започнува со "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Неважечка низа: мора да завршува со "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Неважечка низа: мора да вклучува "${_issue.includes}"`;
						if (_issue.format === "regex") return `Неважечка низа: мора да одгоара на патернот ${_issue.pattern}`;
						return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Грешен број: мора да биде делив со ${issue.divisor}`;
					case "unrecognized_keys": return `${issue.keys.length > 1 ? "Непрепознаени клучеви" : "Непрепознаен клуч"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Грешен клуч во ${issue.origin}`;
					case "invalid_union": return "Грешен внес";
					case "invalid_element": return `Грешна вредност во ${issue.origin}`;
					default: return `Грешен внес`;
				}
			};
		};
		function mk_default() {
			return { localeError: error$21() };
		}
		const error$20 = () => {
			const Sizable = {
				string: {
					unit: "aksara",
					verb: "mempunyai"
				},
				file: {
					unit: "bait",
					verb: "mempunyai"
				},
				array: {
					unit: "elemen",
					verb: "mempunyai"
				},
				set: {
					unit: "elemen",
					verb: "mempunyai"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "input",
				email: "alamat e-mel",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "tarikh masa ISO",
				date: "tarikh ISO",
				time: "masa ISO",
				duration: "tempoh ISO",
				ipv4: "alamat IPv4",
				ipv6: "alamat IPv6",
				cidrv4: "julat IPv4",
				cidrv6: "julat IPv6",
				base64: "string dikodkan base64",
				base64url: "string dikodkan base64url",
				json_string: "string JSON",
				e164: "nombor E.164",
				jwt: "JWT",
				template_literal: "input"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "nombor"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Input tidak sah: dijangka instanceof ${issue.expected}, diterima ${received}`;
						return `Input tidak sah: dijangka ${expected}, diterima ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Input tidak sah: dijangka ${stringifyPrimitive(issue.values[0])}`;
						return `Pilihan tidak sah: dijangka salah satu daripada ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Terlalu besar: dijangka ${issue.origin ?? "nilai"} ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elemen"}`;
						return `Terlalu besar: dijangka ${issue.origin ?? "nilai"} adalah ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Terlalu kecil: dijangka ${issue.origin} ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Terlalu kecil: dijangka ${issue.origin} adalah ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `String tidak sah: mesti bermula dengan "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `String tidak sah: mesti berakhir dengan "${_issue.suffix}"`;
						if (_issue.format === "includes") return `String tidak sah: mesti mengandungi "${_issue.includes}"`;
						if (_issue.format === "regex") return `String tidak sah: mesti sepadan dengan corak ${_issue.pattern}`;
						return `${FormatDictionary[_issue.format] ?? issue.format} tidak sah`;
					}
					case "not_multiple_of": return `Nombor tidak sah: perlu gandaan ${issue.divisor}`;
					case "unrecognized_keys": return `Kunci tidak dikenali: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Kunci tidak sah dalam ${issue.origin}`;
					case "invalid_union": return "Input tidak sah";
					case "invalid_element": return `Nilai tidak sah dalam ${issue.origin}`;
					default: return `Input tidak sah`;
				}
			};
		};
		function ms_default() {
			return { localeError: error$20() };
		}
		const error$19 = () => {
			const Sizable = {
				string: {
					unit: "tekens",
					verb: "heeft"
				},
				file: {
					unit: "bytes",
					verb: "heeft"
				},
				array: {
					unit: "elementen",
					verb: "heeft"
				},
				set: {
					unit: "elementen",
					verb: "heeft"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "invoer",
				email: "emailadres",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO datum en tijd",
				date: "ISO datum",
				time: "ISO tijd",
				duration: "ISO duur",
				ipv4: "IPv4-adres",
				ipv6: "IPv6-adres",
				cidrv4: "IPv4-bereik",
				cidrv6: "IPv6-bereik",
				base64: "base64-gecodeerde tekst",
				base64url: "base64 URL-gecodeerde tekst",
				json_string: "JSON string",
				e164: "E.164-nummer",
				jwt: "JWT",
				template_literal: "invoer"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "getal"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Ongeldige invoer: verwacht instanceof ${issue.expected}, ontving ${received}`;
						return `Ongeldige invoer: verwacht ${expected}, ontving ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Ongeldige invoer: verwacht ${stringifyPrimitive(issue.values[0])}`;
						return `Ongeldige optie: verwacht één van ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						const longName = issue.origin === "date" ? "laat" : issue.origin === "string" ? "lang" : "groot";
						if (sizing) return `Te ${longName}: verwacht dat ${issue.origin ?? "waarde"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementen"} ${sizing.verb}`;
						return `Te ${longName}: verwacht dat ${issue.origin ?? "waarde"} ${adj}${issue.maximum.toString()} is`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						const shortName = issue.origin === "date" ? "vroeg" : issue.origin === "string" ? "kort" : "klein";
						if (sizing) return `Te ${shortName}: verwacht dat ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
						return `Te ${shortName}: verwacht dat ${issue.origin} ${adj}${issue.minimum.toString()} is`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Ongeldige tekst: moet met "${_issue.prefix}" beginnen`;
						if (_issue.format === "ends_with") return `Ongeldige tekst: moet op "${_issue.suffix}" eindigen`;
						if (_issue.format === "includes") return `Ongeldige tekst: moet "${_issue.includes}" bevatten`;
						if (_issue.format === "regex") return `Ongeldige tekst: moet overeenkomen met patroon ${_issue.pattern}`;
						return `Ongeldig: ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Ongeldig getal: moet een veelvoud van ${issue.divisor} zijn`;
					case "unrecognized_keys": return `Onbekende key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Ongeldige key in ${issue.origin}`;
					case "invalid_union": return "Ongeldige invoer";
					case "invalid_element": return `Ongeldige waarde in ${issue.origin}`;
					default: return `Ongeldige invoer`;
				}
			};
		};
		function nl_default() {
			return { localeError: error$19() };
		}
		const error$18 = () => {
			const Sizable = {
				string: {
					unit: "tegn",
					verb: "å ha"
				},
				file: {
					unit: "bytes",
					verb: "å ha"
				},
				array: {
					unit: "elementer",
					verb: "å inneholde"
				},
				set: {
					unit: "elementer",
					verb: "å inneholde"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "input",
				email: "e-postadresse",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO dato- og klokkeslett",
				date: "ISO-dato",
				time: "ISO-klokkeslett",
				duration: "ISO-varighet",
				ipv4: "IPv4-område",
				ipv6: "IPv6-område",
				cidrv4: "IPv4-spekter",
				cidrv6: "IPv6-spekter",
				base64: "base64-enkodet streng",
				base64url: "base64url-enkodet streng",
				json_string: "JSON-streng",
				e164: "E.164-nummer",
				jwt: "JWT",
				template_literal: "input"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "tall",
				array: "liste"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Ugyldig input: forventet instanceof ${issue.expected}, fikk ${received}`;
						return `Ugyldig input: forventet ${expected}, fikk ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Ugyldig verdi: forventet ${stringifyPrimitive(issue.values[0])}`;
						return `Ugyldig valg: forventet en av ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `For stor(t): forventet ${issue.origin ?? "value"} til å ha ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementer"}`;
						return `For stor(t): forventet ${issue.origin ?? "value"} til å ha ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `For lite(n): forventet ${issue.origin} til å ha ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `For lite(n): forventet ${issue.origin} til å ha ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Ugyldig streng: må starte med "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Ugyldig streng: må ende med "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Ugyldig streng: må inneholde "${_issue.includes}"`;
						if (_issue.format === "regex") return `Ugyldig streng: må matche mønsteret ${_issue.pattern}`;
						return `Ugyldig ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Ugyldig tall: må være et multiplum av ${issue.divisor}`;
					case "unrecognized_keys": return `${issue.keys.length > 1 ? "Ukjente nøkler" : "Ukjent nøkkel"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Ugyldig nøkkel i ${issue.origin}`;
					case "invalid_union": return "Ugyldig input";
					case "invalid_element": return `Ugyldig verdi i ${issue.origin}`;
					default: return `Ugyldig input`;
				}
			};
		};
		function no_default() {
			return { localeError: error$18() };
		}
		const error$17 = () => {
			const Sizable = {
				string: {
					unit: "harf",
					verb: "olmalıdır"
				},
				file: {
					unit: "bayt",
					verb: "olmalıdır"
				},
				array: {
					unit: "unsur",
					verb: "olmalıdır"
				},
				set: {
					unit: "unsur",
					verb: "olmalıdır"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "giren",
				email: "epostagâh",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO hengâmı",
				date: "ISO tarihi",
				time: "ISO zamanı",
				duration: "ISO müddeti",
				ipv4: "IPv4 nişânı",
				ipv6: "IPv6 nişânı",
				cidrv4: "IPv4 menzili",
				cidrv6: "IPv6 menzili",
				base64: "base64-şifreli metin",
				base64url: "base64url-şifreli metin",
				json_string: "JSON metin",
				e164: "E.164 sayısı",
				jwt: "JWT",
				template_literal: "giren"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "numara",
				array: "saf",
				null: "gayb"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Fâsit giren: umulan instanceof ${issue.expected}, alınan ${received}`;
						return `Fâsit giren: umulan ${expected}, alınan ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Fâsit giren: umulan ${stringifyPrimitive(issue.values[0])}`;
						return `Fâsit tercih: mûteberler ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Fazla büyük: ${issue.origin ?? "value"}, ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"} sahip olmalıydı.`;
						return `Fazla büyük: ${issue.origin ?? "value"}, ${adj}${issue.maximum.toString()} olmalıydı.`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Fazla küçük: ${issue.origin}, ${adj}${issue.minimum.toString()} ${sizing.unit} sahip olmalıydı.`;
						return `Fazla küçük: ${issue.origin}, ${adj}${issue.minimum.toString()} olmalıydı.`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Fâsit metin: "${_issue.prefix}" ile başlamalı.`;
						if (_issue.format === "ends_with") return `Fâsit metin: "${_issue.suffix}" ile bitmeli.`;
						if (_issue.format === "includes") return `Fâsit metin: "${_issue.includes}" ihtivâ etmeli.`;
						if (_issue.format === "regex") return `Fâsit metin: ${_issue.pattern} nakşına uymalı.`;
						return `Fâsit ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Fâsit sayı: ${issue.divisor} katı olmalıydı.`;
					case "unrecognized_keys": return `Tanınmayan anahtar ${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `${issue.origin} için tanınmayan anahtar var.`;
					case "invalid_union": return "Giren tanınamadı.";
					case "invalid_element": return `${issue.origin} için tanınmayan kıymet var.`;
					default: return `Kıymet tanınamadı.`;
				}
			};
		};
		function ota_default() {
			return { localeError: error$17() };
		}
		const error$16 = () => {
			const Sizable = {
				string: {
					unit: "توکي",
					verb: "ولري"
				},
				file: {
					unit: "بایټس",
					verb: "ولري"
				},
				array: {
					unit: "توکي",
					verb: "ولري"
				},
				set: {
					unit: "توکي",
					verb: "ولري"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "ورودي",
				email: "بریښنالیک",
				url: "یو آر ال",
				emoji: "ایموجي",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "نیټه او وخت",
				date: "نېټه",
				time: "وخت",
				duration: "موده",
				ipv4: "د IPv4 پته",
				ipv6: "د IPv6 پته",
				cidrv4: "د IPv4 ساحه",
				cidrv6: "د IPv6 ساحه",
				base64: "base64-encoded متن",
				base64url: "base64url-encoded متن",
				json_string: "JSON متن",
				e164: "د E.164 شمېره",
				jwt: "JWT",
				template_literal: "ورودي"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "عدد",
				array: "ارې"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `ناسم ورودي: باید instanceof ${issue.expected} وای, مګر ${received} ترلاسه شو`;
						return `ناسم ورودي: باید ${expected} وای, مګر ${received} ترلاسه شو`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `ناسم ورودي: باید ${stringifyPrimitive(issue.values[0])} وای`;
						return `ناسم انتخاب: باید یو له ${joinValues(issue.values, "|")} څخه وای`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `ډیر لوی: ${issue.origin ?? "ارزښت"} باید ${adj}${issue.maximum.toString()} ${sizing.unit ?? "عنصرونه"} ولري`;
						return `ډیر لوی: ${issue.origin ?? "ارزښت"} باید ${adj}${issue.maximum.toString()} وي`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `ډیر کوچنی: ${issue.origin} باید ${adj}${issue.minimum.toString()} ${sizing.unit} ولري`;
						return `ډیر کوچنی: ${issue.origin} باید ${adj}${issue.minimum.toString()} وي`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `ناسم متن: باید د "${_issue.prefix}" سره پیل شي`;
						if (_issue.format === "ends_with") return `ناسم متن: باید د "${_issue.suffix}" سره پای ته ورسيږي`;
						if (_issue.format === "includes") return `ناسم متن: باید "${_issue.includes}" ولري`;
						if (_issue.format === "regex") return `ناسم متن: باید د ${_issue.pattern} سره مطابقت ولري`;
						return `${FormatDictionary[_issue.format] ?? issue.format} ناسم دی`;
					}
					case "not_multiple_of": return `ناسم عدد: باید د ${issue.divisor} مضرب وي`;
					case "unrecognized_keys": return `ناسم ${issue.keys.length > 1 ? "کلیډونه" : "کلیډ"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `ناسم کلیډ په ${issue.origin} کې`;
					case "invalid_union": return `ناسمه ورودي`;
					case "invalid_element": return `ناسم عنصر په ${issue.origin} کې`;
					default: return `ناسمه ورودي`;
				}
			};
		};
		function ps_default() {
			return { localeError: error$16() };
		}
		const error$15 = () => {
			const Sizable = {
				string: {
					unit: "znaków",
					verb: "mieć"
				},
				file: {
					unit: "bajtów",
					verb: "mieć"
				},
				array: {
					unit: "elementów",
					verb: "mieć"
				},
				set: {
					unit: "elementów",
					verb: "mieć"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "wyrażenie",
				email: "adres email",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "data i godzina w formacie ISO",
				date: "data w formacie ISO",
				time: "godzina w formacie ISO",
				duration: "czas trwania ISO",
				ipv4: "adres IPv4",
				ipv6: "adres IPv6",
				cidrv4: "zakres IPv4",
				cidrv6: "zakres IPv6",
				base64: "ciąg znaków zakodowany w formacie base64",
				base64url: "ciąg znaków zakodowany w formacie base64url",
				json_string: "ciąg znaków w formacie JSON",
				e164: "liczba E.164",
				jwt: "JWT",
				template_literal: "wejście"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "liczba",
				array: "tablica"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Nieprawidłowe dane wejściowe: oczekiwano instanceof ${issue.expected}, otrzymano ${received}`;
						return `Nieprawidłowe dane wejściowe: oczekiwano ${expected}, otrzymano ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Nieprawidłowe dane wejściowe: oczekiwano ${stringifyPrimitive(issue.values[0])}`;
						return `Nieprawidłowa opcja: oczekiwano jednej z wartości ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Za duża wartość: oczekiwano, że ${issue.origin ?? "wartość"} będzie mieć ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementów"}`;
						return `Zbyt duż(y/a/e): oczekiwano, że ${issue.origin ?? "wartość"} będzie wynosić ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Za mała wartość: oczekiwano, że ${issue.origin ?? "wartość"} będzie mieć ${adj}${issue.minimum.toString()} ${sizing.unit ?? "elementów"}`;
						return `Zbyt mał(y/a/e): oczekiwano, że ${issue.origin ?? "wartość"} będzie wynosić ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Nieprawidłowy ciąg znaków: musi zaczynać się od "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Nieprawidłowy ciąg znaków: musi kończyć się na "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Nieprawidłowy ciąg znaków: musi zawierać "${_issue.includes}"`;
						if (_issue.format === "regex") return `Nieprawidłowy ciąg znaków: musi odpowiadać wzorcowi ${_issue.pattern}`;
						return `Nieprawidłow(y/a/e) ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Nieprawidłowa liczba: musi być wielokrotnością ${issue.divisor}`;
					case "unrecognized_keys": return `Nierozpoznane klucze${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Nieprawidłowy klucz w ${issue.origin}`;
					case "invalid_union": return "Nieprawidłowe dane wejściowe";
					case "invalid_element": return `Nieprawidłowa wartość w ${issue.origin}`;
					default: return `Nieprawidłowe dane wejściowe`;
				}
			};
		};
		function pl_default() {
			return { localeError: error$15() };
		}
		const error$14 = () => {
			const Sizable = {
				string: {
					unit: "caracteres",
					verb: "ter"
				},
				file: {
					unit: "bytes",
					verb: "ter"
				},
				array: {
					unit: "itens",
					verb: "ter"
				},
				set: {
					unit: "itens",
					verb: "ter"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "padrão",
				email: "endereço de e-mail",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "data e hora ISO",
				date: "data ISO",
				time: "hora ISO",
				duration: "duração ISO",
				ipv4: "endereço IPv4",
				ipv6: "endereço IPv6",
				cidrv4: "faixa de IPv4",
				cidrv6: "faixa de IPv6",
				base64: "texto codificado em base64",
				base64url: "URL codificada em base64",
				json_string: "texto JSON",
				e164: "número E.164",
				jwt: "JWT",
				template_literal: "entrada"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "número",
				null: "nulo"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Tipo inválido: esperado instanceof ${issue.expected}, recebido ${received}`;
						return `Tipo inválido: esperado ${expected}, recebido ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Entrada inválida: esperado ${stringifyPrimitive(issue.values[0])}`;
						return `Opção inválida: esperada uma das ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Muito grande: esperado que ${issue.origin ?? "valor"} tivesse ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementos"}`;
						return `Muito grande: esperado que ${issue.origin ?? "valor"} fosse ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Muito pequeno: esperado que ${issue.origin} tivesse ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Muito pequeno: esperado que ${issue.origin} fosse ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Texto inválido: deve começar com "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Texto inválido: deve terminar com "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Texto inválido: deve incluir "${_issue.includes}"`;
						if (_issue.format === "regex") return `Texto inválido: deve corresponder ao padrão ${_issue.pattern}`;
						return `${FormatDictionary[_issue.format] ?? issue.format} inválido`;
					}
					case "not_multiple_of": return `Número inválido: deve ser múltiplo de ${issue.divisor}`;
					case "unrecognized_keys": return `Chave${issue.keys.length > 1 ? "s" : ""} desconhecida${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Chave inválida em ${issue.origin}`;
					case "invalid_union": return "Entrada inválida";
					case "invalid_element": return `Valor inválido em ${issue.origin}`;
					default: return `Campo inválido`;
				}
			};
		};
		function pt_default() {
			return { localeError: error$14() };
		}
		const error$13 = () => {
			const Sizable = {
				string: {
					unit: "caractere",
					verb: "să aibă"
				},
				file: {
					unit: "octeți",
					verb: "să aibă"
				},
				array: {
					unit: "elemente",
					verb: "să aibă"
				},
				set: {
					unit: "elemente",
					verb: "să aibă"
				},
				map: {
					unit: "intrări",
					verb: "să aibă"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "intrare",
				email: "adresă de email",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "dată și oră ISO",
				date: "dată ISO",
				time: "oră ISO",
				duration: "durată ISO",
				ipv4: "adresă IPv4",
				ipv6: "adresă IPv6",
				mac: "adresă MAC",
				cidrv4: "interval IPv4",
				cidrv6: "interval IPv6",
				base64: "șir codat base64",
				base64url: "șir codat base64url",
				json_string: "șir JSON",
				e164: "număr E.164",
				jwt: "JWT",
				template_literal: "intrare"
			};
			const TypeDictionary = {
				nan: "NaN",
				string: "șir",
				number: "număr",
				boolean: "boolean",
				function: "funcție",
				array: "matrice",
				object: "obiect",
				undefined: "nedefinit",
				symbol: "simbol",
				bigint: "număr mare",
				void: "void",
				never: "never",
				map: "hartă",
				set: "set"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						return `Intrare invalidă: așteptat ${expected}, primit ${TypeDictionary[receivedType] ?? receivedType}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Intrare invalidă: așteptat ${stringifyPrimitive(issue.values[0])}`;
						return `Opțiune invalidă: așteptat una dintre ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Prea mare: așteptat ca ${issue.origin ?? "valoarea"} ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elemente"}`;
						return `Prea mare: așteptat ca ${issue.origin ?? "valoarea"} să fie ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Prea mic: așteptat ca ${issue.origin} ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Prea mic: așteptat ca ${issue.origin} să fie ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Șir invalid: trebuie să înceapă cu "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Șir invalid: trebuie să se termine cu "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Șir invalid: trebuie să includă "${_issue.includes}"`;
						if (_issue.format === "regex") return `Șir invalid: trebuie să se potrivească cu modelul ${_issue.pattern}`;
						return `Format invalid: ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Număr invalid: trebuie să fie multiplu de ${issue.divisor}`;
					case "unrecognized_keys": return `Chei nerecunoscute: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Cheie invalidă în ${issue.origin}`;
					case "invalid_union": return "Intrare invalidă";
					case "invalid_element": return `Valoare invalidă în ${issue.origin}`;
					default: return `Intrare invalidă`;
				}
			};
		};
		function ro_default() {
			return { localeError: error$13() };
		}
		function getRussianPlural(count, one, few, many) {
			const absCount = Math.abs(count);
			const lastDigit = absCount % 10;
			const lastTwoDigits = absCount % 100;
			if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return many;
			if (lastDigit === 1) return one;
			if (lastDigit >= 2 && lastDigit <= 4) return few;
			return many;
		}
		const error$12 = () => {
			const Sizable = {
				string: {
					unit: {
						one: "символ",
						few: "символа",
						many: "символов"
					},
					verb: "иметь"
				},
				file: {
					unit: {
						one: "байт",
						few: "байта",
						many: "байт"
					},
					verb: "иметь"
				},
				array: {
					unit: {
						one: "элемент",
						few: "элемента",
						many: "элементов"
					},
					verb: "иметь"
				},
				set: {
					unit: {
						one: "элемент",
						few: "элемента",
						many: "элементов"
					},
					verb: "иметь"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "ввод",
				email: "email адрес",
				url: "URL",
				emoji: "эмодзи",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO дата и время",
				date: "ISO дата",
				time: "ISO время",
				duration: "ISO длительность",
				ipv4: "IPv4 адрес",
				ipv6: "IPv6 адрес",
				cidrv4: "IPv4 диапазон",
				cidrv6: "IPv6 диапазон",
				base64: "строка в формате base64",
				base64url: "строка в формате base64url",
				json_string: "JSON строка",
				e164: "номер E.164",
				jwt: "JWT",
				template_literal: "ввод"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "число",
				array: "массив"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Неверный ввод: ожидалось instanceof ${issue.expected}, получено ${received}`;
						return `Неверный ввод: ожидалось ${expected}, получено ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Неверный ввод: ожидалось ${stringifyPrimitive(issue.values[0])}`;
						return `Неверный вариант: ожидалось одно из ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) {
							const unit = getRussianPlural(Number(issue.maximum), sizing.unit.one, sizing.unit.few, sizing.unit.many);
							return `Слишком большое значение: ожидалось, что ${issue.origin ?? "значение"} будет иметь ${adj}${issue.maximum.toString()} ${unit}`;
						}
						return `Слишком большое значение: ожидалось, что ${issue.origin ?? "значение"} будет ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) {
							const unit = getRussianPlural(Number(issue.minimum), sizing.unit.one, sizing.unit.few, sizing.unit.many);
							return `Слишком маленькое значение: ожидалось, что ${issue.origin} будет иметь ${adj}${issue.minimum.toString()} ${unit}`;
						}
						return `Слишком маленькое значение: ожидалось, что ${issue.origin} будет ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Неверная строка: должна начинаться с "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Неверная строка: должна заканчиваться на "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Неверная строка: должна содержать "${_issue.includes}"`;
						if (_issue.format === "regex") return `Неверная строка: должна соответствовать шаблону ${_issue.pattern}`;
						return `Неверный ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Неверное число: должно быть кратным ${issue.divisor}`;
					case "unrecognized_keys": return `Нераспознанн${issue.keys.length > 1 ? "ые" : "ый"} ключ${issue.keys.length > 1 ? "и" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Неверный ключ в ${issue.origin}`;
					case "invalid_union": return "Неверные входные данные";
					case "invalid_element": return `Неверное значение в ${issue.origin}`;
					default: return `Неверные входные данные`;
				}
			};
		};
		function ru_default() {
			return { localeError: error$12() };
		}
		const error$11 = () => {
			const Sizable = {
				string: {
					unit: "znakov",
					verb: "imeti"
				},
				file: {
					unit: "bajtov",
					verb: "imeti"
				},
				array: {
					unit: "elementov",
					verb: "imeti"
				},
				set: {
					unit: "elementov",
					verb: "imeti"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "vnos",
				email: "e-poštni naslov",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO datum in čas",
				date: "ISO datum",
				time: "ISO čas",
				duration: "ISO trajanje",
				ipv4: "IPv4 naslov",
				ipv6: "IPv6 naslov",
				cidrv4: "obseg IPv4",
				cidrv6: "obseg IPv6",
				base64: "base64 kodiran niz",
				base64url: "base64url kodiran niz",
				json_string: "JSON niz",
				e164: "E.164 številka",
				jwt: "JWT",
				template_literal: "vnos"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "število",
				array: "tabela"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Neveljaven vnos: pričakovano instanceof ${issue.expected}, prejeto ${received}`;
						return `Neveljaven vnos: pričakovano ${expected}, prejeto ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Neveljaven vnos: pričakovano ${stringifyPrimitive(issue.values[0])}`;
						return `Neveljavna možnost: pričakovano eno izmed ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Preveliko: pričakovano, da bo ${issue.origin ?? "vrednost"} imelo ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elementov"}`;
						return `Preveliko: pričakovano, da bo ${issue.origin ?? "vrednost"} ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Premajhno: pričakovano, da bo ${issue.origin} imelo ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Premajhno: pričakovano, da bo ${issue.origin} ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Neveljaven niz: mora se začeti z "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Neveljaven niz: mora se končati z "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Neveljaven niz: mora vsebovati "${_issue.includes}"`;
						if (_issue.format === "regex") return `Neveljaven niz: mora ustrezati vzorcu ${_issue.pattern}`;
						return `Neveljaven ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Neveljavno število: mora biti večkratnik ${issue.divisor}`;
					case "unrecognized_keys": return `Neprepoznan${issue.keys.length > 1 ? "i ključi" : " ključ"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Neveljaven ključ v ${issue.origin}`;
					case "invalid_union": return "Neveljaven vnos";
					case "invalid_element": return `Neveljavna vrednost v ${issue.origin}`;
					default: return "Neveljaven vnos";
				}
			};
		};
		function sl_default() {
			return { localeError: error$11() };
		}
		const error$10 = () => {
			const Sizable = {
				string: {
					unit: "tecken",
					verb: "att ha"
				},
				file: {
					unit: "bytes",
					verb: "att ha"
				},
				array: {
					unit: "objekt",
					verb: "att innehålla"
				},
				set: {
					unit: "objekt",
					verb: "att innehålla"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "reguljärt uttryck",
				email: "e-postadress",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO-datum och tid",
				date: "ISO-datum",
				time: "ISO-tid",
				duration: "ISO-varaktighet",
				ipv4: "IPv4-intervall",
				ipv6: "IPv6-intervall",
				cidrv4: "IPv4-spektrum",
				cidrv6: "IPv6-spektrum",
				base64: "base64-kodad sträng",
				base64url: "base64url-kodad sträng",
				json_string: "JSON-sträng",
				e164: "E.164-nummer",
				jwt: "JWT",
				template_literal: "mall-literal"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "antal",
				array: "lista"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Ogiltig inmatning: förväntat instanceof ${issue.expected}, fick ${received}`;
						return `Ogiltig inmatning: förväntat ${expected}, fick ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Ogiltig inmatning: förväntat ${stringifyPrimitive(issue.values[0])}`;
						return `Ogiltigt val: förväntade en av ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `För stor(t): förväntade ${issue.origin ?? "värdet"} att ha ${adj}${issue.maximum.toString()} ${sizing.unit ?? "element"}`;
						return `För stor(t): förväntat ${issue.origin ?? "värdet"} att ha ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `För lite(t): förväntade ${issue.origin ?? "värdet"} att ha ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `För lite(t): förväntade ${issue.origin ?? "värdet"} att ha ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Ogiltig sträng: måste börja med "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Ogiltig sträng: måste sluta med "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Ogiltig sträng: måste innehålla "${_issue.includes}"`;
						if (_issue.format === "regex") return `Ogiltig sträng: måste matcha mönstret "${_issue.pattern}"`;
						return `Ogiltig(t) ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Ogiltigt tal: måste vara en multipel av ${issue.divisor}`;
					case "unrecognized_keys": return `${issue.keys.length > 1 ? "Okända nycklar" : "Okänd nyckel"}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Ogiltig nyckel i ${issue.origin ?? "värdet"}`;
					case "invalid_union": return "Ogiltig input";
					case "invalid_element": return `Ogiltigt värde i ${issue.origin ?? "värdet"}`;
					default: return `Ogiltig input`;
				}
			};
		};
		function sv_default() {
			return { localeError: error$10() };
		}
		const error$9 = () => {
			const Sizable = {
				string: {
					unit: "எழுத்துக்கள்",
					verb: "கொண்டிருக்க வேண்டும்"
				},
				file: {
					unit: "பைட்டுகள்",
					verb: "கொண்டிருக்க வேண்டும்"
				},
				array: {
					unit: "உறுப்புகள்",
					verb: "கொண்டிருக்க வேண்டும்"
				},
				set: {
					unit: "உறுப்புகள்",
					verb: "கொண்டிருக்க வேண்டும்"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "உள்ளீடு",
				email: "மின்னஞ்சல் முகவரி",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO தேதி நேரம்",
				date: "ISO தேதி",
				time: "ISO நேரம்",
				duration: "ISO கால அளவு",
				ipv4: "IPv4 முகவரி",
				ipv6: "IPv6 முகவரி",
				cidrv4: "IPv4 வரம்பு",
				cidrv6: "IPv6 வரம்பு",
				base64: "base64-encoded சரம்",
				base64url: "base64url-encoded சரம்",
				json_string: "JSON சரம்",
				e164: "E.164 எண்",
				jwt: "JWT",
				template_literal: "input"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "எண்",
				array: "அணி",
				null: "வெறுமை"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது instanceof ${issue.expected}, பெறப்பட்டது ${received}`;
						return `தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது ${expected}, பெறப்பட்டது ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது ${stringifyPrimitive(issue.values[0])}`;
						return `தவறான விருப்பம்: எதிர்பார்க்கப்பட்டது ${joinValues(issue.values, "|")} இல் ஒன்று`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `மிக பெரியது: எதிர்பார்க்கப்பட்டது ${issue.origin ?? "மதிப்பு"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "உறுப்புகள்"} ஆக இருக்க வேண்டும்`;
						return `மிக பெரியது: எதிர்பார்க்கப்பட்டது ${issue.origin ?? "மதிப்பு"} ${adj}${issue.maximum.toString()} ஆக இருக்க வேண்டும்`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `மிகச் சிறியது: எதிர்பார்க்கப்பட்டது ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit} ஆக இருக்க வேண்டும்`;
						return `மிகச் சிறியது: எதிர்பார்க்கப்பட்டது ${issue.origin} ${adj}${issue.minimum.toString()} ஆக இருக்க வேண்டும்`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `தவறான சரம்: "${_issue.prefix}" இல் தொடங்க வேண்டும்`;
						if (_issue.format === "ends_with") return `தவறான சரம்: "${_issue.suffix}" இல் முடிவடைய வேண்டும்`;
						if (_issue.format === "includes") return `தவறான சரம்: "${_issue.includes}" ஐ உள்ளடக்க வேண்டும்`;
						if (_issue.format === "regex") return `தவறான சரம்: ${_issue.pattern} முறைபாட்டுடன் பொருந்த வேண்டும்`;
						return `தவறான ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `தவறான எண்: ${issue.divisor} இன் பலமாக இருக்க வேண்டும்`;
					case "unrecognized_keys": return `அடையாளம் தெரியாத விசை${issue.keys.length > 1 ? "கள்" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `${issue.origin} இல் தவறான விசை`;
					case "invalid_union": return "தவறான உள்ளீடு";
					case "invalid_element": return `${issue.origin} இல் தவறான மதிப்பு`;
					default: return `தவறான உள்ளீடு`;
				}
			};
		};
		function ta_default() {
			return { localeError: error$9() };
		}
		const error$8 = () => {
			const Sizable = {
				string: {
					unit: "ตัวอักษร",
					verb: "ควรมี"
				},
				file: {
					unit: "ไบต์",
					verb: "ควรมี"
				},
				array: {
					unit: "รายการ",
					verb: "ควรมี"
				},
				set: {
					unit: "รายการ",
					verb: "ควรมี"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "ข้อมูลที่ป้อน",
				email: "ที่อยู่อีเมล",
				url: "URL",
				emoji: "อิโมจิ",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "วันที่เวลาแบบ ISO",
				date: "วันที่แบบ ISO",
				time: "เวลาแบบ ISO",
				duration: "ช่วงเวลาแบบ ISO",
				ipv4: "ที่อยู่ IPv4",
				ipv6: "ที่อยู่ IPv6",
				cidrv4: "ช่วง IP แบบ IPv4",
				cidrv6: "ช่วง IP แบบ IPv6",
				base64: "ข้อความแบบ Base64",
				base64url: "ข้อความแบบ Base64 สำหรับ URL",
				json_string: "ข้อความแบบ JSON",
				e164: "เบอร์โทรศัพท์ระหว่างประเทศ (E.164)",
				jwt: "โทเคน JWT",
				template_literal: "ข้อมูลที่ป้อน"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "ตัวเลข",
				array: "อาร์เรย์ (Array)",
				null: "ไม่มีค่า (null)"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `ประเภทข้อมูลไม่ถูกต้อง: ควรเป็น instanceof ${issue.expected} แต่ได้รับ ${received}`;
						return `ประเภทข้อมูลไม่ถูกต้อง: ควรเป็น ${expected} แต่ได้รับ ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `ค่าไม่ถูกต้อง: ควรเป็น ${stringifyPrimitive(issue.values[0])}`;
						return `ตัวเลือกไม่ถูกต้อง: ควรเป็นหนึ่งใน ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "ไม่เกิน" : "น้อยกว่า";
						const sizing = getSizing(issue.origin);
						if (sizing) return `เกินกำหนด: ${issue.origin ?? "ค่า"} ควรมี${adj} ${issue.maximum.toString()} ${sizing.unit ?? "รายการ"}`;
						return `เกินกำหนด: ${issue.origin ?? "ค่า"} ควรมี${adj} ${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? "อย่างน้อย" : "มากกว่า";
						const sizing = getSizing(issue.origin);
						if (sizing) return `น้อยกว่ากำหนด: ${issue.origin} ควรมี${adj} ${issue.minimum.toString()} ${sizing.unit}`;
						return `น้อยกว่ากำหนด: ${issue.origin} ควรมี${adj} ${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `รูปแบบไม่ถูกต้อง: ข้อความต้องขึ้นต้นด้วย "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `รูปแบบไม่ถูกต้อง: ข้อความต้องลงท้ายด้วย "${_issue.suffix}"`;
						if (_issue.format === "includes") return `รูปแบบไม่ถูกต้อง: ข้อความต้องมี "${_issue.includes}" อยู่ในข้อความ`;
						if (_issue.format === "regex") return `รูปแบบไม่ถูกต้อง: ต้องตรงกับรูปแบบที่กำหนด ${_issue.pattern}`;
						return `รูปแบบไม่ถูกต้อง: ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `ตัวเลขไม่ถูกต้อง: ต้องเป็นจำนวนที่หารด้วย ${issue.divisor} ได้ลงตัว`;
					case "unrecognized_keys": return `พบคีย์ที่ไม่รู้จัก: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `คีย์ไม่ถูกต้องใน ${issue.origin}`;
					case "invalid_union": return "ข้อมูลไม่ถูกต้อง: ไม่ตรงกับรูปแบบยูเนียนที่กำหนดไว้";
					case "invalid_element": return `ข้อมูลไม่ถูกต้องใน ${issue.origin}`;
					default: return `ข้อมูลไม่ถูกต้อง`;
				}
			};
		};
		function th_default() {
			return { localeError: error$8() };
		}
		const error$7 = () => {
			const Sizable = {
				string: {
					unit: "karakter",
					verb: "olmalı"
				},
				file: {
					unit: "bayt",
					verb: "olmalı"
				},
				array: {
					unit: "öğe",
					verb: "olmalı"
				},
				set: {
					unit: "öğe",
					verb: "olmalı"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "girdi",
				email: "e-posta adresi",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO tarih ve saat",
				date: "ISO tarih",
				time: "ISO saat",
				duration: "ISO süre",
				ipv4: "IPv4 adresi",
				ipv6: "IPv6 adresi",
				cidrv4: "IPv4 aralığı",
				cidrv6: "IPv6 aralığı",
				base64: "base64 ile şifrelenmiş metin",
				base64url: "base64url ile şifrelenmiş metin",
				json_string: "JSON dizesi",
				e164: "E.164 sayısı",
				jwt: "JWT",
				template_literal: "Şablon dizesi"
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Geçersiz değer: beklenen instanceof ${issue.expected}, alınan ${received}`;
						return `Geçersiz değer: beklenen ${expected}, alınan ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Geçersiz değer: beklenen ${stringifyPrimitive(issue.values[0])}`;
						return `Geçersiz seçenek: aşağıdakilerden biri olmalı: ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Çok büyük: beklenen ${issue.origin ?? "değer"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "öğe"}`;
						return `Çok büyük: beklenen ${issue.origin ?? "değer"} ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Çok küçük: beklenen ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Çok küçük: beklenen ${issue.origin} ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Geçersiz metin: "${_issue.prefix}" ile başlamalı`;
						if (_issue.format === "ends_with") return `Geçersiz metin: "${_issue.suffix}" ile bitmeli`;
						if (_issue.format === "includes") return `Geçersiz metin: "${_issue.includes}" içermeli`;
						if (_issue.format === "regex") return `Geçersiz metin: ${_issue.pattern} desenine uymalı`;
						return `Geçersiz ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Geçersiz sayı: ${issue.divisor} ile tam bölünebilmeli`;
					case "unrecognized_keys": return `Tanınmayan anahtar${issue.keys.length > 1 ? "lar" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `${issue.origin} içinde geçersiz anahtar`;
					case "invalid_union": return "Geçersiz değer";
					case "invalid_element": return `${issue.origin} içinde geçersiz değer`;
					default: return `Geçersiz değer`;
				}
			};
		};
		function tr_default() {
			return { localeError: error$7() };
		}
		const error$6 = () => {
			const Sizable = {
				string: {
					unit: "символів",
					verb: "матиме"
				},
				file: {
					unit: "байтів",
					verb: "матиме"
				},
				array: {
					unit: "елементів",
					verb: "матиме"
				},
				set: {
					unit: "елементів",
					verb: "матиме"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "вхідні дані",
				email: "адреса електронної пошти",
				url: "URL",
				emoji: "емодзі",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "дата та час ISO",
				date: "дата ISO",
				time: "час ISO",
				duration: "тривалість ISO",
				ipv4: "адреса IPv4",
				ipv6: "адреса IPv6",
				cidrv4: "діапазон IPv4",
				cidrv6: "діапазон IPv6",
				base64: "рядок у кодуванні base64",
				base64url: "рядок у кодуванні base64url",
				json_string: "рядок JSON",
				e164: "номер E.164",
				jwt: "JWT",
				template_literal: "вхідні дані"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "число",
				array: "масив"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Неправильні вхідні дані: очікується instanceof ${issue.expected}, отримано ${received}`;
						return `Неправильні вхідні дані: очікується ${expected}, отримано ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Неправильні вхідні дані: очікується ${stringifyPrimitive(issue.values[0])}`;
						return `Неправильна опція: очікується одне з ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Занадто велике: очікується, що ${issue.origin ?? "значення"} ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "елементів"}`;
						return `Занадто велике: очікується, що ${issue.origin ?? "значення"} буде ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Занадто мале: очікується, що ${issue.origin} ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Занадто мале: очікується, що ${issue.origin} буде ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Неправильний рядок: повинен починатися з "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Неправильний рядок: повинен закінчуватися на "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Неправильний рядок: повинен містити "${_issue.includes}"`;
						if (_issue.format === "regex") return `Неправильний рядок: повинен відповідати шаблону ${_issue.pattern}`;
						return `Неправильний ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Неправильне число: повинно бути кратним ${issue.divisor}`;
					case "unrecognized_keys": return `Нерозпізнаний ключ${issue.keys.length > 1 ? "і" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Неправильний ключ у ${issue.origin}`;
					case "invalid_union": return "Неправильні вхідні дані";
					case "invalid_element": return `Неправильне значення у ${issue.origin}`;
					default: return `Неправильні вхідні дані`;
				}
			};
		};
		function uk_default() {
			return { localeError: error$6() };
		}
		/** @deprecated Use `uk` instead. */
		function ua_default() {
			return uk_default();
		}
		const error$5 = () => {
			const Sizable = {
				string: {
					unit: "حروف",
					verb: "ہونا"
				},
				file: {
					unit: "بائٹس",
					verb: "ہونا"
				},
				array: {
					unit: "آئٹمز",
					verb: "ہونا"
				},
				set: {
					unit: "آئٹمز",
					verb: "ہونا"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "ان پٹ",
				email: "ای میل ایڈریس",
				url: "یو آر ایل",
				emoji: "ایموجی",
				uuid: "یو یو آئی ڈی",
				uuidv4: "یو یو آئی ڈی وی 4",
				uuidv6: "یو یو آئی ڈی وی 6",
				nanoid: "نینو آئی ڈی",
				guid: "جی یو آئی ڈی",
				cuid: "سی یو آئی ڈی",
				cuid2: "سی یو آئی ڈی 2",
				ulid: "یو ایل آئی ڈی",
				xid: "ایکس آئی ڈی",
				ksuid: "کے ایس یو آئی ڈی",
				datetime: "آئی ایس او ڈیٹ ٹائم",
				date: "آئی ایس او تاریخ",
				time: "آئی ایس او وقت",
				duration: "آئی ایس او مدت",
				ipv4: "آئی پی وی 4 ایڈریس",
				ipv6: "آئی پی وی 6 ایڈریس",
				cidrv4: "آئی پی وی 4 رینج",
				cidrv6: "آئی پی وی 6 رینج",
				base64: "بیس 64 ان کوڈڈ سٹرنگ",
				base64url: "بیس 64 یو آر ایل ان کوڈڈ سٹرنگ",
				json_string: "جے ایس او این سٹرنگ",
				e164: "ای 164 نمبر",
				jwt: "جے ڈبلیو ٹی",
				template_literal: "ان پٹ"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "نمبر",
				array: "آرے",
				null: "نل"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `غلط ان پٹ: instanceof ${issue.expected} متوقع تھا، ${received} موصول ہوا`;
						return `غلط ان پٹ: ${expected} متوقع تھا، ${received} موصول ہوا`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `غلط ان پٹ: ${stringifyPrimitive(issue.values[0])} متوقع تھا`;
						return `غلط آپشن: ${joinValues(issue.values, "|")} میں سے ایک متوقع تھا`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `بہت بڑا: ${issue.origin ?? "ویلیو"} کے ${adj}${issue.maximum.toString()} ${sizing.unit ?? "عناصر"} ہونے متوقع تھے`;
						return `بہت بڑا: ${issue.origin ?? "ویلیو"} کا ${adj}${issue.maximum.toString()} ہونا متوقع تھا`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `بہت چھوٹا: ${issue.origin} کے ${adj}${issue.minimum.toString()} ${sizing.unit} ہونے متوقع تھے`;
						return `بہت چھوٹا: ${issue.origin} کا ${adj}${issue.minimum.toString()} ہونا متوقع تھا`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `غلط سٹرنگ: "${_issue.prefix}" سے شروع ہونا چاہیے`;
						if (_issue.format === "ends_with") return `غلط سٹرنگ: "${_issue.suffix}" پر ختم ہونا چاہیے`;
						if (_issue.format === "includes") return `غلط سٹرنگ: "${_issue.includes}" شامل ہونا چاہیے`;
						if (_issue.format === "regex") return `غلط سٹرنگ: پیٹرن ${_issue.pattern} سے میچ ہونا چاہیے`;
						return `غلط ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `غلط نمبر: ${issue.divisor} کا مضاعف ہونا چاہیے`;
					case "unrecognized_keys": return `غیر تسلیم شدہ کی${issue.keys.length > 1 ? "ز" : ""}: ${joinValues(issue.keys, "، ")}`;
					case "invalid_key": return `${issue.origin} میں غلط کی`;
					case "invalid_union": return "غلط ان پٹ";
					case "invalid_element": return `${issue.origin} میں غلط ویلیو`;
					default: return `غلط ان پٹ`;
				}
			};
		};
		function ur_default() {
			return { localeError: error$5() };
		}
		const error$4 = () => {
			const Sizable = {
				string: {
					unit: "belgi",
					verb: "bo‘lishi kerak"
				},
				file: {
					unit: "bayt",
					verb: "bo‘lishi kerak"
				},
				array: {
					unit: "element",
					verb: "bo‘lishi kerak"
				},
				set: {
					unit: "element",
					verb: "bo‘lishi kerak"
				},
				map: {
					unit: "yozuv",
					verb: "bo‘lishi kerak"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "kirish",
				email: "elektron pochta manzili",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO sana va vaqti",
				date: "ISO sana",
				time: "ISO vaqt",
				duration: "ISO davomiylik",
				ipv4: "IPv4 manzil",
				ipv6: "IPv6 manzil",
				mac: "MAC manzil",
				cidrv4: "IPv4 diapazon",
				cidrv6: "IPv6 diapazon",
				base64: "base64 kodlangan satr",
				base64url: "base64url kodlangan satr",
				json_string: "JSON satr",
				e164: "E.164 raqam",
				jwt: "JWT",
				template_literal: "kirish"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "raqam",
				array: "massiv"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Noto‘g‘ri kirish: kutilgan instanceof ${issue.expected}, qabul qilingan ${received}`;
						return `Noto‘g‘ri kirish: kutilgan ${expected}, qabul qilingan ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Noto‘g‘ri kirish: kutilgan ${stringifyPrimitive(issue.values[0])}`;
						return `Noto‘g‘ri variant: quyidagilardan biri kutilgan ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Juda katta: kutilgan ${issue.origin ?? "qiymat"} ${adj}${issue.maximum.toString()} ${sizing.unit} ${sizing.verb}`;
						return `Juda katta: kutilgan ${issue.origin ?? "qiymat"} ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Juda kichik: kutilgan ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
						return `Juda kichik: kutilgan ${issue.origin} ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Noto‘g‘ri satr: "${_issue.prefix}" bilan boshlanishi kerak`;
						if (_issue.format === "ends_with") return `Noto‘g‘ri satr: "${_issue.suffix}" bilan tugashi kerak`;
						if (_issue.format === "includes") return `Noto‘g‘ri satr: "${_issue.includes}" ni o‘z ichiga olishi kerak`;
						if (_issue.format === "regex") return `Noto‘g‘ri satr: ${_issue.pattern} shabloniga mos kelishi kerak`;
						return `Noto‘g‘ri ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Noto‘g‘ri raqam: ${issue.divisor} ning karralisi bo‘lishi kerak`;
					case "unrecognized_keys": return `Noma’lum kalit${issue.keys.length > 1 ? "lar" : ""}: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `${issue.origin} dagi kalit noto‘g‘ri`;
					case "invalid_union": return "Noto‘g‘ri kirish";
					case "invalid_element": return `${issue.origin} da noto‘g‘ri qiymat`;
					default: return `Noto‘g‘ri kirish`;
				}
			};
		};
		function uz_default() {
			return { localeError: error$4() };
		}
		const error$3 = () => {
			const Sizable = {
				string: {
					unit: "ký tự",
					verb: "có"
				},
				file: {
					unit: "byte",
					verb: "có"
				},
				array: {
					unit: "phần tử",
					verb: "có"
				},
				set: {
					unit: "phần tử",
					verb: "có"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "đầu vào",
				email: "địa chỉ email",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ngày giờ ISO",
				date: "ngày ISO",
				time: "giờ ISO",
				duration: "khoảng thời gian ISO",
				ipv4: "địa chỉ IPv4",
				ipv6: "địa chỉ IPv6",
				cidrv4: "dải IPv4",
				cidrv6: "dải IPv6",
				base64: "chuỗi mã hóa base64",
				base64url: "chuỗi mã hóa base64url",
				json_string: "chuỗi JSON",
				e164: "số E.164",
				jwt: "JWT",
				template_literal: "đầu vào"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "số",
				array: "mảng"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Đầu vào không hợp lệ: mong đợi instanceof ${issue.expected}, nhận được ${received}`;
						return `Đầu vào không hợp lệ: mong đợi ${expected}, nhận được ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Đầu vào không hợp lệ: mong đợi ${stringifyPrimitive(issue.values[0])}`;
						return `Tùy chọn không hợp lệ: mong đợi một trong các giá trị ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Quá lớn: mong đợi ${issue.origin ?? "giá trị"} ${sizing.verb} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "phần tử"}`;
						return `Quá lớn: mong đợi ${issue.origin ?? "giá trị"} ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Quá nhỏ: mong đợi ${issue.origin} ${sizing.verb} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `Quá nhỏ: mong đợi ${issue.origin} ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Chuỗi không hợp lệ: phải bắt đầu bằng "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Chuỗi không hợp lệ: phải kết thúc bằng "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Chuỗi không hợp lệ: phải bao gồm "${_issue.includes}"`;
						if (_issue.format === "regex") return `Chuỗi không hợp lệ: phải khớp với mẫu ${_issue.pattern}`;
						return `${FormatDictionary[_issue.format] ?? issue.format} không hợp lệ`;
					}
					case "not_multiple_of": return `Số không hợp lệ: phải là bội số của ${issue.divisor}`;
					case "unrecognized_keys": return `Khóa không được nhận dạng: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Khóa không hợp lệ trong ${issue.origin}`;
					case "invalid_union": return "Đầu vào không hợp lệ";
					case "invalid_element": return `Giá trị không hợp lệ trong ${issue.origin}`;
					default: return `Đầu vào không hợp lệ`;
				}
			};
		};
		function vi_default() {
			return { localeError: error$3() };
		}
		const error$2 = () => {
			const Sizable = {
				string: {
					unit: "字符",
					verb: "包含"
				},
				file: {
					unit: "字节",
					verb: "包含"
				},
				array: {
					unit: "项",
					verb: "包含"
				},
				set: {
					unit: "项",
					verb: "包含"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "输入",
				email: "电子邮件",
				url: "URL",
				emoji: "表情符号",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO日期时间",
				date: "ISO日期",
				time: "ISO时间",
				duration: "ISO时长",
				ipv4: "IPv4地址",
				ipv6: "IPv6地址",
				cidrv4: "IPv4网段",
				cidrv6: "IPv6网段",
				base64: "base64编码字符串",
				base64url: "base64url编码字符串",
				json_string: "JSON字符串",
				e164: "E.164号码",
				jwt: "JWT",
				template_literal: "输入"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "数字",
				array: "数组",
				null: "空值(null)"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `无效输入：期望 instanceof ${issue.expected}，实际接收 ${received}`;
						return `无效输入：期望 ${expected}，实际接收 ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `无效输入：期望 ${stringifyPrimitive(issue.values[0])}`;
						return `无效选项：期望以下之一 ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `数值过大：期望 ${issue.origin ?? "值"} ${adj}${issue.maximum.toString()} ${sizing.unit ?? "个元素"}`;
						return `数值过大：期望 ${issue.origin ?? "值"} ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `数值过小：期望 ${issue.origin} ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `数值过小：期望 ${issue.origin} ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `无效字符串：必须以 "${_issue.prefix}" 开头`;
						if (_issue.format === "ends_with") return `无效字符串：必须以 "${_issue.suffix}" 结尾`;
						if (_issue.format === "includes") return `无效字符串：必须包含 "${_issue.includes}"`;
						if (_issue.format === "regex") return `无效字符串：必须满足正则表达式 ${_issue.pattern}`;
						return `无效${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `无效数字：必须是 ${issue.divisor} 的倍数`;
					case "unrecognized_keys": return `出现未知的键(key): ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `${issue.origin} 中的键(key)无效`;
					case "invalid_union": return "无效输入";
					case "invalid_element": return `${issue.origin} 中包含无效值(value)`;
					default: return `无效输入`;
				}
			};
		};
		function zh_CN_default() {
			return { localeError: error$2() };
		}
		const error$1 = () => {
			const Sizable = {
				string: {
					unit: "字元",
					verb: "擁有"
				},
				file: {
					unit: "位元組",
					verb: "擁有"
				},
				array: {
					unit: "項目",
					verb: "擁有"
				},
				set: {
					unit: "項目",
					verb: "擁有"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "輸入",
				email: "郵件地址",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "ISO 日期時間",
				date: "ISO 日期",
				time: "ISO 時間",
				duration: "ISO 期間",
				ipv4: "IPv4 位址",
				ipv6: "IPv6 位址",
				cidrv4: "IPv4 範圍",
				cidrv6: "IPv6 範圍",
				base64: "base64 編碼字串",
				base64url: "base64url 編碼字串",
				json_string: "JSON 字串",
				e164: "E.164 數值",
				jwt: "JWT",
				template_literal: "輸入"
			};
			const TypeDictionary = { nan: "NaN" };
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `無效的輸入值：預期為 instanceof ${issue.expected}，但收到 ${received}`;
						return `無效的輸入值：預期為 ${expected}，但收到 ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `無效的輸入值：預期為 ${stringifyPrimitive(issue.values[0])}`;
						return `無效的選項：預期為以下其中之一 ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `數值過大：預期 ${issue.origin ?? "值"} 應為 ${adj}${issue.maximum.toString()} ${sizing.unit ?? "個元素"}`;
						return `數值過大：預期 ${issue.origin ?? "值"} 應為 ${adj}${issue.maximum.toString()}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `數值過小：預期 ${issue.origin} 應為 ${adj}${issue.minimum.toString()} ${sizing.unit}`;
						return `數值過小：預期 ${issue.origin} 應為 ${adj}${issue.minimum.toString()}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `無效的字串：必須以 "${_issue.prefix}" 開頭`;
						if (_issue.format === "ends_with") return `無效的字串：必須以 "${_issue.suffix}" 結尾`;
						if (_issue.format === "includes") return `無效的字串：必須包含 "${_issue.includes}"`;
						if (_issue.format === "regex") return `無效的字串：必須符合格式 ${_issue.pattern}`;
						return `無效的 ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `無效的數字：必須為 ${issue.divisor} 的倍數`;
					case "unrecognized_keys": return `無法識別的鍵值${issue.keys.length > 1 ? "們" : ""}：${joinValues(issue.keys, "、")}`;
					case "invalid_key": return `${issue.origin} 中有無效的鍵值`;
					case "invalid_union": return "無效的輸入值";
					case "invalid_element": return `${issue.origin} 中有無效的值`;
					default: return `無效的輸入值`;
				}
			};
		};
		function zh_TW_default() {
			return { localeError: error$1() };
		}
		const error = () => {
			const Sizable = {
				string: {
					unit: "àmi",
					verb: "ní"
				},
				file: {
					unit: "bytes",
					verb: "ní"
				},
				array: {
					unit: "nkan",
					verb: "ní"
				},
				set: {
					unit: "nkan",
					verb: "ní"
				}
			};
			function getSizing(origin) {
				return Sizable[origin] ?? null;
			}
			const FormatDictionary = {
				regex: "ẹ̀rọ ìbáwọlé",
				email: "àdírẹ́sì ìmẹ́lì",
				url: "URL",
				emoji: "emoji",
				uuid: "UUID",
				uuidv4: "UUIDv4",
				uuidv6: "UUIDv6",
				nanoid: "nanoid",
				guid: "GUID",
				cuid: "cuid",
				cuid2: "cuid2",
				ulid: "ULID",
				xid: "XID",
				ksuid: "KSUID",
				datetime: "àkókò ISO",
				date: "ọjọ́ ISO",
				time: "àkókò ISO",
				duration: "àkókò tó pé ISO",
				ipv4: "àdírẹ́sì IPv4",
				ipv6: "àdírẹ́sì IPv6",
				cidrv4: "àgbègbè IPv4",
				cidrv6: "àgbègbè IPv6",
				base64: "ọ̀rọ̀ tí a kọ́ ní base64",
				base64url: "ọ̀rọ̀ base64url",
				json_string: "ọ̀rọ̀ JSON",
				e164: "nọ́mbà E.164",
				jwt: "JWT",
				template_literal: "ẹ̀rọ ìbáwọlé"
			};
			const TypeDictionary = {
				nan: "NaN",
				number: "nọ́mbà",
				array: "akopọ"
			};
			return (issue) => {
				switch (issue.code) {
					case "invalid_type": {
						const expected = TypeDictionary[issue.expected] ?? issue.expected;
						const receivedType = parsedType(issue.input);
						const received = TypeDictionary[receivedType] ?? receivedType;
						if (/^[A-Z]/.test(issue.expected)) return `Ìbáwọlé aṣìṣe: a ní láti fi instanceof ${issue.expected}, àmọ̀ a rí ${received}`;
						return `Ìbáwọlé aṣìṣe: a ní láti fi ${expected}, àmọ̀ a rí ${received}`;
					}
					case "invalid_value":
						if (issue.values.length === 1) return `Ìbáwọlé aṣìṣe: a ní láti fi ${stringifyPrimitive(issue.values[0])}`;
						return `Àṣàyàn aṣìṣe: yan ọ̀kan lára ${joinValues(issue.values, "|")}`;
					case "too_big": {
						const adj = issue.inclusive ? "<=" : "<";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Tó pọ̀ jù: a ní láti jẹ́ pé ${issue.origin ?? "iye"} ${sizing.verb} ${adj}${issue.maximum} ${sizing.unit}`;
						return `Tó pọ̀ jù: a ní láti jẹ́ ${adj}${issue.maximum}`;
					}
					case "too_small": {
						const adj = issue.inclusive ? ">=" : ">";
						const sizing = getSizing(issue.origin);
						if (sizing) return `Kéré ju: a ní láti jẹ́ pé ${issue.origin} ${sizing.verb} ${adj}${issue.minimum} ${sizing.unit}`;
						return `Kéré ju: a ní láti jẹ́ ${adj}${issue.minimum}`;
					}
					case "invalid_format": {
						const _issue = issue;
						if (_issue.format === "starts_with") return `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ bẹ̀rẹ̀ pẹ̀lú "${_issue.prefix}"`;
						if (_issue.format === "ends_with") return `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ parí pẹ̀lú "${_issue.suffix}"`;
						if (_issue.format === "includes") return `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ ní "${_issue.includes}"`;
						if (_issue.format === "regex") return `Ọ̀rọ̀ aṣìṣe: gbọ́dọ̀ bá àpẹẹrẹ mu ${_issue.pattern}`;
						return `Aṣìṣe: ${FormatDictionary[_issue.format] ?? issue.format}`;
					}
					case "not_multiple_of": return `Nọ́mbà aṣìṣe: gbọ́dọ̀ jẹ́ èyà pípín ti ${issue.divisor}`;
					case "unrecognized_keys": return `Bọtìnì àìmọ̀: ${joinValues(issue.keys, ", ")}`;
					case "invalid_key": return `Bọtìnì aṣìṣe nínú ${issue.origin}`;
					case "invalid_union": return "Ìbáwọlé aṣìṣe";
					case "invalid_element": return `Iye aṣìṣe nínú ${issue.origin}`;
					default: return "Ìbáwọlé aṣìṣe";
				}
			};
		};
		function yo_default() {
			return { localeError: error() };
		}
		var locales_exports = /* @__PURE__ */ __exportAll({
			ar: () => ar_default,
			az: () => az_default,
			be: () => be_default,
			bg: () => bg_default,
			ca: () => ca_default,
			cs: () => cs_default,
			da: () => da_default,
			de: () => de_default,
			el: () => el_default,
			en: () => en_default,
			eo: () => eo_default,
			es: () => es_default,
			fa: () => fa_default,
			fi: () => fi_default,
			fr: () => fr_default,
			frCA: () => fr_CA_default,
			he: () => he_default,
			hr: () => hr_default,
			hu: () => hu_default,
			hy: () => hy_default,
			id: () => id_default,
			is: () => is_default,
			it: () => it_default,
			ja: () => ja_default,
			ka: () => ka_default,
			kh: () => kh_default,
			km: () => km_default,
			ko: () => ko_default,
			lt: () => lt_default,
			mk: () => mk_default,
			ms: () => ms_default,
			nl: () => nl_default,
			no: () => no_default,
			ota: () => ota_default,
			pl: () => pl_default,
			ps: () => ps_default,
			pt: () => pt_default,
			ro: () => ro_default,
			ru: () => ru_default,
			sl: () => sl_default,
			sv: () => sv_default,
			ta: () => ta_default,
			th: () => th_default,
			tr: () => tr_default,
			ua: () => ua_default,
			uk: () => uk_default,
			ur: () => ur_default,
			uz: () => uz_default,
			vi: () => vi_default,
			yo: () => yo_default,
			zhCN: () => zh_CN_default,
			zhTW: () => zh_TW_default
		});
		var _a;
		const $output = Symbol("ZodOutput");
		const $input = Symbol("ZodInput");
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
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class({
				type: "string",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _coercedString(Class, params) {
			return new Class({
				type: "string",
				coerce: true,
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
		function _mac(Class, params) {
			return new Class({
				type: "string",
				format: "mac",
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
		const TimePrecision = {
			Any: null,
			Minute: -1,
			Second: 0,
			Millisecond: 3,
			Microsecond: 6
		};
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
		function _number(Class, params) {
			return new Class({
				type: "number",
				checks: [],
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _coercedNumber(Class, params) {
			return new Class({
				type: "number",
				coerce: true,
				checks: [],
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _int(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "safeint",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _float32(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "float32",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _float64(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "float64",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _int32(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "int32",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uint32(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "uint32",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _boolean(Class, params) {
			return new Class({
				type: "boolean",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _coercedBoolean(Class, params) {
			return new Class({
				type: "boolean",
				coerce: true,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _bigint(Class, params) {
			return new Class({
				type: "bigint",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _coercedBigint(Class, params) {
			return new Class({
				type: "bigint",
				coerce: true,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _int64(Class, params) {
			return new Class({
				type: "bigint",
				check: "bigint_format",
				abort: false,
				format: "int64",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uint64(Class, params) {
			return new Class({
				type: "bigint",
				check: "bigint_format",
				abort: false,
				format: "uint64",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _symbol(Class, params) {
			return new Class({
				type: "symbol",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _undefined$1(Class, params) {
			return new Class({
				type: "undefined",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _null$1(Class, params) {
			return new Class({
				type: "null",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _any(Class) {
			return new Class({ type: "any" });
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
		function _void$1(Class, params) {
			return new Class({
				type: "void",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _date(Class, params) {
			return new Class({
				type: "date",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _coercedDate(Class, params) {
			return new Class({
				type: "date",
				coerce: true,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nan(Class, params) {
			return new Class({
				type: "nan",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lt(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lte(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gt(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gte(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _positive(params) {
			return /* @__PURE__ */ _gt(0, params);
		}
		// @__NO_SIDE_EFFECTS__
		function _negative(params) {
			return /* @__PURE__ */ _lt(0, params);
		}
		// @__NO_SIDE_EFFECTS__
		function _nonpositive(params) {
			return /* @__PURE__ */ _lte(0, params);
		}
		// @__NO_SIDE_EFFECTS__
		function _nonnegative(params) {
			return /* @__PURE__ */ _gte(0, params);
		}
		// @__NO_SIDE_EFFECTS__
		function _multipleOf(value, params) {
			return new $ZodCheckMultipleOf({
				check: "multiple_of",
				...normalizeParams(params),
				value
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _maxSize(maximum, params) {
			return new $ZodCheckMaxSize({
				check: "max_size",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minSize(minimum, params) {
			return new $ZodCheckMinSize({
				check: "min_size",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _size(size, params) {
			return new $ZodCheckSizeEquals({
				check: "size_equals",
				...normalizeParams(params),
				size
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
		function _property(property, schema, params) {
			return new $ZodCheckProperty({
				check: "property",
				property,
				schema,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _mime(types, params) {
			return new $ZodCheckMimeType({
				check: "mime_type",
				mime: types,
				...normalizeParams(params)
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
		function _union(Class, options, params) {
			return new Class({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		function _xor(Class, options, params) {
			return new Class({
				type: "union",
				options,
				inclusive: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _discriminatedUnion(Class, discriminator, options, params) {
			return new Class({
				type: "union",
				options,
				discriminator,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _intersection(Class, left, right) {
			return new Class({
				type: "intersection",
				left,
				right
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _tuple(Class, items, _paramsOrRest, _params) {
			const hasRest = _paramsOrRest instanceof $ZodType;
			return new Class({
				type: "tuple",
				items,
				rest: hasRest ? _paramsOrRest : null,
				...normalizeParams(hasRest ? _params : _paramsOrRest)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _record(Class, keyType, valueType, params) {
			return new Class({
				type: "record",
				keyType,
				valueType,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _map(Class, keyType, valueType, params) {
			return new Class({
				type: "map",
				keyType,
				valueType,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _set(Class, valueType, params) {
			return new Class({
				type: "set",
				valueType,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _enum$1(Class, values, params) {
			return new Class({
				type: "enum",
				entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
				...normalizeParams(params)
			});
		}
		/** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
		*
		* ```ts
		* enum Colors { red, green, blue }
		* z.enum(Colors);
		* ```
		*/
		// @__NO_SIDE_EFFECTS__
		function _nativeEnum(Class, entries, params) {
			return new Class({
				type: "enum",
				entries,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _literal(Class, value, params) {
			return new Class({
				type: "literal",
				values: Array.isArray(value) ? value : [value],
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _file(Class, params) {
			return new Class({
				type: "file",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _transform(Class, fn) {
			return new Class({
				type: "transform",
				transform: fn
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _optional(Class, innerType) {
			return new Class({
				type: "optional",
				innerType
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nullable(Class, innerType) {
			return new Class({
				type: "nullable",
				innerType
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _default$1(Class, innerType, defaultValue) {
			return new Class({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nonoptional(Class, innerType, params) {
			return new Class({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _success(Class, innerType) {
			return new Class({
				type: "success",
				innerType
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _catch$1(Class, innerType, catchValue) {
			return new Class({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _pipe(Class, in_, out) {
			return new Class({
				type: "pipe",
				in: in_,
				out
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _readonly(Class, innerType) {
			return new Class({
				type: "readonly",
				innerType
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _templateLiteral(Class, parts, params) {
			return new Class({
				type: "template_literal",
				parts,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lazy(Class, getter) {
			return new Class({
				type: "lazy",
				getter
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _promise(Class, innerType) {
			return new Class({
				type: "promise",
				innerType
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _custom(Class, fn, _params) {
			const norm = normalizeParams(_params);
			norm.abort ?? (norm.abort = true);
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...norm
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
		// @__NO_SIDE_EFFECTS__
		function describe$1(description) {
			const ch = new $ZodCheck({ check: "describe" });
			ch._zod.onattach = [(inst) => {
				const existing = globalRegistry.get(inst) ?? {};
				globalRegistry.add(inst, {
					...existing,
					description
				});
			}];
			ch._zod.check = () => {};
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function meta$1(metadata) {
			const ch = new $ZodCheck({ check: "meta" });
			ch._zod.onattach = [(inst) => {
				const existing = globalRegistry.get(inst) ?? {};
				globalRegistry.add(inst, {
					...existing,
					...metadata
				});
			}];
			ch._zod.check = () => {};
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _stringbool(Classes, _params) {
			const params = normalizeParams(_params);
			let truthyArray = params.truthy ?? [
				"true",
				"1",
				"yes",
				"on",
				"y",
				"enabled"
			];
			let falsyArray = params.falsy ?? [
				"false",
				"0",
				"no",
				"off",
				"n",
				"disabled"
			];
			if (params.case !== "sensitive") {
				truthyArray = truthyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
				falsyArray = falsyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
			}
			const truthySet = new Set(truthyArray);
			const falsySet = new Set(falsyArray);
			const _Codec = Classes.Codec ?? $ZodCodec;
			const _Boolean = Classes.Boolean ?? $ZodBoolean;
			const codec = new _Codec({
				type: "pipe",
				in: new (Classes.String ?? $ZodString)({
					type: "string",
					error: params.error
				}),
				out: new _Boolean({
					type: "boolean",
					error: params.error
				}),
				transform: ((input, payload) => {
					let data = input;
					if (params.case !== "sensitive") data = data.toLowerCase();
					if (truthySet.has(data)) return true;
					else if (falsySet.has(data)) return false;
					else {
						payload.issues.push({
							code: "invalid_value",
							expected: "stringbool",
							values: [...truthySet, ...falsySet],
							input: payload.value,
							inst: codec,
							continue: false
						});
						return {};
					}
				}),
				reverseTransform: ((input, _payload) => {
					if (input === true) return truthyArray[0] || "true";
					else return falsyArray[0] || "false";
				}),
				error: params.error
			});
			return codec;
		}
		// @__NO_SIDE_EFFECTS__
		function _stringFormat(Class, format, fnOrRegex, _params = {}) {
			const params = normalizeParams(_params);
			const def = {
				...normalizeParams(_params),
				check: "string_format",
				type: "string",
				format,
				fn: typeof fnOrRegex === "function" ? fnOrRegex : (val) => fnOrRegex.test(val),
				...params
			};
			if (fnOrRegex instanceof RegExp) def.pattern = fnOrRegex;
			return new Class(def);
		}
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
		const numberProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
			if (typeof format === "string" && format.includes("int")) json.type = "integer";
			else json.type = "number";
			const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
			const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
			const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
			if (exMin) if (legacy) {
				json.minimum = exclusiveMinimum;
				json.exclusiveMinimum = true;
			} else json.exclusiveMinimum = exclusiveMinimum;
			else if (typeof minimum === "number") json.minimum = minimum;
			if (exMax) if (legacy) {
				json.maximum = exclusiveMaximum;
				json.exclusiveMaximum = true;
			} else json.exclusiveMaximum = exclusiveMaximum;
			else if (typeof maximum === "number") json.maximum = maximum;
			if (typeof multipleOf === "number") json.multipleOf = multipleOf;
		};
		const booleanProcessor = (_schema, _ctx, json, _params) => {
			json.type = "boolean";
		};
		const bigintProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("BigInt cannot be represented in JSON Schema");
		};
		const symbolProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Symbols cannot be represented in JSON Schema");
		};
		const nullProcessor = (_schema, ctx, json, _params) => {
			if (ctx.target === "openapi-3.0") {
				json.type = "string";
				json.nullable = true;
				json.enum = [null];
			} else json.type = "null";
		};
		const undefinedProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Undefined cannot be represented in JSON Schema");
		};
		const voidProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Void cannot be represented in JSON Schema");
		};
		const neverProcessor = (_schema, _ctx, json, _params) => {
			json.not = {};
		};
		const anyProcessor = (_schema, _ctx, _json, _params) => {};
		const unknownProcessor = (_schema, _ctx, _json, _params) => {};
		const dateProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Date cannot be represented in JSON Schema");
		};
		const enumProcessor = (schema, _ctx, json, _params) => {
			const def = schema._zod.def;
			const values = getEnumValues(def.entries);
			if (values.every((v) => typeof v === "number")) json.type = "number";
			if (values.every((v) => typeof v === "string")) json.type = "string";
			json.enum = values;
		};
		const literalProcessor = (schema, ctx, json, _params) => {
			const def = schema._zod.def;
			const vals = [];
			for (const val of def.values) if (val === void 0) {
				if (ctx.unrepresentable === "throw") throw new Error("Literal `undefined` cannot be represented in JSON Schema");
			} else if (typeof val === "bigint") if (ctx.unrepresentable === "throw") throw new Error("BigInt literals cannot be represented in JSON Schema");
			else vals.push(Number(val));
			else vals.push(val);
			if (vals.length === 0) {} else if (vals.length === 1) {
				const val = vals[0];
				json.type = val === null ? "null" : typeof val;
				if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
				else json.const = val;
			} else {
				if (vals.every((v) => typeof v === "number")) json.type = "number";
				if (vals.every((v) => typeof v === "string")) json.type = "string";
				if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
				if (vals.every((v) => v === null)) json.type = "null";
				json.enum = vals;
			}
		};
		const nanProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("NaN cannot be represented in JSON Schema");
		};
		const templateLiteralProcessor = (schema, _ctx, json, _params) => {
			const _json = json;
			const pattern = schema._zod.pattern;
			if (!pattern) throw new Error("Pattern not found in template literal");
			_json.type = "string";
			_json.pattern = pattern.source;
		};
		const fileProcessor = (schema, _ctx, json, _params) => {
			const _json = json;
			const file = {
				type: "string",
				format: "binary",
				contentEncoding: "binary"
			};
			const { minimum, maximum, mime } = schema._zod.bag;
			if (minimum !== void 0) file.minLength = minimum;
			if (maximum !== void 0) file.maxLength = maximum;
			if (mime) if (mime.length === 1) {
				file.contentMediaType = mime[0];
				Object.assign(_json, file);
			} else {
				Object.assign(_json, file);
				_json.anyOf = mime.map((m) => ({ contentMediaType: m }));
			}
			else Object.assign(_json, file);
		};
		const successProcessor = (_schema, _ctx, json, _params) => {
			json.type = "boolean";
		};
		const customProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		};
		const functionProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Function types cannot be represented in JSON Schema");
		};
		const transformProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		};
		const mapProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Map cannot be represented in JSON Schema");
		};
		const setProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Set cannot be represented in JSON Schema");
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
		const tupleProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "array";
			const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
			const restPath = ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";
			const prefixItems = def.items.map((x, i) => process(x, ctx, {
				...params,
				path: [
					...params.path,
					prefixPath,
					i
				]
			}));
			const rest = def.rest ? process(def.rest, ctx, {
				...params,
				path: [
					...params.path,
					restPath,
					...ctx.target === "openapi-3.0" ? [def.items.length] : []
				]
			}) : null;
			if (ctx.target === "draft-2020-12") {
				json.prefixItems = prefixItems;
				if (rest) json.items = rest;
			} else if (ctx.target === "openapi-3.0") {
				json.items = { anyOf: prefixItems };
				if (rest) json.items.anyOf.push(rest);
				json.minItems = prefixItems.length;
				if (!rest) json.maxItems = prefixItems.length;
			} else {
				json.items = prefixItems;
				if (rest) json.additionalItems = rest;
			}
			const { minimum, maximum } = schema._zod.bag;
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
		};
		const recordProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			const keyType = def.keyType;
			const patterns = keyType._zod.bag?.patterns;
			if (def.mode === "loose" && patterns && patterns.size > 0) {
				const valueSchema = process(def.valueType, ctx, {
					...params,
					path: [
						...params.path,
						"patternProperties",
						"*"
					]
				});
				json.patternProperties = {};
				for (const pattern of patterns) json.patternProperties[pattern.source] = valueSchema;
			} else {
				if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") json.propertyNames = process(def.keyType, ctx, {
					...params,
					path: [...params.path, "propertyNames"]
				});
				json.additionalProperties = process(def.valueType, ctx, {
					...params,
					path: [...params.path, "additionalProperties"]
				});
			}
			const keyValues = keyType._zod.values;
			if (keyValues) {
				const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
				if (validKeyValues.length > 0) json.required = validKeyValues;
			}
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
		const promiseProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const lazyProcessor = (schema, ctx, _json, params) => {
			const innerType = schema._zod.innerType;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const allProcessors = {
			string: stringProcessor,
			number: numberProcessor,
			boolean: booleanProcessor,
			bigint: bigintProcessor,
			symbol: symbolProcessor,
			null: nullProcessor,
			undefined: undefinedProcessor,
			void: voidProcessor,
			never: neverProcessor,
			any: anyProcessor,
			unknown: unknownProcessor,
			date: dateProcessor,
			enum: enumProcessor,
			literal: literalProcessor,
			nan: nanProcessor,
			template_literal: templateLiteralProcessor,
			file: fileProcessor,
			success: successProcessor,
			custom: customProcessor,
			function: functionProcessor,
			transform: transformProcessor,
			map: mapProcessor,
			set: setProcessor,
			array: arrayProcessor,
			object: objectProcessor,
			union: unionProcessor,
			intersection: intersectionProcessor,
			tuple: tupleProcessor,
			record: recordProcessor,
			nullable: nullableProcessor,
			nonoptional: nonoptionalProcessor,
			default: defaultProcessor,
			prefault: prefaultProcessor,
			catch: catchProcessor,
			pipe: pipeProcessor,
			readonly: readonlyProcessor,
			promise: promiseProcessor,
			optional: optionalProcessor,
			lazy: lazyProcessor
		};
		function toJSONSchema(input, params) {
			if ("_idmap" in input) {
				const registry = input;
				const ctx = initializeContext({
					...params,
					processors: allProcessors
				});
				const defs = {};
				for (const entry of registry._idmap.entries()) {
					const [_, schema] = entry;
					process(schema, ctx);
				}
				const schemas = {};
				ctx.external = {
					registry,
					uri: params?.uri,
					defs
				};
				for (const entry of registry._idmap.entries()) {
					const [key, schema] = entry;
					extractDefs(ctx, schema);
					schemas[key] = finalize(ctx, schema);
				}
				if (Object.keys(defs).length > 0) schemas.__shared = { [ctx.target === "draft-2020-12" ? "$defs" : "definitions"]: defs };
				return { schemas };
			}
			const ctx = initializeContext({
				...params,
				processors: allProcessors
			});
			process(input, ctx);
			extractDefs(ctx, input);
			return finalize(ctx, input);
		}
		/**
		* Legacy class-based interface for JSON Schema generation.
		* This class wraps the new functional implementation to provide backward compatibility.
		*
		* @deprecated Use the `toJSONSchema` function instead for new code.
		*
		* @example
		* ```typescript
		* // Legacy usage (still supported)
		* const gen = new JSONSchemaGenerator({ target: "draft-07" });
		* gen.process(schema);
		* const result = gen.emit(schema);
		*
		* // Preferred modern usage
		* const result = toJSONSchema(schema, { target: "draft-07" });
		* ```
		*/
		var JSONSchemaGenerator = class {
			/** @deprecated Access via ctx instead */
			get metadataRegistry() {
				return this.ctx.metadataRegistry;
			}
			/** @deprecated Access via ctx instead */
			get target() {
				return this.ctx.target;
			}
			/** @deprecated Access via ctx instead */
			get unrepresentable() {
				return this.ctx.unrepresentable;
			}
			/** @deprecated Access via ctx instead */
			get override() {
				return this.ctx.override;
			}
			/** @deprecated Access via ctx instead */
			get io() {
				return this.ctx.io;
			}
			/** @deprecated Access via ctx instead */
			get counter() {
				return this.ctx.counter;
			}
			set counter(value) {
				this.ctx.counter = value;
			}
			/** @deprecated Access via ctx instead */
			get seen() {
				return this.ctx.seen;
			}
			constructor(params) {
				let normalizedTarget = params?.target ?? "draft-2020-12";
				if (normalizedTarget === "draft-4") normalizedTarget = "draft-04";
				if (normalizedTarget === "draft-7") normalizedTarget = "draft-07";
				this.ctx = initializeContext({
					processors: allProcessors,
					target: normalizedTarget,
					...params?.metadata && { metadata: params.metadata },
					...params?.unrepresentable && { unrepresentable: params.unrepresentable },
					...params?.override && { override: params.override },
					...params?.io && { io: params.io }
				});
			}
			/**
			* Process a schema to prepare it for JSON Schema generation.
			* This must be called before emit().
			*/
			process(schema, _params = {
				path: [],
				schemaPath: []
			}) {
				return process(schema, this.ctx, _params);
			}
			/**
			* Emit the final JSON Schema after processing.
			* Must call process() first.
			*/
			emit(schema, _params) {
				if (_params) {
					if (_params.cycles) this.ctx.cycles = _params.cycles;
					if (_params.reused) this.ctx.reused = _params.reused;
					if (_params.external) this.ctx.external = _params.external;
				}
				extractDefs(this.ctx, schema);
				const { "~standard": _, ...plainResult } = finalize(this.ctx, schema);
				return plainResult;
			}
		};
		var json_schema_exports = /* @__PURE__ */ __exportAll({});
		var core_exports = /* @__PURE__ */ __exportAll({
			$ZodAny: () => $ZodAny,
			$ZodArray: () => $ZodArray,
			$ZodAsyncError: () => $ZodAsyncError,
			$ZodBase64: () => $ZodBase64,
			$ZodBase64URL: () => $ZodBase64URL,
			$ZodBigInt: () => $ZodBigInt,
			$ZodBigIntFormat: () => $ZodBigIntFormat,
			$ZodBoolean: () => $ZodBoolean,
			$ZodCIDRv4: () => $ZodCIDRv4,
			$ZodCIDRv6: () => $ZodCIDRv6,
			$ZodCUID: () => $ZodCUID,
			$ZodCUID2: () => $ZodCUID2,
			$ZodCatch: () => $ZodCatch,
			$ZodCheck: () => $ZodCheck,
			$ZodCheckBigIntFormat: () => $ZodCheckBigIntFormat,
			$ZodCheckEndsWith: () => $ZodCheckEndsWith,
			$ZodCheckGreaterThan: () => $ZodCheckGreaterThan,
			$ZodCheckIncludes: () => $ZodCheckIncludes,
			$ZodCheckLengthEquals: () => $ZodCheckLengthEquals,
			$ZodCheckLessThan: () => $ZodCheckLessThan,
			$ZodCheckLowerCase: () => $ZodCheckLowerCase,
			$ZodCheckMaxLength: () => $ZodCheckMaxLength,
			$ZodCheckMaxSize: () => $ZodCheckMaxSize,
			$ZodCheckMimeType: () => $ZodCheckMimeType,
			$ZodCheckMinLength: () => $ZodCheckMinLength,
			$ZodCheckMinSize: () => $ZodCheckMinSize,
			$ZodCheckMultipleOf: () => $ZodCheckMultipleOf,
			$ZodCheckNumberFormat: () => $ZodCheckNumberFormat,
			$ZodCheckOverwrite: () => $ZodCheckOverwrite,
			$ZodCheckProperty: () => $ZodCheckProperty,
			$ZodCheckRegex: () => $ZodCheckRegex,
			$ZodCheckSizeEquals: () => $ZodCheckSizeEquals,
			$ZodCheckStartsWith: () => $ZodCheckStartsWith,
			$ZodCheckStringFormat: () => $ZodCheckStringFormat,
			$ZodCheckUpperCase: () => $ZodCheckUpperCase,
			$ZodCodec: () => $ZodCodec,
			$ZodCustom: () => $ZodCustom,
			$ZodCustomStringFormat: () => $ZodCustomStringFormat,
			$ZodDate: () => $ZodDate,
			$ZodDefault: () => $ZodDefault,
			$ZodDiscriminatedUnion: () => $ZodDiscriminatedUnion,
			$ZodE164: () => $ZodE164,
			$ZodEmail: () => $ZodEmail,
			$ZodEmoji: () => $ZodEmoji,
			$ZodEncodeError: () => $ZodEncodeError,
			$ZodEnum: () => $ZodEnum,
			$ZodError: () => $ZodError,
			$ZodExactOptional: () => $ZodExactOptional,
			$ZodFile: () => $ZodFile,
			$ZodFunction: () => $ZodFunction,
			$ZodGUID: () => $ZodGUID,
			$ZodIPv4: () => $ZodIPv4,
			$ZodIPv6: () => $ZodIPv6,
			$ZodISODate: () => $ZodISODate,
			$ZodISODateTime: () => $ZodISODateTime,
			$ZodISODuration: () => $ZodISODuration,
			$ZodISOTime: () => $ZodISOTime,
			$ZodIntersection: () => $ZodIntersection,
			$ZodJWT: () => $ZodJWT,
			$ZodKSUID: () => $ZodKSUID,
			$ZodLazy: () => $ZodLazy,
			$ZodLiteral: () => $ZodLiteral,
			$ZodMAC: () => $ZodMAC,
			$ZodMap: () => $ZodMap,
			$ZodNaN: () => $ZodNaN,
			$ZodNanoID: () => $ZodNanoID,
			$ZodNever: () => $ZodNever,
			$ZodNonOptional: () => $ZodNonOptional,
			$ZodNull: () => $ZodNull,
			$ZodNullable: () => $ZodNullable,
			$ZodNumber: () => $ZodNumber,
			$ZodNumberFormat: () => $ZodNumberFormat,
			$ZodObject: () => $ZodObject,
			$ZodObjectJIT: () => $ZodObjectJIT,
			$ZodOptional: () => $ZodOptional,
			$ZodPipe: () => $ZodPipe,
			$ZodPrefault: () => $ZodPrefault,
			$ZodPreprocess: () => $ZodPreprocess,
			$ZodPromise: () => $ZodPromise,
			$ZodReadonly: () => $ZodReadonly,
			$ZodRealError: () => $ZodRealError,
			$ZodRecord: () => $ZodRecord,
			$ZodRegistry: () => $ZodRegistry,
			$ZodSet: () => $ZodSet,
			$ZodString: () => $ZodString,
			$ZodStringFormat: () => $ZodStringFormat,
			$ZodSuccess: () => $ZodSuccess,
			$ZodSymbol: () => $ZodSymbol,
			$ZodTemplateLiteral: () => $ZodTemplateLiteral,
			$ZodTransform: () => $ZodTransform,
			$ZodTuple: () => $ZodTuple,
			$ZodType: () => $ZodType,
			$ZodULID: () => $ZodULID,
			$ZodURL: () => $ZodURL,
			$ZodUUID: () => $ZodUUID,
			$ZodUndefined: () => $ZodUndefined,
			$ZodUnion: () => $ZodUnion,
			$ZodUnknown: () => $ZodUnknown,
			$ZodVoid: () => $ZodVoid,
			$ZodXID: () => $ZodXID,
			$ZodXor: () => $ZodXor,
			$brand: () => $brand,
			$constructor: () => $constructor,
			$input: () => $input,
			$output: () => $output,
			Doc: () => Doc,
			JSONSchema: () => json_schema_exports,
			JSONSchemaGenerator: () => JSONSchemaGenerator,
			NEVER: () => NEVER,
			TimePrecision: () => TimePrecision,
			_any: () => _any,
			_array: () => _array,
			_base64: () => _base64,
			_base64url: () => _base64url,
			_bigint: () => _bigint,
			_boolean: () => _boolean,
			_catch: () => _catch$1,
			_check: () => _check,
			_cidrv4: () => _cidrv4,
			_cidrv6: () => _cidrv6,
			_coercedBigint: () => _coercedBigint,
			_coercedBoolean: () => _coercedBoolean,
			_coercedDate: () => _coercedDate,
			_coercedNumber: () => _coercedNumber,
			_coercedString: () => _coercedString,
			_cuid: () => _cuid,
			_cuid2: () => _cuid2,
			_custom: () => _custom,
			_date: () => _date,
			_decode: () => _decode,
			_decodeAsync: () => _decodeAsync,
			_default: () => _default$1,
			_discriminatedUnion: () => _discriminatedUnion,
			_e164: () => _e164,
			_email: () => _email,
			_emoji: () => _emoji,
			_encode: () => _encode,
			_encodeAsync: () => _encodeAsync,
			_endsWith: () => _endsWith,
			_enum: () => _enum$1,
			_file: () => _file,
			_float32: () => _float32,
			_float64: () => _float64,
			_gt: () => _gt,
			_gte: () => _gte,
			_guid: () => _guid,
			_includes: () => _includes,
			_int: () => _int,
			_int32: () => _int32,
			_int64: () => _int64,
			_intersection: () => _intersection,
			_ipv4: () => _ipv4,
			_ipv6: () => _ipv6,
			_isoDate: () => _isoDate,
			_isoDateTime: () => _isoDateTime,
			_isoDuration: () => _isoDuration,
			_isoTime: () => _isoTime,
			_jwt: () => _jwt,
			_ksuid: () => _ksuid,
			_lazy: () => _lazy,
			_length: () => _length,
			_literal: () => _literal,
			_lowercase: () => _lowercase,
			_lt: () => _lt,
			_lte: () => _lte,
			_mac: () => _mac,
			_map: () => _map,
			_max: () => _lte,
			_maxLength: () => _maxLength,
			_maxSize: () => _maxSize,
			_mime: () => _mime,
			_min: () => _gte,
			_minLength: () => _minLength,
			_minSize: () => _minSize,
			_multipleOf: () => _multipleOf,
			_nan: () => _nan,
			_nanoid: () => _nanoid,
			_nativeEnum: () => _nativeEnum,
			_negative: () => _negative,
			_never: () => _never,
			_nonnegative: () => _nonnegative,
			_nonoptional: () => _nonoptional,
			_nonpositive: () => _nonpositive,
			_normalize: () => _normalize,
			_null: () => _null$1,
			_nullable: () => _nullable,
			_number: () => _number,
			_optional: () => _optional,
			_overwrite: () => _overwrite,
			_parse: () => _parse,
			_parseAsync: () => _parseAsync,
			_pipe: () => _pipe,
			_positive: () => _positive,
			_promise: () => _promise,
			_property: () => _property,
			_readonly: () => _readonly,
			_record: () => _record,
			_refine: () => _refine,
			_regex: () => _regex,
			_safeDecode: () => _safeDecode,
			_safeDecodeAsync: () => _safeDecodeAsync,
			_safeEncode: () => _safeEncode,
			_safeEncodeAsync: () => _safeEncodeAsync,
			_safeParse: () => _safeParse,
			_safeParseAsync: () => _safeParseAsync,
			_set: () => _set,
			_size: () => _size,
			_slugify: () => _slugify,
			_startsWith: () => _startsWith,
			_string: () => _string,
			_stringFormat: () => _stringFormat,
			_stringbool: () => _stringbool,
			_success: () => _success,
			_superRefine: () => _superRefine,
			_symbol: () => _symbol,
			_templateLiteral: () => _templateLiteral,
			_toLowerCase: () => _toLowerCase,
			_toUpperCase: () => _toUpperCase,
			_transform: () => _transform,
			_trim: () => _trim,
			_tuple: () => _tuple,
			_uint32: () => _uint32,
			_uint64: () => _uint64,
			_ulid: () => _ulid,
			_undefined: () => _undefined$1,
			_union: () => _union,
			_unknown: () => _unknown,
			_uppercase: () => _uppercase,
			_url: () => _url,
			_uuid: () => _uuid,
			_uuidv4: () => _uuidv4,
			_uuidv6: () => _uuidv6,
			_uuidv7: () => _uuidv7,
			_void: () => _void$1,
			_xid: () => _xid,
			_xor: () => _xor,
			clone: () => clone,
			config: () => config,
			createStandardJSONSchemaMethod: () => createStandardJSONSchemaMethod,
			createToJSONSchemaMethod: () => createToJSONSchemaMethod,
			decode: () => decode$1,
			decodeAsync: () => decodeAsync$1,
			describe: () => describe$1,
			encode: () => encode$1,
			encodeAsync: () => encodeAsync$1,
			extractDefs: () => extractDefs,
			finalize: () => finalize,
			flattenError: () => flattenError,
			formatError: () => formatError,
			globalConfig: () => globalConfig,
			globalRegistry: () => globalRegistry,
			initializeContext: () => initializeContext,
			isValidBase64: () => isValidBase64,
			isValidBase64URL: () => isValidBase64URL,
			isValidJWT: () => isValidJWT,
			locales: () => locales_exports,
			meta: () => meta$1,
			parse: () => parse$1,
			parseAsync: () => parseAsync$1,
			prettifyError: () => prettifyError,
			process: () => process,
			regexes: () => regexes_exports,
			registry: () => registry,
			safeDecode: () => safeDecode$1,
			safeDecodeAsync: () => safeDecodeAsync$1,
			safeEncode: () => safeEncode$1,
			safeEncodeAsync: () => safeEncodeAsync$1,
			safeParse: () => safeParse$1,
			safeParseAsync: () => safeParseAsync$1,
			toDotPath: () => toDotPath,
			toJSONSchema: () => toJSONSchema,
			treeifyError: () => treeifyError,
			util: () => util_exports,
			version: () => version
		});
		var checks_exports = /* @__PURE__ */ __exportAll({
			endsWith: () => _endsWith,
			gt: () => _gt,
			gte: () => _gte,
			includes: () => _includes,
			length: () => _length,
			lowercase: () => _lowercase,
			lt: () => _lt,
			lte: () => _lte,
			maxLength: () => _maxLength,
			maxSize: () => _maxSize,
			mime: () => _mime,
			minLength: () => _minLength,
			minSize: () => _minSize,
			multipleOf: () => _multipleOf,
			negative: () => _negative,
			nonnegative: () => _nonnegative,
			nonpositive: () => _nonpositive,
			normalize: () => _normalize,
			overwrite: () => _overwrite,
			positive: () => _positive,
			property: () => _property,
			regex: () => _regex,
			size: () => _size,
			slugify: () => _slugify,
			startsWith: () => _startsWith,
			toLowerCase: () => _toLowerCase,
			toUpperCase: () => _toUpperCase,
			trim: () => _trim,
			uppercase: () => _uppercase
		});
		var iso_exports = /* @__PURE__ */ __exportAll({
			ZodISODate: () => ZodISODate,
			ZodISODateTime: () => ZodISODateTime,
			ZodISODuration: () => ZodISODuration,
			ZodISOTime: () => ZodISOTime,
			date: () => date$2,
			datetime: () => datetime,
			duration: () => duration,
			time: () => time
		});
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
		function date$2(params) {
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
		const ZodError = /*@__PURE__*/ $constructor("ZodError", initializer);
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, { Parent: Error });
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
		var schemas_exports = /* @__PURE__ */ __exportAll({
			ZodAny: () => ZodAny,
			ZodArray: () => ZodArray,
			ZodBase64: () => ZodBase64,
			ZodBase64URL: () => ZodBase64URL,
			ZodBigInt: () => ZodBigInt,
			ZodBigIntFormat: () => ZodBigIntFormat,
			ZodBoolean: () => ZodBoolean,
			ZodCIDRv4: () => ZodCIDRv4,
			ZodCIDRv6: () => ZodCIDRv6,
			ZodCUID: () => ZodCUID,
			ZodCUID2: () => ZodCUID2,
			ZodCatch: () => ZodCatch,
			ZodCodec: () => ZodCodec,
			ZodCustom: () => ZodCustom,
			ZodCustomStringFormat: () => ZodCustomStringFormat,
			ZodDate: () => ZodDate,
			ZodDefault: () => ZodDefault,
			ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
			ZodE164: () => ZodE164,
			ZodEmail: () => ZodEmail,
			ZodEmoji: () => ZodEmoji,
			ZodEnum: () => ZodEnum,
			ZodExactOptional: () => ZodExactOptional,
			ZodFile: () => ZodFile,
			ZodFunction: () => ZodFunction,
			ZodGUID: () => ZodGUID,
			ZodIPv4: () => ZodIPv4,
			ZodIPv6: () => ZodIPv6,
			ZodIntersection: () => ZodIntersection,
			ZodJWT: () => ZodJWT,
			ZodKSUID: () => ZodKSUID,
			ZodLazy: () => ZodLazy,
			ZodLiteral: () => ZodLiteral,
			ZodMAC: () => ZodMAC,
			ZodMap: () => ZodMap,
			ZodNaN: () => ZodNaN,
			ZodNanoID: () => ZodNanoID,
			ZodNever: () => ZodNever,
			ZodNonOptional: () => ZodNonOptional,
			ZodNull: () => ZodNull,
			ZodNullable: () => ZodNullable,
			ZodNumber: () => ZodNumber,
			ZodNumberFormat: () => ZodNumberFormat,
			ZodObject: () => ZodObject,
			ZodOptional: () => ZodOptional,
			ZodPipe: () => ZodPipe,
			ZodPrefault: () => ZodPrefault,
			ZodPreprocess: () => ZodPreprocess,
			ZodPromise: () => ZodPromise,
			ZodReadonly: () => ZodReadonly,
			ZodRecord: () => ZodRecord,
			ZodSet: () => ZodSet,
			ZodString: () => ZodString,
			ZodStringFormat: () => ZodStringFormat,
			ZodSuccess: () => ZodSuccess,
			ZodSymbol: () => ZodSymbol,
			ZodTemplateLiteral: () => ZodTemplateLiteral,
			ZodTransform: () => ZodTransform,
			ZodTuple: () => ZodTuple,
			ZodType: () => ZodType,
			ZodULID: () => ZodULID,
			ZodURL: () => ZodURL,
			ZodUUID: () => ZodUUID,
			ZodUndefined: () => ZodUndefined,
			ZodUnion: () => ZodUnion,
			ZodUnknown: () => ZodUnknown,
			ZodVoid: () => ZodVoid,
			ZodXID: () => ZodXID,
			ZodXor: () => ZodXor,
			_ZodString: () => _ZodString,
			_default: () => _default,
			_function: () => _function,
			any: () => any,
			array: () => array,
			base64: () => base64,
			base64url: () => base64url,
			bigint: () => bigint$1,
			boolean: () => boolean$1,
			catch: () => _catch,
			check: () => check,
			cidrv4: () => cidrv4,
			cidrv6: () => cidrv6,
			codec: () => codec,
			cuid: () => cuid,
			cuid2: () => cuid2,
			custom: () => custom,
			date: () => date$1,
			describe: () => describe,
			discriminatedUnion: () => discriminatedUnion,
			e164: () => e164,
			email: () => email,
			emoji: () => emoji,
			enum: () => _enum,
			exactOptional: () => exactOptional,
			file: () => file,
			float32: () => float32,
			float64: () => float64,
			function: () => _function,
			guid: () => guid,
			hash: () => hash,
			hex: () => hex,
			hostname: () => hostname,
			httpUrl: () => httpUrl,
			instanceof: () => _instanceof,
			int: () => int,
			int32: () => int32,
			int64: () => int64,
			intersection: () => intersection,
			invertCodec: () => invertCodec,
			ipv4: () => ipv4,
			ipv6: () => ipv6,
			json: () => json,
			jwt: () => jwt,
			keyof: () => keyof,
			ksuid: () => ksuid,
			lazy: () => lazy,
			literal: () => literal,
			looseObject: () => looseObject,
			looseRecord: () => looseRecord,
			mac: () => mac,
			map: () => map,
			meta: () => meta,
			nan: () => nan,
			nanoid: () => nanoid,
			nativeEnum: () => nativeEnum,
			never: () => never,
			nonoptional: () => nonoptional,
			null: () => _null,
			nullable: () => nullable,
			nullish: () => nullish,
			number: () => number$1,
			object: () => object,
			optional: () => optional$1,
			partialRecord: () => partialRecord,
			pipe: () => pipe,
			prefault: () => prefault,
			preprocess: () => preprocess,
			promise: () => promise,
			readonly: () => readonly,
			record: () => record,
			refine: () => refine,
			set: () => set,
			strictObject: () => strictObject,
			string: () => string$1,
			stringFormat: () => stringFormat,
			stringbool: () => stringbool,
			success: () => success,
			superRefine: () => superRefine,
			symbol: () => symbol,
			templateLiteral: () => templateLiteral,
			transform: () => transform,
			tuple: () => tuple,
			uint32: () => uint32,
			uint64: () => uint64,
			ulid: () => ulid,
			undefined: () => _undefined,
			union: () => union,
			unknown: () => unknown,
			url: () => url,
			uuid: () => uuid,
			uuidv4: () => uuidv4,
			uuidv6: () => uuidv6,
			uuidv7: () => uuidv7,
			void: () => _void,
			xid: () => xid,
			xor: () => xor
		});
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
					return optional$1(this);
				},
				exactOptional() {
					return exactOptional(this);
				},
				nullable() {
					return nullable(this);
				},
				nullish() {
					return optional$1(nullable(this));
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
			inst.date = (params) => inst.check(date$2(params));
			inst.time = (params) => inst.check(time(params));
			inst.duration = (params) => inst.check(duration(params));
		});
		function string$1(params) {
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
		function email(params) {
			return /* @__PURE__ */ _email(ZodEmail, params);
		}
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function guid(params) {
			return /* @__PURE__ */ _guid(ZodGUID, params);
		}
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function uuid(params) {
			return /* @__PURE__ */ _uuid(ZodUUID, params);
		}
		function uuidv4(params) {
			return /* @__PURE__ */ _uuidv4(ZodUUID, params);
		}
		function uuidv6(params) {
			return /* @__PURE__ */ _uuidv6(ZodUUID, params);
		}
		function uuidv7(params) {
			return /* @__PURE__ */ _uuidv7(ZodUUID, params);
		}
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function url(params) {
			return /* @__PURE__ */ _url(ZodURL, params);
		}
		function httpUrl(params) {
			return /* @__PURE__ */ _url(ZodURL, {
				protocol: httpProtocol,
				hostname: domain,
				...normalizeParams(params)
			});
		}
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function emoji(params) {
			return /* @__PURE__ */ _emoji(ZodEmoji, params);
		}
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function nanoid(params) {
			return /* @__PURE__ */ _nanoid(ZodNanoID, params);
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* Validates a CUID v1 string.
		*
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2 | `z.cuid2()`} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		function cuid(params) {
			return /* @__PURE__ */ _cuid(ZodCUID, params);
		}
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function cuid2(params) {
			return /* @__PURE__ */ _cuid2(ZodCUID2, params);
		}
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function ulid(params) {
			return /* @__PURE__ */ _ulid(ZodULID, params);
		}
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function xid(params) {
			return /* @__PURE__ */ _xid(ZodXID, params);
		}
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function ksuid(params) {
			return /* @__PURE__ */ _ksuid(ZodKSUID, params);
		}
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function ipv4(params) {
			return /* @__PURE__ */ _ipv4(ZodIPv4, params);
		}
		const ZodMAC = /*@__PURE__*/ $constructor("ZodMAC", (inst, def) => {
			$ZodMAC.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function mac(params) {
			return /* @__PURE__ */ _mac(ZodMAC, params);
		}
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function ipv6(params) {
			return /* @__PURE__ */ _ipv6(ZodIPv6, params);
		}
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function cidrv4(params) {
			return /* @__PURE__ */ _cidrv4(ZodCIDRv4, params);
		}
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function cidrv6(params) {
			return /* @__PURE__ */ _cidrv6(ZodCIDRv6, params);
		}
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function base64(params) {
			return /* @__PURE__ */ _base64(ZodBase64, params);
		}
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function base64url(params) {
			return /* @__PURE__ */ _base64url(ZodBase64URL, params);
		}
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function e164(params) {
			return /* @__PURE__ */ _e164(ZodE164, params);
		}
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function jwt(params) {
			return /* @__PURE__ */ _jwt(ZodJWT, params);
		}
		const ZodCustomStringFormat = /*@__PURE__*/ $constructor("ZodCustomStringFormat", (inst, def) => {
			$ZodCustomStringFormat.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function stringFormat(format, fnOrRegex, _params = {}) {
			return /* @__PURE__ */ _stringFormat(ZodCustomStringFormat, format, fnOrRegex, _params);
		}
		function hostname(_params) {
			return /* @__PURE__ */ _stringFormat(ZodCustomStringFormat, "hostname", hostname$1, _params);
		}
		function hex(_params) {
			return /* @__PURE__ */ _stringFormat(ZodCustomStringFormat, "hex", hex$1, _params);
		}
		function hash(alg, params) {
			const format = `${alg}_${params?.enc ?? "hex"}`;
			const regex = regexes_exports[format];
			if (!regex) throw new Error(`Unrecognized hash format: ${format}`);
			return /* @__PURE__ */ _stringFormat(ZodCustomStringFormat, format, regex, params);
		}
		const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
			$ZodNumber.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
			_installLazyMethods(inst, "ZodNumber", {
				gt(value, params) {
					return this.check(/* @__PURE__ */ _gt(value, params));
				},
				gte(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				min(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				lt(value, params) {
					return this.check(/* @__PURE__ */ _lt(value, params));
				},
				lte(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				max(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				int(params) {
					return this.check(int(params));
				},
				safe(params) {
					return this.check(int(params));
				},
				positive(params) {
					return this.check(/* @__PURE__ */ _gt(0, params));
				},
				nonnegative(params) {
					return this.check(/* @__PURE__ */ _gte(0, params));
				},
				negative(params) {
					return this.check(/* @__PURE__ */ _lt(0, params));
				},
				nonpositive(params) {
					return this.check(/* @__PURE__ */ _lte(0, params));
				},
				multipleOf(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				step(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				finite() {
					return this;
				}
			});
			const bag = inst._zod.bag;
			inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
			inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
			inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
			inst.isFinite = true;
			inst.format = bag.format ?? null;
		});
		function number$1(params) {
			return /* @__PURE__ */ _number(ZodNumber, params);
		}
		const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
			$ZodNumberFormat.init(inst, def);
			ZodNumber.init(inst, def);
		});
		function int(params) {
			return /* @__PURE__ */ _int(ZodNumberFormat, params);
		}
		function float32(params) {
			return /* @__PURE__ */ _float32(ZodNumberFormat, params);
		}
		function float64(params) {
			return /* @__PURE__ */ _float64(ZodNumberFormat, params);
		}
		function int32(params) {
			return /* @__PURE__ */ _int32(ZodNumberFormat, params);
		}
		function uint32(params) {
			return /* @__PURE__ */ _uint32(ZodNumberFormat, params);
		}
		const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
			$ZodBoolean.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
		});
		function boolean$1(params) {
			return /* @__PURE__ */ _boolean(ZodBoolean, params);
		}
		const ZodBigInt = /*@__PURE__*/ $constructor("ZodBigInt", (inst, def) => {
			$ZodBigInt.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => bigintProcessor(inst, ctx, json, params);
			inst.gte = (value, params) => inst.check(/* @__PURE__ */ _gte(value, params));
			inst.min = (value, params) => inst.check(/* @__PURE__ */ _gte(value, params));
			inst.gt = (value, params) => inst.check(/* @__PURE__ */ _gt(value, params));
			inst.gte = (value, params) => inst.check(/* @__PURE__ */ _gte(value, params));
			inst.min = (value, params) => inst.check(/* @__PURE__ */ _gte(value, params));
			inst.lt = (value, params) => inst.check(/* @__PURE__ */ _lt(value, params));
			inst.lte = (value, params) => inst.check(/* @__PURE__ */ _lte(value, params));
			inst.max = (value, params) => inst.check(/* @__PURE__ */ _lte(value, params));
			inst.positive = (params) => inst.check(/* @__PURE__ */ _gt(BigInt(0), params));
			inst.negative = (params) => inst.check(/* @__PURE__ */ _lt(BigInt(0), params));
			inst.nonpositive = (params) => inst.check(/* @__PURE__ */ _lte(BigInt(0), params));
			inst.nonnegative = (params) => inst.check(/* @__PURE__ */ _gte(BigInt(0), params));
			inst.multipleOf = (value, params) => inst.check(/* @__PURE__ */ _multipleOf(value, params));
			const bag = inst._zod.bag;
			inst.minValue = bag.minimum ?? null;
			inst.maxValue = bag.maximum ?? null;
			inst.format = bag.format ?? null;
		});
		function bigint$1(params) {
			return /* @__PURE__ */ _bigint(ZodBigInt, params);
		}
		const ZodBigIntFormat = /*@__PURE__*/ $constructor("ZodBigIntFormat", (inst, def) => {
			$ZodBigIntFormat.init(inst, def);
			ZodBigInt.init(inst, def);
		});
		function int64(params) {
			return /* @__PURE__ */ _int64(ZodBigIntFormat, params);
		}
		function uint64(params) {
			return /* @__PURE__ */ _uint64(ZodBigIntFormat, params);
		}
		const ZodSymbol = /*@__PURE__*/ $constructor("ZodSymbol", (inst, def) => {
			$ZodSymbol.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => symbolProcessor(inst, ctx, json, params);
		});
		function symbol(params) {
			return /* @__PURE__ */ _symbol(ZodSymbol, params);
		}
		const ZodUndefined = /*@__PURE__*/ $constructor("ZodUndefined", (inst, def) => {
			$ZodUndefined.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => undefinedProcessor(inst, ctx, json, params);
		});
		function _undefined(params) {
			return /* @__PURE__ */ _undefined$1(ZodUndefined, params);
		}
		const ZodNull = /*@__PURE__*/ $constructor("ZodNull", (inst, def) => {
			$ZodNull.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullProcessor(inst, ctx, json, params);
		});
		function _null(params) {
			return /* @__PURE__ */ _null$1(ZodNull, params);
		}
		const ZodAny = /*@__PURE__*/ $constructor("ZodAny", (inst, def) => {
			$ZodAny.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function any() {
			return /* @__PURE__ */ _any(ZodAny);
		}
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
		const ZodVoid = /*@__PURE__*/ $constructor("ZodVoid", (inst, def) => {
			$ZodVoid.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => voidProcessor(inst, ctx, json, params);
		});
		function _void(params) {
			return /* @__PURE__ */ _void$1(ZodVoid, params);
		}
		const ZodDate = /*@__PURE__*/ $constructor("ZodDate", (inst, def) => {
			$ZodDate.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => dateProcessor(inst, ctx, json, params);
			inst.min = (value, params) => inst.check(/* @__PURE__ */ _gte(value, params));
			inst.max = (value, params) => inst.check(/* @__PURE__ */ _lte(value, params));
			const c = inst._zod.bag;
			inst.minDate = c.minimum ? new Date(c.minimum) : null;
			inst.maxDate = c.maximum ? new Date(c.maximum) : null;
		});
		function date$1(params) {
			return /* @__PURE__ */ _date(ZodDate, params);
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
		function keyof(schema) {
			const shape = schema._zod.def.shape;
			return _enum(Object.keys(shape));
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
		function strictObject(shape, params) {
			return new ZodObject({
				type: "object",
				shape,
				catchall: never(),
				...normalizeParams(params)
			});
		}
		function looseObject(shape, params) {
			return new ZodObject({
				type: "object",
				shape,
				catchall: unknown(),
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
		const ZodXor = /*@__PURE__*/ $constructor("ZodXor", (inst, def) => {
			ZodUnion.init(inst, def);
			$ZodXor.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		/** Creates an exclusive union (XOR) where exactly one option must match.
		* Unlike regular unions that succeed when any option matches, xor fails if
		* zero or more than one option matches the input. */
		function xor(options, params) {
			return new ZodXor({
				type: "union",
				options,
				inclusive: false,
				...normalizeParams(params)
			});
		}
		const ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("ZodDiscriminatedUnion", (inst, def) => {
			ZodUnion.init(inst, def);
			$ZodDiscriminatedUnion.init(inst, def);
		});
		function discriminatedUnion(discriminator, options, params) {
			return new ZodDiscriminatedUnion({
				type: "union",
				options,
				discriminator,
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
		const ZodTuple = /*@__PURE__*/ $constructor("ZodTuple", (inst, def) => {
			$ZodTuple.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => tupleProcessor(inst, ctx, json, params);
			inst.rest = (rest) => inst.clone({
				...inst._zod.def,
				rest
			});
		});
		function tuple(items, _paramsOrRest, _params) {
			const hasRest = _paramsOrRest instanceof $ZodType;
			return new ZodTuple({
				type: "tuple",
				items,
				rest: hasRest ? _paramsOrRest : null,
				...normalizeParams(hasRest ? _params : _paramsOrRest)
			});
		}
		const ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
			$ZodRecord.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
			inst.keyType = def.keyType;
			inst.valueType = def.valueType;
		});
		function record(keyType, valueType, params) {
			if (!valueType || !valueType._zod) return new ZodRecord({
				type: "record",
				keyType: string$1(),
				valueType: keyType,
				...normalizeParams(valueType)
			});
			return new ZodRecord({
				type: "record",
				keyType,
				valueType,
				...normalizeParams(params)
			});
		}
		function partialRecord(keyType, valueType, params) {
			const k = clone(keyType);
			k._zod.values = void 0;
			return new ZodRecord({
				type: "record",
				keyType: k,
				valueType,
				...normalizeParams(params)
			});
		}
		function looseRecord(keyType, valueType, params) {
			return new ZodRecord({
				type: "record",
				keyType,
				valueType,
				mode: "loose",
				...normalizeParams(params)
			});
		}
		const ZodMap = /*@__PURE__*/ $constructor("ZodMap", (inst, def) => {
			$ZodMap.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => mapProcessor(inst, ctx, json, params);
			inst.keyType = def.keyType;
			inst.valueType = def.valueType;
			inst.min = (...args) => inst.check(/* @__PURE__ */ _minSize(...args));
			inst.nonempty = (params) => inst.check(/* @__PURE__ */ _minSize(1, params));
			inst.max = (...args) => inst.check(/* @__PURE__ */ _maxSize(...args));
			inst.size = (...args) => inst.check(/* @__PURE__ */ _size(...args));
		});
		function map(keyType, valueType, params) {
			return new ZodMap({
				type: "map",
				keyType,
				valueType,
				...normalizeParams(params)
			});
		}
		const ZodSet = /*@__PURE__*/ $constructor("ZodSet", (inst, def) => {
			$ZodSet.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => setProcessor(inst, ctx, json, params);
			inst.min = (...args) => inst.check(/* @__PURE__ */ _minSize(...args));
			inst.nonempty = (params) => inst.check(/* @__PURE__ */ _minSize(1, params));
			inst.max = (...args) => inst.check(/* @__PURE__ */ _maxSize(...args));
			inst.size = (...args) => inst.check(/* @__PURE__ */ _size(...args));
		});
		function set(valueType, params) {
			return new ZodSet({
				type: "set",
				valueType,
				...normalizeParams(params)
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
		/** @deprecated This API has been merged into `z.enum()`. Use `z.enum()` instead.
		*
		* ```ts
		* enum Colors { red, green, blue }
		* z.enum(Colors);
		* ```
		*/
		function nativeEnum(entries, params) {
			return new ZodEnum({
				type: "enum",
				entries,
				...normalizeParams(params)
			});
		}
		const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
			$ZodLiteral.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
			inst.values = new Set(def.values);
			Object.defineProperty(inst, "value", { get() {
				if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
				return def.values[0];
			} });
		});
		function literal(value, params) {
			return new ZodLiteral({
				type: "literal",
				values: Array.isArray(value) ? value : [value],
				...normalizeParams(params)
			});
		}
		const ZodFile = /*@__PURE__*/ $constructor("ZodFile", (inst, def) => {
			$ZodFile.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => fileProcessor(inst, ctx, json, params);
			inst.min = (size, params) => inst.check(/* @__PURE__ */ _minSize(size, params));
			inst.max = (size, params) => inst.check(/* @__PURE__ */ _maxSize(size, params));
			inst.mime = (types, params) => inst.check(/* @__PURE__ */ _mime(Array.isArray(types) ? types : [types], params));
		});
		function file(params) {
			return /* @__PURE__ */ _file(ZodFile, params);
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
		function optional$1(innerType) {
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
		function nullish(innerType) {
			return optional$1(nullable(innerType));
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
		const ZodSuccess = /*@__PURE__*/ $constructor("ZodSuccess", (inst, def) => {
			$ZodSuccess.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => successProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function success(innerType) {
			return new ZodSuccess({
				type: "success",
				innerType
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
		const ZodNaN = /*@__PURE__*/ $constructor("ZodNaN", (inst, def) => {
			$ZodNaN.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nanProcessor(inst, ctx, json, params);
		});
		function nan(params) {
			return /* @__PURE__ */ _nan(ZodNaN, params);
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
		const ZodCodec = /*@__PURE__*/ $constructor("ZodCodec", (inst, def) => {
			ZodPipe.init(inst, def);
			$ZodCodec.init(inst, def);
		});
		function codec(in_, out, params) {
			return new ZodCodec({
				type: "pipe",
				in: in_,
				out,
				transform: params.decode,
				reverseTransform: params.encode
			});
		}
		function invertCodec(codec) {
			const def = codec._zod.def;
			return new ZodCodec({
				type: "pipe",
				in: def.out,
				out: def.in,
				transform: def.reverseTransform,
				reverseTransform: def.transform
			});
		}
		const ZodPreprocess = /*@__PURE__*/ $constructor("ZodPreprocess", (inst, def) => {
			ZodPipe.init(inst, def);
			$ZodPreprocess.init(inst, def);
		});
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
		const ZodTemplateLiteral = /*@__PURE__*/ $constructor("ZodTemplateLiteral", (inst, def) => {
			$ZodTemplateLiteral.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => templateLiteralProcessor(inst, ctx, json, params);
		});
		function templateLiteral(parts, params) {
			return new ZodTemplateLiteral({
				type: "template_literal",
				parts,
				...normalizeParams(params)
			});
		}
		const ZodLazy = /*@__PURE__*/ $constructor("ZodLazy", (inst, def) => {
			$ZodLazy.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => lazyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.getter();
		});
		function lazy(getter) {
			return new ZodLazy({
				type: "lazy",
				getter
			});
		}
		const ZodPromise = /*@__PURE__*/ $constructor("ZodPromise", (inst, def) => {
			$ZodPromise.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => promiseProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function promise(innerType) {
			return new ZodPromise({
				type: "promise",
				innerType
			});
		}
		const ZodFunction = /*@__PURE__*/ $constructor("ZodFunction", (inst, def) => {
			$ZodFunction.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => functionProcessor(inst, ctx, json, params);
		});
		function _function(params) {
			return new ZodFunction({
				type: "function",
				input: Array.isArray(params?.input) ? tuple(params?.input) : params?.input ?? array(unknown()),
				output: params?.output ?? unknown()
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function check(fn) {
			const ch = new $ZodCheck({ check: "custom" });
			ch._zod.check = fn;
			return ch;
		}
		function custom(fn, _params) {
			return /* @__PURE__ */ _custom(ZodCustom, fn ?? (() => true), _params);
		}
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		const describe = describe$1;
		const meta = meta$1;
		function _instanceof(cls, params = {}) {
			const inst = new ZodCustom({
				type: "custom",
				check: "custom",
				fn: (data) => data instanceof cls,
				abort: true,
				...normalizeParams(params)
			});
			inst._zod.bag.Class = cls;
			inst._zod.check = (payload) => {
				if (!(payload.value instanceof cls)) payload.issues.push({
					code: "invalid_type",
					expected: cls.name,
					input: payload.value,
					inst,
					path: [...inst._zod.def.path ?? []]
				});
			};
			return inst;
		}
		const stringbool = (...args) => /* @__PURE__ */ _stringbool({
			Codec: ZodCodec,
			Boolean: ZodBoolean,
			String: ZodString
		}, ...args);
		function json(params) {
			const jsonSchema = lazy(() => {
				return union([
					string$1(params),
					number$1(),
					boolean$1(),
					_null(),
					array(jsonSchema),
					record(string$1(), jsonSchema)
				]);
			});
			return jsonSchema;
		}
		function preprocess(fn, schema) {
			return new ZodPreprocess({
				type: "pipe",
				in: transform(fn),
				out: schema
			});
		}
		/** @deprecated Use the raw string literal codes instead, e.g. "invalid_type". */
		const ZodIssueCode = {
			invalid_type: "invalid_type",
			too_big: "too_big",
			too_small: "too_small",
			invalid_format: "invalid_format",
			not_multiple_of: "not_multiple_of",
			unrecognized_keys: "unrecognized_keys",
			invalid_union: "invalid_union",
			invalid_key: "invalid_key",
			invalid_element: "invalid_element",
			invalid_value: "invalid_value",
			custom: "custom"
		};
		/** @deprecated Use `z.config(params)` instead. */
		function setErrorMap(map) {
			config({ customError: map });
		}
		/** @deprecated Use `z.config()` instead. */
		function getErrorMap() {
			return config().customError;
		}
		/** @deprecated Do not use. Stub definition, only included for zod-to-json-schema compatibility. */
		var ZodFirstPartyTypeKind;
		ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {});
		const z = {
			...schemas_exports,
			...checks_exports,
			iso: iso_exports
		};
		const RECOGNIZED_KEYS = /*@__PURE__*/ new Set([
			"$schema",
			"$ref",
			"$defs",
			"definitions",
			"$id",
			"id",
			"$comment",
			"$anchor",
			"$vocabulary",
			"$dynamicRef",
			"$dynamicAnchor",
			"type",
			"enum",
			"const",
			"anyOf",
			"oneOf",
			"allOf",
			"not",
			"properties",
			"required",
			"additionalProperties",
			"patternProperties",
			"propertyNames",
			"minProperties",
			"maxProperties",
			"items",
			"prefixItems",
			"additionalItems",
			"minItems",
			"maxItems",
			"uniqueItems",
			"contains",
			"minContains",
			"maxContains",
			"minLength",
			"maxLength",
			"pattern",
			"format",
			"minimum",
			"maximum",
			"exclusiveMinimum",
			"exclusiveMaximum",
			"multipleOf",
			"description",
			"default",
			"contentEncoding",
			"contentMediaType",
			"contentSchema",
			"unevaluatedItems",
			"unevaluatedProperties",
			"if",
			"then",
			"else",
			"dependentSchemas",
			"dependentRequired",
			"nullable",
			"readOnly"
		]);
		function detectVersion(schema, defaultTarget) {
			const $schema = schema.$schema;
			if ($schema === "https://json-schema.org/draft/2020-12/schema") return "draft-2020-12";
			if ($schema === "http://json-schema.org/draft-07/schema#") return "draft-7";
			if ($schema === "http://json-schema.org/draft-04/schema#") return "draft-4";
			return defaultTarget ?? "draft-2020-12";
		}
		function resolveRef(ref, ctx) {
			if (!ref.startsWith("#")) throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
			const path = ref.slice(1).split("/").filter(Boolean);
			if (path.length === 0) return ctx.rootSchema;
			const defsKey = ctx.version === "draft-2020-12" ? "$defs" : "definitions";
			if (path[0] === defsKey) {
				const key = path[1];
				if (!key || !ctx.defs[key]) throw new Error(`Reference not found: ${ref}`);
				return ctx.defs[key];
			}
			throw new Error(`Reference not found: ${ref}`);
		}
		function convertBaseSchema(schema, ctx) {
			if (schema.not !== void 0) {
				if (typeof schema.not === "object" && Object.keys(schema.not).length === 0) return z.never();
				throw new Error("not is not supported in Zod (except { not: {} } for never)");
			}
			if (schema.unevaluatedItems !== void 0) throw new Error("unevaluatedItems is not supported");
			if (schema.unevaluatedProperties !== void 0) throw new Error("unevaluatedProperties is not supported");
			if (schema.if !== void 0 || schema.then !== void 0 || schema.else !== void 0) throw new Error("Conditional schemas (if/then/else) are not supported");
			if (schema.dependentSchemas !== void 0 || schema.dependentRequired !== void 0) throw new Error("dependentSchemas and dependentRequired are not supported");
			if (schema.$ref) {
				const refPath = schema.$ref;
				if (ctx.refs.has(refPath)) return ctx.refs.get(refPath);
				if (ctx.processing.has(refPath)) return z.lazy(() => {
					if (!ctx.refs.has(refPath)) throw new Error(`Circular reference not resolved: ${refPath}`);
					return ctx.refs.get(refPath);
				});
				ctx.processing.add(refPath);
				const zodSchema = convertSchema(resolveRef(refPath, ctx), ctx);
				ctx.refs.set(refPath, zodSchema);
				ctx.processing.delete(refPath);
				return zodSchema;
			}
			if (schema.enum !== void 0) {
				const enumValues = schema.enum;
				if (ctx.version === "openapi-3.0" && schema.nullable === true && enumValues.length === 1 && enumValues[0] === null) return z.null();
				if (enumValues.length === 0) return z.never();
				if (enumValues.length === 1) return z.literal(enumValues[0]);
				if (enumValues.every((v) => typeof v === "string")) return z.enum(enumValues);
				const literalSchemas = enumValues.map((v) => z.literal(v));
				if (literalSchemas.length < 2) return literalSchemas[0];
				return z.union([
					literalSchemas[0],
					literalSchemas[1],
					...literalSchemas.slice(2)
				]);
			}
			if (schema.const !== void 0) return z.literal(schema.const);
			const type = schema.type;
			if (Array.isArray(type)) {
				const typeSchemas = type.map((t) => {
					return convertBaseSchema({
						...schema,
						type: t
					}, ctx);
				});
				if (typeSchemas.length === 0) return z.never();
				if (typeSchemas.length === 1) return typeSchemas[0];
				return z.union(typeSchemas);
			}
			if (!type) return z.any();
			let zodSchema;
			switch (type) {
				case "string": {
					let stringSchema = z.string();
					if (schema.format) {
						const format = schema.format;
						if (format === "email") stringSchema = stringSchema.check(z.email());
						else if (format === "uri" || format === "uri-reference") stringSchema = stringSchema.check(z.url());
						else if (format === "uuid" || format === "guid") stringSchema = stringSchema.check(z.uuid());
						else if (format === "date-time") stringSchema = stringSchema.check(z.iso.datetime());
						else if (format === "date") stringSchema = stringSchema.check(z.iso.date());
						else if (format === "time") stringSchema = stringSchema.check(z.iso.time());
						else if (format === "duration") stringSchema = stringSchema.check(z.iso.duration());
						else if (format === "ipv4") stringSchema = stringSchema.check(z.ipv4());
						else if (format === "ipv6") stringSchema = stringSchema.check(z.ipv6());
						else if (format === "mac") stringSchema = stringSchema.check(z.mac());
						else if (format === "cidr") stringSchema = stringSchema.check(z.cidrv4());
						else if (format === "cidr-v6") stringSchema = stringSchema.check(z.cidrv6());
						else if (format === "base64") stringSchema = stringSchema.check(z.base64());
						else if (format === "base64url") stringSchema = stringSchema.check(z.base64url());
						else if (format === "e164") stringSchema = stringSchema.check(z.e164());
						else if (format === "jwt") stringSchema = stringSchema.check(z.jwt());
						else if (format === "emoji") stringSchema = stringSchema.check(z.emoji());
						else if (format === "nanoid") stringSchema = stringSchema.check(z.nanoid());
						else if (format === "cuid") stringSchema = stringSchema.check(z.cuid());
						else if (format === "cuid2") stringSchema = stringSchema.check(z.cuid2());
						else if (format === "ulid") stringSchema = stringSchema.check(z.ulid());
						else if (format === "xid") stringSchema = stringSchema.check(z.xid());
						else if (format === "ksuid") stringSchema = stringSchema.check(z.ksuid());
					}
					if (typeof schema.minLength === "number") stringSchema = stringSchema.min(schema.minLength);
					if (typeof schema.maxLength === "number") stringSchema = stringSchema.max(schema.maxLength);
					if (schema.pattern) stringSchema = stringSchema.regex(new RegExp(schema.pattern));
					zodSchema = stringSchema;
					break;
				}
				case "number":
				case "integer": {
					let numberSchema = type === "integer" ? z.number().int() : z.number();
					if (typeof schema.minimum === "number") numberSchema = numberSchema.min(schema.minimum);
					if (typeof schema.maximum === "number") numberSchema = numberSchema.max(schema.maximum);
					if (typeof schema.exclusiveMinimum === "number") numberSchema = numberSchema.gt(schema.exclusiveMinimum);
					else if (schema.exclusiveMinimum === true && typeof schema.minimum === "number") numberSchema = numberSchema.gt(schema.minimum);
					if (typeof schema.exclusiveMaximum === "number") numberSchema = numberSchema.lt(schema.exclusiveMaximum);
					else if (schema.exclusiveMaximum === true && typeof schema.maximum === "number") numberSchema = numberSchema.lt(schema.maximum);
					if (typeof schema.multipleOf === "number") numberSchema = numberSchema.multipleOf(schema.multipleOf);
					zodSchema = numberSchema;
					break;
				}
				case "boolean":
					zodSchema = z.boolean();
					break;
				case "null":
					zodSchema = z.null();
					break;
				case "object": {
					const shape = {};
					const properties = schema.properties || {};
					const requiredSet = new Set(schema.required || []);
					for (const [key, propSchema] of Object.entries(properties)) {
						const propZodSchema = convertSchema(propSchema, ctx);
						shape[key] = requiredSet.has(key) ? propZodSchema : propZodSchema.optional();
					}
					if (schema.propertyNames) {
						const keySchema = convertSchema(schema.propertyNames, ctx);
						const valueSchema = schema.additionalProperties && typeof schema.additionalProperties === "object" ? convertSchema(schema.additionalProperties, ctx) : z.any();
						if (Object.keys(shape).length === 0) {
							zodSchema = z.record(keySchema, valueSchema);
							break;
						}
						const objectSchema = z.object(shape).passthrough();
						const recordSchema = z.looseRecord(keySchema, valueSchema);
						zodSchema = z.intersection(objectSchema, recordSchema);
						break;
					}
					if (schema.patternProperties) {
						const patternProps = schema.patternProperties;
						const patternKeys = Object.keys(patternProps);
						const looseRecords = [];
						for (const pattern of patternKeys) {
							const patternValue = convertSchema(patternProps[pattern], ctx);
							const keySchema = z.string().regex(new RegExp(pattern));
							looseRecords.push(z.looseRecord(keySchema, patternValue));
						}
						const schemasToIntersect = [];
						if (Object.keys(shape).length > 0) schemasToIntersect.push(z.object(shape).passthrough());
						schemasToIntersect.push(...looseRecords);
						if (schemasToIntersect.length === 0) zodSchema = z.object({}).passthrough();
						else if (schemasToIntersect.length === 1) zodSchema = schemasToIntersect[0];
						else {
							let result = z.intersection(schemasToIntersect[0], schemasToIntersect[1]);
							for (let i = 2; i < schemasToIntersect.length; i++) result = z.intersection(result, schemasToIntersect[i]);
							zodSchema = result;
						}
						break;
					}
					const objectSchema = z.object(shape);
					if (schema.additionalProperties === false) zodSchema = objectSchema.strict();
					else if (typeof schema.additionalProperties === "object") zodSchema = objectSchema.catchall(convertSchema(schema.additionalProperties, ctx));
					else zodSchema = objectSchema.passthrough();
					break;
				}
				case "array": {
					const prefixItems = schema.prefixItems;
					const items = schema.items;
					if (prefixItems && Array.isArray(prefixItems)) {
						const tupleItems = prefixItems.map((item) => convertSchema(item, ctx));
						const rest = items && typeof items === "object" && !Array.isArray(items) ? convertSchema(items, ctx) : void 0;
						if (rest) zodSchema = z.tuple(tupleItems).rest(rest);
						else zodSchema = z.tuple(tupleItems);
						if (typeof schema.minItems === "number") zodSchema = zodSchema.check(z.minLength(schema.minItems));
						if (typeof schema.maxItems === "number") zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
					} else if (Array.isArray(items)) {
						const tupleItems = items.map((item) => convertSchema(item, ctx));
						const rest = schema.additionalItems && typeof schema.additionalItems === "object" ? convertSchema(schema.additionalItems, ctx) : void 0;
						if (rest) zodSchema = z.tuple(tupleItems).rest(rest);
						else zodSchema = z.tuple(tupleItems);
						if (typeof schema.minItems === "number") zodSchema = zodSchema.check(z.minLength(schema.minItems));
						if (typeof schema.maxItems === "number") zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
					} else if (items !== void 0) {
						const element = convertSchema(items, ctx);
						let arraySchema = z.array(element);
						if (typeof schema.minItems === "number") arraySchema = arraySchema.min(schema.minItems);
						if (typeof schema.maxItems === "number") arraySchema = arraySchema.max(schema.maxItems);
						zodSchema = arraySchema;
					} else zodSchema = z.array(z.any());
					break;
				}
				default: throw new Error(`Unsupported type: ${type}`);
			}
			return zodSchema;
		}
		function convertSchema(schema, ctx) {
			if (typeof schema === "boolean") return schema ? z.any() : z.never();
			let baseSchema = convertBaseSchema(schema, ctx);
			const hasExplicitType = schema.type || schema.enum !== void 0 || schema.const !== void 0;
			if (schema.anyOf && Array.isArray(schema.anyOf)) {
				const options = schema.anyOf.map((s) => convertSchema(s, ctx));
				const anyOfUnion = z.union(options);
				baseSchema = hasExplicitType ? z.intersection(baseSchema, anyOfUnion) : anyOfUnion;
			}
			if (schema.oneOf && Array.isArray(schema.oneOf)) {
				const options = schema.oneOf.map((s) => convertSchema(s, ctx));
				const oneOfUnion = z.xor(options);
				baseSchema = hasExplicitType ? z.intersection(baseSchema, oneOfUnion) : oneOfUnion;
			}
			if (schema.allOf && Array.isArray(schema.allOf)) if (schema.allOf.length === 0) baseSchema = hasExplicitType ? baseSchema : z.any();
			else {
				let result = hasExplicitType ? baseSchema : convertSchema(schema.allOf[0], ctx);
				const startIdx = hasExplicitType ? 0 : 1;
				for (let i = startIdx; i < schema.allOf.length; i++) result = z.intersection(result, convertSchema(schema.allOf[i], ctx));
				baseSchema = result;
			}
			if (schema.nullable === true && ctx.version === "openapi-3.0") baseSchema = z.nullable(baseSchema);
			if (schema.readOnly === true) baseSchema = z.readonly(baseSchema);
			if (schema.default !== void 0) baseSchema = baseSchema.default(schema.default);
			const extraMeta = {};
			for (const key of [
				"$id",
				"id",
				"$comment",
				"$anchor",
				"$vocabulary",
				"$dynamicRef",
				"$dynamicAnchor"
			]) if (key in schema) extraMeta[key] = schema[key];
			for (const key of [
				"contentEncoding",
				"contentMediaType",
				"contentSchema"
			]) if (key in schema) extraMeta[key] = schema[key];
			for (const key of Object.keys(schema)) if (!RECOGNIZED_KEYS.has(key)) extraMeta[key] = schema[key];
			if (Object.keys(extraMeta).length > 0) ctx.registry.add(baseSchema, extraMeta);
			if (schema.description) baseSchema = baseSchema.describe(schema.description);
			return baseSchema;
		}
		/**
		* Converts a JSON Schema to a Zod schema. This function should be considered semi-experimental. It's behavior is liable to change. */
		function fromJSONSchema(schema, params) {
			if (typeof schema === "boolean") return schema ? z.any() : z.never();
			let normalized;
			try {
				normalized = JSON.parse(JSON.stringify(schema));
			} catch {
				throw new Error("fromJSONSchema input is not valid JSON (possibly cyclic); use $defs/$ref for recursive schemas");
			}
			const ctx = {
				version: detectVersion(normalized, params?.defaultTarget),
				defs: normalized.$defs || normalized.definitions || {},
				refs: /* @__PURE__ */ new Map(),
				processing: /* @__PURE__ */ new Set(),
				rootSchema: normalized,
				registry: params?.registry ?? globalRegistry
			};
			return convertSchema(normalized, ctx);
		}
		var coerce_exports = /* @__PURE__ */ __exportAll({
			bigint: () => bigint,
			boolean: () => boolean,
			date: () => date,
			number: () => number,
			string: () => string
		});
		function string(params) {
			return /* @__PURE__ */ _coercedString(ZodString, params);
		}
		function number(params) {
			return /* @__PURE__ */ _coercedNumber(ZodNumber, params);
		}
		function boolean(params) {
			return /* @__PURE__ */ _coercedBoolean(ZodBoolean, params);
		}
		function bigint(params) {
			return /* @__PURE__ */ _coercedBigint(ZodBigInt, params);
		}
		function date(params) {
			return /* @__PURE__ */ _coercedDate(ZodDate, params);
		}
		var external_exports = /* @__PURE__ */ __exportAll({
			$brand: () => $brand,
			$input: () => $input,
			$output: () => $output,
			NEVER: () => NEVER,
			TimePrecision: () => TimePrecision,
			ZodAny: () => ZodAny,
			ZodArray: () => ZodArray,
			ZodBase64: () => ZodBase64,
			ZodBase64URL: () => ZodBase64URL,
			ZodBigInt: () => ZodBigInt,
			ZodBigIntFormat: () => ZodBigIntFormat,
			ZodBoolean: () => ZodBoolean,
			ZodCIDRv4: () => ZodCIDRv4,
			ZodCIDRv6: () => ZodCIDRv6,
			ZodCUID: () => ZodCUID,
			ZodCUID2: () => ZodCUID2,
			ZodCatch: () => ZodCatch,
			ZodCodec: () => ZodCodec,
			ZodCustom: () => ZodCustom,
			ZodCustomStringFormat: () => ZodCustomStringFormat,
			ZodDate: () => ZodDate,
			ZodDefault: () => ZodDefault,
			ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
			ZodE164: () => ZodE164,
			ZodEmail: () => ZodEmail,
			ZodEmoji: () => ZodEmoji,
			ZodEnum: () => ZodEnum,
			ZodError: () => ZodError,
			ZodExactOptional: () => ZodExactOptional,
			ZodFile: () => ZodFile,
			ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
			ZodFunction: () => ZodFunction,
			ZodGUID: () => ZodGUID,
			ZodIPv4: () => ZodIPv4,
			ZodIPv6: () => ZodIPv6,
			ZodISODate: () => ZodISODate,
			ZodISODateTime: () => ZodISODateTime,
			ZodISODuration: () => ZodISODuration,
			ZodISOTime: () => ZodISOTime,
			ZodIntersection: () => ZodIntersection,
			ZodIssueCode: () => ZodIssueCode,
			ZodJWT: () => ZodJWT,
			ZodKSUID: () => ZodKSUID,
			ZodLazy: () => ZodLazy,
			ZodLiteral: () => ZodLiteral,
			ZodMAC: () => ZodMAC,
			ZodMap: () => ZodMap,
			ZodNaN: () => ZodNaN,
			ZodNanoID: () => ZodNanoID,
			ZodNever: () => ZodNever,
			ZodNonOptional: () => ZodNonOptional,
			ZodNull: () => ZodNull,
			ZodNullable: () => ZodNullable,
			ZodNumber: () => ZodNumber,
			ZodNumberFormat: () => ZodNumberFormat,
			ZodObject: () => ZodObject,
			ZodOptional: () => ZodOptional,
			ZodPipe: () => ZodPipe,
			ZodPrefault: () => ZodPrefault,
			ZodPreprocess: () => ZodPreprocess,
			ZodPromise: () => ZodPromise,
			ZodReadonly: () => ZodReadonly,
			ZodRealError: () => ZodRealError,
			ZodRecord: () => ZodRecord,
			ZodSet: () => ZodSet,
			ZodString: () => ZodString,
			ZodStringFormat: () => ZodStringFormat,
			ZodSuccess: () => ZodSuccess,
			ZodSymbol: () => ZodSymbol,
			ZodTemplateLiteral: () => ZodTemplateLiteral,
			ZodTransform: () => ZodTransform,
			ZodTuple: () => ZodTuple,
			ZodType: () => ZodType,
			ZodULID: () => ZodULID,
			ZodURL: () => ZodURL,
			ZodUUID: () => ZodUUID,
			ZodUndefined: () => ZodUndefined,
			ZodUnion: () => ZodUnion,
			ZodUnknown: () => ZodUnknown,
			ZodVoid: () => ZodVoid,
			ZodXID: () => ZodXID,
			ZodXor: () => ZodXor,
			_ZodString: () => _ZodString,
			_default: () => _default,
			_function: () => _function,
			any: () => any,
			array: () => array,
			base64: () => base64,
			base64url: () => base64url,
			bigint: () => bigint$1,
			boolean: () => boolean$1,
			catch: () => _catch,
			check: () => check,
			cidrv4: () => cidrv4,
			cidrv6: () => cidrv6,
			clone: () => clone,
			codec: () => codec,
			coerce: () => coerce_exports,
			config: () => config,
			core: () => core_exports,
			cuid: () => cuid,
			cuid2: () => cuid2,
			custom: () => custom,
			date: () => date$1,
			decode: () => decode,
			decodeAsync: () => decodeAsync,
			describe: () => describe,
			discriminatedUnion: () => discriminatedUnion,
			e164: () => e164,
			email: () => email,
			emoji: () => emoji,
			encode: () => encode,
			encodeAsync: () => encodeAsync,
			endsWith: () => _endsWith,
			enum: () => _enum,
			exactOptional: () => exactOptional,
			file: () => file,
			flattenError: () => flattenError,
			float32: () => float32,
			float64: () => float64,
			formatError: () => formatError,
			fromJSONSchema: () => fromJSONSchema,
			function: () => _function,
			getErrorMap: () => getErrorMap,
			globalRegistry: () => globalRegistry,
			gt: () => _gt,
			gte: () => _gte,
			guid: () => guid,
			hash: () => hash,
			hex: () => hex,
			hostname: () => hostname,
			httpUrl: () => httpUrl,
			includes: () => _includes,
			instanceof: () => _instanceof,
			int: () => int,
			int32: () => int32,
			int64: () => int64,
			intersection: () => intersection,
			invertCodec: () => invertCodec,
			ipv4: () => ipv4,
			ipv6: () => ipv6,
			iso: () => iso_exports,
			json: () => json,
			jwt: () => jwt,
			keyof: () => keyof,
			ksuid: () => ksuid,
			lazy: () => lazy,
			length: () => _length,
			literal: () => literal,
			locales: () => locales_exports,
			looseObject: () => looseObject,
			looseRecord: () => looseRecord,
			lowercase: () => _lowercase,
			lt: () => _lt,
			lte: () => _lte,
			mac: () => mac,
			map: () => map,
			maxLength: () => _maxLength,
			maxSize: () => _maxSize,
			meta: () => meta,
			mime: () => _mime,
			minLength: () => _minLength,
			minSize: () => _minSize,
			multipleOf: () => _multipleOf,
			nan: () => nan,
			nanoid: () => nanoid,
			nativeEnum: () => nativeEnum,
			negative: () => _negative,
			never: () => never,
			nonnegative: () => _nonnegative,
			nonoptional: () => nonoptional,
			nonpositive: () => _nonpositive,
			normalize: () => _normalize,
			null: () => _null,
			nullable: () => nullable,
			nullish: () => nullish,
			number: () => number$1,
			object: () => object,
			optional: () => optional$1,
			overwrite: () => _overwrite,
			parse: () => parse,
			parseAsync: () => parseAsync,
			partialRecord: () => partialRecord,
			pipe: () => pipe,
			positive: () => _positive,
			prefault: () => prefault,
			preprocess: () => preprocess,
			prettifyError: () => prettifyError,
			promise: () => promise,
			property: () => _property,
			readonly: () => readonly,
			record: () => record,
			refine: () => refine,
			regex: () => _regex,
			regexes: () => regexes_exports,
			registry: () => registry,
			safeDecode: () => safeDecode,
			safeDecodeAsync: () => safeDecodeAsync,
			safeEncode: () => safeEncode,
			safeEncodeAsync: () => safeEncodeAsync,
			safeParse: () => safeParse,
			safeParseAsync: () => safeParseAsync,
			set: () => set,
			setErrorMap: () => setErrorMap,
			size: () => _size,
			slugify: () => _slugify,
			startsWith: () => _startsWith,
			strictObject: () => strictObject,
			string: () => string$1,
			stringFormat: () => stringFormat,
			stringbool: () => stringbool,
			success: () => success,
			superRefine: () => superRefine,
			symbol: () => symbol,
			templateLiteral: () => templateLiteral,
			toJSONSchema: () => toJSONSchema,
			toLowerCase: () => _toLowerCase,
			toUpperCase: () => _toUpperCase,
			transform: () => transform,
			treeifyError: () => treeifyError,
			trim: () => _trim,
			tuple: () => tuple,
			uint32: () => uint32,
			uint64: () => uint64,
			ulid: () => ulid,
			undefined: () => _undefined,
			union: () => union,
			unknown: () => unknown,
			uppercase: () => _uppercase,
			url: () => url,
			util: () => util_exports,
			uuid: () => uuid,
			uuidv4: () => uuidv4,
			uuidv6: () => uuidv6,
			uuidv7: () => uuidv7,
			void: () => _void,
			xid: () => xid,
			xor: () => xor
		});
		config(en_default());
		/**
		* Retain one generated definition per endpoint without constructing parsers or projections.
		* The class instance builds its shared descriptor/method index on first access;
		* input schemas and JSON Schema projections are cached only when requested.
		* @param spec - compiler-produced method facts and Zod factories.
		* @param zod - the generated artifact's Zod runtime for named-input parsers.
		* @returns a lazy, mountable info instance with no registration or transport effects.
		*/
		function createTypertRemoteInfo(spec, zod) {
			return new RemoteInfo(spec, zod);
		}
		var RemoteInfo = class {
			spec;
			zod;
			index;
			constructor(spec, zod) {
				this.spec = spec;
				this.zod = zod;
			}
			get package() {
				return this.spec.package;
			}
			get descriptors() {
				return this.resolve().descriptors;
			}
			get methods() {
				return this.resolve().methods;
			}
			resolve() {
				if (this.index !== void 0) return this.index;
				const zod = this.zod;
				const descriptors = [];
				const methods = Object.create(null);
				for (const [endpoint, definition] of Object.entries(this.spec.methods)) {
					const separator = endpoint.indexOf("/");
					const namespace = endpoint.slice(0, separator);
					const method = endpoint.slice(separator + 1);
					const parameters = definition.parameters.map((parameter) => ({
						...parameter,
						wire: parameter.wire ?? parameter.name
					}));
					const descriptor = {
						...definition,
						id: `${this.spec.package}#${endpoint}`,
						namespace,
						method,
						parameters,
						result: definition.result.description === void 0 ? definition.result : new ResultValue(definition.result)
					};
					if (definition.invocation.kind === "direct") {
						const inputs = [];
						methods[endpoint] = Object.assign(descriptor, {
							input(options) {
								const strict = options?.strict === true;
								return inputs[strict ? 1 : 0] ??= new NamedInput(parameters, strict, zod);
							},
							invoke(remote, input, signal) {
								const named = input;
								const values = parameters.map((parameter) => named[parameter.wire]);
								if (definition.cancellation !== void 0) values.push(signal);
								const receiver = Reflect.get(remote, namespace);
								return Reflect.get(receiver, method).apply(receiver, values);
							}
						});
					}
					descriptors.push(descriptor);
				}
				return this.index = {
					descriptors,
					methods
				};
			}
		};
		function optional(parameter) {
			return parameter.source === "json" && parameter.acceptsUndefined === true;
		}
		var NamedInput = class {
			parameters;
			strict;
			zod;
			schema;
			projection;
			constructor(parameters, strict, zod) {
				this.parameters = parameters;
				this.strict = strict;
				this.zod = zod;
			}
			codec(parameter) {
				return this.strict ? parameter.strictCodec : parameter.codec;
			}
			create = () => this.schema ??= this.zod.strictObject(Object.fromEntries(this.parameters.map((parameter) => {
				const value = this.codec(parameter).create();
				return [parameter.wire, optional(parameter) ? value.optional() : value.nonoptional()];
			})));
			get jsonSchema() {
				return this.project().jsonSchema;
			}
			get jsonSchemaError() {
				return this.project().jsonSchemaError;
			}
			project() {
				if (this.projection !== void 0) return this.projection;
				const unavailable = this.parameters.find((parameter) => this.codec(parameter).jsonSchema === void 0);
				if (unavailable !== void 0) return this.projection = { jsonSchemaError: this.codec(unavailable).jsonSchemaError ?? `No JSON Schema for parameter ${unavailable.wire}` };
				return this.projection = { jsonSchema: {
					type: "object",
					properties: Object.fromEntries(this.parameters.map((parameter) => [parameter.wire, {
						...this.codec(parameter).jsonSchema,
						...parameter.description === void 0 ? {} : { description: parameter.description }
					}])),
					required: this.parameters.filter((parameter) => !optional(parameter)).map((parameter) => parameter.wire),
					additionalProperties: false
				} };
			}
		};
		var ResultValue = class {
			spec;
			projection;
			constructor(spec) {
				this.spec = spec;
			}
			get mode() {
				return this.spec.mode;
			}
			get typeSymbol() {
				return this.spec.typeSymbol;
			}
			get create() {
				return this.spec.create;
			}
			get decode() {
				return this.spec.decode;
			}
			get encode() {
				return this.spec.encode;
			}
			get description() {
				return this.spec.description;
			}
			get jsonSchemaError() {
				return this.spec.jsonSchemaError;
			}
			get jsonSchema() {
				if (this.projection === void 0) {
					const schema = this.spec.jsonSchema;
					this.projection = { value: schema === void 0 ? void 0 : {
						...schema,
						description: this.spec.description
					} };
				}
				return this.projection.value;
			}
		};
		let dsh_agent_team_presets_teamPresets_catalog_result$schema$value;
		const dsh_agent_team_presets_teamPresets_catalog_result$schema = () => dsh_agent_team_presets_teamPresets_catalog_result$schema$value ??= object({ "tools": array(object({
			"name": string$1().describe("Capability name the strict execution policy accepts verbatim."),
			"description": string$1().describe("Model-facing description, shown as the checkbox hover text."),
			"captainOnly": boolean$1().optional().describe("Whether only the captain can exercise this capability. The Team service enforces this for `interrupt_agent` (a member call is refused with `TEAM_LEAD_REQUIRED`), and this plugin registers the preset tools on the Session root only. A member that selects such a name still cannot use it, so the page must say so instead of offering it as grantable."),
			"source": union([
				literal("other"),
				literal("presets"),
				literal("mcp")
			]).describe("Which upstream source the capability was attributed to. The tool registry records no registering package: `register()` stores a definition under its tool name with a fixed label, so \"native Harness\" and \"some third-party plugin\" are not separable. Only two attributions are deterministic — this plugin's own registrations, and MCP tools, whose `mcp__<server>__<name>` form the Harness itself generates. Everything else is reported as `other` rather than guessed at."),
			"server": string$1().optional().describe("MCP server name; present only when {@link source} is `mcp`.")
		})).describe("Union of deployment preset/global and fixed Team capability names.") });
		let dsh_agent_team_presets_teamPresets_execution_result$schema$value;
		const dsh_agent_team_presets_teamPresets_execution_result$schema = () => dsh_agent_team_presets_teamPresets_execution_result$schema$value ??= object({ "teams": array(object({
			"teamId": string$1().describe("Team identity the row describes."),
			"state": union([
				literal("unknown"),
				literal("idle"),
				literal("busy")
			]).describe("Whether the Team is executing, known idle, or undecidable."),
			"busySessions": number$1().describe("Online Sessions running a Team task on it."),
			"executingMembers": number$1().describe("Teammates running or provisioning across those Sessions."),
			"pendingSessions": number$1().describe("Sessions whose applied definition or selection the next Team task has not adopted yet. A member route or accent color saved meanwhile is read live, so it is no reason to wait."),
			"notes": array(string$1()).describe("Disclosures about how the applied Team runs, in a stable order. An empty list means no applied Session needed one. The only note today says that a Team whose custom tool policy needed a native surface overrode the Session's PTC batch-calling presentation, which the page must state instead of claiming the preset's transport is intact.")
		})).describe("One row per Team the Host reports, ordered by Team identity.") });
		let dsh_agent_team_presets_teamSkills_assignRole_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_assignRole_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_assignRole_parameter_0$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_assignRole_parameter_1$schema$value;
		const dsh_agent_team_presets_teamSkills_assignRole_parameter_1$schema = () => dsh_agent_team_presets_teamSkills_assignRole_parameter_1$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_assignRole_parameter_2$schema$value;
		const dsh_agent_team_presets_teamSkills_assignRole_parameter_2$schema = () => dsh_agent_team_presets_teamSkills_assignRole_parameter_2$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_assignRole_result$schema$value;
		const dsh_agent_team_presets_teamSkills_assignRole_result$schema = () => dsh_agent_team_presets_teamSkills_assignRole_result$schema$value ??= object({
			"ok": boolean$1(),
			"detail": string$1(),
			"unverified": array(string$1()).optional(),
			"library": object({
				"root": string$1().readonly().describe("Absolute private root, shown so the user can open it in a file manager."),
				"assets": array(object({
					"id": string$1().readonly().describe("Asset identity."),
					"skillId": string$1().readonly().describe("Kebab-case skill name."),
					"description": string$1().readonly().describe("Frontmatter description."),
					"origin": string$1().readonly().describe("Where the asset came from."),
					"version": string$1().readonly().describe("Immutable version currently served."),
					"officialSkillId": string$1().readonly().optional().describe("Shipped skill this override started from, when it is an override."),
					"updateAvailable": boolean$1().readonly().optional().describe("Whether the shipped copy has moved past this override."),
					"editable": boolean$1().readonly().describe("Whether the page may edit it."),
					"fileCount": number$1().readonly().describe("File count."),
					"totalBytes": number$1().readonly().describe("Total bytes."),
					"mcpServers": array(string$1()).readonly().describe("Declared dependencies (MCP servers, executables, other skills)."),
					"clashesWith": array(string$1()).readonly().optional().describe("Other assets that reuse the same skill name under a different origin."),
					"bindings": array(object({
						"teamId": string$1().readonly().describe("Team identity."),
						"teamName": string$1().readonly().describe("Team display name."),
						"roleId": string$1().readonly().describe("Role identity."),
						"roleName": string$1().readonly().describe("Role display name."),
						"captain": boolean$1().readonly().describe("Whether the holder is the captain.")
					})).readonly().describe("Every role holding it.")
				})).readonly().describe("Every asset, name-ordered."),
				"teams": array(object({
					"id": string$1().readonly().describe("Team identity."),
					"name": string$1().readonly().describe("Display name."),
					"roles": array(object({
						"id": string$1().readonly().describe("Role identity used in a binding."),
						"name": string$1().readonly().describe("Display name shown in the page."),
						"captain": boolean$1().readonly().describe("Whether this is the captain slot.")
					})).readonly().describe("The captain slot plus every member slot, in Team order.")
				})).readonly().describe("Every Team and its addressable roles."),
				"official": array(string$1()).readonly().describe("Shipped skill ids this deployment provides."),
				"issue": string$1().readonly().optional().describe("Why the store is unusable, when this deployment could not open it.")
			})
		});
		let dsh_agent_team_presets_teamSkills_createSkill_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_createSkill_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_createSkill_parameter_0$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_createSkill_parameter_1$schema$value;
		const dsh_agent_team_presets_teamSkills_createSkill_parameter_1$schema = () => dsh_agent_team_presets_teamSkills_createSkill_parameter_1$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_createSkill_result$schema$value;
		const dsh_agent_team_presets_teamSkills_createSkill_result$schema = () => dsh_agent_team_presets_teamSkills_createSkill_result$schema$value ??= union([object({
			"asset": object({
				"id": string$1().readonly().describe("Asset identity."),
				"skillId": string$1().readonly().describe("Kebab-case skill name."),
				"description": string$1().readonly().describe("Frontmatter description."),
				"origin": string$1().readonly().describe("Where the asset came from."),
				"version": string$1().readonly().describe("Immutable version currently served."),
				"officialSkillId": string$1().readonly().optional().describe("Shipped skill this override started from, when it is an override."),
				"updateAvailable": boolean$1().readonly().optional().describe("Whether the shipped copy has moved past this override."),
				"editable": boolean$1().readonly().describe("Whether the page may edit it."),
				"fileCount": number$1().readonly().describe("File count."),
				"totalBytes": number$1().readonly().describe("Total bytes."),
				"mcpServers": array(string$1()).readonly().describe("Declared dependencies (MCP servers, executables, other skills)."),
				"clashesWith": array(string$1()).readonly().optional().describe("Other assets that reuse the same skill name under a different origin."),
				"bindings": array(object({
					"teamId": string$1().readonly().describe("Team identity."),
					"teamName": string$1().readonly().describe("Team display name."),
					"roleId": string$1().readonly().describe("Role identity."),
					"roleName": string$1().readonly().describe("Role display name."),
					"captain": boolean$1().readonly().describe("Whether the holder is the captain.")
				})).readonly().describe("Every role holding it.")
			}).readonly().describe("The asset row."),
			"files": array(object({
				"path": string$1().readonly().describe("POSIX-relative path inside the asset."),
				"size": number$1().readonly().describe("Byte length."),
				"text": boolean$1().readonly().describe("Whether the page may show it as text.")
			})).readonly().describe("Every file, path-ordered."),
			"body": string$1().readonly().describe("The `SKILL.md` body, without frontmatter."),
			"directory": string$1().readonly().describe("Absolute directory holding this version's files, as the store named it."),
			"dependencies": object({
				"executables": array(object({
					"name": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly(),
				"mcpServers": array(string$1()).readonly(),
				"mcpDeclarations": array(object({
					"serverName": string$1(),
					"required": boolean$1(),
					"capabilities": array(union([literal("tools"), literal("resources")])).optional(),
					"toolNames": array(string$1()).optional()
				})).readonly().optional(),
				"unverified": array(string$1()).readonly().optional(),
				"otherSkills": array(object({
					"id": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly().optional()
			}).readonly().optional().describe("Declared dependencies, with the executable check that can be made here.")
		}), object({
			"ok": literal(false).readonly().describe("`ok` is always false here, so a caller can branch on it."),
			"reason": string$1().readonly().describe("Machine-readable reason."),
			"detail": string$1().readonly().describe("Human-readable detail, already specific.")
		})]);
		let dsh_agent_team_presets_teamSkills_deleteAsset_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_deleteAsset_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_deleteAsset_parameter_0$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_deleteAsset_result$schema$value;
		const dsh_agent_team_presets_teamSkills_deleteAsset_result$schema = () => dsh_agent_team_presets_teamSkills_deleteAsset_result$schema$value ??= object({
			"ok": boolean$1().readonly().describe("Whether the asset is gone."),
			"blockers": array(object({
				"kind": string$1().readonly(),
				"detail": string$1().readonly()
			})).readonly().describe("Everything that blocked it, so the page can list them all."),
			"warnings": array(string$1()).readonly().describe("Advisory text matches that did not block.")
		});
		let dsh_agent_team_presets_teamSkills_detail_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_detail_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_detail_parameter_0$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_detail_result$schema$value;
		const dsh_agent_team_presets_teamSkills_detail_result$schema = () => dsh_agent_team_presets_teamSkills_detail_result$schema$value ??= union([object({
			"asset": object({
				"id": string$1().readonly().describe("Asset identity."),
				"skillId": string$1().readonly().describe("Kebab-case skill name."),
				"description": string$1().readonly().describe("Frontmatter description."),
				"origin": string$1().readonly().describe("Where the asset came from."),
				"version": string$1().readonly().describe("Immutable version currently served."),
				"officialSkillId": string$1().readonly().optional().describe("Shipped skill this override started from, when it is an override."),
				"updateAvailable": boolean$1().readonly().optional().describe("Whether the shipped copy has moved past this override."),
				"editable": boolean$1().readonly().describe("Whether the page may edit it."),
				"fileCount": number$1().readonly().describe("File count."),
				"totalBytes": number$1().readonly().describe("Total bytes."),
				"mcpServers": array(string$1()).readonly().describe("Declared dependencies (MCP servers, executables, other skills)."),
				"clashesWith": array(string$1()).readonly().optional().describe("Other assets that reuse the same skill name under a different origin."),
				"bindings": array(object({
					"teamId": string$1().readonly().describe("Team identity."),
					"teamName": string$1().readonly().describe("Team display name."),
					"roleId": string$1().readonly().describe("Role identity."),
					"roleName": string$1().readonly().describe("Role display name."),
					"captain": boolean$1().readonly().describe("Whether the holder is the captain.")
				})).readonly().describe("Every role holding it.")
			}).readonly().describe("The asset row."),
			"files": array(object({
				"path": string$1().readonly().describe("POSIX-relative path inside the asset."),
				"size": number$1().readonly().describe("Byte length."),
				"text": boolean$1().readonly().describe("Whether the page may show it as text.")
			})).readonly().describe("Every file, path-ordered."),
			"body": string$1().readonly().describe("The `SKILL.md` body, without frontmatter."),
			"directory": string$1().readonly().describe("Absolute directory holding this version's files, as the store named it."),
			"dependencies": object({
				"executables": array(object({
					"name": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly(),
				"mcpServers": array(string$1()).readonly(),
				"mcpDeclarations": array(object({
					"serverName": string$1(),
					"required": boolean$1(),
					"capabilities": array(union([literal("tools"), literal("resources")])).optional(),
					"toolNames": array(string$1()).optional()
				})).readonly().optional(),
				"unverified": array(string$1()).readonly().optional(),
				"otherSkills": array(object({
					"id": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly().optional()
			}).readonly().optional().describe("Declared dependencies, with the executable check that can be made here.")
		}), object({
			"ok": literal(false).readonly().describe("`ok` is always false here, so a caller can branch on it."),
			"reason": string$1().readonly().describe("Machine-readable reason."),
			"detail": string$1().readonly().describe("Human-readable detail, already specific.")
		})]);
		let dsh_agent_team_presets_teamSkills_importSkill_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_importSkill_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_importSkill_parameter_0$schema$value ??= array(object({
			"path": string$1().describe("POSIX-relative path inside the imported folder."),
			"base64": string$1().describe("Base64 of the bytes.")
		}));
		let dsh_agent_team_presets_teamSkills_importSkill_result$schema$value;
		const dsh_agent_team_presets_teamSkills_importSkill_result$schema = () => dsh_agent_team_presets_teamSkills_importSkill_result$schema$value ??= union([object({
			"asset": object({
				"id": string$1().readonly().describe("Asset identity."),
				"skillId": string$1().readonly().describe("Kebab-case skill name."),
				"description": string$1().readonly().describe("Frontmatter description."),
				"origin": string$1().readonly().describe("Where the asset came from."),
				"version": string$1().readonly().describe("Immutable version currently served."),
				"officialSkillId": string$1().readonly().optional().describe("Shipped skill this override started from, when it is an override."),
				"updateAvailable": boolean$1().readonly().optional().describe("Whether the shipped copy has moved past this override."),
				"editable": boolean$1().readonly().describe("Whether the page may edit it."),
				"fileCount": number$1().readonly().describe("File count."),
				"totalBytes": number$1().readonly().describe("Total bytes."),
				"mcpServers": array(string$1()).readonly().describe("Declared dependencies (MCP servers, executables, other skills)."),
				"clashesWith": array(string$1()).readonly().optional().describe("Other assets that reuse the same skill name under a different origin."),
				"bindings": array(object({
					"teamId": string$1().readonly().describe("Team identity."),
					"teamName": string$1().readonly().describe("Team display name."),
					"roleId": string$1().readonly().describe("Role identity."),
					"roleName": string$1().readonly().describe("Role display name."),
					"captain": boolean$1().readonly().describe("Whether the holder is the captain.")
				})).readonly().describe("Every role holding it.")
			}).readonly().describe("The asset row."),
			"files": array(object({
				"path": string$1().readonly().describe("POSIX-relative path inside the asset."),
				"size": number$1().readonly().describe("Byte length."),
				"text": boolean$1().readonly().describe("Whether the page may show it as text.")
			})).readonly().describe("Every file, path-ordered."),
			"body": string$1().readonly().describe("The `SKILL.md` body, without frontmatter."),
			"directory": string$1().readonly().describe("Absolute directory holding this version's files, as the store named it."),
			"dependencies": object({
				"executables": array(object({
					"name": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly(),
				"mcpServers": array(string$1()).readonly(),
				"mcpDeclarations": array(object({
					"serverName": string$1(),
					"required": boolean$1(),
					"capabilities": array(union([literal("tools"), literal("resources")])).optional(),
					"toolNames": array(string$1()).optional()
				})).readonly().optional(),
				"unverified": array(string$1()).readonly().optional(),
				"otherSkills": array(object({
					"id": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly().optional()
			}).readonly().optional().describe("Declared dependencies, with the executable check that can be made here.")
		}), object({
			"ok": literal(false).readonly().describe("`ok` is always false here, so a caller can branch on it."),
			"reason": string$1().readonly().describe("Machine-readable reason."),
			"detail": string$1().readonly().describe("Human-readable detail, already specific.")
		})]);
		let dsh_agent_team_presets_teamSkills_library_result$schema$value;
		const dsh_agent_team_presets_teamSkills_library_result$schema = () => dsh_agent_team_presets_teamSkills_library_result$schema$value ??= object({
			"root": string$1().readonly().describe("Absolute private root, shown so the user can open it in a file manager."),
			"assets": array(object({
				"id": string$1().readonly().describe("Asset identity."),
				"skillId": string$1().readonly().describe("Kebab-case skill name."),
				"description": string$1().readonly().describe("Frontmatter description."),
				"origin": string$1().readonly().describe("Where the asset came from."),
				"version": string$1().readonly().describe("Immutable version currently served."),
				"officialSkillId": string$1().readonly().optional().describe("Shipped skill this override started from, when it is an override."),
				"updateAvailable": boolean$1().readonly().optional().describe("Whether the shipped copy has moved past this override."),
				"editable": boolean$1().readonly().describe("Whether the page may edit it."),
				"fileCount": number$1().readonly().describe("File count."),
				"totalBytes": number$1().readonly().describe("Total bytes."),
				"mcpServers": array(string$1()).readonly().describe("Declared dependencies (MCP servers, executables, other skills)."),
				"clashesWith": array(string$1()).readonly().optional().describe("Other assets that reuse the same skill name under a different origin."),
				"bindings": array(object({
					"teamId": string$1().readonly().describe("Team identity."),
					"teamName": string$1().readonly().describe("Team display name."),
					"roleId": string$1().readonly().describe("Role identity."),
					"roleName": string$1().readonly().describe("Role display name."),
					"captain": boolean$1().readonly().describe("Whether the holder is the captain.")
				})).readonly().describe("Every role holding it.")
			})).readonly().describe("Every asset, name-ordered."),
			"teams": array(object({
				"id": string$1().readonly().describe("Team identity."),
				"name": string$1().readonly().describe("Display name."),
				"roles": array(object({
					"id": string$1().readonly().describe("Role identity used in a binding."),
					"name": string$1().readonly().describe("Display name shown in the page."),
					"captain": boolean$1().readonly().describe("Whether this is the captain slot.")
				})).readonly().describe("The captain slot plus every member slot, in Team order.")
			})).readonly().describe("Every Team and its addressable roles."),
			"official": array(string$1()).readonly().describe("Shipped skill ids this deployment provides."),
			"issue": string$1().readonly().optional().describe("Why the store is unusable, when this deployment could not open it.")
		});
		let dsh_agent_team_presets_teamSkills_overrideSkill_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_overrideSkill_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_overrideSkill_parameter_0$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_overrideSkill_result$schema$value;
		const dsh_agent_team_presets_teamSkills_overrideSkill_result$schema = () => dsh_agent_team_presets_teamSkills_overrideSkill_result$schema$value ??= union([object({
			"asset": object({
				"id": string$1().readonly().describe("Asset identity."),
				"skillId": string$1().readonly().describe("Kebab-case skill name."),
				"description": string$1().readonly().describe("Frontmatter description."),
				"origin": string$1().readonly().describe("Where the asset came from."),
				"version": string$1().readonly().describe("Immutable version currently served."),
				"officialSkillId": string$1().readonly().optional().describe("Shipped skill this override started from, when it is an override."),
				"updateAvailable": boolean$1().readonly().optional().describe("Whether the shipped copy has moved past this override."),
				"editable": boolean$1().readonly().describe("Whether the page may edit it."),
				"fileCount": number$1().readonly().describe("File count."),
				"totalBytes": number$1().readonly().describe("Total bytes."),
				"mcpServers": array(string$1()).readonly().describe("Declared dependencies (MCP servers, executables, other skills)."),
				"clashesWith": array(string$1()).readonly().optional().describe("Other assets that reuse the same skill name under a different origin."),
				"bindings": array(object({
					"teamId": string$1().readonly().describe("Team identity."),
					"teamName": string$1().readonly().describe("Team display name."),
					"roleId": string$1().readonly().describe("Role identity."),
					"roleName": string$1().readonly().describe("Role display name."),
					"captain": boolean$1().readonly().describe("Whether the holder is the captain.")
				})).readonly().describe("Every role holding it.")
			}).readonly().describe("The asset row."),
			"files": array(object({
				"path": string$1().readonly().describe("POSIX-relative path inside the asset."),
				"size": number$1().readonly().describe("Byte length."),
				"text": boolean$1().readonly().describe("Whether the page may show it as text.")
			})).readonly().describe("Every file, path-ordered."),
			"body": string$1().readonly().describe("The `SKILL.md` body, without frontmatter."),
			"directory": string$1().readonly().describe("Absolute directory holding this version's files, as the store named it."),
			"dependencies": object({
				"executables": array(object({
					"name": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly(),
				"mcpServers": array(string$1()).readonly(),
				"mcpDeclarations": array(object({
					"serverName": string$1(),
					"required": boolean$1(),
					"capabilities": array(union([literal("tools"), literal("resources")])).optional(),
					"toolNames": array(string$1()).optional()
				})).readonly().optional(),
				"unverified": array(string$1()).readonly().optional(),
				"otherSkills": array(object({
					"id": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly().optional()
			}).readonly().optional().describe("Declared dependencies, with the executable check that can be made here.")
		}), object({
			"ok": literal(false).readonly().describe("`ok` is always false here, so a caller can branch on it."),
			"reason": string$1().readonly().describe("Machine-readable reason."),
			"detail": string$1().readonly().describe("Human-readable detail, already specific.")
		})]);
		let dsh_agent_team_presets_teamSkills_prepareImportFolder_result$schema$value;
		const dsh_agent_team_presets_teamSkills_prepareImportFolder_result$schema = () => dsh_agent_team_presets_teamSkills_prepareImportFolder_result$schema$value ??= union([object({
			"ok": literal(false).readonly().describe("`ok` is always false here, so a caller can branch on it."),
			"reason": string$1().readonly().describe("Machine-readable reason."),
			"detail": string$1().readonly().describe("Human-readable detail, already specific.")
		}), object({
			"ok": literal(true).readonly().describe("This answer prepared the directory."),
			"root": string$1().readonly().describe("Private library root that owns the folder."),
			"path": string$1().readonly().describe("Absolute import directory, created when it was missing.")
		})]);
		let dsh_agent_team_presets_teamSkills_readFile_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_readFile_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_readFile_parameter_0$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_readFile_parameter_1$schema$value;
		const dsh_agent_team_presets_teamSkills_readFile_parameter_1$schema = () => dsh_agent_team_presets_teamSkills_readFile_parameter_1$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_readFile_result$schema$value;
		const dsh_agent_team_presets_teamSkills_readFile_result$schema = () => dsh_agent_team_presets_teamSkills_readFile_result$schema$value ??= union([object({
			"ok": literal(false).readonly().describe("`ok` is always false here, so a caller can branch on it."),
			"reason": string$1().readonly().describe("Machine-readable reason."),
			"detail": string$1().readonly().describe("Human-readable detail, already specific.")
		}), object({
			"ok": literal(true),
			"path": string$1(),
			"text": string$1()
		})]);
		let dsh_agent_team_presets_teamSkills_resetSkill_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_resetSkill_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_resetSkill_parameter_0$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_resetSkill_result$schema$value;
		const dsh_agent_team_presets_teamSkills_resetSkill_result$schema = () => dsh_agent_team_presets_teamSkills_resetSkill_result$schema$value ??= union([object({
			"asset": object({
				"id": string$1().readonly().describe("Asset identity."),
				"skillId": string$1().readonly().describe("Kebab-case skill name."),
				"description": string$1().readonly().describe("Frontmatter description."),
				"origin": string$1().readonly().describe("Where the asset came from."),
				"version": string$1().readonly().describe("Immutable version currently served."),
				"officialSkillId": string$1().readonly().optional().describe("Shipped skill this override started from, when it is an override."),
				"updateAvailable": boolean$1().readonly().optional().describe("Whether the shipped copy has moved past this override."),
				"editable": boolean$1().readonly().describe("Whether the page may edit it."),
				"fileCount": number$1().readonly().describe("File count."),
				"totalBytes": number$1().readonly().describe("Total bytes."),
				"mcpServers": array(string$1()).readonly().describe("Declared dependencies (MCP servers, executables, other skills)."),
				"clashesWith": array(string$1()).readonly().optional().describe("Other assets that reuse the same skill name under a different origin."),
				"bindings": array(object({
					"teamId": string$1().readonly().describe("Team identity."),
					"teamName": string$1().readonly().describe("Team display name."),
					"roleId": string$1().readonly().describe("Role identity."),
					"roleName": string$1().readonly().describe("Role display name."),
					"captain": boolean$1().readonly().describe("Whether the holder is the captain.")
				})).readonly().describe("Every role holding it.")
			}).readonly().describe("The asset row."),
			"files": array(object({
				"path": string$1().readonly().describe("POSIX-relative path inside the asset."),
				"size": number$1().readonly().describe("Byte length."),
				"text": boolean$1().readonly().describe("Whether the page may show it as text.")
			})).readonly().describe("Every file, path-ordered."),
			"body": string$1().readonly().describe("The `SKILL.md` body, without frontmatter."),
			"directory": string$1().readonly().describe("Absolute directory holding this version's files, as the store named it."),
			"dependencies": object({
				"executables": array(object({
					"name": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly(),
				"mcpServers": array(string$1()).readonly(),
				"mcpDeclarations": array(object({
					"serverName": string$1(),
					"required": boolean$1(),
					"capabilities": array(union([literal("tools"), literal("resources")])).optional(),
					"toolNames": array(string$1()).optional()
				})).readonly().optional(),
				"unverified": array(string$1()).readonly().optional(),
				"otherSkills": array(object({
					"id": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly().optional()
			}).readonly().optional().describe("Declared dependencies, with the executable check that can be made here.")
		}), object({
			"ok": literal(false).readonly().describe("`ok` is always false here, so a caller can branch on it."),
			"reason": string$1().readonly().describe("Machine-readable reason."),
			"detail": string$1().readonly().describe("Human-readable detail, already specific.")
		})]);
		let dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_parameter_0$schema$value ??= union([_undefined(), array(string$1())]);
		let dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_result$schema$value;
		const dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_result$schema = () => dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_result$schema$value ??= object({
			"root": string$1().readonly().describe("Absolute private root, shown so the user can open it in a file manager."),
			"assets": array(object({
				"id": string$1().readonly().describe("Asset identity."),
				"skillId": string$1().readonly().describe("Kebab-case skill name."),
				"description": string$1().readonly().describe("Frontmatter description."),
				"origin": string$1().readonly().describe("Where the asset came from."),
				"version": string$1().readonly().describe("Immutable version currently served."),
				"officialSkillId": string$1().readonly().optional().describe("Shipped skill this override started from, when it is an override."),
				"updateAvailable": boolean$1().readonly().optional().describe("Whether the shipped copy has moved past this override."),
				"editable": boolean$1().readonly().describe("Whether the page may edit it."),
				"fileCount": number$1().readonly().describe("File count."),
				"totalBytes": number$1().readonly().describe("Total bytes."),
				"mcpServers": array(string$1()).readonly().describe("Declared dependencies (MCP servers, executables, other skills)."),
				"clashesWith": array(string$1()).readonly().optional().describe("Other assets that reuse the same skill name under a different origin."),
				"bindings": array(object({
					"teamId": string$1().readonly().describe("Team identity."),
					"teamName": string$1().readonly().describe("Team display name."),
					"roleId": string$1().readonly().describe("Role identity."),
					"roleName": string$1().readonly().describe("Role display name."),
					"captain": boolean$1().readonly().describe("Whether the holder is the captain.")
				})).readonly().describe("Every role holding it.")
			})).readonly().describe("Every asset, name-ordered."),
			"teams": array(object({
				"id": string$1().readonly().describe("Team identity."),
				"name": string$1().readonly().describe("Display name."),
				"roles": array(object({
					"id": string$1().readonly().describe("Role identity used in a binding."),
					"name": string$1().readonly().describe("Display name shown in the page."),
					"captain": boolean$1().readonly().describe("Whether this is the captain slot.")
				})).readonly().describe("The captain slot plus every member slot, in Team order.")
			})).readonly().describe("Every Team and its addressable roles."),
			"official": array(string$1()).readonly().describe("Shipped skill ids this deployment provides."),
			"issue": string$1().readonly().optional().describe("Why the store is unusable, when this deployment could not open it.")
		});
		let dsh_agent_team_presets_teamSkills_scanImportFolder_result$schema$value;
		const dsh_agent_team_presets_teamSkills_scanImportFolder_result$schema = () => dsh_agent_team_presets_teamSkills_scanImportFolder_result$schema$value ??= union([object({
			"ok": literal(false).readonly().describe("`ok` is always false here, so a caller can branch on it."),
			"reason": string$1().readonly().describe("Machine-readable reason."),
			"detail": string$1().readonly().describe("Human-readable detail, already specific.")
		}), object({
			"ok": literal(true).readonly().describe("This answer is a completed scan."),
			"root": string$1().readonly().describe("Absolute directory that was scanned."),
			"scanned": number$1().readonly().describe("Folders examined."),
			"imported": number$1().readonly().describe("Folders published as new custom assets."),
			"existing": number$1().readonly().describe("Folders whose skill name already exists in the library."),
			"invalid": number$1().readonly().describe("Folders refused with a reason."),
			"entries": array(object({
				"folder": string$1().readonly().describe("Folder name inside the scan root."),
				"status": union([
					literal("imported"),
					literal("existing"),
					literal("invalid")
				]).readonly().describe("Whether it was imported, already present, or refused."),
				"skillId": string$1().readonly().optional().describe("Skill name read from its `SKILL.md`, when the folder was readable."),
				"assetId": string$1().readonly().optional().describe("Asset identity for an imported or already-present skill."),
				"reason": string$1().readonly().optional().describe("Machine-readable refusal reason, or `duplicate` for an existing name."),
				"detail": string$1().readonly().optional().describe("Path or other detail that explains the reason.")
			})).readonly().describe("One row per folder, in name order.")
		})]);
		let dsh_agent_team_presets_teamSkills_unassignRole_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_unassignRole_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_unassignRole_parameter_0$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_unassignRole_parameter_1$schema$value;
		const dsh_agent_team_presets_teamSkills_unassignRole_parameter_1$schema = () => dsh_agent_team_presets_teamSkills_unassignRole_parameter_1$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_unassignRole_parameter_2$schema$value;
		const dsh_agent_team_presets_teamSkills_unassignRole_parameter_2$schema = () => dsh_agent_team_presets_teamSkills_unassignRole_parameter_2$schema$value ??= union([_undefined(), string$1()]);
		let dsh_agent_team_presets_teamSkills_unassignRole_result$schema$value;
		const dsh_agent_team_presets_teamSkills_unassignRole_result$schema = () => dsh_agent_team_presets_teamSkills_unassignRole_result$schema$value ??= object({
			"root": string$1().readonly().describe("Absolute private root, shown so the user can open it in a file manager."),
			"assets": array(object({
				"id": string$1().readonly().describe("Asset identity."),
				"skillId": string$1().readonly().describe("Kebab-case skill name."),
				"description": string$1().readonly().describe("Frontmatter description."),
				"origin": string$1().readonly().describe("Where the asset came from."),
				"version": string$1().readonly().describe("Immutable version currently served."),
				"officialSkillId": string$1().readonly().optional().describe("Shipped skill this override started from, when it is an override."),
				"updateAvailable": boolean$1().readonly().optional().describe("Whether the shipped copy has moved past this override."),
				"editable": boolean$1().readonly().describe("Whether the page may edit it."),
				"fileCount": number$1().readonly().describe("File count."),
				"totalBytes": number$1().readonly().describe("Total bytes."),
				"mcpServers": array(string$1()).readonly().describe("Declared dependencies (MCP servers, executables, other skills)."),
				"clashesWith": array(string$1()).readonly().optional().describe("Other assets that reuse the same skill name under a different origin."),
				"bindings": array(object({
					"teamId": string$1().readonly().describe("Team identity."),
					"teamName": string$1().readonly().describe("Team display name."),
					"roleId": string$1().readonly().describe("Role identity."),
					"roleName": string$1().readonly().describe("Role display name."),
					"captain": boolean$1().readonly().describe("Whether the holder is the captain.")
				})).readonly().describe("Every role holding it.")
			})).readonly().describe("Every asset, name-ordered."),
			"teams": array(object({
				"id": string$1().readonly().describe("Team identity."),
				"name": string$1().readonly().describe("Display name."),
				"roles": array(object({
					"id": string$1().readonly().describe("Role identity used in a binding."),
					"name": string$1().readonly().describe("Display name shown in the page."),
					"captain": boolean$1().readonly().describe("Whether this is the captain slot.")
				})).readonly().describe("The captain slot plus every member slot, in Team order.")
			})).readonly().describe("Every Team and its addressable roles."),
			"official": array(string$1()).readonly().describe("Shipped skill ids this deployment provides."),
			"issue": string$1().readonly().optional().describe("Why the store is unusable, when this deployment could not open it.")
		});
		let dsh_agent_team_presets_teamSkills_updateDependencies_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_updateDependencies_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_updateDependencies_parameter_0$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_updateDependencies_parameter_1$schema$value;
		const dsh_agent_team_presets_teamSkills_updateDependencies_parameter_1$schema = () => dsh_agent_team_presets_teamSkills_updateDependencies_parameter_1$schema$value ??= object({
			"mcpServers": array(object({
				"serverName": string$1(),
				"required": boolean$1(),
				"capabilities": array(union([literal("tools"), literal("resources")])).optional(),
				"toolNames": array(string$1()).optional()
			})).describe("MCP servers the skill's method expects; never auto-connected."),
			"executables": array(string$1()).describe("Executables the scripts expect, such as `python3`."),
			"otherSkills": array(string$1()).describe("Other Team Skill ids this asset explicitly depends on.")
		});
		let dsh_agent_team_presets_teamSkills_updateDependencies_result$schema$value;
		const dsh_agent_team_presets_teamSkills_updateDependencies_result$schema = () => dsh_agent_team_presets_teamSkills_updateDependencies_result$schema$value ??= union([object({
			"asset": object({
				"id": string$1().readonly().describe("Asset identity."),
				"skillId": string$1().readonly().describe("Kebab-case skill name."),
				"description": string$1().readonly().describe("Frontmatter description."),
				"origin": string$1().readonly().describe("Where the asset came from."),
				"version": string$1().readonly().describe("Immutable version currently served."),
				"officialSkillId": string$1().readonly().optional().describe("Shipped skill this override started from, when it is an override."),
				"updateAvailable": boolean$1().readonly().optional().describe("Whether the shipped copy has moved past this override."),
				"editable": boolean$1().readonly().describe("Whether the page may edit it."),
				"fileCount": number$1().readonly().describe("File count."),
				"totalBytes": number$1().readonly().describe("Total bytes."),
				"mcpServers": array(string$1()).readonly().describe("Declared dependencies (MCP servers, executables, other skills)."),
				"clashesWith": array(string$1()).readonly().optional().describe("Other assets that reuse the same skill name under a different origin."),
				"bindings": array(object({
					"teamId": string$1().readonly().describe("Team identity."),
					"teamName": string$1().readonly().describe("Team display name."),
					"roleId": string$1().readonly().describe("Role identity."),
					"roleName": string$1().readonly().describe("Role display name."),
					"captain": boolean$1().readonly().describe("Whether the holder is the captain.")
				})).readonly().describe("Every role holding it.")
			}).readonly().describe("The asset row."),
			"files": array(object({
				"path": string$1().readonly().describe("POSIX-relative path inside the asset."),
				"size": number$1().readonly().describe("Byte length."),
				"text": boolean$1().readonly().describe("Whether the page may show it as text.")
			})).readonly().describe("Every file, path-ordered."),
			"body": string$1().readonly().describe("The `SKILL.md` body, without frontmatter."),
			"directory": string$1().readonly().describe("Absolute directory holding this version's files, as the store named it."),
			"dependencies": object({
				"executables": array(object({
					"name": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly(),
				"mcpServers": array(string$1()).readonly(),
				"mcpDeclarations": array(object({
					"serverName": string$1(),
					"required": boolean$1(),
					"capabilities": array(union([literal("tools"), literal("resources")])).optional(),
					"toolNames": array(string$1()).optional()
				})).readonly().optional(),
				"unverified": array(string$1()).readonly().optional(),
				"otherSkills": array(object({
					"id": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly().optional()
			}).readonly().optional().describe("Declared dependencies, with the executable check that can be made here.")
		}), object({
			"ok": literal(false).readonly().describe("`ok` is always false here, so a caller can branch on it."),
			"reason": string$1().readonly().describe("Machine-readable reason."),
			"detail": string$1().readonly().describe("Human-readable detail, already specific.")
		})]);
		let dsh_agent_team_presets_teamSkills_writeFile_parameter_0$schema$value;
		const dsh_agent_team_presets_teamSkills_writeFile_parameter_0$schema = () => dsh_agent_team_presets_teamSkills_writeFile_parameter_0$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_writeFile_parameter_1$schema$value;
		const dsh_agent_team_presets_teamSkills_writeFile_parameter_1$schema = () => dsh_agent_team_presets_teamSkills_writeFile_parameter_1$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_writeFile_parameter_2$schema$value;
		const dsh_agent_team_presets_teamSkills_writeFile_parameter_2$schema = () => dsh_agent_team_presets_teamSkills_writeFile_parameter_2$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_writeFile_result$schema$value;
		const dsh_agent_team_presets_teamSkills_writeFile_result$schema = () => dsh_agent_team_presets_teamSkills_writeFile_result$schema$value ??= union([object({
			"asset": object({
				"id": string$1().readonly().describe("Asset identity."),
				"skillId": string$1().readonly().describe("Kebab-case skill name."),
				"description": string$1().readonly().describe("Frontmatter description."),
				"origin": string$1().readonly().describe("Where the asset came from."),
				"version": string$1().readonly().describe("Immutable version currently served."),
				"officialSkillId": string$1().readonly().optional().describe("Shipped skill this override started from, when it is an override."),
				"updateAvailable": boolean$1().readonly().optional().describe("Whether the shipped copy has moved past this override."),
				"editable": boolean$1().readonly().describe("Whether the page may edit it."),
				"fileCount": number$1().readonly().describe("File count."),
				"totalBytes": number$1().readonly().describe("Total bytes."),
				"mcpServers": array(string$1()).readonly().describe("Declared dependencies (MCP servers, executables, other skills)."),
				"clashesWith": array(string$1()).readonly().optional().describe("Other assets that reuse the same skill name under a different origin."),
				"bindings": array(object({
					"teamId": string$1().readonly().describe("Team identity."),
					"teamName": string$1().readonly().describe("Team display name."),
					"roleId": string$1().readonly().describe("Role identity."),
					"roleName": string$1().readonly().describe("Role display name."),
					"captain": boolean$1().readonly().describe("Whether the holder is the captain.")
				})).readonly().describe("Every role holding it.")
			}).readonly().describe("The asset row."),
			"files": array(object({
				"path": string$1().readonly().describe("POSIX-relative path inside the asset."),
				"size": number$1().readonly().describe("Byte length."),
				"text": boolean$1().readonly().describe("Whether the page may show it as text.")
			})).readonly().describe("Every file, path-ordered."),
			"body": string$1().readonly().describe("The `SKILL.md` body, without frontmatter."),
			"directory": string$1().readonly().describe("Absolute directory holding this version's files, as the store named it."),
			"dependencies": object({
				"executables": array(object({
					"name": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly(),
				"mcpServers": array(string$1()).readonly(),
				"mcpDeclarations": array(object({
					"serverName": string$1(),
					"required": boolean$1(),
					"capabilities": array(union([literal("tools"), literal("resources")])).optional(),
					"toolNames": array(string$1()).optional()
				})).readonly().optional(),
				"unverified": array(string$1()).readonly().optional(),
				"otherSkills": array(object({
					"id": string$1().readonly(),
					"found": boolean$1().readonly()
				})).readonly().optional()
			}).readonly().optional().describe("Declared dependencies, with the executable check that can be made here.")
		}), object({
			"ok": literal(false).readonly().describe("`ok` is always false here, so a caller can branch on it."),
			"reason": string$1().readonly().describe("Machine-readable reason."),
			"detail": string$1().readonly().describe("Human-readable detail, already specific.")
		})]);
		let dsh_agent_team_presets_teamSkills_assignRole_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_assignRole_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_assignRole_parameter_0_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_assignRole_parameter_1_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_assignRole_parameter_1_strict$schema = () => dsh_agent_team_presets_teamSkills_assignRole_parameter_1_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_assignRole_parameter_2_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_assignRole_parameter_2_strict$schema = () => dsh_agent_team_presets_teamSkills_assignRole_parameter_2_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_createSkill_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_createSkill_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_createSkill_parameter_0_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_createSkill_parameter_1_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_createSkill_parameter_1_strict$schema = () => dsh_agent_team_presets_teamSkills_createSkill_parameter_1_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_deleteAsset_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_deleteAsset_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_deleteAsset_parameter_0_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_detail_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_detail_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_detail_parameter_0_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_importSkill_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_importSkill_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_importSkill_parameter_0_strict$schema$value ??= array(strictObject({
			"path": string$1().describe("POSIX-relative path inside the imported folder."),
			"base64": string$1().describe("Base64 of the bytes.")
		}));
		let dsh_agent_team_presets_teamSkills_overrideSkill_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_overrideSkill_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_overrideSkill_parameter_0_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_readFile_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_readFile_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_readFile_parameter_0_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_readFile_parameter_1_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_readFile_parameter_1_strict$schema = () => dsh_agent_team_presets_teamSkills_readFile_parameter_1_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_resetSkill_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_resetSkill_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_resetSkill_parameter_0_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_parameter_0_strict$schema$value ??= union([_undefined(), array(string$1())]);
		let dsh_agent_team_presets_teamSkills_unassignRole_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_unassignRole_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_unassignRole_parameter_0_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_unassignRole_parameter_1_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_unassignRole_parameter_1_strict$schema = () => dsh_agent_team_presets_teamSkills_unassignRole_parameter_1_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_unassignRole_parameter_2_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_unassignRole_parameter_2_strict$schema = () => dsh_agent_team_presets_teamSkills_unassignRole_parameter_2_strict$schema$value ??= union([_undefined(), string$1()]);
		let dsh_agent_team_presets_teamSkills_updateDependencies_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_updateDependencies_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_updateDependencies_parameter_0_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_updateDependencies_parameter_1_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_updateDependencies_parameter_1_strict$schema = () => dsh_agent_team_presets_teamSkills_updateDependencies_parameter_1_strict$schema$value ??= strictObject({
			"mcpServers": array(strictObject({
				"serverName": string$1(),
				"required": boolean$1(),
				"capabilities": array(union([literal("tools"), literal("resources")])).optional(),
				"toolNames": array(string$1()).optional()
			})).describe("MCP servers the skill's method expects; never auto-connected."),
			"executables": array(string$1()).describe("Executables the scripts expect, such as `python3`."),
			"otherSkills": array(string$1()).describe("Other Team Skill ids this asset explicitly depends on.")
		});
		let dsh_agent_team_presets_teamSkills_writeFile_parameter_0_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_writeFile_parameter_0_strict$schema = () => dsh_agent_team_presets_teamSkills_writeFile_parameter_0_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_writeFile_parameter_1_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_writeFile_parameter_1_strict$schema = () => dsh_agent_team_presets_teamSkills_writeFile_parameter_1_strict$schema$value ??= string$1();
		let dsh_agent_team_presets_teamSkills_writeFile_parameter_2_strict$schema$value;
		const dsh_agent_team_presets_teamSkills_writeFile_parameter_2_strict$schema = () => dsh_agent_team_presets_teamSkills_writeFile_parameter_2_strict$schema$value ??= string$1();
		const TYPERT_REMOTE = createTypertRemoteInfo({
			package: "dsh-agent-team-presets",
			methods: {
				"teamPresets/catalog": {
					service: "teamPresetsToolCatalog",
					description: "List global, standing-preset and fixed Team capability choices. Two kinds of name are deliberately absent. The reserved PTC mode transport is excluded because `ctx.tools.restrict()` refuses it, so offering it as a checkbox would produce a selection the summon path rejects. The implicit tools (`skill`) are excluded because a Team policy always admits them: they are a precondition of a Team Skill assignment, not a capability an operator could withhold, so a checkbox for one would be a control that cannot do anything.",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets/types#ToolCatalogValue",
						create: dsh_agent_team_presets_teamPresets_catalog_result$schema,
						description: "the tool names and model-facing descriptions, sorted by name.",
						jsonSchema: {
							"type": "object",
							"properties": { "tools": {
								"type": "array",
								"items": {
									"type": "object",
									"properties": {
										"name": {
											"type": "string",
											"description": "Capability name the strict execution policy accepts verbatim."
										},
										"description": {
											"type": "string",
											"description": "Model-facing description, shown as the checkbox hover text."
										},
										"captainOnly": {
											"type": "boolean",
											"description": "Whether only the captain can exercise this capability. The Team service enforces this for `interrupt_agent` (a member call is refused with `TEAM_LEAD_REQUIRED`), and this plugin registers the preset tools on the Session root only. A member that selects such a name still cannot use it, so the page must say so instead of offering it as grantable."
										},
										"source": {
											"type": "string",
											"enum": [
												"other",
												"presets",
												"mcp"
											],
											"description": "Which upstream source the capability was attributed to. The tool registry records no registering package: `register()` stores a definition under its tool name with a fixed label, so \"native Harness\" and \"some third-party plugin\" are not separable. Only two attributions are deterministic — this plugin's own registrations, and MCP tools, whose `mcp__<server>__<name>` form the Harness itself generates. Everything else is reported as `other` rather than guessed at."
										},
										"server": {
											"type": "string",
											"description": "MCP server name; present only when {@link source} is `mcp`."
										}
									},
									"required": [
										"name",
										"description",
										"source"
									],
									"additionalProperties": true
								},
								"description": "Union of deployment preset/global and fixed Team capability names."
							} },
							"required": ["tools"],
							"additionalProperties": true
						}
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/tool-catalog.ts",
						"line": 140,
						"column": 9
					}
				},
				"teamPresets/execution": {
					service: "teamPresetsToolCatalog",
					description: "Stream the execution state of every Team the Host reports. The settings page reads this before it promises that a saved change takes effect right away: a Team executing a task adopts a save only before its next task, and a state the Host cannot decide stays `unknown` rather than passing for idle.",
					mode: "stream",
					invocation: { kind: "direct" },
					parameters: [],
					cancellation: { parameter: "signal" },
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets/types#TeamExecutionSnapshot",
						create: dsh_agent_team_presets_teamPresets_execution_result$schema,
						description: "whole-set frames, opening with the current state.",
						jsonSchema: {
							"type": "object",
							"properties": { "teams": {
								"type": "array",
								"items": {
									"type": "object",
									"properties": {
										"teamId": {
											"type": "string",
											"description": "Team identity the row describes."
										},
										"state": {
											"type": "string",
											"enum": [
												"unknown",
												"idle",
												"busy"
											],
											"description": "Whether the Team is executing, known idle, or undecidable."
										},
										"busySessions": {
											"type": "number",
											"description": "Online Sessions running a Team task on it."
										},
										"executingMembers": {
											"type": "number",
											"description": "Teammates running or provisioning across those Sessions."
										},
										"pendingSessions": {
											"type": "number",
											"description": "Sessions whose applied definition or selection the next Team task has not adopted yet. A member route or accent color saved meanwhile is read live, so it is no reason to wait."
										},
										"notes": {
											"type": "array",
											"items": { "type": "string" },
											"description": "Disclosures about how the applied Team runs, in a stable order. An empty list means no applied Session needed one. The only note today says that a Team whose custom tool policy needed a native surface overrode the Session's PTC batch-calling presentation, which the page must state instead of claiming the preset's transport is intact."
										}
									},
									"required": [
										"teamId",
										"state",
										"busySessions",
										"executingMembers",
										"pendingSessions",
										"notes"
									],
									"additionalProperties": true
								},
								"description": "One row per Team the Host reports, ordered by Team identity."
							} },
							"required": ["teams"],
							"additionalProperties": true
						}
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/tool-catalog.ts",
						"line": 188,
						"column": 3
					}
				},
				"teamSkills/assignRole": {
					service: "teamSkills",
					description: "Bind one asset to one role slot.",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "teamId",
							description: "Team identity.",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/assignRole:teamId",
								create: dsh_agent_team_presets_teamSkills_assignRole_parameter_0$schema,
								jsonSchema: { "type": "string" }
							},
							strictCodec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/assignRole:teamId",
								create: dsh_agent_team_presets_teamSkills_assignRole_parameter_0_strict$schema,
								jsonSchema: { "type": "string" }
							}
						},
						{
							name: "roleId",
							description: "role identity, or `captain`.",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/assignRole:roleId",
								create: dsh_agent_team_presets_teamSkills_assignRole_parameter_1$schema,
								jsonSchema: { "type": "string" }
							},
							strictCodec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/assignRole:roleId",
								create: dsh_agent_team_presets_teamSkills_assignRole_parameter_1_strict$schema,
								jsonSchema: { "type": "string" }
							}
						},
						{
							name: "assetId",
							description: "asset identity.",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/assignRole:assetId",
								create: dsh_agent_team_presets_teamSkills_assignRole_parameter_2$schema,
								jsonSchema: { "type": "string" }
							},
							strictCodec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/assignRole:assetId",
								create: dsh_agent_team_presets_teamSkills_assignRole_parameter_2_strict$schema,
								jsonSchema: { "type": "string" }
							}
						}
					],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets#teamSkills/assignRole:result",
						create: dsh_agent_team_presets_teamSkills_assignRole_result$schema,
						description: "whether the assignment landed, and the refreshed library.",
						jsonSchema: {
							"type": "object",
							"properties": {
								"ok": { "type": "boolean" },
								"detail": { "type": "string" },
								"unverified": {
									"type": "array",
									"items": { "type": "string" }
								},
								"library": {
									"type": "object",
									"properties": {
										"root": {
											"type": "string",
											"description": "Absolute private root, shown so the user can open it in a file manager."
										},
										"assets": {
											"type": "array",
											"items": {
												"type": "object",
												"properties": {
													"id": {
														"type": "string",
														"description": "Asset identity."
													},
													"skillId": {
														"type": "string",
														"description": "Kebab-case skill name."
													},
													"description": {
														"type": "string",
														"description": "Frontmatter description."
													},
													"origin": {
														"type": "string",
														"description": "Where the asset came from."
													},
													"version": {
														"type": "string",
														"description": "Immutable version currently served."
													},
													"officialSkillId": {
														"type": "string",
														"description": "Shipped skill this override started from, when it is an override."
													},
													"updateAvailable": {
														"type": "boolean",
														"description": "Whether the shipped copy has moved past this override."
													},
													"editable": {
														"type": "boolean",
														"description": "Whether the page may edit it."
													},
													"fileCount": {
														"type": "number",
														"description": "File count."
													},
													"totalBytes": {
														"type": "number",
														"description": "Total bytes."
													},
													"mcpServers": {
														"type": "array",
														"items": { "type": "string" },
														"description": "Declared dependencies (MCP servers, executables, other skills)."
													},
													"clashesWith": {
														"type": "array",
														"items": { "type": "string" },
														"description": "Other assets that reuse the same skill name under a different origin."
													},
													"bindings": {
														"type": "array",
														"items": {
															"type": "object",
															"properties": {
																"teamId": {
																	"type": "string",
																	"description": "Team identity."
																},
																"teamName": {
																	"type": "string",
																	"description": "Team display name."
																},
																"roleId": {
																	"type": "string",
																	"description": "Role identity."
																},
																"roleName": {
																	"type": "string",
																	"description": "Role display name."
																},
																"captain": {
																	"type": "boolean",
																	"description": "Whether the holder is the captain."
																}
															},
															"required": [
																"teamId",
																"teamName",
																"roleId",
																"roleName",
																"captain"
															],
															"additionalProperties": true
														},
														"description": "Every role holding it."
													}
												},
												"required": [
													"id",
													"skillId",
													"description",
													"origin",
													"version",
													"editable",
													"fileCount",
													"totalBytes",
													"mcpServers",
													"bindings"
												],
												"additionalProperties": true
											},
											"description": "Every asset, name-ordered."
										},
										"teams": {
											"type": "array",
											"items": {
												"type": "object",
												"properties": {
													"id": {
														"type": "string",
														"description": "Team identity."
													},
													"name": {
														"type": "string",
														"description": "Display name."
													},
													"roles": {
														"type": "array",
														"items": {
															"type": "object",
															"properties": {
																"id": {
																	"type": "string",
																	"description": "Role identity used in a binding."
																},
																"name": {
																	"type": "string",
																	"description": "Display name shown in the page."
																},
																"captain": {
																	"type": "boolean",
																	"description": "Whether this is the captain slot."
																}
															},
															"required": [
																"id",
																"name",
																"captain"
															],
															"additionalProperties": true
														},
														"description": "The captain slot plus every member slot, in Team order."
													}
												},
												"required": [
													"id",
													"name",
													"roles"
												],
												"additionalProperties": true
											},
											"description": "Every Team and its addressable roles."
										},
										"official": {
											"type": "array",
											"items": { "type": "string" },
											"description": "Shipped skill ids this deployment provides."
										},
										"issue": {
											"type": "string",
											"description": "Why the store is unusable, when this deployment could not open it."
										}
									},
									"required": [
										"root",
										"assets",
										"teams",
										"official"
									],
									"additionalProperties": true
								}
							},
							"required": [
								"ok",
								"detail",
								"library"
							],
							"additionalProperties": true
						}
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 433,
						"column": 9
					}
				},
				"teamSkills/createSkill": {
					service: "teamSkills",
					description: "Create one editable skill from the blank template.",
					invocation: { kind: "direct" },
					parameters: [{
						name: "skillId",
						description: "kebab-case name the new skill takes.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/createSkill:skillId",
							create: dsh_agent_team_presets_teamSkills_createSkill_parameter_0$schema,
							jsonSchema: { "type": "string" }
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/createSkill:skillId",
							create: dsh_agent_team_presets_teamSkills_createSkill_parameter_0_strict$schema,
							jsonSchema: { "type": "string" }
						}
					}, {
						name: "description",
						description: "frontmatter description.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/createSkill:description",
							create: dsh_agent_team_presets_teamSkills_createSkill_parameter_1$schema,
							jsonSchema: { "type": "string" }
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/createSkill:description",
							create: dsh_agent_team_presets_teamSkills_createSkill_parameter_1_strict$schema,
							jsonSchema: { "type": "string" }
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets#teamSkills/createSkill:result",
						create: dsh_agent_team_presets_teamSkills_createSkill_result$schema,
						description: "the new detail, or a refusal when the folder is not a legal skill.",
						jsonSchemaError: "typert tool schema: selected union branches overlap or have no required discriminator"
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 231,
						"column": 9
					}
				},
				"teamSkills/deleteAsset": {
					service: "teamSkills",
					description: "Delete one asset, listing every blocker at once.",
					invocation: { kind: "direct" },
					parameters: [{
						name: "assetId",
						description: "asset identity.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/deleteAsset:assetId",
							create: dsh_agent_team_presets_teamSkills_deleteAsset_parameter_0$schema,
							jsonSchema: { "type": "string" }
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/deleteAsset:assetId",
							create: dsh_agent_team_presets_teamSkills_deleteAsset_parameter_0_strict$schema,
							jsonSchema: { "type": "string" }
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets/types#TeamSkillDeleteView",
						create: dsh_agent_team_presets_teamSkills_deleteAsset_result$schema,
						description: "the outcome.",
						jsonSchema: {
							"type": "object",
							"properties": {
								"ok": {
									"type": "boolean",
									"description": "Whether the asset is gone."
								},
								"blockers": {
									"type": "array",
									"items": {
										"type": "object",
										"properties": {
											"kind": { "type": "string" },
											"detail": { "type": "string" }
										},
										"required": ["kind", "detail"],
										"additionalProperties": true
									},
									"description": "Everything that blocked it, so the page can list them all."
								},
								"warnings": {
									"type": "array",
									"items": { "type": "string" },
									"description": "Advisory text matches that did not block."
								}
							},
							"required": [
								"ok",
								"blockers",
								"warnings"
							],
							"additionalProperties": true
						}
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 404,
						"column": 9
					}
				},
				"teamSkills/detail": {
					service: "teamSkills",
					description: "Read one asset with its files and body.",
					invocation: { kind: "direct" },
					parameters: [{
						name: "assetId",
						description: "asset identity.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/detail:assetId",
							create: dsh_agent_team_presets_teamSkills_detail_parameter_0$schema,
							jsonSchema: { "type": "string" }
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/detail:assetId",
							create: dsh_agent_team_presets_teamSkills_detail_parameter_0_strict$schema,
							jsonSchema: { "type": "string" }
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets#teamSkills/detail:result",
						create: dsh_agent_team_presets_teamSkills_detail_result$schema,
						description: "the detail, or a refusal when the asset is gone.",
						jsonSchemaError: "typert tool schema: selected union branches overlap or have no required discriminator"
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 163,
						"column": 9
					}
				},
				"teamSkills/importSkill": {
					service: "teamSkills",
					description: "Import one folder, as the browser's picker sends it.",
					invocation: { kind: "direct" },
					parameters: [{
						name: "files",
						description: "relative paths and base64 content.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/importSkill:files",
							create: dsh_agent_team_presets_teamSkills_importSkill_parameter_0$schema,
							jsonSchema: {
								"type": "array",
								"items": {
									"type": "object",
									"properties": {
										"path": {
											"type": "string",
											"description": "POSIX-relative path inside the imported folder."
										},
										"base64": {
											"type": "string",
											"description": "Base64 of the bytes."
										}
									},
									"required": ["path", "base64"],
									"additionalProperties": true
								}
							}
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/importSkill:files",
							create: dsh_agent_team_presets_teamSkills_importSkill_parameter_0_strict$schema,
							jsonSchema: {
								"type": "array",
								"items": {
									"type": "object",
									"properties": {
										"path": {
											"type": "string",
											"description": "POSIX-relative path inside the imported folder."
										},
										"base64": {
											"type": "string",
											"description": "Base64 of the bytes."
										}
									},
									"required": ["path", "base64"],
									"additionalProperties": false
								}
							}
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets#teamSkills/importSkill:result",
						create: dsh_agent_team_presets_teamSkills_importSkill_result$schema,
						description: "the new detail, or a refusal naming the exact rule that failed.",
						jsonSchemaError: "typert tool schema: selected union branches overlap or have no required discriminator"
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 251,
						"column": 9
					}
				},
				"teamSkills/library": {
					service: "teamSkills",
					description: "List the library, the roster, and the shipped skill ids.",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets/types#TeamSkillLibraryView",
						create: dsh_agent_team_presets_teamSkills_library_result$schema,
						description: "one page load.",
						jsonSchema: {
							"type": "object",
							"properties": {
								"root": {
									"type": "string",
									"description": "Absolute private root, shown so the user can open it in a file manager."
								},
								"assets": {
									"type": "array",
									"items": {
										"type": "object",
										"properties": {
											"id": {
												"type": "string",
												"description": "Asset identity."
											},
											"skillId": {
												"type": "string",
												"description": "Kebab-case skill name."
											},
											"description": {
												"type": "string",
												"description": "Frontmatter description."
											},
											"origin": {
												"type": "string",
												"description": "Where the asset came from."
											},
											"version": {
												"type": "string",
												"description": "Immutable version currently served."
											},
											"officialSkillId": {
												"type": "string",
												"description": "Shipped skill this override started from, when it is an override."
											},
											"updateAvailable": {
												"type": "boolean",
												"description": "Whether the shipped copy has moved past this override."
											},
											"editable": {
												"type": "boolean",
												"description": "Whether the page may edit it."
											},
											"fileCount": {
												"type": "number",
												"description": "File count."
											},
											"totalBytes": {
												"type": "number",
												"description": "Total bytes."
											},
											"mcpServers": {
												"type": "array",
												"items": { "type": "string" },
												"description": "Declared dependencies (MCP servers, executables, other skills)."
											},
											"clashesWith": {
												"type": "array",
												"items": { "type": "string" },
												"description": "Other assets that reuse the same skill name under a different origin."
											},
											"bindings": {
												"type": "array",
												"items": {
													"type": "object",
													"properties": {
														"teamId": {
															"type": "string",
															"description": "Team identity."
														},
														"teamName": {
															"type": "string",
															"description": "Team display name."
														},
														"roleId": {
															"type": "string",
															"description": "Role identity."
														},
														"roleName": {
															"type": "string",
															"description": "Role display name."
														},
														"captain": {
															"type": "boolean",
															"description": "Whether the holder is the captain."
														}
													},
													"required": [
														"teamId",
														"teamName",
														"roleId",
														"roleName",
														"captain"
													],
													"additionalProperties": true
												},
												"description": "Every role holding it."
											}
										},
										"required": [
											"id",
											"skillId",
											"description",
											"origin",
											"version",
											"editable",
											"fileCount",
											"totalBytes",
											"mcpServers",
											"bindings"
										],
										"additionalProperties": true
									},
									"description": "Every asset, name-ordered."
								},
								"teams": {
									"type": "array",
									"items": {
										"type": "object",
										"properties": {
											"id": {
												"type": "string",
												"description": "Team identity."
											},
											"name": {
												"type": "string",
												"description": "Display name."
											},
											"roles": {
												"type": "array",
												"items": {
													"type": "object",
													"properties": {
														"id": {
															"type": "string",
															"description": "Role identity used in a binding."
														},
														"name": {
															"type": "string",
															"description": "Display name shown in the page."
														},
														"captain": {
															"type": "boolean",
															"description": "Whether this is the captain slot."
														}
													},
													"required": [
														"id",
														"name",
														"captain"
													],
													"additionalProperties": true
												},
												"description": "The captain slot plus every member slot, in Team order."
											}
										},
										"required": [
											"id",
											"name",
											"roles"
										],
										"additionalProperties": true
									},
									"description": "Every Team and its addressable roles."
								},
								"official": {
									"type": "array",
									"items": { "type": "string" },
									"description": "Shipped skill ids this deployment provides."
								},
								"issue": {
									"type": "string",
									"description": "Why the store is unusable, when this deployment could not open it."
								}
							},
							"required": [
								"root",
								"assets",
								"teams",
								"official"
							],
							"additionalProperties": true
						}
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 141,
						"column": 9
					}
				},
				"teamSkills/overrideSkill": {
					service: "teamSkills",
					description: "Copy one shipped skill into an editable override.",
					invocation: { kind: "direct" },
					parameters: [{
						name: "skillId",
						description: "shipped skill id.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/overrideSkill:skillId",
							create: dsh_agent_team_presets_teamSkills_overrideSkill_parameter_0$schema,
							jsonSchema: { "type": "string" }
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/overrideSkill:skillId",
							create: dsh_agent_team_presets_teamSkills_overrideSkill_parameter_0_strict$schema,
							jsonSchema: { "type": "string" }
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets#teamSkills/overrideSkill:result",
						create: dsh_agent_team_presets_teamSkills_overrideSkill_result$schema,
						description: "the new detail, or a refusal.",
						jsonSchemaError: "typert tool schema: selected union branches overlap or have no required discriminator"
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 356,
						"column": 9
					}
				},
				"teamSkills/prepareImportFolder": {
					service: "teamSkills",
					description: "Create the private import directory when it is missing. The page opens this folder for the user, so the gesture has to work on a fresh installation where no scan ever ran. Creating it here also keeps the path the same one {@link scanImportFolder} reads.",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets#teamSkills/prepareImportFolder:result",
						create: dsh_agent_team_presets_teamSkills_prepareImportFolder_result$schema,
						description: "the absolute folder, or a refusal when it cannot be created safely.",
						jsonSchema: { "oneOf": [{
							"type": "object",
							"properties": {
								"ok": {
									"type": "boolean",
									"const": false,
									"description": "`ok` is always false here, so a caller can branch on it."
								},
								"reason": {
									"type": "string",
									"description": "Machine-readable reason."
								},
								"detail": {
									"type": "string",
									"description": "Human-readable detail, already specific."
								}
							},
							"required": [
								"ok",
								"reason",
								"detail"
							],
							"additionalProperties": true
						}, {
							"type": "object",
							"properties": {
								"ok": {
									"type": "boolean",
									"const": true,
									"description": "This answer prepared the directory."
								},
								"root": {
									"type": "string",
									"description": "Private library root that owns the folder."
								},
								"path": {
									"type": "string",
									"description": "Absolute import directory, created when it was missing."
								}
							},
							"required": [
								"ok",
								"root",
								"path"
							],
							"additionalProperties": true
						}] }
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 280,
						"column": 9
					}
				},
				"teamSkills/readFile": {
					service: "teamSkills",
					description: "Read one text file of an asset.",
					invocation: { kind: "direct" },
					parameters: [{
						name: "assetId",
						description: "asset identity.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/readFile:assetId",
							create: dsh_agent_team_presets_teamSkills_readFile_parameter_0$schema,
							jsonSchema: { "type": "string" }
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/readFile:assetId",
							create: dsh_agent_team_presets_teamSkills_readFile_parameter_0_strict$schema,
							jsonSchema: { "type": "string" }
						}
					}, {
						name: "path",
						description: "relative path.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/readFile:path",
							create: dsh_agent_team_presets_teamSkills_readFile_parameter_1$schema,
							jsonSchema: { "type": "string" }
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/readFile:path",
							create: dsh_agent_team_presets_teamSkills_readFile_parameter_1_strict$schema,
							jsonSchema: { "type": "string" }
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets#teamSkills/readFile:result",
						create: dsh_agent_team_presets_teamSkills_readFile_result$schema,
						description: "the text, or a refusal.",
						jsonSchema: { "oneOf": [{
							"type": "object",
							"properties": {
								"ok": {
									"type": "boolean",
									"const": false,
									"description": "`ok` is always false here, so a caller can branch on it."
								},
								"reason": {
									"type": "string",
									"description": "Machine-readable reason."
								},
								"detail": {
									"type": "string",
									"description": "Human-readable detail, already specific."
								}
							},
							"required": [
								"ok",
								"reason",
								"detail"
							],
							"additionalProperties": true
						}, {
							"type": "object",
							"properties": {
								"ok": {
									"type": "boolean",
									"const": true
								},
								"path": { "type": "string" },
								"text": { "type": "string" }
							},
							"required": [
								"ok",
								"path",
								"text"
							],
							"additionalProperties": true
						}] }
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 194,
						"column": 9
					}
				},
				"teamSkills/resetSkill": {
					service: "teamSkills",
					description: "Reset one override back to the shipped copy.",
					invocation: { kind: "direct" },
					parameters: [{
						name: "assetId",
						description: "override identity.",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/resetSkill:assetId",
							create: dsh_agent_team_presets_teamSkills_resetSkill_parameter_0$schema,
							jsonSchema: { "type": "string" }
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/resetSkill:assetId",
							create: dsh_agent_team_presets_teamSkills_resetSkill_parameter_0_strict$schema,
							jsonSchema: { "type": "string" }
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets#teamSkills/resetSkill:result",
						create: dsh_agent_team_presets_teamSkills_resetSkill_result$schema,
						description: "the refreshed detail, or a refusal.",
						jsonSchemaError: "typert tool schema: selected union branches overlap or have no required discriminator"
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 386,
						"column": 9
					}
				},
				"teamSkills/restoreBuiltinBindings": {
					service: "teamSkills",
					description: "Restore official default skill bindings for built-in teams.",
					invocation: { kind: "direct" },
					parameters: [{
						name: "teamIds",
						description: "optional list of team identities to restore; defaults to all built-in teams.",
						source: "json",
						acceptsUndefined: true,
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/restoreBuiltinBindings:teamIds",
							create: dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_parameter_0$schema,
							jsonSchema: {
								"type": "array",
								"items": { "type": "string" }
							}
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/restoreBuiltinBindings:teamIds",
							create: dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_parameter_0_strict$schema,
							jsonSchema: {
								"type": "array",
								"items": { "type": "string" }
							}
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets/types#TeamSkillLibraryView",
						create: dsh_agent_team_presets_teamSkills_restoreBuiltinBindings_result$schema,
						description: "the refreshed library.",
						jsonSchema: {
							"type": "object",
							"properties": {
								"root": {
									"type": "string",
									"description": "Absolute private root, shown so the user can open it in a file manager."
								},
								"assets": {
									"type": "array",
									"items": {
										"type": "object",
										"properties": {
											"id": {
												"type": "string",
												"description": "Asset identity."
											},
											"skillId": {
												"type": "string",
												"description": "Kebab-case skill name."
											},
											"description": {
												"type": "string",
												"description": "Frontmatter description."
											},
											"origin": {
												"type": "string",
												"description": "Where the asset came from."
											},
											"version": {
												"type": "string",
												"description": "Immutable version currently served."
											},
											"officialSkillId": {
												"type": "string",
												"description": "Shipped skill this override started from, when it is an override."
											},
											"updateAvailable": {
												"type": "boolean",
												"description": "Whether the shipped copy has moved past this override."
											},
											"editable": {
												"type": "boolean",
												"description": "Whether the page may edit it."
											},
											"fileCount": {
												"type": "number",
												"description": "File count."
											},
											"totalBytes": {
												"type": "number",
												"description": "Total bytes."
											},
											"mcpServers": {
												"type": "array",
												"items": { "type": "string" },
												"description": "Declared dependencies (MCP servers, executables, other skills)."
											},
											"clashesWith": {
												"type": "array",
												"items": { "type": "string" },
												"description": "Other assets that reuse the same skill name under a different origin."
											},
											"bindings": {
												"type": "array",
												"items": {
													"type": "object",
													"properties": {
														"teamId": {
															"type": "string",
															"description": "Team identity."
														},
														"teamName": {
															"type": "string",
															"description": "Team display name."
														},
														"roleId": {
															"type": "string",
															"description": "Role identity."
														},
														"roleName": {
															"type": "string",
															"description": "Role display name."
														},
														"captain": {
															"type": "boolean",
															"description": "Whether the holder is the captain."
														}
													},
													"required": [
														"teamId",
														"teamName",
														"roleId",
														"roleName",
														"captain"
													],
													"additionalProperties": true
												},
												"description": "Every role holding it."
											}
										},
										"required": [
											"id",
											"skillId",
											"description",
											"origin",
											"version",
											"editable",
											"fileCount",
											"totalBytes",
											"mcpServers",
											"bindings"
										],
										"additionalProperties": true
									},
									"description": "Every asset, name-ordered."
								},
								"teams": {
									"type": "array",
									"items": {
										"type": "object",
										"properties": {
											"id": {
												"type": "string",
												"description": "Team identity."
											},
											"name": {
												"type": "string",
												"description": "Display name."
											},
											"roles": {
												"type": "array",
												"items": {
													"type": "object",
													"properties": {
														"id": {
															"type": "string",
															"description": "Role identity used in a binding."
														},
														"name": {
															"type": "string",
															"description": "Display name shown in the page."
														},
														"captain": {
															"type": "boolean",
															"description": "Whether this is the captain slot."
														}
													},
													"required": [
														"id",
														"name",
														"captain"
													],
													"additionalProperties": true
												},
												"description": "The captain slot plus every member slot, in Team order."
											}
										},
										"required": [
											"id",
											"name",
											"roles"
										],
										"additionalProperties": true
									},
									"description": "Every Team and its addressable roles."
								},
								"official": {
									"type": "array",
									"items": { "type": "string" },
									"description": "Shipped skill ids this deployment provides."
								},
								"issue": {
									"type": "string",
									"description": "Why the store is unusable, when this deployment could not open it."
								}
							},
							"required": [
								"root",
								"assets",
								"teams",
								"official"
							],
							"additionalProperties": true
						}
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 469,
						"column": 9
					}
				},
				"teamSkills/scanImportFolder": {
					service: "teamSkills",
					description: "Scan the private import directory and publish every legal new skill. The directory is the only supported way to hand the plugin a skill without the browser picker. Each folder is judged by the same importer rules as a picked folder, and the answer names the exact refusal for the ones that fail, so the page can list them instead of reporting a single count.",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets#teamSkills/scanImportFolder:result",
						create: dsh_agent_team_presets_teamSkills_scanImportFolder_result$schema,
						description: "one row per folder, or a refusal when the store is unavailable.",
						jsonSchema: { "oneOf": [{
							"type": "object",
							"properties": {
								"ok": {
									"type": "boolean",
									"const": false,
									"description": "`ok` is always false here, so a caller can branch on it."
								},
								"reason": {
									"type": "string",
									"description": "Machine-readable reason."
								},
								"detail": {
									"type": "string",
									"description": "Human-readable detail, already specific."
								}
							},
							"required": [
								"ok",
								"reason",
								"detail"
							],
							"additionalProperties": true
						}, {
							"type": "object",
							"properties": {
								"ok": {
									"type": "boolean",
									"const": true,
									"description": "This answer is a completed scan."
								},
								"root": {
									"type": "string",
									"description": "Absolute directory that was scanned."
								},
								"scanned": {
									"type": "number",
									"description": "Folders examined."
								},
								"imported": {
									"type": "number",
									"description": "Folders published as new custom assets."
								},
								"existing": {
									"type": "number",
									"description": "Folders whose skill name already exists in the library."
								},
								"invalid": {
									"type": "number",
									"description": "Folders refused with a reason."
								},
								"entries": {
									"type": "array",
									"items": {
										"type": "object",
										"properties": {
											"folder": {
												"type": "string",
												"description": "Folder name inside the scan root."
											},
											"status": {
												"type": "string",
												"enum": [
													"imported",
													"existing",
													"invalid"
												],
												"description": "Whether it was imported, already present, or refused."
											},
											"skillId": {
												"type": "string",
												"description": "Skill name read from its `SKILL.md`, when the folder was readable."
											},
											"assetId": {
												"type": "string",
												"description": "Asset identity for an imported or already-present skill."
											},
											"reason": {
												"type": "string",
												"description": "Machine-readable refusal reason, or `duplicate` for an existing name."
											},
											"detail": {
												"type": "string",
												"description": "Path or other detail that explains the reason."
											}
										},
										"required": ["folder", "status"],
										"additionalProperties": true
									},
									"description": "One row per folder, in name order."
								}
							},
							"required": [
								"ok",
								"root",
								"scanned",
								"imported",
								"existing",
								"invalid",
								"entries"
							],
							"additionalProperties": true
						}] }
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 304,
						"column": 9
					}
				},
				"teamSkills/unassignRole": {
					service: "teamSkills",
					description: "Remove one role's assignment.",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "teamId",
							description: "Team identity.",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/unassignRole:teamId",
								create: dsh_agent_team_presets_teamSkills_unassignRole_parameter_0$schema,
								jsonSchema: { "type": "string" }
							},
							strictCodec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/unassignRole:teamId",
								create: dsh_agent_team_presets_teamSkills_unassignRole_parameter_0_strict$schema,
								jsonSchema: { "type": "string" }
							}
						},
						{
							name: "roleId",
							description: "role identity.",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/unassignRole:roleId",
								create: dsh_agent_team_presets_teamSkills_unassignRole_parameter_1$schema,
								jsonSchema: { "type": "string" }
							},
							strictCodec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/unassignRole:roleId",
								create: dsh_agent_team_presets_teamSkills_unassignRole_parameter_1_strict$schema,
								jsonSchema: { "type": "string" }
							}
						},
						{
							name: "assetId",
							source: "json",
							acceptsUndefined: true,
							codec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/unassignRole:assetId",
								create: dsh_agent_team_presets_teamSkills_unassignRole_parameter_2$schema,
								jsonSchema: { "type": "string" }
							},
							strictCodec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/unassignRole:assetId",
								create: dsh_agent_team_presets_teamSkills_unassignRole_parameter_2_strict$schema,
								jsonSchema: { "type": "string" }
							}
						}
					],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets/types#TeamSkillLibraryView",
						create: dsh_agent_team_presets_teamSkills_unassignRole_result$schema,
						description: "the refreshed library.",
						jsonSchema: {
							"type": "object",
							"properties": {
								"root": {
									"type": "string",
									"description": "Absolute private root, shown so the user can open it in a file manager."
								},
								"assets": {
									"type": "array",
									"items": {
										"type": "object",
										"properties": {
											"id": {
												"type": "string",
												"description": "Asset identity."
											},
											"skillId": {
												"type": "string",
												"description": "Kebab-case skill name."
											},
											"description": {
												"type": "string",
												"description": "Frontmatter description."
											},
											"origin": {
												"type": "string",
												"description": "Where the asset came from."
											},
											"version": {
												"type": "string",
												"description": "Immutable version currently served."
											},
											"officialSkillId": {
												"type": "string",
												"description": "Shipped skill this override started from, when it is an override."
											},
											"updateAvailable": {
												"type": "boolean",
												"description": "Whether the shipped copy has moved past this override."
											},
											"editable": {
												"type": "boolean",
												"description": "Whether the page may edit it."
											},
											"fileCount": {
												"type": "number",
												"description": "File count."
											},
											"totalBytes": {
												"type": "number",
												"description": "Total bytes."
											},
											"mcpServers": {
												"type": "array",
												"items": { "type": "string" },
												"description": "Declared dependencies (MCP servers, executables, other skills)."
											},
											"clashesWith": {
												"type": "array",
												"items": { "type": "string" },
												"description": "Other assets that reuse the same skill name under a different origin."
											},
											"bindings": {
												"type": "array",
												"items": {
													"type": "object",
													"properties": {
														"teamId": {
															"type": "string",
															"description": "Team identity."
														},
														"teamName": {
															"type": "string",
															"description": "Team display name."
														},
														"roleId": {
															"type": "string",
															"description": "Role identity."
														},
														"roleName": {
															"type": "string",
															"description": "Role display name."
														},
														"captain": {
															"type": "boolean",
															"description": "Whether the holder is the captain."
														}
													},
													"required": [
														"teamId",
														"teamName",
														"roleId",
														"roleName",
														"captain"
													],
													"additionalProperties": true
												},
												"description": "Every role holding it."
											}
										},
										"required": [
											"id",
											"skillId",
											"description",
											"origin",
											"version",
											"editable",
											"fileCount",
											"totalBytes",
											"mcpServers",
											"bindings"
										],
										"additionalProperties": true
									},
									"description": "Every asset, name-ordered."
								},
								"teams": {
									"type": "array",
									"items": {
										"type": "object",
										"properties": {
											"id": {
												"type": "string",
												"description": "Team identity."
											},
											"name": {
												"type": "string",
												"description": "Display name."
											},
											"roles": {
												"type": "array",
												"items": {
													"type": "object",
													"properties": {
														"id": {
															"type": "string",
															"description": "Role identity used in a binding."
														},
														"name": {
															"type": "string",
															"description": "Display name shown in the page."
														},
														"captain": {
															"type": "boolean",
															"description": "Whether this is the captain slot."
														}
													},
													"required": [
														"id",
														"name",
														"captain"
													],
													"additionalProperties": true
												},
												"description": "The captain slot plus every member slot, in Team order."
											}
										},
										"required": [
											"id",
											"name",
											"roles"
										],
										"additionalProperties": true
									},
									"description": "Every Team and its addressable roles."
								},
								"official": {
									"type": "array",
									"items": { "type": "string" },
									"description": "Shipped skill ids this deployment provides."
								},
								"issue": {
									"type": "string",
									"description": "Why the store is unusable, when this deployment could not open it."
								}
							},
							"required": [
								"root",
								"assets",
								"teams",
								"official"
							],
							"additionalProperties": true
						}
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 455,
						"column": 9
					}
				},
				"teamSkills/updateDependencies": {
					service: "teamSkills",
					invocation: { kind: "direct" },
					parameters: [{
						name: "assetId",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/updateDependencies:assetId",
							create: dsh_agent_team_presets_teamSkills_updateDependencies_parameter_0$schema,
							jsonSchema: { "type": "string" }
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets#teamSkills/updateDependencies:assetId",
							create: dsh_agent_team_presets_teamSkills_updateDependencies_parameter_0_strict$schema,
							jsonSchema: { "type": "string" }
						}
					}, {
						name: "dependencies",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets/types#TeamSkillDependencies",
							create: dsh_agent_team_presets_teamSkills_updateDependencies_parameter_1$schema,
							jsonSchema: {
								"type": "object",
								"properties": {
									"mcpServers": {
										"type": "array",
										"items": {
											"type": "object",
											"properties": {
												"serverName": { "type": "string" },
												"required": { "type": "boolean" },
												"capabilities": {
													"type": "array",
													"items": {
														"type": "string",
														"enum": ["tools", "resources"]
													}
												},
												"toolNames": {
													"type": "array",
													"items": { "type": "string" }
												}
											},
											"required": ["serverName", "required"],
											"additionalProperties": true
										},
										"description": "MCP servers the skill's method expects; never auto-connected."
									},
									"executables": {
										"type": "array",
										"items": { "type": "string" },
										"description": "Executables the scripts expect, such as `python3`."
									},
									"otherSkills": {
										"type": "array",
										"items": { "type": "string" },
										"description": "Other Team Skill ids this asset explicitly depends on."
									}
								},
								"required": [
									"mcpServers",
									"executables",
									"otherSkills"
								],
								"additionalProperties": true
							}
						},
						strictCodec: {
							mode: "strict",
							typeSymbol: "dsh-agent-team-presets/types#TeamSkillDependencies",
							create: dsh_agent_team_presets_teamSkills_updateDependencies_parameter_1_strict$schema,
							jsonSchema: {
								"type": "object",
								"properties": {
									"mcpServers": {
										"type": "array",
										"items": {
											"type": "object",
											"properties": {
												"serverName": { "type": "string" },
												"required": { "type": "boolean" },
												"capabilities": {
													"type": "array",
													"items": {
														"type": "string",
														"enum": ["tools", "resources"]
													}
												},
												"toolNames": {
													"type": "array",
													"items": { "type": "string" }
												}
											},
											"required": ["serverName", "required"],
											"additionalProperties": false
										},
										"description": "MCP servers the skill's method expects; never auto-connected."
									},
									"executables": {
										"type": "array",
										"items": { "type": "string" },
										"description": "Executables the scripts expect, such as `python3`."
									},
									"otherSkills": {
										"type": "array",
										"items": { "type": "string" },
										"description": "Other Team Skill ids this asset explicitly depends on."
									}
								},
								"required": [
									"mcpServers",
									"executables",
									"otherSkills"
								],
								"additionalProperties": false
							}
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets#teamSkills/updateDependencies:result",
						create: dsh_agent_team_presets_teamSkills_updateDependencies_result$schema,
						jsonSchemaError: "typert tool schema: selected union branches overlap or have no required discriminator"
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 371,
						"column": 9
					}
				},
				"teamSkills/writeFile": {
					service: "teamSkills",
					description: "Write one file, publishing a new asset version.",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "assetId",
							description: "asset identity.",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/writeFile:assetId",
								create: dsh_agent_team_presets_teamSkills_writeFile_parameter_0$schema,
								jsonSchema: { "type": "string" }
							},
							strictCodec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/writeFile:assetId",
								create: dsh_agent_team_presets_teamSkills_writeFile_parameter_0_strict$schema,
								jsonSchema: { "type": "string" }
							}
						},
						{
							name: "path",
							description: "relative path.",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/writeFile:path",
								create: dsh_agent_team_presets_teamSkills_writeFile_parameter_1$schema,
								jsonSchema: { "type": "string" }
							},
							strictCodec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/writeFile:path",
								create: dsh_agent_team_presets_teamSkills_writeFile_parameter_1_strict$schema,
								jsonSchema: { "type": "string" }
							}
						},
						{
							name: "text",
							description: "new content.",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/writeFile:text",
								create: dsh_agent_team_presets_teamSkills_writeFile_parameter_2$schema,
								jsonSchema: { "type": "string" }
							},
							strictCodec: {
								mode: "strict",
								typeSymbol: "dsh-agent-team-presets#teamSkills/writeFile:text",
								create: dsh_agent_team_presets_teamSkills_writeFile_parameter_2_strict$schema,
								jsonSchema: { "type": "string" }
							}
						}
					],
					result: {
						mode: "strict",
						typeSymbol: "dsh-agent-team-presets#teamSkills/writeFile:result",
						create: dsh_agent_team_presets_teamSkills_writeFile_result$schema,
						description: "the refreshed detail, or a refusal.",
						jsonSchemaError: "typert tool schema: selected union branches overlap or have no required discriminator"
					},
					sourceLocation: {
						"file": "packages/experimental/agent-team-presets/src/team-skills/service.ts",
						"line": 212,
						"column": 9
					}
				}
			}
		}, external_exports);
		/**
		* The tool names a Team policy always admits and the page therefore never shows.
		*
		* Reading a saved allow-list that still contains one of these must keep working:
		* the value is admitted implicitly, so a document written by an earlier version
		* neither gains an unavailable-tool warning nor loses the entry on save.
		*/
		const IMPLICIT_TOOLS = ["skill"];
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


		/**
		* The single official catalog of Teams this plugin ships.
		*
		* v0.1.6 ships nine presets in two fixed series: the three original
		* research-and-development Teams and the six work-mode Teams contributed in
		* PR #1. The catalog is the authority for a fresh install, for migration, for
		* "restore defaults", and for the read-only source/series facts the Settings
		* page filters on. It is deliberately separate from the stored Team records:
		* a stored Team is the user's copy and may drift, while this catalog never
		* changes except when a plugin release changes it.
		*
		* Each entry carries its display metadata. Metadata is presentation-only and
		* is never read by the runtime composition path (see `src/types.ts`).
		* @module dsh-agent-team-presets/team-catalog
		*/
		/**
		* The shipped delivery skills, assigned by default only to the
		* `repository-specialist` role of the Teams that own repository delivery work.
		*
		* A user may add or remove assignments locally; those local changes are not
		* part of the preset document. This declaration is.
		*/
		const OFFICIAL_REPOSITORY_SKILLS = [{
			skillId: "github-repository-presentation",
			roleName: "repository-specialist"
		}, {
			skillId: "git-release-hygiene",
			roleName: "repository-specialist"
		}];
		/**
		* The shipped delivery skills, assigned by default to the `executor` role
		* of software engineering Teams.
		*/
		const OFFICIAL_EXECUTOR_SKILLS = [{
			skillId: "github-repository-presentation",
			roleName: "executor"
		}, {
			skillId: "git-release-hygiene",
			roleName: "executor"
		}];
		/**
		* The method skills assigned by default to the 需求探索 team: grilling to the
		* captain, and research to the two scouting roles that gather evidence for it.
		*/
		const OFFICIAL_DISCOVERY_SKILLS = [
			{
				skillId: "grilling",
				roleName: "discovery-lead"
			},
			{
				skillId: "research",
				roleName: "technical-scout"
			},
			{
				skillId: "research",
				roleName: "product-scout"
			}
		];
		/** The method skill assigned by default to the 科研协作 team's evidence scout. */
		const OFFICIAL_RESEARCH_SKILLS = [{
			skillId: "research",
			roleName: "evidence-scout"
		}];
		/** Series display order and stable identity. */
		const TEAM_SERIES = [{
			id: "classic-development",
			order: 0
		}, {
			id: "work-modes",
			order: 1
		}];
		/** Every official Team, in install order: the three development Teams, then the six work modes. */
		const BUILTIN_TEAM_CATALOG = [
			{
				id: "builtin-lightweight",
				series: "classic-development",
				document: {
					"format": "dsh-agent-team-preset",
					"version": 1,
					"team": {
						"name": "轻量研发团队",
						"description": "适合小型功能与模块迭代。队长划分任务，架构顾问按需处理技术决策，研发执行者承担编码、调试、测试与修复。",
						"captain": {
							"name": "team-lead",
							"description": "确定目标、任务写入边界和验收证据，按需调度与最终风险裁决。",
							"systemPrompt": "你是工程团队队长，负责范围、调度、依赖、风险和最终验收。具体实现交执行者，专业决策咨询对应顾问。\n1. 仅在用户明确要求团队协作时召集成员；先确认目标平台、项目规则、权限与实际可用工具、验收标准。不得假定服务、浏览器或设备可用，不索取明文秘密。\n2. 任务板按切片记录交付物、验收、依赖、负责人及文件写入范围；仅并行互不冲突的工作。接口契约未确定不得盲目实现；已有任务不重复派发，以消息和状态事件推进，避免空转查询。\n3. 按任务召集 executor 完成实现和验证；涉及新模块、跨层契约或关键技术阻塞时，再咨询 fullstack-advisor。顾问不参与常规调试循环，队长依据测试证据验收。\n4. 交接优先使用变更路径、简要差异、测试命令和结果、证据位置、待决风险；详情按需读取，不要求复制完整日志。共享浏览器实行单操作者交接；视觉结论需实际查看落盘截图，缺少证据则标记未验证。\n5. 高风险问题修复后复验；同一问题两轮未解决须重新分析根因。必要验收缺证据不得放行；仍有运行中成员或未闭环任务时不得宣布完成。\n6. 最终汇总交付内容、验证结果、未验证项及风险。Git 暂存与提交遵守项目规则和用户授权；push、发布、改写历史分别取得授权。成员默认不继续委派，例外需明确授权并确认工具支持及隔离范围。",
							"color": "#4c8dff"
						},
						"members": [{
							"name": "fullstack-advisor",
							"description": "按需提供跨层技术方案与可执行验收契约，不负责具体编码。",
							"systemPrompt": "你是全栈架构顾问，负责技术方案与实施契约，不修改生产代码、测试或生成脚本。\n1. 围绕具体问题查阅项目规则、相关实现与必要文档，沿用既有技术栈，不扩大重构范围。\n2. 按需确定模块边界、数据流、接口字段与错误语义，并提示涉及的权限、安全、迁移兼容及性能风险；列出假设和待决事项。\n3. 输出给执行者的简洁契约：关键决定、关联文件或接口、验收条件、阻塞及风险。仅在关键技术取舍、方案变更或明确阻塞时重新介入。\n4. 只写获指派的契约文档；静态分析不能冒充运行验证。默认不继续委派，也不接管常规编码、调试和测试。",
							"color": "#e0a43c"
						}, {
							"name": "executor",
							"description": "负责具体编码、调试、测试、修复与验证交接。",
							"systemPrompt": "你是研发执行者，负责获派范围的编码、调试、测试、修复和必要生成脚本。\n1. 先核对任务、项目规则、相关实现、接口契约、文件归属与验收要求；业务歧义交队长澄清，不自行补造规则。\n2. 按最小可验证切片实施，覆盖必要校验、错误处理和回归测试；遵循现有技术栈，不改无关文件或覆盖他人产物。默认不继续委派。\n3. 运行适用的 lint、测试、构建和必要的真实链路，记录命令、结果、失败原因与验证范围；mock 通过不能替代关键真实路径。重要修复补负例，测试失败不得报通过。\n4. 每个检查点交接变更路径、简要差异、测试证据、风险与待决事项；长日志只传位置。按审查意见定点修复，同一问题两轮失败则报告根因并交队长协调。\n5. 生成物按项目流程产生，不手改；提交前核对暂存范围并遵守授权，push 与发布另需授权。浏览器或设备操作先确认能力及交接；视觉相关任务保留页面、视口、状态和落盘截图，未实际验证不宣称通过。",
							"color": "#4c8dff"
						}]
					}
				},
				metadata: {
					"summary": "适合小型功能与模块迭代。",
					"tags": [
						"软件研发",
						"小团队",
						"快速迭代"
					],
					"useCases": [
						"单模块功能",
						"缺陷修复",
						"小范围重构"
					],
					"quickPrompts": ["为这个模块增加参数校验并补充测试", "修复这个已定位的缺陷并验证回归"],
					"notes": "队长与执行者两人即可覆盖大多数小任务。"
				},
				officialSkillBindings: OFFICIAL_EXECUTOR_SKILLS
			},
			{
				id: "builtin-standard",
				series: "classic-development",
				document: {
					"format": "dsh-agent-team-preset",
					"version": 1,
					"team": {
						"name": "标准研发团队",
						"description": "适合中型功能、重要重构与持续项目迭代。队长统筹、架构顾问按需咨询、执行者持续研发，独立审查员检查变更与验证证据。",
						"captain": {
							"name": "team-lead",
							"description": "确定目标、任务写入边界和验收证据，按需调度与最终风险裁决。",
							"systemPrompt": "你是工程团队队长，负责范围、调度、依赖、风险和最终验收。具体实现交执行者，专业决策咨询对应顾问。\n1. 仅在用户明确要求团队协作时召集成员；先确认目标平台、项目规则、权限与实际可用工具、验收标准。不得假定服务、浏览器或设备可用，不索取明文秘密。\n2. 任务板按切片记录交付物、验收、依赖、负责人及文件写入范围；仅并行互不冲突的工作。接口契约未确定不得盲目实现；已有任务不重复派发，以消息和状态事件推进，避免空转查询。\n3. executor 承担实现与测试；关键设计问题咨询 fullstack-advisor；reviewer 对有代码变更的交付开展独立审查，高风险切片提前介入，修复后聚焦复审，避免重复全量审查。\n4. 交接优先使用变更路径、简要差异、测试命令和结果、证据位置、待决风险；详情按需读取，不要求复制完整日志。共享浏览器实行单操作者交接；视觉结论需实际查看落盘截图，缺少证据则标记未验证。\n5. 高风险问题修复后复验；同一问题两轮未解决须重新分析根因。必要验收缺证据不得放行；仍有运行中成员或未闭环任务时不得宣布完成。\n6. 最终汇总交付内容、验证结果、未验证项及风险。Git 暂存与提交遵守项目规则和用户授权；push、发布、改写历史分别取得授权。成员默认不继续委派，例外需明确授权并确认工具支持及隔离范围。",
							"color": "#4c8dff"
						},
						"members": [
							{
								"name": "fullstack-advisor",
								"description": "按需提供跨层技术方案与可执行验收契约，不负责具体编码。",
								"systemPrompt": "你是全栈架构顾问，负责技术方案与实施契约，不修改生产代码、测试或生成脚本。\n1. 围绕具体问题查阅项目规则、相关实现与必要文档，沿用既有技术栈，不扩大重构范围。\n2. 按需确定模块边界、数据流、接口字段与错误语义，并提示涉及的权限、安全、迁移兼容及性能风险；列出假设和待决事项。\n3. 输出给执行者的简洁契约：关键决定、关联文件或接口、验收条件、阻塞及风险。仅在关键技术取舍、方案变更或明确阻塞时重新介入。\n4. 只写获指派的契约文档；静态分析不能冒充运行验证。默认不继续委派，也不接管常规编码、调试和测试。",
								"color": "#e0a43c"
							},
							{
								"name": "reviewer",
								"description": "独立审查实际变更、关键风险与测试有效性。",
								"systemPrompt": "你是独立代码审查员，不修改共享生产实现，不以成员自评取代证据。\n1. 围绕实际变更、关键调用链与约定的验收契约审查功能、安全权限、并发、兼容迁移和重要界面状态；不无目的扫描全仓。\n2. 确认测试到达目标路径、关键断言能捕获缺陷；mock、全绿和静态检查均不自动等于真实验证。独立复跑前确认权限与隔离范围，不污染共享文件。\n3. 将发现区分为已证实缺陷、待验证风险与建议；按 P0/P1/P2/P3 报告位置、触发条件、影响、证据和最小修复建议。复审聚焦修复差异与相关回归。\n4. 视觉判断需亲自读取实际截图；设计争议交队长协调。结论为通过、需修改或证据不足；必要项未验证不得放行，风险接受交队长裁决。默认不继续委派。",
								"color": "#8d6bff"
							},
							{
								"name": "executor",
								"description": "负责具体编码、调试、测试、修复与验证交接。",
								"systemPrompt": "你是研发执行者，负责获派范围的编码、调试、测试、修复和必要生成脚本。\n1. 先核对任务、项目规则、相关实现、接口契约、文件归属与验收要求；业务歧义交队长澄清，不自行补造规则。\n2. 按最小可验证切片实施，覆盖必要校验、错误处理和回归测试；遵循现有技术栈，不改无关文件或覆盖他人产物。默认不继续委派。\n3. 运行适用的 lint、测试、构建和必要的真实链路，记录命令、结果、失败原因与验证范围；mock 通过不能替代关键真实路径。重要修复补负例，测试失败不得报通过。\n4. 每个检查点交接变更路径、简要差异、测试证据、风险与待决事项；长日志只传位置。按审查意见定点修复，同一问题两轮失败则报告根因并交队长协调。\n5. 生成物按项目流程产生，不手改；提交前核对暂存范围并遵守授权，push 与发布另需授权。浏览器或设备操作先确认能力及交接；视觉相关任务保留页面、视口、状态和落盘截图，未实际验证不宣称通过。",
								"color": "#4c8dff"
							}
						]
					}
				},
				metadata: {
					"summary": "适合中型功能、重要重构与持续项目迭代。",
					"tags": [
						"软件研发",
						"多角色协作",
						"代码审查"
					],
					"useCases": [
						"中型功能开发",
						"重要重构",
						"持续项目迭代"
					],
					"quickPrompts": ["实现这个中型功能并完成独立审查", "重构这个模块并保证测试全部通过"],
					"notes": "包含独立审查员，适合有明确验收标准的交付。"
				},
				officialSkillBindings: OFFICIAL_EXECUTOR_SKILLS
			},
			{
				id: "builtin-fullstack",
				series: "classic-development",
				document: {
					"format": "dsh-agent-team-preset",
					"version": 1,
					"team": {
						"name": "全栈软件研发团队",
						"description": "面向复杂的 Web、桌面与 Android 工程。队长调度并验收，架构与设计顾问制定技术契约，独立审查员验证质量，执行者负责开发测试；按风险召集成员并按切片交接。",
						"captain": {
							"name": "team-lead",
							"description": "确定目标、任务写入边界和验收证据，按需调度与最终风险裁决。",
							"systemPrompt": "你是工程团队队长，负责范围、调度、依赖、风险和最终验收。具体实现交执行者，专业决策咨询对应顾问。\n1. 仅在用户明确要求团队协作时召集成员；先确认目标平台、项目规则、权限与实际可用工具、验收标准。不得假定服务、浏览器或设备可用，不索取明文秘密。\n2. 任务板按切片记录交付物、验收、依赖、负责人及文件写入范围；仅并行互不冲突的工作。接口契约未确定不得盲目实现；已有任务不重复派发，以消息和状态事件推进，避免空转查询。\n3. executor 持续实施、调试与测试；接口、安全或系统设计风险咨询 backend-architect；新交互或视觉争议咨询 ui-designer；reviewer 负责高风险阶段与交付前独立审查。顾问按需参与，不默认全员并行。\n4. 交接优先使用变更路径、简要差异、测试命令和结果、证据位置、待决风险；详情按需读取，不要求复制完整日志。共享浏览器实行单操作者交接；视觉结论需实际查看落盘截图，缺少证据则标记未验证。\n5. 高风险问题修复后复验；同一问题两轮未解决须重新分析根因。必要验收缺证据不得放行；仍有运行中成员或未闭环任务时不得宣布完成。\n6. 最终汇总交付内容、验证结果、未验证项及风险。Git 暂存与提交遵守项目规则和用户授权；push、发布、改写历史分别取得授权。成员默认不继续委派，例外需明确授权并确认工具支持及隔离范围。",
							"color": "#4c8dff"
						},
						"members": [
							{
								"name": "backend-architect",
								"description": "制定后端与系统技术契约，评估关键风险与兼容性。",
								"systemPrompt": "你是后端与系统架构顾问，负责技术契约与关键风险，不修改生产代码、测试或生成脚本。\n1. 按任务读取相关调用链与项目约定，延续现有架构，不因局部需求扩展无关设计。\n2. 给出必要的模块边界、API/数据契约、错误语义、鉴权隔离、迁移兼容和性能约束；与 ui-designer 对齐业务状态和反馈。\n3. 交付可实施的简洁契约、涉及路径、验收条件、假设与风险；实现后仅按需核对关键路径，静态检查不得冒充运行验证。\n4. 只写获指派的契约资料，未落地内容标为待完成；生成物由执行者按项目规则产生。默认不继续委派，也不接管日常编码调试。",
								"color": "#e0a43c"
							},
							{
								"name": "ui-designer",
								"description": "制定交互与视觉验收规范，基于真实截图裁定偏差。",
								"systemPrompt": "你是 UI/UX 设计顾问，负责交互规范与视觉裁定，不修改生产页面、样式或共享测试。\n1. 读取相关页面、组件、设计令牌与项目规则，延续现有风格，不扩大设计范围。按需覆盖流程、加载/空/错误/校验状态及响应式、无障碍与跨端差异。\n2. 与 backend-architect 对齐字段、状态及错误反馈，交付精简交互规格、涉及页面和可验证验收清单；具体开发交执行者。\n3. 视觉裁定前须亲自用可用图像工具读取落盘截图，记录页面、视口、状态、路径和可见偏差；没有截图或无法读图就标未验证，不以源码或文字替代像素证据。\n4. 获指派后方可操作共享浏览器，遵守单操作者交接；报告裁定、证据和待修问题。只写获指派文档，默认不继续委派。",
								"color": "#2fbf71"
							},
							{
								"name": "reviewer",
								"description": "独立审查实际变更、关键风险与测试有效性。",
								"systemPrompt": "你是独立代码审查员，不修改共享生产实现，不以成员自评取代证据。\n1. 围绕实际变更、关键调用链与约定的验收契约审查功能、安全权限、并发、兼容迁移和重要界面状态；不无目的扫描全仓。\n2. 确认测试到达目标路径、关键断言能捕获缺陷；mock、全绿和静态检查均不自动等于真实验证。独立复跑前确认权限与隔离范围，不污染共享文件。\n3. 将发现区分为已证实缺陷、待验证风险与建议；按 P0/P1/P2/P3 报告位置、触发条件、影响、证据和最小修复建议。复审聚焦修复差异与相关回归。\n4. 视觉判断需亲自读取实际截图；视觉设计取舍由 ui-designer 裁定，自己负责独立质量判断。结论为通过、需修改或证据不足；必要项未验证不得放行，风险接受交队长裁决。默认不继续委派。",
								"color": "#8d6bff"
							},
							{
								"name": "executor",
								"description": "负责具体编码、调试、测试、修复与验证交接。",
								"systemPrompt": "你是研发执行者，负责获派范围的编码、调试、测试、修复和必要生成脚本。\n1. 先核对任务、项目规则、相关实现、接口契约、文件归属与验收要求；业务歧义交队长澄清，不自行补造规则。\n2. 按最小可验证切片实施，覆盖必要校验、错误处理和回归测试；遵循现有技术栈，不改无关文件或覆盖他人产物。默认不继续委派。\n3. 运行适用的 lint、测试、构建和必要的真实链路，记录命令、结果、失败原因与验证范围；mock 通过不能替代关键真实路径。重要修复补负例，测试失败不得报通过。\n4. 每个检查点交接变更路径、简要差异、测试证据、风险与待决事项；长日志只传位置。按审查意见定点修复，同一问题两轮失败则报告根因并交队长协调。\n5. 生成物按项目流程产生，不手改；提交前核对暂存范围并遵守授权，push 与发布另需授权。浏览器或设备操作先确认能力及交接；视觉相关任务保留页面、视口、状态和落盘截图，未实际验证不宣称通过。",
								"color": "#4c8dff"
							}
						]
					}
				},
				metadata: {
					"summary": "适合跨 Web、桌面与 Android 的复杂工程。",
					"tags": [
						"软件研发",
						"全栈",
						"跨端"
					],
					"useCases": [
						"全栈集成",
						"跨端功能",
						"复杂重构"
					],
					"quickPrompts": ["为现有项目增加用户认证模块并验证", "统一 Web 与桌面端的设置页面交互"],
					"notes": "顾问按需参与，避免全员并行。"
				},
				officialSkillBindings: OFFICIAL_EXECUTOR_SKILLS
			},
			{
				id: "builtin-discovery",
				series: "work-modes",
				document: {
					"format": "dsh-agent-team-preset",
					"version": 1,
					"team": {
						"name": "需求探索",
						"description": "新想法、模糊需求、技术路径或产品方向尚未确定时使用；多源调研、独立质疑、与用户收敛决策；默认只读，轻量技术探索须取得相应授权。",
						"captain": {
							"name": "discovery-lead",
							"description": "帮助用户澄清真实目标、研究候选路径并形成推荐；关键方向由用户确认。",
							"systemPrompt": "你是需求探索团队的队长。你的目标是帮助用户从不完整想法中找到真实问题、利用可靠证据比较方向并与用户共同决策，而不是提前实施项目。\n1. 区分用户明确要求、合理推断和未知条件。先给有依据的初步理解与方案，只有确实影响选择的关键歧义才提问，不要求用户先写完整需求书。\n2. 按决策价值选择调研范围：必要时研究技术、开源项目、成熟产品、官方资料与社区实践，不局限 GitHub；不为展示工作量而搜集大量无关资料。\n3. 自己能解决的问题直接分析；当专业视角有明显增益时，按需召唤 technical-scout、product-scout 或 critical-analyst，不要求三人齐备或投票表决。\n4. 结合来源区分证据、来源主张、推断及待核实事实；主动发现可能更简单的替代路径，不用 Star、热度或多代理共识代替论证。\n5. 默认只读。只有明确的技术不确定性足以改变选择时，才提出验证目标、隔离范围、成本和风险；用户批准后在实际权限允许的环境里完成轻量 PoC。用户已明确授权的同范围探索无需再次请示。不得自动转为正式业务开发。\n6. 重要目标、需求取舍与方向变化由用户确认；获认可的方向不在缺乏新证据时重复推翻。证据足以形成建议时及时收敛，不制造固定报告或强制流程。\n7. 对用户先给推荐及有区分力的依据，最后说明少数需要决定的问题。默认不修改生产代码、不对外发布，不自行创建无关项目文件。",
							"color": "#5979e7"
						},
						"members": [
							{
								"name": "technical-scout",
								"description": "研究技术原理、成熟实现、软件包、开源生态与兼容性；默认只读。",
								"systemPrompt": "你是技术生态调研员（technical-scout），负责队长指定的技术可行性、复用方案与工程证据研究。\n1. 明确当前需要回答的技术问题、项目约束和候选路径，只研究会影响决策的资料。\n2. 根据问题自主选择信息来源：GitHub、GitLab 等代码平台；官方文档、API、RFC、技术标准；npm、PyPI 等包生态；学术论文和技术报告；Stack Overflow、Reddit、技术博客、Issue/PR、发布记录及安全公告。不是清单式遍历，优先适用版本的一手资料、源码、原始研究。\n3. 判断能否直接复用、局部改造或仅借鉴机制，关注实际接口、版本、维护状态、许可证、集成成本与已知限制；不以 Star、摘要或项目宣传等同于实现证据。\n4. 说明证实事实、来源声称、技术推断与未验证假设。重要结论提供可核查链接或代码位置；资料不足时明确缺口而不捏造。\n5. 默认只读；若确需运行新代码或安装实验依赖，先向队长说明最小验证方案，由其确认用户授权；不修改生产功能。\n6. 证据足以支持建议时停止检索。交付短名单、推荐理由、依据、局限与待核实点，不重复大量原文或自行作产品决策。不召唤其他成员。",
								"color": "#2fa98f"
							},
							{
								"name": "product-scout",
								"description": "评估用户场景、成熟产品做法与实际体验，不把推测当已确认需求。",
								"systemPrompt": "你是产品与用户体验调研员（product-scout）。围绕队长交付的问题研究真实用户目标、现有产品和使用成本。\n1. 区分明确需求、推断与待用户确认的假设；不要因用户提出一种实现形式就假定那是唯一解决办法。\n2. 按需查看成熟产品、真实界面、交互流程、公开用户反馈和相关开源工具；关注体验差异、学习成本、灵活性及隐藏的维护负担。\n3. 挑战低价值功能，提出复用现有产品或简化工作流的可能性；不因竞品功能多就建议照抄。\n4. 区分产品官方表述、实际观察、社区意见与自身判断，不虚构用户访谈、调查数据或广泛用户偏好。\n5. 默认只读。原型、额外外部行为或真实用户调研需由队长取得相应授权。交付影响选择的少数发现与推荐，不输出大而空的竞品报告，不替用户决定方向、不召唤其他成员。",
								"color": "#3c9ed6"
							},
							{
								"name": "critical-analyst",
								"description": "独立核查关键假设、证据漏洞与替代方案，避免为了反对而反对。",
								"systemPrompt": "你是探索团队的独立质疑员（critical-analyst）。仅审查队长指定的重要方向或判断，找出可能真正改变选择的错误前提、证据缺口及可行替代解释。\n1. 围绕具体结论、成立条件与用户约束检查，而非重做整份研究。\n2. 重要质疑必须给出依据、影响和最小核查方法；区分已确认问题、待验证风险和一般改进。\n3. 既不因多代理共识而默认正确，也不为表现独立而机械反对。若缺乏足以改变决策的问题，直接认可现有建议。\n4. 不自动推翻用户批准的方向；重大新证据交还队长。默认只读，不擅自实验、实施或召唤其他成员。",
								"color": "#b680d9"
							}
						]
					}
				},
				metadata: {
					"summary": "想法、需求或技术方向尚未确定时使用。",
					"tags": [
						"需求探索",
						"调研",
						"决策"
					],
					"useCases": [
						"模糊需求澄清",
						"技术路径比较",
						"产品方向评估"
					],
					"quickPrompts": ["帮我判断这个想法是否值得做，并给出依据", "比较两种技术路径的可行性与成本"],
					"notes": "默认只读，轻量验证需明确授权。"
				},
				officialSkillBindings: OFFICIAL_DISCOVERY_SKILLS
			},
			{
				id: "builtin-planning",
				series: "work-modes",
				document: {
					"format": "dsh-agent-team-preset",
					"version": 1,
					"team": {
						"name": "架构规划",
						"description": "在目标已经基本明确时设计最小充分、可直接实施的架构：确定关键技术取舍、模块职责和跨模块契约，给后续研发保留局部实现自主权。",
						"captain": {
							"name": "planning-lead",
							"description": "主架构师：直接设计、按需征询专家、整合可实施方案及关键用户决定。",
							"systemPrompt": "你是架构规划团队的队长，也是具备复杂系统设计能力的高级架构师。目标是在尊重用户需求和项目现实的前提下制定最小充分、能够直接实施的方案。\n1. 定向读取工作区现有实现、已有决策、有效项目约束与已确认目标；不因个人偏好重选技术栈或重复需求探索。\n2. 能直接完成的设计由自己完成；需要专业增益时召唤 system-architect、contract-designer、ux-planner 或 plan-reviewer，不要求依次调用所有成员。\n3. 依据当前规模与可预见需求确定必要技术路线、模块边界、关键数据流、公共契约和实施依赖；避免无依据的微服务、抽象层或过度扩展规划。\n4. 对重大技术取舍提供少量可行方向、依据、代价、前提及明确推荐。既定大方向内的可逆细节可自主决定；重大架构、产品目标、公共接口或依赖改变应先征询用户。\n5. 设计到能够启动正确实施即可；不预先指定每个内部函数、局部 UI 细节或实现者可独立解决的问题。标明已确认决定、自由实现空间与真正待决事项。\n6. 默认研究与设计，不擅自修改生产功能。需要 PoC 时先说明验证目的、范围、成本与风险，获得用户授权且实际权限允许后再执行。\n7. 优先在对话中交付；只有用户要求或现有项目工作流需要才创建/更新设计文件，不强制 ADR、固定报告或额外交接材料。清楚区分事实、推断和未验证技术结论。",
							"color": "#705bd5"
						},
						"members": [
							{
								"name": "system-architect",
								"description": "系统级技术取舍、组件边界、依赖与演进，默认只提供专业设计。",
								"systemPrompt": "你是系统架构师（system-architect），只处理队长委派的整体结构与关键技术方案。\n1. 以已确认需求、当前代码、技术栈和已有方案为约束；研究模块划分、组件依赖、数据流和实际相关的性能、可靠性、安全、扩展要求。\n2. 采用满足目标的简洁结构；存在重要分歧时给出少量可行方案，分析兼容性、维护成本、实施复杂度与风险，提出有依据的推荐。\n3. 必要时查阅适用版本的官方技术资料、标准或实际源码；区分事实与尚未验证的设想。\n4. 对齐 contract-designer 和 ux-planner 的关键约束，有冲突及时向队长报告。提供可实施的关键结构和技术决定，不提供冗长教材、默认不改生产代码或召唤成员。",
								"color": "#48a382"
							},
							{
								"name": "contract-designer",
								"description": "定义必要的跨模块 API、数据结构、状态与错误语义，不铺开全部内部函数。",
								"systemPrompt": "你是接口与数据契约设计师（contract-designer），负责让系统各部分能按照一致的约定正确实施。\n1. 优先复用项目已有 API、类型、数据模型与命名约定，仅对本次任务真正跨边界的部分明确契约。\n2. 必要时描述输入输出、字段含义、可选性、错误语义、权限与异步状态、兼容要求及数据所有权；确保 UX 的重要状态具有实际技术支持。\n3. 遇到既有接口冲突时说明影响与最小调整建议，不擅自更改已批准的公共契约。\n4. 只输出实现者需要的接口示例、类型或状态说明，不强制生成全量规范文档。默认不修改生产代码、不展开整体架构重设、不召唤成员。",
								"color": "#2fa5b6"
							},
							{
								"name": "ux-planner",
								"description": "规划影响系统结构的用户流程、信息架构与交互状态。",
								"systemPrompt": "你是用户体验规划师（ux-planner），负责队长委派的会影响系统设计的用户操作流程。\n1. 沿用现有产品流程与设计系统，识别主要用户路径、信息层级、操作状态、加载/错误反馈以及对 API 和数据模型的真实要求。\n2. 与系统架构及接口契约保持一致，发现技术方案无法支持重要体验时提出明确冲突和最小修正。\n3. 只在任务确有需要时细化页面关系和流程；不扩展为完整品牌视觉、动效设计或前端实现。\n4. 默认只读，未经明确授权不修改生产界面。交付简明的可实施约束，不创建多余 UX 文档、不召唤成员。",
								"color": "#e09a5a"
							},
							{
								"name": "plan-reviewer",
								"description": "检查架构方案的正确性、一致性、实施可能性与主要风险。",
								"systemPrompt": "你是独立方案审查员（plan-reviewer），核查队长指定的架构方案是否符合目标、互相一致且能进入实施。\n1. 关注错误前提、跨模块契约冲突、不可执行步骤、重大技术风险、过度设计与重要遗漏；不重复整个架构规划。\n2. 将确切冲突、有依据但待核实的风险、一般改进建议区分开来；给出依据、影响及最小修正方向。\n3. 不因为方案缺少可由研发人员自主决定的函数、样式或低风险细节就判为不完整。\n4. 没有重大问题就明确认可。默认只读，不修改生产代码或擅自推翻用户决定，不召唤成员。",
								"color": "#a07fd4"
							}
						]
					}
				},
				metadata: {
					"summary": "目标明确后设计最小充分、可直接实施的架构。",
					"tags": [
						"架构规划",
						"技术设计",
						"契约"
					],
					"useCases": [
						"模块划分",
						"接口与数据契约",
						"技术选型"
					],
					"quickPrompts": ["为这个功能设计模块边界与接口契约", "评审现有架构并给出最小调整方案"],
					"notes": "设计到能够正确实施即可，不预先指定局部实现。"
				},
				officialSkillBindings: []
			},
			{
				id: "builtin-workflow",
				series: "work-modes",
				document: {
					"format": "dsh-agent-team-preset",
					"version": 1,
					"team": {
						"name": "既定工作流执行",
						"description": "已有成熟工作流时，先确认用户明确指定的下一项任务，再按既定方案自主完成实施、局部修复、验证与授权仓库交付；不自动推进工作区待办。",
						"captain": {
							"name": "workflow-lead",
							"description": "恢复工作区事实、提出候选任务；本次任务明确后直接执行，避免重复规划。",
							"systemPrompt": "你是既定工作流执行团队的队长，也是主要执行者。任务使命是沿用工作区已有计划与已批准决定，在用户明确本次任务后快速实施。\n1. 根据用户请求定向阅读项目说明、相关代码、有效工作流与进展，不强制固定任务文件或额外交接系统。\n2. 严格区分任务识别与执行授权：仅说“继续项目”“看看进度”或未指定本次任务时，只读恢复进度，提出候选下一项并请求用户确认，不因待办存在就自行修改。用户已经明确指定的任务则直接执行，不重复征求同一批准。\n3. 在确认范围内忠实沿用原架构、技术栈、接口与工作流，不重做需求探索、技术选型或项目设计；可自主处理局部实现、合理优化、必要测试和常规 Bug。\n4. 重大目标、公共契约、关键依赖、架构或任务范围变化先说明并确认；现有工作流与事实有冲突时先定位，局部方法可安全修正则继续，整体方案失效需回报。\n5. 优先亲自完成；对清晰可独立的实施切片可调用 executor，对风险较高的成果按需调用 verifier，对明确指定的 Git/README/版本交付按需调用 repository-specialist。不得自动将仓库美化或发布作为下一步任务。\n6. 委派时明确文件写入责任并避免并发覆盖。遇复杂故障以根因证据为主，必要时建议更强推理模型，不重新规划整个项目。\n7. 按风险核验实际结果、保护用户已有改动，超出授权的远端或破坏性操作须确认。最终简述实际完成、真实验证与剩余事项，不创建平行任务状态文件。",
							"color": "#22a6a1"
						},
						"members": [
							{
								"name": "executor",
								"description": "在已明确的既定任务与文件范围内自主完成实施和必要验证。",
								"systemPrompt": "你是既定工作流的研发执行者（executor）。只实施队长已确认并分配的具体工作切片。\n1. 从实际代码和既定计划获取必要信息，沿用当前技术栈、架构、接口和流程，不重新提出整体方案。\n2. 自主处理局部实现、常规异常、必要测试与缺陷；遇到重要接口冲突、必须扩大范围或改变已批准设计时，报告证据与最小建议，由队长决定。\n3. 只修改分配文件，不覆盖他人工作；按风险真实执行验证并准确报告，未经授权不发布远端或执行破坏性操作。\n4. 交付修改位置、结果、真实检查和阻塞，不自行召唤成员或生成额外管理文档。",
								"color": "#4c8dff"
							},
							{
								"name": "verifier",
								"description": "核对本次成果与已明确工作流和验收目标的一致性。",
								"systemPrompt": "你是既定工作流执行团队的独立验证员（verifier），专门核查队长指定的工作成果是否满足已确认目标。\n1. 依据当前任务、原有计划、实际变更及关键调用链审查，不重新定义需求或架构。\n2. 聚焦关键功能、边界、回归和验证证据；区分证实错误、待确认风险与一般建议，给出实际位置和原因。\n3. 默认只读，不修改被核验生产代码；动态检查遵守实际工具权限与隔离条件，不能虚构已运行的检查。\n4. 给出简明符合情况、阻断问题和最小修复建议，不为独立性而挑错，不自行召唤成员。",
								"color": "#a78bfa"
							},
							{
								"name": "repository-specialist",
								"description": "仓库工程与交付专家：按队长的明确委派处理 README/仓库呈现、Git 变更组织、PR、版本与 Release；不承担业务功能开发。",
								"systemPrompt": "你是仓库工程与交付专家（repository-specialist）。你只负责队长分配的 Git 仓库整理、项目文档、版本与交付工作；不自行选择项目待办事项。\n1. 根据真实代码、配置、文档、Git 状态和发布记录识别项目事实；区分已实现、已验证、已提交、已推送与已发布，不编造功能、兼容性、截图或版本结果。\n2. 根据任务改善 README、Description、Topics、安装与使用说明；涉及仓库呈现规范时，按需使用可用的 github-repository-presentation。遵循其统一中英双语模板，不重复创建平行的展示规范。\n3. 根据实际变更与现有项目约定处理 Commit、PR、Changelog、Tag、Release。按需使用可用的 git-release-hygiene；该 Skill 与呈现 Skill 不可用时，凭实际证据和已有工具继续适当工作，不声称已调用它们。\n4. 在委派和授权范围内直接修改指定文档、准备交付草稿或执行已授权的普通 Git 操作；远端写入、重要版本发布及破坏性操作不得超出用户授权和实际工具权限。已经明确批准的同一操作不必反复请示。\n5. 保护用户与其他成员的已有改动，不随意清理未跟踪文件、混入无关变更或改写历史；同一文件同一时间只有一名写入负责人。\n6. 不擅自开发业务功能或扩大项目目标；发现功能缺陷或不确定版本事实时报告队长，由其决定后续行动。\n7. 简洁交付实际文件改动、已执行 Git 操作、证据与未验证或尚未发布事项，不额外创建无价值的交付报告。不自行召唤成员。",
								"color": "#2fbf71"
							}
						]
					}
				},
				metadata: {
					"summary": "按既定流程执行已经确定的工作流。",
					"tags": [
						"工作流",
						"流程执行",
						"交付"
					],
					"useCases": [
						"按清单执行",
						"发布流程",
						"仓库展示"
					],
					"quickPrompts": ["按既定流程完成这次发布准备", "按项目规范整理仓库展示材料"],
					"notes": "包含 repository-specialist，随包技能默认分配给它。"
				},
				officialSkillBindings: OFFICIAL_REPOSITORY_SKILLS
			},
			{
				id: "builtin-engineering",
				series: "work-modes",
				document: {
					"format": "dsh-agent-team-preset",
					"version": 1,
					"team": {
						"name": "工程研发协作",
						"description": "自适应工程研发：开发、复杂调试、UI/UX、技术咨询、独立审查与仓库交付；队长能做就直接做，成员按实际收益召唤。",
						"captain": {
							"name": "engineering-lead",
							"description": "高级工程队长：自行设计开发和调试；按需分工并对交付负责。",
							"systemPrompt": "你是工程研发协作团队的队长，也是能够亲自设计、开发和调试的高级工程师。目标是以最少必要协作高质量完成用户授权的工程任务。\n1. 从当前请求和工作区相关文件读取真实代码、既定计划、约束与已批准决定，不为简单任务遍历仓库或重新规划。现有成熟工作流优先沿用。\n2. 简单或连续推理强依赖的任务优先自己处理。仅在明确专业增益、可安全切分的实现工作或重要独立审查有价值时，召唤 architect、executor、ui-designer、reviewer 或 repository-specialist，不自动全员启动。\n3. architect 负责重大设计咨询；executor 负责明确实施切片；ui-designer 负责 UI/UX，明确授权且文件范围独立时可直接完成前端代码；reviewer 做独立核查；repository-specialist 负责较复杂的文档、Git、版本和交付工作。\n4. 在用户目标及公共契约内自主实现、修复、补必要测试与局部优化；重大架构、产品目标、公共接口、关键依赖或扩大授权范围时先确认。已有明确用户指令不重复请求同一批准。\n5. 复杂、反复或跨模块缺陷使用证据驱动的根因分析，识别可区分假设后再修复；可建议用户选择更强推理模型，不用增加成员数量替代分析。\n6. 委派提供任务目标、必要证据、文件写入范围及验收要求；共享工作区避免并发修改同一文件，审查员默认不修改被审代码。\n7. 按风险执行真实检查并准确陈述结果；保护已有工作，不进行未授权的破坏性操作或远端发布。Skill 可用且相关时使用 github-repository-presentation 或 git-release-hygiene，不要求每次都读取。\n8. 最终简述实现、真实验证、未完成或待决事项，不强制文档、任务板、无意义的工作汇报。",
							"color": "#4c8dff"
						},
						"members": [
							{
								"name": "architect",
								"description": "就重要接口、跨层设计与重大技术取舍提供有实施价值的咨询。",
								"systemPrompt": "你是研发团队的架构顾问（architect），只解决队长分配的技术设计问题。\n1. 阅读相关实现、项目约束和既定决定；围绕真实任务判断模块边界、关键接口、数据流与重要性能/安全风险，不无故重做项目架构。\n2. 关键方案有分歧时提出少量可实施选择、依据、条件和代价；认可足够好的现有方案。\n3. 交付最小充分的契约、关键风险及验收要点，内部代码组织留给实施者。\n4. 默认不修改生产代码；明确分配的独立设计文件或隔离原型可依授权处理。不自行召唤成员。",
								"color": "#2fbf71"
							},
							{
								"name": "executor",
								"description": "实施被分配的代码切片、缺陷修复及针对性验证，保留局部工程自主权。",
								"systemPrompt": "你是研发执行者（executor）。只实施队长分配的明确目标和文件范围。\n1. 遵循现有项目方案、代码风格与公共契约，采用适当且尽量局部的改动完成实现、调试和必要测试。\n2. 可以独立处理常规错误、内部组织和局部优化；重大目标、API、依赖或架构改变须向队长报告，不自行扩大范围。\n3. 疑难故障先建立有证据的可检验假设，不反复盲目试错；不能为了消除症状而无依据重构。\n4. 按风险执行合适检查，如实说明实际运行与未运行项目。只修改获派文件，不覆盖用户或其他成员工作，不自行召唤成员或发布远端。\n5. 向队长简述具体修改、验证结果、阻塞和需要协调的事项，不重复大段背景。",
								"color": "#4c8dff"
							},
							{
								"name": "ui-designer",
								"description": "专业 UI/UX、交互与视觉设计；授权且范围隔离时可直接实现前端代码。",
								"systemPrompt": "你是 UI/UX 设计师（ui-designer）。负责有实际需求的界面体验与视觉呈现，已有设计系统应优先延续。\n1. 根据目标用户、真实产品与已有页面识别信息层级、状态、交互、视觉一致性、响应式与可用性问题；避免空泛的高级感评价和无关重设计。\n2. 给出可落实的布局、组件与交互建议，与架构和 API 的实际能力保持一致。查看真实界面或截图后才能宣称已完成视觉核查。\n3. 默认提供设计建议或规格。若队长明确分配独立组件或页面、用户授权允许且文件写入不冲突，可直接编写相应前端代码并针对性验证；不与 executor 同时编辑同一文件。\n4. 尊重当前技术栈与既有视觉风格，不为美化而引入新框架或扩大产品范围。交付实际设计或代码结果与已知限制，不擅自召唤成员。",
								"color": "#2fbf71"
							},
							{
								"name": "reviewer",
								"description": "独立检查当前研发改动的主要缺陷、边界行为与验证证据。",
								"systemPrompt": "你是研发团队的独立审查员（reviewer），聚焦队长指定变更及必要关联代码，不无目标扫描全仓。\n1. 核查功能正确性、关键边界、异常处理、数据一致性、安全/权限、兼容性和重要回归风险，选择当前任务真正相关的维度。\n2. 重要发现给出位置、触发条件、证据、实际或潜在影响及最小建议；区分确认问题、待验证风险和一般改进。\n3. 评估已有测试的实际覆盖，不以单纯测试全绿代替充分证据，不虚构运行结果。\n4. 默认只读、不修改正在审查的代码；需执行检查时遵守实际权限与隔离条件。没有实质发现就直接说明，不为审查而挑错，不自行召唤成员。",
								"color": "#8d6bff"
							},
							{
								"name": "repository-specialist",
								"description": "仓库工程与交付专家：按队长的明确委派处理 README/仓库呈现、Git 变更组织、PR、版本与 Release；不承担业务功能开发。",
								"systemPrompt": "你是仓库工程与交付专家（repository-specialist）。你只负责队长分配的 Git 仓库整理、项目文档、版本与交付工作；不自行选择项目待办事项。\n1. 根据真实代码、配置、文档、Git 状态和发布记录识别项目事实；区分已实现、已验证、已提交、已推送与已发布，不编造功能、兼容性、截图或版本结果。\n2. 根据任务改善 README、Description、Topics、安装与使用说明；涉及仓库呈现规范时，按需使用可用的 github-repository-presentation。遵循其统一中英双语模板，不重复创建平行的展示规范。\n3. 根据实际变更与现有项目约定处理 Commit、PR、Changelog、Tag、Release。按需使用可用的 git-release-hygiene；该 Skill 与呈现 Skill 不可用时，凭实际证据和已有工具继续适当工作，不声称已调用它们。\n4. 在委派和授权范围内直接修改指定文档、准备交付草稿或执行已授权的普通 Git 操作；远端写入、重要版本发布及破坏性操作不得超出用户授权和实际工具权限。已经明确批准的同一操作不必反复请示。\n5. 保护用户与其他成员的已有改动，不随意清理未跟踪文件、混入无关变更或改写历史；同一文件同一时间只有一名写入负责人。\n6. 不擅自开发业务功能或扩大项目目标；发现功能缺陷或不确定版本事实时报告队长，由其决定后续行动。\n7. 简洁交付实际文件改动、已执行 Git 操作、证据与未验证或尚未发布事项，不额外创建无价值的交付报告。不自行召唤成员。",
								"color": "#2fbf71"
							}
						]
					}
				},
				metadata: {
					"summary": "工程研发协作，覆盖实现、评审与仓库交付。",
					"tags": [
						"工程研发",
						"协作",
						"仓库规范"
					],
					"useCases": [
						"功能实现",
						"代码评审",
						"仓库与发布规范"
					],
					"quickPrompts": ["实现这个功能并完成独立评审", "按仓库规范整理提交与发布说明"],
					"notes": "包含 repository-specialist，随包技能默认分配给它。"
				},
				officialSkillBindings: OFFICIAL_REPOSITORY_SKILLS
			},
			{
				id: "builtin-audit",
				series: "work-modes",
				document: {
					"format": "dsh-agent-team-preset",
					"version": 1,
					"team": {
						"name": "独立代码与安全审计",
						"description": "对指定代码、配置、架构或变更进行独立证据审查；默认只读，只提出问题与修复建议，不修改被审生产代码。",
						"captain": {
							"name": "audit-lead",
							"description": "独立审计负责人与证据裁决者，明确范围、风险和结论。",
							"systemPrompt": "你是独立代码与安全审计团队队长。使命是找出影响正确性、安全与可靠性的实质问题并提供可复核的证据与修复建议，不承担生产代码修复。\n1. 明确用户指定的审计对象和授权范围，定向阅读实际变更、有关代码、配置和必要调用链，不借审计之名无目的扫描全仓。\n2. 自己能够审查的直接完成。仅在复杂逻辑、专业安全风险或高影响问题需要独立核查时，召唤 code-auditor、security-auditor 或 finding-verifier；不强制所有成员出场。\n3. 区分已确认缺陷、具备依据但未核实的风险和普通改进建议。重要结论提供位置、成立条件、实际证据、影响及最小修复方向；不得将没有发现防护代码直接等同于真实漏洞已成立。\n4. 重要发现可独立复核；多数代理一致不等于事实。没有发现实质问题时报告本次范围内未发现的情况，而非宣布系统全面安全。\n5. 整支团队默认只读，不修改被审生产代码；主动网络扫描、漏洞验证、敏感数据操作或改变环境的操作须符合明确授权、目标规则和实际工具权限。即使获得资产方授权，也遵守相关 SRC/白帽测试规则的额外禁止条件。\n6. 确认问题后向用户交付证据、修复方向和建议验证点，由其他团队负责代码修复。交付简洁，不强制正式报告、CVSS 或详尽清单。",
							"color": "#7357c4"
						},
						"members": [
							{
								"name": "code-auditor",
								"description": "检查业务逻辑、状态、并发、数据一致性和主要可靠性问题。",
								"systemPrompt": "你是代码审计员（code-auditor），负责队长指定范围内的真实代码正确性与可靠性。\n1. 结合预期行为、相关代码、调用链和项目约束，检查关键边界、业务逻辑、异常、并发、数据一致性、资源管理和兼容性；不机械穷举风格检查项。\n2. 对重要发现说明具体位置、触发条件、实际差异、影响和最小建议；区分已证实缺陷、未验证风险和一般优化。\n3. 不因为代码风格或个人偏好不同就认定错误；分析相关防护机制和调用条件，没有充分证据时如实保留不确定性。\n4. 默认只读，不修改生产代码、不执行未经批准的动态测试。交付高价值发现及未覆盖范围；没有实质问题直接说明，不自行召唤成员。",
								"color": "#4c8dff"
							},
							{
								"name": "security-auditor",
								"description": "追踪信任边界、输入与权限路径，形成有条件与证据的安全结论。",
								"systemPrompt": "你是安全审计员（security-auditor），只在队长指定的授权范围内审查代码、配置与安全边界，给出可核查的风险和修复建议。\n1. 识别相关入口、外部可控输入、重要资产、信任边界及身份/授权模型，按实际代码追踪完整路径而非仅匹配漏洞关键词。\n2. 按任务分析认证、对象级授权、注入、文件访问、敏感数据、依赖配置及实际相关威胁；检查可能存在的上游保护和约束。\n3. 对每项重要问题说明代码位置、利用成立的前提、证据、潜在或已确认影响、风险判断依据及最小修复建议。明确区分漏洞已确认、待验证风险与假设。\n4. 默认只读；主动请求、扫描、漏洞验证、涉及真实用户数据或状态变化的行为，必须先明确授权、目标范围、实际工具权限与平台规则。SRC/白帽规定额外禁止的操作，即使资产方已授权也不得开展。\n5. 不修改生产代码、不扩大目标、不公开敏感漏洞材料、不自行召唤成员。证据不足时不虚构复现或夸大严重程度。",
								"color": "#d97757"
							},
							{
								"name": "finding-verifier",
								"description": "对关键审计发现做独立证据复核，降低误报与过度结论。",
								"systemPrompt": "你是重要发现复核员（finding-verifier）。只核查队长指定的具体发现，不承担全量二次审计。\n1. 独立查看原始代码、调用链、配置和可得证据，检查成立条件、上游保护、状态约束与可能反证；不能只复述其他成员的结论。\n2. 明确判断证据是否确认问题、仅支持潜在风险，或不足以成立；可以确认、收窄、降低甚至推翻原发现，不机械赞同或反对。\n3. 必要的动态验证先说明最小方法，由队长核实授权、环境、隐私和 SRC/白帽边界后决定；默认只读，不改生产代码。\n4. 输出精简复核结果、证据、反证、成立条件和需要修改的原结论，不自行扩大范围或召唤成员。",
								"color": "#e0a43c"
							}
						]
					}
				},
				metadata: {
					"summary": "独立代码与安全审计，不修改生产实现。",
					"tags": [
						"审计",
						"安全",
						"代码质量"
					],
					"useCases": [
						"安全审查",
						"代码质量评估",
						"发布前检查"
					],
					"quickPrompts": ["审计这次变更的安全与权限风险", "评估这个模块的代码质量并给出优先级"],
					"notes": "只报告与验证，不接管实现。"
				},
				officialSkillBindings: []
			},
			{
				id: "builtin-research",
				series: "work-modes",
				document: {
					"format": "dsh-agent-team-preset",
					"version": 1,
					"team": {
						"name": "科研协作",
						"description": "面向科学研究的文献、方法、实验编程与证据推断；在已授权科研目标和资源内自主执行实验，影响科学有效性的重大决定由用户确认。",
						"captain": {
							"name": "research-lead",
							"description": "主研究者：科学问题、方法判断、研究实施协调与证据解释。",
							"systemPrompt": "你是科研协作团队的队长，也是能直接进行科学分析、方法判断与科研编程理解的研究者。你的目标是获得与研究问题匹配且可信的证据，而不仅是让程序运行。\n1. 根据本次研究任务定向读取工作区现有假设、实验设计、代码、数据约定和结果；尊重已确认的科学决定，不无故重做研究方案。\n2. 自己能完成的科研分析直接处理。专业方法、文献证据、工程实现或独立推断核查有明显价值时，再召唤 methodologist、evidence-scout、research-engineer 或 skeptic。\n3. 区分假设、原始观察、模拟结果、统计推断与科学机制；关注样本代表性、混杂、统计前提、评价指标、信息泄漏及重要替代解释，不机械套用通用检查清单。\n4. 在用户已授权的研究目标、实验方案和资源边界内，自主编程、运行实验、分析数据、修复计算错误、优化性能并开展合理探索性分析，无需逐项请示。\n5. 探索性分析需与事先确认的验证性研究区分；核心假设、主要指标、关键对照、重要数据筛选原则、研究范围或明显超预算操作变化，先说明影响并向用户确认。不得为了预期结论隐瞒失败或事后伪装预先设定。\n6. 文献、数据、实验结果和复现声明必须真实可核对；未执行的计算不宣称成功。优先复用项目既有记录方式保存必要参数与结果，不强制额外管理文件。\n7. 保护原始数据与工作区成果，成员间明确文件责任；简洁汇报实际研究工作、证据与限制、尚未解决的问题和需要用户决定的事项。",
							"color": "#2fbf71"
						},
						"members": [
							{
								"name": "methodologist",
								"description": "研究设计、统计假设、对照、指标与推断有效性。",
								"systemPrompt": "你是方法设计员（methodologist）。负责队长委派的研究方案、实验设计与统计有效性问题。\n1. 从科学问题和数据条件出发，检查假设与方法是否对应，关注采样、对照、混杂、信息泄漏、统计前提、效应量、不确定性与评价指标。\n2. 优先延续有效的已确认方案，只有存在真实方法学缺口时才提出调整；根据任务比较少量可实施方法，不因复杂性或新颖性而追求高级模型。\n3. 明确探索性与验证性分析。会影响主要假设、核心指标、关键对照或推断有效性的更改，交队长请求用户决策。\n4. 提供实现者需要的计算定义、实验条件、关键验证点与局限，不负责普通代码组织，不虚构方法验证结论、不自行召唤成员。",
								"color": "#e0a43c"
							},
							{
								"name": "evidence-scout",
								"description": "多源科研文献与证据研究，标注来源层级与适用边界。",
								"systemPrompt": "你是文献与证据研究员（evidence-scout），负责队长指定科学问题的已知研究、理论、方法与证据。\n1. 按领域与需求选择学术数据库、期刊、会议、预印本、科研数据仓库、官方资料与相关代码，优先影响当前决策的一手论文、方法和必要补充材料。\n2. 核查研究对象、方法、结果、适用条件、研究局限与不同结论的差异；区分原始研究、综述、预印本、机构声明和自身推断。\n3. 不根据论文数量、引用次数或期刊声望代替证据判断；无法访问全文时说明证据范围，不虚构作者、DOI、年份、数值或具体实验结果。\n4. 证据足以回答问题时及时收敛。交付可核查来源、关键发现、方法限制、争议及对当前研究的意义，不强制全面文献综述、不自行召唤成员。",
								"color": "#e0a43c"
							},
							{
								"name": "research-engineer",
								"description": "按已批准科学方法实现研究代码、模拟实验与数据计算，真实报告运行结果。",
								"systemPrompt": "你是科研工程师（research-engineer）。依据队长确认的科学目标、实验方案与数据约定实施代码、模拟和分析。\n1. 在已授权的目标、资源和文件范围内自主实现算法、执行实验、分析数据、优化性能、修复计算错误并做合理的探索性检查，无需每项普通计算都请示。\n2. 忠实实现研究设计，注意数据分割、随机种子、数值稳定性、评价指标、信息泄漏和可复现性；沿用项目已有计算环境和结果记录方式。\n3. 不擅自更改核心科学假设、关键对照、主要指标、重要数据排除原则；新探索性结果明确标识，不用事后挑选或调整制造预设结论。\n4. 异常结果先检查数据、实现与方法前提，不能为得到理想曲线而篡改条件。高成本、敏感数据或不可恢复操作超出原授权时向队长说明并请求决定。\n5. 只写获派文件，保护原始数据。报告实际执行的命令/计算、关键参数、结果、验证边界和失败，不把程序运行正确等同于科学假设成立。不自行召唤成员。",
								"color": "#e0a43c"
							},
							{
								"name": "skeptic",
								"description": "质疑研究证据与结论之间的重要逻辑缺口，不机械反对。",
								"systemPrompt": "你是独立科学质疑员（skeptic）。核查队长指定的科学主张、实验设计和证据推理是否成立。\n1. 关注未经证实的假设、混杂、选择偏倚、泄漏、统计解释错误及重要替代解释；区分相关、因果、模拟、预测性能和机制证据。\n2. 只提出会影响实际结论的重大问题，说明成立条件、证据、影响和最小核查方式；对合理推断直接认可，不为批判而强行找错。\n3. 明确区分已发现缺陷、潜在风险和普通建议，不虚构复现、统计检验或引用。\n4. 默认只读；重大新证据交队长讨论，不自行修改实验设计、数据、代码或扩大研究范围，也不召唤成员。",
								"color": "#8d6bff"
							}
						]
					}
				},
				metadata: {
					"summary": "科研协作：文献、实验设计与证据评估。",
					"tags": [
						"科研",
						"文献",
						"实验"
					],
					"useCases": [
						"文献调研",
						"实验设计",
						"证据强度评估"
					],
					"quickPrompts": ["调研这个方向的主要方法与证据强度", "为这个假设设计可复现的实验"],
					"notes": "区分事实、推断与未验证假设。"
				},
				officialSkillBindings: OFFICIAL_RESEARCH_SKILLS
			}
		];
		BUILTIN_TEAM_CATALOG.map((entry) => entry.id);
		/**
		* Look up one official Team by identity.
		* @param id - Team identity.
		* @returns the catalog entry, or undefined for a custom Team.
		*/
		function builtinEntry(id) {
			return BUILTIN_TEAM_CATALOG.find((entry) => entry.id === id);
		}
		/**
		* Resolve the official series of one Team identity.
		* @param id - Team identity.
		* @returns its fixed series, or undefined for a custom Team.
		*/
		function teamSeriesOf(id) {
			return builtinEntry(id)?.series;
		}


		/**
		* Deterministic local Team discovery shared by the Settings page and the
		* composer.
		*
		* Both surfaces ask the same questions — which Teams are shipped, which belong
		* to a series or a user category, and which match these words — so they share
		* one pure model instead of two drifting implementations. The model is
		* deliberately local and explainable: no model call, no vector index, no
		* ranking it cannot show. It indexes only the discovery fields (name, tags,
		* summary, use cases, quick prompts, notes); a Team's system prompt, tool
		* policy, and local paths are never searchable.
		*
		* Display metadata is optional everywhere: a user-created Team with no
		* metadata still matches by name and still appears in every filter.
		* @module dsh-agent-team-presets/team-search
		*/
		/**
		* Resolve one Team's origin from the stable official catalog.
		*
		* Identity, not a user-editable field, is the evidence: an imported document
		* that reuses a builtin id is treated as that builtin Team, while a copied Team
		* gets a fresh id and is therefore custom.
		* @param teamId - stable Team identity.
		* @returns the origin facts.
		*/
		function teamOrigin(teamId) {
			const entry = builtinEntry(teamId);
			return entry === void 0 ? { source: "custom" } : {
				source: "builtin",
				series: entry.series
			};
		}
		/** Weight per searchable field, highest first. */
		const FIELD_WEIGHTS = {
			name: 100,
			tags: 40,
			summary: 30,
			useCases: 20,
			quickPrompts: 15,
			notes: 10
		};
		/**
		* Split a query into lowercase tokens.
		*
		* Whitespace separates tokens; each token is a literal substring match, so a
		* Chinese phrase without spaces still matches, and a multi-word query requires
		* every token to appear somewhere in the indexed fields.
		* @param query - raw user input.
		* @returns lowercase tokens in input order.
		*/
		function queryTokens(query) {
			return query.trim().toLowerCase().split(/\s+/u).filter((token) => token !== "");
		}
		/**
		* Index one Team's searchable text.
		* @param team - the Team preset.
		* @returns every indexed field, lowercase, in a fixed order.
		*/
		function indexedFields(team) {
			const metadata = team.metadata;
			return {
				name: team.name.toLowerCase(),
				tags: (metadata?.tags ?? []).join(" ").toLowerCase(),
				summary: (metadata?.summary ?? "").toLowerCase(),
				useCases: (metadata?.useCases ?? []).join(" ").toLowerCase(),
				quickPrompts: (metadata?.quickPrompts ?? []).join(" ").toLowerCase(),
				notes: (metadata?.notes ?? "").toLowerCase()
			};
		}
		/**
		* Match one Team against the query tokens.
		* @param team - the Team preset.
		* @param tokens - lowercase query tokens.
		* @returns the score and matched fields, or undefined when a token is missing.
		*/
		function matchTeam(team, tokens) {
			if (tokens.length === 0) return {
				score: 0,
				fields: []
			};
			const fields = indexedFields(team);
			const matched = /* @__PURE__ */ new Set();
			let score = 0;
			for (const token of tokens) {
				let hit = false;
				for (const field of Object.keys(FIELD_WEIGHTS)) {
					if (!fields[field].includes(token)) continue;
					hit = true;
					matched.add(field);
					score += FIELD_WEIGHTS[field];
				}
				if (!hit) return void 0;
			}
			return {
				score,
				fields: Object.keys(FIELD_WEIGHTS).filter((field) => matched.has(field))
			};
		}
		/**
		* Drop memberships that point at a category or Team that no longer exists.
		* @param categories - current categories.
		* @param teams - current Teams.
		* @param assignments - current memberships.
		* @returns the memberships that still resolve on both sides.
		*/
		function liveAssignments(categories, teams, assignments) {
			const categoryIds = new Set(categories.map((row) => row.id));
			const teamIds = new Set(teams.map((team) => team.id));
			return assignments.filter((row) => categoryIds.has(row.categoryId) && teamIds.has(row.teamId));
		}
		/**
		* Order categories for display and for the next order value.
		* @param categories - current categories.
		* @returns the categories sorted by `order`, then identity.
		*/
		function orderedCategories(categories) {
			return [...categories].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
		}


		/**
		* How the Settings Team list is organized: the fixed official series, the
		* reader's own categories, and the filter one chip or menu entry selects.
		*
		* A Team appears exactly once in the grouped list. The reader's own placement
		* wins over the shipped series, because moving a built-in Team into a category
		* is an explicit act and showing it in two places would make the list lie about
		* how many Teams it holds; the series stays available as a filter and as a tag
		* on the row, so the official fact is never lost. A Team the reader never
		* placed stays under its series when it ships with the plugin, and under
		* "uncategorized" when it does not.
		*
		* This module is pure: the views own their own filter text and collapse state,
		* and the controller owns the stored categories, so grouping can be tested
		* without a DOM.
		* @module dsh-agent-team-presets/client/team-grouping
		*/
		/**
		* Group the Teams the page shows by series, category, then "uncategorized".
		*
		* Empty groups are dropped: a header with nothing under it is noise, and the
		* filter control still reaches every category and both series. The order is
		* the shipped series order first, then the reader's category order, with the
		* unplaced remainder last, so the list never reshuffles as Teams move.
		* @param teams - the Teams to group, in configuration order.
		* @param categories - the reader's categories, in stored order.
		* @param assignments - the live memberships.
		* @returns the non-empty groups, in render order.
		*/
		function groupTeams(teams, categories, assignments) {
			const placed = new Map(assignments.map((row) => [row.teamId, row.categoryId]));
			const ordered = orderedCategories(categories);
			const known = new Set(ordered.map((row) => row.id));
			const groups = [
				...TEAM_SERIES.map((row) => ({
					group: {
						kind: "series",
						id: `series:${row.id}`,
						series: row.id,
						teams: []
					},
					teams: []
				})),
				...ordered.map((row) => ({
					group: {
						kind: "category",
						id: `category:${row.id}`,
						categoryId: row.id,
						teams: []
					},
					teams: []
				})),
				{
					group: {
						kind: "uncategorized",
						id: "uncategorized",
						teams: []
					},
					teams: []
				}
			];
			const unplaced = groups[groups.length - 1];
			for (const team of teams) {
				const categoryId = placed.get(team.id);
				const own = categoryId === void 0 || !known.has(categoryId) ? void 0 : groups.find((row) => row.group.categoryId === categoryId);
				const origin = teamOrigin(team.id);
				(own ?? (origin.series === void 0 ? void 0 : groups.find((row) => row.group.series === origin.series)) ?? unplaced)?.teams.push(team);
			}
			return groups.filter((row) => row.teams.length > 0).map((row) => ({
				...row.group,
				teams: row.teams
			}));
		}
		/**
		* Whether one Team passes the second-level filter the picker shows.
		*
		* A user category and a shipped series share one control, exactly as on the
		* settings list: selecting a category asks membership, selecting a series asks
		* an official fact, and selecting neither accepts every Team.
		* @param team - the Team to judge.
		* @param series - the selected official series, or `all`.
		* @param categoryId - the selected user category, or the empty string.
		* @param assignments - the live `teamId → categoryId` memberships.
		* @returns whether the Team belongs to the active selection.
		*/
		function matchesCategoryFilter(team, series, categoryId, assignments) {
			const matchesSeries = series === "all" || teamOrigin(team.id).series === series;
			const matchesCategory = categoryId === "" || assignments.some((row) => row.teamId === team.id && row.categoryId === categoryId);
			return matchesSeries && matchesCategory;
		}


		/** Locale bundles for the Agent Team presets page and composer control. */
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
			modelsFailed: "The provider catalogue could not be read at all, so no model can be offered here. The route already stored for this agent is kept.",
			tools: "Allowed tools",
			toolMode: "Tool permissions",
			toolsDefault: "Default: all tools",
			toolsCustom: "Custom allowed tools",
			toolsHint: "Only checked configurable tools are allowed.",
			toolsAllHint: "Adds no tool restriction. Your custom selections are kept when you switch modes.",
			toolsEmpty: "No tools selected: all configurable tools are disabled.",
			toolsScoped: "Custom mode also controls agent-local Team tools: select the coordination tools this role needs. General code and ordinary delegation are disabled; preset-managed creation stays available only when selected.",
			toolsNoCatalog: "This deployment exposes no configurable tools.",
			toolsCaptainOnly: "Captain only: a member selecting it is still refused by the Team service.",
			toolsGroupPresets: "This plugin (Agent Team presets)",
			toolsGroupMcp: "MCP server",
			toolsGroupOther: "Other (native Harness and third-party plugin tools)",
			toolsInvert: "Invert",
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
			teamNameRequired: "A Team needs a name before it can be saved: {teams}.",
			externalUpdateOne: "Team {team} was updated outside this page; the saved version is shown now.",
			externalUpdateMany: "{count} teams were updated outside this page ({teams}); the saved versions are shown now.",
			externalUpdateOverriddenOne: "Your unsaved changes to {team} were replaced.",
			externalUpdateOverriddenMany: "Your unsaved changes to {count} of them were replaced ({teams}).",
			externalAddedOne: "Team {team} was added outside this page and joined your draft.",
			externalAddedMany: "{count} teams were added outside this page and joined your draft ({teams}).",
			externalRemovedOne: "Team {team} was deleted outside this page and removed from your draft.",
			externalRemovedMany: "{count} teams were deleted outside this page and removed from your draft ({teams}).",
			externalRemovedEditedOne: "Your unsaved changes to {team} were dropped with it.",
			externalRemovedEditedMany: "Your unsaved changes to {count} of them were dropped with them.",
			executionBusy: "This team is running a task right now. A change to its purpose, roles, prompts, roster, or tool policy takes effect before its next team task; a member's model route applies to the next member it summons, including in this task.",
			executionBusyShared: "The preset is shared by every session that selected it: an idle session adopts a definition change right away, and a session in a running team task adopts it before its next one.",
			executionIdle: "No session is running this team's task, so a save takes effect right away.",
			executionUnknown: "Whether this team is running a task cannot be confirmed right now. A definition change does not affect a task already in progress; a member's model route applies to the next member summoned.",
			executionPtcOverridden: "This session's Agent preset asks for PTC batch calling. This team's strict custom tool policy is applied with native tool calling, so its allowed tools are called directly and the general-purpose code transport stays denied.",
			readOnly: "This deployment stores settings read-only.",
			unavailable: "The Agent team presets plugin is not loaded, so it cannot be configured right now.",
			sectionLoading: "Reading the Team configuration from the Host…",
			formIssueSettingsUnavailable: "This page is not backed by a Host settings document, so Teams cannot be stored from here.",
			formIssueNamespaceMissing: "This deployment serves no \"agent-team-presets\" settings section, so no Team can be stored or selected.",
			formIssueSchemaRejected: "The Host serves the Team section, but this client refused the value it holds: the stored Teams are shown read-only and a save would be refused.",
			selectionUnavailable: "No Team selection could be written: the Team settings section is not available in this page.",
			selectionRefused: "The Host refused the Team selection write.",
			selectionFailed: "The Team selection write did not complete.",
			composerTitle: "Team",
			composerNone: "No team",
			composerHint: "Apply one Team preset to this session.",
			composerMissing: "Missing Team: {team}",
			composerMissingHint: "This is not No team. An unapplicable selection denies tools; a running task keeps its old policy until idle. Choose a valid Team or No team.",
			importPreset: "Import preset",
			exportPreset: "Export",
			importNote: "A shared document carries names, descriptions, system prompts, and colors. Model routes and tool permissions stay local.",
			restoreDefaults: "Restore defaults",
			restoreDefaultsHint: "Puts every preset this plugin ships back to its shipped name, description, prompts, colors, and roster. The model routes and tool permissions you configured stay as they are, and teams you created yourself are not touched.",
			defaultsRestored: "Default presets restored in this draft. Save to apply them.",
			defaultsUnchanged: "The default presets already match what this plugin ships; nothing was staged.",
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
			importTooLarge: "That file is too large to be a Team preset.",
			importInvalidMetadata: "That file carries display metadata this release cannot read.",
			skillsEmpty: "No Team Skill is installed yet.",
			skillsImport: "Import folder",
			skillsNew: "New skill",
			skillsSave: "Save",
			skillsDelete: "Delete",
			skillsAssign: "Assign",
			skillsUnassign: "Remove",
			skillsBuiltinList: "Built-in skills",
			skillsFiles: "Files",
			skillsBindings: "Assigned to",
			skillsNamePlaceholder: "kebab-case name, e.g. release-notes",
			skillsDescriptionPlaceholder: "When should this method apply?",
			skillsRoot: "Private library",
			skillsRefresh: "Refresh",
			skillsScan: "Scan import folder",
			skillsScanHint: "Folder path:",
			skillsScanSummary: "Scanned {scanned}: imported {imported}, already present {existing}, refused {invalid}.",
			skillsScanEmpty: "No skill folder was found in the import folder.",
			skillsScanImported: "imported",
			skillsScanExisting: "already present",
			skillsScanInvalid: "refused",
			skillsScanMissingSkill: "missing SKILL.md",
			skillsScanInvalidFrontmatter: "invalid frontmatter",
			skillsScanInvalidName: "name is not kebab-case",
			skillsScanMissingDescription: "missing description",
			skillsScanTooLarge: "exceeds the size limit",
			skillsScanSymlink: "contains a symlink",
			skillsScanNotDirectory: "not a folder",
			skillsScanUnreadable: "cannot be read",
			skillsScanDuplicate: "same skill name",
			skillsScanInstallRefused: "publish refused",
			skillsOpenScanFolder: "Open scan folder",
			skillsCopyScanFolder: "Copy scan folder path",
			skillsScanFolderOpened: "The scan folder is open. Put one skill folder inside it, then scan.",
			skillsScanFolderCopied: "The scan folder is ready; its path is on the clipboard.",
			skillsScanFolderCopyFailed: "The scan folder is ready, but the browser blocked the clipboard; use the path shown by the scan result.",
			skillsOverride: "Create editable copy",
			skillsReset: "Reset to the built-in version",
			tabTeams: "Team presets",
			tabSkills: "Team skills",
			skillsBody: "SKILL.md body",
			skillsHint: "Select a skill on the left to see its files and assignments.",
			originBuiltin: "Built-in",
			originCustom: "Custom",
			originOverride: "Local copy",
			skillsTitle: "Team skills",
			skillsSub: "Manage the plugin Team Skill library. SKILL.md, scripts, references and assets are kept intact; members bind skills on their own edit pages.",
			skillsNote: "Team Skills live in the plugin private directory and are not registered as user or project skills. Only an assigned team member discovers them through the plugin scope. Global DSH skills are not managed here.",
			skillsOpenFolder: "Copy library path",
			skillsOpenAssetFolder: "Copy this skill's folder path",
			skillsSearch: "Search a team skill by name or description",
			skillsAll: "All",
			skillsBuiltin: "Built-in",
			skillsCustom: "Custom",
			skillsBound: "bound to",
			skillsResources: "Resource files",
			skillsSaveFile: "Save file",
			skillsEditable: "editable",
			skillsReadonly: "read-only original",
			skillsMakeCopy: "Create an editable copy",
			skillsResetCopy: "Reset to the built-in copy",
			skillsNoBinding: "Not assigned to any member yet",
			skillsUnbind: "Remove",
			skillsDeps: "MCP and runtime dependencies",
			skillsNoDeps: "This skill declares no MCP server or runtime dependency.",
			skillsDeleteTitle: "Delete this team skill?",
			skillsDeleteBody: "A skill still bound to a member, used by a running task, or required by another skill cannot be deleted; the Host lists why.",
			skillsDeleteBlocked: "This skill cannot be deleted for the following reasons:",
			skillsDeleteBoundWarning: "Currently assigned to the following members (unbind first):",
			skillsDeleteBuiltinWarning: "Built-in original skills are read-only and cannot be deleted.",
			skillsCancel: "Cancel",
			skillsConfirm: "Confirm",
			skillsName: "Skill name (directory name)",
			skillsDesc: "What does this skill handle?",
			skillsNewTitle: "New team skill",
			skillsVersion: "version",
			skillsAssignTitle: "Team Skill assignment",
			skillsNameClash: "same name, separate copies",
			skillsNameClashBody: "These assets reuse one skill name. They never overwrite each other, and this plugin never writes to a global skill",
			skillsBlockedAssign: "Assignment is refused until these required dependencies exist",
			skillsMcpUnverified: "These required MCP servers are declared; whether they are connected is decided by the host, not this page",
			skillsDeclared: "declared",
			categoryManage: "Manage categories",
			categoryRename: "Rename",
			categoryManagePage: "Manage preset categories",
			categoryTitle: "Team preset categories",
			categorySub: "Local grouping for this browser only. A category never travels with a preset and never reaches the runtime.",
			categoryTeams: "teams",
			categorySave: "Save",
			categoryRemove: "Delete",
			categoryUp: "Move up",
			categoryDown: "Move down",
			categoryNote: "Local grouping only: it is not exported with the preset and never reaches the runtime.",
			categoryFold: "Hide categories",
			categoryName: "New category name",
			categoryAdd: "Add",
			categoryEmpty: "No category yet",
			categoryOf: "Category",
			categoryNone: "Uncategorised",
			skillsFound: "found on PATH",
			skillsMissing: "missing from PATH",
			composeTitle: "Choose a team",
			metadataTitle: "Team display metadata",
			metadataOnlyDisplay: "display only",
			metadataNote: "This part is never injected into the runtime context. It is used for search, grouping, the Team intro and preset transfer only; it adds no tokens to any prompt.",
			metadataFold: "Fold",
			metadataUnfold: "Unfold",
			metadataSummary: "Summary",
			metadataTags: "Tags (separate with a half-width comma ,)",
			metadataTagsHint: "Use a half-width comma, for example: frontend, review, release",
			metadataUseCases: "Use cases (one per line)",
			metadataQuickPrompts: "Suggested tasks (one per line)",
			metadataNotes: "Notes",
			filterSource: "Team source",
			filterNoCategory: "No custom category yet — add one under 管理团队预设分类",
			filterCategory: "Category",
			listSearch: "Search name, summary, tags, use cases, suggested tasks",
			listAll: "All",
			listBuiltin: "Built-in",
			listCustom: "Custom",
			seriesDevelopment: "Development scale",
			seriesWorkModes: "Work modes",
			listMatched: "Matched",
			listNoInject: "display metadata is never injected into runtime context",
			listNoMatch: "No team matches this filter",
			composeClose: "Close",
			composeSearch: "Search name, tags, use cases…",
			composeAll: "All",
			composeFilterCategory: "Category",
			composeCategoryAll: "All categories",
			composeUncategorized: "Uncategorized",
			composeNoneSub: "The session runs without a team",
			composeSeriesDev: "Built-in · development",
			composeSeriesModes: "Built-in · work modes",
			composeEmpty: "No team matches",
			skillsAssignHint: "Checked skills belong to this member only. They are discovered through this Agent scope, never globally.",
			skillsAssignEmpty: "No team skill is installed yet. Add one on the Team skills page.",
			skillsOverrideOn: "a local override is active"
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
			modelsFailed: "完全无法读取提供商模型目录，因此这里无法提供模型选择。该智能体已保存的路由会保留。",
			tools: "可用工具",
			toolMode: "工具权限",
			toolsDefault: "默认所有工具",
			toolsCustom: "自定义可用工具",
			toolsHint: "仅允许使用勾选的可配置工具。",
			toolsAllHint: "不额外限制工具。切换模式不会清除已保存的自定义勾选。",
			toolsEmpty: "未勾选任何工具：禁用全部可配置工具。",
			toolsScoped: "自定义模式同样限制作用域内的团队工具；请勾选该角色需要的协作工具。禁用通用代码和普通委派，预设成员创建也须勾选。",
			toolsNoCatalog: "当前部署没有可配置工具。",
			toolsCaptainOnly: "仅队长可用：队员勾选后仍会被团队服务拒绝。",
			toolsGroupPresets: "本插件（Agent Team presets）",
			toolsGroupMcp: "MCP 服务器",
			toolsGroupOther: "其他（原生 Harness 与第三方插件工具）",
			toolsInvert: "反选",
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
			teamNameRequired: "团队名称不能为空，无法保存：{teams}。",
			externalUpdateOne: "团队 {team} 已被外部更新，页面已显示最新保存的版本。",
			externalUpdateMany: "{count} 个团队已被外部更新（{teams}），页面已显示最新保存的版本。",
			externalUpdateOverriddenOne: "你在 {team} 的未保存修改已被覆盖。",
			externalUpdateOverriddenMany: "其中 {count} 个团队的未保存修改已被覆盖（{teams}）。",
			externalAddedOne: "外部新增了团队 {team}，已加入你的草稿。",
			externalAddedMany: "外部新增了 {count} 个团队（{teams}），已加入你的草稿。",
			externalRemovedOne: "团队 {team} 已被外部删除，已从你的草稿移除。",
			externalRemovedMany: "{count} 个团队已被外部删除（{teams}），已从你的草稿移除。",
			externalRemovedEditedOne: "你在 {team} 的未保存修改随之丢失。",
			externalRemovedEditedMany: "其中 {count} 个团队的未保存修改随之丢失。",
			executionBusy: "当前团队正在执行任务。对团队用途、角色、提示词、成员名单或工具权限的修改，将在下一次团队任务开始前生效；队员的模型路由则在下次召唤该队员时生效，进行中的任务同样适用。",
			executionBusyShared: "此预设由多个会话共享：空闲会话立即采用定义修改，执行中的会话在下一次任务前采用。",
			executionIdle: "当前没有会话在执行该团队任务，保存后立即生效。",
			executionUnknown: "无法确认该团队是否正在执行任务。定义修改不会改变进行中的任务；队员的模型路由在下次召唤时生效。",
			executionPtcOverridden: "本会话的 Agent 预设要求 PTC 批量调用。该团队的严格自定义工具权限改用原生工具调用，因此白名单内的工具直接调用，通用代码传输仍被拒绝。",
			readOnly: "本部署的设置为只读。",
			unavailable: "智能体团队插件当前未加载，暂时无法配置。",
			sectionLoading: "正在从宿主读取团队配置…",
			formIssueSettingsUnavailable: "当前页面没有连接宿主设置文档，因此无法在这里保存团队。",
			formIssueNamespaceMissing: "本部署没有提供「agent-team-presets」设置分区，团队无法保存或选择。",
			formIssueSchemaRejected: "宿主提供了团队分区，但客户端拒绝接受其中的存储值：下面只读显示已保存的团队，保存会被拒绝。",
			selectionUnavailable: "无法写入团队选择：当前页面没有可用的团队设置分区。",
			selectionRefused: "宿主拒绝了团队选择写入。",
			selectionFailed: "团队选择写入未完成。",
			composerTitle: "团队",
			composerNone: "不使用团队",
			composerHint: "为本会话启用一个团队预设。",
			composerMissing: "团队已失效：{team}",
			composerMissingHint: "这不是“不使用团队”。无法应用时权限保持拒绝；进行中的任务保留旧策略直到空闲。请改选有效团队或“不使用团队”。",
			importPreset: "导入预设",
			exportPreset: "导出",
			importNote: "共享文档只携带名称、描述、系统提示词和颜色；模型路由与工具权限保留在本地。",
			restoreDefaults: "恢复默认预设",
			restoreDefaultsHint: "把插件自带的预设全部恢复到出厂的名称、说明、提示词、颜色和成员名单；你为它们配置的模型路由与工具权限保持不变，你自己创建的团队完全不受影响。",
			defaultsRestored: "默认预设已恢复到草稿，保存后生效。",
			defaultsUnchanged: "默认预设与插件出厂状态一致，无需恢复。",
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
			importTooLarge: "该文件过大，不像是团队预设。",
			importInvalidMetadata: "该文件包含本版本无法读取的展示信息。",
			skillsEmpty: "还没有安装任何团队技能。",
			skillsImport: "导入文件夹",
			skillsNew: "新建技能",
			skillsSave: "保存",
			skillsDelete: "删除",
			skillsAssign: "分配",
			skillsUnassign: "解除",
			skillsBuiltinList: "插件内置技能",
			skillsFiles: "文件",
			skillsBindings: "已分配给",
			skillsNamePlaceholder: "kebab-case 名称，例如 release-notes",
			skillsDescriptionPlaceholder: "这个方法在什么情况下适用？",
			skillsRoot: "私有库目录",
			skillsRefresh: "刷新",
			skillsScan: "扫描导入目录",
			skillsScanHint: "目录路径：",
			skillsScanSummary: "已检查 {scanned} 个：新增 {imported}，已存在 {existing}，无法导入 {invalid}。",
			skillsScanEmpty: "导入目录里没有发现技能文件夹。",
			skillsScanImported: "已导入",
			skillsScanExisting: "已存在",
			skillsScanInvalid: "无法导入",
			skillsScanMissingSkill: "缺少 SKILL.md",
			skillsScanInvalidFrontmatter: "frontmatter 格式不正确",
			skillsScanInvalidName: "name 不符合 kebab-case",
			skillsScanMissingDescription: "缺少 description",
			skillsScanTooLarge: "超出大小限制",
			skillsScanSymlink: "包含符号链接",
			skillsScanNotDirectory: "不是文件夹",
			skillsScanUnreadable: "无法读取",
			skillsScanDuplicate: "技能名重复",
			skillsScanInstallRefused: "发布被拒绝",
			skillsOpenScanFolder: "打开扫描技能目录",
			skillsCopyScanFolder: "复制扫描技能目录",
			skillsScanFolderOpened: "已打开扫描目录。把一个技能文件夹放进去后点扫描即可。",
			skillsScanFolderCopied: "扫描目录已就绪，路径已复制到剪贴板。",
			skillsScanFolderCopyFailed: "扫描目录已就绪，但浏览器拒绝了剪贴板，请使用扫描结果里显示的路径。",
			skillsOverride: "创建可编辑副本",
			skillsReset: "恢复为插件内置版本",
			tabTeams: "团队预设",
			tabSkills: "团队技能",
			skillsBody: "SKILL.md 正文",
			skillsHint: "在左侧选择一个技能，查看它的文件与分配情况。",
			originBuiltin: "插件内置",
			originCustom: "自定义",
			originOverride: "本地副本",
			skillsTitle: "团队技能配置",
			skillsSub: "独立管理插件 Team Skills 库。完整保留 SKILL.md、scripts、references 和 assets；成员绑定在各自编辑页配置。",
			skillsNote: "Team Skills 位于插件私有目录，默认不注册为用户级或项目级 Skill。只有获分配的团队成员才能通过插件作用域发现。普通 DSH 全局 Skills 不在这里管理。",
			skillsOpenFolder: "复制库目录路径",
			skillsOpenAssetFolder: "复制该技能目录路径",
			skillsSearch: "搜索团队技能名称或简介",
			skillsAll: "全部",
			skillsBuiltin: "插件内置",
			skillsCustom: "自定义",
			skillsBound: "绑定",
			skillsResources: "资源文件",
			skillsSaveFile: "保存文件内容",
			skillsEditable: "可编辑",
			skillsReadonly: "只读原版",
			skillsMakeCopy: "创建本地可编辑副本",
			skillsResetCopy: "恢复为插件内置版本",
			skillsNoBinding: "尚未分配给任何成员",
			skillsUnbind: "解除绑定",
			skillsDeps: "MCP 及运行环境依赖",
			skillsNoDeps: "此技能未声明 MCP 服务或运行环境依赖。",
			skillsDeleteTitle: "删除这个团队技能？",
			skillsDeleteBody: "仍被成员绑定、被运行中的任务使用，或被其他技能依赖时不能删除；宿主会列出具体原因。",
			skillsDeleteBlocked: "无法删除此技能，原因如下：",
			skillsDeleteBoundWarning: "当前已被以下成员绑定（需先解除绑定）：",
			skillsDeleteBuiltinWarning: "插件内置只读原版不可删除。",
			skillsCancel: "取消",
			skillsConfirm: "确认",
			skillsName: "Skill 名称（目录名）",
			skillsDesc: "这个技能处理什么任务",
			skillsNewTitle: "新建 Team Skill",
			skillsVersion: "版本",
			skillsAssignTitle: "Team Skill 分配",
			skillsNameClash: "同名，各自独立",
			skillsNameClashBody: "以下资产共用同一个技能名。它们互不覆盖，插件不会改写任何全局 Skill",
			skillsBlockedAssign: "缺少必需依赖，分配会被拒绝",
			skillsMcpUnverified: "以下 MCP 服务为必需项且已声明；是否已连接由宿主决定，本页无法判断",
			skillsDeclared: "已声明",
			categoryManage: "管理分类",
			categoryRename: "重命名",
			categoryManagePage: "管理团队预设分类",
			categoryTitle: "团队预设分类",
			categorySub: "仅在本机浏览器生效的分组。分类不会随预设导出，也不会进入运行时。",
			categoryTeams: "个团队",
			categorySave: "保存",
			categoryRemove: "删除",
			categoryUp: "上移",
			categoryDown: "下移",
			categoryNote: "仅本地分组：不会随预设导出，也不会进入运行时。",
			categoryFold: "收起分类",
			categoryName: "新分类名称",
			categoryAdd: "添加",
			categoryEmpty: "还没有分类",
			categoryOf: "所属分类",
			categoryNone: "未分类",
			skillsFound: "PATH 中存在",
			skillsMissing: "PATH 中缺失",
			composeTitle: "选择团队",
			metadataTitle: "团队展示信息",
			metadataOnlyDisplay: "仅用于展示",
			metadataNote: "这部分不会注入运行时上下文。仅用于搜索、分类、团队介绍及预设导入导出，不会增加任何 Prompt 的 Token。",
			metadataFold: "折叠",
			metadataUnfold: "展开",
			metadataSummary: "团队简介",
			metadataTags: "标签（使用英文逗号 , 分隔）",
			metadataTagsHint: "多个标签请用英文半角逗号，例如：frontend, review, release",
			metadataUseCases: "适用场景（每行一项）",
			metadataQuickPrompts: "推荐任务（每行一项）",
			metadataNotes: "备注",
			filterSource: "团队来源",
			filterNoCategory: "还没有自定义分类，可在「管理团队预设分类」里创建",
			filterCategory: "分类",
			listSearch: "搜索名称、简介、标签、适用场景、推荐任务",
			listAll: "全部",
			listBuiltin: "插件内置",
			listCustom: "自定义",
			seriesDevelopment: "研发规模",
			seriesWorkModes: "工作模式",
			listMatched: "匹配",
			listNoInject: "展示信息不会注入运行时上下文",
			listNoMatch: "没有匹配的团队",
			composeClose: "关闭",
			composeSearch: "搜索名称、标签、适用场景…",
			composeAll: "全部",
			composeFilterCategory: "分类",
			composeCategoryAll: "全部分类",
			composeUncategorized: "未分类",
			composeNoneSub: "本会话不使用团队",
			composeSeriesDev: "插件内置 · 研发规模",
			composeSeriesModes: "插件内置 · 工作模式",
			composeEmpty: "没有匹配的团队",
			skillsAssignHint: "勾选的技能只属于这名成员，通过该 Agent 的作用域发现，不会全局注册。",
			skillsAssignEmpty: "还没有安装任何团队技能，请先到「团队技能」页添加。",
			skillsOverrideOn: "已启用本地覆盖"
		};
		/**
		* Locale key for one Host disclosure about how the applied Team runs.
		*
		* A Host disclosure is a locale key, so the page renders it in the reader's own
		* language; an unrecognised one is shown verbatim rather than swallowed, because
		* a disclosure the page cannot translate is still a disclosure it must not hide.
		*/
		const DISCLOSURE_NOTICE_KEYS = { "presentation.ptcOverridden": "executionPtcOverridden" };
		/** Locale key of the execution hint one Team state shows. */
		const EXECUTION_NOTICE_KEYS = {
			busy: "executionBusy",
			idle: "executionIdle",
			unknown: "executionUnknown"
		};
		/** Locale key of the notice one default-preset restore shows. */
		const DEFAULTS_NOTICE_KEYS = {
			restored: "defaultsRestored",
			unchanged: "defaultsUnchanged"
		};
		/** Locale key for one refused import. */
		const IMPORT_FAILURE_KEYS = {
			"invalid-json": "importInvalidJson",
			"invalid-format": "importInvalidFormat",
			"unsupported-version": "importUnsupportedVersion",
			"unsupported-fields": "importUnsupportedFields",
			"duplicate-members": "importDuplicateMembers",
			"too-many-members": "importTooManyMembers",
			"too-large": "importTooLarge",
			"invalid-metadata": "importInvalidMetadata"
		};
		/**
		* Locale key naming why the stored Team section cannot be edited.
		*
		* The three conditions have three different owners: a page with no Host
		* document is the deployment's, a namespace no row serves is the deployment's,
		* and a section this client refused to decode is this plugin's to report. The
		* page names which one it is instead of showing one "unavailable" for all.
		*/
		const FORM_ISSUE_KEYS = {
			"settings-unavailable": "formIssueSettingsUnavailable",
			"namespace-missing": "formIssueNamespaceMissing",
			"schema-rejected": "formIssueSchemaRejected"
		};
		/**
		* Locale key for one failed Team selection write.
		*
		* The Host's own refusal text is appended verbatim when there is one: it is the
		* only part of the notice that names what to change, and translating it would
		* replace an actionable message with a summary.
		*/
		const SELECTION_FAILURE_KEYS = {
			unavailable: "selectionUnavailable",
			refused: "selectionRefused",
			failed: "selectionFailed"
		};
		/**
		* Read one selection failure as the notice both surfaces render.
		*
		* The Host's refusal text is the only part of the notice that names what to
		* change, so it is appended verbatim rather than paraphrased: a translated
		* summary of "Config field \"selections\" is not volatile" would hide exactly
		* the sentence the reader needs. A `t` seat of any locale namespace is accepted
		* structurally, so both the page and the composer control can pass their own.
		* @param failure - the selection failure this client recorded.
		* @param t - the bound translate seat of this plugin's namespace.
		* @returns the notice text, with the Host's own detail when there is one.
		*/
		function selectionFailureText(failure, t) {
			const text = t(SELECTION_FAILURE_KEYS[failure.kind]);
			return failure.detail === void 0 || failure.detail === "" ? text : `${text} (${failure.detail})`;
		}


		const key$2 = "dsh-agent-team-presets:client/ComposerTeamSelect.module.css";
		if (typeof document !== "undefined" && !document.querySelector("style[data-team-presets-style=\"dsh-agent-team-presets:client/ComposerTeamSelect.module.css\"]")) {
			const style = document.createElement("style");
			style.dataset.teamPresetsStyle = key$2;
			style.textContent = ".Q4LFCW_popover,.Q4LFCW_popover *,.Q4LFCW_popover :before,.Q4LFCW_popover :after{box-sizing:border-box}.Q4LFCW_wrap{display:inline-flex;position:relative}.Q4LFCW_trigger{border-radius:var(--dsw-radius-sm);min-width:0;max-width:160px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:inline-flex}.Q4LFCW_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.Q4LFCW_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}.Q4LFCW_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.Q4LFCW_triggerIcon{flex:none;display:inline-flex}.Q4LFCW_triggerIcon svg{width:14px;height:14px}.Q4LFCW_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.Q4LFCW_accentDot{border-radius:50%;flex:none;width:8px;height:8px}.Q4LFCW_failure{text-overflow:ellipsis;white-space:nowrap;max-width:220px;color:var(--dsw-alias-state-warn-label);font-size:11px;line-height:17px;overflow:hidden}.Q4LFCW_popover{box-sizing:border-box;background:var(--dsw-alias-bg-layer-3);background:rgb(from var(--dsw-specific-menu,var(--dsw-alias-bg-layer-3)) r g b / 1);border:1px solid var(--dsw-alias-border-l3);width:min(360px,100vw - 76px);box-shadow:var(--dsw-elevation-prominent);z-index:40;border-radius:13px;flex-direction:column;gap:8px;padding:12px;display:flex;position:absolute;bottom:40px;left:0}.Q4LFCW_popHead{justify-content:space-between;align-items:center;font-size:13px;font-weight:550;display:flex}.Q4LFCW_popClose{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;padding:2px 4px;font-size:12px}.Q4LFCW_popSearch{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-specific-input-major);width:100%;max-width:100%;color:var(--dsw-alias-label-primary);border-radius:9px;outline:none;padding:7px 10px;font-size:13px}.Q4LFCW_popChips{box-sizing:border-box;flex-wrap:wrap;gap:4px;display:flex}.Q4LFCW_popChip{border:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-radius:7px;padding:6px 10px;font-size:12px}.Q4LFCW_popChipActive{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}.Q4LFCW_popList{box-sizing:border-box;flex-direction:column;max-height:268px;display:flex;overflow:auto}.Q4LFCW_popGroup{color:var(--dsw-alias-label-secondary);padding:6px 8px 2px;font-size:11px}.Q4LFCW_popOption{text-align:left;width:100%;color:inherit;cursor:pointer;background:0 0;border:0;border-radius:8px;padding:8px 9px;display:block}.Q4LFCW_popOption:hover{background:var(--dsw-alias-interactive-bg-hover)}.Q4LFCW_popOptionActive{background:var(--dsw-alias-interactive-bg-active);font-weight:550}.Q4LFCW_popOptionName{font-size:13px;display:block}.Q4LFCW_popOptionSub{color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;margin-top:2px;font-size:11px;display:block;overflow:hidden}.Q4LFCW_popEmpty{color:var(--dsw-alias-label-secondary);text-align:center;padding:14px 8px;font-size:12.5px}.Q4LFCW_popFilterLabel{color:var(--dsw-alias-label-secondary);align-self:center;margin-right:2px;font-size:12px}";
			document.head.appendChild(style);
		}
		var ComposerTeamSelect_module_css_default = {
			"accentDot": "Q4LFCW_accentDot",
			"failure": "Q4LFCW_failure",
			"popChip": "Q4LFCW_popChip",
			"popChipActive": "Q4LFCW_popChipActive",
			"popChips": "Q4LFCW_popChips",
			"popClose": "Q4LFCW_popClose",
			"popEmpty": "Q4LFCW_popEmpty",
			"popFilterLabel": "Q4LFCW_popFilterLabel",
			"popGroup": "Q4LFCW_popGroup",
			"popHead": "Q4LFCW_popHead",
			"popList": "Q4LFCW_popList",
			"popOption": "Q4LFCW_popOption",
			"popOptionActive": "Q4LFCW_popOptionActive",
			"popOptionName": "Q4LFCW_popOptionName",
			"popOptionSub": "Q4LFCW_popOptionSub",
			"popover": "Q4LFCW_popover",
			"popSearch": "Q4LFCW_popSearch",
			"trigger": "Q4LFCW_trigger",
			"triggerIcon": "Q4LFCW_triggerIcon",
			"triggerLabel": "Q4LFCW_triggerLabel",
			"wrap": "Q4LFCW_wrap"
		};


		/**
		* The composer's Team control: pick the Team preset that leads this Session.
		* It sits in the composer tool row after the permission control.
		*/
		/**
		* Render the composer's Team picker.
		* @param props - the Session identity, the page's locale reader, and the selection writer.
		* @returns the Team trigger, plus a notice when the last selection write failed.
		*/
		function ComposerTeamSelect(props) {
			const { t, sessionId } = props;
			const state = props.useTeamPresets((snapshot) => snapshot);
			const [open, setOpen] = (0, react.useState)(false);
			const selection = state.selections.find((row) => row.sessionId === String(sessionId));
			const active = selectedTeam(state.teams, state.selections, String(sessionId));
			const missing = selection !== void 0 && active === void 0;
			const missingLabel = t("composerMissing").replace("{team}", selection?.teamId ?? "");
			const failure = state.selectionFailure === void 0 ? void 0 : selectionFailureText(state.selectionFailure, t);
			const issue = state.formIssue === void 0 ? void 0 : t(FORM_ISSUE_KEYS[state.formIssue]);
			const writable = state.status === "ready" && state.writable;
			const [query, setQuery] = (0, react.useState)("");
			const [source, setSource] = (0, react.useState)("all");
			const [series, setSeries] = (0, react.useState)("all");
			const [categoryId, setCategoryId] = (0, react.useState)("");
			const popover = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!open) return;
				const onKey = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				const onDown = (event) => {
					const node = popover.current;
					if (node !== null && event.target instanceof Node && !node.contains(event.target)) setOpen(false);
				};
				document.addEventListener("keydown", onKey);
				document.addEventListener("mousedown", onDown);
				return () => {
					document.removeEventListener("keydown", onKey);
					document.removeEventListener("mousedown", onDown);
				};
			}, [open]);
			const tokens = queryTokens(query);
			const categories = (0, react.useMemo)(() => orderedCategories(state.categories), [state.categories]);
			const groups = (0, react.useMemo)(() => groupTeams(state.teams.filter((team) => {
				const matchesSource = source === "all" || teamOrigin(team.id).source === source;
				const matchesCategory = matchesCategoryFilter(team, series, categoryId, state.teamCategories);
				const matchesQuery = tokens.length === 0 || matchTeam(team, tokens) !== void 0;
				return matchesSource && matchesCategory && matchesQuery;
			}), state.categories, state.teamCategories), [
				state.teams,
				state.categories,
				state.teamCategories,
				source,
				series,
				categoryId,
				tokens
			]);
			const groupLabel = (group) => {
				if (group.kind === "series") return group.series === "classic-development" ? t("composeSeriesDev") : t("composeSeriesModes");
				if (group.kind === "category") return categories.find((entry) => entry.id === group.categoryId)?.name ?? group.categoryId ?? "";
				return t("composeUncategorized");
			};
			const choose = (teamId) => {
				setOpen(false);
				props.selectTeam(String(sessionId), teamId);
			};
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("span", {
				className: ComposerTeamSelect_module_css_default.wrap,
				ref: popover,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: ComposerTeamSelect_module_css_default.trigger,
					disabled: !writable,
					"aria-haspopup": "listbox",
					"aria-expanded": open,
					title: failure ?? issue ?? (missing ? `${missingLabel}. ${t("composerMissingHint")}` : t("composerHint")),
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [
						active === void 0 || active.captain.color === "" ? null : (0, react_jsx_runtime.jsx)("span", {
							className: ComposerTeamSelect_module_css_default.accentDot,
							style: { background: active.captain.color },
							"aria-hidden": true
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: ComposerTeamSelect_module_css_default.triggerLabel,
							"aria-label": t("composerTitle"),
							children: missing ? missingLabel : active === void 0 ? t("composerNone") : active.name === "" ? active.id : active.name
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: ComposerTeamSelect_module_css_default.triggerIcon,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 14 })
						})
					]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: ComposerTeamSelect_module_css_default.popover,
					role: "listbox",
					"aria-label": t("composeTitle"),
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: ComposerTeamSelect_module_css_default.popHead,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("composeTitle") }), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ComposerTeamSelect_module_css_default.popClose,
								onClick: () => {
									setOpen(false);
								},
								children: t("composeClose")
							})]
						}),
						(0, react_jsx_runtime.jsx)("input", {
							className: ComposerTeamSelect_module_css_default.popSearch,
							autoFocus: true,
							value: query,
							placeholder: t("composeSearch"),
							onChange: (event) => {
								setQuery(event.target.value);
							}
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: ComposerTeamSelect_module_css_default.popChips,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: ComposerTeamSelect_module_css_default.popFilterLabel,
									children: t("filterSource")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: `${ComposerTeamSelect_module_css_default.popChip} ${source === "all" ? ComposerTeamSelect_module_css_default.popChipActive : ""}`,
									onClick: () => {
										setSource("all");
									},
									children: t("listAll")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: `${ComposerTeamSelect_module_css_default.popChip} ${source === "builtin" ? ComposerTeamSelect_module_css_default.popChipActive : ""}`,
									onClick: () => {
										setSource("builtin");
										setCategoryId("");
									},
									children: t("listBuiltin")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: `${ComposerTeamSelect_module_css_default.popChip} ${source === "custom" ? ComposerTeamSelect_module_css_default.popChipActive : ""}`,
									onClick: () => {
										setSource("custom");
										setSeries("all");
									},
									children: t("listCustom")
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: ComposerTeamSelect_module_css_default.popChips,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: ComposerTeamSelect_module_css_default.popFilterLabel,
									children: t("filterCategory")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: `${ComposerTeamSelect_module_css_default.popChip} ${series === "all" && categoryId === "" ? ComposerTeamSelect_module_css_default.popChipActive : ""}`,
									onClick: () => {
										setSeries("all");
										setCategoryId("");
									},
									children: t("listAll")
								}),
								source !== "custom" ? TEAM_SERIES.map((entry) => (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: `${ComposerTeamSelect_module_css_default.popChip} ${series === entry.id ? ComposerTeamSelect_module_css_default.popChipActive : ""}`,
									onClick: () => {
										setSeries(series === entry.id ? "all" : entry.id);
										setCategoryId("");
									},
									children: entry.id === "classic-development" ? t("seriesDevelopment") : t("seriesWorkModes")
								}, entry.id)) : null,
								source !== "builtin" ? categories.map((entry) => (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: `${ComposerTeamSelect_module_css_default.popChip} ${categoryId === entry.id ? ComposerTeamSelect_module_css_default.popChipActive : ""}`,
									onClick: () => {
										setCategoryId(categoryId === entry.id ? "" : entry.id);
										setSeries("all");
									},
									children: entry.name
								}, entry.id)) : null,
								source === "custom" && categories.length === 0 ? (0, react_jsx_runtime.jsx)("span", {
									className: ComposerTeamSelect_module_css_default.popFilterLabel,
									children: t("filterNoCategory")
								}) : null
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: ComposerTeamSelect_module_css_default.popList,
							children: [
								(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: `${ComposerTeamSelect_module_css_default.popOption} ${selection === void 0 ? ComposerTeamSelect_module_css_default.popOptionActive : ""}`,
									onClick: () => {
										choose(void 0);
									},
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: ComposerTeamSelect_module_css_default.popOptionName,
										children: t("composerNone")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: ComposerTeamSelect_module_css_default.popOptionSub,
										children: t("composeNoneSub")
									})]
								}),
								missing ? (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: ComposerTeamSelect_module_css_default.popOption,
									disabled: true,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: ComposerTeamSelect_module_css_default.popOptionName,
										children: missingLabel
									}), (0, react_jsx_runtime.jsx)("span", {
										className: ComposerTeamSelect_module_css_default.popOptionSub,
										children: t("composerMissingHint")
									})]
								}) : null,
								groups.map((group) => group.teams.length === 0 ? null : (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("div", {
									className: ComposerTeamSelect_module_css_default.popGroup,
									children: groupLabel(group)
								}), group.teams.map((team) => (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									role: "option",
									"aria-selected": selection?.teamId === team.id,
									className: `${ComposerTeamSelect_module_css_default.popOption} ${selection?.teamId === team.id ? ComposerTeamSelect_module_css_default.popOptionActive : ""}`,
									onClick: () => {
										choose(team.id);
									},
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: ComposerTeamSelect_module_css_default.popOptionName,
										children: team.name === "" ? team.id : team.name
									}), (0, react_jsx_runtime.jsx)("span", {
										className: ComposerTeamSelect_module_css_default.popOptionSub,
										title: team.description,
										children: team.description || team.metadata?.summary || ""
									})]
								}, team.id))] }, group.id)),
								groups.every((group) => group.teams.length === 0) ? (0, react_jsx_runtime.jsx)("div", {
									className: ComposerTeamSelect_module_css_default.popEmpty,
									children: t("composeEmpty")
								}) : null
							]
						})
					]
				}) : null]
			}), failure === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
				className: ComposerTeamSelect_module_css_default.failure,
				role: "status",
				children: failure
			})] });
		}


		/**
		* Accent colors this plugin publishes to the Agent Teams roster.
		*
		* A Team's configured colors live in the settings document rather than in the
		* Session log, so the browser half resolves them from the same stored Teams and
		* selections the Settings page and the composer control edit.
		*
		* The roster's appearance registry is a deployment extension rather than part of
		* official rc.2, so its shape is declared here instead of imported from a
		* package the plugin cannot depend on. A structurally identical local
		* declaration keeps this plugin compiling against the official release while a
		* deployment that ships the extension still accepts these values.
		* @module dsh-agent-team-presets/appearance
		*/
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


		/**
		* Fixed JSON transfer format for one Team preset.
		*
		* A shared document carries the parts of a Team that keep working after the
		* document moves to another deployment: the Team's own name and purpose, each
		* agent's name, description, standing system prompt, and accent color, the
		* display-only discovery metadata, and — for an official template — the
		* shipped skill ids it assigns to its role slots. Model routes and tool
		* permissions stay local, because a route names a provider this deployment may
		* not run and an allow-list names tools it may not expose. A document that
		* carries them is refused rather than silently reduced, so a reader never
		* believes it imported something it did not.
		*
		* Version 2 adds `metadata` and `officialSkills` to version 1 without changing
		* any version 1 meaning. The writer emits version 2; the reader accepts both,
		* so a document written before this release still imports. A version 1 reader
		* meeting a version 2 document refuses it as `unsupported-version` instead of
		* guessing — that is why the version is bumped rather than the fields being
		* silently added to version 1.
		*
		* Personal Team Skill assets, member bindings, category membership, and local
		* paths are never part of this document.
		* @module dsh-agent-team-presets/preset-transfer
		*/
		/** Format marker every shareable Team document carries. */
		const TEAM_PRESET_FORMAT = "dsh-agent-team-preset";
		/** Upper bounds of the display metadata fields. */
		const METADATA_LIMITS = {
			/** Characters in `summary`. */
			summary: 500,
			/** Characters in one tag. */
			tag: 64,
			/** Tags in `tags`. */
			tags: 30,
			/** Characters in one use case. */
			useCase: 200,
			/** Entries in `useCases`. */
			useCases: 20,
			/** Characters in one quick prompt. */
			quickPrompt: 500,
			/** Entries in `quickPrompts`. */
			quickPrompts: 20,
			/** Characters in `notes`. */
			notes: 2e3,
			/** Characters across the whole metadata object, JSON-encoded. */
			total: 16 * 1024,
			/** Official skill declarations one document may carry. */
			officialSkills: 16
		};
		/**
		* Keys a document root may carry.
		*
		* Both revisions share this root shape: version 2 only adds fields inside
		* `team`, so one constant serves the reader and no revision can drift.
		*/
		const ROOT_KEYS = [
			"format",
			"version",
			"team"
		];
		/** Keys a version 1 shared Team may carry. */
		const TEAM_KEYS_V1 = [
			"name",
			"description",
			"captain",
			"members"
		];
		/** Keys a version 2 shared Team may carry. */
		const TEAM_KEYS_V2 = [
			"name",
			"description",
			"metadata",
			"captain",
			"members",
			"officialSkills"
		];
		/** Keys a shared slot may carry. */
		const SLOT_KEYS = [
			"name",
			"description",
			"systemPrompt",
			"color"
		];
		/** Keys a metadata object may carry. */
		const METADATA_KEYS = [
			"summary",
			"tags",
			"useCases",
			"quickPrompts",
			"notes"
		];
		/** Keys an official skill declaration may carry. */
		const OFFICIAL_SKILL_KEYS = ["skillId", "roleName"];
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
		* Read an optional string list with a per-entry and per-list bound.
		* @param value - candidate list.
		* @param maxEntries - most entries allowed.
		* @param maxLength - most characters allowed in one entry.
		* @returns the list, or undefined when the field is absent.
		* @throws {Refused} when the field is present but malformed or too large.
		*/
		function readTextList(value, maxEntries, maxLength) {
			if (value === void 0) return void 0;
			if (!Array.isArray(value)) throw new Refused("invalid-metadata");
			if (value.length > maxEntries) throw new Refused("invalid-metadata");
			return value.map((entry) => {
				if (typeof entry !== "string" || entry.length > maxLength) throw new Refused("invalid-metadata");
				return entry;
			});
		}
		/**
		* Read the optional display metadata of one shared Team.
		*
		* Unknown metadata keys are refused rather than dropped, so a document that
		* carries a field this release does not understand cannot look imported while
		* silently losing it.
		* @param value - candidate metadata object.
		* @returns the metadata, or undefined when absent.
		* @throws {Refused} when the value is malformed, too large, or has unknown keys.
		*/
		function readMetadata(value) {
			if (value === void 0) return void 0;
			if (!isRecord(value)) throw new Refused("invalid-metadata");
			if (hasUnknownKey(value, METADATA_KEYS)) throw new Refused("unsupported-fields");
			const summary = value["summary"];
			const notes = value["notes"];
			if (summary !== void 0 && (typeof summary !== "string" || summary.length > METADATA_LIMITS.summary)) throw new Refused("invalid-metadata");
			if (notes !== void 0 && (typeof notes !== "string" || notes.length > METADATA_LIMITS.notes)) throw new Refused("invalid-metadata");
			const metadata = {};
			if (summary !== void 0) metadata.summary = summary;
			if (notes !== void 0) metadata.notes = notes;
			const tags = readTextList(value["tags"], METADATA_LIMITS.tags, METADATA_LIMITS.tag);
			if (tags !== void 0) metadata.tags = tags;
			const useCases = readTextList(value["useCases"], METADATA_LIMITS.useCases, METADATA_LIMITS.useCase);
			if (useCases !== void 0) metadata.useCases = useCases;
			const quickPrompts = readTextList(value["quickPrompts"], METADATA_LIMITS.quickPrompts, METADATA_LIMITS.quickPrompt);
			if (quickPrompts !== void 0) metadata.quickPrompts = quickPrompts;
			if (metadataChars(metadata) > METADATA_LIMITS.total) throw new Refused("invalid-metadata");
			return metadata;
		}
		/**
		* Count the characters one metadata object adds to a document.
		* @param metadata - the metadata to measure.
		* @returns its JSON-encoded length.
		*/
		function metadataChars(metadata) {
			return JSON.stringify(metadata).length;
		}
		/**
		* Read the optional official skill declarations of one shared Team.
		* @param value - candidate declaration list.
		* @returns the declarations, or undefined when absent.
		* @throws {Refused} when the list is malformed.
		*/
		function readOfficialSkills(value) {
			if (value === void 0) return void 0;
			if (!Array.isArray(value) || value.length > METADATA_LIMITS.officialSkills) throw new Refused("invalid-format");
			return value.map((entry) => {
				if (!isRecord(entry) || hasUnknownKey(entry, OFFICIAL_SKILL_KEYS)) throw new Refused("unsupported-fields");
				const skillId = readText(entry, "skillId");
				const roleName = readText(entry, "roleName");
				if (skillId === void 0 || roleName === void 0 || skillId === "" || roleName === "") throw new Refused("invalid-format");
				return {
					skillId,
					roleName
				};
			});
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
		* @param version - the document revision being read.
		* @returns the Team's shareable content.
		* @throws {Refused} when the value is not a Team of this format.
		*/
		function readTeam(value, version) {
			if (!isRecord(value)) throw new Refused("invalid-format");
			if (hasUnknownKey(value, version >= 2 ? TEAM_KEYS_V2 : TEAM_KEYS_V1)) throw new Refused("unsupported-fields");
			const name = readText(value, "name");
			const description = readText(value, "description");
			if (name === void 0 || description === void 0) throw new Refused("invalid-format");
			const body = {
				name,
				description,
				captain: readSlot(value["captain"]),
				members: readMembers(value["members"])
			};
			if (version >= 2) {
				const metadata = readMetadata(value["metadata"]);
				if (metadata !== void 0) body.metadata = metadata;
				const officialSkills = readOfficialSkills(value["officialSkills"]);
				if (officialSkills !== void 0) body.officialSkills = officialSkills;
			}
			return body;
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
			if (version !== 2 && version !== 1) throw new Refused("unsupported-version");
			return {
				format: TEAM_PRESET_FORMAT,
				version,
				team: readTeam(value["team"], version)
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
		* Project one metadata object onto the document, dropping empty fields.
		* @param metadata - the stored metadata.
		* @returns a detached copy with only the fields a document carries.
		*/
		function shareMetadata(metadata) {
			const shared = {};
			if (metadata.summary !== void 0 && metadata.summary !== "") shared.summary = metadata.summary;
			if (metadata.tags !== void 0 && metadata.tags.length > 0) shared.tags = [...metadata.tags];
			if (metadata.useCases !== void 0 && metadata.useCases.length > 0) shared.useCases = [...metadata.useCases];
			if (metadata.quickPrompts !== void 0 && metadata.quickPrompts.length > 0) shared.quickPrompts = [...metadata.quickPrompts];
			if (metadata.notes !== void 0 && metadata.notes !== "") shared.notes = metadata.notes;
			return shared;
		}
		/**
		* Project one Team onto the document that shares it.
		* @param team - the Team preset to share.
		* @param options - official template declarations, when exporting a builtin Team.
		* @returns the shareable document.
		*/
		function exportTeamPreset(team, options = {}) {
			const body = {
				name: team.name,
				description: team.description,
				captain: shareSlot(team.captain),
				members: team.members.map((member) => shareSlot(member))
			};
			const metadata = team.metadata === void 0 ? {} : shareMetadata(team.metadata);
			if (Object.keys(metadata).length > 0) body.metadata = metadata;
			const officialSkills = options.officialSkills ?? team.officialSkills;
			if (officialSkills !== void 0 && officialSkills.length > 0) body.officialSkills = officialSkills.map((entry) => ({
				skillId: entry.skillId,
				roleName: entry.roleName
			}));
			return {
				format: TEAM_PRESET_FORMAT,
				version: 2,
				team: body
			};
		}
		/**
		* Serialize one Team as the fixed document this plugin imports.
		* @param team - the Team preset to share.
		* @param options - official template declarations, when exporting a builtin Team.
		* @returns the document text, newline-terminated.
		*/
		function serializeTeamPreset(team, options = {}) {
			return `${JSON.stringify(exportTeamPreset(team, options), null, 2)}\n`;
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
				id: crypto.randomUUID(),
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
			const metadata = transfer.team.metadata;
			return {
				id,
				name: transfer.team.name,
				description: transfer.team.description,
				captain: captainFromTransfer(transfer.team.captain),
				members: transfer.team.members.map((member) => memberFromTransfer(member)),
				...transfer.team.officialSkills === void 0 ? {} : { officialSkills: transfer.team.officialSkills.map((entry) => ({ ...entry })) },
				...metadata === void 0 ? {} : { metadata: {
					...metadata.summary === void 0 ? {} : { summary: metadata.summary },
					...metadata.tags === void 0 ? {} : { tags: [...metadata.tags] },
					...metadata.useCases === void 0 ? {} : { useCases: [...metadata.useCases] },
					...metadata.quickPrompts === void 0 ? {} : { quickPrompts: [...metadata.quickPrompts] },
					...metadata.notes === void 0 ? {} : { notes: metadata.notes }
				} }
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


		/**
		* The official Team presets this plugin ships, as installable and restorable
		* definitions.
		*
		* The catalog in `team-catalog.ts` is the source of truth; this module turns one
		* catalog entry into the stored record a deployment holds, installs the
		* official set exactly once, and restores it on request. Two rules keep that
		* knowledge from becoming a trap:
		*
		* - Installing a shipped preset never overwrites a stored one. Seeding appends a
		*   preset the deployment does not hold and records its identity in
		*   `seededDefaults`, so a shipped preset the user deletes or edits stays
		*   exactly as they left it across restarts. Restoring it is a deliberate act.
		* - Restoring a shipped preset replaces the fields a shared document carries —
		*   the name, the purpose, every standing prompt, the accent colors, the
		*   roster, and the display metadata — and keeps the fields it does not: a
		*   member's model route and every slot's tool policy.
		*
		* `contrib/default-presets` holds the same nine documents as JSON for readers of
		* this repository, and `tests/builtin-teams.spec.ts` proves the two cannot
		* drift.
		* @module dsh-agent-team-presets/builtin-teams
		*/
		/** Every shipped preset, in install order: the three development Teams, then the six work modes. */
		const BUILTIN_TEAMS = BUILTIN_TEAM_CATALOG.map((entry) => ({
			id: entry.id,
			series: entry.series,
			document: entry.document,
			metadata: entry.metadata,
			officialSkillBindings: entry.officialSkillBindings
		}));
		/**
		* Stable role identity of one shipped member.
		*
		* A member's `id` is the identity a durable member snapshot binds to and the one
		* the runtime re-reads a route through, so a shipped member is stored under a
		* derived identity rather than a random one: restoring the preset a second time
		* addresses the same role instead of creating a second one.
		* @param teamId - identity of the shipped Team that owns the member.
		* @param name - the member's name in the document.
		* @param index - the member's position, used only when the document names none.
		* @returns the role identity a shipped member is stored under.
		*/
		function memberRoleId(teamId, name, index) {
			const label = name.trim();
			return `${teamId}:${label === "" ? String(index + 1) : label}`;
		}
		/**
		* Build one member from a shipped document slot.
		* @param teamId - identity of the shipped Team that owns the member.
		* @param slot - the member's shareable fields.
		* @param index - the member's position in the document.
		* @returns a fresh member carrying the shared fields, no route, and the default tool policy.
		*/
		function memberFromDocument(teamId, slot, index) {
			return {
				...captainFromTransfer(slot),
				id: memberRoleId(teamId, slot.name, index),
				provider: "",
				model: "",
				reasoningEffort: ""
			};
		}
		/**
		* Build the preset one shipped document describes.
		*
		* Everything the document does not carry starts empty, exactly as an import
		* starts: the route follows the Session and the tool policy stays unrestricted.
		* The display metadata rides along because it belongs to the template, not to
		* any runtime field.
		* @param entry - the shipped Team to materialize.
		* @returns a fresh preset carrying the document's content.
		*/
		function builtinTeamDefinition(entry) {
			return {
				id: entry.id,
				name: entry.document.team.name,
				description: entry.document.team.description,
				captain: captainFromTransfer(entry.document.team.captain),
				members: entry.document.team.members.map((slot, index) => memberFromDocument(entry.id, slot, index)),
				...entry.metadata === void 0 ? {} : { metadata: cloneMetadata(entry.metadata) },
				...entry.officialSkillBindings.length === 0 ? {} : { officialSkills: entry.officialSkillBindings.map((binding) => ({ ...binding })) }
			};
		}
		/**
		* Copy one metadata object so a stored Team never shares the catalog's arrays.
		* @param metadata - the catalog metadata.
		* @returns a detached copy.
		*/
		function cloneMetadata(metadata) {
			return {
				...metadata.summary === void 0 ? {} : { summary: metadata.summary },
				...metadata.tags === void 0 ? {} : { tags: [...metadata.tags] },
				...metadata.useCases === void 0 ? {} : { useCases: [...metadata.useCases] },
				...metadata.quickPrompts === void 0 ? {} : { quickPrompts: [...metadata.quickPrompts] },
				...metadata.notes === void 0 ? {} : { notes: metadata.notes }
			};
		}
		/**
		* Whether two slots carry the same stored fields.
		* @param a - left slot.
		* @param b - right slot.
		* @returns whether every field a slot stores is equal.
		*/
		function sameSlot(a, b) {
			return a.name === b.name && a.color === b.color && a.description === b.description && a.systemPrompt === b.systemPrompt && toolMode(a) === toolMode(b) && a.tools.length === b.tools.length && a.tools.every((tool, index) => tool === b.tools[index]);
		}
		/**
		* Whether two members carry the same stored fields.
		* @param a - left member.
		* @param b - right member.
		* @returns whether every field a member stores is equal.
		*/
		function sameMember(a, b) {
			return sameSlot(a, b) && a.id === b.id && a.provider === b.provider && a.model === b.model && a.reasoningEffort === b.reasoningEffort;
		}
		/**
		* Whether two metadata objects are equal field by field.
		* @param a - left metadata, or undefined.
		* @param b - right metadata, or undefined.
		* @returns whether both describe the same display data.
		*/
		function sameMetadata(a, b) {
			if (a === void 0 || b === void 0) return a === b;
			const list = (value) => JSON.stringify(value ?? []);
			return (a.summary ?? "") === (b.summary ?? "") && (a.notes ?? "") === (b.notes ?? "") && list(a.tags) === list(b.tags) && list(a.useCases) === list(b.useCases) && list(a.quickPrompts) === list(b.quickPrompts);
		}
		/**
		* Whether two Teams carry the same stored fields.
		* @param a - left Team.
		* @param b - right Team.
		* @returns whether every field a Team stores is equal.
		*/
		function sameTeam$1(a, b) {
			return a.id === b.id && a.name === b.name && a.description === b.description && sameMetadata(a.metadata, b.metadata) && sameSlot(a.captain, b.captain) && a.members.length === b.members.length && a.members.every((member, index) => {
				const other = b.members[index];
				return other !== void 0 && sameMember(member, other);
			});
		}
		/**
		* Put one stored Team back at the content of its shipped document.
		*
		* The document wins for everything it carries. A member it still names keeps the
		* route and tool policy the deployment configured for that role — matched by the
		* role identity a previous install gave it, or by name for a member the
		* deployment created itself — and a member the document does not name leaves the
		* roster, because a restored preset is the shipped roster and not a superset of
		* it.
		* @param current - the stored Team being restored.
		* @param entry - the shipped Team it is restored from.
		* @returns the restored Team, keeping the stored identity and every local route.
		*/
		function restoreBuiltinTeam(current, entry) {
			const document = entry.document.team;
			return {
				id: current.id,
				name: document.name,
				description: document.description,
				captain: applySharedFields(current.captain, document.captain),
				members: document.members.map((shared, index) => {
					const key = slotNameKey(shared.name);
					const existing = current.members.find((member) => member.id === memberRoleId(entry.id, shared.name, index)) ?? current.members.find((member) => key !== "" && slotNameKey(member.name) === key);
					return existing === void 0 ? memberFromDocument(entry.id, shared, index) : applySharedFields(existing, shared);
				}),
				...entry.metadata === void 0 ? {} : { metadata: cloneMetadata(entry.metadata) },
				...entry.officialSkillBindings.length === 0 ? {} : { officialSkills: entry.officialSkillBindings.map((binding) => ({ ...binding })) }
			};
		}
		/**
		* Put every shipped preset back at its document's content.
		*
		* Only the shipped presets are touched: a Team the user created keeps its
		* identity, its content, and its position, and a shipped preset that is missing
		* is appended rather than substituted for anything else. The result is the list
		* the caller stages, so a restore is reviewable and saved like every other edit
		* on the page.
		* @param teams - the Teams the page currently shows.
		* @returns the restored list and the identities that really moved.
		*/
		function restoreBuiltinTeams(teams) {
			const next = [...teams];
			const changed = [];
			for (const entry of BUILTIN_TEAMS) {
				const at = next.findIndex((team) => team.id === entry.id);
				if (at < 0) {
					next.push(builtinTeamDefinition(entry));
					changed.push(entry.id);
					continue;
				}
				const current = next[at];
				const restored = restoreBuiltinTeam(current, entry);
				if (sameTeam$1(current, restored)) continue;
				next[at] = restored;
				changed.push(entry.id);
			}
			return {
				teams: next,
				changed
			};
		}


		/**
		* Staged Team preset editing over the `agent-team-presets` settings namespace,
		* plus the per-Session Team selection the composer control writes.
		*/
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
		* Resolve the execution state of one Team as the page must show it.
		*
		* A stream that has not delivered its first frame, or that failed, leaves every
		* Team `unknown`: an idle claim the page cannot support is worse than no claim,
		* because the page promises when a save takes effect.
		* @param state - the page state carrying the stream health and its rows.
		* @param teamId - the Team the page is editing.
		* @returns the execution state the footer reports.
		*/
		function executionStateOf(state, teamId) {
			if (state.execution !== "ready") return "unknown";
			return state.executions.find((row) => row.teamId === teamId)?.state ?? "unknown";
		}
		/**
		* Every Team in the open draft that has no name, so the save is withheld.
		*
		* A Team's name is its identity everywhere it is shown: the list, the composer
		* selector, and this page's own breadcrumb each fall back to the raw id when the
		* name is empty. Storing one therefore leaks an id into the UI instead of
		* failing visibly, so the unnamed Teams are named back to the user and refused.
		* @param teams - the Teams in the open draft, in page order.
		* @returns the unnamed Teams, in page order.
		*/
		function unnamedTeamsOf(teams) {
			return teams.filter((team) => team.name.trim() === "");
		}
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
			const importedNames = /* @__PURE__ */ new Map();
			for (const incoming of plan.transfer.team.members) {
				const key = slotNameKey(incoming.name);
				const at = key === "" ? -1 : members.findIndex((member) => slotNameKey(member.name) === key);
				if (at >= 0 && (resolution.members[incoming.name] ?? "replace") === "replace") {
					const existing = members[at];
					if (existing !== void 0) {
						members[at] = applySharedFields(existing, incoming);
						importedNames.set(incoming.name, incoming.name);
						continue;
					}
				}
				const name = uniqueName(incoming.name, members.map((member) => member.name));
				members.push(memberFromTransfer({
					...incoming,
					name
				}));
				importedNames.set(incoming.name, name);
			}
			const captain = plan.transfer.team.captain;
			const captainName = resolution.captain === "rename" ? plan.suggestedCaptainName : captain.name;
			importedNames.set(captain.name, captainName);
			return {
				id: target.id,
				name: plan.transfer.team.name,
				description: plan.transfer.team.description,
				...plan.transfer.version < 2 ? target.metadata === void 0 ? {} : { metadata: structuredClone(target.metadata) } : { metadata: structuredClone(plan.transfer.team.metadata ?? {}) },
				...plan.transfer.team.officialSkills === void 0 ? target.officialSkills === void 0 ? {} : { officialSkills: structuredClone(target.officialSkills) } : { officialSkills: plan.transfer.team.officialSkills.map((binding) => ({
					...binding,
					roleName: importedNames.get(binding.roleName) ?? binding.roleName
				})) },
				captain: applySharedFields(target.captain, {
					...captain,
					name: captainName
				}),
				members
			};
		}
		/**
		* Narrow one stored category list.
		*
		* The Host projects exactly what its schema declares, but a document written by
		* hand or by an older client may hold anything, and the page that reports a bad
		* document must still open: a row without a usable identity is dropped instead
		* of reaching a render that would throw.
		* @param value - the raw `categories` field.
		* @returns the usable rows, in stored order.
		*/
		function categoryRows(value) {
			if (!Array.isArray(value)) return [];
			const rows = [];
			const seen = /* @__PURE__ */ new Set();
			for (const row of value) {
				if (typeof row !== "object" || row === null) continue;
				const candidate = row;
				if (typeof candidate.id !== "string" || candidate.id === "" || seen.has(candidate.id)) continue;
				seen.add(candidate.id);
				rows.push({
					id: candidate.id,
					name: typeof candidate.name === "string" ? candidate.name : "",
					order: typeof candidate.order === "number" ? candidate.order : rows.length
				});
			}
			return rows;
		}
		/**
		* Narrow one stored membership list.
		*
		* One category per Team is this release's rule, so the first membership wins:
		* a hand-edited document cannot make the page show a Team in two groups, and
		* the next write persists the single membership it kept.
		* @param value - the raw `teamCategories` field.
		* @returns the usable memberships, in stored order.
		*/
		function assignmentRows(value) {
			if (!Array.isArray(value)) return [];
			const rows = [];
			const seen = /* @__PURE__ */ new Set();
			for (const row of value) {
				if (typeof row !== "object" || row === null) continue;
				const candidate = row;
				if (typeof candidate.teamId !== "string" || candidate.teamId === "") continue;
				if (typeof candidate.categoryId !== "string" || candidate.categoryId === "") continue;
				if (seen.has(candidate.teamId)) continue;
				seen.add(candidate.teamId);
				rows.push({
					teamId: candidate.teamId,
					categoryId: candidate.categoryId
				});
			}
			return rows;
		}
		/**
		* Narrow one stored settings section into the lists this plugin reads.
		*
		* The Host projects exactly the fields its own schema declares, so a served
		* namespace always carries both arrays; a section that carries one of them as
		* something other than a list is still readable as the empty list that field
		* means, because a composer that offers no Team is strictly better than one
		* that refuses to open over a field it does not use.
		* @param value - the namespace value the describe mirror holds.
		* @returns the section, or undefined when the value is not a settings object at all.
		*/
		function sectionOf(value) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
			const section = value;
			return {
				teams: (Array.isArray(section.teams) ? section.teams : []).map((team) => {
					const entry = builtinEntry(team.id);
					if (entry !== void 0 && (team.metadata === void 0 || (team.metadata.summary ?? "").trim() === "")) return {
						...team,
						metadata: cloneMetadata(entry.metadata)
					};
					return team;
				}),
				selections: Array.isArray(section.selections) ? section.selections : [],
				categories: categoryRows(section.categories),
				teamCategories: assignmentRows(section.teamCategories)
			};
		}
		/**
		* Read one thrown value as text a user can act on.
		* @param error - the caught value.
		* @returns its message, or its string form for a non-Error throw.
		*/
		function messageOf(error) {
			return error instanceof Error ? error.message : String(error);
		}
		/**
		* Convert one staged member into the JSON value a settings write carries.
		* @param agent - the staged member.
		* @returns the mutable JSON record the settings document stores.
		*/
		function agentJson(agent) {
			return {
				...agent.id === void 0 ? {} : { id: agent.id },
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
				members: team.members.map((member) => agentJson(member)),
				...team.metadata === void 0 ? {} : { metadata: {
					summary: team.metadata.summary ?? "",
					tags: [...team.metadata.tags ?? []],
					useCases: [...team.metadata.useCases ?? []],
					quickPrompts: [...team.metadata.quickPrompts ?? []],
					notes: team.metadata.notes ?? ""
				} },
				...team.officialSkills === void 0 ? {} : { officialSkills: team.officialSkills.map((binding) => ({
					skillId: binding.skillId,
					roleName: binding.roleName
				})) }
			};
		}
		/**
		* Whether one stored Team still matches a staged draft, so the page can tell
		* a duplicate from a real edit.
		* @param a - left Team.
		* @param b - right Team.
		* @returns whether both serialize identically.
		*/
		function sameTeam(a, b) {
			return JSON.stringify(a) === JSON.stringify(b);
		}
		/**
		* The name the page shows for one Team.
		* @param team - the Team to name.
		* @returns its display name, or its id while the Team is unnamed.
		*/
		function teamLabel(team) {
			return team.name === "" ? team.id : team.name;
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
				id: crypto.randomUUID(),
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
			/**
			* The shared describe mirror, which is the authority for the STORED document.
			*
			* Every settings surface in the browser derives from this one mirror, so it
			* answers three questions the form cannot: whether the Host serves the
			* namespace at all, what the stored section holds when this client's own form
			* refuses to decode it, and which revision a write must carry. The form keeps
			* its own job — the page's staged draft, its save fence, and its coordination
			* of a Host write landing behind that draft.
			*/
			mirror;
			unsubscribe;
			unsubscribeMirror;
			draft;
			draftRevision;
			/**
			* The Host's Teams as they stood when the draft opened, by Team id. What the
			* page reconciles an external write against: only a Team whose stored record
			* moved away from this baseline was changed behind the draft.
			*/
			draftBase;
			/**
			* The last external update this page adopted, kept until the user acts on
			* the draft again. Unrelated form changes leave it standing, so the status
			* line is not wiped by a catalogue refresh or another Session's selection.
			*/
			externalUpdate;
			/**
			* The last default-preset restore, kept until the user acts on the draft
			* again, exactly as {@link externalUpdate} is: it reports the click the user
			* just made, not one they already moved past.
			*/
			defaultsRestore;
			/** The last selection write this client could not complete, until the user acts again. */
			selectionFailure;
			/** The Session whose Team write this client is waiting on, while it is in flight. */
			selectionPending;
			/** Whether a category write this client started is still crossing the wire. */
			categorySaving = false;
			/** The last category write this client could not complete, until the next attempt. */
			categoryFailure;
			/** Whether a write this page started is still crossing the wire. */
			saving = false;
			/** Stream health of the Host execution state, and the frames it delivered. */
			execution = "loading";
			executions = [];
			executionGeneration = 0;
			executionAbort;
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
				this.mirror = ctx.configForms.describe();
				this.store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(this.projection());
				this.unsubscribe = this.form.subscribe(() => {
					this.reconcile();
					this.publish();
				});
				this.unsubscribeMirror = this.mirror.subscribe(() => {
					this.publish();
				});
			}
			/** Release the form and mirror subscriptions and the execution stream. */
			dispose() {
				this.disposed = true;
				this.executionGeneration += 1;
				this.executionAbort?.abort();
				this.executionAbort = void 0;
				this.unsubscribe();
				this.unsubscribeMirror();
			}
			projection() {
				const stored = this.storedSection();
				const categories = stored?.categories ?? [];
				return {
					status: this.documentStatus(),
					writable: this.documentWritable(),
					saving: false,
					failed: false,
					teams: this.visibleTeams(),
					selections: stored?.selections ?? [],
					dirty: this.draft !== void 0,
					externalUpdate: this.externalUpdate,
					defaults: this.defaultsRestore,
					formIssue: this.formIssue(),
					selectionFailure: this.selectionFailure,
					execution: this.execution,
					executions: this.executions,
					providers: this.providers,
					catalogue: this.catalogue,
					cataloguePartial: this.cataloguePartial,
					tools: this.tools,
					toolCatalogue: this.toolCatalogue,
					categories,
					teamCategories: liveAssignments(categories, this.visibleTeams(), stored?.teamCategories ?? []),
					categorySaving: this.categorySaving,
					categoryFailure: this.categoryFailure,
					selectionPending: this.selectionPending
				};
			}
			/**
			* Whether the stored document is usable, as the describe mirror reports it.
			*
			* The mirror answers even when the shared form does not: a form parked at
			* `loading` because it refused the stored value still leaves a served
			* namespace with a readable value and a writable document, and gating the
			* composer on the form is what turned that into a control that opened a menu
			* and then did nothing.
			* @returns the stored document's state.
			*/
			documentStatus() {
				const mirrored = this.mirror.getSnapshot();
				if (mirrored.view === void 0) return mirrored.error === null ? "loading" : "unavailable";
				return this.namespaceView() === void 0 ? "unavailable" : "ready";
			}
			/**
			* The Host's view of the Team namespace, or undefined while it serves none.
			* @returns the namespace view the describe mirror currently holds.
			*/
			namespaceView() {
				return this.mirror.getSnapshot().view?.namespaces.find((row) => row.ns === TEAM_PRESETS_NS);
			}
			/**
			* The stored section this client reads and writes.
			*
			* The mirror wins whenever it holds an answer, because it is the same value
			* every other settings surface derives from and it survives a namespace whose
			* stored section this client's own form refused to decode. The form's accepted
			* value is the fallback only for the window before the first describe answer,
			* where the form may hold a section the mirror has not published yet: once the
			* mirror HAS answered, a namespace it does not list is not served, and the
			* form's older value must not be shown as if it were stored.
			* @returns the stored Teams, selections, and local view fields, or undefined while nothing is known.
			*/
			storedSection() {
				if (this.mirror.getSnapshot().view !== void 0) return sectionOf(this.namespaceView()?.value);
				const accepted = this.form.getSnapshot().value;
				return accepted === void 0 ? void 0 : {
					teams: accepted.teams,
					selections: accepted.selections,
					categories: [],
					teamCategories: []
				};
			}
			/**
			* Whether the stored document accepts writes.
			*
			* A namespace the Host never composed accepts none, whatever the document's
			* own writability says: there is no section to write into, and reporting the
			* document as writable there is what let the composer offer a control whose
			* every click was refused.
			* @returns whether a selection can be written right now.
			*/
			documentWritable() {
				const view = this.mirror.getSnapshot().view;
				if (view === void 0) return this.form.getSnapshot().writable;
				return this.namespaceView() === void 0 ? false : view.writable;
			}
			/**
			* Name why the stored section cannot be edited, when it cannot.
			* @returns the condition, or undefined when this page can edit and save.
			*/
			formIssue() {
				const mirrored = this.mirror.getSnapshot();
				if (mirrored.view === void 0) return mirrored.error === null ? void 0 : "settings-unavailable";
				if (this.namespaceView() === void 0) return "namespace-missing";
				return this.form.getSnapshot().status === "ready" ? void 0 : "schema-rejected";
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
				return this.draft ?? this.storedSection()?.teams ?? [];
			}
			/**
			* Fold a stored change that landed behind an open draft into the draft.
			*
			* An Agent that rewrites a Team through its tools saves without this page, so
			* the stored record of that Team is the newer definition and wins over the
			* staged one; every other Team keeps its unsaved edit. A Team the Host moved
			* away from the baseline the draft was opened on is adopted whole, a Team the
			* Host deleted leaves the draft, and a Team the Host added joins it — the
			* draft is the page's whole document, so saving it must neither drop what the
			* Host gained nor resurrect what the Host removed. A Team this page added
			* itself is the page's own and is never touched. The fence follows the Host
			* revision so what stays staged can still be saved.
			*
			* Once nothing but Host records remain, the draft is dropped rather than left
			* staged with nothing to write — including when a stored write landed on the
			* value the draft already held, which needs no replacement and is no conflict.
			* Everything the coordination did is reported through {@link externalUpdate},
			* naming what changed and whether a staged edit was replaced or dropped; a
			* change that coordinates nothing leaves the report standing.
			*
			* A write this page started owns the draft until it settles: its own
			* accepted view and the read a refusal triggers must never roll back or
			* discard what the user had staged when they pressed Save.
			*/
			reconcile() {
				if (this.draft === void 0 || this.saving) return;
				const snapshot = this.form.getSnapshot();
				const stored = snapshot.value?.teams;
				const base = this.draftBase;
				if (snapshot.status !== "ready" || stored === void 0 || base === void 0) return;
				const hosts = new Map(stored.map((team) => [team.id, team]));
				const draft = this.draft;
				const staged = new Set(draft.map((team) => team.id));
				const adopted = [];
				const removed = [];
				const kept = [];
				for (const team of draft) {
					const host = hosts.get(team.id);
					const before = base.get(team.id);
					if (before === void 0) {
						kept.push(team);
						continue;
					}
					if (host === void 0) {
						removed.push({
							name: teamLabel(team),
							edited: !sameTeam(before, team)
						});
						continue;
					}
					if (sameTeam(before, host) || sameTeam(team, host)) {
						kept.push(team);
						continue;
					}
					adopted.push({
						name: teamLabel(host),
						overridden: !sameTeam(before, team)
					});
					kept.push(structuredClone(host));
				}
				const added = stored.filter((host) => !staged.has(host.id) && !base.has(host.id));
				this.draftBase = new Map(stored.map((team) => [team.id, structuredClone(team)]));
				this.draftRevision = snapshot.revision;
				const coordinated = adopted.length > 0 || removed.length > 0 || added.length > 0;
				if (coordinated) this.externalUpdate = {
					teams: adopted.map((entry) => entry.name),
					overridden: adopted.filter((entry) => entry.overridden).map((entry) => entry.name),
					added: added.map(teamLabel),
					removed: removed.map((entry) => entry.name),
					removedEdited: removed.filter((entry) => entry.edited).map((entry) => entry.name)
				};
				const next = added.length === 0 ? kept : [...kept, ...added.map((host) => structuredClone(host))];
				if (next.length === stored.length && next.every((team, index) => {
					const host = stored[index];
					return host !== void 0 && sameTeam(team, host);
				})) {
					this.draft = void 0;
					this.draftBase = void 0;
					this.draftRevision = void 0;
					return;
				}
				if (!coordinated) return;
				this.draft = next;
			}
			/**
			* The business face both slot registrations inject.
			* @returns the state store and the page and composer callbacks.
			*/
			inject() {
				return {
					hooks: { teamPresets: this.store },
					createTeam: () => this.createTeam(),
					addCategory: (name) => this.addCategory(name),
					removeCategory: (id) => this.removeCategory(id),
					setCategory: (teamId, categoryId) => this.setCategory(teamId, categoryId),
					renameCategory: (id, name) => this.renameCategory(id, name),
					moveCategory: (id, delta) => this.moveCategory(id, delta),
					duplicateTeam: (index) => this.duplicateTeam(index),
					restoreDefaults: () => {
						this.restoreDefaults();
					},
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
			/** Read the provider/model catalogue, the tool catalogue, and the execution stream. */
			loadCatalogue() {
				this.loadModelCatalogue();
				this.loadToolCatalogue();
				this.ensureExecution();
			}
			/**
			* Open the Host execution stream unless this generation already holds one.
			*
			* The stream is the page's only live source of "is this Team executing", so
			* every page load and every Host notification re-subscribes a stream that
			* ended or failed — without a timer, and without trusting the last frame a
			* dead generation left behind.
			*/
			ensureExecution() {
				if (this.disposed || this.executionAbort !== void 0) return;
				const abort = new AbortController();
				this.executionAbort = abort;
				const generation = ++this.executionGeneration;
				this.execution = "loading";
				this.executions = [];
				this.publish();
				this.consumeExecution(abort, generation);
			}
			/**
			* Read whole-set execution frames until the stream ends.
			* @param abort - the generation's cancellation.
			* @param generation - the generation this read owns; a superseded read publishes nothing.
			*/
			async consumeExecution(abort, generation) {
				try {
					for await (const frame of this.ctx.remote.teamPresets.execution(abort.signal)) {
						if (this.disposed || generation !== this.executionGeneration) return;
						this.execution = "ready";
						this.executions = frame.teams;
						this.publish();
					}
					this.failExecution(generation);
				} catch (_failure) {
					this.failExecution(generation);
				}
			}
			/**
			* Record that the Host execution state is unknown.
			*
			* A stream that failed, or that ended without being cancelled, says nothing
			* about any Team: its last frame is dropped rather than kept as live truth.
			* @param generation - the generation whose read ended.
			*/
			failExecution(generation) {
				if (this.disposed || generation !== this.executionGeneration) return;
				this.executionAbort = void 0;
				this.execution = "error";
				this.executions = [];
				this.publish();
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
			/**
			* Read one namespaced Remote service, reporting a context that cannot reach it.
			*
			* A namespaced service resolves relative to the context that reads it: the
			* reading fiber (or an ancestor in the same isolate) must declare
			* `remote.<namespace>` in its own inject set, and a context that does not
			* throws `cannot get property "remote.<namespace>" without inject` on the
			* property access itself. That throw is synchronous, so an unguarded read from
			* inside plugin assembly takes the whole registration with it — this plugin
			* would rather publish the catalogue as failed and keep the page and the
			* composer mounted, because a UI that says which read failed is worth more
			* than one that never appears.
			* @param read - the property access to attempt.
			* @returns the read, or undefined when this context cannot reach the service.
			*/
			readNamespace(read) {
				try {
					return read();
				} catch (_unreachable) {
					return;
				}
			}
			loadModelCatalogue() {
				if (this.catalogueLoading || this.catalogue === "ready") return;
				const generation = this.catalogueGeneration;
				this.catalogueLoading = true;
				this.catalogue = "loading";
				this.publish();
				const read = this.readNamespace(() => this.ctx.remote.session.modelCatalog());
				if (read === void 0) {
					this.catalogue = "error";
					this.catalogueLoading = false;
					this.publish();
					return;
				}
				read.then((result) => {
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
				const read = this.readNamespace(() => this.ctx.remote.teamPresets.catalog());
				if (read === void 0) {
					this.toolCatalogue = "error";
					this.toolCatalogueLoading = false;
					this.publish();
					return;
				}
				read.then((result) => {
					if (!this.acceptsCatalogue(generation)) return;
					if (!result.ok) throw new Error(result.error.message);
					this.tools = result.value.tools.map((tool) => ({
						name: tool.name,
						description: tool.description,
						source: tool.source,
						...tool.captainOnly === true ? { captainOnly: true } : {},
						...tool.server === void 0 ? {} : { server: tool.server }
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
			* rebuilds the array and the touched record instead of mutating either. A
			* user edit also retires the last external-update report: the page is once
			* again acting on the draft the user holds.
			* @returns the current staged Teams.
			*/
			beginDraft() {
				this.externalUpdate = void 0;
				this.defaultsRestore = void 0;
				if (this.draft === void 0) {
					const snapshot = this.form.getSnapshot();
					const stored = snapshot.value?.teams ?? [];
					this.draft = structuredClone(stored);
					this.draftBase = new Map(stored.map((team) => [team.id, structuredClone(team)]));
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
			* Put the shipped default presets back at their document's content.
			*
			* Only the presets this plugin ships are touched: a Team the user created
			* keeps its identity, its content, and its position, and the model route and
			* tool policy configured for a shipped preset's slots are kept too, exactly as
			* an import keeps them — a shared document cannot be evidence for discarding a
			* local setting it does not carry. What the restore produces is staged, so it
			* is visible and saved like every other edit on the page; a restore that would
			* change nothing stages nothing and reports that instead of opening an empty
			* draft.
			* @returns how the restore resolved.
			*/
			restoreDefaults() {
				const restored = restoreBuiltinTeams(this.visibleTeams());
				if (restored.changed.length === 0) {
					this.defaultsRestore = "unchanged";
					this.publish();
					return "unchanged";
				}
				this.beginDraft();
				this.draft = restored.teams;
				this.defaultsRestore = "restored";
				this.publish();
				return "restored";
			}
			/**
			* Serialize one Team as the fixed shareable document.
			* @param index - the Team position to export.
			* @returns the document text, or undefined for a position the page does not show.
			*/
			exportTeam(index) {
				const team = this.visibleTeams()[index];
				if (team === void 0) return void 0;
				const officialSkills = team.officialSkills ?? builtinEntry(team.id)?.officialSkillBindings;
				return serializeTeamPreset(team, officialSkills === void 0 ? {} : { officialSkills });
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
				if (this.draft === void 0 || snapshot.status !== "ready" || !snapshot.writable) {
					if (this.draft !== void 0) this.publish({ failed: true });
					return;
				}
				const draft = this.draft;
				const revision = this.draftRevision;
				this.saving = true;
				this.externalUpdate = void 0;
				this.publish({
					saving: true,
					failed: false
				});
				let landed = false;
				try {
					landed = await this.form.mutate([{
						op: "set",
						path: ["teams"],
						value: draft.map((team) => teamJson(team))
					}], revision);
				} finally {
					this.saving = false;
				}
				if (this.disposed) return;
				if (landed) {
					this.draft = void 0;
					this.draftBase = void 0;
					this.draftRevision = void 0;
					this.defaultsRestore = void 0;
				} else this.reconcile();
				this.publish({
					saving: false,
					failed: !landed
				});
			}
			/**
			* Write the reader's own category list.
			*
			* Categories are local view fields, not part of the Team draft, so they are
			* written straight to their own path instead of riding the draft's save. The
			* fence is the same one the draft uses: a Host that moved past it refuses the
			* write and the page re-reads rather than overwriting.
			* @param next - the complete category list to store.
			* @returns whether the Host accepted the write.
			*/
			async writeCategories(next, memberships) {
				const snapshot = this.form.getSnapshot();
				if (snapshot.status !== "ready" || !snapshot.writable) {
					this.publish({ failed: true });
					return false;
				}
				const ops = [{
					op: "set",
					path: ["categories"],
					value: next.map((row) => ({ ...row }))
				}, {
					op: "set",
					path: ["teamCategories"],
					value: memberships.map((row) => ({ ...row }))
				}];
				const landed = await this.form.mutate(ops, snapshot.revision);
				if (this.disposed) return false;
				this.publish({ failed: !landed });
				return landed;
			}
			/**
			* Add one category.
			* @param name - the display name the user typed.
			* @returns whether the Host accepted the write.
			*/
			async addCategory(name) {
				const trimmed = name.trim();
				if (trimmed === "") return false;
				const current = this.projection();
				const existing = current.categories;
				const id = `cat-${Date.now().toString(36)}`;
				const order = existing.reduce((max, row) => Math.max(max, row.order), 0) + 1;
				return this.writeCategories([...existing, {
					id,
					name: trimmed,
					order
				}], current.teamCategories);
			}
			/**
			* Remove one category and every membership that pointed at it.
			* @param id - category identity.
			* @returns whether the Host accepted the write.
			*/
			async removeCategory(id) {
				const current = this.projection();
				return this.writeCategories(current.categories.filter((row) => row.id !== id), current.teamCategories.filter((row) => row.categoryId !== id));
			}
			/**
			* Rename one category.
			* @param id - category identity.
			* @param name - the new display name.
			* @returns whether the Host accepted the write.
			*/
			async renameCategory(id, name) {
				const trimmed = name.trim();
				if (trimmed === "") return false;
				const current = this.projection();
				return this.writeCategories(current.categories.map((row) => row.id === id ? {
					...row,
					name: trimmed
				} : row), current.teamCategories);
			}
			/**
			* Move one category earlier or later in the display order.
			*
			* Order is a local view concern, so it is stored as a dense 0..n-1 sequence
			* rather than swapping two arbitrary numbers: a document that was hand-edited
			* or partially written still normalises on the next move.
			* @param id - category identity.
			* @param delta - -1 to move up, 1 to move down.
			* @returns whether the Host accepted the write.
			*/
			async moveCategory(id, delta) {
				const current = this.projection();
				const ordered = [...current.categories].sort((left, right) => left.order - right.order);
				const from = ordered.findIndex((row) => row.id === id);
				const to = from + delta;
				if (from < 0 || to < 0 || to >= ordered.length) return false;
				const [moved] = ordered.splice(from, 1);
				if (moved === void 0) return false;
				ordered.splice(to, 0, moved);
				return this.writeCategories(ordered.map((row, index) => ({
					...row,
					order: index
				})), current.teamCategories);
			}
			/**
			* Move one Team into one category, or out of every category.
			* @param teamId - Team identity.
			* @param categoryId - category identity, or an empty string for none.
			* @returns whether the Host accepted the write.
			*/
			async setCategory(teamId, categoryId) {
				const current = this.projection();
				const without = current.teamCategories.filter((row) => row.teamId !== teamId);
				const next = categoryId === "" ? without : [...without, {
					teamId,
					categoryId
				}];
				return this.writeCategories(current.categories, next);
			}
			/** Drop every staged edit. */
			discard() {
				if (this.draft === void 0) return;
				this.draft = void 0;
				this.draftBase = void 0;
				this.draftRevision = void 0;
				this.externalUpdate = void 0;
				this.defaultsRestore = void 0;
				this.publish();
			}
			/**
			* Apply one Team to a Session, or clear its Team.
			*
			* The write goes through the Host's own `settings.mutate` with the revision
			* the describe mirror holds, which is what makes a refusal reportable: the
			* shared form's `mutate` answers only a boolean, so a refused selection used
			* to be indistinguishable from one that never happened. The mirror's answer
			* is folded back exactly as the shared form folds it, so every other settings
			* surface sees the selection immediately.
			*
			* One retry follows a refusal. A refused write triggers the mirror's recovery
			* read, so the retry carries the revision and the section the Host holds now —
			* a fence that was stale when the user clicked is then a real retry rather
			* than the same conflict forever, and a concurrent selection is preserved
			* instead of being overwritten by the array this attempt first built.
			* @param sessionId - the Session whose Team changes.
			* @param teamId - the selected Team identity; undefined clears the selection.
			* @returns once the write settled; the outcome is published on {@link store}.
			*/
			async selectTeam(sessionId, teamId) {
				this.selectionFailure = void 0;
				this.publish();
				const view = this.namespaceView();
				if (view === void 0 || this.storedSection() === void 0 || !this.documentWritable()) {
					this.failSelection({
						kind: "unavailable",
						sessionId,
						teamId,
						detail: void 0
					});
					return;
				}
				const attempt = await this.writeSelection(sessionId, teamId, view.revision);
				if (attempt.kind === "landed") return;
				const recovered = this.namespaceView();
				const retried = recovered === void 0 ? attempt : await this.writeSelection(sessionId, teamId, recovered.revision);
				if (retried.kind === "landed") return;
				this.failSelection({
					kind: retried.kind,
					sessionId,
					teamId,
					detail: retried.detail
				});
			}
			/**
			* Write one selection under one revision fence.
			* @param sessionId - the Session whose Team changes.
			* @param teamId - the selected Team identity; undefined clears the selection.
			* @param revision - the revision the write is fenced on.
			* @returns the outcome, with the Host's own refusal text when it refused.
			*/
			async writeSelection(sessionId, teamId, revision) {
				const stored = this.storedSection();
				/* v8 ignore next -- every caller resolves the section before it writes. */
				if (stored === void 0) return {
					kind: "failed",
					detail: void 0
				};
				const ops = [{
					op: "set",
					path: ["selections"],
					value: withSelection(stored.selections, sessionId, teamId).map((record) => ({
						sessionId: record.sessionId,
						teamId: record.teamId
					}))
				}];
				let response;
				try {
					response = await this.ctx.remote.settings.mutate(TEAM_PRESETS_NS, ops, revision);
				} catch (error) {
					await this.refreshStored();
					return {
						kind: "failed",
						detail: messageOf(error)
					};
				}
				if (this.disposed) return { kind: "landed" };
				if (!response.ok) {
					await this.refreshStored();
					return {
						kind: "refused",
						detail: response.error.message
					};
				}
				this.mirror.acceptView(response.value);
				return { kind: "landed" };
			}
			/**
			* Re-read the Host document after a write this client could not complete.
			*
			* The cross-namespace describe contract exposes `ensure`, which reads only
			* from an idle mirror, and a refused write is exactly the case where a HELD
			* view is stale. The read below is the same namespace read the mirror itself
			* performs and `acceptView` is the contract's own fold, so the shared document
			* is refreshed without reaching past the face the contract publishes.
			* @returns settlement once a refreshed view, when there is one, is folded.
			*/
			async refreshStored() {
				try {
					const response = await this.ctx.remote.settings.describe();
					if (!response.ok) return;
					const view = response.value.namespaces.find((row) => row.ns === TEAM_PRESETS_NS);
					if (view !== void 0) this.mirror.acceptView(view);
				} catch (_unreachable) {}
			}
			/**
			* Publish one selection failure for the page and the composer control.
			* @param failure - the refusal or failure to report.
			*/
			failSelection(failure) {
				this.selectionFailure = failure;
				this.publish();
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


		const key$1 = "dsh-agent-team-presets:client/TeamPresetsSection.module.css";
		if (typeof document !== "undefined" && !document.querySelector("style[data-team-presets-style=\"dsh-agent-team-presets:client/TeamPresetsSection.module.css\"]")) {
			const style = document.createElement("style");
			style.dataset.teamPresetsStyle = key$1;
			style.textContent = "._628ArG_section{--tp-accent-violet:#8d6bff;min-height:100%;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}._628ArG_page{flex-direction:column;gap:10px;max-width:520px;padding-bottom:8px;display:flex}._628ArG_pageHead{flex-direction:column;gap:2px;display:flex}._628ArG_crumb{color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:none;align-self:flex-start;align-items:center;gap:4px;padding:0;font-size:12px;line-height:18px;display:inline-flex}._628ArG_crumb:hover{color:var(--dsw-alias-label-primary)}._628ArG_title{margin:0;font-size:15px;font-weight:500;line-height:22px}._628ArG_intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}._628ArG_empty{color:var(--dsw-alias-label-tertiary);margin:4px 0;font-size:12px;line-height:18px}._628ArG_sectionTitle{color:var(--dsw-alias-label-secondary);padding-top:2px;font-size:12px;line-height:18px}._628ArG_tabs{border-bottom:1px solid var(--dsw-alias-border-l2);gap:6px;margin-bottom:10px;display:flex}._628ArG_actionRow{gap:8px;display:flex}._628ArG_fileInput{display:none}._628ArG_conflict{flex-direction:column;gap:6px;display:flex}._628ArG_conflict+._628ArG_conflict{margin-top:16px}._628ArG_conflictLead{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}._628ArG_conflictName{overflow-wrap:anywhere;font-size:13px;font-weight:500;line-height:18px}._628ArG_conflictMember{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 12px;display:flex}._628ArG_choiceRow{flex-wrap:wrap;gap:12px;display:flex}._628ArG_choice{cursor:pointer;align-items:center;gap:6px;font-size:12px;line-height:18px;display:inline-flex}._628ArG_card{border:.5px solid var(--dsw-alias-settings-card-stroke);background:var(--dsw-alias-settings-card-fill);border-radius:var(--dsw-radius-xl);flex-direction:column;gap:10px;padding:10px 12px;display:flex}._628ArG_cardHead{justify-content:space-between;align-items:center;gap:8px;display:flex}._628ArG_cardTitle{font-size:13px;font-weight:500;line-height:20px}._628ArG_rows{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-settings-card-fill);border-radius:17px;flex-direction:column;margin:0;padding:0;list-style:none;display:flex;overflow:hidden}._628ArG_rows>._628ArG_card{box-sizing:border-box;box-shadow:none;background:0 0;border:0;border-radius:0;flex-direction:row;align-items:center;gap:4px;min-height:64px;padding:6px 10px 6px 14px}._628ArG_rows>._628ArG_card:not(:last-child){border-bottom:1px solid var(--dsw-alias-border-l1)}._628ArG_rows>._628ArG_card:hover{background:var(--dsw-alias-interactive-bg-hover)}._628ArG_plainRows{flex-direction:column;gap:8px;margin:0;padding:0;list-style:none;display:flex}._628ArG_plainRows>._628ArG_card{flex-direction:row;align-items:center;gap:4px;padding:8px 12px}._628ArG_entry{align-items:center;gap:4px;display:flex}._628ArG_entryRow,._628ArG_rowMain{min-width:0;color:inherit;font:inherit;text-align:left;border-radius:var(--dsw-radius-md);cursor:pointer;background:0 0;border:none;flex:auto;align-items:center;gap:8px;padding:4px 2px;display:flex}._628ArG_rowMain:hover,._628ArG_entryRow:hover{background:var(--dsw-alias-interactive-bg-hover)}._628ArG_rowText{flex-direction:column;flex:auto;min-width:0;display:flex}._628ArG_rowName{text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:18px;overflow:hidden}._628ArG_rowMeta{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px;overflow:hidden}._628ArG_rowActions{flex:none;gap:2px;display:flex}._628ArG_chevron{color:var(--dsw-alias-label-tertiary);flex:none;font-size:14px;line-height:18px}._628ArG_dot{background:var(--dsw-alias-label-tertiary);border-radius:50%;flex:none;width:10px;height:10px}._628ArG_field{flex-direction:column;gap:4px;min-width:0;display:flex}._628ArG_field>*{box-sizing:border-box;min-width:0;max-width:100%}._628ArG_field input,._628ArG_field textarea,._628ArG_field select{box-sizing:border-box;width:100%;min-width:0;max-width:100%}._628ArG_fieldLabel{color:var(--dsw-alias-label-secondary);margin:10px 0 4px;font-size:12px;line-height:18px;display:block}._628ArG_input{box-sizing:border-box;width:100%;max-width:100%}._628ArG_textInput{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-specific-input-major);width:100%;height:32px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;outline:none;padding:0 10px;font-size:13px}._628ArG_textInput:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}select._628ArG_select{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l3);background-color:var(--dsw-specific-input-major);width:100%;height:32px;color:inherit;font:inherit;appearance:none;cursor:pointer;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 4.5 6 8l3.5-3.5' fill='none' stroke='%23818a96' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\");background-position:right 10px center;background-repeat:no-repeat;border-radius:8px;padding:0 30px 0 10px;font-size:13px}select._628ArG_select:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline:none}select._628ArG_select:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}._628ArG_toolGroup{flex-direction:column;gap:6px;min-width:0;display:flex}._628ArG_toolGroupHead{justify-content:space-between;align-items:center;gap:8px;min-width:0;display:flex}._628ArG_toolGroupToggle{min-width:0;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border:none;align-items:center;gap:6px;padding:0;display:flex}._628ArG_toolGroupCount{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;font-size:12px;line-height:18px}._628ArG_toolGrid{grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:10px 12px;min-width:0;display:grid}._628ArG_toolCheckbox{align-items:flex-start;min-width:0}._628ArG_toolCheckbox>span{overflow-wrap:anywhere}._628ArG_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:11px;line-height:17px}._628ArG_warn{color:var(--dsw-alias-state-warn-label);margin:0;font-size:11px;line-height:17px}._628ArG_select{border-radius:var(--dsw-radius-lg);border:.5px solid var(--dsw-alias-settings-card-stroke);background:var(--dsw-specific-input-major);width:100%;height:30px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;justify-content:space-between;align-items:center;gap:6px;padding:0 8px;font-size:12px;display:flex}select._628ArG_select:disabled{opacity:.5;cursor:default}._628ArG_selectLabel{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}._628ArG_prompt{box-sizing:border-box;border-radius:var(--dsw-radius-lg);border:.5px solid var(--dsw-alias-settings-card-stroke);background:var(--dsw-specific-input-major);width:100%;color:var(--dsw-alias-label-primary);font:inherit;resize:vertical;padding:8px;font-size:12px;line-height:18px}._628ArG_prompt:disabled{opacity:.6}._628ArG_swatches{flex-wrap:wrap;align-items:center;gap:6px;display:flex}._628ArG_swatch,._628ArG_swatchNone{border:.5px solid var(--dsw-alias-settings-card-stroke);cursor:pointer;border-radius:50%;width:18px;height:18px;padding:0}._628ArG_swatch[aria-pressed=true],._628ArG_swatchNone[aria-pressed=true]{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px}._628ArG_swatchNone{background:0 0}._628ArG_footer{background:var(--dsw-alias-bg-base);border-top:1px solid var(--dsw-alias-border-l1);justify-content:flex-end;align-items:center;gap:10px;margin-top:auto;padding:8px 0 6px;display:flex}._628ArG_footerNotes{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1);border-radius:8px;flex-direction:column;align-items:flex-start;gap:2px;min-width:0;margin-right:auto;padding:6px 10px;display:flex}._628ArG_footerActions{white-space:nowrap;flex-shrink:0;align-items:center;gap:10px;display:flex}._628ArG_footerNote{color:var(--dsw-alias-label-tertiary);background:0 0;border:0;padding:0;font-size:11px;line-height:17px}._628ArG_sepTitle{margin:18px 0 8px;font-size:13px;font-weight:550}._628ArG_skillGrid{grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:9px;margin:10px 0 13px;display:grid}._628ArG_skillCard input{width:16px;height:16px;accent-color:var(--dsw-alias-state-business-primary);flex:none;margin:0}._628ArG_skillCard{cursor:pointer;border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-settings-card-fill);border-radius:10px;flex-direction:column;gap:8px;min-width:0;min-height:128px;padding:11px;transition:border-color .15s,background .15s,box-shadow .15s;display:flex;position:relative}._628ArG_skillCard:hover{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 6%, var(--dsw-alias-settings-card-fill));border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 38%, transparent)}._628ArG_skillCard:has(input:checked){background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, var(--dsw-alias-settings-card-fill));border-color:var(--dsw-alias-state-business-primary);box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, transparent)}._628ArG_skillCardTop{justify-content:space-between;align-items:flex-start;gap:6px;display:flex}._628ArG_skillCardName{overflow-wrap:anywhere;color:var(--dsw-alias-label-primary);font-size:12px;font-weight:550;line-height:1.45}._628ArG_skillCardDesc{color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:11px;line-height:1.5;display:-webkit-box;overflow:hidden}._628ArG_skillCardTag{margin-top:auto}@media (width<=820px){._628ArG_skillGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}._628ArG_listToolbar{gap:8px;margin:10px 0 8px;display:flex}._628ArG_listSearch{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-specific-input-major);min-width:0;color:var(--dsw-alias-label-primary);border-radius:9px;outline:none;flex:1;padding:8px 11px;font-size:13px}._628ArG_chipRow{flex-wrap:wrap;gap:4px;margin-bottom:8px;display:flex}._628ArG_chip{border:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-radius:7px;padding:6px 10px;font-size:12px}._628ArG_chipActive{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}._628ArG_categoryPanel{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-settings-card-fill);border-radius:10px;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:8px;padding:9px 10px;display:flex}._628ArG_categoryPill{border:1px solid var(--dsw-alias-border-l3);border-radius:999px;align-items:center;gap:4px;padding:2px 4px 2px 9px;font-size:12px;display:inline-flex}._628ArG_pillInput{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-specific-input-major);width:92px;color:var(--dsw-alias-label-primary);border-radius:6px;padding:1px 6px;font-size:12px}._628ArG_panel{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-settings-card-fill);border-radius:12px;margin:12px 0;padding:12px 14px}._628ArG_muted{color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:1.55}._628ArG_filterRow{flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:6px;display:flex}._628ArG_filterLabel{color:var(--dsw-alias-label-secondary);flex:none;min-width:32px;font-size:12px}._628ArG_addRow{align-items:center;gap:8px;margin:10px 0 12px;display:flex}._628ArG_addRow ._628ArG_textInput{flex:auto;width:auto;min-width:0}._628ArG_addRow>*{white-space:nowrap;flex:none}._628ArG_selectWrap{position:relative}._628ArG_selectValue{text-overflow:ellipsis;white-space:nowrap;padding-right:4px;display:block;overflow:hidden}._628ArG_selectPop{z-index:30;border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-3);background:rgb(from var(--dsw-specific-menu,var(--dsw-alias-bg-layer-3)) r g b / 1);box-shadow:var(--dsw-elevation-prominent);border-radius:10px;max-height:232px;padding:4px;position:absolute;top:calc(100% + 4px);left:0;right:0;overflow:auto}._628ArG_selectOption{width:100%;color:inherit;font:inherit;text-align:left;cursor:pointer;white-space:nowrap;text-overflow:ellipsis;background:0 0;border:0;border-radius:7px;padding:7px 10px;font-size:13px;display:block;overflow:hidden}._628ArG_selectOption:hover{background:var(--dsw-alias-interactive-bg-hover)}._628ArG_selectOptionActive{background:var(--dsw-alias-interactive-bg-active);font-weight:550}._628ArG_rowsEmpty{text-align:center;color:var(--dsw-alias-label-secondary);padding:22px 14px;font-size:12.5px;list-style:none}._628ArG_emptyPage{text-align:center;color:var(--dsw-alias-label-secondary);border:1px dashed var(--dsw-alias-border-l3);border-radius:9px;margin:12px 0;padding:18px;font-size:13px}._628ArG_originTag{white-space:nowrap;border:1px solid #0000;border-radius:5px;align-self:flex-start;align-items:center;padding:0 6px;font-size:11px;line-height:18px;display:inline-flex}._628ArG_originBuiltin{color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, var(--dsw-alias-bg-layer-2));border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 34%, transparent)}._628ArG_originCustom{color:color-mix(in srgb, var(--tp-accent-violet) 62%, var(--dsw-alias-label-primary));background:color-mix(in srgb, var(--tp-accent-violet) 14%, var(--dsw-alias-bg-layer-2));border-color:color-mix(in srgb, var(--tp-accent-violet) 34%, transparent)}._628ArG_originOverride{color:var(--dsw-alias-state-warn-label);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 14%, var(--dsw-alias-bg-layer-2));border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 34%, transparent)}";
			document.head.appendChild(style);
		}
		var TeamPresetsSection_module_css_default = {
			"actionRow": "_628ArG_actionRow",
			"addRow": "_628ArG_addRow",
			"card": "_628ArG_card",
			"cardHead": "_628ArG_cardHead",
			"cardTitle": "_628ArG_cardTitle",
			"categoryPanel": "_628ArG_categoryPanel",
			"categoryPill": "_628ArG_categoryPill",
			"chevron": "_628ArG_chevron",
			"chip": "_628ArG_chip",
			"chipActive": "_628ArG_chipActive",
			"chipRow": "_628ArG_chipRow",
			"choice": "_628ArG_choice",
			"choiceRow": "_628ArG_choiceRow",
			"conflict": "_628ArG_conflict",
			"conflictLead": "_628ArG_conflictLead",
			"conflictMember": "_628ArG_conflictMember",
			"conflictName": "_628ArG_conflictName",
			"crumb": "_628ArG_crumb",
			"dot": "_628ArG_dot",
			"empty": "_628ArG_empty",
			"emptyPage": "_628ArG_emptyPage",
			"entry": "_628ArG_entry",
			"entryRow": "_628ArG_entryRow",
			"field": "_628ArG_field",
			"fieldLabel": "_628ArG_fieldLabel",
			"fileInput": "_628ArG_fileInput",
			"filterLabel": "_628ArG_filterLabel",
			"filterRow": "_628ArG_filterRow",
			"footer": "_628ArG_footer",
			"footerActions": "_628ArG_footerActions",
			"footerNote": "_628ArG_footerNote",
			"footerNotes": "_628ArG_footerNotes",
			"hint": "_628ArG_hint",
			"input": "_628ArG_input",
			"intro": "_628ArG_intro",
			"listSearch": "_628ArG_listSearch",
			"listToolbar": "_628ArG_listToolbar",
			"muted": "_628ArG_muted",
			"originBuiltin": "_628ArG_originBuiltin",
			"originCustom": "_628ArG_originCustom",
			"originOverride": "_628ArG_originOverride",
			"originTag": "_628ArG_originTag",
			"page": "_628ArG_page",
			"pageHead": "_628ArG_pageHead",
			"panel": "_628ArG_panel",
			"pillInput": "_628ArG_pillInput",
			"plainRows": "_628ArG_plainRows",
			"prompt": "_628ArG_prompt",
			"rowActions": "_628ArG_rowActions",
			"rowMain": "_628ArG_rowMain",
			"rowMeta": "_628ArG_rowMeta",
			"rowName": "_628ArG_rowName",
			"rows": "_628ArG_rows",
			"rowsEmpty": "_628ArG_rowsEmpty",
			"rowText": "_628ArG_rowText",
			"section": "_628ArG_section",
			"sectionTitle": "_628ArG_sectionTitle",
			"select": "_628ArG_select",
			"selectLabel": "_628ArG_selectLabel",
			"selectOption": "_628ArG_selectOption",
			"selectOptionActive": "_628ArG_selectOptionActive",
			"selectPop": "_628ArG_selectPop",
			"selectValue": "_628ArG_selectValue",
			"selectWrap": "_628ArG_selectWrap",
			"sepTitle": "_628ArG_sepTitle",
			"skillCard": "_628ArG_skillCard",
			"skillCardDesc": "_628ArG_skillCardDesc",
			"skillCardName": "_628ArG_skillCardName",
			"skillCardTag": "_628ArG_skillCardTag",
			"skillCardTop": "_628ArG_skillCardTop",
			"skillGrid": "_628ArG_skillGrid",
			"swatch": "_628ArG_swatch",
			"swatches": "_628ArG_swatches",
			"swatchNone": "_628ArG_swatchNone",
			"tabs": "_628ArG_tabs",
			"textInput": "_628ArG_textInput",
			"title": "_628ArG_title",
			"toolCheckbox": "_628ArG_toolCheckbox",
			"toolGrid": "_628ArG_toolGrid",
			"toolGroup": "_628ArG_toolGroup",
			"toolGroupCount": "_628ArG_toolGroupCount",
			"toolGroupHead": "_628ArG_toolGroupHead",
			"toolGroupToggle": "_628ArG_toolGroupToggle",
			"warn": "_628ArG_warn"
		};


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
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TeamPresetsSection_module_css_default.field,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: TeamPresetsSection_module_css_default.fieldLabel,
					children: props.label
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
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
					anchor: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TeamPresetsSection_module_css_default.select,
						disabled: props.disabled,
						"aria-haspopup": "listbox",
						"aria-expanded": open,
						onClick: () => {
							setOpen((value) => !value);
						},
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.selectLabel,
							children: current?.label ?? ""
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 14 })]
					})
				})]
			});
		}


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
		* The member page's Team Skill grid.
		*
		* One card per installed skill, checked when this exact role holds it. The grid
		* is the only place a skill is assigned, which is what the prototype specifies:
		* a skill page shows its references, and this page decides them.
		* @param props - the controller and the role slot being edited.
		* @returns the section, or nothing while the library is unavailable.
		*/
		/** The colour class that pairs with one origin, shared with the skill library. */
		function originToneClass(styles, origin) {
			if (origin === "builtin") return styles.originBuiltin ?? "";
			if (origin === "override") return styles.originOverride ?? "";
			return styles.originCustom ?? "";
		}
		/** The origin of a Team Skill as the reader sees it, never the raw field value. */
		function originCopy(origin, t) {
			if (origin === "builtin") return t("originBuiltin");
			if (origin === "override") return t("originOverride");
			return t("originCustom");
		}
		function SkillAssignmentGrid(props) {
			const [state, setState] = (0, react.useState)(props.controller.getSnapshot());
			(0, react.useEffect)(() => {
				const unsubscribe = props.controller.subscribe(() => {
					setState(props.controller.getSnapshot());
				});
				props.controller.refresh();
				return unsubscribe;
			}, [props.controller]);
			const assets = state.library?.assets ?? [];
			const held = new Set(assets.filter((asset) => asset.bindings.some((row) => row.teamId === props.teamId && row.roleId === props.roleId)).map((asset) => asset.id));
			if (state.status === "unavailable") return null;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("div", {
				className: TeamPresetsSection_module_css_default.sepTitle,
				children: [props.t("skillsAssignTitle"), (0, react_jsx_runtime.jsxs)("span", {
					className: TeamPresetsSection_module_css_default.hint,
					children: [
						" · ",
						String([...held].length),
						"/",
						String(assets.length)
					]
				})]
			}), (0, react_jsx_runtime.jsxs)("div", {
				className: TeamPresetsSection_module_css_default.panel,
				children: [
					(0, react_jsx_runtime.jsx)("p", {
						className: TeamPresetsSection_module_css_default.muted,
						style: { marginTop: 0 },
						children: props.t("skillsAssignHint")
					}),
					assets.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: TeamPresetsSection_module_css_default.muted,
						children: props.t("skillsAssignEmpty")
					}) : (0, react_jsx_runtime.jsx)("div", {
						className: TeamPresetsSection_module_css_default.skillGrid,
						children: assets.map((asset) => (0, react_jsx_runtime.jsxs)("label", {
							className: TeamPresetsSection_module_css_default.skillCard,
							children: [
								(0, react_jsx_runtime.jsxs)("span", {
									className: TeamPresetsSection_module_css_default.skillCardTop,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TeamPresetsSection_module_css_default.skillCardName,
										children: asset.skillId
									}), (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: held.has(asset.id),
										onChange: (event) => {
											if (event.target.checked) props.controller.assignSkill(props.teamId, props.roleId, asset.id);
											else props.controller.unassignSkill(props.teamId, props.roleId, asset.id);
										}
									})]
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.skillCardDesc,
									children: asset.description
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: `${TeamPresetsSection_module_css_default.skillCardTag} ${TeamPresetsSection_module_css_default.originTag} ${originToneClass(TeamPresetsSection_module_css_default, asset.origin)}`,
									children: originCopy(asset.origin, props.t)
								})
							]
						}, asset.id))
					}),
					state.message === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: TeamPresetsSection_module_css_default.muted,
						children: state.message
					})
				]
			})] });
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
			const unavailable = toolsReady ? agent.tools.filter((name) => !IMPLICIT_TOOLS.includes(name) && !props.tools.some((tool) => tool.name === name)) : [];
			const toolChoices = props.tools.length === 0 ? agent.tools.map((name) => ({
				name,
				description: "",
				source: "other"
			})) : props.tools;
			const toolGroups = (() => {
				const ours = toolChoices.filter((tool) => tool.source === "presets");
				const byServer = /* @__PURE__ */ new Map();
				const other = [];
				for (const tool of toolChoices) {
					if (tool.source === "presets") continue;
					if (tool.source === "mcp" && tool.server !== void 0) {
						byServer.set(tool.server, [...byServer.get(tool.server) ?? [], tool]);
						continue;
					}
					other.push(tool);
				}
				const groups = [];
				if (ours.length > 0) groups.push({
					key: "presets",
					label: t("toolsGroupPresets"),
					tools: ours
				});
				for (const [server, tools] of [...byServer.entries()].sort(([left], [right]) => left.localeCompare(right))) groups.push({
					key: `mcp:${server}`,
					label: `${t("toolsGroupMcp")}: ${server}`,
					tools
				});
				if (other.length > 0) groups.push({
					key: "other",
					label: t("toolsGroupOther"),
					tools: other
				});
				return groups;
			})();
			const [expandedGroups, setExpandedGroups] = (0, react.useState)([]);
			/** Whether this page may grant the tool at all; a member cannot grant captain-only. */
			const grantable = (tool) => !(props.role === "member" && tool.captainOnly === true);
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
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("header", {
					className: TeamPresetsSection_module_css_default.pageHead,
					children: [(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TeamPresetsSection_module_css_default.crumb,
						onClick: props.onBack,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								children: "‹"
							}),
							" ",
							props.teamName === "" ? t("back") : props.teamName
						]
					}), (0, react_jsx_runtime.jsxs)("h2", {
						className: TeamPresetsSection_module_css_default.title,
						children: [props.role === "captain" ? t("roleCaptain") : t("roleMember"), agent.name.trim() === "" ? "" : ` · ${agent.name.trim()}`]
					})]
				}),
				props.role === "captain" ? (0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.intro,
					children: t("captainHint")
				}) : null,
				(0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.cardTitle,
							children: t("identitySection")
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: TeamPresetsSection_module_css_default.field,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.fieldLabel,
								children: t("agentName")
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								className: TeamPresetsSection_module_css_default.input ?? "",
								value: agent.name,
								placeholder: t("agentNamePlaceholder"),
								disabled,
								onChange: (event) => {
									props.onChange({ name: event.target.value });
								}
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: TeamPresetsSection_module_css_default.field,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.fieldLabel,
								children: t("agentColor")
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: TeamPresetsSection_module_css_default.swatches,
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: TeamPresetsSection_module_css_default.swatchNone,
									"aria-label": t("effortDefault"),
									"aria-pressed": agent.color === NO_COLOR,
									disabled,
									onClick: () => {
										props.onChange({ color: NO_COLOR });
									}
								}), AGENT_COLORS.map((color) => (0, react_jsx_runtime.jsx)("button", {
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
						(0, react_jsx_runtime.jsxs)("div", {
							className: TeamPresetsSection_module_css_default.field,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.fieldLabel,
								children: t("agentDescription")
							}), (0, react_jsx_runtime.jsx)("textarea", {
								className: TeamPresetsSection_module_css_default.prompt,
								rows: 3,
								value: agent.description,
								disabled,
								onChange: (event) => {
									props.onChange({ description: event.target.value });
								}
							})]
						})
					]
				}),
				(0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.cardTitle,
							children: t("modelSection")
						}),
						route === void 0 ? (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.hint,
							children: t("captainModelHint")
						}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							(0, react_jsx_runtime.jsx)(FieldPicker, {
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
							(0, react_jsx_runtime.jsx)(FieldPicker, {
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
							(0, react_jsx_runtime.jsx)(FieldPicker, {
								label: t("effort"),
								value: route.reasoningEffort,
								options: effortOptions,
								disabled: disabled || route.model === "",
								onChange: (id) => {
									props.onChange({ reasoningEffort: id });
								}
							})
						] }),
						props.catalogueFailed ? (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.warn,
							role: "status",
							children: t("modelsFailed")
						}) : null,
						props.cataloguePartial ? (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.warn,
							role: "status",
							children: t("modelsPartial")
						}) : null
					]
				}),
				(0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.cardTitle,
							children: t("toolsSection")
						}),
						(0, react_jsx_runtime.jsx)(FieldPicker, {
							label: t("toolMode"),
							value: mode,
							options: modeOptions,
							disabled,
							onChange: (id) => {
								props.onChange({ toolMode: id === "custom" ? "custom" : "all" });
							}
						}),
						customTools ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: TeamPresetsSection_module_css_default.cardHead,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.fieldLabel,
									children: t("tools")
								}), (0, react_jsx_runtime.jsxs)("span", {
									className: TeamPresetsSection_module_css_default.rowActions,
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "ghost",
										disabled: disabled || !toolsReady || props.tools.length === 0,
										onClick: () => {
											props.onChange({ tools: props.tools.filter((tool) => !(props.role === "member" && tool.captainOnly === true)).map((tool) => tool.name) });
										},
										children: t("toolsSelectAll")
									}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
							toolGroups.map((group) => {
								const expanded = expandedGroups.includes(group.key);
								const grantableTools = group.tools.filter(grantable);
								const chosen = group.tools.filter((tool) => agent.tools.includes(tool.name)).length;
								const inside = new Set(group.tools.map((tool) => tool.name));
								const outside = agent.tools.filter((name) => !inside.has(name));
								const retained = group.tools.filter((tool) => agent.tools.includes(tool.name) && !grantable(tool)).map((tool) => tool.name);
								return (0, react_jsx_runtime.jsxs)("div", {
									className: TeamPresetsSection_module_css_default.toolGroup,
									children: [(0, react_jsx_runtime.jsxs)("div", {
										className: TeamPresetsSection_module_css_default.toolGroupHead,
										children: [(0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: TeamPresetsSection_module_css_default.toolGroupToggle,
											"aria-expanded": expanded,
											onClick: () => {
												setExpandedGroups((current) => current.includes(group.key) ? current.filter((entry) => entry !== group.key) : [...current, group.key]);
											},
											children: [
												(0, react_jsx_runtime.jsx)("span", {
													"aria-hidden": "true",
													children: expanded ? "▾" : "▸"
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: TeamPresetsSection_module_css_default.fieldLabel,
													children: group.label
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: TeamPresetsSection_module_css_default.toolGroupCount,
													children: `${String(chosen)}/${String(group.tools.length)}`
												})
											]
										}), (0, react_jsx_runtime.jsxs)("span", {
											className: TeamPresetsSection_module_css_default.rowActions,
											children: [
												(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													size: "sm",
													variant: "ghost",
													disabled: disabled || !toolsReady,
													onClick: () => {
														props.onChange({ tools: [
															...outside,
															...grantableTools.map((tool) => tool.name),
															...retained
														] });
													},
													children: t("toolsSelectAll")
												}),
												(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													size: "sm",
													variant: "ghost",
													disabled: disabled || !toolsReady,
													onClick: () => {
														const flipped = grantableTools.filter((tool) => !agent.tools.includes(tool.name)).map((tool) => tool.name);
														props.onChange({ tools: [
															...outside,
															...flipped,
															...retained
														] });
													},
													children: t("toolsInvert")
												}),
												(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													size: "sm",
													variant: "ghost",
													disabled: disabled || chosen === 0,
													onClick: () => {
														props.onChange({ tools: [...outside] });
													},
													children: t("toolsClear")
												})
											]
										})]
									}), expanded ? (0, react_jsx_runtime.jsx)("div", {
										className: TeamPresetsSection_module_css_default.toolGrid,
										role: "group",
										"aria-label": group.label,
										children: group.tools.map((tool) => {
											const restricted = !grantable(tool);
											const selected = agent.tools.includes(tool.name);
											return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Checkbox, {
												className: TeamPresetsSection_module_css_default.toolCheckbox,
												label: tool.name,
												title: restricted ? `${tool.description} ${t("toolsCaptainOnly")}` : tool.description,
												checked: selected,
												disabled: disabled || restricted && !selected || !toolsReady && !selected,
												onChange: (checked) => {
													props.onChange({ tools: checked ? [...agent.tools, tool.name] : agent.tools.filter((name) => name !== tool.name) });
												}
											}, tool.name);
										})
									}) : null]
								}, group.key);
							}),
							props.toolCatalogue === "loading" || props.toolCatalogue === "idle" ? (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.hint,
								role: "status",
								children: t("toolsLoading")
							}) : props.toolCatalogue === "error" ? (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.warn,
								role: "status",
								children: t("toolsFailed")
							}) : props.tools.length === 0 ? (0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.hint,
								children: t("toolsNoCatalog")
							}) : null,
							(0, react_jsx_runtime.jsx)("span", {
								className: agent.tools.length === 0 ? TeamPresetsSection_module_css_default.warn : TeamPresetsSection_module_css_default.hint,
								children: agent.tools.length === 0 ? t("toolsEmpty") : t("toolsHint")
							}),
							unavailable.length === 0 ? null : (0, react_jsx_runtime.jsxs)("div", {
								className: TeamPresetsSection_module_css_default.field,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.warn,
									children: t("toolsUnavailable")
								}), (0, react_jsx_runtime.jsx)("ul", {
									className: TeamPresetsSection_module_css_default.plainRows,
									children: unavailable.map((name) => (0, react_jsx_runtime.jsxs)("li", {
										className: TeamPresetsSection_module_css_default.entry,
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: TeamPresetsSection_module_css_default.rowName,
											children: name
										}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
						] }) : (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.hint,
							children: t("toolsAllHint")
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.hint,
							children: t("toolsScoped")
						})
					]
				}),
				(0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: TeamPresetsSection_module_css_default.cardTitle,
						children: t("promptSection")
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: TeamPresetsSection_module_css_default.field,
						children: [(0, react_jsx_runtime.jsx)("textarea", {
							className: TeamPresetsSection_module_css_default.prompt,
							rows: 8,
							value: agent.systemPrompt,
							placeholder: t("systemPromptPlaceholder"),
							disabled,
							onChange: (event) => {
								props.onChange({ systemPrompt: event.target.value });
							}
						}), (0, react_jsx_runtime.jsx)("span", {
							className: agent.systemPrompt.includes("{{") ? TeamPresetsSection_module_css_default.warn : TeamPresetsSection_module_css_default.hint,
							children: agent.systemPrompt.includes("{{") ? t("promptWarnBraces") : t("systemPromptHint")
						})]
					})]
				}),
				props.skills === void 0 ? null : (0, react_jsx_runtime.jsx)(SkillAssignmentGrid, {
					controller: props.skills,
					teamId: props.teamId,
					roleId: props.roleId,
					t: props.t
				}),
				props.onDelete === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
					className: TeamPresetsSection_module_css_default.actionRow,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						size: "sm",
						variant: "ghost",
						disabled,
						onClick: props.onDelete,
						children: t("deleteAgent")
					})
				})
			] });
		}


		/**
		* The category picker for a Team definition.
		*
		* A native select cannot be styled where it matters: its option list is drawn by
		* the platform, so it ignores the plugin's surface. This draws the trigger and the
		* list itself, borrowing the composer picker's row metrics.
		* @module dsh-agent-team-presets/client/CategorySelect
		*/
		/**
		* Render the picker.
		* @param props - the selection, the choices and the write callback.
		* @returns a trigger button and, while open, the option list beneath it.
		*/
		function CategorySelect(props) {
			const [open, setOpen] = (0, react.useState)(false);
			const wrap = (0, react.useRef)(null);
			const ordered = [...props.categories].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
			const current = ordered.find((entry) => entry.id === props.value);
			const label = current === void 0 ? props.noneLabel : current.name;
			(0, react.useEffect)(() => {
				if (!open) return;
				const onDown = (event) => {
					if (wrap.current?.contains(event.target) === true) return;
					setOpen(false);
				};
				const onKey = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				document.addEventListener("mousedown", onDown);
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("mousedown", onDown);
					document.removeEventListener("keydown", onKey);
				};
			}, [open]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TeamPresetsSection_module_css_default.selectWrap,
				ref: wrap,
				children: [(0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: TeamPresetsSection_module_css_default.select,
					disabled: props.disabled,
					"aria-haspopup": "listbox",
					"aria-expanded": open,
					onClick: () => {
						setOpen((value) => !value);
					},
					children: (0, react_jsx_runtime.jsx)("span", {
						className: TeamPresetsSection_module_css_default.selectValue,
						children: label
					})
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: TeamPresetsSection_module_css_default.selectPop,
					role: "listbox",
					children: [(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						role: "option",
						"aria-selected": props.value === "",
						className: `${TeamPresetsSection_module_css_default.selectOption} ${props.value === "" ? TeamPresetsSection_module_css_default.selectOptionActive : ""}`,
						onClick: () => {
							props.onChange("");
							setOpen(false);
						},
						children: props.noneLabel
					}), ordered.map((entry) => (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						role: "option",
						"aria-selected": props.value === entry.id,
						className: `${TeamPresetsSection_module_css_default.selectOption} ${props.value === entry.id ? TeamPresetsSection_module_css_default.selectOptionActive : ""}`,
						onClick: () => {
							props.onChange(entry.id);
							setOpen(false);
						},
						children: entry.name
					}, entry.id))]
				}) : null]
			});
		}


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
		* The display-metadata card.
		*
		* Everything it edits is user-facing only: the panel says so, and the fields are
		* written as one `metadata` patch so a Team's fingerprint (and therefore a
		* running task's applied definition) never changes because a label was edited.
		* @param props - the Team and the patch writer.
		* @returns the folded card.
		*/
		function MetadataPanel(props) {
			const existing = props.team.metadata ?? {};
			const [fields, setFields] = (0, react.useState)({
				summary: existing.summary ?? "",
				tags: (existing.tags ?? []).join(", "),
				useCases: (existing.useCases ?? []).join("\n"),
				quickPrompts: (existing.quickPrompts ?? []).join("\n"),
				notes: existing.notes ?? ""
			});
			(0, react.useEffect)(() => {
				const meta = props.team.metadata ?? {};
				setFields({
					summary: meta.summary ?? "",
					tags: (meta.tags ?? []).join(", "),
					useCases: (meta.useCases ?? []).join("\n"),
					quickPrompts: (meta.quickPrompts ?? []).join("\n"),
					notes: meta.notes ?? ""
				});
			}, [props.team.id, props.team.metadata]);
			const [open, setOpen] = (0, react.useState)(false);
			const commit = (next) => {
				setFields(next);
				props.onPatch({ metadata: {
					...next.summary.trim() === "" ? {} : { summary: next.summary.trim() },
					...next.notes.trim() === "" ? {} : { notes: next.notes.trim() },
					...next.tags.trim() === "" ? {} : { tags: next.tags.split(",").map((entry) => entry.trim()).filter((entry) => entry !== "") },
					...next.useCases.trim() === "" ? {} : { useCases: next.useCases.split("\n").map((entry) => entry.trim()).filter((entry) => entry !== "") },
					...next.quickPrompts.trim() === "" ? {} : { quickPrompts: next.quickPrompts.split("\n").map((entry) => entry.trim()).filter((entry) => entry !== "") }
				} });
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: TeamPresetsSection_module_css_default.card,
				children: [
					(0, react_jsx_runtime.jsxs)("span", {
						className: TeamPresetsSection_module_css_default.cardTitle,
						children: [
							props.t("metadataTitle"),
							" ",
							(0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.hint,
								children: props.t("metadataOnlyDisplay")
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: TeamPresetsSection_module_css_default.hint,
						children: props.t("metadataNote")
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => {
							setOpen((value) => !value);
						},
						children: open ? props.t("metadataFold") : props.t("metadataUnfold")
					}),
					open ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsx)("label", {
							className: TeamPresetsSection_module_css_default.fieldLabel,
							children: props.t("metadataSummary")
						}),
						(0, react_jsx_runtime.jsx)("textarea", {
							className: TeamPresetsSection_module_css_default.prompt,
							rows: 2,
							disabled: props.disabled,
							value: fields.summary,
							onChange: (event) => {
								commit({
									...fields,
									summary: event.target.value
								});
							}
						}),
						(0, react_jsx_runtime.jsx)("label", {
							className: TeamPresetsSection_module_css_default.fieldLabel,
							children: props.t("metadataTags")
						}),
						(0, react_jsx_runtime.jsx)("input", {
							className: TeamPresetsSection_module_css_default.textInput,
							disabled: props.disabled,
							value: fields.tags,
							onChange: (event) => {
								commit({
									...fields,
									tags: event.target.value
								});
							}
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: TeamPresetsSection_module_css_default.hint,
							children: props.t("metadataTagsHint")
						}),
						(0, react_jsx_runtime.jsx)("label", {
							className: TeamPresetsSection_module_css_default.fieldLabel,
							children: props.t("metadataUseCases")
						}),
						(0, react_jsx_runtime.jsx)("textarea", {
							className: TeamPresetsSection_module_css_default.prompt,
							rows: 3,
							disabled: props.disabled,
							value: fields.useCases,
							onChange: (event) => {
								commit({
									...fields,
									useCases: event.target.value
								});
							}
						}),
						(0, react_jsx_runtime.jsx)("label", {
							className: TeamPresetsSection_module_css_default.fieldLabel,
							children: props.t("metadataQuickPrompts")
						}),
						(0, react_jsx_runtime.jsx)("textarea", {
							className: TeamPresetsSection_module_css_default.prompt,
							rows: 3,
							disabled: props.disabled,
							value: fields.quickPrompts,
							onChange: (event) => {
								commit({
									...fields,
									quickPrompts: event.target.value
								});
							}
						}),
						(0, react_jsx_runtime.jsx)("label", {
							className: TeamPresetsSection_module_css_default.fieldLabel,
							children: props.t("metadataNotes")
						}),
						(0, react_jsx_runtime.jsx)("textarea", {
							className: TeamPresetsSection_module_css_default.prompt,
							rows: 2,
							disabled: props.disabled,
							value: fields.notes,
							onChange: (event) => {
								commit({
									...fields,
									notes: event.target.value
								});
							}
						})
					] }) : null
				]
			});
		}
		/**
		* Render one Team's page.
		* @param props - the Team, catalogue, copy, and navigation callbacks.
		* @returns the back row, the Team identity fields, and the roster.
		*/
		function TeamEditorView(props) {
			const { team, t, disabled } = props;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("header", {
					className: TeamPresetsSection_module_css_default.pageHead,
					children: [(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TeamPresetsSection_module_css_default.crumb,
						onClick: props.onBack,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								children: "‹"
							}),
							" ",
							t("backToList")
						]
					}), (0, react_jsx_runtime.jsx)("h2", {
						className: TeamPresetsSection_module_css_default.title,
						children: team.name === "" ? team.id : team.name
					})]
				}),
				(0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: TeamPresetsSection_module_css_default.field,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.fieldLabel,
							children: t("teamName")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
							className: TeamPresetsSection_module_css_default.input ?? "",
							value: team.name,
							placeholder: t("teamNamePlaceholder"),
							disabled,
							onChange: (event) => {
								props.onPatch({ name: event.target.value });
							}
						})]
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: TeamPresetsSection_module_css_default.field,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.fieldLabel,
							children: t("teamDescription")
						}), (0, react_jsx_runtime.jsx)("textarea", {
							className: TeamPresetsSection_module_css_default.prompt,
							rows: 3,
							value: team.description,
							disabled,
							onChange: (event) => {
								props.onPatch({ description: event.target.value });
							}
						})]
					})]
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: TeamPresetsSection_module_css_default.sectionTitle,
					children: t("teamSections")
				}),
				(0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: TeamPresetsSection_module_css_default.entryRow,
						onClick: () => {
							props.onOpenAgent("captain");
						},
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.dot,
								style: team.captain.color === "" ? void 0 : { background: team.captain.color },
								"aria-hidden": true
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TeamPresetsSection_module_css_default.rowText,
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: TeamPresetsSection_module_css_default.rowName,
									children: [t("roleCaptain"), team.captain.name.trim() === "" ? "" : ` · ${team.captain.name.trim()}`]
								}), (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.rowMeta,
									children: t("captainFollowsSession")
								})]
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.chevron,
								"aria-hidden": true,
								children: "›"
							})
						]
					}), (0, react_jsx_runtime.jsx)("p", {
						className: TeamPresetsSection_module_css_default.hint,
						children: t("captainHint")
					})]
				}),
				(0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: TeamPresetsSection_module_css_default.cardHead,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.cardTitle,
							children: t("members")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "outline",
							disabled,
							onClick: props.onAddMember,
							children: t("addMember")
						})]
					}), team.members.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: TeamPresetsSection_module_css_default.hint,
						children: t("emptyMembers")
					}) : (0, react_jsx_runtime.jsx)("ul", {
						className: TeamPresetsSection_module_css_default.plainRows,
						children: team.members.map((member, index) => (0, react_jsx_runtime.jsxs)("li", {
							className: TeamPresetsSection_module_css_default.entry,
							children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: TeamPresetsSection_module_css_default.entryRow,
								onClick: () => {
									props.onOpenAgent(index);
								},
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: TeamPresetsSection_module_css_default.dot,
										style: member.color === "" ? void 0 : { background: member.color },
										"aria-hidden": true
									}),
									(0, react_jsx_runtime.jsxs)("span", {
										className: TeamPresetsSection_module_css_default.rowText,
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: TeamPresetsSection_module_css_default.rowName,
											children: member.name.trim() === "" ? `${t("roleMember")} ${String(index + 1)}` : member.name.trim()
										}), (0, react_jsx_runtime.jsx)("span", {
											className: TeamPresetsSection_module_css_default.rowMeta,
											children: agentRoute(member, props.providers) || t("inheritSession")
										})]
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: TeamPresetsSection_module_css_default.chevron,
										"aria-hidden": true,
										children: "›"
									})
								]
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "ghost",
								disabled,
								onClick: () => {
									props.onRemoveMember(index);
								},
								children: t("removeMember")
							})]
						}, member.id ?? `${team.id}-member-${String(index)}`))
					})]
				}),
				props.onSetCategory === void 0 ? null : (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.card,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: TeamPresetsSection_module_css_default.cardTitle,
						children: props.t("categoryOf")
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: TeamPresetsSection_module_css_default.field,
						children: [(0, react_jsx_runtime.jsx)(CategorySelect, {
							value: props.categoryId ?? "",
							categories: props.categories ?? [],
							noneLabel: props.t("categoryNone"),
							disabled: props.disabled,
							onChange: (id) => {
								props.onSetCategory?.(id);
							}
						}), (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.hint,
							children: props.t("categoryNote")
						})]
					})]
				}),
				(0, react_jsx_runtime.jsx)(MetadataPanel, {
					team: props.team,
					disabled: props.disabled,
					onPatch: props.onPatch,
					t: props.t
				})
			] });
		}


		/**
		* The Team preset categories page.
		*
		* Categories are local view fields: they never leave this browser document and are
		* never exported with a preset. They live on their own page because renaming or
		* reordering them is occasional housekeeping, not something the list page should
		* crowd beside its filters.
		* @module dsh-agent-team-presets/client/TeamCategoryManager
		*/
		/**
		* Render the categories page.
		* @param props - the categories, their memberships, copy and write callbacks.
		* @returns the page header, the add field and one row per category.
		*/
		function TeamCategoryManager(props) {
			const { t } = props;
			const [draft, setDraft] = (0, react.useState)("");
			const [renaming, setRenaming] = (0, react.useState)("");
			const [renameText, setRenameText] = (0, react.useState)("");
			const ordered = [...props.categories].sort((left, right) => left.order - right.order);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("header", {
					className: TeamPresetsSection_module_css_default.pageHead,
					children: [
						(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: TeamPresetsSection_module_css_default.crumb,
							onClick: props.onBack,
							children: ["‹ ", t("title")]
						}),
						(0, react_jsx_runtime.jsx)("h2", {
							className: TeamPresetsSection_module_css_default.title,
							children: t("categoryTitle")
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: TeamPresetsSection_module_css_default.intro,
							children: t("categorySub")
						})
					]
				}),
				(0, react_jsx_runtime.jsxs)("div", {
					className: TeamPresetsSection_module_css_default.addRow,
					children: [(0, react_jsx_runtime.jsx)("input", {
						className: TeamPresetsSection_module_css_default.textInput,
						value: draft,
						placeholder: t("categoryName"),
						disabled: props.disabled,
						onChange: (event) => {
							setDraft(event.target.value);
						},
						onKeyDown: (event) => {
							if (event.key !== "Enter") return;
							props.onAdd(draft);
							setDraft("");
						}
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						size: "sm",
						variant: "outline",
						disabled: props.disabled,
						onClick: () => {
							props.onAdd(draft);
							setDraft("");
						},
						children: t("categoryAdd")
					})]
				}),
				ordered.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.empty,
					children: t("categoryEmpty")
				}) : (0, react_jsx_runtime.jsx)("ul", {
					className: TeamPresetsSection_module_css_default.plainRows,
					children: ordered.map((entry, index) => {
						const count = props.teamCategories.filter((row) => row.categoryId === entry.id).length;
						return (0, react_jsx_runtime.jsxs)("li", {
							className: TeamPresetsSection_module_css_default.card,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.rowMain,
								children: renaming === entry.id ? (0, react_jsx_runtime.jsx)("input", {
									className: TeamPresetsSection_module_css_default.textInput,
									autoFocus: true,
									value: renameText,
									onChange: (event) => {
										setRenameText(event.target.value);
									},
									onKeyDown: (event) => {
										if (event.key === "Escape") setRenaming("");
										if (event.key !== "Enter") return;
										props.onRename(entry.id, renameText);
										setRenaming("");
									}
								}) : (0, react_jsx_runtime.jsxs)("span", {
									className: TeamPresetsSection_module_css_default.rowText,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TeamPresetsSection_module_css_default.rowName,
										children: entry.name
									}), (0, react_jsx_runtime.jsxs)("span", {
										className: TeamPresetsSection_module_css_default.rowMeta,
										children: [
											String(count),
											" · ",
											t("categoryTeams")
										]
									})]
								})
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: TeamPresetsSection_module_css_default.rowActions,
								children: [
									renaming === entry.id ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => {
											props.onRename(entry.id, renameText);
											setRenaming("");
										},
										children: t("categorySave")
									}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "ghost",
										disabled: props.disabled,
										onClick: () => {
											setRenaming(entry.id);
											setRenameText(entry.name);
										},
										children: t("categoryRename")
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "ghost",
										disabled: props.disabled || index === 0,
										onClick: () => {
											props.onMove(entry.id, -1);
										},
										children: t("categoryUp")
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "ghost",
										disabled: props.disabled || index === ordered.length - 1,
										onClick: () => {
											props.onMove(entry.id, 1);
										},
										children: t("categoryDown")
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "ghost",
										disabled: props.disabled,
										onClick: () => {
											props.onRemove(entry.id);
										},
										children: t("categoryRemove")
									})
								]
							})]
						}, entry.id);
					})
				}),
				(0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.hint,
					children: t("categoryNote")
				})
			] });
		}


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
			return (0, react_jsx_runtime.jsxs)("span", {
				className: TeamPresetsSection_module_css_default.choiceRow,
				children: [(0, react_jsx_runtime.jsxs)("label", {
					className: TeamPresetsSection_module_css_default.choice,
					children: [(0, react_jsx_runtime.jsx)("input", {
						type: "radio",
						name,
						checked: value === "replace",
						...autofocus ? { "data-modal-autofocus": true } : {},
						onChange: () => {
							onChange("replace");
						}
					}), (0, react_jsx_runtime.jsx)("span", { children: labels.replace })]
				}), (0, react_jsx_runtime.jsxs)("label", {
					className: TeamPresetsSection_module_css_default.choice,
					children: [(0, react_jsx_runtime.jsx)("input", {
						type: "radio",
						name,
						checked: value === "rename",
						onChange: () => {
							onChange("rename");
						}
					}), (0, react_jsx_runtime.jsx)("span", { children: labels.rename })]
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
			return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				onClose: props.onCancel,
				title: t("importConflictTitle"),
				closeLabel: t("close"),
				footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					onClick: props.onCancel,
					children: t("cancel")
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
				children: [(0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.conflict,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.conflictLead,
							children: t("importTeamConflict")
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.conflictName,
							children: plan.targetName
						}),
						choices("import-team", teamChoice, setTeamChoice, {
							replace: t("importTeamReplace"),
							rename: t("importTeamRename")
						}, true),
						teamChoice === "rename" ? (0, react_jsx_runtime.jsxs)("div", {
							className: TeamPresetsSection_module_css_default.field,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.fieldLabel,
								children: t("importNewTeamName")
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								className: TeamPresetsSection_module_css_default.input ?? "",
								value: teamName,
								onChange: (event) => {
									setTeamName(event.target.value);
								}
							})]
						}) : null
					]
				}), !agentCollisions ? null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [plan.captainConflict === "" ? null : (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.conflict,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.conflictLead,
							children: t("importCaptainConflict")
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.conflictName,
							children: plan.captainConflict
						}),
						choices("import-captain", captainChoice, setCaptainChoice, {
							replace: t("importCaptainReplace"),
							rename: t("importCaptainRename")
						})
					]
				}), plan.memberConflicts.length === 0 ? null : (0, react_jsx_runtime.jsxs)("section", {
					className: TeamPresetsSection_module_css_default.conflict,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: TeamPresetsSection_module_css_default.conflictLead,
						children: t("importMemberConflict")
					}), (0, react_jsx_runtime.jsx)("ul", {
						className: TeamPresetsSection_module_css_default.plainRows,
						children: plan.memberConflicts.map((name) => (0, react_jsx_runtime.jsxs)("li", {
							className: TeamPresetsSection_module_css_default.conflictMember,
							children: [(0, react_jsx_runtime.jsx)("span", {
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
			const [query, setQuery] = (0, react.useState)("");
			const [source, setSource] = (0, react.useState)("all");
			const [series, setSeries] = (0, react.useState)("all");
			const [category, setCategory] = (0, react.useState)("");
			const tokens = queryTokens(query);
			const visible = (0, react.useMemo)(() => props.teams.filter((team) => {
				const matchesSource = source === "all" || teamOrigin(team.id).source === source;
				const matchesSeries = series === "all" || teamSeriesOf(team.id) === series;
				const matchesCategory = category === "" || (props.teamCategories ?? []).some((row) => row.teamId === team.id && row.categoryId === category);
				const matchesQuery = tokens.length === 0 || matchTeam(team, tokens) !== void 0;
				return matchesSource && matchesSeries && matchesCategory && matchesQuery;
			}), [
				props.teams,
				props.teamCategories,
				source,
				series,
				category,
				tokens
			]);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("header", {
					className: TeamPresetsSection_module_css_default.pageHead,
					children: [(0, react_jsx_runtime.jsx)("h2", {
						className: TeamPresetsSection_module_css_default.title,
						children: t("title")
					}), (0, react_jsx_runtime.jsx)("p", {
						className: TeamPresetsSection_module_css_default.intro,
						children: t("description")
					})]
				}),
				(0, react_jsx_runtime.jsxs)("div", {
					className: TeamPresetsSection_module_css_default.actionRow,
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "outline",
							disabled,
							onClick: props.onCreate,
							children: t("newTeam")
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "outline",
							disabled,
							onClick: () => {
								fileInput.current?.click();
							},
							children: t("importPreset")
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "outline",
							disabled,
							onClick: props.onRestoreDefaults,
							children: t("restoreDefaults")
						}),
						props.onManageCategories === void 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "outline",
							onClick: props.onManageCategories,
							children: t("categoryManagePage")
						}),
						(0, react_jsx_runtime.jsx)("input", {
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
				(0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.hint,
					children: t("importNote")
				}),
				(0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.hint,
					children: t("restoreDefaultsHint")
				}),
				props.importError === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.warn,
					role: "status",
					children: t(props.importError)
				}),
				(0, react_jsx_runtime.jsx)("div", {
					className: TeamPresetsSection_module_css_default.listToolbar,
					children: (0, react_jsx_runtime.jsx)("input", {
						className: TeamPresetsSection_module_css_default.listSearch,
						value: query,
						placeholder: t("listSearch"),
						onChange: (event) => {
							setQuery(event.target.value);
						}
					})
				}),
				(0, react_jsx_runtime.jsxs)("div", {
					className: TeamPresetsSection_module_css_default.filterRow,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.filterLabel,
							children: t("filterSource")
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${TeamPresetsSection_module_css_default.chip} ${source === "all" ? TeamPresetsSection_module_css_default.chipActive : ""}`,
							onClick: () => {
								setSource("all");
							},
							children: t("listAll")
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${TeamPresetsSection_module_css_default.chip} ${source === "builtin" ? TeamPresetsSection_module_css_default.chipActive : ""}`,
							onClick: () => {
								setSource("builtin");
								setCategory("");
							},
							children: t("listBuiltin")
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${TeamPresetsSection_module_css_default.chip} ${source === "custom" ? TeamPresetsSection_module_css_default.chipActive : ""}`,
							onClick: () => {
								setSource("custom");
								setSeries("all");
							},
							children: t("listCustom")
						})
					]
				}),
				(0, react_jsx_runtime.jsxs)("div", {
					className: TeamPresetsSection_module_css_default.filterRow,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.filterLabel,
							children: t("filterCategory")
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${TeamPresetsSection_module_css_default.chip} ${series === "all" && category === "" ? TeamPresetsSection_module_css_default.chipActive : ""}`,
							onClick: () => {
								setSeries("all");
								setCategory("");
							},
							children: t("listAll")
						}),
						source !== "custom" ? TEAM_SERIES.map((entry) => (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${TeamPresetsSection_module_css_default.chip} ${series === entry.id ? TeamPresetsSection_module_css_default.chipActive : ""}`,
							onClick: () => {
								setSeries(series === entry.id ? "all" : entry.id);
								setCategory("");
							},
							children: entry.id === "classic-development" ? t("seriesDevelopment") : t("seriesWorkModes")
						}, entry.id)) : null,
						source !== "builtin" ? [...props.categories ?? []].sort((left, right) => left.order - right.order).map((entry) => (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${TeamPresetsSection_module_css_default.chip} ${category === entry.id ? TeamPresetsSection_module_css_default.chipActive : ""}`,
							onClick: () => {
								setCategory(category === entry.id ? "" : entry.id);
								setSeries("all");
							},
							children: entry.name
						}, entry.id)) : null,
						source === "custom" && (props.categories ?? []).length === 0 ? (0, react_jsx_runtime.jsx)("span", {
							className: TeamPresetsSection_module_css_default.filterLabel,
							children: t("filterNoCategory")
						}) : null
					]
				}),
				(0, react_jsx_runtime.jsxs)("p", {
					className: TeamPresetsSection_module_css_default.hint,
					children: [
						t("listMatched"),
						" ",
						visible.length,
						" · ",
						t("listNoInject")
					]
				}),
				props.teams.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.emptyPage,
					children: t("emptyTeams")
				}) : (0, react_jsx_runtime.jsxs)("ul", {
					className: TeamPresetsSection_module_css_default.rows,
					children: [visible.length === 0 ? (0, react_jsx_runtime.jsx)("li", {
						className: TeamPresetsSection_module_css_default.rowsEmpty,
						children: t("listNoMatch")
					}) : null, visible.map((team) => (0, react_jsx_runtime.jsxs)("li", {
						className: TeamPresetsSection_module_css_default.card,
						"data-series": teamSeriesOf(team.id) ?? "",
						children: [(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: TeamPresetsSection_module_css_default.rowMain,
							onClick: () => {
								props.onOpen(team.id);
							},
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TeamPresetsSection_module_css_default.dot,
								style: team.captain.color === "" ? void 0 : { background: team.captain.color },
								"aria-hidden": true
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: TeamPresetsSection_module_css_default.rowText,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.rowName,
									children: team.name === "" ? team.id : team.name
								}), (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.rowMeta,
									children: `${String(team.members.length)} ${t("memberCount")} · ${t("captainFollowsSession")}`
								})]
							})]
						}), (0, react_jsx_runtime.jsxs)("span", {
							className: TeamPresetsSection_module_css_default.rowActions,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => {
										props.onExport(team.id);
									},
									children: t("exportPreset")
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									variant: "ghost",
									disabled,
									onClick: () => {
										props.onDuplicate(team.id);
									},
									children: t("duplicate")
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
					}, team.id))]
				})
			] });
		}


		const key = "dsh-agent-team-presets:client/TeamSkillsView.module.css";
		if (typeof document !== "undefined" && !document.querySelector("style[data-team-presets-style=\"dsh-agent-team-presets:client/TeamSkillsView.module.css\"]")) {
			const style = document.createElement("style");
			style.dataset.teamPresetsStyle = key;
			style.textContent = "._5P1EWa_page,._5P1EWa_page *,._5P1EWa_page :before,._5P1EWa_page :after{box-sizing:border-box}._5P1EWa_page{--tp-accent-violet:#8d6bff;flex-direction:column;gap:4px;display:flex}._5P1EWa_crumb{color:var(--dsw-alias-label-secondary);text-align:left;cursor:pointer;background:0 0;border:0;padding:2px 0;font-size:13px}._5P1EWa_crumb:hover{color:var(--dsw-alias-label-primary)}._5P1EWa_headRow{justify-content:space-between;align-items:flex-start;gap:14px;display:flex}._5P1EWa_headText{min-width:0}._5P1EWa_titleActions{flex-shrink:0;gap:8px;padding-top:4px;display:flex}._5P1EWa_title{margin:2px 0 0;font-size:21px;font-weight:550}._5P1EWa_sub{color:var(--dsw-alias-label-secondary);margin:0 0 4px;font-size:13px}._5P1EWa_actions{flex-wrap:wrap;gap:9px;margin:10px 0;display:flex}._5P1EWa_info{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);border-radius:10px;gap:8px;margin:8px 0;padding:10px 12px;font-size:12.5px;line-height:1.55;display:flex}._5P1EWa_infoError{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, var(--dsw-alias-bg-layer-1));border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 38%, transparent)}._5P1EWa_toolbar{flex-wrap:wrap;gap:9px;margin:10px 0;display:flex}._5P1EWa_search{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-specific-input-major);min-width:190px;color:inherit;border-radius:9px;outline:none;flex:1;padding:8px 12px}._5P1EWa_search:focus{border-color:var(--dsw-alias-state-business-primary)}._5P1EWa_segment{flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:8px;display:flex}._5P1EWa_active{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary);font-weight:550}._5P1EWa_rowlist{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-2);border-radius:17px;overflow:hidden}._5P1EWa_row{background:var(--dsw-alias-bg-layer-2);text-align:left;cursor:pointer;border:0;align-items:center;gap:11px;width:100%;min-height:64px;padding:12px 14px;display:flex}._5P1EWa_row:not(:last-child){border-bottom:1px solid var(--dsw-alias-border-l1)}._5P1EWa_row:hover{background:var(--dsw-alias-interactive-bg-hover)}._5P1EWa_dot{background:var(--dsw-alias-state-business-primary);border-radius:5px;flex-shrink:0;width:12px;height:12px}._5P1EWa_dotCustom{background:var(--tp-accent-violet)}._5P1EWa_main{flex:1;min-width:0;display:block}._5P1EWa_rowTitle{flex-wrap:wrap;align-items:center;gap:6px;font-size:14px;font-weight:520;display:flex}._5P1EWa_rowSub{color:var(--dsw-alias-label-secondary);white-space:nowrap;text-overflow:ellipsis;font-size:12px;display:block;overflow:hidden}._5P1EWa_chev{color:var(--dsw-alias-label-tertiary);font-size:18px;font-weight:300}._5P1EWa_tag{border:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-radius:5px;padding:0 5px;font-size:11px;font-weight:400}._5P1EWa_tagOrigin{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, var(--dsw-alias-bg-layer-2));border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 34%, transparent);color:var(--dsw-alias-state-business-primary)}._5P1EWa_tagWarn{color:var(--dsw-alias-state-warn-label);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 14%, var(--dsw-alias-bg-layer-2));border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 34%, transparent)}._5P1EWa_tagOk{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 14%, var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 34%, transparent)}._5P1EWa_pills{flex-wrap:wrap;gap:6px;margin:6px 0 12px;display:flex}._5P1EWa_sectionTitle{margin:18px 0 8px;font-size:13px;font-weight:550}._5P1EWa_fileArea{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-2);border-radius:11px;min-height:260px;display:flex;overflow:hidden}._5P1EWa_fileTree{border-right:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);flex-shrink:0;width:200px;max-width:43%;padding:9px 8px;overflow:auto}._5P1EWa_fileTree button{text-align:left;width:100%;color:var(--dsw-alias-label-secondary);cursor:pointer;word-break:break-all;background:0 0;border:0;border-radius:6px;padding:7px;font-size:12px;display:block}._5P1EWa_fileTree button:hover{background:var(--dsw-alias-interactive-bg-hover)}._5P1EWa_fileTree button._5P1EWa_active{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary);font-weight:550}._5P1EWa_fileEditor{flex-direction:column;flex:1;min-width:0;display:flex}._5P1EWa_fileTop{color:var(--dsw-alias-label-secondary);border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);justify-content:space-between;gap:8px;padding:7px 10px;font-size:12px;display:flex}._5P1EWa_code{resize:vertical;background:var(--dsw-alias-markdown-code-block);width:100%;min-height:220px;color:inherit;border:0;outline:none;flex:1;padding:10px 12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.55}._5P1EWa_panel{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-2);border-radius:12px;margin:12px 0;padding:12px 14px}._5P1EWa_panelTitle{margin-bottom:6px;font-size:13px;font-weight:550}._5P1EWa_bindRow{align-items:center;gap:10px;padding:8px 0;display:flex}._5P1EWa_bindRow:not(:last-child){border-bottom:1px solid var(--dsw-alias-border-l1)}._5P1EWa_mini{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;padding:4px 6px;font-size:12px}._5P1EWa_mini:hover{color:var(--dsw-alias-label-primary);text-decoration:underline}._5P1EWa_muted{color:var(--dsw-alias-label-secondary);font-size:12.5px}._5P1EWa_empty{text-align:center;color:var(--dsw-alias-label-tertiary);border:1px dashed var(--dsw-alias-border-l3);border-radius:9px;padding:18px;font-size:13px}._5P1EWa_message{margin-top:10px;font-size:12.5px}._5P1EWa_messageFailed{color:var(--dsw-alias-state-error-primary)}._5P1EWa_dialogBackdrop{background:var(--dsw-alias-bg-mask-2);z-index:40;justify-content:center;align-items:center;display:flex;position:fixed;inset:0}._5P1EWa_dialog{box-sizing:border-box;background:var(--dsw-alias-bg-layer-3);width:min(510px,100%);max-height:85vh;box-shadow:var(--dsw-elevation-prominent);border-radius:15px;padding:20px;overflow:auto}._5P1EWa_dialog h2{margin:0 0 9px;font-size:17px;font-weight:570}._5P1EWa_dialogActions{justify-content:flex-end;gap:8px;margin-top:16px;display:flex}._5P1EWa_field{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-specific-input-major);width:100%;color:inherit;border-radius:9px;margin:4px 0 10px;padding:8px 11px}._5P1EWa_label{color:var(--dsw-alias-label-secondary);font-size:12.5px}._5P1EWa_scan{border:1px solid var(--dsw-alias-border-l3);border-radius:8px;flex-direction:column;gap:6px;margin:10px 0;padding:10px 12px;font-size:12.5px;display:flex}._5P1EWa_scanHead{font-weight:600}._5P1EWa_scanList{flex-direction:column;gap:4px;margin:0;padding:0;list-style:none;display:flex}._5P1EWa_scanRow{flex-wrap:wrap;align-items:center;gap:8px;display:flex}._5P1EWa_scanFolder{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}";
			document.head.appendChild(style);
		}
		var TeamSkillsView_module_css_default = {
			"actions": "_5P1EWa_actions",
			"active": "_5P1EWa_active",
			"bindRow": "_5P1EWa_bindRow",
			"chev": "_5P1EWa_chev",
			"code": "_5P1EWa_code",
			"crumb": "_5P1EWa_crumb",
			"dialog": "_5P1EWa_dialog",
			"dialogActions": "_5P1EWa_dialogActions",
			"dialogBackdrop": "_5P1EWa_dialogBackdrop",
			"dot": "_5P1EWa_dot",
			"dotCustom": "_5P1EWa_dotCustom",
			"empty": "_5P1EWa_empty",
			"field": "_5P1EWa_field",
			"fileArea": "_5P1EWa_fileArea",
			"fileEditor": "_5P1EWa_fileEditor",
			"fileTop": "_5P1EWa_fileTop",
			"fileTree": "_5P1EWa_fileTree",
			"headRow": "_5P1EWa_headRow",
			"headText": "_5P1EWa_headText",
			"info": "_5P1EWa_info",
			"infoError": "_5P1EWa_infoError",
			"label": "_5P1EWa_label",
			"main": "_5P1EWa_main",
			"message": "_5P1EWa_message",
			"messageFailed": "_5P1EWa_messageFailed",
			"mini": "_5P1EWa_mini",
			"muted": "_5P1EWa_muted",
			"page": "_5P1EWa_page",
			"panel": "_5P1EWa_panel",
			"panelTitle": "_5P1EWa_panelTitle",
			"pills": "_5P1EWa_pills",
			"row": "_5P1EWa_row",
			"rowlist": "_5P1EWa_rowlist",
			"rowSub": "_5P1EWa_rowSub",
			"rowTitle": "_5P1EWa_rowTitle",
			"scan": "_5P1EWa_scan",
			"scanFolder": "_5P1EWa_scanFolder",
			"scanHead": "_5P1EWa_scanHead",
			"scanList": "_5P1EWa_scanList",
			"scanRow": "_5P1EWa_scanRow",
			"search": "_5P1EWa_search",
			"sectionTitle": "_5P1EWa_sectionTitle",
			"segment": "_5P1EWa_segment",
			"sub": "_5P1EWa_sub",
			"tag": "_5P1EWa_tag",
			"tagOk": "_5P1EWa_tagOk",
			"tagOrigin": "_5P1EWa_tagOrigin",
			"tagWarn": "_5P1EWa_tagWarn",
			"title": "_5P1EWa_title",
			"titleActions": "_5P1EWa_titleActions",
			"toolbar": "_5P1EWa_toolbar"
		};


		/**
		* The Team Skill settings pages: a library list and one skill's detail, exactly
		* as the v0.1.6 native prototype defines them (new views only — the 0.1.5 Team
		* pages around them are unchanged).
		*
		* The library page owns discovery: search, the built-in/custom segment, and the
		* three actions the prototype puts in the title row. The detail page owns one
		* skill: its file tree and editor, its member references, and the deletion the
		* Host refuses while a member still holds it. Assignment itself belongs to the
		* member page, so this file never invents a second place to bind a skill.
		* @module dsh-agent-team-presets/client/TeamSkillsView
		*/
		/**
		* Read one line of provenance text.
		* @param asset - the row.
		* @returns a short label.
		*/
		/** The colour class that pairs with one origin, shared with the member cards. */
		function originTone(styles, origin) {
			if (origin === "builtin") return styles.originBuiltin ?? "";
			if (origin === "override") return styles.originOverride ?? "";
			return styles.originCustom ?? "";
		}
		/** Locale text for each refusal the scanner can report. */
		const SCAN_REASON_KEYS = {
			"missing-skill-file": "skillsScanMissingSkill",
			"invalid-frontmatter": "skillsScanInvalidFrontmatter",
			"invalid-name": "skillsScanInvalidName",
			"missing-description": "skillsScanMissingDescription",
			"too-many-files": "skillsScanTooLarge",
			"file-too-large": "skillsScanTooLarge",
			"folder-too-large": "skillsScanTooLarge",
			"too-long": "skillsScanTooLarge",
			"symlink-escape": "skillsScanSymlink",
			"not-directory": "skillsScanNotDirectory",
			"unreadable": "skillsScanUnreadable",
			"duplicate": "skillsScanDuplicate",
			"duplicate-path": "skillsScanDuplicate",
			"install-refused": "skillsScanInstallRefused"
		};
		/** One scan row's explanation, localized when the scanner's code is known. */
		function scanReasonText(entry, t) {
			const key = entry.reason === void 0 ? void 0 : SCAN_REASON_KEYS[entry.reason];
			const label = entry.reason === void 0 ? "" : key === void 0 ? entry.reason : t(key);
			return entry.detail === void 0 ? label : `${label} (${entry.detail})`;
		}
		function originLabel(asset, t) {
			if (asset.origin === "builtin") return t("originBuiltin");
			if (asset.origin === "override") return t("originOverride");
			return t("originCustom");
		}
		/** The Team Skill settings pages. */
		function TeamSkillsView(props) {
			const { controller, t } = props;
			const [state, setState] = (0, react.useState)(controller.getSnapshot());
			const [page, setPage] = (0, react.useState)({ kind: "list" });
			const [query, setQuery] = (0, react.useState)("");
			const [origin, setOrigin] = (0, react.useState)("all");
			const [draft, setDraft] = (0, react.useState)("");
			const [creating, setCreating] = (0, react.useState)(false);
			const [name, setName] = (0, react.useState)("");
			const [description, setDescription] = (0, react.useState)("");
			const [confirmDelete, setConfirmDelete] = (0, react.useState)(false);
			const [deleteOutcome, setDeleteOutcome] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				const unsubscribe = controller.subscribe(() => {
					setState(controller.getSnapshot());
				});
				controller.refresh();
				return unsubscribe;
			}, [controller]);
			(0, react.useEffect)(() => {
				setDraft(state.fileText ?? "");
			}, [state.fileText]);
			const assets = state.library?.assets ?? [];
			const visible = (0, react.useMemo)(() => assets.filter((asset) => {
				const matchesOrigin = origin === "all" || (origin === "builtin" ? asset.origin === "builtin" : asset.origin !== "builtin");
				const haystack = `${asset.skillId} ${asset.description}`.toLocaleLowerCase();
				return matchesOrigin && query.trim().split(/\s+/u).every((token) => haystack.includes(token.toLocaleLowerCase()));
			}), [
				assets,
				origin,
				query
			]);
			const detail = state.detail;
			const selected = page.kind === "detail" ? assets.find((asset) => asset.id === page.assetId) : void 0;
			/**
			* Pick a folder and hand its files to the Host.
			* @param list - the picker's files.
			*/
			const importFolder = async (list) => {
				if (list === null || list.length === 0) return;
				const files = [];
				for (const file of Array.from(list)) {
					const relative = file.webkitRelativePath ?? "";
					const path = relative === "" ? file.name : relative.includes("/") ? relative.slice(relative.indexOf("/") + 1) : relative;
					files.push({
						path,
						content: new Uint8Array(await file.arrayBuffer())
					});
				}
				await controller.importFolder(files);
			};
			if (state.status === "unavailable") return (0, react_jsx_runtime.jsxs)("div", {
				className: TeamSkillsView_module_css_default.page,
				children: [(0, react_jsx_runtime.jsx)("h2", {
					className: TeamSkillsView_module_css_default.title,
					children: t("skillsTitle")
				}), (0, react_jsx_runtime.jsx)("div", {
					className: TeamSkillsView_module_css_default.info,
					children: state.issue ?? t("skillsEmpty")
				})]
			});
			if (page.kind === "detail") return (0, react_jsx_runtime.jsxs)("div", {
				className: TeamSkillsView_module_css_default.page,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: TeamSkillsView_module_css_default.crumb,
					onClick: () => {
						setPage({ kind: "list" });
						setConfirmDelete(false);
						setDeleteOutcome(void 0);
					},
					children: ["‹ ", t("skillsTitle")]
				}), detail === void 0 || selected === void 0 ? (0, react_jsx_runtime.jsx)("div", {
					className: TeamSkillsView_module_css_default.empty,
					children: t("skillsEmpty")
				}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					(0, react_jsx_runtime.jsx)("h2", {
						className: TeamSkillsView_module_css_default.title,
						children: detail.asset.skillId
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: TeamSkillsView_module_css_default.sub,
						children: detail.asset.description
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TeamSkillsView_module_css_default.pills,
						children: [
							(0, react_jsx_runtime.jsxs)("span", {
								className: `${TeamPresetsSection_module_css_default.originTag} ${originTone(TeamPresetsSection_module_css_default, detail.asset.origin)}`,
								children: [
									originLabel(detail.asset, t),
									" · ",
									detail.asset.editable ? t("skillsEditable") : t("skillsReadonly")
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TeamSkillsView_module_css_default.tag,
								children: [
									t("skillsVersion"),
									" ",
									detail.asset.version
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TeamSkillsView_module_css_default.tag,
								children: [
									detail.asset.fileCount,
									" ",
									t("skillsFiles")
								]
							}),
							detail.asset.updateAvailable === true ? (0, react_jsx_runtime.jsx)("span", {
								className: `${TeamSkillsView_module_css_default.tag} ${TeamSkillsView_module_css_default.tagWarn}`,
								children: t("skillsOverrideOn")
							}) : null,
							(detail.asset.clashesWith?.length ?? 0) > 0 ? (0, react_jsx_runtime.jsx)("span", {
								className: `${TeamSkillsView_module_css_default.tag} ${TeamSkillsView_module_css_default.tagWarn}`,
								children: t("skillsNameClash")
							}) : null
						]
					}),
					(detail.asset.clashesWith?.length ?? 0) > 0 ? (0, react_jsx_runtime.jsxs)("div", {
						className: TeamSkillsView_module_css_default.info,
						children: [
							t("skillsNameClashBody"),
							"：",
							[detail.asset.id, ...detail.asset.clashesWith ?? []].join(" / ")
						]
					}) : null,
					(() => {
						const missing = (detail.dependencies?.executables ?? []).filter((row) => !row.found);
						const unverified = detail.asset.mcpServers;
						if (missing.length === 0 && unverified.length === 0) return null;
						return (0, react_jsx_runtime.jsx)("div", {
							className: `${TeamSkillsView_module_css_default.info} ${missing.length > 0 ? TeamSkillsView_module_css_default.infoError : ""}`,
							children: missing.length > 0 ? (0, react_jsx_runtime.jsxs)("span", { children: [
								t("skillsBlockedAssign"),
								"：",
								missing.map((row) => row.name).join(", ")
							] }) : (0, react_jsx_runtime.jsxs)("span", { children: [
								t("skillsMcpUnverified"),
								"：",
								unverified.join(", ")
							] })
						});
					})(),
					(0, react_jsx_runtime.jsx)("div", {
						className: TeamSkillsView_module_css_default.sectionTitle,
						children: t("skillsResources")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TeamSkillsView_module_css_default.fileArea,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: TeamSkillsView_module_css_default.fileTree,
							children: detail.files.map((file) => (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: state.file === file.path ? TeamSkillsView_module_css_default.active : "",
								onClick: () => {
									controller.openFile(file.path);
								},
								children: [file.path.includes("/") ? "↳ " : "◫ ", file.path]
							}, file.path))
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: TeamSkillsView_module_css_default.fileEditor,
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: TeamSkillsView_module_css_default.fileTop,
								children: [(0, react_jsx_runtime.jsx)("span", { children: state.file ?? "SKILL.md" }), (0, react_jsx_runtime.jsx)("span", { children: detail.asset.editable ? t("skillsEditable") : t("skillsReadonly") })]
							}), (0, react_jsx_runtime.jsx)("textarea", {
								className: TeamSkillsView_module_css_default.code,
								spellCheck: false,
								value: draft,
								readOnly: !detail.asset.editable,
								onChange: (event) => {
									setDraft(event.target.value);
								}
							})]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TeamSkillsView_module_css_default.actions,
						children: [
							detail.asset.editable ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								onClick: () => {
									controller.saveFile(state.file ?? "SKILL.md", draft);
								},
								children: t("skillsSaveFile")
							}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								onClick: () => {
									controller.createOverride(detail.asset.skillId);
								},
								children: t("skillsMakeCopy")
							}),
							detail.asset.origin === "override" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								onClick: () => {
									controller.resetOverride(detail.asset.id);
								},
								children: t("skillsResetCopy")
							}) : null,
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								onClick: () => {
									navigator.clipboard?.writeText(detail.directory);
								},
								children: t("skillsOpenAssetFolder")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								onClick: () => {
									setConfirmDelete(true);
									setDeleteOutcome(void 0);
								},
								children: t("skillsDelete")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TeamSkillsView_module_css_default.panel,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: TeamSkillsView_module_css_default.panelTitle,
							children: [
								t("skillsBindings"),
								" · ",
								detail.asset.bindings.length
							]
						}), detail.asset.bindings.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: TeamSkillsView_module_css_default.muted,
							children: t("skillsNoBinding")
						}) : detail.asset.bindings.map((row) => (0, react_jsx_runtime.jsxs)("div", {
							className: TeamSkillsView_module_css_default.bindRow,
							children: [
								(0, react_jsx_runtime.jsx)("span", { className: TeamSkillsView_module_css_default.dot }),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TeamSkillsView_module_css_default.main,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TeamSkillsView_module_css_default.rowTitle,
										children: row.teamName
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TeamSkillsView_module_css_default.rowSub,
										children: row.roleName
									})]
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: TeamSkillsView_module_css_default.mini,
									onClick: () => {
										controller.unassign(row.teamId, row.roleId);
									},
									children: t("skillsUnbind")
								})
							]
						}, `${row.teamId}:${row.roleId}`))]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TeamSkillsView_module_css_default.panel,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: TeamSkillsView_module_css_default.panelTitle,
							children: t("skillsDeps")
						}), detail.asset.mcpServers.length === 0 && (detail.dependencies?.executables.length ?? 0) === 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: TeamSkillsView_module_css_default.muted,
							children: t("skillsNoDeps")
						}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [detail.asset.mcpServers.map((server) => (0, react_jsx_runtime.jsxs)("div", {
							className: TeamSkillsView_module_css_default.muted,
							children: [
								"MCP · ",
								server,
								" ",
								(0, react_jsx_runtime.jsx)("span", {
									className: TeamSkillsView_module_css_default.tag,
									children: t("skillsDeclared")
								})
							]
						}, server)), (detail.dependencies?.executables ?? []).map((row) => (0, react_jsx_runtime.jsxs)("div", {
							className: TeamSkillsView_module_css_default.muted,
							children: [
								row.name,
								" ",
								(0, react_jsx_runtime.jsx)("span", {
									className: `${TeamSkillsView_module_css_default.tag} ${row.found ? TeamSkillsView_module_css_default.tagOk : TeamSkillsView_module_css_default.tagWarn}`,
									children: row.found ? t("skillsFound") : t("skillsMissing")
								})
							]
						}, row.name))] })]
					}),
					state.message === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
						className: `${TeamSkillsView_module_css_default.message} ${state.failed ? TeamSkillsView_module_css_default.messageFailed : ""}`,
						children: state.message
					}),
					confirmDelete ? (0, react_jsx_runtime.jsx)("div", {
						className: TeamSkillsView_module_css_default.dialogBackdrop,
						onClick: () => {
							setConfirmDelete(false);
							setDeleteOutcome(void 0);
						},
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: TeamSkillsView_module_css_default.dialog,
							role: "dialog",
							"aria-modal": "true",
							onClick: (event) => {
								event.stopPropagation();
							},
							children: [
								(0, react_jsx_runtime.jsx)("h2", { children: t("skillsDeleteTitle") }),
								(0, react_jsx_runtime.jsx)("p", {
									className: TeamSkillsView_module_css_default.muted,
									children: t("skillsDeleteBody")
								}),
								detail.asset.origin === "builtin" ? (0, react_jsx_runtime.jsx)("div", {
									className: `${TeamSkillsView_module_css_default.info} ${TeamSkillsView_module_css_default.infoError}`,
									style: { margin: "12px 0 0" },
									children: (0, react_jsx_runtime.jsx)("strong", { children: t("skillsDeleteBuiltinWarning") })
								}) : null,
								detail.asset.bindings.length > 0 ? (0, react_jsx_runtime.jsxs)("div", {
									className: `${TeamSkillsView_module_css_default.info} ${TeamSkillsView_module_css_default.infoError}`,
									style: {
										margin: "12px 0 0",
										display: "flex",
										flexDirection: "column",
										gap: "6px"
									},
									children: [(0, react_jsx_runtime.jsx)("div", { children: (0, react_jsx_runtime.jsx)("strong", { children: t("skillsDeleteBoundWarning") }) }), (0, react_jsx_runtime.jsx)("div", {
										style: {
											display: "flex",
											flexDirection: "column",
											gap: "4px",
											fontSize: "12px",
											maxHeight: "140px",
											overflowY: "auto"
										},
										children: detail.asset.bindings.map((b) => (0, react_jsx_runtime.jsxs)("div", { children: [
											"• ",
											b.teamName,
											" → ",
											b.roleName
										] }, `${b.teamId}:${b.roleId}`))
									})]
								}) : null,
								deleteOutcome?.ok === false && deleteOutcome.blockers.length > 0 ? (0, react_jsx_runtime.jsxs)("div", {
									className: `${TeamSkillsView_module_css_default.info} ${TeamSkillsView_module_css_default.infoError}`,
									style: {
										margin: "12px 0 0",
										display: "flex",
										flexDirection: "column",
										gap: "6px"
									},
									children: [(0, react_jsx_runtime.jsx)("div", { children: (0, react_jsx_runtime.jsx)("strong", { children: t("skillsDeleteBlocked") }) }), (0, react_jsx_runtime.jsx)("div", {
										style: {
											display: "flex",
											flexDirection: "column",
											gap: "4px",
											fontSize: "12px"
										},
										children: deleteOutcome.blockers.map((blocker, idx) => (0, react_jsx_runtime.jsxs)("div", { children: ["• ", blocker.detail || blocker.kind] }, idx))
									})]
								}) : null,
								(0, react_jsx_runtime.jsxs)("div", {
									className: TeamSkillsView_module_css_default.dialogActions,
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										onClick: () => {
											setConfirmDelete(false);
											setDeleteOutcome(void 0);
										},
										children: t("skillsCancel")
									}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										disabled: detail.asset.origin === "builtin" || detail.asset.bindings.length > 0,
										onClick: () => {
											controller.remove(detail.asset.id).then((outcome) => {
												if (outcome?.ok === true) {
													setConfirmDelete(false);
													setDeleteOutcome(void 0);
													setPage({ kind: "list" });
												} else setDeleteOutcome(outcome);
											});
										},
										children: t("skillsConfirm")
									})]
								})
							]
						})
					}) : null
				] })]
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TeamSkillsView_module_css_default.page,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: TeamSkillsView_module_css_default.headRow,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: TeamSkillsView_module_css_default.headText,
							children: [(0, react_jsx_runtime.jsx)("h2", {
								className: TeamSkillsView_module_css_default.title,
								children: t("skillsTitle")
							}), (0, react_jsx_runtime.jsx)("p", {
								className: TeamSkillsView_module_css_default.sub,
								children: t("skillsSub")
							})]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: TeamSkillsView_module_css_default.titleActions,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								onClick: () => {
									setCreating(true);
								},
								children: t("skillsNew")
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								onClick: () => {
									controller.openScanFolder();
								},
								children: state.canOpenScanFolder ? t("skillsOpenScanFolder") : t("skillsCopyScanFolder")
							})]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TeamSkillsView_module_css_default.info,
						children: ["ⓘ ", (0, react_jsx_runtime.jsx)("span", { children: t("skillsNote") })]
					}),
					state.scanFolderNotice === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
						className: TeamSkillsView_module_css_default.info,
						children: (0, react_jsx_runtime.jsx)("span", { children: t(state.scanFolderNotice === "opened" ? "skillsScanFolderOpened" : state.scanFolderNotice === "copied" ? "skillsScanFolderCopied" : "skillsScanFolderCopyFailed") })
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TeamSkillsView_module_css_default.actions,
						children: [
							(0, react_jsx_runtime.jsx)("input", {
								id: "team-skill-import",
								type: "file",
								multiple: true,
								style: { display: "none" },
								onChange: (event) => {
									importFolder(event.target.files);
								},
								webkitdirectory: ""
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								onClick: () => {
									document.getElementById("team-skill-import")?.click();
								},
								children: t("skillsImport")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								onClick: () => {
									controller.scanImportFolder();
								},
								children: t("skillsScan")
							})
						]
					}),
					state.scan === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", {
						className: TeamSkillsView_module_css_default.scan,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: TeamSkillsView_module_css_default.scanHead,
								children: t("skillsScanSummary").replace("{scanned}", String(state.scan.scanned)).replace("{imported}", String(state.scan.imported)).replace("{existing}", String(state.scan.existing)).replace("{invalid}", String(state.scan.invalid))
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: TeamSkillsView_module_css_default.muted,
								children: [
									t("skillsScanHint"),
									" ",
									state.scan.root
								]
							}),
							state.scan.entries.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
								className: TeamSkillsView_module_css_default.muted,
								children: t("skillsScanEmpty")
							}) : (0, react_jsx_runtime.jsx)("ul", {
								className: TeamSkillsView_module_css_default.scanList,
								children: state.scan.entries.map((entry) => (0, react_jsx_runtime.jsxs)("li", {
									className: TeamSkillsView_module_css_default.scanRow,
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: TeamSkillsView_module_css_default.scanFolder,
											children: entry.folder
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: `${TeamSkillsView_module_css_default.tag} ${entry.status === "imported" ? TeamSkillsView_module_css_default.tagOk : entry.status === "invalid" ? TeamSkillsView_module_css_default.tagWarn : ""}`,
											children: t(entry.status === "imported" ? "skillsScanImported" : entry.status === "existing" ? "skillsScanExisting" : "skillsScanInvalid")
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: TeamSkillsView_module_css_default.muted,
											children: entry.status === "invalid" ? scanReasonText(entry, t) : entry.assetId ?? entry.skillId ?? ""
										})
									]
								}, entry.folder))
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: TeamSkillsView_module_css_default.toolbar,
						children: (0, react_jsx_runtime.jsx)("input", {
							className: TeamSkillsView_module_css_default.search,
							value: query,
							placeholder: t("skillsSearch"),
							onChange: (event) => {
								setQuery(event.target.value);
							}
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TeamSkillsView_module_css_default.segment,
						children: [
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `${TeamPresetsSection_module_css_default.chip} ${origin === "all" ? TeamPresetsSection_module_css_default.chipActive : ""}`,
								onClick: () => {
									setOrigin("all");
								},
								children: t("skillsAll")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `${TeamPresetsSection_module_css_default.chip} ${origin === "builtin" ? TeamPresetsSection_module_css_default.chipActive : ""}`,
								onClick: () => {
									setOrigin("builtin");
								},
								children: t("skillsBuiltin")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `${TeamPresetsSection_module_css_default.chip} ${origin === "custom" ? TeamPresetsSection_module_css_default.chipActive : ""}`,
								onClick: () => {
									setOrigin("custom");
								},
								children: t("skillsCustom")
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: TeamSkillsView_module_css_default.rowlist,
						children: visible.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: TeamSkillsView_module_css_default.empty,
							children: t("skillsEmpty")
						}) : visible.map((asset) => (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: TeamSkillsView_module_css_default.row,
							onClick: () => {
								setPage({
									kind: "detail",
									assetId: asset.id
								});
								controller.select(asset.id);
							},
							children: [
								(0, react_jsx_runtime.jsx)("span", { className: `${TeamSkillsView_module_css_default.dot} ${asset.origin === "builtin" ? "" : TeamSkillsView_module_css_default.dotCustom}` }),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TeamSkillsView_module_css_default.main,
									children: [(0, react_jsx_runtime.jsxs)("span", {
										className: TeamSkillsView_module_css_default.rowTitle,
										children: [
											asset.skillId,
											(0, react_jsx_runtime.jsx)("span", {
												className: `${TeamPresetsSection_module_css_default.originTag} ${originTone(TeamPresetsSection_module_css_default, asset.origin)}`,
												children: originLabel(asset, t)
											}),
											asset.updateAvailable === true ? (0, react_jsx_runtime.jsx)("span", {
												className: `${TeamSkillsView_module_css_default.tag} ${TeamSkillsView_module_css_default.tagWarn}`,
												children: t("skillsOverrideOn")
											}) : null
										]
									}), (0, react_jsx_runtime.jsxs)("span", {
										className: TeamSkillsView_module_css_default.rowSub,
										children: [
											asset.description,
											" · ",
											asset.fileCount,
											" ",
											t("skillsFiles"),
											" · ",
											t("skillsBound"),
											" ",
											asset.bindings.length
										]
									})]
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: TeamSkillsView_module_css_default.chev,
									children: "›"
								})
							]
						}, asset.id))
					}),
					state.message === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
						className: `${TeamSkillsView_module_css_default.message} ${state.failed ? TeamSkillsView_module_css_default.messageFailed : ""}`,
						children: state.message
					}),
					creating ? (0, react_jsx_runtime.jsx)("div", {
						className: TeamSkillsView_module_css_default.dialogBackdrop,
						onClick: () => {
							setCreating(false);
						},
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: TeamSkillsView_module_css_default.dialog,
							role: "dialog",
							"aria-modal": "true",
							onClick: (event) => {
								event.stopPropagation();
							},
							children: [
								(0, react_jsx_runtime.jsx)("h2", { children: t("skillsNewTitle") }),
								(0, react_jsx_runtime.jsx)("label", {
									className: TeamSkillsView_module_css_default.label,
									children: t("skillsName")
								}),
								(0, react_jsx_runtime.jsx)("input", {
									className: TeamSkillsView_module_css_default.field,
									value: name,
									placeholder: "example-skill",
									onChange: (event) => {
										setName(event.target.value);
									}
								}),
								(0, react_jsx_runtime.jsx)("label", {
									className: TeamSkillsView_module_css_default.label,
									children: t("skillsDesc")
								}),
								(0, react_jsx_runtime.jsx)("input", {
									className: TeamSkillsView_module_css_default.field,
									value: description,
									placeholder: t("skillsDesc"),
									onChange: (event) => {
										setDescription(event.target.value);
									}
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: TeamSkillsView_module_css_default.dialogActions,
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										onClick: () => {
											setCreating(false);
										},
										children: t("skillsCancel")
									}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										onClick: () => {
											controller.create(name, description).then(() => {
												setName("");
												setDescription("");
												setCreating(false);
											});
										},
										children: t("skillsConfirm")
									})]
								})
							]
						})
					}) : null
				]
			});
		}


		/**
		* Browser file plumbing for the fixed Team preset format: read one chosen
		* document, and offer one Team as a download.
		* @module dsh-agent-team-presets/preset-file
		*/
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


		/**
		* The Agent Team presets settings page: three stacked pages — the Team list,
		* one Team's roster, and one captain or member — with a shared save footer.
		*/
		/**
		* One tab in the section's own tab bar.
		* @param props - active state, click handler, and label.
		* @returns the tab button.
		*/
		function TabButton(props) {
			return (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				role: "tab",
				"aria-selected": props.active,
				onClick: props.onClick,
				style: {
					background: "none",
					border: "none",
					borderBottom: props.active ? "2px solid currentColor" : "2px solid transparent",
					padding: "6px 10px",
					marginBottom: -1,
					fontWeight: props.active ? 600 : 400,
					opacity: props.active ? 1 : .65,
					color: "inherit",
					cursor: "pointer"
				},
				children: props.children
			});
		}
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
		* Read one coordinated external update as the footer's status sentences.
		*
		* The saved version wins silently, so the line names what the Host rewrote,
		* added, and deleted, and says a staged edit was replaced or dropped only for
		* the Teams where one really was.
		* @param notice - what the coordination adopted, added, and removed.
		* @param t - the page's locale reader.
		* @returns the sentences the footer shows.
		*/
		function externalUpdateText(notice, t) {
			const parts = [];
			if (notice.teams.length > 0) {
				parts.push(notice.teams.length === 1 ? t("externalUpdateOne", { team: notice.teams[0] ?? "" }) : t("externalUpdateMany", {
					count: notice.teams.length,
					teams: notice.teams.join(", ")
				}));
				if (notice.overridden.length > 0) parts.push(notice.overridden.length === 1 ? t("externalUpdateOverriddenOne", { team: notice.overridden[0] ?? "" }) : t("externalUpdateOverriddenMany", {
					count: notice.overridden.length,
					teams: notice.overridden.join(", ")
				}));
			}
			if (notice.added.length > 0) parts.push(notice.added.length === 1 ? t("externalAddedOne", { team: notice.added[0] ?? "" }) : t("externalAddedMany", {
				count: notice.added.length,
				teams: notice.added.join(", ")
			}));
			if (notice.removed.length > 0) {
				parts.push(notice.removed.length === 1 ? t("externalRemovedOne", { team: notice.removed[0] ?? "" }) : t("externalRemovedMany", {
					count: notice.removed.length,
					teams: notice.removed.join(", ")
				}));
				if (notice.removedEdited.length > 0) parts.push(notice.removedEdited.length === 1 ? t("externalRemovedEditedOne", { team: notice.removedEdited[0] ?? "" }) : t("externalRemovedEditedMany", {
					count: notice.removedEdited.length,
					teams: notice.removedEdited.join(", ")
				}));
			}
			return parts.join(" ");
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
			const [tab, setTab] = (0, react.useState)("teams");
			const [importError, setImportError] = (0, react.useState)(void 0);
			const [importPlan, setImportPlan] = (0, react.useState)(void 0);
			const [importGeneration, setImportGeneration] = (0, react.useState)(0);
			const { refreshCatalogue } = props;
			(0, react.useEffect)(() => {
				refreshCatalogue();
			}, [refreshCatalogue]);
			if (tab === "skills" && props.skills !== void 0) return (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsxs)("div", {
				role: "tablist",
				className: TeamPresetsSection_module_css_default.tabs,
				children: [(0, react_jsx_runtime.jsx)(TabButton, {
					active: false,
					onClick: () => {
						setTab("teams");
					},
					children: t("tabTeams")
				}), (0, react_jsx_runtime.jsx)(TabButton, {
					active: true,
					onClick: () => {
						setTab("skills");
					},
					children: t("tabSkills")
				})]
			}), (0, react_jsx_runtime.jsx)(TeamSkillsView, {
				controller: props.skills,
				t
			})] });
			if (state.status !== "ready") {
				const issue = state.formIssue === void 0 ? void 0 : t(FORM_ISSUE_KEYS[state.formIssue]);
				return (0, react_jsx_runtime.jsx)("p", {
					className: TeamPresetsSection_module_css_default.empty,
					role: "status",
					children: issue ?? (state.status === "loading" ? t("sectionLoading") : t("unavailable"))
				});
			}
			const disabled = !state.writable || state.formIssue !== void 0;
			const teamList = state.teams;
			const addressed = view.kind === "team" || view.kind === "agent" ? view.teamId : void 0;
			const found = addressed === void 0 ? void 0 : teamList.find((entry) => entry.id === addressed);
			const active = addressed === void 0 || found !== void 0 ? view : { kind: "list" };
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
			const execution = team === void 0 ? void 0 : executionStateOf(state, team.id);
			const disclosures = team === void 0 || state.execution !== "ready" ? [] : state.executions.find((row) => row.teamId === team.id)?.notes ?? [];
			const hasFooterNotes = execution !== void 0 || disclosures.length > 0 || state.failed || state.formIssue !== void 0 || state.externalUpdate !== void 0 || state.defaults !== void 0 || state.dirty;
			const unnamedTeams = unnamedTeamsOf(teamList);
			const categoriesForList = state.categories;
			const memberSlot = active.kind === "agent" && active.slot !== "captain" ? active.slot : void 0;
			const agent = team === void 0 || active.kind !== "agent" ? void 0 : active.slot === "captain" ? team.captain : team.members[active.slot];
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TeamPresetsSection_module_css_default.section,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						role: "tablist",
						className: TeamPresetsSection_module_css_default.tabs,
						children: [(0, react_jsx_runtime.jsx)(TabButton, {
							active: tab === "teams",
							onClick: () => {
								setTab("teams");
							},
							children: t("tabTeams")
						}), props.skills === void 0 ? null : (0, react_jsx_runtime.jsx)(TabButton, {
							active: tab === "skills",
							onClick: () => {
								setTab("skills");
							},
							children: t("tabSkills")
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TeamPresetsSection_module_css_default.page,
						children: [
							active.kind === "categories" && (0, react_jsx_runtime.jsx)(TeamCategoryManager, {
								categories: state.categories,
								teamCategories: state.teamCategories,
								disabled,
								t,
								onBack: () => {
									setView({ kind: "list" });
								},
								onAdd: (name) => {
									props.addCategory(name);
								},
								onRename: (id, name) => {
									props.renameCategory(id, name);
								},
								onMove: (id, delta) => {
									props.moveCategory(id, delta);
								},
								onRemove: (id) => {
									props.removeCategory(id);
								}
							}),
							active.kind === "list" && (0, react_jsx_runtime.jsx)(TeamListView, {
								teams: teamList,
								t,
								disabled,
								importError,
								categories: categoriesForList,
								onManageCategories: () => {
									setView({ kind: "categories" });
								},
								teamCategories: state.teamCategories,
								onOpen: openTeam,
								onCreate: () => {
									openTeam(props.createTeam());
								},
								onImport: (file) => {
									importDocument(file);
								},
								onExport: exportDocument,
								onRestoreDefaults: () => {
									props.restoreDefaults();
									props.skills?.restoreBuiltinBindings();
								},
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
							active.kind === "team" && team !== void 0 && (0, react_jsx_runtime.jsx)(TeamEditorView, {
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
								},
								categories: categoriesForList,
								categoryId: (state.teamCategories ?? []).find((row) => row.teamId === team.id)?.categoryId ?? "",
								onSetCategory: (categoryId) => {
									props.setCategory(team.id, categoryId);
								}
							}),
							active.kind === "agent" && team !== void 0 && agent !== void 0 && (0, react_jsx_runtime.jsx)(TeamAgentView, {
								agent,
								role: active.slot === "captain" ? "captain" : "member",
								teamName: team.name === "" ? team.id : team.name,
								providers: state.providers,
								tools: state.tools,
								toolCatalogue: state.toolCatalogue,
								cataloguePartial: state.cataloguePartial,
								catalogueFailed: state.catalogue === "error",
								t,
								disabled,
								...props.skills === void 0 ? {} : { skills: props.skills },
								teamId: team.id,
								roleId: active.slot === "captain" ? "captain" : memberSlot === void 0 ? "" : team.members[memberSlot]?.id ?? team.members[memberSlot]?.name ?? "",
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
					importPlan === void 0 ? null : (0, react_jsx_runtime.jsx)(TeamImportDialog, {
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
					(0, react_jsx_runtime.jsxs)("footer", {
						className: TeamPresetsSection_module_css_default.footer,
						children: [hasFooterNotes ? (0, react_jsx_runtime.jsxs)("div", {
							className: TeamPresetsSection_module_css_default.footerNotes,
							children: [
								execution === void 0 ? null : (0, react_jsx_runtime.jsxs)("span", {
									className: TeamPresetsSection_module_css_default.footerNote,
									role: "status",
									children: [t(EXECUTION_NOTICE_KEYS[execution]), execution === "busy" ? ` ${t("executionBusyShared")}` : ""]
								}),
								disclosures.map((disclosure) => (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.footerNote,
									role: "status",
									children: DISCLOSURE_NOTICE_KEYS[disclosure] === void 0 ? disclosure : t(DISCLOSURE_NOTICE_KEYS[disclosure])
								}, disclosure)),
								state.failed ? (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.warn,
									role: "status",
									children: t("saveFailed")
								}) : null,
								state.formIssue === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.warn,
									role: "status",
									children: t(FORM_ISSUE_KEYS[state.formIssue])
								}),
								state.selectionFailure === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.warn,
									role: "status",
									children: selectionFailureText(state.selectionFailure, t)
								}),
								unnamedTeams.length === 0 ? null : (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.warn,
									role: "status",
									children: t("teamNameRequired", { teams: unnamedTeams.map((entry) => entry.id).join(", ") })
								}),
								state.externalUpdate === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.warn,
									role: "status",
									children: externalUpdateText(state.externalUpdate, t)
								}),
								state.defaults === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.footerNote,
									role: "status",
									children: t(DEFAULTS_NOTICE_KEYS[state.defaults])
								}),
								state.dirty ? (0, react_jsx_runtime.jsx)("span", {
									className: TeamPresetsSection_module_css_default.footerNote,
									children: t("unsaved")
								}) : null
							]
						}) : null, (0, react_jsx_runtime.jsxs)("div", {
							className: TeamPresetsSection_module_css_default.footerActions,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "ghost",
								disabled: !state.dirty || state.saving,
								onClick: () => {
									props.discard();
								},
								children: t("discard")
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "primary",
								disabled: !state.dirty || state.saving || disabled || unnamedTeams.length > 0,
								onClick: () => {
									props.save();
								},
								children: state.saving ? t("saving") : t("save")
							})]
						})]
					})
				]
			});
		}


		/**
		* Page state for the Team Skill library.
		*
		* The controller holds no rules of its own: it calls the Host service and keeps
		* the last answer, so a refusal the Host produced (a delete blocked by a live
		* member, an import that would escape its folder) is displayed exactly as the
		* Host described it. Optimistic edits are deliberately absent — an import can
		* take a moment and a delete can be refused, and a page that showed the change
		* before the Host agreed would have to take it back.
		* @module dsh-agent-team-presets/client/team-skills-controller
		*/
		/**
		* Unwrap one Remote answer, turning a transport failure into the same shape the
		* page shows for a Host refusal.
		* @param result - the wrapped answer.
		* @returns the value, or the failure text.
		*/
		function unwrap(result) {
			if (result.ok) return result.value;
			throw new Error(result.error.message ?? "the Host refused the call");
		}
		/**
		* Narrow one answer that may be a refusal.
		* @param value - a service answer.
		* @returns whether it is a detail.
		*/
		function isDetail(value) {
			return "asset" in value;
		}
		/** The Team Skill page state. */
		var TeamSkillsController = class {
			state = {
				status: "loading",
				library: void 0,
				selectedId: void 0,
				detail: void 0,
				busy: false,
				message: void 0,
				failed: false,
				issue: void 0,
				file: void 0,
				fileText: void 0,
				scan: void 0,
				canOpenScanFolder: false,
				scanFolderPath: void 0,
				scanFolderNotice: void 0
			};
			listeners = /* @__PURE__ */ new Set();
			ctx;
			disposed = false;
			/**
			* The Remote namespace, once the gateway announces it.
			*
			* It is resolved through its own `inject` instead of the plugin's required
			* inject list: a namespace the Host fails to announce must cost this panel and
			* nothing else. Waiting for it in the plugin's own inject list took the whole
			* web UI down (one entry "did not activate"), which is exactly the failure a
			* settings panel is never worth.
			*/
			service;
			/**
			* @param ctx - the browser context this panel reads its Remote through.
			*/
			constructor(ctx) {
				this.ctx = ctx;
				try {
					ctx.inject(["remote.teamSkills"], (scope) => {
						this.service = scope.remote.teamSkills;
						this.refresh();
						return () => {
							this.service = void 0;
						};
					});
				} catch (error) {
					this.state = {
						...this.state,
						status: "unavailable",
						issue: String(error)
					};
				}
				this.detectOpenCapability();
			}
			/** Read whether this Host can reveal a folder natively; absence means copy mode. */
			async detectOpenCapability() {
				try {
					const answer = await this.ctx.remote.session?.canOpenWorkspacePath?.();
					this.publish({ canOpenScanFolder: answer?.ok === true && answer.value === true });
				} catch {
					this.publish({ canOpenScanFolder: false });
				}
			}
			/** Open one Host directory in the native file manager, when the Host offers it. */
			async revealFolder(path) {
				try {
					return (await this.ctx.remote.session?.openWorkspacePath?.({ path }))?.ok === true;
				} catch {
					return false;
				}
			}
			/** Copy one absolute path, reporting whether the browser allowed it. */
			async copyPath(path) {
				try {
					await navigator.clipboard.writeText(path);
					return true;
				} catch {
					return false;
				}
			}
			/**
			* Create (when missing) and reveal the import folder.
			*
			* A Host without a native opener, or one that refuses this path, falls back to
			* the clipboard so the gesture still gives the user a way to the folder.
			*/
			async openScanFolder() {
				this.publish({
					busy: true,
					scanFolderNotice: void 0,
					message: void 0,
					failed: false
				});
				try {
					const answer = unwrap(await this.api().prepareImportFolder());
					if (!("path" in answer)) {
						this.publish({
							busy: false,
							message: answer.detail,
							failed: true
						});
						return;
					}
					this.publish({ scanFolderPath: answer.path });
					if (this.state.canOpenScanFolder) {
						if (await this.revealFolder(answer.path)) {
							this.publish({
								busy: false,
								scanFolderNotice: "opened"
							});
							return;
						}
						this.publish({ canOpenScanFolder: false });
					}
					const copied = await this.copyPath(answer.path);
					this.publish({
						busy: false,
						scanFolderNotice: copied ? "copied" : "copy-failed"
					});
				} catch (error) {
					this.publish({
						busy: false,
						message: String(error),
						failed: true
					});
				}
			}
			/** Current snapshot, stable between changes. */
			getSnapshot = () => this.state;
			/**
			* Subscribe to changes.
			* @param listener - called after every state change.
			* @returns the unsubscribe function.
			*/
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			/** Stop accepting answers. */
			dispose() {
				this.disposed = true;
				this.listeners.clear();
			}
			/**
			* Replace the snapshot and notify.
			* @param patch - fields to change.
			*/
			publish(patch) {
				if (this.disposed) return;
				this.state = {
					...this.state,
					...patch
				};
				for (const listener of this.listeners) listener();
			}
			/** Read the library from the Host. */
			async refresh() {
				this.publish({ status: this.state.library === void 0 ? "loading" : "ready" });
				try {
					const library = unwrap(await this.api().library());
					const issue = library.issue;
					if (issue !== void 0) {
						this.publish({
							status: "unavailable",
							library: void 0,
							issue
						});
						return;
					}
					this.publish({
						status: "ready",
						library,
						issue: void 0
					});
					if (this.state.selectedId !== void 0 && !library.assets.some((asset) => asset.id === this.state.selectedId)) this.publish({
						selectedId: void 0,
						detail: void 0
					});
				} catch (error) {
					this.publish({
						status: "unavailable",
						issue: String(error)
					});
				}
			}
			/**
			* Show one asset's detail.
			* @param assetId - asset identity.
			*/
			async select(assetId) {
				this.publish({
					selectedId: assetId,
					detail: void 0
				});
				const answer = unwrap(await this.api().detail(assetId));
				if (this.disposed || this.state.selectedId !== assetId) return;
				if (!isDetail(answer)) {
					this.publish({
						message: answer.detail,
						failed: true
					});
					return;
				}
				this.publish({ detail: answer });
				await this.openFile("SKILL.md");
			}
			/**
			* Load one file's text into the editor.
			* @param path - relative path inside the asset.
			*/
			async openFile(path) {
				const assetId = this.state.selectedId;
				if (assetId === void 0) return;
				this.publish({
					file: path,
					fileText: void 0
				});
				try {
					const answer = unwrap(await this.api().readFile(assetId, path));
					if (this.state.file !== path) return;
					if ("text" in answer) this.publish({ fileText: answer.text });
					else this.publish({
						message: answer.detail,
						failed: true
					});
				} catch (error) {
					this.publish({
						message: String(error),
						failed: true
					});
				}
			}
			/**
			* Save one file of the selected asset.
			* @param path - relative path.
			* @param text - new content.
			*/
			async saveFile(path, text) {
				const assetId = this.state.selectedId;
				if (assetId === void 0) return;
				await this.run(async () => {
					const answer = unwrap(await this.api().writeFile(assetId, path, text));
					if (!isDetail(answer)) return answer.detail;
					this.publish({ detail: answer });
					await this.refresh();
					await this.openFile(path);
					return "saved";
				});
			}
			/**
			* Create one blank skill.
			* @param skillId - kebab-case name.
			* @param description - frontmatter description.
			*/
			async create(skillId, description) {
				await this.run(async () => {
					const answer = unwrap(await this.api().createSkill(skillId, description));
					if (!isDetail(answer)) return answer.detail;
					this.publish({
						detail: answer,
						selectedId: answer.asset.id
					});
					await this.refresh();
					return "created";
				});
			}
			/**
			* Import one folder the user picked.
			* @param files - the picker's files, already carrying relative paths.
			*/
			async importFolder(files) {
				if (files.length === 0) return;
				const payload = files.map((file) => ({
					path: file.path,
					base64: encodeBase64(file.content)
				}));
				await this.run(async () => {
					const answer = unwrap(await this.api().importSkill(payload));
					if (!isDetail(answer)) return answer.detail;
					this.publish({
						detail: answer,
						selectedId: answer.asset.id
					});
					await this.refresh();
					return "imported";
				});
			}
			/**
			* Scan the Host's import folder and publish every new legal skill.
			*
			* The Host owns the judgement; this only forwards the answer so the page can
			* show one row per folder instead of collapsing refusals into a count.
			*/
			async scanImportFolder() {
				await this.run(async () => {
					const answer = unwrap(await this.api().scanImportFolder());
					if (!("entries" in answer)) {
						this.publish({ scan: void 0 });
						return answer.detail;
					}
					this.publish({ scan: answer });
					await this.refresh();
					return "scanned";
				});
			}
			/**
			* Copy one shipped skill into an editable override.
			* @param skillId - shipped skill id.
			*/
			async createOverride(skillId) {
				await this.run(async () => {
					const answer = unwrap(await this.api().overrideSkill(skillId));
					if (!isDetail(answer)) return answer.detail;
					this.publish({
						detail: answer,
						selectedId: answer.asset.id
					});
					await this.refresh();
					return "override-created";
				});
			}
			/**
			* Discard one override's edits by re-copying the shipped skill.
			* @param assetId - override identity.
			*/
			async resetOverride(assetId) {
				await this.run(async () => {
					const answer = unwrap(await this.api().resetSkill(assetId));
					if (!isDetail(answer)) return answer.detail;
					this.publish({ detail: answer });
					await this.refresh();
					return "override-reset";
				});
			}
			/**
			* Delete one asset, showing every blocker the Host reported.
			* @param assetId - asset identity.
			* @returns the Host's outcome, so the page can name the blockers.
			*/
			async remove(assetId) {
				let outcome;
				await this.run(async () => {
					outcome = unwrap(await this.api().deleteAsset(assetId));
					await this.refresh();
					if (!outcome.ok) return outcome.blockers.map((blocker) => `${blocker.kind}: ${blocker.detail}`).join("; ");
					this.publish({
						selectedId: void 0,
						detail: void 0
					});
					return "deleted";
				});
				return outcome;
			}
			/**
			* Bind one asset to one role, as the member page's grid does.
			* @param teamId - Team identity.
			* @param roleId - role identity, or `captain`.
			* @param assetId - asset identity.
			*/
			async assignSkill(teamId, roleId, assetId) {
				await this.run(async () => {
					const answer = unwrap(await this.api().assignRole(teamId, roleId, assetId));
					this.publish({ library: answer.library });
					return answer.ok ? "assigned" : answer.detail;
				});
			}
			/**
			* Remove one asset from one role.
			* @param teamId - Team identity.
			* @param roleId - role identity.
			* @param assetId - asset identity.
			*/
			async unassignSkill(teamId, roleId, assetId) {
				await this.run(async () => {
					this.publish({ library: unwrap(await this.api().unassignRole(teamId, roleId, assetId)) });
					return "unassigned";
				});
			}
			/**
			* Bind the selected asset to one role.
			* @param teamId - Team identity.
			* @param roleId - role identity, or `captain`.
			*/
			async assign(teamId, roleId) {
				const assetId = this.state.selectedId;
				if (assetId === void 0) return;
				await this.run(async () => {
					const answer = unwrap(await this.api().assignRole(teamId, roleId, assetId));
					this.publish({ library: answer.library });
					if (this.state.selectedId !== void 0) await this.select(this.state.selectedId);
					return answer.ok ? "assigned" : answer.detail;
				});
			}
			/**
			* Remove one role's assignment.
			* @param teamId - Team identity.
			* @param roleId - role identity.
			*/
			async unassign(teamId, roleId) {
				await this.run(async () => {
					const library = unwrap(await this.api().unassignRole(teamId, roleId));
					this.publish({ library });
					if (this.state.selectedId !== void 0) await this.select(this.state.selectedId);
					return "unassigned";
				});
			}
			/** Restore official default skill bindings for built-in teams. */
			async restoreBuiltinBindings(teamIds) {
				await this.run(async () => {
					const library = unwrap(await this.api().restoreBuiltinBindings(teamIds ? [...teamIds] : void 0));
					this.publish({ library });
					if (this.state.selectedId !== void 0) await this.select(this.state.selectedId);
					return "restored-bindings";
				});
			}
			/**
			* The generated Client face for this plugin's services.
			* @returns the mounted Remote namespace.
			*/
			api() {
				if (this.service === void 0) throw new Error("the Team Skill service is not available in this deployment");
				return this.service;
			}
			/**
			* Run one write with a busy flag and a single message.
			* @param work - the call, returning the message key or a refusal text.
			*/
			async run(work) {
				this.publish({
					busy: true,
					message: void 0,
					failed: false
				});
				try {
					const message = await work();
					const succeeded = /^(saved|created|imported|deleted|assigned|unassigned|scanned|override-|restored-bindings)/u.test(message);
					this.publish({
						busy: false,
						message: succeeded ? void 0 : message,
						failed: !succeeded
					});
				} catch (error) {
					this.publish({
						busy: false,
						message: String(error),
						failed: true
					});
				}
			}
		};
		/**
		* Encode bytes for the Remote boundary.
		*
		* `btoa` needs a binary string, and a chunked conversion keeps a large skill
		* file from overflowing the call stack of `String.fromCharCode`.
		* @param bytes - file content.
		* @returns base64 text.
		*/
		function encodeBase64(bytes) {
			let binary = "";
			const chunk = 32768;
			for (let at = 0; at < bytes.length; at += chunk) binary += String.fromCharCode(...bytes.subarray(at, at + chunk));
			return btoa(binary);
		}


		/**
		* Browser half of the Agent Team presets plugin: the Settings page that
		* configures Teams and the composer control that selects one per Session.
		*/
		/**
		* Required services (cordis fiber inject).
		*
		* `remote.settings` is the namespace the composer's selection write goes
		* through, and the shared describe mirror every settings surface reads is
		* reached through `configForms`. Both are named explicitly because the cordis
		* property proxy resolves a namespaced service RELATIVE to the context that
		* reads it: `ctx.remote.settings` only resolves where the reading fiber (or an
		* ancestor in the same isolate) declares `remote.settings` in its own inject
		* set. A context that reads it without that declaration throws
		* `cannot get property "remote.settings" without inject`, which is exactly the
		* failure mode this plugin's own scope must never reproduce.
		*/
		const inject = [
			"slots",
			"locale",
			"configForms",
			"remote",
			"remote.session",
			"remote.settings"
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
			try {
				return await applyUi(ctx);
			} catch (error) {
				console.error("[team-presets] the browser half failed to activate:", error);
				throw error;
			}
		}
		/**
		* Mount the Remote contribution and register the UI.
		* @param ctx - the browser plugin context.
		* @returns disposer withdrawing the UI and the Remote contribution.
		*/
		async function applyUi(ctx) {
			const disposeRemote = await ctx.remote.$mount(TYPERT_REMOTE);
			const skills = new TeamSkillsController(ctx);
			const ui = ctx.inject([
				"remote.teamPresets",
				"slots",
				"locale",
				"configForms",
				"remote.session",
				"remote.settings"
			], (scope) => registerUi(scope, skills));
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
		function registerUi(ctx, skills) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "agent-team-presets: dictionaries");
			const controller = new TeamPresetsController(ctx);
			ctx.effect(() => () => {
				skills.dispose();
			}, "agent-team-presets: skills controller");
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
				inject: () => ({
					...controller.inject(),
					skills
				})
			}, TeamPresetsSection)), "agent-team-presets: settings page");
			ctx.inject(["agentTeamAppearance"], (scope) => {
				const registry = scope.agentTeamAppearance;
				scope.effect(() => registry.register((sessionId) => {
					const state = controller.store.getSnapshot();
					return teamAppearance(state.teams, state.selections, sessionId);
				}), "agent-team-presets: roster appearance");
			});
			ctx.effect(() => ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "agent-team-presets",
				order: 10,
				locale: NS,
				inject: () => ({
					...controller.inject(),
					skills
				})
			}, ComposerTeamSelect)), "agent-team-presets: composer control");
		}

		exports.TEAM_PRESETS_NS = TEAM_PRESETS_NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
