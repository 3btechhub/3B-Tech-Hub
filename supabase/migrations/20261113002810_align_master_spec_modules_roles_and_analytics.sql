-- Master Specification alignment: additive modules and role normalization.
-- Existing content, profiles, Auth users and audit records are preserved.

create or replace function private.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select private.is_site_owner();
$$;

update public.user_roles set role = 'member' where role = 'customer';

alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles
  add constraint user_roles_role_check
  check (role = any (array['owner','member','visitor']::text[]));

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  value text not null check (char_length(btrim(value)) between 1 and 2000),
  type text not null check (type in ('phone','email','link')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contacts_type_idx on public.contacts(type);

create table if not exists public.app_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9_-]{1,63}$'),
  description text not null default '',
  is_active boolean not null default true,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  permission_key text not null unique check (permission_key ~ '^[a-z0-9][a-z0-9_.:-]{1,119}$'),
  description text not null default '',
  resource text not null check (char_length(btrim(resource)) between 1 and 80),
  action text not null check (action in ('create','view','edit','delete','publish','hide','manage')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.app_roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

insert into public.app_roles(name,slug,description,is_active,is_system)
values
 ('Owner','owner','Primary system owner with full control.',true,true),
 ('Member','member','Authenticated website member.',true,true),
 ('Visitor','visitor','Public website visitor.',true,true)
on conflict (slug) do update set name=excluded.name, is_active=true, is_system=true;

insert into public.permissions(name,permission_key,description,resource,action)
values
 ('View Overview','overview.view','View dashboard overview.','overview','view'),
 ('View Activity Logs','audit.view','View administrative activity logs.','audit','view'),
 ('Manage Services','services.manage','Create and manage services.','services','manage'),
 ('Manage Products','products.manage','Create and manage products.','products','manage'),
 ('Manage Workshops','workshops.manage','Create and manage workshops.','workshops','manage'),
 ('Manage Technicians','technicians.manage','Create and manage technicians.','technicians','manage'),
 ('Manage Contacts','contacts.manage','Create and manage website contacts.','contacts','manage'),
 ('Manage Users','users.manage','Manage user accounts and roles.','users','manage'),
 ('Manage Roles','roles.manage','Manage roles.','roles','manage'),
 ('Manage Permissions','permissions.manage','Manage permissions and role assignments.','permissions','manage'),
 ('Manage Settings','settings.manage','Manage website identity and home visibility.','settings','manage')
on conflict (permission_key) do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.app_roles r cross join public.permissions p
where r.slug='owner'
on conflict do nothing;

create table if not exists public.visitor_analytics (
  id bigint generated always as identity primary key,
  visitor_key uuid not null,
  page_path text not null check (char_length(page_path) between 1 and 500),
  referrer text not null default '' check (char_length(referrer) <= 1000),
  device text not null default 'unknown' check (char_length(device) <= 40),
  operating_system text not null default 'unknown' check (char_length(operating_system) <= 80),
  browser text not null default 'unknown' check (char_length(browser) <= 80),
  country text null check (country is null or char_length(country) <= 100),
  city text null check (city is null or char_length(city) <= 100),
  viewed_at timestamptz not null default now()
);
create index if not exists visitor_analytics_viewed_at_idx on public.visitor_analytics(viewed_at desc);
create index if not exists visitor_analytics_visitor_key_idx on public.visitor_analytics(visitor_key);

alter table public.contacts enable row level security;
alter table public.app_roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.visitor_analytics enable row level security;

create policy contacts_public_read on public.contacts for select to anon, authenticated using (true);
create policy contacts_owner_manage on public.contacts for all to authenticated
using (private.is_site_owner()) with check (private.is_site_owner());
create policy app_roles_owner_read on public.app_roles for select to authenticated using (private.is_site_owner());
create policy app_roles_owner_manage on public.app_roles for all to authenticated
using (private.is_site_owner()) with check (private.is_site_owner());
create policy permissions_owner_read on public.permissions for select to authenticated using (private.is_site_owner());
create policy permissions_owner_manage on public.permissions for all to authenticated
using (private.is_site_owner()) with check (private.is_site_owner());
create policy role_permissions_owner_read on public.role_permissions for select to authenticated using (private.is_site_owner());
create policy role_permissions_owner_manage on public.role_permissions for all to authenticated
using (private.is_site_owner()) with check (private.is_site_owner());
create policy visitor_analytics_public_insert on public.visitor_analytics for insert to anon, authenticated with check (true);
create policy visitor_analytics_owner_read on public.visitor_analytics for select to authenticated
using (private.is_site_owner());

grant select on public.contacts to anon, authenticated;
grant insert, update, delete, select on public.contacts to authenticated;
grant select, insert, update, delete on public.app_roles, public.permissions, public.role_permissions to authenticated;
grant insert on public.visitor_analytics to anon, authenticated;
grant select on public.visitor_analytics to authenticated;

create trigger contacts_set_updated_at before update on public.contacts
for each row execute function public.set_updated_at();
create trigger audit_contact_changes after insert or update or delete on public.contacts
for each row execute function private.capture_audit_event('contacts');
