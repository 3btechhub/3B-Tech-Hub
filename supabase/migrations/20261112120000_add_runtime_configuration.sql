-- Runtime configuration foundation for the minimal-code hybrid architecture.
-- Reuses the existing RLS-protected site_settings table; no schema or business rows are changed.
-- Existing settings are preserved on re-run.
insert into public.site_settings (setting_key, setting_value, is_public)
values (
  'runtime_config',
  jsonb_build_object(
    'schema_version', 1,
    'themes', jsonb_build_object(
      'light', jsonb_build_object(
        'page_bg', '#ffffff',
        'page_text', '#111111',
        'surface', '#ffffff',
        'line', '#e5e5e5',
        'muted', '#666666',
        'hover', '#f3f3f3',
        'primary', '#111111',
        'font_family', 'Arial, Helvetica, sans-serif'
      ),
      'dark', jsonb_build_object(
        'page_bg', '#111111',
        'page_text', '#f5f5f5',
        'surface', '#1b1b1b',
        'line', '#333333',
        'muted', '#aaaaaa',
        'hover', '#292929',
        'primary', '#f5f5f5',
        'font_family', 'Arial, Helvetica, sans-serif'
      )
    ),
    'layout', jsonb_build_object(
      'content_max_width', '1120px',
      'header_min_height', '68px',
      'footer_min_height', '62px'
    ),
    'branding', jsonb_build_object(
      'site_name', '3B TECH HUB',
      'logo_text', '3B',
      'logo_url', null
    ),
    'features', jsonb_build_object(
      'dark_mode', true,
      'language_selector', true,
      'region_selector', true
    )
  ),
  true
)
on conflict (setting_key) do nothing;
