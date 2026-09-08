import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')

function readSource(relativePath: string): string {
  return readFileSync(resolve(root, relativePath), 'utf8')
}

describe('public mobile regression guards', () => {
  it('SiteNav hamburger has 44px touch target', () => {
    const src = readSource('app/_components/public/SiteNav.tsx')
    expect(src).toMatch(/min-h-\[44px\]/)
    expect(src).toMatch(/min-w-\[44px\]/)
  })

  it('SiteNav keeps logo in flex flow (not absolute over links)', () => {
    const src = readSource('app/_components/public/SiteNav.tsx')
    // Absolute logo + padding-left caused BIO to sit under the mark
    expect(src).not.toMatch(/absolute left-\[var\(--spacing-card/)
    expect(src).toMatch(/shrink-0/)
  })

  it('SiteNav uses icon→label glitch links on desktop', () => {
    const src = readSource('app/_components/public/SiteNav.tsx')
    expect(src).toMatch(/nav-glitch-link/)
    expect(src).toMatch(/getNavIcon/)
    // Translated label (i18n) used for accessible name
    expect(src).toMatch(/aria-label=\{label\}/)
  })

  it('GallerySection opens the shared overlay lightbox', () => {
    const src = readSource('app/_components/public/GallerySection.tsx')
    expect(src).toMatch(/openOverlay/)
    expect(src).toMatch(/type: 'gallery'/)
    expect(src).toMatch(/role=\{lightbox \? 'button' : undefined\}/)
  })

  it('CyberpunkOverlay exposes dialog semantics', () => {
    const src = readSource('components/CyberpunkOverlay.tsx')
    expect(src).toMatch(/role="dialog"/)
    expect(src).toMatch(/aria-modal="true"/)
    expect(src).toMatch(/GalleryOverlayContent/)
    expect(src).toMatch(/nk-scroll-lock/)
    expect(src).toMatch(/100svh/)
  })

  it('OverlayHost does not duplicate page scroll lock', () => {
    const src = readSource('app/_components/public/OverlayHost.tsx')
    expect(src).not.toMatch(/overflow/)
    expect(src).not.toMatch(/lenis/)
  })

  it('SiteNav mobile links have 44px touch targets', () => {
    const src = readSource('app/_components/public/SiteNav.tsx')
    expect(src).toMatch(/min-h-\[44px\]/)
  })

  it('Classic Navigation is the live chrome with 44px targets and reduced-motion', () => {
    const src = readSource('themes/neuroklast-classic/Navigation.tsx')
    expect(src).toMatch(/min-h-\[44px\]/)
    expect(src).toMatch(/min-w-\[44px\]/)
    expect(src).toMatch(/safe-area-inset-top/)
    expect(src).toMatch(/useReducedMotion/)
    expect(src).toMatch(/aria-expanded/)
  })

  it('Gallery overlay dots are keyboard buttons', () => {
    const src = readSource('components/overlays/GalleryOverlayContent.tsx')
    expect(src).toMatch(/aria-label=\{`Go to image/)
    expect(src).toMatch(/type="button"/)
  })
})