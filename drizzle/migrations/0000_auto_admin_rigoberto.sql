CREATE OR REPLACE FUNCTION public.grant_admin_to_owner_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'rigobertomolina6@hotmail.com' AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT NEW.id, 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id AND role = 'admin');
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_owner_admin ON auth.users;
CREATE TRIGGER on_auth_user_owner_admin
AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_to_owner_email();

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin' FROM auth.users u
WHERE lower(u.email) = 'rigobertomolina6@hotmail.com' AND u.email_confirmed_at IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin');