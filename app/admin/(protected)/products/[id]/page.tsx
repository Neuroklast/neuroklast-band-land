import { createClient } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import { ProductForm } from '../ProductForm'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-6">Edit Product</h1>
      <ProductForm
        item={{
          id: String(data.id),
          title: String(data.title ?? ''),
          description: data.description ?? null,
          image_storage_path: data.image_storage_path ?? null,
          image_url: data.image_url ?? null,
          href: data.href ?? null,
          price_label: data.price_label ?? null,
          display_order: data.display_order ?? 0,
        }}
      />
    </div>
  )
}
