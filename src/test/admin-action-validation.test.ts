import { describe, expect, it } from 'vitest'
import {
  ADMIN_ACTION_REGISTRY,
  dispatchAdminAction,
  validateAdminAction,
  type AdminActionContext,
} from '@/lib/admin-action-registry'
import { validateAdminActionAsAdmin } from '@/app/admin/_actions/context'

describe('server command registry contracts', () => {
  it('does not expose no-op success executors for any server command', () => {
    const serverActions = Object.values(ADMIN_ACTION_REGISTRY).filter(item => item.execution === 'server')
    expect(serverActions.length).toBeGreaterThan(40)
    expect(serverActions.every(action => action.execute === undefined)).toBe(true)
  })

  it('validates allowed server input without representing the action as executed', () => {
    expect(validateAdminActionAsAdmin('purge_gigs', {})).toEqual({ ok: true })
    expect(validateAdminActionAsAdmin('purge_releases', { scope: 'all' })).toEqual({ ok: true })
    expect(validateAdminActionAsAdmin('purge_releases', { scope: 'partial' }).ok).toBe(false)
  })

  it('refuses execution of server-only actions in the legacy local dispatcher', () => {
    const result = dispatchAdminAction('purge_gigs', {}, {} as AdminActionContext, 'expert')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/dedicated authorized server action/)
  })

  it('preserves disclosure level checks and Zod validation', () => {
    expect(validateAdminAction('factory_reset', { confirm: 'RESET', deleteR2Media: true }, 'basic').ok).toBe(false)
    expect(validateAdminAction('purge_gigs', {}, 'expert').ok).toBe(true)
    expect(validateAdminAction('unknown-command', {}, 'expert').ok).toBe(false)
  })
})
