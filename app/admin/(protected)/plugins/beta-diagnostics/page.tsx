import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { admin, db } from '@/lib/neurokore/server'

export const dynamic = 'force-dynamic'

export default async function BetaDiagnosticsPage() {
  await admin() // Admin auth plus MFA required for every report.
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const supabase = db()
  const [latest, total, errors] = await Promise.all([
    supabase.from('neurokore_beta_diagnostics')
      .select('id,created_at,plugin_version,event_code,os_family,host_family,plugin_format,cpu_cores_bucket,memory_gb_bucket,sample_rate,buffer_size,bundle,line_number')
      .order('created_at', { ascending: false }).limit(100),
    supabase.from('neurokore_beta_diagnostics')
      .select('id', { count: 'exact', head: true }).gte('created_at', cutoff),
    supabase.from('neurokore_beta_diagnostics')
      .select('id', { count: 'exact', head: true }).gte('created_at', cutoff)
      .in('event_code', ['js-error', 'promise-rejection', 'native-timeout']),
  ])
  if (latest.error || total.error || errors.error) {
    return <main className="max-w-6xl space-y-4">
      <AdminPageHeader title="NEUROKORE diagnostics" description="Beta error reports" />
      <p role="alert">Could not read reports. Apply the canonical Supabase schema first.</p>
    </main>
  }
  return <main className="max-w-6xl space-y-5">
    <AdminPageHeader title="NEUROKORE diagnostics" description="Opt-in technical reports. No identifiers or raw error messages." />
    <p className="text-sm text-zinc-400">Last 24 hours: {total.count ?? 0} reports, {errors.count ?? 0} errors.
      Data is retained for up to 90 days. Counts represent events, not unique users.</p>
    <div className="overflow-x-auto rounded border border-zinc-800">
      <table className="min-w-full text-left text-xs">
        <thead className="bg-zinc-900 text-zinc-300"><tr>
          {['Time', 'Version', 'Event', 'OS', 'DAW', 'Format', 'CPU / RAM', 'Audio', 'Bundle'].map((s) =>
            <th key={s} scope="col" className="px-3 py-2">{s}</th>)}
        </tr></thead>
        <tbody>
          {(latest.data ?? []).map((r) => <tr key={r.id} className="border-t border-zinc-800 text-zinc-400">
            <td className="whitespace-nowrap px-3 py-2">{new Date(r.created_at).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</td>
            <td className="px-3 py-2">{r.plugin_version}</td>
            <td className="px-3 py-2">{r.event_code}</td>
            <td className="px-3 py-2">{r.os_family}</td>
            <td className="px-3 py-2">{r.host_family}</td>
            <td className="px-3 py-2">{r.plugin_format}</td>
            <td className="px-3 py-2">{r.cpu_cores_bucket} cores / {r.memory_gb_bucket} GB</td>
            <td className="px-3 py-2">{r.sample_rate} Hz / {r.buffer_size} samples</td>
            <td className="px-3 py-2">{r.bundle ? r.bundle + ':' + (r.line_number ?? '?') : '—'}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
    <p className="text-xs text-zinc-500">Latest 100 events. Events sent while the plugin editor is closed are not captured by this version.</p>
  </main>
}
