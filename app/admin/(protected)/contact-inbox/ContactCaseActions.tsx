'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ContactCaseActions({id,email,isClosed}:{id:string;email:string;isClosed:boolean}) {
  const router = useRouter()
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  async function update(closed:boolean) {
    setBusy(true);setMessage('')
    try {
      const response=await fetch('/api/admin/contact-inbox/status',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id,closed}),
      })
      if(!response.ok)throw new Error('Unable to update contact request.')
      router.refresh()
    } catch(error) {setMessage(error instanceof Error?error.message:'Unable to update.')}
    finally {setBusy(false)}
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a href={'mailto:'+encodeURIComponent(email)} className="min-h-10 border border-zinc-700 px-3 py-2 text-xs hover:border-red-700">Reply by email</a>
      <button type="button" disabled={busy} onClick={()=>void update(!isClosed)}
        className="min-h-10 border border-zinc-700 px-3 py-2 text-xs hover:border-red-700 disabled:opacity-40">
        {busy?'Saving…':isClosed?'Reopen request':'Mark resolved'}
      </button>
      {message && <span role="alert" className="text-xs text-red-300">{message}</span>}
    </div>
  )
}
