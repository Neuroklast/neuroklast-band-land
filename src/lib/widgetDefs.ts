/**
 * widgetDefs.ts — Canonical, type-rich widget definitions.
 *
 * This module re-exports the WIDGET_CATALOG as structured `WidgetDef` objects
 * that carry extra metadata used by `WidgetSlot` to decide where and how to
 * render each widget.
 *
 * Add entries here whenever you introduce a new widget so that the slot
 * renderer can pick up the correct default layout position and config schema
 * without needing changes to WidgetRenderer itself.
 */

import type { WidgetCategory, WidgetLayoutPosition } from './types'
import { WIDGET_CATALOG } from './widget-plugins'

// ─── WidgetDef ───────────────────────────────────────────────────────────────

/**
 * A single widget definition including layout hints used by `WidgetSlot`.
 */
export interface WidgetDef {
  /** Unique widget identifier – must match the catalog entry */
  id: string
  /** Widget category */
  category: WidgetCategory
  /**
   * Default layout position when the user has not overridden it.
   * - `'main'`       — inside the main content flow (default)
   * - `'sidebar'`    — rendered in a sidebar column
   * - `'footer'`     — rendered in the footer area
   * - `'hero-below'` — immediately below the hero section
   */
  defaultPosition: WidgetLayoutPosition
}

// ─── Layout position hints ────────────────────────────────────────────────────

/**
 * Override the default layout position for specific widget IDs.
 * Any widget ID not listed here falls back to `'main'`.
 */
const POSITION_OVERRIDES: Partial<Record<string, WidgetLayoutPosition>> = {
  'newsletter': 'footer',
  'discord-widget': 'sidebar',
  'patreon-widget': 'sidebar',
}

// ─── Build the definitions list ───────────────────────────────────────────────

/**
 * Full list of widget definitions, derived from the catalog and enriched with
 * layout hints from `POSITION_OVERRIDES`.
 */
export const WIDGET_DEFS: readonly WidgetDef[] = WIDGET_CATALOG.map((entry) => ({
  id: entry.id,
  category: entry.category,
  defaultPosition: POSITION_OVERRIDES[entry.id] ?? 'main',
}))

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/**
 * Return the `WidgetDef` for a given widget ID, or `undefined` if not found.
 */
export function getWidgetDef(id: string): WidgetDef | undefined {
  return WIDGET_DEFS.find((d) => d.id === id)
}

/**
 * Return the effective layout position for an installed widget.
 *
 * Priority order:
 *  1. The widget's own `layoutPosition` field (set by the user in settings)
 *  2. The `defaultPosition` from `WidgetDef`
 *  3. `'main'` as the final fallback
 */
export function resolveLayoutPosition(
  widgetId: string,
  overridePosition?: WidgetLayoutPosition,
): WidgetLayoutPosition {
  if (overridePosition) return overridePosition
  return getWidgetDef(widgetId)?.defaultPosition ?? 'main'
}
