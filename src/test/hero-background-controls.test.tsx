import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { HeroBackgroundControls } from '@/app/admin/(protected)/site-config/HeroBackgroundControls'

vi.mock('@/app/admin/_components/MediaSourcePicker', () => ({
  MediaSourcePicker: ({
    onResolved, onCleared, onError,
  }: {
    onResolved: (path: string, url?: string) => void
    onCleared?: () => void
    onError: (message: string) => void
  }) => (
    <div>
      <button type="button" onClick={() => onResolved('hero/background/cover.png', 'https://cdn.example/cover.png')}>Select image</button>
      <button type="button" onClick={() => onCleared?.()}>Clear image</button>
      <button type="button" onClick={() => onError('Upload failed')}>Report error</button>
    </div>
  ),
}))

beforeAll(() => vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
}))
afterAll(() => vi.unstubAllGlobals())
afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('hero background controlled overlay settings', () => {
  it('retains opacity and delegates upload/clear/error events', () => {
    const handlers = {
      onBackgroundResolved: vi.fn(),
      onBackgroundCleared: vi.fn(),
      onOpacityChange: vi.fn(),
      onError: vi.fn(),
    }
    const { container } = render(
      <HeroBackgroundControls
        backgroundImageUrl=""
        backgroundImageStoragePath=""
        backgroundImageOpacity={0.35}
        {...handlers}
      />,
    )
    expect(screen.getByText(/Background Overlay Opacity:/)).toHaveTextContent('0.35')
    expect(screen.getByText(/Full-bleed image behind the wordmark/)).toBeInTheDocument()
    expect(container.querySelector('[data-orientation="horizontal"]')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Select image' }))
    expect(handlers.onBackgroundResolved).toHaveBeenCalledWith('hero/background/cover.png', 'https://cdn.example/cover.png')
    fireEvent.click(screen.getByRole('button', { name: 'Clear image' }))
    expect(handlers.onBackgroundCleared).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Report error' }))
    expect(handlers.onError).toHaveBeenCalledWith('Upload failed')
  })
})
