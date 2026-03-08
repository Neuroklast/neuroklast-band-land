import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { List, X } from '@phosphor-icons/react'

export default function SteampunkNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Exhibition', href: '#hero' },
    { label: 'Phonographs', href: '#releases' },
    { label: 'Expeditions', href: '#events' },
    { label: 'Chronicle', href: '#biography' },
    { label: 'Telegraph', href: '#contact' }
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b-4 ${scrolled ? 'bg-background/95 backdrop-blur-sm border-double border-primary/50 shadow-[0_4px_20px_rgba(0,0,0,0.8)]' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-primary font-heading text-lg tracking-[0.2em] font-bold uppercase drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]">
            <span className="text-xl">⚙</span> Aether
          </div>

          <div className="hidden md:flex gap-8 items-center border border-primary/20 bg-card/60 px-8 py-2 shadow-[inset_0_0_8px_rgba(var(--primary-rgb),0.2)]">
            {navItems.map((item, _i) => (
              <a
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-all font-body text-sm tracking-[0.2em] relative group uppercase font-medium drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                <span className="absolute -bottom-[2px] left-1/2 w-[3px] h-[3px] bg-primary rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 delay-150" />
              </a>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary border border-primary/50 p-2 bg-card/80 shadow-[1px_1px_0_var(--primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            {isOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md md:hidden flex flex-col items-center justify-center border-[12px] border-double border-primary/40"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
          <div className="flex flex-col items-center gap-8 relative z-10 w-full px-12">
            <div className="text-4xl text-primary mb-4 opacity-50 animate-[steampunk-gear-rotate_20s_linear_infinite]">⚙</div>
            {navItems.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="w-full text-center py-4 border-b border-dashed border-primary/30 text-foreground font-heading text-xl tracking-[0.3em] hover:text-primary hover:border-primary/80 transition-all uppercase"
              >
                {item.label}
              </motion.a>
            ))}
            <div className="text-4xl text-primary mt-4 opacity-50 animate-[steampunk-gear-counter_20s_linear_infinite]">⚙</div>
          </div>
        </motion.div>
      )}
    </>
  )
}
SteampunkNavigation.displayName = 'SteampunkNavigation'