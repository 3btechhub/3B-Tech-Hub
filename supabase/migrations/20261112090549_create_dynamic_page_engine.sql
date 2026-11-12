-- Dynamic page engine foundation.
-- Database stores page structure and component settings; trusted code renders allowlisted component types.
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid null references public.pages(id) on delete restrict,
  page_type text not null check (page_type in ('main','sub')),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) between 1 and 180),
  description text not null default '',
  locale text not null default 'en' check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0,
  seo jsonb not null default '{}'::jsonb check (jsonb_typeof(seo) = 'object'),
  created_by uuid null references auth.users(id) on delete set null,
  updated_by uuid null references auth.users(id) on delete set null,
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pages_parent_type_check check (
    (page_type = 'main' and parent_id is null) or
    (page_type = 'sub' and parent_id is not null)
  ),
  constraint pages_no_self_parent check (parent_id is null or parent_id <> id)
);

create unique index if not exists pages_main_slug_locale_uidx
  on public.pages (lower(slug), locale) where parent_id is null;
create unique index if not exists pages_child_slug_parent_locale_uidx
  on public.pages (parent_id, lower(slug), locale) where parent_id is not null;
create index if not exists pages_public_listing_idx
  on public.pages (status, page_type, sort_order) where status = 'published';
create index if not exists pages_parent_order_idx
  on public.pages (parent_id, sort_order, created_at);

create table if not exists public.page_components (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  slot text not null default 'main' check (slot ~ '^[a-z][a-z0-9_-]{0,39}$'),
  component_type text not null check (component_type in (
    'hero','rich_text','image','card_grid','button_group','faq','spacer'
  )),
  component_config jsonb not null default '{}'::jsonb
    check (jsonb_typeof(component_config) = 'object'),
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists page_components_render_idx
  on public.page_components (page_id, slot, sort_order) where is_visible = true;

create table if not exists public.page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  revision_number integer not null check (revision_number > 0),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (page_id, revision_number)
);
create index if not exists page_revisions_history_idx
  on public.page_revisions (page_id, revision_number desc);

alter table public.pages enable row level security;
alter table public.page_components enable row level security;
alter table public.page_revisions enable row level security;

grant select on public.pages, public.page_components to anon, authenticated;
grant insert, update, delete on public.pages, public.page_components, public.page_revisions to authenticated;
grant select on public.page_revisions to authenticated;

drop policy if exists pages_public_read on public.pages;
create policy pages_public_read on public.pages
  for select to anon, authenticated
  using (status = 'published' or private.is_site_admin());

drop policy if exists pages_admin_insert on public.pages;
create policy pages_admin_insert on public.pages
  for insert to authenticated with check (private.is_site_admin());

drop policy if exists pages_admin_update on public.pages;
create policy pages_admin_update on public.pages
  for update to authenticated using (private.is_site_admin())
  with check (private.is_site_admin());

drop policy if exists pages_admin_delete on public.pages;
create policy pages_admin_delete on public.pages
  for delete to authenticated using (private.is_site_admin());

drop policy if exists page_components_public_read on public.page_components;
create policy page_components_public_read on public.page_components
  for select to anon, authenticated
  using (
    exists (select 1 from public.pages p where p.id = page_id and p.status = 'published')
    or private.is_site_admin()
  );

drop policy if exists page_components_admin_insert on public.page_components;
create policy page_components_admin_insert on public.page_components
  for insert to authenticated with check (private.is_site_admin());

drop policy if exists page_components_admin_update on public.page_components;
create policy page_components_admin_update on public.page_components
  for update to authenticated using (private.is_site_admin())
  with check (private.is_site_admin());

drop policy if exists page_components_admin_delete on public.page_components;
create policy page_components_admin_delete on public.page_components
  for delete to authenticated using (private.is_site_admin());

drop policy if exists page_revisions_admin_read on public.page_revisions;
create policy page_revisions_admin_read on public.page_revisions
  for select to authenticated using (private.is_site_admin());

drop policy if exists page_revisions_admin_insert on public.page_revisions;
create policy page_revisions_admin_insert on public.page_revisions
  for insert to authenticated with check (private.is_site_admin());

revoke all on public.pages, public.page_components, public.page_revisions from anon;
grant select on public.pages, public.page_components to anon;
