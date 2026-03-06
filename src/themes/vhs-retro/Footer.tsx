import { motion } from 'framer-motion'
import type { FooterSlotProps } from '@/lib/types'
import './styles.css'

export default function VhsRetroFooter({
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
    <footer className="border-t-2 border-primary/20 bg-background font-mono relative overflow-hidden">
      {/* Tape end distortion line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
          animation: 'vhs-tape-sweep 4s linear infinite',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* VHS tape end marker */}
          <div
            className="text-primary/30 text-xs tracking-widest select-none"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            ── ▮▮ TAPE END ▮▮ ──
          </div>

          {genres && genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-0.5 border border-primary/20 text-primary/60 uppercase tracking-wider"
                  style={{ fontFamily: "'VT323', monospace" }}
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
                  className="text-xs text-muted-foreground hover:text-primary transition-colors tracking-wider uppercase"
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                  ▸ {platform}
                </a>
              ))}
            </div>
          )}

          <div className="text-center space-y-3">
            {/* VHS timestamp style copyright */}
            <p
              className="text-xs text-muted-foreground/80 tabular-nums"
              style={{ fontFamily: "'VT323', monospace" }}
            >
              © {new Date().getFullYear()} {siteName || 'Neuroklast'} ── ALL RIGHTS RESERVED
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground/50">
              {onImpressum && (
                <button
                  onClick={onImpressum}
                  className="hover:text-primary transition-colors tracking-wider uppercase"
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                  ▸ Impressum
                </button>
              )}
              {onDatenschutz && (
                <button
                  onClick={onDatenschutz}
                  className="hover:text-primary transition-colors tracking-wider uppercase"
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                  ▸ Datenschutz
                </button>
              )}
              {onAdminLogin && (
                <button
                  onClick={onAdminLogin}
                  className="hover:text-primary transition-colors tracking-wider uppercase"
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                  ▸ Admin
                </button>
              )}
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-xs text-primary/40 hover:text-primary transition-colors border border-primary/20 hover:border-primary/40 px-4 py-1.5 tracking-wider uppercase"
            style={{ fontFamily: "'VT323', monospace" }}
            aria-label="Back to top"
          >
            ▲ REW
          </button>

          <div
            className="text-primary/20 text-xs tracking-widest select-none tabular-nums"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            ■ STOP ── 00:00:00
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

VhsRetroFooter.displayName = 'VhsRetroFooter'
