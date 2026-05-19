/**
 * Step 6: KeyManagerPanel removed.
 *
 * KeyManagerPanel is a Neuroklast-specific SaaS component for issuing /
 * revoking activation keys.  It should not be included in a standalone
 * band-site deployment.
 *
 * We verify this at the source level so the test fails immediately if
 * the component is re-introduced.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'

describe('KeyManagerPanel removed (step 6)', () => {
  it('KeyManagerPanel.tsx no longer exists', () => {
    const filePath = resolve(__dirname, '../components/KeyManagerPanel.tsx')
    expect(existsSync(filePath)).toBe(false)
  })

  it('AdminDialogManager does not import KeyManagerPanel', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/AdminDialogManager.tsx'),
      'utf-8'
    )
    expect(src).not.toContain('KeyManagerPanel')
  })

  it('AdminHubDialog does not reference the key-manager dialog', () => {
    const src = readFileSync(
      resolve(__dirname, '../features/admin/components/AdminHubDialog.tsx'),
      'utf-8'
    )
    expect(src).not.toContain("'key-manager'")
    expect(src).not.toContain('"key-manager"')
  })
})
