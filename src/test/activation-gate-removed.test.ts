/**
 * Step 3: ActivationLockScreen gate removed from App.tsx.
 *
 * App.tsx must no longer render an ActivationLockScreen — the app should be
 * accessible without a valid activation key.  We verify this at the source
 * level (AST-free string inspection) to avoid the overhead of mounting the
 * full App component.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const appSource = readFileSync(resolve(__dirname, '../App.tsx'), 'utf-8')

describe('App.tsx — ActivationLockScreen gate removed (step 3)', () => {
  it('does not import ActivationLockScreen', () => {
    expect(appSource).not.toContain('ActivationLockScreen')
  })

  it('does not call validateActivationKey', () => {
    expect(appSource).not.toContain('validateActivationKey')
  })

  it('does not render a blocking gate based on activationResult.valid', () => {
    expect(appSource).not.toMatch(/activationResult.*valid/)
  })
})
