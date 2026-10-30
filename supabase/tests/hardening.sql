-- Regression checks run in a transaction and leave no test data behind.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE u uuid := gen_random_uuid(); d uuid := gen_random_uuid(); result jsonb; admin_id uuid; before_count integer; c_id text := 'test-' || gen_random_uuid()::text;
BEGIN
 FOR i IN 1..30 LOOP
  result := public.consume_ai_request(u, CASE WHEN i % 2 = 0 THEN 'chat' ELSE 'speak' END);
  IF result->>'allowed' <> 'true' THEN RAISE EXCEPTION 'Request % of 30 blocked',i; END IF;
 END LOOP;
 result := public.consume_ai_request(u,'transcribe');
 IF result->>'allowed' <> 'false' OR result->>'period' <> 'minute' THEN RAISE EXCEPTION '31st cross-function request not blocked'; END IF;
 INSERT INTO public.ai_usage(user_id,function_name,created_at) SELECT d,'chat',now()-interval '2 hours' FROM generate_series(1,1000);
 result := public.consume_ai_request(d,'evaluate-session');
 IF result->>'allowed' <> 'false' OR result->>'period' <> 'day' THEN RAISE EXCEPTION '1000/day cap not enforced'; END IF;
 SELECT user_id INTO admin_id FROM public.user_roles WHERE role='super_admin' LIMIT 1;
 IF admin_id IS NULL THEN RAISE EXCEPTION 'No admin available to verify exemption'; END IF;
 SELECT count(*) INTO before_count FROM public.ai_usage WHERE user_id=admin_id;
 FOR i IN 1..31 LOOP
  result := public.consume_ai_request(admin_id,'training-chat');
  IF result->>'allowed' <> 'true' THEN RAISE EXCEPTION 'Admin not exempt'; END IF;
 END LOOP;
 IF (SELECT count(*) FROM public.ai_usage WHERE user_id=admin_id) <> before_count THEN RAISE EXCEPTION 'Admin requests consumed usage'; END IF;
 INSERT INTO public.module_completions(user_id,module_id,quiz_score) VALUES(u,c_id,79);
 IF EXISTS(SELECT 1 FROM public.course_certificates WHERE user_id=u AND module_id=c_id) THEN RAISE EXCEPTION 'Failing course issued a certificate'; END IF;
 UPDATE public.module_completions SET quiz_score=88 WHERE user_id=u AND module_id=c_id;
 IF NOT EXISTS(SELECT 1 FROM public.course_certificates WHERE user_id=u AND module_id=c_id AND quiz_score=88) THEN RAISE EXCEPTION 'Passing course not issued'; END IF;
 UPDATE public.module_completions SET quiz_score=100 WHERE user_id=u AND module_id=c_id;
 IF (SELECT count(*) FROM public.course_certificates WHERE user_id=u AND module_id=c_id) <> 1 THEN RAISE EXCEPTION 'Duplicate certificate issued'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.course_certificates WHERE user_id=u AND module_id=c_id AND quiz_score=88) THEN RAISE EXCEPTION 'Existing certificate changed'; END IF;
 IF has_table_privilege('authenticated','public.ai_usage','INSERT') OR has_function_privilege('authenticated','public.consume_ai_request(uuid,text)','EXECUTE') THEN RAISE EXCEPTION 'Users can tamper with limiter'; END IF;
 IF has_table_privilege('authenticated','public.course_certificates','INSERT') THEN RAISE EXCEPTION 'Users can forge certificates'; END IF;
END $$;
ROLLBACK;