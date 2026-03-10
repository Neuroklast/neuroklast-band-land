import type { BiographySectionSlotProps } from '@/lib/types'

export default function BiographySection({
  bioText,
  bandMembers,
  bandName,
}: BiographySectionSlotProps) {
  return (
    <section id="biography" className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="text-4xl font-bold font-mono text-foreground mb-12 tracking-tight">
        {'>'} ENTITY_PROFILE
      </h2>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="signal-static-transmission-box">
            <div className="font-mono text-sm text-accent mb-4">
              [TRANSMISSION_LOG]
            </div>

            <div className="space-y-4 font-mono text-sm text-muted-foreground whitespace-pre-wrap">
              {bioText || 'No bio provided.'}
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="text-muted-foreground">ENTITY_NAME</div>
              <div className="text-accent">{bandName || 'UNKNOWN'}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="signal-static-card aspect-square bg-muted border border-border relative overflow-hidden group">
            <div className="signal-static-card-corner signal-static-card-corner-tl"></div>
            <div className="signal-static-card-corner signal-static-card-corner-tr"></div>
            <div className="signal-static-card-corner signal-static-card-corner-bl"></div>
            <div className="signal-static-card-corner signal-static-card-corner-br"></div>
            <div className="signal-static-scanlines"></div>
            <div className="signal-static-noise"></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-mono font-bold text-muted-foreground mb-4">
                  [{bandName ? bandName.substring(0, 2).toUpperCase() : 'NK'}]
                </div>
                <div className="font-mono text-xs text-accent">
                  IMAGE_DATA_PLACEHOLDER
                </div>
              </div>
            </div>
          </div>

          {bandMembers && bandMembers.length > 0 && (
            <div className="signal-static-transmission-box">
              <div className="font-mono text-sm text-accent mb-4">
                [PERSONNEL_MANIFEST]
              </div>

              <div className="grid grid-cols-2 gap-4">
                {bandMembers.map((member, index) => (
                  <div key={index} className="border border-border bg-card p-4 text-center">
                    <div className="text-lg font-mono font-bold text-foreground mb-1 break-words">
                      {member.name}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground break-words">
                      {member.role || 'OPERATIVE'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
