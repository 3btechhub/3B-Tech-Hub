-- Harden dynamic page hierarchy, publication integrity and timestamps.
create or replace function public.enforce_dynamic_page_hierarchy()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  parent_type text;
  parent_status text;
begin
  if new.parent_id is not null then
    select page_type, status into parent_type, parent_status
    from public.pages where id = new.parent_id;

    if not found or parent_type <> 'main' then
      raise exception 'A Sub Page must belong directly to an existing Main Page';
    end if;

    if new.status = 'published' and parent_status <> 'published' then
      raise exception 'A Sub Page cannot be published unless its Main Page is published';
    end if;
  end if;

  if new.page_type = 'main' and new.status <> 'published'
     and exists (select 1 from public.pages child
                 where child.parent_id = new.id and child.status = 'published') then
    raise exception 'Unpublish or archive published Sub Pages before changing the Main Page status';
  end if;

  return new;
end;
$$;

drop trigger if exists pages_enforce_hierarchy on public.pages;
create trigger pages_enforce_hierarchy
before insert or update of parent_id, page_type, status on public.pages
for each row execute function public.enforce_dynamic_page_hierarchy();

drop trigger if exists pages_set_updated_at on public.pages;
create trigger pages_set_updated_at before update on public.pages
for each row execute function public.set_updated_at();

drop trigger if exists page_components_set_updated_at on public.page_components;
create trigger page_components_set_updated_at before update on public.page_components
for each row execute function public.set_updated_at();

-- A child page must remain published only while its parent is published.
-- The hierarchy trigger enforces this for writes to child pages; this trigger
-- also prevents a Main Page from being unpublished while published children exist.
