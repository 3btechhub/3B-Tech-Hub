-- Add optional Page contact fields and explicit Home visibility.
alter table public.pages
  add column if not exists location text,
  add column if not exists phone_number text,
  add column if not exists whatsapp_number text,
  add column if not exists email text,
  add column if not exists image_url text,
  add column if not exists visibility boolean not null default false;
