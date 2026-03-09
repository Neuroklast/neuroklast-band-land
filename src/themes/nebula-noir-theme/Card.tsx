import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  delay?: number
}

export default function Card({ children, className = '', hoverable = true, delay = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hoverable ? { y: -8, scale: 1.02 } : {}}
      className={`
        relative bg-card border border-border
        spark-theme-card-wrapper
        ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="spark-theme-card-corners" />

      <div className="relative z-10 p-6">
        {children}
      </div>

      {hoverable && (
        <motion.div
          className="absolute inset-0 bg-accent/5 opacity-0 pointer-events-none"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  )
}
