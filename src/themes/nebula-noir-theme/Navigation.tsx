import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, X, ShoppingCart } from '@phosphor-icons/react'

import type { NavigationSlotProps } from '@/lib/types'
type NavigationProps = NavigationSlotProps;

export default function Navigation({ items, siteName }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              className="text-2xl font-bold tracking-[0.2em] text-foreground"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <span className="spark-theme-bioshock-glow">NN</span>
            </motion.div>

            <div className="hidden md:flex items-center gap-12">
              {items.map((item, index) => (
                <motion.a
                  key={`#${item.id}`}
                  href={`#${item.id}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative text-sm tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors duration-300 spark-theme-nav-link"
                >
                  {item.label}
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative text-foreground"
              >
                <ShoppingCart size={24} weight="thin" />

              </motion.button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-foreground"
              >
                {isOpen ? <X size={24} weight="thin" /> : <List size={24} weight="thin" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-background md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {items.map((item, index) => (
                <motion.a
                  key={`#${item.id}`}
                  href={`#${item.id}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => setIsOpen(false)}
                  className="text-3xl tracking-[0.2em] text-foreground hover:text-accent transition-colors duration-300"
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
