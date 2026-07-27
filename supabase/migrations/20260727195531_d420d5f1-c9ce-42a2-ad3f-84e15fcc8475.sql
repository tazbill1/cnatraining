CREATE TABLE public.product_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  game_type text NOT NULL DEFAULT 'quiz',
  make text,
  model text NOT NULL,
  model_year integer,
  trim text,
  topic text,
  difficulty text NOT NULL DEFAULT 'beginner',
  prompt text NOT NULL,
  prompt_label text,
  scenario text,
  choices jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_questions TO authenticated;
GRANT ALL ON public.product_questions TO service_role;

ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their dealership product questions"
ON public.product_questions FOR SELECT TO authenticated
USING (
  dealership_id = public.get_user_dealership_id(auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Managers can insert product questions"
ON public.product_questions FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()))
);

CREATE POLICY "Managers can update product questions"
ON public.product_questions FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()))
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()))
);

CREATE POLICY "Managers can delete product questions"
ON public.product_questions FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR (public.has_role(auth.uid(), 'manager') AND dealership_id = public.get_user_dealership_id(auth.uid()))
);

CREATE TRIGGER update_product_questions_updated_at
BEFORE UPDATE ON public.product_questions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_product_questions_dealership_game ON public.product_questions (dealership_id, game_type, is_active);