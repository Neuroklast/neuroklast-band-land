import { motion } from 'framer-motion'
import type { SocialLinks } from '@/lib/types'
import titleImage from '@/assets/images/titel.png'

interface FooterProps {
  socialLinks: SocialLinks
  genres?: string[]
  label?: string
}

export default function Footer({ socialLinks, genres, label }: FooterProps) {
  const safeSocialLinks = socialLinks || {}

  return (
    <footer className="relative border-t border-primary/20 bg-background hud-element">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 py-16 relative">
        <div className="absolute top-4 left-4 hidden md:block">
          <div className="data-readout text-[8px]">
            FOOTER_SECTION
          </div>
        </div>

        <div className="absolute bottom-4 left-4">
          <div className="font-mono text-[10px] md:text-xs text-primary/60 tracking-wider">
            PROTOCOL: HELLFIRE
          </div>
        </div>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative scanline-text hud-scanline">
              <img 
                src={titleImage} 
                alt="NEUROKLAST" 
                className="h-16 md:h-20 lg:h-24 w-auto red-glitch-element"
              />
            </div>
          </div>

          <div className="text-xs md:text-sm text-muted-foreground space-y-2 px-4 font-mono">
            <p className="tracking-wider">
              <span className="text-primary/40">&gt;</span> {genres?.join(' · ') || 'HARD TECHNO · INDUSTRIAL · DNB · DARK ELECTRO'}
            </p>
            {label && (
              <p className="text-[10px] md:text-xs">LABEL: {label}</p>
            )}
            <p className="text-[10px] md:text-xs">© {new Date().getFullYear()} NEUROKLAST. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
