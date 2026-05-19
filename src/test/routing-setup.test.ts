/**
 * Steps 1, 2 & 8: React Router set up, route structure created, standalone admin page.
 *
 * Verifies at the source level:
 * - main.tsx wraps the app in BrowserRouter (react-router-dom)
 * - AppRouter.tsx exists and defines `/` and `/admin` routes
 * - AdminPage.tsx exists and uses useAdminAuth
 * - AdminRoute.tsx exists as a route-level auth guard
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'

const mainSrc = readFileSync(resolve(__dirname, '../main.tsx'), 'utf-8')

describe('Step 1 — BrowserRouter in main.tsx', () => {
  it('imports react-router-dom in main.tsx', () => {
    expect(mainSrc).toContain('react-router-dom')
  })

  it('wraps the app in BrowserRouter', () => {
    expect(mainSrc).toContain('BrowserRouter')
  })
})

describe('Step 2 — AppRouter.tsx route structure', () => {
  it('AppRouter.tsx exists', () => {
    expect(existsSync(resolve(__dirname, '../AppRouter.tsx'))).toBe(true)
  })

  it('AppRouter defines a / route', () => {
    const src = readFileSync(resolve(__dirname, '../AppRouter.tsx'), 'utf-8')
    expect(src).toMatch(/path=['"]\/['"]/)
  })

  it('AppRouter defines an /admin route', () => {
    const src = readFileSync(resolve(__dirname, '../AppRouter.tsx'), 'utf-8')
    expect(src).toContain('/admin')
  })
})

describe('Step 8 — Standalone admin page', () => {
  it('AdminPage.tsx exists', () => {
    expect(existsSync(resolve(__dirname, '../pages/AdminPage.tsx'))).toBe(true)
  })

  it('AdminPage uses useAdminAuth', () => {
    const src = readFileSync(resolve(__dirname, '../pages/AdminPage.tsx'), 'utf-8')
    expect(src).toContain('useAdminAuth')
  })

  it('AdminRoute.tsx exists as auth guard', () => {
    expect(existsSync(resolve(__dirname, '../components/AdminRoute.tsx'))).toBe(true)
  })
})
