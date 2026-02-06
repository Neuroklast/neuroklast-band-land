# NEUROKLAST - Official Band Website

A dark, minimal landing page for the hard techno/industrial band NEUROKLAST featuring automatic Spotify integration, upcoming gigs, releases, and social media presence.

## 🎵 Features

- **Automatic Spotify Integration**: Latest releases are automatically fetched from Spotify with cover art
- **Biography Section**: Band story, history, and background
- **Upcoming Gigs**: Display of upcoming shows with venue, location, and ticket links
- **Releases Gallery**: Grid of recent releases with artwork and streaming links
- **Social Media Hub**: Links to Instagram, Facebook, Spotify, SoundCloud, YouTube, Bandcamp, and more
- **Content Management**: Owner-only edit mode for updating content without code changes

## 🚀 Tech Stack

- React 19 with TypeScript
- Tailwind CSS v4
- Framer Motion for animations
- shadcn/ui components
- Spotify API integration via LLM
- Spark KV for data persistence

## 🎨 Design

Bold industrial aesthetic with:
- Pure black background
- Crimson red accents
- Rajdhani + Inter typography
- Minimal, geometric layouts
- Aggressive, high-energy visual impact

## 🔧 Development

The site automatically loads releases from Spotify on first visit. Owners can:
- Click "Edit Mode" to update content
- Manually sync Spotify releases
- Add/edit/delete gigs, releases, and social links
- Update biography

All changes persist automatically using Spark KV storage.

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
