-- Additive alignment for the combined 14 November 2026 master specification.
-- Existing records, tables, authentication and storage objects are preserved.

alter table public.service_types
  add column if not exists description text not null default '',
  add column if not exists sort_order integer not null default 0;
alter table public.device_types
  add column if not exists description text not null default '',
  add column if not exists sort_order integer not null default 0;
alter table public.services add column if not exists sort_order integer not null default 0;
alter table public.products add column if not exists sort_order integer not null default 0;
alter table public.workshops add column if not exists sort_order integer not null default 0;
alter table public.technicians add column if not exists sort_order integer not null default 0;

alter table public.countries
  add column if not exists slug text,
  add column if not exists description text not null default '',
  add column if not exists photo_url text,
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists sort_order integer not null default 0;

update public.countries
set slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
where slug is null or btrim(slug) = '';
update public.countries set slug = 'global' where is_global = true;
create unique index if not exists countries_slug_unique on public.countries(slug);

-- New module-specific fields on existing access-management tables.
alter table public."Users"
  add column if not exists photo_url text,
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists sort_order integer not null default 0;
alter table public."Roles"
  add column if not exists email text,
  add column if not exists photo_url text,
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists status text not null default 'active',
  add column if not exists sort_order integer not null default 0;
alter table public.permissions
  add column if not exists email text,
  add column if not exists photo_url text,
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists status text not null default 'active',
  add column if not exists sort_order integer not null default 0;

update public."Roles" set status = case when is_active then 'active' else 'deactive' end;
update public.permissions set status = case when is_active then 'active' else 'deactive' end;

alter table public."Roles" drop constraint if exists roles_status_check;
alter table public."Roles" add constraint roles_status_check check (status in ('active','deactive','blocked'));
alter table public.permissions drop constraint if exists permissions_status_check;
alter table public.permissions add constraint permissions_status_check check (status in ('active','deactive','blocked'));
alter table public."Users" drop constraint if exists users_status_check;
alter table public."Users" add constraint users_status_check check (status in ('active','deactive','blocked'));

-- Fill stable initial order without changing record identity or content.
with ranked as (select id, row_number() over(order by created_at, id) * 10 as n from public.service_types)
update public.service_types t set sort_order=r.n from ranked r where t.id=r.id;
with ranked as (select id, row_number() over(order by created_at, id) * 10 as n from public.device_types)
update public.device_types t set sort_order=r.n from ranked r where t.id=r.id;
with ranked as (select id, row_number() over(order by created_at, id) * 10 as n from public.services)
update public.services t set sort_order=r.n from ranked r where t.id=r.id;
with ranked as (select id, row_number() over(order by created_at, id) * 10 as n from public.products)
update public.products t set sort_order=r.n from ranked r where t.id=r.id;
with ranked as (select id, row_number() over(order by created_at, id) * 10 as n from public.workshops)
update public.workshops t set sort_order=r.n from ranked r where t.id=r.id;
with ranked as (select id, row_number() over(order by created_at, id) * 10 as n from public.technicians)
update public.technicians t set sort_order=r.n from ranked r where t.id=r.id;
with ranked as (select id, row_number() over(order by created_at, id) * 10 as n from public.countries)
update public.countries t set sort_order=r.n from ranked r where t.id=r.id;
with ranked as (select id, row_number() over(order by created_at, id) * 10 as n from public."Users")
update public."Users" t set sort_order=r.n from ranked r where t.id=r.id;
with ranked as (select id, row_number() over(order by created_at, id) * 10 as n from public."Roles")
update public."Roles" t set sort_order=r.n from ranked r where t.id=r.id;
with ranked as (select id, row_number() over(order by created_at, id) * 10 as n from public.permissions)
update public.permissions t set sort_order=r.n from ranked r where t.id=r.id;

create unique index if not exists workshops_slug_unique on public.workshops(slug);
create unique index if not exists technicians_slug_unique on public.technicians(slug);

-- The Global country is a protected system choice, not a removable country option.
create or replace function private.protect_global_country_record()
returns trigger language plpgsql security definer set search_path = public, private
as $$
begin
  if tg_op = 'DELETE' and old.is_global then
    raise exception 'The Global country is a protected system record.';
  end if;
  if tg_op = 'UPDATE' and old.is_global and
     (new.is_global is distinct from true or new.name is distinct from old.name or
      new.code is distinct from old.code or new.slug is distinct from old.slug) then
    raise exception 'The Global country identity is protected.';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
drop trigger if exists protect_global_country_record on public.countries;
create trigger protect_global_country_record
before update or delete on public.countries
for each row execute function private.protect_global_country_record();

-- Make Global a default relationship for all existing catalogue records.
do $$
declare global_id uuid;
begin
  select id into global_id from public.countries where is_global = true limit 1;
  if global_id is not null then
    insert into public.service_type_countries(service_type_id,country_id)
      select id,global_id from public.service_types on conflict do nothing;
    insert into public.device_type_countries(device_type_id,country_id)
      select id,global_id from public.device_types on conflict do nothing;
    insert into public.service_countries(service_id,country_id)
      select id,global_id from public.services on conflict do nothing;
    insert into public.product_countries(product_id,country_id)
      select id,global_id from public.products on conflict do nothing;
    insert into public.workshop_countries(workshop_id,country_id)
      select id,global_id from public.workshops on conflict do nothing;
    insert into public.technician_countries(technician_id,country_id)
      select id,global_id from public.technicians on conflict do nothing;
  end if;
end;
$$;

-- Languages is a new first-class module. English is the pre-created default.
create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  country text not null default 'Global',
  photo_url text,
  gallery_urls text[] not null default '{}',
  status text not null default 'active' check (status in ('draft','active','published','archived')),
  visibility_roles text[] not null default array['owner']::text[],
  sort_order integer not null default 10,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint languages_title_nonempty check (char_length(btrim(title)) > 0),
  constraint languages_slug_nonempty check (char_length(btrim(slug)) > 0)
);
create unique index if not exists languages_one_default on public.languages(is_default) where is_default = true;
insert into public.languages(title,slug,description,country,status,visibility_roles,sort_order,is_default)
values ('English','en','','Global','active',array['owner','visitor']::text[],10,true)
on conflict (slug) do update set is_default=true, status='active';

alter table public.languages enable row level security;
grant select on public.languages to anon, authenticated;
grant insert, update, delete on public.languages to authenticated;
drop policy if exists languages_public_read on public.languages;
create policy languages_public_read on public.languages
for select to anon, authenticated
using (status in ('active','published') and private.user_can_view_visibility(visibility_roles));
drop policy if exists languages_owner_manage on public.languages;
create policy languages_owner_manage on public.languages
for all to authenticated
using (private.is_site_owner())
with check (private.is_site_owner());

-- Language relationships mirror the catalogue relationship model.
create table if not exists public.language_countries (
  language_id uuid not null references public.languages(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(language_id,country_id)
);
create table if not exists public.language_service_types (
  language_id uuid not null references public.languages(id) on delete cascade,
  service_type_id uuid not null references public.service_types(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(language_id,service_type_id)
);
create table if not exists public.language_product_types (
  language_id uuid not null references public.languages(id) on delete cascade,
  product_type_id uuid not null references public.device_types(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(language_id,product_type_id)
);
create table if not exists public.language_services (
  language_id uuid not null references public.languages(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(language_id,service_id)
);
create table if not exists public.language_products (
  language_id uuid not null references public.languages(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(language_id,product_id)
);
create table if not exists public.language_workshops (
  language_id uuid not null references public.languages(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(language_id,workshop_id)
);
create table if not exists public.language_technicians (
  language_id uuid not null references public.languages(id) on delete cascade,
  technician_id uuid not null references public.technicians(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(language_id,technician_id)
);

do $$
declare tbl text;
begin
  foreach tbl in array array[
    'language_countries','language_service_types','language_product_types',
    'language_services','language_products','language_workshops','language_technicians'
  ] loop
    execute format('alter table public.%I enable row level security',tbl);
    execute format('grant select, insert, update, delete on public.%I to authenticated',tbl);
    execute format('drop policy if exists %I on public.%I',tbl||'_owner_manage',tbl);
    execute format('create policy %I on public.%I for all to authenticated using (private.is_site_owner()) with check (private.is_site_owner())',tbl||'_owner_manage',tbl);
  end loop;
end;
$$;

-- Persist the new slug settings without creating standalone module pages.
insert into public."Settings"(setting_key,setting_value,description,visibility_roles)
values
('module_slugs', jsonb_build_object(
  'overview','overview','website_informations','website-informations',
  'service_types','service-types','product_types','product-types',
  'services','services','products','products','workshops','workshops',
  'technicians','technicians','countries','countries','languages','languages',
  'users','users','roles','roles','permissions','permissions',
  'customizations','customizations','settings','settings'
), 'Configurable identifiers for dashboard modules; modules do not have standalone pages.', array['owner']::text[]),
('account_layout_slugs', jsonb_build_object(
  'login','login','create_account','create-account',
  'reset_password','reset-password','profile','profile'
), 'Configurable slugs for Account layouts.', array['owner']::text[]),
('website_information', (
  select jsonb_build_object(
    'title', coalesce((select setting_value->>'website_title' from public."Settings" where setting_key='site_profile' limit 1),'3B TECH HUB'),
    'logo_url', coalesce((select setting_value->>'logo_url' from public."Settings" where setting_key='site_profile' limit 1),''),
    'intro', coalesce((select setting_value->>'content' from public."Settings" where setting_key='home_intro' limit 1),'')
  )
), 'Website logo, title and intro.', array['owner','visitor']::text[])
on conflict (setting_key) do update set
  setting_value = case
    when public."Settings".setting_key='module_slugs' then excluded.setting_value
    when public."Settings".setting_key='account_layout_slugs' then excluded.setting_value
    else public."Settings".setting_value
  end,
  description = excluded.description,
  updated_at = now();

-- New homepage set: only the six catalogue modules from the new specification.
update public."Settings"
set setting_value = jsonb_build_object('modules', jsonb_build_array(
  jsonb_build_object('key','service_types','title','Service Types','sort_order',10,'visibility_roles',jsonb_build_array('owner','visitor')),
  jsonb_build_object('key','device_types','title','Product Types','sort_order',20,'visibility_roles',jsonb_build_array('owner','visitor')),
  jsonb_build_object('key','services','title','Services','sort_order',30,'visibility_roles',jsonb_build_array('owner','visitor')),
  jsonb_build_object('key','products','title','Products','sort_order',40,'visibility_roles',jsonb_build_array('owner','visitor')),
  jsonb_build_object('key','workshops','title','Workshops','sort_order',50,'visibility_roles',jsonb_build_array('owner','visitor')),
  jsonb_build_object('key','technicians','title','Technicians','sort_order',60,'visibility_roles',jsonb_build_array('owner','visitor'))
)),
description='Owner-configurable Home modules, visibility and order.',
updated_at=now()
where setting_key='home_modules';
