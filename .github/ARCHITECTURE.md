# Architecture Guide

> Comprehensive reference for coding agents and contributors.
> Last updated: 2026-03-10

---

## Project Overview

**Neuroklast Band Land** is a universal artist website template — a cyberpunk-themed, themeable band website builder with admin CMS, built as a single-page React application deployed on Vercel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7.3 + SWC |
| Styling | Tailwind CSS 4.1 (`@tailwindcss/vite` plugin) |
| Animation | Framer Motion 12 |
| UI Primitives | Radix UI (dialogs, menus, forms, tooltips) |
| Forms | React Hook Form 7 + Zod validation |
| State | Custom KV hook + React Context |
| i18n | i18next + react-i18next (HTTP backend, JSON files) |
| Testing | Vitest 4 + React Testing Library |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Icons | Phosphor Icons + Lucide React |
| Notifications | Sonner (toast) |
| Deployment | Vercel (serverless functions for API) |

---

## Directory Structure

```
/
├── .github/                    # CI, Copilot instructions, architecture docs
├── api/                        # Vercel serverless API routes
│   ├── auth.js                 # Session authentication
│   ├── kv.ts                   # KV read/write endpoint
│   └── admin/                  # Protected admin endpoints
├── public/
│   ├── locales/                # i18n dictionaries
│   │   ├── en/common.json      # English
│   │   └── de/common.json      # German
│   ├── music/                  # MP3 tracks for built-in player
│   └── theme-init.js           # FOUC prevention (reads theme from localStorage)
├── src/
│   ├── App.tsx                 # Root component — lazy-loads admin dialogs
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles + CSS variable definitions
│   ├── components/             # ~140+ React components
│   │   ├── ui/                 # Radix UI wrapper components (shadcn/ui pattern)
│   │   ├── widgets/            # Custom widget plugin system
│   │   ├── overlay-content/    # Overlay modal content (MemberContent, GigContent, etc.)
│   │   ├── *Section.tsx        # Content section presentational components
│   │   ├── *Dialog.tsx         # Admin dialogs (lazy-loaded)
│   │   ├── Default*Slot.tsx    # Default slot wrappers for content sections
│   │   ├── SiteContentRenderer.tsx  # Main section orchestrator
│   │   ├── SectionGuard.tsx    # Visibility + animation + error boundary wrapper
│   │   └── AdminDialogManager.tsx   # Dialog dispatcher (15 dialog types)
│   ├── contexts/               # React Context providers
│   │   ├── ThemeContext.tsx     # Theme state + DOM application
│   │   └── LocaleContext.tsx   # i18n locale selection
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-kv.ts           # Dual-layer persistence (Vercel KV + localStorage)
│   │   ├── use-site-config.ts  # Site config state management with merge logic
│   │   ├── use-admin-auth.ts   # Admin authentication + TOTP
│   │   └── [14+ other hooks]
│   ├── lib/                    # Utilities & business logic
│   │   ├── types.ts            # Core TypeScript interfaces (1000+ lines)
│   │   ├── theme-registry.ts   # Theme slot resolution + THEME_CATALOG
│   │   ├── theme-application.ts # DOM CSS variable application
│   │   ├── design-presets.ts   # Color/font preset definitions
│   │   ├── sections.ts         # Section registry & ordering
│   │   ├── i18n.ts / i18n-config.ts # i18n setup
│   │   ├── activation.ts       # License key validation
│   │   └── [20+ utility modules]
│   ├── features/               # Feature modules
│   │   └── admin/components/   # Admin Hub + ContentForms
│   ├── themes/                 # Theme packages
│   │   ├── index.ts            # Barrel export + builtInThemes array
│   │   ├── default-slots.tsx   # Default fallback components for all 24 slots
│   │   ├── primitives/         # Shared primitives (ThemeCard, ThemeSectionDivider)
│   │   ├── neuroklast-classic/ # Exclusive Neuroklast theme
│   │   ├── nebula-noir-theme/  # Free Art Deco cosmic theme
│   │   ├── glitch-noir/        # Free minimal dark techno theme
│   │   └── zardonic/           # Exclusive industrial cyberpunk theme
│   ├── styles/                 # Theme preset CSS files
│   └── test/                   # 60 test files, 992+ tests
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Core Architecture Patterns

### 1. Theme Slot System (24 Slots)

Every visual component is resolved through a slot mechanism. Themes can override any subset of 24 slots; missing slots fall back to defaults automatically.

```typescript
// In any component:
const { Hero, GigsSection, Footer } = useThemeSlots(themeId)
return <Hero {...heroProps} />
```

**See:** [THEME_GUIDE.md](./THEME_GUIDE.md) for complete slot reference.

### 2. Section Rendering Pattern

Content sections are rendered through `SiteContentRenderer.tsx`, which:
1. Resolves all 24 slots via `useThemeSlots()`
2. Wraps each section in `<SectionGuard>` for visibility + animation + error boundary
3. Passes data + callbacks down as props

```tsx
<SectionGuard sectionId="news" activeSectionIds={ids} delay={0.7} label="News">
  <ThemeNewsSection news={data.news} editMode={isOwner} onUpdate={...} />
</SectionGuard>
```

### 3. Container / Presentational Split

- **Container:** `SiteContentRenderer.tsx` — orchestrates state, callbacks, section ordering
- **Presentational:** Individual section components receive data + callbacks as props
- **Default Slots:** Thin wrappers in `src/themes/default-slots.tsx` that delegate to existing presentational components
- **Theme Overrides:** Themes provide replacement components with the same props interface

### 4. State Management

```
User Action → updateConfig(partial)
  → setSiteConfig() [use-site-config.ts — deep merges nested objects]
  → React state update (immediate UI)
  → localStorage.setItem('kv:site-config', ...) [sync]
  → POST /api/kv [async, with AbortController for latest-write]
  → Vercel KV [server persistence]
```

**Key merge behavior in `updateConfig()`:**
- `themeSettings`, `contactSettings`, `newsletterSettings`, `navigation`, `footer`, `seo`, `features` are **deep-merged** (not replaced)
- This prevents data loss when updating partial settings

### 5. Theme Application Flow

```
Theme selected → applyThemeToDOM(settings)
  → document.documentElement.setAttribute('data-theme', preset)
  → Set CSS custom properties (--primary, --background, --font-heading, etc.)
  → localStorage.setItem('nk-theme-cache', settings) [FOUC prevention]
  → onChangeTheme(settings) [persist to KV store]
```

### 6. Admin Dialog System (Lazy-Loaded)

Heavy admin dialogs are lazy-loaded via `React.lazy()`:
- `AdminDialogManager` dispatches 15+ dialog types
- `AdminHubDialog` is the central admin panel with 4 tabs: Content, Design, Store, System
- Each dialog type is code-split into its own chunk

**AdminDialog types:** `design`, `config`, `sound`, `terminal`, `secret-terminal`, `analytics`, `security-log`, `security-settings`, `blocklist`, `attacker-profiles`, `inbox`, `subscribers`, `marketing`, `oauth`, `store`, `keys`, `admin-hub`

### 7. Section Visibility System

Sections are managed through `SectionConfig`:
```typescript
interface SectionConfig {
  id: string      // e.g., 'news', 'gigs', 'releases'
  enabled: boolean
  order: number
}
```

Available sections: `news`, `biography`, `gallery`, `gigs`, `releases`, `media`, `social`, `partners`, `contact`

`SectionGuard` wraps each section with:
- Visibility check (`activeSectionIds.includes(sectionId)`)
- Entrance animation (Framer Motion with staggered delays)
- Error boundary (per-section crash isolation)

---

## Styling Conventions

### CSS Variables (Theme Tokens)

Applied via `applyThemeToDOM()` to `:root`:

| Variable | Purpose |
|----------|---------|
| `--primary` | Primary accent color |
| `--background` | Page background |
| `--foreground` | Text color |
| `--card` | Card background |
| `--border` | Border color |
| `--font-heading` | Heading font family |
| `--font-sans` | Body font family |
| `--font-mono` | Monospace font family |
| `--radius` | Border radius |

### Tailwind Usage

- Use **design tokens** only: `bg-background`, `text-foreground`, `bg-primary`, `border-border`, etc.
- **NEVER** use hardcoded Tailwind colors like `bg-red-500`, `text-blue-300`
- Scope theme-specific CSS with `[data-theme="theme-id"]` selectors

### Scoped Theme CSS

```css
[data-theme="my-theme"] .hero-title {
  font-size: 4rem;
  color: var(--primary);
}
```

---

## i18n System

### Setup
- i18next with HTTP backend loading JSON from `public/locales/{en,de}/{common,security,admin}.json`
- Browser language auto-detection via `i18next-browser-languagedetector`
- Languages: English (`en`), German (`de`)

### Usage
```tsx
import { useLocale } from '@/contexts/LocaleContext'

function MyComponent() {
  const { t } = useLocale()
  return <h1>{t('news.defaultTitle')}</h1>
}
```

### Key Conventions
- `footer.*` — Footer strings
- `nav.*` — Navigation strings
- `hero.*` — Hero section strings
- `news.*`, `bio.*`, `gigs.*`, `releases.*`, etc. — Section-specific
- `hub.*` — Admin Hub menu items and descriptions
- `content.*` — Admin ContentForms labels
- `store.*` — Store dialog strings
- `theme.*` — Theme customizer strings
- `edit.*` — Edit mode buttons

### ESLint Rule
`i18next/no-literal-string` (warn, markupOnly: true) catches hardcoded strings in JSX markup.

---

## Data Persistence

### KV Layer (`use-kv.ts`)
- **Primary:** Vercel KV via `/api/kv` endpoint
- **Fallback:** localStorage under `kv:{key}` prefix
- **Flow:** Fetch from KV on mount (8s timeout) → fall back to localStorage → sync writes to both
- **Optimistic:** UI updates immediately; server sync is async

### Theme Cache
- `nk-theme-cache` in localStorage for instant theme application on page load
- `public/theme-init.js` reads this before React mounts (prevents FOUC)

### Important Keys
- `kv:site-config` — Main site configuration
- `nk-theme-cache` — Fast theme restore

---

## Security Architecture

1. **Session Management:** HttpOnly cookies, server-side validation via `/api/auth`
2. **Rate Limiting:** Upstash RateLimit on admin endpoints
3. **TOTP 2FA:** Optional second factor for admin accounts
4. **Activation Keys:** License key validation for exclusive themes
5. **Input Sanitization:** DOMPurify for HTML content
6. **Code Obfuscation:** Optional (`VITE_OBFUSCATE=true`)

---

## Build & Test

```bash
npm install         # Install dependencies
npm run dev         # Vite dev server + HMR
npm run build       # Production build (Vite)
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm test            # Vitest (992+ tests across 60 files)
npm run test:watch  # Vitest watch mode
```

**Note:** `tsc` has pre-existing errors but `vite build` succeeds (Vite uses SWC, not tsc).

---

## Theme Access Levels

| Level | Description | Example |
|-------|-------------|---------|
| `free` | Available to everyone | Nebula Noir, Glitch Noir |
| `exclusive` | Locked to specific site via `exclusiveFor` | Neuroklast Classic, Zardonic |
| `premium` | Requires Pro license tier | (future) |

**THEME_CATALOG** in `theme-registry.ts` maps theme IDs to `ThemeLicenseStatus`:
- `free` — always accessible
- `locked` — requires license key (with `licenseKeyPrefix`)
- `licensed` — user has valid key
- `preview` — visible but not activatable

---

## File Naming Conventions

| Pattern | Purpose |
|---------|---------|
| `*Section.tsx` | Content section component |
| `*Dialog.tsx` | Admin dialog (lazy-loaded) |
| `*SlotProps` | Props interface for theme slot |
| `Default*Slot.tsx` | Default slot wrapper |
| `use-*.ts` | Custom React hook |
| `*.test.ts(x)` | Test file |

---

## Adding a New Feature Checklist

1. **Types first:** Define interfaces in `src/lib/types.ts`
2. **i18n keys:** Add to both `en/common.json` and `de/common.json`
3. **Component:** Create in `src/components/` using design tokens (no hardcoded colors)
4. **Hook (if stateful):** Create in `src/hooks/`
5. **Tests:** Add to `src/test/`
6. **Wire up:** Import in parent component or register in appropriate system
