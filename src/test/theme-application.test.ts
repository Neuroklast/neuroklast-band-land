import { describe, it, expect, beforeEach } from 'vitest'
import { applyThemeToDOM, resetThemeDOM } from '@/lib/theme-application'
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

describe('resetThemeDOM', () => {
  it('removes data-theme attribute', () => {
    document.documentElement.setAttribute('data-theme', 'cyberpunk')
    resetThemeDOM()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})
