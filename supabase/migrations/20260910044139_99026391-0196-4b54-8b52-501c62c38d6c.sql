GRANT SELECT, INSERT, UPDATE, DELETE ON public.advisor_leads TO authenticated;
GRANT INSERT ON public.advisor_leads TO anon;
GRANT ALL ON public.advisor_leads TO service_role;