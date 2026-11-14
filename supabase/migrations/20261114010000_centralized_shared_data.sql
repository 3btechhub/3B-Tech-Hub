
create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  is_global boolean not null default false,
  status text not null default 'active' check (status in ('active','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_id uuid references public.countries(id) on delete set null,
  address text,
  status text not null default 'active' check (status in ('active','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists locations_name_country_uidx
  on public.locations (lower(name), coalesce(country_id, '00000000-0000-0000-0000-000000000000'::uuid));

insert into public.countries(name,code,is_global,status) values
 ('Global','GLOBAL',true,'active'),
 ('Bangladesh','BD',false,'active'),
 ('Saudi Arabia','SA',false,'active')
on conflict (name) do update set code=excluded.code,is_global=excluded.is_global,status='active',updated_at=now();

create table if not exists public.service_type_countries (
  service_type_id uuid not null references public.service_types(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(service_type_id,country_id)
);
create table if not exists public.device_type_countries (
  device_type_id uuid not null references public.device_types(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(device_type_id,country_id)
);
create table if not exists public.service_countries (
  service_id uuid not null references public.services(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(service_id,country_id)
);
create table if not exists public.product_countries (
  product_id uuid not null references public.products(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(product_id,country_id)
);
create table if not exists public.workshop_countries (
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(workshop_id,country_id)
);
create table if not exists public.technician_countries (
  technician_id uuid not null references public.technicians(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(technician_id,country_id)
);

alter table public.services add column if not exists location_id uuid references public.locations(id) on delete set null;
alter table public.products add column if not exists location_id uuid references public.locations(id) on delete set null;
alter table public.workshops add column if not exists location_id uuid references public.locations(id) on delete set null;
alter table public.technicians add column if not exists location_id uuid references public.locations(id) on delete set null;

insert into public.locations(name,country_id,status)
select distinct trim(x.location), c.id, 'active'
from (
  select location,country from public.services where nullif(trim(location),'') is not null
  union all select location,country from public.products where nullif(trim(location),'') is not null
  union all select location,country from public.workshops where nullif(trim(location),'') is not null
  union all select location,country from public.technicians where nullif(trim(location),'') is not null
) x
left join public.countries c
  on c.name = any(regexp_split_to_array(coalesce(x.country,''), '\s*,\s*'))
where not exists (
  select 1 from public.locations l
  where lower(l.name)=lower(trim(x.location))
    and l.country_id is not distinct from c.id
);

update public.services s set location_id=l.id from public.locations l
where s.location_id is null and nullif(trim(s.location),'') is not null and lower(l.name)=lower(trim(s.location))
  and (l.country_id is null or l.country_id in (select c.id from public.countries c where c.name=any(regexp_split_to_array(coalesce(s.country,''),'\s*,\s*'))));
update public.products p set location_id=l.id from public.locations l
where p.location_id is null and nullif(trim(p.location),'') is not null and lower(l.name)=lower(trim(p.location))
  and (l.country_id is null or l.country_id in (select c.id from public.countries c where c.name=any(regexp_split_to_array(coalesce(p.country,''),'\s*,\s*'))));
update public.workshops w set location_id=l.id from public.locations l
where w.location_id is null and nullif(trim(w.location),'') is not null and lower(l.name)=lower(trim(w.location))
  and (l.country_id is null or l.country_id in (select c.id from public.countries c where c.name=any(regexp_split_to_array(coalesce(w.country,''),'\s*,\s*'))));
update public.technicians t set location_id=l.id from public.locations l
where t.location_id is null and nullif(trim(t.location),'') is not null and lower(l.name)=lower(trim(t.location))
  and (l.country_id is null or l.country_id in (select c.id from public.countries c where c.name=any(regexp_split_to_array(coalesce(t.country,''),'\s*,\s*'))));

insert into public.service_type_countries(service_type_id,country_id)
select distinct x.id,c.id from public.service_types x
cross join lateral unnest(string_to_array(coalesce(x.country,''),',')) v(name)
join public.countries c on lower(c.name)=lower(trim(v.name))
on conflict do nothing;
insert into public.device_type_countries(device_type_id,country_id)
select distinct x.id,c.id from public.device_types x
cross join lateral unnest(string_to_array(coalesce(x.country,''),',')) v(name)
join public.countries c on lower(c.name)=lower(trim(v.name))
on conflict do nothing;
insert into public.service_countries(service_id,country_id)
select distinct x.id,c.id from public.services x
cross join lateral unnest(string_to_array(coalesce(x.country,''),',')) v(name)
join public.countries c on lower(c.name)=lower(trim(v.name))
on conflict do nothing;
insert into public.product_countries(product_id,country_id)
select distinct x.id,c.id from public.products x
cross join lateral unnest(string_to_array(coalesce(x.country,''),',')) v(name)
join public.countries c on lower(c.name)=lower(trim(v.name))
on conflict do nothing;
insert into public.workshop_countries(workshop_id,country_id)
select distinct x.id,c.id from public.workshops x
cross join lateral unnest(string_to_array(coalesce(x.country,''),',')) v(name)
join public.countries c on lower(c.name)=lower(trim(v.name))
on conflict do nothing;
insert into public.technician_countries(technician_id,country_id)
select distinct x.id,c.id from public.technicians x
cross join lateral unnest(string_to_array(coalesce(x.country,''),',')) v(name)
join public.countries c on lower(c.name)=lower(trim(v.name))
on conflict do nothing;

create table if not exists public.contact_points (
  id uuid primary key default gen_random_uuid(),
  contact_type text not null check (contact_type in ('phone','whatsapp','email','website')),
  label text,
  value text not null,
  normalized_value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(contact_type,normalized_value)
);
create table if not exists public.service_contacts (
  service_id uuid not null references public.services(id) on delete cascade,
  contact_id uuid not null references public.contact_points(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(service_id,contact_id)
);
create table if not exists public.product_contacts (
  product_id uuid not null references public.products(id) on delete cascade,
  contact_id uuid not null references public.contact_points(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(product_id,contact_id)
);
create table if not exists public.workshop_contacts (
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  contact_id uuid not null references public.contact_points(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(workshop_id,contact_id)
);
create table if not exists public.technician_contacts (
  technician_id uuid not null references public.technicians(id) on delete cascade,
  contact_id uuid not null references public.contact_points(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(technician_id,contact_id)
);

with raw_contacts as (
  select 'phone'::text contact_type, phone value from public.services
  union all select 'whatsapp',whatsapp from public.services
  union all select 'phone',phone from public.products
  union all select 'whatsapp',whatsapp from public.products
  union all select 'phone',phone from public.workshops
  union all select 'whatsapp',whatsapp from public.workshops
  union all select 'phone',phone from public.technicians
  union all select 'whatsapp',whatsapp from public.technicians
  union all select 'email',email from public.technicians
  union all select 'website',link from public.technicians
)
insert into public.contact_points(contact_type,value,normalized_value)
select distinct contact_type,trim(value),lower(trim(value))
from raw_contacts
where nullif(trim(value),'') is not null
on conflict(contact_type,normalized_value) do nothing;

insert into public.technician_contacts(technician_id,contact_id)
select t.id,cp.id from public.technicians t
cross join lateral (values ('phone',t.phone),('whatsapp',t.whatsapp),('email',t.email),('website',t.link)) v(contact_type,value)
join public.contact_points cp on cp.contact_type=v.contact_type and cp.normalized_value=lower(trim(v.value))
where nullif(trim(v.value),'') is not null
on conflict do nothing;

alter table public."Users" add column if not exists phone text;
alter table public."Roles" add column if not exists is_system boolean not null default false;

insert into public."Roles"(id,name,slug,description,is_active,is_system)
select rp.role_id,
       'Legacy Role Review',
       'legacy-role-review',
       'Recovered role_permissions references. Confirm the original role meaning before activation.',
       false,
       true
from (select distinct role_id from public.role_permissions) rp
where not exists (select 1 from public."Roles" r where r.id=rp.role_id)
on conflict(id) do nothing;

insert into public."Roles"(name,slug,description,is_active,is_system)
values ('Owner','owner','Primary website owner role.',true,true),
       ('Member','member','Standard registered user role.',true,true)
on conflict(slug) do update set name=excluded.name,is_active=true,is_system=true,updated_at=now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.role_permissions'::regclass
      and conname='role_permissions_role_id_fkey'
  ) then
    alter table public.role_permissions
      add constraint role_permissions_role_id_fkey
      foreign key(role_id) references public."Roles"(id) on delete cascade;
  end if;
end $$;

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null references public."Roles"(slug) on update cascade on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key(user_id,role)
);

insert into public."Users"(auth_user_id,full_name,email,status)
select u.id,
       coalesce(nullif(u.raw_user_meta_data->>'full_name',''),nullif(u.raw_user_meta_data->>'name',''),split_part(coalesce(u.email,''),'@',1)),
       coalesce(u.email,''),
       'active'
from auth.users u
on conflict(auth_user_id) do update
set full_name=excluded.full_name,email=excluded.email,updated_at=now();

insert into public.user_roles(user_id,role)
select id,'owner' from auth.users where lower(email)='3btechhub@gmail.com'
on conflict do nothing;
insert into public.user_roles(user_id,role)
select id,'member' from auth.users where lower(coalesce(email,''))<>'3btechhub@gmail.com'
on conflict do nothing;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.countries enable row level security;
alter table public.locations enable row level security;
alter table public.contact_points enable row level security;
alter table public.service_type_countries enable row level security;
alter table public.device_type_countries enable row level security;
alter table public.service_countries enable row level security;
alter table public.product_countries enable row level security;
alter table public.workshop_countries enable row level security;
alter table public.technician_countries enable row level security;
alter table public.service_contacts enable row level security;
alter table public.product_contacts enable row level security;
alter table public.workshop_contacts enable row level security;
alter table public.technician_contacts enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_logs enable row level security;

create policy countries_public_read on public.countries for select to anon,authenticated using(status='active');
create policy countries_owner_manage on public.countries for all to authenticated using(private.is_site_owner()) with check(private.is_site_owner());
create policy locations_public_read on public.locations for select to anon,authenticated using(status='active');
create policy locations_owner_manage on public.locations for all to authenticated using(private.is_site_owner()) with check(private.is_site_owner());
create policy contact_points_owner_manage on public.contact_points for all to authenticated using(private.is_site_owner()) with check(private.is_site_owner());
create policy user_roles_owner_manage on public.user_roles for all to authenticated using(private.is_site_owner()) with check(private.is_site_owner());
create policy audit_logs_owner_read on public.audit_logs for select to authenticated using(private.is_site_owner());

create policy users_owner_read on public."Users" for select to authenticated using(private.is_site_owner());
create policy users_owner_insert on public."Users" for insert to authenticated with check(private.is_site_owner());
create policy users_owner_update on public."Users" for update to authenticated using(private.is_site_owner()) with check(private.is_site_owner());
create policy users_owner_delete on public."Users" for delete to authenticated using(private.is_site_owner());
create policy roles_owner_read on public."Roles" for select to authenticated using(private.is_site_owner());
create policy roles_owner_insert on public."Roles" for insert to authenticated with check(private.is_site_owner());
create policy roles_owner_update on public."Roles" for update to authenticated using(private.is_site_owner()) with check(private.is_site_owner());
create policy roles_owner_delete on public."Roles" for delete to authenticated using(private.is_site_owner());

create policy settings_public_read on public."Settings" for select to anon,authenticated
  using(setting_key in ('site_profile','home_intro','runtime_config'));
create policy settings_owner_manage on public."Settings" for all to authenticated
  using(private.is_site_owner()) with check(private.is_site_owner());

do $$
declare t text;
begin
  foreach t in array array[
    'service_type_countries','device_type_countries','service_countries',
    'product_countries','workshop_countries','technician_countries'
  ] loop
    execute format('create policy %I on public.%I for select to anon,authenticated using (true)',t||'_public_read',t);
    execute format('create policy %I on public.%I for all to authenticated using (private.is_site_owner()) with check (private.is_site_owner())',t||'_owner_manage',t);
  end loop;
  foreach t in array array[
    'service_contacts','product_contacts','workshop_contacts','technician_contacts'
  ] loop
    execute format('create policy %I on public.%I for all to authenticated using (private.is_site_owner()) with check (private.is_site_owner())',t||'_owner_manage',t);
  end loop;
end $$;

create index if not exists locations_country_id_idx on public.locations(country_id);
create index if not exists service_type_countries_country_id_idx on public.service_type_countries(country_id);
create index if not exists device_type_countries_country_id_idx on public.device_type_countries(country_id);
create index if not exists service_countries_country_id_idx on public.service_countries(country_id);
create index if not exists product_countries_country_id_idx on public.product_countries(country_id);
create index if not exists workshop_countries_country_id_idx on public.workshop_countries(country_id);
create index if not exists technician_countries_country_id_idx on public.technician_countries(country_id);
create index if not exists user_roles_role_idx on public.user_roles(role);
