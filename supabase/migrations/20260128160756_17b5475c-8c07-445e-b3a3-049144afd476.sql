-- Remove the dangerous policy that allows users to insert their own roles
-- Role assignment should only happen via the trigger on user signup
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;