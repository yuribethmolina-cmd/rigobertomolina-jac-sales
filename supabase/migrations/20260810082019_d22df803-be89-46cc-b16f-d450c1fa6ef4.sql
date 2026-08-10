DROP FUNCTION IF EXISTS public.claim_admin();

CREATE POLICY "Admins can read contact events"
ON public.contact_events
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

GRANT SELECT ON public.contact_events TO authenticated;

CREATE OR REPLACE FUNCTION public.contact_stats(days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  WITH scoped AS (
    SELECT * FROM public.contact_events
    WHERE created_at >= now() - (LEAST(GREATEST(days, 1), 365) || ' days')::interval
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM scoped),
    'whatsapp', (SELECT count(*) FROM scoped WHERE action = 'whatsapp'),
    'by_action', COALESCE((SELECT jsonb_agg(x) FROM (SELECT action, count(*) AS count FROM scoped GROUP BY action ORDER BY count(*) DESC) x), '[]'::jsonb),
    'by_model', COALESCE((SELECT jsonb_agg(x) FROM (SELECT model, count(*) AS count FROM scoped WHERE model IS NOT NULL GROUP BY model ORDER BY count(*) DESC LIMIT 15) x), '[]'::jsonb),
    'by_plan', COALESCE((SELECT jsonb_agg(x) FROM (SELECT plan, count(*) AS count FROM scoped WHERE plan IS NOT NULL GROUP BY plan ORDER BY count(*) DESC) x), '[]'::jsonb),
    'by_day', COALESCE((SELECT jsonb_agg(x ORDER BY x.day) FROM (SELECT date_trunc('day', created_at)::date AS day, count(*) AS count FROM scoped GROUP BY 1) x), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$function$;

REVOKE ALL ON FUNCTION public.contact_stats(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.contact_stats(integer) TO authenticated, service_role;