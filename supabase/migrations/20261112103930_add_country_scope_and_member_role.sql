-- Add country scope for dynamic pages and allow the new Member role.
-- Legacy roles remain temporarily valid until the post-deployment cleanup migration.
alter table public.user_roles
  drop constraint if exists user_roles_role_check;
alter table public.user_roles
  add constraint user_roles_role_check
  check (role = any (array['owner','admin','manager','editor','staff','customer','member']::text[]));

alter table public.pages
  add column if not exists country text not null default 'global';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pages_country_check'
      and conrelid = 'public.pages'::regclass
  ) then
    alter table public.pages
      add constraint pages_country_check
      check (country = any (array['global','bd','ksa']::text[]));
  end if;
end
$$;

drop index if exists public.pages_main_slug_locale_uidx;
drop index if exists public.pages_child_slug_parent_locale_uidx;

create unique index if not exists pages_main_slug_locale_country_uidx
  on public.pages (lower(slug), locale, country) where parent_id is null;
create unique index if not exists pages_child_slug_parent_locale_country_uidx
  on public.pages (parent_id, lower(slug), locale, country) where parent_id is not null;
create index if not exists pages_country_public_idx
  on public.pages (country, status, page_type, sort_order) where status = 'published';
