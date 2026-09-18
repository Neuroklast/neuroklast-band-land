# Project Status

**Last updated:** 2026-09-08  
**Status:** Active — Neuroklast public band site + Next.js admin CMS

Live stack: Next.js App Router, React, Supabase (PostgreSQL), Cloudflare R2, Resend, TypeScript, Tailwind 4, Framer Motion. Default look: Neuroklast Classic.

---

## Feature Completion Checklist

### Core public site
- [x] Homepage sections in CMS order (`site_config.sections`, visibility honored)
- [x] Classic chrome via `LookChrome` (nav, hero, footer, boot loader)
- [x] Releases, gigs, gallery, media, news, bio, partners, merch, soundpacks, social
- [x] Shared `CyberpunkOverlay` (release, gig, gallery, media, news, member, explorer, contact, **terminal**)
- [x] Contact via Resend only (no inbox, no newsletter)
- [x] Legal: `/legal-notice`, `/privacy-policy`; editor `/admin/legal`
- [x] Two-click embeds (Spotify / YouTube)
- [x] Cookie consent + language switcher in Classic footer
- [x] Secret Terminal: Konami / custom keys, Morse on logo, cheat query param
- [x] Scroll-synced background video (R2) + reduced-motion / capability gates
- [x] GDPR cookie banner (opt-in analytics)

### Admin CMS (`/admin`)
- [x] Supabase Auth, `profiles.role = admin`
- [x] Look & Feel: theme, background, hero, loader, sections, site text, terminal
- [x] Content CRUD: bio, members, gallery, media, partners, releases, gigs, news, merch, soundpacks, highlights, social
- [x] Site-config JSON merge on save + `revalidateTag('site-config')`
- [x] Unsaved-changes guard on high-value editors
- [x] R2 media (never Supabase Storage)

### Security
- [x] Rate limiting on public APIs (fail-closed)
- [x] Cookie-less `createPublicClient()` for public reads
- [x] Zod on API bodies
- [x] CSP / security headers
- [x] Admin middleware + generic login errors

---

## Known leftovers (P3)

- Some remaining admin forms still use sibling labels without `htmlFor` (news/releases/media/gallery merch/soundpacks/highlights)
- Legacy SPA under `src/` (overlay admin hub) is not the live product path
- Dead `SiteNav` / `SiteFooter` still exist; live chrome is Classic theme
