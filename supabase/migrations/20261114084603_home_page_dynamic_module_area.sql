drop policy if exists settings_public_read on public."Settings";
create policy settings_public_read
on public."Settings"
for select
to anon, authenticated
using (
  setting_key = 'runtime_config'
  or (
    setting_key = any (array['site_profile','home_intro','home_modules']::text[])
    and private.user_can_view_visibility(visibility_roles)
  )
);

insert into public."Settings" (setting_key, setting_value, description, visibility_roles)
values (
  'home_modules',
  jsonb_build_object(
    'modules', jsonb_build_array(
      jsonb_build_object('key','service_types','title','Service Type','sort_order',10,'visibility_roles',jsonb_build_array('owner','visitor')),
      jsonb_build_object('key','device_types','title','Device Type','sort_order',20,'visibility_roles',jsonb_build_array('owner','visitor')),
      jsonb_build_object('key','services','title','Services','sort_order',30,'visibility_roles',jsonb_build_array('owner','visitor')),
      jsonb_build_object('key','products','title','Products','sort_order',40,'visibility_roles',jsonb_build_array('owner','visitor')),
      jsonb_build_object('key','workshops','title','Workshops','sort_order',50,'visibility_roles',jsonb_build_array('owner','visitor')),
      jsonb_build_object('key','technicians','title','Technicians','sort_order',60,'visibility_roles',jsonb_build_array('owner','visitor')),
      jsonb_build_object('key','contacts','title','Contacts','sort_order',70,'visibility_roles',jsonb_build_array('owner','visitor'))
    )
  ),
  'Dynamic homepage module order, titles and visitor visibility',
  array['owner','visitor']::text[]
)
on conflict (setting_key) do nothing;
