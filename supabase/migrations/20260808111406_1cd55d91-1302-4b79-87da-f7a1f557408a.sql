REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = uid);
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.contact_stats(days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
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
$$;

REVOKE EXECUTE ON FUNCTION public.contact_stats(integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.contact_stats(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated, service_role;