import { kv } from '@vercel/kv'
import { randomUUID } from 'node:crypto'
import { applyRateLimit } from './_ratelimit.js'
import { validateSession } from './auth.js'

const KV_KEY = 'contact-messages'

const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

/** HTML entity escaping to prevent XSS */
function esc(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateContactInput(body) {
  const { name, email, subject, message } = body || {}
  if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
    return { error: 'Name is required and must be 1-100 characters.' }
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.trim().length > 254) {
    return { error: 'A valid email address is required.' }
  }
  if (!subject || typeof subject !== 'string' || subject.trim().length < 1 || subject.trim().length > 200) {
    return { error: 'Subject is required and must be 1-200 characters.' }
  }
  if (!message || typeof message !== 'string' || message.trim().length < 1 || message.trim().length > 5000) {
    return { error: 'Message is required and must be 1-5000 characters.' }
  }
  return {
    data: {
      name: esc(name.trim().slice(0, 100)),
      email: esc(email.trim().slice(0, 254)),
      subject: esc(subject.trim().slice(0, 200)),
      message: esc(message.trim().slice(0, 5000)),
    },
  }
}

/** Send email notification via Brevo transactional API */
async function sendEmailNotification({ name, email, subject, message }) {
  const apiKey = process.env.BREVO_API_KEY
  const toEmail = process.env.CONTACT_EMAIL_TO
  if (!apiKey || !toEmail) return

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'NEUROKLAST Contact Form', email: toEmail },
        to: [{ email: toEmail }],
        subject: `Contact Form: ${subject}`,
        htmlContent: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p><strong>Subject:</strong> ${subject}</p><p>${message.replace(/\n/g, '<br>')}</p>`,
      }),
    })
  } catch (err) {
    console.error('Failed to send contact email notification:', err)
  }
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
  // CORS preflight for public POST
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res)
    return res.status(200).end()
  }

  if (!isKVConfigured()) {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'KV storage is not configured.',
    })
  }

  try {
    switch (req.method) {
      case 'POST':
        return await handlePost(req, res)
      case 'GET':
        return await handleGet(req, res)
      case 'PATCH':
        return await handlePatch(req, res)
      case 'DELETE':
        return await handleDelete(req, res)
      default:
        res.setHeader('Allow', 'POST, GET, PATCH, DELETE, OPTIONS')
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (err) {
    console.error('Contact API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/** POST — submit a new contact message (public, rate-limited) */
async function handlePost(req, res) {
  setCorsHeaders(res)

  // Rate limit: 3 requests per 300 seconds
  const allowed = await applyRateLimit(req, res)
  if (!allowed) return

  const parsed = validateContactInput(req.body)
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error })
  }

  const { name, email, subject, message } = parsed.data
  const id = `msg-${randomUUID()}`

  const entry = {
    id,
    name,
    email,
    subject,
    message,
    date: new Date().toISOString(),
    read: false,
  }

  const existing = (await kv.get(KV_KEY)) || []
  existing.push(entry)
  await kv.set(KV_KEY, existing)

  // Fire-and-forget email notification
  sendEmailNotification({ name, email, subject, message })

  return res.status(200).json({ success: true })
}

/** GET — list all contact messages (admin only) */
async function handleGet(req, res) {
  const sessionValid = await validateSession(req)
  if (!sessionValid) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const messages = (await kv.get(KV_KEY)) || []
  return res.status(200).json({ messages })
}

/** PATCH — mark a message as read/unread (admin only) */
async function handlePatch(req, res) {
  const sessionValid = await validateSession(req)
  if (!sessionValid) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { id, read } = req.body || {}
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Message id is required.' })
  }
  if (typeof read !== 'boolean') {
    return res.status(400).json({ error: 'read must be a boolean.' })
  }

  const messages = (await kv.get(KV_KEY)) || []
  const idx = messages.findIndex((m) => m.id === id)
  if (idx === -1) {
    return res.status(404).json({ error: 'Message not found.' })
  }

  messages[idx].read = read
  await kv.set(KV_KEY, messages)

  return res.status(200).json({ success: true })
}

/** DELETE — delete a contact message (admin only) */
async function handleDelete(req, res) {
  const sessionValid = await validateSession(req)
  if (!sessionValid) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { id } = req.body || {}
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Message id is required.' })
  }

  const messages = (await kv.get(KV_KEY)) || []
  const filtered = messages.filter((m) => m.id !== id)
  if (filtered.length === messages.length) {
    return res.status(404).json({ error: 'Message not found.' })
  }

  await kv.set(KV_KEY, filtered)

  return res.status(200).json({ success: true })
}
