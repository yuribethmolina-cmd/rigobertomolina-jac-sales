CREATE TABLE public.advisor_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text,
  city text,
  model_interest text,
  use_case text,
  purchase_method text,
  initial_budget text,
  monthly_budget text,
  conversation_summary text,
  lead_score text NOT NULL DEFAULT 'warm',
  status text NOT NULL DEFAULT 'nuevo',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.advisor_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.advisor_leads TO authenticated;
GRANT ALL ON public.advisor_leads TO service_role;

ALTER TABLE public.advisor_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can leave a lead" ON public.advisor_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can read advisor leads" ON public.advisor_leads
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update advisor leads" ON public.advisor_leads
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete advisor leads" ON public.advisor_leads
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));