create or replace view public.visitor_analytics_summary
with (security_invoker = true)
as
with visitor_counts as (
  select visitor_key, count(*)::bigint as visit_count
  from public.visitor_analytics
  group by visitor_key
)
select coalesce(sum(visit_count),0)::bigint as total_page_views,
       count(*)::bigint as total_visitors,
       count(*) filter (where visit_count > 1)::bigint as repeat_visitors
from visitor_counts;

create or replace view public.visitor_page_views
with (security_invoker = true)
as
select page_path,count(*)::bigint as page_views
from public.visitor_analytics
group by page_path;

grant select on public.visitor_analytics_summary,public.visitor_page_views to authenticated;
