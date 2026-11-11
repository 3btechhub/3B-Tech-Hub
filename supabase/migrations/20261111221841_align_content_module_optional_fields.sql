alter table public.services
  alter column category drop not null,
  add column if not exists country text not null default 'global',
  add column if not exists photo_url text;
alter table public.services
  drop constraint if exists services_country_check;
alter table public.services
  add constraint services_country_check check (country in ('global','bd','saudi'));
alter table public.workshops
  add column if not exists category text;
alter table public.products
  alter column category drop not null;
