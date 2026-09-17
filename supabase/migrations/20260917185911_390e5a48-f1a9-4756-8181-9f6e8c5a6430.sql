CREATE POLICY "Admins can read catalog pdfs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'catalog-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload catalog pdfs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'catalog-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete catalog pdfs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'catalog-pdfs' AND public.has_role(auth.uid(), 'admin'));