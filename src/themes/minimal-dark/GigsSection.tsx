import { useState, useMemo } from 'react'
import type { GigsSectionSlotProps, Gig } from '@/lib/types'
import { Calendar, MapPin, Clock } from 'lucide-react'

export default function GigsSection({ gigs, sectionLabels }: GigsSectionSlotProps) {
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL')

  const filteredGigs = useMemo(() => {
    const now = new Date()
    return gigs.filter((gig) => {
      const gigDate = new Date(gig.date)
      if (filter === 'UPCOMING') return gigDate >= now
      if (filter === 'PAST') return gigDate < now
      return true
    })
  }, [gigs, filter])

  const getStatusDisplay = (gig: Gig) => {
    if (gig.status === 'soldout') return <span className="text-accent animate-pulse">[SOLD_OUT]</span>
    if (gig.status === 'cancelled') return <span className="text-destructive line-through opacity-50">[TERMINATED]</span>
    if (new Date(gig.date) < new Date()) return <span className="text-muted-foreground">[ARCHIVED]</span>
    return <span className="text-primary">[ACTIVE]</span>
  }

  return (
    <section id="gigs" className="max-w-6xl mx-auto px-6 py-24 relative">
      <div className="absolute top-0 left-6 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent opacity-50"></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 pl-8">
        <div>
          <h2 className="text-4xl font-bold font-mono text-foreground tracking-tight uppercase">
            {'>'} {sectionLabels?.gigs || 'LIVE_OPERATIONS'}
          </h2>
          <p className="font-mono text-sm text-muted-foreground mt-2 uppercase">
            [SYS.PROTOCOL: ENGAGEMENT_COORDINATES]
          </p>
        </div>

        <div className="flex gap-4 font-mono text-sm">
          {(['ALL', 'UPCOMING', 'PAST'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 border transition-all duration-300 uppercase ${
                filter === f
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground'
              }`}
            >
              [{f}]
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pl-8">
        {filteredGigs.length > 0 ? (
          filteredGigs.map((gig) => (
            <div
              key={gig.id}
              className="group relative border border-border bg-card/50 hover:bg-card hover:border-accent/50 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>

              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3 font-mono">
                    <Calendar className="w-4 h-4 text-accent opacity-70" />
                    <div>
                      <div className="text-foreground font-bold">{new Date(gig.date).toLocaleDateString()}</div>
                      {gig.allDay ? (
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> [ALL_DAY_EVENT]
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground uppercase flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {new Date(gig.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="font-mono flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-accent opacity-70" />
                    <div>
                      <div className="text-foreground font-bold uppercase">{gig.venue}</div>
                      <div className="text-xs text-muted-foreground uppercase mt-1">{gig.location}</div>
                    </div>
                  </div>

                  <div className="font-mono flex items-center md:justify-end">
                    <div className="text-sm font-bold uppercase tracking-wider">
                      {getStatusDisplay(gig)}
                    </div>
                  </div>
                </div>

                {gig.ticketUrl && gig.status !== 'cancelled' && new Date(gig.date) >= new Date() && (
                  <a
                    href={gig.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm px-6 py-3 border border-accent text-accent hover:bg-accent hover:text-background transition-colors uppercase whitespace-nowrap"
                  >
                    [ACQUIRE_ACCESS]
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="border border-border border-dashed p-12 text-center">
            <div className="font-mono text-muted-foreground uppercase">
              [NO_OPERATIONS_FOUND_IN_CURRENT_SECTOR]
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
