import { motion } from 'framer-motion'
import { InstagramLogo, FacebookLogo, SpotifyLogo, SoundcloudLogo, YoutubeLogo, MusicNote, Globe, type Icon } from '@phosphor-icons/react'
import ConsoleLines from '@/components/ConsoleLines'
import ProgressiveImage from '@/components/ProgressiveImage'
import type { Friend, SectionLabels } from '@/lib/types'
import { CONSOLE_TYPING_SPEED_MS, CONSOLE_LINE_DELAY_MS } from '@/lib/config'
import { buildFriendDataLines } from '@/lib/profile-data'

const friendSocialIcons: { key: keyof NonNullable<Friend['socials']>; icon: Icon; label: string }[] = [
  { key: 'instagram', icon: InstagramLogo, label: 'Instagram' },
  { key: 'facebook', icon: FacebookLogo, label: 'Facebook' },
  { key: 'spotify', icon: SpotifyLogo, label: 'Spotify' },
  { key: 'soundcloud', icon: SoundcloudLogo, label: 'SoundCloud' },
  { key: 'youtube', icon: YoutubeLogo, label: 'YouTube' },
  { key: 'bandcamp', icon: MusicNote, label: 'Bandcamp' },
  { key: 'website', icon: Globe, label: 'Website' },
]

interface FriendContentProps {
  friend: Friend
  sectionLabels?: SectionLabels
}

/**
 * Friend/partner profile body content — photo, social links, console data.
 * Renders without a loading phase; the parent OverlayModal slot handles loading.
 */
export default function FriendContent({ friend, sectionLabels }: FriendContentProps) {
  const photoUrl = friend.profilePhoto || friend.photo
  const dataLines = buildFriendDataLines(friend, sectionLabels, friendSocialIcons)

  return (
    <motion.div
      className="flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Photo */}
      <div className="md:w-2/5 p-4 md:p-6 flex flex-col items-center gap-4 border-b md:border-b-0 md:border-r border-primary/20">
        <div className="relative w-full max-w-[200px]">
          {/*
            ALPHA-KANAL-GLOW: filter: drop-shadow() MUSS auf dem Wrapper-<div> sitzen,
            nicht auf dem <img> selbst. Nur so folgt der Glow der transparenten
            Silhouette des Bildes. Der Wrapper darf außerdem KEIN overflow:hidden haben.
            Das overflow:hidden bleibt auf dem inneren <div> erhalten.
          */}
          <div style={{ filter: 'drop-shadow(0 0 20px color-mix(in oklch, var(--primary) 30%, transparent))' }}>
            <div
              className="w-full aspect-square overflow-hidden border border-primary/40 bg-black"
            >
              {photoUrl ? (
                <ProgressiveImage src={photoUrl} alt={friend.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground font-mono text-xs">NO IMG</span>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/60" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/60" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/60" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/60" />
        </div>

        {/* Social links */}
        {friendSocialIcons.filter(({ key }) => friend.socials?.[key]).length > 0 && (
          <div className="flex gap-3 flex-wrap justify-center pt-1">
            {friendSocialIcons.filter(({ key }) => friend.socials?.[key]).map(({ key, icon: Icon, label }) => (
              <a
                key={key}
                href={friend.socials![key]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/60 hover:text-primary transition-colors"
                title={label}
              >
                <Icon size={22} weight="fill" />
              </a>
            ))}
          </div>
        )}
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
