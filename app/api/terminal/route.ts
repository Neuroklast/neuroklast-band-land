import { NextResponse } from 'next/server'
import { terminalCommandSchema } from '@/api/_schemas'
import { createPublicClient } from '@/lib/supabaseServer'
import { consumeRateLimitForRequest } from '@/lib/rate-limit'
import { sanitizeExternalHref } from '@/lib/sanitize-href'
import { resolveImageUrl } from '@/lib/r2'
import {
  parseTerminalConfig,
  resolveTerminalCommand,
  TERMINAL_RESERVED_COMMANDS,
} from '@/lib/terminal-config'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = terminalCommandSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  try {
    const rl = await consumeRateLimitForRequest(request, {
      namespace: 'terminal',
      limit: 20,
      windowSeconds: 60,
    })
    if (!rl.allowed) {
      return new NextResponse(null, { status: 429 })
    }
  } catch (err) {
    console.warn('[terminal] rate limit unavailable, rejecting (fail-closed):', err)
    return new NextResponse(null, { status: 429 })
  }

  const command = parsed.data.command.toLowerCase()
  if ((TERMINAL_RESERVED_COMMANDS as readonly string[]).includes(command) && command !== 'help') {
    return NextResponse.json({ found: false })
  }

  const supabase = createPublicClient()
  const { data } = await supabase.from('site_config').select('value').eq('key', 'terminal').maybeSingle()
  const config = parseTerminalConfig(data?.value)

  if (command === 'help') {
    return NextResponse.json({
      listing: config.commands.map((cmd) => ({ name: cmd.name, description: cmd.description })),
    })
  }

  const match = resolveTerminalCommand(config.commands, command)
  if (!match) {
    return NextResponse.json({ found: false })
  }

  const fileUrl = sanitizeExternalHref(resolveImageUrl(match.fileStoragePath, match.fileUrl) ?? match.fileUrl)
  return NextResponse.json({
    found: true,
    output: match.output,
    fileUrl: fileUrl ?? undefined,
    fileName: fileUrl ? match.fileName || 'download' : undefined,
  })
}
