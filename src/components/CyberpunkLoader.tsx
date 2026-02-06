import { motion } from 'framer-motion'



  const [progress, setProgre
 

      setProgress((prev) => {
          setTimeout(() => onLoadComplete(), 
        }
      })

      setGlitchActi
    }, 800)
    const scanlineInterval = 
    }, 50)
    return () => {
      clearInterval(
    }

    <mot
      init

      <div className="absolute inset-0 overflo
          className="absolu
            top: `${scanlineY}%`,
           

        <div className="absolute inset-0 opacity
            backgroundImage: `
          

                ok
              repeating-linear-gradie
                transparent,
                oklch(0.55 0.22 25 / 
     
          }} />

          
            cla
              top: `${i * 5}%`,
              right: 0,
            initial={{ scal
              scaleX: [0, 1, 1, 0],
     
              duration: 2,
             
            }}
        ))}

        <motion.div
          animate={{ 
            
          
        
            <motion.div
              animate={{
                  ? [
                      '0 0 30px oklch(0.
                    ]
              }}
            >
                NEUROKLAST
            </motion.div>
              IN
          </div>
          <div classNa
              className="abs
              animate={{
                  '0 0 10px oklch(0.55 0.22 25
                  '0 0 10px oklch(0.55 0.22 2
              }
            /

            <d

            <div className="flex gap-1"
                <moti
                  c
                    scaleY: [0.3, 1, 0.3],
                    
                      'oklch(0.
                  }}
                    dur
              
                />
            </div>
        </motion.div>
    </motion.div>
}





















            <motion.div
              className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-widest"
              animate={{
































































  )
}
