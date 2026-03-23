import { motion } from 'framer-motion'
import { type NavigationSlotProps } from '@/lib/types'

export default function MinimalDarkNavigation({
  items,
}: NavigationSlotProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between pointer-events-none">
      <motion.div
        className="pointer-events-auto"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Simple minimal navigation */}
        <div className="flex gap-6">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => {
                if (item.id) {
                  e.preventDefault()
                  const el = document.getElementById(item.id)
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </motion.div>
    </nav>
  )
}
