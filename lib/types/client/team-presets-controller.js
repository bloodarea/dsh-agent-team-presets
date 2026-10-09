/**
 * Staged Team preset editing over the `agent-team-presets` settings namespace,
 * plus the per-Session Team selection the composer control writes.
 */
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store';
import { toolMode, withSelection } from "../presets.js";
/**
 * Loader entry id of the Host row that owns the Team preset namespace. Spelled
 * here rather than imported: a client package must not depend on a Host package.
 */
export const TEAM_PRESETS_NS = 'agent-team-presets';
/** Colors offered for a member's accent mark. */
export const AGENT_COLORS = [
    '#4c8dff', '#2fbf71', '#e0a43c', '#e05c6b', '#8d6bff', '#25b0c4', '#c46bd0', '#8a94a6',
];
const EMPTY = { teams: [], selections: [] };
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
        systemPrompt: agent.systemPrompt,
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
        systemPrompt: captain.systemPrompt,
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
        members: team.members.map(member => agentJson(member)),
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
 * Create an empty Team preset with a unique identity.
 * @param existing - Teams already configured.
 * @returns a new, unnamed Team preset.
 */
export function createTeamPreset(existing) {
    let index = existing.length + 1;
    let id = `team-${index}`;
    while (existing.some(team => team.id === id)) {
        index += 1;
        id = `team-${index}`;
    }
    return {
        id,
        name: '',
        description: '',
        captain: emptyCaptainPreset(),
        members: [],
    };
}
/**
 * Create an empty captain preset.
 * @returns the empty captain every new Team starts from.
 */
export function emptyCaptainPreset() {
    return {
        name: '',
        color: '',
        description: '',
        toolMode: 'all',
        tools: [],
        systemPrompt: '',
    };
}
/**
 * Create an empty member preset.
 * @returns the empty preset every new member starts from.
 */
export function emptyAgentPreset() {
    return {
        ...emptyCaptainPreset(),
        provider: '',
        model: '',
        reasoningEffort: '',
    };
}
/** Owns the page's staged edits and the composer's immediate selection writes. */
export class TeamPresetsController {
    ctx;
    /** Observable page state the slot registrations expose to their components. */
    store;
    form;
    unsubscribe;
    draft;
    draftRevision;
    providers = [];
    catalogue = 'idle';
    cataloguePartial = false;
    catalogueLoading = false;
    catalogueGeneration = 0;
    tools = [];
    toolCatalogue = 'idle';
    toolCatalogueLoading = false;
    disposed = false;
    /**
     * @param ctx - the browser plugin context providing the shared configuration forms.
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.form = ctx.configForms.get(TEAM_PRESETS_NS);
        this.store = createSnapshotStore(this.projection());
        this.unsubscribe = this.form.subscribe(() => { this.publish(); });
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
            status: snapshot.status === 'ready' ? 'ready' : snapshot.status === 'loading' ? 'loading' : 'unavailable',
            writable: snapshot.writable,
            saving: false,
            failed: false,
            teams: this.draft ?? stored.teams,
            selections: stored.selections,
            dirty: this.draft !== undefined,
            providers: this.providers,
            catalogue: this.catalogue,
            cataloguePartial: this.cataloguePartial,
            tools: this.tools,
            toolCatalogue: this.toolCatalogue,
        };
    }
    publish(patch = {}) {
        if (this.disposed)
            return;
        this.store.set({ ...this.projection(), ...patch });
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
            removeTeam: (index) => { this.removeTeam(index); },
            addMember: (teamIndex) => { this.addMember(teamIndex); },
            removeMember: (teamIndex, memberIndex) => { this.removeMember(teamIndex, memberIndex); },
            patchTeam: (index, patch) => { this.patchTeam(index, patch); },
            patchCaptain: (teamIndex, patch) => { this.patchCaptain(teamIndex, patch); },
            patchMember: (teamIndex, memberIndex, patch) => {
                this.patchMember(teamIndex, memberIndex, patch);
            },
            save: () => this.save(),
            discard: () => { this.discard(); },
            selectTeam: (sessionId, teamId) => this.selectTeam(sessionId, teamId),
            loadCatalogue: () => { this.loadCatalogue(); },
            refreshCatalogue: () => { this.refreshCatalogue(); },
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
        if (this.disposed)
            return;
        this.catalogueGeneration += 1;
        this.catalogueLoading = false;
        this.catalogue = 'idle';
        this.cataloguePartial = false;
        this.toolCatalogueLoading = false;
        this.toolCatalogue = 'idle';
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
        if (this.catalogueLoading || this.catalogue === 'ready')
            return;
        const generation = this.catalogueGeneration;
        this.catalogueLoading = true;
        this.catalogue = 'loading';
        this.publish();
        const read = this.ctx.remote.session.modelCatalog();
        void read.then((result) => {
            if (!this.acceptsCatalogue(generation))
                return;
            if (!result.ok)
                throw new Error(result.error.message);
            this.providers = result.value.groups.map(group => describeGroup(group));
            this.cataloguePartial = result.value.failures.length > 0;
            this.catalogue = 'ready';
            this.catalogueLoading = false;
            this.publish();
        }).catch(() => {
            if (!this.acceptsCatalogue(generation))
                return;
            this.catalogue = 'error';
            this.catalogueLoading = false;
            this.publish();
        });
    }
    loadToolCatalogue() {
        if (this.toolCatalogueLoading || this.toolCatalogue === 'ready')
            return;
        const generation = this.catalogueGeneration;
        this.toolCatalogueLoading = true;
        this.toolCatalogue = 'loading';
        this.publish();
        const read = this.ctx.remote.teamPresets.catalog();
        void read.then((result) => {
            if (!this.acceptsCatalogue(generation))
                return;
            if (!result.ok)
                throw new Error(result.error.message);
            this.tools = result.value.tools.map(tool => ({ name: tool.name, description: tool.description }));
            this.toolCatalogue = 'ready';
            this.toolCatalogueLoading = false;
            this.publish();
        }).catch(() => {
            if (!this.acceptsCatalogue(generation))
                return;
            this.toolCatalogue = 'error';
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
        if (this.draft === undefined) {
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
        if (draft[index] === undefined)
            return;
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
        if (source === undefined)
            return undefined;
        const copy = {
            ...structuredClone(source),
            id: createTeamPreset(draft).id,
            name: source.name === '' ? '' : `${source.name} copy`,
        };
        this.draft = [...draft.slice(0, index + 1), copy, ...draft.slice(index + 1)];
        this.publish();
        return copy.id;
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
        if (current === undefined)
            return;
        this.replaceTeam(index, { ...current, ...patch });
    }
    /**
     * Replace fields of one Team's captain.
     * @param teamIndex - the Team whose captain changes.
     * @param patch - the changed fields.
     */
    patchCaptain(teamIndex, patch) {
        const current = this.beginDraft()[teamIndex];
        if (current === undefined)
            return;
        this.replaceTeam(teamIndex, { ...current, captain: { ...current.captain, ...patch } });
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
        if (team === undefined || member === undefined)
            return;
        this.replaceTeam(teamIndex, {
            ...team,
            members: team.members.map((entry, position) => position === memberIndex ? { ...entry, ...patch } : entry),
        });
    }
    /**
     * Append an empty member to one Team.
     * @param teamIndex - the Team that gains a member.
     */
    addMember(teamIndex) {
        const team = this.beginDraft()[teamIndex];
        if (team === undefined)
            return;
        this.replaceTeam(teamIndex, { ...team, members: [...team.members, emptyAgentPreset()] });
    }
    /**
     * Remove one member from a Team.
     * @param teamIndex - the Team that owns the member.
     * @param memberIndex - the member position.
     */
    removeMember(teamIndex, memberIndex) {
        const team = this.beginDraft()[teamIndex];
        if (team === undefined)
            return;
        this.replaceTeam(teamIndex, {
            ...team,
            members: team.members.filter((_, position) => position !== memberIndex),
        });
    }
    /** Write the staged Teams. */
    async save() {
        const snapshot = this.form.getSnapshot();
        if (this.draft === undefined || snapshot.status !== 'ready' || !snapshot.writable)
            return;
        const draft = this.draft;
        const revision = this.draftRevision;
        this.publish({ saving: true, failed: false });
        const landed = await this.form.mutate([{ op: 'set', path: ['teams'], value: draft.map(team => teamJson(team)) }], revision);
        if (this.disposed)
            return;
        if (landed) {
            this.draft = undefined;
            this.draftRevision = undefined;
        }
        this.publish({ saving: false, failed: !landed });
    }
    /** Drop every staged edit. */
    discard() {
        if (this.draft === undefined)
            return;
        this.draft = undefined;
        this.draftRevision = undefined;
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
        if (snapshot.status !== 'ready' || !snapshot.writable)
            return;
        const stored = snapshot.value ?? EMPTY;
        const next = withSelection(stored.selections, sessionId, teamId);
        await this.form.mutate([{
                op: 'set',
                path: ['selections'],
                value: next.map(record => ({ sessionId: record.sessionId, teamId: record.teamId })),
            }]);
    }
}
/** Narrow one catalogue group into picker choices. */
function describeGroup(group) {
    return {
        id: group.id,
        name: group.name,
        models: group.models.map(model => ({
            id: model.id,
            name: model.name,
            efforts: (model.reasoning?.efforts ?? []).map(effort => ({ id: effort.id, name: effort.name })),
        })),
    };
}
export { sameTeam };
