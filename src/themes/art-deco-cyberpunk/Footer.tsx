import { motion } from 'framer-motion'
import { ArrowUp } from '@phosphor-icons/react'
import type { FooterSlotProps } from '@/lib/types'
import './styles.css'

export default function ArtDecoCyberpunkFooter({
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
    <footer className="border-t border-primary/20 bg-background relative">
      {/* Top geometric accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-14 md:py-20">
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Art Deco geometric divider */}
          <div className="flex items-center gap-2 w-56 md:w-72">
            <span className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/50" />
            <span className="w-2 h-2 rotate-45 border border-primary/60" />
            <span className="text-primary/70 text-xs tracking-widest">◆</span>
            <span className="w-2 h-2 rotate-45 border border-primary/60" />
            <span className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/50" />
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
                  className="px-3 py-0.5 border border-primary/25 text-primary/70 font-heading tracking-[0.15em] uppercase text-[10px]"
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
                  className="text-xs font-heading text-muted-foreground hover:text-primary transition-colors capitalize tracking-[0.15em] uppercase"
                >
                  {platform}
                </a>
              ))}
            </div>
          )}

          {/* Thin geometric separator */}
          <div className="flex items-center gap-3 w-32">
            <span className="flex-1 h-px bg-primary/20" />
            <span className="w-1.5 h-1.5 rotate-45 bg-primary/30" />
            <span className="flex-1 h-px bg-primary/20" />
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs font-heading text-muted-foreground/70 tracking-[0.2em] uppercase">
              © {new Date().getFullYear()} {siteName || 'Neuroklast'}
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
            className="inline-flex items-center gap-1.5 text-xs font-heading text-muted-foreground/40 hover:text-primary transition-colors border border-primary/20 hover:border-primary/50 px-5 py-2 tracking-[0.15em] uppercase"
            aria-label="Back to top"
          >
            <ArrowUp size={14} />
            <span>Top</span>
          </button>
        </motion.div>
      </div>
    </footer>
  )
}

ArtDecoCyberpunkFooter.displayName = 'ArtDecoCyberpunkFooter'
