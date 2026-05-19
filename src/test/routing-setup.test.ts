/**
 * Next.js App Router migration sanity checks.
 *
 * Verifies at the source level:
 * - src/app/layout.tsx exists and provides global layout
 * - src/app/page.tsx and src/app/admin/page.tsx exist for `/` and `/admin`
 * - src/admin/AdminPage.tsx exists and uses useAdminAuth
 * - src/app/not-found.tsx exists for 404 handling
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'

const layoutSrc = readFileSync(resolve(__dirname, '../app/layout.tsx'), 'utf-8')

describe('App Router root layout', () => {
  it('layout.tsx exists', () => {
    expect(existsSync(resolve(__dirname, '../app/layout.tsx'))).toBe(true)
  })

  it('defines the root html shell', () => {
    expect(layoutSrc).toContain('<html')
  })
})

describe('App Router route files', () => {
  it('app/page.tsx exists for the home route', () => {
    expect(existsSync(resolve(__dirname, '../app/page.tsx'))).toBe(true)
  })

  it('app/admin/page.tsx exists for the admin route', () => {
    expect(existsSync(resolve(__dirname, '../app/admin/page.tsx'))).toBe(true)
  })
})

describe('Standalone admin page', () => {
  it('AdminPage.tsx exists', () => {
    expect(existsSync(resolve(__dirname, '../admin/AdminPage.tsx'))).toBe(true)
  })

  it('AdminPage uses useAdminAuth', () => {
    const src = readFileSync(resolve(__dirname, '../admin/AdminPage.tsx'), 'utf-8')
    expect(src).toContain('useAdminAuth')
  })

  it('app/not-found.tsx exists for 404 handling', () => {
    expect(existsSync(resolve(__dirname, '../app/not-found.tsx'))).toBe(true)
  })
})
