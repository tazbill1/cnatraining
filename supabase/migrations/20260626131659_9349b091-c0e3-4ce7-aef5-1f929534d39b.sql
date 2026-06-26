
-- Fix: profiles_dealership_id_writable - prevent users from setting dealership_id on insert
DROP POLICY "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND dealership_id IS NULL);

-- Fix: profiles_dealership_id_updatable - attach existing protect trigger so users can't change dealership_id on update
DROP TRIGGER IF EXISTS protect_profile_dealership_id_trigger ON public.profiles;
CREATE TRIGGER protect_profile_dealership_id_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_dealership_id();

-- Fix: bug_reports_no_anon_deny - add explicit deny for anon
CREATE POLICY "Deny anonymous access to bug_reports" ON public.bug_reports
  AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);
