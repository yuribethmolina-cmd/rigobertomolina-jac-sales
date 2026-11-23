CREATE OR REPLACE FUNCTION public.grant_admin_to_owner_email()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF lower(NEW.email) IN ('rigobertomolina6@hotmail.com','rigobertomolina6@gmail.com','ramirezgarcianelly@gmail.com') AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT NEW.id, 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id AND role = 'admin');
  END IF;
  RETURN NEW;
END; $function$;