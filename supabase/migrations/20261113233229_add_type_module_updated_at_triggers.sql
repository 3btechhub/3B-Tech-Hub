drop trigger if exists service_types_set_updated_at on public.service_types;
create trigger service_types_set_updated_at before update on public.service_types for each row execute function set_updated_at();
drop trigger if exists device_types_set_updated_at on public.device_types;
create trigger device_types_set_updated_at before update on public.device_types for each row execute function set_updated_at();
