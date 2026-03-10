/**
 * Theme Package Validator
 *
 * Runtime validation for ThemePackage objects.
 *
 * Called automatically by `registerTheme()` in every non-production
 * environment so that broken or incomplete themes fail loudly during
 * development and CI — not silently at runtime in production.
 *
 * Rules enforced:
 *   ERROR   1. Required metadata fields present and non-empty
 *   ERROR   2. `id` is valid kebab-case
 *   WARNING 3. `version` follows semver (X.Y.Z)
 *   ERROR   4. `access` is a recognised value
 *   ERROR   5. Exclusive themes must declare `exclusiveFor`
 *   ERROR   6. `layout` object is complete
 *   ERROR   7. `typography` fields are non-empty
 *   ERROR   8. `customizability` has all three boolean fields
 *   WARNING 9. Theme should override at least one recommended slot
 */

import type { ThemePackage } from './types'
import { RECOMMENDED_THEME_SLOTS } from './component-contracts'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ThemeValidationError {
  /** The field path that caused the issue (e.g. "layout.heroVariant"). */
  field: string
  /** 'error' = must fix; 'warning' = should fix. */
  severity: 'error' | 'warning'
  /** Human-readable explanation. */
  message: string
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SEMVER_RE = /^\d+\.\d+\.\d+/
const KEBAB_RE = /^[a-z][a-z0-9-]*[a-z0-9]$/
const VALID_ACCESS = new Set(['free', 'premium', 'exclusive'])
const VALID_HERO_VARIANTS = new Set(['glitch-parallax', 'chromatic-hover', 'minimal', 'default'])
const VALID_LOADING_SCREENS = new Set(['3d-model', 'code-rain', 'cyberpunk', 'minimal'])

// ─── Validator ─────────────────────────────────────────────────────────────────

/**
 * Validates a ThemePackage and returns all issues found.
 * Returns an empty array if the theme is fully compliant.
 */
export function validateThemePackage(theme: ThemePackage): ThemeValidationError[] {
  const errors: ThemeValidationError[] = []

  const err = (field: string, message: string) =>
    errors.push({ field, severity: 'error', message })

  const warn = (field: string, message: string) =>
    errors.push({ field, severity: 'warning', message })

  // ── 1. Required metadata ──────────────────────────────────────────────────
  if (!theme.id?.trim())          err('id',          'Theme must have a non-empty id')
  if (!theme.name?.trim())        err('name',        'Theme must have a non-empty name')
  if (!theme.description?.trim()) err('description', 'Theme must have a non-empty description')
  if (!theme.author?.trim())      err('author',      'Theme must have a non-empty author')
  if (!theme.version?.trim())     err('version',     'Theme must have a non-empty version')

  // ── 2. ID format ──────────────────────────────────────────────────────────
  if (theme.id && !KEBAB_RE.test(theme.id)) {
    err('id', `Theme id "${theme.id}" must be kebab-case (lowercase letters, digits, hyphens) e.g. "my-theme"`)
  }

  // ── 3. Version format ─────────────────────────────────────────────────────
  if (theme.version && !SEMVER_RE.test(theme.version)) {
    warn('version', `Theme version "${theme.version}" should follow semver format (X.Y.Z)`)
  }

  // ── 4. Access control ─────────────────────────────────────────────────────
  if (!VALID_ACCESS.has(theme.access)) {
    err('access', `theme.access must be "free", "premium", or "exclusive" — got "${theme.access}"`)
  }

  // ── 5. Exclusive themes need exclusiveFor ─────────────────────────────────
  if (theme.access === 'exclusive' && !theme.exclusiveFor?.trim()) {
    err('exclusiveFor', 'Exclusive themes must declare exclusiveFor (the brand/license holder name)')
  }

  // ── 6. Layout ─────────────────────────────────────────────────────────────
  if (!theme.layout) {
    err('layout', 'Theme must define a layout object')
  } else {
    if (!theme.layout.heroVariant) {
      err('layout.heroVariant', 'layout.heroVariant is required')
    } else if (!VALID_HERO_VARIANTS.has(theme.layout.heroVariant)) {
      err('layout.heroVariant', `layout.heroVariant "${theme.layout.heroVariant}" is not a recognised value`)
    }
    if (!theme.layout.loadingScreen) {
      err('layout.loadingScreen', 'layout.loadingScreen is required')
    } else if (!VALID_LOADING_SCREENS.has(theme.layout.loadingScreen)) {
      err('layout.loadingScreen', `layout.loadingScreen "${theme.layout.loadingScreen}" is not a recognised value`)
    }
  }

  // ── 7. Typography ─────────────────────────────────────────────────────────
  if (!theme.typography) {
    err('typography', 'Theme must define a typography object')
  } else {
    if (!theme.typography.heading?.trim()) err('typography.heading', 'typography.heading must be a non-empty font stack')
    if (!theme.typography.body?.trim())    err('typography.body',    'typography.body must be a non-empty font stack')
    if (!theme.typography.mono?.trim())    err('typography.mono',    'typography.mono must be a non-empty font stack')
  }

  // ── 8. Customizability ────────────────────────────────────────────────────
  if (!theme.customizability) {
    err('customizability', 'Theme must define a customizability object')
  } else {
    const keys = ['customColors', 'customFonts', 'adjustEffects'] as const
    for (const key of keys) {
      if (typeof theme.customizability[key] !== 'boolean') {
        err(`customizability.${key}`, `customizability.${key} must be a boolean`)
      }
    }
  }

  // ── 9. Slot recommendations ───────────────────────────────────────────────
  if (!theme.slots || Object.keys(theme.slots).length === 0) {
    warn(
      'slots',
      'Theme defines no slot overrides — it will render identically to the default theme. ' +
      `Consider overriding at least one of: ${RECOMMENDED_THEME_SLOTS.join(', ')}`,
    )
  } else {
    const provided = new Set(Object.keys(theme.slots))
    const missing = RECOMMENDED_THEME_SLOTS.filter(s => !provided.has(s))
    if (missing.length === RECOMMENDED_THEME_SLOTS.length) {
      warn(
        'slots',
        `Theme overrides none of the recommended identity slots (${RECOMMENDED_THEME_SLOTS.join(', ')}). ` +
        'Users may not notice a visual difference from the default theme.',
      )
    }
  }

  return errors
}

/**
 * Asserts that a theme has no validation ERRORS (warnings are allowed).
 * Throws a descriptive error on failure.
 *
 * Used by `registerTheme()` in development and test environments to fail fast.
 */
export function assertThemeValid(theme: ThemePackage): void {
  const results = validateThemePackage(theme)
  const fatal = results.filter(e => e.severity === 'error')
  if (fatal.length === 0) return

  const lines = fatal.map(e => `  [${e.field}] ${e.message}`)
  throw new Error(
    `ThemePackage "${theme.id ?? '(no id)'}" failed validation with ${fatal.length} error(s):\n` +
    lines.join('\n') + '\n' +
    'Fix these before registering the theme.',
  )
}
