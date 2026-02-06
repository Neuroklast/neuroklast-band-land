import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CyberpunkLoaderProps {
  onLoadComplete: () => void
}

export default function CyberpunkLoader({ onLoadComplete }: CyberpunkLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [glitchActive, setGlitchActive] = useState(false)
  const [scanlineY, setScanlineY] = useState(0)

  useEffect(() => {
    const progressInterval = setInterval(() => {

      setScanlineY(prev =>

      clearInterval(progressInterval)
      clearInterval(
  }, [onL
  return (
      cl
      exit=

        <div 
          style={{
            height: '20%',
          }

    const scanlineInterval = setInterval(() => {
      setScanlineY(prev => (prev + 5) % 100)
    }, 50)

    return () => {
      clearInterval(progressInterval)
      clearInterval(glitchInterval)
      clearInterval(scanlineInterval)
    }
  }, [onLoadComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
          style={{
            top: `${scanlineY}%`,
            height: '20%',
            filter: 'blur(2px)',
          }}
        />
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              opacity: [0, 0.3, 0.3, 0],
                0deg,
                transparent,
                transparent 2px,
                oklch(0.55 0.22 25 / 0.1) 2px,
                oklch(0.55 0.22 25 / 0.1) 4px
        ))}
              repeating-linear-gradient(
      <div className="
                transparent,
          animate={{ 
                oklch(0.55 0.22 25 / 0.1) 2px,
                oklch(0.55 0.22 25 / 0.1) 4px
              )
            `
          }} />
              

        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            style={{
              top: `${(i * 5)}%`,
              }}
              right: 0,
            </
            initial={{ scaleX: 0, opacity: 0 }}
              <>
              scaleX: [0, 1, 1, 0],
              opacity: [0, 0.3, 0.3, 0],
            }}
            transition={{
              duration: 2,
                  color: 'oklc
              repeat: Infinity,
              repeatDelay: 1,
            }}
            
        ))}
        </mo

      <div className="relative z-10 text-center px-4 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            INITIALIZING
            scale: 1,
          <d
          transition={{ duration: 0.5 }}
          className={glitchActive ? 'glitch-effect' : ''}
        >
          <div className="mb-8 relative">
            <motion.div
              className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-widest"
              animate={{
  )



















































































































  )
}
