create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  type text not null check (type in ('Service', 'Device')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists categories_admin_select on public.categories;
create policy categories_admin_select
  on public.categories for select to authenticated
  using (private.is_site_admin());

drop policy if exists categories_admin_insert on public.categories;
create policy categories_admin_insert
  on public.categories for insert to authenticated
  with check (private.is_site_admin());

drop policy if exists categories_admin_update on public.categories;
create policy categories_admin_update
  on public.categories for update to authenticated
  using (private.is_site_admin())
  with check (private.is_site_admin());

drop policy if exists categories_admin_delete on public.categories;
create policy categories_admin_delete
  on public.categories for delete to authenticated
  using (private.is_site_admin());

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.categories to authenticated;
