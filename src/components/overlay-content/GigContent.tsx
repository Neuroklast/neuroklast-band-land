import { motion } from 'framer-motion'
import { Ticket, MapPin, CalendarBlank, FacebookLogo, InstagramLogo, Link, ShareNetwork, Clock, CalendarPlus, type Icon as PhosphorIcon } from '@phosphor-icons/react'
import ProgressiveImage from '@/components/ProgressiveImage'
import { format, differenceInDays, differenceInHours, differenceInMinutes, isPast } from 'date-fns'
import { useEffect, useState } from 'react'
import type { Gig } from '@/lib/types'

/** Default event duration used for calendar link generation (3 hours) */
const GIG_CALENDAR_DURATION_MS = 3 * 60 * 60 * 1000

/** Gig detail content — enhanced with countdown, links, share, calendar */
export default function GigContent({ gig }: { gig: Gig }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  let dateStr = gig.date
  let timeStr = ''
  let gigDate: Date | null = null
  try {
    gigDate = new Date(gig.date)
    dateStr = format(gigDate, 'EEEE, MMMM d, yyyy')
    if (!gig.allDay) timeStr = format(gigDate, 'HH:mm')
  } catch {
    // keep raw date string
  }

  const isFuture = gigDate ? !isPast(gigDate) : false

  const getCountdown = () => {
    if (!gigDate || !isFuture) return null
    const days = differenceInDays(gigDate, now)
    const hours = differenceInHours(gigDate, now) % 24
    const minutes = differenceInMinutes(gigDate, now) % 60
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const countdown = getCountdown()

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([gig.venue, gig.location].filter(Boolean).join(', '))}`

  const getGoogleCalendarUrl = () => {
    if (!gigDate) return null
    const start = format(gigDate, "yyyyMMdd'T'HHmmss")
    const end = format(new Date(gigDate.getTime() + GIG_CALENDAR_DURATION_MS), "yyyyMMdd'T'HHmmss")
    const title = encodeURIComponent(`${gig.venue} — ${gig.location}`)
    const details = encodeURIComponent(gig.description || '')
    const location = encodeURIComponent([gig.venue, gig.location].filter(Boolean).join(', '))
    return `https://calendar.google.com/calendar/r/eventedit?text=${title}&dates=${start}/${end}&details=${details}&location=${location}`
  }

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#gigs/${gig.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: gig.venue, text: `${gig.venue} — ${gig.location}`, url })
      } else {
        await navigator.clipboard.writeText(url)
      }
    } catch {
      // ignore
    }
  }

  const eventLinks = [
    gig.eventLinks?.facebook && { label: 'Facebook Event', url: gig.eventLinks.facebook, Icon: FacebookLogo },
    gig.eventLinks?.instagram && { label: 'Instagram', url: gig.eventLinks.instagram, Icon: InstagramLogo },
    gig.eventLinks?.residentAdvisor && { label: 'Resident Advisor', url: gig.eventLinks.residentAdvisor, Icon: Link },
    gig.eventLinks?.other && { label: 'Event Link', url: gig.eventLinks.other, Icon: Link },
  ].filter(Boolean) as { label: string; url: string; Icon: PhosphorIcon }[]

  return (
    <motion.div
      className="font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Two-column layout on desktop */}
      <div className="flex flex-col md:flex-row">
        {/* LEFT: Photo + event links */}
        {(gig.photo || eventLinks.length > 0) && (
          <div className="md:w-2/5 p-4 md:p-6 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-primary/20">
            {gig.photo && (
              <div className="relative w-full aspect-square overflow-hidden border border-primary/40 bg-black">
                <ProgressiveImage src={gig.photo} alt={gig.venue} className="w-full h-full object-cover" />
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/60" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/60" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60" />
              </div>
            )}
            {eventLinks.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-primary/50 tracking-wider">// EVENT.LINKS</p>
                {eventLinks.map(({ label, url, Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-primary/20 bg-primary/5 hover:bg-primary/15 hover:border-primary/40 transition-colors text-sm text-foreground/80 hover:text-foreground"
                  >
                    <Icon size={14} className="text-primary/60 flex-shrink-0" />
                    <span className="text-[11px] tracking-wide">{label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RIGHT: All text details, countdown, actions */}
        <div className="flex-1 p-4 md:p-6 space-y-4">
          {/* Header: venue + status badge */}
          <div>
            <p className="text-[10px] text-primary/50 tracking-wider mb-2">// EVENT.DATA</p>
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">{gig.venue}</h2>
              {gig.status && (
                <span className={`self-center text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                  gig.status === 'soldout' ? 'bg-status-warning-em/20 text-status-warning' :
                  gig.status === 'cancelled' ? 'bg-status-error-em/20 text-status-error' :
                  gig.status === 'announced' ? 'bg-primary/20 text-primary' :
                  'bg-status-success-em/20 text-status-success'
                }`}>
                  {gig.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={14} className="text-primary/60 flex-shrink-0" />
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors underline underline-offset-2 decoration-primary/30 hover:decoration-primary"
              >
                {gig.location}
              </a>
            </div>
          </div>

          {/* Date + time + type */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
              <CalendarBlank size={14} className="text-primary/60 flex-shrink-0" />
              <span className="text-foreground">{dateStr}</span>
              {timeStr && <span className="text-primary/60">{timeStr}</span>}
            </div>
            {gig.gigType && (
              <span className={`w-fit text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${gig.gigType === 'concert' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                {gig.gigType === 'concert' ? 'CONCERT' : 'DJ SET'}
              </span>
            )}
          </div>

          {/* Countdown — only if event is in the future */}
          {countdown && (
            <div className="border border-primary/30 bg-primary/5 px-3 py-2 flex items-center gap-2">
              <Clock size={14} className="text-primary/60 flex-shrink-0" />
              <span className="text-[10px] text-primary/50 uppercase tracking-wider">Starts in</span>
              <span className="font-bold text-primary text-sm">{countdown}</span>
            </div>
          )}

          {/* Description */}
          {gig.description && (
            <div>
              <p className="text-[10px] text-primary/50 tracking-wider mb-1">// DESCRIPTION</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{gig.description}</p>
            </div>
          )}

          {/* Supporting artists */}
          {gig.supportingArtists && gig.supportingArtists.length > 0 && (
            <div>
              <p className="text-[10px] text-primary/50 tracking-wider mb-1">// LINEUP</p>
              <ul className="space-y-1">
                {gig.supportingArtists.map((artist, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    <span className="text-primary/40 mr-2">{'>'}</span>{artist}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {gig.ticketUrl && (
              <a
                href={gig.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-accent transition-colors font-mono text-xs tracking-wider uppercase"
              >
                <Ticket size={14} />
                GET TICKETS
              </a>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary/80 hover:bg-primary/10 hover:text-primary transition-colors font-mono text-xs tracking-wider uppercase"
            >
              <MapPin size={14} />
              MAP
            </a>
            {getGoogleCalendarUrl() && (
              <a
                href={getGoogleCalendarUrl()!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary/80 hover:bg-primary/10 hover:text-primary transition-colors font-mono text-xs tracking-wider uppercase"
              >
                <CalendarPlus size={14} />
                CALENDAR
              </a>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary/80 hover:bg-primary/10 hover:text-primary transition-colors font-mono text-xs tracking-wider uppercase"
            >
              <ShareNetwork size={14} />
              SHARE
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
