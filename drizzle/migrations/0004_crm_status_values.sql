ALTER TABLE public.quote_requests DROP CONSTRAINT quote_requests_status_valid;
ALTER TABLE public.quote_requests ADD CONSTRAINT quote_requests_status_valid CHECK (status IN ('nuevo','contactado','vendido','descartado','cerrado'));
ALTER TABLE public.contact_messages DROP CONSTRAINT contact_messages_status_valid;
ALTER TABLE public.contact_messages ADD CONSTRAINT contact_messages_status_valid CHECK (status IN ('nuevo','contactado','vendido','descartado','cerrado'));