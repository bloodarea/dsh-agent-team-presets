/**
 * Staged Team preset editing over the `agent-team-presets` settings namespace,
 * plus the per-Session Team selection the composer control writes.
 */
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store';
import { toolMode, withSelection } from "../presets.js";
import { cloneMetadata, restoreBuiltinTeams } from "../builtin-teams.js";
import { builtinEntry } from "../team-catalog.js";
import { applySharedFields, importConflicts, memberFromTransfer, parseTeamPresetText, serializeTeamPreset, slotNameKey, teamFromTransfer, uniqueName, } from "../preset-transfer.js";
import { liveAssignments } from "../team-search.js";
/**
 * Loader entry id of the Host row that owns the Team preset namespace. Spelled
 * here rather than imported: a client package must not depend on a Host package.
 */
export const TEAM_PRESETS_NS = 'agent-team-presets';
/** Colors offered for a member's accent mark. */
export const AGENT_COLORS = [
    '#4c8dff', '#2fbf71', '#e0a43c', '#e05c6b', '#8d6bff', '#25b0c4', '#c46bd0', '#8a94a6',
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
export function executionStateOf(state, teamId) {
    if (state.execution !== 'ready')
        return 'unknown';
    return state.executions.find(row => row.teamId === teamId)?.state ?? 'unknown';
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
export function unnamedTeamsOf(teams) {
    return teams.filter(team => team.name.trim() === '');
}
/**
 * The resolution one document needs when the user was asked nothing.
 * @param plan - the inspection of the document.
 * @returns the resolution that adds the document as a new Team.
 */
export function defaultImportResolution(plan) {
    return {
        team: plan.targetIndex === undefined ? 'rename' : 'replace',
        teamName: plan.suggestedTeamName,
        captain: 'replace',
        members: {},
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
    const importedNames = new Map();
    for (const incoming of plan.transfer.team.members) {
        const key = slotNameKey(incoming.name);
        const at = key === '' ? -1 : members.findIndex(member => slotNameKey(member.name) === key);
        if (at >= 0 && (resolution.members[incoming.name] ?? 'replace') === 'replace') {
            const existing = members[at];
            if (existing !== undefined) {
                members[at] = applySharedFields(existing, incoming);
                importedNames.set(incoming.name, incoming.name);
                continue;
            }
        }
        const name = uniqueName(incoming.name, members.map(member => member.name));
        members.push(memberFromTransfer({ ...incoming, name }));
        importedNames.set(incoming.name, name);
    }
    const captain = plan.transfer.team.captain;
    const captainName = resolution.captain === 'rename' ? plan.suggestedCaptainName : captain.name;
    importedNames.set(captain.name, captainName);
    return {
        id: target.id,
        name: plan.transfer.team.name,
        description: plan.transfer.team.description,
        // v1 never carried discovery metadata; preserve it on a legacy overwrite.
        // v2 owns the field, including an intentionally empty metadata object.
        ...(plan.transfer.version < 2
            ? target.metadata === undefined ? {} : { metadata: structuredClone(target.metadata) }
            : { metadata: structuredClone(plan.transfer.team.metadata ?? {}) }),
        ...(plan.transfer.team.officialSkills === undefined
            ? target.officialSkills === undefined ? {} : { officialSkills: structuredClone(target.officialSkills) }
            : { officialSkills: plan.transfer.team.officialSkills.map(binding => ({
                    ...binding,
                    roleName: importedNames.get(binding.roleName) ?? binding.roleName,
                })) }),
        captain: applySharedFields(target.captain, { ...captain, name: captainName }),
        members,
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
    if (!Array.isArray(value))
        return [];
    const rows = [];
    const seen = new Set();
    for (const row of value) {
        if (typeof row !== 'object' || row === null)
            continue;
        const candidate = row;
        if (typeof candidate.id !== 'string' || candidate.id === '' || seen.has(candidate.id))
            continue;
        seen.add(candidate.id);
        rows.push({
            id: candidate.id,
            name: typeof candidate.name === 'string' ? candidate.name : '',
            order: typeof candidate.order === 'number' ? candidate.order : rows.length,
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
    if (!Array.isArray(value))
        return [];
    const rows = [];
    const seen = new Set();
    for (const row of value) {
        if (typeof row !== 'object' || row === null)
            continue;
        const candidate = row;
        if (typeof candidate.teamId !== 'string' || candidate.teamId === '')
            continue;
        if (typeof candidate.categoryId !== 'string' || candidate.categoryId === '')
            continue;
        if (seen.has(candidate.teamId))
            continue;
        seen.add(candidate.teamId);
        rows.push({ teamId: candidate.teamId, categoryId: candidate.categoryId });
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
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return undefined;
    const section = value;
    const rawTeams = Array.isArray(section.teams) ? section.teams : [];
    const teams = rawTeams.map(team => {
        const entry = builtinEntry(team.id);
        if (entry !== undefined && (team.metadata === undefined || (team.metadata.summary ?? '').trim() === '')) {
            return {
                ...team,
                metadata: cloneMetadata(entry.metadata),
            };
        }
        return team;
    });
    return {
        teams,
        selections: Array.isArray(section.selections) ? section.selections : [],
        categories: categoryRows(section.categories),
        teamCategories: assignmentRows(section.teamCategories),
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
        ...agent.id === undefined ? {} : { id: agent.id },
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
        ...team.metadata === undefined ? {} : {
            metadata: {
                summary: team.metadata.summary ?? '',
                tags: [...(team.metadata.tags ?? [])],
                useCases: [...(team.metadata.useCases ?? [])],
                quickPrompts: [...(team.metadata.quickPrompts ?? [])],
                notes: team.metadata.notes ?? '',
            },
        },
        ...team.officialSkills === undefined ? {} : {
            officialSkills: team.officialSkills.map(binding => ({ skillId: binding.skillId, roleName: binding.roleName })),
        },
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
    return team.name === '' ? team.id : team.name;
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
        id: crypto.randomUUID(),
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
    execution = 'loading';
    executions = [];
    executionGeneration = 0;
    executionAbort;
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
        this.mirror = ctx.configForms.describe();
        this.store = createSnapshotStore(this.projection());
        this.unsubscribe = this.form.subscribe(() => {
            this.reconcile();
            this.publish();
        });
        // The mirror is subscribed after the form, whose own subscription is what
        // derives it: every mirror publication therefore reaches the form's store
        // first, so this projection never observes a section the form has not yet
        // been offered.
        this.unsubscribeMirror = this.mirror.subscribe(() => { this.publish(); });
    }
    /** Release the form and mirror subscriptions and the execution stream. */
    dispose() {
        this.disposed = true;
        this.executionGeneration += 1;
        this.executionAbort?.abort();
        this.executionAbort = undefined;
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
            dirty: this.draft !== undefined,
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
            selectionPending: this.selectionPending,
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
        if (mirrored.view === undefined)
            return mirrored.error === null ? 'loading' : 'unavailable';
        return this.namespaceView() === undefined ? 'unavailable' : 'ready';
    }
    /**
     * The Host's view of the Team namespace, or undefined while it serves none.
     * @returns the namespace view the describe mirror currently holds.
     */
    namespaceView() {
        return this.mirror.getSnapshot().view?.namespaces.find(row => row.ns === TEAM_PRESETS_NS);
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
        const mirrored = this.mirror.getSnapshot();
        if (mirrored.view !== undefined)
            return sectionOf(this.namespaceView()?.value);
        const accepted = this.form.getSnapshot().value;
        // The form value carries only the two fields its own schema declares, so a
        // document reached through the form alone has no categories: they are local
        // UI data the Host schema stores beside the Teams, and the mirror is the
        // only reader that can see them.
        return accepted === undefined
            ? undefined
            : { teams: accepted.teams, selections: accepted.selections, categories: [], teamCategories: [] };
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
        if (view === undefined)
            return this.form.getSnapshot().writable;
        return this.namespaceView() === undefined ? false : view.writable;
    }
    /**
     * Name why the stored section cannot be edited, when it cannot.
     * @returns the condition, or undefined when this page can edit and save.
     */
    formIssue() {
        const mirrored = this.mirror.getSnapshot();
        if (mirrored.view === undefined)
            return mirrored.error === null ? undefined : 'settings-unavailable';
        if (this.namespaceView() === undefined)
            return 'namespace-missing';
        return this.form.getSnapshot().status === 'ready' ? undefined : 'schema-rejected';
    }
    publish(patch = {}) {
        if (this.disposed)
            return;
        this.store.set({ ...this.projection(), ...patch });
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
        if (this.draft === undefined || this.saving)
            return;
        const snapshot = this.form.getSnapshot();
        const stored = snapshot.value?.teams;
        const base = this.draftBase;
        if (snapshot.status !== 'ready' || stored === undefined || base === undefined)
            return;
        const hosts = new Map(stored.map(team => [team.id, team]));
        const draft = this.draft;
        const staged = new Set(draft.map(team => team.id));
        const adopted = [];
        const removed = [];
        const kept = [];
        for (const team of draft) {
            const host = hosts.get(team.id);
            const before = base.get(team.id);
            // A Team the baseline never held is this page's own, not the Host's.
            if (before === undefined) {
                kept.push(team);
                continue;
            }
            if (host === undefined) {
                // The Host deleted a Team the draft still held: keeping it would
                // resurrect it on the next save.
                removed.push({ name: teamLabel(team), edited: !sameTeam(before, team) });
                continue;
            }
            if (sameTeam(before, host) || sameTeam(team, host)) {
                kept.push(team);
                continue;
            }
            adopted.push({ name: teamLabel(host), overridden: !sameTeam(before, team) });
            kept.push(structuredClone(host));
        }
        // A Team neither the draft nor the baseline held is the Host's addition.
        const added = stored.filter(host => !staged.has(host.id) && !base.has(host.id));
        this.draftBase = new Map(stored.map(team => [team.id, structuredClone(team)]));
        this.draftRevision = snapshot.revision;
        const coordinated = adopted.length > 0 || removed.length > 0 || added.length > 0;
        if (coordinated) {
            this.externalUpdate = {
                teams: adopted.map(entry => entry.name),
                overridden: adopted.filter(entry => entry.overridden).map(entry => entry.name),
                added: added.map(teamLabel),
                removed: removed.map(entry => entry.name),
                removedEdited: removed.filter(entry => entry.edited).map(entry => entry.name),
            };
        }
        const next = added.length === 0 ? kept : [...kept, ...added.map(host => structuredClone(host))];
        // Whatever the coordination did, a draft that now matches the Host field
        // for field has nothing left to save: it is dropped rather than left staged
        // as an "unsaved change" the user cannot see. A Host write that happened to
        // land on the staged value needs no replacement and reports nothing, and
        // the draft is still cleared here.
        if (next.length === stored.length && next.every((team, index) => {
            const host = stored[index];
            return host !== undefined && sameTeam(team, host);
        })) {
            this.draft = undefined;
            this.draftBase = undefined;
            this.draftRevision = undefined;
            return;
        }
        // An untouched draft keeps its identity, and the report the user may not
        // have seen yet stands.
        if (!coordinated)
            return;
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
            restoreDefaults: () => { this.restoreDefaults(); },
            exportTeam: (index) => this.exportTeam(index),
            inspectImport: (text) => this.inspectImport(text),
            applyImport: (plan, resolution) => {
                return this.applyImport(plan, resolution);
            },
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
            selectMember: (sessionId, teamId, roleId) => this.selectMember(sessionId, teamId, roleId),
            loadCatalogue: () => { this.loadCatalogue(); },
            refreshCatalogue: () => { this.refreshCatalogue(); },
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
        if (this.disposed || this.executionAbort !== undefined)
            return;
        const abort = new AbortController();
        this.executionAbort = abort;
        const generation = ++this.executionGeneration;
        // Nothing is known until this generation's opening frame arrives.
        this.execution = 'loading';
        this.executions = [];
        this.publish();
        void this.consumeExecution(abort, generation);
    }
    /**
     * Read whole-set execution frames until the stream ends.
     * @param abort - the generation's cancellation.
     * @param generation - the generation this read owns; a superseded read publishes nothing.
     */
    async consumeExecution(abort, generation) {
        try {
            for await (const frame of this.ctx.remote.teamPresets.execution(abort.signal)) {
                if (this.disposed || generation !== this.executionGeneration)
                    return;
                this.execution = 'ready';
                this.executions = frame.teams;
                this.publish();
            }
            this.failExecution(generation);
        }
        catch (_failure) {
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
        if (this.disposed || generation !== this.executionGeneration)
            return;
        this.executionAbort = undefined;
        this.execution = 'error';
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
        }
        catch (_unreachable) {
            return undefined;
        }
    }
    loadModelCatalogue() {
        if (this.catalogueLoading || this.catalogue === 'ready')
            return;
        const generation = this.catalogueGeneration;
        this.catalogueLoading = true;
        this.catalogue = 'loading';
        this.publish();
        const read = this.readNamespace(() => this.ctx.remote.session.modelCatalog());
        if (read === undefined) {
            this.catalogue = 'error';
            this.catalogueLoading = false;
            this.publish();
            return;
        }
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
        const read = this.readNamespace(() => this.ctx.remote.teamPresets.catalog());
        if (read === undefined) {
            this.toolCatalogue = 'error';
            this.toolCatalogueLoading = false;
            this.publish();
            return;
        }
        void read.then((result) => {
            if (!this.acceptsCatalogue(generation))
                return;
            if (!result.ok)
                throw new Error(result.error.message);
            // The role restriction and the source attribution must survive this
            // projection: dropping them here is what let a member page offer
            // captain-only tools as freely grantable and left every tool ungrouped.
            this.tools = result.value.tools.map(tool => ({
                name: tool.name,
                description: tool.description,
                source: tool.source,
                ...tool.captainOnly === true ? { captainOnly: true } : {},
                ...tool.server === undefined ? {} : { server: tool.server },
            }));
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
     * rebuilds the array and the touched record instead of mutating either. A
     * user edit also retires the last external-update report: the page is once
     * again acting on the draft the user holds.
     * @returns the current staged Teams.
     */
    beginDraft() {
        this.externalUpdate = undefined;
        this.defaultsRestore = undefined;
        if (this.draft === undefined) {
            const snapshot = this.form.getSnapshot();
            const stored = snapshot.value?.teams ?? [];
            this.draft = structuredClone(stored);
            this.draftBase = new Map(stored.map(team => [team.id, structuredClone(team)]));
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
            this.defaultsRestore = 'unchanged';
            this.publish();
            return 'unchanged';
        }
        this.beginDraft();
        this.draft = restored.teams;
        this.defaultsRestore = 'restored';
        this.publish();
        return 'restored';
    }
    /**
     * Serialize one Team as the fixed shareable document.
     * @param index - the Team position to export.
     * @returns the document text, or undefined for a position the page does not show.
     */
    exportTeam(index) {
        const team = this.visibleTeams()[index];
        if (team === undefined)
            return undefined;
        const officialSkills = team.officialSkills ?? builtinEntry(team.id)?.officialSkillBindings;
        return serializeTeamPreset(team, officialSkills === undefined ? {} : { officialSkills });
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
        if (!parsed.ok)
            return parsed;
        return { ok: true, plan: { transfer: parsed.transfer, ...importConflicts(this.visibleTeams(), parsed.transfer) } };
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
        const target = plan.targetIndex === undefined ? undefined : draft[plan.targetIndex];
        if (resolution.team === 'replace' && target !== undefined) {
            const merged = mergeTransfer(target, plan, resolution);
            this.draft = draft.map((team, position) => position === plan.targetIndex ? merged : team);
            this.publish();
            return target.id;
        }
        const preferred = resolution.teamName.trim() === '' ? plan.transfer.team.name : resolution.teamName;
        const name = uniqueName(preferred, draft.map(team => team.name));
        const created = { ...teamFromTransfer(plan.transfer, createTeamPreset(draft).id), name };
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
        if (this.draft === undefined || snapshot.status !== 'ready' || !snapshot.writable) {
            // Staged work the page cannot write is a failure the user must see: the
            // status line names it, where a silent return left the click unanswered.
            if (this.draft !== undefined)
                this.publish({ failed: true });
            return;
        }
        const draft = this.draft;
        const revision = this.draftRevision;
        this.saving = true;
        this.externalUpdate = undefined;
        this.publish({ saving: true, failed: false });
        let landed = false;
        try {
            landed = await this.form.mutate([{ op: 'set', path: ['teams'], value: draft.map(team => teamJson(team)) }], revision);
        }
        finally {
            this.saving = false;
        }
        if (this.disposed)
            return;
        if (landed) {
            this.draft = undefined;
            this.draftBase = undefined;
            this.draftRevision = undefined;
            // The restore the notice asked the user to save has now landed.
            this.defaultsRestore = undefined;
        }
        else {
            // A refused write leaves the page fenced on a revision the Host has moved
            // past, and the recovery read behind the refusal has already folded what
            // changed meanwhile. Coordinating again adopts that stored change and
            // re-aligns the fence, so the retry is a real retry instead of the same
            // conflict forever.
            this.reconcile();
        }
        this.publish({ saving: false, failed: !landed });
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
        if (snapshot.status !== 'ready' || !snapshot.writable) {
            this.publish({ failed: true });
            return false;
        }
        const ops = [
            { op: 'set', path: ['categories'], value: next.map(row => ({ ...row })) },
            { op: 'set', path: ['teamCategories'], value: memberships.map(row => ({ ...row })) },
        ];
        const landed = await this.form.mutate(ops, snapshot.revision);
        if (this.disposed)
            return false;
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
        if (trimmed === '')
            return false;
        const current = this.projection();
        const existing = current.categories;
        const id = `cat-${Date.now().toString(36)}`;
        const order = existing.reduce((max, row) => Math.max(max, row.order), 0) + 1;
        return this.writeCategories([...existing, { id, name: trimmed, order }], current.teamCategories);
    }
    /**
     * Remove one category and every membership that pointed at it.
     * @param id - category identity.
     * @returns whether the Host accepted the write.
     */
    async removeCategory(id) {
        const current = this.projection();
        return this.writeCategories(current.categories.filter(row => row.id !== id), current.teamCategories.filter(row => row.categoryId !== id));
    }
    /**
     * Rename one category.
     * @param id - category identity.
     * @param name - the new display name.
     * @returns whether the Host accepted the write.
     */
    async renameCategory(id, name) {
        const trimmed = name.trim();
        if (trimmed === '')
            return false;
        const current = this.projection();
        // Memberships reference ids, so a rename never has to touch a Team.
        return this.writeCategories(current.categories.map(row => row.id === id ? { ...row, name: trimmed } : row), current.teamCategories);
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
        const from = ordered.findIndex(row => row.id === id);
        const to = from + delta;
        if (from < 0 || to < 0 || to >= ordered.length)
            return false;
        const [moved] = ordered.splice(from, 1);
        if (moved === undefined)
            return false;
        ordered.splice(to, 0, moved);
        return this.writeCategories(ordered.map((row, index) => ({ ...row, order: index })), current.teamCategories);
    }
    /**
     * Move one Team into one category, or out of every category.
     * @param teamId - Team identity.
     * @param categoryId - category identity, or an empty string for none.
     * @returns whether the Host accepted the write.
     */
    async setCategory(teamId, categoryId) {
        const current = this.projection();
        const without = current.teamCategories.filter(row => row.teamId !== teamId);
        const next = categoryId === '' ? without : [...without, { teamId, categoryId }];
        return this.writeCategories(current.categories, next);
    }
    /** Drop every staged edit. */
    discard() {
        if (this.draft === undefined)
            return;
        this.draft = undefined;
        this.draftBase = undefined;
        this.draftRevision = undefined;
        this.externalUpdate = undefined;
        this.defaultsRestore = undefined;
        this.publish();
    }
    /**
     * Apply one Team to a Session, or clear its Team.
     *
     * A captain-led selection: any member the Session was talking to is cleared
     * with the record, because the captain always leads and never inherits a
     * member's route.
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
        return this.applySelection(sessionId, teamId, undefined);
    }
    /**
     * Point one Session at a single member of a Team.
     *
     * The same fence, retry, and failure path as {@link selectTeam}, with the
     * member's stable role identity carried in the stored record: the Host then
     * injects that member's own configuration and model route, and this Session
     * talks to the member instead of being led by the captain. Nothing is
     * validated here — the composer only offers identities the stored Team still
     * holds, and a role that disappears later is exactly the stale-selection case
     * the missing notice already reports.
     * @param sessionId - the Session whose selection changes.
     * @param teamId - the Team the member belongs to.
     * @param roleId - the member's stable role identity.
     * @returns once the write settled; the outcome is published on {@link store}.
     */
    async selectMember(sessionId, teamId, roleId) {
        return this.applySelection(sessionId, teamId, roleId);
    }
    /**
     * Write one Session selection, captain-led or member-scoped.
     *
     * The fence, the single retry, and the failure report are identical for both
     * forms; only the record the write carries differs.
     * @param sessionId - the Session whose selection changes.
     * @param teamId - the selected Team identity; undefined clears the selection.
     * @param roleId - the member to talk to individually; undefined keeps the captain leading.
     * @returns once the write settled; the outcome is published on {@link store}.
     */
    async applySelection(sessionId, teamId, roleId) {
        // Acting again retires the report of the last attempt: the notice describes
        // the click the user just made, never one they already moved past.
        this.selectionFailure = undefined;
        this.publish();
        const view = this.namespaceView();
        if (view === undefined || this.storedSection() === undefined || !this.documentWritable()) {
            this.failSelection({ kind: 'unavailable', sessionId, teamId, detail: undefined });
            return;
        }
        const attempt = await this.writeSelection(sessionId, teamId, roleId, view.revision);
        if (attempt.kind === 'landed')
            return;
        const recovered = this.namespaceView();
        const retried = recovered === undefined
            ? attempt
            : await this.writeSelection(sessionId, teamId, roleId, recovered.revision);
        if (retried.kind === 'landed')
            return;
        this.failSelection({ kind: retried.kind, sessionId, teamId, detail: retried.detail });
    }
    /**
     * Write one selection under one revision fence.
     * @param sessionId - the Session whose Team changes.
     * @param teamId - the selected Team identity; undefined clears the selection.
     * @param roleId - the member to talk to individually; undefined keeps the captain leading.
     * @param revision - the revision the write is fenced on.
     * @returns the outcome, with the Host's own refusal text when it refused.
     */
    async writeSelection(sessionId, teamId, roleId, revision) {
        const stored = this.storedSection();
        /* v8 ignore next -- every caller resolves the section before it writes. */
        if (stored === undefined)
            return { kind: 'failed', detail: undefined };
        const next = withSelection(stored.selections, sessionId, teamId, roleId);
        const ops = [{
                op: 'set',
                path: ['selections'],
                // Every record goes back out, so a member selection of another Session is
                // preserved rather than silently downgraded to its captain. A record with
                // no role is written exactly as it always was, without the field.
                value: next.map(record => {
                    const role = record.roleId;
                    return role === undefined || role.trim() === ''
                        ? { sessionId: record.sessionId, teamId: record.teamId }
                        : { sessionId: record.sessionId, teamId: record.teamId, roleId: role };
                }),
            }];
        let response;
        try {
            response = await this.ctx.remote.settings.mutate(TEAM_PRESETS_NS, ops, revision);
        }
        catch (error) {
            await this.refreshStored();
            return { kind: 'failed', detail: messageOf(error) };
        }
        if (this.disposed)
            return { kind: 'landed' };
        if (!response.ok) {
            // The refusal is only actionable against the document the Host holds now,
            // and the recovery read is what republishes whatever changed under it.
            await this.refreshStored();
            return { kind: 'refused', detail: response.error.message };
        }
        // The same fold the shared form performs, so a selection written here is
        // visible to every other settings surface without waiting for a reload.
        this.mirror.acceptView(response.value);
        return { kind: 'landed' };
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
            if (!response.ok)
                return;
            const view = response.value.namespaces.find(row => row.ns === TEAM_PRESETS_NS);
            if (view !== undefined)
                this.mirror.acceptView(view);
        }
        catch (_unreachable) {
            // A failed recovery read leaves the held document standing: the notice the
            // user is about to see already says the write did not land.
        }
    }
    /**
     * Publish one selection failure for the page and the composer control.
     * @param failure - the refusal or failure to report.
     */
    failSelection(failure) {
        this.selectionFailure = failure;
        this.publish();
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
