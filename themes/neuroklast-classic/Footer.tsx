'use client'

import { motion } from 'framer-motion'
import { ArrowUp } from '@phosphor-icons/react'
import type { FooterSlotProps } from '@/lib/types'
import './styles.css'

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
    window.scrollTo({ top: 0 })
  }

  const socialEntries = Object.entries(socialLinks ?? {})

  return (
    <footer className="relative border-t border-primary/20 bg-background">
      {/* Top crimson accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-14 md:py-16 relative">
        {label ? (
          <p className="mb-6 text-center font-mono text-[10px] md:text-xs text-primary/50 tracking-wider uppercase">
            {label}
          </p>
        ) : null}

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
                  className="nk-os-chip"
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
                   className="nk-os-nav capitalize"
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
                  className="nk-os-nav"
                >
                  {IMPRESSUM_TEXT}
                </button>
              )}
              {onDatenschutz && (
                <button
                  onClick={onDatenschutz}
                  className="nk-os-nav"
                >
                  {DATENSCHUTZ_TEXT}
                </button>
              )}
              {onAdminLogin && (
                <button
                  onClick={onAdminLogin}
                  className="nk-os-nav"
                >
                  {ADMIN_LOGIN_TEXT}
                </button>
              )}
            </div>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="nk-os-btn text-[10px]"
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
