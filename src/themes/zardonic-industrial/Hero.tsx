import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@phosphor-icons/react'
import type { HeroSlotProps, HeroButton } from '@/lib/types'

type HeroProps = HeroSlotProps;

const DEFAULT_BUTTONS: HeroButton[] = [
  { id: 'explore', label: 'Explore', action: 'scroll', scrollTarget: 'releases', variant: 'default' },
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

export default function Hero({ name, logoUrl, heroButtons, onContactModalOpen }: HeroProps) {
  const buttons = heroButtons && heroButtons.length > 0 ? heroButtons : DEFAULT_BUTTONS

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden zardonic-theme-scanline-effect">
      <div className="absolute inset-0 bg-black" />

      <div className="absolute inset-0 zardonic-theme-noise-effect" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 text-center px-4"
      >
        <motion.div
          className="mb-8 relative"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative mx-auto w-fit zardonic-theme-hero-logo-glitch">
            <img
              src={logoUrl || ''}
              alt={name || "ZARDONIC"}
              className="h-40 md:h-56 lg:h-72 w-auto object-contain brightness-110 zardonic-theme-hover-chromatic-image"
            />
            <img
              src={logoUrl || ''}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-40 md:h-56 lg:h-72 w-auto object-contain brightness-110 zardonic-theme-hero-logo-r"
            />
            <img
              src={logoUrl || ''}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-40 md:h-56 lg:h-72 w-auto object-contain brightness-110 zardonic-theme-hero-logo-b"
            />
          </div>
        </motion.div>

        {buttons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-12 flex gap-4 justify-center flex-wrap"
          >
            {buttons.map((btn, idx) => (
              <Button
                key={btn.id}
                size="lg"
                variant={btn.variant ?? (idx === 0 ? 'default' : 'outline')}
                onClick={() => handleHeroButton(btn, onContactModalOpen)}
                className="uppercase font-mono zardonic-theme-hover-glitch zardonic-theme-hover-noise relative zardonic-theme-cyber-border"
              >
                <span className="zardonic-theme-hover-chromatic">{btn.label}</span>
                {btn.action === 'scroll' && idx === 0 && <CaretDown className="ml-2" size={16} />}
              </Button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}

