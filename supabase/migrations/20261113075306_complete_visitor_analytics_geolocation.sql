-- Complete visitor analytics through a trusted Edge Function.
-- Public clients must not be able to write arbitrary analytics rows directly.
DROP POLICY IF EXISTS visitor_analytics_public_insert ON public.visitor_analytics;
REVOKE INSERT ON TABLE public.visitor_analytics FROM anon, authenticated;

CREATE OR REPLACE VIEW public.visitor_analytics_locations
WITH (security_invoker = true)
AS
SELECT
  COALESCE(NULLIF(BTRIM(country), ''), 'Unknown') AS country,
  COALESCE(NULLIF(BTRIM(city), ''), 'Unknown') AS city,
  COUNT(*)::bigint AS page_views,
  COUNT(DISTINCT visitor_key)::bigint AS visitors
FROM public.visitor_analytics
GROUP BY 1, 2;

GRANT SELECT ON public.visitor_analytics_locations TO authenticated;
CREATE INDEX IF NOT EXISTS visitor_analytics_location_time_idx
  ON public.visitor_analytics (country, city, viewed_at DESC);
