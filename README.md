# NEUROKLAST - Official Band Website

A dark, minimal landing page for the hard techno/industrial band NEUROKLAST featuring automatic iTunes integration, upcoming gigs, releases, and social media presence. Label: **Darktunes Music Group**.

## 🎵 Features

- **Automatic iTunes Integration**: Latest releases are automatically fetched from iTunes with cover art
- **Biography Section with Photo Gallery**: Band story, all 3 members, achievements, and swipeable photo gallery
- **Upcoming Gigs**: Display of upcoming shows with venue, location, and ticket links
- **Releases Gallery**: Grid of recent releases with artwork and streaming links (Spotify, SoundCloud, YouTube, Bandcamp)
- **Social Media Hub**: Links to Instagram, Facebook, Spotify, SoundCloud, YouTube, Bandcamp, and more
- **Content Management**: Owner-only edit mode for updating content without code changes

## 🖼️ Photo Gallery Setup

The biography section includes a swipeable photo gallery. To add your band photos:

1. Create a folder at `src/assets/images/photos/`
2. Add your photos (.jpg, .jpeg, .png, or .webp) to this folder
3. Photos will automatically load and display in the gallery
4. Users can swipe on mobile or use arrow buttons to navigate

**Note**: Currently using fallback images from `src/assets/images/`. Add photos to the `photos/` subfolder for the gallery to use those instead.

## 🚀 Tech Stack

- React 19 with TypeScript
- Tailwind CSS v4
- Framer Motion for animations
- shadcn/ui components
- iTunes API integration
- Spark KV for data persistence

## 🎨 Design

Bold industrial aesthetic with:
- Pure black background
- Crimson red accents
- Oxanium + IBM Plex Serif typography
- Minimal, geometric layouts
- Aggressive, high-energy visual impact

## 🔧 Development

The site automatically loads releases from iTunes on first visit. Owners can:
- Click "Edit Mode" to update content
- Manually sync iTunes releases
- Add/edit/delete gigs, releases, and social links
- Update biography and member list (currently showing 3 members)

All changes persist automatically using Spark KV storage.

## 👥 Band Members

The site displays all 3 band members in the biography section. Edit mode allows you to update member names.

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
