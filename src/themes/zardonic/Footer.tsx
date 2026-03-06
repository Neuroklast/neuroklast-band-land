import { motion } from 'framer-motion'
import { ArrowUp } from '@phosphor-icons/react'
import type { FooterSlotProps } from '@/lib/types'
import './styles.css'

export default function ZardonicFooter({ siteName }: FooterSlotProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative border-t border-primary/20 bg-background hud-element zardonic-theme">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-16 relative">
        <div className="absolute top-4 left-4 hidden md:block">
          <div className="font-mono text-[9px] text-primary/80 space-y-1">
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

          <div className="text-xs md:text-sm text-muted-foreground space-y-2 px-4 font-mono">
            <p className="text-[10px] md:text-xs">© {new Date().getFullYear()} {siteName?.toUpperCase() || 'NEUROKLAST'}. All rights reserved.</p>

            <div className="pt-6">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground/50 hover:text-primary/80 transition-colors font-mono tracking-wider border border-primary/20 hover:border-primary/40 px-4 py-2"
                aria-label="Back to top"
              >
                <ArrowUp size={14} />
                <span>BACK TO TOP</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
