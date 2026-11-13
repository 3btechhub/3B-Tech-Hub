-- Shared content fields for consistent item detail pages across Services, Products, Workshops and Technicians.
alter table public.services
  add column if not exists short_info text,
  add column if not exists service_information text[] not null default '{}',
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists location text,
  add column if not exists map_url text,
  add column if not exists phone text,
  add column if not exists whatsapp text;
alter table public.products
  add column if not exists short_info text,
  add column if not exists service_information text[] not null default '{}',
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists location text,
  add column if not exists map_url text;
alter table public.workshops
  add column if not exists short_info text,
  add column if not exists service_information text[] not null default '{}',
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists map_url text;
alter table public.technicians
  add column if not exists short_info text,
  add column if not exists service_information text[] not null default '{}',
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists location text,
  add column if not exists map_url text;
