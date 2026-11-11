-- Harden RLS helper visibility and remove overlapping permissive policies.
create schema if not exists private;
create or replace function private.is_site_admin()
returns boolean language sql stable security definer set search_path=public,auth as $$
  select exists(select 1 from public.user_roles where user_id=(select auth.uid()) and role in ('owner','admin'));
$$;
revoke all on function private.is_site_admin() from public;
grant usage on schema private to anon,authenticated;
grant execute on function private.is_site_admin() to anon,authenticated;

-- Drop all old policies before removing the old exposed helper.
drop policy if exists profile_select_self_or_admin on public.user_profiles;
drop policy if exists roles_select_self_or_admin on public.user_roles;
drop policy if exists roles_admin_manage on public.user_roles;
drop policy if exists content_public_read_published on public.site_content;
drop policy if exists content_admin_manage on public.site_content;
drop policy if exists products_public_read_active on public.products;
drop policy if exists products_admin_manage on public.products;
drop policy if exists services_public_read_active on public.services;
drop policy if exists services_admin_manage on public.services;
drop policy if exists bookings_customer_read_own on public.service_bookings;
drop policy if exists bookings_admin_manage on public.service_bookings;
drop policy if exists media_public_read on public.media_assets;
drop policy if exists media_admin_manage on public.media_assets;
drop policy if exists settings_public_read on public.site_settings;
drop policy if exists settings_admin_manage on public.site_settings;
drop policy if exists audit_admin_read on public.audit_logs;
drop policy if exists site_media_admin_insert on storage.objects;
drop policy if exists site_media_admin_update on storage.objects;
drop policy if exists site_media_admin_delete on storage.objects;

drop function if exists public.is_site_admin();

create policy profile_select_self_or_admin on public.user_profiles for select to authenticated using(user_id=(select auth.uid()) or private.is_site_admin());
create policy roles_select_self_or_admin on public.user_roles for select to authenticated using(user_id=(select auth.uid()) or private.is_site_admin());
create policy roles_admin_insert on public.user_roles for insert to authenticated with check(private.is_site_admin());
create policy roles_admin_update on public.user_roles for update to authenticated using(private.is_site_admin()) with check(private.is_site_admin());
create policy roles_admin_delete on public.user_roles for delete to authenticated using(private.is_site_admin());

create policy content_public_read_published on public.site_content for select to anon,authenticated using(status='published' or private.is_site_admin());
create policy content_admin_insert on public.site_content for insert to authenticated with check(private.is_site_admin());
create policy content_admin_update on public.site_content for update to authenticated using(private.is_site_admin()) with check(private.is_site_admin());
create policy content_admin_delete on public.site_content for delete to authenticated using(private.is_site_admin());

create policy products_public_read_active on public.products for select to anon,authenticated using(status='active' or private.is_site_admin());
create policy products_admin_insert on public.products for insert to authenticated with check(private.is_site_admin());
create policy products_admin_update on public.products for update to authenticated using(private.is_site_admin()) with check(private.is_site_admin());
create policy products_admin_delete on public.products for delete to authenticated using(private.is_site_admin());

create policy services_public_read_active on public.services for select to anon,authenticated using(status='active' or private.is_site_admin());
create policy services_admin_insert on public.services for insert to authenticated with check(private.is_site_admin());
create policy services_admin_update on public.services for update to authenticated using(private.is_site_admin()) with check(private.is_site_admin());
create policy services_admin_delete on public.services for delete to authenticated using(private.is_site_admin());

create policy bookings_customer_read_own on public.service_bookings for select to authenticated using(user_id=(select auth.uid()) or private.is_site_admin());
create policy bookings_admin_insert on public.service_bookings for insert to authenticated with check(private.is_site_admin());
create policy bookings_admin_update on public.service_bookings for update to authenticated using(private.is_site_admin()) with check(private.is_site_admin());
create policy bookings_admin_delete on public.service_bookings for delete to authenticated using(private.is_site_admin());

create policy media_public_read on public.media_assets for select to anon,authenticated using(is_public or uploaded_by=(select auth.uid()) or private.is_site_admin());
create policy media_admin_insert on public.media_assets for insert to authenticated with check(private.is_site_admin());
create policy media_admin_update on public.media_assets for update to authenticated using(private.is_site_admin()) with check(private.is_site_admin());
create policy media_admin_delete on public.media_assets for delete to authenticated using(private.is_site_admin());

create policy settings_public_read on public.site_settings for select to anon,authenticated using(is_public or private.is_site_admin());
create policy settings_admin_insert on public.site_settings for insert to authenticated with check(private.is_site_admin());
create policy settings_admin_update on public.site_settings for update to authenticated using(private.is_site_admin()) with check(private.is_site_admin());
create policy settings_admin_delete on public.site_settings for delete to authenticated using(private.is_site_admin());

create policy audit_admin_read on public.audit_logs for select to authenticated using(private.is_site_admin());

create policy site_media_admin_insert on storage.objects for insert to authenticated with check(bucket_id='site-media' and private.is_site_admin());
create policy site_media_admin_update on storage.objects for update to authenticated using(bucket_id='site-media' and private.is_site_admin()) with check(bucket_id='site-media' and private.is_site_admin());
create policy site_media_admin_delete on storage.objects for delete to authenticated using(bucket_id='site-media' and private.is_site_admin());

create index if not exists user_roles_created_by_idx on public.user_roles(created_by);
create index if not exists site_content_created_by_idx on public.site_content(created_by);
create index if not exists site_content_updated_by_idx on public.site_content(updated_by);
create index if not exists media_assets_uploaded_by_idx on public.media_assets(uploaded_by);
create index if not exists service_bookings_service_id_idx on public.service_bookings(service_id);
create index if not exists site_settings_updated_by_idx on public.site_settings(updated_by);
create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);

