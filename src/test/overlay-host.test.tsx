import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { OverlayProvider } from '@/contexts/OverlayContext'
import { OverlayHost } from '@/app/_components/public/OverlayHost'
import { MediaArchiveCard } from '@/app/_components/public/MediaExplorer'
import { SectionWrapper } from '@/app/_components/public/SectionWrapper'
import { NewsSection } from '@/app/_components/public/NewsSection'
import { BioSection } from '@/app/_components/public/BioSection'

vi.mock('@/components/OverlayTransition', () => ({
  useOverlayTransition: () => ({ trigger: () => {}, element: null }),
}))

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
                link: null,
                coverUrl: null,
                publishedAt: '2026-01-18',
              },
            ]}
          />
          <OverlayHost />
        </LocaleProvider>
      </OverlayProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /open let rage commence/i }))
    expect(screen.getByTestId('overlay-type')).toHaveTextContent('news')
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
