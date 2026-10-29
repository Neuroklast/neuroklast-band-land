import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { BackgroundDesktopVideoControls } from '@/app/admin/(protected)/site-config/BackgroundDesktopVideoControls'
import { BackgroundMobileVideoControls } from '@/app/admin/(protected)/site-config/BackgroundMobileVideoControls'

vi.mock('@/app/admin/_components/VideoSourcePicker', () => ({
  VideoSourcePicker: ({
    label, storagePrefix, scrubVariant, onResolved, onCleared, onError,
  }: {
    label: string
    storagePrefix: string
    scrubVariant: string
    onResolved: (path: string, publicUrl?: string) => void
    onCleared: () => void
    onError: (error: string) => void
  }) => <section>
    <p>{label} ({storagePrefix}, {scrubVariant})</p>
    <button type="button" onClick={() => onResolved('background/videos/example.mp4', 'https://cdn.example/example.mp4')}>Resolve media</button>
    <button type="button" onClick={onCleared}>Clear media</button>
    <button type="button" onClick={() => onError('Upload error')}>Media error</button>
  </section>,
}))

beforeAll(() => vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
}))
afterAll(() => vi.unstubAllGlobals())
afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('background controlled desktop video', () => {
  it('preserves enabled switch, video picker and intensity controls', () => {
    const handlers = {
      onToggleEnabled: vi.fn(),
      onResolved: vi.fn(),
      onCleared: vi.fn(),
      onOpacityChange: vi.fn(),
      onError: vi.fn(),
    }
    const { rerender } = render(
      <BackgroundDesktopVideoControls
        backgroundVideoEnabled={false}
        videoUrl=""
        videoStoragePath=""
        backgroundVideoOpacity={0.25}
        {...handlers}
      />,
    )
    expect(screen.getByRole('switch', { name: 'Enable background video' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText(/Video is off/)).toBeInTheDocument()
    expect(screen.getByText(/Desktop video \(optional\)/)).toHaveTextContent('background/videos')
    fireEvent.click(screen.getByRole('switch', { name: 'Enable background video' }))
    expect(handlers.onToggleEnabled).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Resolve media' }))
    expect(handlers.onResolved).toHaveBeenCalledWith('background/videos/example.mp4', 'https://cdn.example/example.mp4')
    fireEvent.click(screen.getByRole('button', { name: 'Clear media' }))
    expect(handlers.onCleared).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Media error' }))
    expect(handlers.onError).toHaveBeenCalledWith('Upload error')

    rerender(
      <BackgroundDesktopVideoControls
        backgroundVideoEnabled={true}
        videoUrl=""
        videoStoragePath=""
        backgroundVideoOpacity={0.25}
        {...handlers}
      />,
    )
    expect(screen.getByRole('switch', { name: 'Enable background video' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText(/Video opacity:/)).toHaveTextContent('25%')
  })
})

describe('background controlled mobile video', () => {
  it('shows its picker only for separate mode and forwards mode changes', () => {
    const handlers = { onModeChange: vi.fn(), onResolved: vi.fn(), onCleared: vi.fn(), onError: vi.fn() }
    const props = { mobileVideoUrl: '', mobileVideoStoragePath: '', ...handlers }
    const { rerender } = render(<BackgroundMobileVideoControls mobileVideoMode="same" {...props} />)
    expect(screen.getByText('Same as desktop')).toBeInTheDocument()
    expect(screen.queryByText(/Mobile video \(background\/videos\/mobile/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Different video'))
    expect(handlers.onModeChange).toHaveBeenCalledWith('separate')
    rerender(<BackgroundMobileVideoControls mobileVideoMode="separate" {...props} />)
    expect(screen.getByText(/Mobile video \(background\/videos\/mobile/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Resolve media' }))
    expect(handlers.onResolved).toHaveBeenCalledWith('background/videos/example.mp4', 'https://cdn.example/example.mp4')
    fireEvent.click(screen.getByRole('button', { name: 'Clear media' }))
    expect(handlers.onCleared).toHaveBeenCalledOnce()
    rerender(<BackgroundMobileVideoControls mobileVideoMode="off" {...props} />)
    expect(screen.queryByText(/Mobile video \(background\/videos\/mobile/)).not.toBeInTheDocument()
  })
})
