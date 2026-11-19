import type { ImportedFile, SkillPackage } from './import.ts';
import type { TeamSkillAsset, TeamSkillDependencies, TeamSkillFile, TeamSkillOrigin } from '../types.ts';
export interface OfficialSkillEntry {
    readonly skillId: string;
    readonly directory: string;
    readonly version: string;
}
export declare function folderDigest(files: readonly TeamSkillFile[]): string;
export declare function fileTable(files: readonly ImportedFile[]): TeamSkillFile[];
/** Logical ids stay unchanged in JSON; only their disk coordinates are encoded.
 * `~` was never a valid logical component, so encoded and old names cannot clash.
 * Uppercase, DOS devices and trailing dots are encoded on every platform too. */
export declare function diskComponent(value: string): string;
/** Atomically replace one JSON document; failed writes leave its previous bytes intact. */
export declare function atomicWriteJson(path: string, value: unknown): Promise<void>;
export declare class TeamSkillStore {
    private readonly configuredRoot;
    private assets;
    private revision;
    private opened;
    private readonly transactions;
    private physicalRoot;
    constructor(configuredRoot: string);
    /** Pinned once open starts. Resolving it is kept out of plugin construction. */
    get root(): string;
    get registryRevision(): number;
    private get table();
    assetPath(assetId: string, version: string): string;
    private manifestPath;
    /** Share this reentrant lock with manager check-and-commit operations. */
    withLock<T>(operation: () => Promise<T>): Promise<T>;
    private load;
    private get journalPath();
    private journalTarget;
    private record;
    private undo;
    private cleanup;
    private recover;
    open(): Promise<void>;
    /** Move v1 POSIX directory names without changing identities or losing pinned
     * historical versions. A write-ahead relocate can be undone after a crash;
     * unlike deletion backups, committed destinations are never cleaned up. */
    private migrateLayout;
    list(): readonly TeamSkillAsset[];
    get(assetId: string): TeamSkillAsset | undefined;
    /**
     * Resolve one skill by its name rather than by asset identity.
     *
     * Several assets may legitimately share a name: the shipped copy, a local
     * override of it, and a skill the user imported under the same name. The
     * shipped copy wins, because a name denotes the skill the plugin ships — a
     * user's own copy must never shadow it for a caller that only said the name.
     * Callers that know which copy they mean pass the asset id instead.
     * @param skillId - kebab-case skill name.
     * @returns the shipped copy when it exists, else the best local one.
     */
    bySkillId(skillId: string): TeamSkillAsset | undefined;
    /** Commit all nested store mutations once; failures restore memory and version folders. */
    transaction<T>(operation: () => Promise<T>): Promise<T>;
    install(package_: SkillPackage, options: {
        readonly id: string;
        readonly origin: TeamSkillOrigin;
        readonly version: string;
        readonly officialSkillId?: string;
        readonly baseVersion?: string;
        readonly dependencies?: TeamSkillDependencies;
    }): Promise<TeamSkillAsset>;
    writeFile(assetId: string, path: string, content: string): Promise<TeamSkillAsset>;
    /** Change dependency metadata by publishing a new immutable asset version. */
    updateDependencies(assetId: string, dependencies: TeamSkillDependencies): Promise<TeamSkillAsset>;
    readBytes(assetId: string, path: string, version?: string): Promise<Uint8Array>;
    readText(assetId: string, path: string, version?: string): Promise<string>;
    remove(assetId: string, beforeCommit?: () => void): Promise<void>;
    ensureOfficial(entries: readonly OfficialSkillEntry[], warnings?: string[]): Promise<readonly string[]>;
    private installFiles;
    private manifest;
    createOverride(skillId: string, id: string): Promise<TeamSkillAsset>;
    resetOverride(assetId: string): Promise<TeamSkillAsset>;
    verify(assetId: string): Promise<boolean>;
}
export declare function installFromDirectory(store: TeamSkillStore, source: string, options: {
    readonly id: string;
    readonly skillId: string;
    readonly origin: TeamSkillOrigin;
    readonly version: string;
}): Promise<TeamSkillAsset>;
/** What reading one untrusted folder produced: a legal package or the exact rule that refused it. */
export type SkillFolderInspection = {
    readonly ok: true;
    readonly skill: SkillPackage;
} | {
    readonly ok: false;
    readonly reason: string;
    readonly path?: string;
};
/**
 * Validate one external folder without publishing it.
 *
 * The scan reports every refused folder with its own reason, so it must see the
 * same verdict the importer would produce instead of guessing from the name.
 * @param source - absolute folder to read.
 * @returns the package or the refusal code and offending path.
 */
export declare function inspectSkillDirectory(source: string): Promise<SkillFolderInspection>;
export declare function copyDirectory(from: string, to: string): Promise<void>;
