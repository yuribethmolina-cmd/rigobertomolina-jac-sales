CREATE OR REPLACE FUNCTION public.credit_document_upload_allowed(_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.credit_applications ca
    WHERE ca.id::text = split_part(_name, '/', 1)
      AND ca.status = 'nuevo'
      AND ca.created_at > now() - interval '1 hour'
      AND ca.documents @> jsonb_build_array(jsonb_build_object('path', _name))
  )
$$;
REVOKE ALL ON FUNCTION public.credit_document_upload_allowed(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.credit_document_upload_allowed(text) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can upload credit documents" ON storage.objects;
CREATE POLICY "Applicants can upload their declared credit documents" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'credit-documents'
  AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[^/]{1,200}$'
  AND public.credit_document_upload_allowed(name)
);