
-- module_completions: enforce dealership scoping on insert
DROP POLICY "Users can insert their own completions" ON public.module_completions;
CREATE POLICY "Users can insert their own completions" ON public.module_completions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND dealership_id IS NOT NULL
    AND dealership_id = public.get_user_dealership_id(auth.uid())
  );

-- training_sessions: enforce dealership scoping on insert
DROP POLICY "Users can insert their own sessions" ON public.training_sessions;
CREATE POLICY "Users can insert their own sessions" ON public.training_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND dealership_id IS NOT NULL
    AND dealership_id = public.get_user_dealership_id(auth.uid())
  );

-- sales_goals: enforce dealership scoping on insert
DROP POLICY "Users insert own sales_goals" ON public.sales_goals;
CREATE POLICY "Users insert own sales_goals" ON public.sales_goals
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND dealership_id IS NOT NULL
    AND dealership_id = public.get_user_dealership_id(auth.uid())
  );

-- sales_leads: enforce dealership scoping on both insert and update (ALL policy)
DROP POLICY "Users manage own sales_leads" ON public.sales_leads;
CREATE POLICY "Users manage own sales_leads" ON public.sales_leads
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND dealership_id IS NOT NULL
    AND dealership_id = public.get_user_dealership_id(auth.uid())
  );

-- walk_in_logs: enforce dealership scoping on both insert and update (ALL policy)
DROP POLICY "Users manage own walk_in_logs" ON public.walk_in_logs;
CREATE POLICY "Users manage own walk_in_logs" ON public.walk_in_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND dealership_id IS NOT NULL
    AND dealership_id = public.get_user_dealership_id(auth.uid())
  );

-- module_section_progress: enforce module belongs to user's dealership on insert/update
DROP POLICY "Users insert own section progress" ON public.module_section_progress;
CREATE POLICY "Users insert own section progress" ON public.module_section_progress
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.dealership_modules dm
      WHERE dm.id = module_section_progress.module_id
        AND dm.dealership_id = public.get_user_dealership_id(auth.uid())
    )
  );

DROP POLICY "Users update own section progress" ON public.module_section_progress;
CREATE POLICY "Users update own section progress" ON public.module_section_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.dealership_modules dm
      WHERE dm.id = module_section_progress.module_id
        AND dm.dealership_id = public.get_user_dealership_id(auth.uid())
    )
  );

-- module_section_progress: manager + super admin SELECT for parity with rest of schema
CREATE POLICY "Managers view dealership section progress" ON public.module_section_progress
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'manager'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = module_section_progress.user_id
        AND p.dealership_id = public.get_user_dealership_id(auth.uid())
    )
  );

CREATE POLICY "Super admins view all section progress" ON public.module_section_progress
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- module_section_progress: explicit deny anon
CREATE POLICY "Deny anonymous access to section progress" ON public.module_section_progress
  AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- bug_reports: require user_id NOT NULL on insert
DROP POLICY "Users can create their own bug reports" ON public.bug_reports;
CREATE POLICY "Users can create their own bug reports" ON public.bug_reports
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);
