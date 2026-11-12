-- Atomic Page Builder revision capture, restore, and component ordering.
-- All operations remain restricted to site administrators.

create or replace function public.capture_page_revision(p_page_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  v_page public.pages%rowtype;
  v_components jsonb;
  v_revision_number integer;
  v_revision_id uuid;
begin
  if auth.uid() is null or not private.is_site_admin() then
    raise exception 'Not authorized to manage page revisions' using errcode = '42501';
  end if;

  select * into v_page
  from public.pages
  where id = p_page_id
  for update;

  if not found then
    raise exception 'Page not found' using errcode = 'P0002';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'slot', pc.slot,
        'component_type', pc.component_type,
        'component_config', pc.component_config,
        'sort_order', pc.sort_order,
        'is_visible', pc.is_visible
      ) order by pc.sort_order, pc.created_at, pc.id
    ),
    '[]'::jsonb
  )
  into v_components
  from public.page_components pc
  where pc.page_id = p_page_id;

  select coalesce(max(revision_number), 0) + 1
  into v_revision_number
  from public.page_revisions
  where page_id = p_page_id;

  insert into public.page_revisions (page_id, revision_number, snapshot, created_by)
  values (
    p_page_id,
    v_revision_number,
    jsonb_build_object(
      'page', jsonb_build_object(
        'page_type', v_page.page_type,
        'parent_id', v_page.parent_id,
        'slug', v_page.slug,
        'title', v_page.title,
        'description', v_page.description,
        'locale', v_page.locale,
        'status', v_page.status,
        'sort_order', v_page.sort_order,
        'seo', v_page.seo,
        'published_at', v_page.published_at
      ),
      'components', v_components
    ),
    auth.uid()
  )
  returning id into v_revision_id;

  return v_revision_id;
end;
$$;

create or replace function public.restore_page_revision(p_revision_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  v_revision public.page_revisions%rowtype;
  v_page_id uuid;
  v_snapshot jsonb;
  v_page_snapshot jsonb;
begin
  if auth.uid() is null or not private.is_site_admin() then
    raise exception 'Not authorized to restore page revisions' using errcode = '42501';
  end if;

  select page_id into v_page_id
  from public.page_revisions
  where id = p_revision_id;

  if not found then
    raise exception 'Revision not found' using errcode = 'P0002';
  end if;

  perform 1 from public.pages where id = v_page_id for update;

  select * into v_revision
  from public.page_revisions
  where id = p_revision_id and page_id = v_page_id;

  v_snapshot := v_revision.snapshot;
  v_page_snapshot := v_snapshot -> 'page';

  if jsonb_typeof(v_page_snapshot) <> 'object'
     or jsonb_typeof(v_snapshot -> 'components') <> 'array' then
    raise exception 'Revision snapshot is invalid' using errcode = '22023';
  end if;

  -- Capture the current state in this same transaction before replacing it.
  perform public.capture_page_revision(v_page_id);

  update public.pages
  set page_type = v_page_snapshot ->> 'page_type',
      parent_id = nullif(v_page_snapshot ->> 'parent_id', '')::uuid,
      slug = v_page_snapshot ->> 'slug',
      title = v_page_snapshot ->> 'title',
      description = coalesce(v_page_snapshot ->> 'description', ''),
      locale = coalesce(v_page_snapshot ->> 'locale', 'en'),
      status = v_page_snapshot ->> 'status',
      sort_order = coalesce((v_page_snapshot ->> 'sort_order')::integer, 0),
      seo = coalesce(v_page_snapshot -> 'seo', '{}'::jsonb),
      published_at = nullif(v_page_snapshot ->> 'published_at', '')::timestamptz,
      updated_by = auth.uid(),
      updated_at = now()
  where id = v_page_id;

  delete from public.page_components where page_id = v_page_id;

  insert into public.page_components (
    page_id, slot, component_type, component_config, sort_order, is_visible
  )
  select
    v_page_id,
    coalesce(item ->> 'slot', 'main'),
    item ->> 'component_type',
    coalesce(item -> 'component_config', '{}'::jsonb),
    coalesce((item ->> 'sort_order')::integer, 0),
    coalesce((item ->> 'is_visible')::boolean, true)
  from jsonb_array_elements(v_snapshot -> 'components') as item;
end;
$$;

create or replace function public.reorder_page_components(
  p_page_id uuid,
  p_component_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  v_expected_count integer;
  v_unique_count integer;
begin
  if auth.uid() is null or not private.is_site_admin() then
    raise exception 'Not authorized to reorder page components' using errcode = '42501';
  end if;

  perform 1 from public.pages where id = p_page_id for update;
  if not found then
    raise exception 'Page not found' using errcode = 'P0002';
  end if;

  select count(*) into v_expected_count
  from public.page_components where page_id = p_page_id;

  select count(distinct component_id) into v_unique_count
  from unnest(coalesce(p_component_ids, array[]::uuid[])) as component_id;

  if cardinality(coalesce(p_component_ids, array[]::uuid[])) <> v_expected_count
     or v_unique_count <> v_expected_count
     or exists (
       select 1
       from unnest(coalesce(p_component_ids, array[]::uuid[])) as requested(component_id)
       left join public.page_components pc
         on pc.id = requested.component_id and pc.page_id = p_page_id
       where pc.id is null
     ) then
    raise exception 'Component order must contain every component exactly once' using errcode = '22023';
  end if;

  perform public.capture_page_revision(p_page_id);

  update public.page_components pc
  set sort_order = requested.position - 1
  from unnest(coalesce(p_component_ids, array[]::uuid[])) with ordinality
    as requested(component_id, position)
  where pc.id = requested.component_id
    and pc.page_id = p_page_id;
end;
$$;

revoke all on function public.capture_page_revision(uuid) from public, anon;
revoke all on function public.restore_page_revision(uuid) from public, anon;
revoke all on function public.reorder_page_components(uuid, uuid[]) from public, anon;
grant execute on function public.capture_page_revision(uuid) to authenticated;
grant execute on function public.restore_page_revision(uuid) to authenticated;
grant execute on function public.reorder_page_components(uuid, uuid[]) to authenticated;
