export default function Hero() {
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

        <h1 className="text-7xl md:text-9xl font-bold font-mono text-foreground mb-6 tracking-tighter signal-static-text-glitch">
          NEUROKLAST
        </h1>

        <div className="signal-static-transmission-box mb-8">
          <p className="text-lg md:text-xl font-mono text-muted-foreground tracking-wide leading-relaxed">
            {'>'} NEURAL TECHNO TRANSMISSION
            <br />
            {'>'} FREQUENCY: 140 BPM
            <br />
            {'>'} STATUS: BROADCASTING
          </p>
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
