import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@phosphor-icons/react'
import type { HeroSlotProps, HeroButton } from '@/lib/types'

const DEFAULT_BUTTONS: HeroButton[] = [
  { id: 'explore', label: 'Explore', action: 'scroll', scrollTarget: 'news', variant: 'default' },
]

function handleHeroButton(btn: HeroButton, onContactModalOpen?: () => void) {
  if (btn.action === 'scroll') {
    const el = document.getElementById(btn.scrollTarget || '')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  } else if (btn.action === 'url' && btn.url) {
    window.open(btn.url, btn.openInNewTab !== false ? '_blank' : '_self', 'noopener,noreferrer')
  } else if (btn.action === 'contact-modal') {
    onContactModalOpen?.()
  }
}

export default function Hero({ name, logoUrl, heroButtons, onContactModalOpen }: HeroSlotProps) {
  const buttons = heroButtons && heroButtons.length > 0 ? heroButtons : DEFAULT_BUTTONS

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="umbrella-corp-biohazard-ring absolute" />
        <div className="umbrella-corp-biohazard-ring-inner absolute" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 text-center px-4"
      >
        {logoUrl ? (
          <motion.div
            className="mb-8 relative mx-auto w-fit isolate"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={logoUrl}
              alt={name || 'Artist'}
              className="h-40 md:h-56 lg:h-72 w-auto object-contain relative z-10"
            />
            <div className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 mix-blend-color" style={{ backgroundColor: 'var(--primary)', opacity: 'var(--hero-image-tint, 0)', maskImage: `url(${logoUrl})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskImage: `url(${logoUrl})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }} />
          </motion.div>
        ) : (
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground uppercase mb-8 umbrella-corp-glow-text"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {name}
          </motion.h1>
        )}

        {buttons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-10 flex gap-4 justify-center flex-wrap"
          >
            {buttons.map((btn, idx) => (
              <Button
                key={btn.id}
                size="lg"
                variant={btn.variant ?? (idx === 0 ? 'default' : 'outline')}
                onClick={() => handleHeroButton(btn, onContactModalOpen)}
                className="uppercase font-mono tracking-wider umbrella-corp-card"
              >
                {btn.label}
                {btn.action === 'scroll' && idx === 0 && <CaretDown className="ml-2" size={16} />}
              </Button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}

