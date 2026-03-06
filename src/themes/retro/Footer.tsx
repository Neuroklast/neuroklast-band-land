import { motion } from 'framer-motion'
import type { FooterSlotProps } from '@/lib/types'
import './styles.css'

export default function RetroFooter({
  socialLinks,
  siteName,
  genres,
  onAdminLogin,
  onImpressum,
  onDatenschutz,
}: FooterSlotProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const socialEntries = Object.entries(socialLinks ?? {})

  return (
    <footer className="border-t border-primary/30 bg-background font-mono">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-primary/40 text-xs tracking-widest select-none">
            {'═'.repeat(40)}
          </div>

          {genres && genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-0.5 border border-primary/30 text-primary/70 uppercase tracking-wider"
                >
                  [{genre}]
                </span>
              ))}
            </div>
          )}

          {socialEntries.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {socialEntries.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors tracking-wider uppercase"
                >
                  {'>'} {platform}
                </a>
              ))}
            </div>
          )}

          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground/80">
              {'>'} © {new Date().getFullYear()} {siteName || 'Neuroklast'} // ALL RIGHTS RESERVED
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground/50">
              {onImpressum && (
                <button
                  onClick={onImpressum}
                  className="hover:text-primary transition-colors tracking-wider uppercase"
                >
                  [Impressum]
                </button>
              )}
              {onDatenschutz && (
                <button
                  onClick={onDatenschutz}
                  className="hover:text-primary transition-colors tracking-wider uppercase"
                >
                  [Datenschutz]
                </button>
              )}
              {onAdminLogin && (
                <button
                  onClick={onAdminLogin}
                  className="hover:text-primary transition-colors tracking-wider uppercase"
                >
                  [Admin]
                </button>
              )}
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-xs text-primary/40 hover:text-primary transition-colors border border-primary/20 hover:border-primary/50 px-4 py-1.5 tracking-wider uppercase"
            aria-label="Back to top"
          >
            ▲ SCROLL_TOP
          </button>

          <div className="text-primary/20 text-xs tracking-widest select-none">
            {'>'} END_OF_TRANSMISSION_
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

RetroFooter.displayName = 'RetroFooter'
