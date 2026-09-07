# Neuroklast

Official Neuroklast website: Next.js App Router, Supabase, Cloudflare R2, Resend.

## Stack

- Next.js 16, React 19, Tailwind 4, Framer Motion
- Supabase (Postgres + Auth)
- Cloudflare R2 (media)
- Resend (contact form only)

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

Production deploys apply the schema automatically (`instrumentation.ts`) when `SUPABASE_DB_URL` (direct, port 5432) is set.

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
