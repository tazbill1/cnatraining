CREATE TABLE public.drill_question_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  dealership_id uuid,
  drill_key text NOT NULL,
  question_id text NOT NULL,
  topic text,
  vehicle text,
  is_correct boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.drill_question_attempts TO authenticated;
GRANT ALL ON public.drill_question_attempts TO service_role;

ALTER TABLE public.drill_question_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own drill attempts"
  ON public.drill_question_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own drill attempts"
  ON public.drill_question_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can view their dealership drill attempts"
  ON public.drill_question_attempts FOR SELECT TO authenticated
  USING (
    (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()))
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE INDEX idx_drill_question_attempts_user_created
  ON public.drill_question_attempts (user_id, created_at DESC);