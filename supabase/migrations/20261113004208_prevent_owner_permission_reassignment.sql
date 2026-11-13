create or replace function private.protect_owner_permissions()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
begin
  if exists(select 1 from public.app_roles where id=old.role_id and slug='owner') then
    if tg_op='DELETE' then raise exception 'Owner permissions cannot be removed'; end if;
    if new.role_id is distinct from old.role_id or new.permission_id is distinct from old.permission_id then
      raise exception 'Owner permissions cannot be reassigned';
    end if;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function private.protect_owner_permissions() from public, anon, authenticated;
drop trigger if exists protect_owner_permissions on public.role_permissions;
create trigger protect_owner_permissions before update or delete on public.role_permissions
for each row execute function private.protect_owner_permissions();
