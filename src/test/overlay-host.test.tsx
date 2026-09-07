import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { OverlayProvider } from '@/contexts/OverlayContext'
import { OverlayHost } from '@/app/_components/public/OverlayHost'
import { MediaArchiveCard } from '@/app/_components/public/MediaExplorer'
import { SectionWrapper } from '@/app/_components/public/SectionWrapper'

vi.mock('@/components/OverlayTransition', () => ({
  useOverlayTransition: () => ({ trigger: () => {}, element: null }),
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
    expect(screen.getByText(/initializing filesystem/i)).toBeInTheDocument()
    expect(container.querySelector('#media')?.textContent).not.toMatch(/MEDIA EXPLORER/i)
  })
})
