
-- Fix training_sessions: change {public} policies to {authenticated}
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.training_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.training_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.training_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.training_sessions;

CREATE POLICY "Users can view their own sessions" ON public.training_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.training_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.training_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.training_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix module_completions: change {public} policies to {authenticated}
DROP POLICY IF EXISTS "Users can view their own completions" ON public.module_completions;
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.module_completions;
DROP POLICY IF EXISTS "Users can update their own completions" ON public.module_completions;

CREATE POLICY "Users can view their own completions" ON public.module_completions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" ON public.module_completions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions" ON public.module_completions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
