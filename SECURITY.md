# Security Policy

Thank you for helping make the NEUROKLAST band website safe and secure.

## Reporting Security Issues

If you believe you have found a security vulnerability in this project, please report it responsibly.

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please report security issues by:
1. Creating a private security advisory on GitHub
2. Or by contacting the maintainers directly through the repository

Please include as much of the information listed below as you can to help us better understand and resolve the issue:

* The type of issue (e.g., XSS, CSRF, authentication bypass, data exposure)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Supported Versions

We release patches for security vulnerabilities for the latest version of the project. Please ensure you are using the most recent version.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Security Architecture

### Authentication & Access Control
- **Admin Authentication**: scrypt password hashing (with legacy SHA-256 migration) and constant-time comparison (`timingSafeEqual`)
- **Session Binding**: Session fingerprinting to prevent session hijacking
- **CSRF Protection**: No state-changing operations via GET requests
- **Sensitive Key Protection**: `admin-password-hash`, keys containing `token` or `secret` are blocked from API reads

### Input Validation (Zod)
All API inputs are validated through strict [Zod](https://zod.dev/) schemas (`api/_schemas.js`):
- **KV API**: Key format, length (max 200), no control characters; value presence check
- **Reset Password**: Email must be a valid RFC 5322 email (max 254 chars)
- **Analytics**: Event type must be one of `page_view | section_view | interaction | click`; meta fields are bounded strings; heatmap coordinates clamped to `[0,1]×[0,2]`
- **Drive Folder**: `folderId` restricted to `[A-Za-z0-9_-]+`
- **Drive Download**: `fileId` restricted to `[A-Za-z0-9_-]+` to prevent directory traversal and injection attacks
- **iTunes / Odesli**: Search terms and URLs are length-bounded and type-checked
- **Image Proxy**: URL is validated, protocol restricted to `http:` / `https:`, SSRF blocklist enforced

### Rate Limiting
All API endpoints are protected by rate limiting (`api/_ratelimit.js`):
- **Algorithm**: Sliding window — 5 requests per 10 seconds per client
- **Backend**: `@upstash/ratelimit` with Vercel KV (Redis)
- **GDPR Compliance**: Client IPs are hashed with SHA-256 + a secret salt before use as rate-limit keys. No plaintext IPs are stored. Rate-limit state auto-expires after the window period.
- **Response**: HTTP 429 `Too Many Requests` when the limit is exceeded
- **Graceful Degradation**: If KV is unavailable, requests are allowed through

### SSRF Protection (Image Proxy)
- Blocklist for private/internal networks: `127.x`, `10.x`, `172.16-31.x`, `192.168.x`, `169.254.x`, IPv6 loopback/mapped/link-local/unique-local, metadata endpoints
- Hex, octal, and decimal integer IP notation blocked
- Protocol allowlist: only `http:` and `https:`
- Redirect target re-validated after fetch
- Content-type restricted to `image/*`

### Honeytokens (Intrusion Detection)
Decoy records are planted in the KV database (`api/_honeytokens.js`):
- Keys: `admin_backup`, `admin-backup-hash`, `db-credentials`, `api-master-key`, `backup-admin-password`
- Any read or write to these keys triggers a **silent alarm**: logged to `stderr` (for SIEM/log-drain pickup) and persisted to `nk-honeytoken-alerts` in KV
- The API returns a generic `403 Forbidden` so the attacker does not learn they were detected

### Threat Score System (Behavioral IDS)
Requests are scored based on suspicious behavior patterns (`api/_threat-score.js`):
- **Algorithm**: Cumulative score per (hashed) IP, 1-hour TTL
- **Score Sources**: robots.txt violations (+3), honeytoken access (+5), suspicious UA (+4), missing browser headers (+2), rate limit exceeded (+2)
- **Escalation**: WARN (≥3) → TARPIT (≥7) → AUTO-BLOCK (≥12, configurable)
- **Storage**: Ephemeral scores in KV with 1-hour TTL
- **Auto-blocking**: IPs exceeding threshold are automatically added to the hard blocklist

### Hard Blocklist
Persistent IP blocklist for confirmed attackers (`api/_blocklist.js`, `api/blocklist.js`):
- Auto-populated when threat score exceeds threshold (default: 12 points)
- Admin-manageable via dashboard (add/remove entries)
- Configurable TTL (default 7 days, up to 1 year)
- All API endpoints check blocklist before processing
- Index maintained in KV for efficient lookups

### Zip Bomb (Optional, Disabled by Default)
When enabled, serves a gzip-compressed 10 MB null-byte payload to confirmed bots (`api/_zipbomb.js`):
- Only triggered for IPs already flagged as attackers (robots.txt violators, honeytoken accessors)
- Response claims to be a small ZIP file; decompresses to waste bot memory/CPU
- Disabled by default — enable explicitly in Security Settings
- **WARNING**: Aggressive countermeasure — use with caution

### Real-time Alerting (Optional)
Critical security events trigger immediate notifications (`api/_alerting.js`):
- **Discord**: Webhook with color-coded embeds (red=critical, orange=high, yellow=medium)
- **Email**: Via Resend API (reuses existing RESEND_API_KEY configuration)
- **Deduplication**: Max 1 alert per IP per 5 minutes to prevent spam
- **Configuration**: Set `DISCORD_WEBHOOK_URL` environment variable to enable
- **Event Types**: Honeytoken access, auto-blocks, critical threat escalations

### robots.txt Access Control
- `Disallow` paths in `robots.txt` establish access rules; violations trigger defensive measures
- Suspicious User-Agent detection and tarpitting for known malicious crawlers
- Access violations are logged with hashed IPs only (no plaintext)
- Violations increment threat score and may trigger auto-blocking

### XSS Prevention
- All user-generated content rendered through `SafeText` component
- YouTube embeds use `youtube-nocookie.com` with `sandbox` attribute
- Image proxy rejects non-`image/*` content types

### Google Drive Download Security
- **Input Validation**: File IDs restricted to `[A-Za-z0-9_-]+` pattern to prevent injection attacks
- **User-Agent Headers**: Server-side requests include proper User-Agent to comply with Google's requirements
- **Virus-Scan Handling**: Automatic detection and handling of Google's virus-scan confirmation pages for large files
- **Size Limits**: Files >10 MB are redirected to Google Drive directly to prevent bandwidth abuse
- **Fallback Protection**: Failed downloads gracefully fall back to opening Drive in new tab

## Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `KV_REST_API_URL` | Vercel KV endpoint | Yes |
| `KV_REST_API_TOKEN` | Vercel KV auth token | Yes |
| `RATE_LIMIT_SALT` | Secret salt for IP hashing (rate limiting) | Recommended |
| `ADMIN_RESET_EMAIL` | Email for password reset verification & security alerts | For reset & alerting |
| `ALLOWED_ORIGIN` | Restricts CORS on image proxy to own domain (e.g. `https://neuroklast.com`) | Recommended |
| `DISCORD_WEBHOOK_URL` | Discord webhook URL for security alerts | Optional (for alerting) |
| `RESEND_API_KEY` | Resend API key for email alerts & password reset | Optional (for alerting & reset) |
| `EMAIL_FROM` | Sender address for email alerts & reset (default: noreply@neuroklast.com) | Optional |
| `SITE_URL` | Site URL included in alert messages & reset links (default: neuroklast.com) | Optional |
| `GOOGLE_DRIVE_API_KEY` | Google Drive API key for file metadata | Optional |

## Best Practices for Deployment

1. **Environment Variables**: Never commit sensitive API keys or tokens
2. **Rate Limit Salt**: Set `RATE_LIMIT_SALT` to a unique, random value in production
3. **Admin Password**: Use a strong password (minimum 8 characters)
4. **HTTPS**: Always deploy behind HTTPS
5. **Regular Updates**: Keep dependencies up to date
6. **CSP Headers**: Configure Content Security Policy headers in production
7. **Log Monitoring**: Monitor `[HONEYTOKEN ALERT]` entries in server logs for intrusion detection
