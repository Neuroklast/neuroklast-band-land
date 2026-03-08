import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'

export default function SteampunkLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 30)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => onCompleteRef.current(), 800)
      return () => clearTimeout(t)
    }
  }, [progress])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiM1MzIyMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] bg-background flex flex-col items-center justify-center p-8 border-[20px] border-double border-primary/40 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.2)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg p-10 bg-card/80 border-4 border-primary/60 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(var(--primary-rgb),0.3)] flex flex-col items-center">
        {/* Ornate corners */}
        <div className="absolute -top-4 -left-4 w-10 h-10 border-t-8 border-l-8 border-primary rounded-tl-full shadow-[0_0_5px_rgba(0,0,0,0.5)]" />
        <div className="absolute -top-4 -right-4 w-10 h-10 border-t-8 border-r-8 border-primary rounded-tr-full shadow-[0_0_5px_rgba(0,0,0,0.5)]" />
        <div className="absolute -bottom-4 -left-4 w-10 h-10 border-b-8 border-l-8 border-primary rounded-bl-full shadow-[0_0_5px_rgba(0,0,0,0.5)]" />
        <div className="absolute -bottom-4 -right-4 w-10 h-10 border-b-8 border-r-8 border-primary rounded-br-full shadow-[0_0_5px_rgba(0,0,0,0.5)]" />

        <div className="text-6xl text-primary mb-8 animate-[steampunk-gear-rotate_10s_linear_infinite] drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">⚙</div>

        <h2 className="text-center font-heading text-2xl tracking-[0.4em] uppercase text-primary mb-12 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]">
          Igniting Boilers
        </h2>

        <div className="w-full relative h-6 bg-background/50 border-2 border-primary/50 p-1 rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full relative"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[steampunk-brass-shimmer_2s_infinite]" />
          </motion.div>
        </div>

        <div className="w-full mt-6 flex justify-between font-mono text-sm tracking-[0.2em] text-primary/70 uppercase">
          <span>Pressure: {Math.floor(progress * 1.5)} PSI</span>
          <span>Heat: {Math.floor(progress * 2.1)}°C</span>
        </div>

        <div className="mt-8 text-center font-body text-xs tracking-widest text-muted-foreground/60 italic">
          {progress < 100 ? 'Awaiting optimal steam pressure...' : 'Pressure reached. Engaging gears.'}
        </div>
      </div>
    </motion.div>
  )
}
SteampunkLoadingScreen.displayName = 'SteampunkLoadingScreen'