alter table public.contacts alter column value drop not null;
do $$
declare c record;
begin
 for c in
  select conname from pg_constraint
  where conrelid='public.contacts'::regclass and contype='c'
    and pg_get_constraintdef(oid) ilike '%value%'
 loop
  execute format('alter table public.contacts drop constraint %I',c.conname);
 end loop;
end $$;
alter table public.contacts
 add constraint contacts_value_length_check
 check (value is null or char_length(btrim(value)) <= 2000);
