import { useState, useEffect, useRef, startTransition } from 'react'
import { useLocale } from '@/hooks/use-locale'
import { motion } from 'framer-motion'
import { PencilSimple, Plus, Trash, CaretDown, CaretUp, Keyboard, Terminal } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CyberCloseButton from '@/components/CyberCloseButton'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import type { TerminalCommand } from '@/lib/types'
import { TERMINAL_RESERVED_COMMANDS } from '@/lib/config'
import { DEFAULT_KONAMI_CODE } from '@/components/KonamiListener'

interface TerminalSettingsDialogProps {
  open: boolean
  onClose: () => void
  commands: TerminalCommand[]
  secretCode: string[]
  morseCode: string
  onSave: (commands: TerminalCommand[], secretCode: string[], morseCode: string) => void
}

const RESERVED = TERMINAL_RESERVED_COMMANDS

const MORSE_RE = /^[.-]*$/

export default function TerminalSettingsDialog({
  open,
  onClose,
  commands,
  secretCode,
  morseCode,
  onSave,
}: TerminalSettingsDialogProps) {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<'commands' | 'shortcut' | 'morse'>('commands')

  // Commands state
  const [cmds, setCmds] = useState<TerminalCommand[]>(commands)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  // Key sequence state
  const [codeKeys, setCodeKeys] = useState<string[]>(
    secretCode && secretCode.length > 0 ? secretCode : DEFAULT_KONAMI_CODE
  )
  const [isRecordingKey, setIsRecordingKey] = useState(false)

  // Morse code state
  const [morseInput, setMorseInput] = useState(morseCode)
  const [morseError, setMorseError] = useState<string | null>(null)

  const prevOpenRef = useRef(false)

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      startTransition(() => {
        setCmds(commands)
        setCodeKeys(secretCode && secretCode.length > 0 ? secretCode : DEFAULT_KONAMI_CODE)
        setMorseInput(morseCode)
        setMorseError(null)
        setActiveTab('commands')
        setExpandedIdx(null)
        setIsRecordingKey(false)
      })
    }
    prevOpenRef.current = open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const hasNameConflict = (name: string, index: number) => {
    const lower = (name || '').toLowerCase().trim()
    if (RESERVED.includes(lower)) return 'Reserved command name'
    if (cmds.some((c, i) => i !== index && (c.name || '').toLowerCase().trim() === lower)) return 'Duplicate name'
    return null
  }

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

  const handleMorseChange = (value: string) => {
    setMorseInput(value)
    if (value && !MORSE_RE.test(value)) {
      setMorseError('Only dots (.) and dashes (-) are allowed')
    } else {
      setMorseError(null)
    }
  }

  const handleSave = () => {
    const validCmds = cmds.filter(c => c.name.trim() && c.description.trim())
    const validKeys = codeKeys.length >= 2 ? codeKeys : DEFAULT_KONAMI_CODE
    const validMorse = morseInput && MORSE_RE.test(morseInput) ? morseInput : morseCode
    onSave(validCmds, validKeys, validMorse)
    onClose()
  }

  return (
    <CyberModalBackdrop open={open} zIndex="z-[10001]" bgClass="bg-background/95 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl mt-8 bg-card border-2 border-primary/30 relative overflow-hidden flex flex-col"
        style={{ minHeight: '500px', maxHeight: '80dvh' }}
      >

        {/* Header */}
        <div className="h-12 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <Terminal size={14} className="text-primary" />
            <span className="font-mono text-xs text-primary uppercase tracking-wider">{t('terminalSettings.title')}</span>
          </div>
          <CyberCloseButton onClick={onClose} label="CLOSE" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-primary/20 bg-primary/5 flex-shrink-0">
          <button
            onClick={() => setActiveTab('commands')}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] tracking-wider transition-colors border-b-2 ${activeTab === 'commands' ? 'text-primary border-primary' : 'text-primary/40 border-transparent hover:text-primary/70'}`}
          >
            <PencilSimple size={12} /> {t('terminalSettings.tabCommands')}
          </button>
          <button
            onClick={() => setActiveTab('shortcut')}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] tracking-wider transition-colors border-b-2 ${activeTab === 'shortcut' ? 'text-primary border-primary' : 'text-primary/40 border-transparent hover:text-primary/70'}`}
          >
            <Keyboard size={12} /> {t('terminalSettings.tabKeySequence')}
          </button>
          <button
            onClick={() => setActiveTab('morse')}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] tracking-wider transition-colors border-b-2 ${activeTab === 'morse' ? 'text-primary border-primary' : 'text-primary/40 border-transparent hover:text-primary/70'}`}
          >
            <span className="font-mono text-[10px]">{t('terminalSettings.morseIcon')}</span> {t('terminalSettings.tabMorseCode')}
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {activeTab === 'commands' && (
            <>
              <p className="text-sm text-muted-foreground">
                {t('terminalSettings.commandsDescription')}
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
                    {conflict && <p className="text-xs text-destructive">{conflict}</p>}
                    {isExpanded && (
                      <div className="space-y-2 pl-2 border-l-2 border-primary/20 ml-2">
                        <Label className="text-xs text-muted-foreground">{t('terminalSettings.outputLines')}</Label>
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
                          <Plus size={12} className="mr-1" /> {t('terminalSettings.addLine')}
                        </Button>
                        <Label className="text-xs text-muted-foreground mt-2">{t('terminalSettings.fileDownload')}</Label>
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
                <Plus size={16} className="mr-2" /> {t('terminalSettings.addCommand')}
              </Button>
            </>
          )}

          {activeTab === 'shortcut' && (
            <>
              <p className="text-sm text-muted-foreground">
                {t('terminalSettings.keySequenceDescription')}
              </p>
              <div className="flex flex-wrap gap-2 min-h-[48px] p-3 border border-border bg-background/30">
                {codeKeys.map((key, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 font-mono text-xs text-primary"
                  >
                    {key}
                    <button
                      onClick={() => setCodeKeys(codeKeys.filter((_, ki) => ki !== i))}
                      className="text-primary/40 hover:text-destructive transition-colors ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {codeKeys.length === 0 && (
                  <span className="text-muted-foreground text-xs font-mono">{t('terminalSettings.noKeysDefined')}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`font-mono text-xs ${isRecordingKey ? 'border-primary text-primary animate-pulse' : ''}`}
                  onKeyDown={(e) => {
                    if (!isRecordingKey) return
                    e.preventDefault()
                    e.stopPropagation()
                    const modifierOnly = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab']
                    if (modifierOnly.includes(e.key)) return
                    setCodeKeys(prev => [...prev, e.key])
                    setIsRecordingKey(false)
                  }}
                  onBlur={() => setIsRecordingKey(false)}
                  onClick={() => setIsRecordingKey(true)}
                >
                  <Keyboard size={12} className="mr-1" />
                  {isRecordingKey ? t('terminalSettings.pressAKey') : t('terminalSettings.recordKey')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => setCodeKeys(DEFAULT_KONAMI_CODE)}
                >
                  {t('terminalSettings.resetToDefault')}
                </Button>
              </div>
              {codeKeys.length < 2 && (
                <p className="text-xs text-destructive">{t('terminalSettings.minKeysRequired')}</p>
              )}
            </>
          )}

          {activeTab === 'morse' && (
            <>
              <p className="text-sm text-muted-foreground">
                {t('terminalSettings.morseDescription')}
              </p>
              <div className="space-y-2">
                <Label className="text-xs font-mono text-primary">{t('terminalSettings.morseCodePattern')}</Label>
                <Input
                  value={morseInput}
                  onChange={(e) => handleMorseChange(e.target.value)}
                  placeholder="e.g. ... (S in Morse)"
                  className="font-mono text-sm tracking-[0.2em]"
                  maxLength={20}
                />
                {morseError && <p className="text-xs text-destructive">{morseError}</p>}
                {!morseError && morseInput && (
                  <p className="text-xs text-primary/60 font-mono">
                    {t('terminalSettings.currentCode')} <span className="text-primary tracking-[0.3em]">{morseInput}</span>
                  </p>
                )}
              </div>
              <div className="mt-4 p-3 border border-primary/20 bg-primary/5 space-y-1">
                <p className="text-xs font-mono text-primary/60">{t('terminalSettings.hint')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('terminalSettings.morseInstructions').split(/(<[1-4]>.*?<\/[1-4]>)/g).map((segment, i) => {
                    const tagMatch = segment.match(/^<([1-4])>(.*)<\/\1>$/)
                    if (!tagMatch) return <span key={i}>{segment}</span>
                    const tag = tagMatch[1]
                    const content = tagMatch[2]
                    if (tag === '1' || tag === '3') return <span key={i} className="text-primary font-mono">{content}</span>
                    return <span key={i} className="font-mono text-primary">{content}</span>
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('terminalSettings.morseTiming')}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-primary/20 bg-primary/5 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button
            onClick={handleSave}
            disabled={activeTab === 'shortcut' && codeKeys.length < 2}
          >
            {t('terminalSettings.saveSettings')}
          </Button>
        </div>
      </motion.div>
    </CyberModalBackdrop>
  )
}
