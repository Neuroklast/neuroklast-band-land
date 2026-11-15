# Neuroklast

Official Neuroklast website: Next.js App Router, Supabase, Cloudflare R2, Resend.

## Stack

- Next.js 16, React 19, Tailwind 4, Framer Motion
- Supabase (Postgres + Auth)
- Cloudflare R2 (media)
- Resend (contact form only)

## Public site

- NEUROKORE Windows downloads follow published public GitHub releases automatically, with a five-minute server cache and existing CMS/R2 fallback. See [release behavior](docs/NEUROKORE_COMMERCE.md#automatic-neurokore-releases).

- Languages: English, Deutsch, Українська, Italiano, Español, Português, 日本語, 한국어 (footer language chips)
- Spotify **Listen** section: Neuroklast artist player, two-click consent (GDPR)
- Legal: `/legal-notice`, `/privacy-policy`

## Engineering policy

**Quick/dirty fixes, temporary production stubs and symptom-only workarounds are prohibited.** Follow the mandatory [root-cause engineering standard](AGENTS.md#mandatory-engineering-standard-no-quick-fixes), the [agent workflow](docs/agent/workflow.md) and the [2026-11-15 architecture audit](docs/ARCHITECTURE_DEBT_AUDIT_2026-11-15.md). Code review and tests must verify the full implementation, including failure paths.

## Dev

```bash
npm install
cp .env.example .env.local
npm run dev
```

Create the first admin in Supabase Auth, then set `profiles.role = admin`.

## Schema

Idempotent SQL: `supabase/schema.sql`

```bash
npm run db:schema
```

Production schema changes must be applied and verified **explicitly before deployment** using `npm run db:schema:check` and `npm run db:schema` with the restricted migration connection. `instrumentation.ts` does **not** apply database DDL at runtime. Do not infer schema readiness from a successful Vercel build. See [the deployment prerequisites](docs/NEUROKORE_LIVE_LAUNCH_CHECKLIST.md#p0--mandatory-before-accepting-any-real-payments).

## Migrate old Vite/KV + Google Drive

```bash
npm run migrate-config
npm run migrate-config -- --apply
```

Reads KV (`site-config` / `band-data`) or `--from file.json`. Drive files go to R2; folders need `GOOGLE_DRIVE_API_KEY`.

## Scripts

```bash
npm run lint && npm run typecheck && npm run test
```

Admin: `/admin/login`

NEUROKORE Release Manager publishes verified GitHub releases into the existing Products version history and R2 storage through the authenticated release-sync endpoint. See [product release sync](docs/NEUROKORE_COMMERCE.md#release-manager-product-sync).
