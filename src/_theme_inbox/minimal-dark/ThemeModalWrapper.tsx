export default function BiographySection() {
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
            
            <div className="space-y-4 font-mono text-sm text-muted-foreground">
              <p>
                {'>'} NEUROKLAST emerged from the underground techno scene in Munich, Germany, channeling raw industrial soundscapes and hypnotic rhythms into dark, relentless sets.
              </p>
              <p>
                {'>'} With influences ranging from Berlin's warehouse culture to experimental noise, the collective has carved out a distinct sonic identity that resonates on dance floors across Europe.
              </p>
              <p>
                {'>'} Their performances are immersive experiences - a fusion of pounding kicks, distorted synths, and glitchy textures that transport listeners into a dystopian audio landscape.
              </p>
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="text-muted-foreground">ESTABLISHED</div>
              <div className="text-accent">2019</div>
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="text-muted-foreground">ORIGIN</div>
              <div className="text-accent">MUNICH, DE</div>
            </div>
          </div>

          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="text-muted-foreground">GENRE</div>
              <div className="text-accent">DARK_TECHNO / INDUSTRIAL</div>
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
                  [NK]
                </div>
                <div className="font-mono text-xs text-accent">
                  IMAGE_DATA_PLACEHOLDER
                </div>
              </div>
            </div>
          </div>

          <div className="signal-static-transmission-box">
            <div className="font-mono text-sm text-accent mb-4">
              [CORE_METRICS]
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border bg-card p-4 text-center">
                <div className="text-2xl font-mono font-bold text-foreground mb-1">
                  50+
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  LIVE_SETS
                </div>
              </div>
              
              <div className="border border-border bg-card p-4 text-center">
                <div className="text-2xl font-mono font-bold text-foreground mb-1">
                  15
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  RELEASES
                </div>
              </div>
              
              <div className="border border-border bg-card p-4 text-center">
                <div className="text-2xl font-mono font-bold text-foreground mb-1">
                  8
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  COUNTRIES
                </div>
              </div>
              
              <div className="border border-border bg-card p-4 text-center">
                <div className="text-2xl font-mono font-bold text-foreground mb-1">
                  12K+
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  FOLLOWERS
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
