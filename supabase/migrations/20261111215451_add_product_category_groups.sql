-- Add an explicit top-level group to keep mobile products separate from satellite equipment.
alter table public.products
  add column if not exists category_group text not null default 'mobile';

alter table public.products
  drop constraint if exists products_category_group_check;

alter table public.products
  add constraint products_category_group_check
  check (category_group in ('mobile', 'satellite'));

create index if not exists products_category_group_status_idx
  on public.products (category_group, status, updated_at desc);

