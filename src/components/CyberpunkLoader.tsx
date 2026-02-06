import { motion } from 'framer-motion'



  const [progress, setProgre
 

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
      cl
    }

    <motion.div
      initial={{ opacity: 1
      transition={{ duration: 0.5 }}
      <div 

            top: `${scanlineY}%`,
        />
        <d

              tran
      clearInterval(progressInterval)
            ),
              90deg,
     
              oklch(0.

  return (
          <moti
            className="absolute h-px bg-primary"
              top: `${i * 12.5
              width: '100%'
            initial={{ scaleX: 0, op
     
            }}
        <motion.div
              delay: i * 0.2
          style={{
      </div>
          }}
        an

      >
          <motion.div
            animate={{
              0deg,
                    '-5px 
              transparent 2px,
            }}
          >
          </mo

          <div class
              className="a
              animate={{
                  ? '0 0 20px oklch(0.55 0.2
              }}
            )
          <
        }} />

            LOADING {progress}%
        </div>
            key={i}
}




            }}

            animate={{



            transition={{

              repeat: Infinity,



        ))}



        className="text-center"











                    '5px 0 10px oklch(0.55 0.22 25), -5px 0 10px oklch(0.65 0.25 190)',





            transition={{ duration: 0.3 }}
          >
            NEUROKLAST
          </motion.div>
        </div>

        <div className="w-64 sm:w-80 mx-auto">
          <div className="relative h-2 bg-card border border-border overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent"
              style={{ width: `${progress}%` }}
              animate={{
                boxShadow: glitchActive
                  ? '0 0 20px oklch(0.55 0.22 25)'
                  : '0 0 10px oklch(0.55 0.22 25 / 0.5)'
              }}
            />
          </div>

          <motion.div 
            className="mt-4 text-sm tracking-wider text-muted-foreground font-mono"
            animate={{
              opacity: glitchActive ? [1, 0.3, 1] : 1
            }}
          >
            LOADING {progress}%
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
