CREATE TABLE public.ai_usage (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id uuid NOT NULL, function_name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.ai_usage TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.ai_usage_id_seq TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE INDEX ai_usage_user_created_idx ON public.ai_usage(user_id, created_at);
CREATE OR REPLACE FUNCTION public.consume_ai_request(_user_id uuid, _function_name text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE minute_count integer; day_count integer; oldest timestamptz; current_time timestamptz := clock_timestamp();
BEGIN
 IF _function_name NOT IN ('training-chat','chat','speak','transcribe','evaluate-session') THEN RAISE EXCEPTION 'Unknown AI function'; END IF;
 IF public.has_role(_user_id, 'super_admin') THEN RETURN jsonb_build_object('allowed',true); END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('ai-rate:' || _user_id::text,0));
 SELECT count(*) FILTER (WHERE created_at > current_time - interval '1 minute'), count(*) INTO minute_count,day_count FROM public.ai_usage WHERE user_id=_user_id AND created_at > current_time - interval '24 hours';
 IF day_count >= 1000 THEN
  SELECT min(created_at) INTO oldest FROM public.ai_usage WHERE user_id=_user_id AND created_at > current_time - interval '24 hours';
  RETURN jsonb_build_object('allowed',false,'period','day','retry_after',greatest(1,ceil(extract(epoch FROM oldest + interval '24 hours' - current_time))));
 END IF;
 IF minute_count >= 30 THEN
  SELECT min(created_at) INTO oldest FROM public.ai_usage WHERE user_id=_user_id AND created_at > current_time - interval '1 minute';
  RETURN jsonb_build_object('allowed',false,'period','minute','retry_after',greatest(1,ceil(extract(epoch FROM oldest + interval '1 minute' - current_time))));
 END IF;
 INSERT INTO public.ai_usage(user_id,function_name,created_at) VALUES (_user_id,_function_name,current_time);
 RETURN jsonb_build_object('allowed',true);
END; $$;
REVOKE ALL ON FUNCTION public.consume_ai_request(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_request(uuid,text) TO service_role;
CREATE TABLE public.course_certificates (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, module_id text NOT NULL, dealership_id uuid, quiz_score integer NOT NULL CHECK (quiz_score BETWEEN 80 AND 100), issued_at timestamptz NOT NULL, UNIQUE(user_id,module_id));
GRANT SELECT ON public.course_certificates TO authenticated;
GRANT ALL ON public.course_certificates TO service_role;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own certificates" ON public.course_certificates FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE OR REPLACE FUNCTION public.issue_course_certificate() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.quiz_score BETWEEN 80 AND 100 THEN
  INSERT INTO public.course_certificates(user_id,module_id,dealership_id,quiz_score,issued_at) VALUES(NEW.user_id,NEW.module_id,NEW.dealership_id,NEW.quiz_score,NEW.completed_at) ON CONFLICT(user_id,module_id) DO NOTHING;
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.issue_course_certificate() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER issue_passing_course_certificate AFTER INSERT OR UPDATE ON public.module_completions FOR EACH ROW EXECUTE FUNCTION public.issue_course_certificate();
INSERT INTO public.course_certificates(user_id,module_id,dealership_id,quiz_score,issued_at) SELECT user_id,module_id,dealership_id,quiz_score,completed_at FROM public.module_completions WHERE quiz_score BETWEEN 80 AND 100 ON CONFLICT(user_id,module_id) DO NOTHING;