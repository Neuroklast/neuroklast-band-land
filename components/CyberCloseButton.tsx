'use client'

import { motion } from 'framer-motion'
import { useLocale } from '@/contexts/LocaleContext'

interface CyberCloseButtonProps {
  onClick: () => void
  label?: string
  className?: string
  ariaLabel?: string
}

export default function CyberCloseButton({
  onClick,
  label,
  className = '',
  ariaLabel,
}: CyberCloseButtonProps) {
  const { t } = useLocale()
  const text = label ?? t('common.close')
  const accessible = ariaLabel ?? t('aria.closeOverlay')

  return (
    <motion.button
      type="button"
      data-overlay-close=""
      className={`group relative ml-auto flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 border border-primary/40 bg-black/60 px-2 py-1.5 font-mono text-xs tracking-widest text-primary/70 transition-all duration-200 hover:border-primary hover:bg-primary/20 hover:text-primary sm:px-3 ${className}`}
      style={{ zIndex: 'var(--z-local-top)' } as React.CSSProperties}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={accessible}
    >
      <span className="relative" aria-hidden>
        <span className="absolute top-1/2 left-0 inline-block h-[1px] w-2 rotate-45 bg-primary/60 group-hover:bg-primary" />
        <span className="absolute top-1/2 left-0 inline-block h-[1px] w-2 -rotate-45 bg-primary/60 group-hover:bg-primary" />
        <span className="inline-block w-2" />
      </span>
      <span className="hidden sm:inline">{text}</span>
    </motion.button>
  )
}
