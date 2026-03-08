import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { List, X } from '@phosphor-icons/react'

export default function AnalogDarkMetalNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'MAINFRAME', href: '#hero' },
    { label: 'TRANSMISSIONS', href: '#releases' },
    { label: 'OPERATIONS', href: '#events' },
    { label: 'VISUALS', href: '#gallery' },
    { label: 'COMMS', href: '#contact' }
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-background/95 backdrop-blur-md border-border/80 shadow-[0_2px_15px_rgba(0,0,0,0.8)]' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-primary font-mono text-sm tracking-widest font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-sm animate-pulse shadow-[0_0_8px_var(--primary)]" />
            <span className="opacity-80">SYS_CORE</span>
          </div>

          <div className="hidden md:flex gap-6 items-center bg-card/40 px-6 py-2 border border-border/40 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            {navItems.map((item, _i) => (
              <a
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-all font-mono text-xs tracking-widest relative group uppercase"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-3 text-primary">{'>'}</span>
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300 shadow-[0_0_5px_var(--primary)]" />
              </a>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary border border-primary/40 p-1 bg-card/50"
          >
            {isOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>

        {/* Oscilloscope baseline under nav when scrolled */}
        {scrolled && (
           <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary/20 overflow-hidden">
             <div className="w-full h-full bg-gradient-to-r from-transparent via-primary/80 to-transparent w-1/4 animate-[metal-oscilloscope_3s_linear_infinite]" />
           </div>
        )}
      </nav>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden border-b-4 border-primary"
        >
          <div className="theme-bg-grain opacity-20" />
          <div className="flex flex-col items-center justify-center h-full gap-8 relative z-10 px-6">
            {navItems.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="w-full text-center py-4 border-b border-border/50 text-foreground font-mono text-xl tracking-widest hover:text-primary transition-colors hover:bg-card/40"
              >
                <span className="text-primary/50 text-sm mr-2">{`0${i+1}`}</span> {item.label}
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </>
  )
}
AnalogDarkMetalNavigation.displayName = 'AnalogDarkMetalNavigation'