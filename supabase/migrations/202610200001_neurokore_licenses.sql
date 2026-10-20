
-- All access goes through authenticated server routes using service_role.
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
create index on public.neurokore_licenses(email);
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
alter table public.neurokore_licenses enable row level security;
alter table public.neurokore_devices enable row level security;
alter table public.neurokore_orders enable row level security;
revoke all on public.neurokore_licenses, public.neurokore_devices, public.neurokore_orders from anon, authenticated;
grant all on public.neurokore_licenses, public.neurokore_devices, public.neurokore_orders to service_role;

create function public.neurokore_activate(p_key_hash text, p_device text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare l public.neurokore_licenses;
begin
 select * into l from public.neurokore_licenses where key_hash = p_key_hash for update;
 if not found or l.revoked_at is not null or (l.expires_at is not null and l.expires_at <= now()) then
   raise exception 'License unavailable';
 end if;
 if not exists (select 1 from public.neurokore_devices where license_id=l.id and device=p_device) then
   if (select count(*) from public.neurokore_devices where license_id=l.id) >= l.max_devices then
     raise exception 'Device limit reached';
   end if;
   insert into public.neurokore_devices (license_id,device) values (l.id,p_device);
 end if;
 return jsonb_build_object('id',l.id,'email',l.email,'tier',l.tier,'expires_at',l.expires_at);
end $$;

-- Retries and simultaneous Stripe deliveries produce exactly one license.
create function public.neurokore_fulfill(p_order uuid, p_session text, p_intent text, p_key_hash text, p_key_cipher text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare o public.neurokore_orders; result uuid;
begin
 select * into o from public.neurokore_orders where id=p_order for update;
 if not found or o.stripe_session is distinct from p_session then raise exception 'Order mismatch'; end if;
 if o.license_id is not null then return o.license_id; end if;
 insert into public.neurokore_licenses(email,key_hash,key_cipher,tier,stripe_session)
 values (o.email,p_key_hash,p_key_cipher,'full',p_session) returning id into result;
 update public.neurokore_orders set license_id=result,payment_intent=p_intent where id=p_order;
 return result;
end $$;
revoke all on function public.neurokore_activate(text,text) from public,anon,authenticated;
revoke all on function public.neurokore_fulfill(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.neurokore_activate(text,text) to service_role;
grant execute on function public.neurokore_fulfill(uuid,text,text,text,text) to service_role;
