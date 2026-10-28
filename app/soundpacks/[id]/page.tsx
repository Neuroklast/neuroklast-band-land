import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { CdnImage } from '@/app/_components/public/CdnImage'
import { loadDigitalPack, euros, digitalPackSalesOpen } from '@/lib/digital-packs/store'
import { r2Url } from '@/lib/r2'
import { DigitalPackBuy } from './DigitalPackBuy'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title:'Digital Pack | NEUROKLAST AUDIO' }

export default async function DigitalPackDetail({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pack = await loadDigitalPack(id)
  if(!pack)notFound()
  const cover = r2Url(pack.image_storage_path) ?? pack.image_url
  return <LegalPageShell>
    <main className="min-h-screen bg-black px-5 pb-28 pt-28 text-white sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <nav className="font-mono text-xs text-zinc-400">
          <Link href="/soundpacks" className="hover:text-white">SOUND PACKS</Link> / {pack.title}
        </nav>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-6">
            {cover ? <div className="aspect-square overflow-hidden border border-zinc-800">
              <CdnImage src={cover} alt={pack.title} widths={[500,1000,1400]}
                sizes="(max-width:1024px) 90vw, 45vw" className="h-full w-full object-cover"/>
            </div>:<div className="flex aspect-square items-center justify-center border border-zinc-800 bg-zinc-950 font-mono text-xl tracking-widest text-zinc-500">NEUROKLAST AUDIO</div>}
            <p className="text-sm text-zinc-400">{pack.sample_count || 'Curated'} {pack.pack_type==='preset_pack'?'presets':'sounds'} · {pack.format_description}</p>
          </div>
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[.22em] text-red-400">
              {pack.pack_type==='preset_pack'?'NEUROKORE PRESETS':'SOUND LIBRARY'}
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{pack.title}</h1>
            <p className="whitespace-pre-wrap text-base leading-8 text-zinc-300">{pack.description}</p>
            <div id="pack-license" className="scroll-mt-32 space-y-2 border-y border-zinc-800 py-5">
              <h2 className="font-semibold">Usage licence</h2>
              <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{pack.license_notes}</p>
              {pack.pack_type==='preset_pack' &&
                <p className="text-sm text-zinc-400">Requires a compatible NEUROKORE version. Presets do not include the plugin.</p>}
            </div>
            {pack.is_free ?
              <a href={'/api/digital-packs/'+pack.id+'/download'}
                className="inline-flex min-h-12 items-center border border-red-600 bg-red-900/70 px-7 py-3 font-semibold hover:bg-red-800">
                Download free ZIP
              </a> :
              digitalPackSalesOpen() ?
                <DigitalPackBuy id={pack.id} title={pack.title} price={euros(pack.price_cents)}/> :
                <div className="space-y-2 border border-amber-800/40 p-5">
                  <p className="font-semibold">{euros(pack.price_cents)}</p>
                  <p className="text-sm text-zinc-400">Purchases are not open yet. This pack will be available at launch.</p>
                </div>}
          </div>
        </div>
      </div>
    </main>
  </LegalPageShell>
}
