drop policy if exists contacts_owner_manage on public.contacts;
create policy contacts_owner_insert on public.contacts for insert to authenticated with check (private.is_site_owner());
create policy contacts_owner_update on public.contacts for update to authenticated using (private.is_site_owner()) with check (private.is_site_owner());
create policy contacts_owner_delete on public.contacts for delete to authenticated using (private.is_site_owner());

drop policy if exists app_roles_owner_manage on public.app_roles;
create policy app_roles_owner_insert on public.app_roles for insert to authenticated with check (private.is_site_owner());
create policy app_roles_owner_update on public.app_roles for update to authenticated using (private.is_site_owner()) with check (private.is_site_owner());
create policy app_roles_owner_delete on public.app_roles for delete to authenticated using (private.is_site_owner());

drop policy if exists permissions_owner_manage on public.permissions;
create policy permissions_owner_insert on public.permissions for insert to authenticated with check (private.is_site_owner());
create policy permissions_owner_update on public.permissions for update to authenticated using (private.is_site_owner()) with check (private.is_site_owner());
create policy permissions_owner_delete on public.permissions for delete to authenticated using (private.is_site_owner());

drop policy if exists role_permissions_owner_manage on public.role_permissions;
create policy role_permissions_owner_insert on public.role_permissions for insert to authenticated with check (private.is_site_owner());
create policy role_permissions_owner_update on public.role_permissions for update to authenticated using (private.is_site_owner()) with check (private.is_site_owner());
create policy role_permissions_owner_delete on public.role_permissions for delete to authenticated using (private.is_site_owner());

create index if not exists role_permissions_permission_id_idx on public.role_permissions(permission_id);
