REVOKE EXECUTE ON FUNCTION public.publish_catalog_version(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.rollback_catalog_version(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.publish_catalog_version(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rollback_catalog_version(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_catalog_version(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_catalog_version(uuid) TO authenticated;