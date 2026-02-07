import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, PencilSimple, Plus, Trash, CaretDown, CaretUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TerminalCommand } from '@/lib/types'

interface SecretTerminalProps {
  isOpen: boolean
  onClose: () => void
  customCommands?: TerminalCommand[]
  editMode?: boolean
  onEdit?: () => void
  onSaveCommands?: (commands: TerminalCommand[]) => void
}

const RESERVED = ['help', 'clear', 'exit', 'glitch', 'matrix']

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
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [history])

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    
    setHistory(prev => [...prev, { type: 'command', text: `> ${cmd}` }])

    let output: Array<{ type: 'command' | 'output' | 'error', text: string }> = []

    // Check custom commands first
    const customCmd = customCommands.find(c => c.name?.toLowerCase() === trimmedCmd)

    if (customCmd) {
      output = [
        ...customCmd.output.map(text => ({ type: 'output' as const, text })),
        { type: 'output' as const, text: '' }
      ]
      if (customCmd.fileUrl) {
        const fileName = customCmd.fileName || 'download'
        output.push({ type: 'output' as const, text: `INITIATING DOWNLOAD: ${fileName}...` })
        window.open(customCmd.fileUrl, '_blank', 'noopener,noreferrer')
      }
    } else {
      switch (trimmedCmd) {
        case 'help': {
          const allCommands = [
            { name: 'help', description: 'Show this message' },
            ...customCommands.map(c => ({ name: c.name, description: c.description })),
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
                <button
                  onClick={() => { if (isEditing) { setIsEditing(false) } else { onClose() } }}
                  className="text-primary hover:text-accent transition-colors"
                >
                  <X size={20} />
                </button>
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
