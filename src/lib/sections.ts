/**
 * Section registry and utility functions for enabling/disabling and reordering
 * site sections.
 *
 * Related issue: #159
 */

import type { SectionConfig } from './types'
import { DEFAULT_SECTION_ORDER } from './site-config'

// ─── Registry of all known section IDs ───────────────────────────────────────

export const ALL_SECTION_IDS: readonly string[] = DEFAULT_SECTION_ORDER

// ─── Default factory ─────────────────────────────────────────────────────────

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

// ─── Normalisation helper ─────────────────────────────────────────────────────

/**
 * Merge a user-supplied `SectionConfig[]` with the full registry, so that any
 * section not explicitly configured gets sensible defaults (enabled, appended
 * at the end in registry order).
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

// ─── Utility functions ────────────────────────────────────────────────────────

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
 * This is the format expected by `sectionOrder` in `SiteConfig`.
 */
export function getEnabledSectionIds(configs: SectionConfig[]): string[] {
  return getEnabledSections(configs).map((s) => s.id)
}

/**
 * Toggle the `enabled` state of a single section.
 * Returns a new array – does not mutate the input.
 */
export function toggleSection(configs: SectionConfig[], id: string): SectionConfig[] {
  const normalized = normalizeSections(configs)
  return normalized.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
}

/**
 * Move a section to a new `order` index and shift other sections to
 * accommodate.  Returns a new array sorted by the updated `order` values.
 *
 * @param configs  Current section config array.
 * @param id       ID of the section to move.
 * @param newOrder Target zero-based order index.
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
