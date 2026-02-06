import { motion } from 'framer-motion'
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
import type { SocialLinks } from '@/lib/types'
import { useState } from 'react'
import SocialEditDialog from './SocialEditDialog'

interface SocialSectionProps {
  socialLinks: SocialLinks
  editMode: boolean
  onUpdate: (socialLinks: SocialLinks) => void
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

export default function SocialSection({ socialLinks, editMode, onUpdate }: SocialSectionProps) {
  const [isEditing, setIsEditing] = useState(false)

  const activePlatforms = socialPlatforms.filter(platform => socialLinks[platform.key])

  return (
    <section className="py-20 px-4" id="social">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl md:text-5xl font-bold">FOLLOW</h2>
          {editMode && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-primary hover:bg-accent"
            >
              Edit Links
            </Button>
          )}
        </div>

        <Separator className="bg-primary mb-12" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {activePlatforms.map((platform, index) => {
            const Icon = platform.icon
            const url = socialLinks[platform.key]

            return (
              <motion.div
                key={platform.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 border-border hover:border-primary hover:bg-primary/10 transition-all"
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Icon size={32} className="text-primary" />
                    <span className="text-xs font-medium">{platform.label}</span>
                  </a>
                </Button>
              </motion.div>
            )
          })}
        </div>

        {activePlatforms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No social links added yet.</p>
          </div>
        )}
      </div>

      {isEditing && (
        <SocialEditDialog
          socialLinks={socialLinks}
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
