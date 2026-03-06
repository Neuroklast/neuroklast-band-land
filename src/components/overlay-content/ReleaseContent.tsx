import { motion } from 'framer-motion'
import { SpotifyLogo, SoundcloudLogo, YoutubeLogo, MusicNote } from '@phosphor-icons/react'
import ProgressiveImage from '@/components/ProgressiveImage'
import { format } from 'date-fns'
import type { Release } from '@/lib/types'

/** Release detail content — artwork + streaming links */
export default function ReleaseContent({ release }: { release: Release }) {
  return (
    <motion.div
      className="p-4 md:p-6 flex flex-col gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Artwork */}
        {release.artwork && (
          <div
            className="w-full sm:w-40 flex-shrink-0 aspect-square overflow-hidden border border-primary/30"
            style={{ boxShadow: '0 0 20px color-mix(in oklch, var(--primary) 20%, transparent)' }}
          >
            <ProgressiveImage src={release.artwork} alt={release.title} className="w-full h-full object-cover" />
          </div>
        )}
        {/* Meta */}
        <div className="flex-1 font-mono">
          <p className="text-[10px] text-primary/50 tracking-wider mb-1">// RELEASE.DATA</p>
          <h2 className="text-xl font-bold text-foreground hover-chromatic mb-1">{release.title}</h2>
          {release.type && (
            <p className="text-xs text-primary/60 uppercase tracking-widest mb-1">{release.type}</p>
          )}
          {release.releaseDate && (
            <p className="text-xs text-muted-foreground">
              {format(new Date(release.releaseDate), 'MMMM d, yyyy')}
            </p>
          )}
          {release.description && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{release.description}</p>
          )}
        </div>
      </div>

      {/* Tracklist */}
      {release.tracks && release.tracks.length > 0 && (
        <div>
          <p className="text-[10px] text-primary/50 font-mono tracking-wider mb-2">// TRACKLIST</p>
          <div className="bg-black/40 border border-primary/20 p-3 space-y-1 max-h-32 overflow-y-auto">
            {release.tracks.map((track, i) => (
              <div key={i} className="flex items-center justify-between font-mono text-xs">
                <span className="text-muted-foreground">
                  <span className="text-primary/40 mr-2">{String(i + 1).padStart(2, '0')}.</span>
                  {track.title}
                </span>
                {track.duration && <span className="text-primary/40 ml-4">{track.duration}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streaming links */}
      {release.streamingLinks && (
        <div>
          <p className="text-[10px] text-primary/50 font-mono tracking-wider mb-2">// STREAM.PLATFORMS</p>
          <div className="flex flex-wrap gap-2">
            {release.streamingLinks.spotify && (
              <a
                href={release.streamingLinks.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 hover:border-primary hover:bg-primary/10 transition-colors font-mono text-xs"
              >
                <SpotifyLogo size={14} weight="fill" /> Spotify
              </a>
            )}
            {release.streamingLinks.soundcloud && (
              <a
                href={release.streamingLinks.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 hover:border-primary hover:bg-primary/10 transition-colors font-mono text-xs"
              >
                <SoundcloudLogo size={14} weight="fill" /> SoundCloud
              </a>
            )}
            {release.streamingLinks.youtube && (
              <a
                href={release.streamingLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 hover:border-primary hover:bg-primary/10 transition-colors font-mono text-xs"
              >
                <YoutubeLogo size={14} weight="fill" /> YouTube
              </a>
            )}
            {release.streamingLinks.bandcamp && (
              <a
                href={release.streamingLinks.bandcamp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 hover:border-primary hover:bg-primary/10 transition-colors font-mono text-xs"
              >
                <MusicNote size={14} weight="fill" /> Bandcamp
              </a>
            )}
            {release.streamingLinks.appleMusic && (
              <a
                href={release.streamingLinks.appleMusic}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 hover:border-primary hover:bg-primary/10 transition-colors font-mono text-xs"
              >
                <MusicNote size={14} weight="fill" /> Apple Music
              </a>
            )}
            {release.streamingLinks.beatport && (
              <a
                href={release.streamingLinks.beatport}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 hover:border-primary hover:bg-primary/10 transition-colors font-mono text-xs"
              >
                <MusicNote size={14} weight="fill" /> Beatport
              </a>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
