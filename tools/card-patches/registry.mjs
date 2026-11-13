/**
 * Upstream recipes for the card-patch pipeline.
 *
 * Each entry answers the questions a rebuild needs and that nothing else can
 * answer: where the target's source lives, which tag a version resolves to, how
 * that source is built, which file is the browser bundle, and which markers
 * prove the card-badge patch actually landed.
 *
 * The runtime catalog (`src/card-patches.ts` plus the shipped overlay) is a
 * different document: it records finished artifacts and their hashes. Keeping
 * the two apart means a version bump never needs a code edit — the pipeline
 * writes artifacts and catalog entries, and the recipes here stay unchanged
 * unless an upstream project moves its source or changes how it builds.
 *
 * `markers` are the fail-closed check on patch adaptation: a source patch that
 * applies with fuzz can land in the wrong place, so every file the change is
 * supposed to touch must still contain the identifiers the change introduces.
 */

/** One upstream this plugin can rebuild a patched browser bundle for. */
export const PIPELINE_TARGETS = Object.freeze([
  Object.freeze({
    id: 'dsh-context',
    packageName: 'dsh-context',
    /** Where the source is cloned from; version tags are `v<version>`. */
    repository: 'https://github.com/bowenliang123/dsh-context.git',
    tagPrefix: 'v',
    /** Card-badge service the built bundle must register. */
    service: 'contextAgentCardBadges',
    patch: 'contrib/agent-card-badges/dsh-context-0.84.0-aa98b1231d5f.patch',
    /** Install/build argv for the target's own toolchain. */
    install: ['install', '--frozen-lockfile'],
    build: ['run', 'build'],
    /** The Client bundle this plugin replaces after the build. */
    artifact: 'lib/client.js',
    /**
     * Post-patch source facts. Every listed file must still carry every marker:
     * that is what distinguishes "the patch landed" from "the patch applied".
     */
    markers: [
      { path: 'src/client/agent-card-badges.tsx', text: ['createAgentCardBadges', 'AgentCardBadgesService'] },
      { path: 'src/client/index.ts', text: ['contextAgentCardBadges'] },
      {
        path: 'src/client/components/agentGraph.tsx',
        text: ['AgentCardBadges', '<props.AgentCardBadges sessionId={node.id} />'],
      },
      { path: 'src/client/components/contextView.tsx', text: ['AgentCardBadges'] },
      { path: 'src/client/components/fleetView.tsx', text: ['AgentCardBadges'] },
    ],
  }),
  Object.freeze({
    id: 'dsh-better-sidebar',
    packageName: 'dsh-better-sidebar',
    repository: 'https://github.com/omdsh-dev/DSH-better-sidebar.git',
    tagPrefix: 'v',
    service: 'betterSidebarAgentCardBadges',
    patch: 'contrib/agent-card-badges/dsh-better-sidebar-0.32.0.patch',
    install: ['install', '--frozen-lockfile'],
    build: ['run', 'build'],
    artifact: 'lib/client.js',
    markers: [
      { path: 'src/client/agent-card-badges.tsx', text: ['createAgentCardBadges', 'AgentCardBadgesService'] },
      // The Sidebar's Client entry is `.tsx`, unlike context's `.ts`.
      { path: 'src/client/index.tsx', text: ['betterSidebarAgentCardBadges', 'agentCardBadges.Badges'] },
      { path: 'src/client/SubagentView.tsx', text: ['AgentCardBadges'] },
      { path: 'src/client/TasksGraph.tsx', text: ['AgentCardBadges'] },
      { path: 'src/client/TasksTree.tsx', text: ['AgentCardBadges'] },
      { path: 'src/client/tasks-card.tsx', text: ['props.badges'] },
    ],
  }),
])

/**
 * Resolve one recipe by target identity.
 * @param {string} id - the catalog identity, such as `dsh-context`.
 * @returns {typeof PIPELINE_TARGETS[number] | undefined}
 */
export function findPipelineTarget(id) {
  return PIPELINE_TARGETS.find(target => target.id === id)
}
