
CREATE TABLE public.module_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  module_id text NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  quiz_score integer,
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
  ON public.module_completions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON public.module_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
  ON public.module_completions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all completions"
  ON public.module_completions
  FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role));
