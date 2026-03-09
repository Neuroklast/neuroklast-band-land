import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { ThemeProvider, useThemeEngine } from '@/contexts/ThemeContext'
import type { ThemeSettings } from '@/lib/types'

// ── Helper: renders a component that exposes context values ─────────────────

function TestConsumer({ onRender }: { onRender: (ctx: ReturnType<typeof useThemeEngine>) => void }) {
  const ctx = useThemeEngine()
  onRender(ctx)
  return null
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clean DOM state
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.removeProperty('--primary')
    document.documentElement.style.removeProperty('--background')
    localStorage.clear()
  })

  it('applies theme to DOM on mount', () => {
    const settings: ThemeSettings = { activePreset: 'cyberpunk', primary: 'red' }

    render(
      <ThemeProvider themeSettings={settings} onChangeTheme={() => {}}>
        <div />
      </ThemeProvider>,
    )

    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk')
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('red')
  })

  it('writes nk-theme-cache to localStorage on mount', () => {
    const settings: ThemeSettings = { activePreset: 'neon', primary: 'blue' }

    render(
      <ThemeProvider themeSettings={settings} onChangeTheme={() => {}}>
        <div />
      </ThemeProvider>,
    )

    const cached = JSON.parse(localStorage.getItem('nk-theme-cache')!)
    expect(cached.activePreset).toBe('neon')
    expect(cached.primary).toBe('blue')
  })

  it('updates DOM when themeSettings prop changes', () => {
    const { rerender } = render(
      <ThemeProvider themeSettings={{ activePreset: 'cyberpunk', primary: 'red' }} onChangeTheme={() => {}}>
        <div />
      </ThemeProvider>,
    )

    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk')

    rerender(
      <ThemeProvider themeSettings={{ activePreset: 'neon', primary: 'blue' }} onChangeTheme={() => {}}>
        <div />
      </ThemeProvider>,
    )

    expect(document.documentElement.getAttribute('data-theme')).toBe('neon')
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('blue')
  })

  it('removes data-theme when themeSettings is undefined', () => {
    const { rerender } = render(
      <ThemeProvider themeSettings={{ activePreset: 'cyberpunk' }} onChangeTheme={() => {}}>
        <div />
      </ThemeProvider>,
    )

    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk')

    rerender(
      <ThemeProvider themeSettings={undefined} onChangeTheme={() => {}}>
        <div />
      </ThemeProvider>,
    )

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})

describe('useThemeEngine', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.clear()
  })

  it('throws when used outside ThemeProvider', () => {
    // Suppress console.error from React's error boundary
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestConsumer onRender={() => {}} />)
    }).toThrow('useThemeEngine must be used within a ThemeProvider')

    spy.mockRestore()
  })

  it('provides current themeSettings and activePreset', () => {
    let captured: ReturnType<typeof useThemeEngine> | null = null

    render(
      <ThemeProvider themeSettings={{ activePreset: 'cyberpunk', primary: 'red' }} onChangeTheme={() => {}}>
        <TestConsumer onRender={(ctx) => { captured = ctx }} />
      </ThemeProvider>,
    )

    expect(captured!.themeSettings).toEqual({ activePreset: 'cyberpunk', primary: 'red' })
    expect(captured!.activePreset).toBe('cyberpunk')
  })

  it('setThemeSettings calls onChangeTheme and applies to DOM atomically', () => {
    const onChangeTheme = vi.fn()
    let captured: ReturnType<typeof useThemeEngine> | null = null

    render(
      <ThemeProvider themeSettings={{ activePreset: 'cyberpunk' }} onChangeTheme={onChangeTheme}>
        <TestConsumer onRender={(ctx) => { captured = ctx }} />
      </ThemeProvider>,
    )

    const newSettings: ThemeSettings = { activePreset: 'neon', primary: 'green' }

    act(() => {
      captured!.setThemeSettings(newSettings)
    })

    // DOM updated immediately
    expect(document.documentElement.getAttribute('data-theme')).toBe('neon')
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('green')

    // localStorage updated
    const cached = JSON.parse(localStorage.getItem('nk-theme-cache')!)
    expect(cached.activePreset).toBe('neon')

    // Callback invoked
    expect(onChangeTheme).toHaveBeenCalledWith(newSettings)
  })
})

describe('theme-init.js localStorage key contract', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('nk-theme-cache key is readable by theme-init.js pattern', () => {
    // Simulate what ThemeProvider writes
    const settings: ThemeSettings = { activePreset: 'cyberpunk', primary: 'red', background: 'black' }
    localStorage.setItem('nk-theme-cache', JSON.stringify(settings))

    // Simulate what theme-init.js reads (priority 1)
    const cached = localStorage.getItem('nk-theme-cache')
    expect(cached).toBeTruthy()
    const parsed = JSON.parse(cached!)
    expect(parsed.activePreset).toBe('cyberpunk')
    expect(parsed.primary).toBe('red')
    expect(parsed.background).toBe('black')
  })

  it('kv:site-config key is readable as fallback by theme-init.js pattern', () => {
    // Simulate what useKV writes (no dedicated cache present)
    const config = { themeSettings: { activePreset: 'neon', primary: 'blue' } }
    localStorage.setItem('kv:site-config', JSON.stringify(config))

    // Simulate theme-init.js fallback logic
    const cached = localStorage.getItem('nk-theme-cache')
    expect(cached).toBeNull()

    const raw = localStorage.getItem('kv:site-config')
    const cfg = JSON.parse(raw!)
    expect(cfg.themeSettings.activePreset).toBe('neon')
  })
})
