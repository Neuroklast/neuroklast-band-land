import type { ReactElement } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor, act } from '@testing-library/react'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { SpotifyEmbed } from './SpotifyEmbed'

function renderEmbed(ui: ReactElement) {
  return render(<LocaleProvider>{ui}</LocaleProvider>)
}

const ARTIST_URI = 'spotify:artist:7BqEidErPMNiUXCRE0dV2n'
const EMBED_SRC =
  'https://open.spotify.com/embed/artist/7BqEidErPMNiUXCRE0dV2n?utm_source=generator&theme=0'

describe('SpotifyEmbed', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    document.querySelectorAll('script[src*="spotify"]').forEach((s) => s.remove())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.querySelectorAll('script[src*="spotify"]').forEach((s) => s.remove())
  })

  it('renders a container div with placeholder', () => {
    const { container, getByText } = renderEmbed(<SpotifyEmbed uri={ARTIST_URI} />)
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement)
    expect(getByText(/Load Spotify player/i)).toBeInTheDocument()
  })

  it('applies className to the container', () => {
    const { container } = renderEmbed(<SpotifyEmbed uri={ARTIST_URI} className="test-class" />)
    expect(container.firstChild).toHaveClass('test-class')
  })

  it('does not inject a script or iframe on mount (GDPR consent required)', () => {
    renderEmbed(<SpotifyEmbed uri={ARTIST_URI} />)
    expect(document.querySelector('script[src*="spotify"]')).toBeNull()
    expect(document.querySelector('iframe[src*="open.spotify.com"]')).toBeNull()
  })

  it('shows consent disclosure text', () => {
    const { getByText } = renderEmbed(<SpotifyEmbed uri={ARTIST_URI} />)
    expect(getByText(/your ip address may be sent to spotify/i)).toBeInTheDocument()
  })

  it('placeholder has role=button and aria-label', () => {
    const { getByRole, queryByRole } = renderEmbed(<SpotifyEmbed uri={ARTIST_URI} />)
    const btn = getByRole('button', { name: /Load Spotify Player/i })
    expect(btn).toBeInTheDocument()
    expect(queryByRole('slider')).not.toBeInTheDocument()
  })

  it('placeholder is keyboard-focusable (tabIndex=0)', () => {
    const { getByRole } = renderEmbed(<SpotifyEmbed uri={ARTIST_URI} />)
    const btn = getByRole('button', { name: /Load Spotify Player/i })
    expect(btn).toHaveAttribute('tabindex', '0')
  })

  it('fits artist embeds to their compact player height, including the consent gate', async () => {
    const { container, getByRole } = renderEmbed(<SpotifyEmbed uri={ARTIST_URI} />)
    expect(container.firstElementChild).toHaveStyle({ height: '152px' })

    const gate = getByRole('button', { name: /Load Spotify Player/i })
    expect(gate).toHaveClass('gap-2')
    await act(async () => {
      fireEvent.click(gate)
    })
    await waitFor(() => {
      const iframe = document.querySelector('iframe[src*="open.spotify.com/embed/"]')
      expect(iframe).toHaveAttribute('height', '152')
      expect(iframe).toHaveStyle({ height: '152px' })
    })
  })

  it('preserves full-height embeds for albums', () => {
    const { container } = renderEmbed(<SpotifyEmbed uri="spotify:album:6TElDMiCO7UEj3G0S2B8X0" />)
    expect(container.firstElementChild).toHaveStyle({ height: '352px' })
  })

  it('mounts a static embed iframe after the consent click, without the iframe-api script', async () => {
    const { getByRole } = renderEmbed(<SpotifyEmbed uri={ARTIST_URI} />)

    await act(async () => {
      fireEvent.click(getByRole('button', { name: /Load Spotify Player/i }))
    })

    await waitFor(() => {
      const iframe = document.querySelector('iframe[src*="open.spotify.com/embed/"]')
      expect(iframe).toHaveAttribute('src', EMBED_SRC)
    })
    expect(document.querySelector('script[src*="iframe-api"]')).toBeNull()
  })

  it('mounts the iframe after Enter keydown on the consent button', async () => {
    const { getByRole } = renderEmbed(<SpotifyEmbed uri={ARTIST_URI} />)

    await act(async () => {
      fireEvent.keyDown(getByRole('button', { name: /Load Spotify Player/i }), { key: 'Enter' })
    })

    await waitFor(() => {
      expect(document.querySelector('iframe[src*="open.spotify.com/embed/"]')).not.toBeNull()
    })
  })

  it('mounts the iframe after Space keydown on the consent button', async () => {
    const { getByRole } = renderEmbed(<SpotifyEmbed uri={ARTIST_URI} />)

    await act(async () => {
      fireEvent.keyDown(getByRole('button', { name: /Load Spotify Player/i }), { key: ' ' })
    })

    await waitFor(() => {
      expect(document.querySelector('iframe[src*="open.spotify.com/embed/"]')).not.toBeNull()
    })
  })

  it('shows error state when the URI cannot be turned into an embed URL', async () => {
    const { getByRole } = renderEmbed(<SpotifyEmbed uri="not-a-spotify-uri" />)

    await act(async () => {
      fireEvent.click(getByRole('button', { name: /Load Spotify Player/i }))
    })

    await waitFor(() => {
      expect(getByRole('alert')).toBeInTheDocument()
    })
  })

  it('retry button resets the error state back to the consent placeholder', async () => {
    const { getByRole, getByText } = renderEmbed(<SpotifyEmbed uri="not-a-spotify-uri" />)

    await act(async () => {
      fireEvent.click(getByRole('button', { name: /Load Spotify Player/i }))
    })

    await waitFor(() => expect(getByRole('alert')).toBeInTheDocument())

    await act(async () => {
      fireEvent.click(getByText(/Try again/i))
    })

    await waitFor(() => {
      expect(getByRole('button', { name: /Load Spotify Player/i })).toBeInTheDocument()
    })
  })
})
