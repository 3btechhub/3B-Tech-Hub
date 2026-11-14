-- Grant the public client read access only where RLS policies below authorize it.
grant select on public.service_types, public.device_types, public.services, public.products, public.workshops, public.technicians to anon, authenticated;
grant select on public.service_type_device_types, public.service_type_services, public.service_type_products, public.service_type_workshops, public.service_type_technicians,
  public.device_type_services, public.device_type_products, public.device_type_workshops, public.device_type_technicians,
  public.service_products, public.service_workshops, public.service_technicians, public.product_workshops, public.product_technicians, public.workshop_technicians,
  public.service_type_countries, public.device_type_countries, public.service_countries, public.product_countries, public.workshop_countries, public.technician_countries
to anon, authenticated;

-- Every public relationship is visible only when both endpoint records are visible to the current role.
do $$
declare
  item record;
  old_policy record;
begin
  for item in
    select * from (values
      ('service_type_device_types','service_types','service_type_id','p.status = any(array[''active'',''published''])','device_types','device_type_id','c.status = any(array[''active'',''published''])'),
      ('service_type_services','service_types','service_type_id','p.status = any(array[''active'',''published''])','services','service_id','c.status = ''active'''),
      ('service_type_products','service_types','service_type_id','p.status = any(array[''active'',''published''])','products','product_id','c.status = ''active'''),
      ('service_type_workshops','service_types','service_type_id','p.status = any(array[''active'',''published''])','workshops','workshop_id','c.status = ''published'''),
      ('service_type_technicians','service_types','service_type_id','p.status = any(array[''active'',''published''])','technicians','technician_id','c.is_published = true'),
      ('device_type_services','device_types','device_type_id','p.status = any(array[''active'',''published''])','services','service_id','c.status = ''active'''),
      ('device_type_products','device_types','device_type_id','p.status = any(array[''active'',''published''])','products','product_id','c.status = ''active'''),
      ('device_type_workshops','device_types','device_type_id','p.status = any(array[''active'',''published''])','workshops','workshop_id','c.status = ''published'''),
      ('device_type_technicians','device_types','device_type_id','p.status = any(array[''active'',''published''])','technicians','technician_id','c.is_published = true'),
      ('service_products','services','service_id','p.status = ''active''','products','product_id','c.status = ''active'''),
      ('service_workshops','services','service_id','p.status = ''active''','workshops','workshop_id','c.status = ''published'''),
      ('service_technicians','services','service_id','p.status = ''active''','technicians','technician_id','c.is_published = true'),
      ('product_workshops','products','product_id','p.status = ''active''','workshops','workshop_id','c.status = ''published'''),
      ('product_technicians','products','product_id','p.status = ''active''','technicians','technician_id','c.is_published = true'),
      ('workshop_technicians','workshops','workshop_id','p.status = ''published''','technicians','technician_id','c.is_published = true')
    ) as v(table_name,parent_table,parent_fk,parent_status,child_table,child_fk,child_status)
  loop
    for old_policy in select policyname from pg_policies where schemaname='public' and tablename=item.table_name and cmd='SELECT' loop
      execute format('drop policy if exists %I on public.%I',old_policy.policyname,item.table_name);
    end loop;
    execute format(
      'create policy role_visibility_read on public.%I for select to anon, authenticated using (
        private.is_site_admin()
        or (
          exists (select 1 from public.%I p where p.id = %I.%I and %s and private.user_can_view_visibility(p.visibility_roles))
          and exists (select 1 from public.%I c where c.id = %I.%I and %s and private.user_can_view_visibility(c.visibility_roles))
        )
      )',
      item.table_name,item.parent_table,item.table_name,item.parent_fk,item.parent_status,
      item.child_table,item.table_name,item.child_fk,item.child_status
    );
  end loop;

  -- Country assignments are also scoped to visible parent records and visible country records.
  for item in
    select * from (values
      ('service_type_countries','service_types','service_type_id','p.status = any(array[''active'',''published''])'),
      ('device_type_countries','device_types','device_type_id','p.status = any(array[''active'',''published''])'),
      ('service_countries','services','service_id','p.status = ''active'''),
      ('product_countries','products','product_id','p.status = ''active'''),
      ('workshop_countries','workshops','workshop_id','p.status = ''published'''),
      ('technician_countries','technicians','technician_id','p.is_published = true')
    ) as v(table_name,parent_table,parent_fk,parent_status)
  loop
    for old_policy in select policyname from pg_policies where schemaname='public' and tablename=item.table_name and cmd='SELECT' loop
      execute format('drop policy if exists %I on public.%I',old_policy.policyname,item.table_name);
    end loop;
    execute format(
      'create policy role_visibility_read on public.%I for select to anon, authenticated using (
        private.is_site_admin()
        or (
          exists (select 1 from public.%I p where p.id = %I.%I and %s and private.user_can_view_visibility(p.visibility_roles))
          and exists (select 1 from public.countries c where c.id = %I.country_id and c.status = ''active'' and private.user_can_view_visibility(c.visibility_roles))
        )
      )',
      item.table_name,item.parent_table,item.table_name,item.parent_fk,item.parent_status,item.table_name
    );
  end loop;
end $$;
