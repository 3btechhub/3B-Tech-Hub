-- Remove the legacy content and dynamic page management system.
drop table if exists public.page_revisions cascade;
drop table if exists public.page_components cascade;
drop table if exists public.pages cascade;
drop table if exists public.site_content cascade;
drop function if exists public.enforce_dynamic_page_hierarchy() cascade;
