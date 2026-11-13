do $$
declare c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.categories'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%type%'
  loop
    execute format('alter table public.categories drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.categories
  alter column type type text[] using array[type];

alter table public.categories
  add constraint categories_type_values_check
  check (cardinality(type) >= 1 and type <@ array['Service', 'Device']::text[]);

create table if not exists public.catalogue_categories (
  module_name text not null check (module_name in ('services', 'products', 'workshops', 'technicians')),
  record_id uuid not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (module_name, record_id, category_id)
);

create index if not exists catalogue_categories_category_id_idx
  on public.catalogue_categories(category_id);

alter table public.catalogue_categories enable row level security;

drop policy if exists catalogue_categories_admin_select on public.catalogue_categories;
create policy catalogue_categories_admin_select
  on public.catalogue_categories for select to authenticated
  using (private.is_site_admin());

drop policy if exists catalogue_categories_admin_insert on public.catalogue_categories;
create policy catalogue_categories_admin_insert
  on public.catalogue_categories for insert to authenticated
  with check (private.is_site_admin());

drop policy if exists catalogue_categories_admin_update on public.catalogue_categories;
create policy catalogue_categories_admin_update
  on public.catalogue_categories for update to authenticated
  using (private.is_site_admin())
  with check (private.is_site_admin());

drop policy if exists catalogue_categories_admin_delete on public.catalogue_categories;
create policy catalogue_categories_admin_delete
  on public.catalogue_categories for delete to authenticated
  using (private.is_site_admin());

grant select, insert, update, delete on public.catalogue_categories to authenticated;
revoke all on public.catalogue_categories from anon;

alter table public.services alter column country set default 'Global';
alter table public.products alter column country set default 'Global';
alter table public.workshops alter column country set default 'Global';
alter table public.technicians alter column country set default 'Global';
