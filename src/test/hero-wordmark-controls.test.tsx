import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { HeroWordmarkControls } from '@/app/admin/(protected)/site-config/HeroWordmarkControls'
import { DEFAULT_HERO_LOGO_URL } from '@/lib/hero-defaults'

vi.mock('@/app/admin/_components/MediaSourcePicker', () => ({
  MediaSourcePicker: ({ onResolved, onError }: {
    onResolved: (path: string, url?: string) => void
    onError: (message: string) => void
  }) => (
    <div>
      <button type="button" onClick={() => onResolved('hero/logo/image.png', 'https://cdn.example/image.png')}>Uploaded</button>
      <button type="button" onClick={() => onError('Upload error')}>Upload failed</button>
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

describe('hero wordmark controlled media and responsive widths', () => {
  it('preserves the fallback logo, independent preview widths and width sliders', () => {
    const props = {
      logoImageUrl: '',
      logoImageStoragePath: '',
      logoWidthPercent: 55,
      logoWidthPercentMobile: 90,
      onLogoResolved: vi.fn(),
      onResetLogo: vi.fn(),
      onDesktopWidthChange: vi.fn(),
      onMobileWidthChange: vi.fn(),
      onError: vi.fn(),
    }
    const { container } = render(<HeroWordmarkControls {...props} />)
    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('src', DEFAULT_HERO_LOGO_URL)
    expect(images[0]).toHaveStyle({ width: '55%', maxWidth: '100%' })
    expect(images[1]).toHaveStyle({ width: '90%', maxWidth: '100%' })
    expect(container.querySelector('[aria-label="Hero wordmark desktop width percent"]')).toBeInTheDocument()
    expect(container.querySelector('[aria-label="Hero wordmark mobile width percent"]')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reset to default wordmark' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Uploaded' }))
    expect(props.onLogoResolved).toHaveBeenCalledWith('hero/logo/image.png', 'https://cdn.example/image.png')
    fireEvent.click(screen.getByRole('button', { name: 'Upload failed' }))
    expect(props.onError).toHaveBeenCalledWith('Upload error')
  })

  it('shows the reset control only for a selected logo', () => {
    const onResetLogo = vi.fn()
    const { container } = render(
      <HeroWordmarkControls
        logoImageUrl="https://cdn.example/logo.png"
        logoImageStoragePath="hero/logo/logo.png"
        logoWidthPercent={75}
        logoWidthPercentMobile={95}
        onLogoResolved={vi.fn()}
        onResetLogo={onResetLogo}
        onDesktopWidthChange={vi.fn()}
        onMobileWidthChange={vi.fn()}
        onError={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reset to default wordmark' }))
    expect(onResetLogo).toHaveBeenCalledOnce()
    expect(container.querySelectorAll('img')).toHaveLength(2)
  })
})
