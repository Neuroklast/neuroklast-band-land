# Double Proxy Fix: Removed URL-in-URL Proxying

## Problem Statement

The application was experiencing **400 Bad Request errors** due to double proxying:
- Google Drive URLs were converted to wsrv.nl format (first proxy)
- These wsrv.nl URLs were then passed through `/api/image-proxy` (second proxy)
- This created problematic URLs like: `/api/image-proxy?url=https://wsrv.nl/?url=...`
- Result: Server confusion, SSRF security blocks, and 400 errors

This is described as "Doppelt gemoppelt" (double wrapping) - a classic anti-pattern.

## Solution Implemented

### Frontend Changes

**1. ProgressiveImage Component** (`src/components/ProgressiveImage.tsx`)
- **Before**: Google Drive URLs → wsrv.nl → `/api/image-proxy` (double proxy)
- **After**: Google Drive URLs → wsrv.nl directly (single proxy)
- Server-side proxy only used as fallback for non-Google Drive URLs that fail CORS

**2. Image Cache Library** (`src/lib/image-cache.ts`)
- Updated `loadImageElement()` to avoid double proxying
- Google Drive URLs already converted to wsrv.nl are NOT sent through `/api/image-proxy`
- Only non-Google Drive URLs that fail CORS use the server proxy

### Backend Safety Mechanisms

The `/api/image-proxy` endpoint had server-side safety mechanisms (lines 42-43):
- Detects and unwraps wsrv.nl URLs to extract the Google Drive file ID
- Converts them back to direct Google Drive URLs
- **However**, these only prevented issues at the server level

The problem was that the **frontend was still making the double-proxy request**, which:
- Created complex URL-in-URL patterns that some security systems block (400 errors)
- Added unnecessary network latency (client → server → wsrv.nl instead of client → wsrv.nl)
- Increased server load even when unwrapping worked

The frontend changes prevent these requests from being made in the first place.

The `/api/image-proxy` is still needed for:
  - Non-Google Drive URLs that require CORS handling
  - JSON file imports (EditControls.tsx)
  - Fallback when direct wsrv.nl loading fails

### Upstash Redis Integration

The user has configured Upstash Redis, which is now the exclusive caching backend:
- `/api/image-proxy` uses `@vercel/kv` (which wraps Upstash Redis)
- Images are cached server-side for 30 days
- No changes needed to use Redis - it's already integrated

## Benefits

✅ **No more double proxying** - Clean, single-proxy architecture
✅ **Faster image loading** - Direct wsrv.nl CDN access, no extra server hop
✅ **Lower server load** - Most images bypass the server entirely
✅ **Better error handling** - Clearer failure modes
✅ **SSRF protection** - No "URL in URL in URL" patterns

## Technical Details

### URL Transformation Flow

**Google Drive URLs:**
```
Input:  https://drive.google.com/file/d/ABC123/view
        ↓ (toDirectImageUrl)
Output: https://wsrv.nl/?url=https://lh3.googleusercontent.com/d/ABC123
        ↓ (Used directly in <img src>)
Display: Image loads from wsrv.nl CDN
```

**Non-Google Drive URLs (with CORS issues):**
```
Input:  https://example.com/image.jpg
        ↓ (Try direct load)
Error:  CORS failure
        ↓ (Fallback to proxy)
Output: /api/image-proxy?url=https://example.com/image.jpg
        ↓ (Server fetches and caches)
Display: Image loads from server cache
```

### Code Changes Summary

1. **ProgressiveImage.tsx**
   - Removed `isGoogleDriveUrl()` check before proxying
   - Now uses `toDirectImageUrl()` result directly
   - Proxy only attempted on error

2. **image-cache.ts**
   - Added Google Drive URL detection in error handler
   - Prevents sending wsrv.nl URLs to `/api/image-proxy`
   - Updated comments to reflect new flow

## Testing

✅ All image-cache tests passing
✅ Build succeeds without errors
✅ No breaking changes to existing functionality

## Migration Notes

No migration needed. Changes are backward compatible:
- Existing wsrv.nl URLs in the database work as-is
- Old code that used double proxying will now use single proxy
- Server-side unwrapping in `/api/image-proxy` remains as safety net
