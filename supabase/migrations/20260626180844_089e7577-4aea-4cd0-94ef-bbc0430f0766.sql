DROP POLICY IF EXISTS "Users insert own section progress" ON public.module_section_progress;
DROP POLICY IF EXISTS "Users update own section progress" ON public.module_section_progress;

CREATE POLICY "Users insert own section progress" ON public.module_section_progress
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM dealership_modules dm
      WHERE dm.id = module_section_progress.module_id
        AND dm.dealership_id = get_user_dealership_id(auth.uid())
    )
  )
);

CREATE POLICY "Users update own section progress" ON public.module_section_progress
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM dealership_modules dm
      WHERE dm.id = module_section_progress.module_id
        AND dm.dealership_id = get_user_dealership_id(auth.uid())
    )
  )
);