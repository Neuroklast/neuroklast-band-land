# Project Status

**Last updated:** 2026-04-12  
**Status:** Active — Neuroklast band website (personal use)

---

## Current Development Status

The site is a production-deployed React SPA for the metal/electronic band **Neuroklast**. It is built on React 19, Vite 7, Tailwind CSS v4, and Vercel serverless functions, and is live at [neuroklast-band-land.vercel.app](https://neuroklast-band-land.vercel.app).

---

## Feature Completion Checklist

### Core Sections
- [x] Hero section with animated logo, scanline overlay, chromatic aberration on hover
- [x] Music / Releases section with streaming links (Spotify, Apple Music, etc.)
- [x] Gigs / Shows section with Bandsintown integration
- [x] Biography & Band Members section with profile overlays
- [x] Photo gallery with swipeable lightbox
- [x] Media archive / press kit downloads
- [x] Social links hub
- [x] News feed with expandable items
- [x] Partners & Friends section
- [x] Contact form with rate limiting and email forwarding
- [x] Newsletter widget with Mailchimp / Brevo support
- [x] Hidden Secret Terminal (Konami-code + direct URL access)
- [x] GDPR compliance (cookie consent, Impressum, Datenschutz)
- [x] Loading screen
- [ ] Spotify embed/widget (streaming links exist but no embedded player)
- [ ] SEO improvements (meta tags exist but SSR/SSG not implemented)

### Admin & CMS
- [x] In-browser admin workspace (4-tab: Content, Design, Store, System)
- [x] TOTP 2FA for admin login
- [x] Admin setup wizard
- [x] Content editing (news, gigs, releases, bio, contact)
- [x] Theme/design customizer (24 theme slots, color presets)
- [x] Vercel KV backend for persistent data

### Security
- [x] Rate limiting on all API endpoints
- [x] Global circuit breaker (Edge Middleware)
- [x] IP blocklist with SHA-256 hashing
- [x] Attacker profiling and honeytokens
- [x] DOMPurify on all user-rendered HTML
- [x] Zod schema validation on all API inputs
- [x] Security headers (CSP, HSTS, X-Frame-Options, etc.)
- [x] SQL/injection backfire countermeasures
- [x] Canary documents with callback fingerprinting
- [x] Log poisoning prevention
- [x] CORS restricted to `ALLOWED_ORIGIN` env var (was wildcard `*` — fixed 2026-04-01)
- [x] CSP includes `upgrade-insecure-requests` and `connect-src` for Nominatim (fixed 2026-04-01)

### Visual / UX
- [x] Cyberpunk aesthetic (code rain, glitch effects, HUD elements)
- [x] Framer Motion animations
- [x] Responsive design (mobile-first)
- [x] Hero logo: chromatic aberration on hover (replaced glow — 2026-04-01)
- [x] Theme system with multiple presets
- [x] i18n (English + German legal pages)
- [ ] Accessibility panel / WCAG contrast enforcement in admin
- [x] Schema-driven UI: `FIELD_REGISTRY`, `getFieldsForSchema()`, `<SchemaFormRenderer>` (2026-04-12)
- [x] Strict tool calling: `AdminActionRegistry` with typed admin operations (2026-04-12)
- [x] IoC contracts: `component-contracts.ts` base interfaces enforced project-wide (2026-04-12)

---

## Architecture Overview

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS v4 |
| UI Components | shadcn/ui, Radix UI, Framer Motion |
| State / Data | React Query (TanStack Query), Context API |
| API / Backend | Vercel Serverless Functions (TypeScript) |
| Database | Vercel KV (Redis-compatible) |
| Auth | Custom session tokens + optional TOTP 2FA |
| Security | Edge Middleware, Zod, DOMPurify, rate limiting |
| Deploy | Vercel (primary), Netlify/Railway/Render (frontend-only fallback) |

**Patterns used:**
- Feature-Sliced Design for admin features
- Container/Presentational component separation
- Widget registry for pluggable section widgets
- Proxy pattern — all external API calls go through `/api/*` serverless functions to avoid CORS issues and hide API keys

---

## Known Issues & Technical Debt

| Issue | Severity | Notes |
|-------|----------|-------|
| `style-src 'unsafe-inline'` in CSP | Medium | Required for Tailwind v4 CSS-in-JS and React inline styles; nonce-based approach would be ideal but requires SSR |
| `img-src 'self' data: https:` in CSP | Low | Allows any HTTPS image source; tightening would break user-configured image URLs |
| ESLint config dual-file (`eslint.config.js` + `.eslintrc.cjs`) | Medium | Legacy config not yet removed; can cause confusion |
| Multiple unmerged Jules AI PRs (#322, #332, #341, #344) | Low | Stale — can be closed |
| Dependabot PRs for Vite 8, ESLint 10, jsdom 29, globals 17 | Medium | Major version bumps require review before merging |
| `sectionOrder` deprecated config key | Low | Automated migration covers it but should be cleaned up |
| No SSR/SSG | High (SEO) | SPA means crawlers see empty HTML; relevant if SEO matters |
| iTunes API as primary music data source | Medium | Unreliable for non-Apple ecosystem; consider Musicbrainz or Spotify |
