import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { HeroSlotProps, ThemeSettings } from '@/lib/types'

export default function MinimalDarkHero({
  name,
  genres,
  logoUrl,
  titleImageUrl,
  heroButtons,
  themeSettings,
  onContactModalOpen,
}: HeroSlotProps & { themeSettings?: ThemeSettings }) {
  const buttons = heroButtons && heroButtons.length > 0 ? heroButtons : []
  const primary = themeSettings?.primary ?? 'oklch(0.50 0.22 25)'

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.03_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        {logoUrl && (
          <motion.div
            className="mb-8 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={logoUrl}
              alt={name || 'Artist Logo'}
              className="h-32 md:h-48 lg:h-64 w-auto object-contain"
              fetchPriority="high"
              loading="eager"
            />
          </motion.div>
        )}

        <motion.div
          className="mb-6 flex justify-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {titleImageUrl ? (
            <img
              src={titleImageUrl}
              alt={name}
              className="w-full max-w-md md:max-w-xl lg:max-w-2xl h-auto"
              fetchPriority="high"
              loading="eager"
            />
          ) : (
            <h1
              className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight text-foreground"
            >
              {name}
            </h1>
          )}
        </motion.div>

        {genres && genres.length > 0 && (
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mb-10 text-xs tracking-widest text-muted-foreground uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {genres.join(' / ')}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          {buttons.map((btn, idx) => (
            <Button
              key={btn.id}
              onClick={() => {
                if (btn.action === 'scroll') {
                  const el = document.getElementById(btn.scrollTarget || '')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                } else if (btn.action === 'url' && btn.url) {
                  window.open(btn.url, btn.openInNewTab !== false ? '_blank' : '_self')
                } else if (btn.action === 'contact-modal') {
                  onContactModalOpen?.()
                }
              }}
              variant={btn.variant ?? (idx === 0 ? 'default' : 'outline')}
              className="px-8 py-6 text-sm tracking-wider uppercase transition-all"
              style={btn.variant !== 'outline' ? { backgroundColor: primary, color: 'var(--background)' } : {}}
            >
              {btn.label}
            </Button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
