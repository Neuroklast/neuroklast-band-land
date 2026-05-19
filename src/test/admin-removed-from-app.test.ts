/**
 * Step 8 (completion): Admin components removed from App.tsx.
 *
 * AdminButton, AdminDialogManager, and AdminLoginDialog now live exclusively
 * on the /admin route (AdminPage.tsx).  App.tsx is a pure public band site.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const appSource = readFileSync(resolve(__dirname, '../App.tsx'), 'utf-8')

describe('App.tsx — admin components removed (step 8 completion)', () => {
  it('does not lazy-import AdminButton', () => {
    expect(appSource).not.toContain("import('@/components/AdminButton')")
  })

  it('does not lazy-import AdminDialogManager', () => {
    expect(appSource).not.toContain("import('@/components/AdminDialogManager')")
  })

  it('does not lazy-import AdminLoginDialog', () => {
    expect(appSource).not.toContain("import('@/components/AdminLoginDialog')")
  })

  it('does not render <AdminButton>', () => {
    expect(appSource).not.toContain('<AdminButton')
  })

  it('does not render <AdminDialogManager>', () => {
    expect(appSource).not.toContain('<AdminDialogManager')
  })

  it('does not render <AdminLoginDialog>', () => {
    expect(appSource).not.toContain('<AdminLoginDialog')
  })

  it('does not reference showLoginDialog', () => {
    expect(appSource).not.toContain('showLoginDialog')
  })

  it('does not reference showSetupDialog', () => {
    expect(appSource).not.toContain('showSetupDialog')
  })
})
