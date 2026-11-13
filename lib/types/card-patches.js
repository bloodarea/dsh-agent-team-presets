/**
 * Optional card-badge patches for other plugins' Agent cards.
 *
 * Neither dsh-context nor dsh-better-sidebar publishes a card extension point,
 * so marking the subagents a Team created on their cards requires replacing
 * that plugin's browser bundle with one built from the pinned source plus a
 * small registration service. This module owns that replacement: what a
 * supported target is, whether the installed copy is still the published
 * bundle or already ours, and how to swap it in and back out.
 *
 * Nothing here builds anything. Both replacements ship as prebuilt assets
 * (`assets/card-patches`) produced from the exact upstream revision named in
 * the catalog, so an install is an offline file swap. Every decision comes from
 * a content hash: a bundle matching neither the published original nor this
 * build's replacement is refused, because overwriting it would destroy an edit
 * this plugin cannot reproduce.
 *
 * Each target is pinned to one version. A target running any other version
 * reports `unsupported` rather than receiving a bundle built from different
 * source.
 * @module dsh-agent-team-presets/card-patches
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync, } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
/**
 * The versions compiled into this build.
 *
 * Each entry is a finished artifact: the replacement is a whole-bundle build, so
 * a different version's bundle would silently change behaviour that was never
 * reviewed here. Newer versions are added by `tools/card-patches.mjs`, which
 * verifies the rebuild first and then writes them to the shipped catalog
 * overlay; nothing here needs to change for that.
 */
const COMPILED_TARGETS = [
    {
        id: 'dsh-context',
        packageName: 'dsh-context',
        version: '0.84.0',
        source: 'bowenliang123/dsh-context@aa98b1231d5f0f8e833391f198e65e14e73b3323',
        asset: 'dsh-context-0.84.0.client.js.gz',
        service: 'contextAgentCardBadges',
        pristineSha256: '686ce45c05394d5820697c402dc64de05ff83b0f2770fed32fb524b3dbdf8450',
        patchedSha256: '4d4e0afe7b536ca5f32e8ed910e226afbbb81e1e3d9481d8e93e7a3e8b4ea461',
    },
    {
        id: 'dsh-better-sidebar',
        packageName: 'dsh-better-sidebar',
        version: '0.32.0',
        source: 'omdsh-dev/DSH-better-sidebar@v0.32.0',
        asset: 'dsh-better-sidebar-0.32.0.client.js.gz',
        service: 'betterSidebarAgentCardBadges',
        pristineSha256: '30d0022f89c0bc4751fe6cf274cb7f3543389c27ad18ebf4e58fac4a40ad7cc4',
        patchedSha256: 'd0a9f0257e80fb3fdf6eb06a587b5b5aa985e1cfbaaf7a187ee381da0a8ac7ba',
    },
];
/** Version of the shipped catalog overlay document; a different one is ignored. */
export const CARD_PATCH_CATALOG_VERSION = 1;
/** The shipped overlay: entries a build produced for versions this code predates. */
function shippedCatalogFile() {
    return join(shippedAssets(), 'catalog.json');
}
/** One validated overlay entry, or a message naming what is wrong with it. */
function catalogString(row, field, pattern, hint) {
    const value = row[field];
    if (typeof value !== 'string' || !pattern.test(value)) {
        throw new Error(`${field} ${hint}: ${JSON.stringify(value)}`);
    }
    return value;
}
/**
 * Validate one overlay entry.
 *
 * The overlay is data, not code, so it may be edited by hand or written by an
 * older tool; every field is checked against the same shape the compiled
 * entries use. An entry that fails is a reason to ignore the whole document,
 * because acting on part of it would make "what does this build support"
 * depend on JSON key order.
 * @param candidate - one parsed entry.
 * @returns the normalized target.
 * @throws when any field is unusable.
 */
export function normalizeCatalogTarget(candidate) {
    if (candidate === null || typeof candidate !== 'object' || Array.isArray(candidate)) {
        throw new Error('the entry is not an object');
    }
    const row = candidate;
    const pristineSha256 = catalogString(row, 'pristineSha256', /^[0-9a-f]{64}$/, 'must be 64 lowercase hex characters');
    const patchedSha256 = catalogString(row, 'patchedSha256', /^[0-9a-f]{64}$/, 'must be 64 lowercase hex characters');
    if (pristineSha256 === patchedSha256) {
        throw new Error('pristineSha256 and patchedSha256 must differ, or the replacement would be the published build');
    }
    const source = row['source'];
    if (typeof source !== 'string' || source.trim() === '' || /\s/.test(source)) {
        throw new Error(`source must be one non-empty token: ${JSON.stringify(source)}`);
    }
    return {
        id: catalogString(row, 'id', /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase words joined by hyphens'),
        packageName: catalogString(row, 'packageName', /^[a-z0-9][a-z0-9._-]*$/, 'must be a bare package name'),
        version: catalogString(row, 'version', /^\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:\.[0-9A-Za-z]+)*)?$/, 'must be a semver version'),
        source,
        asset: catalogString(row, 'asset', /^[a-z0-9][a-z0-9._-]*\.client\.js\.gz$/, 'must be a bare `<name>.client.js.gz` file name'),
        service: catalogString(row, 'service', /^[A-Za-z_$][A-Za-z0-9_$]*$/, 'must be a JavaScript identifier'),
        pristineSha256,
        patchedSha256,
    };
}
/**
 * Parse a shipped catalog overlay document.
 * @param text - the document text.
 * @returns every entry it declares.
 * @throws when the document or any entry is unusable.
 */
export function parseCardPatchCatalog(text) {
    const document = JSON.parse(text);
    if (document === null || typeof document !== 'object' || Array.isArray(document)) {
        throw new Error('the catalog is not an object');
    }
    const version = document.version;
    if (version !== CARD_PATCH_CATALOG_VERSION) {
        throw new Error(`the catalog version is ${JSON.stringify(version)}, not ${CARD_PATCH_CATALOG_VERSION}`);
    }
    const targets = document.targets;
    if (!Array.isArray(targets))
        throw new Error('the catalog has no targets array');
    return targets.map(normalizeCatalogTarget);
}
/**
 * Combine the compiled baseline with the shipped overlay.
 *
 * Entries are keyed by identity *and* version, not by identity alone: keeping
 * the already-supported versions is the whole point of shipping a replacement
 * per version, so rebuilding 0.84.1 must not drop 0.84.0 for the installations
 * still on it. Only the exact pair is replaced when the same version is rebuilt.
 * Compiled order is kept, because that is the order the settings page lists.
 * @param baseline - entries compiled into this build.
 * @param overlay - entries read from the shipped catalog.
 * @returns the merged catalog.
 */
export function mergeCatalogTargets(baseline, overlay) {
    const key = (entry) => `${entry.id}@${entry.version}`;
    const byKey = new Map(overlay.map(entry => [key(entry), entry]));
    const merged = baseline.map(entry => byKey.get(key(entry)) ?? entry);
    // Numeric collation, so appending 0.9.0 after 0.10.0 is impossible: "newest
    // last" is what the settings row and the resolver rely on.
    const order = { numeric: true };
    for (const [entryKey, entry] of [...byKey].sort(([left], [right]) => left.localeCompare(right, 'en', order))) {
        if (!baseline.some(current => key(current) === entryKey))
            merged.push(entry);
    }
    return merged;
}
/**
 * The distinct target identities, in catalog order.
 * @param targets - the catalog to read.
 * @returns one identity per target, first occurrence order.
 */
export function catalogIdentities(targets = CARD_PATCH_TARGETS) {
    return [...new Set(targets.map(target => target.id))];
}
/**
 * Every catalog entry for one identity.
 * @param id - the target identity.
 * @param targets - the catalog to read.
 * @returns its entries, oldest build first.
 */
export function catalogTargetsFor(id, targets = CARD_PATCH_TARGETS) {
    return targets.filter(target => target.id === id);
}
/**
 * Read the shipped overlay, or nothing when it is absent or unusable.
 *
 * A broken overlay must not take the whole settings page down: it is optional
 * data, so a refusal here falls back to the versions compiled into this build
 * and says so in the log.
 * @returns the overlay entries.
 */
function readShippedCatalog() {
    const file = shippedCatalogFile();
    if (!existsSync(file))
        return [];
    try {
        return parseCardPatchCatalog(readFileSync(file, 'utf8'));
    }
    catch (error) {
        console.warn(`[team-presets] ignoring the shipped card-patch catalog: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
}
/** Every version this build can patch: the compiled baseline plus the overlay. */
export const CARD_PATCH_TARGETS = mergeCatalogTargets(COMPILED_TARGETS, readShippedCatalog());
/** Directory holding the prebuilt replacements shipped with this package. */
function shippedAssets() {
    // Built output lives in `lib/`, one level below the package root.
    return join(dirname(dirname(fileURLToPath(import.meta.url))), 'assets', 'card-patches');
}
/** Backups of replaced bundles, under the same `$DSH_HOME` this plugin already uses. */
function shippedBackups() {
    const home = process.env['DSH_HOME'] !== undefined && process.env['DSH_HOME'] !== ''
        ? process.env['DSH_HOME']
        : join(homedir(), '.dsh');
    return join(home, 'agent-team-presets', 'card-patches');
}
/**
 * Resolve a package the way the running profile resolves it.
 *
 * This module is loaded from the profile's `node_modules`, so the package beside
 * it is the one the browser is served. A resolution failure is "not installed"
 * rather than an error: a profile without a target is the ordinary case.
 * @param packageName - the target package name.
 * @returns its directory, or undefined when it is absent.
 */
function resolveProfilePackage(packageName) {
    try {
        const require = createRequire(import.meta.url);
        return dirname(require.resolve(`${packageName}/package.json`));
    }
    catch {
        return undefined;
    }
}
/** The real environment: the running profile's packages and this plugin's directories. */
export const realCardPatchEnvironment = {
    resolvePackage: resolveProfilePackage,
    backupDirectory: shippedBackups,
    assetDirectory: shippedAssets,
};
/**
 * Read the installed package.json version.
 * @param directory - target package directory.
 * @returns its version, or undefined when the manifest is unreadable.
 */
function installedVersion(directory) {
    try {
        const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
        return typeof manifest.version === 'string' ? manifest.version : undefined;
    }
    catch {
        return undefined;
    }
}
/**
 * Where the target's browser bundle lives.
 * @param directory - target package directory.
 * @returns the absolute path the client module system serves.
 */
function bundlePath(directory) {
    return join(directory, 'lib', 'client.js');
}
/**
 * Hash one file's bytes.
 * @param path - absolute file path.
 * @returns the lowercase hex sha256.
 */
function sha256Of(path) {
    return createHash('sha256').update(readFileSync(path)).digest('hex');
}
/**
 * Classify one installed target without changing anything.
 * @param target - the catalog entry.
 * @param env - the file-system facts to read through.
 * @returns the row the settings page renders.
 */
export function targetState(target, env = realCardPatchEnvironment) {
    const base = {
        id: target.id,
        packageName: target.packageName,
        source: target.source,
        service: target.service,
        supportedVersion: target.version,
        supportedVersions: [target.version],
    };
    const directory = env.resolvePackage(target.packageName);
    if (directory === undefined) {
        return { ...base, state: 'absent', detail: 'this plugin is not installed in the running profile' };
    }
    const version = installedVersion(directory);
    if (version === undefined) {
        return { ...base, state: 'absent', detail: 'its package.json could not be read' };
    }
    if (version !== target.version) {
        return {
            ...base,
            installedVersion: version,
            state: 'unsupported',
            detail: `this build ships a replacement for ${target.version}, not ${version}`,
        };
    }
    const bundle = bundlePath(directory);
    if (!existsSync(bundle)) {
        return { ...base, installedVersion: version, state: 'absent', detail: 'its browser bundle is missing' };
    }
    const digest = sha256Of(bundle);
    if (digest === target.patchedSha256)
        return { ...base, installedVersion: version, state: 'patched' };
    if (digest === target.pristineSha256)
        return { ...base, installedVersion: version, state: 'pristine' };
    return {
        ...base,
        installedVersion: version,
        state: 'foreign',
        detail: 'its browser bundle matches neither the published build nor this plugin\'s replacement',
    };
}
/**
 * Replace one target's browser bundle with the prebuilt replacement.
 *
 * The installed bytes are copied into this plugin's backup directory before the
 * replacement is written, and the write is a rename of a sibling file, so a
 * failure leaves the original in place. A target whose bundle is not the exact
 * published build is refused: restoring it later could not reproduce an edit
 * this plugin never saw.
 * @param target - the catalog entry.
 * @param env - the file-system facts to act through.
 * @returns the outcome and the resulting state.
 */
export function installCardPatch(target, env = realCardPatchEnvironment) {
    const before = targetState(target, env);
    if (before.state === 'patched')
        return { ok: true, id: target.id, state: 'patched' };
    if (before.state !== 'pristine') {
        return { ok: false, id: target.id, state: before.state, ...before.detail === undefined ? {} : { detail: before.detail } };
    }
    const directory = env.resolvePackage(target.packageName);
    if (directory === undefined)
        return { ok: false, id: target.id, state: 'absent', detail: 'the package disappeared' };
    const asset = join(env.assetDirectory(), target.asset);
    if (!existsSync(asset)) {
        return {
            ok: false,
            id: target.id,
            state: 'pristine',
            detail: 'this installation ships no prebuilt replacement; reinstall the plugin so assets/card-patches is included',
        };
    }
    const replacement = gunzipSync(readFileSync(asset));
    if (createHash('sha256').update(replacement).digest('hex') !== target.patchedSha256) {
        return { ok: false, id: target.id, state: 'pristine', detail: 'the prebuilt replacement does not match its recorded hash' };
    }
    const bundle = bundlePath(directory);
    try {
        const backups = env.backupDirectory();
        mkdirSync(backups, { recursive: true });
        copyFileSync(bundle, join(backups, `${target.id}-${target.version}.client.js`));
        const staged = `${bundle}.card-patch.tmp`;
        writeFileSync(staged, replacement);
        renameSync(staged, bundle);
    }
    catch (error) {
        return { ok: false, id: target.id, state: 'pristine', detail: `the replacement could not be written: ${String(error)}` };
    }
    const after = targetState(target, env);
    // The running server publishes the new bundle itself: the Web composition's
    // client-hmr transport stat-polls every client bundle and pushes a rebuild to
    // the page, which reloads that plugin in place. No server restart is involved.
    return after.state === 'patched'
        ? { ok: true, id: target.id, state: 'patched', detail: 'the page loads the replacement within a second' }
        : { ok: false, id: target.id, state: after.state, detail: 'the replaced bundle did not match its recorded hash' };
}
/**
 * Restore one target's published browser bundle from this plugin's backup.
 * @param target - the catalog entry.
 * @param env - the file-system facts to act through.
 * @returns the outcome and the resulting state.
 */
export function uninstallCardPatch(target, env = realCardPatchEnvironment) {
    const before = targetState(target, env);
    if (before.state === 'pristine')
        return { ok: true, id: target.id, state: 'pristine' };
    if (before.state !== 'patched') {
        return { ok: false, id: target.id, state: before.state, ...before.detail === undefined ? {} : { detail: before.detail } };
    }
    const directory = env.resolvePackage(target.packageName);
    if (directory === undefined)
        return { ok: false, id: target.id, state: 'absent', detail: 'the package disappeared' };
    const backup = join(env.backupDirectory(), `${target.id}-${target.version}.client.js`);
    if (!existsSync(backup)) {
        return {
            ok: false,
            id: target.id,
            state: 'patched',
            detail: 'this plugin holds no backup of the published bundle; reinstall the target package to restore it',
        };
    }
    if (sha256Of(backup) !== target.pristineSha256) {
        return { ok: false, id: target.id, state: 'patched', detail: 'the stored backup does not match the published bundle' };
    }
    const bundle = bundlePath(directory);
    try {
        const staged = `${bundle}.card-unpatch.tmp`;
        copyFileSync(backup, staged);
        renameSync(staged, bundle);
        rmSync(backup, { force: true });
    }
    catch (error) {
        return { ok: false, id: target.id, state: 'patched', detail: `the published bundle could not be restored: ${String(error)}` };
    }
    const after = targetState(target, env);
    return after.state === 'pristine'
        ? { ok: true, id: target.id, state: 'pristine', detail: 'the page drops the replacement within a second' }
        : { ok: false, id: target.id, state: after.state, detail: 'the restored bundle did not match its recorded hash' };
}
/**
 * Resolve one catalog entry by target id.
 * @param id - the settings page's row identity.
 * @returns the entry, or undefined for an id this build does not ship.
 */
export function findCardPatchTarget(id) {
    // The catalog appends in build order, so the last entry for an identity is the
    // newest version this build can patch.
    return catalogTargetsFor(id).at(-1);
}
/**
 * Classify one identity by the version that is actually installed.
 *
 * Several catalog entries may exist for the same target, one per supported
 * upstream version; which one is relevant depends entirely on the installed
 * package, so the choice belongs here rather than at each call site. A version
 * this build has no replacement for reports `unsupported` and names the
 * versions it does ship, which is what tells an operator whether to update the
 * target plugin or this one.
 * @param entries - every catalog entry for one identity, oldest first.
 * @param env - the file-system facts to read through.
 * @returns the row the settings page renders.
 */
export function resolveTargetView(entries, env = realCardPatchEnvironment) {
    const newest = entries.at(-1);
    if (newest === undefined)
        throw new Error('a card-patch target needs at least one catalog entry');
    const supportedVersions = entries.map(entry => entry.version);
    const base = {
        id: newest.id,
        packageName: newest.packageName,
        source: newest.source,
        service: newest.service,
        supportedVersion: newest.version,
        supportedVersions,
    };
    const directory = env.resolvePackage(newest.packageName);
    if (directory === undefined) {
        return { ...base, state: 'absent', detail: 'this plugin is not installed in the running profile' };
    }
    const installed = installedVersion(directory);
    if (installed === undefined) {
        return { ...base, state: 'absent', detail: 'its package.json could not be read' };
    }
    const target = entries.find(entry => entry.version === installed);
    if (target === undefined) {
        return {
            ...base,
            installedVersion: installed,
            state: 'unsupported',
            detail: `this build ships a replacement for ${supportedVersions.join(', ')}, not ${installed}`,
        };
    }
    return { ...targetState(target, env), supportedVersions };
}
/**
 * Resolve the catalog entry that matches the installed version of one target.
 * @param id - the target identity.
 * @param env - the file-system facts to read through.
 * @param targets - the catalog to read.
 * @returns the entry to patch, when this build has one for that exact version.
 */
export function resolveInstalledTarget(id, env = realCardPatchEnvironment, targets = CARD_PATCH_TARGETS) {
    const entries = catalogTargetsFor(id, targets);
    if (entries.length === 0) {
        const absent = {
            id,
            packageName: id,
            source: 'unknown',
            service: id,
            supportedVersion: '',
            supportedVersions: [],
            state: 'absent',
            detail: `this build ships no card patch for "${id}"`,
        };
        return { view: absent };
    }
    const view = resolveTargetView(entries, env);
    if (view.state === 'absent' || view.state === 'unsupported')
        return { view };
    const target = entries.find(entry => entry.version === view.supportedVersion);
    // `exactOptionalPropertyTypes` forbids assigning `undefined` to an optional
    // property, so the "no matching entry" case is its own return.
    return target === undefined ? { view } : { target, view };
}
