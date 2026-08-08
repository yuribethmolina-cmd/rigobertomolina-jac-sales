CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text,
  event text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  page text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX admin_audit_log_created_at_idx ON public.admin_audit_log (created_at DESC);

GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can log their own activity"
ON public.admin_audit_log FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read the audit log"
ON public.admin_audit_log FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
));