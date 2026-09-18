import type { Metadata } from 'next'
import { SecretTerminalPage } from '@/app/_components/public/SecretTerminalPage'

export const metadata: Metadata = {
  title: 'NK.SEC',
  robots: { index: false, follow: false },
}

export default function NkSecPage() {
  return <SecretTerminalPage />
}
