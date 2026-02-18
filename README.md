# NEUROKLAST - Official Band Website

A dark, industrial single-page application for the hard techno/industrial band **NEUROKLAST** featuring automatic iTunes integration, music player, upcoming gigs, releases, and social media presence. Label: **Darktunes Music Group**.

## 🎵 Features

- **Built-in Music Player**: Play NEUROKLAST tracks directly on the website with volume control, track navigation, and progress bar
- **Automatic iTunes Integration**: Latest releases are automatically fetched from iTunes with cover art and enriched with streaming links via Odesli
- **Biography Section**: Band story, members with expandable profile overlays, achievements, and collaborations
- **Photo Gallery**: Swipeable image gallery with lightbox zoom and HUD-style overlays
- **Instagram Gallery**: Image gallery loaded from Google Drive or direct URLs with glitch effects
- **Upcoming Gigs**: Event listings with venue, location, date, ticket links, and supporting artist info
- **Releases Gallery**: Grid of releases with artwork (dot-matrix/scanline effect), streaming links (Spotify, SoundCloud, YouTube, Bandcamp)
- **Media Archive**: File explorer overlay for press kits, logos, and downloadable assets
- **Social Media Hub (Connect)**: Links to Instagram, Facebook, Spotify, SoundCloud, YouTube, Bandcamp, TikTok, and more
- **Partners & Friends**: Grid of collaborators with individual profile overlays and social links
- **News Section**: Latest updates with expandable details and photos
- **Content Management**: Owner-only edit mode for updating all content without code changes
- **Admin Analytics Dashboard**: Track page visits, section views, user interactions, traffic sources, and device types
- **Impressum & Datenschutz**: Legal pages with multi-language support (DE/EN)
- **Secret Terminal**: Hidden Konami code easter egg with a cyberpunk terminal
- **Cookie Banner**: GDPR-compliant cookie consent
- **Fixed Navigation**: Sticky navigation bar that stays visible while scrolling

## 🖼️ Gallery Setup

To add images to the gallery:

1. Add your images (.jpg, .jpeg, .png, .gif, or .webp) to `src/assets/images/gallery/`
2. Or configure a Google Drive folder URL in admin mode
3. Images will automatically load and display in the gallery grid
4. Click any image to open it in a full-screen lightbox

## 🚀 Tech Stack

- **React 19** with TypeScript
- **Tailwind CSS v4** with oklch color system
- **Framer Motion** for animations and transitions
- **shadcn/ui** components (button, card, dialog, input, label, separator, slider, switch, textarea, badge, tooltip)
- **Phosphor Icons** for iconography
- **Recharts** for data visualization
- **iTunes Search API** + **Odesli** (song.link) for streaming link resolution
- **Upstash Redis** (via Vercel KV) for data persistence
- **Vite 7** for development and building
- **Vitest** for testing

## 🎨 Design

Dark industrial / cyberpunk HUD aesthetic with:
- Pure black background
- Crimson red accents (oklch-based color system)
- JetBrains Mono (headings) + Space Grotesk (body) typography
- Dot-matrix and scanline effects on headings and images
- Chromatic aberration, glitch animations, and CRT-style overlays
- HUD corner markers, data readouts, and grid overlays
- Profile overlays with loading → glitch → reveal phase animations
- Responsive layout for mobile and desktop

## 🔧 Development

```bash
npm install
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript check + production build |
| `npm run test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

### Admin Mode

The site supports full content management through admin mode:

1. Navigate to `?admin-setup` to create an admin password (first-time setup)
2. Click the edit button (bottom-right) to toggle edit mode
3. All sections support inline editing of content, images, and settings
4. Changes persist automatically via Vercel KV storage
5. Export/import data as JSON for backup
6. Optional auto-sync from a Google Drive JSON file

### Analytics Dashboard

Admin users can access the built-in analytics dashboard to view:
- **Page views** and **unique sessions** over time
- **Section engagement** (which sections visitors scroll to)
- **User interactions** (profile clicks, release views, etc.)
- **Traffic sources** (referrer domains)
- **Device breakdown** (desktop/mobile/tablet)

Data is stored in persistent server storage with local browser fallback.

## 🔒 Security

For security considerations and reporting vulnerabilities, please see [SECURITY.md](SECURITY.md).

### Security Features

- Password-protected admin mode with scrypt password hashing (with legacy SHA-256 migration)
- Zod input validation and sanitization on all API endpoints
- XSS prevention through proper escaping
- CSRF protection
- HTTPS enforcement in production
- Rate limiting with GDPR-compliant IP hashing
- Honeytoken intrusion detection
- SSRF protection on image proxy
- robots.txt access control with violation detection
- Regular dependency updates

## 🌐 Deployment

This site is designed to be deployed on **Vercel** with:
- Automatic HTTPS
- Edge functions for API routes
- KV storage integration (or Upstash Redis)
- Automatic builds from Git

### Environment Variables

For production deployment, configure:
- `KV_REST_API_URL` - Redis/KV storage URL
- `KV_REST_API_TOKEN` - Redis/KV storage token

## 📄 License

This project is licensed under the terms of the MIT license. See [LICENSE](LICENSE) for details.

The template was originally derived from GitHub resources and has been extensively modified for the NEUROKLAST band website.
