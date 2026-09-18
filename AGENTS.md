# Neuroklast Band Land — Agent Guidelines

Public artist site + admin CMS (template: Band Land).

**Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Framer Motion, Lenis, Three.js, Supabase (PostgreSQL + Auth), Cloudflare R2, Resend.

**Package manager:** npm only (`package-lock.json`). NEVER introduce pnpm/yarn lockfiles.

## Commands (copy exactly)

```bash
npm install
npm run dev
npm run lint && npm run typecheck && npm run build && npm run test
npm run test:e2e
```

Targeted unit tests: `npx vitest run path/to/file.test.ts`

## Progressive disclosure

Read `AGENTS.md` first. Load topic files ONLY when the task touches that domain:

| File | Load when |
|------|-----------|
| [docs/agent/workflow.md](docs/agent/workflow.md) | Session loop, CI, docs closeout |
| [docs/agent/architecture.md](docs/agent/architecture.md) | PageLayout, ISR, R2, site_config |
| [docs/agent/public-ui.md](docs/agent/public-ui.md) | Nav, overlays, footer, public sections |
| [docs/agent/admin.md](docs/agent/admin.md) | Admin CMS, site_config mutations |
| [docs/agent/security.md](docs/agent/security.md) | Auth, consent, SSRF, rate limits |
| [docs/TYPESCRIPT.md](docs/TYPESCRIPT.md) | `.ts` / `.tsx` changes |
| [docs/FRONTEND.md](docs/FRONTEND.md) | Public UI, motion, canvas, a11y |
| [docs/BACKEND.md](docs/BACKEND.md) | `app/api`, actions, schema, R2 |
| [docs/COMPLIANCE-DE.md](docs/COMPLIANCE-DE.md) | Legal pages, cookies, launch |
| [docs/AGENT_PROTOCOL.md](docs/AGENT_PROTOCOL.md) | Session log + hard UI constraints |

Roles: `.agents/*.md`. Skills: `.agents/skills/*/SKILL.md`.

## Invariants — ALWAYS / NEVER

- ALWAYS use `createPublicClient()` for public pages. NEVER `createClient()` (cookies) on public reads — it kills ISR.
- ALWAYS store media on Cloudflare R2. NEVER write new media to Supabase Storage. NEVER render `.supabase.co` media URLs.
- ALWAYS wrap public pages in `PageLayout`. NEVER invent a parallel public shell.
- ALWAYS send contact mail via Resend. NEVER add an inbox, CRM, or newsletter stack unless asked.
- ALWAYS two-click embeds for Spotify / YouTube / SoundCloud. NEVER auto-load third-party iframes.
- ALWAYS use CSS z-index tokens. NEVER raw `z-index` numbers.
- ALWAYS keep Secret Terminal reachable: Konami, Morse on logo, `?access-secret-terminal-NK-666` → overlay type `terminal`.
- NEVER weaken rate limits, DOMPurify, SSRF guards, honeypots, or admin MFA paths.
- NEVER commit secrets, `.env`, or `SECRETS_ENCRYPTION_KEY` / `RATE_LIMIT_SALT` values.
- NEVER silence TypeScript/ESLint with `as any`, `@ts-ignore`, or bare `eslint-disable`.
- NEVER rewrite working public UI, animation, or look unless the user asked.
- Default look: Neuroklast Classic (crimson, JetBrains Mono, Space Grotesk, HUD).

## Legal routes

- Public: `/legal-notice`, `/privacy-policy`
- Editor: `/admin/legal`
- Templates: `lib/legal-templates.ts` + `site_config.legal`
- Impressum heading MUST be **Angaben gemäß § 5 DDG**. NEVER `§ 5 TMG`.

## Admin

`/admin/login` — native form POST only (`app/admin/login/submit/route.ts`). `profiles.role = admin` is set in Supabase, never auto-promoted in app code.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
