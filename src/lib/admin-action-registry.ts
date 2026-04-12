/**
 * Admin Action Registry — Strict Tool Calling for the Admin Panel.
 *
 * Every write operation initiated from the admin UI MUST go through a
 * registered AdminAction. This ensures:
 *  - Type safety: every action has a typed input schema
 *  - Auditability: the registry is the canonical list of possible mutations
 *  - IoC: callers dispatch by action ID, not by calling functions directly
 *
 * @see ADR-004 in .github/ARCHITECTURE.md
 */

import type { SiteConfig } from './types'

// ─── Action definition ─────────────────────────────────────────────────────────

/**
 * A single admin action definition.
 * @template TInput  The validated input type for this action.
 * @template TOutput The type returned after the action executes (defaults to void).
 */
export interface AdminAction<TInput = unknown, TOutput = void> {
  /** Unique action identifier (slug, lowercase-hyphen) */
  id: string
  /** Human-readable description of what the action does */
  description: string
  /**
   * Validates and parses the raw input.
   * Should throw (or return null) if the input is invalid.
   */
  validate: (input: unknown) => TInput
  /**
   * Executes the action with the validated input.
   * Receives the current SiteConfig and returns the updated config (or void for side effects).
   */
  execute: (input: TInput, config: SiteConfig) => TOutput
}

// ─── Registry ─────────────────────────────────────────────────────────────────

/** Internal registry map keyed by action ID */
const _registry = new Map<string, AdminAction<unknown, unknown>>()

/**
 * Register an admin action.
 * Throws if an action with the same ID is already registered
 * (prevents silent overwrites from lazy imports).
 */
export function registerAdminAction<TInput, TOutput>(
  action: AdminAction<TInput, TOutput>,
): void {
  if (_registry.has(action.id)) {
    throw new Error(
      `AdminActionRegistry: duplicate action ID "${action.id}". ` +
      `Each action must have a unique ID.`,
    )
  }
  _registry.set(action.id, action as AdminAction<unknown, unknown>)
}

/**
 * Execute a registered admin action by ID.
 *
 * @throws If the action ID is not registered.
 * @throws If input validation fails.
 */
export function executeAdminAction(
  id: string,
  input: unknown,
  config: SiteConfig,
): unknown {
  const action = _registry.get(id)
  if (!action) {
    throw new Error(
      `AdminActionRegistry: unknown action "${id}". ` +
      `Available actions: ${[..._registry.keys()].join(', ')}`,
    )
  }
  const validated = action.validate(input)
  return action.execute(validated, config)
}

/**
 * Return all registered action IDs (useful for diagnostics and tests).
 */
export function getRegisteredActionIds(): readonly string[] {
  return [..._registry.keys()]
}

/**
 * Return the definition for a registered action, or undefined if not found.
 */
export function getAdminAction(id: string): AdminAction<unknown, unknown> | undefined {
  return _registry.get(id)
}

/**
 * Clear all registered actions.
 * ONLY intended for use in unit tests.
 */
export function _clearAdminActionRegistryForTesting(): void {
  _registry.clear()
}

// ─── Built-in core actions ─────────────────────────────────────────────────────

/**
 * Input for the 'update-site-name' action.
 */
export interface UpdateSiteNameInput {
  siteName: string
}

function validateUpdateSiteName(input: unknown): UpdateSiteNameInput {
  const obj = input as Record<string, unknown>
  if (
    typeof input !== 'object' ||
    input === null ||
    typeof obj.siteName !== 'string' ||
    obj.siteName === ''
  ) {
    throw new Error('update-site-name: siteName must be a non-empty string')
  }
  return { siteName: obj.siteName }
}

registerAdminAction<UpdateSiteNameInput, Partial<SiteConfig>>({
  id: 'update-site-name',
  description: 'Update the band / artist display name',
  validate: validateUpdateSiteName,
  execute: (input) => ({ siteName: input.siteName }),
})

/**
 * Input for the 'toggle-feature' action.
 */
export interface ToggleFeatureInput {
  feature: keyof NonNullable<SiteConfig['features']>
  enabled: boolean
}

function validateToggleFeature(input: unknown): ToggleFeatureInput {
  const i = input as Record<string, unknown>
  if (typeof i?.feature !== 'string' || typeof i?.enabled !== 'boolean') {
    throw new Error('toggle-feature: requires { feature: string, enabled: boolean }')
  }
  return { feature: i.feature as keyof NonNullable<SiteConfig['features']>, enabled: i.enabled }
}

registerAdminAction<ToggleFeatureInput, Partial<SiteConfig>>({
  id: 'toggle-feature',
  description: 'Enable or disable a site feature flag',
  validate: validateToggleFeature,
  execute: (input, config) => ({
    features: { ...config.features, [input.feature]: input.enabled },
  }),
})
