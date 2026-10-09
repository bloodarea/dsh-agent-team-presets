/**
 * Third Team preset page: one captain or member, split into identity, model,
 * tools, and system prompt cards so a narrow Settings panel never crowds.
 */

import { Button, Checkbox, Input } from '@deepseek-ai/dsh-client-ui-primitives'
import { AGENT_COLORS } from './team-presets-controller.ts'
import type { ProviderChoice } from './team-presets-controller.ts'
import { FieldPicker } from './FieldPicker.tsx'
import type { PickerChoice } from './FieldPicker.tsx'
import { toolMode } from '../presets.ts'
import type { TeamAgentPreset, TeamCaptainPreset, ToolChoice } from '../types.ts'
import type { TeamPresetsLocaleKey } from './locales.ts'
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
  /** Page copy reader. */
  readonly t: (key: TeamPresetsLocaleKey) => string
  /** Whether the Host document accepts writes. */
  readonly disabled: boolean
  readonly onBack: () => void
  readonly onChange: (patch: Partial<TeamAgentPreset>) => void
  /** Removes this member; absent for the captain, which a Team always needs. */
  readonly onDelete?: () => void
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
  const unavailable = toolsReady ? agent.tools.filter(name => !props.tools.some(tool => tool.name === name)) : []
  const toolChoices = props.tools.length === 0
    ? agent.tools.map(name => ({ name, description: '' }))
    : props.tools
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
          <Input
            className={css.input ?? ''}
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
                  disabled={disabled || !toolsReady || props.tools.length === 0}
                  onClick={() => { props.onChange({ tools: props.tools.map(tool => tool.name) }) }}
                >
                  {t('toolsSelectAll')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={disabled || agent.tools.length === 0}
                  onClick={() => { props.onChange({ tools: [] }) }}
                >
                  {t('toolsClear')}
                </Button>
              </span>
            </div>
            <div className={css.toolGrid} role="group" aria-label={t('tools')}>
              {toolChoices.map(tool => (
                <Checkbox
                  key={tool.name}
                  className={css.toolCheckbox}
                  label={tool.name}
                  title={tool.description}
                  checked={agent.tools.includes(tool.name)}
                  disabled={disabled || (!toolsReady && !agent.tools.includes(tool.name))}
                  onChange={(checked) => {
                    props.onChange({
                      tools: checked ? [...agent.tools, tool.name] : agent.tools.filter(name => name !== tool.name),
                    })
                  }}
                />
              ))}
            </div>
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

      {props.onDelete === undefined ? null : (
        <div className={css.actionRow}>
          <Button size="sm" variant="ghost" disabled={disabled} onClick={props.onDelete}>{t('deleteAgent')}</Button>
        </div>
      )}
    </>
  )
}
