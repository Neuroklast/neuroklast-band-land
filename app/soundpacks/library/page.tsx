import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { db, user } from '@/lib/neurokore/server'
import { CustomerSignIn } from '@/components/neurokore/CustomerSignIn'

export const metadata: Metadata = { title:'My Downloads | NEUROKLAST AUDIO',robots:{index:false,follow:false} }
export const dynamic = 'force-dynamic'

export default async function DigitalPackLibrary() {
  const buyer=await user().catch(()=>null)
  const orders=buyer ? await db().from('digital_pack_orders')
    .select('id,pack_id,pack_title,archive_filename,amount_cents,status,created_at')
    .eq('user_id',buyer.id).eq('email',buyer.email)
    .order('created_at',{ascending:false}).limit(100) : null
  return <LegalPageShell>
    <main className="min-h-screen bg-black px-5 pb-28 pt-28 text-white sm:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <p className="font-mono text-xs uppercase tracking-widest text-red-400">NEUROKLAST AUDIO / ACCOUNT</p>
        <h1 className="text-4xl font-bold">MY DOWNLOADS.</h1>
        {!buyer?<div className="space-y-4 border border-zinc-700 p-6">
          <p className="text-zinc-300">Sign in with your purchase email to download your packs.</p>
          <CustomerSignIn />
        </div>:<>
          <p className="text-sm text-zinc-400">Signed in as {buyer.email}</p>
          {orders?.error?<p role="alert">Your purchases are temporarily unavailable. Please contact support.</p>:
          orders?.data?.length===0?<p className="border border-zinc-700 p-6 text-zinc-300">No soundpack purchases yet. <Link href="/soundpacks" className="underline">Explore packs</Link>.</p>:
          <div className="space-y-3">
            {(orders?.data||[]).map(order=>
              <article key={order.id} className="flex flex-wrap items-center justify-between gap-4 border border-zinc-800 bg-zinc-950 p-5">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{order.pack_title||'Sound pack'}</h2>
                  <p className="text-xs text-zinc-400">Order {order.id.slice(0,8)} · {new Date(order.created_at).toLocaleDateString('de-DE')} · {order.status}</p>
                </div>
                {order.status==='paid'?<a href={'/api/digital-packs/'+order.pack_id+'/download'}
                  className="inline-flex min-h-11 items-center border border-red-600 px-5 py-2 text-sm hover:bg-red-900/40">
                  Download ZIP
                </a>:<span className="text-xs text-zinc-400">Download unavailable</span>}
              </article>
            )}
          </div>}
        </>}
      </div>
    </main>
  </LegalPageShell>
}
