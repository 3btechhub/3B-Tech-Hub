-- Optional many-to-many links between existing technicians and workshops.
create table if not exists public.workshop_technicians (
  technician_id uuid not null references public.technicians(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (technician_id, workshop_id)
);
create index if not exists workshop_technicians_workshop_id_idx
  on public.workshop_technicians(workshop_id);
alter table public.workshop_technicians enable row level security;
grant select on public.workshop_technicians to anon, authenticated;
grant insert, update, delete on public.workshop_technicians to authenticated;
create policy workshop_technicians_public_read
on public.workshop_technicians for select to anon, authenticated
using (
  exists (select 1 from public.technicians t where t.id = technician_id and t.is_published = true)
  and exists (select 1 from public.workshops w where w.id = workshop_id and w.status = 'published')
);
create policy workshop_technicians_owner_manage
on public.workshop_technicians for all to authenticated
using ((select private.is_site_admin()))
with check ((select private.is_site_admin()));
