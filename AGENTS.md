# Neuroklast Band Land — Agent Guidelines

Public artist site + admin CMS (template: Band Land).

**Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Framer Motion, Lenis, Three.js, Supabase (PostgreSQL + Auth), Cloudflare R2, Resend.

**Package manager:** npm only (`package-lock.json`). NEVER introduce pnpm/yarn lockfiles.

**Build location rule (2026-10-29): NEVER run `next build`, `npm run build`, Vercel builds, or Lighthouse production builds in GitHub Actions.** GitHub CI may lint, typecheck, unit-test and audit. The maintainer builds and runs browser/Lighthouse tests **locally** on their own machine; Vercel Production deployment from `main` is separate. `npm run check:github-builds` enforces the GitHub Actions restriction. Do not reintroduce `.github/workflows/lighthouse.yml` or a build job in `.github/workflows/ci.yml`.

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
| [docs/COMPLIANCE-DE.md](docs/COMPLIANCE-DE.md) | Legal pages, cookies, launch |
| [docs/AGENT_PROTOCOL.md](docs/AGENT_PROTOCOL.md) | Session log + hard UI constraints |

Roles: `.agents/*.md`. Skills: `.agents/skills/*/SKILL.md`.

## Invariants — ALWAYS / NEVER

- ALWAYS use `createPublicClient()` for public pages. NEVER `createClient()` (cookies) on public reads — it kills ISR.
- ALWAYS store media on Cloudflare R2. NEVER write new media to Supabase Storage. NEVER render `.supabase.co` media URLs.
- NEVER run media migrations, whole-bucket scans or database-writing reconciliation at function startup, deployment, GET request or import time. Require explicit authenticated admin action after a dry-run.
- ALWAYS wrap public pages in `PageLayout`. NEVER invent a parallel public shell.
- ALWAYS send contact mail via Resend. NEVER add an inbox, CRM, or newsletter stack unless asked.
- ALWAYS two-click embeds for Spotify / YouTube / SoundCloud. NEVER auto-load third-party iframes.
- ALWAYS use CSS z-index tokens. NEVER raw `z-index` numbers.
- ALWAYS keep Secret Terminal reachable: Konami, Morse on logo, `?access-secret-terminal-NK-666` → overlay type `terminal`.
- NEVER weaken rate limits, DOMPurify, SSRF guards, honeypots, or admin MFA paths. Use `lib/admin-mfa-policy.ts` and `proxy.ts` for strict-page MFA navigation instead of per-page redirect try/catch; keep server-side `admin()` as defense in depth.
- NEVER commit secrets, `.env`, or `SECRETS_ENCRYPTION_KEY` / `RATE_LIMIT_SALT` values.
- NEVER silence TypeScript/ESLint with `as any`, `@ts-ignore`, or bare `eslint-disable`.
- NEVER rewrite working public UI, animation, or look unless the user asked.
- Default look: Neuroklast Classic (crimson, JetBrains Mono, Space Grotesk, HUD).

## Mandatory engineering standard: no quick fixes

**ABSOLUTE RULE: lazy fixes, dirty fixes, symptom-only patches, deceptive success states, temporary production stubs and undocumented workarounds are forbidden. A complete, maintainable, architecturally correct implementation is mandatory for every change, including urgent bug fixes.** Time pressure never justifies a bypass.

Before editing code:
1. Reproduce and trace the **root cause**, affected callers, data flow and ownership boundaries. Search for all occurrences and related modules; do not treat one failed route as the whole defect.
2. Choose the **canonical existing abstraction**, or design one when responsibilities are duplicated. Put behavior at the correct layer and keep every security/data invariant. Do not add another per-page/per-endpoint special case for a shared concern.
3. Specify correctness, failure modes, persistence, observability, compatibility and migration/rollback needs **before** implementation.

Implementation is NOT acceptable if it:
- Swallows database, security, payment or audit errors; returns success for a no-op; substitutes editable empty defaults for failed reads; or hides a broken service behind plausible output.
- Uses fake or partial typed contexts, inert setters, placeholder handlers, arbitrary casts, skipped validation, or hard-coded one-off values to avoid modeling the problem.
- Duplicates the same domain rule across controllers, pages or APIs instead of extracting a tested canonical boundary.
- Adds a temporary path to production with no real implementation, or merely suppresses exceptions/logs rather than resolving the failure.
- Leaves a feature half-implemented while claiming it is finished.

**Completion gate:** root-cause evidence, correct ownership/model, regression and failure-injection tests, reliable error handling, explicit state and rollback, observability for durable work, updated docs, review, green applicable CI and verified deployment behavior. If the correct fix cannot be completed, **report it as blocked or partial**, keep the defect open, and do not present a workaround or a successful PR as a completed repair. Exceptions for intentionally optional features must be designed and tested as explicit product behavior, never improvised to mask a failure.

Review the current findings and remediation order in [Architecture Debt Audit (2026-11-15)](docs/ARCHITECTURE_DEBT_AUDIT_2026-11-15.md). For the mandatory delivery process read [workflow.md](docs/agent/workflow.md).

## Mandatory living documentation

The quality baseline, journal and document owners are defined in [architecture quality](docs/ARCHITECTURE_QUALITY.md), [quality journal](docs/QUALITY_JOURNAL.md) and [mapping](docs/living-docs.json). Every source PR updates the journal and all mapped topic docs, with honest test evidence and residual risk. Run `npm run test:living-docs`. Never bypass with meaningless prose, invent verified results or reintroduce GitHub builds.

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
