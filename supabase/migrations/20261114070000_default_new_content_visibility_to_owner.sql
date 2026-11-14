-- New records are private to Owner until additional roles are explicitly selected.
-- Existing rows retain their current visibility arrays.
alter table public.countries alter column visibility_roles set default array['owner']::text[];
alter table public.locations alter column visibility_roles set default array['owner']::text[];
alter table public.service_types alter column visibility_roles set default array['owner']::text[];
alter table public.device_types alter column visibility_roles set default array['owner']::text[];
alter table public.services alter column visibility_roles set default array['owner']::text[];
alter table public.products alter column visibility_roles set default array['owner']::text[];
alter table public.workshops alter column visibility_roles set default array['owner']::text[];
alter table public.technicians alter column visibility_roles set default array['owner']::text[];
alter table public.contacts alter column visibility_roles set default array['owner']::text[];
alter table public."Settings" alter column visibility_roles set default array['owner']::text[];
