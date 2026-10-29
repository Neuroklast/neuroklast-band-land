import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { HeroGlitchControls } from '@/app/admin/(protected)/site-config/HeroGlitchControls'
import type { HeroPowerGlitchConfig } from '@/lib/hero-glitch-config'

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})
afterAll(() => vi.unstubAllGlobals())
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const config: HeroPowerGlitchConfig = {
  mode: 'off',
  durationMs: 2000,
  sliceCount: 6,
  shake: true,
  hueRotate: true,
  pulse: false,
  continuous: false,
}

function mount(overrides: Partial<HeroPowerGlitchConfig> = {}) {
  const handlers = {
    onModeChange: vi.fn(),
    onDurationMsChange: vi.fn(),
    onSliceCountChange: vi.fn(),
    onShakeChange: vi.fn(),
    onHueRotateChange: vi.fn(),
    onPulseChange: vi.fn(),
    onContinuousChange: vi.fn(),
  }
  const props = { ...config, ...overrides, ...handlers }
  const view = render(<HeroGlitchControls {...props} />)
  return { ...view, handlers, props }
}

describe('controlled hero PowerGlitch settings', () => {
  it('preserves the Off/Hover/Always buttons and hides detailed controls in Off mode', () => {
    const { handlers } = mount()
    expect(screen.getByText('Wordmark glitch')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Off' })).toHaveClass('border-red-700/50')
    expect(screen.queryByText('Duration — 2000ms')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Shake')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hover' }))
    expect(handlers.onModeChange).toHaveBeenCalledWith('hover')
    fireEvent.click(screen.getByRole('button', { name: 'Always' }))
    expect(handlers.onModeChange).toHaveBeenCalledWith('always')
  })

  it('preserves slider bounds, existing labels, and checkbox callbacks in Hover mode', () => {
    const { handlers, container } = mount({ mode: 'hover', durationMs: 750, sliceCount: 8 })
    expect(screen.getByRole('button', { name: 'Hover' })).toHaveClass('border-red-700/50')
    expect(screen.getByText('Duration — 750ms')).toBeInTheDocument()
    expect(screen.getByText('Slices — 8')).toBeInTheDocument()
    const duration = container.querySelector('[aria-label="Glitch duration"]')
    expect(duration).toHaveAttribute('data-orientation', 'horizontal')
    expect(duration).toHaveAttribute('aria-label', 'Glitch duration')
    const slices = container.querySelector('[aria-label="Glitch slice count"]')
    expect(slices).toHaveAttribute('aria-label', 'Glitch slice count')
    fireEvent.click(screen.getByLabelText('Shake'))
    fireEvent.click(screen.getByLabelText('Hue rotate'))
    fireEvent.click(screen.getByLabelText('Pulse'))
    fireEvent.click(screen.getByLabelText('Continuous'))
    expect(handlers.onShakeChange).toHaveBeenCalledWith(false)
    expect(handlers.onHueRotateChange).toHaveBeenCalledWith(false)
    expect(handlers.onPulseChange).toHaveBeenCalledWith(true)
    expect(handlers.onContinuousChange).toHaveBeenCalledWith(true)
  })
})
