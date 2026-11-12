-- Align the four approved content modules with the 3B TECH HUB content fields.
-- Drop legacy country checks before converting legacy 'saudi' values to 'ksa'.
alter table public.services drop constraint if exists services_country_check;
alter table public.products drop constraint if exists products_country_check;
alter table public.workshops drop constraint if exists workshops_country_check;
alter table public.technicians drop constraint if exists technicians_country_check;

update public.services set country = 'ksa' where country = 'saudi';
update public.products set country = 'ksa' where country = 'saudi';
update public.workshops set country = 'ksa' where country = 'saudi';
update public.technicians set country = 'ksa' where country = 'saudi';

alter table public.services add constraint services_country_check check (country is null or country in ('global','bd','ksa'));
alter table public.products add constraint products_country_check check (country is null or country in ('global','bd','ksa'));
alter table public.workshops add constraint workshops_country_check check (country is null or country in ('global','bd','ksa'));
alter table public.technicians add constraint technicians_country_check check (country is null or country in ('global','bd','ksa'));

alter table public.workshops add column if not exists slug text;
alter table public.technicians add column if not exists slug text;
alter table public.technicians add column if not exists skill text;

do $$
declare r record; base_slug text; candidate text; suffix integer;
begin
  for r in select id, title from public.workshops order by created_at, id loop
    base_slug := trim(both '-' from regexp_replace(lower(coalesce(r.title,'')), '[^a-z0-9]+', '-', 'g'));
    if base_slug = '' then base_slug := 'workshop-' || replace(r.id::text,'-',''); end if;
    candidate := base_slug; suffix := 2;
    while exists (select 1 from public.workshops where slug = candidate and id <> r.id) loop
      candidate := base_slug || '-' || suffix; suffix := suffix + 1;
    end loop;
    update public.workshops set slug = candidate where id = r.id and (slug is null or btrim(slug) = '');
  end loop;
  for r in select id, name from public.technicians order by created_at, id loop
    base_slug := trim(both '-' from regexp_replace(lower(coalesce(r.name,'')), '[^a-z0-9]+', '-', 'g'));
    if base_slug = '' then base_slug := 'technician-' || replace(r.id::text,'-',''); end if;
    candidate := base_slug; suffix := 2;
    while exists (select 1 from public.technicians where slug = candidate and id <> r.id) loop
      candidate := base_slug || '-' || suffix; suffix := suffix + 1;
    end loop;
    update public.technicians set slug = candidate where id = r.id and (slug is null or btrim(slug) = '');
  end loop;
end $$;

alter table public.workshops alter column slug set not null;
alter table public.technicians alter column slug set not null;
create unique index if not exists workshops_slug_key on public.workshops(slug);
create unique index if not exists technicians_slug_key on public.technicians(slug);
