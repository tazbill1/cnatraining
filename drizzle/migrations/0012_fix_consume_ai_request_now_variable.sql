CREATE OR REPLACE FUNCTION public.consume_ai_request(_user_id uuid, _function_name text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE minute_count integer; day_count integer; oldest timestamptz; _now timestamptz := clock_timestamp();
BEGIN
 IF _function_name NOT IN ('training-chat','chat','speak','transcribe','evaluate-session') THEN RAISE EXCEPTION 'Unknown AI function'; END IF;
 IF public.has_role(_user_id, 'super_admin') THEN RETURN jsonb_build_object('allowed',true); END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('ai-rate:' || _user_id::text,0));
 SELECT count(*) FILTER (WHERE created_at > _now - interval '1 minute'), count(*) INTO minute_count,day_count FROM public.ai_usage WHERE user_id=_user_id AND created_at > _now - interval '24 hours';
 IF day_count >= 1000 THEN
  SELECT min(created_at) INTO oldest FROM public.ai_usage WHERE user_id=_user_id AND created_at > _now - interval '24 hours';
  RETURN jsonb_build_object('allowed',false,'period','day','retry_after',greatest(1,ceil(extract(epoch FROM oldest + interval '24 hours' - _now))));
 END IF;
 IF minute_count >= 30 THEN
  SELECT min(created_at) INTO oldest FROM public.ai_usage WHERE user_id=_user_id AND created_at > _now - interval '1 minute';
  RETURN jsonb_build_object('allowed',false,'period','minute','retry_after',greatest(1,ceil(extract(epoch FROM oldest + interval '1 minute' - _now))));
 END IF;
 INSERT INTO public.ai_usage(user_id,function_name,created_at) VALUES (_user_id,_function_name,_now);
 RETURN jsonb_build_object('allowed',true);
END; $function$;