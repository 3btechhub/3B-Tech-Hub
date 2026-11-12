-- Remove country and language preference metadata from the single English website.
-- Content and user rows are preserved; only obsolete metadata columns and flags are removed.

alter table public.services drop column if exists country;
alter table public.products drop column if exists country;
alter table public.workshops drop column if exists country;
alter table public.technicians drop column if exists country;
alter table public.user_profiles drop column if exists preferred_locale;

update public.site_settings
set setting_value = jsonb_set(
  coalesce(setting_value, '{}'::jsonb),
  '{features}',
  coalesce(setting_value->'features', '{}'::jsonb) - 'language_selector' - 'region_selector',
  true
)
where setting_key = 'runtime_config';
