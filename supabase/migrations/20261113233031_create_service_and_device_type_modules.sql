create table if not exists public.service_types (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(btrim(title)) between 1 and 160),
 slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,159}$'),
 country text not null default 'Global',
 photo_url text, gallery_urls text[] not null default '{}',
 status text not null default 'active' check (status in ('active','draft','published')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.device_types (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(btrim(title)) between 1 and 160),
 slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,159}$'),
 country text not null default 'Global',
 photo_url text, gallery_urls text[] not null default '{}',
 status text not null default 'active' check (status in ('active','draft','published')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.service_type_device_types (
 service_type_id uuid not null references public.service_types(id) on delete cascade,
 device_type_id uuid not null references public.device_types(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(service_type_id,device_type_id)
);
create table if not exists public.service_type_services (
 service_type_id uuid not null references public.service_types(id) on delete cascade,
 service_id uuid not null references public.services(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(service_type_id,service_id)
);
create table if not exists public.service_type_products (
 service_type_id uuid not null references public.service_types(id) on delete cascade,
 product_id uuid not null references public.products(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(service_type_id,product_id)
);
create table if not exists public.service_type_workshops (
 service_type_id uuid not null references public.service_types(id) on delete cascade,
 workshop_id uuid not null references public.workshops(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(service_type_id,workshop_id)
);
create table if not exists public.service_type_technicians (
 service_type_id uuid not null references public.service_types(id) on delete cascade,
 technician_id uuid not null references public.technicians(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(service_type_id,technician_id)
);
create table if not exists public.device_type_services (
 device_type_id uuid not null references public.device_types(id) on delete cascade,
 service_id uuid not null references public.services(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(device_type_id,service_id)
);
create table if not exists public.device_type_products (
 device_type_id uuid not null references public.device_types(id) on delete cascade,
 product_id uuid not null references public.products(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(device_type_id,product_id)
);
create table if not exists public.device_type_workshops (
 device_type_id uuid not null references public.device_types(id) on delete cascade,
 workshop_id uuid not null references public.workshops(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(device_type_id,workshop_id)
);
create table if not exists public.device_type_technicians (
 device_type_id uuid not null references public.device_types(id) on delete cascade,
 technician_id uuid not null references public.technicians(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(device_type_id,technician_id)
);

create temporary table _legacy_category_type_map(category_id uuid not null,kind text not null,new_id uuid not null,primary key(category_id,kind)) on commit drop;
insert into public.service_types(title,slug,country,status)
select c.title,left(regexp_replace(lower(trim(c.title)),'[^a-z0-9]+','-','g'),140)||'-'||left(c.id::text,8),'Global','active'
from public.categories c where 'Service'=any(c.type);
insert into _legacy_category_type_map
select c.id,'Service',st.id from public.categories c join public.service_types st
on st.slug=left(regexp_replace(lower(trim(c.title)),'[^a-z0-9]+','-','g'),140)||'-'||left(c.id::text,8)
where 'Service'=any(c.type);
insert into public.device_types(title,slug,country,status)
select c.title,left(regexp_replace(lower(trim(c.title)),'[^a-z0-9]+','-','g'),140)||'-'||left(c.id::text,8),'Global','active'
from public.categories c where 'Device'=any(c.type);
insert into _legacy_category_type_map
select c.id,'Device',dt.id from public.categories c join public.device_types dt
on dt.slug=left(regexp_replace(lower(trim(c.title)),'[^a-z0-9]+','-','g'),140)||'-'||left(c.id::text,8)
where 'Device'=any(c.type);

insert into public.service_type_services select m.new_id,cc.record_id,now() from public.catalogue_categories cc join _legacy_category_type_map m on m.category_id=cc.category_id and m.kind='Service' where cc.module_name='services' on conflict do nothing;
insert into public.service_type_products select m.new_id,cc.record_id,now() from public.catalogue_categories cc join _legacy_category_type_map m on m.category_id=cc.category_id and m.kind='Service' where cc.module_name='products' on conflict do nothing;
insert into public.service_type_workshops select m.new_id,cc.record_id,now() from public.catalogue_categories cc join _legacy_category_type_map m on m.category_id=cc.category_id and m.kind='Service' where cc.module_name='workshops' on conflict do nothing;
insert into public.service_type_technicians select m.new_id,cc.record_id,now() from public.catalogue_categories cc join _legacy_category_type_map m on m.category_id=cc.category_id and m.kind='Service' where cc.module_name='technicians' on conflict do nothing;
insert into public.device_type_services select m.new_id,cc.record_id,now() from public.catalogue_categories cc join _legacy_category_type_map m on m.category_id=cc.category_id and m.kind='Device' where cc.module_name='services' on conflict do nothing;
insert into public.device_type_products select m.new_id,cc.record_id,now() from public.catalogue_categories cc join _legacy_category_type_map m on m.category_id=cc.category_id and m.kind='Device' where cc.module_name='products' on conflict do nothing;
insert into public.device_type_workshops select m.new_id,cc.record_id,now() from public.catalogue_categories cc join _legacy_category_type_map m on m.category_id=cc.category_id and m.kind='Device' where cc.module_name='workshops' on conflict do nothing;
insert into public.device_type_technicians select m.new_id,cc.record_id,now() from public.catalogue_categories cc join _legacy_category_type_map m on m.category_id=cc.category_id and m.kind='Device' where cc.module_name='technicians' on conflict do nothing;

do $$
declare t text;
begin
 foreach t in array array['service_types','device_types','service_type_device_types','service_type_services','service_type_products','service_type_workshops','service_type_technicians','device_type_services','device_type_products','device_type_workshops','device_type_technicians'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('drop policy if exists %I on public.%I',t||'_admin_select',t);
  execute format('create policy %I on public.%I for select to authenticated using (private.is_site_admin())',t||'_admin_select',t);
  execute format('drop policy if exists %I on public.%I',t||'_admin_insert',t);
  execute format('create policy %I on public.%I for insert to authenticated with check (private.is_site_admin())',t||'_admin_insert',t);
  execute format('drop policy if exists %I on public.%I',t||'_admin_update',t);
  execute format('create policy %I on public.%I for update to authenticated using (private.is_site_admin()) with check (private.is_site_admin())',t||'_admin_update',t);
  execute format('drop policy if exists %I on public.%I',t||'_admin_delete',t);
  execute format('create policy %I on public.%I for delete to authenticated using (private.is_site_admin())',t||'_admin_delete',t);
  execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  execute format('revoke all on public.%I from anon',t);
 end loop;
end $$;
create index if not exists service_type_services_service_id_idx on public.service_type_services(service_id);
create index if not exists service_type_products_product_id_idx on public.service_type_products(product_id);
create index if not exists service_type_workshops_workshop_id_idx on public.service_type_workshops(workshop_id);
create index if not exists service_type_technicians_technician_id_idx on public.service_type_technicians(technician_id);
create index if not exists device_type_services_service_id_idx on public.device_type_services(service_id);
create index if not exists device_type_products_product_id_idx on public.device_type_products(product_id);
create index if not exists device_type_workshops_workshop_id_idx on public.device_type_workshops(workshop_id);
create index if not exists device_type_technicians_technician_id_idx on public.device_type_technicians(technician_id);
