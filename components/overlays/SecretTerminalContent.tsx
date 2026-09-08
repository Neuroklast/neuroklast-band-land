'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { downloadFile, type DownloadProgress } from '@/lib/download'
import { TERMINAL_TYPING_SPEED_MS } from '@/lib/config'
import { useLocale } from '@/contexts/LocaleContext'
import { useTerminalConfig } from '@/contexts/TerminalConfigContext'

type Line = { type: 'command' | 'output' | 'error'; text: string }

export function SecretTerminalContent({ siteName = '' }: { siteName?: string }) {
  const { t } = useLocale()
  const { commands } = useTerminalConfig()
  const prefersReducedMotion = useReducedMotion()
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Line[]>([
    { type: 'output', text: `> ${siteName ? `${siteName} ` : ''}${t('secretTerminal.initVersion')}` },
    { type: 'output', text: `> ${t('secretTerminal.initSystem')}` },
    { type: 'output', text: `> ${t('secretTerminal.initHelp')}` },
    { type: 'output', text: '' },
  ])
  const [typingQueue, setTypingQueue] = useState<Line[]>([])
  const [currentTyping, setCurrentTyping] = useState<{ type: Line['type']; text: string; displayed: string } | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileDlProgress, setFileDlProgress] = useState<DownloadProgress>({ state: 'idle', progress: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)
  const pendingFileRef = useRef<{ url: string; name: string } | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight
  }, [history, currentTyping, fileLoading])

  useEffect(() => {
    if (currentTyping || typingQueue.length === 0) return
    const [next, ...rest] = typingQueue
    setTypingQueue(rest)
    if (!next.text || prefersReducedMotion) {
      setHistory((prev) => [...prev, next])
      return
    }
    setCurrentTyping({ ...next, displayed: '' })
    setIsTyping(true)
  }, [typingQueue, currentTyping, prefersReducedMotion])

  useEffect(() => {
    if (!currentTyping) return
    if (currentTyping.displayed.length >= currentTyping.text.length) {
      setHistory((prev) => [...prev, { type: currentTyping.type, text: currentTyping.text }])
      setCurrentTyping(null)
      setIsTyping(false)
      return
    }
    const timer = window.setTimeout(() => {
      setCurrentTyping((prev) => (prev ? { ...prev, displayed: prev.text.slice(0, prev.displayed.length + 1) } : null))
    }, TERMINAL_TYPING_SPEED_MS)
    return () => window.clearTimeout(timer)
  }, [currentTyping])

  useEffect(() => {
    if (isTyping || typingQueue.length > 0 || !pendingFileRef.current) return
    const { url, name } = pendingFileRef.current
    pendingFileRef.current = null
    setFileLoading(true)
    setFileDlProgress({ state: 'downloading', progress: 0 })
    void downloadFile(url, name, (progress) => {
      setFileDlProgress(progress)
      if (progress.state === 'complete') {
        setFileLoading(false)
        setHistory((prev) => [...prev, { type: 'output', text: `${t('secretTerminal.transferComplete')}: ${name}` }, { type: 'output', text: '' }])
      } else if (progress.state === 'error') {
        setFileLoading(false)
        setHistory((prev) => [...prev, { type: 'error', text: `DOWNLOAD FAILED: ${progress.error || 'Unknown error'}` }, { type: 'output', text: '' }])
      }
    })
  }, [isTyping, typingQueue, t])

  const enqueue = useCallback((lines: Line[]) => {
    setTypingQueue((prev) => [...prev, ...lines])
  }, [])

  async function handleCommand(cmd: string) {
    const trimmed = cmd.trim().toLowerCase()
    setHistory((prev) => [...prev, { type: 'command', text: `> ${cmd}` }])

    if (trimmed === 'clear') {
      setHistory([{ type: 'output', text: `> ${t('secretTerminal.cleared')}` }, { type: 'output', text: '' }])
      setTypingQueue([])
      setCurrentTyping(null)
      setIsTyping(false)
      setInput('')
      return
    }
    if (trimmed === 'exit') {
      setInput('')
      document.querySelector<HTMLButtonElement>('button[aria-label="Close dialog"]')?.click()
      return
    }
    if (trimmed === 'help') {
      const allCommands = [
        { name: 'help', description: t('secretTerminal.helpDesc') },
        ...commands.map((item) => ({ name: item.name, description: item.description })),
        { name: 'clear', description: t('secretTerminal.clearDesc') },
        { name: 'exit', description: t('secretTerminal.exitDesc') },
      ]
      enqueue([
        { type: 'output', text: t('secretTerminal.availableCommands') },
        ...allCommands.map((item) => ({ type: 'output' as const, text: `  ${item.name.padEnd(10)} - ${item.description}` })),
        { type: 'output', text: '' },
      ])
      setInput('')
      return
    }
    if (!/^[a-z0-9_-]+$/.test(trimmed)) {
      enqueue([
        { type: 'error', text: `${t('secretTerminal.commandNotFound')}: ${cmd}` },
        { type: 'error', text: t('secretTerminal.typeHelp') },
        { type: 'output', text: '' },
      ])
      setInput('')
      return
    }

    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: trimmed }),
      })
      if (!res.ok) {
        enqueue([{ type: 'error', text: t('secretTerminal.apiError') }, { type: 'output', text: '' }])
        setInput('')
        return
      }
      const data = (await res.json()) as {
        found?: boolean
        output?: string[]
        fileUrl?: string
        fileName?: string
      }
      if (!data.found) {
        enqueue([
          { type: 'error', text: `${t('secretTerminal.commandNotFound')}: ${cmd}` },
          { type: 'error', text: t('secretTerminal.typeHelp') },
          { type: 'output', text: '' },
        ])
        setInput('')
        return
      }
      const output: Line[] = [
        ...(data.output ?? []).map((text) => ({ type: 'output' as const, text })),
        { type: 'output', text: '' },
      ]
      if (data.fileUrl) {
        output.push({ type: 'output', text: `${t('secretTerminal.initiatingDownload')}: ${data.fileName || 'download'}...` })
        pendingFileRef.current = { url: data.fileUrl, name: data.fileName || 'download' }
      }
      enqueue(output)
    } catch {
      enqueue([{ type: 'error', text: t('secretTerminal.connectionError') }, { type: 'output', text: '' }])
    }
    setInput('')
  }

  return (
    <div className="flex min-h-[min(28rem,60vh)] flex-col font-mono text-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="size-2.5 rounded-full bg-primary" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider text-primary">{t('secretTerminal.terminalActive')}</span>
      </div>
      <div ref={historyRef} className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1 scrollbar-hide" aria-live="polite">
        {history.map((line, index) => (
          <p
            key={`${line.type}-${index}-${line.text}`}
            className={
              line.type === 'command'
                ? 'text-accent'
                : line.type === 'error'
                  ? 'text-destructive'
                  : 'text-foreground/80'
            }
          >
            {line.text || '\u00A0'}
          </p>
        ))}
        {currentTyping ? (
          <p className={currentTyping.type === 'error' ? 'text-destructive' : 'text-foreground/80'}>
            {currentTyping.displayed}
            <span className="text-primary">{t('secretTerminal.cursorChar')}</span>
          </p>
        ) : null}
        {fileLoading ? (
          <p className="text-primary">
            {t('secretTerminal.initiatingDownload')} {Math.round((fileDlProgress.progress || 0) * 100)}%
          </p>
        ) : null}
      </div>
      <form
        className="mt-4 flex min-h-[44px] items-center gap-2 border-t border-primary/20 pt-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (!input.trim() || isTyping || fileLoading) return
          void handleCommand(input)
        }}
      >
        <span className="text-primary" aria-hidden="true">&gt;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-h-[44px] flex-1 bg-transparent text-foreground caret-primary outline-none"
          autoComplete="off"
          spellCheck={false}
          aria-label={t('secretTerminal.inputPlaceholder')}
          placeholder={t('secretTerminal.inputPlaceholder')}
        />
      </form>
    </div>
  )
}
