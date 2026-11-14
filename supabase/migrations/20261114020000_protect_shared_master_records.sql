create or replace function private.protect_user_profile_self_update()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
begin
  if auth.role() = 'authenticated'
     and auth.uid() = old.auth_user_id
     and not private.is_site_owner() then
    if new.id is distinct from old.id
       or new.auth_user_id is distinct from old.auth_user_id
       or new.full_name is distinct from old.full_name
       or new.email is distinct from old.email
       or new.status is distinct from old.status
       or new.created_at is distinct from old.created_at then
      raise exception 'You may only update your own phone number.';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists protect_user_profile_self_update on public."Users";
create trigger protect_user_profile_self_update
before update on public."Users"
for each row execute function private.protect_user_profile_self_update();

do $$
declare r text; c text;
begin
  foreach r in array array[
    'service_type_countries','device_type_countries','service_countries',
    'product_countries','workshop_countries','technician_countries'
  ] loop
    select conname into c from pg_constraint
    where conrelid=format('public.%I',r)::regclass
      and contype='f'
      and confrelid='public.countries'::regclass
      and pg_get_constraintdef(oid) like '%country_id%'
    limit 1;
    if c is not null then
      execute format('alter table public.%I drop constraint %I',r,c);
      execute format('alter table public.%I add constraint %I foreign key(country_id) references public.countries(id) on delete restrict',r,r||'_country_id_fkey');
      c:=null;
    end if;
  end loop;
  foreach r in array array['services','products','workshops','technicians'] loop
    select conname into c from pg_constraint
    where conrelid=format('public.%I',r)::regclass
      and contype='f'
      and confrelid='public.locations'::regclass
      and pg_get_constraintdef(oid) like '%location_id%'
    limit 1;
    if c is not null then
      execute format('alter table public.%I drop constraint %I',r,c);
      execute format('alter table public.%I add constraint %I foreign key(location_id) references public.locations(id) on delete restrict',r,r||'_location_id_fkey');
      c:=null;
    end if;
  end loop;
end $$;

alter table public.locations drop constraint if exists locations_country_id_fkey;
alter table public.locations add constraint locations_country_id_fkey
  foreign key(country_id) references public.countries(id) on delete restrict;