# Band Land — Universal Artist Website Template

![TypeScript](https://img.shields.io/badge/TypeScript-83%25-3178c6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**Band Land** is a production-ready, fully configurable single-page website template for musicians, DJs, bands, artists, and labels. Everything — content, design, sections, fonts, and SEO — is driven by a single `SiteConfig` object. No hardcoded brand names, no design assumptions.

---

## ✨ Features

- **Design Presets** — Five bundled themes (Cyberpunk, Minimal, Elegant, Neon, Retro) with one-line activation
- **Dynamic Font Loading** — Google Fonts and local fonts loaded on demand; zero layout shift
- **Flexible Sections** — Enable/disable and reorder any section without touching code
- **SEO & Open Graph** — Title, description, OG tags, Twitter cards, JSON-LD, and canonical URLs generated automatically from config
- **Music Player** — Built-in audio player with track navigation and progress bar
- **iTunes / Streaming Integration** — Latest releases fetched from iTunes, enriched via Odesli
- **Biography & Members** — Expandable profile overlays with photos
- **Photo Gallery** — Swipeable lightbox gallery (local files or Google Drive)
- **Upcoming Gigs** — Event listings with venue, date, ticket links, and status
- **Releases Grid** — Release artwork with streaming links (Spotify, SoundCloud, YouTube, Bandcamp, Apple Music, Beatport)
- **Media Archive** — File-explorer overlay for press kits and downloads
- **Social Links Hub** — All major platforms in one section
- **News Feed** — Expandable news items with photos
- **Partners & Friends** — Collaborator cards with profile overlays
- **Contact Form** — With optional email forwarding
- **Newsletter Widget** — Mailchimp / Brevo integration
- **Admin Mode** — Full in-browser content management, no CMS needed
- **Analytics Dashboard** — Page views, section engagement, device breakdown
- **Security** — Rate limiting, TOTP 2FA, attacker profiling, blocklist
- **i18n** — Bilingual (DE/EN) support for legal pages
- **GDPR** — Cookie consent banner, Impressum, Datenschutz
- **Hidden Terminal** — Konami-code Easter egg with a cyberpunk terminal

---

## 🚀 Quick Start

```bash
# 1. Clone or use this template
git clone https://github.com/your-org/band-land.git my-site
cd my-site

# 2. Install dependencies
npm install

# 3. Copy and fill in your site configuration
cp src/lib/site-config.ts src/lib/my-site-config.ts
# Edit siteName, domain, genres, etc.

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔧 Configuration Reference — `SiteConfig`

All site customization is done through the `SiteConfig` type in `src/lib/types.ts`. The default values live in `src/lib/site-config.ts`.

### Minimal example

```ts
import { createSiteConfig } from '@/lib/site-config'

const config = createSiteConfig({
  siteName: 'My Band',
  siteType: 'band',
  tagline: 'Industrial Techno from Berlin',
  description: 'Official website of My Band.',
  domain: 'myband.de',
  genres: ['Techno', 'Industrial'],
  socialLinks: {
    instagram: 'https://instagram.com/myband',
    spotify:   'https://open.spotify.com/artist/...',
  },
})
```

### Key fields

| Field | Type | Description |
|-------|------|-------------|
| `siteId` | `string` | Auto-generated UUID |
| `siteType` | `'band' \| 'dj' \| 'artist' \| 'label' \| 'portfolio' \| 'custom'` | Drives section defaults |
| `siteName` | `string` | Display name used across the site |
| `tagline` | `string?` | Short subtitle / tagline |
| `description` | `string?` | SEO meta description |
| `domain` | `string?` | Primary domain for canonical/OG URLs |
| `genres` | `string[]` | Music genres (used in JSON-LD) |
| `themeSettings` | `ThemeSettings?` | Colors, fonts, border-radius |
| `sectionOrder` | `string[]` | Legacy section order array |
| `sections` | `SectionConfig[]?` | Rich section enable/order config |
| `fontConfig` | `FontConfig?` | Google Fonts / local font loading |
| `seo` | `SEOConfig` | OG image, Twitter card, analytics ID |
| `features` | `FeatureFlags` | Toggle newsletter, contact form, etc. |

---

## 🎨 Design Presets

Five bundled presets are available in `src/lib/design-presets.ts`:

| ID | Name | Aesthetic |
|----|------|-----------|
| `cyberpunk` | Cyberpunk | Dark industrial, crimson red neon |
| `minimal` | Minimal | Light, clean, content-first |
| `elegant` | Elegant | Dark canvas, warm gold, serif fonts |
| `neon` | Neon | Electric blue/cyan synthwave |
| `retro` | Retro | Amber phosphor-glow, vintage terminal |

### Using a preset

```ts
import { getPreset, presetToThemeSettings } from '@/lib/design-presets'

const preset = getPreset('neon')!
const config = createSiteConfig({
  siteName: 'DJ Neon',
  themeSettings: presetToThemeSettings(preset),
})
```

### Overriding individual values after a preset

```ts
const config = createSiteConfig({
  themeSettings: {
    ...presetToThemeSettings(getPreset('minimal')!),
    primary: 'oklch(0.60 0.18 200)', // custom override
  },
})
```

### Creating a custom preset

```ts
import type { DesignPreset } from '@/lib/types'

const myPreset: DesignPreset = {
  id: 'custom',
  name: 'My Custom Theme',
  description: 'A one-off theme for my site',
  colors: {
    primary:        'oklch(0.55 0.20 340)',
    accent:         'oklch(0.65 0.22 340)',
    background:     'oklch(0.03 0 0)',
    card:           'oklch(0.07 0 0)',
    foreground:     'oklch(0.97 0 0)',
    mutedForeground:'oklch(0.55 0 0)',
    border:         'oklch(0.16 0 0)',
    secondary:      'oklch(0.11 0 0)',
  },
  fonts: { heading: "'Orbitron', sans-serif", body: "'Rajdhani', sans-serif", mono: "'Share Tech Mono', monospace" },
  borderRadius: 0,
  animationsEnabled: true,
}
```

---

## 🔤 Font Configuration

Fonts are configured via `SiteConfig.fontConfig` (type `FontConfig`) and loaded by `src/lib/font-loader.ts`.

Three slots are available: `heading`, `body`, and `mono`.

### Google Fonts

```ts
import type { FontConfig } from '@/lib/types'

const fontConfig: FontConfig = {
  heading: { family: 'Orbitron',  source: 'google', weights: ['400', '700'] },
  body:    { family: 'Rajdhani',  source: 'google', weights: ['400', '500', '700'] },
  mono:    { family: 'Share Tech Mono', source: 'google' },
}
```

### Local / Self-hosted fonts

```ts
const fontConfig: FontConfig = {
  heading: {
    family: 'MyCustomFont',
    source: 'local',
    localUrls: ['/fonts/MyCustomFont-Regular.woff2'],
  },
}
```

### Applying fonts

```ts
import { applyFontConfig } from '@/lib/font-loader'

// In a React effect, or directly at app startup:
applyFontConfig(fontConfig)
```

This injects a `<link>` tag for Google Fonts (or a `@font-face` block for local fonts) and sets `--font-heading`, `--font-body`, `--font-mono` CSS custom properties on `:root`.

Each design preset already includes a recommended font pairing — when you apply a preset via `presetToThemeSettings()` the corresponding `fontHeading`, `fontBody`, and `fontMono` values are set on `ThemeSettings` automatically.

---

## 📐 Section System

Sections are managed via `SiteConfig.sections` (`SectionConfig[]`) and the utilities in `src/lib/sections.ts`.

### `SectionConfig` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Section identifier (e.g. `'news'`, `'gigs'`) |
| `enabled` | `boolean` | Whether the section is rendered |
| `order` | `number` | Display order (lower = earlier) |
| `settings` | `Record<string, unknown>?` | Optional section-specific settings |

### Known section IDs

`news` · `biography` · `gallery` · `gigs` · `releases` · `media` · `social` · `partners` · `contact`

### Utility functions

```ts
import {
  buildDefaultSections,
  getEnabledSections,
  getEnabledSectionIds,
  toggleSection,
  reorderSections,
} from '@/lib/sections'

// Start from defaults (all enabled, default order)
let sections = buildDefaultSections()

// Disable the gigs section
sections = toggleSection(sections, 'gigs')

// Move 'contact' to position 1
sections = reorderSections(sections, 'contact', 1)

// Get ordered list of enabled section IDs
const orderedIds = getEnabledSectionIds(sections)
// → ['news', 'contact', 'biography', …]
```

---

## 🔍 SEO & Open Graph

`src/lib/meta-tags.ts` generates a `MetaTagSet` from `SiteConfig` and optionally applies it to the document.

```ts
import { generateMetaTags, applyMetaTags } from '@/lib/meta-tags'

const tags = generateMetaTags(siteConfig)
// tags.title, tags.og.image, tags.twitter.card, tags.jsonLd, …

// Apply to the DOM at runtime
applyMetaTags(tags)
```

Generated tags include:

- `<title>` — `{siteName} – {tagline}` (or just `{siteName}`)
- `<meta name="description">` — from `config.description`
- `<link rel="canonical">` — from `config.domain`
- `<meta name="theme-color">` — from `themeSettings.background`
- Full `og:*` Open Graph set
- `twitter:card` / `twitter:site` / `twitter:image`
- `application/ld+json` MusicGroup structured data

For a custom OG image, Twitter handle, or `twitter:card` type:

```ts
const config = createSiteConfig({
  seo: {
    ogImage: 'https://myband.de/og-image.jpg',
    twitterCard: 'summary_large_image',
    twitterHandle: '@myband',
  },
})
```

---

## 🛠 Development

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # TypeScript check + production build
npm run test       # Run Vitest test suite
npm run test:watch # Tests in watch mode
npm run lint       # ESLint 10
npm run preview    # Preview production build
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `ADMIN_SETUP_TOKEN` | One-time token to create the first admin password |
| `KV_REST_API_URL` | Upstash Redis KV URL |
| `KV_REST_API_TOKEN` | Upstash Redis KV token |
| `RESEND_API_KEY` | Resend API key for contact-form email forwarding |

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 + oklch color system |
| Animation | Framer Motion |
| Components | shadcn/ui (Radix UI primitives) |
| Icons | Phosphor Icons |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Data | Upstash Redis via Vercel KV |
| Music | iTunes Search API + Odesli |
| Testing | Vitest + Testing Library |
| Linting | ESLint 10 + typescript-eslint |
| Deploy | Vercel (zero-config) |

---

## 📁 Project Structure

```
src/
├── lib/
│   ├── types.ts            # All TypeScript types (SiteConfig, DesignPreset, …)
│   ├── site-config.ts      # Defaults, createSiteConfig(), migrations
│   ├── design-presets.ts   # Bundled design presets (#157)
│   ├── font-loader.ts      # Google Fonts / local font loading (#158)
│   ├── sections.ts         # Section registry and utilities (#159)
│   └── meta-tags.ts        # OG / SEO tag generation (#160)
├── components/             # React components
├── hooks/                  # Custom React hooks
├── contexts/               # React context providers
├── styles/                 # Global CSS (theme variables, animations)
├── test/                   # Vitest test files
└── main.tsx                # App entry point
api/                        # Vercel serverless functions
public/                     # Static assets
```

---

## 📦 Admin Mode

1. Set the `ADMIN_SETUP_TOKEN` environment variable.
2. Navigate to `?admin-setup` to create your admin password.
3. Click the **edit button** (bottom-right corner) to enter edit mode.
4. All sections support inline editing: content, images, order, visibility.
5. Changes persist automatically via Vercel KV.
6. Export/import the full config as JSON for backup or migration.
7. Enable TOTP two-factor authentication in admin settings.

---

## 🔒 Security

- HTTP rate limiting on all API routes (Upstash)
- TOTP 2FA for admin login
- Attacker profiling and IP blocklist
- GDPR-compliant cookie consent
- Content Security Policy headers (via Vercel)
- Input sanitisation with DOMPurify

See [SECURITY.md](SECURITY.md) for responsible disclosure.

---

## 📄 License

[MIT](LICENSE) — free to use, modify, and deploy for any purpose.
