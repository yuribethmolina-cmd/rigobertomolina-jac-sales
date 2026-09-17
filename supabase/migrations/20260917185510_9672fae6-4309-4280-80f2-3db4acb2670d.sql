CREATE TABLE public.catalog_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id text NOT NULL,
  catalog_date text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  source text NOT NULL,
  pdf_path text,
  entries_count integer NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT catalog_versions_status_check CHECK (status IN ('DRAFT','ACTIVE','ARCHIVED'))
);

CREATE UNIQUE INDEX catalog_versions_one_active_per_plan
  ON public.catalog_versions (plan_id)
  WHERE status = 'ACTIVE';

CREATE INDEX catalog_versions_plan_idx ON public.catalog_versions (plan_id, created_at DESC);

GRANT SELECT ON public.catalog_versions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_versions TO authenticated;
GRANT ALL ON public.catalog_versions TO service_role;

ALTER TABLE public.catalog_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active catalog versions"
  ON public.catalog_versions FOR SELECT
  TO anon, authenticated
  USING (status = 'ACTIVE');

CREATE POLICY "Admins can read all catalog versions"
  ON public.catalog_versions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create catalog versions"
  ON public.catalog_versions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update catalog versions"
  ON public.catalog_versions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete catalog versions"
  ON public.catalog_versions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.catalog_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES public.catalog_versions(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  vehicle_id text,
  model_name text NOT NULL,
  version_label text,
  signature_amount numeric,
  installments_count integer,
  installment_amount numeric,
  pre_delivery_amount numeric,
  promo text,
  conditions text,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  change_type text NOT NULL DEFAULT 'NEEDS_REVIEW',
  edited_fields text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT catalog_entries_change_type_check
    CHECK (change_type IN ('UPDATED','UNCHANGED','NEW','REMOVED','NEEDS_REVIEW'))
);

CREATE INDEX catalog_entries_version_idx ON public.catalog_entries (version_id, position);

GRANT SELECT ON public.catalog_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_entries TO authenticated;
GRANT ALL ON public.catalog_entries TO service_role;

ALTER TABLE public.catalog_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read entries of active versions"
  ON public.catalog_entries FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.catalog_versions v
    WHERE v.id = catalog_entries.version_id AND v.status = 'ACTIVE'
  ));

CREATE POLICY "Admins can read all catalog entries"
  ON public.catalog_entries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create catalog entries"
  ON public.catalog_entries FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update catalog entries"
  ON public.catalog_entries FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete catalog entries"
  ON public.catalog_entries FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.catalog_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid,
  plan_id text NOT NULL,
  action text NOT NULL,
  user_id uuid,
  user_email text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX catalog_audit_plan_idx ON public.catalog_audit (plan_id, created_at DESC);

GRANT SELECT, INSERT ON public.catalog_audit TO authenticated;
GRANT ALL ON public.catalog_audit TO service_role;

ALTER TABLE public.catalog_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read the catalog audit log"
  ON public.catalog_audit FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can write the catalog audit log"
  ON public.catalog_audit FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER catalog_versions_touch
  BEFORE UPDATE ON public.catalog_versions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER catalog_entries_touch
  BEFORE UPDATE ON public.catalog_entries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();