# Development Log

Entries are in **reverse chronological order** (newest first).

---

## Session: 2026-04-01 — Documentation, Hero Logo & Security Hardening

**Agent:** GitHub Copilot Coding Agent  
**Branch:** `copilot/create-documentation-system`

### Objectives
1. Create comprehensive documentation system (`docs/` directory)
2. Replace hero logo glow effect with chromatic aberration on hover
3. OWASP security audit and targeted hardening

### What Was Done

#### Part 1 — Documentation System
- Created `docs/` directory with five structured markdown files:
  - `PROJECT_STATUS.md` — feature checklist, architecture overview, known issues
  - `DEVELOPMENT_LOG.md` — this file; session-based change log
  - `LESSONS_LEARNED.md` — technical decisions and what to avoid in future sessions
  - `AGENT_PROTOCOL.md` — mandatory plan→implement→test cycle for all future agent sessions
  - `SECURITY_AUDIT.md` — OWASP audit findings and fix status
- Updated `README.md` to link to all new docs

#### Part 2 — Hero Logo Chromatic Aberration
- **Removed** static `drop-shadow` glow from hero logo wrapper div (`src/components/Hero.tsx` line ~202)
- **Added** CSS class `hero-logo-chromatic-hover` in `src/index.css`:
  - No glow at rest
  - On hover: subtle 2px RGB channel split (red left, cyan/blue right)
  - `transition: filter 0.2s ease-out` for smooth in/out
  - Only applies on devices with a true hover pointer (`@media (hover: hover)`)
- Updated comment in `Hero.tsx` to document the new approach

#### Part 3 — OWASP Security Audit & Hardening
- **CSP improvements** (`vercel.json`):
  - Added `upgrade-insecure-requests` directive
  - Added `https://nominatim.openstreetmap.org` to `connect-src` (admin gig geocoding in `GigEditDialog.tsx` makes direct fetch calls to this host — previously blocked by CSP)
- **CORS hardening** (`api/contact.ts`, `api/newsletter.ts`):
  - Replaced hardcoded `Access-Control-Allow-Origin: *` with `process.env.ALLOWED_ORIGIN || '*'`
  - Consistent with existing pattern in `api/image-proxy.ts` and `api/image-proxy-protected.ts`
  - Set `ALLOWED_ORIGIN=https://yourdomain.com` in production env to restrict cross-origin POST

### What Was Tested
- Verified `src/components/Hero.tsx` no longer contains inline glow filter
- Verified `src/index.css` contains new `hero-logo-chromatic-hover` class with correct `@media (hover: hover)` scoping
- Verified `vercel.json` CSP includes `upgrade-insecure-requests` and Nominatim in `connect-src`
- Verified `api/contact.ts` and `api/newsletter.ts` use `ALLOWED_ORIGIN` env var
- Ran full test suite: 1005 tests across 61 files — all pass

### Results
- ✅ All planned changes implemented
- ✅ No regressions in test suite
- ✅ Hero logo: glow removed, chromatic aberration on hover
- ✅ Security headers: CSP strengthened
- ✅ CORS: restricted from wildcard to configurable origin

---

*Add new sessions above this line.*
