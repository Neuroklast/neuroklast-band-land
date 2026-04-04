import React, { useState, useEffect } from 'react'
import type { NavigationSlotProps } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Navigation({ items, onNavigate }: NavigationSlotProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const activeSectionId = '' // Default to empty string for active section

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'nav-container py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="font-heading font-bold text-2xl tracking-widest text-primary drop-shadow-[0_0_5px_var(--primary)] cursor-pointer" onClick={() => onNavigate?.('hero')}>
          SYS.INIT
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8">
          {items.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate?.(link.id)}
              className={`nav-link text-sm ${
                activeSectionId === link.id
                  ? 'text-primary drop-shadow-[0_0_8px_var(--primary)]'
                  : 'text-mutedForeground'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground hover:text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 nav-container border-t-0"
          >
            <div className="flex flex-col py-4 px-6 space-y-4">
              {items.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate?.(link.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`nav-link text-left text-lg ${
                    activeSectionId === link.id ? 'text-primary' : 'text-mutedForeground'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
