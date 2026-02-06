import { motion } from 'framer-motion'

export default function CyberpunkBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent opacity-20" />
      
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"
          style={{
            left: `${(i * 12.5)}%`,
            height: '100%',
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.15, 0],
          }}
          transition={{
            duration: 4,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.50_0.22_25/0.02)_0%,transparent_50%)]" />
    </div>
  )
}
