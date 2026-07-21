DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.training_sessions;
CREATE POLICY "Users can insert their own sessions"
ON public.training_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    dealership_id IS NULL
    OR dealership_id = public.get_user_dealership_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);