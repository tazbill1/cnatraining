
-- Custom modules per dealership (can override default modules or be entirely new)
CREATE TABLE public.dealership_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  base_module_id text, -- null = brand new module, non-null = override of existing module
  title text NOT NULL,
  description text,
  icon text DEFAULT 'BookOpen',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  estimated_time text DEFAULT '15-20 min',
  video_url text, -- intro/prerequisite video URL
  video_title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Content sections within a custom module
CREATE TABLE public.dealership_module_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.dealership_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text NOT NULL DEFAULT 'text', -- 'text', 'video', 'checklist', 'scenario'
  content_html text, -- rich text content
  video_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Quiz questions per custom module
CREATE TABLE public.dealership_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.dealership_modules(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]', -- array of {text, isCorrect}
  explanation text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_dealership_modules_dealership ON public.dealership_modules(dealership_id);
CREATE INDEX idx_dealership_module_sections_module ON public.dealership_module_sections(module_id);
CREATE INDEX idx_dealership_quiz_questions_module ON public.dealership_quiz_questions(module_id);

-- Enable RLS
ALTER TABLE public.dealership_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealership_module_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealership_quiz_questions ENABLE ROW LEVEL SECURITY;

-- RLS: Super admins full access
CREATE POLICY "Super admins manage dealership_modules" ON public.dealership_modules
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins manage dealership_module_sections" ON public.dealership_module_sections
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins manage dealership_quiz_questions" ON public.dealership_quiz_questions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- RLS: Users view their own dealership's modules
CREATE POLICY "Users view own dealership modules" ON public.dealership_modules
  FOR SELECT TO authenticated
  USING (dealership_id = get_user_dealership_id(auth.uid()));

CREATE POLICY "Users view own dealership module sections" ON public.dealership_module_sections
  FOR SELECT TO authenticated
  USING (module_id IN (SELECT id FROM public.dealership_modules WHERE dealership_id = get_user_dealership_id(auth.uid())));

CREATE POLICY "Users view own dealership quiz questions" ON public.dealership_quiz_questions
  FOR SELECT TO authenticated
  USING (module_id IN (SELECT id FROM public.dealership_modules WHERE dealership_id = get_user_dealership_id(auth.uid())));

-- RLS: Managers view own dealership
CREATE POLICY "Managers view dealership modules" ON public.dealership_modules
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'manager') AND dealership_id = get_user_dealership_id(auth.uid()));

CREATE POLICY "Managers view dealership module sections" ON public.dealership_module_sections
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'manager') AND module_id IN (SELECT id FROM public.dealership_modules WHERE dealership_id = get_user_dealership_id(auth.uid())));

CREATE POLICY "Managers view dealership quiz questions" ON public.dealership_quiz_questions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'manager') AND module_id IN (SELECT id FROM public.dealership_modules WHERE dealership_id = get_user_dealership_id(auth.uid())));

-- Deny anonymous access
CREATE POLICY "Deny anon dealership_modules" ON public.dealership_modules FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "Deny anon dealership_module_sections" ON public.dealership_module_sections FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "Deny anon dealership_quiz_questions" ON public.dealership_quiz_questions FOR ALL TO anon USING (false) WITH CHECK (false);

-- Updated_at triggers
CREATE TRIGGER update_dealership_modules_updated_at
  BEFORE UPDATE ON public.dealership_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dealership_module_sections_updated_at
  BEFORE UPDATE ON public.dealership_module_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Make training-videos bucket public for video playback
UPDATE storage.buckets SET public = true WHERE id = 'training-videos';

-- Storage policies for training videos
CREATE POLICY "Super admins upload training videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'training-videos' AND has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins delete training videos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'training-videos' AND has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can view training videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'training-videos');
