import type { HeroSlotProps } from '@/lib/types'

export default function Hero({
  name,
  genres,
  editMode: _editMode,
  onEdit: _onEdit,
  logoUrl,
  titleImageUrl,
}: HeroSlotProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="signal-static-scanlines"></div>
      <div className="signal-static-noise"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="signal-static-glitch-wrapper mb-8">
          <div className="inline-block relative">
            <div className="signal-static-signal-indicator mb-4 text-accent font-mono text-sm tracking-widest">
              [SIGNAL DETECTED: 47.2183° N, 11.8167° E]
            </div>
          </div>
        </div>

        {logoUrl && (
          <div className="flex justify-center mb-8">
            <img
              src={logoUrl}
              alt={`${name} Logo`}
              className="w-[16rem] h-auto sm:w-[20rem] md:w-[24rem] lg:w-[28rem]"
            />
          </div>
        )}

        {titleImageUrl ? (
          <div className="mb-6 flex justify-center w-full px-4">
            <img
              src={titleImageUrl}
              alt={name}
              className="w-full max-w-xs sm:max-w-md md:max-w-2xl h-auto"
            />
          </div>
        ) : (
          <h1 className="text-7xl md:text-9xl font-bold font-mono text-foreground mb-6 tracking-tighter signal-static-text-glitch">
            {name}
          </h1>
        )}

        <div className="signal-static-transmission-box mb-8">
          <p className="text-lg md:text-xl font-mono text-muted-foreground tracking-wide leading-relaxed">
            {'>'} NEURAL TECHNO TRANSMISSION
            <br />
            {'>'} FREQUENCY: 140 BPM
            <br />
            {'>'} STATUS: BROADCASTING
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-8 px-2">
          {(genres || []).map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 border border-border text-xs font-mono tracking-widest uppercase text-muted-foreground"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-center gap-8 font-mono text-xs text-muted-foreground">
          <div className="signal-static-status-bar">
            <span className="text-accent">◉</span> LIVE
          </div>
          <div className="signal-static-separator">|</div>
          <div>CLEARANCE: LEVEL_3</div>
          <div className="signal-static-separator">|</div>
          <div className="signal-static-timestamp">
            {new Date().toISOString().replace('T', ' ').slice(0, 19)}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 font-mono text-sm">
          <a 
            href="#releases" 
            className="signal-static-nav-link px-6 py-3 border border-border bg-background hover:bg-card hover:border-accent transition-all duration-300"
          >
            {'>'} ARCHIVES
          </a>
          <a 
            href="#events" 
            className="signal-static-nav-link px-6 py-3 border border-border bg-background hover:bg-card hover:border-accent transition-all duration-300"
          >
            {'>'} COORDINATES
          </a>
          <a 
            href="#visualizer" 
            className="signal-static-nav-link px-6 py-3 border border-accent bg-accent/10 hover:bg-accent hover:text-background transition-all duration-300"
          >
            {'>'} ANALYZER
          </a>
        </div>
      </div>
    </section>
  )
}
