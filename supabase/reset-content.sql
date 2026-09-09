-- ============================================================
-- Neuroklast Industrial – Reset content (NOT a factory reset)
--
-- Run in Supabase Dashboard → SQL Editor. Deletes ALL editable
-- content + stale sync state so you can re-import the site
-- JSON (Look & Feel / API keys stay) and start sync + media
-- upload fresh.
--
-- KEPT (never deleted):
--   public.profiles            (admin / user auth)
--   public.api_secrets         (encrypted integration API keys)
--   public.site_config         (design / Look & Feel / sections)
--   public.bio                 (biography)
--   public.newsletter_subscribers
--   public.analytics_events    (consent-gated telemetry)
--
-- DELETED:
--   releases, gigs, gallery, partners, social_links, news_posts,
--   music_highlights, merchandise, soundpacks, media_downloads,
--   sync_jobs
--
-- Irreversible. Export a full JSON backup from /admin/data first.
-- ============================================================

BEGIN;

DELETE FROM public.releases;
DELETE FROM public.gigs;
DELETE FROM public.gallery;
DELETE FROM public.partners;
DELETE FROM public.social_links;
DELETE FROM public.news_posts;
DELETE FROM public.music_highlights;
DELETE FROM public.merchandise;
DELETE FROM public.soundpacks;
DELETE FROM public.media_downloads;
DELETE FROM public.sync_jobs;

COMMIT;

-- Verify nothing unexpected survived:
-- SELECT count(*) FROM public.releases;
-- SELECT count(*) FROM public.gigs;
-- (both should be 0)
