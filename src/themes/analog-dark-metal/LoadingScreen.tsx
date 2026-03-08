import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'

export default function AnalogDarkMetalLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
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
        return prev + 1.5
      })
    }, 40)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => onCompleteRef.current(), 500)
      return () => clearTimeout(t)
    }
  }, [progress])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeOut" } }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-8 border-[12px] border-border/20 shadow-[inset_0_0_100px_rgba(0,0,0,1)]"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjwvc3ZnPg==')] opacity-40 pointer-events-none" />
      <div className="theme-bg-spotlight opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-card/60 border border-border/50 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_rgba(255,255,255,0.05)]">
        {/* Rivets */}
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-border shadow-[inset_0_1px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.8)]" />
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-border shadow-[inset_0_1px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.8)]" />
        <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-border shadow-[inset_0_1px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.8)]" />
        <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-border shadow-[inset_0_1px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.8)]" />

        <div className="text-center mb-8 font-mono text-primary text-sm tracking-[0.3em] font-bold uppercase shadow-[0_0_15px_rgba(var(--primary),0.5)] bg-clip-text text-transparent bg-gradient-to-r from-primary/50 via-primary to-primary/50">
          SYSTEM_INITIALIZATION
        </div>

        <div className="space-y-4">
          <div className="flex justify-between font-mono text-xs text-muted-foreground uppercase tracking-widest">
            <span>Power Core</span>
            <span className="text-primary">{Math.floor(progress)}%</span>
          </div>

          <div className="h-4 bg-background/80 border border-border/60 relative overflow-hidden p-[2px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[metal-oscilloscope_1s_linear_infinite]" />
              <div className="absolute top-0 right-0 w-2 h-full bg-white/40 shadow-[0_0_10px_white]" />
            </motion.div>
          </div>

          <div className="font-mono text-[10px] text-muted-foreground/60 flex justify-between uppercase">
            <span>[VOLTAGE: {Math.floor(220 * (progress/100))}V]</span>
            <span className="animate-pulse">{progress < 100 ? 'CHARGING...' : 'OPTIMAL'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
AnalogDarkMetalLoadingScreen.displayName = 'AnalogDarkMetalLoadingScreen'