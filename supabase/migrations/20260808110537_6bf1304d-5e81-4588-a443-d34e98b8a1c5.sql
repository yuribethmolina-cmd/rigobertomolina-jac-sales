CREATE TABLE public.contact_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  model text,
  plan text,
  source text,
  page text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_events TO anon, authenticated;
GRANT ALL ON public.contact_events TO service_role;

ALTER TABLE public.contact_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a contact event"
ON public.contact_events FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE INDEX contact_events_created_at_idx ON public.contact_events (created_at DESC);

CREATE OR REPLACE FUNCTION public.contact_stats(days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
  );
$$;

GRANT EXECUTE ON FUNCTION public.contact_stats(integer) TO anon, authenticated;