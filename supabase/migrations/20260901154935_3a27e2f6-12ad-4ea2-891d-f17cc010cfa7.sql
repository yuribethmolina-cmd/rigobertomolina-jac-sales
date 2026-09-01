GRANT SELECT ON public.reviews TO anon;

CREATE POLICY "Anyone can read approved reviews"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (approved = true);