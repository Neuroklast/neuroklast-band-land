import { motion } from 'framer-motion'
import { ArrowUp } from '@phosphor-icons/react'
import type { FooterSlotProps } from '@/lib/types'
import './styles.css'

const SIGNAL_ACTIVE_TEXT = 'SIGNAL::ACTIVE'
const IMPRESSUM_TEXT = 'Impressum'
const DATENSCHUTZ_TEXT = 'Datenschutz'
const ADMIN_LOGIN_TEXT = '>:Admin_Login'

export default function NeuroklastClassicFooter({
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
    <footer className="relative border-t border-primary/20 bg-background">
      {/* Top crimson accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-14 md:py-16 relative">
        {/* HUD label — top-left */}
        <div className="absolute top-4 left-4 hidden md:block">
          <div
            className="font-mono text-[9px] text-primary/60 tracking-wider"
            style={{ animation: 'nk-hud-pulse 2s ease infinite' }}
          >
            SYS://FOOTER.PROTOCOL
          </div>
        </div>

        {/* Custom label — bottom-left */}
        {label && (
          <div className="absolute bottom-4 left-4">
            <div className="font-mono text-[10px] md:text-xs text-primary/50 tracking-wider uppercase">
              {label}
            </div>
          </div>
        )}

        {/* HUD label — top-right */}
        <div className="absolute top-4 right-4 hidden md:block">
          <div className="font-mono text-[9px] text-primary/40 tracking-wider">
            {SIGNAL_ACTIVE_TEXT}
          </div>
        </div>

        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Genre tags */}
          {genres && genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 border border-primary/30 text-[10px] font-mono text-primary/70 tracking-[0.08em] uppercase hover:border-primary/50 hover:shadow-[0_0_6px_var(--primary)] transition-all"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Social links */}
          {socialEntries.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {socialEntries.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors capitalize tracking-wider"
                >
                  {platform}
                </a>
              ))}
            </div>
          )}

          {/* Crimson divider */}
          <div className="w-full max-w-xs mx-auto flex items-center gap-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <div className="w-1.5 h-1.5 rotate-45 border border-primary/60" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          {/* Copyright & legal */}
          <div className="text-center space-y-3">
            <p className="text-[10px] md:text-xs font-mono text-muted-foreground/70 tracking-wider">
              {`\u00A9 ${new Date().getFullYear()} ${(siteName || 'NEUROKLAST').toUpperCase()}. ALL RIGHTS RESERVED.`}
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-[10px] font-mono text-muted-foreground/50 tracking-wider">
              {onImpressum && (
                <button
                  onClick={onImpressum}
                  className="hover:text-primary transition-colors uppercase"
                >
                  {IMPRESSUM_TEXT}
                </button>
              )}
              {onDatenschutz && (
                <button
                  onClick={onDatenschutz}
                  className="hover:text-primary transition-colors uppercase"
                >
                  {DATENSCHUTZ_TEXT}
                </button>
              )}
              {onAdminLogin && (
                <button
                  onClick={onAdminLogin}
                  className="hover:text-primary transition-colors uppercase"
                >
                  {ADMIN_LOGIN_TEXT}
                </button>
              )}
            </div>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/50 hover:text-primary transition-colors tracking-wider border border-primary/20 hover:border-primary/50 hover:shadow-[0_0_8px_var(--primary)] px-4 py-2 uppercase"
            aria-label="Back to top"
          >
            <ArrowUp size={14} />
            <span>BACK_TO_TOP</span>
          </button>
        </motion.div>
      </div>
    </footer>
  )
}

NeuroklastClassicFooter.displayName = 'NeuroklastClassicFooter'
