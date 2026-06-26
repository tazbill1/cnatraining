DROP POLICY "Users can insert their own completions" ON public.module_completions;
CREATE POLICY "Users can insert their own completions" ON public.module_completions FOR INSERT WITH CHECK (auth.uid() = user_id AND (has_role(auth.uid(), 'super_admin') OR (dealership_id IS NOT NULL AND dealership_id = get_user_dealership_id(auth.uid()))));

DROP POLICY "Users can update their own completions" ON public.module_completions;
CREATE POLICY "Users can update their own completions" ON public.module_completions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND (has_role(auth.uid(), 'super_admin') OR (dealership_id IS NOT NULL AND dealership_id = get_user_dealership_id(auth.uid()))));