
-- Defense-in-depth: explicitly deny anonymous access to all sensitive tables
CREATE POLICY "Deny anonymous access to profiles"
  ON public.profiles FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "Deny anonymous access to training_sessions"
  ON public.training_sessions FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "Deny anonymous access to user_roles"
  ON public.user_roles FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "Deny anonymous access to invitations"
  ON public.invitations FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "Deny anonymous access to module_completions"
  ON public.module_completions FOR ALL TO anon USING (false) WITH CHECK (false);
