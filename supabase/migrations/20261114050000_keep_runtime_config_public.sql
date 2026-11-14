-- Runtime configuration is application infrastructure, not user-managed content visibility.
drop policy if exists settings_public_read on public."Settings";
create policy settings_public_read on public."Settings" for select to anon, authenticated
using (
  setting_key = 'runtime_config'
  or (
    setting_key = any(array['site_profile','home_intro'])
    and private.user_can_view_visibility(visibility_roles)
  )
);
