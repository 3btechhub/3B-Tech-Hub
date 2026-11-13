-- Verified that no existing user has multiple role rows.
create unique index if not exists user_roles_user_id_key on public.user_roles(user_id);
