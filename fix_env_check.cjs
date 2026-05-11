const fs = require('fs');
let content = `import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * GET /api/env-check
 *
 * Returns the presence status of required environment variables.
 * Only reports whether each variable is set (boolean) — never exposes values.
 * Used by the SetupWizard to guide new users through ENV configuration.
 */

interface VercelRequest {
  method?: string
  body?: Record<string, unknown>
  query?: Record<string, string | string[]>
  headers: Record<string, string | string[] | undefined>
}

interface VercelResponse {
  setHeader(key: string, value: string): VercelResponse
  status(code: number): VercelResponse
  json(data: unknown): VercelResponse
  end(): VercelResponse
}

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Ensure it validates against .env.example
  let requiredVars: string[] = ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'ADMIN_SETUP_TOKEN', 'RESEND_API_KEY']
  try {
    const exampleContent = readFileSync(join(process.cwd(), '.env.example'), 'utf8')
    const matches = exampleContent.match(/^([A-Z_]+)=/gm)
    if (matches) {
      requiredVars = matches.map(m => m.replace('=', ''))
    }
  } catch (e) {
    // ignore
  }

  const vars: Record<string, boolean> = {}
  for (const v of requiredVars) {
    vars[v] = !!process.env[v]
  }

  res.status(200).json({ vars })
}
`
fs.writeFileSync('api/env-check.ts', content);
