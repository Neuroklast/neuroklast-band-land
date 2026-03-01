import { motion, AnimatePresence, type Target, type TargetAndTransition } from 'framer-motion'
import { SpotifyLogo, SoundcloudLogo, YoutubeLogo, MusicNote, Ticket, MapPin, CalendarBlank } from '@phosphor-icons/react'
import CyberCloseButton from '@/components/CyberCloseButton'
import ProgressiveImage from '@/components/ProgressiveImage'
import ConsoleLines from '@/components/ConsoleLines'
import { buildMemberDataLines } from '@/lib/profile-data'
import { format } from 'date-fns'
import { useEffect } from 'react'
import type { Member, Release, Gig, Impressum, SectionLabels } from '@/lib/types'
import type { OverlayAnimation } from '@/lib/overlay-animations'
import type { OverlayPhase } from '@/hooks/use-overlay-state'
import {
  CONSOLE_TYPING_SPEED_MS,
  CONSOLE_LINE_DELAY_MS,
} from '@/lib/config'

interface CyberpunkOverlayModalProps {
  overlay: { type: string; data: unknown } | null
  phase: OverlayPhase
  loadingText: string
  animation: OverlayAnimation
  onClose: () => void
  sectionLabels?: SectionLabels
}

/** Member profile content — bio + photo in terminal style */
function MemberContent({ member, sectionLabels }: { member: Member; sectionLabels?: SectionLabels }) {
  const dataLines = buildMemberDataLines(member, sectionLabels)
  return (
    <motion.div
      className="flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Photo */}
      <div className="md:w-2/5 p-4 md:p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-primary/20">
        <div className="relative w-full max-w-[200px] aspect-square">
          {member.photo ? (
            <div
              className="w-full h-full overflow-hidden border border-primary/40 bg-black"
              style={{ boxShadow: '0 0 20px color-mix(in oklch, var(--primary) 30%, transparent)' }}
            >
              <ProgressiveImage src={member.photo} alt={member.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 hud-scanline pointer-events-none opacity-20" />
            </div>
          ) : (
            <div className="w-full h-full bg-muted border border-primary/40 flex items-center justify-center">
              <span className="text-muted-foreground font-mono text-xs">NO IMG</span>
            </div>
          )}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/60" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/60" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60" />
        </div>
      </div>
      {/* Terminal data */}
      <div className="md:w-3/5 p-4 md:p-6">
        <div className="font-mono space-y-3">
          <div className="text-[10px] text-primary/50 tracking-wider mb-3">{'>'} TERMINAL OUTPUT // PROFILE DATA</div>
          <div className="bg-black/50 border border-primary/20 p-4 h-[180px] overflow-y-auto">
            <ConsoleLines lines={dataLines} speed={CONSOLE_TYPING_SPEED_MS} delayBetween={CONSOLE_LINE_DELAY_MS} />
          </div>
          <div className="flex items-center gap-2 text-[9px] text-primary/40 pt-1">
            <div className="w-1.5 h-1.5 bg-primary/60 animate-pulse" />
            <span>{sectionLabels?.sessionStatusText || 'SESSION ACTIVE'}</span>
            <span className="ml-auto">NK-SYS v1.3.37</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/** Release detail content — artwork + streaming links */
function ReleaseContent({ release }: { release: Release }) {
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

/** Gig detail content — venue, date, supporting artists, ticket */
function GigContent({ gig }: { gig: Gig }) {
  let dateStr = gig.date
  let timeStr = ''
  try {
    const d = new Date(gig.date)
    dateStr = format(d, 'EEEE, MMMM d, yyyy')
    if (!gig.allDay) timeStr = format(d, 'HH:mm')
  } catch {
    // keep raw date string
  }

  return (
    <motion.div
      className="p-4 md:p-6 font-mono space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <p className="text-[10px] text-primary/50 tracking-wider mb-2">// EVENT.DATA</p>
        <h2 className="text-xl font-bold text-foreground mb-1">{gig.venue}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={14} className="text-primary/60 flex-shrink-0" />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([gig.venue, gig.location].filter(Boolean).join(', '))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline underline-offset-2 decoration-primary/30 hover:decoration-primary"
          >
            {gig.location}
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm">
          <CalendarBlank size={14} className="text-primary/60 flex-shrink-0" />
          <span className="text-foreground">{dateStr}</span>
          {timeStr && <span className="text-primary/60">{timeStr}</span>}
        </div>
        {gig.gigType && (
          <span className={`w-fit text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${gig.gigType === 'concert' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
            {gig.gigType === 'concert' ? 'CONCERT' : 'DJ SET'}
          </span>
        )}
        {gig.status && gig.status !== 'confirmed' && (
          <span className={`w-fit text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${
            gig.status === 'soldout' ? 'bg-yellow-500/20 text-yellow-400' :
            gig.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
            'bg-primary/20 text-primary'
          }`}>
            {gig.status}
          </span>
        )}
      </div>

      {gig.supportingArtists && gig.supportingArtists.length > 0 && (
        <div>
          <p className="text-[10px] text-primary/50 tracking-wider mb-1">// LINEUP</p>
          <ul className="space-y-1">
            {gig.supportingArtists.map((artist, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                <span className="text-primary/40 mr-2">{'>'}</span>{artist}
              </li>
            ))}
          </ul>
        </div>
      )}

      {gig.ticketUrl && (
        <a
          href={gig.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-accent transition-colors font-mono text-xs tracking-wider uppercase"
        >
          <Ticket size={14} />
          GET TICKETS
        </a>
      )}
    </motion.div>
  )
}

/** Impressum content — legal entity info */
function ImpressumContent({ impressum }: { impressum: Impressum }) {
  return (
    <motion.div
      className="p-4 md:p-6 font-mono space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {[
        { label: '// ENTITY.IDENTIFIER', value: impressum.name || impressum.nameEn },
        { label: '// ENTITY.CARE_OF', value: impressum.careOf || impressum.careOfEn },
        { label: '// ENTITY.STREET', value: impressum.street || impressum.streetEn },
        { label: '// ENTITY.CITY', value: impressum.zipCity || impressum.zipCityEn },
        { label: '// CONTACT.PHONE', value: impressum.phone },
        { label: '// CONTACT.EMAIL', value: impressum.email },
        { label: '// RESPONSIBLE.NAME', value: impressum.responsibleName || impressum.responsibleNameEn },
        { label: '// RESPONSIBLE.ADDRESS', value: impressum.responsibleAddress || impressum.responsibleAddressEn },
      ]
        .filter(({ value }) => value)
        .map(({ label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.06 }}
          >
            <p className="text-[10px] text-primary/50 tracking-wider data-label">{label}</p>
            <p className="text-sm text-foreground mt-0.5">{value}</p>
          </motion.div>
        ))}
    </motion.div>
  )
}

/** The full cyberpunk 3-phase overlay modal rendered in App.tsx */
export default function CyberpunkOverlayModal({
  overlay,
  phase,
  loadingText,
  animation,
  onClose,
  sectionLabels,
}: CyberpunkOverlayModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const headerTitle = overlay
    ? overlay.type === 'member'    ? `PROFILE // ${(overlay.data as Member).name?.toUpperCase()}`
    : overlay.type === 'release'   ? `RELEASE // ${(overlay.data as Release).title?.toUpperCase()}`
    : overlay.type === 'gig'       ? `EVENT // ${(overlay.data as Gig).venue?.toUpperCase()}`
    : 'ENTITY.INFO // LEGAL'
    : ''

  return (
    <AnimatePresence>
      {overlay && (
        <motion.div
          key="cyberpunk-overlay-backdrop"
          className="fixed inset-0 z-[9998] cyberpunk-overlay-bg bg-black/90 backdrop-blur-sm overflow-y-auto"
          initial={animation.backdrop.initial as Target}
          animate={animation.backdrop.animate as TargetAndTransition}
          exit={animation.backdrop.exit as TargetAndTransition}
          transition={animation.backdrop.transition}
          onClick={onClose}
        >
          <div className="min-h-full flex items-center justify-center p-4 md:p-6">
            <motion.div
              key="cyberpunk-overlay-modal"
              className="w-full max-w-3xl bg-card border border-primary/40 relative"
              initial={animation.modal.initial as Target}
              animate={animation.modal.animate as TargetAndTransition}
              exit={animation.modal.exit as TargetAndTransition}
              transition={animation.modal.transition}
              style={{
                boxShadow: '0 0 40px color-mix(in oklch, var(--primary) 20%, transparent), 0 0 80px color-mix(in oklch, var(--primary) 10%, transparent)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Loading phase */}
              {phase === 'loading' && (
                <div className="flex flex-col items-center justify-center gap-4 py-16 px-8">
                  <div className={animation.loaderClass} />
                  <p className="progressive-loading-label text-primary/70 font-mono text-xs tracking-wider">{loadingText}</p>
                  <p className="text-primary/40 font-mono text-[9px] tracking-widest uppercase">{animation.loaderLabel}</p>
                </div>
              )}

              {/* Glitch phase */}
              {phase === 'glitch' && (
                <div className="flex items-center justify-center py-16 px-8">
                  <motion.p
                    className="glitch-effect font-mono text-sm text-primary tracking-widest uppercase"
                    animate={{ opacity: [0, 1, 0, 1, 0, 1] }}
                    transition={{ duration: 0.4 }}
                  >
                    DECRYPTING...
                  </motion.p>
                </div>
              )}

              {/* Revealed phase */}
              {phase === 'revealed' && (
                <>
                  {/* HUD corner accents */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50 pointer-events-none" />

                  {/* Header bar with animated scanline */}
                  <div className="h-10 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 w-8 bg-primary/20"
                      animate={{ x: ['-100%', '120%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="flex items-center gap-3 relative z-[1]">
                      <div className="w-2 h-2 bg-primary animate-pulse" />
                      <span className="font-mono text-[10px] text-primary/70 tracking-wider uppercase truncate max-w-[200px] md:max-w-xs">
                        {headerTitle}
                      </span>
                    </div>
                    <CyberCloseButton
                      onClick={onClose}
                      label={sectionLabels?.closeButtonText || 'CLOSE'}
                    />
                  </div>

                  {/* Per-type content */}
                  <AnimatePresence mode="wait">
                    {overlay.type === 'member' && (
                      <MemberContent key="member" member={overlay.data as Member} sectionLabels={sectionLabels} />
                    )}
                    {overlay.type === 'release' && (
                      <ReleaseContent key="release" release={overlay.data as Release} />
                    )}
                    {overlay.type === 'gig' && (
                      <GigContent key="gig" gig={overlay.data as Gig} />
                    )}
                    {overlay.type === 'impressum' && (
                      <ImpressumContent key="impressum" impressum={overlay.data as Impressum} />
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
