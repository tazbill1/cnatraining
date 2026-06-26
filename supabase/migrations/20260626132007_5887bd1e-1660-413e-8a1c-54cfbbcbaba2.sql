
DROP POLICY "Managers can update dealership invitations" ON public.invitations;
CREATE POLICY "Managers can update dealership invitations" ON public.invitations
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'manager'::app_role)
    AND dealership_id = public.get_user_dealership_id(auth.uid())
  )
  WITH CHECK (
    has_role(auth.uid(), 'manager'::app_role)
    AND dealership_id = public.get_user_dealership_id(auth.uid())
  );
