# NEUROKLAST - Official Band Website

A dark, industrial landing page for the hard techno/industrial band **NEUROKLAST** featuring automatic iTunes integration, upcoming gigs, releases, and social media presence. Label: **Darktunes Music Group**.

## 🎵 Features

- **Automatic iTunes Integration**: Latest releases are automatically fetched from iTunes with cover art and enriched with streaming links via Odesli
- **Biography Section**: Band story, all 3 members with expandable bios, achievements, and founded year
- **Gallery**: Image gallery loaded from `src/assets/images/gallery/` with lightbox zoom and HUD-style overlays
- **Upcoming Gigs**: Event listings with venue, location, date, ticket links, and supporting artist info
- **Releases Gallery**: Grid of releases with artwork (dot-matrix/scanline effect), streaming links (Spotify, SoundCloud, YouTube, Bandcamp)
- **Social Media Hub (Connect)**: Links to Instagram, Facebook, Spotify, SoundCloud, YouTube, Bandcamp, TikTok, and more
- **Content Management**: Owner-only edit mode for updating content without code changes
- **Video Export**: Export custom animations as video files (WebM format) using browser-based recording
- **Impressum**: Legal contact info with anti-scraping protection for phone/email (rendered as images)
- **Secret Terminal**: Hidden Konami code easter egg with a cyberpunk terminal

## 🖼️ Gallery Setup

To add images to the gallery:

1. Add your images (.jpg, .jpeg, .png, .gif, or .webp) to `src/assets/images/gallery/`
2. Images will automatically load and display in the gallery grid
3. Click any image to open it in a full-screen lightbox

## 🚀 Tech Stack

- React 19 with TypeScript
- Tailwind CSS v4
- Framer Motion for animations
- shadcn/ui components
- iTunes Search API + Odesli (song.link) for streaming link resolution
- Vercel KV for data persistence

## 🎨 Design

Dark industrial / cyberpunk HUD aesthetic with:
- Pure black background
- Crimson red accents (oklch-based color system)
- JetBrains Mono (headings) + Space Grotesk (body) typography
- Dot-matrix and scanline effects on headings and images
- Chromatic aberration, glitch animations, and CRT-style overlays
- HUD corner markers, data readouts, and grid overlays
- Responsive layout for mobile and desktop

## 🔧 Development

```bash
npm install
npm run dev
```

The site automatically loads releases from iTunes on first visit. Owners can:
- Click "Edit Mode" to update content
- Manually sync iTunes releases
- Add/edit/delete gigs, releases, and social links
- Update biography and member list (currently showing 3 members)
- Edit the Impressum (legal info)
- **Export animations as video** using the video export tool

All changes persist automatically using Vercel KV storage.

## 🎬 Video Export

The site includes a built-in video export feature that allows you to capture and export custom animations as video files:

1. Click "Edit Mode" to access owner controls
2. Click the **Film Slate** icon (🎬) to open the Video Export dialog
3. Configure export settings:
   - **Duration**: Length of the recording in seconds (1-60s)
   - **Frame Rate**: FPS for the video (15-60, recommended: 30)
4. Click "START EXPORT" to begin recording
5. The system will capture all visible animations and effects
6. Once complete, click "DOWNLOAD VIDEO" to save the WebM file

**Technical Details:**
- Uses browser-based MediaRecorder API (no server required)
- Captures the entire viewport including all Framer Motion animations
- Output format: WebM (VP8/VP9 codec, widely supported)
- Recording happens in real-time at the specified FPS
- Works with all modern browsers that support MediaRecorder API

**Note:** The video export feature captures what's visible in the browser viewport, so ensure your browser window is sized appropriately before starting the export.

## 👥 Band Members

The site displays all 3 band members in the biography section with expandable bios and optional photos. Edit mode allows you to update member details.

## 📄 License

The template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
