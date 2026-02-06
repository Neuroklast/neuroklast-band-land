# Planning Guide

A dark, minimal landing page for the band NEUROKLAST that showcases upcoming gigs, releases, and social media presence with a bold, industrial aesthetic inspired by hard techno and dark electro music culture.

**Experience Qualities**:
1. **Intense** - Bold red accents against pure black create an aggressive, high-energy visual impact matching the hard techno/industrial music genre
2. **Minimal** - Clean geometric layouts with purposeful negative space let each element breathe and command attention
3. **Professional** - Sleek typography and structured information architecture present the band as established and serious

**Complexity Level**: Light Application (multiple features with basic state)
This is a content showcase with interactive elements - social links, upcoming dates, releases, and configurable content that can be updated through the interface.

## Essential Features

### Hero Section with Band Identity
- **Functionality**: Large band logo/name with genre tags, establishing immediate brand presence
- **Purpose**: Create powerful first impression and communicate the band's musical identity
- **Trigger**: Page load
- **Progression**: Logo animates in → Genre tags fade in → Red accent lines draw attention
- **Success criteria**: Logo is prominently displayed, genre tags are readable, visual hierarchy is clear

### Biography Section
- **Functionality**: Display band history, story, founding year, members, achievements, and a swipeable photo gallery with edit capabilities
- **Purpose**: Tell the band's story, showcase all 3 members, and build connection with fans through narrative and visual content
- **Trigger**: User scrolls to biography section
- **Progression**: Section appears → User views photo gallery (can swipe through photos) → Reads band story → Views founding year and all 3 members → Explores achievements
- **Success criteria**: Story is readable and engaging, photo gallery is swipeable and loads images from assets/images/photos directory, founding year is displayed, all 3 members are listed clearly, achievements are formatted as bullet points

### Upcoming Gigs Display
- **Functionality**: List of upcoming show dates with venue, location, and ticket links
- **Purpose**: Drive ticket sales and inform fans of tour schedule
- **Trigger**: User scrolls to gigs section
- **Progression**: Section appears → User scans dates → Clicks ticket link → Redirected to ticketing platform
- **Success criteria**: Dates are chronologically sorted, past dates are filtered out, ticket links are functional

### Releases Section
- **Functionality**: Grid/carousel of recent releases with artwork, title, and streaming links (Spotify, SoundCloud, YouTube, Bandcamp). Automatic syncing with Apple iTunes API to fetch latest releases.
- **Purpose**: Promote music and drive streams/purchases, keeping release catalog up-to-date automatically. Label: Darktunes Music Group.
- **Trigger**: User scrolls to releases section, or owner clicks "Sync iTunes" button
- **Progression**: Release artwork displays → User clicks on release → Opens streaming/purchase link (excludes Apple Music) | Owner clicks sync → System fetches latest releases from iTunes → New releases merge with existing → Success notification appears
- **Success criteria**: Album art is high quality, links open to correct platforms (no Apple Music links shown), layout is visually appealing, iTunes sync successfully imports new releases without duplicates, Darktunes Music Group label is displayed in footer

### Social Media Hub
- **Functionality**: Comprehensive social media link collection (Instagram, Facebook, Spotify, SoundCloud, YouTube, Bandcamp, Linktr.ee) plus an Instagram-style gallery displaying images exclusively from the `/src/assets/images/gallery/` directory with glitch effects
- **Purpose**: Increase social following, provide easy access to all platforms, and showcase visual content in a dedicated gallery
- **Trigger**: User scrolls to gallery or social footer section
- **Progression**: Gallery images display with glitch/scale-in effects → User hovers image (random glitch may trigger) → User clicks image → Opens full image | User clicks social icon → Opens in new tab
- **Success criteria**: All links work, icons are recognizable, hover states provide feedback, gallery loads only images from gallery subdirectory with proper naming, glitch effects trigger periodically

### Content Management
- **Functionality**: Editable sections for biography, gigs, releases, and social links (owner-only)
- **Purpose**: Allow band to update content without code changes
- **Trigger**: Band owner accesses page and sees edit controls
- **Progression**: Owner clicks edit → Modal/form appears → Enters data → Saves → Content updates
- **Success criteria**: Only owner sees edit controls, data persists, updates reflect immediately

## Edge Case Handling
- **No Upcoming Gigs**: Display "No upcoming shows - check back soon" message with past shows archive link
- **Missing Album Art**: Fallback to placeholder with band logo
- **Broken Social Links**: Validate URLs on save, show warning for invalid links
- **Mobile Navigation**: Hamburger menu for smaller screens, collapsible sections
- **Slow Image Loading**: Skeleton loaders for images, blur-up effect on load
- **Empty Biography**: Show default placeholder text encouraging owner to add their story
- **Long Biography Text**: Proper text wrapping and readable line lengths with prose formatting
- **iTunes Sync Failures**: Display error toast if API fails, gracefully handle empty responses
- **Duplicate Releases**: Smart merging prevents duplicate entries when syncing from iTunes
- **Rate Limiting**: Handle API rate limits gracefully with appropriate error messages

## Design Direction
The design should evoke a cyberpunk HUD interface merged with minimal occult symbolism - like a hacker's terminal meets forbidden ritual space. The interface should feel like a futuristic command center: precise geometric HUD elements, scan lines, data readouts, corner brackets, persistent system status displays, and blood-red chromatic aberrations revealing hidden dimensions through glitch artifacts.

## Color Selection
An ascetic occult palette with blood-red accents emerging from darkness:

- **Primary Color**: Pure Black (oklch(0 0 0)) - The void, the abyss, representing emptiness and the unknown
- **Secondary Color**: Blood Red (oklch(0.50 0.22 25)) - Ritualistic accent for glitch effects, borders, and occult symbols; evokes blood, warning, forbidden knowledge
- **Accent Color**: Crimson Glitch (oklch(0.60 0.24 25)) - Used exclusively for glitch chromatic aberrations and hover states
- **Noise Overlay**: Subtle red-tinted noise texture (oklch(0.50 0.22 25 / 0.05)) - Adds analog distortion and occult grain
- **Foreground/Background Pairings**:
  - Primary Black (oklch(0 0 0)): White text (oklch(1 0 0)) - Ratio ∞:1 ✓
  - Blood Red (oklch(0.50 0.22 25)): White text (oklch(1 0 0)) - Ratio 6.1:1 ✓
  - Card backgrounds (oklch(0.05 0 0)): White text (oklch(1 0 0)) - Ratio 19.2:1 ✓

## Font Selection
Typography should convey monospace terminal aesthetics and occult minimalism while maintaining readability.

- **Primary Font**: JetBrains Mono - Monospaced coding font for headers and band name; evokes terminal interfaces and hacker culture
- **Secondary Font**: Space Grotesk - Geometric sans-serif for body text; clean and slightly technical

- **Typographic Hierarchy**:
  - H1 (Band Name): JetBrains Mono/64px/wide (0.05em) letter spacing, uppercase
  - H2 (Section Headers): JetBrains Mono/32px/wide (0.03em) spacing, uppercase
  - H3 (Event Venues): Space Grotesk Medium/20px/normal spacing
  - Body (Dates/Info): Space Grotesk/16px/relaxed (1.6 line-height)
  - Labels (Genre Tags): JetBrains Mono/11px/wide (0.08em) spacing, uppercase

## Animations
Animations should feel like a cyberpunk HUD system with glitchy data corruption, featuring red chromatic aberration, scan lines, and data stream effects.

- **Page Load**: Minimal fade-in with scan line overlay and HUD grid appearing (300ms)
- **HUD Elements**: Persistent corner brackets, data readouts (time, status, frequency), and animated system indicators throughout the interface
- **Scan Lines**: Continuous horizontal scan line animation across the entire viewport, creating CRT monitor effect
- **Logo Animation**: Monospace logo with occasional red glitch distortion (every 4-6 seconds), only red channel separation
- **Text Glitch**: Band name and headings glitch with red chromatic aberration only - no blue/green channels (200ms duration)
- **Data Streams**: Vertical data streams falling down the screen in red/white, simulating active data transmission
- **Element Glitch**: Rare red glitch artifacts on cards and images (every 6-8 seconds), horizontal displacement with red trails
- **HUD Corners**: Animated corner brackets on all major cards and images, with scan line effects
- **Grid Overlay**: Subtle red grid pattern overlaying the background, creating depth and HUD aesthetic
- **Section Reveals**: Simple fade-in on scroll (200ms), no elaborate transitions
- **Hover States**: Minimal red glow (100ms) and HUD border activation on interactive elements
- **Status Indicators**: Pulsing red dots indicating "system online" or "active" states
- **Image Tint**: All photos and gallery images have a strong red color tint/filter applied for cohesive cyberpunk aesthetic
- **Social Icons**: Minimal scale (1.03x) on hover with red outline (80ms)
- **Glitch Direction**: All glitches are horizontal displacement only, creating red chromatic aberration trails
- **Noise Pattern**: SVG noise filter with red tint applied globally, subtle grain effect

## Component Selection

- **Components**:
  - **Card**: For individual gig entries and releases - modified with dark background (oklch(0.08 0 0)) and red border on hover
  - **Button**: For ticket links and CTAs - custom styling with red background and white text, sharp edges (--radius: 0.25rem)
  - **Dialog**: For content editing modals (owner only) - dark overlay with centered form
  - **Input/Textarea**: For editing forms - dark themed with red focus rings
  - **Separator**: Red horizontal lines to divide sections
  - **Skeleton**: For loading states on images
  - **Tabs**: For switching between upcoming/past gigs if needed
  - **Badge**: For genre tags with red accent

- **Customizations**:
  - Custom logo component with animated red accent lines
  - Custom social icon grid with branded icons from Phosphor
  - Custom date/time display component with industrial styling
  - Floating action button for owners to enter edit mode

- **States**:
  - **Buttons**: Default (red bg), Hover (brighter red + scale), Active (darker red), Disabled (gray)
  - **Cards**: Default (subtle border), Hover (red border glow), Focus (red ring)
  - **Links**: Default (white), Hover (red), Active (darker red)
  - **Inputs**: Default (dark border), Focus (red ring), Error (red border + message)

- **Icon Selection**:
  - Calendar (CalendarDots) - for gig dates
  - Music Note (MusicNote) - for releases
  - Social platforms (InstagramLogo, FacebookLogo, SpotifyLogo, SoundcloudLogo, YoutubeLogo, etc.)
  - Edit (PencilSimple) - for owner edit mode
  - Plus (Plus) - for adding new entries
  - Link (Link) - for external links

- **Spacing**:
  - Sections: py-20 (80px vertical padding)
  - Cards: p-6 (24px padding)
  - Grid gaps: gap-6 (24px between cards)
  - Container max-width: max-w-6xl
  - Section margins: mb-12 between major sections

- **Mobile**:
  - Hero: Stack logo and reduce font size (48px on mobile)
  - Gigs: Single column card layout
  - Releases: 2-column grid on tablet, single on mobile
  - Social: 3-4 icons per row on mobile vs 6-8 on desktop
  - Navigation: Sticky header with smooth scroll navigation
  - Touch targets: Minimum 44px for all interactive elements
  - Touch Interactions: Swipe gestures for galleries, pull-to-refresh behaviors, haptic-like visual feedback
  - Active States: Immediate visual response with scale transforms (0.95-0.98x) for all tappable elements
  - Touch Feedback: Ripple effects on cards, enhanced active states with increased opacity/glow
  - Gesture Support: Horizontal swipe for photo gallery navigation (75px threshold), pinch-to-zoom on images
  - Scroll Behavior: Momentum scrolling, smooth snap points for carousels, overscroll bounce effects
  - Mobile Menu: Full-screen overlay with staggered animations, tap-outside-to-close functionality
