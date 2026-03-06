import { motion } from 'framer-motion'
import { ArrowUp } from '@phosphor-icons/react'
import type { FooterSlotProps } from '@/lib/types'
import './styles.css'

export default function NeonFooter({
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
    <footer className="relative border-t border-[var(--primary)] bg-background">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'var(--primary)',
          boxShadow: '0 0 8px var(--primary), 0 0 20px var(--primary)',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {genres && genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 border border-[var(--primary)] font-body tracking-widest uppercase transition-all duration-300 hover:bg-[var(--primary)] hover:text-background"
                  style={{
                    color: 'var(--primary)',
                    boxShadow: '0 0 3px var(--primary)',
                  }}
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
                  className="text-sm font-body tracking-wider uppercase text-muted-foreground transition-all duration-300 capitalize"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--primary)'
                    e.currentTarget.style.textShadow = '0 0 8px var(--primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = ''
                    e.currentTarget.style.textShadow = ''
                  }}
                >
                  {platform}
                </a>
              ))}
            </div>
          )}

          <div
            className="w-32 h-px mx-auto"
            style={{
              background: 'var(--primary)',
              boxShadow: '0 0 4px var(--primary), 0 0 10px var(--primary)',
            }}
          />

          <div className="text-center space-y-3">
            <p
              className="text-xs font-body tracking-wider"
              style={{ color: 'var(--muted-foreground)' }}
            >
              © {new Date().getFullYear()}{' '}
              <span
                style={{
                  color: 'var(--primary)',
                  textShadow: '0 0 6px var(--primary)',
                }}
              >
                {label || siteName || 'Neuroklast'}
              </span>
              . All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {onImpressum && (
                <button
                  onClick={onImpressum}
                  className="text-muted-foreground/70 font-body tracking-wider uppercase transition-all duration-300"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--primary)'
                    e.currentTarget.style.textShadow = '0 0 6px var(--primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = ''
                    e.currentTarget.style.textShadow = ''
                  }}
                >
                  Impressum
                </button>
              )}
              {onDatenschutz && (
                <button
                  onClick={onDatenschutz}
                  className="text-muted-foreground/70 font-body tracking-wider uppercase transition-all duration-300"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--primary)'
                    e.currentTarget.style.textShadow = '0 0 6px var(--primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = ''
                    e.currentTarget.style.textShadow = ''
                  }}
                >
                  Datenschutz
                </button>
              )}
              {onAdminLogin && (
                <button
                  onClick={onAdminLogin}
                  className="text-muted-foreground/70 font-body tracking-wider uppercase transition-all duration-300"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent)'
                    e.currentTarget.style.textShadow = '0 0 6px var(--accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = ''
                    e.currentTarget.style.textShadow = ''
                  }}
                >
                  Admin
                </button>
              )}
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs font-body tracking-wider uppercase border border-[var(--primary)] px-4 py-2 transition-all duration-300"
            style={{
              color: 'var(--primary)',
              boxShadow: '0 0 4px var(--primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary)'
              e.currentTarget.style.color = 'var(--background)'
              e.currentTarget.style.boxShadow =
                '0 0 10px var(--primary), 0 0 25px var(--primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--primary)'
              e.currentTarget.style.boxShadow = '0 0 4px var(--primary)'
            }}
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

NeonFooter.displayName = 'NeonFooter'
