'use client'

import { useEffect, useState } from 'react'
import { CustomerSignIn } from '@/components/neurokore/CustomerSignIn'

export function DigitalPackBuy({ id, title, price }: {id:string;title:string;price:string}) {
  const [signedIn,setSignedIn]=useState<boolean|null>(null)
  const [accepted,setAccepted]=useState(false)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  useEffect(()=>{
    void fetch('/api/neurokore/session',{cache:'no-store'})
      .then(response=>setSignedIn(response.ok)).catch(()=>setSignedIn(false))
  },[])
  async function buy(){
    if(!accepted||busy)return
    setBusy(true);setMessage('')
    try{
      const response=await fetch('/api/digital-packs/'+encodeURIComponent(id)+'/checkout',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({acceptedTerms:true}),
      })
      const data:{url?:string;error?:string}=await response.json()
      if(!response.ok||!data.url)throw new Error(data.error||'Checkout unavailable.')
      if(new URL(data.url).hostname!=='checkout.stripe.com')throw new Error('Invalid payment redirect.')
      window.location.assign(data.url)
    }catch(error){
      setMessage(error instanceof Error?error.message:'Checkout unavailable.')
      setBusy(false)
    }
  }
  return (
    <section className="space-y-4 border border-white/20 bg-zinc-950 p-5 sm:p-8">
      <h2 className="text-xl font-semibold">Buy {title}</h2>
      <p className="font-mono text-2xl font-bold text-white">{price}</p>
      {signedIn===false && (
        <div className="space-y-3 border-t border-zinc-700 pt-4">
          <p className="text-sm text-zinc-300">Sign in using your email to purchase and access your sound pack.</p>
          <CustomerSignIn />
        </div>
      )}
      {signedIn && (
        <>
          <p className="text-sm text-zinc-300">One-time purchase. Your ZIP download will appear in My Downloads after Stripe confirms your payment.</p>
          <div className="space-y-2 border-t border-zinc-700 pt-4 text-sm text-zinc-300">
            <p>Review the <a href="/terms" className="underline">terms of sale</a>,
              <a href="/license-terms" className="ml-2 underline">licence</a> and
              <a href="/withdrawal-policy" className="ml-2 underline">withdrawal information</a>.</p>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" checked={accepted} onChange={e=>setAccepted(e.target.checked)} />
              <span>I have read and agree to the terms, licence and withdrawal information.</span>
            </label>
          </div>
          <button type="button" disabled={!accepted||busy} onClick={()=>void buy()}
            className="min-h-12 border border-red-600 bg-red-900/70 px-5 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-40">
            {busy?'Opening secure checkout…':'Continue to secure payment'}
          </button>
        </>
      )}
      {message && <p role="alert" className="text-sm text-red-300">{message}</p>}
    </section>
  )
}
