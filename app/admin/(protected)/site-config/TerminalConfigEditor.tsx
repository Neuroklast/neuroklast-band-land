'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import { AdminField } from '@/app/admin/_components/AdminField'
import { FileSourcePicker } from '@/app/admin/_components/FileSourcePicker'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { DEFAULT_KONAMI_CODE } from '@/lib/konami'
import {
  parseTerminalConfig,
  TERMINAL_RESERVED_COMMANDS,
  type TerminalConfig,
} from '@/lib/terminal-config'
import type { TerminalCommand } from '@/lib/types'

export function TerminalConfigEditor({ currentValue }: { currentValue: Record<string, unknown> }) {
  const router = useRouter()
  const initial = useMemo(() => parseTerminalConfig(currentValue), [currentValue])
  const [commands, setCommands] = useState<TerminalCommand[]>(initial.commands)
  const [secretCode, setSecretCode] = useState(initial.secretCode.join(', '))
  const [morseCode, setMorseCode] = useState(initial.morseCode)
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(toPayload(initial)))
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const payload = useMemo(
    () => ({
      commands,
      secretCode: secretCode.split(',').map((key) => key.trim()).filter(Boolean),
      morseCode: morseCode.trim() || '...',
    }),
    [commands, secretCode, morseCode],
  )
  useUnsavedChanges(JSON.stringify(payload) !== savedSnapshot)

  function updateCommand(index: number, patch: Partial<TerminalCommand>) {
    setCommands((current) => current.map((cmd, i) => (i === index ? { ...cmd, ...patch } : cmd)))
  }

  async function handleSave() {
    setStatus('saving')
    setErrorMsg(null)
    const names = payload.commands.map((cmd) => cmd.name.trim().toLowerCase())
    if (names.some((name) => (TERMINAL_RESERVED_COMMANDS as readonly string[]).includes(name))) {
      setStatus('error')
      setErrorMsg(`Reserved names: ${TERMINAL_RESERVED_COMMANDS.join(', ')}`)
      return
    }
    if (new Set(names.filter(Boolean)).size !== names.filter(Boolean).length) {
      setStatus('error')
      setErrorMsg('Duplicate command names')
      return
    }
    const fd = new FormData()
    fd.set('key', 'terminal')
    fd.set('value', JSON.stringify(payload))
    const result = await updateSiteConfig(fd)
    if (result.error) {
      setStatus('error')
      setErrorMsg(result.error)
    } else {
      setStatus('saved')
      setSavedSnapshot(JSON.stringify(payload))
      const { broadcastAdminRefresh } = await import('@/lib/admin-draft-channel')
      broadcastAdminRefresh()
      router.refresh()
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <div className="space-y-4 rounded border border-zinc-800 p-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-200">Secret Terminal</h2>
        <p className="mt-0.5 text-xs text-zinc-400">
          Konami (or custom keys) and Morse on the nav logo open the overlay terminal. Built-ins: help, clear, exit, glitch, matrix.
        </p>
      </div>
      <AdminField id="terminal-secret-code" label="Key sequence" labelClassName="mb-1 block text-xs text-zinc-400">
        <input
          id="terminal-secret-code"
          value={secretCode}
          onChange={(event) => setSecretCode(event.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-white"
          placeholder={DEFAULT_KONAMI_CODE.join(', ')}
        />
      </AdminField>
      <AdminField id="terminal-morse" label="Morse on logo (dots/dashes)" labelClassName="mb-1 block text-xs text-zinc-400">
        <input
          id="terminal-morse"
          value={morseCode}
          onChange={(event) => setMorseCode(event.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-white"
          placeholder="..."
        />
      </AdminField>
      <div className="space-y-3">
        {commands.map((cmd, index) => (
          <div key={index} className="space-y-2 rounded border border-zinc-800 p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminField id={`terminal-cmd-name-${index}`} label="Name" labelClassName="mb-1 block text-xs text-zinc-400">
                <input
                  id={`terminal-cmd-name-${index}`}
                  value={cmd.name}
                  onChange={(event) => updateCommand(index, { name: event.target.value })}
                  className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-white"
                />
              </AdminField>
              <AdminField id={`terminal-cmd-desc-${index}`} label="Description" labelClassName="mb-1 block text-xs text-zinc-400">
                <input
                  id={`terminal-cmd-desc-${index}`}
                  value={cmd.description}
                  onChange={(event) => updateCommand(index, { description: event.target.value })}
                  className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                />
              </AdminField>
            </div>
            <AdminField id={`terminal-cmd-output-${index}`} label="Output (one line per row)" labelClassName="mb-1 block text-xs text-zinc-400">
              <textarea
                id={`terminal-cmd-output-${index}`}
                value={cmd.output.join('\n')}
                onChange={(event) => updateCommand(index, { output: event.target.value.split('\n') })}
                rows={3}
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-white"
              />
            </AdminField>
            <FileSourcePicker
              label="Download file (R2)"
              storagePrefix={`terminal/${cmd.name || `cmd-${index}`}`}
              currentUrl={cmd.fileUrl ?? null}
              currentStoragePath={cmd.fileStoragePath ?? null}
              currentFilename={cmd.fileName ?? null}
              onResolved={(result) =>
                updateCommand(index, {
                  fileStoragePath: result.storagePath,
                  fileUrl: result.publicUrl,
                  fileName: result.originalFilename || cmd.fileName,
                })
              }
              onCleared={() =>
                updateCommand(index, { fileStoragePath: undefined, fileUrl: undefined, fileName: undefined })
              }
            />
            <AdminField id={`terminal-cmd-filename-${index}`} label="File name" labelClassName="mb-1 block text-xs text-zinc-400">
              <input
                id={`terminal-cmd-filename-${index}`}
                value={cmd.fileName ?? ''}
                onChange={(event) => updateCommand(index, { fileName: event.target.value })}
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-white"
              />
            </AdminField>
            <button
              type="button"
              className="text-xs text-zinc-400 underline hover:text-zinc-200"
              onClick={() => setCommands((current) => current.filter((_, i) => i !== index))}
            >
              Remove command
            </button>
          </div>
        ))}
        <button
          type="button"
          className="min-h-[44px] rounded border border-zinc-700 px-3 text-sm text-zinc-300 hover:text-white"
          onClick={() => setCommands((current) => [...current, { name: '', description: '', output: [''] }])}
        >
          Add command
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={status === 'saving'}
          className="min-h-[44px] rounded bg-zinc-700 px-4 text-sm text-white hover:bg-zinc-600 disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save terminal'}
        </button>
        {status === 'saved' ? <span className="text-xs text-green-400">Saved</span> : null}
        {status === 'error' ? <span className="text-xs text-red-400">{errorMsg ?? 'Error'}</span> : null}
      </div>
    </div>
  )
}

function toPayload(config: TerminalConfig) {
  return {
    commands: config.commands,
    secretCode: config.secretCode,
    morseCode: config.morseCode,
  }
}
