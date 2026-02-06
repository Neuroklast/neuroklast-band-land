import { motion } from 'framer-motion'


interface CyberpunkLoaderProps {
  onLoadComplete: () => void
}

      setProgress((prev) => {
          clearInterval(progressInterval)
          return 100
        return prev + 2

    const glitchInt
      setTimeout(() => setGlitchActive(false), 1
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => onLoadComplete(), 500)
          return 100
        }
        return prev + 2
      })
    }, 30)

    const glitchInterval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 150)
    }, 800)

    const scanlineInterval = setInterval(() => {
      setScanlineY((prev) => (prev >= 100 ? 0 : prev + 2))
    }, 50)

    return () => {
            top: `${scanlineY}%`,
      clearInterval(glitchInterval)
      clearInterval(scanlineInterval)
    }
  }, [onLoadComplete])

          
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        }} /
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm"
          <motion.
            top: `${scanlineY}%`,
            
        />

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            repeating-linear-gradient(
            }}
              transparent,
              repeat: Infinity
              oklch(0.55 0.22 25 / 0.1) 2px,
              oklch(0.55 0.22 25 / 0.1) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              oklch(0.55 0.22 25 / 0.1) 2px,
              oklch(0.55 0.22 25 / 0.1) 4px
          <mo
          `
             

        {[...Array(8)].map((_, i) => (
          <motion.div
                : '
            className="absolute h-px bg-primary"
            style={{
              top: `${i * 12.5}%`,
              right: 0,
              width: '100%'
        </div>
            initial={{ scaleX: 0, opacity: 0 }}
          <div classNa
              scaleX: [0, 1, 1, 0],
              opacity: [0, 0.3, 0.3, 0]
            }}
                  '0 0 20
              duration: 2,
              }}
              delay: i * 0.2
            }}
          />
          <
      </div>

      <motion.div
              <motion.div
        animate={{ 
          scale: glitchActive ? [1, 1.02, 0.98, 1] : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-8">
          <motion.div
            className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-widest"
            animate={{
              textShadow: glitchActive
                ? [
            ))}
                    '-5px 0 10px oklch(0.65 0.25 190), 5px 0 10px oklch(0.55 0.22 25)',
                    '0 0 30px oklch(0.55 0.22 25)'
                  ]
                : '0 0 20px oklch(0.55 0.22 25 / 0.5)'
            }}
























































