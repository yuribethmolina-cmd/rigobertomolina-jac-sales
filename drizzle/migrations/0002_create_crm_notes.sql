CREATE TABLE public.crm_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table text NOT NULL,
  source_id uuid NOT NULL,
  note text NOT NULL,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_by_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX crm_notes_source_idx ON public.crm_notes (source_table, source_id, created_at DESC);

GRANT SELECT, INSERT ON public.crm_notes TO authenticated;
GRANT ALL ON public.crm_notes TO service_role;

ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read crm notes"
  ON public.crm_notes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can add crm notes"
  ON public.crm_notes FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND created_by = auth.uid()
    AND char_length(note) BETWEEN 1 AND 3000
    AND source_table IN ('advisor_leads', 'quote_requests', 'credit_applications', 'contact_messages')
  );