import type { ReleasesSectionSlotProps } from '@/lib/types'

export default function ReleasesSection({ releases }: ReleasesSectionSlotProps) {
  return (
    <section id="releases" className="max-w-6xl mx-auto px-6 py-24">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl font-bold font-mono text-foreground tracking-tight">
          {'>'} AUDIO_ARCHIVES
        </h2>
        <div className="font-mono text-xs text-muted-foreground">
          <span className="text-accent signal-static-signal-indicator">◉</span> DISCOGRAPHY
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {releases.map((release, index) => (
          <div
            key={release.id}
            className="signal-static-card relative bg-card border border-border group hover:border-accent transition-all duration-300 flex flex-col"
          >
            <div className="signal-static-card-noise"></div>
            <div className="signal-static-card-corner signal-static-card-corner-tl"></div>
            <div className="signal-static-card-corner signal-static-card-corner-tr"></div>
            <div className="signal-static-card-corner signal-static-card-corner-bl"></div>
            <div className="signal-static-card-corner signal-static-card-corner-br"></div>

            <div className="relative z-10 p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 mb-6">
                <div className="font-mono text-xs text-accent border border-accent px-2 py-1">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="text-xl font-mono font-bold text-foreground tracking-tight break-words">
                  {release.title}
                </h3>
              </div>

              <div className="font-mono text-sm text-muted-foreground mb-4">
                {'>'} TYPE: <span className="text-foreground">{release.type?.toUpperCase() || 'RELEASE'}</span>
              </div>

              <div className="font-mono text-sm text-muted-foreground mb-6 flex-grow">
                {'>'} DATE: <span className="text-foreground">{release.releaseDate || 'UNKNOWN'}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/50">
                {release.streamingLinks && Object.entries(release.streamingLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="signal-static-nav-link font-mono text-xs px-3 py-1 border border-border bg-background hover:bg-accent hover:text-background hover:border-accent transition-all duration-300 uppercase"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {releases.length === 0 && (
        <div className="mt-8 text-center">
          <div className="inline-block border border-border bg-card px-6 py-3 font-mono text-xs text-muted-foreground">
            <span className="text-accent">◆</span> NO ARCHIVES FOUND
          </div>
        </div>
      )}
    </section>
  )
}
