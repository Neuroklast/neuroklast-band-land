import { motion } from 'framer-motion'

export default function SectionDivider() {
  return (
    <div className="relative w-full py-12 overflow-hidden">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="origin-left"
      >
        <svg
          className="w-full h-8"
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="glitch-noir-divider-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <rect x="0" y="19" width="40" height="2" className="fill-border" />
              <rect x="0" y="19" width="8" height="2" className="fill-accent" />
            </pattern>
          </defs>
          
          <rect
            x="0"
            y="0"
            width="1200"
            height="40"
            fill="url(#glitch-noir-divider-pattern)"
          />
          
          <line
            x1="0"
            y1="20"
            x2="1200"
            y2="20"
            className="stroke-accent"
            strokeWidth="1"
            strokeDasharray="10 5"
          />
          
          <circle cx="600" cy="20" r="4" className="fill-accent glitch-noir-pulse" />
          <circle cx="200" cy="20" r="2" className="fill-foreground" />
          <circle cx="1000" cy="20" r="2" className="fill-foreground" />
        </svg>
      </motion.div>

      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 text-muted-foreground font-mono text-xs opacity-50">
        {'[---SIGNAL_BREAK---]'}
      </div>
    </div>
  )
}
