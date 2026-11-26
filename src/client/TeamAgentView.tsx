/**
 * Third Team preset page: one captain or member, split into identity, model,
 * tools, and system prompt cards so a narrow Settings panel never crowds.
 */

import { Button, Checkbox, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import { useEffect, useState } from 'react'
import { keywordTokens, matchKeyword } from '../keyword-search.ts'
import type { TeamSkillsController } from './team-skills-controller.ts'
import { AGENT_COLORS } from './team-presets-controller.ts'
import type { ProviderChoice } from './team-presets-controller.ts'
import { FieldPicker } from './FieldPicker.tsx'
import type { PickerChoice } from './FieldPicker.tsx'
import { IMPLICIT_TOOLS, toolMode } from '../presets.ts'
import type { TeamAgentPreset, TeamCaptainPreset, ToolChoice } from '../types.ts'
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS, skillCategoryOf, skillLabel, type SkillCategoryId, type TeamPresetsLocaleKey } from './locales.ts'
import css from './TeamPresetsSection.module.css'

/** Colors offered for one agent's accent mark. */
const NO_COLOR = ''

/**
 * Whether one edited slot owns a route.
 * @param agent - the captain or member being edited.
 * @returns whether the slot stores its own provider, model, and reasoning effort.
 */
function hasMemberRoute(agent: TeamAgentPreset | TeamCaptainPreset): agent is TeamAgentPreset {
  return 'provider' in agent
}

/** Props of one agent's page. */
export interface TeamAgentViewProps {
  /** The agent slot being edited. */
  readonly agent: TeamAgentPreset | TeamCaptainPreset
  /** Whether this slot is the Team captain or one member. */
  readonly role: 'captain' | 'member'
  /** Display name of the Team that owns this agent. */
  readonly teamName: string
  /** Provider catalogue the model pickers render. */
  readonly providers: readonly ProviderChoice[]
  /** Global tools this deployment exposes to an allow-list. */
  readonly tools: readonly ToolChoice[]
  /** Whether the tool catalogue is still loading or failed. */
  readonly toolCatalogue: 'idle' | 'loading' | 'ready' | 'error'
  /** Whether some provider failed its catalogue lookup, so its models are absent. */
  readonly cataloguePartial: boolean
  /** Whether the provider catalogue could not be read at all, so no model can be offered. */
  readonly catalogueFailed: boolean
  /** Page copy reader. */
  readonly t: (key: TeamPresetsLocaleKey) => string
  /** Whether the Host document accepts writes. */
  readonly disabled: boolean
  readonly onBack: () => void
  readonly onChange: (patch: Partial<TeamAgentPreset>) => void
  /** Removes this member; absent for the captain, which a Team always needs. */
  readonly onDelete?: () => void
  /** Team Skill assignment, absent when this build ships no library service. */
  readonly skills?: TeamSkillsController
  /** The Team whose role slot receives the skills. */
  readonly teamId: string
  /** The role identity of this page, or `captain`. */
  readonly roleId: string
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
function originToneClass(styles: Record<string, string | undefined>, origin: string): string {
  if (origin === 'builtin') return styles.originBuiltin ?? ''
  if (origin === 'override') return styles.originOverride ?? ''
  return styles.originCustom ?? ''
}

/** The origin of a Team Skill as the reader sees it, never the raw field value. */
function originCopy(origin: string, t: (key: TeamPresetsLocaleKey) => string): string {
  if (origin === 'builtin') return t('originBuiltin')
  if (origin === 'override') return t('originOverride')
  return t('originCustom')
}

function SkillAssignmentGrid(props: { controller: TeamSkillsController; teamId: string; roleId: string; t: (key: TeamPresetsLocaleKey) => string }): React.ReactElement | null {
  const [state, setState] = useState(props.controller.getSnapshot())
  useEffect(() => {
    const unsubscribe = props.controller.subscribe(() => { setState(props.controller.getSnapshot()) })
    void props.controller.refresh()
    return unsubscribe
  }, [props.controller])
  const assets = state.library?.assets ?? []
  const held = new Set(assets.filter(asset => asset.bindings.some(row => row.teamId === props.teamId && row.roleId === props.roleId)).map(asset => asset.id))
  const [category, setCategory] = useState<'all' | SkillCategoryId>('all')
  const [query, setQuery] = useState('')
  // Which holdings the grid shows. It reads the same `held` set the checkboxes
  // reflect, so "bound" and "a checked card" can never disagree.
  const [binding, setBinding] = useState<'all' | 'bound' | 'unbound'>('all')
  // The filters narrow what can be assigned here; they never change what this
  // role already holds, so the heading counts every installed skill, not the
  // visible one.
  const tokens = keywordTokens(query)
  const visible = assets.filter((asset) => {
    if (category !== 'all' && skillCategoryOf(asset) !== category) return false
    if (binding !== 'all' && held.has(asset.id) !== (binding === 'bound')) return false
    // A skill is findable by the label the reader sees and by the raw id every
    // other surface names it by, so either vocabulary reaches it.
    return matchKeyword(tokens, [skillLabel(asset.skillId, props.t), asset.skillId, asset.description])
  })
  // Three independent filters stack, so the empty state has to name what is
  // actually filtering rather than blaming the category every time.
  const narrowing = category !== 'all' || binding !== 'all' || tokens.length > 0
  return (
    <>
      <div className={css.sepTitle}>
        {props.t('skillsAssignTitle')}
        <span className={css.hint}> · {String([...held].length)}/{String(assets.length)}</span>
      </div>
      <div className={css.panel}>
        {state.status === 'unavailable' ? (
          // A hidden section explained nothing: a reader saw the grid disappear
          // with no reason. Say why, and keep the heading above so the slot is
          // still visibly part of this page.
          <p className={css.muted} style={{ marginTop: 0 }} role="status">
            {state.issue === undefined
              ? props.t('skillsUnavailable')
              : `${props.t('skillsUnavailable')}: ${state.issue}`}
          </p>
        ) : (
          <p className={css.muted} style={{ marginTop: 0 }}>{props.t('skillsAssignHint')}</p>
        )}
        {state.status === 'unavailable' ? null : assets.length === 0 ? <p className={css.muted}>{props.t('skillsAssignEmpty')}</p> : (
          <>
            {/* Above the menus, because the keyword is the reader's first and
                cheapest narrowing: the two menus only split what is left. */}
            <div className={css.skillFilters}>
              <input
                className={css.search}
                type="search"
                value={query}
                placeholder={props.t('skillsAssignSearch')}
                aria-label={props.t('skillsAssignSearch')}
                onChange={(event) => { setQuery(event.target.value) }}
              />
              <div className={css.skillFilterMenus}>
                <select
                  className={css.select}
                  aria-label={props.t('skillsCategoryAll')}
                  value={category}
                  onChange={(event) => { setCategory(event.target.value as 'all' | SkillCategoryId) }}
                >
                  <option value="all">{props.t('skillsCategoryAll')}</option>
                  {SKILL_CATEGORIES.map(id => (
                    <option key={id} value={id}>{props.t(SKILL_CATEGORY_LABELS[id])}</option>
                  ))}
                </select>
                <select
                  className={css.select}
                  aria-label={props.t('skillsFilterBinding')}
                  value={binding}
                  onChange={(event) => { setBinding(event.target.value as 'all' | 'bound' | 'unbound') }}
                >
                  <option value="all">{props.t('skillsFilterBindingAll')}</option>
                  <option value="bound">{props.t('skillsFilterBindingBound')}</option>
                  <option value="unbound">{props.t('skillsFilterBindingUnbound')}</option>
                </select>
              </div>
            </div>
            {/* Three filters stack, so an empty grid names the one condition that
                can actually explain it instead of blaming the category every time. */}
            {visible.length === 0 ? (
              <p className={css.muted}>
                {narrowing ? props.t('skillsFilterNoMatch') : props.t('skillsFilterEmpty')}
              </p>
            ) : (
              <div className={css.skillGrid}>
                {visible.map(asset => (
                  <label key={asset.id} className={css.skillCard}>
                    <span className={css.skillCardTop}>
                      <span className={css.skillCardName} title={asset.skillId}>{skillLabel(asset.skillId, props.t)}</span>
                      <input
                        type="checkbox"
                        checked={held.has(asset.id)}
                        onChange={(event) => {
                          if (event.target.checked) void props.controller.assignSkill(props.teamId, props.roleId, asset.id)
                          else void props.controller.unassignSkill(props.teamId, props.roleId, asset.id)
                        }}
                      />
                    </span>
                    <span className={css.skillCardDesc}>{asset.description}</span>
                    <span className={`${css.skillCardTag} ${css.originTag} ${originToneClass(css, asset.origin)}`}>{originCopy(asset.origin, props.t)}</span>
                  </label>
                ))}
              </div>
            )}
          </>
        )}
        {state.message === undefined ? null : <p className={css.muted}>{state.message}</p>}
      </div>
    </>
  )
}

/**
 * Render one agent's page.
 * @param props - the agent, its role, the catalogue, copy, and write callbacks.
 * @returns the back row and the four setting cards.
 */
export function TeamAgentView(props: TeamAgentViewProps) {
  const { agent, t, disabled } = props
  const toolsReady = props.toolCatalogue === 'ready'
  const mode = toolMode(agent)
  const customTools = mode === 'custom'
  // An implicit tool is never offered as a choice, so a saved entry naming one
  // is neither missing nor removable: it is admitted by the policy itself. A
  // document written by an earlier version keeps loading unchanged.
  const unavailable = toolsReady
    ? agent.tools.filter(name => !IMPLICIT_TOOLS.includes(name) && !props.tools.some(tool => tool.name === name))
    : []
  const toolChoices: readonly ToolChoice[] = props.tools.length === 0
    ? agent.tools.map(name => ({ name, description: '', source: 'other' as const }))
    : props.tools
  // Group the catalogue by the only attributions the Host can prove, plus an
  // explicit "other" bucket. The registry records no registering package, so a
  // native Harness tool and a third-party plugin's tool cannot be told apart;
  // naming that bucket honestly beats guessing an owner for each name.
  const toolGroups: readonly { key: string; label: string; tools: readonly ToolChoice[] }[] = (() => {
    const ours = toolChoices.filter(tool => tool.source === 'presets')
    const byServer = new Map<string, ToolChoice[]>()
    const other: ToolChoice[] = []
    for (const tool of toolChoices) {
      if (tool.source === 'presets') continue
      if (tool.source === 'mcp' && tool.server !== undefined) {
        byServer.set(tool.server, [...byServer.get(tool.server) ?? [], tool])
        continue
      }
      other.push(tool)
    }
    const groups: { key: string; label: string; tools: readonly ToolChoice[] }[] = []
    if (ours.length > 0) groups.push({ key: 'presets', label: t('toolsGroupPresets'), tools: ours })
    for (const [server, tools] of [...byServer.entries()].sort(([left], [right]) => left.localeCompare(right))) {
      groups.push({ key: `mcp:${server}`, label: `${t('toolsGroupMcp')}: ${server}`, tools })
    }
    if (other.length > 0) groups.push({ key: 'other', label: t('toolsGroupOther'), tools: other })
    return groups
  })()
  // Groups start collapsed: a deployment with many tools is unreadable as one
  // flat grid, and each header already reports how many of its tools are chosen.
  const [expandedGroups, setExpandedGroups] = useState<readonly string[]>([])
  const [toolQuery, setToolQuery] = useState('')
  const toolTokens = keywordTokens(toolQuery)
  // A keyword finds a tool by its name, by its description, and by the group it
  // is listed under, so "mcp" or a server name reaches the tools it owns. While a
  // keyword is active every group that survived it opens: a match hidden inside a
  // collapsed group would be a search that returned nothing visible.
  //
  // What the keyword narrows is what the group SHOWS. A group's select-all,
  // invert, and clear rewrite exactly those shown tools and leave every tool the
  // keyword hid at the state it already had, so narrowing a list can never
  // silently uncheck a selection the reader merely scrolled past.
  const filteredToolGroups = toolGroups
    .map(group => ({
      group,
      shown: toolTokens.length === 0
        ? group.tools
        : group.tools.filter(tool => matchKeyword(toolTokens, [tool.name, tool.description, group.label])),
    }))
    .filter(entry => entry.shown.length > 0)
  const searchingTools = toolTokens.length > 0
  // The card's own select-all and clear follow the same rule as a group's: they
  // act on the tools the keyword leaves on screen, so one keyword never turns a
  // click into a whole-catalogue write the reader did not ask for.
  const shownToolChoices = filteredToolGroups.flatMap(entry => entry.shown)
  /** Whether this page may grant the tool at all; a member cannot grant captain-only. */
  const grantable = (tool: ToolChoice): boolean => !(props.role === 'member' && tool.captainOnly === true)
  const modeOptions: PickerChoice[] = [
    { id: 'all', label: t('toolsDefault') },
    { id: 'custom', label: t('toolsCustom') },
  ]
  // A captain leads on the model its Session already selected, so only a
  // member renders the route pickers.
  const route = props.role === 'member' && hasMemberRoute(agent) ? agent : undefined
  const provider = route === undefined ? undefined : props.providers.find(entry => entry.id === route.provider)
  const models = provider?.models ?? []
  const model = route === undefined ? undefined : models.find(entry => entry.id === route.model)

  const providerOptions: PickerChoice[] = [
    { id: '', label: t('routeInherit') },
    ...props.providers.map(entry => ({ id: entry.id, label: entry.name })),
  ]
  const modelOptions: PickerChoice[] = [
    { id: '', label: t('routeInherit') },
    ...models.map(entry => ({ id: entry.id, label: entry.name })),
  ]
  const effortOptions: PickerChoice[] = [
    { id: '', label: t('effortDefault') },
    ...(model?.efforts ?? []).map(effort => ({ id: effort.id, label: effort.name })),
  ]

  return (
    <>
      <header className={css.pageHead}>
        <button type="button" className={css.crumb} onClick={props.onBack}>
          <span aria-hidden>‹</span> {props.teamName === '' ? t('back') : props.teamName}
        </button>
        <h2 className={css.title}>
          {props.role === 'captain' ? t('roleCaptain') : t('roleMember')}
          {agent.name.trim() === '' ? '' : ` · ${agent.name.trim()}`}
        </h2>
      </header>

      {props.role === 'captain' ? <p className={css.intro}>{t('captainHint')}</p> : null}

      <section className={css.card}>
        <span className={css.cardTitle}>{t('identitySection')}</span>
        <div className={css.field}>
          <span className={css.fieldLabel}>{t('agentName')}</span>
          <Input
            className={css.input ?? ''}
            value={agent.name}
            placeholder={t('agentNamePlaceholder')}
            disabled={disabled}
            onChange={(event) => { props.onChange({ name: event.target.value }) }}
          />
        </div>
        <div className={css.field}>
          <span className={css.fieldLabel}>{t('agentColor')}</span>
          <span className={css.swatches}>
            <button
              type="button"
              className={css.swatchNone}
              aria-label={t('effortDefault')}
              aria-pressed={agent.color === NO_COLOR}
              disabled={disabled}
              onClick={() => { props.onChange({ color: NO_COLOR }) }}
            />
            {AGENT_COLORS.map(color => (
              <button
                key={color}
                type="button"
                className={css.swatch}
                style={{ background: color }}
                aria-label={color}
                aria-pressed={agent.color === color}
                disabled={disabled}
                onClick={() => { props.onChange({ color }) }}
              />
            ))}
          </span>
        </div>
        <div className={css.field}>
          <span className={css.fieldLabel}>{t('agentDescription')}</span>
          <textarea
            className={css.prompt}
            rows={3}
            value={agent.description}
            disabled={disabled}
            onChange={(event) => { props.onChange({ description: event.target.value }) }}
          />
        </div>
      </section>

      <section className={css.card}>
        <span className={css.cardTitle}>{t('modelSection')}</span>
        {route === undefined ? (
          <span className={css.hint}>{t('captainModelHint')}</span>
        ) : (
          <>
            <FieldPicker
              label={t('provider')}
              value={route.provider}
              options={providerOptions}
              disabled={disabled}
              onChange={(id) => { props.onChange({ provider: id, model: id === '' ? '' : route.model, reasoningEffort: '' }) }}
            />
            <FieldPicker
              label={t('model')}
              value={route.model}
              options={modelOptions}
              disabled={disabled || route.provider === ''}
              onChange={(id) => { props.onChange({ model: id, reasoningEffort: '' }) }}
            />
            <FieldPicker
              label={t('effort')}
              value={route.reasoningEffort}
              options={effortOptions}
              disabled={disabled || route.model === ''}
              onChange={(id) => { props.onChange({ reasoningEffort: id }) }}
            />
          </>
        )}
        {props.catalogueFailed ? <span className={css.warn} role="status">{t('modelsFailed')}</span> : null}
        {props.cataloguePartial ? <span className={css.warn} role="status">{t('modelsPartial')}</span> : null}
      </section>

      <section className={css.card}>
        <span className={css.cardTitle}>{t('toolsSection')}</span>
        <FieldPicker
          label={t('toolMode')}
          value={mode}
          options={modeOptions}
          disabled={disabled}
          onChange={(id) => { props.onChange({ toolMode: id === 'custom' ? 'custom' : 'all' }) }}
        />
        {customTools ? (
          <>
            <div className={css.cardHead}>
              <span className={css.fieldLabel}>{t('tools')}</span>
              <span className={css.rowActions}>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={disabled || !toolsReady || shownToolChoices.length === 0}
                  onClick={() => {
                    // A member can never exercise a captain-only capability, so
                    // select-all must not persist one into its allow-list.
                    const inside = new Set(shownToolChoices.map(tool => tool.name))
                    props.onChange({
                      tools: [
                        ...agent.tools.filter(name => !inside.has(name)),
                        ...shownToolChoices.filter(grantable).map(tool => tool.name),
                      ],
                    })
                  }}
                >
                  {t('toolsSelectAll')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={disabled || !toolsReady || !shownToolChoices.some(tool => agent.tools.includes(tool.name) && grantable(tool))}
                  onClick={() => {
                    const inside = new Set(shownToolChoices.map(tool => tool.name))
                    // Every tool the keyword hides keeps the state it had, and so
                    // does a captain-only name a member already holds: clearing
                    // it would put it out of reach for good.
                    props.onChange({
                      tools: agent.tools.filter(name => !inside.has(name)
                        || shownToolChoices.some(tool => tool.name === name && !grantable(tool))),
                    })
                  }}
                >
                  {t('toolsClear')}
                </Button>
              </span>
            </div>
            <div className={css.field}>
              <input
                className={css.search}
                type="search"
                value={toolQuery}
                placeholder={t('toolsSearch')}
                aria-label={t('toolsSearch')}
                disabled={disabled || !toolsReady}
                onChange={(event) => { setToolQuery(event.target.value) }}
              />
            </div>
            {filteredToolGroups.map(entry => {
              const { group, shown } = entry
              // A keyword keeps every surviving group open, so the matches it
              // just found are on screen rather than folded away.
              const expanded = searchingTools || expandedGroups.includes(group.key)
              const shownNames = new Set(shown.map(tool => tool.name))
              const chosenInGroup = group.tools.filter(tool => agent.tools.includes(tool.name)).length
              const chosenInShown = shown.filter(tool => agent.tools.includes(tool.name)).length
              // Rewrite only this group's slice of the allow-list, so another
              // group's selection and a stored name this catalogue cannot
              // describe both survive untouched.
              const inside = new Set(group.tools.map(tool => tool.name))
              const outside = agent.tools.filter(name => !inside.has(name))
              // A group action acts on what the group SHOWS: with a keyword on,
              // the reader asked to change the tools in front of them, and a
              // hidden match is not one of them. Every tool the keyword hid or
              // the reader cannot grant keeps exactly the state it already had.
              const hiddenSelected = group.tools
                .filter(tool => !shownNames.has(tool.name) && agent.tools.includes(tool.name))
                .map(tool => tool.name)
              const shownGrantable = shown.filter(grantable)
              // A captain-only tool a member already holds cannot be re-selected
              // once cleared, so every action below carries it through untouched.
              const shownRetained = shown
                .filter(tool => agent.tools.includes(tool.name) && !grantable(tool))
                .map(tool => tool.name)
              const clearableInShown = shown
                .filter(tool => agent.tools.includes(tool.name) && grantable(tool)).length
              const keepOutside = (names: readonly string[]): string[] => [...outside, ...hiddenSelected, ...names, ...shownRetained]
              return (
                <div key={group.key} className={css.toolGroup}>
                  <div className={css.toolGroupHead}>
                    <button
                      type="button"
                      className={css.toolGroupToggle}
                      aria-expanded={expanded}
                      onClick={() => {
                        setExpandedGroups(current => current.includes(group.key)
                          ? current.filter(entry => entry !== group.key)
                          : [...current, group.key])
                      }}
                    >
                      <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
                      <span className={css.fieldLabel}>{group.label}</span>
                      <span className={css.toolGroupCount}>
                        {searchingTools
                          ? `${String(chosenInShown)}/${String(shown.length)}`
                          : `${String(chosenInGroup)}/${String(group.tools.length)}`}
                      </span>
                    </button>
                    <span className={css.rowActions}>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={disabled || !toolsReady}
                        onClick={() => {
                          props.onChange({ tools: keepOutside(shownGrantable.map(tool => tool.name)) })
                        }}
                      >
                        {t('toolsSelectAll')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={disabled || !toolsReady}
                        onClick={() => {
                          const flipped = shownGrantable
                            .filter(tool => !agent.tools.includes(tool.name))
                            .map(tool => tool.name)
                          props.onChange({ tools: keepOutside(flipped) })
                        }}
                      >
                        {t('toolsInvert')}
                      </Button>
                      {/* Clear drops every clearable tool the group shows and keeps the
                          captain-only selections a member already holds: those are not
                          grantable, so a cleared name could never be chosen again. */}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={disabled || clearableInShown === 0}
                        onClick={() => { props.onChange({ tools: keepOutside([]) }) }}
                      >
                        {t('toolsClear')}
                      </Button>
                    </span>
                  </div>
                  {expanded ? (
                    <div className={css.toolGrid} role="group" aria-label={group.label}>
                      {shown.map(tool => {
                        // The Team service enforces captain-only for these, and
                        // the preset tools exist on the Session root scope alone,
                        // so a member cannot use them however the list is edited.
                        // A name already stored stays visible and removable.
                        const restricted = !grantable(tool)
                        const selected = agent.tools.includes(tool.name)
                        return (
                          <Checkbox
                            key={tool.name}
                            className={css.toolCheckbox}
                            label={tool.name}
                            title={restricted ? `${tool.description} ${t('toolsCaptainOnly')}` : tool.description}
                            checked={selected}
                            disabled={disabled || (restricted && !selected) || (!toolsReady && !selected)}
                            onChange={(checked) => {
                              props.onChange({
                                tools: checked ? [...agent.tools, tool.name] : agent.tools.filter(name => name !== tool.name),
                              })
                            }}
                          />
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              )
            })}
            {searchingTools && filteredToolGroups.length === 0 ? (
              // Only the keyword can empty this: an empty tool catalogue is stated
              // by its own hint below, not by a "no match" the reader cannot act on.
              <span className={css.hint} role="status">{t('toolsSearchEmpty')}</span>
            ) : null}
            {searchingTools && filteredToolGroups.length > 0 ? <span className={css.hint}>{t('toolsSearchHint')}</span> : null}
            {props.toolCatalogue === 'loading' || props.toolCatalogue === 'idle' ? (
              <span className={css.hint} role="status">{t('toolsLoading')}</span>
            ) : props.toolCatalogue === 'error' ? (
              <span className={css.warn} role="status">{t('toolsFailed')}</span>
            ) : props.tools.length === 0 ? (
              <span className={css.hint}>{t('toolsNoCatalog')}</span>
            ) : null}
            <span className={agent.tools.length === 0 ? css.warn : css.hint}>
              {agent.tools.length === 0 ? t('toolsEmpty') : t('toolsHint')}
            </span>
            {unavailable.length === 0 ? null : (
              <div className={css.field}>
                <span className={css.warn}>{t('toolsUnavailable')}</span>
                <ul className={css.plainRows}>
                  {unavailable.map(name => (
                    <li key={name} className={css.entry}>
                      <span className={css.rowName}>{name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={disabled}
                        onClick={() => { props.onChange({ tools: agent.tools.filter(entry => entry !== name) }) }}
                      >
                        {t('toolsRemove')}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : <span className={css.hint}>{t('toolsAllHint')}</span>}
        <span className={css.hint}>{t('toolsScoped')}</span>
      </section>

      <section className={css.card}>
        <span className={css.cardTitle}>{t('promptSection')}</span>
        <div className={css.field}>
          <textarea
            className={css.prompt}
            rows={8}
            value={agent.systemPrompt}
            placeholder={t('systemPromptPlaceholder')}
            disabled={disabled}
            onChange={(event) => { props.onChange({ systemPrompt: event.target.value }) }}
          />
          <span className={agent.systemPrompt.includes('{{') ? css.warn : css.hint}>
            {agent.systemPrompt.includes('{{') ? t('promptWarnBraces') : t('systemPromptHint')}
          </span>
        </div>
      </section>

      {props.skills === undefined ? null : (
        <SkillAssignmentGrid controller={props.skills} teamId={props.teamId} roleId={props.roleId} t={props.t} />
      )}

      {props.onDelete === undefined ? null : (
        <div className={css.actionRow}>
          <Button size="sm" variant="ghost" disabled={disabled} onClick={props.onDelete}>{t('deleteAgent')}</Button>
        </div>
      )}
    </>
  )
}
