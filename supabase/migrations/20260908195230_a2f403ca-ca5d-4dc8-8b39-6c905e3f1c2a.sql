CREATE TABLE public.credit_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  id_number text NOT NULL,
  phone text NOT NULL,
  email text,
  occupation text,
  monthly_income text,
  vehicle_name text,
  plan_id text NOT NULL,
  plan_name text NOT NULL,
  message text,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'nuevo',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.credit_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credit_applications TO authenticated;
GRANT ALL ON public.credit_applications TO service_role;

ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a credit application"
  ON public.credit_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read credit applications"
  ON public.credit_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update credit applications"
  ON public.credit_applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete credit applications"
  ON public.credit_applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can upload credit documents"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'credit-documents');
CREATE POLICY "Admins can read credit documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'credit-documents' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete credit documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'credit-documents' AND public.has_role(auth.uid(), 'admin'::app_role));