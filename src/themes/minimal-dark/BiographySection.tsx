import type { BiographySectionSlotProps, Member } from '@/lib/types'

export default function BiographySection({ biography, onMemberClick, sectionLabels }: BiographySectionSlotProps) {
  return (
    <section id="biography" className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="text-4xl font-bold font-mono text-foreground mb-12 tracking-tight uppercase">
        {'>'} {sectionLabels?.biography || 'ENTITY_PROFILE'}
      </h2>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="signal-static-transmission-box">
            <div className="font-mono text-sm text-accent mb-4 uppercase">
              [TRANSMISSION_LOG]
            </div>

            <div className="space-y-4 font-mono text-sm text-muted-foreground whitespace-pre-wrap">
              {biography?.story?.split('\n').map((paragraph, index) => (
                <p key={index} className="uppercase">
                  {'>'} {paragraph}
                </p>
              )) || (
                <>
                  <p className="uppercase">{'>'} NEUROKLAST emerged from the underground techno scene in Munich, Germany, channeling raw industrial soundscapes and hypnotic rhythms into dark, relentless sets.</p>
                  <p className="uppercase">{'>'} With influences ranging from Berlin's warehouse culture to experimental noise, the collective has carved out a distinct sonic identity that resonates on dance floors across Europe.</p>
                  <p className="uppercase">{'>'} Their performances are immersive experiences - a fusion of pounding kicks, distorted synths, and glitchy textures that transport listeners into a dystopian audio landscape.</p>
                </>
              )}
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between font-mono text-xs uppercase">
              <div className="text-muted-foreground">ESTABLISHED</div>
              <div className="text-accent">{biography?.founded || '2019'}</div>
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

            {biography?.photos && biography.photos.length > 0 ? (
              <img
                src={biography.photos[0]}
                alt="Entity Profile"
                className="absolute inset-0 w-full h-full object-cover filter grayscale mix-blend-luminosity"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-mono font-bold text-muted-foreground mb-4">
                    [NK]
                  </div>
                  <div className="font-mono text-xs text-accent uppercase">
                    IMAGE_DATA_PLACEHOLDER
                  </div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-accent/10 mix-blend-overlay"></div>
          </div>

          {biography?.members && biography.members.length > 0 && (
            <div className="signal-static-transmission-box">
              <div className="font-mono text-sm text-accent mb-4 uppercase">
                [CORE_MODULES]
              </div>

              <div className="grid grid-cols-2 gap-4">
                {biography.members.map((member: string | Member, index: number) => {
                  const memberData = typeof member === 'string' ? { name: member } : member
                  return (
                    <div
                      key={index}
                      onClick={() => onMemberClick && typeof member !== 'string' && onMemberClick(member)}
                      className="border border-border bg-card p-4 text-center cursor-pointer hover:border-accent transition-colors group"
                    >
                      <div className="text-sm font-mono font-bold text-foreground mb-1 uppercase group-hover:text-accent transition-colors line-clamp-1">
                        {memberData.name}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground uppercase line-clamp-1">
                        {memberData.statusValue || 'OPERATIVE'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
