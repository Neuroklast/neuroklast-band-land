import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, PencilSimple } from '@phosphor-icons/react'
import type { TerminalCommand } from '@/lib/types'

interface SecretTerminalProps {
  isOpen: boolean
  onClose: () => void
  customCommands?: TerminalCommand[]
  editMode?: boolean
  onEdit?: () => void
}

export default function SecretTerminal({ isOpen, onClose, customCommands = [], editMode, onEdit }: SecretTerminalProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Array<{ type: 'command' | 'output' | 'error', text: string }>>([
    { type: 'output', text: '> NEUROKLAST TERMINAL v1.3.37' },
    { type: 'output', text: '> SYSTEM INITIALIZED' },
    { type: 'output', text: '> TYPE "help" FOR AVAILABLE COMMANDS' },
    { type: 'output', text: '' }
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [history])

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    
    setHistory(prev => [...prev, { type: 'command', text: `> ${cmd}` }])

    let output: Array<{ type: 'command' | 'output' | 'error', text: string }> = []

    // Check custom commands first
    const customCmd = customCommands.find(c => c.name.toLowerCase() === trimmedCmd)

    if (customCmd) {
      output = [
        ...customCmd.output.map(text => ({ type: 'output' as const, text })),
        { type: 'output' as const, text: '' }
      ]
    } else {
      switch (trimmedCmd) {
        case 'help': {
          const allCommands = [
            { name: 'help', description: 'Show this message' },
            ...customCommands.map(c => ({ name: c.name, description: c.description })),
            { name: 'glitch', description: 'Trigger visual glitch' },
            { name: 'matrix', description: 'Display data stream' },
            { name: 'clear', description: 'Clear terminal' },
            { name: 'exit', description: 'Close terminal' },
          ]
          output = [
            { type: 'output', text: 'AVAILABLE COMMANDS:' },
            ...allCommands.map(c => ({
              type: 'output' as const,
              text: `  ${c.name.padEnd(10)} - ${c.description}`
            })),
            { type: 'output', text: '' }
          ]
          break
        }

        case 'glitch':
          output = [
            { type: 'output', text: 'INITIATING VISUAL CORRUPTION...' },
            { type: 'output', text: 'GLITCH SEQUENCE ACTIVATED' },
            { type: 'output', text: '' }
          ]
          document.documentElement.classList.add('red-glitch-text')
          setTimeout(() => {
            document.documentElement.classList.remove('red-glitch-text')
          }, 300)
          break

        case 'matrix':
          output = [
            { type: 'output', text: '01001110 01000101 01010101 01010010 01001111' },
            { type: 'output', text: '01001011 01001100 01000001 01010011 01010100' },
            { type: 'output', text: 'DECODING... NEUROKLAST' },
            { type: 'output', text: '' }
          ]
          break

        case 'clear':
          setHistory([
            { type: 'output', text: '> TERMINAL CLEARED' },
            { type: 'output', text: '' }
          ])
          setInput('')
          return

        case 'exit':
          onClose()
          return

        default:
          output = [
            { type: 'error', text: `COMMAND NOT FOUND: ${cmd}` },
            { type: 'error', text: 'TYPE "help" FOR AVAILABLE COMMANDS' },
            { type: 'output', text: '' }
          ]
          break
      }
    }

    setHistory(prev => [...prev, ...output])
    setInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleCommand(input)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-4xl h-[600px] bg-card border-2 border-primary/30 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 hud-scanline pointer-events-none opacity-20" />
            
            <div className="absolute top-0 left-0 right-0 h-12 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-xs text-primary uppercase tracking-wider">
                  TERMINAL ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-2">
                {editMode && onEdit && (
                  <button
                    onClick={onEdit}
                    className="text-primary hover:text-accent transition-colors"
                    title="Edit terminal commands"
                  >
                    <PencilSimple size={18} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-primary hover:text-accent transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div 
              ref={historyRef}
              className="absolute top-12 left-0 right-0 bottom-16 overflow-y-auto p-6 font-mono text-sm"
            >
              {history.map((line, i) => (
                <div
                  key={i}
                  className={`mb-1 ${
                    line.type === 'command' 
                      ? 'text-accent' 
                      : line.type === 'error' 
                      ? 'text-destructive' 
                      : 'text-foreground/80'
                  }`}
                >
                  {line.text}
                </div>
              ))}
            </div>

            <form 
              onSubmit={handleSubmit}
              className="absolute bottom-0 left-0 right-0 h-16 bg-primary/5 border-t border-primary/30 flex items-center px-6"
            >
              <span className="text-primary font-mono text-sm mr-2">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm caret-primary"
                placeholder="Enter command..."
                autoComplete="off"
                spellCheck={false}
              />
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
