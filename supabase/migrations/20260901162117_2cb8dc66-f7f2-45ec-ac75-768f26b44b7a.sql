CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'nuevo',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_messages_full_name_len CHECK (char_length(full_name) BETWEEN 2 AND 100),
  CONSTRAINT contact_messages_phone_len CHECK (phone IS NULL OR char_length(phone) BETWEEN 7 AND 30),
  CONSTRAINT contact_messages_email_len CHECK (email IS NULL OR char_length(email) <= 255),
  CONSTRAINT contact_messages_message_len CHECK (char_length(message) BETWEEN 2 AND 1000),
  CONSTRAINT contact_messages_status_valid CHECK (status IN ('nuevo','contactado','cerrado'))
);

GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a contact message"
  ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX contact_messages_created_at_idx ON public.contact_messages (created_at DESC);