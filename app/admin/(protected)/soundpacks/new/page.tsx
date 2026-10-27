import { SoundpackEditor } from '../SoundpackEditor'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'

export default function NewSoundpackPage() {
  return (
    <main>
      <AdminPageHeader title="New digital pack" description="Free NEUROKORE presets or paid downloadable audio sample packs. Files are private until a download is authorized." />
      <SoundpackEditor />
    </main>
  )
}