-- ============================================================
-- Neuroklast Industrial – Canonical Supabase Schema (idempotent)
-- Run this entire file in the Supabase SQL Editor anytime.
-- Safe on fresh projects AND existing databases (re-runnable).
-- ============================================================

-- ─── profiles (admin auth) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- ─── releases ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'single',
  release_date date,
  description text,
  cover_storage_path text,
  cover_url text,
  streaming_links jsonb DEFAULT '[]',
  tracks jsonb DEFAULT '[]',
  custom_links jsonb DEFAULT '[]',
  artists text[] DEFAULT '{}',
  itunes_id text,
  spotify_id text,
  discogs_id text,
  active boolean DEFAULT true,
  manually_edited boolean NOT NULL DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ─── gigs ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  venue text,
  city text,
  country text,
  event_date timestamptz NOT NULL,
  ticket_url text,
  festival_name text,
  description text,
  bandsintown_id text,
  gig_type text,
  status text DEFAULT 'confirmed',
  sold_out boolean NOT NULL DEFAULT false,
  supporting_artists jsonb DEFAULT '[]',
  event_links jsonb DEFAULT '{}',
  photo_storage_path text,
  photo_url text,
  photo_content_hash text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ─── gallery ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text,
  image_url text,
  alt text,
  caption text,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ─── bio ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text,
  achievements jsonb DEFAULT '[]',
  collabs jsonb DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

-- ─── members ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  bio text,
  photo_storage_path text,
  photo_url text,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ─── social_links ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  label text,
  display_order integer DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  logo_storage_path text,
  logo_url text
);

ALTER TABLE public.social_links ADD COLUMN IF NOT EXISTS logo_storage_path text;
ALTER TABLE public.social_links ADD COLUMN IF NOT EXISTS logo_url text;

-- ─── partners ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text,
  logo_storage_path text,
  logo_url text,
  category text DEFAULT 'partner',
  description text,
  socials jsonb DEFAULT '{}',
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  logo_white boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ─── site_config (key-value) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- ─── api_secrets (encrypted integration keys, admin-only) ───
CREATE TABLE IF NOT EXISTS public.api_secrets (
  key text PRIMARY KEY,
  encrypted_value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- ─── music_highlights ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.music_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  youtube_url text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── merchandise ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.merchandise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_storage_path text,
  image_url text,
  external_url text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── soundpacks ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.soundpacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_storage_path text,
  image_url text,
  external_url text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── products (software / plugin cards; section toggle in site_config) ──
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_storage_path text,
  image_url text,
  href text,
  price_label text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── media_downloads (press kit / downloadable assets) ───────
CREATE TABLE IF NOT EXISTS public.media_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other',
  file_storage_path text,
  file_url text,
  file_mime text,
  file_size_bytes bigint,
  original_filename text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT media_downloads_category_check CHECK (
    category IN ('photo', 'logo', 'document', 'audio', 'other')
  )
);

-- ─── sync_jobs (async catalogue / maintenance workers) ───────
CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  phase text,
  payload jsonb NOT NULL DEFAULT '{}',
  progress jsonb NOT NULL DEFAULT '{"processed":0,"total":null,"synced":0,"updated":0,"skipped":0,"errors":[]}',
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- ─── analytics_events (consent-gated client telemetry) ───────
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  target text,
  meta jsonb,
  heatmap jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx
  ON public.analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_type_idx
  ON public.analytics_events (type);

-- ============================================================
-- Column bridges (upgrade legacy DBs safely)
-- ============================================================

-- gallery: title → alt, visible → active
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery' AND column_name = 'title'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery' AND column_name = 'alt'
  ) THEN
    ALTER TABLE public.gallery RENAME COLUMN title TO alt;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery' AND column_name = 'visible'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery' AND column_name = 'active'
  ) THEN
    ALTER TABLE public.gallery RENAME COLUMN visible TO active;
  END IF;
END;
$$;

ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS alt text;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS caption text;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- partners: visible → active
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'visible'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'active'
  ) THEN
    ALTER TABLE public.partners RENAME COLUMN visible TO active;
  END IF;
END;
$$;

ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS logo_storage_path text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
-- partners: logo_hover_white → logo_white (rename misnamed column)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'logo_hover_white'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'logo_white'
  ) THEN
    ALTER TABLE public.partners RENAME COLUMN logo_hover_white TO logo_white;
  END IF;
END;
$$;

ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS logo_white boolean DEFAULT true;
ALTER TABLE public.partners ALTER COLUMN logo_white SET DEFAULT true;
UPDATE public.partners SET logo_white = true WHERE logo_white IS NULL;
-- partners: friend/partner description + socials (from site-config-content import)
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS socials jsonb DEFAULT '{}';

-- social_links
ALTER TABLE public.social_links ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- gigs (Bandsintown dedup)
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS bandsintown_id text;

-- gigs: extra fields from the site-config-content import
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS gig_type text;
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS status text DEFAULT 'confirmed';
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS sold_out boolean NOT NULL DEFAULT false;
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS supporting_artists jsonb DEFAULT '[]';
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS event_links jsonb DEFAULT '{}';
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS photo_storage_path text;
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS photo_content_hash text;

-- Normalize legacy one-L spelling to the canonical value used by the public UI.
UPDATE public.gigs SET status = 'cancelled' WHERE status = 'canceled';

CREATE UNIQUE INDEX IF NOT EXISTS gigs_bandsintown_id_unique
  ON public.gigs (bandsintown_id)
  WHERE bandsintown_id IS NOT NULL;

-- releases columns
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS cover_storage_path text;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS tracks jsonb DEFAULT '[]';
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS custom_links jsonb DEFAULT '[]';
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS itunes_id text;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS spotify_id text;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS discogs_id text;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS manually_edited boolean NOT NULL DEFAULT false;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS artists text[] DEFAULT '{}';
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS streaming_links jsonb DEFAULT '[]';
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS last_enriched_at timestamptz;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS tracks_source text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'releases_itunes_id_key'
      AND conrelid = 'public.releases'::regclass
  ) THEN
    ALTER TABLE public.releases ADD CONSTRAINT releases_itunes_id_key UNIQUE (itunes_id);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS releases_itunes_id_idx
  ON public.releases (itunes_id)
  WHERE itunes_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'releases_spotify_id_key'
      AND conrelid = 'public.releases'::regclass
  ) THEN
    ALTER TABLE public.releases ADD CONSTRAINT releases_spotify_id_key UNIQUE (spotify_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'releases_discogs_id_key'
      AND conrelid = 'public.releases'::regclass
  ) THEN
    ALTER TABLE public.releases ADD CONSTRAINT releases_discogs_id_key UNIQUE (discogs_id);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS releases_spotify_id_idx
  ON public.releases (spotify_id)
  WHERE spotify_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS releases_discogs_id_idx
  ON public.releases (discogs_id)
  WHERE discogs_id IS NOT NULL;

-- site_config: text value → jsonb, uuid id → key PK
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_config'
      AND column_name = 'value' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.site_config
      ALTER COLUMN value TYPE jsonb
      USING CASE
        WHEN value IS NULL OR trim(value) = '' THEN '{}'::jsonb
        ELSE value::jsonb
      END;
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'site_config' AND column_name = 'id'
  ) THEN
    ALTER TABLE public.site_config DROP COLUMN id;

    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'site_config_key_key'
        AND conrelid = 'public.site_config'::regclass
    ) THEN
      ALTER TABLE public.site_config DROP CONSTRAINT site_config_key_key;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'site_config_pkey'
        AND conrelid = 'public.site_config'::regclass
    ) THEN
      ALTER TABLE public.site_config ADD PRIMARY KEY (key);
    END IF;
  END IF;
END;
$$;

-- bio updated_at
ALTER TABLE public.bio ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
-- bio: achievements + collabs (displayed as lists in the Biography section)
ALTER TABLE public.bio ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]';
ALTER TABLE public.bio ADD COLUMN IF NOT EXISTS collabs jsonb DEFAULT '[]';

-- NOT NULL backfills
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='music_highlights'
      AND column_name='display_order' AND is_nullable='YES'
  ) THEN
    UPDATE public.music_highlights SET display_order = 0 WHERE display_order IS NULL;
    ALTER TABLE public.music_highlights ALTER COLUMN display_order SET NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='music_highlights'
      AND column_name='active' AND is_nullable='YES'
  ) THEN
    UPDATE public.music_highlights SET active = true WHERE active IS NULL;
    ALTER TABLE public.music_highlights ALTER COLUMN active SET NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='music_highlights'
      AND column_name='created_at' AND is_nullable='YES'
  ) THEN
    UPDATE public.music_highlights SET created_at = now() WHERE created_at IS NULL;
    ALTER TABLE public.music_highlights ALTER COLUMN created_at SET NOT NULL;
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='merchandise'
      AND column_name='display_order' AND is_nullable='YES'
  ) THEN
    UPDATE public.merchandise SET display_order = 0 WHERE display_order IS NULL;
    ALTER TABLE public.merchandise ALTER COLUMN display_order SET NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='merchandise'
      AND column_name='active' AND is_nullable='YES'
  ) THEN
    UPDATE public.merchandise SET active = true WHERE active IS NULL;
    ALTER TABLE public.merchandise ALTER COLUMN active SET NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='merchandise'
      AND column_name='created_at' AND is_nullable='YES'
  ) THEN
    UPDATE public.merchandise SET created_at = now() WHERE created_at IS NULL;
    ALTER TABLE public.merchandise ALTER COLUMN created_at SET NOT NULL;
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='soundpacks'
      AND column_name='display_order' AND is_nullable='YES'
  ) THEN
    UPDATE public.soundpacks SET display_order = 0 WHERE display_order IS NULL;
    ALTER TABLE public.soundpacks ALTER COLUMN display_order SET NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='soundpacks'
      AND column_name='active' AND is_nullable='YES'
  ) THEN
    UPDATE public.soundpacks SET active = true WHERE active IS NULL;
    ALTER TABLE public.soundpacks ALTER COLUMN active SET NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='soundpacks'
      AND column_name='created_at' AND is_nullable='YES'
  ) THEN
    UPDATE public.soundpacks SET created_at = now() WHERE created_at IS NULL;
    ALTER TABLE public.soundpacks ALTER COLUMN created_at SET NOT NULL;
  END IF;
END;
$$;


-- --- news_posts ----------------------------------------------
CREATE TABLE IF NOT EXISTS public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text NOT NULL DEFAULT '',
  link text,
  cover_storage_path text,
  cover_url text,
  published_at timestamptz DEFAULT now(),
  active boolean NOT NULL DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS news_posts_slug_idx ON public.news_posts (slug);
CREATE INDEX IF NOT EXISTS news_posts_published_idx ON public.news_posts (published_at DESC);
-- news_posts: optional external article link (from site-config-content import)
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS link text;

-- ============================================================
-- Data API grants
--
-- Supabase stops auto-granting new public-schema tables on
-- 2026-10-30. Existing tables keep current grants, but this
-- file is re-runnable (fresh projects, preview branches,
-- `supabase db reset`), so grant explicitly here too.
-- RLS policies still enforce row-level access; GRANT only
-- opens the table-level gate for the Data API roles.
-- ============================================================

-- anon: public read only
grant select on
  public.releases, public.gigs, public.gallery, public.bio,
  public.members, public.social_links, public.partners,
  public.site_config, public.music_highlights, public.merchandise,
  public.soundpacks, public.products, public.media_downloads,
  public.news_posts
to anon;

-- Anonymous telemetry writes are intentionally not exposed through the Data API.

-- authenticated + service_role: full CRUD (RLS restricts rows)
grant select, insert, update, delete on
  public.releases, public.gigs, public.gallery, public.bio,
  public.members, public.social_links, public.partners,
  public.site_config, public.music_highlights, public.merchandise,
  public.soundpacks, public.products, public.media_downloads,
  public.news_posts, public.profiles, public.sync_jobs,
  public.analytics_events
to authenticated;

grant select, insert, update, delete on
  public.releases, public.gigs, public.gallery, public.bio,
  public.members, public.social_links, public.partners,
  public.site_config, public.music_highlights, public.merchandise,
  public.soundpacks, public.products, public.media_downloads,
  public.news_posts, public.profiles, public.sync_jobs,
  public.analytics_events
to service_role;

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchandise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soundpacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sync_jobs' AND policyname='Admin all sync_jobs') THEN
    EXECUTE $p$CREATE POLICY "Admin all sync_jobs" ON public.sync_jobs USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Admin read') THEN
    EXECUTE 'CREATE POLICY "Admin read" ON public.profiles FOR SELECT USING (auth.uid() = id)';
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='releases' AND policyname='Public read releases') THEN
    EXECUTE 'CREATE POLICY "Public read releases" ON public.releases FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='releases' AND policyname='Admin all releases') THEN
    EXECUTE $p$CREATE POLICY "Admin all releases" ON public.releases USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gigs' AND policyname='Public read gigs') THEN
    EXECUTE 'CREATE POLICY "Public read gigs" ON public.gigs FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gigs' AND policyname='Admin all gigs') THEN
    EXECUTE $p$CREATE POLICY "Admin all gigs" ON public.gigs USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gallery' AND policyname='Public read gallery') THEN
    EXECUTE 'CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gallery' AND policyname='Admin all gallery') THEN
    EXECUTE $p$CREATE POLICY "Admin all gallery" ON public.gallery USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='bio' AND policyname='Public read bio') THEN
    EXECUTE 'CREATE POLICY "Public read bio" ON public.bio FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='bio' AND policyname='Admin all bio') THEN
    EXECUTE $p$CREATE POLICY "Admin all bio" ON public.bio USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_links' AND policyname='Public read social') THEN
    EXECUTE 'CREATE POLICY "Public read social" ON public.social_links FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_links' AND policyname='Admin all social') THEN
    EXECUTE $p$CREATE POLICY "Admin all social" ON public.social_links USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='partners' AND policyname='Public read partners') THEN
    EXECUTE 'CREATE POLICY "Public read partners" ON public.partners FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='partners' AND policyname='Admin all partners') THEN
    EXECUTE $p$CREATE POLICY "Admin all partners" ON public.partners USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='music_highlights' AND policyname='Public read music_highlights') THEN
    EXECUTE 'CREATE POLICY "Public read music_highlights" ON public.music_highlights FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='music_highlights' AND policyname='Admin all music_highlights') THEN
    EXECUTE $p$CREATE POLICY "Admin all music_highlights" ON public.music_highlights USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='merchandise' AND policyname='Public read merchandise') THEN
    EXECUTE 'CREATE POLICY "Public read merchandise" ON public.merchandise FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='merchandise' AND policyname='Admin all merchandise') THEN
    EXECUTE $p$CREATE POLICY "Admin all merchandise" ON public.merchandise USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='soundpacks' AND policyname='Public read soundpacks') THEN
    EXECUTE 'CREATE POLICY "Public read soundpacks" ON public.soundpacks FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='soundpacks' AND policyname='Admin all soundpacks') THEN
    EXECUTE $p$CREATE POLICY "Admin all soundpacks" ON public.soundpacks USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Public read products') THEN
    EXECUTE 'CREATE POLICY "Public read products" ON public.products FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='products' AND policyname='Admin all products') THEN
    EXECUTE $p$CREATE POLICY "Admin all products" ON public.products USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_downloads' AND policyname='Public read media_downloads') THEN
    EXECUTE 'CREATE POLICY "Public read media_downloads" ON public.media_downloads FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_downloads' AND policyname='Admin all media_downloads') THEN
    EXECUTE $p$CREATE POLICY "Admin all media_downloads" ON public.media_downloads USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_config' AND policyname='Public read config') THEN
    EXECUTE 'CREATE POLICY "Public read config" ON public.site_config FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_config' AND policyname='Admin all config') THEN
    EXECUTE $p$CREATE POLICY "Admin all config" ON public.site_config USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='api_secrets' AND policyname='Admin read api_secrets') THEN
    EXECUTE $p$CREATE POLICY "Admin read api_secrets" ON public.api_secrets FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='api_secrets' AND policyname='Admin insert api_secrets') THEN
    EXECUTE $p$CREATE POLICY "Admin insert api_secrets" ON public.api_secrets FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='api_secrets' AND policyname='Admin update api_secrets') THEN
    EXECUTE $p$CREATE POLICY "Admin update api_secrets" ON public.api_secrets FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='api_secrets' AND policyname='Admin delete api_secrets') THEN
    EXECUTE $p$CREATE POLICY "Admin delete api_secrets" ON public.api_secrets FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='members' AND policyname='Public read members') THEN
    EXECUTE 'CREATE POLICY "Public read members" ON public.members FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='members' AND policyname='Admin all members') THEN
    EXECUTE $p$CREATE POLICY "Admin all members" ON public.members USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

-- The /api/analytics endpoint enforces signed consent and inserts via service role.
-- Remove the previous bypassable anonymous Data API INSERT policy.
DROP POLICY IF EXISTS "anon insert analytics" ON public.analytics_events;

-- ============================================================
-- Auth trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- Default site_config seeds (idempotent)
-- ============================================================
INSERT INTO public.site_config (key, value) VALUES
  ('hero',        '{"headline":"NEUROKLAST","tagline":"Industrial / Electronic","ctaLabel":"INITIALIZE","ctaUrl":"#news","logoUrl":"/brand/neuroklast-wordmark.svg","bootSequenceEnabled":true}'::jsonb),
  ('merchandise', '{"footerText":""}'::jsonb),
  ('footer',      '{"legalNoticeUrl":"/legal-notice","privacyPolicyUrl":"/privacy-policy"}'::jsonb),
  ('legal',       '{"operatorName":"","street":"","zipCity":"","country":"Germany","email":""}'::jsonb),
  ('background',  '{"type":"matrix"}'::jsonb),
  ('appearance',  '{"crtEnabled":true,"scanlineEnabled":true,"noiseEnabled":true,"noiseIntensity":0.15,"glitchEnabled":true,"accentColor":"#dc2626","accentColorSecondary":"#7c3aed","vignetteOpacity":0.5,"chromaticStrength":0.4}'::jsonb),
  ('sections',    '[{"id":"hero","label":"Hero","visible":true,"order":0},{"id":"news","label":"News","visible":true,"order":1},{"id":"bio","label":"Biography","visible":true,"order":2},{"id":"gallery","label":"Gallery","visible":true,"order":3},{"id":"gigs","label":"Events","visible":true,"order":4},{"id":"releases","label":"Discography","visible":true,"order":5},{"id":"media","label":"Media","visible":true,"order":6},{"id":"social","label":"Connect","visible":true,"order":7},{"id":"credits","label":"Credits & Partners","visible":true,"order":8},{"id":"contact","label":"Contact","visible":true,"order":9},{"id":"music-highlights","label":"Music Highlights","visible":true,"order":10},{"id":"merchandise","label":"Merchandise","visible":true,"order":11},{"id":"soundpacks","label":"Soundpacks","visible":true,"order":12},{"id":"products","label":"Products","visible":false,"order":13}]'::jsonb),
  ('social',      '{"spotify":"","instagram":"","facebook":"","youtube":"","soundcloud":"","tiktok":""}'::jsonb),
  ('analytics',   '{"enabled":false,"trackPageViews":false,"trackEvents":false}'::jsonb),
  ('translations', '{}'::jsonb),
  ('catalogue_sync', '{"artistName":"Neuroklast","itunesArtistId":"","spotifyArtistId":"","discogsArtistId":""}'::jsonb),
  ('loadingScreen', '{"enabled":true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='news_posts' AND policyname='Public read news') THEN
    EXECUTE 'CREATE POLICY "Public read news" ON public.news_posts FOR SELECT USING (active = true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='news_posts' AND policyname='Admin all news') THEN
    EXECUTE $p$CREATE POLICY "Admin all news" ON public.news_posts USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )$p$;
  END IF;
END; $$;

-- ============================================================
-- Media content hashes (idempotent) — used by R2 reconcile + 404 self-heal
-- ============================================================
-- Content-addressed object keys are `${prefix}/<sha256>.${ext}`. The reconcile
-- backfills `content_hash` from the storage path's filename so DB queries and the
-- runtime self-heal could match a stale reference to the live object without
-- relying only on filename/prefix heuristics.
ALTER TABLE public.releases          ADD COLUMN IF NOT EXISTS cover_content_hash text;
ALTER TABLE public.gallery           ADD COLUMN IF NOT EXISTS content_hash text;
ALTER TABLE public.social_links      ADD COLUMN IF NOT EXISTS logo_content_hash text;
ALTER TABLE public.partners          ADD COLUMN IF NOT EXISTS logo_content_hash text;
ALTER TABLE public.merchandise       ADD COLUMN IF NOT EXISTS image_content_hash text;
ALTER TABLE public.soundpacks        ADD COLUMN IF NOT EXISTS image_content_hash text;
ALTER TABLE public.products          ADD COLUMN IF NOT EXISTS image_content_hash text;
-- Plugin catalogue fields. Free products need no license; paid products use Stripe.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'other';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS system_requirements jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS media jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS default_channel text NOT NULL DEFAULT 'stable';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS demo_downloads_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sales_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pricing_mode text NOT NULL DEFAULT 'paid';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS license_required boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS license_format text NOT NULL DEFAULT 'v3';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_kind_check') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_kind_check CHECK (kind IN ('plugin', 'other'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_pricing_mode_check') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_pricing_mode_check CHECK (pricing_mode IN ('paid', 'free'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_license_format_check') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_license_format_check CHECK (license_format IN ('v2', 'v3'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_default_channel_check') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_default_channel_check CHECK (default_channel IN ('stable', 'beta', 'alpha'));
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products (slug) WHERE slug IS NOT NULL;
ALTER TABLE public.media_downloads   ADD COLUMN IF NOT EXISTS file_content_hash text;
ALTER TABLE public.news_posts        ADD COLUMN IF NOT EXISTS cover_content_hash text;

-- ============================================================
-- Rate limiting (Supabase-backed distributed limiter, no Redis)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  reset_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_limits_reset_at_idx
  ON public.rate_limits (reset_at);

-- No policies: the public anon key must not read or wipe counters.
-- consume_rate_limit is SECURITY DEFINER, so the app limiter still works.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated;

-- Atomic fixed-window counter. SECURITY DEFINER + service-role only; the
-- anon/authenticated roles cannot invoke it (they could otherwise hammer it).
-- Keys are already hashed IPs (SHA-256 + RATE_LIMIT_SALT) — never raw IPs.
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_reset_at timestamptz;
  v_count integer;
BEGIN
  IF p_limit <= 0 OR p_window_seconds <= 0 THEN
    RETURN jsonb_build_object('count', 0, 'reset_at', 0);
  END IF;

  INSERT INTO public.rate_limits (key, count, reset_at)
  VALUES (p_key, 1, v_now + make_interval(secs => p_window_seconds))
  ON CONFLICT (key) DO NOTHING
  RETURNING count, reset_at INTO v_count, v_reset_at;

  IF NOT FOUND THEN
    UPDATE public.rate_limits SET
      count = CASE
        WHEN reset_at <= v_now THEN 1
        ELSE count + 1
      END,
      reset_at = CASE
        WHEN reset_at <= v_now THEN v_now + make_interval(secs => p_window_seconds)
        ELSE reset_at
      END
    WHERE key = p_key
    RETURNING count, reset_at INTO v_count, v_reset_at;

    -- A sweep from another new key can delete this expired row before the update.
    IF NOT FOUND THEN
      INSERT INTO public.rate_limits (key, count, reset_at)
      VALUES (p_key, 1, v_now + make_interval(secs => p_window_seconds))
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN public.rate_limits.reset_at <= v_now THEN 1
          ELSE public.rate_limits.count + 1
        END,
        reset_at = CASE
          WHEN public.rate_limits.reset_at <= v_now THEN v_now + make_interval(secs => p_window_seconds)
          ELSE public.rate_limits.reset_at
        END
      RETURNING count, reset_at INTO v_count, v_reset_at;
    END IF;
  ELSE
    -- Sweep expired keys only when a new key appears, not on every hit.
    DELETE FROM public.rate_limits WHERE reset_at <= v_now AND key <> p_key;
  END IF;

  RETURN jsonb_build_object(
    'count', v_count,
    'reset_at', (extract(epoch FROM v_reset_at) * 1000)::bigint
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer)
  TO service_role, postgres;

-- Claim a sync tick without replacing the rest of the payload.
CREATE OR REPLACE FUNCTION public.claim_sync_job_tick(p_id uuid, p_stale_before bigint)
RETURNS public.sync_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.sync_jobs;
BEGIN
  UPDATE public.sync_jobs
  SET
    payload = jsonb_set(
      jsonb_set(COALESCE(payload, '{}'::jsonb), '{processing}', 'true'::jsonb, true),
      '{processingSince}',
      to_jsonb((extract(epoch FROM clock_timestamp()) * 1000)::bigint),
      true
    ),
    updated_at = now()
  WHERE id = p_id
    AND status IN ('pending', 'running')
    AND (
      payload->>'processing' IS NULL
      OR payload->>'processing' = 'false'
      OR COALESCE(NULLIF(payload->>'processingSince', '')::bigint, 0) < p_stale_before
    )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_sync_job_tick(uuid, bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_sync_job_tick(uuid, bigint) TO service_role, postgres;

-- Compare JSON in Postgres. A PostgREST eq filter stringifies objects as "[object Object]".
CREATE OR REPLACE FUNCTION public.claim_site_config_run(
  p_key text,
  p_previous jsonb,
  p_next jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF p_previous IS NULL THEN
    INSERT INTO public.site_config (key, value, updated_at)
    VALUES (p_key, p_next, now())
    ON CONFLICT (key) DO NOTHING;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count > 0;
  END IF;

  UPDATE public.site_config
  SET value = p_next, updated_at = now()
  WHERE key = p_key AND value = p_previous;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_site_config_run(text, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_site_config_run(text, jsonb, jsonb) TO service_role, postgres;

-- ============================================================
-- Plugin catalogue (service_role only; public RPC for downloads)
-- Legacy neurokore_* tables are renamed in place so existing data,
-- licences and orders survive. No destructive migration.
-- ============================================================
DO $$
BEGIN
  IF to_regclass('public.neurokore_licenses') IS NOT NULL AND to_regclass('public.plugin_licenses') IS NULL THEN
    ALTER TABLE public.neurokore_licenses RENAME TO plugin_licenses;
  END IF;
  IF to_regclass('public.neurokore_devices') IS NOT NULL AND to_regclass('public.plugin_devices') IS NULL THEN
    ALTER TABLE public.neurokore_devices RENAME TO plugin_devices;
  END IF;
  IF to_regclass('public.neurokore_orders') IS NOT NULL AND to_regclass('public.plugin_orders') IS NULL THEN
    ALTER TABLE public.neurokore_orders RENAME TO plugin_orders;
  END IF;
  IF to_regclass('public.neurokore_releases') IS NOT NULL AND to_regclass('public.plugin_releases') IS NULL THEN
    ALTER TABLE public.neurokore_releases RENAME TO plugin_releases;
  END IF;
  IF to_regclass('public.neurokore_release_artifacts') IS NOT NULL AND to_regclass('public.plugin_release_artifacts') IS NULL THEN
    ALTER TABLE public.neurokore_release_artifacts RENAME TO plugin_release_artifacts;
  END IF;
  IF to_regclass('public.neurokore_download_events') IS NOT NULL AND to_regclass('public.plugin_download_events') IS NULL THEN
    ALTER TABLE public.neurokore_download_events RENAME TO plugin_download_events;
  END IF;
  IF to_regclass('public.neurokore_admin_audit') IS NOT NULL AND to_regclass('public.plugin_admin_audit') IS NULL THEN
    ALTER TABLE public.neurokore_admin_audit RENAME TO plugin_admin_audit;
  END IF;
END $$;

-- Canonical NEUROKORE product. Existing cards without a slug adopt it.
UPDATE public.products SET slug = 'neurokore', kind = 'plugin'
  WHERE slug IS NULL AND upper(title) = 'NEUROKORE';
INSERT INTO public.products (title, slug, kind, short_description, active, pricing_mode, license_required, license_format)
SELECT 'NEUROKORE', 'neurokore', 'plugin', 'Modular distortion and sound design plugin.', false, 'paid', true, 'v2'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'neurokore');
-- NEUROKORE keeps the v2 document format its shipped plugin verifies.
UPDATE public.products SET kind = 'plugin', pricing_mode = 'paid', license_required = true, license_format = 'v2'
  WHERE slug = 'neurokore';

CREATE TABLE IF NOT EXISTS public.plugin_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  email text NOT NULL CHECK (email = lower(email)),
  key_hash text NOT NULL UNIQUE,
  key_cipher text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('alpha', 'full')),
  license_format text NOT NULL DEFAULT 'v3' CHECK (license_format IN ('v2', 'v3')),
  max_devices integer NOT NULL DEFAULT 2 CHECK (max_devices BETWEEN 1 AND 5),
  expires_at timestamptz,
  revoked_at timestamptz,
  stripe_session text UNIQUE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plugin_devices (
  license_id uuid NOT NULL REFERENCES public.plugin_licenses(id) ON DELETE CASCADE,
  device text NOT NULL CHECK (device ~ '^v2:[a-f0-9]{64}$'),
  activated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (license_id, device)
);

CREATE TABLE IF NOT EXISTS public.plugin_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  email text NOT NULL,
  price_id text NOT NULL,
  stripe_session text UNIQUE,
  payment_intent text UNIQUE,
  license_id uuid REFERENCES public.plugin_licenses(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Contract confirmation is sent on a durable medium after Stripe fulfilment.
ALTER TABLE public.plugin_orders ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS public.plugin_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  version text NOT NULL CHECK (version ~ '^[0-9]+\.[0-9]+\.[0-9]+([-.][0-9A-Za-z.-]+)?$'),
  channel text NOT NULL DEFAULT 'stable' CHECK (channel IN ('stable', 'beta', 'alpha')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'published', 'withdrawn')),
  title text,
  changelog text,
  release_notes text,
  git_commit_sha text CHECK (git_commit_sha IS NULL OR git_commit_sha ~ '^[a-f0-9]{7,64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz,
  published_at timestamptz,
  published_by uuid REFERENCES auth.users(id),
  withdrawn_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.plugin_release_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NOT NULL REFERENCES public.plugin_releases(id) ON DELETE RESTRICT,
  platform text NOT NULL CHECK (platform IN ('windows-x64', 'macos-arm64', 'macos-x64', 'linux-x64')),
  architecture text NOT NULL CHECK (architecture IN ('x64', 'arm64')),
  package_type text NOT NULL CHECK (package_type IN ('installer', 'vst3', 'au', 'standalone', 'bundle')),
  filename text NOT NULL CHECK (length(filename) BETWEEN 1 AND 255 AND position('/' in filename) = 0),
  storage_key text NOT NULL CHECK (storage_key LIKE 'releases/%' AND position('..' in storage_key) = 0),
  filesize_bytes bigint NOT NULL CHECK (filesize_bytes > 0),
  sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  signing_status text NOT NULL DEFAULT 'unsigned' CHECK (signing_status IN ('unsigned', 'signed', 'notarized')),
  validation_status text NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (release_id, platform, package_type)
);

-- Anonymous download statistics: no account, licence or buyer reference.
CREATE TABLE IF NOT EXISTS public.plugin_download_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  release_id uuid NOT NULL REFERENCES public.plugin_releases(id) ON DELETE RESTRICT,
  artifact_id uuid REFERENCES public.plugin_release_artifacts(id) ON DELETE SET NULL,
  platform text NOT NULL,
  channel text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Administrative mutations: who changed which record. No secrets, keys or hashes.
CREATE TABLE IF NOT EXISTS public.plugin_admin_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  actor uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Service-role-only product secrets. Kept out of public.products so the
-- Data API can never expose signing material or Stripe price IDs.
CREATE TABLE IF NOT EXISTS public.plugin_product_secrets (
  product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  stripe_price_id text,
  signing_key_cipher text,
  signing_public_key_hex text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Backfill product ownership on pre-existing NEUROKORE rows.
DO $$
DECLARE
  nk uuid;
BEGIN
  SELECT id INTO nk FROM public.products WHERE slug = 'neurokore';

  ALTER TABLE public.plugin_licenses ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id);
  ALTER TABLE public.plugin_licenses ADD COLUMN IF NOT EXISTS license_format text DEFAULT 'v3';
  UPDATE public.plugin_licenses SET product_id = nk WHERE product_id IS NULL;
  ALTER TABLE public.plugin_licenses ALTER COLUMN product_id SET NOT NULL;
  UPDATE public.plugin_licenses SET license_format = 'v2' WHERE product_id = nk AND license_format = 'v3';

  ALTER TABLE public.plugin_orders ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id);
  UPDATE public.plugin_orders SET product_id = nk WHERE product_id IS NULL;
  ALTER TABLE public.plugin_orders ALTER COLUMN product_id SET NOT NULL;

  ALTER TABLE public.plugin_releases ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id);
  UPDATE public.plugin_releases SET product_id = nk WHERE product_id IS NULL;
  ALTER TABLE public.plugin_releases ALTER COLUMN product_id SET NOT NULL;

  ALTER TABLE public.plugin_download_events ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id);
  UPDATE public.plugin_download_events e SET product_id = r.product_id
    FROM public.plugin_releases r WHERE e.release_id = r.id AND e.product_id IS NULL;
  ALTER TABLE public.plugin_download_events ALTER COLUMN product_id SET NOT NULL;

  ALTER TABLE public.plugin_admin_audit ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id);
END $$;

-- Migrated audit tables got this FK without ON DELETE SET NULL. Recreate it
-- so deleting a product detaches the audit history instead of failing.
DO $$
DECLARE c_name text;
BEGIN
  FOR c_name IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.plugin_admin_audit'::regclass
      AND contype = 'f'
      AND conkey = ARRAY[(SELECT attnum FROM pg_attribute
                          WHERE attrelid = 'public.plugin_admin_audit'::regclass
                            AND attname = 'product_id')]
  LOOP
    EXECUTE format('ALTER TABLE public.plugin_admin_audit DROP CONSTRAINT %I', c_name);
  END LOOP;
  ALTER TABLE public.plugin_admin_audit
    ADD CONSTRAINT plugin_admin_audit_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
END $$;

-- One release per product/version/channel (replaces the old global unique).
ALTER TABLE public.plugin_releases DROP CONSTRAINT IF EXISTS neurokore_releases_version_channel_key;
ALTER TABLE public.plugin_releases DROP CONSTRAINT IF EXISTS plugin_releases_version_channel_key;
CREATE UNIQUE INDEX IF NOT EXISTS plugin_releases_product_version_channel_key
  ON public.plugin_releases (product_id, version, channel);

CREATE INDEX IF NOT EXISTS plugin_licenses_email_idx ON public.plugin_licenses (email);
CREATE INDEX IF NOT EXISTS plugin_licenses_product_idx ON public.plugin_licenses (product_id);
CREATE INDEX IF NOT EXISTS plugin_orders_product_idx ON public.plugin_orders (product_id);
CREATE INDEX IF NOT EXISTS plugin_releases_published_idx
  ON public.plugin_releases (product_id, channel, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS plugin_release_artifacts_release_idx
  ON public.plugin_release_artifacts (release_id);
CREATE INDEX IF NOT EXISTS plugin_download_events_created_idx
  ON public.plugin_download_events (created_at DESC);
CREATE INDEX IF NOT EXISTS plugin_admin_audit_created_idx
  ON public.plugin_admin_audit (created_at DESC);

ALTER TABLE public.plugin_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_release_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_download_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_admin_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_product_secrets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.plugin_licenses, public.plugin_devices, public.plugin_orders,
  public.plugin_releases, public.plugin_release_artifacts, public.plugin_download_events,
  public.plugin_admin_audit, public.plugin_product_secrets FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.plugin_licenses, public.plugin_devices, public.plugin_orders,
  public.plugin_releases, public.plugin_release_artifacts, public.plugin_download_events,
  public.plugin_admin_audit, public.plugin_product_secrets TO service_role;
DO $$
BEGIN
  IF to_regclass('public.plugin_download_events_id_seq') IS NOT NULL THEN
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.plugin_download_events_id_seq TO service_role';
  ELSIF to_regclass('public.neurokore_download_events_id_seq') IS NOT NULL THEN
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.neurokore_download_events_id_seq TO service_role';
  END IF;
  IF to_regclass('public.plugin_admin_audit_id_seq') IS NOT NULL THEN
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.plugin_admin_audit_id_seq TO service_role';
  ELSIF to_regclass('public.neurokore_admin_audit_id_seq') IS NOT NULL THEN
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.neurokore_admin_audit_id_seq TO service_role';
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.neurokore_activate(text, text);
DROP FUNCTION IF EXISTS public.neurokore_fulfill(uuid, text, text, text, text);
DROP FUNCTION IF EXISTS public.neurokore_publish_release(uuid, uuid);
DROP FUNCTION IF EXISTS public.neurokore_withdraw_release(uuid);
DROP FUNCTION IF EXISTS public.neurokore_public_releases();

CREATE OR REPLACE FUNCTION public.plugin_activate(p_key_hash text, p_device text, p_product_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  p public.products;
  l public.plugin_licenses;
BEGIN
  SELECT * INTO p FROM public.products WHERE slug = p_product_slug AND kind = 'plugin';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product unavailable';
  END IF;
  SELECT * INTO l FROM public.plugin_licenses
    WHERE key_hash = p_key_hash AND product_id = p.id FOR UPDATE;
  IF NOT FOUND OR l.revoked_at IS NOT NULL OR (l.expires_at IS NOT NULL AND l.expires_at <= now()) THEN
    RAISE EXCEPTION 'License unavailable';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.plugin_devices WHERE license_id = l.id AND device = p_device) THEN
    IF (SELECT count(*) FROM public.plugin_devices WHERE license_id = l.id) >= l.max_devices THEN
      RAISE EXCEPTION 'Device limit reached';
    END IF;
    INSERT INTO public.plugin_devices (license_id, device) VALUES (l.id, p_device);
  END IF;
  RETURN jsonb_build_object(
    'id', l.id, 'email', l.email, 'tier', l.tier, 'expires_at', l.expires_at,
    'license_format', l.license_format, 'product_slug', p.slug);
END;
$$;

CREATE OR REPLACE FUNCTION public.plugin_fulfill(p_order uuid, p_session text, p_intent text, p_key_hash text, p_key_cipher text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  o public.plugin_orders;
  p public.products;
  result uuid;
BEGIN
  SELECT * INTO o FROM public.plugin_orders WHERE id = p_order FOR UPDATE;
  IF NOT FOUND OR o.stripe_session IS DISTINCT FROM p_session THEN
    RAISE EXCEPTION 'Order mismatch';
  END IF;
  IF o.license_id IS NOT NULL THEN
    RETURN o.license_id;
  END IF;
  SELECT * INTO p FROM public.products WHERE id = o.product_id;
  INSERT INTO public.plugin_licenses (product_id, email, key_hash, key_cipher, tier, license_format, stripe_session)
  VALUES (o.product_id, o.email, p_key_hash, p_key_cipher, 'full', p.license_format, p_session)
  RETURNING id INTO result;
  UPDATE public.plugin_orders SET license_id = result, payment_intent = p_intent WHERE id = p_order;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.plugin_publish_release(p_release uuid, p_admin uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  r public.plugin_releases;
  total integer;
  ready integer;
BEGIN
  SELECT * INTO r FROM public.plugin_releases WHERE id = p_release FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Release not found';
  END IF;
  IF r.status NOT IN ('draft', 'validated', 'withdrawn') THEN
    RAISE EXCEPTION 'Release cannot be published from its current state';
  END IF;
  SELECT count(*) INTO total FROM public.plugin_release_artifacts WHERE release_id = r.id;
  SELECT count(*) INTO ready FROM public.plugin_release_artifacts
    WHERE release_id = r.id AND validation_status = 'validated';
  IF total = 0 OR ready <> total THEN
    RAISE EXCEPTION 'Release artifacts are incomplete or unvalidated';
  END IF;
  UPDATE public.plugin_releases
    SET status = 'published', published_at = now(), published_by = p_admin,
        withdrawn_at = NULL, validated_at = COALESCE(validated_at, now())
    WHERE id = r.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.plugin_withdraw_release(p_release uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.plugin_releases
    SET status = 'withdrawn', withdrawn_at = now()
    WHERE id = p_release AND status = 'published';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Release is not published';
  END IF;
END;
$$;

-- Deletes a product that has no licences or orders. Releases, artifacts and
-- download counters go with it; R2 objects are removed by the admin API.
CREATE OR REPLACE FUNCTION public.plugin_delete_product(p_product uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  is_public boolean;
BEGIN
  SELECT active INTO is_public FROM public.products WHERE id = p_product;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  IF COALESCE(is_public, false) THEN
    RAISE EXCEPTION 'Hide the product before deleting it';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.plugin_orders
    WHERE product_id = p_product AND license_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Product has paid orders';
  END IF;

  DELETE FROM public.plugin_download_events WHERE product_id = p_product;
  DELETE FROM public.plugin_release_artifacts
    WHERE release_id IN (SELECT id FROM public.plugin_releases WHERE product_id = p_product);
  DELETE FROM public.plugin_releases WHERE product_id = p_product;
  DELETE FROM public.plugin_devices
    WHERE license_id IN (SELECT id FROM public.plugin_licenses WHERE product_id = p_product);
  DELETE FROM public.plugin_licenses WHERE product_id = p_product;
  DELETE FROM public.plugin_orders WHERE product_id = p_product;
  DELETE FROM public.plugin_product_secrets WHERE product_id = p_product;
  DELETE FROM public.plugin_admin_audit WHERE product_id = p_product;
  DELETE FROM public.products WHERE id = p_product;
END;
$$;

-- Public catalogue: product page fields plus published release metadata and
-- artifact checksums. storage_key, price IDs and signing material never leave.
CREATE OR REPLACE FUNCTION public.plugin_public_catalog()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', p.id,
    'slug', p.slug,
    'title', p.title,
    'short_description', p.short_description,
    'description', p.description,
    'features', p.features,
    'system_requirements', p.system_requirements,
    'media', p.media,
    'pricing_mode', p.pricing_mode,
    'sales_enabled', p.sales_enabled,
    'demo_downloads_enabled', p.demo_downloads_enabled,
    'license_required', p.license_required,
    'default_channel', p.default_channel,
    'display_order', p.display_order,
    'releases', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', r.id,
        'version', r.version,
        'channel', r.channel,
        'title', r.title,
        'changelog', r.changelog,
        'release_notes', r.release_notes,
        'published_at', r.published_at,
        'artifacts', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'platform', a.platform,
            'architecture', a.architecture,
            'package_type', a.package_type,
            'filename', a.filename,
            'filesize_bytes', a.filesize_bytes,
            'sha256', a.sha256,
            'signing_status', a.signing_status
          ) ORDER BY a.platform, a.package_type)
          FROM public.plugin_release_artifacts a
          WHERE a.release_id = r.id AND a.validation_status = 'validated'
        ), '[]'::jsonb)
      ) ORDER BY r.published_at DESC)
      FROM public.plugin_releases r
      WHERE r.product_id = p.id AND r.status = 'published' AND r.withdrawn_at IS NULL
    ), '[]'::jsonb)
  ) ORDER BY p.display_order, p.title), '[]'::jsonb)
  FROM public.products p
  WHERE p.active = true AND p.kind = 'plugin' AND p.slug IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.plugin_activate(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.plugin_fulfill(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.plugin_publish_release(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.plugin_withdraw_release(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.plugin_delete_product(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.plugin_public_catalog() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.plugin_activate(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.plugin_fulfill(uuid, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.plugin_publish_release(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.plugin_withdraw_release(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.plugin_delete_product(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.plugin_public_catalog() TO anon, authenticated, service_role;

-- ============================================================
-- Data API table grants (idempotent)
-- From 2026-10-30 Supabase no longer auto-grants new public tables to
-- anon / authenticated / service_role. RLS still filters rows.
-- Keep rate_limits and plugin_* service_role-only (already REVOKEd).
-- ============================================================
GRANT SELECT ON TABLE
  public.releases,
  public.gigs,
  public.gallery,
  public.bio,
  public.members,
  public.social_links,
  public.partners,
  public.site_config,
  public.music_highlights,
  public.merchandise,
  public.soundpacks,
  public.products,
  public.media_downloads,
  public.news_posts
TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.profiles,
  public.releases,
  public.gigs,
  public.gallery,
  public.bio,
  public.members,
  public.social_links,
  public.partners,
  public.site_config,
  public.api_secrets,
  public.music_highlights,
  public.merchandise,
  public.soundpacks,
  public.products,
  public.media_downloads,
  public.sync_jobs,
  public.analytics_events,
  public.news_posts
TO authenticated, service_role;

-- Defense in depth: even older Supabase projects may have broad default grants.
-- Anon and authenticated clients must never insert telemetry directly.
REVOKE INSERT ON TABLE public.analytics_events FROM PUBLIC, anon, authenticated;

-- Electronically submitted withdrawal declarations are business records, not
-- anonymous analytics. Only the server's service-role credential may access them.
CREATE TABLE IF NOT EXISTS public.plugin_withdrawal_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) BETWEEN 2 AND 160),
  email text NOT NULL,
  contract_details text NOT NULL CHECK (length(contract_details) BETWEEN 3 AND 500),
  locale text NOT NULL DEFAULT 'en' CHECK (locale IN ('en','de','uk','it','es','pt','ja','ko')),
  received_at timestamptz NOT NULL DEFAULT now(),
  customer_receipt_at timestamptz,
  provider_notice_at timestamptz
);
CREATE INDEX IF NOT EXISTS plugin_withdrawal_receipts_pending_idx
  ON public.plugin_withdrawal_notices (received_at)
  WHERE customer_receipt_at IS NULL OR provider_notice_at IS NULL;
ALTER TABLE public.plugin_withdrawal_notices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.plugin_withdrawal_notices FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.plugin_withdrawal_notices TO service_role;


-- Betroffenenanfragen: track request status, not copies of sensitive exports.
-- Apply the canonical schema before using /admin/privacy.
CREATE TABLE IF NOT EXISTS public.privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  request_type text NOT NULL DEFAULT 'access' CHECK (request_type IN ('access', 'erasure', 'rectification', 'portability', 'objection')),
  status text NOT NULL DEFAULT 'exported' CHECK (status IN ('open', 'exported', 'answered')),
  identity_verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  exported_at timestamptz,
  responded_at timestamptz,
  completed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS privacy_requests_created_at_idx ON public.privacy_requests (created_at DESC);
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.privacy_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.privacy_requests TO service_role;

-- Preserve the precise text shown during checkout for the contractual record.
ALTER TABLE public.plugin_orders ADD COLUMN IF NOT EXISTS terms_snapshot text;
ALTER TABLE public.plugin_orders ADD COLUMN IF NOT EXISTS licence_snapshot text;
ALTER TABLE public.plugin_orders ADD COLUMN IF NOT EXISTS terms_version text;

-- NEUROKORE closed beta diagnostics. No free-text fields and no user/device IDs.
-- POST is allowed only through the Vercel server using service_role.
CREATE TABLE IF NOT EXISTS public.neurokore_beta_diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  schema_version integer NOT NULL DEFAULT 1 CHECK (schema_version = 1),
  plugin_version text NOT NULL CHECK (length(plugin_version) <= 24),
  event_code text NOT NULL CHECK (event_code IN ('session-start','js-error','promise-rejection','manual-test','native-timeout')),
  os_family text NOT NULL CHECK (os_family IN ('windows11','windows','macos','linux','other')),
  host_family text NOT NULL CHECK (host_family IN ('fl-studio','ableton','reaper','bitwig','cubase','studio-one','logic','pro-tools','reason','garageband','other')),
  plugin_format text NOT NULL CHECK (plugin_format IN ('vst3','au','standalone','other')),
  cpu_cores_bucket smallint NOT NULL CHECK (cpu_cores_bucket IN (2,4,8,16,32)),
  memory_gb_bucket smallint NOT NULL CHECK (memory_gb_bucket IN (8,16,32,64)),
  sample_rate integer NOT NULL CHECK (sample_rate IN (0,44100,48000,88200,96000,192000)),
  buffer_size integer NOT NULL CHECK (buffer_size BETWEEN 0 AND 8192),
  bundle text CHECK (bundle IS NULL OR bundle ~ '^[a-zA-Z0-9_-]{1,70}\\.js$'),
  line_number integer CHECK (line_number IS NULL OR line_number BETWEEN 1 AND 100000)
);
CREATE INDEX IF NOT EXISTS neurokore_beta_diagnostics_created_idx
  ON public.neurokore_beta_diagnostics (created_at DESC);
CREATE INDEX IF NOT EXISTS neurokore_beta_diagnostics_code_idx
  ON public.neurokore_beta_diagnostics (event_code, created_at DESC);
ALTER TABLE public.neurokore_beta_diagnostics ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.neurokore_beta_diagnostics FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.neurokore_beta_diagnostics TO service_role;
