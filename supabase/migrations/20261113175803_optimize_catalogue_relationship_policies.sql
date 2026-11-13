-- Keep a single SELECT policy per role and separate Owner write policies.
drop policy if exists service_workshops_public_read on public.service_workshops;
drop policy if exists service_workshops_owner_manage on public.service_workshops;
create policy service_workshops_anon_read on public.service_workshops
for select to anon
using (
  exists (select 1 from public.services s where s.id = service_id and s.status = 'active')
  and exists (select 1 from public.workshops w where w.id = workshop_id and w.status = 'published')
);
create policy service_workshops_authenticated_read on public.service_workshops
for select to authenticated
using (
  (select private.is_site_admin())
  or (
    exists (select 1 from public.services s where s.id = service_id and s.status = 'active')
    and exists (select 1 from public.workshops w where w.id = workshop_id and w.status = 'published')
  )
);
create policy service_workshops_owner_insert on public.service_workshops
for insert to authenticated with check ((select private.is_site_admin()));
create policy service_workshops_owner_update on public.service_workshops
for update to authenticated using ((select private.is_site_admin())) with check ((select private.is_site_admin()));
create policy service_workshops_owner_delete on public.service_workshops
for delete to authenticated using ((select private.is_site_admin()));

drop policy if exists service_technicians_public_read on public.service_technicians;
drop policy if exists service_technicians_owner_manage on public.service_technicians;
create policy service_technicians_anon_read on public.service_technicians
for select to anon
using (
  exists (select 1 from public.services s where s.id = service_id and s.status = 'active')
  and exists (select 1 from public.technicians t where t.id = technician_id and t.is_published = true)
);
create policy service_technicians_authenticated_read on public.service_technicians
for select to authenticated
using (
  (select private.is_site_admin())
  or (
    exists (select 1 from public.services s where s.id = service_id and s.status = 'active')
    and exists (select 1 from public.technicians t where t.id = technician_id and t.is_published = true)
  )
);
create policy service_technicians_owner_insert on public.service_technicians
for insert to authenticated with check ((select private.is_site_admin()));
create policy service_technicians_owner_update on public.service_technicians
for update to authenticated using ((select private.is_site_admin())) with check ((select private.is_site_admin()));
create policy service_technicians_owner_delete on public.service_technicians
for delete to authenticated using ((select private.is_site_admin()));

drop policy if exists product_workshops_public_read on public.product_workshops;
drop policy if exists product_workshops_owner_manage on public.product_workshops;
create policy product_workshops_anon_read on public.product_workshops
for select to anon
using (
  exists (select 1 from public.products p where p.id = product_id and p.status = 'active')
  and exists (select 1 from public.workshops w where w.id = workshop_id and w.status = 'published')
);
create policy product_workshops_authenticated_read on public.product_workshops
for select to authenticated
using (
  (select private.is_site_admin())
  or (
    exists (select 1 from public.products p where p.id = product_id and p.status = 'active')
    and exists (select 1 from public.workshops w where w.id = workshop_id and w.status = 'published')
  )
);
create policy product_workshops_owner_insert on public.product_workshops
for insert to authenticated with check ((select private.is_site_admin()));
create policy product_workshops_owner_update on public.product_workshops
for update to authenticated using ((select private.is_site_admin())) with check ((select private.is_site_admin()));
create policy product_workshops_owner_delete on public.product_workshops
for delete to authenticated using ((select private.is_site_admin()));
