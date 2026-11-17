import { admin } from '@/lib/neurokore/server'
import { listBillingReviewRequests } from '@/lib/mcp/billing'
import { reviewBillingMcpAction } from '@/app/admin/_actions/billing'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import Link from 'next/link'
export const dynamic='force-dynamic'
export default async function BillingReview() {
  await admin()
  const requests=await listBillingReviewRequests()
  return <main>
    <AdminPageHeader title="MCP-Freigaben" description="Finanzielle Vorgänge werden erst nach separater MFA-geschützter Bestätigung ausgeführt."/>
    <div className="space-y-3">
      {requests.map(req=><section key={String(req.id)} className="border border-zinc-800 p-5 space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <strong>{req.operation==='issue_invoice'?'Rechnung ausstellen':'Zahlung erfassen'}</strong>
          <span className="text-zinc-400 text-sm">{String(req.status)}</span>
        </div>
        <p className="text-zinc-400 text-sm">Anfrage: {String(req.created_at)} · Kunde/Rechnung: <Link className="underline" href={'/admin/billing/'+String(req.invoice_id)}>Rechnung prüfen</Link></p>
        {req.operation==='record_payment'&&<p className="text-sm">Erfasster Betrag (Cent): {String((req.payload as Record<string,unknown>)?.amount_cents??'')}</p>}
        {req.status==='pending'&&<div className="flex flex-wrap gap-3">
          <form action={reviewBillingMcpAction}><input type="hidden" name="request_id" value={String(req.id)}/><input type="hidden" name="decision" value="approve"/>
            <button className="min-h-11 px-5 bg-red-800">Prüfung abgeschlossen: freigeben</button>
          </form>
          <form action={reviewBillingMcpAction}><input type="hidden" name="request_id" value={String(req.id)}/><input type="hidden" name="decision" value="reject"/>
            <button className="min-h-11 px-5 border border-zinc-700">Ablehnen</button>
          </form>
        </div>}
      </section>)}
      {requests.length===0&&<p className="text-zinc-400">Keine MCP-Rechnungsanfragen vorhanden.</p>}
    </div>
  </main>
}
