-- Store each authenticated user's phone number in their own profile row.
alter table public.user_profiles
  add column if not exists phone text;
