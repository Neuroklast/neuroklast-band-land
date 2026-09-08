'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { parseTerminalConfig, type TerminalConfig } from '@/lib/terminal-config'
import { SecretTerminalTrigger } from '@/app/_components/public/SecretTerminalTrigger'

const TerminalConfigContext = createContext<TerminalConfig>(parseTerminalConfig(null))

export function TerminalConfigProvider({
  value,
  children,
}: {
  value: TerminalConfig
  children: ReactNode
}) {
  return (
    <TerminalConfigContext.Provider value={value}>
      {children}
      <SecretTerminalTrigger secretCode={value.secretCode} />
    </TerminalConfigContext.Provider>
  )
}

export function useTerminalConfig(): TerminalConfig {
  return useContext(TerminalConfigContext)
}
