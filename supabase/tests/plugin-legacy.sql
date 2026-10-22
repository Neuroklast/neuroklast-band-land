-- Simulates the pre-migration NEUROKORE schema so CI can exercise the rename
-- and backfill path, not only a fresh install. Runs BEFORE supabase/schema.sql.
create table public.neurokore_licenses (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  key_hash text not null unique,
  key_cipher text not null,
  tier text not null check (tier in ('alpha','full')),
  max_devices integer not null default 2 check (max_devices between 1 and 5),
  expires_at timestamptz,
  revoked_at timestamptz,
  stripe_session text unique,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.neurokore_devices (
  license_id uuid not null references public.neurokore_licenses(id) on delete cascade,
  device text not null check (device ~ '^v2:[a-f0-9]{64}$'),
  activated_at timestamptz not null default now(),
  primary key (license_id, device)
);
create table public.neurokore_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  email text not null,
  price_id text not null,
  stripe_session text unique,
  payment_intent text unique,
  license_id uuid references public.neurokore_licenses(id),
  created_at timestamptz not null default now()
);
create table public.neurokore_releases (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  channel text not null default 'stable',
  status text not null default 'draft',
  title text,
  changelog text,
  release_notes text,
  git_commit_sha text,
  created_at timestamptz not null default now(),
  validated_at timestamptz,
  published_at timestamptz,
  published_by uuid references auth.users(id),
  withdrawn_at timestamptz,
  unique (version, channel)
);
create table public.neurokore_release_artifacts (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.neurokore_releases(id) on delete restrict,
  platform text not null,
  architecture text not null,
  package_type text not null,
  filename text not null,
  storage_key text not null,
  filesize_bytes bigint not null,
  sha256 text not null,
  signing_status text not null default 'unsigned',
  validation_status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (release_id, platform, package_type)
);
create table public.neurokore_download_events (
  id bigint generated always as identity primary key,
  release_id uuid not null references public.neurokore_releases(id) on delete restrict,
  artifact_id uuid references public.neurokore_release_artifacts(id) on delete set null,
  platform text not null,
  channel text not null,
  created_at timestamptz not null default now()
);
create table public.neurokore_admin_audit (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id) on delete set null,
  action text not null,
  target text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into auth.users(id) values ('11111111-1111-4111-8111-111111111111');
insert into public.neurokore_licenses(id,email,key_hash,key_cipher,tier,stripe_session)
values ('22222222-2222-4222-8222-222222222222','legacy@example.com','legacy-hash','legacy-cipher','full','cs_legacy');
insert into public.neurokore_devices(license_id,device)
values ('22222222-2222-4222-8222-222222222222','v2:'||repeat('a',64));
insert into public.neurokore_orders(id,user_id,email,price_id,stripe_session,license_id)
values ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111',
        'legacy@example.com','price_legacy','cs_legacy','22222222-2222-4222-8222-222222222222');
insert into public.neurokore_releases(id,version,channel,status,title,published_at)
values ('44444444-4444-4444-8444-444444444444','0.6.0','stable','published','Legacy build',now());
insert into public.neurokore_release_artifacts(release_id,platform,architecture,package_type,filename,storage_key,filesize_bytes,sha256,validation_status)
values ('44444444-4444-4444-8444-444444444444','windows-x64','x64','installer','legacy.exe',
        'releases/neurokore/v0.6.0/windows-x64/legacy.exe',1024,repeat('a',64),'validated');
insert into public.neurokore_download_events(release_id,platform,channel)
values ('44444444-4444-4444-8444-444444444444','windows-x64','stable');
