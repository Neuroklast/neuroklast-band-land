import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { List, X } from '@phosphor-icons/react'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        setGlitch(true)
        setTimeout(() => setGlitch(false), 200)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  const navItems = [
    { label: 'HOME', id: 'hero' },
    { label: 'BIO', id: 'biography' },
    { label: 'GALLERY', id: 'gallery' },
    { label: 'SHOWS', id: 'gigs' },
    { label: 'RELEASES', id: 'releases' },
    { label: 'CONTACT', id: 'social' }
  ]

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/90 backdrop-blur-sm border-b border-primary/10' : 'bg-transparent'
        } ${glitch ? 'red-glitch-element' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <button
            onClick={() => scrollToSection('hero')}
            className={`text-base md:text-lg font-mono tracking-[0.08em] hover:text-primary/80 active:text-primary transition-colors touch-manipulation ${glitch ? 'red-glitch-text' : ''}`}
          >
            NEUROKLAST
          </button>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-xs font-mono tracking-[0.08em] hover:text-primary active:text-primary/80 transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full"></span>
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <List size={20} />}
          </Button>
        </div>
      </motion.nav>

      {isMobileMenuOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <motion.div
            className="fixed inset-x-0 top-0 z-40 bg-background md:hidden pt-16 pb-8 border-b border-primary/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-1 px-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  className="text-left py-4 px-4 border-b border-border/50 touch-manipulation font-mono text-base tracking-[0.08em] hover:bg-primary/5 active:bg-primary/10 active:scale-[0.98] transition-all rounded-sm relative overflow-hidden group"
                  onClick={() => scrollToSection(item.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-active:opacity-100 transition-opacity duration-150" />
                  <span className="relative z-10">{item.label}</span>
                </motion.button>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </motion.div>
        </>
      )}
    </>
  )
}
