# Vercel KV Migration Guide

## Important: Vercel KV is Deprecated

As of the latest update, `@vercel/kv` has been **deprecated** by Vercel. If you're seeing 500 errors when trying to save data, this is likely because:

1. **Vercel KV has been migrated to Upstash Redis** - Your existing KV store should have automatically moved to Upstash Redis, which you can find under "Vercel Integrations" in your Vercel dashboard.

2. **Environment variables may be missing** - The KV service requires `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables to be set in your Vercel project.

## Fixing the 500 Error

### Step 1: Check Your Vercel Dashboard

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on "Integrations"
4. Look for "Upstash Redis" or any Redis integration

### Step 2: Set Up Environment Variables

If you see a Redis integration:
1. Click on the integration
2. Copy the connection details (REST API URL and Token)
3. Go to Project Settings → Environment Variables
4. Add the following variables:
   - `KV_REST_API_URL` - The REST API URL for your KV store
   - `KV_REST_API_TOKEN` - The REST API token for authentication

### Step 3: Redeploy

After setting the environment variables:
1. Go to the "Deployments" tab
2. Click on the latest deployment
3. Click "Redeploy"

## For New Projects

If you're setting up this project for the first time:

1. Install a Redis integration from the [Vercel Marketplace](https://vercel.com/marketplace?category=storage&search=redis)
2. Choose "Upstash" (recommended) or another Redis provider
3. The integration will automatically set up the required environment variables
4. Deploy your project

## Local Development

For local development, you have two options:

### Option A: Use Upstash Redis Locally

1. Create a `.env` file in your project root
2. Add your Redis credentials:
   ```
   KV_REST_API_URL=your-upstash-redis-rest-url
   KV_REST_API_TOKEN=your-upstash-redis-token
   ```

### Option B: Use localStorage Fallback

The application automatically falls back to `localStorage` when the KV API is unavailable. This means:
- Data is stored in your browser's localStorage
- Changes won't sync across devices
- Data is lost when clearing browser data
- Perfect for local development and testing

## Current Behavior

With the latest changes:

1. **When KV is not configured**: The API returns a `503 Service Unavailable` error with a helpful message
2. **Data persistence**: All changes are saved to `localStorage` as a backup, even if KV sync fails
3. **Better error messages**: Console logs now show detailed information about what went wrong
4. **Graceful degradation**: The app continues to work using localStorage even when KV is unavailable

## Understanding the Error Messages

- **500 Internal Server Error**: Usually means the KV service threw an exception (missing config, network issue, etc.)
- **503 Service Unavailable**: KV environment variables are not configured
- **403 Forbidden**: Authentication failed (incorrect admin token)
- **Console warning**: "Data is saved locally in localStorage but not synced to server" - This means your data is safe locally but not backed up to the server

## Verifying the Fix

After setting up KV/Redis properly:

1. Open your deployed site
2. Open browser DevTools (F12)
3. Go to the Console tab
4. Enter edit mode and make a change
5. You should see a successful POST to `/api/kv` without errors
6. Refresh the page - your changes should persist

## Additional Resources

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Upstash Redis](https://upstash.com/)
- [Vercel Integrations](https://vercel.com/integrations)
