-- Safe hardening: least-privilege grants, Owner-only role administration,
-- append-only audit events, and missing timestamp/foreign-key indexes.
-- No existing business rows are deleted or rewritten.

create or replace function private.is_site_owner()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

revoke all on function private.is_site_owner() from public;
grant execute on function private.is_site_owner() to authenticated;

-- Only the Owner may change role assignments. Admins cannot promote themselves.
drop policy if exists roles_admin_insert on public.user_roles;
drop policy if exists roles_admin_update on public.user_roles;
drop policy if exists roles_admin_delete on public.user_roles;
drop policy if exists roles_owner_insert on public.user_roles;
drop policy if exists roles_owner_update on public.user_roles;
drop policy if exists roles_owner_delete on public.user_roles;

create policy roles_owner_insert
  on public.user_roles for insert to authenticated
  with check (private.is_site_owner() and role <> 'owner');

create policy roles_owner_update
  on public.user_roles for update to authenticated
  using (private.is_site_owner())
  with check (private.is_site_owner() and role <> 'owner');

-- Protect the designated primary Owner account from demotion or deletion.
create or replace function private.protect_primary_owner_role()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $
declare
  primary_owner boolean;
begin
  if old.role = 'owner' then
    select lower(email) = '3btechhub@gmail.com'
      into primary_owner
    from auth.users
    where id = old.user_id;

    if coalesce(primary_owner, false) then
      raise exception 'The primary Owner role cannot be changed or removed';
    end if;
    if tg_op = 'DELETE' then
      raise exception 'Owner role assignments cannot be deleted';
    end if;
    if new.role <> 'owner' or new.user_id <> old.user_id then
      raise exception 'Owner role assignments cannot be changed';
    end if;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$;

revoke all on function private.protect_primary_owner_role() from public, anon, authenticated;
drop trigger if exists protect_primary_owner_role on public.user_roles;
create trigger protect_primary_owner_role
  before update or delete on public.user_roles
  for each row execute function private.protect_primary_owner_role();

create policy roles_owner_delete
  on public.user_roles for delete to authenticated
  using (private.is_site_owner());

-- Remove broad default grants. RLS remains the row-level authorization boundary.
revoke all on table
  public.user_profiles,
  public.user_roles,
  public.site_content,
  public.products,
  public.services,
  public.media_assets,
  public.site_settings,
  public.audit_logs,
  public.workshops,
  public.technicians
from anon, authenticated;

grant select on table
  public.site_content,
  public.products,
  public.services,
  public.media_assets,
  public.site_settings,
  public.workshops,
  public.technicians
to anon;

grant select on table
  public.user_profiles,
  public.user_roles,
  public.site_content,
  public.products,
  public.services,
  public.media_assets,
  public.site_settings,
  public.audit_logs,
  public.workshops,
  public.technicians
to authenticated;

grant insert, update, delete on table
  public.user_profiles,
  public.user_roles,
  public.site_content,
  public.products,
  public.services,
  public.media_assets,
  public.site_settings,
  public.workshops,
  public.technicians
to authenticated;

-- Anonymous visitors may read approved public objects, never write Storage objects.
revoke all on table storage.objects from anon, authenticated;
grant select on table storage.objects to anon, authenticated;
grant insert, update, delete on table storage.objects to authenticated;

-- Ensure updated_at is maintained by the database for these editable modules.
drop trigger if exists workshops_set_updated_at on public.workshops;
create trigger workshops_set_updated_at
  before update on public.workshops
  for each row execute function public.set_updated_at();

drop trigger if exists technicians_set_updated_at on public.technicians;
create trigger technicians_set_updated_at
  before update on public.technicians
  for each row execute function public.set_updated_at();

-- Cover the foreign keys flagged by the Supabase performance advisor.
create index if not exists workshops_created_by_idx
  on public.workshops(created_by);
create index if not exists workshops_updated_by_idx
  on public.workshops(updated_by);

-- Audit function stores only the resource identifier and changed column names.
-- It deliberately does not copy profile values, contact details or complete rows.
create or replace function private.capture_audit_event()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  old_row jsonb;
  new_row jsonb;
  resource_id text;
  changed_columns text[];
begin
  if tg_op = 'INSERT' then
    new_row := to_jsonb(new);
    resource_id := coalesce(new_row ->> 'id', new_row ->> 'user_id', new_row ->> 'setting_key');
    changed_columns := array(
      select item.key
      from jsonb_object_keys(new_row) as item(key)
      where item.key not in ('created_at', 'updated_at')
    );
  elsif tg_op = 'UPDATE' then
    old_row := to_jsonb(old);
    new_row := to_jsonb(new);
    resource_id := coalesce(new_row ->> 'id', new_row ->> 'user_id', new_row ->> 'setting_key');
    select array_agg(item.key order by item.key)
      into changed_columns
    from jsonb_object_keys(new_row) as item(key)
    where old_row -> item.key is distinct from new_row -> item.key
      and item.key <> 'updated_at';

    if coalesce(cardinality(changed_columns), 0) = 0 then
      return new;
    end if;
  else
    old_row := to_jsonb(old);
    resource_id := coalesce(old_row ->> 'id', old_row ->> 'user_id', old_row ->> 'setting_key');
    changed_columns := array[]::text[];
  end if;

  insert into public.audit_logs(actor_id, action, resource_type, resource_id, metadata)
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_argv[0],
    resource_id,
    jsonb_build_object('changed_columns', coalesce(to_jsonb(changed_columns), '[]'::jsonb))
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.capture_audit_event() from public, anon, authenticated;

drop trigger if exists audit_site_content_changes on public.site_content;
create trigger audit_site_content_changes
  after insert or update or delete on public.site_content
  for each row execute function private.capture_audit_event('site_content');

drop trigger if exists audit_product_changes on public.products;
create trigger audit_product_changes
  after insert or update or delete on public.products
  for each row execute function private.capture_audit_event('products');

drop trigger if exists audit_service_changes on public.services;
create trigger audit_service_changes
  after insert or update or delete on public.services
  for each row execute function private.capture_audit_event('services');

drop trigger if exists audit_workshop_changes on public.workshops;
create trigger audit_workshop_changes
  after insert or update or delete on public.workshops
  for each row execute function private.capture_audit_event('workshops');

drop trigger if exists audit_technician_changes on public.technicians;
create trigger audit_technician_changes
  after insert or update or delete on public.technicians
  for each row execute function private.capture_audit_event('technicians');

drop trigger if exists audit_user_role_changes on public.user_roles;
create trigger audit_user_role_changes
  after insert or update or delete on public.user_roles
  for each row execute function private.capture_audit_event('user_roles');

drop trigger if exists audit_user_profile_changes on public.user_profiles;
create trigger audit_user_profile_changes
  after insert or update or delete on public.user_profiles
  for each row execute function private.capture_audit_event('user_profiles');

drop trigger if exists audit_media_asset_changes on public.media_assets;
create trigger audit_media_asset_changes
  after insert or update or delete on public.media_assets
  for each row execute function private.capture_audit_event('media_assets');

drop trigger if exists audit_site_setting_changes on public.site_settings;
create trigger audit_site_setting_changes
  after insert or update or delete on public.site_settings
  for each row execute function private.capture_audit_event('site_settings');
