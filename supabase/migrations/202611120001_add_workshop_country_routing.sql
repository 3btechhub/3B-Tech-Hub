-- Add optional country targeting for workshops. Existing records remain global.
alter table public.workshops
  add column if not exists country text not null default 'global';

alter table public.workshops
  drop constraint if exists workshops_country_check;

alter table public.workshops
  add constraint workshops_country_check
  check (country in ('global', 'bd', 'saudi'));

create index if not exists workshops_status_country_date_idx
  on public.workshops (status, country, workshop_date);
