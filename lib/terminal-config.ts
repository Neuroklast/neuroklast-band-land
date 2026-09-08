import { DEFAULT_KONAMI_CODE } from '@/lib/konami'
import type { TerminalCommand } from '@/lib/types'

export const TERMINAL_CHEAT_PARAM = 'access-secret-terminal-NK-666'

export const TERMINAL_RESERVED_COMMANDS = ['help', 'clear', 'exit'] as const

export const DEFAULT_TERMINAL_COMMANDS: TerminalCommand[] = [
  {
    name: 'status',
    description: 'System status',
    output: ['AUDIO ENGINE: ONLINE', 'HUD: ACTIVE', 'THREAT LEVEL: LOW'],
  },
  {
    name: 'info',
    description: 'System info',
    output: ['SYSTEM: NEUROKLAST.NET', 'LOCATION: BAND LAND', 'FREQUENCY: CLASSIFIED'],
  },
]

export interface TerminalConfig {
  commands: TerminalCommand[]
  secretCode: string[]
  morseCode: string
}

function parseCommand(raw: unknown): TerminalCommand | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  const name = typeof source.name === 'string' ? source.name.trim().toLowerCase() : ''
  if (!name || !/^[a-z0-9_-]+$/.test(name)) return null
  if ((TERMINAL_RESERVED_COMMANDS as readonly string[]).includes(name)) return null
  const description = typeof source.description === 'string' ? source.description.trim() : ''
  const output = Array.isArray(source.output)
    ? source.output.filter((line): line is string => typeof line === 'string')
    : []
  const fileUrl = typeof source.fileUrl === 'string' && source.fileUrl.trim() ? source.fileUrl.trim() : undefined
  const fileName = typeof source.fileName === 'string' && source.fileName.trim() ? source.fileName.trim() : undefined
  const fileStoragePath =
    typeof source.fileStoragePath === 'string' && source.fileStoragePath.trim()
      ? source.fileStoragePath.trim()
      : undefined
  return { name, description: description || name, output, fileUrl, fileName, fileStoragePath }
}

export function parseTerminalConfig(raw: unknown): TerminalConfig {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const parsedCommands = Array.isArray(source.commands)
    ? source.commands.map(parseCommand).filter((cmd): cmd is TerminalCommand => cmd !== null)
    : []
  const seen = new Set<string>()
  const commands: TerminalCommand[] = []
  for (const cmd of parsedCommands) {
    if (seen.has(cmd.name)) continue
    seen.add(cmd.name)
    commands.push(cmd)
  }
  for (const cmd of DEFAULT_TERMINAL_COMMANDS) {
    if (seen.has(cmd.name)) continue
    seen.add(cmd.name)
    commands.push(cmd)
  }
  const secretCode = Array.isArray(source.secretCode)
    ? source.secretCode.filter((key): key is string => typeof key === 'string' && key.trim() !== '')
    : []
  const morseCode =
    typeof source.morseCode === 'string' && /^[.-]+$/.test(source.morseCode.trim())
      ? source.morseCode.trim()
      : '...'
  return {
    commands,
    secretCode: secretCode.length >= 2 ? secretCode : [...DEFAULT_KONAMI_CODE],
    morseCode,
  }
}

export function resolveTerminalCommand(
  commands: TerminalCommand[],
  command: string,
): TerminalCommand | undefined {
  const name = command.trim().toLowerCase()
  return commands.find((cmd) => cmd.name === name)
}
