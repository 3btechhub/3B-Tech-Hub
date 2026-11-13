-- Explicit relationships between catalogue items and the real providers/locations.
create table if not exists public.service_workshops (
  service_id uuid not null references public.services(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (service_id, workshop_id)
);
create index if not exists service_workshops_workshop_id_idx on public.service_workshops(workshop_id);

create table if not exists public.service_technicians (
  service_id uuid not null references public.services(id) on delete cascade,
  technician_id uuid not null references public.technicians(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (service_id, technician_id)
);
create index if not exists service_technicians_technician_id_idx on public.service_technicians(technician_id);

create table if not exists public.product_workshops (
  product_id uuid not null references public.products(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, workshop_id)
);
create index if not exists product_workshops_workshop_id_idx on public.product_workshops(workshop_id);

alter table public.service_workshops enable row level security;
alter table public.service_technicians enable row level security;
alter table public.product_workshops enable row level security;

grant select on public.service_workshops, public.service_technicians, public.product_workshops to anon, authenticated;
grant insert, update, delete on public.service_workshops, public.service_technicians, public.product_workshops to authenticated;

create policy service_workshops_public_read on public.service_workshops
for select to anon, authenticated
using (
  exists (select 1 from public.services s where s.id = service_id and s.status = 'active')
  and exists (select 1 from public.workshops w where w.id = workshop_id and w.status = 'published')
);
create policy service_technicians_public_read on public.service_technicians
for select to anon, authenticated
using (
  exists (select 1 from public.services s where s.id = service_id and s.status = 'active')
  and exists (select 1 from public.technicians t where t.id = technician_id and t.is_published = true)
);
create policy product_workshops_public_read on public.product_workshops
for select to anon, authenticated
using (
  exists (select 1 from public.products p where p.id = product_id and p.status = 'active')
  and exists (select 1 from public.workshops w where w.id = workshop_id and w.status = 'published')
);

create policy service_workshops_owner_manage on public.service_workshops
for all to authenticated
using ((select private.is_site_admin()))
with check ((select private.is_site_admin()));
create policy service_technicians_owner_manage on public.service_technicians
for all to authenticated
using ((select private.is_site_admin()))
with check ((select private.is_site_admin()));
create policy product_workshops_owner_manage on public.product_workshops
for all to authenticated
using ((select private.is_site_admin()))
with check ((select private.is_site_admin()));
