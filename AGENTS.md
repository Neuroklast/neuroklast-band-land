# Neuroklast — Agent Guidelines

Public band site + admin CMS.

**Stack:** Next.js App Router, React, Supabase (PostgreSQL), Cloudflare R2, Resend, TypeScript, Tailwind 4, Framer Motion.

**Package manager:** npm only.

## Mandatory checks

```bash
npm run lint && npm run typecheck && npm run build && npm run test
```

## Critical rules

- Media is always on Cloudflare R2 — never Supabase Storage
- Public pages use `PageLayout` and `createPublicClient()` (cookie-less)
- Contact is Resend only — no inbox, no newsletter
- Legal pages: `/legal-notice`, `/privacy-policy`; editor `/admin/legal`
- Two-click embeds for Spotify/YouTube
- Schema: idempotent `supabase/schema.sql`, applied on Production deploy
- Default look: Neuroklast Classic (crimson, JetBrains Mono, Space Grotesk, HUD)

## Admin

`/admin/login` — Supabase Auth, `profiles.role = admin`.

Members: `/admin/members`. Look & Feel: `/admin/site-config`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
