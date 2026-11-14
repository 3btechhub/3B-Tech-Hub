create policy users_self_read on public."Users"
  for select to authenticated using(auth_user_id=auth.uid());
create policy users_self_update on public."Users"
  for update to authenticated using(auth_user_id=auth.uid()) with check(auth_user_id=auth.uid());