import { motion } from 'framer-motion'
import { useState } from 'react'
import { List, X } from '@phosphor-icons/react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { label: 'ENTRY', href: '#hero' },
    { label: 'RELEASES', href: '#releases' },
    { label: 'EVENTS', href: '#events' },
    { label: 'ANALYZER', href: '#visualizer' },
    { label: 'TRANSMISSION', href: '#contact' }
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-foreground font-mono text-sm tracking-widest">
            NK://SYS
          </div>

          <div className="hidden md:flex gap-8">
            {navItems.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-mono text-sm tracking-wider relative group"
              >
                <span className="glitch-noir-nav-underline">[</span>
                {item.label}
                <span className="glitch-noir-nav-underline">]</span>
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground"
          >
            {isOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="fixed inset-0 z-40 bg-background md:hidden"
        >
          <div className="glitch-noir-scanline-overlay" />
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navItems.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-foreground font-mono text-2xl tracking-widest hover:text-accent transition-colors"
              >
                {'>'} {item.label}
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </>
  )
}
