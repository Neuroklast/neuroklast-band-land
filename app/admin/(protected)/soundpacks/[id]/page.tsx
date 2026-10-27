import { notFound } from 'next/navigation'
import { admin, db } from '@/lib/neurokore/server'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { SoundpackEditor, type EditableSoundpack } from '../SoundpackEditor'

export default async function EditSoundpackPage({ params }: { params: Promise<{ id: string }> }) {
  await admin()
  const { id } = await params
  const { data, error } = await db().from('soundpacks')
    .select('id,title,image_storage_path,image_url,external_url,display_order,description,pack_type,is_free,price_cents,archive_key,archive_filename,archive_bytes,sample_count,format_description,license_notes')
    .eq('id', id).single()
  if (error || !data) notFound()
  return (
    <main>
      <AdminPageHeader title={'Edit '+data.title} description="Manage secure ZIP, pack details, rights and pricing." />
      <SoundpackEditor item={data as EditableSoundpack}/>
    </main>
  )
}