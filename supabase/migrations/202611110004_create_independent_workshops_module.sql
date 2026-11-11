create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text,
  workshop_date date,
  workshop_time time,
  location text,
  trainer text,
  phone text,
  whatsapp text,
  photo_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workshops enable row level security;

grant select on public.workshops to anon, authenticated;
grant insert, update, delete on public.workshops to authenticated;

create policy "workshops_public_read_published"
on public.workshops for select
to anon, authenticated
using (status = 'published' or (select private.is_site_admin()));

create policy "workshops_admin_insert"
on public.workshops for insert
to authenticated
with check ((select private.is_site_admin()));

create policy "workshops_admin_update"
on public.workshops for update
to authenticated
using ((select private.is_site_admin()))
with check ((select private.is_site_admin()));

create policy "workshops_admin_delete"
on public.workshops for delete
to authenticated
using ((select private.is_site_admin()));

delete from public.site_settings where setting_key = 'company_profile';
