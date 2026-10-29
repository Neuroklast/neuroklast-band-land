import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { Dispatch, SetStateAction } from 'react'
import { AppearanceQuickStart } from '@/app/admin/(protected)/site-config/AppearanceQuickStart'
import { AppearanceColorsFonts } from '@/app/admin/(protected)/site-config/AppearanceColorsFonts'
import { hexToOklch } from '@/lib/color-utils'

vi.mock('@/app/admin/_components/MediaSourcePicker', () => ({
  MediaSourcePicker: ({
    onResolved,
    onCleared,
    onError,
  }: {
    onResolved: (path: string, publicUrl?: string) => void
    onCleared: () => void
    onError: (message: string) => void
  }) => (
    <div data-testid="favicon-picker">
      <button type="button" onClick={() => onResolved('site/favicon/icon.png', 'https://cdn.example/icon.png')}>
        Resolve favicon
      </button>
      <button type="button" onClick={onCleared}>Clear favicon</button>
      <button type="button" onClick={() => onError('Upload failed')}>Fail favicon</button>
    </div>
  ),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('appearance quick-start controlled form', () => {
  function mountQuickStart(sectionOpacity = 0.55) {
    const onApplyLook = vi.fn()
    const onApplyPreset = vi.fn()
    const onPresetNameChange = vi.fn()
    const onSavePreset = vi.fn()
    const onApplyReadableMode = vi.fn()
    const setOverlayAnimations = vi.fn() as Dispatch<SetStateAction<string[]>>
    const result = render(
      <AppearanceQuickStart
        lookId="neuroklast-classic"
        overlayAnimations={['circuitBreak']}
        setOverlayAnimations={setOverlayAnimations}
        onApplyLook={onApplyLook}
        onApplyPreset={onApplyPreset}
        savedPresets={[{ name: 'Custom', theme: { accentColor: '#ff0000' } }]}
        presetName=""
        onPresetNameChange={onPresetNameChange}
        onSavePreset={onSavePreset}
        sectionPanelOpacity={sectionOpacity}
        sectionGridOpacity={0.2}
        cardSurfaceOpacity={0.85}
        onSectionPanelOpacityChange={vi.fn()}
        onSectionGridOpacityChange={vi.fn()}
        onCardSurfaceOpacityChange={vi.fn()}
        onApplyReadableMode={onApplyReadableMode}
      />,
    )
    return { ...result, onApplyLook, onApplyPreset, onPresetNameChange, onSavePreset,
      onApplyReadableMode, setOverlayAnimations }
  }

  it('keeps the quick-start accordion open and applies existing look/preset callbacks', () => {
    const ui = mountQuickStart()
    expect(ui.container.querySelector('details')?.open).toBe(true)
    fireEvent.click(screen.getByText('Neuroklast Classic').closest('button')!)
    expect(ui.onApplyLook).toHaveBeenCalledWith(expect.objectContaining({ id: 'neuroklast-classic' }))
    fireEvent.click(screen.getByRole('button', { name: 'Custom' }))
    expect(ui.onApplyPreset).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Custom', theme: { accentColor: '#ff0000' } }),
    )
    fireEvent.change(screen.getByPlaceholderText('Save current look as…'), {
      target: { value: 'New theme' },
    })
    expect(ui.onPresetNameChange).toHaveBeenCalledWith('New theme')
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(ui.onSavePreset).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Readable defaults' }))
    expect(ui.onApplyReadableMode).toHaveBeenCalledOnce()
  })

  it('preserves the functional overlay pool toggle and transparent-panel warning', () => {
    const ui = mountQuickStart(0)
    fireEvent.click(screen.getByText('circuitBreak').closest('button')!)
    expect(ui.setOverlayAnimations).toHaveBeenCalledOnce()
    const update = vi.mocked(ui.setOverlayAnimations).mock.calls[0][0]
    expect(typeof update).toBe('function')
    if (typeof update === 'function') {
      expect(update(['circuitBreak', 'glitchScan'])).toEqual(['glitchScan'])
    }
    expect(screen.getByText(/Low section background makes text harder to read/)).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Grid lines on sections' })).toHaveAttribute('data-disabled')
  })
})

describe('appearance color/font/favicons controlled form', () => {
  it('preserves theme field conversion, font selection and favicon callback behavior', () => {
    const onThemeFieldChange = vi.fn()
    const onFaviconStoragePathChange = vi.fn()
    const onFaviconUrlChange = vi.fn()
    const onError = vi.fn()
    const ui = render(
      <AppearanceColorsFonts
        theme={{
          accentColor: '#ff0000',
          fontBody: 'var(--font-space-grotesk)',
        }}
        onThemeFieldChange={onThemeFieldChange}
        faviconUrl=""
        faviconStoragePath=""
        onFaviconStoragePathChange={onFaviconStoragePathChange}
        onFaviconUrlChange={onFaviconUrlChange}
        onError={onError}
      />,
    )
    expect(ui.container.querySelector('details')?.open).toBe(false)
    fireEvent.change(screen.getByRole('textbox', { name: 'Accent hex', hidden: true }), {
      target: { value: '#00FF00' },
    })
    expect(onThemeFieldChange).toHaveBeenCalledWith('accentColor', hexToOklch('#00FF00'))
    fireEvent.click(screen.getByRole('button', { name: 'Resolve favicon', hidden: true }))
    expect(onFaviconStoragePathChange).toHaveBeenLastCalledWith('site/favicon/icon.png')
    expect(onFaviconUrlChange).toHaveBeenCalledWith('https://cdn.example/icon.png')
    expect(onError).toHaveBeenCalledWith(null)
    fireEvent.click(screen.getByRole('button', { name: 'Clear favicon', hidden: true }))
    expect(onFaviconStoragePathChange).toHaveBeenLastCalledWith('')
    expect(onFaviconUrlChange).toHaveBeenLastCalledWith('')
    fireEvent.click(screen.getByRole('button', { name: 'Fail favicon', hidden: true }))
    expect(onError).toHaveBeenLastCalledWith('Upload failed')
  })
})
