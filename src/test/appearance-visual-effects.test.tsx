import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { AppearanceVisualEffects } from '@/app/admin/(protected)/site-config/AppearanceVisualEffects'

beforeAll(() => {
  // Radix Slider uses ResizeObserver, which is absent in jsdom.
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

function setup() {
  const callbacks = {
    onCrtEnabledChange: vi.fn(),
    onScanlineEnabledChange: vi.fn(),
    onNoiseEnabledChange: vi.fn(),
    onGlitchEnabledChange: vi.fn(),
    onFilmGrainChange: vi.fn(),
    onNoiseIntensityChange: vi.fn(),
    onVignetteOpacityChange: vi.fn(),
    onChromaticStrengthChange: vi.fn(),
  }
  const ui = render(
    <AppearanceVisualEffects
      crtEnabled={true}
      scanlineEnabled={false}
      noiseEnabled={true}
      glitchEnabled={false}
      filmGrain={false}
      noiseIntensity={0.3}
      vignetteOpacity={0.5}
      chromaticStrength={0}
      {...callbacks}
    />,
  )
  return { ...ui, callbacks }
}

describe('appearance visual effect controls', () => {
  it('preserves the initially collapsed accordion and existing effect labels/slider values', () => {
    const ui = setup()
    expect(ui.container.querySelector('details')?.open).toBe(false)
    expect(screen.getByText('Visual effects')).toBeInTheDocument()
    expect(screen.getByText('CRT overlay & vignette')).toBeInTheDocument()
    expect(screen.getByText('Scanlines')).toBeInTheDocument()
    expect(screen.getByText('Noise / grain')).toBeInTheDocument()
    expect(screen.getByText('Glitch')).toBeInTheDocument()
    expect(screen.getByText('Film grain pattern (denser)')).toBeInTheDocument()
    expect(screen.getByText(/Noise grain intensity:/)).toHaveTextContent('30%')
    expect(screen.getByText(/Vignette \(dark edges\):/)).toHaveTextContent('50%')
    expect(screen.getByText(/Chromatic aberration:/)).toHaveTextContent('0%')
  })

  it('routes toggles through the controlled parent callbacks', () => {
    const { callbacks } = setup()
    const row = screen.getByText('Scanlines').parentElement
    expect(row).not.toBeNull()
    fireEvent.click(within(row!).getByRole('switch', { hidden: true }))
    expect(callbacks.onScanlineEnabledChange).toHaveBeenCalledOnce()
    expect(callbacks.onScanlineEnabledChange).toHaveBeenCalledWith(true)
    const glitchRow = screen.getByText('Glitch').parentElement!
    fireEvent.click(within(glitchRow).getByRole('switch', { hidden: true }))
    expect(callbacks.onGlitchEnabledChange).toHaveBeenCalledOnce()
    expect(callbacks.onGlitchEnabledChange).toHaveBeenCalledWith(true)
    const crtRow = screen.getByText('CRT overlay & vignette').parentElement!
    fireEvent.click(within(crtRow).getByRole('switch', { hidden: true }))
    expect(callbacks.onCrtEnabledChange).toHaveBeenCalledOnce()
    expect(callbacks.onCrtEnabledChange).toHaveBeenCalledWith(false)
    expect(callbacks.onNoiseIntensityChange).not.toHaveBeenCalled()
    expect(callbacks.onVignetteOpacityChange).not.toHaveBeenCalled()
    expect(callbacks.onChromaticStrengthChange).not.toHaveBeenCalled()
  })
})
