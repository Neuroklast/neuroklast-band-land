import { PlayCircle, Disc, Headphones } from 'lucide-react'
import type { ReleasesSectionSlotProps, Release } from '@/lib/types'

export default function ReleasesSection({ releases, onReleaseClick, sectionLabels }: ReleasesSectionSlotProps) {
  return (
    <section id="releases" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 right-6 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent opacity-50"></div>

      <div className="mb-16 pr-8 text-right">
        <h2 className="text-4xl font-bold font-mono text-foreground tracking-tight uppercase">
          {sectionLabels?.releases || 'AUDIO_ARCHIVE'} {'<'}
        </h2>
        <p className="font-mono text-sm text-muted-foreground mt-2 uppercase">
          [SYS.DATA: SONIC_ARTIFACTS]
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pr-8">
        {releases.map((release: Release) => (
          <div
            key={release.id}
            onClick={() => onReleaseClick && onReleaseClick(release)}
            className="group relative cursor-pointer border border-border bg-card/50 hover:bg-card transition-all duration-500 overflow-hidden"
          >
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-accent transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300 z-10"></div>

            <div className="aspect-square relative overflow-hidden bg-muted">
              {release.artwork ? (
                <img
                  src={release.artwork}
                  alt={release.title}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Disc className="w-16 h-16 text-muted-foreground opacity-30 animate-spin-slow" />
                </div>
              )}

              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                <div className="flex gap-4">
                  {release.streamingLinks?.spotify && (
                    <a href={release.streamingLinks.spotify} target="_blank" rel="noopener noreferrer" className="p-3 bg-accent/10 border border-accent hover:bg-accent text-accent hover:text-background rounded-full transition-colors" onClick={(e) => e.stopPropagation()}>
                      <Headphones className="w-5 h-5" />
                    </a>
                  )}
                  {release.streamingLinks?.bandcamp && (
                    <a href={release.streamingLinks.bandcamp} target="_blank" rel="noopener noreferrer" className="p-3 bg-accent/10 border border-accent hover:bg-accent text-accent hover:text-background rounded-full transition-colors" onClick={(e) => e.stopPropagation()}>
                      <PlayCircle className="w-5 h-5" />
                    </a>
                  )}
                </div>
                <span className="font-mono text-xs text-accent tracking-widest uppercase">[ACCESS_DATA]</span>
              </div>
            </div>

            <div className="p-6 border-t border-border relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-foreground uppercase tracking-wider group-hover:text-accent transition-colors line-clamp-1">
                  {release.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs mt-3">
                <span className="text-muted-foreground uppercase bg-muted px-2 py-1">
                  {release.type || 'UNKNOWN_FORMAT'}
                </span>
                <span className="text-accent">
                  {release.releaseDate ? new Date(release.releaseDate).getFullYear() : 'CLASSIFIED'}
                </span>
              </div>

              <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
