/**
 * Section registry and utility functions for enabling/disabling and reordering
 * site sections.
 *
 * Public API (re-exported from this module):
 *  - `ALL_SECTION_IDS`       — registry of all known section IDs
 *  - `buildDefaultSections`  — build a fresh default SectionConfig[]
 *  - `normalizeSections`     — merge user config with the full registry
 *  - `migrateSectionOrder`   — convert legacy sectionOrder[] to SectionConfig[]
 *  - `resolveSections`       — pick the right config source with fallback chain
 *  - `getEnabledSections`    — filter + sort by order
 *  - `getEnabledSectionIds`  — same as above but returns only the IDs
 *  - `toggleSection`         — flip a section's enabled state immutably
 *  - `reorderSections`       — move a section to a new index immutably
 *
 * Related issue: #159
 */

import type { SectionConfig } from './types'

// ─── Registry ─────────────────────────────────────────────────────────────────

/** All recognised section IDs, in default display order. */
export const ALL_SECTION_IDS: readonly string[] = [
  'news', 'biography', 'gallery', 'gigs', 'releases', 'media', 'social', 'partners', 'contact'
]

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Build the default `SectionConfig[]` where every known section is enabled
 * and ordered according to `DEFAULT_SECTION_ORDER`.
 */
export function buildDefaultSections(): SectionConfig[] {
  return ALL_SECTION_IDS.map((id, index) => ({
    id,
    enabled: true,
    order: index,
  }))
}

/**
 * Merge a user-supplied `SectionConfig[]` with the full registry so that any
 * section not explicitly configured receives sensible defaults (enabled,
 * appended at the end in registry order).
 *
 * The returned array is always sorted by `order` ascending.
 */
export function normalizeSections(configs: SectionConfig[]): SectionConfig[] {
  const configMap = new Map(configs.map((c) => [c.id, c]))
  const maxOrder = configs.reduce((max, c) => Math.max(max, c.order), -1)
  let nextOrder = maxOrder + 1

  for (const id of ALL_SECTION_IDS) {
    if (!configMap.has(id)) {
      configMap.set(id, { id, enabled: true, order: nextOrder++ })
    }
  }

  return Array.from(configMap.values()).sort((a, b) => a.order - b.order)
}

/**
 * Resolve the active section configuration from a partial `SiteConfig`.
 *
 * Resolution priority:
 * 1. Use `sections` if present and non-empty.
 * 2. If neither is present, return `buildDefaultSections()`.
 */
export function resolveSections(config: {
  sections?: SectionConfig[]
}): SectionConfig[] {
  if (config.sections && config.sections.length > 0) {
    return normalizeSections(config.sections)
  }
  return buildDefaultSections()
}

// ─── Query helpers ────────────────────────────────────────────────────────────

/**
 * Return only the enabled sections, sorted by their `order` value.
 */
export function getEnabledSections(configs: SectionConfig[]): SectionConfig[] {
  return normalizeSections(configs)
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)
}

/**
 * Return the IDs of all enabled sections in display order.
 */
export function getEnabledSectionIds(configs: SectionConfig[]): string[] {
  return getEnabledSections(configs).map((s) => s.id)
}

// ─── Mutation helpers (immutable — always return new arrays) ──────────────────

/**
 * Toggle the `enabled` state of a single section.
 * Returns a new array; does not mutate the input.
 */
export function toggleSection(configs: SectionConfig[], id: string): SectionConfig[] {
  const normalized = normalizeSections(configs)
  return normalized.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
}

/**
 * Move a section to a new `order` index and shift the remaining sections to
 * accommodate.  Returns a new array sorted by the updated `order` values.
 *
 * @param configs   Current section config array.
 * @param id        ID of the section to move.
 * @param newOrder  Target zero-based order index.
 */
export function reorderSections(
  configs: SectionConfig[],
  id: string,
  newOrder: number,
): SectionConfig[] {
  const normalized = normalizeSections(configs)
  const sorted = [...normalized].sort((a, b) => a.order - b.order)

  const fromIndex = sorted.findIndex((s) => s.id === id)
  if (fromIndex === -1) return normalized

  const toIndex = Math.max(0, Math.min(newOrder, sorted.length - 1))
  if (fromIndex === toIndex) return normalized

  // Re-splice and reassign sequential order values
  const [moved] = sorted.splice(fromIndex, 1)
  sorted.splice(toIndex, 0, moved)

  return sorted.map((s, i) => ({ ...s, order: i }))
}
