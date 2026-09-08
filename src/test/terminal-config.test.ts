import { describe, expect, it } from 'vitest'
import { DEFAULT_KONAMI_CODE } from '@/lib/konami'
import {
  DEFAULT_TERMINAL_COMMANDS,
  parseTerminalConfig,
  resolveTerminalCommand,
  TERMINAL_RESERVED_COMMANDS,
} from '@/lib/terminal-config'

describe('parseTerminalConfig', () => {
  it('falls back to defaults', () => {
    const config = parseTerminalConfig(null)
    expect(config.commands).toEqual(DEFAULT_TERMINAL_COMMANDS)
    expect(config.secretCode).toEqual(DEFAULT_KONAMI_CODE)
    expect(config.morseCode).toBe('...')
  })

  it('keeps custom commands and drops reserved names', () => {
    const config = parseTerminalConfig({
      commands: [
        { name: 'help', description: 'nope', output: ['x'] },
        { name: 'lore', description: 'Band lore', output: ['Industrial'] },
        { name: 'LORE', description: 'dup', output: ['skip'] },
      ],
      secretCode: ['a', 'b'],
      morseCode: '..-',
    })
    expect(config.commands).toEqual([{ name: 'lore', description: 'Band lore', output: ['Industrial'] }])
    expect(config.secretCode).toEqual(['a', 'b'])
    expect(config.morseCode).toBe('..-')
  })

  it('resolves commands case-insensitively via parser', () => {
    const config = parseTerminalConfig({
      commands: [{ name: 'Status', description: 'ok', output: ['ONLINE'] }],
    })
    expect(resolveTerminalCommand(config.commands, 'status')?.output).toEqual(['ONLINE'])
    expect(TERMINAL_RESERVED_COMMANDS).toContain('glitch')
  })
})
