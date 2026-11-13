-- Ensure every detail-page module can store the complete set of optional contact details.
alter table public.services
  add column if not exists phone text,
  add column if not exists whatsapp text;
alter table public.products
  add column if not exists phone text,
  add column if not exists whatsapp text;
alter table public.workshops
  add column if not exists phone text,
  add column if not exists whatsapp text;
alter table public.technicians
  add column if not exists phone text,
  add column if not exists whatsapp text;
