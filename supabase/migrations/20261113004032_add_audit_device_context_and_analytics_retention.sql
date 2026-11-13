create or replace function private.capture_audit_event()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public, auth
as $$
declare old_row jsonb; new_row jsonb; request_headers jsonb := '{}'::jsonb; resource_id text; changed_columns text[];
begin
  begin request_headers := coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb;
  exception when others then request_headers := '{}'::jsonb; end;
  if tg_op='INSERT' then
    new_row:=to_jsonb(new);
    resource_id:=coalesce(new_row->>'id',new_row->>'user_id',new_row->>'setting_key',new_row->>'role_id',new_row->>'permission_id');
    changed_columns:=array(select item.key from jsonb_object_keys(new_row) as item(key) where item.key not in ('created_at','updated_at'));
  elsif tg_op='UPDATE' then
    old_row:=to_jsonb(old);new_row:=to_jsonb(new);
    resource_id:=coalesce(new_row->>'id',new_row->>'user_id',new_row->>'setting_key',new_row->>'role_id',new_row->>'permission_id');
    select array_agg(item.key order by item.key) into changed_columns from jsonb_object_keys(new_row) as item(key)
    where old_row->item.key is distinct from new_row->item.key and item.key<>'updated_at';
    if coalesce(cardinality(changed_columns),0)=0 then return new; end if;
  else
    old_row:=to_jsonb(old);
    resource_id:=coalesce(old_row->>'id',old_row->>'user_id',old_row->>'setting_key',old_row->>'role_id',old_row->>'permission_id');
    changed_columns:=array[]::text[];
  end if;
  insert into public.audit_logs(actor_id,action,resource_type,resource_id,metadata,result,device)
  values((select auth.uid()),lower(tg_op),tg_argv[0],resource_id,
    jsonb_build_object('changed_columns',coalesce(to_jsonb(changed_columns),'[]'::jsonb)),
    'success',left(coalesce(request_headers->>'user-agent','unknown'),255));
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function private.prune_visitor_analytics()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
begin
  delete from public.visitor_analytics where viewed_at < now() - interval '90 days';
  return new;
end;
$$;
revoke all on function private.prune_visitor_analytics() from public, anon, authenticated;
drop trigger if exists prune_visitor_analytics_retention on public.visitor_analytics;
create trigger prune_visitor_analytics_retention before insert on public.visitor_analytics
for each row execute function private.prune_visitor_analytics();
