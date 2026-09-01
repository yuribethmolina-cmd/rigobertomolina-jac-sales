CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  city text,
  vehicle_name text NOT NULL,
  plan_name text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'nuevo',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quote_requests_full_name_len CHECK (char_length(full_name) BETWEEN 2 AND 100),
  CONSTRAINT quote_requests_phone_len CHECK (char_length(phone) BETWEEN 7 AND 30),
  CONSTRAINT quote_requests_email_len CHECK (email IS NULL OR char_length(email) <= 255),
  CONSTRAINT quote_requests_city_len CHECK (city IS NULL OR char_length(city) <= 80),
  CONSTRAINT quote_requests_vehicle_len CHECK (char_length(vehicle_name) BETWEEN 1 AND 120),
  CONSTRAINT quote_requests_plan_len CHECK (char_length(plan_name) BETWEEN 1 AND 120),
  CONSTRAINT quote_requests_message_len CHECK (message IS NULL OR char_length(message) <= 1000),
  CONSTRAINT quote_requests_status_valid CHECK (status IN ('nuevo','contactado','cerrado'))
);

GRANT INSERT ON public.quote_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a quote request"
  ON public.quote_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can read quote requests"
  ON public.quote_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update quote requests"
  ON public.quote_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete quote requests"
  ON public.quote_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX quote_requests_created_at_idx ON public.quote_requests (created_at DESC);