import { requireAdmin } from '@/app/admin/_actions/auth'
import { createAdminClient } from '@/lib/supabaseAdmin'

export default async function IntegrationsPage() {
  await requireAdmin()
  const { data } = await createAdminClient().from('mcp_oauth_clients').select('client_id, provider, display_name, enabled')
  return <main className="mx-auto max-w-5xl space-y-5 p-4">
    <h1 className="text-2xl font-bold">AI Integrations</h1>
    <p className="text-zinc-400">Register OAuth apps in Supabase before allowing them to access editorial MCP tools.</p>
    <p className="text-sm">MCP: https://neuroklast.net/api/mcp</p>
    <section><h2>Registered clients</h2>
      {data?.map(client => <p key={client.client_id}>{client.display_name} / {client.provider}: {client.enabled ? 'Allowed' : 'Blocked'}</p>)}
    </section>
  </main>
}
