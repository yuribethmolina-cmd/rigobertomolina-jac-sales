CREATE OR REPLACE FUNCTION public.publish_catalog_version(_version_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v public.catalog_versions%ROWTYPE;
  n integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT * INTO v FROM public.catalog_versions WHERE id = _version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'version not found';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.catalog_entries e
    WHERE e.version_id = _version_id AND e.change_type = 'NEEDS_REVIEW'
  ) THEN
    RAISE EXCEPTION 'hay registros que requieren revision';
  END IF;

  UPDATE public.catalog_versions
     SET status = 'ARCHIVED'
   WHERE plan_id = v.plan_id AND status = 'ACTIVE' AND id <> _version_id;

  SELECT count(*) INTO n FROM public.catalog_entries WHERE version_id = _version_id;

  UPDATE public.catalog_versions
     SET status = 'ACTIVE', published_at = now(), entries_count = n
   WHERE id = _version_id;

  INSERT INTO public.catalog_audit (version_id, plan_id, action, user_id, user_email, details)
  VALUES (_version_id, v.plan_id, 'PUBLISH', auth.uid(),
          (SELECT email FROM auth.users WHERE id = auth.uid()),
          jsonb_build_object('catalog_date', v.catalog_date, 'entries', n));
END;
$$;

CREATE OR REPLACE FUNCTION public.rollback_catalog_version(_version_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v public.catalog_versions%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT * INTO v FROM public.catalog_versions WHERE id = _version_id;
  IF NOT FOUND OR v.status <> 'ARCHIVED' THEN
    RAISE EXCEPTION 'solo se puede restaurar una version archivada';
  END IF;

  UPDATE public.catalog_versions
     SET status = 'ARCHIVED'
   WHERE plan_id = v.plan_id AND status = 'ACTIVE';

  UPDATE public.catalog_versions
     SET status = 'ACTIVE', published_at = now()
   WHERE id = _version_id;

  INSERT INTO public.catalog_audit (version_id, plan_id, action, user_id, user_email, details)
  VALUES (_version_id, v.plan_id, 'ROLLBACK', auth.uid(),
          (SELECT email FROM auth.users WHERE id = auth.uid()),
          jsonb_build_object('catalog_date', v.catalog_date));
END;
$$;

REVOKE ALL ON FUNCTION public.publish_catalog_version(uuid) FROM public;
REVOKE ALL ON FUNCTION public.rollback_catalog_version(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.publish_catalog_version(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_catalog_version(uuid) TO authenticated;