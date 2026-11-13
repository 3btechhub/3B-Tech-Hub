create table if not exists public.service_products (
  service_id uuid not null references public.services(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (service_id, product_id)
);
create table if not exists public.product_technicians (
  product_id uuid not null references public.products(id) on delete cascade,
  technician_id uuid not null references public.technicians(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, technician_id)
);
alter table public.service_products enable row level security;
alter table public.product_technicians enable row level security;
grant select on public.service_products, public.product_technicians to anon, authenticated;
grant insert, update, delete on public.service_products, public.product_technicians to authenticated;
drop policy if exists service_products_public_read on public.service_products;
create policy service_products_public_read on public.service_products for select to anon, authenticated
using (
  exists (select 1 from public.services s where s.id=service_products.service_id and s.status='active')
  and exists (select 1 from public.products p where p.id=service_products.product_id and p.status='active')
);
drop policy if exists service_products_owner_manage on public.service_products;
create policy service_products_owner_manage on public.service_products for all to authenticated
using ((select private.is_site_admin()))
with check ((select private.is_site_admin()));
drop policy if exists product_technicians_public_read on public.product_technicians;
create policy product_technicians_public_read on public.product_technicians for select to anon, authenticated
using (
  exists (select 1 from public.products p where p.id=product_technicians.product_id and p.status='active')
  and exists (select 1 from public.technicians t where t.id=product_technicians.technician_id and t.is_published=true)
);
drop policy if exists product_technicians_owner_manage on public.product_technicians;
create policy product_technicians_owner_manage on public.product_technicians for all to authenticated
using ((select private.is_site_admin()))
with check ((select private.is_site_admin()));