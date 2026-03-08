import { motion } from 'framer-motion'
import { useState } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import type { HeroSlotProps } from '@/lib/types'
import './styles.css'

export default function SteampunkHero({
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
    <section className="relative min-h-screen flex items-center justify-center px-4 py-16 md:py-20 overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none border-[20px] border-double border-primary/30 z-10" />
      <div className="absolute inset-8 pointer-events-none border border-primary/20 z-10" />

      {/* Corner Ornaments */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[radial-gradient(circle_at_top_left,var(--primary)_10%,transparent_50%)] opacity-20 z-20" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,var(--primary)_10%,transparent_50%)] opacity-20 z-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[radial-gradient(circle_at_bottom_left,var(--primary)_10%,transparent_50%)] opacity-20 z-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_bottom_right,var(--primary)_10%,transparent_50%)] opacity-20 z-20" />

      {/* Ambient center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.15)_0%,transparent_70%)] pointer-events-none z-[1]" />

      <div className="relative z-30 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full flex flex-col items-center"
        >
          {/* Decorative Top Accent */}
          <div className="mb-12 flex items-center justify-center gap-4 text-primary/60">
            <span className="w-16 h-px bg-primary/40" />
            <div className="w-4 h-4 rounded-full border border-primary/60 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-primary/80" />
            </div>
            <span className="w-16 h-px bg-primary/40" />
          </div>

          {logoUrl ? (
            <div className="mb-12 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]">
              <img src={logoUrl} alt={`${name} Logo`} className="max-w-full h-auto max-h-[35vh] object-contain filter sepia-[0.3] contrast-125" />
            </div>
          ) : titleImageUrl ? (
             <div className="mb-12 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]">
               <img src={titleImageUrl} alt={`${name} Logo`} className="max-w-full h-auto max-h-[35vh] object-contain filter sepia-[0.3] contrast-125" />
             </div>
          ) : (
            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-bold uppercase tracking-[0.15em] mb-10 text-foreground drop-shadow-[2px_4px_6px_rgba(0,0,0,0.8)] font-heading">
              {name}
            </h1>
          )}

          {genres && genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 mt-2 relative">
              <div className="absolute inset-0 bg-card/40 border border-primary/20 blur-[2px] -z-10 rounded-[100%]" />
              {genres.map((genre, idx) => (
                <span key={idx} className="px-4 py-1 text-sm md:text-lg tracking-[0.25em] font-body text-primary uppercase relative">
                  {idx > 0 && <span className="absolute -left-3 text-primary/40">•</span>}
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Decorative Bottom Accent */}
          <div className="mt-16 flex flex-col items-center justify-center gap-2 text-primary/60">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center animate-[steampunk-gear-rotate_15s_linear_infinite]">
              <div className="w-4 h-4 rounded-full border border-primary/60" />
            </div>
            <span className="w-px h-16 bg-gradient-to-b from-primary/60 to-transparent" />
          </div>

          {editMode && onEdit && (
            <Button onClick={onEdit} variant="outline" className="mt-12 border-primary text-primary hover:bg-primary hover:text-background z-40 relative font-heading uppercase tracking-widest rounded-none shadow-[2px_2px_0_var(--primary)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
              <PencilSimple className="mr-2" size={16} /> Edit Details
            </Button>
          )}
        </motion.div>
      </div>

      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 cursor-pointer flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity"
        onClick={scrollToNext}
      >
        <span className="text-xs font-heading tracking-[0.3em] text-primary/80 mb-4 uppercase">Descend</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
          <div className="w-6 h-6 border-b-2 border-r-2 border-primary rotate-45 shadow-[2px_2px_2px_rgba(0,0,0,0.5)]" />
        </motion.div>
      </div>
    </section>
  )
}
SteampunkHero.displayName = 'SteampunkHero'