ALTER TABLE public.drill_scores ADD COLUMN IF NOT EXISTS first_streak integer;
UPDATE public.drill_scores SET first_streak = last_streak WHERE first_streak IS NULL;