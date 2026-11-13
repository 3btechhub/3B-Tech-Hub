alter table public.audit_logs
  add column if not exists result text not null default 'success',
  add column if not exists device text not null default 'unknown';

create or replace function private.protect_system_role()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
begin
  if old.slug = 'owner' then
    if tg_op = 'DELETE' then raise exception 'The Owner role cannot be deleted'; end if;
    if new.slug <> old.slug or new.is_active is distinct from true then
      raise exception 'The Owner role cannot be renamed or deactivated';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function private.protect_system_role() from public, anon, authenticated;
drop trigger if exists protect_system_role on public.app_roles;
create trigger protect_system_role before update or delete on public.app_roles
for each row execute function private.protect_system_role();

create or replace function private.protect_owner_permissions()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
begin
  if exists(select 1 from public.app_roles where id=old.role_id and slug='owner') then
    raise exception 'Owner permissions cannot be removed';
  end if;
  return old;
end;
$$;
revoke all on function private.protect_owner_permissions() from public, anon, authenticated;
drop trigger if exists protect_owner_permissions on public.role_permissions;
create trigger protect_owner_permissions before delete on public.role_permissions
for each row execute function private.protect_owner_permissions();

drop trigger if exists audit_app_role_changes on public.app_roles;
create trigger audit_app_role_changes after insert or update or delete on public.app_roles
for each row execute function private.capture_audit_event('app_roles');
drop trigger if exists audit_permission_changes on public.permissions;
create trigger audit_permission_changes after insert or update or delete on public.permissions
for each row execute function private.capture_audit_event('permissions');
drop trigger if exists audit_role_permission_changes on public.role_permissions;
create trigger audit_role_permission_changes after insert or update or delete on public.role_permissions
for each row execute function private.capture_audit_event('role_permissions');
