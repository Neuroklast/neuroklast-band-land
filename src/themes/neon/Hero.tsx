import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CaretDown, PencilSimple } from '@phosphor-icons/react'
import type { HeroSlotProps } from '@/lib/types'
import './styles.css'

export default function NeonHero({
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
    <section className="relative min-h-screen flex items-center justify-center px-4 py-16 md:py-20 overflow-hidden">
      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        {logoUrl && (
          <motion.div
            className="flex justify-center mb-8 md:mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src={logoUrl}
              alt={`${name} Logo`}
              className="w-[16rem] h-auto sm:w-[20rem] md:w-[24rem] lg:w-[28rem] drop-shadow-[0_0_20px_var(--primary)]"
            />
          </motion.div>
        )}

        <motion.div
          className="mb-4 md:mb-6 flex justify-center w-full px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          {titleImageUrl ? (
            <img
              src={titleImageUrl}
              alt={name}
              className="w-full max-w-xs sm:max-w-md md:max-w-2xl h-auto drop-shadow-[0_0_30px_var(--primary)]"
            />
          ) : (
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-wider uppercase text-foreground"
              style={{
                textShadow:
                  '0 0 10px var(--primary), 0 0 30px var(--primary), 0 0 60px var(--accent)',
              }}
            >
              {name}
            </h1>
          )}
        </motion.div>

        <motion.div
          className="w-48 md:w-72 h-px mb-8 md:mb-10 mx-auto"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
          style={{
            background: 'var(--primary)',
            boxShadow: '0 0 8px var(--primary), 0 0 20px var(--primary)',
          }}
        />

        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10 md:mb-14 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {(genres || []).map((genre, index) => (
            <motion.div
              key={genre}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.08 }}
            >
              <Badge
                variant="outline"
                className="border-[var(--primary)] text-[var(--primary)] bg-transparent px-3 py-1 md:px-4 md:py-1.5 text-xs font-body tracking-widest uppercase hover:bg-[var(--primary)] hover:text-background transition-all duration-300"
                style={{
                  boxShadow: '0 0 4px var(--primary)',
                }}
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
              className="border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-background text-xs ml-2"
            >
              <PencilSimple size={12} className="mr-1" />
              Edit Info
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Button
            onClick={scrollToNext}
            variant="outline"
            className="border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-[var(--primary)] hover:text-background px-8 py-6 text-sm font-body tracking-widest uppercase transition-all duration-300"
            style={{
              boxShadow: '0 0 6px var(--primary), 0 0 15px transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                '0 0 10px var(--primary), 0 0 30px var(--primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                '0 0 6px var(--primary), 0 0 15px transparent'
            }}
          >
            Explore
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
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
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: 'var(--primary)' }}
        >
          <CaretDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  )
}

NeonHero.displayName = 'NeonHero'
