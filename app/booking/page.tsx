import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { JsonLd } from '@/app/_components/public/JsonLd'
import { getSiteOrigin } from '@/lib/og-share'
import { absoluteUrl, buildBreadcrumbSchema } from '@/lib/structured-data'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Booking & Press',
  description: 'Book NEUROKLAST for live performances and DJ sets. Access official press materials and event information.',
  alternates: { canonical: '/booking' },
}

const cardClass = 'nk-os-frame flex flex-col gap-4 p-5 sm:p-6'
const actionClass = 'nk-os-btn inline-flex min-h-[44px] w-fit items-center justify-center'

export default function BookingPage() {
  const origin = getSiteOrigin()
  return (
    <LegalPageShell>
      <JsonLd data={buildBreadcrumbSchema([
        { name: 'Home', url: absoluteUrl(origin, '/') },
        { name: 'Booking & Press', url: absoluteUrl(origin, '/booking') },
      ])} />
      <div className="relative mx-auto w-full max-w-6xl px-card pb-section pt-[calc(var(--nk-nav-h)+1.5rem)]"
        style={{ zIndex: 'var(--z-content)' }}>
        <header className="mb-10 max-w-3xl">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">// NEUROKLAST.BOOKING</p>
          <h1 className="font-mono text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
            Booking & Press
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            For live bookings, DJ appearances, press inquiries and official media requests.
            Get in touch with the details below so we can respond to your specific event.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <section className={cardClass} aria-labelledby="booking-live-title">
            <h2 id="booking-live-title" className="font-mono text-xl font-bold uppercase text-foreground">Live & DJ bookings</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              NEUROKLAST offers live performances and DJ sets. These are distinct formats.
              Please specify which format you are interested in.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Include your event date, city, venue, expected set length and the best way to reach you.
              Please ask about stage requirements and a technical rider in your inquiry.
            </p>
            <Link href="/#contact" className={actionClass}>Send a booking inquiry</Link>
          </section>
          <section className={cardClass} aria-labelledby="booking-press-title">
            <h2 id="booking-press-title" className="font-mono text-xl font-bold uppercase text-foreground">Press resources</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Find available press photos, logos and electronic press kit documents in the media archive.
              Contact us to confirm usage rights and photographer credits before publication.
            </p>
            <div className="mt-auto flex flex-wrap gap-3">
              <Link href="/media" className={actionClass}>Open media archive</Link>
              <Link href="/releases" className={actionClass}>Discography</Link>
            </div>
          </section>
        </div>
        <p className="mt-8 font-mono text-xs text-muted-foreground">
          Event dates and public announcements are listed separately in the <Link href="/gigs" className="text-primary underline underline-offset-4">events archive</Link>.
        </p>
      </div>
    </LegalPageShell>
  )
}
