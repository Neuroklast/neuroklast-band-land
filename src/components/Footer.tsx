import { motion } from 'framer-motion'
import { 
  InstagramLogo, 
  FacebookLogo, 
  SpotifyLogo, 
  SoundcloudLogo, 
  YoutubeLogo,
  Link as LinkIcon
} from '@phosphor-icons/react'
import type { SocialLinks } from '@/lib/types'

interface FooterProps {
  socialLinks: SocialLinks
}

export default function Footer({ socialLinks }: FooterProps) {
  const socialIcons = [
    { 
      icon: InstagramLogo, 
      url: socialLinks.instagram, 
      label: 'Instagram',
      color: 'hover:text-[#E4405F]'
    },
    { 
      icon: FacebookLogo, 
      url: socialLinks.facebook, 
      label: 'Facebook',
      color: 'hover:text-[#1877F2]'
    },
    { 
      icon: SpotifyLogo, 
      url: socialLinks.spotify, 
      label: 'Spotify',
      color: 'hover:text-[#1DB954]'
    },
    { 
      icon: SoundcloudLogo, 
      url: socialLinks.soundcloud, 
      label: 'SoundCloud',
      color: 'hover:text-[#FF5500]'
    },
    { 
      icon: YoutubeLogo, 
      url: socialLinks.youtube, 
      label: 'YouTube',
      color: 'hover:text-[#FF0000]'
    },
    { 
      icon: LinkIcon, 
      url: socialLinks.linktr, 
      label: 'Linktree',
      color: 'hover:text-primary'
    }
  ]

  return (
    <footer className="relative border-t border-border bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8">NEUROKLAST</h2>
          
          <div className="flex items-center justify-center gap-6 mb-8">
            {socialIcons
              .filter(social => social.url)
              .map((social, index) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-foreground transition-colors ${social.color}`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Icon size={32} weight="fill" />
                  </motion.a>
                )
              })}
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>HARD TECHNO · INDUSTRIAL · DNB · DARK ELECTRO</p>
            <p className="text-xs">© {new Date().getFullYear()} NEUROKLAST. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
