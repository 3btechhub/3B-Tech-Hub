-- 3B TECH HUB initial Supabase foundation. Additive only; no existing data is dropped.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_locale text not null default 'en' check (preferred_locale in ('en','bn','ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','manager','editor','staff','customer')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  unique (user_id, role)
);

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role in ('owner','admin')
  );
$$;

revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'en' check (locale in ('en','bn','ar')),
  title text not null,
  body jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, locale)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  slug text not null unique,
  name text not null,
  description text not null default '',
  condition text not null default 'new' check (condition in ('new','used','refurbished')),
  price_minor bigint check (price_minor is null or price_minor >= 0),
  currency char(3) not null default 'SAR',
  stock_qty integer not null default 0 check (stock_qty >= 0),
  image_paths text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category text not null default 'general',
  is_home_service boolean not null default false,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  customer_name text not null,
  email text,
  phone text not null,
  preferred_at timestamptz,
  message text not null default '',
  status text not null default 'requested' check (status in ('requested','confirmed','in_progress','completed','cancelled','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  alt_text text not null default '',
  is_public boolean not null default true,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists site_content_public_idx on public.site_content (locale, slug) where status = 'published';
create index if not exists products_active_idx on public.products (slug) where status = 'active';
create index if not exists services_active_idx on public.services (slug) where status = 'active';
create index if not exists bookings_user_created_idx on public.service_bookings (user_id, created_at desc);
create index if not exists bookings_status_created_idx on public.service_bookings (status, created_at desc);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at before update on public.user_profiles for each row execute function public.set_updated_at();
drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at before update on public.site_content for each row execute function public.set_updated_at();
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at before update on public.services for each row execute function public.set_updated_at();
drop trigger if exists bookings_set_updated_at on public.service_bookings;
create trigger bookings_set_updated_at before update on public.service_bookings for each row execute function public.set_updated_at();
drop trigger if exists settings_set_updated_at on public.site_settings;
create trigger settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

alter table public.user_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.site_content enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.service_bookings enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profile_select_self_or_admin" on public.user_profiles;
create policy "profile_select_self_or_admin" on public.user_profiles for select to authenticated using (user_id = (select auth.uid()) or public.is_site_admin());
drop policy if exists "profile_insert_self" on public.user_profiles;
create policy "profile_insert_self" on public.user_profiles for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "profile_update_self" on public.user_profiles;
create policy "profile_update_self" on public.user_profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "roles_select_self_or_admin" on public.user_roles;
create policy "roles_select_self_or_admin" on public.user_roles for select to authenticated using (user_id = (select auth.uid()) or public.is_site_admin());
drop policy if exists "roles_admin_manage" on public.user_roles;
create policy "roles_admin_manage" on public.user_roles for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "content_public_read_published" on public.site_content;
create policy "content_public_read_published" on public.site_content for select to anon, authenticated using (status = 'published' or public.is_site_admin());
drop policy if exists "content_admin_manage" on public.site_content;
create policy "content_admin_manage" on public.site_content for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active" on public.products for select to anon, authenticated using (status = 'active' or public.is_site_admin());
drop policy if exists "products_admin_manage" on public.products;
create policy "products_admin_manage" on public.products for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "services_public_read_active" on public.services;
create policy "services_public_read_active" on public.services for select to anon, authenticated using (status = 'active' or public.is_site_admin());
drop policy if exists "services_admin_manage" on public.services;
create policy "services_admin_manage" on public.services for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "bookings_customer_read_own" on public.service_bookings;
create policy "bookings_customer_read_own" on public.service_bookings for select to authenticated using (user_id = (select auth.uid()) or public.is_site_admin());
drop policy if exists "bookings_admin_manage" on public.service_bookings;
create policy "bookings_admin_manage" on public.service_bookings for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "media_public_read" on public.media_assets;
create policy "media_public_read" on public.media_assets for select to anon, authenticated using (is_public or uploaded_by = (select auth.uid()) or public.is_site_admin());
drop policy if exists "media_admin_manage" on public.media_assets;
create policy "media_admin_manage" on public.media_assets for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings for select to anon, authenticated using (is_public or public.is_site_admin());
drop policy if exists "settings_admin_manage" on public.site_settings;
create policy "settings_admin_manage" on public.site_settings for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "audit_admin_read" on public.audit_logs;
create policy "audit_admin_read" on public.audit_logs for select to authenticated using (public.is_site_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif','image/gif'])
on conflict (id) do nothing;

drop policy if exists "site_media_public_read" on storage.objects;
create policy "site_media_public_read" on storage.objects for select to anon, authenticated using (bucket_id = 'site-media');
drop policy if exists "site_media_admin_insert" on storage.objects;
create policy "site_media_admin_insert" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and public.is_site_admin());
drop policy if exists "site_media_admin_update" on storage.objects;
create policy "site_media_admin_update" on storage.objects for update to authenticated using (bucket_id = 'site-media' and public.is_site_admin()) with check (bucket_id = 'site-media' and public.is_site_admin());
drop policy if exists "site_media_admin_delete" on storage.objects;
create policy "site_media_admin_delete" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and public.is_site_admin());

grant select on public.site_content, public.products, public.services, public.media_assets, public.site_settings to anon, authenticated;
grant select, insert, update on public.user_profiles to authenticated;
grant select on public.user_roles to authenticated;
grant insert, update, delete, select on public.site_content, public.products, public.services, public.service_bookings, public.media_assets, public.site_settings to authenticated;
grant select on public.audit_logs to authenticated;

