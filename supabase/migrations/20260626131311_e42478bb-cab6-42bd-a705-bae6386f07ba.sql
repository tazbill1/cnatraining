
CREATE TABLE public.module_section_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.dealership_modules(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id, section_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_section_progress TO authenticated;
GRANT ALL ON public.module_section_progress TO service_role;

ALTER TABLE public.module_section_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own section progress"
ON public.module_section_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own section progress"
ON public.module_section_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own section progress"
ON public.module_section_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_module_section_progress_updated_at
BEFORE UPDATE ON public.module_section_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_module_section_progress_user_module
ON public.module_section_progress (user_id, module_id);
