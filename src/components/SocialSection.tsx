import { motion, useInView } from 'framer-motion'
import {
  InstagramLogo,
  FacebookLogo,
  SpotifyLogo,
  SoundcloudLogo,
  YoutubeLogo,
  TiktokLogo,
  TwitterLogo,
  Link
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChromaticText } from '@/components/ChromaticText'
import FontSizePicker from '@/components/FontSizePicker'
import type { SocialLinks, FontSizeSettings } from '@/lib/types'
import { useState, useRef, useEffect } from 'react'
import SocialEditDialog from './SocialEditDialog'
import { useTypingEffect } from '@/hooks/use-typing-effect'

interface SocialSectionProps {
  socialLinks: SocialLinks
  editMode: boolean
  onUpdate: (socialLinks: SocialLinks) => void
  fontSizes?: FontSizeSettings
  onFontSizeChange?: (key: keyof FontSizeSettings, value: string) => void
}

const socialPlatforms = [
  { key: 'instagram' as keyof SocialLinks, icon: InstagramLogo, label: 'Instagram' },
  { key: 'facebook' as keyof SocialLinks, icon: FacebookLogo, label: 'Facebook' },
  { key: 'spotify' as keyof SocialLinks, icon: SpotifyLogo, label: 'Spotify' },
  { key: 'soundcloud' as keyof SocialLinks, icon: SoundcloudLogo, label: 'SoundCloud' },
  { key: 'youtube' as keyof SocialLinks, icon: YoutubeLogo, label: 'YouTube' },
  { key: 'tiktok' as keyof SocialLinks, icon: TiktokLogo, label: 'TikTok' },
  { key: 'twitter' as keyof SocialLinks, icon: TwitterLogo, label: 'Twitter' },
  { key: 'linktr' as keyof SocialLinks, icon: Link, label: 'Linktree' },
  { key: 'bandcamp' as keyof SocialLinks, icon: Link, label: 'Bandcamp' }
]

export default function SocialSection({ socialLinks, editMode, onUpdate, fontSizes, onFontSizeChange }: SocialSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [glitchActive, setGlitchActive] = useState(false)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const titleText = 'CONNECT'
  const { displayedText: displayedTitle } = useTypingEffect(
    isInView ? titleText : '',
    50,
    100
  )

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 300)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const safeSocialLinks = socialLinks || {}
  const activePlatforms = socialPlatforms.filter(platform => safeSocialLinks[platform.key])

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-gradient-to-b from-background to-secondary/10" id="social">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <motion.h2 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold font-mono scanline-text dot-matrix-text ${glitchActive ? 'glitch-text-effect' : ''}`}
            data-text={`> ${displayedTitle}`}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
            style={{
              textShadow: '0 0 6px oklch(1 0 0 / 0.5), 0 0 12px oklch(0.50 0.22 25 / 0.3), 0 0 18px oklch(0.50 0.22 25 / 0.2)'
            }}
          >
            <ChromaticText intensity={1.5}>
              &gt; {displayedTitle}
            </ChromaticText>
            <span className="animate-pulse">_</span>
          </motion.h2>
          {editMode && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-primary hover:bg-accent active:scale-95 transition-transform touch-manipulation w-full sm:w-auto"
            >
              Edit Links
            </Button>
          )}
        </div>

        <Separator className="bg-gradient-to-r from-primary via-primary/50 to-transparent mb-16 h-0.5" />

        {editMode && onFontSizeChange && (
          <div className="mb-6 flex gap-2 flex-wrap">
            <FontSizePicker label="CONNECT" value={fontSizes?.connectText} onChange={(v) => onFontSizeChange('connectText', v)} />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {activePlatforms.map((platform, index) => {
            const Icon = platform.icon
            const url = safeSocialLinks[platform.key]

            return (
              <motion.div
                key={platform.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-44 md:h-52 flex flex-col items-center justify-center gap-3 border-border hover:border-primary hover:bg-primary/10 active:border-primary active:bg-primary/20 active:scale-[0.92] transition-all group relative overflow-hidden touch-manipulation"
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-primary/0 group-active:bg-primary/10 transition-colors duration-100 pointer-events-none" />
                    <Icon size={80} className="md:hidden size-20 text-primary group-hover:scale-110 group-active:scale-125 transition-transform duration-200 relative z-10" weight="fill" />
                    <Icon size={96} className="hidden md:block size-24 text-primary group-hover:scale-110 group-active:scale-125 transition-transform duration-200 relative z-10" weight="fill" />
                    <span className="text-xs md:text-sm font-medium tracking-wider uppercase relative z-10">{platform.label}</span>
                  </a>
                </Button>
              </motion.div>
            )
          })}
        </div>

        {activePlatforms.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-muted-foreground text-lg">No social links added yet.</p>
          </motion.div>
        )}
      </div>

      {isEditing && (
        <SocialEditDialog
          socialLinks={safeSocialLinks}
          onSave={(updated) => {
            onUpdate(updated)
            setIsEditing(false)
          }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </section>
  )
}
