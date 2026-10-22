import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import { deleteProduct } from '@/app/admin/_actions/products'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { ConfirmDeleteButton } from '@/app/admin/_components/ConfirmDeleteButton'
import { isProductsSectionVisible, parseSections } from '@/lib/site-config-sections'
import { ProductSectionToggle } from './ProductSectionToggle'
import { ProductVisibilityToggle } from './ProductVisibilityToggle'

export default async function ProductsPage() {
  let items: Array<{
    id: string
    title: string
    href: string | null
    display_order: number
    active: boolean
  }> = []
  let sectionVisible = false
  let loadError = false

  try {
    const supabase = await createClient()
    const [{ data, error }, sectionsRow] = await Promise.all([
      supabase
        .from('products')
        .select('id, title, href, display_order, active')
        .neq('kind', 'plugin')
        .order('display_order', { ascending: true }),
      supabase.from('site_config').select('value').eq('key', 'sections').maybeSingle(),
    ])
    if (error) loadError = true
    else items = data ?? []
    sectionVisible = isProductsSectionVisible(parseSections(sectionsRow.data?.value))
  } catch {
    loadError = true
  }

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Software and other products on the public Products section. Toggle the section, then add or edit items. Images go to R2."
        action={
          <Link
            href="/admin/products/new"
            className="px-3 py-1.5 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
          >
            + New Product
          </Link>
        }
      />
      <ProductSectionToggle visible={sectionVisible} />
      {loadError ? (
        <p role="alert" className="text-sm text-red-400">Could not load products. Check the database connection.</p>
      ) : items.length === 0 ? (
        <div className="space-y-3">
          <p className="text-zinc-400 text-sm">No products yet.</p>
          <Link href="/admin/products/new" className="inline-flex min-h-[44px] items-center text-sm text-zinc-300 underline hover:text-white">
            Create first product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="text-left py-2 pr-4">Order</th>
              <th className="text-left py-2 pr-4">Title</th>
              <th className="text-left py-2 pr-4">Link</th>
              <th className="text-left py-2 pr-4">Status</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                <td className="py-2 pr-4 text-zinc-400">{item.display_order}</td>
                <td className="py-2 pr-4 text-zinc-200">{item.title}</td>
                <td className="py-2 pr-4 font-mono text-xs text-zinc-500">{item.href || '—'}</td>
                <td className="py-2 pr-4">
                  <ProductVisibilityToggle productId={item.id} active={item.active ?? true} />
                </td>
                <td className="py-2 text-right space-x-2">
                  <Link
                    href={`/admin/products/${item.id}`}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Edit
                  </Link>
                  <form
                    action={async () => {
                      'use server'
                      await deleteProduct(item.id)
                    }}
                    className="inline"
                  >
                    <ConfirmDeleteButton message="Delete this product?" />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
