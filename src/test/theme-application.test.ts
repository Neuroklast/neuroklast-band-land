import { describe, it, expect, beforeEach } from 'vitest'
import { applyThemeToDOM, applyThemeToDocument, resetThemeDOM } from '@/lib/theme-application'
import type { ThemeSettings } from '@/lib/types'

describe('applyThemeToDOM', () => {
  beforeEach(() => {
    // Clean up any previous data-theme attribute
    document.documentElement.removeAttribute('data-theme')
  })

  it('sets data-theme attribute when activePreset is provided', () => {
    const theme: ThemeSettings = { activePreset: 'cyberpunk', primary: 'red' }
    applyThemeToDOM(theme)
    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk')
  })

  it('updates data-theme attribute on theme switch', () => {
    applyThemeToDOM({ activePreset: 'cyberpunk', primary: 'red' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk')

    applyThemeToDOM({ activePreset: 'neon', primary: 'blue' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('neon')
  })

  it('removes data-theme attribute when activePreset is absent', () => {
    document.documentElement.setAttribute('data-theme', 'old-theme')
    applyThemeToDOM({ primary: 'red' })
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('removes data-theme attribute when theme is undefined', () => {
    document.documentElement.setAttribute('data-theme', 'old-theme')
    applyThemeToDOM(undefined)
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})

describe('applyThemeToDocument', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.removeProperty('--primary')
    document.documentElement.style.removeProperty('--accent')
  })

  it('sets data-theme from the explicit layoutTheme parameter', () => {
    applyThemeToDocument('cyberpunk', { primary: 'red' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk')
  })

  it('uses layoutTheme for data-theme even when settings.activePreset differs', () => {
    applyThemeToDocument('neuroklast-classic', { activePreset: 'cyberpunk', primary: 'red' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('neuroklast-classic')
  })

  it('removes data-theme when layoutTheme is empty string', () => {
    document.documentElement.setAttribute('data-theme', 'old-theme')
    applyThemeToDocument('', { primary: 'red' })
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('applies CSS variables from settings', () => {
    applyThemeToDocument('cyberpunk', { primary: 'oklch(0.50 0.22 25)', accent: 'oklch(0.60 0.24 25)' })
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('oklch(0.50 0.22 25)')
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('oklch(0.60 0.24 25)')
  })

  it('switching layout theme preserves CSS variables from settings', () => {
    applyThemeToDocument('cyberpunk', { primary: 'red' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk')

    applyThemeToDocument('neon', { primary: 'red' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('neon')
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('red')
  })
})

describe('resetThemeDOM', () => {
  it('removes data-theme attribute', () => {
    document.documentElement.setAttribute('data-theme', 'cyberpunk')
    resetThemeDOM()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})
