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
- **Functionality**: Display band history, story, founding year, members, and achievements with edit capabilities
- **Purpose**: Tell the band's story and build connection with fans through narrative and background
- **Trigger**: User scrolls to biography section
- **Progression**: Section appears → User reads band story → Views founding year and members → Explores achievements
- **Success criteria**: Story is readable and engaging, founding year is displayed, members list is clear, achievements are formatted as bullet points

### Upcoming Gigs Display
- **Functionality**: List of upcoming show dates with venue, location, and ticket links
- **Purpose**: Drive ticket sales and inform fans of tour schedule
- **Trigger**: User scrolls to gigs section
- **Progression**: Section appears → User scans dates → Clicks ticket link → Redirected to ticketing platform
- **Success criteria**: Dates are chronologically sorted, past dates are filtered out, ticket links are functional

### Releases Section
- **Functionality**: Grid/carousel of recent releases with artwork, title, and streaming links. Automatic syncing with Apple iTunes API to fetch latest releases.
- **Purpose**: Promote music and drive streams/purchases, keeping release catalog up-to-date automatically
- **Trigger**: User scrolls to releases section, or owner clicks "Sync iTunes" button
- **Progression**: Release artwork displays → User clicks on release → Opens streaming/purchase link | Owner clicks sync → System fetches latest releases from iTunes → New releases merge with existing → Success notification appears
- **Success criteria**: Album art is high quality, links open to correct platforms, layout is visually appealing, iTunes sync successfully imports new releases without duplicates

### Social Media Hub
- **Functionality**: Comprehensive social media link collection (Instagram, Facebook, Spotify, SoundCloud, YouTube, Bandcamp, Linktr.ee) plus an Instagram gallery displaying the first 3 posts from the NEUROKLAST Instagram profile
- **Purpose**: Increase social following, provide easy access to all platforms, and showcase visual content from Instagram
- **Trigger**: User scrolls to Instagram gallery or social footer section
- **Progression**: Gallery images display with hover effects → User clicks image → Opens Instagram post | User clicks social icon → Opens in new tab
- **Success criteria**: All links work, icons are recognizable, hover states provide feedback, Instagram images load properly with captions

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
The design should evoke the raw energy of industrial techno - dark, aggressive, and unapologetically bold. Think underground clubs, distorted basslines, and neon in the darkness. The interface should feel like a digital manifestation of hard techno culture: precise, minimal, with sudden bursts of intensity through the red accent color.

## Color Selection
A strictly minimal palette emphasizing contrast and aggression:

- **Primary Color**: Pure Black (#000000 / oklch(0 0 0)) - The void, the foundation, representing the dark underground aesthetic
- **Secondary Color**: Crimson Red (oklch(0.55 0.22 25)) - Aggressive accent for CTAs, borders, and highlights; evokes energy, danger, and passion
- **Accent Color**: Bright Red (oklch(0.65 0.25 25)) - Used for hover states and active elements, slightly brighter than secondary
- **Foreground/Background Pairings**:
  - Primary Black (#000000): White text (oklch(1 0 0)) - Ratio ∞:1 ✓
  - Secondary Red (oklch(0.55 0.22 25)): White text (oklch(1 0 0)) - Ratio 5.2:1 ✓
  - Card backgrounds (oklch(0.08 0 0)): White text (oklch(1 0 0)) - Ratio 17.8:1 ✓

## Font Selection
Typography should convey technical precision and industrial strength while maintaining excellent readability.

- **Primary Font**: Bebas Neue - Bold, condensed, industrial letterforms perfect for headers and the band name; evokes power and raw energy
- **Secondary Font**: Inter (Regular/Medium) - Clean, highly readable for body text and dates; ensures information clarity

- **Typographic Hierarchy**:
  - H1 (Band Name): Bebas Neue/72px/wide (0.02em) letter spacing, uppercase
  - H2 (Section Headers): Bebas Neue/36px/normal spacing, uppercase
  - H3 (Event Venues): Bebas Neue/24px/normal spacing, uppercase
  - Body (Dates/Info): Inter Medium/16px/relaxed (1.6 line-height)
  - Labels (Genre Tags): Inter Medium/12px/wide (0.1em) spacing, uppercase

## Animations
Animations should feel deliberate and mechanical, like industrial machinery - precise timing with occasional aggressive bursts. The site feels alive with glitch effects and smooth scroll-triggered animations throughout.

- **Page Load**: Staggered fade-in from top to bottom, hero elements cascade in (200ms delays)
- **Logo Animation**: Larger logo (up to 28rem on desktop) with periodic glitch effects that trigger randomly every 3-4 seconds
- **Text Glitch**: Band name glitches with RGB color separation effect occasionally for energy
- **Section Reveals**: Slide-up with fade on scroll intersection using framer-motion's useInView hook (300ms ease-out)
- **Hover States**: Sharp, quick color transitions (150ms) for links and buttons; scale slightly (1.02x) for cards
- **Red Accent Lines**: Draw in on load using SVG line animation (800ms)
- **Social Icons**: Quick pop on hover with color shift (100ms)
- **Skeleton to Content**: Smooth cross-fade when images load (400ms)
- **Scroll Effects**: All major sections (Biography, Gigs, Releases, Instagram, Social) animate into view with staggered child animations

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
