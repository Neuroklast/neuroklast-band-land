export default function GigsSection() {
  const gigs = [
    {
      venue: '{{GIG_1_VENUE}}',
      location: '{{GIG_1_LOCATION}}',
      date: '{{GIG_1_DATE}}',
      time: '{{GIG_1_TIME}}',
      status: 'UPCOMING',
      ticketUrl: '{{GIG_1_TICKET_URL}}'
    },
    {
      venue: '{{GIG_2_VENUE}}',
      location: '{{GIG_2_LOCATION}}',
      date: '{{GIG_2_DATE}}',
      time: '{{GIG_2_TIME}}',
      status: 'UPCOMING',
      ticketUrl: '{{GIG_2_TICKET_URL}}'
    },
    {
      venue: '{{GIG_3_VENUE}}',
      location: '{{GIG_3_LOCATION}}',
      date: '{{GIG_3_DATE}}',
      time: '{{GIG_3_TIME}}',
      status: 'SOLD_OUT',
      ticketUrl: '{{GIG_3_TICKET_URL}}'
    },
    {
      venue: '{{GIG_4_VENUE}}',
      location: '{{GIG_4_LOCATION}}',
      date: '{{GIG_4_DATE}}',
      time: '{{GIG_4_TIME}}',
      status: 'COMPLETED',
      ticketUrl: '{{GIG_4_TICKET_URL}}'
    }
  ]

  return (
    <section id="gigs" className="max-w-6xl mx-auto px-6 py-24">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl font-bold font-mono text-foreground tracking-tight">
          {'>'} TRANSMISSION_SCHEDULE
        </h2>
        <div className="font-mono text-xs text-muted-foreground">
          <span className="text-accent signal-static-signal-indicator">◉</span> LIVE_EVENTS
        </div>
      </div>

      <div className="space-y-4">
        {gigs.map((gig, index) => (
          <div 
            key={index}
            className="signal-static-card relative bg-card border border-border group hover:border-accent transition-all duration-300"
          >
            <div className="signal-static-card-noise"></div>
            <div className="signal-static-card-corner signal-static-card-corner-tl"></div>
            <div className="signal-static-card-corner signal-static-card-corner-tr"></div>
            <div className="signal-static-card-corner signal-static-card-corner-bl"></div>
            <div className="signal-static-card-corner signal-static-card-corner-br"></div>

            <div className="relative z-10 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs text-accent border border-accent px-2 py-1">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-xl font-mono font-bold text-foreground tracking-tight">
                      {gig.venue}
                    </h3>
                  </div>

                  <div className="font-mono text-sm text-muted-foreground">
                    {'>'} LOCATION: <span className="text-foreground">{gig.location}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-accent">◆</span>
                      <span>DATE: {gig.date}</span>
                    </div>
                    <div className="text-border">|</div>
                    <div className="flex items-center gap-2">
                      <span className="text-accent">◆</span>
                      <span>TIME: {gig.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div 
                    className={`font-mono text-xs px-3 py-1 border ${
                      gig.status === 'UPCOMING' 
                        ? 'border-accent text-accent bg-accent/10' 
                        : gig.status === 'SOLD_OUT'
                        ? 'border-destructive text-destructive bg-destructive/10'
                        : 'border-border text-muted-foreground bg-muted'
                    }`}
                  >
                    [{gig.status}]
                  </div>

                  {gig.status === 'UPCOMING' && (
                    <a
                      href={gig.ticketUrl}
                      className="signal-static-nav-link font-mono text-sm px-6 py-2 border border-border bg-background hover:bg-accent hover:text-background hover:border-accent transition-all duration-300"
                    >
                      {'>'} GET_TICKETS
                    </a>
                  )}

                  {gig.status === 'SOLD_OUT' && (
                    <div className="font-mono text-sm px-6 py-2 border border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed">
                      {'>'} SOLD_OUT
                    </div>
                  )}

                  {gig.status === 'COMPLETED' && (
                    <div className="font-mono text-xs text-muted-foreground line-through">
                      [TRANSMISSION_COMPLETE]
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="inline-block border border-border bg-card px-6 py-3 font-mono text-xs text-muted-foreground">
          <span className="text-accent">◆</span> MORE COORDINATES TO BE ANNOUNCED
        </div>
      </div>
    </section>
  )
}
