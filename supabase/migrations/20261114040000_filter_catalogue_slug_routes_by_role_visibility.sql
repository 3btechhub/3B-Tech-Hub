-- Ensure URL slug resolution follows the same role visibility policy as direct catalogue reads.
create or replace function public.get_public_catalogue_slugs(p_module text)
returns table(id uuid, slug text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_module = 'services' then
    return query
      select s.id, s.slug from public.services s
      where s.status = 'active'
        and private.user_can_view_visibility(s.visibility_roles)
        and s.slug is not null and btrim(s.slug) <> '';
  elsif p_module = 'products' then
    return query
      select p.id, p.slug from public.products p
      where p.status = 'active'
        and private.user_can_view_visibility(p.visibility_roles)
        and p.slug is not null and btrim(p.slug) <> '';
  elsif p_module = 'workshops' then
    return query
      select w.id, w.slug from public.workshops w
      where w.status = 'published'
        and private.user_can_view_visibility(w.visibility_roles)
        and w.slug is not null and btrim(w.slug) <> '';
  elsif p_module = 'technicians' then
    return query
      select t.id, t.slug from public.technicians t
      where t.is_published = true
        and private.user_can_view_visibility(t.visibility_roles)
        and t.slug is not null and btrim(t.slug) <> '';
  else
    return;
  end if;
end;
$$;
