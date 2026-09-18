import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GigOverlayContent } from '@/components/overlays/GigOverlayContent'
import { mapGigRowToOverlayGig } from '@/lib/gig-public-mapper'

describe('GigOverlayContent', () => {
  it('shows the event name large and the club in the location line', () => {
    const data = mapGigRowToOverlayGig({
      id: 'gig-samhain',
      title: 'P8',
      venue: 'P8',
      city: 'Schauenburgstraße 5, 76135 Karlsruhe',
      country: 'Germany',
      event_date: '2026-10-31',
      ticket_url: null,
      festival_name: 'Samhain Ritual',
      gig_type: 'dj',
    })

    render(<GigOverlayContent data={data} artistName="NEUROKLAST" />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Samhain Ritual')
    expect(heading).not.toHaveTextContent(/^P8$/)
    expect(screen.getByText(/P8/)).toBeInTheDocument()
    expect(screen.getByText(/Karlsruhe/)).toBeInTheDocument()
    expect(screen.getByText('DJ set')).toBeInTheDocument()
  })
})
