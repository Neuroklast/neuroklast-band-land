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
  const safeSocialLinks = socialLinks || {}
  
  const socialIcons = [
    { 
      icon: InstagramLogo, 
      url: safeSocialLinks.instagram, 
      label: 'Instagram',
      color: 'hover:text-[#E4405F]'
    },
    { 
      icon: FacebookLogo, 
      url: safeSocialLinks.facebook, 
      label: 'Facebook',
      color: 'hover:text-[#1877F2]'
    },
    { 
      icon: SpotifyLogo, 
      url: safeSocialLinks.spotify, 
      label: 'Spotify',
      color: 'hover:text-[#1DB954]'
    },
    { 
      icon: SoundcloudLogo, 
      url: safeSocialLinks.soundcloud, 
      label: 'SoundCloud',
      color: 'hover:text-[#FF5500]'
    },
    { 
      icon: YoutubeLogo, 
      url: safeSocialLinks.youtube, 
      label: 'YouTube',
      color: 'hover:text-[#FF0000]'
    },
    { 
      icon: LinkIcon, 
      url: safeSocialLinks.linktr, 
      label: 'Linktree',
      color: 'hover:text-primary'
    }
  ]

  return (
    <footer className="relative border-t border-primary/20 bg-background hud-element">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 py-16 relative">
        <div className="absolute top-4 left-4 hidden md:block">
          <div className="data-readout text-[8px]">
            FOOTER_SECTION
          </div>
        </div>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 hud-text">NEUROKLAST</h2>
          
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-6 md:mb-8 flex-wrap">
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
                    className={`text-foreground transition-all touch-manipulation hover:text-primary active:text-primary/80 relative group`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Icon size={28} className="md:hidden" weight="fill" />
                    <Icon size={32} className="hidden md:block" weight="fill" />
                    <span className="absolute -inset-2 border border-primary/0 group-hover:border-primary/30 transition-colors pointer-events-none"></span>
                  </motion.a>
                )
              })}
          </div>

          <div className="text-xs md:text-sm text-muted-foreground space-y-2 px-4 font-mono">
            <p className="tracking-wider"><span className="text-primary/40">&gt;</span> HARD TECHNO · INDUSTRIAL · DNB · DARK ELECTRO</p>
            <p className="text-[10px] md:text-xs">LABEL: Darktunes Music Group</p>
            <p className="text-[10px] md:text-xs">© {new Date().getFullYear()} NEUROKLAST. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
