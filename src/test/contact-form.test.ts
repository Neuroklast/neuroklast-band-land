import { describe, it, expect } from 'vitest'

/**
 * Tests for the contact API validation logic.
 *
 * We test the pure input validation and HTML escaping functions
 * without needing a real HTTP server or KV connection.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function esc(str: string | undefined | null): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface ContactInput {
  name?: string
  email?: string
  subject?: string
  message?: string
}

function validateContactInput(body: ContactInput) {
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

describe('Contact form validation', () => {
  describe('esc', () => {
    it('escapes HTML special characters', () => {
      expect(esc('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      )
    })

    it('returns empty string for falsy input', () => {
      expect(esc('')).toBe('')
      expect(esc(null)).toBe('')
      expect(esc(undefined)).toBe('')
    })
  })

  describe('validateContactInput', () => {
    const validInput: ContactInput = {
      name: 'Max Mustermann',
      email: 'max@example.com',
      subject: 'Booking inquiry',
      message: 'Hello, we would like to book you for an event.',
    }

    it('accepts valid input', () => {
      const result = validateContactInput(validInput)
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data!.name).toBe('Max Mustermann')
      expect(result.data!.email).toBe('max@example.com')
    })

    it('rejects missing name', () => {
      const result = validateContactInput({ ...validInput, name: '' })
      expect(result.error).toContain('Name')
    })

    it('rejects name exceeding 100 characters', () => {
      const result = validateContactInput({ ...validInput, name: 'A'.repeat(101) })
      expect(result.error).toContain('Name')
    })

    it('rejects invalid email', () => {
      const result = validateContactInput({ ...validInput, email: 'not-an-email' })
      expect(result.error).toContain('email')
    })

    it('rejects missing email', () => {
      const result = validateContactInput({ ...validInput, email: '' })
      expect(result.error).toContain('email')
    })

    it('rejects missing subject', () => {
      const result = validateContactInput({ ...validInput, subject: '' })
      expect(result.error).toContain('Subject')
    })

    it('rejects subject exceeding 200 characters', () => {
      const result = validateContactInput({ ...validInput, subject: 'A'.repeat(201) })
      expect(result.error).toContain('Subject')
    })

    it('rejects missing message', () => {
      const result = validateContactInput({ ...validInput, message: '' })
      expect(result.error).toContain('Message')
    })

    it('rejects message exceeding 5000 characters', () => {
      const result = validateContactInput({ ...validInput, message: 'A'.repeat(5001) })
      expect(result.error).toContain('Message')
    })

    it('escapes HTML in all fields', () => {
      const xssInput = {
        name: '<script>alert(1)</script>',
        email: 'test@example.com',
        subject: '<img onerror=alert(1)>',
        message: 'Hello <b>world</b>',
      }
      const result = validateContactInput(xssInput)
      expect(result.data!.name).not.toContain('<script>')
      expect(result.data!.name).toContain('&lt;script&gt;')
      expect(result.data!.subject).not.toContain('<img')
      expect(result.data!.message).toContain('&lt;b&gt;')
    })

    it('trims whitespace from inputs', () => {
      const result = validateContactInput({
        ...validInput,
        name: '  Max  ',
        email: '  max@example.com  ',
      })
      expect(result.data!.name).toBe('Max')
      expect(result.data!.email).toBe('max@example.com')
    })
  })
})
