import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { HeroSlotProps } from '@/lib/types'
import './styles.css'

export default function AnalogDarkMetalHero({
  name,
  genres,
  logoUrl,
  titleImageUrl,
}: HeroSlotProps) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-16 md:py-20 overflow-hidden bg-background">
      {/* Heavy-duty metallic borders */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-border/40 mix-blend-overlay shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] z-10" />

      {/* Industrial corner accents */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-primary/60 opacity-80 z-20 shadow-[0_0_10px_var(--primary)]" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-primary/60 opacity-80 z-20 shadow-[0_0_10px_var(--primary)]" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-primary/60 opacity-80 z-20 shadow-[0_0_10px_var(--primary)]" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-primary/60 opacity-80 z-20 shadow-[0_0_10px_var(--primary)]" />

      {/* Rivets */}
      <div className="absolute top-8 left-8 w-3 h-3 rounded-full bg-border shadow-[inset_1px_1px_3px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.8)] z-20" />
      <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-border shadow-[inset_1px_1px_3px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.8)] z-20" />
      <div className="absolute bottom-8 left-8 w-3 h-3 rounded-full bg-border shadow-[inset_1px_1px_3px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.8)] z-20" />
      <div className="absolute bottom-8 right-8 w-3 h-3 rounded-full bg-border shadow-[inset_1px_1px_3px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.8)] z-20" />

      {/* Background radial gradient spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-[1]" />

      <div className="relative z-30 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full flex flex-col items-center"
        >
          {logoUrl ? (
            <div className={`mb-12 transition-all duration-300 ${pulse ? 'scale-[1.02] filter drop-shadow-[0_0_15px_var(--primary)]' : 'filter drop-shadow-[0_0_5px_var(--primary)]'}`}>
              <img src={logoUrl} alt={`${name} Logo`} className="max-w-full h-auto max-h-[30vh] object-contain" />
            </div>
          ) : titleImageUrl ? (
             <div className="mb-12">
               <img src={titleImageUrl} alt={`${name} Logo`} className="max-w-full h-auto max-h-[30vh] object-contain shadow-2xl" />
             </div>
          ) : (
            <h1 className={`text-6xl md:text-8xl lg:text-[7rem] font-bold uppercase tracking-widest mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-primary to-background drop-shadow-[0_0_10px_var(--primary)] transition-all duration-300 ${pulse ? 'drop-shadow-[0_0_25px_var(--primary)] scale-[1.01]' : ''}`}>
              {name}
            </h1>
          )}

          {genres && genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {genres.map((genre, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute inset-0 bg-primary/20 skew-x-[-15deg] group-hover:bg-primary/40 transition-colors" />
                  <span className="relative block px-6 py-2 text-sm md:text-base tracking-[0.2em] font-mono text-primary group-hover:text-white transition-colors uppercase border-y border-primary/30">
                    {genre}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 w-px h-24 bg-gradient-to-b from-primary/80 to-transparent mx-auto opacity-70" />
        </motion.div>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 cursor-pointer flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity"
        onClick={scrollToNext}
      >
        <span className="text-[10px] font-mono tracking-widest text-primary mb-2 uppercase">Initiate</span>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <div className="w-4 h-4 border-b-2 border-r-2 border-primary rotate-45" />
          <div className="w-4 h-4 border-b-2 border-r-2 border-primary rotate-45 -mt-2 opacity-50" />
        </motion.div>
      </div>
    </section>
  )
}
AnalogDarkMetalHero.displayName = 'AnalogDarkMetalHero'