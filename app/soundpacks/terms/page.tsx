import type { Metadata } from 'next'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { TermsContent } from './TermsContent'

export const metadata: Metadata = { title: 'Sound Pack Purchase Terms | NEUROKLAST' }

export default function SoundpackTermsPage() {
  return <LegalPageShell><TermsContent /></LegalPageShell>
}
