import { motion } from 'framer-motion'
import { ArrowUp } from '@phosphor-icons/react'
import type { FooterSlotProps } from '@/lib/types'

const IMPRESSUM_TEXT = 'Impressum'
const DATENSCHUTZ_TEXT = 'Datenschutz'
const ADMIN_LOGIN_TEXT = '>:Admin_Login'

export default function Footer({
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
    <footer className="relative border-t border-border bg-background zardonic-theme-scanline-effect">
      <div className="max-w-7xl mx-auto px-4 py-12 relative">
        <div className="absolute top-4 left-4 hidden md:block">
          <div className="font-mono text-[9px] text-primary/60 tracking-wider zardonic-theme-data-label">
            {'// SYSTEM.FOOTER.PROTOCOL'}
          </div>
        </div>

        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {genres && genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 border border-border text-[10px] font-mono text-muted-foreground tracking-[0.08em] uppercase hover:border-primary/50 transition-all"
                >
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
                  className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors capitalize tracking-wider zardonic-theme-hover-chromatic"
                >
                  {platform}
                </a>
              ))}
            </div>
          )}

          <div className="w-full max-w-xs mx-auto flex items-center gap-2">
            <div className="flex-1 h-px bg-primary/30" />
            <div className="w-1.5 h-1.5 rotate-45 border border-primary/60" />
            <div className="flex-1 h-px bg-primary/30" />
          </div>

          <div className="text-center space-y-3">
            <p className="text-[10px] md:text-xs font-mono text-muted-foreground tracking-wider">
              {`\u00A9 ${new Date().getFullYear()} ${(siteName || 'ARTIST').toUpperCase()}. ALL RIGHTS RESERVED.`}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-[10px] font-mono text-muted-foreground tracking-wider">
              {onImpressum && (
                <button onClick={onImpressum} className="hover:text-primary transition-colors uppercase">
                  {IMPRESSUM_TEXT}
                </button>
              )}
              {onDatenschutz && (
                <button onClick={onDatenschutz} className="hover:text-primary transition-colors uppercase">
                  {DATENSCHUTZ_TEXT}
                </button>
              )}
              {onAdminLogin && (
                <button onClick={onAdminLogin} className="hover:text-primary transition-colors uppercase">
                  {ADMIN_LOGIN_TEXT}
                </button>
              )}
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors tracking-wider border border-border hover:border-primary/50 px-4 py-2 uppercase zardonic-theme-cyber-border"
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
