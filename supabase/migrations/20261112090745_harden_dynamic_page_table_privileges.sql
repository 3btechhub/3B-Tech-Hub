-- Restrict page-engine table privileges to operations governed by RLS.
revoke all privileges on table public.pages, public.page_components, public.page_revisions from anon, authenticated;
grant select on table public.pages, public.page_components to anon, authenticated;
grant select, insert, update, delete on table public.pages, public.page_components to authenticated;
grant select, insert on table public.page_revisions to authenticated;
