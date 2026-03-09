import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
const logoSvg = ""

import type { LoadingScreenSlotProps } from '@/lib/types'
type LoadingScreenProps = LoadingScreenSlotProps;

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const duration = 2500;
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / 2500) * 100, 100)

      setProgress(newProgress)

      if (newProgress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsComplete(true)
          onComplete?.()
        }, 800)
      }
    }, 16)

    return () => clearInterval(interval)
  }, [2500, onComplete])

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
          style={{ background: 'oklch(0.08 0 0)' }}
        >
          <div className="spark-theme-crt-overlay" />
          <div className="spark-theme-scanline" />

          <svg className="spark-theme-loading-frame-svg">
            <g className="top-left-loading-corner">
              <motion.line
                x1="30"
                y1="30"
                x2="30"
                y2="150"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
              />
              <motion.line
                x1="30"
                y1="30"
                x2="150"
                y2="30"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              />
              <motion.line
                x1="45"
                y1="45"
                x2="45"
                y2="120"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
              />
              <motion.line
                x1="45"
                y1="45"
                x2="120"
                y2="45"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
              />
            </g>

            <g className="top-right-loading-corner">
              <motion.line
                x1="calc(100vw - 30px)"
                y1="30"
                x2="calc(100vw - 30px)"
                y2="150"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
              />
              <motion.line
                x1="calc(100vw - 150px)"
                y1="30"
                x2="calc(100vw - 30px)"
                y2="30"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              />
              <motion.line
                x1="calc(100vw - 45px)"
                y1="45"
                x2="calc(100vw - 45px)"
                y2="120"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
              />
              <motion.line
                x1="calc(100vw - 120px)"
                y1="45"
                x2="calc(100vw - 45px)"
                y2="45"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
              />
            </g>

            <g className="bottom-right-loading-corner">
              <motion.line
                x1="calc(100vw - 30px)"
                y1="calc(100vh - 150px)"
                x2="calc(100vw - 30px)"
                y2="calc(100vh - 30px)"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
              />
              <motion.line
                x1="calc(100vw - 150px)"
                y1="calc(100vh - 30px)"
                x2="calc(100vw - 30px)"
                y2="calc(100vh - 30px)"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              />
              <motion.line
                x1="calc(100vw - 45px)"
                y1="calc(100vh - 120px)"
                x2="calc(100vw - 45px)"
                y2="calc(100vh - 45px)"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
              />
              <motion.line
                x1="calc(100vw - 120px)"
                y1="calc(100vh - 45px)"
                x2="calc(100vw - 45px)"
                y2="calc(100vh - 45px)"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
              />
            </g>

            <g className="bottom-left-loading-corner">
              <motion.line
                x1="30"
                y1="calc(100vh - 150px)"
                x2="30"
                y2="calc(100vh - 30px)"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
              />
              <motion.line
                x1="30"
                y1="calc(100vh - 30px)"
                x2="150"
                y2="calc(100vh - 30px)"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              />
              <motion.line
                x1="45"
                y1="calc(100vh - 120px)"
                x2="45"
                y2="calc(100vh - 45px)"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
              />
              <motion.line
                x1="45"
                y1="calc(100vh - 45px)"
                x2="120"
                y2="calc(100vh - 45px)"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
              />
            </g>

            <g className="loading-moon-accents">
              <motion.text
                x="60"
                y="75"
                className="moon-symbol-loading"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.7, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.1 }}
              >
                ☾
              </motion.text>
              <motion.text
                x="calc(100vw - 80px)"
                y="75"
                className="moon-symbol-loading"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.7, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.1 }}
              >
                ☾
              </motion.text>
              <motion.text
                x="calc(100vw - 80px)"
                y="calc(100vh - 55px)"
                className="moon-symbol-loading"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.7, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.1 }}
              >
                ☾
              </motion.text>
              <motion.text
                x="60"
                y="calc(100vh - 55px)"
                className="moon-symbol-loading"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.7, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.1 }}
              >
                ☾
              </motion.text>
            </g>
          </svg>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="text-center space-y-12"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex justify-center"
              >
                <img
                  src={logoSvg}
                  alt="Nebula Noir Logo"
                  className="w-48 h-48 object-contain spark-theme-logo-glow"
                  style={{
                    filter: 'drop-shadow(0 0 15px color-mix(in oklch, var(--foreground) 30%, transparent)) drop-shadow(0 0 30px color-mix(in oklch, var(--primary) 20%, transparent))'
                  }}
                />
              </motion.div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="flex items-center justify-center gap-4"
                >
                  <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-foreground" />
                  <h1
                    className="text-2xl tracking-[0.4em] uppercase spark-theme-bioshock-glow"
                    style={{ fontFamily: "'Poiret One', cursive" }}
                  >
                    Nebula Noir
                  </h1>
                  <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-foreground" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="text-xs tracking-[0.3em] text-muted-foreground uppercase"
                >
                  Cosmic Art Deco Goth
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  className="space-y-3"
                >
                  <div className="relative w-80 h-[3px] bg-border/30 mx-auto overflow-hidden">
                    <motion.div
                      className="absolute inset-0 h-full bg-gradient-to-r from-foreground via-primary to-foreground"
                      style={{
                        width: `${progress}%`,
                        boxShadow: '0 0 15px color-mix(in oklch, var(--foreground) 50%, transparent), 0 0 30px color-mix(in oklch, var(--primary) 30%, transparent)'
                      }}
                      transition={{ duration: 0.1 }}
                    />

                    <motion.div
                      className="absolute top-0 h-full w-1 bg-foreground"
                      style={{
                        left: `${progress}%`,
                        boxShadow: '0 0 8px color-mix(in oklch, var(--foreground) 80%, transparent)'
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    className="flex items-center justify-between w-80 mx-auto text-xs tracking-[0.2em] text-muted-foreground"
                  >
                    <span>LOADING</span>
                    <span className="spark-theme-bioshock-glow">{Math.round(progress)}%</span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl pointer-events-none"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
