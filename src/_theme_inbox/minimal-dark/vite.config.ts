import { useState, useEffect } from 'react'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const navLinks = [
    { href: '#releases', label: 'ARCHIVES' },
    { href: '#events', label: 'COORDINATES' },
    { href: '#visualizer', label: 'ANALYZER' },
    { href: '#contact', label: 'TRANSMISSION' }
  ]

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 border-b border-border backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="signal-static-nav-scanline"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="#" className="font-mono text-xl font-bold text-foreground tracking-tighter signal-static-logo-glitch">
            NKLST_
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                className="signal-static-nav-item px-4 py-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors relative"
              >
                <span className="signal-static-nav-prefix text-accent">{'>'}</span> {link.label}
                {index < navLinks.length - 1 && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-border">|</span>
                )}
              </a>
            ))}
          </div>

          <div className="font-mono text-xs text-muted-foreground tabular-nums">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      </div>
    </nav>
  )
}
