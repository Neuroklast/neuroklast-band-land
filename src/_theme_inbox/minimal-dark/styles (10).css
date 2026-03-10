export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { label: 'IMPRINT', url: '{{IMPRINT_URL}}' },
    { label: 'PRIVACY', url: '{{PRIVACY_URL}}' },
    { label: 'TERMS', url: '{{TERMS_URL}}' },
    { label: 'CONTACT', url: '{{CONTACT_URL}}' }
  ]

  return (
    <footer className="relative border-t border-border bg-background">
      <div className="signal-static-scanlines opacity-30"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="font-mono text-xl font-bold text-foreground mb-4 tracking-tighter">
              NKLST_
            </div>
            <div className="font-mono text-xs text-muted-foreground space-y-1">
              <div>{'>'} NEURAL TECHNO COLLECTIVE</div>
              <div>{'>'} EST. 2019</div>
              <div>{'>'} MUNICH, DE</div>
            </div>
          </div>

          <div>
            <div className="font-mono text-sm text-accent mb-4">
              [QUICK_ACCESS]
            </div>
            <div className="space-y-2 font-mono text-xs">
              <a href="#biography" className="block text-muted-foreground hover:text-foreground transition-colors">
                {'>'} ORIGIN_PROTOCOL
              </a>
              <a href="#releases" className="block text-muted-foreground hover:text-foreground transition-colors">
                {'>'} AUDIO_ARCHIVES
              </a>
              <a href="#gigs" className="block text-muted-foreground hover:text-foreground transition-colors">
                {'>'} TRANSMISSION_SCHEDULE
              </a>
              <a href="#social" className="block text-muted-foreground hover:text-foreground transition-colors">
                {'>'} EXTERNAL_LINKS
              </a>
            </div>
          </div>

          <div>
            <div className="font-mono text-sm text-accent mb-4">
              [TRANSMISSION_STATUS]
            </div>
            <div className="space-y-2 font-mono text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-accent signal-static-signal-indicator">◉</span>
                <span>SYSTEM_ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">◆</span>
                <span>FREQUENCY: 140_BPM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">◆</span>
                <span>UPTIME: {currentYear - 2019} YEARS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-mono text-xs text-muted-foreground">
              © {currentYear} NEUROKLAST • ALL RIGHTS RESERVED • [CLEARANCE_LEVEL: PUBLIC]
            </div>

            <div className="flex items-center gap-4 font-mono text-xs">
              {footerLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-4">
                  <a 
                    href={link.url}
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                  {index < footerLinks.length - 1 && (
                    <span className="text-border">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="inline-block border border-border bg-card px-4 py-2 font-mono text-xs text-muted-foreground">
              <span className="text-accent">◆</span> POWERED_BY_NEUROKLAST_FRAMEWORK_v2.0
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
    </footer>
  )
}
