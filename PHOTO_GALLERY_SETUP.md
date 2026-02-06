# Photo Gallery Setup Guide

## Overview
The biography section features a swipeable photo gallery that dynamically loads images from a designated folder.

## How to Add Photos

### Step 1: Create the Photos Directory
Create a new folder structure:
```
src/
  assets/
    images/
      photos/
```

### Step 2: Add Your Photos
Place your band photos in the `photos/` folder. Supported formats:
- `.jpg` or `.jpeg`
- `.png`
- `.webp`

Example structure:
```
src/
  assets/
    images/
      photos/
        band-photo-1.jpg
        band-photo-2.jpg
        band-photo-3.png
        live-performance.jpg
```

### Step 3: Photos Auto-Load
The gallery will automatically:
- Detect all images in the `photos/` folder
- Display them in a swipeable carousel
- Load them on page load

## Gallery Features

### Navigation
- **Desktop**: Hover over the image to reveal left/right arrow buttons
- **Mobile**: Swipe left or right to navigate
- **All Devices**: Click the indicator dots at the bottom to jump to a specific photo

### Fallback Behavior
If no photos are found in `src/assets/images/photos/`, the gallery will automatically use images from `src/assets/images/` as placeholders.

## Tips

1. **Image Size**: Use high-quality images (at least 1200px wide recommended)
2. **Aspect Ratio**: Images will be displayed in a 16:9 aspect ratio on desktop, square on mobile
3. **File Names**: Use descriptive names like `band-promo-2024.jpg` instead of generic names
4. **Organization**: You can create subfolders within `photos/` for better organization - all images will still be loaded

## Current Members Displayed
The biography section shows all 3 band members:
1. Member 1
2. Member 2  
3. Member 3

Edit these names through the Edit Mode when logged in as the site owner.

## Label Information
The site displays **Darktunes Music Group** as the label in the footer.

## Streaming Links
Releases display links to:
- Spotify
- SoundCloud
- YouTube
- Bandcamp

**Note**: Apple Music links are stored in the backend (for iTunes sync) but are not displayed on the public site.
