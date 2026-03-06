import { motion } from 'framer-motion'
import { ArrowUp } from '@phosphor-icons/react'
import type { FooterSlotProps } from '@/lib/types'
import './styles.css'

export default function MinimalFooter({
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
    <footer className="border-t border-border/50 bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {genres && genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              {genres.map((genre) => (
                <span key={genre} className="px-2 py-0.5 border border-border/50 rounded">
                  {genre}
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
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors capitalize"
                >
                  {platform}
                </a>
              ))}
            </div>
          )}

          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {siteName || 'Neuroklast'}. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground/70">
              {onImpressum && (
                <button
                  onClick={onImpressum}
                  className="hover:text-foreground transition-colors"
                >
                  Impressum
                </button>
              )}
              {onDatenschutz && (
                <button
                  onClick={onDatenschutz}
                  className="hover:text-foreground transition-colors"
                >
                  Datenschutz
                </button>
              )}
              {onAdminLogin && (
                <button
                  onClick={onAdminLogin}
                  className="hover:text-foreground transition-colors"
                >
                  Admin
                </button>
              )}
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-foreground transition-colors border border-border/50 hover:border-border px-3 py-1.5 rounded"
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

MinimalFooter.displayName = 'MinimalFooter'
