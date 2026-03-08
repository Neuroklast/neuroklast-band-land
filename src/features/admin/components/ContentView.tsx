/**
 * ContentView — fullscreen admin content management panel.
 * Wraps ContentForms with a proper dialog shell.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { ContentForms } from './ContentForms'
import type { SiteConfig } from '@/lib/types'

interface ContentViewProps {
  open: boolean
  onClose: () => void
  siteConfig: SiteConfig
  onUpdate: (key: keyof SiteConfig, value: unknown) => void
}

export default function ContentView({ open, onClose, siteConfig, onUpdate }: ContentViewProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] bg-background/98 backdrop-blur-sm flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Header */}
          <div className="h-14 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-xs text-primary/70 tracking-wider uppercase">Content Manager</span>
            </div>
            <button onClick={onClose} className="text-primary/60 hover:text-primary p-1">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden">
            <ContentForms data={siteConfig} onUpdate={onUpdate} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
