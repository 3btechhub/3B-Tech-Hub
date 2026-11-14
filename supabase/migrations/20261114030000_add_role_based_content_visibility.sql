-- Role-based content visibility with an immutable Owner selection and an explicit public Visitor role.
-- Existing published/public content remains visible to visitors by default.

insert into public."Roles"(name,slug,description,is_active,is_system)
values ('Visitor','visitor','Unauthenticated public website visitor.',true,true)
on conflict (slug) do update
set name=excluded.name, description=excluded.description, is_active=true, is_system=true;

alter table public.countries add column if not exists visibility_roles text[] not null default array['owner','visitor']::text[];
alter table public.locations add column if not exists visibility_roles text[] not null default array['owner','visitor']::text[];
alter table public.service_types add column if not exists visibility_roles text[] not null default array['owner','visitor']::text[];
alter table public.device_types add column if not exists visibility_roles text[] not null default array['owner','visitor']::text[];
alter table public.services add column if not exists visibility_roles text[] not null default array['owner','visitor']::text[];
alter table public.products add column if not exists visibility_roles text[] not null default array['owner','visitor']::text[];
alter table public.workshops add column if not exists visibility_roles text[] not null default array['owner','visitor']::text[];
alter table public.technicians add column if not exists visibility_roles text[] not null default array['owner','visitor']::text[];
alter table public.contacts add column if not exists visibility_roles text[] not null default array['owner','visitor']::text[];
alter table public."Settings" add column if not exists visibility_roles text[] not null default array['owner','visitor']::text[];

create or replace function private.user_can_view_visibility(p_visibility_roles text[])
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select case
    when (select auth.uid()) is null then 'visitor' = any(coalesce(p_visibility_roles, array['owner']::text[]))
    else exists (
      select 1
      from public.user_roles ur
      join public."Roles" r on r.slug = ur.role and r.is_active
      where ur.user_id = (select auth.uid())
        and ur.role = any(coalesce(p_visibility_roles, array['owner']::text[]))
    )
  end;
$$;
revoke all on function private.user_can_view_visibility(text[]) from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.user_can_view_visibility(text[]) to anon, authenticated;

create or replace function private.enforce_visibility_roles()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.visibility_roles is null then
    new.visibility_roles := array['owner']::text[];
  end if;
  if not ('owner' = any(new.visibility_roles)) then
    raise exception 'Owner must always be included in content visibility';
  end if;
  if exists (
    select 1
    from unnest(new.visibility_roles) selected(slug)
    where not exists (
      select 1 from public."Roles" r
      where r.slug = selected.slug and r.is_active = true
    )
  ) then
    raise exception 'Visibility can contain active existing roles only';
  end if;
  select coalesce(array_agg(distinct role_slug order by role_slug), array['owner']::text[])
    into new.visibility_roles
  from unnest(new.visibility_roles) role_slug;
  return new;
end;
$$;
revoke all on function private.enforce_visibility_roles() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['countries','locations','service_types','device_types','services','products','workshops','technicians','contacts','Settings'] loop
    execute format('drop trigger if exists enforce_visibility_roles on public.%I', t);
    execute format('create trigger enforce_visibility_roles before insert or update of visibility_roles on public.%I for each row execute function private.enforce_visibility_roles()', t);
  end loop;
end $$;

create or replace function private.protect_visibility_system_roles()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if old.slug in ('owner','visitor') then
    if tg_op = 'DELETE' then raise exception 'The % role is a protected system role', old.name; end if;
    if new.slug is distinct from old.slug or new.is_active is distinct from true or new.is_system is distinct from true then
      raise exception 'The % role cannot be renamed, deactivated, or made non-system', old.name;
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function private.protect_visibility_system_roles() from public, anon, authenticated;
drop trigger if exists protect_visibility_system_roles on public."Roles";
create trigger protect_visibility_system_roles before update or delete on public."Roles"
for each row execute function private.protect_visibility_system_roles();

-- Replace the former public-read rules with status AND role visibility checks.
drop policy if exists countries_public_read on public.countries;
create policy countries_public_read on public.countries for select to anon, authenticated
using (status = 'active' and private.user_can_view_visibility(visibility_roles));

drop policy if exists locations_public_read on public.locations;
create policy locations_public_read on public.locations for select to anon, authenticated
using (status = 'active' and private.user_can_view_visibility(visibility_roles));

drop policy if exists "Public can read visible service types" on public.service_types;
create policy "Public can read visible service types" on public.service_types for select to anon, authenticated
using (status = any(array['active','published']) and private.user_can_view_visibility(visibility_roles));

drop policy if exists "Public can read visible device types" on public.device_types;
create policy "Public can read visible device types" on public.device_types for select to anon, authenticated
using (status = any(array['active','published']) and private.user_can_view_visibility(visibility_roles));

drop policy if exists services_public_read_active on public.services;
create policy services_public_read_active on public.services for select to anon, authenticated
using ((status = 'active' and private.user_can_view_visibility(visibility_roles)) or private.is_site_admin());

drop policy if exists products_public_read_active on public.products;
create policy products_public_read_active on public.products for select to anon, authenticated
using ((status = 'active' and private.user_can_view_visibility(visibility_roles)) or private.is_site_admin());

drop policy if exists workshops_public_read_published on public.workshops;
create policy workshops_public_read_published on public.workshops for select to anon, authenticated
using ((status = 'published' and private.user_can_view_visibility(visibility_roles)) or private.is_site_admin());

drop policy if exists technicians_public_read_published on public.technicians;
create policy technicians_public_read_published on public.technicians for select to anon, authenticated
using ((is_published = true and private.user_can_view_visibility(visibility_roles)) or private.is_site_admin());

drop policy if exists contacts_public_read on public.contacts;
create policy contacts_public_read on public.contacts for select to anon, authenticated
using (private.user_can_view_visibility(visibility_roles));

drop policy if exists settings_public_read on public."Settings";
create policy settings_public_read on public."Settings" for select to anon, authenticated
using (
  setting_key = any(array['site_profile','home_intro','runtime_config'])
  and private.user_can_view_visibility(visibility_roles)
);
