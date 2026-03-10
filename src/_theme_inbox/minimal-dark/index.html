# Signal Static Theme - Complete Band Website Framework

## Overview
This is a complete, production-ready frontend theme for music bands with a dark techno aesthetic featuring noise, scanlines, and signal interference effects. Built as dumb presentational components ready for CMS integration.

## Theme Architecture

### Core Components (Existing)
1. **LoadingScreen** - Immersive loading animation with terminal-style progress
2. **BackgroundEffects** - Fixed layer with noise, scanlines, vignette, and grid effects
3. **Navigation** - Sticky header with timestamp and smooth scroll links
4. **Hero** - Full viewport hero section with band name and transmission effects
5. **Card** - Reusable wrapper with corner decorations and hover effects
6. **SectionDivider** - Animated SVG dividers between major sections

### New Section Components
7. **BiographySection** - Band bio with image placeholder and metadata grid
8. **GigsSection** - Upcoming tour dates with ticket buttons and status badges
9. **ReleasesSection** - Album/EP grid with cover art placeholders and stream links
10. **SocialSection** - Social media links and video embed placeholders
11. **Footer** - Complete footer with links, metadata, and status indicators

### Utility Components
12. **ThemeModalWrapper** - Animated modal using Framer Motion with glitch-style animations
13. **GlobalOverlayLayer** - Pure CSS viewport overlay with controllable CRT effects

## Data Placeholder System

All dynamic content uses double-curly-brace placeholder syntax for CMS mapping:

### Biography Section
- `{{BAND_BIO_PARAGRAPH_1}}`
- `{{BAND_BIO_PARAGRAPH_2}}`
- `{{BAND_BIO_PARAGRAPH_3}}`
- `{{BAND_FOUNDED_YEAR}}`
- `{{BAND_LOCATION}}`
- `{{BAND_GENRE}}`
- `{{BAND_IMAGE}}`

### Gigs Section
- `{{GIG_N_VENUE}}`
- `{{GIG_N_LOCATION}}`
- `{{GIG_N_DATE}}`
- `{{GIG_N_TIME}}`
- `{{GIG_N_TICKET_URL}}`

### Releases Section
- `{{RELEASE_N_TITLE}}`
- `{{RELEASE_N_YEAR}}`
- `{{RELEASE_N_TYPE}}`
- `{{RELEASE_N_TRACKS}}`
- `{{RELEASE_N_COVER}}`
- `{{RELEASE_N_STREAM_URL}}`

### Social Section
- `{{PLATFORM_HANDLE}}`
- `{{PLATFORM_URL}}`
- `{{PLATFORM_FOLLOWERS}}`
- `{{VIDEO_EMBED_URL}}`
- `{{YOUTUBE_CHANNEL_URL}}`

### Footer
- `{{BAND_NAME}}`
- `{{IMPRINT_URL}}`
- `{{PRIVACY_URL}}`
- `{{TERMS_URL}}`
- `{{CONTACT_URL}}`

## Design System

### Color Palette (oklch)
- **Background**: `oklch(0.08 0 0)` - Deep black
- **Foreground**: `oklch(0.95 0 0)` - Near white
- **Card**: `oklch(0.12 0 0)` - Subtle elevation
- **Accent**: `oklch(0.7 0 0)` - Light gray highlights
- **Muted**: `oklch(0.15 0 0)` - Muted backgrounds
- **Border**: `oklch(0.25 0 0)` - Subtle borders

### Typography
- **Primary Font**: JetBrains Mono
- **Secondary Font**: IBM Plex Mono
- All text uses monospace for technical aesthetic

### Visual Effects
- Scanline animations (8s loop)
- Noise texture (0.3s pulse)
- CRT flicker (0.15s)
- Grain shift (1s stepped)
- Corner bracket decorations
- Glitch effects on hover

### Animations
- Card hover: Noise intensification + accent border
- Modal: Scale + fade with ease-out
- Dividers: Pulsing dots
- Loading: Progress bar with shine effect
- Navigation: Smooth scroll with link highlighting

## Component Usage

### Basic Layout
```tsx
import { signalStaticTheme } from '@/themes/signal-static'

const {
  LoadingScreen,
  BackgroundEffects,
  GlobalOverlayLayer,
  Navigation,
  Hero,
  BiographySection,
  ReleasesSection,
  GigsSection,
  SocialSection,
  Footer,
  SectionDivider
} = signalStaticTheme.slots

function App() {
  return (
    <div className="relative min-h-screen">
      <BackgroundEffects />
      <GlobalOverlayLayer 
        noiseIntensity={0.4} 
        scanlineIntensity={0.8} 
        flickerIntensity={0.05} 
      />
      <Navigation />
      <main className="relative z-10">
        <Hero />
        <SectionDivider />
        <BiographySection />
        <SectionDivider />
        <ReleasesSection />
        <SectionDivider />
        <GigsSection />
        <SectionDivider />
        <SocialSection />
      </main>
      <Footer />
    </div>
  )
}
```

### Modal Usage
```tsx
import { ThemeModalWrapper } from '@/themes/signal-static'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <ThemeModalWrapper
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="TRANSMISSION_DETAILS"
    >
      <div className="font-mono text-sm">
        Your modal content here
      </div>
    </ThemeModalWrapper>
  )
}
```

## CSS Class Prefixes
All custom CSS classes use the `signal-static-` prefix to prevent global collisions:
- `.signal-static-bg-noise`
- `.signal-static-scanlines`
- `.signal-static-card`
- `.signal-static-transmission-box`
- etc.

## Mobile Responsiveness
- Navigation collapses on mobile (hidden md:flex)
- Grid layouts adapt: `grid md:grid-cols-2`
- Stack vertical on mobile: `flex-col md:flex-row`
- Touch-friendly hit areas (min 44px)

## Accessibility
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Color contrast meets WCAG AA standards

## Browser Support
- Modern browsers (ES2020+)
- CSS Grid and Flexbox
- CSS Custom Properties
- CSS Animations and Keyframes
- Backdrop filters

## Performance Considerations
- Pure CSS animations (GPU accelerated)
- `pointer-events-none` on decorative layers
- Minimal JavaScript (only for audio/modal)
- Lazy loading ready for images
- Optimized animation frame rates

## Integration Notes
1. Replace all `{{PLACEHOLDER}}` values with actual CMS data
2. Image placeholders show `[IMG]` - replace with `<img src={data.imageUrl} />`
3. All links use `href` attributes - map to actual URLs
4. Status badges in GigsSection support: UPCOMING, SOLD_OUT, COMPLETED
5. Release types support any string: EP, ALBUM, SINGLE, etc.

## Customization
All colors are defined in `/src/index.css` using CSS variables. Modify the `:root` section to customize the theme without touching component code.

## File Structure
```
/src/themes/signal-static/
├── index.ts                  # Theme registry and exports
├── styles.css                # All custom CSS and keyframes
├── LoadingScreen.tsx
├── BackgroundEffects.tsx
├── GlobalOverlayLayer.tsx
├── Navigation.tsx
├── Hero.tsx
├── BiographySection.tsx
├── ReleasesSection.tsx
├── GigsSection.tsx
├── SocialSection.tsx
├── Footer.tsx
├── Card.tsx
├── SectionDivider.tsx
└── ThemeModalWrapper.tsx
```

## Dependencies
- React 19+
- Framer Motion (for modal animations)
- Tailwind CSS v4
- TypeScript

## License
Ready for commercial use in band websites and SaaS CMS platforms.
