import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { CdnImage } from '@/app/_components/public/CdnImage'
import { loadDigitalPacks, euros } from '@/lib/digital-packs/store'
import { r2Url } from '@/lib/r2'

export const metadata: Metadata = { title: 'Sound & Preset Packs | NEUROKLAST AUDIO',
  description: 'Download NEUROKORE preset packs and professional sound libraries.' }
export const dynamic = 'force-dynamic'

export default async function SoundpacksPage() {
  const packs = await loadDigitalPacks()
  return <LegalPageShell>
    <main className="min-h-screen bg-black px-5 pb-28 pt-28 text-white sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="max-w-3xl space-y-4">
          <p className="font-mono text-xs uppercase tracking-[.25em] text-red-400">NEUROKLAST AUDIO / LIBRARIES</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">SOUND & PRESET PACKS.</h1>
          <p className="text-lg leading-8 text-zinc-300">Sounds for your productions. Free NEUROKORE presets, one-shots, loops and curated production libraries.</p>
          <Link href="/soundpacks/library" className="inline-flex min-h-11 items-center border border-zinc-600 px-4 py-2 text-sm hover:border-red-500">My downloads</Link>
        </header>
        {packs.length === 0 ? <p className="border border-zinc-800 p-8 text-zinc-300">
          Our downloadable packs are being prepared. No packs have been published yet.
        </p> :
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {packs.map(pack=>{
            const cover = r2Url(pack.image_storage_path) ?? pack.image_url
            return <Link key={pack.id} href={'/soundpacks/'+pack.id}
              className="group flex flex-col overflow-hidden border border-zinc-800 bg-zinc-950 transition-colors hover:border-red-600">
              <div className="aspect-square overflow-hidden bg-zinc-900">
                {cover ? <CdnImage src={cover} alt={pack.title} widths={[320,640,900]}
                  sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
                  className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"/> :
                  <div className="flex h-full items-center justify-center font-mono text-xl tracking-widest text-zinc-500">NEUROKLAST AUDIO</div>}
              </div>
              <div className="space-y-3 p-5">
                <p className="font-mono text-xs uppercase tracking-wider text-red-400">{pack.pack_type==='preset_pack'?'NEUROKORE PRESETS':'SAMPLE LIBRARY'}</p>
                <h2 className="text-xl font-bold">{pack.title}</h2>
                <p className="line-clamp-3 text-sm text-zinc-400">{pack.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-semibold">{pack.is_free?'FREE':euros(pack.price_cents)}</span>
                  <span className="text-sm text-zinc-300">Explore →</span>
                </div>
              </div>
            </Link>
          })}
        </div>}
      </div>
    </main>
  </LegalPageShell>
}
