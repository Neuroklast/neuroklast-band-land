import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PencilSimple, Plus, Trash, CaretDown, CaretUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CyberCloseButton from '@/components/CyberCloseButton'
import type { TerminalCommand } from '@/lib/types'
import { downloadFile, type DownloadProgress } from '@/lib/download'

import {
  TERMINAL_RESERVED_COMMANDS,
  TERMINAL_TYPING_SPEED_MS,
} from '@/lib/config'

interface SecretTerminalProps {
  isOpen: boolean
  onClose: () => void
  customCommands?: TerminalCommand[]
  editMode?: boolean
  onEdit?: () => void
  onSaveCommands?: (commands: TerminalCommand[]) => void
}

const RESERVED = TERMINAL_RESERVED_COMMANDS
const TYPING_SPEED_MS = TERMINAL_TYPING_SPEED_MS

export default function SecretTerminal({ isOpen, onClose, customCommands = [], editMode, onSaveCommands }: SecretTerminalProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Array<{ type: 'command' | 'output' | 'error', text: string }>>([
    { type: 'output', text: '> NEUROKLAST TERMINAL v1.3.37' },
    { type: 'output', text: '> SYSTEM INITIALIZED' },
    { type: 'output', text: '> TYPE "help" FOR AVAILABLE COMMANDS' },
    { type: 'output', text: '' }
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false)
  const [cmds, setCmds] = useState<TerminalCommand[]>(customCommands)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (isOpen) {
      setCmds(customCommands)
      setIsEditing(false)
      setExpandedIdx(null)
    }
  }, [isOpen, customCommands])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Queue for typing effect – lines pending display
  const [typingQueue, setTypingQueue] = useState<Array<{ type: 'command' | 'output' | 'error', text: string }>>([])
  const [currentTyping, setCurrentTyping] = useState<{ type: 'command' | 'output' | 'error', text: string, displayed: string } | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  // File loading state
  const [fileLoading, setFileLoading] = useState(false)
  const [fileDlProgress, setFileDlProgress] = useState<DownloadProgress>({ state: 'idle', progress: 0 })
  const pendingFileRef = useRef<{ url: string; name: string } | null>(null)

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [history, currentTyping, fileLoading])

  // Process typing queue
  useEffect(() => {
    if (currentTyping || typingQueue.length === 0) return
    const [next, ...rest] = typingQueue
    setTypingQueue(rest)
    // Empty lines appear instantly
    if (!next.text) {
      setHistory(prev => [...prev, next])
      return
    }
    setCurrentTyping({ ...next, displayed: '' })
    setIsTyping(true)
  }, [typingQueue, currentTyping])

  // Character-by-character typing
  useEffect(() => {
    if (!currentTyping) return
    if (currentTyping.displayed.length >= currentTyping.text.length) {
      setHistory(prev => [...prev, { type: currentTyping.type, text: currentTyping.text }])
      setCurrentTyping(null)
      setIsTyping(false)
      return
    }
    const timer = setTimeout(() => {
      setCurrentTyping(prev => prev ? { ...prev, displayed: prev.text.slice(0, prev.displayed.length + 1) } : null)
    }, TYPING_SPEED_MS)
    return () => clearTimeout(timer)
  }, [currentTyping])

  // After typing finishes, handle pending file download with direct download + progress
  useEffect(() => {
    if (isTyping || typingQueue.length > 0) return
    if (!pendingFileRef.current) return
    const { url, name } = pendingFileRef.current
    pendingFileRef.current = null
    setFileLoading(true)
    setFileDlProgress({ state: 'downloading', progress: 0 })

    downloadFile(url, name, (progress) => {
      setFileDlProgress(progress)
      if (progress.state === 'complete') {
        setFileLoading(false)
        setHistory(prev => [...prev, { type: 'output', text: `DOWNLOAD COMPLETE: ${name}` }, { type: 'output', text: '' }])
      } else if (progress.state === 'error') {
        setFileLoading(false)
        setHistory(prev => [...prev, { type: 'error', text: `DOWNLOAD FAILED: ${progress.error || 'Unknown error'}` }, { type: 'output', text: '' }])
      }
    })
  }, [isTyping, typingQueue])

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    
    setHistory(prev => [...prev, { type: 'command', text: `> ${cmd}` }])

    // Built-in commands handled locally
    switch (trimmedCmd) {
      case 'clear':
        setHistory([
          { type: 'output', text: '> TERMINAL CLEARED' },
          { type: 'output', text: '' }
        ])
        setTypingQueue([])
        setCurrentTyping(null)
        setIsTyping(false)
        setInput('')
        return

      case 'exit':
        onClose()
        return
    }

    // All other commands (including "help") go through the API
    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: trimmedCmd }),
      })

      if (!res.ok) {
        setTypingQueue(prev => [...prev,
          { type: 'error', text: 'TERMINAL API ERROR' },
          { type: 'output', text: '' }
        ])
        setInput('')
        return
      }

      const data = await res.json()

      if (trimmedCmd === 'help') {
        const serverCmds: Array<{ name: string; description: string }> = data.listing || []
        const allCommands = [
          { name: 'help', description: 'Show this message' },
          ...serverCmds,
          { name: 'clear', description: 'Clear terminal' },
          { name: 'exit', description: 'Close terminal' },
        ]
        const output = [
          { type: 'output' as const, text: 'AVAILABLE COMMANDS:' },
          ...allCommands.map(c => ({
            type: 'output' as const,
            text: `  ${c.name.padEnd(10)} - ${c.description}`
          })),
          { type: 'output' as const, text: '' }
        ]
        setTypingQueue(prev => [...prev, ...output])
        setInput('')
        return
      }

      if (!data.found) {
        setTypingQueue(prev => [...prev,
          { type: 'error', text: `COMMAND NOT FOUND: ${cmd}` },
          { type: 'error', text: 'TYPE "help" FOR AVAILABLE COMMANDS' },
          { type: 'output', text: '' }
        ])
        setInput('')
        return
      }

      const output: Array<{ type: 'command' | 'output' | 'error', text: string }> = [
        ...(data.output || []).map((text: string) => ({ type: 'output' as const, text })),
        { type: 'output' as const, text: '' }
      ]
      if (data.fileUrl) {
        const fileName = data.fileName || 'download'
        output.push({ type: 'output' as const, text: `INITIATING DOWNLOAD: ${fileName}...` })
        pendingFileRef.current = { url: data.fileUrl, name: fileName }
      }
      setTypingQueue(prev => [...prev, ...output])
    } catch (err) {
      console.error('Terminal API request failed:', err)
      setTypingQueue(prev => [...prev,
        { type: 'error', text: 'CONNECTION ERROR' },
        { type: 'output', text: '' }
      ])
    }

    setInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleCommand(input)
    }
  }

  // Inline edit helpers
  const addCommand = () => {
    setCmds([...cmds, { name: '', description: '', output: [''] }])
    setExpandedIdx(cmds.length)
  }

  const removeCommand = (index: number) => {
    setCmds(cmds.filter((_, i) => i !== index))
    if (expandedIdx === index) setExpandedIdx(null)
  }

  const updateField = (index: number, field: 'name' | 'description' | 'fileUrl' | 'fileName', value: string) => {
    setCmds(cmds.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  const updateOutputLine = (cmdIdx: number, lineIdx: number, value: string) => {
    setCmds(cmds.map((c, i) => {
      if (i !== cmdIdx) return c
      const output = [...c.output]
      output[lineIdx] = value
      return { ...c, output }
    }))
  }

  const addOutputLine = (cmdIdx: number) => {
    setCmds(cmds.map((c, i) => i === cmdIdx ? { ...c, output: [...c.output, ''] } : c))
  }

  const removeOutputLine = (cmdIdx: number, lineIdx: number) => {
    setCmds(cmds.map((c, i) => {
      if (i !== cmdIdx) return c
      return { ...c, output: c.output.filter((_, li) => li !== lineIdx) }
    }))
  }

  const handleSaveCommands = () => {
    const validCmds = cmds.filter(c => c.name.trim() && c.description.trim())
    onSaveCommands?.(validCmds)
    setIsEditing(false)
  }

  const hasNameConflict = (name: string, index: number) => {
    const lower = (name || '').toLowerCase().trim()
    if (RESERVED.includes(lower)) return 'Reserved command name'
    if (cmds.some((c, i) => i !== index && (c.name || '').toLowerCase().trim() === lower)) return 'Duplicate name'
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-background/95 backdrop-blur-sm flex items-start justify-center p-4 pt-8 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl h-[min(600px,80dvh)] bg-card border-2 border-primary/30 relative overflow-hidden glitch-overlay-enter flex-shrink-0"
          >
            <div className="absolute inset-0 hud-scanline pointer-events-none opacity-20" />
            
            <div className="absolute top-0 left-0 right-0 h-12 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-xs text-primary uppercase tracking-wider">
                  {isEditing ? 'EDIT COMMANDS' : 'TERMINAL ACTIVE'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {editMode && onSaveCommands && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary hover:text-accent transition-colors"
                    title="Edit terminal commands"
                  >
                    <PencilSimple size={18} />
                  </button>
                )}
                <CyberCloseButton
                  onClick={() => { if (isEditing) { setIsEditing(false) } else { onClose() } }}
                  label={isEditing ? 'BACK' : 'CLOSE'}
                />
              </div>
            </div>

            {isEditing ? (
              <div className="absolute top-12 left-0 right-0 bottom-0 overflow-y-auto p-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add custom commands for the secret terminal. Built-in commands (help, glitch, matrix, clear, exit) cannot be overridden.
                </p>

                {cmds.map((cmd, idx) => {
                  const conflict = hasNameConflict(cmd.name, idx)
                  const isExpanded = expandedIdx === idx
                  return (
                    <div key={idx} className="border border-border rounded-md p-3 space-y-2">
                      <div className="flex gap-2 items-center">
                        <Input
                          value={cmd.name}
                          onChange={(e) => updateField(idx, 'name', e.target.value.toLowerCase().replace(/\s/g, ''))}
                          placeholder="command"
                          className="w-28 font-mono text-sm"
                        />
                        <Input
                          value={cmd.description}
                          onChange={(e) => updateField(idx, 'description', e.target.value)}
                          placeholder="Description"
                          className="flex-1 text-sm"
                        />
                        <Button variant="ghost" size="icon" onClick={() => setExpandedIdx(isExpanded ? null : idx)}>
                          {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeCommand(idx)}>
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      </div>
                      {conflict && (
                        <p className="text-xs text-destructive">{conflict}</p>
                      )}
                      {isExpanded && (
                        <div className="space-y-2 pl-2 border-l-2 border-primary/20 ml-2">
                          <Label className="text-xs text-muted-foreground">Output lines</Label>
                          {cmd.output.map((line, lineIdx) => (
                            <div key={lineIdx} className="flex gap-2 items-center">
                              <span className="text-xs text-muted-foreground font-mono w-4">{lineIdx + 1}</span>
                              <Input
                                value={line}
                                onChange={(e) => updateOutputLine(idx, lineIdx, e.target.value)}
                                placeholder="Output text..."
                                className="flex-1 font-mono text-xs"
                              />
                              {cmd.output.length > 1 && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeOutputLine(idx, lineIdx)}>
                                  <Trash size={12} />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={() => addOutputLine(idx)} className="text-xs">
                            <Plus size={12} className="mr-1" /> Add line
                          </Button>
                          <Label className="text-xs text-muted-foreground mt-2">File Download (optional)</Label>
                          <Input
                            value={cmd.fileUrl || ''}
                            onChange={(e) => updateField(idx, 'fileUrl', e.target.value)}
                            placeholder="File URL"
                            className="flex-1 text-xs"
                          />
                          <Input
                            value={cmd.fileName || ''}
                            onChange={(e) => updateField(idx, 'fileName', e.target.value)}
                            placeholder="File Name"
                            className="flex-1 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}

                <Button variant="outline" onClick={addCommand} className="w-full">
                  <Plus size={16} className="mr-2" /> Add Command
                </Button>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSaveCommands}>Save Commands</Button>
                </div>
              </div>
            ) : (
              <>
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
                  {/* Currently typing line */}
                  {currentTyping && (
                    <div
                      className={`mb-1 ${
                        currentTyping.type === 'command'
                          ? 'text-accent'
                          : currentTyping.type === 'error'
                          ? 'text-destructive'
                          : 'text-foreground/80'
                      }`}
                    >
                      {currentTyping.displayed}
                      <span className="animate-pulse">▌</span>
                    </div>
                  )}
                  {/* File loading animation */}
                  {fileLoading && (
                    <div className="my-3">
                      <div className="text-primary/70 mb-2 text-xs">DOWNLOADING FILE...</div>
                      <div className="w-48 h-1.5 bg-primary/20 overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: '0%' }}
                          animate={{ width: `${Math.max(fileDlProgress.progress * 100, 5)}%` }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="text-primary/40 text-[10px] mt-1 tracking-wider">
                        {fileDlProgress.progress > 0 ? `${Math.round(fileDlProgress.progress * 100)}% COMPLETE` : 'INITIATING TRANSFER...'}
                      </div>
                    </div>
                  )}
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
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
