
-- 1) Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_dealership_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_dealership_id(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_profile_dealership_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 2) Remove broad listing policies on public buckets (direct public URLs still work)
DROP POLICY IF EXISTS "Anyone can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view training videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view training videos" ON storage.objects;

-- 3) Restrict training-video manager upload/delete to their own dealership prefix
DROP POLICY IF EXISTS "Managers can upload training videos" ON storage.objects;
DROP POLICY IF EXISTS "Managers can delete training videos" ON storage.objects;

CREATE POLICY "Managers can upload their dealership training videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'training-videos'
    AND public.has_role(auth.uid(), 'manager')
    AND (storage.foldername(name))[1] = public.get_user_dealership_id(auth.uid())::text
  );

CREATE POLICY "Managers can delete their dealership training videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'training-videos'
    AND public.has_role(auth.uid(), 'manager')
    AND (storage.foldername(name))[1] = public.get_user_dealership_id(auth.uid())::text
  );

-- 4) Strengthen invitations manager INSERT: enforce invited_by = auth.uid()
DROP POLICY IF EXISTS "Managers can insert dealership invitations" ON public.invitations;

CREATE POLICY "Managers can insert dealership invitations"
  ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'manager')
    AND dealership_id = public.get_user_dealership_id(auth.uid())
    AND invited_by = auth.uid()
  );

-- 5) Add explicit profiles INSERT policy
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
