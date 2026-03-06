import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CaretDown, PencilSimple } from '@phosphor-icons/react'
import type { HeroSlotProps } from '@/lib/types'
import './styles.css'

export default function ElegantHero({
  name,
  genres,
  editMode,
  onEdit,
  logoUrl,
  titleImageUrl,
}: HeroSlotProps) {
  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-16 md:py-20">
      {/* Subtle radial glow accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_center,var(--primary)/0.04,transparent_70%)]" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        {logoUrl && (
          <motion.div
            className="flex justify-center mb-8 md:mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src={logoUrl}
              alt={`${name} Logo`}
              className="w-[16rem] h-auto sm:w-[20rem] md:w-[24rem] lg:w-[28rem]"
            />
          </motion.div>
        )}

        <motion.div
          className="mb-6 md:mb-8 flex justify-center w-full px-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          {titleImageUrl ? (
            <img
              src={titleImageUrl}
              alt={name}
              className="w-full max-w-xs sm:max-w-md md:max-w-2xl h-auto"
            />
          ) : (
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight text-foreground">
              {name}
            </h1>
          )}
        </motion.div>

        {/* Decorative gold divider */}
        <motion.div
          className="flex items-center gap-3 mb-8 md:mb-10 w-48 md:w-64"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        >
          <span className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/50" />
          <span className="text-primary text-xs">✦</span>
          <span className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/50" />
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10 md:mb-14 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {(genres || []).map((genre, index) => (
            <motion.div
              key={genre}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 + index * 0.06 }}
            >
              <Badge
                variant="outline"
                className="border-primary/30 text-primary/80 px-3 py-1 md:px-4 md:py-1.5 text-xs font-body tracking-wide hover:border-primary/60 hover:text-primary transition-colors"
              >
                {genre}
              </Badge>
            </motion.div>
          ))}
          {editMode && onEdit && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary/70 hover:bg-primary/5 text-xs ml-2"
            >
              <PencilSimple size={12} className="mr-1" />
              Edit Info
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Button
            onClick={scrollToNext}
            variant="outline"
            className="border-primary/30 text-foreground/80 hover:bg-primary/5 hover:border-primary/50 hover:text-foreground px-8 py-6 text-sm font-body tracking-widest transition-all"
          >
            Discover
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CaretDown className="ml-2" size={16} />
            </motion.div>
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-primary/30"
        >
          <CaretDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  )
}

ElegantHero.displayName = 'ElegantHero'
