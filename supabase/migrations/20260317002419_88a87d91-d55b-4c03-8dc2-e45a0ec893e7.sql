
-- Allow super admins to insert roles
CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super admins to update roles
DROP POLICY IF EXISTS "Prevent user role updates" ON public.user_roles;
CREATE POLICY "Super admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super admins to delete roles  
DROP POLICY IF EXISTS "Prevent user role deletions" ON public.user_roles;
CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super admins to view all roles (needed to see team member roles)
CREATE POLICY "Super admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Allow managers to view roles in their dealership (for team page)
CREATE POLICY "Managers can view dealership roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager'::app_role)
  AND user_id IN (
    SELECT p.user_id FROM public.profiles p
    WHERE p.dealership_id = public.get_user_dealership_id(auth.uid())
  )
);
