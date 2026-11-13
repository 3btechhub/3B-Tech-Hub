-- Allow each account to hold multiple Roles, as configured by the Users form.
drop index if exists public.user_roles_user_id_key;
alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles add constraint user_roles_role_check
check (role ~ '^[a-z0-9][a-z0-9_-]{1,63}$');
