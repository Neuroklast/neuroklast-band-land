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

-- anon: consent-gated telemetry insert (policy: anon insert analytics)
grant insert on public.analytics_events to anon;

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

-- Consent-gated public analytics INSERT (App Router /api/analytics). Read and
-- mutate remain admin-only; anon may only append an event.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='analytics_events' AND policyname='anon insert analytics') THEN
    EXECUTE 'CREATE POLICY "anon insert analytics" ON public.analytics_events FOR INSERT TO anon WITH CHECK (true)';
  END IF;
END; $$;

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
-- NEUROKORE licensing (service_role only; plugin activate RPC)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.neurokore_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (email = lower(email)),
  key_hash text NOT NULL UNIQUE,
  key_cipher text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('alpha', 'full')),
  max_devices integer NOT NULL DEFAULT 2 CHECK (max_devices BETWEEN 1 AND 5),
  expires_at timestamptz,
  revoked_at timestamptz,
  stripe_session text UNIQUE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS neurokore_licenses_email_idx
  ON public.neurokore_licenses (email);

CREATE TABLE IF NOT EXISTS public.neurokore_devices (
  license_id uuid NOT NULL REFERENCES public.neurokore_licenses(id) ON DELETE CASCADE,
  device text NOT NULL CHECK (device ~ '^v2:[a-f0-9]{64}$'),
  activated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (license_id, device)
);

CREATE TABLE IF NOT EXISTS public.neurokore_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  email text NOT NULL,
  price_id text NOT NULL,
  stripe_session text UNIQUE,
  payment_intent text UNIQUE,
  license_id uuid REFERENCES public.neurokore_licenses(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.neurokore_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neurokore_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neurokore_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.neurokore_licenses, public.neurokore_devices, public.neurokore_orders
  FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.neurokore_licenses, public.neurokore_devices, public.neurokore_orders
  TO service_role;

CREATE OR REPLACE FUNCTION public.neurokore_activate(p_key_hash text, p_device text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  l public.neurokore_licenses;
BEGIN
  SELECT * INTO l FROM public.neurokore_licenses WHERE key_hash = p_key_hash FOR UPDATE;
  IF NOT FOUND OR l.revoked_at IS NOT NULL OR (l.expires_at IS NOT NULL AND l.expires_at <= now()) THEN
    RAISE EXCEPTION 'License unavailable';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.neurokore_devices WHERE license_id = l.id AND device = p_device) THEN
    IF (SELECT count(*) FROM public.neurokore_devices WHERE license_id = l.id) >= l.max_devices THEN
      RAISE EXCEPTION 'Device limit reached';
    END IF;
    INSERT INTO public.neurokore_devices (license_id, device) VALUES (l.id, p_device);
  END IF;
  RETURN jsonb_build_object('id', l.id, 'email', l.email, 'tier', l.tier, 'expires_at', l.expires_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.neurokore_fulfill(p_order uuid, p_session text, p_intent text, p_key_hash text, p_key_cipher text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  o public.neurokore_orders;
  result uuid;
BEGIN
  SELECT * INTO o FROM public.neurokore_orders WHERE id = p_order FOR UPDATE;
  IF NOT FOUND OR o.stripe_session IS DISTINCT FROM p_session THEN
    RAISE EXCEPTION 'Order mismatch';
  END IF;
  IF o.license_id IS NOT NULL THEN
    RETURN o.license_id;
  END IF;
  INSERT INTO public.neurokore_licenses (email, key_hash, key_cipher, tier, stripe_session)
  VALUES (o.email, p_key_hash, p_key_cipher, 'full', p_session)
  RETURNING id INTO result;
  UPDATE public.neurokore_orders SET license_id = result, payment_intent = p_intent WHERE id = p_order;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.neurokore_activate(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.neurokore_fulfill(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.neurokore_activate(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.neurokore_fulfill(uuid, text, text, text, text) TO service_role;

-- ============================================================
-- NEUROKORE releases and downloads (service_role only)
-- Draft -> validated -> published -> withdrawn. Only published releases are
-- downloadable; storage keys never leave the server.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.neurokore_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  withdrawn_at timestamptz,
  UNIQUE (version, channel)
);

CREATE TABLE IF NOT EXISTS public.neurokore_release_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NOT NULL REFERENCES public.neurokore_releases(id) ON DELETE RESTRICT,
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

CREATE INDEX IF NOT EXISTS neurokore_releases_published_idx
  ON public.neurokore_releases (channel, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS neurokore_release_artifacts_release_idx
  ON public.neurokore_release_artifacts (release_id);

-- Anonymous download statistics: no account, license or buyer reference.
CREATE TABLE IF NOT EXISTS public.neurokore_download_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  release_id uuid NOT NULL REFERENCES public.neurokore_releases(id) ON DELETE RESTRICT,
  artifact_id uuid REFERENCES public.neurokore_release_artifacts(id) ON DELETE SET NULL,
  platform text NOT NULL,
  channel text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS neurokore_download_events_created_idx
  ON public.neurokore_download_events (created_at DESC);

-- Administrative mutations: who changed which record. No secrets, keys or hashes.
CREATE TABLE IF NOT EXISTS public.neurokore_admin_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS neurokore_admin_audit_created_idx
  ON public.neurokore_admin_audit (created_at DESC);

ALTER TABLE public.neurokore_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neurokore_release_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neurokore_download_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neurokore_admin_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.neurokore_releases, public.neurokore_release_artifacts, public.neurokore_download_events
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.neurokore_admin_audit FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.neurokore_releases, public.neurokore_release_artifacts, public.neurokore_download_events
  TO service_role;
GRANT ALL ON TABLE public.neurokore_admin_audit TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.neurokore_download_events_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.neurokore_admin_audit_id_seq TO service_role;

-- Publishing checks completeness atomically. Withdrawing keeps the row and files
-- for support and restoration; a later publish of the same row is allowed.
CREATE OR REPLACE FUNCTION public.neurokore_publish_release(p_release uuid, p_admin uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  r public.neurokore_releases;
  total integer;
  ready integer;
BEGIN
  SELECT * INTO r FROM public.neurokore_releases WHERE id = p_release FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Release not found';
  END IF;
  IF r.status NOT IN ('draft', 'validated', 'withdrawn') THEN
    RAISE EXCEPTION 'Release cannot be published from its current state';
  END IF;
  SELECT count(*) INTO total FROM public.neurokore_release_artifacts WHERE release_id = r.id;
  SELECT count(*) INTO ready FROM public.neurokore_release_artifacts
    WHERE release_id = r.id AND validation_status = 'validated';
  IF total = 0 OR ready <> total THEN
    RAISE EXCEPTION 'Release artifacts are incomplete or unvalidated';
  END IF;
  UPDATE public.neurokore_releases
    SET status = 'published', published_at = now(), published_by = p_admin,
        withdrawn_at = NULL, validated_at = COALESCE(validated_at, now())
    WHERE id = r.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.neurokore_withdraw_release(p_release uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.neurokore_releases
    SET status = 'withdrawn', withdrawn_at = now()
    WHERE id = p_release AND status = 'published';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Release is not published';
  END IF;
END;
$$;

-- Public catalogue: published release metadata and artifact checksums only.
-- storage_key and admin identities are never exposed.
CREATE OR REPLACE FUNCTION public.neurokore_public_releases()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
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
      FROM public.neurokore_release_artifacts a
      WHERE a.release_id = r.id AND a.validation_status = 'validated'
    ), '[]'::jsonb)
  ) ORDER BY r.published_at DESC), '[]'::jsonb)
  FROM public.neurokore_releases r
  WHERE r.status = 'published' AND r.withdrawn_at IS NULL;
$$;

REVOKE ALL ON FUNCTION public.neurokore_publish_release(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.neurokore_withdraw_release(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.neurokore_public_releases() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.neurokore_publish_release(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.neurokore_withdraw_release(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.neurokore_public_releases() TO anon, authenticated, service_role;

-- ============================================================
-- Data API table grants (idempotent)
-- From 2026-10-30 Supabase no longer auto-grants new public tables to
-- anon / authenticated / service_role. RLS still filters rows.
-- Keep rate_limits and neurokore_* service_role-only (already REVOKEd).
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

GRANT INSERT ON TABLE public.analytics_events TO anon;

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


