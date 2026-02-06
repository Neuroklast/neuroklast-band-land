# NEUROKLAST - Official Band Website

A dark, minimal landing page for the hard techno/industrial act NEUROKLAST featuring automatic iTunes integration, upcoming gigs, releases, photo gallery, and social media presence.

## 🎵 Features

- **Automatic iTunes Integration**: Latest releases are automatically fetched from iTunes with cover art
- **Biography Section**: Band story loaded from an editable text file (`public/content/biography.txt`)
- **Upcoming Gigs**: Display of upcoming shows with venue, location, and ticket links
- **Releases Gallery**: Grid of recent releases with artwork and streaming links (Spotify, SoundCloud, YouTube)
- **Photo Gallery**: Automatically displays images placed in the `public/photos/` folder
- **Social Media Hub**: Links to Instagram, Facebook, Spotify, SoundCloud, YouTube, Bandcamp, and more
- **Content Management**: Owner-only edit mode for updating content without code changes

## 📝 Editing Content

### Biography
Edit the file `public/content/biography.txt` directly in the repository to update the biography text.

### Photos
Add image files (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`) to the `public/photos/` folder and list their filenames in `public/photos/photos.json`. They will automatically appear in the gallery section on the website.

Example `photos.json`:
```json
["photo1.jpg", "photo2.png", "live-show.webp"]
```

## 🚀 Tech Stack

- React 19 with TypeScript
- Tailwind CSS v4
- Framer Motion for animations
- shadcn/ui components
- iTunes API integration for releases
- Bebas Neue font (local, from repo) + Inter typography

## 🎨 Design

Bold industrial aesthetic with:
- Pure black background
- Crimson red accents
- Bebas Neue + Inter typography
- Minimal, geometric layouts
- Aggressive, high-energy visual impact

## 🔧 Development

The site automatically loads releases from iTunes on first visit. Owners can:
- Click "Edit Mode" to update content
- Manually sync iTunes releases
- Add/edit/delete gigs, releases, and social links
- Update biography via the `public/content/biography.txt` file

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
