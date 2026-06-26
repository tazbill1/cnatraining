
-- Add WITH CHECK to super admin user_roles UPDATE
DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
CREATE POLICY "Super admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Allow owners to delete their own bug screenshots
CREATE POLICY "Users can delete their own bug screenshots"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'bug-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Belt-and-suspenders: tighten profiles UPDATE WITH CHECK so dealership_id cannot be changed
-- by non-super-admins even if the trigger were ever dropped.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      dealership_id IS NOT DISTINCT FROM (SELECT dealership_id FROM public.profiles WHERE user_id = auth.uid())
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );
