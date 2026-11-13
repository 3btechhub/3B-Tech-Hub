create or replace function private.protect_system_role()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
begin
  if old.slug='owner' then
    if tg_op='DELETE' then raise exception 'The Owner role cannot be deleted'; end if;
    if new.slug is distinct from old.slug or new.is_active is distinct from true then
      raise exception 'The Owner role cannot be renamed or deactivated';
    end if;
  end if;
  if tg_op='UPDATE' and old.is_active is distinct from new.is_active and new.is_active=false
     and exists(select 1 from public.user_roles where role=old.slug) then
    raise exception 'A role assigned to users cannot be deactivated';
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function private.protect_system_role() from public, anon, authenticated;
