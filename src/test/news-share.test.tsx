import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NewsBodyText } from '@/components/news/NewsBodyText'
import { NewsExternalLink } from '@/components/news/NewsExternalLink'
import { getNewsArticleUrl, NewsShareActions } from '@/components/news/NewsShareActions'

afterEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
})

describe('news sharing', () => {
  it('builds stable canonical links and encodes slugs', () => {
    expect(getNewsArticleUrl('beta-release')).toBe('https://neuroklast.net/news/beta-release')
    expect(getNewsArticleUrl('a b')).toBe('https://neuroklast.net/news/a%20b')
  })

  it('copies the canonical article URL', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<NewsShareActions slug="new-beta" title="NEUROMETER" variant="compact" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy article link' }))
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('https://neuroklast.net/news/new-beta')
      expect(screen.getByText('Copied')).toBeInTheDocument()
    })
  })

  it('shares the article with the native share API', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    render(<NewsShareActions slug="new-beta" title="NEUROMETER" excerpt="Public beta" />)
    fireEvent.click(screen.getByRole('button', { name: 'Share article' }))
    await waitFor(() => {
      expect(share).toHaveBeenCalledWith({
        title: 'NEUROMETER',
        text: 'Public beta',
        url: 'https://neuroklast.net/news/new-beta',
      })
    })
  })

  it('exposes outbound social share targets', () => {
    render(<NewsShareActions slug="new-beta" title="NEUROMETER" />)
    for (const service of ['WhatsApp', 'Facebook', 'X', 'Reddit']) {
      const link = screen.getByRole('link', { name: 'Share on ' + service })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link.getAttribute('href')).toContain(encodeURIComponent(getNewsArticleUrl('new-beta')))
    }
  })

  it('renders the external destination as a clickable, safe link', () => {
    render(<NewsExternalLink href="https://www.example.com/download?platform=windows" compact />)
    const link = screen.getByRole('link', { name: /open external link on example.com/i })
    expect(link).toHaveAttribute('href', 'https://www.example.com/download?platform=windows')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText('example.com')).toBeInTheDocument()
  })

  it('never renders unsafe external destinations', () => {
    const { container } = render(<NewsExternalLink href="javascript:alert(1)" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders safe plain-text body links without swallowing punctuation', () => {
    render(<p><NewsBodyText text="Download: https://example.com/download. This is safe." /></p>)
    const link = screen.getByRole('link', { name: 'https://example.com/download' })
    expect(link).toHaveAttribute('href', 'https://example.com/download')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText(/This is safe/)).toBeInTheDocument()
  })
})
