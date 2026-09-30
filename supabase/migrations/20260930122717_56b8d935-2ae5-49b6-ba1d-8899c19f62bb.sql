DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a review" ON public.reviews FOR INSERT TO anon, authenticated
WITH CHECK (approved = false AND rating BETWEEN 1 AND 5
  AND char_length(customer_name) BETWEEN 1 AND 120
  AND char_length(message) BETWEEN 1 AND 3000
  AND (vehicle_name IS NULL OR char_length(vehicle_name) <= 200));

DROP POLICY IF EXISTS "Anyone can submit a credit application" ON public.credit_applications;
CREATE POLICY "Anyone can submit a credit application" ON public.credit_applications FOR INSERT TO anon, authenticated
WITH CHECK (status = 'nuevo'
  AND char_length(full_name) BETWEEN 1 AND 200
  AND char_length(id_number) BETWEEN 1 AND 50
  AND char_length(phone) BETWEEN 1 AND 50
  AND (email IS NULL OR char_length(email) <= 255)
  AND (message IS NULL OR char_length(message) <= 3000)
  AND char_length(plan_id) <= 100 AND char_length(plan_name) <= 200
  AND jsonb_typeof(documents) = 'array' AND jsonb_array_length(documents) <= 30);

DROP POLICY IF EXISTS "Anyone can log a contact event" ON public.contact_events;
CREATE POLICY "Anyone can log a contact event" ON public.contact_events FOR INSERT TO anon, authenticated
WITH CHECK (char_length(action) BETWEEN 1 AND 50
  AND (model IS NULL OR char_length(model) <= 200)
  AND (plan IS NULL OR char_length(plan) <= 200)
  AND (source IS NULL OR char_length(source) <= 200)
  AND (page IS NULL OR char_length(page) <= 500));

DROP POLICY IF EXISTS "Anyone can submit a quote request" ON public.quote_requests;
CREATE POLICY "Anyone can submit a quote request" ON public.quote_requests FOR INSERT TO anon, authenticated
WITH CHECK (status = 'nuevo'
  AND char_length(full_name) BETWEEN 1 AND 200
  AND char_length(phone) BETWEEN 1 AND 50
  AND (email IS NULL OR char_length(email) <= 255)
  AND (city IS NULL OR char_length(city) <= 120)
  AND char_length(vehicle_name) BETWEEN 1 AND 200
  AND char_length(plan_name) BETWEEN 1 AND 200
  AND (message IS NULL OR char_length(message) <= 3000));

DROP POLICY IF EXISTS "Anyone can leave a lead" ON public.advisor_leads;
CREATE POLICY "Anyone can leave a lead" ON public.advisor_leads FOR INSERT TO anon, authenticated
WITH CHECK (status = 'nuevo' AND lead_score IN ('hot','warm','cold')
  AND (name IS NULL OR char_length(name) <= 200)
  AND (phone IS NULL OR char_length(phone) <= 50)
  AND (city IS NULL OR char_length(city) <= 120)
  AND (model_interest IS NULL OR char_length(model_interest) <= 200)
  AND (use_case IS NULL OR char_length(use_case) <= 500)
  AND (purchase_method IS NULL OR char_length(purchase_method) <= 200)
  AND (initial_budget IS NULL OR char_length(initial_budget) <= 100)
  AND (monthly_budget IS NULL OR char_length(monthly_budget) <= 100)
  AND (conversation_summary IS NULL OR char_length(conversation_summary) <= 5000));

DROP POLICY IF EXISTS "Anyone can send a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can send a contact message" ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (status = 'nuevo'
  AND char_length(full_name) BETWEEN 1 AND 200
  AND (phone IS NULL OR char_length(phone) <= 50)
  AND (email IS NULL OR char_length(email) <= 255)
  AND char_length(message) BETWEEN 1 AND 3000);

DROP POLICY IF EXISTS "Anyone can upload credit documents" ON storage.objects;
CREATE POLICY "Anyone can upload credit documents" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'credit-documents'
  AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[^/]{1,200}$');