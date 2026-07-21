
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.training_sessions;
CREATE POLICY "Users can insert their own sessions" ON public.training_sessions
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (dealership_id IS NOT NULL AND dealership_id = get_user_dealership_id(auth.uid()))
  )
);
