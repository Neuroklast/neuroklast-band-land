import { motion } from 'framer-motion'
import { ArrowUp } from '@phosphor-icons/react'
import type { FooterSlotProps } from '@/lib/types'
import './styles.css'

export default function ElegantFooter({
  socialLinks,
  siteName,
  genres,
  label,
  onAdminLogin,
  onImpressum,
  onDatenschutz,
}: FooterSlotProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const socialEntries = Object.entries(socialLinks ?? {})

  return (
    <footer className="border-t border-primary/15 bg-background">
      <div className="max-w-5xl mx-auto px-4 py-14 md:py-20">
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Gold ornamental divider */}
          <div className="flex items-center gap-3 w-48 md:w-64">
            <span className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-primary/60 text-xs">✦</span>
            <span className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          {label && (
            <p className="text-sm font-body text-muted-foreground italic tracking-wide">
              {label}
            </p>
          )}

          {genres && genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground/80">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-0.5 border border-primary/20 text-primary/60 font-body tracking-wide"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {socialEntries.length > 0 && (
            <div className="flex flex-wrap justify-center gap-5">
              {socialEntries.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-body text-muted-foreground hover:text-primary transition-colors capitalize tracking-wide"
                >
                  {platform}
                </a>
              ))}
            </div>
          )}

          <div className="text-center space-y-4">
            <p className="text-xs font-body text-muted-foreground/70 tracking-wide">
              © {new Date().getFullYear()} {siteName || 'Neuroklast'}. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-5 text-xs text-muted-foreground/50">
              {onImpressum && (
                <button
                  onClick={onImpressum}
                  className="font-body hover:text-primary transition-colors tracking-wide"
                >
                  Impressum
                </button>
              )}
              {onDatenschutz && (
                <button
                  onClick={onDatenschutz}
                  className="font-body hover:text-primary transition-colors tracking-wide"
                >
                  Datenschutz
                </button>
              )}
              {onAdminLogin && (
                <button
                  onClick={onAdminLogin}
                  className="font-body hover:text-primary transition-colors tracking-wide"
                >
                  Admin
                </button>
              )}
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs font-body text-muted-foreground/40 hover:text-primary transition-colors border border-primary/15 hover:border-primary/40 px-4 py-1.5 tracking-wide"
            aria-label="Back to top"
          >
            <ArrowUp size={14} />
            <span>Back to top</span>
          </button>
        </motion.div>
      </div>
    </footer>
  )
}

ElegantFooter.displayName = 'ElegantFooter'
