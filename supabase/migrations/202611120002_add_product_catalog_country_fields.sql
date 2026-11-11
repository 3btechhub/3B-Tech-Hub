-- Add optional catalogue details and country targeting to the existing products table.
alter table public.products
  add column if not exists category text,
  add column if not exists country text not null default 'global',
  add column if not exists phone text,
  add column if not exists whatsapp text,
  add column if not exists photo_url text;

alter table public.products
  drop constraint if exists products_country_check;

alter table public.products
  add constraint products_country_check
  check (country in ('global', 'bd', 'saudi'));

create index if not exists products_status_country_updated_idx
  on public.products (status, country, updated_at desc);

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
