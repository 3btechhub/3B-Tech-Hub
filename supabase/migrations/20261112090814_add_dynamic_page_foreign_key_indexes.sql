-- Cover foreign keys used for owner attribution and revision cleanup.
create index if not exists pages_created_by_idx on public.pages (created_by);
create index if not exists pages_updated_by_idx on public.pages (updated_by);
create index if not exists page_revisions_created_by_idx on public.page_revisions (created_by);
