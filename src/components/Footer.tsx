import { motion } from 'framer-motion'
import { LockSimple, ArrowUp } from '@phosphor-icons/react'
import type { SocialLinks } from '@/lib/types'
import { useLocale } from '@/contexts/LocaleContext'

interface FooterProps {
  socialLinks: SocialLinks
  genres?: string[]
  label?: string
  onAdminLogin?: () => void
  onImpressum?: () => void
  onDatenschutz?: () => void
}

export default function Footer({ socialLinks: _socialLinks, genres, label, onAdminLogin, onImpressum, onDatenschutz }: FooterProps) {
  const { t } = useLocale()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative border-t border-primary/20 bg-background hud-element">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 py-16 relative">
        <div className="absolute top-4 left-4 hidden md:block">
          <div className="data-readout text-[8px]">
            {t('footer.section')}
          </div>
        </div>

        <div className="absolute bottom-4 left-4">
          <div className="font-mono text-[10px] md:text-xs text-primary/60 tracking-wider">
            {t('footer.protocol')}
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
            <p className="tracking-wider">
              <span className="text-primary/40">&gt;</span> {genres?.join(' · ') || t('footer.defaultGenres')}
            </p>
            {label && (
              <p className="text-[10px] md:text-xs">{t('footer.label').replace('{0}', label)}</p>
            )}
            <p className="text-[10px] md:text-xs">{t('footer.copyright').replace('{0}', String(new Date().getFullYear()))}</p>
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="flex items-center gap-3">
                {onImpressum && (
                  <button
                    onClick={onImpressum}
                    className="inline-block text-[10px] md:text-xs text-muted-foreground/60 hover:text-primary/80 transition-colors font-mono tracking-wider"
                  >
                    {t('footer.impressum')}
                  </button>
                )}
                {onImpressum && onDatenschutz && (
                  <span className="text-muted-foreground/30 text-[10px]">|</span>
                )}
                {onDatenschutz && (
                  <button
                    onClick={onDatenschutz}
                    className="inline-block text-[10px] md:text-xs text-muted-foreground/60 hover:text-primary/80 transition-colors font-mono tracking-wider"
                  >
                    {t('footer.datenschutz')}
                  </button>
                )}
              </div>
              {onAdminLogin && (
                <button
                  onClick={onAdminLogin}
                  className="inline-flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground/30 hover:text-primary/60 transition-colors font-mono"
                  aria-label={t('footer.adminLogin')}
                >
                  <LockSimple size={12} />
                  <span>{t('footer.admin')}</span>
                </button>
              )}
            </div>
            <div className="pt-6">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground/50 hover:text-primary/80 transition-colors font-mono tracking-wider border border-primary/20 hover:border-primary/40 px-4 py-2"
                aria-label={t('footer.backToTop')}
              >
                <ArrowUp size={14} />
                <span>{t('footer.backToTop')}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
