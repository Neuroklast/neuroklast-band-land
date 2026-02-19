import { kv } from '@vercel/kv'

const ALERT_DEDUP_PREFIX = 'nk-alert-dedup:'
const ALERT_DEDUP_TTL = 300 // 5 Minuten Cooldown pro IP+Eventtyp

/**
 * Send a critical security alert via Discord Webhook and/or Resend email.
 * Includes alert deduplication to prevent spam (1 alert per IP per 5 min).
 *
 * Environment variables:
 *   DISCORD_WEBHOOK_URL  — Discord webhook URL (optional)
 *   RESEND_API_KEY       — if set, also sends email
 *   ADMIN_RESET_EMAIL    — destination email for alerts
 *   SITE_URL             — used for context in alert messages
 */
export async function sendSecurityAlert(event) {
  try {
    // Deduplicate — only send one alert per hashedIp+key combination per 5 min
    const dedupKey = `${ALERT_DEDUP_PREFIX}${event.hashedIp}:${event.key}`
    const alreadySent = await kv.get(dedupKey).catch(() => null)
    if (alreadySent) return

    await kv.set(dedupKey, 1, { ex: ALERT_DEDUP_TTL }).catch(() => {})

    const promises = []

    // Discord Webhook
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (webhookUrl) {
      promises.push(
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'NEUROKLAST IDS',
            avatar_url: 'https://neuroklast.com/favicon.ico',
            embeds: [{
              title: `🚨 SECURITY ALERT — ${event.type || 'THREAT DETECTED'}`,
              color: event.severity === 'critical' ? 0xff0000 : event.severity === 'high' ? 0xff6600 : 0xffcc00,
              fields: [
                { name: 'Event Type', value: event.key || '—', inline: true },
                { name: 'Method', value: event.method || '—', inline: true },
                { name: 'IP Hash', value: event.hashedIp ? `\`${event.hashedIp.slice(0, 12)}…\`` : '—', inline: true },
                { name: 'User Agent', value: event.userAgent ? `\`${event.userAgent.slice(0, 100)}\`` : '—', inline: false },
                { name: 'Threat Score', value: event.threatScore ? `${event.threatScore} (${event.threatLevel || '?'})` : '—', inline: true },
                { name: 'Site', value: process.env.SITE_URL || 'neuroklast.com', inline: true },
              ],
              timestamp: event.timestamp || new Date().toISOString(),
              footer: { text: 'NEUROKLAST IDS • Active Defense System' },
            }],
          }),
        }).catch(err => console.error('[ALERT] Discord webhook failed:', err.message))
      )
    }

    // Resend E-Mail
    const resendApiKey = process.env.RESEND_API_KEY
    const alertEmail = process.env.ADMIN_RESET_EMAIL
    if (resendApiKey && alertEmail) {
      const { Resend } = await import('resend')
      const resend = new Resend(resendApiKey)
      promises.push(
        resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@neuroklast.com',
          to: alertEmail,
          subject: `🚨 [NEUROKLAST IDS] ${event.type || 'Security Alert'} — ${event.key}`,
          html: `
            <h2 style="color:#ff0000">🚨 NEUROKLAST IDS ALERT</h2>
            <table border="1" cellpadding="6" style="border-collapse:collapse;font-family:monospace">
              <tr><td><b>Event</b></td><td>${event.key || '—'}</td></tr>
              <tr><td><b>Method</b></td><td>${event.method || '—'}</td></tr>
              <tr><td><b>IP Hash</b></td><td>${event.hashedIp || '—'}</td></tr>
              <tr><td><b>User Agent</b></td><td>${event.userAgent || '—'}</td></tr>
              <tr><td><b>Threat Score</b></td><td>${event.threatScore || '—'} (${event.threatLevel || '—'})</td></tr>
              <tr><td><b>Timestamp</b></td><td>${event.timestamp || new Date().toISOString()}</td></tr>
              <tr><td><b>Site</b></td><td>${process.env.SITE_URL || 'neuroklast.com'}</td></tr>
            </table>
            <p style="color:#666;font-size:12px">NEUROKLAST IDS • Active Defense System</p>
          `,
        }).catch(err => console.error('[ALERT] Resend email failed:', err.message))
      )
    }

    await Promise.allSettled(promises)
  } catch (err) {
    console.error('[ALERT] Failed to send security alert:', err.message)
  }
}
