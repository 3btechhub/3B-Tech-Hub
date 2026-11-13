-- Add system slugs for contact detail routes without changing user-managed contact fields.
alter table public.contacts add column if not exists slug text;
update public.contacts
set slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')) || '-' || left(id::text,8)
where slug is null or btrim(slug) = '';
create unique index if not exists contacts_slug_key on public.contacts(slug);
alter table public.contacts alter column slug set not null;

insert into public.site_settings(setting_key,setting_value,is_public)
values (
 'home_sections',
 jsonb_build_object('services',true,'products',true,'workshops',true,'technicians',true,'contacts',true),
 true
)
on conflict(setting_key) do nothing;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare assigned_role text;
begin
  assigned_role := case when lower(coalesce(new.email,'')) = '3btechhub@gmail.com' then 'owner' else 'member' end;
  insert into public.user_roles(user_id,role) values(new.id,assigned_role) on conflict do nothing;
  insert into public.user_profiles(user_id,display_name)
  values(new.id, nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name','')),''))
  on conflict(user_id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_master_spec on auth.users;
create trigger on_auth_user_created_master_spec after insert on auth.users
for each row execute function private.handle_new_auth_user();
