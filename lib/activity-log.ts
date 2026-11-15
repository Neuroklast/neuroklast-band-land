/**
 * Optional personal UI history, stored in this browser only. NOT a security,
 * compliance, licensing or server-side administrative audit log. Entries can
 * be modified, lost or cleared by the browser user. Do not rely on this module
 * for durable evidence of privileged actions. It only provides a local timeline
 * (up to 200 entries) for convenience.
 */

export type ActivityLogAction =
  | 'theme-change'
  | 'config-change'
  | 'login-attempt'
  | 'login-success'
  | 'login-failure'
  | 'logout'
  | 'section-toggle'
  | 'widget-install'
  | 'widget-uninstall'
  | 'widget-toggle'
  | 'password-change'
  | 'setup-reset'
  | 'export-config'
  | 'import-config'

export interface ActivityLogEntry {
  id: string
  action: ActivityLogAction
  /** Human-readable summary of what changed */
  detail: string
  timestamp: string
  /** Optional extra metadata (e.g. theme id, widget id) */
  meta?: Record<string, unknown>
}

const STORAGE_KEY = 'kv:activity-log'
const MAX_ENTRIES = 200

/** Read all stored log entries (newest first). */
export function getActivityLog(): ActivityLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ActivityLogEntry[]
  } catch {
    return []
  }
}

/** Append a new log entry.  Oldest entries are dropped when limit is reached. */
export function logActivity(
  action: ActivityLogAction,
  detail: string,
  meta?: Record<string, unknown>,
): void {
  try {
    const existing = getActivityLog()
    const entry: ActivityLogEntry = {
      id: crypto.randomUUID(),
      action,
      detail,
      timestamp: new Date().toISOString(),
      meta,
    }
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Storage not available — silently ignore
  }
}

/** Clear all stored log entries. */
export function clearActivityLog(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/** Action display metadata used by the UI. */
export const ACTION_LABELS: Record<ActivityLogAction, string> = {
  'theme-change': 'Theme Changed',
  'config-change': 'Config Changed',
  'login-attempt': 'Login Attempt',
  'login-success': 'Login Success',
  'login-failure': 'Login Failure',
  'logout': 'Logout',
  'section-toggle': 'Section Toggled',
  'widget-install': 'Widget Installed',
  'widget-uninstall': 'Widget Uninstalled',
  'widget-toggle': 'Widget Toggled',
  'password-change': 'Password Changed',
  'setup-reset': 'Setup Reset',
  'export-config': 'Config Exported',
  'import-config': 'Config Imported',
}
