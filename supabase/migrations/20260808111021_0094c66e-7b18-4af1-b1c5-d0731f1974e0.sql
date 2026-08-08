CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
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
  IF NOT public.has_role(auth.uid(), 'admin') THEN
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

REVOKE EXECUTE ON FUNCTION public.contact_stats(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.contact_stats(integer) TO authenticated;