import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { OverlayProvider } from '@/contexts/OverlayContext'
import { OverlayHost } from '@/app/_components/public/OverlayHost'
import { MediaArchiveCard } from '@/app/_components/public/MediaExplorer'
import { SectionWrapper } from '@/app/_components/public/SectionWrapper'
import { NewsSection } from '@/app/_components/public/NewsSection'
import { BioSection } from '@/app/_components/public/BioSection'

vi.mock('@/components/CyberpunkOverlay', () => ({
  default: ({ overlay }: { overlay: { type?: string } | null }) => (
    <div data-testid="overlay-type">{overlay?.type ?? 'none'}</div>
  ),
}))

describe('overlay host', () => {
  it('opens the media explorer outside the section stacking context', () => {
    const { container } = render(
      <OverlayProvider>
        <LocaleProvider>
          <SectionWrapper id="media">
            <MediaArchiveCard
              items={[
                {
                  id: '1',
                  title: 'Press shot',
                  description: null,
                  category: 'photo',
                  fileUrl: 'https://example.com/a.jpg',
                  fileMime: 'image/jpeg',
                  fileSizeBytes: 12,
                  originalFilename: 'a.jpg',
                  displayOrder: 0,
                },
              ]}
            />
          </SectionWrapper>
          <OverlayHost />
        </LocaleProvider>
      </OverlayProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /open archive/i }))
    expect(screen.getByTestId('overlay-type')).toHaveTextContent('explorer')
    expect(container.querySelector('#media')?.textContent).not.toMatch(/MEDIA EXPLORER/i)
  })

  it('opens news cards in the shared cyberpunk overlay', () => {
    render(
      <OverlayProvider>
        <LocaleProvider>
          <NewsSection
            posts={[
              {
                id: 'n1',
                title: 'LET RAGE COMMENCE',
                slug: 'let-rage-commence',
                excerpt: 'New frontwoman',
                body: 'New frontwoman',
                link: 'https://example.org/press/article',
                coverUrl: null,
                publishedAt: '2026-01-18',
              },
            ]}
          />
          <OverlayHost />
        </LocaleProvider>
      </OverlayProvider>,
    )

    const externalLink = screen.getByRole('link', { name: /open external link on example.org/i })
    expect(externalLink).toHaveAttribute('href', 'https://example.org/press/article')
    expect(externalLink).toHaveAttribute('target', '_blank')
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer')

    fireEvent.click(screen.getByRole('button', { name: /open let rage commence/i }))
    expect(screen.getByTestId('overlay-type')).toHaveTextContent('news')
  })

  it('limits homepage news to one wide lead and three recent entries', () => {
    const posts = Array.from({ length: 6 }, (_, index) => ({
      id: `news-${index}`,
      title: `News ${index}`,
      slug: `news-${index}`,
      excerpt: 'Announcement',
      body: 'Article',
      link: null,
      coverUrl: null,
      publishedAt: `2026-10-${String(index + 10).padStart(2, '0')}T12:00:00Z`,
    }))
    const { container } = render(
      <OverlayProvider>
        <LocaleProvider>
          <NewsSection posts={posts} featuredId="news-0" />
        </LocaleProvider>
      </OverlayProvider>,
    )

    expect(screen.getAllByRole('button', { name: /^open news \d/i })).toHaveLength(4)
    expect(screen.getByText('FEATURED // NEWS')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open News 0' })).toHaveClass('md:flex-row')
    expect(screen.getByRole('link', { name: /all news \/ archive/i })).toHaveAttribute('href', '/news')
    expect(container.querySelectorAll('article')).toHaveLength(4)
  })

  it('opens members in the shared cyberpunk overlay', () => {
    render(
      <OverlayProvider>
        <LocaleProvider>
          <BioSection
            content="Story"
            members={[{ id: 'm1', name: 'Kay', role: 'Producer', bio: 'Founder', photoUrl: null }]}
          />
          <OverlayHost />
        </LocaleProvider>
      </OverlayProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /open kay/i }))
    expect(screen.getByTestId('overlay-type')).toHaveTextContent('member')
  })
})
