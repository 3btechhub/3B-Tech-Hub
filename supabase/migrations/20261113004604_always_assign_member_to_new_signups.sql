create or replace function private.handle_new_auth_user()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
begin
  insert into public.user_roles(user_id,role) values(new.id,'member') on conflict do nothing;
  insert into public.user_profiles(user_id,display_name)
  values(new.id,nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name','')),''))
  on conflict(user_id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
