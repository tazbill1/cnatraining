CREATE OR REPLACE FUNCTION public.public_learning_catalog()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'enabled_module_ids', (SELECT to_jsonb(s.enabled_module_ids) FROM public.dealership_settings s WHERE s.dealership_id = d.id LIMIT 1),
    'modules', (SELECT coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'base_module_id', m.base_module_id)), '[]'::jsonb)
                FROM public.dealership_modules m WHERE m.dealership_id = d.id AND m.is_active)
  )), '[]'::jsonb)
  FROM public.dealerships d WHERE d.is_active;
$$;
REVOKE ALL ON FUNCTION public.public_learning_catalog() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_learning_catalog() TO anon, authenticated;

DROP POLICY IF EXISTS "Dealership members read their training videos" ON storage.objects;
CREATE POLICY "Dealership members read their training videos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'training-videos' AND (
  public.has_role(auth.uid(), 'super_admin')
  OR (public.get_user_dealership_id(auth.uid()) IS NOT NULL AND (
       (storage.foldername(name))[1] = public.get_user_dealership_id(auth.uid())::text
       OR (storage.foldername(name))[1] = 'global'))
));