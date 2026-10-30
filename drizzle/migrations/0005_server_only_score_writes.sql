REVOKE INSERT, UPDATE, DELETE ON public.drill_scores, public.module_completions FROM authenticated, anon;
GRANT SELECT ON public.drill_scores, public.module_completions TO authenticated;
GRANT ALL ON public.drill_scores, public.module_completions, public.training_sessions TO service_role;
DROP POLICY IF EXISTS "Users manage own drill scores" ON public.drill_scores;
CREATE POLICY "Users view own drill scores" ON public.drill_scores FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.module_completions;
DROP POLICY IF EXISTS "Users can update their own completions" ON public.module_completions;
REVOKE INSERT, UPDATE, DELETE ON public.training_sessions FROM authenticated, anon;
GRANT INSERT (user_id, dealership_id, scenario_type, conversation, checklist_state, status) ON public.training_sessions TO authenticated;
GRANT UPDATE (conversation, checklist_state, status) ON public.training_sessions TO authenticated;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.training_sessions;
CREATE POLICY "Users can update their own sessions" ON public.training_sessions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND (dealership_id = public.get_user_dealership_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin')));
CREATE TABLE public.verified_drill_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 dealership_id uuid,
 drill_key text NOT NULL,
 question_ids jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 completed_at timestamptz,
 score integer
);
GRANT ALL ON public.verified_drill_runs TO service_role;
ALTER TABLE public.verified_drill_runs ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.persist_verified_drill_result(_run_id uuid, _user_id uuid, _score integer)
RETURNS public.drill_scores LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _run public.verified_drill_runs; _result public.drill_scores;
BEGIN
 SELECT * INTO _run FROM public.verified_drill_runs WHERE id = _run_id AND user_id = _user_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Run not found'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(_user_id::text || ':' || _run.drill_key, 0));
 IF _run.completed_at IS NOT NULL THEN
  SELECT * INTO _result FROM public.drill_scores WHERE user_id = _user_id AND drill_key = _run.drill_key;
  RETURN _result;
 END IF;
 IF _score < 0 OR _score > jsonb_array_length(_run.question_ids) THEN RAISE EXCEPTION 'Invalid score'; END IF;
 INSERT INTO public.drill_scores (user_id, dealership_id, drill_key, first_streak, last_streak, best_streak, plays)
 VALUES (_user_id, _run.dealership_id, _run.drill_key, _score, _score, _score, 1)
 ON CONFLICT (user_id, drill_key) DO UPDATE SET
 best_streak = greatest(drill_scores.best_streak, EXCLUDED.best_streak),
 last_streak = EXCLUDED.last_streak,
 first_streak = coalesce(drill_scores.first_streak, EXCLUDED.first_streak),
 plays = drill_scores.plays + 1, dealership_id = EXCLUDED.dealership_id
 RETURNING * INTO _result;
 UPDATE public.verified_drill_runs SET completed_at = now(), score = _score WHERE id = _run_id;
 RETURN _result;
END;
$$;
REVOKE ALL ON FUNCTION public.persist_verified_drill_result(uuid, uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.persist_verified_drill_result(uuid, uuid, integer) TO service_role;