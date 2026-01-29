-- Add restrictive policies to block UPDATE and DELETE on user_roles table
-- This prevents privilege escalation by ensuring only system/trigger can modify roles

-- Block all UPDATE operations on user_roles (roles can only be assigned via handle_new_user trigger)
CREATE POLICY "Prevent user role updates"
  ON public.user_roles FOR UPDATE
  USING (false);

-- Block all DELETE operations on user_roles (roles should never be removed by users)
CREATE POLICY "Prevent user role deletions"
  ON public.user_roles FOR DELETE
  USING (false);