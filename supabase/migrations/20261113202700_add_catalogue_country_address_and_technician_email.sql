alter table public.services add column if not exists country text;
alter table public.products add column if not exists country text;
alter table public.workshops add column if not exists country text;
alter table public.workshops add column if not exists address text;
alter table public.technicians add column if not exists country text;
alter table public.technicians add column if not exists email text;