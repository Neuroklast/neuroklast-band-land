import { motion } from 'framer-motion'
import type { LoadingScreenSlotProps } from '@/lib/types'

const BOOT_LINES = [
  '> INITIALIZING SECURE CONNECTION...',
  '> LOADING TACTICAL ASSETS...',
  '> ACCESS GRANTED',
]

interface UmbrellaLoadingProps extends LoadingScreenSlotProps {
  progress?: number
  lineIndex?: number
}

export default function LoadingScreen({ progress = 0, lineIndex = 0 }: UmbrellaLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
    >
      <div className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center">
          <div className="umbrella-corp-biohazard-ring" />
          <div className="umbrella-corp-biohazard-ring-inner absolute" />
        </div>

        <div className="w-full space-y-4">
          <motion.div
            className="font-mono text-primary text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {BOOT_LINES[lineIndex]}
          </motion.div>

          <div className="h-1 bg-border/30 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-primary umbrella-corp-progress-glow"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              style={{ transformOrigin: 'left' }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="umbrella-corp-pulse-dot w-2 h-2 rounded-full bg-primary block" />
              <span className="umbrella-corp-pulse-dot w-2 h-2 rounded-full bg-primary block" />
              <span className="umbrella-corp-pulse-dot w-2 h-2 rounded-full bg-primary block" />
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {`LOADING [${progress}%]`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
