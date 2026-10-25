import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { OverlayProvider, useOverlay } from '@/contexts/OverlayContext'

const post = {
  id: 'news-one',
  slug: 'neurometer-beta-release',
  title: 'NEUROMETER BETA RELEASE',
  excerpt: 'Free Windows beta',
  body: 'Download now',
  link: 'https://example.org/beta',
  coverUrl: null,
  publishedAt: '2026-10-25',
}

function Demo() {
  const { overlay, openOverlay, closeOverlay } = useOverlay()
  return (
    <>
      <button type="button" onClick={() => openOverlay({ type: 'news', data: post })}>
        Open news
      </button>
      <button type="button" onClick={() => openOverlay({ type: 'member', data: {
        id: 'm1', name: 'Guest', role: 'Musician', bio: 'A guest', photoUrl: null,
      } })}>
        Open member
      </button>
      <button type="button" onClick={closeOverlay}>Close</button>
      <p data-testid="overlay">{overlay?.type ?? 'closed'}</p>
    </>
  )
}

beforeEach(() => {
  window.history.replaceState({}, '', '/?theme=classic#news')
  document.title = 'Neuroklast'
})

afterEach(() => {
  window.history.replaceState({}, '', '/')
  document.title = 'Neuroklast'
})

describe('news overlay browser navigation', () => {
  it('sets the address bar to the real article URL without leaving the overlay', () => {
    render(<OverlayProvider><Demo /></OverlayProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Open news' }))

    expect(window.location.pathname).toBe('/news/neurometer-beta-release')
    expect(window.location.href).toContain('/news/neurometer-beta-release')
    expect(screen.getByTestId('overlay')).toHaveTextContent('news')
    expect(document.title).toBe('NEUROMETER BETA RELEASE | Neuroklast')
  })

  it('restores the exact previous URL on close and supports browser Forward', async () => {
    render(<OverlayProvider><Demo /></OverlayProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Open news' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(window.location.href).toContain('/?theme=classic#news'))

    expect(screen.getByTestId('overlay')).toHaveTextContent('closed')
    expect(document.title).toBe('Neuroklast')

    window.history.forward()
    await waitFor(() => expect(window.location.pathname).toBe('/news/neurometer-beta-release'))
    await waitFor(() => expect(screen.getByTestId('overlay')).toHaveTextContent('news'))
  })

  it('does not change the address for unrelated overlays', () => {
    render(<OverlayProvider><Demo /></OverlayProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Open member' }))

    expect(window.location.pathname).toBe('/')
    expect(window.location.search).toBe('?theme=classic')
    expect(screen.getByTestId('overlay')).toHaveTextContent('member')
  })
})
