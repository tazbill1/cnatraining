
CREATE TABLE public.drill_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dealership_id uuid REFERENCES public.dealerships(id) ON DELETE SET NULL,
  drill_key text NOT NULL,
  best_streak integer NOT NULL DEFAULT 0,
  last_streak integer NOT NULL DEFAULT 0,
  plays integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, drill_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.drill_scores TO authenticated;
GRANT ALL ON public.drill_scores TO service_role;

ALTER TABLE public.drill_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own drill scores"
  ON public.drill_scores FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers view dealership drill scores"
  ON public.drill_scores FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager'::app_role)
    AND dealership_id = public.get_user_dealership_id(auth.uid())
  );

CREATE POLICY "Super admins view all drill scores"
  ON public.drill_scores FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_drill_scores_updated_at
  BEFORE UPDATE ON public.drill_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_drill_scores_dealership_drill ON public.drill_scores (dealership_id, drill_key, best_streak DESC);
